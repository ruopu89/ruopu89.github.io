---
title: haproxy部署
date: 2019-01-29 07:29:34
tags: haproxy
categories: balance
---

### 配置文件

```shell
==============================================================================================
haproxy配置段分为两段，一为全局配置段，一为代理配置段。代理配置段又分为三段，第一段是frontend，用来定义接收以及从何处接收请求。第二段是backend，定义接收到请求后代理至哪些主机，以及如何进行代理。第三段是listen，定义直接匹配的前端和后端，没有分开定义。这三段如果使用同一个值，用defaults定义。
==============================================================================================
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   http://haproxy.1wt.eu/download/1.4/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global		# 全局配置段
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2
# 定义全局日志配置，日志级别为info。127.0.0.1是定义日志输出的地址，local2是日志设备。也就是使用127上的rsyslog来记录日志。这样定义，日志会输出到messages中
    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
# pid存放路径
    maxconn     4000
# haproxy的最大头连接数，与linux的最大打开的文件数有关。一般小于最大打开文件数
    user        haproxy
    group       haproxy
    nbproc		1
# haproxy启动时创建的进程数，不要超时CPU的核数
    daemon
# 做守护进程
    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
# haproxy实例的运行模式，一般是tcp或http。http就表示工作在七层
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
# 连接后端服务器失败重试的次数，如果超过这个值就标记为不可用
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
# 成功连接服务器的最长等待时间，没有单位是毫秒
    timeout client          1m
# 客户端发送数据最长等待时间
    timeout server          1m
# 服务器端回应客户端的最长等待时间
    timeout http-keep-alive 10s
    timeout check           10s
# 设置检查后端服务器的超时时间，如果超过这个值就标记不可用
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend  main *:5000
# main是名称，可自定义名称。*:5000表示监听在所有地址的5000端口
    mode	http
# 指定负载均衡的工作模式
	option	httplog
# 设置haproxy记录http请求的日志记录。建议打开
	option	forwardfor
# 让后端服务器获取客户端的真实地址
	option	httpclose
# 客户端与服务器完成一次连接后，服务器主动关闭这个连接
	log		global
# 引用全局的日志配置
    acl url_static       path_beg       -i /static /images /javascript /styleshe
ets
# 以-i后定义的内容开头的信息的名称为url_static
    acl url_static       path_end       -i .jpg .gif .png .css .js
# 以-i后定义的内容结尾的信息的名称为url_static
    use_backend static          if url_static
# 如果是acl中定义了url_static条件的话，就给后端的static池中定义的主机
    default_backend             app
# 默认给app池中定义的主机，也就是不符合给static池的请求都给app
#---------------------------------------------------------------------
# static backend for serving up images, stylesheets and such
#---------------------------------------------------------------------
backend static
# 定义一组后端服务器，static是自取名
	mode 		http
	option		redispatch
# 用于会话保持
	option		abortonclose
# 自动结束处理较长的连接
    balance     roundrobin
# 设置调度算法
	cookie		SERVERID
# 指定cookie的ID值，表示允许向cookie插入一个serverID。serverID在下面配置。如果是source算法，就不用设置	cookie。因为使用cookie就是为了会话保持
	option		httpchk GET /index.jsp
# 探测后端服务器状态，健康检测，如果长时间无效应，会将后端服务器剔除。haproxy会访问下面sever中定义的每一个后端主机的IP/index.jsp来探测主机是否正常
    server      static 127.0.0.1:4331 cookie server1 weight 6 check inter 2000 rise 2 fall 3
# static是主机名，自定义的。之后是地址和端口。cookie server1就是定义上面的cookie   SERVERID的。每个server的SERVERID是不一样的。weight是权重。check表示启用对后端服务器的检查，inter是检查的时间间隔，默认单位是毫秒，rise表示连续检查几次标记为正常，fall表示连续检查几次标记为失败
#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    server  app1 127.0.0.1:5001 check
    server  app2 127.0.0.1:5002 check
    server  app3 127.0.0.1:5003 check
    server  app4 127.0.0.1:5004 check
    
listen admin_stats
# listen可以同时拥前端和后端，将前端与后端绑定在一起。主要配置与监控相关的信息。admin_stats是自定义名称
	bind 0.0.0.0:9188
# 设置状态页地址和端口
	mode http
	log 127.0.0.1  local0 err
	stats refresh 20s
# 刷新的时间间隔
	stats uri /haproxy-status
# 状态页的地址
	stats realm welcome login\ Haproxy
# 欢迎信息
	status auth admin:admin123
# 验证信息，用户名:密码
	stats hide-version
# 隐藏版本号
	stats admin if TRUE
# 开启管理后端服务器功能

==============================================================================================
算法
1. roundrobin：Each server is used in turns, according to their weights.
# 设置高度算法为轮询，这里的轮询是加权轮询，这取决于下面的server中是否设定了权重。roundrobin是动态算法，支持权重的运行时调整，调整完不用重启服务。另外支持慢启动，慢启动指当后端加入一台新服务器时，调度器会将请求慢慢地分配到新加入的服务器上，如果马上全部分配到新加入的服务器上，对服务器的压力很大。roundrobin对后端主机的数量是有限制的。最多支持4095个。
# server options： weight #
2. static-rr
# 静态算法：不支持权重的运行时调整及慢启动；后端主机数量无上限；
3. leastconn
# 加权最少连接，最少连接的接收请求，这个算法也是动态的。建议使用在支持长连接的会话中。例如MySQL、LDAP等；
4.  first：
# 根据服务器在列表中的位置，自上而下进行调度；前面服务器的连接数达到上限，新请求才会分配给下一台服务。如果后端有三台服务器，这个算法会依次将后端服务器请求打满，第一台打满后再给第二台服务器
5. source
# 源地址hash，相当于nginx中的IPhash，LVS的HS。如果hash取决于hast-type，如果是map-based就是取模法，取模法就是把所有服务器按权重虚拟成节点，如果是权重是2就虚拟成两个节点。对数组元素数量取模，等于几就映射给索引为几的服务器，但服务器变动，hash值会影响全局。如果是consistent就是一致性hash
6. uri
# 将请求同一个uri的主机代理到后端同一台主机，取决与hash-type
# 对URI的左半部分做hash计算，并由服务器总权重相除以后派发至某挑出的服务器；
# <scheme>://<user>:<password>@<host>:<port>/<path>;<params>?<query>#<frag>
# 左半部分：/<path>;<params>
# 整个uri：/<path>;<params>?<query>#<frag>
7. url_param
# 调度时以某个特定的值调度到后端同一主机，用处不大。动态还是静态取决于hash-type
# 对用户请求的uri<params>部分中的参数的值作hash计算，并由服务器总权重相除以后派发至某挑出的服务器；通常用于追踪用户，以确保来自同一个用户的请求始终发往同一个Backend Server；
8. hdr(<name>)
# 请求报文的首部，对对应首部的值做hash，一样的就给同一主机。可以对浏览器调度
# 对于每个http请求，此处由<name>指定的http首部将会被取出做hash计算； 并由服务器总权重相除以后派发至某挑出的服务器；没有有效值的会被轮询调度；根据HTTP请求头来锁定每一次HTTP请求 
9. rdp-cookie(<name>)
# 远程桌面协议
# 表示根据cookie(name)来锁定并哈希第一次TCP请求
# uri向下的四种算法为七层算法，用的不多

常用的负载均衡算法
1.轮询算法：roundrobin
2. 根据请求源IP算法：source
3. 最少连接者先处理算法：leastconn
==============================================================================================
```



