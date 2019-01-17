---
title: awk基础
date: 2018-10-16 13:54:49
tags: awk基础
categories: 基础
---

#### 语法

```shell
# 我们在linux上所使用的awk其实是gawk，也就是GNU awk，简称为gawk。awk其实是一门编程语言，它支持条件判断、数组、循环等功能。grep：更适合单纯的查找或匹配文本、sed：更适合编辑匹配到的文本、awk：更适合格式化文本，对文本进行较复杂格式处理

[root@bogon ~]# ll /usr/bin/awk 
lrwxrwxrwx. 1 root root 4 Oct  8 14:20 /usr/bin/awk -> gawk

* 语法
awk [options] 'program' file1 , file2 , ...
# 对于上述语法中的program来说，又可以细分成pattern（模式）和action（动作），也就是说，awk的基本语法如下
awk [options] 'Pattern{Action}' file
-F：用于指定输入分隔符。
-v：用于设置变量的值。

* 常用内置变量：
    FS：输入字段分隔符， 默认为空白字符
    OFS：输出字段分隔符， 默认为空白字符
    RS：输入记录分隔符(输入换行符)， 指定输入时的换行符
    ORS：输出记录分隔符（输出换行符），输出时用指定符号代替换行符
    NF：number of Field，当前行的字段的个数(即当前行被分割成了几列)，字段数量
    NR：行号，当前处理的文本行的行号。
    FNR：各文件分别计数的行号
    FILENAME：当前文件名
    ARGC：命令行参数的个数
    ARGV：数组，保存的是命令行所给定的各参数
#$0 表示显示整行 ，$NF表示当前行分割后的最后一列（$0和$NF均为内置变量）。$NF 和 NF 要表达的意思是不一样的，对于awk来说，$NF表示最后一个字段，NF表示当前行被分隔符切开以后，一共有几个字段。假如一行文本被空格分成了7段，那么NF的值就是7，$NF的值就是$7,  而$7表示当前行的第7个字段，也就是最后一列，那么每行的倒数第二列可以写为$(NF-1)。
```

##### 测试

```shell
* 打印全部
[root@bogon ~]# echo ddd > testd
[root@bogon ~]# awk '{print}' testd 
ddd
# 将testd文件中的内容打印了出来
[root@bogon ~]# awk '{print $0}' test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
# 上面两种写法都可以打印整行

* 打印某列
[root@bogon ~]# df -h | awk '{print $2}'
Size
30G
234M
245M
245M
245M
1014M
976M
49M
# 输出df的信息的第2列，$2表示将当前行按照分隔符分割后的第2列，不指定分隔符时，默认使用空格作为分隔符
# awk是逐行处理的，处理完当前行，再处理下一行。awk默认以"换行符"为标记，识别每一行，每次遇到"回车换行"，就认为是当前行的结束，新的一行的开始，awk会按照用户指定的分割符去分割当前行

* 打印多个列
[root@bogon ~]# cat test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
[root@bogon ~]# awk '{print $2,$5,$6}' test
345 lkj;l 
klj adeills adsfei
# 第一行并没有第六列，所以并没有输出任何文本，而第二行有第六列，所以输出了。

* 添加自己的字段
[root@bogon ~]# awk '{print $1,$2,"string"}' test
abc 345 string
123 klj string
[root@bogon ~]# awk  '{print $1,$2,423}' test
abc 345 423
123 klj 423
[root@bogon ~]# awk '{print "diyilie:" $1,"diyilie:" $2}' test
diyilie:abc diyilie:345
diyilie:123 diyilie:klj
[root@bogon ~]# awk '{print "diyilie:"$1,"534","diyilie:"$2}' test
diyilie:abc 534 diyilie:345
diyilie:123 534 diyilie:klj
[root@bogon ~]# cat test | awk '{print $1}'
abc
123
[root@bogon ~]# cat test | awk '{print "$1"}'
$1
$1
# 变量不能加引号
[root@bogon ~]# cat test | awk '{print "firstF:"$1}'
firstF:abc
firstF:123
[root@bogon ~]# cat test | awk '{print "firstF:$1"}'
firstF:$1
firstF:$1
# $1这种内置变量的外侧不能加入双引号，否则$1会被当做文本输出
```

