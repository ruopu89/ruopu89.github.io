---
title: RabbitMQ部署
date: 2018-10-18 14:52:42
tags: RabbitMQ部署
categories: 消息队列
---

### 介绍

> RabbitMQ是一个开源的AMQP实现，服务器端用Erlang语言编写，支持多种客户端，如：Python、Ruby、.NET、Java、JMS、C、PHP、ActionScript、XMPP、STOMP等，支持AJAX。用于在分布式系统中存储转发消息，在易用性、扩展性、高可用性等方面表现不俗。
>
> AMQP，即Advanced message Queuing Protocol，高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。消息中间件主要用于组件之间的解耦，消息的发送者无需知道消息使用者的存在，反之亦然。
>
> AMQP的主要特征是面向消息、队列、路由（包括点对点和发布/订阅）、可靠性、安全。



### 概念

> * RabbitMQ Server也称为Broker Server，是一种传输服务。它的角色就是维护一条从Producer（生产者）到Consumer（消费者）的路线，保证数据能够按照指定的方式进行传输。虽然这个保证也不是100%的保证，但是对于普通的应用来说这已经足够了。当然对于商业系统来说，可以再做一层数据一致性的guard，就可以彻底保证系统的一致性了。
> * producer：数据的发送方。Create messages and publish (send) them to a Broker Server (RabbitMQ)。一个Message有两个部分：payload（有效载荷）和label（标签）。payload顾名思义就是传输的数据。label是exchange的名字或者说是一个tag，它描述了payload，而且RabbitMQ也是通过这个label来决定把这个Message发给哪个Consumer。AMQP仅仅描述了label，而RabbitMQ决定了如何使用这个label的规则。
> * consumer：数据的接收方。Consumers attach to a Broker Server (RabbitMQ) and subscribe to a queue。把queue比作是一个有名字的邮箱。当有Message到达某个邮箱后，RabbitMQ把它发送给它的某个订阅者即Consumer。当然可能会把同一个Message发送给很多的Consumer。在这个Message中，只有payload，label已经被删掉了。对于Consumer来说，它是不知道谁发送的这个信息的,就是协议本身不支持。如果Producer发送的payload包含了Producer的信息就另当别论了。
> * Connection：就是一个TCP的连接。Producer和Consumer都是通过TCP连接到RabbitMQ Server的。
> * Connection Factory：连接管理器。应用程序与Rabbit之间建立连接的管理器，程序代码中使用；
> * Channel：信道。消息推送使用的通道。虚拟连接。它建立在上述的TCP连接中。数据流动都是在Channel中进行的。也就是说，一般情况是程序起始建立TCP连接，第二步就是建立这个Channel。因为对于系统来说，建立和关闭TCP连接是有代价的，频繁的建立关闭TCP连接对于系统的性能有很大的影响，而且TCP的连接数也有限制，这也限制了系统处理高并发的能力。但是，在TCP连接中建立Channel是没有上述代价的。对于Producer或者Consumer来说，可以并发的使用多个Channel进行Publish或者Receive。
> * exchanges：消息交换机，它指定消息按什么规则，路由到哪个队列。
> * Queue：消息队列载体，每个消息都会被投入到一个或多个队列，用于存储生产者的消息。
> * Binding：绑定是如何将消息从Exchange路由到特定队列的。也就是把exchange和queue按照路由规则绑定起来。
> * Routing Key：路由关键字，exchange根据这个关键字进行消息投递
> * ***由Exchange、Queue、RoutingKey三个才能决定一个从Exchange到Queue的唯一的线路。***
> * VHost：虚拟主机，一个broker里可以开设多个vhost，用作不同用户的权限分离。



#### publish消息确认机制

