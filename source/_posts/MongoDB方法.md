---
title: MongoDB方法
date: 2019-03-11 14:22:10
tags: MongoDB方法
categories: MongoDB
---

### Limit方法

```shell
语法：
db.COLLECTION_NAME.find().limit(NUMBER)
# 如果你需要在MongoDB中读取指定数量的数据记录，可以使用MongoDB的Limit方法，limit()方法接受一个数字参数，该参数指定从MongoDB中读取的记录条数。

hqmongodb:PRIMARY> use runoob
switched to db runoob
hqmongodb:PRIMARY> db.col.find({"title":{$type:2}})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
hqmongodb:PRIMARY> db.col.find({},{"title":1,_id:0}).limit(2)
{ "title" : "PHP教程" }
{ "title" : "JAVA教程" }
#
```



### Skip方法

```shell
语法：
db.COLLECTION_NAME.find().limit(NUMBER).skip(NUMBER)
# 使用skip()方法跳过指定数量的数据，skip方法同样接受一个数字参数作为跳过的记录条数。
hqmongodb:PRIMARY> db.col.find({},{"title":1,_id:0}).limit(1).skip(1)
{ "title" : "JAVA教程" }
# 只显示第二条文档数据。skip()方法默认参数为 0 。
```



### createIndex方法

```shell
# 索引通常能够极大的提高查询的效率，如果没有索引，MongoDB在读取数据时必须扫描集合中的每个文件并选取那些符合查询条件的记录。这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可能要花费几十秒甚至几分钟，这对网站的性能是非常致命的。索引是特殊的数据结构，索引存储在一个易于遍历读取的数据集合中，索引是对数据库表中一列或多列的值进行排序的一种结构。
# MongoDB使用 createIndex() 方法来创建索引。在 3.0.0 版本前创建索引方法为 db.collection.ensureIndex()，之后的版本使用了 db.collection.createIndex() 方法，ensureIndex() 还能用，但只是 createIndex() 的别名。

语法：
db.collection.createIndex(keys, options)

hqmongodb:PRIMARY> db.col.createIndex({"title":1})
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
# 语法中 Key 值为你要创建的索引字段，1 为指定按升序创建索引，如果你想按降序来创建索引指定为 -1 即可。
hqmongodb:PRIMARY> db.col.createIndex({"title":1,"description":-1})
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 2,
	"numIndexesAfter" : 3,
	"ok" : 1
}
# createIndex() 方法中你也可以设置使用多个字段创建索引（关系型数据库中称作复合索引）
hqmongodb:PRIMARY> db.values.createIndex({open:1,close:1},{background:true})
{
	"createdCollectionAutomatically" : true,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
# 后台创建索引。通过在创建索引时加 background:true 的选项，让创建工作在后台执行
```

#### createIndex() 接收可选参数列表

| Parameter          | Type          | Description                                                  |
| ------------------ | ------------- | ------------------------------------------------------------ |
| background         | Boolean       | 建索引过程会阻塞其它数据库操作，background可指定以后台方式创建索引，即增加 "background" 可选参数。 "background" 默认值为**false**。 |
| unique             | Boolean       | 建立的索引是否唯一。指定为true创建唯一索引。默认值为**false**. |
| name               | string        | 索引的名称。如果未指定，MongoDB的通过连接索引的字段名和排序顺序生成一个索引名称。 |
| dropDups           | Boolean       | 3.0+版本已废弃。在建立唯一索引时是否删除重复记录,指定 true 创建唯一索引。默认值为 **false**. |
| sparse             | Boolean       | 对文档中不存在的字段数据不启用索引；这个参数需要特别注意，如果设置为true的话，在索引字段中不会查询出不包含对应字段的文档.。默认值为 **false**. |
| expireAfterSeconds | integer       | 指定一个以秒为单位的数值，完成 TTL设定，设定集合的生存时间。 |
| v                  | index version | 索引的版本号。默认的索引版本取决于mongod创建索引时运行的版本。 |
| weights            | document      | 索引权重值，数值在 1 到 99,999 之间，表示该索引相对于其他索引字段的得分权重。 |
| default_language   | string        | 对于文本索引，该参数决定了停用词及词干和词器的规则的列表。 默认为英语 |
| language_override  | string        | 对于文本索引，该参数指定了包含在文档中的字段名，语言覆盖默认的language，默认值为 language. |



