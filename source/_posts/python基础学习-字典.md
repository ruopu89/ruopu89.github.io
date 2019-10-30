---
title: python基础学习-字典
date: 2019-03-26 09:36:23
tags: 字典
categories: python
---

### 概念

字典，也称映射(mapping)是一种可通过名称来访问其各个值的数据结构。字典是Python中唯一的内置映射类型，其中的值不按顺序排列，而是存储在键下。键可能是数、字符串或元组。字典是key-value键值对的数据的集合，它是可变的、无序的、key不重复。字典中的item指的就是kv对

字典(日常生活中的字典和Python字典)旨在让你能够轻松地找到特定的单词(键)，以获悉其定义(值) 。

Python字典的用途：

- 表示棋盘的状态，其中每个键都是由坐标组成的元组；

- 存储文件修改时间，其中的键为文件名；

- 数字电话/地址簿。
- 不要用值来找，要用key来找。如果需要用值来找就不要用此种方法

```python
>>> names = ['Alice', 'Beth', 'Cecil', 'Dee-Dee', 'Earl']
>>> numbers = ['2341', '9102', '3158', '0142', '5551']
>>> numbers[names.index('Cecil')]
'3158'
# 这可行，但不太实用。
```



### 基本的字典操作

```python
len(d)
# 返回字典d 包含的项(键值对)数。
d[k]
# 返回与键k相关联的值。
d[k] = v
# 将值v关联到键k。
del d[k]
# 删除键为k的项。
k in d
# 检查字典d 是否包含键为k的项。
```



### 字典dict定义，初始化

- d = dict()   或者   d = {}
- dict(**kwargs)   使用name = value对初始化一个字典
- dict(iterable,**kwarg) 使用可迭代对象和name = value对构造字典，不过可迭代对象的元素必须是一个二元结构
  - d = dict(((1,'a'),(2,'b'))) 或者 d = dict(([1,'a'],[2,'b']))
- dict(mapping,**kwarg) 使用一个字典构建另一个字典
- d = {'a':10,'b':20,'c':None,'d':[1,2,3]}
- 类方法 dict.fromkeys(iterable,value)
  - d = dict.fromkeys(range(5))
  - d = dict.fromkeys(range(5),0)

- 键的类型：字典中的键可以是整数，但并非必须是整数。字典中的键可以是任何不可变的类型，如浮点数(实数) 、字符串或元组。
- 自动添加：即便是字典中原本没有的键，也可以给它赋值，这将在字典中创建一个新项。然而，如果不使用append或其他类似的方法，就不能给列表中没有的元素赋值。
- 成员资格：表达式k in d(其中d 是一个字典)查找的是键而不是值，而表达式v in l(其中l是一个列表)查找的是值而不是索引。这看似不太一致，但你习惯后就会觉得相当自然。毕竟如果字典包含指定的键，检查相应的值就很容易。

相比于检查列表是否包含指定的值，检查字典是否包含指定的键的效率更高。数据结构越大，效率差距就越大。

