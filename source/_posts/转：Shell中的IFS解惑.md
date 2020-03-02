---
title: 转：Shell中的IFS解惑
date: 2020-01-20 15:31:22
tags: Shell
categories: Shell
---

### 转：Shell中的IFS解惑

原文链接：https://blog.csdn.net/whuslei/article/details/7187639

#### 一、IFS 介绍

​	Shell 脚本中有个变量叫 IFS(Internal Field Seprator) ，内部域分隔符。完整定义是The shell uses the value stored in IFS, which is the space, tab, and newline characters by default, to delimit words for the read and set commands, when parsing output from command substitution, and when performing variable substitution.

​	Shell 的环境变量分为 set, env 两种，其中 set 变量可以通过 export 工具导入到 env 变量中。其中，set 是显示设置shell变量，仅在本 shell 中有效；env 是显示设置用户环境变量 ，仅在当前会话中有效。换句话说，set 变量里包含了 env 变量，但 set 变量不一定都是 env 变量。这两种变量不同之处在于变量的作用域不同。显然，env 变量的作用域要大些，它可以在 subshell 中使用。

​	而 IFS 是一种 set 变量，当 shell 处理"命令替换"和"参数替换"时，shell 根据 IFS 的值，默认是 space, tab, newline 来拆解读入的变量，然后对特殊字符进行处理，最后重新组合赋值给该变量。

#### 二、IFS 简单实例

1. 查看变量 IFS 的值。

```shell
$ echo $IFS

$ echo "$IFS" | od -b
0000000 040 011 012 012
0000004
# 直接输出IFS是看不到的，把它转化为二进制就可以看到了，"040"是空格，"011"是Tab，"012"是换行符"\n" 
# 。最后一个 012 是因为 echo 默认是会换行的。
```

2. $* 和 $@ 的细微差别

```shell
# 从下面的例子中可以看出，如果是用冒号引起来，表示这个变量不用IFS替换！！所以可以看到这个变量的"原始
# 值"。反之，如果不加引号，输出时会根据IFS的值来分割后合并输出！ $* 是按照IFS中的第一个值来确定的！下
# 面这两个例子还有细微的差别！
$ IFS=:;
$ set x y z
$ echo $*
x y z
$ echo "$*"
x:y:z
$ echo $@
x y z
$ echo "$@"
x y z
# 上例 set 变量其实是3个参数，而下面这个例子实质是2个参数，即 set "x y z"  和 set x y z 是完全不同的。
$ set "x" "y z"
$ echo $*
x y z
$ echo "$*"
x:y z
$ echo $@
x y z
$ echo "$@"
x y z
$ echo $* |od -b
0000000 170 040 171 040 172 012
0000006
$ echo "$*" |od -b
0000000 170 072 171 040 172 012
0000006
# 小结：$* 会根据 IFS 的不同来组合值，而 $@ 则会将值用" "来组合值！
```

3. for 循环中的奇怪现象

```shell
$ for x in $var ;do echo $x |od -b ;done
0000000 012
0000001
0000000 040 141 012
0000003
0000000 142 012
0000002
0000000 012
0000001
0000000 143 012
0000002
# ob命令表示转换为二进制
# 先暂且不解释 for 循环的内容！看下面这个输出！IFS 的值同上！ var=": a:b::c:"，
$ echo $var |od -b
0000000 040 040 141 040 142 040 040 143 012
0000011
$ echo "$var" |od -b
0000000 072 040 141 072 142 072 072 143 072 012
0000012
# "$var"的值应该没做替换，所以还是 ": a:b::c:" (注 "072" 表示冒号)，但是$var 则发生了变化！注意输
# 出的最后一个冒号没有了，也没有替换为空格！Why？

# 使用 $var 时是经历了这样一个过程！首先，按照这样的规则 [变量][IFS][变量][IFS]……根据原始 var 值中
# 所有的分割符(此处是":")划分出变量，如果IFS的值是有多个字符组成，如IFS=":;"，那么此处的[IFS]指的是
# IFS中的任意一个字符($* 是按第一个字符来分隔！)，如 ":" 或者 ";" ，后面不再对[IFS]做类似说明！(注：
# [IFS]会有多个值，多亏 #blackold 的提醒)；然后，得到类似这样的 list， ""   " a"   "b"  ""  
# "c"  。如果此时 echo $var，则需要在这些变量之间用空格隔开，也就是""  [space]   "  a"  [space]
# "b" [space]  "" [space]  "c" ，忽略掉空值，最终输出是 [space][space]a[space]b[space]
# [space]c ！

# 如果最后一个字符不是分隔符，如 var="a:b"，那么最后一个分隔符后的变量就是最后一个变量！

# 这个地方要注意下！！如果IFS就是空格，那么类似于" [space][space]a[space]b[space][space]c "会合
# 并重复的部分，且去头空格，去尾空格，那么最终输出会变成类似 a[space]b[space]c ，所以，如果IFS是默认
# 值，那么处理的结果就很好算出来，直接合并、忽略多余空格即可！

# 另外，$* 和 $@ 在函数中的处理过程是这样的(只考虑"原始值"！)！"$@"，就是像上面处理后赋值，但是 "$*"
# 却不一样！它的值是用分隔符(如":")而不是空格隔开！具体例子见最后一个例子！

# 好了，现在来解释 for 循环的内容。for 循环遍历上面这个列表就可以了，所以 for 循环的第一个输出是空！
# ("012"是echo输出的换行符 )。。。。后面的依次类推！不信可以试试下面这个例子，结果是一样的！

$ for x in "" " a" "b" "" "c" ;do echo $x |od -b ;done
0000000 012
0000001
0000000 040 141 012
0000003
0000000 012
0000001
0000000 142 012
0000002
0000000 012
0000001
0000000 143 012
0000002
```



