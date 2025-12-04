---
date: 2021-03-02
title: 一文带你快速入门JavaScript
category: JavaScript 
tags:
- JavaScript
- 前端
---

# 一文带你快速入门JavaScript
JavaScript（简称 JS）是一种高级、解释型、动态的编程语言，最初由 Netscape 在 1995 年开发，用于在网页上实现交互功能。它是 Web 前端三大核心技术之一（HTML + CSS + JavaScript）。

常见的运行环境为Nodejs和浏览器。主要应用有： 
- 动态网页交互
- 前端框架开发
- 后端开发
- 脚本工具及自动化

## 数据类型
js一共有7种数据类型，三种基本数据类型：**数值，字符串，布尔**，两种派生数据类型：**数组，对象**，两种特殊数据类型：**undefined，null**

### 严格模式

启用strict模式的方法是在JavaScript代码的第一行写上：
```js
'use strict';
```
严格模式是为了防止没有使用var声明的变量变成全局变量

### 数值
数值类型共有以下几种：整数、浮点数、负数、NaN、Infinity

其中NaN表示 not a number，无法计算结果用NaN表示，例：0/0 结果是NaN

Infinity表示无穷大，当数值超过js的Number所能表示的最大值时，就表示为Infinity。例如以0为分子：3/0

### 字符串
用单引号或者双引号包括起来的字符表示就是字符串。