```python
# 创建与使用
phonebook = {'Alice': '2341', 'Beth': '9102', 'Cecil': '3258'}
# 字典由键及其相应的值组成，这种键值对称为项(item)。这里键为名字，而值为电话号码。每个键与其值之间都用
# 冒号(:)分隔，项之间用逗号分隔，而整个字典放在花括号内。空字典(没有任何项)用两个花括号表示。在字典(以
# 及其他映射类型)中，键必须是独一无二的，而字典中的值无需如此。

# 创建字典
l1 = list(range(5))
d = dict(l1)
# 这样是不行是，因为l1里都是单值，字典需要两个值。

d = dict(enumerate(l1))
# enumerate是给值加上索引的，这样也就是两个值了。

e = enumerate(l1)
print(type(e))
# e的类型枚举，是一个可迭代对象，可以使用list、set、tuple来包括这个类型，用什么方法包括这个类型，这个
# 类型就生成什么数据类型。也就是封装成什么就返回什么类型
for x in e:
    print(x)
# 返回的是二元组，在python命令行中执行要使用Ctrl + 回车

d = dict(e)
print(d)
# 这是一个类似生成器的东西，走到头就不会再走了，所以d返回的是{}。

e = enumerate(l1)
d = dict(e)
print(d)
# 这样就生成了一个字典

d = {('a',1)}
print(d)
# 这样是不可以的，因为结果不是key:value
c = dict(((1,'a'),))
print(c)
# 需要使用这种方式，dict中是一个元组，一般不用这种方式。((1,'a'),)表示一个元组，因为字典
# 需要两个值，所以定义成(1,'a')

# 使用dict函数创建
>>> items = [('name', 'Gumby'), ('age', 42)]
>>> d = dict(items)
>>> d
{'age': 42, 'name': 'Gumby'}
>>> d['name']
'Gumby'
# 使用函数dict从其他映射(如其他字典)或键值对序列创建字典。

>>> d = dict(name='Gumby', age=42)
>>> d
{'age': 42, 'name': 'Gumby'}
# 使用关键字实参来调用这个函数
# 也可使用一个映射实参来调用它，这将创建一个字典，其中包含指定映射中的所有项。像函数list、tuple和str一
# 样，如果调用这个函数时没有提供任何实参，将返回一个空字典。从映射创建字典时，如果该映射也是字典(毕竟字
# 典是Python中唯一的内置映射类型)，可不使用函数dict，而是使用字典方法copy。与list、tuple和str一样，
# dict其实根本就不是函数，而是一个类。

>>> x = []
>>> x[42] = 'Foobar'
Traceback (most recent call last):
File "<stdin>", line 1, in ?
IndexError: list assignment index out of range
# 将字符串'Foobar'赋给一个空列表中索引为42的元素。这是不可以的，因为没有这样的元素。要让这种操作可行，
# 初始化x时，必须使用[None] * 43之类的代码，而不能使用[]。
>>> x = {}
>>> x[42] = 'Foobar'
>>> x
{42: 'Foobar'}
# 将'Foobar'赋给一个空字典的键42，这样做一点问题都没有

people = {
    'Alice': {
            'phone': '2341',
            'addr': 'Foo drive 23'
    },
    'Beth': {
            'phone': '9102',
            'addr': 'Bar street 42'
    },
    'Cecil': {
            'phone': '3158',
            'addr': 'Baz avenue 90'
    }
}
# 一个将人名用作键的字典。每个人都用一个字典表示，字典包含键'phone'和'addr'，它们分别与电
# 话号码和地址相关联

labels = {
'phone': 'phone number',
'addr': 'address'
}
# 电话号码和地址的描述性标签，供打印输出时使用

name = input('Name: ')

request = input('Phone number (p) or address (a)? ')
# 要查找电话号码还是地址?


if request == 'p': key = 'phone'
if request == 'a': key = 'addr'
# 判断输入的是电话还是地址，如果是电话，key='phone'；如果是地址，key = 'addr'


if name in people: print("{}'s {} is {}.".format(name, labels[key], people[name][key]))
# 仅当名字是字典包含的键时才打印信息，打印的格式为某人的电话或地址是什么，format指定三个值
# 对应前面的三个中括号，第一个值是用户输入的name；第二个值是key，key可以是phone或addr，
# 在labels字典中查找对应的电话号码或地址；第三个值是使用name和key的值在people字典中查找
# 对应的值。
这个程序的运行情况类似于下面这样:
Name: Beth
Phone number (p) or address (a)? p
Beth's phone number is 9102.
```



### 类与函数调用

```python
l1 = list()
print(l1)
# 上面定义了l1是一个空列表

a = list
l2 = a
type(l2)
# 这样定义后，l2是一个类而不是列表。因为定义了a等于list类

l3 = a()
print(l3)
# l3被定义成了一个空列表，因为a等于list，所以这里l3 = a()就等于l3 = list()
# a = list就是a把list的名称拿走了，等于把名称对应的地址拿走了
# 函数也是一个对象，对象在内存中有一个地方放。这个地方就是函数的地址。列表放在内存中是一个对象，比如创建
# 一个空列表，这是一个对象，我们把空列表赋值给了l3，l3拿的就是这个空列表对象的地址。现在我们给出一个函数
# list，函数本身也是对象，一切皆对象。我们把这个对象给了a，就是把a覆盖掉了，这是把对象地址或叫对象引用
# 给了a，这时a与list也就是等价的了。如果写成list()就是调用了，只要加了括号就是调用了。也就是说，
# a = list是将对象地址给了a，a与list等价。a = list()是调用，将调用list函数的结果给了a，a被定义成了一个空列表

l4 = 5()
# 这样定义会提示"TypeError: 'int' object is not callable"，这说明int类型是不可以调用的。这就说明
# 了加括号是可以调用前面的对象或名称的，但前面的对象或名称需要是可调用的对象。list是一个写好的函数，这个
# 函数已经被当前环境加载过了，所以这个名称可以直接拿来用，这个名称指代的是list名称加载到内存中的位置，这
# 就是引用类型。真正的引用并不是我们写一个列表，把列表赋值给变量，这才是对它的引用，实际这个函数也是对
# 象，它也在内存中，你要引用它，也要通过它的名称才能引用，一加括号意义就变了，这个对象如果是可调用对象的
# 话，我们就调用它了。如果函数是一个可调用对象，调用时就会执行函数里的函数体了。之后的类也可以变成一个可
# 调用对象，比如把一个类实例化了，它就变成一个对象，这个对象后面也可以加括号，这就是python的技巧
```



