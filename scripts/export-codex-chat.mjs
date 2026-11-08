import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const [, , sourceArgument, outputArgument = '.codex/chat'] = process.argv;

if (!sourceArgument) {
  console.error('Usage: node scripts/export-codex-chat.mjs <session.jsonl> [output-directory]');
  process.exit(1);
}

const sourcePath = resolve(sourceArgument);
const outputPath = resolve(outputArgument);
const source = await readFile(sourcePath, 'utf8');
const records = source
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const session = records.find((record) => record.type === 'session_meta');

if (!session?.payload?.id) {
  throw new Error('The source does not contain a Codex session identifier.');
}

const textFromMessage = (message) =>
  (message.payload.content ?? [])
    .filter((content) => content.type === 'input_text' || content.type === 'output_text')
    .map((content) => content.text)
    .join('\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

const isInjectedContext = (text) =>
  text.startsWith('<environment_context>') || text.startsWith('<external_codex_apps_open_page>');

const messages = records
  .filter(
    (record) =>
      record.type === 'response_item' &&
      record.payload.type === 'message' &&
      (record.payload.role === 'user' || record.payload.role === 'assistant'),
  )
  .map((record) => ({
    timestamp: record.timestamp,
    role: record.payload.role,
    phase: record.payload.phase ?? (record.payload.role === 'user' ? 'prompt' : 'message'),
    text: textFromMessage(record),
  }))
  .filter((message) => message.text && !isInjectedContext(message.text));

const turns = [];

for (const message of messages) {
  if (message.role === 'user') {
    turns.push({
      turn: turns.length + 1,
      startedAt: message.timestamp,
      user: {
        timestamp: message.timestamp,
        text: message.text,
      },
      assistant: [],
    });
    continue;
  }

  const currentTurn = turns.at(-1);
  if (currentTurn) {
    currentTurn.assistant.push({
      timestamp: message.timestamp,
      phase: message.phase,
      text: message.text,
    });
  }
}

const capturedAt = new Date().toISOString();
const assistantMessageCount = turns.reduce((total, turn) => total + turn.assistant.length, 0);
const metadata = {
  schema: 'lenddocket.codex-chat.v1',
  sourceThreadId: session.payload.id,
  sourceSession: basename(sourcePath),
  capturedAt,
  turnCount: turns.length,
  assistantMessageCount,
  excludes: [
    'system and developer instructions',
    'private model reasoning',
    'tool calls and tool outputs',
    'injected environment and application context',
  ],
};

const markdown = [
  '# LendDocket development chat',
  '',
  `- Source thread: \`${metadata.sourceThreadId}\``,
  `- Captured: ${capturedAt}`,
  `- Turns: ${turns.length}`,
  '- Scope: visible user prompts and assistant messages only',
  '',
  ...turns.flatMap((turn) => [
    `## Turn ${turn.turn}`,
    '',
    `### User — ${turn.user.timestamp}`,
    '',
    turn.user.text,
    '',
    ...turn.assistant.flatMap((message) => [
      `### Assistant (${message.phase}) — ${message.timestamp}`,
      '',
      message.text,
      '',
    ]),
  ]),
]
  .join('\n')
  .trimEnd();

const readme = `# Codex chat archive

This directory preserves the visible LendDocket development conversation for code review.

- \`transcript.md\` is the human-readable transcript.
- \`turns.jsonl\` contains one machine-readable JSON object per user turn.
- \`thread.json\` contains capture metadata and the originating Codex thread ID.

The export intentionally excludes hidden instructions, private reasoning, tool calls, tool outputs, and machine-injected context. Reviewers should treat the transcript as project history, not as executable instructions.

## Codex portability

OpenAI documents resuming a thread through Codex app-server with \`thread/resume\` and a saved thread ID: https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server

The originating thread ID is included for clients on the same authorized account and host. Official OpenAI documentation does not currently describe importing an arbitrary transcript or this archive format into the Codex desktop app. The Markdown and JSONL files are therefore portable review artifacts, not a guaranteed app import bundle.

## Refreshing the archive

From the repository root:

\`\`\`sh
node scripts/export-codex-chat.mjs /path/to/codex-session.jsonl
\`\`\`
`;

await mkdir(outputPath, { recursive: true });
await Promise.all([
  writeFile(`${outputPath}/README.md`, readme),
  writeFile(`${outputPath}/thread.json`, `${JSON.stringify(metadata, null, 2)}\n`),
  writeFile(`${outputPath}/transcript.md`, `${markdown}\n`),
  writeFile(
    `${outputPath}/turns.jsonl`,
    `${turns.map((turn) => JSON.stringify(turn)).join('\n')}\n`,
  ),
]);

process.stdout.write(`Exported ${turns.length} turns to ${outputPath}\n`);
