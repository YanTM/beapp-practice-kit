# Utility API

Install with npm install beapp-practice-planner.
Import with require('beapp-practice-planner') or named ES module imports.
TypeScript declarations are included for both module formats.
For a normal browser script, load planner.js and use window.BeappPractice.

| Function | Input | Output |
| --- | --- | --- |
| createSession(options) | minutes: 2, 5, or 8; focus: mixed, memory, attention, reaction, or thinking; optional non-negative integer offset | Session with tasks and timing note |
| createWeek(options) | A real startDate in YYYY-MM-DD format, plus session options | Seven consecutive calendar-day suggestions |
| getTask(id) | A task ID from TASKS | Name, area, official URL, unit, instructions, and result guidance |
| validateResult(result) | {date, task, value, condition, notes?} | Normalized result with its task-specific unit |
| resultsToCsv(results) | Valid manual result objects | CSV text for a journal |
| weekToCsv(week) | Output of createWeek | CSV text for a seven-day plan |

TASKS and AREAS are frozen catalog exports.
Invalid inputs throw RangeError or TypeError.

Reaction results must be positive milliseconds. Number-memory digits and
visual-memory cells must be non-negative integers. Accuracy values must be
between 0 and 100. The condition field is required and accepts up to 120
characters; optional notes accept up to 500 characters.

For accuracy exercises, copy the percentage shown by the test, or calculate
correct / total * 100 from a completed attempt. Record any other displayed
metric in notes. Never turn a memory level or reaction time into a percentage.

The utility does not call the BEAPP API, store data, schedule reminders,
diagnose conditions, or assign difficulty levels.
A higher-level app decides when and where to store journal entries.
