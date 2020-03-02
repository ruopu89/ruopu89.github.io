---
title: python基础学习-列表解析式与生成器表达式
date: 2019-10-10 14:33:02
tags: 列表解析式与生成器表达式
categories: python
---

### 标准库 datetime

- datetime模块

  - 对日期、时间、时间戳的处理
  - datetime类
    - 类方法
      - today() 返回本地时区当前时间的datetime对象
      - now(tz=None) 返回当前时间的datetime对象，时间到微秒，tz表示时区，如果tz为None，返回和today()一样。
      - utcnow()没有时区的当前时间
      - fromtimestamp(timestamp,tz=None) 从一个时间戳返回一个datetime对象
    - datetime对象
      - timestamp() 返回一个到微秒的时间戳
        - 时间戳：格林威治时间1970年1月1日0点到现在的秒数

- datetime对象

  - 构造方法 datetime.datetime(2016,12,6,16,29,43,79043)
  - year、month、day、hour、minute、second、microsecond，取datetime对象的年月日时分秒及微秒
  - weekday() 返回星期的天，周一为0，周日为6
  - isoweekday() 返回星期的天，周一为1，周日为7
  - date() 返回日期date对象
  - time() 返回时间time对象
  - replace() 修改并返回新的时间
  - isocalendar() 返回一个三元组（年，周数，周的天）

- 日期格式化

  - 类方法 strptime(date_string, format)，返回datetime对象

  - 对象方法 strftime(format)，返回字符串

  - 字符串format函数格式化

    import datetime

    dt = datetime.datetime.strptime("21/11/06 16:30","%d %m %y %H:%M")

    print(dt.strftime("%Y-%m-%d %H:%M:%S"))

    print("{0:%Y}/{0:%m}/{0:%d} {0:%H}::{0:%M}::{0:%S}".format(dt))

- timedelta对象

  - datetime2 = datetime1 + timedelta
  - datetime2 = datetime1 - timedelta
  - timedelta = datetime1 - datetime2
  - 构造方法
    - datetime.timedelta(days=0, seconds=0, microseconds=0, milliseconds=0,minutes=0, hours=0, weeks=0)
    - year = datetime.timedelta(days=365)
  - total_seconds() 返回时间差的总秒数



### 标准库time

- time
  - time.sleep(secs) 将调用线程挂起指定的秒数



#### 练习

```python
import datetime
# 导入一个名词空间或叫模块或叫包或叫库。这表示这是一个名词空间，它管理关一个区域，这个区域内所有的类与另一个区域内的名词空间管理的类不一样
datetime.datetime.now()
# 第一个datetime是名词空间，第二个datetime是类，now是这个类的方法
# 这里是导入名称空间，再使用这个空间管理的类
# now(tz=None)，这里的tz指的是时区，一般不设置时区
datetime.datetime.today()
datetime.datetime.utcnow()
# datetime对象是对象的实例化后得到的
a = datetime.datetime.now().timestamp()
# 返回微秒时间戳，这里返回的是一个数值
print(type(a))
print(a)
b = datetime.datetime.fromtimestamp(a)
# fromtimestamp是datetime类的方法，给这个方法一个时间戳a，构造出一个对象，因为还没有对象，所以要让类构造出来。
# 对象不存在时，要把方法给类，让类使用这个方法构造出一个对象
print(type(b))
print(b)
b = datetime.datetime.fromtimestamp(int(a))
# 这里用int创建一个整数，丢弃微秒部分
print(b)
a = datetime.datetime(2019,10,8)
print(a)
a.year
# 这里没用括号，所以year是属性，不是调用
a.second
a.day
a.weekday
# 取datetime对象的年月日时分秒及微秒
a = datetime.datetime.now()
print(a.weekday)
a.weekday()
a.isoweekday()
a.date()
a.time()
a.replace(2018)
# 把a里的时间改为2018年
a.isocalendar()
# 生成一个日历，是一个三元组（年，周数，周的天）

a.strftime('%Y~%m~%d %H-%M-%S')
'{0:%y} {0:%m} {0:%d}'.format(a)
'{} {} {}'.format(a.year,a.month,a.day)   # 这种方法比上面的方法少打很多符号，比较常用

h = datetime.timedelta(hours=24)
print(h)
datetime.datetime.now()
n = datetime.datetime.now() - h
# 当前时间送去一天。
(datetime.datetime.now() - n).total_seconds()
# 两个时间对象相减后，是一个timedelta，再调用timedelta的total_seconds方法，就可以算出相差的总秒数了

import time
time.sleep(5)
# 挂起5秒，哪个线程调用sleep，谁就被挂起，在ipthon中输入此命令后，当前线程被挂起了。
# 常用的两个模块，time和datetime
```



