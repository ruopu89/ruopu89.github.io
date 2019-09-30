---
title: wget使用
date: 2019-09-25 08:50:33
tags: wget
categories: 网络
---

### 使用
```shell
wget -qO- get.docker.com | bash
# -q：--quiet，静默模式，无信息输出。
# -O：把后面网址下载后，改成一个指定的名称，如果后面没有跟着一个名字，而是“-”，则表示将下载
# 后的内容输出到标准输出，也就是输出到屏幕上。
# -qO-：把下载的内容输出到标准输出，但并不在屏幕显示，目的是直接传递给bash进行解析执行。

\wget -O - https://install.perlbrew.pl | bash
# 前面加一个"\"是取消别名调用，执行原命令。如perlbrew网站

wget -P /opt/wordpress https://wordpress.org/latest.zip
# 下载后保存到指定目录。

wget -c https://wordpress.org/latest.zip
# 断点续传，有时候下载某文件，网络中断后，可以用“-c”来继续之前的下载，如果不使用“-c“则表示
# 重新开始整个下载，且在下载的文件后面加".1"，因为之前没有下载完的文件还存在。

wget -b http://example.com/big-file.zip
# 对于大文件，你可以用“-b”参数在后台下载，输出信息会保存在同目录的“wget-log”中，你可以
# 用“tail -f wget-log”来查看。

wget --no-check-certificate https://github.com/teejee2008/conky-manager/releases/download/v2.4/conky-manager-v2.4-amd64.run
# --no-check-certificate：不检查证书
```

