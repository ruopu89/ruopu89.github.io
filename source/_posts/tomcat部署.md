---
title: tomcat部署
date: 2019-01-17 09:27:52
tags: tomcat
categories: tomcat
---

### 概念

> tomcat最外层为Server，表示一个实例；一个Server内部可以容纳多个Service，Service的目地主要是把Connetor和engine建立关联关系，一个engine可以有多个Connetor，但一个Connetor只能属于一个engine，Connector是对服务地址和端口的定义，还可以定义最大并发连接数等功能。engine是真正的窗口类组件，就是能够存放webapp并可以解析以后响应给用户的组件，这些组件有engine、host、context。它们被定义在server.xml这个主配置文件中。一般不用tomcat面向客户请求，而是用反代。可以用nginx、 httpd反代。用nt或at表示。在后端也不会只用tomcat，还会在tomcat前加一个nginx或httpd处理静态服务，另外，这个前端的nginx服务器还会将动态内容反代到其后面的tomcat处理。也就是nnt或nat。因为给动态服务器处理的内容中有一些如js、css等格式的内容

![](/images/tomcat/tomcat结构.jpg)

> 对tomcat来讲，一个主机上的实例叫一个server，或说每个tomcat进程叫一个server，一台主机上可以有多个server。一般一个主机上只运行一个server。tomcat运行在java的虚拟机（JVM）上，java虚拟机有一个特点，就是单进程使用内存不能超过32G。server可以监听在某个套接字上，用来管理。像vanish监听在6082上进行管理一样，但tomcat的管理默认没有认证功能，所有只能监听在127.0.0.1上，甚至最好不要监听。server只代表是一个进程而已，与web无关。为了表示tomcat自己的组件，需要运行一个叫容器的组件，就是在server中的engine，它是用来让用户能够存储java代码，也就是jsp代码，并把代码加载后运行生成结果的组件。它像是一个JVM的实例，就是一个java虚拟机进程。server只是一个环境，engine才是运行代码的引擎或叫jsp容器。用户请求的动态资源都应该由引擎来运行，请求到达主机后要能交给引擎组件才行。引擎要能通过套接字与其他主机联系，但引擎不能监听端口，所以在server中还要有一个到多个连接器connector。一个server内部可以存在多个引擎，连接器与引擎之间只能一一对应，请求到连接器后，这个请求属于哪个引擎，请求就会被路由到哪个引擎。但连接器是不能直接与引擎建立连接关系的。在server内部还有service，service可以有多个，它的作用主要在于把一个或多个连接器与特定的引擎关联起来。实际是在一个service中可以有一个引擎和多个连接器。一个连接器只能属于一个service，因此，属于service的连接器，也就属于了service中的引擎。一个引擎内可以有多个虚拟主机（Host），一般tomcat只使用基于主机名的虚拟主机。每一个应用叫一个context，context可以出现多个。valve用来过滤日志、用户请求等。（布署进，除了布署应用本身，还要布署应用依赖的环境被满足）。后端的tomcat只处理动态内容，静态内容由nginx处理，所以请求的如果是静态内容，就由nginx处理，如果是动态内容，就由nginx反代到tomcat上，处理后返回给nginx。这是一个nt的组合
>
> 网站的基本组织框架：第一层接入层、第二层缓存层、第三层应用程序服务器层、第四层存储层



### 测试

#### 安装与配置

