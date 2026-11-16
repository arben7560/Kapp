const { withGradleProperties } = require("@expo/config-plugins");

// EAS regenerates the ignored android/ directory during prebuild. Persist the
// release-only R8 settings in Expo config instead of editing local Gradle files.
module.exports = function withAndroidReleaseOptimization(config) {
  return withGradleProperties(config, (androidConfig) => {
    for (const key of [
      "android.enableMinifyInReleaseBuilds",
      "android.enableShrinkResourcesInReleaseBuilds",
    ]) {
      const property = androidConfig.modResults.find(
        (item) => item.type === "property" && item.key === key,
      );
      if (property) {
        property.value = "true";
      } else {
        androidConfig.modResults.push({ type: "property", key, value: "true" });
      }
    }
    return androidConfig;
  });
};
