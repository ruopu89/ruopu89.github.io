---
title: python基础练习-装饰器的应用
date: 2019-11-27 17:53:16
tags: python练习
categories: python
---

### 装饰器的应用

#### 一、实现一个cache装饰器，实现可过期被清除的功能

简化设计，函数的形参定义不包含可变位置参数、可变关键字参数和keyword-only参数，如`def add(x=[],y=5)`，这样会提示list是不能hash的，可变类型不可作为参数。可以不考虑缓存满了之后的换出问题。



#### 数据类型的选择

缓存的应用场景，是有数据需要频繁查询，且每次查询都需要大量计算或者等待时间之后才能返回结果的情况，使用缓存来提高查询速度，用空间换取时间。压缩是用时间换空间



#### cache应该选用什么数据结构？

便于查询的，且能快速找到数据的数据结构。

每次查询的时候，只要输入一致，就应该得到同样的结果（顺序也一致，例如减法函数，参数顺序不一致，结果不一样）

基于上面的分析，此数据结构应该是字典。

通过一个key，对应一个value。

key是参数列表组成的结构，value是函数返回值。难点在于key如何处理。



#### key的存储

key必须是hashable，不把可变类型作为参数

key能接收到位置参数和关键字参数传参

位置参数是被收集在一个tuple中的，本身就有顺序

关键字参数被收集在一个字典中，本身无序，这会带来一个问题，传参的顺序未必是字典中保存的顺序。如何解决？

OrderedDict行吗？可以，它可以记录顺序

不用OrderedDict行吗？可以，用一个tuple保存排过序的字典的item的kv对。



#### key的异同

什么才算是相同的key呢？

```python
import time
import functools
@functools.lru_cache()
def add(x,y):
    time.sleep(3)
    return x + y
```

定义一个加法函数，那么传参方式就应该有以下4种：

```python
1. add(4,5)
2. add(4,y=5)
3. add(y=4,x=5)
4. add(x=5,y=4)
```

上面4种，可以有下面两种理解：

第一种：3和4相同，1、2、3都不同

第二种：1、2、3、4全部相同

lru_cache实现了第一种，可以看出单独的处理了位置参数和关键字参数。但是函数定义为def add(4,y=5)，使用了默认值，如何理解add(4,5)和add(4)是否一样呢？如果认为一样，那么lru_cache无能为力。就需要使用inspect来自己实现算法



#### ***key的要求***

**key必须是hashable**。由于key是所有实参组合而成，而且最好要作为key的，key一定要可以hash，但是如果key有不可hash类型数据，就无法完成。lru_cache就不可以。

```python
def add1(x,y):
    return y

>>>add1([],5)
5

@functools.lru_cache()   # 使用缓存时必须可hash，不然会报错。下面分析列表可hash的原因
def add(x,y=5):
    time.sleep(3)
    return y

>>>add(4)
5

>>>add([],5)
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-4-5316606bdb94> in <module>
      7     return y
      8 
----> 9 add1([],5)

TypeError: unhashable type: 'list'
        
=======================================================================================    
# class _HashedSeq(list):
#     __slots__ = 'hashvalue'
    
#     def __init__(self,tup,hash=hash):
#         self[:] = tup # 这里虽然没有定义过self，但稳含调用了list
#         self.hashvalus = hash(tup)
        
#     def __hash__(self):
#         return self.bashvalue
    
# 要创建一个类的对象，实际就是调用了list，自己创建了自己，这样就把自己创建成列表了，相当于执行了lst = []。然后再执行lst[:] = (1,2)
# 
# lst = []
# lst[:] = (1,2)
# lst
# lst[1:] = (1,2)   # 一般不用这种方式，容易搞乱
# lst
# 当每次调用hash函数时，实际执行的是__hash__(self)这个方法 ，如执行key = _HashedSeq(list)会调用
# _HashedSeq(list)并返回一个列表，列表本来是不可hash的，如果调用hash，就会调用__hash__(self)这个
# 函数，就会返回self.bashvalue，self.bashvalue就是self.hashvalus = hash(tup)，tup就是tuple元
# 组，这是在创建时把hash(tup)的值保留下来了，所以就可以hash列表了
```