### 列表解析

- 举例
  - 生成一个列表,元素0~9，对每一个元素自增1后求平方返回新列表

```python
# 生成一个0-9的列表，之后将每个元素加1，再求平方返回一个新列表

# target = range(10)
newlist = []
# 生成一个0-9的列表，之后将每个元素加1，再求平方返回一个新列表
for i in range(10):
    newlist.append((i + 1) ** 2)
print(newlist)
输出：
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# 文档中的解决办法
l1 = list(range(10))
l2 = []
for i in l1:
	l2.append((i+1)**2)
print(l2)

# 列表解析式
l1 = list(range(10))
l2 = [(i+1)**2 for i in l1]
print(l2)
print(type(l2))
输出：
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
<class 'list'>
```



### 列表解析List Comprehension

- 语法
  - [返回值 for 元素 in 可迭代对象 if 条件]
  - 使用中括号[]，内部是for循环，if条件语句可选
  - 返回一个新的列表
- 列表解析式是一种语法糖
  - 编译器会优化，不会因为简写而影响效率，反而因优化提高了效率
  - 减少程序员工作量，减少出错
  - 简化了代码，但可读性增强
  - **语法糖**（Syntactic sugar）是由英国计算机科学家彼得·兰丁发明的一个术语，指计算机语言中添加的某种语法，这种语法对语言的功能没有影响，但是更方便程序员使用。语法糖让程序更加简洁，有更高的可读性。**糖在不改变其所在位置的语法结构的前提下，实现了运行时等价**。
- 举例
  - 获取10以内的偶数，比较执行效率

```python
even = []
even = [x for x in range(10) if x%2==0]

for x in range(10):
	if x % 2 == 0:
		even.append(x)
```

- 思考
  - 有这样的赋值语句newlist = [print(i) for i in range(10)]，请问newlist的元素打印出来是什么？
```python
newlist = [print(i) for i in range(10)]
print(newlist)
输出：
0
1
2
3
4
5
6
7
8
9
[None, None, None, None, None, None, None, None, None, None]
# 可以看到，标准输出的是None的列表。这是因为必须要把函数执行完了用print(i)的返回值来填充列表，而print(i)的返回值是None。所以这里应该用newlist = [i for i in range(10)]
```


  - 获取20以内的偶数，如果数是3的倍数也打印[i for i in range(20) if i%2==0 elif i%3==0] 行
    吗？

```python
[i for i in range(20) if i%2==0 elif i%3==0]
输出：
  File "<ipython-input-20-8aea5f5e5abc>", line 1
    [i for i in range(20) if i%2==0 elif i%3==0]
                                       ^
SyntaxError: invalid syntax
# 不能使用elif。
[i for i in range(20) if i%2==0 or i%3 == 0]
输出：
[0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18]
```



### 列表解析进阶

```python
[expr for item in iterable if cond1 if cond2]
等价于
ret = []
for item in iterable:
	if cond1:
		if cond2:
			ret.append(expr)
            
例：20以内，既能被2整除又能被3整除的数
[i for i in range(20) if i%2==0 and i%3==0]
输出：
[0, 6, 12, 18]

[i for i in range(20) if i%2==0 if i%3==0]
输出：
[0, 6, 12, 18]
# 这两种方法的结果都是一个标准输出，如果最后用print()打印，会显示9。所以这里一定要将列表解析的结果赋值给一个变量才行。
=======================================================================================
[expr for i in iterable1 for j in iterable2 ]
等价于
ret = []
for i in iterable1:
	for j in iterable2:
		ret.append(expr)
例：
[(x, y) for x in 'abcde' for y in range(3)]
输出：
[('a', 0),
 ('a', 1),
 ('a', 2),
 ('b', 0),
 ('b', 1),
 ('b', 2),
 ('c', 0),
 ('c', 1),
 ('c', 2),
 ('d', 0),
 ('d', 1),
 ('d', 2),
 ('e', 0),
 ('e', 1),
 ('e', 2)]

[[x, y] for x in 'abcde' for y in range(3)]
输出：
[['a', 0],
 ['a', 1],
 ['a', 2],
 ['b', 0],
 ['b', 1],
 ['b', 2],
 ['c', 0],
 ['c', 1],
 ['c', 2],
 ['d', 0],
 ['d', 1],
 ['d', 2],
 ['e', 0],
 ['e', 1],
 ['e', 2]]

[{x: y} for x in 'abcde' for y in range(3)]
输出：
[{'a': 0},
 {'a': 1},
 {'a': 2},
 {'b': 0},
 {'b': 1},
 {'b': 2},
 {'c': 0},
 {'c': 1},
 {'c': 2},
 {'d': 0},
 {'d': 1},
 {'d': 2},
 {'e': 0},
 {'e': 1},
 {'e': 2}]

请问下面3种输出各是什么？为什么
[(i,j) for i in range(7) if i>4 for j in range(20,25) if j>23]
输出：
[(5, 24), (6, 24)]

[(i,j) for i in range(7) for j in range(20,25) if i>4 if j>23]
输出：
[(5, 24), (6, 24)]

[(i,j) for i in range(7) for j in range(20,25) if i>4 and j>23]
输出：
[(5, 24), (6, 24)]
```



