---
title: git使用
date: 2018-12-09 12:26:54
tags: git
categories: git
---

### git管理

#### 安装配置

```shell
yum install -y git
# 安装
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
# 每个机器都必须自报家门：你的名字和Email地址。
# git config命令的--global参数，用了这个参数，表示你这台机器上所有的Git仓库都会使用这个配置，也可以对某个仓库指定不同的用户名和Email地址。
```



#### 添加文件并提交

```shell
mkdir learngit
cd learngit
git init
# 初始化
	Initialized empty Git repository in /root/learngit/.git/
# 所有的版本控制系统，只能跟踪文本文件的改动
vim readme.txt
        git is a version control system.
        git is free software
git add .
# 添加当前目录中的所有文件，也可以只提交某个文件，如：git add readme.txt。可以添加多次文件，最后一并提交。
git commit -m "wrote a readme file"
        [master (root-commit) 8f5d632] wrote a readme file
         1 file changed, 2 insertions(+)
         create mode 100644 readme.txt
# 提交，-m后面输入的是本次提交的说明，最好将说明写清楚，方便之后查看。1 file changed：1个文件被改动（我们新添加的readme.txt文件）；2 insertions(+)：插入了两行内容（readme.txt有两行内容）
```



#### 修改提交

```shell
vim readme.txt
        git is a distributed version control system.                                                                                                                     
        git is free software
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# git status命令可以让我们时刻掌握仓库当前的状态，上面的命令输出告诉我们，readme.txt被修改过了，但还没有提交修改。	
git diff readme.txt 
        diff --git a/readme.txt b/readme.txt
        index 488642a..1d72fa6 100644
        --- a/readme.txt
        +++ b/readme.txt
        @@ -1,2 +1,2 @@
        -git is a version control system.
        +git is a distributed version control system.
         git is free software
# git diff顾名思义就是查看difference，显示的格式正是Unix通用的diff格式，可以从上面的命令输出看到，我们在第一行添加了一个distributed单词（倒数第二行）。
git add readme.txt 
git status
        # On branch master
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       modified:   readme.txt
# git status告诉我们，将要被提交的修改包括readme.txt，下一步，就可以放心地提交了
git commit -m "add distributed"
        [master 5e363b3] add distributed
         1 file changed, 1 insertion(+), 1 deletion(-)
git status
        # On branch master
        nothing to commit, working directory clean
# Git告诉我们当前没有需要提交的修改，而且，工作目录是干净（working tree clean）的。
```



#### 版本回退

```shell
vim readme.txt
        git is a distributed version control system.
        git is free software distributed under the GPL.
git add readme.txt 
git commit -m "append GPL"
        [master 9976125] append GPL
         1 file changed, 1 insertion(+), 1 deletion(-)
# 像这样，你不断对文件进行修改，然后不断提交修改到版本库里，就好比玩RPG游戏时，每通过一关就会自动把游戏状态存盘，如果某一关没过去，你还可以选择读取前一关的状态。有些时候，在打Boss之前，你会手动存盘，以便万一打Boss失败了，可以从最近的地方重新开始。Git也是一样，每当你觉得文件修改到一定程度的时候，就可以“保存一个快照”，这个快照在Git中被称为commit。一旦你把文件改乱了，或者误删了文件，还可以从最近的一个commit恢复，然后继续工作，而不是把几个月的工作成果全部丢失。
git log
        commit 997612519811f1809317db4f6016fe785e9960cf
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Sun Dec 9 13:01:59 2018 +0800

            append GPL

        commit 5e363b39f5a22a8acf7fed8bb0de91952e93d947
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Sun Dec 9 12:57:05 2018 +0800

            add distributed

        commit 8f5d632912474ae28b5fdeb989e28cabc35b815b
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Sun Dec 9 12:45:26 2018 +0800

            wrote a readme file
 # git log命令显示从最近到最远的提交日志，我们可以看到3次提交，最近的一次是append GPL，上一次是add distributed，最早的一次是wrote a readme file。
 git log --pretty=oneline
        997612519811f1809317db4f6016fe785e9960cf append GPL
        5e363b39f5a22a8acf7fed8bb0de91952e93d947 add distributed
        8f5d632912474ae28b5fdeb989e28cabc35b815b wrote a readme file
# 如果嫌输出信息太多，可以试试加上--pretty=oneline参数。9976125...是commit id（版本号）。
git reset --hard HEAD^
		HEAD is now at 5e363b3 add distributed
# 在Git中，用HEAD表示当前版本，也就是最新的提交9976125...，上一个版本就是HEAD^，上上一个版本就是HEAD^^，当然往上100个版本写100个^比较容易数不过来，所以写成HEAD~100。
# 使用git reset命令回退到上一个版本
cat readme.txt 
        git is a distributed version control system.
        git is free software
# 回退到了add distributed时的版本
git log
        commit 5e363b39f5a22a8acf7fed8bb0de91952e93d947
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Sun Dec 9 12:57:05 2018 +0800

            add distributed

        commit 8f5d632912474ae28b5fdeb989e28cabc35b815b
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Sun Dec 9 12:45:26 2018 +0800

            wrote a readme file
# 最新的那个版本append GPL已经看不到了，如果想回到这个未来的版本，需要知道这个版本的版本号，也就是commit id，在命令行向上找
git reset --hard 9976125
		HEAD is now at 8f5d632 wrote a readme file
# 回到append GPL的版本
cat readme.txt 
		git is a distributed version control system.
		git is free software distributed under the GPL.
===========================================================================================
# Git的版本回退速度非常快，因为Git在内部有个指向当前版本的HEAD指针，当你回退版本的时候，Git仅仅是把HEAD从指向append GPL改为指向add distributed。然后顺便把工作区的文件更新了。所以你让HEAD指向哪个版本号，你就把当前版本定位在哪。
===========================================================================================
git reflog
        9976125 HEAD@{0}: reset: moving to 9976125
        8f5d632 HEAD@{1}: reset: moving to 8f5d63291
        5e363b3 HEAD@{2}: reset: moving to HEAD^
        9976125 HEAD@{3}: commit: append GPL
        5e363b3 HEAD@{4}: commit: add distributed
        8f5d632 HEAD@{5}: commit (initial): wrote a readme file
# git reflog用来记录你的每一次提交与回退。可以看到提交append GPL的版本号是9976125，这样就算不知道版本号，也可以这样查找了。当你 (在一个仓库下) 工作时，Git 会在你每次修改了 HEAD 时悄悄地将改动记录下来。当你提交或修改分支时，reflog 就会更新。git update-ref 命令也可以更新 reflog，任何时间运行 git reflog 命令可以查看当前的状态。运行 git log -g 会输出 reflog 的正常日志，从而显示更多有用信息
```



