---
title: redis命令
date: 2019-01-08 09:34:35
tags: redis命令
categories: Redis
---

### 安装

```shell
[root@test ~]# yum install -y redis
[root@test ~]# rpm -ql redis
/etc/logrotate.d/redis
/etc/redis-sentinel.conf
/etc/redis.conf
/etc/systemd/system/redis-sentinel.service.d
/etc/systemd/system/redis-sentinel.service.d/limit.conf
/etc/systemd/system/redis.service.d
/etc/systemd/system/redis.service.d/limit.conf
/usr/bin/redis-benchmark：评估redis性能
/usr/bin/redis-check-aof：检测工具
/usr/bin/redis-check-rdb：检测工具
/usr/bin/redis-cli
/usr/bin/redis-sentinel
/usr/bin/redis-server：主程序
/usr/lib/systemd/system/redis-sentinel.service
/usr/lib/systemd/system/redis.service
/usr/libexec/redis-shutdown
...
/var/lib/redis：数据存储目录
/var/log/redis
/var/run/redis
[root@test ~]# systemctl start redis
# 启动
[root@test ~]# ss -tln
State       Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN      0      128    127.0.0.1:6379                    *:*  
# 监听127地址的6379端口，要监听在所有地址，需要认证，只有密码，没有用户名
[root@test ~]# redis-cli -h localhost -p 6379
# 连接本机的redis，-h指定地址，-p指定端口，-a指定密码，连接本机时不用密码
localhost:6379> SELECT 0
OK
# 切换数据库，数据库以数字表示，默认是16个库，0－15
# help @<group>可查看一组命令的使用格式；help <command>可查看单个命令的使用方法；help <tab>可切换命令组；
localhost:6379> help @list
localhost:6379> SET name tom
OK
# 设置健为name，值为tom
localhost:6379> GET name
"tom"
localhost:6379> APPEND name brown
(integer) 8
# 在name的值后追加值brown
localhost:6379> GET name
"tombrown"
localhost:6379> STRLEN name
(integer) 8
# 查看name值有多长
localhost:6379> SET count 0
OK
# 设置一个计数器叫count，值为0
localhost:6379> INCR count
(integer) 1
# count计数器的值加1
localhost:6379> INCRBY count 10
(integer) 11
# 在count计数器上加10
localhost:6379> DECR count
(integer) 10
# 计数器减1
localhost:6379> DECRBY count 3
(integer) 7
# 计数器减3
# 先进先出FIFO(First IN First Out)，后进先出
```



### 配置

