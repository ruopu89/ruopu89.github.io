---
title: MongoDB 复制
date: 2019-03-06 16:45:39
tags: MongoDB复制
categories: MongoDB
---

### 概念

> MongoDB复制是将数据同步在多个服务器的过程。复制提供了数据的冗余备份，并在多个服务器上存储数据副本，提高了数据的可用性， 并可以保证数据的安全性。复制还允许您从硬件故障和服务中断中恢复数据。
>
> 复制可实现保障数据的安全性、数据高可用性(24*7)、灾难恢复、无需停机维护(如备份，重建索引，压缩)、分布式读取数据
>
> Mongodb一共有三种集群搭建的方式：
>
> 1. Replica Set（副本集）
> 2. Sharding（切片）
> 3. Master-Slaver（主从，目前已不推荐使用了）
>
> 其中，Sharding集群也是三种集群中最复杂的。副本集比起主从可以实现故障转移
>
> mongoDB目前已不推荐使用主从模式，取而代之的是副本集模式。副本集是一种互为主从的关系，可理解为主主。副本集指将数据复制，多份保存，不同服务器保存同一份数据，在出现故障时自动切换。对应的是数据冗余、备份、镜像、读写分离、高可用性等关键词；
>
> 而分片则指为处理大量数据，将数据分开存储，不同服务器保存不同的数据，它们的数据总和即为整个数据集。追求的是高性能。
>
> 在生产环境中，通常是这两种技术结合使用，分片+副本集。



### 复制原理

> mongodb的复制至少需要两个节点。其中一个是主节点，负责处理客户端请求，其余的都是从节点，负责复制主节点上的数据。
>
> mongodb各个节点常见的搭配方式为：一主一从、一主多从。
>
> 在主从结构中，主节点的操作记录成为oplog（operation log）。oplog存储在一个系统数据库local的集合oplog.$main中，这个集合的每个文档都代表主节点上执行的一个操作。
> 从服务器会定期从主服务器中获取oplog记录，然后在本机上执行！对于存储oplog的集合，MongoDB采用的是固定集合，也就是说随着操作过多，新的操作会覆盖旧的操作！
>
> 集群功能：
>
> 1. N个节点的集群
> 2. 任何节点都可作为主节点
> 3. 所有写入操作都在主节点上
> 4. 自动故障转移
> 5. 自动恢复



### 副本集概念

> mongodb不推荐主从复制，推荐建立副本集(Replica Set)来保证一个服务挂了，可以有其他服务顶上，程序正常运行，几个服务的数据都是一样的，后台自动同步。主从复制其实就是一个单副本的应用，没有很好的扩展性和容错性。然而副本集具有多个副本保证了容错性，就算一个副本挂掉了还有很多个副本存在，并且解决了"主节点挂掉后，整个集群内会自动切换"的问题。副本集比传统的Master-Slave主从复制有改进的地方就是它可以进行故障的自动转移，如果我们停掉复制集中的一个成员，那么剩余成员会再自动选举一个成员，作为主库。
> Replica Set 使用的是 n 个 mongod 节点，构建具备自动的容错功能(auto-failover)，自动恢复的(auto-recovery)的高可用方案。使用 Replica Set 来实现读写分离。通过在连接时指定或者在主库指定 slaveOk，由Secondary 来分担读的压力，Primary 只承担写操作。对于 Replica Set 中的 secondary 节点默认是不可读的。
>
> 副本集是一种在多台机器同步数据的进程，副本集提供了数据冗余，扩展了数据可用性。在多台服务器保存数据可以避免因为一台服务器导致的数据丢失。也可以从硬件故障或服务中断解脱出来，利用额外的数据副本，可以从一台机器致力于灾难恢复或者备份。
>
> 在一些场景，可以使用副本集来扩展读性能，客户端有能力发送读写操作给不同的服务器。也可以在不同的数据中心获取不同的副本来扩展分布式应用的能力。
> mongodb副本集是一组拥有相同数据的mongodb实例，主mongodb接受所有的写操作，所有的其他实例可以接受主实例的操作以保持数据同步。
> 主实例接受客户的写操作，副本集只能有一个主实例，因为为了维持数据一致性，只有一个实例可写，主实例的日志保存在oplog。
>
> 二级节点复制主节点的oplog然后在自己的数据副本上执行操作，二级节点是主节点数据的反射，如果主节点不可用，会选举一个新的主节点。
> 默认读操作是在主节点进行的，但是可以指定读取首选项参数来指定读操作到副本节点。
> 可以添加一个额外的仲裁节点（不拥有被选举权），使副本集节点保持奇数，确保可以选举出票数不同的主接点。仲裁者并不需要专用的硬件设备。仲裁者节点一直会保存仲裁者身份
>
> 副本节点同步直接点操作是异步的，然而会导致副本集无法返回最新的数据给客户端程序。
>
> 如果主节点10s以上与其他节点失去通信，其他节点将会选举新的节点作为主节点。拥有大多数选票的副节点会被选举为主节点。副本集提供了一些选项给应用程序，可以做一个成员位于不同数据中心的副本集。也可以指定成员不同的优先级来控制选举。



### 副本集的结构及原理

