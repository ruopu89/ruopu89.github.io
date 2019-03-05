---
title: LVS部署
date: 2019-01-28 18:18:42
tags: lvs
categories: balance
---

### 介绍

> LVS是 Linux Virtual Server 的简称，也就是Linux虚拟服务器。这是一个由章文嵩博士发起的一个开源项目，它的官方网是 http://www.linuxvirtualserver.org 现在 LVS 已经是 Linux 内核标准的一部分。使用 LVS 可以达到的技术目标是：通过 LVS 达到的负载均衡技术和 Linux 操作系统实现一个高性能高可用的 Linux 服务器集群，它具有良好的可靠性、可扩展性和可操作性。从而以低廉的成本实现最优的性能。LVS 是一个实现负载均衡集群的开源软件项目，LVS架构从逻辑上可分为调度层、Server集群层和共享存储。



### LVS的基本工作原理

![](/images/lvs/基本工作原理.png)

> 1. 当用户向负载均衡调度器（Director Server）发起请求时，调度器将请求发往至内核空间
>
> 2. PREROUTING链首先会接收到用户请求，判断目标IP确定是本机IP，将数据包发往INPUT链
>
> 3. IPVS是工作在INPUT链上的，当用户请求到达INPUT时，IPVS会将用户请求和自己已定义好的集群服务进行比对，如果用户请求的就是定义的集群服务，那么此时IPVS会强行修改数据包里的目标IP地址及端口，并将新的数据包发往POSTROUTING链
>
> 4. POSTROUTING链接收数据包后发现目标IP地址刚好是自己的后端服务器，那么此时通过选路，将数据包最终发送给后端的服务器



### LVS的组成

> LVS 由两部分程序组成，包括 ipvs 和 ipvsadm。
>
> 1. ipvs(ip virtual server)：一段代码工作在内核空间，叫ipvs，是真正生效实现调度的代码。
>
> 2. ipvsadm：在用户空间，负责为ipvs内核框架编写规则，定义谁是集群服务，而谁是后端真实的服务器(Real Server)



### LVS相关术语

> 1. DS：Director Server。前端负载均衡器节点。
> 2. RS：Real Server。后端真实的工作服务器。
> 3. VIP：向外部直接面向用户请求，作为用户请求的目标的IP地址。
> 4. DIP：Director Server IP，前端负载均衡器节点上用于和内部主机通讯的IP地址。
> 5. RIP：Real Server IP，后端服务器的IP地址。
> 6. CIP：Client IP，访问客户端的IP地址。



### LVS/NAT原理和特点

![](/images/lvs/nat原理.png)

> 1. 当用户请求到达Director Server，此时请求的数据报文会先到内核空间的PREROUTING链。 此时报文的源IP为CIP，目标IP为VIP
> 2. PREROUTING检查发现数据包的目标IP是本机，将数据包送至INPUT链
> 3. IPVS比对数据包请求的服务是否为集群服务，若是，修改数据包的目标IP地址为后端服务器IP，然后将数据包发至POSTROUTING链。 此时报文的源IP为CIP，目标IP为RIP
> 4. POSTROUTING链通过选路，将数据包发送给Real Server
> 5. Real Server比对发现目标为自己的IP，开始构建响应报文发回给Director Server。 此时报文的源IP为RIP，目标IP为CIP
> 6. Director Server在响应客户端前，此时会将源IP地址修改为自己的VIP地址，然后响应给客户端。 此时报文的源IP为VIP，目标IP为CIP



#### LVS-NAT模型的特性

> 1. RS应该使用私有地址，RS的网关必须指向DIP
> 2. DIP和RIP必须在同一个网段内
> 3. 请求和响应报文都需要经过Director Server，高负载场景中，Director Server易成为性能瓶颈
>    支持端口映射
> 4. RS可以使用任意操作系统
> 5. 缺陷：对Director Server压力会比较大，请求和响应都需经过director server



### LVS/DR原理和特点

![](/images/lvs/dr原理.png)

