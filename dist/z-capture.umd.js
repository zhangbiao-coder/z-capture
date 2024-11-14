(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('html2canvas')) :
    typeof define === 'function' && define.amd ? define(['exports', 'html2canvas'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["z-capture"] = {}, global.html2canvas));
})(this, (function (exports, html2canvas) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

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
    var capture = Symbol("capture");
    var defaultOption = {
        engine: 'html2canvas',
        before: function () { return true; },
        start: function () {
        },
        end: function () {
        },
        save: function (baseImg) { return function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    //保存操作，图片默认写入用户剪贴板
                    return [4 /*yield*/, navigator.clipboard.writeText(baseImg)];
                    case 1:
                        //保存操作，图片默认写入用户剪贴板
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }; },
        after: function () {
        },
        error: function (e) {
            console.error(e);
        },
    };
    var ZCapture = /** @class */ (function () {
        function ZCapture(option) {
            var _this = this;
            var _a, _b, _c, _d;
            this.option = {};
            //是否进入截图状态
            this.cutImageStatus = false;
            this.cutShotDataArray = new Array(4);
            /**
             * 截图插件选择(默认使用：html2canvas)
             * html2canvas：html转canvas方式实现截图
             * mediaDevices：使用浏览器的录屏设备来实现截图
             */
            this.shotPlugin = "html2canvas";
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
            this.option = Object.assign({}, defaultOption, option);
            this.captureWorkSpace = window.document.getElementById("z-capture-workspace-0726");
            var first = false;
            if (!this.captureWorkSpace) {
                this.captureWorkSpace = window.document.createElement("div");
                this.captureWorkSpace.setAttribute("id", "z-capture-workspace-0726");
                this.captureWorkSpace.setAttribute("class", "cutImageStatus");
                this.captureWorkSpace.innerHTML = "\n                              <canvas class=\"screenCanvas\"></canvas>\n                              <div class=\"cut-tool\">\n                                <div class=\"tool-left\">\n                                  <button data-btnType=\"t-pen-btn\" type=\"button\" title=\"\u81EA\u5B9A\u4E49-\u753B\u7B14\">\u7B14</button>\n                                  <button data-btnType=\"t-rect-btn\" type=\"button\" title=\"\u77E9\u5F62-\u753B\u6846\">\u6846</button>\n                                  <button data-btnType=\"t-clear-btn\" type=\"button\" title=\"\u6E05\u7A7A\u753B\u5E03\">\u6E05</button>\n                                </div>\n                                <span class=\"tool-fg\"></span>\n                                <div class=\"tool-right\">\n                                  <button data-btnType=\"t-cancel-btn\" type=\"button\" title=\"\u53D6\u6D88\">\u53D6\u6D88</button>\n                                  <button data-btnType=\"t-save-btn\" type=\"button\" title=\"\u4FDD\u5B58\">\u4FDD\u5B58</button>\n                                </div>\n                              </div>";
                window.document.body.append(this.captureWorkSpace);
                first = true;
            }
            this.canvas = (_a = this.captureWorkSpace.getElementsByTagName("canvas")) === null || _a === void 0 ? void 0 : _a[0];
            this.context = (_b = this.canvas) === null || _b === void 0 ? void 0 : _b.getContext("2d");
            this.cutTool = (_c = this.captureWorkSpace.getElementsByClassName("cut-tool")) === null || _c === void 0 ? void 0 : _c[0];
            if (first) {
                //截图编辑工具区域按钮
                (_d = this.cutTool.querySelector("button")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function (e) {
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
                                break;
                            //画框
                            case "t-rect-btn":
                                _this[selRect]();
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
        }
        ZCapture.init = function (option) {
            return new ZCapture(option);
        };
        ZCapture.prototype[capture] = function () {
            var _this = this;
            //全屏截图前事件
            var before = this.option.before && this.option.before();
            if (!before) {
                return false;
            }
            if (this.shotPlugin === "mediaDevices") {
                var video_1 = window.document.createElement("video");
                var gdmOptions = {
                    video: true,
                    preferCurrentTab: true
                };
                var mediaDevices = navigator.mediaDevices;
                mediaDevices.getDisplayMedia(gdmOptions).then(function (captureStream) {
                    //截图开始事件
                    _this.option.start && _this.option.start();
                    video_1.srcObject = captureStream;
                    //500毫秒的延时是为了关闭录频提示框
                    setTimeout(function () {
                        video_1.play().then(function () {
                            if (_this.canvas && _this.context) {
                                _this.canvas.width = window.document.body.clientWidth;
                                _this.canvas.height = window.document.body.clientHeight;
                                _this.context.drawImage(video_1, 0, 0, _this.canvas.width, _this.canvas.height);
                            }
                            //进入截图界面，初始化状态
                            _this[intoShot]();
                            captureStream.getTracks().forEach(function (track) { return track.stop(); });
                            video_1.remove();
                            //截图完成
                            _this.option.end && _this.option.end();
                        });
                    }, 500);
                    //用户取消共享，会抛出异常
                }).catch(function (err) {
                    //异常
                    _this.option.error && _this.option.error(err);
                    if (err) {
                        var e = err.toString();
                        if (~e.indexOf("NotAllowedError: Permission denied")) {
                            console.log("用户取消共享屏幕，截屏失败");
                        }
                        else {
                            console.error("Error: " + err);
                        }
                    }
                    //出现异常，关闭截图
                    _this[closeCut]();
                });
            }
            else {
                //截图开始事件
                this.option.start && this.option.start();
                html2canvas(window.document.getElementsByTagName("body")[0], {
                    backgroundColor: 'white',
                    useCORS: true, //支持图片跨域
                    scale: 1 //设置放大倍数
                }).then(function (canvas) {
                    if (_this.canvas && _this.context) {
                        _this.canvas.width = window.document.body.clientWidth;
                        _this.canvas.height = window.document.body.clientHeight;
                        _this.context.drawImage(canvas, 0, 0, _this.canvas.width, _this.canvas.height);
                    }
                    //进入截图界面，初始化状态
                    _this[intoShot]();
                    //截图完成
                    _this.option.end && _this.option.end();
                });
            }
        };
        //进入截图界面，初始化状态
        ZCapture.prototype[intoShot] = function () {
            var _this = this;
            var _a;
            this.cutImageStatus = true;
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
                    _this.cutScreenDataURL = _this.canvas.toDataURL();
                    _this[drawImageMask](0, 0, _this.canvas.width, _this.canvas.height, _this.MASK_OPACITY);
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
        //鼠标按下开始
        ZCapture.prototype[cutHandleCanvasMouseDown] = function (event) {
            //开始截图
            if (!this.cutWaitStatus && this.cutImageStatus) {
                this.cutInitPos = [event.offsetX, event.offsetY];
                this.cutDown = true;
                this.cutMouseState = "cut";
            }
            //编辑截图
            if (this.canvas && this.context && this.cutWaitStatus && this[isWithinCutShotArea](event.offsetX, event.offsetY)) {
                this.cutInitPos = [event.offsetX, event.offsetY];
                this.cutDown = true;
                //保存画布状态
                var _a = this.cutShotDataArray, sx = _a[0], sy = _a[1], sw = _a[2], sh = _a[3];
                this.canvasState = this.context.getImageData(sx, sy, sw, sh);
                //开始划线
                if (this.cutEditStatus) {
                    // 开始绘制路径
                    this.cutMouseState = "line";
                    this.context.beginPath();
                    this.context.moveTo(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop);
                }
                //开始画框
                if (this.cutRectStatus) {
                    this.cutMouseState = "rect";
                }
            }
        };
        //鼠标滑动进行
        ZCapture.prototype[cutHandleCanvasMouseMove] = function (event) {
            if (this.cutDown && this.canvas && this.context) {
                var endX = event.offsetX;
                var endY = event.offsetY;
                var _a = this.cutInitPos, startX = _a[0], startY = _a[1];
                var rectWidth = endX - startX;
                var rectHeight = endY - startY;
                var _b = this.canvas, width = _b.width, height = _b.height;
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
                            this[drawFreeLine](event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop);
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
                            this.cutTool.style.top = event.offsetY + "px";
                            this.captureWorkSpace.appendChild(this.cutTool);
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
            var _a;
            this.cutImageStatus = false;
            this.cutWaitStatus = false;
            (_a = this.cutTool) === null || _a === void 0 ? void 0 : _a.remove();
            //截图之后事件
            this.option.after && this.option.after();
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
                    this.cutShotDataURL = shotCanvas.toDataURL('image/jpeg');
                    //确定保存截图
                    this.option.save && this.option.save(this.cutShotDataURL);
                }
                shotCanvas.remove();
                this[closeCut]();
            }
        };
        return ZCapture;
    }());

    exports.ZCapture = ZCapture;

}));
