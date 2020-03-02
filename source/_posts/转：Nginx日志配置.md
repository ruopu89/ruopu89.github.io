---
title: 转：Nginx日志配置
date: 2020-02-09 21:38:00
tags: Nginx
categories: Nginx
---

## 超详细！Nginx 日志配置实践

地址：<https://mp.weixin.qq.com/s/MzLHXwyl8Upt4eI9IjrNBw>

**前言**

Nginx日志对于统计、系统服务排错很有用。

**Nginx日志主要分为两种：**access_log(访问日志)和error_log(错误日志)。通过访问日志我们可以得到用户的IP地址、浏览器的信息，请求的处理时间等信息。错误日志记录了访问出错的信息，可以帮助我们定位错误的原因。

**本文将详细描述一下如何配置Nginx日志。**

## **设置access_log**

访问日志主要记录客户端的请求。客户端向Nginx服务器发起的每一次请求都记录在这里。客户端IP，浏览器信息，referer，请求处理时间，请求URL等都可以在访问日志中得到。当然具体要记录哪些信息，你可以通过log_format指令定义。

### 语法

```
access_log path [format [buffer=size] [gzip[=level]] [flush=time] [if=condition]]; # 设置访问日志
access_log off; # 关闭访问日志
```

> - path 指定日志的存放位置。
> - format 指定日志的格式。默认使用预定义的combined。
> - buffer 用来指定日志写入时的缓存大小。默认是64k。
> - gzip 日志写入前先进行压缩。压缩率可以指定，从1到9数值越大压缩比越高，同时压缩的速度也越慢。默认是1。
> - flush 设置缓存的有效时间。如果超过flush指定的时间，缓存中的内容将被清空。
> - if 条件判断。如果指定的条件计算为0或空字符串，那么该请求不会写入日志。

另外，还有一个特殊的值off。如果指定了该值，当前作用域下的所有的请求日志都被关闭。

### 作用域

可以应用access_log指令的作用域分别有http，server，location，limit_except。也就是说，在这几个作用域外使用该指令，Nginx会报错。

以上是access_log指令的基本语法和参数的含义。下面我们看一几个例子加深一下理解。

### 基本用法

```
access_log /var/logs/nginx-access.log
```

该例子指定日志的写入路径为/var/logs/nginx-access.log，日志格式使用默认的combined。

```
access_log /var/logs/nginx-access.log buffer=32k gzip flush=1m
```

该例子指定日志的写入路径为/var/logs/nginx-access.log，日志格式使用默认的combined，指定日志的缓存大小为32k，日志写入前启用gzip进行压缩，压缩比使用默认值1，缓存数据有效时间为1分钟。

## **使用log_format自定义日志格式**

Nginx预定义了名为combined日志格式，如果没有明确指定日志格式默认使用该格式：

```
log_format combined '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
```

如果不想使用Nginx预定义的格式，可以通过log_format指令来自定义。

### 语法

```
log_format name [escape=default|json] string ...;
```

> - name 格式名称。在access_log指令中引用。
> - escape 设置变量中的字符编码方式是json还是default，默认是default。
> - string 要定义的日志格式内容。该参数可以有多个。参数中可以使用Nginx变量。

下面是log_format指令中常用的一些变量：

