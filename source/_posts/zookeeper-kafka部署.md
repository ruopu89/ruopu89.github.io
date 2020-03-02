---
title: zookeeper&kafka部署
date: 2019-01-21 14:51:45
tags: zookeeper&kafka部署
categories: 消息队列
---

### kafka配置文件說明

#### Broker配置

```shell
# broker的全局唯一编号，不能重复
broker.id=0

# 用来监听链接的端口，producer或consumer将在此端口建立连接
port=9092

# 处理网络请求的线程数量，也就是接收消息的线程数。接收线程会将接收到的消息放到内存中，然后再从内存中写入磁盘。
num.network.threads=3

# 消息从内存中写入磁盘时使用的线程数量。用来处理磁盘IO的线程数量
num.io.threads=8

# 发送套接字的缓冲区大小
socket.send.buffer.bytes=102400

# 接受套接字的缓冲区大小
socket.receive.buffer.bytes=102400

# 请求套接字的缓冲区大小
socket.request.max.bytes=104857600

# kafka运行日志存放的路径
log.dirs=/export/servers/logs/kafka

# topic在当前broker上的分片个数。每個partition的備份個數，默認為1，建議根據實際條件選擇；如果這個值較大，意味著消息在各個server上同步時需要的延遲較高
num.partitions=2

# 我们知道segment文件默认会被保留7天的时间，超时的话就会被清理，那么清理这件事情就需要有一些线程来做。这里就是用来设置恢复和清理data下数据的线程数量
num.recovery.threads.per.data.dir=1

# segment文件保留的最长时间，默认保留7天（168小时），超时将被删除，也就是说7天之前的数据将被清理掉。
log.retention.hours=168

# 滚动生成新的segment文件的最大时间
log.roll.hours=168

# 日志文件中每个segment的大小，默认为1G
log.segment.bytes=1073741824

#上面的参数设置了每一个segment文件的大小是1G，那么就需要有一个东西去定期检查segment文件有没有达到1G，多长时间去检查一次，就需要设置一个周期性检查文件大小的时间（单位是毫秒）。
log.retention.check.interval.ms=300000

# 日志清理是否打开
log.cleaner.enable=true

# broker需要使用zookeeper保存meta数据，因此broker為zk client；此處為zookeeper集群的connectString，後面可以跟上path，比如hostname:port/chroot/kafka。不過需要注意，path的全路徑需要由自己來創建（使用zookeeper腳本工具）
zookeeper.connect=zk01:2181,zk02:2181,zk03:2181

# zookeeper链接超时时间
zookeeper.connection.timeout.ms=6000

# 上面我们说过接收线程会将接收到的消息放到内存中，然后再从内存写到磁盘上，那么什么时候将消息从内存中写入磁盘，就有一个时间限制（时间阈值）和一个数量限制（数量阈值），这里设置的是数量阈值，下一个参数设置的则是时间阈值。
# 为了减少磁盘写入的次数，broker会将消息暂时buffer起来，当消息的个数达到一定阀值或者过了一定的时间间隔时，再flush到磁盘，这样减少了磁盘IO调用的次数。
log.flush.interval.messages=10000

# 消息buffer的时间，达到阈值，将触发将消息从内存flush到磁盘，单位是毫秒。
log.flush.interval.ms=3000

# 删除topic需要server.properties中设置delete.topic.enable=true否则只是标记删除
delete.topic.enable=true

# 此处的host.name为本机IP(重要),如果不改,则客户端会抛出：Producer connection to localhost:9092 unsuccessful 错误！指定broker實例綁定的網絡接口地址
host.name=kafka01

# partition leader等待follower同步消息的最大時間，如果超時，leader將follower移除同步列表
replica.lag.time.max.ms=10000

# 允許follower落後的最大消息條數，如果達到閾值，將follower移除同步列表
#replica.lag.max.message=4000

# 消息的備份的個數，默認為1
num.replica.fetchers=1

advertised.host.name=192.168.239.128
```



#### Consumer主要配置

