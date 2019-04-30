---
title: 提取JSON中的指定值
date: 2019-03-07 15:01:18
tags: JSON
categories: 基础
---

```shell
有JSON格式文件都在一行中，需要从中提取指定的值，需要从中提取"ChannelName"后的值，如"BTV文艺"，JSON文件内容如下：
{"count": 460, "data": [{"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"ADID":"16512_1_102","Advtype":2,"RandomSeq":"dce3db2d-8331-43e8-8dab-fc42d4bdff4b","LocalTime":"2019-02-01 00:00:00","CACardID":"8100103913276261","EventtypeId":"AdvDataCollect","IsLeave":"1","ServiceID":102,"DeviceType":"DVBIP-1004","CollectManufacturer":"inspur","ChannelName":"BTV文艺","SerialNumber":"10081807030091806","ADPositionID":6,"RegionId":"11132"}", "AdvDataCollect": {"ADPositionID": "6", "Advtype": "2", "ServiceID": "102", "ADID": "16512_1_102", "IsLeave": "1", "ChannelName": "BTV文艺", "LocalTime": "2019-02-01 00:00:00.000+0800"}, "RegionId": "11132", "RandomSeq": "dce3db2d-8331-43e8-8dab-fc42d4bdff4b", "DeviceType": "DVBIP-1004", "time": "2019-02-01 00:00:00.000+0800", "EventtypeId": "AdvDataCollect", "_id": "LsulpGgBnh2vjNXwpHy3", "_collect_time": "2019-02-01 00:02:25.064+0800"}, {"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"ADID":"16512_1_102","Advtype":2,"RandomSeq":"653c618f-4282-452a-b680-d4050ec6b567","LocalTime":"2019-02-01 
.........
23:59:11","CACardID":"8100103913276261","EventtypeId":"LockingDataCollect","DeviceType":"DVBIP-1004","Locked":"true","CollectManufacturer":"inspur","SerialNumber":"10081807030091806","SymbolRate":6875000,"Modulation":"QAM64","Quality":37,"CurrentFrequency":331,"Level":60,"RegionId":"11132"}", "RegionId": "11132", "RandomSeq": "e2c61503-7d9d-47dc-979d-a17cd4db5a30", "DeviceType": "DVBIP-1004", "time": "2019-02-01 23:59:11.000+0800", "EventtypeId": "LockingDataCollect", "_id": "kDTIqWgBNUKkFfMOVTGX", "_collect_time": "2019-02-01 23:58:24.179+0800", "LockingDataCollect": {"Locked": "true", "Level": "60", "Modulation": "QAM64", "SymbolRate": "6875000", "CurrentFrequency": "331", "Quality": "37", "LocalTime": "2019-02-01 23:59:11.000+0800"}}, {"CACardID": "8100103913276261", "SerialNumber": "10081807030091806", "log": "{"DeviceType":"DVBIP-1004","CollectManufacturer":"inspur","RandomSeq":"b7b7896b-c293-425a-ae7c-40675f22252f","SerialNumber":"10081807030091806","LocalTime":"2019-02-01 23:59:11","Idle":91,"SystemRunTime":23475,"RegionId":"11132","FlashRest":4823449,"CACardID":"8100103913276261","EventtypeId":"ResourceDataCollect","RAMRest":638}", "ResourceDataCollect": {"SystemRunTime": 23475.0, "FlashRest": 4823449.0, "Idle": "91", "RAMRest": 638.0, "LocalTime": "2019-02-01 23:59:11.000+0800"}, "RegionId": "11132", "RandomSeq": "b7b7896b-c293-425a-ae7c-40675f22252f", "DeviceType": "DVBIP-1004", "time": "2019-02-01 23:59:11.000+0800", "EventtypeId": "ResourceDataCollect", "_id": "B8TIqWgBnh2vjNXwVauX", "_collect_time": "2019-02-01 23:58:24.602+0800"}], "timed_out": false, "take_time": 5475}

root@ruopu64:2019-03-07#cat 8100103913276261_2019-02-01.json | tr "," "\n" | grep "ChannelName"
# 使用tr命令将文件中的逗号都转为新行，之后再查找指定值即可。
# 这样的JSON文件每天会产生一个
root@ruopu64:2019-03-07#cat *.json > all.json
# 将所有文件输出到一个文件中
root@ruopu64:2019-03-07#cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n > allOK.txt
# 再将统计结果输出到一个文件中。通过这两步就可以统计所有频道点播的次数了

root@ruopu64:2019-03-07#vim all.sh
#!/bin/bash
#
count=$(cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n)
counta=$(cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n|awk '{print $1}')
a=0
for i in `cat all.json | tr "," "\n" | grep "ChannelName" | cut -d":" -f2 | grep -v "^[[:space:]]"|sort -n |uniq -c|sort -n|awk '{print $1}'`;do
    let a=$a+$i                                                                                                              
done
echo $a
```

