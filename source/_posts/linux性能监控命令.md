---
title: linux性能监控命令
date: 2019-01-15 17:08:59
tags: 性能监控
categories: 基础
---

### CPU查看

```shell
[root@test ~]# cat /proc/cpuinfo |grep "physical id"|sort|uniq|wc -l
1
# 查看物理cpu个数
[root@test ~]# cat /proc/cpuinfo |grep "cpu cores"|wc -l                       
2
# 查看每个物理cpu中的核心数
[root@test ~]# cat /proc/cpuinfo |grep "processor"|wc -l             
2
# 逻辑cpu的个数。物理cpu个数*核数=逻辑cpu个数（不支持超线程技术的情况下）
[root@test ~]# lscpu
# 此命令也可查询上述信息
```



### 内存查看

```shell
[root@test ~]# free -h
              total        used        free      shared  buff/cache   available
Mem:           976M        127M        510M         55M        338M        625M
Swap:          2.0G          0B        2.0G
# total：内存总数
# used：已经使用的内存数
# free：空闲内存数
# shared：多个进程共享的内存总额
# - buffers/cache：(已用)的内存数，即used-buffers-cached(CentOS6)
# + buffers/cache：(可用)的内存数，即free+buffers+cached(CentOS6)
# Buffer Cache用于针对磁盘块的读写；
# Page Cache用于针对文件inode的读写，这些Cache能有效地缩短I/O系统调用的时间。
# 对操作系统来说free/used是系统可用/占用的内存；
# 对应用程序来说-/+ buffers/cache是可用/占用内存,因为buffers/cache很快就会被使用。
# 经验公式：
# 应用程序可用内存/系统物理内存>70%，表示系统内存资源非常充足，不影响系统性能;
# 应用程序可用内存/系统物理内存<20%，表示系统内存资源紧缺，需要增加系统内存;
# 20%<应用程序可用内存/系统物理内存<70%，表示系统内存资源基本能满足应用需求，暂时不影响系统性能
```



### 磁盘查看

```shell
[root@test ~]# fdisk -l
# 查看硬盘及分区信息
[root@test ~]# df -h
# 查看文件系统的磁盘空间占用情况

[root@test ~]# du -sh /etc
35M     /etc
# 查看linux系统中某目录的大小
```



### 其他参数

```shell
[root@test ~]# lsmod
# 查看系统已载入的相关模块
[root@test ~]# lspci
# 查看pci设置
[root@test ~]# uname -a
Linux test 3.10.0-693.el7.x86_64 #1 SMP Tue Aug 22 21:09:27 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
# 查看内核版本号等信息，也可以使用-r选项，只显示内核信息
[root@test ~]# file /lib/systemd/systemd
# 查看系统是32位还是64位的
[root@test ~]# cat /etc/redhat-release 
CentOS Linux release 7.4.1708 (Core)
# 查看发行版
```



### uptime命令

```shell
[root@test ~]# uptime 
 21:14:43 up 1 min,  1 user,  load average: 0.05, 0.03, 0.01
 # load average三值大小一般不能大于系统CPU的个数。系统有8个CPU,如load average三值长期大于8，说明CPU很繁忙，负载很高，可能会影响系统性能。如load average输出值小于CPU个数，则表示CPU有空闲时间片，比如本例中的输出，CPU是非常空闲的
```



### PS命令

```shell
用途
显示进程的状态。

语法
ps [options] [--help]

参数
-A 列出所有的行程
-w 显示加宽可以显示较多的资讯
au 显示较详细的资讯
aux 显示所有包含其他使用者的行程，也可使用-ef参数

* au(x) 输出格式 :
USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
USER: 进程拥有者
PID: pid
%CPU: 占用的 CPU 使用率
%MEM: 占用的内存使用率
VSZ: 占用的虚拟内存大小
RSS: 占用的内存大小
TTY: 终端的次要装置号码 (minor device number of tty)
STAT: 此进程的状态:
D: 不可中断的
R: 正在执行中
S: 静止状态
T: 暂停执行
Z: 不存在但暂时无法消除
W: 没有足够的内存分页可分配
<: 高优先级的进程
N: 低优先级的进程
L: 有内存分页分配并锁在内存内 (实时系统或A I/O)
START: 进程开始时间
TIME: 执行的时间
COMMAND:所执行的指令

例
[root@test ~]# ps -A
   PID TTY          TIME CMD
     1 ?        00:00:02 systemd
     2 ?        00:00:00 kthreadd
     3 ?        00:00:00 ksoftirqd/0
# 显示进程信息

[root@test ~]# ps -u root
   PID TTY          TIME CMD
     1 ?        00:00:02 systemd
     2 ?        00:00:00 kthreadd
     3 ?        00:00:00 ksoftirqd/0
# 显示root用户的进程信息

[root@test ~]# ps -ef
UID         PID   PPID  C STIME TTY          TIME CMD
root          1      0  0 10:02 ?        00:00:02 /usr/lib/systemd/systemd --switched-root --s
root          2      0  0 10:02 ?        00:00:00 [kthreadd]
root          3      2  0 10:02 ?        00:00:00 [ksoftirqd/0]
# 显示所有命令，连带命令行

[root@test ~]# ps axo user,comm,pid,psr,pcpu
USER     COMMAND            PID PSR %CPU
root     systemd              1   1  0.0
root     kthreadd             2   0  0.0
root     ksoftirqd/0          3   0  0.0
# 这个命令是查看进程的名称、PID以及CPU的占用率。psr表示绑定内核线程的处理器（如果有）的逻辑处理器号。 对一个进程来说，如果它的线程全都绑定到同一处理器上，那么显示该字段。pcpu表示CPU的占用率。comm表示进程名称。pid表示进程的ID号
```



### top命令

