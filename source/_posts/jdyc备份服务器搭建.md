---
title: jdyc备份服务器搭建
date: 2018-11-18 11:18:41
tags: jdbc
categories: jdbc
---

### 搭建服务器过程

```shell
* Server
1. 创建CentOS7服务器
2. 创建备份目录
mkdir /home/logsbackup
3. 将本地地址映射出去

* Client
ssh-keygen -t rsa -P ''
ssh-copy-id -i ~/.ssh/id_rsa.pub 1.1.1.1
vim /root/sh/logsbackup.sh
    #!/bin/bash
    #
    cd /usr/local/logs
    tar -zcf netty.log-$(date -d yesterday +%Y-%m-%d).tar.gz netty.log-$(date -d yesterday +%Y-%m-%d).*.log
    scp -P 3999 netty.log-$(date -d yesterday +%Y-%m-%d).tar.gz 1.1.1.1:/home/logsbackup
    rm -rf netty.log-$(date -d yesterday +%Y-%m-%d).*.log
    echo $(date +%Y-%m-%d-%T) >> /root/sh/logsbackup.txt	
crontab -e
 	0 1 * * * /bin/bash /root/sh/logsbackup.sh
```

