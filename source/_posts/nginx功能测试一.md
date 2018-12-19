---
title: nginx功能测试一
date: 2018-09-13 14:55:07
tags: Nginx
categories: Nginx
---



# CPU绑定

```shell
ps axo user,comm,pid,psr,pcpu | grep nginx
#查看进程运行在哪个CPU上，显示的最后一个数字就是指第几颗CPU上。这个命令是查看进程的名称、PID以及CPU的占用率。psr表示绑定内核线程的处理器（如果有）的逻辑处理器号。 对一个进程来说，如果它的线程全都绑定到同一处理器上，那么显示该字段。pcpu表示CPU的占用率。comm表示进程名称。pid表示进程的ID号
watch -n.5 'ps axo comm,pid,psr | grep nginx'
yum install httpd-tools
ab -n 100000 -c 100 http://IP/index.html
#这时可以看到上面监测的绑定CPU数字在变化，因为CPU与进程没有绑定
vim /etc/nginx/nginx.conf
#这时在配置文件中加入绑定设置，定义在全局段
	worker_cpu_affinity auto;
	#自动绑定CPU
	worker_rlimit_nofile 65536;
	#如果不加入worker打开文件数量的上限，检查语法时会有报错，提示最多打开1024。定义在全局段
	worker_priority -5;
	#调整优先级
watch -n.5 'ps axo comm,pid,psr,ni | grep nginx'
#可以看到优先级改为了-5
nginx -t
nginx -s reload
vim /etc/hosts
	192.168.1.15 www.ruopu.com
systemctl stop firewalld
setenforce 0
ab -n 100000 -c 100 http://IP/index.html
#这时监测页面的CPU数字是不会变化的，因为已经绑定了，显示的内容中第一个是主控进程，只看后四个即可
vim /etc/nginx/nginx.conf
    worker_cpu_affinity 1000 0100 0010 0001;
    #绑定第0到3颗CPU，因为CPU是四核的。这时监测页面显示绑定在0－3的CPU上
vim /etc/nginx/nginx.conf
    worker_processes 2;
    worker_cpu_affinity 1000 0100;
nginx -s reload
#再查看监测页面，这里只绑定在2颗CPU上
```

# 设置访问权限

```shell
vim /etc/nginx/conf.d/vhost1.conf
	server {
		listen 80;
		server_name www.ruopu.com;
		root /data/nginx/vhost1;
		location / {
			deny 192.168.1.22;
			allow all;
#location定义对根及以下的路径的访问拒绝22地址访问，allow也一样，可以用一个地址或一个网段/24或all
		}
	}
nginx -s reload
访问IP
vim /etc/nginx/conf.d/vhost1.conf
	server {
		listen 80;
		server_name www.ruopu.com;
		root /data/nginx/vhost1;
		location ~* \.(jpg|png) {
			deny 192.168.1.22;
			allow all;
		}
	}
//对目录中的jpg或png文件，拒绝22地址访问。location中定义的地址是在root定义的地址的下面的路径
nginx -s reload
find /usr/share -iname "*.jpg" -exec cp {} /data/nginx/vhost1 \;
访问测试,www.ruopu.com/morning.jpg
如果location中定义了root，那么以location中的root为准
=====================================================================================
#在一个server中location配置段可存在多个，用于实现从uri到文件系统的路径映射；ngnix会根据用户请求的URI来检查定义的所有location，并找出一个最佳匹配，而后应用其配置；

location [ = | ~ | ~* | ^~ ] uri { ... }
Sets configuration depending on a request URI.
	=：对URI做精确匹配；例如, http://www.magedu.com/, http://www.magedu.com/index.html，如果等于根，那么就只有根被匹配，如果没有等号，那么从根以下的所有路径都匹配。
	location  =  / {
		...
	}
    ~：对URI做正则表达式模式匹配，区分字符大小写；
    ~*：对URI做正则表达式模式匹配，不区分字符大小写；
    ^~：对URI的左半部分做匹配检查，不区分字符大小写；也就是以什么开头
    不带符号：匹配起始于此uri的所有的url；
    匹配优先级：=, ^~, ～/～*，不带符号；
```

# 定义别名

