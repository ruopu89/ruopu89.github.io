---
title: kali使用记录
date: 2019-03-12 08:53:20
tags: kali使用
categories: 渗透测试
---

### 清理/boot/分区

```shell
 ✘ ⚡ ⚙ root@ruopu64  ~  df -h
文件系统                      容量  已用  可用 已用% 挂载点
udev                          7.7G     0  7.7G    0% /dev
tmpfs                         1.6G  9.4M  1.6G    1% /run
/dev/mapper/ruopu64--vg-root   53G   49G  2.0G   97% /
tmpfs                         7.8G   13M  7.7G    1% /dev/shm
tmpfs                         5.0M     0  5.0M    0% /run/lock
tmpfs                         7.8G     0  7.8G    0% /sys/fs/cgroup
/dev/sda1                     236M  227M     0  100% /boot
# boot分区没有空间了
⚡ ⚙ root@ruopu64  ~  dpkg --get-selections|grep linux-image
linux-image-4.14.0-kali3-amd64			install
linux-image-4.18.0-kali2-amd64			install
linux-image-4.18.0-kali3-amd64			install
linux-image-4.19.0-kali1-amd64			install
linux-image-4.19.0-kali3-amd64			install
linux-image-amd64				install
# 查看已安装的内核
 ⚡ ⚙ root@ruopu64  ~  uname -a
Linux ruopu64 4.19.0-kali3-amd64 #1 SMP Debian 4.19.20-1kali1 (2019-02-14) x86_64 GNU/Linux
# 查看正在使用的内核
 ⚡ ⚙ root@ruopu64  ~  apt autoremove linux-image-4.14.0-kali3-amd64
 # 自动删除不用的内核，这除了删除4.14版本外，4.18版本也会自动删除
  ⚡ ⚙ root@ruopu64  ~  dpkg --get-selections|grep linux-image       
linux-image-4.14.0-kali3-amd64			deinstall
linux-image-4.18.0-kali2-amd64			deinstall
linux-image-4.18.0-kali3-amd64			deinstall
linux-image-4.19.0-kali1-amd64			install
linux-image-4.19.0-kali3-amd64			install
linux-image-amd64				install
# 删除后查看，被删除的内核后标有deinstall，这表示有卸载残留
⚡ ⚙ root@ruopu64  ~  dpkg -P linux-image-4.14.0-kali3-amd64 linux-image-4.18.0-kali2-amd64 linux-image-4.18.0-kali3-amd64
# 清理卸载残留
 ⚡ ⚙ root@ruopu64  ~  dpkg --get-selections|grep linux-image
linux-image-4.19.0-kali1-amd64			install
linux-image-4.19.0-kali3-amd64			install
linux-image-amd64				install
# 再次查看就没有了
 ⚡ ⚙ root@ruopu64  ~  df -h
文件系统                      容量  已用  可用 已用% 挂载点
udev                          7.7G     0  7.7G    0% /dev
tmpfs                         1.6G  9.4M  1.6G    1% /run
/dev/mapper/ruopu64--vg-root   53G   47G  3.1G   94% /
tmpfs                         7.8G   30M  7.7G    1% /dev/shm
tmpfs                         5.0M     0  5.0M    0% /run/lock
tmpfs                         7.8G     0  7.8G    0% /sys/fs/cgroup
/dev/sda1                     236M  104M  120M   47% /boot
# boot分区也有空间了
```



### apt源

```shell
vim /etc/apt/sources.list 

#中科大（加入这一个源即可） 
deb http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib 
deb-src http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib 

#阿里云 
#deb http://mirrors.aliyun.com/kali kali-rolling main non-free contrib 
#deb-src http://mirrors.aliyun.com/kali kali-rolling main non-free contrib 

#清华大学 
#deb http://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free 
#deb-src https://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free 

#浙大 
#deb http://mirrors.zju.edu.cn/kali kali-rolling main contrib non-free 
#deb-src http://mirrors.zju.edu.cn/kali kali-rolling main contrib non-free 

#东软大学 
deb http://mirrors.neusoft.edu.cn/kali kali-rolling/main non-free contrib 
#deb-src http://mirrors.neusoft.edu.cn/kali kali-rolling/main non-free contrib 

#官方源 
#deb http://http.kali.org/kali kali-rolling main non-free contrib 
#deb-src http://http.kali.org/kali kali-rolling main non-free contrib 

#重庆大学 
#deb http://http.kali.org/kali kali-rolling main non-free contrib 
#deb-src http://http.kali.org/kali kali-rolling main non-free contrib 

# 加入上面一行即可 
apt update 
# 这样就可使用源了。 
```



