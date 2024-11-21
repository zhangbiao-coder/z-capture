import html2canvas from "html2canvas-pro";
import {Option} from "./option";

//‌保护对象属性‌：使用Symbol作为属性名可以隐藏对象的属性，使得在对象外部无法通过点语法访问这些属性，从而保护对象的私有属性‌
const selPen = Symbol("selPen");
const selRect = Symbol("selRect");
const clearCanvas = Symbol("clearCanvas");
const closeCut = Symbol("closeCut");
const saveCut = Symbol("saveCut");
const intoShot = Symbol("intoShot");
const drawImageMask = Symbol("drawImageMask");
const drawCutImageShot = Symbol("drawCutImageShot");
const drawOutShadow = Symbol("drawOutShadow");
const restoreCanvasState = Symbol("restoreCanvasState");
const cutHandleCanvasMouseMove = Symbol("cutHandleCanvasMouseMove");
const drawFreeLine = Symbol("drawFreeLine");
const cutHandleCanvasMouseUp = Symbol("cutHandleCanvasMouseUp");
const drawScreenImg = Symbol("drawScreenImg");
const cutHandleCanvasMouseDown = Symbol("cutHandleCanvasMouseDown");
const isWithinCutShotArea = Symbol("isWithinCutShotArea");
const drawFreeRect = Symbol("drawFreeRect");
const rightCloseCut = Symbol("rightCloseCut");
const correctionCoord = Symbol("correctionCoord");

const defaultOption: Option = {
    engine: 'html2canvas',
    before: () => true,
    start: () => void (0),
    end: () => void (0),
    save: (capImg: string) => {
        console.log(capImg);
    },
    after: () => void (0),
    error: (e) => {
        console.error(e);
    },
}

const icons = {
    pen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>',
    rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-336c0-8.8 7.2-16 16-16l336 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32C35.8 32 0 67.8 0 112L0 448zm160 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm192 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-96 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm192 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM416 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm0 32a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-128a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>',
    rect2: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 48l0 416L48 464 48 48l416 0zM48 0L0 0 0 48 0 464l0 48 48 0 416 0 48 0 0-48 0-416 0-48L464 0 48 0z"/></svg>',
    eraser: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7L288 480l9.4 0L512 480c17.7 0 32-14.3 32-32s-14.3-32-32-32l-124.1 0L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416l-9.4 0-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg>',
    cancel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
};

export class ZCapture {
    private option: Option = {};

    //是否进入截图状态
    private cutImageStatus = false;
    //全屏截图
    private cutScreenDataURL: any;
    //截取后的图片
    private cutShotDataURL: any;
    private cutShotDataArray: Array<number> = new Array(4);

    //绘制全屏canvas
    private readonly captureWorkSpace: HTMLElement | undefined | null;
    private readonly canvas: HTMLCanvasElement | undefined;
    private readonly context: CanvasRenderingContext2D | null | undefined;

    //截图操作工具栏
    private readonly cutTool: HTMLElement | undefined;

