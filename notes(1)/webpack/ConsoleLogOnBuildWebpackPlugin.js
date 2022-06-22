const pluginName = "ConsoleLogOnBuildWebpackPlugin";

class ConsoleLogOnBuildWebpackPlugin {
  app(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log("webpack 构建过程开始！");
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
