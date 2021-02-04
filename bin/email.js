const nodemailer = require('nodemailer');
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
    //163 -> qq
let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: '163', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
        user: 'bianyc7@163.com',
        // 这里密码不是qq密码，是你设置的smtp授权码
        pass: 'PEXSFPTLFHPACGJS',
    }
});
const template = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../template/email.ejs'), 'utf8'));
const html = template({
    title: 'hello',
    desc: 'test nodemail'
})
let mailOptions = {
    from: '"JavaScript之禅" <bianyc7@163.com>', // sender address
    to: '2093213209@qq.com', // list of receivers
    subject: 'Hello', // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: '<b>Hello world?</b>' // html body
    html: html
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
});