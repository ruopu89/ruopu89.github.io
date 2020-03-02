---
title: nginx功能测试二
date: 2018-09-17 11:10:22
tags: Nginx
categories: Nginx
---



# https

```shell
* 创建CA服务器
cd /etc/pki/CA
(umask 077;openssl genrsa -out private/cakey.pem 2048)
openssl req -new -x509 -key private/cakey.pem -out cacert.pem -days 365
touch index.txt serial
echo 01 > serial
* 到web服务器
mkdir /etc/nginx/ssl
cd /etc/nginx/ssl
(umask 077;openssl genrsa -out nginx.key 2048)
openssl req -new -key http.key -out nginx.csr
scp nginx.csr 192.168.1.2:/tmp
* 到CA服务器
openssl ca -in /tmp/nginx.csr -out /etc/pki/CA/certs/nginx.crt -days 365
#newcerts中的也是证书，是pem格式的
scp certs/nginx.crt 192.168.1.3:/etc/nginx/ssl
* 到web服务器
cp conf.d/vhost1.conf conf.d/vhost1_ssl.conf
vim conf.d/vhost1_ssl.conf
    server {
        listen 443 ssl;
        server_name www.ruopu.com;
        root /data/nginx/vhost1;
        access_log /var/log/nginx/vhost1_ssl_access.log main;
        ssl on;
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        #当前虚拟主机使用PEM格式的证书文件
        ssl_certificate_key /etc/nginx/ssl/nginx.key;
        #当前虚拟主机上与其证书匹配的私钥文件
        ssl_protocols sslv3 tlsv1 tlsv1.1 tlsv1.2;
        #支持ssl协议版本，默认为后三个
        ssl_session_cache shared:SSL:10m;
        #在各worker之间使用一个共享的缓存。SSL是自定义的名字，1m内存空间可以缓存4000个会话，这里定义10M。
    }    
nginx -t
nginx -s reload
ss -tln
访问https://www.ruopu.com，将cacert.pem传到主机，这里定义的CA服务器与客户端的主机名是一样的，访问时通过了。
```

# **重写**

