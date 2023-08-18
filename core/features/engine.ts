import { isUndefined } from 'lodash';

/**
 * Check code if running from nodejs
 * @returns
 */
export const isNodeJsEnvironment = async (): Promise<boolean> => {
  try {
    const process = await import('process');

    return !isUndefined(process);
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
