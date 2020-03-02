---
title: python基础学习-functools
date: 2019-11-27 09:00:29
tags: python-functools
categories: python
---

### functools模块 

- partial方法
  - 偏函数，把函数部分的参数固定一下，相当于为部分的参数添加了一个固定的默认值，形成一个新的函数并返回
  - 从partial生成的新函数，是对原函数的封装

- partial方法举例 

```python
import functools

def add(x,y) -> int:
    #  -> int是对return值的注解
    return x + y

newadd = functools.partial(add,y=5)

print(newadd(7))
print(newadd(7,y=6))
print(newadd(y=10,x=6))

import inspect
print(inspect.signature(newadd))
输出：
10
13
16
(x, *, y=5) -> int
=======================================================================================
import functools

def add(x,y,*args) -> int:
    print(args)
    return x + y

newadd = functools.partial(add,1,3,6,5)

print(newadd(7))
print(newadd(7,10))
print(newadd(9,10,y=20,x=26))  
# 如果使用关键字传参，会因为给了y和x两次值而报错。如果不使用关键字参数，使用位置参数是可以被*args接收的
# 。另外，就算使用**kwargs也不能接收x=10,y=20这样的关键字参数，因为会先匹配位置参数，这会用默认值中的
# 前两个值对应x和y的值，之后再传入x=10,y=20这样的关键字参数同样会报错。
print(newadd())

import inspect
print(inspect.signature(newadd))
输出：只会把固定的前两个默认值相加，如果再传入关键字参数y，会报错
(6, 5, 7)
4
(6, 5, 7, 10)
4
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-64-9f3ecfe9a950> in <module>
      9 print(newadd(7))
     10 print(newadd(7,10))
---> 11 print(newadd(9,10,y=20,x=26))
     12 print(newadd())
     13 

TypeError: add() got multiple values for argument 'y'
(6, 5)
4
(*args) -> int
=======================================================================================
# partial函数本质
def partial(func,*args,**kwwords):
	def newfunc(*fargs,**fkeywords):
        newkeywords = keywords.copy()
        newkeywords.update(fkeywords)
        return func(*(args+fargs),**newkeywords)
    newfunc.func = func  # 保留原函数
    newfunc.args = args  # 保留原函数的位置参数
    newfunc.keywords = keywords   # 保留原函数的关键字参数
    
def add(x,y):
	return x + y

foo = partial(add,4)
foo(5)
```

- @functools.lru_cache(maxsize=128,typed=False)
  - Least-recently-used带参装饰器。lru，最近最少使用。cache缓存
  - maxsize表示最大长度，这个参数控制存多少个。如果maxsize设置为None，则禁用LRU功能，并且缓存可以无限制增长。当maxsize是二的幂时，LRU功能执行得最好
  - 如果typed设置为True，则不同类型的函数参数将单独缓存。例如，f(3)和f(3.0)将被视为具有不同结果的不同调用

- 举例

```python
import functools
import time
@functools.lru_cache()
# lru_cache是有参数的，带参装饰器的括号是不能省的
def add(x,y,z=3):
    time.sleep(z)
    ret = x + y
	print(ret)
    return ret

add(4)
add(4,5)   
# 当两次调用同一个函数且参数相同时，第二次是不会等待3秒的，会立即出结果。但是如果第一次使用了参数默认值
# ，但第二次用关键字参数赋同样的值，lru_cache会认为是两次不同的调用。
add(4.0,5)
add(4,6)
add(4,6,3)
add(6,4)
add(4,y=6)
add(x=4,y=6)
add(y=6,x=4)
# 思考：缓存的机制是什么？通过字典记录缓存的key和value，之后对字典进行查找。我们用函数的参数做key，关
# 键字参数和顺序在字典中就无关了，关键字参数只要写满了就可以，位置参数本身就是有序的
```

- lru_cache装饰器
  - 通过一个字典缓存被装饰函数的调用和返回值
  - key是什么？分析代码看看

```python
functools._make_key((4,6),{'z':3},False)
# make_key是_make_key的别名，
# tuple中有list是不能hash的，因为列表是可变的。
functools._make_key((4,6,3),{},False)
functools._make_key(tuple(),{'z':3,'x':4,'y':6},False)
functools._make_key(tuple(),{'z':3,'x':4,'y':6},True)
=======================================================================================
# 列表为什么可以hash

# class _HashedSeq(list):   # 这里相当于调用了list列表，把自己创建成列表了
#     __slots__ = 'hashvalue'
    
#     def __init__(self,tup,hash=hash):
#         self[:] = tup # 这里虽然没有定义过self，但稳含调用了list
#         self.hashvalus = hash(tup)
        
#     def __hash__(self):
#         return self.bashvalue
    
# 要创建一个类的对象，实际就是调用了list，自己创建了自己，这样就把自己创建成列表了，相当于执行了lst = []。然后再执行lst[:] = (1,2)
# 
# lst = []
# lst[:] = (1,2)
# lst
# lst[1:] = (1,2)   # 一般不用这种方式，容易搞乱
# lst
# 当每次调用hash函数时，实际执行的是__hash__(self)这个方法 ，如执行key = _HashedSeq(list)会调用
# _HashedSeq(list)并返回一个列表，列表本来是不可hash的，如果调用hash，就会调用__hash__(self)这个
# 函数，就会返回self.bashvalue，self.bashvalue就是self.hashvalus = hash(tup)，tup就是tuple元
# 组，这是在创建时把hash(tup)的值保留下来了，所以就可以hash列表了

hash((1,'a',([],)))
# 这是不可以hash的，因为tuple中有list类型，会提示：unhashable type: 'list'
```

- lru_cache装饰器
  - 斐波那契数列递归方法的改造

```python
import functools

@functools.lru_cache()   # maxsize=None
def fib(n):
    if n < 3:
        return n
    return fib(n-1) + fib(n-2)

print([fib(x) for x in range(35)])
# 使用lru_cache后，直接返回
# 从算法角度看，使用缓存就是不对的，这是用空间换时间。应该先保证算法本身优秀，再使用缓存，才是锦上添花
```

- lru_cache装饰器应用
  - 使用前提
    - 同样的函数参数一定得到同样的结果
    - 函数执行时间很长，且要多次执行
  - 本质是函数调用的参数 => 返回值
  - 缺点
    - 不支持缓存过期，key无法过期、失效
    - 不支持清除操作
    - 不支持分布式，是一个单机的缓存
  - 适用场景，单机上需要空间换时间的地方，可以用缓存来将计算变成快速的查询



### 装饰器应用练习

- 一、实现一个cache装饰器，实现可过期被清除的功能
  - 简化设计，函数的形参定义不包含可变位置参数、可变关键词参数和keyword-only参数
  - 可以不考虑缓存满了之后的换出问题
- 二、写一个命令分发器
  - 程序员可以方便的注册函数到某一个命令，用户输入命令时，路由到注册的函数
  - 用户输入用input(">>>")
  - 实现名称与函数的对应关系