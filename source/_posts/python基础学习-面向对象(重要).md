---
title: python基础学习-面向对象(重要)
date: 2020-03-05 20:36:18
tags: 面向对象
categories: python
---

### 语言的分类

面向机器

抽象成机器指令，机器容易理解

代表：汇编语言



面向过程

做一件事情，排出个步骤，第一步干什么，第二步干什么，如果出现情况A，做什么处理，如果出现了情况B，做什么处理。

问题规模小，可以步骤化，按部就班处理。

代表：C语言



面向对象OOP

随着计算机需要解决的问题的规模扩大，情况越来越复杂。需要很多人、很多部门协作，面向过程编程不太适合了。

代表：C++、Java、Python等



### 面向对象

什么是面向对象呢？

一种认识世界、分析世界的方法论。将万事万物抽象为类。



类`class`

类是抽象的概念，是万事万物的抽象，是一类事物的共同特征的集合。

用计算机语言来描述类，就是属性和方法的集合。



对象`instance`、`object`

对象是类的具象，是一个实例。

对于我们每个人这个个体，都是抽象概念人类的不同的实例。



举例：

你吃鱼

你，就是对象；鱼，也是对象；吃就是动作

你是具体的人，是具体的对象。你属于人类，人类是个抽象的概念，是无数具体的个体的抽象。鱼，也是具体的对象，就是你吃的这一条具体的鱼。这条鱼属于鱼类，是无数的鱼抽象出来的概念。

吃，是动作，也是操作，也是方法，这个吃是你的动作，也就是人类具有的方法。如果反过来，鱼吃人。吃就是鱼类的动作了。

吃，这个动作，很多动物都具有的动作，人类和鱼类都属于动物类，而动物类是抽象的概念，是动物都有吃的动作，但是吃法不同而已。

你驾驶车，这个车也是车类的具体的对象（实例），驾驶这个动作是鱼类不具有的，是人类具有的方法。

属性，它是对象状态的抽象，用数据结构来描述。

操作，它是对象行为的抽象，用操作名和实现该操作的方法来描述

每个人都有名字、身高、体重等信息，这些信息是个人的属性，但是，这些信息不能保存在人类中，因为它是抽象的概念，不能保留具体的值。

而人类的实例，是具体的人，他可以存储这些具体的属性，而且可以不同人有不同的属性。

哲学

一切皆对象

对象是数据和操作的封装

对象是独立的，但是对象之间可以相互作用（这对应的是人吃鱼的例子，动作把这两个对象关联起来 ）

目前OOP是最接近人类认知的编程范式



### 面向对象三要素

1. 封装
   - 组装：将数据和操作组装到一起。
   - 隐藏数据：对外只暴露一些接口，通过接口访问对象。比如驾驶员使用汽车，不需要了解汽车的构造细节，只需要知道使用什么部件怎么驾驶就行，踩了油门就能跑，可以不了解后面的机动原理。
2. 继承
   - 多复用，继承来的就不用自己写了
   - 多继承少修改，OCP（Open-closed Principle），使用继承来改变，来体现个性
3. 多态
   - 面向对象编程最灵活的地方，动态绑定



人类就是封装：

人类继承自动物类，孩子继承父母特征。分为单一继承、多继承；

多态，继承自动物类的人类、猫类的操作“吃”不同



### Python的类

#### 定义

```python
class ClassName:
    语句块
```

1. 必须使用`class`关键字
2. 类名必须是用大驼峰命名
3. 类定义完成后，就产生了一个类对象，绑定到了标识符`ClassName`上



举例

```python
class MyClass:
    """A example class"""   # 文档字符串
    x = 'abc'  # 类属性，不是对象的属性，对象的属性指的是类的实例的属性
    
    def foo(self):  # 类属性foo，也是方法
        return 'My Class'
    
print(MyClass.x)
print(MyClass.foo)
print(MyClass.__doc__)
```



### 类对象及类属性

- 类对象，类的定义就会生成一个类对象
- 类的属性，类定义中的变量和类中定义的方法都是类的属性
- 类变量，上例中`x`是类`MyClass`的变量

`MyClass`中，`x`、`foo`都是类的属性，`__doc__`也是类的属性

`foo`方法是类的属性，如同`吃`是人类的方法，但是每一个具体的人才能吃东西，也就是说`吃`是人的实例才能调用的方法

`foo`是方法对象`method`，不是普通的函数对象`function`了，它一般要求至少有一个参数。第一个参数可以是`self`（`self`只是个惯用标识符，可以换名字），这个参数位置就留给了`self`。

`self`指代当前实例本身

问题

上例中，类是谁？实例是谁？

#### 实例化

```python
a = MyClass()  # 实例化
```

使用上面的语法，在类对象名称后面加上一个括号，就调用类的实例化方法，完成实例化。实例化就真正创建一个该类的对象（实例）。例如

```python
tom = Person()
jerry = Person()
```

上面的`tom`、`jerry`都是`Person`类的实例，通过实例化生成了2个实例。

每次实例化后获得的实例，是不同的实例，即使是使用同样的参数实例化，也得到不一样的对象。

Python类实例化后，会自动调用 `__init__`方法。这个方法第一个参数必须留给`self`，其它参数随意。



#### `__init__`方法

`MyClass()`实际上调用的是`__init__(self)`方法，可以不定义，如果没有定义会在实例化后隐式调用。

作用：对实例进行初始化

```shell
class MyClass:
def __init__(self):
	print('init')
	
print(MyClass)   # 不会调用
print(MyClass())   # 调用__init__
a = MyClass()   # 调用__init__
```

初始化函数可以有多个参数，请注意第一个位置必须是self，例如`__init__(self, name, age)`

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def showage(self):
        print('{} is {}'.format(self.name, self.age))
        
tom = Person('Tom', 20)   # 实例化
jerry = Person('Je', 25)
print(tom.name, jerry.age)
jerry.age += 1
print(jerry.age)
jerry.showage()
输出：
Tom 25
26
Jerry is 26
```

注意：`__init__()`方法不能有返回值，也就是只能是None



#### 实例对象`instance`

类实例化后一定会获得一个对象，就是实例对象

上例中的`tom`、`jerry`就是`Person`类的实例

`__init__`方法的第一参数`self`就是指代某一个实例。

类实例化后，得到一个实例对象（实例对象就是上面说的类的对象），实例对象会绑定方法，调用方法时采用`jerry.showage()`的方式。但是函数签名是`showage(self)`，少传一个参数`self`吗？

这个`self`就是`jerry`，Python会把方法的调用者作为第一参数`self`的实参传入。

`self.name`就是`jerry`对象的`name`，`name`是保存在了`jerry`对象上，而不是`Person`类上。所以，称为实例变量。



#### `self`

```python
class MyClass:
    def __init__(self):
        print('self in init = {}'.format(id(self)))
        
c = MyClass()   # 会调用__init__
print('c = {}'.format(id(c)))

# 打印结果为
self in init = 139837178141328
c = 139837178141328
```

上例说明，`self`就是调用者，就是`c`对应的实例对象。

`self`这个名字只是一个惯例，它可以修改，但是请不要修改，否则影响代码的可读性

看打印的结果，思考一下执行的顺序，为什么？



### 实例变量和类变量

```python
class Person:
    age = 3
    def __init__(self, name):
        self.name = name
        
# tom = Person('Tom', 20)
tom = Person('Tom')   # 实例化、初始化
jerry = Person('Jerry')

print(tom.name, tom.age)
print(jerry.name, jerry.age)
print(Person.age)
# print(Person.name)
Person.age = 30
print(Person.age, tom.age, jerry.age)

# 运行结果
Tom 3
Jerry 3
3
30 30 30
```

实例变量是每一个实例自己的变量，是自己独有的；类变量是类的变量，是类的所有实例共享的属性和方法

| 特殊属性       | 含义             |
| -------------- | ---------------- |
| `__name__`     | 对象名           |
| `__class__`    | 对象的类型       |
| `__dict__`     | 对象的属性的字典 |
| `__qualname__` | 类的限定名       |

注意：

Python中每一种对象都拥有不同的属性。函数、类都是对象，类的实例也是对象。

举例

```python
class Person:
    age = 3
    
    def __init__(self, name):
        self.name = name
        
print('---------class------------')
print(Person.__class__)
print(sorted(Person.__dict__.items()), end='\n\n')   # 属性字典

tom = Person('Tom')
print('----------instance tom-----------')
print(tom.__class__)
print(sorted(tom.__dict__.items()), end='\n\n')

