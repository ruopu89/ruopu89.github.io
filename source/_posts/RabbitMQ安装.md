---
title: RabbitMQ安装
date: 2018-10-18 14:52:42
tags: RabbitMQ安装
categories: 消息队列
---

### 安装

* 下载rpm包
  http://www.rabbitmq.com/download.html

![](/images/rabbitmq/下载页面1.jpg)

* 分别点击两个箭头指向的页面下载相应包

![](/images/rabbitmq/下载页面2.jpg)

* 箭头指向为CentOS7中可以安装的erlang的rpm包和rabbitmq的rpm包

![](/images/rabbitmq/下载页面3.jpg)

![](/images/rabbitmq/下载页面4.jpg)

```shell
yum install -y erlang-19.3.6.11-2.el7.centos.x86_64.rpm
yum install -y rabbitmq-server-3.6.16-2.el7.noarch.rpm
# 将两个rpm包上传到服务器并安装
vim /etc/rabbitmq/rabbitmq.config
	[{rabbit, [{loopback_users, []}]}].
# 安装后没有此文件，自已创建此文件并加入上面内容，不要忘记最后点
rabbitmq-plugins enable rabbitmq_management
# 开启网页管理页面的插件
cd /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.16/plugins/
wget https://dl.bintray.com/rabbitmq/community-plugins/rabbitmq_delayed_message_exchange-0.0.1.ez
# 消息延迟发送给消费者的插件
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
service rabbitmq-server start
# 如果无法启动，可以使用journalctl -xe > /root/abc.txt命令将报错信息重定向到一个文件，并查看。测试中无法启动是因为上面的配置文件写错了，改成上面的样子后启动就没问题了。
ss -tlnp
# rabbitmq的网页默认监听在15672端口上，服务器监听在5672端口
```

* 访问rabbitmq远程管理页面。默认用户名和密码都是guest

![](/images/rabbitmq/登录1.jpg)

![](/images/rabbitmq/登录2.jpg)



### 添加用户

#### 账号级别

* 超级管理员administrator，可以登录控制台，查看所有信息，可以对用户和策略进行操作
* 监控者monitoring，可以登录控制台，可以查看节点的相关信息，比如进程数，内存磁盘使用情况
* 策略制定者policymaker，可以登录控制台，制定策略，但是无法查看节点信息
* 普通管理员management，仅能登录控制台
* 其他，无法登录控制台，一般指的是提供者和消费者

#### 添加账号

##### 命令添加

```shell
rabbitmqctl add_user username password
#添加用户和密码
rabbitmqctl set_user_tags username Account_level
# 给用户一个账号级别，如administrator,monitoring等
```

##### 网页添加

* 添加用户

![](/images/rabbitmq/添加用户1.jpg)

* 添加后的用户还没有指定可以访问的路径

![](/images/rabbitmq/添加用户2.jpg)

* 添加虚拟主机

![](/images/rabbitmq/添加虚拟主机1.jpg)

* 点击/test进入页面，之后指定用户。这相当于建立了一个用户可以访问的库

![](/images/rabbitmq/添加虚拟主机2.jpg)

![](/images/rabbitmq/添加虚拟主机3.jpg)

![](/images/rabbitmq/添加用户3.jpg)