---
title: axel使用方法
date: 2019-09-25 11:15:47
tags: conky
categories: 基础
---

```shell
语法：
axel [options] url1 [url2] [url…]

选项：
--max-speed=x , -s x # 最高速度x
--num-connections=x , -n x # 连接数x
--output=f , -o f # 下载为本地文件f
--search[=x] , -S [x] # 搜索镜像
--header=x , -H x # 添加头文件字符串x（指定 HTTP header）
--user-agent=x , -U x # 设置用户代理（指定 HTTP user agent）
--no-proxy ， -N # 不使用代理服务器
--quiet ， -q # 静默模式
--verbose ，-v # 更多状态信息
--alternate ， -a # Alternate progress indicator
--help ，-h # 帮助
--version ，-V # 版本信息

举例：
axel -n 10 -o /tmp/ http://www.jsdig.com/lnmp.tar.gz
# 下载安装包指定10个线程，存到/tmp/。如果下载过程中下载中断可以再执行下载命令即可恢复上次
# 的下载进度。
```

