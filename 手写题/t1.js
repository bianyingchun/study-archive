//1. 类型判断
function typeOf(data) {
    return Object.prototype.toString.call(data).substring().slice(8, -1).toLowerCase()
}

// 2. 字符串模板
function render(template = '', data) {
    const reg = /\{\{(\w+)\}\}/;
    const result = template.match(reg);
    if (result) {
        template = template.replace(result[0], data[result[1]])
        return render(template, data)
    }
    return template
}
// 测试
// let template = '我是{{name}}，年龄{{age}}，性别{{sex}}';
// let person = {
//     name: '布兰',
//     age: 12
// }
// const result = render(template, person); // 我是布兰，年龄12，性别undefined

// console.log(result)

// 固定参数
function curry(fn, args) {
    // 获取函数需要的参数长度
    let length = fn.length;
    args = args || [];
    return function () {
        var subArgs = Array.prototype.slice.call(arguments);
        // 判断参数的长度是否已经满足函数所需参数的长度
        if (!subArgs.length) {
            // 如果满足，执行函数
            return fn.apply(this, args);
        } else {
            // 如果不满足，递归返回科里化的函数，等待参数的传入
            subArgs = subArgs.concat(args);
            return curry.call(this, fn, subArgs);
        }
    };
}
function currying(fn) {
    let args = [];
    return function temp(...tempArgs) {
        if (tempArgs.length) {
            args = [...args, ...tempArgs];
            return temp;
        } else {
            const res = fn.apply(null, args);
            args = [];
            return res;
        }
    };
}
// es6 实现
// function curry(fn, ...args) {
//     return fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args);
// }
// test
const add = currying((...args) => {
    return args.reduce((a, b) => a + b, 0)
})
const result = add(1)(2)(3)()
console.log(result)