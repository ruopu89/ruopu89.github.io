---
title: python基础学习-类的继承
date: 2020-03-07 13:59:23
tags: python类的继承
categories: python
---

### 基本概念

面向对象三要素之一，继承inherritance

人类和猫类都继承自动物类。

个体继承自父母，继承了父母的一部分特征，但也可以有自己的个性。

在面向对象的世界中，从父类继承，就可以直接拥有父类的属性和方法，这样可以减少代码、多复用。子类可以定义自己的属性和方法。

看一个不用继承的例子

```python
class Animal:
    def shout(self):
        print('Animal shouts')
        
a = Animal()
a.shout()

class Cat:
    def shout(self):
        print('Cat shouts')

c = Cat()
c.shout()
```

上面的2个类虽然有关系，但是定义时并没有建立这种关系，而是各自完成定义。

动物类和猫类都有吃，但是它们的吃有区别，所以分别定义。

```python
class Animal:
    def __init__(self, name):
        self._name = name
        
    def shout(self):   # 一个通用的吃方法
        print('{} shouts'.format(self.__class__.__name__))
        
    @property
    def name(self):
        return self._name
    
a = Animal('monster')
a.shout()

class Cat(Animal):
    pass

cat = Cat('garfield')
cat.shout()
print(cat.name)

class Dog(Animal):
    pass

dog = Dog('ahuang')
dog.shout()
print(dog.name)
输出：
Animal shouts
Cat shouts
garfield
Dog shouts
ahuang
```

上例可以看出，通过继承，猫类、狗类不用写代码，直接继承了父类的属性和方法。

**继承**

`class Cat(Animal)`这种形式就是从父类继承，括号中写上继承的类的列表。

继承可以让子类从父类获取特征（属性和方法）

**父类**

`Animal`就是`Cat`的父类，也称为基类、超类。

**子类**

`Cat`就是`Animal`的子类，也称为派生类。



### 定义

格式如下

```python
class 子类名(基类1[,基类2,...]):
    语句块
```

如果类定义时，没有基类列表，等同于继承自`object`。在Python3中，`object`类是所有对象的根基类。

```python
class A:
    pass
# 等价于
class A(object):
    pass
```

注意，上例在Python2中，两种写法是不同的。

Python支持多继承，继承也可以多级。

查看继承的特殊属性和方法有

| 特殊属性和方法     | 含义                         | 示例                   |
| ------------------ | ---------------------------- | ---------------------- |
| `__base__`         | 类的基类                     |                        |
| `__bases__`        | 类的基类元组                 |                        |
| `__mro__`          | 显示方法查找顺序，基类的元组 |                        |
| `mro()`方法        | 同上                         | `int.mro()`            |
| `__subclasses__()` | 类的子类列表                 | `int.__subclasses__()` |



### 继承中的访问控制

```python
class Animal:
    __COUNT = 100
    HEIGHT = 0
    
    def __init__(self, age, weight, height):
        self.__COUNT += 1
        self.age = age
        self.__weight = weight
        self.HEIGHT = height
        
    def eat(self):
        print('{} eat'.format(self.__class__.__name__))
        
    def __getweight(self):
        print(self.__weight)
        
    @classmethod
    def showcount1(cls):
        print(cls.__COUNT)
    
    @classmethod
    def __showcount2(cls):
        print(cls.__COUNT)
        
    def showcount3(self):
        print(self.__COUNT)
        
class Cat(Animal):
    NAME = 'CAT'
    __COUNT = 200
    
# c = Cat()   # __init__函数参数错误
c = Cat(3, 5, 15)
c.eat()
print(c.HEIGHT)
# print(c.__COUNT)   # 私有的不可访问
# c.__showweight()   # 私有的不可访问
c.showcount1()
# c.__showcount2()   # 私有的不可访问
c.showcount3()
print(c.NAME)

print("{}".format(Animal.__dict__))
print("{}".format(Cat.__dict__))
print(c.__dict__)
print(c.__class__.mro())
输出：
Cat eat
15  # c在实例化时传入了参数15,所以这里是15
100  # 这是类属性__COUNT，和实例无关，所以是父类中定义的100
101  # 这是实例的属性__COUNT，在初始化时加了1，所以是101
CAT  # 这是在Cat类中定义的
{'__module__': '__main__', '_Animal__COUNT': 100, 'HEIGHT': 0, '__init__': <function Animal.__init__ at 0x7fca758b75e0>, 'eat': <function Animal.eat at 0x7fca758b7670>, '_Animal__getweight': <function Animal.__getweight at 0x7fca758b7700>, 'showcount1': <classmethod object at 0x7fca7591aa90>, '_Animal__showcount2': <classmethod object at 0x7fca7593f5b0>, 'showcount3': <function Animal.showcount3 at 0x7fca758b78b0>, '__dict__': <attribute '__dict__' of 'Animal' objects>, '__weakref__': <attribute '__weakref__' of 'Animal' objects>, '__doc__': None}
{'__module__': '__main__', 'NAME': 'CAT', '_Cat__COUNT': 200, '__doc__': None}
# Cat类中只有NAME和_Cat__COUNT两个变量，因为__COUNT与父类中的变量同名，这又是私有变量，所以加上了_Cat，以示区分。
{'_Animal__COUNT': 101, 'age': 3, '_Animal__weight': 5, 'HEIGHT': 15}
# c实例中有父类中定义的初始化时应有的属性
[<class '__main__.Cat'>, <class '__main__.Animal'>, <class 'object'>]
# 查找顺序是Cat -> Animal -> object
```