```shell
mkdir /data/pictures
cp fish.jpg /data/pictures
vim conf.d/vhost1.conf
	location ^~ /images/ {
	#^~是指以其后设定的内容开头的，但这里没有什么用
		root /data/pictures；
	}
#这时访问www.ruopu.com/images/fish.jpg提示404，上面定义的应该是在pictures中找images目录，然后再找文件。/data/pictures就相当于根，在根下再打开images目录
mkdir /data/pictures/images
mv /data/pictures/*.jpg /data/pictures/images
访问www.ruopu.com/images/flower.jpg
vim conf.d/vhost1.conf
    location ^~ /images/ {
	    alias /data/pictures/；
    }
#将root改为alias。别名中的pictures右边的斜线是相对于images右侧的斜线来说的。所以，上面别名/data/pictures/最右边的斜线一定不能少，不然就不能访问到。
nginx -s reload
访问www.ruopu.com/images/fish.jpg才有，flower.jpg是访问不到的。因为在pictures中只有fish.jpg文件，没有flower.jpg文件。root是对于左侧的斜线，alias是对于最右侧的斜线来说的。
```

# 自定义错误页

```shell
vim /etc/nginx/conf.d/vhost1.conf
    server {
       listen 80;
       server_name www.ruopu.com;
       root /data/nginx/vhost1;
       location ~* \.(jpg|png) {
       error_page 404 =200 /notfound.html;
#notfound.html是URL的地址，它的位置是root定义的，因为加了等于200，所以这改变了状态码，在浏览器中按F12时可以看到是200了。测试使用等于200的设置会提示错误的值，原因是在200与其前面的等号中间加了空格，去掉空格就正常了。notfound.html应该是自定义的名字，但定义的名字与location指定的名字，与root定义的目录中的*.html文件的名字，这三个名字要一致，不然访问不了。error_page定义一次即可，这里只是展现了两种方法。
       error_page 404 /notfound.html;
       location = /notfound.html {
            root /data/nginx/error_pages;
       }
       location ^~ /images/ {
            alias /data/pictures/;
       }
    }
mkdir /data/nginx/error_pages
vim /data/nginx/error_pages/notfound.html
	404
nginx -s reload
访问www.ruopu.com/test.html，这是一个不存在的页面
```

# 认证

```shell
yum install httpd-tools
htpasswd -c -m /etc/nginx/.ngxpasswd tom
htpasswd -m /etc/nginx/.ngxpasswd jerry
vim /etc/nginx/conf.d/vhost1.conf
    server {
       listen 80;
       server_name www.ruopu.com;
       root /data/nginx/vhost1;
       error_page 404 /notfound.html;
       location = /notfound.html {
            root /data/nginx/error_pages;
       }
       location ^~ /images/ {
            alias /data/pictures/;
       }
       location ~* ^/(admin|login) {
       #~*做正则表达式模式匹配，如果以admin或login开头，就进行认证。当然，这也要求在vhost1中有这个目录才行。
            auth_basic "admin area or login url";
            #使用ngx_http_auth_basic_module模块实现基于用户的访问控制，使用basic机制进行用户认证；"admin area or login url"是一段自定义提示信息。
            auth_basic_user_file /etc/nginx/.ngxpasswd;
       }
    }
mkdir /data/nginx/vhost1/admin
vim /data/nginx/vhost1/admin/index.html
	admin aera
nginx -s reload
访问www.ruopu.com/admin，如果访问的是www.ruopu.com/login就会失败，因为在vhost1中没有login目录。
```

# 状态页

```shell
vim /etc/nginx/conf.d/vhost1.conf
    location /ngxstatus {
    #这里的ngxstatus也是自定义的名称，定义什么名字，访问时就用什么名字
        stub_status;
        #stub_status是一个系统变量
    }
    #ngxstatus是自定义名称，还可以在其中加认证或allow、deny。location后面定义的是URL名，也是路径名
nginx -s reload
访问www.ruopu.com/ngxstatus。
curl --silent http://www.ruopu.com/ngxstatus | awk '^Active/{print $3}'
#测试此条命令后的awk用法有问题，在^Active上。
```

# **压缩功能**

```shell
vim /etc/nginx/nginx.conf    
    http {
        gzip on;
        gzip_min_length 1k;
        #不压缩临界值，大于1K的才压缩，一般不用改
        gzip_buffers 4 16k;
        #支持实现压缩功能时为其配置的缓冲区数量及每个缓存区的大小；
        gzip_comp_level 6;
        #压缩级别，1-10，数字越大压缩的越好，时间也越长
        gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        #进行压缩的文件类型，缺啥补啥就行了，JavaScript有两种写法，最好都写上吧，总有人抱怨js文件没有压缩，其实多写一种格式就行了
        gzip_disable "MSIE [1-6]\.";
        #IE6对Gzip不怎么友好，不给它Gzip了
    }                    
nginx -s reload
cp nginx.conf /data/nginx/vhost1/nginx.html
chmod +r /data/nginx/vhost1/nginx.html
curl -I -H "Accept-Encoding: gzip, deflate" "http://www.ruopu.com/images/morning.jpg"
#如果对访问的内容进行了压缩，在结果中会有Content-Encoding: gzip的字样。
```