```shell
[root@test ~]# yum install -y java-1.8.0-openjdk-devel
# 安装openjdk
[root@test ~]# java -version
# 查看版本，参数是一个横杠
[root@test ~]# vim /etc/profile.d/java.sh
export JAVA_HOME=/usr
[root@test ~]# . /etc/profile.d/
[root@test ~]# echo $JAVA_HOME          
/usr
# java程序会依赖这个变量找java的安装环境
[root@test ~]# yum install -y tomcat tomcat-webapps tomcat-admin-webapps tomcat-docs-webapp
# tomcat-jsp-2.2-api和tomcat-servlet-3.0-api是类库。tomcat-webapps提供的是测试页；admin-webapps提供的是Manager App和Host Manager，访问是要认证的；tomcat-docs-webapp提供的是页面中的Documentation
[root@test ~]# systemctl start tomcat
[root@test ~]# ss -tln
# tomcat默认监听在8080上
访问http://192.168.1.14:8080/
[root@test ~]# cd /etc/tomcat/
[root@test tomcat]# cp server.xml{,.bak}
# rpm包主配置文件在/etc/tomcat/server.xml，如果是解压安装的tomcat，主配置文件在/usr/local/tomcat/conf下
[root@test tomcat]# vim server.xml
<Server port="8005" shutdown="SHUTDOWN">
# Server是tomcat的管理端，这表示server监听在哪个端口，并接受SHUTDOWN命令，可以关闭。这个功能是不安全的，将port改为-1或在shutdown后添加一个随机字符串就可使关闭功能失效
	<Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
# Listener表示侦听器，作用是查看对应的某个类是否被加载，如果加载了就启用起来，以便侦听某些类的资源
 <GlobalNamingResources>
 # 这是定义全局命名资源的，对主机和用户的名称解析
 <Service name="Catalina">
 # Service只有一个名称叫Catalina，Service把连接器和engine关联起来的
     <Connector port="8080" protocol="HTTP/1.1"
                   connectionTimeout="20000"
                   redirectPort="8443" />
# Connector对服务端口进行定义。指明连接器的端口和协议，连接超时时间，最后是一旦超时，重定向到哪个端口。这些定义的都是类的属性
	<Engine name="Catalina" defaultHost="localhost">
# 同一个Service中的Connector都属于同一个Engine，定义名称为Catalina，defaultHost表示当用户访问的主机与tomcat中的主机没有一个匹配时，就用这个默认的主机来响应
    <Host name="localhost"  appBase="webapps"
                unpackWARs="true" autoDeploy="true">
# 用Host定义虚拟主机，appBase表示网页根文档在哪，rpm包安装的tomcat的网页根目录在/var/lib/tomcat/webapps的ROOT下，unpackWARs自动展开，autoDeploy自动布署
[root@test tomcat]# yum install -y nc
[root@test tomcat]# nc -nv 127.0.0.1 8005
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 127.0.0.1:8005.
SHUTDOWN
# 连接管理端口，输入SHUTDOWN命令后就可以关闭tomcat了
[root@test tomcat]# ss -tln
# 端口关闭了
[root@test tomcat]# mkdir -pv test/{WEB-INF,META-INF,lib,classes}
[root@test tomcat]# vim test/index.jsp
<%@ page language="java" %>		# 定义当前网站使用的默认语言是java
<%@ page import="java.util.*" %>  		# 导入java.util下面的所有类
   <html>
      <head>
         <title>Test Page</title>
      </head>
      <body>
         <% out.println("hello world");			# out.println是java的输出命令
         %>
      </body>
   </html>
[root@test tomcat]# cp -a test/ /var/lib/tomcat/webapps/
# 将网页目录放到根下，因为文件少，所以没有打包网页目录。因为配置文件中定义了自动布署，所以可以自动导入java.util下面的所有类。如果是war文件，也会自动展开的。因为配置文件中定义了自动展开
[root@test tomcat]# systemctl start tomcat
访问http://192.168.1.14:8080/test/index.jsp
[root@test tomcat]# ls /var/cache/tomcat/work
Catalina
# 编译后的页面在/var/cache/tomcat/work中叫Catalina
```



#### 页面中的manager

```shell
[root@test tomcat]# vim /etc/tomcat/tomcat-users.xml.
<role rolename="manager-gui"/> 
# 打开manager-gui功能
<user name="tomcat" password="tomcat" roles="manager-gui" />
# 自定义用户名和密码，这里要设置password和roles，roles后的内容要与上面的role中定义的一样
[root@test tomcat]# systemctl restart tomcat
# 修改后必须重启，因为启动时此文件已装载进内存
访问http://192.168.1.14:8080中的Manager App，使用上面的用户名和密码，在这里可以管理站点，在这里也可以热布署
```



#### 测试热部署

```shell
[root@test tomcat]# cp -a test/ /var/lib/tomcat/webapps/test2
# 在管理页中的Deploy中的Context Path (required)中输入/test2（视频中去掉了斜线），点Deploy，有错误提示，但也可以在上面的页面管理中看到test2了。在下面还有WAR file to deploy，是热布署war文件的，也是选择好文件，并点击Deploy即可。实际测试中在复制test文件后，在管理页面中就已经可以看到test2的内容了
```



#### 管理虚拟主机

