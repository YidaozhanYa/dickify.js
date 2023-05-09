import {dickify} from "./src/dickify.js"

console.log(
    dickify(`
        let a = 1
        let b = 2
        const c = a + b
        console.log(a + b)
        document.getElementById('app').innerHTML = c
    `)
)