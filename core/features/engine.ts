import { isUndefined } from 'lodash';

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

export const isBrowserEnvironment = () => {
  try {
    return !isUndefined(window) && window.document;
  } catch {
    return false;
  }
};
