# Dickify.js -- Dickful JavaScript Obfuscator

Obfuscate your js for the browser. 

Not suitable for use in production environments.

> Tips: This package is still in the experimental stage, and the carriage return in the generated script still needs to be deleted manually.

### Demo

```javascript
let a = 1
let b = 2
const c = a + b
console.log(a + b)
document.getElementById('app').innerHTML = c
```

```javascript
let b = ['Y29uc29sZQ==','bG9n','ZG9jdW1lbnQ=','Z2V0RWxlbWVudEJ5SWQ=','YXBw','aW5uZXJIVE1M'];b=b.map(v=>atob(v));let A=1;let B=2;const C=A+B;window[b[0]][b[idx2]](A+B);window[b[2]][b[idx2]](b[4])[b[idx2]]=C

```

