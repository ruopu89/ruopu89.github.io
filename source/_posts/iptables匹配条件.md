---
title: iptables匹配条件
date: 2018-10-12 16:35:15
tags: iptables匹配条件
categories: 防火墙
---

### 基本匹配条件

#### 指定地址

```shell
* 一次指定多个源地址
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249,10.5.5.224 -j DROP
# 用逗号分隔多个地址
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 55 packets, 4698 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 DROP       all  --  *      *       10.5.5.224           0.0.0.0/0           
2          12     1008 DROP       all  --  *      *       10.5.5.249           0.0.0.0/0 
# 指定后会一次添加两条规则

* 指定网段
[root@bogon ~]# iptables -I FORWARD -s 10.5.5.0/16 -j DROP
# 拒绝10.5.5.0网段的所有地址访问
[root@bogon ~]# iptables --line -nvxL FORWARD
Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 DROP       all  --  *      *       10.5.0.0/16          0.0.0.0/0

* 对条件取反
[root@bogon ~]# iptables -A INPUT ! -s 10.5.5.25 -j ACCEPT
# 使用"! -s 10.5.5.25"表示对 -s 10.5.5.25这个匹配条件取反， -s 10.5.5.25表示报文源IP地址为10.5.5.25即可满足匹配条件，使用 "!" 取反后则表示，报文源地址IP只要不为10.5.5.25即满足条件，那么，上例中规则表达的意思就是，只要发往本机的报文的源地址不是10.5.5.25，就接受报文。但10.5.5.25还是可以ping通这台主机，因为filter表的INPUT链中只有一条规则，这条规则要表达的意思就是：只要报文的源IP不是10.5.5.25，那么就接受此报文，但并不能代表，报文的源IP是10.5.5.25时，会被拒绝。因为并没有任何一条规则指明源IP是10.5.5.25时，该执行怎样的动作，所以，当来自10.5.5.25的报文经过INPUT链时，并不能按上例中的规则处理报文，这时报文被两条规则匹配，一是拒绝10.5.5.25的报文，一是默认允许所有报文通过的规则。于是，此报文就继续匹配后面的规则，因为只有一条规则，于是，此报文就会去匹配当前链的默认动作(默认策略)，因为默认策略是ACCEPT，所以10.5.5.25还可以ping通这台主机。
[root@bogon ~]# iptables --line -vnxL INPUT
Chain INPUT (policy ACCEPT 287 packets, 24108 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         159    12226 ACCEPT     all  --  *      *      !10.5.5.25            0.0.0.0/0 

* 指定目标地址
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -d 10.5.5.22 -j DROP
# 这条规则就可以实现上面的禁止10.5.5.249访问本机10.5.5.22
# 使用-d选项指定目标地址。如果我们不指定任何目标地址，则目标地址默认为0.0.0.0/0，同理，如果我们不指定源地址，源地址默认为0.0.0.0/0。-d选项也可以使用"叹号"进行取反，也能够同时指定多个IP地址，使用"逗号"隔开即可。
# 但是请注意，不管是-s选项还是-d选项，取反操作与同时指定多个IP的操作不能同时使用。
# 当一条规则中有多个匹配条件时，那么多个匹配条件之间，默认存在"与"的关系。如上面规则表示源地址与目标地址必须同时能被这两个条件匹配，才算作被当前规则匹配
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1          12     1008 DROP       all  --  *      *       10.5.5.249           10.5.5.22           
2        1978   144348 ACCEPT     all  --  *      *      !10.5.5.25            0.0.0.0/0
```

#### 协议类型

```shell
[root@bogon ~]# iptables -I INPUT -p tcp -s 10.5.5.249 -j DROP
# 拒绝10.5.5.249的tcp请求，所以ssh无法连接，但可以ping通。
# 当不使用-p指定协议类型时，默认表示所有类型的协议都会被匹配到，与使用-p all的效果相同。
[root@bogon ~]# iptables -I INPUT ! -p udp -s 10.5.5.249 -j DROP
[root@bogon ~]# iptables --line -xvnL INPUT
Chain INPUT (policy ACCEPT 192 packets, 11044 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1          18     1512 DROP      !udp  --  *      *       10.5.5.249           0.0.0.0/0           
2           0        0 DROP       tcp  --  *      *       10.5.5.249           0.0.0.0/0 
# -p用于匹配报文的协议类型,可以匹配的协议类型tcp、udp、udplite、icmp、esp、ah、sctp等（centos7中还支持icmpv6、mh）
```

