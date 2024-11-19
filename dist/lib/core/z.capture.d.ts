import { Option } from "./option";
declare const selPen: unique symbol;
declare const selRect: unique symbol;
declare const clearCanvas: unique symbol;
declare const closeCut: unique symbol;
declare const saveCut: unique symbol;
declare const intoShot: unique symbol;
declare const drawImageMask: unique symbol;
declare const drawCutImageShot: unique symbol;
declare const drawOutShadow: unique symbol;
declare const restoreCanvasState: unique symbol;
declare const cutHandleCanvasMouseMove: unique symbol;
declare const drawFreeLine: unique symbol;
declare const cutHandleCanvasMouseUp: unique symbol;
declare const drawScreenImg: unique symbol;
declare const cutHandleCanvasMouseDown: unique symbol;
declare const isWithinCutShotArea: unique symbol;
declare const drawFreeRect: unique symbol;
declare const rightCloseCut: unique symbol;
declare const correctionCoord: unique symbol;
export declare class ZCapture {
    private option;
    private cutImageStatus;
    private cutScreenDataURL;
    private cutShotDataURL;
    private cutShotDataArray;
    private readonly captureWorkSpace;
    private readonly canvas;
    private readonly context;
    private readonly cutTool;
    /**
     * 截图插件选择(默认使用：html2canvas)
     * html2canvas：html转canvas方式实现截图
     * mediaDevices：使用浏览器的录屏设备来实现截图
     */
    constructor();
    static capture(option?: Option): any;
    capture(option?: Option): boolean;
    [intoShot](): void;
    MASK_OPACITY: number;
    [drawImageMask](x: number, y: number, width: number, height: number, opacity: number): void;
    [drawCutImageShot](width: number, height: number, startX: number, startY: number, rectWidth: number, rectHeight: number): void;
    [drawOutShadow](startX: number, startY: number, rectWidth: number, rectHeight: number): void;
    [drawScreenImg](width: number, height: number): void;
    private cutInitPos;
    private cutDown;
    private cutWaitStatus;
    private cutMouseState;
    private canvasState;
    [restoreCanvasState](): void;
    [correctionCoord](old_x: number, old_y: number): number[];
    [cutHandleCanvasMouseDown](event: MouseEvent): void;
    [cutHandleCanvasMouseMove](event: MouseEvent): void;
    [drawFreeLine](endX: number, endY: number): void;
    [drawFreeRect](startX: number, startY: number, rectWidth: number, rectHeight: number): void;
    [isWithinCutShotArea](x: number, y: number): boolean;
    [cutHandleCanvasMouseUp](event: MouseEvent): void;
    [rightCloseCut](event: Event): void;
    [closeCut](): void;
    cutEditStatus: boolean;
    [selPen](): void;
    cutRectStatus: boolean;
    [selRect](): void;
    [clearCanvas](): void;
    [saveCut](): void;
}
export {};
