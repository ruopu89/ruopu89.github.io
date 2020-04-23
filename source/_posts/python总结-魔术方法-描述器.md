---
title: python总结_魔术方法-描述器
date: 2020-04-22 10:24:22
tags: python描述器
categories: python
---

### `__get__`方法 

-   实现了`__get__`方法被称为非数据描述器
-   当通过类属性访问时会触发描述器，通过实例属性访问时不会触发。测试发现描述器方法是在`__init__`方法执行后执行的
-   调用类时会先执行`__new__`方法，这样就完成了实例化过程，之后执行`__init__`方法，这样就完成了初始化的过程
-   结论：当一个类的类属性等于另一个类的实例的时候，且被等于的这个类实现了三种方法中的一种，也就是被等于的类是描述器的话。如果通过类属性可以访问（可以是实例调用类属性），它就会触发`__get__`方法。如果是通过实例的属性访问它，就不会触发`__get__`方法。
-   如果调用父类的实例化的`__init__`里的方法，它会把父类的`__init__`里的属性放到自己的实例属性里，父类的类属性不变，这是为了便于查找
-   `def __get__(self, instance, owner)`中，self表示当前类的实例是谁；instance表示属主相关的实例（属主类实例化后叫什么），通过类访问描述器的时候，instance就是None，通过实例访问的时候就会显示实例；owner表示描述器被谁当作属性用到了，也就是这个描述器属主的相关的类型信息。
-   `__get__`方法要有返回值，否则返回None，就不能拿到实例的属性了
-   `__get__`方法是我们可以拿到当前类的实例、属主类型，属主实例的一种手段。这样通过属性的描述器就可以操作属主

