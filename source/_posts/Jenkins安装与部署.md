---
title: Jenkins安装与部署
date: 2018-10-22 10:18:30
tags: Jenkins
categories: 持续集成与部署
---

## Jenkins简单部署
### rpm包安装启动

```shell
============================================================================================
环境
准备两台主机
node1：地址：192.168.1.63
node2：地址：192.168.1.64
============================================================================================
------------
  jenkins
------------  
[root@jenkins ~]# yum install -y java-1.8.0-openjdk-devel
[root@jenkins ~]# yum install -y jenkins-2.60.3-1.1.noarch.rpm
[root@jenkins ~]# systemctl start jenkins
[root@jenkins ~]# ss -tln
State       Recv-Q Send-Q            Local Address:Port                           Peer Address:Port              
LISTEN      0      128                           *:111                                       *:*                  
LISTEN      0      128                           *:22                                        *:*                  
LISTEN      0      100                   127.0.0.1:25                                        *:*                  
LISTEN      0      128                          :::111                                      :::*                  
LISTEN      0      50                           :::8080
# 可以看到监控了8080端口
[root@jenkins ~]# vim /etc/sysconfig/jenkins
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m"
# 调整jenkins的使用内存，默认此项是-Djava.awt.headless=true
# -Xms：初始堆内存Heap大小，使用的最小内存，cpu性能高时此值应设的大一些
# -Xmx：初始堆内存heap最大值，使用的最大内存
# -XX:MaxPermSize:设定最大内存的永久保存区域
# -Xms与-Xmx设置相同的值，需要根据实际情况设置，增大内存可以提高读写性能
访问http://192.168.1.63:8080
```



### tomcat启动

```shell
------------
  jenkins
------------  
[root@jenkins ~]# yum install -y tomcat
[root@jenkins ~]# cp /usr/lib/jenkins/jenkins.war /usr/share/tomcat/webapps/
# 将上面安装的jenkins的war包复制到tomcat的部署目录下，也可以直接下载jenkins的war包
[root@jenkins ~]# vim /etc/sysconfig/tomcat
JAVA_OPTS="-Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m"
# 调整tomcat使用jvm内存
[root@jenkins ~]# systemctl start tomcat
[root@jenkins ~]# ps aux|grep tomcat
tomcat     2242 17.4 40.8 3718460 763224 ?      Ssl  19:27   0:21 /usr/lib/jvm/jre/bin/java -Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m -classpath /usr/share/tomcat/bin/bootstrap.jar:/usr/share/tomcat/bin/tomcat-juli.jar:/usr/share/java/commons-daemon.jar -Dcatalina.base=/usr/share/tomcat -Dcatalina.home=/usr/share/tomcat -Djava.endorsed.dirs= -Djava.io.tmpdir=/var/cache/tomcat/temp -Djava.util.logging.config.file=/usr/share/tomcat/conf/logging.properties -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager org.apache.catalina.startup.Bootstrap start

访问http://192.168.1.63:8080/jenkins
[root@jenkins ~]# cat /usr/share/tomcat/.jenkins/secrets/initialAdminPassword 
cdc0bfcfa03e4d2da4f7232b213c50c1
#  查看登录jenkins的默认密码
```



### 安装maven

```shell
------------
  maven
------------
[root@maven ~]# yum install -y java-1.8.0-openjdk-devel  tomcat tomcat-admin-webapps
# 在当前主机上安装一个tomcat，稍后测试maven构建的包是否可以正常运行
[root@maven ~]# yum install -y maven git
[root@maven ~]# git clone https://github.com/mageedu/spring-boot-web-jsp.git
# 克隆一个java代码测试。
# 对maven来说最重要的是pom.xml文件，它描述了这个代码是如何构建的
[root@maven ~]# cd spring-boot-web-jsp/
[root@maven ~]# vim /etc/maven/settings.xml
<mirrors>
<mirror>
       <id>nexus-osc</id>
       <mirrorOf>*</mirrorOf>
       <name>Nexus osc</name>
       <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    </mirror>
# mirrors段添加国内源地址。
<profile>
    <id>jdk-1.4</id>
    <activation>
    <jdk>1.4</jdk>
    </activation>
    <repositories>
        <repository>
            <id>nexus</id>
            <name>local private nexus</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <id>nexus</id>
            <name>local private nexus</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>
</profile>
# Maven 还需要安装一些插件包，这些插件包的下载地址也让其指向 oschina.net 的 Maven 地址。在<profiles>中插入
# 一定要修改为国内源，不然构建速度将非常慢。尤其是在jenkins中
[root@maven spring-boot-web-jsp]# mvn package
# 开始构建。
[root@maven ~]# vim /etc/tomcat/tomcat-users.xml
<role rolename="manager-gui"/> 
<role rolename="manager-script"/>
<user name="tomcat" password="tomcat" roles="manager-gui,manager-script" />
[root@maven ~]# vim /etc/sysconfig/tomcat
JAVA_OPTS="-Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m"
[root@maven ~]# systemctl start tomcat
[root@maven spring-boot-web-jsp]# ls target/
classes            maven-archiver  spring-boot-web-jsp-1.0      spring-boot-web-jsp-1.0.war.original
generated-sources  maven-status    spring-boot-web-jsp-1.0.war
# 可以看到构建后有了war包
[root@maven spring-boot-web-jsp]# cp target/spring-boot-web-jsp-1.0.war /usr/share/tomcat/webapps/
访问http://192.168.1.64:8080/spring-boot-web-jsp-1.0/，可以看到部署的结果了
```



