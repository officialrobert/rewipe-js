import { isNil, isUndefined } from 'lodash';

/**
 * Check code if running from nodejs
 * @returns
 */
export const isNodeJsEnvironment = async (): Promise<boolean> => {
  try {
    try {
      if (window && !isUndefined(window)) {
        return false;
      } else {
        throw new Error('is node');
      }
    } catch {
      const nodeProcess = require('process');
      return !isUndefined(nodeProcess) && !isNil(nodeProcess);
    }
  } catch (err: any) {
    return false;
  }
};

/**
 * Check code if running from browser
 * @returns
 */
export const isBrowserEnvironment = async (): Promise<boolean> => {
  try {
    return !isUndefined(window) && !window.document;
  } catch (err: any) {
    return false;
  }
};
