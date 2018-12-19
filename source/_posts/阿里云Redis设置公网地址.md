---
title: 阿里云Redis设置公网地址
date: 2018-09-13 17:01:09
tags: 阿里云
categories: 阿里云
---

# 设置

1. 在云服务器 ECS Linux 中安装 rinetd

```shell
wget http://www.boutell.com/rinetd/http/rinetd.tar.gz&&tar -xvf rinetd.tar.gz&&cd rinetd
sed -i 's/65536/65535/g' rinetd.c
#修改端口范围
mkdir /usr/man&&make&&make install
#安装
```

2. 创建配置文件 rinetd.conf

```shell
vim /etc/rinetd.conf
	0.0.0.0 6379  r-ab.redis.rds.aliyuncs.com 6379
	logfile /var/log/rinetd.log
#第一条前半部分是本机监听的地址与端口，后半部分是阿里云Redis的地址与端口
```

3. 启动

```shell
rinetd
echo rinetd >>/etc/rc.local
#设置开机启动
chmod +x /etc/rc.d/rc.local
```

4. 在阿里云安全组中开放端口
5. 将ESC主机加入阿里云的白名单
6. 连接测试

```shell
redis-cli -h IP
telnet IP port
#两种方法都可以，使用telnet连接上之后，使用quit应该可以退出。
```

# 附录
> rinetd是为在一个Unix和Linux操作系统中为重定向传输控制协议(TCP)连接的一个工具。rinetd是单一过程的服务器，它处理任何数量的连接到在配置文件etc/rinetd中指定的地址/端口对。尽管rinetd使用非闭锁I/O运行作为一个单一过程，它可能重定向很多连接而不对这台机器增加额外的负担。
>
> 使用iptables 很容易将TCP 和UDP 端口从[防火墙](https://baike.baidu.com/item/%E9%98%B2%E7%81%AB%E5%A2%99)转发到内部主机上。但是如果您需要将流量从专用地址转发到甚至不在您当前网络上的机器上，又该怎么办呢？可尝试另一个应用层[端口转发](https://baike.baidu.com/item/%E7%AB%AF%E5%8F%A3%E8%BD%AC%E5%8F%91)程序，如rinetd。
>
> 这些代码有点古老，但很短小、高效，对于解决这种问题来说是非常完美的。
>
> 参考：https://baike.baidu.com/item/rinted/2590570

