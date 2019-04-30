---
title: MongoDB基础命令
date: 2019-03-08 16:24:24
tags: MongoDB基础命令
categories: MongoDB
---

### 创建数据库

```shell
hqmongodb:PRIMARY> use runoob
switched to db runoob
# 使用use命令可以创建或进入数据库，当数据库不存在时，就会创建并进行，如果数据库存在，就会进入数据库。
hqmongodb:PRIMARY> db
runoob
# 使用db命令可以显示当前所在的库
hqmongodb:PRIMARY> show dbs
admin  0.000GB
local  0.000GB
# 使用此命令可以查看所有数据库，但刚创建的库并不在其中，因为库中还没有数据。
hqmongodb:PRIMARY> db.runoob.insert({"name":"test"})
WriteResult({ "nInserted" : 1 })
# 向库中插入一个表，并向表中插入数据
hqmongodb:PRIMARY> show dbs
admin   0.000GB
local   0.000GB
runoob  0.000GB
# 再次查看时就有这个库了
# MongoDB 中默认的数据库为 test，如果你没有创建新的数据库，集合将存放在 test 数据库中。
# 在 MongoDB 中，集合只有在内容插入后才会创建! 就是说，创建集合(数据表)后要再插入一个文档(记录)，集合才会真正创建。
```



### 删除数据库

```shell
hqmongodb:PRIMARY> use runoob
switched to db runoob
hqmongodb:PRIMARY> db.dropDatabase()
{ "dropped" : "runoob", "ok" : 1 }
# 删除数据库
```



### 创建集合

```shell
语法：
db.createCollection(name, options)
# name: 要创建的集合名称；options: 可选参数, 指定有关内存大小及索引的选项
# options 可以是如下参数：
# capped：布尔值，（可选）如果为 true，则创建固定集合。固定集合是指有着固定大小的集合，当达到最大值时，它会自动覆盖最早的文档。当该值为 true 时，必须指定 size 参数。
# autoIndexId：布尔值，（可选）如为 true，自动在 _id 字段创建索引。默认为 false。
# size：数值，（可选）为固定集合指定一个最大值（以字节计）。如果 capped 为 true，也需要指定该字段。
# max：数值，（可选）指定固定集合中包含文档的最大数量。
# 在插入文档时，MongoDB 首先检查固定集合的 size 字段，然后检查 max 字段。

hqmongodb:PRIMARY> use runoob
switched to db runoob
hqmongodb:PRIMARY> db.createCollection("runoob")
{ "ok" : 1 }
# 在runoob库中创建集合runoob
hqmongodb:PRIMARY> show collections
runoob
# 查看集合
hqmongodb:PRIMARY> db.createCollection("mycol",{capped:true,autoIndexId:true,size:6142800,max:10000})
{
	"note" : "the autoIndexId option is deprecated and will be removed in a future release",
	"ok" : 1
}
# 创建固定集合 mycol，整个集合空间大小 6142800 KB, 文档最大个数为 10000 个。
hqmongodb:PRIMARY> db.mycol2.insert({"name":"test"})
# 在 MongoDB 中，实际不需要创建集合。当你插入一些文档时，MongoDB 会自动创建集合。
WriteResult({ "nInserted" : 1 })
hqmongodb:PRIMARY> show collections
mycol
mycol2
runoob
```



### 删除集合

```shell
语法：
db.collection.drop()
如果成功删除选定集合，则 drop() 方法返回 true，否则返回 false。

hqmongodb:PRIMARY> show collections
mycol
mycol2
runoob
hqmongodb:PRIMARY> db.mycol2.drop()
true
# 删除mycol2集合
hqmongodb:PRIMARY> show collections
mycol
runoob
```



### 插入文档

