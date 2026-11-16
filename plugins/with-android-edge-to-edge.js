const { withAndroidStyles } = require("@expo/config-plugins");

// Expo's default system-bars mod writes transparent bar colors into AppTheme.
// Android 15+ ignores these legacy theme colors for edge-to-edge windows.
// React Native already enables edge-to-edge; let it select the appropriate
// appearance on older Android versions without declaring obsolete attributes.
module.exports = function withAndroidEdgeToEdge(config) {
  return withAndroidStyles(config, (androidConfig) => {
    const appTheme = androidConfig.modResults.resources.style?.find(
      (style) => style.$?.name === "AppTheme",
    );
    if (appTheme?.item) {
      appTheme.item = appTheme.item.filter(
        (item) =>
          item.$?.name !== "android:statusBarColor" &&
          item.$?.name !== "android:navigationBarColor",
      );
    }
    return androidConfig;
  });
};
