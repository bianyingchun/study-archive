## x 的平方根

```JS
/**
 * @param {number} x
 * @return {number}
 */
function mySqrt( x) {
      // 注意：针对特殊测试用例，例如 2147395599
      // 要把搜索的范围设置成长整型
      // 为了照顾到 0 把左边界设置为 0
      let left = 0;
      // # 为了照顾到 1 把右边界设置为 x // 2 + 1
      let right = x / 2 + 1;
      while (left < right) {
          // 注意：这里一定取右中位数，如果取左中位数，代码会进入死循环
          // long mid = left + (right - left + 1) / 2;
        const mid = left + Math.ceil((right -left)/2)
        const square = mid * mid;
          if (square > x) {
              right = mid - 1;
          } else {
              left = mid;
          }
      }
      // 因为一定存在，因此无需后处理
      return left
  }
```

## 字符串相乘

```js
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */

var multiply = function (num1, num2) {
  if (num1 == "0" || num2 == "0") return "0";
  num1 = num1 + "";
  num2 = num2 + "";
  let l1 = num1.length,
    l2 = num2.length,
    store = new Array(l1 + l2 - 1).fill(0),
    t = 0,
    r = "";
  for (let i = 0; i < l2; i++) {
    for (let j = 0; j < l1; j++) {
      store[i + j] += +num2[i] * +num1[j];
    }
  }
  let carry = 0;
  let res = "";
  for (let i = store.length - 1; i >= 0; i--) {
    if (carry === 0 && store[i] === 0 && i === 0) break;
    const num = carry + +store[i];
    const cur = num % 10;
    carry = Math.floor(num / 10);
    res = cur + res;
  }
  return carry === 0 ? res : carry + res;
};
```

## 求根到叶子节点数字之和

```js
const dfs = (root, prevSum) => {
  if (root === null) {
    return 0;
  }
  const sum = prevSum * 10 + root.val;
  if (root.left == null && root.right == null) {
    return sum;
  } else {
    return dfs(root.left, sum) + dfs(root.right, sum);
  }
};
var sumNumbers = function (root) {
  return dfs(root, 0);
};
```

## 圆圈中最后剩下的数字 \*\*

第 m 个要删除的数字
约瑟夫环问题：f(n) = (f(n-1) + m )% n

```js
/**
 * @param {number} n
 * @param {number} m
 * @return {number}
 */
var lastRemaining = function (n, m) {
  let pos = 0;
  for (let i = 2; i <= n; i++) {
    pos = (pos + m) % i;
  }
  return pos;
};
```

## 零钱兑换\*\*

dp(n) 的定义：输入一个目标金额 n，返回凑出目标金额 n 的最小硬币量。
最小硬币组合 = Math.min(以前最小硬币组合，当前硬币为 coin 时剩余面额的最小硬币组合)
状态转移方程为：dp[i] = Math.min(dp[i], 1 + dp[i - coin]);

```js
function coinChange(coins, amount) {
  const max = amount + 1;
  const dp = new Array(amount + 1).fill(max);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (let j = 0; j < coins.length; j++) {
      if (coins[j] <= i) {
        dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}
```

## 494. 目标和

