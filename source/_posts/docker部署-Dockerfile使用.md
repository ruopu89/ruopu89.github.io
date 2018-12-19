---
title: docker部署-Dockerfile使用
date: 2018-11-29 14:32:28
tags: docker
categories: Container
---

### Dockerfile测试

#### 定制基础镜像

```shell
* 测试一
mkdir -p /root/apache_centos
cd /root/apache_centos
vim run.sh
    #!/bin/bash
    /usr/sbin/sshd &
    /usr/local/apache2/bin/httpd -D FOREGROUND
vim Dockerfile
    FROM centos
    RUN yum install -y wget
    WORKDIR /usr/local/src 	# 使用WORKDIR是为了切换目录
    RUN wget http://apache.fayea.com/httpd/httpd-2.4.37.tar.gz
    RUN tar -zxvf httpd-2.4.37.tar.gz
    WORKDIR httpd-2.4.37	
    RUN yum install -y gcc make apr-devel apr apr-util apr-util-devel pcre-devel
    RUN ./configure --prefix=/usr/local/apache2  --enable-mods-shared=most  --enable-so
    RUN make
    RUN make install
    RUN sed -i 's/#ServerName www.example.com:80/ServerName localhost:80/g' /usr/local/apache2/conf/httpd.conf
    RUN /usr/local/apache2/bin/httpd
    ADD run.sh /usr/local/sbin/run.sh
    RUN chmod 755 /usr/local/sbin/run.sh
    EXPOSE 80
    CMD ["/usr/local/sbin/run.sh"]
docker build -t apache_dockerfile:centos .
# 生成镜像。这样创建镜像的问题就是使用了太多的RUN命令，Dockerfile 中每一个指令都会建立一层，RUN也不例外。每一个RUN的行为都会新建立一层，在其上执行这些命令，执行结束后，commit这一层的修改，构成新的镜像。这样创建镜像大概需要十多层

* 测试二
# 使用Dockerfile文件，简化RUN命令
vim Dockerfile
    FROM centos
    RUN buildDeps='wget gcc make apr-devel apr apr-util apr-util-devel pcre-devel' \
    # 这一步非常重要，如果不将要安装的包定义在变量中，下面的yum命令将无法进行，yum会将之后的所有命令都当作要安装的包。
        && yum install -y $buildDeps \
        && cd /usr/local/src \
        && wget http://apache.fayea.com/httpd/httpd-2.4.37.tar.gz \
        && tar -zxvf httpd-2.4.37.tar.gz \
        && cd httpd-2.4.37 \
        && ./configure --prefix=/usr/local/apache2  --enable-mods-shared=most  --enable-so \
        && make \
        && make install \
        && sed -i 's/#ServerName www.example.com:80/ServerName localhost:80/g' /usr/local/apache2/conf/httpd.conf \
        && /usr/local/apache2/bin/httpd
    COPY run.sh /usr/local/sbin/run.sh
    RUN chmod 755 /usr/local/sbin/run.sh
    EXPOSE 80
    CMD ["/usr/local/sbin/run.sh"]
docker build -t apache_dockerfile:centos .

* 测试三
# 加入构建后的清除动作
vim Dockerfile
    FROM centos
    RUN buildDeps='wget gcc make apr-devel apr apr-util apr-util-devel pcre-devel' \
        && yum install -y $buildDeps \
        && cd /usr/local/src \
        && wget http://apache.fayea.com/httpd/httpd-2.4.37.tar.gz \
        && tar -zxvf httpd-2.4.37.tar.gz \
        && cd httpd-2.4.37 \
        && ./configure --prefix=/usr/local/apache2  --enable-mods-shared=most  --enable-so \
        && make \
        && make install \
        && yum clean all \	# 清除所有yum缓存
        && rm -rf /usr/local/src/httpd-2.4.37.tar.gz \
        && rm -rf /usr/local/src/httpd-2.4.37 \
        # 删除下载的包
        && sed -i 's/#ServerName www.example.com:80/ServerName localhost:80/g' /usr/local/apache2/conf/httpd.conf \
        && /usr/local/apache2/bin/httpd
    COPY run.sh /usr/local/sbin/run.sh
    RUN chmod 755 /usr/local/sbin/run.sh
    EXPOSE 80
    CMD ["/usr/local/sbin/run.sh"]
docker build -t apache_dockerfile:centos .
docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
apache_dockerfile2   centos              ad579e67578a        23 minutes ago      304MB
apache_dockerfile1   centos              cce4dadd883f        41 minutes ago      446MB
apache_dockerfile    centos              de4da4d57f3e        About an hour ago   545MB
centos               latest              75835a67d134        7 weeks ago         200MB
# 可以看到，基础镜像centos只有200M，第一次构建后有545M，减少RUN命令使用后的构建较第一次少了近100M，如果删除缓存与安装包后，镜像较第一次构建少了200多M。
root@test:~/apache_centos# docker run -d -p 8000:80 apache_dockerfile2:centos /usr/local/sbin/run.sh
09e9cc066eaf250ea4fa18e8a7755c666d308267dcc3f2e4c40f9d4941fb94c5
# 创建镜像
root@test:~/apache_centos# curl localhost:8000
<html><body><h1>It works!</h1></body></html>
# 访问测试
```

