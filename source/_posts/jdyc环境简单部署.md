---
title: jdyc环境简单部署
date: 2018-10-12 10:23:41
tags: jdbc部署
categories: jdbc
---

# web、netty、wechat、processor

```shell
* 安装环境
yum install -y java-1.8.0-openjdk-devel
vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
tar xf apache-tomcat-8.5.33.tar.gz -C /usr/local
cd /usr/local
ln -sv apache-tomcat-8.5.33 tomcat
* 部署
** web
vim /usr/local/tomcat/conf/server.xml
	<Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
	<Context path="" docBase="echarge" reloadable="true" />
#修改tomcat的启动端口，加入Context

** wechat
	<Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
    <Context path="" docBase="rest-app" debug="0" reloadable="true"/>
    
#netty与processor不必调整tomcat设置，将相关包放入tomcat中的webapps中
* 启动
/usr/local/tomcat/bin/startup.sh
tail -f /usr/local/tomcat/logs/catalina.out
#查看启动日志
```



# mysql

```shell
yum install -y mariadb
vim /etc/my.cnf
	[client]
    default-character-set = utf8mb4
    [mysql]
    default-character-set = utf8mb4
    #字符集要加上，不然使用中会有字符不能正常显示
    socket=/var/lib/mysql/mysql.sock
    [mysqld]
    datadir=/var/lib/mysql
    socket=/var/lib/mysql/mysql.sock
    symbolic-links=0

    character-set-server = utf8mb4
    collation-server = utf8mb4_unicode_ci
    wait_timeout=10
    sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES

    innodb_file_per_table=ON
    skip_name_resolve=ON

    server_id=1
    log-bin=master-log
    relay_log=relay-log

    auto_increment_offset=1
    auto_increment_increment=2
	#这是为了做主主复制的配置
    [mysqld_safe]
    log-error=/var/log/mysqld.log
mysql_secure_installation
#设置用户名和密码
mysql
GRANT ALL ON *.* TO 'echarge'@'%' IDENTIFIED BY 'centos';
FLUSH PRIVILEGES;

```



# zk&kafka

```shell
# zookeeper环境依赖JVM虚拟机
yum install -y java-1.8.0-openjdk-devel
vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
	
# 需要准备三台主机，在三台主机上做相同的操作
* zookeeper
tar -xf zookeeper-3.4.9.tar.gz -C /usr/local
cd /usr/local
ln -sv zookeeper-3.4.9 zookeeper
mkdir -pv /data/zookeeper
cd /usr/local/zookeeper/conf
cp zoo_sample.cfg zoo.cfg
vim zoo.cfg
    tickTime=2000
    initLimit=10
    syncLimit=5
    dataDir=/data/zookeeper
    clientPort=2181
    server.1=10.5.5.19:2888:3888
    server.2=10.5.5.7:2888:3888
    server.3=10.5.5.2:2888:3888
scp zoo.cfg node2:/usr/local/zookeeper
scp zoo.cfg node3:/usr/local/zookeeper
cd /data/zookeeper
echo 1 > myid
//给zookeeper一个ID号，这个ID号与配置文件中的server.ID要一致。另两个节点要改为2和3。
cd /usr/local/zookeeper
bin/zkServer.sh start
//启动
bin/zkServer.sh status
//查看状态，如果是主节点，就显示leader，否则显示follower
./bin/zkCli.sh -server 10.5.5.2:2181
//连接到其他服务器上的zookeeper

* kafka
tar xf kafka_2.10-0.10.0.1.tgz -C /usr/local
cd /usr/local
ln -sv kafka_2.10-0.10.0.1 kafka
cd kafka
vim config/server.properties
    broker.id=0
    //三个节点的broker.id要不一样，不然另两个节点不能启动kafka
    port=9092
    host.name=10.5.5.2
    #本机的地址
    num.network.threads=3
    num.io.threads=8
    socket.send.buffer.bytes=102400
    socket.receive.buffer.bytes=102400
    socket.request.max.bytes=104857600
    log.dirs=/tmp/kafka-logs
    num.partitions=3
    num.recovery.threads.per.data.dir=3
    log.retention.hours=168
    log.segment.bytes=1073741824
    log.retention.check.interval.ms=300000
    zookeeper.connect=10.5.5.19:2181,10.5.5.7:2181,10.5.5.2:2181
    zookeeper.connection.timeout.ms=6000
bin/kafka-server-start.sh config/server.properties
//启动

* 创建主题
bin/kafka-topics.sh --create --zookeeper 10.5.5.232:2181 --replication-factor 3 --partitions 22 --topic inboundMsg
bin/kafka-topics.sh --create --zookeeper 10.5.5.232:2181 --replication-factor 3 --partitions 22 --topic outboundMsg
#创建3个副本，22个分区

* 测试
bin/kafka-run-class.sh kafka.tools.ConsumerOffsetChecker --broker-info --group inbound --topic inboundMsg --zookeeper 192.168.2.182:2181
#结果中的Lag是待消费的数量
watch '/usr/local/kafka/bin/kafka-consumer-groups.sh --new-consumer --bootstrap-server 192.168.2.182:9092 --group inbound --describe'
#如果是多个分区，用此命令
bin/kafka-topics.sh --describe --zookeeper 10.5.5.2:2181
#查看Topic；--zookeeper 为zk集群地址，使用任意一个节点都行
bin/kafka-topics.sh --list --zookeeper 10.5.5.7:2181
#查看Topic 列表
bin/kafka-console-producer.sh --broker-list 10.5.5.2:9092,10.5.5.7:9092,10.5.5.19:9092 --topic my-test
#在一个节点上创建生产者，在任意节点执行均可，之后输入一些内容
    abadfasdfas
bin/kafka-console-consumer.sh --bootstrap-server 10.5.5.2:9092,10.5.5.7:9092,10.5.5.19:9092 --from-beginning --topic my-test
#在另两个节点，创建消费者。--broker-server broker 节点列表，类似于上面的 --broker-list；即三台服务器节点列表，实际上写成其中一个、两个或者三个均可，中间逗号隔开；--from-beginning 表明从头获取，而不是从接入时间获取之后的消息
```