    /**
     * 截图插件选择(默认使用：html2canvas)
     * html2canvas：html转canvas方式实现截图
     * mediaDevices：使用浏览器的录屏设备来实现截图
     */
    constructor() {
        this.captureWorkSpace = window.document.getElementById("z-capture-workspace-0726");
        let first = false;
        if (!this.captureWorkSpace) {
            if ((window.top as any).z_capture) {
                this.captureWorkSpace = (window.top as any).z_capture.captureWorkSpace;
                this.cutTool = (window.top as any).z_capture.cutTool;
                window.document.body.append(this.captureWorkSpace);
            } else {
                this.captureWorkSpace = window.document.createElement("div");
                this.captureWorkSpace.setAttribute("id", "z-capture-workspace-0726");
                this.captureWorkSpace.setAttribute("style", "z-index: 99999999999; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;");
                this.captureWorkSpace.innerHTML = `<canvas class="screenCanvas" style="height: 100%;width: 100%"></canvas>`;
                window.document.body.append(this.captureWorkSpace);

                this.cutTool = window.document.createElement("div");
                this.cutTool.setAttribute("class", "cut-tool");
                this.cutTool.setAttribute("style", "width: fit-content;position: absolute;background-color: white;display: flex;align-items: center;justify-content: space-around;");
                this.cutTool.innerHTML = `<style> 
                                               #z-capture-workspace-0726 button {width: 28px; height: 25px; border: none;vertical-align: bottom;cursor:pointer;background-color: white;fill: #767676;}
                                               #z-capture-workspace-0726 button:hover {background-color: #f0f0f0;fill: #2196F3;}
                                               #z-capture-workspace-0726 button svg{width: 100%; height: 100%;}
                                           </style>
                                           <div class="tool-left">
                                              <button data-btnType="t-pen-btn" type="button" title="自定义-画笔">${icons.pen}</button>
                                              <button data-btnType="t-rect-btn" type="button" title="矩形-画框">${icons.rect}</button>
                                              <button data-btnType="t-clear-btn" type="button" title="清空画布">${icons.eraser}</button>
                                           </div>
                                           <span class="tool-fg" style="display: inline-block;width: 1px;border-right: 1px solid #a9a3a3;height: 18px;margin: 0 8px;"></span>
                                           <div class="tool-right">
                                              <button data-btnType="t-cancel-btn" type="button" title="取消">${icons.cancel}</button>
                                              <button data-btnType="t-save-btn" type="button" title="保存">${icons.save}</button>
                                           </div>`;
                first = true;
            }
        }
        this.canvas = this.captureWorkSpace.getElementsByTagName("canvas")?.[0];
        this.context = this.canvas?.getContext("2d");
        this.cutTool = this.cutTool || this.captureWorkSpace.getElementsByClassName("cut-tool")?.[0] as HTMLElement;

        if (first) {
            //截图编辑工具区域按钮
            this.cutTool.addEventListener("click", (e) => {
                let target = e.target as HTMLElement;
                if (target.tagName !== "BUTTON") {
                    target = target.closest("button") as HTMLElement;
                }
                if (target) {
                    const btnType = target.getAttribute("data-btnType");
                    switch (btnType) {
                        //画笔
                        case "t-pen-btn":
                            this[selPen]();
                            (this.cutTool.querySelector("button[data-btnType='t-rect-btn']") as HTMLElement).style.fill = "#767676";
                            target.style.fill = "#3355ff";
                            break;
                        //画框
                        case "t-rect-btn":
                            this[selRect]();
                            (this.cutTool.querySelector("button[data-btnType='t-pen-btn']") as HTMLElement).style.fill = "#767676";
                            target.style.fill = "#3355ff";
                            break;
                        //清空
                        case "t-clear-btn":
                            this[clearCanvas]();
                            break;
                        //取消
                        case "t-cancel-btn":
                            this[closeCut]();
                            break;
                        //保存
                        case "t-save-btn":
                            this[saveCut]();
                            break;
                        default:
                            break;
                    }
                }
            });

            this.canvas.addEventListener("mousedown", (e) => {
                this[cutHandleCanvasMouseDown](e);
            });
            this.canvas.addEventListener("mousemove", (e) => {
                this[cutHandleCanvasMouseMove](e);
            });
            this.canvas.addEventListener("mouseup", (e) => {
                this[cutHandleCanvasMouseUp](e);
            });
            this.canvas.addEventListener("contextmenu", (e) => {
                this[rightCloseCut](e);
            });
        }
        this.cutTool.remove();
    }

    static capture(option?: Option) {
        let z_capture = (window.top as any).z_capture;
        if (!z_capture) {
            z_capture = new ZCapture();
            (window.top as any).z_capture = z_capture;
        }
        return z_capture.capture(option);
    }


