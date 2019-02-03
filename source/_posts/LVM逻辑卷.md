---
title: LVM逻辑卷
date: 2018-10-08 09:29:42
tags: 磁盘
categories: 基础
---

# 概念

* MD：在內核中它的所有調配工作由md這個模塊來完成，進而能實現將多個物理設備組合成一個邏輯設備或叫元設備（meta device）。主要用來實現軟RAID： /dev/md#

* DM：Device Mapper 設備映射；這種機制也能夠提供將多個物理設備映射成一個邏輯設備，功能比MD強大；由多個子模塊組成，完成多種不同的組織方式。

  ​              可提供軟RAID，LVM2功能

* 快照功能：保留數據在你做快照那一刻的狀態，快照一般小於原數據，它只是訪問同一個數據的另一條路徑，與文件軟鏈接相似，默認訪問只有一個路徑，快照是另一條路徑，又不僅限於路徑，它也可以作爲用戶去訪問對應磁盤上它所映射文件的通路。將快照那一刻的狀態保留下來作爲文件的訪問通道，被快照的文件被修改時，先保存一份快照，訪問時看數據是否改變，如果改變就訪問快照裏的數據，沒改變就訪問原數據，所以快照文件很小。快照裏只有一些改變的數據。主要是用來做數據備份的

  ​       多路徑功能：讓我們實現數據存儲設備的尋路，能通過多种不同的線來完成

  <img src="/images/LVM/快照1.jpeg"/>

  > 左圖為最初的 LV 磁盘快照區的狀況，LVM 會預留一個區域 (左圖的左側三個 PE 區塊) 作為資料存放處。 此時快照區內並沒有任何資料，而快照區與系統區共享所有的 PE 資料， 因此你會看到快照區的內容與檔案系統是一模一樣的。 等到系統運作一陣子後，假設 A 區域的資料被变動了 (上面右圖所示)，則变動前系統會將該區域的資料移動到快照區， 所以在右圖的快照區被佔用了一塊 PE 成為 A，而其他 B 到 I 的區塊則還是與檔案系統共用

* LVM 的全名是 Logical Volume Manager，中文可以翻译作逻辑卷轴管理员。LVM 的作用是将几个实体磁盘 通过软件组合成为一块看起来是独立的大磁盘(VG) ，然后将这块大磁盘再经过分割，成为可使用的分割槽 (LV)， 最终就能够挂载使用了。这样的系统可以进行文件通讯员的扩充或缩小与一个称为 PE 的项目有关。 LVM的作用：邏輯設備動態增減

* PV：Physical Volume，实体卷轴。磁盘需要调整系统识别码为8e，然后经过pvcreate命令转为LVM最底层的实体卷轴（PV）

* VG：Volume Group，卷轴组。LVM的大磁盘就是将许多PV整合成一个VG。每个VG最多仅能包含65534个PE，如果使用LVM的默认参数，则一个VG最大可达256GB容量。

* PE：Physical Extend，实体延伸区块。LVM默认使用4MB的PE区块，而LVM的VG最多可以含有65534个PE，因此默认的VG容量是256GB。这个PE是整个LVM最小的储存区块，我们的文件资料都是由写入PE来处理的。调整PE的大小会影响到VG的最大容量。

* LV：Logical Volume，逻辑卷轴。VG最终会被切成LV，这个LV就是最后可以被格式化使用的分区。LV的名称通常为/dev/vgname/lvname。LVM的文件系统容量变更是通过交换PE来进行文件转换的，将原来LV内的PE转移到其他装置中就可以降低LV容量，或将其他装置的PE加到此LV中就可以加大容量。

* 操作流程

<img src="/images/LVM/操作流程.gif"/>

* 线性模式 (linear)：假如我将 /dev/hda1, /dev/hdb1 这两个 partition 加入到 VG 当中，并且整个 VG 只有一个 LV 时，那么所谓的线性模式就是：当 /dev/hda1 的容量用完之后，/dev/hdb1 的硬碟才会被使用到， 这也是我们所建议的模式。

