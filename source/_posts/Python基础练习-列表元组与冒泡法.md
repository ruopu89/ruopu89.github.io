---
title: Python基础练习-列表元组与冒泡法
date: 2019-09-04 13:18:11
tags: 冒泡法与练习
categories: python列表依次接收用户输入的3个数，排序后打印
---

### 列表-依次接收用户输入的3个数，排序后打印

```python
===============================================
   示例，最笨拙的方法。从小到大排列，i1最小，i3最大
===============================================
nums = []

for i in range(3):
    nums.append(int(input('{}:'.format(i))))
# '{}:'是取其后面format()中变量的值，这时format中是i，'{}:'是显示的提示信息，
# 输入的值会被int处理后追加到nums列表中。结果如下：
# 0:1   第0次，输入的是1
# 0   这里打印了一次i
# [1]   这里打印一次nums
# 1:3   第1次输入的是3
# 1
# [1, 3]   nums现在就是两个数字了
# 2:4
# 2
# [1, 3, 4]
if nums[0] > nums[1]:
    if nums[0] > nums[2]:
        i3 = nums[0]   # 上面先比较索引0是否大于索引1和2，如果大于，就把索引0的数字给i3。
        if nums[1] > nums[2]:
            i2 = nums[1]
            i1 = nums[2]    
# 继续判断，这时已判断完索引0了，再判断索引1是否大于索引2，如果大于，就把索引1给i2，索引2给i1。否则，就把
# 索引2给i2，索引1给i1。
        else:
            i2 = nums[2]
            i1 = nums[1]
    else:
        i2 = nums[0]
        i3 = nums[2]
        i1 = nums[1]
# 如果上面判断索引0不大于索引2，就表示索引2最大，给i3，索引1最小，给i1。
else:  # 0<1
    if nums[0] > nums[2]:
        i3 = nums[1]
        i2 = nums[0]
        i1 = nums[2]
# 如果最开始判断的索引0小于索引1，再判断索引 0是否大于索引2，如果大于，就表示索引2最小，索引1最大。
# 下面的判断道理是一样的
    else: # 0<2
        if nums[1] < nums[2]: # 1<2
            i1 = nums[0]
            i2 = nums[1]
            i3 = nums[2]
        else: # 1 > 2
            i1 = nums[0]
            i2 = nums[2]
            i3 = nums[1]
print(i1,i2,i3)
# 这里主要看六种变化，1. 索引0大于索引1和索引2，索引1大于索引2；2. 索引0大于索引1和索引2，索引2大于索引1；
# 3. 索引2大于索引0和索引1，索引0大于索引1；4. 索引2大于索引0和索引1，索引1大于索引0；5. 索引1大于索引0和索引2，索引0大于索引2；6. 索引1大于索引0和索引2，索引2大于索引0

===================
   改进，从大到小排列
===================
nums = []
out = None   # 定义空列表，将None改为[]也可以。
for i in range(3):
    nums.append(int(input('{}:'.format(i))))
    
if nums[0] > nums[1]:
    if nums[0] > nums[2]:
        if nums[1] > nums[2]:
            out = [2,1,0]   # 这里的[2,1,0]指的是索引，保存在out变量中
# out是为了保存索引的顺序
        else:
            out = [1,2,0]
    else:
        out = [1,0,2]
else: # 0<1
    if nums[0] > nums[2]:
        out = [2,0,1]
    else:  # 0<2
        if nums[1] < nums[2]:   # 1<2
            out = [0,1,2]
        else: # 1>2
            out = [0,2,1]
out.reverse()
# reverse()是为了将out列表中的元素整个反过来，原本是从小到大排列，变成从大到小排列。
for i in out:
    print(nums[i],end=', ')
# 最后将out中的三个数字依次传给i，i中保存的实际就是索引编号，再把i带入到nums列表，
# 这样就从小到大打印出结果了

================
  max min的实现
================
nums = []
out = None
for i in range(3):
    nums.append(int(input('{}:'.format(i))))
    
while True:
    cur = min(nums)
# 死循环，用min把列表中最小的数字选出
    print(cur)
# 打印最小的数字
    nums.remove(cur)
# 将最小的数字删除，因为上面for循环定义了循环3次，所以这里while循环可以循环两次，最后一次用下面的代码执行
    if len(nums) == 1:
# 判断nums列表中是否只有1个元素，如果不是，就继续上面的循环
        print(nums[0])
        break
# 打印出最后一个元素后就退出循环

==============
     列表sort实现
==============
nums = []

for i in range(3):
    nums.append(int(input('{}:'.format(i))))
    
nums.sort()
# sort() 函数用于对原列表进行排序
print(nums)
```



### 元组习题

```python
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

