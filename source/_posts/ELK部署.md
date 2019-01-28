---
title: ELK部署
date: 2019-01-25 09:04:32
tags: 日志收集
categories: ELK
---

### elk概念
> ELK又称为ELK Stack,是 Elasticsearch、Logstash、Kibana 三个开源软件的组合,每个完成不同的功能，官方网站 www.elastic.co



#### elasticsearch概念

> Elasticsearch 可实现数据的实时全文搜索、支持分布式可实现高可用、提供
> API接口，可以处理大规模日志数据，比如Nginx、Tomcat、系统日志等。



#### logstash概念

> Logstash:通过插件实现日志收集，支持日志过滤，支持普通log、自定义json格式的日志解析。



##### logstash格式

> input {} #input 插件收集日志
>
> output {} #output 插件输出日志



#### kibana概念

> kibana：kibana主要是调用elasticsearch的数据，并进行前端数据可视化的展现。



### elk部署

#### elk简单部署

```shell
==============================================================================================
收集单个日志
==============================================================================================

准备三台主机，做els集群，配置：双核处理器，2G内存。地址：192.168.1.20，192.168.1.21，192.168.1.22
准备一台主机，安装nginx，地址：192.168.1.30
准备一台主机，安装kibana，地址：192.168.1.23

systemctl stop firewalld
systemctl disable firewalld
sed -i ‘/SELINUX/s/enforcing/disabled/’ /etc/selinux/config
# 关闭三台主机的防火墙和SELinux
ulimit -n
# 查看打开文件最大数
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
# 调整打开文件最大数
ulimit -n 65535
# 临时调整打开文件最大数
systemctl start chronyd
systemctl enable chronyd
chronyc
chronyc> waitsync
# 同步三台主机时间
yum install jdk-8u201-linux-x64.rpm -y
# 安装jdk
vim /etc/profile.d/java.sh
    export JAVA_HOME=/usr
. /etc/profile.d/java.sh
# 设置java家目录并加载
yum install -y elasticsearch-6.5.4.rpm
# 三台主机均安装els
vim /etc/elasticsearch/elasticsearch.yml
    cluster.name: testelk
    # 集群的名称，名称相同的主机就是处于同一个集群
    node.name: node1
    # 集群情况下，当前node的名字，每个node应该不一样
    path.data: /elkdata/data
    # 数据目录
    path.logs: /elkdata/logs
    # 日志目录
    # bootstrap.memory_lock: true
    # 服务启动时即锁定足够大的内存，提高效率。测试中如果打开此项，启动会失败，提示内存未锁定
    network.host: 0.0.0.0
    # 监听的地址
    http.port: 9200
    # 客户端访问端口
    discovery.zen.ping.unicast.hosts: ["192.168.1.20", "192.168.1.21", "192.168.1.22"]
    # 组播范围
    discovery.zen.minimum_master_nodes: 2
    # 设置此项为了必免脑裂，这里的数字是总节点数除以2加1算出来的。
vim /etc/elasticsearch/jvm.options
    -Xms3g  # 初始化的堆内存
    -Xmx3g  # 最大堆内存，可以改大此值。这两个值要保持一致。或将上面配置文件中的bootstrap.memory_lock的值改为false
mkdir /elkdata/{data,logs} -pv
# 创建数据和日志目录
chown elasticsearch.elasticsearch /elkdata/ -R
systemctl start elasticsearch
systemctl enable elasticsearch
# 启动并查看状态
==============================================================================================
Master的职责：
1. 节点状态信息
2. 集群状态信息
3. 创建索引
4. 删除索引
5. 分片管理
6. 关闭节点
Slave节点的职责：
1. 同步数据
2. 等待机会成为master
==============================================================================================
* node1上安装elasticsearch-head插件
git clone git://github.com/mobz/elasticsearch-head.git
# 下载elasticsearch-head插件，这个插件是为了实现简单的集群监控、主机信息显示和管理等功能
yum install -y epel-release
yum install npm -y
cd elasticsearch-head/
npm install grunt -save
npm install
npm run start &
vim /etc/elasticsearch/elasticsearch.yml
    #---------------------------------- http ---------------------------------------
    http.cors.enabled: true     # 打开http功能
    http.cors.allow-origin: "*"     # 允许谁访问
# 配置elasticsearch允许远程访问
systemctl restart elasticsearch

* nginx
yum install -y gcc gcc-c++ automake pcre pcre-devel zlib zlib-devel openssl openssl-devel
tar xf nginx-1.12.2.tar.gz
cd nginx-1.12.2/
./configure --prefix=/usr/local/nginx
make && make install
cd /usr/local/nginx/
mkdir html/test
echo "nginx test page" >> html/test/index.html
vim conf/nginx.conf
    server {
        location /test {
           root html;
           index index.html index.htm;
        }
    }
/usr/local/nginx/sbin/nginx -t
/usr/local/nginx/sbin/nginx
# 启动
访问http://192.168.1.30/test/测试
==============================================================================================
# 下面在nginx主机上安装logstash
==============================================================================================
yum -y install jdk-8u201-linux-x64.rpm
yum -y install logstash-6.5.4.rpm
/usr/share/logstash/bin/logstash -e "input{stdin{}} output{stdout{ codec => "rydebug"}}"
    hello
    {
        "@timestamp" => 2019-01-24T08:47:22.515Z,
        "message" => "hello",
            "host" => "nginx1",
        "@version" => "1"
    }
# 测试
vim /etc/logstash/conf.d/system.conf
    input {
        file{
            type => "messagelog"
            path => "/var/log/messages"
            start_position => "beginning"   # 首次从头收集
        }
        # 从文件输入，类型是messagelog，写明路径，最后指定从头收集
    }

    output {
        file {
            path => "/tmp/123.txt"
        }
        # 输出到一个文件，用file引导，下面写明路径。
        elasticsearch {
            hosts => ["192.168.1.20:9200"]
            index => "system-messages-%{+YYYY.MM.dd}"   # 索引的命名规则，后面加入日期
        }
        # 输出到elasticsearch，写明地址，索引的名称
    }
/usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/system.conf -t
# 使用-f指定配置文件，-t表示测试配置文件是否正确
chmod 644 /var/log/messages
# 让普通用户可以读系统日志
systemctl start logstash
# 启动logstash。也可以使用/usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/system.conf在前台启动
tail -f /tmp/123.txt
# 这时可以看到输出的日志文件了
访问192.168.1.20:9100，在其中的数据浏览中也可以看到一个叫system-messages-2019.01.24的索引了

==============================================================================================
收集多个日志
==============================================================================================
cp /etc/logstash/conf.d/system.conf /etc/logstash/conf.d/nginx.conf -a
vim /etc/logstash/conf.d/nginx.conf
input {
   file{
      type => "messagelog"      # type是自定义的？
      path => "/var/log/messages"
      start_position => "beginning"
   }
   file {
      type => "nginxlog"
      path => "/usr/local/nginx/logs/access.log"
      start_position => "beginning"
   }
}
output {
   file {
      path => "/tmp/123.txt"
   }
   elasticsearch {
      hosts => ["192.168.1.20:9200"]
      index => "system-messages-%{+YYYY.MM.dd}"
   }
   if [type] == "nginxlog" {        # 使用if判断type是否为输入中定义的nginxlog，如果是就传输到elasticsearch中
      elasticsearch {
      hosts => ["192.168.1.20:9200"]
      index => "nginx-messages-%{+YYYY.MM.dd}"
      }
   }
}
/usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/system.conf -t
systemctl restart logstash
访问192.168.1.20:9100，在概览中可以看到传过来的nginxlog索引了

* kibana
# 下面安装kibana
yum install -y kibana-6.5.4-x86_64.rpm
vim /etc/kibana/kibana.yml
    server.port: 5601
    server.host: "0.0.0.0"
    elasticsearch.url: "http://192.168.1.20:9200"   # 调用elasticsearch的接口，写一个就可以
systemctl start kibana
yum install -y gcc gcc-c++ automake pcre pcre-devel zlib zlib-devel openssl openssl-devel
tar xf nginx-1.12.2.tar.gz
cd nginx-1.12.2/
./configure --prefix=/usr/local/nginx
make && make install
# 使用nginx反向代理kibana
vim /etc/kibana/kibana.yml
    server.host: "localhost"
    # 改为监听本地地址
cd /usr/local/nginx/
mkdir /usr/local/nginx/conf/conf.d
vim /usr/local/nginx/conf/conf.d/kibana.conf
    server {
        listen 80;
        server_name test.kibana.com;
        location / {
            proxy_pass http://localhost:5601;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
vim /usr/local/nginx/conf/nginx.conf
    http {
        ...
        include /usr/local/nginx/conf/conf.d/*.conf;
    }
/usr/local/nginx/sbin/nginx
# 启动
设置本机可以解析test.kibana.com
```

