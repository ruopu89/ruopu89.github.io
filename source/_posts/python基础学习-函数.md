---
title: python基础学习-函数
date: 2019-11-07 16:22:38
tags: python函数
categories: python
---

### 函数

- 数学定义：y=f(x)，y是x的函数，x是自变量。y=f(x0,x1,...,xn)
- Python函数
  - 由若干语句组成的语句块、函数名称、参数列表构成，它是组织代码的最小单元
  - 完成一定的功能
- 函数的作用
  - 函数是为了完成某几种功能
  - 函数的作用就是简单封装，不会做非常复杂的封装
  - 结构化编程对代码的最基本的封装，一般按照功能组织一段代码
  - 封装的目的是为了复用，减少冗余代码
  - 函数本身也是方法，叫函数或方法都可以。
  - 代码更加简洁美观、可读易懂
- 函数的分类
  - 内建函数，如max()、reversed()等
  - 库函数，如math.ceil()等



### 函数定义、调用

- def语句定义函数

```python
def 函数名(参数列表):
    函数体(代码块)
    [return 返回值]
# 函数名就是标识符，命名要求一样
# 语句块必须缩进，约定4个空格
# Python的函数没有return语句，隐式会返回一个None值
# 定义中的参数列表称为形式参数，只是一种符号表达，简称形参
```
- 调用
  - 函数定义，只是声明了一个函数，它不会被执行，需要调用
  - 调用的方式，就是函数名加上小括号，括号内写上参数
  - 调用时写的参数是实际参数，是实实在在传入的值，简称实参

- 函数举例

```python
def add(x,y):
    result = x + y
    return result
out = add(4,5)
print(out)
# 上面只是一个函数的定义，有一个函数叫做add，接收2个参数
# 计算的结果，通过返回值返回
# 调用通过函数名add加2个参数，返回值可使用变量接收
# 定义需要在调用前，也就是说调用时，已经被定义过了，否则抛NameError异常
# 函数是可调用的对象，callable()
```



### 函数参数

- 参数调用时传入的参数要和定义的个数相匹配（可变参数例外）
- 位置参数
  - `def f(x,y,z)`调用使用`f(1,3,5)`
  - 按照参数定义顺序传入实参
- 关键字参数
  - `def f(x,y,z)`调用使用`f(x=1,y=3,z=5)`
  - 使用形参的名字来输入实参的方式，如果使用了形参名字，那么传参顺序就可和定义顺序不同
- 传参
  - `f(z=None,y=10,x=[1])`
  - `f((1,),z=6,y=4.1)`
  - `f(y=5,z=6,2)` # 这会报错
  - 要求位置参数在关键字参数之前传入，位置参数是按位置对应的



### 函数参数默认值

- 参数默认值(缺省值)
  - 定义时，在后跟上一个值

```python
def add(x=4,y=5):
    return x + y
# 测试调用 add(6,10)、add(6,y=7)、add(x=5)、add()、add(y=7)、add(x=5,6)、add(y=8,4)、add(x=5,y=6)、add(y=5,x=6)
# 测试定义后面这样的函数 def add(x=4,y)
```

- 作用
  - 参数的默认值可以在未传入足够的实参的时候，对没有给定的参数赋值为默认值
  - 参数非常多的时候，并不需要用户每次都输入所有的参数，简化函数调用
- 举例

```python
# 定义一个函数login，参数名称为host、port、username、password
def login(host='127.0.0.1',port='8080',username='wayne',password='magedu'):
    print('{}:{}@{}/{}'.format(host,port,username,password))
login()  # 可以这样调用，使用默认值。在测试时很有用，但在实际使用中作用不大
输出：127.0.0.1:8080@wayne/magedu
login('127.0.0.1',80,'tom','tom')
login('127.0.0.1',username='root')
login('localhost',port=80,password='com')
login(port=90,password='magedu',host='www')
```



### 可变参数

- 问题

```python
# 有多个数，需要累加求和
def add(nums):
    sum = 0
    for x in nums:
        sum += x
    return sum
add([1,3,5])
add((2,4,6))
# 可以只传入一个参数，这个参数是一个可迭代对象。定义时只有一个形参，调用时的实参是一个可迭代对象
```

- 可变参数
  - 一个形参可以匹配任意个参数

- 位置参数的可变参数

