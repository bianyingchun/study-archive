# 逐行读取文件

```js
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: fs.createReadStream("./test2.txt"),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  console.log(`cc ${line}`);
  const extract = line.match(/(\d+\.\d+\.\d+\.\d+) (.*)/);
});
```
