// 使用 Mock
var Mock = require('mockjs')

const name_arr = ['美团','拼多多','淘宝'];
const city_arr = ['上海','深圳','北京','杭州','广州','南京'];
const obj = {
          'host':'www.baidu',
          'port':'12345',
          'node':'selector'
        }
const data = Mock.mock({

  'list|5-10':[{
    'id|+1':0,
    'company|+1':name_arr,
    'setup_year|2000-2019':2015,
    'staff_num|1000-5000':2000,  
    'value|10-20.1-4':12.33,
    'is_runing|1':false
    }
  ]
})
console.log(JSON.stringify(data))