#### 工作区与暂存区

![](/images/git/版本库.png)

```shell
===========================================================================================
工作区（Working Directory）：就是你在电脑里能看到的目录，比如我的learngit目录就是一个工作区
版本库（Repository）：工作区有一个隐藏目录.git，这个不算工作区，而是Git的版本库。Git的版本库里存了很多东西，其中最重要的就是称为stage（或者叫index）的暂存区，还有Git为我们自动创建的第一个分支master，以及指向master的一个指针叫HEAD。
把文件往Git版本库里添加的时候，是分两步执行的：
第一步是用git add把文件添加进去，实际上就是把文件修改添加到暂存区；
第二步是用git commit提交更改，实际上就是把暂存区的所有内容提交到当前分支。
因为我们创建Git版本库时，Git自动为我们创建了唯一一个master分支，所以，现在，git commit就是往master分支上提交更改。你可以简单理解为，需要提交的文件修改通通放到暂存区，然后，一次性提交暂存区的所有修改。
===========================================================================================
vim readme.txt
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
# 修改内容，加一行
vim LICENSE 
		add LICENSE
# 在工作区再新增一个文件叫LICENSE
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        # Untracked files:
        #   (use "git add <file>..." to include in what will be committed)
        #
        #       LICENSE
        no changes added to commit (use "git add" and/or "git commit -a")
# Git非常清楚地告诉我们，readme.txt被修改了，而LICENSE还从来没有被添加过，所以它的状态是Untracked(未跟踪的)。
git add .
git status
        # On branch master
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   LICENSE
        #       modified:   readme.txt
# 添加两个文件后，查看状态，两个文件被放入了暂存区。git add命令实际上就是把要提交的所有修改放到暂存区（Stage），然后，执行git commit就可以一次性把暂存区的所有修改提交到分支
```

![](/images/git/版本库1.png)

```shell
git commit -m "understand how stage works"
        [master f21dbee] understand how stage works
         2 files changed, 2 insertions(+)
         create mode 100644 LICENSE
# 提交
git status
        # On branch master
        nothing to commit, working directory clean
# 将暂存区的文件提交到主分支，如果你又没有对工作区做任何修改，那么工作区就是“干净”的
# 工作区目录中包含版本库，版本库中包括暂存区与分支。在工作区中修改的内容会被添加到暂存区，提交是将暂存区中的内容提交到分支
```

![](/images/git/版本库2.png)



#### 管理修改

```shell
vim readme.txt
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes.
# 修改，加一行
git add readme.txt 
git status
        # On branch master
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       modified:   readme.txt
# 添加并查看状态
vim readme.txt
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
# 再次修改
git commit -m "git tracks changes"
        [master 27975c9] git tracks changes
         1 file changed, 1 insertion(+)ed, 1 insertion(+)
# 提交
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# 第二次修改没有被提交。因为第二次修改没有添加到暂存区，也就是没有使用git add 命令
git diff HEAD -- readme.txt 
        diff --git a/readme.txt b/readme.txt
        index 6c29947..b7b0032 100644
        --- a/readme.txt
        +++ b/readme.txt
        @@ -1,4 +1,4 @@
         git is a distributed version control system.
         git is free software distributed under the GPL.
         git has a mutable index called stage.
        -git tracks changes.
        +git tracks changes of files.
# 查看工作区和版本库里面最新版本的区别，-git tracks changes.是现在版本库中的内容， +git tracks changes of files.是工作区中的内容。
# 第一次修改 -> git add -> 第二次修改 -> git add -> git commit
git add readme.txt 
git commit -m "add of files."     
        [master e49d070] add of files.
         1 file changed, 1 insertion(+), 1 deletion(-)
git status
        # On branch master
        nothing to commit, working directory clean
# 添加并提交第二次修改
```



