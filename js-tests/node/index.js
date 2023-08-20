const {
  config,
  run,
  end,
  getEvent,
  getEventMemoryInsights,
  RewipeStorage,
} = require('rewipe-js');
const { timeout } = require('./utils');

const start = async (iteration = 1) => {
  let obj1 = {};
  let obj2 = {};
  const eventName = `StartTest${iteration}Event`;

  config({ environment: 'development', verbose: true });
  await run({ eventName });

  obj1 = null;
  obj2 = null;

  obj1 = { test: 1 };
  obj2 = { test: 1 };

  await end({ eventName });

  const memInfo = getEvent(eventName);
  console.log('memInfo', memInfo);
  console.log('\n\n');
  console.log(getEventMemoryInsights(memInfo[0]));
  console.log('\n\n');
};

try {
  (async () => {
    await start(1);
    await timeout(1_500);
    await start(1);
    await timeout(500);
    await start(2);

    console.log(RewipeStorage());
  })();
} catch (err) {
  console.log(err?.message);
}
