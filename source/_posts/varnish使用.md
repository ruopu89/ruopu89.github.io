---
title: varnish使用
date: 2019-06-20 10:16:40
tags: varnish
categories: 缓存服务
---

### 测试

#### 安装

```shell
yum install epel-release
yum install -y varnish 
yum install -y varnish-docs.x86_64
```



#### 配置

```shell
vim /etc/sysconfig/varnish:
NFILES=131072        # 所能够打开的最大文件数
MEMLOCK=82000       # 用多大内存空间保存日志信息
NPROCS="unlimited"
DAEMON_COREFILE_LIMIT="unlimited"    # 进程核心转储所使用的内存空间，unlimited表示无上限
RELOAD_VCL=1        # 重新启动服务时是否重新读取VCL并重新编译的
VARNISH_VCL_CONF=/etc/varnish/config/default.vcl        # 默认读取的VCL文件
VARNISH_LISTEN_PORT=6081        # 监听的端口，默认监听6081
VARNISH_ADMIN_LISTEN_ADDRESS=127.0.0.1        # 管理接口监听的地址
VARNISH_ADMIN_LISTEN_PORT=6082        # 管理接口监听的端口
VARNISH_SECRET_FILE=/etc/varnish/secret        # 使用的密钥文件
VARNISH_MIN_THREADS=50        # 最少线程数
VARNISH_MAX_THREADS=1000        # 最大线程数
VARNISH_THREAD_TIMEOUT=120        # 线程的超时时间
VARNISH_STORAGE_SIZE=2046M        # 存储文件的大小
VARNISH_STORAGE="malloc,${VARNISH_STORAGE_SIZE}"        # 存储的文件格式
# file：单个文件，不支持持久机制
# malloc：内存
# persistent：基于文件的持久存储
VARNISH_TTL=120       # 联系后端服务器的超时时间
DAEMON_OPTS="-a ${VARNISH_LISTEN_ADDRESS}:${VARNISH_LISTEN_PORT} \
             -f ${VARNISH_VCL_CONF} \
             -T ${VARNISH_ADMIN_LISTEN_ADDRESS}:${VARNISH_ADMIN_LISTEN_PORT} \
             -t ${VARNISH_TTL} \
             -p thread_pool_min=${VARNISH_MIN_THREADS} \
             -p thread_pool_max=${VARNISH_MAX_THREADS} \
             -p thread_pool_timeout=${VARNISH_THREAD_TIMEOUT} \
             -u varnish -g varnish \
             -S ${VARNISH_SECRET_FILE} \
             -s ${VARNISH_STORAGE}"       # 使用定义的各高级配置的参数
```



#### vcl文件

```shell
vim /etc/varnish/default.vcl
vcl 4.0;

backend default {
    .host = "192.168.1.109";		# 后端服务器地址
    .port = "80";		# 后端服务器端口
}
# 目前只测试varnish是否可以正常工作，尚未定义缓存属性信息
systemctl start varnish
```



#### 安装配置web服务

```shell
yum install -y httpd php php-mysql
vim /var/www/html/index.html
<h1>www.abc.com and varnish of backend</h1>
<h2>node1.abc.com</h2>
systemctl start httpd
访问IP:80
访问IP:6081
```



#### 设置响应是否命中

```shell
vim default.vcl
sub vcl_deliver {
    if (obj.hits > 0){
        set resp.http.X-Cache = "HIT from";
        # 判断如果命中了就在http响应首部设置X-Cache为HIT
    }else{
        set resp.http.X-Cache = "MISS";
        # 否则就在http响应首部设置X-Cache为MISS
}
# 这里的语法是if(条件){方法}else{方法}，如果满足if后面小括号中的条件，就执行小括号后面大括号中的方法，否则执行else后面大括号中的方法。
varnishadm -S /etc/varnish/secret -T 127.0.0.1:6082
# 连接varnish，进入varnish的命令操作
vcl.load test1 /etc/varnish/default.vcl
# 在命令行中输入上面命令，加载default.vcl文件，test1是自定义的名称，这应该是一个策略的名称，策略的名称每次都不能一样。
vcl.list
vcl.show test1
# 查看test1的策略内容
访问IP:6081，之后按F12查看是否有X-Cache一项，如果没有此项，可以重启一下varnish。之后可以看到X-Cache一项为MISS，再次刷新后，此项变为HIT。
```



#### 指定某些文件不能查缓存

```shell
vim default.vcl
vcl 4.0;

# Default backend definition. Set this to point to your content server.
backend default {
    .host = "192.168.1.109";
    .port = "80";
}

sub vcl_recv {
 if (req.url ~ "test.html"){
   return(pass);
 }
# return(lookup);
}
# 这里不可以加return(lookup)，因为varnish4中使用return(hash)代替了return(lookup)。
vcl.load test2 /etc/varnish/default.vcl
# 加载策略
访问IP:6081/test.html，无论如何刷新，F12中的x-cache都是MISS
```



#### vcl配置文件

##### VCL中内置预设变量

