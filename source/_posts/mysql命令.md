---
title: mysql命令
date: 2019-01-04 00:14:03
tags: mysql命令
categories: MySQL
---

> 可以在mysql中使用help [command]查看命令的帮助信息

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

mysql> SHOW CREATE TABLE courses;
# 显示创建courses表所用的语句
```



### CREATE 创建

#### 创建库

```shell
语法
CREATE {DATABASE | SCHENA} [IF NOT EXISTS] db_name [CHARACTER SET=] [COLLATE] 
# SCHENA指方案； IF NOT EXISTS指在不存在時才創建數據庫；db_name後的是指定排序的名稱及規則; CHARACTER SET=爲指定字符集，等號可省略；COLLATE爲指定排序規則

mysql> CREATE DATABASE test;
Query OK, 1 row affected (0.00 sec)
# 创建库
mysql> CREATE TABLE test.test(ID INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,Name CHAR(20));
Query OK, 0 rows affected (0.01 sec)
# 创建表。定義為AUTO_INCREMENT時必須是整型，非空，無符號，一定要創建主鍵或唯一鍵索引；AUTO_INCREMENT表示自動增長。PRIMARY KEY表示主鍵

mysql> CREATE SCHEMA IF NOT EXISTS students CHARACTER SET 'gbk' COLLATE 'gbk_chinese_ci';
Query OK, 1 row affected (0.00 sec)
# 創建數據庫後會在/var/lib/mysql數據存儲目錄中生成一個students的庫，其中有db.opt的ASCII文件，可用cat查看此opt文件，此文件中保存了此數據庫的默認字符集和排序規則
[root@test ~]# cat /var/lib/mysql/students/db.opt 
default-character-set=gbk
default-collation=gbk_chinese_ci
```

#### 创建表

```shell
创建表的方法有三种
1. 直接定義一張空表
2. 從其它表中查詢出數據，並以之創建新表
3. 以其它表為模板創建一個空表
语法
CREATE TABLE [IF NOT EXISTS] tb_name (col_name col_defination, CONSTRAINT)
# col_name col_defination指字段名稱字段定義，CONSTRAINT 指約束；字段定義有如下：
# column_definition:                  
# data_type [NOT NULL | NULL] [DEFAULT default_value]
# [AUTO_INCREMENT] [UNIQUE [KEY] | [PRIMARY] KEY]
# [COMMENT 'string']
# [COLUMN_FORMAT {FIXED|DYNAMIC|DEFAULT}]
# [STORAGE {DISK|MEMORY|DEFAULT}]
# [reference_definition]

方法一
mysql> CREATE TABLE tab1(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,Name CHAR(20) NOT NULL,Age TINYINT NOT NULL); 
Query OK, 0 rows affected (0.01 sec)

mysql> CREATE TABLE tab2(id INT UNSIGNED NOT NULL AUTO_INCREMENT,Name CHAR(20) NOT NULL,Age TINYINT NOT NULL,PRIMARY KEY(id,Name),UNIQUE KEY(Name),INDEX(Age));
Query OK, 0 rows affected (0.01 sec)
# 可以把主鍵寫在最後，用逗號隔開，如果是多個列做主鍵，就一定要單獨寫在最後。
# INT 表示整型，UNSIGNED 表示無符號的，AUTO_INCREMENT 表示自動增長，PRIMARY KEY表示主鍵，UNIQUE KEY表示定義唯一鍵，INDEX表示定義索引。这里的PRIMARY KEY, UNIQUE KEY, INDEX的使用方法是一样的，都可以在最后定义多个字段

mysql> USE students;
Database changed
mysql> CREATE TABLE courses(CID TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,Couse VARCHAR(50) NOT NULL) ENGINE=MyISAM;
# 最後的ENGINE=MyISAM 是指定存儲引擎的，不加就是數據默認的innode
Query OK, 0 rows affected (0.00 sec)
mysql> SHOW TABLE STATUS FROM students LIKE 'courses'\G
*************************** 1. row ***************************
           Name: courses
         Engine: MyISAM
        Version: 10
     Row_format: Dynamic
           Rows: 0
 Avg_row_length: 0
    Data_length: 0
Max_data_length: 281474976710655
   Index_length: 1024
      Data_free: 0
 Auto_increment: 1
    Create_time: 2019-01-04 10:59:44
    Update_time: 2019-01-04 10:59:44
     Check_time: NULL
      Collation: gbk_chinese_ci
       Checksum: NULL
 Create_options: 
        Comment: 
1 row in set (0.00 sec)
# 命令中可以不加FROM students，那么查看的就是当前的库。
mysql> DROP TABLE courses;
Query OK, 0 rows affected (0.00 sec)
# 删除表

方法二
mysql> CREATE TABLE testcourses SELECT * FROM courses WHERE CID<=2;
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 將原表中的CID小於等於2的数据創建一張新表
mysql> SHOW TABLES;
+--------------------+
| Tables_in_students |
+--------------------+
| courses            |
| testcourses        |
+--------------------+
2 rows in set (0.00 sec)
mysql> DESC courses;
+-------+---------------------+------+-----+---------+----------------+
| Field | Type                | Null | Key | Default | Extra          |
+-------+---------------------+------+-----+---------+----------------+
| CID   | tinyint(3) unsigned | NO   | PRI | NULL    | auto_increment |
| Couse | varchar(50)         | NO   |     | NULL    |                |
+-------+---------------------+------+-----+---------+----------------+
2 rows in set (0.00 sec)