```python
# 有多个数，需要累加求和
def add(*nums):
    sum = 0
    print(type(nums))
    for x in nums:
        sum += x
    print(sum)
add(3,6,9)
# 在形参前使用*表示该形参是可变参数，可以接收多个实参
# 收集多个实参为一个tuple
# 思考:关键字参数能否也能传递任意多个吗？

例：
def add(*nums):  
# 加星号表示可以接收任意多个实参，包括0个。不加星号时只能接收一个实参。但这样定义后，不能接收关键字参数，如nums=3。
    sum = 0
    print(type(nums))
    for x in nums:    # 上面用*nums来接收，这里要用nums，不能加星号
        sum += x
    print(sum)    # 这个打印是给控制台的，不是给我们使用的
#   return sum
# return返回值是给我们自己使用的，我们可以把这个返回值赋值给一个标识符，之前在说列表解析时特别用了一下print()，返回的都是None

val = add(3,5,7)
# 结果显示nums是一个tuple类型，用这个类型来接收。在传完实参，真正要调用这个函数体时，解释器已经知道有几
# 个参数了，把这几个参数直接给tuple，相当于构建一个tuple。我们是一次全送进来的。它已经知道了当前参数有
# 几个，就可以构建出一个不可变对象来，因为在内部是不能再改变这个nums的，我们只能迭代读取nums。所以用这
# 种方式传进去的参数是不可变类型的。15是通过print打印出来的，这是给控制台的，我们是拿不到的。我们要通过
# return来拿。如果我们注释掉return一行，那么下面打印的会是None。
print(val)
输出：
<class 'tuple'>
15
None
```

- 关键字参数的可变参数

```python
# 配置信息打印
def showconfig(**kwargs):
    for k,v in kwargs.items():
        print('{} = {}'.format(k,v))
        
showconfig(host='127.0.0.1',port='8080',username='wayne',password='magedu')
# 形参前使用**符号，表示可以接收多个关键字参数
# 收集的实参名称和值组成一个字典
```

- 可变参数混合使用

```python
# 配置信息打印
def showconfig(username,password,**kwargs)
def showconfig(username,*args,**kwargs)
def showconfig(username,password,**kwargs,*args)

例：
- 可变参数。用两个星号，构建的是字典item形式。因为要用到关键字参数，如nums=2，这和字典的nums:2是一样的。所以构建的是字典。
- 混合使用，一个星号就是接收任意多个实参的，两个星号就是接收关键字参数的。
- 注意，在定义时，一个星号要放在两个星号前，如def showconfig(username,passwd,**kwargs,*args)，这样就不行。
- 给实参时，会尽量先满足不可变参数，再满足可变参数
def add(*args,x):   
# 这样定义的话，x就变成了关键字参数，调用时必须给出x的值，或者在定义时就要定义默认值，不然会报错
    print(x)
    print(args)

add(4,3,x=0)
输出：
0
(4, 3)

def(**kwargs,x):
    print(x)
    print(kvargs)
# 这里报错的原因是**kvargs和x都是关键字参数，都是keyword。所以会报错
输出：
  File "<ipython-input-14-7e57b033edae>", line 1
    def(**kvargs,x):
       ^
SyntaxError: invalid syntax
```

- 总结
  - 有位置可变参数和关键字可变参数
  - 位置可变参数在形参前使用一个星号*
  - 关键字可变参数在形参前使用两个星号**
  - 位置可变参数和关键字可变参数都可以收集若干个实参，位置可变参数收集形成一个tuple，关键字可变参数收集形成一个dict
  - 混合使用参数的时候，可变参数要放到参数列表的最后，普通参数需要放到参数列表前面，位置可变参数需要在关键字可变参数之前

- 举例

```python
def fn(x,y,*args,**kwargs):
    print(x)
    print(y)
    print(args)
    print(kwargs)
    
fn(3,5,7,9,10,a=1,b='python')
fn(3,5)
fn(3,5,7)
fn(3,5,a=1,b='python')
fn(7,9,y=5,x=3,a=1,b='python')
# 错误，7和9分别赋给了x，y，之后又给了y=5，x=3，重复了

def fn(*args,x,y,**kwargs):
    print(x)
    print(y)
    print(args)
    print(kwargs)
    
fn(3,5)
fn(3,5,7)
fn(3,5,a=1,b='python')
fn(7,9,y=5,x=3,a=1,b='python')
```



