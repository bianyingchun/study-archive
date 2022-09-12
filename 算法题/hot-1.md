## N 皇后问题

```js
/* 输入棋盘边长 n，返回所有合法的放置 */
function solveNQueens(n) {
  // '.' 表示空，'Q' 表示皇后，初始化空棋盘。
  const board = new Array(n).fill(0).map(() => new Array(n).fill("."));
  const res = [];
  backtrack(0);
  return res;

  function isValid(row, col) {
    // 检查列是否有皇后互相冲突
    for (let i = 0; i < n; i++) {
      if (board[i][col] === "Q") return false;
    }
    // 检查右上方是否有皇后互相冲突
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === "Q") return false;
    }
    // 检查左上方是否有皇后互相冲突
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === "Q") return false;
    }
    return true;
  }

  // 路径：board 中小于 row 的那些行都已经成功放置了皇后
  // 选择列表：第 row 行的所有列都是放置皇后的选择
  // 结束条件：row 超过 board 的最后一行
  function backtrack(row) {
    // 触发结束条件;
    if (row === board.length) {
      res.push(board.map((row) => row.join("")));
      return;
    }

    for (let col = 0; col < n; col++) {
      // 排除不合法选择;
      if (!isValid(row, col)) {
        continue;
      }
      // 做选择;
      board[row][col] = "Q";
      // 进入下一行决策;
      backtrack(row + 1);
      // 撤销选择;
      board[row][col] = ".";
    }
  }
}

console.log(solveNQueens(4));
```

## 轮转数组

```js
let reverse = function (nums, start, end) {
  while (start < end) {
    [nums[start++], nums[end--]] = [nums[end], nums[start]];
  }
};
let rotate = function (nums, k) {
  k %= nums.length;
  reverse(nums, 0, nums.length - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, nums.length - 1);
  return nums;
};
```

## 数组中的第 K 个最大元素

1：借助快速排序

#### 解题思路

题目是求得数组中第 K 个最大的元素，若数组是升序的，那这个数在数组中的索引是 len-k;快速排序中每次 partition 操作都能确定中心记录 pivotkey 的位置，所以我们只需找到 partition 操作定位到最终排定以后索引为 len - k 的那个元素。
快速排序

```javascript
function partition(list, low, high) {
  const pivotkey = list[low];
  while (low < high) {
    while (low < high && list[high] >= pivotkey) high--;
    list[low] = list[high];
    while (low < high && list[low] <= pivotkey) low++;
    list[high] = list[low];
  }
  list[low] = pivotkey;
  return low;
}

function findKthLargest(nums, k) {
  const len = nums.length;
  let left = 0;
  let right = len - 1;
  // 转换一下，第 k 大元素的索引是 len - k
  const target = len - k;
  while (true) {
    const index = partition(nums, left, right);
    if (index == target) {
      return nums[index];
    } else if (index < target) {
      left = index + 1;
    } else {
      right = index - 1;
    }
  }
}
```

## 长度最小的子数组

```js
var minSubArrayLen = function (target, nums) {
  let sum = 0;
  let i = 0;
  result = nums.length + 1;
  for (let j = 0; j <= nums.length; j++) {
    sum = sum + nums[j];
    while (sum >= target) {
      lenlength = j - i + 1;
      result = Math.min(result, lenlength);
      sum = sum - nums[i];
      i++;
    }
  }
  return result > nums.length ? 0 : result;
};
```

## 1. 编辑距离 \*\*

```js
// 问题1：如果 word1[0..i-1] 到 word2[0..j-1] 的变换需要消耗 k 步，那 word1[0..i] 到 word2[0..j] 的变换需要几步呢？

// 答：先使用 k 步，把 word1[0..i-1] 变换到 word2[0..j-1]，消耗 k 步。再把 word1[i] 改成 word2[j]，就行了。如果 word1[i] == word2[j]，什么也不用做，一共消耗 k 步，否则需要修改，一共消耗 k + 1 步。

// 问题2：如果 word1[0..i-1] 到 word2[0..j] 的变换需要消耗 k 步，那 word1[0..i] 到 word2[0..j] 的变换需要消耗几步呢？

// 答：先经过 k 步，把 word1[0..i-1] 变换到 word2[0..j]，消耗掉 k 步，再把 word1[i] 删除，这样，word1[0..i] 就完全变成了 word2[0..j] 了。一共 k + 1 步。

// 问题3：如果 word1[0..i] 到 word2[0..j-1] 的变换需要消耗 k 步，那 word1[0..i] 到 word2[0..j] 的变换需要消耗几步呢？

// 答：先经过 k 步，把 word1[0..i] 变换成 word2[0..j-1]，消耗掉 k 步，接下来，再插入一个字符 word2[j], word1[0..i] 就完全变成了 word2[0..j] 了。

// 从上面三个问题来看，word1[0..i] 变换成 word2[0..j] 主要有三种手段，用哪个消耗少，就用哪个。
var minDistance = function (word1, word2) {
  const len1 = word1.length,
    len2 = word2.length;
  const dp = new Array(len1 + 1);
  for (let i = 0; i < len1 + 1; i++) {
    dp[i] = new Array(len2 + 1).fill(0);
    dp[i][0] = i;
  }
  for (let j = 0; j < len2 + 1; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i < len1 + 1; i++) {
    for (let j = 1; j < len2 + 1; j++) {
      if (word2[j - 1] == word1[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j - 1], // 替换
            dp[i - 1][j], // 删除
            dp[i][j - 1] // 增加
          );
      }
    }
  }
  return dp[len1][len2];
};
```

## 爬楼梯

```js
var climbStairs = function (n) {
  const dp = [1, 2];
  for (let i = 2; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n - 1];
};
```

## 使用最小花费爬楼梯

https://leetcode.cn/problems/min-cost-climbing-stairs/solution/tong-ge-lai-shua-ti-la-yi-bu-dao-wei-xie-ef9r/

```js
var minCostClimbingStairs = function (cost) {
  let res = [0, 0];
  for (let i = 2; i <= cost.length; i++) {
    res[i] = Math.min(res[i - 1] + cost[i - 1], res[i - 2] + cost[i - 2]);
  }
  return res[cost.length];
};
```

## 洗牌算法

```js
function shuffle(arr = []) {
  //随机抽出数组里面的一个元素与最后一个元素换位置，直到排序完成（每次数组长度减一，到数组长度为空截止）
  for (let i = arr.length - 1; i >= 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let t = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = t;
  }
}
```

## 简化路径

栈

```js
var simplifyPath = function (path) {
  let arr = path.split("/"); // 将字符串分割为数组，并过滤掉空格
  let stack = []; // 用数组模拟栈
  for (let c of arr) {
    if (c === "." || c === "") continue;
    else if (c === "..") stack.pop();
    else stack.push(c);
  }
  return `/${stack.join("/")}`;
};
```

## 下一个更大元素 I \*\*

```js
var nextGreaterElement = function (nums1, nums2) {
  const map = new Map();
  const stack = [];
  for (let i = nums2.length - 1; i >= 0; i--) {
    const num = nums2[i];
    while (stack.length && num >= stack[stack.length - 1]) {
      stack.pop();
    }
    map.set(num, stack.length ? stack[stack.length - 1] : -1);
    stack.push(num);
  }

  const res = nums1.map((item) => map.get(item));
  return res;
};
```

## 打开转盘锁

bfs

```js
function plusOne(s, j) {
  let arr = s.split("");
  if (arr[j] === "9") {
    arr[j] = "0";
  } else {
    arr[j]++;
  }
  return arr.join("");
}
// 将 s[i] 向下拨动一次
function minusOne(s, j) {
  let arr = s.split("");
  if (arr[j] === "0") {
    arr[j] = "9";
  } else {
    arr[j]--;
  }
  return arr.join("");
}

var openLock = function (deadends, target) {
  // 记录需要跳过的死亡密码
  let deads = new Set([...deadends]);
  console.log(deads);
  // 记录已经穷举过的密码，防止走回头路
  let visited = new Set();
  let queue = [];
  // 从起点开始启动广度优先搜索
  let step = 0;
  queue.push("0000");
  visited.add("0000");

  while (queue.length > 0) {
    /* 将当前队列中的所有节点向周围扩散 */
    let size = queue.length;
    for (let i = 0; i < size; i++) {
      let cur = queue.shift();
      /* 判断是否到达终点 */
      if (deads.has(cur)) continue;
      if (cur === target) {
        return step;
      }

      /* 将一个节点的未遍历相邻节点加入队列 */
      for (let j = 0; j < 4; j++) {
        let up = plusOne(cur, j);
        if (!visited.has(up)) {
          queue.push(up);
          visited.add(up);
        }
        let down = minusOne(cur, j);
        if (!visited.has(down)) {
          queue.push(down);
          visited.add(down);
        }
      }
    }
    step++;
  }
  // 如果穷举完都没找到目标密码，那就是找不到了
  return -1;
};
```

