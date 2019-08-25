---
title: varnish概念
date: 2019-06-19 14:03:23
tags: varnish
categories: 缓存服务
---

### 概念

1. varnish的基本介绍

   ​        Varnish与一般服务器软件类似，就是一个web缓存代理服务器，分为master(management)进程和child(worker，主要做cache的工作)进程。master进程读入命令，进行一些初始化，然后fork(分流)并监控child进程。child进程分配若干线程进行工作，主要包括一些管理线程和很多woker线程。

   ​        Management进程主要实现应用新的配置、编译VCL、监控varnish、初始化varnish以及提供一个命令行接口等。 Management进程会每隔几秒钟探测一下Child进程以判断其是否正常运行，如果在指定的时长内未得到Child进程的回应，Management将会重启此Child进程。

   Child进程包含多种类型的线程，常见的如：

   ​       Acceptor线程：接收新的连接请求并响应；

   ​       Worker线程：child进程会为每个会话启动一个worker线程，因此，在高并发的场景中可能会出现数百个worker线程甚至更多；

   ​       Expiry线程：从缓存中清理过期内容；

   ​        Varnish依赖“工作区(workspace)”以降低线程在申请或修改内存时出现竞争的可能性。在varnish内部有多种不同的工作区，其中最关键的当属用于管理会话数据的session工作区。

2. varnish与squid的区别

   ​        varnish和squid在中小规模的应用上，varnish足够轻量级，足够好用，但是在巨大的并发请求来说，单个varnish所能够承载的并发 访问量大概在5000个连接请求左右，超出5000个可能就得不稳定了；而在这里squid就能表现出良好的性能了，因此在大规模的企业级应用中仍然是以squid居多，而在中小规模的自己公司的反向代理缓存中varnish居多；



   Varnish的优势

   - Varnish的稳定性很高，两者在完成相同负荷的工作时，Squid服务器发生故障的几率要高于Varnish，因为使用Squid要经常重启；
   - Varnish访问速度更快，因为采用了“Visual Page Cache”技术，所有缓存数据都直接从内存读取，而squid是从硬盘读取，因而Varnish在访问速度方面会更快；
   - Varnish可以支持更多的并发连接，因为Varnish的TCP连接释放要比Squid快，因而在高并发连接情况下可以支持更多TCP连接；
   - Varnish可以通过管理端口，使用正则表达式批量的清除部分缓存，而Squid是做不到的；
   - squid属于是单进程使用单核CPU，但Varnish是通过fork形式打开多进程来做处理，所以可以合理的使用所有核来处理相应的请求；



   Varnish的劣势

   - varnish进程一旦Hang、Crash或者重启，缓存数据都会从内存中完全释放，此时所有请求都会发送到后端服务器，在高并发情况下，会给后端服务器造成很大压力；
   - 在varnish使用中如果单个url的请求通过HA/F5等负载均衡，则每次请求落在不同的varnish服务器中，造成请求都会被穿透到后端；而且同样的请求在多台服务器上缓存，也会造成varnish的缓存的资源浪费，造成性能下降；



   Varnish劣势的解决方案

   - 针 对劣势一：在访问量很大的情况下推荐使用varnish的内存缓存方式启动，而且后面需要跟多台squid服务器。主要为了防止前面的varnish服 务、服务器被重启的情况下，大量请求穿透varnish，这样squid可以就担当第二层CACHE，而且也弥补了varnish缓存在内存中重启都会释 放的问题；
   - 针对劣势二：可以在负载均衡上做url哈希，让单个url请求固定请求到一台varnish服务器上;

3. varnish的日志说明

   ​        为了与系统的其它部分进行交互，Child进程使用了可以通过文件系统接口进行访问的共享内存日志(shared memory log)，因此，如果某线程需要记录信息，其仅需要持有一个锁，而后向共享内存中的某内存区域写入数据，再释放持有的锁即可。而为了减少竞争，每个 worker线程都使用了日志数据缓存。

   ​        共享内存日志大小一般为90M，其分为两部分，前一部分为计数器，后半部分为客户端请求的数据。varnish提供了多个不同的工具如 varnishlog、varnishncsa或varnishstat等来分析共享内存日志中的信息并能够以指定的方式进行显示。

