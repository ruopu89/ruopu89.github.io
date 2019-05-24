---
title: zabbix监控方式
date: 2019-04-23 11:08:14
tags: zabbix
categories: 监控
---

# 方式

## Active agents

使用Zabbix agent创建监控项时有两种方式，即Active（主动式）agent和Passive （被动式）agent。这里所说的主动或被动指的是客户端主动发送数据或被动等待Server端来采集数据。

在Active agent模式下，Zabbix agent启动后，由agent端初始化和Zabbix server之间的通信，向Zabbix server发出获取监控项清单的请求，server端收到请求后响应agent发出的请求，并将监控项清单发送给agent。agent端定期和Zabbix server通信，保证获得最新的监控项清单。agent则根据监控项清单查询监控项的数据并将结果发送给Zabbixserver。

为了启用Active agent模式，需要在zabbix_agentd.conf文件中配置ServerActive参数，告诉agent可以联系到哪些服务器（默认端口是10051）。通过配置RefreshActiveChecks参数，可以设置agent端多长时间向server询问一次监控项清单，默认是120秒。在默认设置下server端改变active agent监控项有关的一些设置后，server端需要1分钟刷新配置缓存（通过server配置文件中的参数CacheUpdateFrequency设置，默认是60秒），agent需要等待2分钟才能够知道监控项的变化。如果从server查询监控项清单失败（网络问题或其他原因），agent端会等待1分钟后重新向server发出查询请求。Active agent也有自己的缓存，可以通过BufferSend或BufferSize进行设置， BufferSend参数设置监控项数据在缓存中保留的时间，默认是5秒（可以设置到3600）。BufferSize参数设置保留监控项数据的缓存大小，默认是100（可以设置到65535）

配置Active agent监控项的步骤：

1. Zabbix agent安装完成后，打开配置文件zabbix_agentd.conf。
2. 设置ServerActive参数，格式为IP:port 或DNS主机名:port。在这里我们可以设置多个server或proxy的DNS主机名或IP地址，用逗号分隔。
3. 设置Hostname参数，这个名字必须是唯一的并和Zabbixserver中Configuration -->Hosts页面中添加的主机名称相同。也与主机名无关，只是zabbix_agentd.conf配置文件中Hostname名称与ZabbixServer的web页面中配置-->主机中添加的主机名要一致
4. 验证Zabbix server的10051端口能够访问。
5. 重启zabbix_agent（systemctl restart zabbix-agent.service）。
6. 检查agent日志（tail -f/var/log/zabbix/zabbix_agentd.log）。
7. 在主机中添加主动式监控项（Configuration --> Hosts --> Items --> Create item）。选择监控项的Type（类型）为Zabbix agent（active）。



## Passive agents

Passive agent为我们提供了一种简单易行的方法，Zabbixserver或proxy根据监控项中配置的Update interval（数据更新间隔），定期向agent端发出查询请求，如CPU负载、磁盘使用空间等等。agent根据请求收集监控项数据并返回给server或proxy。整个过程就是简单的一问一答，你要什么值我给你什么值，从agent角度来看是被动的回答。

配置Passive agent监控项的步骤：

1. 安装Zabbix agent，打开配置文件zabbix_agentd.conf。
2. 设置Server参数，格式为IP 或DNS主机名。在这里我们可以设置多个server或proxy的DNS主机名或IP地址，用逗号分隔。
3. 注释掉ServerActive和Hostname这两个参数，在Passive agent模式中不需要这两个参数，如果你想同时使用active agent，这两个参数必须配置。
4. 验证agent端的10050端口能够访问。
5. 重启zabbix_agent（systemctl restart zabbix-agent.service）。
6. 检查agent日志（tail -f /var/log/zabbix/zabbix_agentd.log）。
7. 在主机中添加被动式监控项（Configuration --> Hosts --> Items --> Create item）。选择监控项的Type（类型）为Zabbix agent。



## Extending agents

Zabbix中提供了一些标准的监控项可以使用Key，当你添加Zabbix agent监控项时可以选择使用，但在实际环境中这些标准的Key并不能满足特定的监控需求，在Zabbix中可以使用多种方法进行扩展，其中一个方法就是在agent配置文件中使用UserParameter进行扩展。

通过UserParameter参数扩展监控项的key，可以灵活的实现多种监控需求。Zabbix中定义UserParameter的格式为UserParameter=\<key\>,\<command\>。

配置UserParameter的步骤：

1. 打开agent配置文件zabbix_agentd.conf。
2. 设置UserParameter参数。例如：UserParameter=mysql.threads,mysqladmin -u root –p\<password\> status|cut -f3 -d":"|cut -f1-d"Q" ，该参数返回MySQL线程的数量给自定义的key：mysql.threads。
3. 保存配置文件，重新启动Zabbix agent服务。
4. Web前端Configuration --> Hosts--> Items页面中添加监控项。
   - Name字段中设置监控项名称，例如 MySQL Threads。
   - Type字段中选择Zabbix agent或者Zabbix agent（active）。
   - Key字段中填写mysql.threads，这里填写的内容必须和UserParameter中定义的一样。
   - Type of Information字段中选择Numeric数字的（unsigned）。
   - Data type中选择Decimal十进制。
   - 其他配置参数保持不变。点击Add按钮保存。

