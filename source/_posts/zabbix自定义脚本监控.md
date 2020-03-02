---
title: zabbix自定义脚本监控
date: 2020-02-21 16:48:37
tags: zabbix
categories: 监控
---

#### Zabbix Server中运行脚本

在实际环境中，你可能无法在监控设备中安装标准的Zabbix agent收集监控数据，通过Externalchecks监控方式，可以在Zabbix server上执行脚本或二进制程序收集监控数据。

在使用这种方式前，需要在zabbix-server.conf配置文件中定义脚本或程序的路径，设置正确的权限能够让Zabbix执行。

```shell
vi /etc/zabbix/zabbix-server.conf
ExternalScripts=/usr/lib/zabbix/externalscripts
```

ExternalScripts 可以使用系统标准的路径，你也可以指定其他路径。在这里我们可以把脚本或程序放在这里，并设置相应的权限。

使用External checks时需要注意以下几点：

- 在Key语法中支持多个逗号分隔的参数。
- 在脚本命令中支持用户定义的宏变量。
- External checks通过标准输出（STDOUT）将错误返回，可以在触发器中进行管理。
- 支持多行的返回值。

通过External checks可以完成很复杂的监控任务，但是在实际环境中使用时要注意服务器性能的问题，每一次脚本执行时需要Zabbix server启动一个进程，当有很多脚本运行时会降低Zabbix server的性能。



#### Zabbix agent中运行脚本

UserParameter是在agent配置文件中定义的。语法如下：

`UserParameter=<key>,<command>`

User parameter由两部分组成，一部分是Key，在这里定义的Key在Zabbix server前端页面中创建item时会用到，并且在引用这个Key的主机中名称必须是唯一的，Key的名称中我们可以使用点或下划线，但不能有空格或其他特殊字符。另一部分是command，是一个可执行的命令或脚本。

在User parameter中定义key时，我们也可以设定参数，这些参数可以传递给命令或脚本。语法是：

`UserParameter=key[*],command`

[*]表示可以传递多个参数，对应[*]中参数的位置，在command中可以使用$1,$2,$3 …$9来引用参数，$0代表command本身。如果在使用的命令行中引用$2这种参数，那就需要变成$$2，例如：awk '{print $$2}'，在这种情况下$$2实际上引用的是$2参数。另外，像$2这些参数你即使用双引号（”）或单引号（‘）括起来，它也会正常解析相应位置的参数。在监控页面定义监控项的名字时也可以用$1...$9引用这里的参数

```shell
UserParameter=ping,echo 1
总是返回1。

UserParameter=ping[*],echo $1
ping[0] 将返回 '0'；ping[aaa] 将返回 'aaa'。

UserParameter=mysql.ping,mysqladmin–uroot -p<password> ping | grep -c alive
如果MySQL运行正常返回1，否则返回0。

UserParameter=mysql.ping[*],mysqladmin-u$1 -p$2 ping | grep -c alive
mysql.ping[zabbix,our_password] 会把用户名和密码传递到命令行中参数引用的位置。

UserParameter=wc[*],grep -c"$2" $1
wc[/etc/services,zabbix]，计算在services文件中包含zabbix的行数，在这里$2用双引号括起来后，在命令行中还是会正确引用相应位置的参数。
```

通常的做法是：

1. 编辑zabbix_agentd.conf配置文件，配置UserParameter选项。比如：

`UserParameter= process.number[*], ps -e |grep $1 | wc -l`

2. 使用zabbix-agentd -t 测试定义的UserParameter

```shell
zabbix_agentd -t process.number[httpd]

process.number                     [t|8]
```

3. 保存agent 配置文件，重启agent.

`systemctl restart zabbix-agent.service`

4.  使用zabbix_get工具测试：

```shell
zabbix_get -s 127.0.0.1 -k process.number[httpd]
8
```

5. 在Zabbix server中的主机上创建一个新的监控项。类型可以是Zabbix agent或者Zabbix agent（active）。



#### 实例

