---
title: python基础学习-正则表达式
date: 2020-02-06 10:28:22
tags: 日志分析
categories: python
---

### **正则表达式(重要)**

#### 概述

正则表达式，Regular Expression，缩写为regex、regexp、RE等。正则表达式是文本处理极为重要的技术，用它可以对字符串按照某种规则进行检索、替换。

1970年代，Unix之父Ken Thompson将正则表达式引入到Unix中文本编辑器ed和grep命令中，由此正则表达式普及开来。

1980年后，perl语言对Henry Spencer编写的库，扩展了很多新的特性。1997年开始，Philip Hazel开发出了PCRE(Perl Compatible Regular Expressions)，它被PHP和HTTPD等工具采用。

正则表达式应用极其广泛，shell中处理文本的命令、各种高级编程语言都支持正则表达式。

参考：https://www.w3cschool.cn/regex_rmjc/



#### 分类

1. BRE

基本正则表达式，grep、sed、vi等软件支持。vim有扩展。

2. ERE

扩展正则表达式，egrep (grep -E)、sed -r等

3. PCRE

几乎所有高级语言都是PCRE的方言或者变种。Python从1.6开始使用SRE正则表达式引擎，可以认为是PCRE的子集，见模块re。



### 基本语法

#### 元字符 metacharacter

| 代码   | 说明                                                         | 举例                                                         |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| .      | 匹配除换行符外任意一个字符                                   | .                                                            |
| [abc]  | 字符集合，只能表示一个字符位置。匹配所包含的任意一个字符     | [abc]匹配plain中的'a'                                        |
| [^abc] | 字符集合，只能表示一个字符位置。匹配除云集合内字符的任意一个字符 | [^abc]可以匹配plain中的'p'、'l'、'i'或者'n'                  |
| [a-z]  | 字符范围，也是个集合，表示一个字符位置。匹配所包含的任意一个字符 | 常用`[A-Z][0-9]`                                             |
| [^a-z] | 字符范围，也是个集合，表示一个字符位置。匹配除去集合内字符的任意一个字符 |                                                              |
| \b     | 匹配单词的边界                                               | \bb在文本中找到单词中b开头的b字符                            |
| \B     | 不匹配单词的边界                                             | t\B包含t的单词但是不以t结尾的t字符，例如 write；\Bb不以b开头的含有b的单词，例如 able |
| \d     | [0-9]匹配1位数字                                             | \d                                                           |
| \D     | `[^0-9]`匹配1位非数字                                        |                                                              |
| \s     | 匹配1位空白字符，包括换行符、制表符、空格。如：[\f\r\n\t\v]  |                                                              |
| \S     | 匹配1位非空白字符                                            |                                                              |
| \w     | 匹配[a-zA-Z0-9]，包括中文的字                                | \w                                                           |
| \W     | 匹配\w之外的字符                                             |                                                              |



#### 转义

