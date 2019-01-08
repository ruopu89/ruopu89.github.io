---
title: mysql备份与还原
date: 2018-09-17 14:08:03
tags: mysql备份
categories: MySQL
---

# 概念

> 備份：副本
>
> 如果在RAID1或RAID10上，是保證硬件損壞而不會業務中止，所以與mysql的備份無關，因其無法避免邏輯上的破壞
>
> * 備份類型：
>
>   比如文件有50G，我們用CP復制的是時間點不一致的數據文件，所以不可以。服務器停了再復制是可以的，但服務器是不能停的。
>
>   * 熱備份（在線備份）：讀寫不受影響
>   * 溫備份：能讀不能寫，僅可以執行讀操作
>   * 冷備份：離線備份，讀寫操作均不能進行
>
>
>
> * 物理備份和邏輯備份
>
>   * 物理備份：復制數據文件
>   * 邏輯備份：將數據導出至文本文件中
>
>   物理與邏輯備份可以热備、溫備或冷備份
>
>
>
> * 完全備份、增量備份和差異備份
>
>   * 完全備份：備份全部數據（可以是某個庫的某個單獨數據的全部備份）
>   * 增量備份：僅備份上次完全或增量備份以後變化的數據
>   * 差異備份：僅備份上次完全備份以來變化的數據
>
>   差異備份與增量備份的區別是，增量備份在備份時每次都是和前一次比較，備份那些不同的數據，而恢復時是先恢復完全備份再按時間點恢復每次的增量備份；差異備份是先完全備份，之後每天都和完全備份比較，備份那些增長的數據，在恢復時先恢復完全備份，再恢復最後一天的差異備份即可。差異備份的數據量要比增量備份的數據量大很多
>
>   備份策略是完全加差異或完全加增量。可使用物理或邏輯方式進行完全、增量或差異備份，可以自由組合
>
>   還原，最好經常測試還原數據功能。要有還原方案
>
> * 備份什麼？
>
> ​        數據、配置文件、日志（二進制日志、事務日志）
>
> * 熱備份
>
>   * MyISAM幾乎不可能熱備。可使用邏輯卷的快照備份，但最好是溫備份，以共享方式鎖定MyISAM中的所有表
>
>   * InnoDB：可以熱備不影響進程，但會影響服務器性能。有專門熱備工具：xtrabackup, mysqldump
>
>   可把Mysql做成從服務器，需要備份時把從服務器停下來備份，之後再啟動與主服務器同步
>
>   * 物理備份：速度快，不用再借助mysql服務器做任何事
>
>   * 邏輯備份：需要mysql服務器進程參與，速度慢，可能會丟失浮點數精度。可以方便使用文本處理工具直接對其處理、可移植性強
>
> * 備份策略：
>
>   * 完全+增量           
>
>   * 完全+差異
>
> * 選擇多長時間備份一次取決於兩點
>
>   1. 數據變化的頻度和變化量；
>
>   2. 能夠忍受的還原時長；完全備份是物理還是邏輯方式取決於我們自己的需要，增量備份使用哪種方式也一樣
>
> * mysql備份工具
>
>   * mysqldump：邏輯備份工具、MyISAM（溫）、InnoDB（熱備份）
>
>   * mysqlhotcopy：物理備份工具，是溫備工具實際是冷備份
>
> * 文件系統工具
>
>   * cp：只能冷備份
>
>   * lvm：借助邏輯卷的快照功能，可實現幾乎熱備
>
> ​       	mysql> FLUSH TABLES
>
> ​       	mysql> LOCK TABLES
>
> ​       	創建快照：釋放鎖，而後復制數據
>
> * 第三組工具
>
>   * ibbackup：商業工具
>
>   * xtrabackup：開源工具
>
> * mysqldump：邏輯備份
>
>   * mysqldump（完全備份）+ 二進制日志
>
>   * 完全 + 增量
>
> * 邏輯備份缺點
>   1. 可能使浮點數據丟失精度
>   2. 備份出的數據更佔用存儲空間，壓縮後可大大節省空間
>   3. 不適合對大數據庫做完全備份
>
> ​       
>
> * 對InnoDB做熱備，不建議用溫備份
>
>   就算執行了FLUSH TABLES WITH READ LOCK;，如果此時有其他執行程序的話，這個加鎖過程可能要等很長時間，就算鎖上了背後可能還有寫操作，mysql後台每隔一段時間會將事務日志中的數據同步到事務文件中，後台可能還在寫，這時要等待事務日志同步到數據文件中，用命令SHOW ENGINE INNODB STATUS;可查看InnoDB的存儲狀態，所以建議熱備。
>
>   MVCC多版本並發控制，如果事務隔離級別是REPEATABLE-READ時，這也是默認級別，--single-transaction會啟動一個大事務，直到我們完成備份，這樣意味著在整個讀取過程中我們讀取的數據都是一致的，就算有人改了，我們看到的也是原來的數據，這就是能做熱備的原因
>
>
>
> * 幾乎熱備：LVM
>
>   snapshot快照：LVM在熱備上是這樣提供技術手段的，我們可對邏輯卷創建快照，快照完成以後，在執行快照那一刻，以後所有變化的數據，通過快照路徑來訪問的話都不會改變的，所以快照的訪問路徑，就是讓數據停留在了過去快照創建的那一刻，任何此後改變了的數據，在改變之前，先把他們復制到快照上然後再改變原始數據所以我們通過快照去訪問的時候，訪問到的都是原始數據，這就是邏輯卷備份，我們在執行快照的那一刻，將整個數據庫鎖定，執行讀鎖，只要能施加上鎖，立即對數據所在的卷創建一個快照，接著並立即釋放那個鎖，而後我們通過快照卷將數據復制出來就能完成備份了。於是我們就有個前提：
>
>   1. 數據文件要在邏輯卷上
>   2. 此邏輯卷所在卷組必須有足夠空間使用快照卷，備份數據要放在快照卷上，快照卷主要是用來備份，備份後就沒用了，可以估計一下數據，如果數據備份要三小時，三小時的數據變化量是100M，我們創建一個500M的快照卷就可以了，如果超出快照卷大小，數據會崩潰的，所以我們要給出足夠的預估
>   3. 數據文件和事務日志要在同一個邏輯卷上（如果使用快照卷做備份的話事務日志與數據文件一定要在一個卷上，因為我們創建的快照，如果事務日志與數據文件不在同一個卷上，那我們就在給兩個卷各做一個快照，但兩個卷的時間點未必一致，事務日志的主要目的是為了向事務存儲引擎提供ACID功能的，如果時間點不一致的話，是不能拿來執行數據恢復的。事務日志結合數據文件一起完成數據管理，用戶的寫操作是先寫到事務日志中，再由事務日志一點點與數據文件同步。所以我們在創建快照時，我們執行的命令會鎖定所有表，其他用戶不能向這裡寫，但這不意味著數據文件與日志已經統一了，事務日志中的某些語句在後台仍在向數據文件中寫，如果我們把他們放在不同的卷上分別進行快照，快照的時間點有可能不一致，那事務日志就無法向數據文件同步數據。所以一定要放在同一個卷上。如果事務日志正在與數據文件同步，這時我們做一快照，這個快照的備份文件是可以用的，但mysql會做一個內部的修復，在mysql服務器看來這就是一個服務器發生崩潰需要還原的版本。同理，如果我們想執行那些未完成的操作繼續執行的話，還要依賴二進制日志。就算我們使用邏輯卷做了一次完全的物理備份，將來做即時點還原仍然依賴於二進制日志）這裏指的是InnoDB，不包括MyISAM



