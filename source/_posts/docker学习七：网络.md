---
title: docker学习七：网络
date: 2018-11-23 12:40:12
tags: docker
categories: Container
---

### 网络功能介绍

> Docker 允许通过外部访问容器或容器互联的方式来提供网络服务。

#### 外部访问容器

##### 映射随机端口

```shell
root@ruopu:~# docker run -d -P --name web1 nginx
e962c7424359a76bb7c185de8acd401616f1854fee9a7768596a020b214aeebf
# 使用-P选项可以随机选择一个端口映射到容器中的打开的端口
root@ruopu:~# docker container ls -l
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                   NAMES
58ef89a43297        nginx               "nginx -g 'daemon of…"   About an hour ago   Up About an hour    0.0.0.0:32778->80/tcp   web1
# 使用-l选项只会显示最上面一条运行的容器的信息。可以看到，本地主机的32778端口被映射到了容器的80端口，此时访问本机的32778端口即可访问容器内的80端口

root@ruopu:~# docker logs -f web
192.168.0.89 - - [23/Nov/2018:04:51:29 +0000] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36" "-"
192.168.0.89 - - [23/Nov/2018:04:51:29 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://192.168.0.132:32778/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36" "-"
2018/11/23 04:51:29 [error] 8#8: *1 open() "/usr/share/nginx/html/favicon.ico" failed (2: No such file or directory), client: 192.168.0.89, server: localhost, request: "GET /favicon.ico HTTP/1.1", host: "192.168.0.132:32778", referrer: "http://192.168.0.132:32778/"
# 使用此命令后，会监听容器的log日志，如果有人访问本机的32778端口，日志就会有显示。-f选项表示Follow log output，跟踪日志输出。
```



##### 映射所有接口地址

```shell
root@ruopu:~# docker run -d -p 5000:5000 nginx
74a78539f3ae4befc1a272a92432f547ab0476b7a3bcf1800451be292c7ba690
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                            NAMES
74a78539f3ae        nginx               "nginx -g 'daemon of…"   51 seconds ago      Up 51 seconds       80/tcp, 0.0.0.0:5000->5000/tcp   hungry_leakey
# 使用-p选项，可以指定本地的某端口映射到容器中的某个端口，上面就是映射了本地的5000端口到容器的5000端口。这样定义会监听本地的所有地址。
```



##### 映射到指定地址的指定端口

```shell
root@ruopu:~# docker run -d -p 127.0.0.1:6000:5000 nginx 
13221c9107420a3c71a04ae2c6d4bcba8e4ea4c6616863ab085712c38b4821d6
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                              NAMES
13221c910742        nginx               "nginx -g 'daemon of…"   5 seconds ago       Up 5 seconds        80/tcp, 127.0.0.1:6000->5000/tcp   frosty_agnesi
# 将本地的回环地址的6000端口映射到容器的5000端口
```



##### 映射到指定地址的任意端口

```shell
root@ruopu:~# docker run -d -p 127.0.0.1::5000 nginx
762d1752599817dc0052080ecdb29543522a0f321bdaaee4ee2495516f92bfe2
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
762d17525998        nginx               "nginx -g 'daemon of…"   25 seconds ago      Up 25 seconds       80/tcp, 127.0.0.1:32768->5000/tcp   loving_borg
# 将本地的任意端口映射到容器的5000端口，可以看到本地的端口用了32768
```



##### 映射UDP端口

```shell
root@ruopu:~# docker run -d -p 127.0.0.1:4000:5000/udp nginx
1258d3b29d3de4aa8cdf4cced7c2575855d04dc5c53edd6c894bd5670f336e75
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
1258d3b29d3d        nginx               "nginx -g 'daemon of…"   6 seconds ago       Up 5 seconds        80/tcp, 127.0.0.1:4000->5000/udp    infallible_aryabhata
```



##### 查看映射端口配置

```shell
root@ruopu:~# docker port web1 80
0.0.0.0:32783
# 使用port指令可以查看容器内的端口映射到了本地的哪个地址和端口
root@ruopu:~# docker container port web 80
0.0.0.0:32771
root@ruopu:~# docker container port web
80/tcp -> 0.0.0.0:32771
# 使用上面命令也可以显示容器端口的映射情况
root@ruopu:~# docker inspect web1
# 使用inspect指令可以获取容器所有的变量
```