#### 撤销修改

```shell
1. 修改了内容，但未放入暂存区
vim readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
        My stupid boss still prefers SVN.
# 修改添加一行内容
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# 查看状态，提示git checkout -- file可以丢弃工作区的修改
git checkout -- readme.txt
# 丢弃工作区的修改。git checkout -- file命令中的--很重要，没有--，就变成了“切换到另一个分支”的命令
# 命令git checkout -- readme.txt意思就是，把readme.txt文件在工作区的修改全部撤销，这里有两种情况：
# 一种是readme.txt自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态；上面就是这种情况
# 一种是readme.txt已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。
# 总之，就是让这个文件回到最近一次git commit或git add时的状态。
cat readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
# 又恢复到修改前的状态

2. 修改内容并放入了暂存区
vim readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
        My stupid boss still prefers SVN.
# 修改添加一行内容
git add readme.txt 
git status
        # On branch master
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       modified:   readme.txt
# 内容只是被添加到了暂存区，还没有提交，提示使用"git reset HEAD <file>..."可以把暂存区的修改撤销掉（unstage）
git reset HEAD readme.txt 
        Unstaged changes after reset:
        M       readme.txt
# git reset命令既可以回退版本，也可以把暂存区的修改回退到工作区。当我们用HEAD时，表示最新的版本。
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# 可以看到，这里将修改放回了工作区
git checkout -- readme.txt 
git status
        # On branch master
        nothing to commit, working directory clean
cat readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
# 将工作区的内容撤销了
# 提交到暂存区后，如果想撤销，就需要两步，先回退到工作区，再将工作区的修改撤销。如果只是在工作区修改了，那么只要撤销工作区的修改即可。

==============================================================================================
场景1：当你改乱了工作区某个文件的内容，想直接丢弃工作区的修改时，用命令git checkout -- file。
场景2：当你不但改乱了工作区某个文件的内容，还添加到了暂存区时，想丢弃修改，分两步，第一步用命令git reset HEAD <file>，就回到了场景1，第二步按场景1操作。
场景3：已经提交了不合适的修改到版本库时，想要撤销本次提交，使用命令"git reset --hard HEAD^ commit id"回退到上个版本或指定版本号，不过前提是没有推送到远程库。
==============================================================================================
```



#### 删除文件

```shell
1. 从git中删除文件
touch test.txt
echo "add test.txt" > test.txt
git add test.txt
git commit -m "add test.txt"
        [master 97669c9] add test.txt
         1 file changed, 1 insertion(+)
         create mode 100644 test.txt
# 添加一个新文件
rm test.txt 
git status
        # On branch master
        # Changes not staged for commit:
        #   (use "git add/rm <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       deleted:    test.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# 状态显示删除了文件
git rm test.txt
		rm 'test.txt'
# 从git版本库中删除test.txt文件，这样删除后就不能恢复了
git commit -m "remove test.txt"
        [master 1e50e5e] remove test.txt
         1 file changed, 1 deletion(-)
		 delete mode 100644 test.txt
# 提交，删除文件。现在，文件就从版本库中被删除了。

2. 在git中误删除了文件
echo "add test.txt" > test.txt
# 创建一个test.txt文件
ls
		LICENSE  readme.txt  test.txt
git add test.txt 
git commit -m "add test.txt"
        [master 83de0e9] add test.txt
         1 file changed, 1 insertion(+)
         create mode 100644 test.txt
rm -rf test.txt 
git checkout -- test.txt
# 上面不小心删除了文件，这里可以使用git checkout -- file命令将文件从版本库中恢复
ls
		LICENSE  readme.txt  test.txt
# git rm用于从版本库中删除一个文件，这样操作会删除工作区与版本库中的文件，之后也不能恢复。如果一个文件已经被提交到版本库，那么你永远不用担心误删，但是要小心，你只能恢复文件到最新版本，你会丢失最近一次提交后你修改的内容。
```



### 远程仓库