> 1. 当用户请求到达Director Server，此时请求的数据报文会先到内核空间的PREROUTING链。 此时报文的源IP为CIP，目标IP为VIP
> 2. PREROUTING检查发现数据包的目标IP是本机，将数据包送至INPUT链
> 3. IPVS比对数据包请求的服务是否为集群服务，若是，将请求报文中的源MAC地址修改为DIP的MAC地址，将目标MAC地址修改RIP的MAC地址，然后将数据包发至POSTROUTING链。 此时的源IP和目的IP均未修改，仅修改了源MAC地址为DIP的MAC地址，目标MAC地址为RIP的MAC地址
> 4. 由于DS和RS在同一个网络中，所以是通过二层来传输。POSTROUTING链检查目标MAC地址为RIP的MAC地址，那么此时数据包将会发至Real Server。
> 5. RS发现请求报文的MAC地址是自己的MAC地址，就接收此报文。处理完成之后，将响应报文通过lo接口传送给eth0网卡然后向外发出。 此时的源IP地址为VIP，目标IP为CIP
> 6. 响应报文最终送达至客户端



#### LVS-DR模型的特性

> 特点
> 1. 保证前端路由将目标地址为VIP报文统统发给Director Server，而不是RS
> 2. RS可以使用私有地址；也可以是公网地址，如果使用公网地址，此时可以通过互联网对RIP进行直接访问
> 3. RS和Director Server必须在同一个物理网络中
> 4. 所有的请求报文经由Director Server，但响应报文必须不能经过Director Server
> 5. 不支持地址转换，也不支持端口映射
> 6. RS可以是大多数常见的操作系统
> 7. RS的网关绝不允许指向DIP(因为我们不允许他经过director)
> 8. RS上的lo接口配置VIP的IP地址
> 9. 缺陷：RS和DS必须在同一机房中
> 10. 企业中最常用的是 DR 模型
>
> 解决
>
> 1. 在前端路由器做静态地址路由绑定，将对于VIP的地址仅路由到Director Server。但用户未必有路由操作权限，因为有可能是运营商提供的，所以这个方法未必实用
> 2. arptables：在arp的层次上实现在ARP解析时做防火墙规则，过滤RS响应ARP请求。这是由iptables提供的。修改RS上内核参数（arp_ignore和arp_announce），将RS上的VIP配置在lo接口的别名上，并限制其不能响应对VIP地址解析请求。



### LVS/Tun原理和特点

![](/images/lvs/tun原理.png)

> 1. 当用户请求到达Director Server，此时请求的数据报文会先到内核空间的PREROUTING链。 此时报文的源IP为CIP，目标IP为VIP 。
> 2. PREROUTING检查发现数据包的目标IP是本机，将数据包送至INPUT链
> 3. IPVS比对数据包请求的服务是否为集群服务，若是，在请求报文的首部再次封装一层IP报文，封装源IP为为DIP，目标IP为RIP。然后发至POSTROUTING链。 此时源IP为DIP，目标IP为RIP
> 4. POSTROUTING链根据最新封装的IP报文，将数据包发至RS（因为在外层封装多了一层IP首部，所以可以理解为此时通过隧道传输）。 此时源IP为DIP，目标IP为RIP
> 5. RS接收到报文后发现是自己的IP地址，就将报文接收下来，拆除掉最外层的IP后，会发现里面还有一层IP首部，而且目标是自己的lo接口VIP，那么此时RS开始处理此请求，处理完成之后，通过lo接口送给eth0网卡，然后向外传递。 此时的源IP地址为VIP，目标IP为CIP
> 6. 响应报文最终送达至客户端



#### LVS-Tun模型特性

> 1. RIP、VIP、DIP全是公网地址
> 2. RS的网关不会也不可能指向DIP
> 3. 所有的请求报文经由Director Server，但响应报文必须不能进过Director Server
> 4. 不支持端口映射
> 5. RS的系统必须支持隧道



### LVS的八种调度算法

#### 轮叫调度 rr

> 这种算法是最简单的，就是依次将请求调度到不同的服务器上，该算法最大的特点就是简单。轮询算法假设所有的服务器处理请求的能力都是一样的，调度器会将所有的请求平均分配给每个真实服务器，不管后端 RS 配置和处理能力，非常均衡地分发下去。



####  加权轮叫 wrr

> 这种算法比 rr 的算法多了一个权重的概念，可以给 RS 设置权重，权重越高，那么分发的请求数越多，权重的取值范围 0 – 100。主要是对rr算法的一种优化和补充， LVS 会考虑每台服务器的性能，并给每台服务器添加权值，如果服务器A的权值为1，服务器B的权值为2，则调度到服务器B的请求会是服务器A的2倍。权值越高的服务器，处理的请求越多。



####  最少链接 lc

