import { getRewipeStorage, init } from '../store';
import { head, isArray, isEmpty, isNumber, isObject, last, size } from 'lodash';
import {
  IRewipeCoreConfig,
  IRewipeEndParams,
  IRewipeEvent,
  IRewipeRunParams,
  RewipeEventRecordsFormat,
} from '../types';
import {
  InitConfigError,
  RewipeUnsupportedError,
  TestIterationError,
} from '../errors';
import { computePercentDifferenceAndType, readableMemory } from './utils';
import { getMemoryUsage } from './memory';
import { testMemoryLeakMinIteration } from '../constants';

export const config = (params: IRewipeCoreConfig) => {
  init(params);
};

export const getMetadata = (property: string) => {
  try {
    return getRewipeStorage()?.getMetadata(property);
  } catch {
    return undefined;
  }
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

export const getEventMemoryInsights = (
  param: IRewipeEvent | IRewipeEvent[]
): string => {
  try {
    const eventPayload = isArray(param) ? last(param) : param;

    if (eventPayload && isObject(eventPayload)) {
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
        )}% increase. Total consumed in bytes - ${totalBytesDifference}`;
      } else if (diffMeta?.type === 'decrease') {
        return `${eventName}: ${diffMeta?.percent?.toFixed(
          2
        )}% decrease. Total consumed in bytes - ${totalBytesDifference}`;
      } else {
        return `${eventName}: No change`;
      }
    }

    throw new Error('Missing eventPayload');
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

export const getConsumedMemory = (
  param: IRewipeEvent | IRewipeEvent[]
): number | undefined => {
  let eventPayload: IRewipeEvent | null | undefined = null;

  if (isArray(param)) {
    eventPayload = last(param);
  } else if (!isEmpty(param) && param?.start) {
    eventPayload = param;
  }

  if (eventPayload && !isEmpty(eventPayload)) {
    const { start, end } = eventPayload;
    const { usedHeap: startUsedHeap = 0 } = start;
    const { usedHeap: endUsedHeap = 0 } = end || {};

    return endUsedHeap - startUsedHeap;
  }

  return undefined;
};

/**
 * Test and track your app's heap memory footprint
 * @param callback
 * @param iteration
 * @returns memoryInsights - Human readable generated insights that will prompt if there's a possible memory leak
 */
export const testMemoryLeak = async function <
  CB extends (...args: any[]) => any
>(
  callback: CB,
  iteration = testMemoryLeakMinIteration
): Promise<{ memoryConsumed: number; memoryInsights: string }> {
  const memos = [];
  const rewipeStorage = getRewipeStorage();

  if (iteration < testMemoryLeakMinIteration) {
    throw new TestIterationError(
      `testMemoryLeak(): 'iteration' should be >=${testMemoryLeakMinIteration}`
    );
  }

  for (let i = 0; i < iteration; i++) {
    const memoryInfoStart = await getMemoryUsage();
    const result = callback();

    if (result instanceof Promise) {
      await result;
    }

    if (memoryInfoStart?.unsupported) {
      throw new RewipeUnsupportedError('Rewipejs engine not supported');
    }

    const memoryInfoEnd = await getMemoryUsage();

    memos.push({
      start: memoryInfoStart,
      end: memoryInfoEnd,
    });
  }

  let memoryInsights = '';
  let memoryConsumed = 0; // we return the highest memory bytes consumed from all iterations

  for (let i = 0; i < size(memos); i++) {
    const currentMemo = memos[i];
    const prevMemo = memos[i - 1];

    if (
      isNumber(currentMemo?.end?.usedHeap) &&
      isNumber(currentMemo?.start?.usedHeap)
    ) {
      const totalConsumed =
        currentMemo.end?.usedHeap - currentMemo.start?.usedHeap;

      if (!memoryConsumed || totalConsumed > memoryConsumed) {
        memoryConsumed = totalConsumed;
      }

      if (
        isNumber(prevMemo?.end?.usedHeap) &&
        isNumber(prevMemo?.start?.usedHeap)
      ) {
        const prevTotalConsumed =
          prevMemo?.end?.usedHeap - prevMemo?.start?.usedHeap;

        if (!isEmpty(memoryInsights) && rewipeStorage?.verbose) {
          memoryInsights += '\n';
        }

        const diffMeta = computePercentDifferenceAndType(
          prevTotalConsumed,
          totalConsumed
        );

        if (rewipeStorage?.verbose) {
          memoryInsights += `Iteration #${i} — ${readableMemory(
            totalConsumed
          )} consumed. ${diffMeta?.percent}${
            isNumber(diffMeta?.percent) ? '%' : ''
          } ${diffMeta?.type}`;
        }
      }
    }
  }

  const totalMemoryInsight = `Total memory consumed — ${readableMemory(
    memoryConsumed
  )}`;
  const firstMemo = head(memos);
  const lastMemo = last(memos);

  if (memoryInsights) {
    memoryInsights += '\n';
    memoryInsights += totalMemoryInsight;
  } else {
    memoryInsights = totalMemoryInsight;
  }

  if (
    firstMemo &&
    lastMemo &&
    isNumber(firstMemo?.start?.usedHeap) &&
    isNumber(firstMemo?.end?.usedHeap) &&
    isNumber(lastMemo?.start?.usedHeap) &&
    isNumber(lastMemo?.end?.usedHeap)
  ) {
    const firstIterationMemoryConsumed =
      firstMemo?.end.usedHeap - firstMemo?.start?.usedHeap;
    const lastIterationMemoryConsumed =
      lastMemo?.end.usedHeap - lastMemo?.start?.usedHeap;

    if (lastIterationMemoryConsumed > firstIterationMemoryConsumed) {
      // check
      const diffMeta = computePercentDifferenceAndType(
        firstIterationMemoryConsumed,
        lastIterationMemoryConsumed
      );

      if (diffMeta?.percent > 5 && diffMeta?.type === 'increase') {
        if (memoryInsights) {
          memoryInsights += '\n';
        }

        memoryInsights += `${diffMeta.percent}% memory increase. Possible memory leak.`;
      }
    }
  }

  return { memoryInsights, memoryConsumed };
};
