# API

## config()

```js
{
  environment: 'development', // 'development' | 'production' | 'stage'
  eventsListCountLimit: 3, // max items to record per event
  verbose: true  // true | false allow logs
}
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
