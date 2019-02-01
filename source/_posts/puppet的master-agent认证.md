---
title: puppet的master&agent认证
date: 2019-01-31 22:06:41
tags: puppet
categories: 编排工具
---

### mastar&agent

#### 手动注册

```shell
===========================================================================================
手动注册是由Agent端先发起证书申请请求，然后由Puppetserver端确认，方可注册成功，这种注册方式安全系数中等，逐一注册（puppet cert --sign certnmame）在节点数量较大的情况下是比较麻烦的，效率也低，批量注册(puppet cert --sign --all)效率很高，一次性便可注册所有的Agent的请求，但是这种方式安全系数较低，因为错误的请求也会被注册上。

环境
master：192.168.1.70
agent1：192.168.1.71
agent2：192.168.1.72
===========================================================================================
------------
  master
------------
[root@puppet ~]# hostnamectl set-hostname master.ruopu.com
[root@master ~]# vim /etc/hosts
192.168.1.70 master.ruopu.com
192.168.1.71 node1.ruopu.com
192.168.1.72 node2.ruopu.com
[root@master ~]# rsync -e ssh -arvz --progress /etc/hosts 192.168.1.71:/etc
[root@master ~]# rsync -e ssh -arvz --progress /etc/hosts 192.168.1.72:/etc
# 主机名的修改非常重要，必须做。让三台主机可以互相解析
[root@puppet ~]# yum install -y puppt puppet-server facter tree
[root@puppet ~]# vim /etc/puppet/puppet.conf
[main]
    logdir = /var/log/puppet		# 默认日志存放路径
    rundir = /var/run/puppet		# pid存放路径
    ssldir = $vardir/ssl		 # 证书存放目录，默认$vardir为/var/lib/puppet
[agent]
    classfile = $vardir/classes.txt
    localconfig = $vardir/localconfig
    server = master.ruopu.com		# 设置agent认证连接master端的服务器名称，注意这个名字必须能够被节点解析
    certname = master.ruopu.com		# 设置agent端certname名称
[master]
    certname = master.ruopu.com		# 设置puppetmaster认证服务器名
[root@puppet ~]# touch /etc/puppet/manifests/site.pp
[root@puppet ~]# systemctl start puppetmaster 
# 启动服务端，自动生成CA证书，并签署。
[root@master ~]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128        *:8140                   *:*   
# 监听在8140端口
[root@puppet ~]# tree /var/lib/puppet/ssl/
/var/lib/puppet/ssl/
├── ca
│   ├── ca_crl.pem
│   ├── ca_crt.pem
│   ├── ca_key.pem
│   ├── ca_pub.pem
│   ├── inventory.txt
│   ├── private
│   │   └── ca.pass
│   ├── requests
│   ├── serial
│   └── signed
│       └── master.ruopu.com.pem
# 可以看到，signed中已经有服务端了，证明服务器已被认证
[root@puppet ~]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
# 有加号的证明是已被认证的主机
[root@puppet ~]# tail -f /var/log/puppet/masterhttp.log
# 监听日志

---------------
  agent1&2
---------------
[root@puppettest1 ~]# hostnamectl set-hostname node1.ruopu.com
[root@puppettest1 ~]# yum install -y puppet facter
[root@node1 ~]# vim /etc/puppet/puppet.conf 
[main]
    logdir = /var/log/puppet
    rundir = /var/run/puppet
    ssldir = $vardir/ssl
[agent]
    classfile = $vardir/classes.txt
    localconfig = $vardir/localconfig
    server = master.ruopu.com		# 指向puppetmaster端
    certname = node1.ruopu.com		# 设置自己的certname名
    listen = true		# 让puppet监听8139端口 
[root@node1 ~]# vim /etc/puppet/auth.conf
path /run
method save
auth any
allow master.ruopu.com
# 在文件尾部path /的上方加入上面内容
[root@puppettest1 ~]# systemctl start puppetagent
# 启动客户端

------------
  master
------------
[root@master ~]# puppet cert --list --all
  "node1.ruopu.com"  (SHA256) F8:DF:B8:26:AE:92:5D:26:96:D9:21:AE:92:3F:84:40:6F:65:3F:B5:D0:C7:27:AC:12:44:E3:87:09:6B:19:0D
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
#  这时可以看到客户端的请求，没有加号
[root@master ~]# puppet cert --sign --all
Notice: Signed certificate request for node1.ruopu.com
Notice: Removing file Puppet::SSL::CertificateRequest node1.ruopu.com at '/var/lib/puppet/ssl/ca/requests/node1.ruopu.com.pem'
# 签署请求
[root@master ~]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
+ "node1.ruopu.com"  (SHA256) DC:8F:2C:D6:0C:97:6B:F7:1B:A6:48:55:E9:D9:3A:AA:C7:C5:C2:89:86:0E:45:C8:22:68:4B:B7:39:4B:B9:D3
# 已被认证

---------------
  agent1&2
---------------
[root@node1 ~]# ss -tln
State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              
LISTEN     0      128        *:8139                   *:* 
# 这时可以看到客户端监听在8139端口了，在认证后需要等待一会儿才会监听地址。

------------
  master
------------
[root@master ~]# puppet kick --all
Warning: Puppet kick is deprecated. See http://links.puppetlabs.com/puppet-kick-deprecation
Warning: Failed to load ruby LDAP library. LDAP functionality will not be available
Finished
# 测试推送是否成功
[root@master ~]# cd /etc/puppet/modules/
[root@master modules]# mkdir -pv {jdk8,tomcat,nginx}/{manifests,files,templates,lib,spec,tests}
[root@master modules]# yum install -y nginx tomcat java-1.8.0-openjdk-devel
[root@master modules]# vim /etc/nginx/nginx.conf
		location / {
           proxy_pass http://192.168.1.72:8080;
        }
[root@master modules]# cp /etc/nginx/nginx.conf /etc/puppet/modules/nginx/files/
[root@master modules]# cp /etc/tomcat/server.xml /etc/puppet/modules/tomcat/files/
[root@master modules]# vim nginx/manifests/init.pp
class nginx {
   package{'nginx':
      name => 'nginx',
      ensure => latest,
   }
   file{'nginx.conf':
      path => '/etc/nginx/nginx.conf',
      source => "puppet:///modules/nginx/nginx.conf",
   }
   service{'nginx':
      ensure => running,
      enable => true,
   }
   Package['nginx'] -> File['nginx.conf'] ~> Service['nginx']
}
[root@master modules]# vim tomcat/manifests/init.pp
class tomcat {
   package{['tomcat','tomcat-webapps','tomcat-admin-webapps','tomcat-docs-we
bapp']:		# 安装多个包要用这种定义方式
      ensure => latest,
   } ->
   file{'server.xml':
      path => '/etc/tomcat/server.xml',
      source => 'puppet:///modules/tomcat/server.xml',
   } ~>
   service{'tomcat':
      ensure => running,
      enable => true,
   }
}
[root@master modules]# vim jdk8/manifests/init.pp
class jdk8 {
   package{'jdk8':
      name => 'java-1.8.0-openjdk-devel',
      ensure => latest,
   }
   file{'java.sh':
      path => '/etc/profile.d/java.sh',
      source => "puppet:///modules/jdk8/java.sh",
   }
}
[root@master modules]# vim jdk8/files/java.sh
export JAVA_HOME=/usr
[root@master modules]# cd /etc/puppet/manifests/
[root@master manifests]# vim site.pp		# 定义主机清单
node 'node1.test.com' {
   include nginx
}
node 'node2.test.com' {
   include jdk8
   include tomcat
}
[root@master manifests]# puppet module list
/etc/puppet/modules
├── jdk8 (???)
├── nginx (???)
└── tomcat (???)
# 查看上面定义的三个模块tomcat、nginx、jdk8是否加载
[root@master modules]# puppet kick --all
Warning: Puppet kick is deprecated. See http://links.puppetlabs.com/puppet-kick-deprecation
Warning: Failed to load ruby LDAP library. LDAP functionality will not be available
Finished
# 提醒所有客户端进行同步，如果是单个主机，可以写为客户端的主机名，如node1.ruopu.com，不能写为node1，因为不是主机名，所以推送不过去。也可以写多个主机名，主机名之间用空格分隔。
# 这个推送的过程很慢，测试中一起推送非常慢，使用了单个主机的推送

-------------
  agent1
-------------
[root@node1 ~]# rpm -q nginx
# 可以看到安装了nginx
[root@node1 ~]# ss -tln
# 服务也启动了
[root@node1 ~]# vim /etc/nginx/nginx.conf
# 配置文件也被修改了。
# 这个过程有些慢，需要在服务端推送后等一会儿才会生效。


===========================================================================================
客户端认证出现问题或推送失败的解决方法
------------
  master
------------
[root@puppet ~]# puppet cert --clean node1.ruopu.com
# 服务端使用此命令将某个主机的认证清除

----------
  agent
----------
[root@puppettest1 ~]# systemctl stop puppetagent
# 先停止服务
[root@puppettest1 ~]# rm -rf /var/lib/puppet/ssl/*
# 清除所有密钥
[root@puppettest1 ~]# systemctl start puppetagent
# 再启动

------------
  master
------------
[root@puppet ~]# puppet cert --list --all
[root@puppet ~]# puppet cert --sign --all 
# 签署认证
[root@puppet ~]# tail -f /var/log/puppet/masterhttp.log
# 查看日志
[root@puppet ~]# tree /var/lib/puppet/ssl/
# 查看认证
===========================================================================================
```



