---
title: zookeeper概念
date: 2019-01-18 22:07:12
tags: zookeeper概念
categories: 消息队列
---

## 概念

### 分布式系統

> 只要不是工作在同一節點的工作系統和應用，就可稱為分佈式系統。是一个硬件或软件组件分布在网络中的不同的计算机之上，彼此间仅通过消息传递进行通信和协作的系统。



### 分佈式系統特征

> 分布性、对等性、并发性、缺乏全局时钟、故障必然会发生 



### 分佈式系統典型问题

> 通信异常、网络分区、三态(成功、失败、超时)、节点故障



### CAP

> - Consistency 一致性
> - Availability 可用性(指的是快速获取数据)
> - Tolerance of network Partition 分区容错性(分布式)



### BASE

> - 基本可用（Basically Available）：用户都有一种愚蠢的期望，就是当他们把浏览器指向一个网页时，就会有某些信息出现。这是你期望发生的，即便系统的某些部分宕机了也一样。这听上去微不足道，事实却并非如此；有很多系统只要一台服务器宕了，整个系统就宕了。
> - 可伸缩（Scalable/Soft-state ）：添加更多的服务器使得服务更多的客户成为可能。不是创建一个巨大的怪物服务器，而是添加更多的服务器，这更具有前瞻性，而且也通常更便宜。重申一下，这是用户的期望之一：信息不仅仅是出现，而且还要快速地出现。（注意这项用户期望不仅要求伸缩性，还同时要求性能。）
> - 最终一致性（Eventually Consistent）：如果数据最终在所有副本出现的地方变为可用，这就足够了（如上一点所述，你可以有很多副本）。这里的期望是，信息要快速出现才会显得及时。 当你在Craigslist上发布一个广告，它不会马上出现在列表和搜索结果中，这不是太大的问题；但如果一个广告需要几天才出现，就没有人会去用那个网站了。
>
> BASE模型與ACID模型完全不同，牺牲高一致性，获得可用性或可靠性： Basically Available基本可用。支持分区失败(e.g. sharding碎片划分数据库) 。Soft state软状态，状态可以有一段时间不同步，异步。 Eventually consistent最终一致，最终数据是一致的就可以了，而不是實时一致。BASE思想的主要实现有：1.按功能划分数据库；2.sharding碎片。BASE思想主要强调基本的可用性，如果你需要高可用性，也就是纯粹的高性能，那么就要以一致性或容错性为牺牲，BASE思想的方案在性能上还是有潜力可挖的。



### 保证分布式系统的一致性多种协议

> - 2PC：2 Phase-Commit（兩段式提交），请求和执行，所有節點的請求都到達了才會進入第二段提交
> - 3PC：3 Phase-Commit（三段式提交）， CanCommit（發出請求）--> PreCommit（預提交）--> DoCommit（提交）
> - Paxos（帕克索斯）：Leslie Lamport，1990年提出



### 分布式鎖服務

> Google Chubby，分布式锁服务[^1]，GFS/BigTable都用到了chubby
>
> 提供分布式协作、元数据存储、Master选举等功能
>
> 分布式鎖服務的作用是允許各客戶端可以通過chubby進行同步彼此的操作，有一個公共的存儲或服務，各節點與這個公共存儲或服務通信，各節點按固定週期將自己的數據同步到這個公共存儲，在公共存儲上有數據節點，一個數據節點對應一個節點，如果節點故障，公共存儲上的數據節點也隨之移除，其他節點取不到這個節點的數據時，就認為這個節點不存在了。公共存儲還提供主節點選舉功能，為必免公共存儲故障，所以公共存儲也要高可用，另外公共存儲的高可用也會自己為自己提供所謂的分佈式協作服務。
>
> HDFS/HBase, Zookeeper
>
> zookeeper是一个开源的分布式协调服务，由知名互联网公司Yahoo创建，它是Chubby的开源实现；换句话讲，**zk是一个典型的分布式数据一致性解决方案，分布式应用程序可以基于它实现数据的发布/订阅、负载均衡、名称服务、分布式协调/通知、集群管理、Master选举、分布式锁和分布式队列；**



## Zookeeper基本概念

> Zookeeper是一个分布式协调服务，可用于服务发现，分布式锁，分布式领导选举，配置管理等。
> 这一切的基础，都是Zookeeper提供了一个类似于Linux文件系统的树形结构（可认为是轻量级的内存文件系统，但只适合存少量信息，完全不适合存储大量文件或者大文件），同时提供了对于每个节点的监控与通知机制。



### Zookeeper架构

#### 角色

>Zookeeper集群是一个基于主从复制的高可用集群，每个服务器承担如下三种角色中的一种
>
>- **Leader**：一个Zookeeper集群同一时间只会有一个实际工作的Leader，它会发起并维护与各Follwer及Observer间的心跳。所有的写操作必须要通过Leader完成再由Leader将写操作广播给其它服务器。
>- **Follower**：一个Zookeeper集群可能同时存在多个Follower，它会响应Leader的心跳。Follower可直接处理并返回客户端的读请求，同时会将写请求转发给Leader处理，并且负责在Leader处理写请求时对请求进行投票。
>- **Observer** 角色与Follower类似，但是无投票权。

