---
title: docker使用
date: 2018-09-20 14:26:06
tags: docker
categories: 容器
---



# 基本运行方式

## 搜索

```shell
docker search centos
#搜索centos镜像
NAME                               DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
centos                             The official build of CentOS.                   4726                [OK]                
ansible/centos7-ansible            Ansible on Centos7                              118                                     [OK]
jdeathe/centos-ssh                 CentOS-6 6.10 x86_64 / CentOS-7 7.5.1804 x86…   99                                      [OK]
consol/centos-xfce-vnc             Centos container with "headless" VNC session…   63                                      [OK]
imagine10255/centos6-lnmp-php56    centos6-lnmp-php56                              45                                      [OK]
```

## 下载

```shell
docker pull guyton/centos6
#下载guyton/centos6镜像，官方没有普通的centos6镜像
```

## 运行

```shell
docker run -it guyton/centos6 bash
#这是最简单的运行方式。此命令可以运行多次，每运行一次，就是创建一个新的容器。选项功能如下
#-i：交互式操作；-t：终端。我们这里打算进入bash执行一些命令并查看返回结果，因此我们需要交互式终端。bash：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 bash 。
```

## 查看

```shell
* 查看正在运行的容器
docker@boot2docker:~$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
1cd2b28b4f21        guyton/centos6      "bash"              24 seconds ago      Up 23 seconds                           zen_lamarr
418cbf256f89        guyton/centos6      "bash"              5 minutes ago       Up 5 minutes                            sad_haibt
#因为运行了两次docker run -it guyton/centos6 bash，所以这里有两个容器
=======================================================================================
#标题含义：
#CONTAINER ID:容器的唯一表示ID。
#IMAGE:创建容器时使用的镜像。
#COMMAND:容器最后运行的命令。
#CREATED:创建容器的时间。
#STATUS:容器状态。
#PORTS:对外开放的端口。
#NAMES:容器名。可以和容器ID一样唯一标识容器，同一台宿主机上不允许有同名容器存在，否则会冲突。
=======================================================================================
* 查看所有容器
docker@boot2docker:~$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
1cd2b28b4f21        guyton/centos6      "bash"              2 minutes ago       Exited (0) 8 seconds ago                       zen_lamarr
f2da3e7678a4        guyton/centos6      "bash"              4 minutes ago       Exited (0) 2 minutes ago                       festive_davinci
418cbf256f89        guyton/centos6      "bash"              7 minutes ago       Up 7 minutes                                   sad_haibt
#可从STATUS列看出只有一个运行，另外两个已停止

* 查看最新创建的容器，只列出最后创建的
docker@boot2docker:~$ docker ps -l
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
1cd2b28b4f21        guyton/centos6      "bash"              5 minutes ago       Exited (0) 3 minutes ago                       zen_lamarr

* 列出最后创建的x个容器
docker@boot2docker:~$ docker ps -n=2
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
1cd2b28b4f21        guyton/centos6      "bash"              6 minutes ago       Exited (0) 4 minutes ago                       zen_lamarr
f2da3e7678a4        guyton/centos6      "bash"              8 minutes ago       Exited (0) 6 minutes ago                       festive_davinci
#:-n=x选项，会列出最后创建的x个容器

```

## 启动

```shell
* 语法：
docker start docker_name
docker start docker_ID

* 例：
docker@boot2docker:~$ docker start f2da3e7678a4
f2da3e7678a4
docker@boot2docker:~$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
f2da3e7678a4        guyton/centos6      "bash"              10 minutes ago      Up 2 seconds                            festive_davinci
418cbf256f89        guyton/centos6      "bash"              14 minutes ago      Up 13 minutes                           sad_haibt
docker@boot2docker:~$ docker start zen_lamarr
zen_lamarr
docker@boot2docker:~$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
1cd2b28b4f21        guyton/centos6      "bash"              9 minutes ago       Up 4 seconds                            zen_lamarr
f2da3e7678a4        guyton/centos6      "bash"              11 minutes ago      Up About a minute                       festive_davinci
418cbf256f89        guyton/centos6      "bash"              15 minutes ago      Up 15 minutes                           sad_haibt
#第一个是通过ID启动的，第二个通过name启动
```

## 终止

```shell
* 语法：
docker stop [NAME]/[CONTAINER ID]:将容器退出。
docker kill [NAME]/[CONTAINER ID]:强制停止一个容器。
```

## 删除

