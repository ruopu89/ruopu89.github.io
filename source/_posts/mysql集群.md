---
title: mysql集群
date: 2019-01-05 11:40:22
tags: mysql集群
categories: MySQL
---

### 主从复制

```shell
# 准备两个节点，主节点有两块网卡，一为内网地址：172.16.106.132,一为外网地址：192.168.1.14。从节点为内网地址：172.16.106.133

# 配置从节点可以访问外网
* 从节点
[root@http1 ~]# vim /etc/sysconfig/network-scripts/ifcfg-ens33
IPADDR=172.16.106.133
NETMASK=255.255.255.0
GATEWAY=172.16.106.132
DNS1=192.168.1.1
# 加入上面内容

* 主节点
[root@test ~]# vim /etc/sysctl.conf 
net.ipv4.ip_forward = 1
# 加入上面内容，开启转发功能
[root@test ~]# sysctl -p
[root@test ~]# iptables -t nat -I POSTROUTING -s 172.16.106.0/24 -j SNAT --to-source 192.168.1.14
# 添加源地址转发，所有内网出去的数据的地址都改为主节点的外网地址192.168.1.14。

# 安装mysql
* 两节点上
[root@test ~]# wget http://mirrors.ustc.edu.cn/mysql-repo/yum/mysql-5.7-community/el/7/x86_64/mysql-community-release-el7-7.noarch.rpm
# 下载科大源
[root@test ~]# yum install -y mysql-community-release-el7-7.noarch.rpm
# 安装源
[root@test ~]# yum install -y mysql-community-server
# 安装mysql服务，这里安装的是5.6版本

# 配置mysql
* 主节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
    server_id=1
    log-bin=master-log
[root@test ~]# systemctl start mysql

* 从节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
	server_id=11
    relay_log=relay-log
    read_only=ON
[root@test ~]# systemctl start mysql

* 主节点
# 到主节点上创建拥有复制权限的用户，创建的用户最好使用最小权限法则，并且只允许从某个节点连接
mysql -uroot -p
mysql> GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repluser'@'172.16.106.%' IDENTIFIED BY 'replpass';
mysql> FLUSH PRIVILEGES;
mysql> SHOW MASTER STATUS;
+-------------------+----------+--------------+------------------+-------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+-------------------+----------+--------------+------------------+-------------------+
| master-log.000003 |     2643 |              |                  |                   |
+-------------------+----------+--------------+------------------+-------------------+
# 查看二进制日志处于哪个位置，这里查到的是master-log.000003 2643，我们从这里向后手动复制即可

* 从节点
mysql -uroot -p
mysql> CHANGE MASTER TO MASTER_HOST='172.16.106.132',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_PORT=3306,MASTER_LOG_FILE='master-log.000003',MASTER_LOG_POS=2643;
# 连接用CHANGE MASTER TO命令,MASTER_HOST指向主节点地址，MASTER_CONNECT_RETRY是多长时间做一次复制MASTER_LOG_FILE是指定主节点的日志文件，MASTER_LOG_POS是日志的位置
mysql> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: 
                  Master_Host: 172.16.106.132
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000003
          Read_Master_Log_Pos: 2643
               Relay_Log_File: relay-log.000001
                Relay_Log_Pos: 4
        Relay_Master_Log_File: master-log.000003
             Slave_IO_Running: No
            Slave_SQL_Running: No
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 2643
              Relay_Log_Space: 120
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: NULL
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 0
                  Master_UUID: 
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: 
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
# 这里会显示上面连接时指定的信息，如用户名，地址，端口等。其中Slave_IO_Running和Slave_SQL_Running表示本地的两个重要线程，复制时一定要用到，这里显示NO，表示未运行。Exec_Master_Log_Pos表示执行到主节点二进制的哪个位置了，如果与Read_Master_Log_Pos相同，表示与主节点是一样的，数据同步未落后。Seconds_Behind_Master表示落后主节点多长时间，这里是NULL，是因为上面说的两个线程没有启动，启动后就会显示数字了，正数表示落后的时间
mysql> START SLAVE;
# 启动两个线程的命令；也可以用START SLAVE IO_THREAD/START SLAVE SQL_THREAD单独启动线程
[root@http1 ~]# tail -100 /var/log/mysqld.log
# 查看日志
mysql> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 172.16.106.132
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000003
          Read_Master_Log_Pos: 2643
               Relay_Log_File: relay-log.000002
                Relay_Log_Pos: 284
        Relay_Master_Log_File: master-log.000003
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 2643
              Relay_Log_Space: 451
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: e2b8a386-10a3-11e9-8f5d-000c295c6de3
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
# Slave_IO_Running与Slave_SQL_Running变为了Yes，Seconds_Behind_Master变为了0

* 主节点
mysql -uroot -p
mysql> CREATE DATABASE mydb;

* 从节点
mysql> SHOW SLAVE STATUS\G
# 查看变化
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mydb               |

* 主节点
mysql> use mydb
mysql> CREATE TABLE tb1(id INT,Name CHAR(30));

* 从节点
mysql> use mydb
mysql> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tb1            |
+----------------+
mysql> DESC tb1;
+-------+----------+------+-----+---------+-------+
| Field | Type     | Null | Key | Default | Extra |
+-------+----------+------+-----+---------+-------+
| id    | int(11)  | YES  |     | NULL    |       |
| Name  | char(30) | YES  |     | NULL    |       |
+-------+----------+------+-----+---------+-------+
mysql> SHOW GLOBAL VARIABLES LIKE 'read_only';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| read_only     | ON    |
+---------------+-------+
# 这里应该显示ON，查看全局变量read_only，是否为只读

* 主节点
[root@test ~]# mysql -uroot -p < jiaowu.sql

* 从节点
mysql -uroot -p
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jiaowu             |

========================================================
流程：
1. 主节点/etc/my.cnf打开server_id=1、log-bin=master-log（启动二进制日志）。启动服务
2. 从节点server_id=11、relay_log=relay-log（启动中继日志）、read_only=ON（让从节点为只读）。启动服务 
3. 到主节点上创建拥有复制权限的用户，创建的用户最好使用最小权限，并且只允许从某个节点连接
4. 到从节点用CHANGE MASTER TO命令连接主节点
========================================================
```