```js
var findTargetSumWays = function (nums, target) {
  // (sum - neg)[添加+号的元素之和] - neg[添加-号的元素之和] === target => neg === (sum-target)/2
  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  const diff = sum - target;
  if (diff < 0 || diff % 2 !== 0) {
    return 0;
  }
  const n = nums.length,
    neg = diff / 2;
  // dp[i][j] 数组中前i个元素中选取元素，这些元素的和为j的方案数
  const dp = new Array(n + 1).fill(0).map(() => new Array(neg + 1).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];
    for (let j = 0; j <= neg; j++) {
      if (j >= num) {
        // 可选num可不选
        dp[i][j] = dp[i - 1][j] + dp[i - 1][j - num];
      } else {
        // num > j， 则不能选num
        dp[i][j] = dp[i - 1][j];
      }
    }
  }
  return dp[n][neg];
};
// 空间优化
// 由于 dp 的每一行的计算只和上一行有关，因此可以使用滚动数组的方式，去掉dp 的第一个维度，将空间复杂度优化到 O(neg)。，实现时，内层循环需采用倒序遍历的方式，这种方式保证转移来的是 dp[i-1] 中的元素值。

var findTargetSumWays = function (nums, target) {
  // (sum - neg)[添加+号的元素之和] - neg[添加-号的元素之和] === target => neg === (sum-target)/2
  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  const diff = sum - target;
  if (diff < 0 || diff % 2 !== 0) {
    return 0;
  }
  const n = nums.length,
    neg = diff / 2;
  // dp[i][j] 数组中前i个元素中选取元素，这些元素的和为j的方案数
  const dp = new Array(neg + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];
    for (let j = reg; j >= 0; j--) {
      if (j >= num) {
        // 可选num可不选
        dp[j] += dp[j - num];
      }
    }
  }
  return dp[neg];
};
```

## 509. 斐波那契数

```js
var fib = function (n) {
  let dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};
```

# N 叉树的层序遍历 \*\*

```js
/**
 * @param {Node|null} root
 * @return {number[][]}
 */
var levelOrder = function (root) {
  if (!root) return [];
  let queue = [root];
  const res = [];
  while (queue.length) {
    const list = [];
    let len = queue.length;
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      if (node) {
        list.push(node.val);
        node.children && queue.push(...node.children);
      }
    }
    res.push(list);
  }
  return res;
};
```

## 复原 IP 地址 \*\*

回溯法

```js
const restoreIpAddresses = (s) => {
  const res = [];
  // 复原从start开始的子串
  const dfs = (subRes, start) => {
    if (subRes.length == 4 && start == s.length) {
      // 片段满4段，且耗尽所有字符
      res.push(subRes.join(".")); // 拼成字符串，加入解集
      return; // 返不返回都行，指针已经到头了，严谨的说还是返回
    }
    if (subRes.length == 4 && start < s.length) {
      // 满4段，字符未耗尽，不用往下选了
      return;
    }
    for (let len = 1; len <= 3; len++) {
      // 枚举出选择，三种切割长度
      if (start + len - 1 >= s.length) return; // 加上要切的长度就越界，不能切这个长度
      if (len != 1 && s[start] == "0") return; // 不能切出'0x'、'0xx'

      const str = s.substring(start, start + len); // 当前选择切出的片段
      if (len == 3 && +str > 255) return; // 不能超过255

      subRes.push(str); // 作出选择，将片段加入subRes
      dfs(subRes, start + len); // 基于当前选择，继续选择，注意更新指针
      subRes.pop(); // 上面一句的递归分支结束，撤销最后的选择，进入下一轮迭代，考察下一个切割长度
    }
  };

  dfs([], 0); // dfs入口
  return res;
};
```

## 排序数组

```js
var sortArray = function (nums) {
  function partition(list, low, high) {
    const pivotKey = list[low];
    while (low < high) {
      while (low < high && list[high] >= pivotKey) high--;
      list[low] = list[high];
      while (low < high && list[low] <= pivotKey) low++;
      list[high] = list[low];
    }
    list[low] = pivotKey;
    return low;
  }

  function quickSort(list, low, high) {
    if (low < high) {
      const pivotKey = partition(list, low, high);
      quickSort(list, low, pivotKey - 1);
      quickSort(list, pivotKey + 1, high);
    }
  }
  quickSort(arr, 0, arr.length - 1);
  return arr;
};
```

## 用栈实现队列

