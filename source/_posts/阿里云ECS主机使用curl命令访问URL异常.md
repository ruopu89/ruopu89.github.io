---
title: 阿里云ECS主机使用curl命令访问URL异常
date: 2020-03-03 19:39:24
tags: 阿里云
categories: 阿里云
---

#### 背景

用户使用阿里云ECS主机，通过阿里NAT服务联网，当使用`curl --location --request GET 'http://chygdxw.cn/gehua/2020/02/19/C7C4F31F-B4DD-41DE-9964-2EF967FFA7C9_SDV_0.mp4'`会提示：Recv failure: Connection reset by peer。使用一台绑定弹性公网IP的主机访问正常



#### 解决

阿里帮助解决，原因为：对端（指服务端）有发送分片报文，SNAT（指阿里NAT服务）是不支持IP分片包的，因为没法对他进行五元组（指源IP、源端口、协议、目标IP、目标端口）的分类，映射到session上，EIP没有session，所以会有问题。NAT网关的SNAT不支持IP分片。需要服务端发送完整的报文。分片报文是到目标才进行重组，但是经过snat，后端有多个ECS，无法到达准确的ECS。所谓分片就是将一个报文分片成2个或多个报文发送。比较明显的特点是分片的报文的源目端口是缺少的，只有在最后一个分片上才有源目端口

![](/images/ali分片报文发送/分片报文发送1.png)