## 2. 前 K 个高频元素 \*\*

堆排序

## 3. 二叉树展开为链表 \*\*

```js
function flatten(root) {
  if (root == null) {
    return;
  }
  //将根节点的左子树变成链表
  flatten(root.left);
  //将根节点的右子树变成链表
  flatten(root.right);
  const temp = root.right;
  //把树的右边换成左边的链表
  root.right = root.left;
  //记得要将左边置空
  root.left = null;
  //找到树的最右边的节点
  while (root.right != null) root = root.right;
  //把右边的链表接到刚才树的最右边的节点
  root.right = temp;
}
```

## 4. 滑动窗口最大值 \*\*

```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var maxSlidingWindow = function (nums, k) {
  if (!nums || nums.length < 2) return nums;
  // 双向队列 保存当前窗口最大值的数组位置 保证队列中数组位置的数值按从大到小排序
  const queue = [];
  // 结果数组
  const result = [];
  // 遍历nums数组
  for (let i = 0; i < nums.length; i++) {
    // 保证从大到小 如果前面数小则需要依次弹出，直至满足要求
    while (queue.length && nums[queue[queue.length - 1]] <= nums[i]) {
      queue.pop();
    }
    // 添加当前值对应的数组下标
    queue.push(i);
    // 判断当前队列中队首的值是否在窗口内
    if (queue[0] <= i - k) {
      queue.shift();
    }
    // 当窗口长度为k时 保存当前窗口中最大值
    if (i + 1 >= k) {
      result[i + 1 - k] = nums[queue[0]];
    }
  }
  return result;
};
```

## 5. 最小栈 \*\*

```js
/**
 * initialize your data structure here.
 */
var MinStack = function () {
  this.stack = []; // 维持所有元素
  this.minStack = []; // 维持当前最小元素
};

/**
 * @param {number} x
 * @return {void}
 */
MinStack.prototype.push = function (x) {
  this.stack.push(x);
  if (this.minStack.length) {
    const top = this.minStack[this.minStack.length - 1];
    //小于的时候才入栈
    if (x <= top) {
      this.minStack.push(x);
    }
  } else {
    this.minStack.push(x);
  }
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function () {
  const top = this.stack.pop();
  const minTop = this.minStack[this.minStack.length - 1];
  if (top === minTop) {
    this.minStack.pop();
  }
};

/**
 * @return {number}
 */
MinStack.prototype.top = function () {
  return this.stack[this.stack.length - 1] || null;
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function () {
  return this.minStack[this.minStack.length - 1] || null;
};

/**
 * Your MinStack object will be instantiated and called as such:
 * var obj = new MinStack()
 * obj.push(x)
 * obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.getMin()
 */
```

## 6. 每日温度**

单调递减栈

```js
/**
 * @param {number[]} T
 * @return {number[]}
 */
var dailyTemperatures = function (T) {
  const stack = [];
  const res = new Array(T.length).fill(0);
  for (let i = 0; i < T.length; i++) {
    while (stack.length && T[i] > T[stack[stack.length - 1]]) {
      const top = stack[stack.length - 1];
      const step = i - top;
      res[top] = step;
      stack.pop();
    }
    stack.push(i);
  }
  return res;
};
```

## 删除二叉搜索树中的节点 \*\*

```js
var deleteNode = function (root, key) {
  if (!root) return null;
  if (key > root.val) root.right = deleteNode(root.right, key);
  else if (key < root.val) root.left = deleteNode(root.left, key);
  else {
    if (!root.left) return root.right; // 情况1，欲删除节点无左子
    if (!root.right) return root.left; // 情况2，欲删除节点无右子

    let node = root.right; // 情况3，欲删除节点左右子都有

    while (node.left) {
      // 寻找欲删除节点右子树的最左节点
      node = node.left;
    }
    node.left = root.left; // 将欲删除节点的左子树成为其右子树的最左节点的左子树

    root = root.right; // 欲删除节点的右子顶替其位置，节点被删除
  }
  return root;
};
```

