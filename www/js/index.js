/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

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

