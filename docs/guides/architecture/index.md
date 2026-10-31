# 面向前端开发者的 Agent 架构

<p align="center">中文 &middot; <a href="../../en/guides/architecture/">English</a></p>

Agent 不是一个能直接修改你电脑的模型，而是由宿主管理的循环：模型提出操作，
普通的 TypeScript 代码校验并授权，工具执行，然后把观察结果作为下一次模型输入。
身份、状态、权限、限制和生命周期都由宿主掌控；模型文本本身不拥有这些特权。

## 跟踪一轮执行

```text
CLI or private-chat text + trusted actor
  -> CourseApp.runTask
  -> AgentSession.run (history snapshot and serialized turn)
  -> ContextManager.prepare (only from lesson 04)
  -> ModelClient.complete (system + history + tool schemas)
  -> assistant tool calls
  -> ToolRegistry (JSON parse -> schema -> guard)
  -> plan/read-only checks -> hard rules -> human/exact grant approval
  -> tool implementation -> bounded observation + matching tool_call_id
  -> next model request, until completion or round limit
  -> validated session save -> channel/terminal output
```

`src/course.ts` 是组合入口：注入依赖、累计注册能力；仅导入模块不会启动 bot
或任意 MCP 服务。`src/session.ts` 负责消息回滚和保存；`src/cli.ts` 负责配置、
终端 / bot 生命周期和经过脱敏的顶层诊断。

可以用熟悉的前端概念定位各层职责：

| 前端概念 | Agent 对应能力 | 关键差异 |
| --- | --- | --- |
| HTTP 请求 DTO | 工具 JSON Schema | TypeScript 类型在运行时消失，模型参数仍须校验。 |
| 服务注册表 / 路由 | ToolRegistry | 发现阶段描述能力，执行守卫真正落实授权。 |
| UI 状态 / reducer | 消息历史与 PlanningState | 每次状态变换都必须保留工具结果 ID 和完整调用组。 |
| 中间件 / 路由守卫 | PermissionManager | 批准不能覆盖路径、归属、计划模式或只读等硬性规则。 |
| 代码分割 | Skill 发现与 `load_skill` | 小型描述始终可见，较大的指令正文按需加载。 |
| API 客户端适配器 | TelegramChannel 与 MCPServer | 服务商错误可能含秘密；传输与信任是不同边界。 |
| Worker 任务 | 子 Agent | 独立上下文不等于操作系统隔离，也不能提升权限。 |
| 本地存储 | SessionStore 与 MemoryStore | 存储私有、按归属隔离、大小受限，不是模型可写的配置。 |

## 状态与并发

每个对话都属于 `ChatActor { chatId, userId, workspaceId }`。工作区 ID 由规范化
路径生成；身份状态保存在外部状态目录下的哈希子目录中。模型文本和输入任务
都不能选择这个身份。CLI 使用本地身份；Telegram 提供经过验证的私聊发送者 ID。
不同归属不共享记住的批准、会话文件或记忆。

同一聊天的轮次排队执行。轮询不会被模型轮次阻塞，因此审批代理可以立即接收
正在等待的用户答复。不同聊天可以并发。不要用可变的全局“当前聊天 / 当前会话”
来路由工具结果或审批。worker 子任务独立执行，避免相互竞争的副作用；
并行 explore 子任务最多三个，只暴露安全工具。

发生错误时，`AgentSession` 恢复历史快照，但已经接受的文件写入或网络副作用
不会消失。关闭时先停止聊天派发与待定审批，再关闭应用守卫 / MCP 进程，
并等待已启动的工作结束。关闭后才到达的模型回复不能继续发起请求或执行工具。
已有的外部副作用仍需要各自的超时与清理。

## 上下文、计划与记忆

上下文有三种不同的变换：截断单条观察结果；保留工具调用组但清空旧观察内容；
对较早的完整轮次做摘要。默认 token 预算只是字符数量的近似值，也可以注入
真实 token 使用量。摘要会丢失信息；摘要失败时保留合法历史，而不是编造事实。
Skill 正文按需作为观察结果加载，项目说明和记忆快照则在受控的会话边界进入上下文。

