# pmdt

Piotr's markdown tracker. Each task is a markdown file. Works with git and a local Kanban UI.

Forked from [nod](https://github.com/onmyway133/nod).

![](images/board.png)

## Install

Requires [Bun](https://bun.sh).

```bash
bun install
bun run src/index.ts --help
```

## How it works

Each task lives in its own `.md` file inside `.pmdt/tasks/`:

```
.pmdt/
  config.json
  tasks/
    epic-1-onboarding.md
    task-2-setup-database.md
    subtask-3-write-migrations.md
```

Tasks have a YAML header with fields like status, priority, and parent. The rest of the file is free-form markdown: description, notes, work log, anything you want.

Because tasks are plain files, you can commit them to git, review diffs, and read them in any editor.

## Quick start

```bash
cd my-project
pmdt init

pmdt create epic "Build auth system"
pmdt create task "Design database schema" --parent epic-1 --priority high
pmdt create subtask "Write migrations" --parent task-2
pmdt create bug "Fix token expiry" --parent task-2

pmdt available        # what to work on
pmdt tree epic-1      # visual overview
pmdt ui               # open Kanban board in browser
```

## Commands

### `pmdt init`
Set up a pmdt project in the current directory. Creates `.pmdt/` with `config.json` and a `tasks/` subfolder inside it.

### `pmdt create <type> <title>`
Create a task. Types: `epic`, `task`, `subtask`, `bug`.

```bash
pmdt create epic "Launch v2"
pmdt create task "Write tests" --parent epic-1 --priority high
pmdt create bug "Crash on logout" --parent task-3 --tags auth,crash
```

Options: `--parent <id>`, `--priority <p>`, `--tags <t1,t2>`

### `pmdt list`
List tasks with optional filters.

```bash
pmdt list
pmdt list --status todo
pmdt list --priority high
pmdt list --type task --parent epic-1
pmdt list --json
```

### `pmdt available`
Show tasks ready to work on (`todo` or `in-progress`), sorted by priority.

```bash
pmdt available
pmdt available --json
```

### `pmdt get <id>`
Show a task's full content.

```bash
pmdt get task-2
pmdt get task-2 --json
```

### `pmdt update <id>`
Change task fields.

```bash
pmdt update task-2 --status in-progress
pmdt update task-2 --priority critical
pmdt update task-2 --title "New title"
pmdt update task-2 --tags backend,auth
```

### `pmdt note <id> <text>`
Append a timestamped note to the task's Work Log.

```bash
pmdt note task-2 "Decided to use UUIDs for user IDs"
```

### `pmdt subtasks <id>`
List direct children of a task.

```bash
pmdt subtasks task-2
pmdt subtasks task-2 --json
```

### `pmdt epic-tasks <id>`
List all tasks and subtasks inside an epic.

```bash
pmdt epic-tasks epic-1
pmdt epic-tasks epic-1 --json
```

### `pmdt tree <id>`
Show the task hierarchy as a tree.

```bash
pmdt tree epic-1
# epic-1 [in-progress] Build auth system
# └── task-2 [in-progress] Design database schema
#     └── subtask-3 [todo] Write migrations
```

### `pmdt open <id>`
Open the task file in `$EDITOR`.

```bash
pmdt open task-2
```

### `pmdt ui`
Open a Kanban board in the browser at `http://localhost:7777`. Reflects the current state of your `.pmdt/tasks/` folder and auto-refreshes every 3 seconds.

```bash
pmdt ui
pmdt ui --port 8080
```

## Task file format

```markdown
---
id: task-2
title: "Design database schema"
type: task
status: todo
priority: high
parent: epic-1
tags:
  - database
created: 2026-04-05
updated: 2026-04-05
---

# Design database schema

Decide on the tables and relationships.

## Notes

Looking at PostgreSQL with UUID primary keys.

## Work Log

- 2026-04-05: Started research
```

## Statuses

`todo` → `in-progress` → `done` · also: `backlog`, `cancelled`

## Priorities

`critical` · `high` · `medium` · `low`

## Using with an agent

```bash
pmdt available --json          # pick next task
pmdt get task-2 --json         # read full context
pmdt update task-2 --status in-progress
pmdt note task-2 "Changed X because Y"
pmdt update task-2 --status done
pmdt epic-tasks epic-1 --json  # check epic progress
```
