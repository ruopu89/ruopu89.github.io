---
title: kali使用记录
date: 2019-03-12 08:53:20
tags: kali使用
categories: 渗透测试
---

### 软件安装

#### 需要安装的包

```shell
sudo apt install -y tmux fping mtr htop net-tools bind9utils gimp axel screenfetch preload okular xarchiver meld jq remmina* smplayer keepnote thunderbird evolution tofrodos ffmpeg obs-studio indicator-china-weather nethogs ethstatus bmon gufw fish audacity ark cherrytree catfish telegram-desktop gpick unar folder-color
# gimp是作图工具
# axel是命令行下载工具
# screenfetch是显示系统信息的
# preload安装即可，开机时会将数据预加载到内存中。
# okular为PDF阅读器，按F6快捷键打开注释功能。参考：https://blog.csdn.net/yangzhongxuan/article/details/8242740
# xarchiver为解压缩软件
# meld是文件对比软件
# jq命令可以将json格式文件格式化
# remmina是远程连接软件
# smplayer为视频播放软件
# keepnote为树状记录软件
# thunderbird evolution均为邮件管理软件
# 此包安装后有两个命令，todos和fromdos，相当于unix2dos和dos2unix。
# ffmpeg obs-studio是视频录制软件及依赖包
# indicator-china-weather是优客天气
# nethogs可以查看实时进程网络占用，例：nethogs wlan0
# ethstatus可以监控实时的网卡带宽占用，例：ethstatus -i wlan0
# bmon可以监控网卡状态，例：bmon -p wlan0，输入g控制流量面板的显示和隐藏，输入d控制详情信息的显示和隐藏，输入q退出面板。可以配合nginx部署通过浏览器监控网络
# Netspeed是拥有GUI界面实时显示网速的工具，未测试
# sudo add-apt-repository ppa:ferramroberto/linuxfreedomlucid && sudo apt-get update 
# 添加源：sudo apt-get install netspeed
# gufw为ufw防火墙的图形界面。Uncomplicated FireWall，是 debian 系发行版中为了轻量化配置
# iptables 而开发的一款工具。使用本机及本机中的虚拟机测试不出防火墙的效果，使用其他主机可以。原因是虚拟
# 机使用了NAT联网的方式
# fish是一个命令行提示工具，安装后，要运行fish到一个新的shell中才能使用其功能。源：apt-add-repository ppa:fish-shell/release-2
# audacity为录音软件
# ark为解压缩软件
# cherrytree为树状记录软件
# catfish为搜索软件
# gpick是取色工具，用空格取色
# unar是一个几乎支持所有格式并能自动识别编码的解压工具，对付unzip解压后文件名乱码的压缩包尤为有效
# folder-color可以改变文件夹的外观，安装后使用nautilus -q 退出文件夹，再打开时在文件夹上右键就可以设置了
```



#### ubuntu18.04 鼠标插入时，自动关闭触摸板

```shell
sudo add-apt-repository ppa:atareao/atareao
sudo apt update
sudo apt install touchpad-indicator
# 安装后，可以使用命令行启动touchpad-indicator，启动后可能看不到设置页面，但在屏幕上方可
# 以看到一个触摸板的图标，可以左键点击它进行设置，设置页面第一个标签页可以设置快捷键，快捷键
# 可以打开或关闭触摸板。第二个标签页第一项是设置插入鼠标就禁用触摸板的，第三个标签页可以设置
# 在开机的时候就启动这个小程序
```



#### oh-my-zsh及问题解决

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

-------------------
   oh-my-zsh配置
-------------------
***下面是安装历史命令提示功能***
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

***语法高亮功能***
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

***history-substring-search 插件***
$ git clone https://github.com/zsh-users/zsh-history-substring-search.git $ZSH_CUSTOM/plugins/history-substring-search
# 历史命令搜索插件，如果和 zsh-syntax-highlighting 插件共用，要配置到语法高亮插件之后。
# 效果是上下键查询历史命令记录，可模糊匹配历史命令记录中任意字符串。


vim ~/.zshrc
export ZSH="/home/shouyu/.oh-my-zsh"
ZSH_THEME="agnoster"
# 修改为这个主题，个人喜欢。主题也可以使用random，每次打开一个终端窗口时都会随机打开一个主题
export PATH=/usr/bin:/usr/sbin:/bin:/sbin:/opt/electron-ssr:/usr/local/bin:/usr/local/sbin:/usr/local/jdk1.8/jdk1.8.0_211/bin/:/home/shouyu/anaconda3/bin
setopt no_nomatch
if [[ -r /usr/local/lib/python2.7/dist-packages/powerline/bindings/zsh/powerline.zsh ]];then
    source /usr/local/lib/python2.7/dist-packages/powerline/bindings/zsh/powerline.zsh
fi
plugins=(git battery zsh-autosuggestions zsh-syntax-highlighting z web-search sudo history-substring-search)
# z插件可以快速跳转目录
# web-search可以在命令行使用百度、必应、google搜索，如：google abc，这表示打开默认浏览器在google中搜索abc
# sudo插件可以在使用sudo时按两次ECS
# history-substring-search是历史自动补全命令，oh-my-zsh 自带插件
# 加入battery是因为使用命令行时会提示"zsh: command not found: battery_pct_prompt"

export HISTSIZE=10000
# 历史纪录条目数量，测试时用echo查看这个变量是50000，不知是在哪儿定义的
export SAVEHIST=10000
# 注销后保存的历史纪录条目数量
export HISTFILE=~/.zhistory
# 历史纪录文件，这会在家目录自动生成此文件
setopt EXTENDED_HISTORY
# 为历史纪录中的命令添加时间戳，在查看.zsh_history和.zhistory时可以看到命令前有时间戳
setopt INC_APPEND_HISTORY
#以附加的方式写入历史纪录
setopt HIST_IGNORE_DUPS
# 如果连续输入的命令相同，历史纪录中只保留一个
setopt AUTO_PUSHD
# 启用 cd 命令的历史纪录，cd -[TAB]进入历史路径
setopt PUSHD_IGNORE_DUPS
# 相同的历史路径只保留一个
HIST_STAMPS="yyyy-mm-dd"
# 给history命令的输出添加时间
DISABLE_UPDATE_PROMPT=true
# 自动更新oh-my-zsh

source $ZSH/oh-my-zsh.sh
=======================================================================================
source .zshrc
# 加载文件生效
ls ~/.oh-my-zsh
# 这是安装后的目录，其中的lib提供了核心功能的脚本库，tools提供安装、升级等功能的快捷工具、plugins自带插件的存放位置，templates是自带的zshrc模板，也就是家目录中的.zshrc文件，temes是主题存放位置，custom是个性化配置目录，自安装的插件和主题存在这里。
主题效果查看地址：https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
zsh学习地址：https://www.ibm.com/developerworks/cn/linux/shell/z/

===============================
  在zsh中使用find命令不能使用星号
===============================
⚡ root@ruopu64  ~  vim .zshrc 
setopt no_nomatch
# 在使用find / -name *.txt命令时，提示"zsh : no matchs found: *.txt"，在.zshrc文件中加入上面内容就可以在find命令中使用星号了。这是因为默认星号是由zsh解释的，不会传递给find命令。
 
=====================================
  除kde桌面外，其他桌面环境命令行显示问题
=====================================
# 原因是没有安装Powerline字体，按下面方法操作后，重启终端即可解决。
wget https://raw.githubusercontent.com/powerline/powerline/develop/font/10-powerline-symbols.conf
wget https://raw.githubusercontent.com/powerline/powerline/develop/font/PowerlineSymbols.otf
sudo mkdir /usr/share/fonts/OTF
sudo cp 10-powerline-symbols.conf /usr/share/fonts/OTF/
sudo mv 10-powerline-symbols.conf /etc/fonts/conf.d/
sudo mv PowerlineSymbols.otf /usr/share/fonts/OTF/

=====================
   手动更新oh-my-zsh
=====================
upgrade_oh_my_zsh 
```



#### FinalShell

```shell
# 一款远程连接工具
wget www.hostbuf.com/downloads/finalshell_install_linux.sh
chmod +x finalshell_install_linux.sh
./finalshell_install_linux.sh
安装路径
/usr/lib/FinalShell/
配置文件路径
/home/$USER/.finalshell/
```



#### telegram

```shell
https://github.com/telegramdesktop/tdesktop/releases
https://desktop.telegram.org/
```



#### 即时通讯客户端

```shell
可以看一下franz，但似乎会收费。需要注册一个franz帐号才能使用。可以管理twitter、gmail等。地址：https://meetfranz.com/
```



#### tilix

```shell
apt install -y tilix
# 一款不错的linux终端仿真器
下载配色方案，https://www.ctolib.com/Gogh.html，这里提供了一个配色方法，大根提供进200种方案，如果选择ALL，表示全部安装，或只输入要安装的方案的编号即可。如果安装全部，可能会比较慢。在https://mayccoll.github.io/Gogh/中有配色方案的样例。
bash -c  "$(wget -qO- https://git.io/vQgMr)"
# 运行此命令即可安装配色方案。个人比较喜欢Mona Lisa这个方案，还有google的，github的，方
# 案号有04，05，07，12，51，53，54，56，90，172
apt install dconf-cli
# 安装配色方案前要安装此包。

--------------
  修改默认终端
--------------  
shouyu@shouyu-pc  ~  sudo update-alternatives --config x-terminal-emulator
# 执行命令后会让用户选择默认终端，选择后即可修改。如下：
 Selection    Path                             Priority   Status
------------------------------------------------------------------------------------
* 0            /usr/bin/gnome-terminal.wrapper   40        auto mode
  1            /usr/bin/gnome-terminal.wrapper   40        manual mode
  2            /usr/bin/tilix.wrapper            30        manual mode

Press <enter> to keep the current choice[*], or type selection number: 2
update-alternatives: using /usr/bin/tilix.wrapper to provide /usr/bin/x-terminal-emulator (x-terminal-emulator) in manual mode

---------------------
   配色方案支持的终端
---------------------
Supported terminals:
   mintty and deriviates
   guake
   iTerm2
   elementary terminal (pantheon/elementary)
   mate-terminal
   gnome-terminal
   tili