### 问题解决

```shell
1. 系统提示“KDEInit无法启动/usr/bin/systemsettings5”，这时桌面上的图标均不可点，鼠标左右键在桌面上也失灵。需要关闭有问题的程序，之后才会有上面的错误提示。使用中发现是“系统设置”出了问题，需要在系统设置的图标上右键-->属性-->应用程序-->高级选项-->D-Bus注册中要选择“无”。这样就解决问题了。如果其他图标也有此问题，也可按此方法解决。

2. 新装系统后，无法安装fcitx输入法，提示有lib的软件版本不对，需要使用apt install命令按要求再装一次lib软件，千万不要使用apt autoremove命令卸载软件，或卸载任何软件，不然会出现其他问题。

3. 新装系统后，安装完各种包后，重启无法进入系统，发现是登录页面的左上角的会话中没有了相应的图形环境。需要重新安装。如：apt install kali-defaults kali-root-login desktop-base kde-plasma-desktop，安装完之后重启即可解决。
参考： https://www.52os.net/articles/kail-change-desktop-environment.html(kali切换桌面环境)

4. 安装完VMware后，无法启动，提示“GNU C Compiler(gcc)version 7.3 was not found”
gcc --version
# 现在是8.2版本
apt install -y gcc-7
# 安装7版本
rm /usr/bin/gcc
# 删除软连接
ln -s /usr/bin/gcc-7 /usr/bin/gcc
# 创建新的软链接
gcc --version
# 这时查看的版本就是7.3了。
# 再启动提示linux headers不对
apt install linux-headers-$(uname -r)
# 安装后重启系统，就可以进入软件了。

5. 调整LVM后，开机启动有问题，无法正常进入图形界面，注释/etc/fstab文件中有问题的LVM卷自动挂载后正常，进入系统后修复。

6. 挂载提示"The disk contains an unclean file system (0, 0).Metadata kept in Windows cache, refused to mount. Falling back to read-only mount because the NTFS partition is in an unsafe state. Please resume and shutdown Windows fully (no hibernation or fast restartin"
root@ruopu64:~# ntfsfix /dev/sda4
# 修复有问题的分区即可

7. 修改命令提示符
vim ~/.bashrc
export PS1='\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}\[\033[01;31    m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\]\$'
# 加入这一行后，提示符只显示当前目录
```



### 在zsh中使用find命令不能使用星号

```shell
 ⚡ root@ruopu64  ~  vim .zshrc 
 setopt no_nomatch
 # 在使用find / -name *.txt命令时，提示"zsh : no matchs found: *.txt"，在.zshrc文件中加入上面内容就可以在find命令中使用星号了。这是因为默认星号是由zsh解释的，不会传递给find命令。
```



### linux下载工具motrix

```shell
号称是一款全能的下载工具，使用上的确比以往的下载工具好用。下载地址：https://motrix.app/zh-CN/
```



### 清理家目录中的.cache文件

```shell
 ⚡ root@ruopu64  ~  df -h
文件系统                      容量  已用  可用 已用% 挂载点
udev                          7.7G     0  7.7G    0% /dev
tmpfs                         1.6G  9.8M  1.6G    1% /run
/dev/mapper/ruopu64--vg-root   53G   48G  2.8G   95% /
# root目录增长太大
 ⚡ root@ruopu64  ~  find ~/.cache -size +100M -delete
 # 清理大于100M的文件
  ⚡ root@ruopu64  ~  find ~/.cache -type f -atime +365
  # 清理日期大于365天的文件
```



