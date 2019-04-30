---
title: python基础学习-使用字符串
date: 2019-03-25 14:28:54
tags: 使用字符串
categories: python
---

### 字符串基本操作

```python
>>> website = 'http://www.python.org'
>>> website[-3:] = 'com'
Traceback (most recent call last):
File "<pyshell#19>", line 1, in ?
website[-3:] = 'com'
TypeError: object doesn't support slice assignment
# 所有标准序列操作(索引、切片、乘法、成员资格检查、长度、最小值和最大值)都适用于字符串，但字符串是不可变的，因此所有的元素赋值和切片赋值都是非法的。
```



### 设置字符串的格式

```python
>>> format = "Hello, %s. %s enough for ya?"
>>> values = ('world', 'Hot')
>>> format % values
'Hello, world. Hot enough for ya?'
# 在%左边指定一个字符串(格式字符串)，并在右边指定要设置其格式的值。指定要设置其格式的值时，可使用单个值(如字符串或数字)，可使用元组(如果要设置多个值的格式)，还可使用字典，其中最常见的是元组。
>>> format = "Hello, %s. %s enough for ya?"
>>> values = ('world', 'Hot')
>>> format % values
'Hello, world. Hot enough for ya?'
# 上述格式字符串中的%s称为转换说明符，指出了要将值插入什么地方。s意味着将值视为字符串进行格式设置。如果指定的值不是字符串，将使用str将其转换为字符串。其他说明符将导致其他形式的转换。例如，%.3f将值的格式设置为包含3位小数的浮点数。

>>> from string import Template
>>> tmpl = Template("Hello, $who! $what enough for ya?")
>>> tmpl.substitute(who="Mars", what="Dusty")
'Hello, Mars! Dusty enough for ya?'
# 包含等号的参数称为关键字参数。在字符串格式设置中，可将关键字参数视为一种向命名替换字段提供值的方式。

>>> "{}, {} and {}".format("first", "second", "third")
'first, second and third'
>>> "{0}, {1} and {2}".format("first", "second", "third")
'first, second and third'
# 在最简单的情况下，替换字段没有名称或将索引用作名称。
>>> "{3} {0} {2} {1} {3} {0}".format("be", "not", "or", "to")
'to be or not to be'
# 索引无需按顺序排列
>>> from math import pi
>>> "{name} is approximately {value:.2f}.".format(value=pi, name="π")
'π is approximately 3.14.'
# 关键字参数的排列顺序无关紧要。在这里，我还指定了格式说明符.2f，并使用冒号将其与字段名隔开。它意味着要使用包含2位小数的浮点数格式。
>>> "{name} is approximately {value}.".format(value=pi, name="π")
'π is approximately 3.141592653589793.'
# 没有指定.2f的结果

>>> from math import e
>>> f"Euler's constant is roughly {e}."
"Euler's constant is roughly 2.718281828459045."
# 如果变量与替换字段同名，可使用f字符串——在字符串前面加上f。创建最终的字符串时,将把替换字段e替换为变量e的值。
>>> "Euler's constant is roughly {e}.".format(e=e)
"Euler's constant is roughly 2.718281828459045."
# 此命令与上面的命令效果是一样的。

>>> "{{ceci n'est pas une replacement field}}".format()
"{ceci n'est pas une replacement field}"
# 要在最终结果中包含花括号，可在格式字符串中使用两个花括号(即{{或 }})来指定。
============================================================================================
在格式字符串中，最激动人心的部分为替换字段。替换字段由如下部分组成，其中每个部分都是可选的。
* 字段名：索引或标识符，指出要设置哪个值的格式并使用结果来替换该字段。除指定值外，还可指定值的特定部分，如列表的元素。
* 转换标志：跟在叹号后面的单个字符。当前支持的字符包括r(表示repr) 、s(表示str)和a(表示ascii)。如果你指定了转换标志，将不使用对象本身的格式设置机制，而是使用指定的函数将对象转换为字符串，再做进一步的格式设置。
* 格式说明符：跟在冒号后面的表达式(这种表达式是使用微型格式指定语言表示的) 。格式说明符让我们能够详细地指定最终的格式，包括格式类型(如字符串、浮点数或十六进制数)，字段宽度和数的精度，如何显示符号和千位分隔符，以及各种对齐和填充方式。
============================================================================================
```



#### 替换字段名