#### 自动注册

```shell
============================================================================================
这种注册方式简单来讲是通过Puppetmaster端的ACL列表进行控制的，安全系统较低，也就是说符合预先定义的ACL列表中的所有节点请求不需要确认都会被自动注册上，也就是说你只需要知道ACL列表要求，其次能和PuppetMaster端通信便可轻易注册成功。当然，它的最大优点就是效率非常高。
============================================================================================
------------
  master
------------
[root@master modules]# puppet cert --clean node2.ruopu.com
Notice: Revoked certificate with serial 5
Notice: Removing file Puppet::SSL::Certificate node2.ruopu.com at '/var/lib/puppet/ssl/ca/signed/node2.ruopu.com.pem'
Notice: Removing file Puppet::SSL::Certificate node2.ruopu.com at '/var/lib/puppet/ssl/certs/node2.ruopu.com.pem'
# 清除PuppetMaster端已经注册的agent2的证书
[root@master modules]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
+ "node1.ruopu.com"  (SHA256) DC:8F:2C:D6:0C:97:6B:F7:1B:A6:48:55:E9:D9:3A:AA:C7:C5:C2:89:86:0E:45:C8:22:68:4B:B7:39:4B:B9:D3

-------------
  agent2
-------------
[root@node2 ~]# rm -rf /var/lib/puppet/ssl/*

------------
  master
------------
[root@master modules]# vim /etc/puppet/autosign.conf
*.ruopu.com
# 在Puppetmaster端编写ACL列表
[root@master modules]# systemctl restart puppetmaster.service
# 重启服务
[root@master modules]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
+ "node1.ruopu.com"  (SHA256) DC:8F:2C:D6:0C:97:6B:F7:1B:A6:48:55:E9:D9:3A:AA:C7:C5:C2:89:86:0E:45:C8:22:68:4B:B7:39:4B:B9:D3

-------------
  agent2
-------------
[root@node2 ~]# puppet agent --test
Info: Creating a new SSL key for node2.ruopu.com
Info: Caching certificate for ca
Info: csr_attributes file loading from /etc/puppet/csr_attributes.yaml
Info: Creating a new SSL certificate request for node2.ruopu.com
Info: Certificate Request fingerprint (SHA256): 6E:0E:32:71:38:77:41:92:E6:55:B0:90:07:3B:42:BF:87:8A:A7:16:2F:C2:90:25:43:10:B6:8B:DF:0A:65:A8
Info: Caching certificate for node2.ruopu.com
Info: Caching certificate_revocation_list for ca
Info: Caching certificate for ca
Notice: Ignoring --listen on onetime run
Info: Retrieving pluginfacts
Info: Retrieving plugin
Info: Caching catalog for node2.ruopu.com
Warning: The package type's allow_virtual parameter will be changing its default value from false to true in a future release. If you do not want to allow virtual packages, please explicitly set allow_virtual to false.
   (at /usr/share/ruby/vendor_ruby/puppet/type.rb:816:in `set_default')
