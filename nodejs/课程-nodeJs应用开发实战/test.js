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
console.log(permutate('abc'))


function quickSort() {

    function partition(arr, low, high) {
        while (low < high) {
            while (low < high && arr[high] >= pivokey) high--
            list[low] = list[high]
            while (low < high && list[low] <= pivotkey) low++
            list[high] = list[low]
        }
    }
}