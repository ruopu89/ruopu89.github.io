---
title: 内网主机使用ossutil工具访问阿里OSS
date: 2020-02-07 20:01:55
tags: 阿里云
categories: 阿里云
---

### 问题

线下主机只能使用内网，并且无法只能使用NFS和FTP共享资源，因为这台主机要共享的目录也是挂载的其他主机的nfs服务，也就是说需要这台主机共享自己挂载的NFS目录，这样做好像是不可以的，因为使用exportfs -arv命令时一时提示此目录不支持NFS。所以就部署了FTP服务，阿里云主机通过专线访问FTP服务，并使用工具挂载FTP服务。如下：

```shell
歌华分享vsftpd服务，阿里挂载
线下
yum install vsftpd
useradd xorupload
echo 'HELPbjcloud20190729!'|passwd --stdin xorupload
vim /etc/vsftpd/vsftpd.conf
关闭匿名访问
关闭使用本地用户
local_root=/vod
# 只需要改变这个默认的目录即可。这和用户的家目录没有关系，但还要用本地用户登录
systemctl start vsftpd
systemctl enable vsftpd

阿里
yum install curlftpfs
curlftpfs -o codepage=utf8 ftp://xorupload:'HELPbjcloud20190729!'@172.16.201.44 /media
# 挂载
fusermount -u /media
# 卸载
```

这样做是可以实现功能的，但速度非常慢，阿里主机起的作用就是将线下的资源上传到阿里的OSS服务上，从本地上传或从本地使用lftp连接FTP服务下载的速度都没有问题，但要实现直接从FTP挂载点上传到阿里OSS上时，速度就马上降了下来。之后还考虑使用sshfs命令挂载文件系统，但线下不开放SSH服务给非内网主机，所以无法实现。最后想到使用阿里主机做代理，线下主机直接使用阿里的ossutil工具，通过代理上传资源到阿里OSS上，最后成功实现，方法如下：

```shell
------------
   阿里ECS
------------
vim /etc/nginx/conf.d/ossreverse-internal.conf
server {
    listen 80;
    server_name oss-cn-beijing-internal.aliyuncs.com;
    access_log /var/log/nginx/endpoint.log;
    location / {
        proxy_pass http://oss-cn-beijing-internal.aliyuncs.com;
    }
}
server {
    listen 80;
    server_name bjy-edu.oss-cn-beijing-internal.aliyuncs.com;
    access_log /var/log/nginx/endpoint.log;
    location / {
        proxy_pass http://bjy-edu.oss-cn-beijing-internal.aliyuncs.com;
    }
}
# 这里设置的nginx主机域名和实际的OSS的endpoint和域名是一样的

------------
   线下主机
------------
下载ossutil64工具
chmod +x ossutil64
cp ossutil64 /sbin
ossutil64 config
# 初始化，一直回车
vim .ossutilconfig
[Credentials]
language=EN
endpoint=http://oss-cn-beijing-internal.aliyuncs.com
accessKeyID=LTAI4FnMoMFemG6j3KFbj
accessKeySecret=AC8W0CB3AQ181oW9AF9aYzfXA
# 配置ossutile工具，注意，endpoint要使用内网，这样才能保证网速。另外要配置对bucket有权限控制的accesskey
vim /etc/hosts
172.16.211.110  oss-cn-beijing-internal.aliyuncs.com bjy-edu.oss-cn-beijing-internal.aliyuncs.com
# 把两个域名都解析到代理服务器上
ossutil64 ls
# 测试是否可以使用了
下面创建一个目录，这个目录保存了导出的节目清单，我们要从清单中取得节目的路径并上传到OSS上。这里设置保存
的目录为/xor/data2/bjos
vim /root/aliupload/filecheck.sh
#!/bin/bash
#
ls /xor/data2/bjos/target*.txt
if [ $? -eq 0 ];then
    for i in `ls /xor/data2/bjos/target*`;do
        if [ -f $i ] ;then
	    awk -F '?' '{print $1}' $i | awk -F '/' '{print "/"$4"/"$5"/"$6"/"$7"/"$8}' >> /xor/data2/bjos/current_upload/upload_`basename $i|awk -F . '{print $1}'`_`date +%Y%m%d`.txt
        fi
        mv $i /xor/data2/bjos/old_upload
# 在这里处理过target文件后，就直接移走。这比在最后一起移走的逻辑要严谨。因为可能在脚本执行中，
# 会有新的target文件生成，但并没有在这处理，但最后会被脚本一起移走，这样就会出现没处理过的target文件。
    done
    if [ $? -eq 0 ];then
        for j in `ls /xor/data2/bjos/current_upload/*`;do
	    if [ `grep -c '.m3u8' $j` -gt 0 ];then 
	    # grep的-c选项只统计匹配到的行数，这里如果大于0说明找到了内容
			cp $j ${j}_ts
			sed -i -e 's@.m3u8@@g' -e 's@_@/@g' ${j}_ts
		# 内时匹配替换多个值
	    fi
	done
	for w in `ls /xor/data2/bjos/current_upload/*`;do
            while read line;do
                /root/aliupload/ossutil64 cp -rfu -j 5 --loglevel info $line oss://bjy-edu$line
# 直接使用ossutil64会有找不到命令的报错，但使用上并没有问题。也许是环境变量的问题，所以使用了绝对路径
            done < $w
        done
    fi
#    for l in `ls /xor/data2/bjos/*`;do
#        if [ -f $l ];then
#            mv $l /xor/data2/bjos/old_upload
#        fi
#    done  # 在这里才处理target文件会有上面所说的未处理的target文件被移走的问题
    for m in `ls /xor/data2/bjos/current_upload/*`;do
        mv $m /xor/data2/bjos/old_upload
    done
    #kill -9 `lsof /xor/data2/bjos|awk '{print $2}'|tail -1`
# 开始以为是有别的程序在操作/xor/data2/bjos这个目录，所以最后使用lsof查看哪个程序在使用这个目录，并
# 把它杀死。之后发现是定时任务有问题。
    exit 0
else
    exit 1
fi





crontab -e
1 */2 * * * /bin/bash /root/aliupload/filecheck.sh >>  /root/aliupload/upload.log 2&>1
# 测试发现，在设置执行时间时如果不指定第一个值，似乎会每两小时的每分钟执行一次，所以/xor/data2/bjos目录中的文件一直有问题，放在这个目录下的.txt文件总会被移动到old_upload目录中。错误方法如下：
# * */2 * * * /bin/bash /root/aliupload/filecheck.sh >>  /root/aliupload/upload.log 2&>1
```

