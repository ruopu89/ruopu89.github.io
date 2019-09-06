---
title: python基础学习-列表和元组
date: 2019-03-21 13:29:38
tags: 列表和元组
categories: python
---

### 概念

#### 数据结构

> 数据结构是以某种方式(如通过编号)组合起来的数据元素(如数、字符乃至其他数据结构)集合。



#### 序列

> 在Python中，最基本的数据结构为序列(sequence) 。序列中的每个元素都有编号，即其位置或索引，其中第一个元素的索引为0，第二个元素的索引为1，依此类推。Python内置了多种序列，如列表、元组、字符串。列表和元组的主要不同在于，列表是可以修改的，而元组不可以。



##### 列表

```python
# 一个队列，一个排列整齐的队伍
# 列表内的个体称作元素，由若干元素组成列表
# 元素可以是任意对象（数字、字符串、对象、列表等）
# 列表内元素有顺序，可以使用索引
# 线性的数据结构
# 使用[]表示
# 列表是可变的
# 列表list、链表、queue、stack的差异
# 列表不能一开始就定义大小
list()
# 定义一个空列表
list(iterable)
# 从可交互项初始化的新列表
例
lst = list()
lst = []
lst = [2,6,9,'ab']
lst = list(range(5))

>>> edward = ['Edward Gumby', 42]
# 使用列表来表示

>>> edward = ['Edward Gumby', 42]
>>> john = ['John Smith', 50]
>>> database = [edward, john]
>>> database
[['Edward Gumby', 42], ['John Smith', 50]]
# 序列还可包含其他序列，上面是创建一个由数据库中所有人员组成的列表。Python支持一种数据结构的基本概念，名为容器(container)。容器基本上就是可包含其他对象的对象。两种主要的容器是序列(如列表和元组)和映射(如字典) 。在序列中，每个元素都有编号，而在映射中，每个元素都有名称(也叫键)。
```



#### 数字的处理函数

```python
round()
# 这个函数是四舍六入五取偶的
floor()
# 这个函数是向下取整的
ceil()
# 这个函数是向上取整的
int()
# 这个函数是取整数部分的
//
# 整除且向下取整
# python只有长整型，数值没有上限。int也是取整的，如int(1.5)，得1。floor是向下取整的。ceil是向上取整的。round是4舍6入5取偶。 bin是二进制，返回的是字符串。oct是八进制。pi是派。 
bin()
oct()
hex()
# 上面三个是进制函数，返回值是字符串
math.pi
# 派
math.e
# 自如常数
```



#### 类型判断

```python
type(a) == str 
# 这是类型比较的方式
type(obj)
# 返回类型，而不是字符串
isinstance(obj,class_or_tuple)
# 返回布尔值
例：
type(a)
type('abc')
type(123)
isinstance(6,str)
isinstance(6,(str,bool,int))
type(1+True)
type(1+True+2.0)
```



### 通用的序列操作

#### 索引

```python
# 索引，也叫下标
# 正索引：从左至右，从0开始，为列表中每一个元素编号
# 负索引：从右至左，从-1开始
# 正负索引不可以超界，否则引发异常IndexError
# 为了理解方便，可以认为列表是从左至右排列的，左边是头部，右边是尾部，左边是下界，右边是上界
# 列表通过索引访问
# list[index]，index就是索引，使用中括号访问

>>> greeting = 'Hello'
>>> greeting[0]
'H'
# 字符串就是由字符组成的序列。索引0指向第一个元素,这里为字母H。Python没有专门用于表示字符的类型，因此一个字符就是只包含一个元素的字符串。

>>> greeting[-1]
'o'
# 当你使用负数索引时，Python将从右(即从最后一个元素)开始往左数，因此-1是最后一个元素的位置。对于字符串字面量(以及其他的序列字面量)，可直接对其执行索引操作,无需先将其赋给变量。这与先赋给变量再对变量执行索引操作的效果是一样的。
>>> 'Hello'[1]
'e'

>>> fourth = input('Year: ')[3]
Year: 2005
>>> fourth
'5'
# 如果函数调用返回一个序列，可直接对其执行索引操作。例如：如果你只想获取用户输入的年份的第4位

months = [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'
]
endings = ['st', 'nd', 'rd'] + 17 * ['th'] \
+ ['st', 'nd', 'rd'] + 7 * ['th'] \
+ ['st']
# 这是一个列表的拼接，st,nd,rd表示1,2,3号，4-20使用th，之后只要有1,2,3就要用st,nd,rd表示，其他用th表示
year= input('Year: ')
month= input('Month (1-12): ')
day= input('Day (1-31): ')
month_number = int(month)
day_number = int(day)
month_name = months[month_number-1]
ordinal = day + endings[day_number-1]
# 将表示月和日的数要减1，这样才能得到正确的索引。因为months是一个列表，其索引是从0开始的，所以要减1。
print(month_name + ' ' + ordinal + ', ' + year)
上面的程序执行结果如下：
Year: 1974
Month (1-12): 8
Day (1-31): 16
August 16th, 1974
```



