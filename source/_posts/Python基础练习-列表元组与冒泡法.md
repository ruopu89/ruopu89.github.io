---
title: Python基础练习-列表元组与冒泡法
date: 2019-09-04 13:18:11
tags: 冒泡法与练习
categories: python
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

#### 冒泡法

```python
numlist = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9]]
# 定义一个列表，列表中有两个元素
nums = numlist[0]
# 设置nums等于列表中的第一个元素
print(nums)
# 打印一次nums
length = len(nums)
# 计算nums的长度，这是为了计算出要比较交换的次数，长度就是比较交换的次数
count_swap = 0
# 统计交换的次数，也就是两个数相比，如果两个数对调过一次，这里就会加1。
count = 0
# 统计一共进入比较多少次，进入比较后不一定会交换，因为前面的数比后面的数小是不用交换的。
for i in range(length):  
# 这是整个要比较的次数。如第1个数与第2个数比较，一直比较到最后一个数。这就是一次比较
    for j in range(length-i-1):
# 这是每次要比较几个数，总是从0到n。因为第1次比较完，最大的数就排列在最后了，下一次比较就不用再和最后一个数比较了。-1是因为range()是从0开始的。
        count += 1
# 统计进入比较的次数，每进入一次就加1。进入比较后不一定会交换，因为前面的数比后面的数小是不用交换的。
        if nums[j] > nums[j+1]:
# 第1次比较索引0和索引1两个数字，如果索引0比索引1大，就向下执行
            tmp = nums[j]
# 将索引0的数赋值给tmp，临时存放
            nums[j] = nums[j+1]
# 把索引1的数赋值给索引0,这时小的数字就向前移了
            nums[j+1] = tmp
# 再把临时存放的大的数字给索引1，这样大的数字就向后移了
            count_swap += 1
# 记录1次交换
print(nums,count_swap,count)
# 最后打印排列好的结果，进入比较的次数，实际交换的次数。
# 输出结果：
# [1, 9, 8, 5, 6, 7, 4, 3, 2]
# [1, 2, 3, 4, 5, 6, 7, 8, 9] 25 36

=======
    优化
=======
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
# 如果not flag为真，就break。这里也可以写成if flag，如果写成这样，那么上面两处对flag的定义就要转过来，把
# False变成True，True变成False。
        break
# 当flag为False时，证明没有交换，也就证明没必要再进行之后的动作，顺序已经排好了。
print(nums, count_swap, count)
# 输出结果：
[1, 2, 3, 4, 5, 6, 7, 9, 8]
[1, 2, 3, 4, 5, 6, 7, 8, 9] 1 15
```

