---
title: python基础练习-内置数据结构
date: 2019-09-23 09:30:47
tags: python练习-内置数据结构
categories: python
---

### 练习1：杨辉三角，求杨辉三角第n行第k列的值

#### 算法1

```python
# 算法1
# 计算到m行，打印出k项
# 求m行k个元素
# m行元素有m个，所以k不能大于m
# 这个需求需要保存m行的数据，那么可以使用一个嵌套机构[[],[],[]]

m = 5
k = 4
triangle = []
for i in range(m):
    # 所有行都需要1开头
    row = [1]
    triangle.append(row)
    if i == 0:
        continue
    for j in range(1,i):
        row.append(triangle[i-1][j-1] + triangle[i-1][j])
    row.append(1)
print(triangle)
print("---------")
print(triangle[m-1][k-1])
print("---------")
# 这里算出的是第五行第四列的值
```



#### 算法2

```python
# 算法2
# 根据杨辉三角的定理：第n行的m个数(m>0且n>0)可表示为C(n-1,m-1)，即为从n-1个不同元素中取m-1个元素的组合数
# 组合数公式：有m个不同元素，任意取n(n<=m)个元素，记作c(m,n)，组合数公式为：
# C(m,n) = m!/(n!(m-n)!)
# m行k列的值，c(m-1,k-1)组合数

m = 9
k = 5
# c(n,r) = c(m-1,k-1) = (m-1)!/((k-1)!(m-r)!)
# m最大
n = m - 1
r = k - 1
d = n - r
# 上面三行可以写成一行，使用封装解构的方法
targets = []   # r, n-r, n
factorial = 1
# factorial是初始值，求阶乘起始为1，求和起始为0
# 可以加入k为1或者m的判断，返回1
for i in range(1,n+1):
# range中的范围就是要求的阶乘的范围
    factorial *= i
# 这里是求阶乘
    if i == r:
        targets.append(factorial)
    if i == d:
        targets.append(factorial)
    if i == n:
        targets.append(factorial)
print(targets)
print(targets[2]//(targets[0]*targets[1]))
# i == r 、i == n 、i == d，这三个条件不要写在一起，因为它们有可能两两相等
# 算法说明：一趟到n的阶乘算出所有阶乘值。
```



### 练习2：转置矩阵

#### 方法1

```python
# 转置矩阵
# 1 2 3           1 4 7
# 4 5 6    ==>    2 5 8
# 7 8 9           3 6 9
# 规律：对角线不动，a[i][j] <=> a[j][i]，而且到了对角线，就停止，去做下一行，对角线上的元素不动。

# 定义一个方阵
# 1 2 3           1 4 7
# 4 5 6    ==>    2 5 8
# 7 8 9           3 6 9

# 方法1
matrix=[[1,2,3],[4,5,6],[7,8,9]]
print(matrix)
count = 0
for i,row in enumerate(matrix):   
# 这里的结果是
# 0 [1,2,3]  i是索引0，row是值[1,2,3]
# 1 [4,5,6]   
# 2 [7,8,9]
    for j,col in enumerate(row):
# 当这里是0 [1,2,3]时，这里的结果是
# 0 1
# 1 2
# 2 3
        if i < j:
# 在这里进行索引的比较，交i小于j时才交换，第一次时，i一直是0，j是0,1,2，当i和j都是0时，不会有变动。当i是0,j是1时，
# 就将matrix[0][1]和matrix[1][0]对调，也就成了[[1,4,3],[2,5,6],[7,8,9]]，当i是0，j是2时，
# 就将matrix[0][2]和matrix[2][0]对调，也就成了[[1,4,7],[2,5,6],[3,8,9]]。之后以此类推。
            temp = matrix[i][j]
            matrix[i][j] = matrix[j][i]
            matrix[j][i] = temp
            count += 1
print(matrix)
print(count)
# 统计一共交换的次数
输出：
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]
[[1, 4, 7], [2, 5, 8], [3, 6, 9]]
3
```



#### 方法2

```python
matrix = [[1,2,3,10],[4,5,6,11],[7,8,9,12],[1,2,3,4]]
length = len(matrix)
count = 0
for i in range(length):
    for j in range(i):   
# 这个设计更加巧妙，按此方法，如果matrix中有五个元素，每个元素中有五个小的元素，使用此方法
# 也可以转置。只要matrix中的元素与元素中的子元素个数是相等的就可以转置。
        matrix[i][j],matrix[j][i] = matrix[j][i],matrix[i][j]
        count += 1
print(matrix)
print(count)
```



### 练习3：任意矩阵转置

#### 算法1