### 测试轮询

```shell
==============================================================================================
环境
准备三台主机
haproxy：外网地址：192.168.1.25；内网地址：172.16.106.143
httpd1：内网地址：172.16.106.145
httpd2：内网地址：172.16.106.144
==============================================================================================

---------------
  httpd1&2
---------------
[root@httpd1 ~]# yum install -y httpd
[root@httpd1 ~]# systemctl start chronyd
[root@httpd1 ~]# systemctl enable chronyd
[root@httpd1 ~]# chronyc
chrony version 3.1
Copyright (C) 1997-2003, 2007, 2009-2017 Richard P. Curnow and others
chrony comes with ABSOLUTELY NO WARRANTY.  This is free software, and
you are welcome to redistribute it under certain conditions.  See the
GNU General Public License version 2 for details.

chronyc> waitsync 
try: 1, refid: 771CCEC1, correction: 0.000001078, skew: 32.010
# 同步时间
[root@httpd1 ~]# vim /var/www/html/index.html
Backend Server 1
# 给两台服务器提供一个主面，另一台服务器的内容是Backend Server 2
[root@httpd1 ~]# systemctl start httpd
[root@httpd2 ~]# curl 172.16.106.144
Backend Server 2
[root@httpd2 ~]# curl 172.16.106.145
Backend Server 1

--------------
  haproxy
--------------
[root@haproxy haproxy]# vim /etc/rsyslog.conf
$ModLoad imudp		# 基于UDP收集日志
$UDPServerRun 514		# 监听端口
local2.*                                                /var/log/haproxy.log
# 加入此行，设置haproxy的日志路径
[root@haproxy haproxy]# systemctl restart rsyslog
[root@haproxy ~]# cd /etc/haproxy/
[root@haproxy haproxy]# cp haproxy.cfg{,.bak}
[root@haproxy haproxy]# vim haproxy.cfg
global
   log         127.0.0.1 local2
    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon
    stats socket /var/lib/haproxy/stats
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000
frontend  myweb		# 定义前端主机，取名叫myweb
    bind *:80		# 定义haproxy的监听端口
    default_backend             websrvs		# 定义默认使用的后端主机是websrvs
backend websrvs			# 定义后端主机组叫websrvs
    balance     roundrobin		# 使用轮询的方式
    server      srv1 172.16.106.145:80 check
    server      srv2 172.16.106.144:80 check
# 后端主机信息，使用server定义，srv1是haproxy内部引用的ID号，自定义的。它是服务器在haproxy上的内部名称；出现在日志及警告信息；check是对主机的健康检测，如果不加，那么会被认为是始终在线的。这是四层检测，发TCP请求，如果响应就表示在线
[root@haproxy haproxy]# systemctl start haproxy
[root@haproxy haproxy]# for i in `seq 10`;do curl 192.168.1.25;done
Backend Server 1
Backend Server 2
```



