---
name: code-naming
description: 为代码应用符合 Google 开源规范的命名规则，涵盖 JavaScript/TypeScript、Java、Python、Go 多语言命名风格，包括变量、函数、类、常量、文件/目录及语义一致性约束。当用户需要命名变量、函数、类、文件，检查命名规范，或进行重命名时使用。
---

# 代码命名规范

基于 Google 开源风格指南：[JS](https://google.github.io/styleguide/jsguide.html) / [Java](https://google.github.io/styleguide/javaguide.html) / [Python](https://google.github.io/styleguide/pyguide.html) / [Go](https://google.github.io/styleguide/go/guide)

---

## 多语言快速对照表

| 场景        | JavaScript / TypeScript | Java                  | Python                | Go                         |
| ----------- | ----------------------- | --------------------- | --------------------- | -------------------------- |
| 变量        | `lowerCamelCase`        | `lowerCamelCase`      | `lower_with_under`    | `lowerCamelCase`           |
| 函数 / 方法 | `lowerCamelCase`        | `lowerCamelCase`      | `lower_with_under()`  | `MixedCaps`                |
| 类          | `UpperCamelCase`        | `UpperCamelCase`      | `CapWords`            | `UpperCamelCase`           |
| 接口        | `UpperCamelCase`        | `UpperCamelCase`      | —                     | `UpperCamelCase`           |
| 常量        | `UPPER_SNAKE_CASE`      | `UPPER_SNAKE_CASE`    | `CAPS_WITH_UNDER`     | `MixedCaps`（非 ALL_CAPS） |
| 包 / 模块   | —                       | `lowercase`           | `lower_with_under`    | `lowercase`（无下划线）    |
| 文件        | `kebab-case.ts`         | `UpperCamelCase.java` | `lower_with_under.py` | `lower_with_under.go`      |
| 目录        | `kebab-case`            | `kebab-case`          | `kebab-case`          | `kebab-case`               |

---

## JavaScript / TypeScript（Google JS Style Guide）

```ts
// 变量 / 函数 / 方法 → lowerCamelCase
const userName = 'Alice';
function getUserById(id: string): User { ... }

// 类 / 接口 → UpperCamelCase
class OrderProcessor { ... }
interface PaymentGateway { ... }

// 常量 → UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// 文件名 → kebab-case（全小写，连字符分隔）
// user-service.ts  order-processor.ts

// 目录名 → kebab-case（所有语言统一）
// user-service/  order-management/  payment-gateway/
```

**枚举**：枚举名 `UpperCamelCase`，枚举值 `UPPER_SNAKE_CASE`：

```ts
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
```

---

## Java（Google Java Style Guide）

```java
// 变量 / 方法 → lowerCamelCase
String userName = "Alice";
public Optional<User> getUserById(String userId) { ... }

// 类 / 接口 / 枚举 → UpperCamelCase
public class OrderProcessor { ... }
public interface PaymentGateway { ... }

// 常量（static final）→ UPPER_SNAKE_CASE
static final int MAX_RETRY_COUNT = 3;
static final String API_BASE_URL = "https://api.example.com";

// 包名 → 全小写，无下划线
// com.example.userservice  com.example.ordermanagement

// 文件名 → 与顶级类名一致（UpperCamelCase.java）
// OrderProcessor.java  UserService.java

// 目录名 → kebab-case
// user-service/  order-management/
```

**非常量字段**（即使是 `static`）使用 `lowerCamelCase`，不使用 `UPPER_SNAKE_CASE`。

---

## Python（Google Python Style Guide）

```python
# 变量 / 函数 / 方法 / 参数 → lower_with_under
user_name = 'Alice'
def get_user_by_id(user_id: str) -> User: ...

# 类 / 异常 → CapWords（UpperCamelCase）
class OrderProcessor: ...
class PaymentError(Exception): ...

# 常量 → CAPS_WITH_UNDER
MAX_RETRY_COUNT = 3
API_BASE_URL = 'https://api.example.com'

# 模块 / 包 → lower_with_under（文件名不能含连字符）
# user_service.py  order_processor.py

# 目录名 → kebab-case（与其他语言保持一致）
# user-service/  order-management/

# 受保护成员 → 单下划线前缀
_internal_cache: dict = {}

# 私有成员 → 避免双下划线（影响可测试性），优先单下划线
```

**Python 禁止命名**（Google 规范）：

- 禁止单字符名（除 `i/j/k` 循环变量、`e` 异常、`f` 文件句柄）
- 禁止文件名含连字符（`-`）
- 禁止名称中包含类型信息（如 `id_to_name_dict` → 改为 `id_to_name`）

---

## Go（Google Go Style Guide）

```go
// 变量 / 函数 / 方法 → MixedCaps（导出大写开头，未导出小写开头）
userName := "Alice"
func getUserByID(id string) (*User, error) { ... }  // 导出
func parseConfig(path string) (*Config, error) { ... } // 未导出

// 类型（struct / interface）→ MixedCaps
type OrderProcessor struct { ... }
type PaymentGateway interface { ... }

// 常量 → MixedCaps（不使用 ALL_CAPS，这是 Go 特有规范）
const MaxRetryCount = 3       // 导出常量
const defaultTimeout = 5000   // 未导出常量

// 包名 → 全小写，无下划线，无连字符，简短
// package userservice  package oauth2

// 文件名 → lower_with_under.go
// user_service.go  order_processor.go

// 目录名 → kebab-case（与其他语言保持一致）
// user-service/  order-management/
```

**Go 特有规范**：

- 缩写词全大写或全小写，不混用：`userID`（非 `userId`）、`parseURL`（非 `parseUrl`）
- Receiver 变量用 1-2 个字母缩写，与类型一致：`func (op *OrderProcessor) Process()`
- 包名避免 `util`、`common`、`helper`、`model` 等无意义名称

---

## 目录命名规范（跨语言统一）

**所有语言的目录名统一使用 `kebab-case`**（全小写，连字符分隔），不随语言文件命名风格变化。

```
// ✅ 正确目录结构示例
src/
├── user-service/
│   ├── user-service.ts        # JS/TS 文件
│   ├── UserService.java       # Java 文件
│   ├── user_service.py        # Python 文件
│   └── user_service.go        # Go 文件
├── order-management/
├── payment-gateway/
└── api-module/
```

**目录命名规则**：

- 全小写，单词间用连字符（`-`）分隔
- 反映模块/领域职责，使用名词或名词短语
- 禁止使用无意义名称：`utils/`、`common/`、`helpers/`、`misc/`
- 禁止使用下划线（`_`）或大写字母

---

## 通用命名原则

### 函数命名结构

优先使用**动词 + 领域对象**，禁止缩写：

| 动词            | 领域对象示例                      |
| --------------- | --------------------------------- |
| `get` / `fetch` | `User` / `Order` / `Config`       |
| `calculate`     | `TotalPrice` / `ClickThroughRate` |
| `transform`     | `UserBehaviorToEmbedding`         |
| `validate`      | `PaymentRequest`                  |
| `handle`        | `SubmitEvent`                     |

```
// ❌ 禁止缩写
calcCTR()  usrNm  tmpVal

// ✅ 正确
calculateClickThroughRate()  userName  temporaryValue
```

### 布尔值命名

以 `is`、`has`、`can`、`should` 开头（Go 中可省略 `is` 前缀）：

```ts
// JS/TS/Java
const isAuthenticated = true;
const hasPermission = false;
```

```python
# Python
is_authenticated = True
has_permission = False
```

```go
// Go（exported 字段可省略 Is 前缀）
type User struct {
    Authenticated bool   // 导出字段
    hasPermission bool   // 未导出字段
}
```

### 语义一致性

同一模块内，相同概念必须统一词汇，不允许混用同义词：

| 概念 | 常见同义词                               | 选一个统一       |
| ---- | ---------------------------------------- | ---------------- |
| 类型 | `type` / `kind` / `category` / `section` | 统一后全模块一致 |
| 数量 | `count` / `num` / `total` / `size`       | 统一后全模块一致 |
| 标识 | `id` / `key` / `code` / `no`             | 统一后全模块一致 |
| 数据 | `data` / `info` / `detail` / `record`    | 统一后全模块一致 |

---

## 命名检查清单

- [ ] 目录名使用 `kebab-case`，无下划线、无大写
- [ ] 使用了当前语言对应的大小写风格（参考多语言对照表）
- [ ] 无自造缩写（行业公认缩写如 `id`、`url`、`api` 可保留）
- [ ] 函数名含动词，清晰表达行为
- [ ] 布尔值以 `is` / `has` / `can` / `should` 开头
- [ ] Go 缩写词全大写或全小写（`userID` 非 `userId`）
- [ ] Python 文件名无连字符，变量名无类型后缀
- [ ] 同模块内同义词已统一，无混用
