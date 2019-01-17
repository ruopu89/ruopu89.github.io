---
title: iptables自定义规则链
date: 2018-10-15 14:05:17
tags: iptables自定义规则链
categories: 防火墙
---

#### 创建自定义规则链


```shell
# 当默认链中的规则非常多时，不方便我们管理。所以要自定义规则链
# 自定义链并不能直接使用，而是需要被默认链引用才能够使用

* 创建自定义链
[root@bogon ~]# iptables -t filter -N IN_WEB
# "-t filter"表示操作的表为filter表，与之前的示例相同，省略-t选项时，缺省操作的就是filter表。"-N IN_WEB"表示创建一个自定义链，自定义链的名称为"IN_WEB"
[root@bogon ~]# iptables --line -nvxL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80
2         386    26796 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
3        4087   278278 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 44 packets, 4228 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain IN_WEB (0 references)
num      pkts      bytes target     prot opt in     out     source               destination 
# 查看filter表中的链，这条自定义链的引用计数为0 (0 references)，也就是说，这条自定义链还没有被任何默认链所引用，所以，即使IN_WEB中配置了规则，也不会生效

* 创建自定义链规则
[root@bogon ~]# iptables -I IN_WEB -s 10.5.5.249 -j REJECT
[root@bogon ~]# iptables --line -nvxL IN_WEB
Chain IN_WEB (0 references)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     all  --  *      *       10.5.5.249           0.0.0.0/0            reject-with icmp-port-unreachable
# 自定义链中已经有了一条规则，但是目前，这条规则无法匹配到任何报文，因为我们并没有在任何默认链中引用它。

* 引用自定义链
[root@bogon ~]# iptables -I INPUT -p tcp --dport 80 -j IN_WEB
# 在INPUT链中添加了一条规则，访问本机80端口的tcp报文将会被这条规则匹配到，而上述规则中的"-j IN_WEB"表示：访问80端口的tcp报文将由自定义链"IN_WEB"中的规则进行处理。此处，我们将"动作"替换为了"自定义链"，当"-j"对应的值为一个自定义链时，就表示被当前规则匹配到的报文将交由对应的自定义链处理。当IN_WEB自定义链被INPUT链引用以后，可以发现，IN_WEB链的引用计数已经变为1，表示这条自定义链已经被引用了1次，自定义链还可以引用其他的自定义链
[root@bogon ~]# iptables --line -nvxL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 IN_WEB     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
2           0        0 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80
3         663    46156 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
4        5196   351595 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 76 packets, 7396 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         

Chain IN_WEB (1 references)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     all  --  *      *       10.5.5.249           0.0.0.0/0            reject-with icmp-port-unreachable
```

#### 重命名自定义链

```shell
[root@bogon ~]# iptables -E IN_WEB WEB
# 使用"-E"选项可以修改自定义链名
[root@bogon ~]# iptables -nvL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
   80  5672 WEB        tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
    0     0 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80
  888 62080 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
 6265  425K REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 24 packets, 2328 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain WEB (2 references)
 pkts bytes target     prot opt in     out     source               destination         
    1    60 REJECT     all  --  *      *       10.5.5.249           0.0.0.0/0            reject-with icmp-port-unreachable
```

#### 删除自定义链

```shell
# 使用"-X"选项可以删除自定义链，但是删除自定义链时，需要满足两个条件：
# 1、自定义链没有被任何默认链引用，即自定义链的引用计数为0。
# 2、自定义链中没有任何规则，即自定义链为空。

[root@bogon ~]# iptables -X WEB
iptables: Too many links.
# 提示：Too many links，是因为WEB链已经被默认链所引用
[root@bogon ~]# iptables -D INPUT 1
[root@bogon ~]# iptables -X WEB
iptables: Directory not empty.
# 删除引用自定义链的规则后，再次尝试删除自定义链，提示：Directory not empty，是因为WEB链中存在规则
[root@bogon ~]# iptables -t filter -F WEB
[root@bogon ~]# iptables -t filter -X WEB
# 清除规则后再删除自定义链就没问题了。使用"-X"选项可以删除一个引用计数为0的、空的自定义链
```

