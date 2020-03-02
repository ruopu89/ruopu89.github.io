---
title: jq命令使用
date: 2020-01-15 12:39:20
tags: 命令使用
categories: 基础
---



### 命令使用案例

- 基本使用

```shell
cat abc.json|jq .
# 不要少了最后的点，这是用cat打开一个json文件，再传给jq命令，输出一个更好的格式
```



- 获取某个key的值

```shell
cat abc.json|jq '.children'
# 取出json文件中的children字段下的内容

cat abc.json|jq '.children|.[].metadata_public|.channelID'
# 可以使用管道符取出多个字段，但要注意字段在json文件中是否是在[]中的，如果是，要加上.[]

cat abc.json|jq '.children|.[].metadata_public|.channelID + "," + .channelName'
# 还可以使用加号拼接字段，并且如果再次取相同位置的字段，可以直接写字段的名称

cat abc.json|jq '.children|.[].metadata_public|.channelID + "," + .[].channelName'
# 不要这样使用，因为再次取值时，使用了.[]，这会造成第一个字段与第二个字段的笛卡尔乘积

cat abc.json|jq '.children|.[].metadata_public|.channelID + "," + .channelName？'
# ? 规则适合所有正确的 filter，在 filter 最后加上 ? 可以忽略错误信息
```



- keys

```python
cat abc.json|jq keys
# 取出所有key组成数组
```



- .[]

```shell
cat abc.json|jq .[]
# 所有的 value
```



- [.[]]

```shell
cat abc.json|jq [.[]]
# 所有的 value 组成的数组
```



- 索引

```shell
cat abc.json|jq .[1]
# 取第2个字段的值

cat abc.json|jq .[0:2]
# 取第1和2个字段的值
```



- 比如取出数组元素中 name 的值

```shell
echo '[{"name": "foo"},{"name": "bar"},{"name": "foobar"}]' |jq .[].name
"foo"
"bar"
"foobar"
```



- 也可以用下面会提到的管道操作

```shell
echo '[{"name": "foo"},{"name": "bar"},{"name": "foobar"}]' |jq '.[]|.name'
"foo"
"bar"
"foobar"
```



- 结果重新组成数组

```shell
echo '[{"name": "foo"},{"name": "bar"},{"name": "foobar"}]' |jq [.[].name]
[
  "foo",
  "bar",
  "foobar"
]
```



- 使用 `map`创建数组

```shell
echo '[{"name": "foo"},{"name": "bar"},{"name": "foobar"}]' |jq 'map(.name)'
[
  "foo",
  "bar",
  "foobar"
]
```



- `length` 可以获取字符串或数组的长度

```shell
echo '{"url": "mozillazg.com", "name": "mozillazg"}' |jq '.url|length'
13
echo '["mozillazg.com", "mozillazg"]' |jq '.|length'
2
```



- `map(foo)` 可以实现对数组的每一项进行操作，然后合并结果的功能

```shell
echo '["mozillazg.com", "mozillazg"]' | jq 'map(length)'
[
  13,
  9
]
```



- `select(foo)` 可以实现对输入项进行判断，只返回符合条件的项

```shell
echo '["mozillazg.com", "mozillazg"]' | jq 'map(select(.|length > 9))'
[
  "mozillazg.com"
]
```



- 可以使用 `\(foo)` 实现字符串插值功能

```shell
echo '{"url": "mozillazg.com", "name": "mozillazg"}' |jq '"hi \(.name)"'
"hi mozillazg"
# 注意要用双引号包围起来，表示是一个字符串
```



- 使用 `+` 实现字符串拼接

```shell
echo '{"url": "mozillazg.com", "name": "mozillazg"}' |jq '"hi " + .name'
"hi mozillazg"
```



- 可以使用 `if .. then .. elif .. then .. else .. end` 实现条件判断

```shell
echo '[0, 1, 2, 3]' \
| jq 'map(if . == 0 then "zero" elif . == 1 then "one" elif . == 2 then "two" else "many" end)'
[
  "zero",
  "one",
  "two",
  "many"
]
```



- 可以通过 `{}` 和 `[]` 构造新的 object 或 数组

```shell
echo '["mozillazg.com", "mozillazg"]' |jq '{name: .[1]}'
{
  "name": "mozillazg"
}

echo '{"url": "mozillazg.com", "name": "mozillazg"}' |jq '[.name, .url]'
[
  "mozillazg",
  "mozillazg.com"
]

echo '{"name": "mozillazg", "ages": [1, 2]}' | jq '{name, age: .ages[]}'
{
  "name": "mozillazg",
  "age": 1
}
{
  "name": "mozillazg",
  "age": 2
}
```



- join

```shell
echo '["mozillazg.com", "mozillazg"]' | jq '.|join(" | ")'
"mozillazg.com | mozillazg"
```



- 字符串split

```shell
echo '"mozillazg.com | mozillazg"' |jq 'split(" | ")'
[
  "mozillazg.com",
  "mozillazg"
]
```



