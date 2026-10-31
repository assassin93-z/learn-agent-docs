# 第 07 课：定时任务与心跳

<p align="center">中文 &middot; <a href="../../en/lessons/07-scheduling/">English</a></p>

本课对应公开 Nami 源码的 `lesson-07/scheduler.py` 和 `bot.py` 的调度增量。重点不是写一个 cron 服务，而是理解 Agent 在无人值守状态下如何持久化任务、限制权限和减少无意义通知。

## 先运行离线示例

```bash
pnpm exec tsx lessons/07-scheduling/demo.ts
pnpm exec vitest run lessons/07-scheduling
```

示例注入假时钟、内存状态和假 runner，演示普通任务、静默心跳、精确预授权、重复 tick 不重跑。不连接模型、Telegram 或真实工具。

## 读代码顺序

1. `time.ts`：`every 30m`、`every 2h`、`daily 09:00`，最短间隔 5 分钟。
2. `store.ts`：可替换的状态存储，JSON 文件写临时文件后原子替换。
3. `scheduler.ts`：按创建者隔离的任务、到期判断、先记下一次再执行、无人值守审批。
4. `tools.ts`：显式注册 `schedule_task`、`list_tasks`、`cancel_task`，不靠 import 副作用。
5. 对照测试理解重启、漏跑、权限和心跳的失败路径。

## 调度行为

最多 20 个任务；每个任务保存 ID、时间规则、prompt、user/chat/workspace、kind、下次执行时刻与精确授权。`daily` 使用当前 Node 进程的本地日历时区，时间戳以 UTC ISO 保存；部署时必须显式确定进程时区，不把服务器时区当成用户时区。此课按 Python 源码范围，不支持 cron、每周或一次性任务。

停机错过多个周期，恢复后只执行一次。下一次从“现在”计算，不补跑全部历史。`tick()` 在执行之前先持久化新的 nextRun，防止模型失败后马上重复同一轮；重叠的 tick 合并为同一个运行中的 Promise。存储失败则根本不开始执行。已经开始的工具副作用不能通过回滚历史撤销，也没有跨进程 exactly-once 保证。

任务每次使用 `fresh: true` 的新历史，不复用交互聊天的 messages 或 remembered permissions。`heartbeat` 只有在回复去掉首尾空白后恰好等于 `HEARTBEAT_OK` 时不发送；普通任务的相同文本或带额外说明的心跳仍会发送。

## 预授权比原版更精确

原版的 `allow="fetch_url,write_file"` 语法保留，但本课不把工具名宽授权直接当成执行许可。无人值守副作用还必须有由用户/应用发出的精确 grant：

```ts
const actor = { chatId: "chat", userId: "learner", workspaceId: "workspace" };
await scheduler.add({
  actor,
  spec: "every 30m",
  prompt: "Read the public status endpoint.",
  allow: "fetch_url",
  grants: [{ actor, name: "fetch_url", args: { url: "https://example.com/status" } }],
});
```

JSON 键的顺序可以不同，但工具名、所有参数值和 actor 三项标识必须完全相同；不同 URL、不同文件内容、额外参数或跨用户/聊天/工作区授权都会拒绝。模型的 `schedule_task` 参数没有 grants 字段，不能给自己签发授权。工具工厂可注入 `grants(actor, allow)` 来取得人已确认的范围。只有工具名而没有 grant 的任务仍可建立，但需要确认的副作用会拒绝。

每次调用顺序为硬规则、风险等级、精确 grant。`run_shell`、创建/取消定时任务永远不能无人值守放行，防止命令执行和递归任务扩张；安全只读工具也必须先过硬规则。硬规则或权限检查失败都拒绝。`PermissionManager` 和 `ToolRegistry` 的执行 guard 仍须保留，不能只在调度层检查一次。

## 存储与注册

`Scheduler.create()` 注入 store/now/runner/send/hardRules/riskOf，不依赖真实环境变量或全局 CURRENT。`JsonTaskStore` 要求状态目录在 Agent 工作区之外，拒绝符号链接和多硬链接，使用同一 no-follow 文件句柄检查并读取，读写均限定 1 MB 的 UTF-8 字节预算。写入权限为 `0600`，临时文件和原目标在替换前也检查链接数，避免原子替换把旧状态的工作区硬链接变成可读取的普通文件。生产集成使用第 04 课的状态目录；运行状态、prompt、grants 和实际用户数据不得提交 Git。

`list(actor)` 和 `remove(id, actor)` 都同时检查 user/chat/workspace。注册时创建与取消工具为 `confirm`，列举为 `safe`；由调用方提供稳定、不可被模型改写的 actor 获取函数。多个进程同时操作同一状态文件需要额外的数据库事务或进程锁，本课只保证单进程排队与原子文件替换，不是 OS sandbox。

## 理解自测

能解释为什么先写 nextRun、为什么漏跑不全部补偿、心跳如何降噪、为什么任务授权不能按工具名无限扩大，以及 actor 与工作区硬规则为什么都不可省略，就能清楚讲述无人值守 Agent 的可靠性与安全边界。
