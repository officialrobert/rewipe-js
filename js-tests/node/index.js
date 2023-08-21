const {
  config,
  run,
  end,
  getEvent,
  getEventMemoryInsights,
  RewipeStorage,
  trackMemoryAndPromise,
} = require('rewipe-js');
const { timeout } = require('./utils');

const start = async (iteration = 1) => {
  let obj1 = {};
  let obj2 = {};
  const eventName = `StartTest${iteration}Event`;

  config({
    environment: 'development',
    eventsListCountLimit: 3,
    verbose: true,
  });

  const id = await run({ eventName });

  obj1 = null;
  obj2 = null;

  obj1 = { test: 1 };
  obj2 = { test: 1 };

  await end({ id, eventName });

  const memInfo = getEvent(eventName);

  console.log('evt id', id, 'memInfo', memInfo);
  console.log('\n\n');
  console.log(getEventMemoryInsights(memInfo[0]));
  console.log('\n\n');
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
    await start(1);
    await timeout(1_500);
    await start(1);
    await timeout(500);
    await start(2);
    await testTrackMemoryAndPromise();

    console.log(RewipeStorage());
  })();
} catch (err) {
  console.log(err?.message);
}
