---
title: python基础学习-描述器
date: 2020-03-08 20:23:10
tags: python描述器
categories: python
---

### 描述器（Descriptors）的表现

用到3个魔法方法：`__get__()`、`__set__()`、`__delete__()`

方法签名如下

`object.__get__(self, instance, owner)`

`object.__set__(self, instance, value)`

`object.__delete__(self, instance)`

`self`指代当前实例，调用者

`instance`是`owner`的实例

`owner`是属性的所属的类

请思考下面程序的执行流程是什么？

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
class B:
    x = A()
    def __init__(self):
        print('B.init')
        
print('-' * 20)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x.a1)

# 运行结果
A.init
---------------
a1
===============
B.init
a1
```

可以看出执行的先后顺序吧？

类加载的时候，类变量需要先生成，而类B的x属性是类A的实例，所以类A先初始化，所以打印`A.init`。

然后执行到打印`B.x.a1`

然后实例化并初始化B的实例b。

打印`b.x.a1`，会查找类属性`b.x`，指向A的实例，所以返回A实例的属性a1的值

看懂执行流程了，再看下面的程序，对类A做一些改造。

如果在类A中实现`__get__`方法，看看变化

```python
class A:
	def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        
class B:
    x = A()
    def __init__(self):
        print('B.init')
        
print('-' * 20)
print(B.x)
# print(B.x.a1) # 抛异常AttributeError: 'NoneType' object has no attribute 'a1'
 
print('=' * 20)
b = B()
print(b.x)
# print(b.x.a1) # 抛异常AttributeError: 'NoneType' object has no attribute 'a1'

# 运行结果
A.init
--------------------
A.__get__ <__main__.A object at 0x00000000001084E48> None <class '__main__.B'>
None
====================
B.init
A.__get__<__main__.A object at 0x00000000001084E48> <__main__.B object at 0x00000000001084E28> <class '__main__.B'>
None
```

因为定义了`__get__`方法，类A就是一个描述器，对类B或者类B的实例的x属性读取，成为对类A的实例的访问，就会调用`__get__`方法

如何解决上例中访问报错的问题，问题应该来自`__get__`方法。

`self`, `instance`, `owner`这三个参数，是什么意思？

`<__main__.A object at 0x00000000001084E48> None <class '__main__.B'> None`

`<__main__.A object at 0x00000000001084E48> <__main__.B object at 0x00000000001084E28>`

`self`都是A的实例

`owner`都是B类

`instance`说明

```python
- None表示是没有B类的实例，对应调用B.x
- <__main__.B object at 0x00000000001084E28>表示是B的实例，对应调用B().x
```

使用返回值解决。返回`self`，就是A的实例，该实例有`a1`属性，返回正常。

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        return self  # 解决返回None的问题
    
class B:
    x = A()
    def __init__(self):
        print('B.init')
        
print('-' * 20)
print(B.x)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x)
print(b.x.a1)
```

那么类B的实例属性也可以？

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        return self  # 解决返回None的问题
    
class B:
    x = A()
    def __init__(self):
        print('B.init')
        self.b = A()  # 实例属性也指向一个A的实例
        
print('-' * 20)
print(B.x)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x)
print(b.x.a1)

print(b.b)   # 并没有触发__get__
```

从运行结果可以看出，只有类属性是类的实例才行。



### 描述器定义

Python中，一个类实现了`__get__`、`__set__`、`__delete__`三个方法中的任何一个方法，就是描述器。

如果仅实现了`__get__`，就是**非数据描述符 non-data descriptor**；

同时实现了`__get__`、`__set__`就是**数据描述符 data descriptor**。

如果一个类的类属性设置为描述器，那么它被称为`owner`属主。



### 属性的访问顺序

为上例中的类B增加实例属性x

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        return self
    
class B:
    x = A()
    def __init__(self):
        print('B.init')
        self.x = 'b.x'  # 增加实例属性x
        
print('-' * 20)
print(B.x)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x)
print(b.x.a1)  # AttributeError: 'str' object has no attribute 'a1'
```

`b.x`访问到了实例的属性，而不是描述器。

继续修改代码，为类A增加`__set__`方法。

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        return self
    
    def __set__(self, instance, value):
        print('A.__set__ {} {} {}'.format(self, instance, value))
        self.data = value
        
class B:
    x = A()
    def __init__(self):
        print('B.init')
        self.x = 'b.x'  # 增加实例属性x
        
