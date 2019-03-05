---
title: mysql锁与事物
date: 2019-01-06 21:12:19
tags: mysql锁与事物
categories: MySQL
---

### 锁

> mysql一般會自動加鎖；最簡單的並發控制機制就是加鎖。鎖粒度從大到小，mysql僅支持表級鎖，行鎖需要由存儲引擎完成，一般不用在服務器上加鎖
>
> * 讀鎖：同一個文件可以被多個用戶讀取。這是共享鎖
>
> * 寫鎖：獨佔鎖，可以多人讀，但不允許寫；一個文件在寫時，不允許其他人讀與寫
>
> * 表鎖：鎖定一張表
>
> * 頁鎖：鎖定數據塊的，一個塊內有多行
>
> * 行鎖：

```shell
MariaDB [mysql]> use jiaowu
MariaDB [jiaowu]> LOCK TABLES tutors read;
# 给tutors表施加读锁
* 再打开一个终端
MariaDB [jiaowu]> INSERT INTO tutors (Tname,Gender,Age) VALUES ('jerry','M',50);
# 这时控制台会停住，因为表有读锁。如果換一臺主機连接数据库，插入数据会提示"Table 'tutors' was locked with a READ lock and can't be updated"
* 回到加锁的终端
MariaDB [jiaowu]> UNLOCK tables;
# 去除锁。这时会马上插入数据
```



### 事物

> 事務指多項操作要作爲一個處理單元來進行對待。它們要麼同時執行，要麼同時不執行。這需要大量CPU與IO操作。能啓動事務的是sql語句或ODBC中的一堆指令。多事務同時執行，彼此之間以互不影響的方式進行並發，事務之間交互，通過數據集。
>
> 如果一個存儲引擎是滿足事務的，要滿足ACID的測試
>
> RDBMS：要滿足四種ACID測試，叫ACID(原子發Automicity、一致性Consistency、隔離性Isolation、持久性Durability)
>
> MYISAM不支持事務，INNODB支持
>
> * Automicity原子性：事務所引起的數據庫操作，要麼都完成，要麼都不執行
>
> * Consistency一致性：當事務執行完成後總和是一致的，如銀行轉帳，這與隔離性有關，要在隔離中執行
>
> * Isolation隔離性：通過事務調度來實現，彼此之間以互不影響的方式進行並發，或事務之間影響降到最小
>
> * Durability持久性：一旦事務成功完成，不能再發生變化，系統必須保證任何故障都不會引起事務表現出不一致性
>
> 1. 事務提交之前就已經寫出數據至持久性存儲
>
> 2. 結合事務日志完成，事務日志產生的是順序IO，數據文件是隨機IO
>
> * 事務的狀態
>
>   * 活動的：active
>
>   * 部分提交的：最後一條語句執行後
>
>   * 失敗的：提交未完成
>
>   * 中止的：沒提交
>
>   * 提交的：完成的
>
> 事務提交就無法撤銷。狀態的轉換是一個事務從活動狀態到部分提交狀態或失敗狀態，部分提交到提交狀態，如果是未完成就到失敗狀態，失敗再到终止
>
> * 活动 --> 部分提交 --> 提交
>
> * 活动 --> 部分提交 --> 失败 --> 终止
>
> * 活动 --> 失败 --> 终止
>
> 事務：並發執行
>
> * 提高吞吐量和資源利用率
>
> * 減少等待時間
>
> 事務調度
>
> * 可恢復調度
>
> * 無級聯調度
>
> 並發控制依賴的技術手段
>
> * 鎖
> * 時間戳：記錄每個事務的啓動時間，執行時間
> * 多版本和快照隔離
>
>
>
> #### 事務日志
>
> 事務日志，對mysql很重要，mysql每一次操作都先在日志操作中完成，過一段時間才寫到磁般文件中。mysql中支持事務的引擎每次操作都是先在日志中完成，也就是增刪查改功能要先在內存中完成，完成後會立即寫到日志中去，過一段時間才寫到磁盤空間中去或叫磁盤文件中去，是將事務日志的查詢再在文件上走一遍，所以在事務引擎上的寫操作幾乎每次都要執行兩遍，日志中一次，數據文件中一次，寫在日志中非常快，因爲日志中記錄的只是操作，而不是操作數據本身，日志中記錄的是操作過程，所以操作過程可以在數據上重新執行一遍，所以叫redo。事務提交了就是完成了。服務器啓動時要讀日志，將未同步但已提交的事務同步到數據文件中去。這就是修復過程。如果在崩潰時還沒有提交事務，那麼此事務中的前幾條操作要撤消。日志文件通常不要太大，事務越小越好。日志文件不能只有一個，有兩個，第一個寫滿寫每二個，寫第二個時將第一個提交，這兩個文件組成了日志組。磁盤壞了，爲了保證事務不丟失，不可將事務日志與磁盤放在一起。這些日志就是爲了提供ACID功能的兼容性的。在mysql中叫事務日志，它自我能完成重做、撤消與自我修復
>
>
>
> 事務日志：
>
> * 重做日志redo log：每一個操作在真正寫到數據庫之前，它先被寫到日志裏，下一次這個操作就算崩潰了，它可以根據重做日志再走一遍；這意味着我們的一系列操作可以無限次地根據這個日志重復地執行N遍
>
> * 撤消日志 undo log：我們的每一次操作在操作以前，要把它的原有狀態保留下來。萬一要還原原來狀態時，可以撤消此次所做的任何一次操作
>
>
>
> #### 隔離級別
>
> * READ-UNCOMMITTED ：讀未提交，隔離級別最低；別人的操作馬上能看到，幹擾最大
>
> * READ-COMMITTED ：讀提交；別人提交後才能看到。也有問題
>
> * REPATABLE-READ ：可重讀，無論是否提交看到的都是一樣的，直到提交。會產生幻讀              
>
> * SERIALIZABLE ：可串行。可解決幻讀。
>
>  隔離級別越高並發能力越差。mysql默認是可重讀，可適當降低mysql隔離級別，這會提高mysql性能，如果對並發能力要求不高的情況下，用SHOW GLOBAL VARIABLES LIKE ‘%iso%’可查看隔離級別。