![](/images/zookeeper/角色.png)

#### 原子广播（ZAB）

> 为了保证写操作的一致性与可用性，Zookeeper专门设计了一种名为原子广播（ZAB）的支持崩溃恢复的一致性协议。基于该协议，Zookeeper实现了一种主从模式的系统架构来保持集群中各个副本之间的数据一致性。
>
> 根据ZAB协议，所有的写操作都必须通过Leader完成，Leader写入本地日志后再复制到所有的Follower节点。
>
> 一旦Leader节点无法工作，ZAB协议能够自动从Follower节点中重新选出一个合适的替代者，即新的Leader，该过程即为领导选举。该领导选举过程，是ZAB协议中最为重要和复杂的过程。



#### 写操作

##### 写Leader

> 通过Leader进行写操作流程如下图所示

![](/images/zookeeper/写leader.png)

> 由上图可见，通过Leader进行写操作，主要分为五步：
>
> 1. 客户端向Leader发起写请求
> 2. Leader将写请求以Proposal(建议;提议;)的形式发给所有Follower并等待ACK
> 3. Follower收到Leader的Proposal后返回ACK
> 4. Leader得到过半数的ACK（Leader对自己默认有一个ACK）后向所有的Follower和Observer发送Commmit
> 5. Leader将处理结果返回给客户端
>
> 这里要注意
>
> - Leader并不需要得到Observer的ACK，即Observer无投票权
> - Leader不需要得到所有Follower的ACK，只要收到过半的ACK即可，同时Leader本身对自己有一个ACK。上图中有4个Follower，只需其中两个返回ACK即可，因为(2+1) / (4+1) > 1/2
> - Observer虽然无投票权，但仍须同步Leader的数据从而在处理读请求时可以返回尽可能新的数据



##### 写Follower/Observer 

> 通过Follower/Observer进行写操作流程如下图所示：

![](/images/zookeeper/写follower_observer.png)

> 从上图可见
>
> - Follower/Observer均可接受写请求，但不能直接处理，而需要将写请求转发给Leader处理
> - 除了多了一步请求转发，其它流程与直接写Leader无任何区别



#### 读操作

> Leader/Follower/Observer都可直接处理读请求，从本地内存中读取数据并返回给客户端即可。

![](/images/zookeeper/读操作.png)

> 由于处理读请求不需要服务器之间的交互，Follower/Observer越多，整体可处理的读请求量越大，也即读性能越好。 



### FastLeaderElection(快速领袖选举)原理

#### 术语

##### myid

> 每个Zookeeper服务器，都需要在数据文件夹下创建一个名为myid的文件，该文件包含整个Zookeeper集群唯一的ID（整数）。例如某Zookeeper集群包含三台服务器，hostname分别为zoo1、zoo2和zoo3，其myid分别为1、2和3，则在配置文件中其ID与hostname必须一一对应，如下所示。在该配置文件中，`server.`后面的数据即为myid

```shell
server.1=zoo1:2888:3888
server.2=zoo2:2888:3888
server.3=zoo3:2888:3888
```



##### zxid(事务ID)

> 类似于RDBMS中的事务ID，用于标识一次更新操作的Proposal ID。为了保证顺序性，该zxid必须单调递增[^2]。因此Zookeeper使用一个64位的数来表示，高32位是Leader的epoch，从1开始，每次选出新的Leader，epoch加一。低32位为该epoch内的序号，每次epoch变化，都将低32位的序号重置。这样保证了zxid的全局递增性。



#### 支持的领导选举算法

> 可通过`electionAlg`配置项设置Zookeeper用于领导选举的算法。
>
> 到3.4.10版本为止，可选项有
>
> - 0：基于UDP的LeaderElection
> - 1：基于UDP的FastLeaderElection
> - 2：基于UDP和认证的FastLeaderElection
> - 3：基于TCP的FastLeaderElection
>
> 在3.4.10版本中，默认值为3，也即基于TCP的FastLeaderElection。另外三种算法已经被弃用，并且有计划在之后的版本中将它们彻底删除而不再支持。



#### FastLeaderElection

> FastLeaderElection选举算法是标准的Fast Paxos算法实现，可解决LeaderElection选举算法收敛速度慢的问题。



##### 服务器状态

> - **LOOKING** 不确定Leader状态。该状态下的服务器认为当前集群中没有Leader，会发起Leader选举
> - **FOLLOWING** 跟随者状态。表明当前服务器角色是Follower，并且它知道Leader是谁
> - **LEADING** 领导者状态。表明当前服务器角色是Leader，它会维护与Follower间的心跳
> - **OBSERVING** 观察者状态。表明当前服务器角色是Observer，与Follower唯一的不同在于不参与选举，也不参与集群写操作时的投票



##### 选票数据结构

