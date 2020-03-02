---
title: kafka概念
date: 2019-01-21 08:49:36
tags: kafka概念
categories: 消息队列
---

### 介紹

>  Kafka is a distributed，partitioned，replicated commit logservice。它提供了类似于JMS的特性，但是在设计实现上完全不同，此外它并不是JMS规范的实现。kafka对消息保存时根据Topic进行归类，发送消息者稱为Producer，消息接受者稱为Consumer，此外kafka集群由多个kafka实例组成，每个实例(server)稱为broker。无论是kafka集群，还是producer和consumer都依赖于zookeeper来保证系统可用性，zookeeper集群保存一些meta(元數據)信息。



![](/images/kafka/介绍.png)

### 概念

#### 消息队列（Message Queue）

> * 消息 Message
>   网络中的两台计算机或者两个通讯设备之间传递的数据。例如说：文本、音乐、视频等内容。
> * 队列 Queue
>   一种特殊的线性表（数据元素首尾相接），特殊之处在于只允许在首部删除元素和在尾部追加元素。入队、出队。
> * 消息队列 MQ
>   消息+队列，保存消息的队列。消息的传输过程中的容器；主要提供生产、消费接口供外部调用做数据的存储和获取。



#### MQ分类

> MQ主要分为两类：点对点(p2p)、发布订阅(Pub/Sub)
>
> * 共同点：
>   消息生产者生产消息发送到queue中，然后消息消费者从queue中读取并且消费消息。
>
> * 不同点：
>   p2p模型包括：消息队列(Queue)、发送者(Sender)、接收者(Receiver)
>   一个生产者生产的消息只有一个消费者(Consumer)(即一旦被消费，消息就不在消息队列中)。比如说打电话。
>
>   Pub/Sub包含：消息队列(Queue)、主题(Topic)、发布者(Publisher)、订阅者(Subscriber)
>   每个消息可以有多个消费者，彼此互不影响。比如我发布一个微博：关注我的人都能够看到。
>   那么在大数据领域呢，为了满足日益增长的数据量，也有一款可以满足百万级别消息的生成和消费，分布式、持久稳定的产品——Kafka。



#### Kafka组件

> * Topic：主题，Kafka处理的消息的不同分类。
> * Broker：消息代理，Kafka集群中的一个kafka服务节点称为一个broker，主要存储消息数据。存在硬盘中。每个topic都是有分区的。
> * Partition：Topic物理上的分组，一个topic在broker中被分为1个或者多个partition，分区在创建topic的时候指定。
> * Message：消息，是通信的基本单位，每个消息都属于一个partition
> * Producer：消息和数据的生产者，向Kafka的一个topic发布消息。
> * Consumer：消息和数据的消费者，定于topic并处理其发布的消息。
> * Zookeeper：协调kafka的正常运行。



#### **Topics/logs** 

>  一个Topic可以认为是一类消息，每个topic将被分成多个partition(分区)，每个partition在存储层面是append log文件。任何发布到此partition的消息都会被直接追加到log文件的尾部，每条消息在文件中的位置称为offset（偏移量），offset为一个long型数字，它唯一的标记一条消息。kafka并没有提供其他额外的索引机制来存储offset，因为在kafka中几乎不允许对消息进行“随机读写”。

![](/images/kafka/topics_logs.png)

