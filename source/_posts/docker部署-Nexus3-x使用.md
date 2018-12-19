---
title: docker部署-Nexus3.x使用
date: 2018-11-27 08:48:11
tags: docker
categories: Container
---

### 安装

```shell
root@ccjd:~# docker run -d --name nexus3 --restart=always -p 8081:8081 -p 8082:8082 --mount src=nexus-data,target=/nexus-data sonatype/nexus3
# 在后台运行容器，名字叫nexus3，运行了一个restart策略为always的nexus3容器，暴露docker的8081端口为服务器的8081端口，挂载本地的nexus-data目录到容器的/nexus-data目录（这会在本地的/var/lib/docker/volumes中自动创建一个nexus-data目录，在容器中自动创建/nexus-data目录），镜像使用sonatype/nexus3。
root@ccjd:~# docker inspect --format '{{ .NetworkSettings.IPAddress }}' 48b7fb09c1f8
172.17.0.2
# 使用此命令获取docker的IP地址
```
### docker命令的--restart选项


```shell
# 运行容器时使用--restart参数可以指定一个restart策略，来指示在退出时容器应该如何重启或不应该重启。
# 当容器启用restart策略时，将会在docker ps显示Up或者Restarting状态。也可以使用docker events命令来生效restart策略。
docker支持如下restart策略：

* no – 容器退出时不要自动重启。这个是默认值。
* on-failure[:max-retries] – 只在容器以非0状态码退出时重启。可选的，可以退出docker daemon尝试重启容器的次数。
* always – 不管退出状态码是什么始终重启容器。当指定always时，docker daemon将无限次数地重启容器。容器也会在daemon启动时尝试重启，不管容器当时的状态如何。
* unless-stopped – 不管退出状态码是什么始终重启容器，不过当daemon启动时，如果容器之前已经为停止状态，不要尝试启动它。
# 在每次重启容器之前，不断地增加重启延迟[上一次重启的双倍延迟，从100毫秒开始]来防止影响服务器。这意味着daemon将等待100ms,然后200 ms, 400, 800, 1600等等，直到超过on-failure限制，或执行docker stop或docker rm -f。
# 如果容器重启成功[容器启动后并运行至少10秒]，然后delay重置为默认的100ms。
# 你可以使用on-failure策略指定docker尝试重启容器的最大次数。默认下docker将无限次数重启容器。可以通过docker inspect来查看已经尝试重启容器了多少次。例如，获取容器“my-container”的重启次数:

$ docker inspect -f "{{ .RestartCount }}" my-container
# 2

或者获取上一次容器重启时间：

$ docker inspect -f "{{ .State.StartedAt }}" my-container
# 2015-03-04T23:47:07.691840179Z

* 示例
$ docker run --restart=always redis
这运行了一个restart策略为always的redis容器，以使得容器退出时,docker将重启它。

$ docker run --restart=on-failure:10 redis
这个运行了一个restart策略为on-failure,最大重启次数为10的redis容器。如果redis以非0状态退出连续退出超过10次，那么docker将中断尝试重启这个容器。只有on-failure策略支持设置最大重启次数限制。
```

### 配置docker仓库
> Nexus3 提供了的3种类型的Docker仓库，前两者都可以创建多个仓库，最后一个则可以将他们全部聚合到一个URL来访问。
>
> - docker (hosted): 自托管
> - docker (proxy): 代理
> - docker (group): 聚合

#### hosted类型

```shell
1. 用浏览器打开192.168.0.198:8081-->点击右上角登录-->点击页面上方的齿轮标志-->点击左侧的Repository中的Bolb Stores创建一个存储块-->点击左侧Repositories-->Create repository-->docker(hosted)-->输入名称；勾选Online，这个开关可以设置这个Docker repo是在线还是离线；选择HTTP并设置创建时用到的8082端口，这是在命令行连接时要用到的端口；勾选Force basic authentication，这样的话就不允许匿名访问了，执行docker pull或 docker push之前，都要先登录：docker login；勾选Docker Registry API Support，Docker registry默认使用的是API v2, 但是为了兼容性，我们可以勾选启用API v1。Storage选择之前创建的存储块设备；Hosted使用默认的Allow redeploy；选择左侧的Security中的Realms，将Docker Bearer Token Realm加入到右侧的Active框中
2. 使用本机的ubuntu16.04测试
root@ccjd:~# vim /lib/systemd/system/docker.service
	[Service]
	...
	ExecStart=/usr/bin/dockerd --insecure-registry 192.168.0.198:8082 -H unix://
	...
	# 加入--insecure-registry 192.168.0.198:8082，这里加入的地址必须是宿主机的地址，测试发现如果添加的是docker容器的172地址，在认证时还是会提示"Error response from daemon: Get https://172.17.0.2:8082/v2/: http: server gave HTTP response to HTTPS client"
root@ccjd:~# systemctl daemon-reload 
root@ccjd:~# systemctl restart docker
root@ccjd:~# docker login 192.168.0.198:8082 -u admin -p admin123
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
# 出现Login Succeeded就表示成功了
root@ccjd:~# docker tag centos 192.168.0.198:8082/centos
# 给现有的centos镜像打一个标签叫192.168.0.198:8082/centos
root@ccjd:~# docker image ls
REPOSITORY                  TAG                 IMAGE ID            CREATED             SIZE
192.168.0.198:8082/centos   latest              75835a67d134        6 weeks ago         200MB
centos                      latest              75835a67d134        6 weeks ago         200MB
# 查看已有了新的镜像
root@ccjd:~# docker push 192.168.0.198:8082/centos
The push refers to repository [192.168.0.198:8082/centos]
f972d139738d: Pushed 
latest: digest: sha256:dc29e2bcceac52af0f01300402f5e756cc8c44a310867f6b94f5f7271d4f3fec size: 529
# 将镜像推送到本地仓库
```