### 字典元素的访问

- d[key]
  - 返回key对应的值value
  - key不存在抛出KeyError异常
- get(key[,default])
  - 返回key对应的值value
  - get方法不会抛异常，如果key不存在，返回缺省值，如果没有设置缺省值就返回None。如果存在，就显示其值。

```python
# 方法get为访问字典项提供了宽松的环境。通常，如果你试图访问字典中没有的项，将引发错误。
>>> d = {}
>>> print(d['name'])
Traceback (most recent call last):
File "<stdin>", line 1, in ?
KeyError: 'name'
# 访问没有的项，报错。

>>> print(d.get('name'))
None
# 使用get方法访问没有的项，不会报错。而是返回None。

>>> d.get('name', 'N/A')
'N/A'
# 可指定“默认”值，这样将返回你指定的值而不是None。

>>> d['name'] = 'Eric'
>>> d.get('name')
'Eric'
# 如果字典包含指定的键，get的作用将与普通字典查找相同。

people = {
    'Alice': {
            'phone': '2341',
            'addr': 'Foo drive 23'
    },
    'Beth': {
            'phone': '9102',
            'addr': 'Bar street 42'
    },
    'Cecil': {
            'phone': '3158',
            'addr': 'Baz avenue 90'
    }
}
labels = {
'phone': 'phone number',
'addr': 'address'
}
name = input('Name: ')

request = input('Phone number (p) or address (a)? ')

key = request 
if request == 'p': key = 'phone'
if request == 'a': key = 'addr'

person = people.get(name, {})
label = labels.get(key, key)
result = person.get(key, 'not available')
print("{}'s {} is {}.".format(name, label, result))
# 使用了方法get来访问“数据库”条目
下面是这个程序的运行情况。
Name: Gumby
Phone number (p) or address (a)? batting average
Gumby's batting average is not available.
```



- setdefault(key[,default])
  - 返回key对应的值value
  - key不存在，添加kv对，value为default，并返回default，如果default没有设置，缺省为None

```python
# 方法setdefault 有点像 get，因为它也获取与指定键相关联的值，但除此之外，setdefault还在字典不包含指定的键时，在字典中添加指定的键值对。
>>> d = {}
>>> d.setdefault('name', 'N/A')
'N/A'
>>> d
{'name': 'N/A'}
>>> d['name'] = 'Gumby'
>>> d.setdefault('name', 'N/A')  
# 这里不加'N/A'也可以，N/A是默认值，如果name没有对应值就返回此值
'Gumby'
>>> d
{'name': 'Gumby'}
# 指定的键不存在时， setdefault返回指定的值并相应地更新字典。如果指定的键存在，就返回其值，并保持字典
# 不变。与get一样，值是可选的；如果没有指定，默认为None。

>>> d = {}
>>> print(d.setdefault('name'))
None
>>> d
{'name': None}
```



### 字典增加和修改

- d[key] = value
  - 将key对应的值修改为value
  - **key不存在添加新的kv对**
- update([other]) -> None
  - 使用另一个字典的kv对更新本字典
  - key不存在，就添加
  - key存在，覆盖已经存在的key对应的值
  - 就地修改
    - d.update(red=1)
    - d.update((('red',2),))
    - d.update({'red':3})

```python
# 方法update使用一个字典中的项来更新另一个字典。
>>> d = {
... 'title': 'Python Web Site',
... 'url': 'http://www.python.org',
... 'changed': 'Mar 14 22:09:15 MET 2016'
... }
>>> x = {'title': 'Python Language Website'}
>>> d.update(x)
>>> d
{'url': 'http://www.python.org', 'changed':
'Mar 14 22:09:15 MET 2016', 'title': 'Python Language Website'}
# 对于通过参数提供的字典，将其项添加到当前字典中。如果当前字典包含键相同的项，就替换它。
```

- copy（返回一个新字典）