* 交错模式 (triped)：那什么是交错模式？很简单啊，就是我将一笔资料拆成两部分，分别写入 /dev/hda1 与 /dev/hdb1 的意思，感觉上有点像 RAID 0 啦！如此一来，一份资料用两颗硬碟来写入，理论上，读写的效能会比较好。

  基本上，LVM 最主要的用处是在实现一个可以弹性调整容量的文件系统上， 而不是在建立一个效能为主的磁盘上，所以，我们应该利用的是 LVM 可以弹性管理整个 partition 大小的用途上，而不是着眼在效能上的。因此， LVM 预设的读写模式是线性模式。 如果你使用 triped 模式，要注意，当任何一个 partition 损坏时，所有的资料都会‘损毁’的。

* 在增減邏輯卷大小的時候要用到物理邊界，邏輯邊界的概念，物理邊界指磁盤的大小，邏輯邊界指文件系統的大小。創建分區的過程就是創建物理邊界的過程，在物理邊界內部創建文件系統，文件存儲在文件系統上，文件系統邊界叫邏輯邊界，存多少數據取決於物理邊界大小與邏輯邊界大小，邏輯邊界是緊靠在物理邊界大小上創建的。所以擴展時要先擴展物理邊界，然後再擴展邏輯邊界，如果縮減就相反，先縮減文件系統邊界，再縮減物理邊界。

* 對卷創建快照指給邏輯卷創建快照，但快照卷必須與邏輯卷在同一個卷組中

# 命令

```shell
* pv
pvcreate：#将实体 partition 建立成为 PV 
pvremove：#将 PV 属性移除，让该 partition 不具有 PV 属性。刪除PV中的原數據
pvscan：#搜寻目前系统里面任何具有 PV 的磁碟
pvdisplay：#显示出目前系统上面的 PV 状态
pvmove：#移動PV中的數據到其他PV上，就可以拆掉這個磁盤了。

* vg
vgcreate：#创建VG
	vgcreate [-s N[mgt]] VG名称 PV名称选项与参数：
	#-s ：后面接 PE 的大小 (size) ，单位可以是 m, g, t (大小写均可)。默認為4MB
vgremove：#删除一个VG
vgscan：#搜寻系统上面是否有VG存在
vgextend：#在VG内擴展额外的PV
vgreduce：#在VG内移除PV
vgs：#搜寻VG，简单输出
vgdisplay：#显示目前系统上面的VG状态
vgchange:#设定 VG 是否启动 (active)；      

* lv
lvcreate：#创建LV
	lvcreate [-L N[mgt]] [-n LV名称] VG名称
	lvcreate [-l N] [-n LV名称] VG名称选项与参数：
	#-L  ：后面接容量，容量的单位可以是 M,G,T 等，要注意的是，最小单位为 PE，因此这个数量必须要是 PE 的倍数，若不相符，系统会自行计算最相近的容量。
	#-l  ：后面可以接 PE 的‘个数’，而不是容量。若要这么做，得要自行计算 PE 数。
	#-n  ：后面接的就是 LV 的名称
lvremove：#删除LV
lvextend：#在LV里面增加容量
lvreduce：#在LV里面减少容量
lvresize：#对LV进行容量大小的调整
lvs
lvdisplay：#显示系统上面的LV状态
       
* 擴展邏輯卷
	lvextend
		-L [+]n /PATH/TO/LV            
		#擴展物理邊界，有加號表示要再擴展多大，不用加號表示擴展到多大
	resize2fs
	resize2fs /PATH/TO/LV n  
	#擴展邏輯邊界，這裏只能指定擴展到多大，最大不能超過物理邊界。因爲是ext文件系統，其他文件系統不一定要這樣用，或用其他命令。
		-p：不用指定擴展多少，能有多大擴多大
	resize2fs -p /PATH/TO/LV       
               
* 縮減邏輯卷
	resize2fs
	resize2fs [-f] [device] [size]选项与参数：
	#-f      ：强制进行 resize 的动作！
	#[device]：装置的档案名称；
	#[size]  ：可以加也可以不加。如果加上 size 的话，那么就必须要给予一个单位，譬如 M, G 等等。如果没有 size 的话，那么预设使用‘整个 partition’的容量来处理！  
	#縮減邏輯邊界 
	#不能在線縮減，要先卸載，確保縮減後的空間大小依然能存儲原有的所有數據；在縮減前應該先強行檢查文件，以確保文件系統處於一至性狀態
 
	lvreduce -L [-]# /PATH/TO/LV       
	#縮減物理邊界

* 快照卷
1. 生命周期為整個數據時長，在這段時長內，數據的增長量不能超出快照卷大小；大小自己估計，         保險的辦法是和原卷一樣大，或與原卷中數據一樣大
2. 快照卷應該是只讀的
3. 跟原卷在同一卷組內
 
lvcreate
	-s: #指定為快照卷
	-P r|w: #設定是只讀還是讀寫權限，建議爲只讀
 
	lvcreate -L n -n SLV_NAME -s -p r /PATH/TO/LV
	#-L指定大小，-n指定快照卷名稱，最後指定對哪個邏輯卷創建
```



