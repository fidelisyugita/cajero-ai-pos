import { View, Alert } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";
import { t } from "@/services/i18n";
import { useState } from "react";
import { useOrderStore, selectSubtotal } from "@/store/useOrderStore";
import { useCreateTransactionMutation } from "@/services/mutations/useCreateTransactionMutation";
import { type TransactionProductRequest } from "@/services/types/Transaction"; // PaymentMethod is now interface but we treat it as string mostly
import PaymentMethods from "@/components/payment/PaymentMethods";
import CashPayment from "@/components/payment/CashPayment";
import Button from "@/components/ui/Button";
import Header from "@/components/dashboard/Header";
import SuccessView from "@/components/payment/SuccessView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useReferenceStore } from "@/store/useReferenceStore";
import { useDraftStore } from "@/store/useDraftStore";
import { printerService } from "@/services/PrinterService";
import { usePrinterStore } from "@/store/PrinterStore";
import { formatCurrency } from "@/utils/Format";
import ReceiptPreviewModal from "@/components/printer/ReceiptPreviewModal";
import Logger from "@/services/logger";

const PaymentScreen = () => {
    const router = useRouter();
    const items = useOrderStore((state) => state.items);
    const customerName = useOrderStore((state) => state.customerName);
    const tableNumber = useOrderStore((state) => state.tableNumber);
    const globalDiscount = useOrderStore((state) => state.discount);
    const clearOrder = useOrderStore((state) => state.clearOrder);
    const { isAutoPrintEnabled, connectedDevice, isConnected: isPrinterConnected } = usePrinterStore();

    const { mutate: createTransaction, isPending } = useCreateTransactionMutation();

    // Reference data
    const transactionTypes = useReferenceStore((s) => s.transactionTypes);
    const paymentMethods = useReferenceStore((s) => s.paymentMethods);
    const addDraft = useDraftStore((state) => state.addDraft);

    // Default to CASH if available, otherwise first one
    const defaultMethod = paymentMethods.find(p => p.code === "CASH")?.code || paymentMethods[0]?.code || "CASH";
    const [selectedMethod, setSelectedMethod] = useState<string>(defaultMethod);
    const [paidAmount, setPaidAmount] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastTransactionNumber, setLastTransactionNumber] = useState("");

    // Preview State
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Calculate totals - Should probably share this logic or use store selectors more robustly
    const subtotal = selectSubtotal(items);
    const totalItemDiscounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + ((item.tax || 0) * item.quantity), 0);
    const totalCommission = items.reduce((sum, item) => sum + ((item.commission || 0) * item.quantity), 0);

    const finalSubtotal = subtotal - totalItemDiscounts;
    const total = finalSubtotal - globalDiscount + totalTax;

    const handlePay = () => {
        const transactionProducts: TransactionProductRequest[] = items.map(item => ({
            productId: item.productId,
            selectedVariants: item.variants, // Assuming backend accepts this structure or needs transformation
            note: item.note,
            quantity: item.quantity,
            buyingPrice: 0, // Should come from product data if needed, or backend handles it
            sellingPrice: item.sellingPrice,
            commission: item.commission || 0,
            discount: item.discount || 0,
            tax: item.tax || 0
        }));

        const note = [
            customerName ? `Name: ${customerName}` : "",
            tableNumber ? `Table: ${tableNumber}` : ""
        ].filter(Boolean).join(", ");

        // Default to first type (DINEIN usually) if not selectable yet
        const typeCode = transactionTypes[0]?.code || "dine-in";

        createTransaction({
            totalPrice: total,
            totalTax: totalTax,
            totalCommission: totalCommission,
            totalDiscount: globalDiscount + totalItemDiscounts,
            description: note,
            statusCode: "COMPLETED", // This should probably also be dynamic or determined by backend/business logic
            transactionTypeCode: typeCode,
            paymentMethodCode: selectedMethod,
            transactionProducts,
            isIn: false,
            // note: could be customer name or table number
            // customerId: ... if registered
        }, {
            onSuccess: (data) => {
                setLastTransactionNumber(data.id || "2023-0001");
                setIsSuccess(true);
                
                // Auto Payment Success Print Logic
                if (isAutoPrintEnabled && isPrinterConnected && connectedDevice) {
                     // We construct receipt data similar to handlePrintReceipt
                     const receiptData = {
                        title: "RECEIPT / STRUK",
                        subtotal: formatCurrency(finalSubtotal),
                        discount: formatCurrency(globalDiscount),
                        tax: formatCurrency(totalTax),
                        total: formatCurrency(total),
                        paymentMethod: selectedMethod,
                        items: transactionProducts.map(p => ({
                            name: items.find(i => i.productId === p.productId)?.name || "Item",
                            quantity: p.quantity,
                            price: formatCurrency(p.sellingPrice * p.quantity)
                        })),
                        footerMessage: "Thank you for your visit!",
                        transactionId: data.id || "2023-0001",
                        transactionDate: new Date() // Use current time or data.createdAt
                    };
                    
                    // Fire and forget print (or handle error quietly/toast)
                    printerService.printReceipt(receiptData).catch(err => {
                        Logger.error("Auto print failed", err);
                        // Optional: Alert user visually or toast
                    });
                }
            },
            onError: (error) => {
                Alert.alert("Payment Failed", "An error occurred while processing the transaction.");
                Logger.error("Payment transaction failed", error);
            }
        });
    };

    const handleNewTransaction = () => {
        clearOrder();
        setIsSuccess(false);
        router.replace("/(dashboard)/menu");
    };

    const handlePrintBill = () => {
        setPreviewData({
            title: "BILL / TAGIHAN",
            subtotal: formatCurrency(finalSubtotal),
            discount: formatCurrency(globalDiscount),
            tax: formatCurrency(totalTax),
            total: formatCurrency(total),
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.sellingPrice * item.quantity // passing raw number or string formatted
            })),
            footerMessage: "Please pay at cashier"
        });
        setShowPreview(true);
    };

    const handleDraftBill = () => {
        // Save as draft
        addDraft({
            items,
            customerName,
            tableNumber,
            discount: globalDiscount
        });

        Alert.alert("Draft Bill", "Bill saved as draft. Ready for next customer.");
        // Clear order for next customer
        handleNewTransaction();
    };

    const handlePrintReceipt = () => {
        setPreviewData({
            title: "RECEIPT / STRUK",
            subtotal: formatCurrency(finalSubtotal),
            discount: formatCurrency(globalDiscount),
            tax: formatCurrency(totalTax),
            total: formatCurrency(total),
            paymentMethod: selectedMethod,
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.sellingPrice * item.quantity
            })),
            footerMessage: "Thank you for your visit!",
            transactionId: lastTransactionNumber,
            transactionDate: new Date()
        });
        setShowPreview(true);
    };

    return (
        <View style={$.container}>
            {isSuccess ? (
                <SuccessView
                    transactionNumber={lastTransactionNumber}
                    totalAmount={total}
                    paidAmount={paidAmount}
                    change={paidAmount - total}
                    onNewTransaction={handleNewTransaction}
                    onPrintReceipt={handlePrintReceipt}
                />
            ) : (
                <>
                    <ScreenHeader title={t("transaction")} />

                    <View style={$.content}>
                        <View style={$.leftColumn}>
                            <PaymentMethods
                                selectedMethod={selectedMethod}
                                onSelect={setSelectedMethod}
                            />

                            {/* Draft / Open Bill feature */}
                            <View style={$.draftSection}>
                                <Button
                                    title={t("print_bill")}
                                    variant="secondary"
                                    onPress={handlePrintBill}
                                    style={{ width: '100%' }}
                                />
                                <Button
                                    title={t("draft_open_bill")}
                                    variant="primary"
                                    onPress={handleDraftBill}
                                    style={{ width: '100%' }}
                                />
                            </View>
                        </View>

                        {/* Right Column: Dynamic based on method */}
                        <CashPayment
                            totalAmount={total}
                            paidAmount={paidAmount}
                            onChangePaidAmount={setPaidAmount}
                            onPay={handlePay}
                            isProcessing={isPending}
                        />
                    </View>
                </>
            )}


            {/* Receipt Preview Modal */}
            <ReceiptPreviewModal
                visible={showPreview}
                onClose={() => setShowPreview(false)}
                onPrint={async () => {
                    setIsPrinting(true);
                    // Decide if printing Bill or Receipt based on context.
                    // For "Print Bill" button, it sets preview data for BILL.
                    // For SuccessView "Print Receipt", it sets data for RECEIPT.
                    // We can store a print action or data in state.

                    if (previewData) {
                        try {
                            await printerService.printReceipt(previewData);
                        } catch (error: any) {
                            Alert.alert(t("print_error"), error.message);
                        }
                    }
                    setIsPrinting(false);
                    setShowPreview(false);
                }}
                data={previewData || { total: "0", items: [] }}
                isPrinting={isPrinting}
            />
        </View >
    );
};

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[200],
    },
    content: {
        flex: 1,
        flexDirection: "row",
        padding: theme.spacing.xl,
        gap: theme.spacing.xl,
    },
    leftColumn: {
        flex: 1,
        gap: theme.spacing.lg,
    },
    draftSection: {
        marginTop: "auto", // Push to bottom of left column
        gap: theme.spacing.md,
    },
}));

export default PaymentScreen;