#### 特殊模式

##### BEGIN

```shell
# BEGIN 模式指定了处理文本之前需要执行的操作

[root@bogon ~]# awk 'BEGIN{print "aaa","bbb"}' test
aaa bbb
# 在开始处理test文件中的文本之前，先执行打印动作，输出的内容为"aaa","bbb".
[root@bogon ~]# awk 'BEGIN{print "aaa","bbb"}'
aaa bbb
# 因为不打算处理文本文件，所以也可以不指定文本文件，只进行一个处理前的打印动作。
[root@bogon ~]# awk 'BEGIN{print "aaa","bbb"}{print $1,$2}' test
aaa bbb
abc 345
123 klj
# 可以先进行处理前打印，再处理文本文件，但两次打印要分开写
```



##### END

```shell
# END 模式指定了处理完所有行之后所需要执行的操作

[root@bogon ~]# awk 'BEGIN{print "aaa","bbb"}{print $1,$2}END{print "ccc","ddd"}' test
aaa bbb
abc 345
123 klj
ccc ddd
# 结合BEGIN模式和END模式一起使用
```

#### 分隔符

* awk的分隔符还分为两种，"输入分隔符" 和 "输出分隔符"

* 输入分隔符，英文原文为field separator，此处简称为FS。awk默认以空白字符为分隔符对每一行进行分割。

* 输出分割符，英文原文为output field separator，此处简称为OFS。awk默认的输出分割符也是空格。

##### 输入分隔符

```shell
[root@bogon ~]# cat test1
aaa#dfa#123#jkl;
aiew#adkf#alkdjf#asdjfj

[root@test ~]# awk -F# '{print $1,$2}' test1
aaa dfa
aiew adkf
# 指定默认分隔符为#号，对文本进行分隔

[root@test ~]# awk -v FS=# '{print $1,$2}' test1   
aaa dfa
aiew adkf
# 还能够通过设置内部变量的方式，指定awk的输入分隔符，awk内置变量FS可以用于指定输入分隔符，但是在使用变量时，需要使用-v选项，用于指定对应的变量
```

##### 输出分隔符

```shell
# 当我们要对处理完的文本进行输出的时候，以什么文本或符号作为分隔符。

[root@bogon ~]# awk '{print $1,$2}' test
abc 345
123 klj
[root@bogon ~]# awk -v OFS="+++" '{print $1,$2}' test
abc+++345
123+++klj
[root@bogon ~]# awk -v OFS='+++' '{print $1,$2}' test
abc+++345
123+++klj
# 加号两侧可以是单引号或双引号

[root@bogon ~]# awk -v FS='#' -v OFS='---' '{print $1,$2}' test1
aaa---dfa
aiew---adkf
# 同时指定输入分隔符和输出分割符

[root@bogon ~]# awk '{print $1,$2}' test
abc 345
123 klj
# 分开显示要使用逗号分隔两个变量
[root@bogon ~]# awk '{print $1 $2}' test
abc345
123klj
[root@bogon ~]# awk '{print $1$2}' test
abc345
123klj
# 输出不使用分隔符，打印在一起
```

#### 变量

* "变量"又分为"内置变量" 和 "自定义变量" , "输入分隔符FS"和"输出分隔符OFS"都属于内置变量。内置变量就是awk预定义好的、内置在awk内部的变量，而自定义变量就是用户定义的变量。

##### 内置变量NR

```shell
# 在awk中，只有在引用$0、$1等内置变量的值的时候才会用到"$"，引用其他变量时，不管是内置变量，还是自定义变量，都不使用"$"，而是直接使用变量名。

[root@bogon ~]# cat test
abc 345 ssd asdf lkj;l
123 klj adf daff adeills adsfei
[root@bogon ~]# awk '{print NR,NF}' test
1 5
2 6
# 打印每一行的行号以及每一行对应的列的数量。内置变量NR表示每一行的行号，内置变量NF表示每一行中一共有几列
[root@bogon ~]# awk '{print NR,$0}' test
1 abc 345 ssd asdf lkj;l
2 123 klj adf daff adeills adsfei
# 先打印出行号，再打印出整行的内容
```

