---
title: ubuntu18.04Server配置IP地址
date: 2018-11-21 11:25:40
tags: ubuntu18.04Server
categories: ubuntu
---

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

