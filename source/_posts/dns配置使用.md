---
title: dns配置使用
date: 2018-11-22 10:08:10
tags: dns
categories: 网络
---

### 概念

* DNS即域名解析；一般網絡上都是用bind（Berkeley Internet Name Domain）軟件實現的

* 域名：www.magedu.com是主機名或叫FQDN（ Full Qualified Domain Name）,譯為完全限定域名，這不能被稱為域名。magedu.com才是域名，com也是域名，因爲它下面包含了magedu等域。

* DNS：名稱解析（Name Resolving）；名稱解析就是名稱轉換（背後有查詢過程，所以叫解析，依賴數據庫）

  ​       FQDN到 IP之間的雙向轉換，DNS提供的是兩者之間的雙向轉換

  ​       172.16.0.1        www.magedu.com.     

* nsswitch：為多種需要提供名稱解析的機制，可以讓別人完成名稱解析。它是提供名稱解析的平台，應用程序到這個框架上找名稱解析的店鋪即可。將DNS解析成IP地址的有兩個，一個是libnss_files和libnss_dns，調用這兩個庫即可。對我們展現的就是一個配置文件，配置文件/etc/nsswitch.conf。服務（如web，telnet，ssh）只需要到nsswitch這個框架上找對應的名稱解析服務就可以了。基於名稱轉換的機制還有NIS

  配置文件：nsswitch.conf

  格式：hosts : files        dns                 

  根據/etc/hosts文件來完成主機名稱到IP地址的轉換的。files指/etc/hosts文件，dns指dns服務，stub resolver被解釋爲最根本的最原始的名稱解析器，它是一個程序，它會根據某個庫調用來完成找nsswitch.conf中的配置，根據nsswitch.conf中的次序先去找files:/etc/hosts裡的文件，查一下有沒有主機名對應的IP，如PING命令在執行時會靠本地的stub resolver完成名稱解析，stub resolver會根據files:/etc/hosts文件找是否有主機名對應的IP，如沒有就找DNS，這就是stub resolver的作用。

  轉換的機制叫stub resolver：名稱解析器，它是一個軟件或程序

  ​       libnss_files.so             libnss_dns.so

