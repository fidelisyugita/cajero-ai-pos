import { Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface TabButtonProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
}

const TabButton = ({ title, isActive, onPress }: TabButtonProps) => {
    return (
        <TouchableOpacity 
            style={[$.tabButton, isActive && $.activeTabButton]} 
            onPress={onPress}
        >
            <Text style={[$.tabText, isActive && $.activeTabText]}>{title}</Text>
        </TouchableOpacity>
    );
};

const $ = StyleSheet.create((theme) => ({
    tabButton: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        backgroundColor: theme.colors.neutral[100],
    },
    activeTabButton: {
        backgroundColor: theme.colors.primary[100],
        borderColor: theme.colors.primary[200],
    },
    tabText: {
        ...theme.typography.labelMd,
        color: theme.colors.neutral[600],
    },
    activeTabText: {
        color: theme.colors.primary[500],
        fontWeight: "bold",
    }
}));

export default TabButton;
