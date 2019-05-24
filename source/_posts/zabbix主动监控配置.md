---
title: zabbix主动监控配置
date: 2019-04-25 09:26:36
tags: zabbix
categories: 监控
---

# Zabbix Proxy 介绍

> Zabbix Proxy 可以代替 Zabbix Server 检索客户端的数据，然后把数据汇报给 Zabbix Server，
> 并且在一定程度上分担了 Zabbix Server 的压力。Zabbix Proxy 可以非常简便的实现了集中式、分布式监控。
>
> Zabbix Proxy 使用场景:
>
> 1. 监控远程区域设备
> 2. 监控本地网络不稳定区域
> 3. 当 Zabbix 监控上千设备时，使用它来减轻 Server 的压力
> 4. 简化 Zabbix 的维护
>
> Zabbix Proxy 仅仅需要一条 TCP 连接到 Zabbix Server，所以防火墙上仅仅需要加上一条规则即可。
> Zabbix Proxy 数据库必须和 Zabbix Server 分开，否则数据会被破坏，毕竟这两个数据库的表大部分都相同。
> 总之记住，数据库分开即可。
> Zabbix Proxy 收集到数据之后，首先将数据缓存在本地，然后在一定的时间之后传递给 Zabbix Server。
> 这个时间由 Zabbix Proxy 配置文件中参数 ProxyLocalBuffer and ProxyOfflineBuffer 决定。
>
> Zabbix Proxy 是一个数据收集器，它不计算触发器、不处理事件、不发送报警。



## 官方文档

> <https://www.zabbix.com/documentation/current/manual/concepts/proxy>
> <https://www.zabbix.com/documentation/3.4/zh/manual/concepts/proxy>
> https://www.zabbix.com/download



# 安装与配置

