---
title: python基础练习-字符串
date: 2019-09-09 08:27:35
tags: 字符串习题
categories: python
---



### 字符串习题1

```shell
===============================================
    用户输入一个数字
    1. 判断是几位数
    2. 打印每一位数字及其重复的次数
    3. 依次打印每一位数字，顺序个、十、百、千、万...位
===============================================
答案1：
m = input(">>>").strip().lstrip('0')
# 去除数字前面的空格和0
print("这是{}位数".format(len(m)))
# len计算变量有几位数字
for i in range(len(m)):
    print("{}'s count = {}".format(m[i],m.count(m[i])))
# 循环len次，每次打印m的数字和m[i]在m中出现的次数。这个方法不好的原因是需要遍历整个数字，如果输入的是相
# 同的数字，如11111，那么就要遍历len次
for j in range(len(m)):
    n = m[-j-1]
    print(n)
# 从后向前打印。m[-j-1]表示从最后一个索引开始，因为索引是从0开始的，所以要-1。
print(m)

答案2：
num = ''
# 不一定要定义，但最好定义，告诉别人num的作用域在外面
while True:
    num = input('Input a positive number >>>').strip().lstrip('0')
    # 去除空白和前面的0，为了得到有效的数字。用int()也可以去掉数字前的0，但下面执行时会报错，提示int()没有
    # count方法。另外，input()也会输出自己的内容。
    if num.isdigit():
        break
# 判断是否全部数字(0~9)，如果是，就向下执行，如果不是，就重新输入。
print("The length of {} is {}.".format(num,len(num)))
# 计算打印num和num的长度

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
 # 开辟一个0～9的空间，下面迭代后将数字出现的次数放入这个空间中对应的位置
for i in range(10):   # 10*n
    counter[i] = num.count(str(i))
    if counter[i]:
    # 如果counter[i]不等于0就打印出来。如果是0表示这个数字没有统计到。
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

for x in num:  
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



### 字符串习题2

```python
==========================================================
    输入5个数字,打印每个数字的位数,将这些数字排序打印,要求升序打印
==========================================================
答案1：
print("请输入一个五位数字")
inputlist = input("Please input a interger:").strip().lstrip('0')  
# print(inputlist)
if len(inputlist) == 5:
    lst = list(inputlist)
    lst.reverse()   # 这里不符合要求，这只是倒着打印，但并没有排序。
    print(lst)
else:
    print("输入不正确，请重新输入一个五位数字")

输出：
请输入一个五位数字     # 这行是第一句的print()打印的
Please input a interger:11111     # 这行是input()打印的
['1', '1', '1', '1', '1']
```

