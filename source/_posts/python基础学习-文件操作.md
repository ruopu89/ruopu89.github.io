---
title: python基础学习-文件操作
date: 2019-12-31 15:42:08
tags: python文件操作
categories: python
---

### 文件操作

#### 冯诺依曼体系架构

![](/images/python文件操作/冯诺依曼体系架构.png)

- CPU由运算器和控制器组成
  - 运算器，完成各种算数运算、逻辑运算、数据传输等数据加工处理
  - 控制器，控制程序的执行
  - 存储器，用于记忆程序和数据，例如内存
  - 输入设备，将数据或者程序输入到计算机中，例如键盘、鼠标
  - 输出设备，将数据或程序的处理结果展示给用户，例如显示器、打印机等

一般说IO操作，指的是文件IO，如果指的是网络IO，都会直接说网络IO



### 文件IO常用操作

| 命令      | 解释         |
| --------- | ------------ |
| open      | 打开         |
| read      | 读取         |
| write     | 写入         |
| close     | 关闭         |
| readline  | 行读取       |
| readlines | 多行读取     |
| seek      | 文件指针操作 |
| tell      | 指针位置     |



#### 打开操作

`open(file,mode='r',buffering=-1,encoding=None,errors=None,newline=None,closefd=True,opener=None)`

打开一个文件，返回一个文件对象(流对象)和文件描述符。打开文件失败，则返回异常

基本使用：

创建一个文件test，然后打开它，用完关闭

```python
# 打开ipython
f = open("test")   # file对象
# windows <_io.TextIOWrapper name='test' mode='r' encoding='cp936'>
# linux <_io.TextIOWrapper name='test' mode='r' encoding='UTF-8'>
print(f.read())   # 读取文件
f.close()   # 关闭文件
```

文件操作中，最常用的操作就是读和写。

文件访问的模式有两种：文本模式和二进制模式。不同模式下，操作函数不尽相同，表现的结果也不一样。



##### open的参数

###### file

打开或者要创建的文件名。如果不指定路径，默认是当前路径

###### mode模式

| 描述字符 | 意义                                                         |
| -------- | ------------------------------------------------------------ |
| r        | 缺省的，表示只读打开                                         |
| w        | 只写打开                                                     |
| x        | 创建并写入一个新文件                                         |
| a        | 写入打开，如果文件存在，则追加                               |
| b        | 二进制模式                                                   |
| t        | 缺省的，文本模式                                             |
| +        | 读写打开一个文件。给原来只读、只写方式打开提供缺失的读或者写能力 |

在上面的例子中，可以看到默认是文本打开模式，且是只读的。

```python
# r模式
f = open('test')   # 只读还是只写？
f.read()
f.write('abc')
f.close()
# 因为默认是只读打开，所以这里不能写入，这样执行会报错:"UnsupportedOperation: not writable"

f = open('test','r')   # 只读
f.write('abc')
f.close()
# 这里明确指出了只读打开，写入时也会报错

f = open('test1','r')   # 只读，文件不存在
# 文件不存在，报错:"FileNotFoundError: [Errno 2] No such file or directory: 'test'"

# w模式
f = open('test','w')   # 只写打开
f.write('abc')
f.close()
# 使用jupter测试发现，如果test文件不存在，也会创建新的test文件，并写入内容。如果有test文件且其中有内
# 容，这样写入会覆盖里面的内容。

>>> cat test   # 看看内容

f = open('test',mode='w')
f.close()
# 这样操作文件后，文件会被清空
>>> cat test   # 看看内容

f = open('test1',mode='w')
f.write('123')
f.close()
# 创建test1文件，并写入123。
>>> cat test1   # 看看内容
```

open默认是以只读模式r打开已经存在的文件。



r

只读打开文件，如果使用write方法，会抛异常。

如果文件不存在，抛出FileNotFoundError异常



w

表示只写方式打开，如果读取则抛出异常

如果文件不存在，则直接创建文件

如果文件存在，则清空文件内容



```python
f = open('test2','x')
# f.read()
# 使用x打开的文件，这里用read方法会报错:UnsupportedOperation: not readable"。这是没有读权限，但
# 这并不影响上面创建test2文件
f.write('abcd')
f.close()
```

