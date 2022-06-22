class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n <= 1) return 0;


        //，
        //
        //
        //
        //
        //
        int[][] dp = new int[n][3];
        dp[0][0] = 0;
        dp[0][1] = -1 * prices[0];
        dp[0][2] = 0;



        for (int i = 1; i < n; i++) {//从[1]...[n-1]
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][2]);
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]);
            dp[i][2] = dp[i - 1][1] + prices[i];

        }




        return Math.max(dp[n - 1][0], dp[n - 1][2]);




    }
}

/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
    const dp = new Array(prices.length).fill(new Array(4));
    dp[0][0] = 0;//不持有股票，没卖出的
    dp[0][1] = 0;//不持有股票，卖出去了
    dp[0][2] = -1 * prices[0];//持有股票，今天买入；
    dp[0][3] = -1 * prices[0];//持有股票，非今天买入的；
    for (let i = 1; i < prices.length; i++) {
        dp[i][0] = max(dp[i - 1][0], dp[i - 1][1]);//前一天不持有股票的两种情况的最大值
        dp[i][1] = max(dp[i - 1][2], dp[i - 1][3]) + prices[i];//今天卖出股票，来着前一天持有股票的最大值+pr
        dp[i][2] = dp[i - 1][0] - prices[i];//今天买入股票，这前一天一定没有卖出股票
        dp[i][3] = max(dp[i - 1][2], dp[i - 1][3]);//今天没买股票，却持有股票，前一天继承来的,有两种情况
    }
    return max(dp[prices.length - 1][0], dp[prices.length - 1][1]);
};