> 这个算法会根据后端 RS 的连接数来决定把请求分发给谁，比如 RS1 连接数比 RS2 连接数少，那么请求就优先发给 RS1



#### 加权最少链接 wlc

> 这个算法比 lc 多了一个权重的概念。



#### 基于局部性的最少连接调度算法 lblc

> 这个算法是请求数据包的目标 IP 地址的一种调度算法，该算法先根据请求的目标 IP 地址寻找最近的该目标 IP 地址所有使用的服务器，如果这台服务器依然可用，并且有能力处理该请求，调度器会尽量选择相同的服务器，否则会继续选择其它可行的服务器



#### 复杂的基于局部性最少的连接算法 lblcr

> 记录的不是目标 IP 与一台服务器之间的连接记录，而是维护一个目标 IP 到一组服务器之间的映射关系，防止单点服务器负载过高。

#### 

#### 目标地址散列调度算法 dh

> 该算法是根据目标 IP 地址通过散列函数将目标 IP 与服务器建立映射关系，出现服务器不可用或负载过高的情况下，发往该目标 IP 的请求会固定发给该服务器。



#### 源地址散列调度算法 sh

> 与目标地址散列调度算法类似，但它是根据源地址散列算法进行静态分配固定的服务器资源。



### 部署LVS/NAT模型

```shell
==============================================================================================
环境
准备三台主机
director：外网地址：192.168.1.26；内网地址：172.16.106.140
realServer1：内网地址：172.16.106.142
realServer2：内网地址：172.16.106.141
==============================================================================================
---------------------
  realServer1&2
---------------------
[root@realserver1 ~]# vim /etc/sysconfig/network-scripts/ifcfg-ens33
IPADDR=172.16.106.142
# realServer2主机的地址为172.16.106.141
NETMASK=255.255.255.0
GATEWAY=172.16.106.140
# 配置两台realServer主机的地址为静态地址，并将网关指向director的内网地址。
[root@realserver2 ~]# yum install -y nginx
# 两台主机需要安装nginx，可以临时添加dirctor的防火墙规则，iptables -t nat -A POSTROUTING -s 172.16.106.0/24 -j SNAT --to-source 192.168.1.26，并开启路由转发功能，echo 1 > /proc/sys/net/ipv4/ip_forward，最后为realServer配置DNS。这样realServer就可以连接外网了。安装nginx后再取消director的防火墙规则。
[root@realserver1 ~]# mkdir /usr/share/nginx/html/test
[root@realserver1 ~]# vim /usr/share/nginx/html/test/index.html
	realServer1
# 在两台主机上添加主面测试文件，一个是realServer1，一个是realServer2
[root@realserver1 ~]# systemctl start nginx

--------------
  Director
--------------
[root@director ~]# yum install -y ipvsadm
#!/bin/bash
#
echo 1 > /proc/sys/net/ipv4/ip_forward
echo 0 > /proc/sys/net/ipv4/conf/all/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/default/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/eth0/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/eth1/send_redirects
[root@director ~]# ipvsadm -A -t 192.168.1.26:80 -s wrr
[root@director ~]# ipvsadm -a -t 192.168.1.26:80 -r 172.16.106.142:80 -m -w 1
[root@director ~]# ipvsadm -a -t 192.168.1.26:80 -r 172.16.106.141:80 -m -w 1
[root@director ~]# ipvsadm -ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  192.168.1.26:80 wrr
  -> 172.16.106.141:80            Masq    1      1          0         
  -> 172.16.106.142:80            Masq    1      1          0  
 [root@director ~]# ipvsadm -C
 # 清除所有ipvs规则
---------
  本机
---------
使用IE浏览器访问192.168.1.26/test/，会轮流返回realServer上的页面内容。不能使用realServer访问，访问超时，不会返回结果
```



### 部署LVS/DR模型

