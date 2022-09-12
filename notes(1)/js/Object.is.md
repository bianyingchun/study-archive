```js
Object.is(+0, -0); // false
Object.is(NaN, NaN); // true
```

polyfill

```js
if (!Object.is) {
  Object.is = function (x, y) {
    if (x === y) {
      // 1/-0 -Infinity
      return x != 0 || 1 / x == 1 / y;
    } else {
      return x !== x && y !== y;
    }
  };
}
```
