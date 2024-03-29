---
title: logrotate配置使用
date: 2019-04-04 10:33:06
tags: 日志切割
categories: 基础
---

### 概念

> logrotate是个十分有用的日志切割工具，它可以自动对日志进行截断（或轮循）、压缩以及删除旧的日志文件。



### 配置文件

```shell
[root@webdav ~]# vim /etc/logrotate.conf
# see "man logrotate" for details
# rotate log files weekly  
weekly
# 每周轮替一次，也就是多久生成一个新的日志文件
# keep 4 weeks worth of backlogs
rotate 4
# 保留4个轮替日志 
# create new (empty) log files after rotating old ones
create
# 轮替后创建新的日志文件 
# use date as a suffix of the rotated file
dateext
# 使用时间作为轮替文件的后缀 
# uncomment this if you want your log files compressed
#compress
# 如果需要压缩日志，去除注释
# RPM packages drop log rotation information into this directory
include /etc/logrotate.d
# 让/etc/logrotate.d目录下面配置文件内容参与轮替 
# no packages own wtmp and btmp -- we'll rotate them here
/var/log/wtmp {			# 轮替对象为/var/log/中的wtmp文件 
    monthly			# 每个月轮替一次
    create 0664 root utmp		#创建新的日志文件的权限，所属用户所属组 	
        minsize 1M			# 日志大小大于1M后才能参与轮替
    rotate 1			# 保留一个轮替日志文件 
}

/var/log/btmp {
    missingok			#  如果日志文件不存在，继续进行下一个操作，不报错 
    monthly
    create 0600 root utmp
    rotate 1
}
```



### 常用参数

| 参数                 | 描述                                                         |
| -------------------- | ------------------------------------------------------------ |
| daily                | 每天轮替一次                                                 |
| weekly               | 每周轮替一次                                                 |
| monthly              | 每月轮替一次                                                 |
| yearly               | 每年轮替一次                                                 |
| rotate               | 保留几个轮替日志文件                                         |
| ifempty              | 不论日志是否空，都进行轮替                                   |
| notifempty           | 若日志为空，则不进行轮替                                     |
| create               | 旧日志文件轮替后创建新的日志文件                             |
| size                 | 日志达到多少后进行rotate                                     |
| minsize              | 文件容量一定要超过多少后才进行rotate                         |
| nocompress           | 轮替但不进行压缩                                             |
| compress             | 压缩轮替文件                                                 |
| dateext              | 轮替旧日志文件时，文件名添加-%Y %m %d形式日期，可用dateformat选项扩展配置。 |
| nodateext            | 旧日志文件不使用dateext扩展名，后面序数自增如"*.log.1"       |
| dateformat           | 只允许%Y %m %d和%s指定符。注意：系统时钟需要设置到2001-09-09之后，%s才可以正确工作 |
| sharedscripts        | 作用域下文件存在至少有一个满足轮替条件的时候，执行一次prerotate脚本和postrotate脚本。 |
| prerotate/endscript  | 在轮替之前执行之间的命令，prerotate与endscript成对出现。     |
| postrotate/endscript | 在轮替之后执行之间的命令，postrotate与endscript成对出现。    |
| olddir               | 将轮替的文件移至指定目录下                                   |
| missingok            | 如果日志文件不存在，继续进行下一个操作，不报错               |



### 切割日志生效时间

```shell
[root@xor-paasjobworker ~]# cat /etc/anacrontab 
# /etc/anacrontab: configuration file for anacron

# See anacron(8) and anacrontab(5) for details.

SHELL=/bin/sh
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
# the maximal random delay added to the base delay of the jobs
RANDOM_DELAY=45   # 随机延迟时间是45分钟
# the jobs will be started during the following hours only
START_HOURS_RANGE=3-22
# 生效时间范围是3点到22点
#period in days   delay in minutes   job-identifier   command
1       5       cron.daily              nice run-parts /etc/cron.daily
7       25      cron.weekly             nice run-parts /etc/cron.weekly
@monthly 45     cron.monthly            nice run-parts /etc/cron.monthly
```



