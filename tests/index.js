const { config, run, end, getEvent } = require('../dist');

const start = async () => {
  let obj1 = {};
  let obj2 = {};
  const eventName = 'StartTest1Event';

  config({ environment: 'development' });
  await run({ eventName });

  obj1 = null;
  obj2 = null;

  obj1 = { test: 1 };
  obj2 = { test: 1 };

  await end({ eventName });

  const memInfo = getEvent(eventName);
  console.log('memInfo', memInfo);
};

try {
  start();
} catch (err) {
  console.log(err?.message);
}