## 最长公共子序列 \*\*

https://leetcode.cn/problems/longest-common-subsequence/solution/zui-chang-gong-gong-zi-xu-lie-tu-jie-dpz-6mvz/
动态规划

```js
var longestCommonSubsequence = function (text1, text2) {
  const m = text1.length,
    n = text2.length;
  const dp = new Array(m + 1).fill(1).map(() => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
};
```

## 516. 最长回文子序列

动态规划

```js
var longestPalindromeSubseq = function (s) {
  const n = s.length;
  //dp[i][j]：字符串s在[i, j]范围内最长的回文子序列的长度为dp[i][j]*
  const dp = new Array(n).fill(0).map(() => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    const c1 = s[i];
    for (let j = i + 1; j < n; j++) {
      const c2 = s[j];
      if (c1 === c2) {
        //如果s[i]与s[j]相同，那么dp[i][j] = dp[i + 1][j - 1] + 2;
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        //如果s[i]与s[j]不相同，说明s[i]和s[j]的同时加入 并不能增加[i,j]区间回文子串的长度，那么分别加入s[i]、s[j]看看哪一个可以组成最长的回文子序列
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[0][n - 1];
};
```

### 1312. 让字符串成为回文串的最少插入次数

换个角度想:当前字符串要变成回文,那只要把不一样的找出来就好了.即:求出反过来的字符串和当前字符串的最长公共子序列,然后减一下.

```js
var minInsertions = function (s) {
  return s.length - longestPalindrome(s);
};
function longestPalindrome(s) {
  const n = s.length;
  //dp[i][j]：字符串s在[i, j]范围内最长的回文子序列的长度为dp[i][j]*
  const dp = new Array(n).fill(0).map(() => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    const c1 = s[i];
    for (let j = i + 1; j < n; j++) {
      const c2 = s[j];
      if (c1 === c2) {
        //如果s[i]与s[j]相同，那么dp[i][j] = dp[i + 1][j - 1] + 2;
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        //如果s[i]与s[j]不相同，说明s[i]和s[j]的同时加入 并不能增加[i,j]区间回文子串的长度，那么分别加入s[i]、s[j]看看哪一个可以组成最长的回文子序列
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[0][n - 1];
}
```

## 和为 K 的子数组 \*\*

每个元素对应一个“前缀和”
遍历数组，根据当前“前缀和”，在 map 中寻找「与之相减 == k」的历史前缀和
当前“前缀和”与历史前缀和，差分出一个子数组，该历史前缀和出现过 c 次，就表示当前项找到 c 个子数组求和等于 k。
遍历过程中，c 不断加给 count，最后返回 count

```js
function subarraySum(nums, k) {
  const map = { 0: 1 };
  let preSum = 0;
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    preSum += nums[i];
    if (map[preSum - k]) {
      count += map[preSum - k];
    }
    if (map[preSum]) {
      map[preSum]++;
    } else {
      map[preSum] = 1;
    }
  }
  return count;
}
```

## 525. 连续数组

```js
var findMaxLength = function (nums) {
  let maxLength = 0;
  const map = new Map();
  let counter = 0;
  map.set(counter, -1);
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    const num = nums[i];
    if (num == 1) {
      counter++;
    } else {
      counter--;
    }
    if (map.has(counter)) {
      const prevIndex = map.get(counter);
      maxLength = Math.max(maxLength, i - prevIndex);
    } else {
      map.set(counter, i);
    }
  }
  return maxLength;
};
```

## 整数反转

```js
var reverse = function (x) {
  let rev = 0;
  while (x !== 0) {
    const digit = x % 10;
    x = ~~(x / 10);
    rev = rev * 10 + digit;
    if (rev < Math.pow(-2, 31) || rev > Math.pow(2, 31) - 1) {
      return 0;
    }
  }
  return rev;
};
```

## 1. 两数之和

```js
var twoSum = function (nums, target) {
  const targetMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const item = nums[i];
    const val = target - item;
    if (targetMap.has(val)) {
      return [map.get(val), i];
    } else {
      targetMap.set(item, i);
    }
  }
};
```

## 2.两数相加 \*\*

https://leetcode.cn/problems/add-two-numbers/

```js
var addTwoNumbers = function (l1, l2) {
  const root = new ListNode(0);
  let current = root;
  let carry = 0;
  while (l1 || l2 || carry) {
    let a = l1 ? l1.val : 0;
    let b = l2 ? l2.val : 0;
    let sum = a + b + carry;
    carry = Math.floor(sum / 10);
    let node = new ListNode(sum % 10);
    current.next = node;
    current = node;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return root.next;
};
```

## 445. 两数相加 II

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  const stack1 = [],
    stack2 = [];
  let p1 = l1,
    p2 = l2;
  while (p1) {
    stack1.push(p1.val);
    p1 = p1.next;
  }
  while (p2) {
    stack2.push(p2.val);
    p2 = p2.next;
  }

  let carry = 0;
  let ans = null;
  while (stack1.length > 0 || stack2.length > 0 || carry > 0) {
    let a = stack1.length ? stack1.pop() : 0;
    let b = stack2.length ? stack2.pop() : 0;

    let sum = a + b + carry;
    const node = new ListNode(sum % 10);
    carry = Math.floor(sum / 10);
    node.next = ans;
    ans = node;
  }
  return ans;
};
```

## 3. 无重复字符的最长子串 \*\*

滑动窗口

```js
var lengthOfLongestSubstring = function (s) {
  const set = new Set();
  let j = 0,
    maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    if (!set.has(c)) {
      set.add(c);
      maxLen = Math.max(set.size, maxLen);
    } else {
      while (set.has(c)) {
        set.delete(s[j++]);
      }
      set.add(c);
    }
  }
  return maxLen;
};
```

## 4. 反转链表 \*\*

https://leetcode.cn/problems/reverse-linked-list/

```js
var reverseList = function (head) {
  let cur = head,
    pre = null;
  while (cur) {
    let temp = cur.next;
    cur.next = pre;
    pre = cur;
    cur = temp;
  }
  return pre;
};
```

## 5. 有效的括号 \*\*

https://leetcode.cn/problems/valid-parentheses/

```js
var isValid = function (s) {
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    let current = s[i];
    if ("([{".indexOf(current) >= 0) {
      stack.push(current);
    } else if (isPair(stack[stack.length - 1], current)) {
      stack.pop();
    } else {
      return false;
    }
  }
  return !stack.length;
};

