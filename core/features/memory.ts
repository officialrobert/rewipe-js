import { filter, head, isNumber, isUndefined, trim } from 'lodash';
import { IRewipeMemoryInfo } from '../types';
import { isBrowserEnvironment, isNodeJsEnvironment } from './engine';

/**
 * Get device memory metadata based on the current runtime engine
 * @returns
 */
export const getMemoryUsage = async (): Promise<IRewipeMemoryInfo> => {
  try {
    const isNodeJs = await isNodeJsEnvironment();
    const isBrowser = await isBrowserEnvironment();

    if (isBrowser) {
      // eslint-disable-next-line
      // @ts-ignore
      const memoryInfo = window.performance?.memory;
      const windowOrigin = trim(window.location.origin);

      if (!memoryInfo) {
        const newBrowserMemoryInfo =
          // eslint-disable-next-line
          // @ts-ignore
          await performance.measureUserAgentSpecificMemory();

        if (
          isUndefined(newBrowserMemoryInfo) ||
          !isNumber(newBrowserMemoryInfo?.bytes)
        ) {
          throw new Error('Unsupported');
        }

        const windowBreakdown = head(
          filter(
            newBrowserMemoryInfo?.breakdown || [],
            // eslint-disable-next-line
            // @ts-ignore
            (b) => head(b?.attribution || [])?.url === windowOrigin
          )
        );

        if (!windowBreakdown) {
          throw new Error('Unsupported');
        }

        return {
          unsupported: false,
          usedHeap: windowBreakdown?.bytes,
          heapTotal: newBrowserMemoryInfo?.bytes,
        };
      }

      return {
        unsupported: false,
        usedHeap: memoryInfo?.usedJSHeapSize,
        heapTotal: memoryInfo?.totalJSHeapSize,
      };
    } else if (isNodeJs) {
      const processModule = await import('process');
      const memoryInfo = processModule.memoryUsage();

      if (!memoryInfo) {
        return {
          unsupported: true,
        };
      }

      return {
        unsupported: false,
        rss: memoryInfo?.rss,
        external: memoryInfo?.external,
        usedHeap: memoryInfo.heapUsed,
        heapTotal: memoryInfo.heapTotal,
      };
    } else {
      return {
        unsupported: true,
      };
    }
  } catch (err: any) {
    console.log('getMemoryUsage err', err?.message);

    return {
      unsupported: true,
    };
  }
};