1. 字符串转义
字符串可以用转义字符\来标识
ASCII字符可以以\x##形式的十六进制表示
还可以用\u####表示一个Unicode字符
2. 多行字符串
除了使用换行符，可以使用反引号将字符括起来。例：
\`多行
字符串\`
3. 字符串拼接
使用 “+”号
var name = '小明';
var age = 20;
var message = '你好, ' + name + ', 你今年' + age + '岁了!';
alert(message);
4. 使用变量替换字符串
使用反引号 \`：
var name = '小明';
var age = 20;
var message = \`你好, \${name}, 你今年\${age}岁了!\`;
alert(message);
5. 获取字符串某个指定位置的字符
var s = 'Hello, world!';
s[0]; // 'H'
s[6]; // ' '
s[7]; // 'w'
s[12]; // '!'
s[13]; // undefined 超出范围的索引不会报错，但一律返回undefined
6. 字符串转大小写
var s = 'Hello';
s.toUpperCase(); // 返回'HELLO'
var s = 'Hello';
s.toLowerCase(); // 返回'hello'
7. 搜索指定字符串
var s = 'hello, world';
s.indexOf('world'); // 返回7
s.indexOf('World'); // 没有找到指定的子串，返回-1
8. 截取字符串
var s = 'hello, world'
s.substring(0, 5); // 从索引0开始到5（不包括5），返回'hello'
s.substring(7); // 从索引7开始到结束，返回'world'

### 布尔
有true、false两种值。一般用来做判断

### null和undefined
null表示一个空的值，而undefined表示值未定义。

### 数组
数组是一组按顺序排列的集合，集合的每个值称为元素。js的数组可以包含任意数据类型，并通过索引来访问每个元素。

1. 获取数组长度
var arr = [1, 2, 3.14, 'Hello', null, true];
arr.length; // 6
请注意，直接给Array的length赋一个新的值会导致Array大小的变化：
	```js
	var arr = [1, 2, 3];
	arr.length; // 3
	arr.length = 6;
	arr; // arr变为[1, 2, 3, undefined, undefined, undefined]
	arr.length = 2;
	arr; // arr变为[1, 2]
	```
2. 数组赋值
Array可以通过索引把对应的元素修改为新的值，因此，对Array的索引进行赋值会直接修改这个Array
	```js
	var arr = ['A', 'B', 'C'];
	arr[1] = 99;
	arr; // arr现在变为['A', 99, 'C']
	请注意，如果通过索引赋值时，索引超过了范围，同样会引起Array大小的变化：
	var arr = [1, 2, 3];
	arr[5] = 'x';
	arr; // arr变为[1, 2, 3, undefined, undefined, 'x']
	```
3. 获取元素索引
	```js
	var arr = [10, 20, '30', 'xyz'];
	arr.indexOf(10); // 元素10的索引为0
	arr.indexOf(20); // 元素20的索引为1
	arr.indexOf(30); // 元素30没有找到，返回-1
	arr.indexOf('30'); // 元素'30'的索引为2
	```
5. 截取数组
	```js
	var arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	arr.slice(0, 3); // 从索引0开始，到索引3结束，但不包括索引3: ['A', 'B', 'C']
	arr.slice(3); // 从索引3开始到结束: ['D', 'E', 'F', 'G']
	```
	slice()的起止参数包括开始索引，不包括结束索引。
	如果不传任何参数，则可以复制一个数组
	```js
	var arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	var aCopy = arr.slice();
	aCopy; // ['A', 'B', 'C', 'D', 'E', 'F', 'G']
	aCopy === arr; // false
	```
6. push 和 pop
	```js
	push()向Array的末尾添加若干元素，pop()则把Array的最后一个元素删除掉：
	var arr = [1, 2];
	arr.push('A', 'B'); // 返回Array新的长度: 4
	arr; // [1, 2, 'A', 'B']
	arr.pop(); // pop()返回'B'
	arr; // [1, 2, 'A']
	arr.pop(); arr.pop(); arr.pop(); // 连续pop 3次
	arr; // []
	arr.pop(); // 空数组继续pop不会报错，而是返回undefined
	arr; // []
	```
7. unshift 和 shift
如果要往Array的头部添加若干元素，使用unshift()方法，shift()方法则把Array的第一个元素删掉：
	```js
	var arr = [1, 2];
	arr.unshift('A', 'B'); // 返回Array新的长度: 4
	arr; // ['A', 'B', 1, 2]
	arr.shift(); // 'A'
	arr; // ['B', 1, 2]
	arr.shift(); arr.shift(); arr.shift(); // 连续shift 3次
	arr; // []
	arr.shift(); // 空数组继续shift不会报错，而是返回undefined
	arr; // []
	```
8. 数组排序
sort()可以对当前Array进行排序，它会直接修改当前Array的元素位置，直接调用时，按照默认顺序排序：
	```js
	var arr = ['B', 'C', 'A'];
	arr.sort();
	arr; // ['A', 'B', 'C']
	```
9. 数组反转
	```js
	var arr = ['one', 'two', 'three'];
	arr.reverse(); 
	arr; // ['three', 'two', 'one']
	```
10. 删除数组元素 
splice()方法可以从指定的索引开始删除若干元素，然后再从该位置添加若干元素： 
	```js 
	var arr = ['Microsoft', 'Apple', 'Yahoo', 'AOL', 'Excite', 'Oracle'];
	// 从索引2开始删除3个元素,然后再添加两个元素:
	arr.splice(2, 3, 'Google', 'Facebook'); // 返回删除的元素 ['Yahoo', 'AOL', 'Excite']
	arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
	// 只删除,不添加:
	arr.splice(2, 2); // ['Google', 'Facebook']
	arr; // ['Microsoft', 'Apple', 'Oracle']
	// 只添加,不删除:
	arr.splice(2, 0, 'Google', 'Facebook'); // 返回[],因为没有删除任何元素
	arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
	```
11. 合并数组
	```js
	var arr = ['A', 'B', 'C'];
	var added = arr.concat([1, 2, 3]);
	added; // ['A', 'B', 'C', 1, 2, 3]
	arr; // ['A', 'B', 'C']
	```
12. 将数组变成字符串
	```js
	var arr = ['A', 'B', 'C', 1, 2, 3];
	arr.join('-'); // 'A-B-C-1-2-3'
	```

### 对象
对象是一组由键-值组成的无序集合。js对象的键都是字符串类型，值可以是任意数据类型。
访问属性是通过.操作符完成的，但这要求属性名必须是一个有效的变量名。如果属性名（键）包含特殊字符，就必须用 ' ' 括起来：
```js
var xiaohong = {
    name: '小红',
    'middle-school': 'No.1 Middle School'
};
```

xiaohong的属性名middle-school不是一个有效的变量，就需要用''括起来。访问这个属性也无法使用.操作符，必须用['xxx']来访问：

xiaohong['middle-school']; // 'No.1 Middle School'
xiaohong['name']; // '小红'
xiaohong.name; // '小红'
访问一个不存在的属性 则会返回undefined


1. 为对象增加属性
```js
var xiaoming = {
    name: '小明'
};
xiaoming.age = 18;
```
2. 删除属性
```js
delete xiaoming.age
```
3. 检测属性
```js
'name' in xiaoming; // true
```
注意：如果in判断一个属性存在，这个属性不一定是xiaoming的，它可能是xiaoming继承得到的
```js
'toString' in xiaoming; // true
```

要判断一个属性是否是xiaoming自身拥有的，而不是继承得到的，可以用hasOwnProperty()方法：
```js
var xiaoming = {
    name: '小明'
};
xiaoming.hasOwnProperty('name'); // true
xiaoming.hasOwnProperty('toString'); // false
```
## 条件和循环
条件和循环用于控制程序的执行逻辑。

### 条件
JavaScript使用if () { ... } else { ... }来进行条件判断。例如，根据年龄显示不同内容，可以用if语句实现如下：
```js
var age = 20;
if (age >= 18) { // 如果age >= 18为true，则执行if语句块
    alert('adult');
} else { // 否则执行else语句块
    alert('teenager');
}
```
JavaScript把null、undefined、0、NaN和空字符串''视为false，其他值一概视为true

### 循环

循环计算 1到10000的和
```js
var x = 0;
var i;
for (i=1; i<=10000; i++) {
    x = x + i;
}
```
使用for来遍历数组
```js
var arr = ['Apple', 'Google', 'Microsoft'];
var i, x;
for (i=0; i<arr.length; i++) {
    x = arr[i];
    console.log(x);
}
```

省略写法
for循环的3个条件都是可以省略的，如果没有退出循环的判断条件，就必须使用break语句退出循环，否则就是死循环：
```js
var x = 0;
for (;;) { // 将无限循环下去
    if (x > 100) {
        break; // 通过if判断来退出循环
    }
    x ++;
}
```
遍历对象
for循环的一个变体是**for ... in**循环，它可以把一个对象的所有属性依次循环出来：
```js
var o = {
    name: 'Jack',
    age: 20,
    city: 'Beijing'
};
for (var key in o) {
    if (o.hasOwnProperty(key)) {  // 过滤掉继承的属性
        console.log(key); // 'name', 'age', 'city'
    }
}
```
由于Array也是对象，而它的每个元素的索引被视为对象的属性，因此，for ... in循环可以直接循环出Array的索引

### while
for循环在已知循环的初始和结束条件时非常有用。而上述忽略了条件的for循环容易让人看不清循环的逻辑，此时用while循环。while循环只有一个判断条件，条件满足，就不断循环，条件不满足时则退出循环。比如我们要计算100以内所有奇数之和，可以用while循环实现：
```js
var x = 0;
var n = 99;
while (n > 0) {
    x = x + n;
    n = n - 2;
}
x; // 2500
```
### do ... while
最后一种循环是do { ... } while()循环，它和while循环的唯一区别在于，不是在每次循环开始的时候判断条件，而是在每次循环完成的时候判断条件：
```js
var n = 0;
do {
    n = n + 1;
} while (n < 100);
n; // 100
```

## Map和Set

### Map

Map是一组键值对的结构，具有极快的查找速度。

使用Javascript创建一个学生姓名和成绩的map：
var m = new Map([['Michael', 95], ['Bob', 75], ['Tracy', 85]]);
m.get('Michael'); // 95

初始化Map需要一个二维数组，或者直接初始化一个空Map。Map具有以下方法：
```js
var m = new Map(); // 空Map
m.set('Adam', 67); // 添加新的key-value
m.set('Bob', 59);
m.has('Adam'); // 是否存在key 'Adam': true
m.get('Adam'); // 67
m.delete('Adam'); // 删除key 'Adam'
m.get('Adam'); // undefined
```
由于一个key只能对应一个value，所以，多次对一个key放入value，后面的值会把前面的值冲掉

### Set

Set和Map类似，也是一组key的集合，但不存储value。由于key不能重复，所以，在Set中，没有重复的key。
```js

