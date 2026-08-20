import * as fs from 'fs';
import * as path from 'path';
import { parseFile, parseFullFile, serializeTask, buildInitialBody, parseDocFile, serializeDoc, buildInitialDocBody } from '../utils/format.ts';
import type { Task, TaskFrontmatter, TaskSummary, Doc, DocFrontmatter } from './types.ts';
import { NotFoundError } from '../utils/errors.ts';

const TASKS_DIR = '.pmdt/tasks';

export function tasksDir(root: string): string {
  return path.join(root, TASKS_DIR);
}

export function loadAllSummaries(root: string): TaskSummary[] {
  const dir = tasksDir(root);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const summaries: TaskSummary[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const summary = parseFile(raw, filePath);
    if (summary) {
      summaries.push(summary);
    } else {
      console.warn(`Warning: skipping invalid task file: ${file}`);
    }
  }

  return summaries;
}

export function loadTask(filePath: string): Task {
  const raw = fs.readFileSync(filePath, 'utf8');
  const task = parseFullFile(raw, filePath);
  if (!task) {
    throw new Error(`Failed to parse task file: ${filePath}`);
  }
  return task;
}

export function findById(root: string, id: string): TaskSummary {
  const summaries = loadAllSummaries(root);
  const found = summaries.find((t) => t.id === id);
  if (!found) throw new NotFoundError(id);
  return found;
}

export function writeTask(task: Task): void {
  const today = new Date().toISOString().slice(0, 10);
  const updated: Task = { ...task, updated: today };
  fs.writeFileSync(updated.filePath, serializeTask(updated), 'utf8');
}

export function createTask(
  root: string,
  frontmatter: TaskFrontmatter,
  filename: string,
  body?: string
): Task {
  const dir = tasksDir(root);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, filename);
  const initialBody = buildInitialBody(frontmatter.title, body);
  const task: Task = { ...frontmatter, body: initialBody, filePath };
  fs.writeFileSync(filePath, serializeTask(task), 'utf8');
  return task;
}

export function renameTask(task: Task, newFilename: string): Task {
  const dir = path.dirname(task.filePath);
  const newFilePath = path.join(dir, newFilename);
  const updated: Task = { ...task, filePath: newFilePath };
  fs.writeFileSync(newFilePath, serializeTask(updated), 'utf8');
  fs.unlinkSync(task.filePath);
  return updated;
}

const DOCS_DIR = '.pmdt/docs';

export function docsDir(root: string): string {
  return path.join(root, DOCS_DIR);
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.name.endsWith('.md') && entry.name !== '.gitkeep') {
      results.push(full);
    }
  }
  return results;
}

export function loadAllDocs(root: string): Doc[] {
  const dir = docsDir(root);
  const docs: Doc[] = [];
  for (const filePath of walkDir(dir)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const docPath = path.relative(dir, filePath).replace(/\.md$/, '');
    const doc = parseDocFile(raw, filePath, docPath);
    if (doc) docs.push(doc);
  }
  return docs;
}

export function findDocByPath(root: string, docPath: string): Doc {
  const dir = docsDir(root);
  const filePath = path.join(dir, docPath + '.md');
  if (!fs.existsSync(filePath)) throw new NotFoundError(docPath);
  const raw = fs.readFileSync(filePath, 'utf8');
  const doc = parseDocFile(raw, filePath, docPath);
  if (!doc) throw new Error(`Failed to parse doc: ${filePath}`);
  return doc;
}

export function saveDoc(doc: Doc): void {
  const today = new Date().toISOString().slice(0, 10);
  const updated: Doc = { ...doc, updated: today };
  fs.writeFileSync(updated.filePath, serializeDoc(updated), 'utf8');
}

export function createDoc(
  root: string,
  docPath: string,
  title: string,
  body?: string,
  tags?: string[]
): Doc {
  const dir = docsDir(root);
  const filePath = path.join(dir, docPath + '.md');
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  if (fs.existsSync(filePath)) {
    throw new Error(`Doc already exists: ${docPath}`);
  }
  const today = new Date().toISOString().slice(0, 10);
  const frontmatter: DocFrontmatter = { title, created: today, updated: today };
  if (tags && tags.length > 0) frontmatter.tags = tags;
  const initialBody = buildInitialDocBody(title, body);
  const doc: Doc = { ...frontmatter, body: initialBody, filePath, docPath };
  fs.writeFileSync(filePath, serializeDoc(doc), 'utf8');
  return doc;
}