print("-------------tom's class--------------")
print(tom.__class__.__name__)
print(sorted(tom.__class__.__dict__.items()), end='\n\n')
输出：
---------class-------------
<class 'type'>
[('__dict__', <attribute '__dict__' of 'Person' objects>), ('__doc__', None), ('__init__', <function Person.__init__ at 0x7f8b8f126550>), ('__module__', '__main__'), ('__weakref__', <attribute '__weakref__' of 'Person' objects>), ('age', 3)]

----------instance tom------------------
<class '__main__.Person'>
[('name', 'Tom')]

--------------------tom's class----------------------
Person
[('__dict__', <attribute '__dict__' of 'Person' objects>), ('__doc__', None), ('__init__', <function Person.__init__ at 0x7f8b8f126550>), ('__module__', '__main__'), ('__weakref__', <attribute '__weakref__' of 'Person' objects>), ('age', 3)]

```

上例中，可以看到类属性保存在类的`__dict__`中，实例属性保存在实例的`__dict__`中，如果从实例访问类的属性，就需要借助`__class__`找到所属的类

有了上面知识，再看下面的代码

```python
class Person:
    age = 3
    height = 170
    
    def __init__(self, name, age=18):
        self.name = name
        self.age = age
        
tom = Person('Tom')   # 实例化、初始化
jerry = Person('Jerry', 20)

Person.age = 30
print(Person.age, tom.age, jerry.age)   # 输出什么结果

print(Person.height, tom.height, jerry.height)   # 输出什么结果
jerry.height = 175
print(Person.height, tom.height, jerry.height)   # 输出什么结果

tom.height += 10
print(Person.height, tom.height, jerry.height)   # 输出什么结果

Person.height += 15
print(Person.height, tom.height, jerry.height)   # 输出什么结果

Person.weight += 70
print(Person.weight, tom.weight, jerry.weight)   # 输出什么结果

print(tom.__dict__['height'])
print(tom.__dict__['weight'])   # 可以吗
输出：
30 18 20
170 170 170
170 170 175
170 180 175
185 180 175
Traceback (most recent call last):
  File "/home/shouyu/PycharmProjects/test/面向对象.py", line 91, in <module>
    Person.weight += 70
AttributeError: type object 'Person' has no attribute 'weight
```

总结

是类的，也是这个类所有实例的，其实例都可以访问到；是实例的，就是这个实例自己的，通过类访问不到。

类变量是属于类的变量，这个类的所有实例可以共享这个变量。

实例可以动态的给自己增加一个属性。`实例.__dict__[变量名]`和`实例.变量名`都可以访问到。

实例的同名变量会隐藏这个类变量，或者说是覆盖了这个类变量。这就像上例中用`jerry.height = 175`，这样就用jerry的`height`覆盖了类中的`height`的值



实例属性的查找顺序

指的是实例使用`.`来访问属性，会先找自己的`__dict__`，如果没有，然后通过属性`__class__`找到自己的类，再去类的`__dict__`中找

注意，如果实例使用`__dict_[变量名]`访问变量，将不会按照上面的查找顺序找变量了，这是指明使用字典的key查找，不是属性查找。

一般来说，类变量使用全大写来命名



### 装饰一个类

回顾，什么是高阶函数？什么是装饰器函数？

思考，如何装饰一个类？

需求，为一个类通过装饰，增加一些类属性

```python
# 增加类变量
def add_name(name, cls):
    cls.NAME = name   # 动态增加类属性
    
# 改进成装饰器
def add_name(name):
    def wrapper(cls):
        cls.NAME = name
        return cls
    return wrapper

@add_name('Tom')
class Person:
    AGE = 3
    
print(Person.NAME)
输出：
Tom
```

之所以能够装饰，本质上是为类对象动态的添加了一个属性，而Person这个标识符指向这个类对象。



### 类方法和静态方法

前面的例子中定义的`__init__`等方法，这些方法本身都是类的属性，第一个参数必须是`self`，而`self`必须指向一个对象，也就是类必须实例化之后，由实例来调用这个方法。



#### 普通函数

```python
class Person:
    def normal_method():   # 可以吗？
        print('normal')
        
# 如何调用
Person.normal_method()   # 可以吗？
Person().normal_method()   # 可以吗？这里传报错的原因是，在定义的类中并没有self，Person()表示实例化，所以实例并没有normal_method方法，所以报错

print(Person.__dict__)
输出：
normal
Traceback (most recent call last):
  File "/home/shouyu/PycharmProjects/test/面向对象.py", line 117, in <module>
    Person().normal_method()
TypeError: normal_method() takes 0 positional arguments but 1 was given
```

`Person.normal_method()`

可以，因为这个方法只是被Person这个名词空间管理的一个普通的方法，`normal_method`只是`Person`的一个属性而已。

由于`normal_method`在定义的时候没有指定`self`，所以不能完成实例对象的绑定，不能用`Person().normal_method()`调用。

注意：虽然语法是对的，但是，没有人这么用，也就是说禁止这么写



#### 类方法

```python
class Person:
    @classmethod
    def class_method(cls):   # cls是什么
        print('class = {0.__name__}({0})'.format(cls))
# cls就是类对象，类对象就是0，所以可以调用0.__name__。({0})中，括号是字符串，也就是打印一个括号，{0}是占位符，占位符显示类对象打印出来的一长串东西
        cls.HEIGHT = 170
        
Person.class_method()
print(Person.__dict__)
输出：
class = Person(<class '__main__.Person'>)
{'__module__': '__main__', 'class_method': <classmethod object at 0x7fc4283d1a90>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None, 'HEIGHT': 170}
```

类方法

1. 在类定义中，使用`@classmethod`装饰器修饰的方法

2. 必须至少有一个参数，且第一个参数留给了`cls`，`cls`指代调用者即类对象自身

3. `cls`这个标识符可以是任意合法名称，但是为了易读，请不要修改

4. 通过`cls`可以直接操作类的属性

   注意：无法通过`cls`操作类的实例。为什么？

类方法，类似于C++、Java中的静态方法



#### 静态方法

```python
class Person:
    @classmethod
    def class_method(cls):   # cls是什么
        print('class = {0.__name__}({0})'.format(cls))
        cls.HEIGHT = 170
        
    @staticmethod
    def static_methd():
        print(Person.HEIGHT)
        
Person.class_method()
Person.static_methd()
print(Person.__dict__)
输出：
class = Person(<class '__main__.Person'>)
170
{'__module__': '__main__', 'class_method': <classmethod object at 0x7f4247ddda90>, 'static_methd': <staticmethod object at 0x7f4247df75b0>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None, 'HEIGHT': 170}
```

静态方法

1. 在类定义中，使用@staticmethod装饰器修饰的方法

2. 调用时，不会隐式的传入参数

   静态方法，只是表明这个方法属于这个名词空间。函数归在一起，方便组织管理。



#### 方法调用

类可以定义这么多种方法，究竟如何调用它们？

```python
class Person:
    def normal_method():
        print('normal')
        
    def method(self):
        print("{}'s method".format(self))
        
    @classmethod
    def class_method(cls):   # cls是什么
        print('class = {0.__name__}({0})'.format(cls))
        cls.HEIGHT = 170
        
    @staticmethod
    def static_methd():
        print(Person.HEIGHT)
        
