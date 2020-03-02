---
title: Kafka Eagle使用
date: 2020-02-24 19:32:56
tags: kafka监控
categories: 消息队列
---

#### 介绍

Kafka Eagle为kafka集群监控第三方工具



#### 安装

```shell
下载地址：http://download.kafka-eagle.org/，选择Direct File Download下载即可。
wget https://github.com/smartloli/kafka-eagle-bin/archive/v1.4.4.tar.gz
tar xf v1.4.4.tar.gz
mv kafka-eagle-bin-1.4.4/kafka-eagle-web-1.4.4-bin.tar.gz ./
tar xf kafka-eagle-web-1.4.4-bin.tar.gz -C /usr/local
cd /usr/local/
ln -sv kafka-eagle-web-1.4.4/ kafka-eagle
cd kafka-eagle
vim conf/system-config.properties
kafka.eagle.zk.cluster.alias=cluster1   # 多个集群用逗号分隔
cluster1.zk.list=kafka1:2181,kafka2:2181,kafka3:2181  # zookeeper地址
kafka.zk.limit.size=25
kafka.eagle.webui.port=8048   # 监听端口
cluster1.kafka.eagle.offset.storage=kafka
kafka.eagle.metrics.charts=true
kafka.eagle.metrics.retain=30
kafka.eagle.sql.topic.records.max=5000
kafka.eagle.sql.fix.error=true
kafka.eagle.topic.token=keadmin
cluster2.kafka.eagle.sasl.enable=false
cluster2.kafka.eagle.sasl.protocol=SASL_PLAINTEXT
cluster2.kafka.eagle.sasl.mechanism=PLAIN
kafka.eagle.driver=org.sqlite.JDBC
kafka.eagle.url=jdbc:sqlite:/usr/local/kafka-eagle/db/ke.db
kafka.eagle.username=root
kafka.eagle.password=centos

yum install -y java-1.8.0-openjdk-devel.x86_64 
vim /etc/profile
export KE_HOME=/usr/local/kafka-eagle
export JAVA_HOME=/usr
. /etc/profile
# 安装java，设置环境变量
cd /usr/local/kafka-eagle/bin/
chmod +x ke.sh
./ke.sh start
# 启动kafka-eagle就是安装，如果没有问题，会提示登录地址与登录用户名和密码
```



查看消息堆积数

![](/images/kafka-eagle/消息堆积查看1.png)

![](/images/kafka-eagle/消息堆积查看2.png)



大屏查看

![](/images/kafka-eagle/大屏1.png)

![](/images/kafka-eagle/大屏2.png)

