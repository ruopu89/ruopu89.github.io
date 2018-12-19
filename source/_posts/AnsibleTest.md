---
title: AnsibleTest
date: 2018-07-16 15:28:08
categories: ansible
tags: ansible
type: 管理工具
---



# 安装

> 准备三台主机，主机名与地址分别为：test1:10.5.5.158、test2:10.5.5.159、test3:10.5.5.160

```shell
yum install -y epel-release
yum install -y ansible
ssh-keygen -t rsa -P ''
//生成私钥
ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.5.5.159
ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.5.5.160
//将公钥传到另外两台主机，这样可以保证使用密钥连接远程主机
vim /etc/ansible/hosts
	[websrvs]
	10.5.5.159
	10.5.5.160
	[localhost]
	10.5.5.158
//设置主机分组
```

# ansible配置

```shell
vim /etc/ansible/hosts
    [websrvs]
    www[1:7].ruopu.com
//这样会列出www1.ruopu.com到www7.ruopu.com
vim /etc/ansible/hosts
	[websrvs]
	192.168.1.100 ansible_ssh_port=22 ansible_ssh_user=ruopu ansible_ssh_pass=centos
//定义连接目标主机时用的端口，用户名和密码
vim /etc/ansible/hosts
    [websrvs]
    192.168.1.100 ansible_ssh_port=22 ansible_ssh_user=ruopu ansible_ssh_pass=centos
//将websrvs中的10.5.5.159改为上面的样子，表示连接目标主机时用的端口，用户名和密码
vim /etc/ansible/hosts
    [websrvs]
    172.16.0.67 http_port=8080
    172/16.0.68 http_port=8080

    [websrvs:vars]
    http_port=8080
    //这是定义组变量，因为上面的http_port的值是一样的，都是8080，所以可以定义这样的组，用中括号括起上面的组名+:vars，下面写上值，这时上面就不用再写http_port=8080了
```




# ansible命令

## 模块

> 语法：
>
> ansible <host-pattern> [-f forks][-m module_name] [-a args] 
>
> ansible 主机组 -m 模块 -a "值"

### ping模块

```
ansible all -m ping -C
//测试是否可以连接到所有主机。
```

### 查看组内主机

```
ansible websrvs --list-hosts 
//使用--list-hosts选项，websrvs是组名
```

### group模块，添加、删除组

> group模块，gid=group id，name=group name，state=present(创建)/ansent(删除)，system=0(非系统组)/1(系统组)

```
ansible all -m group -a "gid=3000 name=mygrp state=present system=0"
//在目标主机上创建组，组ID是3000，组名是mygrp，present表示创建，如果是absent表示删除，system表示是否为系统组，这里是0表示不是，默认也是0。显示结果中的changed项变为了true，表示变更了
tail -1 /etc/group
//到目标主机查看是否添加了组
ansible websrvs -m group -a "gid=3000 name=mygrp state=absent"
//删除刚创建的组
tail -1 /etc/group
//到目标主机查看是否删除了组
```

### user模块，添加、删除用户

> user模块，uid=用户id，name=用户名，state=创建present/删除absent，groups=附加组，shell=SHELL 

```
ansible all -m user -a "uid=5000 name=testuser state=present groups=mygrp shell=/bin/bash"
//创建用户，groups表示附加组，shell表示默认shell
```

### copy模块

> 1. 复制文件，src=源目录，dest=目标文件，owner=复制过去的文件属主，group=复制过去的文件属组

```
ansible all -m copy -a "src=/etc/fstab dest=/tmp/fstab.ansible mode=600"
//將本機/etc/fstab文件複製到所有主機的tmp目錄下叫fstab.ansible
```

> 2. 复制内容，content='内容'，dest=目标文件，owner=复制过去的文件属主，group=复制过去的文件属组 

```
ansible all -m copy -a "content='hi there\n' dest=/tmp/hi.txt owner=testuser group=mygrp"
//将内容hi there写入/tmp目录下的hi.txt文件中，dest指定的文件可以是已經存在的文件
```

> 3. 复制目录或文件，src=/源目录/，dest=目录路径。如果源目录没有后面的斜线，就复制整个目录过去，如果有斜线，就复制目录下的文件过去 

```
ansible all -m copy -a "src=/etc/pam.d/ dest=/tmp/"
```

### fetch模块

