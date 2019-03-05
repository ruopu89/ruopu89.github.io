---
title: puppet配置与使用
date: 2019-01-29 15:17:23
tags: puppet
categories: 编排工具
---

### 概念

#### 资源

> * group：定义组
> * user：定义用户
> * file：定义配置文件
> * service：定义服务
> * exec：执行命令
> * package：管理程序包
> * cron：周期性任务计划
> * notify：主要用于输出puppet的辅助提示信息,在puppet的执行过程中通过这些辅助信息了解执行的过程,它并不会改变任何操作状态.



#### 资源中的参数

> * name：指定要创建或显示的信息
> * system：是否为系统的，true为是，false表示非；
> * ensure：描述状态的。present表示必须创建，adsent表示不创建。latest表示安装最新版本，installed也表示安装最新版本，如果不想安装最新版本，要指定版本号，用present也可以安装。running表示处理启动状态。file表示是配置文件。directory表示定义为目录；
> * enable：表示开机是否自启动，如true
> * require：表示依赖哪个属性；
> * before：表示先于上面的哪个资源执行
> * subscribe：订阅前面的资源，如果前面发生改变就通知后面的资源，服务会重启。notify和subscribe是通知相关的其它资源进行“刷新”操作
> * ->表示某资源要在另一个资源之前执行。->不能写在下面的资源后，如果要用这个符号，就要写在优先于的资源的上面。
> * ~>表示通知某资源
> * path：在exec资源中使用时一定要给定命令路径，如'/bin:/sbin:/usr/bin:/usr/sbin',，如果在exec中没有给路径的情况下。
> * recurse：表示递归复制整个目录，可用true。
> * creates：只有在此目录不存在时才执行。对于目录或文件路径类的操作资源来讲，可以用creates来判断，如果不存在才创建
> * command：要执行的命令
> * unless：表示其指定的命令执行失败了才执行上面的创建用户命令
> * refreshonly：refreshonly为true表示触发时才执行命令，如程序包安装了才创建用户，如果没有程序包，就不会创建。如果没有refreshonly时，即使没有事件通知它，exec也会执行。如果加上refreshonly时，exec仅在其他资源用notify或subscribe事件通知时才会执行。refreshonly作用是让exec只在通知时执行，如果被通知多次就执行多次。
> * refresh：如果有其他资源调用exec的时候，exec会执行好几次，加上refresh后就只会执行一次了，refresh作用就是不管有通知没通知，有多少次通知，都只执行一次。
> * provider：定义用什么方式安装，如rpm
> * owner：表示文件属主
> * group：表示文件属组
> * mode：表示文件权限
> * message：输出描述信息
> * withpath：是否显示完整对象路径。



### puppet单机模型

#### 安装

```shell
==============================================================================================
环境
node1：192.168.1.70
==============================================================================================
------------
  node1
------------ 
[root@puppet ~]# yum install -y epel-release
[root@puppet ~]# yum install -y puppet facter
# facter是一个非常有用的系统盘点工具，自定义时可以让节点增加更多的标签。这个工具可以通过一些预先设定好变量定位一台主机，比如可以通过变量lsbdistrelease便可以知道当前系统的版本号，通过osfamily便可以知道系统是RedHat还是SLES，还有其他等等。
[root@puppet ~]# puppet describe -l
These are the types known to puppet:
augeas          - Apply a change or an array of changes to the  ...
computer        - Computer object management using DirectorySer ...
cron            - Installs and manages cron jobs
exec            - Executes external commands
file            - Manages files, including their content, owner ...
filebucket      - A repository for storing and retrieving file  ...
group           - Manage groups
...
# 查看资源类型
[root@puppet ~]# puppet describe group
# 查看组类型
[root@puppet ~]# mkdir manifests
[root@puppet ~]# cd manifests
```



####  资源组创建

```shell
[root@puppet manifests]# vim first.pp
# puppet资源清单要以.pp结尾
group{'nginx':			# 如果组中没有空白可以不用引号，这里组名就叫nignx，之后用冒号隔开
   name => 'nginx',
# 第一个属性name，用=>表示赋值，也叫nginx，最后用逗号隔开。如果不写name，那么就用上面的title当默认的name，也就是上面的nginx
   gid => 900,		# 指定组id，一定要指定组id，如果不加组id，创建系统组会失败。如果已经有要创建的组了，可以通过这里修改组id
   system => true,
# system表示系统组，这里的true不能加引号，因为true是布尔型的值。如果创建普通组，可以去掉system项
}
[root@puppet manifests]# puppet apply --verbose --noop first.pp 
Notice: Compiled catalog for puppet in environment production in 0.07 seconds
Info: Applying configuration version '1548897081'
Info: Creating state file /var/lib/puppet/state/state.yaml
Notice: Finished catalog run in 0.01 seconds
# apply表示跑一次，--verbose表示查看详细信息，--noop表示干跑。显示结果是绿色表示没有问题
[root@puppet manifests]# puppet apply -v first.pp 
Notice: Compiled catalog for puppet in environment production in 0.06 seconds
Info: Applying configuration version '1548897756'
Notice: /Stage[main]/Main/Group[nginx]/ensure: created
Notice: Finished catalog run in 0.04 seconds
[root@puppet manifests]# cat /etc/group|grep nginx            
nginx:x:900:
# 创建成功
```



#### 创建组和用户资源