#### 网卡接口

```shell
* 流入
[root@bogon ~]# iptables -I INPUT -p icmp -i eth0 -j DROP
[root@bogon ~]# iptables -I INPUT -p icmp ! -i eth0 -j DROP
# -i用于匹配报文是从哪个网卡接口流入本机的，由于匹配条件只是用于匹配报文流入的网卡，所以在OUTPUT链与POSTROUTING链中不能使用此选项。
[root@bogon ~]# iptables --line -xvnL INPUT
Chain INPUT (policy ACCEPT 52 packets, 4422 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 DROP       icmp --  !eth0  *       0.0.0.0/0            0.0.0.0/0           
2          25     2100 DROP       icmp --  eth0   *       0.0.0.0/0            0.0.0.0/0

* 流出
[root@bogon ~]# iptables -I OUTPUT -p icmp -o eth0 -j DROP
[root@bogon ~]# iptables -I OUTPUT -p icmp ! -o eth0 -j DROP
[root@bogon ~]# iptables --line -xvnL OUTPUT
Chain OUTPUT (policy ACCEPT 65 packets, 6908 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 DROP       icmp --  *      !eth0   0.0.0.0/0            0.0.0.0/0           
2          23     1932 DROP       icmp --  *      eth0    0.0.0.0/0            0.0.0.0/0
```

### 扩展匹配条件

#### tcp扩展模块

```shell
* 目标端口
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp -m tcp --dport 22 -j REJECT
# 使用-m选项来指定扩展模块，如果想要使用--dport这个扩展匹配条件，则必须依靠某个扩折模块完成，上例中，这个扩展模块就是tcp扩展模块。 -m tcp表示使用tcp扩展模块，--dport表示tcp扩展模块中的一个扩展匹配条件，可用于匹配报文的目标端口。-p tcp与 -m tcp并不冲突，-p用于匹配报文的协议，-m 用于指定扩展模块的名称，正好这个扩展模块也叫tcp。
# 基本匹配条件我们可以直接使用，而如果想要使用扩展匹配条件，则需要依赖一些扩展模块
# 扩展匹配条件是可以取反的，同样是使用"!"进行取反，比如 "! --dport 22"，表示目标端口不是22的报文将会被匹配到。
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp --dport 22 -j REJECT
# 也可以省略-m选项。当使用-p选项指定了报文的协议时，如果在没有使用-m指定对应的扩展模块名称的情况下，使用了扩展匹配条件，  iptables默认会调用与-p选项对应的协议名称相同的模块。

* 源端口
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp --sport 22 -j ACCEPT
[root@bogon ~]# iptables --line -xvnL INPUT
Chain INPUT (policy ACCEPT 59 packets, 4224 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 ACCEPT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            tcp spt:22
2           1       60 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            tcp dpt:22 reject-with icmp-port-unreachable

* 指定端口范围
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp --dport 22:25 -j REJECT
[root@bogon ~]# iptables --line -xvnL INPUT
Chain INPUT (policy ACCEPT 9 packets, 662 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            tcp dpts:22:25 reject-with icmp-port-unreachable
# --dport 22:25表示目标端口为22到25之间的所有端口

[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp --dport :22 -j REJECT
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp --sport 80: -j REJECT 
[root@bogon ~]# iptables --line -xvnL INPUT
Chain INPUT (policy ACCEPT 46 packets, 3358 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            tcp spts:80:65535 reject-with icmp-port-unreachable
2           0        0 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            tcp dpts:0:22 reject-with icmp-port-unreachable
# --sport和--dport都可以指定多个端口，第一条表示从0到22端口，第二条表示80端口到65535端口

* --tcp-flags
# "--tcp-flags"指的就是tcp头中的标志位，我们可以通过此扩展匹配条件，去匹配tcp报文的头部的标识位，然后根据标识位的实际情况实现访问控制的功能。
[root@bogon ~]# iptables -I INPUT -p tcp -m tcp --dport 22 --tcp-flags SYN,ACK,FIN,RST,URG,PSH SYN -j REJECT
# "-m tcp --dport 22"的表示使用tcp扩展模块，指定目标端口为22号端口(ssh默认端口)，"--tcp-flags"用于匹配报文tcp头部的标志位，"SYN,ACK,FIN,RST,URG,PSH SYN"就是用于配置我们要匹配的标志位的，我们可以把这串字符拆成两部分去理解，第一部分为"SYN,ACK,FIN,RST,URG,PSH"，第二部分为"SYN"。第一部分表示：我们需要匹配报文tcp头中的哪些标志位，这里指定了六个标志位。第二部分表示：第一部分的标志位列表中，哪些标志位必须为1，这里指定的是SYN标志位必须为1，其他标志位必须为0。也就是tcp三次握手时第一次握手时的情况。
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 44 packets, 3226 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22 flags:0x3F/0x02 reject-with icmp-port-unreachable

[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 --tcp-flags SYN,ACK,FIN,RST,URG,PSH SYN -j REJECT
[root@bogon ~]# iptables -I OUTPUT -p tcp -m tcp --sport 22 --tcp-flags SYN,ACK,FIN,RST,URG,PSH SYN,ACK -j REJECT
# 第一条命令匹配到的报文是第一次握手的报文，第二条命令匹配到的报文是第二次握手的报文。
[root@bogon ~]# iptables -I INPUT -p tcp -m tcp --dport 22 --tcp-flags ALL SYN -j REJECT
[root@bogon ~]# iptables -I OUTPUT -p tcp -m tcp --sport 22 --tcp-flags ALL SYN,ACK -j REJECT
# 上面两条命令可以简写成这样，也就是将六个标志位用ALL代替

* --syn
[root@bogon ~]# iptables -I INPUT -p tcp -m tcp --dport 22 --syn -j REJECT
# 使用"--syn"选项匹配第一次握手，这相当于使用"--tcp-flags SYN,RST,ACK,FIN  SYN"，也就是说，可以使用"--syn"选项去匹配tcp新建连接的请求报文。
```