从父类继承，自己没有的，就可以到父类中找。

私有的都是不可以访问的，但是本质上依然是改了名称放在这个属性所在的类`__dict__`中了。知道这个新名称就可以直接找到这个隐藏的变量，这是个黑魔法技巧，慎用。

总结

继承时，公有的，子类和实例都可以随意访问；私有成员被隐藏，子类和实例不可直接访问，私有变量所在的类内的方法中可以访问这个私有变量。也就是只有类内的方法可以访问类内的私有变量，但类方法不可以调用实例的私有属性，因为实例可能不存在，或没有属性。私有变量或属性就是名称前面有两个下划线的，私有的实例属性就在实例中用，如果是私有的类属性，可以在类方法和实例方法中使用。公有的大家都可以用，私有的除了它自己谁都不能用。继承的，公开的，是祖先的、父类的就是我的，我实例化后是我自己，我在实例化后把这些实例属性都放到自己的字典中了，类的方法存一份就够了，所以不需要也拿过来，这些是放在类的字典中的

Python通过自己一套实现，实现和其它语言一样的面向对象的继承机制。

属性查找顺序

实例的`__dict__` -> 类`__dict__`如果有继承 -> 父类`__dict__`

如果搜索这些地方后没有找到就会抛异常，先找到就立即返回了。



### 方法的重写、覆盖override

 ```python
class Animal:
    def shout(self):
        print('Animal shouts')
        
class Cat(Animal):
    # 覆盖了父类方法
    def shout(self):
        print('miao')
        
a = Animal()
a.shout()
c = Cat()
c.shout()

print(a.__dict__)
print(c.__dict__)
print(Animal.__dict__)
print(Cat.__dict__)

输出：
Animal shouts
miao
{}
{}  # a和c两个实例的dict中没有任何属性
{'__module__': '__main__', 'shout': <function Animal.shout at 0x7f2d8609f5e0>, '__dict__': <attribute '__dict__' of 'Animal' objects>, '__weakref__': <attribute '__weakref__' of 'Animal' objects>, '__doc__': None}
{'__module__': '__main__', 'shout': <function Cat.shout at 0x7f2d8609f670>, '__doc__': None}  # Cat和Animal两个类的dict中都有shout方法，但各是各的，不冲突
 ```

Cat中能否覆盖自己的方法吗？

```python
class Animal:
    def shout(self):
        print('Animal shout')
        
class Cat(Animal):
    # 覆盖了父类方法
    def shout(self):
        print('miao')
    # 覆盖了自身的方法，显式调用了父类的方法
    def shout(self):
        print(super())
        print(super(Cat, self))
        super().shout()
        super(Cat, self).shout()   # 等价于super()
        self.__class__.__base__.shout(self)   # 不推荐
        
a = Animal()
a.shout()
c = Cat()
c.shout()

print(a.__dict__)
print(c.__dict__)
print(Animal.__dict__)
print(Cat.__dict__)
输出：
Animal shout
<super: <class 'Cat'>, <Cat object>>
<super: <class 'Cat'>, <Cat object>>
Animal shout
Animal shout
Animal shout
{}
{}
{'__module__': '__main__', 'shout': <function Animal.shout at 0x7f08af1425e0>, '__dict__': <attribute '__dict__' of 'Animal' objects>, '__weakref__': <attribute '__weakref__' of 'Animal' objects>, '__doc__': None}
{'__module__': '__main__', 'shout': <function Cat.shout at 0x7f08af142700>, '__doc__': None}
```

