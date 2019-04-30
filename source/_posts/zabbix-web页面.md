---
title: zabbix web页面
date: 2019-04-22 14:34:11
tags: zabbix
categories: 监控
---

# 概念

- hosts（主机）

  Zabbix中需要监控的服务器、交换机及其他设备我们都统一称作host，这些设备与Zabbix服务器之间通过网络连接。在Configuration --> Hosts 页面中管理主机。

- host groups（主机组）
  为了便于管理，可以把具有相同属性的主机归类，主机组中可以包含主机和模板。归类可按照地理区域、业务单元、设备用途、应用种类等方式划分。在Configuration --> Host groups页面中管理配置。

- Item（监控项）
  需要监控的指标如CPU负载、内存使用率等，这些监控指标在Zabbix中称为item，监控项可以包含在主机或模板中。可以在Configuration --> Hosts --> items页面或 Configuration --> Templates --> items页面中进行管理配置。

- Template（模板）
  模板中可以添加items（监控项）、triggers（触发器）、screens（展示屏）、graphs（图形）、application（监控项组）、low-level discovery（低级发现）、webscenarios（web场景）。具有相同监控需求的主机可以使用相同的模板，使用模板可以实现自动化配置，批量完成监控任务。在Configuration --> Templates 页面中管理配置。

- trigger（触发器）
  当我们收集监控项的数据后，可以使用逻辑表达式来评估监控项的数据处于何种状态，根据我们设定的thresholds（阈值）判断是否正常，其结果表现为OK（正常）或PROBLEM（故障），触发器可以包含在主机或模板中。在Configuration --> Hosts --> Triggers页面或 Configuration --> Templates --> Triggers页面中管理配置。

- events（事件）
  当一个触发器的结果发生变化时（即触发器的状态由OK变为PROBLEM或者由PROBLEM变为OK），在Zabbix中会生成一个事件。Agent auto-registration（代理自动注册）和网络设备auto discovery（自动发现）也会生成事件。可以在Monitoring--> Events 页面中查看事件详情。

- action（动作）
  有时候我们会依据特定的事件采取某种动作，比如说当某个触发器的状态变为PROBLEM时发送一封告警邮件。动作由一个operation（操作）和一个condition（条件）组成。在Configuration --> Actions 中管理配置。

- escalation（告警升级）
  在实际环境中，有时候需要根据情况将告警发送给不同的人，比如说出现故障后先给管理员发送告警邮件，并每过10分钟重复发送告警邮件给管理员，如果30分钟后故障依然没有解决，这时就给部门经理发送告警邮件。我们可以在Configuration --> Actions 页面中Operations标签中配置。

- media（告警方式）
  Zabbix支持多种告警方式，包括E-mail（邮件）、SMS（短信）、Jabber、EZ Texting（只在国外使用）和自定义告警方式，通过扩展可以使用微信、钉钉发送告警，在Administration --> Media Types页面进行配置。

- remote commands（远程命令）
  远程命令是在Zabbix server和被监控主机上执行的命令或Scripts（脚本程序），用来完成特定的任务，例如重启Apache服务。在Administration--> Scripts中配置。

- applications（监控项组/应用集）
  在Zabbix中管理用户时有对应的用户组，管理主机时有对应的主机组，管理监控项时也有对应的监控项组，就是applications。在Configuration--> Hosts --> Applications 或者Configuration--> Templates --> Applications中配置。

- notification（通知）
  通过用户选择的告警方式发送的有关事件、触发器状态等内容的告警信息。

- Severity（告警级别）
  Zabbix中通过Severity定义了触发器的不同严重程度，默认有6个值，分别为 Not classified，nformation，Warning，Average，High，Disaster。



# web页面

## 结构

![](/images/zabbix/web页面整体结构.png)

1. 主菜单：由Zabbix logo和Monitoring（监控数据）、Inventory（资产记录）、Reports（报告）、Configuration（配置）、Administration（管理）菜单组成。Guest用户登录后不会显示 Configuration和Administration菜单项。
2. 用户相关菜单：包括搜索框、帮助、用户配置及退出按钮。
3. 子菜单：二级菜单，内容随主菜单的选择而变化。
4. 操作区域：根据不同菜单项的选择，在该区域内会出现不同的操作内容。



## 子菜单

### 管理

![](/images/zabbix/子菜单-管理1.png)

#### 一般

