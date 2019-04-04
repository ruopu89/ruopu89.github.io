---
title: corosync&pacemaker集群部署
date: 2019-03-29 14:16:07
tags: corosync
categories: Cluster
---

### 概念

#### OpenAIS

> OpenAIS是基于SA Forum 标准的集群框架的应用程序接口规范。OpenAIS提供一种集群模式，这个模式包括集群框架，集群成员管理，通信方式，集群监测等，能够为集群软件或工具提供满足 AIS标准的集群接口，但是它没有集群资源管理功能，不能独立形成一个集群。OpenAIS组件包括AMF，CLM，CKPT，EVT，LCK，MSG，TMR，CPG，EVS等，因OpenAIS分支不同，组件略有不同。OpenAIS主要包含三个分支：Picacho，Whitetank，Wilson。Wilson是最新的，比较稳定的版本是从openais 1.0.0到openais1.1.4。Whitetank现在是主流分支版本，比较稳定的版本是openais0.80到openais0.86。Picacho第一代的OpenAIS的分支，比较稳定的版本是openais0.70和openais0.71。现在比较常用的是Whitetank和Wilson，两者之间有很多不同。OpenAIS从Whitetank升级到Wilson版本后，组件变化很大，Wilson把Openais核心架构组件独立出来放在Corosync（Corosync是一个集群管理引擎）里面。Whitetank包含的组件有AMF，CLM，CKPT，EVT，LCK ，MSG，CPG，CFG，EVS，aisparser，VSF_ykd，bojdb等。而Wilson只含有AMF，CLM，CKPT，LCK, MSG，EVT，TMR（TMR，Whitetank里面没有），这些都是AIS组件。其他核心组件被放到了Corosync内。Wilson被当做Corosync的一个插件。



#### corosync

