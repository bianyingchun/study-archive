# 什么是 Blob 对象

Blob 对象表示一个**不可变、原始数据的类文件对象**。

它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream 来用于数据操作。

Blob 对象可以看做是**存放二进制数据的容器**，此外还可以通过 Blob 设置二进制数据的 MIME 类型。而真正的业务功能则需要通过 FileReader、URL、Canvas 等对象实现

Blob 表示的不一定是 JavaScript 原生格式的数据。**File 接口基于 Blob**，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。

要从其他非 blob 对象和数据构造一个 Blob，请使用 Blob() 构造函数。

要创建一个 blob 数据的子集 blob，请使用 slice() 方法。

# 创建 Blob

## 使用构造函数

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

## 通过 Blob.slice()

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

## 通过 canvas.toBlob()

```javascript
var canvas = document.getElementById("canvas");
canvas.toBlob(function (blob) {
  console.log(blob);
});
```

# 应用

### 1. 大文件分片上传 Blob.slice()

[字节跳动面试官：请你实现一个大文件上传和断点续传](https://juejin.cn/post/6844904046436843527)

### 2. 通过 url 下载文件

## 1.Blob URL/Object URL

Blob URL/Object URL 是一种伪协议，允许 Blob 和 File 对象用作图像，下载二进制数据链接等的 URL 源。在浏览器中，我们使用 URL.createObjectURL 方法来创建 Blob URL，该方法接收一个 Blob 对象，并为其创建一个唯一的 URL，其形式为 blob:<origin>/<uuid>，对应的示例如下：

blob:https://example.org/40a5fb5a-d56d-4a33-b4e2-0acf6a8e5f641

浏览器内部为每个通过 **URL.createObjectURL 生成的 URL 存储了一个 URL → Blob 映射**。因此，此类 URL 较短，但可以访问 Blob。生成的 URL 仅在当前文档打开的状态下才有效。它允许引用 <img>、<a> 中的 Blob，但如果你访问的 Blob URL 不再存在，则会从浏览器中收到 404 错误。
上述的 Blob URL 看似很不错，但实际上它也有副作用。**虽然存储了 URL → Blob 的映射，但 Blob 本身仍驻留在内存中，浏览器无法释放它。映射在文档卸载时自动清除**，因此 Blob 对象随后被释放。但是，如果应用程序寿命很长，那不会很快发生。因此，如果我们创建一个 Blob URL，即使不再需要该 Blob，它也会存在内存中。

针对这个问题，我们可以调用 **URL.revokeObjectURL(url) 方法，从内部映射中删除引用，从而允许删除 Blob（如果没有其他引用），并释放内存**。接下来，我们来看一下 Blob 文件下载的具体示例。

```javascript
const download = (fileName, blob) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

const downloadBtn = document.querySelector("#downloadBtn");
downloadBtn.addEventListener("click", (event) => {
  const fileName = "blob.txt";
  const myBlob = new Blob(["一文彻底掌握 Blob Web API"], {
    type: "text/plain",
  });
  download(fileName, myBlob);
});
```

### 3. 使用 Blob Url 实现上传预览图片

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

### 下载文件流

```js
  <body>
    <button onclick="download1()">XMLHttpRequest下载</button>
    <button onclick="download2()">fetch下载</button>
    <img id="img" />
    <script>
      var eleAppend = document.getElementById('forAppend');
      const url = 'https://sf3-ttcdn-tos.pstatp.com/img/user-avatar/9ecb4e119c26e64b8b4ec5258f159b3b~300x300.image';
      const pingan = document.querySelector('#pingan');
      function download1() {
        const xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (this.status == 200) {
            renderImage(this.response);
          }
        };
        xhr.send(null);
      }
      function download2() {
        fetch(url)
          .then((res) => {
            return res.blob();
          })
          .then((myBlob) => {
            renderImage(myBlob);
          });
      }

      function renderImage(blob) {
        window.URL = window.URL || window.webkitURL;
        var img = document.getElementById('img');
        img.onload = function (e) {
          window.URL.revokeObjectURL(img.src); // 清除释放
        };
        img.src = window.URL.createObjectURL(blob);
      }
    </script>
  </body>

```

### 4. Blob 转换为 Base64

URL.createObjectURL 的一个替代方法是，将 Blob 转换为 base64 编码的字符串。Base64 是一种基于 64 个可打印字符来表示二进制数据的表示方法，它常用于在处理文本数据的场合，表示、传输、存储一些二进制数据，包括 MIME 的电子邮件及 XML 的一些复杂数据。

#### base64

在 MIME 格式的电子邮件中，base64 可以用来**将二进制的字节序列数据编码成 ASCII 字符序列构成的文本**。使用时，在传输编码方式中指定 base64。使用的字符包括大小写拉丁字母各 26 个、数字 10 个、加号 + 和斜杠 /，共 64 个字符，等号 = 用来作为后缀用途。
下面我们来介绍如何在 HTML 中嵌入 base64 编码的图片。在编写 HTML 网页时，对于一些简单图片，通常会选择将图片内容直接内嵌在网页中，从而减少不必要的网络请求，但是图片数据是二进制数据，该怎么嵌入呢？绝大多数现代浏览器都支持一种名为 Data URLs 的特性，允许使用 base64 对图片或其他文件的二进制数据进行编码，将其作为文本字符串嵌入网页中。

Data URLs 由四个部分组成：前缀（data:）、指示数据类型的 MIME 类型、如果非文本则为可选的 base64 标记、数据本身：
data:[<mediatype>][;base64],<data>

mediatype 是个 MIME 类型的字符串，例如 "image/jpeg" 表示 JPEG 图像文件。如果被省略，则默认值为 text/plain;charset=US-ASCII。如果数据是文本类型，你可以直接将文本嵌入（根据文档类型，使用合适的实体字符或转义字符）。如果是二进制数据，你可以将数据进行 base64 编码之后再进行嵌入。比如嵌入一张图片：
<img alt="logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...">

但需要注意的是：如果图片较大，图片的色彩层次比较丰富，则不适合使用这种方式，因为该图片经过 base64 编码后的字符串非常大，会明显增大 HTML 页面的大小，从而影响加载速度。 除此之外，利用 FileReader API，我们也可以方便的实现图片本地预览功能，具体代码如下：

```js
<input type="file" accept="image/*" onchange="loadFile(event)">
<img id="output"/>

<script>
  const loadFile = function(event) {
    const reader = new FileReader();
    reader.onload = function(){
      const output = document.querySelector('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]); //把本地图片对应的 File 对象转换为 Data URL。
  };
</script>

```

### 5. 图片压缩

### 6. axios 获取文件流并下载文件

```js
axios.post(url, data, { responseType: "blob" }).then((res) => {
  const blob = new Blob([res.data]); //处理文档流
  const fileName = "资产列表.xlsx";
  const elink = document.createElement("a");
  elink.download = fileName;
  elink.style.display = "none";
  elink.href = URL.createObjectURL(blob);
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href); // 释放URL 对象
  document.body.removeChild(elink);
});
```

# 参考文档

1. [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
2. [[HTML5] Blob 对象](https://www.cnblogs.com/hhhyaaon/p/5928152.html)
3. [「多图预警」那些年，被 blob 虐过的程序猿觉醒了！](https://juejin.cn/post/6916675943343849479)
4. [](https://juejin.cn/post/6844904178725158926#heading-1)