##### 内置变量FNR

```shell
[root@bogon ~]# awk '{print NR,$0}' test test1
1 abc 345 ssd asdf lkj;l
2 123 klj adf daff adeills adsfei
3 aaa#dfa#123#jkl;
4 aiew#adkf#alkdjf#asdjfj
# awk处理多个文件的时候，如果使用NR显示行号，那么，多个文件的所有行会按照顺序进行排序。

[root@bogon ~]# awk '{print FNR,$0}' test test1
1 abc 345 ssd asdf lkj;l
2 123 klj adf daff adeills adsfei
1 aaa#dfa#123#jkl;
2 aiew#adkf#alkdjf#asdjfj
# FNR变量可以在处理多个文件时分开显示行号。
```

##### 内置变量RS

```shell
[root@bogon ~]# awk '{print NR,$0}' test
1 abc 345 ssd asdf lkj;l
2 123 klj adf daff adeills adsfei
[root@bogon ~]# awk -v RS=" " '{print NR,$0}' test
1 abc
2 345
3 ssd
4 asdf
5 lkj;l
123
6 klj
7 adf
8 daff
9 adeills
10 adsfei
# 指定空格为换行符并打印，第5行是因为test文本中的第一行行尾和第二行开头之间没有空格，只有回车，所以打印成这个样子。
```

##### 内置变量ORS

```shell
[root@bogon ~]# awk  -v ORS='+++' '{print NR,$0}' test
1 abc 345 ssd asdf lkj;l+++2 123 klj adf daff adeills adsfei+++[root@bogon ~]#
# 指定输出换行符，awk认为有+++号就是换行了，所以才打印成这个样子

[root@bogon ~]# awk -v RS=" " -v ORS='+++' '{print NR,$0}' test
1 abc+++2 345+++3 ssd+++4 asdf+++5 lkj;l
123+++6 klj+++7 adf+++8 daff+++9 adeills+++10 adsfei
# 一起使用输入输出换行符。
```

##### 内置变量FILENAME

```shell
[root@bogon ~]# awk '{print FILENAME,FNR,$0}' test test1
test 1 abc 345 ssd asdf lkj;l
test 2 123 klj adf daff adeills adsfei
test1 1 aaa#dfa#123#jkl;
test1 2 aiew#adkf#alkdjf#asdjfj
# FILENAME是为了显示文件名的。上面每行都打印了文件名，行号，文件内容
```

##### 内置变量ARGC与ARGV

```shell
[root@bogon ~]# awk 'BEGIN{print "aaa",ARGV[1]}' test test1
aaa test
[root@bogon ~]# awk 'BEGIN{print "aaa",ARGV[1],ARGV[2]}' test test1
aaa test test1
# ARGV内置变量表示的是一个数组。数组的索引都是从0开始的，所以，ARGV[1]表示引用ARGV数组中的第二个元素的值。命令后的文件名组成了这个数组，使用ARGV调用数组中的元素值，ARGV[1]对应的值为test，ARGV[2]对应的值为test1，ARGV[0]对应的值为awk
[root@bogon ~]# awk 'BEGIN{print "aaa",ARGV[0]}' test
aaa awk

[root@bogon ~]# awk 'BEGIN{print "aaa",ARGV[0],ARGV[1],ARGV[2],ARGC}' test test1
aaa awk test test1 3
# 在上面的例子中，应该有三个参数，awk、test、test1，这三个参数作为数组的元素存放于ARGV中，而ARGC则表示参数的数量，也可以理解为ARGV数组的长度。
```

##### 自定义变量

```shell
# 自定义变量方法
# 方法一：-v varname=value  变量名区分字符大小写。
# 方法二：在program中直接定义。

* 方法一
[root@bogon ~]# awk -v myVar="testVar" 'BEGIN{print myVar}'
testVar

* 方法二
[root@bogon ~]# awk 'BEGIN{myvar="ttt";print myvar}'
ttt
# ttt两侧一定要使用双引号，不能使用单引号。分号两侧有没有空格都可以。

* 一次定义多个变量
[root@bogon ~]# awk 'BEGIN{myvar1="111";myvar2="222";print myvar1,myvar2}'
111 222

[root@bogon ~]# abc=123
[root@bogon ~]# awk -v myvar=$abc 'BEGIN{print myvar}'
123
# 需要在awk中引用shell中的变量的时候，可以通过方法一间接的引用。
```

