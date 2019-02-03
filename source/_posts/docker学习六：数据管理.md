---
title: docker学习六：数据管理
date: 2018-11-23 09:40:22
tags: docker
categories: Container
---

### 数据管理

#### 数据卷(Volumes)

> 数据卷是一个可供一个或多个容器使用的特殊目录，它绕过UFS，可以提供很多有用的特性：
>
> * 数据卷可以在容器之间共享和重用
> * 对数据卷的修改会立即生效
> * 对数据卷的更新，不会影响镜像
> * 数据卷默认会一直存在，即使容器被删除
>
> 数据卷的使用，类似于Linux下对目录或文件进行mount，镜像中的被指定为挂载点的目录中的文件会隐藏掉，能显示的是挂载的数据卷

##### 创建

```shell
ruopu@ruopu:~$ docker volume  create my-vol
my-vol
# 创建一个叫my-vol的卷
ruopu@ruopu:~$ docker volume ls  
DRIVER              VOLUME NAME
local               my-vol
# 查看所有的数据卷
ruopu@ruopu:~$ docker volume inspect my-vol 
[
    {
        "CreatedAt": "2018-11-23T01:46:21Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
# 查看指定数据卷的信息。inspect[inˈspekt]：检查；point[pɔint]：点；mountpoint：挂载点；scope[skəup]：范围
root@ruopu:~# ll -h /var/lib/docker/volumes/
total 36K
drwx------  3 root root 4.0K Nov 23 01:46 ./
drwx--x--x 14 root root 4.0K Nov 21 03:40 ../
-rw-------  1 root root  32K Nov 23 01:46 metadata.db
drwxr-xr-x  3 root root 4.0K Nov 23 01:46 my-vol/
```



##### 启动一个挂载数据卷的容器

```shell
ruopu@ruopu:~$ docker run -d -P --name web --mount source=my-vol,target=/webapp nginx 
cb192c96fc3232d42e6a33440945e152cd3dd3a20fce95e0a12440b489a822fe
# 创建容器，-P选项表示让Docker随机映射一个 49000~49900 的端口到内部容器开放的网络端口。source指定为外部的数据卷名，target指定容器内的路径，如果容器内没有这个路径，在创建时会自动创建。之后指定从哪个镜像创建。
root@ruopu:~# docker exec -it web bash
# 进入容器
root@fc042722e238:/# ls -l /     
total 72
.......
drwxr-xr-x   1 root root 4096 Nov 12 00:00 usr
drwxr-xr-x   1 root root 4096 Nov 12 00:00 var
drwxr-xr-x   2 root root 4096 Nov 23 01:46 webapp
# 可以看到容器内根下的webapp目录
root@ruopu:~# cp /etc/fstab /var/lib/docker/volumes/my-vol/_data
# 在数据卷中还有一个_data目录，要将文件放在这个目录中，这样在容器内的挂载点上就能看到这个文件了。这里将fstab文件放到了_data目录中。
root@fc042722e238:/# ls /webapp/
fstab
# 在容器内也可以看到这个文件了
root@ruopu:~# docker inspect web
...
"Mounts": [
            {
                "Type": "volume",
                "Name": "my-vol",
                "Source": "/var/lib/docker/volumes/my-vol/_data",
                "Destination": "/webapp",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            }
        ],
...
# 使用inspect命令检查web容器的信息，在输出中的Mounts中有数据卷的信息
```



##### 删除数据卷

```shell
root@ruopu:~# docker volume rm my-vol 
Error response from daemon: remove my-vol: volume is in use - [cb192c96fc3232d42e6a33440945e152cd3dd3a20fce95e0a12440b489a822fe, fc042722e2380b62651271fe36a7d4388a50cff2ea2321550ad2953ea46cf4b0]
# 直接删除数据卷会有一个错误提示，告知数据卷正在被哪些容器使用，也就是后面中括号中的容器ID。不删除容器，是不能删除数据卷的
root@ruopu:~# docker container stop web1
web1
root@ruopu:~# docker container rm web1
web1
root@ruopu:~# docker container rm web
web
root@ruopu:~# docker volume rm my-vol 
my-vol
root@ruopu:~# ls /var/lib/docker/volumes/
metadata.db
# 删除占用数据卷的容器后再删除数据卷就没问题了，再查看本地的相应位置也没有数据卷了
root@ruopu:~# docker -v
Docker version 18.09.0, build 4d60db4
root@ruopu:~# docker rm -v web
web
root@ruopu:~# ls /var/lib/docker/volumes/m
metadata.db  my-vol/ 
# 在18.09.0版本中测试发现，使用"docker rm -v 容器ID"命令并不会删除数据卷。

* 删除无主的数据卷
root@ruopu:~# docker volume create my-vol
my-vol
root@ruopu:~# docker volume inspect my-vol 
[
    {
        "CreatedAt": "2018-11-23T03:36:38Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
root@ruopu:~# docker volume prune
WARNING! This will remove all local volumes not used by at least one container.
Are you sure you want to continue? [y/N] y
Deleted Volumes:
my-vol

Total reclaimed space: 0B
# prune[pru:n]：修剪
root@ruopu:~# docker volume ls 
DRIVER              VOLUME NAME
# 先创建一个数据卷，再删除。
```



#### 挂载主机目录(Bind mounts)

```shell
root@ruopu:~# docker run -d -P --name web --mount type=bind,source=/etc/init.d,target=/opt/webapp nginx
58ef89a432971bcec8ca0031a69960549d85766b5f42cc40d09e65a662f027c9
# 使用type=bind将本地的目录挂载到容器中，但用source指定的本地目录一定要使用绝对路径，如果本地目录不存在，Docker会报错。

* 以只读方式挂载本地目录
root@ruopu:~# docker run -d -P --name web1 --mount type=bind,source=/etc/init.d,target=/opt/webapp,readonly nginx         
f59500a342675873413040fa09dea6f626df2215430640830fde9e46c1195fc5
# 创建时加入readonly，使用户对目录只有只读权限
root@10c115755312:/# cd /opt/webapp/
root@10c115755312:/opt/webapp# mkdir a
mkdir: cannot create directory 'a': Read-only file system
# 创建目录时会有不能创建的提示
root@ruopu:~# docker inspect web1|grep Mounts -A 10
            "Mounts": [
                {
                    "Type": "bind",
                    "Source": "/etc/init.d",
                    "Target": "/opt/webapp",
                    "ReadOnly": true
                }
            ],
            "Mounts": [
                {
                    "Type": "bind",
                    "Source": "/etc/init.d",
                    "Destination": "/opt/webapp",
                    "Mode": "",
                    "RW": false,
                    "Propagation": "rprivate"
                }
        	],
# 可以看到，上面的ReadOnly是true，下面的RW是false
```



##### 挂载一个本地主机文件作为数据卷

```shell
root@ruopu:~# docker run --rm -it --mount type=bind,source=$HOME/.bash_history,target=/root/.bash_history ubuntu:14.04 bash
root@4e18204505bf:/# history 
    1  apt update
    2  ping www.baidu.com
    3  ip a
    4  ping 192.168.0.1
    5  vim /etc/resolv.conf 
    6  ping www.baidu.com
    7  ping 192.168.0.55
    8  vim /etc/network/interfaces 
    9  ip a
   10  vim /etc/network/interfaces 
   11  systemctl restart networking
   ...
# 用--mount标记从主机挂载单个文件到容器中，这样就可以记录在容器输入过的命令了，也可以看到本地执行过的命令了
```

