import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import type { PmdtConfig } from '../core/types.ts';

export const initCommand = new Command('init')
  .description('Initialize a pmdt project in the current directory')
  .action(() => {
    const root = process.cwd();
    const pmdtDir = path.join(root, '.pmdt');
    const configPath = path.join(pmdtDir, 'config.json');
    const tasksDir = path.join(pmdtDir, 'tasks');
    const docsDir = path.join(pmdtDir, 'docs');

    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('Already a pmdt project.') + ` Config: ${configPath}`);
      return;
    }

    fs.mkdirSync(pmdtDir, { recursive: true });

    const config: PmdtConfig = { counter: 0, version: '1' };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir);
      fs.writeFileSync(path.join(tasksDir, '.gitkeep'), '', 'utf8');
    }

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
      fs.writeFileSync(path.join(docsDir, '.gitkeep'), '', 'utf8');
    }

    console.log(chalk.green('Initialized pmdt project.'));
    console.log(`  Config: ${configPath}`);
    console.log(`  Tasks:  ${tasksDir}`);
    console.log(`  Docs:   ${docsDir}`);
  });