#### udp扩展

```shell
[root@bogon ~]# iptables -I INPUT -p udp -m udp --dport 137 -j ACCEPT
[root@bogon ~]# iptables -I INPUT -p udp -m udp --dport 138 -j ACCEPT
# 放行samba服务的137与138这两个UDP端口
[root@bogon ~]# iptables -I INPUT -p udp --dport 137 -j ACCEPT
[root@bogon ~]# iptables -I INPUT -p udp --dport 138 -j ACCEPT
# 可以省略-m选项

[root@bogon ~]# iptables -I INPUT -p udp --dport 137:157 -j ACCEPT
# 开放137到157之间的所有udp端口
# udp中的--sport与--dport也只能指定连续的端口范围，并不能一次性指定多个离散的端口
# 使用multiport扩展模块，即可指定多个离散的UDP端口
```

#### icmp扩展

```shell
# ICMP协议的全称为Internet Control Message Protocol，翻译为互联网控制报文协议，它主要用于探测网络上的主机是否可用，目标是否可达，网络是否通畅，路由是否可用等。
# 我们平常使用ping命令ping某主机时，如果主机可达，对应主机会对我们的ping请求做出回应（此处不考虑禁ping等情况），也就是说，我们发出ping请求，对方回应ping请求，虽然ping请求报文与ping回应报文都属于ICMP类型的报文，但是如果在概念上细分的话，它们所属的类型还是不同的，我们发出的ping请求属于类型8的icmp报文，而对方主机的ping回应报文则属于类型0的icmp报文，根据应用场景的不同，icmp报文被细分为如下各种类型。
```

<img src="/images/iptables/icmp.png"/>