```



#### meta-terminal

```shell
apt install mate-terminal
# 这个终端使用起来更好用一些
bash -c  "$(wget -qO- https://git.io/vQgMr)"
# 在选择安装后，可以试着选n来安装使用，这需要尝试，当使用y会有dconf的错误提示的时候可以这样试一下。
安装主题后，这个终端是通过新建配置文件来修改终端主题的，安装一个主题后就可以创建一个新的配置文件了。但在设置时还是会有一些混乱的问题，需要反复测试。
root@ruopu:~# mv /usr/bin/konsole{,.bak}
root@ruopu:~# mv /usr/bin/mate-terminal.wrapper /usr/bin/konsole
# 这只是修改默认终端的权宜之计，还没有找到更好的办法。另外，一定要修改mate-terminal.wrapper，如果修改的是mate-terminal是打不开终端的。
```



#### 远程终端Terminus & Termius

```shell
Terminus下载地址：https://github.com/Eugeny/terminus
# 主题已经安装，无需像tilix那样自己再安装主题。可配置性很高。
Termius下载地址：https://www.termius.com/
# 这个软件可以创建用户并登录，它可以记录用户登录的帐户信息并在其他电脑上同步。
```



#### SecureCRT 

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

=======================================================================================
安装SecureCRT8.3.4、SecureFX8.3.4。这里的安装与上面一样，只要注意，在注册软件时，如果.pl文件中的内容与下面的内容不附，请修改.pl文件中的内容与下面内容一致，不然无法注册。安装时主要是SecureFX8.3.4的注册文件有问题。
# SecureCRT8.3.4
License:
	Name:		xiaobo_l
	Company:	www.boll.me
	Serial Number:	03-94-294583
	License Key:	ABJ11G 85V1F9 NENFBK RBWB5W ABH23Q 8XBZAC 324TJJ KXRE5D
	Issue Date:	04-20-2017

# SecureFX8.3.4
License:
	Name:	ygeR
	Company:	TEAM ZWT
	Serial Number:	06-70-001589
	License Key:	ACUYJV Q1V2QU 1YWRCN NBYCYK ABU767 D4PQHA S1C4NQ GVZDQF
	Issue Date:	03-10-2017
```



#### tmux-powerline并添加天气

```shell
shouyu@shouyu-pc  ~  git clone https://github.com/erikw/tmux-powerline.git
# 克隆到家目录中
shouyu@shouyu-pc  ~  vim .tmux.conf
# 创建配置文件并加入下面内容
set-option -g status on                                                  
set-option -g status-interval 2
set-option -g status-justify "centre"
set-option -g status-left-length 60
set-option -g status-right-length 60
set-option -g status-left "#(~/tmux-powerline/powerline.sh left)"
set-option -g status-right "#(~/tmux-powerline/powerline.sh right)"
set-window-option -g window-status-current-format "#[fg=colour235,bg=colour27] #[fg=colour255,bg=colour27] #I #W #[fg=colour27,bg=colour235] "
set-window-option -g mouse on
# 这一条是设置在所有窗口中启用鼠标滚动

shouyu@shouyu-pc  ~  tmux
# 测试是否可以看到命令行窗口下面的信息，在ubuntu18.04上按上面方法配置后，发现打开tmux后命
# 令行下面只有一个绿色的横条，之后将窗口放大，才能看到绿色的横条变成了一些有用的信息

# 添加天气方法
shouyu@shouyu-pc  ~  cd ~/tmux-powerline 
# 到克隆的项目中
shouyu@shouyu-pc  ~/tmux-powerline   master ●  ./generate_rc.sh 
# 执行generate_rc.sh脚本
shouyu@shouyu-pc  ~/tmux-powerline   master ●  mv ~/.tmux-powerlinerc.default ~/.tmux-powerlinerc
# 把生成的文件改名
shouyu@shouyu-pc  ~/tmux-powerline   master ●  vim segments/weather.sh
TMUX_POWERLINE_SEG_WEATHER_LOCATION="CHXX0008" 
# 修改TMUX_POWERLINE_SEG_WEATHER_LOCATION为当地的城市代码，因为要使用雅虎的服务，所以
# 需要到雅虎的网站查看城市代码，但找到的网页提示已经不再使用之前的域名，所以想直接找城市代码
# 有一些麻烦，在百度上找到一个，仅供参考。
# 地址：https://wenku.baidu.com/view/35cc2b10cf84b9d529ea7a35.html
# 安装后发现只是在右下角显示详细的时间，并没有天气情况
```



#### powerline-status

```shell
# 官方使用手册：https://powerline.readthedocs.io/en/master/
# 在ubuntu18.04上测试成功
1. sudo apt install python-pip
2. sudo pip install powerline-status
# 这里的pip应该使用的pip2版本
3. git clone https://github.com/powerline/fonts.git && cd fonts && sh ./install.sh
# 克隆安装字体，在家目录中运行即可
4. 设置vim使用powerline
vim .vimrc
set rtp+=/usr/local/lib/python2.7/dist-packages/powerline/bindings/vim/
set laststatus=2
set t_Co=256 
5. github上提供的bash和zsh方法，会使命令行改变显示效果，与oh-my-zsh有冲突，所以在root
用户进行此设置。github上提供的下面两个配置文件路径有问题，均提供成了
/usr/local/lib/python2.7/site-packages/powerline/bindings/bash/powerline.sh
查看发现site-packages目录中没有任何东西
=========
 .bashrc
=========
root  ~  vim .bashrc 
if [ -f /usr/local/lib/python2.7/dist-packages/powerline/bindings/bash/powerline.sh ];then
        source /usr/local/lib/python2.7/dist-packages/powerline/bindings/bash/powerline.sh
fi
=========
 .zshrc
=========
if [[ -r /usr/local/lib/python2.7/dist-packages/powerline/bindings/zsh/powerline.zsh ]];then
    source /usr/local/lib/python2.7/dist-packages/powerline/bindings/zsh/powerline.zsh
fi
6. .tmux.conf的配置，未测试
source /usr/local/lib/python2.7/dist-packages/powerline/bindings/tmux/powerline.conf
set-option -g default-terminal "screen-256color"
```



#### 截图软件

```shell
apt install flameshot
设置>工作区>快捷键>全局快捷键，之后选择加号，然后选择要使用快捷键的程序，命令使用 flameshot gui，在右侧设置此程序的快捷键。

⚡ root@ruopu64  ~  apt install deepin-screenshot
# 这个软件在xfce4环境下更管用，在xfce4环境中安装上面的软件打不开。
```



#### Wunderlist奇妙清单

```shell
下载地址：https://github.com/edipox/wunderlistux/releases/tag/v0.0.9-linux-x64
# 可能下载deb，AppImage，和原码包。使用deb包安装即可，桌面图标显示有问题，可以在命令行使
# 用wunderlist &运行
参考：https://sourcedigit.com/21169-install-wunderlist-app-wunderlistux-ubuntu-16-10-ubuntu-16-04/
```



#### apt-fast

```shell
sudo add-apt-repository ppa:apt-fast/stable
sudo apt-get install apt-fast
# 会弹出一些信息要求选择，按默认选择即可
sudo apt-fast upgrade
# 没有命令补全，有点不好。
```



#### GitKraken

```shell
官网：https://www.gitkraken.com/，首页左侧有git客户端下载，安装即可。
```



#### linux下载工具motrix

```shell
号称是一款全能的下载工具，使用上的确比以往的下载工具好用。下载地址：https://motrix.app/zh-CN/
```



#### linux下载工具XDM

```python
据称是可以大幅度提高下载速度的免费下载工具，可以在设置中打开并添加浏览器插件，下载后执行shell脚本即可。
地址：http://xdman.sourceforge.net/
```



#### pycharm

```shell
将pycharm- 2018.3.4 .tar.gz复制 到所需的安装位置（确保您具有该目录的rw权限）
使用以下命令将pycharm- 2018.3.4 .tar.gz文件解压缩到空目录： 
tar -xzf pycharm- 2018.3.4 .tar.gz
# 新的实例必须不超过现有的提取。目标文件夹必须为空。
删除pycharm- 2018.3.4 .tar.gz以节省磁盘空间（可选）
从bin子目录运行pycharm.sh

# pycharm启动器
[Desktop Entry]
Type = Application      
Name = Pycharm
GenericName = Pycharm
Comment = Pycharm:The Python IDE
Exec = "your_dir/pycharm-2017.3.1/bin/pycharm.sh"
Icon = your_dir/pycharm-2017.3.1/bin/pycharm.png
Terminal = pycharm
Categories = Pycharm
```



#### anaconda3

```shell
下载https://www.anaconda.com/download/，下载后是一个shell脚本，执行即可，回答都是yes或回车。使用root用户安装没有问题，使用其他用户安装时无法连接图形界面。这里有一个问题，就是要安装anaconda3后，python命令会变成anaconda3中bin目录中的python命令，这修改了系统的默认python版本，建议删除anaconda目录中bin目录下的python软链接，bin目录中的jupyter-noteboot打开后，修改第一行的内容，在python后加上3.7，也就是使用anaconda目录中bin目录下的python3.7打开jupyter-notebook，这样就可以使用jupyter-notebook了。
```



#### 7zip

```shell
sudo apt install p7zip
7z x Windows.iso
# 解压iso文件
7z l Windows.iso
# 查看压缩文件的内容
7zr a win10.7z cn_windows_10_multi-***.iso
# 创建压缩文件
```



#### 安装tcping

```shell
sudo apt install tcptraceroute
# 如果不安装此包，使用tcping时会没有显示
wget -O tcping https://soft.mengclaw.com/Bash/TCP-PING
# 下载命令包并重命名为tcping
chmod +x tcping
sudo cp -a tcping /usr/bin/
source .zshrc
```



#### glances

