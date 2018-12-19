---
title: Create VPN
date: 2018-06-22 08:24:07
tags: 创建PPTP_VPN
categories: 网络
---



### 查看系统是否支持PPP
```
cat /dev/ppp
	cat: /dev/ppp: No such device or address
//如果出现以上提示则说明ppp是开启的，可以正常架设pptp服务，若出现Permission denied等其他提示，你需要先去VPS面板里看看有没有enable ppp的功能开关，如果没有则需要发个消息给你的提供商，让他们帮你开通，否则就不必要看下去了，100%无法成功配置PPTP。如果没有此包，可能通过yum安装
```
### 设置内核转发
```
* CentOS6
echo 1 > /proc/sys/net/ipv4/ip_forward
sed -i 's#net.ipv4.ip_forward = 0#net.ipv4.ip_forward = 1#g' /etc/sysctl.conf
sysctl -p
* CentOS7
echo 1 > /proc/sys/net/ipv4/ip_forward
sed -i 's#net.ipv4.ip_forward = 0#net.ipv4.ip_forward = 1#g' /usr/lib/sysctl.d/50-default.conf
//CentOS7在/usr/lib/sysctl.d/50-default.conf中设置，/etc/sysctl.conf是没有设置的
sysctl -p
```
### 安装PPTP
```
yum install epel-release
yum -y install pptpd
```
###  配置PPTP
```
vim /etc/pptpd.conf
localip 10.5.5.70
remoteip 192.168.2.200-210
# 添加本机公网IP（localip）,这里因为没有公网IP，所以添加的也是内网IP，分配VPN用户的内网网段（remoteip）。
```
### 设置用户名和密码
```
vim /etc/ppp/chap-secrets
	# client	server	secret	IP addresses
        ccjd	*	CCjd1rj.com	*
//配置有四段，第二段与第四段为星号
```
### 启动pptp服务
```
systemctl start pptpd
netstat -tlnp
//服务监听在TCP的1723端口
```
### 端口映射
**将公网的1723端口映射到内网的1723端口**
### windows客户端设置
**创建客户端**

<img src="/images/Creat-VPN/vpn1.png"/>

![](/images/Creat-VPN/vpn2.png)

<img src="/images/Creat-VPN/vpn3.png"/>
<img src="/images/Creat-VPN/vpn4.png"/>
<img src="/images/Creat-VPN/vpn5.png"/>
<img src="/images/Creat-VPN/vpn6.png"/>
<img src="/images/Creat-VPN/vpn7.png"/>

### 故障解决及使用技巧
* 现象：连接VPN后无法连接外网；解决：查看问题在于网关，网上有建议取消“在远程网络上使用默认网关”。测试此法可行**

<img src="/images/Creat-VPN/vpn8.png"/>

<img src="/images/Creat-VPN/vpn9.png"/>

<img src="/images/Creat-VPN/vpn10.png"/>

<img src="/images/Creat-VPN/vpn11.png"/>

<img src="/images/Creat-VPN/vpn12.png"/>



* 查看vpn在线用户

```shell
[root@1 ~]# last|grep still|grep ppp
ccjd     ppp1         106.38.36.98     Tue Oct  9 09:53   still logged in   
ccjd     ppp0         106.38.36.98     Tue Oct  9 00:09   still logged in
```







