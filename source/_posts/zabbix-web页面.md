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