function isPair(a, b) {
  return (
    (a === "(" && b === ")") ||
    (a === "[" && b === "]") ||
    (a === "{" && b === "}")
  );
}
```

## 6. 删除链表的倒数第 N 个结点 \*\*

https://leetcode.cn/problems/remove-nth-node-from-end-of-list/solution/dong-hua-tu-jie-leetcode-di-19-hao-wen-ti-shan-chu/

```js
var removeNthFromEnd = function (head, n) {
  const dummyHead = new ListNode();
  dummyHead.next = head;
  let p = dummyHead,
    q = dummyHead;
  let i = 0;
  while (i++ < n) {
    if (q.next) {
      q = q.next;
    } else {
      return hdummyHead.next;
    }
  }
  while (q.next) {
    q = q.next;
    p = p.next;
  }
  p.next = p.next.next;
  return dummyHead.next;
};
```

## 7. 最大子数组和 \*\*

```js
var maxSubArray = function (nums) {
  let sum = 0,
    res = nums[0];
  for (let i = 0; i < nums.length; i++) {
    if (sum >= 0) {
      sum += nums[i];
    } else {
      sum = nums[i];
    }
    res = Math.max(res, sum);
  }
  return res;
};
```

## 8. 合并有序链表

```js
// 递归
function mergeTwoLists(L1, L2) {
  if (l1 == null) {
    return l2;
  } else if (l2 == null) {
    return l1;
  } else if (l1.val < l2.val) {
    l1.next = mergeTwoLists(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeTwoLists(l1, l2.next);
    return l2;
  }
}
// 迭代
function mergeTwoLists(l1, l2) {
  const dummyHead = new ListNode(-1);

  let prev = dummyHead;
  while (l1 != null && l2 != null) {
    if (l1.val <= l2.val) {
      prev.next = l1;
      l1 = l1.next;
    } else {
      prev.next = l2;
      l2 = l2.next;
    }
    prev = prev.next;
  }

  // 合并后 l1 和 l2 最多只有一个还未被合并完，我们直接将链表末尾指向未合并完的链表即可
  prev.next = l1 === null ? l2 : l1;

  return dummyHead.next;
}
```

## 9. 在排序数组中查找元素的第一个和最后一个位置 \*\*

```js
// 二分法
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function searchRange(nums, target) {
  let len = nums.length;
  if (len == 0) {
    return [-1, -1];
  }

  let firstPos = findFirstPosition(nums, target);
  if (firstPos == -1) {
    return [-1, -1];
  }

  let lastPos = findLastPosition(nums, target);
  return [firstPos, lastPos];

  function findFirstPosition(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left < right) {
      // 取左中位数
      let mid = left + Math.floor((right - left) / 2);
      // 小于一定不是解
      if (nums[mid] < target) {
        // 下一轮搜索区间是 [mid + 1, right]
        left = mid + 1;
      } else if (nums[mid] == target) {
        // 下一轮搜索区间是 [left, mid]
        right = mid;
      } else {
        // nums[mid] > target，下一轮搜索区间是 [left, mid - 1]
        right = mid - 1;
      }
    }

    if (nums[left] == target) {
      return left;
    }
    return -1;
  }

  function findLastPosition(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left < right) {
      // 取右中位数
      let mid = left + Math.ceil((right - left) / 2);
      if (nums[mid] > target) {
        // 下一轮搜索区间是 [left, mid - 1]
        right = mid - 1;
      } else if (nums[mid] == target) {
        // 下一轮搜索区间是 [mid, right]
        left = mid;
      } else {
        // nums[mid] < target，下一轮搜索区间是 [mid + 1, right]
        left = mid + 1;
      }
    }
    return left;
  }
}
```

## 用最少数量的箭引爆气球

排序，贪心算法

```js
function findMinArrowShots(points) {
  points.sort((a, b) => {
    return a[1] - b[1];
  });
  let max = points[0][1]; //初始化箭值
  let count = 1; //初始化箭数
  for (let i = 1; i < points.length; i++) {
    if (max >= points[i][0]) {
      //当前气球能射
      continue;
    }
    count++; //射不到了，换箭
    max = points[i][1]; //更新箭值
  }
  return count;
}

function findMinArrowShots(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let right = intervals[0][1];
  let count = 1;
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] > right) {
      //不重叠,换箭
      count++;
      right = intervals[i][1];
    }
  }
  return count;
}
```

## 435. 无重叠区间

排序算法 贪心算法
https://leetcode.cn/problems/non-overlapping-intervals/solution/tan-xin-jie-fa-qi-shi-jiu-shi-yi-ceng-ch-i63h/

```js
function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let right = intervals[0][1];
  let count = 1;
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] >= right) {
      //不重叠
      count++;
      right = intervals[i][1];
    }
  }
  return intervals.length - count;
}
```

## 判断子序列

```js
var isSubsequence = function (s, t) {
  let p1 = 0,
    p2 = 0;
  while (p1 < s.length && p2 < t.length) {
    if (s[p1] == t[p2]) {
      p1++;
      p2++;
    } else {
      p2++;
    }
  }
  if (p1 < s.length) return false;
  return true;
};
```

## 10. 寻找两个正序数组的中位数

## 11. 爬楼梯

```js
var climbStairs = function (n) {
  const dp = [1, 2];
  for (let i = 2; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n - 1];
};
```

## 12. 移动零\*\*

```js
var moveZeroes = function (nums) {
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      const temp = nums[i];
      nums[i] = nums[j];
      nums[j++] = temp;
    }
  }
};

/*1、定义两个指针i和k，初始化i = 0，k = 0。
2、i指针向后移动，遍整个nums数组，如果 nums[i] != 0，也就是说遇到了非0元素，此时我们就将nums[i]元素放置到nums[k]位置，同时k++后一位。
3、最后将k位置之后的元素都赋值为0。*/
var moveZeroes = function (nums) {
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[j++] = nums[i];
    }
  }
  while (j < nums.length) {
    num[j++] = 0;
  }
};
```

## 13. 买卖股票的最佳时机 \*\*

```js
/**
 * @param {number[]} prices
 * @return {number}
 */
// 动态规划
var maxProfit = function (prices) {
  const dp = new Array(prices.length); // 前 n 天的最大利润
  dp[0] = 0;
  let minPrice = prices[0];
  for (let i = 1; i < prices.length; i++) {
    minPrice = Math.min(minPrice, prices[i]); //
    dp[i] = Math.max(dp[i - 1], prices[i] - minPrice); // 在最低点买入
  }
  return dp[prices.length - 1];
};
```

## 买卖股票的最佳时机 2 \*\*

1. 动态规划

```js
function maxProfit(prices) {
  const len = prices.length;
  const dp = new Array(len).fill(1).map((item) => new Array(2));
  dp[0][0] = 0; // 不持有
  dp[0][1] = -prices[0]; // 持有

  for (let i = 1; i < len; i++) {
    dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] + prices[i]);
    dp[i][1] = Math.max(dp[i - 1][0] - prices[1], dp[i - 1][1]);
  }
  return dp[len - 1][0];
}
```

2. 空间优化，只维持前一天两种状态值

```js
const len = prices.length;
let noHold = 0;
let hold = -prices[0];
for (let i = 1; i < len; i++) {
  noHold = Math.max(noHold, hold + prices[i]);
  hold = Math.max(noHold - prices[i], hold);
}
return noHold;
```

## 14. 三数之和 \*\*

排序 + 双指针 + 去重

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  const res = [];
  if (nums.length < 3) return res;
  nums.sort((a, b) => (a > b ? 1 : -1));
  const len = nums.length;
  for (let i = 0; i < len; i++) {
    if (nums[i] > 0) break; // 如果当前数字大于0，则三数之和一定大于0，所以结束循环
    if (i > 0 && nums[i] === nums[i - 1]) continue; // 去重
    let L = i + 1;
    let R = len - 1;
    while (L < R) {
      const sum = nums[i] + nums[L] + nums[R];
      if (sum === 0) {
        res.push([nums[i], nums[L], nums[R]]);
        while (L < R && nums[L] === nums[L + 1]) L++; // 去重
        while (L < R && nums[R] === nums[R - 1]) R--; // 去重
        L++;
        R--;
      } else if (sum < 0) {
        L++;
      } else {
        R--;
      }
    }
  }
  return res;
};
```

## 最接近的三数之和

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums, target) {
  nums.sort((a, b) => a - b);
  let sum = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1,
      r = nums.length - 1;
    while (l < r) {
      const curSum = nums[l] + nums[i] + nums[r];
      if (Math.abs(curSum - target) < Math.abs(sum - target)) {
        sum = curSum;
      }
      if (curSum > target) {
        r--;
      } else if (curSum < target) {
        l++;
      } else {
        return target;
      }
    }
  }
  return sum;
};
```

## 15. 全排列

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const res = [];
  if (nums.length <= 1) return [nums];
  for (let i = 0; i < nums.length; i++) {
    permute(nums.slice(0, i).concat(nums.slice(i + 1))).forEach((item) =>
      res.push([nums[i], ...item])
    );
  }
  return res;
};
```

## 47. 全排列 II

```js
var permuteUnique = function (nums) {
  const res = [];
  if (nums.length <= 1) return [nums];
  for (let i = 0; i < nums.length; i++) {
    if (nums.indexOf(nums[i]) === i) {
      permuteUnique(nums.slice(0, i).concat(nums.slice(i + 1))).forEach(
        (item) => res.push([nums[i], ...item])
      );
    }
  }
  return res;
};
```

## 16. 电话号码的字母组合 \*\*

```js
var letterCombinations = function (digits) {
  const res = [];
  if (!digits || !digits.length) return [];
  const maps = [
    "",
    "*",
    "abc",
    "def",
    "ghi",
    "jkl",
    "mno",
    "pqrs",
    "tuv",
    "wxyz",
  ];
  iterStr(digits, "", 0);
  return res;
  function iterStr(digits, letter, index) {
    if (index === digits.length) return res.push(letter);
    const c = digits[index];
    const list = maps[c];
    for (let i = 0; i < list.length; i++) {
      iterStr(digits, letter + list[i], index + 1);
    }
  }
};
```

## 17. 盛最多水的容器

双指针 循环

```js
var maxArea = function (height) {
  let i = 0,
    j = height.length - 1;
  let res = 0;
  while (i < j) {
    if (height[i] < height[j]) {
      res = Math.max(res, (j - i) * height[i]);
      i++;
    } else {
      res = Math.max(res, (j - i) * height[j]);
      j--;
    }
  }
  return res;
};
```