```shell
# 从上图可以看出，所有表示"目标不可达"的icmp报文的type码为3，而"目标不可达"又可以细分为多种情况，是网络不可达呢？还是主机不可达呢？再或者是端口不可达呢？所以，为了更加细化的区分它们，icmp对每种type又细分了对应的code，用不同的code对应具体的场景，所以，我们可以使用type/code去匹配具体类型的ICMP报文，比如可以使用"3/1"表示主机不可达的icmp报文。
# 上图中的第一行就表示ping回应报文，它的type为0，code也为0，从上图可以看出，ping回应报文属于查询类（query）的ICMP报文，从大类上分，ICMP报文还能分为查询类与错误类两大类，目标不可达类的icmp报文则属于错误类报文。
# 而我们发出的ping请求报文对应的type为8，code为0。

[root@bogon ~]# iptables -I INPUT -p icmp -j REJECT
# 上例中，我们并没有使用任何扩展匹配条件，我们只是使用"-p icmp"匹配了所有icmp协议类型的报文。如果进行了上述设置，别的主机向我们发送的ping请求报文无法进入防火墙，我们向别人发送的ping请求对应的回应报文也无法进入防火墙。所以，我们既无法ping通别人，别人也无法ping通我们。
[root@bogon ~]# iptables -F
[root@bogon ~]# iptables -I INPUT -p icmp -m icmp --icmp-type 8/0 -j REJECT
# 本机可以ping通外部主机，但外部主机不能ping通本机
# "-m icmp"表示使用icmp扩展，因为上例中使用了"-p icmp"，所以"-m icmp"可以省略，使用"--icmp-type"选项表示根据具体的type与code去匹配对应的icmp报文，而上图中的"--icmp-type 8/0"表示icmp报文的type为8，code为0才会被匹配到，也就是只有ping请求类型的报文才能被匹配到，所以，别人对我们发起的ping请求将会被拒绝通过防火墙，而我们之所以能够ping通别人，是因为别人回应我们的报文的icmp type为0，code也为0，所以无法被上述规则匹配到，所以我们可以看到别人回应我们的信息。
[root@bogon ~]# iptables -I INPUT -p icmp -m icmp --icmp-type 8 -j REJECT
# 因为type为8的类型下只有一个code为0的类型，所以我们可以省略对应的code
[root@test ~]# iptables -I OUTPUT -p icmp --icmp-type 8 -j REJECT
# 如果这样设置，那么我们的主机就无法ping通外部主机了，因为我们ping外部主机发出的是类型8的报文，设置在OUTPUT链上，就无法出去了。我们ping外部主机出去的是类型8进来的是类型0的报文，外部主机ping我们的主机，进来的是类型8出去的是类型0的报文。
[root@bogon ~]# iptables -I INPUT -p icmp -m icmp --icmp-type "echo-request" -j REJECT
# 我们可以用icmp报文的描述名称去匹配对应类型的报文。使用 --icmp-type "echo-request"与 --icmp-type 8/0的效果完全相同
# 名称中的"空格"需要替换为"-"，如echo request要命令中要写为echo-request
```

#### multiport扩展模块

```shell
* 指定不连续端口
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp -m multiport --dports 22,36,80 -j REJECT
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 121 packets, 7270 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            multiport dports 22,36,80 reject-with icmp-port-unreachable
# 禁止来自249的主机上的tcp报文访问本机的22号端口、36号端口以及80号端口
# 可以使用multiport模块的--sports扩展条件同时指定多个离散的源端口。使用multiport模块的--dports扩展条件同时指定多个离散的目标端口

* 指定连续端口
[root@bogon ~]# iptables -I INPUT -s 10.5.5.249 -p tcp -m multiport --dports 22,80:88 -j REJECT
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 47 packets, 3474 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       10.5.5.249           0.0.0.0/0            multiport dports 22,80:88 reject-with icmp-port-unreachable
# 使用multiport模块的--sports与--dpors时，也可以指定连续的端口范围，并且能够在指定连续的端口范围的同时，指定离散的端口号
# 拒绝来自10.5.5.249的tcp报文访问当前主机的22号端口以及80到88之间的所有端口号
```

#### iprange扩展模块