# 测试

## 创建LVM卷

```shell
* 准备分区
fdisk /dev/sdb
#分出四个分区，并将分区system ID改为8e。
partprobe /dev/sdb
fdisk -l
#四个分区的system都应该是Linux LVM，改为8及机是为了使LVM的侦测指令可以侦测到partition。不改也可以进行LVM创建。
* PV
[root@bogon ~]# pvcreate /dev/sdb{1,2,3,5}
  Physical volume "/dev/sdb1" successfully created.
  Physical volume "/dev/sdb2" successfully created.
  Physical volume "/dev/sdb3" successfully created.
  Physical volume "/dev/sdb5" successfully created.
[root@bogon ~]# pvscan 
  PV /dev/sda2   VG centos          lvm2 [<31.00 GiB / 4.00 MiB free]
  PV /dev/sdb1                      lvm2 [1.00 GiB]
  PV /dev/sdb3                      lvm2 [1.00 GiB]
  PV /dev/sdb2                      lvm2 [1.00 GiB]
  PV /dev/sdb5                      lvm2 [<9.00 GiB]
  Total: 5 [42.99 GiB] / in use: 1 [<31.00 GiB] / in no VG: 4 [<12.00 GiB]
#这里分别显示每个PV的信息与系统所有PV的信息。最后一行显示的是：整体PV的量/已经被使用的VG的PV量/剩余的PV量
[root@bogon ~]# pvdisplay 
  --- Physical volume ---
  PV Name               /dev/sda2
  #实际的 partition 装置名称
  VG Name               centos
  #分配到哪个VG的名称
  PV Size               <31.00 GiB / not usable 3.00 MiB
  #容量说明
  Allocatable           yes
  #是否已被分配出去，已分配就是yes，否则是NO。
  PE Size               4.00 MiB
  #在此PV内的PE的大小
  Total PE              7935
  #共有几个PE
  Free PE               1
  #未被LV用掉的PE
  Allocated PE          7934
  #还可分配出去的PE的数量
  PV UUID               4jHxbK-P3Py-rV7o-3o1l-fOQc-LhY0-lvFtJv
  
   
  "/dev/sdb1" is a new physical volume of "1.00 GiB"
  --- NEW Physical volume ---
  PV Name               /dev/sdb1
  VG Name               
  #因为没有分配到VG，所以这里是空白
  PV Size               1.00 GiB
  Allocatable           NO
  PE Size               0   
  Total PE              0
  Free PE               0
  Allocated PE          0
  PV UUID               totx56-SkbA-AXtb-gpUS-MGW2-1rdZ-XTrUQn
  ......
#由于PE是在建立VG时才给予的参数，因此在这里看到的PV里头的PE都是0，而且也没有多余的PE可供分配

* VG
[root@bogon ~]# vgcreate -s 16M ruopuvg /dev/sdb{1,2,3}
  Volume group "ruopuvg" successfully created
[root@bogon ~]# vgscan 
  Reading volume groups from cache.
  Found volume group "ruopuvg" using metadata type lvm2
  Found volume group "centos" using metadata type lvm2
[root@bogon ~]# pvscan
  PV /dev/sdb1   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb2   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb3   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda2   VG centos          lvm2 [<31.00 GiB / 4.00 MiB free]
  PV /dev/sdb5                      lvm2 [<9.00 GiB]
  Total: 5 [<42.95 GiB] / in use: 4 [<33.95 GiB] / in no VG: 1 [<9.00 GiB]
#显示有三个PV被用了，sdb5没被用。
[root@bogon ~]# vgdisplay 
  --- Volume group ---
  VG Name               ruopuvg
  System ID             
  Format                lvm2
  Metadata Areas        3
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                0
  Open LV               0
  Max PV                0
  Cur PV                3
  Act PV                3
  VG Size               2.95 GiB
  #整体的VG容量大小
  PE Size               16.00 MiB
  #PE的大小
  Total PE              189
  #PE的整体数量
  Alloc PE / Size       0 / 0   
  Free  PE / Size       189 / 2.95 GiB
  VG UUID               DAWGEA-EGjX-tsd0-DHoL-2MOq-R4SV-VaTHcT
#最后三行指PE能够使用的情况，由于还未创建LV，所以所有的PE均可自由使用。
[root@bogon ~]# vgextend ruopuvg /dev/sdb5
  Volume group "ruopuvg" successfully extended
#将sdb5加入到刚创建的VG中  

* LV
[root@bogon ~]# lvcreate -l 100 -n ruopulv ruopuvg
  Logical volume "ruopulv" created.
#分配100个PE给这个LV，也可以用lvcreate -L 2G -n ruopulv ruopuvg来创建LV
[root@bogon ~]# ll /dev/ruopuvg/ruopulv 
lrwxrwxrwx. 1 root root 7 Oct  9 11:39 /dev/ruopuvg/ruopulv -> ../dm-2
[root@bogon ~]# lvdisplay 
  --- Logical volume ---
  LV Path                /dev/ruopuvg/ruopulv
  LV Name                ruopulv
  #LV的名称
  VG Name                ruopuvg
  LV UUID                7Nxeng-bsdp-i3OA-ckl2-0YiQ-TOKi-Ng03JH
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-09 11:39:05 +0800
  LV Status              available
  # open                 0
  LV Size                1.56 GiB
  #LV的容量
  Current LE             100
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2

* 格式化与使用
[root@bogon ~]# mkfs.ext4 /dev/ruopuvg/ruopulv 
mke2fs 1.42.9 (28-Dec-2013)
Discarding device blocks: done                            
Filesystem label=
OS type: Linux
Block size=4096 (log=2)
Fragment size=4096 (log=2)
Stride=0 blocks, Stripe width=0 blocks
102544 inodes, 409600 blocks
20480 blocks (5.00%) reserved for the super user
First data block=0
Maximum filesystem blocks=419430400
13 block groups
32768 blocks per group, 32768 fragments per group
7888 inodes per group
Superblock backups stored on blocks: 
	32768, 98304, 163840, 229376, 294912

Allocating group tables: done                            
Writing inode tables: done                            
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done 
#格式化LV
[root@bogon ~]# mount /dev/ruopuvg/ruopulv /mnt
#挂载
```

