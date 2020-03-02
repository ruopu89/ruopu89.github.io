---
title: python基础学习-装饰器
date: 2019-11-18 17:41:29
tags: python装饰器
categories: python
---

### 装饰器

- 需求
  - 一个加法函数，想增强它的功能，能够输出被调用过以及调用的参数信息

```python
def add(x,y):
    return x + y
增加信息输出功能
def add(x,y):
    print("call add,x+y")   # 日志输出到控制台
    return x + y

# 上面的加法函数是完成了需求，但是有以下的缺点：
# 打印语句的耦合太高
# 加法函数属于业务功能，而输出信息的功能，属于非业务功能代码，不该放在业务函数加法中
```



- 做到了业务功能分离，但是fn函数调用传参是个问题

```python
def add(x,y):
    return

def logger(fn):
    print('begin')   # 增强的输出
    x = fn(4,5)
    print('end')   # 增加的功能
    return x

print(logger(add))
```



- 解决了传参的问题，进一步改变

```python
def add(x,y):
    return x + y

def logger(fn,*args,**kwargs):
    print('begin')
    x = fn(*args,**kwargs)
    print('end')
    return x

print(logger(add,5,y=60))
```



- 柯里化

```python
def add(x,y):
    return x + y
def logger(fn):
    def wrapper(*args,**kwargs):
        print('begin')
        x = fn(*args,**kwargs)
        print('end')
        return x
    return wrapper

print(logger(add)(5,y=50))
# 换一种写法
add = logger(add)
print(add(x=5,y=10))
```



- 装饰器语法糖

```python
def logger(fn):
    def wrapper(*args,**kwargs):
        print('begin')
        x = fn(*args,**kwargs)
        print('end')
        return x
    return wrapper

@logger  # 等价于add = logger(add)
def add(x,y):
    return x + y

print(add(45,40))
# @logger是什么？这就是装饰器语法
```



- 装饰器（无参）
  - 它是一个函数
  - 函数作为它的形参
  - 返回值也是一个函数
  - 可以使用@functionname方式，简化调用
- 装饰器和高阶函数
  - 装饰器是高阶函数，但装饰器是对传入函数的功能的装饰（功能增强）

```python
import datetime
import time

def logger(fn):
    def wrap(*args,**kwargs):
        # before功能增强
        print("args={},kwargs={}".format(args,kwargs))
        start = datetime.datetime.now()
        ret = fn(*args,**kwargs)
        # after功能增强
        duration = datetime.datetime.now() - start
        print("function {} to ok {}s".format(fn.__name__,duration.total_seconds()))
        return ret
    return wrap

@logger  # 相当于 add = logger(add)
def add(x,y):
    print("=====call add=====")
    time.sleep(2)
    return x + y

print(add(4,y=7))
```



- 怎么理解装饰器

![](/images/python装饰器/装饰器1.png)

![](/images/python装饰器/装饰器2.png)

