1.小例子：
  Mock.mock('http://123.com',{
      'name|3':'fei',
      'age|20-30':25,
  })

  $.ajax({
      url:'http://123.com',
      dataType:'json',
      success:function(e){
         console.log(e)
      }
  })
在这个例子中我们截获地址为http://123.com返回的数据是一个拥有name和age的对象，那么ajax返回的数据就是Mock定义的数据

2.数据模板定义规范
  数据模板中的每个属性由 3 部分构成：属性名name、生成规则rule、属性值value：
  'name|rule':'value'
  rule有如下几种格式
    'name|min-max': value
    'name|count': value
    'name|min-max.dmin-dmax': value
    'name|min-max.dcount': value
    'name|count.dmin-dmax': value
    'name|count.dcount': value
    'name|+step': value
    生成规则 的 含义 需要依赖 属性值的类型 才能确定。
    属性值 中可以含有 @占位符。
    属性值 还指定了最终值的初始值和类型。
  1.属性值是string
    1.'name|min-max' : string// 生成一个字符串，重复次数 >= min,<= max
      'lastName|2-5':'ha' 

    2.'name|count': string //生成一个字符串，重复次数为count
      'lastName|4':'ha' //hahahaha
  2.属性值是number
    1.'name|min-max': number //生成一个>= min <=max的数字
      'age|2-10':5 //生成一个大于等于 20、小于等于 30 的整数，属性值 5 只是用来确定类型

    2.'name|+1': number //属性值自动加一，初始值为number
      'big|+1':0 //属性值自动加 1，初始值为 0，以后每次请求在前面的基础上+1

    3.'name|min-max.dmin-dmax': number  // 生成一个浮点数，整数部分>= min<= max，小数部分保留 dmin 到 dmax位。
      'number2|123.1-10': 1, // 123.2
      'number1|1-100.1-10': 1, //22.22
  3.属性值是boolean
    1.'name|1': boolean //随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。

    2.'name|min-max': boolean//随机生成一个布尔值，值为 value 的概率是 min / (min + max)，值为 !value 的概率是 max / (min + max)。

  4.属性值是对象：var obj={'host':'www.baidu','port':'12345','node':'selector'}
    1.'name|count': object  //从属性值 object中随机选取 count个属性。
    'life1|2': obj,  // life1:{'host':'www.baidu','port':'12345'}

    2.'name|min-max': object  //从属性值 object中随机选取 min到 max 个属性
　　'life1|1-2': obj, //life1:{'host':'www.baidu',}

  5.属性值是数组：var arr=['momo','yanzi','ziwei']
    1.'name|1': array   //从属性值 array中随机选取 1 个元素，作为最终值
　　 'friend1|1':arr, //从数组 arr 中随机选取 1 个元素，作为最终值。

　　2.'name|+1': array   //从属性值 array中顺序选取 1 个元素，作为最终值。
　　 'friend2|+1':arr, //从属性值 arr 中顺序选取 1 个元素，作为最终值，第一次就是'momo',第二次请求就是'yanzi'

　　3.'name|count': array  // 通过重复属性值 array生成一个新数组，重复次数为 count
　　 'friend3|2':arr, //重复arr这个数字2次作为这个属性值，得到数据应该是['momo','yanzi','ziwei','momo','yanzi','ziwei']

　　4.'name|min-max': array //通过重复属性值 array生成一个新数组，重复次数大于等于 min，小于等于 max
　　 'friend3|2-3':arr,//通过重复属性值 arr 生成一个新数组，重复次数大于等于 2，小于等于 3
  6. 属性值是函数 Function 
    'name': function //执行函数 function，取其返回值作为最终的属性值，函数的上下文为属性 'name' 所在的对象。

  7.属性值是正则表达式 RegExp
  'name': regexp //根据正则表达式 regexp 反向生成可以匹配它的字符串。用于生成自定义格式的字符串。
    // Mock.mock({
    //     'regexp1': /[a-z][A-Z][0-9]/,
    //     'regexp2': /\w\W\s\S\d\D/,
    //     'regexp3': /\d{5,10}/
    // })
    // =>
    // {
    //     "regexp1": "pJ7",
    //     "regexp2": "F)\fp1G",
    //     "regexp3": "561659409"
    // }

