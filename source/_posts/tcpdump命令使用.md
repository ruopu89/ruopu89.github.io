---
title: tcpdump命令使用
date: 2018-11-19 10:27:01
tags: tcpdump
categories: 网络
---

### tcpdump命令使用

```shell
* tcpdump如果不指定字节大小，默认只抓每个包的前68个字节。通常是把tcp、ip、还有包头可以抓完整的
例：
root@kali:~# tcpdump -i eth0 -s 0 -w a.cap
# -i指定网卡；-s指定数据包的大小，如果用0就表示全部包，这里应该指定的是多少字节；-w指定将结果保存到一个
# 文件中。这会抓取到所有经过eth0端口的包。70900 packets captured表示抓到了70900个包
ping 172.16.0.108
# 用另一台主机ping这台kali，产生一些数据包
tcpdump -r a.cap
# 读取刚才生成的包文件
tcpdump -A -r a.cap
# 使用ASCII码的格式显示包
tcpdump -X -r a.cap
# 使用16进制的格式显示包
tcpdump -i eth0 tcp port 22
# 抓取eth0上的tcp协议端口22的包，这叫抓包筛选器
nc -nv 172.16.0.108 22
# 使用nc命令连接地址的端口
nc -nv 172.16.0.108 80
# 连接80端口，但这时是不会抓取包的，因为只监听了网络的22端口

例：显示筛选器
tcpdump -n -r http.cap | awk '{print $3}' | sort -u
# 显示筛选器。-n表示不对包内的地址做名称解析。sort的-u选项是去除重复的项
tcpdump -n src host 172.16.0.108 -r a.cap
# src host表示源地址，这是只显示源地址是172.16.0.108的包
tcpdump -n dst host 172.16.0.108 -r a.cap
# 显示目标地址
tcpdump -n port 53 -r http.cap
# 显示端口为53的包
tcpdump -n tcp port 53 -r http.cap
# 显示tcp的包，也可以显示udp协议的包
tcpdump -nX port 80 -r http.cap
# 可以加上X选项，以16进制显示

* 高级筛选
可以筛选包头里其他部分。图中是TCP的包头结构，以8个位为一个字节，每一行的内容表示4个字节，0-7是一个字节，8-16又是一个字节。一共是32个位。源端口占用了前面的16个位，也就是两个字节。目的端口占用后面的2个位（16个字节）。之后的Sequence Number和Acknowledgment Number都是占用32个位的，也就是4个字节。下面一个字节被分成了两个部分，第一部分是数据的偏移量，如果这时包被分段了，那么就会有数据的偏移量，保留了几个位之后，后面的就是tcp的flag，也就是标签位，表示当前这个包是什么类型的包，如是SYN包，还是回的ACK+SYN包，每一个位表示一个包的类型，如FIN是1，就表示FIN的flag标签的包，也就是哪位是1，就表示是那个位对应的类型的包有效。三次握手后，客户端发送的就是ACK+PSH包，这时这两个会标记为1，表示这是数据传输最起始的步骤。使用筛选时，如果不想看握手的包，就可以指定ACK+PSH为1的数据包。在图中，类型有8个，每个占用一个位，一共8位，我们要筛选的就是ACK+PSH是1，其他位都是0的包，计算成十进制就是24，二进制是00011000，所以转换为十进制是24。另外在表示类型的行上面有三行，共占12个字节。在类型前面的Data Offset和Res.还占用了一个字节，所以tcp的flag位是tcp包头时的每14个字节。（因为tcp包头的字节是从0开始的，这里只筛选tcp包头里第14个字节，但从表达式来说，应该是第13号。也就是第13号字节，实际就是第14个字节）转换为十进制是24的这些数据包，表达式命令如果
tcpdump -A -n 'tcp[13] = 24' -r http.cap
```

### 简介

用简单的话来定义tcpdump，就是：dump the traffic on a network，根据使用者的定义对网络上的数据包进行截获的包分析工具。 tcpdump可以将网络中传送的数据包的“头”完全截获下来提供分析。它支持针对网络层、协议、主机、网络或端口的过滤，并提供and、or、not等逻辑语句来帮助你去掉无用的信息。

![](/images/tcpdump/tcpdump.png)

