import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { usePrinterStore, PrinterDevice } from "@/store/PrinterStore";
import { printerService } from "@/services/PrinterService";
import { useState, useEffect } from "react";
import { t } from "@/services/i18n";
import { Feather } from "@expo/vector-icons";
import FormSectionCard from "@/components/ui/FormSectionCard";
import EmptyState from "@/components/ui/EmptyState";
import ReceiptPreviewModal from "@/components/printer/ReceiptPreviewModal";

const PrinterSettings = () => {
    const { connectedDevice, isConnected, setConnectedDevice, setIsConnected } = usePrinterStore();
    const [devices, setDevices] = useState<PrinterDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Preview State
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        return () => {
            printerService.stopScan();
        }
    }, []);

    const startScan = async () => {
        setDevices([]);
        setIsScanning(true);
        try {
            await printerService.scanDevices((device) => {
                setDevices((prev) => {
                    if (prev.find(d => d.id === device.id)) return prev;
                    return [...prev, { id: device.id, name: device.name || t("visitor") }]; // using visitor as unknown replacement
                });
            });
        } catch (error: any) {
            Alert.alert(t("failed"), error.message);
            setIsScanning(false);
        }
    };

    const stopScan = () => {
        printerService.stopScan();
        setIsScanning(false);
    };

    const handleConnect = async (device: PrinterDevice) => {
        setIsConnecting(true);
        stopScan();
        try {
            await printerService.connectToDevice(device.id);
            // Alert.alert(t("success"), `Connected to ${device.name}`);
        } catch (error: any) {
            Alert.alert(t("connection_failed"), error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await printerService.disconnect();
            setConnectedDevice(null);
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleTestPrint = async () => {
        setPreviewData({
            title: "TEST PRINT",
            items: [
                { name: "Test Item 1", quantity: 1, price: "10.000" },
                { name: "Test Item 2", quantity: 2, price: "20.000" }
            ],
            subtotal: "30.000",
            total: "30.000",
            footerMessage: "Printer Connection Verified!"
        });
        setShowPreview(true);
    }

    const renderItem = ({ item }: { item: PrinterDevice }) => {
        const isConnectedItem = connectedDevice?.id === item.id;

        return (
            <View style={[$.printerCard, isConnectedItem && $.connectedCard]}>
                <View style={$.printerInfo}>
                    <View style={$.iconContainer}>
                        <Feather name="printer" size={24} color={isConnectedItem ? "#179139" : "#555"} />
                    </View>
                    <View>
                        <Text style={$.printerName}>{item.name}</Text>
                        <Text style={$.printerType}>{item.id}</Text>
                    </View>
                </View>
                {isConnectedItem ? (
                    <Text style={{ color: '#179139', fontWeight: 'bold' }}>{t("connected")}</Text>
                ) : (
                    <Button
                        title={t("connect")}
                        variant="secondary"
                        size="sm"
                        onPress={() => handleConnect(item)}
                        isLoading={isConnecting && connectedDevice === null}
                    />
                )}
            </View>
        );
    };

    // Auto-connect on mount if we have a saved device but not connected
    useEffect(() => {
        if (connectedDevice && !isConnected) {
            handleConnect(connectedDevice);
        }
    }, []);

    return (
        <FormSectionCard
            title={t("printer_setting")}
            style={{ flex: 1 }}
            contentStyle={$.container}
        >
            {/* Saved / Connected Printer Section */}
            {connectedDevice && (
                <View style={$.section}>
                    <Text style={$.sectionTitle}>{isConnected ? t("connected_printer") : t("default_printer")}</Text>
                    <View style={[$.printerCard, isConnected ? $.connectedCard : null]}>
                        <View style={$.printerInfo}>
                            <View style={$.iconContainer}>
                                <Feather name="printer" size={24} color={isConnected ? "#179139" : "#555"} />
                            </View>
                            <View>
                                <Text style={$.printerName}>{connectedDevice.name}</Text>
                                <Text style={$.printerType}>{connectedDevice.id}</Text>
                                {!isConnected && (
                                    <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{t("not_connected") || "Not Connected"}</Text>
                                )}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {isConnected ? (
                                <>
                                    <Button
                                        title={t("test_printer")}
                                        variant="secondary"
                                        size="sm"
                                        onPress={handleTestPrint}
                                    />
                                    <Button
                                        title={t("disconnect")}
                                        variant="secondary"
                                        size="sm"
                                        onPress={handleDisconnect}
                                    />
                                </>
                            ) : (
                                <Button
                                    title={t("connect")}
                                    variant="primary"
                                    size="sm"
                                    isLoading={isConnecting}
                                    onPress={() => handleConnect(connectedDevice)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            )}

            {/* Scan Controls */}
            <View style={$.section}>
                <View style={$.sectionHeader}>
                    <Text style={$.sectionTitle}>{t("available_devices")}</Text>
                    {isScanning ? (
                        <Button
                            title={t("stop_scan")}
                            variant="secondary"
                            size="sm"
                            leftIcon={(size, color) => <ActivityIndicator size="small" color={color} />}
                            onPress={stopScan}
                        />
                    ) : (
                        <Button
                            title={t("scan_devices")}
                            variant="primary" // Revert to primary as it's the main action in this section now
                            size="sm"
                            leftIcon={(size, color) => <Feather name="search" size={size} color={color} />}
                            onPress={startScan}
                        />
                    )}
                </View>

                <FlatList
                    data={devices}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[$.listContainer, devices.length === 0 && { flex: 1, justifyContent: 'center' }]} // Center empty state
                    ListEmptyComponent={
                        isScanning ? (
                            <Text style={$.emptyText}>{t("scanning")}</Text>
                        ) : (
                            <EmptyState
                                title={t("no_devices_found")}
                                subtitle={t("scan_devices")} // Or a more descriptive subtitle if available
                            />
                        )
                    }
                />
            </View>


            {/* Test Print Preview Modal */}
            <ReceiptPreviewModal
                visible={showPreview}
                onClose={() => setShowPreview(false)}
                onPrint={async () => {
                    setIsPrinting(true);
                    try {
                        // We use the simpler testPrint method, or we could pass the full preview data to printReceipt
                        // Using testPrint ensures we test the basic ASCII flow first.
                        await printerService.printReceipt(previewData);
                    } catch (error: any) {
                        Alert.alert(t("print_error"), error.message);
                    } finally {
                        setIsPrinting(false);
                        setShowPreview(false);
                    }
                }}
                data={previewData || { total: "0", items: [] }}
                isPrinting={isPrinting}
            />
        </FormSectionCard >
    );
};

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    pageTitle: {
        ...theme.typography.heading4,
        marginBottom: theme.spacing.xl,
        color: theme.colors.neutral[700],
    },
    section: {
        marginBottom: theme.spacing.xl,
        flex: 1,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.labelLg,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing.sm, // Add margin bottom for spacing from content if header is missing
    },
    listContainer: {
        gap: theme.spacing.md,
    },
    printerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.neutral[100],
        padding: theme.spacing.lg,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    connectedCard: {
        backgroundColor: theme.colors.positive[100],
        borderColor: theme.colors.positive[300],
    },
    printerInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    iconContainer: {
        padding: theme.spacing.xs,
    },
    printerName: {
        ...theme.typography.labelMd,
        color: theme.colors.neutral[700],
    },
    printerType: {
        ...theme.typography.bodySm,
        color: theme.colors.neutral[500],
    },
    emptyText: {
        textAlign: 'center',
        marginTop: theme.spacing.lg,
        ...theme.typography.bodyMd,
        color: theme.colors.neutral[500],
    }
}));

export default PrinterSettings;
