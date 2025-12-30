import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

const Skeleton = ({
    width = "100%",
    height = 20,
    borderRadius = 4,
    style,
}: SkeletonProps) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                $.skeleton,
                { width, height, borderRadius },
                animatedStyle,
                style,
            ]}
        />
    );
};

const $ = StyleSheet.create((theme) => ({
    skeleton: {
        backgroundColor: theme.colors.neutral[300],
    },
}));

export default Skeleton;
