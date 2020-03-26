---
title: rsyslog服务
date: 2020-03-24 17:31:29
tags: log
categories: rsyslog
---

### 介绍

Linux日志机制的核心是[rsyslog](http://www.rsyslog.com/)守护进程，该服务负责监听Linux下的日志信息，并把日志信息追加到对应的日志文件中，一般在/var/log目录下。它还可以把日志信息通过网络协议发送到另一台Linux服务器上。

rsyslog的主程序为rsyslogd，配置文件路径为 /etc/rsyslog.conf，服务脚本/etc/rc.d/init.d/rsyslog

rsyslog的特性包括：

- 多线程；
- 支持UDP，TCP，SSL，TLS，RELP；
- 支持使用MySQL，PGSQL，Oralce实现日志存储；
- 强大的过滤器，可实现过滤日志信息中任何部分
- 自定义输出格式



### 配置文件 

```shell
#### MODULES ####

# The imjournal module bellow is now used as a message source instead of imuxsock.
$ModLoad imuxsock # provides support for local system logging (e.g. via logger command)
$ModLoad imjournal # provides access to the systemd journal
#$ModLoad imklog # reads kernel messages (the same are read from journald)
#$ModLoad immark  # provides --MARK-- message capability

# Provides UDP syslog reception
$ModLoad imudp
$UDPServerRun 514

# Provides TCP syslog reception
$ModLoad imtcp
$InputTCPServerRun 514
# 如果需要将rsyslog配置成服务，需要打开udp或tcp的模块加载与监听端口，也可以全部打开。

#### GLOBAL DIRECTIVES ####

# Where to place auxiliary files
$WorkDirectory /var/lib/rsyslog

# Use default timestamp format
$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat

# File syncing capability is disabled by default. This feature is usually not required,
# not useful and an extreme performance hit
#$ActionFileEnableSync on

# Include all config files in /etc/rsyslog.d/
$IncludeConfig /etc/rsyslog.d/*.conf

# Turn off message reception via local log socket;
# local messages are retrieved through imjournal now.
$OmitLocalLogging on

# File to store the position in the journal
$IMJournalStateFile imjournal.state


#### RULES ####

# Log all kernel messages to the console.
# Logging much else clutters up the screen.
#kern.*                                                 /dev/console

# Log anything (except mail) of level info or higher.
# Don't log private authentication messages!
*.info;mail.none;authpriv.none;cron.none                /var/log/messages
# 所有facility的info级别，但不包括mail;authpriv;cron，因为这三个facility的级别是none
# The authpriv file has restricted access.
authpriv.*                                              /var/log/secure

# Log all the mail messages in one place.
mail.*                                                  -/var/log/maillog
# Log cron stuff
cron.*                                                  /var/log/cron

# Everybody gets emergency messages
*.emerg                                                 :omusrmsg:*
# :omusrmsg:*表示将所有emerg级别的日志通知给所有登录用户
# Save news errors of level crit and higher in a special file.
uucp,news.crit                                          /var/log/spooler
# 这表示uucp.crit和news.crit，因为都是crit级别，所以前面将facility写在一起用逗号分隔
# Save boot messages also to boot.log
local7.*                                                /var/log/boot.log

# 配置文件共分为三段，第一段MODULES是加载模块的， 第二段GLOBAL DIRECTIVES是全局配置，第三段RULES是针对具体的设置与级别将日志保存到哪里。
# 第三段RULES的配置格式为：
# facility.priority   target
# 
# 其中facility表示设施，是日志生成器，或叫日志收集管道，它从功能或程序上对日志进行分类，包括：
# auth, authpriv, cron, daemon, kern, lpr, mail, mark, news, security, user, uucp, 
# local0-local7, syslog。
#
# priority表示日志级别，包括：debug, info, notice, warn(warning), err(error),  
# crit(critical), alert, emerg(要死了, panic)。指定级别方法：
# *：所有级别；
# none：没有级别，不记录；
# priority：此级别及更高级别的日志信息都记录；
# =priority：此级别。
#
# target表示保存的路径，指定方法有：
# 文件路径：记录于指定的日志文件中，通常应该在/var/log/目录下。文件路径前的"-"表示异步写入；
# 用户：将日志通知给指定用户；
# *：所有用户；
# 日志服务器：@host；
# host：必须要监听在tcp或udp协议514端口上提供服务；
# 管道： |COMMAND

dmesg
cat /var/log/dmesg
# 这两条命令是一样的，查看系统启动时的日志。dmesg是一个显示内核缓冲区系统控制信息的工具
```



### 日志格式

文件记录时日志的格式：

```shell
Mar 25 09:11:26 localhost sshd[15000]: Accepted password for root from 192.168.1.17 port 55624 ssh2
Mar 25 09:11:28 localhost sshd[15000]: error: no more sessions
Mar 25 09:11:28 localhost sshd[15000]: error: no more sessions
```

事件产生的日期时间    主机    进程（pid）：事件内容

有些日志记录二进制格式，如/var/log/wtmp, /var/log/btmp

/var/log/wtmp：当前系统上成功登录的日志；查看方法：last

/var/log/btmp：当前系统上失败的登录尝试；查看方法：lastb		

lastlog命令：显示当前系统每一个用户最近一次的登录时间



### 举例

#### 配置sshd日志输出

```shell
vim /etc/ssh/sshd_config 
#SyslogFacility AUTHPRIV
SyslogFacility local2
# 注释上面一条，添加下面一条，自定义日志级别为local2
systemctl restart sshd

vim /etc/rsyslog.conf 
local2.*                                     /var/log/sshd.log
# 在第三段配置上添加
systemctl restart rsyslog

再次登录，之后就可以查看到日志了
cat /var/log/sshd.log 
Mar 25 09:11:26 localhost sshd[15000]: Accepted password for root from 192.168.1.17 port 55624 ssh2
Mar 25 09:11:28 localhost sshd[15000]: error: no more sessions
Mar 25 09:11:28 localhost sshd[15000]: error: no more sessions
```



#### 配置rsyslog服务

```shell
vim /etc/rsyslog.conf 
# Provides UDP syslog reception
$ModLoad imudp
$UDPServerRun 514

# Provides TCP syslog reception
$ModLoad imtcp
$InputTCPServerRun 514
systemctl restart rsyslog
ss -tlun

# 换另一台主机
vim /etc/rsyslog.conf
*.info;mail.none;authpriv.none;cron.none         @192.168.1.8
systemctl restart rsyslog
在这台主机上运行yum安装一个软件包，再到192.168.1.8的主机上看一下messages日志中是否有记录
```



#### 将日志保存到mysql中并安装一个日志展示工具

```shell
wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql-community-server
# 安装mysql5.7
vim /etc/my.cnf
skip_name_resolve = ON
innodb_file_per_table = ON
systemctl start mysqld
yum install rsyslog-mysql 
# 这是rsyslog连接mysql时用的驱动
less /usr/share/doc/rsyslog-mysql-5.8.10/createDB.sql
# 这是安装rsyslog-mysql后生成的，查看一下这个sql脚本中要在mysql中创建的数据库名称是什么
mysql -uroot -p
GRANT ALL ON Syslog.* TO 'syslog'@'192.168.%.%' IDENTIFIED BY 'syslogpass';
# 添加一个授权，Syslog是上面查看到的数据库名称
FLUSH PRIVILEGES；
mysql -usyslog -psyslogpass -h192.168.1.8
mysql -usyslog -h192.168.1.8 -p < /usr/share/doc/rsyslog-mysql-5.8.10/createDB.sql
# 导入数据库
mysql -usyslog -psyslogpass -h192.168.1.8
SHOW DATABASES;
USE Syslog
SHOW TABLES;
vim /etc/rsyslog.conf
####### MODULES #######
$ModLoad ommysql   # 表示加载模块。om表示输出，im表示输入
# 在第一段配置中加入这句
######## RULES ###########
*.info;mail.none;authpriv.none;cron.none     :ommysql:192.168.1.8,Syslog,syslog,syslogpass
# 后面的target表示，使用ommysql这个模块或发往ommysql这个输出过滤器，之后是mysql的地址，再之后是
# 数据库名称，以哪个用户名连接，连接的密码是什么
systemctl restart rsyslog
再次使用yum安装一个程序包测试，再看mysql中是否有记录

mysql -uroot -p
SELECT COUNT(*) FROM SystemEvents;
# 这里有三条记录
SELECT COUNT(*) FROM SystemEventsProperties;
# 这里没有记录
SELECT * FROM SystemEvents\G

# 下面安装展示工具loganalyzer
yum install httpd php php-mysql php-gd
# php-gd是一个绘图的工具
vim /var/www/html/index.php   # 编写一个php文件，测试是否连接远程mysql
<?php
	$conn = mysql_connect('192.168.1.8','syslog','syslogpass');
	if ($conn)
		echo "OK";
	else
		echo "Failure";
?>
systemctl start httpd
访问192.168.1.8
下载loganalyzer-3.6.5.tar.gz
tar xf loganalyzer-3.6.5.tar.gz
cp /loganalyzer-3.6.5/src /var/www/html/loganalyzer
# 我们主要使用src目录中的文件
cp /loganalyzer-3.6.5/contrib/* /var/www/html/loganalyzer
# contrib目录下的脚本也需要
cd /var/www/html/loganalyzer
chmod +x *.sh
./configure.sh
./secure.sh
chmod 666 config.php   # 如果没有此文件，使用此命令也会创建这个文件
访问192.168.1.8/loganalyzer/install.php，进入安装，在第七步时要选择Source Type，选择MYSQL Native，之后输出数据库的信息
```

