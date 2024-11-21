# z-capture

一款简单好用的网页截屏工具(a simple web screen capture tool).
    
z-capture是基于html2canvas的一款网页截屏工具，其中使用了两种截图驱动。
第一种是html2canvas截图模式，这种方式是通过将html元素绘制到canvas页面并转为图片的方式来实现截图，
此模式包含了大部分的截图场景，也是本工具默认的截图方式。
但是这种方式对html页面上的部分iframe子页面，跨域图片，播放插件等内容的兼容性十分不友好，
也因此又提供了第二种截图模式，基于浏览器共享屏幕原理的录屏截图模式。这种模式是通过调用浏览器本身的共享屏幕，
先对屏幕内容进行录制，获取到数据流后，把数据流绘制到canvas页面来实现截图。
这种方式十分强大，不仅对本浏览器内的页面可以实现截屏，还可以对第三方应用的页面实现截屏。
但是这种方式对浏览器有强度依赖，对低版本浏览器并不友好，并且需要用户多点击一步确认共享屏幕的允许按钮，所以只是作为备用方案采用。

###### （因为html2canvas已经几年没有更新了，为了兼容新版的css样式，使用了html2canvas的pro分支）

## 使用

### **安装**

#### **npm命令安装**

```shell
npm install z-capture
```

#### **html页面中直接使用script标签引入，这种方式需要手动添加html2canvas的依赖**

```html
<script src="dist/html2canvas-pro.js"></script>
<script src="dist/z-capture.umd.js"></script>
```


### **示例**

#### **快速使用**

```html
 <button onclick="atuoCapture()">截图</button>
```
```javascript
function atuoCapture() {
   ZCUtil.capture();
}
```


#### **自定义使用**

```javascript
let option = {
  end: (screenImd) => {
    console.log(screenImd);
  }
}

function atuoCapture() {
    ZCUtil.capture(option);
}
```

#### **option说明**

#### option属性简单说明
| 参数     | 类型  | 默认                                        | 必填 | 说明                                      |
|--------|-----|-------------------------------------------|----|-----------------------------------------|
| engine | 字符串 | 'html2canvas'                             | 可选 | 截图驱动，可选值:'html2canvas' , 'mediaDevices' |
| before | 函数  | () => true                                | 可选 | 截图之前事件                                  |
| start  | 函数  | () => void (0)                            | 可选 | 全屏截图发生时                                 |
| end    | 函数  | (screenImd) => void (0)                   | 可选 | 全屏截图完成时                                 |
| save   | 函数  | (capImg: string) => {console.log(capImg)} | 可选 | 用户确认了截图，点击保存了按钮                         |
| after  | 函数  | () => void (0)                            | 可选 | 关闭截图操作界面后                               |
| error  | 函数  | (e) => {console.error(e)}                 | 可选 | 截图过程中发生异常                               |

#### option接口
```javascript
export interface Option {
    /**
     * 截图的引擎选择，默认使用 “html2canvas”，如果涉及第三方屏幕，插件，或者页面中存在跨域iframe，请使用“mediaDevices”
     * html2canvas：html转canvas方式实现截图
     * mediaDevices：使用浏览器的录屏设备来实现截图
     */
    engine?: string;
    /**
     * 要展示截图操作界面之前
     * 截图发生之前，如果是录屏模式截图，则是弹出浏览器是否同意录屏提示框的时候，应该要保证不要有其他模块界面对浏览器主界面进行遮挡，例如浏览器外置的播放插件，需要在这一步隐藏。
     * return 判断截图操作是否继续
     */
    before?: () => boolean;
    /**
     * 全屏截图发生时
     * 如果是录屏模式截图，则是开始录制屏幕，应该要保证界面元素的完整性，例如需要浏览器外置的播放插件，需要在这一步显示。
     * 根据返回值来确定是否继续截图
     */
    start?: () => void;
    /**
     * 全屏截图完成时，此时完成了对整个屏幕的截图，应该要保证不要有其他模块界面对浏览器主界面进行遮挡，例如浏览器外置的播放插件，需要在这一步隐藏。
     * 生成全屏图片，全屏图片处于待编辑状态，截图编辑发生之前，如果需要全屏截图，可以在这一步得到
     */
    end?: (screenImd:string) => void;
    /**
     * 用户确认了截图，点击保存了按钮
     */
    save?: (capImg:string) => void;
    /**
     * 关闭截图操作界面后，此时完成关闭截图操作界面。用户点击取消了截图或者确定保存都会触发此事件。
     */
    after?: () => void;
    /**
     * 截图过程中发生异常
     */
    error?: (e:any) => void;
}
```
## 版本
**现在最新版是1.0.4**

- **1.0.5** `最新`
  升级了文档
- 
- **1.0.4** `历史`
  升级了截图的清晰度，增加了对新版css样式的支持

- **1.0.3** `过期`
  完成了截图插件工具的构建，满足基本的项目需求