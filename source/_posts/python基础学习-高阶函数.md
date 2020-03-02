---
title: python基础学习-高阶函数
date: 2019-11-18 13:58:23
tags: python函数
categories: python
---

### 高阶函数

- First Class Object
  - 函数在Python中是一等公民
  - 函数也是对象，可调用的对象
  - 函数可以作为普通变量、参数、返回值等等
- 高阶函数
  - 数学概念`y=g(f(x))`
  - 在数学和计算机科学中，高阶函数应当是至少满足下面一个条件的函数
    - 接受一个或多个函数作为参数
    - 输出一个函数

- 计数器

```python
def counter(base):
    def inc(step=1):
        nonlocal base
# 这里因为base是自由变量，指counter的形参。在inc函数中 base += step是在重新赋值，所以要加上
# nonlocal，让inc函数向上一级且不是global环境找base函数
        base += step
        return base
    return inc

foo = counter(10)
foo1 = counter(10)
print(foo())
# 将counter(10)赋值给foo后，还是要加上括号才会显示foo的值，不然会显示函数的属性
foo == foo1
输出：
False
# 内存分为堆和栈，在堆内存中做对象的创建，栈是相对有限的空间，堆比栈大一些，但堆里是乱的(实际没这么乱，
# 只是这样理解)，所以虚拟机才要回收走。我们在堆上创建两个对象foo和foo1，这两个对象都是inc创建出来的，
# 这都是因为调用 counter()之后，inc又赋值给了foo和foo1，foo和foo1变量实际不在这，所以看到foo和foo1
# 的地址不一样。当第一次调用counter()时，counter会压栈，counter的参数也压栈，压栈后要创建一段栈帧，
# 创建栈帧后，里面要创建临时对象。这个对象就是inc，inc要把它的函数体执行完才能把inc赋值给foo，因为执行
# 完inc最后要return，那么return后，从return base以上就全部消失了，因为栈里要清空，之后就要把函数
# 的return值赋给foo了。foo1的过程是一样的，但foo1是inc在堆里重新创建的对象，所以foo和foo1是两个完全
# 不一样的对象。因为两个对象foo和foo1在堆中没有消亡，所以两个指向对象的函数inc在堆中也没有消亡。
id(foo)
输出：140341302380608
id(foo1)
输出：140341302381832
```

- 分析
  - 函数counter是不是一个高阶函数
  - 上面代码有没有什么问题？怎么改进
  - 如何调用完成计数功能
  - `foo = counter(10)`和`foo1 = counter(10)`，请问foo和foo1相等吗？



### 自定义sort函数

- 排序问题
  - 依照内建函数sorted，请自行实现一个sort函数（不使用内建函数），能够为列表元素排序
- 思路
  - 内建函数sorted函数是返回一个新的列表，可以设置升序或降序，可以设置一个排序的函数。自定义的sort函数也要实现这个功能
  - 新建一个列表，遍历原列表，和新列表的值依次比较决定如何插入到新列表中
- 思考
  - sorted函数的实现原理，扩展到map、filter函数的实现原理

```python
# sort函数实现。下面实现的什么排序？还能怎么改变
def sort(iterable):
    ret = []
    for x in iterable:
        for i,y in enumerate(ret):   
        # 使用enumerate是为了给列表中的元素添加上索引，以方便下面比较。比较会将iterable中的数字与所
        # 有ret列表中的数字比较，比较一次就进行一次下面的操作，当每轮全部比较完时，iterable中的数字也
        # 就找到了在ret列表中应该放的确切位置
            if x > y:   # 找到大的就地插入。如果换成x < y呢，函数什么意思呢？
                ret.insert(i,x)   # 降序
                break
            else:   # 不大于，说明是最小的，尾部追加
                ret.append(x)
    return ret
# 开始这里是没有函数的，但我们认为if x > y: 可以利用函数把它变成更加灵活的表现形式，要把它抽象出来，可
# 以先写成一个if三元的形式，然后把它抽象成一个内部的函数，之后再把它变成一个外部函数，变成外部函数后要把
# 它的形参和本地变量去掉，变成一个通用的函数。函数的封装要通用，它尽量不要直接引用外部的变量，除了在嵌套
# 函数中使用闭包的时候。写函数的原则是，外部变量都应该不是通过可见性来访问的，而是通过传参的方式传递给你
# 的。核心的逻辑，如果是可变的，把它提取出去，作为参数传递进来，因为函数是一等公民
print(sort([1,2,5,4,2,3,5,6]))

# sort函数实现。用一个参数控制顺序
def sort(iterable,reverse=False):
    ret = []
    for x in iterable:
        for i,y in enumerate(ret):
            flag = x > y if reverse else x < y
            if flag:   # 是否能进一步改进
                ret.insert(i,x)
                break
            else:
                ret.append(x)
    return ret
print(sort([1,2,5,4,2,3,5,6]))

# sort函数实现。下面实现的什么排序？还能怎么改变
def sort(iterable,key=lambda a,b:a>b):
    ret = []
    for x in iterable:
        for i,y in enumerate(ret):
            if key(x,y):   # 函数的返回值是bool
                ret.insert(i,x)
                break
            else:
                ret.append(x)
    return ret
print(sort([1,2,5,4,2,3,5,6]))

# sort函数实现
def sort(iterable,reverse=False,key=lambda x,y:x<y):
    ret = []
    for x in iterable:
        for i,y in enumerate(ret):
            flag = key(x,y) if not reverse else not key(x,y)
            if flag:
                ret.insert(i,x)
                break
            else:
                ret.append(x)
    return ret
print(sort([1,2,5,4,2,3,5,6]))   
```



### 内建函数-高阶函数

- `sorted(iterable[,key][,reverse])`
  - 排序
  - 返回一个新的列表，对一个可迭代对象的所有元素排序，排序规则为key定义的函数，reverse表示是否排序翻转
  - `sorted(lst,key=lambda x:6-x)`   返回新列表
  - `list.sort(key=lambda x:6-x)`   就地修改
- `filter(function,iterable)`->`filter object`
  - 过滤数据
  - 过滤可迭代对象的元素，返回一个迭代器
  - function一个具有一个参数的函数，返回bool
  - 例如，过滤出数列中能被3整除的数字
    - `list(filter(lambda x:x%3 == 0,[1,9,55,150,-3,78,28,123]))`
    - 因为x%3 == 0是一个逻辑表达式，那一定会返回True或False，这个表达式的值就是return值，所以这里返回的是一个bool类型。把x%3 == 0可以改为0或True，效果是怎样的？
- `map(func,*iterables)` -> `map object`
  - 映射
  - 对多个可迭代对象的元素按照指定的函数进行映射，返回一个迭代器
    - `list(map(lambda x:2*x+1,range(5)))`
    - `dict(map(lambda x:(x%5,x),range(500)))`
      - 只会显示下面5个信息是因为通过key过滤掉重复数据了?



### 柯里化 Currying

- 柯里化
  - 指的是将原来接受两个参数的函数变成新的接受一个参数的函数的过程。新的函数返回一个以原有第二个参数为参数的函数
  - `z = f(x,y)`转换成`z = f(x)(y)`的形式

```python
# 举例：将加法函数柯里化
def add(x,y):
    return x + y
# 转换如下：
def add(x):
    def _add(y):
        return x + y
    return _add   # 这里应该返回一个函数
add(5)(6)
# 通过嵌套数就可以把函数转换成柯里化函数
# 我们需要将add(4,5) ==> add(4)(5) ==> func(5) ==> func=add(4)
foo = add(4)
print(foo(5))
# 等价于下面的写法
pinrt(add(4)(5))

```

