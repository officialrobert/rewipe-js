import { head, isEmpty, trim } from 'lodash';
import { getMemoryUsage } from './features/memory';
import {
  IRewipeCoreConfig,
  IRewipeEnvironment,
  IRewipeEvent,
  RuntimeStorageParams,
} from './types';
import * as moment from 'moment';

class RuntimeStorage {
  apiKey: string;
  environment: IRewipeEnvironment | string;
  projectId: string;
  eventsRecord: Record<string, IRewipeEvent[]> = {};

  constructor(params: IRewipeCoreConfig) {
    this.apiKey = params?.apiKey || '';
    this.environment = params?.environment || 'development';
    this.projectId = params?.projectId || '';
    this.eventsRecord = { ...this.eventsRecord };
  }

  newEvent = async (eventName: string, props?: Record<string, any>) => {
    const memoryInfo = await getMemoryUsage();

    if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);
      this.eventsRecord[eventName] = [
        {
          eventName,
          start: memoryInfo,
          startTimeIso: moment().toISOString(),
          ...props,
        },
      ];
    }
  };

  endEvent = async (eventName: string) => {
    const memoryInfo = await getMemoryUsage();

    if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);

      const initPayload = head(this.eventsRecord[eventName]);

      if (!isEmpty(initPayload)) {
        this.eventsRecord[eventName] = [
          {
            ...initPayload,
            end: memoryInfo,
            endTimeIso: moment().toISOString(),
          },
        ];
      }
    }
  };
}

let storage: RuntimeStorage;

const init = (params: RuntimeStorageParams) => {
  if (!storage) {
    storage = new RuntimeStorage(params);
  }
};

export { init, RuntimeStorage, storage as rewipeStorage };