#### 切片

```python
# 需要注意：使用切片方法时，切片中指定的第一个索引值是一定会取的，第二个元素不一定取得到。
>>> tag = '<a href="http://www.python.org">Python web site</a>'
>>> tag[9:30]
'http://www.python.org'
# 这是提取tag变量索引9到29的值
>>> tag[32:-4]
'Python web site'
# 提取tag变量索引32到倒数第5个的值。中括号中的数字是前包后不包的。也就是第一个索引指定的元素包含在切片内，但第二个索引指定的元素不包含在切片内。如下：
>>> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
>>> numbers[3:6] 
[4, 5, 6]
>>> numbers[0:1] 
[1]
>>> numbers[7:10]
[8, 9, 10]
# 首先明确指定从第8个元素开始取值，在这里，索引10指的是第11个元素，它并不存在，但确实是到达最后一个元素后再前进一步所处的位置。
>>> numbers[-3:-1]
[8, 9]
# 从倒数第3个元素取到倒数第二个元素
>>> numbers[-3:0]
[]
# 如果第二个元素使用0，那么结果是一个空。因为执行切片操作时，如果第一个索引指定的元素位于第二个索引指定的元素后面(在这里，倒数第3个元素位于第1个元素后面) ，结果就为空序列。
>>> numbers[-3:]
[8, 9, 10]
# 如果要取到最后一个元素，可以不写第二个索引的值
>>> numbers[:3]
[1, 2, 3]
# 同样，如果索引从第一个元素开始取值，也可以不写第一个元素的值
>>> numbers[:]
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 要复制整个序列,可将两个索引都省略。

>>> url = input('Please enter the URL:')
>>> domain = url[11:-4]
>>> print("Domain name: " + domain)
Please enter the URL: http://www.python.org
Domain name: python
# 从类似于http://www.something.com的URL中提取域名

>>> numbers[0:10:1]
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 执行切片操作时，你显式或隐式地指定起点和终点，但通常省略另一个参数，即步长。在普通切片中，步长为1。这意味着从一个元素移到下一个元素，因此切片包含起点和终点之间的所有元素。
>>> numbers[0:10:2]
[1, 3, 5, 7, 9]
>>> numbers[3:6:3]
[4]
>>> numbers[::4]
[1, 5, 9]
# 要从序列中每隔3个元素提取1个，只需提供步长4即可。
>>> numbers[8:3:-1]
[9, 8, 7, 6, 5]
>>> numbers[10:0:-2]
[10, 8, 6, 4, 2]
>>> numbers[0:10:-2]
[]
>>> numbers[::-2]
[10, 8, 6, 4, 2]
>>> numbers[5::-2]
[6, 4, 2]
>>> numbers[:5:-2]
[10, 8]
# 步长不能为0，否则无法向前移动，但可以为负数，即从右向左提取元素。步长为负数时，第一个索引必须比第二个索引大。
```



#### 序列相加

```python
# + -> list
# 连接操作，将两个列表连接起来
# 产生新的列表，原列表不变
# 本质上调用的是__add__()方法

>>> [1, 2, 3] + [4, 5, 6]
[1, 2, 3, 4, 5, 6]
>>> 'Hello,' + 'world!'
'Hello, world!'
>>> [1, 2, 3] + 'world!'
Traceback (innermost last):
File "<pyshell>", line 1, in ?
[1, 2, 3] + 'world!'
TypeError: can only concatenate list (not "string") to list
# 不能拼接列表和字符串，虽然它们都是序列。一般而言，不能拼接不同类型的序列。
```



#### 乘法

