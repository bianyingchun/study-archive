function dailyTemperatures(temperatures) {
  const len = temperatures.length;
  const res = new Array(len).fill(0);
  const stack = []
  for (let i = 0; i < len; i++) {
    while (stack.length && temperatures[stack.length - 1] < T[i]) { 
      stack.pop();
    }
  }
 
  return res;
}
