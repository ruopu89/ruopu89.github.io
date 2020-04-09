---
title: MacOS使用记录
date: 2020-03-26 09:33:29
tags: MacOS	
categories: MacOS
---

### 黑苹果安装过程

- 下载黑苹果镜像，地址：https://blog.daliansky.net/
- 使用[etcher](https://etcher.io/)工具将镜像写入U盘
- 启动电脑，直接安装即可
- 下载三叶草配置器，地址：https://mackie100projects.altervista.org/download-clover-configurator/

打开配置器，打开时可能会提示不安全，无法打开，要到MacOS系统设置里的安全性与隐私中设置一下允许打开即可。打开后找到左边的挂载分区，再找到其中的EFI分区，这时会有两个EFI分区，一个是U盘的，一个是硬盘的，点击两个分区后面的挂载分区，然后将U盘EFI分区中的EFI目录复制到硬盘的EFI分区，这时硬盘的EFI分区里也有一个EFI目录，复制时选择合并即可。这样，之后就可以不使用U盘引导，直接使用硬盘引导开机了。



### 安装软件

1. 安装Homebrew

   访问https://raw.githubusercontent.com/Homebrew/install/master/install会有安装的方法。使用ruby方法安装时会提示无法访问443端口，安装出现总是，经常中断，所以直接访问了这个地址，将脚本复制下来，直接在目录下创建install.sh文件，将脚本粘贴进去再执行，这只是节省了一点时间，但还是要执行git命令将远程文件克隆下来。

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

上面方法安装如果出现报错，可按如下方法解决。报错如下：

```shell
Error: Failure while executing: git clone https://github.com/Homebrew/homebrew-core /usr/local/Library/Taps/homebrew/homebrew-core --config core.autocrlf=false --depth=1 -q
Error: Failure while executing: /usr/local/bin/brew tap homebrew/core -q
```

解决方法：

```shell
sudo mkdir /usr/local/Homebrew
sudo git clone https://mirrors.ustc.edu.cn/brew.git /usr/local/Homebrew
sudo ln -s /usr/local/Homebrew/bin/brew /usr/local/bin/brew
# 如果提示File exists表示/usr/local/bin文件夹里面已经有brew，删除后再运行第三步。
sudo mkdir -p /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core
sudo git clone https://mirrors.ustc.edu.cn/homebrew-core.git /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core
sudo chown -R $(whoami) /usr/local/Homebrew
HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
brew update
# 显示Already up-to-date.表示成功
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.zshrc
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bash_profile
brew doctor
# brew有一个自检程序，如果有问题自检试试
下面的方法也可以测试一下
查看了下homebrew的脚本，https://raw.githubusercontent.com/Homebrew/install/master/install，发现只要把/usr/local/.git 目录删了即可，就是执行rm -rf /usr/local/.git
```

2. 远程连接工具

   FinalShell：http://www.hostbuf.com/t/988.html

   Shuttle：http://fitztrev.github.io/shuttle/

   Royal TSX：https://www.royalapps.com/ts/mac/features

3. 百度网盘、解压缩工具TheUnarchiver、命令行工具iTerm2、三叶草配置器Clover Configurator、搜狗五笔、网易云音乐、卸载优化工具CleanMyMac、迅雷、远程连接工具finalshell、chrome、FileZilla、GitKraken、Typora、trojan、office、微信、QQ、钉钉、有道云笔记、Evernone、苹果办公软件、虚拟机Parallels Desktop、OneDrive

4. 安装nord-tmux插件
```shell
这是一个不错的主题
先安装这个插件，再安装下面的PowerLevel10k
git clone https://github.com/arcticicestudio/nord-tmux.git
mkdir -pv ~/.tmux/themes
mv nord-tmux ~/.tmux/themes
vim ~/.tmux.conf
run-shell "~/.tmux/themes/nord-tmux/nord.tmux"
tmux source-file ~/.tmux.conf
# 重新加载，之后可以看到nord的颜色效果
在tmux中需要按住Alt键才能复制，在ubuntu中是按住Shift
```

5. 安装设置oh-my-zsh以及PowerLevel10k

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
# 安装oh-my-zsh
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
# 克隆主题
vim ~/.zshrc
ZSH_THEME="powerlevel10k/powerlevel10k"
# 修改使用主题
POWERLEVEL9K_MODE="awesome-patched"
# 执行此命令。
source ~/.zshrc
# 加载后会下载需要的字体，下载有可能会失败，但失败后会提示执行失败的命令。另外这时的字体有些无法显示，可以调整item2的Perferences设置中的字体为有powerline结尾的字体。
# 如果再次执行失败的命令，提示："Failed to connect to raw.githubusercontent.com port 443: Connection refused"，可按下面的设置item2使用代理方法解决，此方法也可以解决安装Homebrew时这样的报错。
之后在安装时最好让程序执行下载字体，这样可以顺利地设置powerlevel10，不然会显示乱码。另外不要调整item2的字体中的non-ASCII test中的字体，因为设置这个字体可能会显示乱码。
如果安装出现乱码无法解决，可以使用uninstall_oh_my_zsh卸载后重装

================================================================
下面是zshrc设置
***下面是安装历史命令提示功能***
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

***语法高亮功能***
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

***history-substring-search 插件***
$ git clone https://github.com/zsh-users/zsh-history-substring-search.git $ZSH_CUSTOM/plugins/history-substring-search
# 历史命令搜索插件，如果和 zsh-syntax-highlighting 插件共用，要配置到语法高亮插件之后。
# 效果是上下键查询历史命令记录，可模糊匹配历史命令记录中任意字符串。
vim ~/.zshrc
plugins=(git battery zsh-autosuggestions zsh-syntax-highlighting z web-search sudo history-substring-search)
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
```

6. 安装pyenv

```shell
brew install pyenv
brew install pyenv-virtualenv
pyenv install -l
pyenv install 3.8.2 -v
# 如果因为解析不了www.python.org安装失败，可以将DNS地址改为8.8.8.8。如果还是解析不了，可以查看域名地IP，加入hosts文件中。如：www.python.org   151.101.76.223
```

7. 配置pycharm的解释器

```shell
打开pycharm左上角的Preferences -> Project:PycharmProjects -> Project Interpreter -> Show All -> + -> Virtualenv Environment -> Existing environment -> 选择刚安装的python解释器
```





### 设置方法

1. 安装GitKraken后，打开GitKraken软件，使用自己的github帐户登录，将github上的项目clone下来。之后在本机生成私钥，上传到github。之后就可以测试使用GitKraken上传项目到github了，另一台主机可以也使用GitKraken从github上将项目pull下来，看是否正确。这样两台主机就可以同时修改一个项目了。但是记录的md文件最好使用hexo生成，因为生成的文件有title等信息

2. 声音没有显示在右上角的菜单栏中，显示后发现也不能调整音量，只能是最大音量。使用外置设备调整。

3. 配置MacOS代理

   进入网络，点击高级，在代理中选择自动代理配置，右边地址输入：https://tlanyan.me/trojan-pac.php?p=1080。最后的1080是本地的端口。

   pac地址也可以使用：https://www.hijk.pw/trojan-pac.php?p=1080

   也可以使用SOCK5代理，服务器地址127.0.0.1:1080。在chrome浏览器上可以设置SwitchyOmega中的PAC网址为：https://raw.githubusercontent.com/pexcn/daily/gh-pages/pac/whitelist.pac

4. 设置git，解决git clone慢的问题

```shell
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080
# 网上有说这是使用git内置代理，但如果已经开始了trojan呢，不清楚。只是测试是有效的
vim .gitconfig
[user]
	email = ruo@hotmail.com
	name = sou
[http]
	proxy = socks5://127.0.0.1:1080
[https]
	proxy = socks5://127.0.0.1:1080
使用nslookup查看http://github.com和http://github.global.ssl.fastly.net两个域名的IP地址，添加到hosts文件中。也可以到https://www.ipaddress.com/上查询
vim /etc/hosts
199.232.69.194  github.global.ssl.fastly.net
140.82.114.4  github.com
执行过这两步后就可以提升克隆的速度了，测试有时有效。这样设置只对https协议起作用，对ssh协议无效。也就是克隆的地址需要是https，如果是git开头，可以将其改为https。
```

5. 设置item2使用代理

```shell
因为无法直接安装oh-my-zsh，所以要设置代理。报错：无法连接443端口，无权访问。
vim .bash_profile
export http_proxy=socks5://127.0.0.1:1080
export https_proxy=$http_proxy
# 因为使用的是trojan，所以是socks5协议，如果使用SSR可以用http协议
```

6. 设置vim的powerline

```shell
git clone https://github.com/altercation/solarized.git
cd solarized/vim-colors-solarized/colors
cp solarized.vim ~/.vim/colors/
vi ~/.vimrc
  1 set nocompatible
  2 set hlsearch
  3 set showmatch
  4 set history=1000
  5 set cursorline
  6 set showcmd
  7 set autoindent
  8 set expandtab
  9 set wrap
 10 set incsearch
 11 set ignorecase
 12 set tabstop=4
 13 set softtabstop=4
 14 set shiftwidth=4
 15
 16 syntax on
 17 set background=dark
 18 colorscheme nord
 19 set rtp+=/Users/shouyu/powerline/powerline/bindings/vim
 20 set guifont=Monaco\ for\ Powerline:h14.5
 21 set laststatus=2
 22 set encoding=utf-8
 23 set t_Co=256
 24 set number
 25 set fillchars+=stl:\ ,stlnc:\
 26 set term=xterm-256color
 27 set termencoding=utf-8

brew install xz coreutils
# 安装coreutils（使文件夹和文件显示为彩色）
gdircolors --print-database > ~/.dir_colors
# 生成颜色定义文件
# gdircolor的作用就是设置ls命令使用的环境变量LS_COLORS（BSD是LSCOLORS），我们可以修改~/.dir_colors自定义文件的颜色，此文件中的注释已经包含各种颜色取值的说明。
vim ~/.zshrc
if brew list | grep coreutils > /dev/null ; then
  PATH="$(brew --prefix coreutils)/libexec/gnubin:$PATH"
  alias ls='ls -F --show-control-chars --color=auto'
  eval `gdircolors -b $HOME/.dir_colors`
fi
# 在~/.zshrc配置文件中加入以下代码

==========
vim配色方案
==========
git clone git://github.com/arcticicestudio/nord-vim.git
# nord-vim配置，还可以参考https://zhuanlan.zhihu.com/p/58188561中介绍的配色方案
cp nord-vim/colors/nord-vim ~/.vim/colors
vim .vimrc
colorscheme nord
```

7. iterm2配置nord-iterm2主题

```shell
git clone http://www.github.com/arcticicestudio/nord-iterm2
# 克隆主题
打开iterm2的Preferences -> Profiles -> 右下角的Color Presets... -> 
Import -> 选择克隆的nord-iterm2目录中的src/xml/Nord.itermcolors。之
后就可以在右正解的Color Persets...中选择Nord配色方案了
```

8. 提示打不开“XXX”，因为它来自身份不明的开发者

```shell
sudo spctl --master-disable
# 关闭后就可以安装了
sudo spctl --status
# 查看状态
```

9. 安装后黑苹果颜色不正，一直闪烁反转

```shell
下载SwitchResX4.8.0破解版，安装后右上角会有软件的图标，选择Millions for color，不要选Billions for color
```



### 快捷键

1. 剪切与粘贴

剪切：多媒体键 + c

粘贴：多媒体键 + Alt + v

2. 截图

Command+Shift+3：截全屏

Command+Shift+4：截屏幕选定部分

Command+Shift+4+空格：截取所选窗口

上面三个快捷键，如果在使用中加上Control，那么会直接将截图放到剪贴板，不然就需要保存到桌面上。

Command + Shift + 5，这是另一种截图方法，打开的是不同的屏幕截图工具。

3. spotlight搜索

多媒体键 + 空格：打开右上角的聚集搜索



### brew命令

```shell
$ brew --help #简洁命令帮助
$ man brew #完整命令帮助
$ brew install git #安装软件包(这里是示例安装的Git版本控制)
$ brew uninstall git #卸载软件包
$ brew search git #搜索软件包
$ brew list #显示已经安装的所有软件包
$ brew list 包名 # 查看已安装软件包的安装路径，也就是都在哪些路径下产生了文件
$ brew update #同步远程最新更新情况，对本机已经安装并有更新的软件用*标明
$ brew outdated #查看已安装的哪些软件包需要更新
$ brew upgrade git #更新单个软件包
$ brew info git #查看软件包信息
$ brew home git #访问软件包官方站
$ brew cleanup #清理所有已安装软件包的历史老版本
$ brew cleanup git #清理单个已安装软件包的历史版本
```



