### 什么是 Blob 对象

Blob 对象表示一个**不可变、原始数据的类文件对象**。

它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream 来用于数据操作。

Blob 对象可以看做是**存放二进制数据的容器**，此外还可以通过 Blob 设置二进制数据的 MIME 类型。而真正的业务功能则需要通过 FileReader、URL、Canvas 等对象实现

Blob 表示的不一定是 JavaScript 原生格式的数据。**File 接口基于 Blob**，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。

要从其他非 blob 对象和数据构造一个 Blob，请使用 Blob() 构造函数。

要创建一个 blob 数据的子集 blob，请使用 slice() 方法。

### 创建 Blob

#### 使用构造函数

var blob = new Blob(dataArr:Array<any>, opt:{type:string});

- dataArray：数组，包含了要添加到 Blob 对象中的数据，数据可以是任意多个 ArrayBuffer，ArrayBufferView， Blob，或者 DOMString 对象。
- opt：对象，用于设置 Blob 对象的属性（如：MIME 类型）

1. 创建一个装填 DOMString 对象的 Blob 对象

```javascript
var s = "<div>hello world</div>";
var blob = new Blob([s], { type: "text/xml" });
```

2. 创建一个装填 ArrayBuffer 对象的 Blob 对象
   ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区。

```javascript
var abf = new ArrayBuffer(8);
var blob2 = new Blob([abf], { type: "text/plain" });
```

3. 创建一个装填 ArrayBufferView 对象的 Blob 对象（ArrayBufferView 可基于 ArrayBuffer 创建，返回值是一个类数组。如下：创建一个 8 字节的 ArrayBuffer，在其上创建一个每个数组元素为 2 字节的“视图”）

```javascript
// Int16Array类型数组代表二进制补码16位有符号整数形式的字节的数组。
var abv = new Int16Array(abf);
var blob3 = new Blob(abv, { type: "text/plain" });
```

#### 通过 Blob.slice()

此方法返回一个新的 Blob 对象，包含了原 Blob 对象中指定范围内的数据

Blob.slice(start:number, end:number, contentType:string)

- start：开始索引，默认为 0
- end：截取结束索引（不包括 end）
- contentType：新 Blob 的 MIME 类型，默认为空字符串

```javascript
var abf = new ArrayBuffer(8);
var blob2 = new Blob([abf], { type: "text/plain" });
var blob3 = blob2.slice(0, 4);
```

#### 通过 canvas.toBlob()

```javascript
var canvas = document.getElementById("canvas");
canvas.toBlob(function (blob) {
  console.log(blob);
});
```

### 应用

##### 1. 大文件分片上传 Blob.slice()

[字节跳动面试官：请你实现一个大文件上传和断点续传](https://juejin.cn/post/6844904046436843527)

##### 2. 通过 url 下载文件

URL.createObjectURL(object:Blob) 静态方法会创建一个 DOMString, 包含了一个对象 URL，该 URL 可用于指定源 object 的内容。

window.URL 对象可以为 Blob 对象生成一个网络地址，结合 a 标签的 download 属性，可以实现点击 url 下载文件。

```javascript
createDownload("download.txt", "download file");

function createDownload(fileName, content) {
  var blob = new Blob([content]);
  var link = document.createElement("a");
  link.innerHTML = fileName;
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  document.getElementsByTagName("body")[0].appendChild(link);
}
```

##### 3. 使用 Blob Url 实现上传预览图片

```javascript
document.getElementById("upload").addEventListener("change", function (e) {
  var file = e.files[0];
  var blob = URL.createObjectURL(file);
  var img = document.getElementsByTagName("img")[0];
  img.src = blob;
  img.onload = function (e) {
    URL.revokeObjectURL(this.src); // 释放createObjectURL创建的对象
  };
});
```

### 参考文档

1. [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
2. [[HTML5] Blob 对象](https://www.cnblogs.com/hhhyaaon/p/5928152.html)
