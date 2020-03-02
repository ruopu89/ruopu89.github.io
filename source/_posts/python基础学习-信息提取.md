---
title: python基础学习-信息提取
date: 2020-02-06 10:28:32
tags: 日志分析
categories: python
---

### 日志分析

#### 概述

生产中会生成大量的系统日志、应用程序日志、安全日志等等日志，通过对日志的分析可以了解服务器的负载、健康状况，可以分析客户的分布情况、客户的行为，甚至基于这些分析可以做出预测。

一般采集流程

日志产出 -> 采集（Logstash、Flume、Scribe）-> 存储 -> 分析 -> 存储（数据库、NoSQL）-> 可视化

开源实时日志分析ELK平台

Logstash收集日志，并存放到ElasticSearch集群中，Kibana则从ES集群中查询数据生成图表，返回浏览器端



#### 分析的前提

##### 半结构化数据

日志是半结构化数据，是有组织的，有格式的数据。可以分割成行和列，就可以当做表理解和处理了，当然也可以分析里面的数据。

##### 文本分析

日志是文本文件，需要依赖文件IO、字符串操作、正则表达式等技术。

通过这些技术就能够把日志中需要的数据提取出来。

```shell
182.60.21.153 - - [19/Feb/2013:10:23:29 +0800] "GET /o2o/media.html?menu=3 HTTP/1.1" 200 16691 "-" "Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)"
```

这是最常见的日志，nginx、tomcat等WEB Server都会产生这样的日志。如何提取出数据？这里面每一段有效的数据对后期的分析都是必须的。

##### 提取数据

一、空格分割

```python
with open('xxx.log') as f:
    for line in f:
        for field in line.split():
            print(field)
```

缺点：

数据并没有按照业务分割好，比如时间就被分开了，URL相关的也被分开了，User Agent的空格最多，被分割了。所以，定义的时候不选用这种在filed中出现的字符就可以省很多事，例如使用'\x01'这个不可见的ASCII，print('\x01')试一试

能否依旧是空格分割，但是遇到双引号、中括号特殊处理一下？

思路：