`super()`可以访问到父类的属性，其具体原理后面再说。

那对于类方法和静态方法呢？

```python
class Animal:
    @classmethod
    def class_method(cls):
        print('class_method_animal')
        
    @staticmethod
    def static_method():
        print('static_method_animal')
        
class Cat(Animal):
    @classmethod
    def class_method(cls):
        print('class_method_cat')
        
    @staticmethod
    def static_method():
        print('static_method_cat')
        
c = Cat()
c.class_method()
c.static_method()
输出：
class_method_cat
static_method_cat
```

这些方法都可以覆盖，原理都一样，属性字典的搜索顺序。



### 继承中的初始化

先看下面一段代码，有没有问题

```python
class A:
    def __init__(self, a):
        self.a = a
        
class B(A):
    def __init__(self, b, c):
        self.b = b
        self.c = c
        
    def printv(self):
        print(self.b)
        print(self.a)   # 出错吗。实例在B类中初始化，与父类A没有关系，所以也没有a属性
        
f = B(200, 200)
print(f.__dict__)
print(f.__class__.__bases__)
f.printv()
输出：
{'b': 200, 'c': 200}
(<class '__main__.A'>,)
200
```

上例代码可知：

如果类B定义时声明继承自类A，则在类B中`__bases__`中是可以看到类A。

但是这和是否调用类A的构造方法是两回事。

如果B中调用了A的构造方法，就可以拥有父类的属性了。如何理解这一句话呢？

观察B的实例f的`__dict__`中的属性。

```python
class A:
    def __init__(self, a, d=10):
        self.a = a
        self.__d = d
        
class B(A):
    def __init__(self, b, c):
        A.__init__(self, b + c, b - c)
        self.b = b
        self.c = c
        
    def printv(self):
        print(self.b)
        print(self.a)
        
f = B(200, 300)
print(f.__dict__)
print(f.__class__.__bases__)
f.printv()
输出：
{'a': 500, '_A__d': -100, 'b': 200, 'c': 300}
# 这里因为基类A中定义的a属性是普通属性，所以在B类继承时可以直接使用。__d是私有属性，所以在这里不能直接使用，名称也变成了_A__d。
(<class '__main__.A'>,)
200
500
```

作为好的习惯，如果父类定义了`__init__`方法，你就该在子类的`__init__`中调用它。

那子类什么时候自动调用父类的`__init__`方法呢？

示例1

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        self.__a2 = 'a2'
        print('A init')
        
class B(A):
    pass

b = B()
print(b.__dict__)
输出：
A init
{'a1': 'a1', '_A__a2': 'a2'}
```

B实例的初始化会自动调用基类A的`__init__`方法

示例2

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        self.__a2 = 'a2'
        print('A init')
        
class B(A):
    def __init__(self):
        self.b1 = 'b1'
        print('B init')
        
b = B()
print(b.__dict__)
输出：
B init
{'b1': 'b1'}
```

B实例的初始化`__init__`方法不会自动调用父类的初始化`__init__`方法，需要手动调用。

```python
class A:
    def __init__(self):
        self.a1 = 'a1'
        self.__a2 = 'a2'
        print('A init')
        
class B(A):
    def __init__(self):
        self.b1 = 'b1'
        print('B init')
        A.__init__(self)
        
b = B()
print(b.__dict__)
输出：
B init
A init
{'b1': 'b1', 'a1': 'a1', '_A__a2': 'a2'}
```

如何正确初始化

```python
class Animal:
    def __init__(self, age):
        print('Animal init')
        self.age = age
        
    def show(self):
        print(self.age)
        
class Cat(Animal):
    def __init__(self, age, weight):
        print('Cat init')
        self.age = age + 1
        self.weight = weight
        
c = Cat(10, 5)
c.show()
输出：
Cat init
11
```

上例我们前面都分析过，不会调用父类的`__init__`方法的，这就会导致没有实现继承效果。所以在子类的`__init__`方法中，应该显式调用父类的`__init__`方法。