### 设置开机启动

```shell
 ⚡ ⚙ root@ruopu64  ~  vim /lib/systemd/system/rc.local.service
 #  SPDX-License-Identifier: LGPL-2.1+
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

# This unit gets pulled automatically into multi-user.target by
# systemd-rc-local-generator if /etc/rc.local is executable.
[Unit]
Description=/etc/rc.local Compatibility
Documentation=man:systemd-rc-local-generator(8)
ConditionFileIsExecutable=/etc/rc.local
After=network.target

[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
RemainAfterExit=yes
GuessMainPID=no

 ⚡ ⚙ root@ruopu64  ~  vim /etc/rc.local
 #!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.

electron-ssr
/bin/bash /root/sh/Typora.sh

exit 0
# 此文件需要手动创建。服务启动后，将要启动的命令或脚本放入此文件即可。

 ⚡ ⚙ root@ruopu64  ~  systemctl start rc-local.service
# 启动服务
  ⚡ ⚙ root@ruopu64  ~  systemctl status rc-local.service
  ● rc-local.service - /etc/rc.local Compatibility
   Loaded: loaded (/lib/systemd/system/rc-local.service; static; vendo
  Drop-In: /lib/systemd/system/rc-local.service.d
           └─debian.conf
   Active: active (exited) since Fri 2019-03-22 08:15:42 CST; 7min ago
     Docs: man:systemd-rc-local-generator(8)
  Process: 4063 ExecStart=/etc/rc.local start (code=exited, status=0/S

3月 22 08:15:42 ruopu64 systemd[1]: Starting /etc/rc.local Compatibili
3月 22 08:15:42 ruopu64 systemd[1]: Started /etc/rc.local Compatibilit
lines 1-10/10 (END)
# 状态应该是active
⚡ ⚙ root@ruopu64  ~  systemctl enable rc-local
⚡ ⚙ root@ruopu64  ~  systemctl list-unit-files
# 查看开机启动项
```



### 添加用户
```shell
root@ruopu64:~#useradd -m python
root@ruopu64:~#passwd python
root@ruopu64:~#vim /etc/passwd
# 将用户的shell改为/bin/bash，默认是sh，切换到用户后没有自动补全，命令提示符也有问题，改为bash后就正常了。
```



### 修改命令提示符显示效果
```shell
vim ~/.bashrc
export PS1='\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}    \[\033[01;31m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\]\$'
# 这里就是将最后的小写w改为大写W，这条PS1的命令也是从.bashrc文件内容中的一部分复制过来的
```



### apt使用
```shell
apt-get包管理在卸载软件后不要轻易使用apt-get autoremove，否则极容易各种悲剧。如果真想卸载干净，可以用apt-get purge
```



### pycharm安装
```shell
将pycharm- 2018.3.4 .tar.gz复制 到所需的安装位置（确保您具有该目录的rw权限）
使用以下命令将pycharm- 2018.3.4 .tar.gz文件解压缩到空目录： 
tar -xzf pycharm- 2018.3.4 .tar.gz
# 新的实例必须不超过现有的提取。目标文件夹必须为空。
删除pycharm- 2018.3.4 .tar.gz以节省磁盘空间（可选）
从bin子目录运行pycharm.sh
```



### anaconda3安装
```shell
下载https://www.anaconda.com/download/，下载后是一个shell脚本，执行即可，回答都是yes或回车。使用root用户安装没有问题，使用其他用户安装时无法连接图形界面。这里有一个问题，就是要安装anaconda3后，python命令会变成anaconda3中bin目录中的python命令，这修改了系统的默认python版本，建议删除anaconda目录中bin目录下的python软链接，bin目录中的jupyter-noteboot打开后，修改第一行的内容，在python后加上3.7，也就是使用anaconda目录中bin目录下的python3.7打开jupyter-notebook，这样就可以使用jupyter-notebook了。
```



### 安装视频录制软件obs
```shell
root@ruopu64:~#apt install ffmpeg
root@ruopu64:~#apt install obs-studio
```