```shell
# 消费者集群通过连接Zookeeper来找到broker。
# zookeeper连接服务器地址
# consumer作為zookeeper client，需要通過zk保存一些meta信息，此處為zk connectString
zookeeper.connect=zk01:2181,zk02:2181,zk03:2181

# zookeeper的session过期时间，默认5000ms，用于检测消费者是否挂掉
zookeeper.session.timeout.ms=5000

# 当消费者挂掉，其他消费者要等该指定时间才能检查到并且触发重新负载均衡
zookeeper.connection.timeout.ms=10000

# 这是一个时间阈值。指定多久消费者更新offset到zookeeper中。注意offset更新时基于time而不是每次获得的消息。一旦在更新zookeeper发生异常并重启，将可能拿到已拿到过的消息
zookeeper.sync.time.ms=2000

# 當前消費者的group名稱，需要指定
group.id=xxxxx

# 这是一个数量阈值，经测试是500条。当consumer消费一定量的消息之后,将会自动向zookeeper提交offset信息。注意offset信息并不是每消费一次消息就向zk提交一次,而是现在本地保存(内存),并定期提交,默认为true
auto.commit.enable=true

# 自动更新时间。默认60 * 1000
auto.commit.interval.ms=60*1000

# 当前consumer的标识,可以设定,也可以有系统生成，主要用来跟踪消息消费情况，便于观察
conusmer.id=xxx

# 消费者客户端编号，用于区分不同客户端，默认客户端程序自动产生
client.id=xxxx

# 最大取多少块缓存到消费者(默认10)
queued.max.message.chunks=50

# 当有新的consumer加入到group时,将会reblance，此后将会有partitions的消费端迁移到新的consumer上，如果一个consumer获得了某个partition的消费权限，那么它将会向zk注册 "Partition Owner registry"节点信息，但是有可能此时旧的consumer尚没有释放此节点，此值用于控制，注册节点的重试次数。
rebalance.max.retries=5

# 每拉取一批消息的最大字节数。获取消息的最大尺寸，broker不会像consumer输出大于此值的消息chunk每次feth将得到多条消息，此值为总大小，提升此值,将会消耗更多的consumer端内存
fetch.min.bytes=6553600

# 当消息的尺寸不足时，server阻塞的时间，如果超时，消息将立即发送给consumer。数据一批一批到达，如果每一批是10条消息，如果某一批还不到10条，但是超时了，也会立即发送给consumer。
fetch.wait.max.ms=5000
socket.receive.buffer.bytes=655360

# 如果zookeeper没有offset值或offset值超出范围。那么就给个初始的offset。有smallest、largest、anything可选，分别表示给当前最小的offset、当前最大的offset、抛异常。默认largest
auto.offset.reset=smallest

# 指定序列化处理类
derializer.class=kafka.serializer.DefaultDecoder

# 獲取消息的最大尺寸，broker不會像consumer輸出大於此值的消息chunk。每次fetch將得到多條消息，此值為總大小
fetch.messages.max.bytes=1024*1024
```



#### Producer主要配置

