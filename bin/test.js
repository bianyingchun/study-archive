
var count = 0;  
function show(arr) {  
    document.write("P<sub>" + ++count + "</sub>: " + arr + "<br />");  
}  
function seek(index, n) {  
    var flag = false, m = n; //flag为找到位置排列的标志，m保存正在搜索哪个位置  
    do {  
        index[n]++;  
        if (index[n] == index.length) //已无位置可用  
            index[n--] = -1; //重置当前位置，回退到上一个位置  
        else if (!(function () {  
            for (var i = 0; i < n; i++)  
                if (index[i] == index[n]) return true;  
            return false;  
        })()) //该位置未被选择  
            if (m == n) //当前位置搜索完成  
                flag = true;  
            else 
                n++;  
    } while (!flag && n >= 0)  
    return flag;  
}  
function perm(arr) {  
    var index = new Array(arr.length);  
    for (var i = 0; i < index.length; i++)  
        index[i] = -1;  
    for (i = 0; i < index.length - 1; i++)  
        seek(index, i);  
    while (seek(index, index.length - 1)) {  
        var temp = [];  
        for (i = 0; i < index.length; i++)  
            temp.push(arr[index[i]]);  
        show(temp);  
    }  
}  
perm(["e1", "e2", "e3", "e4"]);  