>  如果采用标准的 AMQP 协议，则唯一能够保证消息不会丢失的方式是利用事务机制 — 令 channel 处于 transactional 模式、向其 publish 消息、执行 commit 动作。在这种方式下，事务机制会带来大量的多余开销，并会导致吞吐量下降 250% 。为了补救事务带来的问题，引入了 confirmation 机制（即 Publisher Confirm）。
>
> confirm 机制是在channel上使用 confirm.select方法，处于 transactional 模式的 channel 不能再被设置成 confirm 模式，反之亦然。
>
> 在 channel 被设置成 confirm 模式之后，所有被 publish 的后续消息都将被 confirm（即 ack） 或者被 nack 一次。但是没有对消息被 confirm 的快慢做任何保证，并且同一条消息不会既被 confirm 又被 nack 。
>
> RabbitMQ 将在下面的情况中对消息进行 confirm ：
>
> 1. RabbitMQ发现当前消息无法被路由到指定的 queues 中；
> 2. 非持久属性的消息到达了其所应该到达的所有 queue 中（和镜像 queue 中）；
> 3. 持久消息到达了其所应该到达的所有 queue 中（和镜像 queue 中），并被持久化到了磁盘（被 fsync）；
> 4. 持久消息从其所在的所有 queue 中被 consume 了（如果必要则会被 acknowledge）。



#### consumer消息确认机制

> 为了保证数据不被丢失，RabbitMQ支持消息确认机制，即acknowledgments。
>
> 如果没启动消息确认机制，RabbitMQ在consumer收到消息后就会把消息删除。
>
> 启用消息确认后，consumer在处理数据后应通过回调函数显示发送ack， RabbitMQ收到ack后才会删掉数据。如果consumer一段时间内不回馈，RabbitMQ会将该消息重新分配给另外一个绑定在该队列上的consumer。另一种情况是consumer断开连接，但是获取到的消息没有回馈，则RabbitMQ同样重新分配。
>
> 注意：如果consumer 没调用basic.qos 方法设置prefetch_count=1，那即使该consumer有未ack的messages，RabbitMQ仍会继续发messages给它。



#### 消息持久化

>消息确认机制确保了consumer退出时消息不会丢失，但如果是RabbitMQ本身因故障退出，消息还是会丢失。为了保证在RabbitMQ出现意外情况时数据仍没有丢失，需要将queue和message都要持久化。
>
>queue持久化：channel.queue_declare(queue=’hello’, durable=True)
>
>message持久化：channel.basic_publish(exchange=”,
>
>routing_key=”task_queue”,
>
>body=message,
>
>properties=pika.BasicProperties(
>
>delivery_mode = 2,)  #消息持久化
>
>)
>
>即使有消息持久化，数据也有可能丢失，因为rabbitmq是先将数据缓存起来，到一定条件才保存到硬盘上，这期间rabbitmq出现意外数据有可能丢失。
>
>网上有测试表明：持久化会对RabbitMQ的性能造成比较大的影响，可能会下降10倍不止。



#### RABBITMQ集群基本概念

>一个RABBITMQ集群中可以共享user，virtualhosts，queues（开启Highly Available Queues），exchanges等。但message只会在创建的节点上传输。当message进入A节点的queue中后，consumer从B节点拉取时，RabbitMQ会临时在A、B间进行消息传输，把A中的消息实体取出并经过B发送给consumer。所以consumer应尽量连接每一个节点，从中取消息。
>
>RABBITMQ的集群节点包括内存节点、磁盘节点。内存节点的元数据仅放在内存中，性能比磁盘节点会有所提升。不过，如果在投递message时，打开了message的持久化，那么内存节点的性能只能体现在资源管理上，比如增加或删除队列（queue），虚拟主机（vrtual hosts），交换机（exchange）等，发送和接受message速度同磁盘节点一样。<font color=green>一个集群至少要有一个磁盘节点。</font>



#### **镜像队列概念**

> 镜像队列可以同步queue和message，当主queue挂掉，从queue中会有一个变为主queue来接替工作。
>
> 镜像队列是基于普通的集群模式的,所以你还是得先配置普通集群,然后才能设置镜像队列。
>
> 镜像队列设置后，会分一个主节点和多个从节点，如果主节点宕机，从节点会有一个选为主节点，原先的主节点起来后会变为从节点。
>
> queue和message虽然会存在所有镜像队列中，但客户端读取时不论物理机连接的主节点还是从节点，都是从主节点读取数据，然后主节点再将queue和message的状态同步给从节点，因此多个客户端连接不同的镜像队列不会产生同一message被多次接受的情况。



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
# 安装后没有此文件，自已创建此文件并加入上面内容，不要忘记最后的点
rabbitmq-plugins enable rabbitmq_management
# 开启网页管理页面的插件。如果停用可以使用disable参数
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



### 集群部署

#### 创建并加入集群