```python
# 方法copy返回一个新字典，其包含的键值对与原来的字典相同(这个方法执行的是浅复制，因为值本身是原件，而非副本)。
>>> x = {'username': 'admin', 'machines': ['foo', 'bar', 'baz']}
>>> y = x.copy()
>>> y['username'] = 'mlh'
>>> y['machines'].remove('bar')
>>> y
{'username': 'mlh', 'machines': ['foo', 'baz']}
>>> x
{'username': 'admin', 'machines': ['foo', 'baz']}
# 当替换副本中的值时，原件不受影响。然而，如果修改副本中的值(就地修改而不是替换)，原件也将发生变化，因为
# 原件指向的也是被修改的值

>>> from copy import deepcopy
>>> d = {}
>>> d['names'] = ['Alfred', 'Bertrand']
>>> c = d.copy()
>>> dc = deepcopy(d)
>>> d['names'].append('Clive')
>>> c
{'names': ['Alfred', 'Bertrand', 'Clive']}
>>> dc
{'names': ['Alfred', 'Bertrand']}
# 深复制，即同时复制值及其包含的所有值，等等。为此，可使用模块copy中的函数deepcopy。c和dc的值都是从d
# 复制过来的，只是c是浅复制，dc是深复制，在d中追加值后，c的值也有变化，dc没有。
```

- fromkeys（创建新字典）

```python
# fromkeys创建一个新字典，其中包含指定的键，且每个键对应的值都是None。
>>> {}.fromkeys(['name', 'age'])
{'age': None, 'name': None}
# 首先创建了一个空字典，再对其调用方法fromkeys来创建另一个字典，这显得有点多余。

>>> dict.fromkeys(['name', 'age'])
{'age': None, 'name': None}
# 直接对dict调用方法fromkeys。

>>> dict.fromkeys(['name', 'age'], '(unknown)')
{'age': '(unknown)', 'name': '(unknown)'}
# 不使用默认值None，可提供特定的值。
```



### 字典删除

- pop(key[,default])

  - key存在，移除它，并返回它的value
  - key不存在，返回给定的default
  - default未设置，key不存在则抛出KeyError异常

```python
# 方法pop可用于获取与指定键相关联的值，并将该键值对从字典中删除。
>>> d = {'x': 1, 'y': 2}
>>> d.pop('x')
1
>>> d
{'y': 2}
```



- popitem()

  - 移除并返回一个任意的键值对
  - 字典为empty，抛出KeyError异常

```python
# 方法popitem类似于list.pop ，但 list.pop弹出列表中的最后一个元素，而popitem随机地弹出一个字典项，
# 因为字典项的顺序是不确定的，没有“最后一个元素”的概念。
>>> d = {'url': 'http://www.python.org', 'spam': 0, 'title': 'Python Web Site'}
>>> d.popitem()
('url', 'http://www.python.org')
>>> d
{'spam': 0, 'title': 'Python Web Site'}
# 虽然popitem 类似于列表方法pop，但字典没有与append(它在列表末尾添加一个元素)对应的方法。这是因为字典
# 是无序的，类似的方法毫无意义。
```



- clear()

  - 清空字典
  - 就地修改

```python
# clear（删除所有字典项）
>>> d = {}
>>> d['name'] = 'Gumby'
>>> d['age'] = 42
>>> d
{'age': 42, 'name': 'Gumby'}
>>> returned_value = d.clear()
>>> d
{}
>>> print(returned_value)
None
# 这种操作是就地执行的(就像list.sort一样)，因此什么都不返回(或者说返回None)。

>>> x = {}
>>> y = x
>>> x['key'] = 'value'
>>> y
{'key': 'value'}
>>> x = {}
>>> y
{'key': 'value'}
# x和y最初都指向同一个字典。通过将一个空字典赋给x来“清空”它。这对y没有任何影响，它依然指向原来的字典。

>>> x = {}
>>> y = x
>>> x['key'] = 'value'
>>> y
{'key': 'value'}
>>> x.clear()
>>> y
{}
# 要删除原来字典的所有元素，必须使用clear。如果这样做，y也将是空的
```



- del语句

```python
a = True
b = [6]
d = {'a':1,'b':b,'c':[1,3,5]}
del a
del d['c']   # 删除了'c'键及其值
del b[0]   # 变成了空列表
c = b
del c
del b
b = d['b']
# del d['c']看着像删除了一个对象，本质上减少了一个对象的引用，del实际上删除的是名称，而不是对象
```





### 字典遍历

