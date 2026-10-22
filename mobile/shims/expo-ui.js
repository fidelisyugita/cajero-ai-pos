// No-op stub for @expo/ui/jetpack-compose.
// Expo Router's StackToolbarButton references this, but Stack.Toolbar is not used in Cajero POS.
// Eliminates 238.7 KB of unused Jetpack Compose definitions from the JS bundle.
module.exports = {
  IconButton: () => null,
  Icon: () => null,
};
