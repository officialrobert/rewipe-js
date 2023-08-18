export enum IRewipeEnvironment {
  development = 'development',
  production = 'production',
  stage = 'stage',
}

interface IRewipeEvent {
  eventName: IRewipeEnvironment | string;
  startMemoryInBytes: number;
  endMemoryInBytes: number;
  startToEndMemoryInBytes: number;
  startTimeUtc: string;
  endTimeUtc: string;
  props?: {
    email?: string;
    id?: string;
  };
}

interface IRewipeCoreConfig {
  apiKey: string;
  environment: IRewipeEnvironment | string;
  projectId?: string;
}

interface RuntimeStorageParams extends IRewipeCoreConfig {}

interface IRewipeRunParams {
  eventName: string;
}

interface IRewipeEndParams {
  eventName: string;
}