> 这个模块是从远程主机复制到本地，要先指明远程主机，可以是组或全部主机或单一主机IP，src=远程主机的目录（如果是多台主机，远程主机上要有相同的目录及文件），dest=本地路径。复制后，本地将以IP地址命名远程主机复制过来的内容 

```
ansible all -m fetch -a "src=/tmp/other dest=./"
//因为共有三台主机，所以当前目录下会有三个以IP命名的目录
```

### command模块 

> 1. 因为在/etc/ansible/ansible.cfg配置文件中module_name = command指定了默认模块使用command，所以如果是command模块，可以不用-m指定。 

```
ansible all -m command -a "ifconfig"
//在所有主机上执行ifconfig命令
```

> 2. chdir=到哪个目录执行，mkidir COMMAND。-m command省略了，不建议这样使用。要用ansible all -m file -a "path=/var/tmp/hello.dir state=directory" 

```
ansible all -a "chdir=/var/tmp mkdir hi.dir"
//到远程主机的/var/tmp目录下创建一个叫hi.dir的目录
```

### shell模块 

> 用此模块执行shell命令，与command模块类似，但更强大。如果用ansible all -m command -a "echo 123456 | passwd --stdin testuser"命令，那么就不能将123456这个密码传递给testuser，而将echo后的全部内容当密码传递给testuser 

```
ansible all -m shell -a "echo 123456 | passwd --stdin testuser"
//在所有主机上执行，设置testuser用户密码为123456
```

### file模块 

> 创建符号链接；src=目标主机的文件，path=目标主机路径，state=link(符号链接模式) 

```
ansible all -m file -a "src=/var/tmp/fstab.ansible path=/var/tmp/fstab.link state=link"
//这里主机应该靠state=link来定义是符号链接
```

### cron模块 

> 创建定时任务；minute=分钟，job＝'任务'，name＝任务名。有任务名方便删除 

```
ansible all -m cron -a "minute=*/3 job='/usr/sbin/ntpdate 192.168.1.64 &> /dev/null' name=None"
```

### yum模块 

> 在目标主机安装软件；name=软件包名，state=installed安装 

```
ansible all -m yum -a "name=nginx state=installed"
//在所有主机上安装nginx
```

### service模块 

> 启动、重启、关闭服务；name=程序名，state=started启动,stopped停止,restarted重启,reloaded重新装载 

```
ansible all -m service -a "name=nginx state=started"
```

### script模块 

> 远程执行脚本，-a选项后直接指定路径。这只是在远程执行脚本，但脚本不会复制到远程主机 

```
ansible all -m script -a "/tmp/test.sh"
```

### setup模块 

> 获取远程主机上的变量，这会列出远程主机上的所有模块 

```
ansible 192.168.1.100 -m setup
//命令会输出主机的很多属性信息，如内存信息，IP地址等
```



## playbook剧本功能

> playbook即剧本，让目标主机按照既定的剧本执行任务。playbook实为目录，在目录中创建相应的子目录，这些子目录就是一个个的角色。剧本中都用YAML格式文件，它是可读性高，用来表达数据序列的格式
>
> playbook的核心元素：
>
> 	Hosts：主机
>		
> 	    tasks: 任务列表
>		
> 	    variables: 变量
>		
> 	    templates: 包含了模板语法的文本文件
>		
> 	    handlers: 由特定条件触发的任务
>		
> 	    roles: 角色
>
> playbook的基本组件
>
>          Hosts：运行指定任务的目标主机
>        
>          remoute_user：在远程主机上执行任务的用户
>        
>          sudo_user
>        
>          tasks：任务列表
>        
>          	模块，模块参数
>        
>          	格式
>        
>     		1.action
>        
>     		2.module
>
> 格式：
>
> ```
> - hosts: all
>   remote_user: root
> //文件开始都要设置在哪些主机上执行，远程执行者的身份这两行。另外，要以横线空格引导，后面是名字和冒号、空格，这是基本的语法
>   tasks
>   - name
>     copy: 
>   handlers
>   //上面两项是任务和特定条件触发任务。在它们的下面可以用横线空格名字冒号空格来定义一些要执行的内容。注意横线后都是name，说明其下面的内容是做什么的，另外横线与其上面的字母，如与tasks要对齐。横线下面的的字母与name的每一个字母对齐。
> ```
>
> 





## 创建剧本 