```python
def add(x,y,file):
    print("call {},{}+{}".format(add.__name__,x,y),file=file)  
# 双下划线是函数的特殊属性，__name__可以获取函数的名称，file是print()的选项，可以输出到外面，如果要灵
# 活设置参数，应该把参数写到上面定义add函数的地方，print中前一个file是形参，后一个file是传进来的参数
    return x+y
add(4,5)
# 通过嵌套函数可以实现用外部函数将里面的函数包起来
输出：
call add,4+5
9
=======================================================================================
def add1(x,y):
    return x + y

def add2(x,y,z):
    return x+y+z

def add3(x,y,*args,z):
    return x+y+z

def logger(fn,*args,**kwargs):  # 这里用了两个可变参数
    print('before')
    ret = fn(*args,**kwargs)   # 这里用的是解参数
    print('after')
    return ret

print(logger(add2,4,x=5,y=6))   
# 这里调用的时候，logger中fn对应的是add2，*args对应的是4,**kwargs对应的是x=5，y=6。当调用fn()函数
# 时，会将*args等于4，**kwargs等于x=5,y=6代入到add2()函数中，这时，x为4，y为5，z为6，但顺序不一定
# 是这样排列的。最后返回x+y+z的值，并赋值给ret并结束
print(logger(add3,4,z=5,y=6))
输出：
before
after
15
before
after
15

def logger(fn):
    def _logger(*args,**kwargs):   
# 这里定义的参数是根据外层要调用的函数来设计的，如外层的add1到add3函数，这里这样定义都可以满足外层函数
# 的要求。
# 柯里化就是把第一个参数拿到外面来，之后的参数放到内层函数中去，因为是嵌套函数，里边的函数要能被用到，总
# 要返回一个值，上面返回的是内层函数的一个引用，这里就返回了_logger
        print('before')
        ret = fn(*args,**kwargs)   
        # 这里用的是解参数。这里一定要写成这样，不能在这里用return，不然下面就不执行了
        print('after')
        return ret   # 被包装函数也应该返回，不然会破坏原函数，原函数本来有返回的。
    return _logger 
# 这个_logger函数叫包装函数，里面的fn函数叫被包装函数，这一句非常重要，一定要有返回值，一定返回内层函数
# 的引用。我们这里对原函数没有任何侵入式
# foo = logger(add1)
# print(foo(4,5))

# logger(add1)(40,30)

# add1 = logger(add1)   
# fn是自由变量，里面引用时成为闭包，这个变量被留下来了。python提供了一种简单的方式，@logger，如下
@logger  
# 装饰器函数，add1 = logger(add1)，这里add1被覆盖掉了，之后再调用add1就相当于调用内层函数_logger，
# _logger中的fn函数才是真正进行运算的。_logger函数就相当于add1函数的增强版，即实现了add1函数的功能，
# 还增加了其他功能。把函数加上@后，就会把其下面的函数当作参数传入加@的函数中，再次调用add1时，执行的实
# 际是logger函数
def add1(x,y):
    return x + y
add1(4,100)
输出：
before
after
104

# 如果换成下面的写法，它的本质是，返回了内层函数_logger，_logger中的fn并没有丢，通过闭包把这个外部变
# 量保存下来了，当真正调用add1时，实际上调用的是内层函数_logger，调用内层函数_logger时，这个fn还在，
# 它保存在自由变量里，这个fn才是真正被包装的函数，也就是最原始的那个函数，现在的add1已经被覆盖掉了，所
# 以print()中的add1已经是内层函数了，传参被_logger函数的参数接收了，接收后放在fn函数中，这就是保存下
# 来的自由变量，指向的是外部的add1函数
add1 = logger(add1)   
print(add1(x=5,y=10))
# 装饰器是一种语法糖，对上面两行代码的代替。用@logger代替add1 = logger(add1)，而且logger函数应该写
# 在@logger前面，不然@logger会提示不认识logger函数。这里必须先定义logger函数，之后定义装饰器函数
# @logger，最后定义add1函数
@logger   
# 装饰器只接收到add1函数的标识符，并不包括参数，参数由内层函数_logger管
def add1(x,y):   # 这里是原始的add1函数标识符
    return x + y
print(add1(45,40))   # 这里调用的是被装饰器函数修改过的add1函数，指的是内层函数的一个引用

# 装饰器函数主要是为了装饰，但函数功能增强，必免侵入式
```



- 副作用

```python
def logger(fn):
    def wrapper(*args,**kwargs):
        'I am wrapper'
        print('begin')
        x = fn(*args,**kwargs)
        print('end')
        return x
    return wrapper

@logger  # add = logger(add)
def add(x,y):
    '''This is a function for add'''
    return x + y

print("name={},doc={}".format(add.__name__,add.__doc__))
# 原函数对象的属性都被替换了，而使用装饰器，我们的需求是查看被封装函数的属性，如何解决？
```



- 提供一个函数，被封装函数属性 ==copy==>包装函数属性

