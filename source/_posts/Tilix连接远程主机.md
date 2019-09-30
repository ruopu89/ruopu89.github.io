---
title: Tilix连接远程主机
date: 2019-05-29 17:19:42
tags: 网络工具使用
categories: 网络
---

1. 打开首选项-->书签-->添加书签

![](/images/tilix/tillix添加书签.png)

2. 输入信息

![](/images/tilix/tillix添加书签2.png)

3. 连接测试

![](/images/tilix/tillix连接1.png)

![](/images/tilix/tillix连接2.png)

![](/images/tilix/tillix连接3.png)

4. 创建密码，在确定添加时可能会要求输入密码，不然无法添加

![](/images/tilix/tillix创建密码1.png)

![](/images/tilix/tillix创建密码2.png)

![](/images/tilix/tillix创建密码3.png)

![](/images/tilix/tillix创建密码4.png)

5. 连接时，选择书签中创建的远程服务器成功后，可以再从助手中选择创建的密码，这样就可以连接上远程服务器了。如果之前就将本机的公钥发送到了远程的主机，就不需要再选择密码了，选择远程主机时就可以连接上了。
6. 如果创建的远程连接信息有误，可以到Profiles -> Edit Profile -> Bookmarks中修改或删除
7. 如果连接时需要密钥对，需要在输入完Name、Host、User后，在Parameters中输入-i "awsTest.pem"。这样就可以登录了。另外，如登录aws时，官方还会提供登录的方法。如登录时Redhat系统要使用ec2-user用户，ubuntu系统使用ubuntu，看一下官方的提示信息。进入系统后可以使用sudo passwd修改root密码。如果连接时的密钥没有了，可以在aws页面中的密钥对页面里重新创建。下图为官方提供的方法与tilix的配置方法

![](/images/tilix/aws登录方法0)

![](/images/tilix/aws登录方法1)



