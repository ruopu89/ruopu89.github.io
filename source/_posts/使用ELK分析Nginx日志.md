---
title: 使用ELK分析Nginx日志
date: 2020-01-20 16:57:19
tags: 日志收集,kakfa
categories: ELK
---

### 架构

使用filebeat收集nginx日志，输出到kafka；logstash从kafka中消费日志，通过grok进行数据格式化，输出到elasticsearch中，kibana从elasticsearch中获取日志，进行过滤出图。



### 部署wordpress

这里部署wordpress主要为了得到nginx的访问日志。

| 地址            | 服务                     | 主机名/系统  |
| --------------- | ------------------------ | ------------ |
| 192.168.1.14:80 | nginx/php/mariadb-server | nwps/CentOS8 |

```shell
yum install -y nginx php-fpm php mariadb-server php-mysqlnd
systemctl start php-fpm nginx mariadb-server
systemctl enable php-fpm nginx mariadb-server
mysql_secure_installation
# 初始化mariadb
mysql -uroot -pcentos
create database wordpress;
grant all on wordpress.* to 'wps'@'localhost' identified by 'centos';
flush privileges;
tar xf wordpress-5.2.2-zh_CN.tar.gz -C /usr/share/nginx/html
cd /usr/share/nginx/html/wordpress
cp wp-config-sample.php wp-config.php
vim wp-config.php
            /** WordPress数据库的名称 */
            define('DB_NAME', 'wordpress');

            /** MySQL数据库用户名 */
            define('DB_USER', 'wps');

            /** MySQL数据库密码 */
            define('DB_PASSWORD', 'centos');

            /** MySQL主机 */
            define('DB_HOST', 'localhost');

            /** 创建数据表时默认的文字编码 */
            define('DB_CHARSET', 'utf8');

            /** 数据库整理类型。如不确定请勿更改 */
            define('DB_COLLATE', '');
访问：http://172.16.103.130/wordpress进行安装
```



### 部署zookeeper

| 地址         | 服务                                      | 主机名/系统    |
| ------------ | ----------------------------------------- | -------------- |
| 192.168.1.17 | zookeeper-3.4.14/java-1.8.0-openjdk-devel | kafka1/CentOS8 |
| 192.168.1.15 | zookeeper-3.4.14/java-1.8.0-openjdk-devel | kafka2/CentOS8 |
| 192.168.1.16 | zookeeper-3.4.14/java-1.8.0-openjdk-devel | kafka3/CentOS8 |

