---
title: zabbix安装与配置
date: 2019-04-22 10:45:50
tags: zabbix
categories: 监控
---

# 介绍

> Zabbix是一个企业级的开源监控软件，可以监控IT基础架构的可用性和应用的性能，为用户提供集中管理、分布式监控的一站式（all in one）监控解决方案，是一款真正的开源产品（True Open source）。采用GPL协议发布，不论是商业或非商业的使用没有任何限制，可以说是绝对的自由使用。
>
> Zabbix最基本的目的是收集监控数据，将收集的数据统一保存到数据库中进行分析处理，利用Web前端页面可以轻松的将这些监控数据实时展示出来。通过与设定的阈值进行比较触发特定的事件并产生相应的动作，发出告警通知或执行远程命令。Zabbix 提供了多种监控方式用来监控基础架构的各个方面，不仅有专用的Agent，还支持External checks、SNMP、IPMI、JMX monitoring、SSH checks等多种方式收集监控数据，具有丰富的功能和灵活的扩展性。事实上，几乎所有你能想到的都可以在Zabbix中实现监控。



# 概念

## 组件

> Zabbix监控系统包含四个主要组件：Zabbixserver、Zabbix proxy、Zabbix database和Zabbix GUI。每个组件都有其自身的特点和要求：
>
> - Zabbix server：这是核心引擎，负责收集或接收来自被监控设备的数据。它是用C语言开发的，与Zabbix agents、Zabbix proxy和 Zabbix database进行通信。它是最主要的组件，管理所有的规则（包括收集监控数据、触发器、告警等等）。
> - Zabbix GUI：这是 Zabbix Web前端管理页面，用户通过Web前端页面可以查看Zabbixserver收集的数据，也可以对Zabbix server进行配置。它是用 PHP 开发的，使用支持 PHP程序运行的 web 服务器 (Apache或Nginx)，并与 Zabbix 数据库通信。
> - Zabbix database： 这是 Zabbix 数据存储库。 Zabbix的后端数据库可以是 Oracle、 IBM DB2、PostgreSQL、MySQL 或 SQLite3。在这本书中，我们将使用MySQL 作为数据库。
> - Zabbix proxy：这是一个可选的组件，利用它来实现分布式监控架构或分担Zabbix server的负载，提高Zabbix server的性能。它的主要功能是协助 Zabbix server从被监视的主机或设备收集数据。Zabbix proxy收集的数据首先存放到本地临时数据库中，随后定时发送到 Zabbix server中，即便Zabbix server和Zabbix proxy的连接断开也不会导致数据的丢失（数据保留的时间可在proxy的配置文件中设置）。在3.0版本中原生支持Zabbix server和Zabbix proxy之间的数据加密传输（基于证书或者基于共享秘钥的加密都是支持的）。



## 架构

> Zabbix是一个三层架构，在实现时我们需要安装以下三个服务器，即Web服务器、Database服务器和Zabbix服务器。如果需要监控的规模比较小（几台或几十台主机），三个服务器可以同时安装在一个物理服务器中，这种方式的优点是安装配置简单快速，初期部署成本比较低。随着监控规模的不断扩大，需要保存和处理更多的监控数据，也会有更多的运维人员访问Zabbix Web前端页面，这样势必会让Zabbixserver的处理性能下降，出现断图、Web前端页面访问慢等问题。这时我们可以将Web服务器、Database服务器和Zabbix服务器拆分，分别安装到不同的物理服务器中。这种方式中每个服务器组件使用专用的硬件资源，可以解决相应的性能问题，但是需要增加服务器硬件的投入。



## zabbix数据处理流程

> 在标准的Zabbix数据处理流程中，主要是通过几个不同的数据源端发送数据到Zabbix server，所有的数据都会保存到数据库中，并通过Web GUI为用户展现结果。发送数据的主要源包括：
>
> - Zabbix agent
> - Zabbix sender
> - Other agent （如脚本或者自定义的第三方的agent）
> - Zabbix proxy



## zabbix部署架构

> Zabbix在大部分场景中以集中式架构部署即可满足要求，所谓集中式架构就是无论Zabbix server、Database server和Web server是否安装在同一台服务器中，所有的监控数据都是由Zabbix server收集。如果你需要监控的IT基础架构有多个分中心或分支机构，建议采用分布式架构部署，在每个分中心或分支机构增加Zabbix proxy，由Zabbix proxy收集本地的监控数据后统一传输到Zabbix server中存储和处理，实现分布式架构、集中监控的方案。



# 安装与配置

## Server端

