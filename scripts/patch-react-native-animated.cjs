/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');

// Backport of https://github.com/react/react-native/commit/856661ff37632e74fce1914224cd527750475410
// RN 0.88.1 reconnects a native AnimatedProps node without detaching its old view.
// Android rejects that attachment and tears down the rendered application.
const originalLines = [
  '    if (this._target?.instance === instance) {',
  '      return;',
  '    }',
  '    const target = (this._target = {instance, connectedViewTag: null});',
];
const fixedLines = [
  ...originalLines.slice(0, 3),
  '    if (this.__isNative && this._target != null) {',
  '      this.#disconnectAnimatedView(this._target);',
  '    }',
  originalLines[3],
];

function patchAnimatedPropsSource(source, version) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const original = originalLines.join(newline);
  const fixed = fixedLines.join(newline);
  if (source.includes(fixed)) return source;
  if (version !== '0.88.1' || source.split(original).length !== 2) {
    throw new Error(`Review the native Animated compatibility patch for React Native ${version}: AnimatedProps.js has changed.`);
  }
  return source.replace(original, fixed);
}

function patchReactNativeAnimated(projectRoot = path.resolve(__dirname, '..')) {
  const packagePath = require.resolve('react-native/package.json', { paths: [projectRoot] });
  const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const filename = path.join(path.dirname(packagePath), 'Libraries/Animated/nodes/AnimatedProps.js');
  const source = fs.readFileSync(filename, 'utf8');
  const patched = patchAnimatedPropsSource(source, version);
  if (patched === source) return false;
  fs.writeFileSync(filename, patched, 'utf8');
  return true;
}

module.exports = { patchAnimatedPropsSource, patchReactNativeAnimated };
if (require.main === module && patchReactNativeAnimated()) {
  console.info('Applied the React Native 0.88.1 native Animated view attachment fix.');
}
