# 第 01 课：最小 Agent 循环

<p align="center">中文 &middot; <a href="../../en/lessons/01-minimal-loop/">English</a></p>

本课对应公开 Nami Agent 课程中的 Python `lesson-01`。
这里只保留三个固定工具和一个显式的异步循环，不使用 Agent 框架。

## 运行

使用 pnpm 安装依赖后，在仓库根目录执行：

```bash
pnpm check
pnpm lesson:01:demo
```

离线 demo 使用预设回复的 `ModelClient`，但运行的是真实工具。它先写入
`playground/hello.cjs`，再读回文件，请求批准执行 `node hello.cjs`，
最后在第四轮模型调用中返回最后一个工具结果。输入 `y` 才会批准执行；
其他回答、EOF 或非交互输入都会拒绝执行。demo 不需要密钥或网络访问，
但不会验证真实模型服务或模型的推理能力。

如需使用真实模型，请参考 `.env.example`，在环境变量或被 Git 忽略的
`.env` 中配置个人 `API_KEY`：

```bash
pnpm lesson:01 -- "Write hello.cjs that prints hello, read it, then run it."
```

`BASE_URL` 和 `MODEL` 用来选择兼容 OpenAI 的模型服务，默认值与 Python
课程的 DeepSeek 配置一致。CLI 只在 `.env` 存在时加载它，默认在被 Git
忽略的 `playground` 工作区中产生输出。每次 CLI 调用只执行一个任务，
不是持久化聊天会话。退出码分别为：0 表示回复结束，1 表示输入或模型服务
失败，2 表示达到轮数上限。“结束”只表示模型不再请求工具调用，
并不能独立保证任务已经成功。

## 建议阅读顺序

| 文件 | 学习重点 |
| --- | --- |
| `types.ts` | 工具 schema 描述接口，但模型返回的参数仍然是 JSON 字符串。 |
| `tools.ts` | 普通 Node.js 函数负责校验并执行模型选择的操作。 |
| `model.ts` | 用一个小接口分离模型服务传输与 Agent 控制流程。 |
| `agent.ts` | 异步循环管理历史、工具分发、结果和停止条件。 |
| `terminal.ts`、`cli.ts` | 人工批准、本地配置和用户可见输出。 |
| `demo.ts`、`*.test.ts` | 用预设回复让协议行为可确定、可测试。 |

对前端开发者来说，Python 的 `dict` 对应带类型的对象，`json.loads`
对应 `JSON.parse` 加运行时校验，`subprocess.run` 对应需要等待完成的
Node.js 子进程。兼容 OpenAI 的 API 和 Agent 状态机没有改变；
TypeScript 以 `role` 为判别字段的联合类型，让消息结构更容易理解。

## 第一块积木：工具

模型不能直接执行代码。它看到的是 JSON schema，返回的是函数名和
JSON 参数。真正负责校验和执行的是我们的 Node.js 进程。

| 工具 | 参数 | 行为 |
| --- | --- | --- |
| `read_file` | `path` | 读取工作区中的 UTF-8 文件。 |
| `write_file` | `path`、`content` | 写入或替换工作区文件。 |
| `run_shell` | `command` | 请求批准后，在工作区中运行命令。 |

TypeScript 类型在运行时会消失，来自模型的 JSON 仍然需要校验：
拒绝未知工具、非对象参数、缺失或非字符串字段，以及多余字段。
错误会作为工具结果返回，让下一轮模型调用有机会修正请求。

```bash
pnpm exec vitest run lessons/01-minimal-loop/tools.test.ts
```

## 循环

```text
system + user task
    -> await model.complete(history, tool schemas)
    -> append assistant message
    -> no tool calls? return its text
    -> otherwise validate and await each tool in order
    -> append one tool message per call, using its tool_call_id
    -> repeat with the updated history
```

模型选择工具，但绝不负责执行。宿主进程执行工具，再把观察结果返回给
模型。必须**先**保存 assistant 的工具调用，再保存对应的工具结果；
每个结果都必须匹配调用 ID。调用保持顺序执行，因为一次读取可能依赖
前一次写入。工具失败会变成观察结果，让下一轮修正参数；模型服务请求
失败则会停止任务，而不是伪造成功。默认上限是 20 **轮模型调用**，
不是 20 次工具调用，一条模型回复可以包含多个工具调用。
每个任务都会从全新的内存历史开始。

`ModelClient` 是依赖注入接口，不是另一层 Agent 抽象。测试把预设回复
注入同一个循环，本地 HTTP 测试夹具则在不访问真实模型服务的情况下验证
真实 SDK 的 JSON 协议。模型服务与模型的兼容性和输出质量，仍需使用
你的个人账号验证。

## 安全边界

与原版第一课不同，这里把文件路径限制在专用工作区中，并检查已有符号
链接是否指向工作区之外。这是提前引入的安全增强，还不是后续课程的
完整权限系统。

文件访问会拒绝具有多个硬链接的普通文件，以及指向外部的符号链接。
读取时通过文件句柄只保留有限长度的前缀，而不是先把整个大文件读入内存
再截断。这些检查减少了静态文件别名绕过工作区边界的风险。

每一条 shell 命令都需要批准。收集的输出有长度上限，命令默认在 60 秒后
超时。子进程只接收一个小型环境变量白名单，不会继承 API 密钥、凭据或
个人工具目录。命令预览和显示的模型文本会转义终端控制字符及改变文字
方向的字符。在 POSIX 系统上，超时会终止命令的整个进程组；Windows
子孙进程的清理没有经过验证，本实现也不保证能够完成清理。

模型服务适配器还会显式构造 JSON 请求头，不继承 SDK 的组织、项目或
自定义请求头环境变量。它禁用 SDK 日志，设置 60 秒请求超时，关闭重试
和重定向，并返回经过处理的安全错误，不暴露原始模型服务响应体、请求头、
URL 或文件系统路径。这些默认设置能减少意外泄露，但不是批准任意服务
端点的策略。

**工作目录和确认提示都不是操作系统沙箱。**
已获批准的 shell 命令仍然可以访问工作区之外的文件或网络。请使用可丢弃
目录，审核命令，绝不要让这个 Agent 处理公司工作数据。文件路径检查也
不能保证抵御恶意的并发文件替换。
