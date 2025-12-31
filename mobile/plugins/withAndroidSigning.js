const { withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidSigning = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    } else {
      throw new Error('Cannot add signing config to build.gradle because it is not groovy');
    }
    return config;
  });
};

function addSigningConfig(buildGradle) {
  const storeFile = process.env.EXPO_PUBLIC_UPLOAD_STORE_FILE;
  const storePassword = process.env.EXPO_PUBLIC_UPLOAD_STORE_PASSWORD;
  const keyAlias = process.env.EXPO_PUBLIC_UPLOAD_KEY_ALIAS;
  const keyPassword = process.env.EXPO_PUBLIC_UPLOAD_KEY_PASSWORD;

  if (!storeFile) {
      console.warn('⚠️  EXPO_PUBLIC_UPLOAD_STORE_FILE is not defined. Release build will use debug keystore.');
      return buildGradle;
  }

  // Inject release config into existing signingConfigs if present
  if (buildGradle.includes('signingConfigs {')) {
    const releaseConfig = `
        release {
            storeFile file("../../${storeFile}")
            storePassword "${storePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
    `;
    
    // Only add if not already present
    // We check for the alias to see if our specific config is there
    if (!buildGradle.includes(`keyAlias "${keyAlias}"`)) {
        buildGradle = buildGradle.replace('signingConfigs {', `signingConfigs {${releaseConfig}`);
    }
  } else {
     // Fallback if no signingConfigs block exists
      const signingConfig = `
        signingConfigs {
            debug {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
            release {
                storeFile file("../../${storeFile}")
                storePassword "${storePassword}"
                keyAlias "${keyAlias}"
                keyPassword "${keyPassword}"
            }
        }
      `;
      const pattern = /buildTypes\s?{/;
      buildGradle = buildGradle.replace(pattern, `${signingConfig}\n    buildTypes {`);
  }

  // Update release buildType to use the new signing config
  // We specifically look for the release block and replace the signingConfig inside it.
  const releaseBlockPattern = /(buildTypes\s?{[\s\S]*?release\s?{[\s\S]*?)signingConfig signingConfigs.debug([\s\S]*?})/;
  
  if (releaseBlockPattern.test(buildGradle)) {
      return buildGradle.replace(releaseBlockPattern, '$1signingConfig signingConfigs.release$2');
  } else {
      // If it mentions release but doesn't have signingConfig debug explicitly (maybe it has none), we might need another strategy.
      // But based on the template, we know it's there.
      // Fallback: try global replace if the specific regex fails, but use replaceAll
      return buildGradle.split('signingConfig signingConfigs.debug').join('signingConfig signingConfigs.release');
  }
}


module.exports = withAndroidSigning;
