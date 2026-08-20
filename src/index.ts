#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { PmdtError } from './utils/errors.ts';
declare const __VERSION__: string;
import { initCommand } from './commands/init.ts';
import { createCommand } from './commands/create.ts';
import { getCommand } from './commands/get.ts';
import { listCommand } from './commands/list.ts';
import { availableCommand } from './commands/available.ts';
import { backlogCommand } from './commands/backlog.ts';
import { updateCommand } from './commands/update.ts';
import { noteCommand } from './commands/note.ts';
import { subtasksCommand } from './commands/subtasks.ts';
import { epicTasksCommand } from './commands/epic-tasks.ts';
import { treeCommand } from './commands/tree.ts';
import { openCommand } from './commands/open.ts';
import { uiCommand } from './commands/ui.ts';
import { docCommand } from './commands/doc.ts';

const program = new Command();

program
  .name('pmdt')
  .description("Piotr's markdown tracker")
  .version(__VERSION__);

program.addCommand(initCommand);
program.addCommand(createCommand);
program.addCommand(getCommand);
program.addCommand(listCommand);
program.addCommand(availableCommand);
program.addCommand(backlogCommand);
program.addCommand(updateCommand);
program.addCommand(noteCommand);
program.addCommand(subtasksCommand);
program.addCommand(epicTasksCommand);
program.addCommand(treeCommand);
program.addCommand(openCommand);
program.addCommand(uiCommand);
program.addCommand(docCommand);

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err instanceof PmdtError) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(err.exitCode);
  }
  throw err;
}
