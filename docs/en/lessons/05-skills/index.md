# Lesson 05: Load Instructions Only When Needed

<p align="center"><a href="../../../lessons/05-skills/">中文</a> &middot; English</p>

Python `lesson-05` puts project notes and skill descriptions into the system
prompt, while full skill bodies arrive through a `load_skill` tool. A skill is
instructional context, not a new model, executable plugin, or permission grant.

## Run Offline

```bash
pnpm exec vitest run lessons/05-skills
pnpm exec tsx lessons/05-skills/demo.ts
```

The demo creates fixture instructions in a temporary workspace, advertises a
skill, loads its body, and checks a readonly refusal. It uses no provider, network,
credentials, or machine-specific configuration.

## Read In Order

1. `parseSkill`: read simple `key: value` frontmatter and preserve body text.
2. `discover`: advertise valid, uniquely named skills with descriptions.
3. `projectNotes` and `systemPrompt`: refresh bounded AGENTS.md project context.
4. `load`: read a relevant skill body and list nearby support files.
5. `register`: register `load_skill` and protect the instruction directory.

Expected workspace structure:

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

The parser intentionally supports simple string fields, not full YAML. Names use
letters, digits, underscores, or hyphens. Missing descriptions, duplicate names,
invalid files, multiply linked files, and linked definition files or child
directories are not advertised.
Discovery and loading stay inside the workspace and instruction root.

Project notes default to 3,000 characters and loaded skills to 8,000. The host
rebuilds project context when constructing a session; it does not automatically
rewrite the prompt halfway through a task. `load_skill` returns a `[skill]` marker
so lesson 04's old-result cleaning retains the instruction body.

Register using `skills.register(registry, permissions)` so writes to the skill
directory are hard-denied, including aliases and remembered write approvals.
Support scripts are only listed: this module never executes them. Ordinary tool
approval and hard policy still apply if a skill tells the agent to run anything.
Review third-party instructions; skills and project notes can contain malicious
prompts, and these teaching guardrails are not an OS sandbox.