> 每个服务器在进行领导选举时，会发送如下关键信息
>
> - **logicClock** 每个服务器会维护一个自增的整数，名为logicClock，它表示这是该服务器发起的第多少轮投票
> - **state** 当前服务器的状态
> - **self_id** 当前服务器的myid
> - **self_zxid** 当前服务器上所保存的数据的最大zxid
> - **vote_id** 被推举的服务器的myid
> - **vote_zxid** 被推举的服务器上所保存的数据的最大zxid



##### 投票流程

###### 自增选举轮次

> Zookeeper规定所有有效的投票都必须在同一轮次中。每个服务器在开始新一轮投票时，会先对自己维护的logicClock进行自增操作。 



###### 初始化选票

> 每个服务器在广播自己的选票前，会将自己的投票箱清空。该投票箱记录了所收到的选票。例：服务器2投票给服务器3，服务器3投票给服务器1，则服务器1的投票箱为(2, 3), (3, 1), (1, 1)。票箱中只会记录每一投票者的最后一票，如投票者更新自己的选票，则其它服务器收到该新选票后会在自己票箱中更新该服务器的选票。 



###### 发送初始化选票

> 每个服务器最开始都是通过广播把票投给自己。



###### 接收外部投票

> 服务器会尝试从其它服务器获取投票，并记入自己的投票箱内。如果无法获取任何外部投票，则会确认自己是否与集群中其它服务器保持着有效连接。如果是，则再次发送自己的投票；如果否，则马上与之建立连接。



###### 判断选举轮次

> 收到外部投票后，首先会根据投票信息中所包含的logicClock来进行不同处理
>
> - 外部投票的logicClock大于自己的logicClock。说明该服务器的选举轮次落后于其它服务器的选举轮次，立即清空自己的投票箱并将自己的logicClock更新为收到的logicClock，然后再对比自己之前的投票与收到的投票以确定是否需要变更自己的投票，最终再次将自己的投票广播出去。
> - 外部投票的logicClock小于自己的logicClock。当前服务器直接忽略该投票，继续处理下一个投票。
> - 外部投票的logickClock与自己的相等。当时进行选票PK。



###### 选票PK

> 选票PK是基于(self_id, self_zxid)与(vote_id, vote_zxid)的对比
>
> - 外部投票的logicClock大于自己的logicClock，则将自己的logicClock及自己的选票的logicClock变更为收到的logicClock
> - 若logicClock一致，则对比二者的vote_zxid，若外部投票的vote_zxid比较大，则将自己的票中的vote_zxid与vote_myid更新为收到的票中的vote_zxid与vote_myid并广播出去，另外将收到的票及自己更新后的票放入自己的票箱。如果票箱内已存在(self_myid, self_zxid)相同的选票，则直接覆盖
> - 若二者vote_zxid一致，则比较二者的vote_myid，若外部投票的vote_myid比较大，则将自己的票中的vote_myid更新为收到的票中的vote_myid并广播出去，另外将收到的票及自己更新后的票放入自己的票箱



###### 统计选票

> 如果已经确定有过半服务器认可了自己的投票（可能是更新后的投票），则终止投票。否则继续接收其它服务器的投票。



###### 更新服务器状态

> 投票终止后，服务器开始更新自身状态。若过半的票投给了自己，则将自己的服务器状态更新为LEADING，否则将自己的状态更新为FOLLOWING



#### 几种领导选举场景

##### 集群启动领导选举

###### 初始投票给自己

> 集群刚启动时，所有服务器的logicClock都为1，zxid都为0。
>
> 各服务器初始化后，都投票给自己，并将自己的一票存入自己的票箱，如下图所示。

![](/images/zookeeper/初始投票给自己.png)

> 在上图中，(1, 1, 0)第一位数代表投出该选票的服务器的logicClock，第二位数代表被推荐的服务器的myid，第三位代表被推荐的服务器的最大的zxid。由于该步骤中所有选票都投给自己，所以第二位的myid即是自己的myid，第三位的zxid即是自己的zxid。  此时各自的票箱中只有自己投给自己的一票。 



###### 更新选票

> 服务器收到外部投票后，进行选票PK，相应更新自己的选票并广播出去，并将合适的选票存入自己的票箱，如下图所示。 

![](/images/zookeeper/更新选票.png)

> 服务器1收到服务器2的选票（1, 2, 0）和服务器3的选票（1, 3, 0）后，由于所有的logicClock都相等，所有的zxid都相等，因此根据myid判断应该将自己的选票按照服务器3的选票更新为（1, 3, 0），并将自己的票箱全部清空，再将服务器3的选票与自己的选票存入自己的票箱，接着将自己更新后的选票广播出去。此时服务器1票箱内的选票为(1, 3)，(3, 3)。  同理，服务器2收到服务器3的选票后也将自己的选票更新为（1, 3, 0）并存入票箱然后广播。此时服务器2票箱内的选票为(2, 3)，(3, 3)。  服务器3根据上述规则，无须更新选票，自身的票箱内选票仍为（3, 3）。  服务器1与服务器2更新后的选票广播出去后，由于三个服务器最新选票都相同，最后三者的票箱内都包含三张投给服务器3的选票。 