### keyword-only参数

- keyword-only参数(Python3加入)

```python
# 如果在一个星号参数后，或者一个位置可变参数后，出现的普通参数，实际上已经不是普通的参数了，而是keyword-only参数
def fn(*args,x):
    print(x)
    print(args)
    
fn(3,5)
fn(3,5,7)
fn(3,5,x=7)
# args可以看做已经截获了所有的位置参数，x不使用关键字参数就不可能拿到实参
# 思考:def fn(**kwargs, x) 可以吗？

def fn(**kwargs,x):
    print(x)
    print(kwargs)
# 直接报语法错误
# 可以理解为kwargs会截获所有的关键字参数，就算你写了x=5，x也永远得不到这个值，所以语法错误

# keyword-only参数另一种形式
def fn(*,x,y):   # 星号或*args后如果有x,y，那么x，y都会变成关键字参数
    print(x,y)
fn(x=5,y=6)
# *号之后，普通形参都变成了必须给出的keyword-only参数。星号表示只接受两个参数x和y，且两个参数都要是关键字参数 
- 定义时，一个星号后一般都用args，表示多个参数，如果是两个星号，用*kwargs，表示keywordargs
```



### 可变参数和参数默认值

```python
def fn(*args,x=5):
    print(x)
    print(args)
fn()
# 等价于fn(x=5)
fn(5)
fn(x=6)
fn(1,2,3,x=10)


def fn(y,*args,x=5):
    print('x={},y={}'.format(x,y))
    print(args)

fn()
fn(5)
fn(x=6)
fn(1,2,3,x=10)
fn(y=17,2,3,x=10)
fn(1,2,y=3,x=10)
# x是keyword-only参数
    
    
def fn(x=5,**kwargs):
    print('x={}'.format(x))
    print(kwargs)
    
fn()
fn(5)
fn(x=6)
fn(y=3,x=10)
fn(3,y=10)
```



### 函数参数规则

- 参数列表参数一般顺序是，普通参数、缺省参数、可变位置参数、keyword-only参数(可带缺省值)、可变关键字参数

```python
def fn(x,y,z=3,*arg,m=4,n,**kwargs):
    print(x,y,z,m,n)
    print(args)
    print(kwargs)
```

- 注意
  - 代码应该易读易懂，而不是为难别人
  - 请按照书写习惯定义函数参数

- 参数规则举例

```python
def connect(host='localhost', port='3306', user='admin', password='admin', **kwargs):
	print(host, port)
	print(user, password)
	print(kwargs)
    
connect(db='cmdb')
connect(host='192.168.1.123', db='cmdb')
connect(host='192.168.1.123', db='cmdb', password='mysql')
```



### 参数解构

- 举例

```python
# 加法函数
def add(x, y):
	return x+y

add(4, 5)
add((4,5))
t = (4, 5)
add(t[0], t[1])
add(*t) 
add(*(4,5))
add(*range(1,3))
add(*[4,5])
add(*{4,6})
```

- 参数解构
  - 给函数提供实参的时候，可以在集合类型前使用\*或者\*\*，把集合类型的结构解开，提取出所有元素作为函数的实参
  - 非字典类型使用\*解构成位置参数
  - 字典类型使用\*\*解构成关键字参数
  - 提取出来的元素数目要和参数的要求匹配，也要和参数的类型匹配
  - 参数解构，有时候有，有时候没有。如果有，就把参数一个个解构出来，如果没有，就解构成一个整体，如列表或元组

```python
def add(x, y):
	return x+y

add(*(4,5))
add(*[4,5])
add(*{4,6})
d = {'x': 5, 'y': 6}
add(**d)
add(**{'a': 5, 'b': 6})
add(*{'a': 5, 'b': 6})
```

- 参数解构和可变参数

```python
# 给函数提供实参的时候，可以在集合类型前使用*或者**，把集合类型的结构解开，提取出所有元素作为函数的实参
def add(*iterable):
	result = 0
	for x in iterable:
		result += x
	return result

add(1,2,3)
add(*[1,2,3])
add(*range(10))
- 可见范围，函数内定义的变量，在函数外是不可见的，不能调用。
- 但在函数外定义一个变量，在函数内可以调用
- 函数内的变量叫本地变量
```