#### 三、IFS的其他实例

```shell
Example 1:

$ IFS=:
$ var=ab::cd
$ echo $var
ab  cd
$ echo "$var"
ab::cd
# 解释下：x 的值是 "ab::cd"，当进行到 echo $x 时，因为$符，所以会进行变量替换。Shell 根据 IFS 的
# 值将 x 分解为 ab "" cd，然后echo，插入空隔，ab[space]""[space]cd，忽略""，输出  ab  cd 。

Example 2 :

$ read a
		xy  z
$ echo $a
xy  z
# 解释：这是 http://bbs.chinaunix.net/thread-207178-1-1.html 上的一个例子。此时IFS是默认值，
# 本希望把所有的输入(包括空格)都放入变量a中，但是输出的a却把前面的空格给忽略了！！原因是：默认的 IFS 
# 会按space tab newline 来分割。这里需要注意的一点是，read 命令的实现过程，即在读入时已经替换了。解
# 决办法是在开头加上一句 IFS=";" ，这里必须加上双引号，因为分号有特殊含义。

Example 3 :

$ tmp="   xy z"
$ a=$tmp
$ echo $a
$ echo "$a"
# 解释：什么时候会根据 IFS 来"处理"呢？我觉得是，对于不加引号的变量，使用时都会参考IFS，但是要注意其原始值！

Example 4 ：

#!/bin/bash
IFS_old=$IFS      #将原IFS值保存，以便用完后恢复
IFS=$’\n’        #更改IFS值为$’\n’ ，注意，以回车做为分隔符，IFS必须为：$’\n’
for i in $((cat pwd.txt)) #pwd.txt 来自这个命令：cat /etc/passwd >pwd.txt
do
    echo $i
done
IFS=$IFS_old      #恢复原IFS值
# 另外一个例子，把IP地址逆转输出：

Example 5 :

#!/bin/bash

IP=220.112.253.111
IFS="."
TMPIP=$(echo $IP)
IFS=" " # space
echo $TMPIP
for x in $TMPIP ;do 
    Xip="${x}.$Xip"
done
echo ${Xip%.}

Complex_Example 1:  http://bbs.chinaunix.net/forum.php?mod=viewthread&tid=3660898&page=1#pid21798049

function output_args_ifs(){
    echo "=$*"
    echo "="$*
    for m in $* ;do 
        echo "[$m]"
    done
}

IFS=':'
var='::a:b::c:::'
output_args_ifs $var
# 输出为：

# =::a:b::c::  # 少了最后一个冒号！看前面就知道为什么了
# =  a b  c 
# [][]
# [a][b]
# [][c]
# []

# 由于 "output_args_ifs $var" 中 $var 没有加引号，所以根据IFS替换！根据IFS划分出变量： ""  "" 
# "a"  "b"  ""  "c" "" ""(可以通过输出 $# 来测试参数的个数！)，重组的结果为:
#  "$@" 的值是  "" [space] "" [space]  "a" [space]  "b"  [space] "" [space]  "c" [space] 
# "" [space] ""，可以通过，echo==>"  a b  c   "
# "$*" 的值是   "" [IFS] "" [IFS]  "a" [IFS]  "b"  [IFS] "" [IFS]  "c" [IFS] "" [IFS] 
# ""，忽略""，echo=>"::a:b::c::"

# 注意， $* 和 $@ 的值都是  ""   ""   "a"   "b"   ""   "c"  ""  "" 。可以说是一个列表……因为他
# 们本来就是由 $1 $2 $3……组成的。

# 所以，《Linux程序设计》里推荐使用 $@，而不是$*

# 总结：IFS 其实还是很麻烦的，稍有不慎就会产生很奇怪的结果，因此使用的时候要注意！我也走了不少弯路，只希
# 望能给后来者一些帮助。本文若有问题，欢迎指正！！谢谢！
```



如有转载，请注明blog.csdn.net/whuslei
参考：
http://blog.chinaunix.net/space.php?uid=20543672&do=blog&id=94358
http://smilejay.com/2011/12/bash_ifs/#comment-51
(全文完)

