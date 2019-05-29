---
title: 搭建个人博客github-pages
date: 2019-03-17 22:03:29
tags: 搭建博客
categories: hexo
---

# 下载软件

1. 下载安装Node.js，官网地址：https://nodejs.org/en/download/
2. 下载安装git，官网地址：https://git-scm.com/download/win
3. 下载安装githubDesktop，官网地址：https://desktop.github.com/

注：实际git与githubDesktop安装一个就可以，只是不习惯使用命令行的人使用githubDesktop更方便。



# 注册github

官方地址：https://github.com/

注册后登录，创建一个自己的github pages项目，项目名称一般与自己的登录名一致。



# Hexo

## 安装

```shell
在本地创建一个Hexo目录，并进入目录，右键选择Git Bash Here
npm install hexo-cli -g
npm install hexo-deployer-git --save
hexo init
hexo generate
hexo server
访问localhost:4000
# 在执行hexo命令时提示：
internal/modules/cjs/loader.js:596
    throw err;
    ^

Error: Cannot find module 'D:\Git\node_modules\hexo-cli\bin\hexo'
之后在C:\Users\r\AppData\Roaming\npm中找到node_modules，将其复制到D:\Git下后，可以正常使用hexo命令
```



## 配置SSH密钥

```shell
ssh-keygen -t rsa -C "your_email@example.com"
# 这将按照你提供的邮箱地址，创建一对密钥。一直回车就可以完成
cat ~/.ssh/id_rsa.pub
复制公钥，将公钥放到github页面中的Settings中的SSH and GPG keys中
ssh -T git@github.com
# 测试密钥是否生效，如果生效会有向用户打招呼的提示
```



## 设置用户信息

```shell
git config --global user.name "ryanlijianchang"
# 用户名
git config --global user.email  "liji.anchang@163.com"
# 填写自己的邮箱
```



## 将本地的Hexo文件更新到Github的库中

1. 登录github
2. 打开自己的项目
3. 点击Clone or download，选择SSH，并复制地址
4. 打开本地创建的Hexo目录，打开_config.yml文件
5. 在配置文件中修改

6. 执行命令

   ```shell
   hexo g -d
   # 完成远程部署，如果有报错 ERROR Deployer not found: git，可以删除node_modules目录，再重新执行下面的命令
   npm install hexo-deployer-git --save
   ```

7. 访问name.github.io



# 美化自己博客

## 安装主题

1. 进入https://hexo.io/themes/
2. 选择自己喜欢的主题，并打开，打开后是一个github的页面，复制git地址
3. 到本地Hexo目录中的themes右键选择Git Hash Here
4. 克隆主题到本地```git clone https://github.com/iissnan/hexo-theme-next```
5. 修改Hexo配置文件，将_config.yml文件中的theme后的参数改为自己下载的主题的名字
6. 部署主题，本地查看。

```shell
hexo g
hexo s
访问localhost:4000
```

7. 部署到Github上

```shell
hexo clean
hexo g -d
```



## 主题设定

1. 打开主题配置文件

```
E:\GitHub\ruopu89.github.io\themes\hexo-theme-next\_config.yml
```

2. 设置

```shell
# Schemes
#scheme: Muse
#scheme: Mist
#scheme: Pisces
scheme: Gemini
# 现在有四种风格，使用哪个就去掉其前面的注释
```



## 设置语言

1. 打开站点配置文件

```shell
E:\GitHub\ruopu89.github.io\_config.yml
# 注意这里一定是在站点配置文件中设置
```

2. 设置

```shell
language: zh-TW
# 在主题配置目录中有一个languages目录，在这里是可以使用的语言的文件。上面设置的语言应该和languages目录中的文件名是一样的。
```



## 设置菜单

1. 打开主题配置文件

```shell
E:\GitHub\ruopu89.github.io\themes\hexo-theme-next\_config.yml
```

2. 设置

```shell
menu:
  home: / || home	//主页
  #about: /about/ || user	//关于页面
  #tags: /tags/ || tags
  tags: /tags || tags	//标签页 
  categories: /categories/ || th	//分类页 
  archives: /archives/ || archive	//归档页
  #schedule: /schedule/ || calendar
  #sitemap: /sitemap.xml || sitemap
  #commonweal: /404/ || heartbeat	//公益 404
//这里最前面的name:表示在页面中显示的内容；后面是路径；最后的|| name表示显示的图标样式。除了主页与归档页外，其他需要手动创建这个页面
```



## 设置侧栏

