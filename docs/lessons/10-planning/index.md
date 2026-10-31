# 第 10 课：待办列表与经过审批的执行计划

<p align="center">中文 &middot; <a href="../../en/lessons/10-planning/">English</a></p>

两个都叫“计划”的概念，解决的是不同问题。`update_plan` 是短期的待办列表，
帮助 Agent 跟踪任务进度。计划模式则是**授权边界**：先调查，把执行计划展示给人，
只有获得本次明确审批后，才允许解除对副作用的限制。

```sh
pnpm exec tsx lessons/10-planning/demo.ts
pnpm exec vitest run lessons/10-planning
```

离线 demo 使用一个显式回调，批准一份固定的示例计划；它不会修改项目文件。
生产环境的调用方必须提供真正的人类审批界面，而不是直接复制这个 demo 回调。

## 接入方式

每个会话创建一个 `PlanningState`。由用户命令调用 `state.enterPlanMode(task)`；
进入或退出计划模式不是可由模型任意控制的通用状态设置操作。
`createPlanningTools(state, { approvePlan, messages })` 返回两个工具定义。
`submit_plan` 的工厂内部会单独发起本次审批，因此外层权限模块应对这个工具执行
硬性规则，但不应重复询问审批。它的风险元数据仍然是 `confirm`。

`state.checkTool(name, risk, args)` 是模式层面的硬性决策，必须在普通副作用审批
**之前**执行。即使之前的会话批准过某些工具，计划模式仍会拒绝未知风险和未经审查的
MCP 工具。`worker` 委派会被拒绝，只读子 Agent 仍然可以进行调查。
还需要传入第 09 课的 `isReadOnly` 回调，使子 Agent 在整个生命周期内继承这些限制。

每个工具都通过 `protectPlanningTool(definition, state)` 注册，保证在实现真正运行前
再次检查模式，包括等待异步审批结束之后。向循环传入 `guardPlanningTools(registry, state)`，
既隐藏不可用的工具 schema，**也**拒绝伪造的工具调用。原始注册表仍然负责参数校验、
归属检查和逐工具审批。批准执行计划，不会赋予全局的文件写入或 shell 执行权限。

待办输入有大小限制、参数校验，并会克隆为快照；同一时间只能有一个步骤处于
`in_progress`。更新待办时会压缩旧的计划工具结果，但不会删除调用/结果配对或无关文本。
拒绝审批或审批失败，都会让计划模式保持开启。任务变化或待办版本变化会使待处理审批
失效，因此过期的一次点击不能解除新任务的限制。

## 理解自测

解释为什么告诉模型“不要写入”不构成权限边界；为什么只过滤工具 schema 还不够；
为什么缓存的批准不能覆盖模式限制；以及为什么待办列表不能证明执行计划已经获得审批。
