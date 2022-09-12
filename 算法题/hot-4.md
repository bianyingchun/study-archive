## 494. 目标和

## 补充题：检测循环依赖

循环依赖检测。如，[['A', 'B'], ['B', 'C'], ['C', 'D'], ['B', 'D']] => false，[['A', 'B'], ['B', 'C'], ['C', 'A']] => true（2021.4 字节跳动-幸福里-后端）[2]
拓扑排序。

https://mp.weixin.qq.com/s/pCRscwKqQdYYN7M1Sia7xA

## 400. 第 N 位数字

```js
var findNthDigit = function (n) {
  let d = 1,
    count = 9;
  // 找到所在位数
  while (n > d * count) {
    n -= d * count;
    d++;
    count *= 10;
  }
  // 得到所在位数中数组的下标
  const index = n - 1;
  // 得到所在位数中的起始数字
  const start = Math.floor(Math.pow(10, d - 1));
  // 得到包含目标值的数字
  const num = start + Math.floor(index / d);
  // 根据偏移量返回目标值
  return Number((num + "")[index % d]);
};
```

## Z 字形变换

```js
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  if (numRows < 2) return s;
  const res = new Array(numRows).fill("");
  let row = 0;
  let flag = -1;

  for (let i = 0; i < s.length; i++) {
    res[row] += s[i];
    if (row === 0 || row == numRows - 1) {
      flag = -flag;
    }
    row += flag;
  }
  return res.filter((item) => !!item).join("");
};
```

## 基本计算器 \*\* todo

```js
var calculate = function (s) {
  const ops = [1];
  let sign = 1;

  let ret = 0;
  const n = s.length;
  let i = 0;
  while (i < n) {
    if (s[i] === " ") {
      i++;
    } else if (s[i] === "+") {
      sign = ops[ops.length - 1];
      i++;
    } else if (s[i] === "-") {
      sign = -ops[ops.length - 1];
      i++;
    } else if (s[i] === "(") {
      ops.push(sign);
      i++;
    } else if (s[i] === ")") {
      ops.pop();
      i++;
    } else {
      let num = 0;
      while (i < n && !isNaN(Number(s[i])) && s[i] !== " ") {
        num = num * 10 + s[i].charCodeAt() - "0".charCodeAt();
        i++;
      }
      ret += sign * num;
    }
  }
  return ret;
};
```

## LCP 07. 传递信息

```js
/**
 * @param {number} n
 * @param {number[][]} relation
 * @param {number} k
 * @return {number}
 */
var numWays = function (n, relation, k) {
  const hash = {};
  relation.forEach(([start, end]) => {
    if (!hash[start]) {
      hash[start] = [];
    }
    hash[start].push(end);
  });
  let res = 0;
  function dfs(index, step) {
    if (step === k) {
      if (index === n - 1) {
        res++;
      }
      return;
    }
    if (hash[index]) {
      hash[index].forEach((node) => {
        dfs(node, step + 1);
      });
    }
  }
  dfs(0, 0);
  return res;
};
```

### 柠檬水找零

```js
var lemonadeChange = function (bills) {
  let five = 0,
    ten = 0;
  for (const bill of bills) {
    if (bill === 5) {
      five += 1;
    } else if (bill === 10) {
      if (five === 0) {
        return false;
      }
      five -= 1;
      ten += 1;
    } else {
      if (five > 0 && ten > 0) {
        five -= 1;
        ten -= 1;
      } else if (five >= 3) {
        five -= 3;
      } else {
        return false;
      }
    }
  }
  return true;
};
```

## 二叉树最大宽度

```js
var widthOfBinaryTree = function (root) {
  root.pos = 0n;
  const queue = [root];
  let max = Number.MIN_VALUE;
  while (queue.length) {
    const len = queue.length;
    const start = queue[0].pos;
    const end = queue[len - 1].pos;
    max = max < end - start + 1n ? end - start + 1n : max;
    console.log("max", max, end, start);
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      if (node.left) {
        node.left.pos = node.pos * 2n;
        queue.push(node.left);
      }
      if (node.right) {
        node.right.pos = node.pos * 2n + 1n;
        queue.push(node.right);
      }
    }
  }
  return max;
};
```