> MongoDB 的副本集不同于以往的主从模式。在集群Master故障的时候，副本集可以自动投票，选举出新的Master，并引导其余的Slave服务器连接新的Master，而这个过程对于应用是透明的。可以说MongoDB的副本集是自带故障转移功能的主从复制。
>
> 传统的主从模式，需要手工指定集群中的 Master。如果 Master 发生故障，一般都是人工介入，指定新的 Master。 这个过程对于应用一般不是透明的，往往伴随着应用重新修改配置文件，重启应用服务器等。而 MongoDB 副本集，集群中的任何节点都可以成为 Master 节点。一旦 Master 节点故障，则会在其余节点中选举出一个新的 Master 节点。 并引导剩余节点连接到新的 Master 节点。这个过程对于应用是透明的。
>
> 一个副本集就是服务于同一数据集的多个 MongoDB 实例，其中一个为主节点，其余的都为从节点。主节点上能够完成读写操作，从节点仅能用于读操作。主节点需要记录所有改变数据库状态的操作，这些记录保存在 oplog 中，这个文件存储在 local 数据库，各个从节点通过此 oplog 来复制数据并应用于本地，保持本地的数据与主节点的一致。oplog 具有幂等性，即无论执行几次其结果一致，这个比 mysql 的二进制日志更好用。
> 集群中的各节点还会通过传递心跳信息来检测各自的健康状况。当主节点故障时，多个从节点会触发一次新的选举操作，并选举其中的一个成为新的主节点(通常谁的优先级更高,谁就是新的主节点)，心跳信息默认每 2 秒传递一次。
>
> 客户端连接到副本集后，不关心具体哪一台机器是否挂掉。主服务器负责整个副本集的读写，副本集定期同步数据备份。一旦主节点挂掉，副本节点就会选举一个新的主服务器。这一切对于应用服务器不需要关心。
>
> 心跳检测
> 整个集群需要保持一定的通信才能知道哪些节点活着哪些节点挂掉。mongodb节点会向副本集中的其他节点每两秒就会发送一次pings包，如果其他节点在10秒钟之内没有返回就标示为不能访问。每个节点内部都会维护一个状态映射表，表明当前每个节点是什么角色、日志时间戳等关键信息。如果是主节点，除了维护映射表外还需要检查自己能否和集群中内大部分节点通讯，如果不能则把自己降级为secondary只读节点。
>
> 数据同步
> 副本集同步分为初始化同步和keep复制。初始化同步指全量从主节点同步数据，如果主节点数据量比较大同步时间会比较长。而keep复制指初始化同步过后，节点之间的实时同步一般是增量同步。初始化同步不只是在第一次才会被触发，有以下两种情况会触发：
>
> 1. secondary第一次加入，这个是肯定的。
> 2. secondary落后的数据量超过了oplog的大小，这样也会被全量复制。
>
> 副本集中的副本节点在主节点挂掉后通过心跳机制检测到后，就会在集群内发起主节点的选举机制，自动选举出一位新的主服务器。
>
> 副本集包括三种节点:主节点、从节点、仲裁节点。
>
> 1. 主节点负责处理客户端请求，读、写数据，记录在其上所有操作的 oplog；
> 2. 从节点定期轮询主节点获取这些操作，然后对自己的数据副本执行这些操作，从而保证从节点的数据与主节点一致。默认情况下，从节点不支持外部读取，但可以设置；副本集的机制在于主节点出现故障的时候，余下的节点会选举出一个新的主节点，从而保证系统可以正常运行。
> 3. 仲裁节点不复制数据，仅参与投票。由于它没有访问的压力，比较空闲，因此不容易出故障。由于副本集出现故障的时候，存活的节点必须大于副本集节点总数的一半，否则无法选举主节点，或者主节点会自动降级为从节点，整个副本集变为只读。因此，增加一个不容易出故障的仲裁节点，可以增加有效选票，降低整个副本集不可用的风险。仲裁节点可多于一个。也就是说只参与投票，不接收复制的数据，也不能成为活跃节点。
>
> 官方推荐MongoDB副本节点最少为3台， 建议副本集成员为奇数，最多12个副本节点，最多7个节点参与选举。限制副本节点的数量，主要是因为一个集群中过多的副本节点，增加了复制的成本，反而拖累了集群
> 的整体性能。 太多的副本节点参与选举，也会增加选举的时间。而官方建议奇数的节点，是为了避免脑裂的发生。



### 副本集的工作流程