```shell
# 使用iprange扩展模块可以指定"一段连续的IP地址范围"，用于匹配报文的源地址或者目标地址。
# iprange扩展模块中有两个扩展匹配条件可以使用
# --src-range
# --dst-range

[root@bogon ~]# iptables -I INPUT -m iprange --src-range 10.5.5.240-10.5.5.249 -j REJECT
[root@bogon ~]# iptables --line -nxvL INPUT
Chain INPUT (policy ACCEPT 208 packets, 11763 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            source IP range 10.5.5.240-10.5.5.249 reject-with icmp-port-unreachable
# 如果报文的源IP地址在10.5.5.240到10.5.5.249之间，则丢弃报文，IP段的始末IP使用"横杠"连接，--src-range与--dst-range和其他匹配条件一样，能够使用"!"取反
```

#### string扩展模块

```shell
# 使用string扩展模块，可以指定要匹配的字符串，如果报文中包含对应的字符串，则符合匹配条件。
# string模块的常用选项
# --algo：用于指定匹配算法，可选的算法有bm与kmp，此选项为必须选项，我们不用纠结于选择哪个算法，但是我们必须指定一个。
# --string：用于指定需要匹配的字符串。

# 下面在10.5.5.249上部署
[root@test html]# yum install -y httpd
[root@test html]# vim /var/www/html/index.html
	OOXX
[root@test html]# vim /var/www/html/index1.html
	Hello World
[root@test ~]# systemctl start httpd
# 下面到10.5.5.22主机访问
[root@bogon ~]# curl 10.5.5.249
OOXX
[root@bogon ~]# curl 10.5.5.249/index1.html
Hello World
# 在249主机上安装httpd，提供两个网页，内容分别为OOXX和Hello World。此时在另一台主机可以正常访问
[root@bogon ~]# iptables -I INPUT -m string --algo bm --string "OOXX" -j REJECT
# 如果报文中包含"OOXX"字符，我们就拒绝报文进入本机。'-m string'表示使用string模块，'--algo bm'表示使用bm算法去匹配指定的字符串，' --string "OOXX" '则表示我们想要匹配的字符串为"OOXX"
# 这是设置返回的信息中如果有OOXX就拒绝进入本机
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 51 packets, 3603 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            STRING match  "OOXX" ALGO name bm TO 65535 reject-with icmp-port-unreachable
[root@bogon ~]# curl 10.5.5.249
^C
[root@bogon ~]# curl 10.5.5.249/index1.html
Hello World
# 在22主机上设置规则后，因为249主机的默认页中包含“OOXX”，所以访问时会停留在空白处，没有信息返回。如果访问index1.html页面是没有问题的。
```

#### time扩展模块

```shell
# 可以通过time扩展模块，根据时间段匹配报文，如果报文到达的时间在指定的时间范围以内，则符合匹配条件。
# --monthdays与--weekdays可以使用"!"取反，其他选项不能取反。

* 指定时间
[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --timestart 09:00:00 --timestop 18:00:00 -j REJECT
[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 443 -m time --timestart 09:00:00 --timestop 18:00:00 -j REJECT
# 每天早上9点到下午6点不能看网页。"-m time"表示使用time扩展模块，--timestart选项用于指定起始时间，--timestop选项用于指定结束时间。
# 测试时，此条设置完未生效，依然可以访问网页
[root@bogon ~]# iptables --line -nvxL OUTPUT
Chain OUTPUT (policy ACCEPT 37 packets, 3516 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 REJECT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:443 TIME from 09:00:00 to 18:00:00 UTC reject-with icmp-port-unreachable
2           0        0 REJECT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80 TIME from 09:00:00 to 18:00:00 UTC reject-with icmp-port-unreachable

* 按周指定日期
[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --weekdays 6,7 -j REJECT
# 只有周六日不能看网页。使用--weekdays选项可以指定每个星期的具体哪一天，可以同时指定多个，用逗号隔开，除了能够数字表示"星期几",还能用缩写表示，例如：Mon, Tue, Wed, Thu, Fri, Sat, Sun

[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --timestart 09:00:00 --timestop 18:00:00 --weekdays 6,7 -j REJECT
# 将上面两种方法结合使用。指定只有周六日的早上9点到下午6点不能浏览网页。

* 指月指定日期
[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --monthdays 22,23 -j REJECT
# 使用--monthdays选项可以具体指定的每个月的22号，23号不能访问网页。

[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --weekdays 5 --monthdays 22,23,24,25,26,27,28 -j REJECT
# 当一条规则中同时存在多个条件时，多个条件之间默认存在"与"的关系。所以，上面的规则表示匹配的时间必须为星期五，并且这个"星期五"同时还需要是每个月的22号到28号之间的一天，也就表示每个月的第4个星期五

* 指定具体时间
[root@bogon ~]# iptables -I OUTPUT -p tcp --dport 80 -m time --datestart 2018-10-15 --datestop 2018-10-19 -j REJECT
# 可以使用--datestart 选项与-datestop选项，指定具体的日期范围。测试中，此条可以生效。
```