> 默认情况下，侧栏仅在文章页面（拥有目录列表）时才显示，并放置于右侧位置。

1. 打开主题配置文件

```shell
E:\GitHub\ruopu89.github.io\themes\hexo-theme-next\_config.yml
```

2. 设置位置

```shell
sidebar:
  position: left
# 可以使用的值有left和right
```

3. 设置侧栏显示的时机

```shell
sidebar:
  display: post
//可选项：
//post - 默认行为，在文章页面（拥有目录列表）时显示
//always - 在所有页面中都显示
//hide - 在所有页面中都隐藏（可以手动展开）
//remove - 完全移除
//已知侧栏在 use motion: false 的情况下不会展示。 影响版本5.0.0及更低版本。
```



## 添加标签

1. 新建页面

```shell
在项目目录中右键打开git
hexo new page tags
# 在项目目录中的source创建一个tags目录，如果没有这个目录，在页面上就没法打开这个标签
```

2. 设置页面类型

```shell
在新建的tags目录中会自动生成一个叫index的文件，打开它
---
title: 标签
date: 2014-12-22 12:39:04
type: "tags"
---
# index文件中的内容如上，添加type: "tags"
```

3. 修改菜单

```shell
修改主题配置文件
menu:
  home: /
  archives: /archives
  tags: /tags
# tags一行要取消注释，这样在页面中才能显示tags标签
```

4. 写作

```shell
在新建文章后，在文章头部会有如下内容
---
hetitle: 搭建个人博客github_pages
date: 2018-08-30 08:32:00
tags: hexo
---
# 要指定此文章的tags，这样就可以将文章加入上面创建的tags中了，打开页面时在tags标签中会有一个hexo，在hexo中有我们的文章
```



## 添加分类页面

1. 新建页面

```shell
在项目目录中右键打开git
hexo new page categories
# 在项目目录中的source创建一个categories目录，如果没有这个目录，在页面上就没法打开这个标签
```

2. 设置页面类型

```shell
在新建的tags目录中会自动生成一个叫index的文件，打开它
---
title: 标签
date: 2014-12-22 12:39:04
type: "categories"
---
# index文件中的内容如上，添加type: "categories"
```

3. 修改菜单

```shell
修改主题配置文件
menu:
  home: /
  archives: /archives
  categories: /categories
# categories一行要取消注释，这样在页面中才能显示categories标签
```

4. 写作

```shell
在新建文章后，在文章头部会有如下内容
---
hetitle: 搭建个人博客github_pages
date: 2018-08-30 08:32:00
categories: hexo
---
# 要指定此文章的tags，这样就可以将文章加入上面创建的tags中了，打开页面时在tags标签中会有一个hexo，在hexo中有我们的文章
```



## 添加搜索功能

```shell
cd /home/ruopu/文档/Github/ruopu.github.io
# 先到博客的根目录
npm install hexo-generator-searchdb --save
# 安装搜索插件
vim /home/ruopu/文档/Github/ruopu.github.io/_config.yml
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
# 在博客的配置文件中添加上述内容
vim /home/ruopu/文档/Github/ruopu.github.io/theme/hexo-next/_config.yml
local_search:
    enable: true
# 配置主题的功能，上面内容默认是flase，改为true
hexo g
hexo d
# 上传后就可以看到搜索功能了。
```



## 高亮显示代码

1. 编辑主题配置文件E:\GitHub\ruopu89.github.io\themes\hexo-theme-next\_config.yml

```shell
highlight_theme: night blue
# 可选的选择有：normal，night， night blue， night bright， night eighties
```

2. 编辑站点配置文件E:\GitHub\ruopu89.github.io

```shell
highlight:
  enable: true
  line_number: true
  auto_detect: true
# 这里默认是false
  tab_replace:
  # 设置后，博客中的代码会有高亮显示，但显示的还是有问题。无论是否在代码中加入语言标记。
```



## 添加图片

> 图片默认被保存在主题目录中的source中的images中，如：E:\GitHub\ruopu89.github.io\themes\hexo-theme-next\source\images，我们可以在这个目录下新建目录，与博客名称相同，所有图片都保存在这里
> 使用图片的网络地址也可上传图片。这种方式的问题应该是，当图片的网络地址失效时，这个图片也就看不到了。
```shell
![](https://raw.githubusercontent.com/higoge/image/master/basic01/01.png)
```