print('~~~~~~类访问')
print(1, Person.normal_method())   # 可以吗
# print(2, Person.method())   # 可以吗。这里不可以，因为这是实例的方法
print(3, Person.class_method())   # 可以吗
print(4, Person.static_methd)   # 可以吗
print(Person.__dict__)
print('~~~~~~实例访问')
print('tom-----')
tom = Person()
# print(1, tom.normal_method())   # 可以吗。这里不可以，因为normal_method不是实例的方法
print(2, tom.method())   # 可以吗
print(3, tom.class_method())   # 可以吗
print(4, tom.static_methd())   # 可以吗
print('jerry-----')
jerry = Person()
# print(1, jerry.normal_method())   # 可以吗。这里不可以，因为normal_method不是实例的方法
print(2, jerry.method())   # 可以吗
print(3, jerry.class_method())   # 可以吗
print(4, jerry.static_methd())   #  可以吗
输出：
~~~~~~~~~~类访问
normal
1 None
class = Person(<class '__main__.Person'>)
3 None
170
4 None
{'__module__': '__main__', 'normal_method': <function Person.normal_method at 0x7fe2e6af1550>, 'method': <function Person.method at 0x7fe2e6af15e0>, 'class_method': <classmethod object at 0x7fe2e6b54a90>, 'static_method': <staticmethod object at 0x7fe2e6b795b0>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None, 'HEIGHT': 170}
~~~~~~~~~~实例访问
tom------------
<__main__.Person object at 0x7fe2e6b6e8b0>'s method
2 None
class = Person(<class '__main__.Person'>)
3 None
170
4 None
jerry-----------
<__main__.Person object at 0x7fe2e6bb7580>'s method
2 None
class = Person(<class '__main__.Person'>)
3 None
170
4 None
# 这是先执行类方法中的print函数，再执行调用的print函数，所以会先输出170再输出4 None
```

类几乎可以调用所有内部定义的方法，但是调用`普通的方法`时会报错，原因是第一参数必须是类的实例。

实例也几乎可以调用所有的方法，`普通的函数`的调用一般不可能出现，因为不允许这么定义。

总结：

类除了普通方法都可以调用，普通方法需要对象的实例作为第一参数。

实例可以调用所有类中定义的方法（包括类方法、静态方法），普通方法传入实例自身，静态方法和类方法需要找到实例的类。



### 访问控制

#### 私有（Private）属性

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.age = age
        
    def growup(self, i=1):
        if i > 0 and i < 150:   # 控制逻辑
            self.age += i
            
p1 = Person('tom')
p1.growup(20)   # 正常的范围
print(p1.age)
p1.age = 160   # 超过了范围，并绕过了控制逻辑
print(p1.age)
输出：
38
160
```

上例，本来是想通过方法控制属性，但是由于属性在外部可以访问，或者说可见，就可以直接绕过方法，直接修改这个属性。

Python提供了私有属性可以解决这个问题



私有属性

使用双下划线开头的属性名，就是私有属性

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def growup(self, i=1):
        if i > 0 and i < 150:   # 控制逻辑
            self.__age += i
            
p1 = Person('tom')
p1.growup(20)   # 正常的范围
print(p1.__age)   # 可以吗。不可以，会报错
```

通过实验可以看出，外部已经访问不到`__age`了，`age`根本就没有定义，更是访问不到。那么，如何访问这个私有变量`__age`呢？

使用方法来访问

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def growup(self, i=1):
        if i > 0 and i < 150:   # 控制逻辑
            self.__age += i
            
    def getage(self):
        return self.__age
    
print(Person('tom').getage())
输出：
18
```



#### 私有变量的本质

外部访问不到，能够动态增加一个`__age`呢？

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def growup(self, i=1):
        if i > 0 and i < 150:   # 控制逻辑
            self.__age += i
            
    def getage(self):
        return self.__age
    
p1 = Person('tom')
p1.growup(20)   # 正常的范围
# print(p1.__age)   # 访问不到
p1.__age = 28
print(p1.__age)
print(p1.getage())
# 为什么年龄不一样？__age没有覆盖吗？
print(p1.__dict__)
输出：
28
38
{'name': 'Tom', '_Person__age': 38, '__age': 28}
```

秘密都在`__dict__`中，里面是`{'__age':28,'_Person_age':38,'name':'tom'}`

私有变量的本质：

类定义的时候，如果声明一个实例变量的时候，使用双下划线，Python解释器会将其改名，转换名称为`_类名_变量名`的名称，所以用原来的名字访问不到了。

知道了这个名字，能否直接修改呢？

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def growup(self, i=1):
        if i > 0 and i < 150:
            self.__age += i
            
    def getage(self):
        return self.__age
    
p1 = Person('tom')
p1.growup(20)   # 正常的范围
# print(p1.__age)
p1.__age = 28
print(p1.__age)
print(p1.getage())
# 为什么年龄不一样？__age没覆盖吗？
print(p1.__dict__)

# 直接修改私有变量
p1._Person__age = 15
print(p1.getage())
print(p1.__dict__)
输出：
15
{'name': 'Tom', '_Person__age': 15, '__age': 28}
```

从上例可以看出，知道了私有变量的新名称，就可以直接从外部访问到，并可以修改它。



#### 保护变量

在变量名前使用一个下划线，称为保护变量

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self._age = age
        
tom = Person('Tom')
print(tom._age)
print(tom.__dict__)
输出：
18
{'name': 'Tom', '_age': 18}
```

可以看出，这个`_age`属性根本就没有改变名称，和普通的属性一样，解释器不做任何特殊处理。这只是开发者共同的约定，看见这种变量，就如同私有变量，不要直接使用。



#### 私有方法

参照保护变量、私有变量，使用单下划线、双下划线命名方法。

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self._age = age
        
    def _getname(self):
        return self.name
    
    def __getage(self):
        return self._age
    
tom = Person('Tom')
print(tom._getname())   # _getname没改名
print(tom.__getage())   # 无此属性
print(tom.__dict__)
print(tom.__class__.__dict__)
print(tom._Person__getage())   # __getage改名了
输出：
Tom
{'name': 'Tom', '_age': 18}
{'__module__': '__main__', '__init__': <function Person.__init__ at 0x7fa7d0a34550>, '_getname': <function Person._getname at 0x7fa7d0a345e0>, '_Person__getage': <function Person.__getage at 0x7fa7d0a34670>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None}
18
```



#### 私有方法的本质

单下划线的方法只是开发者之间的约定，解释器不做任何改变。

双下划线的方法，是私有方法，解释器会改名，改名策略和私有变量相同，`_类名__方法名`。方法变量都在类的`__dict__`中可以找到。



#### 私有成员的总结

在Python中使用`_`单下划线或者`__`双下划线来标识一个成员被保护或者被私有化隐藏起来。但是，不管使用什么样的访问控制，都不能真正的阻止用户修改类的成员。Python中没有绝对的安全的保护成员或者私有成员。

因此，前导的下划线只是一种警告或者提醒，请遵守这个约定。除非真有必要，不要修改或者使用保护成员或者私有成员，更不要修改它们。



### 补丁

可以通过修改或者替换类的成员。使用者调用的方式没有改变，但是，类提供的功能可能已经改变了。

猴子补丁（Monkey Patch）：

在运行时，对属性、方法、函数等进行动态替换。

其目的往往是为了通过替换、修改来增强、扩展原有代码的能力。

黑魔法，慎用。

```python
# test1.py
from test2 import Person
from test3 import get_score

def monkeypatch4Person():
    Person.get_score = get_score
# 用test3.py中的get_score替换test2.py中的同名方法    
monkeypatch4Person()   # 打补丁

if __name__ == "__main__":
    print(Person().get_score())
  
输出：
{'name': 'Person', 'English': 88, 'Chinese': 90, 'History': 85}
    
# test2.py
class Person:
    def get_score(self):
        # connect to mysql
        ret = {'English':78, 'Chinese':86, 'History':82}
        return ret
    
# test3.py
def get_score(self):
    return dict(name=self.__class__.__name__,English=88, Chinese=90, History=85)
```

上例中，假设`Person`类`get_score`方法是从数据库拿数据，但是测试的时候，不方便。

使用猴子补丁，替换了`get_score`方法，返回模拟的数据。



### 属性装饰器

一般好的设计是：把实例的属性保护起来，不让外部直接访问，外部使用`getter`读取属性和`setter`方法设置属性。

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def age(self):
        return self.__age
    
    def set_age(self, age):
        self.__age = age  # 通过设置与初始化同名的属性覆盖初始化的属性
        
tom = Person('Tom')
print(tom.age())
tom.set_age(20)
print(tom.age()) 
输出：
18
20
```

通过`age`和`set_age`方法操作属性。

有没有简单的方式呢？

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    @property
    def age(self):
        return self.__age
    
    @age.setter
    def age(self, age):
        self.__age = age
        
    @age.deleter
    def age(self):
        # del self.__age
        print('del')
        
tom = Person('Tom')
print(tom.age)
tom.age = 20
print(tom.age)
del tom.age   # 使用del调用上面定义的@age.deleter下的方法
输出：
18
20
del
```

特别注意：使用`property`装饰器的时候这三个方法同名

`property`装饰器

后面跟的函数名就是以后的属性名，属性名指的就是方法名称。它就是`getter`。这个必须有，有了它至少是只读属性

`setter`装饰器

与属性名同名，且接收2个参数，第一个是`self`，第二个是将要赋值的值。有了它，属性可写

`deleter`装饰器

可以控制是否删除属性。很少用。

`property`装饰器必须在前，`setter`、`deleter`装饰器在后。

`property`装饰器能通过简单的方式，把对方法的操作变成对属性的访问，并起到了一定隐藏效果