```python
class A:
    def __init__(self):
        print('A.init')
        self.a1 = 'a1'
        
class B:
    x = A()  # B类被扫描完就会生成A实例
    
    def __init__(self):
        print('B.init')
        self.x = 100

print(B.x.a1)

b = B()
print(B.x.a1)

# print(b.x.a1)  # 这会报异常，因为b.x是从实例的dict拿的，b.x是100，100没有a1属性

print(b.x)
输出：
A.init
a1
B.init
a1
100
=================================================================================================
class A:
    def __init__(self):
        print('A.init')
        self.a1 = 'a1'
        
    def __get__(self, instance, owner):
        print('A.__get__', self, instance, owner)
        
class B:
    x = A()  # B类被扫描完就会生成A实例
    
    def __init__(self):
        print('B.init')
        # self.x = 100
        
print(B.x.a1)
输出：
A.init
Traceback (most recent call last):
A.__get__ <__main__.A object at 0x7f8eee41ba90> None <class '__main__.B'>
# 这里拦截了调用A类的实例属性a1，第一段的self就是A实例，第二段的instance是None，第三段owner表示描述器被谁当作属
# 性用到了，这里显示是被B类用到了。当你通过一个属性去访问的时候，如果这个属性刚好是另一个类的实例，而这个类又实现了
# 描述器三方法之一的话，也就是通过属性要访问描述器，如B类中的x=A()，就会触发__get__方法，如果是__get__方法被触发
# 的话，就会拿到自己当前实例self、这个描述器属主的相关的类型信息owner（哪个类使用了这个描述器）和属主相关的实例
# instance（类实例化后叫什么）
  File "/home/shouyu/PycharmProjects/test/魔术方法_描述器练习.py", line 121, in <module>
    print(B.x.a1)
AttributeError: 'NoneType' object has no attribute 'a1'
# 因为__get__方法返回值为None，提示None类型没有a1属性
# 加入__get__方法后就不会直接取A类的实例属性a1，而是被__get__方法拦住了。

print(B.x)
输出：
A.init
<__main__.A object at 0x7f7e0ce2fa90> None <class '__main__.B'>
# 这一行是__get__方法打印的内容，但方法没有return，所以返回的是None，再调用None的a1属性时就会报错。
None

print()  # 打印空行
b = B()
输出：
B.init

# print(B.x.a1)   # 只要访问A类，就要被__get__访问拦截，如果没有返回，就没法调用A类的实例属性a1
print(B.x)
输出：
<__main__.A object at 0x7fd350aeaa90> None <class '__main__.B'>
None

print(b.x)   # 这里输出的还是100,因为访问的是实例属性
输出：
<__main__.A object at 0x7fd350aeaa90> <__main__.B object at 0x7fd350b045b0> <class '__main__.B'>
None
# 因为调用的是b实例的x属性，而b实例没有x属性，调用的是B类的x属性，这里输出时调用了__get__方法，方法中的instance变成了b实例
到目前为止，描述器与类属性有关系
=================================================================================================
class A:
    def __init__(self):
        print('A.init')
        self.a1 = 'a1'
        
    def __get__(self, instance, owner):
        print(self, instance, owner)
        return self
        
class B:
    x = A()  # B类被扫描完就会生成A实例
    
    def __init__(self):
        print('B.init')
        self.x = A()
        
b = B()
print(b.x)  # 这里创建A实例时与类属性x创建A实例的时机是不一样的，类属性x创建A实例是在类初始化时就做了，类加载完就
# 做这个事了。b.x是在实例被创建后才创建的，也就是在b = B()后才创建的，所以这里的A实例与类的A实例是不一样的。这里没
# 有显示A.__get__，说明没有进描述器。也就是在实例属性中创建A实例不会触发__get__方法，在类中创建才会触发。也就是访
# 问实例自己的字典时不会触发，访问类的才会触发。所以这里是可以调用b.x.a1的，因为不会触发__get__方法
# 如果调用父类的实例化的__init__方法，它会把父类的__init__的属性放到自己的实例属性里，父类的类属性不变，这是为了
# 便于查找
输出：
<__main__.A object at 0x7f6a629cd8b0>  # 可以看到并未触发__get__方法
print(b.x.__dict__)
输出：
print(b.x.__dict__)

结论：可以看一下上面B.x会触发，b.x不会触发。也就是，实例可以访问类属性，但类属性不会加到实例字典中，这符合字典的搜索顺序只有__get__是非数据描述器，有__get__和__set__是数据描述器。一定要作为人家的类属性访问
```



### `__set__`方法

-   同时实现了`__set__`和`__get__`方法的是数据描述器
-   定义了`__set__`方法后，在初始化实例时的实例属性就不起作用了，会被`__set__`方法拦截。无论是在类中定义的初始化实例属性还是在外部修改实例属性，都会被`__set__`方法拦截，实例的字典中会变成空的。所以在描述器中不能修改实例属性
-   最好少用类来操作属性，因为这会改变类中定义的原有属性，要用实例来操作属性
-   `def __set__(self, instance, value)`中的self表示定义了这个方法的实例，instance表示调用这个方法的属主，value表示属主的赋值是什么。这里的self与value如果都是A实例，也会是不同的A实例。
-   python中所有的方法都是描述器