## 面试题 01.03. URL 化

```js
var replaceSpaces = function (S, length) {
  return S.replace(/\s/g, (s, i) => (i >= length ? "" : "%20"));
};
```

## 第三大的数

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var thirdMax = function (nums) {
  let max = -Infinity;
  let second = -Infinity;
  let third = -Infinity;
  let len = nums.length;
  for (let i = 0; i < len; i++) {
    if (nums[i] > max) [third, second, max] = [second, max, nums[i]];
    if (nums[i] === max) continue;
    if (nums[i] > second) [third, second] = [second, nums[i]];
    if (nums[i] === second) continue;
    if (nums[i] > third) third = nums[i];
  }
  // 第三大的数不存在, 所以返回最大的数
  return third === -Infinity ? max : third;
};
```

## 完美数

```js
/**
 * @param {number} num
 * @return { boolean }
 */
var checkPerfectNumber = function (num) {
  if (num == 1) {
    return false;
  }
  let sum = 1; // 正整数一定会有一个 1 ，同时不用考虑自身，所以单独处理
  let i = 2;
  const sqrt = Math.sqrt(num);
  for (; i < sqrt; i++) {
    if (num % i == 0) {
      sum += i;
      sum += num / i;
    }
  }
  // 此处单独处理的原因在于只需要加 1 次 i 值，如果在循环中会加 2 次
  if (i * i == num) {
    sum += i;
  }
  return sum == num;
};
```

## 把数字翻译成字符串

```js
/**
 * @param {number} num
 * @return {number}
 */
var translateNum = function (num) {
  num = num + "";
  if (!num.length) return 0;
  const dp = [1];
  for (let i = 1; i < num.length; i++) {
    const str = num[i - 1] + num[i];
    if (+num[i - 1] && str >= 0 && str <= 25) {
      dp[i] = dp[i - 1] + (i > 1 ? dp[i - 2] : 1);
    } else {
      dp[i] = dp[i - 1];
    }
  }
  return dp[num.length - 1];
};
```

### 剑指 Offer 54. 二叉搜索树的第 k 大节点

右中左遍历

```js
/**
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */
var kthLargest = function (root, k) {
  let result;
  function dfs(node) {
    if (!node) return;
    dfs(node.right);
    if (--k === 0) return (result = node.val);
    dfs(node.left);
  }
  dfs(root);
  return result;
};
```

### 外观数列

```js
/**
 * @param {number} n
 * @return {string}
 */
var countAndSay = function (n) {
  let str = "1";
  for (let i = 2; i <= n; i++) {
    let count = 0;
    let cur = "";
    let prev = str[0];
    for (let j = 0; j < str.length; j++) {
      if (prev === str[j]) {
        count++;
      } else {
        cur += count + prev;
        count = 1;
        prev = str[j];
      }
    }
    cur += count + prev;
    str = cur;
  }
  return str;
};
```

## 翻转等价二叉树

```js
var flipEquiv = function (root1, root2) {
  console.log(root1, root2);
  if (root1 == null && root2 == null) return true;
  if (!root1 || !root2 || root1.val !== root2.val) return false;
  return (
    (flipEquiv(root1.left, root2.left) &&
      flipEquiv(root1.right, root2.right)) ||
    (flipEquiv(root1.left, root2.right) && flipEquiv(root1.right, root2.left))
  );
};
```

## 179. 最大数

```js
var largestNumber = function (nums) {
  if (Number(nums.join(""))) {
    return nums
      .map((a) => a.toString())
      .sort((a, b) => b + a - (a + b))
      .join("");
  }
  return "0";
};
```

## 77. 组合

```js
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function (n, k) {
  const res = [];
  const helper = (start, path = []) => {
    if (path.length === k) {
      return res.push([...path]);
    }
    //剪支 搜索起点的上界 + 接下来要选择的元素个数 - 1 = n
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      helper(i + 1, path);
      path.pop();
    }
  };
  helper(1);
  return res;
};
```

## 二叉搜索树节点最小距离

```js
var minDiffInBST = function (root) {
  let min = Infinity; // 记录最小值，初始值为Infinity，避免对比时出错
  let prev = null; // 缓存上一个节点的值

  // 中序遍历二叉搜索树
  function traversal(node) {
    // 节点为空则停止递归
    if (!node) {
      return;
    }

    // 向左子树递归
    traversal(node.left);

    // 中序遍历在左右子树的递归中间处理即可
    // 如果prev有值，则每次比较相邻节点之差
    if (prev !== null) {
      // 并与之前已缓存的最小值对比，min始终缓存最小值
      min = Math.min(min, node.val - prev);
    }
    // 将当前节点的值缓存为prev，用于下一次比较
    prev = node.val;

    // 向右子树递归
    traversal(node.right);
  }
  traversal(root);

  return min;
};
```

## 717. 1 比特与 2 比特字符

```js
function isOneBitCharacter(bits) {
  const n = bits.length;
  let pos = 0;
  while (pos < n - 1) {
    pos += bits[pos] === 1 ? 2 : 1;
  }
  return pos == n - 1;
}
```

## 搜索二维矩阵 II

从右上角看是一颗二叉搜索树

```js
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
function searchMatrix(matrix, target) {
  const rows = matrix.length;
  if (!rows) return false;
  const cols = matrix[0].length;
  if (!cols) {
    return false;
  }
  let x = cols - 1,
    y = 0;
  while (x >= 0 && y < rows) {
    if (target > matrix[y][x]) {
      y++;
    } else if (target < matrix[y][x]) {
      x--;
    } else {
      return true;
    }
  }
  return false;
}
```

## 颠倒字符串中的单词

```js
/**
 * @param {string} s
 * @return {string}
 */