```shell
ssh-keygen -t rsa -C "abc@gmail.com"
# -t指定加密方法，-C提供一个新的注释
cat ~/.ssh/id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDc2tIjUTdNkfGKQanXQmRrxenLU54zzgjqojmiWSNpgWLR2a2/F001GBCQsj6MargtS9kbrUhjAuD6y7rGTIyVqZA+cLZs1WB3F3kq2nMhhohNJi6tdH792iyxBXy9C8pRXp5i/pD8PIv3MksGFruIeZtbwVzIIvBIByWZPX52Nro6+njQEaKRxtRwdoG1s45PMjcbWt2UiuqyOZbSvdJX+fzMiYnViLu6W61OeNvF8ySX/hniy8kJ6rfawetn0/A/8DRwHDzI/31aXNntCoF+rER3KzyUwJl4LN/4IFgfhOdmm0JzZaBiCCUS4kM/A4zi2fsUiLWupL/cEG1CtVj abc@gmail.com
将公钥添加到github
# GitHub需要识别出你推送的提交确实是你推送的，而不是别人冒充的，而Git支持SSH协议，所以，GitHub只要知道了你的公钥，就可以确认只有你自己才能推送。
git remote add origin git@github.com:ruopu89/test.git
# 关联远程仓库，远程库的名字就是origin，这是Git默认的叫法。git@github.com:ruopu89/test.git是项目的地址，在github上可以查看到
git push -u origin master
        The authenticity of host 'github.com (52.74.223.119)' can't be established.
        RSA key fingerprint is SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8.
        RSA key fingerprint is MD5:16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
        Are you sure you want to continue connecting (yes/no)? yes
        Warning: Permanently added 'github.com,52.74.223.119' (RSA) to the list of known hosts.
        Counting objects: 27, done.
        Compressing objects: 100% (21/21), done.
        Writing objects: 100% (27/27), 2.14 KiB | 0 bytes/s, done.
        Total 27 (delta 8), reused 0 (delta 0)
        remote: Resolving deltas: 100% (8/8), done.
        remote: 
        remote: Create a pull request for 'master' on GitHub by visiting:
        remote:      https://github.com/ruopu89/test/pull/new/master
        remote: 
        To git@github.com:ruopu89/test.git
         * [new branch]      master -> master
        Branch master set up to track remote branch master from origin.
# git push命令是把当前分支master推送到远程。
# 由于远程库是空的，我们第一次推送master分支时，加上了-u参数，Git不但会把本地的master分支内容推送的远程新的master分支，还会把本地的master分支和远程的master分支关联起来，在以后的推送或者拉取时就可以简化命令。
git push origin master
# 之后在本地提交后，可以把本地master分支的最新修改推送至GitHub
```



### 分支管理

> 在git中，开始只有一个master分支。HEAD严格来说不是指向提交，而是指向master，master才是指向提交的，所以，HEAD指向的就是当前分支。开始master分支是一条线，Git用master指向最新的提交，再用HEAD指向master，就能确定当前分支，以及当前分支的提交点。每次提交，master分支都会向前移动一步，这样，随着你不断提交，master分支的线也越来越长。当我们创建新的分支，例如dev时，Git新建了一个指针叫dev，指向master相同的提交，再把HEAD指向dev，就表示当前分支在dev上。从现在开始，对工作区的修改和提交就是针对dev分支了，比如新提交一次后，dev指针往前移动一步，而master指针不变。假如我们在dev上的工作完成了，就可以把dev合并到master上。Git怎么合并呢？最简单的方法，就是直接把master指向dev的当前提交，就完成了合并。合并完分支后，甚至可以删除dev分支。删除dev分支就是把dev指针给删掉，删掉后，我们就剩下了一条master分支。



#### 分支创建与提交、合并

```shell
git checkout -b dev
		Switched to a new branch 'dev'
# git checkout命令加上-b参数表示创建并切换，相当于git branch dev && git checkout dev两条命令
git branch 
        * dev
          master
# 列出所有分支，当前分支前面会标一个*号。
vim readme.txt
		...
		Creating a new branch is quick.
# 在最下方追加一行内容
git add readme.txt
git commit -m "branch test"
# 在dev分支上添加并提交
git checkout master
# 切换回master分支
cat readme.txt
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
# 在master分支上文件并没有变化。因为那个提交是在dev分支上，而master分支此刻的提交点并没有变
git merge dev
        Updating 83de0e9..39ca38a
        Fast-forward
         readme.txt | 1 +
         test.txt   | 1 -
         2 files changed, 1 insertion(+), 1 deletion(-)
         delete mode 100644 test.txt
#  合并指定分支到当前分支。上面的Fast-forward信息告诉我们，这次合并是“快进模式”，也就是直接把master指向dev的当前提交，所以合并速度非常快。但并不是总可以使用此模式
git branch -d dev 
		Deleted branch dev (was 39ca38a).
# 删除dev分支
git branch
		* master
# 再查看，只有master分支了。
```



#### 解决冲突

