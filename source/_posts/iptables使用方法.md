---
title: iptables使用方法
date: 2018-09-27 10:49:11
tags: 防火墙
categories: 防火墙
---

# 防火墙概念

> &emsp;&emsp;iptables是工作在linux内核中的网络防火墙，iptables和netfilter是一组工具，真正起到防火墙作用的是netfilter，netfilter是内核中的一個過濾框架，iptables是一個生成防火牆規則，並能將其符加在netfilter上，真正實現數據報文過濾、NAT、mangle等規則生成的工具。
>
> &emsp;&emsp;防火牆工作在主機或網絡的邊緣，對進出的數據報文進行檢查監控，按事先定義的規則進行相應處理。防火牆可以是硬件或軟件，規則實施防火，規則包括匹配標準和處理辦法。
>
> &emsp;Framework:
>
> &emsp;默認規則：
>
> &emsp;如果防火牆默認是全部開放的，那就用堵的辦法
>
> &emsp;如果防火牆默認是全部關閉的，那就用通的辦法
>
> &emsp;&emsp;防火牆規則必須放在內核上，因爲我們是不能和內核打交道的，有人在內核的TCP/IP協議棧上開放了幾個位置，開放給用戶空間的應用程序
>
> &emsp;&emsp;netfile就是內核中可以放規則的位置；iptables是工作在用戶空間可以寫規則並可通過系統調用放置在內核相應位置的應用程序；報文流向有三種：進來的，出去的和轉發的，在/proc/sys/net/ipv4/ip_forward中就是定義是否轉發的；根據IP地址完成路由表中的路由決策，無論從哪進來的只要到了TCPIP協議棧後的下一個就是路由決策

# iptables概念

> * hook function：鈎子函數，有五個位置。分別是input（進）, output（出）, forward（轉發）, prerouting（路由做出前）, postrouting（路由之後再發出）
>
> * 鈎子函數的規則鏈：INPUT，OUTPUT，FORWARD，PREROUTING，POSTROUTING；
>
> * filter（過濾）：表：INPUT，OUTPUT，FORWARD；
>
> * nat（地址轉換）：表：PREROUTING，POSTROUTING，OUTPUT；
>
> * mangle（拆開、修改、封裝報文首部）：表：INPUT，OUTPUT，FORWARD，PREROUTING，POSTROUTING；
>
> * 過濾與mangle是不能放在一起的；
>
> * raw()：表：PREROUTING，OUTPUT
> * IINPUT、OUTPUT是從內核空間到用戶空間實現過濾的，是主機防火牆設置，通過本機轉發的通過FORWARD鏈，是網絡防火牆的設置。路由的轉發功能可以是一臺主機上的兩個網段的地址.一臺交換機上可以配置多個網段的地址，但它們之間不能通信，但如果不同網段的主機的網關指向了一臺網關服務器上一塊網卡的兩個不同網段的地址，且服務器上開通了路由的功能，那麼就可以通信了；因爲IP地址不是屬於網卡的，而是屬於主機的，所以一塊網卡可以邊接兩個網絡
> * 啓用了ip_forward鏈，默認所有報文都要轉發
> * 應該隔離可以被公網訪問的主機與不能被公網訪問的主機，如在網關服務器上放三塊網卡，其中一塊是面對互聯網的，另一塊是面對內網的，最後一塊面對服務器，開放互聯網訪問時只能從面對互聯網的網卡到面對服務器的網卡；所有在面對內網網卡上的報文要想進來必須得是一個響應，其他不允許，網關服務器被叫做三宿主的主機
>
> * netfilter:是一個框架，在TCP/IP協議橈上有5個鈎子函數分別對應5個規則鏈，工作在內核中。不能手動向netfilter中添加數據，要用iptables編寫規則送達netfilter的某個鏈上，但它必須先屬於某張表。默認表是filter，還有nat、mangle表
>
> * 目標地址轉換在進入時改，源地址轉換在出去的時候改。
>
> * 可以使用自定義鏈，但只在被默認鏈調用時才能發揮作用，而且如果沒有自定義鏈中的任何規則匹配，還應該有返回機制。用戶可以刪除自定義的空鏈，默認鏈不能刪除。
>
> * 每個規則都有兩個內置的計數器，一個記錄被匹配的報文個數，一個記錄被匹配的報文大小之和
>
> * NAT：Network Address Translation
> * DNAT：目標地址轉換，轉換IP報文中的目標IP地址。目標地址轉換DNAT，指在返回結果時將地址轉換爲請求的地址。如一臺服務器上沒有服務，但将其設置成轉換到后端兩臺服務器的地址，一臺80一臺21,用户訪問時訪問的是這臺沒有服務的主機，但返回結果是有服務的兩臺主機的內容，在返回結果時就要將地址轉換成沒有服務的主機的IP。也就是当用户访问一个地址时，这个地址本没有服务，但可将此请求转到相应的地址服务上，并在服务返回结果时自动将源地址转为用户请求的地址，这就是目标地址转换。源地址转换与目标地址转换效果相反。我们只操作一半，另一半转换由服务器自动完成
> * SNAT：源地址轉換，轉換IP報文中的源IP地址（可在POSTROUTING或OUTPUT上做，對網關來講只在POSTROUTING上作）。雖然稱爲源地址轉換，但目標IP地址也會轉換，只不過回程的目標地址會轉換
> * 在互聯網上發送報文的時候，無論經過任何路由設備源IP與目標IP是不會改變的
> * 對linux主機而言，IP地址是屬於主機的，不屬於網卡,配在什麼網卡上並不重要，關鍵是是否屬於這臺主機，無論是否打開轉發功能。這裏所說指一臺主機ping自己的網關地址，在網關這臺主機上的IP網關地址即使不在一個網段上也沒有開轉發功能，同樣可以被ping通。只有在ping第三臺網關指向這臺網關主機另一個網段IP的主機時，才需要轉發。
> * 對linux主機而言，IP地址是屬於主機的，不屬於網卡,配在什麼網卡上並不重要，關鍵是是否屬於這臺主機，無論是否打開轉發功能。這裏所說指一臺主機ping自己的網關地址，在網關這臺主機上的IP網關地址即使不在一個網段上也沒有開轉發功能，同樣可以被ping通。只有在ping第三臺網關指向了這臺網關主機另一個網段IP的主機時，才需要轉發。
> * 涉及到轉發與本機無關時一定是在FORWARD鏈上做
> * iptables在二三四層上進行過濾
> * 

