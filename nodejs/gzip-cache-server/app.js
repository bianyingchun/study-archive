const http = require('http');
const path = require('path');
const { root, host, port } = require('./config');
const route = require('./route')
const server = http.createServer((request, response) => { 
  let filePath = path.join(root, request.url)
  route(request, response, filePath)
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}/`);
});

