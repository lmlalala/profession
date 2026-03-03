/**
 * 第五章：类（Class）与接口实现
 *
 * 学习目标：
 *   1. 掌握类的属性修饰符：public / private / protected / readonly
 *   2. 掌握 implements 实现接口
 *   3. 掌握 extends 继承类
 *   4. 理解抽象类（abstract）
 *   5. 掌握静态成员、访问器（getter/setter）
 */

// ─────────────────────────────────────────────
// 5.1 属性修饰符
// ─────────────────────────────────────────────

class BankAccount {
  public owner: string          // 公开（默认）
  private balance: number       // 私有，仅类内部访问
  protected accountType: string // 受保护，子类可访问
  readonly accountId: string    // 只读，创建后不可修改

  constructor(owner: string, initialBalance: number) {
    this.owner = owner
    this.balance = initialBalance
    this.accountType = 'checking'
    this.accountId = `ACC-${Date.now()}`
  }

  // 公开方法
  deposit(amount: number): void {
    if (amount <= 0) throw new Error('存款金额必须大于 0')
    this.balance += amount
    console.log(`存款 ${amount}，余额：${this.balance}`)
  }

  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error('余额不足')
    this.balance -= amount
    console.log(`取款 ${amount}，余额：${this.balance}`)
  }

  getBalance(): number {
    return this.balance
  }
}

const account = new BankAccount('Alice', 1000)
account.deposit(500)
account.withdraw(200)
console.log('账户余额：', account.getBalance())
// account.balance  // ❌ private 不可外部访问

// ─────────────────────────────────────────────
// 5.2 构造函数参数简写
// ─────────────────────────────────────────────

class Point {
  // 在构造函数参数前加修饰符，自动声明并赋值属性
  constructor(
    public x: number,
    public y: number,
    private label: string = 'point',
  ) {}

  toString(): string {
    return `${this.label}(${this.x}, ${this.y})`
  }

  distanceTo(other: Point): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
  }
}

const p1 = new Point(0, 0, 'origin')
const p2 = new Point(3, 4)
console.log('Point:', p1.toString(), p2.toString())
console.log('距离：', p1.distanceTo(p2)) // 5

// ─────────────────────────────────────────────
// 5.3 getter / setter 访问器
// ─────────────────────────────────────────────

class Temperature {
  private _celsius: number

  constructor(celsius: number) {
    this._celsius = celsius
  }

  get celsius(): number { return this._celsius }
  set celsius(value: number) {
    if (value < -273.15) throw new Error('温度不能低于绝对零度')
    this._celsius = value
  }

  get fahrenheit(): number { return this._celsius * 9 / 5 + 32 }
  set fahrenheit(value: number) { this._celsius = (value - 32) * 5 / 9 }
}

const temp = new Temperature(100)
console.log('摄氏度：', temp.celsius, '华氏度：', temp.fahrenheit)
temp.fahrenheit = 32
console.log('设置华氏 32°F 后摄氏：', temp.celsius) // 0

// ─────────────────────────────────────────────
// 5.4 静态成员（static）
// ─────────────────────────────────────────────

class IdGenerator {
  private static nextId: number = 1

  static generate(): string {
    return `ID-${IdGenerator.nextId++}`
  }

  static reset(): void {
    IdGenerator.nextId = 1
  }
}

console.log('静态方法：', IdGenerator.generate(), IdGenerator.generate(), IdGenerator.generate())
IdGenerator.reset()
console.log('重置后：', IdGenerator.generate())

// ─────────────────────────────────────────────
// 5.5 implements 实现接口
// ─────────────────────────────────────────────

interface IShape {
  readonly name: string
  area(): number
  perimeter(): number
  describe(): string
}

class Circle implements IShape {
  readonly name = 'Circle'
  constructor(private radius: number) {}

  area(): number { return Math.PI * this.radius ** 2 }
  perimeter(): number { return 2 * Math.PI * this.radius }
  describe(): string {
    return `${this.name}(r=${this.radius}): area=${this.area().toFixed(2)}, perimeter=${this.perimeter().toFixed(2)}`
  }
}

class Rectangle implements IShape {
  readonly name = 'Rectangle'
  constructor(private width: number, private height: number) {}

  area(): number { return this.width * this.height }
  perimeter(): number { return 2 * (this.width + this.height) }
  describe(): string {
    return `${this.name}(${this.width}x${this.height}): area=${this.area()}, perimeter=${this.perimeter()}`
  }
}

const shapes: IShape[] = [new Circle(5), new Rectangle(4, 6)]
shapes.forEach(s => console.log('implements IShape：', s.describe()))

// ─────────────────────────────────────────────
// 5.6 extends 继承
// ─────────────────────────────────────────────

class Animal {
  constructor(protected name: string, protected age: number) {}

  speak(): string { return `${this.name} 发出了声音` }
  toString(): string { return `${this.name}(${this.age}岁)` }
}

class Dog extends Animal {
  constructor(name: string, age: number, private breed: string) {
    super(name, age)
  }

  speak(): string { return `${this.name} 说：汪汪！` } // 重写父类方法

  fetch(): string { return `${this.name} 去捡球了！` }
}

class GoldenRetriever extends Dog {
  constructor(name: string, age: number) {
    super(name, age, 'Golden Retriever')
  }

  speak(): string { return `${super.speak()} (友好地)` } // 调用父类方法
}

const dog = new Dog('Rex', 3, 'Labrador')
const golden = new GoldenRetriever('Buddy', 2)
console.log('继承 speak：', dog.speak())
console.log('多层继承 speak：', golden.speak())
console.log('子类方法 fetch：', dog.fetch())

// ─────────────────────────────────────────────
// 5.7 抽象类（abstract）
// ─────────────────────────────────────────────

abstract class Vehicle {
  constructor(protected brand: string, protected speed: number) {}

  // 抽象方法：子类必须实现
  abstract getFuelType(): string
  abstract getRange(): number

  // 具体方法：子类可直接使用
  describe(): string {
    return `${this.brand} | 速度:${this.speed}km/h | 燃料:${this.getFuelType()} | 续航:${this.getRange()}km`
  }
}

class ElectricCar extends Vehicle {
  constructor(brand: string, speed: number, private batteryCapacity: number) {
    super(brand, speed)
  }
  getFuelType(): string { return '电力' }
  getRange(): number { return this.batteryCapacity * 6 } // 简化计算
}

class GasCar extends Vehicle {
  constructor(brand: string, speed: number, private tankSize: number) {
    super(brand, speed)
  }
  getFuelType(): string { return '汽油' }
  getRange(): number { return this.tankSize * 12 }
}

// const v = new Vehicle('test', 100)  // ❌ 抽象类不能实例化
const vehicles: Vehicle[] = [
  new ElectricCar('Tesla', 250, 100),
  new GasCar('Toyota', 180, 60),
]
vehicles.forEach(v => console.log('抽象类：', v.describe()))

// ─────────────────────────────────────────────
// 导出
// ─────────────────────────────────────────────
export function runClass(): void {
  console.log('\n========== 第五章：类与接口实现 ==========')
  console.log('BankAccount 余额：', account.getBalance())
  console.log('Point 距离：', p1.distanceTo(p2))
  console.log('Temperature 华氏：', new Temperature(0).fahrenheit)
  console.log('IdGenerator：', IdGenerator.generate())
  shapes.forEach(s => console.log(s.describe()))
  console.log('Dog speak：', dog.speak())
  console.log('GoldenRetriever speak：', golden.speak())
  vehicles.forEach(v => console.log(v.describe()))
}
