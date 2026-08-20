# pmdt

A planner for one git repository. Piotr and agents use it to estimate work in working days, pack it onto a timeline, and ship it in milestones.

## Work

**Repository**:
The git repository that owns one pmdt instance.

**Epic**:
A large body of work in a Repository. A Repository has many Epics. An Epic has a Capacity.

**Capacity**:
How many people work an Epic at once. A whole number, edited on the Timeline. The Timeline packs that many lanes. Each Task or Bug occupies one lane until it is Closed.

**Milestone**:
A dated slice of one Epic, with a start date and a due date. Optional. A Task or Bug belongs to at most one Milestone. It is presented when every Task and Bug in it is `done`. If the due date has passed and work remains, the Milestone is late and stays open. The due date stays where you set it.

**Task**:
A unit of work under an Epic. It has an Estimate, a Status, and a Priority. It may belong to one Milestone. When Status becomes `done`, that date is Closed.

**Bug**:
A defect under an Epic or a Task. It has an Estimate, a Status, and a Priority. Under an Epic it may belong to one Milestone. Under a Task it follows that Task's Milestone. When Status becomes `done`, that date is Closed.

**Subtask**:
A checklist item under a Task or a Bug. It is open or done. It follows its parent's Milestone.

**Unplanned**:
A Task or Bug with no Milestone.

**Work file**:
The markdown file for one Epic, Milestone, Task, Bug, or Subtask. Source of truth. Notes live in this file. Git is the history.

## Time

**Working day**:
Monday through Friday.

**Estimate**:
A duration in Working days on a Task or a Bug. The plan for that item.

**Closed**:
The date a Task or Bug became `done`. How long it took is Closed minus when its bar started, in Working days.

**Sequence**:
The order of Tasks and Bugs in a Milestone. You set it. Lanes fill in this order: the next item takes the next free lane.

**Forecast**:
The date remaining open Estimates in a Milestone finish if packed into the Epic's Capacity lanes, in Sequence, from today. Idle Working days push it later.

**Priority**:
`critical`, `high`, `medium`, or `low` on a Task or Bug. Shown on the Board.

**Status**:
On a Task or Bug: `todo`, `in-progress`, `done`, `cancelled`. On a Subtask: open or done.

## Views

**Planner**:
Timeline, Capacity, Sequence, Milestone dates, and Milestone membership. New work here is Unplanned on the current Epic, or in the Milestone you create it under.

**Timeline**:
Tasks and Bugs on a time axis, grouped by Epic, on the Planner. Bars follow Estimate, Status, Closed, Capacity, Sequence, and Milestone. Unplanned work sits at the end of its Epic row. The view updates when those fields change.

**Board**:
Status columns `todo`, `in-progress`, `done`, `cancelled`. Scope is one Epic or one Milestone. An Epic-scoped Board shows that Epic's Unplanned work and every Milestone together. The card shows the Milestone name or Unplanned. Dragging a card sets Status. New work inherits the current scope.
