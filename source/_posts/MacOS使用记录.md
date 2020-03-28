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

1. 访问https://raw.githubusercontent.com/Homebrew/install/master/install会有安装的方法。使用ruby方法安装时会提示无法访问443端口，安装出现总是，经常中断，所以直接访问了这个地址，将脚本复制下来，直接在目录下创建install.sh文件，将脚本粘贴进去再执行，这只是节省了一点时间，但还是要执行git命令将远程文件克隆下来。

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



### 设置方法

1. 安装GitKraken后，打开GitKraken软件，使用自己的github帐户登录，将github上的项目clone下来。之后在本机生成私钥，上传到github。之后就可以测试使用GitKraken上传项目到github了，另一台主机可以也使用GitKraken从github上将项目pull下来，看是否正确。这样两台主机就可以同时修改一个项目了。但是记录的md文件最好使用hexo生成，因为生成的文件有title等信息

2. 声音没有显示在右上角的菜单栏中，显示后发现也不能调整音量，只能是最大音量。使用外置设备调整。
3. 配置MacOS代理

进入网络，点击高级，在代理中选择自动代理配置，右边地址输入：https://tlanyan.me/trojan-pac.php?p=1080。最后的1080是本地的端口。

pac地址也可以使用：https://www.hijk.pw/trojan-pac.php?p=1080

也可以使用SOCK5代理，服务器地址127.0.0.1:1080



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