其它的写法

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def getage(self):
        return self.__age
    
    def setage(self, age):
        self.__age = age
        
    def delage(self):
        # del self.__age
        print('del')
        
    age = property(getage, setage, delage, 'age property')
    
tom = Person('Tom')
print(tom.age)
tom.age = 20
print(tom.age)
del tom.age
输出：
18
20
del
```

还可以如下

```python
class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    age = property(lambda self:self.__age)
    
tom = Person('Tom')
print(tom.age)
```



### 对象的销毁

类中可以定义`__del__`方法，称为析构函数（方法）。

作用：销毁类的实例的时候调用，以释放占用的资源。其中就放些清理资源的代码，比如释放连接。

注意这个方法不能引起对象的真正销毁，只是对象销毁的时候会自动调用它。

使用`del`语句删除实例，引用计数减1。当引用计数为0时，会自动调用`__del__`方法。

由于Python实现了垃圾回收机制，不能确定对象何时执行垃圾回收。

```python
import time

class Person:
    def __init__(self, name, age=18):
        self.name = name
        self.__age = age
        
    def __del__(self):
        print('delete {}'.format(self.name))
        
def test():
    tom = Person('tom')
    tom.__del__()
    tom.__del__()
    tom.__del__()
    tom.__del__()
    print('=========start=========')
    tom2 = tom
    tom3 = tom2
    print(1, 'del')
    del tom
    time.sleep(3)
    
    print(2, 'del')
    del tom2
    time.sleep(3)
    print('~~~~~~~~~~~~~~~~~~')
    
    del tom3   # 注释一下看看效果
    time.sleep(3)
    print('================end')
    
test()
```

由于垃圾回收对象销毁时，才会真正清理对象，还会在之前自动调用`__del__`方法，除非你明确知道自己的目的，建议不要手动调用这个方法。



### 方法重载（overload）

在其他面向对象的高级语言中，都有重载的概念。

所谓重载，就是同一个方法名，但是参数数量、类型不一样，就是同一个方法的重载。

Python没有重载！

Python不需要重载！

Python中，方法（函数）定义中，形参非常灵活，不需要指定类型（就算指定了也只是一个说明而非约束），参数个数也不固定（可变参数）。一个函数的定义可以实现很多种不同形式实参的调用。所以Python不需要方法重载。

或者说Python本身就实现了其它语言的重载。



### 封装

面向对象的三要素之一，封装Encapsulation

封装

将数据和操作组织到类中，即属性和方法

将数据隐藏起来，给使用者提供操作（方法）。使用者通过操作就可以获取或者修改数据。

`getter`和`setter`。

通过访问控制，暴露适当的数据和操作给用户，该隐藏的隐藏起来，例如保护成员或私有成员。



### 练习

1. 随机整数生成类

可以指定一批生成的个数，可以指定数值的范围，可以调整每批生成数字的个数

```python
# 常规实现如下
import random

# 1 普通类实现
class RandomGen:
    """
    1. 解决随机数边界问题
    2. 随机数生成
    """
    def __init__(self, start=1, stop=100, count=10):
        self.start = start
        self.stop = stop
        self.count = count
        
    def generate(self, start=1, stop=100, count=10):
    	return [random.randint(start, stop) for x in range(count)]
    
# 2 作为工具类来实现，提供类方法
class RandomGen: 
    @classmethod
    def generate(cls, start=1, stop=100, count=10):
        return [random.randint(start, stop) for x in range(count)]
# 传参有两种方式，一种是初始化的时候，另一种是随机生成函数的时候。这种类方法就是随机生成时传参，因为用不着初始化了，所以去掉了__init__，因为用不着保留参数，所以用不着对象的了，就可以直接使用类方法。上面的类因为需要初始化，所以参数会被记在实例属性中。如果写成静态方法，还可以取消cls。
```

随机整数生成类，可以指定一批生成的个数，可以指定数值的范围，可以调整每批生成数字的个数。

使用生成器实现，如下：

```python
# 笔记
import random

class RandomGenerator:
    def __init__(self, count=10, start=1, stop=100):
        self.count = count
        self.start = start
        self.stop = stop
        
    def generate(self):
        for _ in range(self.count):
            yield random.randint(self.start, self.stop)
            
rg = RandomGenerator()
gen = rg.generate()   # 因为rg.generate()是生成器，所以要给一个变量
print(next(gen))   # 这样只能打印一个随机数
====================================================================================
import random

class RandomGenerator:
    def __init__(self, count=10, start=1, stop=100):
        self.count = count
        self.start = start
        self.stop = stop
        self._gen = self._generate()

    def _generate(self):
        while True:
            yield random.randint(self.start, self.stop)

    def generate(self):
        return [next(self._gen) for _ in range(self.count)]

rg = RandomGenerator(20,1,1000)
print(rg.generate())
====================================================================================
import random

class RandomGenerator:
    def __init__(self, count=10, start=1, stop=100):
        self.count = count
        self.start = start
        self.stop = stop
        self._gen = self._generate()

    def _generate(self):
        while True:
            yield [random.randint(self.start, self.stop) for _ in range(self.count)]
# 这一行会一次性生成一批数据，数据的数量根据self.count的数量决定的，self.count是通过下面的generate中的count传入的。实际就是看实例的dict中保存的count是什么，如果generate中没有定义count，那么实例的dict中保存的就是初始化的count，如果generate中定义了count，就会覆盖初始化的count。
    def generate(self,count):
        self.count = count   # 因为要向_generate方法中传入count的数据，使用这个count控制打印的个数。如果这里不写count参数，那么就要由初始化处决定count的数量。初始化的地方如果设置了count的值，也可以控制打印的数量，只是不太合逻辑。这里这样写是在改变实例的属性，所以当上面的生成器再执行到self.count时，就会被改变了
        return next(self._gen)  # 这一步的next()是找生成器对象要数据，生成器对象self._gen会去找生成器_generate()，这时就会把这里的self.count传入到生成器中

rg = RandomGenerator()
print(rg.generate(5))
====================================================================================

# 使用生成器实现 1
import random

class RandomGenerator:
    def __init__(self, start=1, stop=100, patch=10):
        self.start = start
        self.stop = stop
        self.patch = patch
        self._gen = self._generate()  # 在这里定义是因为这个生成器对象只需要创建一次。_generate()在创建的时候如果不存在，会到类上找这个方法。而且这句放在最后是最安全的，因为要先把参数都赋值才能执行_generate方法，按顺序执行，最后把这句放在最后。在生成实例时，调用_generate方法时会返回一个生成器对象，并把结果给self._gen，只是还没有用。之后用generate()方法就可以操作这个生成器对象了
        
    def _generate(self):
        while True:
            yield random.randint(self.start, self.stop)
            
    def generate(self, count=0):
        if count <= 0:
            return [next(self._gen) for _ in range(self.patch)]
        else:
            return [next(self._gen) for _ in range(count)]
        
a = RandomGenerator()
print(a.generate())
print(a.generate(5))

# 生成器另一种实现
import random

class RandomGenerator:
    def __init__(self, start=1, stop=100, patch=10):
        self.start = start
        self.stop = stop
        self.patch = patch
        self._gen = self._generate()
        
    def _generate(self):
        while True:
            yield [random.randint(self.start, self.stop) for _ in range(self.patch)]
            
    def generate(self, count=0):
        if count > 0:
            self.patch = count
        return next(self._gen)
    
a = RandomGenerator()
print(a.generate())
print(a.generate(5))

# 使用property
import random

class RandomGenerator:
    def __init__(self, start=1, stop=100, patch=10):
        self.start = start
        self.stop = stop
        self.patch = patch
        self._gen = self._generate()
        
    def _generate(self):
        while True:
            yield [random.randint(self.start, self.stop) for _ in range(self.patch)]
            
    def generate(self):
        return next(self._gen)
    
    @property
    def patch(self):  # 这里定义的方法名称与初始化的名称一样，是为了覆盖初始化的数据。因为这里的调用就是self.patch，和初始化中的一样。方法的返回值self._patch才是实例dict中保存的内容，实例dict中不会保存patch。这里就是利用相同的调用方法，用return的属性覆盖了原来的属性，_patch是自定义的，可以是任何值。也可以写成def abc(self): return self.patch，这样也可以改变初始化的patch值，也就是return的属性与初始化的属性是一样的也可以。
        return self._patch
    # 返回值中必须用_patch，或者说不能和这个方法本身的名字重复，不然就会变成递归调用，无法执行。
    
    @patch.setter
    def patch(self, value):
        self._patch = value
      
    # 按照课上讲授的方法，还是应该写成下面这样。方法名称是自定义的，而返回的属性是上面定义过的，修改的也是上面定义过的属性
    @property
    def _patch(self):
        return self.patch

    @_patch.setter
    def _patch(self, value):
        self.patch = value
        