## 完全二叉树的节点个数 \*\*

```js
var countNodes = function (root) {
  if (!root) return 0;
  let lh = 0,
    rh = 0;
  let left = root,
    right = root;
  while (left) {
    lh++;
    left = left.left;
  }
  while (right) {
    rh++;
    right = right.right;
  }
  if (lh == rh) {
    return Math.pow(2, lh) - 1;
  }
  return 1 + countNodes(root.left) + countNodes(root.right);
};
```

## 7. 从前序与中序遍历序列构造二叉树\*\*

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
 */
function buildTree(preorder, inorder) {
  const len = preorder.length;
  //构造哈希映射，帮助我们快速定位根节点
  const indexMap = new Map();
  for (let i = 0; i < inorder.length; i++) {
    indexMap.set(inorder[i], i);
  }
  return _buildTree(preorder, 0, len - 1, inorder, 0, len - 1, indexMap);
}

/**
 * 使用数组 preorder 在索引区间 [preLeft, preRight] 中的所有元素
 * 和数组 inorder 在索引区间 [inLeft, inRight] 中的所有元素构造二叉树
 *
 * @param preorder 二叉树前序遍历结果
 * @param preLeft  二叉树前序遍历结果的左边界
 * @param preRight 二叉树前序遍历结果的右边界
 * @param inorder  二叉树后序遍历结果
 * @param inLeft   二叉树后序遍历结果的左边界
 * @param inRight  二叉树后序遍历结果的右边界
 * @return 二叉树的根结点
 */
function _buildTree(
  preorder,
  preLeft,
  preRight,
  inorder,
  inLeft,
  inRight,
  indexMap
) {
  // 因为是递归调用的方法，按照国际惯例，先写递归终止条件
  if (preLeft > preRight || inLeft > inRight) {
    return null;
  }
  // 先序遍历的起点元素很重要
  //前序遍历中的第一个节点就是根节点
  const pivot = preorder[preLeft];
  const root = new TreeNode(pivot);
  // 在中序遍历中定位根节点
  let pivotIndex = indexMap.get(pivot);
  root.left = _buildTree(
    preorder,
    preLeft + 1,
    pivotIndex - inLeft + preLeft,
    inorder,
    inLeft,
    pivotIndex - 1,
    indexMap
  );
  root.right = _buildTree(
    preorder,
    pivotIndex - inLeft + preLeft + 1,
    preRight,
    inorder,
    pivotIndex + 1,
    inRight,
    indexMap
  );
  return root;
}
```

## 8.二叉树的最近公共祖先 \*\*

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
function lowestCommonAncestor(root, p, q) {
  // 如果p,q为根节点，则公共祖先为根节点
  if (!root || root === p || root === q) return root;
  // 如果p,q在左子树，则公共祖先在左子树查找
  const left = lowestCommonAncestor(root.left, p, q);
  // 如果p,q在右子树，则公共祖先在右子树查找
  const right = lowestCommonAncestor(root.right, p, q);
  //   if (left == null && right == null) return null; // 1.
  if (left == null) return right; // 3.
  if (right == null) return left; // 4.
  // 如果p,q分属两侧，则公共祖先为根节点
  return root; // 2. if(left != null and right != null)
}
```

## 9.合并二叉树

```js
function mergeTrees(root1, root2) {
  if (!root1 || !root2) {
    return root1 ? root1 : root2;
  }
  root1.val += root2.val;
  root1.left = mergeTrees(root1.left, root2.left);
  root1.right = mergeTrees(root1.right, root2.right);
  return root1;
}
```

## 10. 单词拆分

1. 动态规划