```python
# 1 2 3        1 4
# 4 5 6  <=>   2 5
#              3 6
# 这是一个矩阵，但不是方阵
# enumerate(iterable[, start]) -> iterator for index, value of iterable
# 返回一个可迭代对象，将原有可迭代对象的元素和从start开始的数字配对

# 算法1
# 过程就是，扫描matrix第一行，在tm的第一列从上至下附加，然后再第二列附加。
# 举例，扫描第一行1,2,3，加入到tm的第一列，然后扫描第二行4,5,6，追加到tm的第二列

# 定义一个矩阵，不考虑稀疏矩阵
# 1 2 3        1 4
# 4 5 6  <=>   2 5
#              3 6

import datetime
matrix = [[1,2,3],[4,5,6]]
# matrix = [[1,4],[2,5],[3,6]]

tm = []
count = 0
for row in matrix:
    for i,col in enumerate(row):
# 这里是为了计算matrix中有几列，有几列就要为tm创建几行，结果是：
# 0 1
# 1 2
# 2 3
# 0 4
# 1 5
# 2 6
        if len(tm) < i + 1:   
# matrix的列数与tm的行数应该相等，len(tm)就是计算tm有几行的，i+1是列数，加1是因为i是
# 从0开始的。这里的条件会一直满足，len(tm)会一直小于i+1。因为第一次len(tm)的结果是0。只
# 有这个条件满足时，才会向tm的元素中追加值。把tm转化为matrix也一样可以使用这个方法
            tm.append([])
            
        tm[i].append(col)
        count += 1
        
print(matrix)
print(tm)
print(count)
输出：
[[1, 4], [2, 5], [3, 6]]
[[1, 2, 3], [4, 5, 6]]
6
```



#### 算法2

```python
# 思考：
# 能否一次性开辟目标矩阵的内存空间？
# 如果一次性开辟好目标矩阵内存空间，那么原矩阵的元素直接移动到转置矩阵的对称坐标就行了

# 1 2 3        1 4
# 4 5 6  <=>   2 5
#              3 6
# 在原有矩阵上改动，牵扯到增加元素和减少元素，麻烦，所以，定义一个新的矩阵输出

matrix = [[1,2,3],[4,5,6]]
# matrix = [[1,4],[2,5],[3,6]]

tm = [[0 for col in range(len(matrix))] for row in range(len(matrix[0]))]
count = 0

for i,row in enumerate(tm):
    for j,col in enumerate(row):
        tm[i][j] = matrix[j][i]   # 将matrix的所有元素搬到tm中
        count += 1

print(matrix)
print(tm)
print(count)
输出：
[[1, 4], [2, 5], [3, 6]]
[[1, 2, 3], [4, 5, 6]]
6
```



#### 效率测试

```python
import datetime
matrix = [[1,2,3],[4,5,6],[7,8,9]]
matrix = [[1,4],[2,5],[3,6]]

print('\nMethod 1')
start = datetime.datetime.now()
for c in range(100000):
    tm = [] # 目标矩阵
    for row in matrix:
        for i,item in enumerate(row):
            if len(tm) < i + 1:
                tm.append([])
                
            tm[i].append(item)
            
delta = (datetime.datetime.now()-start).total_seconds()
print(delta)
print(matrix)
print(tm)

print('\nMethod 2')
start = datetime.datetime.now()
for c in range(100000):
    tm = [0] * len(matrix[0])
    for i in range(len(tm)):
        tm[i] = [0] * len(matrix)
        
    for i,row in enumerate(tm):
        for j,col in enumerate(row):
            tm[i][j] = matrix[j][i]
            
delta = (datetime.datetime.now()-start).total_seconds()
print(delta)
print(matrix)
print(tm)

# 说明：
# 上面两个方法在ipython中，使用%%timeit测试下来方法一效率更高。
# 但是方法一效率真的高吗？
# 给一个大矩阵，测试一下
# matrix = [[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6],[1,2,3],[4,5,6]]
# 测试发现，其实只要增加到4*4开始，方法二优势就开始了。
# 矩阵规模越大，先开辟空间比后append效率高
```



### 练习4：数字统计

```python
# 随机产生10个数字
# 要求：
# 每个数字取值范围[1,20]
# 统计重复的数字有几个？分别是什么？
# 统计不重复的数字有几个？分别是什么？
# 举例：11,7,5,11,6,7,4，其中2个数字7和11重复了，3个数字4,5,6没有重复过
# 思路：
# 对于一个排序的序列，相等的数字会挨在一起。但是如果先排序，还是要花时间，能否不排序解决？
# 例如11,7,5,11,6,7,4，先拿出11，依次从第二个数字开始比较，发现11就把对应索引标记，这样一趟比较就知道11是否重复，哪些地方重复。
# 第二趟使用7和其后数字依次比较，发现7就标记，当遇到以前比较过的11的位置的时候，其索引已经被标记为1,直接跳过。

import random
nums = []
for _ in range(10):
    nums.append(random.randrange(21))
    
print("Origin numbers = {}".format(nums))
print()

length = len(nums)
samenums = []   # 记录相同的数字
diffnums = []   # 记录不同的数字
states = [0] * length   # 记录不同的索引异同状态

for i in range(length):
    flag = False   # 假定没有重复
    if states[i] == 1:
        continue
    for j in range(i+1,length):
        if states[j] == 1:
            continue
        if nums[i] == nums[j]:
            flag = True
            states[j] = 1
    if flag:   # 有重复
        samenums.append(nums[i])
        states[i] = 1
    else:
        diffnums.append(nums[i])
        
print("Same numbers = {1},Counter = {0}".format(len(samenums),samenums))
print("Different numbers = {1},Counter = {0}".format(len(diffnums),diffnums))
print(list(zip(states,nums)))
输出：
Origin numbers = [7, 15, 12, 8, 10, 0, 5, 19, 15, 2]

Same numbers = [15],Counter = 1
Different numbers = [12, 8, 10, 0, 5, 19, 15, 2],Counter = 8
[(0, 7), (1, 15), (0, 12), (0, 8), (0, 10), (0, 0), (0, 5), (0, 19), (1, 15), (0, 2)]
```

