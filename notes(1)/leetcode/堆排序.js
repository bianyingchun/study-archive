/*
## 基本思想
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

sort([3, 4, 8, 0, 1, 5, 6], 3);
