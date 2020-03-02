---
title: python基础学习-序列化和反序列化
date: 2020-01-09 16:50:48
tags: 序列化和反序列化
categories: python
---

### 为什么要序列化

内存中的字典、列表、集合以及各种对象，如何保存到一个文件中？

如果是自己定义的类的实例，如何保存到一个文件中？

如何从文件中读取数据，并让它们在内存中再次变成自己对应的类的实例？

要设计一套协议，按照某种规则，把内存中数据保存到文件中。文件是一个字节序列，所以必须把数据转换成字节序列，输出到文件。这就是序列化。反之，从文件的字节序列恢复到内存，就是反序列化。



### 定义 

serialization 序列化

将内存中对象存储下来，把它变成一个个字节。 -> 二进制

deserialization 反序列化

将文件的一个个字节恢复成内存中对象。 <- 二进制

序列化保存到文件就是持久化。

可以将数据序列化后持久化，或者网络传输；也可以将从文件中或者网络接收到的字节序列反序列化。

Python提供了pickle库



### pickle库

Python中的序列化、反序列化模块。

dumps 对象序列化为bytes对象

dump 对象序列化到文件对象，就是存入文件

loads 从bytes对象反序列化

load 对象反序列化，从文件读取数据

```python
import pickle

# 文件序列化和反序列化
filename = 'o:/set'

d = {'a':1,'b':'abc','c':[1,2,3]}
l = list('123')
i = 99

with open(filename,'wb') as f:
    pickle.dump(d,f)   # 格式是把哪些内容写入哪个文件
    pickle.dump(l,f)
    pickle.dump(i,f)  # 这是追加写入的？
    
with open(filename,'rb') as f:
    print(f.read(),f.seek(0))  # 读取所有内容，并将指针调整到最开始的位置
    for _ in range(3):
        x = pickle.load(f)   # 反序列化f中的内容并打印出来
        print(type(x),x)
```

```python
import pickle
# 对象序列化
class AA:
    tttt = 'ABC'
    def show(self):
        print('abc')
        
a1 = AA()

sr = pickle.dumps(a1)
print('sr={}'.format(sr))   # AA

a2 = pickle.loads(sr)
print(a2.tttt)
a2.show()
```

上面的例子中，其实就保存了一个类名，因为所有的其他东西都是类定义的东西，是不变的，所以只序列化一个AA类名。反序列化的时候找到类就可以恢复一个对象。

```python
import pickle

# 定义类
class AAA:
    def __init__(self):
        self.tttt = 'abc'
        
# 创建AA类的实例
a1 = AAA()

# 序列化
ser = pickle.dumps(a1)
print('ser={}'.format(ser))

# 反序列化
a2 = pickle.loads(ser)
print(a2,type(a2))
print(a2.tttt)
print(id(a1),id(a2))
```

可以看出这回除了必须保存的AAA，还序列化了tttt和abc，因为这是每一个对象自己的属性，每一个对象不一样的，所以这些数据需要序列化。



### 序列化、反序列化实验

定义类AAA，并序列化到文件

```python
import pickle
# 实验
class AAA:
    def __init__(self):
        self.tttt = 'abc'
        
aaa = AAA()
sr = pickle.dumps(aaa)
print(len(sr))

file = 'o:/ser'
with open(file,'wb') as f:
    pickle.dump(aaa,f)
```

将产生的序列化文件发送到其他节点上。增加一个x.py文件，内容如下。最后执行这个脚本 `python x.py`

```python
import pickle

with open('ser','rb') as f:
    a = pickle.load(f)   # 异常
```

会抛出异常 `AttributeError: Can't get attribute 'AAA' on <module '__main__' from 't.py'>`。

这个异常实际上是找不到类AAA的定义，增加类定义即可解决。

反序列化的时候要找到AAA类的定义，才能成功。否则就会抛出异常。

可以这样理解：反序列化的时候，类是模子，二进制序列就是铁水。

```python
import pickle

class AAA:
    def show(self):
        print('xyz')
        
with open('ser','rb') as f:
    a = pickle.load(f)
    print(a)
    a.show()
```

这里定义了类AAA，并且上面的代码也能成功的执行。

注意：这里的AAA定义和原来完全不同了。

因此，序列化、反序列化必须保证使用同一套类的定义，否则会带来不可预料的结果。



### 序列化应用