```python
class A:
    def __init__(self):
        print('A.init')
        self.a1 = 'a1'
        
    def __get__(self, instance, owner):
        print('A.__get__', self, instance, owner)
        return self
    
    def __set__(self, instance, value):
        print('A.__set__', self, instance, value)
# value表示要设置成什么值
        
class B:
    x = A()  # B类被扫描完就会生成A实例
    
    def __init__(self):
        print('B.init')
        self.x = 100
        
print(B.x)
print(B.x.a1)  # 这两条会触发__get__方法
输出：
A.init
A.__get__ <__main__.A object at 0x7fd30ed0ba90> None <class '__main__.B'>
<__main__.A object at 0x7fd30ed0ba90>
A.__get__ <__main__.A object at 0x7fd30ed0ba90> None <class '__main__.B'>
a1
# <__main__.A object at 0x7fd30ed0ba90>表示A实例，也就是A对象的地址

b = B()
print(B.x)
print(b.x.a1)
输出：
B.init
A.__set__ <__main__.A object at 0x7fa82f02fa90> <__main__.B object at 0x7fa82f049490> 100
# 这是在B实例初始化时的self.x = 100触发了描述器__set__方法。在调用b实例的x属性时把100放到了__set__方法的print里，与A实例的a1属性无关 
A.__get__ <__main__.A object at 0x7fa82f02fa90> None <class '__main__.B'>
<__main__.A object at 0x7fa82f02fa90>
A.__get__ <__main__.A object at 0x7fa82f02fa90> <__main__.B object at 0x7fa82f049490> <class '__main__.B'>  # 访问实例属性x时也触发了__get__方法
a1

print(b.__dict__)
print(B.__dict__)
输出：
{}  # 这里是空的，在B类初始化中的self.x = 100没起作用。实例属性x被加到了__set__方法的print里，成了这个方法的value值。对实例的操作相当于对描述器操作，所以会打印A.__set__ <__main__.A object at 0x7fa82f02fa90> <__main__.B object at 0x7fa82f049490> 100。也就是在数据描述器中，实例的属性是不起作用的。如果把上面的self.x = 100改为self.x = A()，那么输出中还是会触发__set__方法，输出如：A.__set__ <__main__.A object at 0x7f02242fda90> <__main__.B object at 0x7f0224329fd0> <__main__.A object at 0x7f0224317490>，这时就是把b实例当作instance传入__set__方法，A()当作value传入__set__方法。只是还是不起作用的，只是打印了一下。
{'__module__': '__main__', 'x': <__main__.A object at 0x7f487ee58a90>, '__init__': <function B.__init__ at 0x7f487edf4790>, '__dict__': <attribute '__dict__' of 'B' objects>, '__weakref__': <attribute '__weakref__' of 'B' objects>, '__doc__': None}
结论：当一个类的类属性是数据描述器的话（如上面的B类），对这个类的实例属性的操作，相当于操作类属性。如果是非数据描述器，就是操作实例属性。也就是数据描述器只能操作类属性。property()是数据描述器。少用类来操作属性，要用实例来操作。类中的所有方法都是非数据描述器

b.x = 400
print(b.x)
输出：
A.__set__ <__main__.A object at 0x7fd7e07a2a90> <__main__.B object at 0x7fd7e07cefd0> 400
A.__get__ <__main__.A object at 0x7fd7e07a2a90> <__main__.B object at 0x7fd7e07cefd0> <class '__main__.B'>
<__main__.A object at 0x7fd7e07a2a90>
# 这依然会触发__set__方法，所以还是不会对实例起作用，只是被__set__方法打印了一下。不要使用B.x = 100这样的方法，这
# 会改变类属性，描述器就没用了。所以少用类来操作属性，要用实例来操作。
```



### 练习

1.  实现StaticMethod装饰器，完成staticmethod装饰器的功能
2.  实现ClassMethod装饰器，完成classmethod装饰器的功能

