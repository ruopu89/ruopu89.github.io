---
title: python基础学习-匿名函数
date: 2019-11-13 13:50:23
tags: python匿名函数
categories: python
---

### 匿名函数

- 匿名，即没有名字
- 匿名函数，即没有名字的函数
  - 没有名字如何定义
  - 没有名字如何调用
  - 如果能调用，如何使用
- python借助Lambda表达式构建匿名函数

```python
语法：lambda 参数列表: 表达式
lambda x:x**2
(lambda x:x**2)(4)  # 调用
输出：16
foo = lambda x,y:(x+y)**2  # 不推荐这么用
foo(2,1)
def foo(x,y):  # 建议使用普通函数
    return(x+y)**2
foo(2,1)
```

- 使用lambda关键字来定义匿名函数
- 参数列表不需要小括号
- 冒号是用来分割参数列表和表达式的
- 不需要使用return，表达式的值，就是匿名函数返回值
- lambda表达式(匿名函数)只能写在一行上，被称为单行函数
- 用途
  - 在高阶函数传参时，使用lambda表达式，往往能简化代码

```python
lst = [1]
# lst.sort?
# key=None,reverse=False
lst.sort(key=str)
lst.append('a')
# lst.sort()
# 没办法比较，因为类型不一样，需要统一类型
lst.sort(key=str)   # 送进去一个函数，和lambda函数一样，都是送进去函数
lst.append(2)
lst.sort(key=str)   # 这里key就是向进传函数的
lst 

print((lambda :0)())
# 上面一句相当于
# def fn():
#     return 0
print((lambda x,y=3:x+y)(5))
print((lambda x,y=3:x+y)(5,6))
输出：11
print((lambda x,*,y=30:x+y)(5))
输出：35
print((lambda x,*,y=30:x+y)(5,y=10))
输出：15
print((lambda *args:(x for x in args))(*range(5)))
输出：<generator object <lambda>.<locals>.<genexpr> at 0x7f056cf7c138>
print((lambda *args:[x+1 for x in args])(*range(5)))
输出：[1, 2, 3, 4, 5]
print((lambda *args:{x+2 for x in args})(*range(5)))
输出：{2, 3, 4, 5, 6}
[x for x in (lambda *args:map(lambda x:x+1,args))(*range(5))]  # 高阶函数
标准输出：Out:[1, 2, 3, 4, 5]
[x for x in (lambda *args:map(lambda x:(x+1,args),args))(*range(5))]
标准输出：
Out:[(1, (0, 1, 2, 3, 4)),
 	 (2, (0, 1, 2, 3, 4)),
 	 (3, (0, 1, 2, 3, 4)),
 	 (4, (0, 1, 2, 3, 4)),
 	 (5, (0, 1, 2, 3, 4))]
```

