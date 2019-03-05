---
title: Python安装
date: 2018-09-05 14:36:56
tags: python
categories: python
---



# linux

建议使用3.5以上版本。开发环境使用pyenv，可以管理python解释器、管理python版本、管理python的虚拟环境。可以使多版本共存。pyenv是一个虚拟环境。也有其他的环境可以实现。

## 测试安装

使用CentOS6.5-64

```shell
yum install git
vim /etc/yum.repos.d/python.repo
    [updates]
    name=CentOS-Updates
    baseurl=https://mirrors.aliyun.com/centos/6.9/os/x86_64
    gpgcheck=0
# 加入yum源
yum repolist
yum update nss
# 更新此包，如果不更新此包，在安装pyenv时可能会报错，提示“curl:(35) SSL connect error”
yum install gcc make patch gdbm-devel openssl-devel sqlite-devel readline-devel zlib-devel bzip2-devel
# 这是pyenv在安装python时要用到的包，pyenv是就地编译的，在编译时要用到这些包。
useradd python
passwd python
su - python
# 要用此用户登录开发
# pythonoffline.tar.gz是在线连接的时候出现问题，再解压此包进行配置
curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash
# 访问安装pyenv，安装好后会输出三行信息，要加入.bash_profile文件中。使用-L参数，curl就会跳转到新的网址。
vim ~/.bash_profile
    export PATH="/home/python/.pyenv/bin:$PATH"
    eval "$(pyenv init -)"	
# 初始化pyenv这个工具
    eval "$(pyenv virtualenv-init -)"	
# 初始化virtualenv这个插件，因为开发都用虚拟环境
# eval会对后面的cmdLine进行两遍扫描，如果在第一遍扫面后cmdLine是一个普通命令，则执行此命令；如果cmdLine中含有变量的间接引用，则保证简介引用的语义。
source ~/.bash_profile
python -V
# 查看python版本，显示是2.6.6版本。
# 注意：不要升级系统本身的python版本，因为有软件依赖，升级会使系统混乱，比如yum可能无法使用。所有工作都应该在pyenv这个多版本工具里进行
pyenv
# 查看可用到的命令，如install等
pyenv install -l
# 列出可用的python版本
pyenv install 3.5.3 -v
# 安装python3.5.3版本，并输出详细信息。但连接非常慢
cd ~/.pyenv
ll
# 这里是python家目录下的.pyenv目录，里面有上面刚安装过的插件
mkdir cache
# 在.pyenv目录中创建一个目录，下面准备使用离线安装的方式。
cd cache
将python-3.5.3.tar.xz、python-3.5.3.tgz三个文件放入cache目录中。这三个文件是在安装过程中可能依赖的包，下载地址：https://www.python.org/ftp/python/3.5.3/
cd ..
pyenv install 3.5.3 -v
# 在cache上一层目录执行安装
python -V
# 这时显示还是2.6.6版本
pyenv version
# 查看当前的python版本的位置
[python@bogon .pyenv]$ pyenv versions
* system (set by /home/python/.pyenv/version)
  3.5.3
# 查看由pyenv管理的所有python版本，这里有3.5.3版本，但没有*标记

* global
pyenv global 3.5.3
# 改全局使用的python为3.5.3版本
python -V
# 查看依然是2.6.6版本
pyenv versions
# 这时3.5.3前已经有标记了，表示当前使用版本
python -V
# 查看依然是2.6.6版本
pyenv version
# 这里显示当前使用版本也是3.5.3
再打开一个新的窗口用python用户登录，执行python -V，这时就是3.5.3版本了。如果用root用户这样操作，影响会非常大
pyenv global system
# 调回2.6.6，再次登录就都调回来了。global会影响当前用户。不建议使用global
pyenv install 3.6.3
# 安装一个3.6.3版本
# pyenv version是显示当前的python版本；pyenv versions显示所有可用的python版本，和当前版本。
pyenv versions

* shell只设定当前的会话级别，如果会话变了，版本的调整也就失效了
pyenv shell 3.5.3
pyenv versions
python -v
# 使用shell命令设置后，发现版本都有了变化
再打开一个窗口
python -V
# 这时显示的是2.6.6版本
pyenv versions
# 这里还是system版本

* local
mkdir magedu/projects/web
# 在python家目录中创建目录
cd magedu/projects/web
python -V
# 这时显示的是2.6.6版本
pyenv local 3.5.3
python -V
# 这时显示的是3.5.3版本
cd ..
python -V
# 到上一级目录查看版本是2.6.6，也就是版本与目录绑定了，进入特定的目录就会到一个不同的版本中
mkdir /home/python/magedu/profects/web/html
# 在web中创建html目录
cd html
python -V
# 这里也是3.5.3版本，local的特性是子目录继承的，所以web和html中都会显示3.5.3版本
mkdir projects/cmdb
cd projects/cmdb
python -V
# 这时显示的是2.6.6.版本
pyenv local 3.6.3
python -V
# 显示3.6.3版本
# 这里有一个问题，这个版本是大家共用的
```

