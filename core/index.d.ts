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
}