## 扩容

```shell
[root@bogon ~]# fdisk /dev/sdc
#新加一块硬盘，创建两个新分区，system ID改为8e
[root@bogon ~]# partprobe /dev/sdc
pvcreate /dev/sdc1
[root@bogon ~]# pvcreate /dev/sdc1
  Physical volume "/dev/sdc1" successfully created.
[root@bogon ~]# pvscan 
  PV /dev/sdb1   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb2   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb3   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb5   VG ruopuvg         lvm2 [8.98 GiB / 7.42 GiB free]
  PV /dev/sda2   VG centos          lvm2 [<31.00 GiB / 4.00 MiB free]
  PV /dev/sdc1                      lvm2 [1.00 GiB]
  Total: 6 [43.93 GiB] / in use: 5 [42.93 GiB] / in no VG: 1 [1.00 GiB]

* 加大VG
[root@bogon ~]# vgextend ruopuvg /dev/sdc1
  Volume group "ruopuvg" successfully extended
[root@bogon ~]# vgdisplay 
  --- Volume group ---
  VG Name               ruopuvg
  System ID             
  Format                lvm2
  Metadata Areas        5
  Metadata Sequence No  4
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                5
  Act PV                5
  VG Size               12.92 GiB
  PE Size               16.00 MiB
  Total PE              827
  Alloc PE / Size       100 / 1.56 GiB
  Free  PE / Size       727 / <11.36 GiB
  VG UUID               DAWGEA-EGjX-tsd0-DHoL-2MOq-R4SV-VaTHcT
#整体的VG变大了，PE的数量也增加了

* 加大LV
[root@bogon ~]# lvresize -l +100 /dev/ruopuvg/ruopulv 
  Size of logical volume ruopuvg/ruopulv changed from 1.56 GiB (100 extents) to 3.12 GiB (200 extents).
  Logical volume ruopuvg/ruopulv successfully resized.
#给LV再增加100个PE，也可以使用-L选项
[root@bogon ~]# lvdisplay 
  --- Logical volume ---
  LV Path                /dev/ruopuvg/ruopulv
  LV Name                ruopulv
  VG Name                ruopuvg
  LV UUID                7Nxeng-bsdp-i3OA-ckl2-0YiQ-TOKi-Ng03JH
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-09 11:39:05 +0800
  LV Status              available
  # open                 1
  LV Size                3.12 GiB
  Current LE             200
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2
[root@bogon ~]# df -h /mnt
Filesystem                   Size  Used Avail Use% Mounted on
/dev/mapper/ruopuvg-ruopulv  1.6G   38M  1.4G   3% /mnt
#虽然增加了LV的容量，但实际中，LV挂载的分区并未变大
[root@bogon ~]# dumpe2fs /dev/ruopuvg/ruopulv 
dumpe2fs 1.42.9 (28-Dec-2013)
......
Block count:              409600
#这个文件系统的block总数
......
Blocks per group:         32768
#多少个block设定成为一个block group
[root@bogon ~]# resize2fs /dev/ruopuvg/ruopulv 
resize2fs 1.42.9 (28-Dec-2013)
Filesystem at /dev/ruopuvg/ruopulv is mounted on /mnt; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 1
The filesystem on /dev/ruopuvg/ruopulv is now 819200 blocks long.
#这里使用整个lvresize命令扩容进来的空间，也可以用size来指定扩容多少空间
[root@bogon ~]# df -h /mnt
Filesystem                   Size  Used Avail Use% Mounted on
/dev/mapper/ruopuvg-ruopulv  3.1G   38M  2.9G   2% /mnt
#使用resize2fs命令后，LV才会真正扩容
[root@bogon ~]# ll /mnt
total 20
drwxr-xr-x. 80 root root  4096 Oct  9 11:45 etc
drwx------.  2 root root 16384 Oct  9 11:44 lost+found
#之前复制进去的/etc目录还存在。这样就实现了热扩容

root@ruopu:~# lvextend -r -l +100%free /dev/ubuntu-vg/ubuntu-lv
# 使用-r选项可以使扩容的空间当时生效，无需再使用resize2fs命令，使用-l表示指定逻辑卷的LE数，-L表示指定逻辑卷的大小，单位为“kKmMgGtT”字节。+100%free表示将所有空余空间都加进来，只能使用-l选项指定。
root@ruopu:~# lvextend -r -L 19G /dev/ubuntu-vg/ubuntu-lv
```