```shell
vim /etc/nginx/conf.d/vhost1.conf
    server{
    	rewrite /(.*)\.png$ /$1.jpg;
    	#rewrite放在server中，另外放在location或if中也可以。上面配置表示，所有以.png结尾的文件都转成.jpg格式的。括号是为了后面的$1引用，/是根，png前面的点需要转义，后面的.jpg的点不需要转义
    }
nginx -t
nginx -s reload
访问www.ruopu.com/images/fish.png，这里实际访问的是一个叫fish.jpg的文件，名字一样但格式不同。
vim /etc/nginx/conf.d/vhost1.conf
    server {
       listen 80;
       server_name www.ruopu.com;
       root /data/nginx/vhost1;
       error_page 404 /notfound.html;
    #   rewrite /(.*)$ https://www.ruopu.com/$1;
       rewrite /(.*)\.png$ https://www.ruopu.com/$1.jpg;
       #用户请求任何内容，都转到https的页面上。但两条不要一起写，如果一起写，在访问www.ruopu.com/images/night.png时会先匹配上面的规则，下面的规则就不会生效了。
       location = /notfound.html {
            root /data/nginx/error_pages;
       }
       location ^~ /images/ {
            alias /data/pictures/;
       }
       location ~* ^/(admin|login) {
            auth_basic "admin area or login url";
            auth_basic_user_file /etc/nginx/.ngxpasswd;
       }
       location /ngxstatus {
            stub_status;
       }
    }

vim /etc/nginx/conf.d/vhost1_ssl.conf
    server {
       listen 443 ssl;
       server_name www.ruopu.com;
       root /data/nginx/vhost1;
       location ^~ /images/ {
            alias /data/pictures/;
       }
       access_log /var/log/nginx/vhost1_ssl_access.log main;
       ssl on;
       ssl_certificate /etc/nginx/ssl/nginx.crt;
       ssl_certificate_key /etc/nginx/ssl/nginx.key;
       ssl_protocols sslv3 tlsv1 tlsv1.1 tlsv1.2;
       ssl_session_cache shared:SSL:10m;
    }
#vhost1_ssl.conf配置文件中也要有与vhost1.conf中相同的配置，这样才能正常访问，这里是定义的别名与vhost1.conf中是一样的，也就是要有相同的访问路径，不然不能正常访问，会有404的错误提示。
#上面的重写要写在监听80端口的server中，不能写在监听在443端口的server中，如果写在监听在443端口的server中，那么请求会无限重定向，最后是无法访问的。监听80端口与监听443端口的两个server中定义的内容应该是一样的。不然访问80端口时能访问的路径被重定向到443端口时就访问不到了。如果想让访问80端口的任何以png结尾的文件，都被重定向到443端口的.jpg文件，那么就要在监听443端口的配置文件中加入 rewrite /(.*)\.png$ /$1.jpg;，如果在监听80端口的server中定义是不起作用的。这是在要将所有访问的内容都重定向到443端口，并且还要让访问png文件的请求重定向到443端口的jpg文件，这两个条件都存在的情况下需要的配置。但如果只是将访问80端口的以png结尾的文件重定向到443端口的jpg文件的话，只要在监听80端口的server中写入 rewrite /(.*)\.png$ https://www.ruopu.com/$1.jpg; 就行了。
nginx -s reload
访问https://www.ruopu.com/images/night.png，rewrite规则可以写多条，rewrite匹配并重写url后会以新的url地址重新匹配配置文件或重新检查location的规则，如果可以匹配到，就会再重写一遍，直到匹配不到。默认的行为是last，就是重写的url会被重新再匹配一遍规则。还有break、redirect、permanent
vim /etc/nginx/conf.d/vhost1.conf
    server{
		rewrite /(.*)\.png$ /$1.jpg redirect;
    }
#redirect是重定向，客户端要重新发起请求。如果是permanent就是永久重定向，也需要客户端重新发请求。last和break是不需要客户端重新发请求的，只是服务器内部做了转换
=======================================================================================
#[flag]：
	last：重写完成后停止对当前URI在当前location中后续的其它重写操作，而后对新的URI启动新一轮重写检查；提前重启新一轮循环；
    break：重写完成后停止对当前URI在当前location中后续的其它重写操作，而后直接跳转至重写规则配置块之后的其它配置；结束循环；
    redirect：重写完成后以临时重定向方式直接返回重写后生成的新URI给客户端，由客户端重新发起请求；不能以http://或https://开头；302
    permanent：重写完成后以永久重定向方式直接返回重写后生成的新URI给客户端，由客户端重新发起请求；301
```

# 反代

