---
title: MongoDB安装
date: 2019-03-06 15:54:47
tags: MongoDB安装
categories: MongoDB
---

### 安装与启动

```shell
============================================================================================
环境：
一台主机，地址：192.168.251.129
============================================================================================
[root@test ~]# cat >> /etc/rc.local <<'EOF'
if test -f /sys/kernel/mm/transparent_hugepage/enabled; then
  echo never > /sys/kernel/mm/transparent_hugepage/enabled
fi
if test -f /sys/kernel/mm/transparent_hugepage/defrag; then
   echo never > /sys/kernel/mm/transparent_hugepage/defrag
fi
EOF
# 该方法仅限与CentOS系统使用。Transparent Huge Pages (THP)，通过使用更大的内存页面，可以减少具有大量内存的机器上的缓冲区（TLB）查找的开销。但是，数据库工作负载通常对THP表现不佳，因为它们往往具有稀疏而不是连续的内存访问模式。您应该在Linux机器上禁用THP，以确保MongoDB的最佳性能。
[root@test ~]# wget http://downloads.mongodb.org/linux/mongodb-linux-x86_64-rhel62-3.2.8.tgz
[root@test ~]# tar xf mongodb-linux-x86_64-rhel62-3.2.8.tgz
[root@test ~]# mv mongodb-linux-x86_64-rhel62-3.2.8 /usr/local/mongodb
[root@test ~]# mkdir /usr/local/mongodb/{log,data,conf}
[root@test ~]# vim .bash_profile
export PATH=/usr/local/mongodb/bin:$PATH
[root@test ~]# source .bash_profile
[root@test ~]# mongod --dbpath=/usr/local/mongodb/data/ --logpath=/usr/local/mongodb/log/mongodb.log --port=27017 --logappend --fork
# 启动服务。默认的数据库路径是/data/db，如果单独指定数据库路径的话，一定要创建这个数据目录，不然启动会失败，使用mongod就可以直接启动服务。
# --dbpath：数据存放路径；--logpath：日志文件路径；--logappend：日志输出方式；--port：启用端口号；--fork：在后台运行；--auth：是否需要验证权限登录(用户名和密码)；--bind_ip：限制访问的ip；--shutdown：关闭数据库；--rest：通过HTTP访问用户界面。默认mongodb监听在27017端口，web页面监听28017端口。
about to fork child process, waiting until server is ready for connections.
forked process: 5118
child process started successfully, parent exiting
[root@test ~]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128               *:22                            *:*                  
LISTEN     0      100       127.0.0.1:25                            *:*                  
LISTEN     0      128               *:27017                         *:* 
[root@test ~]# mongod --shutdown --dbpath=/usr/local/mongodb/data/ --logpath=/usr/local/mongodb/log/mongodb.log --port=27017 --logappend --fork
killing process with pid: 5118
# 关闭服务
```



### 配置

```shell
==========
   普通格式
==========
[root@test ~]# vim /usr/local/mongodb/conf/mongod1.conf
[root@test ~]# mongod -f /usr/local/mongodb/conf/mongod1.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 5201
child process started successfully, parent exiting
# 启动
[root@test ~]# mongod -f /usr/local/mongodb/conf/mongod1.conf --shutdown
killing process with pid: 5201
# 关闭

==========
   YAML格式
==========
# 3.X 版本官方推荐使用
[root@test ~]# vim /usr/local/mongodb/conf/mongod.conf
systemLog:
    destination: file
    path: "/usr/local/mongodb/log/mongod.log"
    logAppend: true
storage:
    journal:
        enabled: true
    dbPath: "/usr/local/mongodb/data"
processManagement:
    fork: true
net:
    port: 27017
# 注意有空格的行，都是四个空格或八个空格，不要使用Tab键，启动时可能会报错："Error parsing YAML config file: yaml-cpp: error at line 7, column 2: end of map not found"
[root@test ~]# mongod -f /usr/local/mongodb/conf/mongod.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 5250
child process started successfully, parent exiting
```

