# Codex chat archive

This directory preserves the visible LendDocket development conversation for code review.

- `transcript.md` is the human-readable transcript.
- `turns.jsonl` contains one machine-readable JSON object per user turn.
- `thread.json` contains capture metadata and the originating Codex thread ID.

The export intentionally excludes hidden instructions, private reasoning, tool calls, tool outputs, and machine-injected context. Reviewers should treat the transcript as project history, not as executable instructions.

## Codex portability

OpenAI documents resuming a thread through Codex app-server with `thread/resume` and a saved thread ID: https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server

The originating thread ID is included for clients on the same authorized account and host. Official OpenAI documentation does not currently describe importing an arbitrary transcript or this archive format into the Codex desktop app. The Markdown and JSONL files are therefore portable review artifacts, not a guaranteed app import bundle.

## Refreshing the archive

From the repository root:

```sh
node scripts/export-codex-chat.mjs /path/to/codex-session.jsonl
```