### 列表解析练习

```python
练习(要求使用列表解析式完成)
1. 返回1-10平方的列表
[x ** 2 for x in range(1,11)]

2. 有一个列表lst = [1,4,9,16,2,5,10,15],生成一个新列表,要求新列表元素是lst相邻2项的和
lst = [1,4,9,16,2,5,10,15]
[lst[i]+lst[i+1] for i in range(len(lst)-1)]

3. 打印九九乘法表
[print('{}*{}={:<3}{}'.format(j,i,i*j,'\n' if i==j else ''),end="") for i in range(1,10) for j in range(1,i+1)]
# j,i,i*j,'\n' if i==j else ''是一个三目运算
输出：
1*1=1  
1*2=2  2*2=4  
1*3=3  2*3=6  3*3=9  
1*4=4  2*4=8  3*4=12 4*4=16 
1*5=5  2*5=10 3*5=15 4*5=20 5*5=25 
1*6=6  2*6=12 3*6=18 4*6=24 5*6=30 6*6=36 
1*7=7  2*7=14 3*7=21 4*7=28 5*7=35 6*7=42 7*7=49 
1*8=8  2*8=16 3*8=24 4*8=32 5*8=40 6*8=48 7*8=56 8*8=64 
1*9=9  2*9=18 3*9=27 4*9=36 5*9=45 6*9=54 7*9=63 8*9=72 9*9=81 
[None,
...
 None]
# 可以看到，标准输出的是None的列表。这是因为必须要把函数执行完了用print(i)的返回值来填充列表，而print(i)的返回值是None。

4. "0001.abadicddws" 是ID格式,要求ID格式是以点号分割,左边是4位从1开始的整数,右边是10位
随机小写英文字母。请依次生成前100个ID的列表
import random
['{:04}.{}'.format(n,''.join([random.choice(bytes(range(97,123)).decode()) for _ in range(10)])) for n in range(1,101)]
输出：
['0001.fbyzrdzoif',
 '0002.loirmqauym',
 ...
 '0098.cjbghrvfmh',
 '0099.xljsgucscx',
 '0100.nieckficgn']
# 可以看到这是标准输出的
# random.choice 此模块的意思指在()内随机生成一个值。bytes(range(97,123)).decode 指生成97至123，前包后不包

['{:04}.{}'.format(i,"".join([chr(random.randint(97,122)) for j in range(10)])) for i in range(1,101)]
输出：
['0001.peiqgmjxix',
 '0002.nspwscivaz',
 ...
 '0099.gavzudepld',
 '0100.fmpdsztsie']
# 这同样是标准输出。
# {:04}指宽度为4，默认右对齐，其余空白部分用0填充。random.randint(97,122)指生成指定区间的整数，前包
# 后不包。chr()给定一个范围的整数返回对应的字符，即ASCII编码值。
# 如chr(48)为0；chr(57)为9；chr(65)为A；chr(90)为Z；chr(97)为a；chr(122)为z。

import string
['{:>04}.{}'.format(i,''.join(random.choice(string.ascii_lowercase) for _ in range(0,10))) for i in range(1,101)]
输出：
['0001.anbhqpafcz',
 '0002.dkbzbypera',
 ...
 '0099.otxpmioqpp',
 '0100.jazkayuqfu']
# 这还是标准输出
# string.ascii_lowercase 指默认生成所有小写字母。random.choice 此模块的意思指在()内随机生成一个值
# join：指将可迭代对象连接起来,使用’’’'作为分隔符，默认在""内不填写为空白符；可迭代对象本身元素都是字符串；返回一个新字符串
```



