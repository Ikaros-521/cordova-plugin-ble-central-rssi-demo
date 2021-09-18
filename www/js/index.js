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

// 三点定位函数，分别传入 参考点a、b、c的x、y坐标、待测点与参考点a的距离
function threePointLocation(ax, ay, ad, bx, by, bd, cx, cy, cd)
{
	/*
		说明：参考的三点坐标及距离位置点的距离。
		不适用情况：三个参考点连成的三角形其两边（直角三角形的直角边）不能平行于xy坐标轴，例如p1(0,0),p2(3,0),p3(0,4),交点(3,4)
		测试数据：p1(0,0),p2(3,4),p3(6,0),交点(6,8)
	*/
	//var ref_x = [0, 3, 6];
	//var ref_y = [0, 4, 0];
	//var ref_d = [4, 3, 4];
	var ref_x = [];
	var ref_y = [];
	var ref_d = [];
	// 计算出的三组 (d[i]方-d[j]方-x[i]方+y[j]方+x[j]方-y[i]方)/(2*(x[j]-x[i]))
	var dxyx = [];
	// 计算出的三组 (d[i]方-d[j]方-x[i]方+y[j]方+x[j]方-y[i]方)/(2*(y[j]-y[i]))
	var dxyy = [];
	// 计算出的三组 (x[i]-x[j])/(y[i]-y[j])
	var x_divide_y = [];
	// 计算出的三组 (y[i]-y[j])/(x[i]-x[j])
	var y_divide_x = [];
	// 计算出的三组x y坐标
	var temp_x = [], temp_y = [];
	// 平均x y坐标
	var x = 0, y = 0;
	var i = 0, j = 0, k = 0;
	// 存储交点p坐标
	var p = JSON.parse("{\"x\": 0, \"y\": 0}");
	
	// 初始化数据
	ref_x.push(ax, bx, cx);
	ref_y.push(ay, by, cy);
	ref_d.push(ad, bd, cd);

	for(i = 0; i < 3; i++)
	{
		//console.log("p[" + i +"](" + ref_x[i] + ", " + ref_y[i] + "), dis=" + ref_d[i] + "\n");

		j = (i + 1) > 2 ? 2 : (i + 1);
		k = k > 1 ? 0 : k;
		
		//console.log("numerator:" + (ref_d[k] * ref_d[k] - ref_d[j] * ref_d[j] - ref_x[k] * ref_x[k] + ref_y[j] * ref_y[j] + ref_x[j] * ref_x[j] - ref_y[k] * ref_y[k]));


		if(ref_x[j] - ref_x[k] != 0) 
			dxyx[i] = (ref_d[k] * ref_d[k] - ref_d[j] * ref_d[j] - ref_x[k] * ref_x[k] + ref_y[j] * ref_y[j] + ref_x[j] * ref_x[j] - ref_y[k] * ref_y[k]) / 2 /(ref_x[j] - ref_x[k]);
		else
			dxyx[i] = 0;

		if(ref_y[j] - ref_y[k] != 0) 
			dxyy[i] = (ref_d[k] * ref_d[k] - ref_d[j] * ref_d[j] - ref_x[k] * ref_x[k] + ref_y[j] * ref_y[j] + ref_x[j] * ref_x[j] - ref_y[k] * ref_y[k]) / 2 /(ref_y[j] - ref_y[k]);
		else
			dxyy[i] = 0;

		if(ref_y[j] - ref_y[k] != 0)
			x_divide_y[i] = (ref_x[j] - ref_x[k]) / (ref_y[j] - ref_y[k]);
		else
			x_divide_y[i] = 0;

		if(ref_x[j] - ref_x[k] != 0)
			y_divide_x[i] = (ref_y[j] - ref_y[k]) / (ref_x[j] - ref_x[k]);
		else
			y_divide_x[i] = 0;
			
		//console.log("dxyx[" + i + "]:" + dxyx[i] + ", dxyy[" + i + "]:" + dxyy[i]);
		//console.log("x_divide_y[" + i + "]:" + x_divide_y[i] + ", y_divide_x[" + i + "]:" + y_divide_x[i]);

		k++;
	}

	j = 0;
	k = 0;
	for(i = 0; i < 3; i++)
	{
		j = (i + 1) > 2 ? 2 : (i + 1);
		k = k > 1 ? 0 : k;
		if(x_divide_y[k] - x_divide_y[j] != 0)
		{
			temp_x[i] = (dxyy[k] - dxyy[j]) / (x_divide_y[k] - x_divide_y[j]);
			temp_y[i] = (dxyx[k] - dxyx[j]) / (y_divide_x[k] - y_divide_x[j]);
		}
		else
		{
			temp_x[i] = 0;
			temp_y[i] = 0;
		}
	}

	x = (temp_x[0] + temp_x[1] + temp_x[2]) / 3;
	y = (temp_y[0] + temp_y[1] + temp_y[2]) / 3;

	// console.log("\n[ x:" + x + ", y:" + y + " ]\n"); 
	
	p.x = x;
	p.y = y;
	
	return p;
}

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
    var A = rssi1m;
    var n = EAT;

    // 遍历deviceList
    for(var i=0; i<deviceList.length; i++){
        var msgDiv = document.createElement("div");

        d = Math.pow(10, (Math.abs(deviceList[i].rssi) - A) / (10 * n));

        msgDiv.textContent = JSON.stringify(deviceList[i]) + " RSSI算法预估距离：" + d.toFixed(4) + "米";
        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("deviceListDiv").appendChild(msgDiv);
    }

    // 参考点大于等于3
    if(deviceList.length >= 3)
    {
        // 存储3点信息
        var d = [0, 0, 0];
        var x = [0, 0, 0];
        var y = [0, 0, 0];
        // 下标
        var index = 0;

        for(var i=0; i<deviceList.length; i++) {
            // if(index >= 3) break;

            for(var j=0; j<beacon["info"].length; j++) {
                // 此点匹配参考点时
                if(deviceList[i].id == beacon["info"][j].id) {
                    x[index] = beacon["info"][j].x;
                    y[index] = beacon["info"][j].y;
                    d[index] = Math.pow(10, (Math.abs(deviceList[i].rssi) - A) / (10 * n));

                    // log("x["+index+"]:"+x[index]+",y["+index+"]:"+y[index]+",d["+index+"]:"+d[index], "log");

                    index++;
                    break;
                }
                if(j == (beacon["info"].length - 1)) log("\"" + deviceList[i].id + "\",此点不在已知节点列表内", "log");
            }
        }

        // 匹配的参考点数大于2时，才能调用三点定位算法
        if(index >= 2)
        {
            var p = threePointLocation(x[0], y[0], d[0], x[1], y[1], d[1], x[2], y[2], d[2]);
            // log(p, "log");
            document.getElementById("coordinate").innerHTML = "坐标：（ "+ p.x.toFixed(4) + "，" + p.y.toFixed(4) + "）";
        }
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
                            // log("发现同id：" + deviceList[i].id + 
                            //     "消息，进行rssi值的替换，原rssi:" +
                            //     deviceList[i].rssi +
                            //     "，现rssi:" +
                            //     res["rssi"], "log");
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
        deviceList = [];
	};
});