先按照空格切分，然后一个个字符迭代，但如果发现是[或者"，则就不判断是否空格，直到]或者"结尾，这个区间获取的就是时间等数据。

```python
line = '''182.60.21.153 - - [19/Feb/2013:10:23:29 +0800] \
"GET /o2o/media.html?menu=3 HTTP/1.1" 200 16691 "-" \
"Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)"'''

CHARS = set(" \t")

def makekey(line:str):
    start = 0
    skip = False
    for i,c in enumerate(line):
        if not skip and c in '"[': # [ 或第一个引号
# 如果skip是False并且c是前一个双引号或左中括号
            start = i + 1
# 这里记录的是双引号或中括号中内容的起始索引值
            skip = True
        elif skip and c in '"]': # 第二个引号或]
            skip = False
            yield line[start:i]
# i这时就是双引号或中括号中内容的结束索引值，这里就是取双引号或中括号中的内容
            start = i + 1
# 再修正start的下一个起始位置
            continue
# 如果中括号或双引号都匹配过了，这里就跳出本轮循环。
            
        if skip: # 如果遇到[或第一个引号就跳过
            continue
# 如果skip是True这里就跳出本轮循环，什么条件下会出现这种情况？是否是匹配了左侧中括号或左双引号后，还没有匹配右中括号或右双引号时，就会执行到这里，进入这里判断时，skip是True，而c又是左双引号或左中括号时，也就是上面的判断中满足第一条的条件就会到这里，所以这时要跳出本轮循环。也就是匹配了左括号，要跳出本轮循环，因为上面没有跳出的设置，所以这里通过对skip的判断跳出本轮循环。如：[19/Feb/2013:10:23:29 +0800]这样的值，在上面就会被判断出来，最后按一个元素返回。
        if c in CHARS:
# 不在中括号或双引号的内容会到这里判断，如果不是空格或\t就会进入下一次循环
            if start == i:   
# start的值与i的值从开始就是一致的
                start = i + 1
# 修正start的值和下一次的i值一样大，并进入下一轮循环 
                continue
# 这个判断是为了去除单独的空白元素的，如果不加这个判断，会返回下面的结果，可以看到有''也是一个元素
#['182.60.21.153', '-', '-', '19/Feb/2013:10:23:29 +0800', '', 'GET /o2o/media.html?menu=3 HTTP/1.1', '', '200', '16691', '-', '', 'Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)']
# 加入这个判断后，就不会有''这样的元素了。因为i的值起码要比start加1，这样才说明匹配到了一个非符号的元素
# 值，比如一个字母或数字，如：a 32，如果匹配到a，那么i一定是比start大1的
            yield line[start:i]
# 返回从start到i的内容，因为c属于CHARS，说明遇到了空白
            start = i + 1
    else:
        if start < len(line):
            yield line[start:]
# 当上面的循环结束后，如果start比字符串的总长度小，说明还没有到字符串的结尾，还有没取完的元素，所以就把start到结尾的值取出             
print(list(makekey(line)))
```



##### 类型转换

fields中的数据是有类型的，例如时间、状态码等。对不同的field要做不同的类型转换，甚至是自定义的转换

**时间转换**

19/Feb/2013:10:23:29 +0800   对应格式是

%d/%b/%Y:%H:%M:%S %z

使用的函数是datetime类的strptime方法

```python
import datetime

def convert_time(timestr):
    return datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z')
```

上面的代码可以转换为

```python
lambda timestr:datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z')
```

**状态码和字节数**

都是整型，使用int函数转换

##### 请求信息的解析

GET /o2o/media.html?menu=3 HTTP/1.1

method url protocol 三部分都非常重要

```python
def get_request(request:str):
    return dict(zip(['method','url','protocol'],request.split()))
```

上面的代码可以转换为

```python
lambda request:dict(zip(['method','url','protocol'],request.split()))
```

##### 映射

对每一个字段命名，然后与值和类型转换的方法对应。解析每一行是有顺序的。

```python
import datetime

line = '''182.60.21.153 - - [19/Feb/2013:10:23:29 +0800] \
"GET /o2o/media.html?menu=3 HTTP/1.1" 200 16691 "-" \
"Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)"'''

CHARS = set(" \t")

def makekey(line:str):
    start = 0
    skip = False
    for i,c in enumerate(line):
        if not skip and c in '"[':
            start = i + 1
            skip = True
        elif skip and c in '"]':
            skip = False
            yield line[start:i]
            start = i + 1
            continue
            
        if skip:
            continue
            
        if c in CHARS:
            if start == i:
                start = i + 1
                continue
            yield line[start:i]
            start = i + 1
    else:
        if start < len(line):
            yield line[start:]
            
names = ('remote','','','datetime','request','status','length','','useragent')

ops = (None,None,None,lambda timestr:datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z'),
      lambda request: dict(zip(['method','url','protocol'],request.split())),
      int,int,None,None
      )
# zip()函数先将列表与后面的字符串组合成元组，再用dict()将其转换为字典
def extract(line:str):
    return dict(map(lambda item: (item[0], item[2](item[1]) if item[2] is not None else item[1]),zip(names, makekey(line),ops)))
# 这里zip()函数只是将三个变量中对应位置的值组合在一起，如第一个值是('remote', '182.60.21.153', None)。lambda定时了匿名函数，如果传入的元素的第三个值是None，就返回item[0], item[2](item[1])，否则返回item[1]。之后用map函数返回一个元组，map()函数可以根据提供的函数对指定的序列做映射。最后用dict函数将元组变成字典。这里的方法就是使用map、zip、dict等函数将值都组合成字典

print(extract(line))
```

二、正则表达式提取

构造一个正则表达式提取需要的字段，改造extrace函数、names和ops

```python
names = ('remote','datetime','method','url','protocol','status','length','useragent')

ops = (None, lambda timestr: datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z'),
      None,None,None,int,int,None)

pattern = '''([\d.]{7,}) - - \[([/\w +:]+)\] "(\w+) (\S+) ([\w/\d.]+)" (\d+) (\d+) .+ "(.+)"'''
```

能够使用命名分组

进一步改造pattern为命名分组，ops也就可以和名词对应了，names就没有必要存在了

```python
ops = {
    'datetime': lambda timestr: datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z'),
    'status':int,
    'length':int
}

pattern = '''(?P<remote>[\d.]{7,}) - - \[(?P<datetime>[/\w +:]+)\] \
"(?P<method>\w+) (?P<url>\S+) (?P<protocol>[\w/\d.]+)" \
(?P<status>\d+) (?P<length>\d+) .+ "(?P<useragent>.+)"'''
```

改造后的代码

```python
import datetime
import re

line = '''182.60.21.153 - - [19/Feb/2013:10:23:29 +0800] \
"GET /o2o/media.html?menu=3 HTTP/1.1" 200 16691 "-" 
"Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)"'''

ops = {
    'datetime': lambda timestr: datetime.datetime.strptime(timestr, '%d/%b/%Y:%H:%M:%S %z'),
    'status':int,
    'length':int
}

pattern = '''(?P<remote>[\d.]{7,}) - - \[(?P<datetime>[/\w +:]+)\] \
"(?P<method>\w+) (?P<url>\S+) (?P<protocol>[\w/\d.]+)" \
(?P<status>\d+) (?P<length>\d+) .+ "(?P<useragent>.+)"'''

regex = re.compile(pattern)

def extract(line:str) -> dict:
    matcher = regex.match(line)
    return {k:ops.get(k, lambda x:x)(v) for k,v in matcher.groupdict().items()}

print(extract(line))
```

##### 异常处理

日志中不免会出现一些不匹配的行，需要处理。

这里使用re.match方法，有可能匹配不上。所以要增加一个判断

采用抛出异常的方式，让调用者获得异常并自行处理。

```python
def extract(logline:str) -> dict:
    """返回字段的字典，抛出异常说明匹配失败"""
    matcher = regex.match(line)
    if matcher:
        return {k:ops.get(k, lambda x:x)(v) for k,v in matcher.groupdict().items()}
    else:
        raise Exception('No match')
```

但是，也可以采用返回一个特殊值的方式，告知调用者没有匹配。

```python
def extract(logline:str) -> dict:
    """返回字段的字典，如果返回None说明匹配失败"""
    matcher = regex.match(line)
    if matcher:
        return {k:ops.get(k, lambda x:x)(v) for k,v in matcher.groupdict().items()}
    else:
        return None
```

通过返回值，在函数外部获取了None，同样也可以采取一些措施。本次采用返回None的实现。



#### 实例

```python
# 137课开始讲日志分析的项目
import datetime
import re
from queue import Queue
import threading
from pathlib import Path
from collections import defaultdict
from user_agents import parse

logline = '''182.60.21.153 - - [19/Feb/2013:10:23:29 +0800] \
"GET /o2o/media.html?menu=3 HTTP/1.1" 200 16691 "-" \
"Mozilla/5.0 (compatible; EasouSpider; +http://www.easou.com/search/spider.html)"'''

pattern = '''(?P<remote>[\d\.]{7,}) - - \[(?P<datetime>[^\[\]]+)\] "(?P<request>[^"]+)" (?P<status>\d+) (?P<size>\d+) "[^"]+" "(?P<useragent>[^"]+)"'''
regex = re.compile(pattern)
# 这两行代码因为编译一次就可以了  ，所以放在外面了
def extract(line):
    matcher = regex.match(line)
# 如果pattern没法与logline一一对应，那么这里会返回None，下面也没法使用groupdict()，会提
# 示："AttributeError: 'NoneType' object has no attribute 'groupdict'"
#    return matcher.groupdict()
	if matcher:
		return {k:ops.get(k,lambda x:x)(v) for k,v in matcher.groupdict().items()}
# 分组的名称会被当作字典的键名，如remote，datetime等。这里直接返回字典解析式，就不用下面再返回了
# groupdit()是正则表达式的方法，它返回一个字典，包含所有经命名的匹配子群，键值是子群名。也就是将组名与
# 匹配到的内容组成字典。ops中没有的键值这里就直接返回字典中的值，如果是ops中有的键值，就用ops中的键处理
# 一下字典中的值，因为ops中有的键值都是函数
	else:
        raise Exception('No match')   # 错误处理，如果matcher没有匹配到就返回None
    
# def convert_time(timestr):
#     fmtstr = "%d/%b/%Y:%H:%M:%S %z"
#     dt = dtetime.datetime.strptime(timestr, fmtstr)
# 	print(type(dt))
#      return dt

# def convert_request(request:str):
#     return dict(zip(('method','url','protocol'),request.split()))

# names = ['remote','','','datetime','request','status','size','','useragent']

# ops = [None,None,None,convert_time,convert_request,int,int,None,None]

ops = {
    'datetime':lambda timestr:datatime.datetime.strptime(timestr,"%d/%b/%Y:%H:%M:%S %z"),  
    #  这一行lambda可以代理上面的convert_time函数
    'status':int,  # 用int函数处理数据。因为默认是字符串格式 ，所以这里要用int处理一下
    'size':int,   # 因为默认就是字符串，所以第一个remote就不用处理了
    'request':lambda request:dict(zip(('method','url','protocol'),request.split()))
    # 这一行lambda可以代替上面的convert_request函数
    'useragent':lambda useragent:parse(useragent)  # 分析浏览器
}

# d = {}
#for k,v in extract(logline).items():   # k是每个fields的命名
#	d[k] = ops.get(k, lambda x:x)(v)
    # 这里如果可以查询到k的值，就用k值对应的函数处理v；如果没找到k值，就用lambda函数处理v，lambda函
    # 数在这里的意思是给什么就返回什么，也就是直接返回v。lambda的地方不能写成v，因为还要将这个默认值当
    # 函数去处理v，所以如果写成v，就会变成v(v)，这会报错。
# d = {k:ops.get(k,lambda x:x)(v) for k,v in extract(logline).items()}
# 上面的三行代码转换为这一行。让上面的extract函数直接返回这个字典解析式更好些

def openfile(path:str):
    with open(str(p)) as f:   # open()方法里需要字符串，要用str()函数转一下
		for line in f:
        	d = extract(line)
            if d:
            	yield d
            else:
                # TODO  不合格数据有多少
                continue
    

# 下面的调用方法
def load(*path):   # 读一批路径。这是一个生成器函数，yield出来的是字典
    """文件装载"""
    for file in path:
        p = Path(file)
        if not p.exists():
            continue
        if p.is_dir():   # 这里不递归处理子目录，也可以使用**/*log的方法
            for x in p.iterdir():
                if x.is_file():
#                    with open(str(p)) as f:   # open()方法里需要字符串，要用str()函数转一下
#                        for line in f:
#                            d = extract(line)
#                            if d:
#                                yield d
#                            else:
#                                # TODO  不合格数据有多少
#                                continue
#					gen = openfile(str(x))
#    				for y in openfile(str(x)):
#            			yield y
# 这里不能使用return y，这样会有一个就扔出去了，我们需要的是攒起来一起处理，攒多少个是window函数的事
# openfile(str(x))不是普通的函数调用，它返回的是一个生成器对象，我们需要使用for循环或next拿，那么需
# 要迭代多少个合适呢，所以用yield，这样load就变成一个生成器函数了。有yield的就是生成器函数，返回的是生
# 成器对象。yield from后面是一个可迭代对象就行
					yield from openfile(str(x))  # 将上面两行改为一行
        elif p.is_file():
#            with open(str(p)) as f:   # open()方法里需要字符串，要用str()函数转一下
#                for line in f:
#                    d = extract(line)
#                    if d:
#                        yield d
#                    else:
#                        # TODO  不合格数据有多少
#                        continue
			yield from openfile(str(x))
                
def window(src:Queue, handler, width:int, interval:int):
    # window函数只做移动窗口拿数据的工作，处理在handler函数中做
    # 函数的功能越单一越好。这里的src就是load函数生成的数据，src生成的是字典。load是生成器函数
# current是现在的时间，start是起始时间，width是宽度，表示一次求值的时间窗口宽度，窗口就是下面的
# buffer中的数据，主要是配合Interval计算delta，interval是时间间隔，表示间隔多入处理一次数据
#	i = 0
#    for x in src
#		i += 1
#    	print(x)
#        if i > 10:
#            break
	start = datetime.datetime.strptime('1970/01/01 01:01:01 +0800', '%Y/%m/%d %H:%M:%S %z')
    current = datetime.datetime.strptime('1970/01/01 01:01:02 +0800', '%Y/%m/%d %H:%M:%S %z')
    delta = datetime.timedelta(seconds=width - interval)
    
    buffer = []
    
    # for x in src:
    while True:
        data = src.get()  
# 这里传进来的src是一个Queue，src.get()就是从Queue队列中拿数据的方法。如果没有数据就会阻塞等待，等下
# 一个数据过来。所以上面也不能再用for循环了，而使用while True循环。这里拿到的是load生成器函数处理后
# yield出来的字典。
        if data:
            buffer.append(data)  
# 直接把字典放入buffer中，具体的处理工作由handler执行。不要把加入buffer中的值写死，那样的适用性会很差
            current = data['datetime']   # 当前时间应该是日志中的时间
            
        if (current - start).total_seconds() >= interval:
            ret = handler(buffer)
            print(ret)
            
            start = current   # 调整开始时间
            
            # buffer 的处理
            # tmp = []
            # for i in buffer:
            #     if i['datetime'] > current - delta: 
# 用拿到的时间与current减delta的时间比较，这就是有数据重叠的部分，现在的时间减去delta后的位置就成了处理过的数据要保留部分的起始位置，大于这个位置的数据都要保留，其他的就不要了。可以比对时间窗口的图查看
            #        tmp.append(i)
            buffer = [i for i in buffer if i['datetime'] > current - delta]
            # 留下的数据形成了一个窗口，这是一个新建的buffer，和上面的buffer没关系

def donothing_handler(iterable:list):
    print(iterable)
    return iterable

# 状态码分析
def status_handler(iterable:list):
    d = {}
    for item in iterable:
        key = item['status']
        if key not in d.keys():
            d[key] = 0
        d[key] += 1
    total = sum(d.values())
    # print(d,'!!!')   # 这是字典
    # print(total,'@@@')   # 这是字典键值的和
    # {200: 46, 500: 1} !!!
    # 47 @ @ @
    # {200: 97.87234042553192, 500: 2.127659574468085}
    # {200: 3, 301: 1} !!!
    # 4 @ @ @
    # {200: 75.0, 301: 25.0}
    # {200: 1} !!!
    # 1 @ @ @
    # {200: 100.0}
# 可以计算字典中键值的和，下面再用键值除以键值的和再乘以100就是占比了
	
    return {k:v/total*100 for k,v in d.items()}
# 乘以100是为了计算百分比

# 浏览器分析
ua_dict = defaultdict(lambda :0)
# 这一句从browser_handler函数中移到这里后，会记录所有处理后的结果，如果在browser_handler内，就只会记录一段处理的数据，之后会被重置
def browser_handler(iterable:list):
#     ua_dict = defaultdict(lambda :0)
    for item in iterable:
        ua = item['useragent']
        # ua = parse('')
    	key = (ua.browser.family, ua.browser.version_string)   
        # 字典的key应该可hash，但ua.browser是不可hash的，family和version_string都是字符串
        ua_dict[key] += 1
    return ua_dict
        

# def handler(iterable:list):
#     # TODO
#     return sum(iterable) // len(iterable)

# def size_handler(iterable:list):
#     # TODO
#     pass
# handler是处理数据的，从外面传入，window函数只返回基本的数据

# window(load('test.log'),donothing_handler,10,5)  



# 分发器
def dispatcher(src):   # src是load函数生成的数据
    # 队列列表
    queues = []   # 这是容器，将结果保存下来
    threads = []
    
    def reg(handler, width, interval):  # 注册的是变化的东西，注册的过程就是传参的过程
        q = Queue()   # 每个线程各自用自己的queue
        queues.append(q)   # 注册一次就保存一个q到queues中
        # 注册就分配一个邮箱，为了能调用，把q放到一个队列列表中，不然，q用完就没了
        # window(q, handler, width, interval)
        t = threading.Thread(target=window, args=(q, handler, width, interval))
# 这里是一个调用window函数的过程，每个window函数都应该有自己的q，q就是自定义的队列。因为q执行完会消失，所以在外面创建了queues队列保存q，queues列表中每个元素都是q队列，这个列表就是为了在下面的run函数中迭代用，在run函数中相当于把一份数据x给所有列表中的q一份，这样一份数据就变成了多份数据
        threads.append(t)
        # 因为window函数会阻塞住，所以把它做到一个线程里去
    
    def run():
        for t in threads:
            t.start()   # 这里启动线程，上面的reg只是注册
    
    	for x in src:
# 这里的x就是load生成器函数yield出来的字典，把x这个字典放到q队列中
            for q in queues:   # 给副本，
                q.put(x)   # 给每个q里都送一个x
                
    return reg,run

reg,run = dispatcher(load('test.log'))  # 从这里传参

# reg注册窗口
reg(donothing_handler, 10, 5)
reg(status_handler, 10, 5)
reg(browser_handler, 5, 5)   # 这个窗口数据不需要重叠，所以用了两个一样的数字

# 启动
run()
===============================================================================
# 定义了上面的extract函数后，下面的代码就没有用了
fields = []
flag = False
tmp = ""

# print(fields[10:])
for word in logline.split():
    
    if not flag: 
    	if (word.startswith('[') or word.startswith('"')):  # 以[或"开头
        	tmp = word[1:]
        	if word.endswith(']') or word.endswith('"'):
                tmp = word.strip('[]"')
                fields.append(tmp)
            else:
        		flag = True
        else:
             fields.append(word)  
        continue
    if flag:
        if word.endswith(']') or word.endswith('"'):
            tmp += " " + word[:-1]  # word.strip[']"']
            fields.append(tmp) 
            
            tmp = ""
            flag = False
        else:
            tmp += " " + word
        continue 
    # lst.append(word)   # 如何处理[]与"。上面两个条件都用了continue，所以这句没有用了
print(fields)
d = {}
for i,field in enumerate(fields):
    key = names[i]
    print(ops[i])
    if ops[i]:   # 如果ops[i]不是None
        d[key] = ops[i](field)   
#  当ops[i]是convert_time时，将field传入convert_time函数进行处理。convert_time是我们上面自定义的函数
	else:
    	d[key] = field   # 如果是None的情况
```