```shell
# 指定kafka节点列表，用于获取metadata，不必全部指定
#需要kafka的服务器地址，来获取每一个topic的分片数等元数据信息。
#對於開發者而言，需要通過broker.list指定當前producer需要關注的broker列表，producer通過和每個broker連接，並獲取partitions，如果某個broker連接失敗，將導致此上的partitions無法繼續發佈消息。格式：host1:port,host2:port，其中host:port需要參考broker配置文件。對於producer而言沒有使用zookeeper自動發現broker列表，非常奇怪。
metadata.broker.list=kafka01:9092,kafka02:9092,kafka03:9092

#生产者生产的消息被发送到哪个block，需要一个分组策略。
#指定分区处理类。默认kafka.producer.DefaultPartitioner，表通过key哈希到对应分区
#partitions路由類，消息在發送時將根據此實例的方法獲得partition索引號
#partitioner.class=kafka.producer.DefaultPartitioner

#生产者生产的消息可以通过一定的压缩策略（或者说压缩算法）来压缩。消息被压缩后发送到broker集群，
#而broker集群是不会进行解压缩的，broker集群只会把消息发送到消费者集群，然后由消费者来解压缩。
#是否压缩，默认0表示不压缩，1表示用gzip压缩，2表示用snappy压缩。
#压缩后消息中会有头来指明消息压缩类型，故在消费者端消息解压是透明的无需指定。
#文本数据会以1比10或者更高的压缩比进行压缩。
compression.codec=none

#指定序列化处理类，消息在网络上传输就需要序列化，它有String、数组等许多种实现。將消息實體轉換成byte[]
serializer.class=kafka.serializer.DefaultEncoder
key.serializer.class=${serializer.class}


#如果要压缩消息，这里指定哪些topic要压缩消息，默认empty，表示不压缩。
#如果上面启用了压缩，那么这里就需要设置
#compressed.topics= 
#这是消息的确认机制，默认值是0。在面试中常被问到。
#producer有个ack参数，有三个值，分别代表：
#（1）不在乎是否写入成功；
#（2）写入leader成功；
#（3）写入leader和所有副本都成功；
#要求非常可靠的话可以牺牲性能设置成最后一种。
#为了保证消息不丢失，至少要设置为1，也就
#是说至少保证leader将消息保存成功。
#设置发送数据是否需要服务端的反馈,有三个值0,1,2，分别代表3种状态：
#0: producer不会等待broker发送ack。生产者只要把消息发送给broker之后，就认为发送成功了，这是第1种情况；
#1: 当leader接收到消息之后发送ack。生产者把消息发送到broker之后，并且消息被写入到本地文件，才认为发送成功，这是第二种情况；
#2: 当所有的follower都同步消息成功后发送ack。不仅是主的分区将消息保存成功了，而且其所有的分区的副本数也都同步好了，才会被认为发动成功，这是第3种情况。
request.required.acks=0

#broker必须在该时间范围之内给出反馈，否则失败。
#在向producer发送ack之前,broker允许等待的最大时间 ，如果超时,
#broker将会向producer发送一个error ACK.意味着上一次消息因为某种原因
#未能成功(比如follower未能同步成功)
request.timeout.ms=10000

#生产者将消息发送到broker，有两种方式，一种是同步，表示生产者发送一条，broker就接收一条；
#还有一种是异步，表示生产者积累到一批的消息，装到一个池子里面缓存起来，再发送给broker，
#这个池子不会无限缓存消息，在下面，它分别有一个时间限制（时间阈值）和一个数量限制（数量阈值）的参数供我们来设置。
#一般我们会选择异步。
#同步还是异步发送消息，默认“sync”表同步，"async"表异步。异步可以提高发送吞吐量,
#也意味着消息将会在本地buffer中,并适时批量发送，但是也可能导致丢失未发送过去的消息
producer.type=sync

#在async模式下,当message被缓存的时间超过此值后,将会批量发送给broker,
#默认为5000ms
#此值和batch.num.messages协同工作.
queue.buffering.max.ms = 5000

#异步情况下，缓存中允许存放消息数量的大小。
#在async模式下,producer端允许buffer的最大消息量
#无论如何,producer都无法尽快的将消息发送给broker,从而导致消息在producer端大量沉积
#此时,如果消息的条数达到阀值,将会导致producer端阻塞或者消息被抛弃，默认为10000条消息。
queue.buffering.max.messages=20000

#如果是异步，指定每次批量发送数据量，默认为200
#消息在producer端buffer的條數，僅在producer.type=async下有效
batch.num.messages=500

#在生产端的缓冲池中，消息发送出去之后，在没有收到确认之前，该缓冲池中的消息是不能被删除的，
#但是生产者一直在生产消息，这个时候缓冲池可能会被撑爆，所以这就需要有一个处理的策略。
#有两种处理方式，一种是让生产者先别生产那么快，阻塞一下，等会再生产；另一种是将缓冲池中的消息清空。
#当消息在producer端沉积的条数达到"queue.buffering.max.meesages"后阻塞一定时间后,
#队列仍然没有enqueue(producer仍然没有发送出任何消息)
#此时producer可以继续阻塞或者将消息抛弃,此timeout值用于控制"阻塞"的时间
#-1: 不限制阻塞超时时间，让produce一直阻塞,这个时候消息就不会被抛弃
#0: 立即清空队列,消息被抛弃
queue.enqueue.timeout.ms=-1


#当producer接收到error ACK,或者没有接收到ACK时,允许消息重发的次数
#因为broker并没有完整的机制来避免消息重复,所以当网络异常时(比如ACK丢失)
#有可能导致broker接收到重复的消息,默认值为3.
message.send.max.retries=3

#producer刷新topic metada的时间间隔,producer需要知道partition leader
#的位置,以及当前topic的情况
#因此producer需要一个机制来获取最新的metadata,当producer遇到特定错误时,
#将会立即刷新
#(比如topic失效,partition丢失,leader失效等),此外也可以通过此参数来配置
#额外的刷新机制，默认值600000
topic.metadata.refresh.interval.ms=60000
```