缓存必须使用key，但是key必须可hash，所以只能适用实参是不可变类型的函数调用。



#### key算法设计

inspect模块获取函数签名后，会得到parameters，这是一个有序字典，会保存所有参数的信息。我们用得到的有序字典构建一个params_dict，按照位置顺序从args中取出的参数与params_dict中的key是依次对应的，params_dict是参数名，args中是传入的实参，组成kv对，存入params_dict中。

如果是kwargs的值，就update到params_dict中。这是字典的更新方法

如果使用了缺省值的参数，不会出现在实参params_dict中，会出现在签名的取parameters中，缺省值也在定义中。



#### 调用方式

普通的函数调用可以，但是过于明显，最好类似lru_cache的方式，让调用者无察觉的使用缓存。使用装饰器函数。

```python
from functools import wraps
import inspect

def mag_cache(fn):
    local_cache = {}   
# 对不同函数名是不同的cache，用一个普通字典，最后用sorted排序，这是一个二元组，就可以向tuple里放了
    @wraps(fn)
    def wrapper(*args,**kwargs):
        # 参数处理，构建key
        ret = fn(*args,**kwargs)
        return ret
    return wrapper

@mag_cache
def add(x,y,z=6):
    return x + y + z

def add(x,z,y=6):
    return x + y + z

add(4,5)
add(4,z=5)
add(4,y=6,z=5)
add(y=6,z=5,x=4)
add(4,5,6)
# 目标是上面几种都等价，也就是key一样，这样都可以缓存。只有位置参数匹配完才会匹配关键字参数，所以不能用
# add(4,y=9)这样的形式调用，会提示缺少参数z
add(4,8,y=5)
# 这样也可以，4和8会被args接收，kwargs接收y=5，这里就会覆盖y=5，所以不会这样使用
```

完成了key的生成。注意，这里使用了普通字典params_dict，先把位置参数的对应好，再填充关键字参数，最后补充缺省值，然后再排序生成key。

```python
from functools import wraps
import inspect

def mag_cache(fn):
    local_cache = {}
# 对不同函数名是不同的cache，这个字典是保存构建的key和得到的add计算的值的。这个字典是无序的
    @wraps(fn)
    def wrapper(*args,**kwargs):   # 接收各种参数，kwargs普通字典参数无序
        # 参数处理，构建key。
        sig = inspect.signature(fn)   # 获取签名
        params = sig.parameters   # 把签名的有序字典放到params中
        
        param_names = [key for key in params.keys()]   # list(params.keys())
        params_dict = {}   
        # 这是构造key用的，用一个普通字典，最后用sorted排序，这是一个二元组，就可以向tuple里放了
        
        for i,v in enumerate(args):
            k = param_names[i]
            params_dict[k] = v
        # 这里要用索引把值对应上去，所以用了enumerate
        # for k,v in kwargs.items():
        # params_dict[k] = v
        params_dict.update(kwargs)

        # 缺省值处理，在构造key前放入这个判断即可
        for k,v in params.items():   # params是我们定义的最长的
            if k not in params_dict.keys():   # 如果params的key不在params_dict字典里
                params_dict[k] = v.default   # 就把params的value的默认值加进来

        key = tuple(sorted(params_dict.items()))
        # 判断是否需要缓存

        ret = fn(*args,**kwargs)
        return key,ret
    return wrapper

@mag_cache
def add(x,z,y=6):
    return x + y + z

result = []
result.append(add(4,5))
result.append(add(4,z=5))
result.append(add(4,y=6,z=5))
result.append(add(y=6,z=5,x=4))
result.append(add(4,5,6))
print(result)
输出：
[((('x', 4), ('y', 6), ('z', 5)), 15), ((('x', 4), ('y', 6), ('z', 5)), 15), ((('x', 4), ('y', 6), ('z', 5)), 15), ((('x', 4), ('y', 6), ('z', 5)), 15), ((('x', 4), ('y', 6), ('z', 5)), 15)]
```