## 四表五链

- filter表——过滤数据包

- Nat表——用于网络地址转换（IP、端口）

- Mangle表——修改数据包的服务类型、TTL、并且可以配置路由实现QOS

- Raw表——决定数据包是否被状态跟踪机制处理


- INPUT链——进来的数据包应用此规则链中的策略
- OUTPUT链——外出的数据包应用此规则链中的策略
- FORWARD链——转发数据包时应用此规则链中的策略
- PREROUTING链——对数据包作路由选择前应用此链中的规则（所有的数据包进来的时侯都先由这个链处理）
- POSTROUTING链——对数据包作路由选择后应用此链中的规则（所有的数据包出来的时侯都先由这个链处理）

![](/images/iptables/四表五链详细.jpg)

![](/images/iptables/四表五链.png)

![](/images/iptables/四表五链鸟哥.jpg)

## 状态

NEW：新連接請求。主机连接目标主机，在目标主机上看到的第一个想要连接的包
ESTABLISHED：已建立的連接。主机已与目标主机进行通信，判断标准只要目标主机回应了第一个包，就进入该状态。
INVALID：非法連接請求。无效的封包，例如数据破损的封包状态
RELATED：相關聯的。主机已与目标主机进行通信，目标主机发起新的链接方式，例如ftp



# 规则及语法

## 语法

```shell
iptables [-t TABLE] COMMAND CHAIN [num] 匹配條件 -j 處理動作
```

## 規則：匹配標準

```shell
通用匹配：自身能夠檢查
    -s, --src
    #指定源地址
    -d, --dst
    #指定目標地址       
    -p {tcp|udp|icmp}
    #指定協議
    -i eth* 
    #指定數據報文流入的接口，可用於自定義鏈，和以下鏈PREROUTING，INPUT，FORWARD
    -o INTERFACE
    #指定數據報文流出的接口，可用於標準定義的鏈和以下鏈OUTPUT,POSTROUTING,FORWARD

擴展匹配：依賴模塊才能檢查，在/lib/iptables下的.so擴展模塊
	隱含擴展：不用特別指明由哪個模塊進行的擴展，因爲此時使用-p {tcp|udp|icmp}
	-p tcp
		--sport PORT [-PORT]
		#源端口；可使用連續端口
		--dport PORT [-PORT]
		#目標端口
		--tcp-flags mask comp
		#只檢查mask指定的標志位，是逗號分隔的標志位列表；comp：此列表中出現的標記位必須爲1；comp中沒出現，而mask中出現的，必須爲0；如：
		--tcp-flags SYN，FIN，ACK，RST SYN，ACK 等同 --syn選項
		#檢查tcp報文的 SYN，FIN，ACK，RST標志位，這些標志位中只能是SYN，ACK爲1，其他爲0
		--syn：三次握手的第一次
	-p icmp
		--icmp-type
		#icmp協議報文的類型，主要有0和8兩種,我們ping別人的時候出去的是8進來的是0,別人ping我們的時候進來的是8出去的是0
		0：echo-reply	
		#響應報文
		8：echo-request    
		#請求報文
	-p udp
		--sport
		--dport

	顯式擴展：必須指明由哪個模塊進行的擴展，在iptables中使用-m選項可完成此功能
	-m EXTESTION_NAME -specific-opt(-m 擴展名 擴展選項)
		* state：#狀態擴展
			--state
			結合ip_conntrack追蹤會話的狀態，有四種，跟據IP、連接追蹤
			NEW：#新連接請求
			ESTABLISHED：#已建立的連接
			INVALID：#非法連接請求
			RELATED：#相關聯的
		例：
		-m state --state NEW -j ACCEPT		
		#只檢查NEW狀態，狀態爲NEW的可以通過
		-m state --state NEW,ESTABLISHED -j ACCEPT		
		#狀態爲NEW和ESTABLISHED的全部放行，與地址，協誶無關

		* multiport：#多端口匹配擴展，可實現離散的多端口匹配
			--source-ports：#源端口
			--destination-ports：#目標端口
			--ports：#不論是上面兩種哪一種端口；另外多個端口可用逗號隔開，但最多只能有15個
		例：
		-m multiport --destination-ports 21,22,80 -j ACCEPT
			
		* iprange：#指定IP範圍
			--src-range
			--dst-range
		例：
		iptables -A INPUT -p tcp -m iprange --src-range 172.16.100.3-172.16.100.100 --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT			
		#源IP是100.3到100的，可以訪問目標端口22,狀態要是NEW或ESTABLISHED

		* connlimit：#連接數限定，也就是線程數，如只能使用5個連接請求
			! --connlimit-above n：#connlimit的上限，但這裏是達到n個
		例：本機的web服務器最多允許同時發起兩個請求進來
        iptables -A INPUT -d 172.16.100.7 -p tcp --dport 80 -m connlimit ! --connlimit-above 2 -j ACCEPT
        #這是沒達到2個就允許，所以一般要在--connlimit-above前加！號。如果不加！号，可改ACCEPT的狀態爲DROP或REJECT了

		* limit
        	--limit RATE：給的是一個速率，如每秒多少人
            --limit-burst：給的是一個上限，第一批可放行多少個
		例：
		iptables -I INPUT -d 172.16.100.7 -p tcp --dport 22 -m limit --limit 3/minute --limit-burst 3 -j ACCEPT	
		#每分鍾放行3個，最多一次擁入3個
		iptables -R INPUT 3 -d 172.6.100.7 -p icmp --icmp-type 8 -m limit --limit 5/minute --limit-burst 6 -j ACCEPT		
		#修改第三條規則爲限定每分種5個ping請求，但前6個是很快的
		測試，連續打開多個ssh連接服務器

		* string 
        	--algo {bm|kmp}：#指定算法
            --string "STRING"：#指定字符串，支持正則
        例：
        vim /var/www/html/test.html
        	h7n9 
            hello world
		iptables -I INPUT -d 172.16.100.7 -m string --algo kmp --string "h7n9" -j REJECT
		#上面這條是匹配不到的，因爲當用戶的請求中沒有h7n9，請求頁面時，我們響應的報文是從OUTPUT響應出去的，所以應將規則寫在OUTPUT上
		iptables -R OUTPUT 1 -s 172.16.100.7 -m string --algo kmp --string "h7n9" -j REJECT
		#不能訪問有h7n9的頁面 ,-R選項是修改之意。
		#iptables -L -n -v顯示信息中的pkts是匹配到的規則

   
        
    
```

