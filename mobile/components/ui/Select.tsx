import { useState } from "react";
import {
	Modal,
	Text,
	TouchableOpacity,
	View,
	FlatList,
	Pressable,
} from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcChevronDown from "@/assets/icons/chevron-down.svg";
import { vs } from "@/utils/Scale";

interface Option {
	label: string;
	value: string;
}

interface SelectProps {
	options: Option[];
	value?: string;
	onSelect: (value: string) => void;
	placeholder?: string;
	label?: string;
	disabled?: boolean;
	containerStyle?: any;
}

const UniIcChevronDown = withUnistyles(IcChevronDown, (theme) => ({
	color: theme.colors.neutral[500],
	width: vs(20),
	height: vs(20),
}));

const Select = ({
	options,
	value,
	onSelect,
	placeholder = "Select...",
	label,
	disabled,
	containerStyle,
}: SelectProps) => {
	const [visible, setVisible] = useState(false);
	const [layout, setLayout] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
	} | null>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	const toggleModal = () => {
		if (disabled) return;
		setVisible(!visible);
	};

	return (
		<View
			style={[$.container, containerStyle]}
			onLayout={(e) => setLayout(e.nativeEvent.layout)}
		>
			{!!label && <Text style={$.label}>{label}</Text>}
			<TouchableOpacity
				style={[$.selector, disabled && $.disabled]}
				onPress={toggleModal}
				activeOpacity={0.7}
			>
				<Text style={[$.text, !selectedOption && $.placeholder]}>
					{selectedOption ? selectedOption.label : placeholder}
				</Text>
				<UniIcChevronDown />
			</TouchableOpacity>

			<Modal visible={visible} transparent animationType="fade">
				<Pressable style={$.overlay} onPress={() => setVisible(false)}>
					<View style={$.modalContent}>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[
										$.option,
										item.value === value && $.selectedOption,
									]}
									onPress={() => {
										onSelect(item.value);
										setVisible(false);
									}}
								>
									<Text
										style={[
											$.optionText,
											item.value === value && $.selectedOptionText,
										]}
									>
										{item.label}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		gap: theme.spacing.xs,
	},
	label: {
		...theme.typography.labelMd,
		color: theme.colors.neutral[600],
	},
	selector: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
		borderColor: theme.colors.neutral[300],
		borderRadius: theme.radius.sm,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: vs(20),
		backgroundColor: theme.colors.neutral[100],
		gap: theme.spacing.sm,
	},
	disabled: {
		backgroundColor: theme.colors.neutral[200],
		opacity: 0.7,
	},
	text: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[700],
		flex: 1,
	},
	placeholder: {
		color: theme.colors.neutral[500],
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.xl,
	},
	modalContent: {
		backgroundColor: theme.colors.neutral[100],
		borderRadius: theme.radius.md,
		width: "100%", // Or restricted width
		maxHeight: "50%",
		paddingVertical: theme.spacing.sm,
		// Shadow for depth
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	option: {
		paddingVertical: vs(14),
		paddingHorizontal: theme.spacing.lg,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.neutral[200],
	},
	selectedOption: {
		backgroundColor: theme.colors.primary[100],
	},
	optionText: {
		...theme.typography.bodyMd,
		color: theme.colors.neutral[700],
	},
	selectedOptionText: {
		color: theme.colors.primary[600],
		fontFamily: theme.typography.heading5.fontFamily,
	},
}));

export default Select;
