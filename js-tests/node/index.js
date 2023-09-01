const {
  config,
  run,
  end,
  getEvent,
  trackMemoryAndPromise,
  testMemoryLeak,
  getMetadata,
  getConsumedMemory,
  getEventMemoryInsights,
} = require('../../dist');
const { timeout } = require('./utils');

const start = async (iteration = 1) => {
  let obj1 = {};
  let obj2 = {};
  const eventName = `StartTest${iteration}Event`;

  const id = await run({ eventName });

  obj1 = null;
  obj2 = null;

  obj1 = { test: 1 };
  obj2 = { test: 1 };

  await end({ id, eventName });
};

const testTrackMemoryAndPromise = async () => {
  const addNumberTracked = trackMemoryAndPromise(
    'addNumber',
    (x = 0, y = 0) => {
      return x + y;
    }
  );

  const sum = await addNumberTracked(2, 2);

  console.log('addNumber', 'sum', sum, getEvent('addNumber'));
};

try {
  (async () => {
    config({
      environment: 'development',
      eventsListCountLimit: 3,
      verbose: false,
      metadata: {
        instance: 'instance0001',
      },
    });

    await start(1);
    await timeout(1_500);
    await start(1);
    await testTrackMemoryAndPromise();

    const eventName = `StartTest${1}Event`;
    const memInfo = getEvent(eventName);

    console.log('memInfo', memInfo);
    console.log('\n\n');
    console.log(
      'getEventMemoryInsights -',
      getEventMemoryInsights(getEvent(eventName))
    );
    console.log(
      'getConsumedMemory -',
      eventName,
      getConsumedMemory(getEvent(eventName))
    );
    console.log('\n\n');

    const { memoryConsumed, memoryInsights } = await testMemoryLeak(
      async () => {
        let obj1 = {};
        let obj2 = {};

        obj1 = null;
        obj2 = null;

        obj1 = { test: 1 };
        obj2 = { test: 1 };
      }
    );

    console.log(`getMetadata('instance')`, getMetadata('instance'));
    console.log('memoryConsumed:', memoryConsumed);
    console.log('\n');
    console.log('memoryInsights:\n');
    console.log(memoryInsights);
  })();
} catch (err) {
  console.log(err?.message);
}