```python
# def copy_properties(src,dst):
#     dst.__name__ = src.__name__
#     dst.__doc__ = src.__doc__
#     dst.__qualname__ = src.__qualname__
# 把上面的代码改为装饰器，如下：
def copy_properties(src):
    def _copy(dst):
        dst.__name__ = src.__name__
        dst.__doc__ = src.__doc__
        dst.__qualname__ = src.__qualname__   
        return dst 
    return _copy
    
def logger(fn): 
    @copy_properties(fn)  # wrapper = copy_properties(fn)(wrapper)
# 这里先不看@符号，copy_properties(fn)这个函数调用中的fn参数会被传到copy_properties函数中当作
# src参数，下面的add会被当作fn从logger传进来，这时add就变成copy_properties的src参数了，这里返回
# 的就是_copy这个内层函数了。当copy_properties(fn)加了@后，就相当于@_copy，即使是同一个函数对象，
# 不同次调用，里面的结果都不一样，因为_copy是嵌入在内层的函数，在外部是不可见的，所以要用函数调用返回
# 回来，相当于@copy_properties.wrapper = @_copy，@_copy要将其下面的函数的名字当作参数传入，这样就
# 成了_copy(logger.wrapper)，也就是说logger中的wrapper函数要作为参数传到_copy中去，它会把@下面的
# wrapper覆盖一次，_copy(wrapper)返回什么，在_copy中就应该返回什么，也就是说_copy一定要有返回值，
# 而不能是None，如果是None，那么下面的wrapper函数也就无法执行了，_copy(wrapper)的返回值还要赋值给
# wrapper，_copy(wrapper)的值就是它自己，也就是dst。使用装饰器时，有几层就要return几层。
    def wrapper(*args,**kwargs):
# 柯里化就是把第一个参数拿到外面来，之后的参数放到内层函数中去，因为是嵌套函数，里边的函数要能被用到，总
# 要返回一个值，这里返回的是内层函数的一个引用，这里就返回了wrapper
        '''This is a wrapper'''
        print('before')
        ret = fn(*args,**kwargs)   # 这里用的是解参数。这里一定要写成这样，不能在这里用return，不然下面就不执行了
        print('after')
        return ret   # 被包装函数也应该返回，不然会破坏原函数，原函数本来有返回的。
#     copy_properties(fn,_logger)   
#  这是一个普通函数调用，与wrapper函数没关系。这一句放在这里时，已经有了wrapper和fn函数另外，这一句一
# 定要放在return _logger前。这个return就是装饰器@logger干的事情，这个装饰器相当于有一个函数调用，调
# 用时给logger传一个实参，fn就是add，def _logger是定义，什么都不用动，因为还没有调用它，这里指外部还
# 没有调用过logger函数，如print(logger(add1(39,23)))这样。这时执行copy_properties函数，将fn的属
# 性复制给_logger，那么当使用help或用__name__或__doc__时，就会显示add函数的属性了
    return _logger

@logger   
# 加入装饰器后，看一下add.__name和add.__doc__是不是还是add。结果显示是_logger，但我们想看的是add的帮助文档
# 这里本身也不应该改变原函数的帮助文档。所以要添加一个copy_properties函数，并在logger函数中调用
def add(x,y):
    'This is a function'  # 文档字符串，必须放在函数后的第一行，如果有多行，要用三引号
    ret = x + y
    return ret

# add(4,100)
print(add.__name__,add.__doc__,add.__qualname__,sep='\n')
# print(help(add))
# help本身就是在调用__name__和__doc__这些东西
# __qualname__与add没有关系，这个打印的叫限定名
print("name={},doc={}".format(add.__name__,add.__doc__))
```



- 通过`copy_properties`函数将被包装函数的属性覆盖掉包装函数
- 凡是被装饰的函数都需要复制这些属性，这个函数很通用
- 可以将复制属性的函数构建成装饰器函数，带参装饰器



### 带参装饰器

```python
# 获取函数的执行时长，对超过阈值的函数记录一下
import datetime
import time

def copy_properties(src):
    def _copy(dst):
        dst.__name__ = src.__name__
        dst.__doc__ = src.__doc__
        dst.__qualname__ = src.__qualname__   
        return dst 
    return _copy

def logger(duration):
    def _logger(fn):
        @copy_properties(fn)   # wrapper = wrapper(fn)(wrapper)
        # 这里使用上面定义的copy_properties函数
        def wrapper(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            delta = (datetime.datetime.now() - start).total_seconds()
            print('so slow') if delta > duration else print('so fast')
            return ret
        return wrapper
    return _logger

@logger(5)  
# add = logger(5)(add)，logger()的duration参数就是这里传入的5，_logger的参数就是这里传入的add，
# 之后再通过 print('so slow') if delta > duration else print('so fast')与duration传参比较，
# 如果执行时间大于这个传参就是慢的，否则执行就是快的
def add(x,y):
    time.sleep(3)
    return x + y

print(add(5,6))
输出：
so fast
11
```