```js
var CQueue = function () {
  //入栈
  this.inStall = [];
  //出栈
  this.outStall = [];
};

/**
 * @param {number} value
 * @return {void}
 */
CQueue.prototype.appendTail = function (value) {
  //进入队列
  this.isStall.push(value);
};

/**
 * @return {number}
 */
CQueue.prototype.deleteHead = function () {
  if (this.outStall.length > 0) {
    //出队列
    return this.outStall.pop();
  } else {
    //准备出队列，先把入的队列的元素一一从头进入出队列中
    while (this.isStall.length > 0) {
      this.outStall.push(this.isStall.pop());
    }

    return this.outStall.pop() || -1;
  }
};
```

## 寻找峰值

二分法

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findPeakElement = function (nums) {
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] > nums[mid + 1]) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
};
```

## 字符串的排列

```js
var permutation = function (s) {
  const result = [];
  function dfs(s, prev) {
    if (!s) {
      result.push(prev);
    }
    const set = new Set();
    for (let i = 0; i < s.length; i++) {
      if (set.has(s[i])) continue;
      set.add(s[i]);
      dfs(s.substring(0, i) + s.substring(i + 1), prev + s[i]);
    }
  }
  dfs(s, "");
  return result;
};
```

## 199. 二叉树的右视图

##### 1.一、BFS

思路： 利用 BFS 进行层次遍历，记录下每层的最后一个元素。
时间复杂度： O(N)，每个节点都入队出队了 1 次。
空间复杂度： O(N)，使用了额外的队列空间。

```javascript
function rightSideView(root) {
  const res = [];
  if (root == null) {
    return res;
  }
  const queue = [];
  queue.push(root);
  while (queue.length) {
    const len = queue.length;
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      if (node.left != null) {
        queue.push(node.left);
      }
      if (node.right != null) {
        queue.push(node.right);
      }
      if (i == len - 1) {
        //将当前层的最后一个节点放入结果列表
        res.push(node.val);
      }
    }
  }
  return res;
}
```

##### 2. DFS

我们按照 「根结点 -> 右子树 -> 左子树」 的顺序访问，就可以保证每层都是最先访问最右边的节点的。

（与先序遍历 「根结点 -> 左子树 -> 右子树」 正好相反，先序遍历每层最先访问的是最左边的节点）

时间复杂度： O(N)，每个节点都访问了 1 次。
空间复杂度： O(N)，因为这不是一棵平衡二叉树，二叉树的深度最少是 logN, 最坏的情况下会退化成一条链表，深度就是 N，因此递归时使用的栈空间是 O(N) 的。

```javascript
function rightSideView(root) {
  const res = [];
  dfs(root, 0); // 从根节点开始访问，根节点深度是0
  return res;
  function dfs(root, depth) {
    if (!root) {
      return;
    }
    // 先访问 当前节点，再递归地访问 右子树 和 左子树。
    if (depth === res.length) {
      // 如果当前节点所在深度还没有出现在res里，说明在该深度下当前节点是第一个被访问的节点，因此将当前节点加入res中。
      res.push(root.val);
    }
    depth++;
    dfs(root.right, depth);
    dfs(root.left, depth);
  }
}
```

## 从前序与中序遍历序列构造二叉树\*\*

## 千位分隔数

```js
var thousandSeparator = function (n) {
  let res = [];
  n = n + "";
  for (let i = n.length; i > 0; i -= 3) {
    res.unshift(n.slice(Math.max(0, i - 3), i));
  }
  return res.join(".");
};
```

## 打乱数组

```js
var Solution = function (nums) {
  this.nums = nums;
};

Solution.prototype.reset = function () {
  return this.nums;
};