```python
class Animal:
    def __init__(self, age):
        print('Animal init')
        self.age = age
        
    def show(self):
        print(self.age)
        
class Cat(Animal):
    def __init__(self, age, weight):
        # 调用父类的__init__方法的顺序决定着show方法的结果
        super().__init__(age)
        print('Cat init')
        self.age = age + 1
        self.weight = weight
        # super().__init__(age)
        
c = Cat(10, 5)
c.show()
输出：
Animal init
Cat init
11 # 如果把继承父类的初始化属性放在子类初始化的最下面，这里显示就是10
```

注意，调用父类的`__init__`方法，出现在不同的位置，可能导致出现不同的结果。

那么，直接将上例中所有的实例属性改成私有变量呢？

```python
class Animal:
    def __init__(self, age):
        print('Animal init')
        self.__age = age
        
    def show(self):
        print(self.__age)
        
class Cat(Animal):
    def __init__(self, age, weight):
        # 调用父类的__init__方法的顺序决定着show方法的结果
        super().__init__(age)
        print('Cat init')
        self.__age = age + 1
        self.__weight = weight
        # super().__init__(age)
        
c = Cat(10, 5)
c.show()

print(c.__dict__)
输出：
Animal init
Cat init
10
{'_Animal__age': 10, 'age': 11, 'weight': 5}
```

上例中打印10，原因看`__dict__`就知道了。因为父类`Animal`的`show`方法中`__age`会被解释为`_Animal__age`，因此显示的是10，而不是11。

这样的设计不好，`Cat`的实例`c`应该显示自己的属性值更好。

解决的办法：一个原则，自己的私有属性，就该自己的方法读取和修改，不要借助其他类的方法，即使是父类或者派生类的方法。



### 笔记

`__mro__`非常重要，它会保存方法的查找顺序