mysql> DESC testcourses;
+-------+---------------------+------+-----+---------+-------+
| Field | Type                | Null | Key | Default | Extra |
+-------+---------------------+------+-----+---------+-------+
| CID   | tinyint(3) unsigned | NO   |     | 0       |       |
| Couse | varchar(50)         | NO   |     | NULL    |       |
+-------+---------------------+------+-----+---------+-------+
2 rows in set (0.01 sec)
# 两个表的结构是不同的，一些屬性不存在了。

方法三
mysql> CREATE TABLE test LIKE courses;
Query OK, 0 rows affected (0.00 sec)
mysql> DESC test;
+-------+---------------------+------+-----+---------+----------------+
| Field | Type                | Null | Key | Default | Extra          |
+-------+---------------------+------+-----+---------+----------------+
| CID   | tinyint(3) unsigned | NO   | PRI | NULL    | auto_increment |
| Couse | varchar(50)         | NO   |     | NULL    |                |
+-------+---------------------+------+-----+---------+----------------+
2 rows in set (0.00 sec)
# 以其它表為模板創建空表，這樣創建的表結構是一樣的
```

#### 创建索引

```shell
# 鍵都是索引，是特殊索引。鍵也稱作約束，可用作索引，屬於特殊索引（有特殊限定），他們存儲下來的都是B+tree索引的結構
# BTREE索引主要是為了排序
mysql> CREATE INDEX couse_on_test ON test(Couse) USING BTREE;
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 用 INDEX命令必須指定索引名稱，这里叫couse_on_test ,ON表示在哪個表的哪個字段上創建，一般只能使用BTREE索引， USING表示明確指明是什麼索引。
mysql> SHOW INDEXES FROM test;
+-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table | Non_unique | Key_name      | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| test  |          0 | PRIMARY       |            1 | CID         | A         |           0 |     NULL | NULL   |      | BTREE      |         |               |
| test  |          1 | couse_on_test |            1 | Couse       | A         |        NULL |     NULL | NULL   |      | BTREE      |         |               |
+-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
2 rows in set (0.00 sec)
# 显示表上的索引
mysql> CREATE INDEX couse1_on_test ON test(Couse(5) DESC) USING BTREE;
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 創建索引同時指定要建索引長度爲5個字符，從左邊開始比較，對TEST類型創建時必須指定長度。並降序排列；ASC表示升序，DESC表示降序
```



### INSERT 插入

```shell
语法
INSERT INTO tb_name(col1,col2 …) VALUES (vol1, vol2, …)[,(val, val2, …),…]        
# 字符型要用單引號引起，數值型不需要引號，日期時間型也不需要引號，空值用NULL；''兩個單引號是一個字符串的空串，不是空值；此命令可實現批量插入；VALUES不一定是值，也可以是表達式；SET的用法像UPDATE命令

方法一
mysql> INSERT INTO courses(Couse) values ('Hamogong'),('pixiejianfa'),('Kuihuabaodian');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0
# 向courses表中的Couse列中插入數據
mysql> SELECT * FROM courses;
+-----+---------------+
| CID | Couse         |
+-----+---------------+
|   1 | Hamogong      |
|   2 | pixiejianfa   |
|   3 | Kuihuabaodian |
+-----+---------------+
3 rows in set (0.01 sec)

方法二
mysql> source /root/jiaowu.sql
# 导入库
mysql> INSERT INTO tutors SET Tname='Tom',Gender='F',Age=30;
Query OK, 1 row affected (0.00 sec)

mysql> SELECT * FROM tutors ORDER BY TID DESC LIMIT 1;
+-----+-------+--------+------+
| TID | Tname | Gender | Age  |
+-----+-------+--------+------+
|  10 | Tom   | F      |   30 |
+-----+-------+--------+------+
1 row in set (0.00 sec)
# 查最後一條輸入的數據，ORDER BY TID DESC表示将TID字段按降序排列，LIMIT 1表示只顯示第一個，因为按降序排列所以这里显示的是最后一条记录
mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|               10 |
+------------------+
1 row in set (0.00 sec)
# 這個被查看的函數保存了輸入數據的ID，數據按此ID編號