# mysqldump

## mysqldump备份恢复

```shell
备份
vim /etc/my.cnf.d/server.cnf
    [mysqld]
    log_bin = mysql_bin
#开启二进制日志
vim /root/.my.cnf
	[client]
    user = 'root'
    password = 'centos'
    host = 'localhost'
#实现免用户名密码登录
mysql -uroot -p < /root/jiaowu.sql
#将jiaowu.sql文件导入到数据库中
mysql
SHOW DATABASES;
#有jiaowu库了
SHOW BINARY LOGS;
#查看二进制日志位置
FLUSH TABLES WITH READ LOCK;
#再打开一个终端执行此命令，刷新表並且以只讀的方式鎖定所有表，這時再備分
mysqldump -uroot -p jiaowu > /tmp/jiaowu.sql
#导出jiaowu库
FLUSH LOGS;
UNLOCK TABLES;
#備份完成後立即釋放鎖
SHOW BINARY LOGS;
#查看二进制日志位置，只取滾動後新建的日志

恢复
DROP DATABASE jiaowu;
# 刪除jiaowu庫
CREATE DATABASE studb;
mysql studb < /tmp/jiaowu.sql
# 将数据库导入
```

## mysqldump命令选项

```shell
mysqldump -uroot -p jiaowu > /root/jiaowu-`date +%F-%H-%M-%S`.sql           
#備份
mysqldump -uroot -p --master-data=2 jiaowu > /root/jiaowu-`date +%F-%H-%M-%S`.sql
#用了第二條命令會在備份的文件中有CHANGE MASTER TO NASTER_LOG_FILE=`mysql-bin.000008, MASTER_LOG_POS=107`指明現在的日志名稱及位置
mysqldump -uroot -p --lock-all-tables --flush-logs --all-databases > /root/all.sql  
#因為不是所有庫都是InnoDB引擎的，所以要用--lock-all-tables選項，之後備份所有庫，還可以加上--master-data=2選項
mysqldump -uroot -p --lock-all-tables --flush-logs --all-databases --master-data=2 > /root/all.sql
less /root/all.sql         
#查看
=======================================================================================
mysqldump
    --master-data=n	    n={0、1、2}
        0表示不記錄二進制日志文件记录位置
        1表示以CHNAGER MASTER TO的方式記錄位置，可用於恢復後直接啟動從服務器
        2表示以CHNAGER MASTER TO的方式記錄位置，但默認被注釋了
    --lock-all-tables：備份前鎖定所有表
    --flush-logs：備份前鎖完表執行日志滾動             flush滾動
    #如果指定庫中的表類型均為InnoDB，可使用--single-transaction啟動熱備，這時就不用鎖定表了--lock-all-tables，這個過程可能很長
    * 備份多個庫
    --all-databases：備份所有庫
    --databases DB_NAME,DB_NAME,…：備份指定庫              
    #這兩個命令由於備份不只一個數據庫，所以會自動創建create databases命令，還原前就不用手動再指定庫了
    --events：備份事件
    --routines：備份存儲過程存儲函數
    --triggers：備份觸發器
```

