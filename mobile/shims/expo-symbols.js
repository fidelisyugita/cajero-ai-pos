// No-op stub for expo-symbols on Android.
// Apple SF Symbols are not supported or used on Android.
// Eliminates 112.5 KB of unused symbol mappings from the JavaScript bundle.
const noop = () => null;
const sourceStub = () => ({ uri: "" });

const handler = new Proxy(
  {
    SymbolView: noop,
    materialImageSource: sourceStub,
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
