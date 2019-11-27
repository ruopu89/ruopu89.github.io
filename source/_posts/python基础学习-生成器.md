---
title: python基础学习-生成器
date: 2019-11-14 11:26:56
tags: python生成器
categories: python
---

### 概念

- 生成器 generator ***
  - 生成器指的是生成器对象，可以由生成器表达式得到，也可以使用yield关键字得到一个生成器函数，调用这个函数得到一个生成器对象
- 生成器函数
  - 函数体中包含yield语句的函数就是生成器函数，返回生成器对象
  - 生成器对象，是一个可迭代对象，是一个迭代器。迭代器一定是一个可迭代对象，但可迭代对象不一定是迭代器
  - 生成器对象，是延迟计算、惰性求值的
  - 包含yield语句的生成器函数生成***生成器对象***的时候，***生成器函数的函数体不会立即执行***
  - next(generator)会从函数的当前位置向后执行到之后碰到的第一个yield语句，会弹出值，并暂停函数执行
  - 再次调用next函数，和上一条一样的处理过程
  - 没有多余的yield语句能被执行，继续调用next函数，会抛出StopIteration异常
  - 通过生成器表达式或生成器函数就可以得到一个生成器对象或简称生成器

```python
def inc():
    for i in range(5):
        yield i

print(type(inc))   # 返回函数类型，因为inc是标识符
print(type(inc()))   # 返回值是generator类型，是生成器对象

x = inc()
print(type(x))
print(next(x))
for m in x:
    print(m,'*')
for m in x:  # 不会进入这里执行
    print(m,'**')
输出：
<class 'function'>
<class 'generator'>
<class 'generator'>
0
1 *
2 *
3 *
4 *
# 普通的函数调用fn()，函数会立即执行完毕，因为用的是return语句，但是生成器函数可以使用next函数多次执行
# 生成器函数等价于生成器表达式，只不过生成器函数可以更加的复杂。

y = (i for i in range(5))
print(type(y))
print(type(y))
print(type(y))

=======================================================================================
def gen():
    print('line 1')
    yield 1
    print('line 2')
    yield 2
    print('line 3')
    return 3    # 生成器内一般不会加return语句

next(gen())  # line 1 遇到yield暂停，之后跳到下一句next(gen())执行
# 有yiele语句就会是一个生成器，这里调用一次这个gen()函数，就会返回一个生成器对象，生成器对象要拨一下转
# 一下，转到第一次遇到yield的时候，会返回1给next()，但我们不关心，print函数第一次返回line 1。
# 遇到yield语句就要暂停一下，yield语句就是拨一下转一下，是next函数在拨它，执行到第一次碰到yield为止。
# 所以第一次返回line 1，这个返回值我们是可以拿到的。(***return会终止当前函数执行，yield不会终止当前
# 函数执行，而是暂停到yield，这个暂停很特别，一般地如果一个函数没有执行完是不能执行下一句的。但这里没有
# 执行完gen()函数，而直接跳到了下一个gen()函数去执行了。***)yield有让出的意思，这里yield就让出了函
# 数，让出了当前的控制，给下一个语句，这里就是让给下一个next(gen())执行，让出给谁并不重要。所以执行第
# 二次gen()又生成了一个生成器，之后又重新开始执行，这是一个新的gen()函数调用，所以还是返回line 1。函
# 数随着调用的结束而消亡了，所以第二次调用会重新开始。
next(gen())  # line 1 
g = gen()  # 这里是第三次生成一个生成器对象并赋给了变量g
print(next(g)) 
# line 1   # 执行到这里先打印一个line 1，然后 yield返回一个1，这回next(g)是拨同一个生成器对象了，
# 因为用print包裹起来了，所以还会打印一个1，
# print 
print(next(g)) # line 2  # 这里是又拨了g函数一下，所以找下一个yield，先打印line 2，再打印2
print(next(g))  # StopIteration  这里先打印一个line 3，之后没有yield了，而且我们使用了next
# 函数调用，next函数是找下一个yield的，也就是找下一个生成器对象的值的，而不是找return的，因为找不到
# yield，所以返回StopIteration。最后一句也不会执行了。如果注释这一行就不会报错了，因为next是找下一个
# yield的，但没有了，这里会抛异常，但我们给了一个缺省值'End'，所以打印‘End'，而不会抛异常
print(next(g, 'End'))

# 一个生成器函数中，可以有多个yield表达式或return语句，碰到return，这个函数就结束了，但生成器对象还
# 在，因为引用还在，但每一次next都是要找到下一个yield
# 这里为什么用next()调用就会重新调用函数，一直返回line 1，而用print(next())就会在函数中继续向下执
# 行？这与g = gen()有关系，这一句是将gen()函数调用的值都赋给了g，而且是一个generator类型，用next()
# 一直取g的下一个值，所以会显示line 1 1 line 2 2。如果用print(next(gen()))，这一样会一直显示line 1
- 在生成器函数中，使用多个yield语句，执行一次后会暂停执行，把yield表达式的值返回
- 再次执行会执行到下一个yield语句
- return语句依然可以终止函数运行，但return语句的返回值不能被获取到
- return会导致无法继续获取下一个值，抛出StopIteration异常
- 如果函数没有显示的return语句，如果生成器函数执行到结尾，一样会抛出StopIteration异常
```