```shell
wget -O- https://bit.ly/glances | /bin/bash
# 使用此方法安装比较完整。安装过程时间比较长。不可使用apt安装，
# 因为安装后会有python的报错。
glances -w
# 使用此命令后，即可打开网页http://0.0.0.0:61208/查看监控的页面了。
# 测试发现，这样在前台运行，在使用浏览器打开时显示没有问题。如果使用nohup在后台运行，
# 使用浏览器打开时，显示不了CPU、MEM、SWAP的百分比与代表百分比的线条。在前台运行后，使用
# Ctrl+z放到后台，再用bg %1在后台运行显示也没有问题。再次测试，发现如果不使用nohup，只
# 使用&在后台运行，显示是没有问题的。
glances -t 2
# Glances 的默认刷新频率是 1 （秒），但是你可以通过在终端指定参数来手动定义其刷新频率

=======================================================================================
Glances 的选项

· a – 对进程自动排序
· c – 按 CPU 百分比对进程排序
· m – 按内存百分比对进程排序
· p – 按进程名字母顺序对进程排序
· i – 按读写频率（I/O）对进程排序
· d – 显示/隐藏磁盘 I/O 统计信息
· f – 显示/隐藏文件系统统计信息
· n – 显示/隐藏网络接口统计信息
· s – 显示/隐藏传感器统计信息
· y – 显示/隐藏硬盘温度统计信息
· l – 显示/隐藏日志（log）
· b – 切换网络 I/O 单位（Bytes/bits）
· w – 删除警告日志
· x – 删除警告和严重日志
· 1 – 切换全局 CPU 使用情况和每个 CPU 的使用情况
· h – 显示/隐藏这个帮助画面
· t – 以组合形式浏览网络 I/O
· u – 以累计形式浏览网络 I/O
· q – 退出（‘ESC‘ 和 ‘Ctrl&C‘ 也可以）

Glances 中颜色的含义

· 绿色：OK（一切正常）
· 蓝色：CAREFUL（需要注意）
· 紫色：WARNING（警告）
· 红色：CRITICAL（严重）
阀值可以在配置文件中设置，一般阀值被默认设置为（careful=50、warning=70、critical=90）。
我们可以按照自己的需求在配置文件（默认在 /etc/glances/glances.conf）中自定义。
=======================================================================================
```



#### albert

```shell
# albert类似mac的alfred。可以搜索包括主机与网络上的信息。

1. 下载deb包，也可以添加repo地址
下载地址：http://download.opensuse.org/repositories/home:/manuelschneid3r/xUbuntu_16.04/amd64/albert_0.16.1_amd64.deb.mirrorlist，下载包名：albert_0.16.1_amd64.deb。这是opensuse包的下载地址，里面会包含其他发行版的包。
# sudo add-apt-repository ppa:nilarimogard/webupd8，此命令显示超时。如果可以使用，之后更新软件库，
# 就可以使用apt安装albert了。
2. 安装时可能还需要依赖其他包，可以到https://pkgs.org下载。
3. 第一次启动时需要设置一下快捷键，另外需要设置一下要搜索的位置
```



#### 输入法fcitx

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



#### everynote云笔记

```shell
apt install nixnote2

whatever是一款evernote第三方客户端，下载地址：https://sourceforge.net/projects/whatever-evernote-client/files/v1.0.0/Whatever_1.0.0_amd64.deb/download。登录有些慢，功能可以使用，问题还是图片粘贴有问题。

tusk是另一款evernote第三方客户端，下载地址：https://github.com/klaussinani/tusk/releases/tag/v0.22.0
使用中发现两个问题，一是打开软件需要等待较长时间，才能登录evernote，大概三至五分钟。第二是复制到软件内的图片无法显示，如果单独再复制一次，在网页版的evernote上就会看到两张同样的图片。
```



#### 启动盘制作软件

```shell
官网：https://unetbootin.github.io/linux_download.html
下载binary文件
chmod +x unetbootin-linux
./unetbootin-linux
# 在官网上有安装的方法可以查看。执行时可能界面显示有问题

sudo add-apt-repository ppa:gezakovacs/ppa
sudo apt-get update
sudo apt-get install unetbootin
# 使用此方法也可以安装
sudo QT_X11_NO_MITSHM=1 /usr/bin/unetbootin
# 执行软件时会提示必须以root用户执行，并使用上面命令
=======================================================================================
# 此软件为启动盘制作工具，地址：https://www.balena.io/etcher/。下载相应版本的AppImage版本，
# 之后直接执行这个下载的软件即可。

另一种安装方法：
1. 添加Etcher debian存储库：
echo  “ deb https://deb.etcher.io stable etcher ”  | sudo tee /etc/apt/sources.list.d/balena-etcher.list
2. 信任Bintray.com的GPG密钥：
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 379CE192D401AB61
3. 更新并安装：
sudo apt-get update
sudo apt-get install balena-etcher-electron

卸载
sudo apt-get del balena-etcher-electron
sudo rm /etc/apt/sources.list.d/balena-etcher.list
sudo apt-get update
安装说明地址：https://github.com/balena-io/etcher#debian-and-ubuntu-based-package-repository-gnulinux-x86x64
=======================================================================================
安装live-usb-install-2.5.12-all.deb
下载地址：http://live.learnfree.eu/wp-content/uploads/2017/12/wp-static-html-output-1-lokster/download/
```



#### 老版本firefox

```shell
# 因为需要连接VPN，且在linux主机上只能安装在老版本的firefox上，所以不得不先安装老版本的firefox
首先在https://pkgs.org/download/firefox中找到了一个debian7上安装的firefox-esr_52.8.0esr-1~deb7u1_amd64.deb。安装时还会依赖一些包，也需要从这个网址下载，所需包有libhunspell-1.3-0_1.3.3-3_amd64.deb、libevent-2.0-5_2.0.21-stable-3_amd64.deb、libjsoncpp0_0.6.0_rc2-3.1_amd64.deb、libffi5_3.0.10-3_amd64.deb、libpango1.0-0_1.40.5-1_amd64.deb。
 ⚡ root@ruopu64  ~  apt remove firefox-esr
 # 首先卸载之前安装的firefox
 ⚡ root@ruopu64  ~  find / -name firefox
 # 找一下是否还有残留的文件，发现只在用户家目录中有一些缓存文件，都删除即可
 ⚡ root@ruopu64  ~  gdebi firefox-esr_52.8.0esr-1\~deb7u1_amd64.deb
 # 安装老版本的firefox，如果有依赖问题，就先安装依赖包
 安装好之后，需要使用root权限打开firefox，在/usr/share/applications/firefox-esr.desktop中的Exec一项中，加入sudo即可。在地址栏输入about:config，找到最下方的xpinstall.signatures.required，双击将此项改为false。这样就可以安装未验证的插件了。
 访问https://211.99.15.34:6443下载插件，之后解压，先以root身份到SSLVPNClientLinux目录中执行解压后目录中的install.sh脚本，如果不到SSLVPNClientLinux目录中执行脚本会报错。之后在firefox中选择Add-ons，在页面中上方有一个小齿轮，打开后有一个Install Add-ons From File...，点击后会打开电脑的目录，在其中找到解压后的插件，根据系统，这里要选择安装64位的插件，安装后再重启，这样就可以在VPN登录页面使用帐号登录了，这里一定要注意，不可以选择密码下面的保存配置，如果选择了此项，就无法连接到内网了。登录后就可以访问内网了。
```



#### java-jdk8

```shell
下载地址：https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
下载前需要先登录
cd works/ubuntutool/java-jdk
# 进入下载目录
tar xf jdk-8u211-linux-x64.tar.gz
mv jdk1.8.0_211 /usr/local/jdk1.8
# 移动到/usr/local目录下
vim /etc/profile.d/java.sh
export JAVA_HOME=/usr/local/jdk1.8                                         
export JRE_HOME=${JAVA_HOME}/jre
source /etc/profile
$ java -version
java version "1.8.0_211"
Java(TM) SE Runtime Environment (build 1.8.0_211-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.211-b12, mixed mode)
```



#### 微信

```shell
wget https://github.com/geeeeeeeeek/electronic-wechat/releases/download/v1.4.0/linux-x64.tar.gz
tar xf linux-x64.tar.gz
./electronic-wechat-linux-x64/electronic-wechat
```



#### 钉钉

```shell
下载地址：https://pan.baidu.com/s/1NznYL5fV8sUWInmUgciXXQ。
下载后打开压缩包，是一个dingding.deb文件，使用gdebi命令安装即可。
dingding运行时的名称是dtalk，如果关闭了打开的钉钉，无法再打开钉钉，需要使用pkill dtalk杀死钉钉的进程，才能再打开钉钉。
```



#### fiddler

```shell
1. sudo apt install mono-complete
# 安装这个包是为了在linux环境中运行fiddler.exe程序，这个包可以跨平台跑.NET的程序
2. mono Fiddler.exe
# 运行程序
```



#### 监控软件netdata

```shell
apt update
apt install zlib1g-dev uuid-dev libmnl-dev gcc make autoconf autoconf-archive autogen automake pkg-config curl
# 安装Netdata的依赖项，其中包括gcc（一个C编译器），GNU Autoconf工具，GUID管理和Netdata内部Web服务器的压缩库。
apt install python python-yaml python-mysqldb python-psycopg2 nodejs lm-sensors netcat
# 下一组软件包是可选的，但Netdata推荐使用，包括Python，一些Python软件包和Node.JS。与系统包管理器捆绑在一起的稳定版Node.js适用于Netdata的要求。
git clone https://github.com/firehol/netdata.git --depth=1 ~/netdata
cd ~/netdata
./netdata-installer.sh
安装时执行回车即可，等待完成。脚本中有一步会使用curl -sSL 命令下载安装包，如果速度太慢，可以到netdata-installer.sh脚本中取消curl的这三个选项。
```



#### 微软字体

```shell
sudo apt install ttf-mscorefonts-installer
```



#### mac字体

```shell
下载Monaco字体，地址：https://github.com/todylu/monaco.ttf/blob/master/monaco.ttf?raw=true
https://github.com/cstrap/monaco-font
sudo mkdir /usr/share/fonts/mac
sudo cp -a MONACO.TTF /usr/share/fonts/mac
cd /usr/share/fonts/mac
sudo chmod 744 /usr/share/fonts/custom/Monaco.ttf
sudo mkfontscale
sudo mkfontdir
sudo fc-cache -vf	# 刷新系统字体缓存
sudo apt install gnome-tweak-tool
gnome-tweaks
# 使用此工具再设置一下默认字体，将字体大小均改为10更好一些
```



#### wine的安装与使用