```shell
==============================================================================================
准备三台主机
主机名：rabbitmq1	地址：192.168.1.60
主机名：rabbitmq2	地址：192.168.1.61
主机名：rabbitmq3	地址：192.168.1.62

注意事项
1. 三台主机互相可以解析主机名，erlang是通过主机名来连接服务，必须保证各个主机名之间可以ping通。
2. 三台主机的cookie文件要一致
3. 如果queue是非持久化queue，则如果创建queue的那个节点失败，发送方和接收方可以创建同样的queue继续运作。但如果是持久化queue，则只能等创建queue的那个节点恢复后才能继续服务。
4. 在集群元数据有变动的时候需要有disk node在线，但是在节点加入或退出的时候所有的disk node必须全部在线。如果没有正确退出disk node，集群会认为这个节点当掉了，在这个节点恢复之前不要加入其它节点。.

集群创建流程
1. 关闭两个节点的rabbitmq服务
2. 第一个节启动rabbitmq服务，将cookie文件与hosts文件复制到另两个节点
3. 另两个节点将cookie文件的属主属组改为rabbitmq。启动rabbitmq服务，关闭5672端口，加入集群，再启动5672端口
==============================================================================================
------------------------
  rabbitmq2&3
------------------------
[root@rabbitmq1 ~]# ps aux|grep rabbit|awk '{print $2}'|xargs kill -9
# 杀掉三台主机上的rabbitmq进程

-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# systemctl start rabbitmq-server
# rabbitmq1上的服务不能关闭
[root@rabbitmq1 ~]# scp /var/lib/rabbitmq/.erlang.cookie 192.168.1.61:/var/lib/rabbitmq/ 
[root@rabbitmq1 ~]# scp /var/lib/rabbitmq/.erlang.cookie 192.168.1.62:/var/lib/rabbitmq/
# 将cookie文件传到另两台主机，使三台主机的cookie文件一致
[root@rabbitmq1 ~]# vim /etc/hosts
192.168.1.60 rabbitmq1
192.168.1.61 rabbitmq2
192.168.1.62 rabbitmq3
[root@rabbitmq1 ~]# scp /etc/hosts 192.168.1.61:/etc/
[root@rabbitmq1 ~]# scp /etc/hosts 192.168.1.62:/etc/

------------------------
  rabbitmq2&3
------------------------
[root@rabbitmq3 ~]# chown rabbitmq.rabbitmq /var/lib/rabbitmq/.erlang.cookie
# cookie文件的属主属组应该是rabbitmq，启动rabbitmq程序的也是rabbitmq用户
[root@rabbitmq2 ~]# systemctl start rabbitmq-server.service
# 启动两个节点的rabbitmq服务

-----------------
  rabbitmq1
-----------------
# 下面进行加入集群工作
[root@rabbitmq1 ~]# rabbitmqctl cluster_status
Cluster status of node rabbit@rabbitmq1 ...
[{nodes,[{disc,[rabbit@rabbitmq1]}]},
 {running_nodes,[rabbit@rabbitmq1]},
 {cluster_name,<<"rabbit@rabbitmq1">>},
 {partitions,[]}]
...done.
# 在rabbitmq1上查看集群中主机的情况，这时只有一台主机

-----------------
  rabbitmq2
-----------------
[root@rabbitmq2 ~]# rabbitmqctl stop_app
Stopping node rabbit@rabbitmq2 ...
...done.
# 关闭应用，也就是关闭了5672端口
[root@rabbitmq2 ~]# rabbitmqctl join_cluster rabbit@rabbitmq1
Clustering node rabbit@rabbitmq2 with rabbit@rabbitmq1 ...
...done.
# 加入集群，集群名称rabbit@rabbitmq1是在rabbitmq1上查看集群信息显示的
[root@rabbitmq2 ~]# rabbitmqctl start_app
Starting node rabbit@rabbitmq2 ...
...done.
# 启动应用
[root@rabbitmq2 ~]#  rabbitmq-plugins enable rabbitmq_management
# 两个从节点也一定要启动rabbitmq_management，不然在网页中可以看到两个从节点，但提示"Node statistics not available"

-----------------
  rabbitmq3
-----------------
[root@rabbitmq3 ~]# rabbitmqctl stop_app
Stopping node rabbit@rabbitmq3 ...
...done.
[root@rabbitmq3 ~]# rabbitmqctl join_cluster rabbit@rabbitmq1
Clustering node rabbit@rabbitmq3 with rabbit@rabbitmq1 ...
...done.
[root@rabbitmq3 ~]# rabbitmqctl start_app
Starting node rabbit@rabbitmq3 ...
...done.
[root@rabbitmq3 ~]#  rabbitmq-plugins enable rabbitmq_management

-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# rabbitmqctl cluster_status
Cluster status of node rabbit@rabbitmq1 ...
[{nodes,[{disc,[rabbit@rabbitmq1,rabbit@rabbitmq2,rabbit@rabbitmq3]}]},
 {running_nodes,[rabbit@rabbitmq3,rabbit@rabbitmq2,rabbit@rabbitmq1]},
 {cluster_name,<<"rabbit@rabbitmq1">>},
 {partitions,[]}]
...done.
# 这时可以看到三台主机在集群中，[{nodes,[{disc,[rabbit@rabbitmq1,rabbit@rabbitmq2,rabbit@rabbitmq3]}]},中的disc表示三个节点都是磁盘节点，后面是节点的名称。
```



