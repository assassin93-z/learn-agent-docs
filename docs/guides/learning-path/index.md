# 通过 Commit 学习 Agent

<p align="center">中文 &middot; <a href="../../en/guides/learning-path/">English</a></p>

阅读一个提交的差异，运行对应课程的示例与测试，并能解释它必须维持的不变量，
然后再进入下一课。这是架构移植，不是逐行练习 Python 语法。共享运行时有意
放在最后组装，因此较早的每个差异只引入一项能力，并配有测试和文档。

| 提交标题 | 应该能回答的问题 |
| --- | --- |
| `chore(workspace): bootstrap the TypeScript learning project` | 凭据、本地数据与公共依赖如何和 Git 发布内容分离？ |
| `feat(lesson-01): add validated file and shell tools` | 普通代码如何变成模型可以调用的工具？ |
| `feat(lesson-01): implement the minimal agent loop` | 谁执行工具、返回观察结果并结束循环？ |
| `fix(lesson-01): harden file boundaries and bounded reads` | 为什么符号链接、硬链接和读取限制属于工具边界？ |
| `fix(lesson-01): reject malformed replies before tool execution` | 为什么产生任何工具副作用前必须检查整个回复？ |
| `feat(lesson-02): build a validated tool registry and chat loop` | schema、实现和多轮对话如何组合？ |
| `feat(lesson-03): enforce scoped tool permissions` | 为什么用户批准不能覆盖硬性规则？ |
| `feat(lesson-04): manage context and persist sessions` | 什么内容可以压缩而不破坏工具调用组？ |
| `feat(lesson-05): discover and load workspace skills` | 为什么提前加载描述、按需加载指令正文？ |
| `feat(lesson-06): add an allowlisted Telegram channel` | bot 如何在模型轮次等待时继续接收批准？ |
| `feat(lesson-07): schedule scoped tasks and quiet heartbeats` | 重启行为、静默检查与无人值守权限有什么不同？ |
| `feat(lesson-08): connect trusted stdio MCP servers` | 为什么工具发现、可执行程序信任与工具批准是不同步骤？ |
| `feat(lesson-09): delegate isolated and read-only child tasks` | 子任务隔离了什么，哪些限制仍必须由宿主执行？ |
| `feat(lesson-10): enforce reviewed plans and task progress` | 为什么批准计划不等于批准其中的副作用？ |
| `feat(lesson-11): persist approved memory and search sessions` | 为什么稳定事实、会话历史和搜索属于不同存储职责？ |
| `feat(app): compose the full course runtime and learning CLI` | 生命周期、身份与依赖组装应该放在哪里？ |

```bash
git log --reverse --oneline
git show <commit>
pnpm lesson:04:demo
pnpm exec vitest run lessons/04-context
pnpm check
```

每课 README 都说明阅读顺序、Python 到 TS 的映射、失败路径和理解自测。
在较早的提交中，最终运行时才增加的 package 别名尚不可用；请改用
`pnpm exec tsx lessons/NN-name/demo.ts` 及对应课程的测试路径。
第 01 课的原始示例在真实 shell 操作前需要交互确认。

## 推荐练习

从第 01–03 课开始，画出准确时序：模型请求、提出工具调用、运行时校验、
权限判断、执行、观察结果、下一次模型请求。用第 04–05 课理解上下文成本和指令。
再通过第 06–07 课把一次性 CLI 扩展为有状态、可无人值守的应用。
最后学习第 08–11 课，解释可扩展性、受限委派、经审核的执行和记忆。

每个阶段都主动触发一次拒绝和一次失败。验证非法参数绝不进入工具，拒绝操作
没有副作用，格式错误或失败的请求不会破坏已保存的完整对话组。
不要一开始就引入隐藏这些边界的大框架或 UI。

最终运行时提交之后，可用 `pnpm agent -- --lesson N --demo` 查看累计到第 N 课
的组合能力，也可用 `pnpm demos` 重温独立示例。连接真实模型时，只在被忽略的
配置中使用个人凭据。真实模型 / 消息渠道行为要单独记录，不要与确定性示例混为一谈。

用[功能对照](../course-map/index.md)作为完成检查表，再通过
[架构指南](../architecture/index.md)整理包含取舍与限制的架构讲解，而不只是描述
正常路径的 API 调用。