    capture(option?: Option) {
        this.option = Object.assign({}, defaultOption, (option || {}));
        //全屏截图前事件
        const before = this.option.before();
        if (!before) {
            return false;
        }
        if (this.option.engine === "mediaDevices") {
            const video: HTMLVideoElement = document.createElement("video");
            const gdmOptions = {
                video: {
                    // 尽量使用显示器的最大分辨率
                    width: {ideal: window.screen.width},
                    height: {ideal: window.screen.height},
                    frameRate: {ideal: 30} // 可根据需求调整帧率
                },
                preferCurrentTab: true
            };
            const mediaDevices = navigator.mediaDevices;

            mediaDevices.getDisplayMedia(gdmOptions).then((captureStream: MediaStream) => {
                // 截图开始事件
                this.option.start();
                video.srcObject = captureStream;
                // 确保视频流加载完成
                video.onloadedmetadata = () => {
                    video.play().then(() => {
                        if (this.canvas && this.context) {
                            // 设置 canvas 宽高为视频分辨率的设备像素比版本
                            const scale = window.devicePixelRatio || 1;
                            const videoWidth = video.videoWidth * scale;
                            const videoHeight = video.videoHeight * scale;

                            this.canvas.width = videoWidth;
                            this.canvas.height = videoHeight;

                            // 绘制高分辨率的截图
                            this.context.drawImage(video, 0, 0, videoWidth, videoHeight);
                        }

                        // 进入截图界面，初始化状态
                        this[intoShot]();

                        // 停止捕获的媒体流
                        captureStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                        video.remove();
                    });
                };
            }).catch((err: any) => {
                // 异常处理
                this.option.error(err);

                if (err) {
                    let e = err.toString() as string;
                    if (~e.indexOf("NotAllowedError: Permission denied")) {
                        console.warn("用户取消共享屏幕，截屏失败");
                    } else {
                        console.error("Error: " + err);
                    }
                }
                // 出现异常，关闭截图
                this[closeCut]();
            });
        } else {
            //截图开始事件
            this.option.start();
            //调整清晰度
            html2canvas(document.body, {
                backgroundColor: 'white',
                useCORS: true, // 支持图片跨域
                scale: window.devicePixelRatio || 1, // 设置为设备像素比，提升清晰度
            }).then((canvas) => {
                if (this.canvas && this.context) {
                    // 获取原始 canvas 的尺寸
                    const originalWidth = canvas.width;
                    const originalHeight = canvas.height;

                    // 设置目标 canvas 的尺寸与原始 canvas 一致
                    this.canvas.width = originalWidth;
                    this.canvas.height = originalHeight;

                    // 清除目标 canvas
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                    // 将高分辨率的 canvas 绘制到目标 canvas 上
                    this.context.drawImage(canvas, 0, 0, originalWidth, originalHeight);
                }
                // 进入截图界面，初始化状态
                this[intoShot]();
            }).catch((error) => {
                //异常
                this.option.error(error);
                console.error('html2canvas 生成图片失败:', error);
            });


        }
    };

    //进入截图界面，初始化状态
    [intoShot]() {
        this.cutImageStatus = true;

        if (!window.document.getElementById("z-capture-workspace-0726")) {
            window.document.body.append(this.captureWorkSpace);
        }

        //鼠标按下状态
        this.cutDown = false;
        //隐藏截图工具栏状态
        this.cutTool?.remove();
        //待编辑保存状态
        this.cutWaitStatus = false;
        //图片编辑缓存状态
        this.canvasState = undefined;

        setTimeout(() => {
            if (this.canvas) {
                this.cutScreenDataURL = this.canvas.toDataURL('image/png');
                this[drawImageMask](0, 0, this.canvas.width, this.canvas.height, this.MASK_OPACITY);

                //截图完成
                this.option.end(this.cutScreenDataURL);
            }
        }, 50);
    }

    MASK_OPACITY = 0.5;

    [drawImageMask](x: number, y: number, width: number, height: number, opacity: number) {
        if (this.context && this.cutImageStatus) {
            this.context.fillStyle = `rgba(0,0,0,${opacity})`;
            this.context.fillRect(x, y, width, height);
        }

    }

    //绘制截图区域
    [drawCutImageShot](width: number, height: number, startX: number, startY: number, rectWidth: number, rectHeight: number) {
        //区域外部绘制
        this[drawOutShadow](startX, startY, rectWidth, rectHeight);

        //区域内部绘制
        if (this.context) {
            this.context.globalCompositeOperation = "destination-over";
        }
        this[drawScreenImg](width, height);
    }

    //绘制截图区域之外的阴影部分
    [drawOutShadow](startX: number, startY: number, rectWidth: number, rectHeight: number) {
        //新图形只绘制与原图像不重叠的部分，重叠部分透明
        if (this.context) {
            this.context.globalCompositeOperation = "destination-out";
            this.context.fillStyle = "rgb(0,0,0)";
            this.context.fillRect(startX, startY, rectWidth, rectHeight);
        }
    }

