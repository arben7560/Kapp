const { getDefaultConfig } = require('expo/metro-config');
const { patchReactNativeAnimated } = require('./scripts/patch-react-native-animated.cjs');

// Also covers an existing checkout updated with git pull (without npm install).
// Apply before Metro indexes/transforms RN, keeping Expo's default configuration.
patchReactNativeAnimated(__dirname);
module.exports = getDefaultConfig(__dirname);
