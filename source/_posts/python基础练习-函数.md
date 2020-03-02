---
title: python基础练习-函数
date: 2019-11-08 08:23:10
tags: python函数
categories: python
---

- 编写一个函数，能够接受至少2个参数，返回最小值和最大值

```python
import random
def double_values(*nums):
    print(nums)
    return max(nums), min(nums)

print(*double_values(*[random.randint(10,20) for _ in range(10)]))
# 这里调用double_values()时给的参数使用了参数解构，并且使用了列表解析式，
# random.randint(10,20)表示返回10到20之间的随机整数，后面的for循环表示执行10次，这将组成一个列表，
# 然后用参数解构挨个给double_balues函数。double_values前面的星号也是参数解构，打印时会将
# double_values中得到的最大最小值分开打印，不然会按元组形式打印在一起
# 这里的print()还有一个隐含的强制类型转换，并数字转换为字符串再打印
输出：
(11, 10, 16, 13, 13, 15, 13, 11, 16, 13)
16 10
```



- 编写一个函数，接受一个参数n，n为正整数，左右两种打印方式。要求数字必须对齐

```python
# 上三角
def show(n):
    tail = " ".join([str(i) for i in range(n,0,-1)])
# 这一行算的是最下面一行的值，不管有几位数，知道最后一行就可以知道上面的行的字符串长度了join用于字符串
# 连接，以" "为分隔符，列表解析式将n到0倒序传给i，再将i依次转换为字符串，最后就是要以倒序排列一个字符
# 串，如12 11 ... 1。tail = " ".join([str(i) for i in range(n,0,-1)])不用中括号也可以，如
# tail = " ".join(str(i) for i in range(n,0,-1))。这里必须用字符串，如果用int形式是不行的
    width = len(tail)
# 计算tail的长度
    for i in range(1,n):  
# 因为第一行只有一个1，所有这里range()从1到n打印，因为这里到第n行，所以最后还要再打印一次tail行的值
        print("{:>{}}".format(" ".join([str(j) for j in range(i,0,-1)]),width))
# {:>{}}中>表示右对齐，里面的{}表示这一行的宽度，format()里，逗号前面的部分就是要打印的部分，width表
# 示这一行的宽度，宽度是不会变的。只是打印都向右对齐就可以了
    print(tail)
show(12)
输出：
                         1
                       2 1
                     3 2 1
                   4 3 2 1
                 5 4 3 2 1
               6 5 4 3 2 1
             7 6 5 4 3 2 1
           8 7 6 5 4 3 2 1
         9 8 7 6 5 4 3 2 1
      10 9 8 7 6 5 4 3 2 1
   11 10 9 8 7 6 5 4 3 2 1
12 11 10 9 8 7 6 5 4 3 2 1

# 下三角
def showtail(n):
    tail = " ".join([str(i) for i in range(n,0,-1)])   
# 计算出第一行的值，这里利用了字符串的特点，把所有值包括空格都算成一个个元素
    print(tail)   # 把第一行的值打印出来
    # 无需再次生成列表
#     print(len(tail))   # 查看tail一共有多少个元素
    for i in range(len(tail)):    
# 这里计算出第一行的长度，之后以此为基础。第一行的长度是23，这表示空格也算为一个元素。
#         print(i)   # 加入此行可以更明显地看出i的值执行到哪就满足了下面的条件
        if tail[i] == ' ':   
# 从11开始算，第一个1的索引是0，第二个1的索引是1，第三个空格的索引是2，这时满足条件，元素是空格
            print(' '*i,tail[i+1:])
# 当上面满足时，这里用空格乘在上面的i，这样就形成了从第二行开始，每行前面要打印的空格，再加上tail中i+1
# 索引处到最后的值。这样就凑出了一行的值。另外，tail[i+1:]是一个列表切片操作，这是一个copy方法，所以对
# 性能有一些影响，如果打印10000的话可能会引起垃圾回收
showtail(11)
输出：
11 10 9 8 7 6 5 4 3 2 1
0
1
2
   10 9 8 7 6 5 4 3 2 1
3
4
5
      9 8 7 6 5 4 3 2 1
6
7
        8 7 6 5 4 3 2 1
8
9
          7 6 5 4 3 2 1
10
11
            6 5 4 3 2 1
12
13
              5 4 3 2 1
14
15
                4 3 2 1
16
17
                  3 2 1
18
19
                    2 1
20
21
                      1
22

# 把正三角打印稍微改一下就会变成下三角
def show(n):
    tail = " ".join(str(i) for i in range(n,0,-1)) # 这行还有用，下面要用tail计算元素个数
    width = len(tail)
# 这里也可以写为width = len(" ".join(str(i) for i in range(n,0,-1)))，这样就不用上面tail一行了
    for i in range(n,0,-1):   # 改这里就可以
        print("{:>{}}".format(" ".join(str(j) for j in range(i,0,-1)),width))
    
show(11)
输出：
11 10 9 8 7 6 5 4 3 2 1
   10 9 8 7 6 5 4 3 2 1
      9 8 7 6 5 4 3 2 1
        8 7 6 5 4 3 2 1
          7 6 5 4 3 2 1
            6 5 4 3 2 1
              5 4 3 2 1
                4 3 2 1
                  3 2 1
                    2 1
                      1
```

