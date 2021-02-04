var xss = require("xss");
var html = xss('<script>alert("xss");</script>');
console.log('result', html);

// https://github.com/leizongmin/js-xss/blob/master/README.zh.md