##### 绑定多个端口

```shell
root@ruopu:~# docker run -d -p 5001:5000 -p 5002:80 nginx
85ef456480e7bcc0180a07e705a0d8d48c4f4d618ed7fffa5c7474a322dbee98
root@ruopu:~# docker container ls -l
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                          NAMES
85ef456480e7        nginx               "nginx -g 'daemon of…"   9 seconds ago       Up 8 seconds        0.0.0.0:5002->80/tcp, 0.0.0.0:5001->5000/tcp   affectionate_bell
# 可以多次使用-p选项来绑定多个端口
```



#### 容器互联

##### 新建网络

```shell
root@ruopu:~# docker network create -d bridge my-net
c2bf630de56e2dc260eef74f0b9afc1e913f97fcef36d37d61025970a081c891
# 使用-d参数指定docker网络类型，有bridge和overlay。其中overlay网络类型用于swarm mode
```



##### 连接容器

```shell
root@ruopu:~# docker run -it --rm --name busybox1 --network my-net busybox sh
Unable to find image 'busybox:latest' locally
latest: Pulling from library/busybox
90e01955edcd: Pull complete 
Digest: sha256:2a03a6059f21e150ae84b0973863609494aad70f0a80eaeb64bddd8d92465812
Status: Downloaded newer image for busybox:latest
# 运行一个容器连接到新建的my-net网络
ruopu@ruopu:~$ docker run -it --rm --name busybox2 --network my-net busybox sh
/ # 
# 打开一个新终端再创建一个连接my-net网络的容器
root@ruopu:~# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                                          NAMES
5097ae5dbbc2        busybox             "sh"                     About a minute ago   Up About a minute                                                  busybox2
c71c2f7646a6        busybox             "sh"                     2 minutes ago        Up 2 minutes                                                       busybox1
# 打开一个新终端查看容器信息

* busybox1
/ # ping busybox2
PING busybox2 (172.18.0.3): 56 data bytes
64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.068 ms
64 bytes from 172.18.0.3: seq=1 ttl=64 time=0.074 ms
# 在busybox1上ping busybox2，可以ping通，并可以看到busybox2的IP地址
/ # cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.18.0.2	711b0a48b174
# 在自己的hosts文件中有对本机地址的解析条目

* busybox2
/ # ping busybox1
PING busybox1 (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.048 ms
64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.029 ms
# 在busybox2上ping busybox1，可以ping通，并可以看到busybox1的IP地址
# 这样,busybox1容器和busybox2容器建立了互联关系。
/ # cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.18.0.3	0871d29cd3b4
/ # 
```



##### Docker Compose

> 如果你有多个容器之间需要互相连接，推荐使用Docker Compose



#### 配置DNS

```shell
/ # mount
...
/dev/mapper/ubuntu--vg-ubuntu--lv on /etc/resolv.conf type ext4 (rw,relatime,data=ordered)
/dev/mapper/ubuntu--vg-ubuntu--lv on /etc/hostname type ext4 (rw,relatime,data=ordered)
/dev/mapper/ubuntu--vg-ubuntu--lv on /etc/hosts type ext4 (rw,relatime,data=ordered)
...
# 在容器中使用mount命令可以查看到挂载信息，其中有上面三条，挂载了宿主机的三个文件到容器，当宿主机信息发生改变时，所有Docker容器的配置通过这些文件也随之改变。
```



### 高级网络配置

> 当 Docker 启动时，会自动在主机上创建一个docker0虚拟网桥，实际上是 Linux 的一个bridge，可以理解为一个软件交换机。它会在挂载到它的网口之间进行转发。
> 同时，Docker 随机分配一个本地未占用的私有网段(在 RFC1918 中定义)中的一个地址给docker0接口。比如典型的172.17.42.1，掩码为255.255.0.0。此后启动的容器内的网口也会自动分配一个同一网段(172.17.0.0/16)的地址。
> 当创建一个 Docker 容器的时候，同时会创建了一对veth pair接口(当数据包发送到一个接口时，另外一个接口也可以收到相同的数据包)。这对接口一端在容器内，即eth0；另一端在本地并被挂载到docker0网桥，名称以veth开头(例如vethAQI2QT)。通过这种方式，主机可以跟容器通信，容器之间也可以相互通信。Docker 就创建了在主机和所有容器之间一个虚拟共享网络。