```shell
用途
用于实时显示 process 的动态。

语法
top [-] [d delay] [c] [S] [s] [i] [n] [b]

参数
d : 改变显示的更新速度，或在交互式指令列( interactive command)按 s
c : 切换显示模式，共有两种模式，一是只显示执行程序的名称，另一种是显示完整的路径与名称
S : 累积模式，会将己完成或消失的子行程 ( dead child process ) 的 CPU time 累积起来
s : 安全模式，将交互式指令取消, 避免潜在的危机
i : 不显示任何闲置 (idle) 或无用 (zombie) 的进程
n : 更新的次数，完成后将会退出 top
b : 批次模式，搭配 "n" 参数一起使用，可以用来将 top 的结果输出到文件内

例
[root@test ~]# top
# 显示进程信息
top - 17:44:23 up  7:42,  4 users,  load average: 0.02, 0.02, 0.05
Tasks: 110 total,   1 running, 109 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  0.5 sy,  0.0 ni, 99.3 id,  0.0 wa,  0.0 hi,  0.2 si,  0.0 st
KiB Mem :   999720 total,   522516 free,   131076 used,   346128 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.   640836 avail Mem 

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                 
   893 root      20   0  549.2m  18.2m   5.7m S   0.3  1.9   0:03.52 /usr/bin/python -Es /us+
   
* 统计信息区
前五行是系统整体的统计信息。第一行是任务队列信息，同 uptime 命令的执行结果。其内容如下：
01:06:48：当前时间
up 1:22：系统运行时间，格式为时:分
1 user：当前登录用户数
load average: 0.06, 0.60, 0.48：系统负载，即任务队列的平均长度。三个数值分别为 1分钟、5分钟、15分钟前到现在的平均值。
第二、三行为进程和CPU的信息。当有多个CPU时，这些内容可能会超过两行。内容如下：
Tasks: 29 total：进程总数
1 running：正在运行的进程数
28 sleeping：睡眠的进程数
0 stopped：停止的进程数
0 zombie：僵尸进程数
Cpu(s): 0.3% us：用户空间占用CPU百分比
1.0% sy： 内核空间占用CPU百分比
0.0% ni：用户进程空间内改变过优先级的进程占用CPU百分比
98.7% id：空闲CPU百分比
0.0% wa：等待输入输出的CPU时间百分比
0.0% hi
0.0% si
最后两行为内存信息。内容如下：
Mem: 191272k total：物理内存总量
173656k used：使用的物理内存总量
17616k free：空闲内存总量
22052k buffers：用作内核缓存的内存量
Swap: 192772k total：交换区总量
0k used：使用的交换区总量
192772k free：空闲交换区总量
123988k cached：缓冲的交换区总量。
# 内存中的内容被换出到交换区，而后又被换入到内存，但使用过的交换区尚未被覆盖，该数值即为这些内容已存在于内存中的交换区的大小。相应的内存再次被换出时可不必再对交换区写入。

* 进程信息区
统计信息区域的下方显示了各个进程的详细信息。
PID：进程id
PPID：父进程id
RUSER Real user name
UID：进程所有者的用户id
USER：进程所有者的用户名
GROUP：进程所有者的组名
TTY：启动进程的终端名。不是从终端启动的进程则显示为 ?
PR：优先级
NI：nice值。负值表示高优先级，正值表示低优先级
P：最后使用的CPU，仅在多CPU环境下有意义
%CPU：上次更新到现在的CPU时间占用百分比
TIME：进程使用的CPU时间总计，单位秒
TIME+：进程使用的CPU时间总计，单位1/100秒
%MEM：进程使用的物理内存百分比
VIRT：进程使用的虚拟内存总量，单位kb。VIRT=SWAP+RES
SWAP：进程使用的虚拟内存中，被换出的大小，单位kb。
RES：进程使用的、未被换出的物理内存大小，单位kb。RES=CODE+DATA
CODE：可执行代码占用的物理内存大小，单位kb
DATA：可执行代码以外的部分(数据段+栈)占用的物理内存大小，单位kb
SHR：共享内存大小，单位kb
nFLT：页面错误次数
nDRT：最后一次写入到现在，被修改过的页面数。
S：进程状态。
    D=不可中断的睡眠状态
    R=运行
    S=睡眠
    T=跟踪/停止
    Z=僵尸进程
COMMAND：命令名/命令行
WCHAN：若该进程在睡眠，则显示睡眠中的系统函数名
Flags：任务标志

* 更改显示内容
通过 f 键可以选择显示的内容。按 f 键之后会显示列的列表，按 a-z 即可显示或隐藏对应的列，最后按回车键确定。
按 o 键可以改变列的显示顺序。按小写的 a-z 可以将相应的列向右移动，而大写的 A-Z 可以将相应的列向左移动。最后按回车键确定。
按大写的 F 或 O 键，然后按 a-z 可以将进程按照相应的列进行排序。而大写的 R 键可以将当前的排序倒转。

* 交互命令
h或者?：显示帮助画面，给出一些简短的命令总结说明。
k：终止一个进程。系统将提示用户输入需要终止的进程PID，以及需要发送给该进程什么样的信号。一般的终止进程可以使用15信号；如果不能正常结束那就使用信号9强制结束该进程。默认值是信号15。在安全模式中此命令被屏蔽。
i：忽略闲置和僵死进程。这是一个开关式命令。
q：退出程序。
r ：重新安排一个进程的优先级别。系统提示用户输入需要改变的进程PID以及需要设置的进程优先级值。输入一个正值将使优先级降低，反之则可以使该进程拥有更高的优先权。默认值是10。
S：切换到累计模式。
s：改变两次刷新之间的延迟时间。系统将提示用户输入新的时间，单位为s。如果有小数，就换算成m s。输入0值则系统将不断刷新，默认值是5 s。需要注意的是如果设置太小的时间，很可能会引起不断刷新，从而根本来不及看清显示的情况，而且系统负载也会大大增加。
f或者F：从当前显示中添加或者删除项目。
o或者O：改变显示项目的顺序。
l：切换显示平均负载和启动时间信息。
m：切换显示内存信息。
t：切换显示进程和CPU状态信息。
c：切换显示命令名称和完整命令行。
M：根据驻留内存大小进行排序。
P：根据CPU使用百分比大小进行排序。
T：根据时间/累计时间进行排序。
W：将当前设置写入~/.toprc文件中。
1：查看CPU数量

[root@test ~]# top -c
# 显示完整命令

[root@test ~]# top -b
# 以批处理模式显示程序信息

[root@test ~]# top -S
# 以累积模式显示程序信息

[root@test ~]# top -n 2
# 设置信息更新次数，这里会更新两次后终止更新显示

[root@test ~]# top -d 3
# 设置信息更新时间，这条命令更新周期为3秒

[root@test ~]# top -p 1
# 显示指定的进程信息
```