### 实例

```shell
[root@RBO1-POSTER3 ~]# yum install -y logrotate
[root@RBO1-POSTER3 ~]# systemctl start rsyslog
# 安装好logrotate后要启动rsyslog
[root@RBO1-POSTER3 ~]# vim /etc/logrotate.d/nginx
/var/log/nginx/*.log {
# 定义一个对nginx的log日志进行切割的脚本，上面是日志的地址，如果有多个路径可以使用空格或换行来分隔
#        daily			# 这里注释的意义不大，因为如果不配置，也会使用logrotate.conf的默认配置
        size = 50M			# 50M切割一次
        missingok			# 如果日志文件不存在，继续进行下一个操作，不报错
        rotate 5			# 保留5个日志文件，这并不包括本身的日志文件，只是切割后的日志文件
#        compress
#        delaycompress
        notifempty
#        create 640 nginx adm
        sharedscripts
        postrotate
                if [ -f /var/run/nginx.pid ]; then
                        kill -USR1 `cat /var/run/nginx.pid`
                fi
        endscript
# 这个脚本的功能应该是先判断nginx.pid文件是否存在，如果存在证明nginx服务启动了，之后让nginx向新的日志文件中写入日志，kill发送-USR1信号给nginx的pid。信号的具体作用没弄明白。
}
[root@RBO1-POSTER3 ~]# /usr/sbin/logrotate --force /etc/logrotate.d/nginx
# 这是强制执行一次脚本，使用logrotate命令加--force选项，最后指定要执行的脚本。也可以使用短选项-f，再配以-v选项显示详细信息
[root@RBO1-POSTER3 ~]# ll /var/log/nginx/
总用量 427804
-rw-r--r--. 1 nginx root  34053285 4月   4 10:47 access.log
-rw-r--r--. 1 nginx root  42083626 4月   4 10:00 access.log.1
-rw-r--r--. 1 nginx root  39990852 4月   4 09:00 access.log.2
-rw-r-----. 1 nginx root 276662461 4月   3 14:21 access.log-20190403
-rw-r--r--. 1 nginx root  26968952 4月   4 08:00 access.log.3
-rw-r--r--. 1 nginx root  12106704 4月   4 07:00 access.log.4
-rw-r--r--. 1 nginx root   3937887 4月   4 06:00 access.log.5
-rw-r--r--. 1 nginx root     14267 4月   4 10:47 error.log
-rw-r--r--. 1 nginx root      5876 4月   4 09:56 error.log.1
-rw-r--r--. 1 nginx root      3470 4月   4 08:45 error.log.2
-rw-r-----. 1 root  root   2184157 4月   3 08:35 error.log-20190403
-rw-r--r--. 1 nginx root      2762 4月   4 07:54 error.log.3
-rw-r--r--. 1 nginx root       338 4月   4 06:51 error.log.4
-rw-r--r--. 1 nginx root       337 4月   4 05:33 error.log.5
# 强制执行多次后发现，会有一个以日志命名的日志，这是logrotate脚本正常执行的结果，以数字结尾的日志共有5个，这是强制执行脚本后产生的，还有一个本身的日志。所以强制执行脚本后，也不会按配置文件中定义的只保留5个轮替日志文件，正常产生的轮替日志是不会被删除的。另外，如果需要按小时执行轮替就需要使用crontab定时任务，logrotate最小只支持按天轮替。

[root@RBO1-POSTER3 ~]# crontab -e
*/60 * * * * /usr/sbin/logrotate --force /etc/logrotate.d/nginx
# 每60分钟执行一次，这与按每小时执行是不一样的。

[root@xor-paasjobadmin ~]# logrotate -d /etc/logrotate.d/nginx 
reading config file /etc/logrotate.d/nginx
Allocating hash table for state file, size 15360 B

Handling 1 logs

rotating pattern: /xor/data2/log/nginx/*log  after 1 days (30 rotations)
empty log files are not rotated, old logs are removed
considering log /xor/data2/log/nginx/4k_access.log
  log does not need rotating (log has been rotated at 2019-6-20 12:0, that is not day ago yet)
considering log /xor/data2/log/nginx/4k_error.log
  log does not need rotating (log has been rotated at 2019-6-20 12:0, that is not day ago yet)
not running postrotate script, since no logs were rotated
# 使用‘-d’选项以预演方式运行logrotate。要进行验证，不用实际轮循任何日志文件，可以模拟演练日志轮循并显示其输出。

[root@xor-paasjobadmin ~]# cat /etc/cron.daily/
logrotate    man-db.cron  mlocate      
[root@xor-paasjobadmin ~]# cat /etc/cron.daily/logrotate 
#!/bin/sh

/usr/sbin/logrotate -s /var/lib/logrotate/logrotate.status /etc/logrotate.conf
EXITVALUE=$?
if [ $EXITVALUE != 0 ]; then
    /usr/bin/logger -t logrotate "ALERT exited abnormally with [$EXITVALUE]"
fi
exit 0
#  logrotate定时任务。logrotate需要的cron任务应该在安装时就自动创建了
```



