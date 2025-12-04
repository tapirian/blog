---
date: 2021-03-02
title: 一文带你快速入门TypeScript
category: JavaScript 
tags:
- TypeScript
- 前端
---

# 一文带你快速入门TypeScript
TypeScript 相当于做了对JavaScript这个动态语言做了一个规范，ts是基于数据结构方面的。因为严格的结构规范，保证我们开发者在开发过程中，避免出现运行时的一些未知错误，在ts环境中，编译的时候就会返回错误。

## 安装配置
安装TypeScript编译工具之前，请确保你已经安装了npm
```bash
npm install -g typescript
```

这样我们就可以使用ts了。TypeScript代码放在以.ts为后缀的文件中。
```bash
tsc demo.ts
```

可以使用 -t 参数来指定es版本。
```bash
tsc demo.ts -t es6
```
执行后，我们可以看到同文件夹下生成了demo.js文件。ts文件代码最终是被解析成js文件运行的。

## 基础数据类型
​
### 布尔值
和其他语言一样，两个值，true和false
```typescript
let isDone: boolean = false;
```

### 数字
所有数字都是浮点数，类型名称叫number

```typescript
let decLiteral: number = 6;
let hexLiteral: number = 0xf00d;
let binaryLiteral: number = 0b1010;
let octalLiteral: number = 0o744;
```

### 字符串
可以定义多行文本，也可以包含表达式

```typescript
let name: string = `Gene`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ name }.

I'll be ${ age + 1 } years old next month.`;
```

### 数组
数组中的每个元素必须同类型
```typescript
let list: number[] = [1, 2, 3];
// 或者使用数组泛型
let list: Array<number> = [1, 2, 3];
```

## 元组
表示已知类型和数量的数组，各个元素类型不必相同

```typescript
let x: [string, number];
x = ['hello', 10];
```

### 枚举
```typescript
enum Color {Red = 1, Green = 2, Blue = 4}
let c: Color = Color.Green;
```
如果没有初始化值，则默认为0依次递增

### any
我们不清楚变量的类型，这些值可能来自动态类型。

```typescript
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false;
```
### Void
表示没有任何类型，与any相反。void类型只能赋值null或者undefined

```typescript
function warnUser(): void {
    console.log("This is my warning message");
}
```
### Null 和 Undefined
默认情况下null和undefined是所有类型的子类型。

### Never
never表示永不存在值得类型

never类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是never的子类型或可以赋值给never类型（除了never本身之外）。 即使 any也不可以赋值给never。

```typescript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
    throw new Error(message);
}
```

### Object
object表示非原始类型，也就是除number，string，boolean，symbol，null或undefined之外的类型。

```typescript
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

### 类型断言
类型断言有两种写法，`尖括号<>和as`

```typescript
let someValue: any = "this is a string";

let strLength: number = (<string>someValue).length;
//或者
let strLength: number = (someValue as string).length;
```

## 接口​
接口是一种数据类型，它好比一个名字，是对某一类数据对象的描述。区别于其他语言的接口，ts接口只注重外形，而不是实现。

```typescript
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```
### 可选属性和只读属性
使用 `?:` 表示一个接口的属性可选，使用`readonly`关键字修饰接口属性，表示这个属性只读，即在初始化之后不能修改。

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
  readonly x: number;
  readonly y: number;
}
```

延伸：数组只读用`ReadonlyArray<T>`来定义:

```typescript
let commonArr: number[] = [1, 2, 2, 3];
let onlyRead: ReadonlyArray<number> = commonArr;
// 想要将只读数组赋值给其他数组，只能类型断言
commonArr = onlyRead as number[];
```

### 属性检查
接口定义外的额外的属性，直接使用的时候，类型检查会报错。我们定义一个新变量再传入来跳过类型检查，或者直接使用类型断言。

```typescript
interface labelValueInterface {
  label: string;
}
function printLabel2(labelValue: labelValueInterface) {
  console.log(labelValue.label);
}

printLabel({ label: "hello world, keep coding!" });

// error
// printLabel({ label: "hello world, keep coding!!!", type: "string" });

// 赋值给另一个变量，会跳过类型检查
let labelObj3 = { label: "hello world, keep coding!!!", type: "string" };
printLabel(labelObj3);
```

使用类型断言：

```typescript
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```
### 函数类型的接口
函数类型的接口，只需要定义参数名称和类型和返回值类型。其中函数参数名称只是为了可读性强一点，并不是强制要求函数的参数名称与接口定义的相同。

根据类型推论，函数的参数类型也可以省略。
```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
```
### 可索引类型的接口
可索引类型具有一个 索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。

```typescript
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

