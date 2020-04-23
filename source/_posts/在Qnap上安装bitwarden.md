---
title: 在Qnap上安装bitwarden
date: 2020-04-18 20:15:09
tags: bitwarden
categories: Qnap
---

### 安装ContainerStation

因为准备使用Qnap的容器来安装bitwarden，所以要先到Qnap的App Center中安装ContainerStation



### 拉取镜像

到ContaninerStation中左侧的创建里查找bitwarden，之后拉取镜像，拉取的同时可能会直接创建容器，所以还需要一些设置。如下：

1.  容器的名称可以自定义
2.  使用的资源也可以自行调整
3.  在File Station文件管理中创建/Container/bitwarden/ssl/keys、/Container/bitwarden/bw_data两个目录
4.  到Qnap的安全中下载证书，上传到/Container/bitwarden/ssl/keys目录中
5.  高级设置-环境。这是设置在容器中使用的环境变量的，如下

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| 名称           | 值                                                           |
| PATH           | /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin |
| ROCKET_ENV     | staging                                                      |
| ROCKET_PORT    | 443                                                          |
| ROCKET_WORKERS | 10                                                           |
| ROCKET_TLS     | {certs="/ssl/SSLcertificate.crt",key="/ssl/SSLprivatekey.key"} |

注：因为bitwarden必须使用https方式访问，否则无法正常注册与登录。ROCKET_TLS要指定好上传的密钥的路径

6.  高级设置-网络。到网络中设置网络模式为NAT，默认端口转发有3012和80两个端口，实际上我们只需要将一个端口，比如8443转发到443端口即可。默认的两个端口用不到。
7.  高级设置-共享文件。在这里需要添加两个共享文件夹，一个是将/Container/bitwarden/ssl/keys挂载到容器的/ssl目录上，一个是将/Container/bitwarden/bw_data挂载到容器的/data目录上
8.  启动容器，这时登录https://Qnap:8443即可注册登录。
9.  在chrome浏览器中安装bitwarden插件，之后在右上角打开bitwarden，先在打开的bitwarden的左上角设置中设置一下服务器地址为刚创建的本地的访问地址Qnap:8443，之后就可以登录使用了
10.  苹果手机使用bitwarden有些问题，登录时提示凭证无效，连接的服务器可能是冒用。本以为下载Qnap的安全证书安装即可，但还是不行。ios安装证书方法为，使用safari浏览器下载以.crt结尾的证书，之后到通用中找到VPN下面的描述档，在里面可以看到下载的证书，安装。之后再到通用的关于本机--> 凭证信任设定中选择信任即可。

参考：https://github.com/dani-garcia/bitwarden_rs/wiki/Enabling-HTTPS