x

文件不存在，创建文件，并以只写方式打开

文件存在，抛出FileExistsError异常



```python
f = open('test2','a')
f.read()
# 这里依然会报错，因为没有读权限
f.write('abcde')
f.close()

>>> cat test2

f = open('test2','a')
f.write('\n hello')
f.close()

>>> cat test2

f = open('test3','a')
f.write('test3')
f.close()

>>> cat test3
```

a

文件存在，只写打开，追加内容

文件不存在，则创建后，只写打开，追加内容



r是只读，wxa都是只写。

wxa都可以产生新文件，w不管文件存在与否，都会生成全新内容的文件；a不管文件是否存在，都能在打开的文件尾部追加；x必须要求文件事先不存在，自己造一个新文件



文本模式t

字符流，将文件的字节按照某种字符编码理解，按照字符操作。open的默认mode就是rt。



二进制模式b

字节流，将文件就按照字节理解，与字符编码无关。二进制模式操作时，字节操作使用bytes类型

```python
f = open("test3",'rb')   # 二进制只读
s = f.read()
print(type(s))   # bytes
print(s) # b'test3'
f.close()   # 关闭文件

f = open("test3",'wb')   # IO对象
s = f.write("马哥教育".encode())
print(s)   # 是什么，输出是12
f.close()
cat test3
# 输出：马哥教育
```



思考：windows下，执行下面的代码

```python
f = open("test3",'rw')
# 不可以这样打开文件，会报错："ValueError: must have exactly one of create/read/write/append mode"
f = open("test3",'r+')
s = f.read()
f.write("马哥教育")
print(f.read())   
# 没有显示，为什么？因为f.read()的值已经保存到s变量中了，所以这里没有显示。如果注释s = f.read()一行
# ，这里就可以显示出内容了。或在这里打印s的值也可以。
f.close()

f = open("test3",'r+')
s = f.write("magedu")
print(f.read())
f.close()
# 这里不会打印出magedu，只有在使用cat test3查看时才能显示magedu。是因为f.write("magedu")的结果保
# 存到了s变量中，在关闭文件时才会写入吗？并且这里的写入功能是追加的效果
>>> cat test3


f = open('test3','w+')
r.read()
f.close()
# 使用read方法查看不会有输出，因为使用w将文件清空了
>>> cat test3
# 文件被清空了

f = open('test3','a+')
f.write('mag')
f.read()
f.close()
>>> cat test3
# 输出：mag

f = open('test3','a+')
f.write('edu')
f.close()
>>> cat test3
# 输出：magedu

f = open('test3','x+')
# 因为文件已存在，报错："FileExistsError: [Errno 17] File exists: 'test3'"
f = open('test4','x+')
f.write('python')
f.read()
f.close()
>>> cat test4
# 输出：python
```

+

为r、w、a、x提供缺失的读写功能，但是，获取文件对象依旧按照r、w、a、x自己的特征。

+不能单独使用，可以认为它是为前面的模式字符做增强功能的。



### 文件指针

上面的例子中，已经说明了有一个指针。

文件指针，指向当前字节位置

mode=r，指针起始在0

mode=a，指针起始在EOF

`tell()`显示指针当前位置

`seek(offset[,whence])`移动文件指针位置。offset偏移多少字节，whence从哪里开始。



文件模式下

whence 0 缺省值，表示从头开始，offset只能正整数

whence 1 表示从当前位置，offset只接受0

whence 2表示从EOF开始，offset只接受0

