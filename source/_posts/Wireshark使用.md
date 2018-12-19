---
title: Wireshark使用
date: 2018-11-19 14:57:55
tags: Wireshark
categories: 网络
---

### 基本使用

打开软件后，要选择对哪块网卡抓包，双击即可进入。或点击前头指向的图标

![](/images/Wireshark/Wireshark启动1.jpg)

方框部分表示启用混杂模式，然后点击start即可。如果不选择混杂模式，那么抓到的包就都是从选择的网卡进或出的包，也就是只抓取与本机相关的包。如果选择混杂模式，那么经过本机网卡的包都会被抓取。

![](/images/Wireshark/Wireshark启动2.jpg)

下面方框部分是抓包筛选器，可以通过筛选器过滤掉不想要的数据包

![](/images/Wireshark/Wireshark启动3.jpg)

点击方框部分可以创建一个新的抓包筛选器

![](/images/Wireshark/Wireshark启动4.jpg)

![](/images/Wireshark/Wireshark启动5.jpg)

比如只想抓IP地址是192.168.2.1的数据包，就可以选择下面方框部分

![](/images/Wireshark/Wireshark启动6.jpg)

也可以只抓IP的包（方框部分），或管理筛选器规则（箭头部分）

![](/images/Wireshark/Wireshark启动7.jpg)

下面是管理筛选器页面，可以自定义或删除规则

![](/images/Wireshark/Wireshark启动8.jpg)

也可以手动输入，这里表示只抓取与本机IP相关的包，用host引导

![](/images/Wireshark/Wireshark启动9.jpg)

这时可以看到页面中标明只抓取本机的包

![](/images/Wireshark/Wireshark启动10.jpg)

中间部分是包的分层，从方框中的信息可以看到目标地址是本机。

![](/images/Wireshark/Wireshark启动11.jpg)

先要停止抓包，才能保存

![](/images/Wireshark/Wireshark启动12.jpg)

![](/images/Wireshark/Wireshark启动13.jpg)

可以选择保存类型，建议使用pcap的格式，这种格式使用更广泛，也就是下图中的第二种格式，在保存时还可以选择Compress with gzip来进行压缩保存

![](/images/Wireshark/Wireshark启动14.jpg)

首选项

![](/images/Wireshark/Wireshark启动15.jpg)

调整结构

![](/images/Wireshark/Wireshark启动16.jpg)

调整后的效果，这里取消了16进制信息的显示

![](/images/Wireshark/Wireshark启动17.jpg)

还可以对包的显示信息列进行调整，也可以添加或删除

![](/images/Wireshark/Wireshark启动18.jpg)

方框中是wireshark可以解码的所有协议类型

![](/images/Wireshark/Wireshark启动19.jpg)

数据会先经过抓包筛选器进行过滤，之后再对抓到的包进行显示筛选

方框部分就是显示筛选器

![](/images/Wireshark/Wireshark启动20.jpg)

只想查看到DNS相关的包，输入好后按右面的箭头进行应用。

![](/images/Wireshark/Wireshark启动21.jpg)

这里想创建一个组合的显示条件，输入udp，之后在包分层中按红框选择，在Source上右键，选择Apply as Filter中的and not selected。之后就会在显示筛选器中出现一条筛选语句。这条语句表示，即是udp的包，但来源不是192.168.0.20地址的包

![](/images/Wireshark/Wireshark启动22.jpg)

也可以把规则改为目的地址ip.dst，或地址ip.addr。筛选完成后可再按上面步骤进一步筛选，一定要选择and not selected，这样规则就会叠加。

![](/images/Wireshark/Wireshark启动23.jpg)



### Wireshark信息统计

统计功能基本都在Statistics菜单下

![](/images/Wireshark/Wireshark信息统计1.jpg)