### 安装输入法
```shell
apt install fcitx-* -y 
im-config
# 选择fcitx作为默认输入法
vim /etc/default/im-config 
    IM_CONFIG_DEFAULT_MODE=fcitx
	#  原来的值是auto，将其改为fcitx。这一步非常关键。重启后可以使用fcitx输入法，但右上角没有输入法的显示，不明原因。
fcitx-config-gtk3
# 设置输入法

apt install kde-config-fcitx 
# 安装后就可以执行im-config，如果没有此命令就先下载 
vim /etc/X11/xinit/xinputrc
    run_im fcitx
	# 这项也一定要改

*** 下面可以不用设置
vim ~/.bashrc  
# 在最下方添加
export XMODIFIERS=@im=fcitx
export QT_IM_MODULE=xim
export GTK_IM_MODULE=xim
#export XMODIFIERS=@im=ibus
#export QT_IM_MODULE=ibus
#export GTK_IM_MODULE=ibus 
```



### 安装老版本firefox

```shell
# 因为需要连接VPN，且在linux主机上只能安装在老版本的firefox上，所以不得不先安装老版本的firefox
首先在https://pkgs.org/download/firefox中找到了一个debian7上安装的firefox-esr_52.8.0esr-1~deb7u1_amd64.deb。安装时还会依赖一些包，也需要从这个网址下载，所需包有libhunspell-1.3-0_1.3.3-3_amd64.deb、libevent-2.0-5_2.0.21-stable-3_amd64.deb、libjsoncpp0_0.6.0_rc2-3.1_amd64.deb、libffi5_3.0.10-3_amd64.deb、libpango1.0-0_1.40.5-1_amd64.deb。
 ⚡ root@ruopu64  ~  apt remove firefox-esr
 # 首先卸载之前安装的firefox
 ⚡ root@ruopu64  ~  find / -name firefox
 # 找一下是否还有残留的文件，发现只在用户家目录中有一些缓存文件，都删除即可
 ⚡ root@ruopu64  ~  gdebi firefox-esr_52.8.0esr-1\~deb7u1_amd64.deb
 # 安装老版本的firefox，如果有依赖问题，就先安装依赖包
 安装好之后，打开firefox，在地址栏输入about:config，找到最下方的xpinstall.signatures.required，双击将此项改为false。这样就可以安装未验证的插件了。
 访问https://211.99.15.34:6443下载插件，之后解压，在firefox中选择Add-ons，在页面中上方有一个小齿轮，打开后有一个Install Add-ons From File...，点击后会打开电脑的目录，在其中找到解压后的插件，根据系统，这里要选择安装64位的插件，安装后再重启，这样就可以在VPN登录页面使用帐号登录了，登录后就可以访问内网了。
```



### 忽略某个可以升级的包

```shell
⚡ ⚙ root@ruopu64  ~  apt-mark hold firefox-esr 
firefox-esr 设置为保留。
# 使用此命令可以忽略某个可以升级的包，再使用apt upgrade时就不会升级此包了。
apt-mark unhold firefox-esr
# 此命令可以解除忽略的包
```



### 连接VPN网络

```shell
当宿主机的firefox连接到VPN后，虚拟机使用NAT方式联网，就可以连接到VPN网络内，无需设置。
```



### 安装oh-my-zsh
```shell
apt install -y zsh
# 安装zsh
echo $SHELL
# 查看当前shell
cat /etc/shell
# 查看系统安装的shell
chsh -s /bin/zsh
# 修改用户shell，修改后在/etc/passwd中的用户shell也会变为/bin/zsh
重启系统用户shell生效
wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | sh
# 安装oh-my-zsh，前提是要先安装过git
vim ~/.zshrc
ZSH_THEME="agnoster"
# 修改为这个主题，个人喜欢
source .zshrc
# 加载文件生效
ls ~/.oh-my-zsh
# 这是安装后的目录，其中的lib提供了核心功能的脚本库，tools提供安装、升级等功能的快捷工具、plugins自带插件的存放位置，templates是自带的zshrc模板，也就是家目录中的.zshrc文件，temes是主题存放位置，custom是个性化配置目录，自安装的插件和主题存在这里。
主题效果查看地址：https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
zsh学习地址：https://www.ibm.com/developerworks/cn/linux/shell/z/
```