#### connlimit扩展模块

```shell
# 使用connlimit扩展模块，可以限制每个IP地址同时链接到server端的链接数量，注意：我们不用指定IP，其默认就是针对"每个客户端IP"，即对单IP的并发连接数限制。

* --connlimit-above
[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 -m connlimit --connlimit-above 2 -j REJECT
# 超过两个连接就拒绝。使用"-m connlimit"指定使用connlimit扩展，使用"--connlimit-above 2"表示限制每个IP的链接数量上限为2，再配合-p tcp --dport 22，即表示限制每个客户端IP的ssh并发链接数量不能超过(above)2。
# centos6中，我们可以对--connlimit-above选项进行取反
[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 -m connlimit ! --connlimit-above 2 -j ACCEPT
# 每个客户端IP的ssh链接数量只要不超过两个，则允许链接。但上例的规则并不能表示：每个客户端IP的ssh链接数量超过两个则拒绝链接。因为匹配不到时要匹配默认规则，如果默认规则是ACCEPT，那么依然可以连接
# 即使我们配置了上例中的规则，也不能达到"限制"的目的，所以我们通常并不会对此选项取反，因为既然使用了此选项，我们的目的通常就是"限制"连接数量。
# centos7中iptables为我们提供了一个新的选项，--connlimit-upto，这个选项的含义与"! --commlimit-above"的含义相同，即链接数量未达到指定的连接数量之意，所以综上所述，--connlimit-upto选项也不常用。

* --connlimit-mask
[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 -m connlimit --connlimit-above 2 --connlimit-mask 24 -j REJECT
# "--connlimit-mask 24"表示某个C类网段。上面规则表示，一个最多包含254个IP的C类网络中，同时最多只能有2个ssh客户端连接到当前服务器
[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 -m connlimit --connlimit-above 10 --connlimit-mask 27 -j REJECT
# "--connlimit-mask 27"表示某个C类网段，通过计算后可以得知，这个网段中最多只能有30台机器（30个IP），这30个IP地址最多只能有10个ssh连接同时连接到服务器端
# 在不使用--connlimit-mask的情况下，连接数量的限制是针对"每个IP"而言的，当使用了--connlimit-mask选项以后，则可以针对"某类IP段内的一定数量的IP"进行连接数量的限制
```

#### limit扩展模块