print('-' * 20)
print(B.x)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x)
print(b.x.a1)  # 返回a1
```

返回变成了a1，访问到了描述器的数据。

属性查找顺序

实例的`__dict__`优先于非数据描述器

数据描述器优先于实例的`__dict__`

`__delete__`方法有同样的效果，有了这个方法，就是数据描述器。

尝试着增加下面的代码，看看字典的变化

```python
b.x = 500
B.x = 600
b.x = 500，这是调用数据描述器的__set__方法，或调用非数据描述器的实例覆盖
B.x = 600，赋值即定义，这是覆盖类属性。
```



### 本质（进阶）

Python真的会做的这么复杂吗，再来一套属性查找顺序规则？看看非数据描述器和数据描述器，类B及其`__dict__`的变化。

屏蔽和不屏蔽`__set__`方法，看看变化。

```python
class A:
    def __init__(Self):
        self.a1 = 'a1'
        print('A.init')
        
    def __get__(self, instance, owner):
        print("A.__get__ {} {} {}".format(self, instance, owner))
        return self
    
    # def __set__(self, instance, value):
    # 		print('A.__set__ {} {} {}'.format(self, instance, value))
    # 		self.data = value
    
class B:
    x = A()
    def __init__(self):
        print('B.init')
        self.x = 'b.x'  # 增加实例属性x
        self.y = 'b.y'
        
print('-' * 20)
print(B.x)
print(B.x.a1)

print('=' * 20)
b = B()
print(b.x)
# print(b.x.a1)  # 返回a1
print(b.y)
print('字典')
print(b.__dict__)
print(B.__dict__)
```

```python
# 屏蔽__set__方法结果如下
字典
{'x': 'b.x', 'y': 'b.y'}
{'__weakref__':<attribute '__weakref__' of 'B' objects>, 'x': <__main__.A object at 0x0000000000824E48>, '__doc__': None, '__dict__': <attribute '__dict__' of 'B' objects>, '__module__': '__main__', '__init__': <function B.__init__ at 0x000000000081E620>}

# 不屏蔽__set__方法结果如下
{'y': 'b.y'}
{'__weakref__': <attribute '__weakref__' of 'B' objects>, '__init__': <function B.__init__ at 0x0000000000109E6A8>, 'x': <__main__.A object at 0x0000000000824E48>, '__dict__': <attribute '__dict__' of 'B' objects>, '__module__': '__main__','__doc__': None}
```

原来不是什么**数据描述器**优先级高，而是把实例的属性从`__dict__`中给去除掉了，造成了该属性如果是数据描述器优先访问的假象。

说到底，属性访问顺序从来就没有变过



### Python中的描述器

描述器在Python中应用非常广泛

Python的方法（包括`staticmethod()`和`classmethod()`）都实现为非数据描述器。因此，实例可以重新定义和覆盖方法。这允许单个实例获取与同一类的其他实例不同的行为。

`property()`函数实现为一个数据描述器。因此，实例不能覆盖属性的行为。

```python
class A:
    @classmethod
    def foo(cls):   # 非数据描述器
        pass
    
    @staticmethod   # 非数据描述器
    def bar():
        pass
    
    @property   # 数据描述器
    def z(self):
        return 5
    
    def getfoo(self):   # 非数据描述器
        return self.foo
    
    def __init__(self):   # 非数据描述器
        self.foo = 100
        self.bar = 200
        # self.z = 300
        
a = A()
print(a.__dict__)
print(A.__dict__)
```

foo、bar都可以在实例中覆盖，但是z不可以。



### 练习

1. 实现`StaticMethod`装饰器，完成`staticmethod`装饰器的功能
2. 实现`ClassMethod`装饰器，完成`classmethod`装饰器的功能

```python
# 类staticmethod装饰器

class StaticMethod:  # 怕冲突改名
    def __init__(self, fn):
        self._fn = fn
        
    def __set__(self, instance, owner):
        return self._fn
    
class A:
    @staticMethod
    # stmtd = StaticMethod(stmtd)
    def stmtd():
        print('static method')
        
A.stmtd()
A().stmtd()
```

```python
from functools import partial

# 类classmethod装饰器
class ClassMethod:  # 怕冲突改名
    def __init__(self, fn):
        self._fn = fn
        
    def __get__(self, instance, owner):
        ret = self._fn(owner)
        return ret
class A:
    @ClassMethod
    # clsmtd = ClassMethod(clsmtd)
    # 调用A.clsmtd() 或者 A().clsmtd()
    def clsmtd(cls):
        print(cls.__name__)
print(A.__dict__)
A.clsmtd
A.clsmtd()
```

`A.clsmtd()`的意思就是`None()`，一定报错。怎么修改？

`A.clsmtd()`其实就应该是`A.clsmtd(cls)()`，应该怎么处理？

`A.clsmeth = A.clsmtd(cls)`

应该用`partial`函数

```python
from functools import partial