### first算法

```shell
==============================================================================================
根据服务器在列表中的位置，自上而下进行调度；前面服务器的连接数达到上限，新请求才会分配给下一台服务；
==============================================================================================
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    default_backend             websrvs
backend websrvs
    balance     first
    server      srv1 172.16.106.145:80 check maxconn 3		# maxconn指定最大并发连接数
    server      srv2 172.16.106.144:80 check
[root@haproxy haproxy]# systemctl restart haproxy.service 
[root@haproxy haproxy]# yum install -y httpd-tools
[root@haproxy haproxy]# ab -n 100000 -c 10 http://192.168.1.25/index.html

------------
  httpd2
------------
[root@httpd2 ~]# tail -f /var/log/httpd/access_log 
# 在第二台web服务器上查看日志，如果有请求日志，就说明第一台web服务器打满了
```



### uri算法

```shell
==============================================================================================
对URI的左半部分做hash计算，并由服务器总权重相除以后派发至某挑出的服务器；只要访问的是同一页面，不管是哪台主机，都发往同一台服务器
==============================================================================================
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    default_backend             websrvs
backend websrvs
    balance     uri
    server      srv1 172.16.106.145:80 check maxconn 3		# maxconn指定最大并发连接数
    server      srv2 172.16.106.144:80 check
[root@haproxy haproxy]# systemctl restart haproxy.service 

---------------
  httpd1&2
---------------
[root@httpd2 ~]# for i in {1..10};do echo "Test Page $i @BES 1" > /var/www/html/test$i.html;done
# 在两台主机上分别添加主页

--------------
  haproxy
--------------
[root@haproxy haproxy]# for i in `seq 10`;do curl http://192.168.1.25/test1.html;done
# 这时显示的内容是一样的，因为请求被发到了同一台主机。另外可以换其他主机再访问，结果应该和这里一样，因为访问的都是同一页面
```



### hdr算法

```shell
==============================================================================================
hdr(<name>)：对于每个http请求，此处由<name>指定的http首部将会被取出做hash计算，并由服务器总权重相除以后派发至某挑出的服务器，没有有效值的会被轮询调度。
==============================================================================================
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    default_backend             websrvs
backend websrvs
    balance     hdr(User-Agent)
# 对客户端浏览器进行hash计算并调度，如果浏览器一样就发往后端同一主机
    server      srv1 172.16.106.145:80 check maxconn 3		# maxconn指定最大并发连接数
    server      srv2 172.16.106.144:80 check
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]# for i in `seq 10`;do curl http://192.168.1.25/test1.html;done
# 这时不管访问哪个页面，都会被发到同一台服务器处理，到哪台后端服务器是不能预测的
```



