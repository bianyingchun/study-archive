var coinChange = function(coins, amount) {
  let dp = new Array(amount+1).fill(Infinity)
  dp[0] = 0;
  for (let i=0;i<= amount;i++) {
      for (let coin of coins) {
          if (i - coin >= 0) {
              dp[i] = Math.min(dp[i], dp[i-coin]+1)
          }
      }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
};



// 状态方程

// dp[i] = Math.min(dp[i - coin] + 1, dp[i - coin] + 1, ...)