一般来说，本地序列化的情况，应用较少。大多数场景都应用在网络传输中。将数据序列化后通过网络传输到远程节点，远程服务器上的服务将接收到的数据反序列化后，就可以使用了。但是，要注意一点，远程接收端，反序列化时必须有对应的数据类型，否则就会报错。尤其是自定义类，必须远程得有一致的定义。现在，大多数项目，都不是单机的，也不是单服务的。需要通过网络将数据传送到其他节点上去，这就需要大量的序列化、反序列化过程。但是，问题是，Python程序之间还可以都使用pickle解决序列化、反序列化，如果是跨平台、跨语言、跨协议，pickle就不太适合了，就需要公共的协议。例如XML、Json、Protocol Buffer等。不同的协议，效率不同、学习曲线不同，适用不同场景，要根据不同的情况分析选型。



### Json

JSON(JavaScript Object Notation，JS对象标记)是一种轻量级的数据交换格式。它基于ECMAScript（w3c制定的JS规范）的一个子集，采用完全独立于编程语言的文本格式来存储和表示数据。

http://json.org



### Json的数据类型

- 值

***双引号***引起来的字符串，数值，true和false，null，对象，数组，这些都是值

![](/images/python序列化与反序列化/json1.png)

- 字符串

由双引号包围起来的任意字符的组合，可以有转义字符。



- 数值

有正负，有整数、浮点数。



- 对象

无序的键值对的集合

格式：`{key1:value1,...,keyn:valuen}`

key必须是一个字符串，需要双引号包围这个字符串。

value可以是任意合法的值

![](/images/python序列化与反序列化/json2.png)



- 数组

有序的值的集合

格式：`[val1,...,valn]`

![](/images/python序列化与反序列化/json3.png)



#### 实例

```python
{
    "person":[
      {
         "name":"tom",
         "age":18
      },
      {
         "name":"jerry",
         "age":16
      }
    ],
    "total":2
}
```



### ***Json模块***

#### Python与Json

Python支持少量内建数据类型到Json类型的转换。

| Python类型 | Json类型 |
| ---------- | -------- |
| True       | true     |
| False      | false    |
| None       | null     |
| str        | string   |
| int        | integer  |
| float      | float    |
| list       | array    |
| dict       | object   |



#### 常用方法

| Python类型 | Json类型                 |
| ---------- | ------------------------ |
| dumps      | json编码                 |
| dump       | json编码并存入文件       |
| loads      | json解码                 |
| load       | json解码，从文件读取数据 |

```python
import json
d = {'name':'Tom','age':20,'interest':['music','movie']}
j = json.dumps(d)
print(j)   # 请注意引号的变化

d1 = json.loads(j)
print(d1)
```

一般json编码的数据很少落地，数据都是通过网络传输。传输的时候，要考虑压缩它。本质上来说它就是个文本，就是个字符串。json很简单，几乎语言编程都支持Json，所以应用范围十分广泛。



### MessagePack

MessagePack是一个基于二进制高效的对象序列化类库，可用于跨语言通信。它可以像JSON那样，在许多种语言之间交换结构对象。但是它比JSON更快速也更轻巧。支持Python、Ruby、Java、C/C++等众多语言。宣称比Google Protocol还要快4倍。兼容json和pickle。

![](/images/python序列化与反序列化/messagepack1.png)

```python
# 72 bytes
{"person":[{"name":"tom","age":18},{"name":"jerry","age":16}],"total":2}

# 48 bytes
# 82 a6 70 65 72 73 6f 6e 92 82 a4 6e 61 6d 65 a3 74 6f 6d a3 61 67 65 12 82 a4 64
61 6d 65 a5 6a 65 72 72 79 a3 61 67 65 10 a5 74 6f 74 61 6c 02
```

可以看出，大大的节约了空间。



#### 安装

`pip install msgpack-python`



#### 常用方法

packb序列化对象。提供了dumps来兼容pickle和json。

unpackb 反序列化对象。提供了loads来兼容。

pack 序列化对象保存到文件对象。提供了dump来兼容。

unpack 反序列化对象保存到文件对象。提供了load来兼容。

```python
import msgpack
import json

# 源数据
d = {'person':[{'name':'tom','age':18},{'name':'jerry','age':16}],'total':2}

j = json.dumps(d)
m = msgpack.dumps(d)   # 本质上就是packb

print("json = {},msgpack = {}".format(len(j),len(m)))
print(j.encode(),len(j.encode()))   # json和msgpack的比较
print(m,len(m))

u = msgpack.unpackb(m)
print(type(u),u)

u = msgpack.unpackb(m, encoding='utf8')
print(type(u),u)
```

MessagePack简单易用，高效压缩，支持语言丰富。

所以，用它序列化也是一种很好的选择。