### 压缩测试

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check maxconn 3
    server      srv2 172.16.106.144:80 check
[root@haproxy haproxy]# systemctl restart haproxy.service

------------
  httpd1
------------
[root@httpd1 ~]# cp /var/log/httpd/access_log /var/www/html/log.txt
# 找一个大一些的文件做压缩测试
[root@httpd1 ~]# rsync -e ssh -arzv --progress /var/www/html/log.txt 172.16.106.144:/var/www/html/
# 将文件复制到另一台web服务器上

用firefox访问192.168.1.77/log.txt，按F12，这时Response headers(响应头)中会有Content-Encoding gzip的显示
```



### 备用主机

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check 
    server      srv2 172.16.106.144:80 check backup
# backup指备用主机，也就是sorryserver.
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]# for i in `seq 10`;do curl http://192.168.1.25/index.html;done
Backend Server 1
# 这时请求只会发到第一台web服务器上

------------
  httpd1
------------
[root@httpd1 ~]# systemctl stop httpd
# 停止web服务

--------------
  haproxy
--------------
[root@haproxy haproxy]# for i in `seq 10`;do curl http://192.168.1.25/index.html;done
Backend Server 2

------------
  httpd1
------------
[root@httpd1 ~]# systemctl start httpd
# 启动web服务后，所有的请求又都会发到httpd1上了
```



### 七层反向代理

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    option httpchk
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service
# 反向代理在四层还是七层取决于mode设置的是tcp还是http
------------
  httpd1
------------
[root@httpd1 ~]# tail -f /var/log/httpd/access_log
# 这时这里会不停显示"172.16.106.143 - - [29/Jan/2019:09:54:16 +0800] "OPTIONS / HTTP/1.0" 200 - "-" "-""，这表示haproxy发出的健康检测请求，但这会产生大量无效日志

--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    option httpchk GET /index.html HTTP/1.0
# 指定使用GET方法，对/index.html检测，协议是HTTP/1.0
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2
# inter是每隔多久检测一次，单位是毫秒；rise是检测几次就上线，fall检测几次就下线
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service

------------
  httpd1
------------
[root@httpd1 ~]# tail -f /var/log/httpd/access_log
172.16.106.143 - - [29/Jan/2019:09:57:45 +0800] "GET /index.html HTTP/1.0" 200 17 "-" "-"
```



### 重定向

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    option httpchk GET /index.html HTTP/1.0
# 指定使用GET方法，对/index.html检测，协议是HTTP/1.0
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 redir http://www.baidu.com
# redir <prefix>：将发往此server的所有GET和HEAD类的请求重定向至指定的URL
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service
访问192.168.1.25时会被转到百度首页
```



### 权重

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2
# 使用weight定义权重
    server      srv2 172.16.106.144:80 check weight 1
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]# for i in `seq 10`;do curl http://192.168.1.25/index.html;done
Backend Server 1
Backend Server 1
Backend Server 2
```



### 状态页

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    stats enable
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service

访问192.168.1.25/haproxy?stats，如果设置中没有用stats uri指定页面地址，/haproxy?stats是默认的页面。页面中会用颜色标记后端主机，配置文件中的第二个server是backup，不同状态主机用不同颜色标识。停掉第一台web服务器的服务，颜色也会改变
```



### 自定义状态页uri

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    stats enable
    stats uri /myproxy?admin		# 自定义状态页uri
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service

访问http://192.168.1.25/myproxy?admin
```



### 登录状态页认证

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    stats enable
    stats uri /myproxy?admin		# 自定义状态页uri
    stats realm "HAProxy Stats Page"		# 设置登录认证时弹出的信息。测试中此项未起作用
    stats auth admin:centos		# 设置认证的用户名和密码
    stats admin if TRUE		# 启用页面的管理功能，if TRUE表示一直为真，总是可以访问，生产中不能这样使用
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 
    server      srv2 172.16.106.144:80 check backup
[root@haproxy haproxy]# systemctl restart haproxy.service

访问http://192.168.1.25/myproxy?admin，打开页面的管理功能后，可以页面进行一些简单操作
```



