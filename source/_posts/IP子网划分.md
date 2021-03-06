---
title: IP子网划分
date: 2019-05-10 10:12:55
tags: 子网划分
categories: 网络
---

### 概念

1. CIDR：Classless Inter-Domain Routing，元类域间路由选择。形式如：192.168.10.32/28。前面的数字是我们的网络地址，后面的28表示用28位来表示网络位，用32-28=4位来表示主机位。通过这种记法，我们能明确两个信息：
   - 网络地址：192.168.10.32
   - 子网掩码：255.255.255.240

2. 子网掩码与CIDR表示法的关系

   其中/8-/15位掩码只能用于A类网络，/16-/23可用于A类和B类网络，而/24-/30可用于A类、B类和C类网络。

| 子网掩码        | CIDR值 |
| --------------- | ------ |
| 255.0.0.0       | /8     |
| 255.128.0.0     | /9     |
| 255.192.0.0     | /10    |
| 255.224.0.0     | /11    |
| 255.240.0.0     | /12    |
| 255.248.0.0     | /13    |
| 255.252.0.0     | /14    |
| 255.254.0.0     | /15    |
| 255.255.0.0     | /16    |
| 255.255.128.0   | /17    |
| 255.255.192.0   | /18    |
| 255.255.224.0   | /19    |
| 255.255.240.0   | /20    |
| 255.255.248.0   | /21    |
| 255.255.252.0   | /22    |
| 255.255.254.0   | /23    |
| 255.255.255.0   | /24    |
| 255.255.255.128 | /25    |
| 255.255.255.192 | /26    |
| 255.255.255.224 | /27    |
| 255.255.255.240 | /28    |
| 255.255.255.248 | /29    |
| 255.255.255.252 | /30    |



### 方法

#### 选定的子网掩码将创建多少个子网

> 2^x个，其中x是子网掩码借用的主机位数。如：192.168.10.32/28，我们知道C类ip的默认子网掩码为：255.255.255.0。这个IP的28位子网掩码是：255.255.255.240。原本最后一个字节应该是0（00000000），现在却是240（11110000）。故其借用了主机位4位来充当网络位。可创建的子网数是2^4，就是16个



#### 每个子网可包含多少台主机

> 2^y-2台，其中y是没被借用的主机位的位数。减2是因为，主机位全为0的部分是这个子网的网段号（Net_id），全为1的部分是这个网段的广播地址。



#### 有哪些合法的子网

> 算出子网的步长（增量）。使用256减去子网最后一位，计算出子网步长。如256-192 = 64，即子网掩码为192时，步长为64。从0开始不断增加，直到到达子网掩码值，中间的结果就是子网，即0、64、128和192



#### 每个子网的广播地址

> 主机位全为1就是该子网的广播地址。一般我们这样计算：广播地址总是下一个子网前面的数。前面确定了子网为0、64、128和192，例如，子网0的广播地址为63，因为下一个子网为64；子网64的广播地址为127，因为下一个子网为128，以此类推。最后一个子网的广播地址总是255



#### 每个子网可包含哪些主机地址

> 合法的主机地址位于两个子网之间，但全为0和全为1的地址除外。例如，如果子网号（网段号）为64，而广播地址为127，则合法的主机地址范围为65-126，即子网地址和广播地址之间的数字。



### 实例

> 问题：将10.129.14.0/25划分为四个网段
>
> 1. 确定子网掩码
>
> 因为现在的子网掩码已经是255.255.255.128，所以要通过借位划分子网掩码，现在子网掩码二进制为11111111.11111111.11111111.10000000，在最后的10000000要再借两位才能实现将子网划分为4个，这里将11111111.11111111.11111111.10000000看作标准子网掩码，子网的数量等于2^x，x是子网掩码借用的主机位数，所以要借两位，子网掩码为11111111.11111111.11111111.11100000
>
> 2. 计算子网
>
> 因为上面计算出了子网掩码为255.255.255.224，使用256-224=32，这样就计算出了步长。子网为：0、32、64、128
>
> 3. 子网地址
>
> 10.129.14.0 - 10.129.14.31
>
> 10.129.14.32 - 10.129.14.63
>
> 10.129.14.64 - 10.129.14.95
>
> 10.129.14.96 - 10.129.14.127
>
> 每个子网的主机数量是2^5，也就是32个。每个网段的第一个地址是网络地址，最后一个是广播地址不能使用，可以使用第二个地址作为网关，如10.129.14.32 - 10.129.14.63，10.129.14.32是网络地址，10.129.14.63是广播地址，10.129.14.33可以作为网关使用。那么每个网段真正可以使用的是30个地址

