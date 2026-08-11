const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withRevenueCatAndroid(config) {
  return withAndroidManifest(config, (androidConfig) => {
    const application = androidConfig.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$?.["android:name"] === ".MainActivity",
    );

    if (mainActivity?.$) {
      // RevenueCat requires standard or singleTop so Store verification apps
      // can background K-App without cancelling the purchase flow.
      mainActivity.$["android:launchMode"] = "singleTop";
    }

    return androidConfig;
  });
};