### iostat命令

```shell
用法：iostat [ 选项 ] [ <时间间隔> [ <次数> ]]
常用选项说明：
-c：只显示系统CPU统计信息，即单独输出avg-cpu结果，不包括device结果
-d：单独输出Device结果，不包括cpu结果
-k/-m：输出结果以kB/mB为单位，而不是以扇区数为单位
-x：输出更详细的io设备统计信息
interval/count：每次输出间隔时间，count表示输出次数，不带count表示循环输出
# 使用此命令需要安装sysstat包

例
[root@test ~]# iostat
# 从系统开机到当前执行时刻的统计信息
# avg-cpu: 总体cpu使用情况统计信息，对于多核cpu，这里为所有cpu的平均值。重点关注iowait值，表示CPU用于等待io请求的完成时间。
# Device：各磁盘设备的IO统计信息。各列含义如下：
# Device：以sdX形式显示的设备名称
# tps： 每秒进程下发的IO读、写请求数量
# KB_read/s：每秒从驱动器读入的数据量，单位为K。
# KB_wrtn/s：每秒从驱动器写入的数据量，单位为K。
# KB_read：读入数据总量，单位为K。
# KB_wrtn：写入数据总量，单位为K。
#  重点关注参数：
# iowait% 表示CPU等待IO时间占整个CPU周期的百分比，如果iowait值超过50%，或者明显大于%system、%user以及%idle，表示IO可能存在问题。
# avgqu-sz 表示磁盘IO队列长度，即IO等待个数。
# await 表示每次IO请求等待时间，包括等待时间和处理时间
# svctm 表示每次IO请求处理的时间
# %util 表示磁盘忙碌情况，一般该值超过80%表示该磁盘可能处于繁忙状态。

[root@test ~]# ll /dev/centos/
total 0
lrwxrwxrwx 1 root root 7 Jan 16 21:13 root -> ../dm-0
lrwxrwxrwx 1 root root 7 Jan 16 21:13 swap -> ../dm-1
# 可以使用此命令查看dm-*对应的分区名称

[root@test ~]# iostat -x -k -d 1 2
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

Device:         rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sda               0.00     0.02    0.62    0.12    12.85     1.85    40.04     0.00    0.32    0.28    0.55   0.16   0.01
dm-0              0.00     0.00    0.34    0.13    11.44     1.58    55.41     0.00    0.52    0.46    0.65   0.21   0.01
dm-1              0.00     0.00    0.01    0.00     0.30     0.00    47.40     0.00    0.13    0.13    0.00   0.06   0.00
# 每隔1秒输出磁盘IO的详细信息，总共采样2次
# rrqm/s：每秒对该设备的读请求被合并次数，文件系统会对读取同块(block)的请求进行合并
# wrqm/s：每秒对该设备的写请求被合并次数
# r/s：每秒完成的读次数
# w/s：每秒完成的写次数
# rkB/s：每秒读数据量(kB为单位)
# wkB/s：每秒写数据量(kB为单位)
# avgrq-sz：平均每次IO操作的数据量(扇区数为单位)
# avgqu-sz：平均等待处理的IO请求队列长度
# await：平均每次IO请求等待时间(包括等待时间和处理时间，毫秒为单位)
# svctm：平均每次IO请求的处理时间(毫秒为单位)
# %util：采用周期内用于IO操作的时间比率，即IO队列非空的时间比率

[root@test ~]# iostat -x 1 5
# 查看硬盘的I/O性能。每隔一秒显示一次，显示5次。如果%util接近100%,说明产生的I/O请求太多，I/O系统已经满负荷，该磁盘可能存在瓶颈。如果idle小于70%，I/O的压力就比较大了，说明读取进程中有较多的wait。


```



### vmstat命令

