### 函数组件
简而言之，就是在一个函数中返回 React Element。
```javascript
const App = (props) => {
    const { title } = props;
    return (
        <h1>{title}</h1>
    );  
};
```
一般的，该函数接收唯一的参数：props 对象。从该对象中，我们可以读取到数据，并通过计算产生新的数据，最后返回 React Elements 以交给 React 进行渲染。此外也可以选择在函数中执行副作用。

在本文中，我们给函数式组件的函数起个简单一点的名字：render 函数。

```javascript
const appElement = App({ title: "XXX" });
ReactDOM.render(
    appElement,
    document.getElementById('app')
);
```
在上方的代码中，我们自行调用了 render 函数以期执行渲染。然而这在 React 中不是正常的操作。
正常操作是像下方这样的代码：

```javascript
// React.createElement(App, {
//     title: "XXX"
// });
const appElement = <App title="XXX" />;
ReactDOM.render(
    appElement,
    document.getElementById('app')
);
```
在 React 内部，它会决定在何时调用 render 函数，并对返回的 React Elements 进行遍历，如果遇到函数组件，React 便会继续调用这个函数组件。在这个过程中，可以由父组件通过 props 将数据传递到该子组件中。最终 React 会调用完所有的组件，从而知晓如何进行渲染。

这种把 render 函数交给 React 内部处理的机制，为引入状态带来了可能

在本文中，为了方便描述，对于 render 函数的每次调用，我想称它为一帧。

### 每一帧拥有独立的变量

```javascript
function Example(props) {
    const { count } = props;
    const handleClick = () => {
        setTimeout(() => {
            alert(count); 
        }, 3000);
    };
    return (
        <div>
            <p>{count}</p>
            <button onClick={handleClick}>Alert Count</button>
        </div>
    );
}
```
重点关注 <Example> 函数组件的代码，其中的 count 属性由父组件传入，初始值为 0，每隔一秒增加 1。点击 "Alert Count" 按钮，将延迟 3 秒钟弹出 count 的值。操作后发现，弹窗中出现的值，与页面中文本展示的值不同，而是等于点击 "alert Count" 按钮时 count 的值。

```javascript
class Example2 extends Component {
    handleClick = () => {
        setTimeout(() => {
            alert(this.props.count);
        }, 3000);
    };

    render() {
        return (
            <div>
                <h2>Example2</h2>
                <p>{this.props.count}</p>
                <button onClick={this.handleClick}>Alert Count</button>
            </div>
        );
    }
}

```
此时，点击 "Alert Count" 按钮，延迟 3 秒钟弹出 count 的值，与页面中文本展示的值是一样的。

在某些情况下，<Example> 函数组件中的行为才符合预期。如果将 setTimeout 类比到一次 Fetch 请求，在请求成功时，我要获取的是发起 Fetch 请求前相关的数据，并对其进行修改。

如何理解其中的差异呢？

在 <Example2> class 组件中，我们是从 this 中获取到的 props.count。this 是固定指向同一个组件实例的。在 3 秒的延时器生效后，组件重新进行了渲染，this.props 也发生了改变。当延时的回调函数执行时，读取到的 this.props 是当前组件最新的属性值。

而在 <Example> 函数组件中，每一次执行 render 函数时，props 作为该函数的参数传入，它是函数作用域下的变量。

当 <Example> 组件被创建，将运行类似这样的代码来完成第一帧：
```javascript
const props_0 = { count: 0 };

const handleClick_0 = () => {
    setTimeout(() => {
        alert(props_0.count);
    }, 3000);
};
return (
    <div>
        <h2>Example</h2>
        <p>{props_0.count}</p>
        <button onClick={handleClick_0}>alert Count</button>
    </div>
);

```
当父组件传入的 count 变为 1，React 会再次调用 Example 函数，执行第二帧，此时 count 是 1。
```javascript
const props_1 = { count: 1 };

const handleClick_1 = () => {
    setTimeout(() => {
        alert(props_1.count);
    }, 3000);
};
return (
    <div>
        <h2>Example</h2>
        <p>{props_1.count}</p>
        <button onClick={handleClick_1}>alert Count</button>
    </div>
);

```
由于 props 是 Example 函数作用域下的变量，可以说***对于这个函数的每一次调用中，都产生了新的 props 变量，它在声明时被赋予了当前的属性，是相互独立的，他们相互间互不影响。**