一般页面中主要是Zabbix系统中一些通用的管理配置功能，通过右上角下拉框选择不同的项目完成相关配置和管理。下面介绍下拉框内容：

##### 图形化使用者接口

![](/images/zabbix/子菜单-管理-图形化使用者接口.png)

页面中配置参数的含义如下：

- 默认主题(Default theme)：系统默认的页面显示主题风格。用户在自己的profile中Theme设置为System default时，登录Web前端页面后会使用本参数设置的页面主题风格（默认为Blue）。更换主题后需重新登录才能生效。
- 下拉的第一个输入项(Dropdown first entry)：下拉框内的首选。在前端页面中，经常会有选择下拉框的操作，本参数就是设置下拉框的第一个选项是All或者None。另外通过选中remember selected记住当前下拉框的操作，例如你在Hosts页面中在Group下拉框中选择Router这个主机组完成操作后，当你下一次回到Hosts页面时Group下拉框中会自动选择Router。
- 搜索/过滤组件限制(Search/Filter elements limit)：搜索或使用过滤器时在页面列表中显示的记录数。例如将参数设置为10后，在页面查询的结果超过10条记录时，会显示为“Displaying 1 to 10 of 10+found”，你会看到在10后面多了个+号。
- 表格位中最多可展示的组件数量(Max count of elements to show inside table cell)：页面表格的单元格中最多显示多少个元素。例如将参数设置为1后，在Host groups页面中Templates模板中的MEMBERS（成员）名称只显示1个。
- 启用事件确认(Enable event acknowledges)：勾选此项后在Monitoring --> Dashboard页面的Last 20 issues和Monitoring--> Events页面中可以看到ACK列，否则看不到ACK列。默认是勾选的。
- 查看事件不能久于(日)(Show events not older than (in days))：定义在Monitoring --> Triggers页面中显示多少天的事件，默认是7天。
- 可展示的每触发器最多事件计数(Max count of events per trigger to show)：定义在Monitoring --> Triggers页面中每个Trigger显示多少个事件，默认是100。
- 当Zabbix服务器停机时显示警告(Show warning if Zabbix server is down)：勾选此项后当Zabbix server无法访问时（有可能宕机），在浏览器中会显示一条警告信息提示用户。默认是勾选的。



##### 管家

此页面的主要作用是定期删除Zabbix数据库中的旧数据

![](/images/zabbix/子菜单-管理-管家1.png)

![](/images/zabbix/子菜单-管理-管家2.png)

页面中配置参数的含义如下：

- Enable internal housekeeping：启用或禁用Housekeeping功能。
- Trigger data storage period (in days)：触发器数据的保留天数。
- Internal data storage period (in days)：内部数据的保留天数。
- Network discovery data storage period (in days)：网络发现数据的保留天数。
- Auto-registration data storage period (in days)：自动注册数据的保留天数。
- Data storage period (in days)：数据库中events and alerts、IT services、audit、user sessions、history和trends数据的保留天数。
- Override item history period：覆盖监控项中配置的历史保留天数。如果勾选此项，在本页面history中设置的Data storageperiod (in days) 会覆盖监控项中配置的Historystorage period (in days)。
- Override item trend period：覆盖监控项中配置的trend保留天数。如果勾选此项，在本页面trends中设置的Data storage period (in days) 会覆盖监控项中配置的Trend storage period (in days)。

设置好参数后单击Update按钮将更新设置的参数，单击Resetdefaults按钮会重置这些参数为系统默认的值。



##### 图片

我们在图片页面中可以看到很多Zabbix系统中使用的图片，主要有两种类型：Icon（图标）和 Background（背景），这些图片都保存在数据库中。Icon主要用来在拓扑图中表示各种被监控的设备，Background用来做拓扑图的背景图片。

根据你选择的图片类型，单击页面右上角的Create icon按钮或者Createbackground按钮，选择需要上传的图片，在Name字段中设置图片的名称后，点击Add按钮就可以添加图片到系统中



##### 图标映射

我们可以通过主机的资产记录信息创建主机的图标映射，然后在拓扑图中使用。当某个主机的资产记录匹配设定的图标映射关系时，拓扑图中会自动显示设定的图标。



##### 正则表达式

Zabbix支持正则表达式，有两种使用方法：在支持正则表达式的地方手工填写或引用全局正则表达式。那什么地方支持正则表达式呢？主要是在主机或模板中设置发现规则时，在Filter中使用。

