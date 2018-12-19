---
title: KVM使用
date: 2018-11-15 09:28:28
tags: KVM虚拟化
categories: 虚拟化
---

### KVM安装

```shell
安装环境在CentOS6.6_x64
* 方法一
1. 查看是否支持虚拟化
egrep '(vmx|svm)' /proc/cpuinfo
2. 关闭SELinux和防火墙
setenforce 0
getenforce
systemctl stop firewalld
systemctl disable firewalld
3. 加载kvm模块
modprobe kvm
4. 查看是否加载kvm
lsmod | grep kvm
5. 安装KVM软件
yum -y install qemu-kvm qemu-kvm-tools
6. 因为安装后qemu-kvm命令不在环境变量中，所以要添加
ln -sv /usr/libexec/qemu-kvm /usr/sbin
7. qemu-kvm查看帮助、支持模拟的PC、可模拟的CPU架构
qemu-kvm -h
qemu-kvm -M ?
qemu-kvm -cpu ?
8. 安装VNC服务端
yum -y install tigervnc-server
9. 将系统镜像文件复制到服务器
10. 创建虚拟机的镜像文件目录并创建镜像文件
mkdir /images/vm1 -pv
qemu-img create -f qcow2 -o size=100G /images/vm1/ubuntu.qcow2
# 创建虚拟机前，需要先有一个虚拟磁盘文件，不然无法创建虚拟机
11. 创建虚拟机
qemu-kvm -name "ubuntu10" -m 1024 -smp 2 -hda /images/vm1/ubuntu.qcow2 -cdrom ubuntu-10.01.***.iso -vnc :0 -boot order=dc
# -name是取一个虚拟机的名字；-m指定内存大小；-smp指定CPU的颗数，但不要超过物理核心数；-hda是指定磁盘镜像，因为是本地第一个分区所以用-hda；-cdrom是指定光盘镜像；-boot是指定启动次序，这里的d指使用一次；-net nic是指定网卡的，指定nic会向某个接口进行桥连接，如果不能连接会报错，所以这里不用此选项；-vnc :0是为了避免vnc连接失败。启动后提示在5900上启动了vnc
12. 在CentOS上安装vnc客户端测试
yum -y install tigervnc
13. 连接VNC服务器进行安装
vncviewer :5900
14. windows上安装VNC-viewer软件，连接时输入IP:5900，NAME输入在qemu-kvm创建时用-name创建的虚拟机名字
15. 安装xp系统
qemu-img create -f qcow2 -o size=100G /images/vm1/xp.qcow2
# 创建虚拟磁盘
qemu-kvm -name "winxp" -m 768 -smp 4 -drive file=/images/vm1/xp.qcow2,if=ide,index=0,media=disk,format=qcow2 -drive file=/root/winxp_ghost.iso,media=cdrom,index=1 -vnc :0 -boot order=dc
# -drive中的第一個file指定磁盤映像文件，if指定磁盤接口類型，index表示爲第幾個設備，0爲第一個設備，從0開始編號，media=disk表示是一個磁盤設備，format=qcow2是指定映像文件的格式。第二個file指定光盤映像文件，media=cdrom是指明是一個光盤。啓動成功。
16. 安装openSUSE
qemu-kvm -m 2048 -name opensuse -drive file=/home/ruopu/private1/VirtaulOS/openSUSE/openSUSE.qcow2,media=disk,format=qcow2,if=ide -net nic -boot c

* 方法二
1. 查看是否支持虚拟化
egrep '(vmx|svm)' /proc/cpuinfo
2. 关闭SELinux和防火墙
setenforce 0
getenforce
systemctl stop firewalld
systemctl disable firewalld
3. 加载kvm模块
modprobe kvm
4. 查看是否加载kvm
lsmod | grep kvm
5. 安装依赖软件
yum install -y qemu-kvm libvirt virt-install bridge-utils tigervnc tigervnc-server virt-manager
# virt-manager是一个图形管理页面
6. 开启kvm服务，并且设置其开机自动启动
systemctl start libvirtd
systemctl enable libvirtd
systemctl status libvirtd
systemctl is-enabled libvirtd
7. 配置网桥模式。配置好之后会有br0和virbr0两个网卡
cd /etc/sysconfig/network-scripts
cp ifcfg-eno16777736 ifcfg-eno16777736.bak
vim ifcfg-br0
    BOOTPROTO=static
    DEVICE=br0
    TYPE=Bridge
    NM_CONTROLLED=no
    IPADDR=192.168.1.90
    NETMASK=255.255.255.0
    GATEWAY=192.168.1.1
    DNS1=192.168.1.1
vim ifcfg-eno16777736
    BOOTPROTO=none
    DEVICE=enp0s25
    NM_CONTROLLED=no
    ONBOOT=yes
    BRIDGE=br0
systemctl restart network
# 可按此方法配置多个网桥设备
8. 复制系统镜像文件到服务器
9. 创建虚拟磁盘，这里创建的镜像文件格式建议用.img格式。
qemu-img create -f qcow2 -o size=50G centos7.img
# 需要事先创建磁盘文件，不然下面的命令会报错“ERROR Format cannot be specified for unmanaged storage.”，这应该是virt-manager 没有找到存储池的问题
qemu-img create -f qcow2 -opreallocation=metadata RHEL7.img 40G
# 这样创建磁盘也可以，重要的是-opreallocation=metadata选项，可以预分配磁盘，硬盘空间不会立即分配出去
10. 创建虚拟机 
virt-install -n xp -r 1024 --vcpus 2 --disk /images/xp.img,format=qcow2,size=50 --network bridge=br0 --os-type=windows --cdrom /images/vm1/xp.iso --vnc --vncport=5900 --vnclisten=0.0.0.0 --accelerate
virt-install -n centos6 -r 1024 --vcpus 2 --disk /images/centos.img,format=qcow2,size=30 --network bridge=br0 --network bridge=br1 --os-type=linux --cdrom /images/vm1/centos6.iso --vnc --vncport=5900 --vnclisten=0.0.0.0 --accelerate 
# --accelerate表示KVM或KQEMU内核加速,这个选项是推荐最好加上。如果KVM和KQEMU都支持，KVM加速器优先使用。--vncport指定端口，--vnclisten很重要，0.0.0.0表示监听在所有端口，不指定的话会监听在本地回环地址，用vncviewer是不能连接的。另外，不能两个VNC软件同时连接虚拟机；--disk /images/centos.img,format=qcow2,size=30是一定要定义的，这与上面创建的磁盘大小没有关系，如果这里不指定磁盘大小，在安装时会显示磁盘大小是0
```