#### proxy类型

```shell
1. 用浏览器打开192.168.0.198:8081-->点击右上角登录-->点击页面上方的齿轮标志-->点击左侧的Repository中的Bolb Stores创建一个存储块。
2. 打开左侧的Repositories-->Create replsitory-->docker(proxy)-->自定义Name；勾选Online；设置http端口；不勾选Force basic authentication；勾选Docker Registry API Support；Remote Storage使用阿里云的加速器地址；Docker Index使用Use proxy registry(specified above)；Storage使用创建的存储块
# 勾选Force basic authentication后，proxy仓库的状态会显示在线-正在连接。但下载镜像后状态也不会改变。如果不勾选，下载镜像后会显示在线-远程可用
3. 配置
root@ccjd:~# vim /etc/docker/daemon.json
    {
            "registry-mirrors":[
                    "http://192.168.0.198:8083"
            ]
    }
# 改为内部仓库的地址
4. 测试
root@ccjd:~# docker pull debian
5. 用浏览器打开192.168.0.198:8081后，点击上面的盒子图标，在左侧的Browse中选择创建的proxy存储块，可以看到我们下载的镜像，这是将镜像持久化存储在块中了。之后如果下载相同的镜像，可以从私有仓库中直接下载。
```

#### group类型

```shell
1. 创建存储块-->创建group类型库
2. 这里需要注意，在三种类型中都不再选择"Docker Registry API支持"，并修改配置文件，如下：
root@ccjd:~# vim /etc/docker/daemon.json 
    {
            "registry-mirrors":["http://192.168.0.130:8083"],
            "insecure-registries":["192.168.0.130:8083","192.168.0.130:8082"],
            "disable-legacy-registry":true
    }
# 这里第一行定义了group类型的仓库，第二行定义了两个地址为安全地址，可以不用https连接，最后一行定义了关闭"Docker v1 API"，这样就不用在定义三种类型时选择启用Docker v1 API了。
3. 测试发现，如果在group类型中一次性加入hosted和proxy类型的两个存储库，那么pull镜像时，proxy类型的库中就不会有反应，去除了hosted类型的库后就可以了。之后再将hosted类型的库加上也没有问题。
4. 官方推荐配置两个Connectors端口，一个配置在docker(group)用来访问所有库，搜索和下载images(group下包含proxy，所以创建proxy仓库的时候可以不设置Connectors-https端口)，另一个配置在docker(hosted)用来push自己的images，使用docker(group)实现搜索和下载images。
The recommended minimal configuration requires one port for a Docker repository group used for read access to all repositories and one port for each hosted Docker repository that will receive push events from your users.
5. 测试
docker login 192.168.0.130:8083 -u admin -p admin123
docker pull centos
再次查看nexus3页面时，在proxy存储块中应该有centos镜像，之后再下载时就可以从私有库中下载了。
# 下面为三种类型库的配置截图
```



![](/images/nexus3/dockerblock.jpg)

![](/images/nexus3/dockerhosted1.jpg)

![](/images/nexus3/dockerhosted2.jpg)

![](/images/nexus3/dockerproxy1.jpg)

![](/images/nexus3/dockerproxy2.jpg)

![](/images/nexus3/dockerproxy3.jpg)

![](/images/nexus3/dockergroup1.jpg)

![](/images/nexus3/dockergroup2.jpg)



### 配置yum仓库

```shell
使用nexus3来管理yum仓库相对简单，首先创建存储块，这里共创建了6个，有5个是给每个不同的库使用的，1个是给组用的。之后创建5个不同的proxy类型库，每个库都指向不同的yum源，最后创建一个组来管理这5个库。yum源地址如下：
http://mirrors.aliyun.com/centos/7/os/x86_64
http://mirrors.aliyun.com/centos/7/updates/x86_64
http://mirrors.aliyun.com/centos/7/extras/x86_64
http://mirrors.aliyun.com/centos/7/centosplus/x86_64
http://mirrors.aliyun.com/centos/7/contrib/x86_64
```

![](/images/nexus3/yumblock.jpg)

![](/images/nexus3/yumRepositories.jpg)

![](/images/nexus3/yumproxy1.jpg)

![](/images/nexus3/yumproxy2.jpg)

![](/images/nexus3/yumgroup.jpg)