## 18. 环形链表

快慢指针

```js
var hasCycle = function (head) {
  if (head == null || head.next == null) return false;
  let slower = head,
    faster = head;
  while (faster != null && faster.next != null) {
    slower = slower.next;
    faster = faster.next.next;
    if (slower === faster) return true;
  }
  return false;
};
```

## 19. 打家劫舍 \*\*

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
  const len = nums.length;
  if (len == 0) return 0;
  const dp = []; // 记录前i个房子能偷到的最高金额
  dp[0] = 0;
  dp[1] = nums[0];
  for (let i = 2; i <= len; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
  }
  return dp[len];
};
```

## 打家劫舍 II

1. 偷第一个，不偷最后一个
2. 不偷第一个，偷最后一个

```javascript
var rob = function (nums) {
  const length = nums.length;
  if (length === 1) {
    return nums[0];
  } else if (length === 2) {
    return Math.max(nums[0], nums[1]);
  }
  return Math.max(robRange(nums, 0, length - 2), robRange(nums, 1, length - 1));
};

const robRange = (nums, start, end) => {
  let pre = nums[start],
    cur = Math.max(nums[start], nums[start + 1]);
  for (let i = start + 2; i <= end; i++) {
    const temp = cur;
    cur = Math.max(pre + nums[i], cur);
    pre = temp;
  }
  return second;
};
```

## 打家劫舍 3

```js
var rob = function (root) {
  const sumMap = new WeakMap();
  function traverse(node) {
    if (!node) return 0;
    if (sumMap.has(node)) return sumMap.get(node);
    let treasure1 = node.val;
    if (node.left)
      treasure1 += traverse(node.left.left) + traverse(node.left.right);
    if (node.right)
      treasure1 += traverse(node.right.left) + traverse(node.right.right);
    let treasure2 = traverse(node.left) + traverse(node.right);
    sumMap.set(node, Math.max(treasure2, treasure1));
    return sumMap.get(node);
  }
  return traverse(root);
};
```

## 20. 跳跃游戏

贪心算法

```js
function canJump(nums) {
  let k = 0; // 能跳到的最远距离
  for (let i = 0; i < nums.length; i++) {
    if (k < i) return false;
    k = Math.max(k, i + nums[i]);
  }
  return true;
}
```

## 跳跃游戏 2

贪婪算法，我们每次在可跳范围内选择可以使得跳的更远的位置。

```js
function jump(nums) {
  //end 以当前跳跃步数，能到的最远位置，
  let end = 0,
    maxPos = 0,
    step = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    maxPos = Math.max(maxPos, nums[i] + i);
    if (i == end) {
      //已经走到了当前跳跃步数的边界，
      step++; //并记录当前跳跃步数能到的最远位置
      end = maxPos; //我们不得不再跳一次
    }
  }
  return step;
}
```

## 21. 括号生成\*\*

深度优先搜索算法

```js
/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function (n) {
  const res = [];
  if (!n) return res;
  DFS("", n, n, res);
  return res;
};

/**
 * @param str 当前递归得到的结果
 * @param left   左括号已经用了几个
 * @param right  右括号已经用了几个
 * @param n      左括号、右括号一共得用几个
 * @param res    结果集
 */

//  当前左右括号都有大于 0 个可以使用的时候，才产生分支；
//  产生左分支的时候，只看当前是否还有左括号可以使用；
//  产生右分支的时候，还受到左分支的限制，右边剩余可以使用的括号数量一定得在严格大于左边剩余的数量的时候，才可以产生分支；
//  在左边和右边剩余的括号数都等于 0 的时候结算。

function DFS(str, left, right, res) {
  if (!left && !right) {
    res.push(str);
  }
  if (left > right) return; // 左括号大于右括号剩余数量，
  if (left > 0) DFS(str + "(", left - 1, right, res);
  if (right > 0) DFS(str + ")", left, right - 1, res);
}
```

// 前序位置的代码执行是自顶向下的，而后序位置的代码执行是自底向上的

## 22. 二叉树的最大深度

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function (root) {
  // function dfs(node, depth) {
  //   if (!node) return depth;
  //   depth = depth + 1;
  //   return Math.max(dfs(node.left, depth), dfs(node.right, depth));
  // }
  function dfs(node) {
    if (!node) return 0;
    return 1 + Math.max(dfs(node.left), dfs(node.right));
  }
  return dfs(root, 0);
};
```

## 二叉树的最小深度

dfs

```js
var minDepth = function (root) {
  if (!root) return 0;
  if (!root.left && root.right) {
    return 1 + minDepth(root.right);
  }
  if (!root.right && root.left) {
    return 1 + minDepth(root.left);
  }

  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
};
```

bfs

```java
int minDepth(TreeNode root) {
    if (root == null) return 0;
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    // root 本身就是一层，depth 初始化为 1
    int depth = 1;

    while (!q.isEmpty()) {
        int sz = q.size();
        /* 将当前队列中的所有节点向四周扩散 */
        for (int i = 0; i < sz; i++) {
            TreeNode cur = q.poll();
            /* 判断是否到达终点 */
            if (cur.left == null && cur.right == null)
                return depth;
            /* 将 cur 的相邻节点加入队列 */
            if (cur.left != null)
                q.offer(cur.left);
            if (cur.right != null)
                q.offer(cur.right);
        }
        /* 这里增加步数 */
        depth++;
    }
    return depth;
}

```

## 23. 搜索旋转排序数组 \*\*

双指针

```js
var search = function (nums, target) {
  let left = 0,
    right = nums.length - 1;
  while (nums[left] < target) {
    left++;
  }
  if (nums[left] === target) return left;
  while (nums[right] > target) {
    right--;
  }
  if (nums[right] === target) return right;
  return -1;
};
```

## 24. 二叉树层序遍历

```js
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    if(!root) return []
    let queue = []
    let res = [];
    queue.push(root)
    while(queue.length) {
        let list = []
        let n = queue.length;
        while(n--) {
            let node = queue.shift();
            list.push(node.val)
            if(node.left) queue.push(node.left)
            if(node.right) queue.push(node.right)
        }
        res.push(list)
    }
    return res
};
```

## 二叉树的锯齿形层序遍历

```js
var zigzagLevelOrder = function (root) {
  if (!root) return [];
  let queue = [];
  let res = [];
  queue.push(root);
  let flag = true;
  while (queue.length) {
    let list = [];
    let n = queue.length;
    while (n--) {
      let node = queue.shift();
      if (flag) {
        list.push(node.val);
      } else {
        list.unshift(node.val);
      }
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(list);
    flag = !flag;
  }
  return res;
};
```

## 25. 子集

https://leetcode.cn/problems/subsets/solution/c-zong-jie-liao-hui-su-wen-ti-lei-xing-dai-ni-gao-/
回溯法

```js
var subsets = function (nums) {
  const res = [];
  backtrack(nums, 0, []);
  return res;
  function backtrack(nums, start, path) {
    res.push(path);
    for (let i = start; i < nums.length; i++) {
      backtrack(nums, i + 1, [...path, nums[i]]);
    }
  }
};
```

## 26. 接雨水 \*\*

单调栈

```js
/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function (height) {
  let sum = 0;
  const stack = [];
  let index = 0;
  while (index < height.length) {
    //如果栈不空并且当前指向的高度大于栈顶高度就一直循环
    while (stack.length && height[index] > height[stack[stack.length - 1]]) {
      const h = height[stack[stack.length - 1]]; // 取出要出栈的元素
      stack.pop(); // 出栈
      if (!stack.length) {
        // 栈空就出去
        break;
      }
      // 两堵墙之前的距离。
      const distance = index - stack[stack.length - 1] - 1;
      const min = Math.min(height[stack[stack.length - 1]], height[index]);
      sum = sum + distance * (min - h);
    }
    stack.push(index); // 当前指向的墙入栈
    index++; //指针后移
  }
  return sum;
};
```

## 27. 最长递增子序列 \*\*

