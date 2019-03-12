---
title: MongoDB备份与恢复
date: 2019-03-11 15:33:28
tags: MongoDB备份与恢复
categories: MongoDB
---

### 数据备份

```shell
语法：
mongodump -h dbhost -d dbname -o dbdirectory
# -h：MongDB所在服务器地址，例如：127.0.0.1，当然也可以指定端口号：127.0.0.1:27017
# -d：需要备份的数据库实例，例如：test
# -o：备份的数据存放位置，例如：c:\data\dump，当然该目录需要提前建立，在备份完成后，系统自动在dump目录下建立一个test目录，这个目录里面存放该数据库实例的备份数据。
# -u: 指定用户名
# -p: 指定密码

[root@master ~]# mkdir /tmp/mongodb
[root@master ~]# mongodump -h 192.168.251.134:27017 -o /tmp/mongodb/ -u system -p centos
2019-03-11T15:40:42.802+0800	writing admin.system.users to 
2019-03-11T15:40:42.803+0800	done dumping admin.system.users (2 documents)
2019-03-11T15:40:42.803+0800	writing admin.system.version to 
2019-03-11T15:40:42.804+0800	done dumping admin.system.version (1 document)
2019-03-11T15:40:42.804+0800	writing runoob.collection to 
2019-03-11T15:40:42.805+0800	writing runoob.col to 
2019-03-11T15:40:42.805+0800	writing runoob.test to 
2019-03-11T15:40:42.805+0800	writing runoob.runoob to 
2019-03-11T15:40:42.806+0800	done dumping runoob.collection (3 documents)
2019-03-11T15:40:42.806+0800	writing runoob.mycol to 
2019-03-11T15:40:42.807+0800	done dumping runoob.col (3 documents)
2019-03-11T15:40:42.807+0800	writing runoob.values to 
2019-03-11T15:40:42.807+0800	done dumping runoob.mycol (0 documents)
2019-03-11T15:40:42.808+0800	writing test.col to 
2019-03-11T15:40:42.808+0800	done dumping runoob.values (0 documents)
2019-03-11T15:40:42.808+0800	done dumping test.col (0 documents)
2019-03-11T15:40:42.841+0800	done dumping runoob.test (1 document)
2019-03-11T15:40:42.842+0800	done dumping runoob.runoob (0 documents)
# 备份所有库到/tmp/mongodb下
[root@master ~]# ls /tmp/mongodb/
admin  runoob  test
```



### 数据恢复

```shell
[root@master ~]# mongorestore -h 192.168.251.134:27017 -d admin /tmp/mongodb/admin/ -u system -p centos
2019-03-11T15:48:44.761+0800	building a list of collections to restore from /tmp/mongodb/admin dir
2019-03-11T15:48:44.764+0800	restoring users from /tmp/mongodb/admin/system.users.bson
2019-03-11T15:48:44.825+0800	done
[root@master ~]# mongorestore -h 192.168.251.134:27017 -d test /tmp/mongodb/test/ -u system -p centos --authenticationDatabase admin，不然会报验证失败的错误。

2019-03-11T15:52:39.194+0800	building a list of collections to restore from /tmp/mongodb/test dir
2019-03-11T15:52:39.195+0800	reading metadata for test.col from /tmp/mongodb/test/col.metadata.json
2019-03-11T15:52:39.196+0800	restoring test.col from /tmp/mongodb/test/col.bson
2019-03-11T15:52:39.198+0800	restoring indexes for collection test.col from metadata
2019-03-11T15:52:39.200+0800	finished restoring test.col (0 documents)
2019-03-11T15:52:39.200+0800	done
# 命令中必须加入--authenticationDatabase admin，不然会报验证失败的错误。

[root@master ~]# mongorestore -h 192.168.251.134:27017 /tmp/mongodb/ -u system -p centos --authenticationDatabase admin
# 恢复所有数据库

============================================================================================
mongodump与mongoexport的区别：
a. mongodump导出的是bson格式，是二进制形式，不过可以使用mongo自带的bsondump命令查看里面的数据，而mongoexport导出的则是文本，可以是csv、json格式。
b. JSON可读性强但体积较大，BSON则是二进制文件，体积小但对人类几乎没有可读性。
c. 在一些mongodb版本之间，BSON格式可能会随版本不同而有所不同，所以不同版本之间用mongodump/mongorestore可能不会成功，具体要看版本之间的兼容性。当无法使用BSON进行跨版本的数据迁移的时候，使用JSON格式即mongoexport/mongoimport是一个可选项。跨版本的mongodump/mongorestore个人并不推荐，实在要做请先检查文档看两个版本是否兼容（大部分时候是的）。
d. JSON虽然具有较好的跨版本通用性，但其只保留了数据部分，不保留索引，账户等其他基础信息。使用时应该注意。
============================================================================================
```



### 恢复节点

```shell
1. 将复制集中要恢复的节点移除
rs.remove("10.10.17.26:27000")
2. 运行mongorestore --oplogReplay命令
mongorestore --host 10.10.17.26 --port  27000 --oplogReplay  /data/mongodbbackup/20150820/
3. 创建oplog
use local 
db.createCollection("oplog.rs", {"capped" : true, "size" : 10000000})
4. 恢复oplog
mongorestore --host 10.10.17.26 --port  27000 -d local -c oplog.rs  /data/mongodbbackup/20150820/oplog.bson
5. 将该节点加入到复制集 
rs.add("10.10.17.26:27000")
```