换一种说法，对于其中任一个 props ，其值在声明时便已经决定，不会随着时间产生变化。handleClick 函数亦是如此。例如定时器的回调函数是在未来发生的，但 props.count 的值是在声明 handleClick 函数时就已经决定好的。

如果我们在函数开头使用解构赋值，const { count } = props，之后直接使用 count，和上面的情况没有区别。



### 状态state
可以简单的认为，在某个组件中，对于返回的 React Elements 树形结构，某个位置的 element ，其类型与 key 属性均不变，React 便会选择重用该组件实例；否则，比如从 <A/> 组件切换到了 <B/> 组件，会销毁 A，然后重建 B，B 此时会执行第一帧。

**在实例中，可以通过 useState 等方式拥有局部状态。在重用的过程中，这些状态会得到保留。而如果无法重用，状态会被销毁。**

例如 useState，为当前的函数组件创建了一个状态，这个状态的值独立于函数存放。 useState 会返回一个数组，在该数组中，得到该状态的值和更新该状态的方法。通过解构，该状态的值会赋值到当前 render 函数作用域下的一个常量 state 中。
```javascript
const [state, setState] = useState(initialState);
```
当组件被创建而不是重用时，即在组件的第一帧中，该状态将被赋予初始值 initialState，而之后的重用过程中，不会被重复赋予初始值。
通过调用 setState ，可以更新状态的值。

#### 每一帧拥有独立的状态

需要明确的是，**state 作为函数中的一个常量，就是普通的数据，并不存在诸如数据绑定这样的操作来驱使 DOM 发生更新。在调用 setState 后，React 将重新执行 render 函数，仅此而已。**

因此，状态也是函数作用域下的普通变量。我们可以说每次函数执行拥有独立的状态。

```javascript
function Example2() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setTimeout(() => {
            setCount(count + 1);
        }, 3000);
    };

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>
                setCount
            </button>
            <button onClick={handleClick}>
                Delay setCount
            </button>
        </div>
    );
}

```
在第一帧中，p 标签中的文本为 0。点击 "Delay setCount"，文本依然为 0。随后在 3 秒内连续点击 "setCount" 两次，将会分别执行第二帧和第三帧。你将看到 p 标签中的文本由 0 变化为 1, 2。但在点击 "Delay setCount" 3 秒后，文本重新变为 1。

```javascript
// 第一帧
const count_1 = 0;

const handleClick_1 = () => {
    const delayAction_1 = () => {
        setCount(count_1 + 1);
    };
    setTimeout(delayAction_1, 3000);
};

//...
<button onClick={handleClick_1}>
//...

// 点击 "setCount" 后第二帧
const count_2 = 1;

const handleClick_2 = () => {
    const delayAction_2 = () => {
        setCount(count_2 + 1);
    };
    setTimeout(delayAction_2, 3000);
};

//...
<button onClick={handleClick_2}>
//...

// 再次点击 "setCount" 后第三帧
const count_3 = 2;

const handleClick_3 = () => {
    const delayAction_3 = () => {
        setCount(count_3 + 1);
    };
    setTimeout(delayAction_3, 3000);
};

//...
<button onClick={handleClick_3}>
//...

```

count，handleClick 都是 Example2 函数作用域中的常量。在点击 "Delay setCount" 时，定时器设置 3000ms 到期后的执行函数为 delayAction_1，函数中读取 count_1 常量的值是 0，这和第二帧的 count_2 无关。


### 获取过去或未来帧中的值
对于 state，如果想要在第一帧时点击 "Delay setCount" ，在一个异步回调函数的执行中，获取到 count 最新一帧中的值，不妨向 setCount 传入函数作为参数。

