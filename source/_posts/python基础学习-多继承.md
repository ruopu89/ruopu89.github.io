---
title: python基础学习-多继承
date: 2020-03-07 15:32:39
tags: python多继承
categories: python
---

### Python不同版本的类

Python2.2之前是没有共同的祖先的，之后，引入`object`类，它是所有类的共同祖先类`object`。

Python2中为了兼容，分为古典类（旧式类）和新式类。

Python3中全部都是新式类

新式类都是继承自`object`的，新式类可以使用`super`

```python
# 以下代码在Python2.x中运行
# 古典类（旧式类）
class A: pass

# 新式类
class B(object): pass

print(dir(A))
print(dir(B))
print(A.__bases__)
print(B.__bases__)

# 古典类
a = A()
print(a.__class__)
print(type(a))   # <type 'instance'>

# 新式类
b = B()
print(b.__class__)
print(type(b))
```



### 多继承

OCP原则：多用“继承”、少修改

继承的用途：增加基类、实现多态

多态

在面向对象中，父类、子类通过继承联系在一起，如果可以通过一套方法，就可以实现不同表现，就是多态。

一个类继承自多个类就是多继承，它将具有多个类的特征。



### 多继承弊端

多继承很好的模拟了世界，因为事物很少是单一继承，但是舍弃简单，必然引入复杂性，带来了冲突。

如同一个孩子继承了来自父母双方的特征。那么到底眼睛像爸爸还是妈妈呢？孩子究竟该像谁多一点呢？

多继承的实现会导致编译器设计的复杂度增加，所以现在很多语言也舍弃了类的多继承。

C++支持多继承；Java舍弃了多继承。

Java中，一个类可以实现多个接口，一个接口也可以继承多个接口。Java的接口很纯粹，只是方法的声明，继承者必须实现这些方法，就具有了这些能力，就能干什么。

多继承可能会带来二义性，例如，猫和狗都继承自动物类，现在如果一个类多继承了猫和狗类，猫和狗都有`shout`方法，子类究竟继承谁的`shout`呢？

解决方案

实现多继承的语言，要解决二义性，深度优先或者广度优先。



### Python多继承实现

```python
class ClassName(基类列表):
    类体
```

![](/images/python多继承/python多继承1.png)

左图是多继承，右图是单一继承

多继承带来路径选择问题，究竟继承哪个父类的特征呢

Python使用MRO(method resolution order)解决基类搜索顺序问题。

- 历史原因，MRO有三个搜索算法：

  - 经典算法，按照定义从左到右，深度优先策略。2.2之前

    左图的MRO是MyClass,D,B,A,C,A

  - 新式类算法，经典算法的升级，重复的只保留最后一个。2.2

    左图的MRO是MyClass,D,B,C,A,object

  - C3算法，在类被创建出来的时候，就计算出一个MRO有序列表。2.3之后，Python3唯一支持的算法

    左图中的MRO是MyClass,D,B,C,A,object的列表

    C3算法解决多继承的二义性



### 多继承的缺点

当类很多，继承复杂的情况下，继承路径太多，很难说清什么样的继承路径。

Python语法是允许多继承，但Python代码是解释执行，只有执行到的时候，才发现错误。

团队协作开发，如果引入多继承，那代码将不可控。

不管编程语言是否支持多继承，都应当避免多继承。

Python的面向对象，我们看到的太灵活了，太开放了，所以要团队守规矩。



### Mixin

类有下面的继承关系

![](/images/python多继承/python多继承2.png)

文档Document类是其他所有文档类的抽象基类；

Word、Pdf是Document的子类。

需求：为Document子类提供打印能力

思路：

1. 在Document中提供print方法

```python
class Document:
    def __init__(self, content):
        self.content = content
        
    def print(self):
        raise NotImplementedError()
# raise是手动设置异常的方法。
class Word(Document): pass
class Pdf(Document): pass
=====================================================================================
raise 语句的基本语法格式为：
raise [exceptionName [(reason)]]
# 用 [] 括起来的为可选参数，其作用是指定抛出的异常名称，以及异常信息的相关描述。如果可选参数全部省
# 略，则 raise 会把当前错误原样抛出；如果仅省略 (reason)，则在抛出异常时，将不附带任何的异常描述信
# 息。
# raise 语句有如下三种常用的用法：
# raise：单独一个 raise。该语句引发当前上下文中捕获的异常（比如在 except 块中），或默认引发
# RuntimeError 异常。
# raise 异常类名称：raise 后带一个异常类名称，表示引发执行类型的异常。
# raise 异常类名称(描述信息)：在引发指定类型的异常的同时，附带异常的描述信息。
# 引用：http://c.biancheng.net/view/2360.html
=====================================================================================
```

