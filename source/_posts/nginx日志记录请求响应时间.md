---
title: nginx日志记录请求响应时间
date: 2020-03-11 15:25:53
tags: nginx日志
categories: Nginx
---

### 修改日志格式

```shell
http {
    log_format  timed_combined  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" '
                        '$request_time $upstream_response_time';
                        
    server {
        access_log  /var/log/nginx/ipcdn.log  timed_combined;
    }
}
```

几个时间变量的解释

- $request_time – Full request time, starting when NGINX reads the first byte from the client and ending when NGINX sends the last byte of the response body
- $upstream_connect_time – Time spent establishing a connection with an upstream server
- $upstream_header_time – Time between establishing a connection to an upstream server and receiving the first byte of the response header
- $upstream_response_time – – Time between establishing a connection to an upstream server and receiving the last byte of the response body

