# Exporting new function

Make sure to declare the functions inside `./index.ts` file

```ts
export {
  config,
  run,
  end,
  getEvent,
  getEventMemoryInsights,
  clearEvent,
  exportEventRecords,
  RewipeStorage,
  // new function here
} from './features';
```

From `index.d.ts`

```ts
declare module 'rewipe-js' {
  // new function definition here
}
```