基类提供的方法不应该具体实现，因为它未必适合子类的打印，子类中需要覆盖重写。

`print`算是一种能力--打印功能，不是所有的`Document`的子类都需要的，所以，从这个角度出发，有点问题。

2. 需要打印的子类上增加

如果在现有子类上直接增加，违反了OCP的原则，所以应该继承后增加，因此有下图

![](/images/python多继承/python多继承3.png)



```python
class Printable:
    def print(self):
        print(self.content)
        
class Document:   # 第三方库，不允许修改
    def __init__(self, content):
        self.content = content
        
class Word(Document): pass   # 第三方库，不允许修改
class Pdf(Document): pass   # 第三方库，不允许修改

class PrintableWord(Printable, Word): pass
print(PrintableWord.__dict__)
print(PrintableWord.mro())

pw = PrintableWord('test string')
pw.print()
print(pw.__dict__)
输出：
{'__module__': '__main__', '__doc__': None}
[<class '__main__.PrintableWord'>, <class '__main__.Printable'>, <class '__main__.Word'>, <class '__main__.Document'>, <class 'object'>]
test string
{'content': 'test string'}
```

看似不错，如果还需要提供其他能力，如何继承？

应用于网络，文档应该具备序列化的能力，类上就应该实现序列化。

可序列化还可能分为使用pickle、json、messagepack等。

这个时候发现，类可能太多了，继承的方式不是很好了。

功能太多，A类需要某几样功能，B类需要另几样功能，很繁琐。

3. 装饰器

用装饰器增强一个类，把功能给类附加上去，哪个类需要，就装饰它

```python
def printable(cls):
    def _print(self):  # 这里为什么是self，是规范吗？
        print(self.content, '装饰器')
    cls.print = _print  # 赋值即定义，给类加一个属性
    return cls

class Document: # 第三方库，不允许修改
    def __init__(self, content):
        self.content = content
class Word(Document): pass   # 第三方库，不允许修改
class Pdf(Document): pass   # 第三方库，不允许修改

@printable  # 先继承，后装饰
class PrintableWord(Word): pass
print(PrintableWord.__dict__)
print(PrintableWord.mro())

pw = PrintableWord('test string')
pw.print()

@printable
class PrintablePdf(Word): pass
输出：
{'__module__': '__main__', '__doc__': None, 'print': <function printable.<locals>._print at 0x7f1114f72550>}
# 这里PrintableWord类多了一个print属性
[<class '__main__.PrintableWord'>, <class '__main__.Word'>, <class '__main__.Document'>, <class 'object'>]
test string 装饰器
```

优点：

简单方便，在需要的地方动态增加，直接使用装饰器

4. Mixin

先看代码

```python
class Document:   # 第三方库，不允许修改
    def __init__(self, content):
        self.content = content
        
class Word(Document): pass   # 第三方库，不允许修改
class Pdf(Document): pass   # 第三方库，不允许修改

class PrintableMixin:
    def print(self):
        print(self.content, 'Mixin')
        
class PrintableWord(PrintableMixin, Word): pass
print(PrintableWord.__dict__)
print(PrintableWord.mro())

def printable(cls):
    def _print(self):
        print(self.content, '装饰器')
    cls.print = _print
    return cls

@printable
class PrintablePdf(Word): pass
print(PrintablePdf.__dict__)
print(PrintablePdf.mro())
```

Mixin就是其它类混合进来，同时带来了类的属性和方法

这里看来Mixin类和装饰器效果一样，也没有什么特别的。但是Mixin是类，就可以继承。

```python
class Document:   # 第三方库，不允许修改
    def __init__(self, content):
        self.content = content
        
class Word(Document): pass # 第三方库，不允许修改
class Pdf(DOcument): pass   # 第三方库，不允许修改

class PrintableMixin:
    def print(self):
        print(self.content, 'Mixin')
        
class PrintableWord(PrintableMixin, Word): pass
print(PrintableWord.__dict__)
print(PrintableWord.mro())

pw = PrintableWord('test string')
pw.print()

class SuperPrintableMixin(PrintableMixin):
    def print(self):
        print('~' * 20)   # 打印增强
        super().print()
        print('~' * 20)   # 打印增强
        
# PrintableMixin类的继承
class SuperPrintablePdf(SuperPrintableMixin, Pdf): pass

print(SuperPrintablePdf.__dict__)
print(SuperPrintablePdf.mro())

spp = SuperPrintablePdf('super print pdf')
spp.print()
```



