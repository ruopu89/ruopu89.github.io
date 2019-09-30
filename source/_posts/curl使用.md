---
title: curl使用
date: 2019-09-25 09:14:15
tags: curl
categories: 网络
---

### 常用选项

```shell
-A/--user-agent <string> # 设置用户代理发送给服务器，即告诉服务器浏览器为什么
-basic # 使用HTTP基本验证
--tcp-nodelay # 使用TCP_NODELAY选项
-e/--referer <URL> # 来源网址，跳转过来的网址
--cacert <file> # 指定CA证书 (SSL)
--compressed # 要求返回是压缩的形势，如果文件本身为一个压缩文件，则可以下载至本地
-H/--header <line> # 自定义头信息传递给服务器
-I/--head # 只显示响应报文首部信息
--limit-rate <rate> # 设置传输速度
-u/--user <user[:password]> # 设置服务器的用户和密码
-0/--http1.0 # 使用HTTP 1.0
```



### 使用

```shell
curl -I http://www.ruopu.io
# -I:只获得对方的响应首部信息
# 如果在服务器上手动自定义了一些首部的话，使用curl这个工具的“-I”选项可以很容易的探测出服务
# 器是否正确添加了自定义的首部。

curl -A testagent http://www.ruopu.io
# -A：设置用户代理发送给服务器，即可以伪装客户端身份

curl -e http://www.google.com/index.html http://www.ruopu.io
# -e：伪装<URL>来源网址，跳转过来的网址

curl --cacert /etc/pki/CA/cacert.pem https://www.ruopu.io
# --cacert，指定CA证书 (SSL)

curl www.baidu.com
# 访问网页

curl -i www.baidu.com
# 显示http response的头信息

curl -v www.baidu.com
# 显示一次的http请求的通信过程

curl -X PUT www.baidu.com  
curl -X DELETE www.baidu.com
curl -X POST www.baidu.com  
curl -X GET www.baidu.com
# curl执行GET/POST/PUT/DELETE操作
```