##### kibana简单设置使用

###### 访问

> 这里可以选择使用样本数据，也可以只使用自己的数据。可以通过对样本数据设置的学习，了解kibana的设置方法

![](/images/kibana/访问1.png)



###### 设置

> 选择左侧的Management，之后在右边输入从els中获取的索引的名称，只需要输入前面部分，后面的日期可以使用星号配置，这里在下面也可以看到匹配到的索引，最后点击下一步。之后选择按时间过滤并创建即可。

![](/images/kibana/配置索引1.png)

![](/images/kibana/配置索引2.png)

> 这后可以在Discover中看到我们添加的索引了，如果无法显示数据，可能是右上方的时间有误

![](/images/kibana/查看1.png)

##### nginx登录认证

```shell
* kibana
[root@kibana ~]# yum install -y httpd-tools
[root@kibana ~]# htpasswd -bc /usr/local/nginx/conf/htpasswd.users kibanauser centos
Adding password for user kibanauser
# 设置登录用户名和密码
[root@kibana ~]# vim /usr/local/nginx/conf/conf.d/kibana.conf 
server {
   listen 80;
   server_name test.kibana.com;
   auth_basic "Restricted Access";
   auth_basic_user_file /usr/local/nginx/conf/htpasswd.users;
   location / {
      proxy_pass http://localhost:5601;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
   }
}
# 加入认证
[root@kibana ~]# /usr/local/nginx/sbin/nginx -s reload
再次访问kibana页面时就需要认证了
```



#### 日志收集