// 创建Set，并输入值
var s1 = new Set(); // 空Set
var s2 = new Set([1, 2, 3]); // 含1, 2, 3

// 重复元素自动过滤
var s = new Set([1, 2, 3, 3, '3']);
s; // Set {1, 2, 3, "3"}

// 添加元素到set
s.add(4);
s; // Set {1, 2, 3, 4}
s.add(4);
s; // 仍然是 Set {1, 2, 3, 4}

// 删除元素
var s = new Set([1, 2, 3]);
s.delete(3);

s; // Set {1, 2}
```

### iterable
ES6标准引入了新的iterable类型，Array、Map和Set都属于iterable类型。
具有iterable类型的集合可以通过新的**for ... of**循环来遍历。
```js
var a = ['A', 'B', 'C'];
var s = new Set(['A', 'B', 'C']);
var m = new Map([[1, 'x'], [2, 'y'], [3, 'z']]);
for (var x of a) { // 遍历Array
    console.log(x);
}
for (var x of s) { // 遍历Set
    console.log(x);
}
for (var x of m) { // 遍历Map
    console.log(x[0] + '=' + x[1]);
}
```


for ... of 相比较 for ... in 只循环集合本身的元素
```js
var a = ['A', 'B', 'C'];
a.name = 'Hello';
for (var x in a) {
    console.log(x); // '0', '1', '2', 'name'
}

for (var x of a) {
    console.log(x); // 'A', 'B', 'C'
}