```shell
* 查看配置语法
redis 127.0.0.1:6379> CONFIG GET CONFIG_SETTING_NAME
例 
localhost:6379> CONFIG GET loglevel
1) "loglevel"
2) "notice"

localhost:6379> CONFIG GET *
  1) "dbfilename"
  2) "dump.rdb"
  3) "requirepass"
  ...
  # 使用 * 号获取所有配置项
  
  * 编辑配置
  语法
  redis 127.0.0.1:6379> CONFIG SET CONFIG_SETTING_NAME NEW_CONFIG_VALUE
  例
  localhost:6379> CONFIG SET loglevel "notice"
 OK
 
[root@test ~]# vim /etc/redis.conf
    daemonize no
	# Redis默认不是以守护进程的方式运行，可以通过该配置项修改，使用yes启用守护进程

    pidfile /var/run/redis.pid
	# 当Redis以守护进程方式运行时，Redis默认会把pid写入/var/run/redis.pid文件，可以通过pidfile指定

    port 6379
	# 指定Redis监听端口，默认端口为6379

    bind 127.0.0.1
	# 绑定的主机地址

    timeout 300
	# 当客户端闲置多长时间后关闭连接，如果指定为0，表示关闭该功能

    loglevel verbose
	# 指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为verbose

    logfile stdout
	# 日志记录方式，默认为标准输出，如果配置Redis为守护进程方式运行，而这里又配置为日志记录方式为标准输出，则日志将会发送给/dev/null

    databases 16
	# 设置数据库的数量，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id

    save <seconds> <changes>
	# 指定在多长时间内，有多少次更新操作，就将数据同步到数据文件，可以多个条件配合
    # Redis默认配置文件中提供了三个条件：
    # save 900 1
    # save 300 10
    # save 60 10000
    # 分别表示900秒（15分钟）内有1个更改，300秒（5分钟）内有10个更改以及60秒内有10000个更改。

    rdbcompression yes
	# 指定存储至本地数据库时是否压缩数据，默认为yes，Redis采用LZF压缩，如果为了节省CPU时间，可以关闭该选项，但会导致数据库文件变的巨大

    dbfilename dump.rdb
	# 指定本地数据库文件名，默认值为dump.rdb

    dir ./
	# 指定本地数据库存放目录

    slaveof <masterip> <masterport>
	# 设置当本机为slav服务时，设置master服务的IP地址及端口，在Redis启动时，它会自动从master进行数据同步

    masterauth <master-password>
	# 当master服务设置了密码保护时，slav服务连接master的密码

    requirepass foobared
	# 设置Redis连接密码，如果配置了连接密码，客户端在连接Redis时需要通过AUTH <password>命令提供密码，默认关闭

    maxclients 128
	# 设置同一时间最大客户端连接数，默认无限制，Redis可以同时打开的客户端连接数为Redis进程可以打开的最大文件描述符数，如果设置 maxclients 0，表示不作限制。当客户端连接数到达限制时，Redis会关闭新的连接并向客户端返回max number of clients reached错误信息

    maxmemory <bytes>
	# 指定Redis最大内存限制，Redis在启动时会把数据加载到内存中，达到最大内存后，Redis会先尝试清除已到期或即将到期的Key，当此方法处理后，仍然到达最大内存设置，将无法再进行写入操作，但仍然可以进行读取操作。Redis新的vm机制，会把Key存放内存，Value会存放在swap区

    appendonly no
	# 指定是否在每次更新操作后进行日志记录，Redis在默认情况下是异步的把数据写入磁盘，如果不开启，可能会在断电时导致一段时间内的数据丢失。因为redis本身同步数据文件是按上面save条件来同步的，所以有的数据会在一段时间内只存在于内存中。默认为no

     appendfilename appendonly.aof
	# 指定更新日志文件名，默认为appendonly.aof

    appendfsync everysec
	# 指定更新日志条件，共有3个可选值： 
    # no：表示等操作系统进行数据缓存同步到磁盘（快） 
    # always：表示每次更新操作后手动调用fsync()将数据写到磁盘（慢，安全） 
    # everysec：表示每秒同步一次（折中，默认值）
 
     vm-enabled no
	# 指定是否启用虚拟内存机制，默认值为no，简单的介绍一下，VM机制将数据分页存放，由Redis将访问量较少的页即冷数据swap到磁盘上，访问多的页面由磁盘自动换出到内存中

     vm-swap-file /tmp/redis.swap
	# 虚拟内存文件路径，默认值为/tmp/redis.swap，不可多个Redis实例共享

     vm-max-memory 0
	# 将所有大于vm-max-memory的数据存入虚拟内存,无论vm-max-memory设置多小,所有索引数据都是内存存储的(Redis的索引数据就是keys),也就是说,当vm-max-memory设置为0的时候,其实是所有value都存在于磁盘。默认值为0

     vm-page-size 32
	# Redis swap文件分成了很多的page，一个对象可以保存在多个page上面，但一个page上不能被多个对象共享，vm-page-size是要根据存储的数据大小来设定的，作者建议如果存储很多小对象，page大小最好设置为32或者64bytes；如果存储很大的对象，则可以使用更大的page，如果不确定，就使用默认值

     vm-pages 134217728
	# 设置swap文件中的page数量，由于页表（一种表示页面空闲或使用的bitmap）是在放在内存中的，在磁盘上每8个pages将消耗1byte的内存。

     vm-max-threads 4
	# 设置访问swap文件的线程数,最好不要超过机器的核数,如果设置为0,那么所有对swap文件的操作都是串行的，可能会造成比较长时间的延迟。默认值为4

    glueoutputbuf yes
	# 设置在向客户端应答时，是否把较小的包合并为一个包发送，默认为开启

    hash-max-zipmap-entries 64
    hash-max-zipmap-value 512
	# 指定在超过一定的数量或者最大的元素超过某一临界值时，采用一种特殊的哈希算法

    activerehashing yes
	# 指定是否激活重置哈希，默认为开启

    include /path/to/local.conf
    # 指定包含其它的配置文件，可以在同一主机上多个Redis实例之间使用同一份配置文件，而同时各个实例又拥有自己的特定配置文件
```