### Mixin类

Mixin本质上就是多继承实现的

Mixin体现的是一种组合的设计模式。

在面向对象的设计中，一个复杂的类，往往需要很多功能，而这些功能有来自不同的类提供，这就需要很多的类组合在一起。

从设计模式的角度来说，多组合，少继承。

Mixin类的使用原则

- Mixin类中不应该显式的出现`__init__`初始化方法
- Mixin类通常不能独立工作，因为它是准备混入别的类中的部分功能实现
- Mixin类的祖先类也应是Mixin类

使用时，Mixin类通常在继承列表的第一个位置，例如`class PrintableWord(PrintableMixin, Word): pass`

Mixin类和装饰器

这两种方式都可以使用，看个人喜好

如果还需要继承就得使用Mixin类的方式。



### 练习

1. Shape基类，要求所有子类都必须提供面积的计算，子类有三角形、矩形、圆。
2. 上题圆类的数据可序列化

参考

1. Shape基类，要求所有子类都必须提供面积的计算，子类有三角形、矩形、圆。

思路

既然是基类，那么就应该有一个东西大家共同继承是最好的。都需要计算面积，面积可以是一个属性，也可以是一个方法。属性有两种东西，一种是真正的属性，一种是property装饰的属性，装饰的属性就是个方法。计算面积本来就是个动作，每一个子类都应该继承父类这个动作，至少应该实现一个求面积的方法，如何让这个动作像个属性暴露给别人，一调用就出来呢，这就需要装饰器

```python
import math

class Shape:
    @property
    def area(self):
        raise NotImplementedError('基类未实现')
# 在父类中如果定义了一种规范，所有子类遵照这种规范。通过这种方式，要求子类的area必须实现，如果子类不实现，别人在调用子类时一定会抛异常。在父类中定义一个统一的方法或属性，子类可以直接继承，如果防止别人调用父类的方法或属性呢，如果是属性可以给None，如果是方法可以使用raise Not...抛异常
class Triangle(Shape):
    def __init__(self, a, b, c):
        self.a = a
        self.b = b
        self.c = c
        
    @property
    def area(self):
        p = (self.a+self.b+self.c)/2
        return math.sqrt(p*(p-self.a)*(p-self.b)*(p-self.c))
    
class Rectangle(Shape):
    def __init__(self, width, height):
# 子类需要使用__init__时，就算父类是一个空实现，也要用super。如果父类实现的不好，子类使用__init__时会有黄底的提示。可以将父类的__init__取消，直接定义一个area方法，但父类的area方法好像写什么都不合适。但父类应该提供一个模板给子类看，提示一个求面积的公式给大家看。之后再在子类中定义同名方法覆盖父类的方法。如果要添加文档，最好使用双引号，如""" xxx """
        self.width = width
        self.height = height
        
    @property
    def area(self):
        return self.width * self.height
    
class Circle(Shape):
    def __init__(self, radius):
        self.d = radius * 2
        
    @property
    def area(self):
        return math.pi * self.d * self.d * 0.25
    
shapes = [Triangle(3,4,5), Rectangle(3,4), Circle(4)]
for s in shapes:
    print('The area of {} = {}'.format(s.__class__.__name__, s.area))
输出：
The area of Triangle = 6.0
The area of Rectangle = 12
The area of Circle = 78.53981633974483
```

2. 圆类的数据可序列化

```python
# 建议用装饰器再实现一遍
import json
import msgpack

class SerializableMixin:
    def dumps(self, t='json'):
        if t == 'json':
            return json.dumps(self.__dict__)
        elif t == 'msgpack':
            return msgpack.packb(self.__dict__)
        else:
            raise NotImplementedError('没有实现的序列化')
class SerializableCircleMixin(SerializableMixin, Circle):
    pass

scm = SerializableCircleMixin(4)
print(scm.area)
s = scm.dumps('msgpack')
print(s)
s = scm.dumps('json')
print(s)
输出：
50.26548245743669
b'\x81\xa1d\x08'
{"d": 8}
```



### 作业

用面向对象实现LinkedList链表

单向链表实现`append`、`iternodes`方法

双向链表实现`append`、`pop`、`insert`、`remove`、`iternodes`方法