其他情况下，例如需要读取到 state 及其衍生的某个常量，相对于变量声明时所在帧过去或未来的值，就需要使用 useRef，通过它来拥有一个在所有帧中共享的变量。

如果要与 class 组件进行比较，useRef 的作用相对于让你在 class 组件的 this 上追加属性。

```javascript
const refContainer = useRef(initialValue);
```
在组件的第一帧中，refContainer.current 将被赋予初始值 initialValue，之后便不再发生变化。但你可以自己去设置它的值。设置它的值不会重新触发 render 函数。

例如，我们把第 n 帧的某个 props 或者 state 通过 useRef 进行保存，在第 n + 1 帧可以读取到过去的，第 n 帧中的值。我们也可以在第 n + 1 帧使用 ref 保存某个 props 或者 state，然后在第 n 帧中声明的异步回调函数中读取到它。

对 例二 进行修改，得到 例三，看看具体的效果：
```javascript
function Example() {
    const [count, setCount] = useState(0);

    const currentCount = useRef(count);

    currentCount.current = count;

    const handleClick = () => {
        setTimeout(() => {
            setCount(currentCount.current + 1);
        }, 3000);
    };

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>
                setCount
            </button>
            <button onClick={handleClick}>
                Delay setCount
            </button>
        </div>
    );
}

```
在 setCount 后便会执行下一帧，在函数的开头， currentCount 始终与最新的 count state 保持同步。因此，在 setTimeout 中可以通过此方法获取到回调函数执行时当前的 count 值。

接下来再通过 例四 了解如何获取过去帧中的值：

```javascript
function Example4() {
    const [count, setCount] = useState(1);

    const prevCountRef = useRef(1);
    const prevCount = prevCountRef.current;
    prevCountRef.current = count;

    const handleClick = () => {
        setCount(prevCount + count);
    };

    return (
        <div>
            <p>{count}</p>
            <button onClick={handleClick}>SetCount</button>
        </div>
    );
}

```
这段代码实现的功能是，count 初始值为 1，点击按钮后累加到 2，随后点击按钮，总是用当前 count 的值和前一个 count 的值进行累加，得到新的 count 的值。

prevCountRef 在 render 函数执行的过程中，与最新的 count state 进行了同步。由于在同步前，我们将该 ref 保存到函数作用域下的另一个变量 prevCount 中，因此我们总是能够获取到前一个 count 的值。

同样的方法，我们可以用于保存任何值：某个 prop，某个 state 变量，甚至一个函数等。在后面的 Effects 部分，我们会继续使用 refs 为我们带来好处。

### 原文链接


### 总结
1. react 的每次重新渲染都相当于对函数的重新调用，每一次调用相当于一帧，函数组件里传入的props，变量，state都是独立的，互不影响。state 作为函数中的一个常量，就是普通的数据，并不存在诸如数据绑定这样的操作来驱使 DOM 发生更新。在调用 setState 后，React 将重新执行 render 函数，仅此而已。

2. useRef 拥有一个在所有帧中共享的变量，.current值表示了当前帧的值。

#### 每一帧可以拥有独立的 Effects



如果弄清了前面的『每一帧拥有独立的变量』的概念，你会发现，若某个 useEffect/useLayoutEffect 有且仅有一个函数作为参数，那么每次 render 函数执行时该 Effects 也是独立的。因为它是在 render 函数中选择适当时机的执行。

对于 useEffect 来说，执行的时机是完成所有的 DOM 变更并让浏览器渲染页面后，而 **useLayoutEffect 和 class 组件中 componentDidMount, componentDidUpdate一致——在 React 完成 DOM 更新后马上同步调用，会阻塞页面渲染。**

如果 useEffect 没有传入第二个参数，那么第一个参数传入的 effect 函数在每次 render 函数执行是都是独立的。每个 effect 函数中捕获的 props 或 state 都来自于那一次的 render 函数。

