---
title: docker学习二：安装
date: 2018-09-20 13:01:32
tags: docker
categories: Container
---

# ubuntu18.04_Server

```shell
apt install apt-transport-https ca-certificates curl software-properties-common
# 由于apt源使用 HTTPS 以确保软件下载过程中不被篡改。因此,我们首先需要添加使用HTTPS 传输的软件包以及 CA 证书。
curl -fsSL https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
# 为了确认所下载软件包的合法性,需要添加软件源的GPG密钥。
add-apt-repository  "deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
# 向source.list中添加 Docker 软件源
apt update
apt install docker-ce
# 安装docker
groupadd docker
usermod -aG docker test
# 将当前用户加入docker组
# 默认情况下,docker命令会使用 Unix socket 与 Docker 引擎通讯。而只有root用户和组的用户才可以访问 Docker 引擎的 Unix socket。出于安全考虑,一般 Linux 系统上不会直接使用root用户。因此,更好地做法是将需要使用docker的用户加入docker用户组。
vim /etc/docker/daemon.json
    {
      "registry-mirrors":[
        "https://87uxhe5.mirror.aliyuncs.com"
      ]
    }
# 设置docker加速器，地址是从阿里云的容器镜像服务器得到的
systemctl daemon-reload
systemctl start docker
docker run hello-world
# 测试docker安装是否成功。如果安装成功，会输入下列内容
    Hello from Docker!
    This message shows that your installation appears to be working correctly.

    To generate this message, Docker took the following steps:
     1. The Docker client contacted the Docker daemon.
     2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
     3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
     4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.

    To try something more ambitious, you can run an Ubuntu container with:
     $ docker run -it ubuntu bash

    Share images, automate workflows, and more with a free Docker ID:
     https://hub.docker.com/

    For more examples and ideas, visit:
     https://docs.docker.com/get-started/
```



# Kali3.0

```shell
apt-key adv \--keyserver hkp://ha.pool.sks-keyservers.net:80 \--recv-keys 58118E89F3A912897C070ADBF76221572C52609D
# 添加key
vim /etc/apt/sources.list
		deb https://apt.dockerproject.org/repo debian-wheezy main
# 添加源
apt update
apt install docker-engine
systemctl start docker
systemctl status docker
systemctl enable docker
# 参考：
# https://www.jianshu.com/p/6b1cb6927e9e
# Docker官网地址：https://docs.docker.com/
# Debian安装Docker官方教程：https://docs.docker.com/engine/installation/linux/debian/
```



# Windows7

1. 下载DockerToolbox，地址：https://github.com/docker/toolbox/releases
2. 安装中，如果VirualBox和Git已经安装，可以不选

![](\images\docker\docker1.jpg)

3. 安装完成后，桌面上会多出3各图标，如下。其中VirtualBox提供了linux虚拟机的运行环境，Docker Quickstart Terminal用于快速介入linux虚拟机，提供命令行交互，Kitematic是docker GUI很少用到。

![](\images\docker\docker2.jpg)

4. 使用命令创建default虚拟机

```shell
打开cmd
docker-machine create default
```

![](\images\docker\docker3.jpg)

启动时会进行Docker环境的初始化，会在VirtualBox中自动创建名字为default的linux虚拟机，在此过程中会用到boot2docker.iso镜像文件。默认情况下，启动程序会从GitHub上下载此文件的最新版，但由于文件相对较大且速度不给力，多数情况下会下载失败，造成Docker环境无法启动。解决办法：其实DockerToolbox安装文件自带了boot2docker.iso镜像文件，位于安装目录下（如C:\Program Files\Docker Toolbox） ，将此文件拷至C:\Users\Administrator\.docker\machine\cache目录下，然后在**网络断开**的情况下重新启动，便可初始化成功。

5. 查看default虚拟机的IP地址，使用Xshell连接

```shell
打开cmd
docker-machine ls
#查看default地址
#登录default信息
#用户名：docker
#密码：tcuser
```

6. 更改虚拟磁盘存储位置

虚拟机的默认存储位置是C:\Users\Administrator\.docker\machine\machines ，后期docke镜像文件会不断增加，为了给系统盘减负，最好将磁盘移动到其他位置。

* 首先通过PowerShell或cmd终端中执行【docker-machine stop default】命令停止default虚拟机。

![](\images\docker\docker4.jpg)

* 通过VirtualBox"管理"-->"虚拟介质管理"界面对虚拟磁盘进行复制。之后添加新磁盘，删除旧磁盘即可

![](\images\docker\docker5.jpg)

![](\images\docker\docker6.jpg)

![](\images\docker\docker7.jpg)

![](\images\docker\docker8.jpg)

![](\images\docker\docker9.jpg)

![](\images\docker\docker10.jpg)

![](\images\docker\docker11.jpg)

![](\images\docker\docker12.jpg)

![](\images\docker\docker13.jpg)

![](\images\docker\docker14.jpg)

![](\images\docker\docker15.jpg)

7. 配置镜像加速器

登录阿里云https://cr.console.aliyun.com，点击右侧的镜像加速器，复制地址。最后用命令修改镜像地址即可

![](\images\docker\docker16.jpg)

```shell
登录虚拟机default
sudo sed -i "s|EXTRA_ARGS='|EXTRA_ARGS='--registry-mirror=加速地址 |g" /var/lib/boot2docker/profile
#修改后，可调整default的硬件配置，如CPU，memory，disk等，disk可以不用复制，创建一个新的，大一点的空间。另外，不可取消光驱的启动，因为启动时要用到boot2docker.iso文件
打开cmd
docker-machine restart default
#重启docker服务
```

参考：https://www.cnblogs.com/canger/p/9028723.html

















