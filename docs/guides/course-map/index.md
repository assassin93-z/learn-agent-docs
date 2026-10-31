# 公开源码与 TypeScript 功能对照

<p align="center">中文 &middot; <a href="../../en/guides/course-map/">English</a></p>

参考资料是公开课程与可下载的 Python 项目，不是本地公司系统。可执行源码到
第 11 课为止。第 12–18 课是学习文章，下载包中没有对应的独立源码；本仓库
不会假装移植了并不存在的代码。

完成代码学习后，可以继续阅读这些公开架构文章：

| 课程 | 架构阅读 |
| --- | --- |
| 12 | [Claude Code](https://namiai.tech/articles/agent-claude-code/) |
| 13 | [Codex](https://namiai.tech/articles/agent-codex/) |
| 14 | [Pi](https://namiai.tech/articles/agent-pi/) |
| 15 | [Grok Bot](https://namiai.tech/articles/agent-grok/) |
| 16 | [DeepSeek Harness](https://namiai.tech/articles/agent-deepseek-harness/) |
| 17 | [OpenClaw 与 Hermes](https://namiai.tech/articles/agent-openclaw-hermes/) |
| 18 | [整体比较](https://namiai.tech/articles/agent-comparison/) |

文章中的 Hooks、操作系统沙箱、云端浏览器、插件和树状会话属于工业级实现对比
或后续学习方向，不是下载包或本教学移植已经实现的功能。

Python 课程在每课重复累计的文件；本版本每项能力只保留一份可复用实现，
再由 `src/course.ts` 组合。根 CLI 支持第 02–11 课的累计能力，第 01 课保持独立
且尽可能小。

| 课程 | Python 新增内容 | TypeScript 对应实现 | 离线入口 |
| --- | --- | --- | --- |
| [01](../../lessons/01-minimal-loop/index.md) | `agent.py`：文件 / shell 工具与有轮次限制的模型循环 | `01-minimal-loop/{tools,model,agent,cli}.ts` | `pnpm lesson:01:demo`（交互式 shell 批准） |
| [02](../../lessons/02-tool-system/index.md) | `tools.py`、多轮 CLI | `02-tool-system/{registry,tools,agent}.ts` | `pnpm lesson:02:demo` |
| [03](../../lessons/03-permissions/index.md) | `permissions.py`：硬性规则与确认 | `03-permissions/permissions.ts` | `pnpm lesson:03:demo` |
| [04](../../lessons/04-context/index.md) | `context.py` 与对话持久化 | `04-context/{context,sessions}.ts` | `pnpm lesson:04:demo` |
| [05](../../lessons/05-skills/index.md) | `skills.py`：项目说明、发现与正文按需加载 | `05-skills/skills.ts` | `pnpm lesson:05:demo` |
| [06](../../lessons/06-chat-channel/index.md) | `telegram.py`、`bot.py`：消息渠道、队列与批准 | `06-chat-channel/{telegram,approvals,bot}.ts` | `pnpm lesson:06:demo` |
| [07](../../lessons/07-scheduling/index.md) | `scheduler.py`：间隔 / 每日任务与心跳 | `07-scheduling/{time,store,scheduler,tools}.ts` | `pnpm lesson:07:demo` |
| [08](../../lessons/08-mcp/index.md) | `mcp_client.py`、本地示例服务 | `08-mcp/{mcp,demo-server}.ts` | `pnpm lesson:08:demo` |
| [09](../../lessons/09-subagents/index.md) | `subagent.py`：explore、worker 与并行子任务 | `09-subagents/subagents.ts` | `pnpm lesson:09:demo` |
| [10](../../lessons/10-planning/index.md) | `planning.py`：计划模式、进度与经审核的退出 | `10-planning/planning.ts` | `pnpm lesson:10:demo` |
| [11](../../lessons/11-memory/index.md) | `memory.py`：稳定事实与历史搜索 | `11-memory/memory.ts` | `pnpm lesson:11:demo` |

表中路径相对于 `lessons/`。每课都有确定性测试和独立 README，点击课号即可打开中文课程说明。
`src/{session,course,cli}.ts` 提供归属管理、累计注册、终端 / Telegram 生命周期、
调度和外部配置。

## 按能力验收

循环保留 `tool_call_id`，按顺序执行并返回观察结果，明确区分结束与达到轮次上限。
注册表在权限判断或执行前校验参数。基础工具包括目录列表、读取、写入、shell
和受限的公共 URL 文本抓取。多轮历史从第 02 课开始保存在内存，第 04 课开始
持久化到磁盘。长观察结果可截断、清理或摘要，但不能破坏完整的工具调用组。
Skill 正文通过受保护的工具加载。

聊天输入受白名单限制，同一聊天串行执行，模型轮次运行时仍能接收批准。
定时任务先持久化再执行，合并错过的周期，使用全新历史；心跳只抑制精确的
`HEARTBEAT_OK`。MCP 完成初始化、分页工具发现、并发 JSON-RPC 响应匹配、
工具调用和进程关闭。子任务有独立历史、轮次与深度限制，仅只读任务可并行，
并沿用原宿主权限执行器。计划在审核前禁止副作用；开始执行后仍要请求工具权限。
经批准的稳定记忆注入新会话，历史搜索返回长度受限的片段，不把所有会话塞进提示词。

<a id="intentional-differences"></a>

## 有意的差异

- 即使应用使用 TypeScript 类型，工具参数在运行时仍不可信。注册表在执行前校验文档说明的 JSON Schema 子集，而不是完整标准。审核外部 MCP 的 schema 和服务实现，不要依赖未支持的关键字。
- 工作区路径拒绝目录穿越、逃逸的符号链接和多重硬链接文件。工作区内部安全的符号链接可以解析到允许的普通目标；私有状态、指令、授权与 MCP 配置另有更严格的链接检查。这不是全面的恶意文件系统竞态防护。
- shell 必须经过明确审核，输出与时间受限，敏感环境值会被移除。获准的 shell 仍能访问工作区外的资源；命令过滤不是操作系统沙箱。
- HTTP fetch 需要精确人工批准或精确的定时授权，拒绝非 HTTP(S) 协议与 URL 凭据，限制文本和时间，不跟随重定向。它不屏蔽私有 / 回环地址，也不固定 DNS：批准 URL 就是在信任其网络目标。测试注入响应，不访问公司地址或个人已认证 HTTP 会话。
- Git 与运行状态明确分离。会话和记忆属于位于工作区外的私有状态，不是普通 Agent 文件工具可修改的文件。自定义工作区 / 状态路径发布前仍需人工审核。
- 默认上下文预算按字符近似估算 token，不是模型专用 tokenizer。宿主可通过 `updateUsage` 注入服务商使用量；真实摘要会产生额外付费请求，也可能丢失信息。
- Telegram 只接收白名单用户的私聊文本。批准绑定用户、聊天、工作区、请求 ID 和精确展示的参数，绝不会把过期的裸 `y` 当成当前许可。
- 定时任务里的 `allow` 工具名本身不授权副作用。用户提供的外部授权必须匹配身份、工具名和全部参数。shell、调度修改、递归委派与记忆更新不是无人值守能力。
- MCP 必须显式启用，启动可执行程序须审核，子进程环境经过精简。只读子任务只能使用宿主审核的安全工具；服务端注解不能提升信任。课程只处理文本，不支持富媒体，并拒绝服务端索取 roots 或模型访问能力的请求。
- 子 Agent 是上下文边界，不是不同的操作系统安全主体。worker 独立运行，复用原父级执行器；只有只读子任务可并行，最多三个，且不允许递归委派。
- 计划和记忆是应用掌控的状态。计划批准不能免除写入批准；即使记住了文件写入许可，每次真正修改记忆仍需新的决定。
- 对话回滚不会撤销已经接受的工具副作用。文件存储在说明的限制内有容量边界并采用原子替换；调度是单进程机制，不是分布式恰好一次执行。

## 验证边界

`pnpm check`、独立示例和组合示例使用确定性的模型、时钟、HTTP、批准和消息
渠道测试替身，同时实际执行文件操作与仓库自带的本地 stdio MCP 进程。
这些检查不验证模型推理质量、真实模型凭据、Telegram 投递、任意 MCP 服务、
分布式部署或 Windows 后代进程清理。个人集成应单独配置，并如实记录验证结果。