var reverseWords = function (s) {
  s = s.trim();
  const res = [];
  let i, j;
  i = j = s.length - 1;
  while (i >= 0) {
    while (i >= 0 && s[i] != " ") i--; // 搜索首个空格
    res.push(s.substring(i + 1, j + 1)); // 添加单词
    while (i >= 0 && s[i] == " ") i--; // 跳过单词间空格
    j = i; // j 指向下个单词的尾字符
  }
  return res.join(" ");
};

var reverseWords = function (s) {
  return s.trim().split(/\s+/).reverse().join(" ");
};
```

## 257. 二叉树的所有路径

```js
const binaryTreePaths = (root) => {
  const res = [];

  const buildPath = (root, pathStr) => {
    if (root == null) {
      // 遍历到null
      return; // 结束当前递归分支
    }
    if (root.left == null && root.right == null) {
      // 遍历到叶子节点
      pathStr += root.val; // 路径末尾了，不用加箭头
      res.push(pathStr); // 加入解集
      return;
    }
    pathStr += root.val + "->"; // 处理非叶子节点，要加箭头
    buildPath(root.left, pathStr); // 基于当前的pathStr，递归左子树
    buildPath(root.right, pathStr); // 基于当前的pathStr，递归右子树
  };

  buildPath(root, "");
  return res;
};
```

## 1047. 删除字符串中的所有相邻重复项

```js
var removeDuplicates = function (S) {
  let stack = [];
  for (let i = 0, sLen = S.length; i < sLen; i++) {
    if (stack.length && stack[stack.length - 1] === S[i]) {
      stack.pop();
    } else {
      stack.push(S[i]);
    }
  }
  return stack.join("");
};
```

## 680. 验证回文字符串 Ⅱ

```js
var validPalindrome = function (s) {
  // 缓存字符串长度
  const len = s.length;

  // 建立左右两个指针
  let i = 0,
    j = len - 1;

  // 看看左右指针是否满足相等的条件 是的话一起向中间前进
  while (i < j && s[i] === s[j]) {
    i++;
    j--;
  }

  // 判断跳过右指针元素后是否满足回文的情况
  if (isPalindrome(i, j - 1)) {
    return true;
  }

  // 判断跳过左指针元素后是否满足回文的情况
  if (isPalindrome(i + 1, j)) {
    return true;
  }

  // 工具函数 用来判断是否是回文
  function isPalindrome(st, sd) {
    while (st < sd) {
      if (s[st] != s[sd]) {
        return false;
      }
      st++;
      sd--;
    }
    return true;
  }
  // 默认返回false
  return false;
};
```

## 面试题 08.02. 迷路的机器人

```js
var pathWithObstacles = function (obstacleGrid) {
  const m = obstacleGrid.length;
  const n = obstacleGrid[0].length;
  const path = [];
  function dfs(visit, x, y) {
    if (x >= m || y >= n || visit[x][y] || obstacleGrid[x][y] === 1)
      return false;
    path.push([x, y]);
    visit[x][y] = true;
    if (x === m - 1 && y == n - 1) return true;
    if (dfs(visit, x + 1, y) || dfs(visit, x, y + 1)) return true;
    path.pop();
    return false;
  }
  const visit = new Array(m).fill(0).map((item) => new Array(n).fill(false));
  dfs(visit, 0, 0);
  return path;
};
```

##

```js
解题思路
标签：动态规划
假设 n 个节点存在二叉排序树的个数是 G (n)，令 f(i) 为以 i 为根的二叉搜索树的个数，则
G(n) = f(1) + f(2) + f(3) + f(4) + ... + f(n)

