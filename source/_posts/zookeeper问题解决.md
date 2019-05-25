---
title: zookeeper问题解决
date: 2019-05-24 23:13:29
tags: zookeeper问题解决
categories: 消息队列
---

### 查看状态显示"not running"

```shell
# 查看zookeeper集群状态显示有"not running"字样
bin/zkServer.sh status
# 查看状态
tail -100 zookeeper.out
# zookeeper的启动信息在此文件中，此文件在zkServer.sh中定义，内容大概为"_ZOO_DAEMON_OUT="$ZOO_LOG_DIR/zookeeper.out"
# 启动失败时，在此文件中显示"Unexpected exception causing shutdown while sock still open"，解决办法一般有三，如下：
# 1. 将zookeeper主机名更改为IP地址
# 2. 以递减的id序列启动zookeeper实例。
# 3. 将initSize从5增加到100
# 此次大连广电的zookeeper集群不能启动的原因是没有把/xor/data0和data1里的zookeeper目录下的所有文件的属主和属组改为hadoop，因为启动zookeeper的是hadoop，不知道是哪设置的，在supervisord.conf中改user是没用的。
```

