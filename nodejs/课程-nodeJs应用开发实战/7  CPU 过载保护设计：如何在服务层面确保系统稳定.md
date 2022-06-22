## cpu 过载保护

### 1.什么是过载保护

这个词最早出现是在电路方面，在出现短路或者电压承载过大时，会触发电源的过载保护设备，该设备要不熔断、要不跳闸切断电源。

在服务端也是相似的原理，首先我们需要设计一个过载保护的服务，在过载触发时，切断用户服务直接返回报错，在压力恢复时，正常响应用户请求。

### 2.CPU 过载保护

在 Node.js 中最大的瓶颈在于 CPU，因此我们需要针对 CPU 的过载进行保护。当 CPU 使用率超出一定范围时，进行请求熔断处理，直接报错返回，接下来我们来看下具体的实现原理。

### 实现方案

#### 1.获取 CPU 使用率

Node.js 进程启动后，都会绑定在单核 CPU 上。假设机器有 2 个 CPU 内核，我们只启动了一个进程，那么在没有其他外在因素影响的情况下，Node.js 即使跑满 CPU，也最多只占用了 50% 的总机器的 CPU 利用率。因此这里我需要获取该进程 CPU 使用率。

```javascript
const util = require('util');
const exec = util.promisify(require('child_process').exec);
/**
 * @description 使用 ps 命令获取进程信息
 */

async _getPs() {
    // 命令行
    const cmd = `ps -p ${process.pid} -o pid,rss,vsz,pcpu,comm`;
    // 获取执行结果
    const { stdout, stderr } = await exec(cmd);
    if(stderr) { // 异常情况
      console.log(stderr);
      return false;
    }
    return stdout;
}

/**

 * @description 获取进程信息

 */

async _getProcessInfo() {
    let pidInfo, cpuInfo;
    if (platform === 'win32') { // windows 平台
      pidInfo = await this._getWmic();
    } else { // 其他平台 linux & mac
      pidInfo = await this._getPs();
    }

    cpuInfo = await this._parseInOs(pidInfo);



    if(!cpuInfo) { // 异常处理

      return false;

    }

    /// 命令行数据，字段解析处理

    const pid = parseInt(cpuInfo.pid, 10);

    const name = cpuInfo.name.substr(cpuInfo.name.lastIndexOf('/') + 1);

    const cpu = parseFloat(cpuInfo.cpu);

    const mem = {

    private: parseInt(cpuInfo.pmem, 10),

      virtual: parseInt(cpuInfo.vmem, 10),

      usage: cpuInfo.pmem / totalmem * 100

    };



    return {

      pid, name, cpu, mem

    }

}

```

#### 应尽量避免影响服务性能；

由于在 Node.js 就只有一个主线程，因此**必须严格减少框架在主线程的占用时间，控制框架基础模块的性能损耗，从而将主线程资源更多服务于业务，增强业务并发处理能力。**为了满足这点，我们需要做两件事情：

1. 只处理需要的数据，因此在第一步获取 CPU 使用率的基础上，我们需要缩减一些字段，只获取 CPU 信息即可；

2. 定时落地 CPU 信息到内存中，而非根据用户访问来实时计算。

```javascript
// maxOverloadNum 表示最大持续超出负载次数，当大于该值时才会判断为超出负载了；

// maxCpuPercentage 表示单次 CPU 使用率是否大于该分位值，大于则记录一次超载次数。
async check(maxOverloadNum =30, maxCpuPercentage=80) {

     /// 定时处理逻辑

     setInterval(async () => {
        try {
            const cpuInfo = await this._getProcessInfo();
            if(!cpuInfo) { // 异常不处理
                return;
            }
            if(cpuInfo > maxCpuPercentage) {
                overloadTimes++;
            } else {
                overloadTimes = 0;
                return isOverload = false;
            }

            if(overloadTimes > maxOverloadNum){

                isOverload = true;

            }

        } catch(err){

            console.log(err);

            return;

        }

    }, 2000);

}
// 最后我们再看下应用的地方，如下所示，整个代码在 GitHub 项目的 index.js 文件中。
cpuOverload.check().then().catch(err => {
console.log(err)
});

```

#### 3.概率丢弃

什么时候触发过载，能否减少误处理情况；
在获取 CPU 值以后，我们可以根据当前 CPU 的情况进行一些丢弃处理，但是应尽量避免出现误处理的情况。比如当前 CPU 某个时刻出现了过高，但是立马恢复了，这种情况下我们是不能进行丢弃请求的，只有当 CPU 长期处于一个高负载情况下才能进行请求丢弃。

即使要丢请求，也需要根据概率来丢弃，而不是每个请求都丢弃，我们需要根据三个变量：

- overloadTimes
  用 o 表示，指 CPU 过载持续次数，该值越高则丢弃概率越大，设定取值范围为 0 ~ 10；

- currentCpuPercentage
  用 c 表示，指 CPU 当前负载越高，占用率越大则丢弃概率越大，这里设定范围为 0 ~ 10，10 代表是最大值 100% ；

- baseProbability
  用 b 表示，是负载最大时的丢弃概率，取值范围为 0 ~ 1。

虽然都是正向反馈，但是三者对结果影响是不同的：

- overloadTimes 可以看作是直线型，但是影响系数为 0.1；

- baseProbability 我们也可以看作是直线型；

- currentCpuPercentage 则是一个指数型增长模型

P = (0.1 _ o) _ Math.exp(c) / (10 _ Math.exp(10)) _ b

```javascript
/**

 * @description 获取丢弃概率

 */

_setProbability() {

     let o = overloadTimes >= 100 ? 100 : overloadTimes;

     let c = currentCpuPercentage >= 100 ? 10 : currentCpuPercentage/10;

     currentProbability = ((0.1 * o) * Math.exp(c) / maxValue * this.baseProbability).toFixed(4);

}

```

为了性能考虑，我们会将上面的 10 \* Math.exp(10) 作为一个 const 值，避免重复计算，其次这个方法是在 check 函数中调用，2 秒处理一次，避免过多计算影响 CPU 性能。然后我们再来实现一个获取随机数的方法

最后我们在 isAvailable 函数中判断当前的随机数是否大于等于概率值，如果小于概率值则丢弃该请求，大于则认为允许请求继续访问

```javascript
/**

 * @description 获取一个概率值

 */

_getRandomNum(){

    return Math.random();

}

isAvailable(path, uuid) {

    if(isOverload) {

      if(this._getRandomNum() <= this._getProbability()) {

          return false;

      }

      return true;

    }

    return true;

}
```

#### 4.优先级处理

这里我们需要考虑 2 个点：

1. 优先级问题，因为有些核心的请求我们不希望用户在访问时出现丢弃的情况，比如支付或者其他核心重要的流程；
   优先级的实现

优先级实现最简单的方式，就是接受一个白名单参数，如果设置了则会在白名单中的请求通过处理，无须校验，如果不在才会进行检查，代码实现如下：

```javascript
isAvailable(path, uuid) {
    if(this.whiteList.includes(path)) {
        return true;
    }
    if(isOverload) {
        if(this._getRandomNum() <= currentProbability) {
            return false;
        }
        return true;
    }
    return true;
}
```

2. 其次对于一个用户，我们允许了该用户访问其中一个接口，那么其他接口在短时间内应该也允许请求，不然会导致有些接口响应成功，有些失败，那么用户还是无法正常使用。

```javascript

```
