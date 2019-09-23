---
title: python基础练习-封装与解构
date: 2019-09-19 14:38:55
tags: python练习-封装和解构
categories: python
---

```python
练习1：lst = list(range(10)) 
# 这样一个列表,取出第二个、第四个、倒数第二个

lst = list(range(10))
one,two,three,four,*_,Mtwo,Mone = lst
print(two,four,Mtwo)
输出：1 3 8

练习2：从lst = [1,(2,3,4),5]中提取4出来

lst = [1,(2,3,4),5]
_,(*_,a),_ = lst
print(a)
输出：4

练习3：环境变量JAVA_HOME=/usr/bin，返回环境变量名和路径

s = 'JAVA_HOME=/usr/bin'
name,_,path = s.partition('=')
print(name,path)
输出：JAVA_HOME /usr/bin

s = 'JAVA_HOME=/usr/bin'
name,*_,path = s.split('=')
print(name,path)
输出：JAVA_HOME /usr/bin

s = 'JAVA_HOME=/usr/bin'
name,path = s.split('=')
print(name,path)
输出：JAVA_HOME /usr/bin

练习4：对列表[1,9,8,5,6,7,4,3,2]使用冒泡法排序，要求使用封装和解构来交互数据
lst=[1,9,8,6,3,4,5,2,7]
for i in range(9):
# 一共要循环比较的次数，从第一个数字与第二个数字比较，一直比较到最后一个数字。
# 这算一次。因为一共有9个数字，所以要比较九轮
    for j in range(8-i):
# range中是每次要比较的次数，因为i是从0开始的，所以这里用8来减i，就是每次数字要比较
# 的次数，也就是从第一个比较到最后一个，第一次第1个数字要和后面8个数字比较，之后每次
# 比较都会少一个数字
        if lst[j] > lst[j+1]:
# 如果在比较中，前面的数字大于后面的数字，就按下面方法把前后两个数字对调。这样一直比较，
# 就会将最大的数字放到最后。
            lst[j],lst[j+1] = lst[j+1],lst[j]   
            # 这是封装解构的过程，但交换还是很耗时的
print(lst)
输出：[1, 2, 3, 4, 5, 6, 7, 8, 9]

lst = [1,9,8,6,3,4,5,2,7]
for i in range(len(lst)):
    for j in range(8,0,-1):
        if lst[j] > lst[j-1]:  
# 因为上面range定义的范围是从大到小排列，所以这里是从后面前比较，大的数字会排到最前面。
            lst[j],lst[j-1] = lst[j-1],lst[j]
print(lst)
输出：[9, 8, 7, 6, 5, 4, 3, 2, 1]
```

