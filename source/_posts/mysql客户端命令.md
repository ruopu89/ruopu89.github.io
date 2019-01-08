---
title: mysql客户端命令
date: 2019-01-07 13:09:37
tags: mysql客户端命令
categories: MySQL
---

### mysql

```shell
选项
--user, -u	
# 用户
--host -h
# 地址
--password -p
# 密码
--port
# 端口
--protocol
--database DATABASE, -D  
# 在连入數據庫時指定默認庫。如mysql -D mydb，在登入時指定了mydb為默認庫
--compress 
# 語句先壓縮再發送或返回

例：用mysql导入sql文件
1. vim test.sql
    CREATE DATABASE testdb;
    CREATE TABLE testdb.tb1(id INT, name CHAR(20));
2. mysql -uroot -p
3. mysql>\. /root/test.sql      
# 用\.載入數據庫，用soucer也可加载脚本
或
4. mysql < test.sql        
# 輸入重定向也能載入數據庫
5. SHOW DATABASES；
# 查看载入的数据库
# -e選項：不進入服務器，傳命令到服務器
mysql -e 'CREATE DATABASE edb;'
mysql -e 'SHOW DATABASES;'
mysql -e 'SELECT * FROM jiaowu.students;'

例1：插入一張表，且mysql規定第一條數據必須手動插入，之後可寫腳本輸入數據，可將下面語句寫入腳本，用變量引用字段的值，寫一個死循環
mysql -e “INSERT INTO jiaowu.students (Name,Age,Gender,CID1,CID2,TID,CreateTime) VALUES ('stu1',23,'F',4,1,6);”
# 测试这里一定要用双引号，单引号不行
```



### mysqladmin

```shell
语法：
mysqladmin [options] command [arg] [command [arg]] …    
# [arg]是參數

create：建庫。例：mysqladmin create hellodb
# 这里不用指明用户名密码等信息，因为mysqladmin可以读取到在家目录创建的.my.cnf文件
    
debug

drop DATABASES：刪庫

ping：看數據庫是否在線。例：mysqladmin -uroot -p -h172.16.0.1 ping

processlist：正在執行的線程列表顯示  例：mysqladmin processlist

status：狀態
例：
mysqladmin status --sleep 2   			
# 兩秒顯示一次
mysqladmin status --sleep 2 --count 2      
# 兩秒顯示一次共顯示兩次

extended status：顯示mysql的狀態變量及其值，监控mysql服务器非常重要的手段

variables：顯示服務器變量

flush-privileges：讓mysqld重讀授權表

flush-tables：關閉所有已打開的表

flush-threads：重置線程緩存，清除线程池中的空闲线程

flush-status：重置大多數的服務器狀態變量，慎用

flush-logs：二進制和中繼日志滾動

flush-hosts：清除主機的內部信息，包括緩存，及由於太多的登陸而拒絕的登陸

flush-kill：杀死mysql的进程

reload：讓mysqld重讀授權表

refresh：相當於同時執行flush-hosts和flush-logs

shutdown：停止mysql服務器；用start可以启动

version：版本號與相關狀態信息顯示

start-slave：啟動復制，啟動從服務器復制線程，一般是启动兩個进程，SQL thread, IO thread

stop-slave：關閉復制線程
```



### mysqlbinlog

```shell
选项
--start-datetime
--stop-datetime
--start-position
--stop-position
# 如果不用選項會顯示全部內容

例：
mysqlbinlog mysql-bin.000005   
# 查看內容中有文件頭的內容，這是無論如何都會顯示的

mysqlbinlog --start-position=177 --stop-position=358 mysql-bin.000005 
# 查看位置從177到358

mysqlbinlog --start-datetime=’130425 15:14:39’ mysql-bin.000005     
# 查看某時開始的，沒有指定結束時間會顯示到文件尾部為止

mysqlbinlog --start-datetime=’130425 15:14:39’ mysql-bin.000005 > /root/a.sql    
# 將結果重定向到一個.sql文件中，之後可導入mysql執行一次，這就是即時點恢復
# 二進制日志的輪動除重啟服務器外還可以用FLUSH LOGS;来實現，這是在主服務器上，如果是從服務器就是中繼服務器才滾動
# 二進制日志文件不能手動刪除，會影響mysql服務器啟動。要用mysql命令

PURGE BINARY LOGS TO ‘mysql-bin.000003’;      
# 刪除000003以前的二進制文件

SHOW BINARY LOGS;       
# 查看現有的所有二進制文件
binlog_format            
# 二進制日制的格式，MIXED是混合模式
log_bin         
# 是否記錄二進制日志
```

