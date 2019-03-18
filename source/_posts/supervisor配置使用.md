

### 介绍

> supervisord是一款linux进程管理工具



### 组件

> 1. supervisord：supervisor的服务端程序。启动supervisor程序自身，启动supervisor管理的子进程，响应来自clients的请求，重启闪退或异常退出的子进程，把子进程的stderr或stdout记录到日志文件中，生成和处理Event
> 2. supervisorctl：supervisorctl是client端程序。supervisorctl有一个类似shell的命令行界面，我们可以利用它来查看子进程状态，启动/停止/重启子进程，获取running子进程的列表等等。supervisorctl不仅可以连接到本机上的supervisord，还可以连接到远程的supervisord，当然在本机上面是通过UNIX socket连接的，远程是通过TCP socket连接的。supervisorctl和supervisord之间的通信，是通过xml_rpc完成的。    相应的配置在[supervisorctl]块里面
> 3. Web Server：主要可以在界面上管理进程，Web Server其实是通过XML_RPC来实现的，可以向supervisor请求数据，也可以控制supervisor及子进程。配置在[inet_http_server]块里面
> 4. XML_RPC接口：这个是远程调用的，上面的supervisorctl和Web Server就是它弄的



### 安装

```shell
[root@webdav ~]# yum install python-setuptools
[root@webdav ~]# easy_install supervisor
# 安装了python-setuptools后才能使用easy_install命令
[root@webdav ~]# echo_supervisord_conf
# 测试安装是否成功，这条命令可以输出配置文件
```



### 配置