![](/images/python多继承/python多继承4.png)

参考

对于链表来说，每一个结点是一个独立的对象，结点自己知道内容是什么，下一跳是什么。而链表则是一个容器，它内部装着一个个结点对象。所以，建议设计2个类，一个结点Node类，一个链表LinkedList类。

将链表的整体看作一个对象，是一个容器，容器中间放的是相同的，只是实例不同而已。实例有两个属性，一个是插入的内容，一个是内容指向

单向链表1

```python
# 笔记
class SingleNode:
    """
    代表一个节点，存储节点Node
    """
    def __init__(self, val, next=None):   
# 这是向类中放数据的过程，value是一个值，就代表上图中的一个个数字。如5、7。next只作为形参，想给值也可以。next不会与next方法冲
# 突，因为这个next只在这个作用域中生效，global中的next已经被这个next覆盖掉了。函数加载时在栈上，用完就会消失。下面的
# self.next更不会冲突，因为有self作为限定。链表是有序的，不能乱。但在内存上不一定是连续的，所以不能像列表一样移位。
        self.val = val
        self.next =  next   
        
    def __str__(self):
        return str(self.val)

    __repr__ = __str__

class LinkedList:
    """
    容器类，按某种方式存储一个个节点
    """
    def __init__(self):
        self.nodes = []   # 创建一个容器，放上面的元素。不能用set，有可能去重。另外set是无序的
        self.head = None
        self.tail = None
        
    def append(self, val):
# 这个方法的逻辑是，有一个节点，它是SingleNode的实例。之后看一下自己有多少个元素，这里有一个head和tail，这两个属性中保存的应该
# 是SingleNode的实例，如果当前的尾部是None，说明也没有头部，如果有一个元素，尾部一定会指向这个元素而不是None。如果是None，就
# 给头部加一个元素node，第一个元素即是头也是尾。之后再把这个node加到容器中，同时把尾部修正为当前node。这是第一种情况，容器中还
# 没有元素。第二次进来，就知道当前的尾部是谁了，这时就不执行if语句了，这时头部就定死了不会动了。直接将node追加到容器中，因为是第
# 二个元素了，所以尾部还要修正为当前的node。这时元素间还没有关系，所以要用prev.next修正一下
        node = SingleNode(val)
# SingleNode(val)是将SingleNode实例化的过程，将val放进去，就会返回self.val和self.next，这时的self.next就指向None，也就
# 是向链表尾部追加一个数字，这个数字就是self.val，下一个也就是self.next指向的是None。
		prev = self.tail
# 这是前一个node
	#	prev.next = node  # ?，如果tail就是None，那么一进来就是None了，所在要做判断。
    	if prev is None:  
# 如果前一个是None，一定是在尾部，并且是空的。如果尾部是空的，头也会是空的。如果有一个元素，尾部也不应该是空的
            self.head = node
# 这表示上一个节点的下一个就是我们现在要插入的。这也是当前节点
        else:
        	prev.next = node
# 只有一个节点时是没有next的，只有prev不是None时才要将元素间建立关联。所以这句不能放在if语句外面
        self.nodes.append(node)
# 把节点追加到列表中，但前面和后面的节点还没有关联，所以要在初始化时加self.head和self.tail。因为有追加，所以要加self.tail，
# 不然每次追加都要从头开始算
        self.tail = node
# tail无论什么情况都应该是node，也就是无论是否为空，tail也应该是最新的node，这是将尾部设置为当前节点。

a = LinkedList()
a.append(3)
print(a)
print(a.nodes)
输出：
<__main__.LinkedList object at 0x7ff960e6be50>
# 这里打印的是a实例的内存地址，注意观察打印内容，是LinkedList类的地址，下面中括号中的SingleNode类的地址。
[<__main__.SingleNode object at 0x7f57cad638b0>]
# 使用a.nodes打印成这样就是因为在SingleNode类中没有实现打印功能，定义了__repr__方法后就可以打印为[3]了。
# 这里实例化的a就是链表这个容器，我们要打印容器中的内容，还要在定义内容的地方实现打印。所以用print(a.nodes)只会打印内存地址，要打印出内容，需要在SingleNode中定义__repr__方法
====================================================================================
class SingleNode:
    """
    代表一个节点，存储节点Node
    """
    def __init__(self, val, next=None, prev=None):   
# 这是向类中放数据的过程，value是一个值，就代表上图中的一个个数字。如5、7。next只作为形参，想给值也可以。next不会与next方法冲
# 突，因为这个next只在这个作用域中生效，global中的next已经被这个next覆盖掉了。函数加载时在栈上，用完就会消失。下面的
# self.next更不会冲突，因为有self作为限定。链表是有序的，不能乱。但在内存上不一定是连续的，所以不能像列表一样做位运算。
        self.val = val
        self.next =  next   
        self.prev = prev
        
    def __repr__(self):
        return str(self.val)
    
    def __str__(self):
        return str(self.val)  # __repr__和__str__都是为了打印使用

class LinkedList:
    """
    容器类，按某种方式存储一个个节点
    """
    def __init__(self):
        self.nodes = []   # 创建一个容器，放上面的元素。不能用set，有可能去重。另外set是无序的
# 对不需要插入的列表来说，检索方便，所以使用了列表。但是插入、remove不合适
        self.head = None
        self.tail = None
# 这里没有设计self.size是因为这个数据在多线程的情况下不会太准确  

    def __len__(self):
        return len(self.nodes)
    
    def append(self, val):
# 这个方法的逻辑是，有一个节点，它是SingleNode的实例。之后看一下自己有多少个元素，这里有一个head和tail，这两个属性中保存的应该
# 是SingleNode的实例，如果当前的尾部是None，说明也没有头部，如果有一个元素，尾部一定会指向这个元素而不是None。如果是None，就
# 给头部加一个元素node，第一个元素即是头也是尾。之后再把这个node加到容器中，同时把尾部修正为当前node。这是第一种情况，容器中还
# 没有元素。第二次进来，就知道当前的尾部是谁了，这时就不执行if语句了，这时头部就定死了不会动了。直接将node追加到容器中，因为是第
# 二个元素了，所以尾部还要修正为当前的node。这时元素间还没有关系，所以要用prev.next修正一下
        node = SingleNode(val)
# SingleNode(val)是将SingleNode实例化的过程，将val放进去，就会返回self.val和self.next，这时的self.next就指向None，也就
# 是向链表尾部追加一个数字，这个数字就是self.val，下一个也就是self.next指向的是None。
		prev = self.tail
# 这是前一个node
	#	prev.next = node  # ?，如果tail就是None，那么一进来就是None了，所在要做判断。
    	if prev is None:  
# 如果前一个是None，一定是在尾部，并且是空的。如果尾部是空的，头也会是空的。如果有一个元素，尾部也不应该是空的
            self.head = node
# 这表示上一个节点的下一个就是我们现在要插入的。这也是当前节点
        else:
            prev.next = node
# 只有一个节点时是没有next的，只有prev不是None时才要将元素间建立关联。所以这句不能放在if语句外面
        self.nodes.append(node)   
# 把节点追加到列表中，但前面和后面的节点还没有关联，所以要在初始化时加self.head和self.tail。因为有追加，所以要加self.tail，
# 不然会次追加都要从头开始算
        self.tail = node
# tail无论什么情况都应该是node，也就是无论是否为空，tail也应该是最新的node，这是将尾部设置为当前节点。

    def iternodes(self, reverse=False):  # 暂时只能实现单向。iter表示生成器
        current = self.head   # 这是头部的元素
        while current:        # 空元素是进不来的
            yield current
            current = current.next
            
    def __getitem__(self, item):
        return self.nodes[item]
    
    
ll = LinkedList()
node = SingleNode(5)
ll.append(node)
node = SingleNode(7)
ll.append(node)

for node in ll.iternodes():
    print(node)
    
print(ll[1])  # 使用两种方法取数据
输出：
5
7
7
====================================================================================
class SingleNode:   # 节点保存内容和下一跳
    def __init__(self, item, next=None):
        self.item = item
        self.next = next
        
    def __repr__(self):
        return repr(self.item)
    
class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None    # 思考tail属性的作用
        
    def append(self, item):
        node = SingleNode(item)
        if self.head is None:
            self.head = node   # 设置开头结点，以后不变
        else:
            self.tail.next = node   # 当前最后一个结点关联下一跳
        self.tail = node   # 更新结尾结点
        return self
    
    def iternodes(self):
        current = self.head
        while current:
            yield current
            current = current.next
            
ll = LinkedList()
ll.append('abc')
ll.append(1).append(2)
ll.append('def')

print(ll.head, ll.tail)

for item in ll.iternodes():
    print(item)
输出：
'abc' 'def'
'abc'
1
2
'def'
```



