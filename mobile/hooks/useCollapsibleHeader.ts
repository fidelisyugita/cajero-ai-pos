import { useCallback } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface UseCollapsibleHeaderOptions {
  headerHeight?: number;
  scrollThreshold?: number;
}

type ScrollEventPayload =
  | NativeSyntheticEvent<NativeScrollEvent>
  | {
      contentOffset?: { y?: number };
      nativeEvent?: { contentOffset?: { y?: number } };
    };

function extractScrollY(event: ScrollEventPayload): number {
  if ("nativeEvent" in event && event.nativeEvent?.contentOffset?.y !== undefined) {
    return event.nativeEvent.contentOffset.y;
  }
  if ("contentOffset" in event && event.contentOffset?.y !== undefined) {
    return event.contentOffset.y;
  }
  return 0;
}

export const useCollapsibleHeader = ({
  headerHeight = 80,
  scrollThreshold = 10,
}: UseCollapsibleHeaderOptions = {}) => {
  const translateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const scrollHandler = useCallback(
    (event: ScrollEventPayload) => {
      const currentY = extractScrollY(event);
      const diff = currentY - lastScrollY.value;

      // If at the very top (or pull-to-refresh / overscroll), always show header
      if (currentY <= 0) {
        translateY.value = withTiming(0, { duration: 200 });
      } else if (diff > scrollThreshold && currentY > scrollThreshold) {
        // Scrolling down -> hide header
        translateY.value = withTiming(-headerHeight, { duration: 250 });
      } else if (diff < -scrollThreshold) {
        // Scrolling up -> reveal header
        translateY.value = withTiming(0, { duration: 200 });
      }

      lastScrollY.value = currentY;
    },
    [headerHeight, lastScrollY, scrollThreshold, translateY],
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(translateY.value, [-headerHeight, 0], [0, 1]),
    };
  });

  const reset = useCallback(() => {
    translateY.value = withTiming(0, { duration: 200 });
    lastScrollY.value = 0;
  }, [translateY, lastScrollY]);

  return {
    scrollHandler,
    headerAnimatedStyle,
    reset,
    translateY,
  };
};
