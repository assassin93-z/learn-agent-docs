# Lesson 03: Permissions Are Host Policy

<p align="center"><a href="../../../lessons/03-permissions/">中文</a> &middot; English</p>

Python `lesson-03` adds three checks: hard rules, risk classification, then human
approval. TypeScript keeps this order in `PermissionManager`, independently of
the model's prompt or its claim that an operation is safe.

## Run Offline

```bash
pnpm exec vitest run lessons/03-permissions
pnpm exec tsx lessons/03-permissions/demo.ts
```

The demo injects an approval callback and checks decisions in a temporary
workspace. It does not execute commands, contact a provider, or use credentials.

## Read In Order

1. `PermissionDecision` and `ApprovalResult`: policy results are plain typed data.
2. `hardRules`: reject paths outside the workspace and dangerous shell patterns.
3. `riskOf`: reads are safe, side effects need confirmation, unknown tools confirm.
4. `check`: ask only after hard rules pass; errors and absent approval deny.
5. `permissions.test.ts`: an approving user cannot override a hard refusal.

Connect a registry using its `beforeExecute` hook. That hook receives validated
arguments; the permission callback decides whether the host may execute them.
For dynamic tools, the caller can pass trusted risk metadata as the third argument
to `check`, or configure `riskOverrides`. Tool descriptions are not risk policy.

An approval has shape `{ allowed, reason?, remember? }`. Only `write_file` may
remember an approval, and only for that manager instance. Every shell command and
fetch request is checked again. Hard rules still apply to remembered writes.
Different users, workspaces, chats, and unattended jobs must not share a manager.
Later lessons add actor-scoped managers and exact unattended grants.

`renderCall` displays actual arguments, not a model-generated explanation. It
escapes terminal controls and bounds file-content previews. `hardRules` is also
available separately for callers that already obtained a precise approval.
Protected instruction paths and the later plan mode remain hard restrictions.

## Limits

Path checks resolve existing symbolic links without creating files and reject
regular files with multiple hard links. Shell deny
patterns catch obvious accidents, not arbitrary malicious programs. Approval and
`cwd` are not an OS sandbox; an approved command can still leave the workspace or
access the network. Never use work data, credentials, or your home directory as
the learning workspace.
