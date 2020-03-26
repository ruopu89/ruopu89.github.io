---
title: python基础学习-魔术方法
date: 2020-03-07 19:53:00
tags: python魔术方法
categories: python
---

### 特殊属性

| 属性         | 含义                                                |
| ------------ | --------------------------------------------------- |
| `__name__`   | 类、函数、方法等的名字                              |
| `__module__` | 类定义所在的模块名                                  |
| `__class__`  | 对象或类所属的类                                    |
| `__bases__`  | 类的基类的元组，顺序为它们在基类列表中出现的顺序    |
| `__doc__`    | 类、函数的文档字符串，如果没有定义则为None          |
| `__mro__`    | 类的`mro`, `class.mro()`返回的结果保存在`__mro__`中 |
| `__dict__`   | 类或实例的属性，可写的字典                          |



### 查看属性

| 方法      | 意义                                                         |
| --------- | ------------------------------------------------------------ |
| `__dir__` | 返回类或者对象的所有成员名称列表。`dir()`函数就是调用`__dir__()`。如果提供`__dir__()`，则返回属性的列表，否则会尽量从`__dict__`属性中收集信息。 |

如果`dir([obj])`参数`obj`包含方法`__dir__()`，该方法将被调用。如果参数`obj`不包含`__dir__()`，该方法将最大限度地收集参数信息。

`dir()`对于不同类型的对象具有不同的行为：

如果对象是模块对象，返回的列表包含模块的属性名。

如果对象是类型或者类对象，返回的列表包含类的属性名，及它的基类的属性名。

否则，返回列表包含对象的属性名，它的类的属性名和类的基类的属性名。

```python
# animal.py
class Animal:
    x = 123
    def __init__(self, name):
        self._name = name
        self.__age = 10
        self.weight = 20
print('animal Module\'s names = {}'.format(dir()))   # 模块的属性

# cat.py
import animal
from animal import Animal

class Cat(Animal):
    x = 'cat'
    y = 'abcd'
    
class Dog(Animal):
    def __dir__(self):
        return ['dog']   # 必须返回可迭代对象
    
print('------------')
print('Current Module\'s names = {}'.format(dir()))   # 模块名词空间内的属性
print('animal Module\'s names = {}'.format(dir(animal)))   # 指定模块名词空间内的属性
print("object's __dict__    = {}".format(sorted(object.__dict__.keys()))) # object的字典
print("Animal's dir() = {}".format(dir(Animal))) # 类Animal的dir()
print("Cat's dir()    = {}".format(dir(Cat)))   # 类Cat的dir()
print('~~~~~~~~~~~~~~~~')
tom = Cat('tome')
print(sorted(dir(tom))) # 实例tom的属性、Cat类及所有祖先类的类属性
print(sorted(tom.__dir__()))   # 同上
# dir()的等价，近似如下，__dict__字典中几乎包括了所有属性
print(sorted(set(tom.__dict__.keys()) | set(Cat.__dict__.keys()) | set(object.__dict__.keys())))

print("Dog's dir = {}".format(dir(Dog)))
dog = Dog('snoppy')
print(dir(dog))
print(dog.__dict__)

# 执行结果
```



### 魔法方法 ***

- 分类
  - 创建、初始化与销毁
    - `__init__`与`__del__`
  - hash
  - bool
  - 可视化
  - 运算符重载
  - 容器和大小
  - 可调用对象
  - 上下文管理
  - 反射
  - 描述器
  - 其他杂项



### hash

| 方法       | 意义                                                         |
| ---------- | ------------------------------------------------------------ |
| `__hash__` | 内建函数`hash()`调用的返回值，返回一个整数。如果定义这个方法该类的实例就可hash。 |

```python
class A:
    def __init__(self, name, age=18):
        self.name = name
        
    def __hash__(self):
        return 1
    
    def __repr__(self):
        return self.name
    
print(hash(A('tom')))
print(A('tom'), A('tom'))
print([A('tom'), A('tom')])
print('~~~~~~~~~~~~~~~~~~')
s = {A('tom'), A('tom')}   # set
print(s)   # 去重了吗
print({tuple('t'), tuple('t')})
print({('tom',), ('tom',)})
print({'tom', 'tom'})
```

上例中`set`为什么不能剔除相同的`key`？

```python
class A:
    def __init__(self, name, age=18):
        self.name = name
        
    def __hash__(self):
        return 1
    
    def __eq__(self, other):   # 这个函数作用？
        return self.name == other.name
    
    def __repr__(self):
        return self.name
    
print(hash(A('tom')))
print((A('tom'), A('tom')))
print([A('tom'), A('tom')])
print('~~~~~~~~~~~~~~~~~~~~')
s = {A('tom'), A('tom')}   # set
print(s)
print({tuple('t'), tuple('t')})
print({('tom',), ('tom',)})
print({'tom', 'tom'})
```

| 方法     | 意义                                              |
| -------- | ------------------------------------------------- |
| `__eq__` | 对应`==`操作符，判断2个对象是否相等，返回`bool`值 |

`__hash__`方法只是返回一个hash值作为`set`的`key`，但是`去重`，还需要`__eq__`来判断2个对象是否相等。

hash值相等，只是hash冲突，不能说明两个对象是相等的。

因此，一般来说提供`__hash__`方法是为了作为`set`或者`dict`的`key`，所以`去重`要同时提供`__eq__`方法。

不可hash对象`isinstance(p1, collections.Hashable)`一定为False。

`去重`需要提供`__eq__`方法。

思考：

list类实例为什么不可hash？

练习

设计二维坐标类Point，使其成为可hash类型，并比较2个坐标的实例是否相等？

list类实例为什么不可hash

