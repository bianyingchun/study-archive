//1. 类型判断
function typeOf(data) {
  return Object.prototype.toString
    .call(data)
    .substring()
    .slice(8, -1)
    .toLowerCase();
}

// 2. 字符串模板
function render(template = "", data) {
  const reg = /\{\{(\w+)\}\}/;
  const result = template.match(reg);
  if (result) {
    template = template.replace(result[0], data[result[1]]);
    return render(template, data);
  }
  return template;
}
// 测试
// let template = '我是{{name}}，年龄{{age}}，性别{{sex}}';
// let person = {
//     name: '布兰',
//     age: 12
// }
// const result = render(template, person); // 我是布兰，年龄12，性别undefined

// console.log(result)

// 3. 固定参数
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
//
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
  return args.reduce((a, b) => a + b, 0);
});
const result = add(1)(2)(3)();
console.log(result);

// bind, call, apply
Function.prototype.call = function (context, ...args) {
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

Function.prototype.call = function (context, args) {
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

Function.prototype.bind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }
  var self = this;
  var fNOP = function () {};
  var fBound = function () {
    // 当作为构造函数时，this 指向实例，此时 this instanceof fBound 结果为 true，
    // this instanceof fNOP 相当于 fboundx被当做构造函数使用
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(Array.prototype.slice.call(arguments))
    );
  };
  // 原型链对象上的属性不能丢失。因此这里需要用到原型链继承（es5 Object.create()），将 this.prototype 上面的属性挂到 fbound 的原型上面，最后再返回 fbound。
  //  原型链继承
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};

// 寄生组合式继承
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.getName = function () {
  return this.name;
};
Person.prototype.getAge = function () {
  return this.age;
};

function Student(name, age, grade) {
  // 构造函数继承
  Person.call(this, name, age);
  this.grade = grade;
}
// 原型继承
Student.prototype = Object.create(Person.prototype, {
  // 不要忘了重新指定构造函数
  constructor: {
    value: Student,
  },
  getGrade: {
    value: function () {
      return this.grade;
    },
  },
});

// 实现Object.create

//  src/global-api/initExtend.js
import { mergeOptions } from "../util/index";
export default function initExtend(Vue) {
  let cid = 0; //组件的唯一标识
  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数 并且调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options); //调用Vue初始化方法
    };
    Sub.cid = cid++;
    Sub.prototype = Object.create(this.prototype); // 子类原型指向父类
    Sub.prototype.constructor = Sub; //constructor指向自己
    Sub.options = mergeOptions(this.options, extendOptions); //合并自己的options和父类的options
    return Sub;
  };
}

/**
 * 手写-将虚拟 Dom 转化为真实 Dom（类似的递归题-必考）
{
  tag: 'DIV',
  attrs:{
  id:'app'
  },
  children: [
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] },
        { tag: 'A', children: [] }
      ]
    }
  ]
}
把上诉虚拟Dom转化成下方真实Dom
<div id="app">
  <span>
    <a></a>
  </span>
  <span>
    <a></a>
    <a></a>
  </span>
</div>
答案
 */

// 真正的渲染函数
function _render(vnode) {
  // 如果是数字类型转化为字符串
  if (typeof vnode === "number") {
    vnode = String(vnode);
  }
  // 字符串类型直接就是文本节点
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  // 普通DOM
  const dom = document.createElement(vnode.tag);
  if (vnode.attrs) {
    // 遍历属性
    Object.keys(vnode.attrs).forEach((key) => {
      const value = vnode.attrs[key];
      dom.setAttribute(key, value);
    });
  }
  // 子数组进行递归操作 这一步是关键
  vnode.children.forEach((child) => dom.appendChild(_render(child)));
  return dom;
}

// es5实现const 和 let
//
(function () {
  var a = 1;
  console.log(a);
})();
console.log(a);
// const
var __const = function __const(data, value) {
  window.data = value; // 把要定义的data挂载到window下，并赋值value
  Object.defineProperty(window, data, {
    // 利用Object.defineProperty的能力劫持当前对象，并修改其属性描述符
    enumerable: false,
    configurable: false,
    get: function () {
      return value;
    },
    set: function (data) {
      if (data !== value) {
        // 当要对当前属性进行赋值时，则抛出错误！
        throw new TypeError("Assignment to constant variable.");
      } else {
        return value;
      }
    },
  });
};

// 手动实现react useState

let _state = [];
let index = 0;
const myUseState = (initialState) => {
  const currentIndex = index; //
  _state[currentIndex] =
    _state[currentIndex] === undefined ? initialState : _state[currentIndex];
  const setState = (newState) => {
    _state[currentIndex] = newState;
    render();
  };
  index++;
  return [_state[currentIndex], setState];
};

const render = () => {
  index = 0; //必须在渲染前后将`index`值重置为`0` 不然就无法借助调用顺序确定`Hooks`了
  ReactDOM.render(<App />, document.getElementById("root"));
};
// 实现 useReducer
/**
 * 
 * const reducer = (state,action) => {
        switch (action.type) {
            case 'increment':
                return state + 1;
            case 'decrement':
                return state - 1;
            default:
                return state;
        }
    }
    const [count,dispatch] = useReducer(reducer,0)
    return (
        <>
            <h1>当前求和为：{count}</h1>
            <button onClick={() => dispatch({type: 'increment'})}>点我+1</button>
            <button onClick={() => dispatch({type: 'decrement'})}>点我-1</button>
        </>
    )
 */
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);
  let dispatch = (action) => {
    setState(reducer(state, action));
  };
  return [state, dispatch];
}

// 手写useEffect实现原理
/**
 * 参数是回调函数，依赖以数组的形式
存储上一次render时的依赖
兼容多次调用，同一个组件下可能会有多次使用
比较本次render和上一次render依赖，执行回调
增加副作用清除（effect触发后会将清除函数暂存起来，等下次触发时执行）
 */

let index = 0;
// 同一组件下可能会出现多个useEffect使用，以数组的形式存储
let lastDepsBox = [];
let lastClearFnCallback = [];
/**
 *
 * @param {callback} fn 回调函数
 * @param {Array} deps 依赖
 */
function UseEffect(fn, deps) {
  // 存储上一次的依赖 存储的是[[]、[]、[]]
  const lastDeps = lastDepsBox[index];
  // 记录状态变化
  const flag =
    !lastDeps || // 首次渲染 刚开始就会触发
    !deps || // 没有依赖，次次触发
    deps.some((dep, index) => dep !== lastDeps[index]); // 依赖进行比较
  if (flag) {
    lastDepsBox[index] = deps;
    // effect触发后会将清除函数暂存起来，等下次触发时执行
    if (lastClearFnCallback[index]) {
      lastClearFnCallback[index]();
    }
    // 将清除函数暂存起来
    lastClearFnCallback[index] = fn();
  }
  index++;
}