### 主主复制

```shell
# 准备两个节点，主节点有两块网卡，一为内网地址：172.16.106.132,一为外网地址：192.168.1.14。从节点为内网地址：172.16.106.133

# 配置
* 主节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
    server_id=1
    log-bin=master-log
    relay_log=relay-log
    auto_increment_offset=1
    auto_increment_increment=2
[root@test ~]# systemctl start mysql

* 从节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
    server_id=11
    log-bin=master-log
    relay_log=relay-log
    auto_increment_offset=2
    auto_increment_increment=2
[root@http1 ~]# systemctl start mysql

* 主节点
mysql> GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repluser'@'172.16.106.133' IDENTIFIED BY 'replpass';
# 这里设置用户只能从172.16.106.133连接，这个是从节点的内网地址
mysql> FLUSH PRIVILEGES;
mysql> SHOW MASTER STATUS;
+-------------------+----------+--------------+------------------+-------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+-------------------+----------+--------------+------------------+-------------------+
| master-log.000004 |      444 |              |                  |                   |
+-------------------+----------+--------------+------------------+-------------------+

* 从节点
[root@http1 ~]# mysql -uroot -p
mysql> GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repluser'@'192.168.1.14' IDENTIFIED BY 'replpass';
# 这里只有添加主节点的192地址，主节点才能连接从节点，如果添加的是主节点的内网地址就无法连接。测试发现在主节点连接从节点时使用的是192的地址。
mysql> FLUSH PRIVILEGES;
mysql> SHOW MASTER STATUS;
+-------------------+----------+--------------+------------------+-------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+-------------------+----------+--------------+------------------+-------------------+
| master-log.000001 |      444 |              |                  |                   |
+-------------------+----------+--------------+------------------+-------------------+
mysql> STOP SLAVE;
mysql> CHANGE MASTER TO MASTER_HOST='172.16.106.132',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_PORT=3306,MASTER_LOG_FILE='master-log.000004',MASTER_LOG_POS=444;

* 主节点
mysql>CHANGE MASTER TO MASTER_HOST='172.16.106.133',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_PORT=3306,MASTER_LOG_FILE='master-log.000001',MASTER_LOG_POS=444;
mysql> START SLAVE;
mysql> SHOW SLAVE STATUS\G

* 从节点
mysql> START SLAVE;
mysql> SHOW SLAVE STATUS\G
mysql> create database mydb1;

* 主节点
mysql> CREATE TABLE tbl1(id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,Name CHAR(30));

* 从节点
mysql> INSERT INTO tbl1 (Name) VALUES ('stu1'),('stu2');
mysql> select * from tbl1;
+----+------+
| id | Name |
+----+------+
|  2 | stu1 |
|  4 | stu2 |
+----+------+
# 这时可以看到ID是2和4，因为配置文件中设置从2开始

* 主节点
mysql> INSERT INTO tbl1 (Name) VALUES ('stu3'),('stu4');
mysql> select * from tbl1;
+----+------+
| id | Name |
+----+------+
|  2 | stu1 |
|  4 | stu2 |
|  5 | stu3 |
|  7 | stu4 |
+----+------+
这里可以看到是5和7，因为是从前面数据向下的ID号

========================================================
 * 如果主从节点数据不一致，解决的办法最好是，将从节点停掉，从主节点备份再恢复到从节点，再开启从节点复制功能。
 * 数据库读写分离后，前端应该有一个读写分离器，读写分离器还可以做语句网关，禁止掉一些危险语句。数据库不应该面向互联网。公司人员远程管理时可通过VPN，拔号或跳板机连接服务器
 
 # 双主模型创建过程
1. 开启两台服务器的二进制日志和中继日志，设置数据ID从几开始和增长因子。之后启动服务
2. 在两台服务器上创建有复制权限的用户。
3. 在两台服务器上查看所处的日志位置，再通过CHANGE MASTER TO命令设置对方为主服务器
4. 启动功能START SLAVE;。之后就可以测试了。
========================================================
```



### 半同步

