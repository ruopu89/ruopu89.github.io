---
title: NFS配置使用
date: 2019-04-03 14:53:41
tags: 网络存储
categories: 基础
---

### 概念

> ext3、ext2等文件系統工作在內核空間，任何程序只要能夠執行都工作在用戶空間，如mke2fs命令工作在用戶空間，NFS是文件系統，工作在內核空間；內核空間中的程序只有內核自我能夠管理。
>
> 向磁盤讀寫數據要通過內核調用也叫函數調用，如read()，write()，函數執行要經過一個過程，所以函數調用又叫過程調用；一般本地應用程序實現某個操作的時候都是通過本地的過程調用來完成的，叫作local procedure call，就是本地的兩個程序或程序與內核之間調用函數完成某種功能的過程；作爲程序員，如果想與某個程序交互，只要某個程序提供函數就可以交互了；
>
> LPC：本地過程調用，local procedure call
>
> RPC：遠程過程調用，Remote procedure call
>
> 客戶端與遠程服務器端通過一個RPC客戶端（RPC客戶端叫stub：存根客戶端）與服務器端（運行的是RPC server）聯系，實現數據的讀取，RPC服務器端監聽的套接字是隨機的。linux提供rpc服務的程序叫Portmap，監聽在111/tcp, 111/udp端口。
>
> RPC（框架）是一種編程技術，可以簡化分布式應用程序的開發。从RPC的客戶端向RPC的服務器端發起通信，RPC服務器端再將用戶請求真正轉給客戶端真正請求的服務器端。c --> rpc c --> rpc s --> s
>
> NFS Client →  NFS Server
>
> RPC通信既可基於二進制也可基於文本格式進行數據交換，基於文本格式比較常見的叫XMLRPC，之後又發展出SOAP（Simple Object Access Protocol）簡單對象訪問協議。
>
> RPC是一種協議或編程技術，連接兩臺主機，像一臺主機一樣實現數據交換。
>
> 將遠程的設備掛載到本地時，在本地才叫NFS系統。NFS也是一種協議，現在用NFSv3，NFSv4版本，服務器端只能驗證IP不能驗證用戶名



#### NFS對服務器來講有兩個組件

> 服務器端：nfs-utils，安裝此軟件包就可配置爲服務器端了。
>
> 因爲NFS是基於RPC運行的，所以要確保RPC在linux上的服務portmap已經啓動。portmap是監聽在111/tcp, 111/udp端口的。還可以使用rpcinfo -p來查看一臺主機上的所有rpc進程所監聽的端口號，如：rpcinfo -p localhost，會查到有很多端口監聽，這些是NFS啓動時向RPC請求的端口，nfs會啓動三個進程：nfsd(nfs的主服務)，mountd（接受客戶端掛載請求的）, quotad（限定客戶端在本地只能使用多大磁盤空間的）；nfsd監聽在2049/tcp端口，這是注冊使用的；mountd，quotad會改變端口，是半隨機的端口，是RPC服務幫助選取的，因爲是RPC隨機選取的，所以叫半隨機的端口，可能使用其他服務的端口，所以最好配置一個固定端口給這兩個服務，默認是使用隨機端口。nfslock是分布式文件鎖，當一臺主機在讀取NFS磁盤數據時，要先加鎖，這樣其他主機就不能讀取磁盤數據了，避免磁盤崩潰。NFS配置文件/etc/exports，在此配置文件中定義共享哪個文件系統，哪些可以使用文件系統，讓其可被掛載到本地像使用本地磁盤一樣使用。



#### NFS工作流程

> 對於NFSv3來講，客戶端先去聯系服務器上的portmap（RPC服務器），RPC服務器會告訴客戶端rpc.mountd所監聽的端口號，當這個端口號回傳給客戶端以後，客戶端會重新連接rpc.mountd，rpc.mountd返回給用戶一個初始化文件句柄或叫訪問令牌，也就是在配置文件中定義的IP地址訪問時才會發給令牌，這時客戶端來找nfsd，nfsd監聽在2049端口上。這時就能訪問了。
>
> 讓mountd和quotad等進程監聽在固定端口，編輯配置文件/etc/sysconfig/nfs，其中有MOUNTD_PORT=***一項，定義好端口號即可。QUOTAD_PORT=***也一樣。LOCKD_TCPPORT=***,  LOCKD_UDPPORT=***是啓動鎖進程要監聽的端口。





### 实例

#### 基本配置

```shell
[root@webdav ~]# yum install -y nfs-utils
[root@webdav ~]# netstat -tlnp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      1/systemd           
tcp        0      0 0.0.0.0:20048           0.0.0.0:*               LISTEN      97455/rpc.mountd          
tcp        0      0 0.0.0.0:43326           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:2049            0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:42758           0.0.0.0:*               LISTEN      97452/rpc.statd   
[root@webdav ~]# mkdir /shared
[root@webdav ~]# vim /etc/exports
/shared       192.168.2.0/24(ro) 192.168.1.0/24(rw)
# 配置文件中每一行包含一個共享出去的文件系統以及哪些客戶端可使用此文件系統；每個客戶端後必須跟一個小括號，小括號中定義了客戶端訪問此文件系統時所具有的屬性
# /path/to/somedir共享哪個目錄，可以是獨立的分區或目錄，建議使用獨立分區，之後是客戶端列表CLIENT_LIST，多個客戶列表之間用空格分隔。每個客戶端後面必須跟一個小括號，裏面定義了此客戶訪問特性，如訪問權限等。如：
# 172.16.0.0/16(ro,async) 192.16.0.0/24(rw,sync)
# async異步寫入，sync同步寫入，ro只讀，rw讀寫。
# 客戶端可以是單個主機用FQDN或IP定義都可以；也可以用通配符，如*.example.com；也可以是IP/netmask的方式
[root@webdav ~]# exportfs -r
# 使用此命令重新导出
[root@webdav ~]# showmount -e 192.168.2.128
Export list for 192.168.2.128:
192.168.1.0/24,192.168.2.0/24
# -e表示顯示共享了哪些目錄，也可以選程主機上使用此命令查看某主機共享了哪些目錄

=================
   debian系统挂载
=================
⚡ root@ruopu64  ~  apt install nfs-common
 # 安装包，如果不安装此包，挂载时会提示"mount: /mnt: bad option; for several filesystems (e.g. nfs, cifs) you might need a /sbin/mount.<type> helper program."。
 # 如果debian是服务端，要安装 nfs-kernel-server包
⚡ root@ruopu64  ~  mount -t nfs 192.168.2.128:/shared /mnt
⚡ root@ruopu64  ~  df -h
文件系统                      容量  已用  可用 已用% 挂载点
...
192.168.2.128:/shared          17G  1.3G   16G    8% /mnt
```