```shell
sudo apt install -y wine64
# 安装系统自带的wine64位版本，也有32位版本的
==============================================================================================
# 也可用使用官方的最新版本
wget -nc https://dl.winehq.org/wine-builds/winehq.key
sudo apt-key add winehq.key
sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/
sudo apt-get install --install-recommends winehq-stable
==============================================================================================
sudo apt install --no-install-recommends winetricks
#  安装winetricks（Wine的辅助配置工具，超级便利）。--no-install-recommends选项表示避免安装非必须的文件，
# 从而减小镜像的体积
winecfg
# 初始化wine，也就是在家目录创建一个.wine目录，这个目录就相当于windows系统的C盘。
==============================================================================================
# 初始化的另一个方法 
WINEARCH=win32 WINEPREFIX=~/.win32 winecfg 
WINEPREFIX=~/.win64 winecfg
# 对于64位用户，默认创建的系统目录是64位环境的。若想使用纯32位环境，修改WINEARCH 变量win32为即可： 
# WINEARCH=win32 winecfg 这样就会生成32位Wine环境。若不设置 WINEARCH 得到的就是64位环境。
# 或可以使用初始执行winecfg或wine或winetricks，这三个命令都可以。不必执行上面的命令也可以，这会生成
# ~/.wine目录
将windows中的\windows\Fonts下的所有字体复制到/opt/wine-stable/share/wine/fonts中，这样可以解决安装的软
件有乱码的问题。
==============================================================================================
因为使用的是ubuntu官方提供的包，所以将字体复制到家目录中的.wine/drive_c/windows/Fonts目录中即可解决乱码问题。
winetricks corefonts colorprofile
winetricks fontfix fontsmooth-gray fontsmooth-rgb fontsmooth-bgr
winetricks gdiplus
winetricks d3dx9
winetricks riched20 riched30
winetricks mfc40 mfc42
winetricks vcrun6 vb6run vcrun2003 vcrun2005 vcrun2008
winetricks msxml3 msxml4 msxml6
# 安装依赖库。测试中上面四条命令执行失败了
wine uninstaller
# 在打开的窗口中可以选择卸载已安装的程序
# 安装的软件除了在~/.wine中外，在.local/share/applications中也有wine目录，安装的软件的图标就在这个wine目录中。

# 参考：https://blog.csdn.net/buildcourage/article/details/80871141、https://ywnz.com/linuxjc/2553.html
# 在使用中发现wine并不好用。不建议使用。
```



#### 鼠标主题

```shell
到https://limitland.gitlab.io/flatbedcursors/下载主题，FlatbedCursors-0.5.tar.bz2 
解压主题
将解压的目录都放入/usr/share/icons/中
```



#### 锐捷客户端

```shell
# 公司搬家之后需要使用锐捷交换机上网，所以需要安装锐捷客户端才能联网。但使用锐捷客户端无法连接。所以需要使用mentohust包进行连接验证。下面的前两步是下载安装锐捷客户端，可以忽略。
1. 下载地址：http://pan.baidu.com/s/1hrhaYrU，包名：RG_SU_For_Linux_1_30_Setup.zip
2. 解压
unzip RG_SU_For_Linux_1_30_Setup.zip
3. 下载mentohust，此包为了可以通过锐捷用户名密码验证，也解决使用锐捷脚本验证时提示"不允许使用的客户端类型"。感觉使用这个包，就不需要锐捷的软件包了。
下载地址：https://code.google.com/archive/p/mentohust/。下载包名：mentohust_0.3.4-1_amd64.deb
4. 用户名密码验证
sudo mentohust -v4.44 -w
欢迎使用MentoHUST	版本: 0.3.4
Copyright (C) 2009-2010 HustMoon Studio
人到华中大，有甜亦有辣。明德厚学地，求是创新家。
Bug report to http://code.google.com/p/mentohust/issues/list

** 网卡[1]:	enp1s0
** 网卡[2]:	wlp0s20f3
** 网卡[5]:	bluetooth0
** 网卡[6]:	nflog
** 网卡[7]:	nfqueue
** 网卡[8]:	usbmon1
** 网卡[9]:	usbmon2
?? 请选择网卡[1-9]: 1
** 您选择了第[1]块网卡。
?? 请输入用户名: guanxiaoman
?? 请输入密码: Qc3!Kp89
?? 请选择组播地址(0标准 1锐捷私有 2赛尔): 0
?? 请选择DHCP方式(0不使用 1二次认证 2认证后 3认证前): 1
** 用户名:	guanxiaoman
** 网卡: 	enp1s0
** 认证超时:	8秒
** 心跳间隔:	30秒
** 失败等待:	15秒
** 允许失败:	8次
** 组播地址:	标准
** DHCP方式:	二次认证
** 通知超时:	5秒
** DHCP脚本:	dhclient
!! 在网卡enp1s0上获取IP失败!
!! 在网卡enp1s0上获取子网掩码失败!
** 本机MAC:	e4:e7:49:3d:34:92
** 使用IP:	0.0.0.0
** 子网掩码:	255.255.255.255
** 认证参数已成功保存到/etc/mentohust.conf.
>> 寻找服务器...
** 认证MAC:	00:1a:a9:48:2a:b1
>> 发送用户名...
>> 发送密码...
** 客户端版本:	4.44
** MD5种子:	23:ed:66:15:a6:f8:dd:93:2e:63:64:a8:97:52:3d:d2
!! 缺少8021x.exe信息，客户端校验无法继续！
>> 发送用户名...
>> 发送密码...
** 客户端版本:	4.44
** MD5种子:	23:ed:66:15:a6:f8:dd:93:2e:63:64:a8:97:52:3d:d2
!! 缺少8021x.exe信息，客户端校验无法继续！
>> 认证成功!
>> 正在获取IP...
RTNETLINK answers: File exists
>> 操作结束。
!! 在网卡enp1s0上获取IP失败!
!! 在网卡enp1s0上获取子网掩码失败!
** 本机MAC:	e4:e7:49:3d:34:92
** 使用IP:	0.0.0.0
** 子网掩码:	255.255.255.255
>> 寻找服务器...
>> 发送用户名...
>> 发送密码...
** 客户端版本:	4.44
** MD5种子:	a5:3a:82:3c:58:6a:2a:00:0a:80:a9:0c:de:13:50:86
!! 缺少8021x.exe信息，客户端校验无法继续！
>> 认证成功!
>> 发送心跳包以保持在线...
# 上面需要输入和选择一些信息。另外，有一个问题，成功认证后没有分配网关地址。需要手动配置。第一次配置成功后，之后再使用sudo mentohust -v4.44 -w命令连接时就不需要再输入任何信息了，第一次输入的信息会被保存。
# 参考：https://blog.csdn.net/tales_/article/details/50533748
```



#### v2rayL安装

```shell
linux上的v2ray可视化客户端
安装
bash <(curl -s -L http://dl.thinker.ink/install.sh)
# <与()间不要有空格
更新
bash <(curl -s -L http://dl.thinker.ink/update.sh)
卸载
bash <(curl -s -L http://dl.thinker.ink/uninstall.sh)
启动
/usr/bin/v2rayL/v2rayLui
```



#### proxychains

```shell
利用proxychains让命令走代理
安装proxychains
sudo apt install proxychains
配置proxychains
sudo vim /etc/proxychains.conf
将最后一行改成：
socks5 127.0.0.1 1080
proxychains使用
proxychains wget https://www.google.com
proxychains bash
```



#### 测试网速

```shell
# Speedtest.net强大而知名的全球宽带网络速度测试网站，采用Flash载入界面，Alexa世界排名非常高，
# Speedtest.net在全球有数百个测试节点，国内有测速节点几十个。作为一款在线并且可视化的网速测试工具。
# 使用方法简单，无需下载、安装。Speedtest.net还推出了命令行下测速工具speedtest.py 就能够实时测试网速。
shouyu@shouyu-pc  ~  wget https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py
# 下载工具
shouyu@shouyu-pc  ~  chmod +x speedtest.py
# 给执行权限
shouyu@shouyu-pc  ~  ./speedtest.py 
# 执行。下面是执行结果：
Retrieving speedtest.net configuration...
Testing from Beijing Primezone Technologies (211.99.134.28)...
Retrieving speedtest.net server list...
Selecting best server based on ping...
Hosted by Beijing Unicom (Beijing) [1.67 km]: 7.089 ms
Testing download speed................................................................................
Download: 15.14 Mbit/s
Testing upload speed................................................................................................
Upload: 34.94 Mbit/s
 shouyu@shouyu-pc  /media/shouyu/C64CC89B4CC8879F/Tools/ubuntutool/网速测试  sudo cp -a speedtest.py /usr/bin
 # 将脚本入到/usr/bin目录下
shouyu@shouyu-pc  ~  source .zshrc
 # 加载环境变量
shouyu@shouyu-pc  ~  speedtest.py 
Retrieving speedtest.net configuration...
Testing from Beijing Primezone Technologies (211.99.134.28)...
Retrieving speedtest.net server list...
Selecting best server based on ping...
Hosted by Beijing Broadband Network (Beijing) [1.67 km]: 4.367 ms
Testing download speed................................................................................
Download: 15.06 Mbit/s
Testing upload speed................................................................................................
Upload: 34.47 Mbit/s
# 这时就可以直接使用此脚本了。最好有线情况测试，无线可能会超时。
# 参考：http://www.mamicode.com/info-detail-2329407.html
```



#### docker安装远程迅雷下载

```python
docker pull yinheli/docker-thunder-xware   # 下载容器
mkdir ~/thunder   # 创建一个下载目录
cd ~
docker run -d --name thunder --net=host -v $PWD/thunder:/app/TDOWNLOAD yinheli/docker-thunder-xware   # 运行容器
docker logs thunder   
# 查看绑定码，可能会报错，如果报错就使用docker restart thunder重启容器，或用stop和start也可以
登录http://yuancheng.xunlei.com，登录后要先用帐号登录，之后输入绑定码。绑定后就可以在左上角的新建中创建下载任务了。但测试感觉效果不太好，经常无法连接到本地，需要本地重启迅雷容器
```



#### xfce4桌面

```shell
apt install xfce4 xfce4-goodies kali-desktop-xfce
# xfce4是基础的包，xfce4-goodies是很多插件的包，kali-desktop-xfce安装后才能看到系统托盘中的网络图
# 标。但最后还是有一些图标在系统托盘中看不到，原因不明。
```



#### KVM安装

```shell
apt install  libvirt-daemon-system  libvirt-daemon qemu-kvm qemu virt-manager virt-viewer bridge-utils virtinst
# qemu-kvm：QEMU在KVM中主要用于虚拟化IO设备，CPU和内存虚拟化调用KVM内核模块加速实现。
# libvirt-daemon-system, libvirt-daemon：libvirt库提供虚拟机操作接口，用于控制和管理各类虚拟机。
# 安装virtinst包，提供一整套虚拟机命令行管理工具，包括安装、克隆等命令。如virt-install, virt-clone, virsh
# virt-manager,virt-viewer：图形化管理工具
systemctl enable libvirtd
systemctl start libvirtd
systemctl status libvirtd
sudo virt-manager
# 直接运行virt-manager有问题，无法创建虚拟机。如果使用root用户运行virt-manager提示"Unable to init server"，可能是root用户或sudo时执行图形化应用程序时出现，无法连接到X server显示界面，解决方法如下：
# export DISPLAY=":0"
# xhost +
# virt-manager
```