```shell
==============================================================================================
* 规划
通过在要收集日志的服务器上安装filebeat进行日志收集，之后将收集到的数据写入到redis服务器，再通过logstash服务器取出数据并写入到elasticsearch集群中。也可以通过filebeat收集日志后转发给logstash服务器，再由logstash服务器写入到redis中，再由另一台logstash服务器从redis服务器中取出数据并写入到elasticsearch集群中。

* 环境
准备三台主机，做els集群，配置：双核处理器，2G内存。地址：192.168.1.20，192.168.1.21，192.168.1.22
准备一台主机，安装nginx，地址：192.168.1.30
准备一台主机，安装kibana，地址：192.168.1.23
准备一台主机，安装redis，地址：192.168.1.24
准备一台主机，安装haproxy，地址：192.168.1.31

* 软件版本
1. 操作系统:CentOS7.4.1708
2. jdk: jdk-8u201 官方rpm或gz包
3. elasticsearch:6.5.4 官方当前最新rpm
4. logstash:6.5.4 官方当前最新rpm
5. kibana:6.5.4 官方当前最新rpm
6. filebeat:6.5.4 官方当前最新rpm
7. nginx:1.12.2
8. redis:5.0.3 官方最新源码包
==============================================================================================
-------------
     redis
-------------
[root@redis ~]# yum install -y gcc
[root@redis ~]# tar xf redis-5.0.3.tar.gz -C /usr/local/src/
[root@redis redis-5.0.3]# cd /usr/local/src/redis-5.0.3/
[root@redis redis-5.0.3]# make
[root@redis redis-5.0.3]# ln -sv /usr/local/src/redis-5.0.3/ /usr/local/redis
‘/usr/local/redis’ -> ‘/usr/local/src/redis-5.0.3/’
[root@redis redis-5.0.3]# cp src/redis-server src/redis-cli /usr/bin
[root@redis redis-5.0.3]# cd /usr/local/redis/
[root@redis redis]# vim redis.conf
    bind 0.0.0.0
    daemonize yes
    # 让redis以守护进程方式运行
    save ""		
    #save 900 1
    #save 300 10
    #save 60 10000
    # 因为不需要持久存储，所以将save ""打开，将下面三行关闭。
    requirepass centos
    logfile "/var/log/redis.log"
    # 输出日志路径，默认会输出到/dev/null中
[root@redis redis]# redis-server /usr/local/redis/redis.conf
# 启动redis，启动时指定配置文件
[root@redis redis]# ss -tln
[root@redis redis]# redis-cli 
127.0.0.1:6379> KEYS *
(error) NOAUTH Authentication required.
127.0.0.1:6379> AUTH centos
OK
127.0.0.1:6379> KEYS *
(empty list or set)

-------------
  haproxy
-------------
[root@haproxy ~]# yum install jdk-8u201-linux-x64.rpm
[root@haproxy ~]# yum install logstash-6.5.4.rpm
[root@haproxy ~]# yum install -y haproxy
[root@haproxy ~]# vim /etc/haproxy/haproxy.cfg
global
    log         127.0.0.1 local6		# 这行很重要，local6是haproxy的日志级别，在rsyslog配置文件中也要定义这个级别
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
frontend myweb		
    bind *:80
    default_backend websrvs
backend websrvs
    balance roundrobin
    server srv1 192.168.1.30:80 check
# 这里只简单地将haproxy反代到nginx服务器上，实现访问haproxy就会反代到nginx服务器上
[root@haproxy ~]# vim /etc/rsyslog.d/haproxy.conf
    $ModLoad imudp
    $UDPServerRun 514
    $ModLoad imtcp
    $InputTCPServerRun 514
    local6.* @@192.168.1.31:5140
# 接收日志的logstash服务器IP:PORT，local6对应haproxy的日志级别。这里将日志传给了本机的logstash
[root@haproxy ~]# vim /etc/logstash/conf.d/syslog.conf 
input {
   syslog {
      type => "system-rsyslog"
      port => "5140"		# 从logstash的5140端口输入，实际也是定义logstash监听的端口
   }
}

output {
   stdout {
      codec => rubydebug
   }
   redis {
      data_type => "list"		# redis的数据类型要使用list
      key => "system-rsyslog"		# 写入redis的键名
      host => "192.168.1.24"		# redis地址
      port => "6379"		# redis端口
      db => "0"			# redis库
      password => "centos"		# redis密码
   }
}
[root@haproxy ~]# systemctl restart rsyslog
# rsyslog监听在514端口
[root@haproxy ~]# systemctl start haproxy    
[root@haproxy ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/syslog.conf
在本机设置hosts文件，解析haproxy地址到www.test.com，访问www.test.com，这时应该显示一些信息，如：
{
         "timestamp" => "Jan 25 12:53:39",
        "@timestamp" => 2019-01-25T04:53:39.000Z,
           "message" => "192.168.1.9:33634 [25/Jan/2019:12:53:39.002] myweb websrvs/srv1 0/0/1/1/2 304 175 - - ---- 2/2/0/0/0 0/0 \"GET / HTTP/1.1\"\n",
         "logsource" => "localhost",
              "type" => "system-rsyslog",
              "host" => "192.168.1.31",
          "priority" => 182,
    "facility_label" => "local6",
          "severity" => 6,
           "program" => "haproxy",
          "facility" => 22,
    "severity_label" => "Informational",
               "pid" => "3817",
          "@version" => "1"
}
[root@haproxy ~]# ss -tln
# 可以看到监听了5140端口
[root@haproxy ~]# systemctl start logstash
# 在后台启动

-------------
     redis
-------------
[root@redis redis]# redis-cli -a centos
127.0.0.1:6379> SELECT 0
OK
127.0.0.1:6379> KEYS *
1) "system-rsyslog"
127.0.0.1:6379> LLEN system-rsyslog
(integer) 3
127.0.0.1:6379> LPOP system-rsyslog
"{\"facility\":22,\"host\":\"192.168.1.31\",\"logsource\":\"localhost\",\"program\":\"haproxy\",\"@version\":\"1\",\"facility_label\":\"local6\",\"message\":\"192.168.1.9:33540 [25/Jan/2019:12:37:37.836] myweb websrvs/srv1 0/0/0/1/1 304 175 - - ---- 2/2/0/1/0 0/0 \\\"GET / HTTP/1.1\\\"\\n\",\"priority\":182,\"pid\":\"3817\",\"timestamp\":\"Jan 25 12:37:37\",\"severity\":6,\"severity_label\":\"Informational\",\"type\":\"system-rsyslog\",\"@timestamp\":\"2019-01-25T04:37:37.000Z\"}"
# 可以看到相关数据了

-------------
  haproxy
-------------
[root@haproxy ~]# vim /etc/logstash/conf.d/syslog.conf 
input {
   syslog {
      type => "system-rsyslog"
      port => "5140"
   }
}

output {
   stdout {
      codec => rubydebug
   }
   redis {
      data_type => "list"
      key => "haproxy-log-31"		# 改变输出到redis中的键名
      host => "192.168.1.24"
      port => "6379"
      db => "0"
      password => "centos"
   }
}
[root@haproxy ~]# systemctl restart logstash

-------------
     redis
-------------
127.0.0.1:6379> KEYS *
1) "haproxy-log-31"
2) "system-rsyslog"
# 可以看到从logstash传入新的键了

==============================================================================================
下面设置收集TCP/UDP日志
==============================================================================================
-------------
  haproxy
-------------
[root@haproxy ~]# vim /etc/logstash/conf.d/tcp.conf
input {
   tcp {
      port => "5500"
      type => "tcp-syslog"
      mode => "server"
   }
}

output {
	stdout {
	  codec => rubydebug
	}
   redis {
      data_type => "list"
      key => "tcp-syslog"
      host => "192.168.1.24"
      port => "6379"
      db => "0"
      password => "centos"
   }
}
[root@haproxy ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/tcp.conf -t
WARNING: Could not find logstash.yml which is typically located in $LS_HOME/config or /etc/logstash. You can specify the path using --path.settings. Continuing using the defaults
Could not find log4j2 configuration at path /usr/share/logstash/config/log4j2.properties. Using default config which logs errors to the console
[WARN ] 2019-01-25 13:16:45.820 [LogStash::Runner] multilocal - Ignoring the 'pipelines.yml' file because modules or command line options are specified
Configuration OK
[INFO ] 2019-01-25 13:16:47.307 [LogStash::Runner] runner - Using config.test_and_exit mode. Config Validation Result: OK. Exiting Logstash
# 测试配置文件没有问题
[root@haproxy ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/tcp.conf
# logstash启动时还会监听本地的9600端口
[root@haproxy ~]# yum install -y nc
[root@haproxy ~]# echo "nc test"|nc 192.168.1.31 5500
这时logstash会在终端输出内容：
{
          "host" => "haproxy",
       "message" => "nc test",
          "port" => 39566,
          "type" => "tcp-syslog",
    "@timestamp" => 2019-01-25T05:29:16.034Z,
      "@version" => "1"
}
[root@haproxy ~]# nc 192.168.1.31 5500 < /root/anaconda-ks.cfg
[root@haproxy ~]# echo "伪设备" > /dev/tcp/192.168.1.31/5500
# /dev后面的部分是没有的，要手动输入，在logstash中也会显示

-------------
     redis
-------------
127.0.0.1:6379> KEYS *
1) "tcp-syslog"
2) "haproxy-log-31"
3) "system-rsyslog"
127.0.0.1:6379> LLEN tcp-syslog
(integer) 52
# redis中也可以看到数据了

-------------
  logstash
-------------
# 使用nginx主机中的logstash收集redis中的数据
[root@nginx1 ~]# vim /etc/logstash/conf.d/tcp.conf
input {
      port => "6379"
      key => "haproxy-log-31"
      db => "0"
      password => "centos"
   }  
   
      data_type => "list"
      host => "192.168.1.24"
      port => "6379"
      key => "tcp-syslog"
      db => "0"
      password => "centos"
   }  
}  

output {
   if [type] == "tcp-syslog" {
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "tcp-rsyslog-%{+YYYY.MM.dd}"
      }  
   }  
   
   if [type] == "system-rsyslog" {		# 这里判断的是haproxy服务器的logstash设置中input定义的type
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "haproxy-log-31-%{+YYYY.MM.dd}"
      }  
   }  
}  
# 从redis中取行数据，之后输出到elasticsearch集群中。
[root@nginx1 ~]# systemctl start logstash
[root@nginx1 ~]# tail -f /var/log/logstash/logstash-plain.log
# 可以通过这个日志文件查看logstash运行是否正常，如是否可以连接到redis服务器
访问els服务器：192.168.1.20:9200，这时可以看到haproxy-log-31-*这个索引了
```