- 带参装饰器
  - 它是一个函数
  - 函数作为它的形参
  - 返回值是一个不带参的装饰器函数
  - 使用@functionname(参数列表)方式调用
  - 可以看做在装饰器外层又加了一层函数



```python
# 将记录的功能提取出来，这样就可以通过外部提供的函数来灵活的控制输出
import datetime
import time

def copy_properties(src):
    def _copy(dst):
        dst.__name__ = src.__name__
        dst.__doc__ = src.__doc__
        dst.__qualname__ = src.__qualname__   
        return dst 
    return _copy

def logger(duration,func=lambda name,duration:print('{} to ok {}s'.format(name,duration))): 
# 这里前面的duration与后面的duration不是同一个，前面是logger函数的形参，后面的是匿名函数的形参
    def _logger(fn):
        @copy_properties(fn)   # wrapper = wrapper(fn)(wrapper)
        def wrapper(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            delta = (datetime.datetime.now() - start).total_seconds()
            if delta > duration:
                func(fn.__name__,delta)
           # 向匿名函数中传递两个参数，一个是执行函数的名称，一个是实际执行的时间
            return ret
        return wrapper
    return _logger

@logger(3)  # add = logger(5)(add)
def add(x,y):
    time.sleep(3)
    return x + y

print(add(5,6))
输出：
add to ok 3s
# 这里的add就是上面判断中fn.__name__得到的
11
```



#### 练习

```python
# 获取函数的执行时长，对超过阈值的函数记录一下
import datetime
import time

def logger(t):
    def _logger(fn):
        def wrap(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            duration = (datetime.datetime.now() - start).total_seconds()
            if duration > t:
                print("function {} to ok {}s.".format(fn.__name__,duration))
            return ret
        return wrap
    return _logger

@logger(3)   # add = logger(3)(add)
def add(x,y):
    print("=====call add=====")
    time.sleep(5)
    return x + y

print(add(5,6))

# 带参装饰器最多三层
def logger(t1,t2):
    def _logger(fn):
        def wrap(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            duration = (datetime.datetime.now() - start).total_seconds()
            if duration > t1 and duration < t2:
                print("function {} to ok {}s.".format(fn.__name__,duration))
            return ret
        return wrap
    return _logger

@logger(3,5)   # add = logger(50)(add)
def add(x,y):
    print("=====call add=====")
    time.sleep(5)
    return x + y

print(add(5,6)) 

=======================================================================================
def logger(fn):
    return 10

@logger  
# 这里等价于add1 = logger(add1)，加了@实际就是把其下面的函数拿来做参数转入这个加了@函数
def add1(x,y):  # 这样做完，add1就变成了上面的logger函数中的return 10了
    return x + y

print(add1)
# 这里借用了装饰器的语法，但并没有对函数进行装饰
```



### 文档字符串

- python的文档
  - python是文档字符串Documentation Strings
  - 在函数语句块的第一行，且习惯是多行的文本，所以多使用三引号
  - 惯例是首字母大写，第一行写概述，空一行，第三行写详细描述
  - 可以使用特殊属性`__doc__`访问这个文档

```python
def add(x,y):
    """This is a function of addition"""
    a = x + y
    return x + y

print("name={}\ndoc={}".format(add.__name__,add.__doc__))
print(help(add))
```



### functools模块