Info: Applying configuration version '1548985465'
Notice: Finished catalog run in 4.31 seconds
# 申请证书

------------
  master
------------
[root@master modules]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
+ "node1.ruopu.com"  (SHA256) DC:8F:2C:D6:0C:97:6B:F7:1B:A6:48:55:E9:D9:3A:AA:C7:C5:C2:89:86:0E:45:C8:22:68:4B:B7:39:4B:B9:D3
+ "node2.ruopu.com"  (SHA256) 3F:C1:1E:F7:4B:BA:2B:28:E0:79:49:AF:F3:96:BC:FE:78:A2:D2:F6:A4:9A:76:E6:29:BA:D9:09:29:D4:E0:79
# agent2已经自动注册成功

[root@master modules]# puppet kick node2.ruopu.com   
Warning: Puppet kick is deprecated. See http://links.puppetlabs.com/puppet-kick-deprecation
Warning: Failed to load ruby LDAP library. LDAP functionality will not be available
Triggering node2.ruopu.com
Error: Host node2.ruopu.com failed: SSL_connect returned=1 errno=0 state=error: certificate verify failed: [certificate revoked for /CN=node2.ruopu.com]

node2.ruopu.com finished with exit code 2
Failed: node2.ruopu.com
# 这时向agent2推送可能会有问题，需要重启agent2的puppet服务

