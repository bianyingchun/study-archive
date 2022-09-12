/**
 * compiler.js
 *
 * 功能
 * - 编译模板，解析指令/插值表达式
 * - 负责页面的首次渲染
 * - 数据变化后，重新渲染视图
 *
 * 属性
 * - el -app元素
 * - vm -vue实例
 *
 * 方法：
 * - compile(el) -编译入口
 * - compileElement(node) -编译元素（指令）
 * - compileText(node) 编译文本（插值）
 * - isDirective(attrName) -（判断是否为指令）
 * - isTextNode(node) -（判断是否为文本节点）
 * - isElementNode(node) - （判断是否问元素节点）
 */

 class Compiler {
    constructor(vm) {
      // 获取vm
      this.vm = vm
      // 获取el
      this.el = vm.$el
      // 编译模板 渲染视图
      this.compile(this.el)
    }
    // 编译模板渲染视图
    compile(el) {
      // 不存在则返回
      if (!el) return;
      // 获取子节点
      const nodes = el.childNodes;
      //收集
      Array.from(nodes).forEach((node) => {
        // 文本类型节点的编译
        if (this.isTextNode(node)) {
          // 编译文本节点
          this.compileText(node)
        } else if (this.isElementNode(node)) {
          // 编译元素节点
          this.compileElement(node)
        }
        // 判断是否还存在子节点
        if (node.childNodes && node.childNodes.length) {
          this.compile(node);
        }
      });
    }
    // 添加指令方法 并且执行
    update(node, value, attrName, key) {
      // 定义相应的方法 举个例子：添加textUpdater就是用来处理v-text的
      const updateFn = this[`${attrName}Updater`];
      // 若存在 则调用
      updateFn && updateFn.call(this, node, value, key);
    }
    // 用来处理v-text
    textUpdater(node, value, key) {
      node.textContent = value;
    }
    // 用来处理v-model
    modelUpdater(node, value, key) {
      node.value = value;
      // 用来实现双向数据绑定
      node.addEventListener("input", (e) => {
        this.vm[key] = node.value;
      });
    }
    // 编译元素节点
    compileElement(node) {
      // 获取到元素节点上面的所有属性进行遍历
      Array.from(node.attributes).forEach((attr) => {
        // 获取属性名
        let _attrName = attr.name
        // 判断是否是 v- 开头
        if (this.isDirective(_attrName)) {
          // 删除 v-
          const attrName = _attrName.substr(2);
          // 获取属性值 并赋值给key
          const key = attr.value;
          const value = this.vm[key];
          // 添加指令方法
          this.update(node, value, attrName, key);
          // 数据更新之后，通过wather更新视图
          new Watcher(this.vm, key, (newValue) => {
            this.update(node, newValue, attrName, key);
          });
        }
      });
    }
    // 编译文本节点
    compileText(node) {
      // . 表示任意单个字符，不包含换行符、+ 表示匹配前面多个相同的字符、？表示非贪婪模式，尽可能早的结束查找
      const reg = /\{\{(.+?)\}\}/; 
      // 获取节点的文本内容
      var param = node.textContent;
      // 判断是否有 {{}}
      if (reg.test(param)) {
        //  $1 表示匹配的第一个，也就是{{}}里面的内容
        // 去除 {{}} 前后空格
        const key = RegExp.$1.trim();
        // 赋值给node
        node.textContent = param.replace(reg, this.vm[key]);
        // 编译模板的时候，创建一个watcher实例，并在内部挂载到Dep上
        new Watcher(this.vm, key, (newValue) => {
          // 通过回调函数，更新视图
          node.textContent = newValue;
        });
      }
    }
    // 判断元素的属性是否是vue指令
    isDirective(attrName) {
      return attrName && attrName.startsWith("v-");
    }
    // 判断是否是文本节点
    isTextNode(node) {
      return node && node.nodeType === 3;
    }
    // 判断是否是元素节点
    isElementNode(node) {
      return node && node.nodeType === 1;
    }
  }