### 生成器应用

```python
# 无限循环
def counter():
    i = 0
    while True:
        i += 1
        yield i
def inc(c):
    return next(c)
c = counter()
print(inc(c))
print(inc(c))
输出：
1
2

def counter():
    i = 0
    while True:
        i += 1
        yield i
def inc():
    c = counter()
    return next(c)

print(inc())
print(inc())
print(inc())
输出：
1
1
1
# 执行了三次print(inc())，因为每次都创建一个生成器对象inc()，所以并不是同一个生成器对象，所以打印三次1

# 计数器
def inc():
    def counter():
        i = 0
        while True:
            i += 1
            yield i
    c = counter()
    return lambda:next(c)   # c对于lambda来讲是自由变量，这里是一个闭包
foo = inc()
print(foo())
print(foo())
# inc()函数调用的返回值是lambda:next(c)，lambda:next(c)不是生成器而只是拨了一下c，
# lambda:next(c)是一个新的函数，新的函数中并没有yield语句。counter()才是生成器函数。c是生成器对象，
# 我们在lambda函数中拨它，所以foo只是lambda函数的引用值，之后再调用 foo()函数，这相当于在拨c，所以这里输出1和2

# lambda表达式是匿名函数
# return返回的是一个匿名函数
# 等价于下面的代码

def inc():
    def counter():
        i = 0
        while True:
            i += 1
            yield i
   c = counter()
   def _inc():
        return next(c)
   return _inc
# 上面三行相当于之前的lambda:next(c)
foo = inc()
print(foo())
print(foo())
print(foo())

# 处理递归问题
def fib():
    x = 0 
    y = 1
    while True:
        yield y
        x,y = y,x+y
        
foo = fib()
for _ in range(5):
    print(next(foo))
    
for _ in range(100):
    next(foo)
print(next(foo))    
# 等价于下面的代码
pre = 0
cur = 1  # No1
print(pre,cur,end=' ')

# recursion
def fib1(n,pre=0,cur=1):
    pre,cur = cur,pre+cur
    print(cur,end=' ')
    if n == 2:
        return
    fib1(n-1,pre,cur)
```



- 协程 coroutine
  - 生成器的高级用法
  - 比进程、线程轻量级
  - 是在用户空间调度函数的一种实现
  - Python3 asyncio就是协程实现，已经加入到标准库
  - Python3.5 使用 async、await关键字直接原生支持协程
  - 协程调度器实现思路
    - 有2个生成器A、B
    - next(A)后，A执行到了yield语句暂停，然后去执行next(B)，B执行到yield语句也暂停，然后再次调用 next(A)，再调用next(B)，周而复始，就实现了调度的效果
    - 可以引入调度的策略来实现切换的方式
  - 协程是一种非抢占式调度



### yield from

```python
def inc():
    for x in range(1000):
        yield x
        
foo = inc()
print(next(foo))
print(next(foo))
print(next(foo))

# 等价于下面的代码
def inc():
    yield from range(1000)
    # 这一种代码相当于上面的for循环的两句代码
foo = inc()
print(next(foo))
print(next(foo))
print(next(foo))  
```

- yield from是Python3出现的新的语法

- yield from iterable 是 for item in iterable: yield item 形式的讲法糖

  - 从可迭代对象中一个个拿元素

```python
def counter(n):   # 生成器、迭代器
	for x in range(n):
		yield x
          
	def inc(n):
		yield from counter(n)
          
foo = inc(10)
print(next(foo))
print(next(foo))       
```