```

### forEach

更好的方式是直接使用iterable内置的forEach方法，它接收一个函数，每次迭代就自动回调该函数
```js
a.forEach(function (element, index, array) {
    // element: 指向当前元素的值
    // index: 指向当前索引
    // array: 指向Array对象本身
    console.log(element + ', index = ' + index);
});

var m = new Map([[1, 'x'], [2, 'y'], [3, 'z']]);
m.forEach(function (value, key, map) {
    console.log(value);
});

var s = new Set(['A', 'B', 'C']);
s.forEach(function (element, sameElement, set) {
    console.log(element);
});
```

## 函数
JavaScript 函数是被设计为执行特定任务的代码块。会在某代码调用它时被执行。

```js
function abs(x) {
    if (typeof x !== 'number') {
        throw 'Not a number';
    }
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}
```

### 函数赋值给变量
js的函数本质也是一个对象，因此可以赋值给变量。
```js
var abs = function (x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
};
```
function (x) { ... }是一个匿名函数，它没有函数名。但是，这个匿名函数赋值给了变量abs，所以，通过变量abs就可以调用该函数。这种方式和直接命名函数是等价的。

### 不加()调用函数

不加()使用函数，返回的是函数对象的声明。
```js
<p id="demo"></p>

<script>
function toCelsius(f) {
    return (5/9) * (f-32);
}
document.getElementById("demo").innerHTML = toCelsius;
</script>
```
上边代码返回：
```js
function toCelsius(f) { return (5/9) * (f-32); } //<p id="demo"></p>的内容
```

### 函数调用

函数调用的时候，传入任意个参数并不会影响调用，因此传入的参数比定义的参数多也没有问题。如果参数传的少。未传的参数默认为**undefined**
单数js有个关键字**arguments**，可以获取传递的参数。它只在函数内部起作用，并且永远指向当前函数的调用者传入的所有参数。arguments类似Array但它不是一个Array：
```js
function foo(x) {
    console.log('x = ' + x); // 10
    for (var i=0; i<arguments.length; i++) {
        console.log('arg ' + i + ' = ' + arguments[i]); // 10, 20, 30
    }
}
foo(10, 20, 30);

```
不传参数也可以获取到值, 我们经常用它判断入参的个数：
```js
function abs() {
    if (arguments.length === 0) {
        return 0;
    }
    var x = arguments[0];
    return x >= 0 ? x : -x;
}

abs(); // 0
abs(10); // 10
abs(-9); // 9
```

我们用**rest**参数表示剩余的参数。rest参数只能写在最后，前面用...标识
```js
function foo(a, b, ...rest) {
    console.log('a = ' + a);
    console.log('b = ' + b);
    console.log(rest);
}

foo(1, 2, 3, 4, 5);
// 结果:
// a = 1
// b = 2
// Array [ 3, 4, 5 ]

foo(1);
// 结果:
// a = 1
// b = undefined
// Array []
```


## 变量作用域

首先来看一个例子：
```js
var a = 1;
function test()
{
    console.log(a); // 1
    var b = 2; 
    console.log(b); // 2
    for(var i=10; i<13; i++) {
        console.log(i)
    }
    console.log(i) // 13
}
test()
// console.log(b) 直接报错：Uncaught ReferenceError: b is not defined
```
根据上边的运行结果，我们可以得到关于变量作用域的以下几点结论：

 - 函数体内声明的变量只能函数内部使用。
 - 函数外部声明的变量函数内部依然可以使用。
 - 结构语句中使用var声明的变量，在当前函数中仍然可以使用。（使用let则只在块作用域内生效）

### 变量提升

先看个例子：
```js
function test () {
    console.log(a);  //undefined
    var a = 123; 
};
test();
```
我们发现，打印后面声明的变量并没有报错。说明同一作用域下的变量会被提前声明，变量提升了！
再来看一道面试题：
```js
console.log(v1); // undefined
var v1 = 100;
function foo() {
    console.log(v1); // undefined
    var v1 = 200;
    console.log(v1); // 200
}
foo();
console.log(v1); // 100
```
我们可以看到：当v1变量重复声明的时候，会优先从函数内部查找变量，外部重名变量会被自动忽略。

### 解构赋值

ES6开始支持解构赋值， 解构赋值很多语言都会支持，这个功能是为了方便获取数组或者对象内部的变量，而不需去遍历它。
示例：
```js
var [x, y] = ['hello', 'world'];
```
支持嵌套和忽略赋值：
```js
let [x, [y, z]] = ['hello', ['my', 'world']];
x; // 'hello'
y; // 'my'
z; // 'world'
let [, , z] = ['hello', 'my', 'world']; // 忽略前两个元素
z; // 'world'
```
当然对于对象也是一样的：
```js
var person = {
    name: '小明',
    age: 20,
    address: {
        city: 'Beijing',
        street: 'No.1 Road'
    }
};

