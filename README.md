# rewipe-js

Rewipe JS SDK - Easily track and kill memory leak

> Roadmap:
>
> - Enable developers to track memory usage from JavaScript runtime (backend or frontend)
> - Github Action integration so developers can test increase/decrease in memory usage for each PR that gets merged

# Install

```js
npm i rewipe-js
```

## How it works

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

  rewipe.end({
    id,
    eventName: 'SubmitCheckout',
  });
};
```

> Manual track or you can check from an intuitive dashboard at `rewipe.run(soon)`

```js
const info = rewipe.getEvent('SubmitCheckout');
// console.log(info[0]);

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

# ExpressJS server

```js
const app = express();

app.post('/test-endpoint', async (req, res, next) => {
  try {
    const id = await rewipe.run({
      eventName: 'FileUpload',
    });

    // file handling ...

    await rewipe.end({
      // id is required
      id,
      eventName: 'FileUpload',
    });

    console.log(
      rewipe.getEventMemoryInsights(rewipe.getEvent('FileUpload')[0])
    );

    // 15% heap memory increase
  } catch (err) {
    next(err);
  }
});
```

# Alternatively, use 'trackMemoryAndPromise' API

```js
const addNumberTracked = trackMemoryAndPromise('addNumber', (x = 0, y = 0) => {
  return x + y;
});
const sum = await addNumberTracked(2, 2);

console.log('event addNumber', 'sum', sum, getEvent('addNumber'));
// log: 'event addNumber sum 4 { id: 'xx-id', eventName: 'addNumber', ... }
```

# Identify which user experienced the app crash

You can store either the user `id` or `email` so you can easily search from the dashboard which user experienced the crash.

```js
rewipe.run({
  eventName: 'SubmitCheckout',
  props: { email: 'user@mail.com', id: 'xxxx-user-id' },
});
```
