

var maxArea = function(height) {
  let max = 0;
  let i = 0;
  let j = height.length - 1;
  while(i < j) {
    let minHeight = Math.min(height[i], height[j])
    let area = (j - i) * minHeight;
    max = Math.max(max, area)
    if(height[i] < height[j]) {
        i++
    } else {
        j--
    }
  }
  return max
};

function maxArea () { 
  let max = 0;
  let i = 0, j = height.length - 1;
  while (i < j) {
    let minHeight = Math.min(height[i], height[j])
    let area = (j - i) * minHeight;
    max = Math.max(max, area)
    if (height[i] < height[j]) {
      i++;
    } else { 
      j--
    }
  }
}









