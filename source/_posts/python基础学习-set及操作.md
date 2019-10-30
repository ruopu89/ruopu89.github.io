---
title: python基础学习-set及操作
date: 2019-09-23 10:55:42
tags: python学习-set及操作
categories: python
---

### 集合set

- 约定
  - set翻译为集合
  - collection翻译为集合类型，是一个大概念
- set
  - 可变的、无序的、不重复的元素的集合



### set定义与初始化

- set() -> new empty set object

- set(iterable) -> new set object，set()中可以是一个可迭代对象，也可以是list或tuple

  - 官网解释：返回一个新的 set 或 frozenset 对象，其元素来自于 *iterable*。 集合的元素必须为 hashable。 要表示由集合对象构成的集合，所有的内层集合必须为 [`frozenset`](https://docs.python.org/zh-cn/3/library/stdtypes.html#frozenset) 对象。 如果未指定 *iterable*，则将返回一个新的空集合。

  - hashable -- 可哈希

    一个对象的哈希值如果在其生命周期内绝不改变，就被称为 *可哈希* （它需要具有 [`__hash__()`](https://docs.python.org/zh-cn/3/reference/datamodel.html#object.__hash__) 方法），并可以同其他对象进行比较（它需要具有 [`__eq__()`](https://docs.python.org/zh-cn/3/reference/datamodel.html#object.__eq__) 方法）。可哈希对象必须具有相同的哈希值比较结果才会相同。

    可哈希性使得对象能够作为字典键或集合成员使用，因为这些数据结构要在内部使用哈希值。

    大多数 Python 中的不可变内置对象都是可哈希的；可变容器（例如列表或字典）都不可哈希；不可变容器（例如元组和 frozenset）仅当它们的元素均为可哈希时才是可哈希的。 用户定义类的实例对象默认是可哈希的。 它们在比较时一定不相同（除非是与自己比较），它们的哈希值的生成是基于它们的 [`id()`](https://docs.python.org/zh-cn/3/library/functions.html#id)。

```python
s1 = set()
s2 = set(range(5))
s3 = set(list(range(10)))  # 使用list时，一定要用set()，不能用{}
s4 = {} # 这样定义的是dict，而不是set。使用大括号来定义时，不能在大括号中用列表类型
s5 = {9,10,11} # 使用{}定义set，大括号中必须有内容
s6 = {(1,2),3,'a'}
s7 = {[1],(1,),1}
# 查看这三个元素是否都可以hash，大括号中需要使用可hash的元素，可以使用hash()函数测试，列表是不能hash的
s8 = set({'a':2,'b':3,'c':4})
# 字典转set集合，需要注意的是，只取了字典的key，相当于将字典中的dict.keys()列表转成set集合。
# 大括号或 set() 函数可以用来创建集合。　
# set集合类需要的参数必须是迭代器类型的，如：序列、字典等，然后转换成无序不重复的元素集。由于集合是不重复的，所以可以对字符串、列表、元组进行去重操作。
s1 = set([1,2,3,4])
# 个人感觉，{}是在定义一个集合，而set()是在将类型转换，所以大括号中不能使用列表类型，而set()中可以。

>>> s=set()
>>> s
set()
>>> s1=set([])　＃列表
>>> s1
set()
>>> s2=set(())　＃元组
>>> s2
set()
>>> s3=set({})　＃字典
>>> s3
set()
```



### set的元素

- set的元素要求必须可以hash
- 目前学过的不可hash的类型有list、set
- 元素不可以索引，因为没有顺序所以无法索引
- set可以迭代，如果不可以迭代，就不能用in了



### set增加

- add(elem)
  - 把要传入的元素**作为一个整体**添加到set集合中
  - 如果元素存在，什么都不做

```python
>>> s=set('one')
>>> s
{'e', 'o', 'n'}
>>> s.add('two')
>>> s
{'e', 'two', 'o', 'n'}
```



- update(*others)
  - 合并其他元素到set集合中来。是把要**传入的元素拆分成单个字符**，存于集合中，并去掉重复的字符。可以一次**添加多个值**
  - 参数others必须是可迭代对象
  - 就地修改

```python
>>> s=set('one')
>>> s
{'e', 'o', 'n'}
>>> s.update('two')
>>> s
{'e', 'n', 't', 'w', 'o'}
```



### set删除

- remove(elem)
  - 从set中移除一个元素
  - 元素不存在，抛出KeyError异常。为什么是KeyError？因为是key比较，所以抛出KeyError。这个方法用hash()做了比较

```python
>>> s=set('one')
>>> s
{'e', 'o', 'n'}
>>> s.remove('e')
>>> s
{'n', 'o'}
```



- discard(elem)
  - 从set中移除一个元素
  - 元素不存在，什么都不做

```python
>>> sList
set([1, 2, 3, 4, 5])
>>> sList.discard(1)
>>> sList
set([2, 3, 4, 5])
```



- pop() -> item
  - 移除并返回任意的元素。为什么是任意元素?
  - 空集返回KeyError异常，因为没有key可以拿了

```python
>>> sList
set([2, 3, 4, 5])
>>> sList.pop()
2
```



- clear()
  - 移除所有元素

```python
>>> sList
set([3, 4, 5])
>>> sList.clear()
>>> sList
set([])
```





### set修改、查询

- 修改
  - 要么删除，要么加入新的元素
  - 为什么没有修改？因为是非线性结构，无法索引？
- 查询
  - 非线性结构，无法索引
- 遍历
  - 可以迭代所有元素

```python
>>> s=set('one')
>>> s
{'e', 'o', 'n'}
>>> for i in s:
    print(i)
... ... 
e
o
n
>>> 

>>> s=set('one')
>>> s
{'e', 'o', 'n'}
>>> for idex,i in enumerate(s):
        print (idex,i)
... ... 
0 e
1 o
2 n
>>> 
```



- 成员运算符
  - in 和 not in 判断元素是否在set中
  - 效率呢?

```python
# set成员运算符的比较
# list和set的比较
lst1 = list(range(100))
lst2 = list(range(1000000))
-1 in lst1、-1 in lst2 # 看看效率
set1 = set(range(100))
set2 = set(range(1000000))
-1 in set1、-1 in set2 # 看看效率

# 例
%%timeit lst1=list(range(100))
a = -1 in lst1
# 用-1是为了遍历一次，也可以写99，也是为了遍历一次

%%timeit lst1=list(range(1000000))
a = -1 in lst1

%%timeit set1=set(range(100))
a = -1 in set1

%%timeit set1=set(range(1000000))
a = -1 in set1
# set保存的是key，用hash值对比。如果hash值一样，就会去重
```



### set和线性结构

- 线性结构的查询时间复杂度是O(n)，即随着数据规模的增大而增加耗时
- set、dict等结构，内部使用hash值作为key，时间复杂度可以做到O(1)，查询时间和数据规模无关，把列表，集合与字典一定要弄清楚
- 可hash
  - 数值型int、float、complex
  - 布尔型True、False
  - 字符串string、bytes
  - tuple
  - None
  - 以上都是不可变类型，成为可哈希类型，hashable
- set的元素必须是可hash的



### 集合其他方法

| 函数                      | 说明                                            |
| :------------------------ | ----------------------------------------------- |
| len(s)                    | set 的长度                                      |
| x in s                    | 测试 x 是否是 s 的成员                          |
| x not in s                | 测试 x 是否不是 s 的成员                        |
| s.issubset(t)             | 测试是否 s 中的每一个元素都在 t 中              |
| s.issuperset(t)           | 测试是否 t 中的每一个元素都在 s 中              |
| s.union(t)                | 返回一个新的 set 包含 s 和 t 中的每一个元素     |
| s.intersection(t)         | 返回一个新的 set 包含 s 和 t 中的公共元素       |
| s.difference(t)           | 返回一个新的 set 包含 s 中有但是 t 中没有的元素 |
| s.symmetric_difference(t) | 返回一个新的 set 包含 s 和 t 中不重复的元素     |
| s.copy()                  | 返回 set “s”的一个浅复制                        |



### 集合

- 基本概念
  - 全集
    - 所有元素的集合。例如实数集，所有实数组成的集合就是全集
  - 子集subset和超集superset
    - 一个集合A所有元素都在另一个集合B内，A是B的子集，B是A的超集
  - 真子集和真超集
    - A是B的子集，且A不等于B，A就是B的真子集，B是A的真超集
  - 并集：多个集合合并的结果
  - 交集：多个集合的公共部分
  - 差集：集合中除去和其他集合公共部分



### 集合运算

- 并集
  - 将两个集合A和B的所有的元素合并到一起，组成的集合称作集合A与集合B的并集
  - union(*others)
    - 返回和多个集合合并后的新的集合
  - | 运算符重载
    - 等同union
  - update(*others)
    - 和多个集合合并，就地修改
  - |=
    - 等同update


```python
>>> st1
set(['h', 'o', 'n', 'p', 't', 'y'])
>>> st3 = set('two')
>>> st3
set(['o', 't', 'w'])
>>> st1 | st3
set(['p', 't', 'w', 'y', 'h', 'o', 'n'])
```



- 交集
  - 集合A和B，由所有属于A且属于B的元素组成的集合
  - intersection(*others)
    - 返回和多个集合的交集
  - &
    - 等同intersection
  - intersection_update(*others)
    - 获取和多个集合的交集，并就地修改
  - &=
    - 等同intersection_update


```python
>>> st1 = set('python')
>>> st1
set(['h', 'o', 'n', 'p', 't', 'y'])
>>> st2 = set('htc')
>>> st2
set(['h', 'c', 't'])
>>> st1 & st2
set(['h', 't'])
```



- 差集
  - 集合A和B，由所有属于A且不属于B的元素组成的集合
  - difference(*others)
    - 返回和多个集合的差集

```python
>>> s1
set([1, 2, 3, 4, 5])
>>> s2
set([1, 2, 3, 4])
>>> s1.difference(s2)
set([5])
>>> s3
set(['1', '8', '9', '5'])
>>> s1.difference(s3)
set([1, 2, 3, 4, 5])
```




  - -
    - 等同difference
  - difference_update(*others)
    - 获取和多个集合的差集并就地修改
  - -=
    - 等同difference_update

```python
>>> st1
set(['1', '3', '2', '5', '4', '7', '6'])
>>> st2 = set('4589')
>>> st2
set(['9', '8', '5', '4'])
>>> st1 - st2
set(['1', '3', '2', '7', '6'])
```




- 对称差集
  - 集合A和B，由所有不属于A和B的交集元素组成的集合，记作(A-B)∪(B-A)
  - symmetric_differece(other)
    - 返回和另一个集合的差集
  - ^
    - 等同symmetric_differece
  - symmetric_differece_update(other)
    - 获取和另一个集合的差集并就地修改
  - ^=
    - 等同symmetric_differece_update

- issubset(other)、<=
  - 判断当前集合是否是另一个集合的子集
- set1 < set2
  - 判断set1是否是set2的真子集
- issuperset(other)、>=
  - 判断当前集合是否是other的超集
- set1 > set2
  - 判断set1是否是set的真超集
- isdisjoint(other)
  - 当前集合和另一个集合没有交集
  - 没有交集，返回True

```python
>>> s1＝set([1, 2, 3, 4, 5])
>>> s2＝set([1, 2, 3, 4])
>>> s3＝set(['1', '8', '9', '5'])
>>> s1 > s2
True
>>> s1 > s3
False
>>> s1 >= s2
True
>>> s2 < s1
True
>>> s1 < s3
False
>>> s3 < s1
False
>>> s1 == s2
False
>>> s2 == s3
False
>>> s1 != s2
True
```



### 集合应用

- 共同好友
  - 你的好友A、B、C，他的好友C、B、D，求共同好友
  - 交集问题：{'A', 'B', 'C'}.intersection({'B', 'C', 'D'})
- 微信群提醒
  - XXX与群里其他人都不是微信朋友关系
  - 并集：userid in (A | B | C | ...) == False，A、B、C等是微信好友的并集，用户ID不在这个并集中，说明他和任何人都不是朋友

- 权限判断
  - 有一个API，要求权限同时具备A、B、C才能访问，用户权限是B、C、D，判断用户是否能够访问该API
    - API集合A，权限集合P
    - A - P = {} ，A-P为空集，说明P包含A
    - A.issubset(P) 也行，A是P的子集也行
    - A & P = A 也行
  - 有一个API，要求权限具备A、B、C任意一项就可访问，用户权限是B、C、D，判断用户是否能够访问该API
    - API集合A，权限集合P
    - A & P != {} 就可以
    - A.isdisjoint(P) == False 表示有交集
- 一个总任务列表，存储所有任务。一个完成的任务列表。找出未完成的任务
  - 业务中，任务ID一般不可以重复
  - 所有任务ID放到一个set中，假设为ALL
  - 所有已完成的任务ID放到一个set中，假设为COMPLETED，它是ALL的子集
  - ALL - COMPLETED = UNCOMPLETED



### 集合推导式(Set comprehension)

```python
>>>a = {x for x in 'abracadabra' if x not in 'abc'}
>>> a
{'r', 'd'}
```



### 练习

```python
a = {1,2,3,4}
b = {2,3,4}
print(a.union(b))
c = b.union(a)
print(a)
print(c)

print(a | b)
print(b|a)
b.update(a)
print(b)

a |= {5,6} | {7,8}
# 先计算{5,6} | {7,8}，再将值给a。
print(a)

a = 1
a += 1+2
print(a)
输出：
{1, 2, 3, 4}
{1, 2, 3, 4}
{1, 2, 3, 4}
{1, 2, 3, 4}
{1, 2, 3, 4}
{1, 2, 3, 4, 5, 6, 7, 8}
4

a = {1,2,3}
b = {3,4,5}
a = a & b
a.intersection_update(b)
print(a)
b.intersection_update(a)

print(b)

a.update({1,2,3,4,5,6})
print(a)

print(a - b)
print(b - a)
print(a,b)

a -= b
输出：
{3}
{3}
{1, 2, 3, 4, 5, 6}
{1, 2, 4, 5, 6}
set()
{1, 2, 3, 4, 5, 6} {3}


# 随机产生2组各10个数字的列表,如下要求:
# 每个数字取值范围[10,20]
# 统计20个数字中,一共有多少个不同的数字?
# 2组比较,不重复的数字有几个?分别是什么?
# 2组比较,重复的数字有几个?分别是什么?
a = [1, 9, 7, 5, 6, 7, 8, 8, 2, 6]
b = [1, 9, 0, 5, 6, 4, 8, 3, 2, 3]
s1 = set(a)
s2 = set(b)
print(s1)
print(s2)
print(s1.union(s2))
print(s1.symmetric_difference(s2))
print(s1.intersection(s2))
```



### 不可变集合frozenset

Python中还有一种不可改变的集合，那就是frozenset，不像set集合，可以增加删除集合中的元素，该集合中的内容是不可改变的，类似于字符串、元组。

```python
>>> f = frozenset()
>>> f
frozenset([])
>>> f = frozenset('asdf')
>>> f
frozenset(['a', 's', 'd', 'f'])
>>> f = frozenset([1,2,3,4])
>>> f
frozenset([1, 2, 3, 4])
>>> f = frozenset((1,2,3,4))
>>> f
frozenset([1, 2, 3, 4])
>>> f = frozenset({1:2, 'a':2, 'c':3})
>>> f
frozenset(['a', 1, 'c'])
# 如果试图改变不可变集合中的元素，就会报AttributeError错误。
# 不可变集合，除了内容不能更改外，其他功能及操作跟可变集合set一样。
```