![](/images/docker/dockernet1.jpg)

#### 快速配置

> 下面是一个跟 Docker 网络相关的命令列表。
> 其中有些命令选项只有在 Docker 服务启动的时候才能配置，而且不能马上生效。
>
> * -b BRIDGE 或 --bridge=BRIDGE：指定容器挂载的网桥
>
> * --bip=CIDR：定制 docker0 的掩码
>
> * -H SOCKET... 或 --host=SOCKET...：Docker 服务端接收命令的通道
>
> * --icc=true|false：是否支持容器之间进行通信
>
> * --ip-forward=true|false：转发，请看下文容器之间的通信
>
> * --iptables=true|false：是否允许 Docker 添加 iptables 规则
>
> * --mtu=BYTES：容器网络中的 MTU
>
> 下面2个命令选项既可以在启动服务时指定，也可以在启动容器时指定。在 Docker 服务启动的时候指定则会成为默认值，后面执行 docker run 时可以覆盖设置的默认值。
>
> * --dns=IP_ADDRESS...：使用指定的DNS服务器
>
> * --dns-search=DOMAIN...：指定DNS搜索域
>
> 最后这些选项只有在 docker run 执行时使用，因为它是针对容器的特性内容。
>
> *   -h HOSTNAME 或 --hostname=HOSTNAME：配置容器主机名
> *   --link=CONTAINER_NAME:ALIAS：添加到另一个容器的连接
> *   --net=bridge|none|container:NAME_or_ID|host：配置容器的桥接模式
> *   -p SPEC 或 --publish=SPEC：映射容器端口到宿主主机
> *   -P or --publish-all=true|false：映射容器所有端口到宿主主机



#### 容器访问控制

> 容器的访问控制，主要通过 Linux 上的iptables防火墙来进行管理和实现。iptables是Linux 上默认的防火墙软件，在大部分发行版中都自带。



##### 容器访问外部网络

> 容器要想访问外部网络，需要本地系统的转发支持。在Linux 系统中，检查转发是否打开。

```shell
$sysctl net.ipv4.ip_forward
net.ipv4.ip_forward = 1
# 如果为 0，说明没有开启转发，则需要手动打开。
$sysctl -w net.ipv4.ip_forward=1
# 如果在启动 Docker 服务的时候设定ip_forward，Docker 就会自动设定系统的--ip-forward=true参数为 1。
```



##### 容器之间访问

> 容器之间相互访问，需要两方面的支持。
>
> * 容器的网络拓扑是否已经互联。默认情况下，所有容器都会被连接到docker0网桥上。
> * 本地系统的防火墙软件 -- iptables是否允许通过。



##### 访问所有端口

> 当启动 Docker 服务时候，默认会添加一条转发策略到 iptables 的 FORWARD 链上。策略为通过(ACCEPT)还是禁止(DROP)取决于配置 --icc=true (缺省值)还是 --icc=false。当然，如果手动指定 --iptables=false 则不会添加iptables规则。
> 可见，默认情况下，不同容器之间是允许网络互通的。如果为了安全考虑，可以在 /etc/default/docker 文件中配置 DOCKER_OPTS=--icc=false 来禁止它。



##### 访问指定端口

> 在通过 -icc=false 关闭网络访问后，还可以通过 --link=CONTAINER_NAME:ALIAS 选项来访问容器的开放端口。
>
> 例如，在启动 Docker 服务时，可以同时使用 icc=false --iptables=true 参数来关闭允许相互的网络访问，并让 Docker 可以修改系统中的 iptables 规则。
> 此时，系统中的 iptables 规则可能是类似

```shell
$ sudo iptables -nL
...
Chain FORWARD (policy ACCEPT)
target prot opt source destination
DROP all 0.0.0.0/0
--
0.0.0.0/0
...
```

> 之后，启动容器( docker run )时使用 --link=CONTAINER_NAME:ALIAS 选项。Docker 会在 iptable 中为两个容器分别添加一条 ACCEPT 规则，允许相互访问开放的端口(取决于 Dockerfile 中的 EXPOSE 指令)。
> 当添加了 --link=CONTAINER_NAME:ALIAS 选项后，添加了 iptables 规则。

