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



### 备份日志

```shell
生产服务器
ssh-keygen -t rsa -P ''
# 生成密钥
ssh-copy-id -i ~/.ssh/id_rsa.pub '-p 39999 ccjd@126.38.38.85'
# 传输公钥到远程备份服务器。如果不是默认的端口，要用单引号括起远程的端口与地址，端口使用-p选项指定。
ssh ccjd@106.38.38.85 -p 39999
# 连接测试
vim logbackup.sh 
    #!/bin/bash
    #
    cd /usr/local/logs/
    tar -zcf netty.log-`date -d "yesterday" +"%F"`.log.tar.gz ./netty.log-`date -d "yesterday" +"%F"`.*.log
    # 使用date -d "yesterday" +"%F"获取昨天的日期
    scp -P 39999 netty.log-`date -d "yesterday" +"%F"`.log.tar.gz ccjd@106.38.38.85:/home/logsbackup/ 
    # 这里指定端口使用-P选项且要将选项放在前面。
    rm -rf netty.log-`date -d "yesterday" +"%F"`.*.log netty.log-`date -d "yesterday" +"%F"`.log.tar.gz
```



### 安装软件

```shell
#!/bin/bash
#
hn=`hostname`
listen=`ss -tln4 | grep 10050 | awk '{print $4}' | cut -d':' -f2`
rpm -q zabbix-agent
if [ $? -eq 0 ];then
    while [ "$listen" != "10050" ];do
# 这里使用字符串来判断数字，因为测试中如果没有启动服务listen变量就是空，比较时会报错，脚本不会向下执行。
        systemctl start zabbix-agent
        listen=`ss -tln4 | grep 10050 | awk '{print $4}' | cut -d':' -f2`
# 启动之后一定要再检查一次端口是否启动，并赋值给listen
    done
else
    yum install -y /netdisk/soft/zabbix/zabbix-agent-3.4.3-1.el7.x86_64.rpm
cat > /etc/zabbix/zabbix_agentd.conf << EOF
PidFile=/var/run/zabbix/zabbix_agentd.pid
LogFile=/var/log/zabbix/zabbix_agentd.log
LogFileSize=0
EnableRemoteCommands=1
Server=172.16.201.2
ServerActive=127.0.0.1
Hostname=$hn
Include=/etc/zabbix/zabbix_agentd.d/*.conf
EOF
# 从cat命令到这里的内容最好都顶头写，尤其最后的EOF，如果不顶头写会报语法错误。中间要输入的内容如果不顶头写，在写入配置文件后也会在内容前有空格。
    systemctl start zabbix-agent
fi
```



### 跳板机

```shell
[root@template sh]# vim /etc/profile.d/tiaoban.sh
	[ $UID -ne 0 ] && . /tmp/tiaoban.sh
# 判断用户是否为root用户，如果不是就加载tiaoban.sh脚本
[root@template sh]# vim /tmp/tiaoban.sh
# 这个脚本要放在一个登录的普通用户可以进入执行的路径 
trapper() {
   trap ':' INT EXIT TSTP TERM HUP
}
# 测试发现，这里使用trap ':'或trap ''都是一样的。如果不使用trap命令，普通用户登录后，在菜单中使用ctrl+c可以退出到命令行界面
while :;do
   trapper
   clear
   cat << menu
        1. web a
        2. web b
        3. exit
menu
   read -p "pls select: " num
   case "$num" in
   1)
        echo 1
        ssh root@192.168.1.14
        # 这里如果不指定用户登录，会使用当前的用户登录
        ;;
   2)
        echo 2
        ssh root@192.168.1.15
        ;;
   3|*)
        exit
        ;;
   esac
done
# 用户以普通用户的身份登录后只会显示菜单，再传输跳板机中普通用户的密钥到目标主机，最后禁止使用密码登录跳板机或禁止root用户登录即可
# 跳板机的实现，就是通过一个脚本，提供菜单，实现登录远程主机与退出功能，另外，添加一个环境变量，判断只要不是root用户登录，就加载这个跳板机脚本，给用户提供菜单，最后给创建一个普通用户的权限，可以连接跳板机，这样在用户登录时就可以看到菜单，但用户无法连接到这台跳板机服务器的命令行。可否添加高可用keepalived？
```



### 批量卸载rpm包

```shell
#!/bin/bash
#
for i in `find ./ -name *.rpm`;do
# 搜索当前目录下的所有rpm包，路径最好写绝对路径
    test=`basename $i | cut -d'.' -f1 | awk -F"-" 'OFS="-"{$NF=""}END{sub(/-$/,"");print}'`
# 先取包名，如：drbd84-utils-8.4.1-2.el6.elrepo.x86_64.rpm，因为不想加包的版本号，所以继续取包名，使用cut命令按点来分隔，取出第一段，这时是这样的：drbd84-utils-8，再使用awk命令，指定分隔符为"-"，之后再指定输出分隔符为"-"，$NF表示最后一列，如果只写到这里，取出的值是：drbd84-utils-，只去除了以"-"为分隔符后的最后一段，但最后还有一个"-"，这样就使用END命令，在最后再处理一次，sub是内置函数，/-$/是指尾部的"-"，sub(/-$/,"")表示将尾部的"-"改为空，最后打印出来，就成了：drbd84-utils
    yum remove -y $test
done
```