```js
/**
 * s 串能否分解为单词表的单词（前 s.length 个字符的 s 串能否分解为单词表单词）
将大问题分解为规模小一点的子问题：
前 ii 个字符的子串，能否分解成单词
剩余子串，是否为单个单词。
dp[i]：长度为i的s[0:i-1]子串是否能拆分成单词。题目求:dp[s.length]
s[0:i] 子串对应 dp[i+1] ，它是否为 true（s[0:i]能否 break），取决于两点：
它的前缀子串 s[0:j-1] 的 dp[j]，是否为 true。
剩余子串 s[j:i]，是否是单词表的单词。
 */
const wordBreak = (s, wordDict) => {
  const wordSet = new Set(wordDict);
  const len = s.length;
  const dp = new Array(len + 1).fill(false); // 长度为i的s[0:i-1]子串是否能拆分成单词
  dp[0] = true;
  for (let i = 1; i <= len; i++) {
    for (let j = 0; j < i; j++) {
      const suffix = s.slice(j, i);
      if (wordSet.has(suffix) && dp[j]) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[len];
};
```

2. 记忆化回溯法

```js
const wordBreak = function (s, wordDict) {
  const wordSet = new Set(wordDict);
  const len = s.length;
  const memo = [];
  function canBreak(start) {
    // 判断从start到末尾的子串能否break
    if (start === len) return true;
    if (memo[start] !== undefined) return memo[start];
    for (let i = start + 1; i <= len; i++) {
      //指针i去划分两部分，for枚举出当前所有的选项i
      const prefix = s.slice(start, i); // 切出的前缀部分
      if (wordSet.has(prefix) && canBreak(i)) {
        // 前缀部分是单词，且剩余子串能break，返回真
        return (memo[start] = true);
      }
    }
    return (memo[start] = false);
  }
  return canBreak(0);
};
```

## 11. 比特位计数

```js
/**
 * @param {number} n
 * @return {number[]}
 *  
 * 1: 0001     3:  0011      0: 0000
 2: 0010     6:  0110      1: 0001
 4: 0100     12: 1100      2: 0010 
 8: 1000     24: 11000     3: 0011
 16:10000    48: 110000    4: 0100
 32:100000   96: 1100000   5: 0101
 
 由上可见：
 1、如果 i 为偶数，那么f(i) = f(i/2) ,因为 i/2 本质上是i的二进制左移一位，低位补零，所以1的数量不变。
 2、如果 i 为奇数，那么f(i) = f(i - 1) + 1， 因为如果i为奇数，那么 i - 1必定为偶数，而偶数的二进制最低位一定是0，
 那么该偶数 +1 后最低位变为1且不会进位，所以奇数比它上一个偶数bit上多一个1，即 f(i) = f(i - 1) + 1。
 */

var countBits = function (n) {
  const res = [0];
  for (let i = 0; i <= n; i++) {
    if (i % 2) {
      //奇数
      res = res[i - 1] + 1;
    } else {
      //偶数
      res = res[i / 2];
    }
  }
  return res;
};
```

## 12. 最长有效括号 \*\*

```js
// 用栈模拟一遍，将所有无法匹配的括号的位置全部置1
// 例如: "()(()"的mark为[0, 0, 1, 0, 0]
// 再例如: ")()((())"的mark为[1, 0, 0, 1, 0, 0, 0, 0]
// 经过这样的处理后, 此题就变成了寻找最长的连续的0的长度

function longestValidParentheses(s) {
  const stack = [],
    mark = new Array(s.length).fill(0);
  for (let i = 0; i < s.length; i++) {
    if (s[i] == "(") stack.push(i);
    else {
      if (!stack.length) {
        mark[i] = 1;
      } else {
        stack.pop();
      }
    }
  }
  while (stack.length) {
    mark[stack.pop()] = 1;
  }
  let max = 0;
  let count = 0;

  for (let i = 0; i < mark.length; i++) {
    if (mark[i] === 1) {
      count = 0;
    } else {
      max = Math.max(max, ++count);
    }
  }
  return max;
}
```

## 13. 最长连续序列

