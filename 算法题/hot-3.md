## 删除排序链表中的重复元素

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
var deleteDuplicates = function (head) {
  let slow = head;
  if (!head) return head;
  let fast = head.next;
  while (fast) {
    if (fast.val !== slow.val) {
      slow.next = fast;
      slow = slow.next;
    }
    fast = fast.next;
  }
  if (slow) slow.next = null;
  return head;
};
```

## 删除有序数组中的重复项 \*\*

双指针

```js
/**
 * @param {number[]} nums
 * @return {number}
 * 1,2,3,3,4
//  */
//  [0,0,1,1,1,2,2,3,3,4]
//  输出：5, nums = [0,1,2,3,4]
var removeDuplicates = function (nums) {
  const n = nums.length;
  if (n === 0) {
    return 0;
  }
  let fast = 1,
    slow = 1;
  while (fast < n) {
    if (nums[fast] !== nums[fast - 1]) {
      nums[slow] = nums[fast];
      ++slow;
    }
    ++fast;
  }
  return slow;
};
removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]);
```

### 搜索插入位置

二分查找

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var searchInsert = function (nums, target) {
  let left = 0,
    right = nums.length - 1;
  while (left <= right) {
    let mid = left + Math.floor((right - left) / 2);
    if (nums[mid] > target) {
      right = mid - 1;
    } else if (nums[mid] == target) {
      return mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
};
```

## 移除元素

双指针

```js
var removeElement = function (nums, val) {
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[left++] = nums[i];
    }
  }
  return left;
};
```

## 罗马数字转整数 \*\*

```js
var romanToInt = function (s) {
  const hashMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    if (i < s.length - 1 && hashMap[s[i]] < hashMap[s[i + 1]]) {
      result -= hashMap[s[i]];
    } else {
      result += hashMap[s[i]];
    }
  }
  return result;
};
```

## 数字转罗马数字 \*\*

贪心算法

```js
function intToRoman(num) {
  const nums = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const romans = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  let index = 0;
  const res = [];
  while (index < 13) {
    while (num >= nums[index]) {
      res.push(romans[index]);
      num -= nums[index];
    }
    index++;
  }
  return res.join("");
}
```

## 路径总和 \*\*

```js
var hasPathSum = function (root, targetSum) {
  if (!root) return false;
  const val = targetSum - root.val;
  if (!root.left && !root.right) return val === 0;
  return hasPathSum(root.left, val) || hasPathSum(root.right, val);
};
```

## 113. 路径总和 2 \*\*

```javascript
function pathSum(root, sum) {
  const result = [];
  dfs(root, sum, [], result);
  return result;
  function dfs(root, sum, list) {
    if (!root) return null;
    const subList = list.slice();
    //把当前节点值加入到subList中
    subList.push(root.val);
    //如果到达叶子节点，就不能往下走了，直接return
    if (!root.left && !root.right) {
      //如果到达叶子节点，并且sum等于叶子节点的值，说明我们找到了一组，
      //要把它放到result中
      if (sum === root.val) {
        result.push(subList);
      }
      ///到叶子节点之后直接返回，因为在往下就走不动了
      return;
    }
    //如果没到达叶子节点，就继续从他的左右两个子节点往下找，注意到
    //下一步的时候，sum值要减去当前节点的值
    dfs(root.left, sum - root.val, subList);
    dfs(root.right, sum - root.val, subList);
  }
}
```

## 二进制求和

```js
function addBinary(a, b) {
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;
  let result = "";
  while (i >= 0 || j >= 0) {
    const left = i < 0 ? 0 : +a[i];
    const right = j < 0 ? 0 : +b[j];
    const sum = left + right + carry;
    const val = sum % 2;
    carry = Math.floor(sum / 2);
    console.log(sum, carry);
    result = val + result;
    i--;
    j--;
  }
  return carry ? carry + result : result;
}
```

## 加一

// 给定一个由整数组成的非空数组所表示的非负整数，在该数的基础上加一。最高位数字存放在数组的首位， 数组中每个元素只存储一个数字。

```js
var plusOne = function (digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    digits[i]++;
    digits[i] %= 10;
    if (digits[i] != 0) {
      return digits;
    }
  }
  digits.unshift(1);
  return digits;
};
```

## 最后一个单词的长度

```js
function lengthOfLastWord(s) {
  let length = 0;
  let flag = true;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] !== " ") {
      length++;
      flag = false;
    } else if (!flag) {
      return length;
    }
  }
  return length;
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

## 有序数组转二叉搜索树

给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 高度平衡 二叉搜索树。

高度平衡 二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1 」的二叉树。

```js
// 二分法
var sortedArrayToBST = function (nums) {
  return helper(nums, 0, nums.length - 1);
};

function helper(nums, left, right) {
  if (left > right) return null;
  const mid = Math.ceil((left + right) / 2);
  const root = new TreeNode(nums[mid]);
  root.left = helper(nums, left, mid - 1);
  root.right = helper(nums, mid + 1, right);
  return root;
}
```

## 二叉树的层序遍历 2

给定一个二叉树，返回其节点值自底向上的层次遍历。 （即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）

```js
var levelOrderBottom = function (root) {
  var queue = [];
  var result = [];
  if (root) queue.push(root);
  while (queue.length) {
    var arr = [];
    var len = queue.length;
    for (var i = 0; i < len; i++) {
      var curNode = queue.shift();
      arr.push(curNode.val);
      if (curNode.left) queue.push(curNode.left);
      if (curNode.right) queue.push(curNode.right);
    }
    result.unshift(arr);
  }
  return result;
};
```

## 相同的树 \*\*

```js
var isSameTree = function (p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  if (p.val != q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};
```

## 实现 strStr()

1. 暴力解法

```js
var strStr = function (haystack, needle) {
  for (let i = 0; i < haystack.length; i++) {
    let flag = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        flag = false;
        break;
      }
    }
    if (flag) return i;
  }
  return -1;
};
```

2. KMP 算法

```