### 查看虚拟机状态

```shell
virsh list --all
```



### 虚拟机的启动、停止与删除

```shell
* 启动
virsh start xp
# 启动虚拟机
virsh create /etc/libvirt/qemu/C7.xml
# 通过配置文件启动虚拟机
virsh autostart RHEL
# 配置开机自启动虚拟机

* 关闭
virsh shutdown xp
# 关闭虚拟机
systemctl start acpid
systemctl enable acpid
virsh shutdown RHEL
# 默认情况下virsh工具不能对linux虚拟机进行关机操作，linux操作系统需要开启与启动acpid服务。在安装KVM linux虚拟机必须配置此服务。
virsh destroy RHEL
# 强制关闭虚拟机RHEL

* 删除
virsh undefine RHEL
# 删除虚拟机，前提条件是这个虚拟机没有快照文件，如果有就不要先删除快照再删除虚拟机。该命令只是删除RHEL虚拟机的配置文件，并不删除虚拟磁盘文件。

* 挂起服务器
virsh suspend RHEL

* 恢复服务器
virsh  resume RHEL

* 导出KVM虚拟机配置文件
virsh dumpxml RHEL > /etc/libvirt/qemu/wintest02.xml

*  重新定义虚拟机配置文件
mv /etc/libvirt/qemu/C7_1.xml /etc/libvirt/qemu/C7.xml
virsh define /etc/libvirt/qemu/C7.xml
# 通过导出备份的配置文件恢复原KVM虚拟机的定义，并重新定义虚拟机。
```