```shell
[root@test tomcat]# vim /etc/tomcat/tomcat-users.xml
<role rolename="admin-gui"/> 
<role rolename="manager-gui"/>
<user name="tomcat" password="tomcat" roles="manager-gui,admin-gui" />
# 页面中的Host Manager是管理虚拟主机的，用户所属的角色是admin-gui，加入即可。
[root@test tomcat]# systemctl restart tomcat
[root@test tomcat]# mkdir -pv /appdata/ilinux/ROOT
[root@test tomcat]# cp -r test/* /appdata/ilinux/ROOT/
[root@test tomcat]# vim /appdata/ilinux/ROOT/index.jsp
<%@ page language="java" %>
<%@ page import="java.util.*" %>
   <html>
      <head>
         <title>ilinux page</title>
      </head>
      <body>
         <% out.println("hello ilinux");
         %>
      </body>
   </html>
访问http://192.168.1.14:8080，进入Host Manager中可以创建删除虚拟主机，定义虚拟主机时要指明Name站点名称，这里用了www.ilinux.io，Aliases站点别名，这里用ilinux.io，App base站点路径，这里用/appdata/ilinux/，下面选项是，AutoDeploy：是否自动布署；DeployOnStartup：是否启动时自动布署；DeployXML：是否基于xml文件来布署；UnpackWARs：是否自动展开WAR文件；Manager App：是否用Manager App来管理，最后添加就行了

** 让自己的主机可以解析www.ilinux.io，配置hosts文件

访问 www.ilinux.io:8080，不用在访问时写ROOT，tomcat可以自动识别，根文件就在ROOT中。但这种方式是定义在内存中的，如果重启tomcat后，就不存在了。如果要长期有效，还要定义在server.xml中。访问显示hello ilinux
[root@test tomcat]# vim server.xml
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" maxThreads="1000" acceptCount="200" />
# 加入，最大并发连接数是1000，等待队列是200。端口如果改为80是启动不了的，因为是普通用户
<Engine name="Catalina" defaultHost="localhost">
      <Host name="www.ilinux.io" appBase="/appdata/ilinux"
            unpackWARs="true" autoDeploy="true"/>
# 这里只要将Host写在已有的<Engine>中即可，用<Host></Host>或<.../>的方式都可以
[root@test tomcat]# systemctl restart tomcat
访问www.ilinux.io:8080，访问显示hello ilinux
上传shopxx-a5-Beta.zip到tomcat主机
[root@test ~]# unzip shopxx-a5-Beta.zip
[root@test ~]# cp -a /root/shopxx-v3.0-Beta/shopxx-3.0Beta/ /appdata/ilinux/
# 放在/appdata/ilinux目录中，是因为上面在server.xml中的Host中定义了www.ilinux.io的网页目录路径
[root@test ~]# ln -sv /appdata/ilinux/shopxx-3.0Beta/ /appdata/ilinux/shopxx
访问www.ilinux.io:8080/shopxx，这里可以看到安装界面
[root@test ~]# rm -f /appdata/ilinux/shopxx
[root@test ~]# mkdir /e-shop
[root@test ~]# cp -a /root/shopxx-v3.0-Beta/shopxx-3.0Beta/ /e-shop/
[root@test ~]# cd /e-shop/
[root@test e-shop]# ln -sv shopxx-3.0Beta/ shopxx
[root@test e-shop]# vim /etc/tomcat/server.xml
<Engine name="Catalina" defaultHost="localhost">
      <Host name="www.ilinux.io" appBase="/appdata/ilinux"
            unpackWARs="true" autoDeploy="true">
         <Context path="/eshop" docBase="/e-shop/shopxx/" reloadable="true"/>
      </Host>
# 这里一定要注意，Context一定要定义在某个Host中，不然是无法访问的。Context类似alias，就是将设置的URL指向设置的路径，这里用path设置URL，docBase设置真正的路径，reloadable表示是否自动装载。这时访问eshop时就会到/e-shop/shopxx找文件了
[root@test e-shop]# systemctl restart tomcat
访问www.ilinux.io:8080/eshop，这时也可以看到安装界面
```



#### 添加日志功能

```shell
[root@test tomcat]# vim server.xml
<Engine name="Catalina" defaultHost="localhost">
      <Host name="www.ilinux.io" appBase="/appdata/ilinux"
            unpackWARs="true" autoDeploy="true">
         <Context path="/eshop" docBase="/e-shop/shopxx/" reloadable="true"/>
         <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
         prefix="ilinux_access_log." suffix=".log"
         pattern="%h %l %u %t &quot;%r&quot; %s %b"/>
      </Host> 
[root@test tomcat]# systemctl restart tomcat
访问www.ilinux.io:8080/eshop
[root@test ~]# tail -f /var/log/tomcat/ilinux_access_log.2019-01-17.log
```



#### nginx反向代理