单向链表2

借助列表实现

```python
class SingleNode:   # 节点保存内容和下一跳
    def __init__(self, item, next=None):
        self.item = item
        self.next = next
        
    def __repr__(self):
        return repr(self.item)
    
class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.items = []   # 为什么在单向链表中使用list？
        
    def append(self, item):
        node = SingleNode(item)
        if self.head is None:
            self.head = node   # 设置开头结点，以后不变
            # print(self.head.__dict__, a)
        else:
            self.tail.next = node   # 当前最后一个结点关联下一跳
# 这里的self.tail和self.head实际就是SingleNode类的实例，因为使用下面三种方法可以看出，self.tail和self.head的字典中都有
# item和next属性，而self的字典中有head, tail, items三个属性，而没有item和next属性。证明self是LinkedList类的实例。在没有
# 给self.head和self.tail赋值node前，这两个元素是没有item和next属性的。
			# print(self.tail.__dict__, 1)
            # print(self.head.__dict__, 2)
            # print(self.__dict__, 3)
            # print(self.tail.__dict__, b)
        self.tail = node   # 更新结尾结点
        # print(self.tail.__dict__, c)
        self.items.append(node)
        return self
    
    def iternodes(self):
        current = self.head
# 如果不使用append方法，self.head就不会有值，所以这里一定是使用过append方法后，才能正常输出，否则current只会等于None。赋值
# 以后，current也就拥有了item和next属性。感觉做是传染病一样，先是用SingleNode(item)赋值给node，再把node赋值给self.head，
# 现在又把self.head赋值给current。但current的值是一个个得到的，先得到abc，并输出
        while current:
            yield current
            current = current.next
# current中只有一个值，要用next方法指向下一个来修正current到下一个值
            
    def getitem(self, index):
        return self.items[index]
    
ll = LinkedList()
ll.append('abc')
ll.append(1).append(2)
ll.append('def')

print(ll.head, ll.tail)

for item in ll.iternodes():
    print(item)
    
for i in range(len(ll.items)):
    print(ll.getitem(i))
输出：
'abc' 'def'
'abc'
1
2
'def'
'abc'
1
2
'def'
```