#### 改变存储模式

```shell
--------------------
  rabbitmq1&2
--------------------
[root@rabbitmq1 ~]# rabbitmqctl stop_app
Stopping node rabbit@rabbitmq1 ...
...done.
[root@rabbitmq1 ~]# rabbitmqctl change_cluster_node_type ram
Turning rabbit@rabbitmq1 into a ram node ...
...done.
# 改两个节点为内存节点，ram表示内存节点，disc表示磁盘节点
[root@rabbitmq1 ~]# rabbitmqctl start_app
Starting node rabbit@rabbitmq1 ...
...done.

-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# rabbitmqctl cluster_status
Cluster status of node rabbit@rabbitmq1 ...
[{nodes,[{disc,[rabbit@rabbitmq3]},{ram,[rabbit@rabbitmq2,rabbit@rabbitmq1]}]},
 {running_nodes,[rabbit@rabbitmq2,rabbit@rabbitmq3,rabbit@rabbitmq1]},
 {cluster_name,<<"rabbit@rabbitmq1">>},
 {partitions,[]}]
...done.
# 这时可以看到节点3为磁盘节点，另外两个为内存节点
```



#### 退出集群

```shell
-----------------
  rabbitmq2
-----------------
[root@rabbitmq2 ~]# rabbitmqctl stop_app
Stopping node rabbit@rabbitmq2 ...
...done.
[root@rabbitmq2 ~]# rabbitmqctl reset
Resetting node rabbit@rabbitmq2 ...
...done.
[root@rabbitmq2 ~]# rabbitmqctl start_app
Starting node rabbit@rabbitmq2 ...
...done.

-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# rabbitmqctl forget_cluster_node rabbit@rabbitmq2
Removing node rabbit@rabbitmq2 from cluster ...
Error: {not_a_cluster_node,"The node selected is not in the cluster."}
# 移除节点时会有一个错误提示："选定的节点不在群集中。"
[root@rabbitmq1 ~]# rabbitmqctl cluster_status                      
Cluster status of node rabbit@rabbitmq1 ...
[{nodes,[{disc,[rabbit@rabbitmq3]},{ram,[rabbit@rabbitmq1]}]},
 {running_nodes,[rabbit@rabbitmq3,rabbit@rabbitmq1]},
 {cluster_name,<<"rabbit@rabbitmq1">>},
 {partitions,[]}]
...done.
# 再查看已经没有rabbitmq2节点了
```



#### 集群重启

```shell
# 集群重启时，最后一个挂掉的节点应该第一个重启，如果因特殊原因（比如同时断电），而不知道哪个节点最后一个挂掉。可用以下方法重启：

* 先在一个节点上执行
rabbitmqctl force_boot
service rabbitmq-server start

* 在其他节点上执行
service rabbitmq-server start

* 查看cluster状态是否正常（要在所有节点上查询）。
rabbitmqctl cluster_status

 # 如果有节点没加入集群，可以先退出集群，然后再重新加入集群。

# 上述方法不适合内存节点重启，内存节点重启的时候是会去磁盘节点同步数据，如果磁盘节点没起来，内存节点一直失败。
```