```shell
准备两台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。另一台是内网主机，地址：172.16.106.133。同步两台服务器的时间

* tomcat
[root@test ~]# yum install -y java-1.8.0-openjdk-devel tomcat tomcat-webapps tomcat-admin-webapps tomcat-docs-webapp
[root@test tomcat]# vim tomcat-users.xml
<role rolename="admin-gui"/> 
<role rolename="manager-gui"/> 
<user name="tomcat" password="tomcat" roles="admin-gui,manager-gui" />
[root@test ~]# systemctl start tomcat
[root@test ~]# ss -tln
访问http://172.16.106.133:8080/，测试tomcat是否正常

* 反代服务器
[root@test ~]# yum install -y nginx
[root@test ~]# cd /etc/nginx/
[root@test nginx]# vim conf.d/ilinux.conf
server {
   listen 80;
   server_name www.ilinux.io;
   location / {
        proxy_pass http://172.16.106.133:8080;
   }
}
[root@test nginx]# nginx -t
[root@test nginx]# systemctl start nginx
设置本机hosts文件，可以解析www.ilinux.io;
访问www.ilinux.io。这时如果不关闭firewall是不能访问的，如果关闭了firewall而未关闭selinux会提示502无法访问

* tomcat
[root@test ~]# mkdir -pv /var/lib/tomcat/webapps/test/{WEB-INF,META-INF,classes,lib}
[root@test ~]# vim /var/lib/tomcat/webapps/test/index.jsp
<%@ page language="java" %>
<html>
   <head><title>TomcatA</title></head>
   <body>
      <h1><font color="red">TomcatA.magedu.com</font></h1>
      <table align="centre" border="1">
         <tr>
           <td>Session ID</td>
           <% session.setAttribute("magedu.com","magedu.com"); %>
           <td><%= session.getId() %></td>
         </tr>
         <tr>
           <td>Created on</td>
           <td><%= session.getCreationTime() %></td>
         </tr>
      </table>
   </body>
</html>
访问www.ilinux.io/test/，www.ilinux.io/manager

* 反代服务器
[root@test ~]# tail -f /var/log/nginx/access.log
[root@test nginx]# vim conf.d/ilinux.conf 
server {
   listen 80;
   server_name www.ilinux.io;
   location / {
        proxy_pass http://172.16.106.132:8080;
   }
   location ~*\.(jsp|do)$ {
        proxy_pass http://172.16.106.133:8080;
   }
}
# 这样设置就可以实现动静分离
访问http://www.ilinux.io/test/index.jsp，如果不写后面的index.jsp会打不开页面
```



#### http反向代理

```shell
准备两台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。另一台是内网主机，地址：172.16.106.133。同步两台服务器的时间

* 反代服务器
[root@test ~]# yum install -y httpd
[root@test ~]# cd /etc/httpd/
[root@test httpd]# vim conf.d/ilinux-http-tomcat.conf
<VirtualHost *:80>
   ServerName www.ilinux.io
   proxyRequests off		# 关闭正向代理
   ProxyPreserveHost on			# 将主机头传到后端
   ProxyVia on			# 是否在响应报文中加上via首部
   <Proxy *>			# Proxy功能可以被谁使用
      Require all granted
   </Proxy>
   ProxyPass / http://172.16.106.133:8080/     
   # 将自己的哪个URL代理到后端的哪个URL，最后的/线不能少
   ProxyPassReverse / http://172.16.106.133:8080/		# 这条不写也可以
   <Location />			# 哪个URL可以被谁访问
      Require all granted
   </Location>
</VirtualHost>
[root@test httpd]# httpd -M
# 看一下是否有proxy_module和proxy_http_module两个模块
[root@test httpd]# httpd -t
# 检查语法
[root@test httpd]# systemctl start httpd
[root@test httpd]# ss -tln
访问 www.ilinux.io
[root@test httpd]# tail -f /var/log/httpd/access_log
# 可以使用之前的nginx反代到后端的httpd上，httpd再反代到本机的tomcat上。实现nat架构
```



#### ajp反向代理

```shell
准备两台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。另一台是内网主机，地址：172.16.106.133。同步两台服务器的时间

* 反代服务器
[root@test httpd]# cp /etc/httpd/conf.d/ilinux-http-tomcat.conf /etc/httpd/conf.d/iunix-ajp-tomcat.conf
[root@test httpd]# vim conf.d/iunix-ajp-tomcat.conf
<VirtualHost *:80>
   ServerName www.iunix.io
   proxyRequests off
   ProxyPreserveHost on
   ProxyVia on
   <Proxy *>
      Require all granted
   </Proxy>
   ProxyPass / ajp://172.16.106.133:8009/		# 改协议为ajp，端口为8009
   ProxyPassReverse / ajp://172.16.106.133:8009/
   <Location />
      Require all granted
   </Location>
</VirtualHost>
[root@test httpd]# httpd -M
# 注意proxy_ajp_module模块要加载
[root@test httpd]# systemctl restart httpd
访问www.iunix.io
# ajp的好处是用浏览器是不能访问的，只要注释掉8080端口（因为ajp联系的是8009端口），更安全。显示的结果与http的结果是一样的，也是tomcat主页
```



