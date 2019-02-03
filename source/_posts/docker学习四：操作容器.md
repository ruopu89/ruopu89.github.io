---
title: docker学习四：操作容器
date: 2018-11-22 09:27:18
tags: docker
categories: Container
---

### 操作Docker容器

> 容器是 Docker 又一核心概念。
>
> 简单的说，容器是独立运行的一个或一组应用，以及它们的运行态环境。对应的，虚拟机可以理解为模拟运行的一整套操作系统(提供了运行态环境和其他系统环境)和跑在上面的应用。



#### 启动容器

> 启动容器有两种方式，一种是基于镜像新建一个容器并启动，另外一个是将在终止状态(stopped)的容器重新启动。

##### 新建并启动容器

```shell
root@ruopu:~# docker run ubuntu:14.04 /bin/echo 'Hello World'
Unable to find image 'ubuntu:14.04' locally
14.04: Pulling from library/ubuntu
aa1a66b8583a: Pull complete 
aaccc2e362b2: Pull complete 
a53116a2808f: Pull complete 
b3a7298e318c: Pull complete 
Digest: sha256:f961d3d101e66017fc6f0a63ecc0ff15d3e7b53b6a0ac500cd1619ded4771bd6
Status: Downloaded newer image for ubuntu:14.04
Hello World
# 新建并启动一个容器，因为本地没有ubuntu14.04的镜像，所以会先下载镜像并启动容器，并输出一个"Hello World"。运行完命令后这个容器就会终止。
root@ruopu:~# docker run ubuntu:14.04 /bin/echo 'Hello World'
Hello World
# 再次执行相同命令时就不会再下载了

root@ruopu:~# docker run -t -i ubuntu:14.04 /bin/bash
root@eb5dd3071f75:/#
# -t选项让Docker分配一个伪终端(pseudo-tty)并绑定到容器的标准输入上，-i则让容器的标准输入保持打开。
root@f55cb4d1089e:/# pwd
/
root@f55cb4d1089e:/# ls
bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
# 在交互模式下，用户可以通过所创建的终端来输入命令

============================================================================================
当利用docker run来创建容器时，Docker 在后台运行的标准操作包括：
* 检查本地是否存在指定的镜像，不存在就从公有仓库下载
* 利用镜像创建并启动一个容器
* 分配一个文件系统，并在只读的镜像层外面挂载一层可读写层
* 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去
* 从地址池配置一个 ip 地址给容器
* 执行用户指定的应用程序
* 执行完毕后容器被终止
============================================================================================
```



##### 启动已终止容器

```shell
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
f55cb4d1089e        ubuntu:14.04        "/bin/bash"              6 hours ago         Up 6 hours                               competent_feistel
54b6e4618182        nginx:v2            "nginx -g 'daemon of…"   27 hours ago        Up 27 hours         0.0.0.0:81->80/tcp   web2
4fc2b542c0de        nginx               "nginx -g 'daemon of…"   28 hours ago        Exited 28 hours         0.0.0.0:80->
# 查看正在运行的已有容器，如果要查看全部容器，要在命令最后加-a选项
root@ruopu:~# docker start f55c
f55c
# 启动已终止的容器，重启可以使用restart
root@ruopu:~# docker exec -it f55c bash  
# 进入正在运行的容器
root@f55cb4d1089e:/# ps
  PID TTY          TIME CMD
   36 pts/1    00:00:00 bash
   52 pts/1    00:00:00 ps
# 可见，容器中仅运行了指定的 bash 应用。这种特点使得 Docker 对资源的利用率极高，是货真价实的轻量级虚拟化。
```



#### 后台运行