// 如果person对象没有single属性，默认赋值为true:
var {name, single=true} = person;
// 对象也支持嵌套
var {name, address: {city, street}} = person;
```

来看几个实用的小栗子：
```js
// 交换变量
var x=1, y=2;
[x, y] = [y, x]

// 获取页面的域名和路径
var {hostname:domain, pathname:path} = location;
console.log(domain);
console.log(path);

// 如果一个函数接收一个对象作为参数，那么，可以使用解构直接把对象的属性绑定到变量
function buildDate({year, month, day, hour=0, minute=0, second=0}) {
    return new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
}
```

## this和箭头函数
### 变量和常量

js中使用const声明一个常量
```js
const PI = 3.14
```
使用var 和 let声明变量
```js
var a = 1;
let b = 2;
```
那么使用let和var声明变量有什么区别呢？

 - let可以定义块级作用域变量
 - let没有变量提升
 - let声明的变量不能重复声明

### js中的this

先来看一个对象中的一个方法：
```js
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: function () {
        var y = new Date().getFullYear();
        return y - this.birth;
    }
};
xiaoming.age(); // 25
```
在一个方法内部，this是一个特殊变量，它始终指向当前对象。现在我们将上边的方法单独拎出来，作为一个函数。

```js
function getAge() {
   var y = new Date().getFullYear();
   return y - this.birth;
}
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: getAge()
};
xiaoming.age; // NaN
```
纳尼？发生了什么？分析帝分析一波：
首先调用一个函数，只是获取这个函数的返回值，函数体内部的实现并不能在调用的地方体现。所以，在xiaoming这个对象调用getAge()的方法的时候，getAge()方法里面的this并不是指向xiaoming这个对象，而是全局**window**。所以运行结果并不能获取我们想要的。js为了让这个误区显露出来，严格模式下运行，会直接提示一个错误。
```js
'use strict';
function getAge() {
   var y = new Date().getFullYear();
   return y - this.birth;
}
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: getAge()
};
xiaoming.age; // Uncaught TypeError: Cannot read property 'birth' of undefined
```
**严格模式下，全局函数中的this指向了undefined，不使用严格模式，则会指向window**


讲函数的时候，我们提到，如果不加() ，我们会获取这个函数的函数体。如果不加()，可不可以得到我们想要的结果呢？

```js
function getAge() {
   var y = new Date().getFullYear();
   return y - this.birth;
}
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: getAge
};
xiaoming.age(); // 25
```
事实证明可以。
但是如果，这个函数是对象内部方法之中定义的呢，会发生什么?
```js
'use strict'
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: function() {
    	return getAge();
		function getAge() {
		   var y = new Date().getFullYear();
		   return y - this.birth;
		}
	}
};
xiaoming.age(); // Uncaught TypeError: Cannot read property 'birth' of undefined
```
无情报错。
有没有解决办法呢？我们尝试用别的变量代替this。
```js
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: function() {
    	var that = this;
    	return getAge();
		function getAge() {
		   var y = new Date().getFullYear();
		   return y - that.birth;
		}
	}
};
xiaoming.age(); // 25
```
我们用that先获取this，这个节点this指向的是xiaoming对象，所以避免了在函数内部this指向错误的问题。

还有没有别的办法呢？我们使用函数本身的apply方法修复this的指向。
```js
'use strict'
var xiaoming = {
    name: '小明',
    birth: 1996,
    age: function() {
		function getAge() {
		   var y = new Date().getFullYear();
		   return y - this.birth;
		}
        return getAge.apply(xiaoming, []);
	}
};