#### httpd负载均衡

```shell
准备三台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。tomcat1是内网主机，地址：172.16.106.133。tomcat2地址：172.16.106.134。同步两台服务器的时间

* 反代服务器
[root@test httpd]# httpd -M
# 要加载proxy_balancer_module模块
[root@test httpd]# vim conf.d/ilinux-http-tomcat.conf
<Proxy balancer://tcsrvs>
# 定义组，balancer://是调用这个模块，不能变。tcsrvs是自定义的名字
   BalancerMember http://172.16.106.133:8080
   BalancerMember http://172.16.106.134:8080
# 调度的成员
   ProxySet lbmethod=byrequests
# 定义算法，这是加权轮询的。byrequests：默认。基于请求数量计算权重。bytraffic：基于I/O流量大小计算权重。bybusyness：基于挂起的请求(排队暂未处理)数量计算权重。
</Proxy>
<VirtualHost *:80>
   ServerName www.ilinux.io
   proxyRequests off
   ProxyPreserveHost on
   ProxyVia on
   <Proxy *>
      Require all granted
   </Proxy>
   ProxyPass / balancer://tcsrvs/
   ProxyPassReverse / balancer://tcsrvs/
   <Location />
      Require all granted
   </Location>
</VirtualHost>
[root@test httpd]# systemctl restart httpd
[root@test httpd]# ss -tln

* tomcat1
[root@test ~]# scp -r /usr/share/tomcat/webapps/test/ 172.16.106.134:/root

* tomcat2
[root@test ~]# yum install -y java-1.8.0-openjdk-devel tomcat tomcat-webapps tomcat-admin-webapps tomcat-docs-webapp
[root@test ~]# vim /etc/profile.d/java.sh
export JAVA_HOME=/usr
[root@test ~]# cp -r test/ /usr/share/tomcat/webapps/
[root@test ~]# vim /var/lib/tomcat/webapps/test/index.jsp               
<%@ page language="java" %>
<html>
   <head><title>TomcatB</title></head>
   <body>
      <h1><font color="blue">TomcatB.magedu.com</font></h1>
      <table align="centre" border="1">
         <tr>
           <td>Session ID</td>
           <% session.setAttribute("magedu.com","magedu.com"); %>
           <td><%= session.getId() %></td>
         </tr>
         <tr>
           <td>Created on</td>
           <td><%= session.getCreationTime() %></td>
         </tr>
      </table>
   </body>
</html>
[root@test ~]# vim /etc/tomcat/tomcat-users.xml
<role rolename="admin-gui"/> 
<role rolename="manager-gui"/> 
<user name="tomcat" password="tomcat" roles="admin-gui,manager-gui" />
[root@test ~]# systemctl start tomcat
[root@test ~]# ss -tln

* 反代服务器
[root@test httpd]# vim /etc/hosts
192.168.1.14 www.ilinux.io www.iunix.io
[root@test httpd]# for i in {1..10};do curl -s http://www.ilinux.io/test/ | grep -i 'tomcat';done
# 这时应该返回两台服务器的结果
   <head><title>TomcatA</title></head>
      <h1><font color="red">TomcatA.magedu.com</font></h1>
   <head><title>TomcatB</title></head>
      <h1><font color="blue">TomcatB.magedu.com</font></h1>
```



#### ajp负载均衡

```shell
准备三台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。tomcat1是内网主机，地址：172.16.106.133。tomcat2地址：172.16.106.134。同步两台服务器的时间

* 反代服务器
[root@test httpd]# vim conf.d/iunix-ajp-tomcat.conf 
<Proxy balancer://tomcatsrvs>
   BalancerMember ajp://172.16.106.133:8009
   BalancerMember ajp://172.16.106.134:8009
   ProxySet lbmethod=byrequests
</Proxy>
<VirtualHost *:80>
   ServerName www.iunix.io
   proxyRequests off
   ProxyPreserveHost on
   ProxyVia on
   <Proxy *>
      Require all granted
   </Proxy>
   ProxyPass / balancer://tomcatsrvs/
   ProxyPassReverse / balancer://tomcatsrvs/
   <Location />
      Require all granted
   </Location>
</VirtualHost>
[root@test httpd]# systemctl restart httpd
[root@test httpd]# for i in {1..10};do curl -s http://www.iunix.io/test/ | grep -i 'tomcat';done
   <head><title>TomcatA</title></head>
      <h1><font color="red">TomcatA.magedu.com</font></h1>
   <head><title>TomcatB</title></head>
      <h1><font color="blue">TomcatB.magedu.com</font></h1>
```



