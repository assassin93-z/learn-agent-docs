# 第 04 课：上下文与会话持久化

<p align="center">中文 &middot; <a href="../../en/lessons/04-context/">English</a></p>

Python `lesson-04` 增加了观察结果长度限制、旧结果清理、摘要压缩和 JSON
会话持久化。关键不变量是保留完整的 assistant 工具调用与结果分组，
而不是简单地缩短一个数组。

## 离线运行

```bash
pnpm exec vitest run lessons/04-context
pnpm exec tsx lessons/04-context/demo.ts
```

demo 构造合成的会话记录，注入摘要模型，再重新加载临时会话文件，
不会调用真实模型服务。状态目录和工作区是同级临时目录，结束后都会删除。

## 建议阅读顺序

1. `assertHistory`：检查消息结构以及所有声明的调用 ID 和结果中的调用 ID。
2. `truncateToolResult`：保留较长 Unicode 观察结果的开头和结尾。
3. `clearOldToolResults`：只替换内容，绝不删除工具消息。
4. `splitForCompact`：保留最近完整的用户轮次，对更早的轮次生成摘要。
5. `ContextManager.prepare`：在每次模型请求之前选择上下文转换方式。
6. `SessionStore`：以普通 `Message[]` JSON 原子保存、加载、列举和重置会话。

观察结果的默认上限是 4,000 个字符。清理时保留最近三个普通结果，带有
skill 标记的正文则会保留。摘要压缩保留最近两个用户轮次及 system 消息，
用长度受限的摘要替换更早的轮次。摘要是有损的，可能遗漏事实。如果生成
失败，就保留完整会话并清理旧结果，而不是编造摘要。

## 用量统计

Python 代码使用模型服务返回的 prompt token 数量。这个移植版本的共享
模型接口不要求携带 token 元数据：默认使用 JSON 字符数估算，粗略按每个
token 约四个字符计算。它不是精确分词器，也不保证上下文窗口一定够用。
掌握真实用量的宿主可以调用 `updateUsage(promptTokens)`。
用于演示的软阈值和硬阈值分别是 16,000 和 24,000。

注入 `createModelSummarizer(client, model)`，可以通过同一个接口使用
真实模型；测试中则可以注入确定性回调。真实摘要会产生一次额外的付费
模型请求。把 `prepare` 接到第 02 课的 `beforeModel` 钩子上，调用者仍然
持有转换后的历史数组。

## 私有状态

`SessionStore({ stateDir, workspace })` 把会话保存为
`sessions/<name>.json`，内容是普通消息数组。会话不存在时，`load`
返回 null。`save`、`list` 和 `reset` 都不会把状态暴露给普通工作区文件工具。

传入工作区路径后，存储器就能从词法路径和真实路径两个层面，拒绝两个
目录在任一方向上的重叠：任何一个目录都不能包含另一个。会话目录和
文件不能是符号链接，普通文件也不能有多个硬链接。会话名称不能作为路径，
JSON 大小有上限，无效或不完整的工具调用分组会被拒绝，原始错误路径
不会暴露。状态是私有运行时输出，必须始终被 Git 忽略。
这些检查不能防御所有恶意文件系统竞争条件或操作系统攻击。
