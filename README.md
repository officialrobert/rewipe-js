# rewipe-js

RewipeJS - Easily track and kill memory leak

> Roadmap:
>
> - Enable developers to track memory usage from JavaScript runtime (backend or frontend)
> - Github Action integration so developers can test increase/decrease in memory usage for each PR that gets merged

<img src="https://github.com/officialrobert/rewipe-js/blob/main/docs/rewipe-cover.png" width="100%" height="auto"/>

## Install

```js
npm i rewipe-js
```

## For testing

The `testMemoryLeak` function repeatedly calls the provided function to record heap usage. Works on nodejs and browsers.

```js
import { testMemoryLeak } from 'rewipe-js';
import Store from 'lib/store';

test('Should not consume more than 1MB', async () => {
  const { memoryInsights, memoryConsumed } = await testMemoryLeak(
    // you can pass in async/non-async function
    () => {
      Store.save('foo', { foo: 'bar' });
    },
    30, // iterations
    'node' // 'node' or 'browser'
  );

  // memoryConsumed in bytes
  console.log(`${memoryConsumed} bytes`);
  // log: 15000 bytes

  cosole.log(memoryInsights);
  // log: Total memory consumed — 1 Mb

  expect(memoryConsumed).toBeLessThan(1_000_000);
});
```

**Note:** Some browsers might not support the `window.performance.memory` API. To begin testing from a Chromium-based browser, run the app with the `--enable-precise-memory-info` flag.

## How it works (advanced)

You can use this library for record-keeping. You can keep the payload using [**Sentry**](https://sentry.io/welcome/) or [**Posthog**](https://posthog.com/)

```js
import * rewipe from 'rewipe-js';

rewipe.config({
  environment: 'development', // 'development' | 'production' | 'stage'
  eventsListCountLimit: 3, // max items to record per event
  verbose: true  // allow logs
});
```

```js
// Example case
const onSubmitCheckout = async (e) => {
  const id = await rewipe.run({
    eventName: 'SubmitCheckout',
  });

  // your computation code here
  // ...

  await rewipe.end({
    id,
    eventName: 'SubmitCheckout',
  });
};
```

## Track your event's memory heap

```js
const info = rewipe.getEvent('SubmitCheckout');
const sampleInfoPayload = info[0];

console.log(sampleInfoPayload);
// sample log data
const sampleInfoPayload = {
  id: 'xx-xx-unique-id',
  eventName: 'SubmitCheckout',

  // This means, it took 10 MB-
  // to complete checkout functionality from client's end
  start: {
    // ...other props
    unsupported: false,
    // in bytes
    heapTotal: 3e7,
    usedHeap: 1e7,
  },
  end: {
    // ...other props
    unsupported: false,
    usedHeap: 2e7,
  },
  startTimeIso: '2023-08-18T08:21:55.468Z',
  endTimeIso: '2023-08-18T08:22:43.215Z',
};
```

## ExpressJS server

```js
import * as rewipe from 'rewipe-js';

const app = express();

app.post('/test-endpoint', async (req, res, next) => {
  try {
    const eventName = 'FileUpload';
    const id = await rewipe.run({ eventName });

    // file handling ...

    await rewipe.end({
      // id is required
      id,
      eventName,
    });

    const memoryEventInfo = rewipe.getEvent(eventName);
    const consumed = rewipe.getConsumedMemory(memoryEventInfo);

    console.log(consumed);
    // in bytes
    // log: 15000

    // or

    // log({
    //   ...
    //   message: `File upload took ${rewipe.readableMemory(consumed)}`,
    // });

    console.log(rewipe.getEventMemoryInsights(memoryEventInfo));
    // log: 15% heap memory increase
  } catch (err) {
    next(err);
  }
});
```

## Alternatively, use 'trackMemoryAndPromise' API

```js
const addNumberTracked = trackMemoryAndPromise('addNumber', (x = 0, y = 0) => {
  return x + y;
});
const sum = await addNumberTracked(2, 2);

console.log('event addNumber', 'sum', sum, getEvent('addNumber'));
// log: 'event addNumber sum 4 { id: 'xx-id', eventName: 'addNumber', ... }
```

## Identify which user experienced the app crash

You can store either the user `id` or `email` so you can easily search from the dashboard which user experienced the crash.

```js
rewipe.run({
  eventName: 'SubmitCheckout',
  props: { email: 'user@mail.com', id: 'xxxx-user-id' },
});
```

## Documentation

Access the <a href="./docs/README.md"><b> full API docs.</b></a>

## License

Licensed under [MIT](./LICENSE).
