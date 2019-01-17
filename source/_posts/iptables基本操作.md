---
title: iptables基本操作
date: 2018-10-12 14:03:43
tags: iptables基本操作
categories: 防火墙
---

#### 查看

```shell
[root@bogon ~]# iptables -t filter -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
OUTPUT_direct  all  --  anywhere             anywhere
# 列出filter表的所有规则
# 报文发往本机时，会经过PREROUTING链与INPUT链。所以，如果我们想要禁止某些报文发往本机，我们只能在PREROUTING链和INPUT链中定义规则，但是PREROUTING链并不存在于filter表中，因为PREROUTING链没有过滤功能，所以，只能在INPUT链上定义

root@bogon ~]# iptables -L INPUT
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
#只查看指定表中的指定链规则。可以省略-t filter，当没有使用-t选项指定表时，默认为操作filter表

[root@bogon ~]# iptables -vL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1894  144K ACCEPT     all  --  any    any     anywhere             anywhere             ctstate RELATED,ESTABLISHED
# 使用-v选项可以显示更多信息。字段含义如下：
# pkts:对应规则匹配到的报文的个数。
# bytes:对应匹配到的报文包的大小总和。
# target:规则对应的target（目标），往往表示规则对应的"动作"，即规则匹配成功后需要采取的措施。
# prot:表示规则对应的协议，是否只针对某些协议应用此规则。
# opt:表示规则对应的选项。
# in:表示数据包由哪个接口(网卡)流入，我们可以设置通过哪块网卡流入的报文需要匹配当前规则。
# out:表示数据包由哪个接口(网卡)流出，我们可以设置通过哪块网卡流出的报文需要匹配当前规则。
# source:表示规则对应的源头地址，可以是一个IP，也可以是一个网段。
# destination:表示规则对应的目标地址。可以是一个IP，也可以是一个网段。
# source与destination为anywhere是因为做了名称解析

[root@bogon ~]# iptables -nvL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1918  146K ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
# 在规则非常多的情况下如果进行名称解析，效率会比较低。可以使用-n选项，表示不对IP地址进行名称反解，直接显示IP地址

[root@bogon ~]# iptables --line-number -nvL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1     1971  150K ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
# 使用--line-numbers即可显示规则的编号。--line-numbers选项并没有对应的短选项，不过我们缩写成--line
# Chain INPUT (policy ACCEPT 0 packets, 0 bytes)的含义如下：
# policy表示当前链的默认策略，policy ACCEPT表示INPUT的链的默认动作为ACCEPT，默认接受通过INPUT关卡的所有请求
# packets表示当前链（上例为INPUT链）默认策略匹配到的包的数量，0 packets表示默认策略匹配到0个包。
# bytes表示当前链默认策略匹配到的所有包的大小总和。

[root@bogon ~]# iptables --line -xnvL INPUT
Chain INPUT (policy ACCEPT 5557 packets, 332K bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1        2012   153468 ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
# 其实，我们可以把packets与bytes称作"计数器"，上例中的计数器记录了默认策略匹配到的报文数量与总大小，"计数器"只会在使用-v选项时，才会显示出来。当被匹配到的包达到一定数量时，计数器会自动将匹配到的包的大小转换为可读性较高的单位。如果你想要查看精确的计数值，而不是经过可读性优化过的计数值，那么你可以使用-x选项，表示显示精确的计数值
```

#### 添加规则

```shell
* 拒绝某地址访问
[root@bogon ~]# iptables -t filter -I INPUT -s 10.5.5.249 -j DROP
# 拒绝10.5.5.249访问本机，这时249主机不能ping通本机
# -I表示将规则插入到每一条，-s指定源地址，-j指定动作。在iptables中，动作被称之为"target"
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 519 packets, 33559 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         193    16212 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0
# 有193个包被对应的规则匹配到，总计大小16212bytes。
[root@bogon ~]# iptables -A INPUT -s 10.5.5.249 -j ACCEPT
# -A为append之意，表示追加一条规则到末尾
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 86 packets, 6164 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         598    50232 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0           
2           0        0 ACCEPT     all  --  *      *       10.5.5.249           0.0.0.0/0 
# 追加规则后发现追加的规则并未匹配到，因为数据是按规则序列从上向下匹配的，第一条规则已经拒绝了所有请求，所以后面的规则也不会匹配到了。
[root@bogon ~]# iptables -I INPUT 3 -s 10.5.5.249 -j DROP
# 指定将规则插入到INPUT链的第三条
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 51 packets, 3610 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         941    79044 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0           
2           0        0 ACCEPT     all  --  *      *       10.5.5.249           0.0.0.0/0           
3           0        0 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0
```

#### 删除

```shell
[root@bogon ~]# iptables -D INPUT 3
# 删除INPUT链中的第三条规则
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 6 packets, 466 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1        1040    87360 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0           
2           0        0 ACCEPT     all  --  *      *       10.5.5.249           0.0.0.0/0
[root@bogon ~]# iptables -D INPUT -s 10.5.5.249 -j ACCEPT
# 根据匹配条件删除规则，这里要删除的是源地址是10.5.5.249，动作是ACCEPT的规则
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 6 packets, 428 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1        1128    94752 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0
[root@bogon ~]# iptables -t filter -F
# 删除filter表中的所有规则
```

#### 修改

```shell
[root@bogon ~]# iptables -R INPUT 1 -s 10.5.5.249 -j REJECT
# -R选项表示修改指定的链，使用-R INPUT 1表示修改INPUT链的第1条规则，使用-j REJECT表示将INPUT链中的第一条规则的动作修改为REJECT，注意：上例中， -s选项以及对应的源地址不可省略。在使用-R选项修改某个规则时，必须指定规则对应的原本的匹配条件。如果上例中的命令没有使用-s指定对应规则中原本的源地址，那么在修改完成后，你修改的规则中的源地址会自动变为0.0.0.0/0
# 如果你想要修改某条规则，还不如先将这条规则删除，然后在同样位置再插入一条新规则
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 9 packets, 662 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           2      168 REJECT     all  --  *      *       10.5.5.249           0.0.0.0/0            reject-with icmp-port-unreachable

* 修改默认策略
[root@bogon ~]# iptables -P FORWARD DROP
# 使用-P选项修改默认策略，修改filter表中的FORWARD链的默认策略为DROP
[root@bogon ~]# iptables --line -nvxL FORWARD
Chain FORWARD (policy DROP 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination
# 可以看到policy后面是DROP了
```

#### 保存

```shell
* CentOS6
[root@bogon ~]# service iptables save
# 使修改的规则永久生效
[root@bogon ~]# cat /etc/sysconfig/iptables
# 规则保存在/etc/sysconfig/iptables中

* CentOS7
[root@test ~]# yum install -y iptables-services
[root@bogon ~]# systemctl start iptables
[root@bogon ~]# systemctl enable iptables
[root@bogon ~]# service iptables save
iptables: Saving firewall rules to /etc/sysconfig/iptables:[  OK  ]
# 要安装iptables-services后才能使用service命令保存规则

* 其他保存方法
[root@bogon ~]# iptables-save > /etc/sysconfig/iptables

* 重新加载规则
[root@bogon ~]# iptables-restore < /etc/sysconfig/iptables
```