```python
# 文本模式
f = open('test4','r+')
f.tell()   # 起始
f.read()
f.tell()   # EOF
f.seek(0)   # 起始
f.read()
f.seek(2,0)
f.read()
# 上面seek设置从索引2开始，跳过0个字符后，这里输出：thon
f.seek(2,0)
f.seek(2,1)   # offset必须为0
# 报错：“UnsupportedOperation: can't do nonzero cur-relative seeks”
f.seek(2,2)   # offset必须为0
# 报错：“UnsupportedOperation: can't do nonzero cur-relative seeks”
f.close()

# 中文 
f = open('test4','w+')
f.write('马哥教育')
f.tell()
f.close()
f = open('test4','r+')
f.read(3)
# 输出：'马哥教'，f.read(3)表示只显示前三个字符，下面再使用read方法时就不会再显示前三个字符了，但如果
# 这里读了多于整个字符数量的值，如f.read(7)，下面就不能再读出任何内容了。
f.seek(1)
# 输出：1，表示当前位置是1。这里如果使用f.seek(3)就可以显示出第二个中文了，所以说明三个字节是一个中文。并且使用f.read()显示的是后三个中文，也就是跳过了第一个中文。
f.tell()
# 这里输出的二进制的位置？
f.read()
# 报错："UnicodeDecodeError: 'utf-8' codec can't decode byte 0xa9 in position 0: invalid start byte"，因为是二进制方式输入的，上面又移动的指针位置，所以这里报错
f.seek(2) # f.seek(3)
f.close()
```



文本模式支持从开头向后偏移的方式。

whence为1表示从当前位置开始偏移，但是只支持偏移0，相当于原地不动，所以没什么用。

whence为2表示从EOF开始，只支持偏移0，相当于移动文件指针到EOF。

seek是按照字节偏移的。



二进制模式下

whence 0 缺省值，表示从头开始，offset只能正整数

whence 1 表示从当前位置，offset可正可负

whence 2 表示从EOF开始，offset可正可负

```python
# 二进制模式
f = open('test','rb+')
f.tell()   # 起始
f.read()
f.tell()   # EOF
f.write(b'abc')
f.seek(0)   # 起始
f.seek(2,1)   # 从当前指针开始，向后2
f.read()
f.seek(-2,2)   # 从当前指针开始，向前2

f.seek(2,2)   # 从EOF开始，向后2
f.seek(0)
f.seek(-2,2)   # 从EOF开始，向前2
f.read()

f.seek(-20,2)   # OSError
f.close()
```



二进制模式支持任意起点的偏移，从头、从尾、从中间位置开始。

向后seek可以超界，但是向前seek的时候，不能超界，否则抛异常。



### buffering：缓冲区

-1 表示使用缺省大小的buffer。如果是二进制模式，使用io.DEFAULT_BUFFER_SIZE值，默认是4096或者8192。如果是文本模式，如果是终端设备，是行缓存方式，如果不是，则使用二进制模式的策略。

- 0 只在二进制模式使用，表示关buffer
- 1 只在文本模式使用，表示使用行缓冲。意思就是见到换行符就flush
- 大于1用于指定buffer的大小

buffer缓冲区

缓冲区一个内存空间，一般来说是一个FIFO队列，到缓冲区满了或者达到阈值，数据才会flush到磁盘。

`flush()`将缓冲区数据写入磁盘

`close()`关闭前会调用`flush()`

`io.DEFAULT_BUFFER_SIZE`缺省缓冲区大小，字节



二进制模式

```python
import io

f = open('test4','w+b')
print(io.DEFAULT_BUFFER_SIZE)
# 输出是8192
f.write("magedu.com".encode())
# cat test4
# 输出是magedu.com，但上面如果不使用f.close()关闭文件，这里是查看不到的。
f.seek(0)
# cat test4
f.write("www.magedu.com".encode())
f.flush()
# 使用flush方法后，就可以使用cat查看文件了，无需使用close方法关闭文件
f.close()

f = open('test4','w+b',4)
f.write(b"mag")
# cat test4
f.write(b'edu')
# cat test4
f.close()
```



文本模式

```python
# buffering=1，使用行缓冲
f = open('test4','w+',1)
# 读写方式打开test4，使用行缓冲
f.write("mag")   # cat test4
f.write("magedu"*4)   # cat test4
f.write('\n')   # cat test4
# 写入一个换行符
f.write('Hello\nPython')   # cat test4
f.close()

# buffering>1，使用指定大小的缓冲区
f = open('test4','w+',15)
f.write("mag")   # cat test4
f.write('edu')   # cat test4
f.write('Hello\n')   # cat test4
f.write('\nPython')   # cat test4
f.write('a' * (io.DEFAULT_BUFFER_SIZE - 20))   
# 设置为大于1没什么用，这里的io.DEFAULT_BUFFER_SIZE还是8192
f.write('\nwww.magedu.com/python')
f.close()

# buffering=0 这是一种特殊的二进制模式，不需要内存的buffer，可以看做是一个FIFO的文件
f = open('test4','wb+',0)
f.write(b"m")   # cat test4
f.write(b"a")   # cat test4
f.write(b"g")   # cat test4
f.write(b"magedu"*4)   # cat test4
f.write(b'\n')   # cat test4
f.write(b'Hello\nPython')
f.close()
```