方法三
mysql> DESC students;
mysql> INSERT INTO tutors (Tname,Gender,Age) SELECT Name,Gender,Age FROM students WHERE Age > 20; 
Query OK, 4 rows affected (0.01 sec)
Records: 4  Duplicates: 0  Warnings: 0
# 將從一個表中查詢到的結果插入到指定表中去 ，注意字段要對應；把SELECT查詢到的結果插入到tutors表中，兩個表的字段數量要一致；把學生當中年齡大於20的學生的名字，姓別，年齡插入到tutors表中；前面INTO後的內容是表名與指定插入的字段
# 如果INSERT命令在插入時有重復又違反了約束關系會報錯，爲了避免報錯，用如下命令
# REPLACE：替換，原表中有就覆蓋，沒有就插入
# REPLACE INTO：用法與INSERT INTO相同，有三種方法
```



### DELETE 删除

```shell
语法
DELETE…FROM tb_name [WHERE] [ORDER BY] [LIMIT row_xount];  
# 如未使用WHERE子句，表就会被清空了，刪除後無法恢復，慎用；
TRUNCATE tb_name;  
# 此命令可以清空表並重置計數器（AUTOINCREMENT）

mysql> DELETE FROM students;
Query OK, 10 rows affected (0.00 sec)
# 清空students表
mysql> INSERT INTO students (Name,Age,Gender) VALUES ('Tom','30','F');
Query OK, 1 row affected (0.00 sec)
# 插入一条数据。
mysql> SELECT * FROM students;
+------+------+------+--------+------+------+------+---------------------+
| SID  | Name | Age  | Gender | CID1 | CID2 | TID  | CreateTime          |
+------+------+------+--------+------+------+------+---------------------+
| 3907 | Tom  |   30 | F      | NULL | NULL | NULL | 2012-04-06 10:00:00 |
+------+------+------+--------+------+------+------+---------------------+
1 row in set (0.00 sec)
# 插入數據後計數器會繼續向下排號，如上面的3907
mysql> TRUNCATE students;
Query OK, 0 rows affected (0.01 sec)
# 清空表
mysql> INSERT INTO students (Name,Age,Gender) VALUES ('Tom',30,'F');
Query OK, 1 row affected (0.00 sec)

mysql> SELECT * FROM students;
+-----+------+------+--------+------+------+------+---------------------+
| SID | Name | Age  | Gender | CID1 | CID2 | TID  | CreateTime          |
+-----+------+------+--------+------+------+------+---------------------+
|   1 | Tom  |   30 | F      | NULL | NULL | NULL | 2012-04-06 10:00:00 |
+-----+------+------+--------+------+------+------+---------------------+
1 row in set (0.00 sec)
# 使用TRUNCATE清空表后，再次插入数据时就重新计数了。又从1开始了
```



### UPDATE 修改

```shell
语法
UPDATE tb_name SET col=…,col=… [WHERE][ORDER BY] [LIMIT row_xount];
# 一定要使用WHERE條件指明条件
mysql> UPDATE tutors SET Age=50 WHERE TID=12;
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0
# 修改tutors表中TID为12的记录的Age值为50
mysql> SELECT * FROM tutors WHERE TID=12;
+-----+-------+--------+------+
| TID | Tname | Gender | Age  |
+-----+-------+--------+------+
|  12 | HuFei | M      |   50 |
+-----+-------+--------+------+
1 row in set (0.00 sec)
```



### ALTER 修改

```shell
语法
ALTER {DATABASE | SCHEMA } db_name alter_specification…            
# alter_specification…表示改什麼，能修改的就是字符集與排序規則，偶爾會昇級數據字典名稱，在老版本遷移到新版本數據庫時才用昇級數據字典名稱。用ALTER DATABASE | SCHEMA db_name UPGRADE DATA DIRECTORY NAME就可升級。alter_specification可以是[DEFAULT] CHARACTER SET [=] charset_name或[DEFAULT] COLLATE [=] collation_name

mysql> use students;
mysql> ALTER TABLE test ADD UNIQUE KEY (Couse);
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 添加唯一鍵索引

mysql> ALTER TABLE test CHANGE Couse Course VARCHAR(50) NOT NULL;
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 改變字段名稱

mysql> ALTER TABLE test ADD starttime date default '20190105';
Query OK, 0 rows affected (0.00 sec)
Records: 0  Duplicates: 0  Warnings: 0
# 向test表添加字段 starttime，類型是date默認值是default '20190105'

mysql> ALTER TABLE test RENAME TO testcourses1;
Query OK, 0 rows affected (0.00 sec)
# 将test改表名为testcourses1

mysql> RENAME TABLE testcourses1 TO test;
Query OK, 0 rows affected (0.00 sec)
# 使用RENAME TABLE命令将名字改回test。
mysql> SHOW TABLES;
+--------------------+
| Tables_in_students |
+--------------------+
| courses            |
| test               |
| testcourses        |
+--------------------+
3 rows in set (0.00 sec)

例：
mysql> CREATE TABLE student (SID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,Name VARCHAR(30),CID INT NOT NULL);
Query OK, 0 rows affected (0.01 sec)

mysql> INSERT INTO student (Name,CID) VALUES ('Yue Buqun',2),('Zhang Wuji',1);
Query OK, 2 rows affected (0.01 sec)
Records: 2  Duplicates: 0  Warnings: 0

mysql> SELECT Name,Couse FROM student,courses WHERE student.CID=courses.CID;  
+------------+-------------+
| Name       | Couse       |
+------------+-------------+
| Yue Buqun  | pixiejianfa |
| Zhang Wuji | Hamogong    |
+------------+-------------+
2 rows in set (0.00 sec)
# 組合查詢/多表查詢；查询student,courses两个表，显示其中student表CID字段等于courses表CID字段的部分

