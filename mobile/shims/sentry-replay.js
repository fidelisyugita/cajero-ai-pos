// No-op shim for @sentry-internal/replay in native Android environment.
// Web DOM/Canvas recording is not supported or used in React Native Android.
module.exports = {
  getReplay: () => null,
  replayIntegration: () => ({ name: "Replay", setupOnce: () => {} }),
  replayCanvasIntegration: () => ({ name: "ReplayCanvas", setupOnce: () => {} }),
};