```javascript
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            console.log(`You clicked ${count} times`);
        }, 3000);
    });

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
        </button>
        </div>
    );
}

```
在这个例子中，每一次对 count 进行改变，重新执行 render 函数后，延迟 3 秒打印 count 的值。
如果我们不停地点击按钮，打印的结果是什么呢？

我们发现经过延时后，每个 count 的值被依次打印了，他们从 0 开始依次递增，且不重复。

如果换成 class 组件，尝试使用 componentDidUpdate 去实现，会得到不一样的结果：
```javascript
componentDidUpdate() {
    setTimeout(() => {
        console.log(`You clicked ${this.state.count} times`);
    }, 3000);
}
```
this.state.count 总是指向最新的 count 值，而不是属于某次调用 render 函数时的值。

因此，在使用 useEffect 时，应当抛开在 class 组件中关于生命周期的思维。他们并不相同。在 useEffect 中刻意寻找那几个生命周期函数的替代写法，将会陷入僵局，无法充分发挥 useEffect 的能力。

### 在比对中执行 Effects

React 针对 React Elements 前后值进行对比，只去更新 DOM 真正发生改变的部分。对于 Effects，能否有类似这样的理念呢？

某个 Effects 函数一旦执行，函数内的副作用已经发生，React 无法猜测到函数相比于上一次做了哪些变化。但我们可以给 useEffect 传入第二个参数，作为依赖数组 (deps)，避免 Effects 不必要的重复调用。

**这个 deps 的含义是：当前 Effect 依赖了哪些变量。**
但有时问题不一定能解决。比如官网就有 这样的例子：
```javascript
const [count, setCount] = useState(0);

useEffect(() => {
    const id = setInterval(() => {
        setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
}, [count]);
```

如果我们频繁修改 count，每次执行 Effect，上一次的计时器被清除，需要调用 setInterval 重新进入时间队列，实际的定期时间被延后，甚至有可能根本没有机会被执行。

但是下面这样的实践方式也不宜采用：

在 Effect 函数中寻找一些变量添加到 deps 中，需要满足条件：其变化时，需要重新触发 effect。

按照这种实践方式，count 变化时，我们并不希望重新 setInterval，故 deps 为空数组。这意味着该 hook 只在组件挂载时运行一次。Effect 中明明依赖了 count，但我们撒谎说它没有依赖，那么当 setInterval 回调函数执行时，获取到的 count 值永远为 0。

遇到这种问题，直接从 deps 移除是不可行的。静下来分析一下，此处为什么要用到 count？能否避免对其直接使用？

可以看到，在 setCount 中用到了 count，为的是把 count 转换为 count + 1 ，然后返回给 React。React 其实已经知道当前的 count，我们需要告知 React 的仅仅是去递增状态，不管它现在具体是什么值。

所以有一个最佳实践：**状态变更时，应该通过 setState 的函数形式来代替直接获取当前状态。**
setCount(c => c + 1);

另外一种场景是：
```javascript
const [count, setCount] = useState(0);

useEffect(() => {
    const id = setInterval(() => {
        console.log(count);
    }, 1000);
    return () => clearInterval(id);
}, []);
```
在这里，同样的，当count 变化时，我们并不希望重新 setInterval。但我们可以把 count 通过 ref 保存起来。

```javascript
const [count, setCount] = useState(0);
const countRef = useRef();
countRef.current = count;

useEffect(() => {
    const id = setInterval(() => {
        console.log(countRef.current);
    }, 1000);
    return () => clearInterval(id);
}, []);
```
这样，count 的确不再被使用，而是用 ref 存储了一个在所有帧中共享的变量。

另外的情况是，Effects 依赖了函数或者其他引用类型。与原始数据类型不同的是，在未优化的情况下，每次 render 函数调用时，因为对这些内容的重新创建，其值总是发生了变化，导致 Effects 在使用 deps 的情况下依然会频繁被调用。