5. Monitoring --> Latest data页面查看监控项MySQL Threads。



# 监控项

## Simple checks

Zabbix 中simple checks是基于ICMP ping或者端口检测来确定主机是否在线或服务端口能否正常连接。这种方式下主机中不需要安装Zabbix agent，当我们检测主机或端口的可用性时simplechecks返回的值为1或者0，当我们检测性能时返回的是浮点数（如检测ping的响应时间时返回值0.02秒），如果检测失败则返回0。

为了降低网络流量，更高效的进行ICMP检测，Zabbix执行icmppingsec、icmpping 和 icmppingloss检测时使用了一个第三方的工具fping和fping6，依赖linux不同的发行版安装的版本各有不同，建议使用fping 3.0以上的版本。在CentOS系统中需要安装fping时可以通过命令yum install fping完成安装。

Zabbix中默认定义了3个用于ICMP检测的监控项和2个用于TCP/UDP连接检测的监控项，分别是：

- Icmpping：主机响应ICMP ping返回1，否则返回0。
- Icmppingloss：返回丢失ICMP ping数据包的百分比。
- Icmppingsec：返回ICMP ping的响应时间，单位是秒。如果主机没有响应（timeout reached）则返回0。如果返回值小于0.0001秒时返回值将被设置为0.0001。
- Net.tcp.service / net.udp.service：主机上指定的服务正常运行并能建立TCP / UDP连接时返回1，否则返回0。
- Net.tcp.service.perf / net.udp.service.perf：返回连接到指定TCP / UDP端口的服务所使用的时间，单位是秒。如果服务没有运行则返回0.000000。

net.tcp.service 和net.tcp.service.perf支持我们知道的大部分协议，如SSH、FTP、HTTP等。这两个项目是非常有用的，我们可以对特定的IP和端口进行简单的TCP握手连接完成可用性的检测，同时对主机或应用的性能不会有任何影响。

下面一起来看看这几个项目的用法。

- Icmpping

格式：Icmpping[\<target\>,\<packets\>,\<interval\>,\<size\>,\<timeout\>]。其中target是主机IP或DNS主机名；packets是数据包的数量；interval是数据包之间的间隔时间，单位是微秒；size是数据包的大小，单位是bytes；timeout是超时时间，单位是微秒。例如icmpping[,20,50,256,100]，如果你不想定义target、packet等值，可以不填写任何参数，可以写成icmpping[,4]，只要4个数据包有1个响应，监控项就会返回1。

- Icmppingloss

格式：icmppingloss[\<target\>,\<packets\>,\<interval\>,\<size\>,\<timeout\>]。其中target是主机IP或DNS主机名；packets是数据包的数量；interval是数据包之间的间隔时间，单位是微秒；size是数据包的大小，单位是bytes；timeout是超时时间，单位是微秒。

- Icmppingsec

格式：icmppingsec[\<target\>,\<packets\>,\<interval\>,\<size\>,\<timeout\>,\<mode\>]。其中target是主机IP或DNS主机名；packets是数据包的数量；interval是数据包之间的间隔时间，单位是微秒；size是数据包的大小，单位是bytes；timeout是超时时间，单位是微秒。

- net.tcp.servic

格式：net.tcp.service[service,\<ip\>,\<port\>]。其中service是TCP协议的名称，如：ssh、ldap、smtp、ftp、http、pop、nntp、imap、Telnet等等；IP是IP地址或DNS主机名（默认使用定义监控项的主机的IP或DNS主机名）；port是端口号（默认使用服务标准的端口号）。例如：net.tcp.service[ftp,45]。当前不支持加密协议的检测，像IMAP的993端口或POP的995端口，但我们可以用net.tcp.service[tcp,\<ip\>,port]来完成对它们的检测。Zabbix 从v2.0起支持https和telnet。

- net.tcp.service.perf

格式：net.tcp.service.perf[service,\<ip\>,\<port\>]。其中service是TCP协议的名称，如：ssh、ldap、smtp、ftp、http、pop、nntp、imap、Telnet等等；IP是主机的IP地址或DNS主机名（默认使用定义该监控项主机的IP或DNS主机名）；port是端口号（默认使用服务标准的端口号）。例如：net.tcp.service.perf [ssh]。当前不支持加密协议的检测，像IMAP在993端口或POP在995端口上，但我们可以用net.tcp.service.perf [tcp,\<ip\>,port]来完成对它们的检测。

- net.udp.service

格式：net.udp.service[service,\<ip\>,\<port\>]。其中service是UDP协议的名称，如：ntp；IP是主机的IP地址或DNS主机名（默认使用定义该监控项主机的IP或DNS主机名）；port是端口号（默认使用服务标准的端口号）。例如：net.udp.service[ntp,45]，在UDP端口45上检测NTP服务的可用性。

- net.udp.service.perf