```shell
* 主节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
    server_id=1
    log-bin=master-log
[root@test ~]# systemctl start mysql

* 从节点
[root@test ~]# vim /etc/my.cnf
    [mysqld]
    innodb_file_per_table=ON
    skip_name_resolve=ON
	server_id=11
    relay_log=relay-log
[root@test ~]# systemctl start mysql

* 主节点
mysql> GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repluser'@'172.16.106.133' IDENTIFIED BY 'replpass';   
mysql> FLUSH PRIVILEGES;
mysql> SHOW MASTER STATUS;
+-------------------+----------+--------------+------------------+-------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+-------------------+----------+--------------+------------------+-------------------+
| master-log.000005 |      434 |              |                  |                   |
+-------------------+----------+--------------+------------------+-------------------+

* 从节点
mysql> CHANGE MASTER TO MASTER_HOST='172.16.106.132',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_PORT=3306,MASTER_LOG_FILE='master-log.000005',MASTER_LOG_POS=434;
mysql> START SLAVE;
mysql> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 172.16.106.132
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000005
          Read_Master_Log_Pos: 434
               Relay_Log_File: relay-log.000002
                Relay_Log_Pos: 284
        Relay_Master_Log_File: master-log.000005
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 434
              Relay_Log_Space: 451
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: e2b8a386-10a3-11e9-8f5d-000c295c6de3
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0

* 主节点
mysql> INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
# 安装插件

* 从节点
mysql> INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
mysql> SHOW PLUGINS;
# 在两个节点可以看到最下面一行中rpl_semi_sync_slave 已经是ACTIVE状态了

* 主节点
mysql> SHOW GLOBAL VARIABLES LIKE '%semi%';
+------------------------------------+-------+
| Variable_name                      | Value |
+------------------------------------+-------+
| rpl_semi_sync_master_enabled       | OFF   |
| rpl_semi_sync_master_timeout       | 10000 |
| rpl_semi_sync_master_trace_level   | 32    |
| rpl_semi_sync_master_wait_no_slave | ON    |
| rpl_semi_sync_slave_enabled        | OFF   |
| rpl_semi_sync_slave_trace_level    | 32    |
+------------------------------------+-------+
# 可以看到rpl_semi_sync_master_enabled一项还是OFF，要改为ON。rpl_semi_sync_master_timeout为10000，表示10秒；rpl_semi_sync_master_wait_no_slave表示如果没有半节点同步是否等待
mysql> SET @@global.rpl_semi_sync_master_enabled=ON;
# 启动半同步
mysql> SHOW GLOBAL VARIABLES LIKE '%semi%';
+------------------------------------+-------+
| Variable_name                      | Value |
+------------------------------------+-------+
| rpl_semi_sync_master_enabled       | ON    |
# 这时rpl_semi_sync_master_enabled是ON了

* 从节点
mysql> SHOW GLOBAL VARIABLES LIKE '%rpl%';
+---------------------------------+----------+
| Variable_name                   | Value    |
+---------------------------------+----------+
| rpl_semi_sync_slave_enabled     | OFF      |
| rpl_semi_sync_slave_trace_level | 32       |
| rpl_stop_slave_timeout          | 31536000 |
+---------------------------------+----------+
mysql> SET @@global.rpl_semi_sync_slave_enabled=ON;
mysql> SHOW GLOBAL VARIABLES LIKE '%rpl%';
+---------------------------------+----------+
| Variable_name                   | Value    |
+---------------------------------+----------+
| rpl_semi_sync_slave_enabled     | ON       |
| rpl_semi_sync_slave_trace_level | 32       |
| rpl_stop_slave_timeout          | 31536000 |
+---------------------------------+----------+

* 主节点
mysql> SHOW GLOBAL STATUS LIKE 'rpl%';
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 0     |
# 第一项Rpl_semi_sync_master_clients表示从节点有几个，这里是0

* 从节点
mysql> STOP SLAVE IO_THREAD;
mysql> START SLAVE IO_THREAD;
# 从节点需要先停止再启动IO线程，才能加入到半同步的节点

* 主节点
mysql> SHOW GLOBAL STATUS LIKE 'rpl%';
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 1     |
# 这时Rpl_semi_sync_master_clients是1了。
[root@test ~]# mysql -uroot -p < jiaowu.sql
mysql> SHOW GLOBAL STATUS LIKE 'rpl%';
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_master_clients               | 1     |
| Rpl_semi_sync_master_net_avg_wait_time     | 498   |
| Rpl_semi_sync_master_net_wait_time         | 10959 |
| Rpl_semi_sync_master_net_waits             | 22    |
| Rpl_semi_sync_master_no_times              | 0     |
| Rpl_semi_sync_master_no_tx                 | 0     |
| Rpl_semi_sync_master_status                | ON    |
| Rpl_semi_sync_master_timefunc_failures     | 0     |
| Rpl_semi_sync_master_tx_avg_wait_time      | 625   |
| Rpl_semi_sync_master_tx_wait_time          | 13762 |
| Rpl_semi_sync_master_tx_waits              | 22    |
| Rpl_semi_sync_master_wait_pos_backtraverse | 0     |
| Rpl_semi_sync_master_wait_sessions         | 0     |
| Rpl_semi_sync_master_yes_tx                | 22    |
| Rpl_semi_sync_slave_status                 | OFF   |
+--------------------------------------------+-------+
# 这时可以看到有数据的信息了

* 从节点
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jiaowu             |
# jiaowu库同步了

=======================================================================================
半同步复制创建过程
1. 主节点打开server_id=1、log-bin=master-log。启动服务
2. 从节点打开server_id=11、relay_log=relay-log。启动服务
3. 主节点创建可以使用复制功能的帐号
4. 从节点按主节点创建的帐号连接主节点
5. 主节点安装插件INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
6. 从节点安装插件INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
7. 主节点启用半同步SET @@global.rpl_semi_sync_master_enabled=ON;
8. 从节点启用半同步SET @@global.rpl_semi_sync_slave_enabled=ON;。重启IO线程STOP SLAVE IO_THREAD; --> START SLAVE IO_THREAD;

* 异步复制（Asynchronous replication）
MySQL默认的复制即是异步的，主库在执行完客户端提交的事务后会立即将结果返回给客户端，并不关心从库是否已经接收并处理，这样就会有一个问题，主库如果crash(crash[kræʃ]：崩溃)掉了，此时主库上已经提交的事务可能并没有传到从库上，如果此时，强行将从库提升为主库，可能导致新主库上的数据不完整。

* 全同步复制（Fully synchronous replication）
当主库执行完一个事务，所有的从库都执行了该事务才返回给客户端。因为需要等待所有从库执行完该事务才能返回，所以全同步复制的性能必然会受到严重的影响。

* 半同步复制（Semisynchronous replication）
介于异步复制和全同步复制之间，主库在执行完客户端提交的事务后不是立刻返回给客户端，而是等待至少一个从库接收到并写到relay log中才返回给客户端。相对于异步复制，半同步复制提高了数据的安全性，同时它也造成了一定程度的延迟，这个延迟最少是一个TCP/IP往返的时间。所以，半同步复制最好在低延时的网络中使用。
=======================================================================================
```