```python
- functools.update_wrapper(wrapper,wrapped,assigned=WRAPPER_ASSIGNMENTS,updated=WRAPPER_UPDATES)
- 类似copy_properties功能
- wrapper：包装函数、被更新者，wrapped：被包装函数、数据源
- 元组WRAPPER_ASSIGNMENTS中是要被覆盖的属性
- '__module__'，'__name__'，'__qualname__'，'__doc__'，'__annotations__'
- 表示模块名、名称、限定名、文档、参数详解
- 元组WRAPPER_UPDATES中是要被更新的属性，__dict__属性字典
- 增加一个__wrapped__属性，保留着wrapped函数

import datetime,time,functools

def logger(duration,func=lambda name,duration:print('{} to ok {}s'.format(name,duration))):
	def _logger(fn):
        def wrapper(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            delta = (datetime.datetime.now() - start).total_seconds()
            if delta > duration:
                func(fn.__name__,duration)
            return ret
        return functools.update_wrapper(wrapper,fn)
    return _logger

@logger(5)   # add = logger(5)(add)
def add(x,y):
    time.sleep(1)
    return x + y

print(add(5,6),add.__name__,add.__wrapped__,add.__dict__,sep='\n')

- @functools.wraps(wrapped,assigned=WRAPPER_ASSIGNMENTS,updated=WRAPPER_UPDATES)
- 类似copy_properties功能
- wrapped被包装函数
- 元组WRAPPER_ASSIGNMENTS中是要被覆盖的属性
- '__module__'，'__name__'，'__qualname__'，'__doc__'，'__annotations__'
- 表示模块名、名称、限定名、文档、参数详解
- 元组WRAPPER_UPDATES中是要被更新的属性，__dict__属性字典
- 增加一个__wrapped__属性，保留着wrapped函数

import datetime,time,functools

def logger(duration,func=lambda name,duration:print('{} to ok {}s'.format(name,duration))):
	def _logger(fn):
        @functools.wraps(fn)
        def wrapper(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            delta = (datetime.datetime.now() - start).total_seconds()
            if delta > duration:
                func(fn.__name__,duration)
            return ret
        return wrapper
    return _logger

@logger(5)   # add = logger(5)(add)
def add(x,y):
    time.sleep(1)
    return x + y

print(add(5,6),add.__name__,add.__wrapped__,add.__dict__,sep='\n')
```



### 个人总结

- 装饰器是对现有函数的增强
- 看到装饰器的图时，就会想到钢铁侠的反浩克装甲---维罗妮卡
- 装饰之后调用的还是原函数的名字，但功能已经是装饰后的效果了
- 装饰器函数的内层函数就是原函数的增强代码，即实现原函数功能，又增加了功能
- 函数加了@符号后，就会将其下面的函数当作参数传入到加了@符号的函数中
- 带参装饰器可以有多个参数，并且也会把其下面的函数当作参数传入这个带参的函数中的内层函数里
- 带参装饰器一般最多使用三层，每一层都返回其内层函数的函数名，这样就可以使用内层函数被上一层函数调用。只有最内一层的函数返回的是原函数的值
- 装饰器函数演化过程

