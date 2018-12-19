---
title: nginx配置文件说明
date: 2018-09-13 12:45:47
tags: Nginx
categories: Nginx
---

# nginx配置文件

```shell
vim /etc/nginx/nginx.conf
#配置文件中的include出现了多次，在全局中和http、server中都有
	user nginx;
	#进程以哪个用户的身份运行
	worker_proceseese auto;
	#配置工作进程数的，auto指自动探测主机的物理核心数，并启动与核心数一样的进程数。或输入数字。这里只能是等于或小于物理核心数
	error_log	/var/log/nginx/error.log;
	#错误日志位置
	pid		/run/nginx.pid;
	#进程id
	worker_cpu_affinity auto;
	#自动绑定cpu，如果当前主机只运行nginx就非常有效，如果有其他服务，如mysql，就不要做了
	include	/usr/share/nginx/modules/*.conf;
	#装载需要的模块的位置。模块位置在/usr/share/nginx/modules中，其中的mod-http-geoip.conf是根据IP地址查询其所在的位置的
	events{
		use   epoll;             
		#epoll是多路复用IO(I/O Multiplexing)中的一种方式,但是仅用于linux2.6以上内核,可以大大提高nginx的性能
		worker_connections 1024；
		#配置事件驱动模型的，这里默认是单进程响应1024个请求。worker_proceseese乘以这里的worker_connections就是一共可以并发响应的总数。如果不够可以将1024改大，但不要随便改
	}
	http {
		log_format 	main	'$remote_addr - $remote_user [$time_local] "$request" '
                      		'$status $body_bytes_sent "$http_referer" '
                      		'"$http_user_agent" "$http_x_forwarded_for"';
		#日志格式，main是名称，之后使用的是nginx的内置变量，官方文档中有对变量的解释
		access_log	/var/log/nginx/access.log  main;
		#访问日志位置及格式
		sendfile	on;
		#提升性能的配置，从内核直接响应用户。sendfile 指令指定 nginx 是否调用 sendfile 函数（zero copy 方式）来输出文件，对于普通应用，必须设为 on,如果用来进行下载等应用磁盘IO重负载应用，可设置为 off，以平衡磁盘与网络I/O处理速度，降低系统的uptime.
		tcp_nopush	on;
		tcp_nodelay	on;
		#也是提升性能的
		keepalive_tiomout 65;
		#保持长连接，超时65秒
		types_hash_max_size 2048;
		#types_hash_max_size 影响散列表的冲突率。types_hash_max_size越大，就会消耗更多的内存，但散列key的冲突率会降低，检索速度就更快。types_hash_max_size越小，消耗的内存就越小，但散列key的冲突率可能上升。
		include		/etc/nginx/mime.types;
		default_type	application/octet-stream;
		#让nginx知道支持哪些类型。设定mime类型,类型由mime.type文件定义
		include /etc/nginx/conf.d/*.conf
		#启动要加载的配置，如虚拟主机
        server {
            listen 80 default_server;
            #监听端口，default_server表示默认虚拟主机，如根据主机名访问，如果都不匹配，那么就找第一个虚拟主机。也就是所有匹配不到的虚拟主机，都由默认虚拟主机响应
            listen [::]:80	default_server;
            #这是IPV6的地址
            server_name _;
            #对默认虚拟主机来说，下划线可以匹配所有主机名
            root	/usr/share/nginx/html;
            #定义默认网页和路径的
            location / {
            #location指明个人的配置
            }
            error_page 404 /404.html
                #自定义404错误页是什么
                location = /40x.html {
                }
            error_page 500 502 503 504 /50x.html;
                location = /50x.html {
                }
        }
   }
```

