process.on('message', function (msg) {
    console.log('get a message from parent', msg)
    process.send('child message')
})