---
title: jdyc测试环境搭建
date: 2018-09-30 10:56:33
tags: test
categories: test
---

# ansible

IP：10.5.5.242

```shell
yum install -y ansible
vim /etc/ansible/hosts
	[ansible]
    10.5.5.242

    [web]
    10.5.5.223

    [netty]
    10.5.5.221
    10.5.5.222

    [wechat]
    10.5.5.224
    10.5.5.227

    [processor]
    10.5.5.228
    10.5.5.229

    [mysql]
    10.5.5.238
    10.5.5.239

    [kafka]
    10.5.5.232
    10.5.5.233
    10.5.5.234

    [redis]
    10.5.5.235
    10.5.5.236
    10.5.5.237

ssh-keygen -t rsa -P ''
ssh-copy-id -i ~/.ssh/id_rsa.pub 10.5.5.237
#将密钥复制到ansible中加入的所有主机，实现无密钥登录
ansible web,wechat,processor -m shell -a "yum install -y java-1.8.0-openjdk-devel"
ansible web,wechat,processor -m shell -a "rpm -q java-1.8.0-openjdk-devel"
ansible redis -m shell -a "yum install -y epel-release"
ansible redis -m shell -a "yum install -y redis"
ansible web,wechat,processor -m shell -a "yum install -y epel-release"
ansible web,wechat,processor -m shell -a "yum install -y nginx"

* web
mkdir -pv /root/nginx/{web,wechat}
vim /root/nginx/web/web.conf
	proxy_cache_path /etc/nginx/cache levels=1:2:2 keys_zone=web_cache:10m max_size=2g;
    server{
       server_name web.jdyichong.com;
       index index.html index.htm;
       charset utf-8;
       proxy_cache web_cache;
       proxy_cache_key $request_uri;
       proxy_cache_methods GET HEAD;
       proxy_cache_min_uses 1;
       proxy_cache_valid 200 302 10m;
       proxy_cache_valid 400 1m;
       proxy_cache_use_stale http_502;

       location / {
            proxy_pass http://10.5.5.223:8081;
       }
    }
ansible web -m copy -a "src=/root/nginx/web/web.conf dest=/etc/nginx/conf.d"
ansible web -m command -a "systemctl start nginx"
ansible web -m command -a "systemctl enable nginx"
#设置web服务器上的nginx启动并加入开机启动。测试时这里有报错，不能启动nginx，原因是使用了OpenVZ的模板，此模板中安装了httpd服务，并且开机启动，需要关闭。
```

# web

IP：10.5.5.223

```shell

```

