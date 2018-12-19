---
title: awk数组
date: 2018-10-17 15:20:44
tags: awk数组
categories: 基础
---

### awk数组

```shell
[root@bogon ~]# awk 'BEGIN{test[0]="大鹏";test[1]="少松";test[2]="老董";print test[1]}'
少松
# 为数组中的元素赋值，下标从0开始。最后打印数组中的第二个元素。awk的数组默认从1开始。

[root@bogon ~]# awk 'BEGIN{test[0]="大鹏";test[1]="少松";test[2]="老董";test[3]="正伟";test[4]="法林";test[5]="";print test[5]}'

# 上面test[5]设置为了空字符串，在awk中也是被允许的，所以可以打印出一个空行
[root@bogon ~]# awk 'BEGIN{test[0]="大鹏";test[1]="少松";test[2]="老董";test[3]="正伟";test[4]="法林";test[5]="";print test[6]}'

# 在引用一个不存在的数组元素也是可以的，会打印出一个空字符串。

* 语法
	if(下标 in 数组名)
	# 判断数组中是否存在对应的元素
	delete
	# 删除整个数组
	
* 使用数字为下标
[root@bogon ~]# awk 'BEGIN{test[0]="大鹏";test[1]="少松";test[2]="老董";test[3]="正伟";test[4]="法林";test[5]="";if(6 in test){print "数组的 第7个元素存在即可看到"}}'
# 如果下标是6的元素存在，就会打印后面的一段话
[root@bogon ~]# awk 'BEGIN{test[0]="大鹏";test[1]="少松";test[2]="老董";test[3]="正伟";test[4]="法林";test[5]="";if(!(6 in test)){print "数.的第7个元素不存在即可看到"}}'
数组的第7个元素不存在即可看到
# 也可以取反

* 以字符串为下标
[root@bogon ~]# awk 'BEGIN{test["a"]="大鹏";test["b"]="少松";test["cc"]="老董";test["fe"]="正伟";test["ews"]="法林";test["adg"]="";{print test["ews"]}}'
法林
# 还可以使用字符串作为下标，但字符串两侧一个要有双引号

* 删除
[root@bogon ~]# awk 'BEGIN{test["a"]="大鹏";test["b"]="少松";test["cc"]="老董";test["fe"]="正伟";test["ews"]="法林";test["adg"]="";print test["ews"];delete test;{print test["ews"]}}'
法林

# 在delete前的print可以打印出内容，经过delete删除数组后，就没法打印出同样数据元素的内容了

* 打印所有元素
[root@bogon ~]# awk 'BEGIN{test[1]="大鹏";test[2]="少松";test[3]="老董";test[4]="正伟";test[5]="法林";test[6]="";for (i=1;i<=6;i++){print i,test[i]}}'
1 大鹏
2 少松
3 老董
4 正伟
5 法林
6 
# 这种for循环只能输出以数字为下标的数组
[root@bogon ~]# awk 'BEGIN{test["a"]="大鹏";test["b"]="少松";test["cc"]="老董";test["fe"]="正伟";test["ews"]="法林";test["adg"]="";for(i in test){print i,test[i]}}'
cc 老董
a 大鹏
b 少松
fe 正伟
ews 法林
adg 
# for循环中的变量"i"表示的是元素的下标，而并非表示元素的值，所以，如果想要输出元素的值，则需要使用"print 数组名[变量]"
[root@bogon ~]# awk 'BEGIN{test[1]="大鹏";test[2]="少松";test[3]="老董";test[4]="正伟";test[5]="法林";test[6]="";for (i in test){print i,test[i]}}'
4 正伟
5 法林
6 
1 大鹏
2 少松
3 老董
# 使用这种for循环，是不能按数字顺序打印元素的，因为数字被转换成了字符串。awk中的数组本质上就是关联数组

* 统计次数
[root@bogon ~]# awk 'BEGIN{a=1;print a;a=a+1;print a}'
1
2
# 将变量a的值设置为1，进行加法计算，每次自加后，再次打印变量a的值，都会加1。a=a+1可以写为a++
[root@bogon ~]# awk 'BEGIN{a="test";print a;a=a+1;print a;a++;print a}'
test
1
2
# 字符串两侧一定要有双引号。字符串也可以进行运算，如果参与运算，字符串将被当做数字0进行运算
[root@bogon ~]# awk 'BEGIN{a="";print a;a=a+1;print a;a++;print a}'

1
2
# 空字符串也可以当做0进行运算
[root@bogon ~]# awk 'BEGIN{print test["i"];test["i"]++;print test["i"]}'

1
# 不存在的字符串也可以参与运算，因为不存在的字符串会被赋值为空字符串

[root@bogon ~]# cat test5
192.168.1.123	
192.168.1.124	
192.168.1.123	
192.168.1.123
192.168.1.124
192.168.2.222
172.16.100.3
172.16.100.3
172.16.100.3
172.16.100.3
172.16.100.3
172.16.100.3
192.168.1.15
172.16.100.7
[root@bogon ~]# awk '{count[$1]++}END{for(i in count){print i,count[i]}}' test5
172.16.100.3 6
192.168.2.222 1
172.16.100.7 1
192.168.1.123 3
192.168.1.124 2
192.168.1.15 1
# 使用空模式与END模式，空模式中，我们随便创建了一个数组，并且将IP地址作为引用元素的下标，进行了引用，所以，当执行到第一行时，我们引用的是count["192.168.1.123"]，这个元素并不存在，所以，当第一行被空模式中的动作处理完毕后，count["192.168.1.123"]的值已经被赋值为1了。这时，空模式中的动作继续处理下一行，而下一行的IP地址为192.168.1.124，所以，count["192.168.1.124"]第一次参与运算的过程与上述过程一样。其他IP地址第一次参与运算的过程与上述过程也一样。直到再次遇到相同的IP地址时，使用同样一个IP地址作为下标的元素将会再次被自加，每次遇到相同的IP地址，对应元素的值都会加1。直到处理完所有行，开始执行END模式中的动作。而END模式中，我们打印出了count数组中的所有元素的下标，以及元素对应的值。此刻，count数组中的下标即为IP地址，元素的值即为对应IP地址出现的次数。
# 我们对一个不存在的元素进行自加运算后，这个元素的值就变成了自加运算的次数

[root@bogon ~]# cat test4
Allen Phillips
Green Lee
William Aiden James Lee
Angel Jack
Tyler Kevin
Lucas Thomas
Kevin
[root@bogon ~]# awk '{for(i=1;i<=NF;i++){count[$i]++}}END{for(s in count){print s,count[s]}}' test4
Tyler 1
Angel 1
James 1
Lucas 1
William 1
Thomas 1
Green 1
Jack 1
Phillips 1
Kevin 2
Lee 2
Allen 1
Aiden 1
# 此命令与上面计算IP地址出现次数的命令同理，只是文件中比上面的文件多了几列，所以先将每列的内容赋值给count，NF就表示一共有几列，这会先将第一列的内容赋值给count，之后第二列第三列，但不会超过每行的总列数。理解了前半部分命令，END后面的动作就和上面的命令意思一样了。这里count[$i]赋值后就会变为count[Tyler]、count[Angel]等，然后给这个元素赋值，因为这是一个不存在的数组，并且空模式处理后会自加，所以赋值从1开始，也就是count[Tyler]=1、count[Angel]=1等，这个数字实际也就是最后要计算的次数了
```

