const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withRevenueCatAndroid(config) {
  return withAndroidManifest(config, (androidConfig) => {
    const nativeIapEnabled =
      process.env.EXPO_PUBLIC_ENABLE_NATIVE_IAP !== "0";
    const application = androidConfig.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$?.["android:name"] === ".MainActivity",
    );

    if (mainActivity?.$) {
      // Expo CLI requires singleTask to discover and launch Development Client
      // schemes. RevenueCat recommends singleTop when native purchases are on.
      mainActivity.$["android:launchMode"] = nativeIapEnabled
        ? "singleTop"
        : "singleTask";
    }

    return androidConfig;
  });
};
