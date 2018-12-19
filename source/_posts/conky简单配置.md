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
${voffset 10}${color EAEAEA}${font caviar dreams:pixelsize=120}${time %H:%M}${font}${voffset -84}${offset 10}${color FFA300}${font caviar dreams:pixelsize=42}${time %d}     ${voffset -15}${color EAEAEA}${font caviar dreams:pixelsize=22}${time  %B} ${time %Y}${font}${voffset 24}${font caviar dreams:pixelsize=58}${offset -148}${time %A}${font}
${voffset 1}${offset 12}${font caviar dreams:pixelsize=12}${color FFA300}HD ${offset 9}$color${fs_free /} / ${fs_size /}${offset 9}$color${fs_free /home} /home ${fs_siz    e /home}${offset 30}${color FFA300}RAM ${offset 9}$color$mem / $memmax${offset 30}${color FFA300}CPU ${offset 9}$color${cpu cpu0}%
# 这里配置了两部分，上面是效果中的日期，下面是电脑的配置如硬盘，内存等的信息。将font后面都改为caviar dreams。这里添加了一个home分区的监测情况，默认只会显示根目录的情况。但测试发现将${font caviar dreams:pixelsize=22}与${font caviar dreams:pixelsize=58}两项中的caviar dreams去掉为空时，才能正常显示中文，不然还是一个方框。第二行中的${font caviar dreams:pixelsize=12}中的caviar dreams也可以去掉，字体会好看一些。
```