## 常用命令

```shell
管理規則
    -A：#附加一條規則，在鏈的尾部追加
    -I CHAIN [num]：#插入一條規則，可以指定添加在什麼位置，插入爲對應CHAIN上的第num條，如果省略num則插入爲第一條
    -D CHAIN [num]：#刪除指定鏈中的第num條規則；
    -R CHAIN [num]：#替換指定的規則

管理鏈
    -F [CHAIN]：#flush：清空指定規則鏈，如果省略CHAIN，則可以實現刪除對應表中的所有鏈
    -p CHAIN：#設定指定鏈的默認策略
    -N：#自定義一個新的空鏈
    -X：#刪除一個自定議的空鏈
    -Z：#置零指定鏈中所有規則的計數器
    -E：#重命名自定義的鏈

查看類
    -L：#顯示指定表中的規則
    -n：#以數字格式顯示主機地址和端口號，與-L一起使用
    -v：#顯示鏈及規則的詳細信息
    -vv：#顯示更詳細的信息
    -x：#顯示計數器的精確值
    --line-numbers：#顯示規則號碼
```

## 動作（target）

```shell
-j TARGET:跳轉
    ACCEPT：#放行
    DROP：#丟棄
    REJECT：#拒絕
    DNAT：#目標地址轉換
    SNAT：#源地址轉換
    REDIRECT：#端口重定向
    MASQUERADE：#地址僞裝
    LOG：#記錄日志
    MARK：#給報文加上標記
注：只要有允許或拒絕，是做過濾的，一定在filter表上

-j SNAT：#源地址轉換
	--to-source：#轉換成哪個源地址
	
-j MASQUERADE		
#外網地址是動態獲取時用此選項，它不需要—to-source選項，可以自動查到上外網的地址。

-j DNAT
	--to-destination IP[:port]

```

## 保存

```shell
iptables規則保存位置，/etc/sysconfig/iptables

iptables-save > /etc/sysconfig/iptables.tus		
#保存方法
iptables-restore < /etc/sysconfig/iptables.tus		
#此爲載入方法

```

# 例

## 查看规则

```shell
例：
	iptables -L -n			
	#默認顯示filter表
	iptables -t filter -L -n
	iptables -t nat -L -n
	iptables -t mangle -L -n
	#顯示內容中的Chain INPUT一項中沒有寫哪個表，默認就是filter表中的規則，policy表示默認策略，ACCEPT表示其爲默認值時只拒絕已知的壞蛋，如果是DROP就是只接受已知的好人。pkts表示被某一條規則所匹配到的數據包的個數，bytes表示字節數
```

## 测试1

```shell
iptables -t filter -A INPUT -s 172.16.0.0/16 -d 172.16.100.7 -p tcp --dport 22 -j ACCEPT
iptables -t filter -A OUTPUT -s 172.16.100.7 -d 172.16.0.0/16 -p tcp --sport 22 -j ACCEPT
yum install -y httpd vsftpd mysql-server 
service httpd start		
#啓動服務
browser測試是否可以打開ip地址
#修改默認設置爲都不能訪問本機，之前寫的兩條可以訪問本機22端口ssh服務的規則是爲了不讓遠程連接斷開，如果先寫下面的默認規則會使遠程連接斷開，造成麻煩
iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -P FORWARD DROP
iptables -L -n
#允計所有外部主機訪問本機的80端口，如果web服務比ssh服務訪問量大要放在其上面，所以這裏用-I選項，默認插入在第一行。當地址爲0.0.0.0的時候可以不寫，所以這裏沒有寫-s選項
iptables -I INPUT -d 172.16.100.7 -p tcp --dport 80 -j ACCEPT	
#進規則
iptables -L -n		
#查看規則
iptables -L OUTPUT -s 172.16.100.7 -p tcp --sport 80 -j ACCEPT     
#出規則
echo hello > /var/www/html/index.html		
#添加默認網頁並測試
#因ping請求使用的是icmp協議，所以這時是不能ping通的。因爲ping命令要先從OUTPUT鏈出去再從INPUT鏈進來，所以用本機ping 127.0.0.1也是不通的
iptables -A INPUT -s 127.0.0.1 -d 127.0.0.1 -i lo -j ACCEPT	
#-i選項是指定從哪個接口流入的請求
iptables -A OUTPUT -s 127.0.0.1 -d 127.0.0.1 -o lo -j ACCEPT  
#-o選項指定從哪個接口流出
iptables -A OUTPUT -s 172.16.100.7 -p icmp --icmp-type 8 -j ACCEPT
iptables -A INPUT -d 172.16.100.7 -p icmp --icmp-type 0 -j ACCEPT
#ping別人的時候，出去的是8,進來的是0，別人ping我們的時候，進來的是8,出去的是0；這樣就可以實現我們ping外面的主機了，但別人是ping不了我們的

```

