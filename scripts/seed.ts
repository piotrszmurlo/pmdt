#!/usr/bin/env bun
/**
 * Seed script: generates demo tasks for visual testing of the pmdt dashboard.
 * Run from your project root: bun run scripts/seed.ts
 */

import { findPmdtRoot } from '../src/core/id.ts';
import { seedDemoData } from '../src/core/seed.ts';

const root = findPmdtRoot(process.cwd());
const { created } = seedDemoData(root);
console.log(`✓ Created ${created} demo tasks in ${root}/.pmdt/tasks/`);