> 在 MongoDB 副本集中，主节点负责处理客户端的读写请求，备份节点则负责映射主节点的数据。备份节点的工作原理过程可以大致描述为：备份节点定期轮询主节点上的数据操作，然后对自己的数据副本进行这些操作，从而保证跟主节点的数据同步。至于主节点上的所有数据库状态改变的操作都会存放在一张特定的系统表中。备份节点则是根据这些数据进行自己的数据更新。
>
>
>
> oplog
> 上面提到的数据库状态改变的操作，称为 oplog(operation log，主节点操作记录)。oplog 存储在 local 数据库的"oplog.rs"表中。副本集中备份节点异步的从主节点同步 oplog，然后重新执行它记录的操作，以此达到了数据同步的作用。
> 关于 oplog 有几个注意的地方:
>
> 1. oplog 只记录改变数据库状态的操作
> 2. 存储在 oplog 中的操作并不是和主节点执行的操作完全一样，例如"$inc"操作就会转化为"$set"操作
> 3. oplog 存储在固定集合中(capped collection)，当 oplog 的数量超过 oplogSize，新的操作就会覆盖旧的操作
>
>
>
> 数据同步
> 在副本集中，有两种数据同步方式：
>
> 1. initial sync(初始化)：这个过程发生在当副本集中创建一个新的数据库或其中某个节点刚从宕机中恢复，或者向副本集中添加新的成员的时候。默认的，副本集中的节点会从离它最近的节点复制 oplog 来同步数据，这个最近的节点可以是 primary 也可以是拥有最新 oplog 副本的 secondary 节点。该操作一般会重新初始化备份节点，开销较大。
>
> 2. replication(复制)：在初始化后这个操作会一直持续的进行着，以保持各个 secondary 节点之间的数据同步。
>
>
> initial sync
> 当遇到无法同步的问题时，只能使用以下两种方式进行 initial sync 了
>
> 1. 第一种方式就是停止该节点，然后删除目录中的文件，重新启动该节点。这样，这个节点就会执行 initial sync。通过这种方式，sync 的时间是根据数据量大小的，如果数据量过大，sync 时间就会很长，同时会有很多网络传输，可能会影响其他节点的工作
>
> 2. 第二种方式，停止该节点，然后删除目录中的文件，找一个比较新的节点，然后把该节点目录中的文件拷贝到要 sync 的节点目录中。
>
>    通过上面两种方式中的一种，都可以重新恢复节点。
>
>
> 副本集管理
>
> ```shell
> 1. 查看oplog的信息，通过"db.printReplicationInfo()"命令可以查看 oplog 的信息
> 字段说明:
> configured oplog size：oplog 文件大小
> log length start to end：oplog 日志的启用时间段
> oplog first event time：第一个事务日志的产生时间
> oplog last event time：最后一个事务日志的产生时间
> now：现在的时间
> 
> 2. 查看 slave 状态，通过"db.printSlaveReplicationInfo()"可以查看 slave 的同步状态
> 当插入一条新的数据，然后重新检查 slave 状态时，就会发现 sync 时间更新了
> ```



### 副本集选举的过程和注意点

> Mongodb副本集选举采用的是Bully算法，这是一种协调者(主节点)竞选算法，主要思想是集群的每个成员都可以声明它是主节点并通知其他节点。
> 别的节点可以选择接受这个声明或是拒绝并进入主节点竞争，被其他所有节点接受的节点才能成为主节点。
> 节点按照一些属性来判断谁应该胜出，这个属性可以是一个静态 ID，也可以是更新的度量，比如最近一次事务ID(最新的节点会胜出)
>
> 副本集的选举过程大致如下：
>
> 1. 得到每个服务器节点的最后操作时间戳。每个 mongodb 都有 oplog 机制会记录本机的操作，方便和主服务器进行对比数据是否同步，还可以用于错误恢复。
> 2. 如果集群中大部分服务器 down 机了，保留活着的节点都为 secondary 状态并停止，不选举了。
> 3. 如果集群中选举出来的主节点或者所有从节点最后一次同步时间看起来很旧了，停止选举等待人来操作。
> 4. 如果上面都没有问题就选择最后操作时间戳最新(保证数据是最新的)的服务器节点作为主节点。
>
> 副本集选举的特点：
> 选举还有个前提条件，参与选举的节点数量必须大于副本集总节点数量的一半（建议副本集成员为奇数。最多12个副本节点，最多7个节点参与选举）
> 如果已经小于一半了所有节点保持只读状态。集合中的成员一定要有大部分成员(即超过一半数量)是保持正常在线状态，3个成员的副本集，需要至少2个从属节点是正常状态。
> 如果一个从属节点挂掉，那么当主节点down掉产生故障切换时，由于副本集中只有一个节点是正常的，少于一半，则选举失败。
> 四个成员的副本集，则需要三个成员是正常状态(先关闭一个从属节点，然后再关闭主节点，产生故障切换，此时副本集中只有2个节点正常，则无法成功选举出新主节点)。



### 副本集数据过程

> Primary节点写入数据，Secondary通过读取Primary的oplog得到复制信息，开始复制数据并且将复制信息写入到自己的oplog。如果某个操作失败，则备份节点停止从当前数据源复制数据。如果某个备份节点由于某些原因挂掉了，当重新启动后，就会自动从oplog的最后一个操作开始同步，同步完成后，将信息写入自己的
> oplog，由于复制操作是先复制数据，复制完成后再写入oplog，有可能相同的操作会同步两份，不过MongoDB在设计之初就考虑到这个问题，将oplog的同一个操作执行多次，与执行一次的效果是一样的。简单的说就是：
>
> 当Primary节点完成数据操作后，Secondary会做出一系列的动作保证数据的同步：
>
> 1. 检查自己local库的oplog.rs集合找出最近的时间戳。
> 2. 检查Primary节点local库oplog.rs集合，找出大于此时间戳的记录。
> 3. 将找到的记录插入到自己的oplog.rs集合中，并执行这些操作。
>
> 副本集的同步和主从同步一样，都是异步同步的过程，不同的是副本集有个自动故障转移的功能。其原理是：slave端从primary端获取日志，然后在自己身上完全顺序的执行日志所记录的各种操作（该日志是不记录查询操作的），这个日志就是local数据库中的oplog.rs表，默认在64位机器上这个表是比较大的，占磁盘大小的5%，oplog.rs的大小可以在启动参数中设定：--oplogSize 1000，单位是M。
>
> 注意：在副本集的环境中，要是所有的Secondary都宕机了，只剩下Primary。最后Primary会变成Secondary，不能提供服务。



### MongoDB 同步延迟问题

