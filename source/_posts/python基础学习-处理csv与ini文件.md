---
title: python基础学习-处理csv与ini文件
date: 2020-01-09 11:57:38
tags: csv&ini
categories: python
---

### CSV文件简介

参考RFC 4180

http://www.ietf.org/rfc/rfc4180.txt

逗号分隔值 Comma-Separated Values。

CSV是一个被行分隔符、列分隔符划分成行和列的文本文件。

CSV不指定字符编码

行分隔符为\r\n，最后一行可以没有换行符

列分隔符常为逗号或者制表符

每一行称为一条记录record

字段可以使用双引号括起来，也可以不使用。如果字段中出现了双引号、逗号、换行符必须使用双引号括起来。如果字段的值是双引号，使用两个双引号表示一个转义。

表头可选，和字段列对齐就行了。

### 手动生成CSV文件

```python
from pathlib import Path
p = Path('o:/tmp/mycsv/test.csv')
parent = p.parent
if not parent.exists():
# exists()表示此路径是否指向一个已存在的文件或目录
    parent.mkdir(parents=True)
    
csv_body = '''\
id,name,age,comment
1,zs,18,"I'm 18"
2,ls,20,"this is a ""test""string."
3,ww,23,"你好

计算机
"
'''
p.write_text(csv_body)
```



### CSV模块

`reader(csvfile,dialect='excel',**fmtparams)`

返回DictReader对象，是一个行迭代器。

delimiter 列分隔符，逗号

lineterminator 行分隔符\r\n

quotechar 字段的引用符号，缺省为"，双引号



双引号的处理：

doublequote 双引号的处理，默认为True。如果和quotechar为同一个，True则使用2个双引号表示，False表示使用转义字符将作为双引号的前缀。

escapechar 一个转义字符，默认为None。

quoting 指定双引号的规则。QUOTE_ALL 所有字段；QUOTE_MINIMAL 特殊字符字段；QUOTE_NONNUMERIC 非数字字段；QUOTE_NONE都不使用引号。

`writer(csvfile, dialect='excel', **fmtparams)`

返回DictWriter的实例。对于 `Writer` 对象，*行* 必须是（一组可迭代的）字符串或数字。

主要方法有 writerow、writerows。

- `csvwriter.writerow`(*row*)

  将参数 *row* 写入 writer 的文件对象，并根据当前设置的变种进行格式化。本方法的返回值就是底层文件对象 *write* 方法的返回值。在 3.5 版更改: 开始支持任意类型的迭代器。

- `csvwriter.writerows`(*rows*)

  将 *rows\*（即能迭代出多个上述 *row* 对象的迭代器）中的所有元素写入 writer 的文件对象，并根据当前设置的变种进行格式化。

writerow(iterable)

```python
import csv

p = Path('o:/tmp/mycsv/test.csv')
with open(str(p)) as f:
    reader = csv.reader(f)
    print(next(reader))
    print(next(reader))
    
rows = [
	[4,'tom',22,'tom'],
	(5,'jerry',24,'jerry'),
	(6,'justin',22,'just\t"in'),
	"abcdefghi",
	((1,),(2,))
]
# 不要忘记每个元素后面的逗号
row = rows[0]
with open(str(p),'a') as f:   # 向test.csv中追加内容
    writer = csv.writer(f)
    writer.writerow(row)  # 写入一行
    writer.writerows(rows)  # 写入多行
```



### ini文件处理

作为配置文件，ini文件格式很流行。

```python
[DEFAULT]
a = test

[mysql]
default-character-set=utf8

[mysqld]
datadir = /dbserver/data
port = 33060
character-set-server=utf8
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
```

中括号里面的部分称为section，译作节、区、段。

每一个section内，都是key=value形成的键值对，key称为option选项。

注意，这里的DEFAULT是缺省section的名字，必须大写。



### configparser

configparser模块的ConfigParser类就是用来操作的。

可以将section当做key，section存储着键值对组成的字典，可以把ini配置文件当做一个嵌套的字典。默认使用的是有序字典。

`read(filenames, encoding=None)`

读取ini文件，可以是单个文件，也可以是文件列表。可以指定文件编码。

`sections()` 返回section列表。缺省section不包括在内。

`add_section(section_name)`增加一个section

`has_section(section_name)` 判断section是否存在

`options(section)` 返回section的所有option，会追加缺省section的option

`has_option(section, option)` 判断section是否存在这个option

`get(section, option, *, raw=False, vars=None[, fallback])` 从指定的段的选项上取值，如果找到返回，如果没有找到就去找DEFAULT段有没有。

`getint(section, option, *, raw=False, vars=None[, fallback])`

`getfloat(section, option, *, raw=False, vars=None[, fallback])`

`getboolean(section, option, *, raw=False, vars=None[, fallback])`

上面三个方法和get一样，返回指定类型数据。

`items(raw=False, vars=None)`

`items(section, raw=False, vars=None)`

没有section，则返回所有section名字及其对象；如果指定section，则返回这个指定的section的键值对组成二元组。

`set(section, option, value)`  section存在的情况下，写入option=value，要求option、value必须是字符串。

`remove_section(section)` 移除section及其所有option

`remove_option(section, option)`  移除section下的option。

`write(fileobject, space_around_delimiters=True)` 将当前config的所有内容写入fileobject中，一般open函数使用w模式

```python
from configparser import ConfigParser

filename = 'test.ini'
newfilename = 'mysql.ini'

cfg = ConfigParser()
cfg.read(filename)
print(cfg.sections())
print(cfg.has_section('client'))

print(cfg.items('mysqld'))
for k,v in cfg.items():
    print(k,type(v))
    print(k,cfg.items(k))
tmp = cfg.get('mysqld','port')
print(type(tmp),tmp)
print(cfg.get('mysqld','a'))
# print(cfg.get('mysqld','magedu'))
print(cfg.get('mysqld','magedu',fallback='python'))

tmp = cfg.getint('mysqld','port')
print(type(tmp),tmp)

if cfg.has_section('test'):
    cfg.remove_section('test')
    
cfg.add_section('test')
cfg.set('test','test1','1')
cfg.set('test','test2','2')

with open(newfilename,'w') as f:
    cfg.write(f)
    
print(cfg.getint('test','test2'))
cfg.remove_option('test','test2')

# 字典操作更简单
cfg['test']['x'] = '100'   # key不存在
cfg['test2'] = {'test2':'1000'}   # section不存在

print('x' in cfg['test'])
print('x' in cfg['test2'])

print(cfg._dict)   # 返回默认字典类型，内部使用有序字典

# 修改后需要再次写入
with open(newfilename,'w') as f:
    cfg.write(f)
```