> 以上是关于kafka一些基础说明，在其中我们知道如果要kafka正常运行，必须配置zookeeper，否则无论是kafka集群还是客户端的生产者和消费者都无法正常的工作



### zookeeper集群部署
> zookeeper是一个为分布式应用提供一致性服务的软件，它是开源的Hadoop项目的一个子项目，并根据google发表的一篇论文来实现的。zookeeper为分布式系统提供了高效且易于使用的协同服务，它可以为分布式应用提供相当多的服务，诸如统一命名服务，配置管理，状态同步和组服务等。zookeeper接口简单，我们不必过多地纠结在分布式系统编程难于处理的同步和一致性问题上，你可以使用zookeeper提供的现成(off-the-shelf)服务来实现分布式系统额配置管理，组管理，Leader选举等功能。



```shell
準備三台主機，主機名分別為kafka1(10.5.5.19)、kafka2(10.5.5.24)、kafka3(10.5.5.155)。

* kafka1
到http://zookeeper.apache.org/releases.html去下载zookeeper。这里需要注意，下载的3.5.5和3.5.6
版本中没有zookeeper-***.jar包，所以启动zookeeper会提示:
"Could not find or load main class org.apache.zookeeper.server.quorum.QuorumPeerMain"。
测试下载的3.4.14版本没有问题。也许是不会使用的原因

yum install java-1.8.0-openjdk-devel
# zookeeper依賴java
tar -zxvf zookeeper-3.4.9.tar.gz -C /usr/local
# 解壓安裝
cd /usr/local
ln -sv zookeeper-3.4.9 zookeeper
cd zookeeper/conf
cp zoo_sample.cfg zoo.cfg
vim zoo.cfg
	tickTime=2000
    initLimit=10
    syncLimit=5
    dataDir=/usr/local/zookeeper/data
    dataLogDir=/usr/local/zookeeper/logs
    clientPort=2181
    server.1=10.5.5.19:2888:3888
    server.2=10.5.5.24:2888:3888
    server.3=10.5.5.155:2888:3888
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
cd
scp zookeeper-3.4.9.tar.gz 10.5.5.24:/root
scp zookeeper-3.4.9.tar.gz 10.5.5.155:/root
vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
chmod +x /etc/profile.d/java.sh
. /etc/profile.d/java.sh
java -version
scp /etc/profile.d/java.sh 10.5.5.24:/etc/profile.d
scp /etc/profile.d/java.sh 10.5.5.155:/etc/profile.d
scp /usr/local/zookeeper/conf/zoo.cfg root@10.5.5.24:/usr/local/zookeeper/conf/
scp /usr/local/zookeeper/conf/zoo.cfg root@10.5.5.155:/usr/local/zookeeper/conf/

* kafka2&kafka3
yum install java-1.8.0-openjdk-devel
cd /root
tar xf zookeeper-3.4.9.tar.gz -C /usr/local/
cd /usr/local/
ln -sv zookeeper-3.4.9 zookeeper
cd zookeeper
mkdir {data,logs}
cd data/
echo 2 > myid
# kafka3這裡改為echo 3 > myid
. /etc/profile.d/java.sh
java -version

* 三台主機
cd /usr/local/zookeeper/bin
./zkServer.sh start
# 啟動zookeeper
ss -tln
# 這時只有leader節點會監聽2888端口，另外兩台是不監聽的。三台主機都會監聽2181和3888端口
./zkCli.sh -server 10.5.5.19:2181
# 這裡如果連接的是本機的zookeeper可以不用參數和地址，連接集群中其他zookeeper需要。
```