#### samba图形配置工具

```shell
下载地址：https://packages.ubuntu.com/xenial/system-config-samba
system-config-samba
# 启动时可能会提示: could not open configuration file `/etc/libuser.conf'
sudo touch /etc/libuser.conf
# 手动添加这个配置文件
# 参考：https://www.linuxidc.com/Linux/2018-01/150493.htm
```



#### 部署trojan

```python
# 服务端安装
wget -N --no-check-certificate https://raw.githubusercontent.com/mark-logs-code-hub/trojan-wiz/master/ins.sh
chmod +x ins.sh
bash ins.sh
# 部署BBR加速，需要使用root用户
wget -N --no-check-certificate "https://raw.githubusercontent.com/chiakge/Linux-NetSpeed/master/tcp.sh"
chmod +x tcp.sh
./tcp.sh
# 有多个版本，只试一下第三个锐速，其他两个没试
还需要关闭firewalld和selinux。安装过加速软件后，还可以选择安装优化配置，这些都需要重启系统。另外安装过加速内核后，还要在重启系统后再运行脚本再运行加速软件，这是与内核对应的。如果是锐速加速，要打开80和443端口。如果是BBRPlus，加打开443端口。测试魔改版BBR效果最好，BBRPlus的效果比锐速要好一些。启动魔改版BBR软件时可以选择使用暴力BBR魔改版加速(不支持部分系统)，这里使用的是Centos7.7版本，BBR魔改版只需要打开443端口。aws的EC2主机需要打开安全组中的策略，否则无法连接或是创建新安全组。测试ubuntu16.04也可以。ubuntu18.04和centos8暂时不可以使用BBR魔改版加速
==================================================================================
#检查服务
systemctl status trojan-gfw
#开启服务
systemctl start trojan-gfw
#关闭服务
systemctl stop trojan-gfw
#查看client客户端配置文件
cat /home/trojan/client.json
#修改client客户端配置文件
vi /etc/trojan/config.json
==================================================================================
下载/home/trojan目录下的ca-cert.pem、client.json到用户家目录。我这里放在了家目录中的trojanKEY中

# ubuntu19.10客户端安装
sudo add-apt-repository ppa:greaterfire/trojan
sudo apt update
sudo apt install trojan
source ~/.zshrc
trojan -c trojanKEY/client.json   
# 服务监听127.0.0.1:1080端口。不用动json文件中的地址与密码。
在chrome的SwitchyOmega中添加一条规则，使用SOCKS5代理到127.0.0.1:1080
==================================================================================
# windows客户端
windows上使用trojan需要两个客户端，一个是trojan，一个是v2rayN
v2rayN下载地址：https://github.com/2dust/v2rayN/releases/tag/3.8
# 注意需要下载v2rayN-Core.zip，不要下载v2rayN.zip
trojan下载地址：https://trojan-gfw.github.io/trojan/
使用时，将json文件和key文件放置在trojan解压出的目录中，开启trojan。之后打开v2rayN，添加socks配置，127.0.0.1:1080即可。
==================================================================================
SwitchyOmega使用白名单地址，新建profile时选择“PAC profile”，之后点击下载即可，默认代理到127.0.0.1:1080。
https://raw.githubusercontent.com/pexcn/daily/gh-pages/pac/whitelist.pac
# 参考：https://juejin.im/pin/5b546961092dcb61bd7280e4
```



#### 免费Markdown编辑器

```shell
1. Typora
2. Mark Text
GitHub 项目地址：https://github.com/marktext/marktext/
官方网站：https://marktext.app/
3. VNote
GitHub 项目地址：https://github.com/tamlok/vnote
官方网站：https://tamlok.github.io/vnote
4. Notable
GitHub 项目地址：https://github.com/notable/notable
官方网站：https://notable.md/
5. Boostnote
GitHub 项目地址：https://github.com/BoostIO/Boostnote
官方网站：https://boostnote.io/
6. Simplenote
GitHub 项目地址，Windows、Linux 版：https://github.com/Automattic/simplenote-electron
官网：https://simplenote.com/
```



### 设置方法

#### apt源

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



#### Tmux 启用鼠标滚动

```shell
1. 先按ctrl+B
2. set -g mouse on
# 这时就启用对所有窗口的鼠标滚动了，但不能选中文本进行复制粘贴
3. 按住shift再点击鼠标右键，这时就可以看到复制粘贴了，也可以选中文本了
```



#### history结果显示操作时间方法

```shell
让history命令显示时间，需要在/etc/profile中加入export HISTTIMEFORMAT="[%F %T]"。但在普通用户使用zsh时没有起作用，不明原因。
```



#### 开启bbr（tcp拥塞控制）

```shell
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p 
lsmod | grep bbr  #检查是否有tcp_bbr
```



#### Chrome浏览器开启多线程下载

```shell
打开"chrome://flags/#enable-parallel-downloading"，找到Parallel downloading，改成Enable
```



#### 调整linux内核尽量用内存，而不用swap

```shell
1.查看当前swappiness值，默认为60
　$ cat /proc/sys/vm/swappiness
2.修改swappiness值为10（临时修改，重启后即还原为默认值）
　$ sudo sysctl vm.swappiness=10
3.永久修改swappiness默认值（重启生效）
$ sudo gedit /etc/sysctl.conf
在文档的最后加上:
　　vm.swappiness=10
```



#### 用户输入密码时显示星号

```shell
sudo cp /etc/sudoers{,.bak}
sudo vim /etc/sudoers
Defaults    env_reset,pwfeedback
# 在这一行加入,pwfeedback
```



#### vim设置

```shell
在用户家目录中创建的.vimrc文件只对当前用户生效，配置后不用重新加载，立即生效。但/etc下的vimrc配置会失效，所以这个文件中要将需要的功能都写入。
vim ~/.vimrc
set nocompatible
# 不与 Vi 兼容（采用 Vim 自己的操作命令）
set nu      
# 显示行号                                                                
set hlsearch
# 搜索时，高亮显示匹配结果。
set showmatch
# 光标遇到圆括号、方括号、大括号时，自动高亮对应的另一个圆括号、方括号和大括号。
set history=1000
# Vim 需要记住多少次历史操作。
syntax on
# 打开语法高亮。自动识别代码，使用多种颜色显示。即使加载时报错，也要加入此行
set cursorline
# 光标所在的当前行高亮。
set showcmd
# 命令模式下，在底部显示，当前键入的指令。比如，键入的指令是2y3d，那么底部就会显示2y3，当键入d的时候，操作完成，显示消失。
set autoindent
# 按下回车键后，下一行的缩进会自动跟上一行的缩进保持一致。
set expandtab
# 由于 Tab 键在不同的编辑器缩进不一致，该设置自动将 Tab 转为空格。
set wrap
# 自动折行，即太长的行分成几行显示。
set incsearch
# 输入搜索模式时，每输入一个字符，就自动跳到第一个匹配的结果。
set ignorecase
# 搜索时忽略大小写。
colorscheme slate # 即使加载时报错，也要加入此行
# 调整配色方案，还有default、blue、darkblue、delek、desert、elflord、evening、industry、koehler、morning、murphy、pablo、peachpuff、ron、shine、slate、torte、zellner
highlight StatusLine guifg=SlateBlue guibg=Yellow 
highlight StatusLineNC guifg=Gray guibg=White
# 状态行颜色，不使用
set tabstop=4 
# 制表符为4
set softtabstop=4 
set shiftwidth=4
# 统一缩进为4
set rtp+=/usr/local/lib/python2.7/dist-packages/powerline/bindings/vim/
set laststatus=2
set t_Co=256

# 创建.vimrc文件后就可以在命令行中使用鼠标右键了，这是抵消了/etc/vimrc文件中的设置。

vim命令粘贴带数字或符号的信息时格式混乱解决
使用vim打开文件时，使用:set paste命令关闭缩进功能就可以解决了。如果要开启缩进功能，使用命令:set nopaste。或一种方法是，打开.vimrc文件，加入set pastetoggle=<F9>，之后可以使用F9键来切换缩进功能了。配置文件中的<F9>是按F9键录入的。

在vim中，使用%表示全文

关闭高亮
:nohl
```



#### sublime输入中文

```shell
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt update
sudo apt install sublime-text
下载的安装包启动后无法输入中文
git clone https://github.com/lyfeyaj/sublime-test-imfix.git
cd sublime-test-imfix && ./sublime-imfix
最好安装中回答Y，并使用安装源安装sublime
```



#### 创建启动器

```shell
# Linux 系统中的Desktop Entry 文件以desktop为后缀名。Desktop Entry 文件是 Linux 桌面系统中用于描述程序启动配置信息的文件。
wget https://raw.githubusercontent.com/geeeeeeeeek/electronic-wechat/master/assets/icon.png -O electronic-wechat.png
# 下载一个微信图标
mv electronic-wechat.png works/ubuntutool/electronWechat/electronic-wechat-linux-x64/
# 将图标与执行程序放在一起
vim /usr/share/applications/electronic-wechat.desktop
[Desktop Entry]                                                                 
Name=Electronic Wechat
Name[zh_CN]=微信电脑版
Name[zh_TW]=微信电脑版
Exec=/root/works/ubuntutool/electronWechat/electronic-wechat-linux-x64/electronic-wechat
Icon=/root/works/ubuntutool/electronWechat/electronic-wechat-linux-x64/electronic-wechat.png
Terminal=false
# 软件打开时是否启动终端
X-MultipleArgs=false
Type=Application
Encoding=UTF-8
Categories=Application;Utility;Network;InstantMessaging;
StartupNotify=false
编辑完上面的文件，进入/usr/share/applications 目录就可以看到一个叫微信电脑版的图标，可以在图标上右键，将其发送至桌面，之后就可以双击这个图标启动微信了。
```



#### 设置桥接

```shell
# 目前有五种方法。因为需要锐捷客户端拨号上网，所以这里只测试通过nm-connection-editor连接成功。或者说，在测试nm-connection-editor才反应过来这里的问题。

