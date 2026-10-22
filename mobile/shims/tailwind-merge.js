// Lightweight stub for tailwind-merge in unistyles-based environment.
// Cajero POS uses react-native-unistyles; tailwind-merge is only pulled in by react-native-ui-datepicker.
// Eliminates 103.1 KB of unused CSS class conflict-resolution logic.
module.exports = {
  twMerge: (...args) => args.filter(Boolean).join(" "),
  extendTailwindMerge:
    () =>
    (...args) =>
      args.filter(Boolean).join(" "),
};