a = RandomGenerator()
print(a.generate())
a.patch = 5
print(a.generate())
```



2. 打印坐标

使用上题中的类，随机生成20个数字，两两配对形成二维坐标系的坐标，把这些坐标组织起来，并打印输出

```python
# 笔记
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    def __str__(self):
        return '{}:{}'.format(self.x, self.y)
# 在使用强制类型转换时就会用到__str__()，如果想打印，python内部机制是用__repr__
        
    def __repr__(self):  # __repr__是将数据表现成什么样子，不然下面的print方法打印的是地址，而不是数据
        retrun '{}:{}'.format(self.x, self.y)
# 因为下面是将列表解析式给了lst1，然后在打印时print会迭代列表中的内容打印出来，但Point是自定义的类，print不知道怎么打印，所以会打印地址。所以要用这个__repr__方法说明打印的格式

lst1 = [Point(x,y) for x,y in zip(rg.generate(10), rg.generate(10))]
print(lst1)
# points = [Point(*v) for v in zip(RandomGenerator(10).generate(),RandomGenerator(10).generate())] 这样也可以
for p in lst1:  #也可以这样打印，因为lst1是Point的对象，所以有两个值
    print(p.x, p.y)  # 如果没有使用__str__或__repr__时，可以使用这种方法打印
====================================================================================
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
points = [Point(x,y) for x,y in zip(RandomGenerator(10).generate(),RandomGenerator(10).generate())]


for p in points:
    print('{}:{}'.format(p.x, p.y))
```



3. 车辆信息

记录车的品牌mark、颜色color、价格price、速度speed等特征，并实现增加车辆信息、显示全部车辆信息的功能

```python
# 笔记
class Car:
    def __init__(self, mark, speed, color, price):
        self.mark = mark
        self.speed = speed
        self.color = color
        self.price = price
    # 如果要修改车辆信息，最后在Car中定义方法，因为数据在哪方法就在哪    
class CarInfo:
   # lst = []   # 把信息的组合放在列表中
    def __init__(self):
        self.lst = []   # 因为是实例的，所以要加self。在实例化后才有这个列表
    
    def addcar(self, car:Car):
        self.lst.append(car)  # 把car的属性信息放到列表中
        
    def getall(self):
# 数据在哪方法就在哪，因为方法是用来操作数据的。所以这里要遍历信息，要把放法加在信息上。
		return self.lst  # 打印格式用format

ci = CarInfo()
car = Car('audi', 400, 'red', 100)   # 颜色最好定义成数字，不然输入会混乱
ci.addcar(car)
ci.getall()
====================================================================================
class Car:   # 记录单一车辆
    def __init__(self, mark, speed, color, price):
        self.mark = mark
        self.speed = speed
        self.color = color
        self.price = price
        
class CarInfo:
    def __init__(self):
        self.info = []
        
    def addcar(self, car:Car):
        self.info.append(car)
        
    def getall(self):
        return self.info
    
ci = CarInfo()
car = Car('audi', 400, 'red', 100)
ci.addcar(car)

ci.getall()   # 返回所有数据，此时再实现格式打印
```



4. 实现温度的处理

![](/images/python面向对象/实现温度处理.png)

思路

假定一般情况下，使用摄氏度为单位，传入温度值。

如果不给定摄氏度，一定会把温度值转换到摄氏度。

温度转换方法可以使用实例的方法，也可以使用类方法，使用类方法的原因是，为了不创建对象，就可以直接进行温度转换计算，这个类设计像个温度工具类。

```python
# 笔记
class Temperature:
    def __init__(self, t, unit='c'):
        self._c = None
        self._f = None
        self._k = None
        
        if unit == 'k':
            pass
        elif unit == 'f':
            pass
        else:
            self._c = t
            
    @property
    def c(self):    # 摄氏度
        return self._c
    
    @property
    def k(self):   # 开氏温度
        pass
    
    @property
    def f(self):   # 华氏温度
        pass
    
    # 温度转换
    @classmethod
    def c2f(cls, c):
        return 9*c/5 + 32
    
    @classmethod
    def f2c(cls, f):
        return 5*(f-32)/9
    
    @classmethod
    def c2k(cls, c):
        return c + 273.15
    
    @classmethod
    def k2c(cls, k):
        return k - 273.15
    
    @classmethod
    def f2k(cls, f):
        return cls.c2k(cls.f2c(f))
    
    @classmethod
    def k2f(cls, k):
        return cls.c2f(cls.k2c(k))
```

进一步完善未完成代码，如下

```python
class Temperature:
    def __init__(self, t, unit='c'):
        self._c = None
        self._f = None
        self._k = None
   
        if unit == 'k':
            self._k = t
            self._c = self.k2c(t)
        elif unit == 'f':
            self._f = t
            self._c = self.f2c(t)
        else:
            self._c = t
 #     开始只有报错温度，其他两个是空的           
    @property      # 因为只为了转换，所以只提供只读属性，不提供写的
    def c(self):    # 摄氏度
        return self._c
    
    @property
    def k(self):   # 开氏温度。这里要开氏温度，初始化一定能保证摄氏温度是有的，所以这里把摄氏温度转成开氏温度就可以了。开氏温度计算好了就不用再计算了
        if self._k is None:
            self._k = self.c2k(self._c)
        return self._k
    
    @property
    def f(self):   # 华氏温度，这里一样要计算华氏温度，这是为了节约计算资源
        if self._f is None:
            self._f = self.c2f(self._c)
        return self._f
    
    # 温度转换
    @classmethod
    def c2f(cls, c):
        return 9*c/5 + 32
    
    @classmethod
    def f2c(cls, f):
        return 5*(f-32)/9
    
    @classmethod
    def c2k(cls, c):
        return c + 273.15
    
    @classmethod
    def k2c(cls, k):
        return k - 273.15
    
    @classmethod
    def f2k(cls, f):
        return cls.c2k(cls.f2c(f))
    
    @classmethod
    def k2f(cls, k):
        return cls.c2f(cls.k2c(k))
    
print(Temperature.c2f(40))
print(Temperature.c2k(40))
print(Temperature.f2c(104.0))
print(Temperature.k2c(313.15))
print(Temperature.k2f(313.15))
print(Temperature.f2k(104))
# 上面这些print都是工具，下面两个是当属性装饰器来用，设计应该是这样的。
t = Temperature(37)
print(t.c, t.k, t.f)

t = Temperature(300, 'k')
print(t.c, t.k, t.f)
```



5. 模拟购物车购物

思路

购物车购物，分解得到两个对象`购物车`、`物品`，一个操作`购买`。

购买不是购物车的行为，其实是人的行为，但是对于购物车来说就是`增加add`。

商品有很多种类，商品的属性多种多样，怎么解决？

购物车可以加入很多不同的商品，如何实现？

```python
# 拿到需求先区分出对象有哪些，这是一个抽象类的过程。之后分析类之间是如何作用的，每个类自身有什么特点。如果是工具，就可以写成类方法或静态方法，与实例无关。如果要为用户保存一些数据进来，并且实例可能发生变化，这时就要做成实例属性
class Color:
    RED = 0   # 计算机喜欢用数字，所以这里这样定义，用衣使用时就用x.RED就可以了
    BLUE = 1
    GREEN = 2
    GOLDEN = 3
    BLACK = 4
    OTHER =1000
 
class Item:  # Item在电商中指商品
    def __init__(self, **kwargs):   # 商品名和价格应该给位置参数，这两个是必须的，所以要写成位置参数
        self.__spec = kwargs
# 实例属性不确定，不知道传入的dict中是否有其他的，所以定义一个__spec把传进来的属性保存起来。实例中一些配置信息就和商品信息混起来了，所以这时就提出一个_spec变量
    def __repr__(self):
        return str(sorted(self.__spec.items()))
    
class Cart:
    def __init__(self):   # 容器最好也实例化
        self.items = []
# 购物车就是一个容器，如何把容器弄的像一个字典一样，一个办法是从字典继承。另一个是如何把items暴露出去给别人用
    def additem(self, item:Item):  # 这里加商品
        self.items.append(item)
        
    def getallitems(self):
        return self.items
    