```shell
=======================================================================================
环境：
系统：CentOS Linux release 7.4.1708 (Core)，地址：192.168.2.140，此次测试将Server端与agent端安装在同一台主机上。关闭防火墙与SELinux。
=======================================================================================
------------------------------
   安装mariadb数据库
------------------------------
[root@zabbix ~]# yum install mariadb-server
[root@zabbix ~]# vim /etc/my.cnf
[mysqld]
skip_name_resolve = ON
innodb_file_per_table = ON
[root@zabbix ~]# systemctl start mariadb.service
[root@zabbix ~]# systemctl enable mariadb.service
[root@zabbix ~]# mysql_secure_installation
[root@zabbix ~]# mysql -uroot -pcentos
MariaDB [(none)]> CREATE DATABASE zabbix CHARSET 'utf8';
MariaDB [(none)]> GRANT ALL ON zabbix.* TO 'zbxuser'@'%' IDENTIFIED BY 'zbxpass';
MariaDB [(none)]> FLUSH PRIVILEGES;

-----------------------------
   安装zabbix_server
-----------------------------
[root@zabbix ~]# wget https://mirrors.aliyun.com/zabbix/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm
# 4.0版本下载地址：rpm -Uvh https://mirrors.aliyun.com/zabbix/zabbix/4.0/rhel/7/x86_64/zabbix-release-4.0-1.el7.noarch.rpm 
# 4.4版本：rpm -Uvh https://repo.zabbix.com/zabbix/4.4/rhel/8/x86_64/zabbix-release-4.4-1.el8.noarch.rpm
[root@zabbix ~]# yum install -y zabbix-release-3.0-1.el7.noarch.rpm
# 下载源文件并安装
[root@zabbix ~]# vim /etc/yum.repos.d/zabbix.repo
[zabbix]
name=Zabbix Official Repository - $basearch
baseurl=http://repo.zabbix.com/zabbix/3.0/rhel/7/$basearch/
enabled=1
gpgcheck=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-ZABBIX

[zabbix-non-supported]
name=Zabbix Official Repository non-supported - $basearch
baseurl=http://repo.zabbix.com/non-supported/rhel/7/$basearch/
enabled=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-ZABBIX
gpgcheck=0
# 将gpgcheck都改为0
# 上面的repo地址可能连接有问题，可以将[zabbix]中的baseurl改为阿里地址，https://mirrors.aliyun.com/zabbix/zabbix/4.0/rhel/7/x86_64/。
[root@zabbix ~]# yum install -y zabbix40-server-mysql.x86_64 zabbix40-web.noarch zabbix40-get.x86_64 zabbix40-web-mysql.noarch zabbix40-agent.x86_64 zabbix40-sender.x86_64 httpd php php-mysql php-mbstring php-gd php-bcmath php-ldap php-xml 
# 安装4.0版本需要先安装libiksemel.so.3，libiksemel.so.3在iksemel-1.4-6.sdl7.x86_64.rpm包中，下载地址：http://ftp.tu-chemnitz.de/pub/linux/dag/redhat/el6/en/i386/rpmforge/RPMS/iksemel-1.4-1.el6.rf.i686.rpm
# 安装zabbix相关包
# zabbix程序组件
# zabbix_server：服务端守护进程
# zabbix_aget：agent守护进程
# zabbix_proxy：代理服务器，可选；
# zabbix_database：存储系统，mysql/pgsql
# zabbix_web：web GUI
# zabbix_get:命令行工具，测试向agent端发起数据采集请求使用
# zabbix_sender：命令行，测试向server端发送数据
# zabbix_java_gateway：java网关
# CentOS8安装4.0版本：dnf -y install httpd mariadb-server mariadb libjpeg* php-odbc php-pear php-xmlrpc php-mhash php php-pear php-cgi php-common php-mbstring php-snmp php-gd php-xml php-mysqlnd php-gettext php-bcmath php-json php-ldap
# CentOS8依赖包：dnf -y install gcc make mariadb-devel pcre* libevent-devel libxml2-devel net-snmp-devel libcurl-devel net-snmp curl curl-devel libxml2 libevent-devel.x86_64
# 

------------------
   导入数据库
------------------
[root@zabbix ~]# cp /usr/share/doc/zabbix-server-mysql-3.0.27/create.sql.gz /root
[root@zabbix ~]# gzip -d create.sql.gz
[root@zabbix ~]# mysql -uzbxuser -h 127.0.0.1 -pzbxpass zabbix < ./create.sql
[root@zabbix ~]# mysql -uroot -pcentos
MariaDB [(none)]> USE zabbix;
MariaDB [(none)]> SHOW tables;
# 这时可以看到导入的表

-----------------------------
   配置zabbix_server
-----------------------------
[root@zabbix ~]# cd /etc/zabbix/
[root@zabbix ~]# cp zabbix_server.conf{,.bak}
[root@zabbix ~]# vim zabbix_server.conf
ListenPort=10051
# zabbix-server默认监听端口为10051
SourceIP=192.168.2.140
# 如果Server端有多个IP，此项一定要定义，这是被客户端允许采样的IP
LogType=file
# 日志格式，有三种，默认是file，表示自己记录到一个文件中。这个file就是下面LogFile定义的路径
LogFile=/var/log/zabbix/zabbix_server.log
LogFileSize=10
# 指明日志文件大小，大于这里指定的数字将会滚动。日志是否滚动，0表示不滚动
DebugLevel=3
# 日志级别，3表示正常，数字越大越详细，最大是5
PidFile=/var/run/zabbix/zabbix_server.pid
DBHost=localhost
# zabbix数据库的地址
DBName=zabbix
# 数据库名字
DBUser=zbxuser
# 连接数据库用的用户名
DBPassword=zbxpass
DBSocket=/var/lib/mysql/mysql.sock
# 连接数据库用的sock，用rpm包安装的mysql，sock在/var/lib/mysql/mysql.sock，这是在my.cnf中定义的
DBPort=3306
#SNMPTrapperFile=/var/log/snmptrap/snmptrap.log
Timeout=4
AlertScriptsPath=/usr/lib/zabbix/alertscripts
ExternalScripts=/usr/lib/zabbix/externalscripts
LogSlowQueries=3000
[root@zabbix ~]# systemctl start zabbix-server
[root@zabbix ~]# ss -tln
# 查看是否监听10051端口
[root@zabbix ~]# cd /etc/httpd/conf.d/
[root@zabbix ~]# vim zabbix.conf
php_value date.timezone Asia/Shanghai   
# 配置时区
[root@zabbix ~]# systemctl start httpd
下面进入页面访问安装，地址:IP/zabbix
```