# 类classmethod装饰器
class ClassMethod:   # 怕冲突改名
    def __init__(self, fn):
        self._fn = fn
        
    def __get__(self, instance, cls):
        ret = partial(self._fn, cls)
        return ret
    
class A:
    @ClassMethod
    # clsmtd = ClassMethod(clsmtd)
    # 调用A.clsmtd() 或者 A().clsmtd()
    def clsmtd(cls):
        print(cls.__name__)
        
print(A.__dict__)
print(A.clsmtd)
A.clsmtd()
```

3. 对实例的数据进行校验

```python
class Person:
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age
```

对上面的类的实例的属性name、age进行数据校验

思路

1. 写函数，在`__init__`中先检查，如果不合格，直接抛异常
2. 装饰器，使用`inspect`模块完成
3. 描述器

```python
# 写函数检查
class Person:
    def __init__(self, name:str, age:int):
        params = ((name, str),(age, int))
        if not self.checkdata(params):
            raise TypeError()
        self.name = name
        self.age = age
        
    def checkdata(self, params):
        for p, t in params:
            if not isinstance(p, t):
                return False
            return True
        
p = Person('tom', '20')
```

这种方法耦合度太高。

装饰器的方式，前面写过类似的，这里不再赘述。

描述器方式

需要使用数据描述器，写入实例属性的时候做检查

```python
class Types:
    def __init__(self, name, type):
        self.name = name
        self.type = type
        
    def __get__(self, instance, owner):
        if instance is not None:
            return instance.__dict__[self.name]
        return self
    
    def __set__(self, instance, value):
        if not isinstance(value, self.type):
            raise TypeError(value)
        instance.__dict__[self.name] = value
        
class Person:
    name = Typed('name', str)  # 不优雅
    age = Typed('age', int)  # 不优雅
    
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age
        
p = Person('tom', '20')
```

代码看似不错，但是有硬编码，能否直接获取形参类型，使用`inspect`模块

先做个实验

`params = inspect.signature(Person).parameters`

看看返回什么结果

完整代码如下

```python
class Typed:
    def __init__(self, name, type):
        self.name = name
        self.type = type
        
    def __get__(self, instance, owner):
        if instance is not None:
            return instance.__dict__[self.name]
        return self
    
    def __set__(self, instance, value):
        if not isinstance(value, self.type):
            raise TypeError(value)
        instance.__dict__[self.name] = value
        
import inspect
def typeassert(cls):
    params = inspect.signature(cls).parameters
    print(params)
    for name,param in params.items():
        print(param.name, param.annotation)
        if param.annotation != param.empty:  # 注入类属性
            setattr(cls, name, Typed(name, param.annotation))
    return cls

@typeassert
class Person:
    # name = Typed('name', str)  # 装饰器注入
    # age = Typed('age', int)
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age
        
    def __repr__(self):
        return "{} is {}".format(self.name, self.age)
    
p = Person('tom', '20')
p = Person('tom', 20)
print(p)
```

可以把上面的函数装饰器改为类装饰器，如何写？

```python
class Typed:
    def __init__(self, type):
        self.type = type
        
    def __get__(self, instance, owner):
        pass
    
    def __set__(self, instance, value):
        print('T.set', self, instance, value)
        if not isinstance(value, self.type):
            raise ValueError(value)
            
import inspect
class TypeAssert:
    def __init__(self,cls):
        self.cls = cls  # 记录着被包装的Person类
        params = inspect.signature(self.cls).parameters
        print(params)
        for name,param in params.items():
            print(name, param.annotation)
            if param.annotation != param.empty:
                setattr(self.cls, name, Typed(param.annotation))  # 注入类属性
        print(self.cls.__dict__)
        
    def __call__(self, name, age):
        p = self.cls(name, age)   # 重新构建一个新的Person对象
        return p
    
@TypeAssert
class Person:  # Person = TypeAssert(Person)
    # name = Typed(str)
    # age = Typed(int)
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age
        
