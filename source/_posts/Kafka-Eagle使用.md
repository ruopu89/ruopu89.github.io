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
kafka.eagle.zk.cluster.alias=cluster1,cluster2 # 集群别名，为下面配置使用。多个集群用逗号分隔
cluster1.zk.list=dc-kafka01:2181,dc-kafka02:2181,dc-kafka03:2181 # zookeeper地址
cluster2.zk.list=dc-control01:2181,dc-control02:2181,dc-control03:2181
cluster1.kafka.eagle.broker.size=20
cluster2.kafka.eagle.broker.size=20
kafka.zk.limit.size=25  # 	Kafka Eagle Zookeeper客户端的最大连接数。
kafka.eagle.webui.port=8048  # 监听端口
cluster1.kafka.eagle.offset.storage=kafka
cluster2.kafka.eagle.offset.storage=kafka
# 这里如果是zk，表示存储在zookeeper中的Kafka偏移量。如果是kafka，表示存储在kafka主题中的Kafka偏移量。
kafka.eagle.metrics.charts=true # 启用监控趋势图
kafka.eagle.metrics.retain=30
kafka.eagle.sql.topic.records.max=5000
kafka.eagle.sql.fix.error=true
kafka.eagle.topic.token=keadmin
cluster1.kafka.eagle.sasl.enable=false
cluster1.kafka.eagle.sasl.protocol=SASL_PLAINTEXT
cluster1.kafka.eagle.sasl.mechanism=PLAIN
cluster2.kafka.eagle.sasl.enable=false
cluster2.kafka.eagle.sasl.protocol=SASL_PLAINTEXT
cluster2.kafka.eagle.sasl.mechanism=PLAIN
# 测试发现，可以不加集群的别名。直接使用kafka.eagle.sasl.enable，也就是去掉前面的别名，这样只写三行就可以了。
kafka.eagle.driver=org.sqlite.JDBC
kafka.eagle.url=jdbc:sqlite:/usr/local/kafka-eagle/db/ke.db
kafka.eagle.username=root
kafka.eagle.password=centos
# 参考：https://blog.csdn.net/qq_33696779/article/details/88655560

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



切换不同集群

![](/images/kafka-eagle/集群切换.png)

或者在首页的右上角也可以调整

![](/images/kafka-eagle/集群切换2.png)