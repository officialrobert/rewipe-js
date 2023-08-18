import { init, rewipeStorage } from '../store';
import { isEmpty } from 'lodash';
import { IRewipeCoreConfig, IRewipeEndParams, IRewipeRunParams } from '../types';

export const config = (params: IRewipeCoreConfig) => {
  init(params);
};

export const run = (params: IRewipeRunParams) => {
  const { eventName } = params;

  if (!isEmpty(eventName)) {
    // store event map
  }
};

export const end = (params: IRewipeEndParams) => {
  const { eventName } = params;

  if (!isEmpty(eventName)) {
    // store event map
  }
};

export const getEvent = (eventName: string) => {
  if (eventName) {
    return rewipeStorage.eventsRecord[eventName] || null;
  }

  return null;
};