```shell
git checkout -b featurel
		witched to a new branch 'featurel'
# 创建并切换分支
git branch 
        * featurel
          master
# 查看现在的分支
vim readme.txt
          ...
          Creating a new branch is quick and simple.
# 在最后一行添加一些内容
git add readme.txt
# 添加到暂存区
git commit -m "and simple"
        [featurel 5119ca1] and simple
         1 file changed, 1 insertion(+), 1 deletion(-)
# 提交
git checkout master 
        Switched to branch 'master'
        Your branch is ahead of 'origin/master' by 1 commit.
          (use "git push" to publish your local commits)
# 切换到master分支，提示当前master分支比远程的master分支超前一个提交
vim readme.txt
        ...
        Creating a new branch is quick & simple.
# 修改最后一行
git add readme.txt
# 添加到暂存区
git commit -m "& simple"
        [master 91b537a] & simple
         1 file changed, 1 insertion(+), 1 deletion(-)
# 提交。现在，master分支和feature1分支各自都分别有新的提交
git merge featurel 
        Auto-merging readme.txt
        CONFLICT (content): Merge conflict in readme.txt
        Automatic merge failed; fix conflicts and then commit the result.
# 合并featurel分支到master分支。这种情况下，Git无法执行“快速合并”，只能试图把各自的修改合并起来，但这种合并可能会有冲突。Git告诉我们，readme.txt文件存在冲突，必须手动解决冲突后再提交。
git status 
        # On branch master
        # Your branch is ahead of 'origin/master' by 2 commits.
        #   (use "git push" to publish your local commits)
        #
        # You have unmerged paths.
        #   (fix conflicts and run "git commit")
        #
        # Unmerged paths:
        #   (use "git add <file>..." to mark resolution)
        #
        #       both modified:      readme.txt
        #
        no changes added to commit (use "git add" and/or "git commit -a")
# git status也可以告诉我们冲突的文件
cat readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
        <<<<<<< HEAD
        Creating a new branch is quick & simple.
        =======
        Creating a new branch is quick and simple.
        >>>>>>> featurel
# 查看文件，Git用<<<<<<<，=======，>>>>>>>标记出不同分支的内容
vim readme.txt
        ...
        Creating a new branch is quick AND simple.
# 将文件修改为一个新的样子
git add readme.txt
# 添加
git commit -m "conflict fixed"
		[master c0051d2] conflict fixed
# 解决冲突后提交
git log --graph --pretty=oneline --abbrev-commit
        *   c0051d2 conflict fixed
        |\  
        | * 5119ca1 and simple
        * | 91b537a & simple
        |/  
        * 39ca38a branch test
        * 83de0e9 add test.txt
        * 1e50e5e remove test.txt
        * 97669c9 add test.txt
        * 1ef2c96 add test.txt
        * e49d070 add of files.
        * 27975c9 git tracks changes
        * f21dbee understand how stage works
        * 9976125 append GPL
        * 5e363b3 add distributed
        * 8f5d632 wrote a readme file
# 查看日志，显示5119ca1 and simple和91b537a & simple合并成了c0051d2 conflict fixed。--graph选项可以看到分支合并图。
git branch -d featurel 
		Deleted branch featurel (was 5119ca1).
# 删除分支
# 当Git无法自动合并分支时，就必须首先解决冲突。解决冲突后，再提交，合并完成。解决冲突就是把Git合并失败的文件手动编辑为我们希望的内容，再提交。
```



#### Bug分支

```shell
# 软件开发中，bug就像家常便饭一样。有了bug就需要修复，在Git中，由于分支是如此的强大，所以，每个bug都可以通过一个新的临时分支来修复，修复后，合并分支，然后将临时分支删除。
git checkout -b dev
		Switched to a new branch 'dev'
# 创建并切换到dev分支
git branch 
        * dev
          master
# 查看分支
touch hello.txt
echo "hello" > hello.txt 
git status 
        # On branch dev
        # Untracked files:
        #   (use "git add <file>..." to include in what will be committed)
        #
        #       hello.txt
		nothing added to commit but untracked files present (use "git add" to track)
git add hello.txt
git status 
        # On branch dev
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   hello.txt
vim readme.txt 
        git is a distributed version control system.
        git is free software distributed under the GPL.
        git has a mutable index called stage.
        git tracks changes of files.
        Creating a new branch is quick AND simple.
        bug test
# 修改文件内容
git add .
git status
        # On branch dev
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   hello.txt
        #       modified:   readme.txt
# 添加并查看状态
git stash 
        Saved working directory and index state WIP on dev: c0051d2 conflict fixed
        HEAD is now at c0051d2 conflict fixed
# 因为不想提交，所以使用stash命令把当前dev分支的工作现场“储藏”起来，等以后恢复现场后继续工作
git status 
        # On branch dev
        nothing to commit, working directory clean
# 查看状态，现在工作区是干净的
git checkout master
        Switched to branch 'master'
        Your branch is ahead of 'origin/master' by 4 commits.
          (use "git push" to publish your local commits)
# 切换到master分支
git checkout -b issue
		Switched to a new branch 'issue'
# 创建并切换到issue分支
git branch 
          dev
        * issue
          master
# 查看分支
vim readme.txt 
        git is a distributed version control system.
        git is a free software distributed under the GPL.                                                                                                                
        git has a mutable index called stage.
        git tracks changes of files.
        Creating a new branch is quick AND simple.
# 修改第二行内容
git add readme.txt
git commit -m "fix bug"
        [issue 305a5d8] fix bug
         1 file changed, 1 insertion(+), 1 deletion(-)
git checkout master
        Switched to branch 'master'
        Your branch is ahead of 'origin/master' by 4 commits.
          (use "git push" to publish your local commits)
git merge --no-ff -m "merged bug fix" issue 
        Merge made by the 'recursive' strategy.
         readme.txt | 2 +-
         1 file changed, 1 insertion(+), 1 deletion(-)
# 在issue分支添加并提交修改内容，之后回到master分支，并将issue分支合并到master分支，--no-ff指的是强行关闭fast-forward方式，保留分支的commit历史
git checkout dev 
		Switched to branch 'dev'
git status 
        # On branch dev
        nothing to commit, working directory clean
# 切换回dev分支，查看工作区还是干净的
git stash list
		stash@{0}: WIP on dev: c0051d2 conflict fixed
# 查看stash list中储存了一个分支工作现场，恢复有两种方法：一是用git stash apply恢复，但是恢复后，stash内容并不删除，你需要用git stash drop来删除；另一种方式是用git stash pop，恢复的同时把stash内容也删了
git stash pop
        # On branch dev
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   hello.txt
        #
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
        Dropped refs/stash@{0} (515e010252f11e7fa154494d4717eaa66af07784)
git stash list
# 再用git stash list查看，就看不到任何stash内容了
# 你可以多次stash，恢复的时候，先用git stash list查看，然后恢复指定的stash，用命令git stash apply stash@{0}
git stash
        Saved working directory and index state WIP on dev: c0051d2 conflict fixed
        HEAD is now at c0051d2 conflict fixed
# 再次保存现场
git stash list
		stash@{0}: WIP on dev: c0051d2 conflict fixed
git stash apply stash@{0} 
        # On branch dev
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   hello.txt
        #
        # Changes not staged for commit:
        #   (use "git add <file>..." to update what will be committed)
        #   (use "git checkout -- <file>..." to discard changes in working directory)
        #
        #       modified:   readme.txt
        #
# 恢复stash@{0}的工作
git stash list
		stash@{0}: WIP on dev: c0051d2 conflict fixed
# 因为使用了git stash apply命令，所以还是可以查看到保存的工作现场
git stash drop stash@{0} 
		Dropped stash@{0} (cd2bfebbef6aed8d05fc79e91ef5d4acc883cd5a)
# 删除保存的工作现场
git stash list
# 再查看时就没有了
# 修复bug时，我们会通过创建新的bug分支进行修复，然后合并，最后删除；当手头工作没有完成时，先把工作现场git stash一下，然后去修复bug，修复后，再git stash pop，回到工作现场。
```



