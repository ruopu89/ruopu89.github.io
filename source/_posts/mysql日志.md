---
title: mysql日志
date: 2019-01-04 15:36:41
tags: mysql日志
categories: MySQL
---

### 概念

#### 錯誤日志

> * 錯誤日志記錄內容
>   1. 服務器啟動和關閉過程中的信息
>   2. 服務器運行過程中的錯誤信息
>   3. 事件調度器運行一個事件時產生的信息
>   4. 在從服務器上啟動從服務器進程時產生的信息
>
> 默認mysql不啟用任何日志功能，一般啟動錯誤日志，默認放在數據目錄中，以當前主機名加.err為後綴名的文件；log_error
>
> log_warnings警告信息日志，是否把警告信息記入錯誤日志，服務器上默認是記入的（0是不記，1是記）；mysql中的文件操作要在重啟服務器後生效，我們要把改變內容寫入配置文件。这里的log_warnings改变没有关系



### 一般查詢日志

```shell
# 一般關閉，記錄每條查詢會產生大量IO

general_log               
# 表示是否啟用查詢日志

general_log_file        
# 日志記錄位置，默認是數據目錄下本機名稱加.log。

log                              
# 與查詢日志相關，但在5.6中已廢棄。是否啟用記錄所有語句的日志信息於一般查詢日志中，默認是OFF

mysql可以將一般查詢日志保存在表中，只是這個表需要手工創建。啟用此功能還需要啟用log_output，默認輸出是FILE，也可以是TABLE，或是NONE不記錄，這項會控制上面的兩項及其他日志選項。這裡的FILE和TABLE可以同時指定，用逗號隔開即可
```



### 慢查詢日志

```shell
# 慢查詢日志，一般啟用，超過正常查詢的都算慢查詢

long_query_time      
# 超過此項定義時間的查詢就是慢查詢。這裡的語句執行時長為實際的執行時間，而非在CPU上的執行時長。因此，負載較重的服務器上更容易產生慢查詢。其最小值為0，默認值是10，單位是秒。也支持毫秒級的解析度，作用範圍為全局或會話級別，可用於配置文件，屬動態變量

log_slow_queries={YES|NO}      
# 是否記錄慢查詢。默认是OFF

slow_query_log={ON|OFF}         
# 設定是否啟用慢查詢日志，0或OFF表示禁用，1或ON表示啟用。日志信息的輸出位置取決於log_output變量的定義，如果其值為NONE，則即便slow_query_log為ON，也不會記錄任何慢查詢信息。作用範圍為全局級別，可用於選項文件，屬動態變量

slow_query_log_file 
# 日志保存位置

set global slow_query_log=1              
# 開啓慢查日志
# 操作函數開關的可以當時生效，如果是文件就要重啓服務了。
```



### 二進制日志

