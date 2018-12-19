---
title: 阿里云创建pptp_vpn
date: 2018-09-21 09:12:17
tags: 阿里云
categories: 阿里云
---



# Server

## 安装

```shell
yum install -y ppp pptpd
```

## 配置pptpd文件

```shell
vim /etc/pptpd.conf
	localip 172.17.89.106
	remoteip 172.17.0.120-123
#localip 172.17.89.106和remoteip 172.17.0.120-123分别是VPN的网关地址和VPN拨号获取地址段。

vim /etc/ppp/options.pptpd
	ms-dns 223.5.5.5
	ms-dns 223.6.6.6
#IP 地址 223.5.5.5 和 223.6.6.6是阿里云的公共 DNS 服务器地址，您可以根据需要调整为其它公共 DNS 服务地址。

vim /etc/ppp/chap-secrets
	test    *       123456     *
#设置 pptpd 的用户名和密码。根据需要添加账号，一行只添加一个用户账号。按照 用户名 pptpd 密码 IP地址 的格式输入，每一项用空格隔开。保存后退出。示例：test pptpd 123456 *，其中 * 表示所有IP。

vim /etc/ppp/ip-up
	ifconfig ppp0 mtu 1472
#设置最大传输单元 MTU，在命令符 [ -x /etc/ppp/ip-up.local ] && /etc/ppp/ip-up.local “$@” 下面添加 ifconfig ppp0 mtu 1472。
```

## 修改内核参数

```shell
vim /etc/sysctl.conf
	net.ipv4.ip_forward = 1
sysctl -p

echo 1 > /proc/sys/net/ipv4/ip_forward
#临时生效
```

## 添加防火墙规则

```shell
iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 192.168.0.0/255.255.255.0 -j SNAT --to-source 123.127.82.11
#添加 NAT 转发规则，其中123.127.82.11为您的实例公网 IP 地址
iptables-save
```

## 启动

```shell
systemctl start pptpd
systemctl enable pptpd
```



# Client

## 安装

```shell
yum install -y ppp pptp pptp-setup
```

## 创建连接

```shell
pptpsetup --create test --server 123.127.82.11 --username test --password 123456 --encrypt --start
#创建后会自动连接
vim /etc/ppp/options.pptpd
	require-mppe-128
#如果有报错，要加入这一行。
```

## 添加路由

```shell
* 实际情况，因为测试发现连接VPN后，可以连接kafka，但硬件设备不能向netty发送数据。但不连接VPN时，硬件设备可以向netty发送数据，但连接不上阿里云的kafka。判断认为，这是由于使用了阿里云提供的添加路由的方法，替换了默认网关。所以有此现象。重新调整了添加路由的命令如下
ip route add 172.17.0.0/16 via 172.17.89.106 dev ppp0
#添加一条路由，到172.17.0.0/16网络，下一跳地址是172.17.89.106，设备是ppp0。使用via指定下一跳地址。
* 阿里云方法，实际中这样是不行的
ip route replace default dev ppp0
#测试发现，要先连接VPN，再添加路由。如果VPN断开，要重新添加路由。添加后会有三条信息加入，如下第一条和最后两条
[root@bogon ~]# ip route l
default dev ppp0 scope link 
default via 10.5.5.1 dev ens160 proto static metric 100 
10.5.5.0/24 dev ens160 proto kernel scope link src 10.5.5.25 metric 100 
113.52.7.78 via 10.5.5.1 dev ens160 src 10.5.5.25 
172.17.89.106 dev ppp0 proto kernel scope link src 172.17.0.120 
```

## 添加命令

```shell
cp /usr/share/doc/ppp-2.4.5/scripts/pon /usr/sbin
cp /usr/share/doc/ppp-2.4.5/scripts/poff /usr/sbin
chmod +x /usr/sbin/pon /usr/sbin/poff
```

## 使用命令

```shell
pon test
#连接vpn
poff test
#关闭vpn连接
```

参考：https://help.aliyun.com/knowledge_detail/41345.html?spm=5176.11065259.1996646101.searchclickresult.7c0b72c0WCltyE&accounttraceid=1de748fe-9665-48c9-972a-021e6cfdf811#CentOSVPNclient