| buffering    | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| buffering=-1 | t和b，都是io.DEFAULT_BUFFER_SIZE                             |
| buffering=0  | b：关闭缓冲区；t：不支持                                     |
| buffering=1  | b：就1个字节；t：行缓冲，遇到换行符才flush                   |
| buffering>1  | b模式表示行缓冲大小。缓冲区的值可以超过io.DEFAULT_BUFFER_SIZE，直到设定的值超出后才把缓冲区flush；t模式，是io.DEFAULT_BUFFER_SIZE，flush完后把当前字符串也写入磁盘 |

似乎看起来很麻烦，一般来说，只需要记得：

1. 文本模式，一般都用默认缓冲区大小
2. 二进制模式，是一个个字节的操作，可以指定buffer的大小
3. 一般来说，默认缓冲区大小是个比较好的选择，除非明确知道，否则不调整它
4. 一般编程中，明确知道需要写磁盘了，都会手动调用一次flush，而不是等到自动flush或者close的时候



### encoding：编码，仅文本模式使用

None表示使用缺省编码，依赖操作系统。windows、linux下测试如下代码

```python
f = open('test1','w')
f.write('啊')
f.close()
```

windows下缺省GBK(0xB0A1)，linux下缺省UTF-8(0xE5 95 8A)



### 其他参数

#### errors

什么样的编码错误将被捕获

None和strict表示有编码错误将抛出ValueError异常；ignore表示忽略



#### newline

文本模式中，换行的转换。可以为`None、''空串、'\r'、'\n'、'\r\n'`

读时，None表示`'\r'、'\n'、'\r\n'`都被转换为`'\n'`；''表示不会自动转换通用换行符；其他合法字符表示换行符就是指定字符，就会按照指定字符分行

写时，None表示`'\n'`都会被替换为系统缺省行分隔符os.linesep；`'\n'`或表示`'\n'`不替换；其他合法字符表示`'\n'`会被替换为指定的字符

```python
f = open('o:/test','w')
f.write('python\rwww.python.org\nwww.magedu.com\r\npython3')
f.close()
# 测试中，上面的第一个\r没起作用，\r前的内容没被写入test文件

newlines = [None,'','\n','\r\n']
for n1 in newlines:
    f = open('o:/test','r+',newline=n1)   # 缺省替换所有换行符
    print(f.readlines())
    f.close()
# 输出中分隔符不同，结果也不同
# ['abc\n', 'www.python.org\n', 'www.magedu.com\n', 'python3']
# ['abc\r', 'www.python.org\n', 'www.magedu.com\r\n', 'python3']
# ['abc\rwww.python.org\n', 'www.magedu.com\r\n', 'python3']
# ['abc\rwww.python.org\nwww.magedu.com\r\n', 'python3']
```



#### closefd

关闭文件描述符，True表示关闭它。False会在文件关闭后保持这个描述符。`fileobj.fileno()`查看



### read

`read(size=-1)`，size表示读取的多少个字符或字节；负数或者None表示读取到EOF

```python
f = open('o:/test4','r+',0)
# 这里不能把buffer设置为0，使其关闭，因为这是以文本方式打开的，所以这里报错：
# "ValueError: can't have unbuffered text I/O"
f.write("magedu")
f.write('\n')
f.write('马哥教育')
f.seek(0)
f.read(7)
f.close()

# 二进制
f = open('test4','rb+')
f.read(7)
f.read(1)
f.close()
```



### 行读取

`readline(size=-1)`一行行读取文件内容。size设置一次能读取行内几个字符或字节

`readlines(hint=-1)`读取所有行的列表。指定hint则返回指定的行数。