mycart = Cart()
myphone = Item(mark='Huawei', color=Color.GOLDEN, memory='4G')
mycart.additem(myphone)

mycar = Item(mark='Red Flag', color=Color.BLACK, year=2017)
mycart.additem(mycar)

print(mycart.getallitems())
```

注意，以上代码只是一个非常简单的一个实现，生产环境实现购物车的增删改查，要考虑很多。



### 笔记

一切皆对象，如果都是对象，拿到的都是内存地址，都是引用，创建多个abc，内存中只会有一个abc，其他都是引用。创建列表时都会再次创建新列表，不要把列表放在函数中，函数多次调用会创建多个列表，如果只想要一份的话，就把列表放到函数外面

抽象是数据与动作的集合，对计算机来说数据称为属性，动作称为方法，有些地方把方法也叫函数。对象是抽象出来为实体服务的，如果拿出来对应就只能对应群体中的一个个体，这个个体就具有你所说的属性和方法，但属性可能是空白，因为虽然具体化了，但还没有把数据传给它。属性就是状态，状态就是数据，它是对象状态的抽象，因为属性最后放在类里面，而类是个抽象概念，所以属性也是个抽象概念。保存属性用数据结构。操作是个动作，这就是方法，实际上就是函数

写类时先想清楚有几个对象，然后把最核心的动作和数据抽象出来就行了。类定义完成后，这个类对象就产生了，类本身也是对象，这里区分一下类对象和类的对象，类对象指这是一个类，这个类本身也是个对象；类的对象指的是类的实例，实体。

```python
class MyClass:
    pass

class MyClass:
    """A example class"""   # 文档字符串
    x = 'abc'  # 类属性，不是对象的属性，对象的属性指的是类的实例的属性
    
    def foo(self):  
		return "MyClass foo"

    
print(MyClass.x)
print(MyClass.foo)
print(MyClass.__doc__)

例：
class MyClass:
    """this is a class"""
    x = 123
    
    def foo(self):
        print(id(self))
        return self
	    # print(self.x)  
      
# 类属性foo，也是方法。foo是个标识符，在定义一个函数后，这个函数标识符会对应到一个创建出来的函数
# 对象上，也就是foo这个标识符会对应到一个函数对象上。foo这个标识符属于MyClass类的属性，只是这
# 个属性是个标识符，并对应到了一个函数对象上，这个函数对象在类中叫方法。也就是这个标识符对应到一
# 个方法上去了，并且它也是属性。
# self是参数，下面print(MyClass.foo)中没有调用参数，没有传实参，所以可以打印出来。
# print(MyClass.foo)中要看的是函数对象或叫方法对象，并没有调用它，如果要调用时括号中就不能是
# 类类型，也就是不能是self本身，调用时参数要用类的实例，如果写成print(MyClass.foo())就是错的
# 了，但去掉print(self.x)中的.x，在pycham中可以执行，如果使用print(MyClass.foo(1))，那么
# 1就会被传入到类中，并调用1.x，因为1没有x属性，所以会报错。print(MyClass.foo)就是调用类类型
        
print(MyClass)
print(MyClass.__name__)
print(MyClass.x)   # 通过类的名称找到自己的属性，x是MyClass的属性。.点表示找下面成员的
print(MyClass.foo)   # 这并不是调用foo，而是找MyClass这个类中的标识符foo，这个标识符对应一个方法，这个方法是个函数，这个函数本身是对象，所以对象一定有内存地址，下面显示的就是对象和内存地址。x也是对象，只是它是一个常量123，常量是固定放在一个位置的，只是对高级语言来说，如数字、字符串等，能显示就显示内容，不会显示内存地址。如果要查看常量的内存地址，用id()查看。可以在类中找到foo，说明这个标识是属于类的，这个标识符指向的方法也就属于这个类。定义完的类，本身就是个对象，这就是类对象。类也是个实体，它是类类型的对象，也就是类的类型就是类类型。因为标识符指向了一个方法，这个方法在内存中已经生成了，所以我们可以看到内存地址
print(MyClass.__doc__)  
print(type(MyClass))   # 类的类型是类类型，也就是type类型。MyClass是type的实例
输出：
<class '__main__.MyClass'>   
# __main__表示模块，这个类就是在这个__main__模块中运行的。也就是当前Python环境中运行
MyClass   # 拿出MyClass类中的名字
123
<function MyClass.foo at 0x7f8e81eec550>  # print(MyClass.foo)输出结果
this is a class   # 打印类中的文档
<class 'type'>

x是MyClass的变量，foo也可以是MyClass的变量，类的变量和类的属性指的是一个意思，所以x和foo也是MyClass的属性，变量才能绑定到方法上。实际都是属于类的标识符，如果不属于类，就不能用类来调用它们、访问它们
类里面的方法不能叫function，在Python中叫method

print('下面就是实例的东西了')
a = MyClass()   
# 实例化，初始化。实例化表示从人类变成了人，初始化表示给人数据，如名字等，为对象赋一些基本特征，
# 也就是赋初值的过程。实例化后就可以拿到一个具体的对象或实例了，之后就可以把这个实例赋给一个标识
# 符或变量了，这个变量（在这里就是mycls）对应着内存中的一个地址，那个地址放了实例化后的对象
print(a.foo())
print(a.x)   # 实例也可以拿类属性 
print(a.foo)
print('==============')
print(id(a))
输出：
下面就是实例的东西了
139819469043120
123   # 这是print(self.x)打印出来的
None   # 因为上面的foo函数中没有return，所以这里返回了None
123
<bound method MyClass.foo of <__main__.MyClass object at 0x7fd39a48c5b0>>   
# print(a.foo)输出结果，这里显示的是MyClass，这是MyClass对象地址，MyClass的对象就是a，这个
# 是a的地址。上面print(MyClass.foo)打印的是函数对象地址。这里MyClass.foo的地址并没有打印。
# 这里的bound表示把foo()这个方法绑定给了a这个实例了。原来的标识符定义在类上，现在有个具体的对象
# 出来了，就把这个方法绑定给这个对象，这样foo()方法第一个默认的self参数就不用写了，a.foo()就相
# 当于把a当参数传给了MyClass中foo(self)的self
==============
139819469043120
<__main__.MyClass object at 0x7fd6fd155a90>
# 最后两行是foo返回的值，一个是foo方法中print的返回值，一个是return的返回值
***
方法是属于类的属性，但是类的实例是对象，对象可以调用这个方法。常用的方法如下
print(MyClass.x)
a = MyClass()
print(a.foo())
print(a.x)  
***

class MyClass:
    """this is a class"""
    x = 123
    
    def __init__(self):   # 初始化
        # pass   # 默认是空语句，什么都不做。下面就是不使用
        print('init')
        
    def foo(self):
        return "foo = {}".format(self.x)
    
a = MyClass()   
# 实例化，初始化。这是先用new方法构建出一个实例，这个实例是裸着的，这就需要初始化
print(a.foo())
输出：
init
foo = 123
****
__init__(self)方法指的就是构造器或构造方法或初始化方法，初始化的发生时机在类的构建完发生，发生之后就不会再初始化了，也不会再构建了，除非再新建一个对象出来。
****

class Person:
    # pass
    def __init__(self):
        self.name = 'tom'   # self指的就是当前创建的实例本身，这样定义，所有实例的name都将是tom
    
a = Person
b = Person
print(a.name, b.name)
输出：
tom tom
==================================================================
class Person:
    # pass
    x = 'abc'
    def __init__(self, name):
        self.name = name
    
a = Person('tom')
b = Person('jerry')
print(a.name, b.name)
print(a.x, b.x)   # 类是共用的，x是常量，不会变
输出：
tom jerry
abc abc
====================================================================
class Person:
    # pass
    x = 'abc'   # 这是类的属性或叫类属性
    def __init__(self, name):
        self.name = name   
# 这是对象的属性或叫实例属性。以self开头的就是实例的。self的问题就是不判断传入的类型
    
a = Person('tom')
b = Person('tom')
# print(a.name, b.name)
# print(a.x, b.x) 
print(a == b)  # 这是两个不同的对象，这是两个不同的变量
print(a is b)
输出：
False
False
====================================================================
class Person:
    # pass
    x = 'abc'  
    def __init__(self, name, age=18):
        self.name = name
        self.y = age   
# y是实例的属性，实例的属性可以换位置，属性也是变量名，将它对应到age上，调用时用y就可以了，属性
# 与调用时的名称要一样，上面的__init__()的括号中只是函数的定义，这里的self.y中的y才是要调用的
# 变量名。self.y是一个限定，y是self的实例变量
    def show(self, x, y): 
