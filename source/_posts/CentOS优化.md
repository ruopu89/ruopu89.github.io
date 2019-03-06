---
title: CentOS优化
date: 2019-03-05 11:29:58
tags: 系统优化
categories: 基础
---

### 文件句柄数

```shell
* 临时调整
[root@template ~]# ulimit -n
1024
[root@template ~]# ulimit -n 65535
[root@template ~]# ulimit -n
65535

* 永久生效
[root@template ~]# vim /etc/security/limits.conf
*       soft    nofile          65535
*       hard    nofile          65535
```



### 调整历史记录及连接超时

```shell
[root@template ~]# vim /etc/bashrc
HISTFILESIZE=4000
HISTSIZE=4000
HISTTIMEFORMAT='%F %T '
export HISTTIMEFORMAT
# 添加上面四行。HISTFILESIZE定义了.bash_history中保存命令的总数，默认是1000，这里改成了4000，HISTSIZE设置了history命令输出最多的记录总数，HISTTIMEFORMAT定了时间显示格式。
#以前的操作记录都会显示更改/etc/bashrc文件的时间，而不是真正的操作时间，只有更改完/etc/bashrc以后的操作记录会显示正确的时间
export TMOUT=10
# 置连接会话的超时时间
```



### 同步时间

```shell
* 查看时区
[root@template ~]# cat /etc/sysconfig/clock 
ZONE="Asia/Shanghai"

* 同步时间
[root@template ~]# ntpdate cn.pool.ntp.org
[root@template ~]#crontab -e
0 10 * * * /usr/sbin/ntpdate cn.pool.ntp.org
```



### 调整yum源

```shell
cp CentOS-Base.repo{,.$(date +%F)}
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```



### 更改SSH服务端远程登录的配置

```shell
[root@template ~]# cp /etc/ssh/sshd_config{,.bak}
[root@template ~]# vim /etc/ssh/sshd_config
Port 52113           
# ssh连接默认的端口
PermitRootLogin no   
# 禁止root登录
PermitEmptyPasswords no 
# 禁止空密码登录，此项默认就是no
UseDNS no            
# 不使用DNS解析地址
[root@template ~]# /etc/init.d/sshd restart
```



### 锁定关键系统文件

```shell
[root@template ~]# chattr +i /etc/passwd /etc/inittab /etc/group /etc/shadow /etc/gshadow
# attr命令用于改变文件属性，i选项表示不得任意更动文件或目录。这时创建用户或组的命令执行也会失败。
[root@template ~]# ll /etc/gshadow
---------- 1 root root 631 1月  18 18:38 /etc/gshadow
[root@template ~]# ll /etc/shadow
---------- 1 root root 1259 1月  18 18:40 /etc/shadow
[root@template ~]# chattr -i /etc/shadow
# 使用-i可以解锁
```