```shell
* 默认启动
tcpdump
# 普通情况下，直接启动tcpdump将监视第一个网络接口上所有流过的数据包。

* 监视指定网络接口的数据包
tcpdump -i eth1
# 使用-i选项指定网卡。如果不指定网卡，默认tcpdump只会监视第一个网络接口，一般是eth0
 
* 监视指定主机的数据包
tcpdump host sundown
# 打印所有进入或离开sundown的数据包.

tcpdump host 210.27.48.1 
# 也可以指定ip,例如截获所有210.27.48.1 的主机收到的和发出的所有的数据包

tcpdump host helios and \( hot or ace \)
# 打印helios 与 hot 或者与 ace 之间通信的数据包

tcpdump host 210.27.48.1 and \ (210.27.48.2 or 210.27.48.3 \) 
# 截获主机210.27.48.1 和主机210.27.48.2 或210.27.48.3的通信

tcpdump ip host ace and not helios
# 打印ace与任何其他主机之间通信的IP 数据包, 但不包括与helios之间的数据包.

tcpdump ip host 210.27.48.1 and ! 210.27.48.2
# 获取主机210.27.48.1除了和主机210.27.48.2之外所有主机通信的ip包

tcpdump -i eth0 src host hostname
# 截获主机hostname发送的所有数据

tcpdump -i eth0 dst host hostname
# 监视所有发送到主机hostname的数据包
 
* 监视指定主机和端口的数据包

tcpdump tcp port 23 and host 210.27.48.1
# 获取主机210.27.48.1接收或发出的telnet包

tcpdump udp port 123 
# 对本机的udp 123 端口进行监视，123为ntp的服务端口
 
* 监视指定网络的数据包
tcpdump net ucb-ether
# 打印本地主机与Berkeley网络上的主机之间的所有通信数据包(nt: ucb-ether, 此处可理解为'Berkeley网络'的网络地址,此表达式最原始的含义可表达为: 打印网络地址为ucb-ether的所有数据包)

tcpdump 'gateway snup and (port ftp or ftp-data)'
# 打印所有通过网关snup的ftp数据包(注意, 表达式被单引号括起来了, 这可以防止shell对其中的括号进行错误解析)

tcpdump ip and not net localnet
# 打印所有源地址或目标地址是本地主机的IP数据包(如果本地网络通过网关连到了另一网络, 则另一网络并不能算作本地网络.(nt: 此句翻译曲折,需补充).localnet 实际使用时要真正替换成本地网络的名字)
 
* 监视指定协议的数据包
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0 and not src and dst net localnet'
# 打印TCP会话中的的开始和结束数据包, 并且数据包的源或目的不是本地网络上的主机.(nt: localnet, 实际使用时要真正替换成本地网络的名字)

tcpdump 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
# 打印所有源或目的端口是80, 网络层协议为IPv4, 并且含有数据,而不是SYN,FIN以及ACK-only等不含数据的数据包.(ipv6的版本的表达式可做练习)(nt: 可理解为, ip[2:2]表示整个ip数据包的长度, (ip[0]&0xf)<<2)表示ip数据包包头的长度(ip[0]&0xf代表包中的IHL域, 而此域的单位为32bit, 要换算成字节数需要乘以4,　即左移2.　(tcp[12]&0xf0)>>4 表示tcp头的长度, 此域的单位也是32bit,　换算成比特数为 ((tcp[12]&0xf0) >> 4)　<<　２,　 即 ((tcp[12]&0xf0)>>2).　((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0　表示: 整个ip数据包的长度减去ip头的长度,再减去 tcp头的长度不为0, 这就意味着, ip数据包中确实是有数据.对于ipv6版本只需考虑ipv6头中的'Payload Length' 与 'tcp头的长度'的差值, 并且其中表达方式'ip[]'需换成'ip6[]'.)

tcpdump 'gateway snup and ip[2:2] > 576'
# 打印长度超过576字节, 并且网关地址是snup的IP数据包

tcpdump 'ether[0] & 1 = 0 and ip[16] >= 224'
# 打印所有IP层广播或多播的数据包， 但不是物理以太网层的广播或多播数据报

tcpdump 'icmp[icmptype] != icmp-echo and icmp[icmptype] != icmp-echoreply'
# 打印除'echo request'或者'echo reply'类型以外的ICMP数据包( 比如,需要打印所有非ping 程序产生的数据包时可用到此表达式 . (nt: 'echo reuqest' 与 'echo reply' 这两种类型的ICMP数据包通常由ping程序产生))

tcpdump tcp -i eth1 -t -s 0 -c 100 and dst port ! 22 and src net 192.168.1.0/24 -w ./target.cap
# tcp: ip icmp arp rarp 和 tcp、udp、icmp这些选项等都要放到第一个参数的位置，用来过滤数据报的类型
# -i eth1 : 只抓经过接口eth1的包 
# -t : 不显示时间戳 
# -s 0 : 抓取数据包时默认抓取长度为68字节。加上-S 0 后可以抓到完整的数据包 
# -c 100 : 只抓取100个数据包 
# -dst port ! 22 : 不抓取目标端口是22的数据包 
# -src net 192.168.1.0/24 : 数据包的源网络地址为192.168.1.0/24 
# -w ./target.cap : 保存成cap文件，方便用ethereal(即wireshark)分析

* 使用tcpdump抓取HTTP包
tcpdump  -XvvennSs 0 -i eth0 tcp[20:2]=0x4745 or tcp[20:2]=0x4854
# 0x4745 为"GET"前两个字母"GE",0x4854 为"HTTP"前两个字母"HT"。
 
# tcpdump 对截获的数据并没有进行彻底解码，数据包内的大部分内容是使用十六进制的形式直接打印输出的。显然这不利于分析网络故障，通常的解决办法是先使用带-w参数的tcpdump 截获数据并保存到文件中，然后再使用其他程序(如Wireshark)进行解码分析。当然也应该定义过滤规则，以避免捕获的数据包填满整个硬盘。
```