* 早期用hosts文件實現解析

  hosts:

  ​       IP                 FQDN                        Ailases（主機別名）

  172.16.0.1    www.magedu.com            www

   

  a、周期性任務下載hosts文件

  b、之後出現了IANA（互聯網地址名稱分配機構）建的服務器server，由服務器負責轉換地址。互聯網地址名稱分配機構，之後轉由ICANN管理，它管理頂級域。IA在nsswitch中有：

  hosts: files           dns

  NA就負責維護IP與FQDN之間的對應關系的數據庫

  c、分布式數據庫，把DNS從集中的數據庫轉換成分布式數據庫，從最高開始找，主機名是從小到大寫www.magedu.com.，最後的點就是根域，也就是最上層的域，主機名結構從下向上，授權是自上向下的。下級是不知道上級的，但上級是知道直接下級的，但每個人都知道根在哪裡。.net這樣的才叫頂級域或TLD(top level domain)。為了節省流量可以將IP與主機名緩存下來。別人是不能用自己的緩存的，這就需要建立一個DNS緩存服務器，第一次由根來查找，由緩存服務器發起一次請求，之後被請求的服務器查找，一級一級地向下傳遞，緩存服務器等待結果，這就是遞歸查找，這會加大根服務器的壓力，但根是不與任何服務器遞歸的；緩存服務器根據提示發起多次請求就是迭代查找，但對於客戶端來講是遞歸查找，對於服務器來講是迭代查找。因為客戶端只向服務器發起一次請求。緩存下來的結果也是非權威答案，只有服務器的上一級給的答案才是權威答案（也就是管理域名的服務器給的答案才是權威答案），緩存時間由上一級來規定，也就是上一級不僅返回答案還返回超時時間，超過時間要重新發起請求，緩存時間的長短會影響主機的性能，時間越長服務器的壓力越小；緩存服務器既要接受本域內的請求，還要接受其他域的查找請求。也就是來自外部的請求查找內部的主機或來自內部的主機查找外部的主機，內部的主機請求查找內部的主機就直接返回結果，而且是權威答案。

  一台服務器可以給多個域進行解析的。那麼它的授權過程是：在根服務器上有一個下級域的數據庫，管理域的是NS（NS（Name Server）记录是[域名服务器](https://baike.baidu.com/item/%E5%9F%9F%E5%90%8D%E6%9C%8D%E5%8A%A1%E5%99%A8)记录，用来指定该[域名](https://baike.baidu.com/item/%E5%9F%9F%E5%90%8D)由哪个[DNS服务器](https://baike.baidu.com/item/DNS%E6%9C%8D%E5%8A%A1%E5%99%A8)来进行解析。），在數據庫中有下級域對應的服務器ns名稱及IP，當向根域發起請求後，根域會根據數據庫返回對應的頂級域的IP，如要找.com，根據這個IP找到.com，.com也會根據自己的數據庫返回用戶請求的域的管理主機的IP，這臺管理主機一般也叫NS，如ruopu，這樣再找ruopu這個域的NS服務器，請求查找www主機，如果有就返回IP。這裏NS查找的數據庫就叫授權數據庫，要實現一台服務器管理多個域就需要在授權數據庫中記錄多個域的信息，但不同的域有不同的數據庫，這樣一個IP可以有多個主機名，一個主機名也可以有多個IP，但每次只返回一個，是把多個IP輪流返回的，這就是負載均衡，是DNS的高級功能，但效果較差，他們之間是多對多的關系。

  注：德魯克的扁平化管理

* TLD譯為頂級域分三類，頂級域也叫一級域

  ​       a、組織域：.com, .org, .net, .cc

  ​       b、國家域：.cn, .tw, .hk, .iq,

  ​       c、反向域：IP轉主機名FQDN專用

  ​              反向：IP --> FQDN

  ​              正向：FQDN --> IP   正反向用的不是一個數據庫

* <font color=red>查詢有兩種方式</font>

  ​              <font color=red>遞歸：只發出一次請求</font>

  ​              <font color=red>迭代：可能發出多次請求</font>

* <font color=red>解析：</font>

  ​              <font color=red>反向：IP --> FQDN</font>

  ​              <font color=red>正向：FQDN --> IP   這兩種用的不是一個數據庫</font>

  <font color=red>兩段式：第一段是遞歸（客戶端發起），第二段是迭代（服務器查找）</font>

* DNS服務器工作

  ​       a、接受本地客戶端查詢請求（遞歸）

  ​       b、外部客戶端請求：請求權威答案，如果有就返回肯定答復，沒有就返回一個否定答復，且也有緩存時長（TTL），如果外部客戶端請求非權威答案，這需要設置，但一般不會給外部客戶端遞歸查找的。互聯網上的根、com等是不與任何主機遞歸的，這是為了安全，/etc/resolv.conf（DNS配置文件）文件中填的一定是遞歸的服務器IP，不能給出答案的是沒有用的，一般運營商給的DNS服務器都是遞歸的，不然沒法上網。一般NS只給自己負責的域名遞歸，給權威答案，請求其他的主機都是不給遞歸的

  ​              肯定答案：TTL值（TTL：存活時間）

  ​              否定答案：TTL值（存活時間）

* 根服務器：從a.root-server.net 到m.root-server.net

  根服務器掛掉會使世界混亂，要保證絕對的安全。全球共有13台根服務器，13個根是一樣的，任何一台域名服務器數據改變都要多台服務器數據同步，這是自動修改的。如果域內的主機不在線，服務器也會返回相應的結果，只是不能訪問，但如果DNS服務器上沒有記錄的話無論如何也無法訪問。如果DNS服務器掛了，其下的域名是不能訪問的，除非用IP。如果有緩存也可以訪問，但緩存過期就不能訪問。要有兩台服務器保證可以解析，一個出問題，其他可以頂上，這就是主從結構。NS中的數據庫內的信息與信息對應的主機沒有關系，即使主機不在線，NS服務器也會返回查詢結果，只是請求方無法與查詢到的結果建立聯系。但如果NS的數據庫上沒有相關記錄，就算有主機在線，也不能與其聯系。所以服務器與數據庫內的信息應該對應起來。

* DNS服務器類型    

  DNS服務器主從結構

  ​       主DNS服務器：在此服務器上完成數據修改

  ​       輔助DNS服務器：請求數據同步，同步是客戶端請求的，也就是拉取的模式。這是定期同步的，如果改了就同步改了的，沒有就下次再同步

  ​       主DNS服務器如果掛掉，輔助服務器會定期檢查是否可以同步，如果超時還未恢復，輔助服務器也會掛掉，自殺

  ```shell
  serial number版本號/序列號       
  # 定義版本號是為了在同步時如果主DNS與從DNS序列號不一致就證明數據有改變，就同步
  refresh：檢查時間週期/刷新時期      
  # 多長時間檢查一次，如果沒有響應，就進入重試時間再檢查，之後如果到了過期時間就認為主DNS掛了
  retry：重試時間；應小於refresh
  expire：重試多久過期
  negative ansver TTL：否定答案的緩存時長
  # 主從服務器要定義這五種屬性
  ```

  緩存DNS服務器，只負責緩存，不負責解析或說不提供任何權威答案；另一種是轉發器，去掉緩存功能就是轉發器，這台服務器可以上互聯網並返回結果，但客戶端不能上互聯網時，或到達某服務器時，可由這台服務器幫助轉發出去

  哪台服務器負責解析，由上級指定IP由誰解析，也就是上級授權

  數據庫中的每一個條目稱作一個資源記錄（Resource Record簡寫爲RR），靠此記錄來標明服務器的用途，如是DNS服務器還是郵件服務器

* 主DNS要通知從DNS服務器數據有變更，保證主從一致，這就是區域傳送

  區域傳送類型：在未到時間同步時，主服務器通知從DNS服務器來同步

  ​       完全區域傳送：axfr        # 這是完全同步的

  ​       增量區域傳送：ixfr        # 只傳送改變的內容

* 區域類型（傳輸數據時）

  ​       主區域: master         # 主DNS服務器

  ​       從區域：slave

  ​       提示區域：hint         # 定義根在什麼地方

  ​       轉發區域：forward  # 不找根，直接告訴域在什麼地方，並轉出的



#### 資源記錄

  ```shell
  # 資源記錄的格式，是橫著寫的，這裡為看清竪寫
  NAME：名稱
  TTL：（可省，如果都一樣的話可在全局定義即可）
  IN : internet
  RRT：資源記錄類型
  VALUE：數據
  
  *例：
  NAME         [TTL]            IN          RRT             VALUE
  
  www.magedu.com.               IN      A        1.1.1.1                      
  # 在此條第一項中，www.magedu.com.     最後的點一定要寫，不然會有問題
  
  1.1.1.1                       IN      PTR      www.magedu.com.          
  # 條爲反向解析，其中的PTR指主機名類型
  ```

#### SOA

```shell
# SOA(Start Of Authority)起始授權記錄，用於標明一個區域內部主從服務器之間如何同步數據，以及起始授權對象是誰的；數據中的第一條記錄必須是此條，用於標明本區域內多個DNS服務器之間是如何完成數據同步的

ZONE NAME  TTL  IN  SOA  FQDN  ADMINISTRATOR_MAILBOX (
	serial namber                                  
# ADMINISTRATOR_MAILBOX指郵箱地址；上面的FQDN是起始授權主機，一般是主DNS服務器地址；serial namber指版本號
                    refresh                     
                    retry
                    expire
                    na ttl) 
# 時間單位可以使用：M（分鍾）、H（小時）、D（天）、W（周）、默認單位是秒
# 郵箱格式：admin@magedu.com應寫為admin.magedu.com，不能用@，在此@表示當前區域的區域名稱

* 例:
magedu.com.   600   IN   SOA   ns1.magedu.com.  admin.magedu.com.(
# 上面的ZONE NAME寫成@也可，@就表示區域名稱，區域名稱是在配置文件(/etc/named.conf)中定義的；郵件地址不能用@，因@有特殊含義，故用admin.magedu.com.       
                         2013040101；    # 2013年4月1日第一版，最長10個數
                         1H              # 一小時刷新一次
                         5M              # 5分鍾重試
                         1W              # 重試一週過期
                         1D)             # 否定回答的TTL值
# 這些內容可以不換行，之間用空格隔開即可，也不用加括號了，但不提倡。可以加分號，分號後是注釋，換行才需注釋，一般不用
```

#### NS

```shell
# NS: (Name Server)：ZONE NAME（區域名稱） --> FQDN，這是說明哪個區域，它的區域的NS是哪個主機，這裏給的是主機名而非IP，另外還要加一條主機名的IP地址記錄

* 例:
	magedu.com.              600               IN    NS       ns1.magedu.com.
	magedu.com.              600               IN    NS       ns2.magedu.com.
	ns1.magedu.com.     	 600               IN    A        1.1.1.2      
# 還要給一個IP，雖然用不上，因爲上級已指定了此域，但有人要查詢時這裏要能返回結果，所以還是要添加此條A記錄；NS服務器的主從在區域文件內定義
    ns2.magedu.com.   		 600               IN    A        1.1.1.5
```

#### MX

```shell
# MX(Mail eXchanger): ZONE NAME --> FQDN（郵件服務器的主機名），格式如下：
	ZONE NAME           TTL       IN      MX      pri        VALUE
	magedu.com.         600       IN      MX      10        mail.magedu.com.
	mail.magedu.com.    600       IN      A                  1.1.1.3
# pri優先級從0－99，數字越小級別越高；在多台服務器找高優先級的服務器；郵件服務器也要有A記錄
```

#### A

```shell
# A(address)：FQDN-->IPV4  從FQDN（名稱）转换到IPV4（地址）的，主機名轉IP地址的都用A記錄，這是一種最常用的記錄；另一種是AAAA: FQDN --> IPV6
```

#### PTR

```shell
# PTR(pointer指針記錄)：IP --> FQDN，常用
# DNS服務器的主從一般是在配置文件的區域內部定義的，定義區域時指明
```

#### CNAME

```shell
# CNAME(Canonical NAME)正式名稱，此名叫別名記錄：FQDN --> FQDN，標示別名是誰
www2.magedu.com.             IN      CNAME         www.magedu.com
# www2是後面www的別名，www是www2的正式名稱
# 以下三種是其他的記錄格式，可查詢其意思
TXT                     
CHAOS
SRV
```

#### 域和區域

```shell
域：Domain，邏輯概念
區域：Zone，物理概念
# 解析有正向與反向，使用不同的數據庫，這就有了正向區域與反向區域，兩個區域在一起組成了域，域不是存儲的，區域才是。區域與域沒有必然的包含關系，一個域中包含區域，但域的授權又是來自上級的區域所以沒法分清，但正反向的授權是從上級不同的區域而來。

* 例:以magedu.com.    192.168.0.0/24為例
.com                                         # 舉例在.com中已得到授權，下面兩條是授權記錄
magedu.com.            IN          NS         ns.magedu.com.
ns.magedu.com.         IN          A          192.168.0.10
 
www                   192.168.0.1             # 這是要在DNS服務器上做的記錄
mail                  192.168.0.2         MX
 
* 建立兩個區域文件：按規化手動寫入
* 正向區域文件（主機名可寫成@）
	magedu.com. (@)      	IN          SOA             # 無論正反向第一條都要是此條
	www.magedu.com.         IN          A           192.168.0.1
# 可以簡寫為(簡寫主機名不加點，全寫一定要加點)
	www                          IN          A           192.168.0.1
	
* 反向區域文件
	0.168.192.in-addr.arpa.（這裡要寫網段地址，反寫，後面是特定後綴）IN       SOA
                            0.168.192.in-addr.arpa.最後的點不能少
                            
* PTR記錄格式
	1. 0.168.192.in-addr.arpa.        IN          PTR              www.magedu.com.(這個主機名不能簡寫，因爲簡寫時補的是區域名，這裏的區域名是0.168.192.in-addr.arpa.)
	1            IN                 PTR                            www.magedu.com.  (這是上一條的簡寫，因為1後面沒有點，所以會補全上面0.168.192開頭的格式)
# 正反向的格式除了區域名稱外，都是相同的
# MX記錄只定義在正向區域中，反向不需要；NS記錄正反向都要；A記錄只能定義在正向；PTR只能定義在反向
```



### 安装与使用

```shell
* 例：測試
---------------------------------------------------------------------------------------
有域magedu.com.                   172.16.100.0/24
有如下服務器
ns    172.16.100.1   # ns指的就是DNS服務器
www     172.16.100.1, 172.16.100.3
mail              172.16.100.2
ftp是www主機的別名
---------------------------------------------------------------------------------------
 
DNS軟件:BIND Berkeley（博客利） Internet Name Domain，互聯網上用的最多的DNS軟件
www.isc.org 互聯網系統協會，在此下載BIND軟件，是一個源碼包，紅帽上也有rpm包
 
bind-libs包是庫文件包，軟件需要依賴此包運行；bind-utils包是工具包，一般要用utils包就需要libs包。bind-utils中有dig host nslookup nsupdate等常用工具
 
A. bind97(服務器版)
1. bind主配置文件/etc/named.conf，主要用於定義BIND進程的工作屬性，區域的定義；
 
2. /etc/rndc.key（rndc: Remote Name Domain Controller）這是遠程名稱服務控制器，是遠程控制DNS服務器進程可以啟動、關閉、重新裝載等功能的常用命令，rndc.key是讓rndc可以遠程工作的密鑰文件，bind用的是/etc/rndc.conf文件；key中只是密鑰，而conf中還有配置信息，.key和.conf文件一般有一個就可以工作。
 
3. 還要有區域數據文件，用來查詢主機名與IP之間轉換的規則。默認是自己創建的，在/var/named下，名字自己定義
 
4. 還有一個服務腳本
/etc/rc.d/init.d/named {start|stop|restart|status|reload|configtest}
# reload 重讀配置文件和數據文件但不用重啟服務；configtest測試語法錯誤，97版本不支持
# bind的二進制程序（启动脚本）叫named，只是軟件包的名字叫bind
 
5. devel包是在創建開發環境時使用，一般運維不需要安裝，除非創建開發環境。可以不裝
# 用yum info bind97-devel查看此軟件包的信息。
 
6. bind-chroot包：
	默認情況bind運行在根/下，有人劫持服務器named進程時，任何運行這個進程的用戶的權限攻擊者都可獲取。運行此進程的用戶是named組也是named，這個用戶和組雖不能登陸系統，但這個用戶named能到達的位置，攻擊者也能到達了。這很不安全。
	這可以把運行named依賴的文件搬到一個假的根下，這樣就可防止上述問題了。如下，很多服務都可以通過這種方式提高安全性，但之後的路徑都要以/var/named/chroot/為根，配置會復雜一些，在這裡不要輕易使用chroot,建議不要裝此包，因爲不熟悉，會改變目錄結構
	/var/named/chroot/           
		etc/named.conf
		etc/rdnc.key
		sbin/named
		var/named   
 
7. caching-nameserver包，能讓DNS成為緩存DNS服務器，這是一個快速建立緩存服務器的工具。這裏不安裝。

8. 配置DNS服務器過程：
先配置成緩存服務器 --> 然後是主服務器 --> 從服務器

B、安裝配置過程
1. 安裝bind97
rpm -ql bind97
/etc/rc.d/init.d/named			# 服務腳本
/etc/rndc.conf					# rndc的配置文件
/etc/rndc.key
	/etc/sysconfig/named
	# 服務腳本的配置文件，這裏還有很多服務腳本配置文件，gen表示generation，生成之意
/usr/sbin/named					# 主程序
	/usr/sbin/named-checkconf	# 檢查配置文件中的語法錯誤
	/usr/sbin/named-checkzone	# 檢查區域文件中的語法錯誤
	/usr/sbin/named-compilezone     	# 編譯區域文件
/usr/sbin/rndc 					# 遠程控制工具
	/usr/sbin/rndc-confgen
	# 幫助生成/etc/rndc.conf配置文件的，gen表示生成
/var/named/named.ca				# 這些是var下的區域數據文件
/var/named/named.empty
/var/named/named.localhost
/var/named/named.loopback
 
C. 配置文件
1. /etc/named.conf中的內容，這是官方的示例
	options
    # 全局選項，對下面的設置都生效
    logging 
    # 定義如何生成與保存日志
    zone             
    # 定義區域
    include 
    # 把其他文件包含進來，這意味著這個文件分成片了，而且還有文件在/etc/named.rfc1912.zones中，這個文件中都是區域的定義，這些定議可以與named.conf寫在一個文件中，需要用include包含進去
 
2. /var/named/named.ca中定義了根服務器的地址13個，有些主機有多個地址，如果沒有這個文件也可自己生成，用dig (Domain information gropher)命令，用dig -t NS .命令查找根域的NS記錄，也就是根域的所有DNS服務器，這時的前提是可以訪問互聯網或可以修改/etc/resolv.conf中的nameserver爲內網中可上網的DNS服務器。-t是指定資源記錄類型，並指明通過哪個服務器來查詢就能得到結果。還可以dig -t NS . @a.root-servers.net，指明通過哪台主機來找，這表示不借助本地服務器，而是通過根服務器來找，但也要可以聯網。

3. /var/named/named.localhost是本地主機，將localhost解析成127.0.0.1的，為了必免DNS服務器配置錯誤，將localhost解析成一個正常地址，使每個主機可以通過localhost訪問本機，這是特別定義的。

4. /var/named/named.loopback用於將127.0.0.1解析成localhost
# 上述兩配置文件是本地主機名的正反向解析。
 
5. service named start            # 啓動

6. DNS監聽的協議及端口：53/udp,53/tcp。除同步數據時用tcp傳輸，默認查詢時都通過UDP的53號端口，速度快。 953/tcp是rndc監聽的
 
7. 配置文件
/etc/named.conf
    options {
		listen-on port 53 { 127.0.0.1; };                 
    	# 監聽在哪個地址的哪個端口，這裏監聽的是127.0.0.1，所以不能接受遠程主機的查詢請求
		listen-on-v6 port 53 { ::1; };               
        # 是否監聽IPv6端口
        directory       "/var/named";          
        # 數據文件位置
        dump-file       "/var/named/data/cache_dump.db";
        statistics-file "/var/named/data/named_stats.txt";
        memstatistics-file "/var/named/data/named_mem_stats.txt";
        allow-query     { localhost; };
        # 只允許誰來查詢
        recursion yes;          
        # 是否遞歸

        dnssec-enable yes;
        dnssec-validation yes;
        dnssec-lookaside auto;

        /* Path to ISC DLV key */
        bindkeys-file "/etc/named.iscdlv.key";
    };
 
8. SOCKET：套接字就是IP加端口號   IP:PORT
	套接字的主要目的就是通過此機制讓位於兩個主機上的不同進程能夠通信的。很多軟件是C/S架框的，套接字就是讓客戶端知道到哪去請求服務器端服務的，因此每個服務器只要想讓位於兩個不同主機端可以通訊，服務器端就要監聽在某個位置，這個位置就是套接字，服務器端監聽在套接字上作為訪問入口。127.0.0.1:53是回環地址，如果監聽在此套接字上，訪問的只能是127的地址，也就是本機。要監聽在外網的地址上才能接受來自其他主機的請求，端口如果沒有監聽是不能響應的。如果有多個地址也可以把每個地址與端口寫清或用0.0.0.0:53代表所有IP的53號端口，或可以不寫地址。這是named.conf文件中options中listen-on中指定的監聽的IP，options中的內容是bind服務器配置文件中選項中可使用的指令加對應的值，或參數和對應值。zone會受其控制，全局選項中最重要的是directory一項，它定義了數據文件目錄，只要告訴DNS服務器到哪找數據即可，其他都可不定義。這裡我們自己建一個。此文件權限是640
 
D. 創建配置文件
1. mv /etc/named.conf /etc/named.conf.orig

2. vim /etc/named.conf
# 此文件的語法是每一個完整的語句要用分號結尾，花括號前後要有空格，只要不在同一行中，如果花括號後沒有內容或為分號沒關系
		options {                                        
			directory              “/var/named”;
		}；
 
# 區域的定義方法：任何時候DNS服務器只要能夠解析除了自己權威的或負責的區域以外的其他區域，都必須能夠提交給根的；解析其他區域要給根；type指區域類型，指明是什麼區域
 
		zone “ZONE NAME” IN {
       		type {master主|slave從|hint根|forward轉發}
		};
 
a、主區域
如果是主區域還要定義路徑
       file “區域數據文件”
# 用file定義區域文件位置，可以使用相對路徑，是相對上面定義的directory的路徑而言
 
b. 從區域
如果是從區域還要定義路徑，只是數據文件是同步來的，不用建立
	   file “區域數據文件”；          
       masters { master1_ip; }； 
# 定義主DNS服務器地址，最後要加分號，外面結尾要加分號，master1_ip指主DNS服務器地址，可以是多個
 
c. 根區域
根區域與主區域一樣，只是類型是hint
 
        zone “.” IN {
               type hint;
               file “named.ca”; 			# 這個文件是自動生成的
        };

        zone “localhost” IN {
               type master;
               file “named.localhost”;		# 本地正向
        };

        zone “0.0.127.in-addr.arpa” IN {
               type master;
               file “named.loopback”;		# 本地反向
        }
        注：上述內容就可創建一個緩存服務器了
 
3. chown root.named /etc/named.conf              
# 改變所屬用戶與所屬組

4. chmod 640 /etc/named.conf                  
# 改權限

5. named-checkconf       
# 檢查主配置文件語法，不報信息表示沒問題

6. named-checkzone "." /var/named/named.ca
# 檢查區域文件是否有問題，在命令後指定區域是根，再指明根區域的配置文件路徑。結果提示zone ./IN: not loaded due to errors.也沒有問題

7. named-checkzone "localhost" /var/named/named.localhost

8. named-checkzone "0.0.127.in-addr.arpa" /var/named/named.loopback
# 或可用service named configtest代替上面的三條命令，在bind97中沒有此命令

9. service named start
# 啓動
# 可以查看/var/log/messages文件，看一下服務器啟動的日志
# 另外要確保selinux不要啓動
---------------------------------------------------------------------------------------
在mint8安裝並配置了bind9成緩存服務器，運行正常
1. apt install bind9

2. vim /etc/bind/named.***          
# 配置文件都在這裏，但是分幾個文件寫的

3. /etc/init.d/bind9 start          
# 啓動bind9
4. vim /etc/bind/named.conf.options
	allow-recursion {192.168.1.0/24;  192.168.5.2; };
# 打開全局設置，加入上面一行，表示可以給1.0網絡遞歸，這時1.0網段主機就可用此DNS緩存服務器了。如果要給本機遞歸，要加上自己所在的網段或給127.0.0.1放行，但這裏測試127網段失敗）
---------------------------------------------------------------------------------------
10. /etc/init.d/bind9 reload
	 
11. netstat -tlunp             
# 查看是否有53號端口被監聽

12. 測試上面建立的緩存服務器
# 將DNS改成本服務器
# 啟動DNS服務器
	dig -t NS . @a.root-servers.net.             
	# 測試能否找到根
	
13. chkconfig --list named

14. chkconfig named on
```

#### 配置文件与正向区域配置

```shell
* 實現互聯網上的DNS服務器功能
1. vim /etc/named.conf
        options {
                directory       "/var/named";
        };

        zone "." IN {
                type hint;
                file "named.ca";
        };

        zone "localhost" IN {
                type master;
                file "named.localhost";
        };

        zone "0.0.127.in-addr.arpa" IN {
                type master;
                file "named.loopback";
        };

        zone "mageedu.com" IN {
                type master;
                file "mageedu.com.zone";             
                # 自定义文件mageedu.com.zone
        };                 
        # }與；間沒有空格

named-checkconf       
# 此命令只能檢查語法錯誤，不能查邏輯錯誤
 
2. vim /var/named/mageedu.com.zone
	$TTL    600           
	# 因為是定義全局的值所以要加$號
	mageedu.com.    IN    SOA     ns1.mageedu.com.  admin.mageedu.com. (
	# 上面的域名可用@代替，因爲在主配置文件中已定義了；主DNS服務器的名字是ns1.mageedu.com. 一個IP可以有多個主機名，一個主機名也可有多個IP
						  2016061301
          				  1H
                          5M
                          2D
                          6H)
mageedu.com.    IN      NS      ns1 		# 第一個區域名稱如果與上面一樣可不寫
                IN      MX  10  mail
ns1             IN      A       192.168.5.4
mail            IN      A       192.168.5.5
www             IN      A       192.168.5.4
www             IN      A       192.168.5.6
# 這裏只寫www，是因爲省略了域名
ftp             IN      CNAME   www                
# 別名這裏指的一定是名字，而不是地址
 
3. chmod 640 mageedu.com.zone

4. chown root:named mageedu.com.zone

5. named-checkzone “mageedu.com” /var/named/mageedu.com.zone
# 将DNS改为当前的主机，vim /etc/resolv.conf --> nameserver 192.168.1.107
```

#### dig命令

```shell
1. 用dig命令測試
* 语法：
dig -t RT NAME 
# NAME與RT要配合起來，這是根據RT的類型找NAME對應的值
dig -x IP
# 根據IP查FQDN（主機名）

* 例：
dig -t A www.mageedu.com
# 找A記錄，對應的就是相應類型如A記錄一行中的IP的值，這就是根據屬性的名稱找對應的值，也就是取IP地址的
dig -t NS mageedu.com
# 查這個域的DNS服務器是誰的，最後一定是一個名稱，而不能是IP地址
dig -t RT NAME @IP
# 加@表示直接到DNS服務器上查找，@IP就是指明DNS服務器地址的
 
2. dig命令返回的結果
dig -t A www.mageedu.com返回結果如下：
    QUESTION SECTION:         
    # 提出的問題是什麼
    ANSWER SECTION:            
    # 答案
    AUTHORITY SECTION
    # 誰是提出問題的主機名的權威服務器
    ADDITIONAL SECTION     
    # 補充段，與上一項（權威服務器）NS記錄對應的A記錄
# 因爲給web服務配置了兩個地址，所以返回的兩個值每次都會對調，這就是負載均衡了
dig -t CNAME ftp.mageedu.com                               
# 查別名
dig -t NS mageedu.com                                              
# 查NS記錄
dig -t MX mageedu.com
# 上面是正向解析的方法；
dig -t SOA mageedu.com

3. 跟踪
vim /etc/resolv.conf
	nameserver 114.114.114.114
# 这里一定要改为公网的DNS，默认这里是127.0.0.53,虽然也可以访问公网，但使用下面命令时就不行了，因为dig会不断访问公网的DNS询问答案。
dig +trace www.sina.com
# dig会一直询问公网DNS，之后再到根域，一级域，二级域不断询问要查找的地址。
```

#### host命令

```shell
* 语法：
host -t RT NAME     
# 用-t指定資源類型；查詢名稱的解析結果，但不能用@
host -t A www.mageedu.com
host -t MX mageedu.com
host -t SOA mageedu.com
```

#### nslookup命令

```shell
# nslookup：交互式命令，也可工作在命令行模式下；這裏只介紹交互式模式，用window測試
nslookup
nslookup> server 192.168.5.4       
# 在windows中操作，切換DNS；通過server命令指明用5.4DNS服務器來查詢，如果不指或指的服務器不是負責的域，會給出非權威答案
nslookup> set q=A            
# 用set q=命令設定資源類型
nslookup> NAME            
# 要查的域名，如www.mageedu.com
set q=NS
mageedu.com
```

#### 反向区域配置

```shell
* 反向區域的配置
1. vim /etc/named.conf
        zone "100.16.172.in-addr.arpa" IN {
            type master;
            file "172.16.100.zone";
        };
 
2. cp mageedu.com.zone 172.16.100.zone -p                           
# 包括權限完全復制

3. vim 172.16.100.zone
		$TTL    600
		@       IN      SOA     ns1.mageedu.com.  admin.mageedu.com. (   
        # 這裡的DNS主機名不可簡寫      
                        2016061301
                        1H
                        5M
                        2D
   						6H)
                IN      NS      ns1.mageedu.com.  
# 反向區域裡DNS域名必須寫完整
        1       IN      PTR     ns1.mageedu.com.
        1       IN      PTR     www.mageedu.com.
        2       IN      PTR     mail.mageedu.com.
        3       IN      PTR     www.mageedu.com.
# 反向配置文件中不需要A記錄
 
4. named-chechconf

5. named-chechzone “5.168.192.in-addr.arpa” 192.168.5.zone         
# 在/var/named目錄中執行此條

6. service named restart

7. windows測試
        set q=PTR
        192.168.5.2

        set q=NS
        5.168.192.in-addr.arpa
8. dig -x 192.168.5.4          
# 在linux中解析IP，-x選項是解析，將DNS指向自建的DNS後才可使用此命令
```

#### 泛域名解析、递归、传送

```shell
* 泛域名解析：如果想不管输入什麼，都轉到主頁。实际上应该是错误页面，這要通過url重定向來處理。
1. 在mageedu.com.zone中添加如下，以實現泛域名解析
		*.mageedu.com.         IN          A           IP
 
2. 设置给谁遞歸，（不是自己負責的域才有遞歸的概念）
	vim /etc/named.conf
	# 在全局選項中加入
		options {
		recursion yes;            
		# 定義是否给所有人開啟遞歸，默認遞歸的客戶端個數是有限制的，這會使DNS服務器不會掛掉，默認也是開啟，不太好這種方式，所以去掉此項用下面的選項。
		allow-recursion { 172.16.0.0/16; };             
		# 說明只給哪個網段的用戶遞歸，定義遞歸對象；可加入本機回環地址，但用dig -t A IP時後面要加@127.0.0.1才能給遞歸，這應該是本機的DNS指向了本機IP。測試發現不是同一網段地址默認不給遞歸。如DNS是1網段，主機是5網段。這就要在DNS的配置文件中此項加入5網段才能使用。
		allow-query                             
		# 只允許誰來查詢，用的不多
		allow-transfer {172.16.100.2; };    
		# 只允許172…2這台主機來傳送
		notify yes;                 
		# 啟動同步通知
		recursion no;                    
		# 不與任何人遞歸
		}           
 
3. 測試遞歸：
dig +[no]tcp
# 加號 表示以某種方式工作，+no表示不以某種方式工作
dig +recurse -t A www.sohu.com @192.168.5.4      
# recurse表示遞歸查詢，這是用本機5.4解析sohu的A記錄
dig -t A www.sohu.com @192.168.5.4
# 默認都是遞歸的，加不加recurse也一樣
dig +norecurse -t A www.sina.com @192.168.5.4   
# 明確表示不遞歸，返回結果會讓去找.com域
dig +norecurse -t A www.sina.com @m.gtld-servers.net.
# 再到.com服務器查詢
dig +norecurse -t A www.sina.com @dns.baidu.com
# 經過三次測試才找到網址的A記錄，不遞歸就只會返回一個參考答案
dig +trace -t A www.baidu.com @192.168.5.4 
# +trace是跟蹤DNS的解析過程，但是不顯示IP地址的
在配置文件中加入recursion no;不與任何人遞歸後再試
dig +recurse -t A www.baidu.com @192.168.5.4     
# 不會返回結果
dig +recurse -t A www.mageedu.com @192.168.5.4
# 因是自己負責的域會返回權威答案
# 不遞歸就不能設為DNS服務器，因為不能解析就沒有意義

vim /etc/named.conf
	options {
		...
		allow-recursion { 192.168.5.0/24; };
		...
	};
	# 添加上面一条
dig -t A www.baidu.com @192.168.5.4
dig -t A www.baidu.com @127.0.0.1  
# 因為只給192.168.5網段遞歸，所以本機也遞歸不了
# 添加allow-recursion { 192.168.5.0/24;127.0.0.1; };即可給本機遞歸
 
4. 傳送
# axfr：完全區域傳送
# ixfr：增量區域傳送
dig -t axfr mageedu.com @192.168.5.4
# 得到一個區域的完全傳送，得到對方區域內的所有數據
 
5. vim mageedu.com.zone
	# 在mageedu.com.zone中加入
		pop        IN          A           192.168.5.7
		# 在每次改完此文件後加把版本號加1，改成2016061302
		
6. service named reload

7. dig -t IXFR=2016061301 mageedu.com        
# 2016061301版本以後發生的變化，如果改成2016061302，結果中只會有XFR size: 1 records (messages 1, bytes 75)一條，說明了有幾條變化，但不會有更詳細的結果。所以可以手動完成區域傳送。
###有主從服務器才會有區域傳送，是从主服務器傳送給從服務器，但像剛才的操作並不安全，應只讓從服務傳送才行，也就是添加allow-transfer { 192.168.5.8; };     只允許誰來傳送，也可將此條寫在zone區域內，也就是某個區域只允許誰來傳送，如果寫在options中就會使全部區域都生效。不讓傳送就將IP地址改成none，如allow-transfer { none; };
dig -t axfr mageedu.com         
# 測試改爲allow-transfer { none; };還能否傳送

8. 改另一臺主機地址爲允許傳送的地址
dig -t axfr mageedu.com @192.168.1.4             
# 測試是否可以傳送，最後一定指向對方主機，因爲自己不是DNS服務器
```

#### 主从配置

```shell
1. vim /etc/named.conf
    options {
            directory       "/var/named";
            allow-recursion { 192.168.5.0/24;127.0.0.1; };
    #       recursion no;
    };

    zone "." IN {
            type hint;
            file "named.ca";
    };

    zone "localhost" IN {
            type master;
            file "named.localhost";
            allow-transfer { none; };
    };

    zone "0.0.127.in-addr.arpa" IN {
            type master;
            file "named.loopback";
            allow-transfer { none; };
    };
    zone "mageedu.com" IN {
            type master;
            file "mageedu.com.zone";
            allow-transfer { 192.168.5.8; };
    };

    zone "5.168.192.in-addr.arpa" IN {
            type master;
            file "192.168.5.zone";
            allow-transfer { 192.168.5.8; };
    };
# 只允許5.8這個地址來傳送mageedu.com中的正反向數據，但根區域不用寫allow-transfer，寫了會報錯

2. service named reload

3. dig -t axfr mageedu.com @192.168.5.4             
# 因為5.4不在指定範圍內，所以不能傳送

* 新開一台主機，配置地址為192.168.5.8
dig -t axfr mageedu.com @192.168.5.8             
# 用此命令模擬傳送，因是指定主機所以可以傳送
 
1. 從服務器配置，在5.8上
# 在/var/named目錄中有slaves文件，屬主與屬組都是named，且都有寫權限，但/var/named屬組是named，且沒有寫權限，屬主是root。如果讓從服務器同步數據保存在此目錄中，因是以named身份訪問所以沒有寫權限不能保存，所以要將數據放在slaves中

2. setenforce 0

3. mv /etc/named.conf /etc/named.conf.orig

4. scp 192.168.5.4:/etc/named.conf /etc/         
# 將5.4的.conf文件下載回來放在/etc下

5. vim /etc/named.conf
# 僅修改下面內容
		zone "mageedu.com" IN {
             type slave;
             file "slaves/mageedu.com.zone";           
             # 將文件放在/var/named/slaves/中
             masters { 192.168.5.4; };                    
             # 指定主服務器
             allow-transfer { none; };       
             # 不允許同步數據，試驗時可先去掉主從區域中的此條，以免出問題
		};
        zone "5.168.192.in-addr.arpa" IN {
                type slave;
                file "slaves/192.168.5.zone";
                masters { 192.168.5.4; };
                allow-transfer { none; };
        };
       # 將一個服務器設為正向的主服務器反向的從服務器，另一個設為正向的從服務器，反向的主服務器。
       
6. named-checkconf

7. chgrp named /etc/named.conf

8. service named start          
# 視頻中出現問題，是因爲主服务器的配置文件的屬組是root且其他權限是0,改爲named組再試。查看日志可找到錯誤信息

9. tail /var/log/messages
# 在兩台主機上運行此條命令，結果會顯示完全傳送啓動與結束的信息

10. cd /slaves            
# 查看傳送過來的信息
# ORIGIN .  與   TTL 都可以聲明多次的
```

#### 增量传送

```shell
* 在主服務器5.4中
1. vim /var/named/mageedu.com
		imap    IN          A           192.168.5.9 
		# 加入
		2016061303
		# 改序列號
		
2. service named reload

3. tail /var/log/messages
# 查看兩服務器的日志因視頻中的同步沒有發生，所以在主服務器的named.conf中的options中加入了notify yes; 一條讓服務器啟動同步通知，沒有發生同步的真正原因是在主服務器的mageedu.com.zone中沒有定義另一台服務器的IP地址，所以域服務器只知道有一台服務器。

4. 在主服務器的mageedu.com.zone加入兩條
        mageedu.com.    IN      NS      ns2
        ns2             IN      A       192.168.5.8
# 這是正向的NS和A記錄，反向也要有192.168.5.zone中加入     
                    IN          NS         ns2.mageedu.com.
        8    		IN          PTR        ns2.mageedu.com.
5. service named reload          
# 重新讀取主服務器配置文件

6. 將從服務器上slaves中的文件都刪除，讓從服務器再完全同步一次

7. 到主服務器上vim mageedu.com，加入
		hello      IN   		A    	192.168.5.9
        改序列號
        
8. service named reload

9. tail /var/log/messages
# 加入一台NS服務器時一定也要加入ns記錄，放在本區域中所支持的DNS服務器中

10. 在主服務器的反向文件192.168.5.zone中加入
         10          IN   		PTR      hello.mageedu.com.
         
11. service named reload

12. 查看日志
```

#### rndc

```shell
* 用rndc控制DNS服務器
1. rndc-confgen > /etc/rndc.conf   
# 生成配置文件

2. cat /etc/rndc.conf
# start of rndc.conf與end of rndc.conf中間的段才是生效的，文件中下面還有這樣的一段內容，但注釋掉了，並要求將注釋的內容放到named.conf中

3. vim /etc/rndc.conf
		輸入:.,$-1w >> /etc/named.conf           
        # 定位光標所在行到倒數第二行追加到/etc/named.conf中 
        
4. vim /etc/named.conf
		:.,$s/^# //g          
        # 從光標所在行到最後一行，查找行首的#號且後面有空白，替換為什麼也沒有，之後可以看到rndc-key的保存位置，並標明了是密鑰
        
5. vim /etc/rndc.conf
# 這裡也定義了rndc-key

6. rm /etc/rndc.key           
# 這是bind軟件提供的，刪除即可

7. service named restart

8. rndc -c /etc/rndc.conf status      
# 使用-c選項控制服務器，查看服務器狀態

9. rm -rf /etc/rndc.key             
# 刪除這個文件，不然上面一條命令會報錯？？？
       
10. rndc -c /etc/rndc.conf notify “mageedu.com”     
# 手動發送通知

11. rndc -c /etc/rndc.conf flush             
# 清除緩存

12. rndc -c /etc/rndc.conf stop       
# 停止服務器，啟動必須用service命令啟動named

13. netstat -tlunp       
# 查看

14. service named start
# rndc命令用於控制與查看服務器，在控制本地主機時較常用
```

#### 控制遠程服務器需注意

```shell
1. named.conf中controls一項中的監聽地址要改，如：
controls {
    inet 192.168.5.4 port 953               
    # 監聽的地址
    allow { 192.168.5.8; } keys { “rndc-key”; };     
    # 允許控制的地址，用什麼控制
}
service named restart

2. scp /etc/rndc.conf 192.168.5.8:/root 
# 把密鑰文件拷到控制主機上，並放在root目錄下，如果放在etc下會覆蓋別人的相同文件

3. vim rndc.conf       
# 編輯拷過來的文件
	改options中的default-server地址為要控制的服務器地址
	
4. 這裡還要同步時間，一般不用開啟遠程控制，不安全。一般只在本機上使用。
```

#### 测试DNS服务器

```shell
* 例：公司在mageedu.com域下，網站是www.mageedu.com。現兩個部門有各自的網址，分別為www.mageedu.com/fin（財務）和www.mageedu.com/market（市場），現兩個網站有不同的地址，如www.fin.mageedu.com和www.market.mageedu.com，現在就有三個域要管理，也就是mageedu.com域要有DNS服務器管理，新分出的www.fin.mageedu.com和www.market.mageedu.com也要有兩個DNS服務器管理，這就是一個父域和兩個子域，子域要有父域的授權，下面為正向的設置。反向設置比較麻煩
 
正向區域設置
SUB_ZONE_NAME       IN          NS         NSSERVER_SUB_ZONE_NAME
NSSERVER_SUB_ZONE_NAME      IN   A    IP                 A記錄
 
SUB_ZONE_NAME	# 指子域的區域名稱
NSSERVER_SUB_ZONE_NAME	# 指管理這個子域的域名服務器，且一定是當前域的子片
# A記錄是管理這個子域的域名服務器的IP地址
# 如在.com域下注冊了mageedu.com，那麼在.com上要用如上方法建立
mageedu.com             IN          NS         ns1.mageedu.com.
                        IN          NS         ns2.mageedu.com.
ns1.mageedu.com.        IN          A           192.168.5.38
ns2.mageedu.com.        IN          A           192.168.5.41
# 如果有輔助服務器是192.168.5.8，在互聯網上是不能用的，因為.com域中沒有記錄。也就是子域中有幾個名稱服務器，在父域中也要建幾條記錄。這裏再次回顧解析過程，如下：
dig +trace -t A www.baidu.com @192.168.5.38
# 因爲5.38是負責mageedu.com.域的，不負責解析baidu.com域，所以要去找根，根會返回.com域的信息，再找.com域，.com域會根據自己的A記錄再返回baidu.com域的A記錄信息。baidu.com域再根據自己的A記錄返回要查找的內容。所以，如果在baidu.com.域中沒有相關記錄，即使建了從服務器，也不會被找到。如果在父域中有多條記錄，會被輪流使用。
#如上。如自建了兩臺NS服務器，在網上注冊了域名，要在域名提供商提供的頁面中將ns記錄改為自己的服務器，並建兩個記錄指向自己的兩臺NS服務器。
 
* 例：現在mageedu.com域已屬我們自己管理，且建好了一主一從兩臺名稱服務器，現在希望授權子域，一個叫fin，一個叫market，並且讓兩個子域可以自我管理。如何實現？建立兩個子域，授權子域可自我管理
在父域上授權子域，這應該是在域名提供網的頁面上做的
fin.mageedu.com.             IN          NS         ns1.fin.mageedu.com.
fin.mageedu.com.             IN          NS         ns2.fin.mageedu.com.             
# 這是從服務器
ns1.fin.mageedu.com.         IN          A           192.168.5.10             
# 子域IP也就是子域與父域不一定在同一網段，但要能與父域通訊
ns2.fin.mageedu.com.         IN          A           192.168.5.7        
# 子域2的服務器一定要能通信，如果解析返回子域2的IP地址，但不在線，這就不能通信了。從服務器如果不在線也會影響解析工作
market.mageedu.com.          IN          NS         ns1.market.mageedu.com.
ns1.market.mageedu.com.      IN          A          192.168.5.11
```

#### fin子域服务器

```shell
* 建立fin子域服務器方法：只建一個
1. 在父域上授權，編輯父服務器中的主服務器，加入如下
vim /var/named/mageedu.com.zone
	fin          IN          NS         ns1.fin                              
ns1.fin          IN          A          192.168.5.10
	market       IN          NS         ns1.market
ns1.market       IN          A          192.168.5.11
最後修改序列號，不然從服務器得不到此數據
 
2. service named restart --> tail /var/log/messages                        
# 重啓，看日志
cd /var/named/slaves                                     
# 查看從服務器是否同步了數據
cat mageedu.com.zone                                  
# 其中用$ORIGIN聲明變量

3. dig -t NS fin.mageedu.com @192.168.5.4 
# 雖然NS服務器不存在，但記錄已有。因為沒建立子域，聯系不上子域服務器所以不會返回結果
   dig -t A ns1.fin.mageedu.com @192.168.5.4                    
# 查看A記錄是否能找到

4. 在另一臺服務器上建子域服務器，修改IP地址。DNS服務器改爲自己（也就是子域服務器地址），搜索的子域，也就是search一項改爲fin.mageedu.com。重啓網絡服務，ping主DNS服務器，再試
       在/etc/named.conf中加入，並刪除之前所有自定義的域
       zone “fin.mageedu.com” IN {
              type master;
              file “fin.mageedu.com.zone”;
       };
       
5. 在主DNS中操作
cd /var/named-->復制mageedu.com.zone爲fin.mageedu.com.zone並修改
:%s@mageedu.com@fin.mageedu.com@g
# 上面的%表示全文搜索，將mageedu.com改爲fin.mageedu.com
$TTL 86400
@          IN   SOA    ns1.fin.mageedu.com.     admin.fin.mageedu.com.
                2016110101
                2H
                10M
                7D
                2D)
           IN          NS          ns1
           IN          MX   10     mail
ns1        IN          A           192.168.5.41
mail       IN          A           192.168.5.42
www        IN          A           192.168.5.43
上面就建立了子域的名稱服務器，保存退出並啓動

6. 到子域再試
dig -t NS fin.mageedu.com @192.168.5.41
dig -t A fin.mageedu.com @192.168.5.41
 
7. 到父域再試
dig -t NS fin.mageedu.com @192.168.5.38
dig -t A fin.mageedu.com @192.168.5.38
# 只要子域存在就沒問題了。在子域解析時，顯示的flags一行有aa字樣，應該是權威答案。

8. 用windows的nslookup試
server 192.168.5.38          
# 指向父域
set q=A
www.mageedu.com
www.fin.mageedu.com
 
server 192.168.5.41          
# 指向子域
set q=A
www.mageedu.com          
# 因爲互聯網上沒有這個域，所有不會返回結果
www.fin.mageedu.com
# 將發送到子域的請求都轉發給父域
```

#### 子域轉發

```shell
# 讓子域可以找到互聯網上沒有的父域，定義轉發即可。將子域所有的請求都轉發給父域。
* 在子域中
1. vim /etc/named.conf
# 在options中加入forward { only|first }，only指把自己解析不了的都轉給指定的服務器，如果指定的服務器不能給答案就算了；first指轉發給指定的服務器如果不能給答案，子域就去找根了。
       forward first;             
       # forward表示轉發，這樣設備會報錯
       forwarders { 192.168.5.4; };   
       # 指定轉發器的位置，也就是轉發給誰。但這是對全局的設定，所有請求都會轉發
       
2. service named restart

3. windows中測試效果
        nslookup
        set q=A
        www.fin.mageedu.com
        www.mageedu.com 
        
4. dig +trace -t A www.baidu.com       
# 這裏的請求實際是轉發給父域了，但父域不負責百度，這樣做的意義並不大。我們也可以轉發父域負責的，其他自己去查
設置轉發域，在/etc/named.conf中追加新建區域
        zone “mageedu.com” IN {
        type forward;            
        # 說明是轉發域
        forward first;             
        # 將此兩條寫在這裡，說明只有請求的是mageedu.com域時才轉發
        forwarders { 192.168.5.4; };          
        # 測試這裏不能用acl訪問控制列表
        }
 
5. named-checkconf

6. 在windows中測試
        set q=A
        www.mageedu.com
# 試一下將所有對.com的請求都轉發給.com
dig -t NS com --> 找到.com的A記錄，把A記錄填入forwarders中
```

#### acl

```shell
ACL的使用（訪問控制列表）
allow-recursion {};		# 能被遞歸的客戶端來源
allow-query {}; 		# 允許查詢的客戶端
allow-transfer {};		# 允許傳送的客戶端
在named.conf也可使用變量這種機制，但叫acl（訪問控制列表），假如要在上面三個條目中定義主機，可用acl定義並放在前面，並取名，以後可隨時使用
 
1. 用法：acl在主配置文件named.conf中的options之上定義
        acl innet {                               
               192.168.5.0/24;
               127.0.0.0/8;
        };
# innet是ACL_NAME（acl的名字），可以隨便起
		allow-query { innet; };            
# 再用此項時，可不寫地址，直接寫innet即可
		none；
# 是內置的常用列表，表示什麼都沒有
		any；
# 同none一樣是內置的常用列表，表示任意的

* acl一定要先定義才能使用，所以一般對主配置文件來說，acl是寫在最上方的。
例：
        acl innet {
        192.168.5.0/24;
        127.0.0.0/8;
        };
# 可參考書<<bind97 Manual>>，另外講的大多數內容在<<OReily DNS and BIND 5th>>
```

#### 智能DNS

```shell
	* 能夠根據客戶端來源所屬的網絡進行判斷，並且返回給一個我們事先定義好的IP地址，這就是智能DNS。
	* 它是怎麼實現智能的？DNS在自己的內部做視圖（view），DNS服務器試圖解析一個域名，我們把所有客戶端來源分爲兩類，一類是來自聯通網的，一類是電信網的。我們希望位於聯通網的解析爲一個聯通的IP地址，電信的返回電信機房的IP地址。這就要將數據文件分成兩部分，來自聯通的就查找聯通的數據文件，電信的查找電信的數據文件。用兩個文件分別應對來自不同網絡的請求。這樣對一個域名的請求就可以一分為二，叫做split brain(腦裂)的結果，這裏不只能分爲兩個，要看有多少個數據文件，就能分幾個。（在各地機房都有服務器，這個服務器可能是緩存服務器，而不是源服務器。）這裡不僅限分成兩個，要看劃分區域多少。實現上可能是建一個服務器集群，之後在各地建緩存服務器，在客戶端請求時，緩存服務器向服務器集群發請求，將web內容緩存到本地，之後客戶端就可從本地緩存服務器上得到請求的結果，這種能判斷客戶端來源並返回最近的服務器內容的網絡，而且這個網絡本身能夠根據原始服務器取得內容以後緩存在本地，它就叫做CDN (Content Delivery Network)內容分發網絡。這裏緩存的一般是靜態內容，只有動態內容才從原始服務器獲取。而很多動態內容也可通過策略靜態化，並緩存在本地。CDN比較重要的前提是可以判斷客戶端來源。而且要能根據客戶端來源返回離他最近的服務器地址。
	
* 測試：分兩個網絡172.16.0.0/16和127.0.0.0/8的是電信網，其他都是聯通網。這要使用view功能，只能一臺服務器實現智能解析。方法：
	route             查看網關爲172.16的網絡
再找一臺主機，改成192.168的網絡，網關指向192.168.0.254，192與172在同一臺主機上是允許路由數據的。這臺主機只是用來做客戶端，停止named服務。

例：
vim /etc/named.conf
# 要想實現智能解析，就要使用view視圖。用man named.conf可查看視圖的幫助。
 
        view VIEW_NAME {
        # 對option使用的所有指令對視圖都可用。除了directory外。
        }
# options中的指令在view中幾乎都可使用。一旦使用了視圖，所有區域都必須定義在view中，根區域只需定義在需要遞歸的view中即可。用man named.conf可查看幫助
 
* 定義三個視圖，一個叫內網，一個叫電信，一個叫聯通。來自電信和聯通的都不用做遞歸，只要不遞歸就不用提供根的解析。如果此情況在互聯網上是不用聲明根區域的，但一般還是提供根區域的
1. cp /etc/named.conf /root
vim /etc/named.conf
    acl telecom {
        172.16.0.0/16;
        127.0.0.0/8;
    }；
    options {
        directory “/var/named”；
        allow-recursion { telecom; };
    };
    view telecom {
    	match-clients { telecom; };     
    	# match-clients是view中最常用的指令，判斷是來自哪兒的客戶端的
    	zone “mageedu.com” IN {
            type master;
            file “telecom.magedu.com.zone”;         
            # 每個視圖對應一個區域數據文件，只要區域在不同的區域中都提供了，就要給不同的區域文件。
    	};
    };

    view unicom {
        match-clients { any; };            
        # 這裡的any代表除上面定義的telecom網絡外的其他網絡，只要匹配不上上面的就都會匹配這個
    	zone “mageedu.com” IN {
            type master;
            file “unicom.magedu.com.zone”;
    	};
    };
# 到這裏測試了一下，named-checkconf --> service named restart
 
2. 建立正向解析文件
vim /var/named/telecom.mageedu.com.zone
       $TTL 43200
       @          IN          SOA      ns1.mageedu.com.            admin.mageedu.com. (
                              2016061301
                              1H
                              10M
                              7D
                              1D)
                  IN          NS          ns1
                  IN          MX 10   	  mail
      ns1         IN          A           192.168.5.4
      mail        IN          A           192.168.5.5
      www     	  IN          A           192.168.5.6
      
3. chgrp named telecom.mageedu.com.zone

4. chmod 640 telecom.mageedu.com.zone

5. cp -p telecom.mageedu.com.zone unicom.mageedu.com.zone

6. vim unicom.mageedu.com.zone
        $TTL 43200
        @ 		IN		SOA			ns1.mageedu.com.		admin.mageedu.com. (
                        2016061301
                        1H
                        10M
                        7D
                        1D)
                IN          NS          ns1
                IN          MX 10       mail
        ns1     IN          A           192.168.5.4		# 此條IP是不會變的
        mail    IN          A           172.16.100.2
        www     IN          A           172.16.100.3
 
7. 測試，在客戶端上和服務器上分別做一次
dig -t A www.mageedu.com @172.16.100.1
在windows上測試
server 172.16.100.1
set q=A
www.mageedu.com
 
* 一臺DNS服務器可爲多個域解析，加入a.net網絡，且a.net不用區分網絡。來自a.net的無論哪個網絡都解析一個IP
8. 在主配置文件的兩個view中加入下面內容，這樣才能保證來自不同網絡的客戶端訪問同一個地址。
    zone “a.net” IN {
        type master;
        file “a.net.zone”;
    };
這就可以實現如果同時解析多個域，但有些域裡不想使用不同的結果，之後如下
vim a.net.zone
       $TTL 43200
       @          IN          SOA             ns1.a.net.      admin.a.net. (
                              2016061301
                              1H
                              10M
                              7D
                              1D)
				  IN          NS          ns1
       ns1        IN          A           172.16.100.1
       mail       IN          A           172.16.100.2
       www     	  IN          A           172.16.100.3
 
9. chgrp named a.net.zone

10. chmod 640 a.net.zone

11. service named restart

12. dig -t A www.a.net @172.16.100.1                     
# 在兩臺主機上測試
# DNS服務啟動後會將數據文件載入內存，解析與查找過程是在內存中完成的，所以很快。但如果修改了數據文件就要重新載入，如果數據文件較大就比較慢了。所以將區域的定義內容可以寫在數據庫中，不再載入內存，不用重新讀取，每次都查數據庫，所以管理方便了，但速度慢了。智能DNS服務器提供商：dnspod、www.dns.la。推薦文檔《利用bind DLZ MySQL構建智能DNS》，DLZ是能將DNS數據放入MySQL中的一種機制。還有一種是bind-sdb，這也是一種將數據放在數據庫中的機制	
```

#### DNS日志功能

```shell
在互聯網上使用不建議開日志功能，會產生大量磁盤I/O寫日志，影響服務器性能
1. vim /etc/named.conf
		在options中加入
		querylog yes;
		
2. service named restart

3. dig -t A www.baidu.com @192.168.5.38

4. tail /var/log/messages
# 这种方法添加的日志功能，日志文件在messages中
# bind提供的日志系統要定義兩個子系統，一個category，一個channel

5. category：DNS產生子系統在什麼地方，定義產生日志的源，可以是與查詢相關的，也可以是與區域傳送相關的等。可以通過category自定義日志來源；日志源一共只有15個
 
6. channel：定義日志保存位置
	一個category可以定義到多個channel，但一個channel只能保存到一個category。也就是一个日志查询的源可以保存在多个地方，但一个地方只能保存一种日志源。
	
7. 日志記錄的地方有兩種：syslog和file
        syslog：由syslog定義，存在/var/log/messages中
        file：自定義保存日志信息的文件
        日志級別有：critical  error  warning  notice  info  debug[level] dynamic（動態級別）；默認是info級別
 
* 方法
1. vim /etc/named.conf
        logging {                                         用logging括起來
        	channel querylog {                 
        	# 定義通道，querylog是保存的名字，名字隨便
        		file “/var/log/named/bind_query.log” versions 5 size 10M;          
        		# 類型是file，格式，達到10M後滾動，保存5個版本。另外named用戶要對保存位置有寫權限
        		severity dynamic;                                   
        		# 日志級別
        		print-category yes;                                 
        		# 由哪個category產生的信息
        		print-time yes;                  
        		# 什麼時間產生的信息；但在發往syslog時不用，因爲syslog會自動記錄
        		print-severity yes;            
                # 記錄日志時把當前的級別也寫下來
        	};

        	channel xfer_log {
        		file “/var/log/named/transfer.log” versions 3 size 10k;
        		severity debug 3;
        		print-time yes;
        	};
        	category querise { querylog; };            
        	# 來自category類別的日志與query（查詢）相關的，記錄到querylog中
        	category xfer-out { xfer_log };
        };
        
2. mkdir /var/log/named

3. chown named:named /var/log/named

4. chmod 770 /var/log/named
# 每重啓服務日志都會自動滾動；
# 參考: http://www.ahlinux.com/server/dns/6291.html
** 一般查詢與安全日志不開，更新日志開啟 **
```

#### DNS服務器性能測試

```shell
* dnstop軟件是監控DNS服務器每秒能接受多少查詢的，對哪個域名發起查詢請求的；bind原碼軟件包中有queryperf命令可以對服務器做壓力測試
用queryperf命令
1. 先建一個文件在裡面寫明要查詢的內容
vim test
    www.mageedu.com  		A
    mageedu.com             NS
    mageedu.com             NX
    mail.mageedu.com        A
    ns1.mageedu.com         A
    pop. mageedu.com        A
    imap. mageedu.com       A
# 將內容復制了多次達到200000行時測試，:1,$y從第一行到最後一行復制；這時用top命令查看cpu佔用率；用兩臺不同的主機測試
 
2. queryperf -d test -s 172.16.100.1
# 測試中可能會卡住，這時可用top命令查看一下CPU的壓力；另外這是本機測試，沒有考慮帶寬問題，可用其他主機測試一下，把test文件和queryperf文件拷到其他主機
 
* 再用dnstop工具監控DNS狀態，編譯安裝此軟件需要安裝libpcap-devel包。這是一個抓包工具
dnstop -4 -Q -R eth0
# -4指監聽IPv4地址，-Q指記錄查詢數，-R指記錄響應數，最後是網卡名稱。之後用dig命令查詢，這條命令會有結果顯示
 
# 多行注釋方法：/*開頭*/結尾
# 本節介紹的書籍dns and bind、bind97 Manual、利用bind DLZ Mysql構建智能DNS
```



