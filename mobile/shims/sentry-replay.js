// No-op shim for @sentry-internal/replay in native Android environment.
// Web DOM/Canvas recording is not supported or used in React Native Android.
const noop = () => null;
const integrationStub =
  (name = "Replay") =>
  () => ({ name, setupOnce: () => {} });

const handler = new Proxy(
  {
    getReplay: noop,
    replayIntegration: integrationStub("Replay"),
    replayCanvasIntegration: integrationStub("ReplayCanvas"),
  },
  {
    get: (target, prop) => {
      if (prop === "__esModule") return true;
      if (prop === "default") return handler;
      if (prop in target) return target[prop];
      return noop;
    },
  },
);

module.exports = handler;