> 当你的用户抱怨修改过的信息不改变，删除掉的数据还在显示，可能是数据库主从不同步。与其他提供数据同步的数据库一样，MongoDB 也会遇到同步延迟的问题，在MongoDB的Replica Sets模式中，同步延迟也经常是困扰使用者的一个大问题。
>
> 什么是同步延迟？
> 首先，要出现同步延迟，必然是在有数据同步的场合，在 MongoDB 中，有两种数据冗余方式，一种是Master-Slave 模式，一种是Replica Sets模式。这两个模式本质上都是在一个节点上执行写操作， 另外的节点将主节点上的写操作同步到自己这边再进行执行。在MongoDB中，所有写操作都会产生 oplog，oplog 是每修改一条数据都会生成一条，如果你采用一个批量 update 命令更新了 N 多条数据， 那么抱歉，oplog 会有很多条，而不是一条。所以同步延迟就是写操作在主节点上执行完后，从节点还没有把 oplog 拿过来再执行一次。而这个写操作的量越大，主节点与从节点的差别也就越大，同步延迟也就越大了。
>
> 同步延迟带来的问题
> 首先，同步操作通常有两个效果，一是读写分离，将读操作放到从节点上来执行，从而减少主节点的压力。对于大多数场景来说，读多写少是基本特性，所以这一点是很有用的。
> 另一个作用是数据备份，同一个写操作除了在主节点执行之外，在从节点上也同样执行，这样我们就有多份同样的数据，一旦主节点的数据因为各种天灾人祸无法恢复的时候，我们至少还有从节点可以依赖。但是主从延迟问题可能会对上面两个效果都产生不好的影响。
>
> 如果主从延迟过大，主节点上会有很多数据更改没有同步到从节点上。这时候如果主节点故障，就有两种情况:
>
> 1. 主节点故障并且无法恢复，如果应用上又无法忍受这部分数据的丢失，我们就得想各种办法将这部分数据更改找回来，再写入到从节点中去。可以想象，即使是有可能，那这也绝对是一件非常恶心的活。
> 2. 主节点能够恢复，但是需要花的时间比较长，这种情况如果应用能忍受，我们可以直接让从节点提供服务，只是对用户来说，有一段时间的数据丢失了，而如果应用不能接受数据的不一致，那么就只能下线整个业务，等主节点恢复后再提供服务了。
>
> 如果你只有一个从节点，当主从延迟过大时，由于主节点只保存最近的一部分 oplog，可能会导致从节点青黄不接，不得不进行 resync 操作，全量从主节点同步数据。
> 带来的问题是：当从节点全量同步的时候，实际只有主节点保存了完整的数据，这时候如果主节点故障，很可能全部数据都丢掉了。



### 测试

#### 配置服务

```shell
===========================================================================================
环境：
准备两台主机，主节点地址：192.168.251.134；从节点1地址：192.168.251.133；从节点2地址：192.168.251.132；
# mongodb安装查看MongoDB安装文档
===========================================================================================

-------------
   主节点
-------------
[root@master ~]# vim /usr/local/mongodb/conf/mongod1.conf
port=27017
bind_ip = 192.168.251.134
# 不同的主机绑定自己的地址
dbpath=/usr/local/mongodb/data
logpath=/usr/local/mongodb/log/mongo.log
pidfilepath=/usr/local/mongodb/mongo.pid
fork=true
logappend=true
shardsvr=true
directoryperdb=true
replSet =hqmongodb
# 复制集的名称，集群中的服务器的配置文件都需要加入replSet指令，它们都属于一个复制集
maxConns=5000
# 最大同时连接数，默认2000
auth=false
# 是否启用身份认证
nohttpinterface=true
rest=false
[root@master mongodb]# scp conf/mongodb.conf 192.168.251.132:/usr/local/mongodb/conf/
[root@master mongodb]# scp conf/mongodb.conf 192.168.251.133:/usr/local/mongodb/conf/
[root@master mongodb]# mongod -f /usr/local/mongodb/conf/mongodb.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 2908
child process started successfully, parent exiting
-----------------
   从节点1&2
-----------------
[root@slave1 ~]# vim .bash_profile
export PATH=/usr/local/mongodb/bin:$PATH
[root@slave1 ~]# source .bash_profile
[root@slave1 ~]# mongod -f /usr/local/mongodb/conf/mongod.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 1267
child process started successfully, parent exiting
```



#### 设置副本集

```shell
-------------
   主节点
-------------
[root@master mongodb]# mongo 192.168.251.134:27017
MongoDB shell version: 3.2.8
connecting to: test
Server has startup warnings: 
2019-03-06T17:25:10.076+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2019-03-06T17:25:10.077+0800 I CONTROL  [initandlisten] 
# 连接数据库，由于配置文件中绑定了ip，所以要用这个绑定的ip登陆
> rs.initiate()
{
	"info2" : "no configuration specified. Using a default configuration for the set",
	"me" : "192.168.251.134:27017",
	"ok" : 1
}
# 登入任意一台机器的mongodb执行都可以，因为是全新的复制集，所以可以任意进入一台执行；要是一台有数据，则需要在有数据上执行；要多台有数据则不能初始化。
# 也可以使用命令rs.initiate({_id:'repl1',members:[{_id:1,host:'192.168.251.134:27017'}]})
# 选项意义如下：
# _id：复制集名称（第一个_id） 
# members：复制集服务器列表 
# _id：服务器的唯一ID（数组里_id） 
# host：服务器主机 
# 我们操作的是192.168.251.134服务器，其中repl1即是复制集名称，和mongodb.conf中保持一致，初始化复制集的第一个服务器将会成为主复制集
hqmongodb:OTHER> rs.conf()
{
	"_id" : "hqmongodb",
	"version" : 1,
	"protocolVersion" : NumberLong(1),
	"members" : [    # 下面是主节点的信息
		{
			"_id" : 0,
			"host" : "192.168.251.134:27017",
			"arbiterOnly" : false,
			"buildIndexes" : true,
			"hidden" : false,
			"priority" : 1,
			"tags" : {
				
			},
			"slaveDelay" : NumberLong(0),
			"votes" : 1
		}
	],
	"settings" : {
		"chainingAllowed" : true,
		"heartbeatIntervalMillis" : 2000,
		"heartbeatTimeoutSecs" : 10,
		"electionTimeoutMillis" : 10000,
		"getLastErrorModes" : {
			
		},
		"getLastErrorDefaults" : {
			"w" : 1,
			"wtimeout" : 0
		},
		"replicaSetId" : ObjectId("5c80f458aa273710c786c4f1")
	}
}
# 通过rs.status()也可以查看复制集状态信息，192.168.251.134:27017已被自动分配为primary主复制集了
hqmongodb:PRIMARY> rs.add("192.168.251.133:27017")
{ "ok" : 1 }
hqmongodb:PRIMARY> rs.add("192.168.251.132:27017")
{ "ok" : 1 }
# 增加192.168.251.132和133为从节点，如果有报错，建议关闭防火墙
```



