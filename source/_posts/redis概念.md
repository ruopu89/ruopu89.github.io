---
title: redis概念
date: 2019-01-08 09:00:38
tags: redis概念
categories: Redis
---

### ACID

> - 原子性（Atomic:）：要么整个事务成功，要么整个不成功。
> - 一致性（Consistency）：数据库在事务之间处于一个一致的状态中。比方说，如果一条记录指向另一条记录，而到事务结束时这个指向是无效的，那么整个事务就必须回滚。
> - 隔离性（Isolation）：在其他事务结束之前，事务看不到被它们更改的数据。
> - 持久性（Durability）：一旦数据库系统通知用户事务成功，数据就永不丢失。



### BASE

> - 基本可用（Basically Available）：用户都有一种愚蠢的期望，就是当他们把浏览器指向一个网页时，就会有某些信息出现。这是你期望发生的，即便系统的某些部分宕机了也一样。这听上去微不足道，事实却并非如此；有很多系统只要一台服务器宕了，整个系统就宕了。
> - 可伸缩（Scalable）：添加更多的服务器使得服务更多的客户成为可能。不是创建一个巨大的怪物服务器，而是添加更多的服务器，这更具有前瞻性，而且也通常更便宜。重申一下，这是用户的期望之一：信息不仅仅是出现，而且还要快速地出现。（注意这项用户期望不仅要求伸缩性，还同时要求性能。）
> - 最终一致（Eventually Consistent）：如果数据最终在所有副本出现的地方变为可用，这就足够了（如上一点所述，你可以有很多副本）。这里的期望是，信息要快速出现才会显得及时。 当你在Craigslist上发布一个广告，它不会马上出现在列表和搜索结果中，这不是太大的问题；但如果一个广告需要几天才出现，就没有人会去用那个网站了。



### CAP

> - C: Consistency 一致性：多个数据节点上的数据一致；
> - A: Availability 可用性(指的是快速获取数据)：用户发出请求后的有限时间范围内返回结果；
> - P: Tolerance of network Partition 分区容忍性(分布式)：网络发生分区后，服务是否依然可用；

> BASE一般与由大量服务器组成的系统有关。在一致性、可用性和分区宽容度这三者中，你只能选择两者而不能三者兼而有之。**在任何时间点，不管哪台服务器应答了一个请求，所有服务器都会给出同样的答案。可用性的意思是即使某些服务器宕机了，整个系统仍能正常工作。最后，分区宽容度是指两台服务器之间的通信可以丢失，而系统仍能正常工作。**虽然SQL数据库大多是兼容ACID的，但注重BASE的数据库更适合Web应用程序。