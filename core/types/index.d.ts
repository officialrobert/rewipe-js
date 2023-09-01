export enum IRewipeEnvironment {
  development = 'development',
  production = 'production',
  stage = 'stage',
}

export enum RewipeSupportedEngine {
  browser = 'browser',
  node = 'node',
}

export enum RewipeEventRecordsFormat {
  json = 'json',
  array = 'array',
}

interface IRewipeMemoryInfo {
  unsupported: boolean;
  rss?: number;
  external?: number;
  heapTotal?: number;
  usedHeap?: number;
}

interface IRewipeEvent {
  id: string;
  eventName: IRewipeEnvironment | string;
  start: IRewipeMemoryInfo;
  startTimeIso: string;

  end?: IRewipeMemoryInfo;
  endTimeIso?: string;
  props?: {
    email?: string;
    id?: string;
  };
}

interface IRewipeConfigNode {
  enableIntervalCheck?: boolean; // run background function to ping memory every second
  intervalCheckDelayInMs?: number; // 1_000 === 1 sec
}

interface IRewipeCoreConfig {
  eventsListCountLimit?: number;
  apiKey?: string;
  environment?: IRewipeEnvironment | string;
  projectId?: string;
  verbose?: boolean | undefined;
  node?: IRewipeConfigNode | undefined;
  metadata?: Record<string, any>;
}

interface RuntimeStorageParams extends IRewipeCoreConfig {}

interface IRewipeRunParams {
  eventName: string;
  props?: Record<string, any>;
}

interface IRewipeEndParams {
  eventName: string;
  id: string;
}