### tilix
```shell
apt install -y tilix
# 一款不错的linux终端仿真器
下载配色方案，https://www.ctolib.com/Gogh.html，这里提供了一个配色方法，大根提供进200种方案，如果选择ALL，表示全部安装，或只输入要安装的方案的编号即可。如果安装全部，可能会比较慢。在https://mayccoll.github.io/Gogh/中有配色方案的样例。
bash -c  "$(wget -qO- https://git.io/vQgMr)"
# 运行此命令即可安装配色方案。个人比较喜欢Mona Lisa这个方案，还有google的，github的，方案号有50，52，53，89，
apt install dconf-cli
# 安装配色方案前要安装此包。

配色方案支持的终端
Supported terminals:
   mintty and deriviates
   guake
   iTerm2
   elementary terminal (pantheon/elementary)
   mate-terminal
   gnome-terminal
   tilix
```



### mate-terminal
```shell
apt install mate-terminal
# 这个终端使用起来更好用一些
bash -c  "$(wget -qO- https://git.io
# 在选择安装后，可以试着选n来安装使用，这需要尝试，当使用y会有dconf的错误提示的时候可以这样试一下。
安装主题后，这个终端是通过新建配置文件来修改终端主题的，安装一个主题后就可以创建一个新的配置文件了。但在设置时还是会有一些混乱的问题，需要反复测试。
root@ruopu:~# mv /usr/bin/konsole{,.bak}
root@ruopu:~# mv /usr/bin/mate-terminal.wrapper /usr/bin/konsole
# 这只是修改默认终端的权宜之计，还没有找到更好的办法。另外，一定要修改mate-terminal.wrapper，如果修改的是mate-terminal是打不开终端的。
```



### 修改程序默认终端模拟器
```shell
root@ruopu64:~#mv /usr/bin/konsole{,.bak}
root@ruopu64:~#ln -sv /usr/bin/tilix.wrapper /usr/bin/konsole
# 这样打开终端时就会使用tilix了。
# 尝试使用root@ruopu64:~#update-alternatives --config x-terminal-emulator命令修改没有成功
# 在设置中的应用程序中修改默认打开的终端也没有成功
```



### vmware-workstation
```shell
安装vmware-workstation15，安装完成后启动提示“Kernel Headers for version X.X.XX-XX-XX were not found”
解决办法
apt install linux-headers-$(uname -r)
# 安装这个头文件后，启动就正常了
```



### 网易云音乐
```shell
直接无法启动，没有反应
 vim /usr/share/applications/netease-cloud-music.desktop
    ...
    Exec=netease-cloud-music --o-sandbox %U
    ...
# 修改上面一行的设置
如果上面的设置不起作用，就需要使用sudo启动软件了
sudo netease-cloud-music
```



### 启动盘制作软件
```shell
官网：https://unetbootin.github.io/linux_download.html
下载binary文件
chmod +x unetbootin-linux
./unetbootin-linux
# 在官网上有安装的方法可以查看
```



### 截图软件
```shell
apt install flameshot
设置>工作区>快捷键>全局快捷键，之后选择加号，然后选择要使用快捷键的程序，在右侧设置此程序的快捷键。
```



### 固态硬盘优化
```shell
sudo hdparm -I /dev/sdx | grep "TRIM supported"
# 查看固态硬盘是否支持trim
vim fstrim.sh
    #!/bin/sh
    LOG=/var/log/trim.log
    echo "*** $(date -R) ***" >> $LOG
    fstrim -v / >> $LOG
    fstrim -v /home >> $LOG
chmod +x fstrim.sh
crontab -e
    0 9 * * * /bin/bash /root/sh/fstrim.sh
# 每天9点定时执行
```



### kali启动盘制作
```shell
U盘安装KaliLinux时，用win32diskimager将镜像拷到U盘中，用软碟通拷到U盘后，安装时提示启动失败。 
```



