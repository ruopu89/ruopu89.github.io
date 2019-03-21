---
title: shellScript语法及使用方法
date: 2019-01-13 21:02:43
tags: ShellScript语法
categories: Shell
---

### 清除日志的三种方法

```shell
1. echo > test.log 或 echo "" > test.log
2. >test.log
3. cat /dev/null > test.log
```



### Shell脚本执行方式

> 当shell脚本以非交互的方式运行时，它会先查找环境变量ENV，该变量指定了一个环境文件（通常是.bashrc），然后从该环境变量文件开始执行，当读取了ENV文件后，SHELL才开始执行shell脚本中的内容。

```shell
1. bash script-name或sh script-name（推荐使用）；没有执行权限也可以执行。
2. path/script-name或./script-name（当前路径 下执行脚本）
3. source script-name或. script-name
# 注意“.”点号；使用source或点号来加载或读入脚本，然后，依次执行指定shell脚本文件son.sh中的所有语句。这些语句将作为当前父shell脚本father.sh进程的一部分运行。因此，使用source或点号可以将son.sh自身脚本中的变量的值或函数等的返回值传递到当前的父shell脚本father.sh中使用。这就是在脚本中使用点或source加载文件的意义，为使用加载的文件中的内容可被当前脚本使用。这是第三种方法与前两种的最大区别。
全局环境变量：/etc/profile、/etc/profile.d、/etc/bashrc
用户环境变量：./bash_profile、.bashrc
例：
[root@template sh]# vim tesh1.sh
#!/bin/bash
#
userdir=`pwd`
[root@template sh]# chmod +x tesh1.sh 
[root@template sh]# bash tesh1.sh 
[root@template sh]# echo $userdir

# 没有执行结果
[root@template sh]# . tesh1.sh 
[root@template sh]# echo $userdir
/root/sh
# 用source或点号执行后，再用echo命令执行才有结果。用source或点号执行才能将变量加载到当前环境变量。
```



### shell脚本开发基本规范及习惯

```shell
1. 开头指定脚本解释器
2. 开头加版本版权等信息
    #Date: 16:29 2012-3-30	时间
    #Authou: oldboy	作者
    #Mail：aaaa@qq.com	联系方式
    #Function：this scripts function is ...	脚本的功能是什么 
    #Version： 1.1	脚本的版本号
# 可配置vim编辑文件时自动加上以上信息，方法是修改~/.vimrc配置文件
3. 脚本中不用中文件注释
4. 脚本以.sh为扩展名
5. 代码书写优秀习惯
    1. 成对内容的一次写出来，防止挂失
    2. []中括号两端要有空格
    3. 流程控制语句一次书写完
        if 条件内容
        then
            内容
        fi
6. 通过缩进让代码易读
```



### 变量分类

```shell
* 变量分两类：环境变量（全局变量）和局部变量

* 环境变量可以在命令中设置，但用户退出时这些变量值也会丢失，因此最好在用户家目录下的.bash_profile文件中或全局设置/etc/bashrc，/etc/profile文件或者/etc/profile.d中定义。将环境变量放入profile文件中，每次用户登录时这些变量值都将被初始化。

* 有一些环境变量，比如HOME、PATH、SHELL、UID、USER等，在用户登录之前就已经被/bin/login程序设置好了。通常环境变量定义并保存在用户家目录下的.bash_profile文件中

* PS1环境变量定义用户登录后的提示符如[\u@\h \W]$，\u表示用户名，\h表示主机名，\W表示路径

TMOUT＝3600，此变量表示多久不操作就退出终端
UID＝0，此变量表示用户的UID
USER＝root，此变量表示当前用户的用户名
HISTFILESIZE=50，历史文件能包含的最大行数
HISTSIZE=50，记录在命令行历史文件中的命令行数
HISTFILE=/root/.bash_history，历史记录文件的全路径 
# 上面的环境变量都可以加到/etc/profile文件中，加入后用source或点号加载生效。

*  设置环境变量要在给环境变量赋值后或设置变量时用export命令。带-x选项的declare内置命令也可以完成同样的功能。（注意：输出变量时不要在变量名前加$）
1. export 变量名＝value
2. 变量名＝value --> export 变量名
3. declare -x 变量名＝value
# 可以查看/etc/profile文件中是如何定义变量的
用unset 变量名取消环境变量，变量名前不要加$符号。如果要永久生效，也要写到/etc/profile中。

* 局部变量
变量名＝value
变量名＝'value'
变量名="value"
shell中变量名的要求：一般是字母，数字，下划线组成。字母开头

* 自定义变量建议
1. 纯数字（不带空格），定义方式可以不加引号（单或双）
2. 没特殊情况，字符串一般用双引号定义，特别是多个字符串中间有空格时
3. 变量内容需要原样输出时，要用单引号''

* 变量命名规范
1. 变量命名要统一，使用全部大写字母
2. 避免无含义字符或数字
# 看/etc/init.d/functions脚本中如何定义变量

* 把命令定义为变量，就是将命令的执行结果给变量，用反引号或$()括起命令即可。
tar zcf etc_${cmd}_oldboy.tar.gz /etc
# 这里cmd是自定义的变量，但如果要这样使用，要用大括号括起，因为如果不括起，系统就不能分辨出哪个是变量，可以会找$cmd_oldboy，这会执行错误。
```



### 位置变量

