# API

## testMemoryLeak(): Promise<{ memoryConsumed: number; memoryInsights: string }>

This function will repeatedly call the callback function, record heap usage, and provide insights.

```ts
 testMemoryLeak (
    callback: CB,
    iteration: number,// default iteration is 20
    engine: 'node' | 'browser'
  )
```

```js
import { testMemoryLeak } from 'rewipe-js';
import Store from 'lib/store';

test('Should not consume more than 1MB', async () => {
  const { memoryInsights, memoryConsumed } = await testMemoryLeak(
    // you can pass in async/non-async function
    () => {
      Store.save('foo', { foo: 'bar' });
    }
  );

  // memoryConsumed in bytes
  console.log(`${memoryConsumed} bytes`);
  // log: 15000 bytes

  cosole.log(memoryInsights);
  // log: Total memory consumed — 1 Mb

  expect(memoryConsumed).toBeLessThan(1_000_000);
});
```

## config()

```js
config({
  environment: 'development', // 'development' | 'production' | 'stage'
  eventsListCountLimit: 3, // max items to record per event
  verbose: true, // true | false allow logs
});
```

## run(): Promise<string>

Start memory track

```js
const id = await run({
  eventName: 'FileUpload',
  props: {
    // ..
    // other properties you want to store
    // could be 'email' / 'id'
  },
});
```

## end(): Promise<void>

End of memory tracking

```js
await end({
  id, // id from 'run() function'
  eventName: 'FileUpload',
});
```

## getEvent (): IRewipeEvent[]

```ts
interface IRewipeEvent {
  id: string;
  eventName: IRewipeEnvironment | string;
  start: IRewipeMemoryInfo;
  startTimeIso: string;

  end?: IRewipeMemoryInfo;
  endTimeIso?: string;
  props?: {
    email?: string;
    id?: string;
  };
}

interface IRewipeMemoryInfo {
  unsupported: boolean;
  rss?: number;
  external?: number;
  heapTotal?: number;
  usedHeap?: number;
}
```

```js
const memoryInfo = getEvent('FileUpload');
```

## getEventMemoryInsights(): string

Get readable insights

```ts
getEventMemoryInsights({
  id,
  eventName: 'FileUpload',
  start: {
    // IRewipeMemoryInfo payload
  },
  end: {
    // IRewipeMemoryInfo payload
  },
});
```

```js
import { last } from 'lodash';
const memoryInfo = getEvent('FileUpload');

console.log(getEventMemoryInsights(last(memoryInfo)));
// log: 20% memory increase
```