mysql> ALTER TABLE student MODIFY CID TINYINT UNSIGNED NOT NULL;
Query OK, 2 rows affected (0.02 sec)
Records: 2  Duplicates: 0  Warnings: 0
# 改字段類型

mysql> ALTER TABLE courses ENGINE=InnoDB;
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0
# 改存儲引擎

mysql> ALTER TABLE student ADD FOREIGN KEY (CID) REFERENCES courses (CID);    
Query OK, 2 rows affected (0.02 sec)
Records: 2  Duplicates: 0  Warnings: 0
# 添加外鍵用FOREIGN KEY，外鍵只能在支持事物的存儲引擎上使用，如Inodb，添加外鍵後就有了引用型約束，當插入的信息是關聯表中沒有的信息時是不能插入的。 REFERENCES表示這張表參考哪張表的哪個字段
# 添加时两个表的存储引擎应该都是InnoDB，两个字段的属性也应该一样。如下：
mysql> desc courses;
+-------+---------------------+------+-----+---------+----------------+
| Field | Type                | Null | Key | Default | Extra          |
+-------+---------------------+------+-----+---------+----------------+
| CID   | tinyint(3) unsigned | NO   | PRI | NULL    | auto_increment |

mysql> desc student;
+-------+---------------------+------+-----+---------+----------------+
| Field | Type                | Null | Key | Default | Extra          |
+-------+---------------------+------+-----+---------+----------------+
| CID   | tinyint(3) unsigned | NO   | MUL | NULL    |                |

mysql> ALTER TABLE student ADD FOREIGN KEY foreign_cid (CID) REFERENCES courses (CID);
Query OK, 2 rows affected (0.02 sec)
Records: 2  Duplicates: 0  Warnings: 0
# 給外鍵取名叫foreign_cid，就是要添加外键时在FOREIGN KEY后面加入一个名字。与上一条命令相同。

mysql> select * from courses;
+-----+---------------+
| CID | Couse         |
+-----+---------------+
|   1 | Hamogong      |
|   2 | pixiejianfa   |
|   3 | Kuihuabaodian |
+-----+---------------+
3 rows in set (0.00 sec)

mysql> select * from student;
+-----+------------+-----+
| SID | Name       | CID |
+-----+------------+-----+
|   1 | Yue Buqun  |   2 |
|   2 | Zhang Wuji |   1 |
+-----+------------+-----+
2 rows in set (0.00 sec)
mysql> INSERT INTO student (Name,CID) VALUES ('chenjialuo',1);
Query OK, 1 row affected (0.01 sec)
# 插入一条数据，因为student表中的CID字段是有外键约束的，依赖于courses表的CID字段。所以添加时，CID的数字一定是courses表中的CID字段有的数字，上面查看表courses表中的CID字段只有1、2、3,所以这里使用了1。如果是courses表中的CID字段中不存在的数字，那么就会报错，"ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`students`.`student`, CONSTRAINT `student_ibfk_1` FOREIGN KEY (`CID`) REFERENCES `courses` (`CID`))"
mysql> select * from student;
+-----+------------+-----+
| SID | Name       | CID |
+-----+------------+-----+
|   1 | Yue Buqun  |   2 |
|   2 | Zhang Wuji |   1 |
|   4 | chenjialuo |   1 |
+-----+------------+-----+
3 rows in set (0.00 sec)

mysql> DELETE FROM courses WHERE CID=1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`students`.`student`, CONSTRAINT `student_ibfk_1` FOREIGN KEY (`CID`) REFERENCES `courses` (`CID`))
# 刪表中信息，有外鍵約束時是不能刪的，因为courses表中CID为1的行已经被student表中的CID表引用了，如果将上面的CID改为等于3，就不会有报错了，因为没被引用。外鍵與存儲引擎有關，外鍵約束會極大地消耗資源的
```



### DROP 删除

```shell
语法
DROP {DATABASE | SCHEMA} [IF EXISTS] db_name              
# 一般不會給數據庫重命名。要改數據庫的名稱，可將數據庫停掉，並把數據庫的目錄名稱改一下，重啓服務即可；一般不用重命名

DROP INDEX name_on_student ON student
# 删除student上叫name_on_student的索引
```



### SELECT 查询

```shell
语法
SELECT 函數名;
例：
mysql> SELECT DATABASE();
+------------+
| DATABASE() |
+------------+
| jiaowu     |
+------------+
1 row in set (0.00 sec)
# 查看默認數據庫是誰

mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                4 |
+------------------+
1 row in set (0.00 sec)
# 查詢上一次生成的ID到幾了

mysql> SELECT @@global.sql_mode;
+--------------------------------------------+
| @@global.sql_mode                          |
+--------------------------------------------+
| STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION |
+--------------------------------------------+
1 row in set (0.00 sec)
# @@表示調用服務器變量或內置變量

语法
SELECT select-list FROM tb WHERE qualification

SELECT * FROM tb_name;
# 顯示表中所有字段

