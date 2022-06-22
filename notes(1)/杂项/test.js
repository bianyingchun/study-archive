/*global XLSX*/
import React from "react";
import Spreadsheet from "x-data-spreadsheet";
// import XLSX from 'xlsx';
import zhCN from "x-data-spreadsheet/dist/locale/zh-cn";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import { onCellTextChange, formatStyle, dataToExcel } from "@/utils/xlsxHelper";
// If you need to override the default options, you can set the override
// const options = {};
// new Spreadsheet('#x-spreadsheet-demo', options);

function getIndex(s) {
  const start = "A".charCodeAt("0");
  let num = 0;
  for (let i = 0; i < s.length; i++) {
    num += s.charCodeAt(i) - start;
  }
  return num;
}
class App extends React.Component {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
    this.exportXlsx.bind(this);
    this.importXlsx.bind(this);
    console.log(XLSX, "XLSX");
  }
  componentDidMount() {
    Spreadsheet.locale("zh-cn", zhCN);
    const self = this;
    // new Spreadsheet(document.getElementById("xss-demo"));
    function load() {
      const rows10 = { len: 1000 };
      for (let i = 0; i < 1000; i += 1) {
        rows10[i] = {
          cells: {
            0: { text: "A-" + i },
            1: { text: "B-" + i },
            2: { text: "C-" + i },
            3: { text: "D-" + i },
            4: { text: "E-" + i },
            5: { text: "F-" + i },
          },
        };
      }
      const rows = {
        len: 80,
        1: {
          cells: {
            0: { text: "testingtesttestetst" },
            2: { text: "testing" },
          },
        },
        2: {
          cells: {
            0: { text: "render", style: 0 },
            1: { text: "Hello" },
            2: { text: "haha", merge: [1, 1] },
          },
        },
        8: {
          cells: {
            8: { text: "border test", style: 0 },
          },
        },
      };
      // x_spreadsheet.locale('zh-cn');
      var saveIcon =
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTc3MTc3MDkyOTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2NzgiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTIxMy4zMzMzMzMgMTI4aDU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMgODUuMzMzMzMzdjU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMgODUuMzMzMzMzSDIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMtODUuMzMzMzMzVjIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMtODUuMzMzMzMzeiBtMzY2LjkzMzMzNCAxMjhoMzQuMTMzMzMzYTI1LjYgMjUuNiAwIDAgMSAyNS42IDI1LjZ2MTE5LjQ2NjY2N2EyNS42IDI1LjYgMCAwIDEtMjUuNiAyNS42aC0zNC4xMzMzMzNhMjUuNiAyNS42IDAgMCAxLTI1LjYtMjUuNlYyODEuNmEyNS42IDI1LjYgMCAwIDEgMjUuNi0yNS42ek0yMTMuMzMzMzMzIDIxMy4zMzMzMzN2NTk3LjMzMzMzNGg1OTcuMzMzMzM0VjIxMy4zMzMzMzNIMjEzLjMzMzMzM3ogbTEyOCAwdjI1NmgzNDEuMzMzMzM0VjIxMy4zMzMzMzNoODUuMzMzMzMzdjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjcgNDIuNjY2NjY3SDI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjIxMy4zMzMzMzNoODUuMzMzMzMzek0yNTYgMjEzLjMzMzMzM2g4NS4zMzMzMzMtODUuMzMzMzMzeiBtNDI2LjY2NjY2NyAwaDg1LjMzMzMzMy04NS4zMzMzMzN6IG0wIDU5Ny4zMzMzMzR2LTEyOEgzNDEuMzMzMzMzdjEyOEgyNTZ2LTE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDQyNi42NjY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djE3MC42NjY2NjdoLTg1LjMzMzMzM3ogbTg1LjMzMzMzMyAwaC04NS4zMzMzMzMgODUuMzMzMzMzek0zNDEuMzMzMzMzIDgxMC42NjY2NjdIMjU2aDg1LjMzMzMzM3oiIHAtaWQ9IjI2NzkiIGZpbGw9IiMyYzJjMmMiPjwvcGF0aD48L3N2Zz4=";
      var previewEl = document.createElement("img");
      previewEl.src =
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjIxMzI4NTkxMjQzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjU2NjMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNNTEyIDE4Ny45MDRhNDM1LjM5MiA0MzUuMzkyIDAgMCAwLTQxOC41NiAzMTUuNjQ4IDQzNS4zMjggNDM1LjMyOCAwIDAgMCA4MzcuMTIgMEE0MzUuNDU2IDQzNS40NTYgMCAwIDAgNTEyIDE4Ny45MDR6TTUxMiAzMjBhMTkyIDE5MiAwIDEgMSAwIDM4NCAxOTIgMTkyIDAgMCAxIDAtMzg0eiBtMCA3Ni44YTExNS4yIDExNS4yIDAgMSAwIDAgMjMwLjQgMTE1LjIgMTE1LjIgMCAwIDAgMC0yMzAuNHpNMTQuMDggNTAzLjQ4OEwxOC41NiA0ODUuNzZsNC44NjQtMTYuMzg0IDQuOTI4LTE0Ljg0OCA4LjA2NC0yMS41NjggNC4wMzItOS43OTIgNC43MzYtMTAuODggOS4zNDQtMTkuNDU2IDEwLjc1Mi0yMC4wOTYgMTIuNjA4LTIxLjMxMkE1MTEuNjE2IDUxMS42MTYgMCAwIDEgNTEyIDExMS4xMDRhNTExLjQ4OCA1MTEuNDg4IDAgMCAxIDQyNC41MTIgMjI1LjY2NGwxMC4yNCAxNS42OGMxMS45MDQgMTkuMiAyMi41OTIgMzkuMTA0IDMyIDU5Ljc3NmwxMC40OTYgMjQuOTYgNC44NjQgMTMuMTg0IDYuNCAxOC45NDQgNC40MTYgMTQuODQ4IDQuOTkyIDE5LjM5Mi0zLjIgMTIuODY0LTMuNTg0IDEyLjgtNi40IDIwLjA5Ni00LjQ4IDEyLjYwOC00Ljk5MiAxMi45MjhhNTExLjM2IDUxMS4zNiAwIDAgMS0xNy4yOCAzOC40bC0xMi4wMzIgMjIuNC0xMS45NjggMjAuMDk2QTUxMS41NTIgNTExLjU1MiAwIDAgMSA1MTIgODk2YTUxMS40ODggNTExLjQ4OCAwIDAgMS00MjQuNDQ4LTIyNS42bC0xMS4zMjgtMTcuNTM2YTUxMS4yMzIgNTExLjIzMiAwIDAgMS0xOS44NC0zNS4wMDhMNTMuMzc2IDYxMS44NGwtOC42NC0xOC4yNC0xMC4xMTItMjQuMTI4LTcuMTY4LTE5LjY0OC04LjMyLTI2LjYyNC0yLjYyNC05Ljc5Mi0yLjQ5Ni05LjkyeiIgcC1pZD0iNTY2NCI+PC9wYXRoPjwvc3ZnPg==";
      previewEl.width = 16;
      previewEl.height = 16;

      var xs = new Spreadsheet("#xss-demo", {
        showToolbar: true,
        showGrid: true,
        showBottomBar: true,
        extendToolbar: {
          left: [
            {
              tip: "Save",
              icon: saveIcon,
              onClick: (data, sheet) => {
                console.log("click save button：", data, sheet);
              },
            },
          ],
          right: [
            {
              tip: "Preview",
              el: previewEl,
              onClick: (data, sheet) => {
                console.log("click preview button：", data);
              },
            },
          ],
        },
      })
        .loadData([
          {
            freeze: "B3",
            styles: [
              {
                bgcolor: "#f4f5f8",
                textwrap: true,
                color: "#900B09",
                border: {
                  top: ["thin", "#0366d6"],
                  bottom: ["thin", "#0366d6"],
                  right: ["thin", "#0366d6"],
                  left: ["thin", "#0366d6"],
                },
              },
            ],
            merges: ["C3:D4"],
            cols: {
              len: 10,
              2: { width: 200 },
            },
            rows,
          },
          { name: "sheet-test", rows: rows10 },
        ])
        .change((cdata) => {
          // console.log(cdata);
          console.log(">>>", xs.getData());
        });
      //
      const fieldMap = {
        消耗: "consume",
        成本: "cost",
      };

      const reg = new RegExp("消耗|成本|账户|时段", "g");
      const reg2 = new RegExp("!(消耗|成本)", "g");
      xs.on("cell-selected", (cell, ri, ci) => {
        console.log("selected");

        // console.log('cell:', cell, ', ri:', ri, ', ci:', ci);
      })
        .on("cell-edited", (text, ri, ci) => {
          // if (reg.test(text)) {
          //   const t1 = text.replace(reg2, ' ');
          //   console.log();
          //   elem.innerHTML = t1.replace(
          //     reg,
          //     str => `<div class="bubble"><span>${str}</span></div>`,
          //   );
          // }
          // console.log('text:', text, ', ri: ', ri, ', ci:', ci);
          onCellTextChange(text, elem);
        })
        .on("change", (arg) => {
          console.log("onChange", arg);
        });
      self.xs = xs;
      setTimeout(() => {
        // xs.loadData([{ rows }]);
        xs.cellText(14, 3, "cell-text").reRender();
        console.log("cell(8, 8):", xs.cell(8, 8));
        console.log("cellStyle(8, 8):", xs.cellStyle(8, 8));
      }, 5000);
      // 初始化浮层
      const container = document.querySelector(".x-spreadsheet-editor-area");
      console.log("container", container);
      const elem = document.createElement("div");
      elem.className = "x-spread-format-editor";
      container.appendChild(elem);
      const textarea = document.querySelector(
        ".x-spreadsheet-editor-area textarea"
      );
      textarea.addEventListener("focus", (e) => {
        console.log("focus");
        onCellTextChange(e.target.value, elem);
      });
      textarea.addEventListener("blur", () => {
        elem.innerHTML = "";
      });
    }
    load();
  }
  exportXlsx() {
    const sdata = this.xs.getData();
    const out = dataToExcel(sdata);
    XLSX.writeFile(out, "sheetjs.xlsx", {});
  } //导出文件
  importXlsx(e) {
    const self = this;
    const files = e.target.files;
    var rABS =
      typeof FileReader !== "undefined" &&
      (FileReader.prototype || {}).readAsBinaryString;
    var f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      if (typeof console !== "undefined")
        console.log("onload", new Date(), rABS);
      var data = e.target.result;
      if (!rABS) data = new Uint8Array(data);
      self._process_wb(
        XLSX.read(data, { type: rABS ? "binary" : "array", cellStyles: true })
      );
    };
    if (rABS) reader.readAsBinaryString(f);
    else reader.readAsArrayBuffer(f);
  }
  _process_wb(wb) {
    /* update x-spreadsheet */
    const out = [];
    console.log("wb", wb);
    wb.SheetNames.forEach(function (name) {
      var o = { name: name, rows: {}, styles: [] };
      var ws = wb.Sheets[name];

      var aoa = XLSX.utils.sheet_to_json(ws, { raw: true, header: 1 });
      console.log("ws", ws);
      for (let key in ws) {
        const item = ws[key];
        const matched = key.match(/^([A-Za-z]+)(\d+)$/);
        if (matched) {
          const [_, x, y] = matched;
          const col = getIndex(x);
          const row = +y - 1;
          if (!o.rows[row]) {
            o.rows[row] = {
              cells: {},
            };
          }
          if (!o.rows[row].cells[col]) {
            o.rows[row].cells[col] = {};
          }
          const { w = "", s, c = "" } = item;
          s && o.styles.push(formatStyle(s));
          o.rows[row].cells[col] = {
            text: w,
            style: s ? o.styles.length - 1 : undefined,
          };
        }
      }
      // aoa.forEach(function(r, i) {
      //   var cells = {};
      //   r.forEach(function(c, j) {
      //     cells[j] = { text: c };
      //   });
      //   o.rows[i] = { cells: cells };
      // });

      out.push(o);
    });
    console.log("out", out);
    this.xs.loadData(out);
  }
  render() {
    return (
      <div>
        <div id="xss-demo"></div>
        <div>
          <input
            type="file"
            name="xlfile"
            id="xlf"
            onChange={(e) => {
              this.importXlsx(e);
            }}
          />{" "}
          导入exel文件
        </div>
        <div>
          <button
            onClick={() => {
              this.exportXlsx();
            }}
          >
            导出文件
          </button>
        </div>
        <textarea
          onChange={(e) => {
            console.log(e.target.value);
          }}
        ></textarea>
      </div>
    );
  }
}

export default App;