### 类类型的接口
接口描述了类的公共部分，而不会检查类的私有成员

类是具有两个类型的：静态部分的类型和实例的类型。类类型的接口只会检查其实例部分。

```typescript
interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}
```
### 接口继承
接口可以使用extends关键字继承。

一个接口可以继承多个接口，创建出多个接口的合成接口

```typescript
interface Shape {
    color: string;
}

interface PenStroke {
    penWidth: number;
}

interface Square extends Shape, PenStroke {
    sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```

### 混合类型
有时候我们会希望一个对象既是一个函数，也是一个对象。

```typescript
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}

function getCounter(): Counter {
    let counter = <Counter>function (start: number) { };
    counter.interval = 123;
    counter.reset = function () { };
    return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

### 接口继承类
当接口继承了一个类类型时，它会继承类的成员但不包括其实现。

如果一个接口继承的类包含私有成员。那么接口的实现必须是这个类的子类。

```typescript
class Control {
    private state: any;
}

interface SelectableControl extends Control {
    select(): void;
}

class Button extends Control implements SelectableControl {
    select() { }
}

class TextBox extends Control {
    select() { }
}

// 错误：“Image”类型缺少“state”属性。
class Image implements SelectableControl {
    select() { }
}

class Location {

}
```

## 类
​
这里主要将ts中类的使用的一些特性，和其他语言面向对象相通的地方这里就不做多余赘述。

### readonly修饰符和参数属性
使用 readonly关键字将属性设置为只读的。 只读属性必须在声明时或构造函数里被初始化。

将只读属性作为构造函数的参数传入。参数属性可以方便地让我们在一个地方定义并初始化一个成员
```typescript
class Octopus {
    readonly numberOfLegs: number = 8;
    constructor(readonly name: string) {
    }
}
```
### super()
派生类包含的构造函数必须super();

如果构造函数中需要访问this，需要在之前调用super();

执行父类的普通方法，使用super.functionName();
```typescript
class Animal {
    name: string;
    constructor(theName: string) { this.name = theName; }
    move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
}

class Snake extends Animal {
    constructor(name: string) { super(name); }
    move(distanceInMeters = 5) {
        console.log("Slithering...");
        super.move(distanceInMeters);
    }
}
```

### 存取器
存取器可以拦截对类中属性的访问和设置。在set和get方法中对数据进行处理或者过滤。

```typescript
class Employee {
  _fullName: string;

  set fullName(name: string) {
    console.log("您将要设置_fullName的值：");
    this._fullName = name;
  }

  get fullName(): string {
    console.log("您将要获取_fullName的值：");
    return this._fullName;
  }
}

let employee = new Employee();
employee.fullName = "Bob Smith";
if (employee.fullName) {
  console.log(employee.fullName);
}
```

### 静态属性和静态方法
定义：方法或者属性前面添加 static

访问：使用类名来访问
```typescript
class Grid {
  static origin = { x: 0, y: 0 };
  calculateDistanceFromOrigin(point: { x: number; y: number }) {
    let xDist = point.x - Grid.origin.x;
    let yDist = point.y - Grid.origin.y;
    return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
  }
  constructor(public scale: number) {}
}

let grid1 = new Grid(1.0); // 1x scale
let grid2 = new Grid(5.0); // 5x scale

console.log(Grid.origin.x);
console.log(Grid.origin.y);

console.log(grid1.calculateDistanceFromOrigin({ x: 10, y: 10 }));
console.log(grid2.calculateDistanceFromOrigin({ x: 10, y: 10 }));
```

## 函数
​
函数可以有名字也可以匿名。还可以赋值给一个变量。
```typescript
// Named function
function add(x, y) {
    return x + y;
}

// Anonymous function
let myAdd = function(x, y) { return x + y; };
```

### 函数类型
和接口函数有点类似，函数类型需要定义函数参数名称（形式）和参数类型以及返回值类型。
```typescript
let myAdd: (x: number, y: number) => number;
function(x: number, y: number): number { return x + y; };
```

### 类型推论
根据类型推导，如果事先定义了函数类型，赋值的时候函数参数和返回值不用声明类型，这叫做“按上下文归类”

```typescript
let myAdd4: (x: number, y: number) => number;