1. nmcli
# 参考：https://www.zcfy.cc/article/how-to-add-network-bridge-with-nmcli-networkmanager-on-linux
nmcli con show
nmcli connection show --active
# 取当前连接状态
nmcli con add ifname br0 type bridge con-name br0 
nmcli con add type bridge-slave ifname eno1 master br0 
nmcli connection show
# 添加新的br0网桥
nmcli con down "Wired connection 1"
# 先关闭网卡
nmcli con up br0
# 打开 br0
sudo nmcli con modify br0 bridge.stp no   
# 是不是这里改成yes就开启stp了，stp是生成树协议 
nmcli con show 
nmcli -f bridge con show br0
# 禁用 STP

2. brctl
参考：https://www.cnblogs.com/yinzhengjie/p/7446226.html
# 这种方法显得更简单，但连接后br0可以分配到地址，也可以ping通网关。但不能ping能DNS，如114
brctl addbr br0       #创建一个名称为"br0"的网卡
ifconfig eth0 0 up     #将需要桥接的网卡IP清空
brctl addif br0 eth0                       #在"br0"上添加"eth0"；
ifconfig  br0 192.168.16.107/24 up        #给"br0"配置IP；
route add default gw 192.168.16.1        #设置默认的网关地址；
brctl stp br0 on        # 开启stp服务

3. 修改/etc/netplan/50-cloud-init.yaml
network:
  version: 2
  ethernets:
    enp1s0:
      dhcp4: no
      dhcp6: no
    wlp0s20f3:
      dhcp4: yes
      dhcp6: yes

  bridges:
    br0:
      interfaces: [enp1s0]
      dhcp4: yes
# yaml文件对缩进很严格，一定要注意缩进
netplan --debug apply
# 让设置生效，生效后NetworkManager就失效了

4. nm-connection-editor 。测试发现，通过路由器直接连接到电脑后，网桥可用。但如果还要经过锐捷播号，就有问题了。
- nm-connection-editor    # 启动图形界面
- 点左下角的加号创建一个网桥 -> 在标签页桥接中点击添加 -> 选择以太网 -> 选择设备为本机的有线网卡，其他默认，保存。-> 这时在桥接标签页中就多了一个添加的以太网，其他默认，IPV4选择与本机网卡相同的配置，如DHCP或静态IP，保存。
- 删除原有的以太网卡，重启NetworkManager即可。

5. nmtui
```



#### 设置远程使用root用户登录

```shell
vim /etc/ssh/sshd_config
    PermitRootLogin yes
    # PermitRootLogin prohibit-password
# 注释一条，写入上面一条即可。
systemctl restart ssh
```



#### 固态硬盘优化

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



#### 修改默认编辑器

```shell
sudo update-alternatives --config editor
```



#### 修改程序默认终端模拟器

```shell
root@ruopu64:~#mv /usr/bin/konsole{,.bak}
root@ruopu64:~#ln -sv /usr/bin/tilix.wrapper /usr/bin/konsole
# 这样打开终端时就会使用tilix了。
# 尝试使用root@ruopu64:~#update-alternatives --config x-terminal-emulator命令修改没有成功
# 在设置中的应用程序中修改默认打开的终端也没有成功

====================================================
gsettings set org.gnome.desktop.default-applications.terminal exec /usr/bin/mate-terminal
gsettings set org.gnome.desktop.default-applications.terminal exec-arg "-x"
# 上面是设置默认打开的终端命令与选项。但这只可以设置使用Ctrl + Alt + t打开的默认终端。使用鼠标右键打开的终端并不会变。
# gsettings的使用为，先使用list-schemas查看有哪些schemas，再通过list-keys查看schemas有哪些key，再通过get可以获取key的值，使用set可以设置key的值。
====================================================
gsettings命令使用
GConf是在基于 GNOME2 的 Linux 操作系统中实现对应用程序的配置及管理功能的工具。
我们可以把 GConf 理解为 Linux 操作系统中的注册表。然而，它克服了 Windows 注册表的一些缺点，比如 Windows 注册表遭到破坏，可能会导致操作系统崩溃，而且 GConf 的配置信息存储于纯文本的文件中，可读性很好。
在 GNOME3 中，GConf 已经被 DConf/Gsettings 替代，但还是用些应用在使用 GConf。

1.dconf-editor 的使用

还可以用 dconf 进行操作，明细请通过 man dconf 查看，而 dconf-editor 是 dconf 的一个图形化操作程序。

2.使用 gsettings 编辑设置,如下示例在Ubuntu16.04上的效果

1.显示系统都安装了哪些不可重定位的schema
gsettings list-schemas

2.查看org.mate.applications-office都有哪些子schema
gsettings list-children  org.mate.applications-office

3.查看org.mate.applications-office.calendar的schema下都有哪些项(key)
gsettings list-keys org.mate.applications-office.calendar

4.查看org.mate.applications-office.calendar的schema下所有项的取值
gsettings list-recursively  org.mate.applications-office.calendar

5.查看org.mate.applications-office.calendar的schema下的项needs-term的值
gsettings get org.mate.applications-office.calendar needs-term

6.查看org.mate.applications-office.calendar的schema下的项needs-term的取值范围
gsettings range  org.mate.applications-office.calendar needs-term

7.修改设置org.mate.media-handling的schema下的项automount-open的值为true
gsettings set org.mate.media-handling automount-open  false
gsettings get org.mate.media-handling automount-open 

8. 恢复org.mate.media-handling的schema下的项automount-open的值为默认值
gsettings reset org.mate.media-handling automount-open

9. 修改org.mate.media-handling的schema下的多项值后，恢复整个schema的所有项为默认值
gsettings list-recursively org.mate.media-handling
```



#### 连接VPN网络

```shell
当宿主机的firefox连接到VPN后，虚拟机使用NAT方式联网，就可以连接到VPN网络内，无需设置。
```



#### 修改命令提示符显示效果

```shell
vim ~/.bashrc
export PS1='\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}    \[\033[01;31m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\]\$'
# 这里就是将最后的小写w改为大写W，这条PS1的命令也是从.bashrc文件内容中的一部分复制过来的
```



#### 关闭 avahi-daemon 服务

```shell
avahi-daemon造成过网络异常，用处也不大，停止服务并关闭开机启动：
sudo systemctl stop avahi-daemon.socket
sudo systemctl stop avahi-daemon.service
sudo /lib/systemd/systemd-sysv-install disable avahi-daemon

sudo systemctl disable avahi-daemon.socket
sudo systemctl disable avahi-daemon.service
```



#### 清理家目录中的.cache文件

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



#### 安装配置clash

```shell
1. 下载
mkdir ~/clash
# 这个目录在哪里创建都可以
cd ~/clash
axel -n 10 https://github.com/Dreamacro/clash/releases/download/v0.17.1/clash-linux-amd64-v0.17.1.gz
# 下载包
gzip -d clash-linux-amd64-v0.17.1.gz
# 解压包
chmod +x clash-linux-amd64
./clash-linux-amd64
# 初始化时会在~/.config/clash下创建两个文件，config.yaml  Country.mmdb。这里会出现问题，需要先停
# 下来。首先要配置config.yaml文件，所不需要的项注释掉，如vmess。另外，Country.mmdb也有报错
# "Can't load mmdb: error opening database: invalid MaxMind DB file"，需要手动下载Country.mmdb。
# 如果使用./clash-linux-amd64 -d .，那么配置文件与mmdb文件就在当前目录下
axel -n 10 https://10101.io/download/file\?cid\=301
# 参考：https://10101.io/2018/10/27/how-to-use-clash-for-windows
./clash-linux-amd64
# 再次执行应该就正常了。输出如下：
# INFO[0000] Start initial compatible provider auto       
# INFO[0000] Start initial compatible provider Proxy      
# INFO[0000] Start initial compatible provider load-balance 
# INFO[0000] Start initial compatible provider fallback-auto 
# INFO[0000] HTTP proxy listening at: 127.0.0.1:7890      
# INFO[0000] SOCKS proxy listening at: 127.0.0.1:7891     
# INFO[0000] RESTful API listening at: 127.0.0.1:9090
登录：http://clash.razord.top/，进入后会要求输入地址与端口，默认是127.0.0.1:9090。这只是一个监控页面，无法修改配置。这个工具的问题是只支持ss、v2ray
参考：https://medium.com/@muchenran2/clash-%E5%B8%B8%E7%94%A8%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-%E7%AE%80%E6%98%93%E7%89%88-c77aeb2a10c
```



#### 清理/boot/分区

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



### 命令使用

#### apt使用

```shell
apt-get包管理在卸载软件后不要轻易使用apt-get autoremove，否则极容易各种悲剧。如果真想卸载干净，可以用apt-get purge
```



#### 忽略某个可以升级的包

```shell
⚡ ⚙ root@ruopu64  ~  apt-mark hold firefox-esr 
firefox-esr 设置为保留。
# 使用此命令可以忽略某个可以升级的包，再使用apt upgrade时就不会升级此包了。
apt-mark unhold firefox-esr
# 此命令可以解除忽略的包
```



#### 添加用户

```shell
root@ruopu64:~#useradd -m python
root@ruopu64:~#passwd python
root@ruopu64:~#vim /etc/passwd
# 将用户的shell改为/bin/bash，默认是sh，切换到用户后没有自动补全，命令提示符也有问题，改为bash后就正常了。
```



#### 设置开机启动

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



#### 重装grub

```shell
grub-install –target=i386-pc /dev/sda # 由于我的系统装在/dev/sda上面，所以这里用的是/dev/sda # –target=i386-pc这个option指的是：只安装BIOS系统的grub。# 我在使用时没有使用--target选项，只是简单地安装

grub-mkconfig -o /boot/grub/grub.cfg 
#安装好之后，将配置文件输出
# 参考： https://blog.csdn.net/panglinzhuo/article/details/77599641
```



#### dd命令制作启动盘

```shell
sudo umount /dev/sdb*
sudo mkfs.vfat /dev/sdb -I
# 直接格式化即可
sudo dd if=ubuntu-18.04.1-desktop-amd64.iso of=/dev/sdb bs=10M
# 直接将镜像写入U盘
```



#### 命令行操作无线网络

```shell
# 因更新内核或其他原因，使网络设置的选项在设置中消失了。没有找到好的解决办法。无奈之下，只有使用命令行操作。不过，塞翁失马，焉知非福?
1. 查看无线网络名称
 ⚡ root@shouyu  ~  iwlist wlan0 scan|grep ESSID
# 查找现在可以找到的无线网络的名称
 ⚡ root@shouyu  ~  iw dev wlan0 scan|grep SSID
