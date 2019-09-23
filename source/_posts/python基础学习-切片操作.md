---
title: python基础学习-切片操作
date: 2019-09-18 16:25:48
tags: python切片操作
categories: python
---

### 线性结构

- 线性结构
  - 可迭代 for ... in
  - len()可以获取长度
  - 通过下标可以访问
  - 可以切片
- 学过的线性结构
  - 列表、元组、字符串、bytes、bytearray



### 切片

- 切片
  - 通过索引区间访问线性结构的一段数据
  - sequence[start:stop] 表示返回[start,stop]区间的子序列
  - 支持负索引
  - start为0，可以省略
  - stop为末尾，可以省略
  - 超过上界（右边界），就取到末尾；超过下界（左边界），取到开头
  - start一定要在stop的左边
  - [:]表示从头至尾，全部元素被取出，等效于copy()方法

- 举例

```python
'www.magedu.com'[4:10]
输出：'magedu'

'www.magedu.com'[:10]
输出：'www.magedu'

'www.magedu.com'[4:]
输出：'magedu.com'

'www.magedu.com'[:]
输出：'www.magedu.com'

'www.magedu.com'[:-1]
输出：'www.magedu.co'

'www.magedu.com'[4:-4]
输出：'magedu'

'www.magedu.com'[4:50]
输出：'magedu.com'

b'www.magedu.com'[-40:10]
输出：b'www.magedu'

bytearray(b'www.magedu.com')[-4:10]
输出：bytearray(b'')

tuple('www.magedu.com')[-10:10]
输出：('m', 'a', 'g', 'e', 'd', 'u')

list('www.magedu.com')[-10:-4]
输出：['m', 'a', 'g', 'e', 'd', 'u']
```



- 步长切片
  - [start:stop:step]
  - step为步长，可以是正、负整数，默认是1
  - step要和start:stop同向，否则返回空序列

- 举例

```python
'www.magedu.com'[4:10:2]
输出：'mgd'

list('www.magedu.com')[4:10:-2]
输出：[]

tuple('www.magedu.com')[-10:-4:2]
输出：('m', 'g', 'd')

b'www.magedu.com'[-4:-10:2]
输出：b''

bytearray(b'www.magedu.com')[-4:-10:-2]
输出：bytearray(b'.dg')
```



