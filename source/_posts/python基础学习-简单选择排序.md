---
title: python基础学习-简单选择排序
date: 2019-09-30 14:58:06
tags: python简单选择排序
categories: python
---

### 简单选择排序

- 简单选择排序
  - 属于选择排序
  - 两两比较大小，找出极值（极大值或极小值）被放置在固定的位置，这个固定位置一般指的是某一端
  - 结果分为升序和降序排列
- 降序
  - n个数从左至右，索引从0开始到n-1，两两依次比较，记录大值索引，此轮所有数比较完毕，将大数和索引为0的数交换，如果大数就是索引0，不交换。第二轮，从索引1开始比较，找到最大值，将它和索引1位置交换，如果它就在索引1位置则不交换。依次类推，每次左边都会固定下一个大数。
- 升序
  - 和降序相反

![](/images/python%E7%AE%80%E5%8D%95%E9%80%89%E6%8B%A9%E6%8E%92%E5%BA%8F/%E7%AE%80%E5%8D%95%E9%80%89%E6%8B%A9%E6%8E%92%E5%BA%8F1.png)



### 简单选择排序代码实现一

```python
# 简单排序实现
m_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1]]
nums = m_list[1]
length = len(nums)
print(nums)

count_swap = 0
count_iter = 0

for i in range(length):
# 按列表元素长度来迭代，第二次进入此循环，第一个索引，也就是索引0就不再进行比较了
    maxindex = i
# 假定最大值索引为i
    for j in range(i + 1, length): 
# j从列表元素的第二个数开始，所以加1。到长度减1结束，因为是索引，所以会少1。
        count_iter += 1
        if nums[maxindex] < nums[j]:
            maxindex = j
# 用maxindex索引与j索引比软，谁大，maxindex就替换为谁，实际是如果maxindex索引大，就不变，如果j索引
# 大，就将maxindex替换为j。之后再用j索引与maxindex索引比较，当第一次比较过后，会得到此轮比较的最大值
# 的索引。
            
    if i != maxindex:
# 每轮比较过后，用maxindex与i索引比较，如果不一样，说明i索引不是最大值，就要进行下面的替换。如果i索引
# 与maxindex索引相等，就不用动了。
        tmp = nums[i]
        nums[i] = nums[maxindex]
        nums[maxindex] = tmp
        count_swap += 1

print(nums, count_swap, count_iter)
输出：
[1, 2, 3, 4, 5, 6, 7, 8, 9]
[9, 8, 7, 6, 5, 4, 3, 2, 1] 4 36
```



### 简单选择排序代码实现二

#### 优化实现

```python
# 二元选择排序
# 同时固定左边最大值和右边最小值
# 优点：
# 减少迭代元素的次数
# 1. length//2整除，通过几次运算就可以发现规律
# 2. 由于使用了负索引，所以条件中要增加
# i == length + minindex
# 还有没有优化的可能？

m_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1]]
nums = m_list[1]
length = len(nums)
print(nums)

count_swap = 0   # 交换次数
count_iter = 0   # 迭代次数

for i in range(length // 2):   # [1,9,8,5,6,7,4,3,2]，因为每轮找到两个极值，所以要整除2
    maxindex = i
# 假定最大值的索引是最左边的i
    minindex = -i - 1
# 假定最小值的索引是最右边的数，因为是前包后不包，所以还要减1
    minorigin = minindex
# minorigin是记录每轮最小值开头的索引，每轮最大值开头的索引就是i，但没有记录最小值开头的索引，所以这里
# 要定义一个minorigin。
    
    for j in range(i + 1, length - i):  # 每次左右都要少比较一个，所以range()内的数字都要减少
        count_iter += 1
        if nums[maxindex] < nums[j]:
            maxindex = j
        if nums[minindex] > nums[-j - 1]:
            minindex = -j - 1
# 每轮进行两次比较，得到最大值与最小值索引          
#     print(maxindex,minindex)  打印每轮比较后得到的两个极值 
    
    if i != maxindex:
        tmp = nums[i]
        nums[i] = nums[maxindex]
        nums[maxindex] = tmp
        count_swap += 1
        # 如果最小值被交换过，要更新索引
        if i == minindex or i == length + minindex:
            minindex = maxindex
# 如果这里i不是最大值索引，就要把最大值索引给i。但这样变更后，minindex的索引也会受到影响，比如m_list
# 列表第一个元素中的情况，那么这里还要做一个判断，如果最小值索引等于i或等于length加最小值索引，那么就把
# 交换前的最大值索引赋值给最小值索引，这也就是为了保证最小值索引不会变。上面的判断中使用了or来判断两种情
# 况是因为minindex可能是负数，i是不会等于负数的，如果是负数，就要用长度加上这个负索引值，也可以得到一个 
# 正数的索引。保存了最小值索引，才能保证下面的判断是有意义的。
    if minorigin != minindex:
        tmp = nums[minorigin]
        nums[minorigin] = nums[minindex]
        nums[minindex] = tmp
        count_swap += 1
# 上面判断最大值与最小值索引是否
print(nums, count_swap, count_iter)
输出：
[1, 2, 3, 4, 5, 6, 7, 8, 9]
[9, 8, 7, 6, 5, 4, 3, 2, 1] 8 20
# 通过取两个极值，可以看到迭代的次数从36变成了20
```



