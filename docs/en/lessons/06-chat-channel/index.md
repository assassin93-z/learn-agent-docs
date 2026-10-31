# Lesson 06: Connect the Agent to a Chat Channel

<p align="center"><a href="../../../lessons/06-chat-channel/">中文</a> &middot; English</p>

This lesson maps to `lesson-06/telegram.py`, `bot.py`, and the session changes in
`agent.py` from the public Nami source. The core loop still owns model and tool
execution; the channel layer only handles incoming messages, approvals, replies,
and the session lifecycle.

## Run the Offline Demo First

```bash
pnpm exec tsx lessons/06-chat-channel/demo.ts
pnpm exec vitest run lessons/06-chat-channel
```

The demo uses fixture messages and a fixture runner. It does not connect to
Telegram or a model, write files, or execute shell commands. It demonstrates
receiving a message, requesting approval, consuming the approval in a later poll,
saving history, and running `/reset`.

## Reading Order

1. `types.ts`: `ChatActor`, `TurnRunner`, and `SessionLifecycle` define the boundary between the channel and the core.
2. `telegram.ts`: explicit tokens, `getUpdates` long polling, a monotonically advancing offset, private-chat text filtering, and chunked sending.
3. `approvals.ts`: bind a tool call to its initiating user, chat, workspace, and unique request ID.
4. `bot.ts`: user allowlists, a serial queue per chat, parallel independent chats, history rollback, and `/reset`.
5. Compare the three test files to understand why waiting for approval must not block the next poll.

## Why Not Await Every Message Directly?

With `poll -> await runner -> await human approval`, the program cannot poll
again and will never receive the approval reply. This lesson's `pollOnce()` only
dispatches work, and `handle()` queues ordinary messages per chat. The broker
consumes approval replies before they enter that queue. `drain()` waits for
already dispatched work to finish.

To shut down, first call the idempotent `stop()`, then use `shutdown()` to wait
for work that has already started. Stopping cancels long polling, retry waits,
and pending approval requests; refuses new messages and approvals; and skips
queued turns that have not started. Do not merely cancel approvals and call
`drain()`: the queue could create new approval requests after polling has ended.
Already started model requests or tools still need core-level timeouts and
closing guards. Channel cancellation cannot undo their side effects.

Messages in one chat run strictly in sequence so model history and tool results
cannot interleave; different chats may run concurrently. History and remembered
grants must still be isolated by all three `ChatActor` identifiers, rather than
kept in one global messages array. `SessionLifecycle` snapshot/restore/save/reset
can connect to lesson 04's state storage. When the runner fails, restoration
rolls back message history, not file or network effects that already occurred.

## Approval Boundaries

```text
y request-id
n request-id 先列出文件再修改
a request-id
```

`a` remembers approval only for `write_file` within this session; every shell
command needs its own approval. No reply within the default 120 seconds means
denial. Unlike the Python version's chat-only match, this lesson matches
user/chat/workspace and requires a request ID, preventing another person or a
stale `y` from approving the next operation. Sending failures, timeouts,
incomplete argument displays, and overlapping requests all deny approval.
`/reset` or stopping the service cancels pending requests.

Approval displays the actual tool name and full JSON arguments, not the model's
description of the action. Allow replies are accepted only after every chunk of
the prompt has been successfully sent in full. Execution still passes lesson
03's hard rules: broker approval cannot bypass workspace boundaries, read-only
skill directories, or dangerous-shell restrictions.

## Connect to Real Telegram

The application must explicitly supply `token` and nonempty `allowedUsers`.
Never put real tokens, user IDs, machine paths, or session data in source,
tests, READMEs, or Git. `TelegramChannel` always calls the public
`https://api.telegram.org`; it does not read custom headers from the environment
or follow redirects, and its errors do not echo URLs containing the token.

Only user text in Telegram private chats is accepted; groups, channels, and
files are not handled. Messages are split into at most 4000 UTF-16 units while
preserving Unicode surrogate pairs. Markdown/HTML parse modes are not enabled,
so tool output is not interpreted as formatting instructions.

## Understanding Check

Explain the long-polling offset, approval-wait deadlocks, why both user and chat
must be bound, why one session needs serial execution, and why error rollback
can restore history but cannot undo side effects. These are the architectural
essentials of this lesson.