使用缓存

```python
# 实现过程：
# 1. 创建一个本地缓存，之后取函数的签名并生成有序字典，把有序字典的key放入一个列表中，再创建一个空字典
# 用来保存传入的参数
# 2. 取传入的位置参数、关键字参数和默认值，都保存到空字典中
# 3. 把空字典排序并生成tuple
# 4. 判断tuple中的值是否在本地的缓存字典中，如果不在就加入到缓存字典中，如果在就返回
import time
from functools import wraps
import inspect

def mag_cache(fn):
    local_cache = {}
    
    @wraps(fn)
    def wrapper(*args,**kwargs):   # 接收各种参数，kwargs普通字典参数无序
        # 参数处理，构建key。
        sig = inspect.signature(fn)   # 取签名
        params = sig.parameters   # 只读有序字典
        
        param_names = [key for key in params.keys()]   # list(params.keys())
        params_dict = {}
        
        # 处理位置参数
        for i,v in enumerate(args):
            k = param_names[i]
            params_dict[k] = v
# 这里可以直接将值赋给params_dict[k]是因为params是有序字典，并且param_names产生于params的keys，
# 从param_names中有顺序地取出值并赋值给k，再按这个k的顺序保存位置参数的值就没有问题了。
		
    	# 处理关键字参数
        # for k,v in kwargs.items():
        # params_dict[k] = v
        params_dict.update(kwargs)
# 这一行代码相当于其上面注释的两行代码

        # 缺省值处理
        for k,v in params.items():
            if k not in params_dict.keys():
                params_dict[k] = v.default

        key = tuple(sorted(params_dict.items()))
        # 判断是否需要缓存
        if key not in local_cache.keys():
            local_cache[key] = fn(*args,**kwargs)
        # 判断key是否在local_cache中，如果没有才缓存，有就执行下面的语句直接返回
        return key,local_cache[key]
    return wrapper

@mag_cache
def add(x,z,y=6):
    time.sleep(3)
    return x + y + z

result = []
result.append(add(4,5))
result.append(add(4,z=5))
result.append(add(4,y=6,z=5))
result.append(add(y=6,z=5,x=4))
result.append(add(4,5,6))
for x in result:
    print(x)
输出：
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
```

增加logger装饰器查看执行时间

```python
import time
from functools import wraps
import inspect
import datetime

def mag_cache(fn):
    local_cache = {}
    
    @wraps(fn)
    def wrapper(*args,**kwargs):   # 接收各种参数，kwargs普通字典参数无序
        # 参数处理，构建key。
        sig = inspect.signature(fn)
        params = sig.parameters   # 只读有序字典
        
        param_names = [key for key in params.keys()]   # list(params.keys())
        params_dict = {}
        
        for i,v in enumerate(args):
            k = param_names[i]
            params_dict[k] = v
            
        # for k,v in kwargs.items():
        # params_dict[k] = v
        params_dict.update(kwargs)

        # 缺省值处理
        for k,v in params.items():
            if k not in params_dict.keys():
                params_dict[k] = v.default

        key = tuple(sorted(params_dict.items()))
        # 这里创建一个tuple，如(('x', 4), ('y', 6), ('z', 5))
        # 判断是否需要缓存
        if key not in local_cache.keys():
            local_cache[key] = fn(*args,**kwargs)
# 第一次判断时，local_cache中应该是空字典，local_cache.keys()的值是dict_keys([])，这时的key一定
# 不在这个local_cache中，所以这里就给local_cache[key]赋值15，也就是local_cache[(('x', 4), ('y', 6), ('z', 5))] = 15
        return key,local_cache[key]
    return wrapper

def logger(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        start = datetime.datetime.now()
        ret = fn(*args,**kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print(fn.__name__,delta)
        return ret
    return wrapper

@logger
@mag_cache
def add(x,z,y=6):
    time.sleep(3)
    return x + y + z

result = []
result.append(add(4,5))
result.append(add(4,z=5))
result.append(add(4,y=6,z=5))
result.append(add(y=6,z=5,x=4))
result.append(add(4,5,6))
for x in result:
    print(x)
输出：
add 3.013066
add 0.000177
add 0.000122
add 0.000113
add 0.00011   # 从这以上的执行的时间，是在logger函数中打印的。下面是最后执行的结果
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
((('x', 4), ('y', 6), ('z', 5)), 15)
```



