---
title: MongoDB条件操作符
date: 2019-03-11 13:46:56
tags: MongoDB条件操作符
categories: MongoDB
---

### 大于操作符

```shell
hqmongodb:PRIMARY> db.col.remove({})
# 清空集合 "col" 的数据。col是自定义的名称，只要在插入数据时插入到自定义的集合名中即可。
hqmongodb:PRIMARY> db.col.insert({ title:'PHP教程', description:'PHP是一种脚本语言', by:'cn', url:'http://www.runoob.com', tags:['php'], likes:200 })
WriteResult({ "nInserted" : 1 })
# 向col集合中插入数据
hqmongodb:PRIMARY> db.col.insert({ title:'JAVA教程', description:'java是高级语言', by:'cn', url:'http://www.runoob.com', tags:['java'], likes:150 })
WriteResult({ "nInserted" : 1 })
hqmongodb:PRIMARY> db.col.insert({ title:'mongodb教程', description:'mongodb是Nosql', by:'cn', url:'http://www.runoob.com', tags:['mongodb'], likes:100 })
WriteResult({ "nInserted" : 1 })
# 插入三个文档
hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }

hqmongodb:PRIMARY> db.col.find({likes:{$gt:150}})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
# 获取 "col" 集合中 "likes" 大于 150 的数据。类似SQL语句：Select * from col where likes > 150;
```



### 大于等于操作符

```shell
hqmongodb:PRIMARY> db.col.find({likes:{$gte:150}})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
# 获取 "col" 集合中 "likes" 大于等于 150 的数据。类似SQL语句：Select * from col where likes >= 150;
```



### 小于操作符

```shell
hqmongodb:PRIMARY> db.col.find({likes:{$lt:150}})
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
# 获取 "col" 集合中 "likes" 小于 150 的数据。类似SQL语句：Select * from col where likes < 150;
```



### 小于等于操作符

```shell
hqmongodb:PRIMARY> db.col.find({likes:{$lte:150}})
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
# 获取 "col" 集合中 "likes" 小于等于 150 的数据。类似SQL语句：Select * from col where likes <= 150;
```



### 联合使用

```shell
hqmongodb:PRIMARY> db.col.find({likes:{$lt:200,$gt:100}})
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
# 获取"col"集合中 "likes" 大于100，小于 200 的数据。类似SQL语句：Select * from col where likes>100 AND  likes<200;
```



### $type操作符

```shell
# $type操作符是基于BSON类型来检索集合中匹配的数据类型，并返回结果。
# MongoDB中可以使用的类型有：(1)Double、(2)String、(3)Object、(4)Array、(5)Binary data、(7)Object id、(8)Boolean、(9)Date、(10)Null、(11)Regular Expression、(13)JavaScript、(14)Symbol、(15)JavaScript(with scope)、(16)32-bit integer、(17)Timestamp、(18)64-bit integer、(255)Min key、(127)Max key
hqmongodb:PRIMARY> db.col.find()
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
hqmongodb:PRIMARY> db.col.find({"title":{$type:2}})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
# 这里$type指定的是上面说明中类型前面的数字，也可以指定类型名称，如下
hqmongodb:PRIMARY> db.col.find({"title":{$type:'string'}})
{ "_id" : ObjectId("5c85f81c95892d355859a619"), "title" : "PHP教程", "description" : "PHP是一种脚本语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "php" ], "likes" : 200 }
{ "_id" : ObjectId("5c85f8f995892d355859a61a"), "title" : "JAVA教程", "description" : "java是高级语言", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "java" ], "likes" : 150 }
{ "_id" : ObjectId("5c85f93195892d355859a61b"), "title" : "mongodb教程", "description" : "mongodb是Nosql", "by" : "cn", "url" : "http://www.runoob.com", "tags" : [ "mongodb" ], "likes" : 100 }
```

