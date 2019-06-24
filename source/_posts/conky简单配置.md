---
title: conky简单配置
date: 2018-12-18 14:25:52
tags: conky
categories: 基础
---

#### 安装

```shell
apt install -y conky-all conky-manager
到https://www.fontsquirrel.com/fonts/list/find_fonts?q%5Bterm%5D=dreams&q%5Bsearch_check%5D=Y下载CAVIAR DREAMS，解压缩下载的字体包，双击安装字体。安装这个字体是因为conky显示的效果中有方框，因为其他字体没有相应的字符。
# ubuntu18.04下没有conky-manager，需要下载，地址：wget --no-check-certificate https://github.com/teejee2008/conky-manager/releases/download/v2.4/conky-manager-v2.4-amd64.run。之后给此文件执行权限，并执行：sudo ./conky-manager-v2.4-amd64.run
```

#### 配置

```shell
conky-manager
在窗口中选择.conky/Gotham/Gotham，这是会在桌面上显示时间与一些电脑基本信息，再选择配置这个效果，在弹出的窗口中选择Transparency，再选择Transparent，这会有一个透明的效果。

vim ~/.conky/Gotham/Gotham
use_xft yes                                                                                                                                                                 
xftfont caviar dreams:size=8
# 这里改为caviar dreams
xftalpha 0.1 
update_interval 1
total_run_times 0

own_window yes 
own_window_type normal
own_window_transparent yes 
own_window_hints undecorated,below,sticky,skip_taskbar,skip_pager
own_window_colour 000000
own_window_argb_visual yes 
own_window_argb_value 0

double_buffer yes 
#minimum_size 250 5
#maximum_width 500 
draw_shades no
draw_outline no
draw_borders no
draw_graph_borders no
default_color white
default_shade_color red 
default_outline_color green
alignment top_middle
gap_x -50 
gap_y 80
no_buffers yes 
uppercase no
cpu_avg_samples 2
net_avg_samples 1
override_utf8_locale yes 
use_spacer yes 


minimum_size 0 0 
TEXT
${voffset 10}${color EAEAEA}${font :pixelsize=120}${time %H:%M}${font}${voffset -84}${offset 10}${color FFA300}${font caviar dreams:pixelsize=42}${time %d} ${voffset -15}${color EAEAEA}${font :pixelsize=22}${time  %B} ${time %Y}${font}${voffset 24}${font :pixelsize=58}${offset -148}${time %A}${font}

${voffset 1}${offset 12}${font :pixelsize=12}${color FFA300}HD ${offset 9}$color${fs_free /} / ${fs_size /}${offset 9}$color${fs_free /home} /home ${fs_size /home}${offset 30}${color FFA300}RAM ${offset 9}$color$mem / $memmax${offset 30}${color FFA300}
# 这里配置了两部分，上面是效果中的日期，下面是电脑的配置如硬盘，内存等的信息。将font后面都改为caviar dreams。这里添加了一个home分区的监测情况，默认只会显示根目录的情况。但测试发现将${font caviar dreams:pixelsize=22}与${font caviar dreams:pixelsize=58}两项中的caviar dreams去掉为空时，才能正常显示中文，不然还是一个方框。第二行中的${font caviar dreams:pixelsize=12}中的caviar dreams也可以去掉，字体会好看一些。
```



#### 启动命令

```shell
# 在ubuntu中测试时，不会开机启动此程序，可以将下面命令加入ubuntu的“启动应用程序首选项”中。
conky -c ~/.conky/Gotham/Gotham -d
# 使用-c指定配置文件，-d表示在后台运行。这个方法在ubuntu18.04上测试失败了。

# 下面使用另一种方法实现开机启动
sudo vim .config/autostart/conky.desktop
[Desktop Entry]
Name=conky
Type=Application
Exec=conky -c /home/shouyu/.conky/Gotham/Gotham -d 
# 用户家目录的.config是只有root才有权编辑的，在此目录的autostart目录中加入一个自启动的脚本。
```

