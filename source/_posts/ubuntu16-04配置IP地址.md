---
title: ubuntu16.04配置IP地址
date: 2018-11-26 16:21:32
tags: ubuntu16.04
categories: ubuntu
---

### 配置IP

```shell
vim /etc/network/interfaces
    auto eno1
    iface eno1 inet static
    address 10.5.5.198/24

    auto eno2
    iface eno2 inet static
    address 192.168.0.198/24
    gateway 192.168.0.1
# 配置网卡时，如果有两块网卡，只指定一个网关，不然重启网卡时会报错:
# RTNETLINK answers: File exists
# Failed to bring up eth2.
# 如果两块网卡都是dhcp获得地址，就不会有报错的问题
# auto enp7s0 // 使用的网络接口，之前查询接口是为了这里
# iface enp7s0 inet static // enp7s0这个接口，使用静态ip设置
# address 10.0.208.222 // 设置ip地址
# netmask 255.255.240.0 // 设置子网掩码
# gateway 10.0.208.1 // 设置网关
# dns-nameservers 10.0.208.1 // 设置dns服务器地址。nameserver也可以写在resolve.conf文件中
/etc/init.d/networking restart
# 重启网卡生效
ip addr flush dev eno2 && /etc/init.d/networking restart
# 如果重启网卡不能生效，需要使用ip addr flush清除一下网卡的配置，再重启网卡就没问题了。
# 参考：https://my.oschina.net/zhaomengit/blog/375360
# 参考：https://www.jianshu.com/p/d69a95aa1ed7
```

