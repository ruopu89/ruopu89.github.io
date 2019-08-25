---
title: logstash基础知识
date: 2019-06-26 14:20:40
tags: logstash
categories: ELK
---

### 配置语法

Logstash 设计了自己的 DSL，包括有区域，注释，数据类型(布尔值，字符串，数值，数组，哈希)，条件判断，字段引用等。



#### 区段(section)

Logstash 用 `{}` 来定义区域。区域内可以包括插件区域定义，你可以在一个区域内定义多个插件。插件区域内则可以定义键值对设置。示例如下：

```shell
input {
    stdin {}
    syslog {}
}
```



#### 数据类型

Logstash 支持少量的数据值类型：

- bool

```shell
debug => true
```

- string

```powershell
host => "hostname"
```

- number

```shell
port => 514
```

- array

```shell
match => ["datetime", "UNIX", "ISO8601"]
```

- hash

```shell
options => {
    key1 => "value1",
    key2 => "value2"
}
```

**注意**：如果你用的版本低于 1.2.0，*哈希*的语法跟*数组*是一样的，像下面这样写：

```shell
match => [ "field1", "pattern1", "field2", "pattern2" ]
```



#### 字段引用(field reference)

字段是 `Logstash::Event` 对象的属性。我们之前提过事件就像一个哈希一样，所以你可以想象字段就像一个键值对。

*小贴士：我们叫它字段，因为 Elasticsearch 里是这么叫的。*

如果你想在 Logstash 配置中使用字段的值，只需要把字段的名字写在中括号 `[]` 里就行了，这就叫**字段引用**。

对于 **嵌套字段**(也就是多维哈希表，或者叫哈希的哈希)，每层的字段名都写在 `[]` 里就可以了。比如，你可以从 geoip 里这样获取 *longitude* 值(是的，这是个笨办法，实际上有单独的字段专门存这个数据的)：

```
[geoip][location][0]
```

*小贴士：logstash 的数组也支持倒序下标，即 [geoip][location][-1] 可以获取数组最后一个元素的值。*

Logstash 还支持变量内插，在字符串里使用字段引用的方法是这样：

```
"the longitude is %{[geoip][location][0]}"
```



#### 条件判断(condition)

Logstash从 1.3.0 版开始支持条件判断和表达式。

表达式支持下面这些操作符：

- equality, etc: ==, !=, <, >, <=, >=
- regexp: =~, !~
- inclusion: in, not in
- boolean: and, or, nand, xor
- unary: !()

通常来说，你都会在表达式里用到字段引用。比如：

```
if "_grokparsefailure" not in [tags] {
} else if [status] !~ /^2\d\d/ and [url] == "/noc.gif" {
} else {
}
```



### 命令行参数

Logstash 提供了一个 shell 脚本叫 `logstash` 方便快速运行。它支持以下参数：

- -e

意即*执行*。我们在 "Hello World" 的时候已经用过这个参数了。事实上你可以不写任何具体配置，直接运行 `bin/logstash -e ''` 达到相同效果。这个参数的默认值是下面这样：

```
input {
    stdin { }
}
output {
    stdout { }
}
```

- --config 或 -f

意即*文件*。真实运用中，我们会写很长的配置，甚至可能超过 shell 所能支持的 1024 个字符长度。所以我们必把配置固化到文件里，然后通过 `bin/logstash -f agent.conf` 这样的形式来运行。

此外，logstash 还提供一个方便我们规划和书写配置的小功能。你可以直接用 `bin/logstash -f /etc/logstash.d/` 来运行。logstash 会自动读取 `/etc/logstash.d/` 目录下所有的文本文件，然后在自己内存里拼接成一个完整的大配置文件，再去执行。

- --configtest 或 -t

意即*测试*。用来测试 Logstash 读取到的配置文件语法是否能正常解析。Logstash 配置语法是用 grammar.treetop 定义的。尤其是使用了上一条提到的读取目录方式的读者，尤其要提前测试。

