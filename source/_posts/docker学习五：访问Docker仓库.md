---
title: docker学习五：访问Docker仓库
date: 2018-11-22 16:52:20
tags: docker
categories: Container
---

### 访问仓库

> 仓库(Repository)是集中存放镜像的地方。
> 一个容易混淆的概念是注册服务器(Registry)。实际上注册服务器是管理仓库的具体服务器，每个服务器上可以有多个仓库，而每个仓库下面有多个镜像。从这方面来说，仓库可以被认为是一个具体的项目或目录。例如对于仓库地址 dl.dockerpool.com/ubuntu来说， dl.dockerpool.com是注册服务器地址，ubuntu是仓库名。
>
> 大部分时候，并不需要严格区分这两者的概念。



#### Docker Hub

##### 注册

> 你可以在 https://cloud.docker.com 免费注册一个 Docker 账号

##### 登录

> 可以通过执行docker login命令交互式的输入用户名及密码来完成在命令行界面登录Docker Hub



##### 拉取镜像

```shell
root@ruopu:~# docker search centos
NAME                               DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
centos                             The official build of CentOS.                   4939                [OK]                
ansible/centos7-ansible            Ansible on Centos7                              119                                     [OK]
# 使用search搜索镜像。可以看到返回了很多包含关键字的镜像，其中包括镜像名字、描述、收藏数(表示该镜像的受关注程度)、是否官方创建、是否自动创建。官方的镜像说明是官方项目组创建和维护的，automated 资源允许用户验证镜像的来源和内容。
# 根据是否是官方提供，可将镜像资源分为两类。
# 一种是类似centos这样的镜像，被称为基础镜像或根镜像。这些基础镜像由 Docker 公司创建、验证、支持、提供。这样的镜像往往使用单个单词作为名字。
# 还有一种类型，比如ansible/centos7-ansible镜像，它是由 Docker 的用户创建并维护的，往往带有用户名称前缀。可以通过前缀username/来指定使用某个用户提供的镜像，比如 ansible 用户。
# 另外，在查找的时候通过--filter=stars=N参数可以指定仅显示收藏数量为N以上的镜像。
root@ruopu:~# docker pull centos
Using default tag: latest
latest: Pulling from library/centos
aeb7866da422: Pull complete 
Digest: sha256:67dad89757a55bfdfabec8abd0e22f8c7c12a1856514726470228063ed86593b
Status: Downloaded newer image for centos:latest
# 使用pull命令下载镜像
```



##### 推送镜像

```shell
root@ruopu:~# docker login 
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: test
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
# 登录docker
root@ruopu:~# docker tag ubuntu:14.04 test/ubuntu:14.04
# 准备要推送的镜像，一定要写为自己docker的username
root@ruopu:~# docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
test/ubuntu   14.04               f17b6a61de28        2 days ago          188MB
# 查看在本地有了要推送的镜像
root@ruopu:~# docker push test/ubuntu:14.04
The push refers to repository [docker.io/test/ubuntu]
85a0d9a0e38e: Mounted from library/ubuntu 
fe72fc94fa1a: Mounted from library/ubuntu 
ea213108ab36: Mounted from library/ubuntu 
960c7c5516b2: Mounted from library/ubuntu 
14.04: digest: sha256:296c2904734ac0f13f3ab7265eeafb2efc33f085eeb87c875d28c360cec18700 size: 1152
# 推送镜像
ruopu@ruopu:~$ docker search test
NAME                DESCRIPTION         STARS               OFFICIAL            AUTOMATED
# 查询自己上传的镜像，没有结果。可能是因为上传的速度较慢，所以暂时看不到，并且再次上传时提示文件已存在。但登录docker hub后，发现镜像已经上传了。
```



##### 自动创建

>  自动创建(Automated Builds)功能对于需要经常升级镜像内程序来说，十分方便。
>  有时候，用户创建了镜像，安装了某个软件，如果软件发布新版本则需要手动更新镜像。而自动创建允许用户通过 Docker Hub 指定跟踪一个目标网站(目前支持 GitHub 或BitBucket)上的项目，一旦项目发生新的提交或者创建新的标签(tag)，Docker Hub 会自动构建镜像并推送到 Docker Hub 中。
>  要配置自动创建,包括如下的步骤:
>
>  * 创建并登录 Docker Hub，以及目标网站；
>
>  * 在目标网站中连接帐户到 Docker Hub；
>
>  * 在 Docker Hub 中 配置一个自动创建；
>
>  * 选取一个目标网站中的项目(需要含Dockerfile)和分支；
>
>  * 指定Dockerfile的位置，并提交创建。
>
> 之后，可以在 Docker Hub 的自动创建页面中跟踪每次创建的状态。



#### 私有仓库

#### 私有仓库高级配置

#### Nexus3