```shell
# 二進制日志，二進制格式，任何引起或可能引起數據庫變化的操作信息都記錄，用於實現mysql復制以及即時點恢復的重要依據。mysql的復制功能就是從服務器不停地從主服務器上把它的二進制日志裡產生的任何操作，它把每個操作通過mysql客戶端、服務器端的每一個操作都讀取過來一份並保存在本地的某個日志中，而後由本地的某一個服務器的mysql線程和IO線程每一次從這個本地文件日志中讀取一行並在本地的服務器上操作一次，其中的某一個線程把日志中的內容讀取出來並在本地執行一次，使兩個數據庫一致，這就是復制。
# 本地保存此內容的日志叫中繼日志，中繼日志的格式與二進制的格式一樣，只不過作用並不完全一致，因為中斷日志只是要讓本地服務器執行一次的日志文件。

* mysqlbinlog              
# 用此命令查詢此日志文件。mysqlbinlog的工作很獨特，這一般位於我們的數據目錄中，而且以mysql-bin開頭或以當前主機名開頭。mysql服務器每重啟一次，它都會滾動一次，因為要記錄任何數據庫改變的操作。重放可以生成一模一樣的數據庫在多個位置，它是復制與即時點恢復的重要憑據。在日志文件增長到一定程度就會生成一個新的日志文件，不會讓此文件無限增長的，這就是輪動。不要將此日志與數據庫放在一個磁盤上，這可以在數據丟失時進行重放，指定從某個時間進行還原，這就是即時點恢復
# 二進制日志的記錄格式可以是基於語句statement也可基於行row，還有混合方式mixed，由服務器選擇基於語句還是行。
# 二進制日志事件，可以是基於行的，也可能是基於語句的，而每一個事件在記錄時的格式是1、事件產生時間；2、每個事件在日志中有一個相對位置。日志文件中有一個文件頭，一般要佔107個字節，記錄日志產生的信息，之後就是事件的內容了，每個事件有一個相對的位置叫position，起始時間starttime，恢復時可指定事件開始時間或位置與結束時間或位置定位。名字一般是mysql-bin.00001之後以此類推，老的文件名是不會改變的
# 二進制日志文件組成有索引文件與二進制日志文件，啟動此功能就會有二進制日志文件，mysql-bin.index是索引文件，記錄了已產生的二進制日志文件名，在其中有指針記錄開始與結束文件，結束文件一般是當前使用的。用命令SHOW MASTER STATUS;可查看當前使用的文件，在結果顯示中的Position表示上次事件結束的位置。使用命令SHOW BINLOG EVENTS IN 'mysql-bin.000005';可查看二進制文件中記錄的信息，或SHOW BINLOG EVENTS IN 'mysql-bin.000005' FROM 107;指定從哪個位置開始顯示

* 二進制日志相關的幾個選項
innodb_support_xa={TRUE|FLASE}              
# 定義innodb是否支持分布式事務。存儲引擎事務在存儲引擎內部被賦予了ACID屬性，分布式（XA）事務是一種高層次的事務，它能將InnoDB分爲兩段式提交，它利用“准備”然後“提交”（prepare-then-commit）；現在的存儲引擎都應支持此項功能，建議啓用起來
# 兩段式的方式將ACID屬性擴展到存儲引擎外部，甚至是數據庫外部，然而，“准備”階段會導致額外的磁盤刷寫操作，XA需要事務協調員，它會通知所有的參與者准備提交事務（階段1），當協調員從所有參與者那裡收到“就緒”信息時，它會指示所有參與者進行真正的“提交”操作。
# 此變量正是用於定義InnoDB是否支持兩段式提交的分布式事務，默認為啟用。事實上，所有啟用了二進制日志的並支持多個線程同時向二進制日志寫入數據的Mysql服務器都需要啟用分佈式事務，否則，多個線程對二進制日誌的寫入操作可能會以與次序不同的方式完成，這將會在基於二進制日誌的恢復操作中或者是從服務器上創建出不同原始數據的結果，因此，除了僅有一個線程可以改變數據以外的其它應用場景都不應該禁用此功能。而在僅有一個線程可以修改數據的應用中，禁用此功能是安全的並可以提升InnoDB表的性能。作用範圍為全局和會話級別，可用於選項文件，屬動態變量。

sync_binlog=#
# 設定多久同步一次二進制日志至磁盤文件中，0表示不同步，任何正數值都表示對二進制每多少次寫操作之後同步一次。當autocommit的值為1時，每條語句的執行都會引起二進制日志同步，否則，每個事務的提交會引起二進制日志同步。一般建議把此項設為1。這樣可使我們在備份時不會有那些正在寫入的事務。打開此項會使二進制日志在寫入的時候以安全的方式進行。FLUSH LOGS執行後會打開一個新的二進制日志執行寫操作，但上面的方法更好一些
```



### 事务日志

```shell
事務日志是保證給事務提供原子性、一致性的一個重要依據，它能實現將隨機IO轉換為順序IO從而提高性能，並能夠保證事務提交以後不會丟失。只有事務性引擎才會用到事務日志，如InnoDB
mysql靠各種服務器變量或服務器啟動的參數來定義各類日志是否啟用， 以及如何啟用，日志文件是什麼。另外事務日志有一個日志組，裡面至少有兩個日志輪替使用
```