为什么在单向链表中使用list？

因为只有结点自己知道下一跳是谁，想直接访问某一个结点只能遍历。

借助列表就可以方便的随机访问某一个结点了



双向链表

实现单向链表没有实现的`pop`、`remove`、`insert`方法

```python
# 笔记
class SingleNode:
    """
    代表一个节点，存储节点Node
    """
    def __init__(self, val, next=None, prev=None):  
        self.val = val
        self.next = next   
        self.prev = prev
        
    def __repr__(self):
        return str(self.val)
    
    def __str__(self):
        return str(self.val)  # __repr__和__str__都是为了打印使用

class LinkedList:
    """
    容器类，按某种方式存储一个个节点
    """
    def __init__(self):
       # self.nodes = []   # 创建一个容器，放上面的元素。不能用set，有可能去重，另外set是无序的。对不需要插入的列表来说，
    # 检索方便，所以使用了列表。但是插入、remove不合适
        self.head = None
        self.tail = None
# 这里没有设计self.size是因为这个数据在多线程的情况下不会太准确  

    def append(self, val):
        node = SingleNode(val)  # 当前新增的数字
        if self.head is None:  
# 加第一个元素时才会到这里
            self.head = node  # 如果第一个元素是None，那么就把头设置为node
        else:  # 大于1个元素时进入这里
            self.tail.next = node   # 原来的尾部指向自己
            node.prev = self.tail  # 前一个指向尾部
# prev属性实际在node实例上，所以要改node实例，而不是self.prev。每次调用append方法时都要用到node实例，所以从第二次进来就要让
# 实例知道node的前一个数字是谁。
        self.tail = node  # 最后把自己修正成尾部


	def iternodes(self, reverse=False):  # 暂时只能实现单向。iter表示生成器
        current = self.tail if reverse else self.head
        while current:      
            yield current
            current = current.prev if reverse else current.next
            
    def pop(self):  # 从尾部弹出一个
        if self.tail is None:  # 如果尾部是None，就抛异常。 == 0
            raise Exception('Empty')
        tail = self.tail
        prev = tail.prev
       #  next = tail.next # None， 尾部的下一个一定是None
        if prev is None:  # ==1。判断上面定义的tail和prev是否符合条件
            self.head = None   # 如果前一个是None，就表示头是None，否则前一个应该有值
            self.tail = None   #  头是None，就表示尾也是None。
# 当符合这个条件时就证明只有最后一个值了。再调用pop方法时头和尾就应该是None了。
        else: # > 1
            self.tail = prev
            prev.next = None
# 符合这个条件时，就是大小1个元素的时候，弹出一个元素后，尾部就应该变成尾部的前一个元素，前一个元素的下一个元素（也就是尾部）就应
# 该变成None了，因为被弹出了。
        return tail.val
    
    def getitem(self, index):
        if index < 0:
            return None   # 不支持负索引
        current = None   # 初始化一个current。
        for i,node in enumerate(self.iternodes()):
            if i == index:  
                current = node   # 如果i等于index时，将i对应的node赋值给current，之后跳出整个循环
                break
        if current is not None:   # 判断上面的循环，看current是否为None，如果不为None就返回current本身
            return current
# 这里似乎不应该会出现current等于None的情况，如果index小于0,会在第一个if条件判断处拦截，index大于等于0时会在下面的for循环拦
# 截并重新给current赋值，所以不应该会有current等于None的情况。
        
    def insert(self, index, val):  # 这只能实现从头或尾追加
        if index < 0:
            raise Exception('Error')
        
        current = None
        for i,node in enumerate(self.iternodes()):
            if i == index:
                current = node
                break
# 这里就是要用enumerate函数来确定index及其对应的值，最后赋值给current
        if current is None:
            self.append(val)
            return 
# 这里返回的是None，真正返回的内容已经在append方法中返回了。
# 什么情况下current会等于None？
        prev = current.prev
        next = current.next
        
        node = SingleNode(val)
        if prev is None:  # 头部插入
            self.head = node   # 这就是在设置插入到头部了
            node.next = current  
            current.prev = node  # 插入到头部后，再整理一下关系。头部的下一个是current，current的前一个是node
        else:
            node.prev = prev  # 如果前一个不是None，那么前一个就是current.prev
            node.next = current
            current.prev = node 

ll = LinkedList()
node = SingleNode('abc')
ll.append(node)
node = SingleNode(1)
ll.append(node)
node = SingleNode(2)
ll.append(node)
node = SingleNode(3)
ll.append(node)
node = SingleNode(4)
ll.append(node)
node = SingleNode(5)
ll.append(node)
node = SingleNode(6)
ll.append(node)
node = SingleNode('def')
ll.append(node)

ll.insert(6, 6)
ll.insert(7, 7)
ll.insert(0, '123')
ll.insert(1, '456')  # 在中间插入是无效的，但与pop方法结合时又是起作用的。
ll.insert(30, 'abcdefg')

ll.pop()
ll.pop()
ll.pop()
for node in ll.iternodes(True):
    print(node)
输出：
6
6
5
4
3
2
1
abc
456
123
====================================================================================
class SingleNode:
    def __init__(self, item, prev=None, next=None):
        self.item = item
        self.next = next
        self.prev = prev   # 增加上一跳
        
    def __repr__(self):
        # return repr(self.item)
        return "({} <== {} ==> {})".format(self.prev.item if self.prev else None, self.item, self.next.item if self.next else None)
# 打印时有三个值，第一个是前一个值，第二个是当前值，第三个是后一个值。
class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0   # 以后实现
        
    def append(self, item):
        node = SingleNode(item)
        if self.head is None:
            self.head = node
        else:
            self.tail.next = node  # 当前最后一个结点关联下一跳
            node.prev = self.tail   # 前后关联
        self.tail = node   # 更新结尾结点
        return self
# 第一次调用append方法后，self.tail和self.head都被赋值为node。第二次进入时，就等于在给SingleNode
# 的实例属性next和prev赋值。当打印时，因为数据是SingleNode类的，所以要在SingleNode类中实现打印方
# 法，LinkedList类只是提供了不同的方法。
    def insert(self, index, item):
        if index < 0:   # 不接受负数
            raise IndexError('Not negative index {}'.format(index))
            
        current = None  # current是当前的值
        for i, node in enumerate(self.iternodes()):
            if i == index:   # 找到了
                current = node
                break
        else:   # 没有break，尾部追加
            self.append(item)
            return
# for循环的意思是通过用i与用户提供的index比对，如果一样就说明这里用户要找的值，也就是current(当前值)的值，之后就
# break跳出循环，不会再执行else语句，直接执行下面的语句。如果没有找到，这应该是第一次加入值或索引超过了现有的范围
# （如下面的ll.insert(20, 'def'），这时就会执行到else语句，这会调用append方法追加数据，之后就直播返回了，不会再
# 执行下面的语句。 
        # break，找到了
        node = SingleNode(item)
        prev = current.prev
        next = current
# 当找到以后，这里就会给node，prev，next重新赋值，这三个变量分别代表要插入的值，前一个和后一个值，上面
# 的current是用户指定的值，我们是要在这个值的前面插入值。下面进行判断，如果prev是空，说是current就是
# 头部了，这样就要在头部前面插入，所以将头部调整为node。否则，前一个的下一个就是当前插入的node，插入后
# 当前的node的前一个就是current.prev，current已经在上面的for循环中赋值成了node。最后，将新插入的值
# 的下一个调整为current，也就是next，再将next的前一个调整为新插入的node
        if prev is None:  # 首部
            self.head = node
        else:
            prev.next = node  # 这个prev是上面
            node.prev = prev
        node.next = next
        next.prev = node
        
    def pop(self):
    	if self.tail is None:   # 空
            raise Exception('Empty')
            
        node = self.tail
        item = node.item
        prev = node.prev
        if prev is None: # only one node
            self.head = None
            self.tail = None
        else:
            prev.next = None
            self.tail = prev
        return item
    
    def remove(self, index):
# remove方法的逻辑与insert方法的差不多，先判断容器是否为空或用户输入的索引值不符合要求。之后找到用户输
# 入的索引对应的值并赋值给current上，再设置current的前一个和后一个值。判断四种情况，如果前一个和后一个
# 都是None，那么删除后，将头和尾都设置成None，说明删除的已经是最后一个值了。如果前一个是None，说明删除
# 的就是头，删除后将头调整为下一个next，就是头变成了next，下一个的前一个就成了None。如果下一个next是
# None，说明已经在尾部了，删除后将尾部调整为前一个prev，前一个的下一个调整为None。最后如果不符合前面说
# 的三种情况，说明在中间，删除后将前一个的下一个调整为下一个next，下一个的前一个调整为前一个。最后删除用
# 户指定的current的值。
        if self.tail is None: # 空
            raise Exception('Empty')
            
        if index < 0:  # 不接受负数
            raise IndexError('Not negative index {}'.format(index))
            
        current = None
        for i, node in enumerate(self.iternodes()):
            if i == index:
                current = node
                break
        else:   # Not Found
            raise IndexError('Wrong index {}'.format(index))
            
        prev = current.prev
        next = current.next
        
        # 4种情况
        if prev is None and next is None: # only one node
            self.head = None
            self.tail = None
        elif prev is None:  # 头部
            self.head = next
            next.prev = None
        elif next is None: # 尾部
            self.tail = prev
            prev.next = None
        else: # 在中间
            prev.next = next
            next.prev = prev
            
        del current
    def iternodes(self, reverse=False):
        current = self.tail if reverse else self.head
        while current:
            yield current
            current = current.prev if reverse else current.next
            
ll = LinkedList()
ll.append('abc')
ll.append(1)
ll.append(2)
ll.append(3)
ll.append(4)
ll.append(5)
ll.append('def')
print(ll.head, ll.tail)

for x in ll.iternodes(True):
    print(x)
    
print('============')

ll.remove(6)
ll.remove(5)
ll.remove(0)  # 从头部删除需要注意，原本索引为1的元素，在删除头部后就会变成索引为0。
ll.remove(1)  # 在删除了索引为0的元素后，这里删除索引为1的元素的值实际是2而不是1

for x in ll.iternodes():
    print(x)
    
print('~~~~~~~~~~~~~~~~~~')

ll.insert(3, 5)
ll.insert(20, 'def')
ll.insert(1, 2)
ll.insert(0, 'abc')
for x in ll.iternodes():
    print(x)
输出：
(None <== abc ==> 1) (5 <== def ==> None)
(5 <== def ==> None)
(4 <== 5 ==> def)
(3 <== 4 ==> 5)
(2 <== 3 ==> 4)
(1 <== 2 ==> 3)
(abc <== 1 ==> 2)
(None <== abc ==> 1)
=========================================
(None <== 1 ==> 3)
(1 <== 3 ==> 4)
(3 <== 4 ==> None)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
(None <== abc ==> 1)
(abc <== 1 ==> 2)
(1 <== 2 ==> 3)
(2 <== 3 ==> 4)
(3 <== 4 ==> 5)
(4 <== 5 ==> def)
(5 <== def ==> None)
```



### 笔记

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