#### 设置优先级

```shell
------------
   主节点
------------
hqmongodb:PRIMARY> cfg = rs.conf()
{
	"_id" : "hqmongodb",
	"version" : 3,
	"protocolVersion" : NumberLong(1),
	"members" : [
		{
			"_id" : 0,
			"host" : "192.168.251.134:27017",
			"arbiterOnly" : false,
			"buildIndexes" : true,
			"hidden" : false,
			"priority" : 1,
			"tags" : {
				
			},
			"slaveDelay" : NumberLong(0),
			"votes" : 1
		},
		{
			"_id" : 1,
			"host" : "192.168.251.133:27017",
			"arbiterOnly" : false,
			"buildIndexes" : true,
			"hidden" : false,
			"priority" : 1,
			"tags" : {
				
			},
			"slaveDelay" : NumberLong(0),
			"votes" : 1
		},
		{
			"_id" : 2,
			"host" : "192.168.251.132:27017",
			"arbiterOnly" : false,
			"buildIndexes" : true,
			"hidden" : false,
			"priority" : 1,
			"tags" : {
				
			},
			"slaveDelay" : NumberLong(0),
			"votes" : 1
		}
	],
	"settings" : {
		"chainingAllowed" : true,
		"heartbeatIntervalMillis" : 2000,
		"heartbeatTimeoutSecs" : 10,
		"electionTimeoutMillis" : 10000,
		"getLastErrorModes" : {
			
		},
		"getLastErrorDefaults" : {
			"w" : 1,
			"wtimeout" : 0
		},
		"replicaSetId" : ObjectId("5c80f458aa273710c786c4f1")
	}
}
# 将配置文件赋值给cfg，重启服务后可能对cfg的赋值会失效，所以要重新赋值
hqmongodb:PRIMARY> cfg.members[0].priority = 1
1
hqmongodb:PRIMARY> cfg.members[1].priority = 1
1
hqmongodb:PRIMARY> cfg.members[2].priority = 2
2
# 设置_ID 为 2 的节点为主节点。即当当前主节点发生故障时，该节点就会转变为主节点接管服务。但测试发现，设置优先级并使配置生效后，_ID 为 2 的节点就会变为主节点，现在的主节点就变成了从节点
hqmongodb:PRIMARY> rs.reconfig(cfg)
{ "ok" : 1 }
# 使配置生效
# MongoDB副本集通过设置priority 决定优先级，默认优先级为1，priority值是0到100之间的数字，数字越大优先级越高，priority=0，则此节点永远不能成为主节点 primay。
# cfg.members[0].priority =1 参数中括号里的数字是执行rs.conf()查看到的节点顺序， 第一个节点是0，第二个节点是 1，第三个节点是 2，以此类推。优先级最高的那个被设置为主节点。

-----------------
  从节点1&2
-----------------
[root@slave1 mongodb]# mongo 192.168.251.133:27017
hqmongodb:SECONDARY> db.getMongo().setSlaveOk()
# 设置从节点为只读.注意从节点的前缀现在是SECONDARY。
# 最后还是将优先级改为了环境中所写的，Master主机的优先级改为了2，从节点的优先级都改为了1。
===========================================================================================
如果执行命令后出现报错： "errmsg" : "not master and slaveOk=false"，这是正常的，因为SECONDARY是不允许读写的，如果非要解决，方法如下：
> rs.slaveOk();              # 执行这个命令然后，再执行其它命令就不会出现这个报错了
===========================================================================================
```



#### 开启登录验证