### tcpdump的简单选项介绍

```shell
tcpdump采用命令行方式，它的命令格式为：

　　tcpdump [ -adeflnNOpqStvx ] [ -c 数量 ] [ -F 文件名 ]

　　　　　　　　　　[ -i 网络接口 ] [ -r 文件名] [ -s snaplen ]

                                       [ -T 类型 ] [ -w 文件名 ] [表达式 ]

-a 　　　# 将网络地址和广播地址转变成名字；
-A  # 以ASCII码方式显示每一个数据包(不会显示数据包中链路层头部信息). 在抓取包含网页数据的数据包时, 可方便查看数据(nt: 即Handy for capturing web pages).
-c  count     # tcpdump将在接受到count个数据包后退出.
-C  file-size (nt: 此选项用于配合-w file 选项使用)     # 该选项使得tcpdump在把原始数据包直接保存到文件中之前, 检查此文件大小是否超过file-size. 如果超过了, 将关闭此文件,另创一个文件继续用于原始数据包的记录. 新创建的文件名与-w 选项指定的文件名一致, 但文件名后多了一个数字.该数字会从1开始随着新创建文件的增多而增加. file-size的单位是百万字节(nt: 这里指1,000,000个字节,并非1,048,576个字节, 后者是以1024字节为1k, 1024k字节为1M计算所得, 即1M=1024 ＊ 1024 ＝ 1,048,576)
-d  # 以容易阅读的形式,在标准输出上打印出编排过的包匹配码, 随后tcpdump停止.(nt | rt: human readable, 容易阅读的,通常是指以ascii码来打印一些信息. compiled, 编排过的. packet-matching code, 包匹配码,含义未知, 需补充)
-dd # 以C语言的形式打印出包匹配码.
-ddd # 以十进制数的形式打印出包匹配码(会在包匹配码之前有一个附加的'count'前缀).
-D  # 打印系统中所有tcpdump可以在其上进行抓包的网络接口. 每一个接口会打印出数字编号, 相应的接口名字, 以及可能的一个网络接口描述. 其中网络接口名字和数字编号可以用在tcpdump 的-i flag 选项(nt: 把名字或数字代替flag), 来指定要在其上抓包的网络接口.此选项在不支持接口列表命令的系统上很有用(nt: 比如, Windows 系统, 或缺乏 ifconfig -a 的UNIX系统); 接口的数字编号在windows 2000 或其后的系统中很有用, 因为这些系统上的接口名字比较复杂, 而不易使用. 如果tcpdump编译时所依赖的libpcap库太老,-D 选项不会被支持, 因为其中缺乏 pcap_findalldevs()函数.
-e  # 每行的打印输出中将包括数据包的数据链路层头部信息
-E  spi@ipaddr algo:secret,...
# 可通过spi@ipaddr algo:secret 来解密IPsec ESP包(nt | rt:IPsec Encapsulating Security Payload,IPsec 封装安全负载, IPsec可理解为, 一整套对ip数据包的加密协议, ESP 为整个IP 数据包或其中上层协议部分被加密后的数据,前者的工作模式称为隧道模式; 后者的工作模式称为传输模式 . 工作原理, 另需补充).
# 需要注意的是, 在终端启动tcpdump 时, 可以为IPv4 ESP packets 设置密钥(secret）.
# 可用于加密的算法包括des-cbc, 3des-cbc, blowfish-cbc, rc3-cbc, cast128-cbc, 或者没有(none).默认的是des-cbc(nt: des, Data Encryption Standard, 数据加密标准, 加密算法未知, 另需补充).secret 为用于ESP 的密钥, 使用ASCII 字符串方式表达. 如果以 0x 开头, 该密钥将以16进制方式读入.
# 该选项中ESP 的定义遵循RFC2406, 而不是 RFC1827. 并且, 此选项只是用来调试的, 不推荐以真实密钥(secret)来使用该选项, 因为这样不安全: 在命令行中输入的secret 可以被其他人通过ps 等命令查看到.
# 除了以上的语法格式(nt: 指spi@ipaddr algo:secret), 还可以在后面添加一个语法输入文件名字供tcpdump 使用(nt：即把spi@ipaddr algo:secret,... 中...换成一个语法文件名). 此文件在接受到第一个ESP　包时会打开此文件, 所以最好此时把赋予tcpdump 的一些特权取消(nt: 可理解为, 这样防范之后, 当该文件为恶意编写时,不至于造成过大损害).
-f  # 显示外部的IPv4 地址时(nt: foreign IPv4 addresses, 可理解为, 非本机ip地址), 采用数字方式而不是名字.(此选项是用来对付Sun公司的NIS服务器的缺陷(nt: NIS, 网络信息服务, tcpdump 显示外部地址的名字时会用到她提供的名称服务): 此NIS服务器在查询非本地地址名字时,常常会陷入无尽的查询循环). 由于对外部(foreign)IPv4地址的测试需要用到本地网络接口(nt: tcpdump 抓包时用到的接口)及其IPv4 地址和网络掩码. 如果此地址或网络掩码不可用, 或者此接口根本就没有设置相应网络地址和网络掩码(nt: linux 下的 'any' 网络接口就不需要设置地址和掩码, 不过此'any'接口可以收到系统中所有接口的数据包), 该选项不能正常工作.
-F  file     #使用file 文件作为过滤条件表达式的输入, 此时命令行上的输入将被忽略.
-i  interface
# 指定tcpdump 需要监听的接口.  如果没有指定, tcpdump 会从系统接口列表中搜寻编号最小的已配置好的接口(不包括 loopback 接口).一但找到第一个符合条件的接口, 搜寻马上结束.
# 在采用2.2版本或之后版本内核的Linux 操作系统上, 'any' 这个虚拟网络接口可被用来接收所有网络接口上的数据包(nt: 这会包括目的是该网络接口的, 也包括目的不是该网络接口的). 需要注意的是如果真实网络接口不能工作在'混杂'模式(promiscuous)下,则无法在'any'这个虚拟的网络接口上抓取其数据包.
# 如果 -D 标志被指定, tcpdump会打印系统中的接口编号，而该编号就可用于此处的interface 参数.
-l  # 对标准输出进行行缓冲(nt: 使标准输出设备遇到一个换行符就马上把这行的内容打印出来).在需要同时观察抓包打印以及保存抓包记录的时候很有用. 比如, 可通过以下命令组合来达到此目的:     ``tcpdump  -l  |  tee dat'' 或者 ``tcpdump  -l   > dat  &  tail  -f  dat''.(nt: 前者使用tee来把tcpdump 的输出同时放到文件dat和标准输出中, 而后者通过重定向操作'>', 把tcpdump的输出放到dat 文件中, 同时通过tail把dat文件中的内容放到标准输出中)
-L  # 列出指定网络接口所支持的数据链路层的类型后退出.(nt: 指定接口通过-i 来指定)
-m  module     # 通过module 指定的file 装载SMI MIB 模块(nt: SMI，Structure of Management Information, 管理信息结构MIB, Management Information Base, 管理信息库. 可理解为, 这两者用于SNMP(Simple Network Management Protoco)协议数据包的抓取. 具体SNMP 的工作原理未知, 另需补充). 此选项可多次使用, 从而为tcpdump 装载不同的MIB 模块.
-M  # secret  如果TCP 数据包(TCP segments)有TCP-MD5选项(在RFC 2385有相关描述), 则为其摘要的验证指定一个公共的密钥secret.
-n  # 不对地址(比如, 主机地址, 端口号)进行数字表示到名字表示的转换.
-nn：    # 指定将每个监听到的数据包中的域名转换成IP、端口从应用名称转换成端口号后显示
-N  # 不打印出host 的域名部分. 比如, 如果设置了此选现, tcpdump 将会打印'nic' 而不是 'nic.ddn.mil'.
-O  # 不启用进行包匹配时所用的优化代码. 当怀疑某些bug是由优化代码引起的, 此选项将很有用.
-p  # 一般情况下, 把网络接口设置为非'混杂'模式. 但必须注意 , 在特殊情况下此网络接口还是会以'混杂'模式来工作； 从而, '-p' 的设与不设, 不能当做以下选现的代名词:'ether host {local-hw-add}' 或  'ether broadcast'(nt: 前者表示只匹配以太网地址为host 的包, 后者表示匹配以太网地址为广播地址的数据包).
-q  # 快速(也许用'安静'更好?)打印输出. 即打印很少的协议相关信息, 从而输出行都比较简短.
-R  # 设定tcpdump 对 ESP/AH 数据包的解析按照 RFC1825而不是RFC1829(nt: AH, 认证头, ESP， 安全负载封装, 这两者会用在IP包的安全传输机制中). 如果此选项被设置, tcpdump 将不会打印出'禁止中继'域(nt: relay prevention field). 另外,由于ESP/AH规范中没有规定ESP/AH数据包必须拥有协议版本号域,所以tcpdump不能从收到的ESP/AH数据包中推导出协议版本号.
-r  file     # 从文件file 中读取包数据. 如果file 字段为 '-' 符号, 则tcpdump 会从标准输入中读取包数据.
-S  # 打印TCP 数据包的顺序号时, 使用绝对的顺序号, 而不是相对的顺序号.(nt: 相对顺序号可理解为, 相对第一个TCP 包顺序号的差距,比如, 接受方收到第一个数据包的绝对顺序号为232323, 对于后来接收到的第2个,第3个数据包, tcpdump会打印其序列号为1, 2分别表示与第一个数据包的差距为1 和 2. 而如果此时-S 选项被设置, 对于后来接收到的第2个, 第3个数据包会打印出其绝对顺序号:232324, 232325).
-s  snaplen     # 设置tcpdump的数据包抓取长度为snaplen, 如果不设置默认将会是68字节(而支持网络接口分接头(nt: NIT, 上文已有描述,可搜索'网络接口分接头'关键字找到那里)的SunOS系列操作系统中默认的也是最小值是96).68字节对于IP, ICMP(nt: Internet Control Message Protocol,因特网控制报文协议), TCP 以及 UDP 协议的报文已足够, 但对于名称服务(nt: 可理解为dns, nis等服务), NFS服务相关的数据包会产生包截短. 如果产生包截短这种情况, tcpdump的相应打印输出行中会出现''[|proto]''的标志（proto 实际会显示为被截短的数据包的相关协议层次). 需要注意的是, 采用长的抓取长度(nt: snaplen比较大), 会增加包的处理时间, 并且会减少tcpdump 可缓存的数据包的数量， 从而会导致数据包的丢失. 所以, 在能抓取我们想要的包的前提下, 抓取长度越小越好.把snaplen 设置为0 意味着让tcpdump自动选择合适的长度来抓取数据包.
-T  type    # 强制tcpdump按type指定的协议所描述的包结构来分析收到的数据包.  目前已知的type 可取的协议为:     aodv (Ad-hoc On-demand Distance Vector protocol, 按需距离向量路由协议, 在Ad hoc(点对点模式)网络中使用),     cnfp (Cisco  NetFlow  protocol),  rpc(Remote Procedure Call), rtp (Real-Time Applications protocol),     rtcp (Real-Time Applications con-trol protocol), snmp (Simple Network Management Protocol),     tftp (Trivial File Transfer Protocol, 碎文件协议), vat (Visual Audio Tool, 可用于在internet 上进行电     视电话会议的应用层协议), 以及wb (distributed White Board, 可用于网络会议的应用层协议).
-t     # 在每行输出中不打印时间戳
-tt    # 不对每行输出的时间进行格式处理(nt: 这种格式一眼可能看不出其含义, 如时间戳打印成1261798315)
-ttt   # tcpdump 输出时, 每两行打印之间会延迟一个段时间(以毫秒为单位)
-tttt  # 在每行打印的时间戳之前添加日期的打印
-u     # 打印出未加密的NFS 句柄(nt: handle可理解为NFS 中使用的文件句柄, 这将包括文件夹和文件夹中的文件)
-U    # 使得当tcpdump在使用-w 选项时, 其文件写入与包的保存同步.(nt: 即, 当每个数据包被保存时, 它将及时被写入文件中,而不是等文件的输出缓冲已满时才真正写入此文件)。-U 标志在老版本的libcap库(nt: tcpdump 所依赖的报文捕获库)上不起作用, 因为其中缺乏pcap_cump_flush()函数.
-v    # 当分析和打印的时候, 产生详细的输出. 比如, 包的生存时间, 标识, 总长度以及IP包的一些选项. 这也会打开一些附加的包完整性检测, 比如对IP或ICMP包头部的校验和.
-vv   # 产生比-v更详细的输出. 比如, NFS回应包中的附加域将会被打印, SMB数据包也会被完全解码.
-vvv  # 产生比-vv更详细的输出. 比如, telent 时所使用的SB, SE 选项将会被打印, 如果telnet同时使用的是图形界面, 其相应的图形选项将会以16进制的方式打印出来(nt: telnet 的SB,SE选项含义未知, 另需补充).
-w    # 把包数据直接写入文件而不进行分析和打印输出. 这些包数据可在随后通过-r 选项来重新读入并进行分析和打印.
-W    filecount      # 此选项与-C 选项配合使用, 这将限制可打开的文件数目, 并且当文件数据超过这里设置的限制时, 依次循环替代之前的文件, 这相当于一个拥有filecount 个文件的文件缓冲池. 同时, 该选项会使得每个文件名的开头会出现足够多并用来占位的0, 这可以方便这些文件被正确的排序.
-x    # 当分析和打印时, tcpdump 会打印每个包的头部数据, 同时会以16进制打印出每个包的数据(但不包括连接层的头部).总共打印的数据大小不会超过整个数据包的大小与snaplen 中的最小值. 必须要注意的是, 如果高层协议数据没有snaplen 这么长,并且数据链路层(比如, Ethernet层)有填充数据, 则这些填充数据也会被打印.(nt: so for link  layers  that pad, 未能衔接理解和翻译, 需补充 )
-xx   # tcpdump 会打印每个包的头部数据, 同时会以16进制打印出每个包的数据, 其中包括数据链路层的头部.
-X    # 当分析和打印时, tcpdump 会打印每个包的头部数据, 同时会以16进制和ASCII码形式打印出每个包的数据(但不包括连接层的头部).这对于分析一些新协议的数据包很方便.
-XX   # 当分析和打印时, tcpdump 会打印每个包的头部数据, 同时会以16进制和ASCII码形式打印出每个包的数据, 其中包括数据链路层的头部.这对于分析一些新协议的数据包很方便.
-y    # datalinktype       设置tcpdump 只捕获数据链路层协议类型是datalinktype的数据包
-Z    user      # 使tcpdump 放弃自己的超级权限(如果以root用户启动tcpdump, tcpdump将会有超级用户权限), 并把当前tcpdump的用户ID设置为user, 组ID设置为user首要所属组的ID(nt: tcpdump 此处可理解为tcpdump 运行之后对应的进程)。此选项也可在编译的时候被设置为默认打开.(nt: 此时user 的取值未知, 需补充)
```