```
mkdir /root/playbooks
cd playbooks
vim first.yaml
    - hosts: all
    //定义哪台主机执行
      remote_user: root
      //以谁的身份执行
      tasks:
      //打算执行的任务。也就是-m选项指定的模块和-a选项指定的任务
      - name: install redis
      //执行的任务的名字，自取。这是一个描述信息
        yum: name=redis state=latest
        //安装redis，state=latest最新，latest与present相似，都是安装包的
      - name: copy config file
        copy: src=/root/playbooks/redis.conf dest=/etc/redis.conf owner=redis
        //复制配置文件到远程主机的etc目录下
      - name: start redis
        service: name=redis state=started enabled=true
        //启动redis，并开机启动
复制一个redis.conf配置文件到playbooks目录下
ansible-playbook --syntax-check first.yaml
//检查first.yaml文件的语法是否有问题
ansible-playbook --list-hosts --list-tasks first.yaml
//--list-hosts表示可以在哪些主机上执行，--list-tasks表示都执行哪些任务。
ansible-playbook -C first.yaml
//测试执行。按任务分别在每台主机上执行。-C选项是在目标主机上跑一次，但不真正执行
ansible-playbook first.yaml
//这是在目标主机真正执行，redis需要使用epel库
```

## 条件触发脚本任务

> notify: restart redis表示当有变化时通知给name是restart redis的项，这个项是用handlers引导的。notify写在哪里，就是在哪里有变化时通知，如下面就是用notify监控着copy项，如果copy的配置文件有变化就通知给handlers，handlers也就是由特定条件触发的任务
```
vim first.yaml
	- hosts: all
      remote_user: root
      tasks:
      - name: install redis
        yum: name=redis state=latest
      - name: copy config file
        copy: src=/root/playbooks/redis.conf dest=/etc/redis.conf owner=redis
        notify: restart redis
      - name: start redis
        service: name=redis state=started enabled=true
      handlers:
      - name: restart redis
        service: name=redis state=restarted
vim /root/playbooks/redis.conf
//加入一些内容
ansible-playbook first.yaml
//执行此命令时，因为配置文件有了变化，所以handlers会收到notify发的通知，并重启redis服务
```

> tags标签；定义tags: configfile后可以在ansible-playbook使用中用-t选项指定标签，从而只执行这个有标签的任务。

```
vim first.yaml
	- hosts: all
      remote_user: root
      tasks:
      - name: install redis
        yum: name=redis state=latest
      - name: copy config file
        copy: src=/root/playbooks/redis.conf dest=/etc/redis.conf owner=redis
        notify: restart redis
        tags: configfile
      - name: start redis
        service: name=redis state=started enabled=true
      handlers:
      - name: restart redis
        service: name=redis state=restarted
vim redis.conf
//再修改一下这个配置文件
ansible-playbook -t configfile first.yaml
//用-t选项指定标签名，表示只执行这个有标签的任务。也就是执行copy config file段，因为配置文件有了变化，所以notify会触发下面的handlers重启redis服务。如果没有notify，那么就只会执行copy项。
```

## 定义变量

> 使用现有变量

```
ansible 10.5.5.159 -m setup
//获取100主机上的变量，setup是变量。下面准备用ansible_env变量
vim second.yaml
- hosts: 10.5.5.159
  remote_user: root
  tasks:
  - name: copy file
    copy: content={{ ansible_env }} dest=/tmp/ansible.env
//调用159主机的ansible_env的值，保存在/tmp/ansible.env
ansible-playbook second.yaml
//这样ansible_env的变量内容就会写入远程主机的/tmp/ansible.env文件中了
```

> 自定义变量

```
vim fore.yaml
- hosts: all
  remote_user: root
  tasks:
  - name: install package {{ pkgname }}
    yum: name={{ pkgname }} state=latest
//yum的y要与name的n对齐，不然也会报语法错误。pkgname是自定义的变量
ansible-playbook -e pkgname=memcache for.yaml
//自定义变量，用-e调用，也就是pkgname，给它一个值，是软件包的名字，这样就能实现安装软件包了
```

> 三种定义变量的方法

