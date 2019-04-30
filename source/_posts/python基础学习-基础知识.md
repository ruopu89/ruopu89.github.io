---
title: python基础学习-基础知识
date: 2019-03-20 09:04:26
tags: python基础知识
categories: python
---

### 概念

#### 算法

> 算法是流程或菜谱的时髦说法，详尽地描述了如何完成某项任务。算法由对象（原料）和语句（操作说明）组成。从本质上说，编写计算机程序就是使用计算机能够理解的语言(如Python)描述一种算法。这种对机器友好的描述被称为程序，主要由表达式和语句组成。



#### 表达式

> 表达式为程序的一部分，结果为一个值。例如：2 + 2就是一个表达式，结果为4 。简单表达式是使用运算符(如+或% )和函数(如pow)将字面值(如2或"Hello" )组合起来得到的。通过组合简单的表达式，可创建复杂的表达式，如(2 + 2) *(3 - 1)。表达式还可能包含变量。
>
> 圆整，是科技术语，通常理解为因满足某种要求而进行的数据修正。按照修正后的数据在数值上是否比原数据大，又可分为向上圆整和向下圆整。
>
> 整除符号：//，当结果为整数时向下圆整，如：10 // 3。如果余数为0，就不会向下圆整了，如：9 // 3。

```python
>>> 10 % 3
1
>>> 10 % -3
-2
>>> -10 % 3
2
>>> -10 % -3
-1
>>> 10 // 3
3
>>> 10 // -3
-4
>>> -10 // 3
-4
>>> -10 // -3
3
# 对于整数运算，结果是向下圆整的。在结果是负数时，圆整后将离0更远。
```



#### 变量

> 变量是表示值的名称。通过赋值,可将新值赋给变量,如x = 2。赋值是一种语句。
>
> 使用python变量前必须给它赋值，因此python变量没有默认值。在python中，名称（标识符）只能由字母、数字和下划线(_)构成，且不能以数字开头。最好也不要以下划线开头。



#### 语句

> 语句是让计算机执行特定操作的指示。这种操作可能是修改变量(通过赋值) 、将信息打印到屏幕上(如print("Hello, world!"))、导入模块或执行众多其他任务。
>
> 表达式是一些东西，而语句是一些事情。上面介绍的都是表达式。如表达式：2 * 2，语句：print(2 * 2)
>
> 语句的特征是执行修改操作。赋值语句可以改变变量，print语句改变屏幕的外观。

```python
>>> x = input("x: ")
x: 34
>>> y = input("y: ")
y: 42
>>> print(int(x) * int(y))
1428
# int可以将字符串转换为整数。
```



#### 函数

> Python函数类似于数学函数，它们可以接受参数，并返回结果。函数犹如小型程序，可用来执行特定的操作。通常将标准函数称为内置函数。使用函数称为调用函数，可以向函数提供实参，之后函数返回一个值。因为函数调用返回一个值，因此它们也是表达式。可以结合使用函数调用和运算符来编写更复杂的表达式。

```python
>>> 2 ** 3
8
>>> pow(2,3)
8
# pow函数是计算幂运算的。
>>> 10 + pow(2,3*5) / 3.0
10932.6666666

>>> abs(-10)
# abs函数计算绝对值

>>> round(2 / 3)
# round将浮点数圆整为与之最接近的整数。
# 整数总是向下圆整，而round圆整到最接近的整数，并在两个整数一样近时圆整到偶数。
```



#### 模块

> 模块是扩展，可通过导入它们来扩展Python的功能。例如：模块math包含多个很有用的函数。

```python
>>> import math
>>> math.floor(32.9)
32
# 使用import导入模块，再以module.function的方式使用模块中的函数。floor函数与上面的round函数相反，可以将浮点数向下圆整

>>> math.ceil(32.3)
33
>>> math.ceil(32)
32
# ceil与floor相反，返回大于或等于给定数的最小整数。

>>> from math import sqrt
>>> sqrt(9)
3.0
# sqrt函数用于计算平方根。如果确定不会从不同模块导入多个同名函数，可使用from math import function的方法调用函数，之后就不用再指定模块前缀了。一般还是不使用此种方法，容易出现无法使用常规函数的问题

>>> import math
>>> foo = math.sqrt
>>> foo(4)
# 可以将函数赋值给变量，之后变量就有了函数的功能

>>> from math import sqrt
>>> sqrt(-1)
nan
# nan具有特殊含义，指的是"非数值"(not a number)。
# 如果将值域限定为实数，并使用其近似的浮点数实现，就无法计算负数的平方根。负数的平方根是虚数，而由实部和虚部组成的数为复数

>>> import cmath
>>> cmath.sqrt(-1)
1j
# 1j是个虚数，虚数都以j（或J）结尾。复数算术运算都基于如下定义：-1的平方根为1j。

>>> (1 + 3j) * (9 + 4j)
(-3 + 31j)
# python提供了对复数的支持。
# python没有专门表示虚数的类型，而将虚数视为实部为零的复数。
```