源码中有一句`__hash__ = None`，也就是如果调用`__hash__()`相当于`None()`，一定报错。所有类都继承`object`，而这个类是具有`__hash__()`方法的，如果一个类不能被hash，就把`__hash__`设置为`None`。

练习参考

```python
from collections import Hashable

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __hash__(self):
        return hash((self.x, self.y))
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
p1 = Point(4, 5)
p2 = Point(4, 5)
print(hash(p1))
print(hash(p2))

print(p1 is p2)
print(p1 == p2)   # True使用__eq__
print(hex(id(p1)), hex(id(p2)))
print(set((p1, p2)))
print(isinstance(p1, Hashable))
```



### bool

| 方法       | 意义                                                         |
| ---------- | ------------------------------------------------------------ |
| `__bool__` | 内建函数`bool()`，或者对象放在逻辑表达式的位置，调用这个函数返回布尔值。没有定义`__bool__()`，就找`__len__()`返回长度，非0为真。如果`__len__()`也没有定义，那么所有实例都返回真。 |

```python
class A: pass

print(bool(A()))
if A():
    print('Real A')
    
class B:
    def __bool__(self):
        return False
    
print(bool(B))
print(bool(B()))
if B():
    print('Real B')
    
class C:
    def __len__(self):
        return 0
    
print(bool(C()))
if C():
    print('Real C')
```



### 可视化

| 方法        | 意义                                                         |
| ----------- | ------------------------------------------------------------ |
| `__repr__`  | 内建函数`repr()`对一个对象获取字符串表达。调用`__repr__`方法返回字符串表达，如果`__repr__`也没有定义，就直接返回`object`的定义就是显示内存地址信息 |
| `__str__`   | `str()`函数、内建函数`format()`、`print()`函数调用，需要返回对象的字符串表达。如果没有定义，就去调用`__repr__`方法返回字符串表达，如果`__repr__`没有定义，就直接返回对象的内存地址信息 |
| `__bytes__` | `bytes()`函数调用，返回一个对象的`bytes`表达，即返回`bytes`对象 |

```python
class A:
    def __init__(self, name, age=18):
        self.name = name
        self.age = age
        
    def __repr__(self):
        return 'repr: {},{}'.format(self.name, self.age)
    
    def __str__(self):
        return 'str: {},{}'.format(self.name, self.age).encode()
    
    def __bytes__(self):
        # return "{} is {}".format(self.name, self.age).encode()
        import json
        return json.dumps(self.__dict__).encode()
    
print(A('tom'))   # print函数使用__str__
print([A('tom')])   # []使用__str__，但其内部使用__repr__
print(([str(A('tom'))]))   # []使用__str__，str()函数也使用__str__

print('str:a,1')   # 字符串直接输出没有引号
s = '1'
print(s)
print(['a'],(s,))   # 字符串在基本数据类型内部输出有引号
print({s, 'a'})

print(bytes(A('tom')))
```



### 运算符重载

`operator`模块提供以下的特殊方法，可以将类的实例使用下面的操作符来操作

| 运算符                        | 特殊方法                                                     | 含义                                   |
| ----------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| <, <=, ==, >, >=, !=          | `__lt__`, `__le__`, `__eq__`, `__gt__`, `__ge__`, `__ne__`   | 比较运算符                             |
| +, -, *, /, %, //, **, divmod | `__add__`, `__sub__`, `__mul__`, `__truediv__`, `__mod__`, `__floordiv__`, `__pow__`, `__divmod__` | 算术运算符，移位、位运算也有对应的方法 |
| +=, -=, *=, /=, %=, //=, **=  | `__iadd__`, `__isub__`, `__imul__`, `__itruediv__`, `__imod__`, `__ifloordiv__`, `__ipow__` |                                        |

```python
class A:
    def __init__(self, name, age=18):
        self.name = name
        self.age = age
        
    def __sub__(self, other):
        return self.age - other.age
    
    def __isub__(self, other):
        return A(self.name, self - other)
    
tom = A('tom')
jerry = A('jerry', 16)

print(tom - jerry)
print(jerry - tom, jerry.__sub__(tom))

print(id(tom))
tom -= jerry
print(tom.age, id(tom))
```

练习：

完成`Point`类设计，实现判断点相等的方法，并完成向量的加法。

在直角坐标系里面，定义原点为向量的起点。两个向量和与差的坐标分别等于这两个向量相应坐标的和与差若向量的表示为`(x,y)`形式，`A(X1, Y1) B(X2, Y2)`，则`A+B=(X1+X2, Y1+Y2), A-B=(X1-X2, Y1-Y2)`

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)
    
    def add(self, other):
        return (self.x + other.x, self.y + other.y)
    
    def __str__(self):
        return '<Point: {},{}'.format(self.x, self.y)
    
p1 = Point(1, 1)
p2 = Point(1, 1)
points = (p1, p2)
print(points[0].add(points[1]))
# 运算符重载
print(points[0] + points[1])
print(p1 == p2)
```



#### 运算符重载应用场景

往往是用面向对象实现的类，需要做大量的运算，而运算符是这种运算在数学上最常见的表达方式。例如，上例中的对`+`进行了运算符重载，实现了`Point`类的二元操作，重新定义为`Point + Point`。

提供运算符重载，比直接提供加法方法要更加适合该领域内使用者的习惯。

`int`类，几乎实现了所有操作符，可以作为参考。



### @functools.total_ordering 装饰器

`__lt__`, `__le__`, `__eq__`, `__gt__`, `__ge__`是比较大小必须实现的方法，但是全部写完太麻烦，使用`@functools.total_ordering`装饰器就可以大大简化代码。

但是要求`__eq__`必须实现，其它方法`__lt__`, `__le__`, `__gt__`, `__ge__`实现其一

```python
from functools import total_ordering

