---
title: nmcli命令使用
date: 2020-01-09 08:51:42
tags: nmcli
categories: 基础
---

### 介绍

nmcli命令 是 NetworkManager client 网络管理客户端。



### 语法

`nmcli [OPTIONS] OBJECT { COMMAND | help }`

#### 选项

OBJECT和COMMAND可以用全称也可以用简称，最少可以只用一个字母，建议用头三个字母。OBJECT里面我们平时用的最多的就是connection和device。device叫网络接口，是物理设备。connection是连接，偏重于逻辑设置。多个connection可以应用到同一个device，但同一时间只能启用其中一个connection。这样的好处是针对一个网络接口，我们可以设置多个网络连接，比如静态IP和动态IP，再根据需要up相应connection。

```shell
OPTIONS   
-t[erse]                                  # terse output 简洁的输出   
-p[retty]                                 # pretty output 漂亮的输出   
-m[ode] tabular|multiline                 # output mode  输出模式   
-f[ields] <field1,field2,...>|all|common  # specify fields to output 指定要输出的字段   
-e[scape] yes|no                          # escape columns separators in values 在值中转义列分隔符   
-n[ocheck]                                # 不要检查nmcli和NetworkManager版本   
-a[sk]                                    # 要求缺少参数   
-w[ait] <seconds>                         # 设置超时等待整理操作   
-v[ersion]                                # 显示程序版本   
-h[elp]                                   # 打印此帮助  

OBJECT   
g[eneral]       # NetworkManager的一般状态和操作   
n[etworking]    # 整体组网控制   
r[adio]         # NetworkManager切换开关   
c[onnection]    # NetworkManager的连接   
d[evice]        # 由NetworkManager管理的设备   
a[gent]         # NetworkManager秘密代理或polkit代理
```



### 举例

```shell
***修改网卡的IP地址并添加DNS***
nmcli connection modify enp0s3 ipv4.method manual autoconnect yes ipv4.addresses 192.168.1.115/24 gw4 192.168.1.1
# 修改现在网卡的IP地址，并设置为静态地址。指定地址要用ipv4.addresses选项，不能用选项。
# autoconnect yes是控制配置文件中的ONBOOT是yes还是no的。配置文件就是
# /etc/sysconfig/network-scripts/ifcfg-enp0s3。
nmcli connection modify enp0s3 ipv4.dns 114.114.114.114
# 指定dns地址。改变地址与DNS都需要重启接口
nmcli con up enp0s3
# 重启，立即生效。不要使用nmcli con down enp0s3后再使用nmcli con up enp0s3，如果这样操作的话，会
# 在现有的网卡上再添加一个地址。立即生效的方法还有nmcli dev reapply enp0s3和nmcli dev connect enp0s3，未测试

删除网卡上的IP地址
# 在网卡有多个IP地址时可以删除，也可以使用加号添加
nmcli connection modify enp0s3 -ipv4.addresses 192.168.1.112/24
# 可以使用加减号来控制添加或删除一个地址，如上面就是删除一个地址
nmcli con up enp0s3
# 重启才能生效


给现有网卡添加一个新的地址
nmcli con modify enp0s3 ip4 192.168.1.105/24 gw4 192.168.1.1
# 给现在的接口添加一个新ip地址，这样网卡就有两个地址了
nmcli con up enp0s3
# 重启。
# 测试发现，如果通过编辑配置文件修改地址后，要先重启NetworkManager再使用此命令启动网卡，才能使地址生
# 效，不然直接使用此命令是无法使地址生效的。

***给现有网卡创建一个新的connection***
# 这样创建后，一块网卡就会有多个配置，这样就可以用不同配置启动网卡了，但只能有一个connection是连接的
nmcli con add con-name dhcp type ethernet ifname eno16777728
# 动态获取IP方式的网络连接配置
nmcli con add con-name static ifname eno16777728 autoconnect yes type ethernet ip4 10.1.254.254/16 gw4 10.1.0.1
# 指定静态IP方式的网络连接配置，添加新的连接，连接名用con-name指定为eno16777728，type指定类型，ifname指定接口名

nmcli net on/off
# 启用/关闭所有的网络连接
nmcli dev dis eno33554960
# 禁用网络设备并防止自动激活
nmcli con add help
# 查看添加网络连接配置的帮助

# 修改网络连接单项参数
nmcli con mod IF-NAME connection.autoconnect yes
# 修改为自动连接
nmcli con mod IF-NAME ipv4.method manual | dhcp
# 修改IP地址是静态还是DHCP
nmcli con mod IF-NAME ipv4.addresses “172.25.X.10/24 172.25.X.254”
# 修改IP配置及网关
nmcli con mod IF-NAME ipv4.gateway 10.1.0.1
# 修改默认网关
nmcli con mod IF-NAME +ipv4.addresses 10.10.10.10/16
# 添加第二个IP地址
nmcli con mod IF-NAME ipv4.dns 114.114.114.114
# 添加dns1
nmcli con mod IF-NAME +ipv4.dns  8.8.8.8
# 添加dns2
nmcli con mod IF-NAME -ipv4.dns  8.8.8.8
# 删除dns

nmcli connection show           
# 查看当前连接状态 
nmcli connection show --active       
# 显示活动的网络连接 
nmcli connection show eno16777736    
# 显示指定网络连接的详情 
nmcli device status                
# 显示网络设备状态 
nmcli device show eno16777736   
# 显示指定网络设备的详情
nmcli device show               
# 显示全部网络接口属性 
nmcli con up static             
# 启用static连接配置 
nmcli con up default            
# 启用default连接配置  
nmcli con add help              
# 查看帮助
nmcli con up eno16777728
# 启用网络连接
nmcli con down eno33554960
# 停用网络连接（可被自动激活）
nmcli con del eno33554960
# 删除网络连接的配置文件
nmcli con reload
# 重新加载配置网络配置文件
```



