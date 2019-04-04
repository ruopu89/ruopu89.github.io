---
title: python基础学习-语句
date: 2019-03-26 16:34:05
tags: python语句
categories: python
---

### print

```python
>>> print('Age:', 42)
Age: 42
# 可同时打印多个表达式，条件是用逗号分隔它们

>>> name = 'Gumby'
>>> salutation = 'Mr.'
>>> greeting = 'Hello,'
>>> print(greeting, salutation, name)
Hello, Mr. Gumby

print(greeting + ',', salutation, name)
# 如果字符串变量greeting不包含逗号，可使用此方法添加，记得一定要有加号，不然会在greeting与逗号间加入一个空格

>>> print("I", "wish", "to", "register", "a", "complaint", sep="_")
I_wish_to_register_a_complaint
# 自定义分隔符

print('Hello,', end='')
print('world!')
Hello,world!
# 还可自定义结束字符串，以替换默认的换行符。上面将结束字符串指定为空字符串，所以Hello和world会打印在一行。
```



### import

```python
import somemodule
from somemodule import somefunction
from somemodule import somefunction, anotherfunction, yetanotherfunction
from somemodule import *
# 从模块导入。仅当你确定要导入模块中的一切时，采用使用最后一种方式

module1.open(...)
module2.open(...)
# 有两个模块，它们都包含函数open，可使用第一种方式导入这两个模块，使用此种方式调用open函数

>>> import math as foobar
>>> foobar.sqrt(4)
2.0
# 导入整个模块并在语句末尾添加as子句指定别名。

>>> from math import sqrt as foobar
>>> foobar(4)
2.0
# 导入特定函数并给它指定别名，这是给sqrt起的别名叫foobar
```



### 赋值

#### 序列解包

```python
>>> x, y, z = 1, 2, 3
>>> print(x, y, z)
1 2 3
# 同时(并行)给多个变量赋值

>>> x, y = y, x
>>> print(x, y, z)
2 1 3
# 这种方式还可交换多个变量的值

>>> values = 1, 2, 3
>>> values
(1, 2, 3)
>>> x, y, z = values
>>> x
1
# 这里执行的操作称为序列解包(或可迭代对象解包)：将一个序列(或任何可迭代对象)解包，并将得到的值存储到一系列变量中。

>>> scoundrel = {'name': 'Robin', 'girlfriend': 'Marion'}
>>> key, value = scoundrel.popitem()
>>> key
'girlfriend'
>>> value
'Marion'
# 从字典中随便获取(或删除)一个键值对，可使用方法popitem，它随便获取一个键值对并以元组的方式返回。接下来，可直接将返回的元组解包到两个变量中。

>>> x, y, z = 1, 2
Traceback (most recent call last):
File "<stdin>", line 1, in <module>
ValueError: need more than 2 values to unpack
>>> x, y, z = 1, 2, 3, 4
Traceback (most recent call last):
File "<stdin>", line 1, in <module>
ValueError: too many values to unpack
# 要解包的序列包含的元素个数必须与你在等号左边列出的目标个数相同

>>> a, b, *rest = [1, 2, 3, 4]
>>> rest
[3, 4]
# 可使用星号运算符(*)来收集多余的值，这样无需确保值和变量的个数相同

>>> name = "Albus Percival Wulfric Brian Dumbledore"
>>> first, *middle, last = name.split()
>>> middle
['Percival', 'Wulfric', 'Brian']
# 还可将带星号的变量放在其他位置。

>>> a, *b, c = "abc"
>>> a, b, c
('a', ['b'], 'c')
# 赋值语句的右边可以是任何类型的序列，但带星号的变量最终包含的总是一个列表。
```