#### filebeat收集日志

```shell
==============================================================================================
* 规划
1. 在web端安装filebeat进行对日志的收集，之后将日志发送给logstash。
2. 配置一台logstash服务器，将收到的日志转发到redis
3. 使用另一台logstash服务器从redis中读取日志，并将处理的结果写入到elasticsearch集群
4. 配置地图显示IP访问地址
5. 将日志写入数据库持久化保存
6. 通过zabbix对elasticsearch集群状态及redis队列长度监控并实现邮件报警

* 环境
准备三台主机，做els集群，配置：双核处理器，2G内存。地址：192.168.1.20，192.168.1.21，192.168.1.22
准备一台主机，安装nginx，地址：192.168.1.30
准备一台主机，安装kibana，地址：192.168.1.23
准备一台主机，安装redis，地址：192.168.1.24
准备一台主机，安装logstash负责将日志转发到redis，地址：192.168.1.30
准备一台主机，安装logstash负责从redis中读取数据并写入elasticsearch集群，地址：192.168.1.31。需要从redis中取出数据，所以再配置一台logstash服务器
==============================================================================================

-------------------------------------
  nginx+tomcat+logstash30
-------------------------------------
# 下面配置nginx日志格式，filebeat获取nginx与系统日志并转发至本机的logstash
[root@nginx1 ~]# mkdir /usr/local/nginx/html/web
[root@nginx1 ~]# echo "Nginx WebPage" > /usr/local/nginx/html/web/index.html
访问http://192.168.1.30/web/
[root@nginx1 ~]# vim /usr/local/nginx/conf/nginx.conf
http {
    ...
    log_format access1 '{"@timestamp":"$time_iso8601",'
                         '"host":"$server_addr",'
                         '"clientip":"$remote_addr",'
                         '"size":$body_bytes_sent,'
                         '"responsetime":$request_time,'
                         '"upstreamtime":"$upstream_response_time",'
                         '"upstreamhost":"$upstream_addr",'
                         '"http_host":"$host",'
                         '"url":"$uri",'
                         '"domain":"$host",'
                         '"xff":"$http_x_forwarded_for",'
                         '"referer":"$http_referer",'
                         '"status":"$status"}';
	server {
		...
        access_log  logs/host.access.log  access1;
	}
}
# 配置日志格式为Json格式。相对普通日志格式,json易于识别,每个值都有与其相对于的key,易于提取日志内容及方便后续进一步对日志的分析。可以到http://www.kjson.com/上验证Json格式是否正确。
[root@nginx1 ~]# /usr/local/nginx/sbin/nginx -t
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
[root@nginx1 ~]# /usr/local/nginx/sbin/nginx -s reload
[root@nginx1 ~]# yum install -y filebeat-6.5.4-x86_64.rpm
# 安装filebeat，这个软件可以在web端实时收集日志并传递给logstash进一步处理
==============================================================================================
为什么不用logstash在web端收集
1. 依赖java环境，一旦java出问题，可能影响到web服务
2. 系统资源占用率高，且存在bug风险
3. 配置比较复杂，支持匹配过滤
4. filebeat挺好的，专注日志收集，语法简单，安装快捷，配置方便
==============================================================================================
[root@nginx1 ~]# vim /etc/filebeat/filebeat.yml
#filebeat.inputs:
#- type: log
#  enabled: false
#  paths:
#    - /var/log/*.log
#output.elasticsearch:
  # Array of hosts to connect to.
#  hosts: ["localhost:9200"]
filebeat.prospectors:
- input_type: log
  paths:
    - /var/log/messages
  include_lines: ["^ERR","^WARN"]		
  # 如果加入此行，filebeat会只发送正则表达式匹配到的日志，其他都不发送。测试中未加此行。
  fields:
    service: system-log-30
# filebeat6中需要通过fields: service:这样的方式定义输出的类型，而5版本中的设置是使用  document_type: 定义类型。如果6版本中也按5版本的方法设置，在logstash中是找不到的。
output.redis:
  hosts: ["192.168.1.24:6379"]
  key: "system-log-30"
  db: 10
  timeout: 5
  password: "centos"
# 在配置文件最下方加入上面内容，另外需要注释配置文件中的inputs和其他output，不然启动会失败，不能有多个output段。启动失败时日志中会提示如"Exiting: prospectors and inputs used in the configuration file, define only inputs not both"
[root@nginx1 ~]# tail -f /var/log/filebeat/filebeat
# 查看日志

[root@nginx1 ~]# vim /etc/filebeat/filebeat.yml
filebeat.prospectors:
- input_type: log
  paths:
    - /var/log/messages
  fields:
    service: system-log-30
- input_type: log
  paths:
    - /usr/local/nginx/logs/access.log
  fields:
    service: nginx-accesslog-30
  
output.logstash:
  hosts: ["192.168.1.30:5044","192.168.1.30:5045"]
  enabled: true
  worker: 1
  compression_level: 3
  loadbalance: true		# 默认为false，全部发送到随机选择的一个，相当于高可用模式
[root@nginx1 filebeat]# systemctl restart filebeat 

[root@nginx1 ~]# vim /etc/logstash/conf.d/beats.conf
    input {				
       beats {		# 这个输入的名称是自定义的
          port => 5044
          codec => "json"
       }
       beats {
          port => 5045
          codec => "json"
       }
    }

    output {
       stdout {
          codec => "rubydebug"
       }  
    }
[root@nginx1 ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/beats.conf
[root@nginx1 ~]# vim /etc/logstash/conf.d/beats.conf
    input {				
       beats {		# 此输入插件使Logstash能够从Elastic Beats框架接收事件
          port => 5044
          codec => "json"
       }
       beats {
          port => 5045
          codec => "json"
       }
    }
    output {
       if [fields][service] == "system-log-30" {		
# 这里的[fields][service] 是在filebeat的input中定义的，这是logstash6版本中的使用方法。如果是5版本，需要使用if [type] == ""来匹配数据类型
          redis {
             data_type => "list"
             host => "192.168.1.24"
             port => "6379"
             key => "system-log-30"
             db => "15"
             password => "centos"
          }  
# 收集到的系统日志会因为JSON格式而报错，如"[ERROR] 2019-01-28 00:01:06.861 [defaultEventExecutorGroup-5-1] json - JSON parse error, original data now in message field {:error=>#<LogStash::Json::ParserError: Unrecognized token 'Jan': was expecting ('true', 'false' or 'null')
# at [Source: (String)"Jan 28 00:01:01 nginx1 systemd: Started Session 197 of user root."; line: 1, column: 4]>, :data=>"Jan 28 00:01:01 nginx1 systemd: Started Session 197 of user root."}"，但数据还是会被写入到redis中。
       }  
       if [fields][service] == "nginx-accesslog-30" {
          redis {
             data_type => "list"
             host => "192.168.1.24"
             port => "6379"
             key => "nginx-accesslog-30"
             db => "15"
             password => "centos"
             codec => "json"
          }  
       }  
    }
[root@nginx1 ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/beats.conf -t
[root@nginx1 ~]# systemctl start logstash
[root@nginx1 ~]# lsof -i:5045                 
COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
java     22018 logstash  111u  IPv6 265612      0t0  TCP *:osp (LISTEN)
java     22018 logstash  140u  IPv6 265052      0t0  TCP nginx1:osp->nginx1:60146 (ESTABLISHED)
filebeat 22162     root    5u  IPv4 265051      0t0  TCP nginx1:60146->nginx1:osp (ESTABLISHED)
#  查看是否连接到5044端口
[root@nginx1 ~]# netstat -alnp | grep filebeat
tcp        0      0 192.168.1.30:60146      192.168.1.30:5045       ESTABLISHED 22162/filebea      
tcp        0      0 192.168.1.30:44502      192.168.1.30:5044       ESTABLISHED 22162/filebea
#  netstart查看端口

-------------
     redis
-------------
[root@redis ~]# lsof -i:6379 -n    
COMMAND     PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
redis-ser 15196 root    6u  IPv4  32440      0t0  TCP *:6379 (LISTEN)
redis-ser 15196 root   10u  IPv4 166066      0t0  TCP 192.168.1.24:6379->192.168.1.30:48894 (ESTABLISHED)
# 可以看到192.168.1.30连到了这台redis上。
[root@redis ~]# redis-cli -a centos
127.0.0.1:6379> SELECT 5
OK
127.0.0.1:6379[5]> KEYS *
1) "system-log-30"
2) "nginx-accesslog-30"
# 可以看到redis库中已经有数据了。

-----------------
  logstash31
-----------------
# 下面配置logstash从redis读取数据
[root@haproxy ~]# cd /etc/logstash/conf.d/
[root@haproxy conf.d]# vim redis-es.conf
input {
   redis {
      data_type => "list"
      host => "192.168.1.24"
      port => "6379"
      key => "system-log-30"
      db => "5"
      password => "centos"
   }
   redis {
      data_type => "list"
      host => "192.168.1.24"
      port => "6379"
      key => "nginx-accesslog-30"
      db => "5"
      password => "centos"
   codec => "json"
   }
}
output {
   if [fields][service]== "system-log-30" {
   # 这里也要使用这样的判断方法，不能使用if [type] == ""这样的方法
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "system-log-30-%{+yyyy.MM.dd}"
         # 这里的%{+yyyy.MM.dd}年和日都要使用小写字母，不能使用大写字母，不然logstash会报错。
      }
   }
   if [fields][service] == "nginx-accesslog-30" {
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "nginx-accesslog-30-%{+yyyy.MM.dd}"
      }
   }
}
[root@haproxy conf.d]# systemctl start logstash
访问http://192.168.1.20:9100/，这时可以看到有日志索引nginx-accesslog-30-****.**.**存在了。
```

