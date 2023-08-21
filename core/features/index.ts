import { getRewipeStorage, init } from '../store';
import { isEmpty } from 'lodash';
import {
  IRewipeCoreConfig,
  IRewipeEndParams,
  IRewipeEvent,
  IRewipeRunParams,
  RewipeEventRecordsFormat,
} from '../types';
import { InitConfigError } from '../errors';
import { computePercentDifferenceAndType } from './utils';

export const config = (params: IRewipeCoreConfig) => {
  init(params);
};

export const exportEventRecords = (
  format: RewipeEventRecordsFormat
): IRewipeEvent[] | Record<string, IRewipeEvent[]> | null | undefined => {
  try {
    const rewipeStorage = getRewipeStorage();

    if (rewipeStorage) {
      return rewipeStorage.exportEventRecords(format);
    }

    return null;
  } catch (err: any) {
    console.log('Rewipejs: exportEventRecords() err:', err?.message);
    return null;
  }
};

export const RewipeStorage = () => getRewipeStorage();

export const run = async (params: IRewipeRunParams): Promise<string> => {
  const { eventName, props } = params;
  const rewipeStorage = getRewipeStorage();

  if (!rewipeStorage) {
    throw new InitConfigError(`Run 'config' function`);
  }

  if (!isEmpty(eventName)) {
    // store event map
    const eventId = await rewipeStorage?.newEvent(eventName, props);

    return eventId;
  }

  return '';
};

export const end = async (params: IRewipeEndParams): Promise<void> => {
  const { eventName, id } = params;
  const rewipeStorage = getRewipeStorage();

  if (!isEmpty(eventName) && !isEmpty(rewipeStorage)) {
    await rewipeStorage.endEvent(id, eventName);
  }
};

export const getEvent = (eventName: string): IRewipeEvent[] => {
  try {
    const rewipeStorage = getRewipeStorage();

    if (eventName && !isEmpty(rewipeStorage)) {
      return rewipeStorage.eventsRecord[eventName] || [];
    }

    return [];
  } catch (err) {
    return [];
  }
};

export const clearEvent = (eventName: string) => {
  const rewipeStorage = getRewipeStorage();

  if (rewipeStorage && !isEmpty(eventName)) {
    rewipeStorage?.clearEvent(eventName);
  }
};

export const getEventMemoryInsights = (eventPayload: IRewipeEvent): string => {
  try {
    const { start, end, eventName } = eventPayload;
    const { usedHeap: startUsedHeap = 0 } = start;
    const { usedHeap: endUsedHeap = 0 } = end || {};

    const diffMeta = computePercentDifferenceAndType(
      startUsedHeap as number,
      endUsedHeap as number
    );
    const totalBytesDifference = endUsedHeap - startUsedHeap;

    if (diffMeta?.type === 'increase') {
      return `${eventName}: ${diffMeta?.percent?.toFixed(
        2
      )}% increase. Total bytes - ${totalBytesDifference}`;
    } else if (diffMeta?.type === 'decrease') {
      return `${eventName}: ${diffMeta?.percent?.toFixed(
        2
      )}% decrease. Total bytes - ${totalBytesDifference}`;
    } else {
      return `${eventName}: No change`;
    }
  } catch (err: any) {
    return `Failed getEventMemoryInsights() err: ${err?.message}`;
  }
};

export const trackMemoryAndPromise = function <
  E extends string,
  CB extends (...args: any[]) => any
>(
  eventName: E,
  callback: CB
): (...args: Parameters<CB>) => Promise<ReturnType<CB>> {
  return async (...args: Parameters<CB>): Promise<ReturnType<CB>> => {
    const id = await run({ eventName });
    const result = callback(...args);

    if (result instanceof Promise) {
      const res = await result;
      await end({ id, eventName });

      return res;
    } else {
      await end({ id, eventName });
      return result;
    }
  };
};