### 测试jenkins

```shell
------------
  jenkins
------------  
[root@jenkins ~]# scp jenkins.war 192.168.1.64:/usr/share/tomcat/webapps/
# jenkins.war包的属主属组应该是tomcat，权限是644

------------
  maven
------------
[root@maven webapps]# cat /usr/share/tomcat/.jenkins/secrets/initialAdminPassword 
083cbf58aefd411b89558aea505f3e94
[root@maven webapps]# vim /etc/tomcat/server.xml
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" URIEncoding="UTF-8"/>
#  让tomcat可以使用UTF-8编码。这是为了让jenkins不再报需要使用UTF-8编码的错误
[root@maven webapps]# systemctl restart tomcat
访问http://192.168.1.64:8080/jenkins/  -->  输入密码  -->  选择默认插件  -->  创建新用户  --> 在系统管理中配置jenkins的环境  -->  到系统管理中的global tool configuration中配置JDK的别名和路径，取消自动安装，路径写/usr即可  -->  git工具被默认配置了，因为git包已经安装了。Gradle是java的新的构建工具  -->  配置Mave，使用mvn -v查看版本，将版本号输入到Name中，如maven-3.0.5，路径写/usr

新建一个任务，叫spring-boot-web-jsp。一般构建选择两种，一是自由风格，一是pipeline（流水线），这里选自由风格。选择github project，输入https://github.com/mageedu/spring-boot-web-jsp.git，这是给定一个代码路径，点击高级可显示Display name输入spring-boot-web，这是自定义的。源码管理中的Git是指如果要推送到远程服务器上，在这里要输入地址，用户名和密码或密钥，在这里还是输入https://github.com/mageedu/spring-boot-web-jsp.git，源码管理不做配置也可以，但测试中发现一定要配置源码管理的地址，不然会提示找不到pom.xml文件。构建触发器是指如果代码更新了要怎么办或什么条件下进行构建。第一可以自定义脚本来触发，build after other projects are built指在其他项目构建完触发，build pericxfically是周期性构建，每隔一段时间就看一下源代码是否有变化，有变化就构建，GitHub hook trigger for GITScrn polling是如果GitHub上注册的hook有变化，就会发送通知，下载代码构建，Poll SCM是不断向github轮询，有符合条件的就构建，这里可以在日程表中写入H/5 * * * *，表示每5分钟轮询一次。在构建中可以选择Invoke top-level Maven targets，表示一个顶级的maven构建，在Maven Version中选择安装的maven版本，Goals中输入构建的路径，这种方式易出错。选择Execute shell表示脚本构建，在Command中写入/usr/bin/mvn package即可，它会自动切换到构建目录下构建。构建后操作就是要发布了。视频中这里没有选择。直接点击项目中的立即构建了，在构建中可以选择console一项，可以打开一个窗口查看构建的过程。

[root@maven webapps]# cd /usr/share/tomcat/.jenkins/
# 构建完成后进入此目录
[root@maven .jenkins]# ls workspace/spring-boot-web-jsp/
# 在workspace目录中有构建完的程序

------------
  jenkins
------------ 
[root@jenkins ~]# rm -rf /usr/share/tomcat/webapps/jenkins*
[root@jenkins ~]# cd /etc/tomcat/
[root@jenkins tomcat]# vim tomcat-users.xml
<role rolename="manager-script"/> 
<user name="admin" password="admin" roles="manager-script" />
#  我们要将maven上构建的结果在 jenkins上的tomcat上运行，所以需要这里打开manager-script功能。
[root@jenkins tomcat]# systemctl restart tomcat
[root@jenkins tomcat]# ss -tln

------------
  maven
------------
选择系统管理中的管理插件，在可选插件中选择安装Deploy to container，选择安装完成后重启Jenkins。进入spring-boot-web-jsp项目中，点击配置，选择构建后操作中的Deploy war/ear to a container，这是刚安装的插件，WAR/EAR files输入**target/*.war，（**表示任意个路径下的target目录中的.war文件。也可以写为**/*.war或*.war）。Context path可以不改，使用默认，这里使用/test-spring（这是部署到node1的tomcat上的目录的名称）。Containers选择Tomcat7.*，用户名和密码就是上面配置的manager-script的用户名和密码，输入两次tomcat。Tomcat URL输入http://IP:8080/，这是tomcat的访问路径。如果要构建多个tomcat，可以再添加Add Container就可以了。最后保存。
点击项目中的立即构建。构建中出了问题，一直提示没有权限部署。因为node1上没有安装tomcat-admin-webapps

------------
  jenkins
------------ 
[root@jenkins tomcat]# yum install -y tomcat-admin-webapps
[root@jenkins tomcat]# ls webapps/
host-manager  manager  test-spring  test-spring.war
# 在此目录下有刚部署的test-spring.war文件

访问http://192.168.1.63:8080/test-spring/

------------
  maven
------------
[root@maven .jenkins]# rm -rf workspace/spring-boot-web-jsp/
# 删除代码，测试重新构建
[root@maven .jenkins]# cd
[root@maven ~]# ls
anaconda-ks.cfg  netty-new.jar  spring-boot-web-jsp
[root@maven ~]# vim spring-boot-web-jsp/src/main/resources/application.properties
spring.mvc.view.prefix: /WEB-INF/jsp/
spring.mvc.view.suffix: .jsp

welcome.message: Hi Jenkins, Test.com, iunx.io.
# 修改这个文件中的显示内容，再保存，这里修改了Test.com, iunx.io.
[root@maven ~]# vim spring-boot-web-jsp/src/main/resources/static/css/main.css
h1{
        color:#FFFF00;
}

h2{
        color:#0000FF;
}
# 修改颜色
cd spring-boot-web-jsp
git add .
git commit -m "version 4.2.0"
git push 
点击自动构建
如果是灰度发布，可以使用脚本，脚本可实现将指定文件发送到服务器并部署
回滚到之前的版本，可以在构建时指定构建的版本就可以了，使用git克隆时就克隆指定的版本就可以了。
在ganneral最上方的一栏中可以选择参数化构建过程。
参考：blog.ramanshalupau.com/parameterized-jenkins-build-for-rollback-purposes，实现滚动发布与回滚
```