### 修改现有虚拟机配置

```shell
virsh edit RHEL
# 这会打开虚拟机的配置文件，在虚拟机关机状态下修改后保存并启动虚拟机就会生效。如果用vim修改/etc/libvirt/qemu/目录中的虚拟机的xml文件是不能生效的
virsh dominfo RHEL
# 修改完以后用此命令查看现在的虚拟机的配置
```



### 添加、删除网卡

```shell
[root@ccjd shaosong]# virsh domiflist SScentos7
Interface  Type       Source     Model       MAC
-------------------------------------------------------
vnet0      bridge     br0        -           52:54:00:7e:7b:7e
# 查看网卡信息
[root@ccjd shaosong]# virsh attach-interface SScentos7 --type bridge --source br1
Interface attached successfully
# 给SScentos7虚拟机临时添加一块叫br1的网卡
[root@ccjd shaosong]# virsh domiflist SScentos7
Interface  Type       Source     Model       MAC
-------------------------------------------------------
vnet0      bridge     br0        -           52:54:00:7e:7b:7e
vnet1      bridge     br1        -           52:54:00:b9:a1:e2
# 再查看时已多了一块网卡，在虚拟机中也可以看到此网卡，并且可以使用。
[root@ccjd shaosong]# virsh attach-interface SScentos7 --type bridge --source br1 --config
# 永久添加网卡，使用--config选项
Interface attached successfully
[root@ccjd shaosong]# virsh edit SScentos7
Domain SScentos7 XML configuration not changed.
# 查看虚拟机的配置文件，可以看到多了一个新网卡的配置信息
 <interface type='bridge'>
      <mac address='52:54:00:7e:7b:7e'/>
      <source bridge='br0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
    </interface>
    <interface type='bridge'>
      <mac address='52:54:00:5a:89:15'/>
      <source bridge='br1'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </interface>
[root@ccjd shaosong]# virsh shutdown SScentos7
Domain SScentos7 is being shutdown
[root@ccjd shaosong]# virsh start SScentos7
Domain SScentos7 started
[root@ccjd shaosong]# virsh domiflist SScentos7
Interface  Type       Source     Model       MAC
-------------------------------------------------------
vnet0      bridge     br0        -           52:54:00:7e:7b:7e
vnet1      bridge     br1        -           52:54:00:5a:89:15
# 重启虚拟机可以看到网卡被永久添加上了
[root@ccjd shaosong]# virsh detach-interface SScentos7 --type bridge --mac 52:54:00:5a:89:15 --config
Interface attached successfully
# 删除虚拟机网卡
```



### 克隆虚拟机

```shell
virt-clone -o C7 -n C7-1 -f /data/c7_1.img -f /data/c7_2.img
# C7是现有的域名(虚拟机名)，C7-1是要创建的域名，c7_1.img是要创建的镜像文件，这里不需要事先创建虚拟磁盘。这条命令是说将C7域克隆一个叫C7-1的域，创建的镜像文件在/data目录下，叫c7_1.img。克隆时要关闭虚拟机。如果有多个磁盘，要用多个-f选项指定
# 克隆的问题是都会使用同样的VNC端口，这样就不能将所有克隆虚拟机都启动，需要使用"virsh edit 虚拟机名"，打开虚拟机的配置文件，找到VNC的端口号并修改。之后保存退出才能启动。
```



### 快照

