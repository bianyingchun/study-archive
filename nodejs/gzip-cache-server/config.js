const path = require('path')
module.exports = {
  root: path.resolve(),
  host: "127.0.0.1",
  port: 3001,
  compress: /\.(html|js|css|md)/,
  cache: {
    maxAge: 2,
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true
  }
};