```shell
[root@test ~]# vmstat 2 2
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 766596   2108 116392    0    0   334    36  144  191  0  1 98  0  0
 0  0      0 766596   2108 116392    0    0     0     0  180  148  0  0 100  0  0
 # 显示系统各种资源之间相关性能简要信息，主要看CPU负载情况。2表示每个两秒采集一次服务器状态，2表示只采集两次。也可以只使用vmstat 2命令，每2秒显示一次，一直监控
# r：表示运行队列(就是说多少个进程真的分配到CPU)，我测试的服务器目前CPU比较空闲，没什么程序在跑，当这个值超过了CPU数目，就会出现CPU瓶颈了。这个也和top的负载有关系，一般负载超过了3就比较高，超过了5就高，超过了10就不正常了，服务器的状态很危险。top的负载类似每秒的运行队列。如果运行队列过大，表示你的CPU很繁忙，一般会造成CPU使用率很高。
# b：表示阻塞的进程,这个不多说，进程阻塞，大家懂的。
# swpd：虚拟内存已使用的大小，如果大于0，表示你的机器物理内存不足了，如果不是程序内存泄露的原因，那么你该升级内存了或者把耗内存的任务迁移到其他机器。
# free：空闲的物理内存的大小，我的机器内存总共8G，剩余3415M。
# buff：Linux/Unix系统是用来存储，目录里面有什么内容，权限等的缓存，我本机大概占用300多M
# cache：cache直接用来记忆我们打开的文件,给文件做缓冲，我本机大概占用300多M(这里是Linux/Unix的聪明之处，把空闲的物理内存的一部分拿来做文件和目录的缓存，是为了提高 程序执行的性能，当程序使用内存时，buffer/cached会很快地被使用。)
# si：每秒从磁盘读入虚拟内存的大小，如果这个值大于0，表示物理内存不够用或者内存泄露了，要查找耗内存进程解决掉。我的机器内存充裕，一切正常。
# so：每秒虚拟内存写入磁盘的大小，如果这个值大于0，同上。
# bi：块设备每秒接收的块数量，这里的块设备是指系统上所有的磁盘和其他块设备，默认块大小是1024byte，我本机上没什么IO操作，所以一直是0，但是我曾在处理拷贝大量数据(2-3T)的机器上看过可以达到140000/s，磁盘写入速度差不多140M每秒
# bo：块设备每秒发送的块数量，例如我们读取文件，bo就要大于0。bi和bo一般都要接近0，不然就是IO过于频繁，需要调整。
# in：每秒CPU的中断次数，包括时间中断
# cs：每秒上下文切换次数，例如我们调用系统函数，就要进行上下文切换，线程的切换，也要进程上下文切换，这个值要越小越好，太大了，要考虑调低线程或者进程的数目,例如在apache和nginx这种web服务器中，我们一般做性能测试时会进行几千并发甚至几万并发的测试，选择web服务器的进程可以由进程或者线程的峰值一直下调，压测，直到cs到一个比较小的值，这个进程和线程数就是比较合适的值了。系统调用也是，每次调用系统函数，我们的代码就会进入内核空间，导致上下文切换，这个是很耗资源，也要尽量避免频繁调用系统函数。上下文切换次数过多表示你的CPU大部分浪费在上下文切换，导致CPU干正经事的时间少了，CPU没有充分利用，是不可取的。
# us：用户CPU时间，我曾经在一个做加密解密很频繁的服务器上，可以看到us接近100,r运行队列达到80(机器在做压力测试，性能表现不佳)。
# sy：系统CPU时间，如果太高，表示系统调用时间长，例如是IO操作频繁。
# id：空闲 CPU时间，一般来说，id + us + sy = 100,一般我认为id是空闲CPU使用率，us是用户CPU使用率，sy是系统CPU使用率。
# si、so的值长期不为0，表示系统内存不足。需增加系统内存。
```



### sar命令