#### 配置镜像队列

```shell
-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# rabbitmqctl list_queues
Listing queues ...
...done.
# 查看队列
[root@rabbitmq1 ~]# rabbitmqctl eval 'rabbit_amqqueue:declare({resource,<<"/">>,queue,<<"hello">>},true,false,[],none).'
{new,{amqqueue,{resource,<<"/">>,queue,<<"hello">>},
               true,false,none,[],<5370.11741.0>,[],[],undefined,[],[]}}
...done.
# 创建一个叫hello的队列
[root@rabbitmq1 ~]# rabbitmqctl list_queues
Listing queues ...
hello   0
test    0
...done.
# 现在可以看到两个队列，test队列是在web页面上创建的，相对简单，只要在queues页面中添加一个队列，输入队列名即可完成简单的创建。
[root@rabbitmq1 ~]# rabbitmqctl set_policy ha-all "test" '{"ha-mode":"all"}'    
Setting policy "ha-all" for pattern "test" to "{\"ha-mode\":\"all\"}" with priority "0" ...
...done.
# 把名为“test”的队列设置为同步给所有节点
# ha-all 是同步模式，指同步给所有节点，还有另外两种模式ha-exactly表示在指定个数的节点上进行镜像，节点的个数由ha-params指定，ha-nodes表示在指定的节点上进行镜像，节点名称通过ha-params指定；
# test 是同步的队列名，可以用正则表达式匹配；
# {"ha-mode":"all"} 表示同步给所有，同步模式的不同，此参数也不同。
```

![](/images/rabbitmq/创建队列.png)

> 执行上面命令后，可以在web管理界面查看queue 页面，里面test队列的node节点后会出现+2标签，表示有2个从节点，而主节点则是当前显示的node。而hello因为没有设置镜像队列，所以没有+2标签。



#### 创建帐户

```shell
-----------------
  rabbitmq2
-----------------
[root@rabbitmq2 ~]# rabbitmqctl stop_app
Stopping node rabbit@rabbitmq2 ...
...done.
[root@rabbitmq2 ~]# rabbitmqctl join_cluster rabbit@rabbitmq1
Clustering node rabbit@rabbitmq2 with rabbit@rabbitmq1 ...
...done.
[root@rabbitmq2 ~]# rabbitmqctl start_app
Starting node rabbit@rabbitmq2 ...
...done.
# 先将rabbitmq2加入集群

-----------------
  rabbitmq1
-----------------
[root@rabbitmq1 ~]# rabbitmqctl add_user test centos
Creating user "test" ...
...done.
# 创建一个叫test的用户，密码是centos
[root@rabbitmq1 ~]# rabbitmqctl set_user_tags test administrator
Setting tags for user "test" to [administrator] ...
...done.
# 给test用户添加一个管理员的角色
[root@rabbitmq1 ~]# rabbitmqctl set_permissions -p / test ".*" ".*" ".*"
Setting permissions for user "test" in vhost "/" ...
...done.
# 在根虚拟机里设置test用户配置权限、写权限、读权限。.*是正则表达式。rabbitmq的权限是根据不同的虚拟主机（virtual hosts）配置的，同用户在不同的虚拟主机（virtual hosts）里可能不一样。

---------------------
  rabbitmq2&3
---------------------
[root@rabbitmq2 ~]# rabbitmqctl list_users
Listing users ...
guest   [administrator]
test    [administrator]
...done.
# 因为是集群，只要在一台主机设置即可，其它会自动同步。
```



### 问题

#### Node statistics not available

![](/images/rabbitmq/问题一.png)

```shell
# 显示Node statistics not available是因为节点的web插件未启用
---------------------
  rabbitmq2&3
---------------------
[root@rabbitmq2 ~]# rabbitmq-plugins enable rabbitmq_management
The following plugins have been enabled:
  mochiweb
  webmachine
  rabbitmq_web_dispatch
  amqp_client
  rabbitmq_management_agent
  rabbitmq_management
Plugin configuration has changed. Restart RabbitMQ for changes to take effect.
[root@rabbitmq2 ~]# systemctl restart rabbitmq-server.service
# 需要重新启动才能生效
# 如果不能启动插件，可以先rabbitmqctl stop_app，之后再添加
```

![](/images/rabbitmq/问题一解决.png)

