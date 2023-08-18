# rewipe-js

Rewipe JS SDK - Easily track and kill memory leak

> Roadmap:
>
> - Enable developers to track memory usage from JavaScript runtime (backend or frontend)
> - Github Action integration so developers can test increase/decrease in memory usage for each PR that gets merged

## How it works

```js
import * rewipe from 'rewipe-js';

rewipe.config({
  apiKey: 'xxx-xxx',
  projectId: 'xxx-id',
  environment: 'development',
});

```

```js
// Example case
const onSubmitCheckout = (e) => {
  rewipe.run({
    eventName: 'SubmitCheckout',
  });

  // @ your computation code here
  // @

  rewipe.end({
    eventName: 'SubmitCheckout',
  });
};
```

> Manual track or you can check from an intuitive dashboard at `rewipe.run`

```js
const info = rewipe.getEvent('SubmitCheckout');
console.log(info);

// sample log data
const sampleInfoPayload = {
  eventName: 'SubmitCheckout',
  startToEndMemoryInBytes: 2e7, // This means, it took 20 MB to complete checkout functionality from client's end
  startMemoryInBytes: 1e7,
  endMemoryInBytes: 3e7,
};
```