凡是在正则表达式中有特殊意义的符号，如果想使用它的本意，请使用`\`转义。反斜杠自身，得使用`\\`。

\r、\n还是转义后代表回车、换行



#### 重复

| 代码  | 说明                                | 举例                                                |
| ----- | ----------------------------------- | --------------------------------------------------- |
| *     | 表示前面的正则表达式会重复0次或多次 | e\w*单词中e后面可以有非空白字符                     |
| +     | 表示前面的正则表达式重复至少1次     | e\w+单词中e后面至少有一个非空白字符                 |
| ?     | 表示前面的正则表达式会重复0次或1次  | e\w?单词中e后面至多有一个非空白字符                 |
| {n}   | 重复固定的n次                       | e\w{1}单词中e后面只能有一个非空白字符               |
| {n,}  | 重复至少n次                         | e\w{1,}等价e\w+；e\w{0,}等价e\w*；e\w{0,1} 等价e\w? |
| {n,m} | 重复n到m次                          | e\w{1,10} 单词中e后面至少1个，至多10个非空白字符    |



#### 练习

1. 匹配手机号码

字符串为"手机号码13851888188"

答案：\d{11}

2. 匹配中国座机

字符串为"号码025-83105736、0543-5464432"

答案：\d{3,4}-\d{7,8}



| 代码                       | 说明                                                         | 举例                                                         |
| :------------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| x&#124;y                        | 匹配x或者y                                                   | wood took foot food使用w&#124;food或者(w&#124;f)ood          |
| 捕获                       |                                                              |                                                              |
| (pattern)                  | 使用小括号指定一个子表达式，也叫分组。捕获后会自动分配组号从1开始可以改变优先级。匹配 pattern 并捕获该匹配的子表达式。可以使用 $0...$9 属性从结果“匹配”集合中检索捕获的匹配。若要匹配括号字符 ( )，请使用`“\(”`或者`“\)”`。**这里所说的捕获指的是之后方便引用** |                                                              |
| \数字                      | 匹配对应的分组                                               | (very)\1匹配very very，但捕获的组group是very                 |
| (?:pattern)                | 如果仅仅为了改变优先级，就不需要捕获分组。匹配 pattern 但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用。这对于用“或”字符 (&#124;) 组合模式部件的情况很有用。例如，与“industry&#124;industries”相比，“industr(?:y&#124;ies)”是一个更加经济的表达式。**在括号分组中需要选择且无需捕获时使用，这时不能用×&#124;×的方式，因为它只能是管道符两侧的值。** | (?:w&#124;f)ood，industr(?:y&#124;ies)等价industry&#124;industries |
| `(?<name>exp)(?'name'exp)` | 分组捕获，但是可以通过name访问分组。Python语法必须是`(?P<name>exp)` |                                                              |
| 零宽断言                   |                                                              | wood took foot food                                          |
| (?=exp)                    | 零宽度正预测先行断言，断言exp一定在匹配的右边出现，也就是说断言后面一定跟个exp | f(?=oo) f后面一定有oo出现                                    |
| (?<=exp)                   | 零宽度正回顾后发断言，断言exp一定出现在匹配的左边出现，也就是说前面一定有个exp前缀 | (?<=f)ood、(?<=t)ook分别匹配ood、ook，ook前面一定有t出现    |
| 负向零宽断言               |                                                              |                                                              |
| (?!exp)                    | 零宽度负预测先行断言，断言exp一定不会出现在右侧，也就是说断言后面一定不是exp | \d{3}(?!\d)匹配3位数字，断言3位数字后面一定不能是数字。foo(?!d)，foo后面一定不是d |
| (?<!exp)                   | 零宽度负回顾后发断言，断言exp一定不能出现在左侧，也就是说断言前面一定不能是exp | (?<!f)ood，ood的左边一定不是f                                |
| 注释                       |                                                              |                                                              |
| (?#comment)                | 注释                                                         | f(?=oo)(?#这个后断言不捕获)                                  |

注意：

断言会不会捕获呢？也就是断言占不占分组号呢？

断言不占分组号。断言如同条件，只是要求匹配必须满足断言的条件。

分组和捕获是同一个意思

使用正则表达式时，能用简单表达式，就不要复杂的表达式



#### 贪婪与非贪婪

默认是贪婪模式，也就是说尽量多匹配更长的字符串。

非贪婪很简单，在重复的符号后面加上一个?问号，就尽量的少匹配了。

| 代码   | 说明                                 | 举例 |
| ------ | ------------------------------------ | ---- |
| *?     | 匹配任意次，但尽量能少重复           |      |
| +?     | 匹配至少1次，但尽可能少重复          |      |
| ??     | 匹配0次或1次，但尽可能少重复         |      |
| {n,}?  | 匹配至少n次，但尽可能少重复          |      |
| {n,m}? | 匹配至少n次，至多m次，但尽可能少重复 |      |

```shell
例：
very very happy   使用v.*y和v.*?y
```

引擎选项

| 代码                    | 说明                                                         | Python              |
| ----------------------- | ------------------------------------------------------------ | ------------------- |
| IgnoreCase              | 匹配时忽略大小写                                             | re.l、re.IGNORECASE |
| Singleline              | 单行模式，可以匹配所有字符，包括\n                           | re.S、re.DOTALL     |
| Multiline               | 多行模式^行首、$行尾                                         | re.M、re.MULTILINE  |
| IgnorePatternWhitespace | 忽略表达式中的空白字符，如果要使用空白字符用转义，#可以用来做注释 | re.X、re.VERBOSE    |

```shell
单行模式：
. 可以匹配所有字符，包括换行符
^ 表示整个字符串的开头，$整个字符串的结尾

多行模式：
. 可以匹配除了换行符之外的字符
^ 表示行首，$行尾
^ 表示整个字符串的开始，$ 表示整个字符串的结尾。开始指的是\n后紧接着下一个字符，结束指的是\n前的字符