> kafka和JMS（Java Message Service）实现(activeMQ)不同的是：即使消息被消费,消息仍然不会被立即删除。日志文件将会根据broker中的配置要求，保留一定的时间之后删除；比如log文件保留2天，那么两天后,文件会被清除，无论其中的消息是否被消费。kafka通过这种简单的手段，来释放磁盘空间，以及减少消息消费之后对文件内容改动的磁盘IO开支。
>
> 对于consumer而言，它需要保存消费消息的offset，对于offset的保存和使用，由consumer来控制；当consumer正常消费消息时，offset将会"线性"的向前驱动，即消息将依次顺序被消费。事实上consumer可以使用任意顺序消费消息，它只需要将offset重置为任意值。(offset将会保存在zookeeper中)
>
> kafka集群几乎不需要维护任何consumer和producer状态信息，这些信息由zookeeper保存；因此producer和consumer的客户端实现非常轻量级，它们可以随意离开，而不会对集群造成额外的影响。
>
> partitions的设计目的有多个。最根本原因是kafka基于文件存储。通过分区，可以将日志内容分散到多个server上，来避免文件尺寸达到单机磁盘的上限，每个partiton都会被当前server(kafka实例)保存；可以将一个topic切分為任意多个partitions，来提高消息保存/消费的效率。此外越多的partitions意味着可以容纳更多的consumer，有效提升并发消费的能力。



#### Distribution

>  一个Topic的多个partitions，被分布在kafka集群中的多个server上；每个server(kafka实例)负责partitions中消息的读写操作；此外kafka还可以配置partitions需要备份的个数(replicas)，每个partition将会被备份到多台机器上，以提高可用性。
>
>  基于replicated方案，那么就意味着需要对多个备份进行调度；每个partition都有一个server为"leader"；leader负责所有的读写操作，如果leader失效，那么将会有其他follower来接管(成为新的leader)；follower只是单调的和leader跟进，同步消息即可。由此可见作为leader的server承载了全部的请求压力，因此从集群的整体考虑，有多少个partitions就意味着有多少个"leader"，kafka会将"leader"均衡的分散在每个实例上，来确保整体的性能稳定。
>
> - Producers
>
>  Producer将消息发布到指定的Topic中，同时Producer也能决定将此消息归属于哪个partition；比如基于"round-robin"方式或者通过其他的一些算法等。
>
> - Consumers
>
>  本质上kafka只支持Topic。每个consumer属于一个consumer group；反过来说，每个group中可以有多个consumer。发送到Topic的消息，只会被订阅此Topic的每个group中的一个consumer消费。
>
>  如果所有的consumer都具有相同的group，这种情况和queue模式很像；消息将会在consumers之间负载均衡。
>
>  如果所有的consumer都具有不同的group，那这就是"发布-订阅"；消息将会广播给所有的消费者。
>
>  在kafka中，一个partition中的消息只会被group中的一个consumer消费；每个group中consumer消息消费互相独立；我们可以认为一个group是一个"订阅"者，因為一个Topic中的每个partions，只会被一个"订阅者"中的一个consumer消费，不过一个consumer可以消费多个partitions中的消息。kafka只能保证一个partition中的消息被某个consumer消费时，消息是顺序的。事实上，从Topic角度来说，消息仍不是有序的。
>
>  kafka的设计原理决定，对于一个topic，同一个group中不能有多于partitions个数的consumer同时消费，否则将意味着某些consumer将无法得到消息。partition與consumer的數量最好相等。
>
> - Guarantees
>
> 1. 发送到partitions中的消息将会按照它接收的顺序追加到日志中
> 2. 对于消费者而言，它们消费消息的顺序和日志中消息顺序一致。
> 3. 如果Topic的“replication factor"为N,那么允许N-1个kafka实例失效。



### 使用场景

> 1. Messaging
>    对于一些常规的消息系统，kafka是个不错的选择；partitons/replication和容错，可以使kafka具有良好的扩展性和性能优势。不过到目前为止，我们应该很清楚认识到，kafka并没有提供JMS中的"事务性""消息传输担保(消息确认机制)""消息分组"等企业级特性；kafka只能使用作为"常规"的消息系统，在一定程度上，尚未确保消息的发送与接收绝对可靠(比如消息重发，消息发送丢失等)
> 2. Websit activity tracking
>    kafka可以作为"网站活動跟踪"的最佳工具；可以将网页/用户操作等信息发送到kafka中。并实时监控，或者离线统计分析等
> 3. Log Aggregation
>    kafka的特性决定它非常适合作为"日志收集中心"；application可以将操作日志"批量""异步"的发送到kafka集群中，而不是保存在本地或者DB中；kafka可以批量提交消息/压缩消息等，这对producer端而言，几乎感觉不到性能的开支。此时consumer端可以使用hadoop等其他系统化的存储和分析系统。



