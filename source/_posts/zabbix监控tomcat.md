---
title: zabbix监控tomcat
date: 2019-04-24 16:20:22
tags: zabbix
categories: 监控
---



```shell
-------------
   Client
-------------
[root@zabbixagent ~]# vim /etc/yum.repos.d/zabbix.repo
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
[root@zabbixagent ~]# yum install -y zabbix-agent.x86_64 zabbix-sender.x86_64
[root@zabbixagent ~]# vim /etc/zabbix/zabbix_agentd.conf
PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix/zabbix_agentd.log
LogFileSize=0
Server=127.0.0.1,192.168.2.140
ServerActive=192.168.2.140
Hostname=Zabbix server
# 在主动式提交采集数据时需要注意这里的Hostname要与web页面中添加的主机名称一致。
Include=/etc/zabbix/zabbix_agentd.d/
[root@zabbixagent ~]# systemctl start zabbix-agent

-------------
   Server
-------------
[root@zabbix ~]# yum install -y zabbix-java-gateway.x86_64
# 安装java-gateway用以监控tomcat
[root@zabbix ~]# cp /etc/zabbix/zabbix_java_gateway.conf{,.bak}
[root@zabbix ~]# vim /etc/zabbix/zabbix_java_gateway.conf
LISTEN_IP="0.0.0.0"
# 监听所有地址
LISTEN_PORT=10052
# 监听端口
PID_FILE="/var/run/zabbix/zabbix_java.pid"
START_POLLERS=5
# 启动线程数
TIMEOUT=30
[root@zabbix ~]# systemctl start zabbix-java-gateway
[root@zabbix ~]# ss -tln|grep 10052
LISTEN     0      50          :::10052                   :::*
[root@zabbix ~]# vim /etc/zabbix/zabbix_server.conf
ListenPort=10051
SourceIP=192.168.2.140
LogType=file
LogFile=/var/log/zabbix/zabbix_server.log
LogFileSize=10
DebugLevel=3
PidFile=/var/run/zabbix/zabbix_server.pid
DBHost=localhost
DBName=zabbix
DBUser=zbxuser
DBPassword=zbxpass
DBSocket=/var/lib/mysql/mysql.sock
DBPort=3306
StartPollers=50
# 轮询器的预分叉实例数。
StartTrappers=20
# 此项不要调的过大，测试中调为200，致使zabbix-server服务无法正常启动，提示连接不到数据库
# 捕捉器的预分叉实例数。
# Trapper接受来自Zabbix发送器、活动代理和活动代理的传入连接。
# 必须至少运行一个Trapper进程，才能在前端显示服务器可用性和查看队列。
JavaGateway=127.0.0.1
JavaGatewayPort=10052
StartJavaPollers=50
SNMPTrapperFile=/var/log/snmptrap/snmptrap.log
CacheSize=512M
# 用于存储主机、项和触发器数据的共享内存大小。
Timeout=10
AlertScriptsPath=/usr/lib/zabbix/alertscripts
ExternalScripts=/usr/lib/zabbix/externalscripts
LogSlowQueries=3000
[root@zabbix ~]# systemctl restart zabbix-server
[root@zabbix ~]# vim /etc/my.cnf
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd
skip_name_resolve = ON
innodb_file_per_table = ON
max_connections=1000
table_open_cache=2048
max_allowed_packet=128M
query_cache_size=1024M
query_cache_limit=2M
wait_timeout=10800
net_read_timeout=3600
symbolic-links=0
[mysqld_safe]
log-error=/var/log/mariadb/mariadb.log
pid-file=/var/run/mariadb/mariadb.pid

!includedir /etc/my.cnf.d
[root@zabbix ~]# systemctl restart mariadb

-------------
   Client
-------------
[root@zabbixagent ~]# yum install -y java-1.8.0-openjdk-devel tomcat tomcat-webapps tomcat-admin-webapps tomcat-docs-webapp
[root@zabbixagent ~]# vim /etc/profile.d/java.sh
export JAVA_HOME=/usr
[root@zabbixagent ~]# source /etc/profile.d/java.sh
[root@zabbixagent ~]# java -version
openjdk version "1.8.0_212"
OpenJDK Runtime Environment (build 1.8.0_212-b04)
OpenJDK 64-Bit Server VM (build 25.212-b04, mixed mode)
[root@zabbixagent ~]# vim /usr/libexec/tomcat/server
#!/bin/bash
CATALINA_OPTS="$CATALINA_OPTS
    -Dcom.sun.management.jmxremote
    -Dcom.sun.management.jmxremote.port=12345
    # 要监听的端口
    -Dcom.sun.management.jmxremote.authenticate=false
    -Dcom.sun.management.jmxremote.ssl=false
    # 注意要在脚本最上方加入这些内容，如果不加，在监控中会不能监控JVM，提示“java.rmi.ConnectIOException: error during JRMP connection establishment; nested exception is:  javax.net.ssl.SSLHandshakeException: Received fatal alert: handshake_failure”。下面一项也可以加上。
    -Dcom.sun.management.jmxremote.ssh=false
    -Djava.rmi.server.hostname=192.168.2.138"
    # 这里输入的是tomcat的监听地址

[root@zabbixagent ~]# systemctl start tomcat
[root@zabbixagent ~]# ss -tln
State       Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN      0      128          *:22                       *:*                  
LISTEN      0      100    127.0.0.1:25                       *:*                  
LISTEN      0      128          *:10050                    *:*                  
LISTEN      0      100         :::8080                    :::*                  
LISTEN      0      128         :::22                      :::*                  
LISTEN      0      50          :::12345                   :::*                  
LISTEN      0      100        ::1:25                      :::*                  
LISTEN      0      50          :::42204                   :::*                  
LISTEN      0      50          :::35969                   :::*                  
LISTEN      0      128         :::10050                   :::*                  
LISTEN      0      1         ::ffff:127.0.0.1:8005                    :::*                  
LISTEN      0      100         :::8009                    :::*   
# 这时tomcat监听了12345端口
[root@zabbixagent ~]# tomcat version
Server version: Apache Tomcat/7.0.76
Server built:   Mar 12 2019 10:11:36 UTC
Server number:  7.0.76.0
OS Name:        Linux
OS Version:     3.10.0-693.el7.x86_64
Architecture:   amd64
JVM Version:    1.8.0_212-b04
JVM Vendor:     Oracle Corporation
[root@zabbixagent ~]# wget http://archive.apache.org/dist/tomcat/tomcat-7/v7.0.76/bin/extras/catalina-jmx-remote.jar
[root@zabbixagent ~]# cp catalina-jmx-remote.jar /usr/share/tomcat/lib/
[root@zabbixagent ~]# systemctl restart tomcat
```



下面在web页面添加主机，并对主机进行监控

1. 添加主机

![](/images/zabbix/monitortomcat1.png)

2. 添加主机时需要写明主机名称，可见名称为可选项，加入一个主机组，下面的agent代理程序接口的地址为客户端对zabbix-agent监听的地址，端口为10050, 因为要监控java程序，所以使用JMX接口，监听在12345端口上。

![](/images/zabbix/monitortomcat2.png)

3. 添加模板，先按链接指示器中select选择模板，选好后点Add，最后完成点Update。在4.0版本中模板叫Template App Apache Tomcat JMX，Template App Generic Java JMX

![](/images/zabbix/monitortomcat3.png)

4. 添加好之后，过一会ZBX和JVM都应该变绿，表示被监控了，如果是红色的，可以点一下红色的项，会有错误提示，或可以刷新页面或点两下Enabled来刷新

![](/images/zabbix/monitortomcat4.png)