```shell
# limit模块是对"报文到达速率"进行限制的.如果想要限制单位时间内流入的包的数量，就能用limit模块

* --limit
[root@bogon ~]# iptables -I INPUT -p icmp -m limit --limit 10/minute -j ACCEPT
# "-p icmp"表示我们针对ping请求添加了一条规则（ping使用icmp协议），"-m limit"表示使用limit模块， "--limit 10/minute -j ACCEPT"表示每分钟最多放行10个包，就相当于每6秒钟最多放行一个包
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 5950 packets, 5128996 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         111     9416 ACCEPT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0            limit: avg 10/min burst 5
# 上面的规则并不会起作用。因为每6秒放行一个包，那么iptables就会计时，每6秒一个轮次，到第6秒时，达到的报文就会匹配到对应的规则，执行对应的动作ACCEPT。那么在第6秒之前到达的包，则无法被上述规则匹配到。那么这些包就要向下匹配策略中的其他规则，如果都不能匹配，就会匹配默认策略，因为默认策略是ACCEPT，所以ping此主机的时候还是会正常运行。
[root@bogon ~]# iptables -A INPUT -p icmp -j REJECT
# 拒绝所有的ping包
[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 6 packets, 428 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1         150    12692 ACCEPT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0            limit: avg 10/min burst 5
2          56     4704 REJECT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable
# 第一条规则表示每分钟最多放行10个icmp包，也就是6秒放行一个，第6秒的icmp包会被上例中的第一条规则匹配到，第6秒之前的包则不会被第一条规则匹配到，于是被后面的拒绝规则匹配到了
# 这时再ping此主机时就可以发现每6秒才能ping通一次了。但还有一个问题，就是最开始的5个ping包是不受限制的，可以正常ping通。现象如下，下面解释原因
[root@test ~]# ping 10.5.5.22
PING 10.5.5.22 (10.5.5.22) 56(84) bytes of data.
64 bytes from 10.5.5.22: icmp_seq=1 ttl=64 time=0.248 ms
64 bytes from 10.5.5.22: icmp_seq=2 ttl=64 time=0.355 ms
64 bytes from 10.5.5.22: icmp_seq=3 ttl=64 time=0.332 ms
64 bytes from 10.5.5.22: icmp_seq=4 ttl=64 time=0.261 ms
64 bytes from 10.5.5.22: icmp_seq=5 ttl=64 time=0.528 ms
From 10.5.5.22 icmp_seq=6 Destination Port Unreachable
64 bytes from 10.5.5.22: icmp_seq=7 ttl=64 time=0.418 ms
From 10.5.5.22 icmp_seq=8 Destination Port Unreachable
From 10.5.5.22 icmp_seq=9 Destination Port Unreachable
From 10.5.5.22 icmp_seq=10 Destination Port Unreachable
From 10.5.5.22 icmp_seq=11 Destination Port Unreachable
From 10.5.5.22 icmp_seq=12 Destination Port Unreachable
64 bytes from 10.5.5.22: icmp_seq=13 ttl=64 time=0.435 ms
From 10.5.5.22 icmp_seq=14 Destination Port Unreachable
From 10.5.5.22 icmp_seq=15 Destination Port Unreachable

* --limit-burst
# "--limit-burst"可以指定"空闲时可放行的包的数量。在不使用"--limit-burst"选项明确指定放行包的数量时，默认值为5，所以才会有上面的现象。
# 如果想要彻底了解limit模块的工作原理，我们需要先了解一下"令牌桶"算法，因为limit模块使用了令牌桶算法。我们可以这样想象，有一个木桶，木桶里面放了5块令牌，而且这个木桶最多也只能放下5块令牌，所有报文如果想要出关入关，都必须要持有木桶中的令牌才行，这个木桶有一个神奇的功能，就是每隔6秒钟会生成一块新的令牌，如果此时，木桶中的令牌不足5块，那么新生成的令牌就存放在木桶中，如果木桶中已经存在5块令牌，新生成的令牌就无处安放了，只能溢出木桶（令牌被丢弃），如果此时有5个报文想要入关，那么这5个报文就去木桶里找令牌，正好一人一个，于是他们5个手持令牌，快乐的入关了，此时木桶空了，再有报文想要入关，已经没有对应的令牌可以使用了，但是，过了6秒钟，新的令牌生成了，此刻，正好来了一个报文想要入关，于是，这个报文拿起这个令牌，就入关了，在这个报文之后，如果很长一段时间内没有新的报文想要入关，木桶中的令牌又会慢慢的积攒了起来，直到达到5个令牌，并且一直保持着5个令牌，直到有人需要使用这些令牌，这就是令牌桶算法的大致逻辑。
# "--limit"选项就是用于指定"多长时间生成一个新令牌的"，"--limit-burst"选项就是用于指定"木桶中最多存放几个令牌的"

[root@bogon ~]# iptables -I INPUT -p icmp -m limit --limit-burst 1 --limit 10/minute -j ACCEPT
# 使用"--limit"选项时，可以选择的时间单位有多种，如：/second、/minute、/hour、/day。比如，3/second表示每秒生成3个"令牌"，30/minute表示每分钟生成30个"令牌"。

[root@bogon ~]# iptables --line -nvxL INPUT
Chain INPUT (policy ACCEPT 174 packets, 11316 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1          13     1092 ACCEPT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0            limit: avg 10/min burst 1
2         194    16296 REJECT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable
```

#### state扩展模块

