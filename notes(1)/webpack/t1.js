const HtmlWebpackPlugin = require("html-webpack-plugin"); // 通过 npm 安装
const webpack = require("webpack"); // 访问内置的插件
const path = require("path");
module.exports = {
  entry: {
    app: "./src/app.js",
    vendor: "./src/vendor.js",
    adminApp: {
      import: "./src/adminApp.js",
      dependOn: "a2", // 当前入口所依赖的入口。它们必须在该入口被加载前被加载,另外 dependOn 不能是循环引用的
      // filename: 指定要输出的文件名称。
      //library: 指定 library 选项，为当前 entry 构建一个 library。
      // runtime: 运行时 chunk 的名字。如果设置了，就会创建一个新的运行时 chunk。在 webpack 5.43.0 之后可将其设为 false 以避免一个新的运行时 chunk。runtime 和 dependOn 不应在同一个入口上同时使用,确保 runtime 不能指向已存在的入口名称,
      //
    },
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader" },
      {
        test: /\.css$/,
        use: [
          // [style-loader](/loaders/style-loader)
          { loader: "style-loader" },
          // [css-loader](/loaders/css-loader)
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          // [sass-loader](/loaders/sass-loader)
          { loader: "sass-loader" },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  resolve: {
    alias: {
      utilities: path.resolve(__dirname, "src/utilties"), //  引用别名配置：import Utility from 'Utilities/utility';
    },
  },
};
