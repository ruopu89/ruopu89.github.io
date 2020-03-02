---
title: python基础学习-参数注解
date: 2019-11-26 16:51:48
tags: python参数注解
categories: python
---

### 函数定义的弊端

- python是动态语言，变量随时可以被赋值，且能赋值为不同的类型
- python不是静态编译型语言，变量类型是在运行器决定的
- 动态语言很灵活，但是这种特性也是弊端

```python
def add(x,y):
    return x + y
print(add(4,5))
print(add('hello','world'))
add(4,'hello')
- 难发现：由于不做任何类型检查，直到运行期问题才显现出来，或者线上运行时才能暴露出问题
- 难使用：函数的使用者看到函数的时候，并不知道你的函数的设计，并不知道应该传入什么类型的数据
```

- 如何解决这种动态语言定义的弊端呢？
  - 增加文档Documentation String
    - 这只是一个惯例，不是强制标准，不能要求程序员一定为函数提供说明文档
    - 函数定义更新了，文档未必同步更新

```python
def add(x,y):
    '''
    :param x:int
    :param y:int
    :return:int
    '''
    return x + y
print(help(add))
```



### 函数注解 Function Annotations

- 如何解决这种动态语言定义的弊端呢？
  - 函数注解

```python
def add(x:int,y:int) -> int:   # x和y都是int类型，return也是int类型，这只是提示，不会阻止用户使用
    '''
    :param x:int
    :param y:int
    :return:int
    '''
    return x + y
print(help(add))
print(add(4,5))
print(add('mag','edu'))
```

- 函数注解
  - python 3.5 引入
  - 对函数的参数进行类型注解
  - 对函数的返回值进行类型注解
  - 只对函数参数做一个辅助的说明，并不对函数参数进行类型检查
  - 提供给第三方工具，做代码分析，发现隐藏的bug，是否return了指定的类型，但不是强制的
  - 函数注解的信息，保存在`__annotations__`属性中

```python
add.__annotations__   # __annotations__里保存了函数的注解信息
{'x':<class 'int', 'y': <class 'int'>, 'return': <class 'int'>}
返回：
Out[3]:{'x': int, 'y': int, 'return': int}
```

- 变量注解

  - python 3.6 引入

    `i:int=3`



### 业务应用

- 函数参数类型检查
- 思路
  - 函数参数的检查，一定是在函数外
  - 函数应该作为参数，传入到检查函数中
  - 检查函数拿到函数传入的实际参数，与形参声明对比
  - `__annotations__`属性是一个字典，其中包括返回值类型的声明。假设要做位置参数的判断，无法和字典中的声明对应。使用inspect模块
- inspect模块
  - 提供获取对象信息的函数，可以检查函数和类、类型检查



### inspect模块

- signature(callable)，获取签名（函数签名包含了一个函数的信息，包括函数名、它的参数类型、它所在的类和名称空间及其他信息）