```shell
 sar（System ActivityReporter系统活动情况报告）是目前Linux上最为全面的系统性能分析工具之一，可以从多方面对系统的活动进行报告，包括：文件的读写情况、系统调用的使用情况、磁盘I/O、CPU效率、内存使用状况、进程活动及IPC有关的活动等，sar命令由sysstat安装包安装

用法: sar [ 选项 ] [ <时间间隔> [ <次数> ] ]
选项:
-A：所有报告的总和
-b：显示I/O和传递速率的统计信息
-B：显示换页状态
-d：输出每一块磁盘的使用信息
-e：设置显示报告的结束时间
-f：从制定的文件读取报告
-i：设置状态信息刷新的间隔时间
-P：报告每个CPU的状态
-R：显示内存状态
-u：输出cpu使用情况和统计信息
-v：显示索引节点、文件和其他内核表的状态
-w：显示交换分区的状态
-x：显示给定进程的装
-r：报告内存利用率的统计信息

例
[root@test ~]# sar -u 3 4
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:18:58 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
09:19:01 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
09:19:04 PM     all      0.00      0.00      0.17      0.00      0.00     99.83
09:19:07 PM     all      0.00      0.00      0.17      0.00      0.00     99.83
09:19:10 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
Average:        all      0.00      0.00      0.08      0.00      0.00     99.92
# 每间隔3秒钟统计一次总共统计4次
# %user：显示用户进程消耗的CPU 时间百分比。
# %nice：显示运行正常进程所消耗的CPU 时间百分比。
# %system：显示系统进程消耗的CPU时间百分比。
# %iowait：显示IO等待所占用的CPU时间百分比
# %steal：显示在内存相对紧张的环境下pagein强制对不同的页面进行的steal操作 。
# %idle：显示CPU处在空闲状态的时间百分比。
# 如果系统CPU整体利用率不高，而应用响应缓慢，可能是在一个多CPU的系统中，程序使用了单线程的原因。单线程只使用一个CPU，导致这个CPU占用率为100%，无法处理其它请求，而其它的CPU却闲置，这就导致了整体CPU使用率不高，而应用缓慢现象的发生。
# 在以上的显示当中，主要看%iowait和%idle，%iowait过高表示存在I/O瓶颈，即磁盘IO无法满足业务需求，如果%idle过低表示CPU使用率比较严重，需要结合内存使用等情况判断CPU是否瓶颈。

[root@test ~]# sar -P 1 3 3
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:36:03 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
11:36:06 PM       1      0.00      0.00      0.00      0.00      0.00    100.00
11:36:09 PM       1      0.00      0.00      0.33      0.00      0.00     99.67
11:36:12 PM       1      0.00      0.00      0.00      0.00      0.00    100.00
Average:          1      0.00      0.00      0.11      0.00      0.00     99.89
# 使用-P选项指定监控1号CPU信息，每3秒显示一次，一共显示3次

[root@test ~]# sar -u -o /tmp/1.txt 2 3
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:37:52 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
11:37:54 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
11:37:56 PM     all      0.00      0.00      0.25      0.00      0.00     99.75
11:37:58 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
Average:        all      0.00      0.00      0.08      0.00      0.00     99.92
# 保存监控文件，保存后的文件是二进制的，无法使用vim和cat直接打开
[root@test ~]# sar -u -f /tmp/1.txt 
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:37:52 PM     CPU     %user     %nice   %system   %iowait    %steal     %idle
11:37:54 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
11:37:56 PM     all      0.00      0.00      0.25      0.00      0.00     99.75
11:37:58 PM     all      0.00      0.00      0.00      0.00      0.00    100.00
Average:        all      0.00      0.00      0.08      0.00      0.00     99.92
# 从二进制文件读取

[root@test ~]# sar -q
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:13:34 PM       LINUX RESTART

09:20:01 PM   runq-sz  plist-sz   ldavg-1   ldavg-5  ldavg-15   blocked
09:30:01 PM         0       113      0.00      0.01      0.01         0
09:40:01 PM         0       113      0.08      0.03      0.02         0
# 查看平均负载
# runq-sz：运行队列的长度（等待运行的进程数，每核的CP不能超过3个）
# plist-sz：进程列表中的进程（processes）和线程数（threads）的数量
#ldavg-1：最后1分钟的CPU平均负载，即将多核CPU过去一分钟的负载相加再除以核心数得出的平均值，5分钟和15分钟以此类推
#ldavg-5：最后5分钟的CPU平均负载
#ldavg-15：最后15分钟的CPU平均负载

[root@test ~]# sar -r
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:13:34 PM       LINUX RESTART

09:20:01 PM kbmemfree kbmemused  %memused kbbuffers  kbcached  kbcommit   %commit  kbactive   kbinact   kbdirty
09:30:01 PM    765604    234116     23.42      2108     77200    268076      8.66     83636     62712         0
09:40:01 PM    765664    234056     23.41      2108     77212    268076      8.66     83944     62428         0
# 查看内存使用情况
# kbmemfree：空闲的物理内存大小
# kbmemused：使用中的物理内存大小
# %memused：物理内存使用率
# kbbuffers：内核中作为缓冲区使用的物理内存大小，kbbuffers和kbcached:这两个值就是free命令中的buffer和cache. 
# kbcached：缓存的文件大小
# kbcommit：保证当前系统正常运行所需要的最小内存，即为了确保内存不溢出而需要的最少内存（物理内存+Swap分区）
# commit 这个值是kbcommit与内存总量（物理内存+swap分区）的一个百分比的值

[root@test ~]# sar -W
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:13:34 PM       LINUX RESTART

09:20:01 PM  pswpin/s pswpout/s
09:30:01 PM      0.00      0.00
09:40:01 PM      0.00      0.00
# 查看系统swap分区的统计信息
# pswpin/s：每秒从交换分区到系统的交换页面（swap page）数量
# pswpott/s：每秒从系统交换到swap的交换页面（swap page）的数量

[root@test ~]# sar -b
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:13:34 PM       LINUX RESTART

09:20:01 PM       tps      rtps      wtps   bread/s   bwrtn/s
09:30:01 PM      0.08      0.00      0.08      0.00      1.18
09:40:01 PM      0.09      0.00      0.09      0.00      1.12
# 查看I/O和传递速率的统计信息
# tps：磁盘每秒钟的IO总数，等于iostat中的tps
# rtps：每秒钟从磁盘读取的IO总数
# wtps：每秒钟从写入到磁盘的IO总数
# bread/s：每秒钟从磁盘读取的块总数
# bwrtn/s：每秒钟此写入到磁盘的块总数

[root@test ~]# sar -dp 2 2
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:44:35 PM       DEV       tps  rd_sec/s  wr_sec/s  avgrq-sz  avgqu-sz     await     svctm     %util
11:44:37 PM       sda      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
# sar –d组合，可以对系统的磁盘IO做一个基本的统计
# DEV 磁盘设备的名称，如果不加-p，会显示dev253-0类似的设备名称，因此加上-p显示的名称更直接
# tps：每秒I/O的传输总数
# rd_sec/s：每秒读取的扇区的总数
# wr_sec/s：每秒写入的扇区的总数
# avgrq-sz：平均每次次磁盘I/O操作的数据大小（扇区）
# avgqu-sz：磁盘请求队列的平均长度
# await：平均每次设备I/O操作等待时间（毫秒）
# svctm：平均每次设备I/O操作的服务时间（毫秒）
# %util：一秒钟有百分之几的时间用于I/O操作
# 对磁盘IO性能评判标准：
# 正常svctm应小于await值，而svctm和磁盘性能有关，CPU、内存负荷也会对svctm值造成影响，过多的请求也会间接的导致svctm值的增加。
# await值取决svctm和I/O队列长度以及I/O请求模式，如果svctm的值与await很接近，表示几乎没有I/O等待，磁盘性能很好，如果await的值远高于svctm的值，则表示I/O队列等待太长，系统上运行的应用程序将变慢，此时可以通过更换更快的硬盘来解决问题。
# %util：衡量磁盘I/O重要指标，如%util接近100%，表示磁盘产生的I/O请求太多，I/O系统已经满负荷工作，该磁盘可能存在瓶颈。可优化程序或者 通过更换 更高、更快的磁盘。

[root@test ~]# sar -v
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

09:13:34 PM       LINUX RESTART

09:20:01 PM dentunusd   file-nr  inode-nr    pty-nr
09:30:01 PM      8571      1088     17484         1
09:40:01 PM      8574      1120     17481         1
# 进程、inode、文件和锁表状态
# dentunusd：在缓冲目录条目中没有使用的条目数量
# file-nr：被系统使用的文件句柄数量
# inode-nr：已经使用的索引数量 
# pty-nr：使用的pty数量
================================================================================
这里面的索引和文件句柄值不是ulimit -a查看到的值，而是sysctl.conf里面定义的和内核相关的值， max-file表示系统级别的能够打开的文件句柄的数量， 而ulimit -n控制进程级别能够打开的文件句柄的数量，可以使用sysctl  -a | grep inode和sysctl  -a | grep file查看，具体含义如下：

file-max中指定了系统范围内所有进程可打开的文件句柄的数量限制(系统级别， kernel-level)。 （The value in file-max denotes the maximum number of file handles that the Linux kernel will allocate）。当收到"Too many open files in system"这样的错误消息时， 就应该增加这个值了。
[root@test ~]# cat /proc/sys/fs/file-max
95823
[root@test ~]# echo 100000 > /proc/sys/fs/file-max
或者
[root@test ~]# echo ""fs.file-max=65535" >> /etc/sysctl.conf
[root@test ~]# sysctl -p
file-nr 可以查看系统中当前打开的文件句柄的数量。 他里面包括3个数字： 第一个表示已经分配了的文件描述符数量， 第二个表示空闲的文件句柄数量， 第三个表示能够打开文件句柄的最大值（跟file-max一致）。  内核会动态的分配文件句柄， 但是不会再次释放他们（这个可能不适应最新的内核了， 在我的file-nr中看到第二列一直为0， 第一列有增有减）	
man bash， 找到说明ulimit的那一节：提供对shell及其启动的进程的可用资源（包括文件句柄， 进程数量， core文件大小等）的控制。 这是进程级别的， 也就是说系统中某个session及其启动的每个进程能打开多少个文件描述符， 能fork出多少个子进程等... 当达到上限时， 会报错"Too many open files"或者遇上Socket/File: Can’t open so many files等
================================================================================

[root@test ~]# sar -n DEV 1 1
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:52:46 PM     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s
11:52:47 PM     ens35      0.00      0.00      0.00      0.00      0.00      0.00      0.00
11:52:47 PM        lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00
11:52:47 PM     ens33      0.00      0.00      0.00      0.00      0.00      0.00      0.00
# 每间隔1秒统计一次，总计统计1次
# sar -n选项使用6个不同的开关：DEV，EDEV，NFS，NFSD，SOCK，IP，EIP，ICMP，EICMP，TCP，ETCP，UDP，SOCK6，IP6，EIP6，ICMP6，EICMP6和UDP6 ，DEV显示网络接口信息，EDEV显示关于网络错误的统计数据，NFS统计活动的NFS客户端的信息，NFSD统计NFS服务器的信息，SOCK显示套接字信息，ALL显示所有5个开关。它们可以单独或者一起使用。 
# IFACE：本地网卡接口的名称
# rxpck/s：每秒钟接受的数据包
# txpck/s：每秒钟发送的数据库
# rxKB/S：每秒钟接受的数据包大小，单位为KB
# txKB/S：每秒钟发送的数据包大小，单位为KB
# rxcmp/s：每秒钟接受的压缩数据包
# txcmp/s：每秒钟发送的压缩包
# rxmcst/s：每秒钟接收的多播数据包  

[root@test ~]# sar -n EDEV 1 1
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:55:30 PM     IFACE   rxerr/s   txerr/s    coll/s  rxdrop/s  txdrop/s  txcarr/s  rxfram/s  rxfifo/s  txfifo/s
11:55:31 PM     ens35      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
11:55:31 PM        lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
11:55:31 PM     ens33      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
# 统计网络设备通信失败信息
# IFACE：网卡名称
# rxerr/s：每秒钟接收到的损坏的数据包
# txerr/s：每秒钟发送的数据包错误数
# coll/s：当发送数据包时候，每秒钟发生的冲撞（collisions）数，这个是在半双工模式下才有
# rxdrop/s：当由于缓冲区满的时候，网卡设备接收端每秒钟丢掉的网络包的数目
# txdrop/s：当由于缓冲区满的时候，网络设备发送端每秒钟丢掉的网络包的数目
# txcarr/s：当发送数据包的时候，每秒钟载波错误发生的次数
# rxfram：在接收数据包的时候，每秒钟发生的帧对其错误的次数
# rxfifo：在接收数据包的时候，每秒钟缓冲区溢出的错误发生的次数
# txfifo：在发生数据包 的时候，每秒钟缓冲区溢出的错误发生的次数

[root@test ~]# sar -n SOCK 1 1    
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:57:03 PM    totsck    tcpsck    udpsck    rawsck   ip-frag    tcp-tw
11:57:04 PM       568         3         4         0         0         0
Average:          568         3         4         0         0         0
# 统计socket连接信息
# totsck：当前被使用的socket总数
# tcpsck：当前正在被使用的TCP的socket总数
# udpsck：当前正在被使用的UDP的socket总数
# rawsck：当前正在被使用于RAW的skcket总数
# if-frag：当前的IP分片的数目
# tcp-tw：TCP套接字中处于TIME-WAIT状态的连接数量

[root@test ~]# sar -n TCP 1 3
Linux 3.10.0-693.el7.x86_64 (test)      01/16/2019      _x86_64_        (2 CPU)

11:59:25 PM  active/s passive/s    iseg/s    oseg/s
11:59:26 PM      0.00      0.00      0.00      0.00
11:59:27 PM      0.00      0.00      1.00      1.00
11:59:28 PM      0.00      0.00      1.00      1.00
Average:         0.00      0.00      0.67      0.67
# TCP连接的统计
# active/s：新的主动连接
# passive/s：新的被动连接
# iseg/s：接受的段
# oseg/s：输出的段

================================================================================
sar -n 使用总结
-n DEV ： 网络接口统计信息。
-n EDEV ： 网络接口错误。
-n IP ： IP数据报统计信息。
-n EIP ： IP错误统计信息。
-n TCP ： TCP统计信息。
-n ETCP ： TCP错误统计信息。
-n SOCK ： 套接字使用。
================================================================================

常用命令
sar -b 5 5：IO传送速率
sar -B 5 5：页交换速率
sar -c 5 5：进程创建的速率
sar -d 5 5：块设备的活跃信息
sar -n DEV 5 5：网路设备的状态信息
sar -n SOCK 5 5：SOCK的使用情况
sar -n ALL 5 5：所有的网络状态信息
sar -P ALL 5 5：每颗CPU的使用状态信息和IOWAIT统计状态 
sar -q 5 5：队列的长度（等待运行的进程数）和负载的状态
sar -r 5 5：内存和swap空间使用情况
sar -R 5 5：内存的统计信息（内存页的分配和释放、系统每秒作为BUFFER使用内存页、每秒被cache到的内存页）
sar -u 5 5：CPU的使用情况和IOWAIT信息（同默认监控）
sar -v 5 5 ：inode, file and other kernel tablesd的状态信息
sar -w 5 5 ：每秒上下文交换的数目
sar -W 5 5：SWAP交换的统计信息(监控状态同iostat 的si so)
sar -x 2906 5 5：显示指定进程(2906)的统计信息，信息包括：进程造成的错误、用户级和系统级用户CPU的占用情况、运行在哪颗CPU上
sar -y 5 5：TTY设备的活动状态
sar将结果输出到文件(-o)和读取记录信息(-f)
```