#### showmount命令

```shell
showmount -e NFS_SERVER
# 查看NFS服務器“導出”的各文件系統，導出就是共享的意思
showmount -a NFS_SERVER
# 查看NFS服務器所有被掛載的文件系統及其客戶端對應列表
showmount -d NFS_SERVER
# 顯示NFS服務器所有導出的文件系統中被客戶端掛載了的文件系統列表
```



#### exportfs命令

```shell
-a：跟-r或-u選項同時使用，表示重新掛載所有文件系統或取消導出所有文件系統
-r：重新導出
-u：取消導出
-v：顯示詳細信息
exportfs -rav：不必重啓服務，重新導出
```



#### 设置访问权限

```shell
========
   server
========
[root@webdav ~]# useradd hadoop
[root@webdav ~]# id hadoop
uid=1000(hadoop) gid=1000(hadoop) 组=1000(hadoop)
# 查看用户与组ID
[root@webdav ~]# setfacl -m u:hadoop:rwx /shared/
[root@webdav ~]# su - hadoop
[hadoop@webdav ~]$ cd /shared/
[hadoop@webdav shared]$ touch a.hadoop
[hadoop@webdav shared]$ ll
total 0
-rw-rw-r-- 1 hadoop hadoop 0 Apr  3 16:24 a.hadoop

========
   client
========
[root@primary ~]# groupadd -g 1000 openstack
[root@primary ~]# useradd -g 1000 -u 1000 openstack
# 创建用户与组ID与服务器端一样的用户，只是用户名不同
[root@primary ~]# mount -t nfs 192.168.2.128:/shared /mnt
[root@primary ~]# ll /mnt
总用量 0
-rw-rw-r-- 1 openstack openstack 0 4月   3 2019 a.hadoop
# 在客户端挂载NFS系统后，因为用户与组ID与服务器端一样，所以用户和组都变成了openstack

========
   server
========
[hadoop@webdav shared]$ exit
logout
[root@webdav ~]# vim /etc/exports
/shared       192.168.2.0/24(rw) 192.168.1.0/24(rw)
[root@webdav ~]# exportfs -ra

========
   client
========
[root@primary ~]# su - openstack
[openstack@primary ~]$ cd /mnt
[openstack@primary mnt]$ ll
total 0
-rw-rw-r-- 1 openstack openstack 0 Apr  3  2019 a.hadoop
[openstack@primary mnt]$ touch b.openstack
[openstack@primary mnt]$ ll
total 0
-rw-rw-r-- 1 openstack openstack 0 Apr  3  2019 a.hadoop
-rw-rw-r-- 1 openstack openstack 0 Apr  3  2019 b.openstack

========
   server
========
[root@webdav ~]# ll /shared/
总用量 0
-rw-rw-r-- 1 hadoop hadoop 0 4月   3 16:24 a.hadoop
-rw-rw-r-- 1 hadoop hadoop 0 4月   3 16:41 b.openstack

========
   client
========
[openstack@primary mnt]$ exit
logout
[root@primary ~]# rm /mnt/b.openstack 
rm：是否删除普通空文件 "/mnt/b.openstack"？y
rm: 无法删除"/mnt/b.openstack": 权限不够
# 這時是不能刪除的，root用戶是不能操作遠程主機上的文件的。


========
   server
========
[root@webdav ~]# vim /etc/exports
/shared       192.168.2.0/24(rw,no_root_squash) 192.168.1.0/24(rw)
# 可用选项如下：
# no_root_squash：任何主機以root掛載此目錄都將是管理員了，这样root就可以删除远程文件了。
# root_squash：將root用戶映射爲來賓賬號，這是默認功能，不加也會執行
# all_squash：無論是誰都轉換爲來賓帳號。
# anonuid, anongid：指定映射的來賓賬號的UID和GID
[root@webdav ~]# exportfs -ra

========
   client
========
[root@primary ~]# umount /mnt
[root@primary ~]# mount -t nfs 192.168.2.128:/shared /mnt
[root@primary ~]# rm -rf /mnt/b.openstack
[root@primary ~]# ll /mnt
总用量 0
-rw-rw-r-- 1 openstack openstack 0 4月   3 2019 a.hadoop
# 文件被删除了
[root@primary ~]# vim /etc/fstab 
192.168.2.128:/shared   /mnt                    nfs     defaults,_rnetdev       0 0
# mount的選項中有_rnetdev，表示如果主機不在或無法掛載就跳過
[root@primary ~]# umount /mnt
[root@primary ~]# mount -a
[root@primary ~]# df -h
Filesystem            Size  Used Avail Use% Mounted on
192.168.2.128:/shared                       17G  1.3G   16G   8% /mnt

```