```shell
[root@webdav ~]# mkdir /etc/supervisor
[root@webdav ~]# echo_supervisord_conf > /etc/supervisor/supervisord.conf
[root@webdav ~]# vim /etc/supervisor/supervisord.conf
; Sample supervisor config file.
;
; For more information on the config file, please see:
; http://supervisord.org/configuration.html
;
; Notes:
;  - Shell expansion ("~" or "$HOME") is not supported.  Environment
;    variables can be expanded using this syntax: "%(ENV_HOME)s".
;  - Quotes around values are not supported, except in the case of
;    the environment= options as shown below.
;  - Comments must have a leading space: "a=b ;comment" not "a=b;comment".
;  - Command will be truncated if it looks like a config file comment, e.g.
;    "command=bash -c 'foo ; bar'" will truncate to "command=bash -c 'foo ".

[unix_http_server]
file=/tmp/supervisor.sock   ; the path to the socket file
# socket文件的路径，supervisorctl用XML_RPC和supervisord通信就是通过它进行的。如果不设置的话，supervisorctl也就不能用了不设置的话，默认为none。 非必须设置 
;chmod=0700                 ; socket file mode (default 0700)
# 这个简单，就是修改上面的那个socket文件的权限为0700不设置的话，默认为0700。 非必须设置
;chown=nobody:nogroup       ; socket file uid:gid owner
# 这个一样，修改上面的那个socket文件的属组为user.group不设置的话，默认为启动supervisord进程的用户及属组。非必须设置
;username=user              ; default is no username (open server)
# 使用supervisorctl连接的时候，认证的用户不设置的话，默认为不需要用户。 非必须设置
;password=123               ; default is no password (open server)
# 和上面的用户名对应的密码，可以直接使用明码，也可以使用SHA加密。如：{SHA}82ab876d1387bfafe46cc1c8a2ef074eae50cb1d。默认不设置。非必须设置

[inet_http_server]         ; inet (TCP) server disabled by default
# 侦听在TCP上的socket，Web Server和远程的supervisorctl都要用到他。不设置的话，默认为不开启。非必须设置
port=0.0.0.0:9001        ; ip_address:port specifier, *:port for all iface
# 这个是侦听的IP和端口，侦听所有IP用 :9001或*:9001。这个必须设置，只要上面的[inet_http_server]开启了，就必须设置它
username=user              ; default is no username (open server)
# 这个和上面的uinx_http_server一个样。非必须设置
password=123               ; default is no password (open server)
# 密码

[supervisord]
# 这个主要是定义supervisord这个服务端进程的一些参数的。这个必须设置，不设置，supervisor就不用干活了
logfile=/tmp/supervisord.log ; main log file; default $CWD/supervisord.log
# 这个是supervisord这个主进程的日志路径，注意和子进程的日志不搭嘎。默认路径$CWD/supervisord.log，$CWD是当前目录。。非必须设置
logfile_maxbytes=50MB        ; max main logfile bytes b4 rotation; default 50MB
# 这个是上面那个日志文件的最大的大小，当超过50M的时候，会生成一个新的日志文件。当设置为0时，表示不限制文件大小。 默认值是50M，非必须设置。       
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
# 日志文件保持的数量，上面的日志文件大于50M时，就会生成一个新文件。文件数量大于10时，最初的老文件被新文件覆盖，文件数量将保持为10。当设置为0时，表示不限制文件的数量。默认情况下为10。。。非必须设置
loglevel=info                ; log level; default info; others: debug,warn,trace
# 日志级别，有critical, error, warn, info, debug, trace, or blather等。默认为info。。。非必须设置项
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
# upervisord的pid文件路径。默认为$CWD/supervisord.pid。非必须设置
nodaemon=false               ; start in foreground if true; default false
# 如果是true，supervisord进程将在前台运行。默认为false，也就是后台以守护进程运行。。。非必须设置
minfds=1024                  ; min. avail startup file descriptors; default 1024
# 这个是最少系统空闲的文件描述符，低于这个值supervisor将不会启动。系统的文件描述符在这里设置cat /proc/sys/fs/file-max。默认情况下为1024。。。非必须设置
minprocs=200                 ; min. avail process descriptors;default 200
# 最小可用的进程描述符，低于这个值supervisor也将不会正常启动。ulimit  -u这个命令，可以查看linux下面用户的最大进程数。默认为200。。。非必须设置
;umask=022                   ; process file creation umask; default 022
# 进程创建文件的掩码。默认为022。非必须设置项
;user=chrism                 ; default is current user, required if root
# 这个参数可以设置一个非root用户，当我们以root用户启动supervisord之后。我这里面设置的这个用户，也可以对supervisord进行管理。默认情况是不设置。。。非必须设置项
;identifier=supervisor       ; supervisord identifier, default is 'supervisor'
# 这个参数是supervisord的标识符，主要是给XML_RPC用的。当你有多个supervisor的时候，而且想调用XML_RPC统一管理，就需要为每个supervisor设置不同的标识符了。默认是supervisord。。。非必需设置
;directory=/tmp              ; default is not to cd during start
# 这个参数是当supervisord作为守护进程运行的时候，设置这个参数的话，启动supervisord进程之前，会先切换到这个目录。默认不设置。。。非必须设置
;nocleanup=true              ; don't clean up tempfiles at start; default false
# 这个参数当为false的时候，会在supervisord进程启动的时候，把以前子进程产生的日志文件(路径为AUTO的情况下)清除掉。有时候咱们想要看历史日志，当 然不想日志被清除了。所以可以设置为true。默认是false，有调试需求的同学可以设置为true。。。非必须设置
;childlogdir=/tmp            ; 'AUTO' child log dir, default $TEMP
# 当子进程日志路径为AUTO的时候，子进程日志文件的存放路径。默认路径是这个东西，执行下面的这个命令看看就OK了，处理的东西就默认路径python -c "import tempfile;print tempfile.gettempdir()"。非必须设置
;environment=KEY="value"     ; key value pairs to add to environment
# 这个是用来设置环境变量的，supervisord在linux中启动默认继承了linux的环境变量，在这里可以设置supervisord进程特有的其他环境变量。supervisord启动子进程时，子进程会拷贝父进程的内存空间内容。 所以设置的这些环境变量也会被子进程继承。小例子：environment=name="haha",age="hehe"。默认为不设置。非必须设置
;strip_ansi=false            ; strip ansi escape codes in logs; def. false
# 这个选项如果设置为true，会清除子进程日志中的所有ANSI 序列。什么是ANSI序列呢？就是我们的\n,\t这些东西。默认为false。非必须设置
; The rpcinterface:supervisor section must remain in the config file for
; RPC (supervisorctl/web interface) to work.  Additional interfaces may be
; added by defining them in separate [rpcinterface:x] sections.

[rpcinterface:supervisor]
# 这个选项是给XML_RPC用的，当然你如果想使用supervisord或者web server 这 个选项必须要开启的
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

; The supervisorctl section configures how supervisorctl will connect to
; supervisord.  configure it match the settings in either the unix_http_server
; or inet_http_server section.

[supervisorctl]
# 这个主要是针对supervisorctl的一些配置
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
# 这个是supervisorctl本地连接supervisord的时候，本地UNIX socket路径，注意这个是和前面的[unix_http_server]对应的。默认值就是unix:///tmp/supervisor.sock。。非必须设置
;serverurl=http://127.0.0.1:9001 ; use an http:// url to specify an inet socket
# 这个是supervisorctl远程连接supervisord的时候，用到的TCP socket路径，注意这个和前面的[inet_http_server]对应。默认就是http://127.0.0.1:9001。。。非必须项
;username=chris              ; should be same as in [*_http_server] if set
# 用户名。默认空。非必须设置
;password=123                ; should be same as in [*_http_server] if set
# 密码。默认空。非必须设置
;prompt=mysupervisor         ; cmd line prompt (default "supervisor")
# 输入用户名密码时候的提示符。默认supervisor。非必须设置
;history_file=~/.sc_history  ; use readline history if available
# 这个参数和shell中的history类似，我们可以用上下键来查找前面执行过的命令。默认是no file的。。所以我们想要有这种功能，必须指定一个文件。非必须设置

; The sample program section below shows all possible program subsection values.
; Create one or more 'real' program: sections to be able to control them under
; supervisor.

;[program:theprogramname]
# 这个就是咱们要管理的子进程了，":"后面的是名字，最好别乱写和实际进程有点关联最好。这样的program我们可以设置一个或多个，一个program就是要被管理的一个进程
;command=/bin/cat              ; the program (relative uses PATH, can take args)
# 这个就是我们的要启动进程的命令路径了，可以带参数。例子：/home/test.py -a 'hehe'，有一点需要注意的是，我们的command只能是那种在终端运行的进程，不能是守护进程。这个想想也知道了，比如说command=service httpd start。httpd这个进程被linux的service管理了，我们的supervisor再去启动这个命令。这已经不是严格意义的子进程了。这个是个必须设置的项
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
# 这个是进程名，如果我们下面的numprocs参数为1的话，就不用管这个参数了，它默认值%(program_name)s也就是上面的那个program冒号后面的名字，但是如果numprocs为多个的话，那就不能这么干了。想想也知道，不可能每个进程都用同一个进程名吧。
;numprocs=1                    ; number of processes copies to start (def 1)
# 启动进程的数目。当不为1时，就是进程池的概念，注意process_name的设置。默认为1    。非必须设置
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
# 进程运行前，会前切换到这个目录。默认不设置。非必须设置
;umask=022                     ; umask for process (default None)
# 进程掩码，默认none，非必须
;priority=999                  ; the relative start priority (default 999)
# 子进程启动关闭优先级，优先级低的，最先启动，关闭的时候最后关闭。默认值为999 。。非必须设置
;autostart=true                ; start at supervisord start (default: true)
# 如果是true的话，子进程将在supervisord启动后被自动启动。默认就是true   。。非必须设置
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
# 这个选项是子进程启动多少秒之后，此时状态如果是running，则我们认为启动成功了。默认值为1 。非必须设置
;startretries=3                ; max # of serial start failures when starting (default 3)
# 当进程启动失败后，最大尝试启动的次数。。当超过3次后，supervisor将把此进程的状态置为FAIL。默认值为3 。非必须设置
;autorestart=unexpected        ; when to restart if exited after running (def: unexpected)
# 这个是设置子进程挂掉后自动重启的情况，有三个选项，false,unexpected和true。如果为false的时候，无论什么情况下，都不会被重新启动，如果为unexpected，只有当进程的退出码不在下面的exitcodes里面定义的退出码的时候，才会被自动重启。当为true的时候，只要子进程挂掉，将会被无条件的重启
;exitcodes=0,2                 ; 'expected' exit codes used with autorestart (default 0,2)
# 注意和上面的的autorestart=unexpected对应。exitcodes里面的定义的。退出码是expected的。
;stopsignal=QUIT               ; signal used to kill process (default TERM)
# 进程停止信号，可以为TERM, HUP, INT, QUIT, KILL, USR1, or USR2等信号。默认为TERM 。。当用设定的信号去干掉进程，退出码会被认为是expected。非必须设置
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
# 这个是当我们向子进程发送stopsignal信号后，到系统返回信息，给supervisord，所等待的最大时间。 超过这个时间，supervisord会向该子进程发送一个强制kill的信号。默认为10秒。非必须设置
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
# 这个东西主要用于，supervisord管理的子进程，这个子进程本身还有子进程。那么我们如果仅仅干掉supervisord的子进程的话，子进程的子进程有可能会变成孤儿进程。所以咱们可以设置可个选项，把整个该子进程的整个进程组都干掉。 设置为true的话，一般killasgroup也会被设置为true。需要注意的是，该选项发送的是stop信号。默认为false。非必须设置。
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
# 这个和上面的stopasgroup类似，不过发送的是kill信号
;user=chrism                   ; setuid to this UNIX account to run the program
# 如果supervisord是root启动，我们在这里设置这个非root用户，可以用来管理该program。默认不设置。非必须设置项
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
# 如果为true，则stderr的日志会被写入stdout日志文件中。默认为false，非必须设置
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
# 子进程的stdout的日志路径，可以指定路径，AUTO，none等三个选项。设置为none的话，将没有日志产生。设置为AUTO的话，将随机找一个地方生成日志文件，而且当supervisord重新启动的时候，以前的日志文件会被清空。当 redirect_stderr=true的时候，sterr也会写进这个日志文件
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
# 日志文件最大大小，和[supervisord]中定义的一样。默认为50
;stdout_logfile_backups=10     ; # of stdout logfile backups (0 means none, default 10)
# 和[supervisord]定义的一样。默认10
;stdout_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
# 这个东西是设定capture管道的大小，当值不为0的时候，子进程可以从stdout发送信息，而supervisor可以根据信息，发送相应的event。默认为0，为0的时候表达关闭管道。非必须项
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
# 当设置为ture的时候，当子进程由stdout向文件描述符中写日志的时候，将触发supervisord发送PROCESS_LOG_STDOUT类型的event。默认为false。。。非必须设置
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
# 这个东西是设置stderr写的日志路径，当redirect_stderr=true。这个就不用设置了，设置了也是白搭。因为它会被写入stdout_logfile的同一个文件中。默认为AUTO，也就是随便找个地存，supervisord重启被清空。。非必须设置
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (0 means none, default 10)
;stderr_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;environment=A="1",B="2"       ; process environment additions (def no adds)
# 这个是该子进程的环境变量，和别的子进程是不共享的
;serverurl=AUTO                ; override serverurl computation (childutils)

; The sample eventlistener section below shows all possible eventlistener
; subsection values.  Create one or more 'real' eventlistener: sections to be
; able to handle event notifications sent by supervisord.

;[eventlistener:theeventlistenername]
# 这个东西其实和program的地位是一样的，也是suopervisor启动的子进程，不过它干的活是订阅supervisord发送的event。他的名字就叫listener了。
;command=/bin/eventlistener    ; the program (relative uses PATH, can take args)
# 这个和上面的program一样，表示listener的可执行文件的路径
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
# 这个也一样，进程名，当下面的numprocs为多个的时候，才需要。否则默认就OK了
;numprocs=1                    ; number of processes copies to start (def 1)
# 相同的listener启动的个数
;events=EVENT                  ; event notif. types to subscribe to (req'd)
# event事件的类型，也就是说，只有写在这个地方的事件类型。才会被发送
;buffer_size=10                ; event buffer queue size (default 10)
# 这个是event队列缓存大小，单位不太清楚，楼主猜测应该是个吧。当buffer超过10的时候，最旧的event将会被清除，并把新的event放进去。默认值为10。非必须选项
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
# 进程执行前，会切换到这个目录下执行。默认为不切换。非必须
;umask=022                     ; umask for process (default None)
# 掩码
;priority=-1                   ; the relative start priority (default -1)
# 启动优先级，默认-1
;autostart=true                ; start at supervisord start (default: true)
# 是否随supervisord启动一起启动，默认true
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
# 也是一样，进程启动后跑了几秒钟，才被认定为成功启动，默认1
;startretries=3                ; max # of serial start failures when starting (default 3)
# 失败最大尝试次数，默认3
;autorestart=unexpected        ; autorestart if exited after running (def: unexpected)
# 是否自动重启，和program一个样，分true,false,unexpected等，注意unexpected和exitcodes的关系
;exitcodes=0,2                 ; 'expected' exit codes used with autorestart (default 0,2)
# 期望或者说预料中的进程退出码
;stopsignal=QUIT               ; signal used to kill process (default TERM)
# 干掉进程的信号，默认为TERM，比如设置为QUIT，那么如果QUIT来干这个进程。那么会被认为是正常维护，退出码也被认为是expected中的
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
# 设置普通用户，可以用来管理该listener进程。默认为空。非必须设置
;redirect_stderr=false         ; redirect_stderr=true is not allowed for eventlisteners
# 为true的话，stderr的log会并入stdout的log里面。默认为false。。。非必须设置
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (0 means none, default 10)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (0 means none, default 10)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;environment=A="1",B="2"       ; process environment additions
# 这个是该子进程的环境变量
;serverurl=AUTO                ; override serverurl computation (childutils)

; The sample group section below shows all possible group values.  Create one
; or more 'real' group: sections to create "heterogeneous" process groups.

;[group:thegroupname]
# 这个东西就是给programs分组，划分到组里面的program。我们可以对组名进行统一的操作。 注意：program被划分到组里面之后，就相当于原来的配置从supervisor的配置文件里消失了。supervisor只会对组进行管理，而不再会对组里面的单个program进行管理了
;programs=progname1,progname2  ; each refers to 'x' in [program:x] definitions
# 组成员，用逗号分开这个是个必须的设置项
;priority=999                  ; the relative start priority (default 999)
# 优先级，相对于组和组之间说的。默认999。。非必须选项
; The [include] section can just contain the "files" setting.  This
; setting can list multiple files (separated by whitespace or
; newlines).  It can also contain wildcards.  The filenames are
; interpreted as relative to this file.  Included files *cannot*
; include files themselves.

;[include]
# 当我们要管理的进程很多的时候，写在一个文件里面就有点大了。我们可以把配置信息写到多个文件中，然后include过来
;files = relative/directory/*.ini
```