### expression 表达式

```shell
==一个基本的表达式单元格式为"proto dir type ID"==

对于表达式语法，参考 pcap-filter 【pcap-filter - packet filter syntax】

类型 type
host, net, port, portrange

例如：host 192.168.201.128 , net 128.3, port 20, portrange 6000-6008'

目标 dir
src, dst, src or dst, src and dst

协议 proto
tcp， udp ， icmp，若未给定协议类型，则匹配所有可能的类型

==表达式单元之间可以使用操作符" and / && / or / || / not / ! "进行连接，从而组成复杂的条件表达式==。如"host foo and not port ftp and not port ftp-data"，这表示筛选的数据包要满足"主机为foo且端口不是ftp(端口21)和ftp-data(端口20)的包"，常用端口和名字的对应关系可在linux系统中的/etc/service文件中找到。

另外，同样的修饰符可省略，如"tcp dst port ftp or ftp-data or domain"与"tcp dst port ftp or tcp dst port ftp-data or tcp dst port domain"意义相同，都表示包的协议为tcp且目的端口为ftp或ftp-data或domain(端口53)。

使用括号"()"可以改变表达式的优先级，但需要注意的是括号会被shell解释，所以应该使用反斜线""转义为"()"，在需要的时候，还需要包围在引号中。
```



