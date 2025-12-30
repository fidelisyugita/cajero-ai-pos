import { t } from "@/services/i18n";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useReferenceStore } from "@/store/useReferenceStore";

interface PaymentMethodsProps {
	selectedMethod: string;
	onSelect: (method: string) => void;
}

const PaymentMethods = ({ selectedMethod, onSelect }: PaymentMethodsProps) => {
	const methods = useReferenceStore((state) => state.paymentMethods);

	return (
		<View style={$.container}>
			<Text style={$.title}>{t("select_payment_method")}</Text>
			<View style={$.list}>
				{methods.map((method) => {
					const isSelected = selectedMethod === method.code;
					return (
						<TouchableOpacity
							key={method.code}
							style={[$.methodCard, isSelected && $.selectedCard]}
							onPress={() => onSelect(method.code)}
							activeOpacity={0.8}
						>
							<Text style={[$.methodLabel, isSelected && $.selectedLabel]}>
								{method.name}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1, // Take left side space
		padding: theme.spacing.xl,
		gap: theme.spacing.lg,
		backgroundColor: theme.colors.neutral[100],
		borderRadius: theme.radius.lg,
		// shadow
		shadowColor: "#000",
		shadowOffset: { height: 0, width: 0 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	title: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	list: {
		gap: theme.spacing.md,
	},
	methodCard: {
		padding: theme.spacing.lg,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.neutral[300],
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.neutral[100],
	},
	selectedCard: {
		backgroundColor: theme.colors.primary[100],
		borderColor: theme.colors.primary[500],
	},
	methodLabel: {
		...theme.typography.heading5,
		color: theme.colors.neutral[600],
	},
	selectedLabel: {
		color: theme.colors.primary[600],
	},
}));

export default PaymentMethods;