```js
/**
 * @param {number[]} nums
 * @return {number}
 * 动态规划+二分查找
 */
function lengthOfLIS(nums = []) {
  const len = nums.length;
  if (len <= 1) {
    return len;
  }

  // tail 数组的定义：长度为 i + 1 的上升子序列的末尾最小是几
  const tail = [];
  // 遍历第 1 个数，直接放在有序数组 tail 的开头
  tail[0] = nums[0];

  const dp = []; // dp[i]表示以arr[i]结尾的最长递增子序列长度
  // end 表示有序数组 tail 的最后一个已经赋值元素的索引
  for (let i = 1; i < len; i++) {
    const end = tail.length - 1;
    // 【逻辑 1】比 tail 数组实际有效的末尾的那个元素还大
    if (nums[i] > tail[end]) {
      // 直接添加在那个元素的后面，所以 end 先加 1
      tail.push(nums[i]);
    } else {
      // 使用二分查找法，在有序数组 tail 中找到第 1 个大于等于 nums[i] 的元素，尝试让那个元素更小
      let left = 0;
      let right = end;
      while (left < right) {
        // 选左中位数不是偶然，而是有原因的，原因请见 LeetCode 第 35 题题解
        // int mid = left + (right - left) / 2;
        let mid = Math.floor((right + left) / 2);
        if (tail[mid] < nums[i]) {
          // 中位数肯定不是要找的数，把它写在分支的前面
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      dp[i] = left;
      // 走到这里是因为 【逻辑 1】 的反面，因此一定能找到第 1 个大于等于 nums[i] 的元素
      // 因此，无需再单独判断
      tail[left] = nums[i];
    }
  }
  /*
对于第二步，假设我们原始数组是arr1，得到的maxLen为[1,2,3,1,3]，最终输出结果为res（字典序最小的最长递增子序列），res的最后一个元素在arr1中位置无庸置疑是maxLen[i]==3对应的下标，那么到底是arr1[2]还是arr1[4]呢？如果是arr1[2]，那么arr1[2]<arr1[4]，则maxLen[4]==4，与已知条件相悖。因此我们应该取arr1[4]放在res的最后一个位置。
*/
  const res = [];
  let len = tail.length;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (dp[i] == len) {
      res[len - 1] = arr[i];
      len--;
    }
  }
  return res;

  return tail.length;
}
```

## 俄罗斯套娃 排序+LIS

```js
var maxEnvelopes = function (envelopes) {
  envelopes.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0]; //宽度从小到大
    else return b[1] - a[1]; //宽度相同，高度从大到小
  });
  const heights = envelopes.map((item) => item[1]);
  const count = lengthOfLIS(heights);
  return count;
};

function lengthOfLIS(nums) {
  const len = nums.length;
  if (len < 2) return nums.length;
  const tail = [];
  tail[0] = nums[0];
  for (let i = 1; i < len; i++) {
    const end = tails.length - 1;
    if (nums[i] > tail[end]) {
      tail.push(nums[i]);
    } else {
      let left = 0,
        right = end;
      while (left < right) {
        let mid = Math.floor((right + left) / 2);
        if (tail[mid] < nums[i]) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      tail[left] = nums[i];
    }
  }
  return tail.length;
}
```

## 28. 二叉树的中序遍历 （迭代）\*\*

```js
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function (root) {
  let current = root;
  let result = [];
  let stack = [];
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    result.push(current.val);
    current = current.right;
  }
  return result;
};
```

先序遍历

```js
var preorderTraversal = function (root) {
  let current = root;
  let result = [];
  let stack = [];
  while (current || stack.length) {
    if (current) {
      result.push(current.val);
      stack.push(current);
      current = current.left;
    } else {
      current = stack.pop();
      current = current.right;
    }
  }
  return result;
};
```

## 二叉搜索树中第 K 小的元素

```js
var kthSmallest = function (root, k) {
  const stack = [];
  while (root != null || stack.length) {
    while (root != null) {
      stack.push(root);
      root = root.left;
    }
    root = stack.pop();
    --k;
    if (k === 0) {
      break;
    }
    root = root.right;
  }
  return root.val;
};
```

## 62. 不同路径 \*\*

```js
/**
 *
 * @param {number} m
 * @param {number} n
 * @returns {number}
 * 思路二 优化一：由于dp[i][j] = dp[i-1][j] + dp[i][j-1]，因此只需要保留当前行与上一行的数据 (在动态方程中，即pre[j] = dp[i-1][j])，两行，空间复杂度O(2n)； 优化二：cur[j] += cur[j-1], 即cur[j] = cur[j] + cur[j-1] 等价于思路二-->> cur[j] = pre[j] + cur[j-1]，因此空间复杂度为O(n).
 */
// 优化一 O(2n)
var uniquePaths1 = function (m, n) {
  let prev = new Array(n).fill(1); // 上一行的结果
  let cur = new Array(n).fill(1); // 当前行的结果
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      cur[j] = prev[j] + cur[j - 1];
    }
    prev = [...cur];
  }
  return cur[n - 1];
};

// 优化2 O(n)
var uniquePaths = function (m, n) {
  let cur = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      cur[j] = cur[j] + cur[j - 1];
    }
  }
  return cur[n - 1];
};
```

## 63. 不同路径 II

```java
class Solution {
  public int uniquePathsWithObstacles(int[][] obstacleGrid) {
      int n = obstacleGrid.length;
      int m = obstacleGrid[0].length;
      int[][] dp = new int[n][m];
      //(0,0)这个格子可能有障碍物
      dp[0][0] = (obstacleGrid[0][0] == 1) ? 0 : 1;
      //处理第一列
      for(int i = 1; i < n; ++i) {
          if(obstacleGrid[i][0] == 1 || dp[i - 1][0] == 0) {
              dp[i][0] = 0;
          } else {
              dp[i][0] = 1;
          }
      }
      //处理第一行
      for(int j = 1; j < m; ++j) {
          if(obstacleGrid[0][j] == 1 || dp[0][j - 1] == 0) {
              dp[0][j] = 0;
          } else {
              dp[0][j] = 1;
          }
      }
      for(int i = 1; i < n; ++i) {
          for(int j = 1; j < m; ++j) {
               //如果当前格子是障碍物
              if(obstacleGrid[i][j] == 1) {
                  dp[i][j] = 0;
              //路径总数来自于上方(dp[i-1][j])和左方(dp[i][j-1])
              } else {
                  dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
              }
          }
      }
      return dp[n - 1][m - 1];
  }
}

```

## 56. 合并区间\*\*

```js
/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function (intervals) {
  intervals.sort((a, b) => {
    // 按照起点递增排序
    if (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])) {
      return -1;
    } else {
      return 1;
    }
  });
  const res = [];
  if (intervals.length < 2) {
    return intervals;
  }
  let prev = [...intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const arr = intervals[i];
    if (prev[1] >= arr[0]) {
      prev[1] = Math.max(prev[1], arr[1]);
    } else {
      res.push(prev);
      prev = [...arr];
    }
  }
  res.push(prev);
  return res;
};
```

## 101. 对称二叉树 \*\*

```js
var isSymmetric = function (root) {
  if (!root) return true;
  return dfs(root.left, root.right);
  function dfs(left, right) {
    if (!left && !right) {
      return true;
    }
    if (!left || !right || left.val !== right.val) return false;
    return dfs(left.left, right.right) && dfs(right.left, left.right);
  }
};
```

## 32. 旋转图像 \*\*

```js
/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var rotate = function (matrix) {
  const n = matrix.length;
  // x轴翻转
  for (let i = 0; i < n / 2; i++) {
    for (let j = 0; j < n; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[n - i - 1][j];
      matrix[n - i - 1][j] = temp;
    }
  }
  // 主对角线(左上-右下)翻转
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }
};
```

## 33. 数组中第 K 大的数 \*\*

堆排序

```js
/*
## 基本思想
对于大顶堆：arr[i] >= arr[2i + 1] && arr[i] >= arr[2i + 2] 
对于小顶堆：arr[i] <= arr[2i + 1] && arr[i] <= arr[2i + 2]
将待排序序列构造成一个大顶堆，此时整个序列的最大值是堆顶的根节点。将其与末尾元素进行交换，此时末尾就为最大值。然后将剩余n-1个元素重新构造成一个堆，这样会得到n个元素的次小值。如此反复执行，便能得到一个有序序列了

a.将无需序列构建成一个堆，根据升序降序需求选择大顶堆或小顶堆;

b.将堆顶元素与末尾元素交换，将最大元素"沉"到数组末端;

c.重新调整结构，使其满足堆定义，然后继续交换堆顶元素与当前末尾元素，反复执行调整+交换步骤，直到整个序列有序。
 */

// ###

function sort(arr, k) {
  // 1. 构造初始堆，升序大顶堆，降序小顶堆
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    //从第一个非叶子结点从下至上，从右至左调整结构
    adjustHeap(arr, i, k);
  }

  // 2. 调整堆结构 + 交换堆顶和末尾元素
  for (let i = k - 1; i > 0; i--) {
    swap(arr, 0, i);
    adjustHeap(arr, 0, i);
  }
  console.log(arr);
}

function adjustHeap(arr, i, length) {
  const temp = arr[i];
  for (let k = i * 2 + 1; k < length; k = k * 2 + 1) {
    //从i结点的左子结点开始，也就是2i+1处开始
    if (k + 1 < length && arr[k] > arr[k + 1]) {
      //如果左子结点小于右子结点，k指向右子结点
      k++;
    }
    if (arr[k] < temp) {
      //如果子节点大于父节点，将子节点值赋给父节点（不用进行交换）
      arr[i] = arr[k];
      i = k;
    } else {
      break;
    }
  }
  arr[i] = temp;
}

function swap(arr, a, b) {
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
```