myAdd4 = function (x, y) {

return x + y;

};
```

### 可选参数、剩余参数和参数默认值
可选参数使用?:。注意可选参数必须放在必传参数后面。即函数参数列表的最后。

默认值直接在参数列表使用 = 赋值。可以使用默认值方式来让参数可选（同样需要放在参数列表最后）

参数名前添加 ... 表示剩余参数，我们通常用一个数组类型来表示剩余参数

```typescript
// 参数可选
function buildName(firstName: string, lastName?: string) {
  // ...
}
// 或者使用默认值的方式来让参数可选（必须放最后）
function buildName2(firstName: string, lastName = "Smith") {
  // ...
}

// 剩余参数
function buildName3(firstName: string, ...restName: string[]) {
  return firstName + " " + restName.join(" ");
}
```

### 函数重载
函数可以只定义接口，重新命名之后来实现重载。

重载函数和实现必须兼容

```typescript
function consoleSomething(str: string): string;
function consoleSomething(num: number): number;

function consoleSomething(something: any): any {
  console.log(something);
  return something;
}
```

## 泛型​
泛型，指可以适用于多个类型，并且保证数据不丢失。

用法：使用尖括号包裹类型定义符T（T可以为其他字符）

```typescript
// 泛型写法,保证数据不丢失，参数类型和返回值类型是一致的。
function identity2<T>(arg: T): T {
  return arg;
}
```

### 泛型函数
```typescript
function identity4<T>(arg: Array<T>): Array<T> {
  return arg;
}
```

### 泛型接口
```typescript
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity7<T>(arg: T): T {
  return arg;
}

let myIdentity2: GenericIdentityFn<number> = identity7;
```

### 泛型类
```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

### 配合接口和extends关键字来实现类型约束
```typescript
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length); 
    return arg;
}
```
### 使用类类型
```typescript
  class BeeKeeper {
    hasMask: boolean;
  }
 
  class LionKeeper {
    nameTag: string;
  }
 
  class Animal {}
 
  class Bee extends Animal {
    keeper: BeeKeeper;
  }
 
  class Lion extends Animal {
    keeper: LionKeeper;
  }
 
  function createInstance<A extends Animal>(c: new () => A): A {
    return new c();
  }
 
  createInstance(Lion).keeper.nameTag;
  createInstance(Bee).keeper.hasMask;
```

## TypeScript高级类型
​
### Symbol
symbol生成一个唯一值，symbol类型的值是通过Symbol构造函数创建(es6之后支持)
```typescript
let sym = Symbol();
```

symbol值是绝对唯一的，两个同参数的symbol也是不相等的
```typescript

let sym2 = Symbol("abc");
let sym3 = Symbol("abc");

sym2 === sym3; // false, symbols是唯一的
```

用作对象属性的键: 
```typescript
let sym = Symbol();
let obj = {
  [sym]: "value1",
};

console.log(obj[sym]);
```

用作类的方法:
```typescript
class TestSymbol {
  [sym4]() {
    console.log("this is a symbao function");
  }
}

let testSymbol = new TestSymbol();
testSymbol[sym4]();
```

### 交叉类型
同时拥有定义的多个类型的特性

```typescript
// 交叉类型
function extend<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in first) {
    (<any>result)[id] = (<any>first)[id];
  }

  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      (<any>result)[id] = (<any>second)[id];
    }
  }
  return result;
}

class Person {
  constructor(public name: string) {}
}
interface Loggable {
  log(): void;
}
class ConsoleLogger implements Loggable {
  log() {
    // ...
  }
}
var jim = extend(new Person("Jim"), new ConsoleLogger());
var n = jim.name;
console.log(n);
jim.log();
```

上边的例子，jim同时拥有Person{}和ConsoleLogger的属性。

### 联合类型
多个类型之间的关系为“或”，我们用竖线（ | ）分割每个类型
```typescript
function padLeft(value: string, padding: string | number) {
    // ...
}

let indentedString = padLeft("Hello world", "Hello world"); 
```

联合类型类，我们只能访问共有成员

```typescript
interface Bird {
    fly();
    layEggs();
}

interface Fish {
    swim();
    layEggs();
}

function getSmallPet(): Fish | Bird {
    // ...
}

let pet = getSmallPet();
pet.layEggs(); // okay
pet.swim();    // errors
```

### 类型保护
访问联合类型的类的非共有成员，我们需要使用类型断言来实现类型保护。

```typescript
let pet = getSmallPet();

if ((<Fish>pet).swim) {
    (<Fish>pet).swim();
}
else {
    (<Bird>pet).fly();
}
```