```shell
* 创建
virsh snapshot-create C7
# 创建域名叫C7的快照；快照配置文件在/var/lib/libvirt/qemu/snapshot/虚拟机名称/下
virsh snapshot-list C7
# 查看C7域的快照
virsh snapshot-current
# 查看当前虚拟机镜像快照的版本

* 恢复虚拟机快照
# 恢复虚拟机快照必须关闭虚拟机。
virsh domstate winxp
# 确认虚拟机状态
virsh snapshot-revert winxp 1515577720
# 恢复快照。1515577720是winxp快照的名字，如果有多个快照，要先用virsh snapshot-list winxp查看快照名字
qemu-img info winxp.img
# 查看镜像的快照名字，可能有多个

* 删除
virsh snapshot-delete winxp 1515577720
# 删除winxp的叫1515577720的快照
```



### 重命名虚拟机

```shell
1. 关闭虚拟机
2. 导出虚拟机配置文件
cd /etc/libvirt/qemu/
# 到虚拟机配置文件目录
virsh dumpxml Ytest > openvpn.xml
# 导出配置文件，叫openvpn.xml
virsh snapshot-delete Ytest 1540542652
# 先删除之前的虚拟机快照，如果不删除快照是不能删除虚拟机的
virsh undefine Ytest
# 删除虚拟机
vim openvpn.xml
    <domain type='kvm'>
      <name>openvpn</name>	# 修改虚拟机的名字
    .......
    <disk type='file' device='disk'>
          <driver name='qemu' type='qcow2' cache='none'/>
          <source file='/home/IOS/openvpn/openvpn.img'/>	# 修改虚拟机磁盘的路径
cd /home/IOS
mv Ytest/ openvpn
mv Ytest.img openvpn.img
# 修改之前的虚拟机的目录名称与磁盘文件名称
virsh define openvpn.xml
# 再加载新命名的虚拟机的配置文件
virsh list --all
# 查看是否有新命名的虚拟机
virsh start openvpn
# 启动新命名的虚拟机
```



### 修改虚拟机硬件配置

```shell
[root@ccjd qemu]# virsh edit gitlab
# 修改虚拟机配置文件
    <domain type='kvm'>
      <name>gitlab</name>
      <uuid>77890890-312b-bfed-83ed-c53665cf86d1</uuid>
      <memory unit='KiB'>8192000</memory>
      <currentMemory unit='KiB'>8192000</currentMemory>
      <vcpu placement='static'>4</vcpu>
# 8192000为内存大小，4为CPU核心数。修改后保存，再启动虚拟机即可。
```



### 给KVM虚拟机添加磁盘

```shell
1. cd /home/IOS/RHEL7
2. qemu-img create -f raw RHEL7_1.img 10G
# 创建一个磁盘，格式是raw
3. virsh edit RHEL7
    <disk type='file' device='disk'>
      <driver name='qemu' type='raw' cache='none'/>
      <source file='/home/IOS/RHEL/RHEL7_1.img'/>
      <target dev='sda' bus='scsi'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
    <disk type='file' device='disk'>
      <driver name='qemu' type='raw' cache='none'/>
      <source file='/home/IOS/RHEL/RHEL7_2.img'/>
      <target dev='hda' bus='ide'/>
      <address type='drive' controller='0' bus='0' target='0' unit='1'/>
    </disk>
# 原来的硬盘是hda，bus是ide，如果新磁盘与原磁盘一样是ide的，那么要改下面的unit的数字，不一样就可以，不然无法启动。如果磁盘类型不一样，可以直接改类型即可，如上面的类型就是 <target dev='sda' bus='scsi'/>，unit是按类型向下编号的，不一样就可以。
4. tail -100 /var/log/libvirt/qemu/RHEL7.log
# 如果不能启动，可以查看此日志，寻找原因。日志是以虚拟机名命名的。
```



### kvm开启虚拟化

