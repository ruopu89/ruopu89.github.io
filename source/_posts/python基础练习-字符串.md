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
# reversed()是一个内置的方法，可以返回一个新的可迭代对象

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
for x in num:   # unique(n) * n，unique(n)取值[1,10]，当数字一样时，就是1*n。
# 这里会将数字的每一位传给x
    i = int(x)
# 这里先将x转为数字，之后赋值给i。
    if counter[i] == 0:   #如果不加判断，就是n*n的效率
# counter是一个有十个位置的空间，因为不论是几位数，数字都是在0～9之间，这里判断counter
# 中索引为[i]的地方是否为0，因为如果是第一次判断索引[i]，那么一定是0，因为没有统计过，如
# 果统计过，这个索引[i]一定不为0。因为x和i的值是一样的，所以这里将索引与数字相对应，使数字
# 与索引的值一致，达到counter的值为0～9顺序排列的效果，这从下面一行代码可以更好的表现出
# 来。这里将num变为索引[i]来对应counter中的位置，只是不会超出counter的范围
        counter[i] = num.count(x)
# 当判断为0时，这时就要计算x在num中出现过几次，再将这个值放入counter中索引为[i]的位置
# 比如用户输入的数字是12113，初始应该像是[0,0,0,0,0,0,0,0,0,0]，统计过次数后，变为
# [0,3,1,1,0,0,0,0,0,0]。下面打印时，会将x先打印出来，之后是x的出现次数。
# 也就是counter中的值。但因为输入的是12113，也就是x是12113，应该依次打印这五个数字出现的
# 次数。但因为上面加入了判断：if counter[i] == 0时才会进入这里统计打印，所以当有重复数字
# 出现时，是不会进入这里的。
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
# 这个方法同样是开辟一个空间，之后在第一个for循环时遍历所有数字，每遇到一个数字就在其对应
# 的索引位置加1。如11231，第一次是1，在counter[1]的位置加1，第二次还是1，在counter[1]
# 的位置再加1。第三次是2，在counter[2]的位置加1。都统计过之后，counter的值应该像是
# [0,3,1,1,0,0,0,0,0,0]，这个值对应的就是0～9顺序排列的位置，这是在第二个for循环开始
# 定义好的，也就是for i in range(len(counter)):就定义好了，这个counter的值是顺序排列
# 的。在第二个for循环中，以counter的长度为范围，这个范围是10，用if counter[i]:判断这个
# 索引位置的值是否为0，如果为0，就进入下一次循环，如果不为0，就打印i的值和对应的索引位置的
# 值。
        
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
答案1：sort方法排序
nums = []
while len(nums) < 5:   # 只要nums中少于5个元素就循环，也就是让用户输入五次数字
    num = input("Please input a number:".strip().lstrip('0'))
    if not num.isdigit():    # 如果输入的不是数字就会跳出此次循环，重新输入五次
        continue
    print('The length of {} is {}'.format(num,len(num)))
    nums.append(int(num))
print(nums)
lst = nums.copy()
lst.sort()
print(lst)
输出：
Please input a number:123124124
The length of 123124124 is 9
Please input a number:12312312
The length of 12312312 is 8
Please input a number:123123123
The length of 123123123 is 9
Please input a number:123123123
The length of 123123123 is 9
Please input a number:12312312
The length of 12312312 is 8
[123124124, 12312312, 123123123, 123123123, 12312312]
[12312312, 12312312, 123123123, 123123123, 123124124]

答案2：冒泡法
nums = []

while len(nums) < 5:
    num = input("Please input a number:".strip().lstrip('0'))
    if not num.isdigit():
        continue
    print('The length of {} is {}'.format(num,len(num)))
    nums.append(int(num))
print(nums)

for i in range(len(nums)):   
# 输入五次数字后这里要循环5次，也就是5个数字分别与每个数字比较
    flag = False
    for j in range(len(nums)-i-1):   
# 这里定义的是每次比较的次数，因为不需要与本身比较，所以会减i，因为索引是从0开始的，
# 所以i第一次是0,所以还要减1。每次比较后最大的数字就会排在最后，下一次循环就不用比较了
        if nums[j] > nums[j+1]:   # 如果靠前的索引大于后面的索引，如索引0大于索引1
            tmp = nums[j]   # 将靠前的索引值给一个临时变量
            nums[j] = nums[j+1]   # 将后面的索引值赋值给靠前的索引
            nums[j+1] = tmp # 将临时变量的值赋值给靠后的索引，这样前后索引的值就对调了 
            flag = True   # 对调过一次就将标记改为True
    if not flag:
        break
print(nums)
输出：
Please input a number:123456
The length of 123456 is 6
Please input a number:74532
The length of 74532 is 5
Please input a number:875643
The length of 875643 is 6
Please input a number:673452
The length of 673452 is 6
Please input a number:09876543
The length of 09876543 is 8
[123456, 74532, 875643, 673452, 9876543]
[74532, 123456, 673452, 875643, 9876543]
```