```

## 反转字符串

```js
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function (s) {
  let left = 0,
    right = s.length - 1;
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++;
    right--;
  }
  return s;
};
```

## 171. Excel 表列序号 \*\*

因为有 26 个字母，所以相当于 26 进制，每 26 个数则向前进一位
所以每遍历一位则 ans = ans _ 26 + num
以 ZY 为例，Z 的值为 26，Y 的值为 25，则结果为 26 _ 26 + 25=701
时间复杂度：O(n)O(n)

```js
var titleToNumber = function (columnTitle) {
  let count = 0;
  for (let i = 0; i < columnTitle.length; i++) {
    count = columnTitle[i].charCodeAt(0) - 64 + count * 26;
  }
  return count;
};
```

## 整数拆分

```js
/**
 * @param {number} n
 * @return {number}
 */
var integerBreak = function (n) {
  if (n < 4) return n - 1;
  let times = Math.floor(n / 3);
  const m = n % 3;
  if (m === 1) {
    times -= 1;
    return Math.pow(3, times) * 4;
  } else if (m === 0) {
    return Math.pow(3, times);
  }
  return Math.pow(3, times) * 2;
};
```

## 有效的字母异位词\*\*

```js
var isAnagram = function (s, t) {
  if (s.length !== t.length) return false;
  const hash = new Map();
  for (let i = 0; i < s.length; i++) {
    let count = hash.get(s[i]);
    if (!count) count = 0;
    count++;
    hash.set(s[i], count);
  }
  for (let i = 0; i < t.length; i++) {
    let count = hash.get(t[i]);
    if (!count) return false;
    count--;
    if (count < 0) return false;
    hash.set(t[i], count);
  }
  return true;
};
```

## 两个数组的交集 \*\*

给你两个整数数组  nums1 和 nums2 ，请你以数组形式返回两数组的交集。返回结果中每个元素出现的次数，应与元素在两个数组中都出现的次数一致（如果出现次数不一致，则考虑取较小值）。可以不考虑输出结果的顺序

```js
function intersect(nums, nums2) {
  if (nums.length < nums2) {
    const temp = nums;
    nums = nums2;
    nums2 = temp;
  }
  const hash = getFreq(nums);
  const result = [];
  nums2.forEach((item) => {
    let count = hash.get(item);
    if (count > 0) {
      result.push(item);
      hash.set(item, count - 1);
    }
  });
  return result;
}

function getFreq(arr) {
  const hash = new Map();
  arr.forEach((item) => {
    let count = hash.get(item);
    if (!count) count = 0;
    hash.set(item, ++count);
  });
  return hash;
}
```

## 快乐数 \*\*

快慢指针

```js
/**
 * @param {number} n
 * @return {boolean}
 */
function getNext(n) {
  let sum = 0;
  while (n > 0) {
    const num = n % 10;
    n = Math.floor(n / 10);
    sum += num * num;
  }
  return sum;
}

function isHappy(n) {
  let slow = n;
  let fast = getNext(n);
  while (fast !== 1 && slow !== fast) {
    slow = getNext(slow);
    fast = getNext(getNext(fast));
  }
  return fast === 1;
}
```

## 删除链表中的节点

编写一个函数，用于 删除单链表中某个特定节点 。在设计函数时需要注意，你无法访问链表的头节点 head ，只能直接访问 要被删除的节点

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} node
 * @return {void} Do not return anything, modify node in-place instead.
 */
var deleteNode = function (node) {
  node.val = node.next.val;
  node.next = node.next.next;
};
```

## 丢失的数字

```js
var missingNumber = function (nums) {
  const n = nums.length;
  const sum = nums.reduce((prev, item) => prev + item, 0);
  return (n * (n + 1)) / 2 - sum;
};
```

## 颠倒二进制位

```js
var reverseBits = function (n) {
  let res = 0;
  for (let i = 0; i < 32 && n > 0; i++) {
    res = ((n & 1) << (31 - i)) | res;
    n = n >>> 1;
  }
  return res >>> 0;
};
```

## 杨辉三角

```js
var generate = function (numRows) {
  if (numRows < 1) return [];
  const result = [];
  let prev = [1];
  result.push(prev);
  for (let i = 1; i < numRows; i++) {
    const arr = [1];
    for (let j = 0; j < prev.length - 1; j++) {
      arr.push(prev[j] + prev[j + 1]);
    }
    arr.push(1);
    result.push(arr);
    prev = arr;
  }
  return result;
};
```

## 最少的硬币数目

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

## 用 Rand7() 实现 Rand10()
```JS 
/**
 * The rand7() API is already defined for you.
 * var rand7 = function() {}
 * @return {number} a random integer in the range 1 to 7
 */
var rand10 = function() {
    while(true) {
            const num = (rand7() - 1) * 7 + rand7(); // 等概率生成[1,49]范围的随机数
            if(num <= 40) return num % 10 + 1; // 拒绝采样，并返回[1,10]范围的随机数
        }
};
```
