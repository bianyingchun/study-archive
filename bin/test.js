<<<<<<< HEAD
  
=======
{/* <body>
    <button id="expire1">过期设置(暴力法)</button>
    <button id="expire2">过期设置(innerHTMl)</button>
    <ul id="wrap"></ul>
</body> */}

function getExpireKey() {
    let keys = []

    while (keys.length < 100) {
        let randomKey = Math.floor(Math.random() * 1000)
        if (keys.indexOf(randomKey) === -1) {

        }
    }
}

const el = document.createDocumentFragment()
let allKeys = []
for (let i = 0; i < 1000; i++) {
    let item = document.createElement('li')
    li.dataset.key = i;
    li.innerHTML = i;
    el.appendChild(item)
}
>>>>>>> ab4825b4128c3e68a80d122d72468dd5dba1a18e