可以认为，单行模式就如同看穿了换行符，所有文本就是一个长长的只有一行的字符串，所有^就是这一行字符串的行首，$就是这一行的行尾。
多行模式，无法穿透换行符，^和$还是行首行尾的意思，只不过限于每一行

注意：注意字符串中看不见的换行符，\r\n会影响e$的测试，e$只能匹配e\n

举例
very very happy
harry key

上面两行happy之后 ，有可能是\r\n结尾
y$单行匹配key的y，多行匹配 happy和key的y。
```



#### 练习

```python
1. 匹配一个0-999之间的任意数字
1
12
995
9999
102
02
003
4d

参考：
\d：1位数
[1-9]?\d：1-2位数
^([1-9]\d\d?|\d)：1-3位数
^([1-9]\d\d?|\d)$：1-3位数的行
^([1-9]\d\d?|\d)\r?$
^([1-9]\d\d?|\d)(?!\d)：数字开头1-3位数且之后不能是数字

2. IP地址
匹配合法的IP地址
192.168.1.150
0.0.0.0
255.255.255.255
17.16.52.100
172.16.0.100
400.400.999.888
001.002.003.000
257.257.255.256

参考：
((\d{1,3}).){3}(\d{1,3})
(?:(\d{1,3}).){3}(\d{1,3})   # 400.400.999.888

对于IP地址验证的问题
- 可以把数据提出来后，交给IP地址解析库处理，如果解析异常，就说明有问题，正则的验证只是一个初步的筛选，把明显错误过滤掉
- 可以使用复杂的正则表达式验证地址正确性
- 前导0是可以的

import socket
nw = socket.inet_aton('192.168.05.001')
print(nw, socket.inet_ntoa(nw))
输出：b'\xc0\xa8\x05\x01' 192.168.5.1

分析：
每一段上可以写的数字有1、01、001、000、23、023、230、100，也就是说1位就是0-9，2位每一位也是0-9，3位第一位只能0-2，其余2位都可以0-9。
(?:([0-2]\d{2}|\d{1,2})\.){3}([0-2]\d{2}|\d{1,2})
# 解决超出200的问题，但是256呢？

