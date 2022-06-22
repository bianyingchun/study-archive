function textFill() {
  var name = "textFillTect";
  var alertTitle = "maid 提示你";
  function main() {
    // 创建文件夹
    // var newFolder = app.project.items.addFolder("文件夹");
    // // app.project.items.addComp(合成名称,宽度, 高度, 像素长宽比,持续时间, 帧速率);
    // var newComp = app.project.items.addComp("合成", 1280, 720, 1, 8, 25);
    // newComp.parentFolder = newFolder;
    // var currentComp;
    // // 获取当前所选中的对象
    var currentComp;
    function selComp() {
      currentComp = app.project.activeItem;
      if (currentComp instanceof CompItem) {
        return true;
      } else {
        alert("没有选中合成");
        return false;
      }
    }

    app.beginUndoGroup("创建各种层");
    if (selComp()) {
      // 添加空对象
      var myNull = currentComp.layers.addNull();
      myNull.name = "空对象";
      // 添加形状图层
      currentComp.layers.addShape();
      // 添加摄像机,addCamera(摄像机名,摄像机中心点位置)
      currentComp.layers.addCamera(
        "摄像机",
        [currentComp.width, currentComp.height] / 2
      );
      // 添加灯光层,addLight(灯光名称,灯光中心点位置)
      currentComp.layers.addLight(
        "灯光",
        [currentComp.width, currentComp.height] / 2
      );
      // 添加文字层,addSolid(颜色,图层名字,宽度,高度,像素长宽比,时长)
      currentComp.layers.addText("文字层");
      currentComp.layers.addSolid(
        [0, 1, 0],
        "固态层",
        currentComp.width,
        currentComp.height,
        currentComp.pixelAspect,
        currentComp.duration
      );
      // 调节层其实就是打开调节开关的固态层
      var myAdj = currentComp.layers.addSolid(
        [1, 1, 1],
        "调节层",
        currentComp.width,
        currentComp.height,
        currentComp.pixelAspect,
        currentComp.duration
      );
      // 打开调节层开关（关于各种开关的操作，下节会讲）
      myAdj.adjustmentLayer = true;
    }
    app.endUndoGroup();
  }
  main();
}
textFill();