4. VCL基本介绍

   ​        Varnish Configuration Language (VCL)是varnish配置缓存策略的工具，它是一种基于“域”(domain specific)的简单编程语言，它支持有限的算术运算和逻辑运算操作、允许使用正则表达式进行字符串匹配、允许用户使用set自定义变量、支持if判断语句，也有内置的函数和变量等。使用VCL编写的缓存策略通常保存至.vcl文件中，其需要编译成二进制的格式后才能由varnish调用。事实上，整个缓存策略就是由几个特定的子例程如vcl_recv、vcl_fetch等组成，它们分别在不同的位置(或时间)执行，如果没有事先为某个位置自定义子例程，varnish将会执行默认的定义。

   ​        VCL策略在启用前，会由management进程将其转换为C代码，而后再由gcc编译器将C代码编译成二进制程序。编译完成后，management负责将其连接至varnish实例，即child进程。正是由于编译工作在child进程之外完成，它避免了装载错误格式VCL 的风险。因此，varnish修改配置的开销非常小，其可以同时保有几份尚在引用的旧版本配置，也能够让新的配置即刻生效。编译后的旧版本配置通常在 varnish重启时才会被丢弃，如果需要手动清理，则可以使用varnishadm的vcl.discard命令完成。

5. varnish的后端存储

   ​        varnish的缓存对象在每次服务重启时都会被清空并重新建立，所以这些服务器都是不应该随便去重启的，varnish为了把数据更持久化的存储，引入了更多的存储机制，所以varnish支持多种不同的后端存储；

   ​        varnish支持多种不同类型的后端存储，这可以在varnishd启动时使用-s选项指定。后端存储的类型包括：

   - file：使用特定的文件存储全部的缓存数据，并通过操作系统的mmap()系统调用将整个缓存文件映射至内存区域(如果条件允许)；

   - malloc：使用malloc()库调用在varnish启动时向操作系统申请指定大小的内存空间以存储缓存对象；

   - persistent(experimental)：与file的功能相同，但可以持久存储数据(即重启varnish数据时不会被清除)；仍处于测试期；

   ​        varnish无法追踪某缓存对象是否存入了缓存文件，从而也就无从得知磁盘上的缓存文件是否可用，因此，file存储方法在varnish停止或重启时会清除数据。而persistent方法的出现对此有了一个弥补，但persistent仍处于测试阶段，例如目前尚无法有效处理要缓存对象总体大小超出缓存空间的情况，所以，其仅适用于有着巨大缓存空间的场景。

   ​        选择使用合适的存储方式有助于提升系统性，从经验的角度来看，建议在内存空间足以存储所有的缓存对象时使用malloc的方法，反之，file存储将有着更好的性能的表现。然而，需要注意的是，varnishd实际上使用的空间比使用-s选项指定的缓存空间更大，一般说来，其需要为每个缓存对象多使用差不多1K左右的存储空间，这意味着，对于100万个缓存对象的场景来说，其使用的缓存空间将超出指定大小1G左右。另外，为了保存数据结构等，varnish自身也会占去不小的内存空间。

6. 涉及VCL语法的改变点

   - vcl配置文件需明确指定版本：即在vcl文件的第一行写上 vcl 4.0;
   - vcl_fetch函数被vcl_backend_response代替，且req.*不再适用vcl_backend_response；
   - 后端源服务器组director成为varnish模块，需import directors后再在vcl_init子例程中定义；
   - 自定义的子例程(即一个sub)不能以vcl_开头，调用使用call sub_name；
   - error()函数被synth()替代；
   - return(lookup)被return(hash)替代；
   - 使用beresp.uncacheable创建hit_for_pss对象；
   - 变量req.backend.healty被std.healthy(req.backend)替代；
   - 变量req.backend被req.backend_hint替代；
   - 关键字remove被unset替代；

   详见：<https://www.varnish-cache.org/docs/4.0/whats-new/index.html#whats-new-index>

7. 架构及文件缓存的工作流程

   ![](/images/varnish/varnish文件缓存.png)

   - Varnish 分为 master 进程和 child 进程；
   - Master 进程读入存储配置文件，调用合适的存储类型，然后创建 / 读入相应大小的缓存文件，接着 master 初始化管理该存储空间的结构体，然后 fork 并监控 child 进程；
   - Child 进程在主线程的初始化的过程中，将前面打开的存储文件整个 mmap 到内存中，此时创建并初始化空闲结构体，挂到存储管理结构体，以待分配；
   - 对外管理接口分为3种，分别是命令行接口、Telnet接口和Web接口；
   - 同时在运行过程中修改的配置，可以由VCL编译器编译成C语言，并组织成共享对象(Shared Object)交由Child进程加载使用；

   ![](/images/varnish/varnish文件缓存2.png)

   Child 进程分配若干线程进行工作，主要包括一些管理线程和很多 worker 线程，可分为：

   - Accept线程：接受请求，将请求挂在overflow队列上；
   - Work线程：有多个，负责从overflow队列上摘除请求，对请求进行处理，直到完成，然后处理下一个请求；
   - Epoll线程：一个请求处理称为一个session，在session周期内，处理完请求后，会交给Epoll处理，监听是否还有事件发生；
   - Expire线程：对于缓存的object，根据过期时间，组织成二叉堆，该线程周期检查该堆的根，处理过期的文件，对过期的数据进行删除或重取操作；

