import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { vs } from "@/utils/Scale";
import { formatCurrency } from "@/utils/Format";
import Button from "@/components/ui/Button";
import IcBackspace from "@/assets/icons/backspace.svg";
import colors from "@/tokens/Colors";

interface CashPaymentProps {
	totalAmount: number;
	paidAmount: number;
	onChangePaidAmount: (amount: number) => void;
	onPay: () => void;
	isProcessing?: boolean;
}

const quickAmounts = (total: number) => {
	// Logic to suggest amounts: Exact, Next 50k, Next 100k, etc.
	// For simple logic: Exact, + some fixed values or just commonly used notes
	// Let's implement static logic for now similar to design
	// Ideally this should be dynamic based on total
	// E.g. Total 124.650 -> Exact, 125.000, 150.000, 200.000
    
    // Simple rounding up next 5k, 10k, 50k, 100k
    const next5k = Math.ceil(total / 5000) * 5000;
    const next10k = Math.ceil(total / 10000) * 10000;
    const next50k = Math.ceil(total / 50000) * 50000;
    const next100k = Math.ceil(total / 100000) * 100000;

    const amounts = [total];
    if (next5k > total) amounts.push(next5k);
    if (next10k > total && !amounts.includes(next10k)) amounts.push(next10k);
    if (next50k > total && !amounts.includes(next50k)) amounts.push(next50k);
    if (next100k > total && !amounts.includes(next100k)) amounts.push(next100k);
    
    // Ensure 4 items max
    return amounts.slice(0, 4);
};

const CashPayment = ({
	totalAmount,
	paidAmount,
	onChangePaidAmount,
	onPay,
	isProcessing
}: CashPaymentProps) => {
	const change = Math.max(0, paidAmount - totalAmount);
    const suggestions = quickAmounts(totalAmount);

	const handleNumPad = (value: string | number) => {
		if (value === "C") {
			onChangePaidAmount(0);
		} else if (value === "X") {
			const str = paidAmount.toString();
			if (str.length > 1) {
				onChangePaidAmount(Number(str.slice(0, -1)));
			} else {
				onChangePaidAmount(0);
			}
		} else {
            // Append number
            const currentStr = paidAmount === 0 ? "" : paidAmount.toString();
			const newStr = currentStr + value.toString();
            // Prevent insane numbers
            if (newStr.length < 12) {
			    onChangePaidAmount(Number(newStr));
            }
		}
	};

	return (
		<View style={$.container}>
			<View style={$.header}>
				<Text style={$.chargeLabel}>Charge {formatCurrency(totalAmount)}</Text>
			</View>
            
            <View style={$.quickAmounts}>
                {suggestions.map((amt, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={$.quickButton}
                        onPress={() => onChangePaidAmount(amt)}
                    >
                        <Text style={$.quickButtonText}>{index === 0 ? "Exact" : formatCurrency(amt)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={$.paymentInfoRow}>
                <View style={$.amountBlock}>
                    <Text style={$.amountLabel}>Paid</Text>
                    <Text style={$.amountValue}>{formatCurrency(paidAmount)}</Text>
                </View>

                {change > 0 && (
                    <View style={[$.amountBlock, { alignItems: 'flex-end' }]}>
                        <Text style={$.changeLabel}>Change</Text>
                        <Text style={$.changeValue}>{formatCurrency(change)}</Text>
                    </View>
                )}
            </View>

			<View style={$.numpad}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "X"].map((key) => (
					<TouchableOpacity
						key={key}
						style={$.key}
						onPress={() => handleNumPad(key)}
                        activeOpacity={0.7}
					>
                        {key === "X" ? (
                            <IcBackspace width={vs(32)} height={vs(32)} color={colors.error[500]} /> 
                        ) : (
						    <Text style={[$.keyText, key === "C" ? $.clearKeyText : {}]}>{key}</Text>
                        )}
					</TouchableOpacity>
				))}
			</View>

			<Button
				title="Pay"
				size="lg"
				variant="primary"
				onPress={onPay}
                isLoading={isProcessing}
				disabled={paidAmount < totalAmount}
			/>
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		flex: 1.5, // Takes more space on right
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
	header: {
		backgroundColor: theme.colors.primary[100],
		padding: theme.spacing.lg,
		borderRadius: theme.radius.md,
		alignItems: "center",
	},
	chargeLabel: {
		...theme.typography.heading3,
		color: theme.colors.neutral[700], // Assuming dark text
	},
    quickAmounts: {
        flexDirection: "row",
        gap: theme.spacing.md,
    },
    quickButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        alignItems: "center",
    },
    quickButtonText: {
        ...theme.typography.bodySm,
        color: theme.colors.neutral[700],
    },
    paymentInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: vs(50), // Reserve space to avoid jumping
    },
    amountBlock: {
        flex: 1,
        gap: 2,
    },
    amountLabel: {
        ...theme.typography.bodySm,
        color: theme.colors.neutral[500],
    },
    amountValue: {
        ...theme.typography.heading3,
        color: theme.colors.neutral[700],
    },
    changeLabel: {
        ...theme.typography.bodySm,
        color: theme.colors.success[600],
    },
    changeValue: {
        ...theme.typography.heading3,
        color: theme.colors.success[600],
    },
	numpad: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.md,
        justifyContent: "center",
	},
	key: {
		width: "30%",
		height: vs(80),
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.neutral[100],
        borderWidth: 1,
        borderColor: theme.colors.neutral[100],
		borderRadius: theme.radius.md,
	},
	keyText: {
		...theme.typography.heading3,
		color: theme.colors.neutral[700],
	},
    clearKeyText: {
        color: theme.colors.sup.yellow, // Or warning color
    }
}));

export default CashPayment;
