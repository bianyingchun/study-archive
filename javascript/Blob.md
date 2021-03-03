
### 什么是Blob对象
Blob 对象表示一个**不可变、原始数据的类文件对象**。

它的数据可以按文本或二进制的格式进行读取，也可以转换成 ReadableStream 来用于数据操作。 

Blob对象可以看做是**存放二进制数据的容器**，此外还可以通过Blob设置二进制数据的MIME类型。而真正的业务功能则需要通过FileReader、URL、Canvas等对象实现

Blob 表示的不一定是JavaScript原生格式的数据。**File 接口基于Blob**，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。

要从其他非blob对象和数据构造一个 Blob，请使用 Blob() 构造函数。

要创建一个 blob 数据的子集 blob，请使用 slice() 方法。

###  为什么要使用Blob

### 创建Blob
#### 使用构造函数
var blob = new Blob(dataArr:Array<any>, opt:{type:string});
+ dataArray：数组，包含了要添加到Blob对象中的数据，数据可以是任意多个ArrayBuffer，ArrayBufferView， Blob，或者 DOMString对象。

+ opt：对象，用于设置Blob对象的属性（如：MIME类型）

1. 创建一个装填DOMString对象的Blob对象
```javascript
var s = '<div>hello world</div>'
var blob = new Blob([s], { type: 'text/xml' })
```

2、创建一个装填ArrayBuffer对象的Blob对象
ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区。
```javascript
var abf = new ArrayBuffer(8)
var blob2 = new Blob([abf], { type: 'text/plain' })
```

3、创建一个装填ArrayBufferView对象的Blob对象（ArrayBufferView可基于ArrayBuffer创建，返回值是一个类数组。如下：创建一个8字节的ArrayBuffer，在其上创建一个每个数组元素为2字节的“视图”）
```javascript

// Int16Array类型数组代表二进制补码16位有符号整数形式的字节的数组。
var abv = new Int16Array(abf)
var blob3 = new Blob(abv, { type: 'text/plain' });
```

#### 使用blob.slice 
通过Blob.slice()

此方法返回一个新的Blob对象，包含了原Blob对象中指定范围内的数据

Blob.slice(start:number, end:number, contentType:string)
start：开始索引，默认为0
end：截取结束索引（不包括end）
contentType：新Blob的MIME类型，默认为空字符串

```javascript
var abf = new ArrayBuffer(8)
var blob2 = new Blob([abf], { type: 'text/plain' })
var blob3 = blob2.slice(0, 4)
```

#### 通过canvas.toBlob()
```javascript
var canvas = document.getElementById("canvas");
canvas.toBlob(function(blob){
    console.log(blob);
});
```

### 应用
##### 1. 大文件分片上传 Blob.slice()
[大文件分片上传](http://blog.bianyc.xyz/)
##### 2. 通过url下载文件
URL.createObjectURL(object:Blob) 静态方法会创建一个 DOMString, 包含了一个对象URL，该URL可用于指定源 object的内容。

window.URL对象可以为Blob对象生成一个网络地址，结合a标签的download属性，可以实现点击url下载文件。

```javascript
createDownload("download.txt","download file");

function createDownload(fileName, content){
    var blob = new Blob([content]);
    var link = document.createElement("a");
    link.innerHTML = fileName;
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    document.getElementsByTagName("body")[0].appendChild(link);
}
```

##### 使用 Blob Url 实现上传预览图片

```javascript
document.getElementById('upload').addEventListener('change', function(e){
  var file = e.files[0];
  var blob = URL.createObjectURL(file);
  var img = document.getElementsByTagName("img")[0];
  img.src = blob;
  img.onload = function (e) {
    URL.revokeObjectURL(this.src); // 释放createObjectURL创建的对象
  };
})

```
### 参考文档
1. [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
2. [[HTML5] Blob对象](https://www.cnblogs.com/hhhyaaon/p/5928152.html)