```shell
------------
   三台主机
------------
到http://zookeeper.apache.org/releases.html去下载zookeeper。这里需要注意，下载的3.5.5和3.5.6
版本中没有zookeeper-***.jar包，所以启动zookeeper会提示:
"Could not find or load main class org.apache.zookeeper.server.quorum.QuorumPeerMain"。
测试下载的3.4.14版本没有问题。也许是不会使用的原因

yum install java-1.8.0-openjdk-devel
# zookeeper依賴java
tar -zxvf zookeeper-3.4.14.tar.gz -C /usr/local
# 解壓安裝
cd /usr/local
ln -sv zookeeper-3.4.14 zookeeper
cd zookeeper/conf
cp zoo_sample.cfg zoo.cfg
vim zoo.cfg
	tickTime=2000
    initLimit=10
    syncLimit=5
    dataDir=/usr/local/zookeeper/data
    dataLogDir=/usr/local/zookeeper/logs
    clientPort=2181
    server.1=192.168.1.17:2888:3888
    server.2=192.168.1.15:2888:3888
    server.3=192.168.1.16:2888:3888
# tickTime：这个时间是作为Zookeeper服务器之间或客户端与服务器之间维持心跳的时间间隔，也就是每个 tickTime 时间就会发送一个心跳。
# dataDir：顾名思义就是 Zookeeper保存数据的目录，默认情况下，Zookeeper将写数据的日志文件也保存在这个目录里。
# clientPort：这个端口就是客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客户端的访问请求。
# initLimit：这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连接 Zookeeper 服务器的客户端，而是 Zookeeper 服务器集群中连接到 Leader 的 Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 5个心跳的时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒
# syncLimit：这个配置项标识 Leader 与Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的时间长度，总的时间长度就是5*2000=10 秒
# server.A=B：C：D：其中 A 是一个数字，表示这个是第几号服务器；B 是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader 服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号
# 注意：dataDir,dataLogDir中的wwb是当前登录用户名，data，logs目录开始是不存在，需要使用mkdir命令创建相应的目录。并且在该目录下创建文件myid。serve1,server2,server3该文件内容分别为1,2,3。
cd /usr/local/zookeeper
mkdir {data,logs}
cd data
echo 1 > myid
# kafka2、3分别在這裡改為echo 2 > myid或echo 3 > myid
cd
scp zookeeper-3.4.14.tar.gz 192.168.1.15:/root
scp zookeeper-3.4.14.tar.gz 192.168.1.16:/root
# 从第一台主机复制到另外两台主机上
vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
chmod +x /etc/profile.d/java.sh
. /etc/profile.d/java.sh
java -version
scp /etc/profile.d/java.sh 192.168.1.15:/etc/profile.d
scp /etc/profile.d/java.sh 192.168.1.16:/etc/profile.d
scp /usr/local/zookeeper/conf/zoo.cfg root@192.168.1.15:/usr/local/zookeeper/conf/
scp /usr/local/zookeeper/conf/zoo.cfg root@192.168.1.16:/usr/local/zookeeper/conf/
# 从第一台主机复制到另外两台主机上
cd /usr/local/zookeeper/bin
./zkServer.sh start
# 啟動zookeeper
ss -tln
# 這時只有leader節點會監聽2888端口，另外兩台是不監聽的。三台主機都會監聽2181和3888端口
./zkCli.sh -server localhost:2181
# 這裡如果連接的是本機的zookeeper可以不用參數和地址，連接集群中其他zookeeper需要。
```



### 部署kafka

| 地址         | 服务             | 主机名/系统    |
| ------------ | ---------------- | -------------- |
| 192.168.1.17 | kafka_2.12-2.2.1 | kafka1/CentOS8 |
| 192.168.1.15 | kafka_2.12-2.2.1 | kafka2/CentOS8 |
| 192.168.1.16 | kafka_2.12-2.2.1 | kafka3/CentOS8 |

```shell
-------------
   三台主機
-------------
cd /root
tar xf kafka_2.12-2.2.1.tgz -C /usr/local
cd /usr/local
ln -sv kafka_2.12-2.2.1 kafka
cd kafka/config/
vim server.properties
	broker.id=1
# 三台主機這裡的id是不台一樣的，分別為1、2、3
    num.network.threads=3
    num.io.threads=8
    socket.send.buffer.bytes=102400
    socket.receive.buffer.bytes=102400
    socket.request.max.bytes=104857600
    log.dirs=/usr/local/kafka/logs
# 這裡改了日誌地址
    num.partitions=1
    num.recovery.threads.per.data.dir=1
    log.retention.hours=168
    log.segment.bytes=1073741824
    log.retention.check.interval.ms=300000
    zookeeper.connect=192.168.1.17:2181,192.168.1.15:2181,192.168.1.16:2181
# zookeeper集群內的所有地址都寫入
    zookeeper.connection.timeout.ms=6000
# 配置文件基本使用默認配置，之後會再查看配置文件詳細設置
mkdir /usr/local/kafka/logs
cd /usr/local/kafka/bin
nohup ./kafka-server-start.sh ../config/server.properties &
ss -tln
# 這時應該監聽了默認端口9092
vim /etc/hosts
192.168.1.17   kafka1
192.168.1.15	kafka2
192.168.1.16	kafka3
# 这里添加可以让三台主机互相通过主机名解析

---------------
    kafka1
---------------
# 创建topic
[root@kafka1 bin]# ./kafka-topics.sh --create --topic nginxlog --replication-factor 3 --partitions 3 --zookeeper 192.168.1.16:2181
Created topic nginxlog.
# 因为kafka1启动失败了，所以192.168.1.16变成了主节点
```



### 部署ElasticSearch

