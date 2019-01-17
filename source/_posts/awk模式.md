---
title: awk模式
date: 2018-10-17 11:28:32
tags: awk模式
categories: 基础
---

### awk模式

* BEGIN/END模式
* 关系表达式模式
* 空模式
* 正则模式
* 行范围模式



> 模式也可以理解为条件。不指定任何"条件"，awk会一行一行的处理文本中的每一行。指定了"条件"，只有满足"条件"的行才会被处理，不满足"条件"的行就不会被处理。



#### 关系表达式模式

| 关系运算符 | 含义                     | 用法示例    |
| ---------- | ------------------------ | ----------- |
| <          | 小于                     | x < y       |
| <=         | 小于等于                 | x <= y      |
| ==         | 等于                     | x == y      |
| !=         | 不等于                   | x != y      |
| >=         | 大于等于                 | x >= y      |
| >          | 大于                     | x > y       |
| ~          | 与对应的正则匹配则为真   | x ~ /正则/  |
| !~         | 与对应的正则不匹配则为真 | x !~ /正则/ |

```shell
[root@bogon ~]# cat test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
[root@bogon ~]# awk 'NF==5 {print $0}' test
abc 345 ssd asdf lkj;l
# 打印正好有五列的行。这里的条件就是这一行一共有五列

[root@bogon ~]# awk 'NF>2{print $0}' test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
[root@bogon ~]# awk 'NF<=4 {print $0}' test
# 文件中没有小于等于四列的行
[root@bogon ~]# awk '$1==123 {print $0}' test
123 klj adf daff adeills adsfei
# 一定要用两个等号
```

#### 空模式

```shell
[root@bogon ~]# awk '{print $0}' test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
# 没有使用模式实际是使用的空模式，"空模式"会匹配文本中的每一行，所以，每一行都满足"条件"
```

##### 打印奇偶行

```shell
[root@bogon ~]# cat test9
1
2
3
4
5
6
7
8
9
10
11
12
[root@bogon ~]# awk 'i=!i' test9
1
3
5
7
9
11
[root@bogon ~]# awk '!(i=!i)' test9
2
4
6
8
10
12
# 当awk开始处理第一行时，变量 i 被初始化，变量 i 在被初始化时，值为"空"，而awk中，数字0或者"空字符串"表示假，所以可以认为模式为假，但是 i 直接取反了，对假取反后的值为真，将取反后的值又赋值给了变量i，此刻，变量i的值为真，所以当awk处理第一行文本时，变量i的值被赋值为真，模式成立则需要执行对应的动作，而上例中又省略了动作，所以默认动作为"{print $0}"，所以，第一行被整行打印了。当第一行文本处理完毕后，awk开始处理第二行文本，此时，i 为真，但是取反后，i 为假，所以第二行没有被输出，依次类推，最终只打印了奇数行。打印偶数行同理，只是从第一次就让i为空字符串为假
* 知识点
# 在awk中，如果省略了模式对应的动作，当前行满足模式时，默认动作为打印整行，即{print $0}。
# 在awk中，0或者空字符串表示"假"，非0值或者非空字符串表示"真"

* 解析
[root@bogon ~]# awk '/1/{print $0}' test9
1
10
11
12
# 如果当前行中包含字符"1"，则执行对应的动作，而对应的动作就是打印整行。
root@ccjd:~# awk '/regi/&&/mi/&&/192/{print $0}' daemon.json | head
        "registry-mirrors":["http://192.168.0.198:80"],
# 也可以通过&&符号指定多个条件，需要同时满足才可以。
[root@bogon ~]# awk '$1>10{print $0}' test9
11
12
# 如果test9文本中文本行的第一列的值如果大于10，则打印整行。
[root@bogon ~]# awk '/1/' test9
1
10
11
12
[root@bogon ~]# awk '$1>10' test9
11
12
# 当使用了模式时，如果省略了模式对应的动作，默认动作为"{print $0}"，"空模式"与"BEGIN/END模式"除外。

[root@bogon ~]# cat test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '{print $0}' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '1{print $0}' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '2{print $0}' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '2' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '0{print $0}' test2
[root@bogon ~]# awk '0' test2
# 第一条awk命令使用了"空模式"，也就是说，每一行都满足模式，每一行经过"空模式"匹配以后结果都是"真"，所以每一行都会执行对应的动作。第二条awk命令原来"模式的位置"被替换为了数字"1"，我们可以把数字"1"理解成一种模式匹配后的结果，而1是非零值，在awk中非零值表示真，所以，"1"表示"真"，  换句话说就是模式的匹配结果为真，模式成立则会执行对应的动作，也就是打印整行。第三条awk命令与第二条awk命令同理，动作前的数字可以换为任何非0数字或非空字符串。第四条awk命令数字"2"为非零值，表示模式为真，当使用模式时，可以省略动作，当使用模式并省略动作时，默认动作为打印整行，所以，第四条awk命令表示打印所有行，因为每一行的模式都为真。第五条awk命令与第六条awk命令因为数字"0"与空字符串表示假，当模式为假时，不会执行对应的动作，而当存在模式并省略动作时，默认动作为打印整行，但是由于模式为假，所以对应的动作并未执行。
# 理解了此处，再看上面打印奇偶行就容易理解了
[root@bogon ~]# awk '!0' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '!5' test2
# 还能对真与假进行取反，非真即为假，非假即为真
[root@bogon ~]# awk 'i=1' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk 'i=a' test2
[root@bogon ~]# awk 'i="a"' test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk 'i=0' test2
[root@bogon ~]# awk 'i=""' test2
# 使用了awk的变量，将变量 i赋值为1，当 i=1 以后，i为非零值，表示为真，我们可以认为这是一种模式匹配后的结果，当模式为真时，同时省略了对应动作时，默认动作为打印整行，所以上例会输出test2中的所有行。

[root@bogon ~]# awk '{i=!i;print i}' test2
1
0
1
0
# 打印出处理每一行时，i 对应的值。
```