```shell
使用markdown语法添加图片时可以使用下面的语法
<img src="/images/image.jpg"/>
![](/images/images.jpg)
# 上面两种方法都可以添加图片，系统会自动到主题目录中的source中的images中找图片。问题是，在markdown中是看不到图片的。因为提交后，系统会到images中找图片，所以要用这种格式，斜线也要用/。如果输入在windows中的路径，上传后是找不到图片的，所以也无法显示。
```



# 问题解决

### github Desktop提交时提示“Commit failed - exit code 1 received”

解决：原因是不能提示的目录中也有.git目录，删除.git目录再上传就正常了。

### 在另一台ubuntu18.04系统上重新部署hexo

```shell
* 安装所需软件包
apt install -y nodejs
apt install -y npm
apt install -y git
npm install hexo-cli -g
npm install hexo-deployer-git --save
# 上面安装的nodejs是一个8.10的版本，也可以升级nodejs
ssh-keygen -t rsa -C "ruopu1989@hotmail.com"
# 生成密钥
cat .ssh/id_rsa.pub
# 获取密钥
# 这两步在root和普通用户上都做了一遍。之后将得到的密钥复制到github上
ssh -T git@github.com
# 在两个帐户上都测试一下连接是否成功。如果成功会有下面的提示，测试发现只在root用户下执行成功，在普通用户上执行也可以通过，但提示github不提供shell访问
    Hi ruopu89! You've successfully authenticated, but GitHub does not provide shell access.
git config --global user.name "ruopu1989"
git config --global user.email "ruopu1989@hotmail.com"
cd /media/rp/00E219519546E/MyFile/GitHub/rp.github.io
hexo g
hexo d
# 如果这一步报错，可以尝试使用hexo clean撤消hexo g生成的静态文件，再执行hexo g重新生成再部署。
# 测试
```



### github个人博客多电脑使用

```shell
apt install nodejs
apt install npm
npm install hexo-cli -g
npm install hexo-deployer-git --save
cd /home/GitHub/ruopu.github.io
ssh-keygen -t rsa -C "ruopu19@hotmail.com"
# -C后的是一些描述信息
cat .ssh/id_rsa.pub
# 将密钥复制到github上
ssh -T git@github.com
# 测试与github连接是否成功
git config --global user.name "ruopu1989"
git config --global user.email "ruopu1989@hotmail.com"
# 自报家门
git init
# 给源文件目录初始化git，虽然目录中已有内容，但这也不会报错的
git remote add origin https://github.com/abc/abc.github.io.git
# 与远程的origin分支关联，最后的地址是github上项目的地址。使用git push时如果提示需要输入用户名和密码，可以删除远程地址，再试。命令：git remote remove origin。另外，这里也可以使用git@github.com:abc/abc.github.io.git地址。
git checkout -b source
# 创建并切换分支，使用-b选择就是为了创建并切换。这与git branch source && git checkout source两条命令的执行结果是一样的。
git branch
# 现在本地只有一个source分支，这也就是主分支
git add .
# 添加所有内容到暂存区
git commit -m 'add source'
# 提交
git push origin source
# 将本地的source分支推送到远程的origin分支上
在github上将source设置为主分支，这样之后clone的就都是这个source分支上的内容了。
** 上传中会有一个问题，就是theme目录中的主题文件上传后可能是灰色的，这是因为获得主题文件时就是从另一个库clone来的，所以主题文件目录中也有.git文件。如果上传了目录，解决方法如下：
1. 将主题文件目录剪切到另一个不相干的目录中
2. git add .
3. git commit -m 'delete theme'
4. git push
# 以上几步是为了将没有主题文件目录的信息再次提交，之后推送到远程库，也就删除了远程库上的主题文件目录
5. 将主题文件目录中的.git、.gitignore、.gitattributes三个文件删除，之后将主题文件目录再剪切回github的theme目录中
6. git add .
7. git commit -m 'new theme'
8. git push
# 再次将没有.git文件的主题推送到远程库就没有问题了。
==============================================================================================
推送时出现问题，原因是想将本地的文件推送到远程，但与远程有很多不同。可以使用下面命令强行推送。但本地的文件可能丢失。推送前将文件备份，推送后将丢失的文再复制到相应目录，再推送就可以了。
git push -f origin source

==============================================================================================
另外还涉及一些常用命令
git branch
# 查看当前分支
git checkout master
# 切换分支。加-b选项是创建并切换分支
git merge source
# 将source分支内容合并到当前分支
git add .
git commit -m "abc"
git push origin source
git diff
git status
git log
git remote add origin https://github.com/abc/rab.github.io.git
git reset --hard HEAD^
# 回退到上一个版本
git reflog
# 查看提交与回退历史
==============================================================================================
```