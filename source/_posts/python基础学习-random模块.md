---
title: python基础学习-random模块
date: 2019-10-31 08:28:39
tags: python-random
categories: python
---

- `random.choice(seq)`

  从非空序列 *seq* 返回一个随机元素。 如果 *seq* 为空，则引发 [`IndexError`](https://docs.python.org/zh-cn/3/library/exceptions.html#IndexError)。

- `random.shuffle(x[, random])`

  将序列 *x* 随机打乱位置。可选参数 *random* 是一个0参数函数，在 [0.0, 1.0) 中返回随机浮点数；默认情况下，这是函数 [`random()`](https://docs.python.org/zh-cn/3/library/random.html#random.random) 。要改变一个不可变的序列并返回一个新的打乱列表，请使用``sample(x, k=len(x))``。请注意，即使对于小的 `len(x)`，*x* 的排列总数也可以快速增长，大于大多数随机数生成器的周期。 这意味着长序列的大多数排列永远不会产生。 例如，长度为2080的序列是可以在 Mersenne Twister 随机数生成器的周期内拟合的最大序列。

- `random.random()`

  返回 [0.0, 1.0) 范围内的下一个随机浮点数。

- `random.sample(population, k)`

  返回从总体序列或集合中选择的唯一元素的 *k* 长度列表。 用于无重复的随机抽样。返回包含来自总体的元素的新列表，同时保持原始总体不变。 结果列表按选择顺序排列，因此所有子切片也将是有效的随机样本。 这允许抽奖获奖者（样本）被划分为大奖和第二名获胜者（子切片）。总体成员不必是 [hashable](https://docs.python.org/zh-cn/3/glossary.html#term-hashable) 或 unique 。 如果总体包含重复，则每次出现都是样本中可能的选择。要从一系列整数中选择样本，请使用 [`range()`](https://docs.python.org/zh-cn/3/library/stdtypes.html#range) 对象作为参数。 对于从大量人群中采样，这种方法特别快速且节省空间：`sample(range(10000000), k=60)` 。如果样本大小大于总体大小，则引发 [`ValueError`](https://docs.python.org/zh-cn/3/library/exceptions.html#ValueError) 。

- `random.uniform(a, b)`

  返回一个随机浮点数 *N* ，当 `a <= b` 时 `a <= N <= b` ，当 `b < a` 时 `b <= N <= a` 。取决于等式 `a + (b-a) * random()` 中的浮点舍入，终点 `b` 可以包括或不包括在该范围内。

- `random.randrange(stop)`

- `random.randrange(start, stop[, step])`

  从 `range(start, stop, step)` 返回一个随机选择的元素。 这相当于 `choice(range(start, stop, step))` ，但实际上并没有构建一个 range 对象。位置参数模式匹配 [`range()`](https://docs.python.org/zh-cn/3/library/stdtypes.html#range) 。不应使用关键字参数，因为该函数可能以意外的方式使用它们。在 3.2 版更改: [`randrange()`](https://docs.python.org/zh-cn/3/library/random.html#random.randrange) 在生成均匀分布的值方面更为复杂。 以前它使用了像``int(random()*n)``这样的形式，它可以产生稍微不均匀的分布。

- `random.randint(a, b)`

  返回随机整数 *N* 满足 `a <= N <= b`。相当于 `randrange(a, b+1)`。

