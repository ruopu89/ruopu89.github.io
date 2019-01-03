---
title: mysql安装与配置
date: 2019-01-03 23:05:56
tags: mysql安装与配置
categories: MySQL
---

#### 安装方法

```shell
# 下载：http://repo.mysql.com/yum/mysql-5.5-community/el/7/x86_64/，到此地址中下载mysql-community-release-el7-5.noarch.rpm，这是mysql的官方rpm源，测试速度非常慢
wget http://mirrors.ustc.edu.cn/mysql-repo/yum/mysql-5.7-community/el/7/x86_64/mysql-community-release-el7-7.noarch.rpm
# 这是科大的mysql源，速度正常。地址：http://mirrors.ustc.edu.cn/mysql-repo/yum/
yum install -y mysql-community-release-el7-7.noarch.rpm
yum install -y mysql-community-server
```

#### 配置

```shell
vim /etc/my.cnf
	[mysqld]
	skip_name_resolve=ON
	innodb_file_per_table=ON
# 加入两项
systemctl start mysql

* 不输入用户名和密码登录mysql
[root@test ~]# vim /root/.my.cnf
[client]
user='root'
password='centos'
host='localhost'
[root@test ~]# mysql
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 21
Server version: 5.6.42 MySQL Community Server (GPL)

```

