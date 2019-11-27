---
title: ngrok简单配置与使用
date: 2019-11-15 17:08:50
tags: ngrok
categories: 网络
---

### 介绍

​	ngrok是一个内网穿透的解决方案，它可以使你通过公网服务器连接到你本地的服务器



### 下载安装

```shell
--------------
   公网服务器
--------------
yum install -y gcc git mercurial bzr subversion golang golang-pkg-windows-amd64 golang-pkg-windows-386
# 安装所需包
git clone https://github.com/inconshreveable/ngrok.git
# 克隆到本地
```



### 生成证书

```shell
cd ngrok
mkdir cert
cd cert
export NGROK_DOMAIN="abc.com"
# 这里的域名就是你要访问的域名，需要在互联网可以解析到
openssl genrsa -out rootCA.key 2048
openssl req -x509 -new -nodes -key rootCA.key -subj "/CN=$NGROK_DOMAIN" -days 5000 -out rootCA.pem
openssl genrsa -out device.key 2048
openssl req -new -key device.key -subj "/CN=$NGROK_DOMAIN" -out device.csr
openssl x509 -req -in device.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out device.crt -days 5000
# 生成密钥
cp rootCA.pem ../assets/client/tls/ngrokroot.crt 
cp device.crt ../assets/server/tls/snakeoil.crt 
cp device.key ../assets/server/tls/snakeoil.key 
# 将密钥复制到指定位置
cd ..
GOOS=linux GOARCH=amd64 make release-server
# 生成服务端包
GOOS=linux GOARCH=amd64 make release-client
# 生成linux客户端名
# windows客户端
# GOOS=windows GOARCH=amd64 make release-client
# GOOS=windows GOARCH=386 make release-client
# MacOS客户端
# GOOS=darwin GOARCH=amd64 make release-client
# GOOS=darwin GOARCH=386 make release-client
./bin/ngrokd -domain="$NGROK_DOMAIN" -httpAddr=":28080" -httpsAddr=":28443" -tunnelAddr=":24443"
# 指定端口并启动ngrok服务，如果不指定端口，http默认端口80，https默认端口443，tunnel默认端口4443，
# tunnel端口是服务端与客户端联系的端口
```



### 客户端配置

```shell
登录服务器下载上面生成的客户端包，因为使用的是ubuntu客户端，所以下载ngrok包就可以了
vim ngrok.cfg                                                                   
server_addr: "abc.com:24443"
trust_host_root_certs: false
# 添加一个ngrok的配置文件，注意这个文件是yaml文件，所以对格式要求很严格。冒号与后面引号之间是有空格的。
# 配置的配置文件可以放在家目录，叫.ngrok
./ngrok -config ngrok.cfg -proto=tcp 22
# 这样可以启动客户端，这里用-config指定了配置文件，本地与服务器都使用tcp协议，本地监听22端口，服务器会
# 监听一个随机端口，本地要监听哪个端口，要取决于要连接的服务监听的端口，如这里要使用ssh服务，输出如下：
ngrok                                                                                    
Tunnel Status                 online   # 这里要变成online才是正常，开始是connecting
Version                       1.7/1.7
Forwarding                    tcp://abc.com:38139 -> 127.0.0.1:22
Web Interface                 127.0.0.1:4040
# Conn                        1
Avg Conn Time                 24193.12ms                                               
# 这里有一个问题，当连接成功后，域名是没有前缀的。所有添加域名解析时，就直接解析域名即可。使用这种方法可
# 以添加不同的端口映射到本地，如3389端口。但这里的问题是，服务器一端打开的随机端口，所以每次都需要手动修
# 改安全组的配置，放开指定端口

./ngrok -subdomain ngrok -config=./ngrok.cfg
# -subdomain指定域名的前缀，如域名是abc.com，那么连接后就是ngrok.abc.com，这样启动客户端后要监听80
# 端口。这里如果加了域名前缀，那么在添加域名解析时，就要在添加A记录时，添加一个泛域名解析，如*.ngrok   
```