## Jenkins&Gitlab

### Jenkins依赖环境准备

```shell
* 安装java环境
[root@jenkins ~]# ll
total 83356
-rw-------. 1 root root     1292 Oct 24 05:42 anaconda-ks.cfg
-rwxr-xr-x  1 root root  9621331 Feb  1 12:51 apache-tomcat-8.5.33.tar.gz
-rwxr-xr-x  1 root root 75728164 Feb  1 12:51 jenkins.war
[root@jenkins ~]# yum install -y java-1.8.0-openjdk-devel
[root@jenkins ~]# vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
[root@jenkins ~]# . /etc/profile.d/java.sh
[root@jenkins ~]# java -version
openjdk version "1.8.0_181"
OpenJDK Runtime Environment (build 1.8.0_181-b13)
OpenJDK 64-Bit Server VM (build 25.181-b13, mixed mode)

* tomcat环境
[root@jenkins ~]# tar xf apache-tomcat-8.5.33.tar.gz -C /usr/local/
[root@jenkins ~]# cd /usr/local/
[root@jenkins local]# ln -sv apache-tomcat-8.5.33/ tomcat
'tomcat' -> 'apache-tomcat-8.5.33/'
[root@jenkins local]# cp /root/jenkins.war tomcat/webapps/
# 上传Jenkins.war文件到tomcat服务器，放入webapps目录中
[root@jenkins tomcat]# vim /usr/local/tomcat/conf/tomcat-users.xml
      <role rolename="manager-gui"/>
      <role rolename="manager-script"/>
      <role rolename="manager-jmx"/>
      <role rolename="manager-status"/>
      <user username="tomcat_user" password="tomcat" roles="manager-gui,manager-script,manager-jmx,manager-status"/>
[root@jenkins tomcat]# vim /usr/local/tomcat/conf/server.xml
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" URIEncoding="UTF-8" />
# 加入URIEncoding="UTF-8"地址的编码解码字符集
[root@jenkins local]# vim /usr/local/tomcat/bin/catalina.sh
    JAVA_OPTS="-Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m"
# 调整tomcat使用jvm内存
[root@jenkins tomcat]# /usr/local/tomcat/bin/startup.sh
[root@jenkins tomcat]# tail -f /usr/local/tomcat/logs/catalina.out
# 查看启动过程
[root@jenkins local]# ps aux|grep tomcat
root       3101 33.7 38.4 3704844 717556 pts/0  Sl   13:02   0:17 /usr/bin/java -Djava.util.logging.config.file=/usr/local/tomcat/conf/logging.properties -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager -Djava.awt.headless=true -Xms1024m -Xmx1024m -XX:MaxNewSize=512m -XX:MaxPermSize=512m -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -classpath /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar -Dcatalina.base=/usr/local/tomcat -Dcatalina.home=/usr/local/tomcat -Djava.io.tmpdir=/usr/local/tomcat/temp org.apache.catalina.startup.Bootstrap start
[root@jenkins tomcat]# cat /root/.jenkins/secrets/initialAdminPassword 
2296380bbe5e4753bc970240aca8ae2d
# 这是打开jenkins页面时要输入的密码，这也是Jenkins的admin管理员的登录密码

* 安装git
[root@jenkins ~]# yum install -y git
```