```shell
$0：获取当前执行的shell脚本的文件名
$n：获取当前执行的shell脚本的第n个参数
$*：获取当前shell的所有参数，将所有的命令行参数视为单个字符
$#：获取当前shell命令行中参数的总个数
$!：执行上一个指令的PID
$?：获取执行结果返回值
        执行结果返回值的意义：
        0：正确执行
        2：权限拒绝
        1－125：表示运行失败
        126：找到该命令了，但是无法执行
        127：未找到要运行的命令
        >128：命令被系统强制结束
$$：获取当前shell的进程号（PID）
$_：在此之前执行的命令或脚本的最后一个参数
$@：这个程序的所有参数，如"$1" "$2" "$3"...
=======================================================================================
$*与 $@区别
$*：将所有的命令行所有参数视为单个字符串，等同于“$1$2$3”
$@：将命令行每个参数视为单独的字符串，等同于"$1""$2""$3"。这是将参数传递给其他程序的最佳 方式，因为他会促使所有内嵌在每个参数里的任何空白。
=======================================================================================
例：
sh n.sh "1 2 3"
# 用引号括起的部分表示一个参数。

basename：获取名称，也就是最后的一段
dirname：获取文件所在路径，也就是最后一段前面的内容
```



### 常用内部命令

```shell
echo

exec

eval

export

readonly

read

shift
# 按如下方式重新命名所有的位置参数变量，即$2成为$1，$3成为$2...在程序中每使用一次shift语句，都使所有的位置参数依次向左移动一个位置，并使位置参数$#减1，直到减到0为止。可以查看ssh-copy-id脚本是如何使用shift的

wait

exit

点
```



### 字符串操作

```shell
* 判断读取字符串的值

${var}：变量var的值, 与$var相同

${var-DEFAULT}：如果var没有被声明, 那么就以$DEFAULT作为其值 *
${var:-DEFAULT}：如果var没有被声明, 或者其值为空, 那么就以$DEFAULT作为其值 *
例
[root@template sh]# echo ${bbb-'ok'}
ok
[root@template sh]# echo $bbb

# bbb没有被声明过
${var=DEFAULT}：如果var没有被声明, 那么就以$DEFAULT作为其值 *
${var:=DEFAULT}：如果var没有被声明, 或者其值为空, 那么就以$DEFAULT作为其值 *
例
[root@template sh]# echo ${abc='ok'}
ok
[root@template sh]# echo $abc
ok
${var+OTHER}：如果var声明了, 那么其值就是$OTHER, 否则就为null字符串
${var:+OTHER}：如果var被设置了, 那么其值就是$OTHER, 否则就为null字符串
 	 
${var?ERR_MSG}：如果var没被声明, 那么就打印$ERR_MSG *
${var:?ERR_MSG}：如果var没被设置, 那么就打印$ERR_MSG *
 	 
${!varprefix*}：匹配之前所有以varprefix开头进行声明的变量
${!varprefix@}：匹配之前所有以varprefix开头进行声明的变量
# ${!varprefix*}与${!varprefix@}相似，可以通过变量名前缀字符，搜索已经定义的变量,无论是否为空值。
例
[root@template sh]# var1=11;var2=22;var3=33
[root@template sh]# echo $var1
11
[root@template sh]# echo $var2
22
[root@template sh]# echo $var3
33
[root@template sh]# echo ${!v@}
var1 var2 var3
[root@template sh]# echo ${!v*}
var1 var2 var3

* 字符串操作
	* 截取长度
${#string}：$string的长度

	* 截取字符串
${string:position}：在$string中, 从位置$position开始提取子串
${string:position:length}：在$string中, 从位置$position开始提取长度为$length的子串
 	 
 	 * 删除子串
${string#substring}：从变量$string的开头, 删除最短匹配$substring的子串
${string##substring}：从变量$string的开头, 删除最长匹配$substring的子串
${string%substring}：从变量$string的结尾, 删除最短匹配$substring的子串
${string%%substring}：从变量$string的结尾, 删除最长匹配$substring的子串
${变量名#substring正则表达式}：从字符串开头开始配备substring，删除匹配上的表达式。
${变量名%substring正则表达式}：从字符串结尾开始配备substring，删除匹配上的表达式。
# ${test##*/},${test%/*} 分别是得到文件名，或者目录地址最简单方法。 	 

 	 * 字符串替换
${string/substring/replacement}：使用$replacement, 来代替第一个匹配的$substring
${string//substring/replacement}：使用$replacement, 代替所有匹配的$substring
${string/#substring/replacement}：如果$string的前缀匹配$substring, 那么就用$replacement来代替匹配到的$substring
${string/%substring/replacement}：如果$string的后缀匹配$substring, 那么就用$replacement来代替匹配到的$substring
# "* $substring" 可以是一个正则表达式。
# ${变量/查找/替换值} 一个“/”表示替换第一个，”//”表示替换所有,当查找中出现了：”/”请加转义符”\/”表示。
例
[root@template sh]# num=oldboy5343
[root@template sh]# echo "${num//[0-9]/}" 
oldboy
# 这是使用空来代替oldboy5343中的所有数字，所以取的值只有字母
[root@template sh]# echo "${num//[0-9]/a}"
oldboyaaaa
```



### 变量的数值计算