```shell
req：The request object，请求到达时可用的变量(客户端发送的请求对象)
bereq：The backend request object，向后端主机请求时可用的变量
beresp：The backend response object，从后端主机获取内容时可用的变量(后端响应请求对象)
resp：The HTTP response object，对客户端响应时可用的变量(返回给客户端的响应对象)
obj：存储在内存中时对象属性相关的可用的变量(高速缓存对象，缓存后端响应请求内容)


预设变量是系统固定的，请求进入对应的vcl子程序后便生成，这些变量可以方便子程序提取，当然也可以自定义一些全局变量。
当前时间：
now :作用：返回当前时间戳。


客户端：（客户端基本信息）
client.ip：返回客户端IP地址。
注：原client.port已经弃用，如果要取客户端请求端口号使用 std.port(client.ip)，需要import std;才可以使用std
client.identity：用于装载客户端标识码。


服务器：（服务器基本信息）
注：原server.port已经弃用，如果要取服务器端口号使用 std.port(server.ip)，需要import std;才可以使用std
server.hostname：服务器主机名。
server.identity：服务器身份标识。
server.ip：返回服务器端IP地址。


req :（客户端发送的请求对象）
req：整个HTTP请求数据结构
req.backend_hint：指定请求后端节点，设置后 bereq.backend 才能获取后端节点配置数据
req.can_gzip：客户端是否接受GZIP传输编码。
req.hash_always_miss：是否强制不命中高速缓存，如果设置为true，则高速缓存不会命中，一直会从后端获取新数据。
req.hash_ignore_busy：忽略缓存中忙碌的对象，多台缓存时可以避免死锁。
req.http：对应请求HTTP的header。
req.method：请求类型（如 GET , POST）。
req.proto：客户端使用的HTTP协议版本。
req.restarts：重新启动次数。默认最大值是4
req.ttl：缓存有剩余时间。
req.url：请求的URL。
req.xid：唯一ID。


bereq：（发送到后端的请求对象，基于req对象）
bereq：整个后端请求后数据结构。
bereq.backend：所请求后端节点配置。
bereq.between_bytes_timeout：从后端每接收一个字节之间的等待时间（秒）。
bereq.connect_timeout：连接后端等待时间（秒），最大等待时间。
bereq.first_byte_timeout：等待后端第一个字节时间（秒），最大等待时间。
bereq.http：对应发送到后端HTTP的header信息。
bereq.method：发送到后端的请求类型（如：GET , POST）。
bereq.proto：发送到后端的请求的HTTP版本。
bereq.retries：相同请求重试计数。
bereq.uncacheable：无缓存这个请求。
bereq.url：发送到后端请求的URL。
bereq.xid：请求唯一ID。


beresp：（后端响应请求对象）
beresp：整个后端响应HTTP数据结构。
beresp.backend.ip：后端响应的IP。
beresp.backend.name：响应后端配置节点的name。
beresp.do_gunzip：默认为 false 。缓存前解压该对象
beresp.do_gzip：默认为 false 。缓存前压缩该对象
beresp.grace：设置当前对象缓存过期后可额外宽限时间，用于特殊请求加大缓存时间，当并发量巨大时，不易设置过大否则会堵塞缓存，一般可设置 1m 左右，当beresp.ttl=0s时该值无效。
beresp.http：对应的HTTP请求header
beresp.keep：对象缓存后带保持时间
beresp.proto：响应的HTTP版本
beresp.reason：由服务器返回的HTTP状态信息
beresp.status：由服务器返回的状态码
beresp.storage_hint：指定保存的特定存储器
beresp.ttl：该对象缓存的剩余时间，指定统一缓存剩余时间。
beresp.uncacheable：继承bereq.uncacheable，是否不缓存


OBJ ：（高速缓存对象，缓存后端响应请求内容）
obj.grace：该对象额外宽限时间
obj.hits：缓存命中次数，计数器从1开始，当对象缓存该值为1，一般可以用于判断是否有缓存，当前该值大于0时则为有缓存。
obj.http：对应HTTP的header
obj.proto：HTTP版本
obj.reason：服务器返回的HTTP状态信息
obj.status：服务器返回的状态码
obj.ttl：该对象缓存剩余时间（秒）
obj.uncacheable：不缓存对象


resp :（返回给客户端的响应对象）
resp：整个响应HTTP数据结构。
resp.http：对应HTTP的header。
resp.proto：编辑响应的HTTP协议版本。
resp.reason：将要返回的HTTP状态信息。
resq.status：将要返回的HTTP状态码。


存储 ：
storage.<name>.free_space：存储可用空间（字节数）。
storage.<name>.used_space：存储已经使用空间（字节数）。
storage.<name>.happy：存储健康状态。
```



##### 特定功能性语句