```shell
root@ruopu:~# docker run ubuntu:14.04 /bin/sh -c "while true; do echo 'hello world'; sleep 1; done"
hello world
hello world
hello world
hello world
hello world
# 如果不使用-d参数运行容器，容器会把输出的结果 (STDOUT) 打印到宿主机上面
root@ruopu:~# docker run -d ubuntu:14.04 /bin/sh -c "while true; do echo 'hello world'; sleep 1; done" 
299d22cbda4f6d648095732350572999aa6937cad2d0d20db5ab37f09340c19e
# 如果使用了-d参数运行容器，此时容器会在后台运行并不会把输出的结果 (STDOUT) 打印到宿主机上面。
root@ruopu:~# docker logs 299d22
hello world
hello world
hello world
# 输出结果可以用"docker logs 容器ID"查看。容器是否会长久运行是和docker run指定的命令有关，和-d参数无关。使用-d参数启动后会返回一个唯一的ID。
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
299d22cbda4f        ubuntu:14.04        "/bin/sh -c 'while t…"   2 minutes ago       Up 2 minutes                             sharp_booth
f55cb4d1089e        ubuntu:14.04        "/bin/bash"              6 hours ago         Up 6 hours                               competent_feistel
54b6e4618182        nginx:v2            "nginx -g 'daemon of…"   27 hours ago        Up 27 hours         0.0.0.0:81->80/tcp   web2
4fc2b542c0de        nginx               "nginx -g 'daemon of…"   28 hours ago        Up 28 hours         0.0.0.0:80->80/tcp   webserver
# 使用此命令可以查看容器的信息。
root@ruopu:~# docker container logs 299d
hello world
hello world
hello world
hello world
# 使用此命令也可以看到容器中输出的内容。logs后可以使用容器ID或容器NAMES。语法：docker container logs [container ID or NAMES]
# 当使用对容器操作的指令时，docker命令可以默认对容器进行操作，所以不加container也可以。
```

#### 终止容器

```shell
root@ruopu:~# docker container stop sharp_booth
sharp_booth
# 可以使用stop命令终止容器，容器可以用NAMES或ID指明
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
299d22cbda4f        ubuntu:14.04        "/bin/sh -c 'while t…"   7 minutes ago       Exited (137) 11 seconds ago                        sharp_booth
e06be3875296        ubuntu:14.04        "/bin/sh -c 'while t…"   9 minutes ago       Exited (0) 9 minutes ago                           recursing_vaughan
2d025ef6aa4c        ubuntu:14.04        "/bin/sh -c 'while t…"   9 minutes ago       Exited (0) 9 minutes ago                           jolly_merkle
f2e9d5847f7f        ubuntu:14.04        "/bin/sh -c 'while t…"   9 minutes ago       Exited (2) 9 minutes ago                           keen_johnson
f55cb4d1089e        ubuntu:14.04        "/bin/bash"              6 hours ago         Up 6 hours                                         competent_feistel
eb5dd3071f75        ubuntu:14.04        "/bin/bash"              7 hours ago         Exited (0) 6 hours ago                             flamboyant_edison
c43e0c0c2836        ubuntu:14.04        "/bin/echo 'Hello Wo…"   7 hours ago         Exited (0) 7 hours ago                             mystifying_nobel
9a4c0b5b979b        ubuntu:14.04        "/bin/echo 'Hello Wo…"   7 hours ago         Exited (0) 7 hours ago                             focused_stallman
54b6e4618182        nginx:v2            "nginx -g 'daemon of…"   27 hours ago        Up 27 hours                   0.0.0.0:81->80/tcp   web2
4fc2b542c0de        nginx               "nginx -g 'daemon of…"   28 hours ago        Up 28 hours                   0.0.0.0:80->80/tcp   webserver
c17f952574b5        hello-world         "/hello"                 28 hours ago        Exited (0) 28 hours ago                            clever_bell
# 可以使用此命令查看到所有的容器，包括已停止的容器，在信息中会被标记为"Exited"。仍在运行的容器被标记为"Up"
# 如果是只启动了一个终端的容器，用户可以在容器中使用exit命令或Ctrl+d来退出终端，退出时创建的容器立刻终止。
root@ruopu:~# docker container restart f55c
f55c
# 使用restart命令可以重启容器，容器可以使用ID或NAMES指定
```



#### 进入容器

##### attach命令（不建议使用）

```shell
root@ruopu:~# docker run -dit ubuntu:14.04
64dda1b25fac61f165a0c7ab7c7807f9adf7ac173cdbdc907b0815d796ae0473
# 在后台启动一个容器
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                NAMES
64dda1b25fac        ubuntu:14.04        "/bin/bash"              About a minute ago   Up About a minute                        gifted_swartz
# 查看已启动的容器
root@ruopu:~# docker attach 64dd
root@64dda1b25fac:/#
# 使用attach进入容器。此时如果使用exit退出容器，那么会导致容器的停止。
root@64dda1b25fac:/# exit
exit
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
64dda1b25fac        ubuntu:14.04        "/bin/bash"              5 minutes ago       Exited (0) 13 seconds ago                          gifted_swartz
# 查看显示容器已停止
```



