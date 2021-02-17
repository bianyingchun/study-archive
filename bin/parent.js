const cp = require('child_process')
let child = cp.fork('./child');
child.on('message', function (msg) {
    console.log('got a message is', msg);
});
child.send('parent message');