> Corosync是OpenAIS发展到Wilson版本后衍生出来的开放性集群引擎工程。可以说Corosync是OpenAIS工程的一部分。OpenAIS从openais0.90开始独立成两部分，一个是Corosync；另一个是AIS标准接口Wilson。Corosync包含OpenAIS的核心框架用来对Wilson的标准接口的使用、管理。它为商用的或开源性的集群提供集群执行框架。Corosync执行高可用应用程序的通信组系统，它有以下特征： 
>
> - 一个封闭的程序组（A closed process group communication model）通信模式，这个模式提供一种虚拟的同步方式来保证能够复制服务器的状态。 
> - 一个简单可用性管理组件（A simple availability manager），这个管理组件可以重新启动应用程序的进程当它失败后。 
> - 一个配置和内存数据的统计（A configuration and statistics [in-memory database](http://en.wikipedia.org/wiki/in-memory_database)），内存数据能够被设置，回复，接受通知的更改信息。 
> - 一个定额的系统（A quorum  system），定额完成或者丢失时通知应用程序。 



#### cman

> CMAN是红帽RHCS套件的核心部分，CCS是CMAN集群配置系统，配置cluster.conf，而cluster.conf其实就是openais的配置文件，通过CCS映射到openais。 



#### 总结

> AIS就是一个通用的应用程序编程接口，OpenAIS是AIS的子项目，标准的集群框架的应用程序接口规范，而corosync是OpenAIS是具体实现。



### 实例

#### 基本实现

```shell
===========================================================================================
环境：
准备三台主机，地址：192.168.2.132（primary, node1）、192.168.2.133（secondary, node2）。192.168.2.128（node3）提供NFS服务。
===========================================================================================
----------------
   node1&2
----------------
[root@primary ~]# ntpdate ntp.aliyun.com
# 同步时间
[root@primary ~]# ssh-keygen -t rsa -P ''
[root@primary ~]# ssh-copy-id -i ~/.ssh/id_rsa.pub 192.168.2.133
# 让两节点使用密钥通信
[root@primary ~]# yum install -y corosync pacemaker
# 安装两个包

-------------
   node1
-------------
[root@primary ~]# cd /etc/corosync/
[root@primary corosync]# cp corosync.conf.example
corosync.conf.example       corosync.conf.example.udpu  
[root@primary corosync]# cp corosync.conf.example corosync.conf
[root@primary corosync]# vim corosync.conf
compatibility: whitetank
# 是否兼容whitetank 
totem {
	version: 2
	secauth: on
	# 是否打开安装认证，不让其他主机加入，打开此功能后需要使用corosync-keygen生成密钥 
	threads: 0
	# 工作时的线程数，0表示基于进程模式工作
	interface {
	# 定义多个节点之间通过哪个接口，基于哪个多播地址，监听什么端口完成多播通信 
		ringnumber: 0
		# 环数目，一般为0，类似TTL值 
		bindnetaddr: 192.168.2.0
		# 这通常是要绑定到的接口的*网络*地址，也就是本机所在的网络。这样可以确保您可以跨所有集群节点使用此配置文件的相同实例，而无需修改此选项。 
		mcastaddr: 239.165.134.13
		# 多播地址
		mcastport: 5405
		# 多播监听端口 
		ttl: 1
	}
}
logging {
# 指定日志系统
	fileline: off
	# 是否记录fileline 
	to_stderr: no
	# 是否发往标准错误输出，一般不发送
	to_logfile: yes
	# 是否记录到日志文件中
	logfile: /var/log/cluster/corosync.log
	# 日志位置 
	to_syslog: no
	# 也发往syslog一份，一般记录一份log即可，所以这里关闭了此功能 
	debug: off
	timestamp: on
	# 是否在日志中打开时间戳功能，如果是on，会影响系统性能 
	logger_subsys {
	# 是否记录子系统，记录AMF，这是OpenAIS的子组件
		subsys: AMF
		debug: off
	}
}
service {
# 加入此段，以插件形式运行pacemaker
	ver: 0
	name: pacemaker
	use_mgmtd: yes
	# 此项可有可无 
}
aisexec {
	user: root
	group:	root
	# 以root用户身份运行，此项可有可无 
}
[root@primary corosync]# ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 00:0c:29:83:af:ca brd ff:ff:ff:ff:ff:ff
# 查看网卡是否支持MULTICAST
[root@primary corosync]# corosync-keygen 
Corosync Cluster Engine Authentication key generator.
Gathering 1024 bits for key from /dev/random.
Press keys on your keyboard to generate entropy.
Writing corosync key to /etc/corosync/authkey.
# 从随机数中生成密钥，需要1024个字符，可能不够，如果不够，可以下载大文件产生IO数，使熵池中生成随机数
[root@primary corosync]# ll 
总用量 32
-rw-r--r-- 1 root root 5384 7月  20 2011 amf.conf.example
-r-------- 1 root root  128 4月   2 15:47 authkey
# 生成了authkey文件，权限400
[root@primary corosync]# scp authkey corosync.conf 192.168.2.133:/etc/corosync/
[root@primary corosync]# service corosync start; ssh 192.168.2.133 'service corosync start'
Starting Corosync Cluster Engine (corosync):               [  OK  ]
Starting Corosync Cluster Engine (corosync): [  OK  ]
# 启动两个节点的corosync服务
[root@primary corosync]# ss -tlun
# 监听了5405多播端口
[root@primary corosync]# tail -f /var/log/cluster/corosync.log
# 查看日志中是否有报错信息
[root@primary corosync]# grep -e "Corosync Cluster Engine" -e "configuration file" /var/log/cluster/corosync.log
# 查看两个节点中是否有两条信息，如果有就证明启动成功了
[root@primary corosync]# grep TOTEM /var/log/cluster/corosync.log
# 查看初始化成员节点通知是否正常发出，应该可以查到内容
[root@primary corosync]# grep ERROR: /var/log/cluster/corosync.log | grep –v unpack_resources
# # 检查启动过程中是否有错误产生，错误信息表示packmaker不久之后将不再作为corosync的插件运行，因此，建议使用cman作为集群基础架构服务，此处可安全忽略。 
[root@primary corosync]# grep pcmk_startup /var/log/cluster/corosync.log
# 如果有信息说明启动完成
```



#### 使用crmsh配置pacemaker

> crmsh工具在集群中的任一节点上安装均可，不需要每个节点都安装

```shell
[root@primary corosync]# cd /etc/yum.repos.d/
[root@primary yum.repos.d]# wget http://download.opensuse.org/repositories/network:/ha-clustering:/Stable/CentOS_CentOS-6/network:ha-clustering:Stable.repo
# 下载opensuse的源，因为crmsh工具是opensuse提供的
[root@primary yum.repos.d]# yum install -y crmsh pssh
# 安装，连接速度很慢
[root@primary yum.repos.d]# crm
# 进入crm模式
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 16:03:21 2019
Last change: Tue Apr  2 15:51:08 2019 by hacluster via crmd on primary

2 nodes configured (2 expected votes)
0 resources configured

Online: [ primary secondary ]

No resources
# 查看状态，也可以直接使用crm status命令。可以看到DC是主机名为primary的节点，Online: [ primary secondary ]表示有两台主机都在线。
```



##### configure配置集群

```shell
[root@primary ~]# crm 
crm(live)# configure
# 在子命令中使用此命令，表示配置集群模式 
crm(live)configure# help
# 查看configure的帮助
crm(live)configure# show
node primary
node secondary
property cib-bootstrap-options: \
	have-watchdog=false \
	dc-version=1.1.18-3.el6-bfe4e80420 \
	cluster-infrastructure="classic openais (with plugin)" \
	expected-quorum-votes=2
# 这是configure中的子命令，显示当前集群配置信息，实际配置文件是XML格式的。显示的property表示集群的全局属性，全局属性是配置集群的基本特性的 
crm(live)configure# show xml
# 这样就可以看到xml格式的配置文件
crm(live)configure# property 
batch-limit=                   enable-startup-probes=         node-health-strategy=          stonith-enabled= 
cluster-delay=                 have-watchdog=                 node-health-yellow=            stonith-max-attempts= 
cluster-ipc-limit=             is-managed-default=            pe-error-series-max=           stonith-timeout= 
# 执行此命令后，再按两次Tab键，可以看到可以配置的全局属性。stonity-enabled=表示是否必须配置stonith设备，默认为是。
crm(live)configure# property stonith-enabled=
stonith-enabled (boolean, [true]): 
    Failed nodes are STONITH'd
# 按两次Tab键后可以看到默认的值是True 
crm(live)configure# property stonith-enabled=false
# 禁用stonith
crm(live)configure# verify
# 校验配置是否有错，如果没错，不会显示任何信息
crm(live)configure# show
node primary
node secondary
property cib-bootstrap-options: \
	have-watchdog=false \
	dc-version=1.1.18-3.el6-bfe4e80420 \
	cluster-infrastructure="classic openais (with plugin)" \
	expected-quorum-votes=2 \
	stonith-enabled=false
# 再查看，多了stonith-enabled=false一项
crm(live)configure# commit
# 提交，这样才能生效。因为上面的配置都是在内存中完成的。
```



##### node

```shell
crm(live)configure# cd ..
crm(live)# node
crm(live)node# ls
..               help             fence            
show             attribute        back             
cd               ready            status-attr      
quit             end              utilization      
exit             ls               maintenance      
online           bye              ?                
status           clearstate       standby          
list             up               server           
delete           
# 查看可用的命令
crm(live)node# show
primary: normal
secondary: normal
# 显示当前在线节点，都是normal状态
crm(live)node# standby
# 把当前节点设置为备用状态 
crm(live)node# show
primary: normal
	standby=on
secondary: normal
crm(live)node# online
# 再让节点上线
crm(live)node# status
<nodes>
  <node id="primary" uname="primary">
    <instance_attributes id="nodes-primary">
      <nvpair id="nodes-primary-standby" name="standby" value="off"/>
    </instance_attributes>
  </node>
  <node id="secondary" uname="secondary"/>
</nodes>
# 查看当前节点信息 
```



##### resource

```shell
crm(live)node# cd ..
crm(live)# resource
crm(live)resource# help
crm(live)resource# status
# 查看资源状态
crm(live)resource# stop resource-name
# 停止资源
crm(live)resource# start resource-name
# 启动资源
crm(live)resource# restart resource-name
# 重启资源
```



##### ra资源代理

```shell
crm(live)resource# cd ..
crm(live)# ra 
crm(live)ra# ls
..               info             quit             
end              help             providers        
up               list             cd               
classes          meta             ls               
back             exit             validate         
bye              ?                
crm(live)ra# classes
lsb
ocf / .isolation heartbeat linbit pacemaker
service
stonith
# 显示资源代理模式 
crm(live)ra# list lsb
abrt-ccpp                abrt-oops                abrtd                    acpid                    atd
auditd                   autofs                   blk-availability         bmc-snmp-proxy           certmonger
cgconfig                 cgred                    cman                     corosync                 corosync-notifyd
cpuspeed                 crond                    cups                     drbd                     exchange-bmc-os-info
# 查看lsb中有哪些资源代理可用
crm(live)ra# list ocf heartbeat
CTDB              Delay             Dummy             Filesystem        IPaddr            IPaddr2           IPsrcaddr
LVM               MailTo            Route             SendArp           Squid             VirtualDomain     Xinetd
crm(live)ra# list ocf pacemaker
ClusterMon    Dummy         HealthCPU     HealthSMART   Stateful      SysInfo       SystemHealth  attribute     ifspeed
ping          pingd         remote  
crm(live)ra# list service
# service与lsb是一样的
crm(live)ra# list stonith
crm(live)ra# help info
#  info可以查看帮助信息
crm(live)ra# info ocf:heartbeat:IPaddr
```



##### 配置资源primitive

```shell
-------------
   node1
-------------
crm(live)ra# cd ..
crm(live)# configure
crm(live)configure# primitive webip ocf:heartbeat:IPaddr params ip=192.168.2.100 nic=eth1 cidr_netmask=24
# webip是资源名称，ocf:heartbeat:IPaddr是资源代理，params 用来指明参数，IP地址，网卡，掩码。
crm(live)configure# verify
crm(live)configure# commit
crm(live)configure# cd ..
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 16:26:40 2019
Last change: Tue Apr  2 16:26:27 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
1 resource configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
# 可以看到webip资源添加到了节点1上
crm(live)# exit
bye
[root@primary ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 00:0c:29:83:af:ca brd ff:ff:ff:ff:ff:ff
    inet 192.168.2.132/24 brd 192.168.2.255 scope global eth1
    inet 192.168.2.100/24 brd 192.168.2.255 scope global secondary eth1
    inet6 fe80::20c:29ff:fe83:afca/64 scope link 
       valid_lft forever preferred_lft forever
# 查看看到添加了一个IP
[root@primary ~]# crm node standby
# 要将哪个节点转为备节点，就在哪个节点上执行此命令
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 16:30:38 2019
Last change: Tue Apr  2 16:30:34 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
1 resource configured

Node primary: standby
Online: [ secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started secondary
# 查看状态，online的就只有node2了

-------------
   node2
-------------
[root@secondary ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
    link/ether 00:0c:29:af:e1:97 brd ff:ff:ff:ff:ff:ff
    inet 192.168.2.133/24 brd 192.168.2.255 scope global eth1
    inet 192.168.2.100/24 brd 192.168.2.255 scope global secondary eth1
    inet6 fe80::20c:29ff:feaf:e197/64 scope link 
       valid_lft forever preferred_lft forever
# 可以看到ip地址转到node2了

-------------
   node1
-------------
[root@primary ~]# crm node online
# 让节点1上线
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 16:32:28 2019
Last change: Tue Apr  2 16:32:25 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
1 resource configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started secondary
# 资源没有转回

-------------
   node2
-------------
[root@secondary ~]# service corosync stop
Signaling Corosync Cluster Engine (corosync) to terminate: [  OK  ]
Waiting for corosync services to unload:.                  [  OK  ]
# 停掉节点2的服务，看资源是转到节点1上

-------------
   node1
-------------
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition WITHOUT quorum
Last updated: Tue Apr  2 16:34:22 2019
Last change: Tue Apr  2 16:32:25 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
1 resource configured

Online: [ primary ]
OFFLINE: [ secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Stopped
# 看资源是否转移，显示资源没有启动，因为一个服务停止了，所以只有一个节点在线，未超过半数，并且资源默认是关闭的，所以资源未启动 
[root@primary ~]# crm configure
crm(live)configure# property no-quorum-policy=ignore
# 设置没有法定票数时怎么办，设置为ignore
crm(live)configure# commit
crm(live)configure# exit
bye
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition WITHOUT quorum
Last updated: Tue Apr  2 16:36:29 2019
Last change: Tue Apr  2 16:35:58 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
1 resource configured

Online: [ primary ]
OFFLINE: [ secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
# 这时可以看到资源启动了

-------------
   node2
-------------
[root@secondary ~]# service corosync start
Starting Corosync Cluster Engine (corosync): 
                                                           [  OK  ]

-------------
   node1
-------------
[root@primary ~]# crm resource
crm(live)resource# status webip
resource webip is running on: primary 
# 查看资源状态，显示资源在primary上
crm(live)resource# migrate webip secondary
INFO: Move constraint created for webip to secondary
# 转移资源 到secondary上，secondary是主机名
crm(live)resource# status webip
resource webip is running on: secondary 
# 显示资源在secondary上
crm(live)resource# stop webip
# 停止资源 
crm(live)resource# status webip
resource webip is NOT running
crm(live)resource# start webip
# 启动资源 
crm(live)resource# status webip
resource webip is running on: secondary 
crm(live)resource# status 
 webip	(ocf::heartbeat:IPaddr):	Started
# 查看所有资源
crm(live)resource# unmigrate webip
INFO: Removed migration constraints for webip
# 转回到原来的节点
crm(live)resource# status webip
resource webip is running on: secondary 
# 因为没有倾向性，所以没有转移
```



##### 高可用web

```shell
----------------
   node1&2
----------------
[root@primary ~]# yum install -y httpd
[root@primary ~]# vim /var/www/html/index.html
node1:primary
# 提供网页文件，另一台内容为node2:secondary
[root@primary ~]# service httpd start
[root@primary ~]# curl 192.168.2.132
node1:primary
[root@primary ~]# curl 192.168.2.133
node2:secondary
[root@secondary ~]# service httpd stop
[root@secondary ~]# chkconfig httpd off
# 因为要高可用此资源，所以不可以让服务自动启动

-------------
   node1
-------------
[root@primary ~]# crm configure      
crm(live)configure# primitive webserver lsb:httpd
# 添加资源
crm(live)configure# verify
crm(live)configure# commit

-------------
   node2
-------------
[root@secondary ~]# ss -tln
# web服务在节点2上启动了

-------------
   node1
-------------
[root@primary ~]# crm resource
crm(live)resource# show
 webip	(ocf::heartbeat:IPaddr):	Started
 webserver	(lsb:httpd):	Started
# 查看资源是启动的
crm(live)resource# stop webserver
# 停止资源
crm(live)resource# show
 webip	(ocf::heartbeat:IPaddr):	Started
 webserver	(lsb:httpd):	Stopped (disabled)
crm(live)resource# start webserver
# 再启动
crm(live)resource# show
 webip	(ocf::heartbeat:IPaddr):	Started
 webserver	(lsb:httpd):	Started
# 这时资源还是在节点2上启动
crm(live)resource# cd ..
crm(live)# node
crm(live)node# standby secondary
# 让节点2成为备用节点
crm(live)node# cd ..
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:10:10 2019
Last change: Tue Apr  2 17:08:47 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Node secondary: standby
Online: [ primary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
# 这时两个资源都在节点1上运行了
crm(live)# node online secondary
# 让节点2上线
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:11:16 2019
Last change: Tue Apr  2 17:11:08 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started secondary
 # web资源又转移到了节点2上
 
 ==========================================================================================
 使用资源组的方式，让资源在同一个节点运行
 ==========================================================================================
 crm(live)configure# group webservice webip webserver
# 定义一个组叫webservice，组内有两个资源
crm(live)configure# verify
crm(live)configure# commit
crm(live)configure# exit
bye
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:14:15 2019
Last change: Tue Apr  2 17:13:22 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 Resource Group: webservice
     webip	(ocf::heartbeat:IPaddr):	Started primary
     webserver	(lsb:httpd):	Started primary
# web资源又转移到节点1上了
[root@primary ~]# crm configure
crm(live)configure# edit
node primary \
        attributes standby=off
node secondary \
        attributes standby=off
primitive webip IPaddr \
        params ip=192.168.2.100 nic=eth1 cidr_netmask=24 \
        meta target-role=Started
primitive webserver lsb:httpd \
        meta target-role=Started
group webservice webip webserver
property cib-bootstrap-options: \
        have-watchdog=false \
        dc-version=1.1.18-3.el6-bfe4e80420 \
        cluster-infrastructure="classic openais (with plugin)" \
        expected-quorum-votes=2 \
        stonith-enabled=false \
        no-quorum-policy=ignore
# 编辑配置文件
crm(live)resource# cd ..
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:18:54 2019
Last change: Tue Apr  2 17:18:36 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 Resource Group: webservice
     webip	(ocf::heartbeat:IPaddr):	Started primary
     webserver	(lsb:httpd):	Started primary
# 可以看到两个资源在一个资源组中
crm(live)# configure delete webservice
# 删除资源组，并不会报错，资源组马上被删除了
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:19:12 2019
Last change: Tue Apr  2 17:19:10 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started secondary
# 资源组没有了
==========================================================================================
定义排列约束，即将资源绑定在一起
==========================================================================================
crm(live)# configure
crm(live)configure# colocation webserver_with_webip inf: webserver webip
# colocation定义排列约束，webserver_with_webip是自定义名称，inf表示定义分数，冒号后没有东西表示无穷大，这样两个资源就永远在一起了 
crm(live)configure# verify
crm(live)configure# commit
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:26:39 2019
Last change: Tue Apr  2 17:26:35 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
# 提交后，两个资源就都在节点1上运行了
==========================================================================================
定义顺序约束，即资源的启动顺序。定义位置约束，即让资源倾向在哪个节点上运行。
==========================================================================================
crm(live)configure# order webip_before_webserver Mandatory: webip webserver
# 定义顺序约束，先启动webip再启动webserver 
crm(live)configure# location webip_on_node2 webip 50: secondary
# 定义位置约束，让webip资源尽量在节点2上运行 
crm(live)configure# verify
crm(live)configure# commit
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:51:11 2019
Last change: Tue Apr  2 17:50:50 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started secondary
 webserver	(lsb:httpd):	Started secondary
 # 提交后，资源都转到节点2运行了
 
 crm(live)configure# delete webip_on_node2 
crm(live)configure# show
node primary \
	attributes standby=off
node secondary \
	attributes standby=off
primitive webip IPaddr \
	params ip=192.168.2.100 nic=eth1 cidr_netmask=24 \
	meta target-role=Started
primitive webserver lsb:httpd \
	meta target-role=Started
order webip_before_webserver Mandatory: webip webserver
colocation webserver_with_webip inf: webserver webip
property cib-bootstrap-options: \
	have-watchdog=false \
	dc-version=1.1.18-3.el6-bfe4e80420 \
	cluster-infrastructure="classic openais (with plugin)" \
	expected-quorum-votes=2 \
	stonith-enabled=false \
	no-quorum-policy=ignore
crm(live)configure# location webip_on_node2 webip rule 50: #uname eq secondary
crm(live)configure# verify
crm(live)configure# commit
crm(live)node# standby secondary
# 让节点2成为备用节点
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:55:23 2019
Last change: Tue Apr  2 17:55:07 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Node secondary: standby
Online: [ primary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
# 这时资源会转移到节点1
crm(live)node# online secondary
# 节点2上线
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 17:55:38 2019
Last change: Tue Apr  2 17:55:34 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started secondary
 webserver	(lsb:httpd):	Started secondary
# 资源又转回到节点2
crm(live)configure# rsc_defaults resource-stickiness=50
# 设置资源指黏性值，默认是0。之前的命令property default-resource-stickiness=50 已经不能使用了
crm(live)configure# verify
crm(live)configure# commit
crm(live)configure# cd ..
crm(live)# node standby secondary
# 节点2下线
[root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 18:10:12 2019
Last change: Tue Apr  2 18:07:48 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Node secondary: standby
Online: [ primary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
 # 资源到节点1
 crm(live)# node online secondary
 # 节点2上线
 [root@primary ~]# crm status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 18:11:19 2019
Last change: Tue Apr  2 18:10:41 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
 # 资源不再转移，与设置资源黏性有关
 [root@primary ~]# killall httpd
 # 停止web服务
 crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Tue Apr  2 18:12:49 2019
Last change: Tue Apr  2 18:10:41 2019 by root via crm_attribute on primary

2 nodes configured (2 expected votes)
2 resources configured

Online: [ primary secondary ]

Full list of resources:

 webip	(ocf::heartbeat:IPaddr):	Started primary
 webserver	(lsb:httpd):	Started primary
# 默认只高可用节点，资源停掉也不会关心，还是显示资源在节点1上运行

===========================================================================================
配置高可用web资源，设置监控
===========================================================================================
crm(live)# resource
crm(live)resource# stop webserver
crm(live)resource# stop webip
# 停止资源
crm(live)resource# cd ..
crm(live)# configure edit
node primary \
        attributes standby=off
node secondary \
        attributes standby=off
property cib-bootstrap-options: \
        have-watchdog=false \
        dc-version=1.1.18-3.el6-bfe4e80420 \
        cluster-infrastructure="classic openais (with plugin)" \
        expected-quorum-votes=2 \
        stonith-enabled=false \
        no-quorum-policy=ignore
rsc_defaults rsc-options: \
        resource-stickiness=50
# 删除上面定义的资源，下面重新定义
crm(live)configure# primitive webip ocf:heartbeat:IPaddr params ip=192.168.2.100 nic=eth1 cidr_netmask=24 
# 定义资源
crm(live)configure# monitor webip 10s:20s
# 单独定义monitor，后面是interval和timeout的时间
crm(live)configure# verify
crm(live)configure# primitive webserver lsb:httpd op monitor interval=10s timeout=20s
# 也可以将定义资源与监控在一起定义。一定要用op才能使用monitor命令。monitor表示监控，interval=10s timeout=20s是监控的轮询时间和超时时间，有了监控，就可以在资源停止时进行转移了 
crm(live)configure# verify
crm(live)configure# group webservice webip webserver
crm(live)configure# verify
crm(live)configure# commit
[root@primary ~]# ss -tln
# 现在服务运行在节点1上
[root@primary ~]# killall httpd
# 停止web服务
[root@primary ~]# ss -tln
# 10秒后，web服务会再次启动
[root@primary ~]# yum install -y epel-release
[root@primary ~]# yum install -y nginx
[root@primary ~]# killall httpd
[root@primary ~]# service nginx start
Starting nginx:                                            [  OK  ]
# 停止httpd服务，并启动nginx服务，为了不让httpd服务在节点1启动。看资源是否会转移到节点2上

-------------
   node2
-------------
[root@secondary ~]# ss -tln
[root@secondary ~]# ip a
# 服务与地址都转到了节点2上

-------------
   node3
-------------
# 使用此节点提供NFS服务
[root@webdav ~]# yum install -y nfs-utils nginx
[root@webdav ~]# systemctl start nfs
[root@webdav ~]# mkdir /shared
[root@webdav ~]# vim /shared/index.html
test page
[root@webdav ~]# vim /etc/exports
/shared       192.168.2.0/24(rw,no_root_squash) 192.168.1.0/24(rw)
[root@webdav ~]# exportfs -ra
[root@webdav ~]# showmount -e 192.168.2.128

-------------
   node1
-------------
[root@primary ~]# crm configure
crm(live)configure# primitive webstore ocf:heartbeat:Filesystem params device="192.168.2.128:/shared" directory="/var/www/html" fstype="nfs" op monitor interval=20s timeout=40s op start timeout=60s op stop timeout=60s
# 定义一个存储资源，提供NFS地址与挂载地址、文件系统类型。最后设置监控。
crm(live)configure# edit
group webservice webip webserver webstore
# 将资源加入组
crm(live)configure# verify
crm(live)configure# commit
crm(live)# status
Stack: classic openais (with plugin)
Current DC: secondary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Wed Apr  3 04:58:49 2019
Last change: Wed Apr  3 04:57:53 2019 by hacluster via cibadmin on secondary

2 nodes configured (2 expected votes)
3 resources configured

Online: [ primary ]
OFFLINE: [ secondary ]

Full list of resources:

 Resource Group: webservice
     webip	(ocf::heartbeat:IPaddr):	Started primary
     webserver	(lsb:httpd):	Stopped
     webstore	(ocf::heartbeat:Filesystem):	Stopped
# 因为实验不是一起做的，提供NFS服务是第二次接着做，所以忘记上一次为什么资源会停止了，新加入的服务也停止了，使用节点上线与启动资源的命令也没有反应。所以下面准备重新启动服务
[root@primary ~]# service corosync status
corosync (pid  46159) is running...
[root@primary ~]# kill -9 46159
# 因为停止服务非常 慢，所以使用kill杀死服务，两个节点都重新启动服务
[root@primary ~]# service corosync start
[root@primary ~]# crm 
crm(live)# status
Stack: classic openais (with plugin)
Current DC: NONE
Last updated: Wed Apr  3 05:02:40 2019
Last change: Wed Apr  3 04:57:53 2019 by hacluster via cibadmin on secondary

2 nodes configured (2 expected votes)
3 resources configured

OFFLINE: [ primary secondary ]

Full list of resources:

 Resource Group: webservice
     webip	(ocf::heartbeat:IPaddr):	Stopped
     webserver	(lsb:httpd):	Stopped
     webstore	(ocf::heartbeat:Filesystem):	Stopped
# 启动服务后，资源还是停止状态
crm(live)# resource start webservice
crm(live)# status
Stack: classic openais (with plugin)
Current DC: primary (version 1.1.18-3.el6-bfe4e80420) - partition with quorum
Last updated: Wed Apr  3 05:03:07 2019
Last change: Wed Apr  3 05:03:03 2019 by root via cibadmin on primary

2 nodes configured (2 expected votes)
3 resources configured

Online: [ primary secondary ]

Full list of resources:

 Resource Group: webservice
     webip	(ocf::heartbeat:IPaddr):	Started secondary
     webserver	(lsb:httpd):	Started secondary
     webstore	(ocf::heartbeat:Filesystem):	Started secondary
# 启动资源后正常了
访问192.168.2.100，可以看到test page的字样证明成功了。
# 停止节点2后，资源无法转移，后发现是在节点1上启动了nginx服务，停止nginx服务后仍然无法启动webserver资源。未找到原因，删除webserver资源重新添加后正常。
```

