# 第 06 课：把 Agent 接到聊天渠道

<p align="center">中文 &middot; <a href="../../en/lessons/06-chat-channel/">English</a></p>

本课对应公开 Nami 源码的 `lesson-06/telegram.py`、`bot.py` 和 `agent.py` 的会话改造。核心循环依然负责模型与工具，渠道层只负责收消息、确认、回复和会话生命周期。

## 先运行离线示例

```bash
pnpm exec tsx lessons/06-chat-channel/demo.ts
pnpm exec vitest run lessons/06-chat-channel
```

示例使用假消息和假 runner，不连接 Telegram 或模型、不写文件、不执行 shell。它演示收到一条消息、请求确认、后续轮询消费确认、保存历史、执行 `/reset`。

## 读代码顺序

1. `types.ts`：`ChatActor`、`TurnRunner` 和 `SessionLifecycle` 是渠道与核心的边界。
2. `telegram.ts`：显式 token、`getUpdates` 长轮询、单调 offset、私聊文本筛选、分段发送。
3. `approvals.ts`：把一次工具调用绑定到发起人的 user、chat、workspace 和唯一 request ID。
4. `bot.ts`：用户白名单、每聊天串行队列、独立聊天并行、历史回滚、`/reset`。
5. 对照三个测试文件，理解为什么等待确认时不能阻塞下一次轮询。

## 为什么不能直接 await 每条消息

如果 `poll -> await runner -> await 用户确认`，程序就无法再次 `poll`，永远收不到确认回复。本课的 `pollOnce()` 只负责分派，`handle()` 把普通消息排入聊天队列；确认回复在进入队列之前由 broker 消费。`drain()` 用于等待已分派的工作结束。

关停应先调用幂等的 `stop()`，再用 `shutdown()` 等待已开始的工作结束。停止会取消长轮询、重试等待和待审批请求，拒绝新的消息/审批，并跳过尚未开始的排队 turn；不能直接取消审批后 `drain()`，否则队列会继续发起新审批，而程序已经不再轮询。已开始的模型请求或工具仍需核心层配合超时与关闭 guard，不能靠渠道取消来撤销副作用。

同一 chat 的消息严格串行，防止模型历史和工具结果交错；不同 chat 可以同时运行。历史和 remembered grants 仍必须按 `ChatActor` 的三项标识隔离，不能只用一个全局 messages 数组。`SessionLifecycle` 的 snapshot/restore/save/reset 可接第 04 课的状态存储，runner 出错时恢复的是消息历史，不是已经发生的文件或网络副作用。

## 确认边界

```text
y request-id
n request-id 先列出文件再修改
a request-id
```

`a` 只对 `write_file` 表示本会话持续允许；shell 必须每条单独确认。默认 120 秒不回复就拒绝。与 Python 原版只匹配 chat 的做法不同，本课同时匹配 user/chat/workspace，并要求 request ID，避免他人批准或旧 `y` 批准下一次操作。发送失败、超时、无法完整展示参数、重叠请求均拒绝；`/reset` 或服务停止会取消待确认请求。

审批展示真实工具名与完整 JSON 参数，不依赖模型对操作的自述；提示的所有分段完整发送成功之后才接受允许回复。最终执行仍须经过第 03 课硬规则，broker 的同意不能越过工作区、只读技能目录或危险 shell 限制。

## 接入真实 Telegram

由应用显式传入 `token` 和非空 `allowedUsers`，不要在源码、测试、README 或 Git 中放真实 token、用户 ID、机器路径或会话数据。`TelegramChannel` 固定请求公开的 `https://api.telegram.org`，不读取环境中的自定义 header，不跟随重定向，报错不回显包含 token 的 URL。

这里只接受 Telegram 私聊中的用户文本，不处理群组、频道或文件。发送按最多 4000 个 UTF-16 单位分段，保留 Unicode 代理对；不启用 Markdown/HTML 解析模式，避免把工具输出当作格式指令。

## 理解自测

能解释长轮询 offset 的作用、审批等待的死锁风险、为什么必须绑定 user 和 chat、为什么同一会话要串行，以及异常回滚为什么只能撤销历史不能撤销副作用，就掌握了本课的架构重点。