当 i 为根节点时，其左子树节点个数为 i-1 个，右子树节点为 n-i，则
f(i) = G(i-1)*G(n-i)

综合两个公式可以得到 卡特兰数 公式
G(n) = G(0)*G(n-1)+G(1)*(n-2)+...+G(n-1)*G(0)


var numTrees = function(n) {
    const G = new Array(n + 1).fill(0);
    G[0] = 1;
    G[1] = 1;

    for (let i = 2; i <= n; ++i) {
        for (let j = 1; j <= i; ++j) {
            G[i] += G[j - 1] * G[i - j];
        }
    }
    return G[n];
};


console.log(numTrees(3));
```

## 第 N 位数字

## 1356. 根据数字二进制下 1 的数目排序

sortByBits

```js
var sortByBits = function (arr) {
  const countBits = (n) => {
    const temp = n;
    let count = 0;
    while (n) {
      count += n & 1;
      n = n >> 1;
    }
    return [temp, count];
  };
  arr = arr.map((n) => countBits(n));
  arr = arr.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return arr.map(([m, n]) => m);
};
```

## 130. 被围绕的区域

```js
var solve = function (board) {
  const m = board.length;
  const n = board[0].length;
  for (let i = 0; i < m; i++) {
    dfs(i, 0);
    dfs(i, n - 1);
  }
  for (let i = 1; i < n - 1; i++) {
    dfs(0, i);
    dfs(m - 1, i);
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] == "A") {
        board[i][j] = "O";
      } else if (board[i][j] == "O") {
        board[i][j] = "X";
      }
    }
  }
  return board;
  function dfs(x, y) {
    if (x < 0 || y < 0 || x >= m || y >= n || board[x][y] !== "O") return;
    board[x][y] = "A";
    dfs(x - 1, y);
    dfs(x + 1, y);
    dfs(x, y + 1);
    dfs(x, y - 1);
  }
};
```

## 241. 为运算表达式设计优先级

```js
function diffWaysToCompute(input) {
  if (/^\d+$/.test(input)) return [+input];
  const ans = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (/[+*/-]/.test(char)) {
      const left = diffWaysToCompute(input.substring(0, i));
      const right = diffWaysToCompute(input.substring(i + 1));
      for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
          if (char == "+") {
            ans.push(left[i] + right[j]);
          } else if (char == "-") {
            ans.push(left[i] - right[j]);
          } else {
            ans.push(left[i] * right[j]);
          }
        }
      }
    }
  }
  return ans;
}
```

## 会议室
按开始时间排序后，依次检查相邻前一个的结束和后一个的开始时间是否重叠
```js
bool canAttendMeetings(vector<vector<int>>& intervals) {
      sort(intervals.begin(), intervals.end(),[&](auto a, auto b){
        return a[0] < b[0];
      });
      for(int i = 1; i < intervals.size(); ++i)
      {
        if(intervals[i-1][1] > intervals[i][0])
          return false;
      }
      return true;
    }
```

## 会议室
给你输入若干形如 [begin, end] 的区间，代表若干会议的开始时间和结束时间，请你计算至少需要申请多少间会议室。