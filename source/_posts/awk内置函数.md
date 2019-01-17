---
title: awk内置函数
date: 2018-10-17 16:48:35
tags: awk内置函数
categories: 基础
---

### awk内置函数

#### 算数函数

##### rand函数

```shell
[root@bogon ~]# awk 'BEGIN{print rand()}'
0.237788
[root@bogon ~]# awk 'BEGIN{print rand()}'
0.237788
[root@bogon ~]# awk 'BEGIN{print rand()}'
0.237788
# 单纯的使用rand函数，生成的值是不变的
```

##### srand函数

```shell
[root@bogon ~]# awk 'BEGIN{srand();print rand()}'
0.121122
[root@bogon ~]# awk 'BEGIN{srand();print rand()}'
0.665691
[root@bogon ~]# awk 'BEGIN{srand();print rand()}'
0.383723
# 配合srand函数使用rand函数就可以生成小于1的随机数了
```

##### int函数

```shell
[root@bogon ~]# awk 'BEGIN{srand();print rand()}'
0.999933
[root@bogon ~]# awk 'BEGIN{srand();print 100*rand()}'
72.6895
[root@bogon ~]# awk 'BEGIN{srand();print int(100*rand())}'
82
# 使用int函数最后截取出一个整数，第二步后要取出多少位的值就乘以多少
```

#### 字符串函数

##### gsub函数

```shell
[root@bogon ~]# cat test4
Allen Phillips
Green Lee
William Aiden James Lee
Angel Jack
Tyler Kevin
Lucas Thomas
Kevin
[root@bogon ~]# awk '{gsub("l","L",$1);print $0}' test4
ALLen Phillips
Green Lee
WiLLiam Aiden James Lee
AngeL Jack
TyLer Kevin
Lucas Thomas
Kevin
# 使用gsub函数，将小写字母"l"替换成大写字母"L"，但是替换的范围只限于"$1"，所以，当我们再次输出文本时，发现只有文本中的第一列中的小写字母"l"被替换成了大写字母"L"，其他列中的小写字母"l"并未被替换。如果想要替换文本中所有的小写字母"l"，则可以将上图中的"$1"换成"$0"，或者省略gsub函数中的第三个参数，省略gsub中的第三个参数时，默认为"$0"

[root@bogon ~]# awk '{gsub("[a-z]","6",$1);print $0}' test4
A6666 Phillips
G6666 Lee
W666666 Aiden James Lee
A6666 Jack
T6666 Kevin
L6666 Thomas
K6666
# 通过正则表达式进行匹配，这里将第一列中的小写字母都替换成了6
```

##### sub函数

```shell
[root@bogon ~]# awk '{sub("l","L",$1);print $0}' test4
ALlen Phillips
Green Lee
WiLliam Aiden James Lee
AngeL Jack
TyLer Kevin
Lucas Thomas
Kevin
# sub函数只会替换指定范围内第一次匹配到的符合条件的字符。
```

##### length函数

```shell
[root@bogon ~]# awk '{for(i=1;i<=NF;i++){print $i,length($i)}}' test4
Allen 5
Phillips 8
Green 5
Lee 3
William 7
Aiden 5
James 5
Lee 3
Angel 5
Jack 4
Tyler 5
Kevin 5
Lucas 5
Thomas 6
Kevin 5
# 通过length函数，获取到指定字符串的长度。
[root@bogon ~]# awk '{print $0,length()}' test4
Allen Phillips 14
Green Lee 9
William Aiden James Lee 23
Angel Jack 10
Tyler Kevin 11
Lucas Thomas 12
Kevin 5
# length函数可以省略传入的参数，即不指定任何字符串，当省略参数时，默认使用"$0"作为参数
```

##### index函数

```shell
[root@bogon ~]# awk '{print index($0,"Lee")}' test4
0
7
21
0
0
0
0
# 使用index函数，在每一行中找字符串"Lee"，如果Lee存在于当前行，则返回字符串Lee位于当前行的位置，如果Lee不存在于当前行，则返回0，表示当前行并不存在Lee，如上，第二行中包含Lee，而且Lee位于第二行的第7个字符的位置，所以返回数字7
```

##### split函数