### 装饰器应用练习

#### 一、实现一个cache装饰器，实现可过期被清除的功能

- 简化设计，函数的形参定义不包含可变位置参数、可变关键词参数和keyword-only参数
- 可以不考虑缓存满了之后的换出问题

```python
# 写代码时，先把主干写出来，把核心算法写出来以后，再一点点往上加功能
# 缓存必须使用key，key必须可hash
from functools import wraps
import time
import inspect
import datetime

def m_cache(duration):
    def _cache(fn):
        local_cache = {}
        
        @wraps(fn)
        def wrapper(*args,**kwargs):
    #         print(args,kwargs)
            expire_keys = []
            for k,(_,ts) in local_cache.items():
# local_cache有没有过期的key。value中我们只关心时间，所以只保留ts，时间前面的东西我们不需要，所
# 以用下划线。因为value是我们在下面 
# local_cache[key] = (ret,datetime.datetime.now().timestamp()) 里保存的元组，所以这里可以这样做
                if datetime.datetime.now().timestamp() - ts > duration:
# 这里判断当前时间减去key生成的时间是否大于5秒，如果大于就把这个key干掉。之后将5秒改为duration，是一
# 个形参，是往进传的参数，用下面的带参装饰器@m_cache(6)往这里传参数为6秒
                    expire_keys.append(k)
# 这里不能直接用local_cache.pop(k)这样的方法把key干掉，因为这是迭代，这样做会影响之前的字典？
            for k in expire_keys:
                local_cache.pop(k)
            



            key_dict = {}   # sorted
            sig = inspect.signature(fn)
            params = sig.parameters  # 有序字典

            param_list = list(params.keys())   # 把有序字典的key放到list中还是有序的



            # 位置参数
            for i,v in enumerate(args):
                print(i,v)
                k = param_list[i]
                key_dict[k] = v


            # 关键字参数
    #         for k,v in kwargs.items():
    #             key_dict[k] = v
            key_dict.update(kwargs)   # 这里是乱序的

            # 缺省值处理
            for k in params.keys():
                if k not in key_dict.keys():
                    key_dict[k] = params[k].default   # 把params的缺省值放到key_dict[k]中

            key = tuple(sorted(key_dict.items()))   # 对二元组进行排序

            if key not in local_cache.keys():
                ret = fn(*args,**kwargs)
                local_cache[key] = (ret,datetime.datetime.now().timestamp())   
# 加一个时间戳到local_cache，加入时间戳是为了知道什么时候key被加入的，以此判断key的过期时间，时间戳是
# 一个flood类型，加括号说明是一个元组，缓存是为了查询的，是不可以变的，所以这里用了tuple而不是List。
# 这里用元组形成key，再用一个元组形成value
            return local_cache[key]
        return wrapper
    return _cache

def logger(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        start = datetime.datetime.now()
        ret = fn(*args,**kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print(delta)
        return ret
    return wrapper

@logger
@m_cache(6)
def add(x,y=5):
    time.sleep(3)
    ret = x + y
    print(ret)
    return ret

print(add(4))
print(add(4,5))
print(add(4,y=5))
print(add(x=4,y=5))
print(add(y=5,x=4))

time.sleep(6)

print(add(4))
print(add(4,5))
print(add(4,y=5))
print(add(x=4,y=5))
print(add(y=5,x=4))

=======================================================================================

# 把上面的代码重新封装一下


from functools import wraps
import time
import inspect
import datetime

def m_cache(duration):   # duration是传入的过期时间
    def _cache(fn):   # fn是传入的add函数
        local_cache = {}
        
        @wraps(fn)
        def wrapper(*args,**kwargs):
    #         print(args,kwargs)
            def clear_expire(cache):
# 这里将下面功能封装成clear_expire函数，之后再调用。因为clear_expire用到了外面的local_cache，所以
# 定义时要有形参cache，调用时往这里传一个参数local_cache
                expire_keys = []   # 到期的key定义为一个列表
                for k,(_,ts) in local_cache.items():
# local_cache有没有过期的key，local_cache中保存的值如：
# {(('x', 4), ('y', 5)): (9, 1577244610.220823)}，key是根据传入的位置参数、关键字参数和默认值生
# 成的字典，value有两个内容，前面的是x+y的结果，后面是当前时间的秒数，我们这里只取key和value中的时间
                    if datetime.datetime.now().timestamp() - ts > duration:
# 在计算机中，时间实际上是用数字表示的。我们把1970年1月1日 00:00:00 UTC+00:00时区的时刻称为epoch time，记为0（1970年以前的时间timestamp为负数），当前时间就是相对于epoch time的秒数，称为timestamp。可见timestamp的值与时区毫无关系，因为timestamp一旦确定，其UTC时间就确定了，转换到任意时区的时间也是完全确定的，这就是为什么计算机存储的当前时间是以timestamp表示的，因为全球各地的计算机在任意时刻的timestamp都是完全相同的（假定时间已校准）。
# 这里是判断当前时间的秒数与存入缓存时的秒数是否大于duration，也就是是否大于传入的过期时间，如果过了，
# 就把这个local_cache中的key加到expire_keys过期列表中，再用下面的循环将这个key从缓存中删除。这个
# cache就是clear_expire的参数，也就是从外部传入的local_cache。
                        expire_keys.append(k)
                for k in expire_keys:
# expire_keys是列表，是不能调用的，所以没有加括号，如果调用会提示不可hash。
                    cache.pop(k)
            clear_expire(local_cache)


            def make_key():
                key_dict = {}   # sorted
                sig = inspect.signature(fn)
                params = sig.parameters  # 有序字典

                param_list = list(params.keys())   # 把有序字典的key放到list中还是有序的



                # 位置参数
                for i,v in enumerate(args):
                    print(i,v)
                    k = param_list[i]
                    key_dict[k] = v


                # 关键字参数
        #         for k,v in kwargs.items():
        #             key_dict[k] = v
                key_dict.update(kwargs)   # 这里是乱序的

                # 缺省值处理
                for k in params.keys():
                    if k not in key_dict.keys():
                        key_dict[k] = params[k].default   
                        # 把params的缺省值放到key_dict[k]中

                return tuple(sorted(key_dict.items()))

            key = make_key()
            
            if key not in local_cache.keys():
                ret = fn(*args,**kwargs)
                local_cache[key] = (ret,datetime.datetime.now().timestamp())   
                # 加一个时间戳到local_cache，也就是当前的秒数
                # 缓存是为了查询的，是不可以变的，所以这里用了tuple而不是List
            return local_cache[key]
        return wrapper
    return _cache

def logger(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        start = datetime.datetime.now()
        ret = fn(*args,**kwargs)
        delta = (datetime.datetime.now() - start).total_seconds()
        print(delta)
        return ret
    return wrapper




@logger
@m_cache(6)
def add(x,y=5):
    time.sleep(3)
    ret = x + y
    print(ret)
    return ret

print(add(4))
print(add(4,5))
print(add(4,y=5))
print(add(x=4,y=5))
print(add(y=5,x=4))

time.sleep(6)

print(add(4))
print(add(4,5))
print(add(4,y=5))
print(add(x=4,y=5))
print(add(y=5,x=4))
```