```python
# 使用StaticMethod时的执行过程是，在调用A.foo时会执行A类中的两个@装饰器，这时就会执行两个装饰器中的__init__方法
# 与__get__方法，这是在f = A.foo 时就顺序执行完的。之后调用f()时，会执行StaticMethod中的__get__方法，打印出内
# 容并返回，可以看一下下面的输出结果。因为使用f = A.foo已经触发描述器了，所以会执行__get__方法，如果使用f = A(),
# 那么就只会执行StaticMethod类中的__init__方法，不会触发__get__方法

# 使用ClassMethod时的执行过程与StaticMethod一样，先执行装饰器中的__init__方法与__get__方法，之后如果
# ClassMethod类中的__get__方法返回的是self.fn(owner)，那么这还会调用A类中的bar方法，打印出类名。这是在
# f = A.bar 时就顺序执行完的。如果A类中用到了这两个装饰器并同时进行了赋值操作，那么在调用A类时两个装饰器中的方法都
# 会执行一遍。之后调用f()时，因为ClassMethod类中__get__方法使用的是return self.fn(owner)，这会调用A.bar(A)，
# 因为A类中bar方法没有返回值或说返回值为None，所以这里执行就会报错"TypeError: 'NoneType' object is not 
# callable"。所以要将__get__方法的返回值改为return partial(self.fn, owner)，通过partial函数就可以返回一个新
# 的函数，也就可以使用f()的方法调用了。如果__get__方法返回值为return self.fn，那么调用时就要用f(A)，这样才可以正
# 常输出。因为返回的是原函数，原函数保存在self.fn中。但这个函数是需要参数的，所以要用f(A)的方法调用，但这不符合我们
# 的要求。

# 在使用装饰器时符合描述器的定义，如A类中的bar方法，在使用装饰器时就等于bar = ClassMethod(bar)，这符合一个类的属
# 性等于另一个类，并且被等于的类中实现了三种方法之一，并且在调用时，如A.bar，这是通过类属性在访问描述器，所以会触发
# __get__方法。


from functools import partial

class StaticMethod:
    def __init__(self, fn):  # 这样就可以在作为装饰器时把函数当作fn参数传进来了
        print('a', '-', fn)
        self.fn = fn

    def __get__(self, instance, owner):
        print('b', '--', self, instance, owner)
        return self.fn


class ClassMethod:
    def __init__(self, fn):  # 这样就可以在作为装饰器时把函数当作fn参数传进来了
        print(1, '+', fn)
        self.fn = fn

    def __get__(self, instance, owner):
        print(2, '++', self, instance, owner)
        # return self.fn
        return self.fn(owner)   # 写成这样就会调用A.bar，打印出类名并返回None，可以在打印中看到这些
        # return partial(self.fn, owner)   # 这样做只会返回固定的类名称


class A:
    @StaticMethod
    def foo():
        print('c', '---', 'static')

    # 这里做完了，就相当于foo = StaticMethod(foo)。未来要用A.foo的方法调用

    @ClassMethod
    def bar(cls):  # 这里就等于bar = ClassMethod(bar)，这符合描述器的定义
        print(3, '+++', cls.__name__)
        # pass

f = A.foo  # 这一句触发了__get__方法。这一句会触发StaticMethod的__init__方法与__get__方法，也会触发
# ClassMethod类的__init__方法。也就是说在调用A类的时候就已经执行两个@装饰器了
print(f)
f()
输出：
a - <function A.foo at 0x7f28f5201310>
1 + <function A.bar at 0x7f28f52013a0>
b -- <__main__.StaticMethod object at 0x7f28f52e3580> None <class '__main__.A'>
<function A.foo at 0x7f28f5201310>
c --- static

f = A.bar   # 这时就已经执行了ClassMethod类中__init__方法与__get__方法，是先执行的__init__再执行__get__方法
# print(f)
# f(A)  # A.bar(A)。我们的目录是A.bar()
# A.bar(StaticMethod)
f()  # 返回是None类型，因为def bar(cls)没有返回值
输出：
Traceback (most recent call last):
a - <function A.foo at 0x7fcab8c6b310>
  File "/home/shouyu/PycharmProjects/test/魔术方法_描述器练习.py", line 246, in <module>
    f1()  # 返回是None类型，因为def bar(cls)没有返回值
1 + <function A.bar at 0x7fcab8c6b3a0>
TypeError: 'NoneType' object is not callable
2 ++ <__main__.ClassMethod object at 0x7fcab8c998b0> None <class '__main__.A'>
3 +++ A
```

3.  对类的实例的属性name、age进行数据校验