-------------
  agent2
-------------
[root@node2 ~]# systemctl restart puppetagent

------------
  master
------------
[root@master modules]# vim /root/puppetclient.txt
node1.ruopu.com
node2.ruopu.com
[root@master modules]# puppet kick --host `cat /root/puppetclient.txt`
Warning: Puppet kick is deprecated. See http://links.puppetlabs.com/puppet-kick-deprecation
Warning: Failed to load ruby LDAP library. LDAP functionality will not be available
Triggering node1.ruopu.com
Getting status
status is success
node1.ruopu.com finished with exit code 0
Triggering node2.ruopu.com
Getting status
status is success
node2.ruopu.com finished with exit code 0
Finished
# 可以使用此种方法一起推送
```



#### 预签名注册

```shell
============================================================================================
预签名注册是在agent端未提出申请的情况下，预先在puppetmaster端生成agent端的证书，然后复制到节点对应的目录下即可注册成功，这种方式安全系数最高，但是操作麻烦，需要提前预知所有节点服务器的certname名称，其次需要将生成的证书逐步copy到所有节点上去。不过，如果你的系统中安装了kickstart或者cobbler这样的自动化工具，倒是可以将证书部分转换成脚本集成到统一自动化部署中
== 生产环境中建议此方式进行注册，既安全又可靠！ ==
============================================================================================
------------
  master
------------
[root@master modules]# puppet cert --clean node1.ruopu.com
Notice: Revoked certificate with serial 4
Notice: Removing file Puppet::SSL::Certificate node1.ruopu.com at '/var/lib/puppet/ssl/ca/signed/node1.ruopu.com.pem'
Notice: Removing file Puppet::SSL::Certificate node1.ruopu.com at '/var/lib/puppet/ssl/certs/node1.ruopu.com.pem'
[root@master modules]# puppet cert --list --all
+ "master.ruopu.com" (SHA256) B5:A8:47:D4:FE:4E:FE:AC:5E:48:A2:C0:CF:7E:CB:1D:B9:03:26:8F:1F:66:6B:9A:29:E3:C7:39:E0:5E:D6:E0 (alt names: "DNS:master.ruopu.com", "DNS:puppet", "DNS:puppet.ruopu.com")
+ "node2.ruopu.com"  (SHA256) 3F:C1:1E:F7:4B:BA:2B:28:E0:79:49:AF:F3:96:BC:FE:78:A2:D2:F6:A4:9A:76:E6:29:BA:D9:09:29:D4:E0:79
[root@master modules]# mv /etc/puppet/autosign.conf{,.bak}
# 删除自动注册ACL列表

