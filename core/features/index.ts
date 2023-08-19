import { init, rewipeStorage } from '../store';
import { isEmpty } from 'lodash';
import {
  IRewipeCoreConfig,
  IRewipeEndParams,
  IRewipeEvent,
  IRewipeRunParams,
} from '../types';
import { InitConfigError } from '../errors';
import { computePercentDifferenceAndType } from './utils';

export const config = (params: IRewipeCoreConfig) => {
  init(params);
};

export const run = async (params: IRewipeRunParams): Promise<void> => {
  const { eventName, props } = params;

  if (!rewipeStorage) {
    throw new InitConfigError(`Run 'config' function`);
  }

  if (!isEmpty(eventName)) {
    // store event map
    await rewipeStorage?.newEvent(eventName, props);
  }
};

export const end = async (params: IRewipeEndParams): Promise<void> => {
  const { eventName } = params;

  if (!isEmpty(eventName) && !isEmpty(rewipeStorage)) {
    await rewipeStorage.endEvent(eventName);
  }
};

export const getEvent = (eventName: string): IRewipeEvent[] => {
  try {
    if (eventName && !isEmpty(rewipeStorage)) {
      return rewipeStorage.eventsRecord[eventName] || [];
    }

    return [];
  } catch (err) {
    return [];
  }
};

export const clearEvent = (eventName: string) => {
  if (rewipeStorage && !isEmpty(eventName)) {
    rewipeStorage?.clearEvent(eventName);
  }
};

export const getEventMemoryInsights = (eventPayload: IRewipeEvent): string => {
  try {
    const { start, end } = eventPayload;
    const { usedHeap: startUsedHeap } = start;
    const { usedHeap: endUsedHeap } = end || {};

    const diffMeta = computePercentDifferenceAndType(
      startUsedHeap as number,
      endUsedHeap as number
    );

    if (diffMeta?.type === 'increase') {
      return `${diffMeta?.percent?.toFixed(2)}% increase`;
    } else if (diffMeta?.type === 'decrease') {
      return `${diffMeta?.percent?.toFixed(2)}% decrease`;
    } else {
      return 'No change';
    }
  } catch (err: any) {
    return `Failed getEventMemoryInsights() err: ${err?.message}`;
  }
};
