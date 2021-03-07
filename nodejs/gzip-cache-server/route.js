const fs = require("fs");
const util = require("util");
const ejs = require("ejs");
const path = require("path");
const config = require('./config')
const mime = require('./mine')
const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);
const source = fs.readFileSync(path.join(__dirname, "./template/index.ejs"));
const compress = require('./compress')
const isCache = require('./cache')
module.exports = async function (request, response, filePath) {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      // 匹配文件 MIME 类型
      response.setHeader("content-type", mime(filePath));
      if (isCache(stats, request, response)) { 
        response.statusCode = 304;
        response.end();
        return 
      }
      response.statusCode = 200;
      let readStream = fs.createReadStream(filePath)
      // gzip 压缩
      if(filePath.match(config.compress)) { // 正则匹配：/\.(html|js|css|md)/
        readStream = compress(readStream,request, response)
      }
      readStream.pipe(response)
    } else if (stats.isDirectory()) {
      let files = await readdir(filePath);
      const dir = path.relative(config.root, filePath) // 相对于根目录
      response.statusCode = 200;
      response.setHeader("content-type", "text/html");
      const data = {
        files,
        dir
      }
      const template = ejs.render(source.toString(), data);
      response.end(template);
    }
  } catch (err) {
    console.error(err);
    response.statusCode = 404;
    response.setHeader("content-type", "text/plain");
    response.end(`${filePath} is not a file`);
  }
};