8. varnish的工作原理及工作流程

   官方提供的工作流程图:

   ![](/images/varnish/varnish架构.jpg)

   vcl的工作方式是基于状态引擎(state engine)来实现的；上图说明：

   ​        vcl_recv的结果如果可以查询缓存并可以识别，那就要到vcl_hash这步了，如果无法识别那就通过pipe(管道)送给vcl_pipe，如果能识别，但不是一个可缓存的对象，那就通过pass送到vcl_pass去。vcl_hash之后就可查看缓存中有没有了，有这个请求的对象就表示命中 (vcl_hit)，如果没有那就表示未命中(vcl_miss)，如果命中的就可以直接通过deliver直接送给vcl_deliver响应了，如果未命中就通过fetch交给vcl_fatch去后端服务器上去取数据，取回数据之后如果数据可以缓存就缓存(cache)，本地缓存完之后再构建响应，如果不可以缓存就不做缓存交给vcl_deliver响应了；而如果命中了交给vcl_pass，交给pass之后就要到Fetch objet from backend后端服务器上去取数据了，这是因为这个命中的对象可能是过期或者是要做单独额外的处理的；这就是vcl的状态引擎过程。

9. Varnish 处理 HTTP 请求的过程如下
   1. Receive 状态（vcl_recv）：也就是请求处理的入口状态，根据 VCL 规则判断该请求应该 pass（vcl_pass）或是 pipe（vcl_pipe），还是进入 lookup（本地查询）；
   2. Lookup 状态：进入该状态后，会在 hash 表中查找数据，若找到，则进入 hit（vcl_hit）状态，否则进入 miss（vcl_miss）状态；
   3. Pass（vcl_pass）状态：在此状态下，会直接进入后端请求，即进入 fetch（vcl_fetch）状态；
   4. Fetch（vcl_fetch）状态：在 fetch 状态下，对请求进行后端获取，发送请求，获得数据，并根据设置进行本地存储；
   5. Deliver（vcl_deliver）状态：将获取到的数据发给客户端，然后完成本次请求；

   注：Varnish4中在vcl_fetch部分略有出入，已独立为vcl_backend_fetch和vcl_backend_response2个函数；

10. 内置函数(也叫子例程)

    - vcl_recv：用于接收和处理请求；当请求到达并成功接收后被调用，通过判断请求的数据来决定如何处理请求；
    - vcl_pipe：此函数在进入pipe模式时被调用，用于将请求直接传递至后端主机，并将后端响应原样返回客户端；
    - vcl_pass：此函数在进入pass模式时被调用，用于将请求直接传递至后端主机，但后端主机的响应并不缓存直接返回客户端；
    - vcl_hit：在执行 lookup 指令后，在缓存中找到请求的内容后将自动调用该函数；
    - vcl_miss：在执行 lookup 指令后，在缓存中没有找到请求的内容时自动调用该方法，此函数可用于判断是否需要从后端服务器获取内容；
    - vcl_hash：在vcl_recv调用后为请求创建一个hash值时，调用此函数；此hash值将作为varnish中搜索缓存对象的key；
    - vcl_purge：pruge操作执行后调用此函数，可用于构建一个响应；
    - vcl_deliver：将在缓存中找到请求的内容发送给客户端前调用此方法；
    - vcl_backend_fetch：向后端主机发送请求前，调用此函数，可修改发往后端的请求；
    - vcl_backend_response：获得后端主机的响应后，可调用此函数；
    - vcl_backend_error：当从后端主机获取源文件失败时，调用此函数；
    - vcl_init：VCL加载时调用此函数，经常用于初始化varnish模块(VMODs)
    - vcl_fini：当所有请求都离开当前VCL，且当前VCL被弃用时，调用此函数，经常用于清理varnish模块；

11. VCL中内置公共变量

    变量(也叫object)适用范围

    ![](/images/varnish/varnish内置公共变量.jpg)

12. 变量类型详解

    ![](/images/varnish/varnish变量类型详解.jpg)

    - req：The request object，请求到达时可用的变量
    - bereq：The backend request object，向后端主机请求时可用的变量
    - beresp：The backend response object，从后端主机获取内容时可用的变量
    - resp：The HTTP response object，对客户端响应时可用的变量
    - obj：存储在内存中时对象属性相关的可用的变量

    具体变量详见：<https://www.varnish-cache.org/docs/4.0/reference/vcl.html#reference-vcl>

