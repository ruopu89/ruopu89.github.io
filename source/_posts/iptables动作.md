---
title: iptables动作
date: 2018-10-16 09:01:54
tags: iptables动作
categories: 防火墙
---

> "动作"与"匹配条件"一样，也有"基础"与"扩展"之分。同样，使用扩展动作也需要借助扩展模块，但是，扩展动作可以直接使用，不用像使用"扩展匹配条件"那样指定特定的模块。

#### REJECT

```shell
# 常用选项为--reject-with
# 可用值如下:
# icmp-net-unreachable
# icmp-host-unreachable
# icmp-port-unreachable,
# icmp-proto-unreachable
# icmp-net-prohibited
# icmp-host-pro-hibited
# icmp-admin-prohibited
# 当不设置任何值时，默认值为icmp-port-unreachable。

[root@localhost ~]# iptables -I INPUT -j REJECT
# 拒绝所有主机访问本机
[root@localhost ~]# ping 10.5.5.90
PING 10.5.5.90 (10.5.5.90) 56(84) bytes of data.
From 10.5.5.90 icmp_seq=1 Destination Port Unreachable
From 10.5.5.90 icmp_seq=2 Destination Port Unreachable
# 这时用其他主机ping本机提示是“Destination Port Unreachable”

[root@localhost ~]# iptables -I INPUT -p tcp --dport 22 -j ACCEPT
[root@localhost ~]# iptables -A INPUT -j REJECT --reject-with icmp-host-unreachable
# 修改提示信息为“icmp-host-unreachable”
[root@localhost ~]# ping 10.5.5.90
PING 10.5.5.90 (10.5.5.90) 56(84) bytes of data.
From 10.5.5.90 icmp_seq=1 Destination Host Unreachable
From 10.5.5.90 icmp_seq=2 Destination Host Unreachable
# 用其他主机ping本机时提示已改为“Destination Host Unreachable”
```

#### LOG

```shell
# 使用LOG动作，可以将符合条件的报文的相关信息记录到日志中，但当前报文具体是被"接受"，还是被"拒绝"，都由后面的规则控制

# --log-level选项可以指定记录日志的日志级别，可用级别有emerg，alert，crit，error，warning，notice，info，debug。
# --log-prefix选项可以给记录到的相关信息添加"标签"之类的信息，以便区分各种记录到的报文信息，方便在分析时进行过滤。--log-prefix对应的值不能超过29个字符。

* 基本设置
[root@localhost ~]# iptables -I INPUT -p tcp --dport 22 -j LOG
# 上述规则表示所有发往22号端口的tcp报文都符合条件，所以都会被记录到日志中，查看/var/log/messages即可看到对应报文的相关信息。但是上述规则只是用于示例，因为上例中使用的匹配条件过于宽泛。所以在使用LOG动作时，匹配条件应该尽量写的精确一些，匹配到的报文数量也会大幅度的减少，这样冗余的日志信息就会变少，同时日后分析日志时，日志中的信息可用程度更高。
[root@localhost ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 48 packets, 4200 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1          46     3296 LOG        tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22 LOG flags 0 level 4
[root@localhost ~]# tail -f /var/log/messages 
Oct 16 17:27:36 localhost kernel: IN=eno16777736 OUT= MAC=00:0c:29:45:17:9b:50:7b:9d:65:f9:ff:08:00 SRC=10.5.5.23 DST=10.5.5.90 LEN=40 TOS=0x00 PREC=0x00 TTL=64 ID=2314 DF PROTO=TCP SPT=51108 DPT=22 WINDOW=16243 RES=0x00 ACK URGP=0 
Oct 16 17:27:37 localhost kernel: IN=eno16777736 OUT= MAC=00:0c:29:45:17:9b:50:7b:9d:65:f9:ff:08:00 SRC=10.5.5.23 DST=10.5.5.90 LEN=92 TOS=0x00 PREC=0x00 TTL=64 ID=2323 DF PROTO=TCP SPT=51108 DPT=22 WINDOW=16243 RES=0x00 ACK PSH URGP=0
# LOG动作默认会将报文的相关信息记录在/var/log/message文件中
[root@localhost ~]# vim /etc/rsyslog.conf
	kern.warning /var/log/iptables.log
# 加入上面一行，让iptables将日志记录在其他位置	
[root@localhost ~]# systemctl restart rsyslog
# 重启日志服务

* --log-prefix
[root@localhost ~]# iptables -I INPUT -p tcp --dport 22 -m state --state NEW -j LOG --log-prefix "want-in-from-port-22"
# 将主动连接22号端口的报文的相关信息都记录到日志中，并且把这类记录命名为"want-in-from-port-22"
[root@localhost ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 44 packets, 3150 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 LOG        tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22 state NEW LOG flags 0 level 4 prefix "want-in-from-port-22"
[root@localhost ~]# tail -f /var/log/iptables.log 
Oct 16 17:41:08 localhost kernel: want-in-from-port-22IN=eno16777736 OUT= MAC=00:0c:29:45:17:9b:00:0c:29:96:6b:bf:08:00 SRC=10.5.5.91 DST=10.5.5.90 LEN=60 TOS=0x00 PREC=0x00 TTL=64 ID=7879 DF PROTO=TCP SPT=42102 DPT=22 WINDOW=14600 RES=0x00 SYN URGP=0
# 使用其他主机连接本机时会有相关记录。这条日志中包含"标签"：want-in-from-port-22，如果有很多日志记录，我们就能通过这个"标签"进行筛选了，这样方便我们查看日志，同时，从上述记录中还能够得知报文的源IP与目标IP，源端口与目标端口等信息，从上述日志我们能够看出，10.5.5.91这个IP想要在17:41:08连接到10.5.5.91（当前主机的IP）的22号端口，报文由eno16777736网卡进入，eno16777736网卡的MAC地址为00:0c:29:45:17:9b，客户端网卡的mac地址为00:0c:29:96:6b:bf。
```