### 实例

```shell
; Sample supervisor config file.
;
; For more information on the config file, please see:
; http://supervisord.org/configuration.html
;
; Notes:
;  - Shell expansion ("~" or "$HOME") is not supported.  Environment
;    variables can be expanded using this syntax: "%(ENV_HOME)s".
;  - Comments must have a leading space: "a=b ;comment" not "a=b;comment".

[unix_http_server]
file=/tmp/supervisor.sock   ; (the path to the socket file)
;chmod=0700                 ; socket file mode (default 0700)
;chown=nobody:nogroup       ; socket file uid:gid owner
;username=user              ; (default is no username (open server))
;password=123               ; (default is no password (open server))

[inet_http_server]         ; inet (TCP) server disabled by default
port=0.0.0.0:9001        ; (ip_address:port specifier, *:port for all iface)
username=user              ; (default is no username (open server))
password=123               ; (default is no password (open server))

[supervisord]
logfile=/tmp/supervisord.log ; (main log file;default $CWD/supervisord.log)
logfile_maxbytes=50MB        ; (max main logfile bytes b4 rotation;default 50MB)
logfile_backups=10           ; (num of main logfile rotation backups;default 10)
loglevel=info                ; (log level;default info; others: debug,warn,trace)
pidfile=/tmp/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
nodaemon=false               ; (start in foreground if true;default false)
minfds=1024                  ; (min. avail startup file descriptors;default 1024)
minprocs=200                 ; (min. avail process descriptors;default 200)
;umask=022                   ; (process file creation umask;default 022)
;user=chrism                 ; (default is current user, required if root)
;identifier=supervisor       ; (supervisord identifier, default is 'supervisor')
;directory=/tmp              ; (default is not to cd during start)
;nocleanup=true              ; (don't clean up tempfiles at start;default false)
;childlogdir=/tmp            ; ('AUTO' child log dir, default $TEMP)
;environment=KEY="value"     ; (key value pairs to add to environment)
;strip_ansi=false            ; (strip ansi escape codes in logs; def. false)

; the below section must remain in the config file for RPC
; (supervisorctl/web interface) to work, additional interfaces may be
; added by defining them in separate rpcinterface: sections
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
;serverurl=http://127.0.0.1:9001 ; use an http:// url to specify an inet socket
;username=chris              ; should be same as http_username if set
;password=123                ; should be same as http_password if set
;prompt=mysupervisor         ; cmd line prompt (default "supervisor")
;history_file=~/.sc_history  ; use readline history if available

; The below sample program section shows all possible program subsection values,
; create one or more 'real' program: sections to be able to control them under
; supervisor.

;[program:theprogramname]
;command=/bin/cat              ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=999                  ; the relative start priority (default 999)
;autostart=true                ; start at supervisord start (default: true)
;autorestart=unexpected        ; whether/when to restart (default: unexpected)
;startsecs=1                   ; number of secs prog must stay running (def. 1)
;startretries=3                ; max # of serial start failures (default 3)
;exitcodes=0,2                 ; 'expected' exit codes for process (default 0,2)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (default 10)
;stdout_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (default 10)
;stderr_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;environment=A="1",B="2"       ; process environment additions (def no adds)
;serverurl=AUTO                ; override serverurl computation (childutils)

; The below sample eventlistener section shows all possible
; eventlistener subsection values, create one or more 'real'
; eventlistener: sections to be able to handle event notifications
; sent by supervisor.

;[eventlistener:theeventlistenername]
;command=/bin/eventlistener    ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;events=EVENT                  ; event notif. types to subscribe to (req'd)
;buffer_size=10                ; event buffer queue size (default 10)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=-1                   ; the relative start priority (default -1)
;autostart=true                ; start at supervisord start (default: true)
;autorestart=unexpected        ; whether/when to restart (default: unexpected)
;startsecs=1                   ; number of secs prog must stay running (def. 1)
;startretries=3                ; max # of serial start failures (default 3)
;exitcodes=0,2                 ; 'expected' exit codes for process (default 0,2)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (default 10)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups        ; # of stderr logfile backups (default 10)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;environment=A="1",B="2"       ; process environment additions
;serverurl=AUTO                ; override serverurl computation (childutils)

; The below sample group section shows all possible group values,
; create one or more 'real' group: sections to create "heterogeneous"
; process groups.

;[group:thegroupname]
;programs=progname1,progname2  ; each refers to 'x' in [program:x] definitions
;priority=999                  ; the relative start priority (default 999)

; The [include] section can just contain the "files" setting.  This
; setting can list multiple files (separated by whitespace or
; newlines).  It can also contain wildcards.  The filenames are
; interpreted as relative to this file.  Included files *cannot*
; include files themselves.

;[include]
;files = relative/directory/*.ini

## 下面是管理的zookeeper和storm的模块
[program:zookeeper]
command=/xor/data0/zookeeper/bin/zkServer.sh start-foreground
autostart=true
autorestart=true
startsecs=1
startretries=999
user=hadoop
redirect_stderr=false
stdout_logfile=/xor/data2/log/storm/zookeeper-out
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
stdout_events_enabled=true
stderr_logfile=/xor/data2/log/storm/zookeeper-err
stderr_logfile_maxbytes=100MB
stderr_logfile_backups=10
stderr_events_enabled=true

[program:storm_nimbus]
command=/xor/data0/storm/bin/storm nimbus
autostart=true
autorestart=true
startsecs=1
startretries=999
user=storm
redirect_stderr=false
stdout_logfile=/xor/data2/log/storm/storm-nimbus-out
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
stdout_events_enabled=true
stderr_logfile=/xor/data2/log/storm/storm-nimbus-err
stderr_logfile_maxbytes=100MB
stderr_logfile_backups=10
stderr_events_enabled=true

[program:storm_supervisor]
command=/xor/data0/storm/bin/storm supervisor
autostart=true
autorestart=true
startsecs=1
startretries=999
user=storm
redirect_stderr=false
stdout_logfile=/xor/data2/log/storm/storm-supervisor-out
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
stdout_events_enabled=true
stderr_logfile=/xor/data2/log/storm/storm-supervisor-err
stderr_logfile_maxbytes=100MB
stderr_logfile_backups=10
stderr_events_enabled=true

[program:storm_drpc]
command=/xor/data0/storm/bin/storm drpc
autostart=true
autorestart=true
startsecs=1
startretries=999
user=storm
redirect_stderr=false
stdout_logfile=/xor/data2/log/storm/storm-drpc-out
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
stdout_events_enabled=true
stderr_logfile=/xor/data2/log/storm/storm-drpc-err
stderr_logfile_maxbytes=100MB
stderr_logfile_backups=10
stderr_events_enabled=true

[program:storm_ui]
command=/xor/data0/storm/bin/storm ui
autostart=true
autorestart=true
startsecs=1
startretries=999
user=storm
redirect_stderr=false
stdout_logfile=/xor/data2/log/storm/storm-ui-out
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=10
stdout_events_enabled=true
stderr_logfile=/xor/data2/log/storm/storm-ui-err
stderr_logfile_maxbytes=100MB
stderr_logfile_backups=10
stderr_events_enabled=true
```



### 命令

```shell
supervisorctl status
# 查看所有子进程的状态
supervisorctl stop storm1
supervisorctl start storm1
# 关闭与开启指定子进程
supervisorctl stop all
supervisorctl start all
# # 关闭与开启全部子进程
```