###### 根据选票确定角色

> 根据上述选票，三个服务器一致认为此时服务器3应该是Leader。因此服务器1和2都进入FOLLOWING状态，而服务器3进入LEADING状态。之后Leader发起并维护与Follower间的心跳。

![](/images/zookeeper/根据选票确定角色.png)

##### Follower重启

###### Follower重启投票给自己

> Follower重启，或者发生网络分区后找不到Leader，会进入LOOKING状态并发起新的一轮投票。

![](/images/zookeeper/follower重启投票给自己.png)



###### 发现已有Leader后成为Follower

> 服务器3收到服务器1的投票后，将自己的状态LEADING以及选票返回给服务器1。服务器2收到服务器1的投票后，将自己的状态FOLLOWING及选票返回给服务器1。此时服务器1知道服务器3是Leader，并且通过服务器2与服务器3的选票可以确定服务器3确实得到了超过半数的选票。因此服务器1进入FOLLOWING状态。 

![](/images/zookeeper/发现已有leader后成为follower.png)



##### Leader重启

######  Follower发起新投票

> Leader（服务器3）宕机后，Follower（服务器1和2）发现Leader不工作了，因此进入LOOKING状态并发起新的一轮投票，并且都将票投给自己。

![](/images/zookeeper/follower发起新投票.png)



###### 广播更新选票

> 服务器1和2根据外部投票确定是否要更新自身的选票。这里有两种情况
>
> - 服务器1和2的zxid相同。例如在服务器3宕机前服务器1与2完全与之同步。此时选票的更新主要取决于myid的大小
> - 服务器1和2的zxid不同。在旧Leader宕机之前，其所主导的写操作，只需过半服务器确认即可，而不需所有服务器确认。换句话说，服务器1和2可能一个与旧Leader同步（即zxid与之相同）另一个不同步（即zxid比之小）。此时选票的更新主要取决于谁的zxid较大
>
> 在上图中，服务器1的zxid为11，而服务器2的zxid为10，因此服务器2将自身选票更新为（3, 1, 11），如下图所示。

![](/images/zookeeper/广播更新选票.png)



###### 选出新Leader

> 经过上一步选票更新后，服务器1与服务器2均将选票投给服务器1，因此服务器2成为Follower，而服务器1成为新的Leader并维护与服务器2的心跳。

![](/images/zookeeper/选出新leader1.png)



###### 旧Leader恢复后发起选举

> 旧的Leader恢复后，进入LOOKING状态并发起新一轮领导选举，并将选票投给自己。此时服务器1会将自己的LEADING状态及选票（3, 1, 11）返回给服务器3，而服务器2将自己的FOLLOWING状态及选票（3, 1, 11）返回给服务器3。如下图所示。 

![](/images/zookeeper/旧Leader恢复后发起选举.png)



###### 旧Leader成为Follower

> 服务器3了解到Leader为服务器1，且根据选票了解到服务器1确实得到过半服务器的选票，因此自己进入FOLLOWING状态。

![](/images/zookeeper/旧Leader成为Follower.png)



### 一致性保证

> ZAB协议保证了在Leader选举的过程中，已经被Commit的数据不会丢失，未被Commit的数据对客户端不可见。 



#### Commit过的数据不丢失

##### **Failover前状态** 

> 为更好演示Leader Failover过程，本例中共使用5个Zookeeper服务器。A作为Leader，共收到P1、P2、P3三条消息，并且Commit了1和2，且总体顺序为P1、P2、C1、P3、C2。根据顺序性原则，其它Follower收到的消息的顺序肯定与之相同。其中B与A完全同步，C收到P1、P2、C1，D收到P1、P2，E收到P1，如下图所示。

![](/images/zookeeper/Failover前状态.png)

> 这里要注意
>
> - 由于A没有C3，意味着收到P3的服务器的总个数不会超过一半，也即包含A在内最多只有两台服务器收到P3。在这里A和B收到P3，其它服务器均未收到P3
> - 由于A已写入C1、C2，说明它已经Commit了P1、P2，因此整个集群有超过一半的服务器，即最少三个服务器收到P1、P2。在这里所有服务器都收到了P1，除E外其它服务器也都收到了P2



##### 选出新Leader

> 旧Leader也即A宕机后，其它服务器根据上述FastLeaderElection算法选出B作为新的Leader。C、D和E成为Follower且以B为Leader后，会主动将自己最大的zxid发送给B，B会将Follower的zxid与自身zxid间的所有被Commit过的消息同步给Follower，如下图所示。 

![](/images/zookeeper/选出新leader2.png)

> 在上图中
>
> - P1和P2都被A Commit，因此B会通过同步保证P1、P2、C1与C2都存在于C、D和E中
> - P3由于未被A Commit，同时幸存的所有服务器中P3未存在于大多数据服务器中，因此它不会被同步到其它Follower



##### 通知Follower可对外服务

> 同步完数据后，B会向D、C和E发送NEWLEADER命令并等待大多数服务器的ACK（下图中D和E已返回ACK，加上B自身，已经占集群的大多数），然后向所有服务器广播UPTODATE命令。收到该命令后的服务器即可对外提供服务。 