Solution.prototype.shuffle = function () {
  let arr = [...this.nums];
  let n = arr.length;

  for (let i = arr.length - 1; i >= 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let t = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = t;
  }
  return arr;
};
```

## 字符串编码

##

## 验证 IP 地址

```js
var validIPAddress = function (queryIP) {
  const index = queryIP.indexOf(".");
  if (index !== -1) return isIpv4(queryIP);
  return isIpv6(queryIP);
  function isIpv4(ip) {
    const list = ip.split(".");
    if (list.length !== 4) return "Neither";
    for (let i = 0; i < list.length; i++) {
      let num = +list[i];
      // 不能包含
      if (num + "" !== list[i] || num < 0 || num > 255) return "Neither";
    }
    return "IPv4";
  }
  function isIpv6(ip) {
    const list = ip.split(":");
    if (list.length !== 8) return "Neither";
    for (let i = 0; i < list.length; i++) {
      let num = list[i];
      // 不能包含
      if (!/^[A-Fa-f0-9]{1,4}$/.test(num)) return "Neither";
    }
    return "IPv6";
  }
};
```

## 用栈实现队列

```javascript
/**
 * Initialize your data structure here.
 */
class MyQueue {
  constructor() {
    this.pushArr = [];
    this.popArr = [];
  }
  /**将一个元素放入队列的尾部 */
  push(value) {
    this.pushArr.push(value);
  }
  /**从队列首部移除元素 */
  pop() {
    if (!this.popArr.length) {
      //走到这里是因为 popArr 为空，此时需要将 pushArr 里的所有元素依次放入
      while (this.pushArr.length) {
        this.popArr.push(this.pushArr.pop());
      }
    }
    return this.popArr.pop();
  }
  /**返回队列首部的元素 */
  peek() {
    if (!this.popArr.length) {
      while (this.pushArr.length) {
        this.popArr.push(this.pushArr.pop());
      }
    }
    return this.popArr[this.popArr.length - 1];
  }
  /**返回队列是否为空 */
  empty() {
    return !this.pushArr.length && !this.popArr.length;
  }
}

/**
 * Your MyQueue object will be instantiated and called as such:
 * var obj = new MyQueue()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.peek()
 * var param_4 = obj.empty()
 */
