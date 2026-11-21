import Feather from "@expo/vector-icons/Feather";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Linking, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ReceiptPreviewModal from "@/components/printer/ReceiptPreviewModal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormSectionCard from "@/components/ui/FormSectionCard";
import Switch from "@/components/ui/Switch";
import { t } from "@/services/i18n";
import Logger from "@/services/logger";
import { printerService } from "@/services/PrinterService";
import type { ReceiptData } from "@/services/types/Receipt";
import { type PrinterDevice, usePrinterStore } from "@/store/PrinterStore";

const TEST_PREVIEW_DATA: ReceiptData = {
  title: "TEST PRINT",
  items: [
    { name: "Test Item 1", quantity: 1, price: "10.000" },
    { name: "Test Item 2", quantity: 2, price: "20.000" },
  ],
  subtotal: "30.000",
  total: "30.000",
  footerMessage: "Printer Connection Verified!",
};

const deviceKeyExtractor = (item: PrinterDevice) => item.id;

const renderScanningIcon = (_size: number, color: string) => (
  <ActivityIndicator size="small" color={color} />
);

const renderSearchIcon = (size: number, color: string) => (
  <Feather name="search" size={size} color={color} />
);

interface PrinterDeviceRowProps {
  item: PrinterDevice;
  isConnectedItem: boolean;
  isConnecting: boolean;
  onConnect: (device: PrinterDevice) => void;
}

const PrinterDeviceRow = memo(
  ({ item, isConnectedItem, isConnecting, onConnect }: PrinterDeviceRowProps) => {
    const handlePress = useCallback(() => {
      onConnect(item);
    }, [item, onConnect]);

    return (
      <View style={isConnectedItem ? $.connectedPrinterCard : $.printerCard}>
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
          <Text style={$.connectedStatusText}>{t("connected")}</Text>
        ) : (
          <Button
            title={t("connect")}
            variant="secondary"
            size="sm"
            onPress={handlePress}
            isLoading={isConnecting}
          />
        )}
      </View>
    );
  },
);

PrinterDeviceRow.displayName = "PrinterDeviceRow";