## 测试2

```shell
iptables -t filter -A INPUT -s 172.16.0.0/16 -j DROP		
#來自172.16.0.0/16網段的報文無論訪問本機哪個地址都被丟棄。-A表示添加一條規則
iptables -t filter -A INPUT -s 172.16.0.0/16 -d 172.16.100.7  -j DROP		
#來自172.16.0.0/16網段訪問100.7的經過INPUT鏈的都被丟棄

iptables -t filter -A INPUT -s 172.16.0.0/16 -d 172.16.100.7 -p tcp --dport 22 -j ACCEPT
iptables -t filter -A OUTPUT -s 172.16.100.7 -d 172.16.0.0/16 -p tcp --sport 22 -j ACCEPT
###這兩條命令第一條是進第二條是出，在寫規則時一定要把進出都寫上，意思是放行172.16.0.0/16網段的地址訪問172.16.100.7的22號端口ssh服務

iptables -L -n -v
#lsmod命令可以查看啓動的模塊，這裏查看iptables模塊是否啓動，四個表：iptable_mangle、iptable_nat、iptable_raw、iptable_filter
modprobe -r 模塊名			
#注銷或裝載一個模塊
#iptables不是服務，但有服務腳本；服務腳本的主要作用在於管理保存規則，它保存在內核的內存空間上。可以使用lsmod查看iptables的相關模塊是否加載，啓動與停止服務就是裝載及移除iptables/netfilter相關的內核模塊。模塊一般有：iptables_nat, iptables_filter, iptables_mangle, iptables_raw, ip_nat, ip_conntrack； ip_conntrack是當我們啓用nat功能時，每一個地址轉換的相應的返回的報文是要自動管理的，要追蹤每一個地址轉換的報文的，這就是ip_conntrack的功能。
```

## 测试3

```shell
我們是一個DNS服務器，用戶請求不是我們負責的域，我們就到互聯網找出結果；默認策略INPUT,OUTPUT,FORWARD都是DORP的話，該怎麼寫規則
#我們是DNS服務器，應該監聽在UDP的53號端口上，當一個客戶端到我們這來請求解析的時候，我們要允許這個請求進來，源地址是客戶端，目標地址是我們的主機，目標端口是53，這應該放行；出去時原端口是53，目標地址是客戶機；但別人請求的是一個不是我們的主機負責的域時，服務器要去找根，它找根時就不是服務器端了，而是客戶端，這就要放行目標端口；當我們作爲客戶端時與這個服務器就沒關系了。這要寫四條規則，而且這只是UDP，它還要監聽在TCP上，所以一共要写八條规则。

作爲web服務器，只開放80端口的響應與放行就可以避免決大多數的攻擊了，80端口應該是只有別人請求進來，它才響應出去。只有這樣反彈式木馬在沒有人請求時才不能響應出去。這種功能在iptables中叫連接追蹤的功能，叫ip_conntrack，這是一個內核模塊，它能時時記錄着主機上客戶端，服務器端彼此正在建立的連接關系，並能追蹤到哪一個連接與其他連接之間處於什麼狀態並有什麼關系，所以上面的情況就可以判定只允許本地主機出去的連接必須爲某一種狀態，必須處於已經建立的連接，也就是必須是對別人的響應我們才允許出去，如果不是響應是決不放行的，這就靠ip_conntrack實現，ip_conntrack可根據IP報文來追蹤TCP和UDP與ICMP的連接。它可以根據請求方與響應方處理什麼過程。在/proc/sys/net/ipv4/ip_conntrack內核文件，它是位於內存當中的，因爲它在proc系統上，這個文件保存有當前系統上每一個客戶端和當前主機與每一個其他主機所建立的連接關系 
cat /proc/sys/net/ipv4/ip_conntrack
#顯示內容中每條記錄兩個來回的兩個通道的信息，並保存了當前會話所處的狀態。ip_conntrack的這種功能是靠ip_conntrack模塊實現的
#用iptstate命令也可查看到這些信息
iptstate -t		
#顯示當前所有連接的個數
#/proc/sys/net/ipv4/ip_conntrack_max是設置ip_conntrack的同時追蹤的最大值，默認是32768個，超出的連接會被超時丟棄，使用戶無法連接，如果訪問量過大最好不要啓動此模塊，如果不大最好調大此項的值，這個模塊是追蹤已連接的地址的。在iptables停止的狀態下，如果執行iptables -t nat -L命令就要激活ip_conntrack和nfnetlink模塊。
#iptables重啓會清空規則，重新加載/etc/sysconfig/iptables目錄中的文件，使用命令service iptables save可以保存規則。

保存規則：
service iptables save		
#保存規則
#默認保存在/etc/sysconfig/iptables
iptables-save > /etc/sysconfig/iptables.***		
#手動指定保存位置
iptables-restore < /etc/sysconfig/iptables.***		
#因爲手動指定保存位置所以無法加載，要用此條命令指定加載位置
```

## 開通服務器的sshd, httpd訪問端口

