---
title: docker资源限制
date: 2018-12-19 16:09:47
tags: docker
categories: Container
---

#### 安装配置

```shell
[root@test ~]# yum install -y epel-release
[root@test ~]# yum install -y docker
[root@test ~]# vim /etc/docker/daemon.json
        {
                "registry-mirrors":["http://192.168.0.130:8083"],
                "insecure-registries":["192.168.0.130:8083","192.168.0.130:8082"],
                "disable-legacy-registry":true
        }
# registry-mirrors表示使用本地仓库，insecure-registries表示可以不使用https协议，disable-legacy-registry定义了关闭"Docker v1 API"，这样就不用在定义nexus3仓库的三种类型时选择启用Docker v1 API了。
[root@test ~]# systemctl start docker
```

#### 测试

```shell
* 压测内存
[root@test ~]# docker pull lorel/docker-stress-ng
Using default tag: latest
Trying to pull repository docker.io/lorel/docker-stress-ng ... 
latest: Pulling from docker.io/lorel/docker-stress-ng
c52e3ed763ff: Pull complete 
a3ed95caeb02: Pull complete 
7f831269c70e: Pull complete 
Digest: sha256:c8776b750869e274b340f8e8eb9a7d8fb2472edd5b25ff5b7d55728bca681322
Status: Downloaded newer image for docker.io/lorel/docker-stress-ng:latest
# 下载压测镜像stress
[root@test ~]# docker image ls
REPOSITORY                         TAG                 IMAGE ID            CREATED             SIZE
docker.io/lorel/docker-stress-ng   latest              1ae56ccafe55        2 years ago         8.1 MB
[root@test ~]# docker run --name stress -it --rm lorel/docker-stress-ng --help
stress-ng, version 0.03.11
... ...
Example: stress-ng --cpu 8 --io 4 --vm 2 --vm-bytes 128M --fork 4 --timeout 10s

Note: Sizes can be suffixed with B,K,M,G and times with s,m,h,d,y
# 查看使用帮助
[root@test ~]# docker run --name stress -it --rm -m 256m lorel/docker-stress-ng --vm 2
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 2 vm
# -m表示给这个容器使用多少内存。--vm表示启动几个进程对内存进行压测，--vm-bytes表示每个进程可以使用的内存数，默认是256m，这里使用默认值，所以没有设置。
[root@test ~]# docker top stress
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                2389                2375                0                   16:21               pts/1               00:00:00            /usr/bin/stress-ng --vm 2
root                2413                2389                0                   16:21               pts/1               00:00:00            /usr/bin/stress-ng --vm 2
root                2415                2389                0                   16:21               pts/1               00:00:00            /usr/bin/stress-ng --vm 2
root                2440                2415                99                  16:21               pts/1               00:00:02            /usr/bin/stress-ng --vm 2
# 打开另一终端查看容器启动的进程
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT     MEM %               NET I/O             BLOCK I/O           PIDS
d07a7a5544ca        6.19%               255.9 MiB / 256 MiB   99.96%              648 B / 648 B       17.1 GB / 49.3 GB   5
# 查看容器的实时使用情况，因为设置了容器可用的内存数，所以不会超过256M。

* 压测CPU
[root@test ~]# docker run --name stress -it --rm lorel/docker-stress-ng stress --cpu 8
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 使用--cpu选项设置启动8个进程，因没有其他对CPU的设置，所以容器会使用全部CPU
[root@test ~]# docker top stress
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                2724                2709                0                   16:27               pts/1               00:00:00            /usr/bin/stress-ng stress --cpu 8
root                2745                2724                24                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2746                2724                25                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2747                2724                25                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2748                2724                24                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2749                2724                24                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2750                2724                25                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2751                2724                25                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
root                2752                2724                25                  16:27               pts/1               00:00:14            /usr/bin/stress-ng stress --cpu 8
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
bab5b7de1a68        2.72%               21.23 MiB / 976.3 MiB   2.18%               648 B / 648 B       0 B / 0 B           9
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
bab5b7de1a68        198.59%             21.23 MiB / 976.3 MiB   2.18%               648 B / 648 B       0 B / 0 B           9
# 因为是双核CPU，所以容器使用CPU的比例会一直接近200%。

* 设置容器可使用的CPU核心数
[root@test ~]# docker run --name stress -it --rm --cpus 1 lorel/docker-stress-ng stress --cpu 8 
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 使用--cpus限制最多使用2核，--cpu表示启用8个进程
[root@test ~]# docker top stress
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                2854                2840                0                   16:30               pts/1               00:00:00            /usr/bin/stress-ng stress --cpu 8
root                2877                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2878                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2879                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2880                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2881                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2882                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2883                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
root                2884                2854                12                  16:30               pts/1               00:00:06            /usr/bin/stress-ng stress --cpu 8
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
c21d92bb4bc7        1.33%               25.54 MiB / 976.3 MiB   2.62%               648 B / 648 B       0 B / 0 B           9
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
c21d92bb4bc7        107.44%             25.54 MiB / 976.3 MiB   2.62%               648 B / 648 B       0 B / 0 B           9
# 因为限制了容器可用CPU的核心数为1，所以容器使用CPU的比例在100%

* 限制容器在指定的CPU核心上运行
[root@test ~]# docker run --name stress -it --rm --cpuset-cpus 0 lorel/docker-stress-ng stress --cpu 8
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 使用--cpuset-cpus选项让容器只能在指定的核心上运行。如果有多个核心，可以使用0,2或0-3这样的表达方式
[root@test ~]# docker top stress   
UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
root                2970                2956                0                   16:33               pts/1               00:00:00            /usr/bin/stress-ng stress --cpu 8
root                2994                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                2995                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                2996                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                2997                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                2998                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                2999                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                3000                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
root                3001                2970                12                  16:33               pts/1               00:00:13            /usr/bin/stress-ng stress --cpu 8
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
4ebe403ca83c        2.07%               22.63 MiB / 976.3 MiB   2.32%               648 B / 648 B       0 B / 0 B           9
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
4ebe403ca83c        100.61%             22.63 MiB / 976.3 MiB   2.32%               648 B / 648 B       0 B / 0 B           9

* 使用权重
[root@test ~]# docker run --name stress -it --rm --cpu-shares 1024 lorel/docker-stress-ng stress --cpu 8         
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 使用--cpu-shares选项为容器指定权重
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
6b08823bff45        1.57%               15.84 MiB / 976.3 MiB   1.62%               648 B / 648 B       0 B / 0 B           9
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
6b08823bff45        194.23%             15.84 MiB / 976.3 MiB   1.62%               648 B / 648 B       0 B / 0 B           9
# 这时容器会使用全部CPU，所以比例为200%
[root@test ~]# docker run --name stress2 -it --rm --cpu-shares 1024 lorel/docker-stress-ng stress --cpu 8 
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 再启动一个容器，并分配相同的权重
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
d8d44395f9fc        100.10%             15.81 MiB / 976.3 MiB   1.62%               578 B / 578 B       0 B / 0 B           9
6b08823bff45        96.45%              15.84 MiB / 976.3 MiB   1.62%               1.23 kB / 648 B     0 B / 0 B           9
# 可以看到两个容器使用CPU的比例相似
[root@test ~]# docker run --name stress3 -it --cpu-shares 512 lorel/docker-stress-ng stress --cpu 8 
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 启动第三个容器
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
e1298469a665        39.36%              15.81 MiB / 976.3 MiB   1.62%               648 B / 648 B       0 B / 0 B           9
d8d44395f9fc        79.19%              15.81 MiB / 976.3 MiB   1.62%               1.3 kB / 648 B      0 B / 0 B           9
6b08823bff45        77.88%              15.84 MiB / 976.3 MiB   1.62%               1.94 kB / 648 B     0 B / 0 B           9
# CPU被分成了五份，因为是双核，所以一共是200%，一份是40%
[root@test ~]# docker run --name stress4 -it --cpu-shares 2048 lorel/docker-stress-ng stress --cpu 8 
stress-ng: info: [1] defaulting to a 86400 second run per stressor
stress-ng: info: [1] dispatching hogs: 8 cpu
# 启动第四个容器
[root@test ~]# docker stats
CONTAINER           CPU %               MEM USAGE / LIMIT       MEM %               NET I/O             BLOCK I/O           PIDS
20d81511c4ad        93.90%              15.81 MiB / 976.3 MiB   1.62%               648 B / 648 B       0 B / 0 B           9
e1298469a665        23.74%              15.81 MiB / 976.3 MiB   1.62%               1.3 kB / 648 B      0 B / 0 B           9
d8d44395f9fc        41.86%              15.81 MiB / 976.3 MiB   1.62%               1.94 kB / 648 B     0 B / 0 B           9
6b08823bff45        47.71%              15.84 MiB / 976.3 MiB   1.62%               2.59 kB / 648 B     0 B / 0 B           9
# CPU被分成了九份

* 测试
# 创建一个可以下载文件的web服务器
root@ccjd:~/jdycbintest# docker volume create jdycbin
root@ccjd:~/jdycbintest# docker run --name jdycbin --cpus 2 -m 2048m -p 80:80 --mount source=jdycbin,target=/usr/share/nginx/html/ nginx 
WARNING: Your kernel does not support swap limit capabilities or the cgroup is not mounted. Memory limited without swap.
# 创建容器，使用2核CPU，2G内存，暴露80端口，挂载本地数据卷
root@ccjd:~/jdycbintest# cp Project_2G.bin /var/lib/docker/volumes/jdycbin/_data/
```

