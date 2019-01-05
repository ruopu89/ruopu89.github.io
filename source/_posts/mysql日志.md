---
title: mysql日志
date: 2019-01-04 15:36:41
tags: mysql日志
categories: MySQL
---

### 查看

```shell
# 存放在同一塊磁盤上会使性能降低，更因為數據安全的原因，建議分開存放

语法
SHOW BINARY LOGS;
# 查看當前服務器能識別的二進制日志有哪些

SHOW MASTER STATUS;    
# 查看當前使用的二進制日志

SHOW BINLOG EVENTS IN '二進制日志文件' [FROM 'position'];
# 查看某個文件中的事件

PURGE BINARY LOGS TO '日志文件';
# 清除某個日志之前的日志

FLUSH LOGS;   
# 手動滾動二進制日志文件
```



### 启动二进制日志功能

```shell
[root@test ~]# systemctl stop mysql
[root@test ~]# vim /etc/my.cnf
[mysqld]
log_bin = mysql_bin
# 加入此项
[root@test ~]# systemctl start mysql
[root@test ~]# mysql
mysql> SHOW GLOBAL VARIABLES LIKE 'sql_log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| sql_log_bin   | ON    |
+---------------+-------+
# 如果此项为ON，表示开启了二进制日志
mysql> SHOW BINARY LOGS;
+------------------+-----------+
| Log_name         | File_size |
+------------------+-----------+
| mysql_bin.000001 |       120 |
+------------------+-----------+

[[root@test ~]# mysqlbinlog /var/lib/mysql/mysql_bin.000001
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=1*/;
/*!40019 SET @@session.max_insert_delayed_threads=0*/;
/*!50003 SET @OLD_COMPLETION_TYPE=@@COMPLETION_TYPE,COMPLETION_TYPE=0*/;
DELIMITER /*!*/;
# at 4
#190104 15:41:52 server id 1  end_log_pos 120 CRC32 0x2b1c1f39  Start: binlog v 4, server v 5.6.42-log created 190104 15:41:52 at startup
ROLLBACK/*!*/;
BINLOG '
QA4vXA8BAAAAdAAAAHgAAAAAAAQANS42LjQyLWxvZwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAABADi9cEzgNAAgAEgAEBAQEEgAAXAAEGggAAAAICAgCAAAACgoKGRkAATkf
HCs=
'/*!*/;
# at 120
#190104 15:52:41 server id 1  end_log_pos 167 CRC32 0x7f00ec56  Rotate to mysql_bin.000002  pos: 4
DELIMITER ;
# End of log file
ROLLBACK /* added by mysqlbinlog */;
/*!50003 SET COMPLETION_TYPE=@OLD_COMPLETION_TYPE*/;
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=0*/;
# /var/lib/mysql是数据库的路径

[root@test ~]# mysqlbinlog --start-position=120 --stop-position=167 /var/lib/mysql/mysql_bin.000001
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=1*/;
/*!40019 SET @@session.max_insert_delayed_threads=0*/;
/*!50003 SET @OLD_COMPLETION_TYPE=@@COMPLETION_TYPE,COMPLETION_TYPE=0*/;
DELIMITER /*!*/;
# at 4
#190104 15:41:52 server id 1  end_log_pos 120 CRC32 0x2b1c1f39  Start: binlog v 4, server v 5.6.42-log created 190104 15:41:52 at startup
ROLLBACK/*!*/;
BINLOG '
QA4vXA8BAAAAdAAAAHgAAAAAAAQANS42LjQyLWxvZwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAABADi9cEzgNAAgAEgAEBAQEEgAAXAAEGggAAAAICAgCAAAACgoKGRkAATkf
HCs=
'/*!*/;
# at 120
#190104 15:52:41 server id 1  end_log_pos 167 CRC32 0x7f00ec56  Rotate to mysql_bin.000002  pos: 4
DELIMITER ;
# End of log file
ROLLBACK /* added by mysqlbinlog */;
/*!50003 SET COMPLETION_TYPE=@OLD_COMPLETION_TYPE*/;
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=0*/;
# 查看位置從120到167
[root@test ~]# mysqlbinlog --start-datetime='2019-01-04 15:41:52' /var/lib/mysql/mysql_bin.000001
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=1*/;
/*!40019 SET @@session.max_insert_delayed_threads=0*/;
/*!50003 SET @OLD_COMPLETION_TYPE=@@COMPLETION_TYPE,COMPLETION_TYPE=0*/;
DELIMITER /*!*/;
# at 4
#190104 15:41:52 server id 1  end_log_pos 120 CRC32 0x2b1c1f39  Start: binlog v 4, server v 5.6.42-log created 190104 15:41:52 at startup
ROLLBACK/*!*/;
BINLOG '
QA4vXA8BAAAAdAAAAHgAAAAAAAQANS42LjQyLWxvZwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAABADi9cEzgNAAgAEgAEBAQEEgAAXAAEGggAAAAICAgCAAAACgoKGRkAATkf
HCs=
'/*!*/;
# at 120
#190104 15:52:41 server id 1  end_log_pos 167 CRC32 0x7f00ec56  Rotate to mysql_bin.000002  pos: 4
DELIMITER ;
# End of log file
ROLLBACK /* added by mysqlbinlog */;
/*!50003 SET COMPLETION_TYPE=@OLD_COMPLETION_TYPE*/;
/*!50530 SET @@SESSION.PSEUDO_SLAVE_MODE=0*/;
# 命令中的日期一定要使用****-**-**这样的格式，不然会报错："Incorrect date and time argument"，日期和时间参数不正确。

[root@test ~]# mysqlbinlog --start-datetime='2019-01-04 15:41:52' /var/lib/mysql/mysql_bin.000001 > abc.sql
# 將結果重定向到一個.sql文件中，之後可導入mysql執行一次，這就是即時點恢復

* 二進制日志的輪動除重啟服務器外還可以用FLUSH LOGS;来實現，這是在主服務器上，如果是從服務器就是中繼服務器才滾動
* 二進制日志文件不能手動刪除，會影響mysql服務器啟動。要用mysql命令

mysql> PURGE BINARY LOGS TO 'mysql_bin.000002';
# 刪除000002以前的二進制文件。
```