### 函数的返回值

```python
def showplus(x):
    print(x)
    return x + 1

showplus(5)
```

- 多条return语句

```python
def guess(x):
    if x > 3:
        return ">3"
    else:
        return "<=3"
print(guess(10))
# return可以执行多次吗？
```

- 举例

```python
def fn(x):
    for i in range(x):
        if i > 3:
            return i
        else:
            print("{} is not greater than 3".format(x))
            
# print(fn(5)) 打印什么？
# print(fn(3)) 打印什么？
```

- 总结
  - Python函数使用return语句返回“返回值”
  - 所有函数都有返回值，如果没有使用return语句，隐式调用return None
  - return语句并不一定是函数的语句块的最后一条语句
  - 一个函数可以存在多个return语句，但是只有一条可以被执行。如果没有一条return语句被执行到，隐式调用return None
  - 如果有必要，可以显示调用return None，可以简写为return
  - 如果函数执行了return语句，函数就会返回，当前被执行的return语句之后的其它语句就不会被执行了
  - 作用：结束函数调用、返回值

- 返回多个值

```python
def showlist():
    return [1,3,5]
# showlist函数是返回了多个值吗？

def showlist():
    return 1,3,5
# 这次showlist函数是否返回了多个值？

- 函数不能同时返回多个值
- return [1,3,5]是指明返回一个列表，是一个列表对象
- return 1,3,5 看似返回多个值，隐式的被python封装成了一个元组

def showlist():
    return 1,3,5

x,y,z = showlist()
# 使用解构提取更为方便
```



### 函数嵌套

- 在一个函数中定义了另外一个函数

```python
def outer():
    def inner():
        print("inner")
    print("outer")
    inner()
outer()
inner()

- 函数有可见范围，这就是作用域的概念
- 内部函数不能在外部直接使用，会抛NameError异常，因为它不可见
```



### 作用域***

- 一个标识符的可见范围，这就是标识符的作用域。一般常说的是变量的作用域

```python
- 举例，对比下面两个函数，x到底是否可见？
x = 5
def foo():
    print(x)
    
foo()

x = 5
def foo():
    x += 1
    print(x)
    
foo()
```

- 全局作用域
  - 在整个程序运行环境中都可见
- 局部作用域
  - 在函数、类等内部可见
  - 局部变量使用范围不能超过其所在的局部作用域

```python
def fn1():
    x = 1
# 局部作用域，在fn1内

def fn2():
    print(x)
# x 可见吗
print(X)
# x 可见吗

* 嵌套结构
def outer1():
    o = 65
    def inner():
        print("inner {}".format(o))
        print(chr(o))
    print("outer {}".format(o))
    inner()
    
outer1()

def outer2():
    o = 65
    def inner():
        o = 97
        print("inner {}".format(o))
        print(chr(o))
    print("outer {}".format(o))
    
outer2()
# 上面两个函数中变量o的差别
- 从嵌套结构例子看出
	- 外层变量作用域在内层作用域可见
    - 内层作用域inner中，如果定义了o=97，相当于当前作用域中重新定义了一个新的变量o，但是这个o并没有覆
    盖外层作用域outer中的o
    
x = 5
def foo():
    y = x + 1   # 会报错吗？
    x += 1  # 报错，报什么错？为什么？换成x=1还有错吗？
# 这里报错的原因是，左边的x就相当于要定义一个x，那么系统会认为要在本地重新定义这个x。而右边的x+1表示要
# 调用本地x的值，但x在本地还没有定义所以会报错。而上面的y = x + 1表示调用外部的x的值，所以不会报错。调
# 用函数时系统会先扫描语句块内部是否有x =，如果有，表示定义了一个本地x，所以不能再引用x
    print(x)   # 为什么它不报错
    
foo()
输出：
---------------------------------------------------------------------------
UnboundLocalError                         Traceback (most recent call last)
<ipython-input-1-8bced725b7fd> in <module>
      7 # 引用x
      8     print(x)
----> 9 foo()

<ipython-input-1-8bced725b7fd> in foo()
      1 x = 5
      2 def foo():
----> 3     y = x + 1
      4     x = x + 1

UnboundLocalError: local variable 'x' referenced before assignment

- x += 1 其实是x = x + 1
- 相当于在foo内部定义一个局部变量x，那么foo内部所有x都是这个局部变量x了
- 但是这个x还没有完成赋值，就被右边拿来做加1操作了
- 如何解决这个问题？
```

