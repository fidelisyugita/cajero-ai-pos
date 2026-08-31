import { forwardRef, memo, useEffect, useState } from "react";
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StyleSheet, type Theme, withUnistyles } from "react-native-unistyles";
import { parseNumber } from "@/utils/Format";
import { vs } from "@/utils/Scale";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  size?: "sm" | "md" | "lg";
  maxValue?: number;
  minValue?: number;
}

const getInputSizes = (theme: Theme) => ({
  lg: {
    ...theme.typography.bodyXl,
    lineHeight: undefined,
    paddingVertical: vs(16),
    paddingHorizontal: vs(24),
  },
  md: {
    ...theme.typography.bodyLg,
    lineHeight: undefined,
    paddingVertical: vs(14),
    paddingHorizontal: vs(24),
  },
  sm: {
    ...theme.typography.bodyMd,
    lineHeight: undefined,
    paddingVertical: vs(12),
    paddingHorizontal: vs(16),
  },
});

const stylesheet = StyleSheet.create((theme) => ({
  container: {},
  outline: {
    borderWidth: vs(1),
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral[100],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    variants: {
      right: { true: { paddingRight: vs(10) } },
      left: { true: { paddingLeft: vs(10) } },
      isValueExisting: { true: { borderColor: theme.colors.neutral[400] } },
      error: {
        true: {
          borderColor: theme.colors.error[300],
          backgroundColor: theme.colors.error[100],
        },
      },
      disabled: {
        true: {
          backgroundColor: theme.colors.neutral[100],
          borderColor: theme.colors.neutral[300],
        },
      },
    },
    compoundVariants: [
      { left: true, size: "lg", styles: { paddingLeft: vs(12) } },
      { right: true, size: "lg", styles: { paddingRight: vs(12) } },
      { left: true, size: "sm", styles: { paddingLeft: vs(8) } },
      { right: true, size: "sm", styles: { paddingRight: vs(8) } },
    ],
  },
  input: {
    flex: 1,
    color: theme.colors.primary[700],
    variants: {
      size: getInputSizes(theme),
      left: { true: { paddingLeft: vs(0) } },
      right: { true: { paddingRight: vs(0) } },
      error: { true: { color: theme.colors.error[400] } },
      disabled: { true: { color: theme.colors.neutral[400] } },
    },
  },
  labelContainer: {
    position: "absolute",
    top: -vs(9),
    left: vs(16),
    paddingHorizontal: vs(6),
    zIndex: 4,
    backgroundColor: "transparent",
  },
  labelBackgroundBottom: {
    position: "absolute",
    top: "35%",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.neutral[100],
    variants: {
      error: { true: { backgroundColor: theme.colors.error[100] } },
      disabled: {
        true: { backgroundColor: theme.colors.neutral[100] },
      },
    },
  },
  // Label styles separate from animation to avoid complex dynamic Unistyle functions if prone to errors
  labelBase: {
    ...theme.typography.bodySm,
    color: theme.colors.neutral[600],
    variants: {
      error: { true: { color: theme.colors.error[500] } },
    },
  },
  errorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.error[400],
    marginTop: theme.spacing.sm,
  },
}));

interface AnimatedLabelProps {
  label: string;
  isValueExisting: boolean;
  styles: typeof stylesheet;
}

// Separated Label component to handle Reanimated style properly
const AnimatedLabel = ({ label, isValueExisting, styles }: AnimatedLabelProps) => {
  // Calculate value outside of worklet to avoid crash (vs is not a worklet)
  const translateYOffset = vs(4);

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(isValueExisting ? 0 : translateYOffset, {
            duration: 200,
          }),
        },
      ],
      opacity: withTiming(isValueExisting ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.labelContainer, animStyle]}>
      <View style={styles.labelBackgroundBottom} />
      <Animated.Text style={styles.labelBase}>{label}</Animated.Text>
    </Animated.View>
  );
};

const UniTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.neutral[500],
}));

function useInputTextState(value?: string, defaultValue?: string) {
  const [hasText, setHasText] = useState<boolean>(Boolean(value ?? defaultValue));

  useEffect(() => {
    if (value !== undefined) {
      setHasText(Boolean(value));
    } else if (defaultValue !== undefined) {
      setHasText(Boolean(defaultValue));
    }
  }, [value, defaultValue]);

  const isControlled = value !== undefined;
  const hasContent = isControlled ? Boolean(value) : hasText;

  return { hasContent, setHasText };
}

function getEffectivePlaceholder(
  placeholder?: string,
  label?: string,
  isFloating?: boolean,
): string {
  if (isFloating) {
    return placeholder || "";
  }
  return placeholder || label || "";
}

function isWithinMaxValue(text: string, maxValue?: number): boolean {
  if (maxValue === undefined) {
    return true;
  }
  return parseNumber(text) <= maxValue;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      containerStyle,
      defaultValue,
      editable = true,
      error,
      size = "md",
      left,
      right,
      label,
      placeholder,
      onChangeText,
      value,
      maxValue,
      minValue,
      style,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const { hasContent, setHasText } = useInputTextState(value, defaultValue);

    const isFloating = Boolean(label) && hasContent;
    const isValueExisting = hasContent || isFocused;
    const activePlaceholder = getEffectivePlaceholder(placeholder, label, isFloating);

    stylesheet.useVariants({
      size,
      left: !!left,
      right: !!right,
      isValueExisting,
      error: !!error,
      disabled: !editable,
    });

    const handleTextChange = (text: string) => {
      if (!isWithinMaxValue(text, maxValue)) {
        return;
      }
      onChangeText?.(text);
      setHasText(Boolean(text));
    };

    const handleBlur = (e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
      setIsFocused(false);
      rest.onBlur?.(e);
    };

    const handleFocus = (e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
      setIsFocused(true);
      rest.onFocus?.(e);
    };

    return (
      <View style={[stylesheet.container, containerStyle]}>
        <View style={stylesheet.outline}>
          {!!label && (
            <AnimatedLabel label={label} isValueExisting={isFloating} styles={stylesheet} />
          )}

          {left}

          <UniTextInput
            ref={ref}
            defaultValue={defaultValue}
            disableFullscreenUI={true}
            editable={editable}
            onBlur={handleBlur}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            placeholder={activePlaceholder}
            value={value}
            style={[
              stylesheet.input,
              rest.multiline && { textAlignVertical: "top", paddingTop: vs(24) },
              style,
            ]}
            {...rest}
          />

          {right}
        </View>
        {!!error && <Text style={stylesheet.errorText}>{error}</Text>}
      </View>
    );
  },
);

export default memo(Input);