- 遍历key，方法keys返回一个字典视图，其中包含指定字典中的键。

```python
Method：
for k in d:
	print(k)

for k in d.keys():
	print(k)
# 下面这种方法较常用
```



- 遍历value


```python
Method：
for k in d:
	print(d[k])

for k in d.keys():
	print(d.get(k))

for v in d.values():
	print(v)
    
# 方法values返回一个由字典中的值组成的字典视图。不同于方法keys，方法values返回的视图可能包含重复的值。
>>> d = {}
>>> d[1] = 1
>>> d[2] = 2
>>> d[3] = 3
>>> d[4] = 1
>>> d           
{1: 1, 2: 2, 3: 3, 4: 4}
>>> d.values()
dict_values([1, 2, 3, 1])
```



- 遍历item，即kv对

```python
Method:
for item in d.items():
	print(item)

for item in d.items():
	print(item[0],item[1])

for k,v in d.items():
	print(k,v)

for k,_ in d.items():
	print(k)

for _,v in d.items():
	print(v)

# 方法items返回一个包含所有字典项的列表，其中每个元素都为(key, value)的形式。
>>> d = {'title': 'Python Web Site', 'url': 'http://www.python.org', 'spam': 0}
>>> d.items()
dict_items([('url', 'http://www.python.org'), ('spam', 0), ('title', 'Python Web Site')])
# 字典项在列表中的排列顺序不确定。返回值属于一种名为字典视图的特殊类型。字典视图可用于迭代

>>> it = d.items()
>>> len(it)
3
>>> ('spam', 0) in it
True
# 还可确定其长度以及对其执行成员资格检查。如下 ：

>>> d['spam'] = 1
>>> ('spam', 0) in it
False
>>> d['spam'] = 0
>>> ('spam', 0) in it
True
# 视图的一个优点是不复制，它们始终是底层字典的反映，即便你修改了底层字典亦如此

>>> list(d.items())
[('spam', 0), ('title', 'Python Web Site'), ('url', 'http://www.python.org')]
# 将字典项复制到列表中
```



- 总结
  - Python3中，keys、values、items方法返回一个类似一个生成器的可迭代对象，不会把函数的返回结果复制到内存中
    - Dictionary view对象
    - 字典的entry的动态的视图，字典变化，视图将反映出这些变化
  - Python2中，上面的方法会返回一个新的列表，占据新的内存空间。所以Python2建议使用iterkeys、itervalues、iteritems版本，返回一个迭代器，而不是一个copy



### 字典遍历和移除

- 如何在遍历的时候移除元素

```python
错误的做法
d = dict(a=1,b=2,c='abc')
for k,v in d.items():
	d.pop(k)   # 异常
    
while len(d):   # 相当于清空，不如直接clear()
	print(d.popitem())

正确的做法
d = dict(a=1,b=2,c='abc')
keys = []
for k,v in d.items():
	if isinstance(v,str):
		keys.append(k)
        
for k in keys:
	d.pop(k)
print(d)
```


### 字典的key

- key的要求和set的元素要求一致
  - set的元素可以看做key，set可以看做dict的简化版
  - hashable可哈希才可以作为key，可以使用hash()测试。可hash的类型是不可变的，可变类型是不可hash的

```python
d = {1:0,2.0:3,"abc":None,('hello','world','python'):"string",b'abc':'135'}
# 同理，这里要用{}大括号，不能用dict()，不然会报错。个人还是认为dict()是转换类型的，{}是定义的
```




### defaultdict

- collections.defaultdict([default_factory[,...]])

  - 第一个参数是default_factory，缺省是None，它提供一个初始化函数。当key不存在的时候，会调用这个工厂函数来生成key对应的value


