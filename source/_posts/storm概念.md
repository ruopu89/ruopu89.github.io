---
title: storm概念
date: 2019-03-11 17:00:54
tags: storm概念
categories: 大数据
---

### 概念

> Storm 是一个分布式的，可靠的，容错的数据流处理系统。它会把工作任务委托给不同类型的组件，每个组件负责处理一项简单特定的任务。Storm 集群的输入流由一个被称作 spout 的组件管理，spout 把数据传递给 bolt， bolt 要么把数据保存到某种存储器，要么把数据传递给其它的 bolt。你可以想象一下，一个 Storm 集群就是在一连串的 bolt 之间转换 spout 传过来的数据。
>
> 这里用一个简单的例子来说明这个概念。昨晚我在新闻节目里看到主持人在谈论政治人物和他们对于各种政治话题的立场。他们一直重复着不同的名字，而我开始考虑这些名字是否被提到了相同的次数，以及不同次数之间的偏差。
>
> 想像播音员读的字幕作为你的数据输入流。你可以用一个 spout 读取一个文件（或者 socket，通过 HTTP，或者别的方法）。文本行被 spout 传给一个 bolt，再被 bolt 按单词切割。单词流又被传给另一个 bolt，在这里每个单词与一张政治人名列表比较。每遇到一个匹配的名字，第二个 bolt 为这个名字在数据库的计数加1。你可以随时查询数据库查看结果， 而且这些计数是随着数据到达实时更新的。
>
> 现在想象一下，很容易在整个 Storm 集群定义每个 bolt 和 spout 的并行性级别，因此你可以无限的扩展你的拓扑结构。很神奇，是吗？尽管这是个简单例子，你也可以看到 Storm 的强大。



### 应用案例

> * 数据处理流
>
>   正如上例所展示的，不像其它的流处理系统，Storm 不需要中间队列。
>
> * 连续计算
>
>   连续发送数据到客户端，使它们能够实时更新并显示结果，如网站指标。
>
> * 分布式远程过程调用
>
>   频繁的 CPU 密集型操作并行化。



### Storm 组件

