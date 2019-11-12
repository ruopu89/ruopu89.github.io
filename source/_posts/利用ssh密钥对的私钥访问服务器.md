---
title: 利用ssh密钥对的私钥访问服务器
date: 2019-11-01 14:34:38
tags: ssh
categories: 基础
---

```ssh
------------
   Server
------------  
1. 创建密钥对
ssh-keygen -t rsa -P ''
2. 将私钥改为.pem格式
openssl rsa -in .ssh/id_rsa -outform pem > dsjali.pem
3. 修改权限，不然连接时会报错
chmod 400 dsjali.pem
4. 从私钥中产生公钥
ssh-keygen -y -f dsjali.pem 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC+5xBrPVEJ3mRo/yVFtSQSv1/J09oYHkbTD+l/4or04YqUCHJ7iR+A/LMeff0c9xKCbT9h
sb/MvJGmCZGxuE375Fwu8XZGS8SfjYSxeh0uASOcZazOiBu4Ooegj9A3Ov4C9odPqISWbTdUx286WJqdzW7RZ0ZwkFOipr
oFrszAPnvg5xmlnMSa0afYgWhRXimmn2oyLt7PFfZIXX8PJnMs7x9B0+lwLLIVJRKrpU8if+gD80viC9wUJu3/jC1VF8Jg4Bq2aS7KiMX++L
Y1SKoOUUc0sHa/SFZEzuouaRGgrmU9XkM3DvzlfcrGN+/14WczAZG4st
5. 将上面的公钥写入认证文件
vim .ssh/authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC+5xBrPVEJ3mRo/yVFtSQSv1/J09oYHkbTD+l/4or04YqUCHJ7iR+A/LMeff0c9xKCbT9h
sb/MvJGmCZGxuE375Fwu8XZGS8SfjYSxeh0uASOcZazOiBu4Ooegj9A3Ov4C9odPqISWbTdUx286WJqdzW7RZ0ZwkFOipr
oFrszAPnvg5xmlnMSa0afYgWhRXimmn2oyLt7PFfZIXX8PJnMs7x9B0+lwLLIVJRKrpU8if+gD80viC9wUJu3/jC1VF8Jg4Bq2aS7KiMX++L
Y1SKoOUUc0sHa/SFZEzuouaRGgrmU9XkM3DvzlfcrGN+/14WczAZG4st

------------
   Client
------------
1. 下载服务器上的.pem文件
2. 连接
ssh -i "dsjali.pem" root@39.106.93.138
# .pem文件的权限为400，如果不是，可能报错。
```