```shell
一臺服務器，地址172.16.100.7
iptables -F		
#清空規則
iptables -A INPUT -d 172.16.100.7 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT		
#放行所有狀態是NEW,ESTABLISHED的訪問22號端口的連接，因爲是進來所以有NEW狀態
lsmod | grep ip
iptables -A OUTPUT -s 172.16.100.7 -p tcp --sport 22 -m state –state ESTABLISHED -j ACCEPT		
#這是出去所有只有ESTABLISHED已連接狀態
iptables -P INPUT DROP
iptables -P OUTPUT DROP		
#改變默認策略爲不允許連接
iptables -L -n		
#查看現在的規則
iptables -A INPUT -d 172.16.100.7 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -s 172.16.100.7 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
#再改80端口爲相同的規則
iptstate		
#查看連接狀態
sysctl -w net.ipv4.ip_conntrack_max=65536		
#改最大值，臨時生效，要永久生效要寫在/etc/sysctl.conf中
cat /proc/sys/net/ipv4/ip_conntrack_max		
#查看 
#在/proc/sys/net/ipv4/netfilter目錄中保存了ip_conntrack的很多設置的值，其中的ip_conntrack_tcp_timeout_established中有tcp連接的保持時間，是120小時，這裏的默認單位的秒，建議將此值改小。ip_conntrack是可以追蹤三種協議tcp，udp，icmp，只是對udp，icmp只追蹤超時。

iptables -A INPUT -d 172.16.100.7 -p icmp --icmp-type 8 -m state --state NEW,ESTABLISHED -j ACCEPT		
#進規則
iptables -A OUTPUT -s 172.16.100.7 -p icmp --icmp-type 0 -m state --state ESTABLISHED -j ACCEPT	
#出規則
#寫規則時按邏輯寫，像上面兩條是允許外面的主機ping我們的主機，所以要先寫進來的規則再寫出去
iptables -L -n --line-numbers		
#查看規則，--line-numbers是顯示行號
iptables -I OUTPUT -s 172.16.100.7 -m state --state ESTABLISHED -j ACCEPT
#用這一條規則可以檢查所有出去的響應，也就是不用再寫其他出去的規則了，這樣雖然默認的規則是DROP，但這條規則可以規定所有出去的規則
iptables -D OUTPUT 2		
#刪除OUTPUT的第二條
iptables -A INPUT -i lo -j ACCEPT		
iptables -A OUTPUT -o lo -j ACCEPT		
#放行本機的回環地址，因爲ftp服務要通過本機回環地址在mysql數據庫中查詢用戶名密碼，所以要放行才能使用ftp服務或iptables對ftp服務的規則才能生效;ftp服務中PORT表示主動模式，PASV表示被動模式，要使用被動模式因端口是隨機的，所以要使用iptables狀態中的RELATED（相關聯的，與之前的命令有關系）狀態在規則中。如：
iptables -A INPUT -d 172.16.100.7 -p tcp -m state --state RELATED -j ACCEPT
iptables -R OUTPUT 1 -s 172.16.100.7 -m state --state ESTABLISHED,RELATED -j ACCEPT	
#修改OUTPUT中的第一條
iptables -R INPUT 6 -d 172.16.100.7 -p tcp -m state --state ESTABLISHED,RELATED -j ACCEPT	
#修改INPUT中的第六條，因爲第一次加這條規則時沒有指明ESTABLISHED狀態，使ftp服務連接後不能查看數據。最後，要先裝載ip_conntrack_ftp和ip_nat_ftp模塊才可進行下面的步驟，裝載方法如下：
vim /etc/sysconfig/iptables-config		
#編輯此文件
	IPTABLES_MODULES="ip_nat_ftp ip_conntrack_ftp"   
iptables -I INPUT -d 172.16.100.7 -p tcp -m state --state RELATED,ESTABLISHED -j ACCEPT
#用這一條規則先來判斷連接的狀態，符合的就放行，這樣可以讓之後的規則不必再寫這兩種狀態
service iptables save
vim /etc/sysconfig/iptables		
#直接編輯此文件來修改規則，刪除INPUT其他規則中的RELATED和ESTABLISHED
service iptables reload
iptables -L -n
iptables -I INPUT 2 -d 172.16.100.7 -p tcp -m multiport --destination-ports 21,22,80 -m state --state NEW -j ACCEPT		
#加入到INPUT中的第二條，只要是21,22,80端口爲NEW狀態的就放行；另外，之前所有命令中都可以用！號取反，如：
    -s ！ 172.16.100.7		
    #表示除了100.7都可以
	
	-j TARGET
		LOG：記錄日志信息，log與DROP、ACCEPT使用時要放在前面
            --log-prefix "STRING"		
            #指定LOG日志的前綴
			#記日志最好加上速率限定，不然記錄太多，產生大量磁盤IO,使性能下降
例：
iptables -I INPUT 4 -d 172.16.100.7 -p icmp --icmp-type 8 -j LOG --logprefix "--firewall log for icmp--"
#記錄ping本機的日志，在日志中加上一個字符串"--firewall log for icmp--"
```

## 自定義規則鏈並在主鏈中被調用
```shell
iptables -N clean_in			
#新建一條叫clean_in的規則鏈，其中references表示引用，也就是被主鏈調用
iptables -A clean_in -d 255.255.255.255 -p icmp -j DROP         
#添加一條規則
iptables -L -n –line-numbers
iptables -A clean_in -d 172.168.255.255 -p icmp -j DROP
iptables -A clean_in -p tcp ! --syn -m state --state NEW -j DROP
iptables -A clean_in -p tcp --tcp-flags ALL ALL -j DROP
iptables -A clean_in -p tcp --tcp-flags ALL NONE -j DROP
iptables -A clean_in -d 172.16.100.7 -j RETURN		
#返回到主鏈上去
iptables -A INPUT -d 172.16.100.7 -j clean_in
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A INPUT -i eth0 -m multiport -p tcp --dports 53,113,135,137,139,445 -j DROP
iptables -A INPUT -i eth0 -m multiport -p udp --dports 53,113.135.137.139.445 -j DROP
iptables -A INPUT -i eth0 -p udp --dport 1026 -j DROP
iptables -A INPUT -i eth0 -m multiport -p tcp --dports 1433,4899 -j DROP
iptables -A INPUT -p icmp -m limit --limit 10/second -j ACCEPT
iptables -I INPUT -j clean_in      
#無論什麼地址，先交給clean_in處理一遍，clean_in如果沒有問題再返回主鏈第二條進行處理；如果要刪除自定義鏈要先刪除其中的鏈規則，再刪除自定義的鏈
```