```shell
环境
准备三台主机，以上面三台主机为基础
director：外网地址：192.168.1.26
realServer1：内网地址：192.168.1.27
realServer2：内网地址：192.168.1.28
VIP：192.168.1.260

--------------
  Director
--------------
[root@director ~]# ipvsadm -C
[root@director ~]# vim lvs_dr.sh
#! /bin/bash
#
echo 1 > /proc/sys/net/ipv4/ip_forward
vip=192.168.1.60
rs1=192.168.1.27
rs2=192.168.1.28
ifconfig ens33:0 down
ifconfig ens33:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip dev ens33:0
[root@director ~]# ipvsadm -A -t 192.168.1.60:80 -s wrr
[root@director ~]# ipvsadm -a -t 192.168.1.60:80 -r 192.168.1.27 -g -w 1
[root@director ~]# ipvsadm -a -t 192.168.1.60:80 -r 192.168.1.28 -g -w 1
[root@director ~]# ipvsadm -ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  192.168.1.60:80 wrr
  -> 192.168.1.27:80              Route   1      0          0         
  -> 192.168.1.28:80              Route   1      0          0
  
---------------------
  realServer1&2
---------------------
[root@realserver1 ~]# vim lvs_dr_rs.sh 
#! /bin/bash
#
vip=192.168.1.60
ifconfig lo:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip lo:0
echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce

---------
  本机
---------
使用IE浏览器访问192.168.1.26/test/，会轮流返回realServer上的页面内容。不能使用realServer访问，访问超时，不会返回结果
```



### 部署keepalived+LVS环境

```shell
环境
准备四台主机，以上面三台主机为基础
director1：外网地址：192.168.1.26
director2：外网地址：192.168.1.26
realServer1：内网地址：192.168.1.27
realServer2：内网地址：192.168.1.28
VIP：192.168.1.260

------------------
  Director1&2
------------------
[root@director keepalived]# ifconfig ens33:0 down
# down掉director1上的ens33:0网卡，因为此网卡上有VIP地址。影响下面的keepalived测试
[root@realserver2 ~]# yum install -y ipvsadm keeyalived
[root@director ~]# cd /etc/keepalived/
[root@director keepalived]# cp keepalived.conf{,.bak}
[root@director keepalived]# vim keepalived.conf
! Configuration File for keepalived

global_defs {
   notification_email {
      root@localhost
   }
   notification_email_from keepalived@localhost
   smtp_server 127.0.0.1
   smtp_connect_timeout 30
   router_id node1		# # director2这里要改为node2
   vrrp_mcast_group4 224.1.101.12
}
vrrp_instance VI_1 {
    state MASTER		# director2这里要改为BACKUP
    interface ens33
    virtual_router_id 51
    priority 100		# dirctor2这里要改为96
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.1.60 dev ens33 label ens33:0
    }
}
virtual_server 192.168.1.60 80 {
    delay_loop 1
    lb_algo wrr
    lb_kind DR
    protocol TCP

    real_server 192.168.1.27 80 {
        weight 1
           TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }
    real_server 192.168.1.28 80 {
        weight 1
           TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }
}
[root@director keepalived]# echo 1 > /proc/sys/net/ipv4/ip_forward
[root@director keepalived]# systemctl start keepalived
# 启动keepalived后，会自动生成ipvs规则
[root@director keepalived]# tcpdump -i ens33 -vv -nn host 224.1.101.12
#这时可以看到探测信息，这是拥有VIP地址的主机发来的。
[root@director keepalived]# ip a
# 可以看到VIP在director1上
[root@director keepalived]# ipvsadm -ln
# 查看是否生成了ipvs规则，如果未生成，可以用下面命令
[root@director keepalived]# ipvsadm -A -t 192.168.1.60:80 -s wrr
# 生成一个虚拟服务器，用加权轮询算法
[root@director keepalived]# ipvsadm -a -t 192.168.1.60:80 -r 192.168.1.27:80 -g -w 1
[root@director keepalived]# ipvsadm -a -t 192.168.1.60:80 -r 192.168.1.28:80 -g -w 1
# 将realserver加入到虚拟服务器中，-g表示使用DR直接路由，-w指定权重。
[root@director keepalived]# ipvsadm -E -t 10.5.5.140:9999 -s wrr
# 修改调度算法

---------------------
  realServer1&2
---------------------
[root@realserver1 ~]# vim lvs_dr_rs.sh 
#! /bin/bash
#
vip=192.168.1.60
ifconfig lo:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip lo:0
echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce

---------
  本机
---------
使用IE浏览器访问192.168.1.26/test/，会轮流返回realServer上的页面内容。不能使用realServer访问，访问超时，不会返回结果。使用命令：
root@ru:ruopu.gitb#for i in `seq 10000`;do curl 192.168.1.60/test/ && echo $i;done
也会返回两台服务器的页面内容。这时如果停止一台keepalived，VIP地址会转移到另一台上，访问还会继续
```