200是特殊的，要再单独分情况处理
25[0-5]|2[0-4]\d[01]?\d\d?   这就是每一段的逻辑
(?:(25[0-5]|2[0-4]\d[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)

3. 选出含有ftp的链接，且文件类型是gz或者xz的文件名
ftp://ftp.astron.com/pub/file/file-5.14.tar.gz
ftp://ftp.gmplib.org/pub/gmp-5.1.2/gmp-5.1.2.tar.gz
ftp://ftp.vim.org/pub/vim/unix/vim-7.3.tar.bz2
http://anduin.linuxfromscratch.org/sources/LFS/lfs-packages/conglomeration//iana-etc/iana-etc-2.30.tar.bz2
http://anduin.linuxfromscratch.org/sources/other/udev-lfs-205-1.tar.bz2
http://download.savannah.gnu.org/releases/libpipeline/libpipeline-1.2.4.tar.gz
http://download.savannah.gnu.org/releases/man-db-2.6.5.tar.xz
http://download.savannah.gnu.org/releases/sysvinit/sysvinit-2.88dsf.tar.bz2
http://ftp.altlinux.org/pub/people/legion/kbd/kbd-1.15.5.tar.gz
http://mirror.hust.edu.cn/gnu/autoconf/autoconf-2.69.tar.xz
http://mirror.hust.edu.cn/gnu/automake/autokake-1.14.tar.xz
    
参考：
.*ftp.*\.(?:gz|xz) # \是转义符，转义点符号
ftp.*/(.*(?:gz|xz))
.*ftp.*/([^/]*\.(?:gz|xz)) # 捕获文件名分组
(?<=.*ftp.*/)[^/]*\.(?:gz|xz) # 断言文件名前一定还有ftp
```



### Python的正则表达式

Python使用re模块提供了正则表达式处理的能力

#### 常量

| 常量               | 说明                   |
| ------------------ | ---------------------- |
| re.M、re.MULTILINE | 多行模式               |
| re.S、re.DOTALL    | 单行模式               |
| re.I、reIGNORECASE | 忽略大小写             |
| re.X、re.VERBOSE   | 忽略表达式中的空白字符 |

使用`|位或`运算开启多种选项



#### 方法

```python
re.compile(pattern, flags=0)
# 设定flags，编译模式，返回正则表达式对象regex。
# pattern就是正则表达式字符串，flags是选项。正则表达式需要被编译，为了提高效率，这些编译后的结果被保
# 存，下次使用同样的pattern的时候，就不需要再次编译。
# re的其他方法为了提高效率都调用了编译方法，就是为了提速。

group()
返回一个或多个匹配的字串。如果只有一个参数，结果只有单个字符串；如果有多个参数，结果是一个元组，元组里每一项对应一个参数。没有参数，group1默认是0（整个匹配串被返回）。如果groupN参数是0，对应的返回值是整个匹配串；如果它属于[1，99]，返回对应的一项括号分隔的群。如果参数是负数或大于模式串中定义的群数，IndexError异常会被抛出。如果模式串没有任何匹配，group返回None；如果模式串多次匹配，group将返回最后一次匹配。
>>> m = re.match(r"(\w+) (\w+)", "Isaac Newton, physicist")
>>> m.group(0)       # The entire match 整个匹配
'Isaac Newton'
>>> m.group(1)       # The first parenthesized subgroup. 第一个括号分隔的子群
'Isaac'
>>> m.group(2)       # The second parenthesized subgroup. 第二个括号分隔的子群
'Newton'
>>> m.group(1, 2)    # Multiple arguments give us a tuple. 多个参数给我们一个元组
('Isaac', 'Newton')


In [2]: m = re.match(r"(..)+", "a1b2c3")  # 三次匹配
In [3]: m.group(0)                        # 返回整个匹配串
Out[3]: 'a1b2c3'                          
In [4]: m.group(1)                        # 只返回最后一个匹配 
Out[4]: 'c3'
In [5]: m.group(2)
---------------------------------------------------------------------------
IndexError                                Traceback (most recent call last)
<ipython-input-5-9b74dc8a1297> in <module>()
----> 1 m.group(2)
IndexError: no such group
    
groups()    
它返回一个包含所有匹配子群的元组。
>>> m = re.match(r"(\d+)\.(\d+)", "24.1632")
>>> m.groups()
('24', '1632')

groupdict()
它返回一个字典，包含所有经命名的匹配子群，键值是子群名。
>>> m = re.match(r'(?P<user>\w+)@(?P<website>\w+)\.(?P<extension>\w+)','myname@hackerrank.com')
>>> m.groupdict()
{'website': 'hackerrank', 'user': 'myname', 'extension': 'com'}
```



##### 单次匹配

```python
re.match(pattern, string, flags=0)
regex.match(string[, pos[, endpos]])
# match匹配从字符串的开头匹配，regex对象match方法可以重设定开始位置和结束位置。返回match对象
# match只匹配开头的内容

re.search(pattern, string, flags=0)
regex.search(string[, pos[, endpos]])
# 从头搜索直到第一个匹配，regex对象search方法可以重设定开始位置和结束位置，返回match对象

re.fullmatch(mattern, string, flags=0)
regex.fullmatch(string[, pos[, endpos]])
# 整个字符串和正则表达式匹配，也就是索引值的开始与结束要与字符串保持一致，不然是匹配不到的

例
import re
s = '''bottle\nbag\nbig\napple'''
for i,c in enumerate(s,1):   # 括号中的1表示从1开始
    print((i-1,c),end='\n' if i%8==0 else ' ')
    # 上面从1开始，是为了这里方便计算。如果i和8除余是0就用\n作为换行符，否则就以空白作为换行符。如果不
    # 加判断，将以回车作为换行符，结果中的每个括号都会占一行。
    # 前面括号中的i-1是为了保持enumerate函数从0开始的显示效果。
print()

输出：
(0, 'b') (1, 'o') (2, 't') (3, 't') (4, 'l') (5, 'e') (6, '\n') (7, 'b')
(8, 'a') (9, 'g') (10, '\n') (11, 'b') (12, 'i') (13, 'g') (14, '\n') (15, 'a')
(16, 'p') (17, 'p') (18, 'l') (19, 'e') 

# match方法
print('--match--')
result = re.match('b', s)  # 从s变量中找到一个就不找了
print(1, result) # bottle
输出：1 <re.Match object; span=(0, 1), match='b'>
# span是配置到的字符串的索引值位置
result = re.match('a', s) # 没找到，返回None
print(2, result)
result = re.match('^a', s, re.M) # 依然从头开始找，多行模式没有用
print(3, result)
result = rematch('^a', s, re.S) # 依然从头开始找
print(4, result)
# 先编译，然后使用正则表达式对象
regex = re.compile('a') 
# 先编译，查找有a的，结果保存到regex中。方便下面从regex中使用match方法查找
result = regex.match(s) 
# 依然从头开始找，这里只需要设定从r哪里找上面编译的正则表达式就可以了，也就是从s中找有regex的
print(5, result)
result = regex.match(s, 15) # 把索引15作为查找的开始
print(6, result) # 可以找到apple
print()

# search方法
print('--search--')
result = re.search('a', s) # 扫描找到匹配的第一个位置
print(7, result) # apple
regex = re.compile('b')
result = regex.search(s, 1)  # 从索引1开始查找
print(8, result) # bag
regex = re.compile('^b', re.M)
result = regex.search(s) # 不管是不是多行，找到就返回
print(8.5, result) # bottle
result = regex.search(s, 8)
print(9, result) # big

# fullmatch方法
result = re.fullmatch('bag', s)
print(10, result)
regex = re.compile('bag')
result = regex.fullmatch(s)
print(11, result)
result = regex.fullmatch(s, 7)
print(12, result)
result = regex.fullmatch(s, 7, 10)
print(13, result) # 要完全匹配，多了少了都不行，[7,10)，前包后不包
```



##### 全文搜索

```python
re.findall(pattern, string, flags=0)
regex.findall(string[, pos[, endpos]])
# 对整个字符串，从左至右匹配，返回所有匹配项的列表

re.finditer(pattern, string, flags=0)
regex.finditer(string[, pos[, endpos]])
# 对整个字符串，从左至右匹配，返回所有匹配项，返回迭代器。
# 注意，每次迭代返回的是match对象。

例
import re
s = '''bottle\nbag\nbig\nable'''
for i,c in enumerate(s,1):
    print((i-1, c), end='\n' if i%8==0 else ' ')
print()
输出：
(0, 'b') (1, 'o') (2, 't') (3, 't') (4, 'l') (5, 'e') (6, '\n') (7, 'b')
(8, 'a') (9, 'g') (10, '\n') (11, 'b') (12, 'i') (13, 'g') (14, '\n') (15, 'a')
(16, 'b') (17, 'l') (18, 'e')

# findall方法
result = re.findall('b', s)
print(1, result)
regex = re.compile('^b')
result = regex.findall(s)
print(2, result)
regex = re.compile('^b', re.M)  # 使用多行模式，可以找到更多b开头的单词
result = regex.findall(s,7)
print(3, result) # bag big
regex = re.compile('^b', re.S)
result = regex.findall(s)
print(4, result) # bottle
regex = re.compile('^b', re.M)
result = regex.findall(s, 7, 10)
print(5, result) # bag

# finditer方法
result = regex.finditer(s)   # 生成一个迭代器
print(type(result)) # 类型是可调用的迭代器，callable_iterator
print(next(result))
print(next(result))
```



##### 匹配替换

```python
re.sub(pattern, replacement, string, count=0, flags=0)
regex.sub(replacement, string, count=0)
# 使用pattern对字符串string进行匹配，对匹配项使用repl替换。replacement可以是string、bytes、function

re.subn(pattern, replacement, string, count=0, flags=0)
regex.subn(replacement, string, count=0)
# 同sub返回一个元组(new_string, number_of_subs_made)

例
import re
s = '''bottle\nbag\nbig\napple'''
for i,c in enumerate(s,1):   # 括号中的1表示从1开始
    print((i-1,c),end='\n' if i%8==0 else ' ')
print()

输出：
(0, 'b') (1, 'o') (2, 't') (3, 't') (4, 'l') (5, 'e') (6, '\n') (7, 'b')
(8, 'a') (9, 'g') (10, '\n') (11, 'b') (12, 'i') (13, 'g') (14, '\n') (15, 'a')
(16, 'p') (17, 'p') (18, 'l') (19, 'e') 

# 替换方法
regex = re.compile('b\wg')
result = regex.sub('magedu', s)
print(1, result) # 被替换后的字符串
# 输出：
# 1 bottle
# magedu
# magedu
# apple
result = regex.sub('magedu', s, 1) # 替换1次
print(2, result) # 被替换后的字符串
# 输出：
# 2 bottle
# magedu
# big
# apple

regex = re.compile('\s+')  # \s匹配1位空白字符，包括换行符、制表符、空格。加号表示至少1次
result = regex.subn('\t', s)
print(3, result) # 被替换后的字符串及替换次数的元组
# 输出：3 ('bottle\tbag\tbig\tapple', 3)
```



##### 分割字符串

```python
字符串的分割函数，太难用，不能指定多个字符进行分割
re.split(pattern, string, maxsplit=0, flags=0)
re.split 分割字符串

例
import re
s = '''01 bottle
02 bag
03       big1
100        able'''
for i,c in enumerate(s, 1):
    print((i-1, c), end='\n' if i%8==0 else ' ')
print()

# 把每行单词提取出来
print(s.split())
# 输出：['01','bottle','02','bag','03','big1','100','able']
result = re.split('[\s\d]+', s)  # 以一个空格或一个数字为分隔符对s变量进行处理
print(1, result) # ['','bottle','bag','big','able']
regex = re.compile('^[\s\d]+') # 字符串首
result = regex.split(s)
print(2, result) # ['','bottle\n02 bag\n03      big1\n100      able']
regex = re.compile('^[\s\d]+', re.M) # 行首
result = regex.split(s)
print(3, result) # ['','bottle\n','bag\n','big1\n','able']
regex = re.compile('\s+\d+\s+')
result = regex.split(' ' + s)
print(4, result)
```



##### 分组

```python
使用小括号的pattern捕获的数据被放到了组group中。
match、search函数可以返回match对象；findall返回字符串列表；finditer返回一个个match对象
如果pattern中使用了分组，如果有匹配的结果，会在match对象中
1. 使用group(N)方式返回对应分组，1-N是对应的分组，0返回整个匹配的字符串
2. 如果使用了命名分组，可以使用group('name')的方式取分组
3. 也可以使用groups()返回所有组
4. 使用groupdict()返回所有命名的分组

例
import re
s = '''bottle\nbag\nbig\napple'''
for i,c in enumerate(s,1):   # 括号中的1表示从1开始
    print((i-1,c),end='\n' if i%8==0 else ' ')
print()

输出：
(0, 'b') (1, 'o') (2, 't') (3, 't') (4, 'l') (5, 'e') (6, '\n') (7, 'b')
(8, 'a') (9, 'g') (10, '\n') (11, 'b') (12, 'i') (13, 'g') (14, '\n') (15, 'a')
(16, 'p') (17, 'p') (18, 'l') (19, 'e') 

# 分组
regex = re.compile('(b\w+)')
result = regex.match(s)
print(type(result))
print(1, 'match', result.groups())

result = regex.search(s, 1)
print(2, 'search', result.groups())

# 命名分组
regex = re.compile('(b\w+)\n(?P<name2>b\w+)\n(?P<name3>b\w+)')
# 这里配置的是bottle\nbag\nbig
result = regex.match(s)
print(3, 'match', result)
print(4, result.group(3), result.group(2), result.group(1))
# group()中的数字指返回匹配到的组中的第几个元素，切记匹配到的内容一定是在组中的
print(5, result.group(0).encode()) # 0 返回整个匹配字符串
print(6, result.group('name2'), result.group('name3'))
print(6, result.groups())
# 输出：('bottle', 'bag', 'big')，匹配到的内容会被组成一个元组
print(7, result.groupdict())
# 因为匹配的是bottle\nbag\nbig，name2组匹配到的是bag，所以输出：{'name2': 'bag', 'name3': 'big'}

result = regex.findall(s)
for x in result:
    print(type(x), x)

regex = re.compile('(?P<head>b\w+)')
result = regex.finditer(s)
for x in result:
    print(type(x), x, x.group(), x.group('head'))
```



#### 练习

##### 匹配邮箱地址

```python
test@hot-mail.com
v-ip@magedu.com
web.manager@magedu.com.cn
super.user@google.com
a@w-a-com

参考：
\w+[-.\w]*@[\w-]+(\.[\w-]+)+
```



##### 匹配html标记内的内容

```python
<a href='http://www.magedu.com/index.html' target='_blank'>马哥教育</a>

参考：
<[^<>]+>(.*)<[^<>]+>
如果要匹配标记a
<(\w+)\s+[^<>]+>(.*)(</\1>)
```



##### 匹配URL

```python
http://www.magedu.com/index.html
https://login.magedu.com
file:///etc/sysconfig/network
    
参考：
(\w+)://([^\s]+)
```



##### 匹配二代中国身份证ID

```python
321105700101003
321105710010100030
11210020181239101X
17位数字+1位校验码组成
前6位地址码，8位出生年月，3位数字，1位校验位（0-9或X）

参考：
\d{17}[0-9xX]|\d{15}
```



##### 判断密码强弱

```python
要求密码必须邮10-15位指定字符组成：
十进制数字
大写字母
小写字母
下划线
要求四种类型的字符都要出现才算合法的强密码

例如：Aatb32_67mnq，其中包含大写字母、小写字母、数字和下划线，是合格的强密码

参考：
Aatb32_67mnq
Aatb32_67m.nq
中国是一个伟大的国家aA_8
10-15位，其中包含大写字母、小写字母、数字和下划线
^\w{10,15}$
如果测试有不可见字符干扰使用^\w{10,15}\r?$
看似正确，但是，如果密码有中文呢？
^[a-zA-Z0-9_]{10,15}$

但是还是没有解决类似于1111111111112这种密码的问题，如何解决？
需要用到一些非正则表达式的手段。
利用判断来解决，思路如下：
1. 可以判断当前密码字符串中是否有\W，如果出现就说明一定不是合法的，如果不出现说明合法
2. 对合法继续判断，如果出现过_下划线，说明有可能是强密码，但是没有下划线说明一定不是强密码
3. 对包含下划线的合法密码字符串继续判断，如果出现过\d的，说明有可能是强密码，没有出现\d的一定不是强密码
4. 对上一次的包含下划线、数字的合法的密码字符串继续判断，如果出现了[A-Z]说明有可能是强密码，没有出现[A-Z]说明一定不是强密码
5. 对上一次包含下划线、数字、大写字母的合法密码字符串继续判断，如果出现了[a-z]说明就是强密码，找到了，没有出现小写字母就一定不是强密码
请注意上面的判断的顺序，应该是概率上最可能不出在密码字符串的先判断
```



##### 单词统计word count

```python
对sample文件进行单词统计，要求使用正则表达式

参考：
from collections import defaultdict
import re

def makekey2(line:str, chars=set("""!'"#./\()[],*- \r\n""")):
    start = 0
    
    for i,c in enuerate(line):
        if c in chars:
            if start == i: # 如果紧挨着还是特殊字符，start一定等于i
                start += 1 # 加1并continue
                continue
            yield line[start:i]
            start = i + 1 # 加1是跳过这个不需要的特殊字符c
    else:
        if start < len(line): # 小于，说明还有有效的字符，而且一直到末尾
            yield line[start:]
# """\\host\mount splitext('.cshrc splitdrive("//host/computer/dir . abc path `s\r\n`"))"""

regex = re.compile('[^\w]+')

def makekey3(line:str):
    for word in regex.split(line):
        if len(word):
            yield word
            
def wordcount(filename, encoding='utf8', ignore=set()):
    d = defaultdict(lambda:0)
    with open(filename, encoding=encoding) as f:
        for line in f:
            for word in map(str.lower, makekey2(line)):
                if word not in ignore:
                    d[word] += 1
    return d

def top(d:dict, n=10):
    for i,(k,v) in enumerate(sorted(d.items(),key=lambda item: item[1],reverse=True)):
        if i > n:
            break
        print(k,v)
        
# 单词统计前几名
top(wordcount('sample',ignore={'the','a'}))
```



#### 实例

```python
from collections import defaultdict

d = defaultdict(lambda :0)   # defaultdict是缺省字典，字典默认返回0
# s = '''os.path([path])   sub-path.'''
s1 = '''r'\\host\mount splitext('.cshrc splitdrive("//host/computer/dir . abc.'''
lst = re.split('[^-\w]+', s)   # 以非字母、数字及-的内容为分隔符。单词处理就用这种方法
print(lst)

with open('xxx') as f:
    for line in f:
        for sub in re.split('[^-\w]+', line):
            if len(sub) > 0:
                d[sub] += 1   
# 因为s1字符串被切割后会有空，所以这里判断，如果切割后的字符量大于0，就加1
```

