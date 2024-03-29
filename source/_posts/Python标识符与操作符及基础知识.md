---
title: Python标识符与操作符及基础知识
date: 2018-09-05 16:46:25
tags: python
categories: python
---

# 概念

## 编程基础

- 计算机语言
  - 人与计算机之间交互的语言
- 机器语言
  - 一定位数组成二进制的0和1的序列，称为机器指令。机器指令的集合就是机器语言
  - 与自然语言差异太大，难学、难懂、难写、难记、难查错
- 汇编语言
  - 用一些助记符号替代机器指令，称为汇编语言。ADD A,B指的是将寄存器A的数与寄存器B的数相加得到的数放到寄存器A中
  - 汇编语言写好的程序需要汇编程序转换成机器指令
  - 汇编语言只是稍微好记了些，可以认为就是机器指令对应的助记符。只是符号本身接近自然语言



## 语言分类

- 低级语言
  - 面向机器的语言，包括机器语言、汇编语言
  - 不同的机器不能通用，不同的机器需要不同的机器指令或者汇编程序
- 高级语言
  - 接近自然语言和数学语言的计算机语言
  - 高级语言首先要书写源程序，通过编译程序把源程序转换成机器指令的程序
  - 1954年正式发布的Fortran语言是最早的高级语言，本意是公式翻译
  - 人们只需要关心怎么书写源程序，针对不同机器的编译的事 交给编译器关心处理



## 低级语言到高级语言

- 语言越高级，越接近人类的自然语言和数学语言
- 语言越低级，越能让机器理解
- 高级语言和低级语言之间需要一个转换的工具：编译器、解释器
- C、C++等语言的源代码需要本地编译
- Java、Python、C#的源代码需要被解释器编译成中间代码(Bytecode)，在虚拟机上运行
- 编译语言，把源代码转换成目标机器的CPU指令
- 解释语言，解释后转换成字节码，运行在虚拟机上，解释器执行中间代码



## 高级语言的发展

- 非结构化语言
  - 编号或标签、GOTO、子程序可以有多个入口和出口
  - 有分支、循环
- 结构化语言
  - 任何基本结构只允许是唯一入口和唯一出口
  - 顺序、分支、循环，废弃GOTO
- 面向对象语言
  - 更加接近人类认知世界的方式，万事万物抽象成对象，对象间关系抽象成类和继承
  - 封装、继承、多态
- 函数式语言
  - 古老的编程范式，应用在数学计算、并行处理的场景。引入到了很多现代高级语言中
  - 函数是"一等公民"，高阶函数



## 程序Program

- 程序
  - 算法 + 数据结构 = 程序
  - 数据是一切程序的核心
  - 数据结构是数据在计算机中的类型和组织方式
  - 算法是处理数据的方式，算法有优劣之分
- 写程序难点
  - 理不清数据
  - 搞不清处理方法
  - 无法把数据设计转换成数据结构，无法把处理方法转换成算法
  - 无法用设计范式来进行程序设计
  - 世间程序皆有bug，但不会debug



## Python解释器

- 官方CPython
  - C语言开发，最广泛的Python解释器
- IPython
  - 一个交互式、功能增强的CPython
- PyPy
  - Python语言写的Python解释器，JIT技术，动态编译Python代码。JIT指动态编译，实时编译，动态优化。
- Jython
  - Python的源代码编译成Java的字节码，跑在JVM上
- IronPython
  - 与Jython类似，运行在.Net平台上的解释器，Python代码被编译成.Net的字节码



## Python的语言类型

python是动态语言、强类型语言

- 静态编译语言

  - 事先声明变量类型，类型不能再改变

  - 编译时检查

- 动态编译语言

  - 不用事先声明类型，随时可以赋值为其他类型

  - 编程时不知道是什么类型，很难推断

  - 动态编译语言需要先编译成自解码，再给本地CPU执行代码

- 强类型语言
  - 不同类型之间操作，必须先强制类型转换为同一类型。print('a'+1)是不能执行的

- 弱类型语言
  - 不同类型间可以操作，自动隐式转换，JavaScript中console.log(1+'a')可以执行