### 过滤器

```shell
# 实现只复制某一个库（一般就到库级别，不会到表级别）。准备两台主机，主服务器地址：192.168.1.14，从服务器地址：192.168.1.15

* 主节点
[root@test ~]# yum install -y mariadb-server
[root@test ~]# vim /etc/my.cnf
[mysqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=1
log-bin=master-log
[root@test ~]# systemctl start mariadb
[root@test ~]# mysql_secure_installation
[root@test ~]# mysql -uroot -pcentos
MariaDB [(none)]> GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repluser'@'192.168.1.%' IDENTIFIED BY 'replpass';  
# 创建只有192.168.1.15通过repluser用户可以同步 
MariaDB [(none)]> FLUSH PRIVILEGES;
MariaDB [(none)]> SHOW MASTER STATUS;
+-------------------+----------+--------------+------------------+
| File              | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+-------------------+----------+--------------+------------------+
| master-log.000003 |     1989 |              |                  |
+-------------------+----------+--------------+------------------+

* 从节点
[root@test ~]# yum install -y mariadb-server
[root@test ~]# vim /etc/my.cnf
[mysqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=11
relay_log=relay-log
[root@test ~]# systemctl start mariadb
[root@test ~]# mysql_secure_installation
[root@test ~]# mysql -uroot -pcentos
MariaDB [(none)]> CHANGE MASTER TO MASTER_HOST='192.168.1.14',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_PORT=3306,MASTER_LOG_FILE='master-log.000003',MASTER_LOG_POS=1989;
MariaDB [(none)]> START SLAVE;
MariaDB [(none)]> SHOW SLAVE STATUS\G
MariaDB [(none)]> SHOW GLOBAL VARIABLES LIKE '%do_db%';
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| replicate_do_db |       |
+-----------------+-------+
MariaDB [(none)]> SET @@global.replicate_do_db=mydb;
MariaDB [(none)]> START SLAVE;
MariaDB [(none)]> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.1.14
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000003
          Read_Master_Log_Pos: 1989
               Relay_Log_File: relay-log.000003
                Relay_Log_Pos: 530
        Relay_Master_Log_File: master-log.000003
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: mydb
# Replicate_Do_DB变为了mydb，表示只同步这个库              
              
* 主节点
[root@test ~]# mysql -uroot -pcentos < jiaowu.sql
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jiaowu             |
MariaDB [(none)]> USE jiaowu
MariaDB [jiaowu]> SHOW TABLES;
MariaDB [jiaowu]> DROP TABLE students;

* 从节点
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
# 从库中并没有jiaowu库

* 主节点
MariaDB [jiaowu]> CREATE DATABASE mydb;
MariaDB [jiaowu]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jiaowu             |
| mydb               |

* 从节点
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mydb               |
# 从库同步了mydb库

* 主节点
MariaDB [mydb]> CREATE TABLE tbl1 (id INT);
MariaDB [mydb]> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
+----------------+

* 从节点
MariaDB [(none)]> SHOW TABLES FROM mydb;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
+----------------+
# 同步了tbl1表
```



### 读写分离器 proxysql