```shell
* 准备三台主机，一台反代，两台web服务，反代服务器的地址有两个，一个外网192.168.1.90，一个内网172.16.0.1。web服务器有两个内网地址，一个172.16.0.2，一个172.16.0.3。设置内网地址，就是将虚拟机网卡改为仅主机，然后设置仅主机的IP地址
yum install httpd mod_ssl
//到web服务器上安装httpd，mod_ssl，并提供主页，最后改为内网网卡并配置地址。改为内网地址172.16.0.2
vim /var/www/html/index.html
	<h1>Real Server 1</h1>
vim /etc/sysconfig/network-scripts/ifcfg-eno16777736
    IPADDR=172.16.0.2
    NETMASK=255.255.0.0
systemctl start httpd
setenforce 0
systemctl stop firewalld
* 到反代服务器
vim /etc/yum.repos.d/nginx.repo
    [nginx]
    name=nginx repository
    baseurl=http://nginx.org/packages/centos/7/$basearch/
    gpgcheck=0
    enabled=1
yum install nginx
vim /etc/nginx/conf.d/ruopu.conf
    server {
        listen 80;
        server_name www.ruopu.com
        location / {
            proxy_pass http://172.16.0.2:80；
        //这里要看web服务器是基于什么做的虚拟主机，是IP，port还是FQDN，是哪个就在http后输入哪个
        }
    }
nginx -t
systemctl start nginx
* 修改客户端hosts文件，让主机可以解析nginx的域名
* 访问测试
* 到web服务器上
tcpdump -i eno16777736 tcp port 80
//监听80端口，看一下请求是否为反代服务器发来的
* 到第二台web服务器上
yum install httpd
改为内网地址172.16.0.3
systemctl stop firewalld
setenforce 0
vim /var/www/html/index.html
	<h1>Real Server 2</h1>
find /usr/share -iname "*.jpg" -exec cp {} /var/www/html \;
//这一次准备将图片文件都反代到这台服务器
systemctl start httpd
* 到反代服务器，加入
vim /etc/nginx/conf.d/ruopu.conf
    location ~* \.(jpg|jpeg|png)$ {
        proxy_pass http://172.16.0.3:80;
    //将访问图片的请求代理到另一台服务器上
    }
* 到客户端访问，如果是访问域名就返回第一台web服务器的内容，如果访问域名/*.jpg就返回第二台服务器的内容。在配置文件中，如果location中用了正则表达式，在proxy_pass指向的地址中的80端口后是不能加斜线/的，如果没用正则表达式，可以加斜线。像上边的第一个location设置，如果80后有斜线，表示将location中的斜线替换成80后的斜线，如果没有斜线，表示将location中的斜线补在80后
* 测试斜线的功能，到反代服务器上
vim /etc/nginx/conf.d/ruopu.com
    server {
        listen 80;
        server_name www.ruopu.com;
        location / {
        	root /data/nginx/html;
        }
        location /admin/ {
            proxy_pass http://172.16.0.2:80;
            //这个反代的意思是在172.16.0.2的根目录下找admin目录，下面的反代是在访问以jpg等为后缀名的文件时到172.16.0.3:80的根目录下找
        }
        location ~* \.(jpg|jpeg|png)$ {
        	proxy_pass http://172.16.0.3:80;
        }
    }
    //修改配置文件，将admin代理过去
mkdir -pv /data/nginx/html
nginx -s reload
* 到客户端访问www.ruopu.com/admin，提示Not Found，因为web服务器上没有admin目录。但是，如果location /admin/中的80后有斜线，那么访问的就是172.16.0.2的根目录，也就是/var/www/html/index.html文件。也就是，没有斜线，就将/admin补在80后，因为172.16.0.2中没有admin目录，所以提示Not Found。如果有斜线，就表示访问http://172.16.0.2/admin就是在访问172.16.0.2的根目录，/admin/就等于/。
* 到web服务器上
mkdir /var/www/html/admin
vim /var/www/html/admin/index.html
	admin
* 到客户端测试，这时显示admin
* 到反代服务器上加一个斜线
vim /etc/nginx/conf.d/ruopu.com
    server {
       listen 80;
       server_name www.ruopu.com;
       location / {
            root /data/nginx/html;
       }
       location /admin/ {
            proxy_pass http://10.5.5.204:80/;
       }
       location ~* \.(jpg|jpeg|png)$ {
            proxy_pass http://10.5.5.205:80;
       }
    }
nginx -t
nginx -s reload
* 到客户端访问www.ruopu.com/admin，这时显示的是Real Server 1，也就是web服务器上html中定义的内容，配置的意思就是，当访问admin时，就替换成web服务器根下的内容。当location中定义的是根时，这个斜线就没有意义了，因为访问的都是根
```



### 设置上传大小

```shell
vim /etc/nginx/nginx.conf
    http {
        client_max_body_size 8M;
        # 设置上传最大8M
    }
    
# 下面设置php上传大小
vim /etc/php5/fpm/php.ini
;This sets the maximum amount of memory in bytes that a script is allowed to allocate
memory_limit = 32M
 
;The maximum size of an uploaded file.
upload_max_filesize = 8M
 
;Sets max size of post data allowed. This setting also affects file upload. To upload large files, this value must be larger than upload_max_filesize
post_max_size = 16M
```

