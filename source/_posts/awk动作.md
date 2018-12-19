---
title: awk动作
date: 2018-10-17 14:13:32
tags: awk动作
categories: 基础
---

### awk动作

* 输出语句
* 组合语句
* 条件判断控制语句
* 循环控制语句

```shell
[root@bogon ~]# awk '{print $0}' test2
hey
heey
heeey
heeeey
# {}与print $0是两个动作。"print"属于"输出语句"类型的动作，"输出语句"类型的动作的作用就是输出、打印信息。"{  }"属于"组合语句"类型的动作，组合语句"类型的动作的作用就是将多个代码组合成代码块。

[root@bogon ~]# cat test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
[root@bogon ~]# awk '{print $1}{print $2}' test
abc
345
123
klj
# 使用了两个大括号"{  }"，它们属于"组合语句"类型的动作，它们分别将两个print括住，表示这两个print动作分别作为两个独立的个体。先打印$1再打印$2
[root@bogon ~]# awk '{print $1;print $2}' test
abc
345
123
klj
# 将上面的动作组合在一起。当我们把多个动作（多段代码）组合成一个代码块的时候，每段动作（每段代码）之间需要用分号";"隔开
```



#### 条件判断控制语句

```shell
* 语法
    if(条件)
    {
    语句1;
    语句2;
    ...
    } 

[root@bogon ~]# awk '{if(NR == 1){print $0}}' test
abc 345 ssd asdf lkj;l
# 一定要将动作写在{}中，控制语句也要有{}，所以这里有两个{}，if语句中的大括号中，也可以执行多个动作。将行号是1的行打印出来。
[root@bogon ~]# awk '{if(NR == 1){print $1;print $2}}' test
abc
345
# 如果行号是1，就打印第一列和第二列
[root@bogon ~]# awk '{if(NR == 1)print $1}' test
abc
# 如果if后的动作只有一个，那么也可以不写{}

* 语法
    "if...else..."的语法如下：
    if(条件)
    {
    语句1;
    语句2;
    ...
    }
    else
    {
    语句1;
    语句2;
    ...
    }

    "if...else if...else"的语法如下：
    if(条件1)
    {
    语句1;
    语句2;
    ...
    }
    else if(条件2)
    {
    语句1;
    语句2;
    ...
    }
    else
    {
    语句1;
    语句2;
    ...
    }

[root@bogon ~]# awk -F":" '{if($3 < 1000){print $1,"系统用户"}else{print $1,"普通用户"}}' /etc/passwd
root 系统用户
bin 系统用户
daemon 系统用户
adm 系统用户
lp 系统用户
sync 系统用户
shutdown 系统用户
halt 系统用户
mail 系统用户
operator 系统用户
games 系统用户
ftp 系统用户
nobody 系统用户
systemd-network 系统用户
dbus 系统用户
polkitd 系统用户
postfix 系统用户
sshd 系统用户
openvpn 系统用户
ruopu 普通用户
# 对/etc/passwd文件中的用户做判断，用户ID小于1000的为系统用户，否则就是普通用户

[root@bogon ~]# cat test7
姓名	年龄
aaa	18
bbb	66
ccc	36
[root@bogon ~]# awk 'NR !=1{if($2<=30){print $1,"年轻人"}else if($2>=30 && $2<=50){print $1,"中年人"}else{print $1,"老年人"}}' test7
aaa 年轻人
bbb 老年人
ccc 中年人
# 首先忽略第一行，然后判断文件中第二列的年龄，最后打印出结果
```

##### 三元运算

