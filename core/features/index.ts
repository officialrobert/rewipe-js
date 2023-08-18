import { init, rewipeStorage } from '../store';
import { isEmpty } from 'lodash';
import {
  IRewipeCoreConfig,
  IRewipeEndParams,
  IRewipeEvent,
  IRewipeRunParams,
} from '../types';

export const config = (params: IRewipeCoreConfig) => {
  init(params);
};

export const run = async (params: IRewipeRunParams): Promise<void> => {
  const { eventName, props } = params;

  if (!isEmpty(eventName)) {
    // store event map
    await rewipeStorage.newEvent(eventName, props);
  }
};

export const end = async (params: IRewipeEndParams): Promise<void> => {
  const { eventName } = params;

  if (!isEmpty(eventName)) {
    await rewipeStorage.endEvent(eventName);
  }
};

export const getEvent = (eventName: string): IRewipeEvent[] => {
  if (eventName) {
    return rewipeStorage.eventsRecord[eventName] || [];
  }

  return [];
};