#### printf命令

* printf命令的作用是按照我们指定的格式输出文本。

```shell
# 语法
# printf "指定的格式" "文本1" "文本2" "文本3" ......

[root@bogon ~]# echo abc
abc
[root@bogon ~]# printf abc
abc[root@bogon ~]#
# echo命令会对输出的文本进行换行，而printf命令则不会对输出的文本进行换行

[root@bogon ~]# echo -e "abc \ndef \njkl \ndfj"
abc 
def 
jkl 
dfj
[root@bogon ~]# printf "abc \ndef \njkl \ndfj \n"
abc 
def 
jkl 
dfj
[root@bogon ~]# printf "%s\n" abc def jkl dfj
abc
def
jkl
dfj
# 前两种方法要使用转义符\n进行换行。第三条命令中的每一个"文本"都会被当做参数项传入printf命令，而每个被传入的参数都会按照指定的"格式"被"格式化"。"%s\n"就是格式，而后面的每一段字符串，都被当做参数传入到了printf命令中，并按照我们指定的格式进行了格式化。
# %s是"格式替换符"。使用"%s"代替传入的每一个参数，上面命令中的参数就是abc def jkl dfj，如果我们指定的格式为"%s\n"，当abc被当做参数传入printf命令时，printf就会把"%s\n"中的%s替换成abc，于是，abc就变成了我们指定的格式"abc\n"，最终printf输出的就是格式化后的"abc\n"，以此类推，每一段文本都被当做一个参数传入printf命令，然后按照指定的格式输出了。

[root@bogon ~]# printf "%s\n" 1 11 213 11123
1
11
213
11123
[root@bogon ~]# printf "%f\n" 1 11 213 11123
1.000000
11.000000
213.000000
11123.000000
# "%f"也代替了每一个传入的参数，它会将每一个传入的参数转换成"浮点类型"

* 格式替换符
# %s 字符串
# %f 浮点格式（也就是我们概念中的float或者double）
# %b 相对应的参数中包含转义字符时，可以使用此替换符进行替换，对应的转义字符会被转义。
# %c ASCII字符。显示相对应参数的第一个字符
# %d, %i 十进制整数
# %o 不带正负号的八进制值
# %u 不带正负号的十进制值
# %x 不带正负号的十六进制值，使用a至f表示10至15
# %X 不带正负号的十六进制值，使用A至F表示10至15
# %% 表示"%"本身

* printf常用的转义符
# \a 警告字符，通常为ASCII的BEL字符
# \b 后退
# \c 抑制（不显示）输出结果中任何结尾的换行字符（只在%b格式指示符控制下的参数字符串中有效），而且，任何留在参数里的字符、任何接下来的参数以及任何留在格式字符串中的字符，都被忽略
# \f 换页（formfeed）
# \n 换行
# \r 回车（Carriage return）
# \t 水平制表符
# \v 垂直制表符
# \\ 一个字面上的反斜杠字符，即"\"本身。
# \ddd 表示1到3位数八进制值的字符，仅在格式字符串中有效
# \0ddd 表示1到3位的八进制值字符

[root@bogon ~]# printf "( %s ) " 1 23 234 23423;echo ""
( 1 ) ( 23 ) ( 234 ) ( 23423 )
# 为每个传入的参数添加一对"括号"，并且括号内侧需要有空格。最后的echo命令是为了换行
[root@bogon ~]# printf "%s\t" 1 23 234 23423;echo
1	23	234	23423
# 使用"制表符"隔开每个参数，echo后不加引号也可以

[root@bogon ~]# printf "%s %s\n" a b df ad e r
a b
df ad
e r
# 指定的"格式"中所包含的"格式替换符"的数量，就代表每次格式化的参数的数量，每个"格式替换符"与参数都是一一对应的
[root@bogon ~]# printf "%s %s %s\n" a b c d e f 
a b c
d e f
[root@bogon ~]# printf "%s %s %s\n" 姓名 性别 年龄 董鹏 男 29 少松 女 39
姓名 性别 年龄
董鹏 男 29
少松 女 39
# 下面的年龄与其上面的标题没有对齐
[root@bogon ~]# printf "%7s %5s %4s\n" 姓名 性别 年龄 董鹏 男 29 少松 女 39
 姓名 性别 年龄
 董鹏   男   29
 少松   女   39
# 在原来的"格式替换符"中间加入了特定的数字，可以使输出的文字向右对齐。如果想向左对齐，就将数字改为负数，如：%-9s
# 如果使用%+9s，表示给后面对应的参数前加一个+号。
[root@bogon ~]# printf "aaa fff\n";printf "%-9s %-12f \n" abc 123.123123 bbb 2312.12345
aaa fff
abc       123.123123   
bbb       2312.123450
[root@bogon ~]# printf "aaa fff\n";printf "%-9s %-12.2f \n" abc 123.123123 bbb 2312.12345
aaa fff
abc       123.12       
bbb       2312.12 
# 第一条命令的数字修饰符为12，表示对应的替换符"%f"的输出宽度为12个字符，第二条命令的数字修饰符为12.2 ，表示对应的替换符"%f"的输出宽度为12个字符，并且小数点的精度为2。

[root@bogon ~]# printf "aaa fff\n";printf "%-9s %-12d \n" abc 123 bbb 2312
aaa fff
abc       123          
bbb       2312 
[root@bogon ~]# printf "aaa fff\n";printf "%-9s %-12.4d \n" abc 123 bbb 2312
aaa fff
abc       0123         
bbb       2312
# 当格式替换符为"%d"时，如果数字修饰符带有小数点，则数字修饰符小数点后的数字表示整数的长度，长度不够时，高位用0补全
```

