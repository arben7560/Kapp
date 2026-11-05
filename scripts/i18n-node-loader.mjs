import { registerHooks } from 'node:module';

// Metro supports JSON imports without attributes; Node's test runner requires one.
registerHooks({
  load(url, context, nextLoad) {
    return nextLoad(url, url.endsWith('.json')
      ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } }
      : context);
  },
});