# 这里也可以加参数，这里的x和y与上面定义的x没有关系，也与self.y没有关系，这是传入的参数
# 对于一个方法来讲，它处理的数据可以与这个类本身没有关系，可以与当前实例也没有关系。self.x就叫与
# 当前实例有关系。上面的x和y与当前类和实例都没有关系。因为当前实例没有这个东西，只是对这个东西进
# 行加工处理。这就像method函数，送进去一个值可以返回一个绝对值，这个返回的值与method没有关系，
# 不属于它的类也不属于它的实例，它只是对数据进行了加工处理 
        print(self.name, self.y)  # 这是一种形式上的调用，要用实参来替换
    	self.y = x   # 这就是将初始化中的self.y改成了传入的x的值
        Person.x = x   # 改变Person类的x属性的值
    
a = Person('tom')
b = Person('tom', 20)
print(a.y, b.y)
a.show(100, 'a')
b.show(200, 'b')
print(Person.x)
a.y = 200   # 外部修改类内部的变量
输出：
18 18
tom 18 100 a
tom 20 200 b
100
```

实例叫instance

```python
class Person:
    # pass
    x = 'abc'  
    def __init__(self, name, age=18):
        self.name = name
        self.y = age   
    def show(self, x, y): 
        print(self.name, self.y)  
    	self.y = x   
        Person.x = x  
    
a = Person('tom')
b = Person('jerry', 20)
print(a.__class__, b.__class__)
print(a.__class__.__qualname__, a.__class__.__name__)   
# __qualname__是限定名，限定名是类才会有的东西在类的实例上是调用不到的。类是类类型的实例，也就是
# 说这是类类型的属性。__name__也一样。文件的名称就是模块的名称，如test.py，上面是在__main__模
# 块中运行的，这里省掉了。__qualname__限定名不等于__name__，它们是有差异的
print(isinstance(a, a.__class__))   # 查看a是不是a.__class__类型。b也是这种类型
print(int.__class__)  # int本身也是个类型
print(isinstance(b, int.__class__))
print(Person.__dict__)  # 打印类的属性，类中定义的都是类的属性
print(a.__dict__)  
# 打印对象属性。对象上没有方法，对象方法没必要定义在对象里，因为大家的操作是一样的，所以定义在了类
# 里，只是数据不一样了。函数（方法）只有一份，只是参数不一样了。所以方法属于类属性。这个字典中的
# show是一个function，如果再加一个括号就可以调用了
print(b.__dict__)  # 对于对象来说，自己拥有一个字典，存着自己的数据，这叫个性化
print(a.__dict__['name'])
输出：
<class '__main__.Person'> <class '__main__.Person'>
Person Person  
True
<class 'type'>
False
{'__module__': '__main__', 'x': 'abc', '__init__': <function Person.__init__ at 0x7fdc1d2d3550>, 'show': <function Person.show at 0x7fdc1d2d35e0>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None}
{'name': 'tom', 'y': 18}
{'name': 'jerry', 'y': 20}
tom
================================================================
class Person:
    age = 3
    height = 170
    
    def __init__(self, name, age=18):
        self.name = name
        self.age = age
        
tom = Person('tom')
jerry = Person('jerry', 20)

Person.age = 30   # 这是一种限定，限定在Person类中使用age这个变量
print(Person.age, tom.age, jerry.age)
print(Person.__dict__, tom.__dict__, jerry.__dict__, sep='\n')
print(Person.height, tom.height, jerry.height)
Person.height += 20
print(Person.height, tom.height, jerry.height)
print(Person.__dict__, tom.__dict__, jerry.__dict__, sep='\n')
# 到目前为止tom和jerry中还没有新key
tom.height = 168   # 赋值即定义，在这个实例上定义一个height
print(Person.height, tom.height, jerry.height)
print(Person.__dict__, tom.__dict__, jerry.__dict__, sep='\n')
# 这时tom中添加了一个新key
jerry.height += 30   # 开始jerry没有height，它会到Person中拿这个属性再加上30。这样定义破坏了封装
print(Person.height, tom.height, jerry.height)
# 先查找自己的字典，自己的字典没有就到类字典中找，如果还是没有就报找不到。如果自己有就不找类的了。
# 先找自己再找自己的类
print(Person.__dict__, tom.__dict__, jerry.__dict__, sep='\n')
# jerry现在也有了新key
Person.weight = 70   # 在类上添加一个新属性
print(Person.weight, tom.weight, jerry.weight)

print(Person.__dict__['weight'])  # 这没问题，可以找到
print(tom.__dict__['weight'])  # 这样不行，会报找不到key
pritn(tom.weight)  # 这样没问题，会到类里找

# tom.__class__.__dict__ 等价于 Person.__dict__
输出：
30 18 20
170 170 170
190 190 190
190 168 190
190 168 220
```

装饰一个类，这和类装饰器不同，类装饰器是指一个类就是装饰别人的

```python
# 装饰器有嵌套函数，嵌套函数与高阶函数有关，形参或返回值是函数就是高阶函数
# def setnameproperty(cls, name):
#     cls.NAME = name  
# 装饰器从这个函数得来
    
def setnameproperty(name):
    def wrapper(cls):
        cls.NAME = name   # 这里动态增加了一个类属性并赋值为'MY CLASS'
        return cls  
# 这里要返回cls是因为MyClass = wrapper(cls)，MyClass被当作cls传入到wrapper中，所以要返回，
# 得到 MyClass = cls，如果不返回，就成了MyClass = None。如果像上面定义的
# setnameproperty(cls, name)，就不需要返回了，因为直接就改了
    return wrapper

@setnameproperty('MY CLASS')
class MyClass:  
    pass

print(MyClass.__dict__)
输出：
{'__module__': '__main__', '__dict__': <attribute '__dict__' of 'MyClass' objects>, '__weakref__': <attribute '__weakref__' of 'MyClass' objects>, '__doc__': None, 'NAME': 'MY CLASS'}

# 加入装饰器@setnameproperty('MY CLASS')后，其下面如果是类的话，它会把标识符抽（上例中是
# MyClass）取出来，这个标识符指向了一个对象，不管这个对象是类对象还是函数对象，拿来后就放到这个装
# 饰器函数中，它会先对装饰器函数求值，也就是setnameproperty('MY CLASS')，将'MY CLASS'当作
# name参数传入函数，这会返回wrapper函数，也就是说
# @setnameproperty('MY CLASS')等于@wrapper，这就是语法糖了。这个语法糖会把他下面的函数抽取
# 出来当作参数，这也是唯一参数，这个语法糖只能接受一个参数。@wrapper会把它下面函数的标识符
# MyClass拿到，放到wrapper函数中当作cls传入，再给MyClass添加功能后，再返回去。返回的MyClass
# 类还是原来的类
```

类方法与静态方法

```python
class MyClass:
    """this is a class"""
    x = 123
    
    def __init__(self):   # 初始化
        print('init')
        
    def foo(self):
        return "foo = {}".format(self.x)
    
    def bar():   # 不建议这样使用
        print('bar')
        
a = MyClass()  # 实例化，初始化
print(a.foo())

MyClass.bar()
print(MyClass.__dict__)
a.bar()   # 这会报错
输出：
init
foo = 123
bar
{'__module__': '__main__', '__doc__': 'this is a class', 'x': 123, '__init__': <function MyClass.__init__ at 0x7fc1540c7550>, 'foo': <function MyClass.foo at 0x7fc1540c75e0>, 'bar': <function MyClass.bar at 0x7fc1540c7670>, '__dict__': <attribute '__dict__' of 'MyClass' objects>, '__weakref__': <attribute '__weakref__' of 'MyClass' objects>} 
# 这里bar和foo都是function
=============================================================
class MyClass:
    """this is a class"""
    xxx = 'XXX'

    def foo(self):
        print("foo")
    
    def bar():   # 不建议这样使用
        print('bar')
        
    @classmethod   
# 类方法，当调用这个方法时，会将类的名称当第一个参数给cls。类方法与普通方法的区别，如果用了这个装
# 饰器，它下面的第一个参数就不再是实例本身了，而是实例对应的类本身了。它是属于这个类的。如下面
# def clsmtd(cls, *, a)中的就是cls了，而不是self
    def clsmtd(cls, *, a):   
# cls是自动加上的，这是第一位置参数，不能变。有类就可以调用类方法
        print('{}.xxx={}'.format(cls.__name__, cls.xxx))