#### 测试源地址与目标地址转换

```shell
# 准备四台主机，一台主机为公网主机，一台为防火墙，两台为内网主机。使用公网主机通过防火墙访问内网linux服务器。
# A 公网主机IP：10.5.5.90
# B 防火墙IP：10.5.5.91、192.168.116.129
# C 内网linux服务器IP：192.168.116.130
# D 内网windows主机IP：192.168.116.131
# 将主机C和D的网关都指向B的内网地址，主机A和B的公网地址是桥接到宿主机的网卡上，打开B防火墙的路由功能ip_forward，在A和C主机上启动httpd服务。
```

##### SNAT

```shell
[root@localhost ~]# iptables -t nat -A POSTROUTING -s 192.168.116.0/24 -j SNAT --to-source 10.5.5.91
# 添加规则，让内网主机经过防火墙出去时的地址都改为防火墙的外网地址。"-t nat"表示操作nat表。filter表的功能是过滤，nat表的功能就是地址转换，所以我们需要在nat表中定义nat规则。"-A POSTROUTING"表示将SNAT规则添加到POSTROUTING链的末尾，在centos7中，SNAT规则只能存在于POSTROUTING链与INPUT链中，在centos6中，SNAT规则只能存在于POSTROUTING链中。"-j SNAT"表示使用SNAT动作，对匹配到的报文进行处理，对匹配到的报文进行源地址转换。"--to-source 10.5.5.91"表示将匹配到的报文的源IP修改为10.5.5.91
# 在centos7中，SNAT规则也可以定义在INPUT链中，我们可以这样理解，发往本机的报文经过INPUT链以后报文就到达了本机，如果再不修改报文的源地址，就没有机会修改了。
[root@localhost ~]# iptables -t nat --line -nvxL
Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 SNAT       all  --  *      *       192.168.116.0/24     0.0.0.0/0            to:10.5.5.91
# 配置上面的规则后就可以ping通外网主机了
* A
[root@localhost ~]# tcpdump -i eno16777736 -nn icmp
18:41:22.375035 IP 10.5.5.91 > 10.5.5.90: ICMP echo request, id 14189, seq 17, length 64
18:41:22.375090 IP 10.5.5.90 > 10.5.5.91: ICMP echo reply, id 14189, seq 17, length 64
# 这时在主机A上抓包，用C主机ping主机A，可以看到是10.5.5.91发来的数据。在主机C上也可以看到是主机A返回的信息。在C主机上抓包也可以看到是外网主机返回的信息
# 在A主机上不要添加到内网的路由，这样，在防火墙没有添加SNAT规则时，内外网是不能ping通的，当添加了SNAT规则后，内网主机就可以ping通外网了
```