#### 正则模式

```shell
# 把"正则表达式"当做"条件"，能与正则匹配的行，就算满足条件，满足条件的行才会执行对应的动作，不能被正则匹配到的行，则不会执行对应的动作。

语法
awk '/正则表达式/{动作}' 文件

[root@bogon ~]# grep "^ruo" /etc/passwd
ruopu:x:1000:1000::/home/ruopu:/bin/bash
[root@bogon ~]# awk  '/^ruo/{print $0}' /etc/passwd
ruopu:x:1000:1000::/home/ruopu:/bin/bash

[root@bogon ~]# awk -F":" 'BEGIN{printf "%-10s%-10s\n","用户名","用户ID"} /^ruo/{printf "%-10s\t%-10s\n",$1,$3}' /etc/passwd
用户名       用户ID      
ruopu     	1000
# 从/etc/passwd文件中找出符合条件的行（用户名以ruo开头的用户）；找出符合条件的文本行以后，以":"作为分隔符，将文本行分段；取出我们需要的字段，格式化输出；结合BEGIN模式，输出一个格式化以后的文本，提高可读性

[root@bogon ~]# grep "/bin/bash" /etc/passwd
root:x:0:0:root:/root:/bin/bash
ruopu:x:1000:1000::/home/ruopu:/bin/bash
[root@bogon ~]# awk '/\/bin\/bash/{print $0}' /etc/passwd
root:x:0:0:root:/root:/bin/bash
ruopu:x:1000:1000::/home/ruopu:/bin/bash
# 使用斜线时要用转义符
# 当在awk命令中使用正则模式时，使用到的正则用法属于"扩展正则表达式"；

[root@bogon ~]# awk -V
GNU Awk 4.0.2
# CentOS7使用awk版本
[root@bogon ~]# cat test2
hey
heey
heeey
heeeey
[root@bogon ~]# awk '/he{2,3}y/{print $0}' test2
heey
heeey
# CentOS7中可以直接使用{x,y}的形式匹配
[root@bogon ~]# awk --posix '/he{2,3}y/{print $0}' test2
heey
heeey
[root@bogon ~]# awk --re-interval '/he{2,3}y/{print $0}' test2
heey
heeey
# 如果无法直接使用{x,y}的形式，就要使用--posix或者--re-interval选项
```

#### 行范围模式

```shell
* 语法
awk '/正则1/,/正则2/{动作}' 文件
# 从被正则1匹配到的行开始，到被正则2匹配到的行结束，之间的所有行都会执行对应的动作。在行范围模式中，不管是正则1，还是正则2，都以第一次匹配到的行为准

[root@bogon ~]# cat -n test4
     1	Allen Phillips
     2	Green Lee
     3	William Aiden James Lee
     4	Angel Jack
     5	Tyler Kevin
     6	Lucas Thomas
     7	Kevin
[root@bogon ~]# awk '/Lee/,/Kevin/{print $0}' test4
Green Lee
William Aiden James Lee
Angel Jack
Tyler Kevin
# 找出从Lee第一次出现的行，到Kevin第一次出现的行之间的所有行

[root@bogon ~]# awk 'NR>=3 && NR<=6 {print $0}' test4
William Aiden James Lee
Angel Jack
Tyler Kevin
Lucas Thomas
# 这样也可以打印出需要范围的行

* 关系运算符~与!~的使用
[root@bogon ~]# cat test3
主机名	网卡1的IP	网卡2的IP
主机A	192.168.1.123	192.168.1.124
主机B	192.168.2.222	172.16.100.3
主机C	10.1.0.1	172.16.100.3
主机D	10.1.2.1	192.168.1.15
主机E	10.1.5.1	172.16.100.5
主机F	192.168.1.234	172.16.100.6
主机G	10.1.7.1	172.16.100.7
[root@bogon ~]# awk '$2~/192\.168\.[0-9]{1,3}\.[0-9]{1,3}/{print $1,$2}' test3
主机A 192.168.1.123
主机B 192.168.2.222
主机F 192.168.1.234
# 找出网卡1的IP地址在192.168.0.0/16网段内的主机。先执行第二列匹配相应地址，最后再打印出来。如果正则模式不能使用，要加入--posix或者--re-interval选项
```