```python
# * -> list
# 重复操作，将本列表元素重复n次，返回新的列表。

>>> 'python' * 5
'pythonpythonpythonpythonpython'
>>> [42] * 10
[42, 42, 42, 42, 42, 42, 42, 42, 42, 42]
# 将序列与数x相乘时，将重复这个序列x次来创建一个新序列

>>> sequence = [None] * 10
>>> sequence
[None, None, None, None, None, None, None, None, None, None]
# 空列表是使用不包含任何内容的两个方括号([])表示的。如果要创建一个可包含10个元素的列表，但没有任何有用的内容，可像前面那样使用[42]*10。但更准确的做法是使用[0]*10，这将创建一个包含10个零的列表。然而，在有些情况下，你可能想使用表示“什么都没有”的值，如表示还没有在列表中添加任何内容。在这种情况下，可使用None。在Python中，None表示什么都没有。

sentence = input("Sentence: ")
# 这里是要求输入要在框中显示的内容的
screen_width = 80
# screen_width：屏幕宽度
text_width = len(sentence)
# 文本宽度，len用于取字符串宽度
box_width = text_width + 4
# 框的宽度，这里加的数需要自行调整，示例中加了6，但测试打印出的内容没有达到效果
left_margin = (screen_width - box_width) // 2
# 左边缘的宽度，等于屏幕宽度减去框的宽度最后除以2,这是为了使最后的内容居中
print()
# 打印一个空行
print(' ' * left_margin + '+' + '-' * (box_width-2) + '+')
# ' ' * left_margin是整个内容左边空出来的距离，然后输出一个加号，之后输出"-"，输出的数量是外框的长度减2,因为两侧都有一个加号所以要减2.最后输出一个加号。
print(' ' * left_margin + '| ' + ' ' * text_width  + ' |')
# 实际打印每一行时只要注意左侧的空格数量就可以了。
print(' ' * left_margin + '| ' +       sentence + ' |')
# 通过'| '和' |'使内容与边缘间多出一个空格
print(' ' * left_margin + '| ' + ' ' * text_width + ' |')
print(' ' * left_margin + '+' + '-' * (box_width-2) + '+')
print()
输出结果如下：
Sentence: He's a very naughty boy!
                         +----------------------------------+
                          |                                                     |
                          | He's a very naughty boy! |
                          |                                                     |
                          +---------------------------------+
```



#### 成员资格

```python
# 要检查特定的值是否包含在序列中，可使用运算符in。这个运算符与前面讨论的运算符(如乘法或加法运算符)稍有不同。它检查是否满足指定的条件，并返回相应的值:满足时返回True，不满足时返回False。这样的运算符称为布尔运算符，而前述真值称为布尔值。
>>> permissions = 'rw'
>>> 'w' in permissions
True
>>> 'x' in permissions
False
# 使用成员资格测试分别检查'w'和'x'是否包含在字符串变量permissions中
>>> users = ['mlh', 'foo', 'bar']
>>> input('Enter your user name: ') in users
Enter your user name: mlh
True
# 检查提供的用户名mlh是否包含在用户列表中，这在程序需要执行特定的安全策略时很有用(在这种情况下，可能还需检查密码)。
>>> subject = '$$$ Get rich now!!! $$$'
>>> '$$$' in subject
True
# 检查字符串变量subject是否包含字符串'$$$'，这可用于垃圾邮件过滤器中。
# 相比于其他示例，检查字符串是否包含'$$$'的示例稍有不同。一般而言，运算符in检查指定的对象是否是序列(或其他集合)的成员(即其中的一个元素)，但对字符串来说，只有它包含的字符才是其成员或元素，因此下面的代码完全合理：>>> 'P' in 'Python'		True

database = [
['albert', '1234'],
['dilbert',  '4242'],
['smith',  '7524'],
['jones',  '9843']
]
username = input('User name: ')
pin = input('PIN code: ')
if [username, pin] in database: print('Access granted')
输出结果如下：
User name: jones
PIN code: 9843
Access granted
# 检查用户名和PIN码，程序从用户那里获取一个用户名和一个PIN码，并检查它们组成的列表是否包含在数据库(实际上也是一个列表)中。如果用户名-PIN码对包含在数据库中，就打印字符串'Access granted'

>>> numbers = [100, 34, 678]
>>> len(numbers)
3
>>> max(numbers)
678
>>> min(numbers)
34
>>> max(2, 3)
3
>>> min(9, 3, 2, 5)
2
# 函数len返回序列包含的元素个数，而min和max分别返回序列中最小和最大的元素。
# 最后两个表达式调用max和min时指定的实参并不是序列，而直接将数作为实参。
```