### List（列表）

```shell
localhost:6379> LPUSH weekdays Mon Tue
(integer) 2
# 追加一个weekdays队列，但从右进，值是Mon Tue
localhost:6379> LINDEX weekdays 0
"Tue"
# 查看队列最左侧的索引值，显示Tue
localhost:6379> LRANGE weekdays 0 1
1) "Tue"
2) "Mon"
# 获取列表指定范围内的元素
localhost:6379> RPUSH weekdays Wed Thu
(integer) 4
# 向weekdays队列中追加值Wed和Thu
localhost:6379> LINDEX weekdays 3
"Thu"
# 查看索引为3的值。因为是从0开始编号的，所以第3个是Thu
localhost:6379> LRANGE weekdays 0 5
1) "Tue"
2) "Mon"
3) "Wed"
4) "Thu"
# 获取列表指定范围内的元素
localhost:6379> LPOP weekdays
"Tue"
# 从weekdays队列最左侧删除数据
localhost:6379> RPOP weekdays
"Thu"
# 从weekdays队列最右侧删除数据
localhost:6379> LINSERT weekdays BEFORE Wed Fri
(integer) 3
# 在Wed前插入数据Fri。BEFORE在指定元素前插入数据，AFTER是在指定元素之后插入数据
localhost:6379> LINDEX weekdays 1
"Fri"
# 显示Fri，因为上面将Fri插入在了原来索引为1的Web前
localhost:6379> LRANGE weekdays 0 10
1) "Mon"
2) "Fri"
3) "Wed"
# 获取列表指定范围内的元素
```



### hash（哈希）

```shell
localhost:6379> HSET stu1 name tom
(integer) 1
# 定义一个名字叫stu1的表name名字叫tom
localhost:6379> HSET stu1 age 17
(integer) 1
localhost:6379> HMSET stu1 gender Male major Kuihua
OK
# HMSET可以设置多个下标，gender和major是下标，Male和Kuihua是值
localhost:6379> HKEYS stu1
1) "name"
2) "age"
3) "gender"
4) "major"
# 查看stu1的下标的名字
localhost:6379> HVALS stu1
1) "tom"
2) "17"
3) "Male"
4) "Kuihua"
# 查看下标的值
localhost:6379> HDEL stu1 major
(integer) 1
# 删除stu1的下标major
localhost:6379> HKEYS stu1
1) "name"
2) "age"
3) "gender"
# 查看下标
localhost:6379> HLEN stu1
(integer) 3
# 查看key上有几个元素
localhost:6379> HSTRLEN stu1 name
(integer) 3
# 查看name元素有几个字节
```



### Set（集合）

```shell
localhost:6379> SADD tom lucy lily hanmeimei
(integer) 3
# 创建一个集合叫tom，tom后的是他的好友的名字
localhost:6379> SADD jerry lucy obama trump
(integer) 3
localhost:6379> SINTER tom jerry
1) "lucy"
# 查看tom和jerry的交集
localhost:6379> SUNION tom jerry
1) "lucy"
2) "lily"
3) "hanmeimei"
4) "trump"
5) "obama"
# 查看tom和jerry的并集
localhost:6379> SDIFF tom jerry
1) "lily"
2) "hanmeimei"
# 查看差集，tom有的而jerry没有朋友的名字
localhost:6379> SDIFF jerry tom
1) "trump"
2) "obama"
localhost:6379> SMEMBERS tom
1) "lily"
2) "lucy"
3) "hanmeimei"
# 查看tom集合的所有元素
localhost:6379> SMEMBERS jerry
1) "trump"
2) "obama"
3) "lucy"
localhost:6379> SUNIONSTORE friends tom jerry
(integer) 5
# 查看并集并保存，保存的键名叫friends
localhost:6379> SMEMBERS friends
1) "lucy"
2) "lily"
3) "hanmeimei"
4) "trump"
5) "obama"
# 查看
```



### sorted set（有序集合）