![](/images/zookeeper/通知Follower可对外服务.png)



#### 未Commit过的消息对客户端不可见

> 在上例中，P3未被A Commit过，同时因为没有过半的服务器收到P3，因此B也未Commit P3（如果有过半服务器收到P3，即使A未Commit P3，B会主动Commit P3，即C3），所以它不会将P3广播出去。
>
> 具体做法是，B在成为Leader后，先判断自身未Commit的消息（本例中即P3）是否存在于大多数服务器中从而决定是否要将其Commit。然后B可得出自身所包含的被Commit过的消息中的最小zxid（记为min_zxid）与最大zxid（记为max_zxid）。C、D和E向B发送自身Commit过的最大消息zxid（记为max_zxid）以及未被Commit过的所有消息（记为zxid_set）。B根据这些信息作出如下操作
>
> - 如果Follower的max_zxid与Leader的max_zxid相等，说明该Follower与Leader完全同步，无须同步任何数据
> - 如果Follower的max_zxid在Leader的(min_zxid，max_zxid)范围内，Leader会通过TRUNC命令通知Follower将其zxid_set中大于Follower的max_zxid（如果有）的所有消息全部删除
>
> 上述操作保证了未被Commit过的消息不会被Commit从而对外不可见。
>
> 上述例子中Follower上并不存在未被Commit的消息。但可考虑这种情况，如果将上述例子中的服务器数量从五增加到七，服务器F包含P1、P2、C1、P3，服务器G包含P1、P2。此时服务器F、A和B都包含P3，但是因为票数未过半，因此B作为Leader不会Commit P3，而会通过TRUNC命令通知F删除P3。如下图所示。

![](/images/zookeeper/未Commit过的消息对客户端不可见.png)



### 总结

> - 由于使用主从复制模式，所有的写操作都要由Leader主导完成，而读操作可通过任意节点完成，因此Zookeeper读性能远好于写性能，更适合读多写少的场景
> - 虽然使用主从复制模式，同一时间只有一个Leader，但是Failover机制保证了集群不存在单点失败（SPOF）的问题
> - ZAB协议保证了Failover过程中的数据一致性
> - 服务器收到数据后先写本地文件再进行处理，保证了数据的持久性



### Zookeeper特点

#### Zookeeper节点类型