```shell
ban(expression)：清除指定对象缓存
call(subroutine)：调用子程序，如：call(name);
hash_data(input)：生成hash键，用于制定hash键值生成结构，只能在vcl_hash子程序中使用。调用hash_data(input) 后，即这个hash为当前页面的缓存hash键值，无需其它获取或操作，如:
=======================================================================================
sub vcl_hash{
       hash_data(client.ip);
       return(lookup);
}
=======================================================================================
注意：return(lookup);是默认返回值，所以可以不写。
new()：创建一个vcl对象，只能在vcl_init子程序中使用。
return()：结束当前子程序，并指定继续下一步动作，如：return (ok); 每个子程序可指定的动作均有不同。
rollback()：恢复HTTP头到原来状态，已经弃用，使用 std.rollback() 代替。
synthetic(STRING)：合成器，用于自定义一个响应内容，比如当请求出错时，可以返回自定义 404 内容，而不只是默认头信息，只能在 vcl_synth 与 vcl_backend_error 子程序中使用，如：
=======================================================================================
sub vcl_synth {
    //自定义内容
    synthetic ({"
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html lang="zh-cn">
   <head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
      <title>error</title>
   </head>
   <body>
      <h1>Error</h1>
      <h3>这只是一个测试自定义响应异常内容</h3>
   </body>
</html>
    "});
    //只交付自定义内容
    return(deliver);
=======================================================================================
regsub(str, regex, sub)：使用正则替换第一次出现的字符串，第一个参数为待处理字符串，第二个参数为正则表达式，第三个为替换为字符串。
regsuball(str, regex, sub)：使用正则替换所有匹配字符串。参数与regsuball相同。
具体变量详见：
https://www.varnish-cache.org/docs/4.0/reference/vcl.html#reference-vcl
```



##### return 语句

```shell
return 语句是终止子程序并返回动作，所有动作都根据不同的vcl子程序限定来选用。
https://www.varnish-cache.org/docs/4.0/users-guide/vcl-built-in-subs.html

语法：return(action);
常用的动作：
abandon  放弃处理，并生成一个错误。
deliver  交付处理
fetch  从后端取出响应对象
hash  哈希缓存处理
lookup 查找缓存对象
ok 继续执行
pass  进入pass非缓存模式
pipe 进入pipe非缓存模式
purge 清除缓存对象，构建响应
restart 重新开始
retry 重试后端处理
synth(status code,reason) 合成返回客户端状态信息
```



##### varnish中内置子程序

```shell
注意：varnish内置子程序均有自己限定的返回动作  return （动作）;  不同的动作将调用对应下一个子程序。

vcl_recv子程序：
开始处理请求，通过 return (动作); 选择varnish处理模式，默认进入hash缓存模式（即return(hash);），缓存时间为配置项default_ttl（默认为 120秒）过期保持时间default_grace（默认为10秒）。该子程序一般用于模式选择，请求对象缓存及信息修改，后端节点修改，终止请求等操作。
可操作对象：（部分或全部值）
读：client，server，req，storage
写：client，req
返回值：
synth(status code,reason);  定义响应内容。
pass  进入pass模式，并进入vcl_pass子程序。
pipe  进入pipe模式，并进入vcl_pipe子程序。
hash  进入hash缓存模式，并进入vcl_hash子程序，默认返回值。
purge  清除缓存等数据，子程序先从vcl_hash再到vcl_purge。

vcl_pipe子程序：
pipe模式处理，该模式主要用于直接取后端响应内容返回客户端，可定义响应内容返回客户端。该子程序一般用于需要及时且不作处理的后端信息，取出后端响应内容后直接交付到客户端不进入vcl_deliver子程序处理。
可操作对象：（部分或全部值）
读：client，server，bereq，req，storage
写：client，bereq，req
返回值：
synth(status code,reason);  定义响应内容。
pipe  继续pipe模式，进入后端vcl_backend_fetch子程序，默认返回值。

vcl_pass子程序：
pass模式处理，该模式类似hash缓存模式，仅不做缓存处理。
可操作对象：（部分或全部值）
读：client，server，req，storage
写：client，req
返回值：
synth(status code,reason);  定义响应内容。
fetch  继续pass模式，进入后端vcl_backend_fetch子程序，默认返回值。

vcl_hit子程序：
hash缓存模式时，存在hash缓存时调用，用于缓存处理，可放弃或修改缓存。
可操作对象：（部分或全部值）
读：client，server，obj，req，storage
写：client，req
返回值：
restart 重启请求。
deliver 交付缓存内容，进入vcl_deliver子程序处理，默认返回值。
synth(status code,reason);  定义响应内容。

vcl_miss子程序：
hash缓存模式时，不存在hash缓存时调用，用于判断性的选择进入后端取响应内容，可以修改为pass模式。
可操作对象：（部分或全部值）
读：client，server，req，storage
写：client，req
返回值：
restart 重启请求。
synth(status code,reason);  定义响应内容。
pass 切换到pass模式，进入vcl_pass子程序。
fetch  正常取后端内容再缓存，进入vcl_backend_fetch子程序，默认返回值。

vcl_hash子程序：
hash缓存模式，生成hash值作为缓存查找键名提取缓存内容，主要用于缓存hash键值处理，可使用hash_data(string)指定键值组成结构，可在同一个页面通过IP或cookie生成不同的缓存键值。
可操作对象：（部分或全部值）
读：client，server，req，storage
写：client，req
返回值：
lookup 查找缓存对象，存在缓存进入vcl_hit子程序，不存在缓存进入vcl_miss子程序，当使用了purge清理模式时会进入vcl_purge子程序，默认返回值。

vcl_purge子程序：
清理模式，当查找到对应的缓存时清除并调用，用于请求方法清除缓存，并报告.
可操作对象：（部分或全部值）
读：client，server，req，storage
写：client，req
返回值：
synth(status code,reason);  定义响应内容。
restart 重启请求。

vcl_deliver子程序：
客户端交付子程序，在vcl_backend_response子程序后调用（非pipe模式），或vcl_hit子程序后调用，可用于追加响应头信息，cookie等内容。
可操作对象：（部分或全部值）
读：client，server，req，resp，obj，storage
写：client，req，resp
返回值：
deliver 正常交付后端或缓存响应内容，默认返回值。
restart 重启请求。

vcl_backend_fetch子程序：
发送后端请求之前调用，可用于改变请求地址或其它信息，或放弃请求。
可操作对象：（部分或全部值）
读：server，bereq，storage
写：bereq
返回值：
fetch 正常发送请求到到后端取出响应内容，进入vcl_backend_response子程序，默认返回值。
abandon 放弃后端请求，并生成一个错误，进入vcl_backend_error子程序。

vcl_backend_response子程序：
后端响应后调用，可用于修改缓存时间及缓存相关信息。
可操作对象：（部分或全部值）
读：server，bereq，beresp，storage
写：bereq，beresp
返回值：
deliver 正常交付后端响应内容，进入vcl_deliver子程序，默认返回值。
abandon 放弃后端请求，并生成一个错误，进入vcl_backend_error子程序。
retry 重试后端请求，重试计数器加1，当超过配置中max_retries值时会报错并进入vcl_backend_error子程序。

vcl_backend_error子程序：
后端处理失败调用，异常页面展示效果处理，可自定义错误响应内容，或修改beresp.status与beresp.http.Location重定向等。
可操作对象：（部分或全部值）
读：server，bereq，beresp，storage
写：bereq，beresp
返回值：
deliver 只交付 sysnthetic(string) 自定义内容，默认返回后端异常标准错误内容。
retry 重试后端请求，重试计数器加1，当超过配置中max_retries值时会报错并进入vcl_backend_error子程序。

vcl_synth子程序：
自定义响应内容。可以通过synthetic（）和返回值 synth调用，这里可以自定义异常显示内容，也可以修改resp.status与resp.http.Location重定向。
可操作对象：（部分或全部值）
读：client，server，req，resp，storage
写：req，resp
返回值：
deliver 只交付 sysnthetic(string) 自定义内容，默认返回 sysnth 异常指定状态码与错误内容。
restart 重启请求。

vcl_init子程序：
加载vcl时最先调用，用于初始化VMODs，该子程序不参与请求处理，仅在vcl加载时调用一次。
可操作对象：（部分或全部值）
读：server
写：无
返回值：
ok 正常返回，进入vcl_recv子程序，默认返回值。

vcl_fini子程序：
卸载当前vcl配置时调用，用于清理VMODs，该子程序不参与请求处理，仅在vcl正常丢弃后调用。
可操作对象：（部分或全部值）
读：server
写：无
返回值：
ok 正常返回，本次vcl将释放，默认返回值。
```