##### exec命令（建议使用）

```shell
root@ruopu:~# docker run -dit ubuntu:14.04
c063d378b1191193d70d44c8fcb7a81e3e5bf0ab8a2f2cb1db4d526b6b510005
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              15 seconds ago      Up 15 seconds                            agitated_hopper
root@ruopu:~# docker exec -i c063 bash

ls
bin
boot
dev
...
# 只用-i参数时，由于没有分配伪终端，界面没有我们熟悉的Linux命令提示符，但命令执行结果仍然可以返回。直接输入命令就会返回结果。
root@ruopu:~# docker exec -it c063 bash
root@c063d378b119:/#
# 当-i、-t参数一起使用时，则可以看到我们熟悉的 Linux 命令提示符。
root@c063d378b119:/# exit
exit
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              4 minutes ago       Up 4 minutes                             agitated_hopper
# 如果使用exit退出容器，不会导致容器的停止。
```



#### 导出、导入容器

##### 导出容器

```shell
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
9a4c0b5b979b        ubuntu:14.04        "/bin/echo 'Hello Wo…"   7 hours ago         Exited (0) 7 hours ago                             focused_stallman
root@ruopu:~# docker export 9a4c0b5b979b > ubuntu.tar
# 这样就将容器快照导出到本地文件
```



##### 导入容器快照

```shell
root@ruopu:~# cat ubuntu.tar | docker import - test/ubuntu:v1.0
sha256:34a66c78f8af873bd07ab5b53073b4b2fbfd0a53cece350b54be9ef9910925ad
root@ruopu:~# docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
test/ubuntu         v1.0                34a66c78f8af        11 seconds ago      175MB
# 导入容器，容器的REPOSITORY是test/ubuntu，TAG是v1.0

root@ruopu:~# docker import http://example.com/exampleimage.tgz example/imagerepo
# 也可以通过指定URL或某个目录来导入
# 用户既可以使用docker import来导入镜像存储文件到本地镜像库，也可以使用docker load来导入一个容器快照到本地镜像库。这两者的区别在于容器快照文件将丢弃所有的历史记录和元数据信息(即仅保存容器当时的快照状态)，而镜像存储文件将保存完整记录，体积也要大。此外，从容器快照文件导入时可以重新指定标签等元数据信息。
```



#### 删除容器

##### 删除已停止的容器

```shell
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              14 minutes ago      Up 14 minutes                                      agitated_hopper
64dda1b25fac        ubuntu:14.04        "/bin/bash"              20 minutes ago      Exited (0) 15 minutes ago                          gifted_swartz
299d22cbda4f        ubuntu:14.04        "/bin/sh -c 'while tb"	 34 minutes ago      Exited (137) 27 minutes ago
root@ruopu:~# docker container rm gifted_swartz
gifted_swartz
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              14 minutes ago      Up 14 minutes                                      agitated_hopper
299d22cbda4f        ubuntu:14.04        "/bin/sh -c 'while tb"	 34 minutes ago      Exited (137) 27 minutes ago
```



##### 删除运行中的容器

```shell
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              14 minutes ago      Up 14 minutes                                      agitated_hopper
root@ruopu:~# docker container rm -f f55c
f55c
# 使用-f选项强制删除运行中的容器，Docker 会发送SIGKILL信号给容器。通过容器ID删除容器
root@ruopu:~# docker container ls -a     
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
```



##### 清理所有处于终止状态的容器

```shell
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                        PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              21 minutes ago      Up 21 minutes          
........
root@ruopu:~# docker container prune 
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
299d22cbda4f6d648095732350572999aa6937cad2d0d20db5ab37f09340c19e
e06be3875296e3f0beaea61f8f48517c4e2ac39ee8852eef24bb2d6c871b0e12
........
Total reclaimed space: 5B
root@ruopu:~# docker container ls -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
c063d378b119        ubuntu:14.04        "/bin/bash"              21 minutes ago      Up 21 minutes                            agitated_hopper
54b6e4618182        nginx:v2            "nginx -g 'daemon ofb
........
```

