---
title: python基础学习-内建函数迭代器
date: 2019-10-11 13:48:54
tags: 内建函数迭代器
categories: python
---

### 内建函数

- 标识 id(*object*)

  - 返回对象的“标识值”。该值是一个整数，在此对象的生命周期中保证是唯一且恒定的。两个生命期不重叠的对象可能具有相同的`id()`值。CPython返回内存地址(**CPython implementation detail:** This is the address of the object in memory.)。

- 哈希 hash(*object*)

  - 返回该对象的哈希值（如果它有的话）。哈希值是整数。它们在字典查找元素时用来快速比较字典的键。相同大小的数字变量有相同的哈希值

- 类型 type(*object*)\type(*name*, *bases*, *dict*)

  - 返回对象的类型。传入一个参数时，返回 *object* 的类型。 返回值是一个 type 对象，通常与 `object.__class__`所返回的对象相同。

    推荐使用`isinstance()`内置函数来检测对象的类型，因为它会考虑子类的情况。

    传入三个参数时，返回一个新的 type 对象。 这在本质上是`class`语句的一种动态形式。 *name* 字符串即类名并且会成为`__name__`属性；*bases* 元组列出基类并且会成为`__bases__`属性；而 *dict* 字典为包含类主体定义的命名空间并且会被复制到一个标准字典成为 `__dict__`属性。 例如，下面两条语句会创建相同的`type`对象：

    ```python
    >>> class X:
    ...     a = 1
    ...
    >>> X = type('X', (object,), dict(a=1))
    ```

    在 3.6 版更改:`type`的子类如果未重载 `type.__new__`，将不再能使用一个参数的形式来获取对象的类型。

- 类型转换

  - float()、int()、bin()、hex()、oct()、bool()、list()、tuple()、dict()、set()、complex()、bytes()、bytearray()

- 输入 input([prompt])

  - 如果存在 *prompt* 实参，则将其写入标准输出，末尾不带换行符。接下来，该函数从输入中读取一行，将其转换为字符串（除了末尾的换行符）并返回。当读取到 EOF 时，则触发 `EOFError`。例如:

    ```
    >>> s = input('--> ')  
    --> Monty Python's Flying Circus
    >>> s  
    "Monty Python's Flying Circus"
    ```

    如果加载了`readline`模块，`input()`将使用它来提供复杂的行编辑和历史记录功能。

- 打印 print(*objects,sep='',end='\n',file=sys.stdout,flush=False)

  - 打印输出，默认使用空格分割、换行结尾，输出到控制台。将 *objects* 打印到 *file* 指定的文本流，以 *sep* 分隔并在末尾加上 *end*。 *sep*, *end*, *file* 和 *flush* 如果存在，它们必须以关键字参数的形式给出。

    所有非关键字参数都会被转换为字符串，就像是执行了`str()`一样，并会被写入到流，以 *sep* 且在末尾加上 *end*。 *sep* 和 *end* 都必须为字符串；它们也可以为 `None`，这意味着使用默认值。 如果没有给出 *objects*，则`print()`将只写入 *end*。

    *file* 参数必须是一个具有 `write(string)` 方法的对象；如果参数不存在或为 `None`，则将使用`sys.stdout`。 由于要打印的参数会被转换为文本字符串，因此 `print()`不能用于二进制模式的文件对象。 对于这些对象，应改用 `file.write(...)`。

    输出是否被缓存通常决定于 *file*，但如果 *flush* 关键字参数为真值，流会被强制刷新。

- 对象长度 len(s)

  - 返回对象的长度（元素个数）。实参可以是序列（如 string、bytes、tuple、list 或 range 等）或集合（如 dictionary、set 或 frozen set 等）。

- isinstance(obj,class_or_tuple)

  - 判断对象obj是否属于某种类型或者元组中列出的某个类型。如果 *object* 实参是 *classinfo* 实参的实例，或者是（直接、间接或虚拟）子类的实例，则返回 true。如果 *object* 不是给定类型的对象，函数始终返回 false。如果 *classinfo* 是对象类型（或多个递归元组）的元组，如果 *object* 是其中的任何一个的实例则返回 true。 如果 *classinfo* 既不是类型，也不是类型元组或类型的递归元组，那么会触发`TypeError`异常。
  - isinstance(True,int)

- issubclass(class,class_or_tuple)

  - 判断类型cls是否是某种类型的子类或元组中列出的某个类型的子类。如果 *class* 是 *classinfo* 的子类（直接、间接或虚拟的），则返回 true。*classinfo* 可以是类对象的元组，此时 *classinfo* 中的每个元素都会被检查。其他情况，会触发`TypeError`异常。
  - issubclass(bool,int)

- 绝对值abs(x)，x为数值

- 最大值max()，最小值min()

  - 返回可迭代对象中最大或最小值
  - 返回多个参数中最大或最小值

- round(x) 四舍六入五取偶，round(-0.5)

- pow(x,y) 等价于 x ** y