**typeof**

可以使用typeof来实现类型保护，注意：

1. typeof类型保护*只有两种形式能被识别： typeof v === "typename"和 typeof v !== "typename"

2. "typename"必须是 "number"， "string"， "boolean"或 "symbol"。

function padLeft(value: string, padding: string | number) {
    if (typeof padding === "number") {
        return Array(padding + 1).join(" ") + value;
    }
    if (typeof padding === "string") {
        return padding + value;
    }
    throw new Error(`Expected string or number, got '${padding}'.`);
}

**自定义类型保护**

1.返回值是一个类型谓词

2. 好处是避免多次断言

```typescript
function isFish(pet: Fish | Bird): pet is Fish {

    return (<Fish>pet).swim !== undefined;

}
```

### 类型别名
```typescript
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
  if (typeof n === "string") {
    return n;
  } else {
    return n();
  }
}
```

### 字面量类型
```typescript
// 字符串字面量类型
type Easing = "ease-in" | "ease-out" | "ease-in-out";
class UIElement {
  animate(dx: number, dy: number, easing: Easing) {
    if (easing === "ease-in") {
      // ...
    } else if (easing === "ease-out") {
    } else if (easing === "ease-in-out") {
    } else {
      // error! should not pass null or undefined.
    }
  }
}

let button = new UIElement();
button.animate(0, 0, "ease-in");

// 数值字面量类型
let x = 1 | 2 | 3;
```

### 索引类型
1. 使用索引类型，编译器就能够检查使用了动态属性名的代码

2. 通过索引访问操作符（T[K]）和索引类型查询操作符（keyof）实现

```typescript
interface Person {
  name: string;
  age: number;
}

let xiaoming: Person = {
  name: "xiaoming",
  age: 15,
};

function getPersonValue<T extends keyof Person>(key: T): any {
  return xiaoming[key];
}
console.log(getPersonValue("age"));
```

**索引类型和字符串索引签名:**
```typescript
interface myMap<T> {
  [key: string]: T;
}

let keys: keyof myMap<number>; // string
let values: myMap<number>["foo"]; // number
console.log(keys, values);
```    

**keyof typeof:**
```typescript
enum ColorsEnum {
  white = "#ffffff",
  black = "#000000",
}

type Colors = keyof typeof ColorsEnum;

// 上边的写法相当于 type Colors = "black" | "white";

let myColor: Colors = "black";
console.log(myColor);
```

### 映射类型
示例中让已知类型的属性变成可选或者只读

```typescript
// 示例1
interface myPerson {
  name: string;
  age: number;
}

type readonlyProper<T> = {
  readonly [P in keyof T]: T[P];
};

type partialProper<T> = {
  [P in keyof T]?: T[P];
};

type partialPerson = partialProper<Person>;
type readonlyPerson = readonlyProper<Person>;

let James: partialPerson = { name: "张三" };
let Julia: readonlyPerson = { name: "Julia", age: 12 };

// 示例2
type Keys = "option1" | "option2";
type Flags = { [K in Keys]: boolean };

// 相当于
// type Flags = {
//     option1: boolean;
//     option2: boolean;
// }
```

### 其他
```typescript
// 预定义的有条件类型
// Exclude<T, U> -- 从T中剔除可以赋值给U的类型。
// Extract<T, U> -- 提取T中可以赋值给U的类型。
// NonNullable<T> -- 从T中剔除null和undefined。
// ReturnType<T> -- 获取函数返回值类型。
// InstanceType<T> -- 获取构造函数类型的实例类型。

type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"
```

## Mixins的实现
Mixins解决的问题：

以一种可重用组件的形式，实现对单个类的扩展

### 实现

1. 定义一个class, 使用implements关键字联合另外的若干个类。
2. 为了让编译器知道mixin进来的类属性方法在运行时是可用的，要对mixin进来的属性方法创建出占位属性。
3. 定义函数来实现混入操作，遍历所有的mixins类的属性，并复制到目标类。

```typescript
class Eat {
  prepareEat() {
    console.log("prepareEat");
  }
}

class Run {
  runMeters: number;
  prepareRun() {
    this.runMeters = 100;
    console.log("prepareRun");
  }
}

class Dog implements Eat, Run {
  runMeters: number = 0;
  prepareEat(): void {}
  prepareRun(): void {
    // 这里的方法制作占位使用，里面的业务代码不会生效
    // this.runMeters = 1000;
  }

  shout(): void {
    console.log("shout");
  }
}

function mixinAnimal(target: any, mixins: any[]) {
  mixins.forEach((mixin) => {
    Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
      target.prototype[name] = mixin.prototype[name];
    });
  });
}

mixinAnimal(Dog, [Eat, Run]);

let DaHei = new Dog();
DaHei.prepareRun();
DaHei.prepareEat();
DaHei.shout();
console.log(DaHei.runMeters);
```

