// int incr_stack(vector<int> &num) {
//     stack<int> s;
//     int sum = 0;
//     int maxSum = INT_MIN;
//     int n = num.size();
//     for (int i = 0; i<n; i++) {
//         if (s.empty() || num[i] >=num[s.top()]) {//规则1
//             s.push(i);
//         }
//         else {
//             while (!s.empty() && num[s.top()] >=num[i]) {//规则2
//                 int top = s.top();
//                 s.pop();
//                 int tmp=s.empty()? vecSum(num, 0, i-1) : vecSum(num, s.top()+ 1, i - 1);
//                 int curSum = num[top]*tmp;
//                 maxSum = max(curSum, maxSum);
//             }
//             s.push(i);
//         }
//     }
//     while (!s.empty()) {//规则3
//         int top = s.top();
//         s.pop();
//         int tmp=s.empty()? vecSum(num, 0, n-1): vecSum(num, s.top()+ 1, n - 1);
//         int curSum =  num[top]*tmp;
//         maxSum = max(curSum, maxSum);
//     }
//     return maxSum;
// }

// public int calculateIntervalSum(int[] nums) {

//   // 先求前缀和
//   int[] preSums = new int[nums.length + 1];
//   preSums[0] = 0;
//   for (int i = 1; i <= nums.length; i++) {
//        preSums[i] = preSums[i - 1] + nums[i - 1];
//   }

//   // 单调递增栈
//   Stack<Integer> stack = new Stack<>();

//   // 区间乘积结果
//   int res = 0;

//   // 维护单调递增栈, 栈迭代过程中, 需要 "小 中心 小" 模式的组合,
//   // 然后计算出 "[小+1, 中心, 小-1]"区间和与中心最小数之间的乘积.
//   // 其中使用栈维护的递增关系, 找到中心元素前第一个比中心元素小的元素位置,
//   // 这个比中心元素小的元素位置与中心元素之间的元素都是比中心元素更大的
//   // 这就维持了中心元素为区间最小元素的关系.

//   // 同理, 在寻找到中心元素后面第一个比中心元素小的元素位置时, 中心元素与后面
//   // 第一个最小元素之间的元素都是比中心元素大的, 这也维持了中心元素时区间最小元素的关系

//   // 上面找到中心元素左右两边的第一个小元素形成的区间就使得中心元素为该区间的最小元素.

//   for (int i = 0; i < nums.length; i++) {

//       // 获取当前栈顶元素, 以栈顶元素为中心, 后续元素nums[i] 比他小, 那么right = i - 1位置之前元素都是比他大的, 维持了栈顶元素为最小值的区间
//       // 同时,再获取栈顶元素下面一个的元素,因为单调递增栈,因此left = 次栈顶元素index + 1 位置之后的元素都是比栈顶元素大的
//       while (!stack.isEmpty() && nums[stack.peek()] >= nums[i]) {

//           // 弹出栈顶元素作为中心最小元素
//           int smallest = nums[stack.pop()];

//           // 次栈顶元素索引位置, 如果栈顶为空, 意味着左边所有元素都比中心元素大, 所以前缀和从第0个位置计算
//           int subSmallIndex = stack.isEmpty() ? -1 : stack.peek();
//           int right = i - 1;

//           // 左右边界  int left = subSmallIndex + 1;  int right = i - 1;
//           // 计算结果i, 本来是presum[right] - presum[subSmallIndex], 但是前缀和为了处理从0开始计算前缀和的情况往后移动了一位
//           // 因此计算前缀和时 preSums[right + 1] - preSums[subSmallIndex + 1]
//           res = Math.max(res, (preSums[right + 1] - preSums[subSmallIndex + 1]) * smallest);
//       }

//       // 维护单调递增栈, 以栈顶元素为中心的元素已经计算过了所以前面可以弹出.
//       stack.push(i);
//   }

//   // 上面是计算中心元素是通过找到比中心元素小来圈定范围, 但是如果数组部分区间向右一致递增, 一直没有遇到更小元素
//   // 下面就是补充这种情况
//   while (!stack.isEmpty()) {

//       // 右边都是大元素, 因此栈顶元素就是最小元素
//       int smallest = nums[stack.pop()];

//       // 寻找到左边第一个小元素位置 left = subSmallIndex + 1, right = nums.length - 1;
//       int subSmallIndex = stack.isEmpty() ? -1 : stack.peek();

//       // 右边元素都是比当前中心元素大的, 因此right = nums.length - 1
//       int right = nums.length - 1;

//       res = Math.max(res, (preSums[right + 1] - preSums[subSmallIndex + 1]) * smallest);
//   }

//   return res;
// }

// 获取 FP
export const getFP = (): PerformanceEntry | undefined => {
    const [entry] = performance.getEntriesByName('first-paint');
    return entry;
  };
  
  // 初始化 FP 的获取以及返回
  initFP = (): void => {
    const entry = getFP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(metricsName.FP, metrics);
  };
  
  // 获取 FCP
  export const getFCP = (): PerformanceEntry | undefined => {
    const [entry] = performance.getEntriesByName('first-contentful-paint');
    return entry;
  };
  
  // 初始化 FCP 的获取以及返回
  initFCP = (): void => {
    const entry = getFCP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(metricsName.FCP, metrics);
  };