##### kibana验证nginx访问日志

> 因为kibana是从本机的nginx反向代理的，所以访问的地址是test.kibana.com，访问时出现错误提示：重定向次数过多，需要清理cookie。重启kibana后正常。原因不明。

> 在kibana中创建nginx-accesslog-30-*索引后，就可以看到数据信息了

![](/images/kibana/查看2.png)

##### 部署tomcat

```shell
-------------------------------------
  nginx+tomcat+logstash30
-------------------------------------
# 下面部署tomcat
[root@nginx1 ~]# yum install -y tomcat tomcat-admin-webapps tomcat-docs-webapp tomcat-webapps
[root@nginx1 ~]# mkdir /usr/share/tomcat/webapps/tomcatweb
[root@nginx1 ~]# vim /usr/share/tomcat/webapps/tomcatweb/index.html
	Tomcat Web Page
# 创建一个测试页
[root@nginx1 ~]# systemctl start tomcat
访问http://192.168.1.30:8080/tomcatweb/
[root@nginx1 ~]# systemctl stop tomcat
[root@nginx1 ~]# vim /etc/tomcat/server.xml
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="
logs"
               prefix="localhost_access_log." suffix=".txt"
               pattern="{&quot;clientip&quot;:&quot;%h&quot;,&quot;ClientUser&quot;:&quot;%l&quot;
,&quot;authenticated&quot;:&quot;%u&quot;,&quot;AccessTime&quot;:&quot;%t&quot;,&quot;method&quot;
:&quot;%r&quot;,&quot;status&quot;:&quot;%s&quot;,&quot;SendBytes&quot;:&quot;%b&quot;,&quot;Query
?string&quot;:&quot;%q&quot;,&quot;partner&quot;:&quot;%{Referer}i&quot;,&quot;AgentVersion&quot;:
&quot;%{User-Agent}i&quot;}" />
# 需要注意tomcat日志的json格式，使用两个&quot;将字段和变量分隔，标点符号不需要使用
[root@nginx1 ~]# rm -rf /var/log/tomcat/*
[root@nginx1 ~]# systemctl start tomcat
[root@nginx1 ~]# tail /var/log/tomcat/localhost_access_log.2019-01-28.txt
{"clientip":"192.168.1.9","ClientUser":"-","authenticated":"-","AccessTime":"[28/Jan/2019:09:58:44 +0800]","method":"GET /tomcatweb/ HTTP/1.1","status":"304","SendBytes":"-","Query?string":"","partner":"-","AgentVersion":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"}
# 验证tomcat日志转json
[root@nginx1 ~]# vim /etc/filebeat/filebeat.yml
    - input_type: log
      paths:
        - /var/log/tomcat/localhost_access_log.*
      fields:
        service: tomcat-accesslog-30
# 加入对tomcat日志的收集
[root@nginx1 ~]# systemctl restart filebeat.service
[root@nginx1 ~]# vim /etc/logstash/conf.d/beats.conf
output {
    ...
    if [fields][service] == "tomcat-accesslog-30" {
      redis {
         data_type => "list"
         host => "192.168.1.24"
         port => "6379"
         key => "tomcat-accesslog-30"
         db => "5"
         password => "centos"
         codec => "json"
      }  
   } 
}
[root@nginx1 ~]# systemctl restart logstash
[root@nginx1 ~]# yum install -y httpd-tools
[root@nginx1 ~]# ab -n1000 -c10 http://192.168.1.30:8080/tomcatweb/

-------------
     redis
-------------
[root@redis ~]# redis-cli -a centos
127.0.0.1:6379> SELECT 5
OK
127.0.0.1:6379[5]> KEYS *
1) "tomcat-accesslog-30"
# 可以看到redis中已经有数据了

-----------------
  logstash31
-----------------
# 下面配置logstash从redis读取tomcat的数据
[root@haproxy conf.d]# vim redis-es.conf       
input {
...
redis {
      data_type => "list"
      host => "192.168.1.24"
      port => "6379"
      key => "tomcat-accesslog-30"
      db => "5"
      password => "centos"
   codec => "json"
   }
}
output {
...
if [fields][service] == "tomcat-accesslog-30" {
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "tomcat-accesslog-30-%{+yyyy.MM.dd}"
      }
   }
}
[root@haproxy conf.d]# systemctl restart logstash
最后加入到kibana中

--------------------
  elasticsearch
--------------------
[root@els3 ~]# du -sh /elkdata/data/nodes/0/indices/
97M     /elkdata/data/nodes/0/indices/
[root@els3 ~]# du -sh /elkdata/data/nodes/0/indices/*
4.0K    /elkdata/data/nodes/0/indices/--3-U6GWTSifioos1N2yUQ
91M     /elkdata/data/nodes/0/indices/6MycbQuEQWmCbg3-A1q5EA
120K    /elkdata/data/nodes/0/indices/HGUqPJuCQ1iTPJr1EVfxoQ
2.0M    /elkdata/data/nodes/0/indices/KuBtJ9ztSDaI7dFaiNfeFQ
2.9M    /elkdata/data/nodes/0/indices/QbkLT5G7RYu5nivgm2uncA
1.5M    /elkdata/data/nodes/0/indices/_yuF7skcTtWOF4YJl_UaTw
# 验证filebeat读取的日志，已经通过logstash写入到elasticsearch的数据目录中
```