# redis

```shell
#准备三台主机
* 安装
yum install -y redis

* 配置
vim /etc/sudoers
    #Defaults requiretty
#注释上面一行
vim /etc/sudoers.d/redis
    redis ALL=(ALL) NOPASSWD:/sbin/ip,NOPASSWD:/sbin/arping
#这是为了让redis用户使用sudo命令时不用密码也可执行ip和arping命令。因为redis-sentinel进程是以redis身份运行的，所以执行脚本时也是redis用户，但redis用户是不能设置本机地址的，所以要给它权限。
vim /opt/notify_mymaster.sh
    #!/bin/bash
    #
    MASTER_IP=${6}
    LOCAL_IP='192.168.2.65'
    VIP='192.168.2.183'
    NETMASK='24'
    INTERFACE='ens160'
    if [ ${MASTER_IP} = ${LOCAL_IP} ];then
        sudo /usr/sbin/ip addr add ${VIP}/${NETMASK} dev ${INTERFACE}
        sudo /usr/sbin/arping -q -c 3 -A ${VIP} -I ${INTERFACE}
        exit 0
    else
       sudo /usr/sbin/ip addr del ${VIP}/${NETMASK} dev ${INTERFACE}
       exit 0
    fi
    exit 1
chmod +x /opt/notify_mymaster.sh
# /sbin是/usr/sbin的软链接
# 因为如果没有脚本或脚本没有执行权限，redis-sentinel服务就不能启动，所以提前设置。

* redis1
vim /etc/redis.conf
    bind 0.0.0.0
    #监听所有地址
systemctl start redis
redis-cli
    CONFIG SET requirepass redisqwer1234
    AUTH redisqwer1234
    CONFIG GET requirepass
    CONFIG SET masterauth redisqwer1234
    CONFIG REWRITE
#设置并查看认证密码

* redis2&3
vim /etc/redis.conf
    bind 0.0.0.0
systemctl start redis
redis-cli
    SLAVEOF 192.168.2.65 6379
    #指明主节点地址与端口
    CONFIG SET masterauth redisqwer1234
    #设置主节点的认证信息
    CONFIG SET requirepass redisqwer1234
    CONFIG REWRITE
#这里的三个节点都应该设置masterauth和requirepass的值，requirepass的值是自己作为主节点时，别人请求要用的认证密码。masterauth是与主节点通信时要用到的认证密码。也就是说，masterauth指向的密码就是requirepass设置的密码。因为三个节点都可以做主节点，所以都要设置。如果只设置一个，那么在主节点查看从节点信息时，有可能只显示一个。
#可在从节点查看/var/log/redis/redis.conf日志，日志中会显示不能加入集群的信息

* redis1
INFO replication
#查看状态信息，有slave0的信息，也就是从节点的信息。如：
    slave0:ip=192.168.2.62,port=6379,state=online,offset=212225,lag=1
    slave1:ip=192.168.2.65,port=6379,state=online,offset=212225,lag=1

* redis2&3
redis-cli
    CONFIG SET requirepass redisqwer1234
    AUTH redisqwer1234
    CONFIG REWRITE
#设置两个节点的认证信息与主节点一样，这是为了在从节点提升为主节点时的准备

* redis1
vim /etc/redis-sentinel.conf
    port 26379
    bind 0.0.0.0
    #这一项一定要加上，不然不能通过认证
    sentinel monitor mymaster 10.5.5.235 6379 2
    #sentinel监听主节点的地址和端口，2表示至少有几个sentinel进行选举才能通过
	sentinel auth-pass mymaster ccjd.redis.com
	#认证mymaster的主节点的密码，建议用随机字符串。如果不写此项就无法用sentinel slaves mymaster命令查看到从节点的信息
	sentinel down-after-milliseconds mymaster 5000
	#多久连接不到主节点就认为它宕机了，这是主观宕机。这里定义是30秒，可改为5000
	sentinel parallel-syncs mymaster 1
	#一次只给几个从节点同步。并行同步的数量
	sentinel failover-timeout mymaster 60000
	#故障转移多久完成不了，就进行新的转移。这个时间不要太短。这里是3分钟
	sentinel client-reconfig-script mymaster   /opt/notify_mymaster.sh
	#故障转移时执行notify_mymaster.sh脚本。加入这一行，sentinel的client-reconfig-script在每次执行时会传递出7个参数，第6个就是主redis的地址
scp /etc/redis-sentinel.conf redis2:/etc
scp /etc/redis-sentinel.conf redis3:/etc
systemctl start redis-sentinel
ss -tln
#监听26379端口
tail -f /var/log/redis/sentinel.log

* redis2&3
systemctl start redis-sentinel

* redis1
redis-cli -h 10.5.5.21 -p 26379
	SENTINEL master mymaster    
	#查看主节点状态
	SENTINEL slaves mymaster	
	#查看从节点状态
	SENTINEL failover mymaster	
	#切换主节点
	SENTINEL master mymaster
	SENTINEL failover mymaster
	#当再次切换时就很慢，停掉主节点的服务后还要等一会。可能与设置中的failover-timeout的时间是3分钟有关。
	SENTINEL get-master-addr-by-name mymaster
	#获得现在名称为mymaster主redis的IP和端口
```

