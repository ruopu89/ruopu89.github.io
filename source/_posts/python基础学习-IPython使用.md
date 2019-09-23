---
title: python基础学习-IPython使用
date: 2019-09-18 16:26:07
tags: python-IPython使用
categories: python
---

### 帮助

- ?
  - IPython的概述和简介
- help(name)
  - 查询指定名称的帮助
- obj?
  - 列出obj对象的详细信息
- obj??
  - 列出更加详细的信息



### 特殊变量

- _表示前一次输出
- __ 表示倒数第二次输出
- ___ 表示倒数第三次输出
- _dh 目录历史
- _oh 输出历史



### shell命令

- !command 执行shell命令
  - !ls -l
  - !touch test.txt
  - files = !ls -l | grep py



### 魔术方法

- 使用%百分号开头的,IPython内置的特殊方法

  - %magic 格式

    - % 开头是line magic

    - %% 开头是 cell magic,notebook的cell
  - %alias 定义一个系统命令的别名

      - alias ll ls -l
  - %timeit statement
      - -n 一个循环loop执行语句多少次
      - -r 循环执行多少次loop,取最好的结果

  - %%timeit setup_code
	code.....

- %cd 改变当前工作目录,cd可以认为是%cd的链接。路径历史在_dh中查看
- %pwd、pwd 显示当前工作目录
- %ls 、ls 返回文件列表
- 注意:%pwd这种是魔术方法,是IPython的内部实现,和操作系统无关。而!pwd 就要依赖当前操
  作系统的shell提供的命令执行,默认windows不支持pwd命令
- %%js、%%javascript 在cell中运行js脚本
  %%js
  alert('a' + 1)



### 举例

```python
方法1
def fac1(limit):
	lst = [2, 3]
	for i in range(5, limit, 2):
		for j in range(3, int(i**0.5)+1, 2):
			if i % j == 0:
				break
			else:
				lst.append(i)
	return lst

方法2
def fac2(limit):
	lst = [2, 3]
	for i in range(5, limit, 2):
		flag = False
		up = int(i**0.5) # 这一句是关键
		for j in lst:
			if i % j == 0:
				#flag = False
				break
			if j > up:
				flag = True
				break
		if flag:
			lst.append(i)
	return lst
```