```python
import inspect
# 这里用这个模块就是为了检查函数
def add(x:int, y:int, *args,**kwargs) -> int:
	return x + y
# keyw ord-only不是可变类型，可以带注解 
print(add.__annotations__)
# __annotations__返回的是一个普通字典，不能用。如果取return的值可以，因为只有一个返回值，如果要取x和
# y的值，就要明确指定取x和y的值，不能用位置对应
# 返回：{'x': <class 'int'>, 'y': <class 'int'>, 'return': <class 'int'>}
sig = inspect.signature(add)   # 拿add的签名
# 返回：(x:int, y:int, *args,**kwargs) -> int，也就是函数定义的东西，这就是函数签名。签名是不能直
# 接用的，inspect替我们封装了，返回的值只是对外的表现形式。取到了签名就把这个可调用对象的定义全部拿到了
# 。和运行的东西没关系
print(sig, type(sig)) # 函数签名就是函数定义的那个样子
# 大多数对象都可以强制转化为字符串的，相当于它内部有一个类型可以把它描述为一个字符串，但它本身的类型不是
# 字符串。返回值把上面的签名放在了一个有序的字典中
# 返回：(x: int, y: int, *args, **kwargs) -> int <class 'inspect.Signature'>
print('params : ', sig.parameters) # OrderedDict
# sig.parameters表示对这个类型拿它的参数们，要用有序字典，如果不用有序字典后面对应时就乱了
# 返回：params: OrderedDict([('x', <Parameter "x: int">), ('y', <Parameter "y: int">), ('args', <Parameter "*args">), ('kwargs', <Parameter "**kwargs">)])
print('return : ', sig.return_annotation)
# sig.return_annotation拿的是返回值的声明
# 返回：return: <class 'int'>
print(sig.parameters['y'], type(sig.parameters['y']))
# 把某个变量名给有序字典，这里是y
# 返回：y: int <class 'inspect.Parameter'>，后面的<>中的内容是type()输出的
print(sig.parameters['x'].annotation)
# 这是通过变量名找value再找annotation属性，也就是注解
# 返回：<class 'int'>
print(sig.parameters['args'])
# 返回：*args
print(sig.parameters['args'].annotation)
# 返回：<class 'inspect._empty'>
print(sig.parameters['kwargs'])
# 返回：**kwargs
print(sig.parameters['kwargs'].annotation)
# 返回：<class 'inspect._empty'>
# 有了签名就可以拿到所有的定义，包括参数定义的一个列表，这个列表是用一个有序字典来表示的，我们可以把有序
# 字典中的内容迭代出来，迭代拿到的每一个元素都是key和value，key就是它的名称，名称一定是一个字符串，
# value本身就是参数对象，参数对象应该有名字有注解，注解可能为空，还有缺省值，缺省值可能没设定，也是空，
# 有一个常量就叫empty，可以看出key的形参的类型是什么，有可能是位置的或者是keyword，要么是可变的标示符
# 形参变量，有可能是keyword-only或是可变是keyword
```

- `inspect.isfunction(add)`，是否是函数，isfunction可以限定这个函数只是函数，如果这个函数放在类里面就变成类的方法了，叫类方法，不能叫function了
- `inspect.ismethod(add)`，是否是类的方法
- `inspect.isgenerator(add)`，是否是生成器对象
- `inspect.isgeneratorfunction(add)`，是否是生成器函数
- `inspect.isclass(add)`，是否是类
- `inspect.ismodule(inspect)`，是否是内建对象
- `inspect.isbuiltin(print)`，是否是内建对象
- inspect()的签名可以把定义的可调用对象全部收集好，并用有序字典保存，这解决了顺序传参的时候和形参对应的问题
- 还有很多is函数，需要的时候查阅inspect模块帮助
- Parameter（参数）对象
  - 保存在元组中，是只读的
  - name，参数的名字
  - annotation，参数的注解，可能没有定义
  - default，参数的缺省值，可能没有定义
  - empty，Parameter对象提供的特殊常量，就代表-empty，_empty是inspect模块里定义的。但这两个是同一个东西，它是特殊的类，用来标记default属性或者注释annotation属性的空值
  - kind，实参如何绑定到形参，就是形参的类型
    - POSITIONAL_ONLY，值必须是位置参数提供，这种没有实现
    - POSITIONAL_OR_KEYWORD，值可以作为关键字或者位置参数提供
    - VAR_POSITIONAL，可变位置参数，对应`*args`
    - KEYWORD_ONLY，keyword-only参数，对应`*`或者`*args`之后出现的非可变关键字参数
    - VAR_KEYWORD，可变关键字参数，对应`**kwargs`
    - 如果用参数类型判断，可以用除第一个的剩下四个，实参传进来的数据类型就是注解的事了
- 举例