```shell
* 语法
docker rm [NAME]/[CONTAINER ID]:不能够删除一个正在运行的容器，会报错。需要先停止容器。

* 例：
docker rm 'docker ps -a -q'
#-a标志列出所有容器，-q标志只列出容器的ID，然后传递给rm命令，依次删除容器。
#一次性删除：docker本身没有提供一次性删除操作，但是可以使用如上命令实现
```

## 进入

```shell
docker@boot2docker:~$ docker attach 1cd2b28b4f21
#使用attach通过ID进入docker

docker@boot2docker:~$ docker exec -it f2da3e7678a4 /bin/bash
#使用exec参数进入
```

## 退出

```shell
1. exit（命令）：退出后，这个容器也就消失了，容器销毁ps查不到
2. Ctrl+D（快捷方式）：退出后，这个容器也就消失了,容器销毁ps查不到	
3. 先按Ctrl+P;再按Ctrl+Q（快捷方式）：退出容器，ps能查到，还在后台运行
```

## 端口暴露

```shell
docker run -d -P training/webapp
#docker自动在host上打开49000到49900的端口，映射到容器（由镜像指定，或者--expose参数指定）的暴露端口
docker run -d -p 5000:80 training/webapp
#host上5000号端口，映射到容器暴露的80端口
docker run -d -p 127.0.0.1:5000:80 training/webapp
#host上127.0.0.1:5000号端口，映射到容器暴露的80端口
docker run -d -p 127.0.0.1::5000 training/webapp
#host上127.0.0.1:随机端口，映射到容器暴露的80端口
docker run -d -p 127.0.0.1:5000:5000/udp training/webapp
#绑定udp端口
docker run -it --privileged --name test --hostname test -p 8080:80 centos
#测试发现，在创建时要使用-it选项，不然之后使用docker start 命令是不能启动容器的，原因待查。--name指定容器名，--hostname指定容器内的主机名
=======================================================================================
docker run选项：
Usage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
  -a, --attach=[]            登录容器（以docker run -d启动的容器）
  -c, --cpu-shares=0         设置容器CPU权重，在CPU共享场景使用
  --cap-add=[]               添加权限，权限清单详见：http://linux.die.net/man/7/capabilities
  --cap-drop=[]              删除权限，权限清单详见：http://linux.die.net/man/7/capabilities
  --cidfile=""               运行容器后，在指定文件中写入容器PID值，一种典型的监控系统用法
  --cpuset=""                设置容器可以使用哪些CPU，此参数可以用来容器独占CPU
  -d, --detach=false         指定容器运行于前台还是后台，-d表示在后台运行
  --device=[]                添加主机设备给容器，相当于设备直通
  --dns=[]                   指定容器的dns服务器
  --dns-search=[]            指定容器的dns搜索域名，写入到容器的/etc/resolv.conf文件
  -e, --env=[]               指定环境变量，容器中可以使用该环境变量
  --entrypoint=""            覆盖image的入口点
  --env-file=[]              指定环境变量文件，文件格式为每行一个环境变量
  --expose=[]                指定容器暴露的端口，即修改镜像的暴露端口
  -h, --hostname=""          指定容器的主机名
  -i, --interactive=false    打开STDIN，用于控制台交互
  --link=[]                  指定容器间的关联，使用其他容器的IP、env等信息
  --lxc-conf=[]              指定容器的配置文件，只有在指定--exec-driver=lxc时使用
  -m, --memory=""            指定容器的内存上限
  --name=""                  指定容器名字，后续可以通过名字进行容器管理，links特性需要使用名字
  --net="bridge"             容器网络设置，待详述
  -P, --publish-all=false    指定容器暴露的端口，待详述
  -p, --publish=[]           指定容器暴露的端口，待详述
  --privileged=false         指定容器是否为特权容器，特权容器拥有所有的capabilities
  --restart=""               指定容器停止后的重启策略，待详述
  --rm=false                 指定容器停止后自动删除容器(不支持以docker run -d启动的容器)
  --sig-proxy=true           设置由代理接受并处理信号，但是SIGCHLD、SIGSTOP和SIGKILL不能被代理
  -t, --tty=false            分配tty设备，该可以支持终端登录
  -u, --user=""              指定容器的用户
  -v, --volume=[]            给容器挂载存储卷，挂载到容器的某个目录
  --volumes-from=[]          给容器挂载其他容器上的卷，挂载到容器的某个目录
  -w, --workdir=""           指定容器的工作目录
```

## 测试

```shell
docker run --name nginx1 -p 8081:80 -itd nginx
#创建容器，暴露端口。之后可以通过192.168.99.100:8081访问nginx测试页
docker exec -it nginx1 /bin/bash
#进入nginx1容器中
```