```python
例：
import random
d1 = {}
for k in 'abcdef':
	for i in range(random.randint(1,5)):
		if k not in d1.keys():
			d1[k] = []
		d1[k].append(i)
print(d1)

from collections import defaultdict
import random
d1 = defaultdict(list)
for k in 'abcdef':
	for i in range(random.randint(1,5)):
		d1[k].append(i)
print(d1)


# defaultdict

from collections import defaultdict
d1 = {}
d2 = defaultdict(list)
# list放在这里相当于传了一个工厂方法，要求是一个初始化函数，这就是以后的初始化函数default_factory，初
# 始化函数什么时候用，只有在key不存在的时候，会调用这个工厂函数来生成key对应的value，也就是生成一个缺
# 省值，用来给这个没有value的key赋值，这样就可以凑上一个kv对，也就可以加入字典当中了。
for k in "abcde":    # 迭代a到e，这里要创建的是key
    for v in range(5):     # 迭代0到4，这里要生成value
        if k not in d1.keys():    
# d1.keys()开始是空的，第一次的时候找不到上面循环的k是a，只有在每次循环的第一次key不存在时会进入这里
            d1[k] = []   # 这里表示，如果上面判断k不存在，就给d1[k]初始化一个空列表
        d1[k].append(v)   
        # 这里把0-4依次追加到d1[k]中，第一次d1[a].append[0]，第二次d1[a].append[1]
print(d1)   # 最后打印出来，这是第一种方式
输出：
{'a': [0, 1, 2, 3, 4], 'b': [0, 1, 2, 3, 4], 'c': [0, 1, 2, 3, 4], 'd': [0, 1, 2, 3, 4], 'e': [0, 1, 2, 3, 4]}
    
    
for k in 'mnopq':
    for v in range(3):   # 这里是3是为了说明v与上面的k的数量可以不一样 
        d2[k].append(v)   
# 这里不做判断，直接赋值。是为了说明上面的k(key)如果不存在，就调用上面定义的d2 = defaultdict(list)
# 中的list，这时就是在做创建空列表的动作，也就是list()，因为上面已经说明了当key不存在时调用工厂函数生
# 成key对应的value，并且也定义了d2等于这个工厂函数d2[k]就相当于测试一下这个k是否存在，不存在就调用工
# 厂函数。之后也可以自定义函数，并调用。
# 这就相当于替换了d1[k] = []中后面的中括号
# 个人想，如果将list改成tuple是否可以，也许不行，因为tuple是不可变的，没有append这样的方法，那么改成
# set是不是就可以了？测试发现，当使用tuple或set时会提示没有append属性
print(d2)
输出：
defaultdict(<class 'list'>, {'m': [0, 1, 2], 'n': [0, 1, 2], 'o': [0, 1, 2], 'p': [0, 1, 2], 'q': [0, 1, 2]})
```



### OrderedDict

- collections.OrderedDict([items])

  - key并不是按照加入的顺序排列，可以使用OrderedDict记录顺序

- 有序字典可以记录元素插入的顺序，打印的时候也是按照这个顺序输出打印
- 3.6版本的Python的字典就是记录key插入的顺序（IPython不一定有效果）
- 应用场景
  - 假如使用字典记录了N个产品，这些产品使用ID由小到大加入到字典中
  - 除了使用字典检索的遍历，有时候需要取出ID，但是希望是按照输入的顺序，因为输入顺序是有序的
  - 否则还需要重新把遍历到的值排序

```python
from collections import OrderedDict
import random
d = {'banana':3,'apple':4,'pear':1,'orange':2}
print(d)
keys = list(d.keys())
random.shuffle(keys)
print(keys)
od = OrderedDict()
for key in keys:
	od[key] = d[key]
print(od)
print(od.keys())

# OrderedDict顺序的字典，这里指key要按顺序而不是值输出。key的顺序应该和我们放入的顺序是一样的
d = {}
d['a'] = 1
d['b'] = 2
d[1] = 3
print(d)
# 这里显示的d的值应该是按hash值排列的
for k in d:
    print(k)
输出：
{'a': 1, 'b': 2, 1: 3}
a
b
1

from collections import OrderedDict
import random
d = {'banana':3,'apple':4,'pear':1,'orange':2}
print(d)
keys = list(d.keys())
random.shuffle(keys)   # 用shuffle把keys列表打乱
od = OrderedDict()
for key in keys:
    od[key] = d[key]   # 创建od的kv对，这里就是od['pear'] = 1这样的形式
    
print(od)
print(od.keys())

# 这种方法可能在ipython中不再起作用，因为显示的值与输入的顺序是一样的。3.5版本之前是解决不了这个问题
# 的。或者是在jupeter中就是可以按顺序显示的？需要在python命令行中再测试一下。视频中测试的3.6.1版本
# 时，发现和这里的显示是一样的，按顺序显示。所以最好在python环境中测试，也就是在命令行输入python，之后
# 执行上面的命令测试。之前视频中用ipython测试会打乱顺序
输出：
{'banana': 3, 'apple': 4, 'pear': 1, 'orange': 2}
OrderedDict([('banana', 3), ('pear', 1), ('orange', 2), ('apple', 4)])
odict_keys(['banana', 'pear', 'orange', 'apple'])
```




