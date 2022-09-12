const priority = {
  "-": 1,
  "+": 1,
  "*": 2,
  "/": 2,
};

var calculate = function (s) {
  s = s.replaceAll(" ", "");
  const nums = [0];
  const ops = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") {
      ops.push(c);
    } else if (c === ")") {
      while (ops.length) {
        if (ops[ops.length - 1] !== "(") {
          calc(nums, ops);
        } else {
          ops.pop();
          break;
        }
      }
    } else if (!isNaN(c)) {
      let num = c;
      let j = i + 1;
      while (j < s.length && !isNaN(s[j])) {
        num += s[j++];
      }

      console.log(num);
      nums.push(+num);
      i = j - 1;
    } else {
      if (i > 0 && (s[i - 1] == "(" || s[i - 1] == "+" || s[i - 1] == "-")) {
        nums.push(0);
      }
      while (ops.length && ops[ops.length - 1] !== "(") {
        const prev = ops[ops.length - 1];
        if (priority[prev] >= priority[c]) {
          calc(nums, ops);
        } else {
          break;
        }
      }
      ops.push(c);
    }
  }
  console.log(nums, ops);
  while (ops.length) {
    calc(nums, ops);
  }
  return nums[nums.length - 1];
};

function calc(nums, ops) {
  if (nums.length < 2 || !ops.length) return;
  const b = nums.pop(),
    a = nums.pop();
  const op = ops.pop();
  let ans = 0;
  if (op === "+") {
    ans = a + b;
  } else if (op === "-") {
    ans = a - b;
  } else if (op === "/") {
    ans = a / b;
  } else if (op === "*") {
    ans = a * b;
  }
  nums.push(ans);
}

const res = calculate("(4+3) * (2+1)");
console.log("res", res);

var nextGreaterElement = function (n) {
  const str = (n + "").split("");
  let j = str.length - 2;
  if (str.length < 2) return -1;
  while (j >= 0 && str[j] >= str[j + 1]) {
    j--;
  }
  let k = str.length - 1;
  if (j >= 0) {
    while (k >= 0 && str[j] >= str[k]) {
      k--;
    }
    const t = str[j];
    str[j] = str[k];
    str[k] = t;
  }
  reverse(str, j + 1, str.length - 1);
  const num = +str.join("");
  return num <= n || num > Math.pow(2, 32) ? -1 : num;
};

function reverse(arr = [], start, end) {
  while (start < end) {
    const t = arr[end];
    arr[end] = arr[start];
    arr[start] = t;
    start++;
    end--;
  }
}

const a = nextGreaterElement(21);
console.log(a);