p1 = Person('tom', 18)
print(id(p1))
p2 = Person('tom', 20)
print(id(p2))
p3 = Person('tom', '20')
```



有一个无序序列[37, 99, 73, 48, 47, 40, 40, 25, 99, 51]，请先排序并打印输出。

分别尝试插入20、40、41到这个序列中合适的位置，保证其有序。

思路

排序后二分查找到适当位置插入数值。

排序使用sorted解决，假设升序输出。

查找插入点，使用二分查找完成。

假设全长为n，首先在大致的中点元素开始和待插入数比较，如果大则和右边的区域的中点继续比较，如果小则和左边的区域的中点进行比较，以此类推。

直到中点就是

```python
def insert_sort(orderlist, i):
    ret = orderlist[:]
    low = 0
    high = len(orderlist) - 1
    while low < high:
        mid = (low + high) // 2
        if orderlist[mid] < i:
            low = mid + 1  # 说明i大，右边，限制下限
        else:
            high = mid   # 说明i不大于，左边，限制上限
    print(low)   # low为插入点
    ret.insert(low, i)
    return ret

# 测试
r = newlst
for x in (40, 20, 41):
    r = insert_sort(r, x)
    print(r)
```

看似上面代码不错，请测试插入100.

问题来了，100插入的位置不对，为什么？

```python
def insert_sort(orderlist, i):
    ret = orderlist[:]
    low = 0
    high = len(orderlist)  # 去掉减1
    while low < high:
        mid = (low + high) // 2
        if orderlist[mid] < i:
            low = mid + 1 # 说明i大，右边，限制下限
        else:
            high = mid   # 说明i不大于，左边，限制上限
    print(low)
    ret.insert(low, i)
    return ret

# 测试
r = newlst
for x in (40, 20, 41, 100):
    r = insert_sort(r, x)
    print(r)
```

`high = len(orderlist)`，去掉减1不影响整除2，但影响下一行判断。

`while low < high`这一句`low`索引可以取到`length-1`了，原来只能取到`length-2`，所以一旦插入元素到尾部就出现问题了。

算法的核心，就是折半至重合为止。



### 二分

二分前提是有序，否则不可以二分。

二分查找算法的时间复杂度O(log n)



### bisect模块

Bisect模块提供的函数有：

- `bisect.bisect_left(a, x, lo=0, hi=len(a)):`

  查找在有序列表a中插入x的index。lo和hi用于指定列表的区间，默认是使用整个列表。如果x已经存在，在其左边插入。返回值为index。

- `bisect.bisect_right(a, x, lo=0, hi=len(a))`或`bisect.bisect(a, x, lo=0, hi=len(a))`

  和`bisect_left`类似，但如果x已经存在，在其右边插入。

- `bisect.insort_left(a, x, lo=0, hi=len(a))`

  在有序列表a中插入x。等同于`a.insert(bisect.bisect_left(a, x, lo, hi), x)`。

- `bisect.insort_right(a, x, lo=0, hi=len(a))`或者`bisect.insort(a, x, lo=0, hi=len(a))`

  和`insort_left`函数类似，但如果x已经存在，在其右边插入。

函数可以分2类：

`bisect`系，用于查找index

`Insort`系，用于实际插入

默认重复时从右边插入。

```python
import bisect

lst = [37, 99, 73, 48, 47, 40, 40, 25, 99, 51, 100]

newlst = sorted(lst)  # 升序
print(newlst)  # [25, 37, 40, 40, 47, 48, 51, 73, 99, 99, 100]
print(list(enumerate(newlst)))
print(20, bisect.bisect(newlst, 20))
print(30, bisect.bisect(newlst, 30))
print(40, bisect.bisect(newlst, 40))

print(20, bisect.bisect_left(newlst, 20))
print(30, bisect.bisect_left(newlst, 30))
print(40, bisect.bisect_left(newlst, 40))

for x in (20, 30, 40, 100):
    bisect.insort_left(newlst, x)
    print(newlst)
```



### 应用

判断学生成绩，成绩等级A-E，其中，90分以上为A，80-89为B，70-79为C，60-69为D，60分以下为E

```python
import bisect

def get_grade(score):
    breakpoints = [60, 70, 80, 90]
    grades = 'EDCBA'
    
    return grades[bisect.bisect(breakpoints, score)]

for x in (91, 82, 77, 65, 50, 60, 70):
    print('{} => {}'.format(x, get_grade(x)))
```



### 作业

将前面的链表，封装成容器

要求：

1. 提供`__getitem__`、`__iter__`、`__setitem__`方法
2. 全用一个列表，辅助完成上面的方法
3. 进阶：不使用列表，完成上面的方法

进阶题

实现类property装饰器，类名称为Property。

基本结构如下，是一个数据描述器

```python
class Property:  # 数据描述器
    def __init__(self):
        pass
    
    def __get__(self, instance, owner):
        pass
    
    def __set__(self, instance, value):
        pass
    
class A:
    def __init__(self, data):
        self._data = data
        
    @Property
    def data(self):
        return self._data
    
    @data.setter
    def data(self, value):
        self._data = value
```

