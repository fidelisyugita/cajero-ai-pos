import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";
import { formatCurrency } from "@/utils/Format";
import Button from "@/components/ui/Button";
import IcCheckCircle from "@/assets/icons/check-circle.svg"; // Need to ensure icon exists or fallback
import { useOrderStore } from "@/store/useOrderStore";
import dayjs from "dayjs";

interface SuccessViewProps {
    transactionNumber: string;
    totalAmount: number;
    paidAmount: number;
    change: number;
    onNewTransaction: () => void;
    onPrintReceipt: () => void;
}

const SuccessView = ({
    transactionNumber,
    totalAmount,
    paidAmount,
    change,
    onNewTransaction,
    onPrintReceipt
}: SuccessViewProps) => {

    return (
        <View style={$.container}>
            <View style={$.content}>
                {/* Icon Placeholder - Creating simple circle check if icon missing or use Text */}
                <View style={$.iconContainer}>
                     <Text style={{fontSize: 60}}>✅</Text>
                </View>

                <Text style={$.title}>Payment Success!</Text>
                <Text style={$.subtitle}>Transaction No. {transactionNumber}</Text>
                <Text style={$.date}>{dayjs().format("ddd, D MMM YYYY - HH:mm")}</Text>

                <View style={$.divider} />

                <View style={$.summary}>
                    <View style={$.row}>
                        <Text style={$.label}>Total Price</Text>
                        <Text style={$.totalPrice}>{formatCurrency(totalAmount)}</Text>
                    </View>
                    <View style={$.row}>
                        <Text style={$.label}>Cash</Text>
                        <Text style={$.value}>{formatCurrency(paidAmount)}</Text>
                    </View>
                    <View style={$.row}>
                        <Text style={$.label}>Change</Text>
                        <Text style={$.value}>{formatCurrency(change)}</Text>
                    </View>
                </View>
            </View>

            <View style={$.footer}>
                <Button 
                    variant="neutral" 
                    title="New Order" 
                    onPress={onNewTransaction}
                    style={{flex: 1}}
                    size="lg"
                />
                <Button 
                    variant="primary" 
                    title="Print Receipt" 
                    onPress={onPrintReceipt}
                     style={{flex: 1}}
                     size="lg"
                />
            </View>
        </View>
    );
}

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        maxWidth: vs(500),
        alignSelf: "center",
        width: "100%",
        padding: theme.spacing.xl,
    },
    content: {
        alignItems: "center",
        width: "100%",
        gap: theme.spacing.md,
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.heading2,
        color: theme.colors.neutral[700],
    },
    subtitle: {
        ...theme.typography.bodyLg,
        color: theme.colors.neutral[600],
    },
    date: {
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[500],
        marginBottom: theme.spacing.lg,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.neutral[300],
        width: "100%",
        borderStyle: "dashed", // React Native plain View doesn't support dashed border easily without library, plain line for now
    },
    summary: {
        width: "100%",
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        ...theme.typography.bodyLg,
        color: theme.colors.neutral[600],
    },
    value: {
        ...theme.typography.heading5,
        color: theme.colors.neutral[700],
    },
    totalPrice: {
        ...theme.typography.heading3,
        color: theme.colors.primary[500], // Or reddish
    },
    footer: {
        flexDirection: "row",
        gap: theme.spacing.md,
        marginTop: vs(60),
        width: "100%",
    }
}));

export default SuccessView;