```python
int.__subclasses__()   # 看基类
int.__bases__   # 看祖先类
int.__base__
int.mro()   # 自己是谁，继承自谁

class Animal:
    x = 123
    def __init__(self, name):
        self._name = name
        self.__age = 10
        
    @property
    def name(self):
        return self._name
    
    def shout(self):
        print('Animal shout')
       # return self.__age   
# 这只会访问到Animal类中的__age私有变量。如果在Cat类中也有这一句，并且Cat类中也初始化了一个__age
# 私有变量，那么在调用Cat的__age变量时，访问的就是Cat类的私有变量，与Animal类无关。从类的字典中也
# 可以看到私有变量的名称是不一样的，会分为是哪个类的私有变量。也就是不同的类中的方法只能访问自己类的
# 私有变量  
    
    @classmethod
    def clsmtd(cls):
        print(cls, cls.__name__)
        
class Cat(Animal):
    x = 'cat'
    # 这里要在Cat类上做一些事情
    def __init__(self, name):
	#  Animal.__init__(self, name)  
# 有了这一句就会有三个属性，两个是父类的，一个是子类自己的，不然就会报错，说找不到_name属性，因为下
# 面实例中使用了tom.name，这是调用了父类的name方法
        # self.catname = name  
# 这样做的问题是没有调用父类的方法，它覆盖了父类的_name属性。也就是_Animal__age这个属性是属于
# Animal类的，下面只创建了一个tom实例，所以要给tom实例创建属性，就要继承父类的属性，所以在
# tom.__dict__中可以看到这个属性。_Animal__age是Animal类中定义的实例属性，所以它要找一个实例放
# 进去，虽然tom是Garfield类的实例，但是祖先的特征只能放在这个实例上，这是实例的初始化函数，在类的
# 属性__dict__中是找不到的
# 如果要多份，要放在实例属性上。如果只要一份，要放在类属性上，比如方法。只要一份的就是通用的，多份的
# 就是个性化的
		super().__init__(name)  
# 根据下面所说的super()的使用方法，这里也可以写成这样，代替上面的写法。这样写self会直接传过去，因
# 为绑定了self，但name还要加上，新式类推荐使用这种写法
   
        self._name = "Cat"+name
# 这里送进来的是tom实例，实例给了Animal的初始化方法，初始化self._name = name。这里的
# self._name = "Cat"+name是又保留了一份_name属性，因为都是_name属性，所以这里的属性就覆盖了父
# 类的_name属性，这就是子类覆盖父类的方法，显示是name: Cattom。如果把Animal.__init__就是一个函
# 数调用，和self._name两个方法颠倒位置，那么结果实例还是要保留父类的_name属性，这是执行顺序。
# Animal.__init__()就是一个函数调用，还可以写成Animal.__init__(self, 'abc')。当子类要初始化
# 时，就要调用一下父类的初始化方法，如果不调用父类的初始化方法，就会在子类初始化时覆盖父类的方法。如
# 果是__age这种隐藏属性，就只是子类的，不会覆盖父类的。
		self.__age = 20
        
    def shout(self):  # override。Cat类的这个方法会覆盖父类的同名方法
       # print('miao')
    	super().shout()  
# 虽然覆盖了父类的方法，但是这里又调用了父类的方法。这里的方法的实现是调用父类的方法。这样下面的
# Garfield就也可以使用这个方法了，因为Garfield会继承这个方法，这个方法又调用了自己父类的这个方
# 法.super().shout()就等价于Animal.shout()。super()就是用来访问祖先类的
        super(Cat, self).shout()  
# 也可以这样写，不过没必要这样写。这里的意思指在当前实例的类型中找Cat，也就是在类型的字典中找Cat，
# 找到后再找Cat的父类。这里的self实例只能是自己的或子类的实例化，一定不能是父类的实例化
        print('Cat shout')  
# 下面Garfield在调用这个shout方法时会先打印Animal shout再打印Cat shout
        
    @classmethod
    def clsmtd(cls):
        print(cls, cls.__name__)
       
class Garfield(Cat):
    pass 

class PersiaCat(Cat):
    # def __init__(self):
    #		self.eyes = 'Blue'
    pass

class Dog(Animal):
    def run(self):
        print('Dog run')
        
tom = Garfield('tom')
print(tom.name)
print(tom.shout())
print(tom.__dict__)
print(Garfield.__dict__)
print(Cat.__dict__)
print(Animal.__dict__)
# 这里实例化首先使用new产生一个实例，这时要调用Cat类，把tom传给self，之后把实例传给
# Animal.__init__(self, name)中的self，再转到Animal类中的初始化执行，把_name和__age两个属性
# 给tom实例，接着执行self.catname = name，把第三个属性给tom实例。但是如果Cat类和属性要是与
# Animal类的属性都叫_name
print(tom.clsmtd())
# 输出：<class 'test3.Garfield'> Garfield，查看字典，在两个类属性中都有这个clsmtd方法，在调
# 用时会先调用自己的父类，这里在Cat父类中就可以找到clsmtd，这时等于是tom.__class__传进了clsmtd
# 中，这时tom的类是Garfield，所以打印的也就是tom所属类自己的名字了，虽然定义是在Cat类中，但使用了
# 类方法，传进去的是什么就应该打印什么。这与在哪个类上定义没关系，也就是找的时候找这个父类，但传的参
# 数是自己。所以这里就算调用的是Animal类，打印的结果也应该是一样的。这种东西就是python中的多态
输出：
tom
miao
None
{'_name': 'tom', '_Animal__age': 10}  # 父类的实例属性，在tom中也出现了。
{'__module__': '__main__', '__doc__': None}
# Garfield类因为用了pass，所以这里什么也没有
{'__module__': '__main__', 'x': 'cat', 'shout': <function Cat.shout at 0x7fb7f2b7e700>, '__doc__': None}
# x是Cat类本身的属性，但它并没有到Garfield类上去，虽然Garfield类继承自Cat类。
# 执行时会先看是不是自己实例的属性，如果不是，再看是不是属于当前类的，当前类没有再看祖先类有没有，如
# 果祖先没有，再看祖先的祖先有没有
# 隐藏改的名字是谁有就改谁的名字，也就是按照查找顺序，在这条继承链上查找，谁有就改谁的名字
{'__module__': '__main__', 'x': 123, '__init__': <function Animal.__init__ at 0x7fb7f2b7e550>, 'name': <property object at 0x7fb7f2b83680>, 'shout': <function Animal.shout at 0x7fb7f2b7e670>, '__dict__': <attribute '__dict__' of 'Animal' objects>, '__weakref__': <attribute '__weakref__' of 'Animal' objects>, '__doc__': None}
<class 'test3.Garfield'> Garfield
dog = Dog('ahuang')
gf.shout()
print('gf.x', gf.x)
print('gf', gf.__dict__)

print('gf.mro={}'.format(gf.__class__.__mro__)) 
# 实例没有__mro__属性，类才有，这里打印的是继承链
print('gf.bases={}'.format(gf.__class__.__bases__)) 
# bases才是真正的继承
```

