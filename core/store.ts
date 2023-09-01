import {
  filter,
  head,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  isString,
  size,
  trim,
} from 'lodash';
import { getMemoryUsage } from './features/memory';
import {
  IRewipeCoreConfig,
  IRewipeEnvironment,
  IRewipeEvent,
  IRewipeMemoryInfo,
  RuntimeStorageParams,
} from './types';
import { createId } from '@paralleldrive/cuid2';
import * as moment from 'moment';

class RuntimeStorage {
  apiKey: string;
  environment: IRewipeEnvironment | string;
  projectId: string;
  eventsListCountLimit: number = 2;
  eventsRecord: Record<string, IRewipeEvent[]> = {};
  verbose?: boolean | undefined;
  startMemoryInfo?: IRewipeMemoryInfo | null | undefined;
  metadata?: Record<string, any>;

  constructor(params: IRewipeCoreConfig) {
    this.apiKey = params?.apiKey || '';
    this.environment = params?.environment || 'development';
    this.projectId = params?.projectId || '';
    this.eventsRecord = { ...this.eventsRecord };
    this.verbose = params?.verbose;

    if (isObject(params?.metadata) && !isEmpty(params?.metadata)) {
      this.metadata = { ...params.metadata };
    }

    if (
      isNumber(params?.eventsListCountLimit) &&
      params?.eventsListCountLimit > 1
    ) {
      if (params?.eventsListCountLimit > 100) {
        this.eventsListCountLimit = 100;
      } else {
        this.eventsListCountLimit = params.eventsListCountLimit;
      }
    }
  }

  getMetadata(property: string) {
    if (!isEmpty(property) && isString(property) && !isEmpty(this.metadata)) {
      return this.metadata[property];
    }

    return undefined;
  }

  exportEventRecords(format = 'json') {
    if (this.verbose) {
      console.log(`Rewipejs: exportEventRecords(${format})`);
    }

    if (format === 'json') {
      return this.eventsRecord;
    } else if (format === 'array') {
      const recorded = [];

      for (const eventName in this.eventsRecord) {
        for (let i = 0; i < size(this.eventsRecord[eventName]); i++) {
          const payload = this.eventsRecord[eventName][i];

          if (payload) {
            recorded.push(payload);
          }
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

  newEvent = async (
    eventName: string,
    props?: Record<string, any>
  ): Promise<string> => {
    const memoryInfo = await getMemoryUsage();

    if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);

      const existingEventRecord = this.eventsRecord[eventName];
      const id = createId();
      const eventPayload = {
        id,
        eventName,
        start: memoryInfo,
        startTimeIso: moment().toISOString(),
        ...props,
      };

      if (!isArray(existingEventRecord)) {
        this.eventsRecord[eventName] = [];
      }

      if (!isEmpty(existingEventRecord) && this.eventsListCountLimit === 1) {
        existingEventRecord.length = 0;
      } else if (
        this.eventsListCountLimit > 1 &&
        size(this.eventsRecord[eventName]) === this.eventsListCountLimit
      ) {
        // remove most recent item
        this.eventsRecord[eventName].pop();
      }

      this.eventsRecord[eventName].push(eventPayload);

      return id;
    } else if (this.verbose) {
      console.log('Rewipejs: newEvent(): unsupported');
    }

    return '';
  };

  endEvent = async (id: string, eventName: string) => {
    const memoryInfo = await getMemoryUsage();

    if (!id) {
      if (this.verbose) {
        console.log(
          `Rewipejs: endEvent(): eventName:${eventName} err: missing id`
        );
      }
    } else if (!memoryInfo?.unsupported && !isEmpty(memoryInfo)) {
      eventName = trim(eventName);

      if (this.eventsListCountLimit === 1) {
        const eventPayload = head(
          filter(this.eventsRecord[eventName], (e) => e?.id === id)
        );
        this.eventsRecord[eventName].length = 0;

        if (eventPayload?.id === id) {
          this.eventsRecord[eventName].push({
            ...eventPayload,
            end: memoryInfo,
            endTimeIso: moment().toISOString(),
          });
        }
      } else {
        for (let i = 0; i < size(this.eventsRecord[eventName]); i++) {
          const eventPayload = this.eventsRecord[eventName][i];

          if (eventPayload?.id === id) {
            this.eventsRecord[eventName][i].end = memoryInfo;
            this.eventsRecord[eventName][i].endTimeIso = moment().toISOString();
          }
        }
      }
    } else if (this.verbose) {
      console.log('Rewipejs: endEvent(): unsupported');
    }
  };
}

const storage: { instance?: RuntimeStorage | null } = { instance: undefined };

/**
 * Store initial memory so we can record and compare progress
 */
const storeInitialMemory = () => {
  getMemoryUsage()
    .then((memoryInfo) => {
      if (storage.instance && !storage.instance?.startMemoryInfo) {
        storage.instance.startMemoryInfo = memoryInfo;
      }
    })
    .catch((err) => {
      if (storage?.instance?.verbose) {
        console.log('Rewipejs: storeInitialMemory(): err:', err?.message);
      }
    });
};

export const init = (params: RuntimeStorageParams) => {
  if (!storage.instance) {
    if (params?.verbose) {
      console.log('Rewipejs: init()');
    }

    storage.instance = new RuntimeStorage(params);

    storeInitialMemory();
  }
};

export const getRewipeStorage = () => storage?.instance;

export { RuntimeStorage };
