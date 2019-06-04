---
title: ip命令的使用
date: 2018-09-27 08:37:10
tags: ip命令
categories: 网络
---

# 安装

```shell
yum install -y iproute
rpm -qi iproute
#这个软件的版本与内核版本是一样的，因为它要将信息写入内核
```

# 语法

```shell
ip [ OPTIONS ] OBJECT { COMMAND | help }
#OBJECT := { link | addr | route | netns }
#OBJECT可简写，各OBJECT的子命令也可简写；
```

# 使用方法

## link

### 语法

```shell
ip  link  set - change device attributes
#网络设备配置，set是修改设备属性
	dev NAME (default)：指明要管理的设备，dev关键字可省略；
	up和down：
	multicast on或multicast off：启用或禁用多播功能；
	name NAME：重命名接口
	mtu NUMBER：设置MTU的大小，默认为1500；
	netns PID：ns为namespace，用于将接口移动到指定的网络名称空间；只能在centos7上做
	address：改地址
ip  link  show  - display device attributes
#show是显示设备属性的，state是状态。显示的是二层设备属性的，与IP无关
ip  link  help -  显示简要使用帮助；
```

### 例

```shell
ip link set eth1 down/up
#关闭或开启eth1网卡
ip link set eth1 multicast off/on
#关闭或开启多播功能
ip link set eth2 down
ip link set eth1 name eno6668889999
#先down掉网卡再改名，不然会报错
ip netns list
#查看网络空间名称
ip link add mynet
#添加一个叫mynet的网络空间
ip link set eno16777736 netns mynet
#将16777736放入mynet空间
ip netns exec mynet ip link show
#这时用普通的命令是查看不到16777736网卡的，用此命令才能查看到此网卡，这像是一个虚拟机一样。这是用来创建虚拟网络的
ip netns del mynet
#删除网络空间
```

## netns

### 语法

```shell
ip netns：  - manage network namespaces.
				
ip netns list
#列出所有的netns
ip netns add NAME
#创建指定的netns
ip netns del NAME
#删除指定的netns
ip netns exec NAME COMMAND
#在指定的netns中运行命令
```

## address

### 语法

```shell
ip address - protocol address management.
					
ip address add - add new protocol address
ip addr add IFADDR dev IFACE
    [label NAME]：为额外添加的地址指明接口别名；
    [broadcast ADDRESS]：广播地址；会根据IP和NETMASK自动计算得到；
    [scope SCOPE_VALUE]：路由的范围，主要是 link ，是与本设备有关的直接连接。
        global：全局可用；
        link：接口可用；
        host：仅本机可用；
    [proto]：此路由的路由协定，主要有 redirect, kernel, boot, static, ra 等， 其中 kernel 指的是直接由核心判断自动设定。 

        
ip address delete - delete protocol address
ip addr  delete  IFADDR  dev  IFACE 
							
ip address show - look at protocol addresses
ip addr list  [IFACE]：显示接口的地址；
						
ip address flush - flush protocol addresses
ip addr flush dev IFACE
#清空接口上的所有地址
```

### 例

```shell
ip addr show
#显示所有IP地址
ip addr list
ifconfig eth1 0
#删除eth1上的地址
ip addr add 192.168.1.22/24 dev eno16777736
#添加地址，可以在一块网卡上添加多个地址，只有在一个网段的地址上才会有secondary，不同网段不会有。添加的地址用ifconfig是显示不了的，如果要显示需要加接口别名
ip addr add 192.168.1.43/24 dev eno16777736 lable eno16777736:0
#这样用ifconfig就能显示了
ip link show
#这样可以查看到地址
ip addr del 192.168.1.43/24 dev eno16777736
#删除地址
ip addr flush dev eth1
#清空eth1上的所有地址
```

## route

### 语法

```shell
ip route - routing table management
				
ip route add - add new route
#添加路由
ip route change - change route
#修改路由
ip route delete - delete route
ip  route  del  TYPE PRIFIX
#删除路由
ip route show - list routes
#显示路由	
ip route flush - flush routing tables
#清空路由表
ip route get - get a single route
ip route get TYPE PRIFIX
#获取单条路由
ip route replace - change or add new one
#替换路由，有老的就改老的，没有就加新的
ip route add TYPE PREFIX  via GW  [dev  IFACE]  [src SOURCE_IP]
ip route add default via GW	
#添加默认网关
```

### 例