### 设计原理

>  kafka的设计初衷是希望作为一个统一的信息收集平台，能够实时的收集反馈信息，并需要能够支撑较大的数据量，且具备良好的容错能力。



#### 持久性

>  kafka使用文件存储消息，这就直接决定kafka在性能上严重依赖文件系统的本身特性。且无论任何OS下，对文件系统本身的优化几乎没有可能。文件缓存/直接内存映射等是常用的手段。因为kafka是对日志文件进行append操作，因此磁盘检索的开支是较小的；同时为了减少磁盘写入的次数，broker会将消息暂时buffer起来，当消息的个数(或尺寸)达到一定閾值时，再flush到磁盘，这样减少了磁盘IO调用的次数。



#### 性能

> 需要考虑的影响性能点很多，除磁盘IO之外，我们还需要考虑网络IO，这直接关系到kafka的吞吐量问题。kafka并没有提供太多高超的技巧；对于producer端，可以将消息buffer起来，当消息的条数达到一定閾值时，批量发送给broker；对于consumer端也是一样，批量fetch多条消息。不过消息量的大小可以通过配置文件来指定。对于kafka broker端，似乎有个sendfile系统调用可以潜在的提升网络IO的性能。将文件的数据映射到系统内存中，socket直接读取相应的内存区域即可，而无需进程再次copy和交换。 其实对于producer/consumer/broker三者而言，CPU的开支应该都不大，因此启用消息压缩机制是一个良好的策略；压缩需要消耗少量的CPU资源，不过对于kafka而言，网络IO更应该需要考虑。可以将任何在网络上传输的消息都经过压缩。kafka支持gzip/snappy等多种压缩方式。



#### 生產者

> 负载均衡：producer将会和Topic下所有partition leader保持socket连接；消息由producer直接通过socket发送到broker，中间不会经过任何"路由层"。事实上，消息被路由到哪个partition上，由producer客户端决定。比如可以采用"random""key-hash""轮询"等方式，如果一个topic中有多个partitions，那么在producer端实现"消息均衡分发"是必要的。
>
> 其中partition leader的位置(host:port)注册在zookeeper中，producer作为zookeeper client，已经注册了watch用来监听partition leader的变更事件。
>
> 异步发送：将多条消息暂且在客户端buffer起来，并将他们批量的发送到broker，小数据IO太多，会拖慢整体的网络延迟，批量延迟发送事实上提升了网络效率。不过这也有一定的隐患，比如说当producer失效时，那些尚未发送的消息将会丢失。



#### 消費者

> consumer端向broker发送"fetch"请求，并告知其获取消息的offset；此后consumer将会获得一定条数的消息；consumer端也可以重置offset来重新消费消息。
>
> 在JMS实现中，Topic模型基于push方式，即broker将消息推送给consumer端。不过在kafka中，采用了pull方式，即consumer在和broker建立连接之后，主动去pull(或者说fetch)消息；这種模式有些优点，首先consumer端可以根据自己的消费能力适时的去fetch消息并处理，且可以控制消息消费的进度(offset)；此外，消费者可以良好的控制消息消费的数量，batch fetch（批量獲取）.
>
> 其他JMS实现，消息消费的位置是由provider保留，以便避免重复发送消息或者将没有消费成功的消息重发等，同时还要控制消息的状态。这就要求JMS broker需要太多额外的工作。在kafka中，partition中的消息只有一个consumer在消费，且不存在消息状态的控制，也没有复杂的消息确认机制，可见kafka broker端是相当轻量级的。当消息被consumer接收之后，consumer可以在本地保存最后消費的offset，并间歇性的向zookeeper注册offset。由此可见，consumer客户端也很轻量级。

