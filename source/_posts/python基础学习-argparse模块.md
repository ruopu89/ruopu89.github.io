---
title: python基础学习-argparse模块
date: 2020-01-10 10:19:41
tags: python模块
categories: python
---

### argparse模块

一个可执行文件或者脚本都可以接收参数

```python
ls -l /etc
# /etc 是位置参数
# -l 是短选项
```

如果把这些参数传递给程序呢？

从3.2 开始Python提供了参数分析的模块 `argparse`



### 参数分类

参数分为：

位置参数，参数放在那里，就要对应一个参数位置。例如/etc就是对应一个参数位置。

选项参数，必须通过前面是` - `的短选项或者 `-- `的长选项，然后后面的才算它的参数，当然短选项后面也可以没有参数。

上例中，`/etc`对应的是位置参数，`-l`是选项参数。

`ls -alh src`



### 基本解析

先来一段最简单的程序

```python
import argparse

parser = argparse.ArgumentParser()   # 一个参数解析器
args = parser.parse_args()   # 分析参数
parser.print_help()   # 打印帮助
```

运行结果

```python
python test.py -h
usage: test1.py [-h]
optional arguments:
  -h, --help  show this help message and exit        
```

argparse不仅仅做了参数的定义和解析，还自动帮助生成了帮助信息。尤其是usage，可以看到现在定义的参数是否是自己想要的。



### 解析器的参数

| 参数名称    | 说明                                           |
| ----------- | ---------------------------------------------- |
| prog        | 程序的名字，缺省使用sys.argv[0]                |
| add_help    | 自动为解析器增加 -h 和 --help 选项，默认为True |
| description | 为程序功能添加描述                             |

`parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')`

```python
$ python test.py --help
usage: ls[-h]

list directory contents

optional arguments:
  -h, --help show this help message and exit
```



### 位置参数解析

ls 基本功能应该解决目录内容的打印。

打印的时候应该指定目录路径，需要位置参数。

```python
import argparse

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='1s',add_help=True,descriptio='list directory contents')
parser.add_argument('path')
args = parser.parse_args()   # 分析参数
# 这里需要传给parse_args()一个可迭代对象，查看parse_args()的源码可以看到这个设置
# 通过 parse_args() 方法解析参数。它将检查命令行，把每个参数转换为适当的类型然后调用相应的操作。在大多
# 数情况下，这意味着一个简单的 Namespace 对象将从命令行参数中解析出的属性构建。在脚本中，通常 
# parse_args() 会被不带参数调用，而 ArgumentParser 将自动从 sys.argv 中确定命令行参数。
# 这里Namespace对象构建的就是parser.add_argument()定义的参数是否被引用
parser.print_help()   # 打印帮助

# 运行结果
usage: ls [-h] path
ls: error: the following arguments are required: path
```

程序等定义为：

`ls [-h] path`

-h 为帮助，可有可无

path为位置参数，必须提供



### 传参

`parse_args(args=None,namespace=None)`

args 参数列表，一个可迭代对象。内部会把可迭代对象转换成list。如果为None则使用命令行传入参数，非None则使用args参数的可迭代对象。

```python
import argparse

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
parser.add_argument('path')   # 位置参数

args = parser.parse_args(('/etc',))   # 分析参数，同时传入可迭代的参数
print(args)   # 打印名词空间中收集的参数
parser.print_help()   # 打印帮助

运行结果
Namespace(path='/etc')
usage: ls [-h] path
    
list directory contents

positional arguments:
    path

optional arguments:
  -h, --help show this help message and exit
```

Namespace(path='/etc')里面的path参数存储在了一个Namespace对象内的属性上，可以通过Namespace对象属性来访问，例如args.path



### 非必须位置参数

上面的代码必须输入位置参数，否则会报错。

```python
usage: ls [-h] path
ls: error: the following arguments are required: path
```

但有时候，ls 命令不输入任何路径的话就表示列出当前目录的文件列表。

```python
import argparse

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
# prog：默认情况下，ArgumentParser 对象使用 sys.argv[0] 来确定如何在帮助消息中显示程序名称。这一默
# 认值几乎总是可取的，因为它将使帮助消息与从命令行调用此程序的方式相匹配。
parser.add_argument('path',nargs='?',default='.',help="path help")   
# 位置参数，可有可无，缺省值，帮助

args = parser.parse_args()   # 分析参数，同时传入可迭代的参数
print(args)   # 打印名词空间中收集的参数
parser.print_help()   # 打印帮助

# 运行结果
Namespace(path='.')
usage: ls [-h] [path]
    
list directory contents

positional arguments:
  path    path help

optional arguments:
  -h, --help show this help message and exit
```