```
$bytes_sent
发送给客户端的总字节数

$body_bytes_sent
发送给客户端的字节数，不包括响应头的大小

$connection
连接序列号

$connection_requests
当前通过连接发出的请求数量

$msec
日志写入时间，单位为秒，精度是毫秒

$pipe
如果请求是通过http流水线发送，则其值为"p"，否则为“."

$request_length
请求长度（包括请求行，请求头和请求体）

$request_time
请求处理时长，单位为秒，精度为毫秒，从读入客户端的第一个字节开始，直到把最后一个字符发送张客户端进行日志写入为止

$status
响应状态码

$time_iso8601
标准格式的本地时间,形如“2017-05-24T18:31:27+08:00”

$time_local
通用日志格式下的本地时间，如"24/May/2017:18:31:27 +0800"

$http_referer
请求的referer地址。

$http_user_agent
客户端浏览器信息。

$remote_addr
客户端IP

$http_x_forwarded_for
当前端有代理服务器时，设置web节点记录客户端地址的配置，此参数生效的前提是代理服务器也要进行相关的x_forwarded_for设置。

$request
完整的原始请求行，如 "GET / HTTP/1.1"

$remote_user
客户端用户名称，针对启用了用户认证的请求

$request_uri
完整的请求地址，如 "https://daojia.com/"
```

下面演示一下自定义日志格式的使用：

```
access_log /var/logs/nginx-access.log main
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';
```

我们使用log_format指令定义了一个main的格式，并在access_log指令中引用了它。假如客户端有发起请求：https://suyunfe.com/，我们看一下我截取的一个请求的日志记录:

```
112.195.209.90 - - [20/Feb/2018:12:12:14 +0800] 
"GET / HTTP/1.1" 200 190 "-" "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) 
AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Mobile Safari/537.36" "-"
```

我们看到最终的日志记录中`$remote_user`、`$http_referer`、`$http_x_forwarded_for`都对应了一个`-`，这是因为这几个变量为空。

## **设置error_log**

错误日志在Nginx中是通过error_log指令实现的。该指令记录服务器和请求处理过程中的错误信息。

### 语法

配置错误日志文件的路径和日志级别。

```
error_log file [level];
Default:    
error_log logs/error.log error;
```

第一个参数指定日志的写入位置。

第二个参数指定日志的级别。level可以是debug, info, notice, warn, error, crit, alert,emerg中的任意值。可以看到其取值范围是按紧急程度从低到高排列的。只有日志的错误级别等于或高于level指定的值才会写入错误日志中。默认值是error。

### 基本用法

```
error_log /var/logs/nginx/nginx-error.log
```

它可以配置在：main， http, mail, stream, server, location作用域。

例子中指定了错误日志的路径为：`/var/logs/nginx/nginx-error.log`，日志级别使用默认的error。

## **open_log_file_cache**

每一条日志记录的写入都是先打开文件再写入记录，然后关闭日志文件。如果你的日志文件路径中使用了变量，如`access_log /var/logs/$host/nginx-access.log`，为提高性能，可以使用open_log_file_cache指令设置日志文件描述符的缓存。

### 语法

```
open_log_file_cache max=N [inactive=time] [min_uses=N] [valid=time];
```

> - max 设置缓存中最多容纳的文件描述符数量，如果被占满，采用LRU算法将描述符关闭。
> - inactive 设置缓存存活时间，默认是10s。
> - min_uses 在inactive时间段内，日志文件最少使用几次，该日志文件描述符记入缓存，默认是1次。
> - valid：设置多久对日志文件名进行检查，看是否发生变化，默认是60s。
> - off：不使用缓存。默认为off。

### 基本用法

```
open_log_file_cache max=1000 inactive=20s valid=1m min_uses=2;
```

它可以配置在http、server、location作用域中。

例子中，设置缓存最多缓存1000个日志文件描述符，20s内如果缓存中的日志文件描述符至少被被访问2次，才不会被缓存关闭。每隔1分钟检查缓存中的文件描述符的文件名是否还存在。

## **总结**

Nginx中通过access_log和error_log指令配置访问日志和错误日志，通过log_format我们可以自定义日志格式。如果日志文件路径中使用了变量，我们可以通过open_log_file_cache指令来设置缓存，提升性能。

另外，在access_log和log_format中使用了很多变量，这些变量没有一一列举出来，详细的变量信息可以参考Nginx官方文档：http://nginx.org/en/docs/varindex.html

> 作者：antwang
>
> juejin.im/post/5aa09bb3f265da238f121b6c