#### 二、写一个命令分发器

- 程序员可以方便的注册函数到某一个命令，用户输入命令时，路由到注册的函数
- 用户输入用input(">>>")

```python
commands = {}
# 保存命令，不需要有序，就是为了查询的，这是命令和函数存储的地方
# 注册
def reg(name,fn):
    commands[name] = fn

def defaultfunc():
    print("Unkown command")
    
def dispatcher():
    while True:
        cmd = input('>>>')
        if cmd.strip() == 'quit':
            return 
        commands.get(cmd,defaultfunc)()


# 自定义函数，注册
def foo1():
    print('welcom magedu')
    
    
def foo2():
    print('welcom magedu')
     
    
    

reg('mag',foo1)
reg('py',foo2)

=======================================================================================

def cmds_dispatcher():
    commands = {}

    # 注册
    def reg(name):
        def _reg(fn):
            commands[name] = fn
            return fn
        return _reg

    def defaultfunc():
        print("Unkown command")

    def dispatcher():
        while True:
            cmd = input('>>>')
            if cmd.strip() == 'quit':
# strip是字符串的方法，可以去掉前后指定的字符，如果括号中没有内容，就是去掉前后的空格，这里判断如果
# cmd.strip()去掉前后的空格后等于quit，那么就返回None。
                return 
            commands.get(cmd,defaultfunc)()
    return reg, dispatcher   # 返回一个元组
reg,dis = cmds_dispatcher()
# r,d = cmds_dispatcher()   
# 解构元组。但这样写不易懂，所以一般不这样用。调用cmds_dispatcher返回的是reg和dispatcher函数，再将
# reg和dispatcher函数赋值给reg和dispatcher函数，或赋值给上面说的r和d函数，所以这里的reg和
# dispatcher和上面同名的函数不是同一个，下面的@reg和@dispatcher也是新的函数，不是上面的函数
# 这里要将三个函数封装成一个函数，是因为它们是完成一个业务的，注册与查询


# 自定义函数，注册
@reg('mag')
def foo1():
    print('welcom magedu')
    
@reg('py')    
def foo2():
    print('welcom magedu')
     
# 这个函数的意思是先把指定的函数注册进去，也就是上面的 @reg('mag')，之后再调用dispatcher函数，这时会
# 要求输入函数，如果是上面注册过的两个函数，就会显示注册函数应该显示的内容。如果没有注册过，就会显示Unkown command
dis()
# 这里使用的是外面调用cmds_dispatcher函数后重新赋值的dis，调用cmds_dispatcher函数将内部的函数功能
# 释放出来，使用户可以在外层调用内部的函数。正常只可以从内部调用外部的函数。上面的装饰器函数reg也是使用
# 释放出来的内部函数的功能
```