可以看出path也变成可选的位置参数，没有提供就使用默认值 `.`点号表示当前路径。

- help 表示帮助文档中这个参数的描述
- nargs 表示这个参数接收结果参数，?表示可有可无，+表示至少一个，*可以任意个，数字表示必须是指定数目个
- default 表示如果不提供该参数，就使用这个值。一般和?、*配合，因为它们都可以不提供位置参数，不提供就是用缺省值



### 选项参数

#### -l 的实现

`parser.add_argument('-l')`就增加了选项参数，参数定义为`ls [-h] [-l L] [path]`和我们要的形式有一点出入，我们期望的是[-h]，怎么解决？

nargs能够解决吗？

`parser.add_argument('-l',nargs='?')`

`ls [-h] [-l [L]] [path]`

L变成了可选，而不是-l

那么，直接把nargs=0，意思就是让这个选项接收0个参数，如下：

`parser.add_argument('-l',nargs=0)`

结果，抛出异常

![](/images/python-argparse模块/异常1.png)

为了这个问题，使用action参数

`parser.add_argument('-l',action='store_true')`

看到命令定义变成了 `ls [-h] [-l] [path]`

提供-l选项，例如：

`ls -l` 得到 `Namespace(l=True,path='.')`

`ls` 得到 `Namespace(l=False,path='.')`

这样用True、False来判断用户是否提供了该选项



#### -a 的实现

`parser.add_argument('-a','--all',action='store_true')`

长短选项可以同时给出。



##### 代码

```python
import argparse

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')

args = parser.parse_args()  # 分析参数，同时传入可迭代的参数
# 通过 parse_args() 方法解析参数。它将检查命令行，把每个参数转换为适当的类型然后调用相应的操作。在大多
# 数情况下，这意味着一个简单的 Namespace 对象将从命令行参数中解析出的属性构建。在脚本中，通常 
# parse_args() 会被不带参数调用，而 ArgumentParser 将自动从 sys.argv 中确定命令行参数。
# 这里Namespace对象构建的就是parser.add_argument()定义的参数是否被引用。如使用了-a和-l选项，那么
# namespace()中的all和l就会是True，否则就是False，path就是传入的路径，默认是当前路径，就是点。如果
# parser.add_argument()定义了长短两个选项。如
# parser.add_argument('-a','--all',action='store_true',help='show all files, do not ignore entries starting with .')
# args = parser.parse_args()
# files = listdir(args.path, args.all, args.l, args.human_readable)
# 输出：Namespace(all=True, human_readable=True, l=True, path='/tmp')
# 如果定义了长短选项，要调用长选项，不然会报错
print(args) # 打印名词空间中收集的参数
# args可以调用运行结果中Namespace()中的内容，如all、l、path，调用方法如args.path、args.l、
# args.all。Namespace中显示的内容实际是parser.add_argument()中定义的第一个参数，也就是定义的选
# 项。
parser.print_help() # 打印帮助

# 运行结果
Namespace(all=False, l=False, path='.')
usage: ls [-h] [-l] [-a] [path]
    
list directory contents

positional arguments:
  path        directory

optional arguments:
  -h, --help show this help message and exit
  -l         use a long listing format
  -a,--all   show all files, do not ignore entries starting with.

# parser.parse_args('-l -a /tmp'.split()) 
# 运行结果需要使用print()打印出来或加到上面的args中，如args = parser.parse_args('-l -a /tmp'.split())
Namespace(all=True, l=True, path='/tmp')
```



##### ls 业务功能的实现

到目前为止，已经解决了参数的定义和传参的问题，下面就要解决业务问题：

1. 列出所有指定路径的文件，默认是不递归的
2. -a 显示所有文件，包括隐藏文件
3. -l 详细列表模式显示



##### 代码实现