### kibana配置地图显示IP访问地址

```shell
-----------------
  logstash31
-----------------
[root@kibana ~]# wget http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz
# 在写入elasticsearch的logstash服务器配置
[root@haproxy ~]# gunzip GeoLite2-City.tar.gz
[root@haproxy ~]# tar xf GeoLite2-City.tar
[root@haproxy ~]# cd GeoLite2-City_20190122/
[root@haproxy GeoLite2-City_20190122]# cp GeoLite2-City.mmdb /etc/logstash/ -a
[root@haproxy ~]# vim /etc/logstash/conf.d/redis-es.conf
input {}
filter {
   filter {
   if [fields][service] == "nginx-accesslog-30" {
   geoip {
        source => "clientip"
        target => "geoip"
        database => "/etc/logstash/GeoLite2-City.mmdb"
        add_field => ["[geoip][coordinates]","%{[geoip][longitude]}"]
        add_field => ["[geoip][coordinates]","%{[geoip][latitude]}"]
   }
   mutate {
        convert => ["[geoip][coordinates]","float"]
   }
   }
}
output {
    ...
    if [fields][service] == "nginx-accesslog-30" {
      elasticsearch {
         hosts => ["192.168.1.20:9200"]
         index => "logstash-nginx-accesslog-30-%{+yyyy.MM.dd}"
      }
   }
# 这里输出到els中的index名称必须以logstash开头，不然在kibana中创建地图选择Field时会有错误提示"No Compatible Fields: The "nginx-accesslog-30-*" index pattern does not contain any of the following field types: geo_point"
}
[root@haproxy ~]# systemctl restart logstash
```