## 利用iptables的recent模块来抵御DOS攻击

```shell
ssh远程连接
iptables -I INPUT -p tcp --dport 22 -m connlimit --connlimit-above 3 -j DROP
iptables -I INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
iptables -I INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 300 --hitcount 3 --name SSH -j DROP
#利用connlimit模块将单IP的并发设置为3，会误杀使用NAT上网的用户，可以根据实际情况增大该值
#利用recent和state模块限制单IP在300s内只能与本机建立3个新连接，被限制五分钟后即可恢复访问
下面对最后两名做一个说明：
#第二句是记录访问tcp22端口的新连接，记录名为SSH。--set记录数据包的来源IP，如果IP已经存在将更新已经存在的条目
#第三句是指SSH记录中的IP，300s内发起超过3次连接则拒绝此IP的连接。--update是指每次建立连接都更新列表；--seconds必须与--rcheck或者--update同时使用；--hitcount必须与--rcheck或者--update同时使用
#iptables的记录：/proc/net/ipt_recent/SSH
#也可以使用下面的这句记录日志：
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --name SSH --second 300 --hitcount 3 -j LOG --log-prefix "SSH Attack"
```

## 测试4

```shell
試驗在虛擬機中建三臺主機，一臺linux主機，一塊網卡橋接；一臺linux路由，一塊網卡橋接，地址172，一塊網卡用HOST ONLY,地址192；一臺win主機，網卡用HOST ONLY；這時linux主機可與linux路由通信，因爲都是橋接網卡；win主機也可與linux路由通信，因爲是HOST ONLY；而且兩臺主機可以ping通路由上的任一個地址，因爲路由上的兩個地址在一臺主機上，即使不在一個網段也可以通信。但linux主機不能與win主機通信，因爲沒有路由，這時改路由的/proc/sys/net/ipv4/ip_forward項爲1，那麼這臺主機就具有了路由功能。再將兩臺主機的網關指向路由的兩個IP地址，這時就能通信了，這時是用不到NAT功能的。因爲要與公網通信，私網地址不能在公網上路由，所以才用NAT；需要轉換時路由的NAT功能會自動完成，在做源地址轉換時也會做目標地址轉換，只是目標地址轉換是自動進行的
```

## 源地址转换

```shell
iptables -t nat -A POSTROUTING -s 192.168.10.0/24 -j SNAT --to-source 172.16.100.7	
#要在nat表中創建，鏈是POSTROUTING。此条命令指對服務器來講，任何源地址是192.168.10.0/24網段的地址都轉換爲172.16.100.7。--to-source選項可指定一個地址範圍，如****-****，兩個地址間用橫線隔開來表示
tcpdump -i eth0 -nn -X icmp
#到10.7抓包
iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -j SNAT –to-source 123.2.3.2
#在服務器上寫一條規則，讓所有同學可以訪問互聯網的任一網絡，公網IP地址是123.2.3.2
```

## 测试5

```shell
iptables -A FORWARD -s 192.168.10.0/24 -p icmp -j REJECT		
#禁止192.168.10.0/24網段主機ping外網，此規則只是禁止了主機之間的ping，而沒有進入中間的防火牆服務器，所以不經過INPUT或OUTPUT進入服務器，而只是經過服務器轉發FORWARD
```

## 测试6

```shell
iptables -P FORWARD DROP
iptables -A FORWARD -m state --state ESTABLISHED -j ACCEPT
#如果是已建立的連接都放行
iptables -A FORWARD -s 192.168.10.0/24 -p tcp --dport 80 -m state --state NEW -j ACCEPT
#出去的規則，如果訪問的是web服務都放行，這是只能從內網出去的，外網是進不來的
IPTABLES -A FORWARD -s 192.168.10.0/24 -p icmp --icmp-type 8 -m state --state NEW -j ACCEPT	
#放行ping，可以ping其他主機。這是只能從內網出去的，外網是進不來的
iptables -A FORWARD -s 192.168.10.0/24 -p tcp --dport 21 -m state --state NEW -j ACCEPT
#放行ftp服務
iptables -R FORWARD 1 -m state --state ESTABLISHED,RELATED -j ACCEPT	
#用上面兩條規則可開放ftp服務，但不要忘記在/etc/sysconfig/iptables-config中加載ip_nat_ftp和ip_nat模塊
```

## 目标地址转换

```shell
iptables -t nat -A PREROUTING -d 172.16.100.7 -p tcp --dport 80 -j DNAT --to-destination 192.168.10.22		
#目標地址轉換要在PREROUTING上做。訪問172主機80端口都以192的80端口返回結果，且只在請求80服務時才轉發
iptables -t nat -R PREROUTING 1 -d 172.16.100.7 -p tcp --dport 80 -j DNAT --to-destination 192.168.10.22:8080	
#改上一條規則，訪問172主機80端口的訪問結果都以192的8080端口返回，這就是PNAT：Port NAT 端口映射或端口轉換
iptables -A FORWARD -m string --algo kmp --string "h7n9" -j DROP		
#涉及到轉發與本機無關時一定是在FORWARD鏈上。這時沒有寫協議，所以是禁止訪問任何內容中有h7n9的 

```

## iptables脚本

```shell
#!/bin/bash
#
ipt=/usr/sbin/iptables
einterface=eth1
iinterface=eth0

eip=172.16.100.7
iip=192.168.10.6

$ipt -t nat -F
$ipt -t filter -F
$ipt -t mangle -F

$ipt -N clean_up
$ipt -A clean_up -d 255.255.255.255 -p icmp -j DROP
$ipt -A clean_up -j RETURN
```