```python
import argparse
from pathlib import Path
from datetime import datetime

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')

args = parser.parse_args()  # 分析参数，同时传入可迭代的参数
print(args) # 打印名词空间中收集的参数
parser.print_help() # 打印帮助

def listdir(path, all=False):
    """列出本目录文件"""
    p = Path(path)
    for i in p.iterdir():
        if not all and i.name.startswith('.'): # 不显示隐藏文件
            continue
        yield i.name
        
print(list(listdir(args.path)))

# 获取文件类型
def _getfiletype(f:Path):
    if f.is_dir():
        return 'd'
    elif f.is_block_device():
        return 'b'
    elif f.is_char_device():
        return 'c'
    elif f.is_socket():
        return 's'
    elif f.is_symlink():
        return 'l'
    else:
        return '-'
    
# -rw-rw-r-- python python                5 Oct  25  00:07  test4
def listdirdetail(path, all=False):
    """详细列出本目录"""
    p = Path(path)
    for i in p.iterdir():
# iterdir()表示当路径指向一个目录时，产生该路径下的对象的路径，列出子目录。
        if not all and i.name.startswith('.'): # 不显示隐藏文件
# name()是一个表示最后路径组件的字符串，排除了驱动器与根目录，如果存在的话；
# startswith()如果字符串以指定值开头，则该方法返回True，否则返回False。
            continue
        # mode 硬链接  属主  属组  字节  时间  name
        stat = i.stat()
# stat()返回此路径的信息（类似于 os.stat()）。结果在每次调用此方法时都重新产生。得到的信息包括路径属性st_mode()等，就像是ls -l看到的输出内容一样
        t = _getfiletype(i)
        mode = oct(stat.st_mode)[-3:]
# 获取权限，转为八进制。oct()的返回结果是字符串，结果如0o664，所以我们要取后三位，就是权限了
        atime = datetime.fromtimestamp(stat.st_atime).strftime('%Y %m %d %H:%M:%S')
        # fromtimestamp()返回对应于 POSIX 时间戳例如 time.time() 的返回值的本地日期和时间。
        # st_atime表示文件最后访问时间
        # strftime()用来创建由一个显式格式字符串所控制的表示时间的字符串。
        yield (t, mode, stat.st_uid, stat.st_gid, stat.st_size, atime, i.name)
        
print(list(listdirdetail(args.path))) 
```

mode 是整数，八进制描述的权限，最终显示为rwx的格式。

方法1

```python
modelist = ['r','w','x','r','w','x','r','w','x']
# modelist = list('rwxrwxrwx')，这样也可以
def _getmodestr(mode:int):
    m = mode & 0o777
# 把上面定义的mode变量与0o777相与
    # print(mode)
    # print(m, bin(m))
    mstr = ''
    for i,v in enumerate(bin(m)[-9:]):
        if v == '1':
            mstr += modelist[i]
        else:
            mstr += '-'
    return mstr
```



方法2：

```python
modelist = dict(zip(range(9),['r','w','x','r','w','x','r','w','x']))
# zip() 函数用于将可迭代的对象作为参数，将对象中对应的元素打包成一个个元组，然后返回由这些元组组成的列表。如果各个迭代器的元素个数不一致，则返回列表长度与最短的对象相同，利用 * 号操作符，可以将元组解压为列表。
def _getmodestr(mode:int):
    m = mode & 0o777
    mstr = ''
    for i in range(8,-1,-1):
        if m >> i & 1:
            mstr += modelist[8-i]
        else:
            mstr += '-'
    return mstr
```



##### 合并列出文件函数

listdirdetail 和listdir几乎一样，重复太多，合并

```python
import argparse
from pathlib import Path
from datetime import datetime

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')

args = parser.parse_args()  # 分析参数，同时传入可迭代的参数
print(args) # 打印名词空间中收集的参数
parser.print_help() # 打印帮助

def _getfiletype(f:Path):
# 这里的参数定义成f:Path，这样下面就方便调用f的方法。但这不会做强制类型检查
    """获取文件类型"""
    if f.is_dir():
        return 'd'
    elif f.is_block_device():
        return 'b'
    elif f.is_char_device():
        return 'c'
    elif f.is_socket():
        return 's'
    elif f.is_symlink():
        return 'l'
    elif f.is_fifo():  # pipe
        return 'p'
    else:
        return '-'
    
modelist = dict(zip(range(9),['r','w','x','r','w','x','r','w','x']))
def _getmodestr(mode:int):
    m = mode & 0o777
    mstr = ''
    for i in range(8,-1,-1):
        if m >> i & 1:
            mstr += modelist[8-i]
        else:
            mstr += '-'
    return mstr

def listdir(path, all=False, detail=False):
    """详细列出本目录"""
    p = Path(path)
    for i in p.iterdir():
        if not all and i.name.startswith('.'):   # 不显示隐藏文件
            continue
        if not detail:
            yield (i.name,)
        else:
            # -rw-rw-r--   1    python    python    5  Oct  25  00:07  test4
            # mode       硬链接  属主        属组     字节 时间             name
            stat = i.stat()
            mode = _getfiletype(i) + _getmodestr(stat.st_mode)
            atime = datetime.fromtimestamp(stat.st_atime).strftime('%Y %m %d %H:%M:%S')
            yield (mode, stat.st_nlink, stat.st_uid, stat.st_gid, stat.st_size, atime, i.name)
            
for x in listdir(args.path,detail=True):
# args.path可以取得args变量定义时传给parser.parse_args()的参数，也就是路径。
# detail默认是False，只显示文件名称。
    print(x)
```