### 与日志相关的变量

```shell
SHOW GLOBAL VARIABLES LIKE '%LOG%';

binlog_cache_size          
# 二進制日志緩存大小，大小取決於下面這條

binlog_stmt_cache_size        
# 與事務相關的二進制日志緩存大小，這兩條取決於binlog_stmt_cache_size的大小而改變，我們只關心這條即可，建議不要調太大，這會加大丟失量
# async異步：先在內存中寫，過一會兒再一並寫入磁盤
# sync同步：每次操作在內存中完成後直接寫入磁盤，這會使性能降低
# 最好是引入異步方式，並提供緩存，寫操作在內存中完成並當作緩存，到一定量再同步到磁盤；可以是按時間，如每一秒與磁盤同步一次；也可以是按語句，如10條語句同步一次；還可以是按事務存儲引擎，只要提交就同步一次。

log_bin         
# 是否啟用二進制日志，與指定文件位置有關

sql_ log_bin={ON|OFF}  
# 是否真正使用二進制日志取決於此條。用於控制二進制日志信息是否記錄進日志文件，默認為ON，表示啟用記錄功能。用戶可以在會話級別修改此變量的值，但用户必須具有SUPER權限，作用範圍為全局和會話級別，屬動態變量。

sql_log_off={ON|OFF} 
# 用於控制是否禁止將一般查詢日志類信息記錄進查詢日志文件，默認為OFF，表示不禁止記錄功能。用戶可以在會話級別修改此變量的值，但用户必須具有SUPER權限。作用範圍為全局和會話級別，屬動態變量。與二進制日志無關



max_binlog_cache_size                            
max_binlog_stmt_cache_size            
# 這兩個值一般不用修改，這是控制上限的。最終緩存大小還是取決於binlog_stmt_cache_size

expire_logs_days            
# 日志的過期天數
# innodb_file_per_table的值為ON就會給每個表創建一個表空間了，這就可以使用innodb的一些高級功能了。
# 中繼日志:從主服務器的二進制日志文件中復制而來的事件，並保存的日志文件。這是從服務器上的信息。
# 因爲二進制日志文件只有一個，所以二進制日志文件所在磁盤性能越好，IO能力越強，服務器的整體性能越強。如用一堆SSD盤作RAID。mysql為提高性能會盡可能提高並發能力，如有多個CPU就可以同時多線程操作，但寫入二進制日志文件時，因為日志文件只有一個，故需要此日志文件所在磁盤IO能力更強
# IOPS：IO設備每秒執行的IO操作數
# 事務日志是確保事務安全性的重要工具。事務性存儲引擎用於保證原子性、一致性、隔離性和持久性

innodb_flush_log_at_trx_commit        
# flush_log的行為，flush_log就是將內存中的日志事件同步到日志文件中的行為。日志文件到磁盤的同步是mysql後台線程自動進行的。這裡的1表示每當有事務提交或每隔1秒都會向磁盤寫一次。2表示每事務提交才同步；0表示每秒同步一次並執行磁盤flush操作（flush操作指告訴內核不在內核中緩存直接寫到磁盤上去）；1表示每事務同步，並執行磁盤flush操作；2表示每事務同步，但不執行磁盤flush操作。

innodb_log_buffer_size         
# 內存緩存大小

innodb_log_file_size              
# 日志文件大小，估計一下五分鍾會產生多少事務操作，有多大數據量，然後給它一個值即可

innodb_log_files_in_group           
# 事務日志組有幾個文件，默認是兩個，一個寫滿就寫另一個，寫滿的將數據同步到磁盤

innodb_log_group_home_dir             
# 日志組所在目錄，叫ib_logfile*，建議給事務日志做一個鏡像。在不同的磁盤上

innodb_mirrored_log_groups             
# 是否給日志組做鏡像
```



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