# 在这里不能直接调用实例的属性
        
    @staticmethod   
# 静态方法。这和上面的bar()方法差不多，如果要用这种方法，建议使用这种静态方法。
    def staticmtd(x):   # 这样定义可以，不会传第一个位置参数，但还是可以有参数
        print('static')
        MyClass   # 要在静态方法里取类，就用这种方法
        
a = MyClass()  # 实例化，初始化
a.foo()

MyClass.bar()
print(MyClass.__dict__)
MyClass.clsmtd()
a.clsmtd()   
# 因为a实例中没有clsmtd，所以会到类中找。这相当于传入一个a.__class__给cls。这条等价于
# a.__class__.clsmtd()
MyClass.staticmtd()
a.staticmtd()  # 这样是可以调用的，不会传第一个位置参数
MyClass.clsmtd(a=MyClass())  # 一般不会这样做
MyClass().clsmtd()  # MyClass()表示实例化出一个对象，只是没有名字 
输出：
foo
bar
{'__module__': '__main__', '__doc__': 'this is a class', 'xxx': 'XXX', 'foo': <function MyClass.foo at 0x7f10e5f7e550>, 'bar': <function MyClass.bar at 0x7f10e5f7e5e0>, 'clsmtd': <classmethod object at 0x7f10e5fe1a90>, '__dict__': <attribute '__dict__' of 'MyClass' objects>, '__weakref__': <attribute '__weakref__' of 'MyClass' objects>}
MyClass.xxx=XXX
MyClass.xxx=XXX
static
static
```

访问控制

```python
class Person:

    def __init__(self, name, age=18):
        self.name = name
        self.__age = age  # 在前面加两个下划线就把对象属性隐藏了。后面有下划线说明是特殊方法
        # 因为是实例属性，所以只有在实例中才能找到
    def growup(self, incr=1):
        if 0 < incr < 150:
            self.__aget += incr
        
    def getage(self):
        return self.__age  # 内部可以访问隐藏属性
    
tom = Person('tom')
tom.growup(2)
# print(tom.age)  # 因为是隐藏属性，所以这里访问不了__age属性
print(tom.getage())  # 这样就可以访问隐藏属性了
print(Person.__dict__)
print(tom.__dict__)

# 代码不要写成下面这样的方式
tom._Person__age = 200  # 这时类中的检查函数就没用了，还是可以改隐藏属性的值
print(tom.getage())

tom.age = 300   # 这样是新增一个属性，与类中的__age没有关系
print(tom.getage())
print(tom.age)

print(tom.__dict__)
输出：
20
{'__module__': '__main__', '__init__': <function Person.__init__ at 0x7f88d8859550>, 'growup': <function Person.growup at 0x7f88d88595e0>, 'getage': <function Person.getage at 0x7f88d8859670>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None}
{'name': 'tom', '_Person__age': 20}  # 这里可以看到隐藏的属性__age是改了名字
200
```

保护变量

```python
class Person:

    def __init__(self, name, age=18):
        self._name = name
        self.__age = age 
    def __growup(self, incr=1):
        if 0 < incr < 150:
            self.__aget += incr
        
    def getage(self):
        return self.__age  # 内部可以访问隐藏属性
    
tom = Person('tom')
# tom.growup(2)
print(Person.__dict__)  # 查看是否有__growup方法，也变成了_Person__growup
print(tom.getage())  
tom._name = 'jerry'   # 可以改变保护变量的值，还可以打印，不会被改名
print(tom._name)
# print(Person.__dict__)
print(tom.__dict__)
输出：
{'__module__': '__main__', '__init__': <function Person.__init__ at 0x7fbb17fca550>, '_Person__growup': <function Person.__growup at 0x7fbb17fca5e0>, 'getage': <function Person.getage at 0x7fbb17fca670>, '__dict__': <attribute '__dict__' of 'Person' objects>, '__weakref__': <attribute '__weakref__' of 'Person' objects>, '__doc__': None}
18
jerry
{'_name': 'jerry', '_Person__age': 20}
# 保护变量是Python开发者的共同约定，它不属于解释器管理，所以可以改变。但约定是不要改变。方法有自
# 己的作用域，类也有自己的作用域。从外面无法访问里面的东西，所以要加类名或实例名，称为限定名
```

猴子补丁

解释器运行时才会执行动态替换

```python
# 在test2模块中定义
class Person:
    def  __init__(self, chinese, english, history):
        self. chinese = chinese
        self.eng = english
        self.his = history
        
    def getscore(self):   # 取成绩
        return (self.chinese, self.eng, self.his)
    
# stu = Person()
# stu.getscore()

# 换另一个模块test3修改上面的类
def getscrore(self):
    return dict(chi=self.chinese, eng=self.eng, his=self.his)

# 再换一个模块test1，运行用
from test3 import getscrore   # 把补丁导入
from test2 import Person

def monkeypatch4Person():   # 一般不会只写下面一行，需要定义一个函数，使用时调用
	Person.getscore = getscrore   
# 把Person类中的getscore方法替换为getscrore方法。前面要替换的方法要与类相关，或与对象相关，现
# 在是要对Person类改变属性，如果不是对类改变属性是没有必要的，因为方法是定义在类上的，在类的dict
# 里面。对象的dict里看到的只有自己的数据。这样定义后，当student1调用getscore时，相当于调用
# getscrore

student1 = Person(80, 90, 88)
print(student1.getscore())

monkeypatch4Person()
student2 = Person(88, 99, 100)  # 只有student2才会是打了补丁的
print(student2.getscore())
输出：
(80, 90, 88)
('his': 88, 'chi': 80, 'eng': 90)   # 这是打了补丁后的输出
```

属性装饰器与对象的销毁

```python
# 属性装饰器是为了隐藏实例属性，所以暴露另一个方法来操作隐藏的属性
class Person:
    def __init__(self, chinese, english, history):
        self._chinese = chinese
        self._eng = english
        self.__his = history
# 实例的属性是私有的，所以最好隐藏，如果想给别人用，要用def的方法把方法暴露给别人    
# 在写一个类的初始化函数的时候，就应该对未来的实例的属性，应该加上下划线或双下划线。因为这些属性是
# 私有的，如果它想把这些属性给别人用，请它暴露出方法给别人用。有下划线就表示不想被直接使用，所以要
# 用一个方法把它暴露出去
    def gethis(self):   # 取历史成绩。这是__his这个属性的getter
        return self.__his
    
    def sethis(self, value):   # 修改历史成绩
        self.__his = value
        
    # def geteng(self):   
# 这只有一个getter属性，这被称为只读属性。上面的属性可以读写。只能写不能读的属性一般没什么用，最
# 少应该可读。
    #    retrun self._eng
         
    def seteng(self, v): # setter
        self._eng = v  # 这里根据下面的property做调整
    
    @property   # 属性装饰器
    def chinese(self): 
# 加了属性装饰器，这个方法就可以当一个变量用或属性用。只读属性。这里的方法叫什么名字，下面的
# setter和deleter也要叫什么名字。定义这个函数就是为了隐藏_chinese属性，使用chinese方法。当访
# 问chinese方法时，就会返回self._chinese的属性值
        return self._chinese  
# 看到return就应该想到是否可以改成匿名函数lambda
# 这个装饰器可以把它下面的方法变成一个像属性的东西让你来访问它，就是在使用方法时不用加括号了，这就
# 相当于在调用这个方法，调用这个方法后它就会把这个方法的返回值返回回来给print函数用。这就相当于
# 上面的geteng方法。
	@chinese.setter  
# 这个意思是把下面的方法作为chinese的setter，setter就是set的那个东西，它就是一个属性的设置器，
# chinese指的是上面@property下面定义的chinese方法。写属性。当赋值时，解释器知道是要调用
# setter的，调用setter时就会把值当value传入，这样就改变了self._chinese的值
	def chinese(self, value):  # set需要两个参数
        self._chinese = value
        
    @chinese.deleter   # 删除，少用
    def chinese(self):
       # del self._chinese
    	print('del chinese')
    
    # 下面是另一种方式的属性装饰器
    eng = property(lambda self:self._eng, seteng)  
# 括号里只需要函数名就可以了，定义了seteng后，下面就可以给eng赋值了
    
student1 = Person(80,90,88)
print(student1.gethis())  # 在外面不要直接拿实例的属性，而是使用一个方法
print(student1.chinese)  # 把一个方法当属性来用
student1.chinese = 100
print(student1.chinese)

del student1.chinese

print(student1.eng)  # 调用eng方法
student1.eng = 110
```