```python
# 按行迭代
f = open('test')   # 返回可迭代对象

for line in f:
    print(line)
# 这与readline方法的效果一样，输出一行内容    
f.close()
# 输出：
# abc
# 
# www.python.org
# 
# www.magedu.com
# 
# python3
# <function TextIOWrapper.close()>

f = open('test')
f.readlines()
# 输出：['abc\n', 'www.python.org\n', 'www.magedu.com\n', 'python3']
f.close()

f = open('test')
f.readline()
# 输出：'abc\n'，这是test文件的第一行内容
```



### write

write(s)，把字符串s写入到文件中并返回字符的个数

`writelines(lines)`，将字符串列表写入文件

```python
f = open('test','w+')

lines = ['abc','123\n','magedu']   # 提供换行符
f.writelines(lines)

f.seek(0)
# 写入后，记得要将指针移动到开头，不然指针是在最后的，什么也打印不出来
print(f.read())
f.close()
# 输出：
# abc123
# magedu
```



### close

flush并关闭文件对象。文件已经关闭，再次关闭没有任何效果。



### 其他

`seekable()`是否可seek

`readable()`是否可读

`writable()`是否可写

`closed`是否已经关闭



### 上下文管理

#### 问题的引出

在linux中，执行

```python
# 下面必须这么写
lst = []
for _ in range(2000):
    lst.append(open('test'))
# OSError: [Errno 24] Too many open files: 'test'

print(len(lst))
# 输出
# 978
# The history saving thread hit an unexpected error (OperationalError('unable to open database file')).History will not be written to the database.

lsof 列出打开的文件。没有就用yum install lsof
# 查看打开test文件的PID号，比如是用jupeter打开的，可以用lsof | grep jupeter查看PID，第二列就是PID
# 因为是打开test文件但没有关闭引起的报错，所以这里要查看打开test文件的PID号
lsof -p 1427 | grep test | wc -l
# 通过PID查看一共打开了多少次test
lsof -p 进程号
ulimit -a 查看所有限制。其中open files就是打开文件数的限制，默认1024

for x in lst:
    x.close()
# 将文件一次关闭，然后就可以继续打开了。再看一次lsof
```



***有一些任务，可能事先需要设置，事后做清理工作。对于这种场景，Python的with语句提供了一种非常方便的处理方式。一个很好的例子是文件处理，你需要获取一个文件句柄，从文件中读取数据，然后关闭文件句柄。***



如何解决？

1. 异常处理

当出现异常的时候，拦截异常。但是，因为很多代码都可能出现OSError异常，还不好判断异常就是因为资源限制产生的

```python
f = open('test')
try:
    f.write("abc")   # 文件只读，写入失败
finally:
    f.close()    # 这样才行
# 使用finally可以保证打开的文件可以被关闭
# 虽然这段代码运行良好，但是太冗长了。这时候就是with一展身手的时候了。除了有更优雅的语法，with还可以很
# 好的处理上下文环境产生的异常。
```



2. 上下文管理

一种特殊的语法，交给解释器去释放文件对象

with工作原理

- 基本思想是with所求值的对象必须有一个`__enter__()`方法，一个`__exit__()`方法。

- 紧跟with后面的语句被求值后，返回对象的`__enter__()`方法被调用，这个方法的返回值将被赋值给as后面的变量；
- 当with后面的代码块全部被执行完之后，将调用前面返回对象的`__exit__()`方法。

```python
del f
with open('test') as f:
    f.write("abc")   #  文件只读，写入失败
    
# 测试f是否关闭
f.closed   # f的作用域
# 输出："TypeError: 'bool' object is not callable"，因为已经关闭了，所以报错

# 如果有多项，可以写成
With open('1.txt') as f1, open('2.txt') as  f2:
    do something
```

上下文管理

1. 使用with ... as 关键字
2. 上下文管理的语句块并不会开启新的作用域
3. with 语句块执行完的时候，会自动关闭文件对象

另一种写法

```python
f1 = open('test')
with f1:
    f1.write("abc")   # 文件只读，写入失败
    
# 测试f是否关闭
f1.closed   # f1的作用域
```

对于类似于文件对象的IO对象，一般来说都需要在不使用的时候关闭、注销、以释放资源。IO被打开的时候，会获得一个文件描述符。计算机资源是有限的，所以操作系统都会做限制。就是为了保护计算机的资源不要被完全耗尽，计算资源是共享的，不是独占的。一般情况下，除非特别明确的知道资源情况，否则不要提高资源的限制值来解决问题。