xiaoming.age(); // 25
```
apply方法接收两个参数，第一个参数就是需要绑定的this变量（设置为null则为全局），第二个参数是Array，表示函数本身的参数。我们还可以用apply实现系统函数的重写。
```js
'use strict';
var count = 0;
var oldParseInt = parseInt; // 保存原函数
window.parseInt = function () {
    count += 1;
    return oldParseInt.apply(null, arguments); // 调用原函数
};
```
除了使用apply方法，有没有别的方法修复this的指向问题呢。有的：箭头函数。

### 箭头函数

箭头函数相当于简写的匿名函数。
```js
// 单参数
x => x * x
// 多参数
(x, y) => x * x + y * y
// 空参数
() => new Date().getFullYear()
// 因为花括号在js中的特殊性，返回对象需要用()包起来
x => ({ foo: x })
// 将箭头函数赋值给变量
var func = (x, y) => x * x + y * y
```

箭头函数中的this总是指向词法作用域，解决了this的指向问题。
```js
var xiaoming = {
    birth: 1996,
    age: function () {
        var b = this.birth; // 1990
        var getAge = () => new Date().getFullYear() - this.birth; // this指向xiaoming 对象
        return getAge ();
    }
};
xiaoming .age(); // 25
```

## 闭包
闭包是一种实现方式（俺是这样想的），可以是一个可执行函数，js的每个对象其实都是闭包的实现方式。

### 闭包的特性

 - 闭包可以访问外部作用域，即使这个外部作用域已经执行结束。
 - 当你定义一个函数时候，实际就是一种闭包的实现方式。只有当这个函数不被其他任何地方调用的时候，闭包就结束了。
 - 闭包可以让作用域里的 变量,在函数执行完之后依旧保持没有被垃圾回收处理掉

### 使用示例
	
举个栗子：

```javascript
	"use strict";
	var myClosure = (function outerFunction() {
  	var hidden = 1;
	return {
	    inc: function innerFunction() {
	      return hidden++;
	    }
	  };
	}());
	console.log(myClosure.inc()); // 1
	console.log(myClosure.inc()); // 2
	console.log(myClosure.inc()); // 3
```
我们可以看到，当我们运用了外部作用域的变量的时候，闭包并没有结束，而是当不在有调用的时候，才将闭包销毁。

### 经典题**

```javascript
for (var i = 0; i < 5; i++) {
    setTimeout(function() {
        console.log(new Date, i);
    }, 1000);
}

console.log(new Date, i);
```
会怎么输出呢？正确答案是：5， 5， 5，5，5，5。
他们之间的输出时间是怎么样的呢？
用箭头表示其前后的两次输出之间有 1 秒的时间间隔，而逗号表示其前后的两次输出之间的时间间隔可以忽略。则结果是这样的：
5 -> 5,5,5,5,5。因为循环过程中，几乎是同时设置了5个定时器。

那么应该怎么修改代码，让期望结果变成：5 -> 0,1,2,3,4。走着：
```js
for (var i = 0; i < 5; i++) {
    (function(j) {  // j = i
        setTimeout(function() {
            console.log(new Date, j);
        }, 1000);
    })(i);
}

console.log(new Date, i);
```
我们 “创建了一个匿名函数并立刻执行”。达到了期望的效果。那么还有没别的办法呢？我们知道setTimeOut方法第三个参数是可选的。当定时器到期，它们会作为参数传递给function 。所以可以这样写：

```javascript
for (var i = 0; i < 5; i++) {
    setTimeout(function(j) {
        console.log(new Date, j);
    }, 1000, i);
}

console.log(new Date, i);
```

或者我们可以将i重新赋值：
```js
var output = function (j) {
    setTimeout(function() {
        console.log(new Date, j);
    }, 1000);
};

for (var i = 0; i < 5; i++) {
    output(i); 
}
console.log(new Date, i);
```

或者使用let声明变量i:
```js
for (let i = 0; i < 5; i++) {
    setTimeout(function() {
        console.log(new Date, i);
    }, 1000);
}

// console.log(new Date, i); // 会报错。
```

## 时间的转换

js中使用Date对象来表示时间和日期：

### 获取年月日时分秒和星期等
```javascript
var now = new Date();
now;
now.getFullYear(); // 2021, 年份
now.getMonth(); // 2, 月份，月份范围是0~11，2表示3月
now.getDate(); //  4, 表示4号
now.getDay(); // 3, 星期三
now.getHours(); // 16, 表示19h
now.getMinutes(); // 41, 分钟
now.getSeconds(); // 22, 秒
now.getMilliseconds(); // 473, 毫秒数
now.getTime(); // 1614847074473, 以number形式表示的时间戳
```

### 创建指定日期的时间对象

```js
var d = new Date(2021, 3, 4, 16, 15, 30, 123);
```
### 将日期解析为时间戳

```js
var d = Date.parse('2021-03-04 16:49:22.123');
d; // 1614847762123

// 尝试更多方式
(new Date()).valueOf(); 
new Date().getTime(); 
Number(new Date()); 
```

### 时间戳转日期
```js
var d = new Date(1614847762123);
d.toUTCString(); // "Thu, 04 Mar 2021 08:49:22 GMT"，UTC时间，与本地时间相差8小时
var d = new Date(1614847762123);
d.toLocaleString(); // "2021/3/4下午4:49:22"，本地时间（北京时区+8:00），显示的字符串与操作系统或浏览器设定的格式有关
```

### 时间戳转自定义格式的日期

因为操作系统或者浏览器显示格式的不确定性，固定格式的日期只能自己拼接：
```js
function getDate() {
    var now = new Date(),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
}

