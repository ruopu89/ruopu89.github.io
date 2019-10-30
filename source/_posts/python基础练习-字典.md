---
title: python基础练习-字典
date: 2019-10-30 17:20:43
tags: python字典
categories: python
---

### 字典练习

- 用户输入一个数字
  - 打印每一位数字及其重复的次数

```python
num = input('>>>')
d = {}
for c in num:
    if not d.get(c):
        d[c] = 1
        continue
    d[c] += 1
    
print(d)

d = {}
for c in num:
    if c not in d.keys():
        d[c] = 1
    else:
        d[c] += 1
print(d)
```



- 数字重复统计
  - 随机产生100个整数
  - 数字的范围[-1000,1000]
  - 升序输出所有不同的数字及其重复的次数

```python
import random

n = 100
nums = [0] * n
for i in range(n):
    nums[i] = random.randint(-1000,1000)
print(nums)
t = nums.copy()
t.sort()
print(t)

d = {}
for x in nums:
    if x not in d.keys():
        d[x] = 1
    else:
        d[x] += 1
print(d)
d1 = sorted(d.items())
print(d1)
```



- 字符串重复统计
  - 字符表'abcdefghijklmnopqrstuvwxyz'
  - 随机挑选2个字母组成字符串，共挑选100个
  - 降序输出所有不同的字符串及重复的次数

```python
import random

alphabet = 'abcdefghijklmnopqrstuvwxyz'

words = []
for _ in range(100):
    # words.append(random.choice(alphabet)+random.choice(alphabet))
    # words.append(''.join(random.sample(alphabet,2)))   随机采样
    words.append(''.join(random.choice(alphabet) for _ in range(2))) # 生成器
    
d = {}
for x in words:
    d[x] = d.get(x,0) + 1
print(d)

d1 = sorted(d.items(),reverse=True)
print(d1)
```



#### 将字符串格式设置功能用于字典

```python
>> phonebook
{'Beth': '9102', 'Alice': '2341', 'Cecil': '3258'}
>>> "Cecil's phone number is {Cecil}.".format_map(phonebook)
"Cecil's phone number is 3258."
# 可在字典中包含各种信息，这样只需在格式字符串中提取所需的信息即可。使用format_map来指出你
# 将通过一个映射来提供所需的信息。可使用字符串格式设置功能来设置值的格式，这些值是作为命名或
# 非命名参数提供给方法format的。

>>> template = '''<html>
... <head><title>{title}</title></head>
... <body>
... <h1>{title}</h1>
... <p>{text}</p>
... </body>'''
>>> data = {'title': 'My Home Page', 'text': 'Welcome to my home page!'}
>>> print(template.format_map(data))
<html>
<head><title>My Home Page</title></head>
<body>
<h1>My Home Page</h1>
<p>Welcome to my home page!</p>
</body>
# 将data字典的值代入template中。像这样使用字典时，可指定任意数量的转换说明符，条件是所有
# 的字段名都是包含在字典中的键。
```