在Regular expressions页面我们可以管理和配置全局正则表达式。单击页面右上角New regular expression按钮创建新的正则表达式

创建自定义的正则表达式时，我们要注意在Zabbix中正则表达式返回的是TRUE或者是FALSE。



##### 宏

Zabbix中Macros（宏变量）可以在主机和模板中创建，也可以在Macros页面中创建全局宏变量。定义宏变量时必须遵守指定的格式：{$macro}，名称可由A-Z，0-9，_ 和 . 组成。

Zabbix解析处理宏变量的过程如下：首先检查主机中是否设置了宏变量，如果有直接使用该宏变量。主机中没有发现宏变量，则检查链接到主机的所有模板中是否设置了宏变量，如果有直接使用。模板中也没有发现宏变量，则检查是否设置了全局宏变量，如果有则直接使用。



##### 值映射

Value mapping页面中允许创建和管理值映射关系，通过值映射我们可以更直观的了解监控项返回的状态值。例如我们定义交换机端口的状态值映射关系：0 --> DOWN 和1 --> UP。然后定义交换机端口状态的监控项时，在show value字段中使用上面设置的值映射，在Monitoring --> Latest data页面中查看交换机端口的状态时，你会看到交换机端口的状态是DOWN或者是UP，而不是0或1。



##### 工作时间

Working time页面用来定义工作时间，工作时间是一个系统范围的参数。

定义工作时间必须遵循下面的格式：d-d,hh:mm-hh:mm。其中d-d的意思是从星期几到星期几，比如说设置成 1-7，即表示从星期一到星期日。hh:mm-hh:mm的意思是从几点几分到几点几分，其中hh是24小时制，可以设置成00到24，mm是分钟，可以设置成00到59。

也可以同时定义多组时间，之间用 ;（分号）分隔。比如1-5,09:00-18:00;6-7,09:00-12:00，意思是星期一到星期五早上9:00到18:00，星期六和星期日的早上9:00到12:00。

根据定义的工作时间，图形中会显示不同的背景颜色，工作时间背景颜色显示为白色，非工作时间背景颜色显示为灰色。当我们查看图形时通过背景颜色就可以知道故障发生在工作时间还是非工作时间



##### 触发器严重性

在这里我们可以自定义触发器的告警级别，包括名称和颜色。建议不要修改这个页面中告警级别的名称，否则需要同时修改各个语言文件中的翻译。



##### 触发器显示选项

Triggerdisplaying options页面中可以配置和触发器状态显示有关的一些参数，可以定义acknowledged/unacknowledgedevents的颜色和blinking选项（是否闪烁），以及显示状态为OK的触发器和触发器状态发生变化后闪烁的时间。



##### 其它配置参数

Other configuration parameters页面里将一些不太好归类的参数放在一起

页面中参数的含义如下：

- Refresh unsupported items (insec)：有时候一些监控项在userparameters中配置错误或不能被agent支持而变成unsupported状态，但是Zabbix会按照此处设定的刷新时间定期的将监控项的状态从unsupported变成active。单位为秒，可设定为任意数字。如果设置为0，unsupported状态的监控项不会变成active。
- Group for discovered hosts：通过network discovery和 agent auto-registration方式添加的主机会自动归属于此处设置的主机组中。
- Default host inventory mode：创建新主机或Host prototype（主机原型）时Host Inventory（主机资产记录）的默认模式。如果创建新主机时设置了Host Inventory，这个默认值会被覆盖。在这里可以设置为禁止、手动配置和自动配置。
- User group for database downmessage：当数据库发生问题时发送告警信息给选择的用户组，如果选择None则不发送。Zabbix使用一个特定的进程Database watchdog来监控数据库，当数据库发生问题时watchdog会发送告警通知给用户组，Zabbix服务器不会停止工作，它会一直等待，直到数据库恢复正常。
- Log unmatched SNMP traps：Zabbix接收到的SNMP traps不能与任何一个监控项的配置匹配时，将其记录到日志中。



#### agent代理程序

部署Zabbix分布式架构时，需要通过Proxies页面添加Proxy服务器。在这个页面可以创建和管理Proxy。单击页面右上角的Create proxy按钮可以创建新的Proxyserver，也可以选择一个或多个Proxy，单击左下方的Enable Hosts按钮启用Proxy；单击Disable Hosts按钮禁用Proxy；单击Delete按钮删除Proxy。



#### 认证

Zabbix中用户认证方式主要有三种：internal、LDAP 和HTTP authentication，系统默认使用internal认证方式。

