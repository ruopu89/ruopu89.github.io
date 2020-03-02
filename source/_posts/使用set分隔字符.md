---
title: 使用set分隔字符
date: 2020-01-20 15:24:46
tags: Shell
categories: Shell
---

### 举例

```shell
# 将时间格式的字符串转为秒
#!/bin/bash
#
d="00:20:40.28"
IFS=":"
set -- $d
hr=$(($1*3600))
min=$(($2*60))
sec=${3%.*}
# 百分号的含意：${string%substring}：从变量$string的结尾, 删除最短匹配$substring的子串。这里的$3
# 就是40，所以是取消40以后的所有部分，也就是".28"。
echo "total secs: $((hr+min+sec))"

bash -x test1.sh
输出：
+ d=00:20:40
+ IFS=:
+ set -- 00 20 40
+ hr=0
+ min=1200
+ sec=40
+ echo 'total secs: 1240'
total secs: 1240
# 可以看到，set会以IFS为分隔符，将d的内容重新分隔。另外，set后的--表示选项的结束，后面的都当做参数处理而不是选项。例：
# echo -- -e hello和echo -e hello是不一样的，前者-e是一个普通参数，后者-e则是一个选项
```



### IFS介绍

​	Shell 脚本中有个变量叫 IFS(Internal Field Seprator) ，内部域分隔符。完整定义是The shell uses the value stored in IFS, which is the space, tab, and newline characters by default, to delimit words for the read and set commands, when parsing output from command substitution, and when performing variable substitution.

​	Shell 的环境变量分为 set, env 两种，其中 set 变量可以通过 export 工具导入到 env 变量中。其中，set 是显示设置shell变量，仅在本 shell 中有效；env 是显示设置用户环境变量 ，仅在当前会话中有效。换句话说，set 变量里包含了 env 变量，但 set 变量不一定都是 env 变量。这两种变量不同之处在于变量的作用域不同。显然，env 变量的作用域要大些，它可以在 subshell 中使用。

​	而 IFS 是一种 set 变量，当 shell 处理"命令替换"和"参数替换"时，shell 根据 IFS 的值，默认是 space, tab, newline 来拆解读入的变量，然后对特殊字符进行处理，最后重新组合赋值给该变量。