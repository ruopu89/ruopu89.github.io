---
title: python基础学习-递归函数
date: 2019-11-12 18:04:35
tags: python递归函数
categories: python
---

### 函数执行流程

```python
# http://pythontutor.com/visualize.html#mode=edit
# 建议自己想像函数执行流程，先不要去上面的网站上看
def foo1(b,b1=3):
    print("foo1 called",b,b1)
    
def foo2(c):
    foo3(c)
    print("foo2 called",c)
    
def foo3(d):
    print("foo3 called",d)
    
def main():
    print("main called")
    foo1(100,101)
    foo2(200)
    print("main ending")
    
main()
```

![](/images/python递归函数/函数执行流程1.png)

- 全局帧中生成foo1、foo2、foo3、main函数对象
- main函数调用
- main中查找内建函数print压栈，将常量字符串压栈，调用函数，弹出栈顶
- main中全局查找函数foo1压栈，将常量100、101压栈，调用函数foo1，创建栈帧。print函数压栈，字符串和变量b、b1压栈，调用函数，弹出栈顶，返回值
- main中全局查找foo2函数压栈，将常量200压栈，调用foo2，创建栈帧。foo3函数压栈，变量c引用压栈，调用foo3，创建栈帧。foo3完成print函数调用后返回。foo2恢复调用，执行print后，返回值。main中foo2调用结束弹出栈顶。main继续执行print函数调用，弹出栈顶。main函数返回。
- 内存中分栈和堆，对函数来讲，它有一个栈，栈就是落盘子，只能从上面拿。栈是一个内存区域，它一直不停在被使用。它是一个先进后出，后进先出的。谁在压栈，谁就在使用内存，内存中的其他数据会先保存起来，保存起来以后给它压下去，之后再把print()压在它上面。这里指PPT中的代码def main(): print("main called")一段。这样当前就是print环境了，然后将字符常量也压到栈里。调用函数就是print()真的要执行了，它会把print()栈内的所有数据依次拿出来执行，执行完以后，栈上的数据就依次拿完了，它刚压进去的数据就消耗完了，这时print就可以弹出了，print一弹出，之前有为main保存的数据，依次再加载起来。main函数就可以继续执行了。之后在main中查找foo1并压栈，将常量100、101压栈。要依次用掉函数内的数据。在栈内要创建一段，这一段叫帧，因为在栈上，所以叫栈帧。函数的执行过程就是压栈与弹出的过程

```python
# 字节码不是重点，当对语言掌握的很好了，写程序没问题了，再来了解字节码
def foo1(b, b1=3):
    print("foo1 called", b, b1)
    foo2(2)
    
def foo2(A):
    pass
    
# foo1字节码
4          0 LOAD_GLOBAL             0 (print)
           3 LOAD_CONST              1 ('foo1 called)
           6 LOAD_FAST               0 (b)
           9 LOAD_FAST               1 (b1)
          12 CALL_FUNCTION           3 (1 positional, 0 keyword pair)
          函数调用，调用完成后，弹出所有函数参数，函数本身关闭堆栈，并推送返回值
          15 POP_TOP  # 删除顶部(TOS)项目
          
5         16 LOAD_GLOBAL             1 (foo2)
          19 LOAD_CONST              2 (2)
          22 CALL_FUNCTION           1 (1 positional, 0 keyword pair)
          25 POP_TOP           
          26 LOAD_CONST              0 (None)   # 这两行是foo1的返回值，None这个空值是一个常量，所以是LOAD_CONST
          29 RETURN_VALUE
# python中所有函数都有返回值
```



### 递归Recursion

- 函数直接或者间接调用自身就是递归
- 递归需要有边界条件、递归前进段、递归返回段
- 递归一定要有边界条件
- 当边界条件不满足的时候，递归前进
- 当边界条件满足的时候，递归返回

- 斐波那契数列 Fibonacci number: 1,1,2,3,5,8,13,21,34,55,89,144, ...
- 如果设F(n) 为该数列的第n项，那么这句话可以写成如下形式：F(n)=F(n-1)+F(n-2)
- F(0)=0，F(1)=1，F(n)=F(n-1)+F(n-2)

