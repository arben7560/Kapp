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

      // The responsive audit changes the emulator's display density at runtime.
      // Keep the existing React root while React Native handles the new metrics.
      const configChanges = mainActivity.$["android:configChanges"] ?? "";
      if (!configChanges.split("|").includes("density")) {
        mainActivity.$["android:configChanges"] = [configChanges, "density"]
          .filter(Boolean)
          .join("|");
      }
    }

    return androidConfig;
  });
};