### 命令

```shell
tcpdump –i eth0 ‘port 1111’ -X -c 3
# -i 是interface的含义，是指我们有义务告诉tcpdump希望他去监听哪一个网卡,
# -X告诉tcpdump命令，需要把协议头和包内容都原原本本的显示出来（tcpdump会以16进制和ASCII的形式显示），这在进行协议分析时是绝对的利器。port 1111我们只关心源端口或目的端口是1111的数据包.
# -c 是Count的含义，这设置了我们希望tcpdump帮我们抓几个包。

tcpdump -i eth0 port 1111 -l | awk '{print $1}'
# 提取包的每一行的第一个域(时间域)，这种情况下我们就需要-l将默认的全缓冲变为行缓冲了。
# -l选项的作用就是将tcpdump的输出变为“行缓冲”方式，这样可以确保tcpdump遇到的内容一旦是换行符即将缓冲的内容输出到标准输出，以便于利用管道或重定向方式来进行后续处理。
# Linux/UNIX的标准I/O提供了全缓冲、行缓冲和无缓冲三种缓冲方式。
# 标准错误是不带缓冲的，终端设备常为行缓冲，而其他情况默认都是全缓冲的。

tcpdump -i eth0 port 1111 -c 3 -w cp.pcap
# -w 直接将包写入文件中(即原始包，如果使用 重定向 > 则只是保存显示的结果，而不是原始文件)，即所谓的“流量保存”---就是把抓到的网络包能存储到磁盘上，保存下来，为后续使用。参数-r 达到“流量回放”---就是把历史上的某一时间段的流量，重新模拟回放出来，用于流量分析。

tcpdump i- eth0 'port 1111' -c 3 -r cp.pcap 
# 通过-w选项将流量都存储在cp.pcap(二进制格式)文件中了.可以通过 –r 读取raw packets文件 cp.pcap. 

tcpdump -i eth0 -e -nn -X -c 2 'port1111'
# -n不把网络地址转换成名字

ruopu@ruopu-PC:~$ sudo tcpdump -i enp0s25 -e -nnvv -X -c 2 'port 80'
tcpdump: listening on enp0s25, link-type EN10MB (Ethernet), capture size 262144 bytes
14:09:31.285330 50:7b:9d:65:f9:ff > 8c:a6:df:ec:9e:52, ethertype IPv4 (0x0800), length 74: (tos 0x0, ttl 64, id 15932, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.0.89.43174 > 101.37.97.51.80: Flags [S], cksum 0x8788 (incorrect -> 0xa52d), seq 1891133781, win 29200, options [mss 1460,sackOK,TS val 4099617288 ecr 0,nop,wscale 7], length 0
	0x0000:  4500 003c 3e3c 4000 4006 7526 c0a8 0059  E..<><@.@.u&...Y
	0x0010:  6525 6133 a8a6 0050 70b8 6955 0000 0000  e%a3...Pp.iU....
	0x0020:  a002 7210 8788 0000 0204 05b4 0402 080a  ..r.............
	0x0030:  f45b 3208 0000 0000 0103 0307            .[2.........
14:09:31.320699 8c:a6:df:ec:9e:52 > 50:7b:9d:65:f9:ff, ethertype IPv4 (0x0800), length 66: (tos 0x0, ttl 51, id 0, offset 0, flags [DF], proto TCP (6), length 52)
    101.37.97.51.80 > 192.168.0.89.43174: Flags [S.], cksum 0x9a5b (correct), seq 1054611816, ack 1891133782, win 29200, options [mss 1444,nop,nop,sackOK,nop,wscale 9], length 0
	0x0000:  4500 0034 0000 4000 3306 c06a 6525 6133  E..4..@.3..je%a3
	0x0010:  c0a8 0059 0050 a8a6 3edc 1968 70b8 6956  ...Y.P..>..hp.iV
	0x0020:  8012 7210 9a5b 0000 0204 05a4 0101 0402  ..r..[..........
	0x0030:  0103 0309                                ....
2 packets captured
3 packets received by filter
0 packets dropped by kernel
# tcpdump: verbose output suppressed, use -v or -vv for full protocol decode表示使用选项-v和-vv可以看到更完全的输出信息
# listening on enp0s25, link-type EN10MB (Ethernet), capture size 262144 bytes表示监听enp0s25网卡，它的链路层是基于以太网的，要抓的包大小限制为262144字节。包大小限制值可以通过-s选项来设置。
# 14:09:31.285330 表示这个包被抓到的“时”、“分”、“秒”、“微秒”
# 50:7b:9d:65:f9:ff > 8c:a6:df:ec:9e:52表示从哪个MAC地址发往哪个MAC地址
# ethertype IPv4 (0x0800)表示Ethernet帧的协议类型为ipv4，代码为0x0800
# length 74表示以太帧长度为74
# 192.168.0.89.43174 > 101.37.97.51.80表示源IP192.168.0.89，端口43174向101.37.97.51的80号端口传输数据。
# Flags [S]表示是syn建立连接包(即三次握手的第一次握手)
# seq 1891133781 表示序号为1891133781
# win 29200  表示窗口大小为29200

* tcpdump过滤语句
# 过滤表达式大体可以分成三种过滤条件，“类型”、“方向”和“协议”，这三种条件的搭配组合就构成了我们的过滤表达式。
# 关于类型的关键字，主要包括host，net，port, 例如 host 210.45.114.211，指定主机210.45.114.211，net 210.11.0.0 指明210.11.0.0是一个网络地址，port 21 指明端口号是21。如果没有指定类型，缺省的类型是host.
# 关于传输方向的关键字，主要包括src , dst ,dst or src, dst and src ,这些关键字指明了传输的方向。例：src 210.45.114.211 ,指明ip包中源地址是210.45.114.211, dst net 210.11.0.0 指明目的网络地址是210.11.0.0。如果没有指明方向关键字，则缺省是src or dst关键字。
# 关于协议的关键字，主要包括 ether,ip,ip6,arp,rarp,tcp,udp等类型。这几个的包的协议内容。如果没有指定任何协议，则tcpdump将会监听所有协议的信息包。

 tcpdump -i eth0 -nn -c 1 'tcp'
 # 只抓tcp的包
 
# 除了这三种类型的关键字之外，其他重要的关键字：gateway, broadcast,less,greater。还有三种逻辑运算，取非运算是 'not ','! ', 与运算是'and','&&';或运算是'or','||'；

sudo tcpdump -i eth0 -c 10 'dst port 21 or dst port 80'
# 只想查目标机器端口是21或80的网络包，其他端口的我不关注

sudo tcpdump -i eth0 -c 3 'host 172.16.0.11 and (210.45.123.249 or 210.45.123.248)'
# 想要截获主机172.16.0.11 和主机210.45.123.249或 210.45.123.248的通信，使用命令(注意括号的使用)

sudo tcpdump 'port ftp or ftp-data'
# 想获取使用ftp端口和ftp数据端口的网络包这里 ftp、ftp-data到底对应哪个端口？ linux系统下 /etc/services这个文件里面，就存储着所有知名服务和传输层端口的对应关系。如果你直接把/etc/services里的ftp对应的端口值从21改为了3333，那么tcpdump就会去抓端口含有3333的网络包了。

sudo tcpdump ip ‘host 172.16.0.11 and ! 210.45.123.249’
# 如果想要获取主机172.16.0.11除了和主机210.45.123.249之外所有主机通信的ip包

sudo tcpdump -i eth0 ‘host 172.16.0.11 and ! port 80 and ! port 25 and ! port 110’
# 抓172.16.0.11的80端口和110和25以外的其他端口的包

sudo tcpdump -i eth0 'host 172.16.0.11 and host google.com and tcp[tcpflags]&tcp-syn!=0' -c 3 -nn
# 获取172.16.10.11和google.com之间建立TCP三次握手中带有SYN标记位的网络包

proto [expr : size]
# Proto即protocol的缩写，它表示这里要指定的是某种协议名称，如ip,tcp,udp等。总之可以指定的协议有十多种，如链路层协议 ether,fddi,tr,wlan,ppp,slip,link,网络层协议ip,ip6,arp,rarp,icmp传输层协议tcp,udp等。expr用来指定数据报字节单位的偏移量，该偏移量相对于指定的协议层，默认的起始位置是0；而size表示从偏移量的位置开始提取多少个字节，可以设置为1、2、4,默认为1字节。如果只设置了expr，而没有设置size，则默认提取1个字节。比如ip[2:2]，就表示提取出第3、4个字节；而ip[0]则表示提取ip协议头的第一个字节。在我们提取了特定内容之后，我们就需要设置我们的过滤条件了，我们可用的“比较操作符”包括：>，<，>=，<=，=，!=，总共有6个。

sudo tcpdump 'tcp[13] & 3 != 0 and not(src and dst net 172.16.0.0)' -nn
# 截取每个TCP会话的起始和结束报文(SYN 和 FIN 报文), 而且会话方中有一个远程主机.
# tcp偏移13字节的位置为2位保留位和6位标志位(URG,ACK,PSH,RST,SYN,FIN), 所以与3相与就可以得出SYN,FIN其中是否一个置位1. 从上面可以看到在写过滤表达式时，需要我们对协议格式比较理解才能把表达式写对。为了让tcpdump工具更人性化一些，有一些常用的偏移量，可以通过一些名称来代替，比如icmptype表示ICMP协议的类型域、icmpcode表示ICMP的code域，tcpflags则表示TCP协议的标志字段域。更进一步的，对于ICMP的类型域，可以用这些名称具体指代：icmp-echoreply, icmp-unreach, icmp-sourcequench, icmp-redirect,icmp-echo, icmp-routeradvert, icmp-routersolicit, icmp-timxceed, icmp-paramprob,icmp-tstamp, icmp-tstampreply, icmp-ireq, icmp-ireqreply, icmp-maskreq,icmp-maskreply。而对于TCP协议的标志字段域，则可以细分为tcp-fin, tcp-syn, tcp-rst, tcp-push, tcp-ack, tcp-urg。
```



