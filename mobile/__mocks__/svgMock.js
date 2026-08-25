const React = require("react");

function SvgMock(props) {
  const RN = require("react-native");
  const TargetView = RN.View || "View";
  return React.createElement(TargetView, { ...props, testID: props.testID || "svg-mock" });
}

module.exports = SvgMock;
module.exports.default = SvgMock;
module.exports.__esModule = true;