```python
class Person:
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age
==================================================================================================
# 通过描述器实现，在Person类中定义类属性为修改的数据，这些数据要通过Typed描述器进行检查，检查时通过描述器的__set__方法，__set__方法检查传入Person的值是否属于初始化时传入Typed类中的type，如果属于就说明传入到Person的值没有问题，否则抛错。如果属性这个类，会打印返回给Person函数的值，这里的__set__方法并没有返回值。
class Typed:
    def __init__(self, type):
        self.type = type
# 各实例保存自己的类型，这样写没有问题

    def __get__(self, instance, owner):
        pass

    def __set__(self, instance, value):
        print('T.set', self, instance, value)   # 这里可以拿到传给Person的两个值
        if not isinstance(value, self.type):
            raise ValueError(value)  # 这里进行判断，如果不是指定的类型就抛错
# 判断只在设置值时发生，也就是在__set__方法中发生，在取值时不管，所以写不写__get__，问题不大
class Person:
    name = Typed(str)
    age = Typed(int)   # 这里直播将类型传入Typed类中去判断

    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age

p1 = Person('tom', 90)
# 这样写不太好，下面改进
输出：
T.set <__main__.Typed object at 0x7f9dd7aaea90> <__main__.Person object at 0x7f9dd7ac8970> tom
T.set <__main__.Typed object at 0x7f9dd7adaf40> <__main__.Person object at 0x7f9dd7ac8970> 90
# 这样写不太好，下面改进
==================================================================================================
# 通过inspect模块中的signature方法，我们可以拿到向类中传入的数据和注释，官方称为签名与注释，如：(name: str, age: int)。再通过parameters方法我们可以得到参数名到相应参数对象的有序映射，这会得到字典，如：OrderedDict([('name', <Parameter "name: str">), ('age', <Parameter "age: int">)])，之后我们来迭代这个字典，取得它的value，之后可以通过annotation取得value的类型，如果没有定义过，会返回parameter.empty。这样我们就取得了类初始化时要传入的数据的类型。我们定义一个TypeAssert类，在其中使用__call__方法，按上面方法取得类的参数名到相应参数对象的有序字典。之后迭代这个字典，并取得参数名的类型，再判断这个类型是不是空的，如果不是就使用setattr给这个类的参数加一个类型，也就是setattr(self.cls, name, Typed(param.annotation))，这等价于self.cls.name = Typed(param.annotation)，添加类型时会再触发描述器，描述器会使用__set__方法检查传入Person的值是否符合类型要求。这里的Person类是被外部调用的，Typed类是检查类型的，TypeAssert是提取类型并连接Person与Typed类的


import inspect

class Typed:
    def __init__(self, type):
        self.type = type
# 各实例保存自己的类型，这样写没有问题
#
    def __get__(self, instance, owner):
        pass

    def __set__(self, instance, value):
        print('T.set', self, instance, value)   # 这里可以拿到传给Person的两个值
        if not isinstance(value, self.type):
            raise ValueError(value)  # 这里进行判断，如果不是指定的类型就抛错
#
class TypeAssert:
    def __init__(self, cls):
        self.cls = cls

    def __call__(self, name, age):
        params = inspect.signature(self.cls).parameters
        print(params)
        for name, param in params.items():
            print(name, param.annotation)
            if param.annotation != param.empty:  # 如果Person中__init__方法的值有注解才能检查
                setattr(self.cls, name, Typed(param.annotation))
                # 这一句相当于name = Typed(str)和age = Typed(int)两句。这一句可以动态地为值加一个类属性，而且类属性指向了一个描述器

@TypeAssert
class Person:
    def __init__(self, name:str, age:int):
        self.name = name
        self.age = age

# params = inspect.signature(Person).parameters
# print(params)
# for name,param in params.items():
#     print(name, param.annotation)   # 这样就可以拿到类了。param.annotation返回的是类型

p1 = Person('tom', 90)
输出：
OrderedDict([('name', <Parameter "name: str">), ('age', <Parameter "age: int">)])
name <class 'str'>
age <class 'int'>
```