### 练习

#### 指定一个源文件，实现copy到目标目录

例如把/tmp/test.txt拷贝到/tmp/test1.txt

```python
filename1 = '/tmp/test.txt'
filename2 = '/tmp/test1.txt'

f = open(filename1, 'w+')
lines = ['abc','123','magedu']
f.writelines('\n'.join(lines))
# 使用\n作为分隔符将lines列表中的元素连接起来，这时通过join方法已经将连接下来的元素变成了字符串。再把
# 这个字符串写入filename1文件中
f.seek(0)
print(f.read())
f.close()

def copy(src,dest):
    with open(src) as f1:
        with open(dest, 'w') as f2:
            f2.write(f1.read())
# 定义一个函数，设置两个参数，使用目录文件的写方法写入从源文件中读取到的内容            
copy(filename1, filename2)
```



#### 有一个文件，对其进行单词统计，不区分大小写，并显示单词重复最多的10个单词

```python
简单处理后，大概的得数如下：
the, 136
is, 60
a, 54
path, 52
if, 42
and, 39
to, 34
of, 33
on, 32
return, 30
# 上面是以空格为分隔的结果，这里的path与下面统计的数量不一样，因为分隔符不一样
实际上有效的path很多，作为合法的单词path统计应该有100多个。对单词做进一步处理后，统计如下：
path, 137
the, 136
is, 60
a, 59
os, 50
if, 43
and, 40
to, 34
of, 33
on, 33

# 最好使用字典来实现此题，到目前为止学过的时间复杂度为O(1)的数据结构只有set和dict
# 大的数据统计都用字典这种数据结构，关键是如何分词，如果断开，英文一般用空格。中文要用分词库，比较麻烦。

复制sample.txt文件到指定目录
d = {}
with open('sample', encoding='utf8') as f:
    for line in f:
        words = line.split()   # 以默认的空白字符串作为分隔符将line分开，放入words列表中
        for word in map(str.lower, words):
            d[word] = d.get(word,0) + 1
            
print(sorted(d.items(), key=lambda item: item[1], reverse=True))
# 1. 定义一个空字典
# 2. 以utf8编码打开目标文件
# 3. 循环目录文件中的每一行，将循环的结果以默认的空白字符串作为分隔符将line分开，并将生成的字符串放入
# words列表中。这是将每一行生成一个列表并对其中的每个单词进行处理。
# 4. 使用字符串的lower将words列表中的所有字母变为小写，再用map生成一个列表，并进行循环。map函数会使用
# 参数中定义的str.lower方法，把第二个参数送进来的列表或字符串中的元素变成一个个单独的元素，并再次组成列
# 表。因为str的方法本来就会把字符串分成一个个单独的元素。
# 5. 从字典d中获取word这个键的值，如果没有值就将值设置为0加1，因为最少也会出现一次，所以这样设置，如果
# 将默认值设置为1，那么再加任何值都不能符合出现的单词的数量的实际情况
# 6. 最后使用sorted将d的键值排序，排序的标准使用item[1]也就是键值对中的值进行排序，reverse=True表示
# 降序排列，默认是升序
=======================================================================================
map()函数测试
a=(1,2,3,4,5)
b=[1,2,3,4,5]
c="zhangkang"

la=map(str,a)
lb=map(str,b)
lc=map(str,c)

print(la)
print(lb)
print(lc)

输出：
['1', '2', '3', '4', '5']
['1', '2', '3', '4', '5']
['z', 'h', 'a', 'n', 'g', 'k', 'a', 'n', 'g']
# str()是python的内置函数，这个例子是把列表/元组/字符串的每个元素变成了str类型，然后以列表的形式返回。当然我们也可以传入自定义的函数，看下面的例子。
=======================================================================================


# 得数如下：
# the, 136
# is, 60
# a, 54
# path, 52
# if, 42
# and, 39
# to, 34
# of, 33
# on, 32
# return, 30
```

这是帮助文档中python的文档，path应该很多

```python
for k in d.keys():
    if k.find('path') > -1:
        print(k)
```