* 下面访问10.5.5.250:8080/jenkins

![](/images/jenkins/jenkins1.jpg)

* 选择安装推荐的插件。如果有软件安装失败，可在安装完后点Retry，再次安装。安装成功进入jenkins后，还要重启一次jenkins服务才能正常访问

![](/images/jenkins/jenkins2.jpg)

![](/images/jenkins/jenkins3.jpg)

* 创建用户，或使用admin用户登录

![](/images/jenkins/jenkins4.jpg)

* 确认

![](/images/jenkins/jenkins5.jpg)

![](/images/jenkins/jenkins6.jpg)

* 完成上述步骤后可以正常登录，但测试发现chrome浏览器访问时显示空白页面，使用firefox浏览器没有问题

![](/images/jenkins/jenkins7.jpg)

* 更换火狐浏览器后可以到登录页面，但输入用户名和密码后还是空白页面。解决方法如下：

![](/images/jenkins/jenkins8.jpg)

```shell
[root@jenkins tomcat]# tail -f /var/log/messages 
Oct 21 22:30:35 jenkins systemd: Stopped IPv4 firewall with iptables.
Oct 21 22:30:35 jenkins systemd: Unit iptables.service entered failed state.
Oct 21 22:30:35 jenkins systemd: iptables.service failed.
Oct 21 22:43:01 jenkins systemd: Started Session 4057 of user root.
Oct 21 22:43:01 jenkins systemd: Starting Session 4057 of user root.
Oct 21 22:57:11 jenkins systemd: Stopping The Apache HTTP Server...
Oct 21 22:57:13 jenkins systemd: Stopped The Apache HTTP Server.
Oct 21 22:57:18 jenkins systemd: Reloading.
Oct 21 22:57:18 jenkins systemd: [/usr/lib/systemd/system/vzfifo.service:19] Support for option SysVStartPriority= has been removed and it is ignored
Oct 21 23:15:06 jenkins systemd: Configuration file /usr/lib/systemd/system/ebtables.service is marked executable. Please remove executable permission bits. Proceeding anyway.
# 查看系统日志发现，要求取消/usr/lib/systemd/system/ebtables.service的可执行权限。
[root@jenkins tomcat]# chmod 744 /usr/lib/systemd/system/ebtables.service
# 取消属组和其他人的执行权限
[root@jenkins tomcat]# lsof -i:8080
[root@jenkins tomcat]# kill -9 1181
[root@jenkins tomcat]# /usr/local/tomcat/bin/startup.sh
# 关闭tomcat并重新启动
```

* 可以正常访问了，使用chrome浏览器也没有问题了。但因为chrome浏览器的语言的繁体中文，所以Jenkins登录后也是繁体中文

![](/images/jenkins/jenkins9.jpg)

![](/images/jenkins/jenkins10.jpg)



### 配置JDK和Maven并安装Deploy插件

* 登录Jenkins

![](/images/jenkins/jenkins配置1.jpg)

* 选择全局安全配置

![](/images/jenkins/jenkins配置2.jpg)

* 选择允许用户注册。授权策略可以先任何用户可以做任何事，方便测试使用。也可以是默认的登录用户可以做任何事。最后保存

![](/images/jenkins/jenkins配置3.jpg)

* 选全局工具配置

![](/images/jenkins/jenkins配置4.jpg)

