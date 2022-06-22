var a = "3";
var b = 2;
var t;
if (typeof t === "number") {
    t.toFixed(2);
}
var arrayNumber = [1, 2, 3, 4];
var greaterThan2 = arrayNumber.find(function (num) { return num > 2; }); // 提示 ts(2322)
