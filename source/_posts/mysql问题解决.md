---
title: mysql问题解决
date: 2019-06-11 16:59:50
tags: mysql问题解决
categories: MySQL
---

### 登录数据库后无法对数据库操作

```shell
# 登录数据库后无法对数据库操作，使用任何命令都会提示“You must reset your password using ALTER USER statement before executing this statement.”
# 有一说是因为密码过期，所以会这样。解决方法如下：
vim /usr/lib/systemd/system/mysqld.service 
ExecStart=/usr/sbin/mysqld --daemonize --skip-grant-tables --skip-networking --pid-file=/var/run/mysqld/mysqld.pid $MYSQLD_OPTS
# 加入--skip-grant-tables --skip-networking，可以免密码登录
mysql
# 登录
use mysql；
desc user；
authentication_string  | text                              | YES  |     | NULL                  |       |
| password_expired       | enum('N','Y')                     | NO   |     | N 
# 说是从上面两条信息可以看出password_expired过期。
UPDATE user SET authentication_string=PASSWORD('DaaS_mysql_201!'),password_expired='N' WHERE User='root'; 
select authentication_string,password_expired from user where user='root';
+-------------------------------------------+------------------+
| authentication_string                     | password_expired |
+-------------------------------------------+------------------+
| *5ECB9CC025100F03131724B02A092F02D9417C96 | N                |
+-------------------------------------------+------------------+
desc user;
# 使用此命令又看了一次，与上面查询的没有区别。所以不知道如何证明是过期了？
# 之后将上面的免密码登录恢复回去。再操作就正常了。
```

