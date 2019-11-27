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

- 如果解决这种动态语言定义的弊端呢？
  - 函数注解

```python
def add(x:int,y:int) -> int:
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
  - 提供给第三方工具，做代码分析，发现隐藏的bug
  - 函数注解的信息，保存在`__annotations__`属性中

```python
add.__annotations__
{'x':<class 'int', 'y': <class 'int'>, 'return': <class 'int'>}
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
def add(x:int, y:int, *args,**kwargs) -> int:
	return x + y
sig = inspect.signature(add)
print(sig, type(sig)) # 函数签名
print('params : ', sig.parameters) # OrderedDict
print('return : ', sig.return_annotation)
print(sig.parameters['y'], type(sig.parameters['y']))
print(sig.parameters['x'].annotation)
print(sig.parameters['args'])
print(sig.parameters['args'].annotation)
print(sig.parameters['kwargs'])
print(sig.parameters['kwargs'].annotation)
```

- `inspect.isfunction(add)`，是否是函数
- `inspect.ismethod(add)`，是否是类的方法
- `inspect.isgenerator(add)`，是否是生成器对象
- `inspect.isgeneratorfunction(add)`，是否是生成器函数
- `inspect.isclass(add)`，是否是类
- `inspect.ismodule(inspect)`，是否是内建对象
- `inspect.isbuiltin(print)`，是否是内建对象
- inspect()的签名可以把定义的可调用对象全部收集好，并用有序字典保存，这解决了顺序传参的时候和形参对应的问题
- 还有很多is函数，需要的时候查阅inspect模块帮助
- Parameter对象
  - 保存在元组中，是只读的
  - name，参数的名字
  - annotation，参数的注解，可能没有定义
  - default，参数的缺省值，可能没有定义
  - empth，特殊的类，用来标记default属性或者注释annotation属性的空值
  - kind，实参如何绑定到形参，就是形参的类型
    - POSITIONAL_ONLY，值必须是位置参数提供
    - POSITIONAL_OR_KEYWORD，值可以作为关键字或者位置参数提供
    - VAR_POSITIONAL，可变位置参数，对应`*args`
    - KEYWORD_ONLY，keyword-only参数，对应`*`或者`*args`之后的出现的非可变关键字参数
    - VAR_KEYWORD，可变关键字参数，对应`**kwargs`
- 举例

```python
import inspect
def add(x, y:int=7, *args, z, t=10,**kwargs) -> int:
	return x + y
sig = inspect.signature(add)
print(sig)
print('params : ', sig.parameters) # 有序字典
print('return : ', sig.return_annotation)
print('~~~~~~~~~~~~~~~~')
for i, item in enumerate(sig.parameters.items()):
    name, param = item
    print(i+1, name, param.annotation, param.kind, param.default)
    print(param.default is param.empty, end='\n\n')
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
业务需求是参数有注解就要求实参类型和声明应该一致,没有注解的参数不比较,如何修改代码?
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
```



### 课堂实验

```python
# 签名在第一行里都有了
def add(x:int,y:int,*args,**kwargs) -> int:   
    # -> int表示return的返回值类型。签名是将定义的东西就全部拿到了
    return x + y

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
        # 可以写成*args，解构参数。但不能写成**kwargs，因为这是print函数的参数，而解开后是y=1这样的形式，但print函数中没有
        # y关键字参数，所以会报y没有定义
        sig = inspect.signature(fn)
        print(sig)   # 获取签名，下面做参数检查
        
        print('params : ',sig.parameters)
        print('return : ',sig.return_annotation)
        print('~~~~~~~~~~~~~~~~~~~')
        params = sig.parameters   # 有序字典
        
#         for i, (name,param) in enumerate(sig.parameters.items()):
#         for name,param in sig.parameters.items():
#         for param in sig.parameters.values():  # 不再打印参数的名称，而是打开param.name，参数对象名称，所以下面打印的名称都来自于对象的属性
#             print(param.name,param)
# #             print(i+1,name,param.annotation,param.kind,param.default)
#             print(param.name,param.annotation,param.kind,param.default)
#             print(param.default is param.empty,end='\n\n')
        # 位置参数处理
        param_list = list(params.keys())
        # key是按顺序排的，所以就可以拿到列表。 这里用List或tuple都可以
#         tmp_list = [0] * len(params)   # 1
#         tmp_list = list(param_list)   # 2 remove   两种方法都可以看到查看了哪些参数，找到没有传进来的参数？
        for i,x in enumerate(args):
            k = param_list[i]   # 拿到key列表
            if isinstance(v,params[k].annotation):
# params[k]表示到k的定义里去找，定义是一个字典，把k送进去以后，返回的是param，也就是返回的是参数对象，然后拿它的annotation。
# 这是一个类型。这里就是判断v是不是params[k].annotation这个类型
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
x x: int
x <class 'int'> POSITIONAL_OR_KEYWORD <class 'inspect._empty'>
True

y y: int = 7
y <class 'int'> POSITIONAL_OR_KEYWORD 7
False

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