- 全局变量global

```python
def foo():
    global x
    x = 10
    x += 1   # 报错吗？
    print(x)   # 打印什么？
print(x)   # 打印什么？
# 做这些实验建议不要使用ipython、jupyter，因为它会使用上下文中x的定义，也就是之前的x的定义，可能测试
# 不出来效果。如果要用这些工具，要在函数前用del x先删除变量

- 使用global关键字的变量，将foo内的x声明为使用外部的全局作用域中定义的x
- 但是，x = 10赋值即定义，这是在内部作用域为一个外部作用域的变量x赋值，而不是在内部作用域定义一个新变
  量，所以x += 1不会报错。注意，这里x的作用域还是全局的。
    
def foo():
    global z
    z = 20
    z += 2
    print(z)
foo()
print(z)
# 这个z是一个全局的变量，而不是本地的变量。因为在最后的print()函数打印的z是不能调用函数内的变量的，只能
# 由函数内调用函数外的变量因为在函数中使用了global，所以已经定义了作用域在外部，即使在内部又定义了一个
# 本地变量也没用。在内部的z = 20等于是在外部定义了一个变量
```

- global总结
  - x+=1这种是特殊形式产生的错误的原因？先引用后赋值，而python动态语言是赋值才算定义，才能被引用。解决办法是在这条语句前增加x=0之类的赋值语句，或者使用global告诉内部作用域，去全局作用域查找变量定义
  - ***内部作用域使用x=5之类的赋值语句会重新定义局部作用域使用的变量x，但是，一旦这个作用域中使用global声明x为全局的，那么x=5相当于在为全局作用域的变量x赋值***
  - global使用原则
    - 外部作用域变量会在内部作用域可见，但也不要在这个内部的局部作用域中直接使用，因为函数的目的就是为了封装，尽量与外界隔离
    - 如果函数需要使用外部全局变量，请使用函数的形参传参解决
    - 一句话：不用global。学习它就是为了深入理解变量作用域



### 闭包*

- 自由变量：未在本地作用域中定义的变量。例如定义在内存函数外的外层函数的作用域中的变量
- 闭包：就是一个概念，出现在嵌套函数中，指的是内层函数引用到了外层函数的自由变量，就形成了闭包。这实际是一个函数嵌套，内层的函数引用到了上一层函数的问题。在全局作用域中的就不是闭包。

