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



### 复制原理

> mongodb的复制至少需要两个节点。其中一个是主节点，负责处理客户端请求，其余的都是从节点，负责复制主节点上的数据。
>
> mongodb各个节点常见的搭配方式为：一主一从、一主多从。
>
> 主节点记录在其上的所有操作oplog，从节点定期轮询主节点获取这些操作，然后对自己的数据副本执行这些操作，从而保证从节点的数据与主节点一致。
>
> 集群功能：
>
> 1. N个节点的集群
> 2. 任何节点都可作为主节点
> 3. 所有写入操作都在主节点上
> 4. 自动故障转移
> 5. 自动恢复



### 测试

```shell
============================================================================================
环境：
准备两台主机，主节点地址：192.168.251.129；从节点地址：192.168.251.131
============================================================================================

-------------
   主节点
-------------
[root@test ~]# vim /usr/local/mongodb/conf/mongod1.conf
dbpath=/usr/local/mongodb/data
logpath=/usr/local/mongodb/log/mongodb.log
port=27017
logappend=1
fork=1
replSet=repl1
# 复制集的名称，集群中的服务器的配置文件都需要加入replSet指令，它们都属于一个复制集
maxConns=5000
# 最大同时连接数，默认2000
bind_ip=0.0.0.0
# 允许所有ip访问，如果要限制访问，可指定以逗号分隔的ip地址
auth=false
# 是否启用身份认证
nohttpinterface=true
rest=false
[root@test ~]# scp -r /usr/local/mongodb/ 192.168.251.131:/usr/local/mongodb

-------------
   从节点
-------------
[root@mongodb2 ~]# vim .bash_profile
export PATH=/usr/local/mongodb/bin:$PATH
[root@mongodb2 ~]# source .bash_profile
[root@mongodb2 ~]# mongod -f /usr/local/mongodb/conf/mongod1.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 1267
child process started successfully, parent exiting

-------------
   主节点
-------------
[root@test ~]# mongod -f /usr/local/mongodb/conf/mongod1.conf
# 启动服务
[root@test ~]# mongo
MongoDB shell version: 3.2.8
connecting to: test
Server has startup warnings: 
2019-03-06T17:25:10.076+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2019-03-06T17:25:10.077+0800 I CONTROL  [initandlisten] 
# 创建数据库
> rs.initiate({_id:'repl1',members:[{_id:1,host:'192.168.251.129:27017'}]})
{ "ok" : 1 }
# 登入任意一台机器的mongodb执行，因为是全新的复制集，所以可以任意进入一台执行；要是一台有数据，则需要在有数据上执行；要多台有数据则不能初始化。
# _id：复制集名称（第一个_id） 
# members：复制集服务器列表 
# _id：服务器的唯一ID（数组里_id） 
# host：服务器主机 
# 我们操作的是192.168.251.129服务器，其中repl1即是复制集名称，和mongodb.conf中保持一致，初始化复制集的第一个服务器将会成为主复制集
repl1:OTHER> rs.status()
{
	"set" : "repl1",
	"date" : ISODate("2019-03-06T09:28:57.076Z"),
	"myState" : 1,
	"term" : NumberLong(1),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [		# 下面是主节点的信息
		{
			"_id" : 1,
			"name" : "192.168.251.129:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 228,
			"optime" : {
				"ts" : Timestamp(1551864414, 1),
				"t" : NumberLong(1)
			},
			"optimeDate" : ISODate("2019-03-06T09:26:54Z"),
			"electionTime" : Timestamp(1551864413, 2),
			"electionDate" : ISODate("2019-03-06T09:26:53Z"),
			"configVersion" : 1,
			"self" : true
		}
	],
	"ok" : 1
}
# 通过rs.status()查看复制集状态可以看到，192.168.251.129:27017已被自动分配为primary主复制集了
repl1:PRIMARY> rs.add('192.168.251.131:27017')
{ "ok" : 1 }
# 增加192.168.251.131为从节点，如果有报错，建议关闭防火墙
repl1:PRIMARY> rs.status()
{
	"set" : "repl1",
	"date" : ISODate("2019-03-06T09:34:05.824Z"),
	"myState" : 1,
	"term" : NumberLong(1),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 1,
			"name" : "192.168.251.129:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 536,
			"optime" : {
				"ts" : Timestamp(1551864742, 1),
				"t" : NumberLong(1)
			},
			"optimeDate" : ISODate("2019-03-06T09:32:22Z"),
			"electionTime" : Timestamp(1551864413, 2),
			"electionDate" : ISODate("2019-03-06T09:26:53Z"),
			"configVersion" : 2,
			"self" : true
		},
		{		# 下面的从节点的信息
			"_id" : 2,
			"name" : "192.168.251.131:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 103,
			"optime" : {
				"ts" : Timestamp(1551864742, 1),
				"t" : NumberLong(1)
			},
			"optimeDate" : ISODate("2019-03-06T09:32:22Z"),
			"lastHeartbeat" : ISODate("2019-03-06T09:34:04.820Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-06T09:34:01.760Z"),
			"pingMs" : NumberLong(0),
			"configVersion" : 2
		}
	],
	"ok" : 1
}

-------------
   从节点
-------------
[root@mongodb2 ~]# mongo
MongoDB shell version: 3.2.8
connecting to: test
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
	http://docs.mongodb.org/
Questions? Try the support group
	http://groups.google.com/group/mongodb-user
Server has startup warnings: 
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] 
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] 
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/enabled is 'always'.
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] **        We suggest setting it to 'never'
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] 
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] ** WARNING: /sys/kernel/mm/transparent_hugepage/defrag is 'always'.
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] **        We suggest setting it to 'never'
2019-03-06T17:31:46.691+0800 I CONTROL  [initandlisten] 
repl1:SECONDARY> 
# 从节点登录可以看到SECONDARY

===========================================================================================
 测试复制集secondary节点数据复制功能
===========================================================================================
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

===========================================================================================
测试复制集主从节点故障转移功能
===========================================================================================
-------------
   主节点
-------------
repl1:PRIMARY> use admin
switched to db admin
repl1:PRIMARY> db.shutdownServer()
server should be down...
2019-03-06T17:56:09.141+0800 I NETWORK  [thread1] trying reconnect to 127.0.0.1:27017 (127.0.0.1) failed
2019-03-06T17:56:09.142+0800 I NETWORK  [thread1] reconnect 127.0.0.1:27017 (127.0.0.1) failed failed 
> exit
bye
[root@test ~]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128               *:22                            *:*                  
LISTEN     0      100       127.0.0.1:25                            *:*                  
LISTEN     0      128              :::22                           :::*                  
LISTEN     0      100             ::1:25                           :::*                  
[root@test ~]# mongod -f /usr/local/mongodb/conf/mongod1.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 5642
child process started successfully, parent exiting
# 再次启动
[root@test ~]# mongo
MongoDB shell version: 3.2.8
connecting to: test
Server has startup warnings: 
2019-03-06T17:58:33.368+0800 I CONTROL  [initandlisten] ** WARNING: You are running this process as the root user, which is not recommended.
2019-03-06T17:58:33.369+0800 I CONTROL  [initandlisten] 
repl1:SECONDARY> rs.status()
{
	"set" : "repl1",
	"date" : ISODate("2019-03-06T09:59:12.748Z"),
	"myState" : 2,
	"term" : NumberLong(2),
	"syncingTo" : "192.168.251.131:27017",
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 1,
			"name" : "192.168.251.129:27017",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 40,
			"optime" : {
				"ts" : Timestamp(1551866318, 2),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2019-03-06T09:58:38Z"),
			"syncingTo" : "192.168.251.131:27017",
			"configVersion" : 2,
			"self" : true
		},
		{
			"_id" : 2,
			"name" : "192.168.251.131:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 39,
			"optime" : {
				"ts" : Timestamp(1551866318, 2),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2019-03-06T09:58:38Z"),
			"lastHeartbeat" : ISODate("2019-03-06T09:59:11.428Z"),
			"lastHeartbeatRecv" : ISODate("2019-03-06T09:59:11.898Z"),
			"pingMs" : NumberLong(1),
			"electionTime" : Timestamp(1551866318, 1),
			"electionDate" : ISODate("2019-03-06T09:58:38Z"),
			"configVersion" : 2
		}
	],
	"ok" : 1
}
# 这时，从节点变成了主节点，主节点变成了从节点


```

