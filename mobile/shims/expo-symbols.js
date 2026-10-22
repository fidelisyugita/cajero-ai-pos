// No-op stub for expo-symbols on Android.
// Apple SF Symbols are not supported or used on Android.
// Eliminates 112.5 KB of unused symbol mappings from the JavaScript bundle.
module.exports = {
  SymbolView: () => null,
  materialImageSource: () => ({ uri: "" }),
};