```shell
[root@puppet manifests]# vim second.pp
group{'memcached':
   ensure => present,
# ensure是描述状态的，present表示必须创建出来。定义系统组时必须有此项(CentOS6上500以内为系统用户和组，500开始为普通用户和组。CentOS7上是1000以内)，但最好何时都加上
   name => 'memcached',
   system => true,
}
[root@puppet manifests]# puppet apply -v --noop second.pp 
Notice: Compiled catalog for puppet in environment production in 0.06 seconds
Info: Applying configuration version '1548898738'
Notice: /Stage[main]/Main/Group[memcached]/ensure: current_value absent, should be present (noop)
Notice: Class[Main]: Would have triggered 'refresh' from 1 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.03 seconds
[root@puppet manifests]# puppet apply -v second.pp         
Notice: Compiled catalog for puppet in environment production in 0.07 seconds
Info: Applying configuration version '1548898802'
Notice: /Stage[main]/Main/Group[memcached]/ensure: created
Notice: Finished catalog run in 0.04 seconds
[root@puppet manifests]# grep -i 'memcached' /etc/group
memcached:x:899:
# 这次在second.pp中不加组id也可以创建系统组了。但还是建议加入组id
[root@puppet manifests]# vim user1.pp
user{'nginx':
   uid => 444,
   gid => 'nginx',
   system => true,
   ensure => present,
}
[root@puppet manifests]# puppet apply -v --noop --debug user1.pp 
Notice: Compiled catalog for puppet in environment production in 0.11 seconds
# 基本组要事先存在才能创建用户，--debug可以输出更加详细的信息
[root@puppet manifests]# vim user1.pp 
group{'nginx':
   system => true,
   ensure => present,
}
user{'nginx':
   uid => 444,
   gid => 'nginx',
   system => true,
   ensure => present,
}
[root@puppet manifests]# puppet apply -v --debug --noop user1.pp
[root@puppet manifests]# puppet apply -v --debug user1.pp  
# 这样就能创建了，同一个定义执行多遍，其结果是一样的。这叫幂等性。如果没有幂等性，要让其拥有

[root@puppet manifests]# vim user2.pp
user{'redis':
   gid => 'redis',
   ensure => present,
}
group{'redis':
   ensure => present,
}
[root@puppet manifests]# puppet apply -v --noop --debug user2.pp
# 可以执行，会先创建组再创建用户，反着写也可以。只要是在同一文件中就没问题
[root@puppet manifests]# vim user2.pp                     
user{'redis':
   gid => 'redis',
   ensure => present,
   require => Group['redis'],
# require表示依赖哪个属性，Group这个属性的第一个字母必须大写，后面用['']的方式写明title。这样定义后，执行时就必须先执行下面的命令
}
group{'redis':
   ensure => present,
   before => User['redis'],
# 这表示先于上面的user执行，格式与上面的require一样，这两种方法都可以使group先执行
}
[root@puppet manifests]# puppet describe package
# 查看管理程序包的
```



#### 创建程序包资源

```shell
[root@puppet manifests]# vim pkg1.pp
package{'redis':
   ensure => latest,
}
[root@puppet manifests]# rpm -q redis
package redis is not installed
[root@puppet manifests]# puppet apply -v pkg1.pp                
Notice: Compiled catalog for puppet in environment production in 0.21 seconds
Warning: The package type's allow_virtual parameter will be changing its default value from false to true in a future release. If you do not want to allow virtual packages, please explicitly set allow_virtual to false.
   (at /usr/share/ruby/vendor_ruby/puppet/type.rb:816:in `set_default')
Info: Applying configuration version '1548900655'
Notice: /Stage[main]/Main/Package[redis]/ensure: created
Notice: Finished catalog run in 11.39 seconds
# 这里会有一个Warning: 提示，可以在文件中加入allow_virtual => false，就不会提示了
[root@puppet manifests]# rpm -q redis
redis-3.2.12-2.el7.x86_64
# 安装成功了