```python
- c[0] += 1这行会报错吗？
- print(foo(),foo())会打印什么结果？
- print(foo())

def counter():
    c = [0]  # 定义变量并赋值
    def inner():
        c[0] += 1   
# 这里是修改c变量，而不是赋值，修改不是重新定义。而且这是对c变量的内部元素在修改，对变量本身没有修改。这
# 里没有用global，而用一个引用类型来实现，这样就避开了c += 1会报错的情况。所以这行不会报错
        return c[0]   # 这里返回c[0]的值，也就是返回了c第一个元素的值
    return inner
# 这里不是函数调用，因为没有括号。这里返回的是一个标识符，这个标识符对应一个对象。标识符用来定义一个对
# 象，这个对象叫函数，所以返回的是函数对象。它返回的不是函数调用的返回值。加括号表示调用函数。这行返回的
# 不是函数调用的结果，这里的返回值就是inner，inner是一个可调用对象callable，也是一个function对象

foo = counter()  
# 这里的counter()函数调用返回的是return inner，也就是函数对象的引用。这里的foo的类型也变成了一个
# callable，可调用对象。这时foo就等于inner了，foo()与inner()是一样的，像是一个别名。但这里不能使用
# inner() 这种方法，因为它是函数中的函数，所以在外面是不可见的。从里面可以使用外面的变量，用global。但
# 从外面不能引用函数中的定义
print(type(foo))   # 这就可以看出foo是一个function了
print(callable(foo))   # 这里返回True
print(type(foo()))
print(foo(),foo())
# 这里要调用两次foo函数，调用第一个foo()的时候就会进到函数中的def inner():里面，执行c[0] += 1和
# return c[0]，因为c的索引0的值在def counter():中定义了是0，再加1后，c就是1了，之后用return返回。
# 第二次调用foo()时，c已经是1了，这时c就变成2了，之后返回。这说明c的值被保留下来了。一般按道理执行过
# foo()之后，它的局部变量就没了，也就是c = [0]这个值就应该随counter函数消亡了，每次调用foo()时，
# c = [0]这个值应该不存在或重新赋值。但这里foo = counter()一步拿到了一个内部函数的引用，然后赋值给了
# 一个变量，之后加1，这时c[0]的值一定不是0。对象计数引用加1。被引用后inner()这个对象不应该被消亡，所以
# 打印时，foo是function对象，而且一定是callable的，也可以把一个callable对象用callable()检查，如果
# 是可调用对象，会返回True。counter()中定义的c = [0]没有消亡，而且可以被inner()函数引用，那么
# inner()函数就使用了一个外层函数的变量，这个c就叫自由变量。内部使用了外层函数的变量，外层函数的变量就
# 叫自由变量，使用了自由变量就产生了闭包，因为有闭包，所以c变量就一直存在，所以第一次调用后，c[0]就变
# 成了1，第二次调用时，以c[0]的值是1为基础，调用后就变成了2
c = 200  # 覆盖c，这里定义的是一个全局变量，但与上面的函数定义中的c没有关系
print(foo())  
# 再调用foo函数，因为上面调用过两次了，所以这时c[0]的值已经是2了，所以这里再调用时，c[0]的值就变成了3
# 如果要改变外部变量的元素的值，在python2中只能用这种方法，在python3中可以使用nonlocal
输出：
<class 'function'>
True
<class 'int'>
1 2
3
=======================================================================================
def counter1():
    c = 5
    def inner1():
        c += 1
#         return c     
# 这也是一个闭包，因为这也是对外部变量的引用。引用时只要改变外部变量就不是闭包了。如在这里加上c = 4，这
# 里的c与外部的c就是两个变量了。闭包就是为了使用外层函数的变量，如果加入c += 1，就会出问题了。因为这时
# 没有定义c，就要改变c的值。上面只是改变c的元素的值。所以在定义时c就不能被定义成一个数字，应该定义为列
# 表，set等。如果要用c += 1这种方式，要用glocal
    return inner1

foo1 = counter1()
print(callable(foo1))
print(foo1(),foo1())
c = 200
print(foo1())
输出：
True
---------------------------------------------------------------------------
UnboundLocalError                         Traceback (most recent call last)
<ipython-input-11-d6047de65f5a> in <module>
     11 foo1 = counter1()
     12 print(callable(foo1))
---> 13 print(foo1(),foo1())
     14 c = 200
     15 print(foo1())

<ipython-input-11-d6047de65f5a> in inner1()
      2     c = 5
      3     def inner1():
----> 4         c += 1
      5 #         return c
      6 # 这也是一个闭包，因为这也是对外部变量的引用。引用时只要改变外部变量就不是闭包了。如在这里加上c = 4，这里的c与外部的c就是两个变量了

UnboundLocalError: local variable 'c' referenced before assignment
# 使用global可以解决上面的报错，但这使用的是全局变量，而不是闭包
# 如果要对普通变量的闭包，python3中可以使用nonlocal
=======================================================================================
def counter1():
    c = [4]
    def inner1():
        c.append(1)
        return c     
    return inner1

foo1 = counter1()
print(callable(foo1))
print(foo1(),foo1())
c = 200
print(foo1())
输出：
True
[4, 1, 1] [4, 1, 1]
[4, 1, 1, 1]
=======================================================================================
# del c
c = 9   # 加上这句就不会报错了
def count():
    c = 1
    a = 10
    def inner():
        global c   # 报错的原因是在函数的外部没有定义过c，函数中定义的都算本地环境。解析器才是global环境
# global的作用域在全局和使用global声明的函数中有效。以这个函数来说，只在全局和inner()函数中有效。
        c += 1
        return c
    return inner

foo = count()
print(foo())   # 执行错误，提示c没有定义
print(foo())
输出：
10
11
```



### nonlocal关键字

- 使用了nonlocal关键字，将变量标记为不在本地作用域定义，而在*上级的某一级*局部作用域中定义，但*不能是全局作用域中*定义