```shell
localhost:6379> ZADD colors 1 red 2 blue 8 green 5 gray
(integer) 4
# 创建一个叫colors的集合。添加时提示“OOM command not allowed when used memory > 'maxmemory'”，是因为配置文件中设置了maxmemory的值，现在已经达到了上限，所以报错。
localhost:6379> ZCARD colors
(integer) 4
# 查看colors有几个成员
localhost:6379> ZSCORE colors green
"8"
# 查看成员green的分数
localhost:6379> ZCOUNT colors 2 6
(integer) 2
# 统计一个范围分数的成员个数
localhost:6379> ZRANGE colors 0 5
1) "red"
2) "blue"
3) "gray"
4) "green"
# 返回所指范围内的值
localhost:6379> ZRANK colors gray
(integer) 2
# 查看元素的索引是几
```



### 发布订阅

```shell
localhost:6379> SUBSCRIBE military
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "military"
3) (integer) 1
# 订阅频道，这时会停留在频道中
再打开一个窗口连接redis
[root@test ~]# redis-cli -h localhost
localhost:6379> PUBLISH military caoxian
(integer) 1
# 向military频道中发布一条信息
回到之前的窗口，这时会显示刚发布的信息
localhost:6379> SUBSCRIBE military finance
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "military"
3) (integer) 1
1) "subscribe"
2) "finance"
3) (integer) 2
# 在第一个窗口重新订阅两个频道
到新窗口重新发布信息
localhost:6379> PUBLISH finance bitcorn
(integer) 1
回到之前的窗口
[root@test ~]# redis-cli -h localhost -p 6379
localhost:6379> SUBSCRIBE military finance
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "military"
3) (integer) 1
1) "subscribe"
2) "finance"
3) (integer) 2
1) "message"
2) "finance"
3) "bitcorn"
```



### 认证

```shell
[root@test ~]# vim /etc/redis.conf
requirepass mageedu
# 设置密码为mageedu
[root@test ~]# redis-cli
127.0.0.1:6379> GET name
(error) NOAUTH Authentication required.
# 这时是不能使用的，要密码
127.0.0.1:6379> AUTH mageedu
OK
# 给密码
127.0.0.1:6379> GET name
"tombrown"
# 这时就能得到数据了
127.0.0.1:6379> INFO Server
# Server
redis_version:3.2.12
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:7897e7d0e13773f
redis_mode:standalone
os:Linux 3.10.0-693.el7.x86_64 x86_64
arch_bits:64
multiplexing_api:epoll
gcc_version:4.8.5
process_id:2591
run_id:af2243e0cf36e57e000b383901b8c832530fc91e
tcp_port:6379
uptime_in_seconds:74
uptime_in_days:0
hz:10
lru_clock:3412915
executable:/usr/bin/redis-server
config_file:/etc/redis.conf
# 查看服务器信息
127.0.0.1:6379> INFO
# 查看所有信息
127.0.0.1:6379> INFO Clients
# Clients
connected_clients:1
client_longest_output_list:0
client_biggest_input_buf:0
blocked_clients:0
127.0.0.1:6379> INFO Memory
# Memory
used_memory:814480
used_memory_human:795.39K
used_memory_rss:5947392
used_memory_rss_human:5.67M
used_memory_peak:815328
used_memory_peak_human:796.22K
total_system_memory:1023713280
total_system_memory_human:976.29M
used_memory_lua:37888
used_memory_lua_human:37.00K
maxmemory:0
maxmemory_human:0B
maxmemory_policy:noeviction
mem_fragmentation_ratio:7.30
mem_allocator:jemalloc-3.6.0
# 内存信息，其中的maxmemory_policy:noeviction表示最大内存用尽后的策略，noeviction表示不处理，新数据就没法存了。还可以使用内存的淘汰策略
localhost:6379> CLIENT LIST
id=2 addr=127.0.0.1:44490 fd=5 name= age=216 idle=44 flags=N db=0 sub=0 psub=0 multi=-1 qbuf=0 qbuf-free=0 obl=0 oll=0 omem=0 events=r cmd=client
id=3 addr=127.0.0.1:44492 fd=6 name= age=10 idle=0 flags=N db=0 sub=0 psub=0 multi=-1 qbuf=0 qbuf-free=32768 obl=0 oll=0 omem=0 events=r cmd=client
# 显示所有连接上服务器的客户端
```



### 测试：修改配置文件

