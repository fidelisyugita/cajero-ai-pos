// Lightweight lodash shim providing only the functions used in client packages (e.g. react-native-ui-datepicker)
// Eliminates the 533 KB monolithic lodash.js from the production JavaScript bundle.
const isEqual = require("lodash/isEqual");

module.exports = {
  isEqual,
  default: {
    isEqual,
  },
};
