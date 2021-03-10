
function Animal(name, color) {
  this.name = name;
  this.color = color;
}
Animal.prototype.say = function () {
  return `I'm a ${this.color}${this.name}`;
};


Function.prototype.bind = function (obj) {
  const args = Array.prototype.slice.call(arguments, 1);//保留bind时的参数
  const that = this;
  const bound = function () {
    const inArgs = Array.prototype.slice.call(arguments);//执行bind的函数时的参数
    const newArgs = args.concat(inArgs);//组装参数
    const bo = obj || this;
    that.apply(bo, newArgs);//执行bind的函数
  }
  //继承prototype--寄生组合式继承
  function F() { };
  F.prototype = that.prototype;
  bound.prototype = new F();
  return bound;
}

// https://zhuanlan.zhihu.com/p/84615955


const Cat = Animal.bind(null, "cat");
const cat = new Cat("white");
console.log(cat instanceof Cat &&
  cat instanceof Animal)
if (
  cat.say() === "I'm a white cat" &&
  cat instanceof Cat &&
  cat instanceof Animal
) {
  console.log("success");
}


timers
i / o callbacks
idle, prepare
poll
check
close callbacks