```shell
===========================================================================================
环境：
系统：CentOS Linux release 7.4.1708 (Core)
主机信息：
zabbixServer：192.168.2.140
zabbixProxy: 192.168.2.137
zabbixAgent: 192.168.2.138
===========================================================================================

----------------------
    zabbixProxy
----------------------
********
  安装
********
[root@zabbixproxy ~]# wget https://mirrors.aliyun.com/zabbix/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm
[root@zabbixproxy ~]# yum install -y zabbix-release-3.0-1.el7.noarch.rpm 
[root@zabbixproxy ~]# yum install -y zabbix-proxy-mysql.x86_64 zabbix-get.x86_64 zabbix-agent.x86_64  zabbix-sender.x86_64 mariadb-server

*****************
   mysql端配置
*****************
[root@zabbixproxy ~]# vim /etc/my.cnf
[mysqld]
skip_name_resolve=ON
innodb_file_per_table=ON
[root@zabbixproxy ~]# systemctl start mariadb.service
[root@zabbixproxy ~]# systemctl enable mariadb.service
[root@zabbixproxy ~]# mysql_secure_installation
[root@zabbixproxy ~]# mysql -uroot -pcentos
MariaDB [(none)]> CREATE DATABASE zabbix_proxy CHARSET 'utf8';
# 因为zabbix的库中没有创建数据库的命令，所以这里手动创建
MariaDB [(none)]> GRANT ALL ON zabbix_proxy.* TO 'zproxy'@'%' IDENTIFIED BY 'zproxy';
MariaDB [(none)]> FLUSH PRIVILEGES;
[root@zabbixproxy ~]# cp /usr/share/doc/zabbix-proxy-mysql-3.0.27/schema.sql.gz /root
[root@zabbixproxy ~]# gzip -d schema.sql.gz 
[root@zabbixproxy ~]# mysql -uzproxy -h127.0.0.1 -pzproxy zabbix_proxy < schema.sql 
[root@zabbixproxy ~]# mysql -uzproxy -pzproxy
MariaDB [(none)]> use zabbix_proxy
MariaDB [zabbix_proxy]> SHOW TABLES;

*****************
   Proxy端配置
*****************
[root@zabbixproxy ~]# cd /etc/zabbix/
[root@zabbixproxy zabbix]# cp zabbix_proxy.conf{,.bak} 
[root@zabbixproxy zabbix]# vim zabbix_proxy.conf
ProxyMode=0
# 0是主动模式，1是被动模式
Server=192.168.2.140
ServerPort=10051
# zabbix-server的地址和端口
Hostname=Zabbix_proxy
# 代理服务器名称，需要与zabbix管理頁面中添加代理时候的proxy name一致
LogFile=/var/log/zabbix/zabbix_proxy.log
LogFileSize=10
DebugLevel=3
# 在第一次启动时可将级别调大，以方便排错，如改为4
PidFile=/var/run/zabbix/zabbix_proxy.pid
DBHost=localhost
DBName=zabbix_proxy
DBUser=zproxy
DBPassword=zproxy
DBPort=3306
ProxyLocalBuffer=72
# 设置zabbix proxy暂存在本地mysql的监控数据的时间。默认是0，不暂存。即使zabbix proxy已经把数据发送给了zabbix server，还是会暂存数据在本地设置的时间。取值范围是0~720小时
ProxyOfflineBuffer=720
# 设置当zabbix proxy与zabbix server无法连接时保留监控数据的时间间隔。默认是1小时，取值是1~720小时。这个参数特别有用，在维护中，停掉zabbix server后如果没有设置zabbix proxy的这个参数，所以当维护结束后启动zabbix server，会发现有段时间内的数据没有。这是因zabbix proxy按照默认的保留时间执行housekeeper把过期的数据删除了。
# 这个时间最好根据要维护的时间来设定，比如要维护10个小时，那么就要设置ProxyOfflineBuffer=10
HeartbeatFrequency=60
# 每隔60秒探测一下服务器的活动状态，心跳间隔检测时间，默认60秒，范围0-3600秒，被动模式不使用
ConfigFrequency=5
# 代理在几秒钟内从zabbix服务器检索配置数据的频率
DataSenderFrequency=5
# 数据发送时间间隔，默认为1秒，范围为1=3600秒，被动模式不使用
StartPollers=50
# 轮询器的预分叉实例数。启动的线程数，与客户端的数据保持一致
JavaGateway=192.168.2.140
JavaGatewayPort=10052
# java-gateway服务器地址和端口
StartJavaPollers=10
# javagateway的启动进程数，与监控的java应该一致
SNMPTrapperFile=/var/log/snmptrap/snmptrap.log
Timeout=30
ExternalScripts=/usr/lib/zabbix/externalscripts
LogSlowQueries=3000
[root@zabbixproxy zabbix]# systemctl start zabbix-proxy
[root@zabbixproxy zabbix]# ss -tln|grep 10051
LISTEN     0      128          *:10051                    *:*                  
LISTEN     0      128         :::10051                   :::*  
# zabbix-proxy也会监听10051端口

----------------------
    zabbixAgent
----------------------
*****************
   agent端配置
*****************
[root@zabbixagent ~]# cd /etc/zabbix/
[root@zabbixagent zabbix]# cp zabbix_agentd.conf{,.bak}
[root@zabbixagent zabbix]# vim zabbix_agentd.conf
PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix/zabbix_agentd.log
LogFileSize=0
Server=192.168.2.137
ServerActive=192.168.2.137
# 這裡的Server與ServerActive兩項設置都是有用的，如果註釋了Server一行，啟動會報錯，這裡都輸入Proxy端的地址即可。
StartAgents=0
# 如果加入了此项，就可以关闭被动模式，也可以注释掉Server项。不建议使用此项并注释Server项，有可能使agent端无法启动
Hostname=192.168.2.138
Include=/etc/zabbix/zabbix_agentd.d/*.conf
[root@zabbixagent zabbix]# systemctl restart zabbix-agent

----------------------
    zabbixProxy
----------------------
[root@zabbixproxy zabbix]# zabbix_get -s 192.168.2.138 -k "system.cpu.switches"
1386544
# 获取客户端的cpu参数，会返回一个值
```

下面进入web管理页面进行配置

1. 创建

![](/images/zabbix/proxy1.png)

2. 添加proxy名称，改为主动模式，之后就可添加了。這裡的Proxy name一定要與Proxy端的配置文件中的Hostname定義為一樣的名字。

![](/images/zabbix/proxy2.png)

3. 进入模板页面

![](/images/zabbix/proxy3.png)

4. 克隆模板，首先选择一个模板进入

![](/images/zabbix/proxy4.png)

5. 选择下方的全克隆

![](/images/zabbix/proxy5.png)

6. 改名保存，点击最下方的添加就是保存

![](/images/zabbix/proxy6.png)

7. 进入配置主机页面，可以看到主机的名称变了，这是因为上面添加proxy时加入了这个tomcat主机，点击tomcat一行中的监控项，进入监控项页面

![](/images/zabbix/proxy7.png)

![](/images/zabbix/proxy8.png)

8. 选择所有的项，注意这里一共有三页都要选中，再点击批量更新

![](/images/zabbix/proxy9.png)

9. 修改第一项为主动式，之后就可以保存了

![](/images/zabbix/proxy10.png)

10. 测试，将test主机的代理模式改为了proxy，之后可以看到同样是proxy代理，下面的tomcat显示状态为绿色，test显示状态为红色。实际在添加proxy并加入tomcat主机时已经将tomcat的代理方式改为了proxy了。

![](/images/zabbix/proxy11.png)

![](/images/zabbix/proxy12.png)