import html2canvas from "html2canvas";
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
const capture = Symbol("capture");

const defaultOption: Option = {
    engine: 'html2canvas',
    before: () => true,
    start: () => {
    },
    end: () => {
    },
    save: (baseImg: string) => async () => {
        //保存操作，图片默认写入用户剪贴板
        await navigator.clipboard.writeText(baseImg);
    },
    after: () => {
    },
    error: (e) => {
        console.error(e);
    },
}

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
    private readonly cutTool:HTMLElement | undefined;

    /**
     * 截图插件选择(默认使用：html2canvas)
     * html2canvas：html转canvas方式实现截图
     * mediaDevices：使用浏览器的录屏设备来实现截图
     */
    private shotPlugin = "html2canvas";

    constructor(option?: Option) {
        this.option = Object.assign({}, defaultOption, option);
        this.captureWorkSpace = window.document.getElementById("z-capture-workspace-0726");
        let first = false;
        if (!this.captureWorkSpace) {
            this.captureWorkSpace = window.document.createElement("div");
            this.captureWorkSpace.setAttribute("id", "z-capture-workspace-0726");
            this.captureWorkSpace.setAttribute("class", "cutImageStatus");
            this.captureWorkSpace.innerHTML = `
                              <canvas class="screenCanvas"></canvas>
                              <div class="cut-tool">
                                <div class="tool-left">
                                  <button data-btnType="t-pen-btn" type="button" title="自定义-画笔">笔</button>
                                  <button data-btnType="t-rect-btn" type="button" title="矩形-画框">框</button>
                                  <button data-btnType="t-clear-btn" type="button" title="清空画布">清</button>
                                </div>
                                <span class="tool-fg"></span>
                                <div class="tool-right">
                                  <button data-btnType="t-cancel-btn" type="button" title="取消">取消</button>
                                  <button data-btnType="t-save-btn" type="button" title="保存">保存</button>
                                </div>
                              </div>`;
            window.document.body.append(this.captureWorkSpace);
            first = true;
        }
        this.canvas = this.captureWorkSpace.getElementsByTagName("canvas")?.[0];
        this.context = this.canvas?.getContext("2d");
        this.cutTool = this.captureWorkSpace.getElementsByClassName("cut-tool")?.[0] as HTMLElement;

        if(first){
            //截图编辑工具区域按钮
            this.cutTool.querySelector("button")?.addEventListener("click", (e) => {
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
                            break;
                        //画框
                        case "t-rect-btn":
                            this[selRect]();
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


    }

    static init(option?: Option) {
        return new ZCapture(option);
    }


    [capture]() {
        //全屏截图前事件
        const before = this.option.before && this.option.before();
        if (!before) {
            return false;
        }

        if (this.shotPlugin === "mediaDevices") {
            const video: any = window.document.createElement("video");
            const gdmOptions = {
                video: true,
                preferCurrentTab: true
            }
            const mediaDevices: any = navigator.mediaDevices;

            mediaDevices.getDisplayMedia(gdmOptions).then((captureStream: MediaStream) => {
                //截图开始事件
                this.option.start && this.option.start();

                video.srcObject = captureStream;
                //500毫秒的延时是为了关闭录频提示框
                setTimeout(() => {
                    video.play().then(() => {
                        if (this.canvas && this.context) {
                            this.canvas.width = window.document.body.clientWidth;
                            this.canvas.height = window.document.body.clientHeight;
                            this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
                        }
                        //进入截图界面，初始化状态
                        this[intoShot]();
                        captureStream.getTracks().forEach((track: any) => track.stop());
                        video.remove();

                        //截图完成
                        this.option.end && this.option.end();
                    });
                }, 500);
                //用户取消共享，会抛出异常
            }).catch((err: any) => {
                //异常
                this.option.error && this.option.error(err);

                if (err) {
                    let e = err.toString() as string;
                    if (~e.indexOf("NotAllowedError: Permission denied")) {
                        console.log("用户取消共享屏幕，截屏失败");
                    } else {
                        console.error("Error: " + err);
                    }
                }
                //出现异常，关闭截图
                this[closeCut]();
            });
        } else {
            //截图开始事件
            this.option.start && this.option.start();
            html2canvas(window.document.getElementsByTagName("body")[0], {
                backgroundColor: 'white',
                useCORS: true, //支持图片跨域
                scale: 1       //设置放大倍数
            }).then((canvas) => {
                if (this.canvas && this.context) {
                    this.canvas.width = window.document.body.clientWidth;
                    this.canvas.height = window.document.body.clientHeight;
                    this.context.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
                }
                //进入截图界面，初始化状态
                this[intoShot]();
                //截图完成
                this.option.end && this.option.end();
            });
        }
    };

    //进入截图界面，初始化状态
    [intoShot]() {
        this.cutImageStatus = true;
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
                this.cutScreenDataURL = this.canvas.toDataURL();
                this[drawImageMask](0, 0, this.canvas.width, this.canvas.height, this.MASK_OPACITY);
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

    //鼠标按下开始
    [cutHandleCanvasMouseDown](event: MouseEvent) {
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
    [cutHandleCanvasMouseMove](event: MouseEvent) {

        if (this.cutDown && this.canvas && this.context) {
            const endX = event.offsetX;
            const endY = event.offsetY;
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
                    if(this.captureWorkSpace && this.cutTool){
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
        this.cutTool?.remove();
        //截图之后事件
        this.option.after && this.option.after();
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
                this.cutShotDataURL = shotCanvas.toDataURL('image/jpeg');
                //确定保存截图
                this.option.save && this.option.save(this.cutShotDataURL);
            }
            shotCanvas.remove();
            this[closeCut]();
        }
    };
}