#### 随机数

```python
# random模块
# randint(a,b)返回[a,b]之间的整数
# choice(seq)从非空序列的元素中随机挑选一个元素，比如random.choice(range(10))，从0到9中随机挑选一个整数。random.choice([1,3,5,7])
# randrange([start,]stop[,step])从指定范围内，按指定基数递增的集合中获取一个随机数，基数缺省值为1.random.randrange(1,7,2)
# random.shuffle(list) -> None，就地打乱列表元素
# sample(population,k)从样本空间或总体（序列或者集合类型）中随机取出k个不同的元素，返回一个新的列表
import random
random.sample(['a','b','c','d'],2)
random.sample(['a','a'],2)
```



### 列表

#### 函数list

```python
>>> list('Hello')
['H', 'e', 'l', 'l', 'o']
# 鉴于不能像修改列表那样修改字符串，因此在有些情况下使用字符串来创建列表很有帮助。可将任何序列(而不仅仅是字符串)作为list的参数。
# 要将字符列表(如前述代码中的字符列表)转换为字符串。可使用下面的表达式：''.join(somelist)，其中somelist是要转换的列表。
```



#### 基本的列表操作

```python
* 修改列表：给元素赋值
list[index] = value
# 索引不要超界
>>> x = [1, 1, 1]
>>> x[1] = 2
# 将索引为1的值改为2
>>> x
[1, 2, 1]
# 不能给不存在的元素赋值，因此如果列表的长度为2，就不能给索引为100的元素赋值。要这样做，列表的长度至少为101。

* 删除元素
>>> names = ['Alice', 'Beth', 'Cecil', 'Dee-Dee', 'Earl']
>>> del names[2]
>>> names
['Alice', 'Beth', 'Dee-Dee', 'Earl']

* 给切片赋值
>>> name = list('Perl')
>>> name
['P', 'e', 'r', 'l']
>>> name[2:] = list('ar')
# 将索引为2到最后的一个元素改为ar，perl就变成了pear
>>> name
['P', 'e', 'a', 'r']

>>> name = list('Perl')
>>> name[1:] = list('ython')
>>> name
['P', 'y', 't', 'h', 'o', 'n']
# 通过使用切片赋值，可将切片替换为长度与其不同的序列。

>>> numbers = [1, 5]
>>> numbers[1:1] = [2, 3, 4]
# [1:1] 指在索引为1的地方
>>> numbers
[1, 2, 3, 4, 5]
# 使用切片赋值还可在不替换原有元素的情况下插入新元素。在这里，“替换”了一个空切片，相当于插入了一个序列。

>>> numbers
[1, 2, 3, 4, 5]
>>> numbers[1:4] = []
# 将索引1至4的元素值替换为空
>>> numbers
[1, 5]
# 上述代码与del numbers[1:4]等效
```



#### 列表方法

> 方法是与对象(列表、数、字符串等)联系紧密的函数。
> 调用方法：
> object.method(arguments)
> 方法调用与函数调用很像，只是在方法名前加上了对象和句点。列表包含多个可用来查看或修改其内容的方法。

##### append

```python
# append(object) -> None
# 列表尾部追加元素，返回None
# 返回None就意味着没有新的列表产生，就地修改
# 时间复杂度是O(1)

>>> lst = [1, 2, 3]
>>> lst.append(4)
>>> lst
[1, 2, 3, 4]
# 方法append用于将一个对象附加到列表末尾。 append也就地修改列表。它不会返回修改后的新列表，而是直接修改旧列表。
```



##### clear

```python
# clear() -> None
# 清除列表所有元素，剩下一个空列表

>>> lst = [1, 2, 3]
>>> lst.clear()
>>> lst
[]
# 方法clear就地清空列表的内容。这类似于切片赋值语句lst[:] = []。
```



##### copy

