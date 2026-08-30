const { withAppBuildGradle } = require("@expo/config-plugins");

const withSentryConfig = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addSentryFallbackConfig(config.modResults.contents);
    }
    return config;
  });
};

function addSentryFallbackConfig(buildGradle) {
  if (buildGradle.includes("resolvedSentryAuthToken")) {
    return buildGradle;
  }

  const sentryMarker =
    'apply from: new File(["node", "--print", "require(\'path\').dirname(require.resolve(\'@sentry/react-native/package.json\'))"].execute().text.trim(), "sentry.gradle")';

  const fallbackSnippet = `
// Sentry auto-upload configuration & graceful local fallback
def dotEnvFile = rootProject.file("../.env")
def localEnvMap = [:]
if (dotEnvFile.exists()) {
    dotEnvFile.eachLine { line ->
        def trimmed = line.trim()
        if (trimmed && !trimmed.startsWith("#") && trimmed.contains("=")) {
            def parts = trimmed.split("=", 2)
            localEnvMap[parts[0].trim()] = parts[1].trim()
        }
    }
}

def resolvedSentryAuthToken = System.getenv("SENTRY_AUTH_TOKEN") ?: localEnvMap.get("SENTRY_AUTH_TOKEN")
def resolvedSentryOrg = System.getenv("SENTRY_ORG") ?: localEnvMap.get("SENTRY_ORG")
def resolvedSentryProject = System.getenv("SENTRY_PROJECT") ?: localEnvMap.get("SENTRY_PROJECT")
def sentryPropsFile = rootProject.file("sentry.properties")
def hasSentryPropertiesToken = sentryPropsFile.exists() && sentryPropsFile.text.contains("auth.token=")
def homeSentryCliRc = file("\${System.getProperty('user.home')}/.sentryclirc")
def hasHomeSentryCliRc = homeSentryCliRc.exists() && (homeSentryCliRc.text.contains("token=") || homeSentryCliRc.text.contains("auth.token"))

if (resolvedSentryAuthToken) {
    if (!sentryPropsFile.exists()) {
        sentryPropsFile.parentFile.mkdirs()
        sentryPropsFile.text = "defaults.url=https://sentry.io/\\ndefaults.org=\${resolvedSentryOrg ?: 'cajero-bj'}\\ndefaults.project=\${resolvedSentryProject ?: 'react-native'}\\nauth.token=\${resolvedSentryAuthToken}\\n"
    } else {
        def currentContent = sentryPropsFile.text
        if (!currentContent.contains("auth.token=")) {
            sentryPropsFile.append("\\nauth.token=\${resolvedSentryAuthToken}\\n")
        } else {
            sentryPropsFile.text = currentContent.replaceAll(/auth\\.token=.*(?:\\r?\\n|$)/, "auth.token=\${resolvedSentryAuthToken}\\n")
        }
        if (resolvedSentryOrg) {
            sentryPropsFile.text = sentryPropsFile.text.replaceAll(/defaults\\.org=.*(?:\\r?\\n|$)/, "defaults.org=\${resolvedSentryOrg}\\n")
        }
        if (resolvedSentryProject) {
            sentryPropsFile.text = sentryPropsFile.text.replaceAll(/defaults\\.project=.*(?:\\r?\\n|$)/, "defaults.project=\${resolvedSentryProject}\\n")
        }
    }
}

project.ext.shouldSentryAutoUploadGeneral = { ->
    if (System.getenv('SENTRY_DISABLE_AUTO_UPLOAD') == 'true') {
        return false
    }
    if (!resolvedSentryAuthToken && !hasSentryPropertiesToken && !hasHomeSentryCliRc) {
        project.logger.lifecycle("ℹ️  SENTRY_AUTH_TOKEN not detected in environment or .env — skipping Sentry sourcemap auto-upload for local build.")
        return false
    }
    return true
}
`;

  if (buildGradle.includes(sentryMarker)) {
    return buildGradle.replace(sentryMarker, `${sentryMarker}\n${fallbackSnippet}`);
  }

  return buildGradle;
}

module.exports = withSentryConfig;