@total_ordering
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def __eq__(self, other):
        return self.age == other.age
    
    def __gt__(self, other):
        return self.age > other.age
    
tom = Person('tom', 20)
jerry = Person('jerry', 16)

print(tom > jerry)
print(tom < jerry)
print(tom >= jerry)
print(tom <= jerry)
```

上例中大大简化代码，但是一般来说比较实现等于或者小于方法也就够了，其它可以不实现，所以这个装饰器只是看着很美好，且可能会带来性能问题，建议需要什么方法就自己创建，少用这个装饰器。

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def __eq__(self, other):
        return self.age == other.age
    
    def __gt__(self, other):
        return self.age > other.age
    
    def __ge__(self, other):
        return self.age >= other.age
    
tom = Person('tom', 20)
jerry = Person('jerry', 16)

print(tom > jerry)
print(tom < jerry)
print(tom >= jerry)
print(tom <= jerry)

print(tom == jerry)
print(tom != jerry)
```



### 容器相关方法

| 方法           | 意义                                                         |
| -------------- | ------------------------------------------------------------ |
| `__len__`      | 内建函数`len()`，返回对象的长度（>=0的整数），如果把对象当做容器类型看，就如同list或者dict。`bool()`函数调用的时候，如果没有`__bool__()`方法，则会看`__len__()`方法是否存在，存在返回非0为真 |
| `__iter__`     | 迭代容器时，调用，返回一个新的迭代器对象                     |
| `__contains__` | `in`成员运算符，没有实现，就调用`__iter__`方法遍历           |
| `__getitem__`  | 实现`self[key]`访问。序列对象，`key`接受整数为索引，或者切片。对于set和dict，key为hashable。key不存在引发KeyError异常 |
| `__setitem__`  | 和`__getitem__`的访问类似，是设置值的方法                    |
| `__missing__`  | 字典或其子类使用`__getitem__()`调用时，key不存在执行该方法   |

```python
class A(dict):
    def __missing__(self, key):
        print('Missing key :', key)
        return 0
    
a = A()
print(a['k'])
```

思考

为什么空字典、空字符串、空元组、空集合、空列表等可以等效为False？

练习

将购物车类改造成方便操作的容器类

```python
class Cart:
    def __init__(self):
        self.items = []
        
    def __len__(self):
        return len(self.items)
    
    def additem(self, item):
        self.items.append(item)
        
    def __iter__(self):
        return iter(self.items)
    
    def __getitem__(self, index):   # 索引访问
        return self.items[index]
    
    def __setitem__(self, key, value):   # 索引赋值
        self.items[key] = value
        
    def __str__(self):
        return str(self.items)
    
    def __add__(self, other): # +
        self.items.append(other)
        return self
    
cart = Cart()
cart.additem(1)
cart.additem('abc')
cart.additem(3)

# 长度、bool
print(len(cart))
print(bool(cart))

# 迭代
for x in cart:
    print(x)
    
# in
print(3 in cart)
print(2 in cart)

# 索引操作
print(cart[1])
cart[1] = 'xyz'
print(cart)

# 链式编程实现加法
print(cart + 4 + 5 + 6)
print(cart.__add__(17).__add__(18))
```



### 可调用对象

Python中一切皆对象，函数也不例外。

```python
def foo():
    print(foo.__module__, foo.__name__)
    
foo()
# 等价于
foo.__call__()
```

函数即对象，对象`foo`加上`()`，就是调用对象的`__call__()`方法

可调用对象

| 方法       | 意义                                         |
| ---------- | -------------------------------------------- |
| `__call__` | 类中定义一个该方法，实例就可以像函数一样调用 |

可调用对象：定义一个类，并实例化得到其实例，将实例像函数一样调用。

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __call__(self, *args, **kwargs):
        return "<Point {}:{}>".format(self.x, self.y)
    
p = Point(4, 5)
print(p)
print(p())

class Adder:
    def __call__(self, *args):
        ret = 0
        for x in args:
            ret += x
        self.ret = ret
        return ret
    
adder = Adder()
print(adder(4, 5, 6))
print(adder.ret)
```

练习：

定义一个斐波那契数列的类，方便调用，计算第n项

```python
class Fib:
    def __init__(self):
        self.items = [0, 1, 1]
        
    def __call__(self, index):
        if index < 0:
            raise IndexError('Wrong Index')
        if index < len(self.items):
            return self.items[index]
        
        for i in range(3, index+1):
            self.items.append(self.items[i-1] + self.items[i-2])
     	return self.items[index]
    
print(Fib()(100))
```

上例中，增加迭代的方法、返回容器长度、支持索引的方法

```python
class Fib:
    def __init__(self):
        self.items = [0, 1, 1]
        
    def __call_(self, index):
        return self[index]
    
    def __iter__(self):
        return iter(self.items)
    
    def __len__(self):
        return len(self.items)
    
    def __getitem__(self, index):
        if index < 0:
            raise IndexError('Wrong Index')
        if index < len(self.items):
            return self.items[index]
        
        for i in range(len(self), index+1):
            self.items.append(self.items[i-1] + self.items[i-2])
        return self.items[index]
    
    def __str__(self):
        return str(self.items)
    
    __repr__ = __str__
    
fib = Fib()
print(fib(5), len(fib))   # 全部计算
print(fib(10), len(fib))   # 部分计算
for x in fib:
    print(x)
print(fib[5], fib[6])  # 索引访问 ，不计算
```

可以看出使用类来实现斐波那契数列也是非常好的实现，还可以缓存数据，便于检索。



### 上下文管理

文件IO操作可以对文件对象使用上下文管理，使用`with..as`语法

```python
with open('test') as f:
    pass