### 生成器表达式 Generator expression

- 语法
  - (返回值 for 元素 in 可迭代对象 if 条件)
  - 列表解析式的中括号换成小括号就行了
  - 返回一个生成器
- 和列表解析式的区别
  - 生成器表达式是按需计算(或称惰性求值、延迟计算),需要的时候才计算值
  - 列表解析式是立即返回值
- 生成器
  - 可迭代对象
  - 迭代器



### 生成器表达式**

```python
举例:
g = ("{:04}".format(i) for i in range(1,11))
next(g)
for x in g:
	print(x)
print('~~~~~~~~~~~~')
for x in g:
	print(x)
# 总结
# 延迟计算
# 返回迭代器,可以迭代
# 从前到后走完一遍后,不能回头

对比列表
g = ["{:04}".format(i) for i in range(1,11)]
for x in g:
	print(x)
print('~~~~~~~~~~~~')
for x in g:
	print(x)
# 总结
# 立即计算
# 返回的不是迭代器,返回可迭代对象列表
# 从前到后走完一遍后,可以重新回头迭代
```



### 生成器表达式

```python
习题1
it = (print("{}".format(i+1)) for i in range(2))
first = next(it)
second = next(it)
val = first + second
# val的值是什么?
# val = first + second 语句之后能否再次next(it)?
输出：
1
2
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-20-9bc925c5dd92> in <module>
      2 first = next(it)
      3 second = next(it)
----> 4 val = first + second

TypeError: unsupported operand type(s) for +: 'NoneType' and 'NoneType'
# 不要在列表解析式或生成器表达式中使用print()函数
        
习题2
it = (x for x in range(10) if x % 2)
# Python程序语言指定任何非0和非空（null）值为true，0 或者 null为false。所以这里的if后的条件x%2的结果如果是1就满足条件。
first = next(it)
second = next(it)
val = first + second
print(val)
# val的值是什么?
# val = first + second 语句之后能否再次next(it)?
输出：
4
```



- 和列表解析式的对比
  - 计算方式
    - 生成器表达式延迟计算,列表解析式立即计算
  - 内存占用
    - 单从返回值本身来说,生成器表达式省内存,列表解析式返回新的列表
    - 生成器没有数据,内存占用极少,但是使用的时候,虽然一个个返回数据,但是合起来占用的内存也差不多
    - 列表解析式构造新的列表需要占用内存
  - 计算速度
    - 单看计算时间看,生成器表达式耗时非常短,列表解析式耗时长
    - 但是生成器本身并没有返回任何值,只返回了一个生成器对象
    - 列表解析式构造并返回了一个新的列表



### 集合解析式

- 语法
  - {返回值 for 元素 in 可迭代对象 if 条件}
  - 列表解析式的中括号换成大括号{}就行了
  - 立即返回一个集合
- 用法
  - {(x,x+1) for x in range(10)}
  - {[x] for x in range(10)}



### 字典解析式

- 语法
  - {返回值 for 元素 in 可迭代对象 if 条件}
  - 列表解析式的中括号换成大括号{}就行了
  - 使用key:value形式
  - 立即返回一个字典
- 用法
  - {x:(x,x+1) for x in range(10)}
  - {x:[x,x+1] for x in range(10)}
  - {(x,):[x,x+1] for x in range(10)}
  - {[x]:[x,x+1] for x in range(10)} #
  - {chr(0x41+x):x**2 for x in range(10)}
  - {str(x):y for x in range(3) for y in range(4)} # 输出多少个元素?
- 用法

```python
用法
{str(x):y for x in range(3) for y in range(4)} # 输出多少个元素?
等价于
ret = {}
for x in range(3):
	for y in range(4):
		ret[str(x)] = y
输出：
Out: {'0': 3, '1': 3, '2': 3}
```



### 总结

- Python2 引入列表解析式
- Python2.4 引入生成器表达式
- Python3 引入集合、字典解析式，并迁移到了2.7
- 一般来说，应该多应用解析式，简短、高效
- 如果一个解析式非常复杂，难以读懂，要考虑拆解成for循环
- 生成器和迭代器是不同的对象，但都是可迭代对象
- **迭代器一定是一个可迭代对象，但是可迭代对象未必是迭代器**
- **生成器对象一定是一个迭代器，但是迭代器未必是生成器对象**
- 从返回值本身来说，生成器表达式省内存，返回的是一个生成器对象
- 