#### 改进实现一

```python
# 如果一轮比较后，极大值、极小值的值相等，说明比较的序列元素全部相等

m_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1],[1,1,1,1,1,1,1,1,1,1]]
nums = m_list[3]
length = len(nums)
print(nums)
count_swap = 0
count_iter = 0

for i in range(length // 2):
    maxindex = i
    minindex = -i - 1
    minorigin = minindex
    for j in range(i + 1, length - i):
        count_iter += 1
        if nums[maxindex] < nums[j]:
            maxindex = j
        if nums[minindex] > nums[-j - 1]:
            minindex = -j -1
            
    if nums[maxindex] == nums[minindex]:
        break
    if i != maxindex:
        tmp = nums[i]
        nums[i] = nums[maxindex]
        nums[maxindex] = tmp
        count_swap += 1
        
        if i == minindex or i == length + minindex:
            minindex = maxindex
    if minorigin != minindex:
        tmp = nums[minorigin]
        nums[minorigin] = nums[minindex]
        nums[minindex] = tmp
        count_swap += 1
print(nums, count_swap, count_iter)
输出：
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1] 0 9
```



#### 改进实现二

```python
# [1,1,1,1,1,1,1,1,2]这种情况，找到的最小值索引是-2，最大值索引是8，上面的代码会交换2
# 次，最小值两个1交换是无用功，所以，增加一个判断

m_list = [[1,9,8,5,6,7,4,3,2],[1,2,3,4,5,6,7,8,9],[9,8,7,6,5,4,3,2,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,2]]
nums = m_list[4]
length = len(nums)
print(nums)
count_swap = 0
count_iter = 0

for i in range(length // 2):
    maxindex = i
    minindex = -i - 1
    minorigin = minindex
    for j in range(i + 1, length - i):
        count_iter += 1
        if nums[maxindex] < nums[j]:
            maxindex = j
        if nums[minindex] > nums[-j - 1]:
            minindex = -j -1
            
    print(maxindex,minindex)
    if nums[maxindex] == nums[minindex]:  # 元素相同
        break
    if i != maxindex:
        tmp = nums[i]
        nums[i] = nums[maxindex]
        nums[maxindex] = tmp
        count_swap += 1
        # 如果最小值被交换过，要更新索引
        
        if i == minindex or i == length + minindex:
            minindex = maxindex
    if minorigin != minindex and nums[minorigin] != nums[minindex]:
# 这里的判断指最小值索引不同，但值相同就没有必要交换了
        tmp = nums[minorigin]
        nums[minorigin] = nums[minindex]
        nums[minindex] = tmp
        count_swap += 1
print(nums, count_swap, count_iter)
输出：
[1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
9 -2
1 -2
[2, 1, 1, 1, 1, 1, 1, 1, 1, 1] 1 16
```



### 简单选择排序总结

- 简单选择排序需要数据一轮轮比较，并在每一轮中发现极值
- 没有办法知道当前轮是否已经达到排序要求，但是可以知道极值是否在目标索引位置上
- 遍历次数1,...,n-1之和n(n-1)/2
- 时间复杂度O(n**2)，因为用了两个循环，所以是n的平方
- 减少了交换次数，提高了效率，性能略好于冒泡法