// No-op stub for @sentry-internal/feedback in React Native Android environment.
// Web feedback modal & screenshot widgets are not supported or used in React Native.
const noop = () => null;

const handler = new Proxy(
  {
    getFeedback: noop,
    sendFeedback: () => Promise.resolve(),
    buildFeedbackIntegration: () => () => ({ name: "Feedback", setupOnce: () => {} }),
    feedbackModalIntegration: { name: "FeedbackModal", setupOnce: () => {} },
    feedbackScreenshotIntegration: { name: "FeedbackScreenshot", setupOnce: () => {} },
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
