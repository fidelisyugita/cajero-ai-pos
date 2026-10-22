// No-op stub for @sentry-internal/feedback in React Native Android environment.
// Web feedback modal & screenshot widgets are not supported or used in React Native.
module.exports = {
  getFeedback: () => null,
  sendFeedback: () => Promise.resolve(),
  buildFeedbackIntegration: () => () => ({ name: "Feedback", setupOnce: () => {} }),
  feedbackModalIntegration: { name: "FeedbackModal", setupOnce: () => {} },
  feedbackScreenshotIntegration: { name: "FeedbackScreenshot", setupOnce: () => {} },
};
