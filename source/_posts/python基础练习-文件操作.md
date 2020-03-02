---
title: python基础练习-文件操作
date: 2020-01-10 12:35:38
tags: 文件操作
categories: python
---

### 单词统计增加忽略单词

对sample文件进行不区分大小写的单词统计

要求用户可以排除一些单词的统计，例如a、the、of等不应该出现在具有实际意义的统计中，应当忽略。

要求，全部代码使用函数封装、调用完成

之前代码中，切分单词的太繁琐，因为makekey1函数已经可以直接把一行数据切成一个个单词了，所以对上面的代码重新封装。

```python
def makekey2(line:str, chars=set("""!'"#./\()[],*- \r\n""")):
    start = 0
    
    for i,c in enumerate(line):
        if c in chars:
            if start == i:  # 如果紧挨着还是特殊字符，start一定等于i
                start += 1 # 加1并continue
                continue
            yield line[start:i]
            start = i + 1  # 加1是跳过这个不需要的特殊字符c
    else:
        if start < len(line):  # 小于，说明还有有效的字符，而且一直到末尾
            yield line[start:]
# 这里不再加入列表中，而使用惰性求值，用一个再生成一个            
def wordcount(filename, encoding='utf8', ignore=set()):
    d = {}
    with open(filename, encoding=encoding) as f:
        for line in f:
            for word in map(str.lower, makekey2(line)):
                if word not in ignore:
                    d[word] = d.get(word, 0) + 1
    return d

def top(d:dict, n=10):
    for i,(k,v) in enumerate(sorted(d.items(), key=lambda item: item[1], reverse=True)):
# 加一个序号方便求出前几位的值
    	if i > n:
            break
        print(k,v)
        # 因为enumerate()函数从0开始编号，所以如果i>n退出循环的话，会打印11行内容
# 单词统计前几名
top(wordcount('sample', ignore={'the', 'a'}))
```



### 转换为json文件

有一个配置文件test.ini内容如下，将其转换成json格式文件

```python
[DEFAULT]
a = test

[mysql]
default-character-set=utf8
a = 1000

[mysqld]
datadir = /dbserver/data
port = 33060
character-set-server=utf8
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
```

遍历ini文件的字典即可

```python
from configparser import ConfigParser
# configparser模块主要用于读取配置文件，格式如my.cnf
import json

filename = 'test.ini'
jsonname = 'test.json'

cfg = ConfigParser()
cfg.read(filename)

dest = {}

for sect in cfg.sections():
# cfg.sections()返回的配置文件中配置段标题中的内容，如[mysql]中的mysql
    print(sect, cfg.items(sect))
# sect是配置段的名称，cfg.items()返回的配置文件中每行的配置键值对，如：[('a', '1000'), ('default-character-set', 'utf8')]，每个配置段下的配置信息会组成一个列表
    dest[sect] = dict(cfg.items(sect))
    
json.dump(dest, open(jsonname, 'w'))
#  json.dump是将对象序列化到文件对象，就是存入文件
# $ python -m json.tool test.json
```