```shell
------------
   主节点
------------
[root@master ~]# mongo 192.168.251.134:27017
hqmongodb:PRIMARY> show dbs
local  0.000GB
hqmongodb:PRIMARY> use admin
switched to db admin
# mongodb3.0没有admin数据库了，需要手动创建。admin库下添加的账号才是管理员账号
hqmongodb:PRIMARY> db.createUser({user:"system",pwd:"centos",roles:[{role:"root",db:"admin"}]})
Successfully added user: {
	"user" : "system",
	"roles" : [
		{
			"role" : "root",
			"db" : "admin"
		}
	]
}
# 添加系统管理员账号system，用来管理用户
hqmongodb:PRIMARY> db.auth('system','centos')
1
# 添加管理员用户认证，认证之后才能管理所有数据库

hqmongodb:PRIMARY> db.createUser({user:'administrator',pwd:'centos',roles:[{role:"userAdminAnyDatabase",db:"admin"}]});
Successfully added user: {
	"user" : "administrator",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
# 添加数据库管理员,用来管理所有数据库
hqmongodb:PRIMARY> db.auth('administrator','centos')
1
# 添加管理员用户认证，认证之后才能管理所有数据库

hqmongodb:PRIMARY> db
admin
hqmongodb:PRIMARY> show collections
system.users
system.version
hqmongodb:PRIMARY> db.system.users.find()
{ "_id" : "admin.system", "user" : "system", "db" : "admin", "credentials" : { "SCRAM-SHA-1" : { "iterationCount" : 10000, "salt" : "iDMoK7Qx7M3R4oMvt2rx/Q==", "storedKey" : "jxPOcQQwyd0kVwGX8xD2ohraan4=", "serverKey" : "Bo3fppRn9DaZ8Sjvd+fZiPHlq80=" } }, "roles" : [ { "role" : "root", "db" : "admin" } ] }
{ "_id" : "admin.administrator", "user" : "administrator", "db" : "admin", "credentials" : { "SCRAM-SHA-1" : { "iterationCount" : 10000, "salt" : "PjiXSi3vwtiJYDMZiSN80Q==", "storedKey" : "li7NAXV4xWA2htclWqXw/V9QgXI=", "serverKey" : "DFMcKQFJLarvhDjnP5kjK4PWzFs=" } }, "roles" : [ { "role" : "userAdminAnyDatabase", "db" : "admin" } ] }
# 查看
hqmongodb:PRIMARY> exit
bye
[root@master ~]# mongo 192.168.251.134:27017 -u system -p centos --authenticationDatabase admin
[root@master ~]# mongo 192.168.251.134:27017 -u administrator -p centos --authenticationDatabase admin
# 使用新帐号登录测试
hqmongodb:PRIMARY> exit
bye
[root@master ~]# cd /usr/local/mongodb/
[root@master mongodb]# openssl rand -base64 21 > keyfile
# 创建一个 keyfile(使用 openssl 生成 21 位 base64 加密的字符串)。数字使用了 21，最好是 3 的倍数,否则生成的字符串可能含有非法字符，认证失败。
[root@master mongodb]# chmod 600 keyfile 
[root@master mongodb]# cat keyfile 
FXXSNrmMnrTb5GgwCaWILKF1B/wZ
# 查看刚才生成的字符串,做记录,后面要用到
[root@master mongodb]# vim conf/mongodb.conf 
auth=true
keyFile=/usr/local/mongodb/keyfile
# 加入两条信息，三台主机都要改
[root@master mongodb]# scp keyfile 192.168.251.133:/usr/local/mongodb/
[root@master mongodb]# scp keyfile 192.168.251.132:/usr/local/mongodb/
# 将密钥复制到从节点，注意权限一定是600
[root@master mongodb]# mongod --shutdown -f conf/mongodb.conf
[root@master mongodb]# mongod -f conf/mongodb.conf
# 重启服务

-----------------
  从节点1&2
-----------------
[root@slave1 mongodb]# vim conf/mongodb.conf 
auth=true
keyFile=/usr/local/mongodb/keyfile
[root@slave1 mongodb]# mongod --shutdown -f conf/mongodb.conf
[root@slave1 mongodb]# mongod -f conf/mongodb.conf
# 三台主机都要重启服务

------------
   主节点
------------
[root@master mongodb]# mongo 192.168.251.134:27017
MongoDB shell version: 3.2.8
connecting to: 192.168.251.134:27017/test
hqmongodb:PRIMARY> rs.status(
... )
{
	"ok" : 0,
	"errmsg" : "not authorized on admin to execute command { replSetGetStatus: 1.0 }",
	"code" : 13
}
# 登录时如果不指定用户名和密码，操作数据库时会有报错。
hqmongodb:PRIMARY> exit
[root@master mongodb]# mongo 192.168.251.134:27017 -u system -p centos --authenticationDatabase admin
MongoDB shell version: 3.2.8
connecting to: 192.168.251.134:27017/test
Server has startup warnings: 
2019-03-08T15:13:49.020+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2019-03-08T15:13:49.020+0800 I CONTROL  [initandlisten] 
hqmongodb:PRIMARY> 
hqmongodb:PRIMARY> rs.status()
{
	"set" : "hqmongodb",
	"date" : ISODate("2019-03-08T07:15:11.774Z"),
	"myState" : 1,
	"term" : NumberLong(2),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 0,
			"name" : "192.168.251.134:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 83,
			"optime" : {
				"ts" : Timestamp(1552029240, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2019-03-08T07:14:00Z"),
			"electionTime" : Timestamp(1552029239, 1),
			"electionDate" : ISODate("2019-03-08T07:13:59Z"),
			"configVersion" : 3,
			"self" : true
		},
		{
			"_id" : 1,
			"name" : "192.168.251.133:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 72,
			"optime" : {
				"ts" : Timestamp(1552029240, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2019-03-08T07:14:00Z"),
			"lastHeartbeat" : ISODate("2019-03-08T07:15:11.610Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T07:15:11.347Z"),
			"pingMs" : NumberLong(0),
			"syncingTo" : "192.168.251.132:27017",
			"configVersion" : 3
		},
		{
			"_id" : 2,
			"name" : "192.168.251.132:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 72,
			"optime" : {
				"ts" : Timestamp(1552029240, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2019-03-08T07:14:00Z"),
			"lastHeartbeat" : ISODate("2019-03-08T07:15:11.636Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T07:15:11.578Z"),
			"pingMs" : NumberLong(0),
			"syncingTo" : "192.168.251.134:27017",
			"configVersion" : 3
		}
	],
	"ok" : 1
}
# 使用用户名和密码登录后操作就没问题了
# 注意上面命令结果中的state,如果这个值为 1,说明是主控节点(master);如果是2，说明是从属节点slave。在上面显示的当前主节点写入数据，到从节点上查看发现数据会同步。
# 
```