加下划线和不加下划线的都是公有的，包括特殊的，在类上都继承下来，父类的就是你的，python为了实现做了一个查找的动作，对使用者来说可以不管这些。父类的就是我的，拿来就可以用。传的self就是自己，所以调父类的方法发现打印的self是自己，方法有一份就可以了，因为是不同的实例。

在子类中初始化时，要调用父类的初始化方法，不然就会覆盖父类的初始化方法，但有一些方法也是不需要继承的。另外，私有属性是自己的，不会继承。如果子类不做初始化或初始化没有重名，就会继承父类的初始化方法。所以最好显式地调用父类的初始化方法。私有变量如果与父类中的有冲突，并把调用这个变量的方法重新在子类中再写一次，因为私有变量是不会互相覆盖的。要覆盖就不要用私有变量。父类和祖先类的，除了私有的，都是我的。所以传进去的self，class也是自己的，显示的也是自己的，私有变量除外。



Minxi

```python
class Document:
    def __init__(self, content):
        self.content = content
    
	def print(self):
        print(self.content)

class Word(Document):
    pass

class PrintableWord(Word):
    def print(self):
        print('Word print {}'.format(self.content))
# 如果Word是第三方提供的或很庞大，只是觉得它的print方法打印的不好，这时可以将Word类继承下来，只写一
# 个print方法覆盖Word的同名方法，也就是临时增加一个打印功能。实例是实现这个功能的实例
class Pdf(Document):
    pass

# print(Word.mro())
# word = Word('test\nabc')
# 输出：
# [<class '__main__.Word'>, <class '__main__.Document'>, <class 'object'>]
# 先找Word类，再找父类，最后找祖先类
print(PrintableWord.mro())
word = PrintableWord('test\nabc')
print(word.__dict)
输出：
[<class '__main__.PrintableWord'>, <class '__main__.Word'>, <class '__main__.Document'>, <class 'object'>]
{'content': 'test\nabc'}

==================================================================================
装饰器
class Document:
    def __init__(self, content):
        self.content = content
    
	def print(self):
        print(self.content)

class Word(Document): pass   # 这样写表示第三方库，不动

# def print(self):
#     print('Word print {}'.format(self.content))	
def printable(cls):
    cls.print = lambda self: print(self.content)
    return cls
# PrintableWord是类对象作为参数传到printable函数中当作cls，这个cls是可以被动态地增加类属性的，
# 类属性是增加在这个类对象的dict上的，也就是类的dict上的。这个属性对应的是一个lambda函数。这个
# lambda函数就是上面的print方法的功能。当我们调用print的时候就应该是已经实例化后调用了，所以这时
# 调用类方法时就会动态增加一个类属性，这时实例也被当作self传入到lambda函数了。这种方法必须会
@printable   
# 要让哪个类打印，就给他一个打印的功能，这是一个函数。先写等价式：
# PrintableWord=printable(PrintableWord)
class PrintableWord(Word): 
    def __init__(self, content):
        self.content = content

class Pdf(Document):
    pass

print(PrintableWord.__dict__)  # 查看是否有print方法
# a = PrintableWord('abc')  # 这时a有print和
# a.print()
输出：
=================================================================================
# Mixin
class PrintableMixin:
    def _print(self):
        print('~~~~~~~~~~~')
        print('{}'.format(self.content))
# Mixin与装饰器函数写的都差不多，但Mixin是类，有类的三种特征     
class Document:
    def __init__(self, content):
        self.content = content
    
	def print(self):
        print(self.content)
        
def printable(cls):
    def _print(self):
        print('~~~~~~~~~~~')
        print('{}'.format(self.content))
    cls.print = _print
    return cls

class Word(Document): pass   # 这样写表示第三方库，不动

@printable
class PrintableWord(Word): pass

class Pdf(Document):
    pass

class PrintablePdf(PrintableMixin, Pdf):
    pass
# 这个类继承自PrintableMixin和Pdf，PrintableMixin继承自object，Pdf继承自Document，
# Document继承自object。执行的查找使用c3算法，深度优先。Mixin一般都放在最前面，因为Mixin是我们
# 要混进来的方法，所以需要先执行。Mixin混进来是为了覆盖原有的方法

print(PrintablePdf.mro())
word = PrintablePdf('test\nabc')
print(word.__dict__)

word.print()
```