对于这个问题，![官网的 FAQ ](https://zh-hans.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)已经给出了答案：**对于函数，使用 useCallback 避免重复创建；对于对象或者数组，则可以使用 useMemo。从而减少 deps 的变化。**


### 使用 useMemo/useCallback

useMemo 的含义是，通过一些变量计算得到新的值。通过把这些变量加入依赖 deps，当deps 中的值均未发生变化时，跳过这次计算。useMemo 中传入的函数，将在 render 函数调用过程被同步调用。(我的理解，与vue中computed计算属性类似)

可以使用 useMemo 缓存一些相对耗时的计算。

除此以外，useMemo 也非常适合用于存储引用类型的数据，可以传入对象字面量，匿名函数等，甚至是 React Elements。
```javascript
const data = useMemo(() => ({
    a,
    b,
    c,
    d: 'xxx'
}), [a, b, c]);

// 可以用 useCallback 代替
const fn = useMemo(() => () => {
    // do something
}, [a, b]);

const memoComponentsA = useMemo(() => (
    <ComponentsA {...someProps} />
), [someProps]);
```
对于函数，其作为另外一个 useEffect 的 deps 时，减少函数的重新生成，就能减少该 Effect 的调用，甚至避免一些死循环的产生;

对于对象和数组，如果某个子组件使用了它作为 props，减少它的重新生成，就能**避免子组件不必要的重复渲染，提升性能。**

未优化的代码如下：
```javascript
const data = { id };
return <Child data={data}>;
```
此时，每当父组件需要 render 时，子组件也会执行 render。如果使用 useMemo 对 data 进行优化：
```javascript
const data = useMemo(() => ({ id }), [id]);

return <Child data={data}>
```
当父组件 render 时，只要满足 id 不变，data 的值也不会发生变化，子组件也将避免 render。

对于组件返回的 React Elements，我们可以选择性地提取其中一部分 elements，通过 useMemo 进行缓存，也能避免这一部分的重复渲染。

在过去的 class 组件中，我们通过 shouldComponentUpdate 判断当前属性和状态是否和上一次的相同，来避免组件不必要的更新。其中的比较是对于本组件的所有属性和状态而言的，无法根据 shouldComponentUpdate 的返回值来使该组件一部分 elements 更新，另一部分不更新。

为了进一步优化性能，我们会对大组件进行拆分，拆分出的小组件只关心其中一部分属性，从而有更多的机会不去更新。

而函数组件中的 useMemo 其实就可以代替这一部分工作。为了方便理解，我们来看 例五：

```javascript
function Example(props) {
    const [count, setCount] = useState(0);
    const [foo] = useState("foo");

    const main = (
        <div>
            <Item key={1} x={1} foo={foo} />
            <Item key={2} x={2} foo={foo} />
            <Item key={3} x={3} foo={foo} />
            <Item key={4} x={4} foo={foo} />
            <Item key={5} x={5} foo={foo} />
        </div>
    );

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>setCount</button>
            {main}
        </div>
    );
}

```

为了优化性能，我们可以将 main 变量这一部分单独作为一个组件 <Main>，拆分出去，并对  <Main> 使用诸如 React.memo , shouldComponentUpdate 的方式，使 count 属性变化时，<Main> 不重复 render。
const Main = React.memo((props) => {
    const { foo }= props;
    return (
        <div>
            <Item key={1} x={1} foo={foo} />
                <Item key={2} x={2} foo={foo} />
                <Item key={3} x={3} foo={foo} />
                <Item key={4} x={4} foo={foo} />
                <Item key={5} x={5} foo={foo} />
        </div>
    );
});
而现在，我们可以使用 useMemo，避免了组件拆分，代码也更简洁易懂：
```javascript
function Example(props) {
    const [count, setCount] = useState(0);
    const [foo] = useState("foo");

    const main = useMemo(() => (
        <div>
            <Item key={1} x={1} foo={foo} />
            <Item key={2} x={2} foo={foo} />
            <Item key={3} x={3} foo={foo} />
            <Item key={4} x={4} foo={foo} />
            <Item key={5} x={5} foo={foo} />
        </div>
    ), [foo]);

    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(count + 1)}>setCount</button>
            {main}
        </div>
    );
}
```
