---
title: zabbix监控MySQL
date: 2019-04-25 14:21:59
tags: zabbix
categories: 监控
---

# 流程

> **Client**
>
> 1. 在agent端安裝percona包
> 2. 將安裝percona包後產生的userparameter_percona_mysql.conf配置文件複製到agent端的conf.d目錄下
> 3. 在/var/lib/zabbix/percona/scripts/目錄下創建ss_get_mysql_stats.php.cnf配置文件
> 4. 在agent端的mysql配置文件中加入mysql的用戶名和密碼
> 5. 將/tmp/localhost-mysql_cacti_stats.txt文件的屬主和屬組改為zabbix
> 6. 重啟mysql和zabbix-agent
> 7. 用percona中的腳本測試
>
>
>
> **ZabbixServer管理頁面**
>
> 1. 下載網上的percona模板进行监控。下载地址：<http://jaminzhang.github.io/soft-conf/Zabbix/zbx_percona_mysql_template.xml>
> 2. percona官网：<https://www.percona.com/downloads/percona-monitoring-plugins/> 下载Percona Monitoring Plugins最新tar.gz源码包。解压里面有cacti、nagios、zabbix不同监控模块，但zabbix/templates/目录下的zabbix_agent_template_percona_mysql_server_ht_2.0.9-sver1.1.6模板有問題，導入後不能添加。這裡導入上面下載的網上的模板，然后通过Zabbix Web界面 (Configuration -> Templates -> Import) 导入XML模板，注意要另外选择上Screens。最后配置主机关联上Percona MySQL Server Template模板即可。
> 3. 查看添加的監控項的圖形數據



# 安装配置Percona监控MySQL

```shell
-------------
    Client
-------------
[root@zabbixagent ~]# wget https://www.percona.com/downloads/percona-monitoring-plugins/percona-monitoring-plugins-1.1.8/binary/redhat/6/x86_64/percona-zabbix-templates-1.1.8-1.noarch.rpm
[root@zabbixagent ~]# rpm -ivh percona-zabbix-templates-1.1.8-1.noarch.rpm
# 下載percona-zabbix-templates-1.1.6-1.noarch.rpm包到客戶端並安裝
[root@zabbixagent ~]# rpm -ql percona-zabbix-templates
/var/lib/zabbix/percona
/var/lib/zabbix/percona/scripts
/var/lib/zabbix/percona/scripts/get_mysql_stats_wrapper.sh
/var/lib/zabbix/percona/scripts/ss_get_mysql_stats.php
/var/lib/zabbix/percona/templates
/var/lib/zabbix/percona/templates/userparameter_percona_mysql.conf
/var/lib/zabbix/percona/templates/zabbix_agent_template_percona_mysql_server_ht_2.0.9-sver1.1.8.xml
# get_mysql_stats_wrapper.sh用于监控获取MySQL状态
# ss_get_mysql_stats.php配置连接数据库用户名和密码，使用shell来调用php
# userparameter_percona_mysql.conf是zabbix-agent端监控MySQL的配置文件 
# zabbix_agent_template_percona_mysql_server_ht_2.0.9-sver1.1.8.xml是zabbix模板文件 
[root@zabbixagent ~]# cp /var/lib/zabbix/percona/templates/userparameter_percona_mysql.conf /etc/zabbix/zabbix_agentd.d/
# 複製配置文件到zabbix客戶端
[root@zabbixagent ~]# systemctl restart zabbix-agent
[root@zabbixagent ~]# yum install mariadb-server php php-mysql
[root@zabbixagent ~]# systemctl start mariadb
[root@zabbixagent ~]# mysql_secure_installation
[root@zabbixagent ~]# chown -R zabbix. /var/lib/zabbix/
[root@zabbixagent ~]# vim /var/lib/zabbix/percona/scripts/ss_get_mysql_stats.php.cnf
<?php

$mysql_user='root';
$mysql_pass='centos';
# 在这个php文件中加入mysql的用户名和密码

[root@zabbixagent scripts]# bash /var/lib/zabbix/percona/scripts/get_mysql_stats_wrapper.sh gg
0
# 测试mysql状态
[root@zabbixagent scripts]# vim /etc/my.cnf
[mysql]
user=root
password=centos
socket=/var/lib/mysql/mysql.sock
[root@zabbixagent scripts]# chown zabbix.zabbix /tmp/localhost-mysql_cacti_stats.txt
[root@zabbixagent scripts]# bash /var/lib/zabbix/percona/scripts/get_mysql_stats_wrapper.sh running-slave
0
[root@zabbixagent scripts]# bash /var/lib/zabbix/percona/scripts/get_mysql_stats_wrapper.sh gg
0
[root@zabbixagent scripts]# systemctl restart mariadb zabbix-agent
[root@zabbixagent scripts]# wget http://jaminzhang.github.io/soft-conf/Zabbix/zbx_percona_mysql_template.xml
# 下载模板到本地
# /var/lib/zabbix/percona/templates/zabbix_agent_template_percona_mysql_server_ht_2.0.9-sver1.1.8.xml是安装percona时生成的模板，但导入此模板时会报错："标签无效 "/zabbix_export/date": "YYYY-MM-DDThh:mm:ssZ" 预计"，有说可以将模板先导入zabbix2.4版本中再导出，之后再导入3.0版本就不会有这个问题了。
打开管理页面中配置 --> 模板 --> 导入，之后选择上面下载的模板即可。导入成功后，会有一个叫Template Percona MySQL Server的模板导入进来。之後將模板克隆一份並改為主動監控模式。然後在主機部分關聯此模板。最後就可以在Monitoring中查看到Graphs了，另外導入的模板中還包括大量Screen都可以為主機添加上，以便在Screen中展示。在主动采集数据模式下，此模板才会显示正常启动。如果是被动采集模式，模板中的监控项均会显示不支持的。
```



# 自定義腳本監控MySQL主从复制

```shell
-------------
    Client
-------------
[root@zabbixagent scripts]# cd /etc/zabbix/zabbix_agentd.d/
[root@zabbixagent zabbix_agentd.d]# vim mysql_monitor.sh
#!/bin/bash
#
Seconds_Behind_Master(){
NUM=`mysql -uroot -hlocalhost -e "show slave status\G" | grep "Seconds_Behind_Master:" | awk -F: '{print $2}'`
echo $NUM
}
master_slave_check(){
NUM1=`mysql -uroot -hlocalhost -e "show slave status\G;" | grep "Slave_IO_Running" | awk -F: '{print $2}' | sed 's/^[\t]*//g'`
NUM2=`mysql -uroot -hlocalhost -e "show slave status\G;" | grep "Slave_SQL_Running:" | awk -F: '{print $2}' | sed 's/^[\t]*//g'`
if test $NUM1 == "Yes" && test $NUM2 == "Yes" ; then
    echo 50
else
    echo 100
fi
}
main(){
case $1 in
Seconds_Behind_Master)
Seconds_Behind_Master;
;;
master_slave_check)
master_slave_check;
;;
esac
}
main $1
[root@zabbixagent zabbix_agentd.d]# vim all.conf
UserParameter=mysql_monitor[*],/etc/zabbix/zabbix_agentd.d/mysql_monitor.sh "$1"
[root@zabbixagent zabbix_agentd.d]# systemctl restart zabbix-agent
```



# 脚本监控tcp连接数

```shell

```