SELECT field1,field2 FROM tb_name;           
# 基於投影，只顯示哪些字段
例：mysql> SELECT Name,Age FROM students;
+------+------+
| Name | Age  |
+------+------+
| Tom  |   30 |
+------+------+
1 row in set (0.00 sec)

SELECT * FROM tb_name WHERE qualification              
# 選擇，顯示符合條件的行, qualification表示搜索碼，搜索碼是表中字段即可
例：mysql> SELECT * FROM students WHERE Age>=20;
+-----+------+------+--------+------+------+------+---------------------+
| SID | Name | Age  | Gender | CID1 | CID2 | TID  | CreateTime          |
+-----+------+------+--------+------+------+------+---------------------+
|   1 | Tom  |   30 | F      | NULL | NULL | NULL | 2012-04-06 10:00:00 |
+-----+------+------+--------+------+------+------+---------------------+
1 row in set (0.00 sec)

mysql> SELECT Name,Age FROM students WHERE Age>=20; 
+------+------+
| Name | Age  |
+------+------+
| Tom  |   30 |
+------+------+
1 row in set (0.00 sec)

SELECT [DISTINCT] * FROM tb_name WHERE qualification            
# [DISTINCT]表示其後的相同的值只顯示一次，如下面語句中指Gender相同的只顯示一次
例：mysql> SELECT DISTINCT Gender FROM students;
+--------+
| Gender |
+--------+
| F      |
+--------+
1 row in set (0.00 sec)

========================================================
*** 规范
1. FROM子句後可跟表、多個表、其它SELECT語句，表示要查詢的關系
2. WHERE子句指定一個布爾關系表達式，用到的符號有=、>、<、>=、<=、!=、<=>，在做數值比較時，數值不能加引號，條件是字符時必須用’’引號引起，<=>表示就算表中有空值也可以正確比較
3. 邏輯表達式
    AND、OR、NOT
    BETWEEN…AND…		# 在…之間
    LIKE ''			# 比較操作，這時要用通配符%和_
        %表示任意長度任意字符
        _表示一個長度任意字符
    REGEXP或RLIKE		# 支持正則表達式
    IN ()			# 做離散取值時使用，括號中是符合的條件
    IS NULL			# 判斷是否為空
    IS NOT NULL          	# 判斷是否不空
    ORDER BY field_name (ASC|DESC)
    # 將查詢後的結果排序，默認是昇序，ASC是昇序，DESC是降序
    AS			# 字段別名
4. LIMIT子句：只显示几行结果或偏移几行显示几行
    LIMIT [offset,]Count
5. 聚合計算：SUM(), MIN(), MAX(), AVG(),COUNT()
6. GROUP BY：分組，目的是將整張表的內容跟據某個標准碼分完組後求聚合函數
    HAVING	# 條件：分組時用的过滤。与WHERE使用方法一样
========================================================

例：
mysql> source /root/jiaowu.sql
mysql> SELECT Name,Age FROM students WHERE Age>=20;
+-------------+------+
| Name        | Age  |
+-------------+------+
| DingDian    |   25 |
| HuFei       |   31 |

mysql> SELECT Name,Age FROM students WHERE Gender='M';
+-------------+------+
| Name        | Age  |
+-------------+------+
| GuoJing     |   19 |
| YangGuo     |   17 |

mysql> SELECT Name,Age FROM students WHERE Age+1>=20;
+-------------+------+
| Name        | Age  |
+-------------+------+
| GuoJing     |   19 |
| DingDian    |   25 |
# 用表達式做條件，但在字段中這樣用會不能索引

mysql> SELECT Name FROM students WHERE Age>20 AND Gender='M';
+-------------+
| Name        |
+-------------+
| DingDian    |
| HuFei       |
# 與

mysql> SELECT Name FROM students WHERE Age>20 OR Gender='M';
+-------------+
| Name        |
+-------------+
| GuoJing     |
| YangGuo     |
# 或

mysql> SELECT Name FROM students WHERE NOT Age>20;
+--------------+
| Name         |
+--------------+
| GuoJing      |
| YangGuo      |
# 非

mysql> SELECT Name,Age,Gender FROM students WHERE NOT Age>20 AND NOT Gender='M';
+--------------+------+--------+
| Name         | Age  | Gender |
+--------------+------+--------+
| HuangRong    |   16 | F      |
| YueLingshang |   18 | F      |

mysql> SELECT Name,Age,Gender FROM students WHERE NOT (Age>20 OR Gender='M');
+--------------+------+--------+
| Name         | Age  | Gender |
+--------------+------+--------+
| HuangRong    |   16 | F      |
| YueLingshang |   18 | F      |

mysql> SELECT Name,Age FROM students WHERE Age>=20 AND Age<=25;
+-------------+------+
| Name        | Age  |
+-------------+------+
| DingDian    |   25 |
| ZhangWuji   |   20 |
# 年齡在20-25之間的同學
mysql> SELECT Name,Age FROM students WHERE Age BETWEEN 20 AND 25;
+-------------+------+
| Name        | Age  |
+-------------+------+
| DingDian    |   25 |
| ZhangWuji   |   20 |
# 用BETWEEN…AND，与上面效果一样