#### 日志查看

```shell
hqmongodb:PRIMARY> use local
switched to db local
hqmongodb:PRIMARY> db.oplog.rs.find()
{ "ts" : Timestamp(1552028565, 1), "h" : NumberLong("4391722300525823791"), "v" : 2, "op" : "n", "ns" : "", "o" : { "msg" : "initiating set" } }
{ "ts" : Timestamp(1552028566, 1), "t" : NumberLong(1), "h" : NumberLong("8449179963384189305"), "v" : 2, "op" : "n", "ns" : "", "o" : { "msg" : "new primary" } }
{ "ts" : Timestamp(1552028609, 1), "t" : NumberLong(1), "h" : NumberLong("-8014254993634545405"), "v" : 2, "op" : "n", "ns" : "", "o" : { "msg" : "Reconfig set", "version" : 2 } }
{ "ts" : Timestamp(1552028614, 1), "t" : NumberLong(1), "h" : NumberLong("1448067838065630949"), "v" : 2, "op" : "n", "ns" : "", "o" : { "msg" : "Reconfig set", "version" : 3 } }
{ "ts" : Timestamp(1552028878, 1), "t" : NumberLong(1), "h" : NumberLong("7482679933079682833"), "v" : 2, "op" : "c", "ns" : "admin.$cmd", "o" : { "create" : "system.version" } }
{ "ts" : Timestamp(1552028878, 2), "t" : NumberLong(1), "h" : NumberLong("-4363891485786841171"), "v" : 2, "op" : "i", "ns" : "admin.system.version", "o" : { "_id" : "authSchema", "currentVersion" : 5 } }
{ "ts" : Timestamp(1552028878, 3), "t" : NumberLong(1), "h" : NumberLong("6832610854355231587"), "v" : 2, "op" : "c", "ns" : "admin.$cmd", "o" : { "create" : "system.users" } }
{ "ts" : Timestamp(1552028878, 4), "t" : NumberLong(1), "h" : NumberLong("5754891887687461455"), "v" : 2, "op" : "i", "ns" : "admin.system.users", "o" : { "_id" : "admin.system", "user" : "system", "db" : "admin", "credentials" : { "SCRAM-SHA-1" : { "iterationCount" : 10000, "salt" : "SOJmBhWoRzjsxLFmoRuUUQ==", "storedKey" : "MpRbzaW4wVAuw8zXISVek+VM71E=", "serverKey" : "l/BxWT12M+F3luMwT5bMIfGt8yw=" } }, "roles" : [ { "role" : "root", "db" : "admin" } ] } }
{ "ts" : Timestamp(1552028973, 1), "t" : NumberLong(1), "h" : NumberLong("-7924226021042987469"), "v" : 2, "op" : "i", "ns" : "admin.system.users", "o" : { "_id" : "admin.administrator", "user" : "administrator", "db" : "admin", "credentials" : { "SCRAM-SHA-1" : { "iterationCount" : 10000, "salt" : "ptoSffZtwnu47uBhhU9lMA==", "storedKey" : "409n1lhVnzWex3+Ua4Owx7GAanE=", "serverKey" : "jsf8UFDCNxfRDwL7hseh21EehJ8=" } }, "roles" : [ { "role" : "userAdminAnyDatabase", "db" : "admin" } ] } }
{ "ts" : Timestamp(1552029240, 1), "t" : NumberLong(2), "h" : NumberLong("6978081991940203547"), "v" : 2, "op" : "n", "ns" : "", "o" : { "msg" : "new primary" } }
#  字段说明:
# ts：某个操作的时间戳
# op：操作类型，如下:
# i：insert
# d：delete
# u：update
# ns：命名空间，也就是操作的 collection name
```



#### 添加仲裁节点

