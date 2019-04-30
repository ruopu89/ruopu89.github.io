---
title: 使用Nginx搭建webdav服务
date: 2019-03-11 10:59:35
tags: nginxWebdav
categories: Nginx
---

### 介绍

> WebDAV 就是通过 Restful API ，实现对服务端文件的 创建 / 删除 / 读取 / 修改，比起其他文件传输协议，它基于 HTTP，不容易被当作不明流量被砍掉。同时能够利用 HTTP 的各种扩展，比如 HTTPS 提供数据加密功能、HTTP 2.0 提供数据流传输、HTTP 范围请求(RFC7233)等。



### 安装

```shell
[root@webdav ~]# yum install -y nginx httpd-tools
[root@webdav ~]# mkdir /webdav
# 创建上传目录
[root@webdav conf.d]# chmod 777 /webdav/
# 要让nginx用户可以将数据写入此目录，所以主要是给其他人加写权限
```



### 配置

```shell
[root@webdav ~]# cd /etc/nginx/conf.d/
[root@webdav conf.d]# vim webdav.conf
server {
    listen 8088;
    error_page 404 /404;
    error_page 503 /503;
    client_max_body_size 1000M;
    
    location / {
        root /webdav;
        autoindex on;	# autoindex on是为了通过网页访问时可以直接显示索引
        dav_methods PUT DELETE MKCOL COPY MOVE;
#	dav_ext_methods PROPFIND OPTIONS;
# 加入此行，nginx会报错，称不知道dav_ext_methods
	create_full_put_path on;
# create_full_put_path官方的说明为“默认情况下，PUT方法只能在已存在的目录里创建文件。当然了Nginx 必须得有这个目录的修改和写入权限”；
	dav_access user:rw group:r all:r;
	auth_basic "Authorized Users Only";
	auth_basic_user_file /etc/nginx/.ngxpasswd;
# 认证说明与认证文件的路径
    }
}
[root@webdav conf.d]# htpasswd -c -m /etc/nginx/.ngxpasswd test
# 创建可以上传的用户名与密码
[root@webdav conf.d]# nginx -t
[root@webdav conf.d]# systemctl start nginx
```



### 测试

```shell
 ⚡ ⚙ root@ruopu64  ~  curl -u test:centos -T nohup.out 192.168.251.135:8088    
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:100  9972    0     0  100  9972      0  4869k --:--:-- --:--:-- --:--:-- 4869k
  # 测试使用curl命令上传数据。-u选项用来指定用户名和密码，-T表示上传文件，nohup.out是要上传的文件，最后是服务器地址。
```

