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
>>> edward = ['Edward Gumby', 42]
# 使用列表来表示

>>> edward = ['Edward Gumby', 42]
>>> john = ['John Smith', 50]
>>> database = [edward, john]
>>> database
[['Edward Gumby', 42], ['John Smith', 50]]
# 序列还可包含其他序列，上面是创建一个由数据库中所有人员组成的列表。Python支持一种数据结构的基本概念，名为容器(container)。容器基本上就是可包含其他对象的对象。两种主要的容器是序列(如列表和元组)和映射(如字典) 。在序列中，每个元素都有编号，而在映射中，每个元素都有名称(也叫键)。
```



### 通用的序列操作

#### 索引

```python
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
>>> lst = [1, 2, 3]
>>> lst.append(4)
>>> lst
[1, 2, 3, 4]
# 方法append用于将一个对象附加到列表末尾。 append也就地修改列表。它不会返回修改后的新列表，而是直接修改旧列表。
```



##### clear

```python
>>> lst = [1, 2, 3]
>>> lst.clear()
>>> lst
[]
# 方法clear就地清空列表的内容。这类似于切片赋值语句lst[:] = []。
```



##### copy

```python
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
```



##### count

```python
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
>>> x
[1, 2, 3]
# 使用append代替push方法，因为python中没有提供push。此将刚弹出的值压入(或附加)后，得到的栈将与原来相同。要创建先进先出(FIFO)的队列，可使用insert(0, ...)代替append。另外，也可继续使用append，但用 pop(0)替代 pop() 。
```



##### remove

```python
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



#### 元组

> 与列表一样，元组也是序列，唯一的差别在于元组是不能修改的。元组语法很简单，只要将一些值用逗号分隔，就能自动创建一个元组。

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