#### 创建mysql镜像

```shell
# 测试一
* 准备Dockerfile文件
mkdir /root/mysql
cd /root/mysql
vim Dockerfile
    FROM mysql:5.7
    ENV MYSQL_ALLOW_ENPTY_PASSWORD yes
    COPY setup.sh schema.sql privileges.sql /mysql/
    CMD ["sh", "/mysql/setup.sh"]
# 下载mysql:5.7镜像；ENV MYSQL_ALLOW_ENPTY_PASSWORD yes表示可以免密码登录，这是为了方便导入数据，导入后会再设置密码；复制脚本与sql脚本到容器；最后启动容器。这个mysql:5.7是安装在Debian9系统中的

* 准备脚本
vim setup.sh
    #!/bin/bash
    #
    set -e
    echo `service mysql status`
    echo '1. startup mysql...'
    service mysql start
    sleep 3
    echo `service mysql status`
    echo '2. inputing...'
    mysql < /mysql/schema.sql
    echo '3. input OK'
    sleep 3
    echo `service mysql status`
    echo '4. setpassword'
    mysql < /mysql/privileges.sql
    echo '5. setpasswordOK'
    sleep 3
    echo `service mysql status`
    echo `mysql_container_OK`
   
# 启动mysql与导入数据。set -e表示如果任何语句的执行结果不是true则应该退出。写这些echo是为了之后使用docker logs可以查看到相关日志，便于排错。
* 准备sql脚本
vim schema.sql
    CREATE database `docker_mysql` default character set utf8 collate utf8_general_ci;

    USE docker_mysql;

    DROP TABLE IF EXISTS `user`;

    CREATE TABLE `user` (
      `id` bigint(20) NOT NULL,
      `created_at` bigint(40) DEFAULT NULL,
      `last_modified` bigint(40) DEFAULT NULL,
      `email` varchar(255) DEFAULT NULL,
      `first_name` varchar(255) DEFAULT NULL,
      `last_name` varchar(255) DEFAULT NULL,
      `username` varchar(255) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

    INSERT INTO `user` (`id`, `created_at`, `last_modified`, `email`, `first_name`, `last_name`, `username`)
    VALUES (0,1490257904,1490257904,'john.doe@example.com','John','Doe','user');
# 创建一个docker_mysql库、user表，加入一条测试数据
vim privileges.sql
    USE mysql;
    SELECT host, user from user;
    CREATE user docker identified by '123456';
    GRANT all on docker_mysql.* to docker@'%' identified by '123456' with grant option;
    flush privileges;
# 创建用户并设置密码及权限。with grant option表示它具有grant权限

* 构建镜像、启动容器
docker build -t mysqltest:test .
# 构建镜像
docker images
docker run -d -p 13306:3306 --name testmysql mysqltest:test
# 创建容器，创建容器时最好把库名与标签名都写全
docker logs -t 7f78ca1
# 查看日志
docker inspect --format '{{ .NetworkSettings.IPAddress }}' 7f78ca1
# 查看容器IP地址
docker exec -it 7f78ca1 bash
# 进入容器
mysql -udocker -p123456
# 到容器中再进入容器中的mysql
SHOW DATABASES;
use docker_mysql
SHOW TABLES;
SELECT * FROM user;

# 测试二
mkdir /root/jdycmysql
cd /root/jdycmysql
vim Dockerfile
    FROM mysql:5.7
    ENV MYSQL_ALLOW_ENPTY_PASSWORD yes
    COPY setup.sh echarging.sql user.sql /mysql/
    COPY my.cnf /etc/mysql/
    CMD ["sh", "/mysql/setup.sh"]
# 容器中的mysql配置文件在/etc/mysql中，echarging.sql是要用的数据库，user.sql是改密码与权限所用
vim setup.sh
    #!/bin/bash
    #
    #set -e
    echo `service mysql status`
    echo '1. startup mysql...'
    service mysql start
    sleep 3
    echo '1.1 createing...'
    /usr/bin/mysql -e "create database echarging"
    echo 'create OK!!!!!!!'
    sleep 3
    echo `service mysql status`
    echo '2. inputing...'
    mysql echarging < /mysql/echarging.sql
    echo '3. input OK'
    sleep 3
    echo `service mysql status`
    echo '4. setpassword'
    mysql < /mysql/user.sql
    echo '5. setpasswordOK'
    sleep 3
    echo `service mysql status`
    echo `mysql_container_OK`
# 因为set -e在返回错误代码时就会退出脚本，所以这里注释了，因为导入数据库时可能会有报错。因为echarging.sql中没有创建数据库的命令，所以这里加入了创建数据库的命令，并且在导入时也指定了数据库，如果不写明这两项，在导入数据库时都会报找不到数据库的错误。
vim my.cnf
    [client]
    default-character-set = utf8mb4
    [mysqld]
    init-connect = 'SET NAMES utf8mb4'
    character-set-server = utf8mb4
vim user.sql
    USE mysql
    GRANT all on *.* to echarge@'%' identified by 'CCjd1rj@com' with grant option;
    GRANT all on *.* to root@'%' identified by 'CCjd1rj@com' with grant option;
    flush privileges;
# 新建一个用户并设置root用户与新建用户的密码与权限。
docker build -t jdycm:Jmysql .
dcoker run -d -p 3306:3306 --name jdycmysql jdycm:Jmysql
watch 'docker logs -t jdycmysql'
    2018-11-30T08:57:34.924250376Z MySQL Community Server 5.7.24 is not running.
    2018-11-30T08:57:34.924304852Z 1. startup mysql...
    2018-11-30T08:57:35.082746075Z 2018-11-30T08:57:35.078891Z 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timesta
    mp server option (see documentation for more details).
    2018-11-30T08:57:35.281231444Z 2018-11-30T08:57:35.280868Z 0 [Warning] InnoDB: New log files created, LSN=45790
    2018-11-30T08:57:35.330693896Z 2018-11-30T08:57:35.330333Z 0 [Warning] InnoDB: Creating foreign key constraint system tables.
    2018-11-30T08:57:35.390385937Z 2018-11-30T08:57:35.389987Z 0 [Warning] No existing UUID has been found, so we assume that this is the first time that this server has
    been started. Generating a new UUID: fafeea4e-f47d-11e8-87e6-0242ac110003.
    2018-11-30T08:57:35.391824469Z 2018-11-30T08:57:35.391529Z 0 [Warning] Gtid table is not ready to be used. Table 'mysql.gtid_executed' cannot be opened.
    2018-11-30T08:57:35.393019043Z 2018-11-30T08:57:35.392585Z 1 [Warning] root@localhost is created with an empty password ! Please consider switching off the --initiali
    ze-insecure option.
    2018-11-30T08:57:41.396343436Z ..
    2018-11-30T08:57:41.396406084Z MySQL Community Server 5.7.24 is started.
    2018-11-30T08:57:44.399015302Z 1.1 createing...
    2018-11-30T08:57:44.410619098Z create OK!!!!!!!
    2018-11-30T08:57:47.486484333Z MySQL Community Server 5.7.24 is running.
    2018-11-30T08:57:47.486554105Z 2. inputing...
    2018-11-30T09:05:59.990855328Z 3. input OK
    2018-11-30T09:06:03.065787206Z MySQL Community Server 5.7.24 is running.
    2018-11-30T09:06:03.065853836Z 4. setpassword
    2018-11-30T09:06:03.077077343Z 5. setpasswordOK
    2018-11-30T09:06:06.151459148Z MySQL Community Server 5.7.24 is running.
    2018-11-30T09:06:06.151902503Z /mysql/setup.sh: 1: /mysql/setup.sh: mysql_container_OK: not found
    2018-11-30T09:06:06.151989387Z
docker exec -it 901fc12e6e48 bash
mysql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| echarging          |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.01 sec)

mysql> use echarging
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+-----------------------------+
| Tables_in_echarging         |
+-----------------------------+
| area_dictionary             |
| assistant_user              |
| charge_record               |
| communication_board_version |

```

