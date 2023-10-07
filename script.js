const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const processArgv2 = process.argv[2].toString();

// 덧셈
function bigNumberAdd(a, b) {
    a = a.toString();
    b = b.toString();
    let result = '', carry = 0;
    let len = Math.max(a.length, b.length);
    a = a.padStart(len, '0');
    b = b.padStart(len, '0');
    for (let i = len - 1; i >= 0; i--) {
        let sum = Number(a[i]) + Number(b[i]) + carry;
        result = (sum % 10) + result;
        carry = Math.floor(sum / 10);
    }
    if (carry > 0) result = carry + result;
    return result;
}

// 뺄셈
function bigNumberSubtract(a, b) {
    a = a.toString();
    b = b.toString();
    if (a == b) {
        return "0";
    }
    let result = '', borrow = 0;
    let len = Math.max(a.length, b.length);
    a = a.padStart(len, '0');
    b = b.padStart(len, '0');
    for (let i = len - 1; i >= 0; i--) {
        let diff = Number(a[i]) - Number(b[i]) - borrow;
        if (diff < 0) {
            diff += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        result = diff + result;
    }
    if (borrow > 0) result = '-' + bigNumberSubtract(b, a);
    return result.replace(/^0+/, '');
}

let resultJSON = JSON.parse(fs.readFileSync(path.join(__dirname, `result.json`), 'utf8'));
let startNum = resultJSON["a + b"];
let endNum = bigNumberAdd(startNum, processArgv2);
let a = "0";
let b = "0";

for (let i = "0"; bigNumberSubtract(processArgv2, i).includes("-") == false && bigNumberSubtract(processArgv2, i) != "0"; i = bigNumberAdd(i, "1")) {
      if (Math.random() < 0.5) {
          a = bigNumberAdd(a, "1");
      } else {
          b = bigNumberAdd(b, "1");
      }
}

resultJSON["a"] = bigNumberAdd(resultJSON["a"], a);
resultJSON["b"] = bigNumberAdd(resultJSON["b"], b);
resultJSON["a + b"] = bigNumberAdd(resultJSON["a + b"], processArgv2);
let a_Minus_b = bigNumberSubtract(resultJSON["a"], resultJSON["b"]);
resultJSON["| a - b |"] = a_Minus_b[0] == '-' ? a_Minus_b.slice(1) : a_Minus_b;

console.log("============================");
console.log(resultJSON);
console.log("============================");
console.log("a = ${a}\nb=${b}\n(| a - b | = ${a_Minus_b[0] == '-' ? a_Minus_b.slice(1) : a_Minus_b})\na + b = ${processArgv2}");
console.log("============================")

a_Minus_b = bigNumberSubtract(a, b);

execSync(`git pull -f`);
fs.writeFileSync('result.json', JSON.stringify(resultJSON, null, 2));
execSync(`git config user.name "github-actions[bot]" && git config user.email "github-actions[bot]@users.noreply.github.com"`);
let commitMessage = `( ${bigNumberAdd(startNum, '1')} ~ ${endNum} ) a = ${a}, b = ${b} ( | a - b | = ${a_Minus_b[0] == '-' ? a_Minus_b.slice(1) : a_Minus_b} )`;
execSync(`git add . && git commit -m "${commitMessage}" && git push`);