varnish子程序调用流程图，通过大部分子程序的return返回值进入下一步行动：

![](/images/varnish/varnish子程序return返回值.png)

##### 优雅模式(Garce mode)

Varnish中的请求合并

当几个客户端请求同一个页面的时候，varnish只发送一个请求到后端服务器，然后让其他几个请求挂起并等待返回结果；获得结果后，其它请求再复制后端的结果发送给客户端；

但如果同时有数以千计的请求，那么这个等待队列将变得庞大，这将导致2类潜在问题：

惊群问题(thundering herd problem)，即突然释放大量的线程去复制后端返回的结果，将导致负载急速上升；没有用户喜欢等待；

为了解决这类问题，可以配置varnish在缓存对象因超时失效后再保留一段时间，以给那些等待的请求返回过去的文件内容(stale content)，配置案例如下：

```shell
sub vcl_recv {
if (! req.backend.healthy) {
set req.grace = 5m;
} else {
set req.grace = 15s;
}
}
sub vcl_fetch {
set beresp.grace = 30m;
}
```

以上配置表示varnish将会将失效的缓存对象再多保留30分钟，此值等于最大的req.grace值即可；

而根据后端主机的健康状况，varnish可向前端请求分别提供5分钟内或15秒内的过期内容



##### 后端服务器地址池配置及后端服务器健康检查

###### 后端服务器定义

```shell
命令：backend。这个定义为最基本的反向入口定义，用于varnish连接对应的服务器，如果没有定义或定义错误则用户无法访问正常页面。
语法格式：
backend name{
    .attribute = "value";
}
说明：backend 是定义后端关键字，name 是当前后端节点的别名，多个后端节点时，name 名不能重复，否则覆盖。花括号里面定义当前节点相关的属性（键=值）。除默认节点外其它节点定义后必需有调用，否则varnish无法启动。后端是否正常可以通过std.healthy(backend)判断。

支持运算符:
=   （赋值运算）
==  （相等比较）
~    （匹配，可以使用正则表达式，或访问控制列表）
!~    （不匹配，可以使用正则表达式，或访问控制列表）
！  （非）
&&   （逻辑与）
||   （逻辑或）

属性列表：
.host="xxx.xxx.xxx.xxx";      //要转向主机（即后端主机）的IP或域名，必填键/值对。
.port="8080";        //主机连接端口号或协议名（HTTP等），默认80
.host_header='';    //请示主机头追加内容
.connect_timeout=1s;     //连接后端的超时时间
.first_byte_timeout=5s;    //等待从后端返回的第一个字节时间
.between_bytes_timeout=2s;     //每接收一个字节之间等待时间
.probe=probe_name;        //监控后端主机的状态,指定外部监控name或者内部直接添加
.max_connections=200;    //设置最大并发连接数，超过这个数后连接就会失败

例：（下面两个例子结果是一样的，但第二个例子中更适用于集群，可以方便批量修改）
backend web{
    .host="192.168.197.180";
    .port="80";
    .probe={          //直接追加监控块.probe是一个的参数
        .url="/";
        .timeout=2s;
    }
}
或
probe web_probe{   //监控必需定义在前面，否则后端调用找不到监控块。
    .url="/";
    .timeout=2s;
}
 
backend web{
    .host="192.168.197.180";
    .port="80";
    .probe=web_probe;   //调用外部共用监控块
}
```