```python
# copy() -> list
# shadow copy返回一个新的列表


>>> a = [1, 2, 3]
>>> b = a
>>> b[1] = 4
>>> a
[1, 4, 3]
# 方法 copy 复制列表。常规复制只是将另一个名称关联到列表。要让a 和b 指向不同的列表，就必须将b关联到a的副本。
>>> a = [1, 2, 3]
>>> b = a.copy()
>>> b[1] = 4
>>> a
[1, 2, 3]
# 这类似于使用a[:]或list(a)，它们也都复制a。

# shadow copy表示影子拷贝，也叫浅拷贝，遇到引用类型，只是复制了一个引用而已
# 深浅拷贝测试
lst0 = list(range(4))
id(lst0)
# 查看内存地址
hash(lst0)
# 列表是不可hash的，所以会报错
hash(id(lst0))
# 这样才行
lst1 = list(range(4))
id(lst1)
# lst0和lst1在内存中的位置是不一样的。
lst0 == lst1
# 这里比较的是两个列表的值
lst0 is lst1
# 这里比较的是两个列表的内存地址。id就是查看内存地址的
lst1 = lst0
# 这里是将lst1的内存地址给了lst0，这时两个列表都指向了同一个内存地址，所以下面修改lst1的内容时，lst0也会改变
lst1[2] = 10
lst0
lst0 = list(range(4))
lst5 = lst0.copy()
# 这里只是复制内容，内存地址是不一样的
lst5
lst5 == lst0
# 返回True
lst5 is lst0
# 返回False
id(lst0)
id(lst5)
# 内存地址不一样
lst0 = [1,[2,3,4],5]
lst5 = lst0.copy()
# 这是一个影子拷贝或叫浅拷贝。当复制的内容比较复杂时，会复制内存地址，如下面的lst0和lst5的复制。
lst5 == lst0
# 返回True
lst5[2] = 10
lst5 == lst0
# 返回False
lst0
lst5[2] = 5
lst5 == lst0
# 返回True
lst5[1][1] = 20
# 这里修改的是第一个元素中的第一个元素
lst5 == lst0
# 因为是浅拷贝，所以列表中的列表复制的是内存地址，所以会都改变。返回True
lst0
lst5
# 两个列表中的值是一样的

# 深拷贝
# copy模块提供了deepcopy
import copy
lst0 = [1,[2,3,4],5]
lst5 = copy.deepcopy(lst0)
lst5[1][1] = 20
lst5 == lst0
```



##### count

```python
# count(value)
# 返回列表中匹配value的次数

>>> ['to', 'be', 'or', 'not', 'to', 'be'].count('to')
2
>>> x = [[1, 2], 1, 1, [2, 1, [1, 2]]]
>>> x.count(1)
2
>>> x.count([1, 2])
1
# 方法count计算指定的元素在列表中出现了多少次。
```



##### extend

```python
# extend(iteratable) -> None
# 将可迭代对象的元素追加进来，返回None
# 就地修改

>>> a = [1, 2, 3]
>>> b = [4, 5, 6]
>>> a.extend(b)
>>> a
[1, 2, 3, 4, 5, 6]
# 法extend让你能够同时将多个值附加到列表末尾，为此可将这些值组成的序列作为参数提供给方法extend。换而言之，你可使用一个列表来扩展另一个列表。
# 这可能看起来类似于拼接，但存在一个重要差别，那就是将修改被扩展的序列(这里是a)。在常规拼接中，情况是返回一个全新的序列。
>>> a = [1, 2, 3]
>>> b = [4, 5, 6]
>>> a + b
[1, 2, 3, 4, 5, 6]
>>> a
[1, 2, 3]
# 拼接出来的列表与前一个示例扩展得到的列表完全相同，但在这里a并没有被修改。鉴于常规拼接必须使用a和b的副本创建一个新列表，因此如果你要获得类似于下面的效果，拼接的效率将比extend低:
>>> a = a + b
# 拼接操作并非就地执行的，即它不会修改原来的列表。
```



##### index

```python
# index(value,[start,[stop]])
# 通过值value，从指定区间查找列表内的元素是否匹配
# 匹配第一个就立即返回索引
# 匹配不到，抛出异常ValueError

>>> knights = ['We', 'are', 'the', 'knights', 'who', 'say', 'ni']
>>> knights.index('who')
4
>>> knights.index('herring')
Traceback (innermost last):
File "<pyshell>", line 1, in ?
knights.index('herring')
ValueError: list.index(x): x not in list
>>> knights[4]
'who'
# index在列表中查找指定值第一次出现的索引。搜索单词'who'时，发现它位于索引4处。然而，搜索'herring'时引发了异常，因为根本就没有找到这个单词。
```



##### insert

