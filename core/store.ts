import {
  IRewipeCoreConfig,
  IRewipeEnvironment,
  IRewipeEvent,
  RuntimeStorageParams,
} from './types';

class RuntimeStorage {
  apiKey: string;
  environment: IRewipeEnvironment | string;
  projectId: string;
  eventsRecord: Record<string, IRewipeEvent> = {};

  constructor(params: IRewipeCoreConfig) {
    this.apiKey = params?.apiKey;
    this.environment = params?.environment;
    this.projectId = params?.projectId || '';
    this.eventsRecord = { ...this.eventsRecord };
  }
}

let storage: RuntimeStorage;

const init = (params: RuntimeStorageParams) => {
  if (!storage) {
    storage = new RuntimeStorage(params);
  }
};

export { init, RuntimeStorage, storage as rewipeStorage };