```python
import inspect
def add(x, y:int=7, *args, z, t=10,**kwargs) -> int:
	return x + y
sig = inspect.signature(add)
print(sig)
# 返回：(x, y: int = 7, *args, z, t=10, **kwargs) -> int
print('params : ', sig.parameters) # 有序字典
# 返回：params: OrderedDict([('x', <Parameter "x">), ('y', <Parameter "y: int = 7">), ('args', <Parameter "*args">), ('z', <Parameter "z">), ('t', <Parameter "t=10">), ('kwargs', <Parameter "**kwargs">)])
print('return : ', sig.return_annotation)
# 返回：return <class 'int'>
print('~~~~~~~~~~~~~~~~')
for i, item in enumerate(sig.parameters.items()):
# 这里可以写成for i, (name,param) in enumerate(sig.parameters.items()):， 这样就不用下一行了
    name, param = item
    print(i+1, name, param.annotation, param.kind, param.default)
    print(param.default is param.empty, end='\n\n')
# 返回：
# 1 x <class 'inspect._empty'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
# True
# 
# 2 y <class 'int'> POSITIONAL_OR_KEYWORD 7
# False
# 
# 3 args <class 'inspect._empty'> VAR_POSITIONAL <class 'inspect._empty'>
# True
# 
# 4 z <class 'inspect._empty'> KEYWORD_ONLY <class 'inspect._empty'>
# True
# 
# 5 t <class 'inspect._empty'> KEYWORD_ONLY 10
# False
# 
# 6 kwargs <class 'inspect._empty'> VAR_KEYWORD <class 'inspect._empty'>
# True
add(4)
add(4,7)
add('mag','edu')
```

- 有函数如下

```python
def add(x,y:int=7) -> int:
    return x + y
```

- 请检查用户输入是否符合参数注解的要求？

- 思路
  - 调用时，判断用户输入的实参是否符合要求
  - 调用时，用户感觉上还是在调用add函数
  - 对用户输入的数据和声明的类型进行对比，如果不符合，提示用户

```python
import inspect
def add(x, y:int=7) -> int:
	return x + y

def check(fn):
	def wrapper(*args, **kwargs):
        
		sig = inspect.signature(fn)
		params = sig.parameters
        # 这里params拿到了一个有序字典
        # 返回：OrderedDict([('x', <Parameter "x">), ('y', <Parameter "y: int = 7">)])
		values = list(params.values())

		for i,p in enumerate(args):
			if isinstance(p, values[i].annotation): # 实参和形参声明一致
				print('==')
		for k,v in kwargs.items():
			if isinstance(v, params[k].annotation): # 实参和形参声明一致
				print('===')
		return fn(*args, **kwargs)
	return wrapper



调用测试
check(add)(20,10)
check(add)(20,y=10)
check(add)(y=10,x=20)
# 输出：
# ==
# ===
# ===
# Out[29]: 30
业务需求是参数有注解就要求实参类型和声明应该一致，没有注解的参数不比较，如何修改代码？
=======================================================================================
import inspect

def check(fn):
	def wrapper(*args, **kwargs):
		sig = inspect.signature(fn)
		params = sig.parameters
		values = list(params.values())
		for i,p in enumerate(args):
			param = values[i]
			if param.annotation is not param.empty and not isinstance(p, param.annotation):
				print(p,'!==',values[i].annotation)
		for k,v in kwargs.items():
			if params[k].annotation is not inspect._empty and not isinstance(v, params[k].annotation):
				print(k,v,'!===',params[k].annotation)
		return fn(*args, **kwargs)
	return wrapper

@check
def add(x, y:int=7) -> int:
	return x + y

调用测试
add(20,10)
add(20,y=10)
add(y=10,x=20)
# 输出是一样的
# Out[35]: 30
```



### 课堂实验

