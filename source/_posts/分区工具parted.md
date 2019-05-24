---
title: 分区工具parted
date: 2019-05-16 16:57:09
tags: 分区工具
categories: 基础
---

```shell
parted
select /dev/sdb         #切换磁盘
mklable gpt         # 切换为gpt模式
mkpart primary 0 -1         # 创建磁盘，命名为primary，0 -1表示分配所有磁盘空间
toggle 1 lvm        # 将第1个分区改为lvm
print       # 查看
# 这里有一个问题，分配大于2TB空间的磁盘，在查看分区时会有一个Partition 1 does not start on physical sector boundary.的提示
# 也可以使用gdisk工具分配大于2TB空间的磁盘，使用方法与fdisk类似。

unit TB		# 设置单位为TB
mkpart primary 0 3 		# 设置为一个主分区,大小为3TB，开始是0，结束是3
```