# iw命令也可以查看，建议使用此命令

2. 生成配置文件
 ⚡ root@shouyu  ~  wpa_passphrase ruopu2.4 
# 此命令可以输出配置文件信息，如下：
network={                                                                                 
    ssid="ruopu2.4"
    #psk="X5kzxctScjn"
    psk=7f06ac6de165b153ec899b9cc600678e92a68c5e53a044182ba9dcf50ddd153a
}

3. 保存配置信息
 ⚡ root@shouyu  ~  vim ruopu24.conf
# 保存的位置是自定义的

4. 连接无线网络
 ⚡ root@shouyu  ~  wpa_supplicant -i wlan0 -c ruopu24.conf
# 用-i指定网卡，-c指定配置文件。连接的过程需要一些时间

5. 查看连接状态
 ⚡ root@shouyu  ~  iwconfig wlan0
wlan0     IEEE 802.11  ESSID:"ruopu24"  
          Mode:Managed  Frequency:2.412 GHz  Access Point: C0:C1:C0:D9:75:32   
          Bit Rate=144.4 Mb/s   Tx-Power=22 dBm   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:on
          Link Quality=55/70  Signal level=-55 dBm  
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
          Tx excessive retries:0  Invalid misc:5   Missed beacon:0
# 连接后可以看到是否连接成功
# 参考：https://www.cnblogs.com/v5captain/p/8724850.html
# 参考：https://blog.csdn.net/u010164190/article/details/68942070
# 参考：https://pluhuxc.github.io/2018/08/19/use-wpa_supplicant-connect-wifi.html
# 参考：http://rickgray.me/2015/08/03/useful-command-tool-for-wifi-connection/
6. 查看已连接的wifi信息
 ⚡ root@shouyu  ~  cd /etc/NetworkManager/system-connections
# 在此目录中有已经连接的无线信息，以文件形式保存，文件中有密码等信息
7. 问题解决
出现：nl80211: Could not set interface 'p2p-dev-wlan0' UP
 ⚡ ⚙ root@shouyu  ~  killall wpa_supplicant 
 # 杀死这个进程再重新执行 wpa_supplicant -i wlan0 -c ruopu24.conf命令即可。

另一种方法：
# 两种方法只能选择一种。
1. 创建配置文件
 ⚡ root@shouyu  ~  vim /etc/wpa_supplicant/example.conf
ctrl_interface=/run/wpa_supplicant                                                        
update_config=1
# 这样配置是为了后面可以使用 wpa_cli 命令来实时地扫描和配置网络，并能够保存配置信息。

2. 初始化网卡
 ⚡ root@shouyu  ~  wpa_supplicant -B -D nl80211 -i wlan0 -c /etc/wpa_supplicant/example.conf
Successfully initialized wpa_supplicant
ctrl_iface exists and seems to be in use - cannot override it
Delete '/run/wpa_supplicant/wlan0' manually if it is not used anymore
Failed to initialize control interface '/run/wpa_supplicant'.
You may have another wpa_supplicant process already running or the file was
left by an unclean termination of wpa_supplicant in which case you will need
to manually remove this file before starting wpa_supplicant again.
# 如果初始化如上面这样，是因为已经使用无线网卡连接了wifi，需要删除/run/wpa_supplicant/wlan0文件
 ⚡ root@shouyu  ~  rm -rf /run/wpa_supplicant/wlan0
 ⚡ root@shouyu  ~  wpa_supplicant -B -D nl80211 -i wlan0 -c /etc/wpa_supplicant/example.conf
Successfully initialized wpa_supplicant
nl80211: Could not set interface 'p2p-dev-wlan0' UP
nl80211: deinit ifname=p2p-dev-wlan0 disabled_11b_rates=0
p2p-dev-wlan0: Failed to initialize driver interface
P2P: Failed to enable P2P Device interface
# 再将初始化成功，-B参数表示后台运行。如果遇到驱动不支持所插入的无线网卡，可选择wired或者wext等，具体详情可使用 wpa_supplicant -h 进行查看。
# 此方法连接无线网络后速度并不理想，不知是否与-D nl80211选项有关。

3. 使用交互式命令wpa_cli
⚡ root@shouyu  ~  wpa_cli
# 进入 wpa_cli 的交互界面后，它会自动地扫描周围的无线网络，你也可以使用 scan 命令进行手动扫描
> scan
OK
<3>CTRL-EVENT-SCAN-STARTED 
<3>CTRL-EVENT-SCAN-RESULTS 
<3>WPS-AP-AVAILABLE 
<3>CTRL-EVENT-NETWORK-NOT-FOUND 
> scan_results 
bssid / frequency / signal level / flags / ssid
74:05:a5:7a:14:a0	5765	-58	[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]	TP-LINK_503
8e:6d:77:87:b5:8c	5180	-70	[WPA-PSK-CCMP+TKIP][WPA2-PSK-CCMP+TKIP][WPS][ESS]ChinaNet-7MRq-5G-Q
74:05:a5:7a:14:9e	2412	-53	[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]	TP-LINK_503
d4:ee:07:60:88:00	2427	-53	[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]	ziroom602
80:89:17:5a:9b:4a	2462	-68	[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]	dingdingdingding
c0:c1:c0:d9:75:32	2412	-52	[WPA-PSK-CCMP+TKIP][WPA2-PSK-CCMP+TKIP][WPS][ESS]home2
8c:6d:77:69:7f:58	2462	-69	[WPA-PSK-CCMP+TKIP][WPA2-PSK-CCMP+TKIP][WPS][ESS]ruopu2.4
# 使用scan_results搜索到的无线网络

4. 创建网络配置信息
> add_network
# 这条命令会生成一条网络配置信息的编号，从0开始，下面就对这个第0条配置信息进行配置
> set_network 1 ssid "ruopu2.4"
> set_network 1 psk "12345678"
> set_network 1 key_mgmt WPA-PSK
# 测试中这里只能这样配置，因为使用WPA2-PSK会提示FAIL。命令最后的Wifi的加密方式可以是WPA-PSK或WPA2-PSK
> enable_network 0
OK
# 执行过此命令后就开始连接了，需要等待一段时间。再使用iwconfig查看是否连接到了目标网络。注意，这里输出的信息并不会停下来。所以直接使用下面的命令即可。
> save_config
OK
# 保存配置信息到/etc/wpa_supplicant/example.conf
> status
# 查看状态
# 参考：http://rickgray.me/2015/08/03/useful-command-tool-for-wifi-connection/
```



#### 制作linux启动盘工具

```shell
U盘安装KaliLinux时，用win32diskimager将镜像拷到U盘中，用软碟通拷到U盘后，安装时提示启动失败。 
关于双系统启动盘的制作，可以使用WinSetupFromUSB
使用方法：https://www.cnblogs.com/zx525/p/7783504.html。
官网：http://www.winsetupfromusb.com
```



#### 设置區域，不然會是英文，即使選了中文安裝

```shell
echo LANG="zh_CN.UTF-8" > /etc/default/locale 
reboot 
apt update 
```



#### 查看系统版本

```shell
# 查看内核版本
root@xor-outlet1:~# uname -a
Linux xor-outlet1 3.2.0-4-amd64 #1 SMP Debian 3.2.88-1 x86_64 GNU/Linux

root@xor-outlet1:~# cat /proc/version 
Linux version 3.2.0-4-amd64 (debian-kernel@lists.debian.org) (gcc version 4.6.3 (Debian 4.6.3-14) ) #1 SMP Debian 3.2.88-1

# 查看系统版本
root@xor-outlet1:~# lsb_release -a
No LSB modules are available.
Distributor ID:	Debian
Description:	Debian GNU/Linux 7.11 (wheezy)
Release:	7.11
Codename:	wheezy

root@xor-outlet1:~# cat /etc/issue
Debian GNU/Linux 7 \n \l

```



### 问题解决

```shell
1. 系统提示“KDEInit无法启动/usr/bin/systemsettings5”，这时桌面上的图标均不可点，鼠标左右键在桌面上也失灵。需要关闭有问题的程序，之后才会有上面的错误提示。使用中发现是“系统设置”出了问题，需要在系统设置的图标上右键-->属性-->应用程序-->高级选项-->D-Bus注册中要选择“无”。这样就解决问题了。如果其他图标也有此问题，也可按此方法解决。

2. 新装系统后，无法安装fcitx输入法，提示有lib的软件版本不对，需要使用apt install命令按要求再装一次lib软件，千万不要使用apt autoremove命令卸载软件，或卸载任何软件，不然会出现其他问题。

3. 新装系统后，安装完各种包后，重启无法进入系统，发现是登录页面的左上角的会话中没有了相应的图形环境。需要重新安装。如：apt install kali-defaults kali-root-login desktop-base kde-plasma-desktop，安装完之后重启即可解决。
参考： https://www.52os.net/articles/kail-change-desktop-environment.html(kali切换桌面环境)

4. 调整LVM后，开机启动有问题，无法正常进入图形界面，注释/etc/fstab文件中有问题的LVM卷自动挂载后正常，进入系统后修复。

5. 挂载提示"The disk contains an unclean file system (0, 0).Metadata kept in Windows cache, refused to mount. Falling back to read-only mount because the NTFS partition is in an unsafe state. Please resume and shutdown Windows fully (no hibernation or fast restartin"
root@ruopu64:~# ntfsfix /dev/sda4
# 修复有问题的分区即可

6. 修改命令提示符
vim ~/.bashrc
export PS1='\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}\[\033[01;31    m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\W\[\033[00m\]\$'
# 加入这一行后，提示符只显示当前目录

7. 报错"GLib-GIO-Message: 21:55:51.450: Using the 'memory' GSettings backend.  Your settings will not be saved or shared with other applications."
vim ~/.zshrc
export GIO_EXTRA_MODULES=/usr/lib/x86_64-linux-gnu/gio/modules 
source  ~/.zshrc

8. Opera浏览器无法启动
解决：右键Opera图标 --> 应用程序 --> 在命令栏中的最后加入--no-sandbox

9. 在没有全局代理的情况下让chrome登录google帐号
root@shouyu:~# google-chrome-stable %U --proxy-pac-url="http://127.0.0.1:2333/proxy.pac"
# 使用此命令启动google浏览器就可以连接到本地的端口

10. 安装xfce4桌面后，启动electron-ssr看不到系统托盘中的图标，可以使用Ctrl + Shift + w 调出程序的窗口。