mysql> SELECT Name FROM students WHERE Name LIKE 'y%';
+--------------+
| Name         |
+--------------+
| YangGuo      |
| YueLingshang |
# 找姓名中以y開頭的，用LIKE，表示模糊查找，要用通配符

mysql> SELECT Name FROM students WHERE Name LIKE 'y____';
+-------+
| Name  |
+-------+
| YiLin |
+-------+
# 找y後跟4個字符的

mysql> SELECT Name FROM students WHERE Name LIKE '%ing%';
+--------------+
| Name         |
+--------------+
| GuoJing      |
| DingDian     |
# 找包含ing的

mysql> SELECT Name FROM students WHERE Name RLIKE '^[DHY].*$';
+--------------+
| Name         |
+--------------+
| YangGuo      |
| DingDian     |
# RLIKE或REGEXP表示用正則表達式，找D、H、Y開頭的後面是任意字符，用正則時索引可能不太有用

mysql> SELECT Name FROM students WHERE Age IN (18,20,25);
+--------------+
| Name         |
+--------------+
| DingDian     |
| YueLingshang |
# 找年齡爲18、20、25的，用IN來指定一個列表

mysql> SELECT Name FROM students WHERE CID2 IS NULL;
+-------------+
| Name        |
+-------------+
| LingHuchong |
| YiLin       |
+-------------+
# 找課程2爲空的，用NULL時要用IS，不空用IS NOT NULL
```

#### 排序查詢後的結果

```SHELL
mysql> SELECT Name FROM students WHERE CID2 IS NULL ORDER BY Name;
+-------------+
| Name        |
+-------------+
| LingHuchong |
| YiLin       |
+-------------+
# 跟據姓名排序，用ORDER BY field_name {ASC|DESC}指定升序還是降序
# 數據存儲在磁盤上有三種格式：堆格式，順序格式，hash格式；建議在經常要排序的場景中應該盡可能選擇一種在存儲時就排好序的方式，而且盡可能和搜索碼保持一致

mysql> SELECT Name AS Student_name FROM students;
+--------------+
| Student_name |
+--------------+
| GuoJing      |
| YangGuo      |
# 字段別名，用AS來實現。將字段Name顯示為Student_name；表也支持別名

mysql> SELECT 3+1 AS SUM;
+-----+
| SUM |
+-----+
|   4 |
+-----+
# 直接取別名，還可運算

mysql> SELECT Name AS Student_name FROM students LIMIT 2;
+--------------+
| Student_name |
+--------------+
| GuoJing      |
| YangGuo      |
+--------------+
# 只顯示前兩個

mysql> SELECT Name AS Student_name FROM students LIMIT 2,3;
+--------------+
| Student_name |
+--------------+
| DingDian     |
| HuFei        |
# 偏移2個從第三個開始顯示3個
```

#### 聚合計算

```shell
mysql> SELECT AVG(age) FROM students;
+----------+
| AVG(Age) |
+----------+
|  21.3000 |
+----------+
# AVG表示平均，括號內是字段名

mysql> SELECT MAX(Age) FROM students;
+----------+
| MAX(Age) |
+----------+
|       31 |
+----------+
# 最大值

mysql> SELECT MIN(Age) FROM students;  
+----------+
| MIN(Age) |
+----------+
|       16 |
+----------+
# 最小值

mysql> SELECT SUM(Age) FROM students;
+----------+
| SUM(Age) |
+----------+
|      213 |
+----------+
# 总和

mysql> SELECT COUNT(Age) FROM students;
+------------+
| COUNT(Age) |
+------------+
|         10 |
+------------+
# 個數之和

mysql> SELECT AVG(Age) FROM students WHERE Gender='M';
+----------+
| AVG(Age) |
+----------+
|  22.8571 |
+----------+
# 找男同學的平均年齡
```

#### 分組

```shell
# 分组就是将某一列相同的数据合并为一行显示出来

mysql> SELECT Age,Gender FROM students GROUP BY Gender;
+------+--------+
| Age  | Gender |
+------+--------+
|   16 | F      |
|   19 | M      |
+------+--------+
# 跟據性別分兩組；GROUP BY表示根據什麼分組，这里显示Age是没有意义的，因为这里只是为了根据性别来分组。

mysql> SELECT AVG(Age),Gender FROM students GROUP BY Gender;
+----------+--------+
| AVG(Age) | Gender |
+----------+--------+
|  17.6667 | F      |
|  22.8571 | M      |
+----------+--------+
# 求不同性别的平均年龄

mysql> SELECT COUNT(CID1) FROM students GROUP BY CID1;
+-------------+
| COUNT(CID1) |
+-------------+
|           1 |
|           3 |
|           1 |
|           1 |
# 根據課程選擇，統計CID1中每門課選修的同學的個數