### netstat命令

```shell
功能说明：显示网络状态。
语　　法：netstat [-acCeFghilMnNoprstuvVwx] [-A<网络类型>][--ip]
补充说明：利用netstat指令可让你得知整个Linux系统的网络情况。
参　　数：
-a 或--all：显示所有连线中的Socket。
-A ：<网络类型>或–<网络类型> 列出该网络类型连线中的相关地址。
-c或--continuous：持续列出网络状态。
-C或--cache：显示路由器配置的快取信息。
-e或--extend：显示网络其他相关信息。
-F或--fib：显示FIB。
-g或--groups：显示多重广播功能群组组员名单。
-h或--help：在线帮助。
-i或--interfaces：显示网络界面信息表单。
-l或--listening：显示监控中的服务器的Socket。
-M或--masquerade：显示伪装的网络连线。
-n或--numeric：直接使用IP地址，而不通过域名服务器。
-N或--netlink或--symbolic：显示网络硬件外围设备的符号连接名称。
-o或--timers：显示计时器。
-p或--programs：显示正在使用Socket的程序识别码和程序名称。
-r或--route：显示 Routing Table。
-s或--statistice：显示网络工作信息统计表。
-t或--tcp：显示TCP 传输协议的连线状况。
-u或--udp：显示UDP传输协议的连线状况。
-v或--verbose：显示指令执行过程。
-V或--version：显示版本信息。
-w或--raw：显示RAW传输协议的连线状况。
-x或--unix：此参数的效果和指定”-A unix”参数相同。
–ip或--inet：此参数的效果和指定”-A inet”参数相同。

网络连接状态详解
共有12中可能的状态，前面11种是按照TCP连接建立的三次握手和TCP连接断开的四次挥手过程来描述的。
1. LISTEN：首先服务端需要打开一个socket进行监听，状态为LISTEN。/* The socket is listening for incoming connections. 侦听来自远方TCP端口的连接请求*/
2. SYN_SENT：客户端通过应用程序调用connect进行active open。于是客户端tcp发送一个SYN以请求建立一个连接。之后状态置为SYN_SENT。/*The socket is actively attempting to establish a connection. 在发送连接请求后等待匹配的连接请求 */
3. SYN_RECV：服务端应发出ACK确认客户端的 SYN，同时自己向客户端发送一个SYN。之后状态置为SYN_RECV。/* A connection request has been received from the network. 在收到和发送一个连接请求后等待对连接请求的确认 */
4. ESTABLISHED：代表一个打开的连接，双方可以进行或已经在数据交互了。/* The socket has an established connection. 代表一个打开的连接，数据可以传送给用户 */
5. FIN_WAIT1：主动关闭(active close)端应用程序调用close，于是其TCP发出FIN请求主动关闭连接，之后进入FIN_WAIT1状态。/* The socket is closed, and the connection is shutting down. 等待远程TCP的连接中断请求，或先前的连接中断请求的确认 */
6. CLOSE_WAIT：被动关闭(passive close)端TCP接到FIN后，就发出ACK以回应FIN请求(它的接收也作为文件结束符传递给上层应用程序)，并进入CLOSE_WAIT。/* The remote end has shut down, waiting for the socket to close. 等待从本地用户发来的连接中断请求 */
7. FIN_WAIT2：主动关闭端接到ACK后，就进入了 FIN-WAIT-2 。/* Connection is closed, and the socket is waiting for a shutdown from the remote end. 从远程TCP等待连接中断请求 */
8. LAST_ACK:：被动关闭端一段时间后，接收到文件结束符的应用程序将调用CLOSE关闭连接。这导致它的TCP也发送一个 FIN，等待对方的ACK。就进入了LAST-ACK 。/* The remote end has shut down, and the socket is closed. Waiting for acknowledgement. 等待原来发向远程TCP的连接中断请求的确认 */
9. TIME_WAIT：在主动关闭端接收到FIN后，TCP 就发送ACK包，并进入TIME-WAIT状态。/* The socket is waiting after close to handle packets still in the network.等待足够的时间以确保远程TCP接收到连接中断请求的确认 */
10. CLOSING: 比较少见。/* Both sockets are shut down but we still don’t have all our data sent. 等待远程TCP对连接中断的确认 */
11. CLOSED：被动关闭端在接受到ACK包后，就进入了closed的状态。连接结束。/* The socket is not being used. 没有任何连接状态 */
12. UNKNOWN：未知的Socket状态。/* The state of the socket is unknown. */

SYN： (同步序列编号，Synchronize Sequence Numbers)该标志仅在三次握手建立TCP连接时有效。表示一个新的TCP连接请求。
ACK：(确认编号，Acknowledgement Number)是对TCP请求的确认标志，同时提示对端系统已经成功接收所有数据。
FIN： (结束标志，FINish)用来结束一个TCP回话。但对应端口仍处于开放状态，准备接收后续数据。

例
[root@test ~]# netstat -a
# 列出所有端口
[root@test ~]# netstat -at
# 列出所有TCP端口
[root@test ~]# netstat -au
# 列出所有UDP端口
[root@test ~]# netstat -l
# 只显示监听端口
[root@test ~]# netstat -lt
# 显示监听TCP端口
[root@test ~]# netstat -lu
# 显示监听UDP端口
[root@test ~]# netstat -lx
# 显示监听UNIX端口
[root@test ~]# netstat -s
# 显示所有端口的统计信息
[root@test ~]# netstat -st
# 显示所有TCP的统计信息
[root@test ~]# netstat -su
# 显示所有UDP的统计信息
[root@test ~]# netstat -p
# 显示 PID 和进程名称
[root@test ~]# netstat -r
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         bogon           0.0.0.0         UG        0 0          0 ens33
172.16.106.0    0.0.0.0         255.255.255.0   U         0 0          0 ens35
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 ens33
# 显示核心路由信息
[root@test ~]# netstat -rn
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG        0 0          0 ens33
172.16.106.0    0.0.0.0         255.255.255.0   U         0 0          0 ens35
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 ens33
# 显示数字格式，不查询主机名称
[root@test ~]# netstat -c
# netstat 将每隔一秒输出网络信息
[root@test ~]# netstat -ie
# 显示网络接口列表详细信息，结果如ifconfig

[root@test ~]# netstat -ant|grep "192.168.1.14:22"|awk '{print $5}'|sort|uniq -c|sort -nr|head -20
      1 192.168.1.9:51292
# 查看连接某服务端口最多的的IP地址。uniq的-c或--count选项是在每列旁边显示该行重复出现的次数。

[root@test ~]# netstat -nat |awk '{print $6}'|sort|uniq -c|sort -rn
      4 LISTEN
      1 Foreign
      1 ESTABLISHED
      1 established)
# TCP各种状态列表
```



