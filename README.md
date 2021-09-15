@[TOC](目录)
# 前言
你已经装好了cordova及其环境和插件cordova-plugin-ble-central。
插件官网：[Bluetooth Low Energy (BLE) Central Plugin for Apache Cordova](https://www.npmjs.com/package/cordova-plugin-ble-central#scan)
官网自带例程，可直接参考。
安装命令 `npm i cordova-plugin-ble-central`
添加插件 `cordova plugin add cordova-plugin-ble-central`
以下是我的环境
![在这里插入图片描述](https://img-blog.csdnimg.cn/44a737427e2940aa9bbcf41718c0fe63.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBATG92ZeS4tuS8iuWNoea0m-aWrw==,size_12,color_FFFFFF,t_70,g_se,x_16)
ps：如果想跑例程，我已经打好debug版apk，release中下载即可
## 代码下载
[码云](https://gitee.com/ikaros-521/cordova-plugin-ble-central-rssi-demo) [GitHub](https://github.com/Ikaros-521/cordova-plugin-ble-central-rssi-demo)
# 效果图
都是安卓为示例
## 完整演示动图
![在这里插入图片描述](https://img-blog.csdnimg.cn/0287895f7c184be8a2dd862f58150e21.gif#pic_center)

## 主界面
![在这里插入图片描述](https://img-blog.csdnimg.cn/b890d62fd21d4dc0a6be394afec873d5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBATG92ZeS4tuS8iuWNoea0m-aWrw==,size_7,color_FFFFFF,t_70,g_se,x_16)
## 效果页
![在这里插入图片描述](https://img-blog.csdnimg.cn/bef1116f67724632af0791143fbaebae.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBATG92ZeS4tuS8iuWNoea0m-aWrw==,size_7,color_FFFFFF,t_70,g_se,x_16)

# 核心代码
## index.js

```javascript
// 设备列表
var deviceList = [];
var loopScan;

// 显示设备列表于deviceListDiv
function showDeviceList() {
    document.getElementById("deviceListDiv").innerHTML = "";

    /*
        公式 d=10^((ABS(RSSI)-A)/(10*n))
        其中d为距离，单位是m。
        RSSI为rssi信号强度，为负数。
        A为距离探测设备1m时的rssi值的绝对值，最佳范围在45-49之间。
        n为环境衰减因子，需要测试矫正，最佳范围在3.25-4.5之间
    */
    var d = 0;
    var A = 50;
    var n = 2.96;

    // 遍历deviceList
    for(var i=0; i<deviceList.length; i++){
        var msgDiv = document.createElement("div");

        d = Math.pow(10, (Math.abs(deviceList[i].rssi) - A) / (10 * n));

        msgDiv.textContent = JSON.stringify(deviceList[i]) + " RSSI算法预估距离：" + d;
        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("deviceListDiv").appendChild(msgDiv);
    }
    //log(deviceList, "log");
    log("调用showDeviceList()", "log");
}

// 打印日志
function log(msg, level) {
    level = level || "log";

    if (typeof msg === "object") {
        msg = JSON.stringify(msg, null, "  ");
    }

    console.log(msg);

    if (level === "status" || level === "error" || level === "success") {
        var msgDiv = document.createElement("div");
        msgDiv.textContent = msg;

        if (level === "error") {
            msgDiv.style.color = "red";
        }
        else if(level === "success") {
            msgDiv.style.color = "green";
        }

        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("output").appendChild(msgDiv);
    }
    else {
        var msgDiv = document.createElement("div");
        msgDiv.textContent = msg;
        msgDiv.style.color = "#57606a";
        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("output").appendChild(msgDiv);
    }
}

// 扫描蓝牙设备
function scanBT() {
    var idSubstring = document.getElementById('idSubstring').value;
    ble.startScan([], function(res) {
        deviceListLen = deviceList.length;
        // 判空
        if(idSubstring.length != 0){
            // 含有子串
            if(res["id"].indexOf(idSubstring) >= 0) {
                // deviceList为空则直接加入
                if(0 == deviceListLen) {
                    deviceList.push(res);
                }
                else {
                    for(var i=0; i<deviceListLen; i++){
                        if(deviceList[i].id == res["id"]){
                            log("发现同id：" + deviceList[i].id + 
                                "消息，进行rssi值的替换，原rssi:" +
                                deviceList[i].rssi +
                                "，现rssi:" +
                                res["rssi"], "log");
                            deviceList[i].rssi = res["rssi"];
                            break;
                        }
                        if(i == (deviceListLen - 1)) deviceList.push(res);
                    }
                }
                // 重新显示设备列表
                showDeviceList();
            }
        }
        else {
            if(0 == deviceListLen) {
                deviceList.push(res);
            }
            else {
                for(var i=0; i<deviceListLen; i++){
                    if(deviceList[i].id == res["id"]){
                        log("发现同id：" + deviceList[i].id + 
                            "消息，进行rssi值的替换，原rssi:" +
                            deviceList[i].rssi +
                            "，现rssi:" +
                            res["rssi"], "log");
                        deviceList[i].rssi = res["rssi"];
                        break;
                    }
                    if(i == (deviceListLen - 1)) deviceList.push(res);
                }
            } 
            showDeviceList();
        }
        
        
        //log(JSON.stringify(res), "status");
                
    }, function(res){
        log("扫描蓝牙设备失败", "error");
    });
}

document.addEventListener('deviceready', function () {
    // 停止扫描按钮
    var stopScanBtn = document.getElementById('stopScanBtn');
	stopScanBtn.onclick = function(){
        clearInterval(loopScan);
		ble.stopScan(function(res){
            log("停止扫描成功", "success");
		}, function(res){
            log("停止扫描失败", "error");
		});
	};

    // 开始扫描按钮
    var startScanBtn = document.getElementById('startScanBtn');
	startScanBtn.onclick = function() {
        loopScan = setInterval(scanBT, 3000);
	};

    // 清空日志按钮
    var clearOutBtn = document.getElementById('clearOutBtn');
	clearOutBtn.onclick = function(){
		document.getElementById("output").innerHTML = "";
	};

    // 清空设备列表按钮
    var cleardeviceListBtn = document.getElementById('cleardeviceListBtn');
	cleardeviceListBtn.onclick = function(){
		document.getElementById("deviceListDiv").innerHTML = "";
	};
});


```
## index.htnl

```html
<!DOCTYPE html>
<!--
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->
<html>

<head>
    <!--
    Customize this policy to fit your own app's needs. For more guidance, see:
        https://github.com/apache/cordova-plugin-whitelist/blob/master/README.md#content-security-policy
    Some notes:
        * gap: is required only on iOS (when using UIWebView) and is needed for JS->native communication
        * https://ssl.gstatic.com is required only on Android and is needed for TalkBack to function properly
        * Disables use of inline scripts in order to mitigate risk of XSS vulnerabilities. To change this:
            * Enable inline JS: add 'unsafe-inline' to default-src
    -->
    <meta http-equiv="Content-Security-Policy"
        content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport"
        content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    <link rel="stylesheet" type="text/css" href="css/index.css">
    <title>Ble Scan</title>
</head>

<body>
    <div style="margin:10px;">
        <input type="text" id="idSubstring" placeholder="筛选id子串，例：A">
        <button class="commonBtn" id="startScanBtn" >开始扫描</button>
        <button class="commonBtn" id="stopScanBtn" >停止扫描</button>
        <button class="commonBtn" id="cleardeviceListBtn" >清空设备列表</button>
        <button class="commonBtn" id="clearOutBtn" >清空日志</button>
    </div>
    <div id="deviceListDiv" ></div>
    <div id="output" ></div>
    <script type="text/javascript" src="cordova.js"></script>
    <script type="text/javascript" src="js/index.js"></script>
</body>

</html>
```