```shell
[root@test ~]# vim /etc/redis.conf
    #######INCLUDES##############
    //包含段
	#####NETWORK#########
	bind	0.0.0.0
	# 监听所有地址
	protected-mode	yes
	# 是否工作在保护模式，无论监听哪个地址，都只能本机连接。不使用监听地址和认证功能此项才生效
	prot  6379	
	# 监听端口
	timeout 0		
	# 客户端空闲超时时间，超时就与客户端断开连接
	tcp-keepalive 300		
	# 客户端与服务器tcp连接保持时长
	######SECURITY#######
	requirepass   mageedu		
	# 认证密码
	########LIMITS######
	maxclients  10000		
	# 最大并发连接数
	maxmemory 		
	# 最大内存。最好手动设置
	maxmemory-policy 		
	# 内存淘汰策略；noeviction不启用淘汰机制；
	maxmemory-samples 5		
	# 淘汰的样本数量，每次找5个并淘汰1个
	######SLOW LOG#####
	slowlog-log-slower-than 10000	
	# 慢查询的时间，微秒
[root@test ~]# systemctl restart redis
* 换一台主机
[root@test ~]# redis-cli -h 192.168.1.14
192.168.1.14:6379> GET name
(error) NOAUTH Authentication required.
192.168.1.14:6379> auth mageedu
OK
192.168.1.14:6379> get name
"tombrown"
```



### 实时配置

```shell
127.0.0.1:6379> CONFIG GET requirepass
1) "requirepass"
2) "mageedu"
127.0.0.1:6379> CONFIG SET requirepass 123456
OK
127.0.0.1:6379> CONFIG GET requirepass
1) "requirepass"
2) "123456"
# 将密码从mageedu改为123456
127.0.0.1:6379> CONFIG REWRITE
OK
# 将内存中的数据覆盖配置文件中的值
127.0.0.1:6379> CONFIG SET appendonly yes
OK
# 启动AOF功能.这是为了让数据在写入内存时就记入日志，防止断电时数据丢失
[root@test ~]# vim /etc/redis.conf 
requirepass "123456"
aof-rewrite-incremental-fsync yes
# 配置文件中有两条配置了
[root@test ~]# ls /var/lib/redis/
appendonly.aof  dump.rdb
# 这时有.aof的文件了
127.0.0.1:6379> CONFIG RESETSTAT
OK
# 重置INFO命令输出的数据
```



### 主从复制

```shell
# 准备三台主机，node1-3，第一台为主节点，后两台为从节点

* node1 192.168.1.14
[root@node1 ~]# vim /etc/redis.conf
	bind 0.0.0.0
	requirepass "123456"
[root@node1 ~]# systemctl restart redis

* node2、3 192.168.1.15 192.168.1.13
[root@node2 ~]# vim /etc/redis.conf
	bind 0.0.0.0
	requirepass "123456"
[root@node2 ~]# systemctl start redis
[root@node2 ~]# ss -tln
State       Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN      0      128         *:6379                    *:* 
127.0.0.1:6379> SLAVEOF 192.168.1.14 6379
OK
# 指明主节点地址和端口就可以了
127.0.0.1:6379> CONFIG SET masterauth 123456
OK
# 设置主节点的认证密码
127.0.0.1:6379> CONFIG REWRITE
OK
# 写入配置文件
=======================================================================================
也可以直接写入配置文件
[root@node3 ~]# vim /etc/redis.conf
slaveof 192.168.1.14 6379
masterauth "123456"
=======================================================================================

* node1 192.168.1.14
127.0.0.1:6379> INFO Replication
# Replication
role:master
connected_slaves:2
slave0:ip=192.168.1.15,port=6379,state=online,offset=197,lag=1
slave1:ip=192.168.1.13,port=6379,state=online,offset=197,lag=0
master_repl_offset:197
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:2
repl_backlog_histlen:196
# 可以看到两个从节点

* node2 192.168.1.15
127.0.0.1:6379> GET name
"tombrown"
# 可以看到有信息了

* node3 192.168.1.13
127.0.0.1:6379> GET name
"tombrown"
127.0.0.1:6379> SMEMBERS jerry
1) "lucy"
2) "obama"
3) "trump"
# node3上也可以查询到信息了
127.0.0.1:6379> CONFIG GET slave-read-only
1) "slave-read-only"
2) "yes"
# 查看从节点的配置是否为只读。只有当前节点为从节点时才有效。可以通过CONFIG SET slave-read-only no来设置此项为yes或no
127.0.0.1:6379> SET hikey hellothere
(error) READONLY You can't write against a read only slave.
# 在从节点上是不可以设置数据的，有错误提示
```

