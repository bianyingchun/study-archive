import { reactive, createApp, App, h } from 'vue'
import Comp from './index.vue'

const state = reactive({
    show: false,
    text: ''
})

function hide() {
    state.show = false
}

export function popup(text = '') {
    return new Promise < void> (resolve => {
        state.text = text
        state.show = true
        function onCancel() {
            //   reject()
            hide()
        }
        function onEnsure() {
            resolve()
            hide()
        }
        const popupInstance = createApp({
            setup() {
                return () =>
                    h(Comp, {
                        show: state.show,
                        text: state.text,
                        hide,
                        onCancel,
                        onEnsure
                    })
            }
        })
        const el = document.createElement('div')
        document.body.appendChild(el)
        popupInstance.mount(el)
    })
}

export default {
    install: (app: App) => {
        app.config.globalProperties.$popup = popup
        app.provide('popup', popup)
    }
}
// vue2.x 写法
// import Vue from "vue";
const Vue = require("vue");
import PopupTemplate from "./index.vue";

const PopupConstructor = Vue.extend(PopupTemplate); //返回一个实例创建的构造器，但实例构造器需要进行挂载到页面中

let Popup = function (text) {
    return new Promise((resolve, reject) => {
        //返回一个promise，进行异步操作，成功时返回，失败时返回
        let popupDom = new PopupConstructor({
            el: document.createElement("div"),
            data: {
                showFlag: true,
                text,
            },
        });

        //在body中动态创建一个div元素，之后此div将会替换成整个vue文件的内容
        //此时的confirmDom通俗讲就是相当于是整个组件对象，通过对象调用属性的方法来进行组件中数据的使用
        //可以通过$el属性来访问创建的组件实例
        document.body.appendChild(popupDom.$el);
        //此时进行创建组件的逻辑处理
        // confirmDom.popupDom=text      
        //将需要传入的文本内容传给组件实例
        popupDom.ensure = () => {
            //箭头函数，在（）和{}之间增加=>,且去掉function
            resolve(); //正确时返回的操作
            popupDom.showFlag = false;
        };
        popupDom.cancel = () => {
            reject(); //失败时返回的操作
            popupDom.showFlag = false;
        };
    });
};

//将逻辑函数进行导出和暴露
const popUpPlugin = {
    install: function (Vue) {
        Vue.prototype.$popup = Popup;
        // Vue.popup = Popup;
        window.util = window.util ? window.util : {};
        window.util.popup = Popup;
    },
};

export default popUpPlugin;
//