#### printf动作

```shell
[root@bogon ~]# awk '{print $1}' test
abc
123
[root@bogon ~]# awk '{printf $1}' test
abc123[root@bogon ~]#
# printf动作不会自动换行

[root@bogon ~]# awk '{printf "%s\n",$1}' test
abc
123
# 使用格式替换符，不要忘记$1前面的逗号

[root@bogon ~]# awk 'BEGIN{printf "%s\n",1,2,3,4,5}'
1
[root@bogon ~]# awk 'BEGIN{printf "%s\n%s\n%s\n%s\n%s\n",1,2,3,4,5}'
1
2
3
4
5
# 在awk中，格式替换符的数量必须与传入的参数的数量相同。也就是格式替换符必须与需要格式化的参数一一对应。不可以像使用printf命令一样，一个格式替换符可以反复使用。

# 使用printf动作注意事项
# 1. 使用printf动作输出的文本不会换行，如果需要换行，可以在对应的"格式替换符"后加入"\n"进行转义。
# 2. 使用printf动作时，"指定的格式" 与 "被格式化的文本" 之间，需要用"逗号"隔开。
# 3. 使用printf动作时，"格式"中的"格式替换符"必须与 "被格式化的文本" 一一对应。

[root@bogon ~]# awk '{printf "第一列： %s 第二列： %s\n",$1,$2}' test
第一列： abc 第二列： 345
第一列： 123 第二列： klj
[root@bogon ~]# awk -v FS="#" '{printf "第一列： %s 第二列： %s\n",$1,$2}' test1
第一列： aaa 第二列： dfa
第一列： aiew 第二列： adkf
[root@bogon ~]# awk -v FS=":" 'BEGIN{printf "%-10s\t %s\n","用户名称","用户ID"}{printf "%-10s\t %s\n",$1,$3}' /etc/passwd
用户名称      	 用户ID
root      	 0
bin       	 1
daemon    	 2
adm       	 3
lp        	 4
sync      	 5
shutdown  	 6
halt      	 7
mail      	 8
operator  	 11
games     	 12
ftp       	 14
nobody    	 99
systemd-network	 192
dbus      	 81
polkitd   	 999
postfix   	 89
sshd      	 74
openvpn   	 998
```

