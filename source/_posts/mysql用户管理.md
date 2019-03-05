---
title: mysql用户管理
date: 2019-01-03 23:27:35
tags: mysql用户管理
categories: MySQL
---

#### mysql用户密码修改方法

```shell
方法一
[root@test ~]# mysql_secure_installation 

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MySQL
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MySQL to secure it, we'll need the current
password for the root user.  If you've just installed MySQL, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none): 
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MySQL
root user without the proper authorisation.

Set root password? [Y/n] y       
New password: 
Re-enter new password: 
Password updated successfully!
Reloading privilege tables..
 ... Success!

By default, a MySQL installation has an anonymous user, allowing anyone
to log into MySQL without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] y
 ... Success!

By default, MySQL comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] y
 - Dropping test database...
ERROR 1008 (HY000) at line 1: Can't drop database 'test'; database doesn't exist
 ... Failed!  Not critical, keep moving...
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] y
 ... Success!

All done!  If you've completed all of the above steps, your MySQL
installation should now be secure.

Thanks for using MySQL!

Cleaning up...
# 第一次启动后设置root密码、删除匿名用户、拒绝远程连接、删除测试库、重新加载数据库
mysql> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
# 进入mysql库

mysql> select Host,User,Password from user;
+-----------+------+-------------------------------------------+
| Host      | User | Password                                  |
+-----------+------+-------------------------------------------+
| localhost | root | *128977E278358FF80A246B5046F51043A2B1FCED |
| 127.0.0.1 | root | *128977E278358FF80A246B5046F51043A2B1FCED |
| ::1       | root | *128977E278358FF80A246B5046F51043A2B1FCED |
+-----------+------+-------------------------------------------+
3 rows in set (0.00 sec)
# 查看用户信息
mysql> SET PASSWORD FOR 'root'@'localhost' =password('123456');
Query OK, 0 rows affected (0.00 sec)
# 改地址为localhost的root密码为123456
mysql> select Host,User,Password from user;
+-----------+------+-------------------------------------------+
| Host      | User | Password                                  |
+-----------+------+-------------------------------------------+
| localhost | root | *6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9 |
| 127.0.0.1 | root | *128977E278358FF80A246B5046F51043A2B1FCED |
| ::1       | root | *128977E278358FF80A246B5046F51043A2B1FCED |
+-----------+------+-------------------------------------------+
3 rows in set (0.00 sec)
# 再次查看密码，localhost的root用户密码和另两个不一样了。

方法二
mysql> UPDATE mysql.user SET PASSWORD=PASSWORD('123456') WHERE User='root' AND Host='localhost';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
# 改localhost地址的root用户的密码为123456，如果WHERE后面不指定地址，就是修改所有地址的root用户密码
mysql> SELECT Host,User,Password FROM user;
+-----------+------+-------------------------------------------+
| Host      | User | Password                                  |
+-----------+------+-------------------------------------------+
| localhost | root | *6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9 |
| 127.0.0.1 | root | *128977E278358FF80A246B5046F51043A2B1FCED |
| ::1       | root | *128977E278358FF80A246B5046F51043A2B1FCED |
+-----------+------+-------------------------------------------+
3 rows in set (0.01 sec)

方法三
[root@test ~]# mysqladmin -uroot -hlocalhost password 'centos' -p      
Enter password: 
Warning: Using a password on the command line interface can be insecure.
# 改localhost地址的root用户密码为centos，下面会提示“在命令行使用密码可能不安全”
```



#### 创建用户

```shell
方法一
CREATE USER username@host [IDENTIFIED BY ‘password’]

mysql> CREATE USER cactiuser@'%' IDENTIFIED BY 'cactiuser';
Query OK, 0 rows affected (0.01 sec)

mysql> SHOW GRANTS FOR cactiuser@'%';
+----------------------------------------------------------------------------------------------------------+
| Grants for cactiuser@%                                                                                   |
+----------------------------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO 'cactiuser'@'%' IDENTIFIED BY PASSWORD '*43DD7940383044FBDE5B177730FAD3405BC6DAD7' |
+----------------------------------------------------------------------------------------------------------+
# 查看用戶權限授權信息
[root@test ~]# mysql -ucactiuser -p
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
+--------------------+
mysql> CREATE DATABASE cactiuser;
ERROR 1044 (42000): Access denied for user 'cactiuser'@'%' to database 'cactiuser'
# 要用root用户才能创建此库或给cactiuser一个创建的权限

方法二
INSERT INTO mysql.user
mysql>FLUSH PRIVILEGES;            
# 這條必須執行
```

##### 创建用户并授权

