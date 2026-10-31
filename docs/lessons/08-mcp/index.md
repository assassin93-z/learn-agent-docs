# 第 08 课：通过 stdio 接入 MCP

<p align="center">中文 &middot; <a href="../../en/lessons/08-mcp/">English</a></p>

公开 Python 课程增加的是进程边界，而不是另一套 Agent 循环。以换行分隔的 JSON-RPC
消息写入服务的 stdin，响应从 stdout 返回。这些工具与本地工具一样，进入第 02 课的
同一个工具注册表。

```sh
pnpm exec tsx lessons/08-mcp/demo.ts
pnpm exec vitest run lessons/08-mcp
```

离线示例只启动仓库内已提交的 demo server，初始化 `2025-11-25` 协议，列出工具，
并统计 `hello\nagent`。不需要模型密钥或网络。`demo-server.ts` 还提供只读的 `now` 工具。

按这个顺序阅读 `mcp.ts`：`start` -> `initialize` -> `listTools` ->
`mcpToolDefinitions` -> `request`/`receive` -> `close`。并发调用方使用独立的 request ID，
notification 不会完成请求。分页、输出大小、待处理请求、超时、畸形响应和进程清理
都有边界限制。本课程仅处理文本，非文本内容以占位符表示。服务主动请求 roots 或
模型访问时，会被明确拒绝。

## 信任与审批

`loadMCPServers(configFile, options)` 只读取显式传入、位于工作区之外的普通 JSON 文件。
符号链接和多硬链接文件会被拒绝，避免工作区内的别名可以修改受信任的进程启动配置。
它支持 `mcpServers`，以及 Python 参考实现中的 `servers` 映射。每项配置都需要
`trusted: true`；在启动任何进程前，`approveStart` 必须批准可执行程序、参数、环境变量
键名和安全工具列表。模块 import 或 CLI 启动时都不会自动加载配置。

```json
{
  "mcpServers": {
    "example": {
      "trusted": true,
      "command": "node",
      "args": ["YOUR_LOCALLY_REVIEWED_SERVER_SCRIPT"],
      "safe_tools": []
    }
  }
}
```

上述占位符不是可直接运行的配置。请在工作区之外、不受 Git 跟踪的状态目录中，配置
你已审查的可执行程序和脚本绝对路径。子进程从一个空临时目录启动，环境只有最小 PATH
和显式提供的变量值，不继承密钥、HOME、代理或 shell 配置。这**不是操作系统安全沙箱**：
受信任的服务进程仍然可以访问当前用户有权使用的资源。

MCP 工具的默认风险等级为 `confirm`。只有你独立审查、并在 `safe_tools`/`safeTools`
中明确列出的工具才会得到 `safe`；服务给出的 annotations 不能证明工具是只读的。
计划模式和 explore 子 Agent 必须拒绝其他所有 MCP 工具。返回文本是不可信数据，
不能视为新的 system 指令。单个服务失败会被关闭，但不妨碍其他配置项连接；错误也
不会回显凭据或命令路径。

## 理解自测

解释为什么 stdio 日志不能写入 stdout，为什么只匹配最新 request ID 会破坏并发
子 Agent，为什么工具发现不等于授权，以及为什么允许工作区修改 MCP 配置相当于
允许执行程序。