```shell
hqmongodb:SECONDARY> rs.stepDown()
2019-03-08T16:05:41.426+0800 E QUERY    [thread1] Error: error doing query: failed: network error while attempting to run command 'replSetStepDown' on host '192.168.251.133:27017'  :
DB.prototype.runCommand@src/mongo/shell/db.js:135:1
DB.prototype.adminCommand@src/mongo/shell/db.js:153:16
rs.stepDown@src/mongo/shell/utils.js:1182:12
@(shell):1:1

2019-03-08T16:05:41.428+0800 I NETWORK  [thread1] trying reconnect to 192.168.251.133:27017 (192.168.251.133) failed
2019-03-08T16:05:41.429+0800 I NETWORK  [thread1] reconnect 192.168.251.133:27017 (192.168.251.133) ok
# 人为让主节点关闭，成为从节点，如果括号中有数字，就表示多久不能成为主节点。这时三个节点都会是从节点，如果哪个从节点进行了操作，就会成为主节点。
hqmongodb:SECONDARY> rs.status()
{
	"set" : "hqmongodb",
	"date" : ISODate("2019-03-08T08:05:46.805Z"),
	"myState" : 2,
	"term" : NumberLong(4),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 0,
			"name" : "192.168.251.134:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3110,
			"optime" : {
				"ts" : Timestamp(1552032275, 1),
				"t" : NumberLong(4)
			},
			"optimeDate" : ISODate("2019-03-08T08:04:35Z"),
			"lastHeartbeat" : ISODate("2019-03-08T08:05:42.774Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T08:05:46.630Z"),
			"pingMs" : NumberLong(0),
			"configVersion" : 3
		},
		{
			"_id" : 1,
			"name" : "192.168.251.133:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3111,
			"optime" : {
				"ts" : Timestamp(1552032275, 1),
				"t" : NumberLong(4)
			},
			"optimeDate" : ISODate("2019-03-08T08:04:35Z"),
			"infoMessage" : "could not find member to sync from",
			"configVersion" : 3,
			"self" : true
		},
		{
			"_id" : 2,
			"name" : "192.168.251.132:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3105,
			"optime" : {
				"ts" : Timestamp(1552032275, 1),
				"t" : NumberLong(4)
			},
			"optimeDate" : ISODate("2019-03-08T08:04:35Z"),
			"lastHeartbeat" : ISODate("2019-03-08T08:05:42.774Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T08:05:46.406Z"),
			"pingMs" : NumberLong(0),
			"configVersion" : 3
		}
	],
	"ok" : 1
}

-------------
   主节点
-------------
hqmongodb:PRIMARY> rs.remove("192.168.251.132:27017")
{ "ok" : 1 }
# 删除一个从节点
hqmongodb:PRIMARY> rs.addArb("192.168.251.132:27017")
{ "ok" : 1 }
# 将删除的从节点添加为仲裁节点
hqmongodb:PRIMARY> rs.status()
{
	"set" : "hqmongodb",
	"date" : ISODate("2019-03-08T08:12:35.701Z"),
	"myState" : 1,
	"term" : NumberLong(5),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 0,
			"name" : "192.168.251.134:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 3527,
			"optime" : {
				"ts" : Timestamp(1552032749, 1),
				"t" : NumberLong(5)
			},
			"optimeDate" : ISODate("2019-03-08T08:12:29Z"),
			"electionTime" : Timestamp(1552032350, 1),
			"electionDate" : ISODate("2019-03-08T08:05:50Z"),
			"configVersion" : 5,
			"self" : true
		},
		{
			"_id" : 1,
			"name" : "192.168.251.133:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3516,
			"optime" : {
				"ts" : Timestamp(1552032749, 1),
				"t" : NumberLong(5)
			},
			"optimeDate" : ISODate("2019-03-08T08:12:29Z"),
			"lastHeartbeat" : ISODate("2019-03-08T08:12:33.719Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T08:12:34.787Z"),
			"pingMs" : NumberLong(2),
			"syncingTo" : "192.168.251.134:27017",
			"configVersion" : 5
		},
		{
			"_id" : 2,
			"name" : "192.168.251.132:27017",
			"health" : 1,
			"state" : 7,
			"stateStr" : "ARBITER",
			"uptime" : 3,
			"lastHeartbeat" : ISODate("2019-03-08T08:12:33.751Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-08T08:12:30.829Z"),
			"pingMs" : NumberLong(0),
			"configVersion" : 5
		}
	],
	"ok" : 1
}
# 查看，_id为2的节点的stateStr变成了ARBITER
```



####  测试副本集secondary节点数据复制功能

```shell
-------------
   主节点
-------------
repl1:PRIMARY> db
DBCommandCursor(  DBExplainQuery(   DBPointer(        db
repl1:PRIMARY> db
test
repl1:PRIMARY> show collections
repl1:PRIMARY> for(var i =0; i <4; i ++){db.user.insert({userName:'gxt'+i,age:i})}
WriteResult({ "nInserted" : 1 })
repl1:PRIMARY> show collections
user
repl1:PRIMARY> db.user.find()
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b7"), "userName" : "gxt0", "age" : 0 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b8"), "userName" : "gxt1", "age" : 1 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b9"), "userName" : "gxt2", "age" : 2 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6ba"), "userName" : "gxt3", "age" : 3 }

-------------
   从节点
-------------
repl1:SECONDARY> db
test
repl1:SECONDARY> show collections
2019-03-06T17:51:59.721+0800 E QUERY    [thread1] Error: listCollections failed: { "ok" : 0, "errmsg" : "not master and slaveOk=false", "code" : 13435 } :
_getErrorWithCode@src/mongo/shell/utils.js:25:13
DB.prototype._getCollectionInfosCommand@src/mongo/shell/db.js:773:1
DB.prototype.getCollectionInfos@src/mongo/shell/db.js:785:19
DB.prototype.getCollectionNames@src/mongo/shell/db.js:796:16
shellHelper.show@src/mongo/shell/utils.js:754:9
shellHelper@src/mongo/shell/utils.js:651:15
@(shellhelp2):1:1
repl1:SECONDARY> rs.slaveOk()
repl1:SECONDARY> show collections
user
repl1:SECONDARY> db.user.find()
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b9"), "userName" : "gxt2", "age" : 2 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6ba"), "userName" : "gxt3", "age" : 3 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b8"), "userName" : "gxt1", "age" : 1 }
{ "_id" : ObjectId("5c7f94f0dcfc5b45e0a0f6b7"), "userName" : "gxt0", "age" : 0 }
# 通过db.user.find()查询到和主复制集上一样的数据，表示数据同步成功！
# "errmsg" : "not master and slaveOk=false"错误说明：因为secondary是不允许读写的，如果非要解决，则执行：rs.slaveOk()
```