```js
var longestConsecutive = function (nums) {
  const numSet = new Set(nums);
  let longestStreak = 0;
  for (let num of nums) {
    if (!numSet.has(num - 1)) {
      // 枚举的数前一个数字一定不在数组内的
      let currentNum = num;
      let currentStreak = 1;
      while (numSet.has(currentNum + 1)) {
        currentNum += 1;
        currentStreak += 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }
  }
  return longestStreak;
};
```

## 14. 排序链表

## 15. 字符串编码

```js
/**
输入：s = "3[a]2[bc]"
输出："aaabcbc"
 */
var decodeString = function (s) {
  const alpStack = [];
  const numStack = [];
  let times = "";
  let str = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "[") {
      //遇到[压栈数字和字符串，置零置空
      numStack.push(times ? +times : 1);
      times = "";
      alpStack.push(str);
      str = "";
    } else if (c === "]") {
      //遇到]出栈数字和字符串，组装
      const num = numStack.pop();
      let temp = "";
      for (let i = 0; i < num; i++) {
        temp += str;
      }
      str = alpStack.pop() + temp;
    } else if (c >= "0" && c <= "9") {
      //遇到数字则存入num
      times += c;
    } else {
      //遇到字符存入字符
      str += c;
    }
  }
  return str;
};
```

## 16. 乘积最大数组

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
function maxProduct(nums) {
  /*
遍历数组时计算当前最大值，不断更新
令imax为当前最大值，则当前最大值为 imax = max(imax * nums[i], nums[i])
由于存在负数，那么会导致最大的变最小的，最小的变最大的。因此还需要维护当前最小值imin，imin = min(imin * nums[i], nums[i])
当负数出现时则imax与imin进行交换再进行下一步计算
*/
  let max = Number.MIN_SAFE_INTEGER,
    imax = 1,
    imin = 1;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) {
      let tmp = imax;
      imax = imin;
      imin = tmp;
    }
    imax = Math.max(imax * nums[i], nums[i]);
    imin = Math.min(imin * nums[i], nums[i]);
    max = Math.max(max, imax);
  }
  return max;
}
```

## 17. 汉明距离

```js
function hammingDistance(x, y) {
  let res = x ^ y;
  let count = 0;
  while (res) {
    if (res & 1) {
      count++;
    }
    res = res >> 1;
  }
  return count;
}
```

## 18. 二叉树的直径 \*\*
任意两个结点路径长度中的最大值
```js
var diameterOfBinaryTree = function (root) {
  let max = 0;
  deep(root);
  return max;
  function deep(node) {
    if (!node) return 0;
    let leftDeep = 0,
      rightDeep = 0;
    if (node.left) leftDeep = deep(node.left) + 1;
    if (node.right) rightDeep = deep(node.right) + 1;
    max = Math.max(leftDeep + rightDeep, max);
    return Math.max(leftDeep, rightDeep);
  }
};
```

## 查找数组公共前缀（美团）

```js
function longestCommonPrefix(strs) {
  const len = strs[0].length;
  if (!len) return 0;
  let index = 1;
  let res = "";
  while (index <= len) {
    const prefix = strs[0].slice(0, index);
    for (let i = 1; i < strs.length; i++) {
      const str = strs[i];
      if (prefix.length > str.length || !str.startsWith(prefix)) return res;
    }
    res = prefix;
    index++;
  }
  return res;
}
```

## 不同的二叉搜索树

```js
class Solution {
    public int numTrees(int n) {
        int[] dp = new int[n+1];
        dp[0] = 1;
        dp[1] = 1;

        for(int i = 2; i < n + 1; i++)
            for(int j = 1; j < i + 1; j++)
                dp[i] += dp[j-1] * dp[i-j];

        return dp[n];
    }
}

作者：guanpengchn
链接：https://leetcode.cn/problems/unique-binary-search-trees/solution/hua-jie-suan-fa-96-bu-tong-de-er-cha-sou-suo-shu-b/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```