##### 排序

ls 的显示是把文件名按照升序排序输出

```python
# 排序
sorted(listdir(args.path, detail=True), key=lambda x: x[len(x) - 1])
```



##### 完整代码

再次重构代码

```python
import argparse
from pathlib import Path
from datetime import datetime

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',add_help=True,description='list directory contents')
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')

args = parser.parse_args()  # 分析参数，同时传入可迭代的参数
print(args) # 打印名词空间中收集的参数
parser.print_help() # 打印帮助

def listdir(path, all=False, detail=False):
    def _getfiletype(f:Path):
        """获取文件类型"""
        if f.is_dir():
            return 'd'
        elif f.is_block_device():
            return 'b'
        elif f.is_char_device():
            return 'c'
        elif f.is_socket():
            return 's'
        elif f.is_symlink():
            return 'l'
        elif f.is_fifo(): # pipe
            return 'p'
        else:
            return '-'
        
    modelist = dict(zip(range(9),['r','w','x','r','w','x','r','w','x']))

    def _getmodestr(mode: int):
        m = mode & 0o777
        mstr = ''
        for i in range(8, -1, -1):
            if m >> i & 1:
                mstr += modelist[8 - i]
            else:
                mstr += '-'
        return mstr
    
    def _listdir(path, all=False, detail=False):
        """详细列出本目录"""
        p = Path(path)
    	for i in p.iterdir():
        	if not all and i.name.startswith('.'):   # 不显示隐藏文件
            	continue
        	if not detail:
            	yield (i.name,)
        	else:
                # -rw-rw-r--   1    python    python    5  Oct  25  00:07  test4
                # mode       硬链接  属主        属组     字节 时间             name
                stat = i.stat()
                mode = _getfiletype(i) + _getmodestr(stat.st_mode)
                atime = datetime.fromtimestamp(stat.st_atime).strftime('%Y %m %d %H:%M:%S')
                yield (mode, stat.st_nlink, stat.st_uid, stat.st_gid, stat.st_size, atime, i.name)
                
    yield from sorted(_listdir(path, all, detail), key=lambda x: x[len(x) - 1])
if __name__ == '__main__':
	args = parser.parse_args() # 分析参数，同时传入可迭代的参数
	print(args) # 打印名词空间中收集的参数
	parser.print_help() # 打印帮助
	files = listdir(args.path, args.all, args.l)
	print(list(files))
```



#### -h 的实现

-h, --human-readable，如果-l 存在，-h 有效

1. 增加选项参数

```python
parser = argparse.ArgumentParser(prog='ls',description='list directory contents',add_help=False)
parser.add_argument('-h', '--human-readable', action='store_true', help='with -l, print sizes in human readable format')
```

2. 增加一个函数，能够解决单位转换的

```python
def _gethuman(size: int):
    units = ' KMGTP'
    depth = 0
    while size>=1000:
        size = size // 1000
        depth += 1
    return '{}{}'.format(size, units[depth])
```

3. 在-l逻辑部分增加处理

```python
size = stat.st_size if not human else _gethuman(stat.st_size)
```



##### 其他的完善

uid、gid的转换

pwd模块，The password database ，提供访问Linux、Unix的password文件的方式。windows没有。

`pwd.getpwuid(Path().stat().st_uid).pw_name`

grp模块，Linux、Unix获取组信息的模块。windows没有

`grp.getgrgid(Path().stat().st_gid).gr_name`

pathlib模块，Path().group()或者Path().owner()也可以，本质上它们就是调用pwd模块和grp模块

由于windows不支持，这次可以不加这个uid、gid的转换



##### 代码改进