## 34. 只出现一次的数字

异或 a^a^b = b

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum = sum ^ nums[i];
  }
  return sum;
};
```

## 35. 翻转二叉树 \*\*

```js
function invertTree(root) {
  if (!root) {
    return root;
  }
  let temp = root.right;
  root.right = root.left;
  root.left = temp;
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
```

## 36. 岛屿数量 \*\*

```js
/**
 * 思路：遍历岛这个二维数组，如果当前数为1，则进入感染函数并将岛个数+1
 感染函数：其实就是一个递归标注的过程，它会将所有相连的1都标注成2。为什么要标注？这样就避免了遍历过程中的重复计数的情况，一个岛所有的1都变成了2后，遍历的时候就不会重复遍历了
 */

function dfs(grid, r, c) {
  // 判断 base case
  if (!inArea(grid, r, c)) {
    return;
  }
  // 如果这个格子不是岛屿，直接返回
  if (grid[r][c] != 1) {
    return;
  }
  grid[r][c] = 2; // 将格子标记为「已遍历过」

  // 访问上、下、左、右四个相邻结点
  dfs(grid, r - 1, c);
  dfs(grid, r + 1, c);
  dfs(grid, r, c - 1);
  dfs(grid, r, c + 1);
}

// 判断坐标 (r, c) 是否在网格中
function inArea(grid, r, c) {
  return 0 <= r && r < grid.length && 0 <= c && c < grid[0].length;
}

/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
  let num = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; i++) {
      if (grid[i][j] === 1) {
        dfs(grid);
        num++;
      }
    }
  }
  return num;
};
```

## 岛屿的最大面积

```js
/**
 * @param {number[][]} grid
 * @return {number}
 */
var maxAreaOfIsland = function (grid) {
  let num = 0;
  let maxArea = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 1) {
        maxArea = Math.max(dfs(grid, i, j), maxArea);
      }
    }
  }
  return maxArea;
};

function dfs(grid, r, c) {
  // 判断 base case
  if (!inArea(grid, r, c)) {
    return 0;
  }
  // 如果这个格子不是岛屿，直接返回
  if (grid[r][c] != 1) {
    return 0;
  }
  grid[r][c] = 2; // 将格子标记为「已遍历过」

  // 访问上、下、左、右四个相邻结点
  const res =
    1 +
    dfs(grid, r - 1, c) +
    dfs(grid, r + 1, c) +
    dfs(grid, r, c - 1) +
    dfs(grid, r, c + 1);
  return res;
}

// 判断坐标 (r, c) 是否在网格中
function inArea(grid, r, c) {
  return 0 <= r && r < grid.length && 0 <= c && c < grid[0].length;
}
```

## 37. 组合总和 \*\*

```js
var combinationSum = function (candidates, target) {
  const len = candidates.length,
    res = [];
  dfs([], target, 0);
  return res;
  /**
   * @param start      搜索起点
   * @param target     每减去一个元素，目标值变小
   * @param path       从根结点到叶子结点的路径，是一个栈
   */
  function dfs(path, target, start) {
    if (target < 0) return;
    if (target === 0) return res.push(path);
    for (let i = start; i < len; i++) {
      dfs([...path, candidates[i]], target - candidates[i], i);
    }
  }
};
```

## 221. 最大正方形

```js
/**
 * @param {character[][]} matrix
 * @return {number}
 */
var maximalSquare = function (matrix) {
  const m = matrix.length,
    n = matrix[0].length;
  const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
  let maxSide = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === "1") {
        dp[i + 1][j + 1] = Math.min(dp[i + 1][j], dp[i][j + 1], dp[i][j]) + 1;
        maxSide = Math.max(maxSide, dp[i + 1][j + 1]);
      }
    }
  }
  return maxSide * maxSide;
};
```

## 40. 组合总和 II

去重

排序 + 回溯

```js
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function (candidates, target) {
  const len = candidates.length,
    res = [];
  candidates.sort((a, b) => {
    return a > b ? 1 : -1;
  });
  dfs([], target, 0);
  return res;
  /**
   * @param start      搜索起点
   * @param target     每减去一个元素，目标值变小
   * @param path       从根结点到叶子结点的路径，是一个栈
   */
  function dfs(path, target, start) {
    if (target < 0) return;
    if (target === 0) return res.push([...path]);
    for (let i = start; i < len; i++) {
      if (target - candidates[i] < 0) break;
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      path.push(candidates[i]);
      dfs(path, target - candidates[i], i + 1);
      path.pop();
    }
  }
};
```

## 38. 验证二叉搜索树 \*\*

二叉搜索树，中序遍历结果是升序的

```js
/**
 * 中序遍历时，判断当前节点是否大于中序遍历的前一个节点，如果大于，说明满足 BST，继续遍历；否则直接返回 false。
 * @param {TreeNode} root
 * @return {boolean}
 */