```shell
* 语法
条件?结果1:结果2
# 如果条件成立，则返回结果1，如果条件不成立，则返回结果2。

表达式1 ? 表达式2 : 表达式3
# 如果表达式1为真，则执行表达式2，如果表达式1为假，则执行表达式3

[root@bogon ~]# awk -F: '{if($3 < 1000){usertype="系统用户"}else{usertype="普通用户"};print $1,usertype}' /etc/passwd
root 系统用户
bin 系统用户
daemon 系统用户
adm 系统用户
lp 系统用户
sync 系统用户
shutdown 系统用户
halt 系统用户
mail 系统用户
operator 系统用户
games 系统用户
ftp 系统用户
nobody 系统用户
systemd-network 系统用户
dbus 系统用户
polkitd 系统用户
postfix 系统用户
sshd 系统用户
openvpn 系统用户
ruopu 普通用户
# 使用"if...else"结构，对usertype变量进行了赋值，如果用户的UID小于1000，则对usertype变量赋值为"系统用户",否则赋值usertype变量为"普通用户"，最后打印出用户名所在的列与usertype变量的值。
[root@bogon ~]# awk -F: '{usertype=$3<1000?"系统用户":"普通用户";print $1,usertype}' /etc/passwd
root 系统用户
bin 系统用户
daemon 系统用户
adm 系统用户
lp 系统用户
sync 系统用户
shutdown 系统用户
halt 系统用户
mail 系统用户
operator 系统用户
games 系统用户
ftp 系统用户
nobody 系统用户
systemd-network 系统用户
dbus 系统用户
polkitd 系统用户
postfix 系统用户
sshd 系统用户
openvpn 系统用户
ruopu 普通用户
# "$3<1000"就是语法中的"条件"，"系统用户"就是语法中"?"后面的"结果1"，"普通用户"就是语法中":"后面的"结果2" ，同时，在上例中我们使用usertype变量接收了三元运算后的返回值，所以，当条件成立时，usertype变量被赋值为"系统用户"，当条件不成立时，usertype变量被赋值为"普通用户"。

[root@bogon ~]# awk -F: '{$3<1000?a++:b++}END{print a,b}' /etc/passwd
19 1
# "$3<1000"即为表达式1，"a++"即为表达式2，"b++"即为表达式3。当每遇到一个UID小于1000的用户，我就对变量a加1，否则我就对变量b加1，从而算出了系统用户与普通用户的数量，最后再END模式中输出了变量a与变量b的值。
```

#### 循环控制语句

```shell
* 语法
    # for循环语法格式1
    for(初始化; 布尔表达式; 更新) {
    //代码语句
    }

    # for循环语法格式2
    for(变量 in 数组) {
    //代码语句
    }

    # while循环语法
    while( 布尔表达式 ) {
    //代码语句
    }

    # do...while循环语法
    do {
    //代码语句
    }while(条件)

[root@bogon ~]# awk 'BEGIN{for(i=1;i<=6;i++){print i}}'
1
2
3
4
5
6
[root@bogon ~]# awk -v i=1 'BEGIN{while(i<=5){print i;i++}}'
1
2
3
4
5
[root@bogon ~]# awk 'BEGIN{i=1;while(i<=5){print i;i++}}'
1
2
3
4
5

[root@bogon ~]# awk 'BEGIN{i=1;do{print "test";i++}while(i<1)}'
test
[root@bogon ~]# awk 'BEGIN{i=1;do{print "test";i++}while(i<11)}'
test
test
test
test
test
test
test
test
test
test
# 不论如何，先执行一次do后面的动作

* 跳出循环语法
	continue的作用：跳出"当前"循环
	break的作用：跳出"整个"循环

[root@bogon ~]# awk 'BEGIN{for(i=0;i<6;i++){if(i==3){continue};print i}}'
0
1
2
4
5
# 先设置i在0到6之前循环，再判断，如果i等于3就跳过此次循环。if动作是for循环的一部分。也就是for(){if(){}}
[root@bogon ~]# awk 'BEGIN{for(i=0;i<6;i++){if(i==3){break};print i}}'
0
1
2
# break可以跳出整个循环
# continue与break同样可以用于while循环与do...while循环，此处就不再赘述了。

* 退出
	exit
	next
	
[root@bogon ~]# awk 'BEGIN{print 1;exit;print 2;print 3}'
1
# 使用exit会跳出整个脚本，所以没有打印2和3
[root@bogon ~]# awk 'BEGIN{print "start";exit}{print $0}END{print "over"}' test
start
over
# exit并不会跳出awk命令，遇到exit后，之后的命令都不执行，它会直接执行END模式的动作。如果没有END模式，将直接退出整个awk命令。

[root@bogon ~]# cat test8
1
2
3
[root@bogon ~]# awk '{if(NR==2){next};print $0}' test8
1
3
# next命令可以促使awk不对当前行执行对应的动作，而是直接处理下一行。next与continue有些类似，只是，continue是针对"循环"而言的，continue的作用是结束"本次循环"，而next是针对"逐行处理"而言的，next的作用是结束"对当前行的处理"，从而直接处理"下一行"
```