![](/images/zabbix/安装1.png)

![](/images/zabbix/安装2.png)

![](/images/zabbix/安装3-mysql.png)

上图输入在mysql中设置的用户名与密码

![](/images/zabbix/安装4.png)

上图只输入服务器地址与端口即可

![](/images/zabbix/安装5.png)

![](/images/zabbix/安装6.png)

上图页面中提示你Zabbix前端已经成功安装，并在目录/etc/zabbix/web/中创建了配置文件zabbix.conf.php。

![](/images/zabbix/登录页面.png)

在上图的Web前端登录页面中，我们输入Zabbix默认的用户名和密码，用户名：Admin，密码：zabbix 

![](/images/zabbix/登录首页.png)



## agent端

```shell
----------------------------------------
   在zabbixServer主机上安装zabbix_agent
----------------------------------------
[root@zabbix ~]# yum install zabbix-agent zabbix-sender
# 这里以在server端安装agent端为例，可按此方法在其他主机安装agent端
[root@zabbix ~]# cd /etc/zabbix/
[root@zabbix ~]# cp zabbix_agentd.conf{,.bak}
[root@zabbix ~]# vim zabbix_agentd.conf
PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix/zabbix_agentd.log
LogFileSize=0
Server=127.0.0.1,192.168.2.140
# 被动模式下需要设置，从哪个服务器连接agent，这里要输入的是zabbix_server的地址。
ServerActive=127.0.0.1
#  主动模式下需要设置，向哪个服务器发送数据，这里要输入的是zabbix_server的地址。
# 主动与被动指的是客户端主动还是被动
Hostname=Zabbix server
# 主动模式下必须设置，被动模式不需要
Include=/etc/zabbix/zabbix_agentd.d/
[root@zabbix ~]# systemctl start zabbix-agent
[root@zabbix ~]# ss -tln
# 查看是否监听10050端口
[root@zabbix ~]# zabbix_get -s 192.168.2.140 -k "system.cpu.switches"
1456242
# 测试，采集CPU的某个值，IP地址为zabbixServer的地址，此命令只能在zabbixServer主机上使用，如果在
# zabbixAgent主机上使用，会提示:"zabbix_get [25014]: Check access restrictions in Zabbix agent configuration"
[root@zabbix ~]# zabbix_get -s 192.168.2.140 -k "system.cpu.switches"
zabbix_get [4179]: Get value error: cannot connect to [[192.168.2.140]:10050]: [111] Connection refused
# 如果agent服务未启动，采集时会报错。
```



## 配置中文页面

![](/images/zabbix/配置中文页面1.png)

点击右上角的Admin图标，进入页面选择Language为Chinese(zh_CN)，再次刷新页面后就会变为中文，但还是会有问题。就是在图形展示时，图形下的说明文字会有乱码问题，解决方法如下：

```shell
从windows系统中复制simkai.ttf（楷体）字体到CentOS系统
[root@zabbix ~]# cp simkai.ttf /usr/share/fonts/
# 将字体复制到/usr/share/fonts/
[root@zabbix ~]# chmod +r /usr/share/fonts/simkai.ttf
# 不知此步是否有用，因为看到有教程中simkai.ttf的权限是544
[root@zabbix ~]# alternatives --install /usr/share/zabbix/fonts/graphfont.ttf zabbix-web-font /usr/share/fonts/simkai.ttf 100
# 这是将字体加入到zabbix-web-font中
[root@zabbix ~]# alternatives --display zabbix-web-font
...
Current `best' version is /usr/share/fonts/simkai.ttf.
# 显示zabbix-web-font目前的字体，应该有上面的字样
```





