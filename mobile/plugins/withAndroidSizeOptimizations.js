const { withAppBuildGradle, withGradleProperties } = require("@expo/config-plugins");

const withAndroidSizeOptimizations = (config) => {
  // 1. Configure Gradle properties for resource shrinking and Fresco gif disable
  config = withGradleProperties(config, (config) => {
    const propsToSet = [
      { type: "property", key: "android.enableMinifyInReleaseBuilds", value: "true" },
      { type: "property", key: "android.enableShrinkResourcesInReleaseBuilds", value: "true" },
      { type: "property", key: "android.enableR8.fullMode", value: "true" },
      { type: "property", key: "expo.gif.enabled", value: "false" },
    ];

    for (const prop of propsToSet) {
      const existingIndex = config.modResults.findIndex(
        (item) => item.type === "property" && item.key === prop.key,
      );
      if (existingIndex >= 0) {
        config.modResults[existingIndex].value = prop.value;
      } else {
        config.modResults.push(prop);
      }
    }
    return config;
  });

  // 2. Configure app/build.gradle for ABI splits and font exclusions
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = applySizeOptimizations(config.modResults.contents);
    }
    return config;
  });

  return config;
};

function applySizeOptimizations(buildGradle) {
  let updated = buildGradle;

  // Add splits block if not present (only enabled for APK builds; App Bundles handle ABI splits natively)
  const splitsSnippet = `
    def isBundleTask = gradle.startParameter.taskNames.any { it.toLowerCase().contains("bundle") }
    splits {
        abi {
            reset()
            enable !isBundleTask
            universalApk true
            include "armeabi-v7a", "arm64-v8a"
        }
    }`;

  if (!updated.includes("splits {") && updated.includes("buildTypes {")) {
    updated = updated.replace("buildTypes {", `${splitsSnippet}\n    buildTypes {`);
  }

  // Switch to proguard-android-optimize.txt for aggressive R8 bytecode optimization and inlining
  if (updated.includes('getDefaultProguardFile("proguard-android.txt")')) {
    updated = updated.replace(
      'getDefaultProguardFile("proguard-android.txt")',
      'getDefaultProguardFile("proguard-android-optimize.txt")',
    );
  }

  // Add font exclusions to ignoreAssetsPattern
  const unusedFontsPattern =
    ":!Fontisto.ttf:!Octicons.ttf:!FontAwesome*.ttf:!MaterialCommunityIcons.ttf:!AntDesign.ttf:!Foundation.ttf:!Zocial.ttf:!EvilIcons.ttf:!SimpleLineIcons.ttf";

  if (
    !updated.includes("MaterialCommunityIcons.ttf") &&
    updated.includes("ignoreAssetsPattern '")
  ) {
    updated = updated.replace(
      /ignoreAssetsPattern '([^']+)'/,
      `ignoreAssetsPattern '$1${unusedFontsPattern}'`,
    );
  }

  // Add distinct versionCode per ABI split
  const variantVersionCodeSnippet = `
// Assign distinct versionCode per ABI split (64-bit takes precedence over 32-bit)
android.applicationVariants.all { variant ->
    variant.outputs.each { output ->
        def versionCodes = ["armeabi-v7a": 1, "arm64-v8a": 2]
        def abi = output.getFilter(com.android.build.OutputFile.ABI)
        if (abi != null) {
            output.versionCodeOverride =
                android.defaultConfig.versionCode * 1000 + (versionCodes.get(abi) ?: 0)
        }
    }
}
`;

  if (!updated.includes("android.applicationVariants.all")) {
    updated = `${updated}\n${variantVersionCodeSnippet}`;
  }

  return updated;
}

module.exports = withAndroidSizeOptimizations;
