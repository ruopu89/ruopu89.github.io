---
title: drbd基本配置使用
date: 2019-03-29 10:57:21
tags: drbd
categories: Cluster
---

### 概念

> DRBD即Distributed Relicated Block Device：分布式磁盘块设备， 可以解决磁盘单点故障。一般情况下只支持两个节点。 
>
> 一般情况下文件写入磁盘的步骤是：写操作 --> 文件系统 --> 内存缓存中 --> 磁盘调度器 --> 磁盘驱动器 --> 写入磁盘。而DRBD的工作机制如上图所示，数据经过buffer cache后有内核中的DRBD模块通过tcp/ip协议栈经过网卡和对方建立数据同步。 

![](/images/drbd/工作流程.png)

#### 工作模式

> 1. 主从模型
>
>    master/slave模型，在某一时刻只允许有一个主节点。主节点的作用是可以挂载使用，写入数据等；从节点只作为主节点的镜像，是主节点的备份。 
>
> 2. 主主模型
>
>    dula primary模型，2个节点都可以当做主节点来挂载使用。需要配合集群文件系统使用，通过分布式文件锁管理器避免同时写一个文件造成文件系统损坏的问题。



#### 复制模型

> 1. A协议：异步复制（asynchronous），写操作到本机网卡时即认为成功，性能好，数据可靠性差。 
> 2. B协议：半同步复制（semi sync），写操作到达备节点网卡即认为成功，数据可靠性介于A和C之间。 
> 3. C协议：同步复制（ sync），备用节点写入磁盘即认为成功，性能差，数据可靠性高。也是drbd默认使用的复制协议 



### 实例

#### 安装

```shell
===========================================================================================
环境：
主机两台，操作系统CentOS6.6，内核2.6.32-504.el6.x86_64。地址：192.168.2.132、192.168.2.133
安装与配置在两个节点上是一样的
===========================================================================================
# 两台主机均按如下方法操作
[root@primary drbd]# rpm -ivh drbd84-utils-8.9.2-1.el6.elrepo.x86_64.rpm kmod-drbd84-8.4.6-1.el6.elrepo.x86_64.rpm
# 安装包取自生产环境。drbd84-utils-8.9.1-1.el6.elrepo包提供配置文件与工具，komd-drbd84-8.4.6-504.el6.x86_64.rpm包提供内核模块。注意两个包要一起安装，不然可能不会添加设备
[root@template ~]# ls /dev/d
disk/   dm-1    drbd1   drbd11  drbd13  drbd15  drbd3   drbd5   drbd7   drbd9   dvdrw   
dm-0    drbd0   drbd10  drbd12  drbd14  drbd2   drbd4   drbd6   drbd8   dvd
# 安装软件后可以看到添加了很多以drbd开头的设备
[root@primary ~]# fdisk /dev/sdb
# 在两个分区上提供大小一致的分区
[root@primary ~]# ntpdate ntp1.aliyun.com
# 同步时间
[root@primary ~]# partprobe /dev/sdb
[root@primary drbd]# vim /etc/sysconfig/network
NETWORKING=yes
HOSTNAME=primary
[root@primary drbd]# hostname primary
# 修改主机名
[root@primary drbd]# ssh-keygen -t rsa -P ''
[root@primary drbd]# ssh-copy-id -i ~/.ssh/id_rsa.pub 192.168.2.133
# 密钥通信
[root@primary drbd]# vim /etc/hosts
192.168.2.132 primary
192.168.2.133 secondary
[root@primary drbd]# scp drbd84-utils-8.9.2-1.el6.elrepo.x86_64.rpm kmod-drbd84-8.4.6-1.el6.elrepo.x86_64.rpm secondary:/root
```



#### 配置

