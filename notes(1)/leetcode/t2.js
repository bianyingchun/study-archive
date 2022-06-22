const xlsx = require("node-xlsx");
const sheetList = xlsx.parse("field.xlsx");
const fs = require("fs");
const nodeList = sheetList.map((sheet, sindex) => {
  const { data } = sheet;

  const node = [
    {
      label: "基础字段",
      children: [
        {
          label: "日期【年/月/日】",
          field: "date",
          dim: true,
          type: "date_form",
          format: {
            text: "年/月/日",
            value: "%Y/%m/%d",
          },
        },
        {
          label: "日期【年.月.日】",
          field: "date",
          dim: true,
          type: "date_form",
          format: {
            text: "年.月.日",
            value: "%Y.%m.%d",
          },
        },
        {
          label: "日期【X月X日】",
          field: "date",
          dim: true,
          type: "date_form",
          format: {
            text: "X月X日",
            value: "%m月%d日",
          },
        },
        {
          label: "小时【X点】",
          field: "hour",
          dim: true,
          type: "hour_form",
          format: {
            text: "点",
            value: "点",
          },
        },
        {
          label: "小时【00:00】",
          dim: true,
          field: "hour",
          type: "hour_form",
          format: {
            text: ":00",
            value: ":00",
          },
        },
        {
          field: "vendor_account_name",
          label: "媒体账户名称",
          dim: true,
        },
      ],
    },
    {
      label: "时报",
      children: [],
    },
    {
      label: "日报",
      children: [],
    },
    {
      label: "前日数据",
      children: [],
    },
  ];
  ["展示数据", "互动数据", "应用下载数据", "落地页数据"].map((label) => {
    node[1].children.push({
      label,
      children: [],
    });
    node[2].children.push({
      label,
      children: [],
    });
    node[3].children.push({
      label,
      children: [],
    });
  });

  // 基础字段

  data.forEach((item, index) => {
    if (index < 3) return;

    let col = 0;
    // 时报
    node[1].children.forEach((tnode, i) => {
      col += 2;
      if (!item[col]) return;
      const label = item[col].trim();
      let field = item[col + 1] || "";
      if (!field) {
        field = "y_" + tnode.children[tnode.children.length - 1].field;
      }
      field = field.trim();
      if (field === "action_ratio") {
        tnode.children.push({
          calc: true,
          field,
          label,
          text: "行为数/素材曝光数",
          content: [
            {
              type: "field",
              data: { label: "行为数", field: "content_click" },
            },
            {
              type: "text",
              text: "/",
            },
            {
              type: "field",
              data: {
                label: "素材曝光数",
                field: "content_impression",
              },
            },
          ],
        });
      } else if (field === "y_action_ratio") {
        tnode.children.push({
          calc: true,
          field,
          label,
          text: "行为数【昨日同时段】/素材曝光数【昨日同时段】",
          content: [
            {
              type: "field",
              data: { label: "行为数【昨日同时段】", field: "y_content_click" },
            },
            {
              type: "text",
              text: "/",
            },
            {
              type: "field",
              data: {
                label: "素材曝光数【昨日同时段】",
                field: "y_content_impression",
              },
            },
          ],
        });
      } else {
        tnode.children.push({
          label,
          field,
        });
      }
    });

    node[2].children.forEach((tnode, i) => {
      col += 2;
      if (!item[col]) return;
      const label = item[col].trim();
      let field = item[col + 1] || "";
      field = "y_all_" + field.trim();
      let child = {
        label,
        field,
      };

      if (field === "y_all_action_ratio") {
        console.log(">>>>>>>>>", 3);
        child.calc = true;
        child.text = "昨日行为数/昨日素材曝光数";
        child.content = [
          {
            type: "field",
            data: { label: "昨日行为数", field: "y_all_content_click" },
          },
          {
            type: "text",
            text: "/",
          },
          {
            type: "field",
            data: {
              label: "昨日素材曝光数",
              field: "y_all_content_impression",
            },
          },
        ];
      }

      tnode.children.push(child);
    });

    node[3].children.forEach((tnode, i) => {
      col += 2;
      if (!item[col]) return;
      const label = item[col].trim();
      let field = item[col + 1] || "";
      field = "fd_" + field.trim();
      let child = {
        label,
        field,
      };
      if (field === "fd_action_ratio") {
        child.calc = true;
        child.text = "前日行为数/前日素材曝光数";
        child.content = [
          {
            type: "field",
            data: { label: "前日行为数", field: "fd_content_click" },
          },
          {
            type: "text",
            text: "/",
          },
          {
            type: "field",
            data: {
              label: "前日素材曝光数",
              field: "fd_content_impression",
            },
          },
        ];
      }

      tnode.children.push(child);
    });
  });
  return node;
});
const name = ["ks", "tt", "gdt"];
nodeList.forEach((item, index) => {
  fs.writeFile(
    "./field_" + name[index] + ".json",
    JSON.stringify(item),
    (err, data) => {
      console.log(err, data);
    }
  );
});
