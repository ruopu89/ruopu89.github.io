---
title: cobbler部署
date: 2019-05-07 16:24:34
tags: 自动部署
categories: 基础
---

### 介绍

> Cobbler是一个Linux服务器安装的服务，可以通过网络启动(PXE)的方式来快速安装、重装物理服务器和虚拟机，同时还可以管理DHCP，DNS等。
>
> Cobbler可以使用命令行方式管理，也提供了基于Web的界面管理工具(cobbler-web)，还提供了API接口，可以方便二次开发使用。
>
> Cobbler是较早前的kickstart的升级版，优点是比较容易配置，还自带web界面比较易于管理。
>
> Cobbler内置了一个轻量级配置管理系统，但它也支持和其它配置管理系统集成，如Puppet，暂时不支持SaltStack。
>
> [Cobbler官网](http://cobbler.github.io/)



### cobbler集成的服务

> - PXE服务支持
> - DHCP服务管理
> - DNS服务管理(可选bind,dnsmasq)
> - 电源管理
> - Kickstart服务支持
> - YUM仓库管理
> - TFTP(PXE启动时需要)
> - Apache(提供kickstart的安装源，并提供定制化的kickstart配置)



### 安装

```shell
=======================================================================================
环境：
系统：CentOS7.3.1611
防火墙：关闭
SELinux：关闭
=======================================================================================
[root@cobbler ~]# yum install -y epel-release
[root@cobbler ~]# yum install -y cobbler cobbler-web tftp-server tftp dhcp httpd syslinux rsync pykickstart
[root@cobbler ~]# rpm -ql cobbler
/etc/cobbler # 配置文件目录
/etc/cobbler/settings # cobbler主配置文件，这个文件是YAML格式，Cobbler是python写的程序。
/etc/cobbler/dhcp.template # DHCP服务的配置模板
/etc/cobbler/tftpd.template # tftp服务的配置模板
/etc/cobbler/rsync.template # rsync服务的配置模板
/etc/cobbler/iso # iso模板配置文件目录
/etc/cobbler/pxe # pxe模板文件目录
/etc/cobbler/power # 电源的配置文件目录
/etc/cobbler/users.conf # Web服务授权配置文件
/etc/cobbler/users.digest # 用于web访问的用户名密码配置文件
/etc/cobbler/dnsmasq.template # DNS服务的配置模板
/etc/cobbler/modules.conf # Cobbler模块配置文件
/var/lib/cobbler # Cobbler数据目录
/var/lib/cobbler/config # 配置文件
/var/lib/cobbler/kickstarts # 默认存放kickstart文件
/var/lib/cobbler/loaders # 存放的各种引导程序
/var/www/cobbler # 系统安装镜像目录
/var/www/cobbler/ks_mirror # 导入的系统镜像列表
/var/www/cobbler/images # 导入的系统镜像启动文件
/var/www/cobbler/repo_mirror # yum源存储目录
/var/log/cobbler # 日志目录
/var/log/cobbler/install.log # 客户端系统安装日志
/var/log/cobbler/cobbler.log # cobbler日志

```



### 配置dhcp

```shell
[root@cobbler dhcp]# mv dhcpd.conf{,.bak}
[root@cobbler dhcp]# cp /usr/share/doc/dhcp-4.2.5/dhcpd.conf.example /etc/dhcp/dhcpd.conf
[root@cobbler dhcp]# vim dhcpd.conf
option domain-name "yhsm.com";
# 指定域名，与/etc/resolv.conf中的是一样的。
option domain-name-servers 114.114.114.114;
# 这应该是一个可用的DNS地址
option routers 172.16.99.2;
# 指定网关，因为是虚拟机，所以这里指定的网关也就是NAT网卡的网关
default-lease-time 3600;
max-lease-time 86400;
log-facility local7;
subnet 172.16.99.0 netmask 255.255.255.0 {
# 为哪个网段分配IP地址
    range 172.16.99.100 172.16.99.120;
    # 分配地址的范围
    filename "pxelinux.0";
    # filename: 指明引导文件名称；基于网络引导时用到的bootloder文件
    next-server 172.16.99.100;
    # next-server：提供引导文件的服务器IP地址；一般指定的服务器是一个tftp服务器，这里的tftp与cobbler服务在同一台主机上
}
# 注意，每行以分号结尾。除了这些行，其他行均可注释
[root@cobbler dhcp]# systemctl start dhcpd
[root@cobbler dhcp]# ss -tlun
# DHCP监听在UDP的67号端口，客户端监听在UDP的68号端口
[root@cobbler ~]# dhclient -r
# 使用此命令可以将dhcp分配的地址删除掉
[root@cobbler ~]# dhclient -d
# 使用此命令可能重新获取地址，如果已经有了dhcp分配的地址，可以续租
# 上面两条命令也可以在客户端操作，这里直接使用服务端来测试了。所以地址可以会有变化。另外，要关闭虚拟机NAT的dhcp功能，并查看一下NAT的网关。如下图
[root@cobbler ~]# less /var/lib/dhcpd/dhcpd.leases
# 查看分配出去的地址，这个是租约文件
```

1. 选择正在使用的NAT网卡，关闭dhcp功能，再查看NAT配置

![](/images/cobbler/NAT网卡1.png)

2. 查看NAT配置

![](/images/cobbler/NAT网卡2.png)



### 启动tftp服务

```shell
[root@cobbler ~]# systemctl start tftp.socket
[root@cobbler ~]# systemctl enable tftp.socket

```



### 启动rsync服务

```shell
[root@cobbler ~]# systemctl start rsyncd.socket
[root@cobbler ~]# systemctl enable rsyncd.socket
```



### 启动httpd服务

```shell
[root@cobbler ~]# systemctl start httpd
[root@cobbler ~]# systemctl enable httpd
# 一定要先启动httpd才能启动cobbler
```



### 准备PXE

```shell
[root@cobbler ~]# cp /usr/share/syslinux/{pxelinux.0,menu.c32} /var/lib/cobbler//loaders/
# pxelinux.0是基于网络引导时用到的bootloder引导文件，menu.c32是菜单文件
```



### 配置cobbler

```shell
[root@cobbler ~]# useradd cblrtest
[root@cobbler ~]# echo "centos" | passwd --stdin cblrtest
[root@cobbler ~]# cat /etc/shadow|grep cblrtest
[root@cobbler ~]# vim /etc/cobbler/settings
---
allow_duplicate_hostnames: 0
allow_duplicate_ips: 0
allow_duplicate_macs: 0
allow_dynamic_settings: 0
anamon_enabled: 0
authn_pam_service: "login"
auth_token_expiration: 3600
build_reporting_enabled: 0
build_reporting_sender: ""
build_reporting_email: [ 'root@localhost' ]
build_reporting_smtp_server: "localhost"
build_reporting_subject: ""
build_reporting_ignorelist: [ "" ]
cheetah_import_whitelist:
 - "random"
 - "re"
 - "time"
createrepo_flags: "-c cache -s sha"
default_kickstart: /var/lib/cobbler/kickstarts/default.ks
default_name_servers: []
default_ownership:
 - "admin"
default_password_crypted: "6$5CswA7bf$4o4nzSBWsCEU3IzWcpAloQ07P9SXp4fhHRJTkI9yxbPK9g49wsrINHMPeUjVp4JUzaiPUQfkpDW4COCJpRW0E."
# 设置新装系统的默认root密码，这是现在的root用户的密码
default_template_type: "cheetah"
default_virt_bridge: xenbr0
default_virt_file_size: 5
default_virt_ram: 512
default_virt_type: xenpv
enable_gpxe: 0
enable_menu: 1
func_auto_setup: 0
func_master: overlord.example.org
http_port: 80
kernel_options:
 ksdevice: bootif
 lang: ' '
 text: ~
kernel_options_s390x:
 RUNKS: 1
 ramdisk_size: 40000
 root: /dev/ram0
 ro: ~
 ip: off
 vnc: ~
ldap_server: "ldap.example.com"
ldap_base_dn: "DC=example,DC=com"
ldap_port: 389
ldap_tls: 1
ldap_anonymous_bind: 1
ldap_search_bind_dn: ''
ldap_search_passwd: ''
ldap_search_prefix: 'uid='
ldap_tls_cacertfile: ''
ldap_tls_keyfile: ''
ldap_tls_certfile: ''
mgmt_classes: []
mgmt_parameters:
 from_cobbler: 1
puppet_auto_setup: 0
sign_puppet_certs_automatically: 0
puppetca_path: "/usr/bin/puppet"
remove_old_puppet_certs_automatically: 0
manage_dhcp: 0
# 用Cobbler管理DHCP就改为1，但重启后不知什么原因dhcpd.conf文件与之前配置的不同，所以这里使用默认的0。
manage_dns: 0
bind_chroot_path: ""
bind_master: 127.0.0.1
manage_tftpd: 1
manage_rsync: 0
manage_forward_zones: []
manage_reverse_zones: []
next_server: 172.16.99.100
# 这是提供PXE对外的地址的。如果用Cobbler管理DHCP，修改本项
power_management_default_type: 'ipmitool'
power_template_dir: "/etc/cobbler/power"
pxe_just_once: 1
pxe_template_dir: "/etc/cobbler/pxe"
consoles: "/var/consoles"
redhat_management_type: "off"
redhat_management_server: "xmlrpc.rhn.redhat.com"
redhat_management_key: ""
redhat_management_permissive: 0
register_new_installs: 0
reposync_flags: "-l -n -d"
restart_dns: 1
restart_dhcp: 1
run_install_triggers: 1
scm_track_enabled: 0
scm_track_mode: "git"
server: 172.16.99.100
# 设置cobbler对外联系的地址
client_use_localhost: 0
client_use_https: 0
snippetsdir: /var/lib/cobbler/snippets
template_remote_kickstarts: 0
virt_auto_boot: 1
webdir: /var/www/cobbler
xmlrpc_port: 25151
yum_post_install_mirror: 1
yum_distro_priority: 1
yumdownloader_flags: "--resolve"
serializer_pretty_json: 0
replicate_rsync_options: "-avzH"
replicate_repo_rsync_options: "-avzH"
always_write_dhcp_entries: 0
proxy_url_ext: ""
proxy_url_int: ""
[root@cobbler ~]# systemctl start cobblerd
[root@cobbler ~]# systemctl enable cobblerd
[root@cobbler ~]# cobbler check
The following are potential configuration items that you may want to fix:

1 : SELinux is enabled. Please review the following wiki page for details on ensuring cobbler works correctly in your SELinux environment:
    https://github.com/cobbler/cobbler/wiki/Selinux
2 : change 'disable' to 'no' in /etc/xinetd.d/tftp
3 : Some network boot-loaders are missing from /var/lib/cobbler/loaders, you may run 'cobbler get-loaders' to download them, or, if you only want to handle x86/x86_64 netbooting, you may ensure that you have installed a *recent* version of the syslinux package installed and can ignore this message entirely.  Files in this directory, should you want to support all architectures, should include pxelinux.0, menu.c32, elilo.efi, and yaboot. The 'cobbler get-loaders' command is the easiest way to resolve these requirements.
4 : enable and start rsyncd.service with systemctl
5 : debmirror package is not installed, it will be required to manage debian deployments and repositories
6 : fencing tools were not found, and are required to use the (optional) power management features. install cman or fence-agents to use them

Restart cobblerd and then run 'cobbler sync' to apply changes.
# 如果有“httpd does not appear to be running and proxying cobbler, or SELinux is in the way. Original traceback:”的提示，那么就重启一下http服务器。
# 这是检查的结果，1是没有关SElinux，实际已经关了；2是需要将/etc/xinetd.d/tftp中的disable改为no。3是没有loader文件，可以运行提示的命令下载，没有必要；4是没有启动rsync服务，实际启动了，监听在873端口；5是与debian相关的，没有用；6是与fence设备相关，不需要
[root@cobbler ~]# vim /etc/xinetd.d/tftp 
service tftp
{
        socket_type             = dgram
        protocol                = udp
        wait                    = yes
        user                    = root
        server                  = /usr/sbin/in.tftpd
        server_args             = -s /var/lib/tftpboot
        disable                 = no
        # 此项之前是yes
        per_source              = 11
        cps                     = 100 2
        flags                   = IPv4
}

[root@cobbler ~]# systemctl restart tftp.socket
[root@cobbler ~]# cobbler check
The following are potential configuration items that you may want to fix:

1 : SELinux is enabled. Please review the following wiki page for details on ensuring cobbler works correctly in your SELinux environment:
    https://github.com/cobbler/cobbler/wiki/Selinux
2 : Some network boot-loaders are missing from /var/lib/cobbler/loaders, you may run 'cobbler get-loaders' to download them, or, if you only want to handle x86/x86_64 netbooting, you may ensure that you have installed a *recent* version of the syslinux package installed and can ignore this message entirely.  Files in this directory, should you want to support all architectures, should include pxelinux.0, menu.c32, elilo.efi, and yaboot. The 'cobbler get-loaders' command is the easiest way to resolve these requirements.
3 : enable and start rsyncd.service with systemctl
4 : debmirror package is not installed, it will be required to manage debian deployments and repositories
5 : fencing tools were not found, and are required to use the (optional) power management features. install cman or fence-agents to use them

Restart cobblerd and then run 'cobbler sync' to apply changes.
# 再次检查就没有上面第二项提示了，但要求重启cobblerd并执行命令。
[root@cobbler ~]# systemctl restart cobblerd
[root@cobbler ~]# cobbler sync
# 同步所有配置
task started: 2019-05-07_200411_sync
task started (id=Sync, time=Tue May  7 20:04:11 2019)
running pre-sync triggers
cleaning trees
removing: /var/lib/tftpboot/grub/images
copying bootloaders
copying: /var/lib/cobbler/loaders/pxelinux.0 -> /var/lib/tftpboot/pxelinux.0
copying: /var/lib/cobbler/loaders/menu.c32 -> /var/lib/tftpboot/menu.c32
copying: /usr/share/syslinux/memdisk -> /var/lib/tftpboot/memdisk
copying distros to tftpboot
copying images
generating PXE configuration files
generating PXE menu structure
rendering TFTPD files
generating /etc/xinetd.d/tftp
cleaning link caches
running post-sync triggers
running python triggers from /var/lib/cobbler/triggers/sync/post/*
running python trigger cobbler.modules.sync_post_restart_services
running shell triggers from /var/lib/cobbler/triggers/sync/post/*
running python triggers from /var/lib/cobbler/triggers/change/*
running python trigger cobbler.modules.manage_genders
running python trigger cobbler.modules.scm_track
running shell triggers from /var/lib/cobbler/triggers/change/*
*** TASK COMPLETE ***
上传镜像到服务器
[root@cobbler ~]# mount -o loop /root/CentOS-7-x86_64-DVD-1611.iso /media/
# 将系统中的镜像挂载到media/目录
[root@cobbler ~]# cobbler import --name="CentOS-7_x86_64-1503" --path=/media
task started: 2019-05-07_201016_import
task started (id=Media import, time=Tue May  7 20:10:16 2019)
Found a candidate signature: breed=redhat, version=rhel6
Found a candidate signature: breed=redhat, version=rhel7
Found a matching signature: breed=redhat, version=rhel7
Adding distros from path /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503:
creating new distro: CentOS-7-1503-x86_64
trying symlink: /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503 -> /var/www/cobbler/links/CentOS-7-1503-x86_64
creating new profile: CentOS-7-1503-x86_64
associating repos
checking for rsync repo(s)
checking for rhn repo(s)
checking for yum repo(s)
starting descent into /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503 for CentOS-7-1503-x86_64
processing repo at : /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503
need to process repo/comps: /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503
looking for /var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503/repodata/*comps*.xml
Keeping repodata as-is :/var/www/cobbler/ks_mirror/CentOS-7_x86_64-1503/repodata
*** TASK COMPLETE ***
# 导入镜像，生成distro，生成的镜像存在/var/www/cobbler/ks_mirror下。所以/var/www/cobbler要有足够的空间。
# --path 镜像路径
# --name 为安装源定义一个名字
# --arch 指定安装源是32位、64位、ia64, 目前支持的选项有: x86│x86_64│ia64
# 安装源的唯一标示就是根据name参数来定义，本例导入成功后，安装源的唯一标示就是：CentOS-7_x86_64-1503，如果重复，系统会提示导入失败。
[root@cobbler ~]# cobbler distro list
   CentOS-7-1503-x86_64
[root@cobbler ~]# cobbler profile list
   CentOS-7-1503-x86_64
# 这时查看都应该有一个刚才创建的文件名
# 镜像存放目录，cobbler会将镜像中的所有安装文件拷贝到本地一份，放在/var/www/cobbler/ks_mirror下的CentOS-7_x86_64-1503目录下。因此/var/www/cobbler目录必须具有足够容纳安装文件的空间。
[root@cobbler ~]# cobbler sync
# 同步数据。这个命令是为了将数据同步到/var/lib/tftpboot/pxelinux.cfg/default文件，也就是安装时的菜单
# cobbler check 核对当前设置是否有问题
# cobbler list 列出所有的cobbler元素
# cobbler report 列出元素的详细信息
# cobbler sync 同步配置到数据目录,更改配置最好都要执行下
# cobbler reposync 同步yum仓库
# cobbler distro 查看导入的发行版系统信息
# cobbler system 查看添加的系统信息
# cobbler profile 查看配置信息
```



### 测试

```shell
创建虚拟机，使用网络启动，之后会被分配IP地址，并提供一个安装界面。上面的cobbler会自动提供一个最小化安装的kickstart
问题：
1. No space left on device
这是因为虚拟机内存不到2G，调整为2G后解决。
```



### 指定ks.cfg文件

```shell
[root@cobbler ~]# cd /var/lib/cobbler/kickstarts/
[root@cobbler kickstarts]# ls
default.ks        legacy.ks            sample_esx4.ks   sample.ks
esxi4-ks.cfg      pxerescue.ks         sample_esxi4.ks  sample_old.seed
esxi5-ks.cfg      sample_autoyast.xml  sample_esxi5.ks  sample.seed
install_profiles  sample_end.ks        sample_esxi6.ks
# 自带很多。默认使用的ks文件为sample_end.ks。# 在第一次导入系统镜像后，Cobbler会给镜像指定一个默认的kickstart自动安装文件在/var/lib/cobbler/kickstarts下的sample_end.ks。
[root@cobbler kickstarts]# vim sample_end.ks
auth  --useshadow  --enablemd5
bootloader --location=mbr
clearpart --all --initlabel
text
firewall --enabled
firstboot --disable
keyboard us
lang en_US
url --url=$tree
selinux --disabled
firewall --disabled
# 加入关闭selinux和firewall
$yum_repo_stanza
$SNIPPET('network_config')
reboot
rootpw --iscrypted $default_password_crypted
selinux --disabled
skipx
timezone  America/New_York
install
zerombr
autopart
%pre
$SNIPPET('log_ks_pre')
$SNIPPET('kickstart_start')
$SNIPPET('pre_install_network_config')
$SNIPPET('pre_anamon')
%end
%packages
@^web-server-environment
@base
@core
@web-server
kexec-tools
%end
# 修改%packages段，这是要安装的包，这里选择安装web-server的包。
%post --nochroot
$SNIPPET('log_ks_post_nochroot')
%end
%post
$SNIPPET('log_ks_post')
$yum_config_stanza
$SNIPPET('post_install_kernel_options')
$SNIPPET('post_install_network_config')
$SNIPPET('func_register_if_enabled')
$SNIPPET('download_config_files')
$SNIPPET('koan_environment')
$SNIPPET('redhat_register')
$SNIPPET('cobbler_register')
$SNIPPET('post_anamon')
$SNIPPET('kickstart_done')
%end
# [root@cobbler kickstarts]# cobbler profile edit --name=CentOS-7-1503-x86_64 --kickstart=/var/lib/cobbler/kickstarts/anaconda-ks.cfg
# 编辑profile，此命令可以修改关联的ks文件，也就是不再使用默认的ks文件。
# 另外，安装后只有根分区、boot分区和swap
```



参考：老男孩Cobbler无人值守安装教程