### kafka集群部署

```shell
使用生產環境kafka包，版本：kafka_2.12-0.10.2.0。三台主機的操作相同

cd /root
tar xf kafka_2.12-0.10.2.0.tgz -C /usr/local
cd /usr/local
ln -sv kafka_2.12-0.10.2.0 kafka
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
    zookeeper.connect=10.5.5.19:2181,10.5.5.24:2181,10.5.5.155:2181
# zookeeper集群內的所有地址都寫入
    zookeeper.connection.timeout.ms=6000
# 配置文件基本使用默認配置，之後會再查看配置文件詳細設置
mkdir /usr/local/kafka/logs
cd /usr/local/kafka/bin
nohup ./kafka-server-start.sh ../config/server.properties &
ss -tln
# 這時應該監聽了默認端口9092
vim /etc/hosts
10.5.5.19   kafka1
10.5.5.24	kafka2
10.5.5.155	kafka3
# 这里添加可以让三台主机互相通过主机名解析
```



### zookeeper命令

```shell
./zkServer.sh start
# 啟動zookeeper
./zkServer.sh status
# 查看當前zookeeper是leader還是follower
./zkServer.sh stop
# 停止zookeeper
./zkCli.sh
# zookeeper客戶端，連接當前主機上的zookeeper
./zkCli.sh -server IP:port
# 连接远端服务
[root@kafka3 zookeeper]# bin/zkCli.sh 
Connecting to localhost:2181
[zk: localhost:2181(CONNECTED) 0] ls /
[cluster, controller, controller_epoch, brokers, zookeeper, admin, isr_change_notification, consumers, config]
[zk: localhost:2181(CONNECTED) 1] ls /brokers
[ids, topics, seqid]
[zk: localhost:2181(CONNECTED) 2] ls /brokers/topics
[test]
[zk: localhost:2181(CONNECTED) 3] ls /brokers/ids   
[0, 1, 2]
[zk: localhost:2181(CONNECTED) 7] get /brokers/ids/0
{"listener_security_protocol_map":{"PLAINTEXT":"PLAINTEXT"},"endpoints":["PLAINTEXT://192.168.1.14:9092"],"jmx_port":-1,"host":"192.168.1.14","timestamp":"1548120711670","port":9092,"version":4}
cZxid = 0x10000001c
ctime = Tue Jan 22 09:31:51 CST 2019
mZxid = 0x10000001c
mtime = Tue Jan 22 09:31:51 CST 2019
pZxid = 0x10000001c
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x2687326f51f0000
dataLength = 194
numChildren = 0
```



### kafka命令

#### 創建topic

```shell
[root@kafka1 bin]# ./kafka-topics.sh --create --zookeeper 192.168.1.14:2181 --replication-factor 1 --partitions 3 --topic test
Created topic "test".
# 創建topic，--create表示創建，--zookeeper指明zookeeper地址，--topic指定topic名稱，--replication-factor指定副本的數量，--partitions指定分區的數量。--if-not-exists表示如果topic不存在就創建。創建的副本的數量不能大於broker，不然會有錯誤提示“Error while executing topic command : replication factor: 4 larger than available brokers: 2”
[root@kafka3 kafka]# ls logs/
cleaner-offset-checkpoint  log-cleaner.log                   server.log.2019-01-22-09
controller.log             meta.properties                   state-change.log
kafka-authorizer.log       recovery-point-offset-checkpoint  test-0
kafka-request.log          replication-offset-checkpoint     test-3
kafkaServer-gc.log         server.log
# 在创建topic后，可以在/usr/local/kafka/logs目录查看到分区的目录
```



