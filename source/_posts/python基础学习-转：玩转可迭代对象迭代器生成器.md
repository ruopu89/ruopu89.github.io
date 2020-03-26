---
title: python基础学习-转：玩转可迭代对象迭代器生成器
date: 2020-03-11 08:58:33
tags: python迭代
categories: python
---

## 转：玩转可迭代对象迭代器生成器

原创 wayne老师 [马哥Linux运维](javascript:void(0);)   <https://mp.weixin.qq.com/s/nFSuMQxyEvJ1IxcxIgs29Q>

![](/images/python迭代/可迭代对象、迭代器与生成器2.png)

在Python中，经常可以看到可迭代对象、迭代器、生成器，如何得到一个可迭代对象，如何把它变成迭代器，如何得到生成器，它们到底有什么区别和联系呢？

简单来说，它们的关系如下图

从概念上来说，可迭代对象 > 迭代器 > 生成器。

### 可迭代对象

可迭代对象Iterable，可以认为是一个容器，其中有N个元素，可以迭代。

在Python中可以简单的认为，能够使用for循环遍历的，都是可迭代对象。常见的类型由list、tuple、range对象、str、bytes、bytearra、set、dict等。

#### 自定义可迭代对象

自定义类型，如何变成一个可迭代对象？

```
class MyIterable:
    def __str__(self):
        return "我还不是一个可迭代对象"

mi = MyIterable()
print(mi)

for i in mi:
    print(i) # 抛异常'MyIterable' object is not iterable
```

实现__iter__魔术方法

```
class MyIterable:
    def __iter__(self):
        print('iter~~~~~~~')

mi = MyIterable()
print(mi)

for i in mi:
    print(i) # 抛异常iter() returned non-iterator of type 'NoneType'
```

可以看到实例mi确实是可迭代对象了，但是返回值是None，所以报错了，看异常提示，__iter__返回一个迭代器才是正确的。

### 迭代器

迭代器Iterator

- 迭代器是一种特殊可迭代对象，一定能迭代
- 可以使用内建函数next()来获取它的下一个元素
- 使用next迭代完所有元素后，如果继续获取下一个元素，则抛出StopIteration异常
- 使用next迭代完所有元素后，不可再次迭代

判断是否是迭代器，其实如果可以使用next函数来获取元素的对象，一定是迭代器。

那么，列表是迭代器吗？

```
a = [1, 2]
print(next(a)) # 'list' object is not an iterator
```

列表对象是可迭代对象，但不是迭代器。如何把一个可迭代对象转成迭代器呢？

1. 使用内建函数iter
2. 包装成生成器对象

```
a = [1, 2]
# print(next(a)) # 'list' object is not an iterator
b = iter(a) # 内建函数iter

print(next(b))
print(next(b))
print(next(b)) # StopIteration
```

很多函数都能返回迭代器，例如enumerate

```
a = [1, 2]
c = enumerate(a) # 返回迭代器
print(next(c))
print(next(c))
for x in c: # 已经迭代完了，没有什么元素可以迭代了
    print(x)
print('=' * 30)

print(next(c)) # StopIteration
```

#### 自定义迭代器对象

那么，上面MyIterable的例子可以修改如下

```
class MyIterable:
    def __init__(self):
        self.items = [1,2,3,4,5]

    def __iter__(self):
        print('iter~~~~~~~')
        return iter(self.items)

mi = MyIterable()
print(mi)

for i in mi: # mi可以迭代了
    print(i)

for i in mi: # 可迭代对象可再次迭代
    print(i)

print(next(mi)) # 不可以使用next，说明mi不是迭代器
```

mi对象成为了可迭代对象，但是它不是迭代器。

如何得到迭代器呢？使用__next__魔术方法

```
class MyIterable:
    def __init__(self):
        self.items = [1,2,3,4,5]
        self.count = 0

    def __iter__(self):
        print('iter~~~~~~~')
        return iter(self.items)

    def __next__(self):
        print('next ~~~~')
        try:
            count = self.count
            n = self.items[count]
            self.count = count + 1
            return n
        except IndexError:
            raise StopIteration


mi = MyIterable()
print(mi)
print(next(mi))
print(next(mi))
print(next(mi))
print(next(mi))
print(next(mi))
print(next(mi)) # StopIteration
```

代码再改进一下

```
class MyIterable:
    def __init__(self):
        self.items = [1,2,3,4,5]
        self.count = 0

    def __iter__(self):
        print('iter~~~~~~~')
        #return iter(self.items)
        return self # 有__iter__我就是可迭代对象，因为有__next__，我自己就是迭代器

    def __next__(self):
        print('next ~~~~')
        try:
            count = self.count
            n = self.items[count]
            self.count = count + 1
        except:
            raise StopIteration
        return n


mi = MyIterable()
print(mi)
print(next(mi)) # 迭代器

for i in mi: # mi也是可迭代对象
    print(i)
print('-' * 30)

for i in mi: # 已经不能再次迭代
    print(i)

print('-' * 30)
print(next(mi)) # StopIteration
```

### 生成器

Python中使用2种方式获得生成器对象

- 生成器表达式
- 生成器函数

生成器是特殊的迭代器，但迭代器不一定是生成器。它是Python提供的通过编程方式快速便捷得到迭代器的手段

```
g1 = (i for i in range(5)) # 生成器表达式
print(g1) # 生成器对象
print(next(g1))
print(next(g1))
print('=' * 30)


def counter(): # 生成器函数
    for i in range(5, 10): # 可以使用yield from
        yield i

g2 = counter() # 生成器函数调用不返回结果，返回一个生成器对象
print(g2)
print(next(g2))
print(next(g2))
```

### 总结

Python 3开始，推荐在能使用迭代器的地方，考虑使用迭代器，它是惰性计算对象，不会短时间对内存和CPU造成大的压力。

可以使用生成器表达式非常便利得到一个迭代器，稍微复杂一些可以考虑使用生成器函数获得一个迭代器，如果更加复杂可以使用类来构造。