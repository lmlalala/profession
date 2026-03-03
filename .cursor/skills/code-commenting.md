---
name: code-commenting
description: 为代码添加规范注释，涵盖 JSDoc、JavaDoc、Python docstring 等多语言注释标准。当用户需要添加注释、编写文档注释、检查注释规范、使用 @AI- 前缀标记，或询问注释最佳实践时使用。
---

# 代码注释规范

参考 Google 开源项目风格指南（JSDoc / JavaDoc）及行业最佳实践。

## 核心原则

1. **仅注释非直观内容**：算法选择原因、业务约束、性能权衡，而非描述代码在做什么。
2. **与代码同步更新**：代码修改时必须同步更新注释，过时注释比没有注释更有害。
3. **首句精炼**：文档注释第一句须独立成意，出现在索引和摘要中。
4. **禁止缩写命名**：用 `calculateClickThroughRate()` 而非 `calcCTR()`；用动词+领域对象结构，如 `transformUserBehaviorToEmbedding()`。

---

## 注释类型

### 单行注释

用于解释关键逻辑，`//` 后加一个空格：

```js
// 校验用户权限，未登录用户直接拒绝
if (!user.isAuthenticated) return forbidden();
```

### 多行注释

用于复杂逻辑块，后续行 `*` 对齐：

```js
/*
 * 使用滑动窗口算法，时间复杂度 O(n)。
 * 直接遍历会导致 O(n²)，在数据量 >10k 时性能不可接受。
 */
```

> Google 规范：**不要**用 `/** */` 写实现注释，`/** */` 专用于文档注释（JSDoc/JavaDoc）。

---

## JSDoc 规范（JavaScript / TypeScript）

### 函数 / 方法

```js
/**
 * 将用户行为序列转换为向量嵌入表示。
 *
 * @param {!Array<UserEvent>} events - 用户行为事件列表，不可为空。
 * @param {EmbeddingConfig=} config - 嵌入配置，省略时使用默认模型。
 * @return {!Float32Array} 长度固定为 128 的嵌入向量。
 * @throws {RangeError} 当 events 为空数组时抛出。
 */
function transformUserBehaviorToEmbedding(events, config) { ... }
```

### 类

````js
/**
 * 管理用户会话生命周期，包括创建、刷新和销毁。
 *
 * 示例：
 * ```js
 * const manager = new SessionManager({ ttl: 3600 });
 * const session = manager.createSession(userId);
 * ```
 */
class SessionManager { ... }
````

### 文件级注释

```js
/**
 * @fileoverview 用户认证模块，处理 OAuth2 授权码流程。
 * @see https://tools.ietf.org/html/rfc6749
 */
```

### 常用 JSDoc 标签顺序

`@param` → `@return` → `@throws` → `@deprecated`

---

## JavaDoc 规范（Java）

### 方法

```java
/**
 * 根据用户 ID 查询用户详情，结果从缓存优先读取。
 *
 * <p>缓存未命中时回源数据库，并写入缓存（TTL 5 分钟）。
 *
 * @param userId 用户唯一标识，不可为 {@code null}
 * @return 用户详情，若不存在返回 {@link Optional#empty()}
 * @throws IllegalArgumentException 当 userId 格式非法时
 */
public Optional<User> getUserById(String userId) { ... }
```

### 类

```java
/**
 * 订单处理服务，负责订单创建、支付和退款流程。
 *
 * <p>所有写操作均在事务中执行，失败时自动回滚。
 *
 * @see PaymentGateway
 * @since 2.0
 */
public class OrderProcessor { ... }
```

### JavaDoc 覆盖要求（Google 规范）

- 所有 `public` / `protected` 的类、方法、字段**必须**有 Javadoc。
- 简单的 getter（如 `getFoo()`）若无额外说明可省略。
- 重写父类方法时，Javadoc 非强制，但有额外说明时应补充。

---

## Python Docstring 规范

```python
def calculate_click_through_rate(impressions: int, clicks: int) -> float:
    """计算广告点击率（CTR）。

    使用标准公式 clicks / impressions，impressions 为 0 时返回 0.0
    而非抛出异常，以保持数据管道的健壮性。

    Args:
        impressions: 广告展示次数，须为非负整数。
        clicks: 点击次数，须不大于 impressions。

    Returns:
        点击率，范围 [0.0, 1.0]。

    Raises:
        ValueError: 当 clicks > impressions 时。
    """
```

---

## @AI- 结构化标记规范

在 JSDoc / JavaDoc 注释中使用 `@AI-` 前缀标记，为 AI 工具提供上下文，**不影响**原有文档注释解析。

### 标准标记

| 标记                    | 用途                   | 示例                                                       |
| ----------------------- | ---------------------- | ---------------------------------------------------------- |
| `@AI-Context`           | 说明业务背景或设计约束 | `@AI-Context 该方法仅在用户完成实名认证后调用`             |
| `@AI-Invariant`         | 声明不变量或前置条件   | `@AI-Invariant userId 在调用前已通过权限校验`              |
| `@AI-Perf`              | 标注性能特征或复杂度   | `@AI-Perf 时间复杂度 O(n log n)，n 为事件数量`             |
| `@AI-Deprecated-Reason` | 说明废弃原因和迁移路径 | `@AI-Deprecated-Reason 已由 v2 API 替代，见 UserServiceV2` |
| `@AI-SideEffect`        | 声明副作用             | `@AI-SideEffect 写入审计日志，触发 UserUpdatedEvent`       |
| `@AI-TODO`              | 标记待处理的技术债     | `@AI-TODO 需要支持批量查询以减少 N+1 问题`                 |

### 完整示例

```js
/**
 * 处理用户支付请求，执行风控校验后调用支付网关。
 *
 * @param {PaymentRequest} request - 支付请求对象。
 * @return {Promise<PaymentResult>} 支付结果。
 * @throws {RiskControlException} 风控拦截时抛出。
 *
 * @AI-Context 该方法在高并发场景下被调用，单机 QPS 约 5000。
 * @AI-Invariant request.amount 已在 Controller 层完成格式校验。
 * @AI-SideEffect 成功后写入支付流水表，发送 PaymentSucceededEvent。
 * @AI-Perf 风控校验走本地缓存，P99 延迟 < 5ms。
 */
async function processPayment(request) { ... }
```

---

## TODO 注释规范（Google 风格）

```java
// TODO: https://github.com/org/repo/issues/123 - 替换为批量查询接口
// TODO: b/12345678 - 当 API 稳定后移除降级逻辑
```

格式：`TODO:` + 资源链接（Bug/Issue）+ `-` + 说明文字。

---

## 禁止事项

- 禁止注释重复代码语义：`i++; // i 加 1` ❌
- 禁止注释掉的死代码长期保留，应直接删除并依赖版本控制。
- 禁止用星号框装饰注释块：`//*****//` ❌
- 禁止 `/** */` 用于实现注释（仅用于文档注释）。
- 禁止在注释中保留敏感信息（密钥、密码、内部 URL）。

---

## 参考资源

- [Google JavaScript Style Guide - JSDoc](https://google.github.io/styleguide/jsguide.html#jsdoc)
- [Google Java Style Guide - Javadoc](https://google.github.io/styleguide/javaguide.html#s7-javadoc)
- [Google Python Style Guide - Docstrings](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)