### 區域，不然會是英文，即使選了中文安裝
```shell
echo LANG="zh_CN.UTF-8" > /etc/default/locale 
reboot 
apt update 
```



### 安装SecureCRT 
```shell
1. 安装secureCRT7.3.3 
vim /etc/apt/sources.list 
deb http://ftp.de.debian.org/debian jessie main 
# 因为安装secureCRT7.3.3需要先安装libssl1.0.0，但kalilinux中安装的是1.0.2版本，所以要加入一个源地址。这个源很关键，对于之后安装如google，很有用。 
apt update 
apt install libssl1.0.0 
gdebi scrt-7.3.3-779.ubuntu13-64.x86_64.deb 
# 要用gdebi，用dpkg不能安装 
perl securecrt_linux_crack.pl /usr/bin/SecureCRT 

2. 启动SecureCRT 

3. 将perl命令的执行结果输入到SecureCRT中即可

4. options-> session Options -> Terminal -> audio bell （删除勾选）
# 关闭SecureCRT输入命令时按Tab的声音
```



### 安装tofrodos
```shell
apt install tofrodos
# 此包安装后有两个命令，todos和fromdos，相当于unix2dos和dos2unix。
```



### 文件对比软件

```shell
apt install -y meld
```



### 安装jq命令
```shell
apt install jq
# jq命令可以将json格式文件格式化
```



### google-chrome不能启动
```shell
下载chrome：wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

從官網下載瀏覽器，启动時會有報錯，但可以使用google-chrome-stable --no-sandbox啟動。 

vim /usr/bin/google-chrome 
    exec -a "$0" "$HERE/chrome" "$@" --user-data-dir --no-sandbox
# 无法直接启动谷歌浏览器，要在启动文件中修改上面一行，在配置文件的最后一行 
或者 
google-chrome --no-sandbox 
# 用此种方法也可以启动 
# 启动chromium浏览器也可用此方法
```



### 远程连接软件
```shell
apt install remmina*
```



### 视频播放软件
```shell
apt install -y smplayer
```



### 记录软件
```shell
apt install -y keepnote
```



### 邮件客户端
```shell
apt install thunderbird evolution
# 这两个客户端都可以使用
```



### everynote云笔记
```shell
apt install nixnote2
```



### vmware虚拟机自动挂起
```shell
挂起是虚拟机的操作本身的休眠功能，关闭即可。如win7的休眠功能
```



### kali制作启动盘工具
```shell
安装live-usb-install-2.5.12-all.deb
下载地址：http://live.learnfree.eu/wp-content/uploads/2017/12/wp-static-html-output-1-lokster/download/
```



### PDF阅读器
```shell
apt install okular
按F6快捷键打开注释功能
参考：https://blog.csdn.net/yangzhongxuan/article/details/8242740
```



### 安装kvm
```shell
root@ruopu64:~#apt install -y qemu-kvm  bridge-utils virt-manager python-libvirt
# python-libvirt一定要安装，不然安装时会报错。
root@ruopu64:~#systemctl start libvirtd
root@ruopu64:~#systemctl status libvirtd

# 下面安装网桥
root@ruopu64:~#vim /etc/network/interfaces
# This file describes the network interfaces available on your system                 
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*
 
# The loopback network interface
auto lo
iface lo inet loopback

auto bridge0
iface bridge0 inet static
address 192.168.1.9
broadcast 192.168.1.255
netmask 255.255.255.0
gateway 192.168.1.1
bridge_ports eth1
bridge_stp off
bridge_waitport 0
bridge_fd 0
# 添加网桥
root@ruopu64:win7#/etc/init.d/networking restart
# 重启网卡
root@ruopu64:win7#vim /etc/resolv.conf
nameserver 114.114.114.114
# 配置网卡后，网桥与桥接的网卡都要启动才行。
重启电脑
root@ruopu64:networks#virsh net-list 
 Name      State    Autostart   Persistent
--------------------------------------------
 default   active   yes         yes
# 下面可以安装虚拟机
```