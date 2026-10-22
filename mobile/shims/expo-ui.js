// No-op stub for @expo/ui and @expo/ui/jetpack-compose.
// Expo Router's StackToolbar references this, but Stack.Toolbar is not used in Cajero POS.
// Eliminates 238.7 KB of unused Jetpack Compose definitions from the JS bundle.
const noop = () => null;
const modifierStub = () => ({});

const proxyHandler = {
  get: (_target, prop) => {
    if (prop === "__esModule") return true;
    if (prop === "default") return handler;
    return modifierStub;
  },
};

const handler = new Proxy(
  {
    IconButton: noop,
    Icon: noop,
    Box: noop,
    RNHostView: noop,
    fillMaxHeight: modifierStub,
  },
  proxyHandler,
);

module.exports = handler;