下载jdk-8u201-linux-x64.rpm到root目录
[root@puppet manifests]# vim pkg2.pp
package{'jdk':
   ensure => installed,
   source => '/root/jdk-8u201-linux-x64.rpm',
   provider => rpm,
   allow_virtual => false,		# 不加入此项，还会有警告提示
}
[root@puppet manifests]# puppet apply -v --noop pkg2.pp 
Notice: Compiled catalog for puppet in environment production in 0.22 seconds
Info: Applying configuration version '1548905011'
Notice: /Stage[main]/Main/Package[jdk]/ensure: current_value absent, should be present (noop)
Notice: Class[Main]: Would have triggered 'refresh' from 1 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.11 seconds
[root@puppet manifests]# puppet apply -v pkg2.pp        
Notice: Compiled catalog for puppet in environment production in 0.22 seconds
Info: Applying configuration version '1548905065'
Notice: /Stage[main]/Main/Package[jdk]/ensure: created
Notice: Finished catalog run in 7.13 seconds
[root@puppet manifests]# java -version
java version "1.8.0_201"
Java(TM) SE Runtime Environment (build 1.8.0_201-b09)
Java HotSpot(TM) 64-Bit Server VM (build 25.201-b09, mixed mode)
# 安装成功
[root@puppet manifests]# ls /usr/java/
default  jdk1.8.0_201-amd64  latest
[root@puppet manifests]# rpm -q jdk1.8-2000:1.8.0_201-fcs.x86_64
jdk1.8-1.8.0_201-fcs.x86_64
```



#### 服务与配置文件

##### 基本配置

```shell
[root@puppet manifests]# vim service1.pp
service{'redis':
   ensure => running,		# 确保处于启动状态
   enable => true,		# 是否开机自启动
}
[root@puppet manifests]# puppet apply -v --noop service1.pp 
Notice: Compiled catalog for puppet in environment production in 0.08 seconds
Info: Applying configuration version '1548905408'
Notice: /Stage[main]/Main/Service[redis]/ensure: current_value stopped, should be running (noop)
Info: /Stage[main]/Main/Service[redis]: Unscheduling refresh on Service[redis]
Notice: Class[Main]: Would have triggered 'refresh' from 1 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.03 seconds
[root@puppet manifests]# puppet apply -v service1.pp        
Notice: Compiled catalog for puppet in environment production in 0.08 seconds
Info: Applying configuration version '1548905419'
Notice: /Stage[main]/Main/Service[redis]/ensure: ensure changed 'stopped' to 'running'
Info: /Stage[main]/Main/Service[redis]: Unscheduling refresh on Service[redis]
Notice: Finished catalog run in 0.10 seconds
[root@puppet manifests]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128    127.0.0.1:6379                   *:*             
# 可以看到redis启动了
# 服务要依赖程序包，要先安装程序包，才能启动服务
[root@puppet manifests]# vim service1.pp                        
package{'redis':
   ensure => present,
}
service{'redis':
   ensure => running,
   enable => true,
   require => Package['redis']
}
[root@puppet manifests]# cp /etc/redis.conf ./
[root@puppet manifests]# vim redis.conf
bind 0.0.0.0
requirepass centos
[root@puppet manifests]# vim file1.pp
file{'/etc/redis.conf':		# 如果只写名字，后面一定要有path。否则就要给目标主机上配置文件的全路径
   ensure => file,
   source => '/root/manifests/redis.conf',
   owner => 'redis',		# 文件属主
   group => 'root',			# 文件属组
   mode => '0644',			# 文件权限
}
[root@puppet manifests]# puppet apply -v --noop file1.pp 
Notice: Compiled catalog for puppet in environment production in 0.07 seconds
Info: Applying configuration version '1548905958'
Notice: /Stage[main]/Main/File[/etc/redis.conf]/content: current_value {md5}d98629fded012cd2a25b9db0599a9251, should be {md5}1a1a5828970c05c20bb80d5930c66f12 (noop)
Notice: /Stage[main]/Main/File[/etc/redis.conf]/mode: current_value 0640, should be 0644 (noop)
Notice: Class[Main]: Would have triggered 'refresh' from 2 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.04 seconds
[root@puppet manifests]# puppet apply -v --debug file1.pp
# 这样只会改变文件，但服务不会重启
[root@puppet manifests]# grep -E -v "^$|^#" /etc/redis.conf 
bind 0.0.0.0
requirepass centos
# 可以看到本机的redis配置文件已被修改了
```



##### 通知&订阅

```shell
* 方法一
[root@puppet manifests]# vim service1.pp 
package{'redis':
   ensure => present,
}
file{'/etc/redis.conf':
   ensure => file,
   source => '/root/manifests/redis.conf',
   require => Package['redis'],
   owner => 'redis',
   group => 'root',
}
service{'redis':
   ensure => running,
   enable => true,
   require => Package['redis'],
   subscribe => File['/etc/redis.conf'],
# 订阅前面的资源，如果前面发生改变就通知后面的资源，服务会重启。notify和subscribe是通知相关的其它资源进行“刷新”操作
}
[root@puppet manifests]# vim redis.conf
requirepass 123456
# 改一下模板的密码
[root@puppet manifests]# puppet apply -v service1.pp  
Notice: Compiled catalog for puppet in environment production in 0.41 seconds
Warning: The package type's allow_virtual parameter will be changing its default value from false to true in a future release. If you do not want to allow virtual packages, please explicitly set allow_virtual to false.
   (at /usr/share/ruby/vendor_ruby/puppet/type.rb:816:in `set_default')
Info: Applying configuration version '1548906366'
Info: /Stage[main]/Main/File[/etc/redis.conf]: Filebucketed /etc/redis.conf to puppet with sum 1a1a5828970c05c20bb80d5930c66f12
Notice: /Stage[main]/Main/File[/etc/redis.conf]/content: content changed '{md5}1a1a5828970c05c20bb80d5930c66f12' to '{md5}3a3222440b0c68afc02b378da96a22b7'
Notice: /Stage[main]/Main/File[/etc/redis.conf]/mode: mode changed '0644' to '0640'
Info: /Stage[main]/Main/File[/etc/redis.conf]: Scheduling refresh of Service[redis]
Info: /Stage[main]/Main/File[/etc/redis.conf]: Scheduling refresh of Service[redis]
Notice: /Stage[main]/Main/Service[redis]: Triggered 'refresh' from 2 events
Notice: Finished catalog run in 0.25 seconds
# 提示会刷新服务，对服务来说刷新就是重启
[root@puppet manifests]# grep -E -v "^$|^#" /etc/redis.conf                 
bind 0.0.0.0
requirepass 123456
# 密码变了
[root@puppet manifests]# redis-cli 
127.0.0.1:6379> AUTH 123456
OK
# 密码生效了，说明服务重启了
[root@puppet manifests]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128    *:6379                   *:* 
# 监听地址也改变了

* 方法二
[root@puppet manifests]# vim service1.pp
package{'redis':
   ensure => present,
   allow_virtual => false,	
} ->		# 表示package在file之前执行
file{'/etc/redis.conf':
   ensure => file,
   source => '/root/manifests/redis.conf',
   owner => 'redis',
   group => 'root',
} ~>		# 表示通知后面的service
service{'redis':
   ensure => running,
   enable => true,
}

* 方法三
[root@puppet manifests]# vim service1.pp                    
package{'redis':
   ensure => present,
   allow_virtual => false,
} 
file{'/etc/redis.conf':
   ensure => file,
   source => '/root/manifests/redis.conf',
   owner => 'redis',
   group => 'root',
}
# 从源文件路径中将文件复制到file指定的目标路径
service{'redis':
   ensure => running,
   enable => true,
}
Package['redis'] -> File['/etc/redis.conf'] ~> Service['redis']
# 也可以在最下面单独定义通知和依赖关系，感觉这种方法使逻辑更清晰
[root@puppet manifests]# vim redis.conf
bind 127.0.0.1
[root@puppet manifests]# puppet apply -v service1.pp 
Notice: Compiled catalog for puppet in environment production in 0.38 seconds
Info: Applying configuration version '1548907154'
Info: /Stage[main]/Main/File[/etc/redis.conf]: Filebucketed /etc/redis.conf to puppet with sum 3a3222440b0c68afc02b378da96a22b7
Notice: /Stage[main]/Main/File[/etc/redis.conf]/content: content changed '{md5}3a3222440b0c68afc02b378da96a22b7' to '{md5}632baae21fab969118a56acd6b389543'
Info: /Stage[main]/Main/File[/etc/redis.conf]: Scheduling refresh of Service[redis]
Notice: /Stage[main]/Main/Service[redis]: Triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.22 seconds
[root@puppet manifests]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128    127.0.0.1:6379                   *:* 
# 可以看到服务重启了。但有些服务是不能重启的，如nginx。要在定义资源时写restart为nginx -s reload，改restart命令，不让其重启
```





##### 生成指定信息的文件

```shell
[root@puppet manifests]# vim file2.pp
file{'/tmp/test.txt':		# 生成/tmp/test.txt文件
   ensure => file,		# 这里也可以用persent
   content => 'Hello there',		# 文件还可以基于content生成，用/n可换行
}
# 使用content生成文件信息，写入到file指定的目标文件中
[root@puppet manifests]# puppet apply file2.pp 
Notice: Compiled catalog for puppet in environment production in 0.07 seconds
Notice: /Stage[main]/Main/File[/tmp/test.txt]/ensure: defined content as '{md5}e8ea7a8d1e93e8764a84a0f3df4644de'
Notice: Finished catalog run in 0.04 seconds
[root@puppet manifests]# cat /tmp/test.txt 
Hello there
```



##### 生成软链接

```shell
[root@puppet manifests]# vim file3.pp
file{'/tmp/test.txt.link':		# 生成链接文件
   ensure => link,		# 链接文件类型
   target => '/tmp/test.txt',		# 指定源文件路径
}
[root@puppet manifests]# puppet apply file3.pp 
Notice: Compiled catalog for puppet in environment production in 0.07 seconds
Notice: /Stage[main]/Main/File[/tmp/test.txt.link]/ensure: created
Notice: Finished catalog run in 0.03 seconds
[root@puppet manifests]# ll /tmp
lrwxrwxrwx 1 root root 13 Jan 31 12:09 test.txt.link -> /tmp/test.txt
```



##### 复制目录

```shell
[root@puppet manifests]# vim file4.pp
file{'/tmp/pam.d':
   ensure => directory,
   source => '/etc/pam.d',
   recurse => true,		# 表示递归复制整个目录
}
# 如果不用source和recurse，那么就会创建一个空目录。测试不用recurse也会创建一个pam.d的空目录。
[root@puppet manifests]# puppet apply file4.pp
[root@puppet manifests]# ll /tmp/pam.d/
total 108
# 可以看到目录被复制了
```



#### 执行命令

##### 基本执行

```shell
[root@puppet manifests]# vim exec1.pp
exec{'mkdir':		# mkdir不能当命令用，如果要当，要加路径
   command => 'mkdir /tmp/testdir',
   path => '/bin:/sbin:/usr/bin:/usr/sbin',		# 一定要给定命令路径
   creates => '/tmp/testdir',		
# 只有在此目录不存在时才执行。对于目录或文件路径类的操作资源来讲，可以用creates来判断，如果不存在才创建
}
[root@puppet manifests]# puppet apply -v exec1.pp 
Notice: Compiled catalog for puppet in environment production in 0.02 seconds
Info: Applying configuration version '1548908746'
Notice: /Stage[main]/Main/Exec[mkdir]/returns: executed successfully
Notice: Finished catalog run in 0.06 seconds
[root@puppet manifests]# ls /tmp/
testdir
# 命令执行了
# 如果文件中不加creates一项，执行时会报错，因为已经有目录了，这个命令是不幂等的。如果有creates一项，就不会报错了
```



##### 判断执行

```shell
[root@puppet manifests]# vim exec2.pp 
exec{'adduser':
   command => 'useradd -r mogilefs',
   path => '/bin:/sbin:/usr/bin:/usr/sbin',
   unless => 'id mogilefs',		# unless表示其指定的命令执行失败了才执行上面的创建用户命令
}
[root@puppet manifests]# puppet apply exec2.pp 
Notice: Compiled catalog for puppet in environment production in 0.02 seconds
Notice: /Stage[main]/Main/Exec[adduser]/returns: executed successfully
Notice: Finished catalog run in 0.08 seconds
[root@puppet manifests]# id mogilefs
uid=442(mogilefs) gid=442(mogilefs) groups=442(mogilefs)
# 命令执行成功了
[root@puppet manifests]# puppet apply exec2.pp 
Notice: Compiled catalog for puppet in environment production in 0.02 seconds
Notice: Finished catalog run in 0.06 seconds
# 再次执行时，就不会再执行文件中的命令了

[root@puppet manifests]# vim exec2.pp
package{'mogilefs':
   ensure => latest,
}
exec{'adduser':
   command => 'useradd -r mogilefs',
   path => '/bin:/sbin:/usr/bin:/usr/sbin',
   unless => 'id mogilefs',
   refreshonly => true,
# refreshonly作用是让exec仅在其他资源用notify或subscribe事件通知时才会执行，如果被通知多次就执行多次。
   subscribe => Package['mogilefs'],
# 定义何时执行，Package表示其指定的包安装后才执行
}
[root@puppet manifests]# userdel -r mogilefs
[root@puppet manifests]# puppet apply -v exec2.pp   
Notice: Compiled catalog for puppet in environment production in 0.27 seconds
Info: Applying configuration version '1548909636'
Error: Could not update: Execution of '/usr/bin/yum -d 0 -e 0 -y list mogilefs' returned 1: Error: No matching Packages to list
Wrapped exception:
Execution of '/usr/bin/yum -d 0 -e 0 -y list mogilefs' returned 1: Error: No matching Packages to list
Error: /Stage[main]/Main/Package[mogilefs]/ensure: change from absent to latest failed: Could not update: Execution of '/usr/bin/yum -d 0 -e 0 -y list mogilefs' returned 1: Error: No matching Packages to list
Notice: /Stage[main]/Main/Exec[adduser]: Dependency Package[mogilefs] has failures: true
Warning: /Stage[main]/Main/Exec[adduser]: Skipping because of failed dependencies
Notice: Finished catalog run in 4.67 seconds
# 提示没有程序包，不能执行
[root@puppet manifests]# id mogilefs
id: mogilefs: no such user
```



#### 定时任务

```shell
[root@puppet manifests]# vim cron1.pp
cron{'synctime':
   command => '/usr/sbin/ntpdate ntp.ubuntu.com &> /dev/null',		# 要执行的命令
   name => 'synctime from ntp server',
   minute => '*/3',		# 每3分钟执行一次
# 上面三个是必须给的属性，不给定用户，就是给当前用户的定时任务
   ensure => present,		# absent表示删除，persent表示添加
}
[root@puppet manifests]# puppet apply -v cron1.pp 
Notice: Compiled catalog for puppet in environment production in 0.03 seconds
Info: Applying configuration version '1548910460'
Notice: /Stage[main]/Main/Cron[synctime]/ensure: created
Notice: Finished catalog run in 0.09 seconds
[root@puppet manifests]# crontab -l
*/3 * * * * /usr/sbin/ntpdate ntp.ubuntu.com &> /dev/null
# 添加了定时任务
# 如果将上面改为ensure => absent，再执行一次puppet就会删除定时任务。
```



#### 显示提示信息

```shell
[root@puppet manifests]# vim notify1.pp
notify{'sayhi':
   message => 'How old are you',
   name => 'sayhi',
}
# notify是显示提示信息的，信息会发送到日志中
[root@puppet manifests]# puppet apply notify1.pp 
Notice: Compiled catalog for puppet in environment production in 0.01 seconds
Notice: How old are you
Notice: /Stage[main]/Main/Notify[sayhi]/message: defined 'message' as 'How old are you'
Notice: Finished catalog run in 0.04 seconds
# 结果中有Notify:后是message定义的信息
```



#### 变量

```shell
==============================================================================================
定义变量：以$开头，如：$system、$flag
赋值：=  ，如：$one = "first one"

引用变量：有三种方法如下
$var = "Hello World!"
notice "1.$var"
notice "2.${var}"
notice "3.$::var"
==============================================================================================
[root@puppet manifests]# facter -p
# 收集打印当前系统上的所有变量，这些变量会传递给puppet主机
[root@puppet manifests]# vim user3.pp
[root@puppet manifests]# vim user3.pp             
$username = "test"

group{"$username":		# 在使用变量时要用双引号引用
   ensure => present,
   system => true,
} ->
user{"$username":
   ensure => present,
   gid => "$username",
}
[root@puppet manifests]# puppet apply -v user3.pp
Notice: Compiled catalog for puppet in environment production in 0.12 seconds
Info: Applying configuration version '1548913706'
Notice: /Stage[main]/Main/Group[test]/ensure: created
Notice: /Stage[main]/Main/User[test]/ensure: created
Notice: Finished catalog run in 0.08 seconds.
[root@puppet manifests]# id test
uid=1000(test) gid=896(test) groups=896(test)
[root@puppet manifests]# grep test /etc/group
test:x:896:
```



#### 正则表达式

```shell
语法结构：

/(?<ENABLED OPTION>:<SUBPATTERN>)/
/(?-<DISABLED OPTION>:<SUBPATTERN>)/

OPTION：
i: 忽略字符大小写
m: 把点号当换行符使用
x：忽略模式中的空白字符和注释

惯常用法：(?i-mx:PATTERN)
$webpackage=$operatingsystem? {
       /(?i-mx:ubuntu|debian)/ => ‘apache2‘,
       /(?i-mx:fedora|redhat|centos)/  => ‘httpd‘,
}
```



#### 判断语句

##### if判断

```shell
==============================================================================================
语法一
if 条件 {
语句
}

条件：是true执行语句，是false则跳过语句

语法二
if CONDITION {
...
} else {
...
}

语法三
if CONDITION {
...
} elsif CONDITION {
...
}
...
else {
...
}

例
if $operatingsystem =~ /^(?i-mx:(Ubuntu|RedHat))/ {
       notice("Welcome to $1 linux distribution.")
} else {
       notice("Welcome to unkown world.")
}
==============================================================================================
[root@puppet manifests]# vim if.pp
if $operatingsystem == 'CentOS' {
   package{'nginx':
      ensure => present,
      allow_virtual => false,
   }
}
[root@puppet manifests]# puppet apply -v --noop if.pp 
Notice: Compiled catalog for puppet in environment production in 0.22 seconds
Info: Applying configuration version '1548914166'
Notice: /Stage[main]/Main/Package[nginx]/ensure: current_value absent, should be present (noop)
Notice: Class[Main]: Would have triggered 'refresh' from 1 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.13 seconds

[root@puppet manifests]# vim if.pp
if $operatingsystem == 'Fedora' {
   package{'nginx':
      ensure => present,
      allow_virtual => false,
   }
} else {
   notify{'goaway':
      message => 'allien',
   }
}
[root@puppet manifests]# puppet apply -v --noop if.pp 
Notice: Compiled catalog for puppet in environment production in 0.01 seconds
Info: Applying configuration version '1548914282'
Notice: /Stage[main]/Main/Notify[goaway]/message: current_value absent, should be allien (noop)
Notice: Class[Main]: Would have triggered 'refresh' from 1 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.04 seconds
# 执行了message
```



##### unless判断

```shell
==============================================================================================
语法
unless 条件 {
语句
}
条件：当false时，执行语句。当true时跳过。
==============================================================================================
例
$varless = 100
unless $varless > 1000 {
  notice "$varless > 1000 is false"
}
```



##### case判断

```shell
==============================================================================================
语法
case 变量/表达式 {
值1 : {语句1}
值2,值3 : {语句2}
default : {不是上面的值时，执行这条语句}
}
==============================================================================================
[root@puppet manifests]# vim case.pp
case $operatingsystem {
   RedHat,CentOS,Fedora: { $webserver = 'httpd' }
   /(?i-mx:debian|ubuntu)/: { $webserver = "apache2" }
   default: { $webserver = 'httpd' }
# 如果是RedHat等，就定义webserver变量为httpd，如果是debian等，就为apache2，否则就为httpd
}
package{"$webserver":
   ensure => latest,
   allow_virtual => false,
}
[root@puppet manifests]# puppet apply -v case.pp           
Notice: Compiled catalog for puppet in environment production in 0.23 seconds
Info: Applying configuration version '1548915048'
Notice: /Stage[main]/Main/Package[httpd]/ensure: created
Notice: Finished catalog run in 8.68 seconds
[root@puppet manifests]# rpm -q httpd
httpd-2.4.6-88.el7.centos.x86_64
```



##### selector判断

```shell
==============================================================================================
语法
未知变量 = 可知变量 ? {
值1 => 赋值1,
值2 => 赋值2,
default => 赋值3,
}
==============================================================================================
[root@puppet manifests]# vim selector.pp
$webserver = $operatingsystem ? {
   /(ubuntu|debian)/ => 'apache2',
   /(?i-mx:centos|redhat|fedora)/ => 'httpd',
# 
   default => 'httpd',
}
package{"$webserver":
   ensure => present,
   allow_virtual => false,
}
# 用这种方法也可以判断，判断operatingsystem是什么，然后赋值给webserver。
[root@puppet manifests]# yum remove httpd -y
[root@puppet manifests]# puppet apply selector.pp 
Notice: Compiled catalog for puppet in environment production in 0.23 seconds
Notice: /Stage[main]/Main/Package[httpd]/ensure: created
Notice: Finished catalog run in 9.19 seconds
[root@puppet manifests]# rpm -q httpd
httpd-2.4.6-88.el7.centos.x86_64
```



#### 类

```shell
==============================================================================================
语法
class name {
... puppet code ...
}
# 定义过的类只有被调用(声明)才会执行；
# 类名可以包含小写字母、数字和下划线，但只能小写字母开头；
# 类会引入新的变量作用域；
==============================================================================================
[root@puppet manifests]# vim class1.pp
class nginx {
   package{'nginx':
      ensure => latest,
      allow_virtual => false,
   } ->
   service{'nginx':
      ensure => running,
      enable => true,
   }
}
include nginx
# 一定要使用include来调用，不然是不能执行的
[root@puppet manifests]# puppet apply -v --noop class1.pp 
Notice: Compiled catalog for puppet in environment production in 0.33 seconds
Info: Applying configuration version '1548917037'
Notice: /Stage[main]/Nginx/Package[nginx]/ensure: current_value absent, should be latest (noop)
Notice: /Stage[main]/Nginx/Service[nginx]/ensure: current_value stopped, should be running (noop)
Info: /Stage[main]/Nginx/Service[nginx]: Unscheduling refresh on Service[nginx]
Notice: Class[Nginx]: Would have triggered 'refresh' from 2 events
Notice: Stage[main]: Would have triggered 'refresh' from 1 events
Notice: Finished catalog run in 0.19 seconds

[root@puppet manifests]# vim class2.pp
class dbserver ($pkgname='mariadb-server') {
# 类有一个参数是$pkgname，mariadb-server是它的默认值。如果传递值给pkgname，就用传递的值，如果没传，就用默认值
   package{"$pkgname":
      ensure => latest,
      allow_virtual => false,
   }
   service{'mariadb.service':
# 这里要写成mariadb.service，不然会无法启动。测试中，将这里写成mariadb，并在下面加上name => 'mariadb.service'也是不行的，系统还是会提示service中的mariadb启动。会提示找不到。
      ensure => running,
      enable => true,
   }
}
# 如果没有定义pkgname的默认值并调用dbserver类，它会不知道包名是什么。如果定义了默认值，在CentOS7上就可以执行了
if $operatingsystem == "CentOS" {
   $dbpkg = $operatingsystemmajrelease ? {
      7 => 'mariadb-server',
      default => 'mysqld-server',
   }
}
# 判断，如果操作系统是CentOS，并且嵌套判断，如果是7版本，就返回mariadb-server给$dbpkg，否则，就返回mysqld-server
class{'dbserver':		# 给dbserver类的参数传值
   pkgname => $dbpkg,		# 这里也可以是一个具体的值，用单引号引起
}
# 使用class{'dbserver':传递值也是调用类的一种方法
# 如果类的参数没有默认值，也可以用这种方法给参数传递值
# 这样都定义完才能实现根据不同系统安装不同名称的程序包
```



#### 类的继承

```shell
[root@puppet manifests]# cp class1.pp class3.pp
[root@puppet manifests]# vim class3.pp
class nginx {
   package{'nginx':
      ensure => latest,
      allow_virtual => false,
   } ->
   service{'nginx':
      ensure => running,
      enable => true,
      require => Package['nginx'],
   }
}
class nginx::web inherits nginx {
   file{'nginx.conf':		# 提供配置文件
      path => '/etc/nginx/nginx.conf',
      source => '/root/manifests/nginx.conf',
   }
   Package['nginx'] -> File['nignx.conf'] ~> Service['nginx']
# 定义Package要先于File资源，最后要通知Service资源
}
# nginx::web是子类的名称，inherits表示继承，最后是父类的名称。这样定义后，子类就能使用父类中定义的内容了
class nginx::webproxy inherits nginx {
   file{'nginx.conf':
      path => '/etc/nginx/nginx.conf',
      source => '/root/manifests/nginx-webproxy.conf',
   }
      Service['nginx']{
      enable => false,
# 修改父类中属性的值，要先引用属性，再写修改的值。修改的项如果有值，就修改其值，如果没有此项，就新增此项。
      require +> File['nginx.conf']		# +>，表示新增一个参数，但不会修改原值，这里表示依赖File属性
   }
   Package['nginx'] -> File['nginx.conf'] ~> Service['nginx']
}
class nginx::mysqlproxy inherits nginx {

}
include nginx::webproxy
# 这里只能引用一个子类，因为如果定义了多个，在本机上就没法确定用哪个子类了
[root@puppet manifests]# yum install -y nginx
[root@puppet manifests]# cp /etc/nginx/nginx.conf /root/manifests
[root@puppet manifests]# cp nginx.conf nginx-webproxy.conf
[root@puppet manifests]# vim nginx-webproxy.conf 
location / {
           proxy_pass http://192.168.1.71;
        }
[root@puppet manifests]# yum remove -y nginx
[root@puppet manifests]# puppet apply -v class3.pp

--------------------
  192.168.1.71
--------------------
[root@puppettest1 ~]# yum install nginx -y
[root@puppettest1 ~]# vim /usr/share/nginx/html/test.html
192.168.1.71
[root@puppettest1 ~]# systemctl start nginx

访问http://192.168.1.70/test.html，可以看到页面上显示192.168.1.71了。
```



#### puppet模板

```shell
[root@puppet manifests]# vim template.pp
package{'nginx':
   ensure => latest,
}
file{'nginx.conf':
   path => '/etc/nginx/nginx.conf',
   content => template('/root/manifests/nginx.conf.erb'),
# content表示直接生成内容，template是内建的函数，用它去加载一个指定的模板
}
[root@puppet manifests]# cp nginx.conf nginx.conf.erb
[root@puppet manifests]# vim nginx.conf.erb 
worker_processes <%=  @processorcount %>;
# processorcount是变量名称，变量是内建的，与auto相同，通过facter -p processorcount命令可以查看到信息。等号是变量替换
[root@puppet manifests]# puppet apply -v template.pp
[root@puppet manifests]# less /etc/nginx/nginx.conf           
worker_processes 2;
# 使用模板后，这里变为了2
```



#### 模块

```shell
[root@puppet manifests]# vim /etc/puppet/puppet.conf
# 配置文件中的[main]表示全局配置段，[agent]表示只用于agent程序
[root@puppet manifests]# puppet help config
# 查看配置文件帮助信息
[root@puppet manifests]# puppet config print
# 打印puppet配置信息。其中的modulepath是模块的路径
[root@puppet manifests]# puppet config print modulepath
/etc/puppet/modules:/usr/share/puppet/modules
# 只显示modulepath一项
[root@puppet manifests]# puppet help module
# 查看模块配置帮助
[root@puppet manifests]# puppet module list
/etc/puppet/modules (no modules installed)
/usr/share/puppet/modules (no modules installed)
# 查看模块信息
[root@puppet manifests]# puppet module search nginx
Notice: Searching https://forgeapi.puppetlabs.com ...
# 到互联网搜索与nginx相关的模块
[root@puppet manifests]# puppet module install oris-nginx
Notice: Preparing to install into /etc/puppet/modules ...
Notice: Downloading from https://forgeapi.puppetlabs.com ...
Notice: Installing -- do not interrupt ...
/etc/puppet/modules
└─┬ oris-nginx (v1.3.0)
  ├─┬ puppetlabs-apt (v6.3.0)
  │ └── puppetlabs-translate (v1.2.0)
  └── puppetlabs-stdlib (v5.2.0)
# 安装模块oris-nginx
[root@puppet ~]# mkdir modules
[root@puppet ~]# cd modules/
[root@puppet modules]# mkdir -pv chrony/{manifests,files,templates,lib,spec,tests}
[root@puppet modules]# cd chrony/manifests/
[root@puppet manifests]# vim init.pp		# 创建清单，名字不能变，都要叫init.pp
class chrony {		# 这个清单中必须有一个与模块名相同的类的名字。模块名就是module目录中的目录的名字
   package{'chrony':
      ensure => latest,
   } ->
   file{'chrony.conf':
      path => '/etc/chrony.conf',
      source => 'puppet:///modules/chrony/chrony.conf',
# 这是源路径，表示/etc/puppet/modules/chrony/files目录，只是files目录是不用写，可以自动找到
   } ~>
   service{'chronyd':
      ensure => running,
      enable => true,
   }
}
[root@puppet manifests]# cp /etc/chrony.conf /root/modules/chrony/files/
[root@puppet modules]# vim chrony/files/chrony.conf
#server 1.centos.pool.ntp.org iburst
#server 2.centos.pool.ntp.org iburst
#server 3.centos.pool.ntp.org iburst
# 注释三行
[root@puppet modules]# cp -a /root/modules/chrony/ /etc/puppet/modules/
# 配置好模块后，要将整个目录都复制到puppet的模块目录。上面创建的modules目录只是为了临时编辑用的，编辑好后是要复制到指定目录的，指定目录是通过puppet config print modulepath命令查看到的两个目录都可以
[root@puppet modules]# puppet module list
/etc/puppet/modules
├── chrony (???)
├── oris-nginx (v1.3.0)
├── puppetlabs-apt (v6.3.0)
├── puppetlabs-stdlib (v5.2.0)
└── puppetlabs-translate (v1.2.0)
/usr/share/puppet/modules (no modules installed)
# 现在就能看到chrony模块了
[root@puppet modules]# puppet apply -v -d --noop -e 'include chrony'
# 使用-e调用模块
[root@puppet modules]# puppet apply -v -e 'include chrony'
[root@puppet modules]# cat /etc/chrony.conf 
# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server 0.centos.pool.ntp.org iburst
#server 1.centos.pool.ntp.org iburst
#server 2.centos.pool.ntp.org iburst
#server 3.centos.pool.ntp.org iburst
# 可以看到配置文件已被修改
[root@puppet modules]# mv /etc/puppet/modules/nginx/ /root
# 移走上面安装的nginx模块
[root@puppet modules]# mkdir -pv nginx/{manifests,files,templates,spec,lib,tests}
[root@puppet modules]# vim nginx/manifests/init.pp		# 定义一个基类
class nginx {
   package{'nginx':
      ensure => latest,
   }
   service{'nginx':
      ensure => running,
      enable => true,
   }
}
[root@puppet modules]# vim nginx/manifests/webproxy.pp
# 定义子类。如果代码较多，可以定义多个子类，但一定要有一个与清单名一样的类名称。参考官方文档，3.8版本以后的版本中，资源清单文件的文件名要与子类名一样
class nginx::webproxy inherits nginx {
   file{'nginx.conf':
      path => '/etc/nginx/nginx.conf',
      source => 'puppet:///modules/nginx/nginx-webproxy.conf',
   }
   Package['nginx'] -> File['nginx.conf'] ~> Service['nginx']
}
[root@puppet modules]# cp /root/manifests/nginx-webproxy.conf nginx/files/
[root@puppet modules]# cp -a nginx/ /etc/puppet/modules/
[root@puppet modules]# puppet module list
/etc/puppet/modules
├── chrony (???)
├── nginx (???)
[root@puppet manifests]# puppet apply -v -d --noop -e 'include nginx::webproxy'
==============================================================================================
注意：
1. puppet 3.8及以后的版本中，资源清单文件的文件名要与文件听类名保持一致，例如某子类名为“base_class::child_class”，其文件名应该为child_class.pp；
2. 无需再资源清单文件中使用import语句；
3. manifests目录下可存在多个清单文件，每个清单文件包含一个类，其文件名同类名；
==============================================================================================
[root@puppet manifests]# pwd
/etc/puppet/modules/nginx/manifests
[root@puppet manifests]# vim web.pp
class nginx::web inherits nginx {
   file{'nginx.conf':
      path => '/etc/nginx/nginx.conf',
      content => 'template('nginx/nginx.conf.erb')',
# 这里应该是一个相对路径，也就是/etc/puppet/modules下的nginx目录，这里可以省略nginx目录中的template目录，直接写template目录中的nginx.conf.erb即可。
   }
   Package['nginx'] -> File['nginx.conf'] ~> Service['nginx']
}
[root@puppet manifests]# cp /root/manifests/nginx.conf.erb ../templates/
[root@puppet manifests]# puppet apply -v -d --noop -e 'include nginx::web'

[root@puppet manifests]# cd /root/modules/
[root@puppet modules]# mkdir -pv redis/{manifests,files,templates,spec,lib,tests}
下载一个redis-3.2.8-1.el7.x86_64.rpm到 /root/modules/redis/tests目录中
[root@puppet modules]# vim redis/manifests/init.pp
class redis {
   $redispkg='redis-3.2.8-1.el7.x86_64.rpm'
   package{'redis':
      ensure => installed,
      provider => yum,
      source => "puppet:///modules/redis/$redispkg",
   }
   service{'redis':
      ensure => running,
      enable => true,
   }
}
[root@puppet modules]# cp -a redis/ /etc/puppet/modules/
[root@puppet modules]# puppet module list
/etc/puppet/modules
├── chrony (???)
├── nginx (???)
├── puppetlabs-apt (v6.3.0)
├── puppetlabs-stdlib (v5.2.0)
├── puppetlabs-translate (v1.2.0)
└── redis (???)
[root@puppet modules]# puppet apply -v -d --noop -e 'include redis'
```



