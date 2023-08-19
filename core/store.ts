import { head, isArray, isEmpty, trim } from 'lodash';
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

  exportEventRecords(format: 'json' | 'array' = 'json') {
    if (format === 'json') {
      return this.eventsRecord;
    } else if (format === 'array') {
      const recorded = [];

      for (const eventName in this.eventsRecord) {
        const payload = head(this.eventsRecord[eventName]);

        if (payload) {
          recorded.push(payload);
        }
      }

      return recorded;
    }

    return undefined;
  }

  clearEvent = (eventName: string) => {
    eventName = trim(eventName);

    if (!isEmpty(this.eventsRecord[eventName])) {
      this.eventsRecord[eventName].length = 0;
    }
  };

  newEvent = async (eventName: string, props?: Record<string, any>) => {
    const memoryInfo = await getMemoryUsage();

    if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);

      const existingEventRecord = this.eventsRecord[eventName];

      if (!isEmpty(existingEventRecord)) {
        existingEventRecord.length = 0;
      } else if (!isArray(this.eventsRecord[eventName])) {
        this.eventsRecord[eventName] = [];
      }

      this.eventsRecord[eventName].push({
        eventName,
        start: memoryInfo,
        startTimeIso: moment().toISOString(),
        ...props,
      });
    }
  };

  endEvent = async (eventName: string) => {
    const memoryInfo = await getMemoryUsage();

    if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);

      const existingEventRecord = this.eventsRecord[eventName];
      const existingPayload = existingEventRecord.pop();

      if (!isEmpty(existingPayload)) {
        this.eventsRecord[eventName].length = 0;
        this.eventsRecord[eventName].push({
          ...existingPayload,
          end: memoryInfo,
          endTimeIso: moment().toISOString(),
        });
      }
    }
  };
}

const storage: { instance?: RuntimeStorage | null } = { instance: undefined };

export const init = (params: RuntimeStorageParams) => {
  if (!storage.instance) {
    storage.instance = new RuntimeStorage(params);
  }
};

export const getRewipeStorage = () => storage?.instance;

export { RuntimeStorage };
