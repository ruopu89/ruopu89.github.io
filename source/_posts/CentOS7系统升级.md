---
title: CentOS7系统升级
date: 2019-05-16 13:00:35
tags: 系统升级
categories: 基础
---

```shell
vim /etc/yum.repos.d/CentOS-local.repo
[base]
name=CentOS-$releasever - Base
baseurl=https://mirrors.aliyun.com/centos/7.6.18.10/os/$basearch/
gpgcheck=0
enabled=1

[updates]
name=CentOS-$releasever - Updates
baseurl=https://mirrors.aliyun.com/centos/7.6.18.10/updates/$basearch/
gpgcheck=0
enabled=1

yum clean all
yum repolist
yum -y update
reboot
```

