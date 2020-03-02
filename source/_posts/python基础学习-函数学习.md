---
title: python基础学习-函数学习
date: 2020-02-21 14:19:36
tags: 函数学习
categories: python
---

#### map

```python
map是python内置函数，会根据提供的函数对指定的序列做映射。
map()函数的格式是：
map(function,iterable,...)
# 第一个参数接受一个函数名，后面的参数接受一个或多个可迭代的序列，返回的是一个元组。

把函数依次作用在iterable中的每一个元素上，得到一个新的元组并返回。注意，map不改变原iterable，而是返回一个新元组。

***map()函数实例***
del square(x):
    return x ** 2
map(square,[1,2,3,4,5])
# 结果如下:
[1,4,9,16,25]

通过使用lambda匿名函数的方法使用map()函数：
map(lambda x, y: x+y,[1,3,5,7,9],[2,4,6,8,10])
# 结果如下：
[3,7,11,15,19]

通过lambda函数使返回值是一个元组：
map(lambdax, y : (x**y,x+y),[2,4,6],[3,2,1])
# 结果如下
[(8,5),(16,6),(6,7)]

当不传入function时，map()就等同于zip()，将多个列表相同位置的元素归并到一个元组：
map(None,[2,4,6],[3,2,1])
# 结果如下
[(2,3),(4,2),(6,1)]

通过map还可以实现类型转换
将元组转换为list：
map(int,(1,2,3))
# 结果如下：
[1,2,3]

将字符串转换为list：
map(int,'1234')
# 结果如下：
[1,2,3,4]

提取字典中的key，并将结果放在一个list中：
map(int,{1:2,2:3,3:4})
# 结果如下
[1,2,3]
```



#### zip

```python
zip() 函数用于将可迭代的对象作为参数，将对象中对应的元素打包成一个个元组，然后返回由这些元组组成的列表。
如果各个迭代器的元素个数不一致，则返回列表长度与最短的对象相同，利用 * 号操作符，可以将元组解压为列表。
zip 语法：
zip([iterable, ...])

***实例***
l1=[1,2,3]
lt2=[4,5,6]
lt3=zip(l1,lt2)
#zip()是可迭代对象，使用时必须将其包含在一个list中，方便一次性显示出所有结果
#print(lt3)
#print(list(lt3))
#print(dict(lt3))

lt4=['dd','18','183']
lt5=['name','age','height']
a=zip(lt5,lt4)
print(dict(a))
#zip()参数可以接受任何类型的序列，同时也可以有两个以上的参数;
# 当传入参数的长度不同时，zip能自动以最短序列长度为准进行截取

l1, l2, l3 = (1, 2, 3), (4, 5, 6), (7, 8, 9)
print(list(zip(l1, l2, l3)))
[(1, 4, 7), (2, 5, 8), (3, 6, 9)]

str1 = 'abc'
str2 = 'def123'
print(list(zip(str1, str2)))
[('a', 'd'), ('b', 'e'), ('c', 'f')]

l1 = [1, 2, 3, 4]
l2 = [2, 3, 4, 5]
l3 = zip(l1, l2)

for i in l3:
print('for循环{}'.format(i))

l4 = [x for x in l3]
print(l4)
# 因为zip返回的是迭代器，所以上面执行过循环后，这里再使用列表生成式，生成的是空列表


l1 = [1, 2, 3, 4]
l2 = [2, 3, 4, 5]
l3 = zip(l1, l2)

l4 = [x for x in l3]
print(l4)

for i in l3:
print('for循环{}'.format(i))
###for循环没执行，因为迭代器已经到头了
##Return a zip object whose .__next__() method returns a tuple where
# the i-th element comes from the i-th iterable argument. The .__next__()
# method continues until the shortest iterable in the argument sequence
# is exhausted and then it raises StopIteration.
# 返回一个zip对象，其中.__next__()方法返回一个元组
# 第i个元素来自第i个可迭代参数。.__next__()
# 方法继续执行，直到参数序列中最短的可迭代
# 耗尽，然后引发StopIteration。
#重点就是这个 “zip对象” 是一个迭代器。 迭代器只能前进，不能后退
#它空了，所以没有执行，空的东西怎么遍历
```



#### dict

```python
dict() 函数用于创建一个字典。
dict 语法：
class dict(**kwarg)
class dict(mapping, **kwarg)
class dict(iterable, **kwarg)
参数说明：
**kwargs -- 关键字
mapping -- 元素的容器。
iterable -- 可迭代对象。

***实例***

>>>dict()                        # 创建空字典
{}
>>> dict(a='a', b='b', t='t')     # 传入关键字
{'a': 'a', 'b': 'b', 't': 't'}
>>> dict(zip(['one', 'two', 'three'], [1, 2, 3]))   # 映射函数方式来构造字典
{'three': 3, 'two': 2, 'one': 1} 
>>> dict([('one', 1), ('two', 2), ('three', 3)])    # 可迭代对象方式来构造字典
{'three': 3, 'two': 2, 'one': 1}
```