mysql> SELECT COUNT(CID1) AS Persons,CID1 FROM students GROUP BY CID1;
+---------+------+
| Persons | CID1 |
+---------+------+
|       1 |    1 |
|       3 |    2 |
|       1 |    5 |
|       1 |    6 |
|       2 |    8 |
|       1 |   11 |
|       1 |   18 |
+---------+------+
# 將整張表的內容跟據某個標准碼分完組後求聚合函數。显示的结果中，第一列表示每门课程有几个人在学，第二列表示这些课程的ID号也就是统计每门课程的ID有几个人在学

mysql> SELECT COUNT(CID1) AS Persons,CID1 FROM students GROUP BY CID1 HAVING persons>=2;
+---------+------+
| Persons | CID1 |
+---------+------+
|       3 |    2 |
|       2 |    8 |
+---------+------+
# 分組顯示那些選修人數大於等於2個人的，用 HAVING引導過濾條件。 HAVING只能跟 GROUP BY一起用，用於將 GROUP BY的結果再次進行過濾
```

#### 多表查询

```shell
* 交叉連接：笛卡爾乘積，將兩張表連在一起，因為表太大最好不要這樣做
* 自然連接：對兩張表做比較將相同字段，只將等值的保留下來

mysql> SELECT * FROM students,courses;
# 查詢兩張表，顯示为一張表，一般不要這樣做

mysql> SELECT * FROM students,courses WHERE students.CID1 = courses.CID;
# 顯示每位同學及他所學的第一門課的名稱，條件是 students表中CID1字段等於 courses表中CID字段的，顯示的結果中只有CID1和CID相等的才保留下來

mysql> SELECT students.Name,courses.Cname FROM students,courses WHERE students.CID1 = courses.CID;
+--------------+------------------+
| Name         | Cname            |
+--------------+------------------+
| GuoJing      | TaiJiquan        |
| YangGuo      | TaiJiquan        |
# 保留要求顯示的字段並做自然連接，如果兩張表中都有name字段，就必須加上表名。或用別名，如下：

mysql> SELECT s.Name,c.Cname FROM students AS s,courses AS c WHERE s.CID1 = c.CID;
+--------------+------------------+
| Name         | Cname            |
+--------------+------------------+
| GuoJing      | TaiJiquan        |
| YangGuo      | TaiJiquan        |
# 先取別名再過濾，自連接時必須定義別名，不然不能連接。
```

####  外連接

```shell
* 左外連接：左表LEFT JOIN 右表 ON 條件
* 右外連接：左表RIGHT JOIN 右表 ON 條件 ；外連接是用ON來指定連接條件

mysql> SELECT s.Name,c.Cname FROM students AS s LEFT JOIN courses AS c ON s.CID1=c.CID;
+--------------+------------------+
| Name         | Cname            |
+--------------+------------------+
| GuoJing      | TaiJiquan        |
| YangGuo      | TaiJiquan        |
# 顯示每位同學選擇的第一門課，如果有這門課就顯示課程名稱，如果沒有就顯示NULL。这是以左边的列为标准，也就是左边的列的信息会全部显示，右边的列可能有NULL

mysql> SELECT s.Name,c.Cname FROM students AS s RIGHT JOIN courses AS c ON s.CID1=c.CID;
+--------------+------------------+
| Name         | Cname            |
+--------------+------------------+
| GuoJing      | TaiJiquan        |
| YangGuo      | TaiJiquan        |
# 以右表爲標準，如果課程有人選擇就顯示誰選了，如果沒人選就顯示NULL
```

#### 自連接

```shell
mysql> SELECT c.Name AS student,s.Name AS teacher FROM students AS s,students AS c WHERE c.TID=s.SID;
+-----------+-------------+
| student   | teacher     |
+-----------+-------------+
| GuoJing   | DingDian    |
| YangGuo   | GuoJing     |
# 顯示每個同學和他的導師，導師是根據導師的編號在同一張表中再查詢對應的人。只有一張表，查詢在一張表中引用兩次
```

#### 子查詢

```shell
mysql> SELECT Name FROM students WHERE Age > (SELECT AVG(Age) FROM students);
+-------------+
| Name        |
+-------------+
| DingDian    |
| HuFei       |
| Xuzhu       |
| LingHuchong |
+-------------+
# 找students表中年齡大於平均年齡的同學
# 可在比較操作中使用子查詢，子查詢只能是一個單值，如果是一堆值會報錯
# 可在IN()中使用子查詢，這就不需要返回單值了

mysql> SELECT Name FROM students WHERE Age IN (SELECT Age FROM tutors);
# 不加IN會報錯，因爲老師的年齡有很多。查找同學年齡與老師一樣的