#### Feature分支

```shell
# 软件开发中，总有无穷无尽的新的功能要不断添加进来。添加一个新功能时，你肯定不希望因为一些实验性质的代码，把主分支搞乱了，所以，每添加一个新功能，最好新建一个feature分支，在上面开发，完成后，合并，最后，删除该feature分支。
git checkout -b feature
		Switched to a new branch 'feature'
# 创建并切换分支
echo vulcan > vulcan.txt
git add vulcan.txt
git status 
        # On branch feature
        # Changes to be committed:
        #   (use "git reset HEAD <file>..." to unstage)
        #
        #       new file:   vulcan.txt
        #
git commit -m "add feature vulcan"
        [feature f098cc4] add feature vulcan
         1 file changed, 1 insertion(+)
         create mode 100644 vulcan.txt
# 创建、添加、提交文件
git checkout dev
		Switched to branch 'dev'
git branch -d feature 
        error: The branch 'feature' is not fully merged.
        If you are sure you want to delete it, run 'git branch -D feature'.
# 这时如果使用-d选项删除刚创建的分支会提示feature分支还没有被合并，如果删除，将丢失掉修改，如果要强行删除，需要使用大写的-D参数
git branch -D feature  
		Deleted branch feature (was f098cc4).
# 使用-D选项强行删除分支成功。
```



#### 多人协作