```python
>>> "{foo} {} {bar} {}".format(1, 2, bar=4, foo=3)
'3 1 4 2'
# 还可通过索引来指定要在哪个字段中使用相应的未命名参数，这样可不按顺序使用未命名参数。

>>> "{foo} {} {bar} {}".format(1, 2, bar=4, foo=3)
'3 1 4 2'

>>> "{foo} {1} {bar} {0}".format(1, 2, bar=4, foo=3)
'3 2 4 1'
# 不能同时使用手工编号和自动编号，因为这样很快会变得混乱不堪。

>>> fullname = ["Alfred", "Smoketoomuch"]
>>> "Mr {name[1]}".format(name=fullname)
'Mr Smoketoomuch'
>>> import math
>>> tmpl = "The {mod.__name__} module defines the value {mod.pi} for π"
>>> tmpl.format(mod=math)
'The math module defines the value 3.141592653589793 for π'
```



#### 基本转换

```python
>>> print("{pi!s} {pi!r} {pi!a}".format(pi="π"))
π 'π' '\u03c0'
# 上述三个标志(s、r和a)指定分别使用str、repr和ascii进行转换。函数str通常创建外观普通的字符串版本(这里没有对输入字符串做任何处理)。函数 repr 尝试创建给定值的Python表示(这里是一个字符串字面量)。函数 ascii创建只包含ASCII字符的表示

>>> "The number is {num}".format(num=42)
'The number is 42'
>>> "The number is {num:f}".format(num=42)
'The number is 42.000000'
# 可指定要转换的值是哪种类型，更准确地说，是要将其视为哪种类型。例如，上面命令提供一个整数，但将其作为小数进行处理。为此可在格式说明(即冒号后面)使用字符f(表示定点数) 。

>>> "The number is {num:b}".format(num=42)
'The number is 101010'
# 作为二进制数进行处理

============================================================================================
类型																															含义
b						将整数表示为二进制数
c						将整数解读为Unicode码点
d						将整数视为十进制数进行处理，这是整数默认使用的说明符
e						使用科学表示法来表示小数(用e来表示指数)
E						与e相同，但使用E来表示指数
f						 将小数表示为定点数
F						与 f相同，但对于特殊值(nan和 inf)，使用大写表示
g						自动在定点表示法和科学表示法之间做出选择。这是默认用于小数的说明符，但在默认情况下至少有1
						  位小数
G						与 g相同，但使用大写来表示指数和特殊值
n						与 g相同，但插入随区域而异的数字分隔符
o						将整数表示为八进制数
s						保持字符串的格式不变，这是默认用于字符串的说明符
x						将整数表示为十六进制数并使用小写字母
X						与 x相同，但使用大写字母
%					  将数表示为百分比值(乘以100，按说明符 f设置格式，再在后面加上%)
============================================================================================
```



#### 宽度、精度和千位分隔符

```python
>>> "{num:10}".format(num=3)
'          3'
>>> "{name:10}".format(name="Bob")
'Bob          '
# 宽度是使用整数指定的。数和字符串的对齐方式不同。

>>> "Pi day is {pi:.2f}".format(pi=pi)
'Pi day is 3.14'
# 精度也是使用整数指定的，但需要在它前面加上一个表示小数点的句点。这里显式地指定了类型f，因为默认的精度处理方式稍有不同

>>> "{pi:10.2f}".format(pi=pi)
'          3.14'
# 同时指定宽度和精度

>>> "{:.5}".format("Guido van Rossum")
'Guido'
# 对于其他类型也可指定精度，但是这样做的情形不太常见。

>>> 'One googol is {:,}'.format(10**100)
'One googol is 10,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,00
0,000,000,000,000,000,000,000,000,000,000,000,000,000,000'
# 使用逗号来指出你要添加千位分隔符
```



#### 符号、对齐和用 0 填充