```shell
$ sudo iptables -nL
...
Chain FORWARD (policy ACCEPT)
target prot opt source destination ACCEPT tcp -- 172.17.0.2 172.17.0.3 tcp spt:80
ACCEPT tcp -- 172.17.0.3 172.17.0.2 tcp dpt:80
DROP all -- 0.0.0.0/0 0.0.0.0/0
```

> 注意: --link=CONTAINER_NAME:ALIAS 中的 CONTAINER_NAME 目前必须是 Docker 分配的名字, 或使用 --name 参数指定的名字。主机名则不会被识别。



##### 映射容器端口到宿主主机的实现

> 默认情况下，容器可以主动访问到外部网络的连接，但是外部网络无法访问到容器。



#### 容器访问外部实现

> 容器所有到外部网络的连接，源地址都会被 NAT 成本地系统的 IP 地址。这是使用 iptables 的源地址伪装操作实现的。
> 查看主机的 NAT 规则。

```shell
$ sudo iptables -t nat -nL
...
Chain POSTROUTING (policy ACCEPT)
target			prot opt source				destination
MASQUERADE		all	--	172.17.0.0/16		!172.17.0.0/16
...
```

> 其中，上述规则将所有源地址在 172.17.0.0/16 网段，目标地址为其他网段(外部网络)的流量动态伪装为从系统网卡发出。MASQUERADE 跟传统 SNAT相比的好处是它能动态从网卡获取地址。



##### 外部访问容器实现

> 容器允许外部访问，可以在 docker run 时候通过 -p 或 -P参数来启用。
> 不管用那种办法，其实也是在本地的 iptables 的 nat 表中添加相应的规则。

```shell
* 使用 -P 时:
$ iptables -t nat -nL
...
Chain DOCKER (2 references)
target 			prot opt source 			destination
DNAT 			tcp --	0.0.0.0/0			0.0.0.0/0		tcp dpt:49153 to:172.17.
0.2:80

* 使用 -p 80:80 时:
$ iptables -t nat -nL
Chain DOCKER (2 references)
target 			prot opt source 			destination
DNAT 			tcp -- 0.0.0.0/0			0.0.0.0/0		tcp dpt:80 to:172.17.0.2
:80
```

> 注意:
>
> * 这里的规则映射了 0.0.0.0，意味着将接受主机来自所有接口的流量。用户可以通过 -p IP:hostPort:containerPort 或 -p IP::port 来指定允许访问容器的主机上的 IP、接口等，以制定更严格的规则。
> * 如果希望永久绑定到某个固定的 IP 地址，可以在 Docker 配置文件 /etc/docker/daemon.json 中添加如下内容。
>   {
>   "ip": "0.0.0.0"
>   }



#### 配置 docker0 网桥

> Docker 服务默认会创建一个 docker0 网桥(其上有一个 docker0 内部接口)，它在内核层连通了其他的物理或虚拟网卡，这就将所有容器和本地主机都放到同一个物理网络。
> Docker 默认指定了 docker0 接口 的 IP 地址和子网掩码，让主机和容器之间可以通过网桥相互通信，它还给出了 MTU(接口允许接收的最大传输单元)，通常是 1500 Bytes，或宿主主机网络路由上支持的默认值。这些值都可以在服务启动的时候进行配置。
>
> * --bip=CIDR：IP 地址加掩码格式，例如 192.168.1.5/24
>
> * --mtu=BYTES：覆盖默认的 Docker mtu 配置
>
> 也可以在配置文件中配置 DOCKER_OPTS，然后重启服务。
>
> 由于目前 Docker 网桥是 Linux 网桥，用户可以使用 brctl show 来查看网桥和端口连接信息。

```shell
$ sudo brctl show
bridge name 	bridge id 			STP enabled 	interfaces
docker0 		8000.3a1d7362b4ee 	no 				veth65f9
										vethdda6
```

> *注: brctl 命令在 Debian、Ubuntu 中可以使用 sudo apt-get install bridge-utils 来安装。
> 每次创建一个新容器的时候，Docker 从可用的地址段中选择一个空闲的 IP 地址分配给容器的 eth0 端口。使用本地主机上 docker0 接口的 IP 作为所有容器的默认网关。