#### 会话粘性/内建管理页

```shell
[root@test httpd]# vim conf.d/ilinux-http-tomcat.conf
Header add Set-Cookie "ROUTEID=%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
<Proxy balancer://tcsrvs>
   BalancerMember http://172.16.106.133:8080 route=TomcatA
   BalancerMember http://172.16.106.134:8080 route=TomcatB
   ProxySet lbmethod=byrequests
   ProxySet stickysession=ROUTEID
</Proxy>
<VirtualHost *:80>
   ServerName www.ilinux.io
   proxyRequests off
   ProxyPreserveHost on
   ProxyVia on
   <Proxy *>
      Require all granted
   </Proxy>
   ProxyPass / balancer://tcsrvs/
   ProxyPassReverse / balancer://tcsrvs/
   <Location />
      Require all granted
   </Location>
   <Location /bstatus>
      SetHandler balancer-manager
      ProxyPass !
      Require all granted
   </Location>
</VirtualHost>
[root@test httpd]# httpd -t
[root@test httpd]# systemctl restart httpd
访问http://www.ilinux.io/bstatus可以看到管理页面，访问http://www.ilinux.io/test/按F12查看，可以看到cookie一项中有ROUTEID=TomcatA或B，表示cookie会话绑定
```



#### session会话绑定，用session cluster的方法实现

```shell
准备三台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。tomcat1是内网主机，地址：172.16.106.133。tomcat2地址：172.16.106.134。同步两台服务器的时间

* 反代服务器
[root@test ~]# vim /etc/nginx/nginx.conf
http {
    upstream tcsrvs {
        server 172.16.106.133:8080;
        server 172.16.106.134:8080;
    }
# 加入upstream段
[root@test ~]# vim /etc/nginx/conf.d/ilinux.conf
server {
   listen 80;
   server_name www.ilinux.io;
   location / {
        proxy_pass http://tcsrvs;
   }
}
# 这里没有在两台tomcat主机上再安装nginx进行静态处理及动态内容反代
[root@test ~]# systemctl start nginx
[root@test ~]# ss -tln
访问www.ilinux.io/test，这时是轮询的，这时的session ID是会改变的，只要刷新。因为被识别为新用户了。这个测试就是要让sessionID不变。
# 查看官方文档第十八章，Clustering/Session Replication HOW-TO。这个组件就叫Cluster，只能放在Engine或Host内部。因为每个集群节点都要配置，所以时间都要同步。之后会通过多播地址228.0.0.4进行通信，多播端口是45564。只要监听这个地址和端口就可以成为成员。接收多播信息要监听在4000-4100之间。

* tomcat1&tomcat2
[root@test ~]# vim /etc/tomcat/server.xml
<Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"
        channelSendOptions="8">
        <Manager className="org.apache.catalina.ha.session.DeltaManager"
        expireSessionsOnShutdown="false" 
        notifyListenersOnReplication="true"/>
# 定义使用哪一个会话管理器，一共有五种；expireSessionsOnShutdown表示关机后会话是否过期，这里是不允许；
        <Channel className="org.apache.catalina.tribes.group.GroupChannel">
# Channel是用来定义信道的
        <Membership className="org.apache.catalina.tribes.membership.McastService"
           address="228.0.0.4" 		# 多播地址最好改一下
           port="45564" 
           frequency="500" 		# 健康检测500毫秒
           dropTime="3000"/>		# 3000毫秒没有响应就将节点去除
        <Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
           address="172.16.106.133" 
           # 改为自己的地址。如果是auto与hosts文件有关，它会做主机名反解
           port="4000" 
           autoBind="100" 
           selectorTimeout="5000"
           maxThreads="6"/>
        <Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
        <Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
        </Sender>
        <Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
        <Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatch15Interceptor"/>
        </Channel>
        <Valve className="org.apache.catalina.ha.tcp.ReplicationValve" filter=""/>
        <Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>

        <Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
           tempDir="/tmp/war-temp/"
           deployDir="/tmp/war-deploy/"
           watchDir="/tmp/war-listen/"
           watchEnabled="false"/>

        <ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
        </Cluster>
# 在想使用集群的Host中添加上面的内容
[root@test ~]# cp web.xml /var/lib/tomcat/webapps/test/WEB-INF/
# 给test提供一个web.xml文件
[root@test ~]# vim /var/lib/tomcat/webapps/test/WEB-INF/web.xml
	<distributable/>
# 在web-app段内任一位置添加<distributable/>才能实现上面的集群功能。当然，还要是在想实现集群功能的页面中的web.xml文件中添加，这里就是在test的web.xml文件中添加的
[root@test ~]# scp /etc/tomcat/server.xml 172.16.106.133:/etc/tomcat
[root@test ~]# scp /var/lib/tomcat/webapps/test/WEB-INF/web.xml root@172.16.106.133:/var/lib/tomcat/webapps/test/WEB-INF
[root@test test]# systemctl stop tomcat
[root@test test]# systemctl start tomcat
[root@test ~]# tail -f /var/log/tomcat/catalina.2019-01-17.log
访问www.ilinux.io/test，这时不管是TomcatA还是B，session ID都是不会变的。测试中出现问题，Session无法绑定，原因是test中的WEB-INF目录的名字有问题，改回来就没问题了。
```