    //绘制全屏截图
    [drawScreenImg](width: number, height: number) {
        const image = new Image();
        image.src = this.cutScreenDataURL;
        if (this.context) {
            this.context.drawImage(image, 0, 0, width, height);
        }
        image.remove();
    }

    //鼠标按下开始坐标
    private cutInitPos: Array<number> = new Array<number>(2);
    //鼠标按下状态
    private cutDown = false;
    //待编辑保存状态
    private cutWaitStatus = false;
    //当前鼠标滑动状态 cut,line,rect
    private cutMouseState = "";
    //画布状态
    private canvasState: undefined | ImageData;

    //恢复画布状态
    [restoreCanvasState]() {
        if (this.canvasState && this.context) {
            this.context.putImageData(this.canvasState, this.cutShotDataArray[0], this.cutShotDataArray[1]);
        }
    }

    //校正坐标
    [correctionCoord](old_x: number, old_y: number) {
        // 获取 Canvas 元素的实际位置
        const rect = this.canvas.getBoundingClientRect();

        // 计算事件相对于 Canvas 的坐标
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        // 获取正确的绘制坐标
        const x = (old_x - rect.left) * scaleX;
        const y = (old_y - rect.top) * scaleY;
        return [x, y];
    }

    //鼠标按下开始
    [cutHandleCanvasMouseDown](event: MouseEvent) {
        let [x, y] = this[correctionCoord](event.clientX, event.clientY);
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
            let [sx, sy, sw, sh] = this.cutShotDataArray;
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


    }

    //鼠标滑动进行
    [cutHandleCanvasMouseMove](event: MouseEvent) {
        let [x, y] = this[correctionCoord](event.clientX, event.clientY);
        if (this.cutDown && this.canvas && this.context) {
            const endX = x;
            const endY = y;
            const [startX, startY] = this.cutInitPos;
            const rectWidth = endX - startX;
            const rectHeight = endY - startY;
            const {width, height} = this.canvas;


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
    }

    [drawFreeLine](endX: number, endY: number) {
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
    }

    [drawFreeRect](startX: number, startY: number, rectWidth: number, rectHeight: number) {
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

    }

    //监测坐标是否在截图区域内
    [isWithinCutShotArea](x: number, y: number) {
        return x >= this.cutShotDataArray[0] &&
            x <= this.cutShotDataArray[0] + this.cutShotDataArray[2] &&
            y >= this.cutShotDataArray[1] &&
            y <= this.cutShotDataArray[1] + this.cutShotDataArray[3];
    }

    //鼠标抬起完成
    [cutHandleCanvasMouseUp](event: MouseEvent) {
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
    }

    //右键关闭
    [rightCloseCut](event: Event) {
        event.preventDefault();
        this[closeCut]();
    }

    //关闭截图
    [closeCut]() {
        this.cutImageStatus = false;
        this.cutWaitStatus = false;
        console.log("截图关闭..")
        this.captureWorkSpace.remove();
        //截图之后事件
        this.option.after();
    }

    //启用画笔编辑
    cutEditStatus = false;

    [selPen]() {
        if (this.cutWaitStatus) {
            this.cutEditStatus = true;
            this.cutRectStatus = false;
        }

    }

    //启用画框编辑
    cutRectStatus = false;

    [selRect]() {
        if (this.cutWaitStatus) {
            this.cutRectStatus = true;
            this.cutEditStatus = false;
        }
    }

    [clearCanvas]() {
        if (this.canvas && this.context) {
            //清空选中区域画布
            const [x, y, w, h] = this.cutShotDataArray;
            this.context.clearRect(x, y, w, h);

            const {width, height} = this.canvas;
            this.canvasState = undefined;
            //绘制矩形截图背景
            this[drawCutImageShot](width, height, this.cutShotDataArray[0], this.cutShotDataArray[1], this.cutShotDataArray[2], this.cutShotDataArray[3]);
        }

    }

    //保存截图
    [saveCut]() {
        if (this.canvas && this.context) {
            const [x, y, w, h] = this.cutShotDataArray;
            const data = this.context.getImageData(x, y, w, h);

            const shotCanvas = window.document.createElement("canvas");
            const shotContext = shotCanvas.getContext("2d");

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
}