var isValidBST = function (root) {
  if (!root) return true;
  let prev = Number.MIN_SAFE_INTEGER;
  function dfs(node) {
    if (!node) return true;
    if (!dfs(node.left)) return false;
    // 访问当前节点：如果当前节点小于等于中序遍历的前一个节点，说明不满足BST，返回 false；否则继续遍历。
    if (node.val <= prev) return false;
    prev = node.val;
    return dfs(node.right);
  }
  return dfs(root);
};
```

## 39. 多数元素 \*\*

摩尔投票法
候选人(cand_num)初始化为 nums[0]，票数 count 初始化为 1。
当遇到与 cand_num 相同的数，则票数 count = count + 1，否则票数 count = count - 1。
当票数 count 为 0 时，更换候选人，并将票数 count 重置为 1。
遍历完数组后，cand_num 即为最终答案。

为何这行得通呢？
投票法是遇到相同的则票数 + 1，遇到不同的则票数 - 1。
且“多数元素”的个数> ⌊ n/2 ⌋，其余元素的个数总和<= ⌊ n/2 ⌋。
因此“多数元素”的个数 - 其余元素的个数总和 的结果肯定 >= 1。
这就相当于每个“多数元素”和其他元素 两两相互抵消，抵消到最后肯定还剩余至少 1 个“多数元素”。

```js
var majorityElement = function (nums) {
  let major = nums[0],
    count = 1;
  for (let i = 1; i < nums.length; i++) {
    if (count === 0) {
      major = nums[i];
      count = 1;
    } else if (nums[i] == major) {
      count++;
    } else {
      count--;
    }
  }
  return major;
};
```

## 160. 相交链表 \*\*

如果两个链表相交，那么相交点之后的长度是相同的
link1 : a+c
link2 : b+c
a+c+b === b+c+a
指针 pA 指向 A 链表，指针 pB 指向 B 链表，依次往后遍历
如果 pA 到了末尾，则 pA = headB 继续遍历
如果 pB 到了末尾，则 pB = headA 继续遍历

如果长度相同，且没有交点，在循环到第一轮末尾时，pA 和 pB 会同时为 null，这时就相等退出了
如果长度不同，没有交点，会在第二轮末尾同时为 null，相等退出。

```js
function getIntersectionNode(headA, headB) {
  if (headA == null || headB == null) return null;
  let pA = headA,
    pB = headB;
  while (pA != pB) {
    pA = pA == null ? headB : pA.next;
    pB = pB == null ? headA : pB.next;
  }
  return pA;
}
```

## 41. 零钱兑换 \*\*

记忆化搜索

```js
var coinChange = function (coins, amount) {
  const memo = []; // memo[n] 表示钱币 n 可以被换取的最少的硬币数，不能换取就为 -1
  if (coins.length === 0) {
    return -1;
  }
  return findWay(coins, amount);

  function findWay(coins, amount) {
    if (amount < 0) return -1;
    if (amount === 0) return 0;
    if (memo[amount]) {
      return memo[amount];
    }
    let min = Number.MAX_VALUE;
    for (let i = 0; i < coins.length; i++) {
      const res = findWay(coins, amount - coins[i]);
      if (res >= 0 && res < min) {
        min = res + 1;
      }
    }
    memo[amount] = min === Number.MAX_VALUE ? -1 : min;
    return memo[amount];
  }
};
```

## 718. 最长重复子数组

```js
const findLength = (A, B) => {
  const m = A.length;
  const n = B.length;
  const dp = new Array(m + 1); // 以 i，j结尾的公共子数组的长度
  for (let i = 0; i <= m; i++) {
    // 初始化整个dp矩阵，每个值为0
    dp[i] = new Array(n + 1).fill(0);
  }
  let res = 0;

  // i=0或j=0的base case，初始化时已经包括
  for (let i = 1; i <= m; i++) {
    // 从1开始遍历
    for (let j = 1; j <= n; j++) {
      // 从1开始遍历
      if (A[i - 1] == B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } // A[i-1]!=B[j-1]的情况，初始化时已包括了
      res = Math.max(dp[i][j], res);
    }
  }
  return res;
};
```

## 42. 最小路径和

动态规划 + 空间优化只记录一维前置状态值

```js
var minPathSum = function (grid) {
  const m = grid.length;
  const n = grid[0].length;
  const dp = new Array(n);
  dp[0] = grid[0][0];
  for (let i = 1; i < n; i++) {
    dp[i] = dp[i - 1] + grid[0][i];
  }
  for (let i = 1; i < m; i++) {
    for (let j = 0; j < n; j++) {
      dp[j] = (j == 0 ? dp[j] : Math.min(dp[j - 1], dp[j])) + grid[i][j];
    }
  }
  return dp[n - 1];
};
```

## 43. 最长回文子串

### 1. 动态规划

```js
var longestPalindrome = function (s) {
  const len = s.length;
  let maxStart = 0,
    maxEnd = 0,
    maxLen = 1;
  let dp = new Array(len).fill().map(() => new Array(len));
  for (let r = 1; l < len; r++) {
    for (let l = 0; l < r; l++) {
      if (s[l] == s[r] && (r - l <= 2 || dp[l + 1][r - 1])) {
        dp[l][r] = true;
        if (r - l + 1 > maxLen) {
          maxLen = r - l + 1;
          maxStart = l;
          maxEnd = r;
        }
      } else {
        dp[l][r] = false;
      }
    }
  }
  return s.substring(maxStart, maxEnd + 1);
};
```

### 2. 中心扩展法 \*\*

```js
/**
1. 回文串一定是对称的，所以我们可以每次循环选择一个中心，进行左右扩展，判断左右字符是否相等即可。

2. 由于存在奇数的字符串aba和偶数的字符串abba，所以我们需要从一个字符开始扩展，或者从两个字符之间开始扩展，所以总共有 n+n-1 个中心。
**/
/**
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
  const len = s.length;
  if (len < 2) {
    return s;
  }
  let maxLen = 1;
  let res = s.substring(0, 1);
  // 中心位置枚举到 len - 2 即可
  for (let i = 0; i < len - 1; i++) {
    const oddStr = centerSpread(s, i, i);
    const evenStr = centerSpread(s, i, i + 1);
    const maxLenStr = oddStr.length > evenStr.length ? oddStr : evenStr;
    if (maxLenStr.length > maxLen) {
      maxLen = maxLenStr.length;
      res = maxLenStr;
    }
  }
  return res;
}

function centerSpread(s, left, right) {
  // left = right 的时候，此时回文中心是一个字符，回文串的长度是奇数
  // right = left + 1 的时候，此时回文中心是一个空隙，回文串的长度是偶数
  let len = s.length;
  let i = left;
  let j = right;
  while (i >= 0 && j < len) {
    if (s[j] === s[i]) {
      i--;
      j++;
    } else {
      break;
    }
  }
  // 这里要小心，跳出 while 循环时，恰好满足 s.charAt(i) != s.charAt(j)，因此不能取 i，不能取 j
  return s.substring(i + 1, j);
}
```

## 回文子串

```js
var countSubstrings = function (s) {
  const len = s.length;
  if (len < 2) {
    return len;
  }

  // 中心位置枚举到 len - 2 即可
  let count = 1;
  for (let i = 0; i < len - 1; i++) {
    const count1 = centerSpread(s, i, i);
    const count2 = centerSpread(s, i, i + 1);
    count += count1 + count2;
  }
  return count;
};

function centerSpread(s, left, right) {
  // left = right 的时候，此时回文中心是一个字符，回文串的长度是奇数
  // right = left + 1 的时候，此时回文中心是一个空隙，回文串的长度是偶数
  let len = s.length;
  let i = left;
  let j = right;
  let count = 0;
  while (i >= 0 && j < len) {
    if (s[j] === s[i]) {
      i--;
      count++;
      j++;
    } else {
      break;
    }
  }
  return count;
}
```

## 44. 回文链表 \*\*

快慢指针 + 链表翻转

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
function isPalindrome(head) {
  let fast = head,
    slow = head;
  //通过快慢指针找到中点
  while (fast != null && fast.next != null) {
    fast = fast.next.next;
    slow = slow.next;
  }
  //如果fast不为空，说明链表的长度是奇数个
  if (fast != null) {
    slow = slow.next;
  }
  //反转后半部分链表
  slow = reverse(slow);
  fast = head;
  while (slow != null) {
    //然后比较，判断节点值是否相等
    if (fast.val != slow.val) return false;
    fast = fast.next;
    slow = slow.next;
  }
  return true;
}

//反转链表
function reverse(head) {
  let prev = null,
    cur = head;
  while (cur != null) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
```

## 验证回文串

给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。
œ

```js
var isPalindrome = function (s) {
  if (!s.length) return true;
  let left = 0,
    right = s.length - 1;
  while (left < right) {
    if (!/^[0-9a-zA-Z]+$/.test(s[left])) {
      left++;
      continue;
    }
    if (!/^[0-9a-zA-Z]+$/.test(s[right])) {
      right--;
      continue;
    }
    if (s[left].toLocaleLowerCase() !== s[right].toLocaleLowerCase())
      return false;
    left++;
    right--;
  }
  return true;
};
```

## 45. 颜色分类

## 46. 环形链表 II

双指针法

```js
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function detectCycle(head) {
  let fast = head;
  let slow = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let index1 = fast;
      let index2 = head;
      while (index1 !== index2) {
        index1 = index1.next;
        index2 = index2.next;
      }
      return index2;
    }
  }
  return null;
}
```

## 47. LRU 缓存 \*\*

双向链表 + 哈希表

- 双向链表按照被使用的顺序存储了这些键值对，靠近头部的键值对是最近使用的，而靠近尾部的键值对是最久未使用的。
- 哈希表即为普通的哈希映射（HashMap），通过缓存数据的键映射到其在双向链表中的位置。

```js
/**
 * @param {number} capacity
 */
class ListNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}
var LRUCache = function (capacity) {
  this.capacity = capacity;
  this.size = 0;
  this.hash = new Map();
  this.dumyHead = new ListNode();
  this.dumyTail = new ListNode();
  this.dumyHead.next = this.dumyTail;
  this.dumyTail.prev = this.dumyHead;
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  const node = this.hash.get(key);
  if (!node) return -1;
  this.moveToHead(node);
  return node.value;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  const node = this.hash.get(key);
  if (!node) {
    if (this.size === this.capacity) {
      this.removeNode();
    }
    const node = new ListNode(key, value);
    this.hash.set(key, node);
    this.addToHead(node);
    this.size++;
  } else {
    node.value = value;
    this.moveToHead(node);
  }
};

LRUCache.prototype.moveToHead = function (node) {
  if (node === this.dumyHead.next) return;
  this.removeNodeFromList(node);
  this.addToHead(node);
};
LRUCache.prototype.addToHead = function (node) {
  node.prev = this.dumyHead;
  node.next = this.dumyHead.next;
  this.dumyHead.next.prev = node;
  this.dumyHead.next = node;
};
LRUCache.prototype.removeNodeFromList = function (node) {
  node.next.prev = node.prev;
  node.prev.next = node.next;
};
LRUCache.prototype.removeNode = function () {
  const node = this.dumyTail.prev;
  this.removeNodeFromList(node);
  this.hash.delete(node.key);
  this.size--;
};
/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
```

```js
class LRU {
  constructor(max) {
    this.max = max;
    this.cache = new Map();
  }
  get(key) {
    const { cache } = this;
    const value = cache.get(key);
    if (!value) return -1;
    cache.delete(key);
    cache.set(key, value);
    return value;
  }
  set(key, value) {
    const { cache, max } = this;
    if (cache.has(key)) {
      cache.delete(key);
    }
    if (cache.size === max) {
      cache.delete(cache.keys().next().value);
    }
    cache.set(key, value);
  }
}
```

## 剑指 Offer 14- I. 剪绳子

```js
//贪心算法

//尽可能分割成绳子长为 3, 若余下的一段为 1，则让出一个 3，凑成 4

