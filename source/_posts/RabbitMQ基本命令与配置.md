---
title: RabbitMQ基本命令与配置
date: 2018-10-19 09:19:56
tags: RabbitMQ基本命令与配置
categories: 消息队列
---

#### 命令

##### rabbitmq server命令

```shell
systemctl start rabbitmq-server
systemctl stop rabbitmq-server
systemctl status rabbitmq-server
systemctl rotate-logs rabbitmq-server
systemctl restart rabbitmq-server
systemctl condrestart rabbitmq-server
systemctl try-restart rabbitmq-server
systemctl reload rabbitmq-server
systemctl force-reload rabbitmq-server
# rabbitmq默认监听5672端口，网页管理页面监听15672端口
```

##### 插件 

```shell
* 语法
** 开启插件
rabbitmq-plugins enable 插件名
** 关闭插件
rabbitmq-plugins disable 插件名
rabbitmq-plugins enable rabbitmq_management
# 开启rabbitmq web管理页面插件
```

##### rabbitmqctl命令

```shell
* 创建用户，设置密码
rabbitmqctl add_user username password

* 分配用户标签-设置为管理用户。默认用户名密码为guest
rabbitmqctl set_user_tags username tag
# Tag可以为：administrator,monitoring, management等

* 查看现有用户信息
rabbitmqctl list_users

* 删除用户
rabbitmqctl delete_user username

* 修改用户密码
rabbitmqctl change_password username password

* 查看所有队列消息
rabbitmqctl list_queues

* 清除所有队列
rabbitmqctl reset

* 新建虚拟机
rabbitmqctl add_vhost  虚拟机名

* 撤销虚拟机
rabbitmqctl delete_vhost 虚拟机名

* 服务器状态
rabbitmqctl status


```

##### 防火墙设置

```shell
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 15672 -j ACCEPT
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 25672 -j ACCEPT
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 5672 -j ACCEPT
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 4369 -j ACCEPT
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 5671 -j ACCEPT
```

#### rabbitmq配置

##### **RabbitMQ支持三种配置方式：**

* 读取环境变量中配置， 这包括shell中环境变量和rabbitmq-env.conf/rabbitmq-env-conf.bat文件中配置的环境变量

&emsp;&emsp;可配置如端口、配置文件指定自定义位置、节点名字等信息。

* 读取配置文件rabbitmq.config

&emsp;&emsp;可配置权限、集群、插件设置等高级信息， 当然也可配置端口等简单信息

* 通过运行命令时指定参数

&emsp;&emsp;通常用来配置集群范围信息， 用来运行时动态传入



##### **环境变量读取优先级**

* 读取shell中环境变量

* 读取rabbitmq-env.conf/rabbitmq-env-conf.bat中的

* 读取默认的

 

##### **rabbitmq-env.conf/rabbitmq-env-conf.bat 详解（颜色标注的为常用配置）**

