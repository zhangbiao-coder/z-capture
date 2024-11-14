"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZCapture = void 0;
const html2canvas_1 = __importDefault(require("html2canvas"));
class ZCapture {
    constructor() {
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
        //鼠标抬起结束坐标
        this.cutEndPos = new Array(2);
        //鼠标按下状态
        this.cutDown = false;
        //展示截图工具栏状态
        this.cutToolShow = false;
        //待编辑保存状态
        this.cutWaitStatus = false;
        //当前鼠标滑动状态 cut,line,rect
        this.cutMouseState = "";
        //启用画笔编辑
        this.cutEditStatus = false;
        //启用画框编辑
        this.cutRectStatus = false;
        this.captureWorkSpace = document.getElementById("z-capture-workspace-0726");
        if (!this.captureWorkSpace) {
            document.body.append(`<div class="cutImageStatus" id="z-capture-workspace-0726">
                                  <canvas class="screenCanvas"
                                  ></canvas>
                                  <div class="cut-tool">
                                    <div class="tool-left">
                                      <button type="button" title="自定义-画笔">笔</button>
                                      <button type="button" title="矩形-画框">框</button>
                                      <button type="button" title="清空画布">清</button>
                                    </div>
                                    <span class="tool-fg"></span>
                                    <div class="tool-right">
                                      <button type="button" title="取消">取消</button>
                                      <button type="button" title="保存">保存</button>
                                    </div>
                                  </div>
                                </div>`);
        }
    }
    capture() {
        var _a, _b, _c;
        /*this.shotPlugin = sessionStorage.getItem("cut-img-running-shotPlugin") || '';
        sessionStorage.removeItem("cutImgDataURL");
        */
        if (!this.canvas) {
            this.canvas = (_b = (_a = this.captureWorkSpace) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("canvas")) === null || _b === void 0 ? void 0 : _b[0];
            this.context = (_c = this.canvas) === null || _c === void 0 ? void 0 : _c.getContext("2d");
        }
        if (this.shotPlugin === "mediaDevices") {
            //现在项目中，只有查看监控的部分需要录屏截图，所以针对监控部分调整，显示隐藏播放器
            //第一步：进入截图，需要隐藏播放器，否则会遮挡提示框
            //this.playService.action({action: "hide", cameraCode: ''})
            const video = document.createElement("video");
            const gdmOptions = {
                video: true,
                preferCurrentTab: true
            };
            const mediaDevices = navigator.mediaDevices;
            mediaDevices.getDisplayMedia(gdmOptions).then((captureStream) => {
                //第二步：点击确定共享屏幕，展示播放器，方便后续的录制
                //this.playService.action({action: "show", cameraCode: ''});
                video.srcObject = captureStream;
                //500毫秒的延时是为了关闭录频提示框
                setTimeout(() => {
                    video.play().then(() => {
                        //第三步：录制屏幕完成，隐藏播放器，方便对截图进行操作
                        //this.playService.action({action: "hide", cameraCode: ''})
                        if (this.canvas && this.context) {
                            this.canvas.width = document.body.clientWidth;
                            this.canvas.height = document.body.clientHeight;
                            this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                        }
                        //进入截图界面，初始化状态
                        this.intoShot();
                        captureStream.getTracks().forEach((track) => track.stop());
                        video.remove();
                    });
                }, 500);
                //用户取消共享，会抛出异常
            }).catch((err) => {
                if (err) {
                    let e = err.toString();
                    if (~e.indexOf("NotAllowedError: Permission denied")) {
                        console.log("用户取消共享屏幕，截屏失败");
                    }
                    else {
                        console.error("Error: " + err);
                    }
                }
                //出现异常，关闭截图
                this.closeCut();
            });
        }
        else {
            (0, html2canvas_1.default)(document.getElementsByTagName("body")[0], {
                backgroundColor: 'white',
                useCORS: true, //支持图片跨域
                scale: 1 //设置放大倍数
            }).then((canvas) => {
                if (this.canvas && this.context) {
                    this.canvas.width = document.body.clientWidth;
                    this.canvas.height = document.body.clientHeight;
                    this.context.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
                }
                //进入截图界面，初始化状态
                this.intoShot();
            });
        }
    }
    ;
    //进入截图界面，初始化状态
    intoShot() {
        this.cutImageStatus = true;
        //鼠标按下状态
        this.cutDown = false;
        //展示截图工具栏状态
        this.cutToolShow = false;
        //待编辑保存状态
        this.cutWaitStatus = false;
        //图片编辑缓存状态
        this.canvasState = undefined;
        setTimeout(() => {
            if (this.canvas) {
                this.cutScreenDataURL = this.canvas.toDataURL();
                this.drawImageMask(0, 0, this.canvas.width, this.canvas.height, this.MASK_OPACITY);
            }
        }, 50);
    }
    drawImageMask(x, y, width, height, opacity) {
        if (this.context && this.cutImageStatus) {
            this.context.fillStyle = `rgba(0,0,0,${opacity})`;
            this.context.fillRect(x, y, width, height);
        }
    }
    //绘制截图区域
    drawCutImageShot(width, height, startX, startY, rectWidth, rectHeight) {
        //区域外部绘制
        this.drawOutShadow(startX, startY, rectWidth, rectHeight);
        //区域内部绘制
        if (this.context) {
            this.context.globalCompositeOperation = "destination-over";
        }
        this.drawScreenImg(width, height);
    }
    //绘制截图区域之外的阴影部分
    drawOutShadow(startX, startY, rectWidth, rectHeight) {
        //新图形只绘制与原图像不重叠的部分，重叠部分透明
        if (this.context) {
            this.context.globalCompositeOperation = "destination-out";
            this.context.fillStyle = "rgb(0,0,0)";
            this.context.fillRect(startX, startY, rectWidth, rectHeight);
        }
    }
    //绘制全屏截图
    drawScreenImg(width, height) {
        const image = new Image();
        image.src = this.cutScreenDataURL;
        if (this.context) {
            this.context.drawImage(image, 0, 0, width, height);
        }
        image.remove();
    }
    //恢复画布状态
    restoreCanvasState() {
        if (this.canvasState && this.context) {
            this.context.putImageData(this.canvasState, this.cutShotDataArray[0], this.cutShotDataArray[1]);
        }
    }
    //鼠标按下开始
    cutHandleCanvasMouseDown(event) {
        //开始截图
        if (!this.cutWaitStatus && this.cutImageStatus) {
            this.cutInitPos = [event.offsetX, event.offsetY];
            this.cutDown = true;
            this.cutMouseState = "cut";
        }
        //编辑截图
        if (this.canvas && this.context && this.cutWaitStatus && this.isWithinCutShotArea(event.offsetX, event.offsetY)) {
            this.cutInitPos = [event.offsetX, event.offsetY];
            this.cutDown = true;
            //保存画布状态
            let [sx, sy, sw, sh] = this.cutShotDataArray;
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
    }
    //鼠标滑动进行
    cutHandleCanvasMouseMove(event) {
        if (this.cutDown && this.canvas && this.context) {
            const endX = event.offsetX;
            const endY = event.offsetY;
            const [startX, startY] = this.cutInitPos;
            const rectWidth = endX - startX;
            const rectHeight = endY - startY;
            const { width, height } = this.canvas;
            switch (this.cutMouseState) {
                //截图中
                case "cut":
                    //清空画布
                    this.context.clearRect(0, 0, width, height);
                    this.cutShotDataArray = [startX, startY, rectWidth, rectHeight];
                    this.drawImageMask(0, 0, width, height, this.MASK_OPACITY);
                    //绘制矩形截图
                    this.drawCutImageShot(width, height, startX, startY, rectWidth, rectHeight);
                    break;
                //划线中
                case "line":
                    if (this.isWithinCutShotArea(endX, endY)) {
                        this.drawFreeLine(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop);
                    }
                    break;
                //画框中
                case "rect":
                    if (this.isWithinCutShotArea(endX, endY)) {
                        this.drawFreeRect(startX, startY, rectWidth, rectHeight);
                    }
                    break;
            }
        }
    }
    drawFreeLine(endX, endY) {
        //恢复状态
        this.restoreCanvasState();
        //新图形覆盖在原图像之上
        if (this.context) {
            this.context.globalCompositeOperation = "source-over";
            this.context.strokeStyle = "red";
            this.context.lineWidth = 2;
            this.context.lineTo(endX, endY);
            this.context.stroke();
        }
    }
    drawFreeRect(startX, startY, rectWidth, rectHeight) {
        //恢复状态
        this.restoreCanvasState();
        //新图形覆盖在原图像之上
        if (this.context) {
            this.context.globalCompositeOperation = "source-over";
            this.context.beginPath();
            this.context.strokeStyle = "red";
            this.context.lineWidth = 2;
            this.context.rect(startX, startY, rectWidth, rectHeight);
            this.context.stroke();
        }
    }
    //监测坐标是否在截图区域内
    isWithinCutShotArea(x, y) {
        return x >= this.cutShotDataArray[0] &&
            x <= this.cutShotDataArray[0] + this.cutShotDataArray[2] &&
            y >= this.cutShotDataArray[1] &&
            y <= this.cutShotDataArray[1] + this.cutShotDataArray[3];
    }
    //鼠标抬起完成
    cutHandleCanvasMouseUp(event) {
        if (this.cutDown && this.context) {
            switch (this.cutMouseState) {
                //截图结束
                case "cut":
                    this.cutEndPos = [event.offsetX, event.offsetY];
                    this.cutDown = false;
                    this.cutWaitStatus = true;
                    this.cutToolShow = true;
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
    }
    //右键关闭
    rightCloseCut(event) {
        event.preventDefault();
        this.closeCut();
    }
    //关闭截图
    closeCut() {
        this.cutImageStatus = false;
        this.cutWaitStatus = false;
        this.cutToolShow = false;
        const wtid = sessionStorage.getItem("cut-img-running-wtid");
        if (wtid) {
            let dm = window.document.querySelector("body>d-modal");
            if (dm) {
                let sty = getComputedStyle(dm);
                let op = sty.getPropertyValue("opacity");
                if (op === '0') {
                    // @ts-ignore
                    dm.style.opacity = 1;
                    sessionStorage.removeItem("cut-img-running-wtid");
                    sessionStorage.removeItem("cut-img-running-shotPlugin");
                }
            }
        }
    }
    selEdit() {
        if (this.cutWaitStatus) {
            this.cutEditStatus = true;
            this.cutRectStatus = false;
        }
    }
    selRect() {
        if (this.cutWaitStatus) {
            this.cutRectStatus = true;
            this.cutEditStatus = false;
        }
    }
    clearCanvas() {
        if (this.canvas && this.context) {
            //清空选中区域画布
            const [x, y, w, h] = this.cutShotDataArray;
            this.context.clearRect(x, y, w, h);
            const { width, height } = this.canvas;
            this.canvasState = undefined;
            //绘制矩形截图背景
            this.drawCutImageShot(width, height, this.cutShotDataArray[0], this.cutShotDataArray[1], this.cutShotDataArray[2], this.cutShotDataArray[3]);
        }
    }
    //保存截图
    saveCut() {
        if (this.canvas && this.context) {
            this.cutShotDataURL = this.canvas.toDataURL();
            const [x, y, w, h] = this.cutShotDataArray;
            const data = this.context.getImageData(x, y, w, h);
            const shotCanvas = document.createElement("canvas");
            const shotContext = shotCanvas.getContext("2d");
            if (shotContext != null) {
                shotCanvas.width = data.width;
                shotCanvas.height = data.height;
                shotContext.putImageData(data, 0, 0);
                //jpeg格式，数据更小
                const cutImgDataURL = shotCanvas.toDataURL('image/jpeg');
                sessionStorage.setItem("cutImgDataURL", cutImgDataURL);
                this.closeCut();
                const wtid = sessionStorage.getItem("cut-img-running-wtid");
                if (wtid) {
                    sessionStorage.removeItem("cut-img-running-wtid");
                    sessionStorage.removeItem("cut-img-running-shotPlugin");
                }
            }
            shotCanvas.remove();
        }
    }
    ;
}
exports.ZCapture = ZCapture;
