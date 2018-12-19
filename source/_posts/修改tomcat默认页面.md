---
title: 修改tomcat默认页面
date: 2018-09-12 12:50:03
tags: tomcat
categories: tomcat
---



> 修改tomcat的默认页面为自己的主页，再使用nginx反代到tomcat。实现访问域名即可打开主页。

* tomcat

```shell
vim /usr/local/tomcat/conf/server.xml
	<Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
        <Context path="" docBase="echarge" reloadable="true" />
//在Host下面加入Context一行，设置path为空，这样就不会访问到默认页了。之后用docBase指定主页的路径，这里写echarge表示是在webapps下的echarge目录。reloadable表示是否自动装载。
/usr/local/tomcat/bin/shutdown.sh
/usr/local/tomcat/bin/startup.sh
//此例中已将主机的IP地址解析为域名了，另外tomcat监听在8081端口。这时可以通过"域名:8081"访问到主页了。
```

* nginx

```shell
vim /etc/nginx/conf.d/web.conf
	proxy_cache_path /etc/nginx/cache levels=1:2:2 keys_zone=web_cache:10m max_size=2g;
    server{
       server_name web.jdyichong.com;
       index index.html index.htm;
       charset utf-8;
       proxy_cache web_cache;
       proxy_cache_key $request_uri;
       proxy_cache_methods GET HEAD;
       proxy_cache_min_uses 1;
       proxy_cache_valid 200 302 10m;
       proxy_cache_valid 400 1m;
       proxy_cache_use_stale http_502;

       location / {
            proxy_pass http://web.jdyichong.com:8081;
            //这里只要将所有访问都反代到本机的tomcat上即可。
       }
    }
//用nginx加入缓存设置，之后反向代理到本机的tomcat上，这样使用域名即可访问到主页了。
```

