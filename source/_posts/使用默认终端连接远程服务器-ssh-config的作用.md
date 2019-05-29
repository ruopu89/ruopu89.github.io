---
title: 使用默认终端连接远程服务器(.ssh/config的作用)
date: 2019-05-29 14:02:30
tags: ssh连接远程终端
categories: 网络
---

```shell
如果使用系统上的默认终端连接多个远程终端？
1. 创建公钥并传到远程服务器
ssh-keygen -t rsa -P ''
ssh-copy-id -i ~/.ssh/id_rsa.pub 10.129.14.4

2. 配置
vim .ssh/config
# 此文件开始是没有的，手动添加即可
Host dl-gw-01              # 在ssh连接时要使用的远程主机名，这个名字是自定义的
    HostName 10.129.14.4		# 远程主机地址
    Port 22		# 远程主机ssh端口
    User root		# 远程主机的用户名

3. 关闭服务器上的密码认证，开启公钥认证，在/etc/ssh/sshd_conf中修改下面即可
PubkeyAuthentication yes 			# 开启公钥认证
PasswordAuthentication no			# 关闭密码认证

4. .ssh/config的使用方法
Host dl-gw-01
    HostName 10.129.14.4
    
Host dl-gw-02
    HostName 10.129.14.5
    
Host dl-gw-*
    User root		# 这样使用的方式是一个通用配置，只要是dl-gw-开头的主机都使用root用户登录
   
Host *
    Port 22		# 这样使用通用配置也可以
    
5. 连接
ssh dl-gw-01
```

参考：<https://www.cnblogs.com/xjshi/p/9146296.html>