# 基础语法

- 注释：python中单行注释采用 # 开头。
  - python 中多行注释使用三个单引号(''')或三个双引号(""")。
- 数字

  - 整数，不区分long和int。
    - 进制有二进制，八进制，十六进制，如：0xa、0o10、0b10。bool布尔值有两个True、False

  - 浮点数
    - 1.2、3.1415、-0.12、1.46e9等价于1.46*10的9次方

  - 复数
    - 1+2j
- 字符串
  - 使用 ' " 单双引号引用的字符的序列
  - '''和"""单双三引号，可以跨行、可以在其中自由的使用单双引号
  - 在字符串前面加上r或者R前缀，表示该字符串不做特殊的处理
  - 字符串或串(String)是由数字、字母、下划线组成的一串字符。
- 转义序列

  - \\\    \t     \r     \n     \\'     \\"

  - 前缀r，把里面的所有字符当普通字符对待
- 缩进

  -  未使用C等语言的花括号，而是采用缩进的方式表示层次关系
  - 约定使用4个空格缩进
- 续行
  - 在行尾使用 \
  - 如果使用各种括号，认为括号内是一个整体，内部跨行不用 \

- 标识符
  - 一个名字，用来指化一个值
  - 只能用字母、下划线和数字
  - 只能以字母或下划线开头
  - 不能是python的关键字，例如def、class就不能作为标识符
  - Python是大小写敏感的
  - 约定：不允许使用中文；不允许使用歧义单词，例如class_；在python中不要随便使用下划线开头的表示符

- 常量
  - 一旦赋值就不能改变值的标识符
  - python中无法定义常量
- 字面常量
  - 一个单独的量，例如12、"abc"、'242356613.03e-9'
- 变量
  - 赋值后，可以改变值的标识符


## 运算符

### 算术运算符

以下假设变量： **a=10，b=20**：

| 运算符 | 描述                                            | 实例                                               |
| ------ | ----------------------------------------------- | -------------------------------------------------- |
| +      | 加 - 两个对象相加                               | a + b 输出结果 30                                  |
| -      | 减 - 得到负数或是一个数减去另一个数             | a - b 输出结果 -10                                 |
| *      | 乘 - 两个数相乘或是返回一个被重复若干次的字符串 | a * b 输出结果 200                                 |
| /      | 除 - x除以y                                     | b / a 输出结果 2                                   |
| %      | 取模 - 返回除法的余数                           | b % a 输出结果 0                                   |
| **     | 幂 - 返回x的y次幂                               | a**b 为10的20次方， 输出结果 100000000000000000000 |
| //     | 取整除 - 返回商的整数部分（**向下取整**）       | 9//2 输出结果 4 , 9.0//2.0 输出结果 4.0            |



### 位(bit)运算符

按位运算符是把数字看作二进制来进行计算的。Python中的按位运算法则如下：

下表中变量 a 为 60，b 为 13，二进制格式如下：

```
a = 0011 1100

b = 0000 1101

-----------------

a&b = 0000 1100

a|b = 0011 1101

a^b = 0011 0001

~a  = 1100 0011
```

| 运算符 | 描述                                                         | 实例                                                         |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| &      | 按位与运算符：参与运算的两个值,如果两个相应位都为1,则该位的结果为1,否则为0 | (a & b) 输出结果 12 ，二进制解释： 0000 1100                 |
| \|     | 按位或运算符：只要对应的二个二进位有一个为1时，结果位就为1。 | (a \| b) 输出结果 61 ，二进制解释： 0011 1101                |
| ^      | 按位异或运算符：当两对应的二进位相异时，结果为1              | (a ^ b) 输出结果 49 ，二进制解释： 0011 0001                 |
| ~      | 按位取反运算符：对数据的每个二进制位取反,即把1变为0,把0变为1 。~x 类似于 -x-1 | (~a ) 输出结果 -61 ，二进制解释： 1100 0011，在一个有符号二进制数的补码形式。 |
| <<     | 左移动运算符：运算数的各二进位全部左移若干位，由 << 右边的数字指定了移动的位数，高位丢弃，低位补0。 | a << 2 输出结果 240 ，二进制解释： 1111 0000                 |
| >>     | 右移动运算符：把">>"左边的运算数的各二进位全部右移若干位，>> 右边的数字指定了移动的位数 | a >> 2 输出结果 15 ，二进制解释： 0000 1111                  |

#### 原码、反码、补码，负数表示法

- 原码：正数是其二进制本身；负数是符号位为1,数值部分取X绝对值的二进制。

- 反码：正数的反码和原码相同；负数是符号位为1,其它位是原码取反。

- 补码：正数的补码和原码，反码相同；负数是符号位为1，其它位是原码取反，未位加1。（或者说负数的补码是其绝对值反码未位加1）

- 移码：将符号位取反的补码（不区分正负）

| 编码 | 10810（sbyte） | -10810（sbyte） |
| ---- | -------------- | --------------- |
| 原码 | **0**1101100   | **1**1101100    |
| 反码 | **0**1101100   | **1**0010011    |
| 补码 | **0**1101100   | **1**0010100    |
| 移码 | **1**1101100   | **0**0010100    |

注：这里的原码、反码、补码表示计算机在存储数据时形式。



### 比较运算符

以下假设变量a为10，变量b为20：

| 运算符 | 描述                                                         | 实例                                     |
| ------ | ------------------------------------------------------------ | ---------------------------------------- |
| ==     | 等于 - 比较对象是否相等                                      | (a == b) 返回 False。                    |
| !=     | 不等于 - 比较两个对象是否不相等                              | (a != b) 返回 true.                      |
| <>     | 不等于 - 比较两个对象是否不相等                              | (a <> b) 返回 true。这个运算符类似 != 。 |
| >      | 大于 - 返回x是否大于y                                        | (a > b) 返回 False。                     |
| <      | 小于 - 返回x是否小于y。所有比较运算符返回1表示真，返回0表示假。这分别与特殊的变量True和False等价。 | (a < b) 返回 true。                      |
| >=     | 大于等于	- 返回x是否大于等于y。                           | (a >= b) 返回 False。                    |
| <=     | 小于等于 -	返回x是否小于等于y。                           | (a <= b) 返回 true。                     |



### 逻辑运算符

Python语言支持逻辑运算符，以下假设变量 a 为 10, b为 20:

| 运算符 | 逻辑表达式 | 描述                                                         | 实例                    |
| ------ | ---------- | ------------------------------------------------------------ | ----------------------- |
| and    | x and y    | 布尔"与" - 如果 x 为 False，x and y 返回 False，否则它返回 y 的计算值。 | (a and b) 返回 20。     |
| or     | x or y     | 布尔"或"	- 如果 x 是非 0，它返回 x 的值，否则它返回 y 的计算值。 | (a or b) 返回 10。      |
| not    | not x      | 布尔"非" - 如果 x 为 True，返回 False 。如果 x 为 False，它返回 True。 | not(a and b) 返回 False |



### 赋值运算符

以下假设变量a为10，变量b为20：

| 运算符 | 描述             | 实例                                  |
| ------ | ---------------- | ------------------------------------- |
| =      | 简单的赋值运算符 | c = a + b 将 a + b 的运算结果赋值为 c |
| +=     | 加法赋值运算符   | c += a 等效于 c = c + a               |
| -=     | 减法赋值运算符   | c -= a 等效于 c = c - a               |
| *=     | 乘法赋值运算符   | c *= a 等效于 c = c * a               |
| /=     | 除法赋值运算符   | c /= a 等效于 c = c / a               |
| %=     | 取模赋值运算符   | c %= a 等效于 c = c % a               |
| **=    | 幂赋值运算符     | c **= a 等效于 c = c ** a             |
| //=    | 取整除赋值运算符 | c //= a 等效于 c = c // a             |



### 成员运算符

除了以上的一些运算符之外，Python还支持成员运算符，测试实例中包含了一系列的成员，包括字符串，列表或元组。

| 运算符 | 描述                                                    | 实例                                              |
| ------ | ------------------------------------------------------- | ------------------------------------------------- |
| in     | 如果在指定的序列中找到值返回 True，否则返回 False。     | x 在 y 序列中 , 如果 x 在 y 序列中返回 True。     |
| not in | 如果在指定的序列中没有找到值返回 True，否则返回 False。 | x 不在 y 序列中 , 如果 x 不在 y 序列中返回 True。 |



### 身份运算符

身份运算符用于比较两个对象的存储单元

| 运算符 | 描述                                        | 实例                                                         |
| ------ | ------------------------------------------- | ------------------------------------------------------------ |
| is     | is 是判断两个标识符是不是引用自一个对象     | **x is y**, 类似 **id(x) == id(y)** , 如果引用的是同一个对象则返回 True，否则返回 False |
| is not | is not 是判断两个标识符是不是引用自不同对象 | **x is not y** ， 类似 **id(a) != id(b)**。如果引用的不是同一个对象则返回结果 True，否则返回 False。 |

**注：** [id()](https://www.runoob.com/python/python-func-id.html) 函数用于获取对象内存地址。

is 与 == 区别：

is 用于判断两个变量引用对象是否为同一个， == 用于判断引用变量的值是否相等。

```python
>>> a = [1, 2, 3]
>>> b = a
>>> b is a 
True
>>> b == a
True
>>> b = a[:]
>>> b is a
False
>>> b == a
True
```



### 运算符的优先级

- 算术运算符 > 位运算符 > 身份运算符 > 成员运算符 > 逻辑运算符
- 记不住，用括号
- 长表达式，多用括号，易懂、易读

以下表格列出了从最高到最低优先级的所有运算符：

| 运算符                   | 描述                                                   |
| ------------------------ | ------------------------------------------------------ |
| **                       | 指数 (最高优先级)                                      |
| ~ + -                    | 按位翻转, 一元加号和减号 (最后两个的方法名为 +@ 和 -@) |
| * / % //                 | 乘，除，取模和取整除                                   |
| + -                      | 加法减法                                               |
| >> <<                    | 右移，左移运算符                                       |
| &                        | 位 'AND'                                               |
| ^\|                      | 位运算符                                               |
| <= < > >=                | 比较运算符                                             |
| <> == !=                 | 等于运算符                                             |
| = %= /= //= -= += *= **= | 赋值运算符                                             |
| is is not                | 身份运算符                                             |
| in not in                | 成员运算符                                             |
| not and or               | 逻辑运算符                                             |



## Python保留字符

下面的列表显示了在Python中的保留字。这些保留字不能用作常数或变数，或任何其他标识符名称。

所有Python的关键字只包含小写字母。

| and      | exec    | not    |
| -------- | ------- | ------ |
| assert   | finally | or     |
| break    | for     | pass   |
| class    | from    | print  |
| continue | global  | raise  |
| def      | if      | return |
| del      | import  | try    |
| elif     | in      | while  |
| else     | is      | with   |
| except   | lambda  | yield  |



## 表达式

- 由数字、符号、括号、变量等的组合
  - 算术表达式
  - 逻辑表达式
  - 赋值表达式
    - python中，赋值即定义，如果一个变量已经定义，赋值相当于重新定义



# 练习

1. 计算~12

这是对12取反，首先，12保存到计算机中时要转为二进制，也就是0000 1100，按题目要求对12取反后，得到1111 0011，取反后的数是计算机使用的，如果要给人看还要将此数转换为十进制数，又因为取反后的最高位是1，表示这是一个负数，负数保存到计算机中时使用的是取反的二进制数或说是二进制数的补数，在计算机中保存的是数字的补数，所以转换为十进制时也要取这个二进制数的补数。这里取1111 0011的补数是1000 1101，也就是-13了。

```shell
# -1的补码如下
1000 0001      # 原码
1111 1110 + 1 = 1111 1111       # 负数的补码是最高位不变，其余位取反，最后再加1，所以是1111 1111，内存中是0xff
0000 0101     # 这是5，和上面的1111 1111相与得到下面
0000 0100 
# 这里用原码的5与补码的1计算，用二进制的5最后的1先与正面的1111 1111相加，得到1 0000 0000，最前面的1溢出了，所以抛弃，得到0000 0000。之后就变成了二进制的0000 0100 + 0000 0000，也就是4了。

# 12取反如下
0000 1100      # 这是12
1111 0011       # 这是取反，这是计算机存储的值，也是给计算机看的，如果要给人看，还要将其转为原码。因为计算机中要存补码，所以这个数在计算机看来就是补码，要转为原码才是给人看的，补码的补码就是原码，所以要求这个数的补码。
1000 1101       # 这是上面数字的补码，转为原码时最高位不变，之后按位取反再加1。所以12取反是-13
# 正数的补码还是正数本身，所以不会变。负数的补码要转换为原码时，要按上面的方法求补码的补码
# 1. 计算机中存储的只会是补码
# 2. 正数的补码还是正数本身，负数的补码最高位不变，其余位按位取反再加1
# 3. 计算机中存储的负数要显示出来时，要按负数的补码求一次才是要显示的内容
```





# 附录

## 为何要使用原码, 反码和补码

在开始深入学习前，我的学习建议是先"死记硬背"上面的原码，反码和补码的表示方式以及计算方法。现在我们知道了计算机可以有三种编码方式表示一个数。对于正数因为三种编码方式的结果都相同：

[+1] = [00000001]原 = [00000001]反 = [00000001]补

所以不需要过多解释. 但是对于负数:

[-1] = [10000001]原= [11111110]反= [11111111]补

可见原码，反码和补码是完全不同的。既然原码才是被人脑直接识别并用于计算表示方式，为何还会有反码和补码呢？

首先，因为人脑可以知道第一位是符号位，在计算的时候我们会根据符号位，选择对真值区域的加减。（补码的绝对值称为真值即去掉符号位的二进制数字）。但是对于计算机，加减乘除已经是最基础的运算，要设计的尽量简单。计算机辨别“符号位”显然会让计算机的基础电路设计变得十分复杂！于是人们想出了将符号位也参与运算的方法。我们知道，根据运算法则减去一个正数等于加上一个负数，即：1-1 = 1 + (-1) = 0 ，所以机器可以只有加法而没有减法，这样计算机运算的设计就更简单了。

于是人们开始探索将符号位参与运算，并且只保留加法的方法。首先来看原码：

计算十进制的表达式：1-1=0

1 - 1 = 1 + (-1) = [00000001]原 + [10000001]原= [10000010]原 = -2

如果用原码表示，让符号位也参与计算，显然对于减法来说，结果是不正确的。这也就是为何计算机内部不使用原码表示一个数。

为了解决原码做减法的问题，出现了反码：

计算十进制的表达式：1-1=0

1 - 1 = 1 + (-1) = [0000 0001]原 + [1000 0001]原= [0000 0001]反+ [1111 1110]反= [1111 1111]反= [1000 0000]原= -0

发现用反码计算减法，结果的真值部分是正确的。而唯一的问题其实就出现在"0"这个特殊的数值上。虽然人们理解上+0和-0是一样的，但是0带符号是没有任何意义的。而且会有[0000 0000]原和[1000 0000]原两个编码表示0。

于是补码的出现，解决了0的符号以及两个编码的问题：

1-1 = 1 + (-1) = [0000 0001]原 + [1000 0001]原 = [0000 0001]补+ [1111 1111]补= [0000 0000]补=[0000 0000]原

这样0用[0000 0000]表示，而以前出现问题的-0则不存在了。而且可以用[1000 0000]表示-128：

(-1) + (-127) = [1000 0001]原 + [1111 1111]原 = [1111 1111]补+ [1000 0001]补= [1000 0000]补

-1-127的结果应该是-128，在用补码运算的结果中，[1000 0000]补就是-128。但是注意因为实际上是使用以前的-0的补码来表示-128，所以-128并没有原码和反码表示。（对-128的补码表示[1000 0000]补算出来的原码是[0000 0000]原，这是不正确的）

使用补码，不仅仅修复了0的符号以及存在两个编码的问题，而且还能够多表示一个最低数。这就是为什么8位二进制，使用原码或反码表示的范围为[-127, +127]，而使用补码表示的范围为[-128, 127]。

因为机器使用补码，所以对于编程中常用到的32位int类型，可以表示范围是：[-231, 231-1] 因为第一位表示的是符号位。而使用补码表示时又可以多保存一个最小值。



## 比特和字节

Bit，比特，也叫二进制位，是信息的最小单位。一个比特可以理解为一个开关量，0就是关，1就是开。
Byte，字节，由8个Bit组成。它通常用作计算机信息计量单位。字节在一些规范中称作Octet。
Bit简写为b，Byte简写为B。

## 字节的进制

字节一般以1024(2^10)为进制，目前常用的进制如下。

```
1byte=8bit	//bit就是位，也叫比特位，是计算机表示数据最小的单位
1B(byte字节)	//byte就是字节
1KB(Kilobyte千) = 2^10 B = 1024 B
1MB(Megabyte兆) = 2^10 KB = 1024 KB = 2^20 B
1GB(Gigabyte吉) = 2^10 MB = 1024 MB = 2^30 B
1TB(Trillionbyte太) = 2^10 GB = 1024 GB = 2^40 B
1PB(Petabyte拍) = 2^10 TB = 1024 TB = 2^50 B
1EB(Exabyte艾) = 2^10 PB = 1024 PB = 2^60 B
1ZB(Zettabyte泽) = 2^10 EB = 1024 EB = 2^70 B
1YB(YottaByte尧) = 2^10 ZB = 1024 ZB = 2^80 B
1BB(Brontobyte) = 2^10 YB = 1024 YB = 2^90 B
1NB(NonaByte) = 2^10 BB = 1024 BB = 2^100 B
1DB(DoggaByte) = 2^10 NB = 1024 NB = 2^110 B
```

## 容易混淆的情景

**情景1** 看各种协议时，要看清楚是比特还是字节
例：以太帧格式与IPv4包格式。

![](https://raw.githubusercontent.com/higoge/image/master/basic01/01.png)

![](https://raw.githubusercontent.com/higoge/image/master/basic01/02.png)

以太帧格式直接用字节(octet)进行展示，而IP包则采用比特表进行展示。实际读文档的过程中，一定要看仔细是比特还是字节。

**情况2** 硬盘容量
涉及到硬盘、文件等存储类的信息，都以字节为单位。
例：买了2T的硬盘，为毛放到计算机上少了那么多？
因为硬盘的进制是1000，2TB的硬盘，实际是2000GB，以此类推。计算机统计的进制是采用1024。
所以，2TB实际容量是2*1000^4/1024^4，约为1.189T(1862G，这一换算直接少了140G啊)。

**情况3** 网络带宽
网络带宽统计的是比特，所以也叫比特率，单位表示一般用Mbps，Gbps。其进制也不是1024，而是1000。即1Kbps=1000bps 1Mbps=1000Kbps 1Gbps=1000Mbps，以此类推。
例：家里面宽带是4兆的，最高的下载速度能达到多少？
答：因为网络带宽统计的是比特，而下载统计的是字节，所以换算时有8的除法。即4Mbps/8=0.5MBps=500KBps。所以下载速度最高不超过500K。
从最早的下载软件网络蚂蚁(NetAnt)，到后来的FlashGet，迅雷等，都采用的Bps为下载单位，因为下载的是文件，使用存储单位。

有时候，为了不引起歧义，将1024进制用特殊方式单独表示，称为Mebibyte或Megabyte。

```
1KiB = 1024 Byte
1MiB = 1024 KiB = 1024^2 Byte
1GiB = 1024 MiB = 1048576 (1024^2)KiB
1TiB = 1024 GiB = 1073741824 (1024^3)KiB
```



## 总结

1. 比特和字节，1000进制还是1024进制较为容易混淆。
2. 在计算机科学领域采用1024进制，在信息技术领域，采用1000进制。
3. 1024进制在单位上加字母i进行单独表示。



参考：https://www.jianshu.com/p/abbdae4f3841

参考：https://higoge.github.io/2015/06/23/basic01/