* 上面两项都选择文件系统中的settings文件，之后需要输入maven的settings文件路径。JDK也一样要输入JAVA_HOME的路径，同时自定义一个别名。取消自动安装。下面的Git因为还没有，所以可以删除。Maven同JDK，需要自定义名称并输入MAVEN_HOME

![](/images/jenkins/jenkins配置5.jpg)

![](/images/jenkins/jenkins配置6.jpg)

* Maven的安装

```shell
到http://mirrors.shu.edu.cn/apache//maven/maven-3/3.5.4/binaries/下载Maven的二进制包，保存到/root目录下
[root@jenkins ~]# tar xf apache-maven-3.5.4-bin.tar.gz -C /usr/local/
[root@jenkins ~]# vim /etc/profile.d/maven.sh
	export PATH=$PATH:/usr/local/apache-maven-3.5.4/bin
	export MAVEN_HOME=/usr/local/apache-maven-3.5.4
[root@jenkins ~]# . /etc/profile.d/maven.sh
[root@jenkins ~]# mvn -version
Apache Maven 3.5.4 (1edded0938998edf8bf061f1ceb3cfdeccf443fe; 2018-06-17T18:33:14Z)
Maven home: /usr/local/apache-maven-3.5.4
Java version: 1.8.0_181, vendor: Oracle Corporation, runtime: /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.181-3.b13.el7_5.x86_64/jre
Default locale: en_US, platform encoding: ANSI_X3.4-1968
OS name: "linux", version: "4.15.17-1-pve", arch: "amd64", family: "unix"
[root@jenkins local]# vim /usr/local/apache-maven-3.5.4/conf/settings.xml
<mirrors>
<mirror>
       <id>nexus-osc</id>
       <mirrorOf>*</mirrorOf>
       <name>Nexus osc</name>
       <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    </mirror>
# mirrors段添加国内源地址。
<profile>
    <id>jdk-1.4</id>
    <activation>
    <jdk>1.4</jdk>
    </activation>
    <repositories>
        <repository>
            <id>nexus</id>
            <name>local private nexus</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <id>nexus</id>
            <name>local private nexus</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>
</profile>
# Maven 还需要安装一些插件包，这些插件包的下载地址也让其指向 oschina.net 的 Maven 地址。在<profiles>中插入
# 一定要修改为国内源，不然构建速度将非常慢。尤其是在jenkins中
```

* 选择插件管理

![](/images/jenkins/jenkins配置7.jpg)

* 安装插件deploy to container，这个插件是让jenkins成功构建后可以部署war包到tomcat的

![](/images/jenkins/jenkins配置8.jpg)

![](/images/jenkins/jenkins配置9.jpg)

### gitlab安装

```shell
下载gitlab-ce-10.6.1-ce.0.el7.x86_64.rpm到/root目录
[root@localhost ~]# yum install -y gitlab-ce-10.6.1-ce.0.el7.x86_64.rpm
[root@localhost ~]# vim /etc/gitlab/gitlab.rb
	external_url 'http://10.5.5.199'
# 设置服务地址
[root@localhost ~]# gitlab-ctl reconfigure
# 这是一个初始化的过程
访问IP，要求设置root密码，需要是一个复杂的密码，之后就可以正常登录了
# 如果访问出现502错误，可以查看是否之前安装并启动过web服务或tomcat服务，卸载服务并重启gitlab后就可以正常访问了。
# [root@gitlab ~]# gitlab-ctl restart		# 重启gitlab命令
# 另外也可以查看一下内存是否不足
```

### 获取gitlab的token

* 使用root用户登录

![](/images/jenkins/gitlabgetToken1.jpg)

* 选择左下角的settings，并勾选最下方的“Allow requests to the local network from hooks and services”并保存。此项非常关键，如果不勾选此项，之后测试连接jenkins时会报500错误

![](/images/jenkins/gitlabgetToken2.jpg)

* 登出root用户，重新注册一个新用户

![](/images/jenkins/gitlabgetToken3.jpg)

* 选择用户的settings，并选择左侧的"Access Tokens"

![](/images/jenkins/gitlabgetToken4.jpg)

* 创建Token

![](/images/jenkins/gitlabgetToken5.jpg)

* 得到一个Token，这个很重要，需要记录，如果关闭此页面，之后就找不到这个Token了

![](/images/jenkins/gitlabgetToken6.jpg)

### 创建一个git项目

* 使用普通用户登录，到首页创建项目

![](/images/jenkins/gitlab项目1.jpg)

![](/images/jenkins/gitlab项目2.jpg)

* 这两条命令在设置jenkins时有用

![](/images/jenkins/gitlab项目3.jpg)

### 生成访问Gitlab的ssh秘钥。

