---
title: nginx问题解决
date: 2019-12-03 17:00:29
tags: nginx问题解决
categories: Nginx
---

### 反向代理二级域名

```shell
server {
    listen 80;
    server_name 172.24.211.110;
    root /usr/share/nginx/html;
    access_log /var/log/nginx/access-oss.log;
    location /bajia-images/ {
        proxy_pass  http://bajia-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /chaowai-images/ {
        proxy_pass http://chaowai-images.oss-cn-beijing-internal.aliyuncs.com/;
    } 

    location /miyun-images/ {
        proxy_pass http://miyun-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /zhihuixiangcun-images/ {
        proxy_pass http://zhihuixiangcun-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-music/ {
        proxy_pass http://family-music.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-photo/ {
        proxy_pass http://family-photo20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-user/ {
        proxy_pass http://family-user20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-video/ {
        proxy_pass http://family-video20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }
    
    location /wxfwh-images/ {
        proxy_pass http://wxfwh-images.oss-cn-beijing-internal.aliyuncs.com/;
    }
    
}
# 这里需要注意的是，proxy_pass的地址最后一定要有/，这样访问二级域名时，就会被反向代理到其对应的地址。
# 如访问http://172.16.211.110/wxfwh-images/就会被反向代理到
# http://wxfwh-images.oss-cn-beijing-internal.aliyuncs.com/，如果不加反向代理地址最后的/，
# 那么就会到反向代理地址下找二级域名
```



### 通过域名解析访问

```shell
# 问题：以上面的配置文件为例，当使用hosts文件解析域名后，无法通过域名访问反向代理，只能通过IP访问
server {
    listen 80;
    server_name *.gehua.net.cn;
    root /usr/share/nginx/html;
    access_log /var/log/nginx/access-oss.log;
    location /bajia-images/ {
        proxy_pass  http://bajia-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /chaowai-images/ {
        proxy_pass http://chaowai-images.oss-cn-beijing-internal.aliyuncs.com/;
    } 

    location /miyun-images/ {
        proxy_pass http://miyun-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /zhihuixiangcun-images/ {
        proxy_pass http://zhihuixiangcun-images.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-music/ {
        proxy_pass http://family-music.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-photo/ {
        proxy_pass http://family-photo20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-user/ {
        proxy_pass http://family-user20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }

    location /family-video/ {
        proxy_pass http://family-video20191202.oss-cn-beijing-internal.aliyuncs.com/;
    }
    
    location /wxfwh-images/ {
        proxy_pass http://wxfwh-images.oss-cn-beijing-internal.aliyuncs.com/;
    }   
}
# 因为是为oss对象存储做反向代理，希望通过"域名+bucket名+路径"的方式访问，因为域名较多，所以这里使用
# 泛域名，这样配置后，可以实现以.gehua.net.cn结尾的域名访问，但是之前的IP地址就无法访问了。
```



### 不同域名反向代理

```shell
server {
    listen 80;
    server_name bajia-images.endpoint.gehua.net.cn;
    access_log /var/log/nginx/access-upload-bajia.log;
    location / {
        proxy_pass http://baes.oss-cn-beijing-internal.aliyuncs.com/;
    }
}

server {
    listen 80;
    server_name chaowai-images.endpoint.gehua.net;
    access_log /var/log/nginx/access-upload-chaowai.log;
    location / {
        proxy_pass http://chaages.oss-cn-beijing-internal.aliyuncs.com/;
    }
}
# 可以写成多个server段，第一段使用相同的端口，但使用不同的域名。
```



### server_name名称过长

```shell
server_name的名称过长，检查配置文件会提示：nginx: [emerg] could not build server_names_hash, you should increase server_names_hash_bucket_size: 64，且无法重新启动。解决方法如下：
vim /etc/nginx/nginx.conf
http {
    server_names_hash_bucket_size 128;
}
```