### 系统连接状态

#### 查看TCP连接状态

```shell
netstat -nat |awk '{print $6}'|sort|uniq -c|sort -rn
netstat -n | awk  '/^tcp/ {++S[$NF]};END {for(a in S) print a, S[a]}'
netstat -n | awk '/^tcp/ {++state[$NF]}; END {for(key in state) print key,"\t",state[key]}'
netstat -n | awk '/^tcp/ {++arr[$NF]};END {for(k in arr) print k,"\t",arr[k]}'
netstat -n |awk '/^tcp/ {print $NF}'|sort|uniq -c|sort -rn
netstat -ant | awk '{print $NF}' | grep -v '[a-z]' | sort | uniq -c
```



#### 查找请求数请20个IP（常用于查找攻击来源）

```shell
netstat -anlp|grep 80|grep tcp|awk '{print $5}'|awk -F: '{print $1}'|sort|uniq -c|sort -nr|head -n20
netstat -ant |awk '/:80/{split($5,ip,':');++A[ip[1]]}END{for(i in A) print A[i],i}' |sort -rn|head -n20
```



#### 用tcpdump嗅探80端口的访问看看谁最高

```shell
[root@test ~]# tcpdump -i ens33 -tnn dst port 80 -c 1000 | awk -F"." '{print $1"."$2"."$3"."$4}' | sort | uniq -c | sort -nr |head -20
```