| 地址         | 服务 | 主机名/系统            |
| ------------ | ---- | ---------------------- |
| 192.168.1.19 |      | elasticsearch1/CentOS8 |
| 192.168.1.20 |      | elasticsearch2/CentOS8 |
| 192.168.1.18 |      | elasticsearch3/CentOS8 |

```shell
---------------
    三台主机
---------------
systemctl start chronyd
systemctl enable chronyd
chronyc
chronyc> waitsync
# 同步三台主机时间
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-8.repo
# 安装阿里源
yum makecache
yum install -y java-1.8.0-openjdk-devel
ssh-keygen -t rsa -P ''
# elasticsearch1创建密钥
ssh-copy-id -i root@192.168.1.20
ssh-copy-id -i root@192.168.1.18
vim /etc/profile.d/java.sh
    export JAVA_HOME=/usr
. /etc/profile.d/java.sh
# elasticsearch1创建并发送到另外两台主机
scp /etc/profile.d/java.sh root@192.168.1.20:/etc/profile.d/
scp /etc/profile.d/java.sh root@192.168.1.18:/etc/profile.d/
上传elasticsearch-6.5.4.rpm到三台主机
yum install elasticsearch-6.5.4.rpm
# 三台主机安装
vim /etc/elasticsearch/elasticsearch.yml
	cluster.name: myelk
    # 集群的名称，名称相同的主机就是处于同一个集群
    node.name: node1
    # 集群情况下，当前node的名字，每个node应该不一样。要将此文件复制到另两个节点
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
    discovery.zen.ping.unicast.hosts: ["192.168.1.19", "192.168.1.20", "192.168.1.18"]
    # 组播范围
    discovery.zen.minimum_master_nodes: 2
    # 设置此项为了必免脑裂，这里的数字是总节点数除以2加1算出来的。
scp /etc/elasticsearch/elasticsearch.yml root@192.168.1.20:/etc/elasticsearch/
scp /etc/elasticsearch/elasticsearch.yml root@192.168.1.18:/etc/elasticsearch/
# 将配置文件发送到另外两台主机
vim /etc/elasticsearch/jvm.options
    -Xms1g  # 初始化的堆内存
    -Xmx1g  
# 最大堆内存，可以改大此值。这两个值要保持一致。或将上面配置文件中的bootstrap.memory_lock的值改为false
mkdir /elkdata/{data,logs} -pv
# 三台主机创建数据和日志目录
chown -R elasticsearch.elasticsearch /elkdata/
systemctl start elasticsearch.service
systemctl status elasticsearch.service
ss -tln
# 启动会有一些慢，要等一会儿才能看到监听了9200和9300端口

-----------------------
    elasticsearch1
-----------------------
# 安装elasticsearch-head插件
yum install -y git
git clone git://github.com/mobz/elasticsearch-head.git
# 下载elasticsearch-head插件，这个插件是为了实现简单的集群监控、主机信息显示和管理等功能
yum install epel-release.noarch
yum install -y npm
cd elasticsearch-head/
# 这里一定要到这个目录下再启动插件才能启动，不然会报错
npm install grunt -save
# 这里可能会有报错"npm: relocation error: npm: symbol SSL_set_cert_cb, version libssl.so.10 not defined in file libssl.so.10 with link time reference"，需要安装openssl即可解决。
npm install
npm run start &
vim /etc/elasticsearch/elasticsearch.yml
    #---------------------------------- http --------------------------------
    http.cors.enabled: true     # 打开http功能
    http.cors.allow-origin: "*"     # 允许谁访问
# 配置elasticsearch允许远程访问
systemctl restart elasticsearch
systemctl enable elasticsearch.service
```



### 部署logstash

| 地址              | 服务               | 主机名/系统  |
| ----------------- | ------------------ | ------------ |
| 192.168.1.14:9600 | logstash-6.5.4.rpm | nwps/CentOS8 |