function cuttingRope(n) {
  if (n < 4) return n - 1;
  let times = Math.floor(n / 3);
  const m = n % 3;
  if (m === 1) {
    times -= 1;
    return Math.pow(3, times) * 4;
  }
  return Math.pow(3, times) * 2;
}
```

## 合并两个有序数组

```js
function merge(nums1, m, nums2, n) {
  // two get pointers for nums1 and nums2
  let p1 = m - 1;
  let p2 = n - 1;
  // set pointer for nums1
  let p = m + n - 1;
  // while there are still elements to compare
  //比较两个指针指向的数，将最大值放到nums[p],向前移动指向最大值的指针
  // compare two elements from nums1 and nums2
  // and add the largest one in nums1
  while (p1 >= 0 && p2 >= 0) {
    nums1[p--] = nums1[p1] < nums2[p2] ? nums2[p2--] : nums1[p1--];
  }
  // add missing elements from nums2
  for (let i = 0; i <= p2; i++) {
    nums1[i] = nums2[i];
  }
}
```

## 比较版本号

```js
var compareVersion = function (version1, version2) {
  const arr1 = version1.split(".").map((item) => Number(item));
  const arr2 = version2.split(".").map((item) => Number(item));
  let q = 0,
    p = 0;
  const len1 = arr1.length,
    len2 = arr2.length;

  while (q < len1 && p < len2) {
    if (arr1[q] !== arr2[p]) return arr1[q] > arr2[p] ? 1 : -1;
    q++;
    p++;
  }
  while (q < len1) {
    if (arr1[q++] !== 0) return 1;
  }
  while (p < len2) {
    if (arr2[p++] !== 0) return -1;
  }
  return 0;
};
```

## 48. 下一个排列 \*\*

```js
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 * 我们希望下一个数比当前数大，这样才满足“下一个排列”的定义。因此只需要将后面的「大数」与前面的「小数」交换，就能得到一个更大的数。比如 123456，将 5 和 6 交换就能得到一个更大的数 123465。
我们还希望下一个数增加的幅度尽可能的小，这样才满足“下一个排列与当前排列紧邻“的要求。为了满足这个要求，我们需要：
在尽可能靠右的低位进行交换，需要从后向前查找
将一个 尽可能小的「大数」 与前面的「小数」交换。比如 123465，下一个排列应该把 5 和 4 交换而不是把 6 和 4 交换
将「大数」换到前面后，需要将「大数」后面的所有数重置为升序，升序排列就是最小的排列。以 123465 为例：首先按照上一步，交换 5 和 4，得到 123564；然后需要将 5 之后的数重置为升序，得到 123546。显然 123546 比 123564 更小，123546 就是 123465 的下一个排列

 */
var nextPermutation = function (nums) {
  const len = nums.length;
  if (len < 1) return;
  let i = len - 2,
    k = len - 1;
  // 首先从后向前查找第一个相邻升序的元素对 (i,j)
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--;
  }
  //然后在 [j,end) 从后向前查找第一个大于 A[i] 的值 A[k]
  if (i >= 0) {
    while (k >= 0 && nums[i] >= nums[k]) {
      k--;
    }
    //交换 A[i] A[k]
    const t = nums[i];
    nums[i] = nums[k];
    nums[k] = t;
  }
  // [j,end) 必然是降序，逆置 [j,end)，使其升序
  reverse(nums, i + 1, nums.length - 1);
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
```

## 49 最小覆盖子串 \*\*

滑动窗口

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function (s, t) {
  const need = {};
  let needCount = 0;
  for (let i = 0; i < t.length; i++) {
    if (!need[t[i]]) need[t[i]] = 0;
    need[t[i]]++;
    needCount++;
  }
  let i = 0,
    j = 0,
    res = [0, Number.MAX_SAFE_INTEGER];
  while (i < s.length && j < s.length) {
    // 不断增加j使滑动窗口增大，直到窗口包含了T的所有元素，need中所有元素的数量都小于等于0，同时needCnt也是0
    while (j < s.length) {
      const char = s[j];
      if (need[char] > 0) {
        needCount--;
      }
      if (!(char in need)) need[char] = 0;
      need[char] -= 1;
      if (needCount === 0) {
        // 窗口中已经包含所需的全部字符
        // 不断增加i使滑动窗口缩小，直到碰到一个必须包含的元素A，此时记录长度更新结果
        while (i < j) {
          const char = s[i];
          if (need[char] == 0) break;
          need[char] += 1;
          i++;
        }
        res = res[1] - res[0] > j - i ? [i, j] : res;
        // 让i再增加一个位置，开始寻找下一个满足条件的滑动窗口
        need[s[i++]] += 1;
        needCount += 1;
      }
      j++;
    }
  }

  return res[1] === Number.MAX_SAFE_INTEGER ? "" : s.slice(res[0], res[1] + 1);
};
```

## 50. 合并 K 个升序链表 \*\*

归并两两合并

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function (lists) {
  function merge(left, right) {
    if (left === right) return lists[left];
    const mid = left + Math.floor((right - left) / 2);
    const l1 = merge(left, mid);
    const l2 = merge(mid + 1, right);
    return mergeTwoList(l1, l2);
  }
  if (!lists.length) return null;
  return merge(0, lists.length - 1);
};

var mergeTwoList = function (a, b) {
  if (!a) return b;
  if (!b) return a;
  let dummyHead = new ListNode(0);
  let tail = dummyHead;
  let p1 = a;
  let p2 = b;
  while (p1 && p2) {
    if (p1.val < p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }
  tail.next = p1 ? p1 : p2;
  return dummyHead.next;
};
```

## 归并排序

```js
function mergeSort(arr) {
  const temp = [];
  _mergeSort(arr, 0, arr.length - 1);
  function _mergeSort(arr, start, end) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    _mergeSort(arr, start, mid);
    _mergeSort(arr, mid + 1, end);
    _merge(arr, start, mid, end);
  }
  function _merge(arr, start, mid, end) {
    let i = start;
    let j = mid + 1;
    let k = start;
    while (i <= mid && j <= end) {
      if (arr[i] < arr[j]) {
        temp[k++] = arr[i++];
      } else {
        temp[k++] = arr[j++];
      }
    }
    while (i <= mid) {
      temp[k++] = arr[i++];
    }
    while (j <= end) {
      temp[k++] = arr[j++];
    }
    for (let i = start; i <= end; i++) {
      arr[i] = temp[i];
    }
  }
}
```

## K 个一组翻转链表\*\*

```js
var reverseKGroup = function (head, k) {
  const dummyHead = new ListNode();
  dummyHead.next = head;
  //初始化prev和cur都指向dummy。pre指每次要翻转的链表的头结点的上一个节点。cur指每次要翻转的链表的尾节点
  let prev = dummyHead,
    cur = dummyHead;
  while (cur.next) {
    //循环k次，找到需要翻转的链表的结尾,这里每次循环要判断cur是否等于空,因为如果为空，cur.next会报空指针异常
    for (let i = 0; i < k; i++) {
      if (!cur) break;
      cur = cur.next;
    }
    if (!cur) break;
    //先记录下cur.next,方便后面链接链表
    let next = cur.next;
    //找到要翻转的头结点
    const start = prev.next;
    //断开链表
    cur.next = null;
    //翻转链表
    const node = reverseList(start);
    ///翻转链表,pre.next指向翻转后的链表。1->2 变成2->1。 prev->2->1
    prev.next = node;
    //通过.next把断开的链表重新链接。
    start.next = next;
    // 将pre换成下次要翻转的链表的头结点的上一个节点。即start
    prev = start;
    // 翻转结束，将cur置为下次要翻转的链表的头结点的上一个节点。
    cur = start;
  }
  return dummyHead.next;
};

var reverseList = function (head) {
  let cur = head,
    pre = null;
  while (cur) {
    let temp = cur.next;
    cur.next = pre;
    pre = cur;
    cur = temp;
  }
  return pre;
};
```

## 排序链表

归并排序

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var sortList = function (head) {
  if (!head || !head.next) return head;
  let mid = findMid(head);
  let right = mid.next;
  mid.next = null;
  const l1 = sortList(head);
  const l2 = sortList(right);
  return mergeTwoList(l1, l2);
};
function findMid(head) {
  if (!head || !head.next) return head;
  let slow = head,
    fast = head.next.next;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

var mergeTwoList = function (a, b) {
  if (!a) return b;
  if (!b) return a;
  let dummyHead = new ListNode(0);
  let tail = dummyHead;
  let p1 = a;
  let p2 = b;
  while (p1 && p2) {
    if (p1.val < p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }
  tail.next = p1 ? p1 : p2;
  return dummyHead.next;
};
```