#### 三、实现base64解码

```python
alphabet = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def base64decode(src:bytes):
    ret = bytearray()   # 生成的字节一定是bytearray，可变的
    length = len(src)
#     print(length)
    
    step = 4   # 对齐的，每次取4个
    for offset in range(0,length,step):
        tmp = 0x00
        block = src[offset:offset + step]   # block为保存每四位取出来的字节
#         print(block)
        
        # 开始移位计算
        for i,c in enumerate(reversed(block)):
# 这里用reversed方法把字节逆向处理
            # 替换字符为序号
            index = alphabet.find(c)  # 用find方法的好处是不抛异常
            if index == -1:   # 上面找不到时就是-1
                continue   # 找不到就是0,不用移位相加了
            tmp += index << i*6
# 第一次i是0，所以这里不会移位。因为是从后向前处理，所以第一次处理就是最后的字节，也就是最低的6位，不需要移位。因为是用6位表示一个字节，所以第二次就要向左移6位了，这时的i也正好是1。之后以此类推，分别移两个三个6位。移位之后再与之前的值相加，如第一次是111111，第二次移位后是111111 000000，这两个数相加后是111111 111111，这就是二进制加法
        ret.extend(tmp.to_bytes(3, 'big'))
    return bytes(ret.rstrip(b'\x00'))   # 把最右边的\x00去掉，不可变

# base64的decode
# txt = "TWFu"
# txt = "TWE="
# txt = "TQ=="
txt = "TWFuTWE="
# txt = "TWFuTQ=="
txt = txt.encode()
print(txt)
print(base64decode(txt).decode())

# base64实现
import base64
print(base64.b64decode(txt).decode())
输出：
b'TWFuTWE='
8
b'TWFu'
b'TWE='
ManMa
ManMa

# 改进
# 1. reversed可以不需要
# 2. alphabet.find效率低
from collections import OrderedDict

base_tb1 = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
alphabet = OrderedDict(zip(base_tb1,range(64)))   # 用有序字典记录顺序和查询提升效率
# 查询用字典效率更高。用有序字典是为了看打印的顺序，使用普通字典也可以。
def base64decode(src:bytes):
    ret = bytearray()
    length = len(src)
    
    step = 4   # 对齐的，每次取4次
    for offset in range(0,length,step):
        tmp = 0x00
        block = src[offset:offset + step]
# 以TWFu为例，这里第次取值都会少一个字节，如第一次是TWFu，第二次是TWF，这样是为了下面的block[-i-1]从
# 后向前取一个字节。
        # 开始移位计算
        for i in range(4):
            index = alphabet.get(block[-i-1])
# 查询block中从后向前取出的一段，如：TWFu，第一次取出的就是u。get方法如果不给缺省值时，返回的是None，也就是说，当block中得到的是等号时，因为在base64字典中找不到等号，就会返回None。
            if index is not None:
# 一般取对象的话，只需要写成if None。这里的index有可能为0，因为base64字典中是有0的，所以这里要这样写，是0也可以进来，否则写成if index的话，0就进不来了
                tmp += index << i*6
            # 找不到，不用移位相加了
            
        ret.extend(tmp.to_bytes(3,'big'))
# to_bytes指把数变成bytes   
    return bytes(ret.rstrip(b'\x00'))   # 把最右边的\x00去掉，不可变

# base64的decode
# txt = "TWFu"
# txt = "TWE="
# txt = "TQ=="
txt = "TWFuTWE="
# txt = "TWFuTQ=="
txt = txt.encode()
print(txt)
print(base64decode(txt).decode())

# base64实现
import base64
print(base64.b64decode(txt).decode())
输出：
b'TWFuTWE='
ManMa
ManMa
```