## 测试7

```shell
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j LOG --log-prefix "Denied ICMP:" --log-level 7
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
#每秒只响应一次ping，超过的记录日志并丢弃
iptables -A INPUT -i eth0 -p icmp --icmp-type echo-request -m statistic --mode nth --every 2 --packet 0 -j DROP
#每两个echo-request就丢弃一个
```

## 测试8

```shell
iptables -A INPUT -p icmp --icmp-type 8 -j DROP
#不允许接受icmp数据包到本地
iptables -A INPUT -p all -m state --state INVALID -j DROP
#不允许发送未知数据包到本地
iptables -A INPUT all -m state --state ESTABLISHED,RELATED -j ACCEPT
#允许已经允许过的连接和被动请求数据包发送到本地
iptables -A INPUT -p tcp --syn --dport 22 -m state --state NEW -j ACCEPT
#检查该连接中第一个数据包，并检查该数据包是否包含syn标记，符合两项条件才允许进入。
iptables -A INPUT -p tcp --syn -m state --state NEW -m multiport --dport 21,22,23,24,25 -j ACCEPT
#使用Multiport模块一次添加多个端口
iptables -A INPUT -p tcp --tcp-flags ALL SYN,FIN -j DROP
#检查所有 TCP-Flags，但只有syn及fin两个标记同时为1时，数据包才会被筛选出来
iptables -A INPUT -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP
#检查所有 TCP-Flags中syn及fin两个标记同时为1时，数据包才会被筛选出来
```

## 数据指添加

```shell
cat /root/mac_list.txt | while read MAC
do     
	MAC=$( echo $MAC | awk '{print $1}' )      
	iptables -t filter -A FORWARD -i eth1 -o eth0 -m mac --mac-source $MAC -j ACCEPT
done
```

## mangle表用法 MARK模块匹配（单数据包）

```shell
iptables -t mangle -A PREROUTING -p tcp --dport 80 -j MARK --set-mark 80
iptables -A FORWARD -p all -m mark --mark 80 -j DROP
```

## 管理用户或组模块

```shell
iptables -A　OUTPUT -p tcp -m owner --uid--owner tom --dport 80 -j ACCEPT
iptables -A　OUTPUT -p udp -m owner --uid--owner tom --dport 53 -j ACCEPT
iptables -A　OUTPUT -p all -m owner --uid--owner tom -j DROP
```

## 使用iprange模块添加ip范围

```shell
iptables -A INPUT -m iprange --src-range 192.168.0.2-192.168.0.61 -j DROP
iptables -A INPUT -m iprange --dst-range 192.168.0.2-192.168.0.61 -j DROP
```

## ttl值匹配模块

```shell
iptables -A INPUT -m ttl --ttl-eq 64 -j REJECT
#--ttl-eq 等于
#--ttl-lt 小于
#--ttl-gt 大于
```

## IPSEC SPI 值控制模块

```shell
iptables -A FORWARD -p ah -m ah --ahspi 300 -j ACCEPT
iptables -A FORWARD -p esp -m esp --espspi 200 -j ACCEPT
```

## pkttype模块

```shell
iptables -A FORWARD -i eth0 -p icmp -m pkttype --pky-type broadcast -j DROP
#unicast:数据包发送的对象时特定的，如主机A传输给主机B即为unicast类型
#broadcast:数据包传送的对象为广播地址，如192.168.0.255
#multicast:通常应用于网络的“音频”或“视频”广播，而Multicast数据包的特点是，其Source IP一定介于224.0.0.0/24之间。
```

## length模块

```shell
iptables -A INPUT -p icmp --icmp -type 8 -m length --length 92 -j ACCEPT
iptables -A INPUT -p icmp --icmp -type 8 -j DROP
#MTU=(IP包+ICMP包+DATA)
#--length 50 匹配MTU值刚好为50字节的数据包
#--length :100 匹配MTU值小于100个字节的数据包
#--length 50:100 匹配MTU值介于50-100个字节的数据包
```

## limit数据包重复率匹配

```shell
iptables -A INPUT -p icmp --icmp-type 8 -m limit --limit 6/m --limit-burst 10 -j ACCEPT
iptables -A INPUT -p icmp --icmp-type 8 -j DROP
#一分钟进入10个数据包以上，就会限制一分钟进入6个数据包，直到6*10s内没有收到数据包，将会解除
```

## recent模块

```shell
iptables -A INPUT -p icmp --icmp-type 8 -m recent --name icmp_db --rcheck --second 60 --hitcount 6 -j DROP
iptables -A INPUT -p icmp --icmp-type 8 -m recent --set --name icmp_db
cat /proc/net/xt_recent/icmp_db
modprobe xt_recent ip_list_tot=1024 ip_pkt_list_tot=50
#ip_list_tot设置ip上限条数，默认100
#ip_pkt_list_tot设置数据存储空间，默认20

#--name 设置跟踪数据库的文件名
#[!]--set将符合条件的来源数据添加到数据库中，但如果来源端数据已经存在，则更新数据库中的记录信息
#[!]--rcheck只进行数据库中信息的匹配，并不会对已存在的数据做任何变更操作
#[!]--update如果来源端的数据已存在，则将其更新；若不存在，则不做任何处理
#[!]--remove如果来源端数据已存在，则将其删除，若不存在，则不做任何处理
#[!]--seconds seconds当事件发生时，只会匹配数据库中前“几秒”内的记录，--seconds必须与--rcheck或--update参数共用
#[!]--hitcount hits匹配重复发生次数，必须与--rcheck或--update参数共用
```

## string模块 匹配字符串