const PrinterSettings = () => {
  const connectedDevice = usePrinterStore((state) => state.connectedDevice);
  const isConnected = usePrinterStore((state) => state.isConnected);
  const setConnectedDevice = usePrinterStore((state) => state.setConnectedDevice);
  const isAutoPrintEnabled = usePrinterStore((state) => state.isAutoPrintEnabled);
  const setIsAutoPrintEnabled = usePrinterStore((state) => state.setIsAutoPrintEnabled);

  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReceiptData | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    return () => {
      printerService.stopScan();
    };
  }, []);

  const startScan = useCallback(async () => {
    setDevices([]);
    setIsScanning(true);
    try {
      await printerService.scanDevices(
        (device) => {
          setDevices((prev) => {
            if (prev.find((d) => d.id === device.id)) return prev;
            return [...prev, { id: device.id, name: device.name || t("visitor") }];
          });
        },
        (error) => {
          // Handle async scan errors (e.g. bluetooth turned off during scan)
          Logger.error("Scan failed async:", error);
          Alert.alert(t("failed"), error.message);
          setIsScanning(false);
        },
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "Bluetooth permissions not granted") {
        Alert.alert(t("permission_required"), t("bluetooth_permission_msg"), [
          { text: t("cancel"), style: "cancel" },
          { text: t("open_settings"), onPress: () => Linking.openSettings() },
        ]);
      } else if (msg.includes("Bluetooth is not powered on")) {
        Alert.alert(t("bluetooth_off"), t("bluetooth_off_msg"));
      } else {
        Alert.alert(t("failed"), msg);
      }
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    printerService.stopScan();
    setIsScanning(false);
  }, []);

  const handleConnect = useCallback(async (device: PrinterDevice) => {
    setIsConnecting(true);
    printerService.stopScan();
    setIsScanning(false);
    try {
      await printerService.connectToDevice(device.id);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert(t("connection_failed"), msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleConnectSaved = useCallback(() => {
    if (connectedDevice) {
      handleConnect(connectedDevice);
    }
  }, [connectedDevice, handleConnect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await printerService.disconnect();
      setConnectedDevice(null);
    } catch (error: unknown) {
      Logger.error("Failed to disconnect printer", error);
    }
  }, [setConnectedDevice]);

  const handleTestPrint = useCallback(() => {
    setPreviewData(TEST_PREVIEW_DATA);
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handlePrintPreview = useCallback(async () => {
    setIsPrinting(true);
    try {
      // Using testPrint/printReceipt tests the printer connection flow.
      if (previewData) {
        await printerService.printReceipt(previewData);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert(t("print_error"), msg);
    } finally {
      setIsPrinting(false);
      setShowPreview(false);
    }
  }, [previewData]);

  const connectedDeviceId = connectedDevice?.id ?? null;
  const isConnectingUnpaired = isConnecting && connectedDevice === null;

  const renderItem = useCallback(
    ({ item }: { item: PrinterDevice }) => (
      <PrinterDeviceRow
        item={item}
        isConnectedItem={connectedDeviceId === item.id}
        isConnecting={isConnectingUnpaired}
        onConnect={handleConnect}
      />
    ),
    [connectedDeviceId, isConnectingUnpaired, handleConnect],
  );

  const listEmptyComponent = useMemo(
    () =>
      isScanning ? (
        <Text style={$.emptyText}>{t("scanning")}</Text>
      ) : (
        <EmptyState title={t("no_devices_found")} subtitle={t("scan_devices")} />
      ),
    [isScanning],
  );

  // Auto-connect on mount if we have a saved device but not connected
  useEffect(() => {
    if (connectedDevice && !isConnected) {
      handleConnect(connectedDevice);
    }
  }, [isConnected, handleConnect, connectedDevice]);

  return (
    <FormSectionCard title={t("printer_setting")} style={$.card} contentStyle={$.container}>
      {/* Auto Print Setting */}
      <View>
        <View style={$.rowBetween}>
          <View>
            <Text style={$.sectionTitle}>{t("auto_print")}</Text>
            <Text style={$.sectionSubtitle}>{t("auto_print_desc")}</Text>
          </View>
          <Switch value={isAutoPrintEnabled} onValueChange={setIsAutoPrintEnabled} />
        </View>
      </View>

      {/* Saved / Connected Printer Section */}
      {connectedDevice && (
        <View style={$.section}>
          <Text style={$.sectionTitle}>
            {isConnected ? t("connected_printer") : t("default_printer")}
          </Text>
          <View style={isConnected ? $.connectedPrinterCard : $.printerCard}>
            <View style={$.printerInfo}>
              <View style={$.iconContainer}>
                <Feather name="printer" size={24} color={isConnected ? "#179139" : "#555"} />
              </View>
              <View>
                <Text style={$.printerName}>{connectedDevice.name}</Text>
                <Text style={$.printerType}>{connectedDevice.id}</Text>
                {!isConnected && (
                  <Text style={$.notConnectedText}>{t("not_connected") || "Not Connected"}</Text>
                )}
              </View>
            </View>
            <View style={$.actionsRow}>
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
                  onPress={handleConnectSaved}
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
              leftIcon={renderScanningIcon}
              onPress={stopScan}
            />
          ) : (
            <Button
              title={t("scan_devices")}
              variant="primary"
              size="sm"
              leftIcon={renderSearchIcon}
              onPress={startScan}
            />
          )}
        </View>

        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={deviceKeyExtractor}
          contentContainerStyle={devices.length === 0 ? $.listContainerEmpty : $.listContainer}
          ListEmptyComponent={listEmptyComponent}
        />
      </View>

      {/* Test Print Preview Modal — mounted only when visible */}
      {showPreview && previewData && (
        <ReceiptPreviewModal
          visible={showPreview}
          onClose={handleClosePreview}
          onPrint={handlePrintPreview}
          data={previewData}
          isPrinting={isPrinting}
        />
      )}
    </FormSectionCard>
  );
};

const $ = StyleSheet.create((theme) => {
  const printerCardBase = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: theme.colors.neutral[100],
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  };

  return {
    card: {
      flex: 1,
    },
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
    listContainerEmpty: {
      gap: theme.spacing.md,
      flex: 1,
      justifyContent: "center",
    },
    printerCard: printerCardBase,
    connectedPrinterCard: {
      ...printerCardBase,
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
    connectedStatusText: {
      color: "#179139",
      fontWeight: "bold",
    },
    notConnectedText: {
      fontSize: 12,
      color: "#666",
      marginTop: 2,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.neutral[500],
    },
    emptyText: {
      textAlign: "center",
      marginTop: theme.spacing.lg,
      ...theme.typography.bodyMd,
      color: theme.colors.neutral[500],
    },
  };
});

export default PrinterSettings;