## 装饰器
在一些场景下我们需要额外的特性来支持标注或修改类及其成员。我们使用装饰器来实现。

装饰器是一种设计模式，可以动态的实现对类属性的修改，而不需要重载，实现了最大的灵活性。

### 启用装饰器
在运行时开启：
```bash
tsc yourDecorator.ts --target ES5 --experimentalDecorators
```

或者使用配置方式：
tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
    }
}
```

ts中装饰器使用 @expression这种形式，expression求值后必须为一个函数，它会在运行时被调用，被装饰的声明信息做为参数传入。


一个简单的示例（装饰器只在解释执行时应用一次。即使没有使用C类，也会打印"hello world"）：
```typescript
// example1
function helloWorld(target: any) {
  console.log("hello world");
}

@helloWorld
class C {
  constructor() {
    console.log("this is constructor");
  }
}

// 结果
// hello world


// example2
function hello(name: string): any {
  return function () {
    console.log("hello,", name);
  };
}

@hello("Pig")
class Pig {
  constructor() {
    console.log("this is the Pig constructor");
  }
}

// 结果
// hello pig
```

### 五种装饰器
- 类装饰器
- 属性装饰器
- 方法装饰器
- 访问器装饰器
- 参数装饰器

```typescript
// 类装饰器
@classDecorator
class Bird {

  // 属性装饰器
  @propertyDecorator
  name: string;
  
  // 方法装饰器
  @methodDecorator
  fly(
    // 参数装饰器
    @parameterDecorator
      meters: number
  ) {}
  
  // 访问器装饰器
  @accessorDecorator
  get egg() {}
}

```

### 执行顺序
```
        1. 实例成员

                1.1实例成员参数装饰器

                1.2实例成员方法、访问器、属性装饰器

        2. 静态成员

                1.1静态成员参数装饰器

                1.2静态成员方法、访问器、属性装饰器

        3. 构造器参数装饰器

        4. 类装饰器
```

示例：
```typescript
function f(key: string): any {
  console.log("evaluate: ", key);
  return function () {
    console.log("call: ", key);
  };
}

@f("Class Decorator")
class C {
  @f("Instance Property")
  prop?: number;
  @f("Static Property")
  static prop?: number;

  @f("Static Method")
  static method(@f("Static Method Parameter") foo) {}

  constructor(@f("Constructor Parameter") foo) {}

  @f("Instance Method")
  method(@f("Instance Method Parameter") foo) {}
}
```

结果如下：

```
evaluate:  Instance Property
call:  Instance Property
evaluate:  Instance Method
evaluate:  Instance Method Parameter
call:  Instance Method Parameter
call:  Instance Method
evaluate:  Static Property
call:  Static Property
evaluate:  Static Method
evaluate:  Static Method Parameter
call:  Static Method Parameter
call:  Static Method
evaluate:  Class Decorator
evaluate:  Constructor Parameter
call:  Constructor Parameter
call:  Class Decorator
```

**装饰器执行顺序是后进先出:**
1. 多参数情况，最后一个参数的装饰器会最先被执行
2. 装饰器工厂：它返回一个表达式，以供装饰器在运行时调用，多个装饰器工厂，最后一个装饰器返回表达式最先执行。
3. 装饰器工厂外部的代码是按照顺序执行，并不是后进先出。

```typescript
function f(key: string) {
  console.log("evaluate: ", key);
  return function () {
    console.log("call: ", key);
  };
}

class C {
  @f("Outer Method")
  @f("Inner Method")
  method() {}
}
```

输出：
```
evaluate: Outer Method
evaluate: Inner Method
call: Inner Method
call: Outer Method
```

> 因为ts的类设计原则中，构造器相当于这个类，所以构造器没有所谓的方法装饰器，构造器的 "方法装饰器" 其实就是类装饰器。

## 参考
- https://blog.csdn.net/ZZB_Bin/article/details/103168609
- https://segmentfault.com/a/1190000022415199
- https://mirone.me/zh-hans/a-complete-guide-to-typescript-decorator/




​



​
