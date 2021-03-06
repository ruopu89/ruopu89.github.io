---
title: python基础学习-bytes和bytearray
date: 2019-09-18 17:09:50
tags: python字符串bytes和bytearray
categories: python
---

### bytes、bytearray

- Python3引入两个新类型
  - bytes
    - 不可变字节序列
  - bytearray
    - 字节数组
    - 可变

- 字符串与bytes
  - 字符串是字符组成的有序序列，字符可以使用编码来理解
  - bytes是字节组成的有序的不可变序列
  - bytearray是字节组成的有序的可变序列
- 编码与解码
  - 字符串按照不同的字符集编码encode返回字节序列bytes
    - encode(encoding="utf-8",errors="strict") -> str
  - 字节序列按照不同的字符集解码decode返回字符串
    - bytes.decode(encoding="utf-8",errors="strict") -> str
    - bytearray.decode(encoding="utf-8",errors="strict") -> str



### ASCII

- ASCII(American Standard Code for Infomation 美国信息交换标准代码)是基于拉丁字母的一套单字节编码系统



### bytes定义

- 定义
  - bytes() 空bytes
  - bytes(int) 指定字节的bytes，被0填充
  - bytes(iterable_of_ints) -> bytes[0,255]的int组成的可迭代对象
  - bytes(string,encoding[,errors]) -> bytes等价于string.encode()
  - bytes(bytes_of_buffer) -> immutable copy of bytes_of_buffer 从一个字节序列或者buffer复制出一个新的不可变的bytes对象
  - 使用b前缀定义
    - 只允许基本ASCII使用字符形式b'abc9'
    - 使用16进制表示b"\x41\x61"



### bytes操作

- 和str类型类似，都是不可变类型，所以方法很多都一样。只不过bytes的方法，输入是bytes，输出是bytes

```python
b'abcdef'.replace(b'f',b'k')
b'abc'.find(b'b')
```

- 类方法 bytes.fromhex(string)
  - string必须是2个字符的16进制的形式，'6162 6a 6b'，空格将被忽略
  - 类方法就是类型的方法，另外还有对象方法

```python
bytes.fromhex('6162 09 6a 6b00')
```

- hex()
  - 返回16进制表示的字符串

```python
'abc'.encode().hex()
```

- 索引

```python
b'abcdef'[2]
# 返回该字节对应的数，int类型
```



### bytearray定义

- 定义
  - bytearray() 空bytearray
  - bytearray(int) 指定字节的bytearray，被0填充
  - bytearray(iterable_of_ints) -> bytearray [0,255]的int组成的可迭代对象
  - bytearray(string, encoding[, errors]) -> bytearray 近似string.encode()，不过返回可变对象
  - bytearray(bytes_or_buffer) 从一个字节序列或者buffer复制出一个新的可变的bytearray对象
  - 注意：b前缀定义的类型是bytes类型



### bytearray操作

- 和bytes类型的方法相同

```python
bytearray(b'abcdef').replace(b'f',b'k')
bytearray(b'abc').find(b'b')
```

- 类方法 bytearray.fromhex(string)
  - string必须是2个字符的16进制的形式,'6162 6a 6b',空格将被忽略

```python
bytearray.fromhex('6162 09 6a 6b00')
```

- hex()
  - 返回16进制表示的字符串

```python
bytearray('abc'.encode()).hex()
```

- 索引

```python
bytearray(b'abcdef')[2] 
# 返回该字节对应的数，int类型
```



### bytearray操作

- append(int) 尾部追加一个元素
- insert(index, int) 在指定索引位置插入元素
- extend(iterable_of_ints) 将一个可迭代的整数集合追加到当前bytearray
- pop(index=-1) 从指定索引上移除元素,默认从尾部移除
- remove(value) 找到第一个value移除,找不到抛ValueError异常
- 注意:上述方法若需要使用int类型,值在[0, 255]
- clear() 清空bytearray
- reverse() 翻转bytearray,就地修改

```python
b = bytearray()
b.append(97)
b.append(99)
b.insert(1,98)
b.extend([65,66,67])
b.remove(66)
b.pop()
b.reverse()
b.clear()
```