```shell
MariaDB [jiaowu]> START TRANSACTION;
# 啟動事務
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   2 | HuangYaoshi  | M      |   63 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   8 | HuYidao      | M      |   42 |
|   9 | NingZhongze  | F      |   49 |
|  10 | jerry        | M      |   50 |
+-----+--------------+--------+------+
MariaDB [jiaowu]> DELETE FROM tutors WHERE Tname LIKE 'Hu%'; 
Query OK, 2 rows affected (0.00 sec)
# 刪除以Hu開頭的兩行
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
|  10 | jerry        | M      |   50 |
+-----+--------------+--------+------+
MariaDB [jiaowu]> ROLLBACK;
# 事務回滾
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   2 | HuangYaoshi  | M      |   63 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   8 | HuYidao      | M      |   42 |
|   9 | NingZhongze  | F      |   49 |
|  10 | jerry        | M      |   50 |
+-----+--------------+--------+------+
# 被刪除的行被恢復
MariaDB [jiaowu]> DELETE FROM tutors WHERE Tname LIKE 'Hu%';
Query OK, 2 rows affected (0.00 sec)
# 再次删除两行
MariaDB [jiaowu]> COMMIT;
# 提交事務，這樣就不能恢復了
MariaDB [jiaowu]> ROLLBACK;
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
|  10 | jerry        | M      |   50 |
+-----+--------------+--------+------+
# 提交后，再回滚也不能恢复了
MariaDB [jiaowu]> SHOW VARIABLES LIKE 'autocommit';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | ON    |
+---------------+-------+
# autocommit函數是自動提交，如果沒有明確啟動事務，默認每一個操作是autocommit自動提交的，但這會產生大量磁盤IO。建議明確使用事務，並且關閉自動提交，這是優化服務器的一種策略。用命令SET @@autocommit=0關閉.切記，先啟動事務，最後要提交。测试中autocommit默认
=======================================================================================
全局變量：與用戶無關，服務器啟動就生效了，有管理權限的用戶才能修改。對當前會話無效，只對新建立會話有效。查看方法：SHOW GLOBAL VARIABLES [LIKE 'VALUE']，修改方法：SET GLOBAL @@VARIABLES ='VALUE'
會話變量：客戶端連接服務器時可以顯示的變量，對當前會話立即生效，會話終止變量失效。查看方法：SHOW [SESSION] VARIABLES [LIKE 'VALUE']，修改方法：SET  @@[SESSION.]VARIABLES ='VALUE'
=======================================================================================
MariaDB [jiaowu]> SET @@autocommit=0;
# 关闭会话变量的自动提交
MariaDB [jiaowu]> SHOW VARIABLES LIKE 'autocommit';       
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | OFF   |
+---------------+-------+
MariaDB [jiaowu]> DELETE FROM tutors WHERE Age=90;
# 删除年龄为90的人
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
+-----+--------------+--------+------+
# 查看，第5条被删除了
MariaDB [jiaowu]> ROLLBACK;
# 回滚
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
+-----+--------------+--------+------+
# 第5条数据又回来了

* 保存点
# 保存點：SAVEPOINT sid，可撤銷到指定的保存點
# 回滾至保存點：ROLLBACK TO sid
MariaDB [jiaowu]> DELETE FROM tutors WHERE TID=1;
MariaDB [jiaowu]> SAVEPOINT ab;
# 保存，保存的名字不能是數字
MariaDB [jiaowu]> DELETE FROM tutors WHERE TID=3;
MariaDB [jiaowu]> SAVEPOINT aC;
MariaDB [jiaowu]> DELETE FROM tutors WHERE TID=4;
MariaDB [jiaowu]> SAVEPOINT ad;
MariaDB [jiaowu]> ROLLBACK TO aC;
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
+-----+--------------+--------+------+
# 回滚到aC保存点，这个保存点是删除了TID=3后的保存点，所以表中没有TID=3的数据，如果回滚到ab保存点，就会有TID=3的数据。如果要回滚到TID=1状态，就直接使用ROLLBACK命令。

* 测试隔离级别
# 打开兩個mysql會話，隔離級別都設爲READ UNCOMMITTED，查看第一個事務的操作是否影響第二個

MariaDB [jiaowu]> SELECT @@tx_isolation;
+-----------------+
| @@tx_isolation  |
+-----------------+
| REPEATABLE-READ |
+-----------------+
# 查看会话变量，用SHOW SESSION VARIABLES LIKE '%tx_iso%';也可以查询到同样的结果。
MariaDB [jiaowu]> SET tx_isolation='READ-UNCOMMITTED';
# 兩個会话都調為讀未提交
MariaDB [jiaowu]> SELECT @@tx_isolation;              
+------------------+
| @@tx_isolation   |
+------------------+
| READ-UNCOMMITTED |
+------------------+
MariaDB [jiaowu]> START TRANSACTION;
# 兩個会话都啟動事務
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
|   3 | Miejueshitai | F      |   72 |
|   4 | OuYangfeng   | M      |   76 |
|   5 | YiDeng       | M      |   90 |
|   6 | YuCanghai    | M      |   56 |
|   7 | Jinlunfawang | M      |   67 |
|   9 | NingZhongze  | F      |   49 |
+-----+--------------+--------+------+
MariaDB [jiaowu]> UPDATE tutors SET Age=50 WHERE TID=1;
# 其中一個調整
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   50 |
# 另一個查看，雖未提交也可看到變化
MariaDB [jiaowu]> ROLLBACK;
# 修改數據的一方撤銷了
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
# 另一個查看與，數據又回到之前
MariaDB [jiaowu]> COMMIT;
# 两个会话都要提交

* 再測讀提交，對方不提交就看不到
MariaDB [jiaowu]> SET tx_isolation='READ-COMMITTED';
MariaDB [jiaowu]> START TRANSACTION;
# 两个会话都要设置成READ-COMMITTED，并启动事务
MariaDB [jiaowu]> UPDATE tutors SET Age=50 WHERE TID=1;
ERROR 1665 (HY000): Cannot execute statement: impossible to write to binary log since BINLOG_FORMAT = STATEMENT and at least one table uses a storage engine limited to row-based logging. InnoDB is limited to row-logging when transaction isolation level is READ COMMITTED or READ UNCOMMITTED.
# 修改数据时有报错。
=======================================================================================
从 MySQL 5.1.12 开始，可以用以下三种模式来实现：基于SQL语句的复制(statement-based replication, SBR)，基于行的复制(row-based replication, RBR)，混合模式复制(mixed-based replication, MBR)。相应地，binlog的格式也有三种：STATEMENT，ROW，MIXED。
如果你采用默认隔离级别REPEATABLE-READ，那么建议binlog_format=ROW。如果你是READ-COMMITTED隔离级别，binlog_format=MIXED和binlog_format=ROW效果是一样的，binlog记录的格式都是ROW，对主从复制来说是很安全的参数。
参考：https://blog.csdn.net/wsyw126/article/details/73011497
=======================================================================================
MariaDB [jiaowu]> SET @@binlog_format=ROW;
ERROR 1679 (HY000): Cannot modify @@session.binlog_format inside a transaction
# 提示不能在事物中修改
MariaDB [jiaowu]> COMMIT;
# 提交事物后，事物也就关闭了
MariaDB [jiaowu]> SET @@binlog_format=ROW;
# 再修改就没问题了
MariaDB [jiaowu]> UPDATE tutors SET Age=50 WHERE TID=1;       
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
# 在一个终端修改数据
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
# 在另一个终端查看
# 当一边修改数据，另一边查看时，数据是不会改变的，提交后才会修改  
MariaDB [jiaowu]> ROLLBACK;
# 修改数据的终端回滚

* 測试REPATABLE-READ
# 結果未提交前不能看到變化，提交後仍未看到變量，因為需要兩方都提交才能看到變化
MariaDB [jiaowu]> SET tx_isolation='REPEATABLE-READ';
MariaDB [jiaowu]> START TRANSACTION;
# 在两个终端修改
MariaDB [jiaowu]> UPDATE tutors SET Age=50 WHERE TID=1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
# 在一个终端修改并查看数据
MariaDB [jiaowu]> SELECT * FROM tutors;                
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   50 |
MariaDB [jiaowu]> SELECT * FROM tutors;                                
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
# 在另一个终端查看到的数据与修改数据终端查看到的不一样
MariaDB [jiaowu]> COMMIT;
# 修改数据的终端提交并查看
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   50 |

MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   93 |
# 在另一个终端查看，数据仍未变化
MariaDB [jiaowu]> COMMIT;
# 只有这个终端也提交后再查看，数据才会变化
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   50 |

* 測試可串行SERIALIZABLE
# 效果與REPATABLE-READ一樣，但因一方未提交，另一方的操作不能繼續

MariaDB [jiaowu]> SET tx_isolation='SERIALIZABLE';
MariaDB [jiaowu]> START TRANSACTION;
MariaDB [jiaowu]> SELECT * FROM tutors;
+-----+--------------+--------+------+
| TID | Tname        | Gender | Age  |
+-----+--------------+--------+------+
|   1 | HongQigong   | M      |   50 |
# 在两个终端执行上面操作
MariaDB [jiaowu]> UPDATE tutors SET Age=93 WHERE TID=1;
# 在一个终端执行此命令，命令行会停住。先启动事物的终端命令行会停住，后启动的可以修改，但要等后启动事物的终端提交后，先启动事物的终端才可以操作，提交后的结果也以后提交的终端数据为准 
MariaDB [jiaowu]> UPDATE tutors SET Age=23 WHERE TID=1;
# 在另一个执行此命令
MariaDB [jiaowu]> COMMIT;
# 提交，这时命令行停住的终端又可以操作了，但如果这里长时间没有提交，命令行停住的终端会提示"Lock wait timeout exceeded; try restarting transaction"
MariaDB [jiaowu]> COMMIT;
# 命令行停住的终端提交后，数据结果以此终端的修改为准 

```