```shell
[root@primary ~]# cd /etc/drbd.d
[root@primary drbd.d]# vim global_common.conf
# 此配置文件提供全局配置，及多个drbd设备相同的配置 
global {
	usage-count no;
	# 是否加入改进计划 
}
common {
	handlers {
	}
	startup {
	}
	options {
	}
	disk {
		on-io-error detach;
		# IO出问题时，就将节点卸载 
	}
	net {
		cram-hmac-alg "sha1";
		# 使用的算法 
		shared-secret "mydrbdshared123";
		# 共享密钥，建议用随机数生成 
	}
	syncer {
		rate 500M;
		# 同步速率
	}
}
# glocal：全局属性，定义drbd自己的工作特性。common：通用属性，定义多组drbd设备通用特性 

[root@primary drbd.d]# vim mystore.res
# 此文件为自建文件
resource mystore {
# 首先定义公共配置，这一段可以被下面的多段使用 
    device /dev/drdb0;
    # 定义设备
    disk /dev/sdb1;
    # 定义磁盘，定义这两项就让磁盘与设备关联了？
    meta-disk internal;
     # 在自己的dev内部构建使用
# 下面定义单个节点的属性 
    on primary {
        address 192.168.2.132:7789;
    }
    on secondary {
        address 192.168.2.132:7789;
    }
}
[root@primary drbd.d]# drbdadm create-md mystore
initializing activity log
NOT initializing bitmap
Writing meta data...
New drbd meta data block successfully created.
# 初始化资源，mystore是资源名，是在mystore.res文件中定义的。在两个节点上分别执行 
[root@primary drbd.d]# drbdadm create-md mystore
initializing activity log
NOT initializing bitmap
Writing meta data...
New drbd meta data block successfully created.
[root@primary drbd.d]# service drbd start
Starting DRBD resources: [
     create res: mystore
   prepare disk: mystore
    adjust disk: mystore
     adjust net: mystore
]
....
# 启动一个节点后，它会等待另一个节点也启动此服务，这时两个节点才会一起启动服务
[root@primary drbd.d]# cat /proc/drbd
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
 0: cs:Connected ro:Secondary/Secondary ds:Inconsistent/Inconsistent C r-----
    ns:0 nr:0 dw:0 dr:0 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:3140544
# 查看运行状态，现在两个都是Secondary，没有同步 
[root@primary drbd.d]# drbd-overview 
 0:mystore/0  Connected Secondary/Secondary Inconsistent/Inconsistent 
 # 使用此命令也可以
 [root@primary drbd.d]# drbdadm primary --force mystore
 # 设置节点1为主节点
 [root@primary drbd.d]# cat /proc/drbd 
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
 0: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r-----
    ns:1067676 nr:0 dw:0 dr:1069720 al:0 bm:0 lo:0 pe:2 ua:2 ap:0 ep:1 wo:f oos:2074560
	[=====>..............] sync'ed: 34.1% (2074560/3140544)K
	finish: 0:00:52 speed: 39,708 (39,480) K/sec
	# 显示同步过程，有两种状态，primary和secondary，主和从，左边为自己的状态右边是对方的状态 
[root@primary drbd.d]# cat /proc/drbd 
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
 0: cs:Connected ro:Primary/Secondary ds:UpToDate/UpToDate C r-----
    ns:3140544 nr:0 dw:0 dr:3141208 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0
# 同步完成，这是状态为Primary/Secondary 
[root@primary drbd.d]# mke2fs -t ext4 /dev/drbd0
mke2fs 1.41.12 (17-May-2010)
文件系统标签=
操作系统:Linux
块大小=4096 (log=2)
分块大小=4096 (log=2)
Stride=0 blocks, Stripe width=0 blocks
196608 inodes, 785136 blocks
39256 blocks (5.00%) reserved for the super user
第一个数据块=0
Maximum filesystem blocks=805306368
24 block groups
32768 blocks per group, 32768 fragments per group
8192 inodes per group
Superblock backups stored on blocks: 
	32768, 98304, 163840, 229376, 294912

正在写入inode表: 完成                            
Creating journal (16384 blocks): 完成
Writing superblocks and filesystem accounting information: 完成

This filesystem will be automatically checked every 26 mounts or
180 days, whichever comes first.  Use tune2fs -c or -i to override.
# 在主节点格式化磁盘，从节点也会自动格式化，因为是按位同步的 
```



#### 测试

```shell
=========
    node1   
=========
[root@primary drbd.d]# mount /dev/drbd0 /mnt
[root@primary drbd.d]# ls /mnt
lost+found
[root@primary drbd.d]# cd /mnt
[root@primary mnt]# cp /etc/issue ./
[root@primary mnt]# ls
issue  lost+found
[root@primary mnt]# cd
[root@primary ~]# umount /mnt
[root@primary ~]# drbdadm secondary mystore
# 把自己切换为从节点
[root@primary ~]# cat /proc/drbd
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
 0: cs:Connected ro:Secondary/Secondary ds:UpToDate/UpToDate C r-----
    ns:3256316 nr:0 dw:115772 dr:3141925 al:31 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0
# 状态都是从节点

=========
    node2    
=========
[root@secondary drbd.d]# drbdadm primary mystore
# 在哪个节点执行此命令就是切换哪个节点的状态，这里将备用节点切换为主节点
[root@secondary drbd.d]# cat /proc/drbd
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
 0: cs:Connected ro:Primary/Secondary ds:UpToDate/UpToDate C r-----
    ns:0 nr:3256316 dw:3256316 dr:664 al:0 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0
[root@secondary drbd.d]# mount /dev/drbd0 /mnt
[root@secondary drbd.d]# ls /mnt
issue  lost+found
[root@secondary drbd.d]# vim /mnt/issue
abcabc
# 加入一些内容
[root@secondary drbd.d]# umount /mnt
[root@secondary drbd.d]# drbdadm secondary mystore
# 一定要切换状态，备用状态是不能被挂载

=========
    node1   
=========
[root@primary ~]# mount /dev/drbd0 /mnt
mount: you must specify the filesystem type
# 备用状态是不能被挂载的
[root@primary ~]# drbdadm primary mystore
[root@primary ~]# mount /dev/drbd0 /mnt
[root@primary ~]# cat /mnt/issue 
CentOS release 6.6 (Final)
Kernel \r on an \m

abcabc
# 内容也被改变了
[root@primary ~]# service drbd status
drbd driver loaded OK; device status:
version: 8.4.6 (api:1/proto:86-101)
GIT-hash: 833d830e0152d1e457fa7856e71e11248ccf3f70 build by phil@Build64R6, 2015-04-09 14:35:00
m:res      cs         ro                 ds                 p  mounted  fstype
0:mystore  Connected  Primary/Secondary  UpToDate/UpToDate  C  /mnt     ext4
# 查看状态，UpToDate/UpToDate 表示已经同步
```