#### 查看topic

```shell
[root@kafka1 bin]# ./kafka-topics.sh --list --zookeeper localhost:2181
test
# 查看所有的topic
[root@kafka1 bin]# ./kafka-topics.sh --describe --zookeeper 192.168.1.15:2181
# 查看所有topic的详细信息
[root@kafka1 bin]# ./kafka-topics.sh --describe --zookeeper 192.168.1.15:2181 --topic test
Topic:test      PartitionCount:3        ReplicationFactor:1     Configs:
        Topic: test     Partition: 0    Leader: 2       Replicas: 2     Isr: 2
        Topic: test     Partition: 1    Leader: 0       Replicas: 0     Isr: 0
        Topic: test     Partition: 2    Leader: 1       Replicas: 1     Isr: 1
# 查看指定topic情況。列出了lx_test_topic的parition数量、replica因子以及每个partition的leader、replica信息
# PartitionCount：topic对应的partition的个数
# ReplicationFactor：topic对应的副本因子，说白就是副本个数
# Partition：partition编号，从0开始递增
# Leader：当前partition起作用的breaker.id
# Replicas: 当前副本数据坐在的breaker.id，是一个列表，排在最前面的起作用
# Isr：当前kakfa集群中可用的breaker.id列表  
```



#### 增加topic分區

```shell
[root@kafka1 bin]# ./kafka-topics.sh --zookeeper localhost:2181 --alter --topic test --partitions 4
WARNING: If partitions are increased for a topic that has a key, the partition logic or ordering of the messages will be affected
Adding partitions succeeded!
# 給現有的topic添加分區，使用--alter選項，在命令中不能加--replication-factor選項，不然會報錯。另外，分区的数量只能增加
```



#### 創建生產者

```shell
[root@kafka1 bin]# ./kafka-console-producer.sh --broker-list 192.168.1.15:9092,192.168.1.13:9092 --topic test
abc
# 創建生產者，這時終端會等待用戶輸入信息
```



#### 創建消費者

```shell
[root@kafka2 bin]# ./kafka-console-consumer.sh --zookeeper 192.168.1.14:2181 --topic test --from-beginning
Using the ConsoleConsumer with old consumer is deprecated and will be removed in a future major release. Consider using the new consumer by passing [bootstrap-server] instead of [zookeeper].
abc
# 創建消費者，創建後終端會等待生產者生產消息。在生產者終端輸入信息後，消費者終端會顯示生產者輸入的消息，這表示消費者消費了。如果有多個地址，地址間要用逗號隔開。
=======================================
# 2.12版本
 ./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test1 --from-beginning
# 三台主机的集群，kafka1、kafka2、kafka3，kafka2创建生产者，地址指定为kafka1，kafka2创建消费者。
./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test1 --group nginxlog --from-beginning
# 指定存在的组来消息信息，没有测试这个消息组是不是必须事先存在
```



#### 查看消費者列表/查看消息堆积

