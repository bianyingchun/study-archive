// [学会如何实现一个比较完善的 delay 函数](https://juejin.cn/post/7042461373904715812)
const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createAbortError = () => {
    const error = new Error('Delay aborted');
    error.name = 'AbortError';
    return error;
};

const createDelay = ({ clearTimeout: defaultClear, setTimeout: set, willResolve }) => (ms, { value, signal } = {}) => {
    if (signal && signal.aborted) {
        return Promise.reject(createAbortError());
    }

    let timeoutId;
    let settle;
    let rejectFn;
    const clear = defaultClear || clearTimeout;

    const signalListener = () => {
        clear(timeoutId);
        rejectFn(createAbortError());
    };

    const cleanup = () => {
        if (signal) {
            signal.removeEventListener('abort', signalListener);
        }
    };

    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
            cleanup();
            if (willResolve) {
                resolve(value);
            } else {
                reject(value);
            }
        };

        rejectFn = reject;
        timeoutId = (set || setTimeout)(settle, ms);
    });

    if (signal) {
        signal.addEventListener('abort', signalListener, { once: true });
    }

    delayPromise.clear = () => {
        clear(timeoutId);
        timeoutId = null;
        settle();
    };

    return delayPromise;
};

const createWithTimers = clearAndSet => {
    const delay = createDelay({ ...clearAndSet, willResolve: true });
    delay.reject = createDelay({ ...clearAndSet, willResolve: false });
    delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    return delay;
};

const delay = createWithTimers();
delay.createWithTimers = createWithTimers;

module.exports = delay;


// use
(async () => {
    const AbortController = require('abort-controller')

    const abortController = new AbortController();

    setTimeout(() => {
        abortController.abort()
    }, 500)

    try {
        await delay6(1000, { signal: abortController.signal });
    } catch (error) {
        // 500 milliseconds later
        console.log(error.name)
        //=> 'AbortError'
    }
})()