---
title: python基础学习-字典
date: 2019-03-26 09:36:23
tags: 字典
categories: python
---

### 概念

> 映射(mapping)是一种可通过名称来访问其各个值的数据结构。字典是Python中唯一的内置映射类型，其中的值不按顺序排列，而是存储在键下。键可能是数、字符串或元组。
>
> 字典(日常生活中的字典和Python字典)旨在让你能够轻松地找到特定的单词(键)，以获悉其定义(值) 。
>
> Python字典的用途：
>
> * 表示棋盘的状态，其中每个键都是由坐标组成的元组；
> * 存储文件修改时间，其中的键为文件名；
> * 数字电话/地址簿。

```python
>>> names = ['Alice', 'Beth', 'Cecil', 'Dee-Dee', 'Earl']
>>> numbers = ['2341', '9102', '3158', '0142', '5551']
>>> numbers[names.index('Cecil')]
'3158'
# 这可行，但不太实用。
```



### 创建与使用

```python
phonebook = {'Alice': '2341', 'Beth': '9102', 'Cecil': '3258'}
# 字典由键及其相应的值组成，这种键值对称为项(item)。这里键为名字，而值为电话号码。每个键与其值之间都用冒号(:)分隔，项之间用逗号分隔，而整个字典放在花括号内。空字典(没有任何项)用两个花括号表示。
#  在字典(以及其他映射类型)中，键必须是独一无二的，而字典中的值无需如此。
```



#### dict函数（创建字典）

```python
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
# 也可使用一个映射实参来调用它，这将创建一个字典，其中包含指定映射中的所有项。像函数list、tuple和 str 一样，如果调用这个函数时没有提供任何实参，将返回一个空字典。从映射创建字典时，如果该映射也是字典(毕竟字典是Python中唯一的内置映射类型)，可不使用函数dict，而是使用字典方法copy
# 与list、tuple和str一样，dict其实根本就不是函数，而是一个类。
```



#### 基本的字典操作

```python
len(d)
# 返回字典d 包含的项(键值对)数。
d[k]
# 返回与键k相关联的值。
d[k] = v
# 将值v关联到键k。
del d[k]
# 删除键为k的项。
k in d
# 检查字典d 是否包含键为k的项。
```

> * 键的类型：字典中的键可以是整数，但并非必须是整数。字典中的键可以是任何不可变的类型，如浮点数(实数) 、字符串或元组。
> * 自动添加：即便是字典中原本没有的键，也可以给它赋值，这将在字典中创建一个新项。然而，如果不使用append或其他类似的方法，就不能给列表中没有的元素赋值。
> * 成员资格：表达式k in d(其中d 是一个字典)查找的是键而不是值，而表达式v in l(其中l是一个列表)查找的是值而不是索引。这看似不太一致，但你习惯后就会觉得相当自然。毕竟如果字典包含指定的键，检查相应的值就很容易。
>
> 相比于检查列表是否包含指定的值，检查字典是否包含指定的键的效率更高。数据结构越大，效率差距就越大。

```python
>>> x = []
>>> x[42] = 'Foobar'
Traceback (most recent call last):
File "<stdin>", line 1, in ?
IndexError: list assignment index out of range
# 将字符串'Foobar'赋给一个空列表中索引为42的元素。这是不可以的，因为没有这样的元素。要让这种操作可行，初始化x时，必须使用[None] * 43之类的代码，而不能使用[]。
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
# 一个将人名用作键的字典。每个人都用一个字典表示，字典包含键'phone'和'addr'，它们分别与电话号码和地址相关联

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
# 仅当名字是字典包含的键时才打印信息，打印的格式为某人的电话或地址是什么，format指定三个值对应前面的三个中括号，第一个值是用户输入的name；第二个值是key，key可以是phone或addr，在labels字典中查找对应的电话号码或地址；第三个值是使用name和key的值在people字典中查找对应的值。
这个程序的运行情况类似于下面这样:
Name: Beth
Phone number (p) or address (a)? p
Beth's phone number is 9102.
```



#### 将字符串格式设置功能用于字典