```python
# insert(index,object) -> None
# 在指定的索引index处插入元素object
# 返回None就意味着没有新的列表产生，就地修改
# 时间复杂度是O(n)
# 索引超越上界，尾部追加
# 索引超越下界，头部追加

>>> numbers = [1, 2, 3, 5, 6, 7]
>>> numbers.insert(3, 'four')
>>> numbers
[1, 2, 3, 'four', 5, 6, 7]
# insert用于将一个对象插入列表。与extend一样，也可使用切片赋值来获得与insert一样的效果。
>>> numbers = [1, 2, 3, 5, 6, 7]
>>> numbers[3:3] = ['four']
>>> numbers
[1, 2, 3, 'four', 5, 6, 7]
# 这虽巧妙，但可读性根本无法与使用insert媲美。
```



##### pop

```python
# pop([index]) -> item
# 不指定索引index，就从列表尾部弹出一个元素
# 指定索引index，就从索引处弹出一个元素，索引超界抛出IndexError错误

>>> x = [1, 2, 3]
>>> x.pop()
3
# 如果用pop()，会删除最后一个元素
>>> x
[1, 2]
>>> x.pop(0)
1
>>> x
[2]
# pop从列表中删除一个元素(末尾为最后一个元素)，并返回这一元素。
# pop是唯一既修改列表又返回一个非None值的列表方法。
# 使用pop可实现一种常见的数据结构——栈 (stack)。栈就像一叠盘子，你可在上面添加盘子，还可从上面取走盘子。最后加入的盘子最先取走，这被称为后进先出(LIFO)。

>>> x = [1, 2, 3]
>>> x.append(x.pop())
# 每次弹出的都是3，再将3追加到列表的尾部，就还是[1,2,3]
>>> x
[1, 2, 3]
# 使用append代替push方法，因为python中没有提供push。此将刚弹出的值压入(或附加)后，得到的栈将与原来相同。要创建先进先出(FIFO)的队列，可使用insert(0, ...)代替append。另外，也可继续使用append，但用 pop(0)替代 pop() 。
```



##### remove

```python
# remove(value) -> None
# 从左至右查找第一个匹配value的值，移除该元素，返回None
# 就地修改

>>> x = ['to', 'be', 'or', 'not', 'to', 'be']
>>> x.remove('be')
>>> x
['to', 'or', 'not', 'to', 'be']
>>> x.remove('bee')
Traceback (innermost last):
File "<pyshell>", line 1, in ?
x.remove('bee')
ValueError: list.remove(x): x not in list
# remove用于删除第一个为指定值的元素。这只删除了为指定值的第一个元素，无法删除列表中其他为指定值的元素
# remove是就地修改且不返回值的方法之一。不同于 pop的是，它修改列表，但不返回任何值。
```



##### reverse

```python
# reverse() -> None
# 将列表元素反转，返回None
# 就地修改

>>> x = [1, 2, 3]
>>> x.reverse()
>>> x
[3, 2, 1]
# reverse按相反的顺序排列列表中的元素。但不返回任何值(与remove和sort等方法一样) 。
# 如果要按相反的顺序迭代序列，可使用函数reversed 。这个函数不返回列表，而是返回一个迭代器 。你可使用list将返回的对象转换为列表。如下：
>>> x = [1, 2, 3]
>>> list(reversed(x))
[3, 2, 1]
```



##### sort

```python
# sort(key=None,reverse=False) -> None
# 对列表元素进行排序，就地修改，默认升序
# reverse为True，反转，降序
# key一个函数，指定key如何排序
# lst.sort(key=functionname)

>>> x = [4, 6, 2, 1, 7, 9]
>>> x.sort()
>>> x
[1, 2, 4, 6, 7, 9]
# sort是修改列表而不返回任何值的方法，sort用于对列表就地排序。就地排序意味着对原来的列表进行修改，使其元素按顺序排列，而不是返回排序后的列表的副本。

>>> x = [4, 6, 2, 1, 7, 9]
>>> y = x.sort() # Don't do this!
>>> print(y)
None
# 这种方法是错误的，sort修改x后是不返回任何值的，最终的结果是，x是经过排序的，而y包含 None。正确做法如下：
>>> x = [4, 6, 2, 1, 7, 9]
>>> y = x.copy()
>>> y.sort()
>>> x
[4, 6, 2, 1, 7, 9]
>>> y
[1, 2, 4, 6, 7, 9]
# 只是将x赋给y是不可行的，因为这样x和y将指向同一个列表。
>>> x = [4, 6, 2, 1, 7, 9]
>>> y = sorted(x)
>>> x
[4, 6, 2, 1, 7, 9]
>>> y
[1, 2, 4, 6, 7, 9]
# sorted函数可用于任何可迭代的对象，但总是返回一个列表。如下：
>>> sorted('Python')
['P', 'h', 'n', 'o', 't', 'y']
```