```
vim /etc/ansible/hosts
    [websrvs]
    172.16.0.67 http_port=8080
    172/16.0.68 http_port=8080

    [websrvs:vars]
    http_port=8080
//这是定义组变量，因为上面的http_port的值是一样的，都是8080，所以可以定义这样的组，用中括号括起上面的组名+:vars，下面写上值，这时上面就不用再写http_port=8080了
vim vars.yaml
    - hosts: websrvs
      remote_user: root
      vars:
      - pbvar: playbook variable testing
     //在这里定义变量名是pbvar，值是playbook variable testing。这是给下面定义的pbvar变量用的
      tasks:
      - name: command line variables
        copy: content={{ cmdvar }} dest=/tmp/cmd.var
     //定义一个变量叫cmdvar，值保存在/tmp/cmd.var上
      - name: playbook variables
        copy: content={{ pbvar }} dest=/tmp/pb.var
      - name: host iventory variables
        copy: content={{ http_port }} dest=/tmp/hi.var
//通过三种方式传递变量，pbvar是在yaml文件中定义；http_port是在文件中定义，就是/etc/ansible/hosts文件；还有cmdvar是在命令行中传递
ansible-playbook -e cmdvar="command line variable testing" vars.yaml
//上面命令执行后的问题是，在目标主机上出现的cmdvar文件名只能识别到第一个单词，也就是command，不清楚空格后的内容如何能都显示
ansible websrvs -a "ls -l /tmp"
ansible websrvs -a "cat /tmp/cmd.var /tmp/hi.var /tmp/pb.var"
//有这三个文件， cmd.var中只有command
```

###　设置登录远程主机的用户名和密码

```
vim /etc/ansible/hosts
    [websrvs]
    192.168.1.100 ansible_ssh_port=22 ansible_ssh_user=ruopu ansible_ssh_pass=centos
	//将websrvs中的10.5.5.159改为上面的样子，表示连接目标主机时用的端口，用户名和密码
vim user.yaml
- hosts: all
  remote_user: root
  tasks:
  - name: add user
    user: name=ruopu system=no state=present
  - name: set password
    shell: echo centos | passwd --stdin ruopu
//在远程主机上创建用户，并添加密码
ansible-playbook user.yaml
//如果改了ansible的hosts目录，上面的剧本在10.5.5.159上是不能执行的，因为ruopu用户没有创建用户的权限。
ansible websrvs -m command -a "whoami"
//查看在远程主机下是用哪个用户登录的，一个显示ruopu，一个显示root
```



## jinja2模板语法 

### 测试1 

```
vim redis.conf.j2
    bind {{ ansible_eno16777736.ipv4.address }}
    //内嵌了一个变量，解析ansible 172.16.0.68 -m setup | less查找到的IP地址变量，用点来调用ansible查找到的名称。这里主要是两个花括号中的内容，bind是自取的名字ansible查找到的名称
vim template.yaml
    - hosts: 192.168.1.100
      remote_user: root
      tasks:
      - name: install config file
        template: src=/root/playbooks/redis.conf.j2 dest=/tmp/redis.conf
ansible-playbook template.yaml
到目标主机查看
less /tmp/redis.conf
//这时这里的bind地址变了
vim template.yaml
    - hosts: all
      remote_user: root
      tasks:
      - name: install config file
        template: src=/root/playbooks/redis.conf.j2 dest=/tmp/redis.conf
ansible-playbook template.yaml
//在所有主机上执行一次，这时在不同主机上执行的结果是不一样的，因为不同主机的IP地址是不一样的。这就是模板的功能。只有那些定义了变量的内容才会变更
```

### 测试2

```
vim /etc/ansible/hosts
	[websrvs]
    10.5.5.160 http_port=8080
    10.5.5.159 http_port=10080
vim mylisten.conf
	Listen {{ http_port }}
//文件名不用.j2结尾也可以，就是定义一个配置文件，在其中调用ansible的变量
vim httpd.yaml	
	- hosts: websrvs
      remote_user: root
      tasks:
      - name: install httpd
        yum: name=httpd state=latest
      - name: install config file
        template: src=/root/playbooks/mylisten.conf dest=/etc/httpd/conf.d/mylisten.conf
        //template模板是调用上面定义的mylisten.conf文件，并会将此文件复制到远程主机的相应目录下
      - name: start httpd
        service: name=httpd state=started
ansible-playbook --syntax-check httpd.yaml
ansible-playbook httpd.yaml
ansible websrvs -a "ss -tln"
//这时主机监听了除80的端口，一个8080，一个10080.因为在/etc/ansible/hosts文件中定义了http_port
```