##### DNAT

```shell
[root@localhost ~]# iptables -t nat -I PREROUTING -d 10.5.5.91 -p tcp --dport 3389 -j DNAT --to-destination 192.168.116.131:3389
# 加入一条规则，在PREROUTING链上，目标地址是防火墙的外网地址，端口是3389。目标地址转换为内网地址192.168.116.131:3389。实际就是地址与端口映射，将外网的地址与端口映射为内网的地址与端口
[root@localhost ~]# iptables -t nat --line -nvxL
Chain PREROUTING (policy ACCEPT 18 packets, 2657 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           1       52 DNAT       tcp  --  *      *       0.0.0.0/0            10.5.5.91            tcp dpt:3389 to:192.168.116.131:3389

Chain INPUT (policy ACCEPT 18 packets, 2657 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain POSTROUTING (policy ACCEPT 1 packets, 52 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           6      904 SNAT       all  --  *      *       192.168.116.0/24     0.0.0.0/0            to:10.5.5.91
# 配置内网windows主机可以远程访问，之后用本机远程连接10.5.5.91，也就是防火墙地址，这时是可以连接到内网主机192.168.116.131上的。
# 理论上只配置DNAT规则即可，但是如果在测试时无法正常DNAT，可以尝试配置对应的SNAT，此处按照配置SNAT的流程进行。SNAT规则与上面是一样的，就是将内网的主机出去的地址都改为防火墙的地址。

[root@localhost ~]# iptables -t nat -I PREROUTING -d 10.5.5.91 -p tcp --dport 8080 -j DNAT --to-destination 192.168.116.130:80
# 加一条端口映射，将外网的8080端口映射到内网的80端口上
# 这次，我们不用再次定义SNAT规则了，因为之前已经定义过SNAT规则，上次定义的SNAT规则只要定义一次就行，而DNAT规则则需要根据实际的情况去定义。
```

#### MASQUERADE

```shell
# 当我们拨号网上时，每次分配的IP地址往往不同，不会长期分给我们一个固定的IP地址，如果这时，我们想要让内网主机共享公网IP上网，就会很麻烦，因为每次IP地址发生变化以后，我们都要重新配置SNAT规则，这样显得不是很人性化，我们通过MASQUERADE即可解决这个问题，MASQUERADE会动态的将源地址转换为可用的IP地址，其余与SNAT实现的功能完全一致，都是修改源地址，只不过SNAT需要指明将报文的源地址改为哪个IP，而MASQUERADE则不用指定明确的IP，会动态的将报文的源地址修改为指定网卡上可用的IP地址

[root@localhost ~]# iptables -t nat -I POSTROUTING -s 192.168.116.0/24 -o eno16777736 -j MASQUERADE
# 通过外网网卡出去的报文在经过POSTROUTING链时，会自动将报文的源地址修改为外网网卡上可用的IP地址，这时，即使外网网卡中的公网IP地址发生了改变，也能够正常的、动态的将内部主机的报文的源IP映射为对应的公网IP。可以把MASQUERADE理解为动态的、自动化的SNAT，如果没有动态SNAT的需求，没有必要使用MASQUERADE，因为SNAT更加高效。
```

#### REDIRECT

```shell
# 使用REDIRECT动作可以在本机上进行端口映射
[root@localhost ~]# iptables -t nat -A PREROUTING -p tcp --dport 19000 -j REDIRECT --to-ports 22
# 将本机的22端口映射到本机的19000端口上。REDIRECT规则只能定义在PREROUTING链或者OUTPUT链中。
```