![](/images/kafka/消费者.png)



#### 消息傳送機制

> 对于JMS实现，消息传输担保非常直接，有且只有一次(exactly once)。在kafka中稍有不同：
>
> 1. at most once：最多一次，这个和JMS中"非持久化"消息类似。发送一次，无论成败，将不会重发。
> 2. at least once：消息至少发送一次，如果消息未能接受成功，可能会重发，直到接收成功。
> 3. exactly once：消息只会发送一次。
>
> - at most once：消费者fetch消息，然后保存offset，然后处理消息；当client保存offset之后，但是在消息处理过程中出现了异常，导致部分消息未能继续处理。那么此后"未处理"的消息将不能被fetch到，这就是"at most once"。
> - at least once：消费者fetch消息，然后处理消息，然后保存offset。如果消息处理成功之后，但是在保存offset阶段zookeeper异常导致保存操作未能执行成功，这就导致接下来再次fetch时可能获得上次已经处理过的消息，这就是"at least once"，原因offset没有及时的提交给zookeeper，zookeeper恢复正常还是之前offset状态。
> - exactly once：kafka中并没有严格的去实现(基于2阶段提交,事务)，我们认为这种策略在kafka中是没有必要的。
>
>  通常情况下"at-least-once"是我们首选(相比at most once而言，重复接收数据总比丢失数据要好)。



#### 複製備份

> kafka将每个partition数据复制到多个server上，任何一个partition都有一个leader和多个follower(可以没有)；备份的个数可以通过broker配置文件来设定。leader处理所有的read-write请求，follower需要和leader保持同步。Follower和consumer一样，消费消息并保存在本地日志中；leader负责跟踪所有的follower状态，如果follower"落后"太多或者失效，leader将会把它从replicas同步列表中删除。当所有的follower都将一条消息保存成功，此消息才被认为是"committed"，那么此时consumer才能消费它。即使只有一个replicas实例存活,仍然可以保证消息的正常发送和接收，只要zookeeper集群存活即可。(不同于其他分布式存储，比如hbase需要"多数派"存活才行)
> 当leader失效时，需在followers中选取出新的leader，可能此时follower落后于leader，因此需要选择一个"up-to-date"的follower。选择follower时需要兼顾一个问题，就是新leaderserver上已经承载的partition leader的个数，如果一个server上有过多的partition leader，意味着此server将承受着更多的IO压力。在选举新leader，需要考虑到"负载均衡"。



#### 日誌

> 如果一个topic的名称为"my_topic"，它有2个partitions，那么日志将会保存在my_topic_0和my_topic_1两个目录中；日志文件中保存了一序列"log entries"(日志条目)，每个log entry格式为"4个字节的数字，N表示消息的长度" + "N个字节的消息内容"；每个日志都有一个offset来唯一的标记一条消息，offset的值为8个字节的数字，表示此消息在此partition中所处的起始位置。**每个partition在物理存储层面有多个log file组成(称为segment)。segmentfile的命名为"最小offset".kafka(log)。例如"00000000000.kafka(log)"；其中"最小offset"表示此segment中起始消息的offset。

![](/images/kafka/日志.png)