使用上面的代码，就可以看到path非常多

os.path.exists(path) 可以认为含有2个path。

```python
def makekey(s:str):  # 这里送进来的参数一定是字符串
    chars = set(r"""!'"#./\()[],*-""")   # 定义一个集合，其中的字符不要转义
    key = s.lower()
# 这里的s已经是被下面的方法使用空白字符串分割过一次的单词的列表了
    ret = []
    for i,c in enumerate(key):  # 给每个元素加上序号
# 因为送进来的s的值是一个个单独的字符串元素，所以这里加入序号后进行判断，如果属于chars变量中定义的内容
# 就向ret列表中追加一个空格，否则追加元素本身的值。最后再用空字符串将ret中的元素连接起来，以空格为分割
# 符，这样就等于重新组合了一次s送进来的值，也就将os.path.sameopenfile(fp1这样的值分的更细了，因为这
# 本身就是一堆不同的单词用符号连接起来了
        if c in chars:
            ret.append(' ')
        else:
            ret.append(c)
    return ''.join(ret).split()

d = {}
with open('sample',encoding='utf8') as f:
    for line in f:
        words = line.split()
        for wordlist in map(makekey,words):
            # 这里使用上面定义的makekey来分割words中的字符串元素，再组成一个新列表
            # 这等于将line分割了两次，第一次用空白字符串，第二次用makekey函数中的方法
            for word in wordlist:
                d[word] = d.get(word,0) + 1
                
for k,v in sorted(d.items(),key=lambda item: item[1],reverse=True):
	print(k,v)
    
# 对单词做进一步处理后，统计如下：
path, 137
the, 136
is, 60
a, 59
os, 50
if, 43
and, 40
to, 34
of, 33
on, 33
```

分割key的另一种思路

```python
def makekey(s:str):
    chars = set(r"""!'"#./\()[],*-""")
    key = s.lower()   # 这个key是一个字符串类型
    ret = []
    start = 0
    length = len(key)
    
    for i,c in enumerate(key):
        if c in chars: # 这是把find的过程变成了一遍遍历完
            if start == i:   # 如果紧挨着还是特殊字符，start一定等于i
            	start += 1   # 加1并continue
            	continue
        	ret.append(key[start:i])
        	start = i + 1   # 加1是跳过这个不需要的特殊字符c
# 这里进行判断，如果c属于chars这个变量中的特殊符号，那么就向下再判断，如果start变量和i变量相等，就把
# start加1并跳出循环。这时的情况是，如果传入的第一个c元素是标点符号，就把start变量加1并跳出循环，如果
# 这里不是特殊符号，不考虑下面的语句那么就会跳过，重新进入循环，直到再次需到特殊符号，这时再判断时，
# start与i变量一定是不相等的，也就可以追加从start到i的值到ret列表中了，这时这段追加的内容就是非特殊符
# 号的索引值。这时的start是上一个特殊符号的索引值加1，i的值是现在的特殊符号的索引值，前包后不包的原则，
# 追加的就是非特殊符号的字符串元素。如果第一个字符串元素不是特殊符号，那么就会跳过本次循环，直到需到特殊
# 符号，这时就可以以从start到i的值为索引值追加元素到列表了。追加后还要新start的值调整为目前的i值加1，
# 这是标记了下一个索引值起始的位置。大部分的非特殊符号都是从这里追加到列表中的。
    else:
        if start < len(key):   # 小于，说明还有有效的字符，而且一直到末尾
            ret.append(key[start:])
# 如果不符合上面的条件，这时的start应该已经到了最后的非特殊字符的索引位置了，如果这个索引值比字符串整体
# 的长度小，加为start一直是加1的，所以应该和字符串的长度是一样的。这时就把从start这个索引值到最后的所
# 有字符串元素追加到列表中。这一段就是处理最后一段非特殊符号元素的，这里已经和上面的i和c变量没关系了，也
# 就是循环都正常执行完后，会再执行一次这段代码。
            
    return ret

print(makekey('os.path.exists(path)'))
print(makekey('os.path.-exists(path)'))
print(makekey('path.os...'))
print(makekey('path'))
print(makekey('path-p'))
print(makekey('***...'))
print(makekey(''))
```