| 变量名称                            | 默认值                                                       | 描述                                                         |
| :---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| RABBITMQ_NODE_IP_ADDRESS            | 默认为空字符串， 即绑定所有网络接口                          | 如果想绑定到一个固定的IP可以使用此变量. 如果要绑定到两个或两个以上只能通过rabbitmq.config中的tcp_listeners来设置。 |
| RABBITMQ_NODE_PORT                  | 5672                                                         | 供客户端建立连接端口                                         |
| RABBITMQ_DIST_PORT                  | RABBITMQ_NODE_PORT + 20000                                   | 用于节点和CLI工具连接的端口， 如果rabbitmq.config中配置了kernel.inet_dist_listen_min 或 kernel.inet_dist_listen_max该参数将被忽略 |
| RABBITMQ_NODENAME                   | Unix*: rabbit@$HOSTNAMEWindows: rabbit@%COMPUTERNAME%        | 节点名字， 必须唯一                                          |
| RABBITMQ_CONF_ENV_FILE              | Generic UNIX - $RABBITMQ_HOME/etc/rabbitmq/Debian - /etc/rabbitmq/RPM - /etc/rabbitmq/Mac OS X (Homebrew) - ${install_prefix}/etc/rabbitmq/, the Homebrew prefix is usually /usr/localWindows - %APPDATA%\RabbitMQ\ | rabbitmq-env.conf/rabbitmq-env-conf.bat 默认位置， 不同系统不同安装方式位置也不同， 如果默认位置没找到则需在该位置手动创建一个 |
| RABBITMQ_CONFIG_FILE                | 同上                                                         | rabbitmq.config 默认位置。 如果默认位置没找到则需在该位置手动创建一个 |
| RABBITMQ_USE_LONGNAME               | 官网没说。。。。应该是false。。。                            | 取值： true 或 false。  如果配置为true， 这将导致RabbitMQ使用完全限定的名称来标识节点 |
| RABBITMQ_SERVICENAME                | Windows Service: RabbitMQ                                    | 服务名称                                                     |
| RABBITMQ_CONSOLE_LOG                | 只在控制台输出日志， 日志不会持久化到文件                    | 取值： new 或 reuse。两种取值都是将控制台输出从服务器重定向到名为%rabbitmqservicename%（上面那个变量）的文件。　　1）默认： 不设置， 控制台的日志不会被持久化到文件　　2）new： 每次启动时都会创建一个新的文件　　3）reuse： 每次启动服务器都会重用该日志文件 |
| RABBITMQ_CTL_ERL_ARGS               | None                                                         | 在调用rabbitmqctl时使用的erl命令的参数。应该仅用于调试目的。 |
| RABBITMQ_SERVER_ERL_ARGS            | Unix*:"+K true +A30 +P 1048576 -kernel inet_default_connect_options [{nodelay,true}]"Windows: None | 在调用RabbitMQ服务器时使用的erl命令的标准参数， 应该仅用于调试目的 |
| RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS | Unix*: NoneWindows: None                                     | 在调用RabbitMQ服务器时使用的erl命令的附加参数。这个变量的值被附加到参数的默认列表(RABBITMQ_SERVER_ERL_ARGS). |
| RABBITMQ_SERVER_START_ARGS          | None                                                         | 在调用RabbitMQ服务器时使用的erl命令的额外参数。这不会覆盖RABBITMQ_SERVER_ERL_ARGS. |
| HOSTNAME                            | Unix, Linux: `env hostname`MacOSX: `env hostname -s`         | 当前机器名称                                                 |
| COMPUTERNAME                        | Windows: localhost                                           | 当前机器名称， windows使用该变量                             |
| ERLANG_SERVICE_MANAGER_PATH         | Windows Service: %ERLANG_HOME%\erts-x.x.x\bin                | erlsrv.exe的路径， erlsrv.exe这个是erlang服务的包装脚本      |

###  

##### **rabbitmq.config详解（核心配置）**