```shell
* (())用法：此方法很常用，且效率高。执行简单的整数运算，只需将特定的算术表达式用"$((算术运算表达式))"。shell的算术运算符号都置于"$((算术运算表达式))"的语法中。这一语法如同双引号功能，除了内嵌双引号无需转义。
=======================================================================================
运算符
++  --：增加及减少，可前置也可放在结尾。放在开头表示先自增或自减再赋值，放在结尾表示先赋值再自增或自减。变量话前，先输出变量值，变量在后，就是先运算后输出变量的值。
+ - ! ~	：一元的正号与负号；逻辑与位的取反
* / %：乘法、除法、与取余
+ -	：加法、减法
< <= > >=：比较符号
== !=：判断相等与不相等
<< >>：向左位移、向右位移
&：位的AND
^：位的异或
｜：位的或
&&：逻辑的AND
||：逻辑的OR
?：条件表达式
= += -= *= /= %= &= ^=
<<=  >>=  \=：赋值运算符
=======================================================================================
例
[root@template sh]# echo $((3>2))
1
# 判断，如果是真就输出1，假输出0
# 括号两边有几个空格不敏感，也可以没有
[root@template sh]# echo $((3>8))
0
[root@template sh]# ((a=1+2**3-4%3))
# **是幂，表示几次方
[root@template sh]# echo $a
8
[root@template sh]# b=$((1+2**3-4%3))
[root@template sh]# echo $b
8
[root@template sh]# echo $((1+2**3-4%3))
8
[root@template sh]# echo $((a+=1))
9
# a++表示先赋值再自增1、++a表示先自增1再赋值、a--与--a同理
[root@template sh]# echo $((100*(100+1)/2))
5050
[root@template sh]# echo $((1000*(1000+1)/2))
500500
# 从1加到100的计算公式是n*(n+1)/2，只要从1开始，间隔为1的相加计算都可以用此公式
[root@template sh]# echo $((1.1+1))
-bash: 1.1+1: syntax error: invalid arithmetic operator (error token is ".1+1")
# 双括号中只能使用整数，不能使用小数

例：使用传参的方式对两个变量进行计算
[root@template sh]# vim test2.sh
echo "a-b=$(($a-$b))"
#!/bin/bash
#
a=$1
b=$2
echo "a-b=$(($a-$b))"
echo "a+b=$(($a+$b))"
echo "a*b=$(($a*$b))"
echo "a/b=$(($a/$b))"
echo "a**b=$(($a**$b))"
echo "a%b=$(($a%$b))"
[root@template sh]# chmod +x test2.sh 
[root@template sh]# bash test2.sh 5 2
a-b=3
a+b=7
a*b=10
a/b=2
a**b=25
a%b=1

* []的用法，$[算术运算表达式]，与$((算术运算表达式))相同

* let命令的用法
格式：
	let 赋值表达式
	let i=$[$i+1]
	# 这里不加let也可以，因为有中括号了
	let i++
	let i+=1
	
例
[root@template sh]# i=2
[root@template sh]# let i=i+9
[root@template sh]# echo $i
11
# let i=i+8等同于((i=i+8))，但双括号效率更高

例：利用let计数监控web服务状态
[root@template sh]# vim web.sh 
ServerMonitor() {
   timeout=10
   fails=0
   success=0
   while true;do
        /usr/bin/wget --timeout=$timeout --tries=1 http://192.168.1.24 -q -O /de
v/null
        if [ $? -ne 0 ];then
           let fails+=1
           success=0
        else
           fail=0
           let success=1
        fi
        if [ $success -eq 1 ];then
           exit 0
        fi
        if [ $fails -ge 2 ];then
           Critical="web应用服务故障"
           echo $Critical 
        fi
        sleep 10
done
}
ServerMonitor
# 探测主页，之后判断，如果返回值不是0，fails变量就自增1，否则success变量就等于1。再判断success变量是否等于1,如果等于1，如果是，就正常退出，返回0。再判断fails变量是否大于等于2,如果是就定义一个变量Critical，并显示变量值。最后，每10秒检查一次。

* expr命令用法
# expr命令一般用于整数值，但也可用于字符串，用来求表达式变量的值，同时expr也是一个手工命令行计算器。
语法：
	expr Expression
例
[root@template sh]# expr 2 + 2
4
# 运算符两侧必须有空格
[root@template sh]# expr 2 - 2
0
[root@template sh]# expr 2 \* 2
4
# 乘号要转义
[root@template sh]# expr 2 / 2 
1
[root@template sh]# expr 3 % 2
1
[root@template sh]# i=0
[root@template sh]# i=`expr $i + 1`
[root@template sh]# echo $i
1
# expr在循环中可用于增量计算。首先，循环初始化为0，然后循环值加1，反引号的用法为命令替代。最其本的一种是从(expr)命令接受输出并将之放入循环变量
[root@template sh]# expr $[2+3]
5
# expr如果加上$[]后，运算符两侧就不用空格了。运算符两侧必须为整数

例：ssh-copy-id脚本中使用expr命令
if expr "$1" : ".*\.pub";then
# 冒号两侧一样要有空格
# 配置结果可能为expr id_dsa.pub:".*\.pub"，匹配*.pub格式的文件如果是则为真。如：
[root@template sh]# expr ~/.ssh/id_rsa.pub : ".*\.pub"
21
# 如果为真就会打印出字符数，假就显示0
[root@template sh]# expr ~/.ssh/id_rsa.pub : ".*\.pub" && echo 1||echo 0
21
1
[root@template sh]# expr ~/.ssh/id_rsa.p : ".*\.pub" && echo 1||echo 0  
0
0
# 判断文件或字符串的扩展名

例：判断变量是否为整数
[root@template sh]# vim expr.sh
#!/bin/bash
#
read -p "Pls input: " a
expr $a + 0 &> /dev/null
[ $? -eq 0 ] && echo int || echo chars

例：计算字符串的长度
[root@template sh]# chars=`seq -s " " 100`      
# -s选项表示指定分隔符，上面是以空格为分隔符。默认是回车。
[root@template sh]# echo ${#chars}              
291
[root@template sh]# echo $(expr length "$chars")
291

* $[]的用法与(())一样，效果也一样
[root@template sh]# echo $((2-2))
0
[root@template sh]# echo $[2-2]
0
```



### read命令

```shell
可以使用read命令从标准输入获得参数
语法：
	read [参数] [变量名]
常用选项：
	-p prompt：设置提示信息
	-t timeout：设置输入等待时间，单位默认为秒
例
[root@template sh]# read -p "pls input two number: " a b
pls input two number: 1 2   
或
[root@template sh]# echo -n "pls input two number: ";read a b
pls input two number: 4 3
[root@template sh]# echo $a
4
[root@template sh]# echo $b
3
# 这两种方式都可以使用read获得参数

例
[root@template sh]# vim read.sh 
#!/bin/bash
#
read -t 10 -p "Pls input two number: " a b
echo "a-b=$(($a-$b))"
echo "a+b=$(($a+$b))"
echo "a*b=$(($a*$b))"
echo "a/b=$(($a/$b))"
echo "a**b=$(($a**$b))"
echo "a%b=$(($a%$b))"

[root@template sh]# vim read1.sh 
#!/bin/bash
#
echo -n "Pls input two number"
read a b
echo "a-b=$(($a-$b))"
echo "a+b=$(($a+$b))"
echo "a*b=$(($a*$b))"
echo "a/b=$(($a/$b))"
echo "a**b=$(($a**$b))"
echo "a%b=$(($a%$b))"
```