```shell
$ sudo docker run -i -t --rm busybox sh
$ ip addr show eth0
24: eth0: <BROADCAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qle
n 1000
    link/ether 32:6f:e0:35:57:91 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.3/16 scope global eth0
    valid_lft forever preferred_lft forever
    inet6 fe80::306f:e0ff:fe35:5791/64 scope link
    valid_lft forever preferred_lft forever
$ ip route
default via 172.17.42.1 dev eth0
172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.3
```



#### 自定义网桥

> 除了默认的 docker0 网桥，用户也可以指定网桥来连接各个容器。
> 在启动 Docker 服务的时候，使用 -b BRIDGE 或 --bridge=BRIDGE 来指定使用的网桥。
> 如果服务已经运行，那需要先停止服务，并删除旧的网桥。

```shell
$ sudo systemctl stop docker
$ sudo apt install bridge-utils
$ sudo ip link set dev docker0 down
$ sudo brctl delbr docker0
# 然后创建一个网桥bridge0。
$ sudo brctl addbr bridge0
$ sudo ip addr add 192.168.5.1/24 dev bridge0
$ sudo ip link set dev bridge0 up
# 查看确认网桥创建并启动。
$ ip addr show bridge0
4: bridge0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state UP group default
    link/ether 66:38:d0:0d:76:18 brd ff:ff:ff:ff:ff:ff
    inet 192.168.5.1/24 scope global bridge0
		valid_lft forever preferred_lft forever
# 在 Docker 配置文件 /etc/docker/daemon.json 中添加如下内容，即可将 Docker 默认桥接到创建的网桥上。
{
"bridge": "bridge0",
}
```

> 启动 Docker 服务。
> 新建一个容器，可以看到它已经桥接到了 bridge0 上。
> 可以继续用 brctl show 命令查看桥接的信息。另外，在容器中可以使用 ip addr 和 ip route 命令来查看 IP 地址配置和路由信息。



#### 工具和示例

> 在介绍自定义网络拓扑之前，你可能会对一些外部工具和例子感兴趣:



##### pipework

> Jérôme Petazzoni 编写了一个叫 pipework 的 shell 脚本，可以帮助用户在比较复杂的场景中完成容器的连接。



##### playground

> Brandon Rhodes 创建了一个提供完整的 Docker 容器网络拓扑管理的 Python库，包括路由、NAT 防火墙；以及一些提供 HTTP， SMTP，POP，IMAP，Telnet，SSH，FTP 的服务器。



#### 编辑网络配置文件

> Docker 1.2.0 开始支持在运行中的容器里编辑 /etc/hosts , /etc/hostname 和 /etc/resolv.conf文件。
> 但是这些修改是临时的，只在运行的容器中保留，容器终止或重启后并不会被保存下来，也不会被docker commit提交。



#### 示例：创建一个点到点连接

> 默认情况下，Docker 会将所有容器连接到由docker0提供的虚拟子网中。用户有时候需要两个容器之间可以直连通信，而不用通过主机网桥进行桥接。
> 解决办法很简单：创建一对接口，分别放到两个容器中，配置成点到点链路类型即可。

```shell
* 首先启动 2 个容器:
$ docker run -i -t --rm --net=none base /bin/bash
root@1f1f4c1f931a:/#
$ docker run -i -t --rm --net=none base /bin/bash
root@12e343489d2f:/#
# 找到进程号，然后创建网络命名空间的跟踪文件。
$ docker inspect -f '{{.State.Pid}}' 1f1f4c1f931a
2989
$ docker inspect -f '{{.State.Pid}}' 12e343489d2f
3004
$ sudo mkdir -p /var/run/netns
$ sudo ln -s /proc/2989/ns/net /var/run/netns/2989
$ sudo ln -s /proc/3004/ns/net /var/run/netns/3004
# 创建一对 peer 接口，然后配置路由
$ sudo ip link add A type veth peer name B
$ sudo ip link set A netns 2989
$ sudo ip netns exec 2989 ip addr add 10.1.1.1/32 dev A
$ sudo ip netns exec 2989 ip link set A up
$ sudo ip netns exec 2989 ip route add 10.1.1.2/32 dev A
$ sudo ip link set B netns 3004
$ sudo ip netns exec 3004 ip addr add 10.1.1.2/32 dev B
$ sudo ip netns exec 3004 ip link set B up
$ sudo ip netns exec 3004 ip route add 10.1.1.1/32 dev B
```

