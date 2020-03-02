---
title: netplan命令
date: 2018-11-21 11:25:40
tags: 网络命令
categories: 网络
---

### 工作原理

Netplan 从 /etc/netplan/*.yaml 读取配置，配置可以是管理员或者系统安装人员配置； 也可以是云镜像或者其他操作系统部署设施自动生成。 在系统启动阶段早期， Netplan 在 /run 目录生成好配置文件并将设备控制权交给相关后台程序。

![](/images/netplan/netplan.png)

Netplan 目前支持以下两种 **网络管理工具** ：

- NetworkManager
- Systemd-networkd

一言以蔽之，从前你需要根据不同的管理工具编写网络配置，现在 Netplan 将管理工具差异性给屏蔽了。 你只需按照 Netplan 规范编写 YAML 配置，不管底层管理工具，只要有这份配置文件即可。



#### 配置

```shell
network:
    version: 2
    renderer: NetworkManager
# 这个配置让 NetworkManager 管理所有网络设备 （默认，只要检测到以太网设备接线，便以 DHCP 模式启动该设备）。

# 使用 Systemd-networkd ，则不会自动启动网络设备； 每个需要启用的网卡均需要在 /etc/netplan 配置文
# 件中指定配置。 网络配置示例如下：
network:
    ethernets:
        enp0s3:
            addresses: []
            dhcp4: true
            optional: true
        enp0s8:
            addresses: [192.168.56.3/24]
            dhcp4: no
            optional: true
    version: 2
# 这个配置为 enp0s3 网卡开启 DHCP 自动获取地址； 为 enp0s8 网卡配置了一个静态 IP 192.168.56.3 ，掩码是 24 位。
```



#### 命令

netplan 操作命令提供两个子命令：

- netplan generate ：以 /etc/netplan 配置为管理工具生成配置；
- netplan apply ：应用配置(以便生效)，必要时重启管理工具；

因此，调整 /etc/netplan 配置后，需要执行以下命令方能生效：

```shell
$ netplan apply
```

- netplan try：测试配置

```shell
sudo netplan try
# 上面的命令会在应用配置之前验证其是否有效。如果成功，你就会看到配置被接受。换句话说，Netplan 会尝试将
# 新的配置应用到运行的系统上。如果新的配置失败了，Netplan 会自动地恢复到之前使用的配置。成功后，新的配
# 置就会被使用。
```

- 查看当前系统的 DNS Servers

```shell
$ systemd-resolve --status
Global
          DNSSEC NTA: 10.in-addr.arpa
                      16.172.in-addr.arpa
                      168.192.in-addr.arpa
                      17.172.in-addr.arpa
                      18.172.in-addr.arpa
                      19.172.in-addr.arpa
                      20.172.in-addr.arpa
                      21.172.in-addr.arpa
                      22.172.in-addr.arpa
                      23.172.in-addr.arpa
                      24.172.in-addr.arpa
                      25.172.in-addr.arpa
                      26.172.in-addr.arpa
                      27.172.in-addr.arpa
                      28.172.in-addr.arpa
                      29.172.in-addr.arpa
                      30.172.in-addr.arpa
                      31.172.in-addr.arpa
                      corp
                      d.f.ip6.arpa
                      home
                      internal
                      intranet
                      lan
                      local
                      private
                      test

Link 2 (enp0s5)
      Current Scopes: DNS
       LLMNR setting: yes
MulticastDNS setting: no
      DNSSEC setting: no
    DNSSEC supported: no
         DNS Servers: 8.8.8.8
                      8.8.4.4
```



### 配置IP地址

```shell
vim /etc/netplay/50-cloud-init.yaml
# ubuntu18.04Server中调整了网络地址配置方式。如果没有此配置文件，需要手动创建。每个网络端口对应一个配置文件
   network:
    ethernets:
        ens33:
            addresses: [192.168.1.90/24]
            dhcp4: false
            gateway4: 192.168.1.1
            nameservers:
              addresses:
              - 114.114.114.114
              search: []
    version: 2
 netplan apply
 # 配置地址后使用此命令让配置生效
 netplan --debug apply
 # 使用此命令会给出错误提示
```



### 配置无线地址

```shell
network:
    version: 2
    renderer: networkd
    ethernets:
            eth0:
                    addresses:
                            - 172.16.1.253/24
# IP地址，这里不要使用类似于“255.255.255.0”的方法而是直接指定掩码位数24为（/24）
                    gateway4: 172.16.1.1
                    nameservers:
                            addresses: [172.16.1.1,8.8.8.8] 
                            # DNS服务器地址，有多个的情况请使用英文的逗号隔开
    wifis:
            wlan0:
                    dhcp4: no
                    dhcp6: no
                    addresses: [172.16.1.252/24] 
# IP地址，这里不要使用类似于“255.255.255.0”的方法而是直接指定掩码位数24为（/24）
                    gateway4: 172.16.1.1
                    nameservers:
                            addresses: [172.16.1.1,8.8.8.8]
                            # DNS服务器地址，有多个的情况请使用英文的逗号隔开
                    access-points:
                            "zczl": # 无线网络的SSID
                                    password: "123456" # 无线网络的密码
                                    
ubuntu@ubuntu:~$ sudo netplan --debug apply 
# netplan检查配置文件情况，如果没有问题就会输入下面的结果，如果有问题就会报错。
** (generate:16726): DEBUG: 12:53:29.344: Processing input file /etc/netplan/50-cloud-init.yaml..
** (generate:16726): DEBUG: 12:53:29.345: starting new processing pass
** (generate:16726): DEBUG: 12:53:29.346: wlan0: adding wifi AP 'zczl'
** (generate:16726): DEBUG: 12:53:29.346: wlan0: setting default backend to 1
** (generate:16726): DEBUG: 12:53:29.346: Configuration is valid
** (generate:16726): DEBUG: 12:53:29.347: eth0: setting default backend to 1** (generate:16726): DEBUG: 12:53:29.347: Configuration is valid** (generate:16726): DEBUG: 12:53:29.348: Generating output files..
** (generate:16726): DEBUG: 12:53:29.349: NetworkManager: definition eth0 is not for us (backend 1)
** (generate:16726): DEBUG: 12:53:29.349: wlan0: Creating wpa_supplicant configuration file run/netplan/wpa-wlan0.conf
** (generate:16726): DEBUG: 12:53:29.350: Creating wpa_supplicant service enablement link /run/systemd/system/systemd-networkd.service.wants/netplan-wpa@wlan0.service
** (generate:16726): DEBUG: 12:53:29.351: NetworkManager: definition wlan0 is not for us (backend 1)(generate:16726): GLib-DEBUG: 12:53:29.351: posix_spawn avoided (fd close requested) 
DEBUG:netplan generated networkd configuration changed, restarting networkd
DEBUG:no netplan generated NM configuration existsDEBUG:eth0 not found in {}
DEBUG:wlan0 not found in {}
DEBUG:Merged config:
    network:  
        bonds: {}  
        bridges: {}  
        ethernets:
            eth0:
                  addresses:
                  - 172.16.1.253/24
                  gateway4: 172.16.1.1      
                  nameservers:        
                      addresses:        
                          - 172.16.1.1        
                          - 8.8.8.8  
            vlans: {}  
            wifis:    
                wlan0:      
                    access-points:        
                        zczl:          
                        password: hz123456      
                        addresses:      
                        - 172.16.1.252/24      
                        dhcp4: false      
                        dhcp6: false      
                        gateway4: 172.16.1.1      
                        nameservers:        
                            addresses:        
                            - 172.16.1.1        
                            - 8.8.8.8
DEBUG:Skipping non-physical interface: lo
DEBUG:device eth0 operstate is up, not changing
DEBUG:device wlan0 operstate is dormant, not changingDEBUG:{}
DEBUG:netplan triggering .link rules for loDEBUG:netplan triggering .link rules for eth0
DEBUG:netplan triggering .link rules for wlan0


sudo netplan apply   #应用配置
```



### 配置桥接

```shell
* 之前
network:
    ethernets:
        enp5s0:
            dhcp4: false 
            addresses: [192.168.40.20/24]
            gateway4: 192.168.40.1 
            nameservers:
                addresses:
                - 223.5.5.5
                - 114.114.114.114
                - 192.168.40.1
        enp6s0:
            dhcp4: true
            nameservers:
                addresses:
                - 223.5.5.5
                - 223.6.6.6
    version: 2
    
* 修改为桥接
network:
    ethernets:
        enp5s0:
            dhcp4: false 
        enp6s0:
            dhcp4: true
            nameservers:
                addresses:
                - 223.5.5.5
                - 223.6.6.6
    bridges:
      kvmbr0:
        interfaces: [enp5s0]
        dhcp4: no
        addresses: [192.168.40.20/24]
        gateway4: 192.168.40.1
        nameservers:
          addresses: [192.168.40.1,223.5.5.5,223.6.6.6,114.114.114.114]
    version: 2
    
sudo networkctl status -a
```