### 提取JSON文件中的指定值

```shell
有JSON格式文件都在一行中，需要从中提取指定的值，需要从中提取"ChannelName"后的值，如"BTV文艺"，JSON文件内容如下：
{"count": 460, "data": [{"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"ADID":"16512_1_102","Advtype":2,"RandomSeq":"dce3db2d-8331-43e8-8dab-fc42d4bdff4b","LocalTime":"2019-02-01 00:00:00","CACardID":"8100103913276261","EventtypeId":"AdvDataCollect","IsLeave":"1","ServiceID":102,"DeviceType":"DVBIP-1004","CollectManufacturer":"inspur","ChannelName":"BTV文艺","SerialNumber":"10081807030091806","ADPositionID":6,"RegionId":"11132"}", "AdvDataCollect": {"ADPositionID": "6", "Advtype": "2", "ServiceID": "102", "ADID": "16512_1_102", "IsLeave": "1", "ChannelName": "BTV文艺", "LocalTime": "2019-02-01 00:00:00.000+0800"}, "RegionId": "11132", "RandomSeq": "dce3db2d-8331-43e8-8dab-fc42d4bdff4b", "DeviceType": "DVBIP-1004", "time": "2019-02-01 00:00:00.000+0800", "EventtypeId": "AdvDataCollect", "_id": "LsulpGgBnh2vjNXwpHy3", "_collect_time": "2019-02-01 00:02:25.064+0800"}, {"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"ADID":"16512_1_102","Advtype":2,"RandomSeq":"653c618f-4282-452a-b680-d4050ec6b567","LocalTime":"2019-02-01 
.........
23:59:11","CACardID":"8100103913276261","EventtypeId":"LockingDataCollect","DeviceType":"DVBIP-1004","Locked":"true","CollectManufacturer":"inspur","SerialNumber":"10081807030091806","SymbolRate":6875000,"Modulation":"QAM64","Quality":37,"CurrentFrequency":331,"Level":60,"RegionId":"11132"}", "RegionId": "11132", "RandomSeq": "e2c61503-7d9d-47dc-979d-a17cd4db5a30", "DeviceType": "DVBIP-1004", "time": "2019-02-01 23:59:11.000+0800", "EventtypeId": "LockingDataCollect", "_id": "kDTIqWgBNUKkFfMOVTGX", "_collect_time": "2019-02-01 23:58:24.179+0800", "LockingDataCollect": {"Locked": "true", "Level": "60", "Modulation": "QAM64", "SymbolRate": "6875000", "CurrentFrequency": "331", "Quality": "37", "LocalTime": "2019-02-01 23:59:11.000+0800"}}, {"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"DeviceType":"DVBIP-1004","CollectManufacturer":"inspur","RandomSeq":"b7b7896b-c293-425a-ae7c-40675f22252f","SerialNumber":"10081807030091806","LocalTime":"2019-02-01 23:59:11","Idle":91,"SystemRunTime":23475,"RegionId":"11132","FlashRest":4823449,"CACardID":"8100103913276261","EventtypeId":"ResourceDataCollect","RAMRest":638}", "ResourceDataCollect": {"SystemRunTime": 23475.0, "FlashRest": 4823449.0, "Idle": "91", "RAMRest": 638.0, "LocalTime": "2019-02-01 23:59:11.000+0800"}, "RegionId": "11132", "RandomSeq": "b7b7896b-c293-425a-ae7c-40675f22252f", "DeviceType": "DVBIP-1004", "time": "2019-02-01 23:59:11.000+0800", "EventtypeId": "ResourceDataCollect", "_id": "B8TIqWgBnh2vjNXwVauX", "_collect_time": "2019-02-01 23:58:24.602+0800"}], "timed_out": false, "take_time": 5475}

root@ruopu64:2019-03-07#cat 8100103913276261_2019-02-01.json | tr "," "\n" | grep "ChannelName"
# 使用tr命令将文件中的逗号都转为新行，之后再查找指定值即可。
# 这样的JSON文件每天会产生一个
root@ruopu64:2019-03-07#cat *.json > all.json
# 将所有文件输出到一个文件中
root@ruopu64:2019-03-07#cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n > allOK.txt
# 再将统计结果输出到一个文件中。通过这两步就可以统计所有频道点播的次数了

root@ruopu64:2019-03-07#vim all.sh
#!/bin/bash
#
count=$(cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n)
counta=$(cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n|awk '{print $1}')
a=0
for i in `cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n|awk '{print $1}'`;do
    let a=$a+$i                                                                                                              
done
echo $a
```