```shell
语法：
db.COLLECTION_NAME.insert(document)
# MongoDB 使用 insert() 或 save() 方法向集合中插入文档
3.2 版本后还有以下几种语法可用于插入文档：
db.collection.insertOne()
# 向指定集合中插入一条文档数据
db.collection.insertMany()
# 向指定集合中插入多条文档数据
 
# 文档的数据结构和JSON基本一样。所有存储在集合中的数据都是BSON格式。BSON是一种类json的一种二进制形式的存储格式,简称Binary JSON。

hqmongodb:PRIMARY> db.col.insert({title:'MongoDB教程', description:'MongoDB是一个Nosql数据库', by:'教程', url:'http://www.runoob.com', tags:['mongodb','database','NoSQL'], likes:100})
WriteResult({ "nInserted" : 1 })
# 使用insert()方法插入文档，每对键值间用逗号分隔
hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c822dfa1fb12ed017cf9362"), "title" : "MongoDB教程", "description" : "MongoDB是一个Nosql数据库", "by" : "教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
# 使用find()方法查看
hqmongodb:PRIMARY> document=({title:'MongoDB教程', description:'MongoDB是一个Nosql数据库', by:'教程', url:'http://www.runoob.com', tags:['mongodb','database','NoSQL'], likes:100})
{
	"title" : "MongoDB教程",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
# 将数据定义在一个变量中
hqmongodb:PRIMARY> db.col.insert(document)
WriteResult({ "nInserted" : 1 })
# 再插入变量。效果与插入数据是一样的
hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c822dfa1fb12ed017cf9362"), "title" : "MongoDB教程", "description" : "MongoDB是一个Nosql数据库", "by" : "教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("5c822e401fb12ed017cf9363"), "title" : "MongoDB教程", "description" : "MongoDB是一个Nosql数据库", "by" : "教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
# 查看插入了两个数据

hqmongodb:PRIMARY> var document = db.collection.insertOne({"a": 3})
hqmongodb:PRIMARY> document
{
	"acknowledged" : true,
	"insertedId" : ObjectId("5c8233471fb12ed017cf9364")
}
# 插入单条数据并查看
hqmongodb:PRIMARY> var res = db.collection.insertMany([{"b":3},{'c':4}])
hqmongodb:PRIMARY> res
{
	"acknowledged" : true,
	"insertedIds" : [
		ObjectId("5c8233781fb12ed017cf9365"),
		ObjectId("5c8233781fb12ed017cf9366")
	]
}
# 插入多条数据并查看

-------------
   从节点
-------------
hqmongodb:SECONDARY> use runoob
switched to db runoob
hqmongodb:SECONDARY> db.col.find()
Error: error: { "ok" : 0, "errmsg" : "not master and slaveOk=false", "code" : 13435 }
hqmongodb:SECONDARY> rs.slaveOk()
# 在从节点查看数据要使用此命令，不然会有上面的错误提示
hqmongodb:SECONDARY> db.col.find()
{ "_id" : ObjectId("5c822dfa1fb12ed017cf9362"), "title" : "MongoDB教程", "description" : "MongoDB是一个Nosql数据库", "by" : "教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("5c822e401fb12ed017cf9363"), "title" : "MongoDB教程", "description" : "MongoDB是一个Nosql数据库", "by" : "教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
```



### 更新文档

> MongoDB 使用 update() 和 save() 方法来更新集合中的文档。

#### update() 方法

```shell
语法：
db.collection.update(
   <query>,
   <update>,
   {
     upsert: <boolean>,
     multi: <boolean>,
     writeConcern: <document>
   }
)
# 参数说明：
# query：update的查询条件，类似sql update查询内where后面的。
# update：update的对象和一些更新的操作符（如$，$inc...）等，也可以理解为sql update查询内set后面的
# upsert：可选，这个参数的意思是，如果不存在update的记录，是否插入objNew,true为插入，默认是false，不插入。
# multi : 可选，mongodb 默认是false，只更新找到的第一条记录，如果这个参数为true，就把按条件查出来多条记录全部更新。
# writeConcern：可选，抛出异常的级别。
hqmongodb:PRIMARY> db.col.insert({ title:'MongoDB教程', description:'MongoDB是一个Nosql数据库', by:'cai', url:'http://www.runoob.com', tags:['mongodb','database','NoSQL'], likes:100 })
WriteResult({ "nInserted" : 1 })
# 插入数据
hqmongodb:PRIMARY> db.col.update({'title':'MongoDB教程'},{$set:{'title':'MongoDB'}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
hqmongodb:PRIMARY> db.col.find().pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
{
	"_id" : ObjectId("5c822e401fb12ed017cf9363"),
	"title" : "MongoDB教程",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
{
	"_id" : ObjectId("5c8235aa1fb12ed017cf9367"),
	"title" : "MongoDB教程",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "cai",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
# 可以看到标题(title)由原来的 "MongoDB 教程" 更新为了 "MongoDB"。
# 以上语句只会修改第一条发现的文档，如果你要修改多条相同的文档，则需要设置 multi 参数为 true。如下：
hqmongodb:PRIMARY> db.col.update({'title':'MongoDB教程'},{$set:{'title':'MongoDB'}},{multi:true})
WriteResult({ "nMatched" : 2, "nUpserted" : 0, "nModified" : 2 })
hqmongodb:PRIMARY> db.col.find().pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
{
	"_id" : ObjectId("5c822e401fb12ed017cf9363"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
{
	"_id" : ObjectId("5c8235aa1fb12ed017cf9367"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "cai",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
```



