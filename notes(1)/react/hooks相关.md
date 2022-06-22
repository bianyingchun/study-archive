### 获取上一个 props

通过 useEffect 在组件渲染完毕后再执行的特性，再利用 useRef 的可变特性，让 usePrevious 的返回值是 “上一次” Render 时的。

```javascript
const usePrevious = (value) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
```

### 定时器操作

```javascript
// 第一种，不依赖外部变量，setCount 还有一种函数回调模式，你不需要关心当前值是什么，只要对 “旧的值” 进行修改即可。这样虽然代码永远运行在第一次 Render 中，但总是可以访问到最新的 state。

useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);

// 第二种，利用 useEffect 的兄弟 useReducer 函数，将更新与动作解耦，这就是一个局部 “Redux”，由于更新变成了 dispatch({ type: "tick" }) 所以不管更新时需要依赖多少变量，在调用更新的动作里都不需要依赖任何变量。
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: "tick" }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

### useRef 和 createRef 的区别

1. useRef 仅能用在 FunctionComponent，createRef 仅能用在 ClassComponent。
2. createRef 并没有 Hooks 的效果，其值会随着 FunctionComponent 重复执行而不断被初始化：

```javascript
function App() {
  // 错误用法，永远也拿不到 ref
  const valueRef = React.createRef();
  return <div ref={valueRef} />;
}
```

### react 的清理过程

`effects` 可能需要有一个清理步骤。本质上，它的目的是消除副作用（`effect`)，比如取消订阅。

思考下面的代码:

```js
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
  };
});
```

假设第一次渲染的时候`props`是`{id: 10}`，第二次渲染的时候是`{id: 20}`。你可能会认为发生了下面的这些事：

- React 清除了 `{id: 10}` 的 `effect`。
- React 渲染`{id: 20}`的 UI。
- React 运行`{id: 20}`的 effect。
  (事实并不是这样。)

如果依赖这种心智模型，你可能会认为清除过程“看到”的是旧的`props`因为它是在重新渲染之前运行的，新的`effect`“看到”的是新的`props`因为它是在重新渲染之后运行的。这种心智模型直接来源于`class`组件的生命周期。不过它并不精确。让我们来一探究竟。

`React`只会在浏览器绘制后运行`effects`。这使得你的应用更流畅因为大多数`effects`并不会阻塞屏幕的更新。`Effect`的清除同样被延迟了。上一次的`effect`会在重新渲染后被清除：

- React 渲染`{id: 20}`的 UI。
- 浏览器绘制。我们在屏幕上看到`{id: 20}`的 UI。
- React 清除`{id: 10}`的 effect。
- React 运行`{id: 20}`的 effect。
  你可能会好奇：如果清除上一次的`effect`发生在`props`变成`{id: 20}`之后，那它为什么还能“看到”旧的`{id: 10}`？
  引用上半部分得到的结论:

> 组件内的每一个函数（包括事件处理函数，`effects`，定时器或者 API 调用等等）会捕获定义它们的那次渲染中的`props`和`state`。

现在答案显而易见。`effect`的清除并不会读取“最新”的`props`。它只能读取到定义它的那次渲染中的`props`值：

```js
// First render, props are {id: 10}
function Example() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // Cleanup for effect from first render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Next render, props are {id: 20}
function Example() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // Cleanup for effect from second render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

王国会崛起转而复归尘土，太阳会脱落外层变为白矮星，最后的文明也迟早会结束。但是第一次渲染中 `effect`的清除函数只能看到 `{id: 10}` 这个 `props`。

这正是为什么 `React`能做到在绘制后立即处理 `effects` — 并且默认情况下使你的应用运行更流畅。如果你的代码需要依然可以访问到老的 `props`。

## 说说竞态

下面是一个典型的在`class`组件里发请求的例子：

```js
class Article extends Component {
  state = {
    article: null,
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

你很可能已经知道，上面的代码埋伏了一些问题。它并没有处理更新的情况。所以第二个你能够在网上找到的经典例子是下面这样的：

```js
class Article extends Component {
  state = {
    article: null,
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

这显然好多了！但依旧有问题。有问题的原因是请求结果返回的顺序不能保证一致。比如我先请求 `{id: 10}`，然后更新到`{id: 20}`，但`{id: 20}`的请求更先返回。请求更早但返回更晚的情况会错误地覆盖状态值。

这被叫做竞态，这在混合了`async` / `await`（假设在等待结果返回）和自顶向下数据流的代码中非常典型（`props`和`state`可能会在`async`函数调用过程中发生改变）。

`Effects`并没有神奇地解决这个问题，尽管它会警告你如果你直接传了一个`async` 函数给`effect`。（我们会改善这个警告来更好地解释你可能会遇到的这些问题。）

如果你使用的异步方式支持取消，那太棒了。你可以直接在清除函数中取消异步请求。

或者，最简单的权宜之计是用一个布尔值来跟踪它：

```js
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```