### 条件测试

```shell
* 测试语句
条件测试语法
1. test <测试表达式>
2. [<测试表达式>]
3. [[<测试表达式>]]
# 格式1和格式2是一样的，只是写法不同。格式3为扩展的test命令。在[[]]中可以使用通配符进行模式匹配。&&、||、>、<等操作符，但不能用于[]中。对整数进行关系运算，也可以使用shell的算术运算符(())

* 文件测试操作符
-f 文件：若文件存在且为普通文件则为真
-d 文件：若文件存在且为目录则为真
-s 文件：若文件存在且不为空（文件大小非0）则为真
-e 文件：若文件存在则为真，要与-f区别，-f只判断是否为普通文件
-r 文件：若文件可读则为真
-w 文件：若文件可写则为真
-x 文件：若文件可执行则为真
-L 文件：若文件存在且为链接文件则为真
f1 -nt f2：若文件f1比f2新则为真
f1 -ot f2：若文件f1比f2旧则为真

例：test
[root@template sh]# test -f file && echo true||echo false  
false
[root@template sh]# test -f expr.sh && echo true||echo false    
true
[root@template sh]# test ! -f file && echo true||echo false
true
# 使用!号可以取反

例：[]
[root@template sh]# [ -f file ] && echo true || echo false
false
[root@template sh]# [ ! -f file ] && echo true || echo false
true

例：[[]]
[root@template sh]# [[ -f file ]] && echo true || echo false  
false
[root@template sh]# [[ ! -f file ]] && echo true || echo false
true
[root@template sh]# [[ -f file && -f expr.sh ]] && echo true || echo false
false
[root@template sh]# [[ ! -f file && -f expr.sh ]] && echo true || echo false
true
```



### 字符串及整数操作符

```shell
字符串测试操作符的作用：比较两个字符串是否相同、字符串长度是否为零，字符串是否为NULL（bash区分零长度字符串与空字符串）等。
=比较两个字符串是相同，与==等价，如if[ "$a" = "$b" ]，其中$a这样的变量最好用""括起来，因为如果中间有空格，*等符号就可能出错了，也可以用[ "${a}" = "${b}" ]这样的方法。!=比较两个字符串是否相同，不同则为真
* 字符串测试操作符
-z "字符串"：若串长度为0则为真
-n "字符串"：若串长度不为0则为真
"串1"="串2"：若串1等于串2则为真，也可以使用==代替=
"串1"!="串2"：若串1不等于串2则为真
```

整数二元比较操作符

| 在[]中使用的比较符 | 在(())和[[]]中使用的比较符 | 说明          |
| ------------------ | -------------------------- | ------------- |
| -eq                | ==                         | equal         |
| -ne                | !=                         | not equal     |
| -gt                | >                          | greater than  |
| -ge                | >=                         | greater equal |
| -lt                | <                          | less thean    |
| -le                | <=                         | less equal    |

**在[]中也可以使用>、<、=号，但>、<号要转义**



### 逻辑操作符

逻辑连接符

| 在[]中使用的逻辑操作符 | 在[[]]中使用的逻辑操作符 | 说明                     |
| ---------------------- | ------------------------ | :----------------------- |
| -a                     | &&                       | 与，两端都为真，则为真   |
| -o                     | \|\|                     | 或，两端有一端为真则为真 |
| !                      | !                        | 非，相反则为真           |



### 单级与多级菜单

```shell
[root@template ~]# vim menu.sh
#!/bin/bash
#
menu() {
   cat << END
   1. [install lamp]
   2. [install lnmp]
   3. [install nfs]
   4. [install rsync]
   Pls input the num that you want:
END
# 测试中，如果将END改为EOF会报错，内容如下：
# menu.sh: line 14: warning: here-document at line 4 delimited by end-of-file (wanted `EOF')
# menu.sh: line 15: syntax error: unexpected end of file
read a
[ $a -eq 1 ] && {
cat << END
[1. install apache]
[2. install mysql]
[3. install php]
END
}
}
menu
read b
echo "You selected $b"
[root@template ~]# bash menu.sh 
   1. [install lamp]
   2. [install lnmp]
   3. [install nfs]
   4. [install rsync]
   Pls input the num that you want:
1
[1. install apache]
[2. install mysql]
[3. install php]
1
You selected 1
```



### if条件语句

```shell
* if条件单分支
语法：
if [条件]
	then
		指令
fi
或
if [条件];then
	指令
fi
特殊写法：if [ -f "$file" ];then echo 1;fi，相当于：[ -f "$file" ] && echo 1
例
[root@template sh]# vim if.sh 
#!/bin/bash
#
cur_free=`free -m|awk '/buffers\// {print $NF}'`
chars="current memory is $cur_free"
if [ $cur_free -lt 900 ];then
   echo $chars
fi
[root@template sh]# chmod +x if.sh 
[root@template sh]# ./if.sh
current memory is 855

* 双分支、多分支if语句
双分支语法：
if [条件];then
   指令
else
	指令
fi
多分支语法：
if [条件];then
   指令
elif [条件];then
	指令
else
	指令