- --log 或 -l

意即*日志*。Logstash 默认输出日志到标准错误。生产环境下你可以通过 `bin/logstash -l logs/logstash.log` 命令来统一存储日志。

- --filterworkers 或 -w

意即*工作线程*。Logstash 会运行多个线程。你可以用 `bin/logstash -w 5` 这样的方式强制 Logstash 为**过滤**插件运行 5 个线程。

*注意：Logstash目前还不支持输入插件的多线程。而输出插件的多线程需要在配置内部设置，这个命令行参数只是用来设置过滤插件的！*

**提示：Logstash 目前不支持对过滤器线程的监测管理。如果 filterworker 挂掉，Logstash 会处于一个无 filter 的僵死状态。这种情况在使用 filter/ruby 自己写代码时非常需要注意，很容易碰上 NoMethodError: undefined method '\*' for nil:NilClass 错误。需要妥善处理，提前判断。**

- --pluginpath 或 -P

可以写自己的插件，然后用 `bin/logstash --pluginpath /path/to/own/plugins` 加载它们。

- --verbose

输出一定的调试日志。

*小贴士：如果你使用的 Logstash 版本低于 1.3.0，你只能用 bin/logstash -v 来代替。*

- --debug

输出更多的调试日志。

*小贴士：如果你使用的 Logstash 版本低于 1.3.0，你只能用 bin/logstash -vv 来代替。*



### 输入插件(Input)

Logstash 配置一定要有一个 input 和一个 output。



#### 标准输入(Stdin)

##### 配置示例

```shell
vim /etc/logstash/conf.d/system.conf
input {
        stdin {
                add_field => {"key" => "value"}
                codec => "plain"
                tags => ["add"]
                type => "std"
    }

output {
        stdout {
            # 这样写会输出到屏幕
        }
}
```



##### 运行结果

```shell
[root@A5_SW_3552P ~]# /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/system.conf 
WARNING: Could not find logstash.yml which is typically located in $LS_HOME/config or /etc/logstash. You can specify the path using --path.settings. Continuing using the defaults
Could not find log4j2 configuration at path /usr/share/logstash/config/log4j2.properties. Using default config which logs errors to the console
[WARN ] 2019-06-26 16:05:08.173 [LogStash::Runner] multilocal - Ignoring the 'pipelines.yml' file because modules or command line options are specified
[INFO ] 2019-06-26 16:05:08.213 [LogStash::Runner] runner - Starting Logstash {"logstash.version"=>"6.5.4"}
[INFO ] 2019-06-26 16:05:14.564 [Converge PipelineAction::Create<main>] pipeline - Starting pipeline {:pipeline_id=>"main", "pipeline.workers"=>2, "pipeline.batch.size"=>125, "pipeline.batch.delay"=>50}
[INFO ] 2019-06-26 16:05:14.930 [[main]>worker1] stdin - Automatically switching from plain to line codec {:plugin=>"stdin"}
[INFO ] 2019-06-26 16:05:15.043 [Converge PipelineAction::Create<main>] pipeline - Pipeline started successfully {:pipeline_id=>"main", :thread=>"#<Thread:0x55fda7a3 run>"}
The stdin plugin is now waiting for input:
[INFO ] 2019-06-26 16:05:15.171 [Ruby-0-Thread-1: /usr/share/logstash/lib/bootstrap/environment.rb:6] agent - Pipelines running {:count=>1, :running_pipelines=>[:main], :non_running_pipelines=>[]}
[INFO ] 2019-06-26 16:05:15.646 [Api Webserver] agent - Successfully started Logstash API endpoint {:port=>9600}
hello world
{
       "message" => "hello world",
    "@timestamp" => 2019-06-26T08:05:23.027Z,
      "@version" => "1",
          "host" => "A5_SW_3552P",
           "key" => "value",
          "tags" => [
        [0] "add"
    ],
          "type" => "std"
}
```



