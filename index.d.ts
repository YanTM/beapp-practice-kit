export type SkillArea = 'memory' | 'attention' | 'reaction' | 'thinking';
export type Focus = 'mixed' | SkillArea;
export type Minutes = 2 | 5 | 8;
export type TaskId = 'reaction' | 'number_memory' | 'stroop' | 'visual_memory'
  | 'pattern_recognition' | 'visual_search' | 'choice_reaction' | 'mental_rotation';
export type ResultUnit = 'ms' | 'digits' | 'cells' | '% correct';
export interface Task {
  readonly id: TaskId;
  readonly name: string;
  readonly area: SkillArea;
  readonly path: string;
  readonly url: string;
  readonly unit: ResultUnit;
  readonly label: string;
  readonly min: number;
  readonly max?: number;
  readonly integer?: boolean;
  readonly steps: readonly string[];
  readonly tip: string;
  readonly read: string;
}
export interface SessionOptions { minutes?: Minutes; focus?: Focus; offset?: number; }
export interface Session { minutes: Minutes; focus: Focus; tasks: Task[]; note: string; }
export interface WeekOptions { startDate: string; minutes?: Minutes; focus?: Focus; }
export interface Day extends Session { date: string; }
export interface ResultInput {
  date: string; task: TaskId; value: number | string; condition: string; notes?: string;
}
export interface Result {
  date: string; task: TaskId; value: number; unit: ResultUnit; condition: string; notes: string;
}
export const TASKS: readonly Task[];
export const AREAS: readonly Focus[];
export function getTask(id: TaskId): Task;
export function createSession(options?: SessionOptions): Session;
export function createWeek(options: WeekOptions): Day[];
export function validateResult(result: ResultInput): Result;
export function resultsToCsv(results: ResultInput[]): string;
export function weekToCsv(week: Day[]): string;
