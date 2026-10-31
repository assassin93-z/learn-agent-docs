# Lesson 08: MCP over stdio

<p align="center"><a href="../../../lessons/08-mcp/">中文</a> &middot; English</p>

The public Python lesson adds a process boundary, not a new agent loop. A
newline-delimited JSON-RPC message goes into a server's stdin; its response comes
back on stdout. These tools enter the same lesson-02 registry as local tools.

```sh
pnpm exec tsx lessons/08-mcp/demo.ts
pnpm exec vitest run lessons/08-mcp
```

The offline demo starts only the checked-in demo server, initializes protocol
`2025-11-25`, lists its tools, and counts `hello\nagent`. No model key or network
is needed. `demo-server.ts` also exposes a read-only `now` tool.

Read `mcp.ts` in this order: `start` -> `initialize` -> `listTools` ->
`mcpToolDefinitions` -> `request`/`receive` -> `close`. Concurrent callers use
independent request IDs; notifications never complete a request. Pagination,
output size, pending requests, timeouts, malformed replies, and process cleanup
are bounded. Non-text content is represented by a placeholder in this text-only
course. Server-side requests for roots or model access are explicitly refused.

## Trust And Approval

`loadMCPServers(configFile, options)` reads only an explicitly supplied regular
JSON file outside the workspace. Symbolic links and multiply hard-linked files
are refused, so a workspace alias cannot mutate trusted launch configuration.
It supports `mcpServers` and the Python
reference's `servers` map. Each entry needs `trusted: true`, and `approveStart`
must approve its executable, arguments, environment key names, and safe tools
before any process is launched. Nothing is loaded at import or CLI startup.

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

That placeholder is not runnable configuration. Supply your own reviewed
executable and absolute script path in an external, untracked state directory.
The child starts in an empty temporary directory with a minimal PATH plus only
explicitly supplied environment values. It does not inherit keys, HOME,
proxies, or shell configuration. This is **not an OS security sandbox**: a
trusted server process can still access resources allowed to the current user.

MCP tool risk defaults to `confirm`. Only tools you have independently audited
and explicitly named in `safe_tools`/`safeTools` receive `safe`; server-provided
annotations are not proof of read-only behavior. Plan mode and explore children
must refuse every other MCP tool. Check returned text as untrusted data, not as
new system instructions. One failing server is closed and does not prevent
other entries from connecting; errors do not echo credentials or command paths.

## Understanding Check

Explain why stdio logs cannot go to stdout, why matching only the latest request
ID breaks concurrent children, why tool discovery is not authorization, and why
an editable workspace MCP config amounts to permission to execute programs.
