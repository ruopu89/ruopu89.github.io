---
title: samba使用
date: 2019-05-16 12:53:01
tags: 存储
categories: 基础
---

### samba配置不使用用户名密码登录

```shell
vim /etc/samba/smb.conf
[global]
        workgroup = SAMBA
        security = user
        map to guest = Bad User
		# 共享级别，用户不需要账号和密码即可访问

[opt]
        comment = opt
        browseable = yes
        path = /opt
        guest ok = yes
        writable = yes
        
		forceuser = root
		forcegroup = root
		# 将新文件的所有者和组属性设置为属于root用户
```



### samba共享文件无法写入解决

给共享目录加入写入权限可解决此问题，如添加777权限。