### 条件判断

```
vim os.yaml
	- hosts: websrvs
	  remote_user: root
      tasks:
      - name: install httpd
        yum: name=httpd state=latest
	   //将latest改为absent就是卸载软件包
        when: ansible_os_family == "RedHat"   
        //设置只有RedHat家族才能用这个模块来安装httpd
      - name: start httpd
        service: name=httpd state=started
      - name: install httpd
        apt: name=apache2 state=latest
        when: ansible_os_family == "Debian"
ansible-playbook -C os.yaml
//显示结果中有skipping表示跳过，用蓝色表示，因为条件不满足
ansible-playbook os.yaml
```

### 迭代 

```
vim iter.yaml
    - hosts: websrvs
      remote_user: root
      tasks:
      - name: install {{ item }} package
        yum: name={{ item }} state=latest
        with_items:
        - nginx
        - tomcat
        - mariadb-server
        - redis
//用with_items指明变量，用yum中的name调用这些变量并安装。
ansible-playbook -C iter.yaml
ansible-playbook iter.yaml
ansible websrvs -a "rpm -q nginx"
//查看刚才的包是否都安装了
```

### 测试角色

> 角色创建流程
>
> 1. 定义配置文件中roles的路径
> 2.  创建角色目录 --> 创建任务（可以通过when设置条件，调用模板，设置标签）
> 3. 创建调用任务的文件
> 4. 创建配置文件模板

```
vim /etc/ansible/ansible.cfg
	roles_path = /etc/ansible/roles:/usr/share/ansible/roles
//模块要放至的路径。这里定义了两个路径，用冒号相连，用哪个都可以。
mkdir -pv /etc/ansible/roles/nginx/{tasks,vars,templates,files,handlers,meta,default}
//在配置文件中定义的roles路径下创建角色，就叫nginx。这些目录中只有tasks是必须有的。tasks定义任务，vars定义变量，templates定义模板，files定义配置文件

vim /etc/ansible/roles/nginx/tasks/main.yml
	- name: install nginx
	  yum: name=nginx state=latest
	  when: ansible_os_family == "RedHat"
//因为就是在tasks目录中，所以在配置文件中不用再写tasks了。所有的角色文件都要叫main.yml

vim nginx.yml
	- hosts: websrvs
	remote_user: root
    roles:     //调用角色，可以调用多个，这里只调用上面定义的nginx角色
    - nginx
ansible-playbook --syntax-check nginx.yml
ansible-playbook -C nginx.yml
ansible-playbook nginx.yml

vim /etc/ansible/roles/nginx/templates/vhost1.conf.j2
	server {
		listen 80;
		server_name {{ ansible_fqdn }};
		//用ansible的setup获取到的ansible_fqdn变量的名字，这个变量就是主机名。这里的fqdn解析的是目标主机的主机名，但要在目标主机的/etc/hosts中加入对自己的解析，也就是IP到本机主机名的解析。如果不加，显示会有问题，测试中，用ansible 10.5.5.159 -m setup|grep ansible_fqdn查看到的fqdn都是www.master.com，在10.5.5.159的/etc/hosts文件中加入对自己的解析后，前面的命令可以正常显示。
		location / {
		root "/ngxdata/vhost1";
		}
	}
//创建nginx的配置文件模板

vim /etc/ansible/roles/nginx/tasks/main.yml
	- name: install nginx
	  yum: name=nginx state=latest
	  when: ansible_os_family == "RedHat"
	- name: install conf
	  template: src=vhost1.conf.j2 dest=/etc/nginx/conf.d/vhost1.conf
	  //templates可以自动找到模板文件，不用写父目录，它会去templates目录查找
	  tags: conf
	  notify: restart nginx 
	  //这个名字要与handlers中的main.yml中的name定义的名字一致；这是当配置文件有变更时重启服务
	- name: install site home directory
	  file: path={{ ngxroot }} state=directory
	  //创建目录，ngxroot变量是在下面的vars子目录中创建的
	- name: install index page
	  copy: src=index.html dest={{ ngxroot }}/
	  //index.html文件是在files子目录中创建的，运行时会在目标主机自动创建。运行时ansible会自动到files子目录中查找
	- name: start nginx
	  service: name=nginx state=started
	  
vim /etc/ansible/roles/nginx/handlers/main.yml
	- name: restart nginx
	  service: name=nginx state=restarted
//handlers中是由特殊条件触发的任务，这里定义的是上面的配置文件如果有变化，会通知这里的restart nginx，在这里定义了会重启nginx服务。

vim /etc/ansible/roles/nginx/vars/main.yml
	ngxroot: /ngxdata/vhost1  
//这里不能用-线，这表示字典模式。定义一个页面的目录路径，在tasks的main.yml中的file中调用

vim /etc/ansible/roles/nginx/files/index.html
    vhosts1
ansible-playbook -C nginx.yml
ansible-playbook nginx.yml
//完成后，目标主机就会安装上nginx，在nginx的配置目录conf.d中会有一个vhost1.conf的配置文件，在其中定义了内容是vhost1，这时只要将本机的hosts文件配置可以正确解析主机名到IP就可以访问了，如curl test3，会显示vhost1。
vim /etc/hosts
	10.5.5.160 test3.ccjd.com
    10.5.5.159 test2.ccjd.com
    10.5.5.158 test1
scp /etc/hosts root@10.5.5.159:/etc  
scp /etc/hosts root@10.5.5.160:/etc
//最后修改hosts文件并复制到所有主机是必不可少的，因为如果不能解析本机的主机名，在ansible的setup模块中的ansible_fqdn就无法正解解析每台主机的主机名或fqdn。
```



