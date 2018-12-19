---
title: nginx安装
date: 2018-09-13 14:44:16
tags: 安装
categories: Nginx
---



# rpm包安装

```shell
vim /etc/yum.repos.d/nginx.repo
    [nginx]
    name=nginx repository
    baseurl=http://nginx.org/packages/centos/7/$basearch/
    gpgcheck=0
    enabled=1
###自建repo文件或用以下命令；如果是CentOS6上安装nginx，就将上面源地址中的7改为6就可以了。也可以下载安装http://http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm。另外，在CentOS6上如果要安装nginx，还要将openssl升级到1.0.2版本以上。到https://www.openssl.org/source/openssl-1.0.2h.tar.gz下载，之后编译安装
###如果提示需要公钥验证，需要执行此命令rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
rpm -ivh https://mirrors.ustc.edu.cn/epel/epel-release-latest-7.noarch.rpm
------------------------------------------------------------------------------------
rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
//此命令安装后也会自建一个叫nginx.repo的源
yum repolist
yum info nginx
yum install nginx
------------------------------------------------------------------------------------
yum install epel-release -y
###也可以用yum安装epel-release包得到epel仓库。也可以安装epel库来安装nginx，这样安装nginx后会自动配置配色方案

注：nginx配置文件默认没有配色，使用下面方法解决
mkdir -pv ~/.vim/syntax
cd ~/.vim/syntax
wget http://www.vim.org/scripts/download_script.php?src_id=14376 -O nginx.vim
vim ~/.vim/filetype.vim
	au BufRead,BufNewFile /etc/nginx/* set ft=nginx
###其中路径为你的nginx.conf文件路径
```



# 源码安装

```shell
yum install zlib-devel pcre-devel
yum groupinstall "开发工具"
tar nginx-1.12.2.tar.gz
cd nginx-1.12.2
./configure --with-pcre --with-zlib
/usr/local/nginx/sbin/nginx     
###启动
/usr/local/nginx/sbin/nginx -s reload    
###重启
/usr/local/nginx/sbin/nginx -s stop    
###关闭
vim /usr/lib/systemd/system/nginx.service
    [Unit]
        Description=Nginx Service
    [Service]
        Type=forking
        PIDFile=/usr/local/nginx/logs/nginx.pid
        ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
        ExecReload=/usr/local/nginx/sbin/nginx -s reload
        ExecStop=/usr/local/nginx/sbin/nginx -s stop
###实现systemd管理nginx
###这里一定要注意PIDFile的路径，在/usr/local/nginx/conf/nginx.conf配置文件中，默认pid文件放在/usr/local/nginx/logs中，如果写错路径，nginx是无法启动的，报错为：PID file /run/nginx.pid not readable (yet?) after start.
```