### 自定义状态页面的端口

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2
    server      srv2 172.16.106.144:80 check weight 1
listen stats		# listen可以同时拥前端和后端，将前端与后端绑定在一起。主要配置与监控相关的信息。
    bind *:9099
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
# 在这里定义listen，名字叫stats，之后用bind指定状态页的端口，打开相应功能。与上面一样实现了状态页功能，只是这里又定义了状态页的端口
[root@haproxy haproxy]# systemctl restart haproxy.service

访问http://192.168.1.25:9099/myproxy?admin
```



### 代理ssh

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2
    server      srv2 172.16.106.144:80 check weight 1
listen stats
    bind *:9099
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
listen sshsrvs
    mode tcp
    bind *:22322
    balance leastconn
    server sshsrv1 172.16.106.145:22 check
    server sshsrv2 172.16.106.144:22 check
# 再添加一个listen，用mode指定在tcp层(四层)实现代理。监听在22322端口，leastconn算法表示加权最少连接，最少连接的接收请求，建议使用在支持长连接的会话中。这个算法也是动态的
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]#ssh 192.168.1.25 -p 22322
# 连接了两次，分别连接到了两台httpd上
```



### cookie粘性绑定

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    default_backend             websrvs
backend websrvs
	cookie SRV insert indirect nocache
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2 cookie srv1
    server      srv2 172.16.106.144:80 check weight 1 cookie srv1
# 加入cookie的键名，server最后的cookie是其值，cookie的值最好和server的名字一致。当用户访问时，如果被调度到第一台web服务器上，用户的cookie中会加入cookie的键和值在开头，这里就是SRV=srv1，当用户再次访问时，这个cookie的键和值也会到haproxy服务器，这时haproxy就知道上次这个用户的请求被调度到哪台服务器上，这次还会调度到同一台服务器上。insert表示信息数据的插入方式，上面表示仅对indirect和nocache这样的数据拷入cookie
listen stats
    bind *:9099
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
listen sshsrvs
    mode tcp
    bind *:22322
    balance leastconn
    server sshsrv1 172.16.106.145:22 check
    server sshsrv2 172.16.106.144:22 check
[root@haproxy haproxy]# systemctl restart haproxy.service

用浏览器访问192.168.1.25，访问多次也不会有变化
```



### 让后端主机收到的请求地址是源地址

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
defaults
    option forwardfor       except 127.0.0.0/8 if-none
# 此项是原本就有的，forwardfor表示对请求加入一个首部，得到后端服务器真正的请求地址。except表示除了，这里表示除了本机127地址发出的请求，其他请求都加入首部。if-none表示如果没有首部才添加

------------
  httpd1
------------
[root@httpd1 ~]# vim /etc/httpd/conf/httpd.conf
LogFormat "%{X-Forwarded-For}i %h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{Use
r-Agent}i\"" combined
# 将%h改为%{X-Forwarded-For}i，X-Forwarded-For是haproxy中forwardfor默认的格式
[root@httpd1 ~]# systemctl restart httpd
[root@httpd1 ~]# tail -f /var/log/httpd/access_log
# 再次访问192.168.1.25时，查看web服务器日志，可以看到客户端的请求IP地址，而不再是haproxy的内网地址了。
```



### 添加首部

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    reqadd X-Proxy-By:\ HAProxy
# 添加请求报文首部，\是转义符，转义后面的空格。X-Proxy-By:\ HAProxy都是自定义的名称，表示这个服务器是由Haproxy代理的
    rspadd X-Proxy-By:\ HAProxy-1.5
# 添加响应首部
    rspidel ^Server:.*
# 删除响应报文中Server开头的所有内容
    default_backend             websrvs
backend websrvs
	cookie SRV insert indirect nocache
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2 cookie srv1
    server      srv2 172.16.106.144:80 check weight 1 cookie srv1
listen stats
    bind *:9099
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
listen sshsrvs
    mode tcp
    bind *:22322
    balance leastconn
    server sshsrv1 172.16.106.145:22 check
    server sshsrv2 172.16.106.144:22 check
[root@haproxy haproxy]# systemctl restart haproxy.service