#### 查找较多time_wait连接

```shell
netstat -n|grep TIME_WAIT|awk '{print $5}'|sort|uniq -c|sort -rn|head -n20
```



#### 找查较多的SYN连接

```shell
netstat -an | grep SYN | awk '{print $5}' | awk -F: '{print $1}' | sort | uniq -c | sort -nr | more
```



#### 根据端口列进程PID

```shell
netstat -ntlp | grep 80 | awk '{print $7}' | cut -d/ -f1
```



### 网站日志分析（Apache）

#### 获得访问前10位的ip地址

```shell
cat access.log|awk '{print $1}'|sort|uniq -c|sort -nr|head -10
cat access.log|awk '{counts[$(11)]+=1}; END {for(url in counts) print counts[url], url}'
```



#### 访问次数最多的文件或页面,取前20

```shell
cat access.log|awk '{print $11}'|sort|uniq -c|sort -nr|head -20
```



#### 列出传输最大的几个exe文件（分析下载站的时候常用）

```shell
cat access.log |awk '($7~/\.exe/){print $10 " " $1 " " $4 " " $7}'|sort -nr|head -20
```



#### 列出输出大于200000byte(约200kb)的exe文件以及对应文件发生次数

```shell
cat access.log |awk '($10 > 200000 && $7~/\.exe/){print $7}'|sort -n|uniq -c|sort -nr|head -100
```



#### 如果日志最后一列记录的是页面文件传输时间，则有列出到客户端最耗时的页面

```shell
cat access.log |awk '($7~/\.php/){print $NF " " $1 " " $4 " " $7}'|sort -nr|head -100
```



#### 列出最最耗时的页面(超过60秒的)的以及对应页面发生次数

```shell
cat access.log |awk '($NF > 60 && $7~/\.php/){print $7}'|sort -n|uniq -c|sort -nr|head -100
```



#### 列出传输时间超过 30 秒的文件

```shell
cat access.log |awk '($NF > 30){print $7}'|sort -n|uniq -c|sort -nr|head -20
```



#### 统计网站流量（G)

```shell
cat access.log |awk '{sum+=$10} END {print sum/1024/1024/1024}'
```



#### 统计404的连接

```shell
awk '($9 ~/404/)' access.log | awk '{print $9,$7}' | sort
```



#### 统计http status

```shell
cat access.log |awk '{counts[$(9)]+=1}; END {for(code in counts) print code, counts[code]}'
cat access.log |awk '{print $9}'|sort|uniq -c|sort -rn
```



#### 蜘蛛分析

```shell
/usr/sbin/tcpdump -i eth0 -l -s 0 -w - dst port 80 | strings | grep -i user-agent | grep -i -E 'bot|crawler|slurp|spider'
# 查看是哪些蜘蛛在抓取内容
```



#### 网站日分析Squid

```shell
zcat squid_access.log.tar.gz| awk '{print $10,$7}' |awk 'BEGIN{FS="[ /]"}{trfc[$4]+=$1}END{for(domain in trfc){printf "%s\t%d\n",domain,trfc[domain]
```



### 查看数据库执行的sql

```shell
tcpdump -i eth0 -s 0 -l -w - dst port 3306 | strings | egrep -i 'SELECT|UPDATE|DELETE|INSERT|SET|COMMIT|ROLLBACK|CREATE|DROP|ALTER|CALL'
```



### 系统Debug分析

```shell
strace -p pid
# 调试命令

gdb -p pid
# 跟踪指定进程的PID
```

