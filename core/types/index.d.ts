export enum IRewipeEnvironment {
  development = 'development',
  production = 'production',
  stage = 'stage',
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

interface IRewipeCoreConfig {
  apiKey?: string;
  environment?: IRewipeEnvironment | string;
  projectId?: string;
}

interface RuntimeStorageParams extends IRewipeCoreConfig {
  verbose?: boolean;
}

interface IRewipeRunParams {
  eventName: string;
  props?: Record<string, any>;
}

interface IRewipeEndParams {
  eventName: string;
}
