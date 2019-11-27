---
title: python基础练习-递归函数
date: 2019-11-13 09:48:30
tags: python递归函数
categories: python
---

- 求n的阶乘

```python
def func(num):
    if num == 1:
        return 1
    else:
        return num * func(num-1)
    # 这是阶乘的关键，也是公式，就是总是自已乘以比自己小1的数

func(5)
# 执行过程是，进入函数后，直接到num * func(num-1)这一行。代入数字就是5*func(4)，func(4)再进入函
# 数，返回4*fun(3)，之后是3*func(2)，2*func(1)，再进入函数时，num等于1了，所以返回1。把1代入
# 2*func(1)，也就是2*1=2，再向上返回到3×func(2)，因为之前func(2)已经返回了2，所以这里是3*2=6，再
# 向上返回，代入后是4*6=24，再向上，5*24=120，这样阶乘的结果就出来了。返回条件是当条件满足时返回一个
# 值，之后依次向前返回并计算

=======================================================================================

def factorial(n,mu1 = 1):
    mu1 *= n   
# 当前乘以当前值就完了，如果调用时n给了2，那么这里就是1*2。这里又重新给mu1赋了值，那么这时mu1就是2了
    if n == 1:   # 这是边界条件
        return mu1
    return factorial(n-1,mu1)   
# 调用自己，这时n-1=1，mu1=2，这样再进入函数时，mul=2*1=2，n等于1,满足了条件，就会返回mu1的2

factorial(5)

=======================================================================================

def fac(n):
    if n == 1:
        return 1
    return n * fac(n-1)
fac(5)

=======================================================================================

def fac1(n,p = 1):
    if n == 1:
        return p
    p *= n
    print(p)
    fac1(n-1,p)
    return p
fac1(5)
输出：
5
20
60
120

=======================================================================================

def fac2(n, p = None):
    if p is None:
        p = [1]
    if n == 1:
        return p[0]
    p[0] *= n
    print(p[0])
    fac2(n-1,p)
    return p

n =5
print(fac2(n))
输出：
5
20
60
120
[120]
# fac函数性能最好，因为时间复杂度是相同的，fac最简单
```





- 将一个数逆序放入列表中，例如1234 -> [4,3,2,1]

```python
# 把1234改为4321
data = str(1234)

def reversal(x):
    if x == -1:
        return ''
    else:
        return data[x] + reversal(x-1)   
# 这是一个字符串连接，最后一次return出去。这个return才是我们可以拿到的值，上面的return是拿不到的
    
print(reversal(len(data)-1))

=======================================================================================

def reverse(n,lst=None):  # lst=None应该改为一个[]
    if lst is None:
        lst = []
        
    lst.append(n%10)   # 这里可以用divmod函数，可以拿到商和模两个数
    if n//10 == 0:
        return lst
    return reverse(n//10,lst)

reverse(12345)

=======================================================================================

data = str(1234)

def revert(x):
    if x == -1:
        return ''
    return data[x] + revert(x-1)
print(revert(len(data)-1))
输出：
4321

=======================================================================================

def revert(n,lst=None):
    if lst is None:
        lst = []
        
    x,y = divmod(n,10)
    lst.append(y)
    if x == 0:
        return lst
    return revert(x,lst)

revert(12345)
输出：
[5, 4, 3, 2, 1]

=======================================================================================

num = 1234

def revert(num,target=[]):  # 这里的target不是关键字参数，而是位置参数
    if num:  # 表示当num为空时，是false，就不满足条件了
        target.append(num[len(num)-1])  # target.append(num[-1:])  因为使用了切片，所以有一个copy的过程
        revert(num[:len(num)-1])
    return target   # 里面return多少次都没有关系。我们只关心最外层的return出的内容

print(revert(str(num)))
输出：
['4', '3', '2', '1']
```





- 解决猴子吃桃问题。猴子第一天摘下若干个桃子，当即吃了一半，还不过瘾，又多吃了一个。第二天早上又将剩下的桃子吃掉一半，又多吃了一个。以后每天早上都吃了前一天剩下的一半零一个。到第10天早上想吃时，只剩下一个桃子了。求第一天共摘多少个桃子

```python
# 发现公式：(后一天的桃子数量+1) * 2 = 前一天的桃子数量

def peach(day=9,sum=1):
    sum=2*(sum+1)
    day-=1
    if day==0:   # 要循环10次，所以这里要到0
        return sum
    return peach(day,sum)
print(peach())
输出：
1534

=======================================================================================

def monkey(n):
    if n == 1:
        return 1
    return 2 * monkey(n - 1) + 2

peach = monkey(10)
print(peach)
输出：
1534
for _ in range(10,0,-1):   
    # 这里的range()一定要写成这种形式，不然会超出递归最大深度，主要因为这里如果是0就会成为列循环
    print(_,"->",monkey(_))
输出：
10 -> 1534
9 -> 766
8 -> 382
7 -> 190
6 -> 94
5 -> 46
4 -> 22
3 -> 10
2 -> 4
1 -> 1
=======================================================================================

def peach(days=10):
    if days == 1:
        return 1
    return (peach(days-1)+1)*2

print(peach())
# 注意这里必须是10，因为return(peach(days-1)+1)*2立即拿不到结果，必须通过再一次进入函数时判断是不是
# 到了最后一天。也就是当前使用的值是由下一次函数调用得到，所以要执行10次函数调用

=======================================================================================

def peach(days=1):
    if days == 10:
        return 1
    return (peach(days+1)+1)*2

print(peach())
```



- 递归调用对比

```python
import datetime
# Fib Seq
start = datetime.datetime.now()
pre = 0
cur = 1 # No1
print(pre, cur, end=' ')
n = 35
# loop
for i in range(n-1):
    pre, cur = cur, pre + cur
    print(cur, end=' ')
delta = (datetime.datetime.now() - start).total_seconds()
print(delta)

# Fib Seq
start = datetime.datetime.now()
pre = 0
cur = 1 # No1
print(pre, cur, end=' ')
# recursion
def fib1(n, pre=0,cur=1):
    pre, cur = cur, pre + cur
    print(cur, end=' ')
    if n == 2:
        return
    fib1(n-1, pre, cur)

fib1(n)
delta = (datetime.datetime.now() - start
         ).total_seconds()
print(delta)

start = datetime.datetime.now()
def fib2(n):
    if n < 2:
        return 1
    return fib2(n-1) + fib2(n-2)

for i in range(n):
    print(fib2(i), end=' ')
delta = (datetime.datetime.now() - start).total_seconds()
print(delta)
```