```

## 矩形重叠

```js
var isRectangleOverlap = function (rec1, rec2) {
  const xOverlap = !(rec1[2] <= rec2[0] || rec2[2] <= rec1[0]);
  const yOverlap = !(rec1[3] <= rec2[1] || rec2[3] <= rec1[1]);
  return xOverlap && yOverlap;
};
```

## 整数组顺序使奇数位于偶数前面

双指针 交换

```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var exchange = function (nums) {
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    if (nums[left] % 2) {
      left++;
      continue;
    }
    if (nums[right] % 2 === 0) {
      right--;
      continue;
    }

    const temp = nums[left];
    nums[left] = nums[right];
    nums[right] = temp;
    left++;
    right--;
  }
  return nums;
};
```

## 二叉搜索树中的众数

中序遍历 升序

```js
var findMode = function (root) {
  let base = 0,
    count = 0,
    maxCount = 0;
  let answer = [];

  const update = (x) => {
    if (x === base) {
      ++count;
    } else {
      count = 1;
      base = x;
    }
    if (count === maxCount) {
      answer.push(base);
    }
    if (count > maxCount) {
      maxCount = count;
      answer = [base];
    }
  };

  const dfs = (o) => {
    if (!o) {
      return;
    }
    dfs(o.left);
    update(o.val);
    dfs(o.right);
  };

  dfs(root);
  return answer;
};
```

## 单词搜索 \*\*

```js
const exist = (board, word) => {
  const m = board.length;
  const n = board[0].length;
  const used = new Array(m); // 二维矩阵used，存放bool值
  for (let i = 0; i < m; i++) {
    used[i] = new Array(n);
  }
  // canFind 判断当前点是否是目标路径上的点
  const canFind = (row, col, i) => {
    // row col 当前点的坐标，i当前考察的word字符索引
    if (i == word.length) {
      // 递归的出口 i越界了就返回true
      return true;
    }
    if (row < 0 || row >= m || col < 0 || col >= n) {
      // 当前点越界 返回false
      return false;
    }
    if (used[row][col] || board[row][col] != word[i]) {
      // 当前点已经访问过，或，非目标点
      return false;
    }
    // 排除掉所有false的情况，当前点暂时没毛病，可以继续递归考察
    used[row][col] = true; // 记录一下当前点被访问了
    // canFindRest：基于当前选择的点[row,col]，能否找到剩余字符的路径。
    const canFindRest =
      canFind(row + 1, col, i + 1) ||
      canFind(row - 1, col, i + 1) ||
      canFind(row, col + 1, i + 1) ||
      canFind(row, col - 1, i + 1);

    if (canFindRest) {
      // 基于当前点[row,col]，可以为剩下的字符找到路径
      return true;
    }
    used[row][col] = false; // 不能为剩下字符找到路径，返回false，撤销当前点的访问状态
    return false;
  };

  for (let i = 0; i < m; i++) {
    // 遍历找起点，作为递归入口
    for (let j = 0; j < n; j++) {
      if (board[i][j] == word[0] && canFind(i, j, 0)) {
        // 找到起点且递归结果为真，找到目标路径
        return true;
      }
    }
  }
  return false; // 怎么样都没有返回true，则返回false
};
```

### 压缩字符串

```js
const compress = (chars) => {
  const len = chars.length;
  let s = "";
  let i = 0,
    j = i + 1;
  while (j <= len) {
    // 相等的话 右指针向右移
    if (chars[i] === chars[j]) {
      j++;
    } else {
      const tempS = j - i > 1 ? `${chars[i]}${j - i}` : `${chars[i]}`;
      s += tempS;
      i = j;
      j = i + 1;
    }
  }
  // 写入chars
  for (let i = 0; i < s.length; i++) {
    chars[i] = s[i];
  }
  return s.length;
};
```

## 反转链表 II

```js
function reverseBetween(head, m, n) {
  // 设置哑节点的好处：在m=1时，我们也有前驱节点，也可以将cur的next节点依次插入到pre的后面
  const dummy = new ListNode(-1);
  dummy.next = head;
  let pre = dummy;
  // 找到m的前驱节点
  for (let i = 1; i < m; ++i) pre = pre.next;
  let cur = pre.next;
  for (let i = m; i < n; ++i) {
    // 每次循环将nxt节点插入到pre的后面
    const nxt = cur.next;
    // cur将nxt节点后面的链表连接起来
    cur.next = nxt.next;
    // 将nxt插入到pre后面
    nxt.next = pre.next;
    pre.next = nxt;
  }
  return dummy.next;
}
```

## 对角线

```js
var findDiagonalOrder = function (mat) {
  let res = [];
  const m = mat.length,
    n = mat[0].length;
  //i 是 x + y 的和
  for (let i = 0; i < m + n; i++) {
    if (i % 2 === 0) {
      // 0,2,4
      let y = i > m - 1 ? m - 1 : i;
      let x = i - y;
      while (y >= 0 && x < n) {
        res.push(mat[y][x]);
        x++;
        y--;
      }
    } else {
      let x = i > n - 1 ? n - 1 : i;
      let y = i - x;
      while (y < m && x >= 0) {
        res.push(mat[y][x]);
        x--;
        y++;
      }
    }
  }
  return res;
};
```

### 二叉树中的最大路径和

```js
var maxPathSum = function (root) {
  var max = Number.MIN_SAFE_INTEGER;
  function dfs(node) {
    if (!node) return 0;
    // 递归计算左右子节点的最大贡献值
    // 只有在最大贡献值大于 0 时，才会选取对应子节点
    let left = Math.max(0, dfs(node.left));
    let right = Math.max(0, dfs(node.right));
    // 节点的最大路径和取决于该节点的值与该节点的左右子节点的最大贡献值
    max = Math.max(max, left + right + node.val);
    // 返回节点的最大贡献值
    // 每个子树内部的最大路径和是我想求的，要找出最大的
    // 这个内部路径肯定是要走这个子树的root的，而且是要参考左右子树所提供的最大和的
    // 想捞取子树所提供的最大和，只能走其中一个分支，因为从root伸进去子树的路径，不能拐来拐去，不能占两路便宜
    // 只能在子树里选一条分支走，那就得判断哪个分支提供的路径和更大
    // 所以每个递归调用都要返回出【提供给父节点的最大路径和】，它用于计算每个递归调用都要算一下的内部最大路径和

    return node.val + Math.max(left, right);
  }
  dfs(root);
  return max;
};
```

## 1424. 对角线遍历 II

```js
/*
既然是对角线，那么x+y就是相等的。所以我们可以按照x+y去分类，开一个二维数组ans[ i ] [ j ]，i表示（x+y），然后正常遍历这个nums，每遍历到一个元素，看看它的x+y，把它丢到ans[x+y]中。由于我们是从左到右从上到下遍历nums的，所以答案是反过来的，最后再reverse一下就行了。
*/