#### tomcat + memcached

```shell
准备三台主机，第一台是反代服务器，两个接口，地址：192.168.1.14 172.16.106.132。tomcat1是内网主机，地址：172.16.106.133。tomcat2地址：172.16.106.134。同步两台服务器的时间

* tomcat1 & tomcat2
[root@test ~]# yum install -y memcached
[root@test ~]# systemctl start memcached
[root@test ~]# cd /etc/tomcat/
[root@test ~]# cp server.xml{,.cluster}
# 将tomcat恢复成最初状态，将cluster一段删除
[root@test ~]# vim server.xml
<Context path="/test" docBase="test" reloadable="true">
# reloadable表示自动装载
            <Manager className="de.javakaffee.web.msm.MemcachedBackupSessionManager"
            memcachedNodes="m1:172.16.106.133:11211,m2:172.16.106.134:11211"
            failoverNodes="m2"
            requestUriIgnorePattern=".*\.(ico|png|gif|jpg|css|js)$"
            transcoderFactoryClass="de.javakaffee.web.msm.serializer.javolution.JavolutionTran
scoderFactory" />
# serializer后的javolution开头的j一定要小写
# memcachedNodes中m1是自定义的名称，后面是节点的地址；failoverNodes="m2"表示m2是备用节点，如果m1有故障m2才上线。requestUriIgnorePattern指有些内容是不缓存的，因为是静态文件。
         </Context>
[root@test ~]# scp /etc/tomcat/server.xml 172.16.106.134:/etc/tomcat/
下载相关包到两台tomcat
1.  javolution-5.4.3.1.jar 		# 流式化工具
2. msm-javolution-serializer-1.9.7.jar		# MSM支持两种模式即粘性sessions和非粘性sessions
3. memcached-session-manager-1.9.7.jar		# memcached会话管理器
4. memcached-session-manager-tc7-1.9.7.jar		# memcached会话管理器
5. spymemcached-2.11.1.jar		# 驱动：tomcat连接memcached
[root@test ~]# scp *.jar 172.16.106.134:/usr/share/java/tomcat/
[root@test ~]# systemctl stop tomcat.
[root@test ~]# systemctl start tomcat
[root@test ~]# tail -f /var/log/tomcat/catalina.2019-01-17.log
# 监控日志，看启动是否有问题。启动没有问题后，访问www.ilinux.io/test，这时的SessionID是不会有变化的。因为sticky设置成了true，如果是false，那么就会有变化了。SessionID的最后有m1或m2的标识，可以知道是在哪个memcached上。

* tomcat1
[root@test ~]# systemctl stop memcached
再访问www.ilinux.io/test，这时的SessionID还是不会有变化，只是Session ID一行最后变成了m2。切记，一定要先启动memcached再启动tomcat。
[root@test ~]# yum install -y libmemcached-devel
# 这个包是C与memcached连接用的，提供了很多命令
[root@test ~]# memstat --servers="172.16.106.133"
# 显示memcached的各种数据
```

#### memcached安装使用