getDate() // "2021-03-04 16:56:39"
```
> 可以使用成熟的三方库： moment.js或者dayjs等

## JSON序列化和反序列化

JSON是JavaScript Object Notation的缩写，是一种数据交换格式。

### json中的数据类型

一共有六种：
 - number：JavaScript的number；
 - boolean：JavaScript的true或false；
 - string：JavaScript的string； 
 - null：JavaScript的null；
 - array：JavaScript的Array表示方式——[]； 
 - object：JavaScript的{ ... }表示方式。

### json序列化

就是把JavaScript对象或数组转为json格式的字符串。
```js
'use strict';

var xiaoming = {
    name: '小明',
    age: 14,
    gender: true,
    height: 1.65,
    grade: null,
    skills: ['JavaScript', 'Java', 'Python', 'PHP']
};
var s = JSON.stringify(xiaoming);
console.log(s); // {"name":"小明","age":14,"gender":true,"height":1.65,"grade":null,"skills":["JavaScript","Java","Python","PHP"]}

// 按缩进输出
JSON.stringify(xiaoming, null, '  ');
// 第二个参数可以输出指定属性
JSON.stringify(xiaoming, ['name', 'skills'], '  ');
// 还可以搞一个函数处理
function convert(key, value) {
    if (typeof value === 'string') {
        return value.toUpperCase();
    }
    return value;
}
JSON.stringify(xiaoming, convert, '  ');
```

我们可以将对象需要返回的json数据预先定义：
```js
var xiaoming = {
    name: '小明',
    age: 14,
    gender: true,
    height: 1.65,
    grade: null,
    skills: ['JavaScript', 'Java', 'Python', 'Lisp'],
    toJSON: function () {
        return { // 只输出name和age，并且改变了key：
            'Name': this.name,
            'Age': this.age
        };
    }
};

JSON.stringify(xiaoming); // '{"Name":"小明","Age":14}'
```

### 反序列化

将JSON格式的字符串，用JSON.parse()把它变成一个JavaScript对象：
```js
JSON.parse('[1,2,3,true]'); // [1, 2, 3, true]
JSON.parse('{"name":"小明","age":14}'); // Object {name: '小明', age: 14}
JSON.parse('true'); // true
JSON.parse('123.45'); // 123.45
```

## 正则表达式

几乎每种语言字符串类型都支持正则匹配，固定场景的字符串可能都有固定的规则，我们设定好一个规则，验证目标字符串是否符合规则。比如验证手机号码，验证邮箱等等。

### 正则匹配规则

先看几个简单的正则匹配规则示例：
1. 用\d可以匹配一个数字，\w可以匹配一个字母或数字。比如： 
`'11\d' 可以匹配'110'，因为0是数字；`
`'\d\d\d'也可以匹配'110'，因为1、1、0都是数字；`
`'\w\w\w' 可以匹配'abc'，因为a、b、c都是数字；`
2. 使用 . 可以匹配任意字符。比如：
`'shabi.' 可以匹配'shabi?'，也可以匹配'shabi!'，也可以匹配'shabi。'；`
3. 表示变长字符串，有这样几种匹配方式：用 \* 表示任意个字符（包括0个），用+表示至少一个字符，	用?表示0个或1个字符，用{n}表示n个字符，用{n,m}表示n-m个字符。例如：
'`ba*' 可以匹配b,ba,baa,baaa` 
`\d{2,8}可以匹配2-8个数字`
4. \s可以匹配空格。例如：
`\s+表示至少有一个空格`
5. 特殊字符，用 \\ 转义匹配
`\-表示匹配-号` 
6. 可以用 [] 进行范围匹配。例如：
`[0-9a-zA-Z\_]可以匹配一个数字、字母或者下划线`；
8. 还有一些其他常见的规则：
`A|B可以匹配A或B，所以(J|j)ava(S|s)cript可以匹配'JavaScript'、'Javascript'、'javaScript'或者'javascript'。`
`A|B可以匹配A或B，所以(J|j)ava(S|s)cript可以匹配'JavaScript'、'Javascript'、'javaScript'或者'javascript'。`
`^表示行的开头，^\d表示必须以数字开头。`
`$表示行的结束，\d$表示必须以数字结束。`

### 常见匹配示例

 - 匹配一个1到20个字符的javascript合法变量名称：
	`[a-zA-Z\_\$][0-9a-zA-Z\_\$]{0, 19}`
	`[a-zA-Z\_\$]表示任意一个字母下划线开头，[0-9a-zA-Z\_\$]{0, 19}表示0到19位数字字母或者下划线`