#### 四、完善命令颁发器

- 实现函数可以带任意参数（可变参数除外），解析参数并要求用户输入

```python
# 即解决下面的问题
# 自定义函数
@reg('mag')
def foo1(x,y):
    print('magedu',x,y)
    
@reg('py')
def foo2(a,b=100):
    print('python',a,b)
    
思路：
可以有两种方式
1. 注册的时候，固定死，@ret('py',200,100)，可以认为@ret('py',200,100)和@reg('py',300,100)是不
同的函数，可以用partial函数。
2. 运行时，在输入cmd的时候，逗号分割，获取参数。至于函数的验证，以后实现。一般用户都喜欢使用单纯一个命令
如mag，然后直接显示想要的结果，所以采用第一种方式

from functools import partial
# 自定义函数可以有任意函数，可变参数、keyword-only除外
def command_dispatcher():
    # 构建全局字典
    cmd_tb1 = {}
    
    # 注册函数
    def reg(cmd,*args,**kwargs):
# 这里定义一个带参装饰器，传入三个参数cmd,*args,**kwargs，另外把fn函数代入
        def _reg(fn):
            func = partial(fn,*args,**kwargs)
# 用partial方法把fn函数的两个参数固定
            cmd_tb1[cmd] = func
# 把func函数加入到全局字典中，以备查询
            return func
        return _reg
    
    # 缺省函数
    def default_func():
        print('Unknow command')
        
    # 调度器
    def dispatcher():
        while True:
            cmd = input('Please input cmd >>>')
            # 退出条件
            if cmd.strip() == '':
                return
            cmd_tb1.get(cmd,default_func)()
# 这里我之前差不多，准备接收用户输入的函数，如果可以在字典中查询到就返回相应内容，如果查不到就返回不知道的命令            
    return reg,dispatcher

reg,dispatcher = command_dispatcher()

# 自定义函数
@reg('mag',z=200,y=300,x=100)
def foo1(x,y,z):
    print('magedu',x,y,z)
# 这里用reg装饰器传了cmd名和关键字参数，foo1函数没有定义默认值，所以打印内容就是带参装饰器传入的值    
@reg('py',300,b=400)
def foo2(a,b=100):
    print('python',a,b)
# 这里因为带参装饰器中设置了b的值，所以即使foo2函数中定义了b的值，也会被带参装饰器中的值覆盖，如果带参
# 装饰器中没有定义b的值，就会使用foo2函数中定义的默认值。
    
# 调度循环
dispatcher()

输出：
Please input cmd >>>abc
Unknow command
Please input cmd >>>py
python 300 400
Please input cmd >>>python
Unknow command
Please input cmd >>>

=======================================================================================
functools.partial(func, *args, **keywords)
# partial 一定接受三个参数
func: 需要被扩展的函数，返回的函数其实是一个类 func 的函数
*args: 需要被固定的位置参数
**kwargs: 需要被固定的关键字参数
# 如果在原来的函数 func 中关键字不存在，将会扩展，如果存在，则会覆盖
例1：
def add(*args, **kwargs):
    # 打印位置参数
    for n in args:
        print(n)
    print("-"*20)
    # 打印关键字参数
    for k, v in kwargs.items():
       print('%s:%s' % (k, v))
    # 暂不做返回，只看下参数效果，理解 partial 用法
    
# 普通调用
add(1, 2, 3, v1=10, v2=20)
输出：
1
2
3
--------------------
v1:10
v2:20
    
# partial
add_partial = partial(add, 10, k1=10, k2=20)
add_partial(1, 2, 3, k3=20)
输出：
10
1
2
3
--------------------
k1:10
k2:20
k3:20
    
# 它返回一个偏函数对象，这个对象和 func 一样，可以被调用，同时在调用的时候可以指定位置参数 (args) 和 关键字参数(*kwargs)。如果有更多的位置参数提供调用，它们会被附加到 args 中。如果有额外的关键字参数提供，它们将会扩展并覆盖原有的关键字参数。partial() 是被用作 “冻结” 某些函数的参数或者关键字参数，同时会生成一个带有新标签的对象(即返回一个新的函数)。比如，partial() 可以用于合建一个类似 int() 的函数，同时指定 base 参数为2

>>> from functools import partial
>>> basetwo = partial(int, base=2)
# 这相当于int('10010',base=2)
>>> basetwo.__doc__ = 'Convert base 2 string to an int.'
>>> basetwo('10010')
输出：
Out[1]: 18
    
例2:
def multiply(x, y):
    return x * y
>>> multiply(3, y=2)
6

def double(x, y=2):
    return multiply(x, y)
# 将y的值固定

from functools import partial
double = partial(multiply, y=2)
# partial 接收函数 multiply 作为参数，固定 multiply 的参数 y=2，并返回一个新的函数给 double，这跟
# 我们自己定义 double 函数的效果是一样的。这里固定的是关键字参数，也可以固定位置参数
=======================================================================================
```