&emsp;&emsp;该配置文件使用的是Erlang标准配置文件，语法请参照[这里](http://erlang.org/doc/man/config.html)

```
例： 
  [
    {rabbit, [{tcp_listeners, [5673]}]}
  ].
```

 

| key                                            | 描述                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| tcp_listeners                                  | 监听AMQP连接的端口或主机/对。 Default: [5672]                |
| num_tcp_acceptors                              | Erlang进程的数量，接受TCP监听器的连接数。 Default: 10        |
| handshake_timeout                              | 对AMQP 0-8/0-9/0-9-1握手的最大时间(在套接字连接和SSL握手之后)，以毫秒为间隔 Default: 10000 |
| ssl_listeners                                  | 如上所述，用于SSL连接。 Default: []                          |
| num_ssl_acceptors                              | 用于接受SSL监听连接的Erlang进程的数量。 Default: 1           |
| ssl_options                                    | SSL配置参数. 详情请看 [SSL documentation](http://www.rabbitmq.com/ssl.html#enabling-ssl).Default: [] |
| ssl_handshake_timeout                          | SSL握手超时，以毫秒为间隔。 Default: 5000                    |
| vm_memory_high_watermark                       | 触发流控制的内存阈值。详情请看 [memory-based flow control](http://www.rabbitmq.com/memory.html).Default: 0.4 |
| vm_memory_high_watermark_paging_ratio          | 设置当内存使用超过总内存百分比多少时，队列开始将消息持久化到磁盘以释放内存。 详情请看 [memory-based flow control](http://www.rabbitmq.com/memory.html).Default: 0.5 |
| disk_free_limit                                | RabbitMQ存储数据的分区的磁盘空间限制。当可用的磁盘空间低于这个限制时，就会触发流控制。值可以相对于RAM的总数设置(例如，内存比例，1.0)。该值也可以设置为整数的字节数。或者，单位(例如“50 mb”)。默认情况下，空闲磁盘空间必须超过50MB。详情请看 [Disk Alarms](http://www.rabbitmq.com/disk-alarms.html).Default: 50000000 |
| log_levels                                     | 控制日志的粒度。该值是一个日志事件类别和日志级别对的列表。 可设置级别：　　'none'　　'error'　　'warning'　　'info' 　　'debug' 　　以上下一层级别的日志输出均包含上层级别日志输出（如： warning包含warning和error）, none为不输出日志 另外，当前未分类的事件总是记录在日志中The categories are:channel - 所有与AMQP通道有关的事件connection - 对于所有与网络连接有关的事件federation - 对于所有与[federation](http://www.rabbitmq.com/federation.html)有关的事件mirroring - 对于与镜像队列相关的所有事件Default: [{connection, info}] |
| frame_max                                      | 框架最大允许大小(以字节为单位)与消费者进行数据交换。设置为0意味着“无限”，但会在一些QPid客户端触发一个bug。设置更大的值可能会提高吞吐量;设置较小的值可能会提高延迟。Default: 131072 |
| channel_max                                    | 与消费者进行谈判的最大允许数量。设置为0意味着“无限”。使用更多的通道会增加代理的内存占用。Default: 0 |
| channel_operation_timeout                      | 通道操作超时为毫秒(内部使用，由于消息传递协议的差异和限制而不直接暴露于客户机)。 Default: 15000 |
| heartbeat                                      | 该值表示服务器在连接中发送的心跳延迟，在几秒钟内。优化框架。如果设置为0，则会禁用心跳。客户端可能不会遵循服务器的建议，请参阅AMQP参考以了解更多细节。在有大量连接的情况下，禁用心跳可能改善性能，但可能会导致连接在关闭非活动连接的网络设备的出现。Default: 60 (580 prior to release 3.5.5) |
| default_vhost                                  | 当RabbitMQ创建一个新的数据库时，创建一个虚拟主机。交换amq.rabbitmq.logwill存在于这个虚拟主机中。Default: <<"/">> |
| default_user                                   | 当RabbitMQ从头创建一个新数据库时，要创建用户名。  Default: <<"guest">> |
| default_pass                                   | 默认用户的密码。 Default: <<"guest">>                        |
| default_user_tags                              | 默认用户的标记。 Default: [administrator]                    |
| default_permissions                            | 在创建时分配给默认用户的权限。 Default:  [<<".*">>, <<".*">>, <<".*">>] |
| loopback_users                                 | 只允许通过环回接口连接到代理的用户列表(即localhost)。 如果您希望允许缺省的来宾用户远程连接，则需要将其更改为 [].Default:  [<<"guest">>] |
| cluster_nodes                                  | 当一个节点开始第一次启动时，将它设置为使集群自动发生。元组的第一个元素是节点试图集群到的节点。第二个元素是磁盘或ram，并确定节点类型。 Default: {[], disc} |
| server_properties                              | 键值对的列表，在连接上向客户端宣布。 Default: []             |
| collect_statistics                             | 统计数据收集模式。主要与管理插件有关。选项有: none (不要发布统计数据)coarse (发出每个队列/每个通道/每个连接统计信息)fine (发出的每条数据)通常情况下不需要设置该参数 Default: none |
| collect_statistics_interval                    | 统计数据收集间隔以毫秒为间隔。 主要相关插件 [management plugin](http://www.rabbitmq.com/management.html#statistics-interval).Default: 5000 |
| management_db_cache_multiplier                 | 管理插件将缓存诸如队列清单之类的代价较高的查询的时间。缓存将把最后一个查询的运行时间乘以这个值，并在此时间内缓存结果。 Default: 5 |
| auth_mechanisms                                | [SASL authentication mechanisms](http://www.rabbitmq.com/authentication.html) to offer to clients.Default: ['PLAIN', 'AMQPLAIN'] |
| auth_backends                                  | List of [authentication and authorisation backends](http://www.rabbitmq.com/access-control.html) to use.Other databases than rabbit_auth_backend_internalare available through [plugins](http://www.rabbitmq.com/plugins.html).Default: [rabbit_auth_backend_internal] |
| reverse_dns_lookups                            | 设置为true，让RabbitMQ对客户端连接执行反向DNS查找，并通过rabbitmqctl和管理插件呈现该信息。 Default: false |
| delegate_count                                 | 用于集群内部通信的委托进程的数量。当为多核CPU时可以考虑设置该值 Default: 16 |
| trace_vhosts                                   | Used internally by the [tracer](http://www.rabbitmq.com/firehose.html). 通常情况下不需要设置该参数Default: [] |
| tcp_listen_options                             | 默认的套接字选项。通常情况下不需要设置该参数 Default:`[{backlog,       128},  {nodelay,       true},  {linger,        {true,0}},  {exit_on_close, false}]                 ` |
| hipe_compile                                   | 设置为true，使用HiPE预编译RabbitMQ的部分，这是Erlang的即时编译器。这将增加服务器的吞吐量，以增加启动时间的成本。 您可能会看到，在启动时延迟几分钟，您的性能会提高20-50%。这些数据是高度工作负载和硬件依赖的。HiPE支持可能不会编译到您的Erlang安装中。如果不是这样，启用这个选项只会导致一个警告消息被显示，而启动将照常进行。例如，Debian/Ubuntu用户需要安装erlangbase-base-hipe包。HiPE在某些平台上是不可用的，尤其是Windows。HiPE在17.5之前就已经知道了erlangp/otp版本的问题。HiPE推荐使用最新的erlangp/otp版本Default: false |
| cluster_partition_handling                     | 如何处理网络分区。可用模式:  ignorepause_minority{pause_if_all_down, [nodes], ignore \| autoheal} (例: ['rabbit@node1', 'rabbit@node2'])autoheal详情请看[documentation on partitions](http://www.rabbitmq.com/partitions.html#automatic-handling) Default: ignore |
| cluster_keepalive_interval                     | 节点应该多频繁地将keepalive消息发送到其他节点(以毫秒为单位)。请注意，这与netticktime不一样; 错过的keepalive消息不会导致节点被认为挂机。 Default: 10000 |
| queue_index_embed_msgs_below                   | 在消息的字节数中，消息将被直接嵌入到队列索引中。详情请看 [persister tuning](http://www.rabbitmq.com/persistence-conf.html) Default: 4096 |
| msg_store_index_module                         | 用于队列索引的实现模块。 详情请看 [persister tuning](http://www.rabbitmq.com/persistence-conf.html) Default: rabbit_msg_store_ets_index |
| backing_queue_module                           | 队列内容的实现模块。通常情况下不需要设置该参数 Default: rabbit_variable_queue |
| msg_store_file_size_limit                      | Tunable value for the persister.  通常情况下不需要设置该参数Default: 16777216 |
| mnesia_table_loading_retry_limit               | 在等待集群中的Mnesia tables可用时，需要重试的次数。 Default: 10 |
| mnesia_table_loading_retry_timeout             | 在集群中等待每个重试的时间，以便可用 Default: 30000          |
| queue_index_max_ journal_entries               | Tunable value for the persister.  通常情况下不需要设置该参数Default: 65536 |
| queue_master_locator                           | Queue master定位策略可用策略:<<"min-masters">><<"client-local">><<"random">>详情请看 [documentation on queue master location](http://www.rabbitmq.com/ha.html#queue-master-location) Default: <<"client-local">> |
| lazy_queue_explicit_gc_run_operation_threshold | 调优： 只有在内存压力下有延迟队列时。　　　 这是触发垃圾收集器和其他内存减少活动的阈值。一个低的值可以降低性能，一个高的值可以提高性能，但是会导致更高的内存消耗。通常情况下不需要设置该参数Default: 1000 |
| queue_explicit_gc_run_operation_threshold      | 调优： 在内存压力较大时。这是触发垃圾收集器和其他内存减少活动的阈值。一个低的值可以降低性能，一个高的值可以提高性能，但是会导致更高的内存消耗。通常情况下不需要设置该参数Default: 1000 |

##### **配置条目加密**

```shell
# 可以在RabbitMQ配置文件中加密敏感配置条目（例如密码，包含URL的凭据）。代理在开始时解密加密的条目.请注意，加密配置条目不会使系统有意义地更安全。然而，它们允许RabbitMQ的部署符合各国的规定，要求在配置文件中不应以纯文本形式显示敏感数据。

# 加密值必须在Erlang加密元组内：{encrypted，...}。以下是默认用户加密密码的配置

[
  {rabbit, [
  {default_user, <<"guest">>},
  {default_pass,
{encrypted,
 <<"cPAymwqmMnbPXXRVqVzpxJdrS8mHEKuo2V+3vt1u/fymexD9oztQ2G/oJ4PAaSb2c5N/hRJ2aqP/X0VAfx8xOQ==">>
}
  },
  {config_entry_decoder, [
 {passphrase, <<"mypassphrase">>}
 ]}
]}
].
# 注意configentrydecoder密钥与RabbitMQ用于解密加密值的密码。密码短语不需要在配置文件中进行硬编码，它可以在一个单独的文件中。

[
  {rabbit, [
  ...
  {config_entry_decoder, [
 {passphrase, {file, "/path/to/passphrase/file"}}
 ]}
]}
].
# 当使用{passphrase，prompt}启动时，RabbitMQ也可以要求操作者输入密码

# 使用rabbitmqctl和encode命令加密值

rabbitmqctl encode '<<"guest">>' mypassphrase
{encrypted,<<"... long encrypted value...">>}
rabbitmqctl encode '"amqp://fred:secret@host1.domain/my_vhost"' mypassphrase
{encrypted,<<"... long encrypted value...">>}
# 如果要解密值，请添加--decode选项

rabbitmqctl encode --decode '{encrypted, <<"...">>}' mypassphrase
<<"guest">>
rabbitmqctl encode --decode '{encrypted, <<"...">>}' mypassphrase
"amqp://fred:secret@host1.domain/my_vhost"
# 可以对不同类型的值进行编码。上面的例子编码了二进制文件（<<“guest”>>）和字符串（“amqp：// fred：secret@host1.domain/my_vhost”）。

# 加密机制使用PBKDF2从密码短语中产生派生密钥。默认散列函数为SHA512，默认迭代次数为1000.默认密码为AES 256 CBC

# 您可以在配置文件中更改这些默认值：

[
  {rabbit, [
  ...
  {config_entry_decoder, [
 {passphrase, "mypassphrase"},
 {cipher, blowfish_cfb64},
 {hash, sha256},
 {iterations, 10000}
 ]}
]}
].    
# 在命令行：

rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
 '<<"guest">>' mypassphrase 
```



