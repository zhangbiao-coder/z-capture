(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('html2canvas-pro')) :
    typeof define === 'function' && define.amd ? define(['exports', 'html2canvas-pro'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ZCapture = {}, global.html2canvas));
})(this, (function (exports, html2canvas) { 'use strict';

    //‌保护对象属性‌：使用Symbol作为属性名可以隐藏对象的属性，使得在对象外部无法通过点语法访问这些属性，从而保护对象的私有属性‌
    var selPen = Symbol("selPen");
    var selRect = Symbol("selRect");
    var clearCanvas = Symbol("clearCanvas");
    var closeCut = Symbol("closeCut");
    var saveCut = Symbol("saveCut");
    var intoShot = Symbol("intoShot");
    var drawImageMask = Symbol("drawImageMask");
    var drawCutImageShot = Symbol("drawCutImageShot");
    var drawOutShadow = Symbol("drawOutShadow");
    var restoreCanvasState = Symbol("restoreCanvasState");
    var cutHandleCanvasMouseMove = Symbol("cutHandleCanvasMouseMove");
    var drawFreeLine = Symbol("drawFreeLine");
    var cutHandleCanvasMouseUp = Symbol("cutHandleCanvasMouseUp");
    var drawScreenImg = Symbol("drawScreenImg");
    var cutHandleCanvasMouseDown = Symbol("cutHandleCanvasMouseDown");
    var isWithinCutShotArea = Symbol("isWithinCutShotArea");
    var drawFreeRect = Symbol("drawFreeRect");
    var rightCloseCut = Symbol("rightCloseCut");
    var correctionCoord = Symbol("correctionCoord");
    var defaultOption = {
        engine: 'html2canvas',
        before: function () { return true; },
        start: function () { return void (0); },
        end: function () { return void (0); },
        save: function (capImg) { console.log(capImg); },
        after: function () { return void (0); },
        error: function (e) { console.error(e); },
    };
    var icons = {
        pen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>',
        rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-336c0-8.8 7.2-16 16-16l336 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32C35.8 32 0 67.8 0 112L0 448zm160 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm192 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-96 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm192 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM416 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm0 32a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-128a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>',
        rect2: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 48l0 416L48 464 48 48l416 0zM48 0L0 0 0 48 0 464l0 48 48 0 416 0 48 0 0-48 0-416 0-48L464 0 48 0z"/></svg>',
        eraser: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7L288 480l9.4 0L512 480c17.7 0 32-14.3 32-32s-14.3-32-32-32l-124.1 0L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416l-9.4 0-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg>',
        cancel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
        save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
    };
    var ZCapture = /** @class */ (function () {
        /**
         * 截图插件选择(默认使用：html2canvas)
         * html2canvas：html转canvas方式实现截图
         * mediaDevices：使用浏览器的录屏设备来实现截图
         */
        function ZCapture() {
            var _this = this;
            var _a, _b, _c;
            this.option = {};
            //是否进入截图状态
            this.cutImageStatus = false;
            this.cutShotDataArray = new Array(4);
            this.MASK_OPACITY = 0.5;
            //鼠标按下开始坐标
            this.cutInitPos = new Array(2);
            //鼠标按下状态
            this.cutDown = false;
            //待编辑保存状态
            this.cutWaitStatus = false;
            //当前鼠标滑动状态 cut,line,rect
            this.cutMouseState = "";
            //启用画笔编辑
            this.cutEditStatus = false;
            //启用画框编辑
            this.cutRectStatus = false;
            this.captureWorkSpace = window.document.getElementById("z-capture-workspace-0726");
            var first = false;
            if (!this.captureWorkSpace) {
                if (window.top.z_capture) {
                    this.captureWorkSpace = window.top.z_capture.captureWorkSpace;
                    this.cutTool = window.top.z_capture.cutTool;
                    window.document.body.append(this.captureWorkSpace);
                }
                else {
                    this.captureWorkSpace = window.document.createElement("div");
                    this.captureWorkSpace.setAttribute("id", "z-capture-workspace-0726");
                    this.captureWorkSpace.setAttribute("style", "z-index: 99999999999; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;");
                    this.captureWorkSpace.innerHTML = "<canvas class=\"screenCanvas\" style=\"height: 100%;width: 100%\"></canvas>";
                    window.document.body.append(this.captureWorkSpace);
                    this.cutTool = window.document.createElement("div");
                    this.cutTool.setAttribute("class", "cut-tool");
                    this.cutTool.setAttribute("style", "width: fit-content;position: absolute;background-color: white;display: flex;align-items: center;justify-content: space-around;");
                    this.cutTool.innerHTML = "<style> \n                                               #z-capture-workspace-0726 button {width: 28px; height: 25px; border: none;vertical-align: bottom;cursor:pointer;background-color: white;fill: #767676;}\n                                               #z-capture-workspace-0726 button:hover {background-color: #f0f0f0;fill: #2196F3;}\n                                               #z-capture-workspace-0726 button svg{width: 100%; height: 100%;}\n                                           </style>\n                                           <div class=\"tool-left\">\n                                              <button data-btnType=\"t-pen-btn\" type=\"button\" title=\"\u81EA\u5B9A\u4E49-\u753B\u7B14\">".concat(icons.pen, "</button>\n                                              <button data-btnType=\"t-rect-btn\" type=\"button\" title=\"\u77E9\u5F62-\u753B\u6846\">").concat(icons.rect, "</button>\n                                              <button data-btnType=\"t-clear-btn\" type=\"button\" title=\"\u6E05\u7A7A\u753B\u5E03\">").concat(icons.eraser, "</button>\n                                           </div>\n                                           <span class=\"tool-fg\" style=\"display: inline-block;width: 1px;border-right: 1px solid #a9a3a3;height: 18px;margin: 0 8px;\"></span>\n                                           <div class=\"tool-right\">\n                                              <button data-btnType=\"t-cancel-btn\" type=\"button\" title=\"\u53D6\u6D88\">").concat(icons.cancel, "</button>\n                                              <button data-btnType=\"t-save-btn\" type=\"button\" title=\"\u4FDD\u5B58\">").concat(icons.save, "</button>\n                                           </div>");
                    first = true;
                }
            }
            this.canvas = (_a = this.captureWorkSpace.getElementsByTagName("canvas")) === null || _a === void 0 ? void 0 : _a[0];
            this.context = (_b = this.canvas) === null || _b === void 0 ? void 0 : _b.getContext("2d");
            this.cutTool = this.cutTool || ((_c = this.captureWorkSpace.getElementsByClassName("cut-tool")) === null || _c === void 0 ? void 0 : _c[0]);
            if (first) {
                //截图编辑工具区域按钮
                this.cutTool.addEventListener("click", function (e) {
                    var target = e.target;
                    if (target.tagName !== "BUTTON") {
                        target = target.closest("button");
                    }
                    if (target) {
                        var btnType = target.getAttribute("data-btnType");
                        switch (btnType) {
                            //画笔
                            case "t-pen-btn":
                                _this[selPen]();
                                _this.cutTool.querySelector("button[data-btnType='t-rect-btn']").style.fill = "#767676";
                                target.style.fill = "#3355ff";
                                break;
                            //画框
                            case "t-rect-btn":
                                _this[selRect]();
                                _this.cutTool.querySelector("button[data-btnType='t-pen-btn']").style.fill = "#767676";
                                target.style.fill = "#3355ff";
                                break;
                            //清空
                            case "t-clear-btn":
                                _this[clearCanvas]();
                                break;
                            //取消
                            case "t-cancel-btn":
                                _this[closeCut]();
                                break;
                            //保存
                            case "t-save-btn":
                                _this[saveCut]();
                                break;
                        }
                    }
                });
                this.canvas.addEventListener("mousedown", function (e) {
                    _this[cutHandleCanvasMouseDown](e);
                });
                this.canvas.addEventListener("mousemove", function (e) {
                    _this[cutHandleCanvasMouseMove](e);
                });
                this.canvas.addEventListener("mouseup", function (e) {
                    _this[cutHandleCanvasMouseUp](e);
                });
                this.canvas.addEventListener("contextmenu", function (e) {
                    _this[rightCloseCut](e);
                });
            }
            this.cutTool.remove();
        }
        ZCapture.capture = function (option) {
            var z_capture = window.top.z_capture;
            if (!z_capture) {
                z_capture = new ZCapture();
                window.top.z_capture = z_capture;
            }
            return z_capture.capture(option);
        };
        ZCapture.prototype.capture = function (option) {
            var _this = this;
            this.option = Object.assign({}, defaultOption, (option || {}));
            //全屏截图前事件
            var before = this.option.before();
            if (!before) {
                return false;
            }
            if (this.option.engine === "mediaDevices") {
                var video_1 = document.createElement("video");
                var gdmOptions = {
                    video: {
                        // 尽量使用显示器的最大分辨率
                        width: { ideal: window.screen.width },
                        height: { ideal: window.screen.height },
                        frameRate: { ideal: 30 } // 可根据需求调整帧率
                    },
                    preferCurrentTab: true
                };
                var mediaDevices = navigator.mediaDevices;
                mediaDevices.getDisplayMedia(gdmOptions).then(function (captureStream) {
                    // 截图开始事件
                    _this.option.start();
                    video_1.srcObject = captureStream;
                    // 确保视频流加载完成
                    video_1.onloadedmetadata = function () {
                        video_1.play().then(function () {
                            if (_this.canvas && _this.context) {
                                // 设置 canvas 宽高为视频分辨率的设备像素比版本
                                var scale = window.devicePixelRatio || 1;
                                var videoWidth = video_1.videoWidth * scale;
                                var videoHeight = video_1.videoHeight * scale;
                                _this.canvas.width = videoWidth;
                                _this.canvas.height = videoHeight;
                                // 绘制高分辨率的截图
                                _this.context.drawImage(video_1, 0, 0, videoWidth, videoHeight);
                            }
                            // 进入截图界面，初始化状态
                            _this[intoShot]();
                            // 停止捕获的媒体流
                            captureStream.getTracks().forEach(function (track) { return track.stop(); });
                            video_1.remove();
                        });
                    };
                }).catch(function (err) {
                    // 异常处理
                    _this.option.error(err);
                    if (err) {
                        var e = err.toString();
                        if (~e.indexOf("NotAllowedError: Permission denied")) {
                            console.warn("用户取消共享屏幕，截屏失败");
                        }
                        else {
                            console.error("Error: " + err);
                        }
                    }
                    // 出现异常，关闭截图
                    _this[closeCut]();
                });
            }
            else {
                //截图开始事件
                this.option.start();
                //调整清晰度
                html2canvas(document.body, {
                    backgroundColor: 'white',
                    useCORS: true, // 支持图片跨域
                    scale: window.devicePixelRatio || 1, // 设置为设备像素比，提升清晰度
                }).then(function (canvas) {
                    if (_this.canvas && _this.context) {
                        // 获取原始 canvas 的尺寸
                        var originalWidth = canvas.width;
                        var originalHeight = canvas.height;
                        // 设置目标 canvas 的尺寸与原始 canvas 一致
                        _this.canvas.width = originalWidth;
                        _this.canvas.height = originalHeight;
                        // 清除目标 canvas
                        _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                        // 将高分辨率的 canvas 绘制到目标 canvas 上
                        _this.context.drawImage(canvas, 0, 0, originalWidth, originalHeight);
                    }
                    // 进入截图界面，初始化状态
                    _this[intoShot]();
                }).catch(function (error) {
                    //异常
                    _this.option.error(error);
                    console.error('html2canvas 生成图片失败:', error);
                });
            }
        };
        //进入截图界面，初始化状态
        ZCapture.prototype[intoShot] = function () {
            var _this = this;
            var _a;
            this.cutImageStatus = true;
            if (!window.document.getElementById("z-capture-workspace-0726")) {
                window.document.body.append(this.captureWorkSpace);
            }
            //鼠标按下状态
            this.cutDown = false;
            //隐藏截图工具栏状态
            (_a = this.cutTool) === null || _a === void 0 ? void 0 : _a.remove();
            //待编辑保存状态
            this.cutWaitStatus = false;
            //图片编辑缓存状态
            this.canvasState = undefined;
            setTimeout(function () {
                if (_this.canvas) {
                    _this.cutScreenDataURL = _this.canvas.toDataURL('image/png');
                    _this[drawImageMask](0, 0, _this.canvas.width, _this.canvas.height, _this.MASK_OPACITY);
                    //截图完成
                    _this.option.end(_this.cutScreenDataURL);
                }
            }, 50);
        };
        ZCapture.prototype[drawImageMask] = function (x, y, width, height, opacity) {
            if (this.context && this.cutImageStatus) {
                this.context.fillStyle = "rgba(0,0,0,".concat(opacity, ")");
                this.context.fillRect(x, y, width, height);
            }
        };
        //绘制截图区域
        ZCapture.prototype[drawCutImageShot] = function (width, height, startX, startY, rectWidth, rectHeight) {
            //区域外部绘制
            this[drawOutShadow](startX, startY, rectWidth, rectHeight);
            //区域内部绘制
            if (this.context) {
                this.context.globalCompositeOperation = "destination-over";
            }
            this[drawScreenImg](width, height);
        };
        //绘制截图区域之外的阴影部分
        ZCapture.prototype[drawOutShadow] = function (startX, startY, rectWidth, rectHeight) {
            //新图形只绘制与原图像不重叠的部分，重叠部分透明
            if (this.context) {
                this.context.globalCompositeOperation = "destination-out";
                this.context.fillStyle = "rgb(0,0,0)";
                this.context.fillRect(startX, startY, rectWidth, rectHeight);
            }
        };
        //绘制全屏截图
        ZCapture.prototype[drawScreenImg] = function (width, height) {
            var image = new Image();
            image.src = this.cutScreenDataURL;
            if (this.context) {
                this.context.drawImage(image, 0, 0, width, height);
            }
            image.remove();
        };
        //恢复画布状态
        ZCapture.prototype[restoreCanvasState] = function () {
            if (this.canvasState && this.context) {
                this.context.putImageData(this.canvasState, this.cutShotDataArray[0], this.cutShotDataArray[1]);
            }
        };
        //校正坐标
        ZCapture.prototype[correctionCoord] = function (old_x, old_y) {
            // 获取 Canvas 元素的实际位置
            var rect = this.canvas.getBoundingClientRect();
            // 计算事件相对于 Canvas 的坐标
            var scaleX = this.canvas.width / rect.width;
            var scaleY = this.canvas.height / rect.height;
            // 获取正确的绘制坐标
            var x = (old_x - rect.left) * scaleX;
            var y = (old_y - rect.top) * scaleY;
            return [x, y];
        };
        //鼠标按下开始
        ZCapture.prototype[cutHandleCanvasMouseDown] = function (event) {
            var _a = this[correctionCoord](event.clientX, event.clientY), x = _a[0], y = _a[1];
            //开始截图
            if (!this.cutWaitStatus && this.cutImageStatus) {
                this.cutInitPos = [x, y];
                this.cutDown = true;
                this.cutMouseState = "cut";
            }
            //编辑截图
            if (this.canvas && this.context && this.cutWaitStatus && this[isWithinCutShotArea](x, y)) {
                this.cutInitPos = [x, y];
                this.cutDown = true;
                //保存画布状态
                var _b = this.cutShotDataArray, sx = _b[0], sy = _b[1], sw = _b[2], sh = _b[3];
                this.canvasState = this.context.getImageData(sx, sy, sw, sh);
                //开始划线
                if (this.cutEditStatus) {
                    // 开始绘制路径
                    this.cutMouseState = "line";
                    this.context.beginPath();
                    this.context.moveTo(x - this.canvas.offsetLeft, y - this.canvas.offsetTop);
                }
                //开始画框
                if (this.cutRectStatus) {
                    this.cutMouseState = "rect";
                }
            }
        };
        //鼠标滑动进行
        ZCapture.prototype[cutHandleCanvasMouseMove] = function (event) {
            var _a = this[correctionCoord](event.clientX, event.clientY), x = _a[0], y = _a[1];
            if (this.cutDown && this.canvas && this.context) {
                var endX = x;
                var endY = y;
                var _b = this.cutInitPos, startX = _b[0], startY = _b[1];
                var rectWidth = endX - startX;
                var rectHeight = endY - startY;
                var _c = this.canvas, width = _c.width, height = _c.height;
                switch (this.cutMouseState) {
                    //截图中
                    case "cut":
                        //清空画布
                        this.context.clearRect(0, 0, width, height);
                        this.cutShotDataArray = [startX, startY, rectWidth, rectHeight];
                        this[drawImageMask](0, 0, width, height, this.MASK_OPACITY);
                        //绘制矩形截图
                        this[drawCutImageShot](width, height, startX, startY, rectWidth, rectHeight);
                        break;
                    //划线中
                    case "line":
                        if (this[isWithinCutShotArea](endX, endY)) {
                            this[drawFreeLine](x - this.canvas.offsetLeft, y - this.canvas.offsetTop);
                        }
                        break;
                    //画框中
                    case "rect":
                        if (this[isWithinCutShotArea](endX, endY)) {
                            this[drawFreeRect](startX, startY, rectWidth, rectHeight);
                        }
                        break;
                }
            }
        };
        ZCapture.prototype[drawFreeLine] = function (endX, endY) {
            //恢复状态
            this[restoreCanvasState]();
            //新图形覆盖在原图像之上
            if (this.context) {
                this.context.globalCompositeOperation = "source-over";
                this.context.strokeStyle = "red";
                this.context.lineWidth = 2;
                this.context.lineTo(endX, endY);
                this.context.stroke();
            }
        };
        ZCapture.prototype[drawFreeRect] = function (startX, startY, rectWidth, rectHeight) {
            //恢复状态
            this[restoreCanvasState]();
            //新图形覆盖在原图像之上
            if (this.context) {
                this.context.globalCompositeOperation = "source-over";
                this.context.beginPath();
                this.context.strokeStyle = "red";
                this.context.lineWidth = 2;
                this.context.rect(startX, startY, rectWidth, rectHeight);
                this.context.stroke();
            }
        };
        //监测坐标是否在截图区域内
        ZCapture.prototype[isWithinCutShotArea] = function (x, y) {
            return x >= this.cutShotDataArray[0] &&
                x <= this.cutShotDataArray[0] + this.cutShotDataArray[2] &&
                y >= this.cutShotDataArray[1] &&
                y <= this.cutShotDataArray[1] + this.cutShotDataArray[3];
        };
        //鼠标抬起完成
        ZCapture.prototype[cutHandleCanvasMouseUp] = function (event) {
            if (this.cutDown && this.context) {
                switch (this.cutMouseState) {
                    //截图结束
                    case "cut":
                        this.cutDown = false;
                        this.cutWaitStatus = true;
                        if (this.captureWorkSpace && this.cutTool) {
                            this.captureWorkSpace.appendChild(this.cutTool);
                            this.cutTool.style.left = (event.clientX - this.cutTool.clientWidth) + "px";
                            this.cutTool.style.top = event.clientY + "px";
                        }
                        this.cutMouseState = "";
                        break;
                    //结束划线
                    case "line":
                        this.context.closePath();
                        this.cutMouseState = "";
                        this.cutDown = false;
                        break;
                    //结束画框
                    case "rect":
                        this.context.closePath();
                        this.cutMouseState = "";
                        this.cutDown = false;
                        break;
                }
            }
        };
        //右键关闭
        ZCapture.prototype[rightCloseCut] = function (event) {
            event.preventDefault();
            this[closeCut]();
        };
        //关闭截图
        ZCapture.prototype[closeCut] = function () {
            this.cutImageStatus = false;
            this.cutWaitStatus = false;
            console.log("截图关闭..");
            this.captureWorkSpace.remove();
            //截图之后事件
            this.option.after();
        };
        ZCapture.prototype[selPen] = function () {
            if (this.cutWaitStatus) {
                this.cutEditStatus = true;
                this.cutRectStatus = false;
            }
        };
        ZCapture.prototype[selRect] = function () {
            if (this.cutWaitStatus) {
                this.cutRectStatus = true;
                this.cutEditStatus = false;
            }
        };
        ZCapture.prototype[clearCanvas] = function () {
            if (this.canvas && this.context) {
                //清空选中区域画布
                var _a = this.cutShotDataArray, x = _a[0], y = _a[1], w = _a[2], h = _a[3];
                this.context.clearRect(x, y, w, h);
                var _b = this.canvas, width = _b.width, height = _b.height;
                this.canvasState = undefined;
                //绘制矩形截图背景
                this[drawCutImageShot](width, height, this.cutShotDataArray[0], this.cutShotDataArray[1], this.cutShotDataArray[2], this.cutShotDataArray[3]);
            }
        };
        //保存截图
        ZCapture.prototype[saveCut] = function () {
            if (this.canvas && this.context) {
                var _a = this.cutShotDataArray, x = _a[0], y = _a[1], w = _a[2], h = _a[3];
                var data = this.context.getImageData(x, y, w, h);
                var shotCanvas = window.document.createElement("canvas");
                var shotContext = shotCanvas.getContext("2d");
                if (shotContext != null) {
                    shotCanvas.width = data.width;
                    shotCanvas.height = data.height;
                    shotContext.putImageData(data, 0, 0);
                    //jpeg格式，数据更小
                    this.cutShotDataURL = shotCanvas.toDataURL('image/png');
                    this.option.error("test-error");
                    //确定保存截图
                    this.option.save(this.cutShotDataURL);
                }
                shotCanvas.remove();
                this[closeCut]();
            }
        };
        return ZCapture;
    }());

    exports.ZCUtil = ZCapture;

}));