```python
pre = 0
cur = 1 
print(pre, cur, end=' ')
n = 4
# loop
for i in range(n-1):
    pre,cur = cur,pre + cur
    print(cur,end=' ')
    
# 递归解决斐波那契数列
# F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)
def fib(n):
    return 1 if n < 2 else fib(n-1)+fib(n-2)

for i in range(5):
    print(fib(i),end='')
    
# 把4代入，就是fib(3)+fib(2)，fib(3)要再次压栈，这时就又进fib这个函数了，这时要调用fib(2)+fib(1)
# fib(2)不小于2,所以还要调用一次fib(1)。fib(1)就是边界，因为小于2，这时就会执行return了，之前都不会
# return。这里的fib(3)+fib(2)会分别执行fib(3)和fib(2)，也就是执行2次
# 而且这个递归的效率非常低，因为压栈太多
```

- 递归要求
  - 递归一定要有退出条件，递归调用一定要执行到这个退出条件。没有退出条件的递归调用 ，就是无限调用 
  - 递归调用 的深度不宜过深
    - Python对递归调用的深度做了限制，以保护解释器
    - 超过递归深度限制，抛出RecursionError: maxinum recursion depth exceeded 超出最大深度
    - sys.getrecursionlimit()

```python
# 用pycharm测试
def foo1(b,b1=3):
    foo1(b)
    
# foo1(3)
import sys
print(sys.getrecursionlimit())
# 视频中是1000,超过这个值就会报错，这是一种保护机制
sys.setrecursionlimit(1000)
# 修改递归的层数，太消耗内存了
```



### 递归的性能

```python
# for 循环
import datetime
start = datetime.datetime.now()
pre = 0
cur = 1 # No1
print(pre, cur, end=' ')
n = 35
for i in range(n-1):
pre, cur = cur, pre + cur
	print(cur, end=' ')
	delta = (datetime.datetime.now() - start).total_seconds()
print(delta)

# 递归
import datetime
n = 35
start = datetime.datetime.now()
def fib(n):
	return 1 if n < 2 else fib(n-1) + fib(n-2)

for i in range(n):
	print(fib(i), end=' ')
delta = (datetime.datetime.now() - start).total_seconds()
print(delta)
```

- 循环稍微复杂一些，但是只要不是死循环，可以多次迭代直至算出结果
- fib函数代码极简易懂，但是只能获取到最外层的函数调用，内部递归结果都是中间结果。而且给定一个n都要进行近2n次递归，深度越深，效率越低。为了获取斐波那契数列需要外面再套一个n次的循环，效率就更低了
- 递归还有深度限制，如果递归复杂，函数反复压栈，栈内存很快就溢出了
- 思考：这个极简的递归代码能否提高性能？

```python
# 斐波寻契数列的改进
pre = 0
cur = 1
print(pre, cur, end=' ')  # 这里打印的是最前面的0和1

def fib(n, pre=0, cur =1):
    pre, cur = cur, pre + cur
    print(cur, end=' ')
    if n == 2:   # 这是最外层的条件，当满足条件时执行一次return。n是计数的，
        return
    fib(n-1, pre, cur)   
    # 这一句后隐含有return，每次都会执行return。我们不关心这个，因为我们要的是上面print的值
    # 上一次的结果，作为下一次的参数传进来
fib(5)
- 改进
	- 左边的fib函数和循环的思想类似
    - 参数n是边界条件，用n来计数
    - 上一次的计算结果直接作为函数的实参
    - 效率很高
    - 和循环比较，性能相近。所以并不是说递归一定效率代下。但是递归有深度限制
- 对比一下三个fib函数的性能
```



- 间接递归

```python
def foo1():
    foo2()
    
def foo2():
    foo1()
    
foo1()
- 间接递归，是通过别的函数调用了函数自身。但是如果构成了循环递归调用是非常危险的，但是往往这种情况在代码
复杂的情况下，还是可能发生这种调用。要用代码的规范来避免这种递归调用的发生
```



### 递归总结

- 递归是一种很自然的表达，符合逻辑思维
- 递归相对运行效率低，每一次调用函数都要开辟栈帧
- 递归有深度限制，如果递归层次太深，函数反复压栈，栈内存很快就溢出了
- 如果是有限次数的递归，可以使用递归调用，或者使用循环代替，循环代码稍微复杂一些，但是只要不是死循环，可以多次迭代直至算出结果
- 绝大多数递归，都可以使用循环实现
- 即使递归代码很简洁，但是能不用则不用递归
- 个人感觉，递归最重要的有三点。一是定义时，函数的参数就是变量，它一直在变化，所以可以向下执行。二是找到公式，也就是函数要完成的功能，如何不断的用一个公式递归自己，这可以通过要实现的功能来发现其中的规律。三是返回，实际就是告诉函数到什么地方就可以一级一级地向上返回值了，这个也可以从要实现的功能中找到，看功能到什么时候就可以结束。