```python
def counter():
    count = 0
    def inc():
        nonlocal count
# 表示不是本地作用域定义的，是上一级的局部作用域而且不是全局作用域的作用域定义的。这样count += 1就不会报错了
        count += 1
        return count
    return inc

foo = counter()
foo()
foo()
输出：
1
2
- count是外层函数的局部变量，被内部函数引用
- 内部函数使用nonlocal关键字声明count变量在上级作用域而非本地作用域中定义
- 左边代码可以正常使用，且形成闭包
=======================================================================================
a = 50
def counter():
    nonlocal a
    a += 1
    print(a)
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

foo = counter()
foo()
foo()
- 这段代码不能正常运行，变量a不能在全局作用域中

```



### 默认值作用域

```python
def foo(xyz=2):
    print(xyz)

foo()
# 无论调用几次都会打印2，返回None

print(xyz)
# xyz虽然是形参，但也是一个局部变量，所以会报错。因为它只能在函数内使用
输出：
2
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)
<ipython-input-2-9faea3c8b99f> in <module>
      5 # 这会打印2，返回None
      6 
----> 7 print(xyz)
      8 # xyz虽然是形参，但也是一个局部变量，所以会报错。因为它只能在函数内使用

NameError: name 'xyz' is not defined
    
=======================================================================================
def foo(xyz=[]):
    xyz.append(100)
    print(xyz)

foo()
输出：
[100]
foo()
输出：
[100, 100]
# 引用类型要小心。这不是xyz导致的，而是缺省值/默认值导致的。xyz用完或调用完就消亡了
# 第二次打印[100,100]是因为在当前作用域，也就是全局作用域内，ipython这个运行环境在当前作用域内还没有
# 结束。foo是一个函数对象，这个对象没有消亡，它还存在，它把xyz的默认值放在了一个函数对象的特殊属
# 性上了，这个属性叫foo.__defaults__。这个对象没有消亡，所以这个属性一直存在，这个属性是一个值，就是
# 把xyz = []放到了这个属性中，xyz的值是一个列表，列表元素可以改变。这就是每次调用foo函数都会变化的原
# 因。并不是因为xyz还存在，xyz会随函数调用而消亡。__defaults__是为函数对象提供的特殊属性
- 为什么第二次调用foo函数打印的是[100,100]
- 因为函数也是对象，python把函数的默认值放在了属性中，这个属性就伴随着这个函数对象的整个生命周期
- 查看foo.__defaults__属性
=======================================================================================
def foo(xyz=[],m=5,n=6):
    xyz.append(100)
    print(xyz)
    
print(1,foo.__defaults__)
# 在调用前打印一次，所以是默认值：([], 5, 6)
print(foo(),id(foo))
# 查看一个foo函数对象的内存地址。执行时会先执行foo()调用，所以会执行函数内的print(xzy)，打印出[100]
print(2, foo.__defaults__)
# __defaults__是一个属性，属性就不用加括号了。加括号就成调用了
print(foo(),id(foo))
# 第二次调用，并查看foo的地址是否改变。如果没变，说明在当前作用域内，就是那一个对象，是同一个对象
# 地址可以用is来判断，内容是否相同可以用==来判断
print(3,foo.__defaults__)
# 查看函数默认值是否改变
# 可以看到执行结果是一个元组：([100], 5, 6)，但元组中还有列表，所以可以变化
# 在当前的这个运行环境中，内存地址都不会改变。因为它指向的是同一个函数对象。对cPython来说，id()取的是
# 这个对象的地址，第二次相当于对默认值做了改变，所以第二次，第三次的值都不一样。但如果设置了默认值，如
# m=5，那么这是不可替换的，并且在元组中，更是不能改变的
输出：
1 ([], 5, 6)
[100]
None 140460738254232
2 ([100], 5, 6)
[100, 100]
None 140460738254232
3 ([100, 100], 5, 6)
- 函数地址并没有变，就是说函数这个对象的没有变，调用它，它的属性__defaults__中使用元组保存默认值
- xyz默认值是引用类型，引用类型的元素变动，并不是元组的变化
=======================================================================================
def foo(w,u='abc',*,z=123,zz=[456]):
    u = 'xyz'
    z = 789
    zz.append(1)
    print(w,u,z,zz)
print(foo.__defaults__)
foo('magedu')
print(foo.__kwdefaults__)
- 属性__defaults__中使用元组保存所有位置参数默认值
- 属性__kwdefaults__中使用字典保存所有keyword-only参数的默认值
```



