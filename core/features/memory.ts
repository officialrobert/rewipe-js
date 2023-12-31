import { filter, head, isNumber, isUndefined, trim } from 'lodash';
import { IRewipeMemoryInfo } from 'types';
import { isBrowserEnvironment, isNodeJsEnvironment } from './engine';

/**
 * Get device memory metadata based on the current runtime engine
 * @returns
 */
export const getMemoryUsage = async (
  engineType?: 'node' | 'browser'
): Promise<IRewipeMemoryInfo> => {
  try {
    const isBrowser =
      engineType === 'browser' ||
      (engineType !== 'node' && isBrowserEnvironment());

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
    }

    let isNodeJs: boolean | undefined = engineType === 'node';

    if (!isNodeJs) {
      // gc
      isNodeJs = undefined;
      isNodeJs = await isNodeJsEnvironment();
    }

    if (isNodeJs) {
      isNodeJs = undefined;
      let processModule = process;

      if (!processModule) {
        const nodeProcessName = 'process';
        processModule = await import(nodeProcessName);
      }

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