------------
  httpd1
------------
[root@httpd1 ~]# vim /etc/httpd/conf/httpd.conf
LogFormat "%{X-Forwarded-For}i %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-A
gent}i %{X-Proxy-By}i\"" combined
# 将请求首部加到最后
[root@httpd1 ~]# systemctl restart httpd
[root@httpd1 ~]# tail -f /var/log/httpd/access_log
192.168.1.9 - - [29/Jan/2019:11:13:52 +0800] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0 HAProxy"
访问192.168.1.25，并查看日志，可以看到请求首部HAProxy
在浏览器上按F12可以看到响应首部，在Response headers中有X-Proxy-By: HAProxy-1.5
```



### acl访问控制

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    reqadd X-Proxy-By:\ HAProxy
# 添加请求报文首部，\是转义符，转义后面的空格。X-Proxy-By:\ HAProxy都是自定义的名称，表示这个服务器是由Haproxy代理的
    rspadd X-Proxy-By:\ HAProxy-1.5
# 添加响应首部
    rspidel ^Server:.*
# 删除响应报文中Server开头的所有内容
    default_backend             websrvs
backend websrvs
	cookie SRV insert indirect nocache
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2 cookie srv1
    server      srv2 172.16.106.144:80 check weight 1 cookie srv1
listen stats
    bind *:9099
    acl allowstats src 192.168.1.9
# 定义acl名字是allowstats，只允许源地址是192.168.1.64的地址来访问
# acl all src 0.0.0.0/0.0.0.0表示设置acl为所有主机地址
    block if ! allowstats
# 定义除allowstats以外的任何主机不能访问，!是取反的。如果没有!号，表示除了allowstats外的主机都能访问。block是阻塞之意。
# http-request allow if allowstats表示允许allowstats的主机访问，这样所有主机都能访问了。
# http-request deny if all：不允许除allowstats外的其他主机访问
# 先要自定义一个acl，之后用http-request指定，这样可以实现除了allowstats外的其他主机都不能访问
==============================================================================================
	acl allowstats src 192.168.1.9
    http-request allow if allowstats
    errorfile 403 /etc/haproxy/errorfiles/403forbid.http
    acl all src 0.0.0.0/0.0.0.0
    http-request deny if all
#上面可以设置为这样，结果是只有192.168.1.9可以访问状态页，其他主机不可访问。要注意acl与http-request要定义在一起，如果将http-request allow放在http-request deny下面，也会使所有主机都不能访问状态页
==============================================================================================
    errorloc 403 http://192.168.1.25:10080/errorloc/403.html
# 这里不能定义errorfile，因为上面已经拒绝本机访问了，也就是本机不能访问http://192.168.1.25
# 这里也可以使用errorfile 403 /etc/haproxy/errorfiles/403forbid.http，之后创建/etc/haproxy/errorfiles/403forbid.http，当无权访问时，就会提示错误页的内容。
# errorfile <code> <file>：在用户请求不存在的页面时，返回一个页面文件给客户端而非由haproxy生成的错误代码；可用于所有段中。<code>：指定对HTTP的哪些状态码返回指定的页面；这里可用的状态码有200、400、403、408、500、502、503和504；<file>：指定用于响应的页面文件；
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
listen sshsrvs
    mode tcp
    bind *:22322
    balance leastconn
    server sshsrv1 172.16.106.145:22 check
    server sshsrv2 172.16.106.144:22 check
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]# yum install -y nginx
[root@haproxy haproxy]# vim /etc/nginx/conf.d/errorsrv.conf
server {
   listen 10080;
   server_name 192.168.1.25;
   root /data/nginx/html;
}
[root@haproxy haproxy]# mkdir -pv /data/nginx/html/errorloc
[root@haproxy haproxy]# vim /data/nginx/html/errorloc/403.html
403 Forbidden from nginx 
[root@haproxy haproxy]# systemctl start nginx
# 使用nginx提供一个haproxy的错误页
[root@haproxy haproxy]# curl --basic --user admin:centos http://192.168.1.25:9099/myproxy?admin/
# 使用curl命令访问，基于basic认证，用户名和密码用--user指定

使用一台新主机访问http://192.168.1.25:9099/myproxy?admin，因为此主机的地址不是192.168.1.9，所以返回nginx提供的错误页内容：403 Forbidden from nginx。
```