- 使用可变类型作为默认值，就可能修改这个默认值
- 有时候这个特性是好的，有的时候这种特性是不好的，有副作用

```python
# 如何做到按需改变？如下面两例：
def foo(xyz=[],u='abc',z=123):
    xyz = xyz[:]   # 浅拷贝，这里的xyz与默认值的xyz没有关系
    xyz.append(1)
    print(xyz)
    
foo()
print(1,foo.__defaults__)
foo()
print(2,foo.__defaults__)
foo([10])
# 这里给了foo()函数一个值，那就不使用默认值了，所以下面浅拷贝后再打印出来的是[10,1]
print(3,foo.__defaults__)
foo([10,5])
# 因为上面没有修改默认值，所以打印出来的是[10,5,1]
print(4,foo.__defaults__)
# 如果不在函数内部改变默认值的值，使用浅拷贝是不会改变默认值的 
输出：
[1]
1 ([], 'abc', 123)
[1]
2 ([], 'abc', 123)
[10, 1]
3 ([], 'abc', 123)
[10, 5, 1]
4 ([], 'abc', 123)
- 函数体内，不改变默认值
- xyz都是传入参数或者默认参数的副本，如果就想修改原参数，无能为力
=======================================================================================
# 比较常用的方法
def foo(xyz=None,u='abc',z=123):
    if xyz is None:
        xyz = []
    xyz.append(1)
    return xyz

lst = foo()   
# 因为没有给foo()函数值，所以使用默认值，当xyz是None时，把xyz改为空列表并追加一个[1]。lst的值就是[1]
a = foo(lst)
# 用a来接收foo(lst)函数返回的值，一般都会这样使用。
print(a)
# 再打印a时，因为foo()已经是[1]了，并赋值给了lst，所以再次调用foo(lst)时，会直接向[1]中追加[1]，所
# 以结果是[1,1]。这是使用不可变类型作为默认值，一般都用None，不会用123这样的值的。这种方式比较常用 
输出：
[1, 1]
- 使用不可变类型默认值
- 如果使用缺省值None就创建一个列表
- 如果传入一个列表，就修改这个列表
```

- 方法一：
  - 使用影子拷贝创建一个新的对象，永远不能改变传入的参数
- 方法二：
  - 通过值的判断就可以灵活的选择创建或者修改传入对象
  - 这种方式灵活，应用广泛
  - 很多函数的定义，都可以看到使用None这个不可变的值作为默认参数，可以说这是一种惯用方法



### 变量名解析原则LEGB

- Local，本地作用域、局部作用域的local命名空间。函数调用时创建，调用结束消亡
- Enclosing，Python2.2时引入了嵌套函数，实现了闭包，这个就是嵌套函数的外部函数的命名空间
- Global，全局作用域，即一个模块的命名空间。模块被import时创建，解释器退出时消亡
- Build-in，内置模块的命名空间，生命周期从python解释器启动时创建到解释器退出时消亡。例如print(open)，print和open都是内置的变量
- 所以一个名词的查找顺序就是LEGB

![](/media/shouyu/C64CC89B4CC8879F/works/GitHub/ruopu89.github.io/themes/hexo-theme-next/source/images/python函数/变量名解析原则1.png)



### 函数的销毁

- 全局函数

```python
def foo(xyz=[],u='abc',z=123):
    xyz.append(1)
    return xyz
print(foo(),id(foo),foo.__defaults__)

def foo(xyz=[],u='abc',z=123):
    xyz.append(1)
    return xyz
print(foo(),id(foo),foo.__defaults__)
del foo
print(foo(),id(foo),foo.__defaults__)
```

- 全局函数销毁
  - 重新定义同名函数
  - del语句删除函数对象
  - 程序结束时



- 局部函数

```python
def foo(xyz=[],u='abc',z=123):
    xyz.append(1)
    def inner(a=10):
        pass
    print(inner)
    def inner(a=100):
        print(xyz)
    print(inner)
    return inner
bar = foo()
print(id(foo),id(bar),foo.__defaults__,bar.__defaults__)
del bar
print(id(foo),id(bar),foo.__defaults__,bar.__defaults__)
```

- 局部函数销毁
  - 重新在上级作用域定义同名函数
  - del语句删除函数名称，函数对象的引用计数减1
  - 上级作用域销毁时