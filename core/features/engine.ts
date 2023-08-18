import { isUndefined } from 'lodash';

/**
 * Check code if running from nodejs
 * @returns
 */
export const isNodeJsEnvironment = (): boolean => {
  try {
    return (
      isUndefined(window) &&
      !isUndefined(process) &&
      process.release.name === 'node'
    );
  } catch {
    return false;
  }
};

/**
 * Check code if running from browser
 * @returns
 */
export const isBrowserEnvironment = (): boolean => {
  try {
    return !isUndefined(window) && !isUndefined(window.document);
  } catch {
    return false;
  }
};