11. 在系统托盘中没有网络图标时，可以使用nmtui进入启用连接中连接无线网络。

12. 安装xfce4桌面系统后没有声音。
apt install alsamixergui
# 安装此软件后部分解决声音问题

13. vscode显示中文乱码
a. 点击右下解的编码模式，一般这时是UTF-8
b. 之后软件上方弹出窗口，有两个选择，一个是Reopen with Encoding，一个是Save with Encoding。点击Reopen with Encoding
c. 选择第一项Simplified Chinese(GB2312)。这样就解决中文乱码问题了。

14. 使用gnome-tweaks工具取消桌面上的磁盘图标

15. 系统报错，提示有问题
sudo rm/var/crash/* 
# 删除这些错误报告
gksu gedit/etc/default/apport
enable=0
# 设置0表示禁用Apportw，或者1开启它。把enabled=1改为enabled=0。保存并关闭文件。完成之后你就再也不会看到弹窗报告错误了。很显然，如果我们想重新开启错误报告功能，只要再打开这个文件，把enabled设置为1就可以了。
# gksu是linux下图形化的su/sudo工具

16. 解决升级内核后无法使用无线网络问题
# 问题：现象反映为电脑不停打开关闭飞行模式，无法使用无线网络。在电源中关闭无线后，打开关闭的现象停止了。查找问题原因是最难的，能想到的有两种情况，一种是驱动问题，一种是内核问题。还好是能想到的两种情况中的一种。
a. 查看内核列表
sudo dpkg --get-selections |grep linux-image
b. 查看当前使用的内核
uname -r
c. 升级/安装内核
sudo apt install linux-image-4.4.0-75-generic
d. 删除内核
sudo apt-get remove linux-image-4.4.0-75-generic
# 卸载内核时，在图形画面要选择否。安装kali的新内核linux-image-5.2版本时有问题，会使无线网络无法使用。
e. firmware-iwlwifi
# 无线网卡驱动名称。
# kde下载的是broadcom-wl-5.100.138.tar.bz2
f. http://http.kali.org/kali/pool/main/l/linux/
# kali内核下载地址。

17. 安装钉钉时提示"/var/lib/dpkg/info/dtalk.postinst:行7: desktop-file-install：未找到命令"，需要安装desktop-file-utils。之后就可以正常安装了。

18. linux 命令行 提示符前面多了 (base)
(base) shouyu@shouyu-pc:~$ conda deactivate
# 是aconda自动加入了命令到 .bashrc中。执行上面的命令可以去掉前面的(base)
shouyu@shouyu-pc:~$ 

19. 关于electron-ssr打开后看不到图标的解决办法
首先，尝试安装libappindicator1应用程序指示器。如果不行，使用下面的快捷键。
Control+Shift+W
# 使用快捷键切换主窗口显隐，需要在空白桌面上使用上面的快捷键。

20. 取消PPA库的方法
sudo add-apt-repository --remove ppa:nilarimogard/webupd8

21. 用户进入命令行提示"ps1_fortune:2: command not found: fortune"
sudo apt install fortune-mod
```



#### 无法登录GUI环境

```python
更新后，无法使用用户登录到桌面环境，在网上找到的解决办法无非重新安装lightdm或sdm3，但并无法解决问题。发
现重新创建用户或使用root用户是可以登录到桌面环境的。
# root用户登录桌面环境
vim /root/.profile
将最后一行的mesg n改为tty -s && mesg n。重启后生效

# 创建用户
useradd -m -G adm,cdrom,sudo,dip,plugdev,lpadmin,sambashare,vboxusers,usbfs -s /bin/zsh ruopu
### -m表示创建家目录；-G表示指定附属组；-s表示指定默认shell
cp -r /home/shouyu/* /home/ruopu
cp -r /home/shouyu/.* /home/ruopu
### 将之前有问题的用户家目录中的所有文件，包括点开头的配置文件都复制到新用户目录下
vim /home/ruopu/.zshrc
export ZSH="/home/ruopu/.oh-my-zsh"
### 将.zshrc配置文件中的目录改为新用户的家目录
chown -r ruopu.ruopu /home/ruopu
### 修改所有复制过来的文件的属主属组
passwd ruopu
### 如果不设置用户密码，会在登录界面显示用户被禁用
userdel -r shouyu
### 删除旧用户
```



#### 屏幕变成竖屏的

```shell
使用当中，笔记本屏幕自动旋转了90度，头也要向右低90度才能正常看，原因不明
xrandr -o normal
# 恢复正常角度
xrandr -o left
# 竖屏显示
xrandr -o right
# 向右旋转90度
xrandr -o inverted
# 上下翻转
# 参考：blog.csdn.net/ITBigGod/article/details/85775257
```



#### 更新软件源时的公钥问题

```shell
apt update
错误提示：W: GPG error: http://mirrordirector.raspbian.org/raspbian stretch InRelease: The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 9165938D90FDDD2E
W: The repository 'http://mirrordirector.raspbian.org/raspbian stretch InRelease' is not signed.
N: Data from such a repository can't be authenticated and is therefore potentially dangerous to use.
N: See apt-secure(8) manpage for repository creation and user configuration details.
W: There is no public key available for the following key IDs:
9165938D90FDDD2E
E: Failed to fetch http://mirrordirector.raspbian.org/raspbian/dists/stretch/main/binary-armhf/Packages.xz Hash Sum mismatch
E: Some index files failed to download. They have been ignored, or old ones used instead.
# 错误信息大致意思为没有找到对应的公钥，所以软件源地址不被信任。

解决办法：
apt install software-properties-common dirmngr
gpg --keyserver  keyserver.ubuntu.com --recv-keys 9165938D90FDDD2E
# keyserver.ubuntu.com是key服务器，9165938D90FDDD2E是上面错误提示中提到的，这是公钥签名。
gpg --export --armor  9165938D90FDDD2E | sudo apt-key add -
# 参考：https://www.cnblogs.com/lanqie/p/8513102.html
```



#### 网易云音乐无法启动

```shell
直接无法启动，没有反应
 vim /usr/share/applications/netease-cloud-music.desktop
    ...
    # Exec=netease-cloud-music --no-sandbox %U
    Exec=sh -c "unset SESSION_MANAGER && netease-cloud-music %U"
    ...
# 修改上面一行的设置为sh -c ...一行的样子
如果上面的设置不起作用，就需要使用sudo启动软件了
sudo netease-cloud-music

# 启动时提示"Gtk-Message: 10:33:56.116: Failed to load module "canberra-gtk-module""
⚙ shouyu@shouyu-pc  ~/下载  sudo apt install libcanberra-gtk-module
```



#### google-chrome不能启动

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



### VMWare

#### VMWare问题解决

```shell
* 安装vmware-workstation前一定要先安装build-essential。Built Essential包含对编译Ubuntu二进制安装包所需的所有包的引用。
sudo apt install build-essential

1. 安装完VMware后，无法启动，提示“GNU C Compiler(gcc)version 7.3 was not found”
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

2. 安装vmware-workstation15，安装完成后启动提示“Kernel Headers for version X.X.XX-XX-XX were not found”
解决办法
apt install linux-headers-$(uname -r)
# 安装这个头文件后，启动就正常了

3. 安装VMWare-tools时报错:"there was a problem updating a software component. try again later and if the"，实际是下载有问题
手动解决：
下载地址：http://softwareupdate.vmware.com/cds/vmw-desktop/ws/15.0.4/12990004/windows/packages/，下载其中的tools-windows.tar，之后将其解压，在虚拟机中加载解压后的iso文件即可手动安装。

4. 添加共享文件夹后，在虚拟机的网络中可以查看到，前提是安装了vmware-tools。

5. 卸载VMware-Workstation
sudo vmware-installer -u vmware-workstation

6. vmware或virtualbox无法启动，要求加载vmmon模块，用modprobe。但使用modprobe加载也会报错。可能是电脑开启了安全引导模式，关闭后就可以了。

7. vmware使用NAT方式不能连接到网络，提示：Could not connect 'Ethernet0' to virtual network '/dev/vmnet8'. More information can be found in the vmware.log file. Failed to connect virtual device 'Ethernet0'. 将这个虚拟交换机删除，重新创建一个虚拟交换机，选择NAT方式即可解决。

8. 挂起是虚拟机的操作本身的休眠功能，关闭即可。如win7的休眠功能

9. vmware-workstation无法在主版本内核中运行的问题
a. 下载高版本的vmware-workstation，如14.1.7版本，下载地址：https://my.vmware.com/group/vmware/details?downloadGroup=WKST-1417-LX&productId=686&download=true&fileId=3dd758fdc904e68f9aae93f9d9807d31&secureParam=f9ecb38be33db3611137eda2dc65d47d&uuId=d6a721f6-43aa-41cf-b308-97505fddbaf9&downloadType=
b. 下载相应的内核编译需要使用的包，下载地址：https://github.com/mkubecek/vmware-host-modules/releases/tag/w14.1.7-k5.3。这里的包的名称以w14.1.7-k5.3或p14.1.7-k5.3命名，其中w14.1.7表示vmware-workstation的版本，k5.3表示内核的版本，p14.1.7表示vmware-player的版本
c. 先安装vmware-workstation，之后解压编译内核需要的包并进入，依次执行：make -> make install -> modprobe -r vmmon -> insmod /lib/modules/$(uname -r)/misc/vmmon.ko -> insmod /lib/modules/$(uname -r)/misc/vmnet.ko -> rm /usr/lib/vmware/lib/libz.so.1/libz.so.1 -> ln -s /lib/x86_64-linux-gnu/libz.so.1 /usr/lib/vmware/lib/libz.so.1/libz.so.1 -> vmware-networks --start
d. 这时以root身份打开vmware-workstation就没有问题了，如果不以root身份打开，可以会显示不了虚拟机的页面
参考：https://blog.gloriousdays.pw/2018/09/11/linux-kernel-4-13-break-vmware-12-5/
```



### VirtualBox

#### 问题解决

```shell
1. 启动虚拟机时提示"Kernel driver not installed ... as root ... /sbin/vboxconfig"
问题解决时发现自己只做了三件有用的事，但不确定是否是这些问题造成的虚拟机无法启动。一、关闭BIOS的安全启动功能；二、重装VirtualBox；三、启动虚拟机时无法启动，但提示要执行 
sudo modprobe vboxdrv。当完成上面三步后，虚拟机可以启动了。
```



#### VirtualBox虚拟机安装Ubuntu 16.04.3 LTS后安装增强功