fi
例
[root@template sh]# vim if1.sh      
#!/bin/bash
#
a=$1
b=$2
if [ $# -ne 2 ];then
   echo "Usage: sh $0 num1 num2"
   exit 1
fi
[ -n "`echo $1|sed 's/[0-9]//g'`" ] && echo "first parameter must num" && exit 1
[ -n "`echo $2|sed 's/[0-9]//g'`" ] && echo "second parameter must num" && exit 1
# 这里是要显示输入的内容，将内容传给sed命令，sed命令将数字部分都替换为空，再对这个显示的值做字符串长度的计算，如果不是0就要提示应该输入数字，不然就退出。
if [ $a -gt $b ];then
   echo "yes,$a > $b"
elif [ $a -eq $b ];then
   echo "yes,$a = $b"
else
   echo "yes,$a < $b"
fi
[root@template sh]# bash if1.sh 99 89
yes,99 > 89
[root@template sh]# bash if1.sh 99 99
yes,99 = 99
[root@template sh]# bash if1.sh 69 99 
yes,69 < 99

例：检查mysql是否启动
[root@template sh]# vim check_db.sh
#!/bin/bash
#
portNum=`netstat -lnt|grep 3306|wc -l`
if [ $portNum -eq 1 ];then
   echo "db is running"
else
   service mysqld start
fi
# 脚本的名称中最好不要包括要查询的服务的名称，如这里就是mysql

例：检查mysql是否启动，更完整 
[root@template sh]# vim check1_db.sh
#!/bin/bash
#
LogPath=/tmp/mysql.log
portNum=`netstat -lnt|grep 3306|wc -l`
mysqlProcessNum=`ps -ef|grep mysqld|grep -v grep|wc -l`
if [ $portNum -eq 1 ] && [ $mysqlProcessNum -eq 2 ];then
   echo "db is running"
else
   /etc/init.d/mysqld start
   sleep 10
   portNum=`netstat -lnt|grep 3306|wc -l`
   mysqlProcessNum=`ps -ef|grep mysqld|grep -v grep|wc -l`
   if [ $portNum -ne 1 ] && [ $mysqlProcessNum -ne 2 ];then
        while true;do
           killall mysqld > /dev/null 2>&1
           [ $? -ne 0 ] && break
           sleep 1
        done
        /etc/init.d/mysqld start >> $LogPath && status="successful" || status="failure"
        mail -s "mysql startup status is $status" root@localost < $LogPath
   fi
fi

例：检查mysql是否启动，利用mysql帐号登录测试

#!/bin/bash
#
LogPath=/tmp/mysql.log
mysql -uroot -p'centos' -S /var/lib/mysql/mysql.sock -e "select version();" >& /dev/null
# 这里的用户名与密码一定要正确，不然也会执行失败，使下面判断mysql为未启动状态。
if [ $? -eq 0 ];then
   echo "db is running"
else
   /etc/init.d/mysqld start > $LogPath
   sleep 10
   mysql -uroot -p'centos' -S /var/lib/mysql/mysql.sock -e "select version();" >& /dev/null
   if [ $? -ne 0 ];then
        while true;do
           killall mysqld > /dev/null 2>&1
           [ $? -ne 0 ] && break
           # 这里只检查killall命令执行是否正确，如果正确就跳出循环。个人认为还应该加上检查进程是否存在更准确
           sleep 1
        done
        /etc/init.d/mysqld start >> $LogPath && status="successful" || status="failure"
        mail -s "mysql startup status is $status" root@localost < $LogPath
   fi
fi

例：检查mysql是否启动的php脚本
<?php
   $link_id=mysql_connect('localhost','root','centos') or mysql_error();
   if ($link_id) {
       echo "mysql successful !";
   } else {
       echo mysql_error();
   }
?>

监控mysql数据库是否异常的多种方法
1. 根据mysql端口号监控mysql(本地)
2. 根据mysql进程监控mysql(本地)。只能本地监控，进程在服务可能不正常，如：负载很高，CPU很高，连接数满了，另外，进程也可以远程监控，如通过ssh key，expect
3. 通过mysql客户端命令及用户帐户连接mysql，然后根据返回命令状态或返回内容确认mysql是否正常（本地和远程连接判断）。必须要有mysql客户端，要有数据库的帐号与密码及连接数据库主机授权。
4. 通过php/java程序url方式监控mysql，此方法最接近用户访问，效果最好。报警的最佳方式不是服务是否开启了，而是网站的用户是否还能正常访问
5. 以上四种方法的综合运用

例：本地监控web服务
[root@template sh]# vim check_web.sh     
#!/bin/bash
#
HttpPortNum=`netstat -tln|grep 80|wc -l`
if [ $HttpPortNum -ge 1 ];then
   echo "web is running"
else
   echo "web is not running"
   /etc/init.d/nginx start
fi

例：远程监控web服务
[root@template sh]# vim check1_web.sh
#!/bin/bash
#
HttpPortNum=`nmap 192.168.1.24 -p 80|grep open|wc -l`
if [ $HttpPortNum -ge 1 ];then
   echo "web is running"
else
   echo "web is not running"
   /etc/init.d/nginx start
fi

例：通过url地址远程监控web服务
[root@template sh]# vim check2_web.sh             
#!/bin/bash
#
wget -T 10 -q --spider http://192.168.1.24 > /dev/null
# -T表示超时时间，-q表示静默模式，--spider表示爬虫
if [ $? -eq 0 ];then
   echo "web is running"
else
   echo "web is not running"
fi

例：通过状态码查看服务是否启动
[root@template sh]# vim check3_web.sh    
#!/bin/bash
#
[ -f /etc/init.d/functions ] && . /etc/init.d/functions
httpCode=`curl -I -s 192.168.1.24|head -1|cut -d" " -f2`
if [ "$httpCode" == "200" ];then
   action "nginx is running" /bin/true
   # action是调用functions函数
else
   action "nginx is not running" /bin/false
   sleep 1
   /etc/init.d/nginx start
   action "nginx is started" /bin/true
fi

例：使用传参的方式查看服务是否启动
[root@template sh]# vim check4_web.sh 
#!/bin/bash
#
if [ $# -ne 2 ];then
   echo "Usage: $0 ip port "
fi
PortNum=`nmap $1 -p $2 |grep open|wc -l`
if [ $PortNum -eq 1 ];then
   echo "$1 $2 is open"
else
   echo "$1 $2 is closed"
fi
```



### case条件语句

```shell
语法
case "字符串变量" in
	值1) 指令 ...
	;;
	值2) 指令 ...
	;;
	*) 指令 ...
	;;