```shell
语法：
GRANT ALL PRIVILEGES ON db.* TO username@'%' WITH_OPTION;
GRANT EXECUTE ON FUNCTION db.abc TO username@'%';
with_option：
        GRANT OPTION    
        # 可以將自己獲得的權限給別人
        MAX_QUERIES_PER_HOUR count             
        # 每小時最多允許發起多少次查詢
        MAX_UPDATES_PER_HOUR count            
        # 每小時只允許使用幾次UPDATES
        MAX_CONNECTIONS_PER_HOUR count 
        # 每小時只允許發起幾個連接請求
        MAX_USER_CONNECTIONS count            
        # 同一帳號最多連接多少次

mysql> GRANT CREATE ON cactidb.* TO 'cactiuser'@'%' WITH GRANT OPTION;
# 給用戶cactiuser創建cactidb庫及在cactidb庫中創建表的權限；CREATE的權限是建庫、表、索引等；WITH GRANT OPTION表示此用户可以将自己的权限给自己创建的用户，但此用户无法操作mysql.user表，所以此项无用。

mysql> GRANT INSERT ON cactidb.* TO 'cactiuser'@'%';
# 給用戶插入權限，INSERT權限既可以在表級別也可以用在字段級別，這樣寫是用在表級別的，給予此類權限後要重新登陸才能生效，FLUSH PRIVILEGES;是沒有用的，因爲cactiuser沒有此權限。

mysql> GRANT SELECT ON cactidb.* TO 'cactiuser'@'%';
# 给cactiuser@%用户SELECT查询权限

mysql> GRANT SELECT,INSERT,CREATE ON cactidb.* TO 'cactiuser'@'%' IDENTIFIED BY 'centos';
# 用一个命令给上面三个权限，并设置密码

mysql> GRANT ALTER ON cactidb.* TO 'cactiuser'@'%';
# 給用戶ALTER權限，重新登陸生效

mysql> RENAME USER cactiuser TO cactiu;
# 給用戶重命名
```

##### 查看用户权限

```shell
mysql> SHOW GRANTS FOR 'cactiuser'@'%';
# 查看用戶都有哪些權限
```

##### 取消权限

```shell
mysql> REVOKE SELECT ON cactidb.* FROM 'cactiuser'@'%';
# 取消某個權限
```



#### 删除用户

```shell
mysql> DROP USER 'root'@'::1';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT Host,User,Password FROM mysql.user;
+-----------+------+-------------------------------------------+
| Host      | User | Password                                  |
+-----------+------+-------------------------------------------+
| localhost | root | *128977E278358FF80A246B5046F51043A2B1FCED |
| 127.0.0.1 | root | *128977E278358FF80A246B5046F51043A2B1FCED |
+-----------+------+-------------------------------------------+
2 rows in set (0.00 sec)
# 删除IPV6地址的root用户
```



#### mysql管理員密碼忘記找回

```shell
CentOS7
[root@test ~]# systemctl stop mysql
[root@test ~]# vim /usr/lib/systemd/system/mysqld.service
ExecStart=/usr/bin/mysqld_safe --basedir=/usr --skip-grant-tables --skip-network
ing
# 加入后面两个选项。实现跳过授权表和网络
[root@test ~]# systemctl daemon-reload
# 重新加载
[root@test ~]# systemctl start mysql
[root@test ~]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
mysql> UPDATE mysql.user SET PASSWORD=PASSWORD('centos') WHERE User='root';
Query OK, 1 row affected (0.00 sec)
Rows matched: 2  Changed: 1  Warnings: 0
# 修改所有地址的root用户密码
[root@test ~]# systemctl stop mysql
# 一定要先停止mysql服务再修改
[root@test ~]# vim /usr/lib/systemd/system/mysqld.service
ExecStart=/usr/bin/mysqld_safe --basedir=/usr
[root@test ~]# systemctl daemon-reload
[root@test ~]# systemctl start mysql
[root@test ~]# mysql -uroot -pcentos
Warning: Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
# 使用密码登录

CentOS6
service mysqld stop
vim /etc/init.d/mysqld
# 找到start一項，在圖片最下面的那行加入--skip-grant-tables跳過授權表和--skip-networking跳過網絡，這樣改完後只能在本機登錄。通過更新授權表方式直接修改其密碼，而後移除此兩個選項重啓服務即可。
service mysqld start 
mysql 
UPDATE user SET PASSWORD=PASSWORD(‘12345’) WHERE User=’root’; 
# 更改root用戶密碼
SELECT User,Host,Password FROM user;
# 退出mysql服務器，把剛才的配置文件改回來，再啟動服務器，改變的內容才會生效。
```

