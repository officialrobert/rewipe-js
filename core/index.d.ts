declare module 'rewipe-js' {
  export function config(params: IRewipeCoreConfig): void;

  export function run(params: IRewipeRunParams): Promise<string>;

  export function end(params: IRewipeEndParams): Promise<void>;

  export function getEvent(eventName: string): IRewipeEvent[];

  export function clearEvent(eventName: string): void;

  export function getEventMemoryInsights(eventPayload: IRewipeEvent): string;

  export function exportEventRecords(
    format: RewipeEventRecordsFormat
  ): IRewipeEvent[] | Record<string, IRewipeEvent[]> | null | undefined;

  export function RewipeStorage(): RuntimeStorage;

  export function trackMemoryAndPromise<
    E extends string,
    CB extends (...args: any[]) => any
  >(
    eventName: E,
    callback: CB
  ): (...args: Parameters<CB>) => Promise<ReturnType<CB>>;

  export function getConsumedMemory(eventPayload: IRewipeEvent): number;

  export function readableMemory(memoryInBytes: number): string;

  export function testMemoryLeak<CB extends (...args: any[]) => any>(
    callback: CB,
    iteration: number
  ): Promise<{ memoryConsumed: number; memoryInsights: string }>;

  export function getMetadata(property: string): any;
}