- range(stop) 从0开始到stop-1的可迭代对象；range(start, stop[,step]) 从start开始到stop-1结束步长为step的可迭代对象

- divmod(x,y) 等价于 tuple(x//y,x%y)

- sum(iterable[,start]) 对可迭代对象的所有数值元素求和

  - sum(range(1,100,2))

- chr(i) 给一个一定范围的整数返回对应的字符

  - chr(97)  chr(20012)

- ord(c) 返回字符对应的整数

  - ord('a')  ord('中')

- str()、repr()、ascii()

- sorted(iterable\[,key\]\[,reverse\]) 排序

  - 返回一个新的列表，默认升序
  - reverse是反转
```python
sorted([1,3,5])
sorted([1,3,5],reverse=True)
sorted({'c':1,'b':2,'a':1})
```

- 翻转 reversed(seq)

  - 返回一个翻转元素的迭代器


```python
list(reversed("13579"))
{ reversed((2,4))}  # 有几个元素？
for x in reversed(['c','b','a']):
	print(x)
reversed(sorted({1,5,9}))
```



- 枚举 enumerate(seq,start=0)

  - 迭代一个序列，返回索引数字和元素构成的二元组
  - start表示索引开始的数字，默认是0

```python
for x in enumerate([2,4,6,8]):
	print(x)
  
for x in enumerate("abcde"):
	print(x,end=" ")
    
for k,v in enumerate(range(5)):   # k,v是在解构
    print(k,v,end="\t")
输出：
0 0	  1 1	2 2	  3 3	4 4

for k,v in enumerate("mnopq",start=10):   # k,v是在解构
    print(k,v,end="\t")
输出：
10 m	11 n	12 o	13 p	14 q	
```


- 迭代器和取元素 iter(iterable)、next(iterator[,default])
  - iter将一个可迭代对象封装成一个迭代器
  - next对一个迭代器取下一个元素。如果全部元素都取过了，再次next会抛StopIteration异常


```python
it = iter(range(5))
next(it)

it = reversed([1,3,5])
next(it)
```



- 拉链函数zip(*iterables)

  - 像拉链一样,把多个可迭代对象合并在一起,返回一个迭代器
  - 将每次从不同对象中取到的元素合并成一个元组
```python
list(zip(range(10),range(10)))
list(zip(range(10),range(10),range(5),range(10)))
dict(zip(range(10),range(10)))
{str(x):y for x,y in zip(range(10),range(10))}
```



### 可迭代对象

- 可迭代对象

  - 能够通过迭代一次次返回不同的元素的对象。
    - 所谓相同，不是指值是否相同，而是元素在容器中是否是同一个，例如列表中值可以重复的，['a','a']，虽然这个列表有2个元素，值一样，但是两个'a'是不同的元素
  - 可以迭代，但是未必有序，未必可索引
  - 可迭代对象有：list、tuple、string、bytes、bytearray、range、set、dict、生成器等
  - 可以使用成员操作符in、not in、in本质上就是在遍历对象


```python
3 in range(10)
3 in (x for x in range(10))
3 in {x:y for x,y in zip(range(4),range(4,10))}
```





### 迭代器

- 迭代器

  - 特殊的对象,一定是可迭代对象,具备可迭代对象的特征
  - 通过iter方法把一个可迭代对象封装成迭代器
  - 通过next方法,迭代 迭代器对象
  - 生成器对象,就是迭代器对象


```python
for x in iter(range(10)):
	print(x)
g = (x for x in range(10))
print(type(g))
print(next(g))
print(next(g))
```



### 可迭代对象、迭代器与生成器

#### 可迭代对象

1. 实现了__inter__方法的对象就叫做可迭代对象。__inter__方法的作用就是返回一个迭代器对象。直观理解就是能用for循环进行迭代的对象就是可迭代对象。比如：字符串，列表，元祖，字典，集合等等，都是可迭代对象。
2. for循环与__inter()__方法的关系

```python
x = [1,2,3]
for i in x:
    print(i)
# for循环对一个列表进行迭代
# 调用可迭代对象的__inter__方法返回一个迭代器对象（iterator）
# 不断调用迭代器的__next__方法返回元素
# 知道迭代完成后，处理StopIteration异常
# 可迭代对象：使用iter内置函数可以获取迭代器的对象。即要么对象实现了能返回迭代器的iter方
# 法，要么对象实现了getitem方法，而且其参数是从零开始的索引。
# 可迭代对象要看它是否可以for ... in或能不能in
```

![](/images/python迭代/可迭代对象、迭代器与生成器1.png)



#### 迭代器

1. 迭代器是一个带状态的对象，它能在你调用`next()`方法的时候返回容器中的下一个值，任何实现了`__iter__`和`__next__()`方法的对象都是迭代器，`__iter__`返回迭代器自身，`__next__`返回容器中的下一个值，如果容器中没有更多元素了，则抛出StopIteration异常。 你可以使用`next()`内置函数来调用`__next__()`方法

```python
# 代码实现迭代器，并通过next()方法来调用

class Fib():
    def __init__(self,max):
        self.n = 0
        self.prev = 0
        self.curr = 1
        self.max = max

    def __iter__(self):
        return self

    def __next__(self):
        if self.n < self.max:
            value = self.curr
            self.curr += self.prev
            self.prev = value
            self.n += 1
            return value
        else:
            raise StopIteration

# 调用
f = Fib(5)
print(next(f))
print(next(f))
print(next(f))
print(next(f))
print(next(f))
print(next(f))
输出：
"C:\Program Files\Python36\python.exe" D:/Git/Test_Framework/utils/1.py
1
3
Traceback (most recent call last):
  File "D:/Git/Test_Framework/utils/1.py", line 37, in <module>
    print(next(f))
  File "D:/Git/Test_Framework/utils/1.py", line 29, in __next__
    raise StopIteration
StopIteration

Process finished with exit code 1
# 迭代器就像一个懒加载的工厂，等到有人需要的时候才给它生成值返回，没调用的时候就处于休眠状态
# 等待下一次调用。直到无元素可调用，返回StopIteration异常。
# 迭代器是这样的对象：实现了无参数的next方法，返回下一个元素，如果没有元素了，那么抛出 
# StopIteration异常；并且实现iter方法，返回迭代器本身。
```



#### 生成器

1. 生成器其实是一种特殊的迭代器，不过这种迭代器更加优雅。它不需要再像上面的类一样写`__iter__()`和`__next__()`方法了，只需要一个`yiled`关键字。每次对生成器调用 `next()`时，它会从上次离开位置恢复执行（它会记住上次执行语句时的所有数据值）。 生成器一定是迭代器（反之不成立），因此任何生成器也是以一种懒加载的模式生成值。

2. 可以用生成器来完成的操作同样可以用基于类的迭代器来完成。 但生成器的写法更为紧凑，因为它会自动创建`__iter__()`和`__next__()`方法。

   另一个关键特性在于局部变量和执行状态会在每次调用之间自动保存。 这使得该函数相比使用 `self.index` 和 `self.data` 这种实例变量的方式更易编写且更为清晰。

   除了会自动创建方法和保存程序状态，当生成器终结时，它们还会自动引发 `StopIteration`。 这些特性结合在一起，使得创建迭代器能与编写常规函数一样容易。

3. 用生成器来实现斐波那契数列的例子是：

```python
def fib(max):
    n, prev, curr = 0, 0, 1
    while n<max:
        yield curr
        prev, curr = curr, curr + prev
        n += 1
# 生成器特殊的地方在于函数体中没有return关键字，函数的返回值是一个生成器对象。当执行
# f=fib()返回的是一个生成器对象，此时函数体中的代码并不会执行，只有显示或隐示地调用next的
# 时候才会真正执行里面的代码。
# 生成器还有一个send方法，可以往生成器里的变量传值，如下代码：
def foo():
    print("first")
    count=yield
    print(count)
    yield

f = foo()
f.send(None)
f.send(2)
# 调用过程：
# f = foo()返回一个生成器
# f.send(None)进入函数执行代码，遇到count=yield，冻结并跳出函数体
# f.send(2)再次进入函数体，接着冻结的代码继续执行，把2传给变量count，打印count,遇到
# yield冻结并跳出函数
# 生成器是带有yield关键字的函数。调用生成器函数时，会返回一个生成器对象。
```



#### 生成器表达式

1. 生成器表达式是列表解析式的生成器版本，看起来像列表解析式，但是它返回的是一个生成器对象而不是列表对象。

```python
a = (x for x in range(10))
print(a)
输出：
"C:\Program Files\Python36\python.exe" D:/Git/Test_Framework/utils/1.py
<generator object <genexpr> at 0x000000000289D8E0>

Process finished with exit code 0

>>> sum(i*i for i in range(10))                 # sum of squares
285

>>> xvec = [10, 20, 30]
>>> yvec = [7, 5, 3]
>>> sum(x*y for x,y in zip(xvec, yvec))         # dot product
260

>>> from math import pi, sin
>>> sine_table = {x: sin(x*pi/180) for x in range(0, 91)}

>>> unique_words = set(word  for line in page  for word in line.split())

>>> valedictorian = max((student.gpa, student.name) for student in graduates)

>>> data = 'golf'
>>> list(data[i] for i in range(len(data)-1, -1, -1))
['f', 'l', 'o', 'g']
# 某些简单的生成器可以写成简洁的表达式代码，所用语法类似列表解析式，将外层改为圆括号而非方括
# 号。 这种表达式被设计用于生成器将立即被外层函数所使用的情况。 生成器表达式相比完整的生成
# 器更紧凑但较不灵活，相比等效的列表解析式则更为节省内存。
# 生成器表达式是创建生成器的简洁句法，这样无需先定义函数再调用。
```