```shell
在tomcat主机上安装测试

[root@test ~]# yum install -y telnet
[root@test ~]# vim /etc/sysconfig/memcached
PORT="11211"		# 端口
USER="memcached"		# 启动服务的用户名
MAXCONN="1024"		
# 最大并发连接数;存储层是不面向用户的，是从前面的反代发来的，所以1024并不小
CACHESIZE="64"		# 缓存空间大小，这要改一下，如2G
OPTIONS=""
[root@test ~]# cat /usr/lib/systemd/system/memcached.service 
[Unit]
Description=Memcached 
Before=httpd.service
After=network.target

[Service]
Type=simple
EnvironmentFile=-/etc/sysconfig/memcached
ExecStart=/usr/bin/memcached -u $USER -p $PORT -m $CACHESIZE -c $MAXCONN $OPTIONS

[Install]
WantedBy=multi-user.target
# 可以看到，启动时就是调用配置文件中的几个参数
[root@test ~]# telnet 127.0.0.1 11211
stats
stats slabs  
# 查看内存分配器
add mykey 1 600 13  
# 设置存储数据的信息，这里存储的键叫mykey，标志位是1，过期时间是600秒，占用内存大小是13个字符。
www.ilinux.io 	
# 这是要存储的数据，成功后返回STORED
stats	
# 这时cmd_set的值是1了。
get mykey	
# 查看mykey的信息
append mykey 1 600 12
# 在后面追加数据
www.iunix.io  
# 返回了NOT_STORED，因为数据过期了，不能追加
get mykey
prepend mykey 1 600 7	
# 在前面补
http://		
# 添加这些内容
get mykey
delete mykey
get mykey
add counter 1 600 1	
# 设置一个计数器
0	
# 值是0
get counter
incr counter 1	
# 增加1
get counter
incr counter 2
decr counter 1	
# 减1
flush_all	
# 清空数据
quit
# 退出
```



#### tomcat + redis实现session绑定

```shell
准备一台redis，两台tomcat

* 反代服务器
[root@test ~]# yum install -y redis
[root@test ~]# vim /etc/redis.conf
bind 0.0.0.0
[root@test ~]# systemctl start redis
[root@test ~]# vim /etc/nginx/nginx.conf
http {
...
upstream tcsrvs {
        server 192.168.1.13:8080;
        server 192.168.1.15:8080;
    }
[root@test ~]# vim /etc/nginx/conf.d/ilinux.conf
server {
    listen 80;
    server_name www.ilinux.io;
    location / {
        proxy_pass http://tcsrvs;
    }
}

* tomcat1 & tomcat 2
下载commons-pool2-2.0.jar、jedis-2.7.2.jar、tomcat-redis-session-manager1.2.jar到/usr/share/java/tomcat中
# 试过上面三个包的其他版本，tomcat启动时均有报错，用上面三个版本没有问题。可以个人百度网盘下载。参考：https://my.oschina.net/xshuai/blog/916122
[root@test tomcat]# vim /etc/tomcat/context.xml
<Valve className="com.orangefunction.tomcat.redissessions.RedisSessionHandlerValve" />
    <Manager className="com.orangefunction.tomcat.redissessions.RedisSessionManager"
         host="192.168.1.14" 
         port="6379" 
         database="0" 
         maxInactiveInterval="60"/>
[root@test tomcat]# mkdir -pv /var/lib/tomcat/webapps/test/{WEB-INF,META-INF,classes,lib}
[root@test tomcat]# vim /usr/share/tomcat/webapps/test/index.jsp
<%@ page language="java" %>
<html>
   <head><title>TomcatA</title></head>
   <body>
      <h1><font color="red">TomcatA.magedu.com</font></h1>
      <table align="centre" border="1">
         <tr>
           <td>Session ID</td>
           <% session.setAttribute("magedu.com","magedu.com"); %>
           <td><%= session.getId() %></td>
         </tr>
         <tr>
           <td>Created on</td>
           <td><%= session.getCreationTime() %></td>
         </tr>
      </table>
   </body>
</html>
[root@test tomcat]# cd /usr/share/java/tomcat
[root@test tomcat]# scp /etc/tomcat/context.xml 192.168.1.13:/etc/tomcat/
[root@test tomcat]# scp jedis-2.7.2.jar commons-pool2-2.0.jar tomcat-redis-session-manager1.2.jar 192.168.1.13:/usr/share/java/tomcat/
[root@test tomcat]# scp -r /usr/share/tomcat/webapps/test/ 192.168.1.13:/usr/share/tomcat/webapps/
[root@test tomcat]# vim /etc/tomcat/tomcat-users.xml
<role rolename="admin-gui"/>
<role rolename="manager-gui"/>
<user name="admin" password="adminadmin" roles="admin-gui,manager-gui" />
[root@test tomcat]# scp /etc/tomcat/tomcat-users.xml 192.168.1.13:/etc/tomcat
[root@test tomcat]# systemctl start tomcat
# 启动两台tomcat
访问http://www.ilinux.io/test/，这时可以看到sessionID是不会变化的
```

