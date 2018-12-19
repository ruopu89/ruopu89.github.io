---
title: ShellScript练习
date: 2018-12-05 16:49:27
tags: Shell
categories: Shell
---

### 查看日志

```shell
# 因没办法得到日志，所以只能用tcpdump来抓包，之后将抓到的包中的设备编号取出并排序。这里只取数字
tcpdump -i em1 -w netty.cap
vim enginenumber.sh
        #!/bin/bash
        #

        for i in `tcpdump -X -r $1 | grep stamc | awk '{print $10}'`;do
        # tcpdump -X表示以ASCII码的方式显示，-r表示读取，$1是要输入的cap文件名，解析cap文件后从中找到有stamc的行，最后打印出每10列
           first=`echo ${i##*stamc}`
           # 截取结果中stamc后面的部分，并将结果给first变量。因为结果都是stamc****ve这样的结果
           for j in $first;do
           # 将$first变量的值给j
                echo ${j%ve*} >> ./test.txt
                # 截取结果中ve前面的部分，这时的结果是****ve这样的编号，将结果重定向到当前目录下的test.txt文件中
           done
        done
        sort -n -u test.txt >> $2
        # 将test.txt中的数字以从小到大的顺序排列，并去除重复的数字，最后输出到一个文件，输出的文件需要执行命令时手工输入
        rm -rf ./test.txt
        # 最后删除test.txt文件
```



### 查询设备编号

```shell
# 每日有大量日志文件，每500M打包一个，需要从众多日志文件中查找设备编号，并查看日志结果
vim netty.sh
        #!/bin/bash
        #
        read -p "please input month: " -t 10 month
        # 输入月份
        read -p "please input day: " day
        # 输入日期
        read -p "please input engine number: " engine
        # 输入设备编号
        read -p "please input logs path: " path
        # 输入日志路径
        for i in `ls $path/netty.log-2018-${month}-${day}.*.log`;do
        # 遍历当天的所有日志
            grep -a "stamc${engine}ve" $i >> new.txt
            # 从每个日志中查找相应的设备编号，并重定向到new.txt文件中。使用-a选项是因为日志中多是二进制文件，直接打开或查找会显示乱码。
        done
```