##### 高级排序

```python
>>> x = ['aardvark', 'abalone', 'acme', 'add', 'aerate']
>>> x.sort(key=len)
>>> x
['add', 'acme', 'aerate', 'abalone', 'aardvark']
# 方法sort接受两个可选参数：key 和reverse。这两个参数通常是按名称指定的，称为关键字参数，参数 key类似于参数cmp：你将其设置为一个用于排序的函数。然而，不会直接使用这个函数来判断一个元素是否比另一个元素小，而是使用它来为每个元素创建一个键，再根据这些键对元素进行排序。因此，要根据长度对元素进行排序，可将参数 key 设置为函数len。
>>> x = [4, 6, 2, 1, 7, 9]
>>> x.sort(reverse=True)
>>> x
[9, 7, 6, 4, 2, 1]
# 对于另一个关键字参数reverse，只需将其指定为一个真值（True或False），以指出是否要按相反的顺序对列表进行排序。
# 函数sorted也接受参数key和reverse。在很多情况下，将参数key设置为一个自定义函数很有用。
```



##### 时间复杂度

```python
index和count方法都是O(n)。随着列表数据规模的增大，而效率下降
```



##### 如何查帮助

```python
# 官方帮助文档，搜索关键字
# IPython中
help(keyword)
# keyword可以是变量、对象、类名、函数名、方法名
```



### 元组

> 与列表一样，元组也是序列，唯一的差别在于元组是不能修改的。元组语法很简单，只要将一些值用逗号分隔，就能自动创建一个元组。元组就是一个有序的元素组成的集合，使用小括号()表示。元组是不可变对象。

```python
>>> 1, 2, 3
(1, 2, 3)
>>> (1, 2, 3)
(1, 2, 3)
# 元组还可用圆括号括起(这也是通常采用的做法) 。
>>> ()
()
# 空元组用两个不包含任何内容的圆括号表示。
>>> 42
42
>>> 42,
(42,)
>>> (42,)
(42,)
# 表示一个值的元组也必须在它后面加上逗号。最后两个示例创建的元组长度为1，而第一个示例根本没有创建元组。逗号至关重要，仅将值用圆括号括起不管用：(42)与 42完全等效。但仅仅加上一个逗号，就能完全改变表达式的值。如下：
>>> 3 * (40 + 2)
126
>>> 3 * (40 + 2,)
(42, 42, 42)

>>> tuple([1, 2, 3])
(1, 2, 3)
>>> tuple('abc')
('a', 'b', 'c')
>>> tuple((1, 2, 3))
(1, 2, 3)
# 函数tuple的工作原理与list很像：它将一个序列作为参数，并将其转换为元组。如果参数已经是元组，就原封不动地返回它。
>>> x = 1, 2, 3
>>> x[1]
2
>>> x[0:2]
(1, 2)
# 元组的切片也是元组,就像列表的切片也是列表一样。为何要熟悉元组呢?原因有以下两个。
# 1. 它们用作映射中的键(以及集合的成员)，而列表不行。
# 2. 有些内置函数和方法返回元组，这意味着必须跟它们打交道。只要不尝试修改元组，与元组“打交道”通常意味着像处理列表一样处理它们(需要使用元组没有的index和count等方法时例外)。
# 一般而言，使用列表足以满足对序列的需求。
```



#### 命名元组namedtuple