```shell
# 准备一个集群，有一个master主机，地址192.168.1.14，两个从节点，地址一个192.168.1.15，一个192.168.1.13。再准备一个读写分离器，地址是192.168.1.10。请求都到192.168.1.10，写到192.168.1.14，读到192.168.1.15和192.168.1.13。以上面的主从复制为基础
# 一定要同步服务器的时间，保证所有服务器的时间是一样的

* 从节点192.168.1.15，将只复制一个库改回来
MariaDB [(none)]> STOP SLAVE;
MariaDB [(none)]> SET @@global.replicate_do_db='';
# 改为空就可以了
MariaDB [(none)]> START SLAVE;
MariaDB [(none)]> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.1.14
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000003
          Read_Master_Log_Pos: 7043
               Relay_Log_File: relay-log.000004
                Relay_Log_Pos: 530
        Relay_Master_Log_File: master-log.000003
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB:

* 从节点192.168.1.13
[root@test ~]# yum install -y mariadb-server
[root@test ~]# vim /etc/my.cnf
[mysqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=12
relay_log=relay-log
read_only=ON
[root@test ~]# systemctl start mariadb

* 主节点192.168.1.14
[root@test ~]# mysqldump -uroot --all-databases -R -E --triggers -x --master-data=2 -p > alldb.sql
# --all-databases  , -A：导出全部数据库。
# --routines, -R：导出存储过程以及自定义函数。
# --events, -E：导出事件。
# --triggers：导出触发器。该选项默认启用，用--skip-triggers禁用它。
# --lock-all-tables,  -x：提交请求锁定所有数据库中的所有表，以保证数据的一致性。这是一个全局读锁，并且自动关闭--single-transaction 和--lock-tables 选项。
# --master-data：该选项将当前服务器的binlog的位置和文件名追加到输出文件中(show master status)。如果为1，将会输出CHANGE MASTER 命令；如果为2，输出的CHANGE  MASTER命令前添加注释信息。
[root@test ~]# scp alldb.sql 192.168.1.13:/root
# 复制到刚加上来的从节点
[root@test ~]# rm -rf alldb.sql

* 从节点192.168.1.13
[root@test ~]# mysql -uroot -p < alldb.sql
MariaDB [(none)]> CHANGE MASTER TO MASTER_HOST='192.168.1.14',MASTER_USER='repluser',MASTER_PASSWORD='replpass',MASTER_LOG_FILE='master-log.000003',MASTER_LOG_POS=7043;
# 设置与主节点同步
MariaDB [(none)]> START SLAVE;
MariaDB [(none)]> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.1.14
                  Master_User: repluser
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: master-log.000003
          Read_Master_Log_Pos: 7295
               Relay_Log_File: relay-log.000002
                Relay_Log_Pos: 782
        Relay_Master_Log_File: master-log.000003
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes

* 主节点192.168.1.14
MariaDB [(none)]> CREATE DATABASE testdb;
# 到主节点创建一个库测试一下

* 两个从节点
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| jiaowu             |
| mydb               |
| mysql              |
| performance_schema |
| testdb             |
# 在两个从节点可以看到创建的库

* 主节点192.168.1.14
MariaDB [(none)]> DROP DATABASE testdb;
MariaDB [(none)]> GRANT ALL ON *.* TO 'myadmin'@'192.168.1.%' IDENTIFIED BY 'mypass';
# 创建一个有权限连接主从服务器的帐号。这个用户会同步到两个从节点
MariaDB [(none)]> FLUSH PRIVILEGES;

* 两个从节点
MariaDB [(none)]> SELECT User FROM mysql.user;
+----------+
| User     |
+----------+
| root     |
| myadmin  |

* 分离器192.168.1.10
下载 proxysql-1.3.6-1-centos7.x86_64.rpm
[root@test ~]# yum install -y proxysql-1.3.6-1-centos7.x86_64.rpm
[root@test ~]# cp /etc/proxysql.cnf{,.bak}
[root@test ~]# vim /etc/proxysql.cnf
datadir="/var/lib/proxysql"
# 数据目录路径，这是proxysql的状态数据，与mysql无关
admin_variables=
{
        admin_credentials="admin:admin"
        # 登录proxysql进行管理时用的帐号密码
        mysql_ifaces="127.0.0.1:6032;/tmp/proxysql_admin.sock"
        # 连接时用的地址和端口
}
mysql_variables=
{
        threads=4
        # 启动几个线程，它是单线程响应多个请求的，与CPU有关。测试时CPU为双核，但还是启动了四个线程
        max_connections=2048
        # 并发连接数
        default_query_delay=0
        default_query_timeout=36000000
        have_compress=true
        poll_timeout=2000
        interfaces="0.0.0.0:3306;/tmp/proxysql.sock"
        # 监听在所有地址的3306端口接收请求，测试调整上面的启动线程和此项的端口都不起作用，启动后还是启动4个线程，监听在6033端口。用1.4.7和1.3.6版本都是如此.恢复镜像后正常了
        default_schema="mydb"
        # 登录后默认操作的数据库
        stacksize=1048576
        server_version="5.5.30"
        connect_timeout_server=3000
        monitor_history=600000
        monitor_connect_interval=60000
        monitor_ping_interval=10000
        monitor_read_only_interval=1500
        monitor_read_only_timeout=500
        ping_interval_server=120000
        ping_timeout_server=500
        commands_stats=true
        sessions_sort=true
        connect_retries_on_failure=10
}
mysql_servers =
# 每一组花括号记录一台服务器，用逗号隔开，再记录下一台服务器
( # 要有括号，不然无法启动，在message日志中会提示语法错误
{
        address = "192.168.1.14" # no default, required . If port is 0 , address is interpred as a Unix Socket Domain
        port = 3306           # no default, required . If port is 0 , address is interpred as a Unix Socket Domain
        hostgroup = 0           # no default, required
        # 所处的主机组，将读定义一组，写定义一组
        status = "ONLINE"     # default: ONLINE
        # 配置完以后，这个服务器默认是在线的还是离线的
        weight = 1            # default: 1
        # 权重
        compression = 0       # default: 0
        # 压缩
        max_connections = 200
        # 最大并发连接数
         #	max_replication_lag = 10	# 读服务器是否延迟，这里默认是10秒
},
{
        address = "192.168.1.15" # no default, required . If port is 0 , address is interpred as a Unix Socket Domain
        port = 3306           # no default, required . If port is 0 , ddress is interpred as a Unix Socket Domain
        hostgroup = 1           # no default, required
        status = "ONLINE"     # default: ONLINE
        weight = 1            # default: 1
        compression = 0       # default: 0
        max_connections = 500
},
{
        address = "192.168.1.13" # no default, required . If port is 0 , address is interpred as a Unix Socket Domain
        port = 3306           # no default, required . If port is 0 ,ddress is interpred as a Unix Socket Domain
        hostgroup = 1           # no default, required
        status = "ONLINE"     # default: ONLINE
        weight = 1            # default: 1
        compression = 0       # default: 0
        max_connections = 500
}
)
mysql_users:
# 定义以哪个用户组的身份连接至哪台服务器上
(
{
        username = "myadmin" # no default , required
        password = "mypass" # default: ''
        default_hostgroup = 0 # default: 0
        # 默认连接哪个组
        active = 1            # default: 1
        default_schema="mydb"
        # 连接后默认使用的数据库
}
)
mysql_query_rules:
# 语句路由，实际是一个防火墙，可以屏蔽一些语句
(
)
scheduler=
# 调度器
(
)
mysql_replication_hostgroups=
# 指明哪个组读，哪个组写。可以同时调度多个集群
(
{
        writer_hostgroup=0
        reader_hostgroup=1
        comment="test repl 1"
        # 说明
}
)
[root@test ~]# systemctl start proxysql
# 启动
[root@test ~]# ss -tln
State       Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN      0      128    127.0.0.1:6032                    *:*                  
LISTEN      0      128         *:6033                    *:*                  
LISTEN      0      128         *:6033                    *:*                  
LISTEN      0      128         *:6033                    *:*                  
LISTEN      0      128         *:6033                    *:*
[root@test ~]# yum install -y mariadb
# 安装客户端
[root@test ~]# mysql -h192.168.1.10 -P6033 -umyadmin -pmypass
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 5.5.30 (ProxySQL)
# 连接后提示连接的是"Server version: 5.5.30 (ProxySQL)"
MySQL [(none)]> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
| tbl2           |
+----------------+
MySQL [(none)]> CREATE TABLE tbl3(id INT);
MySQL [(none)]> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
| tbl2           |
| tbl3           |
+----------------+

* 两台从节点
MariaDB [mydb]> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
| tbl2           |
| tbl3           |
+----------------+
# 两个从节点都有tbl3表了。这说明上面的创建语句被路由到了主节点上，因为如果路由到了从节点上，那么也只能有一个从服务器有此表，如果两个都有，说明是复制主节点的

* 主节点192.168.1.14
MariaDB [(none)]> SHOW PROCESSlist;
+------+----------+--------------------+------+-------------+-------+-----------------------------------------------------------------------+------------------+----------+
| Id   | User     | Host               | db   | Command     | Time  | State                                                                 | Info             | Progress |
+------+----------+--------------------+------+-------------+-------+-----------------------------------------------------------------------+------------------+----------+
|   17 | repluser | 192.168.1.15:51118 | NULL | Binlog Dump | 15388 | Master has sent all binlog to slave; waiting for binlog to be updated | NULL             |    0.000 |
|   21 | repluser | 192.168.1.13:41342 | NULL | Binlog Dump | 14775 | Master has sent all binlog to slave; waiting for binlog to be updated | NULL             |    0.000 |
| 6183 | root     | localhost          | NULL | Query       |     0 | NULL                                                                  | SHOW PROCESSlist |    0.000 |
+------+----------+--------------------+------+-------------+-------+-----------------------------------------------------------------------+------------------+----------+
# 可以看到有几个客户端连上来了
MariaDB [(none)]> USE mydb
MariaDB [mydb]> SHOW TABLES;
+----------------+
| Tables_in_mydb |
+----------------+
| tbl1           |
| tbl2           |
| tbl3           |
+----------------+
# 主节点上也有tbl3表
[root@test ~]# tcpdump -i ens33 -nn -vv port 3306
# 监听3306端口，这时可以看到很多信息，是分离器的ping探测。在两个从节点和主节点上做此操作

* 分离器192.168.1.10
[root@test ~]# mysql -uadmin -padmin -hlocalhost -S /tmp/proxysql_admin.sock 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 5
Server version: 5.5.30 (ProxySQL Admin Module)
MySQL [(none)]> SHOW DATABASES;
+-----+---------+-------------------------------+
| seq | name    | file                          |
+-----+---------+-------------------------------+
| 0   | main    |                               |
| 2   | disk    | /var/lib/proxysql/proxysql.db |
| 3   | stats   |                               |
| 4   | monitor |                               |
+-----+---------+-------------------------------+
MySQL [(none)]> USE monitor
MySQL [monitor]> SHOW TABLES;
+--------------------------------------+
| tables                               |
+--------------------------------------+
| global_variables                     |
| mysql_collations                     |
| mysql_query_rules                    |
| mysql_replication_hostgroups         |
| mysql_servers                        |
| mysql_users                          |
| runtime_global_variables             |
| runtime_mysql_query_rules            |
| runtime_mysql_replication_hostgroups |
| runtime_mysql_servers                |
| runtime_mysql_users                  |
| runtime_scheduler                    |
| scheduler                            |
+--------------------------------------+
MySQL [monitor]> SELECT * FROM mysql_users;
+----------+----------+--------+---------+-------------------+----------------+---------------+------------------------+--------------+---------+----------+-----------------+
| username | password | active | use_ssl | default_hostgroup | default_schema | schema_locked | transaction_persistent | fast_forward | backend | frontend | max_connections |
+----------+----------+--------+---------+-------------------+----------------+---------------+------------------------+--------------+---------+----------+-----------------+
| myadmin  | mypass   | 1      | 0       | 0                 | mydb           | 0             | 0                      | 0            | 1       | 1        | 10000           |
+----------+----------+--------+---------+-------------------+----------------+---------------+------------------------+--------------+---------+----------+-----------------+
# 只要向这个表中加入数据，定义好信息，就可以实现运行时修改主从节点的主机了
MySQL [monitor]> SELECT * FROM runtime_mysql_replication_hostgroups;
+------------------+------------------+-------------+
| writer_hostgroup | reader_hostgroup | comment     |
+------------------+------------------+-------------+
| 0                | 1                | test repl 1 |
+------------------+------------------+-------------+
# 显示读写组的编号
MySQL [monitor]> select * from mysql_servers;
+--------------+--------------+------+--------+--------+-------------+-----------------+---------------------+---------+----------------+---------+
| hostgroup_id | hostname     | port | status | weight | compression | max_connections | max_replication_lag | use_ssl | max_latency_ms | comment |
+--------------+--------------+------+--------+--------+-------------+-----------------+---------------------+---------+----------------+---------+
| 0            | 192.168.1.14 | 3306 | ONLINE | 1      | 0           | 200             | 0                   | 0       | 0              |         |
| 1            | 192.168.1.15 | 3306 | ONLINE | 1      | 0           | 500             | 0                   | 0       | 0              |         |
| 1            | 192.168.1.13 | 3306 | ONLINE | 1      | 0           | 500             | 0                   | 0       | 0              |         |
+--------------+--------------+------+--------+--------+-------------+-----------------+---------------------+---------+----------------+---------+
MySQL [monitor]> UPDATE mysql_servers SET hostgroup_id=0 WHERE hostname='192.168.1.13';
# 其他库也支持运行时修改
```



