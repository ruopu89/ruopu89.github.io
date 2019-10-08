---
title: vscode使用git上传代码至github
date: 2019-10-08 17:37:53
tags: git插件
categories: vscode
---

### 安装

1. 安装vscode与git，这里选择在ubuntu系统中安装这两个程序



### git设置

```shell
git config --global user.name "r******9" 
git config --global user.email "r******9@hotmail.com"
# 使用git config命令对Git进行全局设置

shouyu@shouyu-pc~/文档  git clone https://github.com/r****9/Python.git
# 先到github上创建一个项目，之后将github上的代码克隆到本地
```



### vscode设置

1. 查看克隆的项目

![](/images/vscode/vscode-git插件1.png)

2. 使用vscode的open Folder打开克隆下来的目录

![](/images/vscode/vscode-git插件2.png)

3. 创建一个新文件，以.py结尾

![](/images/vscode/vscode-git插件3.png)

4. 输入一些代码

![](/images/vscode/vscode-git插件4.png)

5. 可以看到在CHANGES中标明了此次的变化，可以点击加号添加到暂存区，再点击对勾提交，这时会要求输入一个名称

![](/images/vscode/vscode-git插件6.png)

![](/images/vscode/vscode-git插件7.png)

6. 提交后，将代码push到远程的github上，点击红框部分，再点击OK，这时会要求输入github的用户名和密码

![](/images/vscode/vscode-git插件8.png)

![](/images/vscode/vscode-git插件9.png)

7. 登录github查看，代码已经上传

![](/images/vscode/vscode-git插件10.png)

8. push到github不再需要输入用户名与密码的方法

```shell
git config --global credential.helper store
# 输入此命令后，会在用户家目录的.gitconfig中加入下面信息
# [credential]
#     helper = store
在vscode中将代码push到github，这时会要求输入用户名和密码，输入的用户名密码会被记住, 下次
再push代码时就不用输入用户名密码了。这一步会在用户目录下生成文件.git-credential记录用户
名密码的信息。
# git config --global user.email "alice@aol.com" 操作的就是上面的email
# git config --global push.default matching 操作的就是上面的push段中的default字段
# git config --global credential.helper store 操作的就是上面最后一行的值
# git config --global 命令实际上在操作用户目录下的.gitconfig文件，文件内容如下：
# [user]
#     name = alice
#     email = alice@aol.com
# [push]
#     default = simple
# [credential]
#     helper = store
```