```shell
# 对于state模块而言的"连接"并不能与tcp的"连接"画等号，在TCP/IP协议簇中，UDP和ICMP是没有所谓的连接的，但是对于state模块来说，tcp报文、udp报文、icmp报文都是有连接状态的。对于state模块而言，只要两台机器在"你来我往"的通信，就算建立起了连接
# state模块中的报文状态
# NEW：连接中的第一个包，状态就是NEW，我们可以理解为新连接的第一个包的状态为NEW。
# ESTABLISHED：我们可以把NEW状态包后面的包的状态理解为ESTABLISHED，表示连接已建立。
# RELATED：从字面上理解RELATED译为关系、相关的，但是这样仍然不容易理解，我们举个例子。比如FTP服务，FTP服务端会建立两个进程，一个命令进程，一个数据进程。命令进程负责服务端与客户端之间的命令传输（我们可以把这个传输过程理解成state中所谓的一个"连接"，暂称为"命令连接"）。数据进程负责服务端与客户端之间的数据传输 ( 我们把这个过程暂称为"数据连接" )。但是具体传输哪些数据，是由命令去控制的，所以，"数据连接"中的报文与"命令连接"是有"关系"的。那么，"数据连接"中的报文可能就是RELATED状态，因为这些报文与"命令连接"中的报文有关系。
## (注：如果想要对ftp进行连接追踪，需要单独加载对应的内核模块nf_conntrack_ftp，如果想要自动加载，可以配置/etc/sysconfig/iptables-config文件)
# INVALID：如果一个包没有办法被识别，或者这个包没有任何状态，那么这个包的状态就是INVALID，我们可以主动屏蔽状态为INVALID的报文。
# UNTRACKED：报文的状态为UNTRACKED时，表示报文未被追踪，当报文的状态为UNTRACKED时通常表示无法找到相关的连接。

[root@bogon ~]# iptables -I INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
[root@bogon ~]# iptables -A INPUT -j REJECT
# 将状态为RELATED和ESTABLISHED的报文都放行，这样，就表示只有回应我们的报文能够通过防火墙，如果是别人主动发送过来的新的报文，则无法通过防火墙。如想通过ssh连接本机，是不行的，但本机可以ssh连接其他主机。
```

### 黑白名单机制

```shell
# 当链的默认策略为ACCEPT时，链中的规则对应的动作应该为DROP或者REJECT，表示只有匹配到规则的报文才会被拒绝，没有被规则匹配到的报文都会被默认接受，这就是"黑名单"机制。
# 当链的默认策略为DROP时，链中的规则对应的动作应该为ACCEPT，表示只有匹配到规则的报文才会被放行，没有被规则匹配到的报文都会被默认拒绝，这就是"白名单"机制。

* 白名单
[root@bogon ~]# iptables -I INPUT -p tcp --dport 22 -j ACCEPT
[root@bogon ~]# iptables -I INPUT -p tcp --dport 80 -j ACCEPT
[root@bogon ~]# iptables -P INPUT DROP
[root@bogon ~]# iptables --line -nxvL INPUT
Chain INPUT (policy DROP 336 packets, 17902 bytes)
num      pkts      bytes target     prot opt in     out     source               destination         
1           0        0 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:80
2         130     9172 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            tcp dpt:22
# 放行22与80端口，并将默认策略改为DROP，这样其他端口都是无法访问的。因为只改了INPUT链为DROP，OUTPUT链的默认策略还是ACCEPT，所以可以访问80与22端口。如果OUTPUT的默认策略也是DROP，那就要再写两条出的规则。
# 如果此时有误操作，删除了防火墙规则，那么所有连接就都无法进来了。也就是无法通过远程连接主机了。
# 如果想要使用"白名单"的机制，最好将链的默认策略保持为"ACCEPT"，然后将"拒绝所有请求"这条规则放在链的尾部，将"放行规则"放在前面，这样做，既能实现"白名单"机制，又能保证在规则被清空时，管理员还有机会连接到主机
[root@bogon ~]# iptables -P INPUT ACCEPT
[root@bogon ~]# iptables -A INPUT -j REJECT
# 当所有放行规则设置完成后，在INPUT链的尾部，设置一条拒绝所有请求的规则。这样就能必免上面的问题了
```