```python
>> phonebook
{'Beth': '9102', 'Alice': '2341', 'Cecil': '3258'}
>>> "Cecil's phone number is {Cecil}.".format_map(phonebook)
"Cecil's phone number is 3258."
# 可在字典中包含各种信息，这样只需在格式字符串中提取所需的信息即可。使用format_map来指出你将通过一个映射来提供所需的信息。可使用字符串格式设置功能来设置值的格式，这些值是作为命名或非命名参数提供给方法format的。

>>> template = '''<html>
... <head><title>{title}</title></head>
... <body>
... <h1>{title}</h1>
... <p>{text}</p>
... </body>'''
>>> data = {'title': 'My Home Page', 'text': 'Welcome to my home page!'}
>>> print(template.format_map(data))
<html>
<head><title>My Home Page</title></head>
<body>
<h1>My Home Page</h1>
<p>Welcome to my home page!</p>
</body>
# 将data字典的值代入template中。像这样使用字典时，可指定任意数量的转换说明符，条件是所有的字段名都是包含在字典中的键。
```



#### 字典方法

##### clear（删除所有字典项）

```python
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
# 要删除原来字典的所有元素，必须使用clear。如果这样做， y也将是空的
```



##### copy（返回一个新字典）

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
# 当替换副本中的值时，原件不受影响。然而，如果修改副本中的值(就地修改而不是替换)，原件也将发生变化，因为原件指向的也是被修改的值

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
# 深复制，即同时复制值及其包含的所有值，等等。为此，可使用模块copy中的函数deepcopy。c和dc的值都是从d复制过来的，只是c是浅复制，dc是深复制，在d中追加值后，c的值也有变化，dc没有。
```



##### fromkeys（创建新字典）

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



##### get（访问字典项）

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



##### items（返回列表）

```python
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



##### keys（返回字典视图）

> 方法keys返回一个字典视图，其中包含指定字典中的键。



##### pop（删除键值对）

```python
# 方法pop可用于获取与指定键相关联的值，并将该键值对从字典中删除。
>>> d = {'x': 1, 'y': 2}
>>> d.pop('x')
1
>>> d
{'y': 2}
```



##### popitem （删除随机键值对）

```python
# 方法popitem类似于list.pop ，但 list.pop弹出列表中的最后一个元素，而popitem随机地弹出一个字典项，因为字典项的顺序是不确定的，没有“最后一个元素”的概念。
>>> d = {'url': 'http://www.python.org', 'spam': 0, 'title': 'Python Web Site'}
>>> d.popitem()
('url', 'http://www.python.org')
>>> d
{'spam': 0, 'title': 'Python Web Site'}
# 虽然popitem 类似于列表方法pop，但字典没有与append(它在列表末尾添加一个元素)对应的方法。这是因为字典是无序的，类似的方法毫无意义。
```



##### setdefault（获取关联的值）

```python
# 方法setdefault 有点像 get，因为它也获取与指定键相关联的值，但除此之外，setdefault还在字典不包含指定的键时，在字典中添加指定的键值对。
>>> d = {}
>>> d.setdefault('name', 'N/A')
'N/A'
>>> d
{'name': 'N/A'}
>>> d['name'] = 'Gumby'
>>> d.setdefault('name', 'N/A')  # 这里不加'N/A'也可以，N/A是默认值，没有值就返回此值？
'Gumby'
>>> d
{'name': 'Gumby'}
# 指定的键不存在时， setdefault返回指定的值并相应地更新字典。如果指定的键存在，就返回其值，并保持字典不变。与 get一样，值是可选的；如果没有指定，默认为None 。

>>> d = {}
>>> print(d.setdefault('name'))
None
>>> d
{'name': None}
```



##### update（更新字典）

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



##### values（返回字典视图）

```python
# 方法values返回一个由字典中的值组成的字典视图。不同于方法keys，方法 values返回的视图可能包含重复的值。
>>> d = {}
>>> d[1] = 1
>>> d[2] = 2
>>> d[3] = 3
>>> d[4] = 1
>>> d.values()
dict_values([1, 2, 3, 1])
```