3.方法
  1.Mock.mock( [rurl], [rtype], template|function( options ){...} )//生成模板数据
    1.rurl:表示需要拦截的 URL，可以是 URL 字符串或 URL 正则。例如 /\/domain\/list\.json/、'/domian/list.json'
    2.rtype:表示需要拦截的 Ajax 请求类型。例如 GET、POST、PUT、DELETE 等。
    3.template:表示数据模板，可以是对象或字符串。例如 { 'data|1-10':[{}] }、'@EMAIL'。
    4.function(options){..}:表示用于生成响应数据的函数。options指向本次请求的 Ajax 选项集，含有 url、type 和 body 三个属性

  2.Mock.setup( settings )//配置拦截 Ajax 请求时的行为。支持的配置项有：timeout。
    Mock.setup({
        timeout: '200-600'
    })

  3.Mock.Random 是一个工具类，用于生成各种随机数据。
   Mock.Random 的方法在数据模板中称为『占位符』，书写格式为 @占位符(参数 [, 参数]) 。
    1.Basic
      //随机布尔值
      1.Random.boolean([min,max,current])//min；参数current出现的概率，max:!current 概率
      //随机自然数
      2.Random.natural( [min, max] )//
      //随机整数
      3.Random.integer( [min, max]) 
      //随机浮点数
      Random.float( [min, max, dmin, dmax ])
      //随机字符
      4.Random.character( [pool])
        pool字符串。表示字符池，将从中选择一个字符返回。
        如果传入了 'lower' 或 'upper'、'number'、'symbol'，表示从内置的字符池从选取：
        {
            lower: "abcdefghijklmnopqrstuvwxyz",
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            number: "0123456789",
            symbol: "!@#$%^&*()[]"
        }
        //随机字符串
      5.Random.string()
        Random.string( length )
        Random.string( pool, length )
        Random.string( min, max )
        Random.string( pool, min, max )
        length指定长度，min最低长度，max最大长度，pool字符池

        //返回一个随机长度的整型数组
      6.Random.range( start?, stop, step? )
        Random.range( stop )
        Random.range( start, stop )
        Random.range( start, stop, step )
        start:起始整型值
        end:结束整型值
        step:步长 默认为1

    2.Date
      //随机日期字符串
      1.Random.date( format? )
      fomat指示生成的日期字符串的格式。默认值为 yyyy-MM-dd,全部类型见https://github.com/nuysoft/Mock/wiki/Date
      //返回一个随机的时间字符串,fommat默认HH:mm:ss。
      2.Random.time( format? )
      
      //返回一个随机的时间字符串,fommat默认 yyyy-MM-dd HH:mm:ss。
      3.Random.datetime( format? )
      //返回当前时间字符串，unit为单位
      Random.now( unit?, format? )

    3.image
      1.Random.image( size?, background?, foreground?, format?, text? )
        size:宽高
        background:背景色 默认#000
        foreground:前景色[文字颜色] 默认#fff
        format:图片格式 默认值为 'png'，可选值包括：'png'、'gif'、'jpg'
        text:文字
      //生成一段随机的 Base64 图片编码。
      2.Random.dataImage( size?, text? )//背景色随机

    4.color
      Random.color()//#ffffff
      Random.hex()//#ffffff
      Random.rgb()//'rgb(2,3,4)'
      Random.rgba()//rgba(2,3,4,.2)
      Random.hsl()//hsl(345, 82, 71)

    5.text
      //随机生成一段文本，参数指定句子的个数
      1.Random.paragraph( min?, max? )
        Random.paragraph( len?)
      //随机生成一段中文文本，参数指定句子的个数
      2.Random.cparagraph( min?, max? )
        Random.cparagraph( len?)
      //随机生成一个句子，第一个单词的首字母大写。参数指示句子中单词个数
      3.Random.sentence( min?, max? )
        Random.sentence( len )
      //随机生成一段中文文本
      4.Random.csentence()
        Random.csentence( len )
        Random.csentence( min, max )
      //随机生成一个单词。参数指示单词中字符的个数
      5.Random.word( min?, max? )
        Random.word()
        Random.word( len )
        Random.word( min, max )
      
      //随机生成一个汉字。
        6.Random.cword( pool?, min?, max? )
        Random.cword( pool?, length? )
        //随机生成一句标题，其中每个单词的首字母大写
      7.Random.title( min?, max? )
        Random.title()
        Random.title( len )
        Random.title( min, max )
        //随机生成一句中文标题
        Random.ctitle( min?, max? )
    6.name
      1.Random.first()//随机生成一个常见的英文名。

      2.Random.first()
      // => "Nancy"
      3.Random.last()//随机生成一个常见的英文姓。
      // => "Martinez"
      4.Random.name( middle ? )//随机生成一个常见的英文姓名。middle指示是否生成中间名。
      // => "Larry Wilson"
      5.Random.cfirst()//随机生成一个常见的中文名。
      // => "曹"
      6.Random.clast()//随机生成一个常见的中文姓。
      // => "艳"
      7.Random.cname()//随机生成一个常见的中文姓名。
      // => "袁军"
    7.web
      1.Random.url( protocol?, host? )//随机生成一个 URL。
      2.Random.protocol()//随机生成一个 URL 协议
      3.Random.domain()//随机生成一个域名
      4.Random.tld()//随机生成一个顶级域名（Top Level Domain）。
      5.Random.email( domain? )//随机生成一个邮件地址。domain指定邮件地址的域名。例如 nuysoft.com
      6.Random.ip()//随机生成一个 IP 地址。

    8.address
      Random.region()//随机生成一个（中国）大区。
      Random.province()//随机生成一个（中国）省（或直辖市、自治区、特别行政区）。
      Random.city( prefix? ) //随机生成一个（中国）市。prefix布尔值。指示是否生成所属的省
      Random.county( prefix? ) //随机生成一个（中国）县。指示是否生成所属的省、市。
      Random.zip()      //随机生成一个邮政编码（六位数字）。

    9.helper
    Random.capitalize( word )//把字符串的第一个字母转换为大写。
    Random.upper( str )
    Random.lower( str )
    Random.pick( arr )//从数组中随机选取一个元素，并返回。
    Random.pick(['a', 'e', 'i', 'o', 'u'])
    Random.shuffle( arr )//打乱数组中元素的顺序，并返回

    10.Miscellaneous
    1.Random.guid()//随机生成一个 GUID。
    2.Random.id()//随机生成一个 18 位身份证。
    3.Random.increment( step? )//生成一个全局的自增整数。step整数自增的步长。默认值为 1。
  