1. 参考 model 代码
2. 封装 xlsx editor
   1. react context
   2. immutable immer.js
   3. react
   4. 拓展组件
   5. 复写组件

## 10/27

1. formula 聚合函数 只支持 sum,average
2. 文本 消耗+点击=> 表达式 cost+click =》 表达式校验, 关键词匹配，高亮显示

## 10/28

1. 创建自定义编辑组件 XEditor，实例化 xSpreadSheet 后，渲染 xEditor 并插入到 xSpreadSheet.sheet.editor.el 下，将 xSpreadSheet.sheet.editor 替换成 XEditor 组件实例
2. 监听 XEditor 组件编辑值变化，更新 xSpreadSheet.sheet.data 并执行 sheet.table.render()重新渲染表格;
3. XEditor 内部使用 BraftEditor 富文本编辑器插件，以支持非文本输入和复杂样式，并通过 cell.html 存储实际编辑 html 内容，cell.text 存储 html 转换后的 text

## 10/29

4. 编辑开始 focus 并设定焦点为文本结束位置,结束 blur
5. 随文本变化设定编辑器宽高
6. 点击 fieldItem 插入到当前焦点位置

<!-- 11/1 -->

2. 样式 toolbar 撑开

<!-- 11/2 -->

1. 所有的字段加上昨日同时段数据 昨日数据 //
2. tapd 详情
3. 设置单元格不可编辑 //
4. 编辑时机修改其他属性同样生效 //
5. 多格式字段选择 日期：年/月/日、年.月.日、X 月 X 日，时间：00:00、XX 点
6. 修复自定义 editor 导致的操作历史 bug

<!-- 11/3 -->
   <!-- 3. 编辑数据带有账户列表 -->
   <!-- 4. 在 toolbar 添加导入按钮，支持导入文件 -->
<!-- 11/4 -->

<!-- 1. 缓存中间步骤 -->
<!-- 2. 特殊字段自动映射 -->
<!-- 4. 禁止 id 行删除(contextMenu 禁用) -->
<!-- 11/5 -->

<!-- 1. 管理后台 报表渠道 source 字段 筛选
2. 首行不允许删除插入 contextMenu -->

<!-- 11/9 -->

<!-- 1. 离开编辑页面 prompt 提示 -->

<!-- 2. 数据迁移：报表编辑进来有 xlsxData,找到账户名称列，有 customerFields 就找到映射替换账户名称，提交时删除 customerField 字段 -->
<!-- 3. 模板 template xlsxData合并 -->
<!-- 3. 字段列表优化 -->

<!-- 1. 市场插件 api 替换 -->

<!-- ### 12/30 上线 气泡强提醒 -->

### 自定义模板优化

<!-- 1. 单元格数据格式标识
2. 区分表头，数据行，合计行，标识 hover 文案
3. 角标 批注标识 4. 常数合并列只在数据行首行
4. 数据行首行编辑了表达式下方不允许编辑 -->
   <!-- 6. 账户 id 列右键不可删除 -->
   <!-- 4. 上一步/下一步保存历史问题 -->
   <!-- 4. 标题行至少保留一行 -->

5. <!-- 11/24 -->

### 12/1 市场插件自定义模板 提测

### 12/8 优化 2.0 提测

<!-- 12/6 -->

## 12/9 图片数据 提测

1. 广告位置字段区分不同媒体
   头条：inventory_category
   快手/广点通 ：scene_id

## 巨量市场广告清理插件

1. 对比变化，决定是新开项目还是分环境打包

## 视频混剪

1. apex->xml -> json
   替换部分属性
2. json->xml->apex