```shell
git remote
		origin
# 当你从远程仓库克隆时，实际上Git自动把本地的master分支和远程的master分支对应起来了，并且，远程仓库的默认名称是origin
===========================================================================================
多人协作的工作模式通常是这样：

1. 首先，可以试图用git push origin <branch-name>推送自己的修改；
2. 如果推送失败，则因为远程分支比你本地的内容更新，需要先用git pull试图合并；
3. 如果合并有冲突，则解决冲突，并在本地提交；
4. 没有冲突或者解决掉冲突后，再用git push origin <branch-name>推送就能成功！
5. 如果git pull提示no tracking information，则说明本地分支和远程分支的链接关系没有创建，用命令git branch --set-upstream-to <branch-name> origin/<branch-name>。
===========================================================================================
git remote -v
        origin  git@github.com:ruopu89/test.git (fetch)
        origin  git@github.com:ruopu89/test.git (push)
# 用git remote -v显示更详细的信息
git push origin master 
        Warning: Permanently added the RSA host key for IP address '13.250.177.223' to the list of known hosts.
        Counting objects: 18, done.
        Compressing objects: 100% (16/16), done.
        Writing objects: 100% (16/16), 1.38 KiB | 0 bytes/s, done.
        Total 16 (delta 7), reused 0 (delta 0)
        remote: Resolving deltas: 100% (7/7), completed with 1 local object.
        To git@github.com:ruopu89/test.git
           83de0e9..5f4464a  master -> master
# 推送本地的master分支到远程的origin中，创建一个叫master的分支
git push origin dev 
        Counting objects: 9, done.
        Compressing objects: 100% (5/5), done.
        Writing objects: 100% (7/7), 554 bytes | 0 bytes/s, done.
        Total 7 (delta 2), reused 0 (delta 0)
        remote: Resolving deltas: 100% (2/2), completed with 1 local object.
        remote: 
        remote: Create a pull request for 'dev' on GitHub by visiting:
        remote:      https://github.com/ruopu89/test/pull/new/dev
        remote: 
        To git@github.com:ruopu89/test.git
         * [new branch]      dev -> dev
# 推送本地的dev分支到远程的origin上，创建一个叫dev的分支。这样远程就有了两个分支，一个master，一个dev
mkdir learngit2
cd learngit2
git clone git@github.com:ruopu89/test.git
        Cloning into 'test'...
        Warning: Permanently added the RSA host key for IP address '13.229.188.59' to the list of known hosts.
        remote: Enumerating objects: 50, done.
        remote: Counting objects: 100% (50/50), done.
        remote: Compressing objects: 100% (25/25), done.
        remote: Total 50 (delta 17), reused 50 (delta 17), pack-reused 0
        Receiving objects: 100% (50/50), done.
        Resolving deltas: 100% (17/17), done.
cd test/
# 进入克隆下来的目录
ls -a
        .  ..  .git  LICENSE  readme.txt
# 查看master分支中的文件
git branch 
		* master
# 查看现在的分支是master
git checkout -b dev origin/dev 
        Branch dev set up to track remote branch dev from origin.
        Switched to a new branch 'dev'
# 创建远程origin的dev分支到本地
git branch 
        * dev
          master
ls
hello.txt  LICENSE  readme.txt
# dev分支中的文件
echo env > env.txt
# 在dev分支中创建文件
git add env.txt
git commit -m "add env"
        [dev afff0e7] add env
         1 file changed, 1 insertion(+)
         create mode 100644 env.txt
git push origin dev 
        Counting objects: 4, done.
        Compressing objects: 100% (2/2), done.
        Writing objects: 100% (3/3), 329 bytes | 0 bytes/s, done.
        Total 3 (delta 0), reused 0 (delta 0)
        To git@github.com:ruopu89/test.git
           a285424..afff0e7  dev -> dev
# 推送到远程的dev分支中
cd ../learngit
# 到之前的目录
ls
		hello.txt  LICENSE  readme.txt
# 这里并没有env文件
git branch 
        * dev
          issue
          master
 # 现在也在dev分支上
cp ../learngit2/test/env.txt ./
# 将克隆下来的目录中的env.txt文件复制到当前目录中
ls
		env.txt  hello.txt  LICENSE  readme.txt
echo abc >> env.txt 
# 修改env.txt文件
git add env.txt
git commit -m "add new env"
        [dev c997d7c] add new env
         1 file changed, 2 insertions(+)
         create mode 100644 env.txt
git push origin dev 
        To git@github.com:ruopu89/test.git
         ! [rejected]        dev -> dev (fetch first)
        error: failed to push some refs to 'git@github.com:ruopu89/test.git'
        hint: Updates were rejected because the remote contains work that you do
        hint: not have locally. This is usually caused by another repository pushing
        hint: to the same ref. You may want to first merge the remote changes (e.g.,
        hint: 'git pull') before pushing again.
        hint: See the 'Note about fast-forwards' in 'git push --help' for details.
# 推送失败。因为刚才最新提交和你试图推送的提交有冲突，解决办法也很简单，Git已经提示我们，先用git pull把最新的提交从origin/dev抓下来，然后，在本地合并，解决冲突，再推送
git pull 
        remote: Enumerating objects: 4, done.
        remote: Counting objects: 100% (4/4), done.
        remote: Compressing objects: 100% (2/2), done.
        remote: Total 3 (delta 0), reused 3 (delta 0), pack-reused 0
        Unpacking objects: 100% (3/3), done.
        From github.com:ruopu89/test
           a285424..afff0e7  dev        -> origin/dev
        There is no tracking information for the current branch.
        Please specify which branch you want to merge with.
        See git-pull(1) for details

            git pull <remote> <branch>

        If you wish to set tracking information for this branch you can do so with:

            git branch --set-upstream-to=origin/<branch> dev
# git pull也失败了，有两种方法解决。一是git pull 远程地址/分支，二是git branch --set-upstream-to=origin/<branch> dev
git pull git@github.com:ruopu89/test.git dev
        From github.com:ruopu89/test
         * branch            dev        -> FETCH_HEAD
        Auto-merging env.txt
        CONFLICT (add/add): Merge conflict in env.txt
        Automatic merge failed; fix conflicts and then commit the result.
# 使用第一种方法pull下来文件
git branch --set-upstream-to=origin/dev dev
		Branch dev set up to track remote branch dev from origin.
git pull
        U       env.txt
        Pull is not possible because you have unmerged files.
        Please, fix them up in the work tree, and then use 'git add/rm <file>'
        as appropriate to mark resolution, or use 'git commit -a'.
# 使用第二种方法pull文件，只是提示不能合并文件，因为上面已经拉过一次了
vim env.txt 
        env                                                                                                                                                              
        abc
git add env.txt
git commit -m "fix env"
		[dev 59a0059] fix env
git push origin dev
        Counting objects: 7, done.
        Compressing objects: 100% (3/3), done.
        Writing objects: 100% (4/4), 451 bytes | 0 bytes/s, done.
        Total 4 (delta 1), reused 0 (delta 0)
        remote: Resolving deltas: 100% (1/1), done.
        To git@github.com:ruopu89/test.git
           afff0e7..59a0059  dev -> dev  
# 修改文件后再添加、提交、推送就没问题了。
```