### 部署测试

> 准备三台主机，主机信息如下
>
> IP : 10.5.5.158	app :  nginx、ansible		hostname : test1
>
> IP : 10.5.5.159	app :  tomcat、tomcat-admin-webapps、tomcat-webapps、tomcat-docs-webapp		hostname : test2.ccjd.com
>
> IP : 10.5.5.160	app :  tomcat、tomcat-admin-webapps、tomcat-webapps、tomcat-docs-webapp		hostname : test3.ccjd.com
>
> 效果：nginx反向代理到两台tomcat主机。还可以在tomcat上再部署httpd，nginx反代到httpd，再由httpd反代到tomcat上。

```
* test1
** 安装软件包、配置hosts文件
yum install -y epel-release
yum install -y ansible
vim /etc/hosts
    10.5.5.160 test3.ccjd.com
    10.5.5.159 test2.ccjd.com
    10.5.5.158 test1
rsync -e ssh -avzr --progress /etc/hosts root@10.5.5.159:/etc/hosts
rsync -e ssh -avzr --progress /etc/hosts root@10.5.5.160:/etc/hosts

** 生成密钥，实现无密码访问
ssh-keygen -t rsa -P ''
ssh-copy-id -i ~/.ssh/id_rsa.pub root@test1
ssh-copy-id -i ~/.ssh/id_rsa.pub root@test2.ccjd.com
ssh-copy-id -i ~/.ssh/id_rsa.pub root@test3.ccjd.com

** 配置ansible地址
vim /etc/ansible.conf
[websrvs]
    10.5.5.160
    10.5.5.159
    test[2:3].ccjd.com
//写成IP或主机名均可，但最好只写一个。这里以主机名为例。
[localhost]
	10.5.5.158
	test1
ansible all --list-hosts
ansible test1 -a "hostname"
ansible test2.ccjd.com -a "hostname"
ansible test3.ccjd.com -a "hostname"
ansible localhost --list-hosts
ansible websrvs --list-hosts
mkdir -pv /etc/ansible/roles/{nginx,tomcat,jdk}/{files,templates,tasks,handlers,vars,meta,default}
** 设置ansible剧本
cd /etc/ansible/roles/nginx
vim tasks/main.yml
	- name: install nginx
      yum: name=nginx state=latest
      when: ansible_os_family == "RedHat"
      //当系统是RedHat系列时，安装nginx
    - name: install conf
      copy: src=lb.conf dest=/etc/nginx/conf.d/
      //复制配置文件到目标路径
    - name: start nginx
      service: name=nginx state=started enabled=yes
      //启动nginx，并设置开机启动
vim handlers/main.yml
	- name: restart nginx
	  service: name=nginx state=restarted
	  //当有变更时，可调用此模块重启nginx服务
vim files/lb.conf	//设置配置文件，以便在tasks中调用
	upstream tcsrvs {
       server test2.ccjd.com:8080;
       server test3.ccjd.com:8080;
    }
    //配置tomcat的两个地址和端口，之后会反代到这两个地址。
    server {
       listen 80;
       server_name www.ruopu.com;
       location / {
            proxy_pass http://tcsrvs;
       }
    }
cd /etc/ansible/roles/tomcat
vim tasks/main.yml
    - name: install package
      yum: name={{ item }} state=latest
      //这里调用item函数，在下面设置item的内容
      with_items:
      - tomcat
      - tomcat-admin-webapps
      - tomcat-webapps
      - tomcat-docs-webapp
      when: ansible_os_family == "RedHat"
    - name: start tomcat
      service: name=tomcat state=started enabled=yes
cd /etc/ansible/roles/jdk
vim tasks/main.yml
	- name: install openjdk
	  yum: name=java-{{ version }}-openjdk-devel state=latest
	  //这里的version函数的内容可以在nginx.yml中定义，也可以在vars模块中定义。
    - name: install env file
      copy: src=java.sh dest=/etc/profile.d/
vim files/java.sh
    export JAVA_HOME=/usr
vim vars/main.yml
    version: 1.8.0  //字典。这是在vars中定义version
vim nginx.yml
	- hosts: localhost
      remote_user: root
      roles:
      - nginx
    - hosts: websrvs
      remote_user: root
      roles:
      - jdk
      //如果在这个文件中定义version函数，上面要写成"- { role: jdk, version: 1.8.0 }"
      - tomcat
ansible-playbook -C /etc/ansible/roles/nginx/nginx.yml
ansible-playbook /etc/ansible/roles/nginx/nginx.yml
访问www.ruopu.com，这时显示的是tomcat页面。访问时出现问题，提示502 Bad Gateway，这是nginx反代服务器上的selinux没有关闭的问题
在node2和3节点上查看是否安装的是1.8.0版本的java
rpm -qa | grep "^java"或java -version
```



