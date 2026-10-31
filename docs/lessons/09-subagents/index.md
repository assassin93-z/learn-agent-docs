# 第 09 课：独立的子 Agent

<p align="center">中文 &middot; <a href="../../en/lessons/09-subagents/">English</a></p>

Python 参考实现为有边界的子任务引入了独立会话。TypeScript 通过显式依赖实现相同的边界，
而不是依赖全局的“当前会话”状态。每个子 Agent 都有自己的系统提示词、任务、历史记录、
工具集合，以及最多 15 轮的模型调用。只有长度受限的结论会返回给父 Agent；
读取文件等操作产生的大量中间内容留在子 Agent 的上下文中。

```sh
pnpm exec tsx lessons/09-subagents/demo.ts
pnpm exec vitest run lessons/09-subagents
```

离线 demo 使用注入的确定性模型。测试还验证了实际工具结果不会泄漏到父 Agent，
父 Agent 的历史记录也不会被带入子 Agent，确保两者之间的上下文边界。

`createSubagentTools({ client, registry, isReadOnly, ... })` 返回 `delegate`
和 `delegate_parallel`，只应将它们注册给父 Agent。默认模式是 `explore`，
只提供被明确标记为 `safe` 的工具定义。`worker` 可以访问其他工具，但每次调用都必须
经过**原始注册表执行器**，继续执行参数校验、归属检查、硬性规则和审批回调。
批准委派任务，绝不等于批准写入文件。

子 Agent 不能继续委派任务、管理定时任务、修改父 Agent 的计划、批准执行计划，
也不能记忆事实。并行委派支持一到三个只读子 Agent，按任务顺序返回结果；
即使多个调用方使用同一个工厂，整体并发数量也受到限制。`worker` 必须单独运行。
结果文本会被截断，一个子 Agent 出错不会清除其他子 Agent 的结果，
也不会暴露模型服务的原始异常。

## 计划模式

接入第 10 课时，传入 `isReadOnly: () => planningState.mode === "plan"`。
在计划模式中创建的子 Agent，即使父 Agent 后来解除该模式，也始终保持只读。
包装器会在实际执行时再次检查限制，因此即使是在模型请求发出后才进入计划模式，
也仍然能够阻止先前向模型展示过的写入工具。效果未经审查的 MCP 工具不会提供给
`explore` 子 Agent，即使服务端将其标为只读也不例外；只有你审查过的安全工具配置
才值得信任。

## 理解自测

解释为什么子 Agent 是上下文边界，却不会自动成为操作系统沙箱；为什么仅靠描述文字
不能限制工具；什么时候并行调查才是安全的；以及父 Agent 的原始执行器如何防止委派
变成权限提升路径。同一个模型客户端可以服务多个异步子 Agent，但每个请求都必须
保持独立，且客户端本身需要支持并发使用。