### 后端主机动静分离

```shell
==============================================================================================
后端两台web服务器，一台配置为两个虚拟主机，支持动态服务。另一台也配置为两台虚拟主机，支持静态服务。静态服务当图片服务器
==============================================================================================

------------
  httpd1
------------
[root@httpd1 network-scripts]# yum install -y php
[root@httpd1 ~]# mkdir -pv /data/web/vhost{1,2}
[root@httpd1 ~]# vim /data/web/vhost1/info.php
<h1>Application Server 1</h1>		#vhost2中将此处改为Application Server 2
<?php
   phpinfo();
?>
[root@httpd1 ~]# cp /data/web/vhost{1,2}/info.php
# 将vhost1中的info.php复制到vhost2中
[root@httpd1 ~]# vim /etc/httpd/conf.d/vhost1.conf
<VirtualHost *:80>
   ServerName www1.test.com
   DocumentRoot "/data/web/vhost1"
   <Directory "/data/web/vhost1">
      options FollowSymLinks
      AllowOverride None
      Require all granted
   </Directory>
</VirtualHost>
[root@httpd1 ~]# cp /etc/httpd/conf.d/vhost{1,2}.conf
[root@httpd1 ~]# vim /etc/httpd/conf.d/vhost2.conf
Listen 8080
<VirtualHost *:8080>
   ServerName www2.test.com
   DocumentRoot "/data/web/vhost2"
   <Directory "/data/web/vhost2">
      options FollowSymLinks
      AllowOverride None
      Require all granted
   </Directory>
</VirtualHost>
[root@httpd1 ~]# httpd -t
[root@httpd1 ~]# systemctl restart httpd
访问http://172.16.106.145/info.php，http://172.16.106.145:8080/info.php可以看到php页面
[root@httpd1 ~]# scp /etc/httpd/conf.d/vhost* 172.16.106.144:/etc/httpd/conf.d/

------------
  httpd2
------------
[root@httpd2 ~]# mkdir -pv /data/web/vhost{1,2}
[root@httpd2 vhost1]# find /usr/share -iname "*.jpg" -exec cp {} /data/web/vhost1/ \;
[root@httpd2 vhost1]# find /usr/share -iname "*.jpg" -exec cp {} /data/web/vhost2/ \;
[root@httpd2 ~]# vim /data/web/vhost1/test.txt
Image Server 1
[root@httpd2 ~]# vim /data/web/vhost2/test.txt
Image Server 2
[root@httpd2 ~]# systemctl restart httpd
# 这里已有从httpd1上复制过来的配置文件
访问http://172.16.106.144/test.txt，http://172.16.106.144:8080/test.txt

--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
    compression algo gzip
    compression type text/html text/plain application/xml application/javascript
    acl static path_end .jpg .jpeg .png .gif .txt .html .css .javascript .js
# path_end表示以什么结尾的。请求时，一定要写明后缀，如curl 192.168.1.25/index.html，不然请求都会被代理到动态服务器上。因为设置了默认是发给动态服务器，而且动态服务器设置了cookie粘性绑定，信息是不会变的
    acl static path_beg /imgs /images /css /javascripts
# path_beg定义以什么开头。两个acl可以一起使用
    use_backend staticsrvs if static
# use_backend表示当符合指定的条件时使用特定的backend。这表示如果访问的内容是以acl中定义的结尾的静态内容，就给后端的staticsrvs主机。否则就给下面default定义的动态主机
	default_backend dynsrvs
# 默认主机组
    reqadd X-Proxy-By:\ HAProxy
    rspadd X-Proxy-By:\ HAProxy-1.5
    rspidel ^Server:.*
backend dynsrvs
    cookie SRV insert indirect nocache
    balance     roundrobin
    server      srv1 172.16.106.145:80 check inter 3000ms rise 1 fall 2 weight 2 cookie dynsrv1
    server      srv2 172.16.106.145:8080 check weight 1 cookie dynsrv2
backend staticsrvs
    balance     roundrobin
    server      srv1 172.16.106.144:80 check
    server      srv2 172.16.106.144:8080 check
listen stats
    bind *:9099
    acl allowstats src 192.168.1.9
    block if ! allowstats
    errorloc 403 http://192.168.1.25:10080/errorloc/403.htm
    stats enable
    stats uri /myproxy?admin
    stats realm "HAProxy Stats Page"
    stats auth admin:centos
    stats admin if TRUE
listen sshsrvs
    mode tcp
    bind *:22322
    balance leastconn
    server sshsrv1 172.16.106.145:22 check
    server sshsrv2 172.16.106.144:22 check
[root@haproxy haproxy]# systemctl restart haproxy.service

访问状态页192.168.1.25:9099/myproxy?admin
访问192.168.1.25/info.php，因为cookie绑定了，所以内容不会变
访问192.168.1.25/test.txt，多次访问会有变化
```