HTTP认证方式是基于Apache Web服务器的身份认证，使用这种方式时用户必须在Zabbix系统中已经存在，只是用户密码不再被使用。

LDAP认证方式也是比较常用的，通常和公司内部的LDAP（支持Microsoft Active Directory 和 OpenLDAP）系统集成用于检测用户的合法性。使用LDAP认证之前，需要确认用户已经在Zabbix系统中存在，只是用户密码不再被使用。



#### 用户群组

使用User groups页面可以完成用户组的创建和管理。单击页面右上角的Create user group 按钮可以创建新用户组，也可以选择一个或多个用户组，单击左下方的Enable按钮启用选中的用户组；单击Disable按钮禁用选中的用户组；单击Enable debug mode按钮启用debug模式；单击Disable debug mode按钮禁用debug模式；单击Delete按钮可以删除选中的用户组。



#### 用户

使用Users页面可以完成用户创建和管理。单击页面右上角的Createuser按钮可以创建新用户，也可以选择一个或多个用户，单击左下方的Unblock按钮允许登录状态为Blocked的用户可以重新访问前端页面；单击Delete按钮可以删除选中的用户。



#### 报警媒介类型

通过Media types页面可以完成告警方式的创建和管理。单击页面右上角的Create media type 按钮可以创建告警方式，也可以选择一个或多个告警方式，单击左下方的Enable按钮启用选中的告警方式；单击Disable按钮禁用选中的告警方式；单击Delete按钮可以删除选中的告警方式。



#### 脚本

Zabbix中我们可以开发一些脚本来扩充系统的功能，在Scripts页面中可以创建和管理脚本。单击页面右上角的Create script 按钮可以创建脚本，也可以选择一个或多个脚本，单击左下方的Delete按钮删除脚本。

脚本定义好后，在Dashboard、Latest data、Status of triggers、Events和Maps页面中出现的主机名称上单击鼠标，在弹出菜单中点击脚本名称就可以执行了，脚本执行的结果会在一个新的浏览器页面中显示。脚本可以在Zabbix server上执行，也可以在agent上执行。

单击Scripts页面右上角的Createscript按钮，填写脚本名称、需要执行的命令等，然后点击Add按钮就可以保存创建的脚本。

配置页面参数的含义如下：

- Name：脚本的名称。在这里不仅定义脚本名称，还可以定义菜单中显示的目录层次，例如：Tools/test script或者Tools/Tools/testscript 多级目录。名称中含有“/”或“\”，必须用反斜杠 \ 进行转义，例如： \\ 或 \/ 。
- Type：脚本的类型。可以是IPMI或Script。
- Execute on：选择脚本在哪里执行，可以选择Zabbix server或Zabbix agent。如果选择在agent上执行脚本，需要在agent配置文件中将EnableRemoteCommands 设置为 1 。
- Commands：脚本中执行的命令。这些命令必须是全路径的，如：/usr/bin/nmap。在命令中可以使用宏变量，包括：{HOST.CONN}、{HOST.IP}、{HOST.DNS}、{HOST.HOST}、{HOST.NAME} 及用户定义的宏变量。为了防止宏变量的值中有空格（例如Host name），需要用引号括起来。
- Command：脚本类型为IPMI时需要执行的IPMI 命令。
- Description：脚本的描述信息。
- User group：选择可以执行脚本的用户组，All指所有的用户组。
- Host group：选择可以执行脚本的主机组，All指所有的主机组。
- Required host permissions：选择主机组的权限。Read或Write。只有具有相应权限级别的用户可以执行脚本。
- Enable confirmation：勾选此项后，脚本执行前会弹出确认窗口，经过你确认后脚本才会执行，防止无意间执行一些危险的脚本命令。
- Confirmation text：确认窗口中的提示内容，可以包含{HOST.CONN}、{HOST.IP}、{HOST.DNS}、{HOST.HOST}、{HOST.NAME} 及用户定义的宏变量。

评估Zabbix性能时，很重要的一个方法就是查看这个页面显示的数据，如果在队列中没有数据，说明Zabbix系统性能很好，如果有很多数据堆积在队列中就说明Zabbix性能遇到了瓶颈，不能及时处理队列中的数据，这时就需要对Zabbix服务器进行调优。

通过选择右上角的下拉框选项，可以从Overview、Overview by proxy和Details三种视图展现队列中的数据。

