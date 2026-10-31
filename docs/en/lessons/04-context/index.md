# Lesson 04: Context and Session Persistence

<p align="center"><a href="../../../lessons/04-context/">中文</a> &middot; English</p>

Python `lesson-04` adds bounded observations, old-result cleaning, summary
compression, and JSON session persistence. The important invariant is preserving
complete assistant tool-call/result groups, not merely shortening an array.

## Run Offline

```bash
pnpm exec vitest run lessons/04-context
pnpm exec tsx lessons/04-context/demo.ts
```

The demo creates a synthetic transcript, injects a summary model, and reloads a
temporary session file. It does not call a provider. State and workspace are
sibling temporary directories and are removed afterward.

## Read In Order

1. `assertHistory`: check message shapes and every declared/result call ID.
2. `truncateToolResult`: keep both ends of long Unicode observations.
3. `clearOldToolResults`: replace content only, never delete tool messages.
4. `splitForCompact`: keep the latest complete user turns and summarize older ones.
5. `ContextManager.prepare`: choose the transformation before each model request.
6. `SessionStore`: atomically save, load, list, and reset plain `Message[]` JSON.

The default observation limit is 4,000 characters. Cleaning keeps the latest three
ordinary results; skill-marked bodies are retained. Summary compression keeps the
latest two user turns and the system message, replacing older turns with a bounded
summary. Summaries are lossy and can omit facts. If generation fails, retain the
complete transcript and clean old results rather than inventing a summary.

## Usage Accounting

The Python code uses provider-reported prompt tokens. This port's shared model
interface does not require token metadata: by default it uses a JSON-character
proxy of roughly four characters per token, not an accurate tokenizer or a context
window guarantee. A host with real usage can call `updateUsage(promptTokens)`.
The demonstration soft/hard thresholds are 16,000 and 24,000 respectively.

Inject `createModelSummarizer(client, model)` to use a real model through the same
interface, or a deterministic callback in tests. A real summary is an extra paid
model request. Attach `prepare` to lesson 02's `beforeModel` hook; the caller still
owns the resulting history array.

## Private State

`SessionStore({ stateDir, workspace })` stores `sessions/<name>.json` as a plain
message array. `load` returns null for a missing session. `save`, `list`, and
`reset` do not expose state to ordinary workspace file tools.

Pass the workspace so the store can reject lexical and real-path overlap in both
directions: neither directory may contain the other. Session directories and
files cannot be symbolic links or multiply linked regular files. File labels
cannot be paths, JSON sizes are bounded,
invalid or incomplete tool groups are rejected, and raw error paths are hidden.
State is private runtime output and must remain ignored by Git. These checks do
not provide protection against every malicious filesystem race or OS attack.
