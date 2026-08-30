const { withAppBuildGradle } = require("@expo/config-plugins");

const withAndroidSigning = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    } else {
      throw new Error("Cannot add signing config to build.gradle because it is not groovy");
    }
    return config;
  });
};

function addSigningConfig(buildGradle) {
  let updated = buildGradle;

  const signingResolutionSnippet = `
// Android Release Signing Resolution
def rawStoreFile = System.getenv("ANDROID_UPLOAD_STORE_FILE") ?: localEnvMap.get("ANDROID_UPLOAD_STORE_FILE") ?: (file("upload.keystore").exists() ? "upload.keystore" : (file("\${projectRoot}/credentials/upload.keystore").exists() ? "credentials/upload.keystore" : null))
def resolvedStorePassword = System.getenv("ANDROID_UPLOAD_STORE_PASSWORD") ?: localEnvMap.get("ANDROID_UPLOAD_STORE_PASSWORD") ?: "123456"
def resolvedKeyAlias = System.getenv("ANDROID_UPLOAD_KEY_ALIAS") ?: localEnvMap.get("ANDROID_UPLOAD_KEY_ALIAS") ?: "upload"
def resolvedKeyPassword = System.getenv("ANDROID_UPLOAD_KEY_PASSWORD") ?: localEnvMap.get("ANDROID_UPLOAD_KEY_PASSWORD") ?: "123456"

def resolvedStoreFile = null
if (rawStoreFile) {
    def directFile = file(rawStoreFile)
    if (directFile.exists()) {
        resolvedStoreFile = directFile
    } else if (file("\${projectRoot}/\${rawStoreFile}").exists()) {
        resolvedStoreFile = file("\${projectRoot}/\${rawStoreFile}")
    } else if (file("\${rootDir}/\${rawStoreFile}").exists()) {
        resolvedStoreFile = file("\${rootDir}/\${rawStoreFile}")
    } else if (file("\${rootDir}/app/\${rawStoreFile}").exists()) {
        resolvedStoreFile = file("\${rootDir}/app/\${rawStoreFile}")
    }
}

if (resolvedStoreFile != null && resolvedStoreFile.exists()) {
    project.logger.lifecycle("🔑 Release signing keystore detected: \${resolvedStoreFile.absolutePath} (alias: \${resolvedKeyAlias})")
} else {
    project.logger.lifecycle("⚠️  No release signing keystore found. Release build will use debug keystore.")
}
`;

  // 1. Inject signing resolution before android { block if not already present
  if (!updated.includes("def rawStoreFile =") && updated.includes("android {")) {
    updated = updated.replace("android {", `${signingResolutionSnippet}\nandroid {`);
  }

  // 2. Inject release signingConfig into signingConfigs { if not present
  if (updated.includes("signingConfigs {") && !updated.includes("storeFile resolvedStoreFile")) {
    const releaseConfig = `
        if (resolvedStoreFile != null && resolvedStoreFile.exists()) {
            release {
                storeFile resolvedStoreFile
                storePassword resolvedStorePassword
                keyAlias resolvedKeyAlias
                keyPassword resolvedKeyPassword
            }
        }`;
    updated = updated.replace("signingConfigs {", `signingConfigs {${releaseConfig}`);
  }

  // 3. Ensure release buildType points to signingConfigs.release
  const releaseBlockRegex =
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug([\s\S]*?\})/;
  if (releaseBlockRegex.test(updated)) {
    const releaseSigningConfig = `if (resolvedStoreFile != null && resolvedStoreFile.exists()) {
                signingConfig signingConfigs.release
            } else {
                signingConfig signingConfigs.debug
            }`;
    updated = updated.replace(releaseBlockRegex, `$1${releaseSigningConfig}$2`);
  }

  return updated;
}

module.exports = withAndroidSigning;