###### 监视器定义

```shell
命令：probe 。监控可以循环访问指定的地址，通过响应时间判定服务器是否空闲或正常。这类命令非常适用于集群中某些节点服务器崩溃或负载过重，而禁止访问这台节点服务器。
语法格式：
probe name{
    .attribute = "value";
}
说明：probe 是定义监控关键字，name 是当前监控点的别名，多个监控节点时，name 名不能重复，否则覆盖。花括号里面定义当前节点相关的属性（键=值）。
没有必填属性，因为默认值就可以正常执行操作。

属性列表：
.url="/";    //指定监控入口URL地址，默认为"/"
.request="";   //指定监控请求入口地址，比 .url 优先级高。
.expected_response="200";   //请求响应代码，默认是 200
.timeout=2s;   //请求超时时间。
.interval=5s;     //每次轮询请求间隔时间,默认为 5s 。
.initial=-1;     //初始启动时以.window轮询次数中几次良好后续才能使用这个后端服务器节点，默认为 -1 ，则轮询完 .window 所有次数良好判定为正常。
.window=8;   //指定多少轮询次数，用于判定服务器正常，默认是 8。
.threshold=3;   //必须多少次轮询正常才算该后端节点服务器正常,默认是 3。

例：创建健康监测，定义健康检查名称为backend_healthcheck
probe backend_healthcheck {
        .url = "/";
        .timeout = 1s;
        .interval = 5s;
        .window = 5;
        .threshold = 3;
    }
在上面的例子中varnish将每5s检测后端，超时设为1s。每个检测将会发送get /的请求。如果5个检测中大于3个是成功，varnish就认为后端是健康的，反之，后端就有问题了。
```



###### 集群负载均衡directors

```shell
varnish可以定义多个后端，也可以将几个后端放在一个后端集群里面已达到负载均衡的目的。
你也可以将几个后端组成一组后端。这个组被叫做Directors。可以提高性能和弹性。
directors是varnish负载均衡模块，使用前必需引入directors模块，directors模块主要包含：
round_robin，random，hash，fallback负载均衡模式。
round_robin : 循环依次逐个选择后端服务器。
random ： 随机选择后端服务器，可设置每个后端权重增加随机率。
hash :  通过散列随机选择对应的后端服务器且保持选择对应关系，下次则直接找对应的后端服务器。
Fallback:后备
注意：random，hash有权重值设置，用于提高随机率。每个后端最好都配置监控器（后端服务器正常监测）以便directors自动屏蔽不正常后端而不进入均衡列队中。
这些操作需要你载入VMOD（varnish module），然后在vcl_init中调用这个VMOD。

import directors;                # load the directors
backend web1 {
.host = "192.168.197.175";
.port = "80";
.probe = backend_healthcheck;
}
backend web2 {
.host = "192.168.197.176";
.port = "80";
.probe = backend_healthcheck;
}
//初始化处理
sub vcl_init {            //调用vcl_init初始化子程序创建后端主机组，即directors
    new  web_cluster = directors.round_robin(); //使用new关键字创建drector对象,使用round_robin算法
    web_cluster.add_backend(web1);   //添加后端服务器节点
web_cluster.add_backend(web2);
}
//开始处理请求
sub vcl_recv {                     //调用vcl_recv子程序，用于接收和处理请求
    set  req.backend_hint = web_cluster.backend();     //选取后端
}
说明：
set命令是设置变量
unset命令是删除变量
web_cluster.add_backend( backend , real);  添加后端服务器节点，backend 为后端配置别名，real 为权重值，随机率计算公式：100 * (当前权重 / 总权重)。
req.backend_hint是varnish的预定义变量，作用是指定请求后端节点
vcl对象需要使用new关键字创建，所有可创建对象都是内定的，使用前必需import，所有new操作只能在vcl_init子程序中。

扩展：varnish将不同的url发送到不同的后端server
import directors;                # load the directors
backend web1 {
.host = "192.168.197.175";
.port = "80";
.probe = backend_healthcheck;
}
backend web2 {
.host = "192.168.197.176";
.port = "80";
.probe = backend_healthcheck;
}
backend img1 {
    .host = "img1.lnmmp.com";
    .port = "80";
    .probe = backend_healthcheck;
}
backend img2 {
    .host = "img2.lnmmp.com";
    .port = "80";
    .probe = backend_healthcheck;
}
//初始化处理
sub vcl_init {            //调用vcl_init初始化子程序创建后端主机组，即directors
    new  web_cluster = directors.round_robin(); //使用new关键字创建drector对象,使用round_robin算法
    web_cluster.add_backend(web1);   //添加后端服务器节点
web_cluster.add_backend(web2);
new img_cluster = directors.random();
img_cluster.add_backend(img1,2);   //添加后端服务器节点，并且设置权重值
img_cluster.add_backend(img2,5);
}
//根据不同的访问域名，分发至不同的后端主机组
sub vcl_recv {
if (req.http.host  ~  "(?i)^(www.)?benet.com$") { 
        set  req.http.host = "www.benet.com";
        set  req.backend_hint = web_cluster.backend();  //选取后端
    } elsif (req.http.host  ~  "(?i)^images.benet.com$") {
        set  req.backend_hint = img_cluster.backend();
    }
}
说明：中的i就是忽略大小写的意思。(?i)表示开启忽略大小写，而(?-i)表示关闭忽略大小写
```



