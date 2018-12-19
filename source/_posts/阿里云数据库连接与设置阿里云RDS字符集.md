---
title: 阿里云数据库连接与设置阿里云RDS字符集
date: 2018-09-14 13:32:44
tags: 阿里云
categories: 阿里云
---

# 测试数据库连接

注：阿里云在添加白名单时，如果是内网主机，就选专有网络。因为虚拟机与阿里云RDS都使用的是专有网络。如果用外网连接数据库，就将外网的地址添加到白名单的经典网络。另外，还要注意数据库中的用户应该有从外网地址连接的权限。

![](/images/aliRDS/设置白名单.jpg)

```shell
[root@test ~]# traceroute -n -T -p 3306 rm-2zeik6f1smno.mysql.rds.aliyuncs.com
traceroute to rm-2zeiks9o06fas81smno.mysql.rds.aliyuncs.com (0.90.0.18), 30 hops max, 60 byte packets
 1  * * *
 2  123.127.52.225  1.151 ms  1.556 ms  1.948 ms
 3  124.65.151.117  9.099 ms  9.282 ms  9.376 ms
 4  124.65.226.253  3.983 ms  4.504 ms  4.656 ms
 5  * * *
 6  * 61.51.169.69  5.301 ms *
 7  * * *
 8  * * *
 9  123.56.34.25  6.576 ms 101.200.109.133  5.156 ms  4.126 ms
10  * * 123.56.34.89  4.640 ms
11  * * *
12  * * *
13  * * *
14  * * *
15  * * *
16  * * *
17  * * *
18  * * *
19  * * *
20  * * *
21  * * *
22  * * *
23  * * *
24  * * *
25  * * *
26  * * *
27  * * *
28  * * *
29  * * *
30  * * *
#上述探测数据中，目标端口在第 11 跳之后就没有数据返回。说明相应端口在该节点被阻断。
```

参考：https://help.aliyun.com/knowledge_detail/40572.html?spm=5176.11065259.1996646101.searchclickresult.4ffa1754h73l7T（能 ping 通但端口不通时端口可用性探测说明）

# 修改字符集

```shell
1. 连接数据库
mysql -hrm-2zeiks9sm.mysql.rds.aliyuncs.com -uroot -p
2. 查看字符集
MySQL [(none)]> show variables like '%char%';
+--------------------------+---------------------------------------+
| Variable_name            | Value                                 |
+--------------------------+---------------------------------------+
| character_set_client     | utf8                                  |
| character_set_connection | utf8                                  |
| character_set_database   | utf8                                  |
| character_set_filesystem | binary                                |
| character_set_results    | utf8                                  |
| character_set_server     | utf8                                  |
| character_set_system     | utf8                                  |
| character_sets_dir       | /u01/mysql57_20180725/share/charsets/ |
+--------------------------+---------------------------------------+
3. 修改字符集
MySQL [echarging]> set character_set_client=utf8mb4;
MySQL [echarging]> set character_set_connection=utf8mb4;
MySQL [echarging]> set character_set_results=utf8mb4;
MySQL [echarging]> set character_set_database=utf8mb4; 
MySQL [echarging]> set character_set_server=utf8mb4;
4. 修改character_set_server也可以在阿里云的控制台操作
```

![打开设置参数](/images/aliRDS/设置mysql参数1.jpg)

![找到要修改的项进行修改](/images/aliRDS/设置mysql参数2.jpg)

![修改后提交](/images/aliRDS/设置mysql参数3.jpg)