```shell
# 上传logstash-6.5.4.rpm到服务器上
yum -y install java-1.8.0-openjdk-devel
vim /etc/profile.d/java.sh
export JAVA_HOME=/usr
. /etc/profile.d/java.sh
yum -y install logstash-6.5.4.rpm
systemctl start logstash
systemctl enable logstash
/usr/share/logstash/bin/logstash -e "input{stdin{}} output{stdout{ codec => "rydebug"}}"
# 测试时会提示找不到rydebug模块，无法加载。这里是否应该为rubydebug，未测试。使用下面的配置文件是没有
# 问题的。启动后会监听9600端口
vim /etc/logstash/conf.d/system.conf   # 这个配置文件只作为测试使用
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
            hosts => ["192.168.1.20:9200"]    # 指定第一台elaticsearch地址即可。
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
访问192.168.1.19:9100，在其中的数据浏览中修改上方的连接地址为第一台elasticsearch的地址，之后就可以看到一个叫system-messages-2019.01.24的索引了
```



### 修改nginx配置

| 地址         | 服务  | 主机名/系统  |
| ------------ | ----- | ------------ |
| 192.168.1.14 | nginx | nwps/CentOS8 |

```shell
[root@nwps ~]# vim /etc/nginx/nginx.conf
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
        access_log  /var/log/nginx/host.access.log  access1;
        # 在server中加入此条，记录访问wordpress的日志
	}
}
# 配置日志格式为Json格式。相对普通日志格式,json易于识别,每个值都有与其相对于的key,易于提取日志内容及方便后续进一步对日志的分析。可以到http://www.kjson.com/上验证Json格式是否正确。
[root@nginx1 ~]# nginx -t
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
[root@nginx1 ~]# nginx -s reload
```



### 安装配置filebeat

| 地址         | 服务           | 主机名/系统  |
| ------------ | -------------- | ------------ |
| 192.168.1.14 | filebeat-6.5.4 | nwps/CentOS8 |

```shell
# 上传filebeat-6.5.4.rpm到主机
vim /etc/filebeat/filebeat.yml
filebeat.prospectors:
- input_type: log
  enabled: true
  paths:
    - /var/log/nginx/host.access.log
  fields:
    log_topics: nginxlog
    json.keys_under_root: true
    json.overwrite_keys: true
 
output.kafka:
  enabled: true
  hosts: ["192.168.1.17:9092"]
  topic: '%{[fields][log_topics]}'
  partition.round_robin:
  reachable_only: false
  compression: gzip
  max_message_bytes: 1000000
  required_acks: 1
# 配置输出到kafka中
/usr/share/filebeat/bin/filebeat -e -c /etc/filebeat/filebeat.yml
# 在前台启动，查看效果
systemctl start filebeat
systemctl enable filebeat

---------------
    kafka1
---------------
# 到第一台kafka查看效果
scp /etc/hosts root@192.168.1.14:/etc
# filebeat主机需要可以通过主机名解析kafka的地址，不然下面命令启动filebeat后虽然能收到信息，但会报错
# 解析不了kafka的地址。
./kafka-console-consumer.sh --bootstrap-server 192.168.1.17:9092 --topic nginxlog --from-beginning
# 这条命令可以在前台监控发送过来的消息
找一台主机访问nginx主机的wordpress页面，可以用curl访问多次，这时应该可以看到kafka上有发过来的信息
```



### 配置logstash

| 地址              | 服务               | 主机名/系统  |
| ----------------- | ------------------ | ------------ |
| 192.168.1.14:9600 | logstash-6.5.4.rpm | nwps/CentOS8 |

