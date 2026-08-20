export type TaskType = 'epic' | 'task' | 'subtask' | 'bug';
export type Status = 'todo' | 'in-progress' | 'backlog' | 'done' | 'cancelled';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskFrontmatter {
  id: string;
  title: string;
  type: TaskType;
  status: Status;
  priority: Priority;
  parent?: string;
  related?: string[];
  docs?: string[];
  created: string; // YYYY-MM-DD, set once on create
  updated: string; // YYYY-MM-DD, auto-updated on every write
  tags?: string[];
}

export interface Task extends TaskFrontmatter {
  body: string; // raw markdown body after frontmatter
  filePath: string; // absolute path on disk
}

export interface TaskSummary extends TaskFrontmatter {
  filePath: string; // frontmatter only, no body loaded
}

export interface PmdtConfig {
  counter: number;
  version: string;
}

export interface QueryOptions {
  type?: TaskType;
  status?: Status;
  priority?: Priority;
  parent?: string;
  tags?: string[];
}

export interface UpdateOptions {
  status?: Status;
  priority?: Priority;
  title?: string;
  tags?: string[];
  parent?: string;
  related?: string[];
}

export interface TreeNode {
  task: TaskSummary;
  children: TreeNode[];
}

export const TASK_TYPES: TaskType[] = ['epic', 'task', 'subtask', 'bug'];
export const STATUSES: Status[] = ['todo', 'in-progress', 'backlog', 'done', 'cancelled'];
export const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export interface DocFrontmatter {
  title: string;
  created: string; // YYYY-MM-DD
  updated: string; // YYYY-MM-DD
  tags?: string[];
}

export interface Doc extends DocFrontmatter {
  body: string;       // raw markdown body after frontmatter
  filePath: string;   // absolute path on disk
  docPath: string;    // relative path within docs dir, e.g. "terminology/mastercard"
}

// Which types can be parents of each type
export const ALLOWED_PARENTS: Record<TaskType, TaskType[]> = {
  epic: [],
  task: ['epic'],
  subtask: ['task', 'bug'],
  bug: ['epic', 'task'],
};