```python
>>> '{:010.2f}'.format(pi)
'0000003.14'
# 在指定宽度和精度的数前面，可添加一个标志。这个标志可以是零、加号、减号或空格，其中零表示使用0来填充数字。
# {:010.2f}指定一共有10位，小数点有两位，前面不足的地方用0填充。

>>> print('{0:<10.2f}\n{0:^10.2f}\n{0:>10.2f}'.format(pi))
3.14
	   3.14
	 		3.14
# 指定左对齐、右对齐和居中，可分别使用<、>和^

>>> "{:$^15}".format(" WIN BIG ")
'$$$ WIN BIG $$$'
# {:$^15}表示一共15位，空格也算，不足的地方用$填充。

>>> print('{0:10.2f}\n{1:10.2f}'.format(pi, -pi))
            3.14
          -3.14
>>> print('{0:10.2f}\n{1:=10.2f}'.format(pi, -pi))
            3.14
-          3.14
# 指定将填充字符放在符号和数字之间。{1:=10.2f}表示索引为1的元素

>>> print('{0:-.2}\n{1:-.2}'.format(pi, -pi)) #默认设置
3.1
-3.1
>>> print('{0:+.2}\n{1:+.2}'.format(pi, -pi))
+3.1
-3.1
>>> print('{0: .2}\n{1: .2}'.format(pi, -pi))
3.1
-3.1
# 要给正数加上符号，可使用说明符+(将其放在对齐说明符后面)，而不是默认的-。如果将符号说明符指定为空格，会在正数前面加上空格而不是+。

>>> "{:b}".format(42)
'101010'
>>> "{:#b}".format(42)
'0b101010'
# 井号( #)选项，可将其放在符号说明符和宽度之间(如果指定了这两种设置)。这个选项将触发另一种转换方式，转换细节随类型而异。例如，对于二进制、八进制和十六进制转换，将加上一个前缀。
>>> "{:g}".format(42)
'42'
>>> "{:#g}".format(42)
'42.0000'
# 对于各种十进制数,它要求必须包含小数点(对于类型g,它保留小数点后面的零)。
```



#### 代码

```python
# 根据指定的宽度打印格式良好的价格列表
width = int(input('Please enter width: '))

price_width = 10
item_width = width - price_width

header_fmt = '{{:{}}}{{:>{}}}'.format(item_width, price_width)
fmt = '{{:{}}}{{:>{}.2f}}'.format(item_width, price_width)

print('=' * width)

print(header_fmt.format('Item', 'Price'))

print('-' * width)

print(fmt.format('Apples', 0.4))
print(fmt.format('Pears', 0.5))
print(fmt.format('Cantaloupes', 1.92))
print(fmt.format('Dried Apricots (16 oz.)', 8))
print(fmt.format('Prunes (4 lbs.)', 12))

print('=' * width)
这个程序的运行情况类似于下面这样:
Please enter width: 35
===================================
Item													 Price
-----------------------------------
Apples													     0.40
Pears														   0.50
Cantaloupes											  1.92
Dried Apricots (16 oz.)						   8.00
Prunes (4 lbs.)										12.00
===================================
```



### 字符串方法

#### string模块

```python
string.digits
# 包含数字0~9的字符串。
string.ascii_letters
# 包含所有ASCII字母(大写和小写)的字符串。
string.ascii_lowercase
# 包含所有小写ASCII字母的字符串。
string.printable
# 包含所有可打印的ASCII字符的字符串。
string.punctuation
# 包含所有ASCII标点字符的字符串。
string.ascii_uppercase
# 包含所有大写ASCII字母的字符串。
# 虽然说的是ASCII字符，但值实际上是未解码的Unicode字符串。
```



#### center（字符居中）

```python
>>> "The Middle by Jimmy Eat World".center(39)
'      The Middle by Jimmy Eat World      '
>>> "The Middle by Jimmy Eat World".center(39, "*")
'*****The Middle by Jimmy Eat World*****'
# center通过在两边添加填充字符(默认为空格)让字符串居中。上面表示总长度是39，不足的地方用星号填充
```



#### find（查找子串）

```python
>>> 'With a moo-moo here, and a moo-moo there'.find('moo')
7
>>> title = "Monty Python's Flying Circus"
>>> title.find('Monty')
0
>>> title.find('Python')
6
>>> title.find('Flying')
15
>>> title.find('Zirquss')
-1
# find在字符串中查找子串。如果找到,就返回子串的第一个字符的索引,否则返回-1。

>>> subject = '$$$ Get rich now!!! $$$'
>>> subject.find('$$$')
0
# 使用find查找在subject字符串中的$$$，字符串方法find返回的并非布尔值。如果find像这样返回0，就意味着它在索引0处找到了指定的子串。

>>> subject = '$$$ Get rich now!!! $$$'
>>> subject.find('$$$')
0
>>> subject.find('$$$', 1) 
20
# 只指定了起点
>>> subject.find('!!!')
16
>>> subject.find('!!!', 0, 16) 
-1
# 同时指定了起点和终点
# 起点和终点值(第二个和第三个参数)指定的搜索范围包含起点，但不包含终点。前包后不包
```



#### join（合并序列元素）