function findDiagonalOrder(nums) {
  const hash = [];
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums[i].length; j++) {
      if (!hash[i + j]) hash[i + j] = [];
      hash[i + j].push(nums[i][j]);
    }
  }
  const res = [];
  for (let i = 0; i < hash.length; i++) {
    if (hash[i]) {
      for (let j = hash[i].length - 1; j >= 0; j--) {
        res.push(hash[i][j]);
      }
    }
  }
  return res;
}
```

## 缺失的第一个正数 \*\*//原地哈希

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var firstMissingPositive = function (nums) {
  const len = nums.length;
  for (let i = 0; i < len; i++) {
    while (nums[i] > 0 && nums[i] <= len && nums[nums[i] - 1] != nums[i]) {
      // 满足在指定范围内、并且没有放在正确的位置上，才交换
      // 例如：数值 3 应该放在索引 2 的位置上
      swap(nums, nums[i] - 1, i);
    }
  }

  // [1, -1, 3, 4]
  for (let i = 0; i < len; i++) {
    if (nums[i] != i + 1) {
      return i + 1;
    }
  }
  // 都正确则返回数组长度 + 1
  return len + 1;
};

function swap(nums, index1, index2) {
  const temp = nums[index1];
  nums[index1] = nums[index2];
  nums[index2] = temp;
}
```

## 调整数组顺序使奇数位于偶数前面

```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var exchange = function (nums) {
  let left = 0,
    right = nums.length - 1;
  while (left < right) {
    if (nums[left] % 2) {
      left++;
      continue;
    }
    if (nums[right] % 2 === 0) {
      right--;
      continue;
    }

    const temp = nums[left];
    nums[left] = nums[right];
    nums[right] = temp;
    left++;
    right--;
  }
  return nums;
};
```

## 阿拉伯数字转中文

```js
/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param n int整型
 * @return string字符串
 */
function num2cn(n) {
  const isLose = n < 0; // 是不是负数
  n = Math.abs(n).toString();
  const res = [],
    len = n.length;

  // 四位做一次转译
  for (let i = len; i > 0; i -= 4) {
    res.push(NumToChina(n.slice(Math.max(0, i - 4), i)));
  }

  const unit = ["", "万", "亿"];
  for (let i = 0; i < res.length; i++) {
    // 如果四位数都为 0，则会为空，这种不需要填单位了
    if (res[i] === "") continue;
    res[i] += unit[i];
  }

  isLose && res.push("负");

  return res.reverse().join("");
}

function NumToChina(n) {
  n = n.toString();
  if (n === "0") return "零";
  const unit = ["", "十", "百", "千"];
  const number = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const len = n.length;
  let res = "";
  for (let i = 0; i < len; i++) {
    const num = Number(n[i]);
    // 多个零只加入一个零，如 1006
    if (num !== 0) {
      if (n[i - 1] === "0") res += "零";
      // 先数字后单位
      res += number[num] + unit[len - i - 1];
    }
  }
  // 12 会为 一十二，但正确应该为 十二，所以当十位数是一且只有两位数字的时候，去掉前面的一
  if (len === 2 && n[0] === "1") res = res.slice(1);
  return res;
}

module.exports = {
  num2cn: num2cn,
};
```