-------------
  agent1
-------------
[root@puppettest1 ~]# rm -rf /var/lib/puppet/*

------------
  master
------------
[root@master modules]# puppet ca generate node1.ruopu.com
Notice: node1.ruopu.com has a waiting certificate request
Notice: Signed certificate request for node1.ruopu.com
Notice: Removing file Puppet::SSL::CertificateRequest node1.ruopu.com at '/var/lib/puppet/ssl/ca/requests/node1.ruopu.com.pem'
Notice: Removing file Puppet::SSL::CertificateRequest node1.ruopu.com at '/var/lib/puppet/ssl/certificate_requests/node1.ruopu.com.pem'
"-----BEGIN CERTIFICATE-----\nM...
# puppetserver端预先生成agent1证书
============================================================================================
[root@master modules]# puppet --version
3.6.2
[root@master modules]# puppet help
# 3.6.2版本中的命令与网上的一些教程已有很多不同，可以通过此命令查看帮助信息
[root@master modules]# puppet help ca
# 这是查看ca模块的帮助命令
============================================================================================

-------------
  agent1
-------------
[root@puppettest1 ~]# puppet agent --test --server=master.ruopu.com
# 节点生成目录结构，最后是服务端的主机名

------------
  master
------------
[root@master modules]# scp /var/lib/puppet/ssl/private_keys/node1.ruopu.com.pem node1.ruopu.com:/var/lib/puppet/ssl/private_keys/
[root@master modules]# scp /var/lib/puppet/ssl/certs/node1.ruopu.com.pem node1.ruopu.com:/var/lib/puppet/ssl/certs/
[root@master modules]# scp /var/lib/puppet/ssl/certs/ca.pem node1.ruopu.com:/var/lib/puppet/ssl/certs/
# 复制密钥到客户端

-------------
  agent1
-------------
[root@puppettest1 ~]# puppet agent --test
Notice: Ignoring --listen on onetime run
# 测试。实际发现，在服务端生成客户端密钥时就已经完成客户端的认证了。

------------
  master
------------
[root@master modules]# puppet kick node1.ruopu.com      
Warning: Puppet kick is deprecated. See http://links.puppetlabs.com/puppet-kick-deprecation
Warning: Failed to load ruby LDAP library. LDAP functionality will not be available
Triggering node1.ruopu.com
Getting status
status is running
Host node1.ruopu.com is already running
node1.ruopu.com finished with exit code 3
Failed: node1.ruopu.com
# 提示错误的原因是agent1节点每5秒与服务器同步一次，比较频繁，所以有此提示。如果将更新时间改为默认的1800秒，再次推送就不会有此提示了。
```



#### 客户端定时更新

```shell
-------------
  agent2
-------------
[root@node2 ~]# puppet agent --configprint runinterval
1800
# Puppet客户端定时更新时间默认为30分钟
[root@node2  modules]# vim /etc/puppet/puppet.conf
[agent]
    runinterval = 5
# 在agent段中加入上述内容，表示设置agent端5秒去同步。修改即可，无需重启服务
[root@node2 ~]# puppet agent --configprint runinterval
5
------------
  master
------------
[root@puppet ~]# tail -f /var/log/puppet/masterhttp.log
# 查看日志会频繁变动

# runinterval=0，并不表示从来不运行，而是表示继续运行；如果想要puppet agent从不运行，应该使用--no-client选项来启动；如：puppet agent --no-client
# 使用--no-client选项，会启动守护进程但不检测配置，除非它被puppet kick触发。而且只有当puppet.conf配置listen=true或启动时有带--listen选项时，它才生效；
```