```python
>>> seq = [1, 2, 3, 4, 5]
>>> sep = '+'
>>> sep.join(seq) 
# 尝试合并一个数字列表
Traceback (most recent call last):
File "<stdin>", line 1, in ?
TypeError: sequence item 0: expected string, int found
>>> seq = ['1', '2', '3', '4', '5']
>>> sep.join(seq) 
'1+2+3+4+5'
# 合并一个字符串列表
>>> dirs = '', 'usr', 'bin', 'env'
>>> '/'.join(dirs)
'/usr/bin/env'
>>> print('C:' + '\\'.join(dirs))
C:\usr\bin\env
# 这里需要对\转义
# 注：所合并序列的元素必须都是字符串。
```



#### lower（返回字符串小写）

```python
>>> 'Trondheim Hammer Dance'.lower()
'trondheim hammer dance'
# lower返回字符串的小写版本
>>> if 'Gumby' in ['gumby', 'smith', 'jones']: print('Found it!')
...
>>>
# 这样是找不到的

>>> name = 'Gumby'
>>> names = ['gumby', 'smith', 'jones']
>>> if name.lower() in names: print('Found it!')
...
Found it!
>>>
# 使用lower转换后才可以找到
```



#### title（词首大写）

```python
>>> "that's all folks".title()
"That'S All, Folks"
# title将字符串转换为词首大写，即所有单词的首字母都大写，其他字母都小写。然而，它确定单词边界的方式可能导致结果不合理。

>>> import string
>>> string.capwords("that's all, folks")
That's All, Folks"
# 还可以使用模块string中的函数capwords
```



#### replace（替换子串）

```python
>>> 'This is a test'.replace('is', 'eez')
'Theez eez a test'
# replace将指定子串都替换为另一个字符串，并返回替换后的结果。上面是将is替换为eez
```



#### split（拆分字符串）

```python
>>> '1+2+3+4+5'.split('+')
['1', '2', '3', '4', '5']
>>> '/usr/bin/env'.split('/')
['', 'usr', 'bin', 'env']
>>> 'Using the default'.split()
['Using', 'the', 'default']
# split是一个非常重要的字符串方法，其作用与join相反，用于将字符串拆分为序列。如果没有指定分隔符，将默认在单个或多个连续的空白字符(空格、制表符、换行符等)处进行拆分。
```



#### strip（删除空白）

```python
>>> '      internal whitespace is kept      '.strip()
'internal whitespace is kept'
# strip将字符串开头和末尾的空白(但不包括中间的空白)删除，并返回删除后的结果。

>>> names = ['gumby', 'smith', 'jones']
>>> name = 'gumby '
# 这里的gumby后有一个空格
>>> if name in names: print('Found it!')
...
>>> if name.strip() in names: print('Found it!')
...
Found it!
>>>
# 需要将输入与存储的值进行比较时，strip很有用。如上面，在用户名后多了一个空格也可以找到

>>> '*** SPAM * for * everyone!!! ***'.strip(' *!')
'SPAM * for * everyone'
# 这个方法可以删除开头或末尾的指定字符，中间的星号不会被删除。
```



#### translate（替换字符串）

```python
# 方法translate与replace一样替换字符串的特定部分，但不同的是它只能进行单字符替换。这个方法的优势在于能够同时替换多个字符，因此效率比replace高。
>>> table = str.maketrans('cs', 'kz')
# 使用translate前必须创建一个转换表。将cs两个字母转换为kz两个字母，字母是单个匹配的。这个转换表指出了不同Unicode码点之间的转换关系。要创建转换表，可对字符串类型str调用方法maketrans，这个方法接受两个参数：两个长度相同的字符串，它们指定要将第一个字符串中的每个字符都替换为第二个字符串中的相应字符。
>>> table
{115: 122, 99: 107}
# 查看转换表的内容，但你看到的只是Unicode码点之间的映射。
>>> 'this is an incredible test'.translate(table)
'thiz iz an inkredible tezt'
# 创建转换表后，就可将其用作方法translate的参数。
>>> table = str.maketrans('cs', 'kz', ' ')
>>> 'this is an incredible test'.translate(table)
'thizizaninkredibletezt'
# 调用方法 maketrans时,还可提供可选的第三个参数，指定要将哪些字母删除。上面是将所有的空格删除。
```



#### 判断字符串是否满足特定的条件

> 很多字符串方法都以is打头，如isspace、 isdigit 和isupper，它们判断字符串是否具有特定的性质(如包含的字符全为空白、数字或大写) 。如果字符串具备特定的性质，这些方法就返回True，否则返回False。

