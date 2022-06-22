const a: string = "3";
const b: any = 2;

let t: unknown;
if (typeof t === "number") {
  t.toFixed(2);
}
const arrayNumber: number[] = [1, 2, 3, 4];

const greaterThan2: number = arrayNumber.find((num) => num > 2) as number; // 提示 ts(2322)
