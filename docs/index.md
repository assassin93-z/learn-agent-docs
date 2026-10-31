# Learn Agent

<p align="center">中文 &middot; <a href="en/">English</a></p>

::: info 文档阅读范围
本站只公开课程文档，不提供私有 TypeScript 源码或 Git 历史。运行示例需要取得源码检出目录；本站不会在线执行 Agent。
:::


用 TypeScript 和 Node.js 搭建 Agent，每次只增加一项能够解释清楚的能力。
这是一个独立的学习项目，参考公开的
[Nami Agent 课程](https://namiai.tech/agent/)，其可下载的 Python 源码包含第 01–11 课。
本项目不是生产级 Agent，也不是操作系统级安全沙箱。

先阅读[学习路径](guides/learning-path/index.md)，通过
[Python 源码与 TS 功能对照](guides/course-map/index.md)比较实现，再结合
[架构指南](guides/architecture/index.md)理解前端类比与架构问题。
这里按能力复用课程模块，不会在每课复制整套应用；`--lesson N` 只组合到第 N 课的能力。

每份指南和课程 README 只保留两份：不带语言后缀的 `.md`（默认中文）与
`_EN.md`（英文）。通过顶部的中英文切换入口选择语言。
更新时请同步维护两种语言，保持代码示例一致。
`pnpm check:docs` 会检查语言链接、现有行内 / HTML 链接的本地目标与锚点、
标题层级与代码块的一致性，并拒绝重复的中文副本，但不能代替人工审校翻译。

## 公开课程文档

[公开阅读站点](https://assassin93-z.github.io/learn-agent-docs/)只发布课程文档，
不会让读者自动获得私有 TypeScript 源码或 Git 提交历史，也不会在线运行 Agent。
现有中英文 Markdown 是唯一课程正文源；发布仓库保存白名单导出的网页源文件，
不手工维护另一套正文。持有源码访问权限的人可从本地源码检出目录导出：

```bash
pnpm docs:export -- --output ../learn-agent-docs/docs
```

导出只包含首页、三份指南和十一课的中英文文档，转换页面链接但保留代码示例。
发布前仍需在文档仓库审查源文件、静态构建产物和搜索索引。

## 快速开始

使用 Node.js 22（22.16+）、24 或 26+，以及 `package.json` 指定的 pnpm 11.22.0。
依赖锁文件只使用 `pnpm-lock.yaml`。

```bash
pnpm install --frozen-lockfile --registry=https://registry.npmjs.org
pnpm check
pnpm demos
pnpm agent:demo
```

完整检查包括 TypeScript、确定性测试、文档一致性检查和发布安全扫描。
`pnpm demos` 在不含个人凭据的子进程环境中运行第 02–11 课的十个独立示例，
并限制执行时间与输出大小。`pnpm agent:demo` 运行组合后的课程：真实的临时文件操作、
预设审批、Skill 加载、仓库自带的本地 stdio MCP 服务、只读子 Agent、计划审批、
经批准的记忆、会话搜索以及静默心跳。HTTP、模型和消息渠道响应都是测试替身，
不需要 API Key 或 Telegram 连接；示例结束后会清理临时状态。

第 01 课单独运行，用来理解最小循环：

```bash
pnpm lesson:01:demo
pnpm lesson:04:demo
pnpm agent -- --help
```

第 01 课在被 Git 忽略的 `playground` 中调用真实文件与 shell 工具：写入并读取
`hello.cjs`，然后询问是否执行 `node hello.cjs`。在交互终端中审核该命令后输入 `y`
批准。它不包含在 `pnpm demos` 中，因为不能默默替用户授予 shell 权限。
预设模型验证的是编排过程和安全边界，不是模型推理质量。

## 使用个人模型

参照只含占位符的 `.env.example` 创建被 Git 忽略的 `.env`，配置你**个人的**
`API_KEY`、`BASE_URL` 和 `MODEL`。不要使用工作凭据或公司数据。

```bash
pnpm lesson:02 -- "List the disposable workspace and explain what you observe."
pnpm agent -- --session practice "Write hello.txt, then read it to verify the result."
pnpm lesson:10 -- "/plan Inspect the workspace and propose a small verified change."
```

默认使用 DeepSeek 的 OpenAI 兼容 Chat Completions API。除本地回环测试外要求
HTTPS，且不跟随重定向。模型服务商会收到任务、上下文、记忆和工具观察结果；
模型请求与摘要可能产生费用。CLI 默认使用 `playground` 作为工具工作区，
`.runtime` 保存私有状态。`--workspace` / `AGENT_WORKSPACE` / `NAMI_WORKSPACE`
选择前者；`--state-dir` / `NAMI_STATE_DIR` 选择后者，两者必须是互不重叠的目录。
`--session` 接收的是会话标签，不是路径。`/reset` 清空对话历史，但保留已批准的
长期记忆，供新会话使用。

`pnpm lesson:NN` 在 NN=02..11 时选择累计能力的 CLI；对应的 `:demo` 运行该课
独立示例。`pnpm agent` 默认启用全部十一课。任务为空时进入终端 REPL；
`/quit` 退出。第 10 课开始支持 `/plan TASK`；第 07 课及以后可用 `/tasks`
查看当前身份范围内的定时任务。
给 `bot` 或 `lesson:NN` 别名追加参数时，不要添加 pnpm 的 `--` 分隔符，
因为这些别名已经注入了 CLI 参数。如果更习惯分隔符写法，可以使用
`pnpm agent -- --lesson N ...` 运行累计课程。

## 个人消息渠道与外部工具

使用 [Telegram](lessons/06-chat-channel/index.md) 时，在被忽略的 `.env`
中配置你自己的 `TG_BOT_TOKEN` 和逗号分隔的 `TG_ALLOWED_USERS`，然后运行
`pnpm bot`。只接收白名单用户的私聊文本。审批使用 `y REQUEST_ID`、
`n REQUEST_ID` 或 `a REQUEST_ID`；最后一种只记住当前会话的文件写入批准。
批准绑定精确的用户、聊天、工作区以及展示给用户的参数。
不要将真实 token 或用户 ID 放入示例或 Git。

调度器在 bot 模式轮询期间运行；终端模式有意不启动后台调度器，也不创建属于
聊天身份的任务。任务状态会持久化，错过的周期合并处理，而不是全部补跑。
每日任务使用进程时区。定时执行从新会话开始，不继承交互时记住的权限；
任何需要确认的工具都必须匹配用户提供的精确授权。
参见[授权示例与时间限制](guides/architecture/index.md#scheduled-grants)。

[MCP](lessons/08-mcp/index.md) 只会从显式指定、位于工作区外且经过审核的
配置启动，不会从工作区文件自动加载：

```bash
pnpm agent -- --mcp-config .runtime/mcp.json
pnpm bot --mcp-config .runtime/mcp.json --trust-mcp-config --grants-file .runtime/grants.json
```

每个服务都必须标记 `trusted: true`，并批准其启动。`--trust-mcp-config`
是明确的无交互启动批准，不是对全部工具的授权：未知副作用仍需确认，只有由
宿主审核的 `safeTools` 才视为只读。被信任的 shell 和 MCP 进程仍拥有当前
操作系统用户的权限。仓库自带的离线 MCP 示例不能证明任意外部服务或真实
模型、Telegram 账号已经通过集成测试。

## 发布安全

- 不要把凭据、工作数据、内网地址、个人机器路径或本地工作流元数据提交到 Git。
- `.env`、`.runtime`、`playground`、MCP / 授权配置和本地 JSON 文件已被忽略；自定义路径仍需自行检查。
- 依赖使用公共 npm registry；Git 作者与提交者使用个人 GitHub noreply 身份。
- 发布前运行 `pnpm check:privacy` 并审查暂存区差异。正则扫描只是防护措施，不能证明所有秘密都被检测出来。

相较 Python 示例，本课程有意收紧路径、URL、审批、委派与调度边界。
但没有完整的文件系统竞态防护、跨进程调度保证或工具副作用回滚。
详见[已说明的差异](guides/course-map/index.md#intentional-differences)。

提交标题使用 `<type>(<scope>): <imperative subject>`，不超过 72 个字符，
按学习能力拆分。本地工作流文件和运行元数据不得进入仓库。
