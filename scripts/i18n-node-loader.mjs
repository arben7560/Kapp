import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Metro supports JSON imports without attributes; Node's test runner requires one.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:') &&
        !/\.[a-z]+$/iu.test(specifier)) {
      for (const extension of ['.ts', '.tsx', '.json']) {
        const candidate = new URL(specifier + extension, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    return nextLoad(url, url.endsWith('.json')
      ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } }
      : context);
  },
});