##### 解释

*type* 和 *tags* 是 logstash 事件中两个特殊的字段。通常来说我们会在*输入区段*中通过 *type* 来标记事件类型 —— 我们肯定是提前能知道这个事件属于什么类型的。而 *tags* 则是在数据处理过程中，由具体的插件来添加或者删除的。

最常见的用法是像下面这样：

```shell
input {
    stdin {
        type => "web"
    }
}
filter {
    if [type] == "web" {
        grok {
            match => ["message", %{COMBINEDAPACHELOG}]
        }
    }
}
output {
    if "_grokparsefailure" in [tags] {
        nagios_nsca {
            nagios_status => "1"
        }
    } else {
        elasticsearch {
        }
    }
}
```



#### 读取文件(File)

​	Logstash 使用一个名叫 *FileWatch* 的 Ruby Gem 库来监听文件变化。这个库支持 glob 展开文件路径，而且会记录一个叫 *.sincedb* 的数据库文件来跟踪被监听的日志文件的当前读取位置。所以，不要担心 logstash 会漏过你的数据。

​	*sincedb 文件中记录了每个被监听的文件的 inode, major number, minor number 和 pos。*



##### 配置示例

```shell
input
    file {
        path => ["/var/log/*.log", "/var/log/message"]
        type => "system"
        start_position => "beginning"
    }
}
```



##### 解释

有一些比较有用的配置项，可以用来指定 *FileWatch* 库的行为：

- discover_interval

logstash 每隔多久去检查一次被监听的 `path` 下是否有新文件。默认值是 15 秒。

- exclude

不想被监听的文件可以排除出去，这里跟 `path` 一样支持 glob 展开。

- sincedb_path

如果你不想用默认的 `$HOME/.sincedb`(Windows 平台上在 `C:\Windows\System32\config\systemprofile\.sincedb`)，可以通过这个配置定义 sincedb 文件到其他位置。

- sincedb_write_interval

logstash 每隔多久写一次 sincedb 文件，默认是 15 秒。

- stat_interval

logstash 每隔多久检查一次被监听文件状态（是否有更新），默认是 1 秒。

- start_position

logstash 从什么位置开始读取文件数据，默认是结束位置，也就是说 logstash 进程会以类似 `tail -F` 的形式运行。如果你是要导入原有数据，把这个设定改成 "beginning"，logstash 进程就从头开始读取，有点类似 `cat`，但是读到最后一行不会终止，而是继续变成 `tail -F`。



##### 注意

1. 通常你要导入原有数据进 Elasticsearch 的话，你还需要 [filter/date](https://doc.yonyoucloud.com/doc/logstash-best-practice-cn/filter/date.html) 插件来修改默认的"@timestamp" 字段值。
2. *FileWatch* 只支持文件的**绝对路径**，而且会不自动递归目录。所以有需要的话，请用数组方式写明具体哪些文件。
3. *LogStash::Inputs::File* 只是在进程运行的注册阶段初始化一个 *FileWatch* 对象。所以它不能支持类似 fluentd 那样的 `path => "/path/to/%{+yyyy/MM/dd/hh}.log"` 写法。达到相同目的，你只能写成 `path => "/path/to/*/*/*/*.log"`。
4. `start_position` 仅在该文件从未被监听过的时候起作用。如果 sincedb 文件中已经有这个文件的 inode 记录了，那么 logstash 依然会从记录过的 pos 开始读取数据。所以重复测试的时候每回需要删除 sincedb 文件。使用locate查询，文件路径在/var/lib/logstash/plugins/inputs/file/目录下，也有一说在用户家目录中，但没有找到。
5. 因为 windows 平台上没有 inode 的概念，Logstash 某些版本在 windows 平台上监听文件不是很靠谱。windows 平台上，推荐考虑使用 nxlog 作为收集端。