```shell
查看consumer group列表有新、旧两种命令，分别查看新版(信息保存在broker中)consumer列表和老版(信息保存在zookeeper中)consumer列表，因而需要区分指定bootstrap--server和zookeeper参数：
[root@kafka3 bin]# ./kafka-consumer-groups.sh --new-consumer --bootstrap-server 127.0.0.1:9092 --list
Note: This will only show information about consumers that use the Java consumer API (non-ZooKeeper-based consumers).
[root@kafka3 bin]# ./kafka-consumer-groups.sh --zookeeper 127.0.0.1:2181 --list
Note: This will only show information about consumers that use ZooKeeper (not those using the Java consumer API).

console-consumer-6777
--------------------------------------------
# 查看特定consumer group 详情，使用--group与--describe参数
--------------------------------------------
bin/kafka-run-class.sh kafka.tools.ConsumerOffsetChecker --broker-info --group inbound --topic inboundMsg --zookeeper 192.168.2.182:2181
# 结果中的Lag是待消费的数量。这是按topic查询堆积情况
watch '/usr/local/kafka/bin/kafka-consumer-groups.sh --new-consumer --bootstrap-server 192.168.2.182:9092 --group inbound --describe'
# 如果是多个分区，用此命令
--------------------------------------------
[root@kafka1 bin]# ./kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092  --group nginxlog --members
# 查看消费者数量

[root@kafka1 bin]# ./kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
# 查看有几个消费者组

[root@kafka1 bin]# ./kafka-consumer-groups.sh --bootstrap-server 192.168.1.17:9092 --group nginxlog --describe
# 这是按消费者组来查询堆积情况，结果中会显示这个组中包括的所有topic
TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                                     HOST            CLIENT-ID
nginxlog        0          5407            5407            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
nginxlog        1          5406            5406            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
nginxlog        2          5405            5405            0               logstash-0-719c3537-8c50-472d-aa3b-ab0e6f3d8498 /192.168.1.14   logstash-0
# 查看kafka的消息堆积情况，可以加上watch命令。不知是否与上面提到的hosts文件是否有关，最好加上可以解析
# kafka主机名。这里的kafka的组名是在logstash的配置文件中创建的。
```



#### 查看kafka日誌

```shell
[root@kafka3 bin]# ./kafka-run-class.sh kafka.tools.DumpLogSegments
# 我们可以看到都需要哪些参数，根据不同的需求我们可以选择不同的参数。
[root@kafka3 bin]# ./kafka-run-class.sh kafka.tools.DumpLogSegments --files /usr/local/kafka/logs/test-0/00000000000000000000.log --print-data-log
Dumping /usr/local/kafka/logs/test-0/00000000000000000000.log
Starting offset: 0
offset: 0 position: 0 CreateTime: 1548121485387 isvalid: true payloadsize: 3 magic: 1 compresscodec: NONE crc: 3938834414 payload: abc
# 这里--print-data-log 是表示查看消息内容的，不加此项是查看不到详细的消息内容。如果要查看多个log文件可以用逗号分隔。
```



#### 刪除topic

```shell
vim server.properties
	delete.topic.enable=true
kill -9 kafka
zkServer.sh restart
# 修改配置文件後要重啟zookeeper和kafka
zkCli.sh
rmr /brokers/topic/topic-name
# 進入zookeeper中再刪除topic
```



### kafka测试

```shell
* 测试生产者
[root@kafka1 kafka]# bin/kafka-topics.sh --create --zookeeper localhost:2181 --topic test-rep-one --partitions 6 --replication-factor 1      
Created topic "test-rep-one".
# 创建一个六分区一个副本的topic
[root@kafka1 kafka]# bin/kafka-producer-perf-test.sh --num-records 500000 --throughput 100000 --record-size 3000 --topic testtest-rep-one --producer-props bootstrap.servers=192.168.1.14:9092,192.168.1.15:9092,192.168.1.13:9092
...
51490 records sent, 10298.0 records/sec (29.46 MB/sec), 997.3 ms avg latency, 1031.0 max latency.
52075 records sent, 10415.0 records/sec (29.80 MB/sec), 982.8 ms avg latency, 1019.0 max latency.
500000 records sent, 10366.131774 records/sec (29.66 MB/sec), 971.63 ms avg latency, 1033.00 ms max latency, 988 ms 50th, 1014 ms 95th, 1022 ms 99th, 1028 ms 99.9th.
# --num-records：要生成的消息数
# --throughput：将最大消息吞吐量限制为*大约*吞吐量消息/秒，也就是每秒发送多少条数据
# --record-size：消息大小（字节）。注意，您必须只提供一个--record-size或--payload文件。
# --topic：指定主题
# --producer-props：kafka生产者相关的配置属性，如bootstrap。 servers，client.id等。这些配置优先于通过--producer.config传递的配置。
# bootstrap.servers：指定kafka地址与端口

* 测试消费者
bin/kafka-consumer-perf-test.bot --messages 1000000 --threads 1 --zookeeper 192.168.1.14:2181 --num-fetch-threads 3 --topic test
# --messages：消费多少消息
# --threads：线程数量
# --zookeeper：zookeeper的地址
# --num-fetch-threads：摘取数据的线程数量，即消费者的数量
```



