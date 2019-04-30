---
title: MongoDB监控
date: 2019-03-11 16:03:28
tags: MongoDB监控
categories: MongoDB
---

### 介绍

> 在你已经安装部署并允许MongoDB服务后，你必须要了解MongoDB的运行情况，并查看MongoDB的性能。这样在大流量得情况下可以很好的应对并保证MongoDB正常运作。
>
> MongoDB中提供了mongostat 和 mongotop 两个命令来监控MongoDB的运行情况。



### mongostat命令

```shell
[root@master ~]# mongostat -u system -p centos --authenticationDatabase admin -h 192.168.251.134:27017
insert query update delete getmore command % dirty % used flushes  vsize   res qr|qw ar|aw netIn netOut conn       set repl                      time
    *0    *0     *0     *0       0     1|0     0.0    0.0       0 801.0M 52.0M   0|0   0|0   79b    19k    3 hqmongodb  PRI 2019-03-11T16:06:14+08:00
    *0    *0     *0     *0       0     1|0     0.0    0.0       0 801.0M 52.0M   0|0   0|0   79b    19k    3 hqmongodb  PRI 2019-03-11T16:06:15+08:00
......
# mongostat是mongodb自带的状态检测工具，在命令行下使用。它会间隔固定时间获取mongodb的当前运行状态，并输出。如果你发现数据库突然变慢或者有其他问题的话，你第一手的操作就考虑采用mongostat来查看mongo的状态。
```



### mongotop命令

```shell
[root@master ~]# mongotop -u system -p centos --authenticationDatabase admin -h 192.168.251.134:27017
2019-03-11T16:08:02.818+0800	connected to: 192.168.251.134:27017

                    ns    total    read    write    2019-03-11T16:08:03+08:00
        local.oplog.rs      1ms     1ms      0ms                             
    admin.system.roles      0ms     0ms      0ms                             
    admin.system.users      0ms     0ms      0ms                             
  admin.system.version      0ms     0ms      0ms                             
              local.me      0ms     0ms      0ms                             
local.replset.election      0ms     0ms      0ms                             
local.replset.minvalid      0ms     0ms      0ms                             
     local.startup_log      0ms     0ms      0ms                             
  local.system.replset      0ms     0ms      0ms                             
        runoob.article      0ms     0ms      0ms
# mongotop也是mongodb下的一个内置工具，mongotop提供了一个方法，用来跟踪一个MongoDB的实例，查看那些花费在读取和写入数据的大量时间的操作。 mongotop提供每个集合的水平的统计数据。默认情况下，mongotop返回值的每一秒。
# ns：包含数据库命名空间，后者结合了数据库名称和集合。
# db：包含数据库的名称。名为 . 的数据库针对全局锁定，而非特定数据库。
# total：mongod花费的时间工作在这个命名空间提供总额。
# read：mongod在此命名空间花费在执行读操作的时间。
# write：提供这个命名空间进行写操作的时间。
```

