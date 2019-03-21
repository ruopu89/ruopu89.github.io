---
title: python基础学习-列表和元组
date: 2019-03-21 13:29:38
tags: 列表和元组
categories: python
---

### 概念

#### 数据结构

> 数据结构是以某种方式(如通过编号)组合起来的数据元素(如数、字符乃至其他数据结构)集合。



#### 序列

> 在Python中，最基本的数据结构为序列(sequence) 。序列中的每个元素都有编号，即其位置或索引，其中第一个元素的索引为0，第二个元素的索引为1，依此类推。Python内置了多种序列，如列表、元组、字符串。列表和元组的主要不同在于，列表是可以修改的，而元组不可以。



##### 列表

```python
>>> edward = ['Edward Gumby', 42]
# 使用列表来表示

>>> edward = ['Edward Gumby', 42]
>>> john = ['John Smith', 50]
>>> database = [edward, john]
>>> database
[['Edward Gumby', 42], ['John Smith', 50]]
# 序列还可包含其他序列，上面是创建一个由数据库中所有人员组成的列表。Python支持一种数据结构的基本概念，名为容器(container)。容器基本上就是可包含其他对象的对象。两种主要的容器是序列(如列表和元组)和映射(如字典) 。在序列中，每个元素都有编号，而在映射中，每个元素都有名称(也叫键)。
```



### 通用的序列操作

#### 索引

```python
>>> greeting = 'Hello'
>>> greeting[0]
'H'
# 字符串就是由字符组成的序列。索引0指向第一个元素,这里为字母H。Python没有专门用于表示字符的类型，因此一个字符就是只包含一个元素的字符串。

>>> greeting[-1]
'o'
# 当你使用负数索引时，Python将从右(即从最后一个元素)开始往左数，因此-1是最后一个元素的位置。对于字符串字面量(以及其他的序列字面量)，可直接对其执行索引操作,无需先将其赋给变量。这与先赋给变量再对变量执行索引操作的效果是一样的。
>>> 'Hello'[1]
'e'

>>> fourth = input('Year: ')[3]
Year: 2005
>>> fourth
'5'
# 如果函数调用返回一个序列，可直接对其执行索引操作。例如：如果你只想获取用户输入的年份的第4位

months = [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'
]
endings = ['st', 'nd', 'rd'] + 17 * ['th'] \
+ ['st', 'nd', 'rd'] + 7 * ['th'] \
+ ['st']
# 这是一个列表的拼接，st,nd,rd表示1,2,3号，4-20使用th，之后只要有1,2,3就要用st,nd,rd表示，其他用th表示
year= input('Year: ')
month= input('Month (1-12): ')
day= input('Day (1-31): ')
month_number = int(month)
day_number = int(day)
month_name = months[month_number-1]
ordinal = day + endings[day_number-1]
# 将表示月和日的数要减1，这样才能得到正确的索引。因为months是一个列表，其索引是从0开始的，所以要减1。
print(month_name + ' ' + ordinal + ', ' + year)
上面的程序执行结果如下：
Year: 1974
Month (1-12): 8
Day (1-31): 16
August 16th, 1974
```



#### 切片