```shell
# 先检查 KVM host（宿主机/母机）上的kvm_intel模块是否打开了嵌套虚拟机功能（默认是开启的）：
1. modinfo kvm_intel | grep nested
      parm: nested:bool
2. cat /sys/module/kvm_intel/parameters/nested
      Y
3. 如果上面的显示结果不是 Y 的话需要开启 nested：
modprobe -r kvm-intel
modprobe kvm-intel nested=1
cat /sys/module/kvm_intel/parameters/nested
    Y
4. 如果使用libvirt管理虚拟机,需要修改虚拟机xml文件中CPU的定义,下面定义方法都可以:
* 方法一
virsh edit debian9.3
  <cpu mode='custom' match='exact'>
    <model fallback='allow'>core2duo</model>
    <feature policy='require' name='vmx'/>	# 添加这一行
  </cpu>
#这种方式为虚拟机定义需要模拟的CPU类型"core2duo",并且为虚拟机添加"vmx"特性

* 方法二
  <cpu mode='host-model'>
    <model fallback='allow'/>
  </cpu>
# 参考：https://www.cnblogs.com/chimeiwangliang/p/7862229.html
```



### 虚拟机静态迁移

```shell
* 静态迁移就是虚拟机在关机状态下，拷贝虚拟机虚拟磁盘文件与配置文件到目标虚拟主机中，实现的迁移。
# 虚拟主机各自使用本地存储存放虚拟机磁盘文件。本文实现基于本地磁盘存储虚拟机磁盘文件的迁移方式。虚拟主机之间使用共享存储存放虚拟机磁盘文件，该方式只是在目标虚拟主机上重新定义虚拟机就可以了。
1. 先确定虚拟机关机
virsh list --all
2. 准备迁移winxp虚拟机，查看此虚拟机配置的磁盘文件
virsh domblklist winxp
3. 导出虚拟机配置文件
virsh dumpxml winxp > /root/winxp.xml
4. 拷贝配置文件到目标虚拟主机上
scp /root/winxp.xml root@192.168.1.11:/etc/libvirt/qemu/
5. 拷贝虚拟机磁盘文件到目标虚拟机
scp winxp.img root@192.168.1.11:/data
6. 到目标主机上查看。目标主机的目录结构要与源虚拟主机一致
7. 定义注册虚拟主机
virsh define /etc/libvirt/qemu/winxp.xml
8. 启动虚拟机
virsh start winxp
```



### 配置文件

```shell
/etc/libvirt
# qemu配置文件位置 
/etc/libvirt/qemu
# 虚拟机配置文件位置
```



### 问题解决

#### VNC软件无法正常连接

1.  在windows主机上安装VNC Viewer，使用此软件打开虚拟机。另外，用此工具连接后可能会有错误提示“ZlibInStream:Inflate Failed”，并且不断刷新页面，无法正常进入。如下：

![](/images/KVM/winconnect1.jpg)

2. 设置图像，从高到低试，测试时选择High就可以正常连接了。

![](/images/KVM/winconnect2.jpg)

![](/images/KVM/winconnect3.jpg)



#### virt-manager键盘输入错乱

1. 需要在Details中的VNC中选择en-us

![](/images/KVM/vncconnect1.jpg)



#### 从远程打开KVM的图形管理页面

```shell
* CentOS6.6系统
yum groupinstall "X 窗口系统"
# 远程连接服务器，使用ssh -X IP
virt-manager
错误提示：
    ”process 63345: D-Bus library appears to be incorrectly set up; failed to read machine uuid: Failed to open "/var/lib/dbus/machine-id": 没有那个文件或目录
    See the manual page for dbus-uuidgen to correct this issue.
      D-Bus not built with -rdynamic so unable to print a backtrace“
```

![](/images/KVM/openkvm.jpg)

```shell
解决办法：
dbus-uuidgen > /var/lib/dbus/machine-id
# 执行此命令后就可以远程打开virt-manager了，但是乱码

yum groupinstall "中文支持"
# 安装完中文后，乱码就解决了。
```



#### 报错error: unsupported configuration: Unable to find security driver for label selinux

```shell
virsh edit 虚拟机名
# 删除最后有selinux的行，再启动就没问题了。
```