#### save() 方法

> save() 方法通过传入的文档来替换已有文档

```shell
语法：
db.collection.save(
   <document>,
   {
     writeConcern: <document>
   }
)
# 参数说明：
# document : 文档数据。
# writeConcern :可选，抛出异常的级别。
hqmongodb:PRIMARY> db.col.save({
... "_id":ObjectId("5c822dfa1fb12ed017cf9362"),
... "title":"MongoDB",
... "description" : "MongoDB 是一个 Nosql 数据库",
... "by" : "Runoob",
... "url" : "http://www.runoob.com",
... "tags" : [
...             "mongodb",
...             "NoSQL"
...     ],
...   "likes" : 110
... })
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
hqmongodb:PRIMARY> db.col.find().pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
.......
}
# 修改后的结果，之前的结果如下：
hqmongodb:PRIMARY> db.col.find().pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
```



#### 更多实例

```shell
db.col.update( { "count" : { $gt : 1 } } , { $set : { "test2" : "OK"} } );
# 只更新第一条记录
db.col.update( { "count" : { $gt : 3 } } , { $set : { "test2" : "OK"} },false,true );
# 全部更新
db.col.update( { "count" : { $gt : 4 } } , { $set : { "test5" : "OK"} },true,false );
# 只添加第一条
db.col.update( { "count" : { $gt : 5 } } , { $set : { "test5" : "OK"} },true,true );
# 全部添加进去
db.col.update( { "count" : { $gt : 15 } } , { $inc : { "count" : 1} },false,true );
# 全部更新
db.col.update( { "count" : { $gt : 10 } } , { $inc : { "count" : 1} },false,false );
# 只更新第一条记录
```



### 删除文档

```shell
语法：
db.collection.remove(
   <query>,
   {
     justOne: <boolean>,
     writeConcern: <document>
   }
)
# 2.6以后版本的语法
# query :（可选）删除的文档的条件。
# justOne : （可选）如果设为 true 或 1，则只删除一个文档，如果不设置该参数，或使用默认值 false，则删除所有匹配条件的文档。
# writeConcern :（可选）抛出异常的级别。

db.inventory.deleteMany({})
# 官方推荐使用这种语法，使用deleteMany方法或deleteOne方法，分别表示删除所有匹配到的文档或只删除一个文档
例：db.inventory.deleteMany({ status : "A" })
# 删除 status 等于 A 的全部文档
db.inventory.deleteOne( { status: "D" } )
# 删除 status 等于 D 的一个文档


hqmongodb:PRIMARY> db.col.insert({title:'MongoDB教程',
... description:'M是一个Nosql',
... by:'ruo',
... url:'http://www.runoob.com',
... tags:['mongodb','database','Nosql'],
... likes:100
... })
WriteResult({ "nInserted" : 1 })
hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c85b72b372fdd538ec31fdc"), "title" : "MongoDB教程", "description" : "M是一个Nosql", "by" : "ruo", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "Nosql" ], "likes" : 100 }
hqmongodb:PRIMARY> db
test
# 这个文档是在test库中添加的
hqmongodb:PRIMARY> db.col.remove({'title':'MongoDB教程'})
WriteResult({ "nRemoved" : 1 })
# 显示删除了一条文档数据
hqmongodb:PRIMARY> db.repairDatabase()
{ "ok" : 1 }
# remove() 方法 并不会真正释放空间。需要继续执行 db.repairDatabase() 来回收磁盘空间。
hqmongodb:PRIMARY> db.runCommand({repairDatabase:1})
{ "ok" : 1 }
# 使用此方法也可以实现释放空间

```