```python
# 签名在第一行里都有了
def add(x:int,y:int,*args,**kwargs) -> int:   
    # -> int表示return的返回值类型。签名是将定义的东西就全部拿到了
    return x + y

add(4)
add(4,7)
add('mag','edu')
输出：
(x: int, y: int) -> int
params :  OrderedDict([('x', <Parameter "x: int">), ('y', <Parameter "y: int">)])
return :  <class 'int'>
~~~~~~~~~~~~~~~~~~~
1 x <class 'int'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

2 y <class 'int'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-4-7eb697bf4048> in <module>
     14     print(param.default is param.empty,end='\n\n')
     15 
---> 16 add(4)
     17 add(4,7)
     18 add('mag','edu')

TypeError: add() missing 1 required positional argument: 'y'
=======================================================================================
import inspect
def add(x,y:int=7,*args,z,t=10,**kwargs) -> int:   # 定义x，没有注解和默认值。定义y，注解是int类型，默认值是7
    return x + y

sig = inspect.signature(add)
print(sig)

print('params : ',sig.parameters)
print('return : ',sig.return_annotation)
print('~~~~~~~~~~~~~~~~~~~')

for i, item in enumerate(sig.parameters.items()):
    name,param = item
    print(i+1,name,param.annotation,param.kind,param.default)
    # 先打印序号，从1开始，之后是参数的名称，再之后是参数的属性信息， param.annotation表示参数是否有注解；param.kind表示形参的类型；param.default表示
    print(param.default is param.empty,end='\n\n')
    # 这一行判断默认值是否为空，这是一个布尔类型。这里的param.empth和inspect._empth是等价的
    
add(4)
add(4,7)
add('mag','edu')

输出：
(x, y: int = 7, *args, z, t=10, **kwargs) -> int
params :  OrderedDict([('x', <Parameter "x">), ('y', <Parameter "y: int = 7">), ('args', <Parameter "*args">), ('z', <Parameter "z">), ('t', <Parameter "t=10">), ('kwargs', <Parameter "**kwargs">)])
return :  <class 'int'>
~~~~~~~~~~~~~~~~~~~
1 x <class 'inspect._empty'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

2 y <class 'int'> POSITIONAL_OR_KEYWORD 7
False

3 args <class 'inspect._empty'> VAR_POSITIONAL <class 'inspect._empty'>
True

4 z <class 'inspect._empty'> KEYWORD_ONLY <class 'inspect._empty'>
True

5 t <class 'inspect._empty'> KEYWORD_ONLY 10
False

6 kwargs <class 'inspect._empty'> VAR_KEYWORD <class 'inspect._empty'>
True

---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-2-437d73ce568b> in <module>
     15     print(param.default is param.empty,end='\n\n')
     16 
---> 17 add(4)
     18 add(4,7)
     19 add('mag','edu')

TypeError: add() missing 1 required keyword-only argument: 'z'
=======================================================================================
import inspect
def add(x:int,y:int) -> int:
    return x + y

sig = inspect.signature(add)
print(sig)

print('params : ',sig.parameters)
print('return : ',sig.return_annotation)
print('~~~~~~~~~~~~~~~~~~~')

for i, (name,param) in enumerate(sig.parameters.items()):
    print(i+1,name,param.annotation,param.kind,param.default)
    print(param.default is param.empty,end='\n\n')
     
add(4)
add(4,7)
add('mag','edu')

输出：
(x: int, y: int) -> int
params :  OrderedDict([('x', <Parameter "x: int">), ('y', <Parameter "y: int">)])
return :  <class 'int'>
~~~~~~~~~~~~~~~~~~~
1 x <class 'int'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

2 y <class 'int'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-3-7eb697bf4048> in <module>
     14     print(param.default is param.empty,end='\n\n')
     15 
---> 16 add(4)
     17 add(4,7)
     18 add('mag','edu')

TypeError: add() missing 1 required positional argument: 'y'
=======================================================================================
# 改造成装饰器

import inspect
from functools import wraps


def check(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):   # 收集所有的实参
        # 实参检查
        print(args,kwargs)  # 假如传入4,y=7，print(4,y=7)
        # 这里可以写成*args，解构参数。但不能写成**kwargs，因为这相当于print函数定义的一个关键字参
        # 数，而解开后是y=1这样的形式，但print函数中没有y这个关键字参数，所有不能这样传参，所以会报
        # y没有定义
        sig = inspect.signature(fn)
        print(sig)   # 获取签名，下面做参数检查
        
        print('params : ',sig.parameters)
        print('return : ',sig.return_annotation)
        print('~~~~~~~~~~~~~~~~~~~')
        params = sig.parameters   # 有序字典
        
#         for i, (name,param) in enumerate(sig.parameters.items()):
#         for name,param in sig.parameters.items():
#         for param in sig.parameters.values():  
# 不再打印参数的名称，而是打印param.name，参数对象名称，所以下面打印的名称都来自于对象的属性
#             print(param.name,param)
# #             print(i+1,name,param.annotation,param.kind,param.default)
#             print(param.name,param.annotation,param.kind,param.default)
#             print(param.default is param.empty,end='\n\n')

        # 位置参数处理
        param_list = list(params.keys())
        # key是按顺序排的，所以就可以拿到列表。 这里用List或tuple都可以
#         tmp_list = [0] * len(params)   # 1
#         tmp_list = list(param_list)   # 2 remove   
# 两种方法都可以看到查看了哪些参数，找到没有传进来的参数
        for i,v in enumerate(args):
            k = param_list[i]   # 拿到key列表
            if isinstance(v,params[k].annotation):
# params[k]表示到k的定义里去找，定义是一个字典，把k送进去以后，返回的是param，也就是返回的是参数对象，然后拿它的annotation。
# 这是一个类型。这里就是判断x是不是params[k].annotation这个类型
                print(v,'is',params[k].annotation)
            else:
                print(v,'is not',params[k].annotation)
    
    # 如果传参中有位置参数和关键字参数，那么位置参数会被上面接收，关键字参数会用下面的代码接收
    # 视图是只读的
    
    
        # 关键字传参处理
        for k,v in kwargs.items():
            if isinstance(v,params[k].annotation):
# params[k]表示到k的定义里去找，定义是一个字典，把k送进去以后，返回的是param，也就是返回的是参数对象，然后拿它的annotation。
# 这是一个类型。这里就是判断v是不是params[k].annotation这个类型
                print(v,'is',params[k].annotation)
            else:
#                 print(v,'is not',params[k].annotation)
                errstr = "{} {} {}".format(v,'is not',params[k].annotation)
                print(errstr)
                raise TypeError()   # 异常处理。这里一旦出错，就会在这里停止执行
             # 上面的位置参数也可以这样写，代码有重复就要写成函数   
        ret = fn(*args,**kwargs)
        return ret
    return wrapper
# 位置参数与关键字参数处理略有不同，位置参数需要将有序字典的key取出，组成一个列表，之后循环用户传入的位
# 置参数args，用enumerate给位置参数加上序号，将按序号在前面组成的列表中拿key的值，再根据key值找从有序
# 字典中找对应的类型，最后判断用户传入的位置参数是否符合这个类型。关键字参数相对简单，只需要将用户传的关
# 键字参数解构为k,v对，再根据k的值到有序字典中查找对应的类型，最后判断关键字参数的值是否符合这个类型即可。
@check
def add(x:int,y:int=7) -> int:
    return x + y


add(4,y=8)
# add(4,7)
# add('mag','edu')

输出：
(4,) {'y': 8}
(x: int, y: int = 7) -> int
params :  OrderedDict([('x', <Parameter "x: int">), ('y', <Parameter "y: int = 7">)])
return :  <class 'int'>
~~~~~~~~~~~~~~~~~~~
4 is <class 'int'>
8 is <class 'int'>

12
=======================================================================================
# partial方法
import functools
def add(x,y:int)->int:
    ret = x + y
    print(ret)
    return ret

import inspect
print(inspect.signature(add))

newadd = functools.partial(add,y=6)
# y=6被固定住了，再调用时不需要重y这个参数了

newadd(4)

输出：
(x, y: int) -> int
10
10
```