```shell
[root@bogon ~]# awk -v ts="大鹏:少松:老董" 'BEGIN{split(ts,test,":");for(i in test){print test[i]}}'
大鹏
少松
老董
# 通过split函数，将字符串ts切割，以":"作为分割符，将分割后的字符串保存到了名为test的数组中，当我们输出数组中的元素时，每个元素的值为分割后的字符，其实，split函数也有对应的返回值，其返回值就是分割以后的数组长度
[root@bogon ~]# awk -v ts="大鹏:少松:老董" 'BEGIN{print split(ts,test,":")}'
3
# 被split函数分割后的数组的元素下标从1开始，不像其他语言中的数组下标是从0开始的，而且数组中元素输出的顺序可能与字符串中字符的顺序不同
[root@bogon ~]# awk -v ts="大鹏:少松:老董" 'BEGIN{ruo=split(ts,test,":");for(i=1;i<=ruo;i++){print i,test[i]}}'
1 大鹏
2 少松
3 老董
# 使用for(i=1;i<=ruo;i++)这样的循环语句，才能按顺序输出内容
```

#### 其他函数

```shell
* asort
# asort 函数可以根据元素的值进行排序
[root@bogon ~]# awk 'BEGIN{t["a"]=66;t["b"]=88;t["c"]=3;for(i in t){print i,t[i]}}'
a 66
b 88
c 3
[root@bogon ~]# awk 'BEGIN{t["a"]=66;t["b"]=88;t["c"]=3;asort(t);for(i in t){print i,t[i]}}'
1 3
2 66
3 88
# 数组中元素的值均为数字，但是下标为自定义的字符串，通过asort函数对数组排序后，再次输出数组中的元素时，已经按照元素的值的大小进行了排序，但是，数组的下标也被重置为了纯数字。

[root@bogon ~]# awk 'BEGIN{t["a"]=66;t["b"]=88;t["c"]=3;asort(t,newt);for(i in t){print i,t[i]}}'
a 66
b 88
c 3
[root@bogon ~]# awk 'BEGIN{t["a"]=66;t["b"]=88;t["c"]=3;asort(t,newt);for(i in newt){print i,newt[i]}}'
1 3
2 66
3 88
# 对原数组元素值排序的同时，创建一个新的数组，将排序后的元素放置在新数组中。上面两条命令一条打印源数组的值，一条打印新数组的值。

[root@bogon ~]# awk 'BEGIN{t["a"]=66;t["b"]=88;t["c"]=3;len=asort(t,newt);for(i=1;i<=len;i++){print i,newt[i]}}'
1 3
2 66
3 88
# asort函数也有返回值，它的返回值就是数组的长度。这里将asort的返回值保存在了len中

* asorti
# asorti 函数可以根据元素的下标进行排序
[root@bogon ~]# awk 'BEGIN{t["z"]=66;t["q"]=88;t["a"]=3;for(i in t){print i,t[i]}}'
z 66
a 3
q 88
[root@bogon ~]# awk 'BEGIN{t["z"]=66;t["q"]=88;t["a"]=3;len=asorti(t,newt);for(i=1;i<=len;i++){print i,newt[i]}}'
1 a
2 q
3 z
# asorti 函数根据数组t的下标排序后，创建了一个新的数组newt，newt中元素的值即为t数组下标的值，上例中，我们使用len变量保存了asorti函数的返回值，并且输出了最后排序后的新数组。

[root@bogon ~]# awk 'BEGIN{t["z"]=66;t["q"]=88;t["a"]=3;len=asorti(t,newt);for(i=1;i<=len;i++){print i,newt[i]}}'
1 a
2 q
3 z
[root@bogon ~]# awk 'BEGIN{t["z"]=66;t["q"]=88;t["a"]=3;len=asorti(t,newt);for(i=1;i<=len;i++){print i,t[newt[i]]}}'
1 3
2 88
3 66
# 根据排序后的下标再次输出对应的元素值，从而达到根据数组下标排序后，输出原数组元素的目的。新数组负责排序老数组的下标，并将排序后的下标作为新数组的元素，而我们输出新数组元素的同时，又将新数组的元素值作为老数组下标，从而输出了老数组中的元素值
```



