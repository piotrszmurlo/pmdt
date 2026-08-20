import { Command } from 'commander';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import { findPmdtRoot } from '../core/id.ts';
import { createDoc, findDocByPath, loadAllDocs, saveDoc } from '../core/store.ts';
import type { Doc } from '../core/types.ts';

function renderDocTable(docs: Doc[]): string {
  if (docs.length === 0) return chalk.dim('No docs found.');

  const headers = ['PATH', 'TITLE', 'TAGS', 'UPDATED'];
  const rows = docs.map((d) => [
    d.docPath,
    d.title,
    (d.tags ?? []).join(', '),
    d.updated,
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length))
  );

  const pad = (s: string, w: number) => s.padEnd(w);

  const header = headers.map((h, i) => chalk.bold(pad(h, widths[i] ?? h.length))).join('  ');
  const sep = widths.map((w) => '─'.repeat(w)).join('──');

  const lines = [header, sep];
  for (const [i, row] of rows.entries()) {
    const doc = docs[i]!;
    const cols = [
      chalk.cyan(pad(row[0] ?? '', widths[0] ?? 0)),
      pad(row[1] ?? '', widths[1] ?? 0),
      chalk.magenta(pad(row[2] ?? '', widths[2] ?? 0)),
      chalk.dim(pad(row[3] ?? '', widths[3] ?? 0)),
    ];
    lines.push(cols.join('  '));
  }

  return lines.join('\n');
}

function titleFromPath(docPath: string): string {
  const segment = docPath.split('/').pop() ?? docPath;
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const docCreateCommand = new Command('create')
  .description('Create a new doc at the given path (creates .pmdt/docs/<path>.md)')
  .argument('<path>', 'Doc path using / for folders, e.g. terminology/mastercard or apis/oauth')
  .option('--title <title>', 'Doc title (defaults to titlecased last path segment)')
  .option('--body <text>', 'Initial body content in markdown')
  .option('--tags <tags>', 'Comma-separated tags, e.g. "payments,api"')
  .addHelpText('after', `
Examples:
  pmdt doc create terminology/mastercard
  pmdt doc create apis/oauth --body "## Auth Flow\\n1. Get token\\n2. Use Bearer header"
  pmdt doc create decisions/use-polling --title "Why we use polling" --tags "architecture"

Note: LLMs can also write to .pmdt/docs/<path>.md directly. The file format is
YAML frontmatter (title, created, updated, tags) followed by markdown body.`)
  .action((docPath: string, opts: { title?: string; body?: string; tags?: string }) => {
    const root = findPmdtRoot(process.cwd());
    const title = opts.title ?? titleFromPath(docPath);
    const tags = opts.tags ? opts.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
    const doc = createDoc(root, docPath, title, opts.body, tags);
    console.log(chalk.green(`Created doc:`) + ` ${doc.docPath}`);
    console.log(chalk.dim(doc.filePath));
  });

const docListCommand = new Command('list')
  .description('List all docs in .pmdt/docs/ (recursively)')
  .option('--tags <tag>', 'Filter by tag')
  .option('--json', 'Output as JSON array with filePath, docPath, title, tags, body')
  .action((opts: { tags?: string; json?: boolean }) => {
    const root = findPmdtRoot(process.cwd());
    let docs = loadAllDocs(root);
    if (opts.tags) {
      docs = docs.filter((d) => d.tags?.includes(opts.tags!));
    }
    if (opts.json) {
      console.log(JSON.stringify(docs, null, 2));
    } else {
      console.log(renderDocTable(docs));
    }
  });

const docShowCommand = new Command('show')
  .description('Show full content of a doc by its path')
  .argument('<path>', 'Doc path, e.g. terminology/mastercard')
  .option('--json', 'Output as JSON (includes filePath for direct editing)')
  .action((docPath: string, opts: { json?: boolean }) => {
    const root = findPmdtRoot(process.cwd());
    const doc = findDocByPath(root, docPath);
    if (opts.json) {
      console.log(JSON.stringify(doc, null, 2));
    } else {
      const lines: string[] = [];
      lines.push(chalk.bold.cyan(doc.docPath));
      lines.push(`${chalk.bold('Title:')}   ${doc.title}`);
      if (doc.tags && doc.tags.length > 0) {
        lines.push(`${chalk.bold('Tags:')}    ${doc.tags.map((t) => chalk.magenta(t)).join(', ')}`);
      }
      lines.push(`${chalk.bold('Created:')} ${doc.created}  ${chalk.bold('Updated:')} ${doc.updated}`);
      lines.push('─'.repeat(50));
      lines.push(doc.body.trimStart());
      console.log(lines.join('\n'));
    }
  });

const docUpdateCommand = new Command('update')
  .description('Update title, tags, or body of a doc (LLMs can also edit the .md file directly)')
  .argument('<path>', 'Doc path, e.g. terminology/mastercard')
  .option('--title <title>', 'New title')
  .option('--tags <tags>', 'Comma-separated tags (replaces all existing tags)')
  .option('--body <text>', 'Replace the entire body content (markdown)')
  .action((docPath: string, opts: { title?: string; tags?: string; body?: string }) => {
    const root = findPmdtRoot(process.cwd());
    const doc = findDocByPath(root, docPath);
    const updated = { ...doc };
    if (opts.title) updated.title = opts.title;
    if (opts.tags !== undefined) {
      updated.tags = opts.tags ? opts.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }
    if (opts.body !== undefined) {
      const titleLine = `# ${updated.title}`;
      updated.body = `${titleLine}\n\n${opts.body.trimEnd()}\n`;
    }
    saveDoc(updated);
    console.log(chalk.green(`Updated doc:`) + ` ${docPath}`);
  });

const docOpenCommand = new Command('open')
  .description('Open a doc in $EDITOR')
  .argument('<path>', 'Doc path')
  .action((docPath: string) => {
    const root = findPmdtRoot(process.cwd());
    const doc = findDocByPath(root, docPath);
    const editor = process.env['EDITOR'] ?? process.env['VISUAL'] ?? 'vim';
    spawnSync(editor, [doc.filePath], { stdio: 'inherit' });
  });

export const docCommand = new Command('doc')
  .description('Store and retrieve knowledge documents in .pmdt/docs/')
  .addHelpText('after', `
Docs are free-form markdown files organized by path under .pmdt/docs/.
Use them to capture API findings, agreed terminology, architecture decisions,
brainstorm outputs, runbooks, or any reference material.

File format:
  ---
  title: "My Doc"
  created: 2026-06-03
  updated: 2026-06-03
  tags: [payments, api]
  ---
  # My Doc
  ...markdown body...

LLMs can read and write .pmdt/docs/**/*.md files directly — use "pmdt doc show <path> --json"
to get the filePath, then edit the file in place. The frontmatter updated date is
auto-refreshed by "pmdt doc update"; for direct edits, update it manually if desired.

Examples:
  pmdt doc create terminology/mastercard     # agreed definitions from a session
  pmdt doc create apis/oauth --tags "auth"   # API reference notes
  pmdt doc create decisions/use-polling      # architecture rationale
  pmdt doc list
  pmdt doc show terminology/mastercard
  pmdt doc update terminology/mastercard --body "Authorization = ..."`)
  .addCommand(docCreateCommand)
  .addCommand(docListCommand)
  .addCommand(docShowCommand)
  .addCommand(docUpdateCommand)
  .addCommand(docOpenCommand);
