import { memo, useEffect, useMemo } from "react";
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Share one native-driver pulse across all mounted skeletons to avoid per-cell animation overhead.
const sharedPulse = new Animated.Value(0.3);
let activeSkeletonCount = 0;
let pulseLoop: Animated.CompositeAnimation | null = null;
let startFrameId: number | null = null;

function retainPulse() {
  activeSkeletonCount += 1;
  if (activeSkeletonCount === 1 && startFrameId === null && !pulseLoop) {
    sharedPulse.setValue(0.3);
    // Defer loop start past initial mount commit to avoid synchronous native prop updates per cell.
    startFrameId = requestAnimationFrame(() => {
      startFrameId = null;
      if (activeSkeletonCount === 0) return;
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(sharedPulse, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sharedPulse, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
    });
  }
}

function releasePulse() {
  activeSkeletonCount = Math.max(0, activeSkeletonCount - 1);
  if (activeSkeletonCount === 0) {
    if (startFrameId !== null) {
      cancelAnimationFrame(startFrameId);
      startFrameId = null;
    }
    if (pulseLoop) {
      pulseLoop.stop();
      pulseLoop = null;
    }
  }
}

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  testID,
}: SkeletonProps) => {
  useEffect(() => {
    retainPulse();
    return () => {
      releasePulse();
    };
  }, []);

  const baseStyle = useMemo(
    () => ({ width, height, borderRadius, opacity: sharedPulse }),
    [width, height, borderRadius],
  );

  return <Animated.View style={[$.skeleton, baseStyle, style]} testID={testID} />;
};

const $ = StyleSheet.create((theme) => ({
  skeleton: {
    backgroundColor: theme.colors.neutral[300],
  },
}));

export default memo(Skeleton);