```python
import argparse
from pathlib import Path
from datetime import datetime

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',description='list directory contents',add_help=False)
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')
parser.add_argument('-h', '--human-readable', action='store_true', help='with -l, print sizes in human readable format')

def listdir(path, all=False, detail=False, human=False):
    def _getfiletype(f:Path):
        """获取文件类型"""
        if f.is_dir():
            return 'd'
        elif f.is_block_device():
            return 'b'
        elif f.is_char_device():
            return 'c'
        elif f.is_socket():
            return 's'
        elif f.is_symlink():
            return 'l'
        elif f.is_fifo(): # pipe
            return 'p'
        else:
            return '-'
        
    modelist = dict(zip(range(9),['r','w','x','r','w','x','r','w','x']))

    def _getmodestr(mode: int):
        m = mode & 0o777
        mstr = ''
        for i in range(8, -1, -1):
            if m >> i & 1:
                mstr += modelist[8 - i]
            else:
                mstr += '-'
        return mstr
    
    def _gethuman(size: int):
        units = ' KMGTP'
        depth = 0
        while size>=1000:
            size = size // 1000
            depth += 1
        return '{}{}'.format(size,units[depth])
            
    def _listdir(path, all=False, detail=False):
        """详细列出本目录"""
        p = Path(path)
    	for i in p.iterdir():
        	if not all and i.name.startswith('.'):   # 不显示隐藏文件
            	continue
        	if not detail:
            	yield (i.name,)
        	else:
                # -rw-rw-r--   1    python    python    5  Oct  25  00:07  test4
                # mode       硬链接  属主        属组     字节 时间             name
                stat = i.stat()
                mode = _getfiletype(i) + _getmodestr(stat.st_mode)
                atime = datetime.fromtimestamp(stat.st_atime).strftime('%Y %m %d %H:%M:%S')
                size = str(stat.st_size) if not human else _gethuman(stat.st_size)
                yield (mode, stat.st_nlink, stat.st_uid, stat.st_gid, stat.st_size, atime, i.name)

    # 排序            
    yield from sorted(_listdir(path, all, detail), key=lambda x: x[len(x) - 1])
if __name__ == '__main__':
	args = parser.parse_args() # 分析参数，同时传入可迭代的参数
	print(args) # 打印名词空间中收集的参数
	parser.print_help() # 打印帮助
	files = listdir(args.path, args.all, args.l)
	print(list(files))
```



##### 改进mode的方法

使用stat模块

```python
import stat
from pathlib import Path
stat.filemode(Path().stat().st_mode)
# stat().st_mode()可以直接取到文件的权限
```



##### 最终代码