>  **从gitlab以SSH方式拉取或提交代码需要用到这个SSH 秘钥**，哪台机器需要从gitlab上拉取代码，就在哪台机器上生成一次SSH Key，因此，在jenkins服务器上，以及你的开发PC上，都需要生成SSH密钥。

![](/images/jenkins/gitlabssh1.jpg)

* 在jenkins与要部署代码的服务器上执行生成秘钥的命令

```shell
[root@jenkins conf]# ssh-keygen -t rsa -P ''
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Created directory '/root/.ssh'.
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
69:1e:73:2b:de:c8:e8:23:79:9a:0a:96:6f:e8:8a:b8 root@jenkins
The key's randomart image is:
+--[ RSA 2048]----+
|                 |
|                 |
|                 |
|         .       |
|        S .      |
|  .    o + .     |
|.o.  .  o .      |
|+o..o.o+ +       |
|Eoooo=o.+ .      |
+-----------------+
[root@jenkins conf]# cat /root/.ssh/id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDZS8mV9dyi2kOCnhe3o5V/bc8EEln6cVpNXQ16P4lKvAYSdcmrRTYdWapsssJAzjWnA5Pa/u32n/OWKTZDq+qmV3IxlQwuOVI7AeB5TJTuawk90f/1fj7aN1963yOvlZthS8dRUvEcrq+HHpekmAH+mLDeQGYcZEoNsovl1Cvp3TVNDC/7sKds7yoYmHupknyn5d7tgGID8Up02DJlgUQK6V7ZvivjRxAaYAjsWSEktIZK0jv0uWqo6cSddC/rLERGL4spjdwqErFKDQ8SVhArD5zR7L5Lpf9McbxFLFpMMN0I2U+udCXa8n7vwbzHTyaFU+ZvUkX80ykDpMJIW5ot root@jenkins
# 将此公钥放入gitlab中
```

![](/images/jenkins/gitlabssh2.jpg)

![](/images/jenkins/gitlabssh3.jpg)

### jenkins中安装gitlab插件

> 需要的插件：
>
> * GitLab Hook：使 gitlab web 挂钩能够用于触发 gitlab 项目上的 smc 轮询
> * GitLab：这个插件允许 gitlab 触发 jenkins 构建, 并在 gitlab ui 中显示它们的结果。
> * Gitlab Authentication：这是使用 gitlab oauth 的身份验证插件。
> * Git Parameter：增加了从项目中配置的 git 存储库中选择分支、标记或修订的功能。
> * Build Authorization Token Root：即使匿名用户看不到 jenkins, 也可以访问生成和相关的 rest 生成触发器
> * Publish Over SSH：通过 ssh 发送生成项目

![](/images/jenkins/gitlabPlugin1.jpg)

![](/images/jenkins/gitlabPlugin2.jpg)

![](/images/jenkins/gitlabPlugin3.jpg)

### jenkins中设置token

> jenkins可以通过从gitlab上得到的token，与gitlab协同工作

![](/images/jenkins/jenkinsgitlabtoken1.jpg)

![](/images/jenkins/jenkinsgitlabtoken2.jpg)

* Connection name可以自定义；Gitlab host URL是gitlab的访问地址；最后设置Credentials

  ![](/images/jenkins/jenkinsgitlabtoken3.jpg)

* 在弹出的窗口中选择类型为GitLab API token，之后输入在gitlab中取得的项目的token，最后添加

![](/images/jenkins/jenkinsgitlabtoken4.jpg)

* 选择刚创建的"GitLab API token"，然后点击"Test Connection"测试是否连接正常，如果没有问题就保存。这里的配置会在创建任务后的第一个General页面的"GitLab Connection"中自动引用

![](/images/jenkins/jenkinsgitlabtoken5.jpg)

### jenkins中设置Publish over SSH

* 进入设置

![](/images/jenkins/jenkinsSSH1.jpg)

* 输入jenkins服务器的私钥，也就是用户家目录中.ssh中的id_rsa文件的内容（这是为了可以通过jenkins的公钥与私钥进行配对，使jenkins可以在远程主机上操作，当然也需要jenkins将公钥传到远程主机），SSH Servers中设置自定义Name，Hostname是要部署代码的服务器地址，Username是登录用的用户名，Remote Directory这里设置为了/usr/share/nginx/html，之后jenkins就可以向这个目录部署网页文件了

![](/images/jenkins/jenkinsSSH2.jpg)

### 配置git插件

* 打开系统管理中的系统设置

![](/images/jenkins/git插件1.jpg)

* 选择Git plugin

![](/images/jenkins/git插件2.jpg)