- 匹配一个11位的手机号码：
	`^[1][3,4,5,6,7,8,9][0-9]{9}$`
	`^[1]表示以1开头， [3,4,5,6,7,8,9]表示第二个数字是3到9的任意一个数，[0-9]{9}$表示0到9的任意数，一共是9个数字。`
- 匹配一个合法的邮箱
	`^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$`
	`圆括号()表示分组。^(\w)+表示至少以一个字母或者数字开头；(\.\w+)*表示任意个 . 或者数字或字母。((\.\w+)+)$表示至少一个. 或者数字字母结束`

### js中正则校验

两种方法，一种是使用正则对象，一种是使用/ /包括，我们前面的手机号码做测试。
```js
var re1 = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
var re2 = new RegExp('^[1][3,4,5,6,7,8,9][0\-9]{9}$');

re1.test('11012345678'); // false
re2.test('11012345678'); // false
re1.test('18012345678'); // true
```
### 字符串分组

前面已经有提到过，使用()可以分组，分组的意思就是我们可以获取正则匹配到的分组子串。用前面的邮箱为例：

```js
var re = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;

re.test('abc@163.com'); // true
re.exec('abc@163.com'); // ["abc@163.com", "c", undefined, "3", ".com", ".com", index: 0, input: "abc@163.com", groups: undefined]

```
第一个元素是正则表达式匹配到的整个字符串，后面的字符串表示匹配成功的子串。没有匹配到exec则返回null。

## Promise和async/await
JavaScript是一门单线程语言，所有的代码都是在一个线程中执行的。如果有耗时的操作，比如读取文件、网络请求等，就会阻塞主线程，导致页面无响应。为了解决这个问题，JavaScript引入了异步编程的概念。

### Promises
顾名思义，Promise表示一个承诺。承诺未来某个时间会执行某个操作。

Promise主要是为了解决js编程中回调地狱的问题。先看一个旧式的例子：

```javascript
chooseToppings(function(toppings) {
  placeOrder(toppings, function(order) {
    collectOrder(order, function(pizza) {
      eatPizza(pizza);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```

可以看到，回调函数的多层调用，使代码可读性变差，而且不利于维护。

使用Promise则会变成这样：

```javascript
chooseToppings()
.then(function(toppings) {
  return placeOrder(toppings);
})
.then(function(order) {
  return collectOrder(order);
})
.then(function(pizza) {
  eatPizza(pizza);
})
.catch(failureCallback);
```

或者更加简洁：

```javascript
chooseToppings()
.then(toppings => placeOrder(toppings))
.then(order => collectOrder(order))
.then(pizza => eatPizza(pizza))
.catch(failureCallback);
```

### 使用promise
我们通过new Promise(func)来实例化一个Promise对象，其中func表示我们事先已经实现的一个函数，这个函数正常有两个参数：resolve, reject。两个参数都是回调函数，分别在当Promise执行成功或失败的时候触发。使用示例：
```javascript
function test(resolve, reject) {
    console.log(Math.random())
    
    var timeOut = Math.random() * 2;
    console.log('set timeout to: ' + timeOut + ' seconds.');
    setTimeout(function () {
        if (timeOut < 1) {
            console.log('call resolve()...');
            resolve('200 OK');
        } else {
            console.log('call reject()...');
            reject('timeout in ' + timeOut + ' seconds.');
        }
    }, timeOut * 1000);
}


var p = new Promise(test);
p.then(function (result) {
    console.log('成功：' + result);
}).catch(function (reason) {
    console.log('失败：' + reason);
});
```

当然，then()返回的依旧是一个Promise对象，所以如果有多层回调，我们可以继续这样写：then().then().....

### async/await
顾名思义，async表示异步，await表示异步的等待。

async/await 是配套使用的，他们是对Promise的进一步改良，主要是为了使代码更好看，多层Promise的时候传参更加方便。

async是做了一个规范：使用async修饰的函数或方法，一定返回的是一个Promise对象。

await修饰一个返回值为Promise对象的方法，获取这个Promise执行成功的返回值。await所在的函数或方法必须使用async进行修饰。

示例：

```javascript
function takeTime(n) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(n + 200);
    }, 1000)
  );
}


var time1 = 300;
async function test() {
    var res = await takeTime(time1);
    console.log(res);
}

test();
```

明显看到，我们的代码单行编写，只接收了成功的返回值，看起来更加简洁，如果出现多层调用，也更加方便赋值。


## 参考
- MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous/Promises
