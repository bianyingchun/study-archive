// 全排列
function permutate(str) {
  var result = []
  if (str.length === 1) return [str]
  for (let i = 0; i < str.length; i++) {
    //拿到当前的元素
    const left = str[i]
    //除当前元素的其他元素组合
    const rest = str.slice(0, i) + str.slice(i + 1, str.length);
    //上一次递归返回的全排列
    const restResult = permutate(rest)
    //组合在一起
    restResult.forEach(item => {
      result.push(left + item)
    })
  }
  return result
}
// test
// console.log(permutate('abc'))

// http://www.ruanyifeng.com/blog/2011/04/quicksort_in_javascript.html?bsh_bid=124324679
// 快速排序
//此版本空间复杂度较高，不是原地排序
// function quickSort(arr) {
//   if (arr.length <= 1) return arr;
//   const pivotIndex = Math.floor(arr.length / 2);
//   const pivot = arr[pivotIndex];
//   const left = [],
//     right = [];
//   for (let i = 0; i < arr.length; i++) {
//     if (i === pivotIndex) continue;
//     let item = arr[i];
//     if (item < pivot) {
//       left.push(item);
//     } else {
//       right.push(item);
//     }
//   }
//   return quickSort(left).concat([pivot], quickSort(right));
// }
function quickSort(arr) {
  _quickSort(arr, 0, arr.length - 1)
  return arr;
  function _quickSort(arr, low, high) {
    if (low < high) {
      const pivotkey = partition(arr, low, high)
      _quickSort(arr, low, pivotkey - 1)
      _quickSort(arr, pivotkey + 1, high)
    }
  }
  function partition(list, low, high) {
    let pivotkey = list[low]
    while (low < high) {
      while (low < high && list[high] >= pivotkey) high--
      list[low] = list[high]
      while (low < high && list[low] <= pivotkey) low++
      list[high] = list[low]
    }
    list[low] = pivotkey;
    return low
  }
}

// test
// console.log(quickSort([34, 12, 2, 1, 5, 11, 9]));

//冒泡排序
// https://www.cnblogs.com/jyroy/p/11248691.html
function BubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let flag = 1;
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
        flag = 0;
      }
    }
    if (flag) break;
  }
  return arr;
}
// test
// console.log(BubbleSort([34, 12, 2, 1, 5, 11, 9]));

// 选择排序
// 寻找第i小的数的位置，放到i位置上
function selectSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      const temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
  }
  return arr;
}

// test
// console.log(selectSort([34, 12, 2, 1, 5, 11, 9]));
// 归并排序
// https://kaiwu.lagou.com/course/courseInfo.htm?courseId=185#/detail/pc?id=3351
function mergeSort(arr) {
  const temp = []
  _mergeSort(arr, 0, arr.length - 1)
  function _mergeSort(arr, start, end) {
    if (start >= end) return
    const mid = Math.floor((start + end) / 2)
    _mergeSort(arr, start, mid)
    _mergeSort(arr, mid + 1, end)
    _merge(arr, start, mid, end)

  }
  function _merge(arr, start, mid, end) {
    let i = start;
    let j = mid + 1
    let k = start;
    while (i <= mid && j <= end) {
      if (arr[i] < arr[j]) {
        temp[k++] = arr[i++]
      } else {
        temp[k++] = arr[j++]
      }
    }
    while (i <= mid) {
      temp[k++] = arr[i++]
    }
    while (j <= end) {
      temp[k++] = arr[j++]
    }
    for (let i = start; i <= end; i++) {
      arr[i] = temp[i]
    }
  }
}
// test
const arr = [34, 12, 2, 1, 5, 11, 9]
mergeSort(arr);
console.log(arr)
// 插入排序
function InsertionSort(arr) {
  const length = arr.length;
  for (let i = 1; i < length; i++) {
    const temp = arr[i];
    let j;
    for (j = i - 1; j >= 0 && temp < arr[j]; j--) {
      arr[j + 1] = arr[j];
    }
    arr[j + 1] = temp;
  }
  return arr;
}
// test
// console.log(InsertionSort([34, 12, 2, 1, 5, 11, 9]));
// 希尔排序
// 插入排序的改进版。对间隔 gap 为一组的数进行插入排序
// 希尔排序是基于插入排序的以下两点性质而提出改进方法的：
// 插入排序在对几乎已经排好序的数据操作时，效率高，即可以达到线性排序的效率；
// 但插入排序一般来说是低效的，因为插入排序每次只能将数据移动一位；
// 希尔排序的基本思想是：先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，待整个序列中的记录“基本有序”时，再对全体记录进行依次直接插入排序。
function shellSort(arr) {
  const length = arr.length;
  let gap = Math.floor(length);
  while (gap) {
    for (let i = gap; i < length; i++) {
      const temp = arr[i];
      let j;
      for (j = i - gap; j >= 0 && temp < arr[j - 1]; j -= gap) {
        arr[j + gap] = arr[j];
      }
      arr[j + gap] = temp;
      gap = Math.floor(gap / 2);
    }
  }
  return arr;
}
// test
// console.log(InsertionSort([34, 12, 2, 1, 5, 11, 9]));

// 数组展开
// 1.递归

function flat1(arr) {
  let result = [];
  arr.forEach((element) => {
    if (Array.isArray(element)) {
      result = result.concat(flat1(element));
    } else {
      result.push(element);
    }
  });
  return result;
}

// 2.toString

// function flat2 (arr) {
//     // 有缺陷，toString 后无法保持之前的类型
//     return arr.toString().split(',')
// }

// 3.reduce

function flat3(arr) {
  // 本质和 flat1 一样的，都是递归
  return arr.reduce((pre, next) => {
    return pre.concat(Array.isArray(next) ? flat3(next) : next);
  }, []);
}

// 4.rest运算符

function flat4(arr) {
  while (arr.some((item) => Array.isArray(item))) {
    // 相当于 [].concat('1', 2, [3, 4])
    // concat 方法本身就会把参数中的数组展开
    arr = [].concat(...arr);
  }
  return arr;
}
//
// 5.ES6 flat

function flat5(arr = []) {
  // flat() 方法会移除数组中的空项
  return arr.flat(Infinity);
}

// javaScript中的splice函数实现原理。
function mySplice() {
  if (arguments.length <= 1) return;//只有一个参数时直接返回。
  if (arguments.length == 2) {
    //删除第二个参数以后的数据
    var arr = arguments[0];//表示数组
    var index = arguments[1];//表示下标
    arr.length = index;
  }
  if (arguments.length >= 3) {
    var count = arguments[2];
    var arr = arguments[0];//表示数组
    var index = arguments[1];//表示下标
    //删除指定数量
    //先判断数量是否超出了长度或者为负 
    if (count < 0) return;
    //如果删除数量超过了数组长度
    if (index + count >= arr.length) {
      arr.length = index;//直接把给定下标元素以后的全部删除	
    } else {//删除的元素个数在范围内。
      // 删除指定数量
      for (var i = index; i < arr.length - count; i++) {
        arr[i] = arr[i + count];//数组元素往前挪count位。
      }
      //删除长度
      arr.length -= count;
    }
    //插入功能
    if (arguments.length > 3) {
      // 要插入的数量
      var number = arguments.length - 3;
      arr.length += number;//进行扩容
      // 将原来的数据往后挪number个位置
      for (var i = arr.length - 1; i > index; i--) {
        arr[i] = arr[i - number];
      }
      //在index处添加数据
      for (var j = 0; j < number; j++) {
        arr[j + index] = arguments[j + 3];
      }
    }
  }
  return arr;
}