## 備份及即時點還原

```shell
備份及即時點還原
備份策略：每周完全+每日增量
    完全備份：mysqldump
    增量備份：備份二進制日志文件（先flush logs）
    
步骤：
1. 做全量备份
2. 删除现有二进制日志之前的所有日志
3. 删除某表中的一些行，以便下面测试
4. 滚动日志
5. 复制滚动前二进制日志到其他路径或将滚动前二进制日志转为sql文件保存到其他目录，实现增量备份
6. 在删除了行的表中插入新行
7. 将滚动后的日志（也是现在的日志）复制到其他路径
8. 删除数据目录中的所有文件
9. 停止、启动服务器，实现数据初始
10. 修改root密码
11. 导入全量备份的sql文件
12. 导入增量备份的sql文件
13. 将最新的日志文件转为sql文件并导入，实现即时点还原。
14. 这里全量备份不存在对应的二进制日志，因为被删除了。删除后仅剩一个二进制日志，这个日志就是增量备份的日志。之后做其他操作后又滚动过一次日志，也就是最新的日志。这个过程涉及两个日志和一个全量备份的sql文件。

* 完全备份
mysqldump -uroot -p --master-data=2 --flush-logs --all-databases --lock-all-tables > /root/alldatabases.sql
mysql
#建議在刪除備份前的二進制日志前先將其備份一份，可能以後有用。
less /root/ alldatabases.sql
SHOW BINARY LOGS;
PURGE BINARY LOGS TO 'mysql_bin.000011'; 
#purge[pə:dʒ]：清除。刪除二進制文件，這是為了避免空間被佔滿，这是删除最后的mysql_bin.000011之前的所有二进制日志
use studb;
SELECT * FROM tutors;
DELETE FROM tutors WHERE Age>80;            
#刪除一些数据

* 下面做增量備份
mysql
FLUSH LOGS;         
#滾動
quit        
#退出mysql
cd /mydata/data              
#到數據目錄中
cp mysql-bin.000011 /root/          
#因之前已經滾動了日志，所以倒數第二個就是我們要增量備份的日志，將其拷貝到root目錄即可。
或
mysqlbinlog mysql-bin.000011 > /root/mon-incremental.sql           
#這種方式的增量備份更好一些
mysql
use studb;
INSERT INTO tutors (Tname) Values (‘stu123’);
退出
* 模擬刪除了數據庫，而不能刪二進制日志
cp mysql-bin.000012 /root           
#將二進制日志拷出去
rm -rf ./*        
#刪除數據目錄中的所有文件
service mysqld stop        
#現在無法停止mysql
killall mysqld              
#殺死mysql進程
cd /usr/local/mysql/            
#到此目錄初始化mysql
scripts/mysql_install_db --user=mysql --datadir=/mydata/data         
#初始化，这是编译安装的。如果是yum安装的可以直接启动，就会初始化
service mysqld start        
#啟動mysql
mysql
UPDATE mysql.user SET PASSWORD=PASSWORD('centos') WHERE User='root';
#设置root的密码。或执行mysql_secure_installation
mysql -uroot -p < alldatabases.sql            
#還原完全備份
mysql
mysql -uroot -p
use studb;
SELECT * FROM tutors;
退出             
#這一過程是為了驗證增量備份恢復後的變化
mysql -uroot -p < mon-incremental.sql          
#恢復增量備份
mysql -uroot -p         
#進入
use studb;
SELECT * FROM tutors;             
#查看證明有變化
退出
mysqlbinlog mysql-bin.000012 > temp.sql    
#把日志文件導出為.sql文件
mysql -uroot -p < temp.sql           
#即時點還原。
或
mysqlbinlog mysql-bin.000012 | mysql -uroot -p         
#這樣一條命令即可實現即時點還原
mysql -uroot -p
use studb;
SELECT * FROM tutors;
#上面這樣的試驗只適合在數據量小的時候，如果大的話，mysqldump備份會很慢。視頻中要求寫一個mysql完全備份腳本，增量備份寫成另一個腳本，盡量使用變量定義保存位置，使用日期保存備份的文件名稱。還可用腳本還原
```