### MHA

```shell
# 当主节点故障时，将从节点提升为主节点
# 以上面四台主机为基础，在分离器上安装MHA，一台主节点，两台从节点

* 主节点192.168.1.14
[root@test ~]# vim /etc/my.cnf
[mysqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=1
log-bin=master-log
relay_log=relay-log
[root@test ~]# systemctl start mariadb

* 两个从节点192.168.1.13、192.168.1.15
[root@test ~]# vim /etc/my.cnf
[mysqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=11
log-bin=master-log
relay_log=relay-log
relay_log_purge=0
read_only=ON
[root@test ~]# systemctl start mariadb

* 主节点192.168.1.14
[root@test ~]# ssh-keygen -t rsa -P ''
[root@test ~]# ssh-copy-id -i .ssh/id_rsa.pub root@192.168.1.10
[root@test ~]# ssh-copy-id -i .ssh/id_rsa.pub root@192.168.1.13
[root@test ~]# ssh-copy-id -i .ssh/id_rsa.pub root@192.168.1.14
[root@test ~]# ssh-copy-id -i .ssh/id_rsa.pub root@192.168.1.15
[root@test ~]# scp -p .ssh/* 192.168.1.10:/root/.ssh
[root@test ~]# scp -p .ssh/* 192.168.1.13:/root/.ssh
[root@test ~]# scp -p .ssh/* 192.168.1.15:/root/.ssh

* 分离器192.168.1.10
下载mha4mysql-manager-0.56.0.el6.noarch.rpm mha4mysql-node-0.56-0.el6.noarch.rpm
[root@test ~]# yum install mha4mysql-manager-0.56-0.el6.noarch.rpm mha4mysql-node-0.56-0.el6.noarch.rpm
[root@test ~]# scp mha4mysql-node-0.56-0.el6.noarch.rpm 192.168.1.13:/root
[root@test ~]# scp mha4mysql-node-0.56-0.el6.noarch.rpm 192.168.1.14:/root
[root@test ~]# scp mha4mysql-node-0.56-0.el6.noarch.rpm 192.168.1.15:/root

* 三个节点192.168.1.13、192.168.1.14、192.168.1.15
[root@test ~]# yum install -y mha4mysql-node-0.56-0.el6.noarch.rpm

* 主节点192.168.1.14
GRANT ALL ON *.* TO 'mhaadmin'@'172.16.0.%' IDENTIFIED BY 'mhapass';
# 创建一个mha连接mysql的用户，用上面主从复制中创建的用户也可以
FLUSH PRIVILEGES;

* 分离器192.168.1.10
[root@test ~]# mkdir /etc/masterha
[root@test ~]# vim /etc/masterha/app1.cnf
[server default]
user=mhaadmin
password=mhapass
manager_workdir=/data/masterha/app1
manager_log=/data/masterha/app1/manager.log
remote_workdir=/data/masterha/app1
ssh_user=root
repl_user=repladmin
# 有复制权限的用户名和密码
repl_password=replpass
ping_interval=1

[server1]
hostname=192.168.1.14
candidate_master=1
# 是否可以被选为主节点，1为可以
[server2]
hostname=192.168.1.15
candidate_master=1

[server3]
hostname=192.168.1.13
candidate_master=1
[root@test ~]# masterha_check_ssh --conf=/etc/masterha/app1.cnf
# 测试基于密钥认证是否可以连接主机，后面指明配置文件。如果没问题会显示OK
[root@test ~]# masterha_check_repl --conf=/etc/masterha/app1.cnf
# 检测主节点和从节点是否正常，这里提示从节点没有repladmin用户，如果提升为主节点会有问题。所以复制时最好看一下主节点(SHOW MASTER STATUS;)日志状态，再创建用户，之后从节点从创建用户之前的日志位置开始复制，就没问题了。

* 主节点192.168.1.14
GRANT REPLICATION CLIENT,REPLICATION SLAVE ON *.* TO 'repladmin'@'172.16.0.%' IDENTIFIED BY 'replpass';
FLUSH PRIVILEGES;

* 分离器192.168.1.10
[root@test ~]# masterha_check_repl --conf=/etc/masterha/app1.cnf
# 再检查就OK了。
[root@test ~]# nohup masterha_manager --conf=/etc/masterha/app1.cnf &>> /data/masterha/app1/manager.log &
# 启动监控，如果主节点故障就切换，切换后这个进程会关闭，需手动启动
[root@test ~]# ps aux
# 有perl /usr/bin/masterha_manager --conf=/etc/masterha/app1.cnf一条
[root@test ~]# masterha_check_status --conf=/etc/masterha/app1.cnf
app1 (pid:2793) is running(0:PING_OK), master:192.168.1.14
# //检查集群是否有问题，提示主节点是192.168.1.14

* 主节点192.168.1.14
[root@test ~]# systemctl stop mariadb
# 关闭mariadb服务。测试从节点是否会提升为主节点

* 分离器192.168.1.10
[root@test ~]# ps aux
# 上面的nohup启动的masterha_manager进程没有了，完成切换这个进程就会终止。显示：
#“[1]+  完成                  nohup masterha_manager --conf=/etc/masterha/app1.cnf &>/data/masterha/app1/manager.log”
[root@test ~]# less /data/masterha/app1/manager.log
# 查看日志，最后有Failover Report故障转移报告，提示主节点已改为192.168.1.15，并修改了从服务器的配置

* 节点192.168.1.15
[root@test ~]# mysqldump -uroot -x -R -E --triggers --master-data=2 --all-databases -p > alldb.sql
# 完全备份
[root@test ~]# scp alldb.sql 192.168.1.14:/root

* 节点192.168.1.14
[root@test ~]# rm -rf /var/lib/mysql/* 
[root@test ~]# vim /etc/my.cnf
[msyqld]
innodb_file_per_table=ON
skip_name_resolve=ON
server_id=1
relay_log_purge=0
read_only=1
log-bin=master-log
relay_log=relay-log
# 加入两条配置
[root@test ~]# systemctl start mariadb
[root@test ~]# mysql < alldb.sql
[root@test ~]# head -30 alldb.sql
# 查看CHANGE MASTER TO一行master-log的文件名和位置
[root@test ~]# mysql
# 因为是重新初始化的mariadb，所以没有密码，与主节点同步后就会有密码了
CHANGE MASTER TO MASTER_HOST='192.168.1.15',MASTER_USER='repladmin',MASTER_PASSWORD='replpass',MASTER_LOG_FILE='master-log.000001',MASTER_LOG_POS=633;
START SLAVE;
# 启动线程，这样就修复好了。
SHOW SLAVE STATUS\G
# 查看时有报错，提示"Slave_SQL_Running:No"。解决方法如下：
=======================================================================================
方法一
mysql> stop slave ;
mysql> set GLOBAL SQL_SLAVE_SKIP_COUNTER=1;
# 在主从库维护中，有时候需要跳过某个无法执行的命令，需要在slave处于stop状态下，执行 set global sql_slave_skip_counter=N以跳过命令。常用的且不易用错的是N=1的情况
mysql> start slave ;
mysql> SHOW SLAVE STATUS\G

方法二
mysql> stop slave ;
到主服务器上查看主机状态，记录File和Position对应的值
mysql> CHANGE MASTER TO MASTER_HOST='192.168.1.15',MASTER_USER='repladmin',MASTER_PASSWORD='replpass',MASTER_LOG_FILE='master-log.000001',MASTER_LOG_POS=633;
mysql> start slave ;
mysql> SHOW SLAVE STATUS\G
=======================================================================================

* 分离器192.168.1.10
[root@test ~]# masterha_check_repl --conf=/etc/masterha/app1.cnf
[root@test ~]# nohup masterha_manager --conf=/etc/masterha/app1.cnf &>> /data/masterha/app1/manager.log &
# 地址转移后，这个进程就会关闭，需要手动再启动
```

