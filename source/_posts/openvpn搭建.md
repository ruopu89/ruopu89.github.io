---
title: openvpn搭建
date: 2018-10-27 16:42:18
tags: openvpn
categories: 网络
---

### Server

```shell
* ServerIP: 10.5.5.27、192.168.0.181
yum install -y epel-release
yum install -y openvpn easy-rsa
# 安装openvpn
cp /usr/share/doc/openvpn-2.4.6/sample/sample-config-files/server.conf /etc/openvpn/
# 拷贝该示例配置文件到配置目录
vim /etc/openvpn/server.conf
    local 10.5.5.27
    port 1194	
    # 定义openvpn使用端口
    proto tcp	
    # 通过udp协议连接，也可以使用tcp协议。建议使用TCP协议，这样更稳定。
    dev tun		
    # 定义openvpn运行模式，openvpn有两种运行模式一种是tap模式的以太网通道，一种是tun模式的路由 IP 通道。
    ca /etc/openvpn/easy-rsa/pki/ca.crt		
    # openvpn使用的CA证书文件，CA证书主要用于验证客户证书的合法性，存放位置请依据实际情况自行改动
    cert /etc/openvpn/easy-rsa/pki/issued/server.crt
    # openvpn服务器端使用的证书文件，存放位置请依据实际情况自行改动
    key /etc/openvpn/easy-rsa/pki/private/server.key  # This file should be kept secret
    # 服务器密钥存放位置，请依据实际情况自行改动
    dh /etc/openvpn/easy-rsa/pki/dh.pem
    # Diffie hellman文件，存放位置请依据实际情况自行改动
    server 10.8.0.0 255.255.255.0
    # openvpn在使用tun路由模式时，分配给client端分配的IP地址段，虚拟局域网网段设置，请依据须要自行改动，不支持和拔号网卡位于同一网段
    ifconfig-pool-persist ipp.txt
    # 在openvpn重新启动时,再次连接的client将依旧被分配和曾经一样的IP地址
    push "route 192.168.0.0 255.255.255.0"
    # 为客户端创建对应的路由,以另其与公司网内部服务器通信,但记住，公司网内部服务器也需要有可用路由返回到客户端
    ;push "redirect-gateway def1 bypass-dhcp"
    # 测试发现，不加此条，在客户端连接openvpn后，可以连通外网，加此条无法解析外网地址。
    push "dhcp-option DNS 114.114.114.114"
    push "dhcp-option DNS 114.114.115.115"
    # 向客户端推送的DNS信息，DNS配置，依据实际情况配置
    keepalive 10 120
    # 活动连接保时期限
    tls-auth ta.key 0 # This file is secret
    cipher AES-256-CBC
    comp-lzo
    max-clients 10
    user nobody
    group nobody
    persist-key
    persist-tun
    status openvpn-status.log
    log-append  openvpn.log
    verb 3
mkdir -p /etc/openvpn/easy-rsa/keys
cp -rf /usr/share/easy-rsa/3.0.3/* /etc/openvpn/easy-rsa/
cp /usr/share/doc/easy-rsa-3.0.3/vars.example /etc/openvpn/easy-rsa/vars
cd /etc/openvpn/easy-rsa/
vim vars 
    set_var EASYRSA	"$PWD"
    set_var EASYRSA_PKI		"$EASYRSA/pki"
    # 定义key的生成目录
    set_var EASYRSA_DN	"cn_only"
    set_var EASYRSA_REQ_COUNTRY	"CN"
    # 定义所在的国家       
    set_var EASYRSA_REQ_PROVINCE	"BJ"
    # 定义所在的省         
    set_var EASYRSA_REQ_CITY	"BeiJing"
    # 定义所在的城市    
    set_var EASYRSA_REQ_ORG	"ccjd"
    # 定义所在的组织        
    set_var EASYRSA_REQ_EMAIL	"ccjd@goldenet.com"
    # 定义邮箱           
    set_var EASYRSA_REQ_OU		"IT"
    # 定义所在单位  
    set_var EASYRSA_KEY_SIZE	2048
    # 定义生成私钥的大小，一般为1024或2048，默认为2048位。这个就是我们在执行build-dh命令生成dh2048文件的依据。
    set_var EASYRSA_ALGO		rsa
    set_var EASYRSA_CA_EXPIRE	3650
    # ca证书有效期，默认为3650天，即十年            
    set_var EASYRSA_CERT_EXPIRE	3650
    # 定义秘钥的有效期，默认为3650天，即十年             
    set_var EASYRSA_NS_SUPPORT	"no"
    set_var EASYRSA_NS_COMMENT	"Easy-RSA Generated Certificate"
    set_var EASYRSA_EXT_DIR	"$EASYRSA/x509-types"
    set_var EASYRSA_SSL_CONF	"$EASYRSA/openssl-1.0.cnf"
    set_var EASYRSA_DIGEST		"sha256"
# 配置证书文件，修改上面的行
./easyrsa init-pki
# 到easy-rsa目录下，初始化，会在当前目录创建PKI目录，用于存储一些中间变量及最终生成的证书 
./easyrsa build-ca nopass
# 创建根证书，nopass表示不设置密码，一直回车即可。会生成根证书：ca.crt，文件在：/etc/openvpn/easy-rsa/pki/ca.crt
./easyrsa gen-dh
openvpn --genkey --secret ta.key
# 创建ta.key
cp -r ta.key /etc/openvpn/
./easyrsa gen-req server
# 创建服务端证书，生成请求，使用gen-req来生成req，创建server端证书和private key。也可以在之后使用nopass，或设置密码。生成服务器证书：/etc/openvpn/easy-rsa/pki/private/server.key、/etc/openvpn/easy-rsa/pki/reqs/server.req
./easyrsa sign-req server server
# 签发证书,签约服务端证书，给server端证书做签名，首先是对一些信息的确认，可以输入yes，然后输入build-ca时设置的那个密码，因上面没有设置密码，所以会直接通过。生成服务端签名证书：/etc/openvpn/easy-rsa/pki/issued/server.crt
./easyrsa build-client-full ccjd
# 生成客户端用户证书，ccjd是用户名，需要输入客户端密码与ca密码（上面没有设置）。生成客户端用户签名证书：/etc/openvpn/easy-rsa/pki/issued/ccjdname.crt、/etc/openvpn/easy-rsa/pki/private/ccjdname.key、/etc/openvpn/easy-rsa/pki/reqs/ccjdname.req
systemctl start openvpn@server
# 启动服务，启动时输入创建服务端证书时输入的密码，第一次启动可能不成功，可以再使用此命令启动，直到需要输入密码为止
	systemd-tty-ask-password-agent
	# 启动后输入上面命令，再输入密码
ss -tlnu
# 查看是否监听了udp的1194端口，如果没有监听，可以再执行启动命令，直到监听端口为止
echo 1 > /proc/sys/net/ipv4/ip_forward
# 添加路由转发功能
vim /etc/sysctl.conf
	net.ipv4.ip_forward = 1
sysctl -p
# 这种方法也可以开启转发功能，sysctl -p是使用配置文件生效
iptables -t nat -I POSTROUTING -s 10.8.0.0/24 -j SNAT --to-source 192.168.0.181
# 设置完生效可能有此慢，需要等半分钟
# 因为是固定IP，只是想让连接openvpn的主机可以访问另一个网段的主机，所以这里用了源地址转换，所有连接openvpn的主机会使用openvpn服务器的192地址与192.168.0.0/24网段的主机通信。如果是动态IP，也可以使用命令：iptables -t nat -I POSTROUTING -s 10.8.0.0/24 -j MASQUERADE
tcpdump -i tun0 -nn 
```