```shell
# 这台logstash的作用是消息kafka中的消息，创建了和topic一样名称的消费者组
[root@nwps ~]# mv /etc/logstash/conf.d/system.conf{,.bak}
[root@nwps ~]# vim /etc/logstash/conf.d/nginx.conf
input {
    kafka {
         type => "nginxlog"
         topics => ["nginxlog"]
         bootstrap_servers => ["192.168.1.17:9092"]
         group_id => "nginxlog"   # 在kafka中创建的组名
         auto_offset_reset => latest
         codec => "json"
    }
}

filter {
    if [type] == "nginxlog" {
         grok {
             match => {"message" => "%{COMBINEDAPACHELOG}"}
             remove_field => "message"
         }
         date {
             match => ["timestamp" , "dd/MMM/YYYY:HH:mm:ss Z"]
         }
#        geoip {
#            source => "clientip"
#            target => "geoip"
#            database => "/etc/logstash/conf.d/GeoLite2-City.mmdb"
#            add_field => ["[geoip][coordinates]", "%{[geoip][longitude]}"]
#            add_field => ["[geoip][coordinates]", "%{[geoip][latitude]}"]
#        }   # 注释这段有点问题，未查看具体原因
         mutate {
             convert => ["[geoip][coordinates]", "float"]
         }
         useragent {
             source => "agent"
             target => "userAgent"
         }
    }
}
output {
    if [type] == 'nginxlog' {
         elasticsearch {
             hosts => ["http://192.168.1.19:9200"]
             index => "logstash-nginxlog-%{+YYYY.MM.dd}"
         }
         stdout {codec => rubydebug}
    }
}
[root@nwps ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/nginx.conf 
# 在前台启动，查看效果。如果正常的话，应该可以看到被消费的信息在前台打印出来。类似下面这样：
{
    "@timestamp" => 2020-01-27T16:41:36.459Z,
       "message" => "{\"@timestamp\":\"2020-01-28T00:41:36+08:00\",\"host\":\"192.168.1.14\",\"clientip\":\"192.168.1.109\",\"size\":\"185\",\"responsetime\":\"0.000\",\"upstreamtime\":\"-\",\"upstreamhost\":\"-\",\"http_host\":\"192.168.1.14\",\"url\":\"/wordpress\",\"domain\":\"192.168.1.14\",\"xff\":\"-\",\"referer\":\"-\",\"status\":\"301\"}",
        "source" => "/var/log/nginx/host.access.log",
        "offset" => 2514148,
        "fields" => {
        "log_topics" => "nginxlog",
              "json" => {
             "overwrite_keys" => true,
            "keys_under_root" => true
        }
    },
          "host" => {
        "name" => "nwps"
    },
      "@version" => "1",
          "tags" => [
        [0] "_grokparsefailure"
    ],
          "type" => "nginxlog",
          "beat" => {
            "name" => "nwps",
        "hostname" => "nwps",
         "version" => "6.5.4"
    }
}

---------------
    kafka1
---------------
# 到第一台kafka查看效果
[root@kafka1 bin]# ./kafka-consumer-groups.sh --bootstrap-server 192.168.1.17:9092 --group nginxlog --describe

TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                                     HOST            CLIENT-ID
nginxlog        0          5407            5407            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
nginxlog        1          5406            5406            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
nginxlog        2          5405            5405            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
# 查看kafka的消息堆积情况，可以加上watch命令。不知是否与上面提到的hosts文件是否有关，最好加上可以解析
# kafka主机名。这里的kafka的组名是在logstash的配置文件中创建的。
```



### 安装配置kibana

| 地址              | 服务             | 主机名/系统  |
| ----------------- | ---------------- | ------------ |
| 192.168.1.14:5601 | kibana-6.5.4.rpm | nwps/CentOS8 |

```shell
# 上传kibana-6.5.4.rpm到主机
yum install -y kibana-6.5.4-x86_64.rpm
vim /etc/kibana/kibana.yml
    server.port: 5601
    server.host: "localhost"   # 这里是监听的地址
    elasticsearch.url: "http://192.168.1.19:9200"   # 调用elasticsearch的接口，写一个就可以
systemctl start kibana
vim /etc/nginx/conf.d/kibana.conf
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
nginx -s reload
本地添加hosts文件，可以解析test.kibana.com到192.168.1.14
访问test.kibana.com

-----------------------
   给nginx开启认证功能
-----------------------
yum install -y httpd-tools
htpasswd -bc /etc/nginx/conf.d/htpasswd.users kibanauser centos
vim /etc/nginx/conf.d/kibana.conf
server {
    listen 80;
    server_name test.kibana.com;
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/conf.d/htpasswd.users;
    location / {
         proxy_pass http://localhost:5601;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
    }
}
nginx -t
nginx -s reload
```

