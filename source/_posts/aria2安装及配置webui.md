---
title: aria2安装及配置webui
date: 2020-02-18 23:26:21
tags: aria2
categories: 网络
---

### 安装

```shell
apt install aria2 nginx
# 安装aria2与web服务器
到https://github.com/ziahamza/webui-aria2下载整个项目，解压后将其中的docs文档放到/var/www/html目录下，改名为webui
```



### 配置

```shell
mkdir /etc/aria2
vim /etc/aria2/aria2.conf
# 设置的RPC授权令牌, 取代 --rpc-user 和 --rpc-passwd 选项
# token可以自己随意设置
rpc-secret=44a70bf2-token93c6-96359e3e53ee
# 下面是ssl证书，可以先不管
#rpc-private-key=/etc/aria2/server.key
#rpc-certificate=/etc/aria2/server.crt

#允许rpc
enable-rpc=true
#允许所有来源, web界面跨域权限需要
rpc-allow-origin-all=true
#允许外部访问，false的话只监听本地端口
rpc-listen-all=true
#RPC端口, 仅当默认端口被占用时修改
rpc-listen-port=6800

#文件保存路径, 默认为当前启动位置
dir=/root/downloads
#从会话文件中读取下载任务
input-file=/etc/aria2/aria2.session
#在Aria2退出时保存`错误/未完成`的下载任务到会话文件
save-session=/etc/aria2/aria2.session
#定时保存会话, 0为退出时才保存, 需1.16.1以上版本, 默认:0
#save-session-interval=60
force-save=true
#log=/aria2log
#log-level=error

#最大同时下载数(任务数), 路由建议值: 3
max-concurrent-downloads=5
#断点续传
continue=true
#同服务器连接数
max-connection-per-server=5
#最小文件分片大小, 下载线程数上限取决于能分出多少片, 对于小文件重要
min-split-size=10M
#单文件最大线程数, 路由建议值: 5
split=10
#下载速度限制
max-overall-download-limit=0
#单文件速度限制
max-download-limit=0
#上传速度限制
max-overall-upload-limit=0
#单文件速度限制
max-upload-limit=0
#断开速度过慢的连接
#lowest-speed-limit=0
#文件缓存, 使用内置的文件缓存, 如果你不相信Linux内核文件缓存和磁盘内置缓存时使用, 需要1.16及以上版本
#disk-cache=0
#另一种Linux文件缓存方式, 使用前确保您使用的内核支持此选项, 需要1.15及以上版本(?)
#enable-mmap=true
#文件预分配, 能有效降低文件碎片, 提高磁盘性能. 缺点是预分配时间较长
#NTFS建议使用falloc, EXT3/4建议trunc, MAC 下需要注释此项所需时间 
#none < falloc ? trunc << prealloc, falloc和trunc需要文件系统和内核支持
file-allocation=prealloc

aria2c --conf-path=/etc/aria2/aria2.conf -D
# 在后台启动，这会监听6800端口，如果启动失败，可以去掉-D选项查看原因。一般为配置文件中的某些路径没有创建所至
systemctl start nginx
访问http://IP/webui就可以看到图形界面了
```