#### 变基

```shell
git log --graph --pretty=oneline --abbrev-commit 
        *   59a0059 fix env
        |\  
        | * afff0e7 add env
        * | c997d7c add new env
        |/  
        * a285424 test2
        * 15e9ec8 test1
        *   c0051d2 conflict fixed
        |\  
        | * 5119ca1 and simple
        * | 91b537a & simple
        |/  
        * 39ca38a branch test
# --graph表示查看分支合并图；--pretty=oneline表示将信息在一行显示；--abbrev-commit表示仅显示SHA-1的前几个字符，而非全部字符（这个SHA-1字符就是指的校验和）
# Git用(HEAD -> master)和(origin/master)标识出当前分支的HEAD和远程origin的位置
git rebase
# rebase操作的特点：把分叉的提交历史“整理”成一条直线，看上去更直观。缺点是本地的分叉提交已经被修改过了。
# rebase操作可以把本地未push的分叉提交历史整理成直线；rebase的目的是使得我们在查看历史提交的变化时更容易，因为分叉的提交需要三方对比。
```



### 标签管理

```shell
发布一个版本时，我们通常先在版本库中打一个标签（tag），这样，就唯一确定了打标签时刻的版本。将来无论什么时候，取某个标签的版本，就是把那个打标签的时刻的历史版本取出来。所以，标签也是版本库的一个快照。
Git的标签虽然是版本库的快照，但其实它就是指向某个commit的指针（跟分支很像对不对？但是分支可以移动，标签不能移动），所以，创建和删除标签都是瞬间完成的。
git tag v1.0
# 打标签，默认标签是打在最新提交的commit上的
git tag 
		v1.0
# 查看标签
git log --pretty=oneline --abbrev-commit 
        59a0059 fix env
        c997d7c add new env
        afff0e7 add env
        a285424 test2
        15e9ec8 test1
# 查看日志
git tag v1.1 c997d7c
# 给指定的提交打标签
git tag 
        v1.0
        v1.1
git show v1.1
        commit c997d7c8f10561e1176ff24c7dd6f3c6468c467f
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Tue Dec 11 15:59:14 2018 +0800

            add new env

        diff --git a/env.txt b/env.txt
        new file mode 100644
        index 0000000..f981a8f
        --- /dev/null
        +++ b/env.txt
        @@ -0,0 +1,2 @@
        +env
        +abc        
# 查看标签打在哪个提交上了
git tag -a v1.2 -m "test" afff0e7
# 使用-a选项指定标签名，-m指定说明文字。-a选项在要添加说明信息时使用
git show v1.2
        tag v1.2
        Tagger: ruopu89 <ruopu1989@hotmail.com>
        Date:   Tue Dec 11 16:33:49 2018 +0800

        test

        commit afff0e76e4e904da31f58bd046667eaac3ce5d5f
        Author: ruopu89 <ruopu1989@hotmail.com>
        Date:   Tue Dec 11 15:56:21 2018 +0800

            add env

        diff --git a/env.txt b/env.txt
        new file mode 100644
        index 0000000..0a764a4
        --- /dev/null
        +++ b/env.txt
        @@ -0,0 +1 @@
        +env
git tag -d v1.2
		Deleted tag 'v1.2' (was 5c1f2b9)   
# 删除标签
git push origin v1.1
        Total 0 (delta 0), reused 0 (delta 0)
        To git@github.com:ruopu89/test.git
         * [new tag]         v1.1 -> v1.1
# 推送标签到远程
git push origin --tags 
        Total 0 (delta 0), reused 0 (delta 0)
        To git@github.com:ruopu89/test.git
         * [new tag]         v1.0 -> v1.0
# 一次性推送全部尚未推送到远程的本地标签
git push origin :refs/tags/v1.1
        To git@github.com:ruopu89/test.git
         - [deleted]         v1.1
# 从远程删除。 :refs/tags/v1.1是标签在.git目录中的路径
```



### 查看配置信息

```shell
# config配置有system(系统级别)、global(用户级别)和local(当前仓库)三种级别，生效级别为local->global->system
git config --system --list
# 查看系统config
git config --global --list
# 查看当前用户（global）配置
git config --local --list
# 查看当前仓库配置信息
```



### 忽略特殊文件

```shell
创建.gitignore文件可以忽略不想上传的文件，.gitignore文件不需要从头创建，可在https://github.com/github/gitignore下载。
忽略文件的原则是：
1. 忽略操作系统自动生成的文件，比如缩略图等；
2. 忽略编译生成的中间文件、可执行文件等，也就是如果一个文件是通过另一个文件自动生成的，那自动生成的文件就没必要放进版本库，比如Java编译产生的.class文件；
3. 忽略你自己的带有敏感信息的配置文件，比如存放口令的配置文件。
git add -f abc.txt
# 使用-f选项可以强制添加文件
```



### github个人博客多电脑使用

```shell
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
给源文件目录初始化git，虽然目录中已有内容，但这也不会报错的
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
```



### 问题解决

```shell
* 克隆远程分支
git clone -b dev https://git.oschina.net/oschina/android-app.git
# 使用-b选项指定远程分支的名称，这里叫dev
```