### zk+kafka部署

> 准备三台主机，主机信息如下
>
> IP : 10.5.5.158	app : zookeeper-3.4.9、kafka_2.12-0.10.2.0		hostname : kafka1
>
> IP : 10.5.5.159	app : zookeeper-3.4.9、kafka_2.12-0.10.2.0		hostname : kafka2
>
> IP : 10.5.5.160	app : zookeeper-3.4.9、kafka_2.12-0.10.2.0		hostname : kafka3
>
> 在158主机上安装ansible，实现zk+kafka集群

```
** kafka1
hostnamectl set-hostname kafka1
yum install -y ansible
vim /etc/hosts
	10.5.5.158 kafka1
    10.5.5.159 kafka2
    10.5.5.160 kafka3
rsync -e ssh -arvz --progress /etc/hosts root@kafka2:/etc/hosts
rsync -e ssh -arvz --progress /etc/hosts root@kafka3:/etc/hosts
//使用rsync的条件是两端都要安装此包，不然是不能使用的。
ssh-keygen -t rsa -P ''
ssh-copy-id -i ~/.ssh/id_rsa.pub root@kafka1
ssh-copy-id -i ~/.ssh/id_rsa.pub root@kafka2
ssh-copy-id -i ~/.ssh/id_rsa.pub root@kafka3
vim /etc/ansible/hosts
	[kafka]
	kafka[1:3]
mkdir -pv /etc/ansible/roles/{kafka,zk,jdk}/{files,templates,handlers,defaults,vars,tasks,meta}
cd /etc/ansible/roles/jdk
vim tasks/main.yml
	- name: install openjdk
      yum: name=java-{{ version }}-openjdk-devel state=latest
    - name: install env file
      copy: src=java.sh dest=/etc/profile.d/
vim files/java.sh
	export JAVA_HOME=/usr
vim vars/main.yml
	version: 1.8.0
cd /etc/ansible/roles/zk
vim tasks/main.yml
	- name: install zookeeper
      shell: tar xf /root/zookeeper-3.4.9.tar.gz -C /usr/local/ && ln -sv /usr/local/zookeeper-3.4.9 /usr/local/zookeeper
    - name: Establish directory
      shell: mkdir -pv /usr/local/zookeeper/{data,logs}
    - name: install myid
      template: src=myid.conf.j2 dest=/usr/local/zookeeper/data/myid
    - name: install conf
      copy: src=zoo.cfg dest=/usr/local/zookeeper/conf/
      tags: zkconf
      notify: restart zookeeper
    - name: start zookeeper
      shell: /usr/local/zookeeper/bin/zkServer.sh start
vim handlers/main.yml
    - name: restart zookeeper
      shell: /usr/local/zookeeper/bin/zkServer.sh restart
vim files/zoo.cfg
	tickTime=2000
    initLimit=10
    syncLimit=5
    dataDir=/usr/local/zookeeper/data
    dataLogDir=/usr/local/zookeeper/logs
    clientPort=2181
    server.1=10.5.5.158:2888:3888
    server.2=10.5.5.159:2888:3888
    server.3=10.5.5.160:2888:3888
vim templates/myid.conf.j2
	{{ ansible_fqdn }}
cd /etc/ansible/roles/kafka
vim tasks/main.yml
	- name: install kafka
      shell: tar -zxf /root/kafka_2.12-0.10.2.0.tgz -C /usr/local && ln -sv /usr/local/kafka_2.12-0.10.2.0 /usr/local/kafka
    - name: install conf
      template: src=server.properties dest=/usr/local/kafka/config/server.properties
      tags: kaconf
      notify: restart kafka
    - name: start kafka
      shell: nohup /usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties &
      //必须让kafka在后台运行，不然在执行剧本时会卡在最后的任务不能正确退出。
vim handlers/main.yml
	- name: restart kafka
	  shell: /usr/local/kafka/bin/kafka-server-stop.sh && nohup /usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties &
vim templates/server.properties
	broker.id={{ ansible_fqdn }}
    delete.topic.enable=true
    host.name={{ ansible_default_ipv4[ "address"] }}
    //后面是一个引用setup模块输出的子模块的方法，前面要用主模块的名，后面跟[]，在中括号中写上子模块的名字并用引号括起即可。
    num.network.threads=3
    num.io.threads=8
    socket.send.buffer.bytes=102400
    socket.receive.buffer.bytes=102400
    socket.request.max.bytes=104857600
    log.dirs=/usr/local/kafka/logs
    num.partitions=1
    num.recovery.threads.per.data.dir=1
    log.retention.hours=168
    log.segment.bytes=1073741824
    log.retention.check.interval.ms=300000
    zookeeper.connect=10.5.5.158:2181,10.5.5.159:2181,10.5.5.160:2181
    zookeeper.connection.timeout.ms=6000
vim vim zk.yml
	- hosts: kafka
	  remote_user: root
	  roles:
      - jdk
      - zk
      - kafka
*** 在执行剧本前，先将kafka_2.12-0.10.2.0.tgz和zookeeper-3.4.9.tar.gz两个包复制到三台主机的root目录。另外，将三台主机的主机名分别改为1、2、3，这是为了在kafka的配置文件server.properties中引用fqdn参数时方便设置broker.id，没有想到其他办法将一个模板配置文件复制到不同主机时可以使用不同的id号，所以使用了此种方法。
ansible-playbook /etc/ansible/roles/kafka/zk.yml
```