## 缩减

```shell
[root@bogon ~]# resize2fs /dev/ruopuvg/ruopulv 1500M
resize2fs 1.42.9 (28-Dec-2013)
Filesystem at /dev/ruopuvg/ruopulv is mounted on /mnt; on-line resizing required
resize2fs: On-line shrinking not supported
#resize2fs命令不能使用小数点，如1.5G，所以这里改为1500M，也就是将LV空间缩减为1500M。另外，使用此命令进行缩减时不能在LV已挂载的情况下做。
[root@bogon ~]# umount /mnt
[root@bogon ~]# resize2fs /dev/ruopuvg/ruopulv 1500M
resize2fs 1.42.9 (28-Dec-2013)
Please run 'e2fsck -f /dev/ruopuvg/ruopulv' first.
#系统要求我们先进行磁盘检查
[root@bogon ~]# e2fsck -f /dev/ruopuvg/ruopulv 
e2fsck 1.42.9 (28-Dec-2013)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
/dev/ruopuvg/ruopulv: 2467/197200 files (0.2% non-contiguous), 30101/819200 blocks
[root@bogon ~]# resize2fs /dev/ruopuvg/ruopulv 1500M
resize2fs 1.42.9 (28-Dec-2013)
Resizing the filesystem on /dev/ruopuvg/ruopulv to 384000 (4k) blocks.
The filesystem on /dev/ruopuvg/ruopulv is now 384000 blocks long.
[root@bogon ~]# mount /dev/ruopuvg/ruopulv /mnt
[root@bogon ~]# df -h /mnt
Filesystem                   Size  Used Avail Use% Mounted on
/dev/mapper/ruopuvg-ruopulv  1.5G   38M  1.3G   3% /mnt
#这样就缩减成功了
[root@bogon ~]# lvdisplay 
  --- Logical volume ---
  LV Path                /dev/ruopuvg/ruopulv
  LV Name                ruopulv
  VG Name                ruopuvg
  LV UUID                7Nxeng-bsdp-i3OA-ckl2-0YiQ-TOKi-Ng03JH
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-09 11:39:05 +0800
  LV Status              available
  # open                 1
  LV Size                3.12 GiB
  Current LE             200
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2
#但此时LV并没有缩减
[root@bogon ~]# lvresize -L -1.6G /dev/ruopuvg/ruopulv 
  Rounding size to boundary between physical extents: 1.59 GiB.
  WARNING: Reducing active and open logical volume to 1.53 GiB.
  THIS MAY DESTROY YOUR DATA (filesystem etc.)
Do you really want to reduce ruopuvg/ruopulv? [y/n]: y
  Size of logical volume ruopuvg/ruopulv changed from 3.12 GiB (200 extents) to 1.53 GiB (98 extents).
  Logical volume ruopuvg/ruopulv successfully resized.
#这里将LV缩减1.6G
[root@bogon ~]# lvdisplay 
  --- Logical volume ---
  LV Path                /dev/ruopuvg/ruopulv
  LV Name                ruopulv
  VG Name                ruopuvg
  LV UUID                7Nxeng-bsdp-i3OA-ckl2-0YiQ-TOKi-Ng03JH
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-09 11:39:05 +0800
  LV Status              available
  # open                 1
  LV Size                1.53 GiB
  Current LE             98
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2
#这样LV也缩减完成了。
[root@bogon ~]# pvdisplay 
  --- Physical volume ---
  PV Name               /dev/sdb1
  VG Name               ruopuvg
  PV Size               1.00 GiB / not usable 16.00 MiB
  Allocatable           yes 
  PE Size               16.00 MiB
  Total PE              63
  Free PE               63
  Allocated PE          0
  PV UUID               totx56-SkbA-AXtb-gpUS-MGW2-1rdZ-XTrUQn
   
  --- Physical volume ---
  PV Name               /dev/sdb2
  VG Name               ruopuvg
  PV Size               1.00 GiB / not usable 16.00 MiB
  Allocatable           yes 
  PE Size               16.00 MiB
  Total PE              63
  Free PE               63
  Allocated PE          0
  PV UUID               zL5fa0-hfxX-zfnH-VAGf-Eu09-2uoz-ZNFj12
   
  --- Physical volume ---
  PV Name               /dev/sdb3
  VG Name               ruopuvg
  PV Size               1.00 GiB / not usable 16.00 MiB
  Allocatable           yes 
  PE Size               16.00 MiB
  Total PE              63
  Free PE               63
  Allocated PE          0
  PV UUID               ljRtmq-e75k-xz00-SJkC-W569-1Ge7-9quZB7
   
  --- Physical volume ---
  PV Name               /dev/sdb5
  VG Name               ruopuvg
  PV Size               <9.00 GiB / not usable 14.00 MiB
  Allocatable           yes 
  PE Size               16.00 MiB
  Total PE              575
  Free PE               477
  Allocated PE          98
  PV UUID               CJgQ6x-4oRB-WD3i-bKaf-jRdB-Sz93-Xeoqpm
   
  --- Physical volume ---
  PV Name               /dev/sdc1
  VG Name               ruopuvg
  PV Size               1.00 GiB / not usable 16.00 MiB
  Allocatable           yes 
  PE Size               16.00 MiB
  Total PE              63
  Free PE               63
  Allocated PE          0
  PV UUID               lIAqor-XGnw-PTYo-L6yY-ld6y-AeNz-41imsu
  #可以看到，sdb1,sdb2,sdb3,sdc1的PE都是空闲的了
  [root@bogon ~]# pvmove /dev/sdb5 /dev/sdb1
  Insufficient free space: 98 extents needed, but only 63 available
  Unable to allocate mirror extents for ruopuvg/pvmove0.
  Failed to convert pvmove LV to mirrored
  #如果要转移PE，可以使用此命令，但这里因为一共有98个PE要转移，而sdb1上只有63个PE而无法完成转移
  [root@bogon ~]# pvscan 
  PV /dev/sdb1   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb2   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb3   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb5   VG ruopuvg         lvm2 [8.98 GiB / 7.45 GiB free]
  PV /dev/sdc1   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda2   VG centos          lvm2 [<31.00 GiB / 4.00 MiB free]
  Total: 6 [<43.92 GiB] / in use: 6 [<43.92 GiB] / in no VG: 0 [0   ]
[root@bogon ~]# vgreduce ruopuvg /dev/sdb1
  Removed "/dev/sdb1" from volume group "ruopuvg"
#将分区从VG中移除
[root@bogon ~]# pvscan 
  PV /dev/sdb2   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb3   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sdb5   VG ruopuvg         lvm2 [8.98 GiB / 7.45 GiB free]
  PV /dev/sdc1   VG ruopuvg         lvm2 [1008.00 MiB / 1008.00 MiB free]
  PV /dev/sda2   VG centos          lvm2 [<31.00 GiB / 4.00 MiB free]
  PV /dev/sdb1                      lvm2 [1.00 GiB]
  Total: 6 [43.93 GiB] / in use: 5 [42.93 GiB] / in no VG: 1 [1.00 GiB]
#可以看到sdb1已经没有了
[root@bogon ~]# pvremove /dev/sdb1
  Labels on physical volume "/dev/sdb1" successfully wiped.
#最后将sdb1从PV中移除。这样系统以及实际的LV与VG都变小了，sdb1可以进行其他工作了
```