> 如上文《[Zookeeper架构及FastLeaderElection机制](http://www.jasongj.com/zookeeper/fastleaderelection)》所述，Zookeeper 提供了一个类似于 Linux 文件系统的树形结构。该树形结构中每个节点被称为 znode ，可按如下两个维度分类
>
> - *Persist vs. Ephemeral* (表示永久节点与临时节点)
>   - **Persist**节点，一旦被创建，便不会意外丢失，即使服务器全部重启也依然存在。每个 Persist 节点即可包含数据，也可包含子节点
>   - **Ephemeral**节点，在创建它的客户端与服务器间的 Session 结束时自动被删除。服务器重启会导致 Session 结束，因此 Ephemeral 类型的 znode 此时也会自动删除
> - *Sequence vs. Non-sequence* （序列化与非序列化）
>   - **Non-sequence**节点，多个客户端同时创建同一 Non-sequence 节点时，只有一个可创建成功，其它匀失败。并且创建出的节点名称与创建时指定的节点名完全一样
>   - **Sequence**节点，创建出的节点名在指定的名称之后带有10位10进制数的序号。多个客户端创建同一名称的节点时，都能创建成功，只是序号不同



#### Zookeeper语义保证

> Zookeeper 简单高效，同时提供如下语义保证，从而使得我们可以利用这些特性提供复杂的服务。
>
> - **顺序性**　客户端发起的更新会按发送顺序被应用到 Zookeeper 上
> - **原子性** 更新操作要么成功要么失败，不会出现中间状态
> - **单一系统镜像**　一个客户端无论连接到哪一个服务器都能看到完全一样的系统镜像（即完全一样的树形结构）。**注：**根据上文《[Zookeeper架构及FastLeaderElection机制](http://www.jasongj.com/zookeeper/fastleaderelection)》介绍的 ZAB 协议，写操作并不保证更新被所有的 Follower 立即确认，因此通过部分 Follower 读取数据并不能保证读到最新的数据，而部分 Follwer 及 Leader 可读到最新数据。如果一定要保证**单一系统镜像**，可在读操作前使用 sync 方法。
> - **可靠性**　一个更新操作一旦被接受即不会意外丢失，除非被其它更新操作覆盖
> - **最终一致性**　写操作最终（而非立即）会对客户端可见



#### Zookeeper Watch机制

> **所有对 Zookeeper 的读操作，都可附带一个 Watch **。一旦相应的数据有变化，该 Watch 即被触发。Watch 有如下特点
>
> - **主动推送**　Watch被触发时，由 Zookeeper 服务器主动将更新推送给客户端，而不需要客户端轮询。
> - **一次性**　数据变化时，Watch 只会被触发一次。如果客户端想得到后续更新的通知，必须要在 Watch 被触发后重新注册一个 Watch。
> - **可见性**　如果一个客户端在读请求中附带 Watch，Watch 被触发的同时再次读取数据，客户端在得到 Watch 消息之前肯定不可能看到更新后的数据。换句话说，更新通知先于更新结果。也就是先收到通知，才能看到结果。
> - **顺序性**　如果多个更新触发了多个 Watch ，那 Watch 被触发的顺序与更新顺序一致。



### 分布式锁与领导选举关键点

#### 最多一个获取锁 / 成为Leader

> 对于分布式锁（这里特指排它锁）而言，任意时刻，最多只有一个进程（对于单进程内的锁而言是单线程）可以获得锁。
>
> 对于领导选举而言，任意时间，最多只有一个成功当选为Leader。否则即出现脑裂（Split brain）



#### 锁重入 / 确认自己是Leader

> 对于分布式锁，需要保证获得锁的进程在释放锁之前可再次获得锁，即锁的可重入性。
>
> 对于领导选举，Leader需要能够确认自己已经获得领导权，即确认自己是Leader。



#### 释放锁 / 放弃领导权

> 锁的获得者应该能够正确释放已经获得的锁，并且当获得锁的进程宕机时，锁应该自动释放，从而使得其它竞争方可以获得该锁，从而避免出现死锁的状态。
>
> 领导应该可以主动放弃领导权，并且当领导所在进程宕机时，领导权应该自动释放，从而使得其它参与者可重新竞争领导而避免进入无主状态。



#### 感知锁释放 / 领导权的放弃

> 当获得锁的一方释放锁时，其它对于锁的竞争方需要能够感知到锁的释放，并再次尝试获取锁。
>
> 原来的Leader放弃领导权时，其它参与方应该能够感知该事件，并重新发起选举流程。



### 非公平领导选举

> 从上面几个方面可见，分布式锁与领导选举的技术要点非常相似，实际上其实现机制也相近。本章就以领导选举为例来说明二者的实现原理，分布式锁的实现原理也几乎一致。 



#### 选主过程

> 假设有三个Zookeeper的客户端，如下图所示，同时竞争Leader。这三个客户端同时向Zookeeper集群注册**Ephemeral**且**Non-sequence**类型的节点，路径都为`/zkroot/leader`（工程实践中，路径名可自定义）。

![](/images/zookeeper/选主过程.png)

> 如上图所示，由于是**Non-sequence**节点，这三个客户端只会有一个创建成功，其它节点均创建失败。此时，创建成功的客户端（即上图中的`Client 1`）即成功竞选为 Leader 。其它客户端（即上图中的`Client 2`和`Client 3`）此时匀为 Follower。 



#### 放弃领导权

> 如果 Leader 打算主动放弃领导权，直接删除`/zkroot/leader`节点即可。
>
> 如果 Leader 进程意外宕机，其与 Zookeeper 间的 Session 也结束，该节点由于是**Ephemeral**类型的节点，因此也会自动被删除。
>
> 此时`/zkroot/leader`节点不复存在，对于其它参与竞选的客户端而言，之前的 Leader 已经放弃了领导权。



#### 感知领导权的放弃

> 由上图可见，创建节点失败的节点，除了成为 Follower 以外，还会向`/zkroot/leader`注册一个 Watch ，一旦 Leader 放弃领导权，也即该节点被删除，所有的 Follower 会收到通知。 



#### 重新选举

> 感知到旧 Leader 放弃领导权后，所有的 Follower 可以再次发起新一轮的领导选举，如下图所示。 

![](/images/zookeeper/重新选举.png)

> 从上图中可见
>
> - 新一轮的领导选举方法与最初的领导选举方法完全一样，都是发起节点创建请求，创建成功即为 Leader，否则为 Follower ，且 Follower 会 Watch 该节点
> - 新一轮的选举结果，无法预测，与它们在第一轮选举中的顺序无关。这也是该方案被称为`非公平模式`的原因



#### 非公平模式总结

> - 非公平模式实现简单，每一轮选举方法都完全一样
> - 竞争参与方不多的情况下，效率高。每个 Follower 通过 Watch 感知到节点被删除的时间不完全一样，只要有一个 Follower 得到通知即发起竞选，即可保证当时有新的 Leader 被选出
> - 给Zookeeper 集群造成的负载大，因此扩展性差。如果有上万个客户端都参与竞选，意味着同时会有上万个写请求发送给 Zookeper。如《[Zookeeper架构](http://www.jasongj.com/zookeeper/fastleaderelection/)》一文所述，Zookeeper 存在单点写的问题，写性能不高。同时一旦 Leader 放弃领导权，Zookeeper 需要同时通知上万个 Follower，负载较大。



### 公平领导选举

#### 选主过程

> 如下图所示，公平领导选举中，各客户端均创建`/zkroot/leader`节点，且其类型为**Ephemeral**与**Sequence**。

![](/images/zookeeper/公平选主过程.png)

> 由于是**Sequence**类型节点，故上图中三个客户端均创建成功，只是序号不一样。此时，每个客户端都会判断自己创建成功的节点的序号是不是当前最小的。如果是，则该客户端为 Leader，否则即为 Follower。
>
> 在上图中，`Client 1`创建的节点序号为 1 ，`Client 2`创建的节点序号为 2，`Client 3`创建的节点序号为3。由于最小序号为 1 ，且该节点由`Client 1`创建，故`Client 1`为 Leader 。



#### 放弃领导权

> Leader 如果主动放弃领导权，直接删除其创建的节点即可。
>
> 如果 Leader 所在进程意外宕机，其与 Zookeeper 间的 Session 结束，由于其创建的节点为**Ephemeral**类型，故该节点自动被删除。



#### 感知领导权的放弃

> 与非公平模式不同，每个 Follower 并非都 Watch 由 Leader 创建出来的节点，而是 Watch 序号刚好比自己序号小的节点。
>
> 在上图中，总共有 1、2、3 共三个节点，因此`Client 2` Watch `/zkroot/leader1`，`Client 3` Watch `/zkroot/leader2`。（注：序号应该是10位数字，而非一位数字，这里为了方便，以一位数字代替）
>
> 一旦 Leader 宕机，`/zkroot/leader1`被删除，`Client 2`可得到通知。此时`Client 3`由于 Watch 的是`/zkroot/leader2`，故不会得到通知。



#### 重新选举

> `Client 2`得到`/zkroot/leader1`被删除的通知后，不会立即成为新的 Leader 。而是先判断自己的序号 2 是不是当前最小的序号。在该场景下，其序号确为最小。因此`Client 2`成为新的 Leader 。

![](/images/zookeeper/公平重新选举.png)

这里要注意，如果在`Client 1`放弃领导权之前，`Client 2`就宕机了，`Client 3`会收到通知。此时`Client 3`不会立即成为Leader，而是要先判断自己的序号 3 是否为当前最小序号。很显然，由于`Client 1`创建的`/zkroot/leader1`还在，因此`Client 3`不会成为新的 Leader ，并向`Client 2`序号 2 前面的序号，也即 1 创建 Watch。该过程如下图所示。 

![](/images/zookeeper/公平重新选举2.png)



#### 公平模式总结

> - 实现相对复杂
> - 扩展性好，每个客户端都只 Watch 一个节点且每次节点被删除只须通知一个客户端
> - 旧 Leader 放弃领导权时，其它客户端根据竞选的先后顺序（也即节点序号）成为新 Leader，这也是`公平模式`的由来
> - 延迟相对非公平模式要高，因为它必须等待特定节点得到通知才能选出新的 Leader



### 总结

> 基于 Zookeeper 的领导选举或者分布式锁的实现均基于 Zookeeper 节点的特性及通知机制。充分利用这些特性，还可以开发出适用于其它场景的分布式应用。 



#### 集群角色

> - Leader：选举产生，读/写；
> - Follower：参与选举，可被选举，读服务；
> - Observer：参与选举，不可被选举，提供读服务；一般不需要Observer



#### 会话

>  ZK中，客户端要長期與服务端保持連接，使用TCP长连接；分佈式系統利用zk來進行協調，這個分佈式系統也可能是一個集群，如果想知道分佈式系統中其他節點的狀態，可以到zk上請求相應的信息。zk中的數據管理模型是倒置的樹狀結構。是在zk的內存中存放的樹狀文件系統，一個分佈式系統可以註冊使用一個樹狀文件系統的子節點。



#### 数据节点(ZNode)

>  即zk数据模型中的数据单元；zk的数据都存储于内存中，数据模型为树状结构(ZNode Tree)；每个ZNode都会保存自己的数据于内存中；znode有兩類：
>
> - 持久节点：仅显式删除才消失
> - 临时节点：会话中止即自动消失



#### 版本（version）：ZK会为每个ZNode维护一个称之为Stat的数据结构，记录了当前ZNode的三个数据版本

> - version：当前版本
> - cversion：当前znode的子节点的版本
> - aversion：当前znode的ACL的版本



#### ACL：ZK使用ACL机制进行权限控制

>  CREATE， READ，WRITE，DELETE，ADMIN



#### 事件监听器(Watcher)

>  ZK上，由用户指定的触发机制，在某些事件产生时，ZK能够将通知發给相关的客户端；



#### ZAB协议

> Zookeeper Atomic Broadcast，ZK原子广播协议；用來支持崩潰恢復機制，保證在leader進程崩潰時重新選舉出新的leader，并且保證數據完整性，這指的是zk自己的leader分区，也包含基於zk所註冊的leader分區，如果不強調，就專指zk自己的。
>
> 根据ZAB协议，所有的写操作都必须通过Leader完成，Leader写入本地日志后再复制到所有的Follower节点。
>
> 一旦Leader节点无法工作，ZAB协议能够自动从Follower节点中重新选出一个合适的替代者，即新的Leader，该过程即为领导选举。该领导选举过程，是ZAB协议中最为重要和复杂的过程。
>
> zk中所有事務請求都是由leader來處理的。當一個節點要寫某一數據時，寫操作是發給zk的leader的，leader要把這個寫請求轉為一個提案，向當前的zk集群中進行廣播，意思是我現在要改一個數據，大家是否同意，如果有一個follower同意，這就超過半數了(集群中有三個節點)，如果過半數，數據便會被寫進內存了，並更新到元數據，并且結果會通知到沒來參加選舉的節點。所有事務都要由leader來接收和處理，所以客戶端無論連接哪個zk節點上，如果它不是一個leader的話，它應該把信息轉給leader，leader會把每個客戶端的請求轉為一個提案，向當前的集群中進行廣播，在收到過半數的Follower同意之後，將會確認此操作並將結果廣播給其他的Follower而後完成提交



#### ZAB协议中存在三种状态

> - Looking, 每個zk節點剛啟動時，它應該先去找leader，所謂找組織，或選舉leader的狀態
> - Following，Follower所處的狀態就是Following狀態，表示已經有leader了
> - Leading，Leader所處的狀態就是Leading狀態
>
>  zk啟動時，所有節點都處於Looking狀態，這時集群會嘗試選舉出一個Leader，被選舉出的Leader將狀態切換為Leading，其他的切換為Following狀態，當節點其他主機發現已經選舉出了Leader，如後來加入的主機，將自動從Looking轉為Following狀態，嘗試與Leader保持同步數據，當Follower與Leader節點失去聯繫時，Follower會再切換到Looking狀態並開啟新一輪選舉。zk集群中的主機會在這三個狀態之間轉換。選舉出Leader節點後，ZAB協議將進入原子廣播階段，這時Leader會與自己同步的每一個Follower節點創建一個操作序列，因為Follower與Leader的數據不一樣，所以Leader要將自己所有的數據打包，同步給每一個Follower節點。Leader與Follower節點還必須使用心跳檢測機制，去檢測每一個Follower是否處於正常狀態。這種檢測機制就相當於Follower在不斷地在集群中的某個數據節點更新自己的數據版本或時間戳，如果更新了，那麼Leader就認為Follower是正常的，否則一旦在一個超出指令時間的範圍當中，一個Follower沒有更新自己的心跳信息，這個Follower就被認為失去了連接狀態，如果是Leader失去連接，那麼所有節點就轉為Looking狀態，再進行選舉。



#### 四个阶段

>  选举:election
>
>  发现：discovery
>
>  同步：sync
>
>  广播：Broadcast



### FAQ

> 启动zookeeper后，会在/root目录下生成一个zookeeper.out文件，这个文件会非常大，需要使用``` echo "" > zookeeper.out```命令清空此文件，如果删除此文件，磁盘空间不会立即释放，还需要重启zookeeper服务。








[^註釋]: 在传统的文件传输里面（read/write方式），在实现上其实是比较复杂的，需要经过多次上下文的切换，当需要对一个文件进行传输的时候，其具体流程细节如下：调用read函数，文件数据被copy到内核缓冲区read函数返回，文件数据从内核缓冲区copy到用户缓冲区write函数调用，将文件数据从用户缓冲区copy到内核与socket相关的缓冲区。数据从socket缓冲区copy到相关协议引擎。以上细节是传统read/write方式进行网络文件传输的方式，我们可以看到，在这个过程当中，文件数据实际上是经过了四次copy操作：硬盘—&gt;内核buf—&gt;用户buf—&gt;socket相关缓冲区—&gt;协议引擎。而sendfile系统调用则提供了一种减少以上多次copy，提升文件传输性能的方法。Sendfile系统调用是在2.1版本内核时引进的：sendfile(socket, file, len)运行流程如下：sendfile系统调用，文件数据被copy至内核缓冲区再从内核缓冲区copy至内核中socket相关的缓冲区，最后再從socket相关的缓冲区copy到协议引擎。相较传统read/write方式，2.1版本内核引进的sendfile已经减少了内核缓冲区到user缓冲区，再由user缓冲区到socket相关缓冲区的文件copy，而在内核版本2.4之后，文件描述符结果被改变，sendfile实现了更简单的方式，系统调用方式仍然一样，细节与2.1版本的不同之处在于，当文件数据被复制到内核缓冲区时，不再将所有数据copy到socket相关的缓冲区，而是仅仅将记录数据位置和长度相关的数据保存到socket相关的缓存，而实际数据将由DMA模块直接发送到协议引擎，再次减少了一次copy操作。

[^1]: 分布式锁，是单机锁的一种扩展，主要是为了锁住分布式系统中不同机器代码的物理块或逻辑块。以此保证不同机器之间的逻辑一致性。1. 可以保证在分布式部署的应用集群中，同一个方法在同一时间只能被一台机器上的一个线程执行。2. 这把锁要是一把可重入锁（避免死锁）. 3. 这把锁最好是一把阻塞锁（根据业务需求考虑要不要这条）4. 有高可用的获取锁和释放锁功能. 5. 获取锁和释放锁的性能要好

[^2]: 单调递增指只增加不会减小。