## 虚拟环境

```shell
cd /home/python/magedu/projects/cmdb
pyenv virtualenv 3.5.3 my353
# 给3.5.3版本制作一个虚拟版本，叫my353
pyenv versions
# 这时多了一个my353的版本
cd ..
mkdir test
cd test
[python@bogon test]$ pyenv local my353
(my353) [python@bogon test]$
# 这时提示符有了变化，多了一个(my353)
cd ..
# 到上一级目录就不会有(my353)
cd test
# 这时就有了(my353)
cd
# 到家目录
cd .pyenv
ls
cd versions
ll
# 这里有一个my353的软链接
cd 3.5.3
[python@bogon 3.5.3]$ ls
bin  envs  include  lib  share
# 这里有几个重要的目录，lib目录下有一个python3.5目录，其中有一个site-packages，这个目录有开发中安装的所有的包。如果大家都用3.5.3版本，那么包会全部放到这个目录里
cd ../..
cd versions/3.5.3/envs
# 在3.5.3目录下有一个envs目录，在envs中有my353目录，这是my353的虚拟环境，通过pyenv versions也可以看到这个信息。这个目录中也有一个lib目录，lib目录下有python3.5，再下面也有site-packages目录。如果使用虚拟环境，所有包都会装到这里。
cd
cd magedu/projects/web
python -V
# 是3.5.3版本
cd ../test
# 进虚拟环境，要安装ipython
cd
mkdir .pip
cd .pip
touch pip.conf
vim pip.conf
    [global]
    index-url=https://mirrors.aliyun.com/pypi/simple/
    trusted-host=mirrors.aliyun.com
# 这一步主要是为了使用pip的国内镜像
pip
# 提示找不到此命令，因为使用了pyenv管理这个版本，而目前的版本是system，system默认是没有安装pip命令的
cd
cd magedu/projects/test
pip
# 现在是3.5.3版本，这里是有pip命令的
pip install ipython
# pip就是python install packge，也就是安装包的缩写，pip是安装的管理器，与yum相似。ipython是一个与python交互的工具
pip install --upgrade pip
# 上一步执行完会提示要升级pip
ipython
# 提示没有ipython命令，再登录一下就可以使用了
pip install jupyter
# 这是一个可视化界面
cd
cd .pyenv/versions/3.5.3/envs
cd my353/lib/python3.5/site-packages/
ll
# 包都装在了这里
cd .pyenv/versions/3.5.3/lib/python3.5/site-packages/
# 这里没有什么东西
cd
cd magedu/projects/test
jupyter notebook --help
jupyter notebook password
# 设置密码，如果不设置，会要求输入一长串东西才能使用
jupyter notebook
# 启动，但因为没有图形接口，所以会有不能运行的提示
ss -tln
# 这时会监听127.0.0.1:8888端口，但不能使用
jupyter notebook --ip=0.0.0.0 --no-browser
# 这样启动可以监听所有地址，从外部就可以访问了。--no-browser表示不启动浏览器
浏览器访问IP:8888，密码是上面设置的。如果没有设置密码，要输入启动时出现的一长串字符
cd magedu/projects/test
# 进入相应版本的目录，不然不能使用pip
pip list
# 查看管理的包
pip help
pip freeze > requirement
# 把当前环境中的pip所安装的文件列表以及版本号全部导入reguiremeot， reguiremeot是自定义的名字
cat  requiremeot
# 这就是导出包的过程
cd ../web
python -V
# 3.5.3版本
pip list
# 现在包很少
pip install -r ../test/requiremeot
# 这样可以保证两个环境安装的包是一样的。另外将一个环境中的site-packages中的包复制到另一个环境的相同目录下也可以实现这个效果
pip list
windows安装python是要选择"Add Python 3.6 to PATH"
```

## 离线安装

```shell
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
git clone https://github.com/pyenv/pyenv-virtualenv.git ~/.pyenv/plugins/pyenv-virtualenv
git clone https://github.com/pyenv/pyenv-update.git ~/.pyenv/plugins/pyenv-update
git clone https://github.com/pyenv/pyenv-which-ext.git ~/.pyenv/plugins/pyenv-which-ext
//可以把克隆的目录打包，方便以后离线使用
vim ~/.bash_profile
export PATH="/home/python/.pyenv/bin:$PATH"
eval "$(pyenv init -)"	//初始化pyenv这个工具
eval "$(pyenv virtualenv-init -)"	//初始化virtualenv这个插件，因为开发都用虚拟环境
source ~/.bash_profile
```



# windows