```

依照上例写一个自己的类，实现上下文管理

```python
class Point:
    pass

with Point() as p:   #  AttributeError: __exit__
    pass
```

提示属性错误，没有`__exit__`，看了需要这个属性



### 上下文管理对象

当一个对象同时实现了`__enter__()`和`__exit__()`方法，它就属于上下文管理的对象

| 方法        | 意义                                                         |
| ----------- | ------------------------------------------------------------ |
| `__enter__` | 进入与此对象相关的上下文 。如果存在该方法，`with`语法会把该方法的返回值作为绑定到`as`子句中指定的变量上 |
| `__exit__`  | 退出与此对象相关的上下文                                     |

```python
class Point:
    def __init__(self):
        print('init')
    def __enter__(self):
        print('enter')
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        
with Point() as f:
    print('do sth.')
```

实例化对象的时候，并不会调用`enter`，进入`with`语句块应用`__enter__`方法，然后执行语句体，最后离开`with`语句块的时候，调用`__exit__`方法。

`with`可以开启一个上下文运行环境，在执行前做一些准备工作，执行后做一些收尾工作。



### 上下文管理的安全性

看看异常对上下文的影响

```python
class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):
        print('enter')
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        
with Point() as f:
    raise Exception('error')
    print('do sth.')
    
# init
# enter
# exit
```

可以看出在`enter`和`exit`照样执行，上下文管理是安全的。

极端的例子

调用`sys.exit()`，它会退出当前解释器。

打开Python解释器，在里面敲入`sys.exit()`，窗口直接关闭了。也就是说碰到这一句，Python运行环境直接退出了。

```python
import sys
class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):
        print('enter')
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        
with Point() as f:
    sys.exit(-100)
    print('do sth.')
    
print('outer')
```

从执行结果来看，依然执行了`__exit__`函数，哪怕是退出Python运行环境。

说明**上下文管理很安全**



### with语句

```python
class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):
        print('enter')
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        
p = Point()
with p as f:
    print(p == f)  # 为什么不相等
    print('do sth.')
```

问题在于`__enter__`方法上，它将自己的返回值赋给`f`。修改上例

```python
class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):
        print('enter')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        
p = Point()
with p as f:
    print(p == f)
    print('do sth.')
```

`__enter__`方法返回值就是上下文中使用的对象，`with`语法会把它的返回值赋给`as`子句的变量。



### `__enter__`方法和`__exit__`方法的参数

`__enter__`方法没有其他参数。

`__exit__`方法有3个参数：

`__exit__(self, exc_type, exc_value, traceback)`

这三个参数都与异常有关。

如果该上下文退出时没有异常，这3个参数都为None。

如果有异常，参数意义如下

`exc_type`，异常类型

`exc_value`，异常的值

`traceback`，异常的追踪信息

`__exit__`方法返回一个等效True的值，则压制异常；否则，继续抛出异常

```python
class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):
        print('enter')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(exc_type)
        print(exc_val)
        print(exc_tb)
        print('exit')
        return "abc"
    
p = Point()
with p as f:
    raise Exception('New Error')
    print('do sth.')
    
print('outer')
```



### 练习

为加法函数计时

方法1，使用装饰器显示该函数的执行时长

方法2，使用上下文管理方法来显示该函数的执行时长

```python
import time

def add(x, y):
    time.sleep(2)
    return x + y
```

装饰器实现

```python
import time
import datetime
from functools import wraps