```python
# 帮助文档中，查阅namedtuple，有使用教程
# 语法：
	# namedtuple(typename,field_names,verbose=False,rename=False)
    # 命名元组，返回一个元组的子类，并定义了字段
    # typename表示此元组的名称
    # field_names表示元组中元素的名称，此字段有多种表达方式，可以是空白符或逗号分隔的字段的字符串，可以是字段的列表
    # rename表示如果元素名称中含有python的关键字，则必须设置为rename=True
    # verbose使用默认就可以。
from collections import namedtuple
Point = namedtuple('_Point',['x','y'])
# Point为返回的类
p = Point(11,22)

>>> from collections import namedtuple
>>> Student = namedtuple('Student', ['name', 'age', 'sex', 'email'])
>>> s = Student('Jim', 21, 'male', '123@qq.com')
>>> s.name
'Jim'
>>> s.age
21
# namedtuple 函数这里接收两个参数，第一个参数为要创建类型的名称，第二个参数是一个列表，代表了每一个
# 索引的名字。当建立完这个 Student 类之后，就可以使用正常的构造方法来构造新的对象如 s，并且可以直接
# 通过访问属性的方式来访问所需要的值。
# 此时使用isinstance函数对比内置的tuple：
>>> isinstance(s, tuple)
True
# 可见用namedtuple构造出来的类其本质就是一个tuple元组，所以仍然可以使用下标的方式来访问属性。并且在
# 任何要求类型为元组的地方都可以使用这个namedtuple。
```



### 冒泡法

- 属于交换排序

- 两两比较大小，交换位置。如同水泡咕嘟咕嘟往上冒
- 结果分为升序和降序排列
- 升序
  - n个数从左至右，编号从0开始到n-1，索引0和1的值比较，如果索引0大，则交换两者位置，如果索引1大，则不交换。继续比较索引1和2的值，将大值放在右侧。直至n-2和n-1比较完，第一轮比较完成。第二轮从索引0比较到n-2，因为最右侧n-1位置上已经是最大值了。依次类推，每一轮都会减少最右侧的不参与比较，直至剩下最后2个数比较。
- 降序
  - 和升序相反

```python
# 冒泡法代码实现一，简单冒泡实现
num_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9]]
# 定义一个列表，这个列表中还有两个子列表
nums = num_list[1]
# 定义nums等于第2个子列表
print(nums)
# 先打印一次nums列表
length = len(nums)
# 计算nums列表的长度
count_swap = 0
# 交换
count = 0
# 统计次数
for i in range(length):
# 用length也就是列表长度来循环，length是一共要比较的次数，也就是要用每个数字与所有的数字比较一次，所有数字比较一遍的次数。i表示第几个数字
    for j in range(length-i-1):
# 这里j是长度减去之前比较的次数后，还要比较的次数。也就是每次每个数字要与列表中数字比较的次数，如第一次从第一个数字比较到最后一个数字，
# 那么，第二次比较时就从第一个数字比较到倒数第一个数字了，因为第一次已经将最大的数字放到最后了。最后减1是因为i是从0开始的，所以要多减1.
        count += 1
# 计算比较的次数
        if nums[j] > nums[j+1]:
# 按循环每次比较，nums列表中的第j个元素是否与j+1个元素大，也就是前面的数字与后面的数字比较，如第一次是第1个和第2个数字比较，下一次就是第2个和第3个比较
            tmp = nums[j]
# 如果前面的数字大，就将数字给tmp
            nums[j] = nums[j+1]
# 之后将前面的数字向后移
            nums[j+1] = tmp
# 再把后面的数字放在临时空间中
            count_swap += 1
# 记录一次交换
print(nums, count_swap, count)
# 打印列表，交换次数，比较次数

# 冒泡法代码实现二，优化实现
num_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9],[1,2,3,4,5,6,7,9,8]]
nums = num_list[2]
print(nums)
length = len(nums)
count_swap = 0
count = 0
for i in range(length):
    flag = False
# 每次每个数比较之前都加一个标记
    for j in range(length-i-1):
        count += 1
        if nums[j] > nums[j+1]:
            tmp = nums[j]
            nums[j] = nums[j+1]
            nums[j+1] = tmp
            flag = True
            # 如果前面的数字比后面的大，进行了交换，就将flag改为True
            count_swap += 1
    if not flag:
        break
# 当flag为False时，证明没有交换，也就证明没必要再进行之后的动作，顺序已经排好了。
print(nums, count_swap, count)
```



- 冒泡法总结
  - 冒泡法需要数据一轮轮比较
  - 可以设定一个标记判断此轮是否有数据交换发生，如果没有发生交换，可以结束排序，如果发生交换，继续下一轮排序
  - 最差的排序情况是，初始顺序与目标顺序完全相反，遍历次数1,...,n-1之和n(n/1)/2
  - 最好的排序情况是，初始顺序与目标顺序完全相同，遍历次数n-1
  - 时间复杂度O(n**2)