esac

例：
[root@template sh]# vim plus_color.sh 
#!/bin/bash
#
new_chars() {
RED_COLOR='\E[1;31m'
GREEN_COLOR='\E[1;32m'
YELLOW_COLOR='\E[1;33m'
BLUE_COLOR='\E[1;34m'
PINK_COLOR='\E[1;35m'
RES='\E[0m'

if [ $# -ne 2 ];then
   echo "Usage $0 content {red|yellow|blue|green}"
   exit
fi
case "$2" in
   red|RED)
        echo -e "${RED_COLOR}$1${RES}"
   ;;
   yellow|YELLOW)
        echo -e "${YELLOW_COLOR}$1${RES}"
   ;;
   green|GREEN)
        echo -e "${GREEN_COLOR}$1${RES}"
   ;;
   blue|BLUE)
        echo -e "${BLUE_COLOR}$1${RES}"
   ;;
   pink|PINK)
        echo -e "${PINK_COLOR}$1${RES}"
   ;;
   *)
        echo "Usage $0 content {red|yellow|blue|green}"
   ;;
esac
}
new_chars abc red
new_chars abc yellow
new_chars abc green
new_chars abc blue
new_chars abc pink

例：利用case语句启动web服务
[root@template sh]# vim nginx
#!/bin/bash
#
nginx="/etc/init.d/nginx"
. /etc/init.d/functions
case "$1" in
   start)
        $nginx start >& /dev/null
        [ $? -eq 0 ] && action "nginx is started" /bin/true ||\
        action "nginx is started" /bin/false
   ;;
   stop)
        $nginx stop >& /dev/null
        [ $? -eq 0 ] && action "nginx is stoped" /bin/true ||\
        action "nginx is stoped" /bin/false
   ;;
   restart)
        $nginx restart >& /dev/null
        [ $? -eq 0 ] && action "nginx is restarted" /bin/true ||\
        action "nginx is restarted" /bin/false
   ;;
   *)
        echo "Usage: $0 {start|stop|restart}"
        exit
   ;;
esac
```



### while语句

```shell
语法
while 条件;do
	指令
done
# 条件满足就退出

while读文件方式
方式一
exec < FILE
sum=0
while read line
do
	cmd
done

方式二
cat ${FILE_PATH} | while read line
do
	cmd
done

方式三
while read line
do
	cmd
done < FILE

例
[root@template sh]# vim while1.sh
#!/bin/bash
#
while true;do
   uptime
   sleep 2
done
# while true表示永远为真，是死循环
[root@template sh]# vim while2.sh
#!/bin/bash
#
while [ 1 ];do
   uptime
   usleep 1000000
done
# 这里的条件为[ 1 ]，也是死循环的意思。usllep是使用微秒为单位

=======================================================================================
ctrl+z：暂停执行当前脚本或任务
bg：把当前脚本或任务放到后台执行
fg：把当前脚本或任务拿到前台执行，如果有多个任务，可以fg加任务编号调出，如fg 1
jobs：查看执行的脚本或任务
=======================================================================================

例
[root@template sh]# vim while3.sh     
#!/bin/bash
#
i=1
sum=0
while ((i <= 100));do
   ((sum=sum+i))
   ((i++))
done
echo $sum

例：循环竖向打印10-1，使用双小括号
[root@template sh]# vim while4.sh
#!/bin/bash
#
i=10
while ((i>0));do
   echo $i
   ((i--))
done

例：循环竖向打印10-1，使用双中括号
[root@template sh]# vim while5.sh
#!/bin/bash
#
i=10
while [[ $i>0 ]];do
   echo $i
   ((i--))
done
# 使用双中括号时必须使用$i，而不能用i

例：循环竖向打印10-1，使用单中括号
[root@template sh]# vim while6.sh
#!/bin/bash
#
i=10
while [ $i -gt 0 ];do
   echo $i
   ((i--))
   # 这里也可以写为let i--或i=$[$i-1]，中括号中不能写成i--这样的形式。
done
# 使用单中括号时，while的比较运算符要使用-gt的形式，或使用\>的形式，也就是使用大于号时要转义

例：
[root@template sh]# vim while7.sh
#!/bin/bash
#
read -t 20 -p "pls input the num: " i
while ((--i));do
# 当i为0时就会退出循环
   echo $i
done

例：测试负载均衡是否平均分配到了节点
[root@template sh]# vim while8.sh
#!/bin/bash
#
while true;do
   curl -I -s http://www.test.com|head -1
   sleep 10
done

例：数组方法
[root@template sh]# vim check_url.sh
#!/bin/bash
#
. /etc/init.d/functions
url_list=(
http://www.baidu.com
http://www.sina.com
http://www.sohu.com
http://192.168.1.24
)

wait_time() {
   echo -n "3秒后，执行此操作"
   for ((i=0;i<3;i++));do
        echo -n ".";sleep 1
   done
   echo
}

check_url() {
   wait_time
   echo 'check url...'
   for ((i=0;i<`echo ${#url_list[*]}`;i++));do
        judge=($(curl -I -s ${url_list[$i]}|head -1|tr "\r" "\n"))
# 这里还是将结果当作一个数组传给judge变量，下面对数组的各值做判断。       
        if [[ "${judge[1]}" == '200' && "${judge[2]}" == 'OK' ]];then
        # 这里的问题是只以200状态码与OK为正常，如果是301也是正常的，但这里就会判断为不正常。
           action "${url_list[$i]}" /bin/true
        else
           action "${url_list[$i]}" /bin/false
        fi
   done
}
check_url
=======================================================================================
curl命令
-I/--head：只显示响应报文首部信息
-s/--silent：静音模式。不输出任何东西
-o/--output：把输出写到一个文件中，这是保存网页的方法
-w/--write-out [format]：如 -w %{http_code}可以取得网页的状态码。
例
curl -o /dev/null -s -w %{http_code} www.linux.com
=======================================================================================