```python
实现ls命令功能，实现-l、-a和--all、-h选项
实现显示路径下的文件列表
-a和--all显示包含开头的文件
-l详细列表显示
-h和-l配合，人性化显示文件大小，例如1K、1G、1T等，可以认为1G=1000M
c字符；d目录；-普通文件；l软链接；b块设备；s socket文件；p pipe文件，即FIFO
-rw-rw-r--   1    python    python    5  Oct  25  00:07  test4
mode       硬链接  属主        属组     字节 时间             name
按照文件名排序输出，可以和ls的顺序不一样，但要求文件名排序
要求详细列表显示时，时间可以按照"年-月-日 时:分:秒"  格式显示

1. 导入模块
2. 定义参数
3. 定义函数，逻辑是先定义获取文件大小的子函数；再定义获取文件信息的子函数。获取文件大小的子函数通过与1000整除得到文件大小的单位；获致文件信
息的子函数通过传入的几个参数进行判断，如是否有路径，没有就使用默认的当前路径；all是否为False，如果为False并且文件是以点开头的文件，就跳出
本轮循环；如果为True，就再判断传入的human是否为False，如果为False就显示文件的名称，如果为True就显示文件的详细信息。
4. 最后返回按文件名排序后的结果

import argparse
import stat
from pathlib import Path
from datetime import datetime

# 获得一个参数解析器
parser = argparse.ArgumentParser(prog='ls',description='list directory contents',add_help=False)
# prog：默认情况下，ArgumentParser 对象使用 sys.argv[0] 来确定如何在帮助消息中显示程序名称。这一默
# 认值几乎总是可取的，因为它将使帮助消息与从命令行调用此程序的方式相匹配。
# add_help：默认情况下，ArgumentParser 对象添加一个简单的显示解析器帮助信息的选项。这里设置为False
# 是因为下面还要设置-h选项，如果这里再加一个帮助会报错有重复。
parser.add_argument('path',nargs='?',default='.',help="directory")  
# 位置参数，可有可无，缺省值，帮助 
parser.add_argument('-l',action='store_true',help='use a long listing format')
# -l选项为了显示非隐藏文件的普通文件 
parser.add_argument('-a','--all',action='store_true',help='show all files,do not ignore entries starting with .')
parser.add_argument('-h', '--human-readable', action='store_true', help='with -l, print sizes in human readable format')
# -h选项是为了显示路径名称的详细信息
# 这里虽然定义的是--human-readable，但在Namespace中只能拿到human_readable，如果定义的是
# --human_readable，Namespace中拿到的还是human_readable。拿到的只有下划线连接

def listdir(path, all=False, detail=False, human=False):
    def _gethuman(size: int):  # 不想被调用的函数就用下划线开头
        units = ' KMGTP'
        depth = 0
        while size>=1000:
            size = size // 1000
            depth += 1
        return '{}{}'.format(size,units[depth])
    
    def _listdir(path, all=False, detail=False, human=False):
        """详细列出本目录"""
        p = Path(path)
        # 这时p的类型就不是字符串了，而是pathlib下的一个类型，系统不同，这个类型也不同
    	for i in p.iterdir():
        	if not all and i.name.startswith('.'):   # 不显示隐藏文件
            	continue
        	if not detail:
            	yield (i.name,)
        	else: # -l
                # -rw-rw-r--   1    python    python    5  Oct  25  00:07  test4
                # mode       硬链接  属主        属组     字节 时间             name
                st = i.stat()
                mode = stat.filemode(st.st_mode)
                # stat.filemode用于将文件模式转换为 '-rwxrwxrwx' 形式的字符串
                # st.st_mode是得到mode，这是一种inode 保护模式。另外还有ST_UID等。
                atime = datetime.fromtimestamp(st.st_atime).strftime('%Y-%m-%d %H:%M:%S')
                size = str(st.st_size) if not human else _gethuman(st.st_size)
                yield (mode, st.st_nlink, st.st_uid, st.st_gid, size, atime, i.name)
    
    # 排序            
    yield from sorted(_listdir(path, all, detail, human), key=lambda x: x[len(x) - 1])
    # _listdir()中的参数是从最外层的listdir()函数得到的，所以要与listdir()的参数名一样
# _listdir()的返回值就是待排序的对象，lambda x: x[len(x) - 1]中的x指定就是前面的返回结果，
# len(x)-1就是统计前面返回结果中的元素数减1，再根据这个得数进行排序，也就是根据_listdir返回的最后一个
# 文件名称排序。这里也可以写为key=lambda x: x[-1]
if __name__ == '__main__':
	args = parser.parse_args() # 分析参数，同时传入可迭代的参数
	print(args) # 打印名词空间中收集的参数
	parser.print_help() # 打印帮助信息
	files = listdir(args.path, args.all, args.l, args.human_readable)
# 这里调用了args的各种方法，结果都是True。传入listdir函数的参数就是'/tmp',True,True,True
# 另外，这里要将所有参数传入listdir，如listdir(args.path, args.all, args.l, args.human_readable)
# 之后通过外部调用这些参数来决定使用默认值还是传入的值，也就是这里是否有路径，没有就用默认的当前路径，如
# 果使用了参数，就显示为True，否则显示为False。
# 此处以位置参数一一对应将参数传入listdir()函数。这里如果要传入指定的字符要加引号，数字不需要
	print(list(files))
    
=======================================================================================
当待排序列表的元素由多字段构成时，我们可以通过sorted(iterable，key，reverse)的参数key来制定我们根据那个字段对列表元素进行排序。
　　key=lambda 元素: 元素[字段索引]
　　例如：想对元素第二个字段排序，则
　　key=lambda y: y[1] 备注：这里y可以是任意字母，等同key=lambda x: x[1]
看几个简单的例子。

listA = [3, 6, 1, 0, 10, 8, 9]
print(sorted(listA))

listB = ['g', 'e', 't', 'b', 'a']
print(sorted(listB))
print(sorted(listB, key=lambda y: y[0]))

listC = [('e', 4), ('o', 2), ('!', 5), ('v', 3), ('l', 1)]
print(sorted(listC, key=lambda x: x[1]))

#结果一
[0, 1, 3, 6, 8, 9, 10]
#结果二
['a', 'b', 'e', 'g', 't']
['a', 'b', 'e', 'g', 't']
#结果三
[('l', 1), ('o', 2), ('v', 3), ('e', 4), ('!', 5)]
=======================================================================================
```



##### 测试

```python
$ python xxx.py -lah
$ python xxx.py /etc/ -lah
```



##### 思考

如果要实现ls -lah /etc /tmp /home 怎么实现