# 测试

## 普通用户管理ansible

```
useradd ccjd
echo 'centos'|passwd --stdin ccjd
vim /etc/sudoers
	ccjd    ALL=(ALL)       NOPASSWD:ALL
//每台远程主机都要修改此文件，因为在远程主机上要使用普通用户执行命令并无需输入密码。或可以使用命令完成：“sed -i '$a\ccjd ALL=(ALL) NOPASSWD: ALL' /etc/sudoers”
su - ccjd
ssh-keygen -t rsa -P ''
//以普通用户身份生成私钥
ssh-copy-id -i ~/.ssh/id_rsa.pub 172.17.172.13
//这要求远程主机上也有ccjd用户。只有这样，才能让自己以ccjd的身份在远程执行sudo命令。
vim /etc/ansible/ansible.cfg
	private_key_file = /home/ccjd/.ssh/id_rsa
	# remote_user = root
	//remote一行默认就是注释的
chown -R ccjd.ccjd /etc/ansible
chown -R ccjd.ccjd /usr/share/ansible
//第二个文件可能没有
ansible 172.17.172.13 -m shell -a "sudo yum install -y java-1.8.0-openjdk-devel"
//执行远程命令时还要加上sudo命令，不然会报错的。
```




# 问题

1. 执行中有主机提示“"msg": "Aborting, target uses selinux but python bindings (libselinux-python) aren't installed!"”。

解决：给主机安装libselinux-python包，如还不能解决，就彻底关闭selinux并重启。

