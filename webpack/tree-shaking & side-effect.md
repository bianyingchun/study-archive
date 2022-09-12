### tree shaking

1. 指去除代码中那些未引用代码，通过 Tree-shaking 就可以极大地减少最终打包后 bundle 的体积。
2. Webpack 生产模式打包的优化过程中，就使用自动开启这个功能，以此来检测我们代码中的未引用代码，然后自动移除它们。

3. 在其他其他非生产模式中，开启 tree shaking, 在配置文件中

   ```javascript
      optimization: {
      // 模块只导出被使用的成员
      usedExports: true,
      // 压缩输出结果
      minimize: true
   }
   ```

   这就是 Tree-shaking 的实现，整个过程用到了 Webpack 的两个优化功能：

   - usedExports - 打包结果中只导出外部用到的成员；
   - minimize - 压缩打包结果。

   如果把我们的代码看成一棵大树，那你可以这样理解：. usedExports 的作用就是标记树上哪些是枯树枝、枯树叶；minimize 的作用就是负责把枯树枝、枯树叶摇下来。

4. 合并模块（扩展）
   除了 usedExports 选项之外，我们还可以使用一个 concatenateModules 选项继续优化输出。普通打包只是将一个模块最终放入一个单独的函数中，如果我们的模块很多，就意味着在输出结果中会有很多的模块函数。concatenateModules 配置的作用就是尽可能将所有模块合并到一起输出到一个函数中，这样既提升了运行效率，又减少了代码的体积。

5. sideEffects

   ```javascript
   optimization: {
     sideEffects: true;
   }
   ```

   1. 注意这个特性在 production 模式下同样会自动开启。
   2. 那此时 Webpack 在打包某个模块之前，会先检查这个模块所属的 package.json 中的 sideEffects 标识，以此来判断这个模块是否有副作用，如果没有副作用的话，这些没用到的模块就不再被打包。换句话说，即便这些没有用到的模块中存在一些副作用代码，我们也可以通过 package.json 中的 sideEffects 去强制声明没有副作用。

6. 使用 sideEffects 这个功能的前提是确定你的代码没有副作用，或者副作用代码没有全局影响，否则打包时就会误删掉你那些有意义的副作用代码。宗旨：对全局有影响的副作用代码不能移除，而只是对模块有影响的副作用代码就可以移除。
   可以在 package.json 中配置保留哪些副作用的模块路径

```javascript
"sideEffects": [
    "./src/extend.js",
    "*.css"
  ]
```