#### 字符串

> 字符串的主要用途是表示一段文本。在Python 3中，所有的字符串都是Unicode字符串。

```python
>>> "Let's go!"
"Let's go!"
# 这里用了一个单引号，因此不能用单引号再将整个字符串括起，否则解释器将报错。如下：
>>> 'Let's go!'
SyntaxError: invalid syntax

>>> '"Hello, world!" she said'
'"Hello, world!" she said'
# 因为字符串包含双引号，因此必须使用单引号将整个字符串括起

>>> 'Let\'s go!'
"Let's go!"
# 可使用反斜杠( \ )对引号进行转义
>>> "\"Hello, world!\" she said"
'"Hello, world!" she said'

>>> "Let's say " '"Hello, world!"'
'Let\'s say "Hello, world!"'
# Python可以自动将字符串拼接起来
>>> "Hello, " + "world!"
'Hello, world!'
>>> x = "Hello, "
>>> y = "world!"
>>> x + y
'Hello, world!'
# 拼接字符串的方法

>>> print('''This is a very long string. It continues here.
And it's not over yet. "Hello, world!"
Still here.''')
# 表示长字符串时可以使用三个单引号或三个双引号，这让解释器能够识别表示字符串开始和结束位置的引号，因此字符串本身可包含单引号和双引号，无需使用反斜杠进行转义。

>>> 1 + 2 + \
4 + 5
12
>>> print \
('Hello, world')
Hello, world
# 常规字符串也可横跨多行。只要在行尾加上反斜杠,反斜杠和换行符将被转义,即被忽略。

>>> print(r'C:\nowhere')
C:\nowhere
>>> print(r'C:\Program Files\fnord\foo\bar\baz\frozz\bozz')
C:\Program Files\fnord\foo\bar\baz\frozz\bozz
# 原始字符串用前缀r表示。看起来可在原始字符串中包含任何字符，这大致是正确的。一个例外是，引号需要像通常那样进行转义，但这意味着用于执行转义的反斜杠也将包含在最终的字符串中。如下：
>>> print(r'Let\'s go!')
Let\'s go!

>>> print(r"This is illegal\")
SyntaxError: EOL while scanning string literal
# 原始字符串不能以单个反斜杠结尾。除非你对其进行转义(但进行转义时,用于转义的反斜杠也将是字符串的一部分) 。
>>> print(r'C:\Program Files\foo\bar' '\\')
C:\Program Files\foo\bar\
# 可以将反斜杠单独作为一个字符串
```



#### 函数表



| 函数                              | 描述                                                         |
| :-------------------------------- | :----------------------------------------------------------- |
| abs(number)                       | 返回指定数的绝对值                                           |
| bytes(string, encoding[, errors]) | 对指定的字符串进行编码，并以指定的方式处理错误               |
| cmath.sqrt(number)                | 返回平方根；可用于负数                                       |
| float(object)                     | 将数字转换为浮点数                                           |
| help([object])                    | 提供交互式帮助                                               |
| input(prompt)                     | 以字符串的方式获取用户输入                                   |
| int(object)                       | 将字符串或数转换为整数                                       |
| math.ceil(number)                 | 以浮点数的方式返回向上圆整的结果                             |
| math.floor(number)                | 以浮点数的方式返回向下圆整的结果                             |
| math.sqrt(number)                 | 返回平方根；不能用于负数                                     |
| pow(x, y[, z])                    | 返回x的y次方对z求模的结果                                    |
| print(object, ...)                | 将提供的实参打印出来,并用空格分隔                            |
| repr(object)                      | 返回指定值的字符串表示                                       |
| round(number[, ndigits])          | 四舍五入为指定的精度，正好为5时舍入到偶数                    |
| str(object)                       | 将指定的值转换为字符串。用于转换 bytes 时，可指定编码和错误处理方式 |
| len(seq)                          | 返回序列的长度                                               |
| list(seq)                         | 将序列转换为列表                                             |
| max(args)                         | 返回序列或一组参数中的最大值                                 |
| min(args)                         | 返回序列和一组参数中的最小值                                 |
| reversed(seq)                     | 让你能够反向迭代序列                                         |
| sorted(seq)                       | 返回一个有序列表，其中包含指定序列中的所有元素               |
| tuple(seq)                        | 将序列转换为元组                                             |
| string.capwords(s[, sep])         | 使用split 根据sep拆分s，将每项的首字母大写，再以空格为分隔符将它们合并起来 |
| ascii(obj)                        | 创建指定对象的ASCII表示                                      |
| dict(seq)                         | 从键值对、映射或关键字参数创建字典                           |





