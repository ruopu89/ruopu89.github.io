---
title: mysql命令
date: 2019-01-04 00:14:03
tags: mysql命令
categories: MySQL
---

### SHOW 显示

```shell
mysql> SHOW ENGINES;
# 顯示當前數據庫上的所有存儲引擎

mysql> SHOW TABLE STATUS FROM mysql LIKE 'user'\G
*************************** 1. row ***************************
           Name: user
         Engine: MyISAM
        Version: 10
     Row_format: Dynamic
           Rows: 2
 Avg_row_length: 138
    Data_length: 644
Max_data_length: 281474976710655
   Index_length: 2048
      Data_free: 368
 Auto_increment: NULL
    Create_time: 2019-01-03 23:19:23
    Update_time: 2019-01-04 00:02:36
     Check_time: NULL
      Collation: utf8_bin
       Checksum: NULL
 Create_options: 
        Comment: Users and global privileges
1 row in set (0.00 sec)
# 查看表的狀態信息

mysql> SHOW CHARACTER SET;
+----------+-----------------------------+---------------------+--------+
| Charset  | Description                 | Default collation   | Maxlen |
+----------+-----------------------------+---------------------+--------+
| big5     | Big5 Traditional Chinese    | big5_chinese_ci     |      2 |
| dec8     | DEC West European           | dec8_swedish_ci     |      1 |
# 顯示支持的字符集

mysql> SHOW COLLATION;
+--------------------------+----------+-----+---------+----------+---------+
| Collation                | Charset  | Id  | Default | Compiled | Sortlen |
+--------------------------+----------+-----+---------+----------+---------+
| big5_chinese_ci          | big5     |   1 | Yes     | Yes      |       1 |
| big5_bin                 | big5     |  84 |         | Yes      |       1 |
# 顯示字符集排序規則，同一個字符集可能有多個不同的排序規則。如果不指定排序規則，字段從表繼承，表從庫繼承，庫從服務器繼承

mysql> SHOW GLOBAL VARIABLES LIKE ''\G
# 显示所有变量

mysql> SHOW GLOBAL VARIABLES LIKE '%iso%';
+---------------+-----------------+
| Variable_name | Value           |
+---------------+-----------------+
| tx_isolation  | REPEATABLE-READ |
+---------------+-----------------+
1 row in set (0.00 sec)
# 查看隔离级别的变量
```



### CREATE 创建

```shell
mysql> CREATE DATABASE test;
Query OK, 1 row affected (0.00 sec)
# 创建库
mysql> CREATE TABLE test.test(ID INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,Name CHAR(20));
Query OK, 0 rows affected (0.01 sec)
# 创建表。定義為AUTO_INCREMENT時必須是整型，非空，無符號，一定要創建主鍵或唯一鍵索引；AUTO_INCREMENT表示自動增長。PRIMARY KEY表示主鍵
```