###### 访问控制列表（ACL）

```shell
创建一个地址列表，用于后面的判断，可以是域名或IP集合。这个可以用于指定某些地址请求入口，防止恶意请求等。
语法格式：
acl  purgers  {
    "127.0.0.1";
"localhost";
“192.168.134.0/24”
    !"192.168.134.1";
}
说明：acl 是访问列表关键字（必需小写），name 是该列表的别名用于调用，花括号内部是地址集。
注意：如果列表中包含了无法解析的主机地址，它会匹配任何地址。
如果不想让它匹配可以在前添加一个 ! 符号，如上面 !"192.168.134.1"; 
使用ACL只需要用匹配运算符 ~ 或 !~  如：
sub  vcl_recv {
    if  (req.method == "PURGE") {    //PURGE请求的处理
         if  (client.ip  ~  purgers) {     
              return(purge);
         } else {
            return(synth(403, "Access denied."));
        }
    }
}
```



###### 缓存规则配置

```shell
sub vcl_recv {
  // PURGE请求的处理
  if (req.method == "PURGE") {
    if (!client.ip ~ purgers) {
      return (synth(405, "Not Allowed."));
    }
    return (purge);
  }


  set req.backend_hint = web.backend();


  //将php、asp等动态内容访问请求直接发给后端服务器，不缓存。
  if (req.url ~ "\.(php|asp|aspx|jsp|do|ashx|shtml)($|\?)") {
    return (pass);
  }
  //将非GET和HEAD访问请求直接发给后端服务器，不缓存。例如POST请求。
  if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
  }
  //如果varnish看到header中有'Authorization'头，它将pass请求。
  if (req.http.Authorization) {
        return (pass);
}


  //带cookie首部的GET请求也缓存
  if (req.url ~ "\.(css|js|html|htm|bmp|png|gif|jpg|jpeg|ico|gz|tgz|bz2|tbz|zip|rar|mp3|mp4|ogg|swf|flv)($|\?)") {
    unset req.http.cookie;
    return (hash);
  }
说明：默认情况，varnish不缓存从后端响应的http头中带有Set-Cookie的对象。如果客户端发送的请求带有Cookie header，varnish将忽略缓存，直接将请求传递到后端。
为发往后端主机的请求添加X-Forward-For首部,首次访问增加X-Forwarded-For 头信息,方便后端程序获取客户端ip，而不是varnish地址

if (req.restarts == 0) {
        if (req.http.x-forwarded-for) {//如果设置过此header则要再次附加上用逗号隔开
            set req.http.X-Forwarded-For = req.http.X-Forwarded-For + ", " + client.ip;
        } else {//如果只有一层代理的话,就无需设置了
            set req.http.X-Forwarded-For = client.ip;
        }
}
说明：X-Forwarded-For是用来识别通过HTTP代理或负载均衡方式连接到Web服务器的客户端最原始的IP地址的HTTP请求头字段
子程序：
子程序是一种类似C的函数，但是程序没有调用参数，子程序以 sub 关键字定义。在VCL里子程序是用于管理程序。
注意：所有VCL内置的程序都是以 vcl_ 开头，并已经预置好，在VCL文件中只要声明对应的内置子程序，都会在对应的流程中调用。
```



##### 示例