mysql> SELECT Name,Age FROM (SELECT Name,Age FROM students) AS t WHERE t.Age>=20;
+-------------+------+
| Name        | Age  |
+-------------+------+
| DingDian    |   25 |
| HuFei       |   31 |
# 在FROM中使用子查詢
# 選擇所有用戶和他的年齡，顯示前面的表中年齡大於20的。
mysql> SELECT Name,Age FROM students AS t WHERE t.Age>=20;     +-------------+------+
| Name        | Age  |
+-------------+------+
| DingDian    |   25 |
| HuFei       |   31 |
# 这条命令与上面执行的结果是一样的。
```

#### 聯合查詢

```shell
mysql> (SELECT Name,Age FROM students)UNION(SELECT Tname,Age FROM tutors);
+--------------+------+
| Name         | Age  |
+--------------+------+
| GuoJing      |   19 |
| YangGuo      |   17 |
# 聯合查詢：这只是简单地將兩個查詢結果聯合起來，上半部分是第一条查询语句的结果，下半部分是第二条查询语句的结果
```

### 测试

```shell
* 挑选出courses表中没有被students中的CID2学习的课程的课程名称；
例如：挑选出没有教授任何课程的老师，每个老师及其所教授课程的对应关系在courses表中
找出students表中CID1有两个或两个以上同学学习了的同一门课程的课程名称 

mysql> SELECT Cname FROM courses WHERE CID NOT IN (SELECT DISTINCT CID2 FROM students WHERE CID2 IS NOT NULL); 
+------------------+
| Cname            |
+------------------+
| TaiJiquan        |
| Qianzhuwandushou |
# 挑選出courses表中沒有被students中的CID2學習的課程的課程名稱。括号中查询出的是students表中不为空的CID2的ID号，再从courses表中的CID与后面的结果对比，如果有CID不在后面的CID2中就选出来，最后显示这些选出的CID的名称。
mysql> SELECT Tname FROM tutors WHERE TID NOT IN (SELECT DISTINCT TID FROM courses);
+-------------+
| Tname       |
+-------------+
| NingZhongze |
+-------------+
# 挑选出没有教授任何课程的老师；找到后面括号中的courses表中的课程ID并且不用重复显示，前面再按条件在后面的结果中筛选，选出tutors表中的课程ID不在后面的结果中的项，最后按这个条件结果显示tutors表中的Tname项。
mysql> SELECT Cname FROM courses WHERE CID IN (SELECT CID1 FROM students GROUP BY CID1 HAVING COUNT(CID1) >=2);
+-------------+
| Cname       |
+-------------+
| TaiJiquan   |
| Wanliduxing |
+-------------+
#  找出students表中CID1有两个或两个以上同学学习了的同一门课程的课程名称 
# 建議將一個復雜查詢改寫成幾個簡單查詢，這樣執行的更快

显示每一位老师及其所教授的课程，没有教授的课程的保持为NULL
mysql> SELECT t.Tname,c.Cname FROM tutors AS t LEFT JOIN courses AS c ON t.TID=c.TID;  
+--------------+------------------+
| Tname        | Cname            |
+--------------+------------------+
| HuangYaoshi  | Hamagong         |
| Miejueshitai | TaiJiquan        |

显示每一个课程及其相关的老师，没有老师教授的课程将其老师显示为空
mysql> SELECT t.Tname,c.Cname FROM tutors AS t RIGHT JOIN courses AS c ON t.TID=c.TID; 
+--------------+------------------+
| Tname        | Cname            |
+--------------+------------------+
| HuangYaoshi  | Hamagong         |
| Miejueshitai | TaiJiquan        |

显示每位同学的名称，所学CID1课程的课程名及其讲授了相关课程的老师的名称
mysql> SELECT Name,Cname,Tname FROM students,courses,tutors WHERE students.CID1=courses.CID AND courses.TID=tutors.TID;
+--------------+------------------+--------------+
| Name         | Cname            | Tname        |
+--------------+------------------+--------------+
| GuoJing      | TaiJiquan        | Miejueshitai |
| YangGuo      | TaiJiquan        | Miejueshitai |
```



### 視圖

```shell
视图是存儲下來的SELECT語句，基於基表的查詢結果

mysql> CREATE VIEW sct AS SELECT Name,Cname,Tname FROM students,courses,tutors WHERE students.CID1=courses.CID AND courses.TID=tutors.TID;      
Query OK, 0 rows affected (0.00 sec)
# 創建視圖，视图的名字叫sct
mysql> SHOW TABLES;
+------------------+
| Tables_in_jiaowu |
+------------------+
| courses          |
| scores           |
| sct              |
# 查看發現視圖被當作一張表了
mysql> SELECT * FROM sct;
+--------------+------------------+--------------+
| Name         | Cname            | Tname        |
+--------------+------------------+--------------+
| GuoJing      | TaiJiquan        | Miejueshitai |
| YangGuo      | TaiJiquan        | Miejueshitai |
# 雖然用了*，但還是用了上面的創建視圖的語句中的SELCET部分
# 一般不建議向視圖中插入數據，視圖也被稱為虛表，視圖所依賴的表叫基表。視圖上不會有索引
mysql> DROP VIEW sct;
Query OK, 0 rows affected (0.00 sec)
# 刪除sct視圖
# 物化視圖：可將查詢結果保存下來。SELECT，mysql上不建議使用視圖
```



### SET 设定

```shell
语法
SET GLOBAL | SESSION 變量名 = 'value';

mysql> SET tx_isolation='READ-UNCOMMITTED';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @@tx_isolation;
+------------------+
| @@tx_isolation   |
+------------------+
| READ-UNCOMMITTED |
+------------------+
1 row in set (0.00 sec)
# 查看某個特定變量的值
```

