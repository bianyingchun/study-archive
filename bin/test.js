function permutate(str) {
    var result = []
    if (str.length === 1) return [str]
    for (let i = 0; i < str.length; i++) {
        const left = str[i]
        const rest = str.slice(0, i) + str.slice(i + 1)
        const restResult = permutate(rest)
        restResult.forEach(item => {
            result.forEach(left + item)
        })
    }
    return result;
}

function patition(list, low, high) {
    let pivokey = list[low]
    while (low < high) {
        while (low < high && list[high] >= pivokey) high--
        list[low] = list[high]
        while (low < high && list[low] <= pivokey) low++
        list[high] = list[low]
    }
    list[low] = pivokey
    return low
}

function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pivokey = patition(arr, low, high)
        quickSort(arr, low, pivokey - 1)
        quickSort(arr, pivokey + 1, high)
    }
}

BubbuleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                const temp = arr[j + 1]
                arr[j + 1] = arr[j]
                arr[j] = temp;

            }
        }
    }
}