### windows Client

* 下载安装openvpn-install-2.3.3-I002-i686，安装时选中所有选项
* 将安装目录中的sample-config目录中的Client.ovpn文件放入安装目录中的config目录中。将服务器端的ccjd.key、ca.crt、ta.key、ccjd.crt四个文件也放入config目录中
* 设置客户端配置文件

```shell
client
dev tun
proto tcp
remote 10.5.5.27 1194
resolv-retry infinite
nobind
remote-cert-tls server
ca ca.crt
cert ccjd.crt
key ccjd.key
tls-auth ta.key 1
persist-key
persist-tun
push dhcp-option DNS 114.114.114.114
push dhcp-option DNS 8.8.8.8
cipher AES-256-CBC
log-append ccjd.log
# 定义此条后，启动软件后在config目录中会有ccjd.log文件，其中记录了启动失败的原因。
status ccjd-status.log
comp-lzo
verb 3
```

* 使用管理者权限启动OpenVPN GUI，在屏幕右下角会有一个加锁的窗口的标志，如果连接成功，这个标志会变为绿色。因为要添加路由表，所以使用管理员权限打开客户端，如果用普通用户启动客户端是没法添加路由条目的，连接后也无法使用。
* 启动失败，可以查看config目录中的ccjd.log文件
* 注意客户端主机的系统时间，时间不对也会影响连接
* 调整客户端网卡配置到，一定要重新连接openvpn。可以在任务管理器中杀死两个openvpn的进程。
* 连接后，在客户端查看路由表，应该有加红框的两条路由

![](/images/openvpn/openvpn1.jpg)



### CentOS7_Client

```shell
yum install -y epel-release
yum install -y openvpn
vim /etc/openvpn/client/ccjd.ovpn
	client
    dev tun
    proto tcp
    remote 10.5.5.27 1194
    resolv-retry infinite
    nobind
    remote-cert-tls server
    ca ca.crt
    cert ccjd.crt
    key ccjd.key
    tls-auth ta.key 1
    persist-key
    persist-tun
    comp-lzo
	verb 3
# 客户端配置文件
apt install -y openssl libssl-dev lzop
# 安装openssl和lzo，lzo用于压缩通讯数据加快传输速度
* 将ca.crt、ta.key、ccjd.crt、ccjd.key四个文件放入/etc/openvpn目录下
openvpn --daemon --cd /etc/openvpn --config /etc/openvpn/client/ccjd.ovpn --log-append /var/log/openvpn.log
# 启动客户端
# --daemon：openvpn以daemon方式启动。
# --cd dir：配置文件的目录，openvpn初始化前，先切换到此目录。
# --config file：客户端配置文件的路径。
# --log-append file：日志文件路径，如果文件不存在会自动创建。
# **测试发现，如果是ubuntu18.04系统，在启动客户端时，不能加入--daemon选项，如果加入此选项，就无法输入密码。不加此选项才可以输入密码。直接在后台运行会停止程序，可以在启动后使用Ctrl+z让程序在后台运行，之后用```bg 运行号```，让后台程序运行。运行号是用jobs命令查看到的**
tail -f /var/log/openvpn.log
# 查看启动日志
ip a
# 查看是否有openvpn分配的IP地址
# 连接后的问题是，有时ping192.168.0.1不通，以为是多个客户端同时使用了一个帐号，但只有一个客户端使用此帐号连接时也会有此问题。要等上一会儿才有反应。测试发现，长ping时，一段时间后就会停下来，再过2－3分钟后又可以ping了
```