# xtrabackup

## 完全备份与恢复

```shell
* 安装
wget https://www.percona.com/downloads/XtraBackup/Percona-XtraBackup-2.4.9/binary/redhat/7/x86_64/Percona-XtraBackup-2.4.9-ra467167cdd4-el7-x86_64-bundle.tar
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
* rpm包安装
	* CentOS6
yum install http://www.percona.com/downloads/percona-release/redhat/0.1-4/percona-release-0.1-4.noarch.rpm
yum list|grep percona
yum install percona-xtrabackup
	* CentOS7
yum install http://www.percona.com/downloads/percona-release/redhat/0.1-6/percona-release-0.1-6.noarch.rpm
yum list|grep percona
yum install percona-xtrabackup-24
#阿里云建议MySQL5.6及之前的版本需要安装 Percona XtraBackup 2.3。MySQL5.7版本需要安装 Percona XtraBackup 2.4。
#Percona XtraBackup 2.3地址：https://www.percona.com/doc/percona-xtrabackup/2.3/installation/yum_repo.html
#Percona XtraBackup 2.4地址：https://www.percona.com/doc/percona-xtrabackup/2.4/installation/yum_repo.html
========================================================
innobackupex --help
innobackupex --user=DBUSER --password=DBUSERPASS /path/to/BACKUP-DIR/(保存位置)
#完全備份。innobackupex是一個腳本，在裡面封裝了一些命令行工具，--user=DBUSER --password=DBUSERPASS是連接服務器要用的帳號密碼。服務器可指定，如--host=localhost，這裡被省略了，因為一般都是在本機上進行備份。/path/to/BACKUP-DIR/指要保存的位置。備份的用戶要有權限，如果要使用一個最小權限的用戶進行備份，則可基於如下命令創建此類用戶。可以創建一個專門備份的用戶，或用管理員也可以
========================================================
* 授权
mysql
MariaDB [(none)]> CREATE USER 'bkpuser'@'localhost' IDENTIFIED BY 'centos';
#创建用户
MariaDB [(none)]> REVOKE ALL PRIVILEGES,GRANT OPTION FROM 'bkpuser'@'localhost';
#取消用户所有权限与授权权限
MariaDB [(none)]> GRANT RELOAD,LOCK TABLES,REPLICATION CLIENT ON *.* TO 'bkpuser'@'localhost';
#只需要RELOAD, LOCK TABLES, REPLICATION CLIENT這三個權限就可備份了
MariaDB [(none)]> FLUSH PRIVILEGES;
MariaDB [(none)]> SHOW GRANTS;
#查看当前用户的授权。grant[grɑ:nt]：授权。
MariaDB [(none)]> SHOW GRANTS FOR bkpuser@localhost;
#查看指定用户的授权
* 备份
innobackupex --user=root /backup          
#備份數據庫，backup目录是自动创建的。因为在/root/.my.cnf文件中写明了用户名和密码，所以这里的密碼是空，所以省略了，服務器是本機。另外，備份時需要mysql服務器是啟動狀態。備份好後在/backup下有一個以當前時間命名的目錄。使用上面的bkpuser用户备份时会提示有授权问题，也就是缺少某些权限，待解决
cd /backup/2016-12-09_22-17-27           
# 目錄中的內容如下:
# jiaowu、mysql、test、mydb等是數據庫，ibdata1是表空間文件，backup-my.cnf是服務器的配置文件， 備份好以後可以看到備份好的文件中有一個xtrabackup_binlog_info文件，這是二進制日志信息的文件，可用cat打開，裏面是備份這一刻的二進制文件名與相應的號碼。xtrabackup_binary中有在備份時使用了哪個命令進行的備份的信息，視頻中顯示的是xtrabackup 55，测试时没有这个文件。xtrabackup_logfile文件是data數據文件，不能用cat打開；xtrabackup_checkpoints文件裡有備份類型及從哪個邏輯版本號開始的備份，其中to_lsn指的是InnoDB的每一個數據塊InnoDB存儲引擎的數據要存儲在磁盤上，它是存儲數據塊的，每一個數據塊都有一個日志序列號，InnoDB會在內部維持着當前每一數據塊的日志序列號，如果這個塊上的數據發生了改變，這個號碼會加1,下一次可以根據這個號碼做增量備份。如果某一個塊的號碼發生了改變，可以將某一個塊備份一下。這就是可以對InnoDB存儲引擎做增量備份的原因；這裏的信息顯示從0號開始，到1637454結束，下一次就從1637454開始
# 這些備份的數據備份完以後是不能直接恢復的，因為備份的數據中有些事務可能只提交了一半，為了避免mysql啟動的修復過程，我們要對備份出來的文件做一些准備工作，然後才能恢復。准備工作包括：
#    1.將已經提交的事務同步到數據文件，從日志文件同步到數據文件
#    2.將尚未提交的事務做回滾
#    用--apply-log選項可完成上面的兩項
# innobackupex --apply-log /backup/*****         
# 最後的路徑是我們備份的數據的路徑。這樣就會完成上面提到的兩項工作，不做這項工作的話恢復後mysql是啟動不了的
* 测试恢复
mysql
MariaDB [(none)]> use jiaowu
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu0005');
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu0006');
#插入两条数据
MariaDB [jiaowu]> FLUSH LOGS;
#做這步是因為備份當前使用的二進制日志會報錯，所以才滾動一次
cp /var/lib/mysql/mysql_bin.000003 /root
#复制滚动前的日志到其他路径，以备数据恢复时使用
systemctl stop mariadb
rm -rf /var/lib/mysql/*
innobackupex --copy-back /backup/2018-09-19_11-06-30
#恢复数据。/恢復時用--copy-back選項，這樣就可以了。這時的數據文件存儲位置（/var/lib/mysql/）一定要是空的，不然會報錯
cd /var/lib/mysql/
chown -R mysql.mysql /var/lib/mysql/
#修改数据目录中文件的属主属组为mysql
systemctl start mariadb
#启动报错，无法启动。提示：
#180919 11:51:48 mysqld_safe Starting mysqld daemon with databases from /var/lib/mysql
#180919 11:51:48 [Note] /usr/libexec/mysqld (mysqld 5.5.60-MariaDB) starting as process 8893 ..
#180919 11:51:49 InnoDB: The InnoDB memory heap is disabled
#180919 11:51:49 InnoDB: Mutexes and rw_locks use GCC atomic builtins
#180919 11:51:49 InnoDB: Compressed tables use zlib 1.2.7
#180919 11:51:49 InnoDB: Using Linux native AIO
#180919 11:51:49 InnoDB: Initializing buffer pool, size = 2.0G
#180919 11:51:50 InnoDB: Completed initialization of buffer pool
#180919 11:51:51 InnoDB: highest supported file format is Barracuda.
#InnoDB: No valid checkpoint found.
#InnoDB: If you are attempting downgrade from MySQL 5.7.9 or later,
#InnoDB: please refer to http://dev.mysql.com/doc/refman/5.5/en/upgrading-downgrading.html
#InnoDB: If this error appears when you are creating an InnoDB database,
#InnoDB: the problem may be that during an earlier attempt you managed
#InnoDB: to create the InnoDB data files, but log file creation failed.
#InnoDB: If that is the case, please refer to
#InnoDB: http://dev.mysql.com/doc/refman/5.5/en/error-creating-innodb.html
#180919 11:52:00 [ERROR] Plugin 'InnoDB' init function returned error.
#180919 11:52:00 [ERROR] Plugin 'InnoDB' registration as a STORAGE ENGINE failed.
#180919 11:52:00 [Note] Plugin 'FEEDBACK' is disabled.
#180919 11:52:00 [ERROR] Unknown/unsupported storage engine: InnoDB
#180919 11:52:00 [ERROR] Aborting
vim /etc/my.cnf
	[mysqld]
	innodb_force_recovery=6
	log_bin = mysql_bin
#加入上面一行后，就可以启动了。启动后可以取消这个选项。也可能是没有开启二进制日志的原因，所以可以加入log_bin = mysql_bin。测试发现，加入开启二进制日志后，就不需要innodb_force_recovery选项了，另外，使用innodb_force_recovery启动后，进入数据库是不能操作的，需要将innodb_force_recovery注释后，再重启才能操作。
#innodb_force_recovery可以设置为1-6,大的数字包含前面所有数字的影响。
#1. (SRV_FORCE_IGNORE_CORRUPT):忽略检查到的corrupt页。
#2. (SRV_FORCE_NO_BACKGROUND):阻止主线程的运行，如主线程需要执行full purge操作，会导致crash。
#3. (SRV_FORCE_NO_TRX_UNDO):不执行事务回滚操作。
#4. (SRV_FORCE_NO_IBUF_MERGE):不执行插入缓冲的合并操作。
#5. (SRV_FORCE_NO_UNDO_LOG_SCAN):不查看重做日志，InnoDB存储引擎会将未提交的事务视为已提交。
#6. (SRV_FORCE_NO_LOG_REDO):不执行前滚的操作。
#参考：https://www.jb51.net/article/66951.htm
mysql
MariaDB [jiaowu]> SHOW DATABASES;
MariaDB [jiaowu]> USE jiaowu;
MariaDB [jiaowu]> SELECT * FROM tutors;
#這時是沒有後來加的00006和000005的，要把剛才備份的二進制日志導入即可
mysqlbinlog /root/mysql-bin.000003 > /tmp/abc.sql
mysql
MariaDB [jiaowu]> SET sql_log_bin=0;
#临时关闭二进制日志
MariaDB [jiaowu]> SOURCE /tmp/abc.sql;
#导入滚动后的二进制日志生成的sql文件，因为stu00005和00006是在完全备份后加入的
MariaDB [jiaowu]> SET sql_log_bin=1;
#开启二进制日志
MariaDB [jiaowu]> USE jiaowu;
MariaDB [jiaowu]> SELECT * FROM tutors;
#现在有刚加入的00006和000005的信息了
```

