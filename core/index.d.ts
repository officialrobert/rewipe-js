declare module 'rewipe-js' {
  export function config(params: IRewipeCoreConfig): void;

  export function run(params: IRewipeRunParams): Promise<void>;

  export function end(params: IRewipeEndParams): Promise<void>;

  export function getEvent(eventName: string): IRewipeEvent[];

  export function getEventMemoryInsights(eventPayload: IRewipeEvent): string;
}