```shell
ip route add 192.168.0.0/24 via 10.0.0.1 dev eth1 src 10.0.20.100
#添加一条到192.168.0.0/24网络的路由，（via是指明下一跳地址的）下一跳的地址是10.0.0.1，设备是eth1，源地址是10.0.20.100。（src指定源地址，源地址应该是本地网卡上的地址中的一个）也就是本机地址是10.0.20.100，如果想到达192的网络，就要通过eth1设备，走10.0.0.1这个网关。
ip route delete 192.168.1.0/24
ip route get 192.168.0.0/24
ip route list
#显示路由
ip route add 192.168.122.0/24 via 192.168.1.10 dev eno16777736 src 192.168.1.109
#有两个虚拟机，分别位于两台主机上，一台主机地址是192.168.1.10，一台是192.168.1.4，10主机上的虚拟机是用NAT方式联网的，地址是192.168.122.103/24；4主机上的虚拟机是桥接联网的，地址是192.168.1.109/24。现在要用109地址ssh登录192.168.122.103.添加路由，意为到192.168.122.0网络的下一跳地址是192.168.1.10，通过本机的eno16777736网卡，源地址是192.168.1.109。加完此条路由后，可以ping通192.168.122.1，但ping 192.168.122.103时显示Destination Port Unreachable。原因是在192.168.1.10的ubuntu主机上有iptables规则，用/sbin/iptables -F清除规则后，暂时解决了问题
ip route add default via 172.16.0.1 dev eno16777736
#添加默认网关
ip route delete 192.168.1.0/24
#删除到192网络的路由
ip route show src 172.16.100.6
#只显示源地址是172的路由条目
ip route get 192.168.0.0/24
#显示到192网络的路由
ip route flush 10/8
#清除10开头的网络路由，如果删除不了，就要将地址写的再详细些
```



## 策略路由

### 设置策略路由

```shell
问题：在某服务器上安装CentOS7.3系统，配置两个网段的IP地址，一为10.129.14.16/27，一为10.129.14.40/27。客户端使用10.129.27/27，网关10.129.14.1。使用客户端ping服务器两地址时，只能ping能10.129.14.16/27，ping10.129.14.40/27时页面停住不动，查看服务器，应该是ping包可以到达服务器，但无法返回。

解决：
1. 配置服务器网卡
vim /etc/sysconfig/network-scripts/ifcfg-enp96s0f0
TYPE="Ethernet"
BOOTPROTO=none
DEFROUTE="yes"
NAME="enp96s0f0"
UUID="5f90c86f-c21f-489e-ae8f-cf36e6eac588"
DEVICE="enp96s0f0"
ONBOOT="yes"
DNS1="202.96.209.6"
DNS2="202.96.209.133"
IPADDR=10.129.14.16
PREFIX=27
#GATEWAY=10.129.14.1
# 注释网卡配置中的GATEWAY一项，多块网卡都要注释

2. 配置策略路由表
vim /etc/iproute2/rt_tables 
252 enp96s0f1-32
251 enp96s0f0-0
# 加入上面两行，前面的数字是路由表的编号，后面是自定义的表名。路由表的编号是自定义的，但linux最多可管理255个表，不要超过这个数字，另外，rt_table中原有的编号不要动，自定义的表编号也不要与原有的编号冲突。

3. 配置策略路由
# 将路由规则加入CentOS7中的/etc/rc.d/init.d/network中可以使重启网卡时路由依然生效，方法如下
vim /etc/rc.d/init.d/network
ip route flush table enp96s0f0-0
# 先清空策略路由表
ip route add default via 10.129.14.1 dev enp96s0f0 src 10.129.14.16 table enp96s0f0-0
# 添加一条策略路由规则，下一跳到10.129.14.1，网卡是enp96s0f0，源地址为10.129.14.16，添加到策略路由表enp96s0f0-0
ip rule add from 10.129.14.16 table enp96s0f0-0
# 将从10.129.14.16经过的数据包都从enp96s0f0-0策略路由表中走
ip route flush table enp96s0f1-32
ip route add default via 10.129.14.33 dev enp96s0f1 src 10.129.14.40 table enp96s0f1-32
ip rule add from 10.129.14.40 table enp96s0f1-32

ip route add default via 10.129.14.1 dev enp96s0f0

exit $rc
# 这里要注意，一定要添加在最后一行的exit $rc之上。
systemctl daemon-reload
systemctl restart network
ip route
# 查看路由，加入的默认路由生效了
ip rule
# 查看生效的策略路由表
# 最后，测试的机器上也要加一条到某网段的路由，如sudo ip route add 10.129.14.32/27 via 10.129.14.1。因为默认会从无线走如果不加这条路由规则，就要将无线断开或删除这条默认路由
# 这时客户端就可以ping通服务器的两个ip地址了
```



### 查看策略

```shell
ip route show table all
# 显示所有路由表
ip rule
# 显示所有转发策略
ip route list table eno2
# 显示某个策略路由表的规则
ip route list table all
# 显示全部策略路由表
```

