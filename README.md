# rewipe-js

Rewipe JS SDK - Easily track and kill memory leak

> Roadmap:
>
> - Enable developers to track memory usage from JavaScript runtime (backend or frontend)
> - Github Action integration so developers can test increase/decrease in memory usage for each PR that gets merged

# Install

```js
npm i --save-dev rewipe-js
```

## How it works

```js
import * rewipe from 'rewipe-js';

rewipe.config({
    // apiKey and projectId not required for now
  apiKey: 'xxx-xxx',
  projectId: 'xxx-id',
  environment: 'development',
});

```

```js
// Example case
const onSubmitCheckout = async (e) => {
  await rewipe.run({
    eventName: 'SubmitCheckout',
  });

  // your computation code here
  // ...

  rewipe.end({
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
    await rewipe.run({
      eventName: 'FileUpload',
    });

    // file handling ...

    rewipe.end({
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

# Say goodbye to guessing which user experienced the app crash

You can store either the user `id` or `email` so you can easily search from the dashboard which user experienced the crash.

```js
rewipe.run({
  eventName: 'SubmitCheckout',
  props: { email: 'user@mail.com', id: 'xxxx-user-id' },
});
```
