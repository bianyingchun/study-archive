const {
  maxAge,
  expires,
  cacheControl,
  lastModified,
  etag
} = require("./config").cache;

function refreshRes(stats, response) {
  if (expires) {
    response.setHeader(
      "Expires",
      new Date(Date.now() + maxAge * 1000).toUTCString()
    );
  }
  if (cacheControl) {
    response.setHeader("CacheControl", `public, max-age=${maxAge}`);
  }
  if (lastModified) {
    //资源最后一次被修改的时间
    response.setHeader("Last-Modified", stats.mtime.toUTCString());
  }
  if (etag) {
    // 文件的特殊标识
    response.setHeader("ETag", `${stats.size}-${stats.mtime.toUTCString()}`); // mtime 需要转成字符串，否则在 windows 环境下会报错
  }
}

module.exports = function isCache(stats, request, response) {
  refreshRes(stats, response);
  const lastModified = request.headers["If-Modified-Since"];
  const etag = request.headers["If-None-Match"];
  if (!lastModified && !etag) {
    return false;
  }
  // 服务器会将 If-Modified-Since 的值与 Last-Modified 字段进行对比, 如果没有变化则返回 304 直接从缓存中读取，否则返回新资源。
  if (lastModified && lastModified !== response.getHeader("Last-Modified")) {
    return false;
  }
  // 服务器将Etag 和 if-none-match 的 值 对比， 如果没有变化则返回 304 直接从缓存中读取，否则返回新资源。
  if (etag && etag !== response.getHeader("ETag")) {
    return false;
  }
  return true;
};