### 阻塞curl工具访问

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
	acl bad_browsers hdr_reg(User-Agent) .*curl.*
    block if bad_browsers
# 加入上面两条，定义acl，用hdr_reg，直接匹配用户请求报文中的首部，下面使用block拒绝acl设置的客户端访问
[root@haproxy haproxy]# systemctl restart haproxy.service
[root@haproxy haproxy]# curl http://192.168.1.25
<html><body><h1>403 Forbidden</h1>
Request forbidden by administrative rules.
</body></html>
```



### 阻塞域访问

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend  myweb  *:80
	acl valid_referers hdr_reg(Referer) \.ruopu\.com.*
# 用hdr_reg，匹配Referer，匹配来自ruopu.com的任何值
    block unless valid_referers
# 不是上面定义的值就拒绝
[root@haproxy haproxy]# curl -e "http://www.ruopu.com/admin.php" http://192.168.1.25/test2.html
Test Page 2 @BES 1
# 用-e模拟一个Referer，这样就能返回值了
[root@haproxy haproxy]# curl http://192.168.1.25/test2.html
<html><body><h1>403 Forbidden</h1>
Request forbidden by administrative rules.
</body></html>
# 直接访问是没有权限的
```



### SSL功能

```shell
--------------
  haproxy
--------------
[root@haproxy haproxy]# vim haproxy.cfg
frontend https
    bind *:443 ssl crt /etc/haproxy/certs/haproxy.pem
# 定义用ssl协议，crt指明密钥的路径
    acl static path_end .jpg .jpeg .png .gif .txt .html .css .javascript .js
    acl static path_beg /imgs /images /css /javascripts
    use_backend staticsrvs if static
    default_backend dynsrvs
# 与上面一样，如果是特定结尾或开头的就转到静态页，不是的就转到动态页

frontend  http   *:80
    redirect scheme https if ! { ssl_fc }
# redirect即为重定向之意。scheme指协议，ssl_fc指非ssl会话的前端链接。这是定义，如果不是https协议的非前端会话，都转到https443端口上。
[root@haproxy certs]# mkdir /etc/haproxy/certs
[root@haproxy certs]# cd /etc/pki/CA
[root@haproxy certs]# (umask 077;openssl genrsa -out private/cakey.pem 4096)
[root@haproxy certs]# openssl req -new -x509 -key private/cakey.pem -out cacert.pem -days 365
[root@haproxy certs]# touch index.txt
[root@haproxy certs]# echo 01 > serial
[root@haproxy certs]# cd /etc/haproxy/certs/
[root@haproxy certs]# openssl genrsa -out haproxy.key 2048
[root@haproxy certs]# openssl req -new -key haproxy.key -out haproxy.csr
[root@haproxy certs]# openssl ca -in haproxy.csr -out haproxy.crt
[root@haproxy certs]# cat haproxy.crt haproxy.key > haproxy.pem
# 将两个文件打包成pem文件
[root@haproxy certs]# chmod 600 haproxy.pem
[root@haproxy certs]# systemctl restart haproxy
[root@haproxy certs]# ss -tln
# 这时应该有443和8080端口被监听

访问https://192.168.1.25/test.txt
访问http://192.168.1.25/test.txt，访问会被重定向到https

[root@haproxy haproxy]# vim haproxy.cfg
frontend  http   *:80
    redirect location https://192.168.1.25 if ! { ssl_fc }
# 设置所有请求都重定向到https://172.16.0.67

访问http://192.168.1.25/test.txt，这会重定向到https://172.16.0.67。不论访问什么页面，都会重定向到https://172.16.0.67
```