`/plan TASK` 将宿主状态切换为只读。`update_plan` 跟踪数量受限的步骤；
`submit_plan` 针对精确的计划请求新的批准，只有批准后才改变宿主模式。
它不授权之后的写入、shell、MCP 调用或记忆修改。实际副作用仍需经过注册表守卫。

记忆保存的是已批准的稳定事实，不是偷偷记录每个任务。`remember` 每次真正新增、
替换或删除记忆时都要请求批准，并通过位于工作区外、容量受限的存储写入。
下一会话获得记忆快照；不会悄悄重写当前会话的 system 文本。
`search_sessions` 只从当前归属已保存的会话中返回少量、长度受限的 user / assistant
片段，不返回 system 提示或工具结果。这里是关键词检索，不是向量 RAG。

<a id="scheduled-grants"></a>

## 定时任务的精确授权

在组合应用中，调度是聊天 / bot 能力。时间语法为 `every 5m`、`every 2h`
或 `daily 09:00`；最小间隔五分钟，最多二十个任务。每日规则应显式设置进程时区。
参考源码的范围内没有 cron、每周或一次性调度器。

调度器先推进并持久化 `nextRun`，再调用 runner；使用新的历史与权限管理器，
并合并错过的执行周期。静默心跳只抑制去除首尾空白后精确等于 `HEARTBEAT_OK`
的回复，普通结果仍会发送。心跳静默规则不会抑制失败回复，但消息投递仍可能失败，
副作用也不保证恰好执行一次。

若要预先批准一个需要确认的操作，在工作区之外创建被 Git 忽略的
`.runtime/grants.json`。从本地启动日志取得工作区范围标识，再填入你个人的
私聊 / 用户 ID 和经过审核的精确参数：

```json
[
  {
    "actor": {
      "chatId": "YOUR_PRIVATE_CHAT_ID",
      "userId": "YOUR_ALLOWED_USER_ID",
      "workspaceId": "YOUR_LOGGED_WORKSPACE_SCOPE"
    },
    "name": "fetch_url",
    "args": { "url": "https://example.com/status" }
  }
]
```

这些 ID 是占位符，不是有效授权。JSON 由用户提供，绝不能由 `schedule_task`
自行编写：

```bash
pnpm bot --grants-file .runtime/grants.json
```

让 Agent 对该精确 URL 创建任务，并指定 `allow="fetch_url"`。匹配要求全部身份
字段、工具名和所有参数值一致；路径、内容、URL、额外参数或归属有任何变化都会
拒绝。单独的工具名列表永远不构成授权。只读工具仍需满足硬性规则；无人值守时
禁止 shell、调度修改、递归委派和记忆修改。
worker 子任务复用同一归属的权威执行器，只能产生已经精确授权的副作用，不能
自己签发或扩大授权。精确 URL 批准也不是网络隔离：DNS 和服务端内容可能改变，
此 fetch 适配器不屏蔽私有地址，也不固定 DNS 解析结果。审核目标的可信度，
避免访问公司服务；生产环境无人值守的 fetch 除参数匹配外还需要外部网络策略。

## 架构讲解路径

先解释最小循环，再为每项能力举一个具体的失败边界。不要把审批对话框或
子 Agent 说成沙箱。

1. 宿主如何证明某个工具结果属于它声明的调用？
2. 参数不合法、操作被拒绝或模型始终不结束时，会发生什么？
3. 为什么批准需要可信身份与精确的待执行参数同时绑定？
4. 压缩如何在限制成本的同时保留完整工具调用组？
5. 为什么等待用户批准时仍需继续轮询？
6. 为什么定时任务的工具名白名单和交互中记住的权限都不够？
7. 被信任的 MCP 可执行程序拥有哪些权限，为什么不能相信它自己的安全注解？
8. 为什么计划批准或父 Agent 委派不能授权子任务的副作用？
9. 记忆和历史消息搜索为什么是两种能力，这里没有实现什么？
10. 哪些真实集成和生产保证还需要单独验证？

用可执行示例与失败路径测试作为证据。生产环境需要增加真实 token 计量、
持久事务存储、进程 / 容器隔离、模型与消息渠道监控，以及明确的运维策略，
而不是假装这个教学运行时已经提供了它们。