```shell
iptables -A FORWARD -i eth0 -o eth1 -p tcp -d $WEB_SERVER --dport 80 -m string --algo bm --string "system32" -j DROP
#--algo 字符串匹配算法的选择，string模块提供了两种不同的算法，分别是bm(Boyer-Moore)及kmp(Knuth-Pratt-Morris),其中bm算法平均速度会比kmp快，不过，你也不必太在意，因为我们匹配的对象不会太大，因此用哪种都差不多
#--from、--to设置匹配字符串的范围，我们可以使用--from来设置匹配的起点，并以--to来设置匹配的终点，其单位为字节，如--from 10意为从第10个字符串开始匹配，如果没有设置这个参数，那么匹配的范围将是整个数据包
#[!]--string匹配条件，如--string "system32"是指要匹配的字符串为system32
#[!]--hex-string匹配条件，但不同于--string参数的地方在于--hex-string是以16进制的方式进行匹配，特别适合用于非ascii字符串的匹配，其匹配条件的表示方法为--hex-string "|2e2f303132333435|"，请注意实际匹配条件为2e2f303132333435，但其左右要使用"|"符号
```

## connlimit模块 匹配连接数

```shell
iptables -A FORWARD -i eth0 -o eth1 -p tcp --syn -d $Web_Server --dport 80 -m connlimit --connlimit-above 30 --connlimit-mask 32 -j DROP
#[!]--connlimit-above 指定最大连接数量
#--connlimit-mask 此参数为子网络掩码，用于匹配范围，例如 8A 16B 24C 25 1/2个c 32代表单一个IP
```

## connbytes模块限制每个连接中所能传输的数据量

```shell
iptables -A FORWARD -p tcp -d $Web_Server --dport 80 -m connbytes --connbytes-dir reply --connbytes-mode bytes --connbytes 20971520: -j DROP
#[!]--connbytes-dir original来源方向 reply应答方向 both双向
#--connbytes-mode packets以数据包的数量来计算 bytes以数据量来计算
#--connbytes 10:匹配10个以上的单位量 :50匹配50个一下的单位量 10:50匹配10个-50个之间的单位量
```

## quota模块 匹配每个ip限制流量（不会清除纪录，要刷新纪录）

```shell
iptables -A FORWARD -i eth0 -o eth1 -p tcp --sport 80 -m quota --quota 524288000 -j ACCEPT
iptables -A FORWARD -i eth0 -o eth1 -p tcp --sport 80 -j DROP
```

## time模块 设置规则生效时间

```shell
iptables -A FORWARD -o eth1 -d $SRV_FARM -m time --weekdays Mon,Tue,Wed,Thu,Fri --timestart 09:00 --timestop 21:00 -j ACCEPT
iptables -A FORWARD -o eth1 -d $SRV_FARM -j DROP 
#--datestart:YYYY[-MM[-DD[Thh[:mm[:ss]]]]]
#--datestop
#--timestart:hh:mm[:ss]
#--timestop
#[!]--monthdays:day[,day]...1,2,3,4,5,6,7,8,9,10,31
#[!]--weekdays:day[,day]...Mon,Tue,Wed,Thu,Fri,Sat,Sun
```

## connmark模块匹配mark值（整条连接）

```shell
iptables -A INPUT -m connmark --mark 1 -j DROP 

#conntrack模块匹配数据包状态，是state模块的加强版
#[!]--ctstate:匹配数据包的状态，状态列表分别为NEW,ESTABLISHED,RELATED,INVALID,DNAT,SNAT
#[!]--ctproto:用于匹配OSI七层中第四层的通信层，其功能与用法就如同iptables中的-p参数，如-p tcp,-p udp,-p 47等。
#[!]--ctorigsrc匹配连接发起方向的来源端IP
#[!]--ctorigdst匹配连接发起方向的目的端IP
#[!]--ctreplsrc匹配数据包应答方向的来源端IP
#[!]--ctrepldst匹配数据包应答方向的目的端IP
#[!]--ctorigsrcport
#[!]--ctorigdstport
#[!]--ctreplsrcport
#[!]--ctrepldstport
#[!]--ctexpire连接在Netfilter Conntrack数据库(/porc/net/nf_conntrack)的存活时间，使用方法如下：
#匹配特定的存活时间--ctexpire time
#匹配特定区间的存活时间--ctexpire time:time
#--ctdir设置要匹配那个方向的数据包，使用方法如下：
#只匹配连接发起方向的数据包--ctdir ORIGINAL
#只匹配数据包应答方向的数据包--ctdir REPLY
#若没有设置这个参数，默认会匹配双向的所有数据包

#!/bin/bash
iptables -F
modprobe nf_conntrack_ftp
iptables -A INPUT -p tcp -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 21 -m state --state NEW -j ACCEPT
iptables -A INPUT -p tcp --dport 21 -j DROP 

#!/bin/bash
iptables -F
modprobe nf_conntrack_ftp
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -m conntrack --ctproto tcp --ctorigsrc 192.168.1.0/24 --ctorigdstport 21 --ctstate NEW -j ACCEPT
iptables -A INTPU -p tcp --dport 21 -j DROP
```

## statistic模块进行比例匹配

```shell
以随机方式丢弃50%的数据包
iptables -A INPUT -p icmp -m statistic --mode random --probability 0.5 -j DROP
#按一定规律在每10个icmp包中丢弃1个icmp包
iptables -A INPUT -p icmp -m statistic --mode nth --every 10 -j DROP
#--mode:random以随机方式丢弃数据包，nth按一定规律丢弃数据包
#--probability:此参数需结合random模式使用，例如--probability 0.4 即代表丢弃40%的数据，其中的数值为0-1
#--every此参数需结合nth模式使用，例如--every 10代表在每10个数据包中要丢弃1个数据包
#--packet此参数需要在nth模式与--every参数结合使用，例如--every 10 --packet5
```

## layer7 – 17