#### kibana创建地图

> 删除旧的索引，重新创建新索引

![](/images/kibana/地图1.png)

> 查看字段，会有以geoip开头的字段加入

![](/images/kibana/地图2.png)

```shell
-------------------------------------
  nginx+tomcat+logstash30
-------------------------------------
[root@nginx1 ~]# echo '{"@timestamp":"2019-01-27T19:27:57+08:00","host":"192.168.1.30","clientip":"106.38.38.83","size":0,"responsetime":0.000,"upstreamtime":"-","upstreamhost":"-","http_host":"192.168.1.30","url":"/index.html","domain":"192.168.1.30","xff":"-","referer":"-","status":"304"}' >> /usr/local/nginx/logs/host.access.log.
# 加入一条假数据到日志文件中，clientip改为公网地址
```

> 创建地图，选择logstash-nginx-accesslog-30-*

![](/images/kibana/地图3.png)

> 在Buckets中的Aggregation选择Geohash，Field选择geoip.location，最后点击上方的三角按钮，这时就可以在地图上看到标记了

![](/images/kibana/地图4.png)



### 将日志写入数据库

```shell
==============================================================================================
规划
1. 安装数据库并授权
2. 创建表
3. 配置logstash将数据写入数据库
4. 测试

环境
准备一台主机，安装mariadb，地址：192.168.1.25
logstash地址：192.168.1.30
==============================================================================================
--------------
  mariadb
--------------
[root@mysql ~]# yum install -y mariadb-server
[root@mysql ~]# systemctl start mariadb
[root@mysql ~]# mysql_secure_installation
[root@mysql ~]# mysql -uroot -pcentos
MariaDB [(none)]> CREATE DATABASE elk CHARACTER SET utf8 COLLATE utf8_bin;
MariaDB [(none)]> GRANT ALL privileges ON elk.* TO elk@"%" identified by "centos";
MariaDB [(none)]> FLUSH PRIVILEGES;
# 创建数据库并授权
[root@els3 ~]# mysql -h192.168.1.25 -uelk -pcentos
# 在其他主机验证远程登录数据库

--------------
  logstash
--------------
[root@nginx1 ~]# yum install -y ruby
# 需要安装ruby后才可以使用gem命令
[root@nginx1 ~]# gem sources --add http://gems.ruby-china.com --remove https://rubygems.org/
# Gem是一个管理Ruby库和程序的标准包，它通过Ruby Gem（如 http://rubygems.org/ ）源来查找、安装、升级和卸载软件包，非常的便捷。
# taobao Gems 源已停止维护，现由 ruby-china 提供镜像服务，所以将国内源改为http://gems.ruby-china.com
[root@nginx1 ~]# mkdir -pv /usr/share/logstash/vendor/jar/jdbc
[root@nginx1 ~]# unzip mysql-connector-java-8.0.14.zip
[root@nginx1 ~]# cp mysql-connector-java-8.0.14/mysql-connector-java-8.0.14.jar /usr/share/logstash/vendor/jar/jdbc/
[root@nginx1 ~]# chown -R logstash.logstash /usr/share/logstash/vendor/jar/
[root@nginx1 ~]# /usr/share/logstash/bin/logstash-plugin install logstash-output-jdbc
[root@nginx1 ~]# /usr/share/logstash/bin/logstash-plugin list|grep jdbc
logstash-filter-jdbc_static
logstash-filter-jdbc_streaming
logstash-input-jdbc
logstash-output-jdb

--------------
  mariadb
--------------
[root@mysql ~]# mysql -uroot -pcentos
MariaDB [(none)]> use elk
MariaDB [elk]> CREATE TABLE elklog (id int(11) NOT NULL AUTO_INCREMENT,host VARCHAR(255),clientip VARCHAR(255),url VARCHAR(255),status INT(16),time timestamp,PRIMARY KEY (id));

--------------
  logstash
--------------
[root@nginx1 filebeat]# vim /etc/logstash/conf.d/beats.conf
if [fields][service] == "nginx-accesslog-30" {
      redis {
         data_type => "list"
         host => "192.168.1.24"
         port => "6379"
         key => "nginx-accesslog-30"
         db => "5"
         password => "centos"
         codec => "json"
      }
      jdbc {
         driver_jar_path => "/usr/share/logstash/vendor/jar/jdbc/mysql-connector-java-8.0.14.jar"
         # 插件路径 
         connection_string => "jdbc:mysql://192.168.1.25:3306/elk?user=elk&password=centos&useUnic
ode=true&characterEncoding=UTF8"
# 数据库地址、端口、用户名、密码等信息
         statement => ["INSERT INTO elklog(host,clientip,url,status) VALUES(?,?,?,?)","http_host","clientip","url","status"]
# 最后四个引号("http_host","clientip","url","status")中的名称是从logstash中取得的字段名称，这四个引号是传入的变量
      }
   }
# 设置输出到数据库中

--------------
  mariadb
--------------
[root@mysql ~]# mysql -uroot -pcentos
MariaDB [(none)]> use elk
MariaDB [elk]> select * from elklog;
| 6000 | {"containerized":true,"id":"3e6f1f53c66e409f81bc71d9331832af","architecture":"x86_64","os":{"codename":"Core","family":"redhat","platform":"centos","version":"7 (Core)"},"name":"nginx1"} | 192.168.1.30 | /test/index.html |   NULL | 2019-01-28 21:28:35 |
# 这里保存的host有问题，需要将logstash中的statement最后的引号中的host改为http_host即可取得服务器地址了
```



### 删除els中索引的脚本

```shell
#!/bin/bash
#
DATE=`date -d "0 days ago" +%Y.%m.%d`
# 获取今天的日期，如果想获取一个月前的日期，就使用30 days ago
LOG_NAME="nginx-accesslog-30"
FILE_NAME=$LOG_NAME-$DATE
curl -XDELETE http://192.168.1.20:9200/$FILE_NAME
if [ $? -eq 0 ];then
   echo "${FILE_NAME} delete success."
else
   echo "${FILE_NAME} delete error."
fi
# 不可直接从/elkdata/data/nodes/0/indices/目录中删除索引，会使els服务器运行出错
```



