## 快照

```shell
快照卷就是为LV卷创建的快照，创建时快照卷就会有与原LV卷相同的内容，当原LV卷改变时，会将改变前的数据保存到快照卷，而新内容是与快照卷共享的。如果出现问题，可以将快照卷的内容恢复到上一次改变时的内容。但不要让快照卷的使用超过100%，如果超过100%，快照卷就自动销毁了。
如果将原本的LV卷当备份资料，将快照卷当实际使用的磁盘，添加删除数据都在快照卷中进行，测试完后可将数据删除，而原LV卷不会有影响，如果快照卷有问题，可以删除并重新创建，也可制作多个一样的快照卷。
* 创建
[root@bogon ~]# vgdisplay 
  --- Volume group ---
  VG Name               ruopuvg
  System ID             
  Format                lvm2
  Metadata Areas        4
  Metadata Sequence No  7
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                4
  Act PV                4
  VG Size               <11.94 GiB
  PE Size               16.00 MiB
  Total PE              764
  Alloc PE / Size       98 / 1.53 GiB
  Free  PE / Size       666 / <10.41 GiB
  VG UUID               DAWGEA-EGjX-tsd0-DHoL-2MOq-R4SV-VaTHcT
[root@bogon ~]# pvcreate /dev/sdb1
  Physical volume "/dev/sdb1" successfully created.
[root@bogon ~]# vgextend ruopuvg /dev/sdb1
  Volume group "ruopuvg" successfully extended
[root@bogon ~]# vgdisplay 
  --- Volume group ---
  VG Name               ruopuvg
  System ID             
  Format                lvm2
  Metadata Areas        5
  Metadata Sequence No  8
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                5
  Act PV                5
  VG Size               12.92 GiB
  PE Size               16.00 MiB
  Total PE              827
  Alloc PE / Size       98 / 1.53 GiB
  Free  PE / Size       729 / 11.39 GiB
  VG UUID               DAWGEA-EGjX-tsd0-DHoL-2MOq-R4SV-VaTHcT  
[root@bogon ~]# lvcreate -L 1.53G -s -n ruopuss1 /dev/ruopuvg/ruopulv 
  Using default stripesize 64.00 KiB.
  Logical volume "ruopuss" created.
#-s表示是snapshot快照功能之意；-n后面接快照区的设备名称， /dev/.... 则是要被快照的 LV 完整名称。-l 后面则是接使用多少个 PE 来作为这个快照区使用。这里创建快照卷时尽量将快照卷与原LV创建成一样大的空间，以便对原LV中的数据进行快照
[root@bogon ~]# vgdisplay
	--- Logical volume ---
  LV Path                /dev/ruopuvg/ruopuss1
  LV Name                ruopuss1
  VG Name                ruopuvg
  LV UUID                2OBmjd-WnN7-V1c5-p90S-E8MM-6xN8-uOcmlF
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-10 15:29:25 +0800
  LV snapshot status     active destination for ruopulv
  LV Status              available
  # open                 0
  LV Size                1.53 GiB
  #被快照的原LV磁盘容量
  Current LE             98
  COW-table size         1.53 GiB
  #快照区的实际容量
  COW-table LE           98
  #快照区占用的PE数量
  Allocated to snapshot  0.00%
  Snapshot chunk size    4.00 KiB
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:7
[root@bogon ~]# mount /dev/ruopuvg/ruopuss /mnt
#挂载快照卷
[root@bogon ~]# df -h
Filesystem                    Size  Used Avail Use% Mounted on
/dev/mapper/centos-root        30G  2.0G   29G   7% /
devtmpfs                      234M     0  234M   0% /dev
tmpfs                         245M     0  245M   0% /dev/shm
tmpfs                         245M   29M  216M  12% /run
tmpfs                         245M     0  245M   0% /sys/fs/cgroup
/dev/sda1                    1014M  125M  890M  13% /boot
tmpfs                          49M     0   49M   0% /run/user/0
/dev/mapper/ruopuvg-ruopuss   1.5G   38M  1.3G   3% /mnt
/dev/mapper/ruopuvg-ruopulv   1.5G   38M  1.3G   3% /media
#这里显示快照卷与原LV是一样大的，里面的数据也是一样大的，因为共享了一样的数据且数据尚没有变更
[root@bogon ~]# umount /mnt

* 利用快照区复原系统
[root@bogon ~]# df /media
Filesystem                   1K-blocks  Used Available Use% Mounted on
/dev/mapper/ruopuvg-ruopulv   1479424 38088   1357064   3% /mnt
#原LV卷的磁盘信息
[root@bogon ~]# ll /media
total 20
drwxr-xr-x. 80 root root  4096 Oct  9 11:45 etc
drwx------.  2 root root 16384 Oct  9 11:44 lost+found
[root@bogon ~]# rm -rf /media/etc
[root@bogon ~]# cp -ar /boot/ /sbin/ /media
[root@bogon ~]# ll /media
total 40
dr-xr-xr-x.  5 root root  4096 Oct  8 14:29 boot
drwx------.  2 root root 16384 Oct  9 11:44 lost+found
dr-xr-xr-x.  2 root root 16384 Oct  8 16:28 sbin
[root@bogon ~]# lvdisplay /dev/ruopuvg/ruopuss
  --- Logical volume ---
  LV Path                /dev/ruopuvg/ruopuss
  LV Name                ruopuss1
  VG Name                ruopuvg
  LV UUID                2OBmjd-WnN7-V1c5-p90S-E8MM-6xN8-uOcmlF
  LV Write Access        read/write
  LV Creation host, time bogon, 2018-10-10 15:29:25 +0800
  LV snapshot status     active destination for ruopulv
  LV Status              available
  # open                 1
  LV Size                1.53 GiB
  Current LE             98
  COW-table size         1.53 GiB
  COW-table LE           98
  Allocated to snapshot  43.44%
  #快照卷使用情况
  Snapshot chunk size    4.00 KiB
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:7
[root@bogon ~]# mount /dev/ruopuvg/ruopuss /mnt
[root@bogon ~]# df
Filesystem                  1K-blocks    Used Available Use% Mounted on
/dev/mapper/centos-root      31433732 1133104  30300628   4% /
devtmpfs                       238980       0    238980   0% /dev
tmpfs                          250036       0    250036   0% /dev/shm
tmpfs                          250036    4500    245536   2% /run
tmpfs                          250036       0    250036   0% /sys/fs/cgroup
/dev/sda1                     1038336  127400    910936  13% /boot
tmpfs                           50008       0     50008   0% /run/user/0
/dev/mapper/ruopuvg-ruopulv    999320  137356    793152  15% /media
/dev/mapper/ruopuvg-ruopuss    999320   35444    895064   4% /mnt
[root@bogon ~]# mkdir -p /backups
[root@bogon ~]# cd /mnt
[root@bogon mnt]# tar -zcf /backups/lvm.tar.gz *
[root@bogon ~]# umount /mnt
[root@bogon ~]# lvremove /dev/ruopuvg/ruopuss 
Do you really want to remove active logical volume ruopuvg/ruopuss? [y/n]: y
  Logical volume "ruopuss" successfully removed
[root@bogon ~]# umount /mnt
[root@bogon ~]# mkfs.ext4 /dev/ruopuvg/ruopulv
[root@bogon ~]# mount /dev/ruopuvg/ruopulv /media
[root@bogon ~]# tar xf /backups/lvm.tar.gz -C /media

```



