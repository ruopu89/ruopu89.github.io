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
animal Module's names = ['Animal', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__']
-----------------------------------
Current Module's names = ['Animal', 'Cat', 'Dog', '__annotations__', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'animal']
animal Module's names = <module 'animal' from '/Users/shouyu/PycharmProjects/test/animal.py'>
object's __dict__  = ['__class__', '__delattr__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__']
Animal's dir() = ['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'x']
Cat's dir()  = ['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'x', 'y']
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
['_Animal__age', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_name', 'weight', 'x', 'y']
['_Animal__age', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_name', 'weight', 'x', 'y']
['_Animal__age', '__class__', '__delattr__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '_name', 'weight', 'x', 'y']
Dog's dir = ['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'x']
['dog']
{'_name': 'snoppy', '_Animal__age': 10, 'weight': 20}
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
| `__hash__` | 内建函数`hash()`调用的返回值，返回一个整数。如果定义了这个方法，该类的实例就可hash。 |

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
print(s)   # 去重了吗，没有
print({tuple('t'), tuple('t')})
print({('tom',), ('tom',)})
print({'tom', 'tom'})
输出：
1
tom tom
[tom, tom]
~~~~~~~~~~~~~~~~~~~~~~~~~~~
{tom, tom}
{('t',)}
{('tom',)}
{'tom'}
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
输出：
1
tom tom
[tom, tom]
~~~~~~~~~~~~~~~~~~~~~~~~~~~
{tom}
{('t',)}
{('tom',)}
{'tom'}
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
        print('*'*100)
        print(self.x, self.y, other.x, other.y)
# 调用这个方法时，如print(p1 == p2)，这里的p1就是self，p2就是other
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
输出：
-1009709641759730766
-1009709641759730766
False
True
0x10a336b20 0x10a336880
{<__main__.Point object at 0x10a336b20>}
True
```



### bool

| 方法       | 意义                                                         |
| ---------- | ------------------------------------------------------------ |
| `__bool__` | 内建函数`bool()`，或者对象放在逻辑表达式的位置，调用这个函数返回布尔值。没有定义`__bool__()`，就找`__len__()`返回长度，非0为真。如果`__len__()`也没有定义，那么所有实例都返回真。 |

```python
class A: pass
# 因为没有定义bool或len方法，所以返回全为真
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
输出：
True
Real A
True
False
False
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
        return 'str: {},{}'.format(self.name, self.age)
    
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
输出：
str: tom,18
[repr: tom,18]
['str: tom,18']
str:a,1
1
['a'] ('1',)
{'1', 'a'}
b'tom is 18'
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
# add方法就是运算符重载
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
输出：
True
False
True
False
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
输出：
Missing key : k
None
```

思考

为什么空字典、空字符串、空元组、空集合、空列表等可以等效为False？

练习

将购物车类改造成方便操作的容器类

```python
class Cart:
    def __init__(self):
        self.items = []
# 在初始化时自定义self.items = []，这样就定义了一个列表，之后用self.items就可以打印整个列表，self.items.append()可以向列表中添加内容。     
        
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
print(cart)

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
输出：
3
True
[1, 'abc', 3]
1
abc
3
True
False
abc
[1, 'xyz', 3]
[1, 'xyz', 3, 4, 5, 6]
[1, 'xyz', 3, 4, 5, 6, 17, 18]
```



### 可调用对象

Python中一切皆对象，函数也不例外。

```python
def foo():
    print(foo.__module__, foo.__name__)
    
foo()
# 等价于
foo.__call__()
输出：
__main__ foo
__main__ foo
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
输出：
<__main__.Point object at 0x7fd3b9770a90>
<Point 4:5>
    
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
输出：
15
15
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
        
    def __call__(self, index):
        return self[index]
# 当使用fib(5)，这样调用时，但调用call方法，之后会返回self[index]，self[index]会调用getitem方法，返回实际的数字    
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
print(fib[5], fib[6])  # 索引访问 ，不计算。使用索引直接调用__getitem__方法，计算出索引位置的值。
```

可以看出使用类来实现斐波那契数列也是非常好的实现，还可以缓存数据，便于检索。



### 上下文管理

文件IO操作可以对文件对象使用上下文管理，使用`with...as`语法

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

提示属性错误，没有`__exit__`，看来需要这个属性



### 上下文管理对象

当一个对象同时实现了`__enter__()`和`__exit__()`方法，它就属于上下文管理的对象

| 方法        | 意义                                                         |
| ----------- | ------------------------------------------------------------ |
| `__enter__` | 进入与此对象相关的上下文 。如果存在该方法，`with`语法会把该方法的返回值绑定到`as`子句中指定的变量上 |
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
输出：
init
enter
exit
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
输出：
init
enter
<class 'Exception'>
New Error
<traceback object at 0x7f8171ce62c0>
exit
outer
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

print(add(2, 3))
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
def add(x, y):   # timeit(add)
    time.sleep(2)
    return x + y

print(add(4, 5))
输出：
add took 2.002056s
9
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
        return self.fn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print("{} took {}s".format(self.fn.__name__, delta))
        
with Timeit(add) as fn:
    # print(fn(4, 6))
    print(add(4, 7))
输出：
11
add took 2.001579s
```

另一种实现，使用可调用对象实现

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
输出：
5 6
11
add took 2.001707s
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
输出：
add took 2.001804s. call
None
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
        wraps(fn)(self)  # 这是什么意思？
        
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
输出：
add took 2.002079s. call
15
This is add function.
This is add function.
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
输出：
enter
None
exit
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
        return "Point({}, {})".format(self.x, self.y)
    
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
print(sorted(p.__dir__())) # list
输出：
Point(4, 5)
{'x': 4, 'y': 5}
{'x': 4, 'y': 16}
{'x': 4, 'y': 16, 'z': 10}
['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'show', 'x', 'y', 'z']
['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'show', 'x', 'y', 'z']
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
输出：
<__main__.Point object at 0x7f9a8bf6ea90>
<__main__.Point object at 0x7f9a8bf88490>
{'x': 4, 'y': 5}
{'x': 4, 'y': 16, 'z': 10}
Point(4, 16)
<function <lambda> at 0x7f9a8bf0a4c0>
<bound method <lambda> of <__main__.Point object at 0x7f9a8bf6ea90>>
Point(14, 26)
Point(0, 0)
<function <lambda> at 0x7f9a8bf0a700>
{'x': 4, 'y': 16, 'z': 10, 'sub': <function <lambda> at 0x7f9a8bf0a700>}
{'__module__': '__main__', '__init__': <function Point.__init__ at 0x7f9a8bf0a550>, '__str__': <function Point.__str__ at 0x7f9a8bf0a5e0>, 'show': <function Point.show at 0x7f9a8bf0a670>, '__dict__': <attribute '__dict__' of 'Point' objects>, '__weakref__': <attribute '__weakref__' of 'Point' objects>, '__doc__': None, 'add': <function <lambda> at 0x7f9a8bf0a4c0>}
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
python的名词空间指模块或作用域

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
# 3.8.2版本中如果没有collections模块，要用pip3 install collections-extended，使用时要用
# from _collections_abc import Hashable或用from collections.abc import Hashable，不然会提示:
# "DeprecationWarning: Using or importing the ABCs from 'collections' instead of from 'collections.abc' 
# is deprecated since Python 3.3, and in 3.9 it will stop working"

class A:
    X = 123
    def __init__(self, y):
        self.y = y
    
    def __hash__(self):  # hash冲突。两个对象在一个hash的计算空间中，可能算出的两个key是一样的
        return 1   # 这里只能用整型，不能用字符串
#    __hash__ = None
# 如果实例再调用hash就是在调用__hash__这个方法，这个方法就等于None，相当于调用None()。这时调用时会提示是不可hash类型。
# 不可hash类型就是这样实现的。

	def __eq__(self, other):
        # return True  # 这样定义，不管什么情况都认为两个实例相等，这时不管初始化时放什么值都相等了。如果把这里改成
# False，下面的显示结果也会是去重的，可能是set()先用了一个is来判断，之后再调用__eq__。也就是set先判断内存地址是否相同，相
# 同就去重
    	return self.y == other.y   # 应该这样写，而不是简单的True或False
# 当前的实例对象self和另一个实例对象other把y拿出来比较数据属性是否相同
# self.y == other.y叫二元操作符，self.y叫对象，==是操作符，相当于self.y对象在调用__eq__方法，而后面的other.y做为
# other参数。self.y是什么类型就调用什么类型的__eq__方法，而不是这里定义的__eq__方法，比如这里初始化时定义了
# self.y = 'y'，那么self.y就会调用字符串的__eq__方法。这里要看自己的逻辑，如果初始化定义了两个属性，这里可以判断一个属性
# 相等就可以了，也可以判断两个属性相等才行，如return self.y == other.y and self.x == other.x
# 用取模算法去理解hash算法
		
    
# hash(o)  # 相当于调用o.__hash__()，None是不能调用的，所以o是不能调用的
# o.__hash__()
print(hash(A(5))) # hash要对里面的对象调用hash的方法

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
输出：
1
[<__main__.A object at 0x10bdf0760>, <__main__.A object at 0x10be5c430>]
1
{<__main__.A object at 0x10bdf0760>}
1
True
```



eq

```python
a == b  # 相当于下面。这就是二元操作符如何等价到一个方法
a.__equal__(b)  # b就是__eq__(self, other)中的other，a就是self
```



练习

```python
# 设计二维坐标类Point，使其成为可hash类型，并比较2个坐标的实例是否相等？
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __eq__(self, other):
        if self is other:
            return True
        return self.x == other.x and self.y == other.y
    
p = Point(4, 5)
p1 = Point(4, 5)
p2 = Point(3, 4)
print(p)
print(p == p1)
print(p == p2)
print(p.__eq__(p1))
print(p.__eq__(p2))
输出：
<__main__.Point object at 0x7ff1f73c6a90>
True
False
True
False
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
# python默认使用repr对每个元素求打印，如果定义了str，就要用str对对象做强制转换。所以下面打印单个元素时都会调用str方法，包
# 括使用for循环时，也是一个个打印。在打印lst时调用了repr。如果不是直接使用print或format直接对函数起作用的话，就要用
# repr。否则使用str。也就是，如果print()直接作用于对象，就会强行调用对象的str方法，包括for循环也是直接作用于对象。但
# print(lst)时就要调用repr了，因为并不是print直接作用到对象上。所以可以将repr和str的返回值写成一样的

p1 = Point(4, 5)  
p2 = Point(5, 6)
print(p1)   # __str__等效于print方法
lst = [p1, p2]   
for x in lst:   # for循环也会调用__str__方法
    print(x)

print(*lst)   # 这相当于强行str了
print(list(map(str, lst)))  # map后是一个可迭代对象，所以返回的是地址。这也是强行str的方法
print(lst)  # lst里还有print，lst是找lst的print方法，lst里的元素不会这样处理。相当于元素没有直接被print打印出来。因为这是lst内部的元素，它要调用对象的另一种表达方法__repr__。如果不是用str()强制转换，或用format、print()直接对对象起作用的话，那就要用__repr__，这是python内部所使用的，默认会用内建函数__repr__来对每个元素求打印，也就是所谓的字符串输出。所以print()如果直接作用于对象，那就强行调用对象的str，所以返回abc，for循环也是一个个元素拿出来，对于每个元素来讲，就是直接用print来打印，所以还是调用__str__。但这里打印lst时相当于打印[p1, p2]，但print不知道[p1, p2]是什么，所以就尝试调用__repr__，因为并不是print函数直接作用在[p1, p2]上面的，所以打印的是123。
# 实际就是内建的几个函数，它直接作用在对象上，这样就会调用对象的str。如果并不直接作用在元素或对象上，就会调用它的repr方法 
输出：
abc
abc
abc
abc abc
['abc', 'abc']
[123, 123]
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
      #   return A(self.x - other.x)   # 这一行相当于上面两行代码。这里也可以直接返回self.x - other.x。一般应该返回自己本身，所以这里返回数值不太合适，要用A()包装一下。只是要返回实例本身，要实现__str__方法才能打印出数值。具体打印出的是什么内容要看__str__方法是如何定义的。
    
    def __ne__(self, other):
        return self.x != other.x
    
    def __eq__(self, other):
        return self.x == other.x
    
    def __lt__(self, other):
        return self.x < other.x  # 实现一个方法就行了，知道了小于，就知道大于和等于了
    
    def __str__(self):
        return str(self.x)
    
    def __iadd__(self, other):
        self.x = self.x + other.x
        return self  # 这样就不用new了，像下面的语句一样。
      #  return A(self.x + other.x)
        
    __repr__ = __str__    
    
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
输出：
-6
-6
False
True
[4, 6, 10]
[10, 6, 4]
14
===========================================================================================================
# 测试一下返回self如何打印
class A:              
    def __init__(self,
        self.x = x    
        self.y = y    
                      
    def __show__(self)
        print('self {}
        return self   
                      
    def __str__(self):
        return '{} {}'
                      
    __repr__ = __str__
                      
p = A(3, 54)          
print(p.__show__())   
输出：
self 3 54
3 54
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
        
    def __str__(self):
        return '<Point: {},{}>'.format(self.x, self.y)
    
    def __repr__(self):
        return '<Point: {},{}>'.format(self.x, self.y)

p1 = Point(1, 1)
p2 = Point(1, 1)
points = (p1, p2)
print(points)
print(points[0] + points[1])
print(p1 == p2)
输出：
(<Point: 1,1>, <Point: 1,1>)
<Point: 2,2>
True
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

上下文管理

通过上下文管理，我们可以只管打开，其他的不用关心，python解释器会为我们做，python会做一些自动化操作。你这段代理的上文和下文就是上下文

```python
# with open ('test') as f:
#    pass

class Point:
    def __init__(self):
        print('init')
        
    def __enter__(self):   # 使用上下文管理__enter__方法也是必须的。这个方法是进去了帮我做的事情
        print('enter'+self.__class__.__name__)
        return self  # 在这个语境下应该返回self,这样p和f就一样了。__enter__方法最后return的应该是一个文件对象类型。open()方法返回的实例也应该有上下文，返回一个文件对象类型
        
    def __exit__(self, exc_type, exc_val, exc_tb):  
    # 在上下文中使用类实例化时会提示类中要有__exit__方法。这个方法是离开的时候帮忙做的事情
    	print('Exit'+self.__class__.__name__)
 #  __enter__和__exit__是实例的方法，没有实例也不会被调用
		print(exc_type)   # 这一句会打印raise的类型
    	print(exc_val)   # 这是异常类型的值 
        print(exc_tb)   # 执行这三条语句时还是用raise。这一句会打印traceback。这三行只在抛异常时才会有，如果没有异常，会返回None
        return 1  # 这里的return的返回值可以决定异常是否向外抛出，这里如果返回True，就是这个方法里面管，外面可以正常执行，不会看到异常。如果返回一个等效False的，就会把异常抛出去，在外面可以看到。
    
p = Point()
import sys

# with Point() as f:  # Point后面要有括号，不能直接使用。也就是类被实例化后才能使用
with p as f:   # 这里会看实例p有没有__enter__，如果有就有会抛异常，然后请__enter__返回一个返回值，再把这个返回值给f,所以p和f是绝对不相等的
   # raise Exception('Error') # 有了这个raise，下面的语句就执行不到了。添加这句后，还是会执行__exit__方法的。下面也会抛异常
    sys.exit()  # 这句表示结束当前程序，使用这句，而不用上面的raise，还是会执行完__exit__结束
    print(f == p)
    print(f is p)
# 这里会按Point类中定义的__enter__和__exit__方法做事情
# 打开文件的时候叫文件对象，文件对象内一定实现了__enter__和__exit__方法，在__enter__时一定维护了一个文件对象，当离开with语句块时with语句块自动调用__exit__方法把资源彻底施放掉。一些预加载预处理的工作可以交给with来做
	print(p)
    print(f)
    
print('outer')
输出：
init
<class '__main__.Point'>
False
False
<__main__.Point object at 0x00000000000000847B8>
None
Point
# 抛出的异常中的traceback是追踪在堆栈中的执行过程,traceback打印的就是红色部分的内容，它在堆栈上追踪了整个异常调度过程，它也会显示异常抛出的内容，在第几行出了问题
```

练习

为加法函数计时

1. 使用装饰器显示该函数的执行时长
2. 使用上下文管理显示该函数的执行时长

```python
import datetime
def magedu(fn):
    def wapper(*args, **kwargs):
        time_start = datetime.datetime.now()
        ret = fn(*args, **kwargs)
        print(time_start - datetime.datetime.now())
        return ret
    return wapper
@magedu # add = magedu(add)
def add(x, y):
    return x + y

print(add(40, 50)
============================================================
import time
import datetime
      
class TimeIt:
	def __enter__(self):
        print('enter')
        self.start = datetime.datetime.now()
        return self
      
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print(delta)
        return 

def add(x, y):
    time.sleep(2)
    return x + y

with TimeIt() as f:
	add(5, 6)
============================================================
import time
import datetime
from functools import wraps      
      
class TimeIt:
    def __init__(self, fn):
        self._fn = fn
        # self.__doc__ = self._fn.__doc__
        # self.__name__ = self._fn.__name__
        # 加上这两条就可以调用add的doc和name方法了
        wraps(fn)(self)  # 这一句就是上面的两句
      
	def __enter__(self):
        print('enter')
        self.start = datetime.datetime.now()
        # return self
        return self._fn
# 如果下面要使用with TimeIt(add) as foo这种方式，返回self是不行的，需要返回self._fn，这等于在初始化时送进去的是什么，这里就返回什么
      
    def __call__(self, *args, **kwargs):
        print('__call__')
       #  return self._fn(*args, **kwargs)
# 如果要在上下文中使用self()这种方式，可以这样写。要什么就送回去什么
        start = datetime.datetime.now()
        ret = self._fn(*args, **kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print("dec {} took {}".format(self._fn.__name__, delta)
        return ret
      
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        delta = (datetime.datetime.now() - self.start).total_seconds()
        print("context {} took {}".format(self._fn.__name__, delta))
        return 
      
def logger(fn):
    @wraps(fn)  # a = wraps(fn)  ;  a(wrapper)  ;  @a
              #     @wraps(fn)(wrapper)，源是fn，目标是wrapper
    def wrapper(*args, **kwargs):
        start = datetime.datetime.now()
        ret = fn(*args, **kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print("dec {} took {}".format(fn.__name__, delta)
        return ret
    return wrapper

# @logger
@TimeIt   # 这样使用类装饰器，这样就不需要函数装饰器了。类装饰器需要__call__方法，它可以把一个东西模拟成一个函数，像函数一样调用
def add(x, y):  # add = TimeIt(add)
    time.sleep(2)
    return x + y
              
print(add(10, 11))
              
print(add.__doc__)  # add现在已经被包装成一个可调用对象，这个对象是就是TimeIt的实例，实例调用__name__是调不出来的
print(add.__name__)
print(add.__dict__)  
print(type(add))
              
with TimeIt(add) as f:  # 这里的add是装饰器装饰过的
	add(5, 6)
              
with TimeIt(add) as foo:
	foo(5, 6)
```

contextlib.contextmanager

yield返回单值，如yield x,y就是返回单值，x,y也是单值，是被封装后的单值

```python
import contextlib

@contextlib.contextmanager
def foo():
    print('enter')  # 这只是类似__enter__()，但并不是，只是模拟
    yield 3,5  # 这样会输出一个元组
    print('exit')
    
with foo() as f:
    try:
    	raise Exception
    # 加入raise后，上面的foo函数是执行不到yield的
    finally:
        print('exit')   # 如果要执行到这句，就要用这种方式
    print(f)
输出
enter
None
exit
# 输出把None加在了中间。foo函数生成器拿到后第一次做next()的话，执行到
# yield就停了，print('exit')不会被打印，做第二次next()时才会打印，然后
# 整个函数就return了，也就是print('exit')后面相当于有一句return，只是没
# 写出来。try是核心逻辑，finally是要做的清理工作。
```

total_ordering

```python
from functools import total_ordering
# 这个方法可以做所有的比较，这是一个装饰器。但一定要定义eq方法，其他的要使用
# 一个一般用lt方法
@total_ordering
class A:
    def __init__(self, x):
        self.x = x
    
    def __lt__(self, other):
        return self. < other.x
    
    def __eq__(self, other):
        return self.x == other.x
    
print(A(5) >= A(6))
print(A(5) > A(6))
print(A(5) <= A(6))
print(A(5) == A(6))
```

反射

理解反射先要理解什么是编译时什么是运行时，python是动态语言，更多的表现是在运行时，运行时指解释器加载代码后是什么状态，它更多的在意在执行的过程中是什么情况，执行过程中就是加载到内存中了。

反射指在运行时，它能够通过对象找到对象相关的类型信息，类型信息指我是什么类型，我有什么属性，因为有些类型在方法上，所以就要在运行时在类上找到他类型相关的所有信息。找信息与反射的关系是从它自身反射出了它的所有类型信息，这个过程就叫反射，通过这种机制，就可以在运行时掌握所有类型信息。一个对象可以在运行时反射出自己与类型相关的所有信息，这就是反射机制。反射也称为自省

```python
class A():
    def __init__(self):
        self.x = 5

a = A()
setattr(A, 'y', 10)   # 给A类加一个y属性，值是10。属性必须是字符串，下面打印类的属性就可以看到了。这与实例无关
print(A.__dict__)
print(a.__dict__)
print(getattr(a, 'x'))  # 使用getattr方法取a实例的x属性的值
print(getattr(a, 'y'))  # 这样可以取到类上的属性值，这也是先找自己的dict，如果没有就找父类的dict
print(getattr(a, 'y', 100))  # 这样是找不到的，所以给了一个缺省值100
if hasattr(a, 'z'):
    print(getattr(a, 'z'))
    
setattr(a, 'y', 1000)   # 这相当于给a.y赋值，会覆盖上面的setattr(A, 'y', 10) 
print(A.__dict__)  # 查找顺序还是自己优先，然后是父类，之后是祖先类
print(a.__dict__)
print(getattr(a, 'y'))
print(getattr(A, 'y'))

setattr(a, 'mtd', lambda self: 1)  # mtd属性是加到实例上了
print(A.__dict__)
print(a.__dict__)
a.mtd()  # 这里会显示mtd有问题，因为是编译时加进去的，所以不用管。这样当执行到mtd时会去找lambda函数，之后返回1。这看似没有问题，但执行时会提示缺少self，没有把实例放到第一个参数上。如果把上面改成setattr(A, 'mtd', lambda self: 1)就没问题了，但这是把属性加到类上了。在类里定义会和实例绑定
方法可以放在实例上，只是定义时没法写进去，因为定义时还没有实例，但运行时实例就可以存在，这样就可以在实例的字典里写上key和value，只是没有绑定。推荐加到类上。上面如果不想报错，又添加到实例上，可以写成a.mtd(a)
```

在运行时需要添加属性，就需要上面的方法了。装饰器和Mixin是在编译期要定义好的，不能动态改变

练习

命令分发器

```python
def dispatcher():
    cmds = {}
    def reg(cmd, fn):
        if isinstance(cmd, str):
        	cmds[cmd] = fn
        else:
            print('error')
    
    def run():
        while True:
        	cmd = input("plz input command: ")
            if cmd.strip() == 'quit':
                return
            cmds.get(cmd.strip(), defaultfn)()
    
    def defaultfn():
        pass
    
    return reg, run

reg,run = dispatcher()
reg('cmd1', lambda : 1)
reg('cmd2', lambda : 2)

run()
=================================================================================================
把上面的分发器函数改成类
class dispatcher():
    def cmd1(self):
        print('cmd1')
        
    def reg(self, cmd, fn):
        if isinstance(cmd, str):
            setattr(type(self), cmd, fn)
        else:
            print('error')
            
    def run(self):
        while True:
            cmd = input("plz input command: ")
            if cmd.strip() == 'quit':
                return
            getattr(self, cmd.strip(), self.defaultfn)()
            
    def defaultfn(self):
        print('default')
        
dis = dispatcher()

dis.reg('cmd2', lambda self: print(2))
dis.reg('cmd3', lambda self: print(3))

dis.run()
```

反射相关的魔术方法

```python
class A:
    def __init__(self, x):
        self.x = x
        
    def __getattr__(self, item):
        print('__getattr__', item)
        
print(A(10).x)
print(A(10).y)
=================================================================================================
class Base:
    n = 5
    
class A(Base):
    m = 6
    def __init__(self, x):
        self.x = x
        
    def __getattr__(self, item):
        print('__getattr__', item)
        # self.__dict__[item]  = # 找不到给一个缺省值 
        
    def __setattr__(self, key, value):
        print(key, value)
# 当设置一个属性的时候，这个setattr方法是一定会被触发的，但是究竟放不放到里面去就是我们的事了   

    def __delattr__(self, item):
        print('delattr')   # 删除实例属性
# setattr和delattr是不论是否找到了属性，就会被触发。getattr是如果找到了并且定义了才会被触发，不然即使找到也不会触发。一般delete都是删除自己有的属性，setattr有没有没关系，都可以加进来，getattr如果没有就找不到，应该抛异常的，但是因为有getattr方法，如果找不到getattr就会拦一道，有了这个拦截，异常就没有了。
a = A(10)
a.x = 100
a.m = 200
print(a.__dict__)
print(A.__dict__)
a.y
a.z
a.m
a.n  # 这是测试__getattr__方法
del a.x
del a.m  # 通过实例可以访问到的属性都可以删除
```

`__getattribute__`

```python
class Base:
    n = 5
    
class A(Base):
    m = 6
    def __init__(self, x):
        self.x = x
        
    def __getattribute__(self, item):  # 这个方法会最先执行，但一般不用
        print('__getattribute__', item)
# get的意思就是拿回来，回去是靠return的，这些get方法一个return都没有，get方法一般就是把什么东西给人家送回去，但这里没有return，所以返回的是None。__getattr__方法是在翻了一遍字典没有翻到时执行的。__getattribute__是还没到字典去就起作用了，在找字典前，__getattribute__会拦住并执行一次
		# raise AttributeError(item)  # 这会跳过翻字典的过程，下面的getattr也会执行一次
    	# return self.__dict__[item]  # 这会产生递归调用，出现问题
        return object.__getattribute__(self, item)   # 这样做是没必要的
        
    def __getattr__(self, item):
        print('__getattr__', item)
        # self.__dict__[item]  = # 找不到给一个缺省值 
        
    def __setattr__(self, key, value):
        print(key, value)
# 当设置一个属性的时候，这个setattr方法是一定会被触发的，但是究竟放不放到里面去就是我们的事了   

    def __delattr__(self, item):
        print('delattr')  
        
a = A(10)
print(a.x)  # 这里getattribute调用了
```