```python
1. 普通函数
def add(x,y):
    return x + y

2. 加强功能
def add(x,y):
    print("call add,x+y")   # 日志输出到控制台
    return x + y

3. 业务分离
def add(x,y):
    return ...

def logger(fn,*args,**kwargs):
    ...
    x = fn(*args,**kwargs)
    ...
    return x

4. 柯里化
def add(x,y):
    return ...

def logger(fn):   # 柯里化就是把第一个参数提出去，之后的参数当内层函数的参数
    def wrapper(*args,**kwargs):
        ...
        x = fn(*args,**kwargs)
        ...
        return x
    return wrapper
# 下面是调用方法
print(logger(add)(5,y=50))
# 换一种写法
add = logger(add)
print(add(x=5,y=10))

5. 装饰器语法糖
def logger(fn):
    def wrapper(*args,**kwargs):
        ...
        x = fn(*args,**kwargs)
        ...
        return x
    return wrapper
@logger   # 等价于add = logger(add)，add在logger中就是fn了
def add(x,y):
    return ...

6. 带参装饰器
# 因为无法使用原函数的属性信息，所以讲到了带参装饰器
def copy_properties(src):
    def _copy(dst):
        ...
        return dst
    return _copy
# 因为_copy就是wrapper，这里只是把原函数的属性信息复制到目标函数中，目录函数就是下面的wrapper，因为上
# 面讲到过，装饰器就是用wrapper函数覆盖了原函数，所以要把原函数的属性保留在wrapper中
def logger(duration): 
    @copy_properties(fn)  # wrapper = copy_properties(fn)(wrapper)
    def wrapper(*args,**kwargs):
        ...
# 这实际就是把原函数当做fn，wrapper当作dst传入到了带参装饰器中

7. 多参数装饰器
def logger(t1,t2):
    def _logger(fn):
        def wrap(*args,**kwargs):
            start = datetime.datetime.now()
            ret = fn(*args,**kwargs)
            duration = (datetime.datetime.now() - start).total_seconds()
            if duration > t1 and duration < t2:
                print("function {} took {}s.".format(fn.__name__,duration))
            return ret
        return wrap
    return _logger

@logger(3,5)   # add = logger(50)(add)。这里的参数数量与上面定义的logger的参数数量是一样的
def add(x,y):
    
8. functools模块
# 这个模块中的update_wrapper函数和wraps装饰器函数可以实现上面的copy_properties函数的功能，并且比我
# 们自己写的函数的功能强。update_wrapper(wrapper,wrapped,assigned=,updated=)中的wrapper指包
# 装，wrapped指被包装。被包装的是外面的add函数，是原函数，包装功能的是里面的wrapper函数实现的。
# assigned表示wrapper中的属性信息要被wrapped中的属性信息覆盖掉，也就是保留原函数的属性信息；updated
# 指把wrapped中字典属性加到wrapper的字典属性中，如果key相同就覆盖了，如果不同就追加。

- update_wrapper函数
import functools
def logger(fn):  
    @copy_properties(fn)
    def _logger(*args,**kwargs):
        '''This is a wrapper'''
        print('before')
        ret = fn(*args,**kwargs)  
        print('after')
        return ret   
    functools.update_wrapper(_logger,fn)  
    # 
    # wrapped得是fn，不能是add，因为这里要用一个参数
    print("{} {}".format(id(_logger),id(fn)))   
    # 看一下下面打印的add1.__wrapped__是_logger的还是fn的
    return _logger

@logger  
def add1(x,y):
    'This is a function'  
    ret = x + y
    return ret

# add1(4,100)
print(add1.__name__,add1.__doc__,add1.__qualname__,sep='\n')
print('*'*40)
print(id(add1.__wrapped__))   
# 这是fn的id，所以这个新增的__wrapped__就是把fn给放进去了，这样就能找到原来的函数是谁了
输出：
139975566907728 139975566908408
add1
This is a function
add1
****************************************
139975566908408

- wraps函数
# 这个装饰器函数只需要wrapped，而不需要wrapper，因为是装饰器函数，所以用@来将其下面的函数当做参数传入
# 了，所以无需指定wrapper
import functools
def logger(fn):  
    @functools.wraps(fn)  
    # wraps函数只需要写wrapped即可，至于wrapper，因为这里用了@符号，所以会把其下面的函数当作wrapper传入，这相当于
    # functools.wraps(fn)(_logger)
    def _logger(*args,**kwargs):
        '''This is a wrapper'''
        print('before')
        ret = fn(*args,**kwargs)  
        print('after')
        return ret   
#     functools.update_wrapper(_logger,fn)  # wrapped得是fn，不能是add，因为这里要用一个参数
    print("{} {}".format(id(_logger),id(fn)))   
    # 看一下下面打印的add1.__wrapped__是_logger的还是fn的
    return _logger

@logger  
def add1(x,y):
    'This is a function'  
    ret = x + y
    return ret

# add1(4,100)
print(add1.__name__,add1.__doc__,add1.__qualname__,sep='\n')
print('*'*40)
print(id(add1.__wrapped__)) 
print('@'*40)
print(add1.__wrapped__(4,90))  
# 打印出了94，这说明__wrapped__保存了原函数的功能，这只是证明，而不是真正使用的方法
输出：
139975561244184 139975561244048
add1
This is a function
add1
****************************************
139975561244048
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
94
```

