---
title: python基础练习-functools
date: 2019-11-27 17:53:16
tags: python练习
categories: python
---

### 装饰器应用练习

- 一、实现一个cache装饰器，实现可过期被清除的功能
  - 简化设计，函数的形参定义不包含可变位置参数、可变关键词参数和keyword-only参数
  - 可以不考虑缓存满了之后的换出问题

```python
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
                    # local_cache有没有过期的keyabs
                if datetime.datetime.now().timestamp() - ts > duration:
                    expire_keys.append(k)
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
                local_cache[key] = (ret,datetime.datetime.now().timestamp())   # 加一个时间戳到local_cache
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

=======================================================================================

# 把上面的代码重新封装一下


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
            def clear_expire(cache):
                expire_keys = []
                for k,(_,ts) in local_cache.items():
                    # local_cache有没有过期的keyabs
                    if datetime.datetime.now().timestamp() - ts > duration:
                        expire_keys.append(k)
                for k in expire_keys:
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
                        key_dict[k] = params[k].default   # 把params的缺省值放到key_dict[k]中

                return tuple(sorted(key_dict.items()))

            key = make_key()
            
            if key not in local_cache.keys():
                ret = fn(*args,**kwargs)
                local_cache[key] = (ret,datetime.datetime.now().timestamp())   # 加一个时间戳到local_cache
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



- 二、写一个命令分发器
  - 程序员可以方便的注册函数到某一个命令，用户输入命令时，路由到注册的函数
  - 用户输入用input(">>>")

```python
commands = {}

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
                return 
            commands.get(cmd,defaultfunc)()
    return reg, dispatcher   # 返回一个元组
reg,dispatcher = cmds_dispatcher()
# r,d = cmds_dispatcher()   # 解构元组。但这样写不易懂，所以一般不这样用
# 这里要将三个函数封装成一个函数，是因为它们是完成一个业务的，注册与查询


# 自定义函数，注册
@reg('mag')
def foo1():
    print('welcom magedu')
    
@reg('py')    
def foo2():
    print('welcom magedu')
     
    
dispatcher()
```

