const {
  config,
  run,
  end,
  getEvent,
  getEventMemoryInsights,
} = require('../dist');

const timeout = (ms) => {
  return new Promise((resolve) => {
    const _timeout = setTimeout(
      () => {
        clearTimeout(_timeout);
        return resolve();
      },
      ms ? ms : 50
    );
  });
};

const start = async (iteration = 1) => {
  let obj1 = {};
  let obj2 = {};
  const eventName = `StartTest${iteration}Event`;

  config({ environment: 'development' });
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
    start(1);
    await timeout(1_500);
    start(1);
    await timeout(500);
    start(2);
  })();
} catch (err) {
  console.log(err?.message);
}