* 设置Git插件的全局配置，然后点击“apply”——“save”。全局配置就是上面“Gitlab创建项目”部分中的global setting ，也就是git的用户名和邮箱地址。在项目第一次commit前，这些信息都可以在GitLab的项目的首页里找到

![](/images/jenkins/git插件3.jpg)

### 创建一个Jenkins Job

> 在jenkins里，一个任务叫做一个job。一般我们的项目会有多个分支，比如开发分支和产品分支，我们可以对每一个分支都新建一个job，比如，我们对开发分支创建一个测试的job，每次有代码提交就自动运行一次测试，对产品分支创建一个打包的job，每次有代码提交就运行打包任务。
>
> 在系统设置中设置的项就是为了可以在任务中得到引用。

![](/images/jenkins/创建jenkinsjob1.jpg)

* 创建的job最好与gitlab中的项目名一致

![](/images/jenkins/创建jenkinsjob2.jpg)

### 配置Job

* 在源码管理里，选择Git，并输入路径，路径可以在gitlab的项目首页上看到

![](/images/jenkins/配置job1.jpg)

* 添加用户，类型选“SSH Username with private key”；Username填root；选择PrivateKey中的Enter directly，在下面的key中输入jenkins服务器的私钥，可以用命令`cat /root/.ssh/id_rsa `查看。也里是指使用jenkins服务器上root用户的私钥访问gitlab上的项目，与gitlab上的jenkins服务器的root用户的公钥进行验证。

![](/images/jenkins/配置job2.jpg)

> 在Repository URL下面的红字提示“Failed to connect to repository : Error performing command: git ls-remote -h git@10.5.5.11:test/ccjdtest.git HEAD”是因为jenkins服务器上没有安装git，安装后解决。

![](/images/jenkins/配置job3.jpg)

> jenkins job默认对master分支进行构建，你也可以自定义分支。这要求你的Gitlab代码仓库中要存在这个分支，一般来说，就是要向代码仓库提交一次更改，请 **自行完成**（Gitlab项目刚创建时是空的，一个分支也没有，这样的话，自动构建时会出错）

![](/images/jenkins/配置job4.jpg)

* 配置构建触发器，选择Build一行，后面的地址就是jenkins上放项目的路径，再选择下面的高级

![](/images/jenkins/配置job5.jpg)

* 选择Filter branches by regex，表示要触发自动部署的分支，在下面的Target Branch Regex中输入".*master"，这是正则表达式，表示分支名。最后点击Generate，生成gitlab webhook的安全令牌，在配置gitlab时有用。

![](/images/jenkins/配置job6.jpg)

* 构建，选择新增中的send files or ... over SSH

![](/images/jenkins/配置job7.jpg)

* 这里的Name中会有在Jenkins的设置中设置的Publish over SSH的服务器名字，下面的Source files中输入“\*\*/\*\*”，Remote directory中要部署到远程服务器的路径，Exec command是在远程服务器部署完代码后要执行的命令

### gitlab上设置webhook

* 到gitlab的项目中设置集成

![](/images/jenkins/webhook1.jpg)

* URL与Secret Token都是在Jenkins中的项目配置中取得的，取消SSL的勾选，最后添加

![](/images/jenkins/webhook2.jpg)

* 添加后在下面的Webhooks中就会有添加的项，点Test中的Push events测试。这里一定要在gitlab的项目中有一个文件，如果没有，测试时会提示“Hook execution failed: Ensure the project has at least one commit.”。可以在gitlab项目中创建一个README文件

![](/images/jenkins/webhook3.jpg)

* 如果测试正常，在页面最上方会有HTTP 200的提示

![](/images/jenkins/webhook4.jpg)

* webhook就是为了在有人上传代码时，就会触发上面设置的地址，只要触发这个地址，jenkins就会自动部署

### 测试

* 到要部署代码的服务器上，安装nginx。
* 到jenkins服务器上安装git，准备拉取代码

```shell
-------------
  jenkins
-------------
ssh-copy-id -i /root/.ssh/id_rsa.pub 10.5.5.22
# 要与部署代码的服务器实现密钥通讯
git clone git@10.5.5.11:test/ccjdtest.git
cd ccjdtest/
echo "test Jenkins" > index.html
# 创建一个文件
git config --global user.email "test@ccjd.com"
git config --global user.name "test"
# 这两项是在gitlab中创建项目时设置的
git add .
git commit -m 'add index.html'
git push
# 推送到gitlab服务器
```

* 到jenkins中查看项目情况，如果配置正确，推送代码到gitlab后，这里会有提示

![](/images/jenkins/测试1.jpg)

* 到部署代码的服务器上查看，index.html文件已放入了/usr/share/nginx/html目录中，并且服务已重新启动。访问页面变成了我们设置的内容。