> 其中每个partiton中所持有的segments列表信息会存储在zookeeper中。
>
> 当segment文件尺寸达到一定閾值时(可以通过配置文件设定，默认1G)，将会创建一个新的文件；当buffer中消息的条数达到閾值时将会触发日志信息flush到日志文件中，同时如果"距离最近一次flush的时间差"达到閾值时，也会触发flush到日志文件。如果broker失效，极有可能会丢失那些尚未flush到文件的消息。因为server意外仍然会导致log文件格式的破坏(文件尾部)，那么就要求当server启動時需要检测最后一个segment的文件结构是否合法并进行必要的修复。
>
> 获取消息时，需要指定offset和最大chunk尺寸，offset用来表示消息的起始位置，chunk size用来表示最大获取消息的总长度(间接的表示消息的条数)。根据offset，可以找到此消息所在segment文件，然后根据segment的最小offset取差值，得到它在file中的相对位置，直接读取输出即可。
>
> 日志文件的删除策略非常简单，启动一个后台线程定期扫描log file列表，把保存时间超过閾值的文件直接删除(根据文件的创建时间)。为了避免删除文件时仍然有read操作(consumer消费)，采取copy-on-write方式。



#### 分配

> kafka使用zookeeper来存储一些meta信息，并使用了zookeeper watch机制来发现meta信息的变更并作出相应的动作(比如consumer失效，触发负载均衡等)
>
> 1. Broker node registry：当一个kafkabroker启动后，首先会向zookeeper注册自己的节点信息(临时znode)，同时当broker和zookeeper断开连接时，此znode也会被删除。
>
>  格式： /broker/ids/[0...N]   -->host:port，其中[0..N]表示broker id，每个broker的配置文件中都需要指定一个数字类型的id(全局不可重复)，znode的值为此broker的host:port信息。
>
> 2. Broker Topic Registry：当一个broker启动时，会向zookeeper注册自己持有的topic和partitions信息，仍然是一个临时znode。
>
>  格式： /broker/topics/[topic]/[0...N]，其中[0..N]表示partition索引号。
>
> 3. Consumer and Consumer group：每个consumer客户端被创建时，会向zookeeper注册自己的信息，此作用主要是为了"负载均衡"。
>
>  一个group中的多个consumer可以交错的消费一个topic的所有partitions；简而言之，保证此topic的所有partitions都能被此group所消费，且消费时为了性能考虑，让partition相对均衡的分散到每个consumer上。
>
> 4. Consumer id Registry： 每个consumer都有一个唯一的ID(host:uuid，可以通过配置文件指定，也可以由系统生成)，此id用来标记消费者信息。
>
>  格式：/consumers/[group_id]/ids/[consumer_id]
>
>  仍然是一个临时的znode，此节点的值为{"topic_name":#streams...}，即表示此consumer目前所消费的topic + partitions列表。
>
> 5. Consumer offset Tracking：用来跟踪每个consumer目前所消费的partition中最大的offset。
>
>  格式：/consumers/[group_id]/offsets/[topic]/[broker_id-partition_id]-->offset_value
>
>  此znode为持久节点，可以看出offset跟group_id有关，以表明当group中一个消费者失效，其他consumer可以继续消费。
>
> 6. Partition Owner registry：用来标记partition被哪个consumer消费。临时znode
>
>  格式：/consumers/[group_id]/owners/[topic]/[broker_id-partition_id]-->consumer_node_id
>
>  当consumer启动时，所触发的操作：
>  A. 首先进行"Consumer id Registry"；
>  B. 然后在"Consumer id Registry"节点下注册一个watch用来监听当前group中其他consumer的"leave"和"join"；只要此znode path下节点列表变更，都会触发此group下consumer的负载均衡。(比如一个consumer失效，那么其他consumer接管partitions)。
>  C. 在"Broker id registry"节点下，注册一个watch用来监听broker的存活情况；如果broker列表变更，将会触发所有的groups下的consumer重新balance（在consumer間再平衡，重新分配？）。

![](/images/kafka/分配.png)

> 1. Producer端使用zookeeper用来"发现"broker列表，以及和Topic下每个partition leader建立socket连接并发送消息。
> 2. Broker端使用zookeeper用来注册broker信息，以监测partitionleader存活性。
> 3. Consumer端使用zookeeper用来注册consumer信息，其中包括consumer消费的partition列表等，同时也用来发现broker列表，并和partition leader建立socket连接，并获取消息。

