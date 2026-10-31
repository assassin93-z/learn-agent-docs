# 第 05 课：只在需要时加载指令

<p align="center">中文 &middot; <a href="../../en/lessons/05-skills/">English</a></p>

Python 的 `lesson-05` 把项目说明和技能描述放入 system prompt，完整的技能正文则通过
`load_skill` 工具按需加载。Skill 是指令上下文，不是新模型、可执行插件，也不是权限授权。

## 运行离线示例

```bash
pnpm exec vitest run lessons/05-skills
pnpm exec tsx lessons/05-skills/demo.ts
```

示例在临时工作区中创建测试用指令，向模型展示一个技能的描述，加载技能正文，
并检查只读限制是否拒绝写入。它不使用模型服务、网络、凭据或机器特定配置。

## 按顺序阅读

1. `parseSkill`：读取简单的 `key: value` frontmatter，并保留正文文本。
2. `discover`：展示有效、名称唯一且带描述的技能。
3. `projectNotes` 和 `systemPrompt`：刷新长度受限的 AGENTS.md 项目上下文。
4. `load`：读取相关技能的正文，并列出附近的辅助文件。
5. `register`：注册 `load_skill`，并保护指令目录。

预期的工作区结构：

```text
playground/
  AGENTS.md
  skills/
    clear-notes/
      SKILL.md
      template.txt
```

```markdown
---
name: clear-notes
description: Write concise notes without inventing facts
---
Keep confirmed observations separate from assumptions.
```

解析器有意只支持简单的字符串字段，不支持完整 YAML。技能名称可以使用字母、数字、
下划线或连字符。缺少描述、名称重复、文件无效、文件有多个硬链接，以及定义文件或
子目录使用链接的技能，都不会被展示。发现和加载始终限制在工作区与指令根目录内。

项目说明默认最多 3,000 个字符，已加载技能默认最多 8,000 个字符。宿主在构建会话时
重新生成项目上下文，不会在任务执行到一半时自动改写 prompt。`load_skill` 返回
`[skill]` 标记，因此第 04 课清理旧工具结果时会保留技能指令正文。

使用 `skills.register(registry, permissions)` 注册技能，这样对技能目录的写入就会被
硬规则拒绝；路径别名或本会话已记住的写入批准也不能绕过。辅助脚本仅被列出，本模块
从不执行它们。即使技能要求 Agent 执行某个操作，普通工具审批和硬规则仍然适用。
务必审查第三方指令：技能和项目说明可能包含恶意 prompt，这些教学用防护也不是
操作系统沙箱。
