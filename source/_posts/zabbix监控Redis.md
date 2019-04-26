---
title: zabbix监控Redis
date: 2019-04-26 16:26:49
tags: zabbix
categories: 监控
---

### 安装Redis

```shell
[root@zabbixagent ~]# yum install -y redis
[root@zabbixagent ~]# vim /etc/redis.conf
bind 0.0.0.0
requirepass redisqwer1234
[root@zabbixagent ~]# systemctl start redis
[root@zabbixagent ~]# systemctl enable redis
[root@zabbixagent ~]# ss -tln|grep 6379
LISTEN     0      128          *:6379                     *:*  
```



### 配置zabbix-agent

```shell
[root@zabbixagent ~]# cd /etc/zabbix/zabbix_agentd.d/
[root@zabbixagent zabbix_agentd.d]# vim all.conf
UserParameter=redis_status[*],/etc/zabbix/zabbix_agentd.d/redis_status.sh "$1" "$2" "$3"
[root@zabbixagent zabbix]# vim redis_status.sh
# 测试中，如果将脚本放在zabbix_agentd.d目录下，重启zabbix-agent时会报错"invalid entry "redis_status(){" (not following "parameter=value" notation) in config file "/etc/zabbix/zabbix_agentd.d/redis_status.sh", line 3"
#!/bin/bash
#
redis_status(){
    R_PORT=$1
    R_COMMAND=$2
    #   (echo -en "INFO \r\n";sleep 1;)|nc 127.0.0.1 "$R_PORT" > /tmp/redis_"$R_PORT".tmp
    redis-cli -h 127.0.0.1 -p $R_PORT -a "redisqwer1234" INFO > /tmp/redis_"$R_PORT".tmp
    # 连接redis数据库，将数据库信息输出到文件
    REDIS_STAT_VALUE=$(grep ""$R_COMMAND":" /tmp/redis_"$R_PORT".tmp|cut -d':' -f2)
    echo $REDIS_STAT_VALUE
}
help(){
    echo "${0} + redis_status + PORT + COMMAND"
}
main(){
    case $1 in
    redis_status)
        redis_status $2 $3
        ;;
    *)
        help
        ;;
    esac
}
# 调用main函数时，输入的$2和$3会作为$1和$2传入redis_status函数
main $1 $2 $3
# 這個腳本主要是使用INFO命令在redis中取出相關數值並保存到/tmp目錄下，之後根據取出的每項的數值進行監控。因為redis中設置了驗證功能，所以沒有使用nc命令，而是使用redis-cli命令進行取值，redis-cli的-a選項是指定驗證密碼的，最後的INFO是要執行的命令，這樣就可以在不進行redis-cli的情況下將相關數據打印到屏幕上了。
[root@zabbixagent zabbix_agentd.d]# chmod +x redis_status.sh 
[root@zabbixagent zabbix_agentd.d]# ./redis_status.sh redis_status 6379 used_memory
813456
[root@zabbixagent zabbix_agentd.d]# bash redis_status.sh redis_status 6379 used_cpu_sys
0.36
# 测试，取出CPU中的某个数据
```

