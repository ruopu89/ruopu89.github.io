---
title: python基础练习-字符串
date: 2019-09-09 08:27:35
tags: 字符串习题
categories: python
---



### 字符串习题

```shell
===============================================
    用户输入一个数字
    1. 判断是几位数
    2. 打印每一位数字及其重复的次数
    3. 依次打印每一位数字，顺序个、十、百、千、万...位
===============================================
num = ''
# 数字输入的简单判断
while True:
    num = input('Input a positive number >>>').strip().lstrip('0')
    if num.isdigit():
        break
print("The length of {} is {}.".format(num,len(num)))

# 倒序打印1
for i in range(len(num),0,-1):
    print(num[i-1],end=' ')
print()
# print()是换行的

# 倒序打印2
for i in reversed(num):
    print(i,end=' ')
print()

# 负索引方式打印
for i in range(len(num)):
    print(num[-i-1],end=' ')
print()

# 判断0-9的数字在字符串中出现的次数，每一次抚今追昔都是用count，都是O(n)问题
counter = [0]*10
for i in range(10):   # 10*n
    counter[i] = num.count(str(i))
    if counter[i]:
        print("The count of {} is {}".format(i,counter[i]))
        
print('~'*20)

# 迭代字符串本身的字符
counter = [0]*10
for x in num:   # unique(n) * n, unique(n)取值[1,10]
    i = int(x)
    if counter[i] == 0:
        counter[i] = num.count(x)
        print("The count of {} is {}".format(x,counter[i]))
        
print('~'*20)

# 迭代字符串本身的字符
counter = [0]*10
for x in num:   # n
    i = int(x)
    counter[i] += 1
    
for i in range(len(counter)):
    if counter[i]:
        print("The count of {} is {}".format(i, counter[i]))
        
# 输出结果：
# Input a positive number >>>123
# The length of 123 is 3.
# 3 2 1 
# 3 2 1 
# 3 2 1 
# The count of 1 is 1
# The count of 2 is 1
# The count of 3 is 1
# ~~~~~~~~~~~~~~~~~~~~
# The count of 1 is 1
# The count of 2 is 1
# The count of 3 is 1
# ~~~~~~~~~~~~~~~~~~~~
# The count of 1 is 1
# The count of 2 is 1
# The count of 3 is 1
```