例：读日志文件，计算其中所有行的日志各元素的访问字节数的总和
[root@template sh]# vim while9.sh    
#!/bin/bash
#
sum=0
while read line;do
   size=`echo $line|awk '{print $10}'`
   # 以空格为分隔符，日志的第10段是访问数据的大小
   [ "$size" == "-" ] && continue
   ((sum=sum+$size))
done < /var/log/nginx/access.log
echo $sum
```



### until语句

```shell
语法
until 条件;do
	指令
done
# 条件不满足就退出，until应用场合不多见
```



### for循环

```shell
语法
for 变量名 in 变量取值列表
do
	指令
done
# 在此结构中"in 变量取值列表"可省略，省略时相当于in "$@"，使用for i 就相当于使用for i in "$@" 

for ((exp1;exp2;exp3))
do
	指令
done

例
[root@template sh]# vim for1.sh
#!/bin/bash
#
size=`awk '{print $10}' $1`
sum=0
for num in $size;do
   [ -n "$num" -a "$num" = "${num//[^0-9]/}" ] || continue
   # 这里要判断一下，$sum是否不为空，再判断，替换了$num中开头的数字后，$num是否等于$num，如果等于，说明这里有字母，就退出本轮循环。
   ((sum=$num+sum))
done
echo "Log size: $sum bytes=`echo $(($sum/1024))`KB"
[root@template sh]# ./for1.sh /var/log/nginx/access.log 
Log size: 139959 bytes=136KB

另一种方法
[root@template sh]# echo `awk '{print $10}' /var/log/nginx/access.log|grep -v -|tr "\n" "+"|sed 's/3698+$/3698/'`|bc
139959

例：批量改名
[root@template sh]# vim for2.sh
#!/bin/bash
#
for filename in `ls *.jpg`;do
   mv $filename `echo $filename|cut -d . -f1`.git
done

例：乘法表
[root@template sh]# vim for3.sh
#!/bin/bash
#
for i in `seq 9`;do
   for j in `seq 9`;do
        [ $j -le $i ] && echo -en "$j * $i = `expr $i \* $j` \c"
        # -n表示不换行输出，-e表示激活转义字符，\c表示最后不加上换行符号
   done
   echo " "
done

例：访问十次页面
[root@template sh]# vim for4.sh 
#!/bin/bash
#
for ((i=0;i<=10;i++));do
   curl http://192.168.1.24/index1.html
done
```



### 取随机数的方法

```shell
方法一
[root@template sh]# echo $RANDOM
9066

方法二
[root@template sh]# openssl rand -base64 8
sT9rgkzhDKQ=
[root@template sh]# openssl rand -base64 10
dK5aymAlYRlJxA==

方法三
[root@template sh]# date +%s%N
1547475685362659766
# 通过时间获取随机数

方法四
[root@template sh]# head /dev/urandom | cksum 
3543804650 1922
# /dev/random设备，存储着系统当前运行的环境的实时数据。它可以看作是系统某个时候，唯一值数据，因此可以用作随机数元数据。/dev/urandom这个设备数据与random里面一样，只是，它是非阻塞的随机数发生器，读取操作不会产生阻塞。

方法五
[root@template sh]# cat /proc/sys/kernel/random/uuid 
9794b963-3311-483e-aa9b-ace2df623d07

方法六
[root@template sh]# yum install -y expect
[root@template sh]# mkpasswd -l 8
E>jC45ut

[root@template sh]# cat /proc/sys/kernel/random/uuid | md5sum | cut -c 1-9
c1baddd2e
# 上面的命令得到随机数后都通过md5sum再计算一次得到一个数字，到通过cut命令取指定长度的数字。cut的-c选项就是仅显示行中指定范围的字符
```



### break、continue、exit对比

| 命令       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| break n    | n表示跳出循环的层数，如果省略n表示跳出整个循环               |
| continue n | n表示退出到第n层继续循环，如果省略n表示跳过本次循环，忽略本次循环的接任代码，进入循环的下一次循环 |
| exit n     | 退出当前shell程序，终止整个shell脚本，并返回n。n也可以省略。 |
| return     | 与exit相似，在函数中使用，用于跳出函数                       |



### shell函数

```shell
语法
简单的语法：
函数名() {
    指令
    return n
}
规范的语法：
function 函数名() {
    指令
    return n
}
调用函数：
1. 直接执行函数名即可。注意，不需要带小括号
例：函数名
2. 带参数的函数执行方法：
例：函数名 参数1 参数2
# 在函数体中的位置参数($1、$2、$3、$#、$*、$?、$@)都可以是函数
# 父脚本的参数则临时地被函数参数所掩盖或隐藏
# $0比较特殊，它仍然是父脚本的名称
# 函数一定要在调用之前定义并加载