### aggregate方法

```shell
# MongoDB中聚合(aggregate)主要用于处理数据(诸如统计平均值,求和等)，并返回计算后的数据结果。有点类似sql语句中的 count(*)。
# MongoDB中聚合的方法使用aggregate()。

语法：
db.COLLECTION_NAME.aggregate(AGGREGATE_OPERATION)

hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
hqmongodb:PRIMARY> db.col.aggregate([{$group:{_id:"$by",num_tutorial:{$sum:1}}}])
{ "_id" : "cn", "num_tutorial" : 3 }
# 统计每个作者所写的文章数。以上实例类似sql语句：select by, count(*) from col group by by;
# 上面的例子中，我们通过字段 by字段对数据进行分组，并计算 by字段相同值的总和。
```

#### 聚合的表达式

| 表达式    | 描述                                           | 实例                                                         |
| --------- | ---------------------------------------------- | ------------------------------------------------------------ |
| $sum      | 计算likes的总和。                              | db.col.aggregate([{$group : {_id : "$by", num_tutorial : {$sum : "$likes"}}}]) |
| $avg      | 计算likes的平均值                              | db.col.aggregate([{$group : {_id : "$by", num_tutorial : {$avg : "$likes"}}}]) |
| $min      | 获取集合中所有文档对应值得最小值。             | db.col.aggregate([{$group : {_id : "$by", num_tutorial : {$min : "$likes"}}}]) |
| $max      | 获取集合中所有文档对应值得最大值。             | db.col.aggregate([{$group : {_id : "$by", num_tutorial : {$max : "$likes"}}}]) |
| $push     | 在结果文档中插入值到一个数组中。               | db.col.aggregate([{$group : {_id : "$by", url : {$push: "$url"}}}]) |
| $addToSet | 在结果文档中插入值到一个数组中，但不创建副本。 | db.col.aggregate([{$group : {_id : "$by", url : {$addToSet : "$url"}}}]) |
| $first    | 根据资源文档的排序获取第一个文档数据。         | db.col.aggregate([{$group : {_id : "$by", first_url : {$first : "$url"}}}]) |
| $last     | 根据资源文档的排序获取最后一个文档数据         | db.col.aggregate([{$group : {_id : "$by", last_url : {$last : "$url"}}}]) |



### 管道的概念

```shell
# MongoDB的聚合管道将MongoDB文档在一个管道处理完毕后将结果传递给下一个管道处理。管道操作是可以重复的。
# 表达式：处理输入文档并输出。表达式是无状态的，只能用于计算当前聚合管道的文档，不能处理其它的文档。

# 这里我们介绍一下聚合框架中常用的几个操作：
$project：修改输入文档的结构。可以用来重命名、增加或删除域，也可以用于创建计算结果以及嵌套文档。
$match：用于过滤数据，只输出符合条件的文档。$match使用MongoDB的标准查询操作。
$limit：用来限制MongoDB聚合管道返回的文档数。
$skip：在聚合管道中跳过指定数量的文档，并返回余下的文档。
$unwind：将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
$group：将集合中的文档分组，可用于统计结果。
$sort：将输入文档排序后输出。
$geoNear：输出接近某一地理位置的有序文档。

hqmongodb:PRIMARY> db.col.aggregate({ $project:{ title:1, by:1, }})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "by" : "cn" }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "by" : "cn" }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "by" : "cn" }
# 结果中就只还有_id,tilte和by三个字段了，默认情况下_id字段是被包含的

hqmongodb:PRIMARY> db.col.aggregate({ $project:{ _id:0,title:1, by:1, }})
{ "title" : "PHP教程", "by" : "cn" }
{ "title" : "JAVA教程", "by" : "cn" }
{ "title" : "mongodb教程", "by" : "cn" }
# 不包含_id字段

hqmongodb:PRIMARY> db.col.aggregate([{$match:{likes:{$gt:100,$lte:200}}},{$group:{_id:null,count:{$sum:1}}}])
{ "_id" : null, "count" : 2 }
# $match用于获取likes大于100小于或等于200的记录，然后将符合条件的记录送到下一阶段$group管道操作符进行处理。

hqmongodb:PRIMARY> db.col.aggregate({$skip:2})
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
# 经过$skip管道操作符处理后，前两个文档被"过滤"掉。
```