## 增量备份

xtrabackup支持對innodb做增量備份，對MyISAM不支持，對MyISAM如果有就做完全備份；MyISAM適合讀多寫少的情況

```shell
mysql
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu0007');
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu0008');
#加入两条数据
innobackupex --user=root /backup    
#恢復過一次後必須再重新做一次完全備份，因爲當前的數據庫沒有完全備份
mysql
MariaDB [jiaowu]> use jiaowu
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu0009');
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu00010');
innobackupex --incremental /backup --incremental-basedir=/backup/2018-09-19_16-04-31/
#先要指定增量備份的保存位置/backup，--incremental-basedir是指定完全備份的保存位置，它會針對完全備份以後的數據做備份，備份後保存在/backup目錄下。這是第一次增量備份。如果是再一次增量備份時，--incremental-basedir應該指向上一次的增量備份所在的目錄；如果數據庫再次損壞且沒有數據增長，用完全和增量備份就能恢復，如果有數據增長就要再加上二進制日志才能恢復。
mysql
use jiaowu
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu00011');
MariaDB [jiaowu]> INSERT INTO tutors (Tname) VALUES ('stu00012');
innobackupex --incremental /backup --incremental-basedir=/backup/2018-09-19_16-05-33/
#最後指定的是上一次的增量備份位置,2018-09-19_16-05-33是上一次備份後的目錄。如果之前未做過增量備份，就要指向完全備份
innobackupex --apply-log --redo-only /backup/2018-09-19_16-04-34/
#/如果有增量備份，這裡一定要指定--redo-only選項；2018-09-19_16-04-34是第一次完全備份；有增量備份的時候我們在實現提交的情況時，只執行redo不要執行endo。这里一定要用--apply-log选项，实现1.將已經提交的事務同步到數據文件，從日志文件同步到數據文件；2.將尚未提交的事務做回滾。不然下面的命令是不能执行的。
innobackupex --apply-log --redo-only /backup/2018-09-19_16-04-34/ --incremental-dir=/backup/2018-09-19_16-05-33/
#在准備第一次增量備份時要將完全備份寫在前面，還要將增量備份位置寫在最後，用--incremental-dir選項。这是将第一次增量备份合并到完全备份
innobackupex --apply-log --redo-only /backup/2018-09-19_16-04-34/ --incremental-dir=/backup/2018-09-19_16-06-15
#這是第二次增量備份，還是前面寫完全備份位置，後面是第二次增量備份的位置
#之後的還原只需要還原完全備份即可，因為此時所有的提交操作都已合並到完全備份上去了，所以在還原時兩個增量備份就用不上了
systemctl stop mariadb
rm -rf /var/lib/mysql/*
innobackupex --copy-back /backup/2018-09-19_16-04-34/
chown -R mysql.mysql /var/lib/mysql/
systemctl start mariadb
mysql
MariaDB [jiaowu]> use jiaowu
MariaDB [jiaowu]> SELECT * FROM tutors;
#这里有上面插入的所有数据
```