例
[root@template sh]# vim func1.sh
#!/bin/bash
#
if [ $# -ne 1 ];then
   echo "error" && exit 1
fi

Check_Url() {
   curl -I -s $1|head -1 && return 0||return 1
}
Check_Url $1
# Check_Url后的$1是命令行的第一个参数，curl中的$1是函数的第一个参数。这两个$1的作用是不一样的

例：生产环境批量检查web服务是否正常并且发送相关邮件
[root@template sh]# vim check_service.sh
#!/bin/bash
#
RETVAL=0
FAILCOUNT=0
SCRIPTS_PATH="/root/sh"
MAIL_GROUP="root@localhost"
LOG_FILE="/tmp/web_check.log"
GetUrlStatus() {
   for ((i=1;i<=3;i++));do
        wget -T 10 --tries=1 --spider http://${1} > /dev/null 2>&1
        [ $? -ne 0 ] && let FAILCOUNT+=1
   done
   # 访问三次页面，如果返回值不是0，变量FAILCOUNT就自增1。
   if [ $FAILCOUNT -gt 1 ];then
        RETVAL=1
        NowTime=`date +"%m-%d %H:%M:%S"`
        SC="http://${1} service is error,${NowTime}."
        echo "send to : $MAIL_USER, Title: $SUBJECT_CONTENT" > $LOG_FILE
        for MAIL_USER in $MAIL_GROUP;do
           mail -s "$SC" $MAIL_USER < $LOG_FILE
        done
   else
        RETVAL=0
   fi
   return $RETVAL
   # 判断变量FAILCOUNT是否大于1，如果大于1,就发邮件，并记入日志文件，并将变量RETVAL的值改为1，否则RETVAL的值是0，RETVAL的值就是返回码，退出函数。
}
[ ! -d "$SCRIPTS_PATH" ] && mkdir -p $SCRIPTS_PATH
[ ! -f "$SCRIPTS_PATH"/domain.list ] && {
cat > $SCRIPTS_PATH/domain.list << END
www.baidu.com
www.sohu.com
192.168.1.24
END
}
# 判断变量SCRIPTS_PATH指定的目录是否存在，不存在就创建，再判断变量SCRIPTS_PATH中的domain.list文件是否存在，不存在就创建，其中是网页地址。
for URL in `cat $SCRIPTS_PATH/domain.list`;do
   echo -n "checking $URL: "
   GetUrlStatus $URL && echo ok || echo no
done
# 循环检查domain.list文件中的网址，将变量URL的值给GetUrlStatus函数，在GetUrlStatus函数中由$1接收。如果返回值是0就显示ok，否则显示no
[root@template sh]# bash check_service.sh   
checking www.baidu.com: ok
checking www.sohu.com: ok
checking 192.168.1.24: no
You have new mail in /var/spool/mail/root
```



### 优化linux系统

```shell
1. 安装系统时精简安装包，最小化安装
2. 配置国内高速yum源
3. 禁用开机不需要启动的服务
4. 优化系统内核参数，/etc/sysctl.conf
5. 增加系统文件描述符、堆栈等配置
6. 有外网IP的机器要开启配置防火墙，仅对外开启需要提供服务的端口，配置或关闭selinux
7. 清除无用的默认系统帐户或组（非必须）
8. 锁定敏感文件，如/etc/passwd（非必须）
9. 配置服务器和互联网时间同步
10. 配置sudo对普通用户权限精细控制
11. 把以上10点写成一键优化脚本
```



### 数组

```shell
方法一
array=(value1 value2 value3 ...)
echo ${#array[@]}
echo ${#array[*]}
echo ${#array[0]}
# 计算数组中的共有几个值
echo ${array[*]}
# 列出数组中的所有值
echo ${array[0]}
# 列出数组中的某个值，数组的下标从0开始
array[3]=4
# 给某个数组下标赋值
array[0]=abc
# 给已有的数组下标修改值
unset array
# 删除整个数组
unset array[0]
# 删除数组中某个下标的值
echo ${array[@]:1:3}
# 从第几个元素开始截取，截取几个
array=(${array[@]/5/6})
# 将第5个元素的值改为6
echo ${array[@]#o}
# 从左开始最短匹配删除
echo ${array[@]#fo}
echo ${array[@]%t*e}
echo ${array[@]%%t*e}
# 数组也是变量，因此也适合于变量的子串处理的功能应用。

方法二
array=([1]=one [2]=two [3]=three)
# 定义下标与值

方法三
array[0]=a array[1]=b array[2]=c 

方法四
declare -a array

方法五
array=($(ls))
```



### trap信号

```shell
trap使用信号的方法
trap命令用于指定在接收到信号后将要采取的行动。trap命令的一种常见用途是在脚本程序被中断时完成清理工作。历史上，shell总是用数字来代表信号，而新的脚本程序应该使用的名字，它们保存在用#include命令包含进来的signal.h头文件中，在使用信号名时需要省略SIG前缀。你可以在命令提示符下输入命令trap -l来查看信号编号及其关联的名称。
脚本程序通常是以从上到下的顺序解释执行的，所以必须在你想保护的那部分代码以前指定trap命令。
如果要重置桔某个信号的处理条件到其默认值，只需简单的将command设置为-。如果要忽略某个信号，就把command设置为空字符串''，一个不带参数的trap命令将列出当前设置的信号及其行动的清单。exit命令后传输就是就是这个信号的代码

例
[root@template ~]# trap "" 2
# 屏蔽ctrl+c信号 
[root@template ~]# trap ":" 2
# 恢复ctrl+c信号 
[root@template ~]# trap "echo -n 'you are typing ctrl+c'" 2 
[root@template ~]# ^Cyou are typing ctrl+c
# 设置一个提示，当输入指定信号时就会提示
[root@template ~]# trap "" HUP INT QUIT TSTP TERM
# 屏蔽多个信号
[root@template ~]# trap ":" HUP INT QUIT TSTP TERM
# 恢复多个信号 

例
[root@template sh]# vim showdate.sh
#!/bin/bash
#
trap 'echo “you go…”;exit 1' INT
while :; do
    date
    sleep 2
done
# 捕捉到信號，顯示命令。要想用ctrl+c退出，要在echo you go后加&& exit 1

例
[root@template sh]# vim ping.sh 
#!/bin/sh
#
NET=192.168.1
FILE=`mktemp /tmp/file.XXXXX`
clearup() {
   echo “quit…”
   rm -f $FILE
   exit 1
}
trap 'clearup' INT
# 测试发现，只要有退出码，就可以使用ctrl+c退出脚本。如上面的退出码是exit 1。如果注释了上面的函数，再使用ctrl+c退出时只能退出当前ping的命令，脚本会继续ping下一个地址。
for I in {200..254}; do
   if ping -c 1 -W 1 $NET.$I &> /dev/null; then
      echo “$NET.$I is up .” | tee >> $FILE
   else
      echo “$NET.$I is down”
   fi
done
```