格式：net.udp.service.perf[service,\<ip\>,\<port\>]。其中service是UDP协议的名称，如：ntp；IP是主机的IP地址或DNS主机名（默认使用定义该监控项主机的IP或DNS主机名）；port是端口号（默认使用服务标准的端口号）。例如：net.udp.service.perf [ntp]，可以检测NTP服务的响应时间。

Simple checks是一种简单而高效的监控方式，由于其不需要传输复杂的监控数据，因此在监控成百上千的主机和服务的可用性时，对整体的网络流量产生的影响是最小的。

配置Simple checks的步骤：

1. 创建一个新的监控项（Configuration --> Template --> Items--> Create item 或Configuration --> Host --> Items --> Create item）。

2. 在监控项配置页面中：
   - 填写Name ，例如：Check SSH port $3。（$3是key中的第三个参数{$SSH_PORT}）。
   - 选择Type为Simple check。
   - 填写Key，例如：net.tcp.service[ssh,,{$SSH_PORT}]，{$SSH_PORT}是定义的macro。
   - Type of information选择Numeric。
   - Data type选择Decimal。
   - 如果需要可以在NewApplication中填写一个监控项组的名称，如：ssh check。
   - 其他配置参数可以保持不变，点击Add按钮保存。

3. Monitoring --> Latest data页面查看监控项。



## SNMP agents

监控交换机、路由器、UPS等设备时，你是没有办法通过Zabbixagent进行监控的，原因是这些设备中没有办法安装agent程序，但这并不代表Zabbix不能对这些设备进行监控，利用标准的SNMP协议，可以轻松实现Zabbix对这些设备的监控。

SNMP（简单网络管理协议）是TCP/IP协议簇的一个应用层协议，是一种广泛用于监测网络设备（例如：交换机、路由器、UPS等）的网络协议。在每个被监控的设备中都会运行设备自带的SNMP agent， Zabbix使用SNMP协议向被监控设备的SNMP agent发出查询指令，并由SNMP agent返回查询的值。

在设置SNMP agent监控项之前，我们先要确定OID（SNMP对象标识符）。SNMP将被管理对象用一个树来组织，被管理对象用OID表示，如：1.3.6.1.2.1.1.3 代表sysUpTime。实际环境中会使用很多厂商的产品，每个产品中定义的OID不尽相同，所以准备使用SNMP agent 监控设备前，需要厂商提供设备的MIB文件。MIB文件是基于SMI语法定义的说明某个OID在OID树中的位置、数据类型、描述等信息的文本文件，如果没有MIB文件，你很难理解一串数字代表的含义是什么。



## Zabbix Internal checks

Zabbix Internal主要是用来监测Zabbixserver 或 proxy server自身的性能。Zabbix Internal由Zabbix server 或proxy server进行计算，从Zabbix 2.4版本开始，即使在主机维护状态下也会处理Zabbix Internal。Zabbix server处理Zabbix Internal时不依赖agent，你只需要拥有超级管理员的权限即可。

Zabbix在系统中已经预设了针对Zabbix server和 proxy server的模板，模板的名称是Template App Zabbix Server 和 Template App Zabbix Proxy。

配置Zabbix Internal的步骤：

1. 创建一个新的监控项（Configuration --> Template --> Items --> Create item 或Configuration --> Host --> Items --> Create item）。
   - Name中填写监控项的名称。
   - Type中选择Zabbix internal。
   - Key中选择（单击右侧的Select按钮）zabbix[process,\<type\>,\<num\>,\<state\>]，在这里我们使用zabbix[process,poller,avg,busy]。
   - Type of information选择Numeric (float)。
   - Units（单位）填写% 。
   - 其他参数可以保持原状，单击Add按钮保持。

2. Monitoring --> Latest data页面查看监控项。



## Zabbix trapper

Zabbix使用agent、IPMI或SNMP的方式收集监控数据时，有时候会因为监控项Key中使用的脚本执行时间过长而超时，从而无法获取数据。因此Zabbix 提供了trapper的监控方式，利用zabbix-sender工具可以主动将数据从被监控主机发送到Zabbix server，这种方式中不需要在被监控主机中安装Zabbix agent。



## IPMI agents

IPMI（Intelligent PlatformManagement Interface）是一个开放标准的硬件管理接口规范，定义了嵌入式管理子系统进行通信的特定方法。现在主流的服务器使用远程控制卡（例如Dell的DRAC、HP的ILO等）都可以进行远程控制管理，通过IPMI你可以远程开机、关机、重启，远程查看服务器当前的运行状态，可以安装操作系统，实现远程管理。Zabbix server通过IPMI可以直接监控服务器硬件，即使是服务器的电源处在关闭的状态下也是没有问题的。



## JMX agents

Zabbix通过JMX（Java Management Extensions）可以对Java Application进行监控，Zabbix利用原生的Zabbix Java gateway，一个Java守护进程监控JMX应用。当Zabbix想要知道某个JMX counter当前的数据时，它只去询问ZabbixJava gateway，而gateway会去查询需要的数据，所有这些查询都是通过JMX管理API完成的。

使用时，一个Java应用不需要额外安装任何其他的软件，也不需要实现或扩展新的代码来处理Zabbix的查询，仅仅需要在Java 应用的配置文件中设置一些参数，支持远程JMX的监控。