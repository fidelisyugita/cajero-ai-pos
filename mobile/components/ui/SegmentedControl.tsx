
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface SegmentedControlProps<T> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string | number>({ options, value, onChange }: SegmentedControlProps<T>) => {
  return (
    <View style={$.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            style={[$.option, isActive && $.activeOption]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[$.label, isActive && $.activeLabel]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    backgroundColor: 'white',
    padding: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  activeOption: {
    backgroundColor: theme.colors.primary[100],
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.neutral[500],
  },
  activeLabel: {
    color: theme.colors.primary[500],
  },
}));

export default SegmentedControl;