### 测试maven手动部署

#### 部署流程

1. 注册gitlab帐号
2. 创建git项目
3. 将上传代码的主机、Jenkins服务器、与部署代码的服务器的公钥上传到gitlab
4. 将项目clone到本地
5. 将本地代码push到gitlab
6. 在Jenkins中创建Job
7. 设置Job中的git地址，Jenkins登录git的用户名与私钥。新建构建“调用顶层Maven目标”
8. 第一次构建，要到Job中点击“立即构建”
9. 构建后操作

#### 设置Job

* 设置Job，输入git地址，设置jenkins服务器登录gitlib时用的用户名与私钥，这样私钥与jenkins上传到gitlab上的公钥就可以配对了

![](/images/jenkins/设置job1.jpg)

* 设置构建，选择调用顶层Maven目标

![](/images/jenkins/设置job2.jpg)

* Maven版本是在jenkins设置中设置好的，目标是一条Maven命令：“clean install -Dmaven.test.skip=true”

![](/images/jenkins/设置job3.jpg)

* 设置构建后操作。WAR/EAR files是一个相对路径，相对/root/.jenkins/workspace/echarging/而言，echarging是项目的名称，项目下的target中有war文件，这里输入c-rest/target表示在项目目录下还有一层。Context path是访问的名称，之后就可以使用IP:8080/rest访问了。再选择下面的Containers为Tomcat8.x，这要根据实际情况选择，然后添加一个可以访问tomcat的manager_webapp页面的用户名和密码，这是在部署代码的tomcat中设置的。下面就是Tomcat的访问地址。都输入正确后保存即可。这样，在Maven处理完代码后，就会自动部署到部署代码的tomcat服务器上了。

![](/images/jenkins/设置job4.jpg)

* 在部署代码的服务器上设置tomcat

```shell
[root@bogon local]# yum install -y java-1.8.0-openjdk-devel
[root@bogon ~]# vim /etc/profile.d/java.sh
	export JAVA_HOME=/usr
[root@bogon tomcat]# vim /usr/local/tomcat/conf/tomcat-users.xml
      <role rolename="manager-gui"/>
      <role rolename="manager-script"/>
      <role rolename="manager-jmx"/>
      <role rolename="manager-status"/>
      <user username="tomcat_user" password="tomcat" roles="manager-gui,manager-script,manager-jmx,manager-status"/>
[root@bogon tomcat]# vim webapps/manager/META-INF/context.xml
	<Context antiResourceLocking="false" privileged="true" >
  <Valve className="org.apache.catalina.valves.RemoteAddrValve"
         allow="127\.\d+\.\d+\.\d+|::1|0:0:0:0:0:0:0:1|10.5.5.90|10.5.5.9" />
# 这里加入两个地址，一个是本地的地址，为了测试页面是否可以打开。一个是jenkins的地址。如果不加jenkins的地址，jenkins的部署会报错。
```

* 到Job中，点击立即构建



### 总结
```shell
-------------
  jenkins
-------------
1. 全局安全设置，可以用户注册
2. 系统设置中设置maven和java的家目录
3. 安装deploy to container及gitlib相关插件
4. jenkins中设置token，使jenkins与gitlab可以联合工作
5. 配置publish over ssh，使jenkins可以使用ssh方法发送文件到远程服务器，或在远程服务器上执行命令。当然还需要将jenkins的公钥传输到远程主机
6. 配置git，使用jenkins可以到远程的gitlab上进行验证
7. 配置JOB
7.1 源码管理中使用git，创建一个带有jenkins服务器上私钥的用户名，让jenkins可以使用私钥与github上的jenkins的公钥配对。让gitlab可以将代码推送到jenkins。
7.2 构建触发器选择Build when a change is pushed to GitLab. (当更改推送到 gitlab 时生成。)，这是为了让gitlab可以向jenkins发送POST请求的。之后设置自动触发的分支，生成一个webhook安全令牌。
7.3 构建，选择Send files or execute commands over SSH，也就是在构建期间通过ssh作为构建步骤发送文件或执行命令的方法，之后可以设置要部署的服务器，这个服务器是在publish over ssh中设置好的某台服务器，还可以设置代码的源路径，要部署的远程服务器的路径，要在远程服务器上执行的命令等。

-----------
  gitlab
-----------
1. 生成token，给jenkins使用
2. 为某个项目设置webhook。设置jenkins的URL与jenkins中生成的webhook安全令牌，使gitlab知道如何通知jenkins
3. 当项目中的代码发生变化时，gitlab会将代码推送到jenkins主机进行部署

```