def timeit(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = datetime.datetime.now()
        ret = fn(*args, **kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print('{} took {}s'.format(fn.__name__, delta))
        return ret
    return wrapper

@timeit
def add(x, y):
    time.sleep(2)
    return x + y

print(add(4, 5))
```

上下文实现

```python
import time
import datetime
from functools import wraps

def timeit(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = datetime.datetime.now()
        ret = fn(*args, **kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print('{} took {}s'.format(fn.__name__, delta))
        return ret
    return wrapper

@timeit
def add(x, y):
    time.sleep(2)
    return x + y

class Timeit:
    def __init__(self, fn):
        self.fn = fn
        
    def __enter__(self):
        self.start = datetime.datetime.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print("{} took {}s".format(self.fn.__name__, delta))
        
    def __call__(self, x, y):
        print(x, y)
        return self.fn(x, y)
    
with Timeit(add) as timeitobj:
    print(timeitobj(5, 6))
```

根据上面的代码，能不能把类当做装饰器用？

```python
import time
import datetime
from functools import wraps

class TimeIt:
    def __init__(self, fn):
        self.fn = fn
        
    def __enter__(self):
        self.start = datetime.datetime.now()
        return self
    
    def __exit__(self, *args, **kwargs):
        self.delta = (datetime.datetime.now() - self.start).total_seconds()
        print('{} took {}s. context'.format(self.fn.__name__, self.delta))
        pass
    
    def __call__(Self, *args, **kwargs):
        self.start = datetime.datetime.now()
        ret = self.fn(*args, **kwargs)
        self.delta = (datetime.datetime.now() - self.start).total_seconds()
        print('{} took {}s. call'.format(self.fn.__name__, self.delta))
        return ret
    
@TimeIt
def add(x, y):
    """This is add function."""
    time.sleep(2)
    return x + y

add(4, 5)
print(add.__doc__)
```

思考

如何解决文档字符串问题？

方法一

直接修改`__doc__`

```python
class TimeIt:
    def __init__(self, fn=None):
        self.fn = fn
        # 把函数对象的文档字符串赋给类
        self.__doc__ = fn.__doc__
```

方法二

使用`functools.wraps`函数

```python
import time
import datetime
from functools import wraps, update_wrapper

class Timeit:
    """This is A Class"""
    def __init__(self, fn):
        self.fn = fn
        # 把函数对象的文档字符串赋给类
        # self.__doc__ = fn.__doc__
        # update_wrapper(self, fn)
        wraps(fn)(self)
        
    def __enter__(self):
        self.start = datetime.datetime.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print("{} took {}s. context".format(self.fn.__name__, delta))
        
    def __call__(self, *args, **kwargs):
        self.start = datetime.datetime.now()
        ret = self.fn(*args, **kwargs)
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print("{} took {}s. call".format(self.fn.__name__, delta))
        return ret
    
@Timeit
def add(x, y):
    """This is add function."""
    time.sleep(2)
    return x + y

print(add(10, 5))
print(add.__doc__)

print(Timeit(add).__doc__)
```

上面的类即可以用在上下文管理，又可以用做装饰器



### 上下文应用场景

1. 增强功能

   在代码执行的前后增加代码，以增强其功能。类似装饰器的功能。

2. 资源管理

   打开了资源需要关闭，例如文件对象、网络连接、数据库连接等

3. 权限验证

   在执行代码之前，做权限的验证，在`__enter__`中处理



### contextlib.contextmanager

`contextlib.contextmanager`

它是一个装饰器实现上下文管理，装饰一个函数，而不用像类一样实现`__enter__`和`__exit__`方法。

对下面的函数有要求，必须有`yield`，也就是这个函数必须返回一个生成器，且只有`yield`一个值。也就是这个装饰器接收一个生成器对象作为参数。

```python
import contextlib

@contextlib.contextmanager
def foo():
    print('enter')   # 相当于__enter__()
    yield # yield 5，yield的值只能有一个，作为__enter__方法的返回值
    print('exit')  # 相当于__exit__()
    
with foo() as f:
    # raise Exception()
    print(f)
```

`f`接收`yield`语句的返回值

上面的程序看似不错，但是，增加一个异常试一试，发现不能保证`exit`的执行，怎么办？

增加`try finally`。

```python
import contextlib

@contextlib.contextmanager
def foo():
    print('enter')
    try:
        yield   # yield 5，yield的值只能有一个，作为__enter__方法的返回值
    finally:
        print('exit')
        
with foo() as f:
    raise Exception()
    print(f)
```

上例这么做有什么意义呢？

当`yield`发生处为生成器函数增加了上下文管理。这是为函数增加上下文机制的方式。

- 把`yield`之前的当做`__enter__`方法执行
- 把`yield`之后的当做`__exit__`方法执行
- 把`yield`的值作为`__enter__`的返回值

```python
import contextlib
import datetime
import time

@contextlib.contextmanager
def add(x, y):   # 为生成器函数增加了上下文管理
    start = datetime.datetime.now()
    try:
        yield x + y  # yield 5，yield的值只能有一个，作为__enter__方法的返回值
    finally:
        delta = (datetime.datetime.now() - start).total_seconds()
        print(delta)
        
with add(4, 5) as f:
    # raise Exception()
    time.sleep(2)
    print(f)
```

总结

如果业务逻辑简单可以使用函数加`contextlib.contextmanager`装饰器方式，如果业务复杂，用类的方式加`__enter__`和`__exit__`方法方便。



### 反射概述

运行时，区别于编译时，指的是程序被加载到内存中执行的时候。

反射，reflection，指的是运行时获取类型定义信息。

一个对象能够在运行时，像照镜子一样，反射出其类型信息。

简单说，在Python中，能够通过一个对象，找出其`type`、`class`、`attribute`或`method`的能力，称为反射或者自省。

具有反射能力的函数有：`type()`、`isinstance()`、`callable()`、`dir()`、`getattr()`



### 反射相关的函数和方法

需求

有一个Point类，查看它实例的属性，并修改它。动态为实例增加属性

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __str__(self):
        return "Point({}, {})".format(Self.x, self.y)
    
    def show(self):
        print(self.x, self.y)
        
p = Point(4, 5)
print(p)
print(p.__dict__)
p.__dict__['y'] = 16
print(p.__dict__)
p.z = 10
print(p.__dict__)
print(dir(p))  # ordered list
print(p.__dir__())  # list
```

上例通过属性字典`__dict__`来访问对象的属性，本质上也是利用的反射的能力。

但是，上面的例子中，访问的方式不优雅，Python提供了内置的函数。

| 内建函数                         | 意义                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `getattr(object,name[,default])` | 通过name返回object的属性值。当属性不存在，将使用default返回，如果没有default，则抛出AttributeError。name必须为字符串 |
| `setattr(object,name,value)`     | object的属性存在，则覆盖，不存在，新增                       |
| `hasattr(object,name)`           | 判断对象是否有这个名字的属性，name必须为字符串               |

用上面的方法来修改上例的代码

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __str__(self):
        return "Point({}, {})".format(self.x, self.y)
    
    def show(self):
        print(self)
        
p1 = Point(4, 5)
p2 = Point(10, 10)
print(repr(p1), repr(p2), sep='\n')
print(p1.__dict__)
setattr(p1, 'y', 16)
setattr(p1, 'z', 10)
print(getattr(p1, '__dict__'))

# 动态调用方法
if hasattr(p1, 'show'):
    getattr(p1, 'show')()
    
# 动态增加方法
# 为类增加方法
if not hasattr(Point, 'add'):
    setattr(Point, 'add', lambda self,other: Point(self.x + other.x, self.y + other.y))
    
print(Point.add)
print(p1.add)
print(p1.add(p2))  # 绑定

# 为实例增加方法， 未绑定
if not hasattr(p1, 'sub'):
    setattr(p1, 'sub', lambds self,other: Point(self.x - other.x, self.y - other.y))
    
print(p1.sub(p1, p1))
print(p1.sub)

# add在谁里面，sub在谁里面
print(p1.__dict__)
print(Point.__dict__)
```

思考

这种动态增加属性的方式和装饰器修饰一个类、Mixin方式的差异？

这种动态增删属性的方式是运行时改变类或者实例的方式，但是装饰器或Mixin都是定义时就决定了，因此反射能力具有更大的灵活性。

练习

命令分发器，通过名称找对应的函数执行。

思路：名称找对象的方法

```python
class Dispatcher:
    def __init__(self):
        self._run()
        
    def cmd1(self):
        print("I'm cmd1")
        
    def cmd2(self):
        print("I'm cmd2")
        
    def _run(self):
        while True:
            cmd = input('Plz input a command: ').strip()
            if cmd == 'quit':
                break
            getattr(self, cmd, lambda : print('Unknown Command {}.'.format(cmd)))()
            
Dispatcher()
```

上例中使用`getattr`方法找到对象的属性的方式，比自己维护一个字典来建立名称和函数之间的关系的方式好多了。



### 反射相关的魔术方法

`__getattr__()`、`__setattr__()`、`__delattr__()`这三个魔术方法，分别测试



#### `__getattr__()`

```python
class Base:
    n = 0
    
class Point(Base):
    z = 6
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def show(self):
        print(self.x, self.y)
        
    def __getattr__(self, item):
        return "missing {}.".format(item)
    
p1 = Point(4, 5)
print(p1.x)
print(p1.z)
print(p1.n)
print(p1.t)   # missing
```

一个类的属性会按照继承关系找，如果找不到，就会执行`__getattr__()`方法，如果没有这个方法，就会抛出`AttributeError`异常表示找不到属性。

查找属性顺序为：

`instance.__dict__ --> instance.__class__.__dict__ --> 继承的祖先类（直到object）的__dict__ --找不到--> 调用__getattr__() `



#### `__setattr__()`

```python
class Base:
    n = 0
class Point(Base):
    z = 6
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def show(self):
        print(self.x, self.y)
        
    def __getattr__(self, item):
        return "missing {}".format(item)
    
    def __setattr__(self, key, value):
        print("setattr {}={}".format(key, value))
        
p1 = Point(4, 5)
print(p1.x)  # missing, why
print(p1.z)
print(p1.n)
print(p1.t)  # missing
p1.x = 50
print(p1.__dict__)
p1.__dict__['x'] = 60
print(p1.__dict__)
print(p1.x)
```

实例通过`.`点设置属性，如同`self.x = x`，就会调用`__setattr__()`，属性要加到实例的`__dict__`中，就需要自己完成。

```python
class Point(Base):
    z = 6
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def show(Self):
        print(self.x, self.y)
        
    def __getattr__(self, item):
        return "missing {}".format(item)
    
    def __setattr__(self, key, value):
        print("setattr {}={}".format(key, value))
        self.__dict__[key] = value
```

`__setattr__()`方法，可以拦截对实例属性的增加、修改操作，如果要设置生效，需要自己操作实例的`__dict__`。



#### `__delattr__()`

```python
class Point:
    z = 5
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __delattr__(self, item):
        print('Can not del {}'.format(item))
        
p = Point(14, 5)
del p.x
p.z = 15
del p.z
del p.z
print(Point.__dict__)
print(p.__dict__)
del Point.z
print(Point.__dict__)
```

可以阻止通过实例删除属性的操作。但是通过类依然可以删除属性。



#### `__getattribute__`

```python
class Base:
    n = 0
    
class Point(Base):
    z = 6
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __getattr__(self, x, y):
        return "missing {}".format(item)
        
    def __getattribute__(self, item):
        return item
    
p1 = Point(4, 5)
print(p1.__dict__)
print(p1.x)
print(p1.z)
print(p1.n)
print(p1.t)
print(Point.__dict__)
print(Point.z)
```

实例的所有的属性访问，第一个都会调用`__getattribute__`方法，它阻止了属性的查找，该方法应该返回（计算后的）值或者抛出一个`AttributeError`异常。

它的return值将作为属性查找的结果。如果抛出`AttributeError`异常，则会直接调用`__getattr__`方法，因为表示属性没有找到。

```python
class Base:
    n = 0
    
class Point(Base):
    z = 6
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __getattr__(self, item):
        return "missing {}".format(item)
    
    def __getattribute__(self, item):
        # raise AttributeError("Not Found")
        # pass
        # return self.__dict__[item]
        return object.__getattribute__(self, item)
    
p1 = Point(4, 5)
print(p1.__dict__)
print(p1.x)
print(p1.z)
print(p1.n)
print(p1.t)
print(Point.__dict__)
print(Point.z)
```

`__getattribute__`方法中为了避免在该方法中无限的递归，它的实现应该永远调用基类的同名方法以访问需要的任何属性，例如`object.__getattribute__(self, name)`。

注意，除非你明确地知道`__getattribute__`方法用来做什么，否则不要使用它。

总结

| 魔术方法           | 意义                                                       |
| ------------------ | ---------------------------------------------------------- |
| `__getattr__()`    | 当通过搜索实例、实例的类及祖先类查不到属性，就会调用此方法 |
| `__setattr__()`    | 通过`.`访问实例属性，进行增加、修改都要调用它              |
| `__delattr__()`    | 当通过实例来删除属性时调用此方法                           |
| `__getattribute__` | 实例所有的属性调用都从这个方法开始                         |

属性查找顺序：

`实例调用__getattribute__() -> instance.__dict__ -> instance.__class__.__dict__ -> 继承的祖先类（直到object）的__dict__ -> 调用__getattr__()`



### 笔记

```python
python的名字空间指模块或作用域

dir()
# 收集当前模块的信息

import test2
print(dir(test2))
# 导入test2模块或叫导入名词空间。收集test2信息。这时test模块中会多一个test2。import就是导入名词空间的

def foo(x):
    y = 1
    pass

print(dir(foo))  # 指定对foo进行搜集，可以看到foo继承的函数的所有属性

class A:
    X = 123
    def __init__(self):
        self.y = 5
        pass
    
print(sorted(dir(A)))
print(sorted(A.__dict__))

class B(A):
    def __dir__(self):  # 因为有self，所以会影响实例的dir.
# 在类里看方法的第一位置参数是谁那就是谁的，这里是self所以影响的是实例
        return ['abcdef']

print('B = ', sorted(dir(B)))
print(sorted(B.__dict__))

b = B()
print(sorted(dir(b)))
print(sorted(b.__dict__))

print('~~~~~~~~~~~~~~~~~~~~~~~')
print(sorted(set(b.__dict__.keys()) | set(b.__class__.__dict__.keys()) | set(object.__dict__)))
# 自己凑一个。dir()显示的信息都是实例自己和类的属性，还有object类的属性。用set是为了去重。
```



hash

用hash就是为了O1的时间复杂度。缓存的目的是再查，缓冲是为了匹配生产者与消费者的速度

```python
from collections import Hashable

class A:
    X = 123
    def __init__(self, y):
        self.y = y
    
    def __hash__(self):  # hash冲突。两个对象在一个hash的计算空间中，可能算出的两个key是一样的
        return 1   # 这里只能用整型，不能用字符串
#    __hash__ = None
# 如果实例再调用hash就是在调用__hash__这个方法，这个方法就等于None，相当于调用None()。这时调用时会提示是不可hash类型。不可hash类型就是这样实现的。如果两个同时引用同一内存的东西，

	def __eq__(self, other):
        return True  # 不管什么情况都认为两个实例相等，这时不管初始化时放什么值都相等了。如果把这里改成False，下面的显示结果也会是去重的，可能是set()先用了一个is来判断，之后再调用__eq__。也就是set先判断内存地址是否相同，相同就去重
    	return self.y == other.y   # 应该这样写，而不是简单的True或False
# self.y == other.y叫二元操作符，相当于self.y在调用自己类型的__eq__方法，而不是这里定义的__eq__方法，other.y作为other参数
		
    
# hash(o)  # 相当于调用o.__hash__()，None是不能调用的，所以o是不能调用的
# o.__hash__()
print(hash(A())) # hash要对里面的对象调用hash的方法

lst = [A(4), A(5)]  # 因为A()是不可迭代类型，所以不能用list()，而用这种方法
print(lst)

s = set(lst)
print(len(s))   # 
print(s)  # 这里只会打印一个hash值，因为set去重了
for x in s:
    print(hash(x))
# 显示hash值是相等的，都是1。所以仅用hash值不能验证两个实例是否相等。所以要用__eq__。

可hash和去重是两个概念，可hash只是是否支持hash，能否给一个hash值。相等才会去重

def hash(x):
    return x % 3   # 取模hash，有可能重复

print(isinstance(A(4), Hashable)
```



eq

```python
a == b  # 相当于下面。这就是二元操作符如何等价到一个方法
a.__equal__(b)  # b就是__eq__(self, other)中的other，a就是self
```



练习

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        if self is other:
            return True
        return self.x == other.x and self.y == other.y
```



bool

```python
 class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        if self is other:
            return True
        return self.x == other.x and self.y == other.y
    
    def __len__(self):
        return 1  # 这里不能返回小于0的数
    
    def __bool_(self):
        return False
# 先找对象方法中是否定义了bool，如果没有再看是否有len，如果都没有定义，返回True。如果定义了，方法返回什么就返回什么 ，如上面__bool__中返回的是False。容器内一般都不实现bool方法，而用len方法  
print(bool(Point(4, 5)))
```



可视化

```python
 class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        if self is other:
            return True
        return self.x == other.x and self.y == other.y
    
    def __repr__(self):
        return str(123)
    
    def __str__(self):
        return str('abc')
# python默认使用repr对每个元素求打印，如果定义了str，就要用str对对象做强制转换。所以下面打印单个元素时都会调用str方法，包括使用for循环时，也是一个个打印。在打印lst时调用了repr。如果不是直播使用print或format直接对函数起作用的话，就要用repr。否则使用str。也就是，如果print()直接作用于对象，就会强行调用对象的str方法，包括for循环也是直接作用于对象。但print(str)时就要调用repr了，因为并不是print直接作用到对象上。所以可以将repr和str的返回值写成一样的
p1 = Point(4, 5)
p2 = Point(5, 6)
print(p1)
lst = [p1, p2]
for x in lst:
    print(x)

print(*lst)
print(list(map(str, lst)))  # map后是一个可迭代对象，所以返回的是地址
print(lst)  # lst找lst的print方法，lst里的元素不会这样处理。
```



运算符重载

运算符重载可以提高类的可用性

```python
class A:
    def __init__(self, x):
        self.x = x
        
    def __sub__(self, other):  # 减法
        self.x = self.x - other.x
        return self  # 这是就地修改，下面是new一个新的。
      #   return A(self.x - other.x)   # 一般应该返回自己本身 
    
    def __ne__(self, other):
        return self.x != other.x
    
    def __eq__(self, other):
        return self.x == other.x
    
    def __lt__(self, other):
        return self.x < other.x  # 实现一个方法就行了，知道了小于，就知道大于和等于了
    
    def __repr__(self):
        return str(self.x)
    
    def __iadd__(self, other):
        self.x = self.x + other.x
        return self  # 这样就不用new了，像下面的语句一样。
      #  return A(self.x + other.x)
    
a1 = A(4)
a2 = A(10)
a3 = A(6)
print(a1 - a2)
print(a1.__sub__(a2))  # 这条等价于上面一条

print(a1 == a2)
print(a1 != a2)   # 这里要使用什么符号，在类中就要定义什么方法，如这里使用不等，那么在类中也要定义__ne__方法


lst = [a1, a2, a3]
print(sorted(lst))
print(list(reversed(sorted(lst))))
# 因为reversed反向排序后还是一个可迭代对象，所以要再包一层list。可以去掉sorted，这样就会直接反转，但没有排序。

a1 += a2
print(a1)
# 可以通过查看int的源码，查看大部分运算符方法的使用方法
```

练习

完成`Point`类设计，实现判断点相等的方法，并完成向量的加法

```python
# 答案1
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __add__(self, other):
        tmpx = self.x + other.x
        tmpy = self.y + other.y
        return Point(tmpx, tmpy)
```

容器相关方法

练习

将购物车类改造成方便操作的容器类

```python
class Item:
    def __init__(self, name, **kwargs):
        self.name = name
        self._spec = kwargs
        
    def __repr__(self):
        return "{} = {}".format(self.name, self._spec.values())
        
class Cart:
    def __init__(self):
        self.items = []  # 添加容器，购物车。可以在初始化时就把物品放进来，也可以在初始化后，有了容器再把物品放进来
    
    def __len__(self):
        return len(self.items)
    
    def additem(self, item):  # 这种方法与下面的__add__方法的作用是一样的，这种方法就是可以直接调用，下面的方法可以使用+号
        self.items.append(item)
    
    def __add__(self, other):  # 此方法对应加号，所以叫运算符重载
        print(other)
        if isinstance(other, Item):
        	self.items.append(other)
        return self
# 返回self，如果用self再加一个数字，那么self会跟着变化
    
    def __getitem__(self, item):  # 这里的item送进来什么就打印什么。是index
        return self.items[item]   # item就是index，所以可以实现cart[1]这样的调用，超出会报异常。所以也可以把item改成index
    
    def __setitem__(self, key, value):
        print(key, value)
        self.items[key] = value   # 如果实例是列表，必须在已有的key上修改
        # self[key] = value  
# 这样写就递归了，因为这里的返回值就是__getitem__方法的返回值，__getitem__方法显示的
# self.items[item]就是value，那么这里也就成了value等于value。但有些场景可以用这种方法
    
    def __iter__(self):  # __iter__方法要求返回一个迭代器
# 迭代的目的是把实例变成可迭代对象  
		return iter(self.items)  # 使用iter()将实例变成迭代器
    
    def __missing__(self, key):
        print("key ="+key) # 上面的__getitem__中的item如果超界的话，这里这样写是拦不住的。因为__missing__只是用在字典和set上的
    
    def __repr__(self):
        return str(self.items)
    
cart = Cart()
print(len(cart + 2 + 3 + 4 + 5))  # 连加就是链式编程
cart.__add__(2).__add__(3)  # 这等价于上面的cart + 2 + 3 + 4

for x in cart:   # cart如果不是迭代器iterator是不行的。因为for循环本质上是调用next()函数
    print(x)  # __iter__方法将实例变成了可迭代对象
    
for x in cart.items:  
# 这样也可以实现上面的for循环的效果，但要如何包装需要自己考虑但这样写就把cart里面的东西暴露给用户，所以这样写不好。所以我们要把它包装成容器就要包装的彻底，对一个容器来讲最重要的方法就是迭代了。
    print(x)
    
print(cart[1])
cart[500] = 500  # 查看__setitem__的反馈
cart[3] = 500
print(cart(3))
```

实现一个字典

```python
class MyDict(dict):  # 直接继承
    pass
```



可调用对象

```python
def foo():
    pass
foo()  # 加括号是调用，如果调用，一定要是可调用对象
print(foo.__dict__)
print(foo.__call__)  # 打印的是地址
print(dir(foo))  # 如果是一个可调用对象，就应该有__call__这个魔术方法。因为函数是一个可调用对象，所以有这个魔术方法

def foo(x):
    print(x)
foo()  # 加括号是调用，如果调用，一定要是可调用对象
print(foo.__dict__)
print(foo.__call__(5))  
# 如果送进去一个5，相当于foo对象被调用了，并且把参数送进去了。这等价于foo(5)
print(dir(foo))

class A:
    def __call__(self, *args, **kwargs):
        print(5)
        
A()()
# 第一个括号是__init__实例化使用的，第二个括号是调用这个实例。这等价于a = A(), a()

a = A()
a(4,5,6)
```

练习

定义一个斐波那契数列

```python
# 答案1
class Fib:
    def __init__(self):
        self.lst = [0, 1, 1]  # 这是一种缓存的思想
        
    def __len__(self):
        return len(self.lst)
    
    def __call__(self, x):
        if x < len(self.lst):
            return self.lst
        
        for i in range(2, x):  # 这里最好的2改成活动的
            self.lst.append(self.lst[i-1] + self.lst[i])
        return self.lst
    
    def __getitem__(self, item):
        if index < 0:  # 这里认为不知道斐波那契数列的长度，所以不支持负索引
            return None
        if index < len(self):
        	return self.lst[item]
        
        self(index)
    
a = Fib()
print(a(6))
print(a(5))
print(a(4))
print(a(10))

print(a.lst)
print(a[3])

增加迭代的方法、返回容器长度的方法
def __iter__(self):
    return iter(self.lst)
```



