#### 在指定时间切割

```shell
# 日志转储流程
# crond服务加载/etc/cron.d/0hourly --->在每小时的01分执行/etc/cron.hourly/0anacron脚本 --->执行anacron --->根据/etc/anacrontab的配置执行/etc/cron.daily，/etc/cron.weekly，/etc/cron.monthly --->执行/etc/cron.daily/下的logrotate脚本 --->执行logrotate --->根据/etc/logrotate.conf配置执行脚本/etc/logrotate.d/nginx --->转储nginx日志成功

# 定义每天00点00分转储varnish日志
---------
  方法一
---------
vim /etc/anacrontab
# /etc/anacrontab: configuration file for anacron

# See anacron(8) and anacrontab(5) for details.

SHELL=/bin/sh
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
# the maximal random delay added to the base delay of the jobs
#RANDOM_DELAY=45
RANDOM_DELAY=0     # 表示延迟为0分钟
# the jobs will be started during the following hours only
#START_HOURS_RANGE=3-22
START_HOURS_RANGE=0-22     # 执行从0点到22点

#period in days   delay in minutes   job-identifier   command
1       0       cron.daily              nice run-parts /etc/cron.daily    # 延迟为0分钟
7       25      cron.weekly             nice run-parts /etc/cron.weekly
@monthly 45     cron.monthly            nice run-parts /etc/cron.monthly
# 修改红字部分
# period in days 是表示1天、7天、1个月执行一次
# delay in minutes 是延迟的分钟数
# nice设置优先级为10，范围为-20（最高优先级）到19（最低优先级）
# run-parts 是一个脚本，表示会执行它后面目录里的脚本

vim /etc/cron.d/0hourly
# Run the hourly jobs
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root
00 * * * * root run-parts /etc/cron.hourly
# 修改红字部分，表示每小时的每0分钟开始执行
# 这种方法会影响到 /etc/cron.daily，/etc/cron.weekly，/etc/cron.monthly 下所有脚本的自动执行时间

---------
  方法二
---------
mkdir -p /etc/logrotate.daily.0
mv /etc/logrotate.d/varnish /etc/logrotate.daily.0/
# 新建一个目录，将varnish的logrotate任务放入，这样此目录中的任务就不受logrotate的配置文件控制了
crontab -e
00 00 * * * /usr/sbin/logrotate -f /etc/logrotate.daily.0/varnish > /dev/null 2>&1
# 通过定时任务来执行这个logrotate任务。
vim /etc/logrotate.daily.0/varnish
/xor/data2/log/varnish/varnishncsa.log {
	daily
	rotate 30
	compress
	delaycompress
	missingok
	postrotate
		/bin/kill -HUP `cat /var/run/varnishncsa.pid /run/varnishncsa/varnishncsa.pid 2>/dev/null` 2> /dev/null || true
	endscript
}
```