### 附錄

```
Kafka is a distributed,partitioned,replicated commit logservice
卡夫卡是一个分布式的，分区的，复制提交的日志服务
distributed[dɪ'strɪbjʊtɪd]	adj. 分布式的，分散式的
partitioned adj. 分割的；分区的；分段的
replicated 重复的
topic n. 主题（等于theme）；题目；
partition n. 划分，分开；[数] 分割；隔墙；隔离物
append 添加；附加
offset 偏移
anatomy of a topic
解剖一个主题
anatomy[ə'nætəmɪ]	n. 解剖；解剖学；剖析；骨骼
consumer n. 消费者；用户，顾客
producer[prə'djuːsə] n. 制作人，制片人；生产者；发生器
replica['replɪkə] n. 复制品，复制物
queue[kjuː] n. 队列；长队；辫子
guarantee[,ɡærən'ti] n. 保证；担保；保证人；保证书；抵押品
replication factor 複製因子
factor['fæktə] n. 因素；要素；[物] 因数；代理人
Websit activity tracking 網絡活動追蹤
activity[ækˈtɪvətɪ] n. 活动；行动；活跃
Log Aggregation 日誌收集
aggregation[,æɡrɪ'ɡeɪʃən] n. [地质][数] 聚合，聚集；聚集体，集合体
fetch[fetʃ] vi. 拿；取物；
push[pʊʃ] n. 推
pull[pʊl] n. 拉
batch fetch 批量獲取
batch[bætʃ] n. 一批
provider[prə'vaɪdə] n. 供应者；养家者
exactly once 恰一次
exactly[ɪɡ'zæktli]  adv. 恰好地；正是；精确地；正确地
at most once 最多一次
at least once 至少一次
up to date 最新的
log entry　日誌條目
entry[ˈentrɪ] n. 进入；入口；条目；登记；报关手续；对土地的侵占
segment['segm(ə)nt] n. 段；部分
chunk[tʃʌŋk] 數據塊
copy on write 寫入時複製
meta['metə] 元
Broker node registry Broker節點註冊
registry['redʒɪstrɪ] n. 注册；登记处；挂号处；船舶的国籍
stream[striːm] n. 溪流；流动；潮流；光线
balance['bæl(ə)ns] n. 平衡；余额；匀称
off the shelf 現成的
shelf[ʃelf] n. 架子；搁板；搁板状物；暗礁
chubby['tʃʌbɪ] adj. 圆胖的，丰满的 [ 比较级 chubbier 最高级 chubbiest ]
election[ɪ'lekʃ(ə)n] n. 选举；当选；选择权；上帝的选拔
discovery[dɪ'skʌv(ə)rɪ] n. 发现，发觉；被发现的事物
broadcast['brɔːdkɑːst] n. 广播；播音；广播节目
random['rændəm] adj. [数] 随机的；任意的；胡乱的
controller[kən'trəʊlə]	n. 控制器；管理员
proposal[prəˈpəuzəl] n. 提议;建议; 求婚; 〈美〉投标;
epoch[ˈi:pɔk] n. 纪元;时期;新时代;世;
failover[feɪl'əʊvər] n.
[电脑][数据库]失效备援 （为系统备援能力的一种，当系统中其中一项设备失效而无法运作时，另一项设备即可自动接手原失效系统所执行的工作）
persist[pəˈsist] v. 坚持;   固执;   存留;   继续存在; 
ephemeral[ɪˈfemərəl] adj. 短暂的，瞬息的;   朝露;   一年生;   朝生暮死;
sequence[ˈsi:kwəns]	n. [数]数列，序列;   顺序;   连续;   片断插曲; 
split brain[split][brein] 脑裂
split n. 划分;   分歧;   裂缝;   劈叉; 
brain n. 脑;   智慧;   聪明的人;   （群体中）最聪明的人;  
```