```shell
vcl 4.0;		# 使用varnish版本4的格式.
import std;		# 标准日志需要加载此模块
import directors;		# 加载后端轮询模块，为了可以使用下面的vcl_init
# import表示加载varnish模块(VMODs)
backend server1 { # Define one backend。定义后端主机，server1是自定义的后端主机名称
  .host = "10.129.14.4";    # Gateway on dl-gw-01
  .port = "8090";           # Port Apache or whatever is listening
  .max_connections = 30000; # That's it

  .probe = {
    #.url = "/"; # short easy way (GET /)
    # We prefer to only do a HEAD /
    .request =
      "HEAD / HTTP/1.1"
      "Host: localhost"
      "Connection: close"
      "User-Agent: Varnish Health Probe";

    .interval  = 5s; # check the health of each backend every 5 seconds
    .timeout   = 1s; # timing out after 1 second.
    .window    = 5;  # If 3 out of the last 5 polls succeeded the backend is considered healthy, otherwise it will be marked as sick
    .threshold = 3;
  }

  .first_byte_timeout     = 300s;   # How long to wait before we receive a first byte from our backend?
  .connect_timeout        = 5s;     # How long to wait for a backend connection?
  .between_bytes_timeout  = 2s;     # How long to wait between bytes received from our backend?
}

backend server2 { # Define one backend
  .host = "10.129.14.5";    #  Gateway on dl-gw-01
  .port = "8090";           # Port Apache or whatever is listening
  .max_connections = 30000; # That's it

  .probe = {
    #.url = "/"; # short easy way (GET /)
    # We prefer to only do a HEAD /
    .request =
      "HEAD / HTTP/1.1"
      "Host: localhost"
      "Connection: close"
      "User-Agent: Varnish Health Probe";

    .interval  = 5s; # check the health of each backend every 5 seconds
    .timeout   = 1s; # timing out after 1 second.
    .window    = 5;  # If 3 out of the last 5 polls succeeded the backend is considered healthy, otherwise it will be marked as sick
    .threshold = 3;
  }

  .first_byte_timeout     = 300s;   # How long to wait before we receive a first byte from our backend?
  .connect_timeout        = 5s;     # How long to wait for a backend connection?
  .between_bytes_timeout  = 2s;     # How long to wait between bytes received from our backend?
}


acl purge {		# 定义允许清理缓存的IP
  # ACL we'll use later to allow purges
  "localhost";
  "127.0.0.1";
  "::1";
}

sub vcl_init {		# 配置后端集群事件
  # Called when VCL is loaded, before any requests pass through it.
  # Typically used to initialize VMODs.
  # 后端集群有4种模式 random, round-robin, fallback, hash
  # random         随机
  # round-robin    轮询
  # fallback        后备
  # hash        固定后端 根据url(req.http.url) 或用户cookie(req.http.cookie) 或用户session(req.http.sticky)(这个还有其他要配合)
  new vdir = directors.round_robin();
  vdir.add_backend(server1);
  vdir.add_backend(server2);
  # vdir.add_backend(server...);
  # vdir.add_backend(servern);
}

sub vcl_recv {
  # Called at the beginning of a request, after the complete request has been received and parsed.
  # Its purpose is to decide whether or not to serve the request, how to do it, and, if applicable,
  # which backend to use.
  # also used to modify the request
  # 请求入口，这里一般用作路由处理，判断是否读取缓存和指定该请求使用哪个后端
  set req.backend_hint = vdir.backend(); # send all traffic to the vdir director

  # Normalize the header, remove the port (in case you're testing this on various TCP ports)
  set req.http.Host = regsub(req.http.Host, ":[0-9]+", "");

  # Remove the proxy header (see https://httpoxy.org/#mitigate-varnish)
  unset req.http.proxy;

  # Normalize the query arguments
  set req.url = std.querysort(req.url);

  # Allow purging
  if (req.method == "PURGE") {
    if (!client.ip ~ purge) { # purge is the ACL defined at the begining
      # Not from an allowed IP? Then die with an error.
      return (synth(405, "This IP is not allowed to send PURGE requests."));
    }
    # If you got this stage (and didn't error out above), purge the cached result
    return (purge);
  }
# 如果不是指定IP执行PURGE方法会报错，否则就执行
  # Only deal with "normal" types
  if (req.method != "GET" &&
      req.method != "HEAD" &&
      req.method != "PUT" &&
      req.method != "POST" &&
      req.method != "TRACE" &&
      req.method != "OPTIONS" &&
      req.method != "PATCH" &&
      req.method != "DELETE") {
    /* Non-RFC2616 or CONNECT which is weird. */
    /*Why send the packet upstream, while the visitor is using a non-valid HTTP method? */
    return (synth(404, "Non-valid HTTP method!"));
  }
# 如果使用上面指定的方法就报错。
  # Only cache GET or HEAD requests. This makes sure the POST requests are always passed.
  if (req.method != "GET" && req.method != "HEAD") {
   return (pass);
  }

  if (req.url ~ "/aquapaas/rest/usertags/") 
		{ return (hash); }  
  # 如果请求的地址中包含/aquapaas/rest/usertags/，就缓存。
  return (pass);
}

# The data on which the hashing will take place
sub vcl_hash {
  # Called after vcl_recv to create a hash value for the request. This is used as a key
  # to look up the object in Varnish.

  hash_data(req.url);
 
  return (lookup);
}

# Handle the HTTP request coming from our backend
sub vcl_backend_response {
  # Called after the response headers has been successfully retrieved from the backend.

  # Sometimes, a 301 or 302 redirect formed via Apache's mod_rewrite can mess with the HTTP port that is being passed along.
  # This often happens with simple rewrite rules in a scenario where Varnish runs on :80 and Apache on :8080 on the same box.
  # A redirect can then often redirect the end-user to a URL on :8080, where it should be :80.
  # This may need finetuning on your setup.
  #
  # To prevent accidental replace, we only filter the 301/302 redirects for now.
  if (beresp.status == 301 || beresp.status == 302) {
    set beresp.http.Location = regsub(beresp.http.Location, ":[0-9]+", "");
  }

  # Don't cache 50x responses
  if (beresp.status == 500 || beresp.status == 502 || beresp.status == 503 || beresp.status == 504) {
    return (abandon);        # abandon  放弃处理，并生成一个错误。
  }

  # Set 2min cache if unset for static files
  # if (beresp.ttl <= 0s || beresp.http.Set-Cookie || beresp.http.Vary == "*") {
    # set beresp.ttl = 120s; # Important, you shouldn't rely on this, SET YOUR HEADERS in the backend
    # set beresp.uncacheable = true;
    # return (deliver);
  # }

  # Allow stale content, in case the backend goes down.
  # make Varnish keep all objects for 24000 hours beyond their TTL
  # set beresp.ttl = 5m;
  # set beresp.grace = 24000h;
  
  if ( beresp.status == 200 ) {
	#只有返回状态为200 OK的数据才考虑缓存。
	if (bereq.url ~ "/aquapaas/rest/usertags/") { 
		#AAA数据缓存30秒，过期后缓存0秒。
		set beresp.ttl = 30s;
		set beresp.grace = 0s;
		} 
 } else {
 #其余数据不缓存。
 set beresp.ttl = 0s;
 }
 
 return (deliver);
}

# The routine when we deliver the HTTP request to the user
# Last chance to modify headers that are sent to the client
sub vcl_deliver {
  # Called before a cached object is delivered to the client.

  if (obj.hits > 0) { # Add debug header to see if it's a HIT/MISS and the number of hits, disable when not needed
    set resp.http.X-Cache = "HIT";
  } else {
    set resp.http.X-Cache = "MISS";
  }

  # Please note that obj.hits behaviour changed in 4.0, now it counts per objecthead, not per object
  # and obj.hits may not be reset in some cases where bans are in use. See bug 1492 for details.
  # So take hits with a grain of salt
  set resp.http.X-Cache-Hits = obj.hits;

  # Remove some headers: PHP version
  unset resp.http.X-Powered-By;

  # Remove some headers: Apache version & OS
  unset resp.http.Server;
  unset resp.http.X-Drupal-Cache;
  unset resp.http.X-Varnish;
  unset resp.http.Via;
  unset resp.http.Link;
  unset resp.http.X-Generator;

  return (deliver);
}

sub vcl_purge {
  # Only handle actual PURGE HTTP methods, everything else is discarded
  if (req.method == "PURGE") {
    # restart request
    set req.http.X-Purge = "Yes";
    return (restart);
  }
}

sub vcl_synth {
  if (resp.status == 720) {
    # We use this special error status 720 to force redirects with 301 (permanent) redirects
    # To use this, call the following from anywhere in vcl_recv: return (synth(720, "http://host/new.html"));
    set resp.http.Location = resp.reason;
    set resp.status = 301;
    return (deliver);
  } elseif (resp.status == 721) {
    # And we use error status 721 to force redirects with a 302 (temporary) redirect
    # To use this, call the following from anywhere in vcl_recv: return (synth(720, "http://host/new.html"));
    set resp.http.Location = resp.reason;
    set resp.status = 302;
    return (deliver);
  }

  return (deliver);
}

sub vcl_hit {
  # Called when a cache lookup is successful.

  if (obj.ttl >= 0s) {
    # A pure unadultered hit, deliver it
    return (deliver);
  }

  # https://www.varnish-cache.org/docs/trunk/users-guide/vcl-grace.html
  # When several clients are requesting the same page Varnish will send one request to the backend and place the others on hold while fetching one copy from the backend. In some products this is called request coalescing and Varnish does this automatically.
  # If you are serving thousands of hits per second the queue of waiting requests can get huge. There are two potential problems - one is a thundering herd problem - suddenly releasing a thousand threads to serve content might send the load sky high. Secondly - nobody likes to wait. To deal with this we can instruct Varnish to keep the objects in cache beyond their TTL and to serve the waiting requests somewhat stale content.

# if (!std.healthy(req.backend_hint) && (obj.ttl + obj.grace > 0s)) {
#   return (deliver);
# } else {
#   return (miss);
# }

  # We have no fresh fish. Lets look at the stale ones.
  if (std.healthy(req.backend_hint)) {
    # Backend is healthy. Limit age to 10s.
    if (obj.ttl + 10s > 0s) {
      #set req.http.grace = "normal(limited)";
      return (deliver);
    } else {
      # No candidate for grace. Fetch a fresh object.
      return (fetch);
    }
  } else {
    # backend is sick - use full grace
      if (obj.ttl + obj.grace > 0s) {
      #set req.http.grace = "full";
      return (deliver);
    } else {
      # no graced object.
      return (fetch);
    }
  }

  # fetch & deliver once we get the result
  return (fetch); # Dead code, keep as a safeguard
}

sub vcl_miss {
  # Called after a cache lookup if the requested document was not found in the cache. Its purpose
  # is to decide whether or not to attempt to retrieve the document from the backend, and which
  # backend to use.

  return (fetch);
}

sub vcl_fini {
  # Called when VCL is discarded only after all requests have exited the VCL.
  # Typically used to clean up VMODs.

  return (ok);
}
```