> Storm 集群由一个主节点(也可称为控制节点)和多个工作节点组成。主节点运行一个名为“Nimbus”的守护进程，工作节点都运行一个名为“Supervisor”的守护进程，两者的协调工作由 ZooKeeper 来完成， ZooKeeper 用于管理集群中的不同组件。
>
> 每一个工作节点上运行的 Supervisor 监听分配给它那台机器的工作，根据需要启动 / 关闭工作进程，每一个工作进程执行一个 Topology 的一个子集；一个运行的 Topology 由运行在很多机器上的很多工作进程 Worker 组成。那么Storm 的核心就是主节点（Nimbus）、工作节点（Supervisor）、协调器（ZooKeeper）、工作进程（ Worker）、任务线程（Task）。
>
>
>
>
>
> 在系统底层，Storm 使用了 zeromq(0mq, zeromq([http://www.zeromq.org](http://www.zeromq.org/)))。这是一种先进的，可嵌入的网络通讯库，它提供的绝妙功能使 Storm 成为可能。下面列出一些 zeromq 的特性。
>
> - 一个并发架构的 Socket 库
> - 对于集群产品和超级计算，比 TCP 要快
> - 可通过 inproc（进程内）, IPC（进程间）, TCP 和 multicast(多播协议)通信
> - 异步 I / O 的可扩展的多核消息传递应用程序
> - 利用扇出(fanout), 发布订阅（PUB-SUB）,管道（pipeline）, 请求应答（REQ-REP），等方式实现 N-N 连接
>
> Storm 只用了 push/pull sockets



#### Nimbus

> 主节点通常运行一个后台程序——Nimbus，用于响应分布在集群中的节点，分配任务和监测故障，这类似于 Hadoop 中的 JobTracker。
> Nimbus 进程是快速失败（ fail-fast）和无状态的，所有的状态要么在 ZooKeeper 中，要么在本地磁盘上。可以使用 kill -9 来杀死 Nimbus 进程，然后重启即可继续工作。



#### Supervisor

> 工作节点同样会运行一个后台程序——Supervisor，用于收听工作指派并基于要求运行工作进程。每个工作节点都是Topology中一个子集的实现。而Nimbus 和 Supervisor 之间的协调则通过 ZooKeeper 系统。
> 同 样，Supervisor进程也是快速失败（fail-fast）和无状态的， 所有的状态要么在ZooKeeper中，要么在本地磁盘上，用kill -9来杀死Supervisor进程，然后重启就可以继续工作。这个设计使得storm不可思议的稳定。



#### ZooKeeper

> ZooKeeper 是完成 Nimbus 和 Supervisor 之间协调的服务。 Storm使用ZooKeeper 协调集群，由于ZooKeeper 并不用于消息传递，所以Storm给ZooKeeper 带来的压力相当低。**在大多数情况下，单个节点的 ZooKeeper 集群足够胜任，不过为了确保故障恢复或者部署大规模Storm集群，可能需要更大规模的 ZooKeeper 集群**。



#### worker

> 运行具体处理组件逻辑的进程。



#### Topology

> 拓扑。一个Storm拓扑打包了一个实时处理程序的逻辑。一个Storm拓扑类似一个Hadoop的MapReduce任务(Job)。主要区别是MapReduce任务最终会结束，而拓扑会一直运行（当然直到你杀死它)。一个拓扑是一个通过流分组(stream grouping)把Spout和Bolt连接到一起的拓扑结构。一个拓扑就是一个复杂的多阶段的流计算。
>
> 所有Topology任务的提交必须在Storm客户端节点上进行(需要配置~/.storm/storm.yaml文件)，由Nimbus节点分配给其他Supervisor节点进行处理。Nimbus节点首先将提交的Topology进行分片，分成一个个的Task，并将Task和Supervisor相关的信息提交到**zookeeper**集群上，Supervisor会去zookeeper集群上认领自己的Task，通知自己的Worker进程进行Task的处理。总体的Topology处理流程图为：

![](/images/storm/topology处理流程.png)

> 每个Topology都由**Spout和Bolt**组成，在Spout和Bolt传递信息的基本单位叫做**Tuple**，由Spout发出的连续不断的Tuple及其在相应Bolt上处理的子Tuple连起来称为一个**Steam**，每个Stream的命名是在其首个Tuple被Spout发出的时候，此时Storm会利用内部的**Ackor机制**保证每个Tuple可靠的被处理。
>
> 而Tuple可以理解成键值对，其中，键就是定义在declareStream方法中的Fields字段，而值就是在emit方法中发送的Values字段。
>
> 在运行Topology之前，可以通过一些参数的配置来调节运行时的状态，参数的配置是通过Storm框架部署目录下的**conf/storm.yaml**文件来完成的。在此文件中可以配置运行时的Storm本地目录路径、运行时Worker的数目等。
>
> 在代码中，也可以设置Config的一些参数，但是优先级是不同的，不同位置配置Config参数的优先级顺序为：外部组件的special configuration > 内部组件的special configuration > topology内部的configuration > storm.yaml > default.yaml



#### Spout

> 一个在Topology中产生源数据流的组件。通常情况下Spout会从外部数据源中读取数据，然后转换为Topology内部的源数据。Spout 是一个主动的角色，其接口中有个nextTuple()函数， Storm框架会不停地调用此函数，用户只要在其中生成源数据即可。



#### Bolt

> 一个在Topology中接收由Spout或者其他上游Bolt类发来的Tuple数据然后执行处理的组件。Bolt可以执行过滤、函数操作、合并、写数据库等任何操作。Bolt是一个被动的角色，其接口中有个execute(Tuple input)函数，在接收到消息后会调用此函数，用户可以在其中执行自己想要的操作。



#### Task

> Worker中每一个Spout/Bolt的线程称为一个Task。在 Storm 0.8之后，task不再与物理线程对应，同一个Spout/Bolt的Task可能会共享一个物理线程，该线程称为Executor。



#### Tuple

> 元组，一次消息传递的基本单元。



#### Stream

> 源源不断传递的Tuple就组成了stream。



#### Stream Grouping

> 即消息的partition方法。流分组策略告诉Topology如何在两个组件之间发送Tuple。 Storm 中提供若干种实用的grouping方式，包括shuffle, fields hash, all, global, none, direct和localOrShuffle等。
>
> * ShuffleGrouping:随机分组，随机分发Stream中的tuple，保证每个Bolt的Task接收Tuple数量大致一致；
> * FieldsGrouping：按照字段分组，保证相同字段的Tuple分配到同一个Task中；
> * AllGrouping：广播发送，每一个Task都会受到所有的Tuple；
> * GlobalGrouping：全局分组，所有的Tuple都发送到同一个Task中，此时一般将当前Component的并发数目设置为1；
> * NonGrouping：不分组，和ShuffleGrouping类似，当前Task的执行会和它的被订阅者在同一个线程中执行；
> * DirectGrouping：直接分组，直接指定由某个Task来执行Tuple的处理，而且，此时必须有emitDirect方法来发送；
> * localOrShuffleGrouping：和ShuffleGrouping类似，若Bolt有多个Task在同一个进程中，Tuple会随机发给这些Task。



### Storm 的特性

> 在所有这些设计思想与决策中，有一些非常棒的特性成就了独一无二的 Storm。
>
> - 简化编程：如果你曾试着从零开始实现实时处理，你应该明白这是一件多么痛苦的事情。使用 Storm，复杂性被大大降低了。
> - 使用一门基于 JVM 的语言开发会更容易，但是你可以借助一个小的中间件，在 Storm 上使用任何语言开发。有现成的中间件可供选择，当然也可以自己开发中间件。
> - 容错：Storm 集群会关注工作节点状态，如果宕机了必要的时候会重新分配任务。
> - 可扩展：所有你需要为扩展集群所做的工作就是增加机器。Storm 会在新机器就绪时向它们分配任务。
> - 可靠的：所有消息都可保证至少处理一次。如果出错了，消息可能处理不只一次，不过你永远不会丢失消息。
> - 快速：速度是驱动 Storm 设计的一个关键因素
> - 事务性：You can get exactly once messaging semantics for pretty much any computation. 你可以为几乎任何计算得到恰好一次消息语义。



### Topology运行流程

> Topology的运行可以分为**本地模式**和**分布式模式**，模式的设置可以在配置文件中设定，也可以在代码中设置。需要注意的是，在Storm代码编写完成之后，需要打包成jar包放到Nimbus中运行，打包的时候，不需要把依赖的jar都打进去，否则如果把依赖的storm.jar包打进去的话，运行时会出现重复的配置文件错误导致Topology无法运行。因为Topology运行之前，会加载本地的storm.yaml配置文件。
>
> * Storm提交后，会把代码首先存放到**Nimbus节点的inbox目录**下，之后，会把当前Storm运行的配置生成一个**stormconf.ser文件**放到**Nimbus节点的stormdist目录**中，在此目录中同时还有**序列化之后的Topology代码文件**；
> * 在**设定Topology所关联的Spouts和Bolts**时，可以同时**设置当前Spout和Bolt的executor数目和task数目**，默认情况下，一个Topology的task的总和是和executor的总和一致的。之后，系统根据worker的数目，尽量平均的分配这些task的执行。worker在哪个supervisor节点上运行是由storm本身决定的；
> * 任务分配好之后，Nimbus节点会将任务的信息提交到**zookeeper集群**，同时在zookeeper集群中会有**workerbeats节点**，这里**存储了当前Topology的所有worker进程的心跳信息**；
> * Supervisor节点会不断的**轮询**zookeeper集群，在**zookeeper的assignments节点中保存了所有Topology的任务分配信息、代码存储目录、任务之间的关联关系**等，Supervisor通过轮询此节点的内容，来领取自己的任务，启动worker进程运行；
> * 一个Topology运行之后，就会不断的通过Spouts来发送Stream流，通过Bolts来不断的处理接收到的Stream流，Stream流是无界的。这一步会不间断的执行，除非**手动结束Topology**。



### Topology并行度

> * worker：每个worker都属于一个特定的Topology，每个Supervisor节点的worker可以有多个，每个worker使用一个单独的端口，它对Topology中的每个component运行一个或者多个executor线程来提供task的运行服务。
> * executor：executor是产生于worker进程内部的线程，会执行同一个component的一个或者多个task。
> * task：实际的数据处理由task完成，在Topology的生命周期中，每个组件的task数目是不会发生变化的，而executor的数目却不一定。executor数目小于等于task的数目，默认情况下，二者是相等的。
>
> ​    在运行一个Topology时，可以根据具体的情况来设置不同数量的worker、task、executor，而**设置的位置**也可以在多个地方。
>
> * worker设置：
>   * 可以通过设置yaml中的topology.workers属性
>   * 在代码中通过**Config的setNumWorkers方法设定**
>
> * executor设置：
>   * 通过**在Topology的入口类中setBolt、setSpout方法的最后一个参数指定**，不指定的话，默认为1；
>
> * task设置：
>   * 默认情况下，**和executor数目一致**；
>   * 在代码中通过**TopologyBuilder的setNumTasks方法设定具体某个组件的task数目**；



参考：

http://www.cnblogs.com/zlslch/p/5989256.html

https://blog.yaodataking.com/2017/03/07/storm-2/

http://www.cnblogs.com/xymqx/p/4366429.html