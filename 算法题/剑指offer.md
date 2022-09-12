### 1. 旋转数组的最小数字

```js
var minArray = function (numbers) {
  let low = 0;
  let high = numbers.length - 1;
  while (low < high) {
    const pivot = low + Math.floor((high - low) / 2);
    if (numbers[pivot] < numbers[high]) {
      high = pivot;
    } else if (numbers[pivot] > numbers[high]) {
      low = pivot + 1;
    } else {
      high -= 1;
    }
  }
  return numbers[low];
};
```

## 树的子结构

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} A
 * @param {TreeNode} B
 * @return {boolean}
 */
var isSubStructure = function (A, B) {
  // 先序遍历
  if (!A || !B) return false;
  if (recur(A, B)) return true;
  return isSubStructure(A.left, B) || isSubStructure(A.right, B);
};

// 从root节点开始一一匹配
function recur(A, B) {
  if (!B) return true;
  if (!A || A.val !== B.val) return false;
  return recur(A.left, B.left) && recur(A.right, B.right);
}
```

## 二叉搜索树的后序遍历序列

```js
var verifyPostorder = function (postorder) {
  /*
        1. 分治法，BST性质
            空数组需要返回真
        2. 每次以最后一个元素为根，将当前数组切割成left、right两部分
        3. 除了最后元素root外，
            leftArr = 剩下元素按照 小于root前，一直小于root
            rightArr = 当遇到大于root的,后边一直都要比root大
        4. 如果按上面规则，能到arr.length-1,则说明本轮符合条件
    */
  if (!postorder || !postorder.length) {
    return true;
  }

  return verifyPostorderHelper(postorder, 0, postorder.length - 1);
};

//两端闭[]
function verifyPostorderHelper(postorder, i, j) {
  //中止条件,只有1个元素不用分了
  //等 于j表示只有一个元素了，
  //大于j，表示当前节点不存在，比如有左孩子，没有右孩子
  if (i >= j) {
    return true;
  }
  //[1,3,2,6,5]
  let start = i;
  //从左边开始
  while (postorder[start] < postorder[j]) {
    start++;
  }
  //此时postorder[start]>postorder[j]
  let splitor = start; //中间分割点
  //之后每个元素都要大于postorder[j]
  while (postorder[start] > postorder[j]) {
    start++;
  }
  //如果此时start=== j，说明走到最右边了，是符合要求的
  //如果小于j，则说明按以上两条规则没走完，不符合
  if (start < j) {
    return false;
  }

  let isLeftOk = verifyPostorderHelper(postorder, i, splitor - 1);
  let isRightOk = verifyPostorderHelper(postorder, splitor, j - 1); //排除掉j，j是根目录
  return isLeftOk && isRightOk;
}
```

## 二叉搜索树与双向链表

```js
var treeToDoublyList = function (root) {
  let pre = null,
    head = null;
  if (!root) return null;
  dfs(root);
  head.left = pre;
  pre.right = head;
  return head;
  function dfs(root) {
    if (root == null) return; // 递归边界: 叶子结点返回
    dfs(root.left);
    if (pre != null) pre.right = root;
    else head = root; // 链表头结点
    root.left = pre;
    pre = root;
    dfs(root.right);
  }
};
```

## 在排序数组中查找数字 I

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, t) {
  let a = 0,
    b = 0,
    n = nums.length;
  if (n == 0) return 0;
  let l = 0,
    r = n - 1;

  while (l < r) {
    const mid = (l + r) >> 1;
    if (nums[mid] >= t) r = mid;
    else l = mid + 1;
  }
  if (nums[r] != t) return 0;
  a = r;
  l = 0;
  r = n - 1;
  while (l < r) {
    const mid = (l + r + 1) >> 1;
    if (nums[mid] <= t) l = mid;
    else r = mid - 1;
  }
  b = r;
  return b - a + 1;
}
```

## 平衡二叉树

```js
var isBalanced = function (root) {
  if (!root) return true;
  if (Math.abs(depth(root.left) - depth(root.right)) > 1) return false;
  return isBalanced(root.left) && isBalanced(root.right);
  function depth(node) {
    if (!node) return 0;
    var left = depth(node.left);
    var right = depth(node.right);
    return Math.max(left, right) + 1;
  }
};
```

##

```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var singleNumbers = function (nums) {
  let t = 0;
  nums.forEach((item) => {
    t = t ^ item;
  });
  let m = 1;
  while ((t & m) === 0) {
    m = m << 1;
    console.log(m);
  }

  let left = 0,
    right = 0;

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (m & num) {
      left ^= num;
    } else {
      right ^= num;
    }
  }
  return [left, right];
};
```

# 和为 s 的连续正数序列

```js
/**
 * @param {number} target
 * @return {number[][]}
 */
var findContinuousSequence = function (target) {
  const result = [];
  const half = Math.ceil(target / 2);
  let sum = 0;
  let left = 1,
    right = 1;
  while (left <= half) {
    if (sum < target) {
      sum += right;
      right++;
    } else if (sum > target) {
      sum -= left;
      left++;
    } else {
      const list = [];
      for (let i = left; i < right; i++) {
        list.push(i);
      }
      result.push(list);
      sum -= left;
      left++;
    }
  }
  return result;
};
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

## 机器人的运动范围

```js
/**
 * @param {number} m
 * @param {number} n
 * @param {number} k
 * @return {number}
 */
var movingCount = function (m, n, k) {
  const visited = new Array(m).fill(0).map((item) => new Array(n).fill(false));
  let count = 0;
  function dfs(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= m ||
      y >= n ||
      visited[x][y] ||
      digitalSum(x) + digitalSum(y) > k
    ) {
      return;
    }
    visited[x][y] = true;
    count++;
    dfs(x + 1, y);
    dfs(x - 1, y);
    dfs(x, y + 1);
    dfs(x, y - 1);
  }
  dfs(0, 0);
  return count;
};

function digitalSum(x) {
  let result = 0;
  while (x !== 0) {
    result += x % 10;
    x = Math.floor(x / 10);
  }
  return result;
}
```

## 字符串转换整数 (atoi)

```js
/**
 * @param {string} s
 * @return {number}
 */
var myAtoi = function (str) {
  //利用正则
  let result = str.trim().match(/^[-|+]{0,1}[0-9]+/);
  console.log(result, "result");
  if (result != null) {
    if (result[0] > Math.pow(2, 31) - 1) {
      return Math.pow(2, 31) - 1;
    }
    if (result[0] < Math.pow(-2, 31)) {
      return Math.pow(-2, 31);
    }
    return result[0];
  }

  return 0;
};
```


## 复杂链表的复制
```js 
/**
 * // Definition for a Node.
 * function Node(val, next, random) {
 *    this.val = val;
 *    this.next = next;
 *    this.random = random;
 * };
 */


function copyRandomList(head) {
   if (!head) return head;
  let cur = head;
  // 将拷贝节点放到原节点后面，例如1->2->3这样的链表就变成了这样1->1'->2->2'->3->3'
  while (cur) {
    const node = new Node(cur.val);
    node.next = cur.next;
    cur.next = node;
    cur = node.next;
  }
  cur = head;

  // 设置新节点random指向
  while (cur) {
    if (cur.random) {
      cur.next.random = cur.random.next;
    }
    cur = cur.next.next;
  }
  // 拆分链表
  cur = head.next;
  let pre = head,
    res = head.next;
  while (cur.next) {
    pre.next = pre.next.next;
    cur.next = cur.next.next;
    pre = pre.next;
    cur = cur.next;
  }
  pre.next = null;
  return res;
}

```