### 查询文档

```shell
语法：
db.collection.find(query, projection)
# MongoDB 查询文档使用 find() 方法。find() 方法以非结构化的方式来显示所有文档。
# query ：可选，使用查询操作符指定查询条件
# projection ：可选，使用投影操作符指定返回的键。查询时返回文档中所有键值， 只需省略该参数即可（默认省略）。
db.col.find().pretty()
# 使用 pretty() 方法以易读的方式来读取数据。pretty() 方法以格式化的方式来显示所有文档。

hqmongodb:PRIMARY> use runoob
switched to db runoob
# 切换数据库到runoob
hqmongodb:PRIMARY> db
runoob
hqmongodb:PRIMARY> db.col.find().pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
......
# 查询库中所有文档

hqmongodb:PRIMARY> db.col.findOne()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
# findOne() 方法只返回一个文档。
```



#### MongoDB 与 RDBMS Where 语句比较

| 操作       | 格式                     | 范例                                        | RDBMS中的类似语句       |
| ---------- | ------------------------ | ------------------------------------------- | ----------------------- |
| 等于       | `{<key>:<value>`}        | `db.col.find({"by":"菜鸟教程"}).pretty()`   | `where by = '菜鸟教程'` |
| 小于       | `{<key>:{$lt:<value>}}`  | `db.col.find({"likes":{$lt:50}}).pretty()`  | `where likes < 50`      |
| 小于或等于 | `{<key>:{$lte:<value>}}` | `db.col.find({"likes":{$lte:50}}).pretty()` | `where likes <= 50`     |
| 大于       | `{<key>:{$gt:<value>}}`  | `db.col.find({"likes":{$gt:50}}).pretty()`  | `where likes > 50`      |
| 大于或等于 | `{<key>:{$gte:<value>}}` | `db.col.find({"likes":{$gte:50}}).pretty()` | `where likes >= 50`     |
| 不等于     | `{<key>:{$ne:<value>}}`  | `db.col.find({"likes":{$ne:50}}).pretty()`  | `where likes != 50`     |



#### AND条件

```shell
语法：
db.col.find({key1:value1, key2:value2}).pretty()
# find() 方法可以传入多个键(key)，每个键(key)以逗号隔开，即常规 SQL 的 AND 条件。

hqmongodb:PRIMARY> db.col.find({"by":"cai","title":"MongoDB"}).pretty()
{
	"_id" : ObjectId("5c8235aa1fb12ed017cf9367"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "cai",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
# 通过 by 和 title 键来查询。
# 实例中类似于 WHERE 语句：WHERE by='cai' AND title='MongoDB'
```



#### OR条件

```shell
语法：
db.col.find(
   {
      $or: [
         {key1: value1}, {key2:value2}
      ]
   }
).pretty()
# OR 条件语句使用了关键字 $or

hqmongodb:PRIMARY> db.col.find({$or:[{"likes":110},{"by":"cai"}]}).pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
{
	"_id" : ObjectId("5c8235aa1fb12ed017cf9367"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "cai",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
# 条件中的likes键的值是110，110两侧不能加引号，因为110是数字，加引号表示字符串
```



#### AND和OR联合使用

```shell
hqmongodb:PRIMARY> db.col.find({"likes":{$gt:50},$or:[{"by":"Runoob"},{"title":"MongoDB"}]}).pretty()
{
	"_id" : ObjectId("5c822dfa1fb12ed017cf9362"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
{
	"_id" : ObjectId("5c822e401fb12ed017cf9363"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
{
	"_id" : ObjectId("5c8235aa1fb12ed017cf9367"),
	"title" : "MongoDB",
	"description" : "MongoDB是一个Nosql数据库",
	"by" : "cai",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
# 常规 SQL 语句为： 'where likes>50 AND (by = '菜鸟教程' OR title = 'MongoDB 教程')'
```

