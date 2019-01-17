---
title: iptables网络防火墙
date: 2018-10-15 14:32:53
tags: iptables网络防火墙
categories: 防火墙
---

### 概念

* 网络防火墙往往处于网络的入口或者边缘

* 网络防火墙的职责就是"过滤并转发"。要想"过滤"，只能在INPUT、OUTPUT、FORWARD三条链中实现，要想"转发"，报文则只会经过FORWARD链（发往本机的报文才会经过INPUT链），所以，iptables的角色变为"网络防火墙"时，规则只能定义在FORWARD链中。

### 测试

```shell
# 准备三台linux主机，一台为外网主机，一台为内网主机，一台允当防火墙
# A外网主机IP：10.5.5.90
# B内网主机IP：192.168.116.130
# C网络防火墙IP：192.168.116.129、10.5.5.91

# 将虚拟机C的第二块网卡和B的网卡设置为仅主机
* B
[root@localhost ~]# vim /etc/sysconfig/network-scripts/ifcfg-eno16777736
    IPADDR=192.168.116.130
    NETMASK=255.255.255.0
    GATEWAY=192.168.116.129
# 将B主机的网关指向C（防火墙）主机的内网地址192.168.116.129

* A
[root@localhost ~]#route add -net 192.168.116.0/24 gw 10.5.5.91
# 给外网主机加一条路由，让外网主机知道如何到内网主机
# 现在外网与内网主机还不能互相ping通，因为防火墙没有路由数据包
# 因为在CentOS中，IP地址属于主机，所以内外网的主机都可以ping通防火墙的外网地址

* C
[root@localhost ~]# echo 1 > /proc/sys/net/ipv4/ip_forward
# 开启防火墙路由功能
# 这时内外网可以互相ping通了。
[root@localhost ~]# iptables -A FORWARD -j REJECT
# 拒绝所有数据转发。这时内外网又不能互相ping通了。

* A
[root@localhost ~]# vim /var/www/html/index.html
	10.5.5.90
# 添加默认主页
[root@localhost ~]# systemctl start httpd

* B
[root@localhost ~]# vim /var/www/html/index.html
	192.168.116.130
# 添加默认主页
[root@localhost ~]# systemctl start httpd
# 启动两台主机的httpd服务
# 这时两台主机是不能互相访问的

* C
[root@localhost ~]# iptables -I FORWARD -s 192.168.116.0/24 -p tcp --dport 80 -j ACCEPT
# 让源地址是192.168.116.0网段的主机可以访问外部的80端口。只加入这一条还不行，这只是数据流出的规则，还要加数据流入的规则
[root@localhost ~]# iptables -I FORWARD -d 192.168.116.0/24 -p tcp --sport 80 -j ACCEPT
# 加入此条后，192.168.116.0网段的主机就可以访问外部的80端口了。
[root@localhost ~]# iptables -D FORWARD 1
# 删除FORWARD中的第一条规则
[root@localhost ~]# iptables -I FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
# 加入这一条就可以将绝大多数响应报文放行了。配置完上述规则后，我们只要考虑请求报文的方向就行了，而回应报文，上述一条规则就能搞定，这样配置，即使以后有更多服务的响应报文需要放行，我们也不用再去针对响应报文设置规则了
[root@localhost ~]# iptables -I FORWARD -s 192.168.116.0/24 -p tcp --dport 22 -j ACCEPT
# 加入这一条就可以实现内网主机使用ssh连接外部主机了
[root@test ~]# iptables -I FORWARD -p icmp -j ACCEPT
# 放行内外网间的ping请求
```