## 導入或導出單張表，前提是每表一個表空間才可以

&emsp;&emsp;默認情況下，InnoDB表不能通過直接復制表文件的方式在mysql服務器之間進行移植，即便使用了innodb_file_per_table選項。而使用xtrabackup工具可以實現此種功能，不過，此時需要導出表的mysql服務器啟用了innodb_file_per_table選項（嚴格來說，是要導出的表在其創建之前，mysql服務器就啟用了innodb_file_per_table選項），並且導入表的服務器同時啟用了innodb_file_per_table和innodb_expand_import選項

1. 導出表

導出表是在備份的prepare階段進行的，因此，一旦完全備份完成，就可以在prepare過程中通過--export選項將某表導出了：

```shell
innobackupex --apply-log --export /path/to/backup
#此命令會為每個innodb表的表空間創建一個以.exp結尾的文件，這些以.exp結尾的文件則可以用於導入至其它服務器。
```

2. 導入表

要在mysql服務器上導入來自於其它服務器的某innodb表，需要先在當前服務器上創建一個跟原表表結構一致的表，而後才能實現將表導入

```shell
mysql>CREATE TABLE mytable (…) ENGINE=InnoDB;
```

然後將此表的表空間刪除

```shell
mysql>ALTER TABLE mydatabase.mytable DISCARD TABLESPACE;
```

接下來，將來自於導出表的服務器的mytable表的mytable.ibd和mytable.exp文件復制到當前服務器的數據目錄，然後使用如下命令將其導入

```shell
mysql> ALTER TABLE mydatabase.mytable IMPORT TABLESPACE;
```











