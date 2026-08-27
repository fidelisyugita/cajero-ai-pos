import { Buffer } from "buffer";
import EscPosEncoder from "esc-pos-encoder";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, type Device } from "react-native-ble-plx";
import { captureAnalyticsEvent } from "@/lib/posthog";
import { usePrinterStore } from "@/store/PrinterStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { formatCurrency } from "@/utils/Format";
import Logger from "./logger";

if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

class PrinterService {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private serviceUUID: string | null = null;
  private characteristicUUID: string | null = null;
  private writeMethod: "withResponse" | "withoutResponse" | null = null;

  // Debug getters
  public getServiceUUID() {
    return this.serviceUUID;
  }
  public getCharacteristicUUID() {
    return this.characteristicUUID;
  }

  private getManager(): BleManager {
    if (!this.manager) {
      this.manager = new BleManager();
    }
    return this.manager;
  }

  // Initialize the manager (ensure it's only created once)
  init() {
    this.getManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED
        );
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS permissions handled via Info.plist
  }

  async scanDevices(onDeviceFound: (device: Device) => void, onError?: (error: any) => void) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error("Bluetooth permissions not granted");
    }

    const manager = this.getManager();
    const state = await manager.state();
    if (state !== "PoweredOn") {
      throw new Error(`Bluetooth is not powered on. Current state: ${state}`);
    }

    usePrinterStore.getState().setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Logger.error("Scan error:", error);
        usePrinterStore.getState().setIsScanning(false);
        if (onError) onError(error);
        return;
      }
      if (device?.name) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    this.getManager().stopDeviceScan();
    usePrinterStore.getState().setIsScanning(false);
  }

  private findCharacteristicInService(
    serviceUuid: string,
    characteristics: {
      uuid: string;
      isWritableWithResponse: boolean;
      isWritableWithoutResponse: boolean;
    }[],
    isPriority: boolean,
  ): {
    candidate: {
      serviceUUID: string;
      characteristicUUID: string;
      writeMethod: "withResponse" | "withoutResponse";
    };
    isPriority: boolean;
  } | null {
    for (const char of characteristics) {
      Logger.log(
        `  [PrinterService] Char: ${char.uuid} | W_Resp: ${char.isWritableWithResponse} | W_NoResp: ${char.isWritableWithoutResponse}`,
      );

      const method: "withResponse" | "withoutResponse" | null = char.isWritableWithResponse
        ? "withResponse"
        : char.isWritableWithoutResponse
          ? "withoutResponse"
          : null;

      if (method) {
        return {
          candidate: {
            serviceUUID: serviceUuid,
            characteristicUUID: char.uuid,
            writeMethod: method,
          },
          isPriority,
        };
      }
    }
    return null;
  }

  private async findWritableCharacteristic(device: Device): Promise<{
    serviceUUID: string;
    characteristicUUID: string;
    writeMethod: "withResponse" | "withoutResponse";
  } | null> {
    const services = await device.services();
    const PRINTER_SERVICES = ["000018f0", "e7810a71", "49535343"];
    const IGNORED_SERVICES = ["00001800", "00001801", "0000180a", "00001804", "0000180f"];

    let fallback: {
      serviceUUID: string;
      characteristicUUID: string;
      writeMethod: "withResponse" | "withoutResponse";
    } | null = null;

    for (const service of services) {
      const uuid = service.uuid.toLowerCase();
      Logger.log(`[PrinterService] Found Service: ${uuid}`);

      if (IGNORED_SERVICES.some((ignored) => uuid.includes(ignored))) {
        Logger.log(`[PrinterService] Skipping ignored service: ${uuid}`);
        continue;
      }

      const characteristics = await service.characteristics();
      const isPriority = PRINTER_SERVICES.some((ps) => uuid.includes(ps));
      const match = this.findCharacteristicInService(service.uuid, characteristics, isPriority);

      if (match?.isPriority) {
        Logger.log(`[PrinterService] Priority Printer Service Found: ${uuid}`);
        return match.candidate;
      }

      if (match && !fallback) {
        fallback = match.candidate;
      }
    }

    return fallback;
  }

  private async requestDeviceMtu(device: Device): Promise<void> {
    if (Platform.OS !== "android") return;
    try {
      await device.requestMTU(512);
      Logger.log("[PrinterService] MTU request sent");
    } catch (e) {
      Logger.warn("MTU request failed, sticking to default", e);
    }
  }

  private setupDisconnectionListener(device: Device): void {
    device.onDisconnected((_error, disconnectedDevice) => {
      usePrinterStore.getState().setIsConnected(false);
      this.connectedDevice = null;
      this.writeMethod = null;

      captureAnalyticsEvent("printer_disconnected", {
        printerName: disconnectedDevice?.name || undefined,
      });
    });
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      this.stopScan();
      const device = await this.getManager().connectToDevice(deviceId);
      this.connectedDevice = device;

      await device.discoverAllServicesAndCharacteristics();

      const selection = await this.findWritableCharacteristic(device);
      if (!selection) {
        Logger.warn("[PrinterService] No suitable characteristic found after filtering.");
        throw new Error("No writable characteristic found");
      }

      this.serviceUUID = selection.serviceUUID;
      this.characteristicUUID = selection.characteristicUUID;
      this.writeMethod = selection.writeMethod;
      Logger.log(
        `[PrinterService] Final Selection: Service ${this.serviceUUID}, Char ${this.characteristicUUID}, Method: ${this.writeMethod}`,
      );

      await this.requestDeviceMtu(device);

      usePrinterStore.getState().setConnectedDevice({ id: device.id, name: device.name });
      usePrinterStore.getState().setIsConnected(true);

      captureAnalyticsEvent("printer_connected", {
        printerName: device.name || "Unknown Printer",
        address: device.id,
      });

      this.setupDisconnectionListener(device);
    } catch (error: unknown) {
      Logger.error("Connection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Printer connection failed";
      captureAnalyticsEvent("printer_job_failed", {
        error: errorMessage,
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.connectedDevice) {
      const printerName = this.connectedDevice.name || undefined;
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
      this.writeMethod = null;
      usePrinterStore.getState().setIsConnected(false);

      captureAnalyticsEvent("printer_disconnected", {
        printerName,
      });
    }
  }

  async writeData(base64Data: string) {
    if (
      !(this.connectedDevice && this.serviceUUID && this.characteristicUUID && this.writeMethod)
    ) {
      throw new Error("Printer not capable of writing");
    }

    // BLE MTU is limited.
    const buffer = Buffer.from(base64Data, "base64");

    // Safe calculation: MTU - 3 bytes overhead.
    // We cap it at 40-50 for 'WithoutResponse' on cheap printers to avoid buffer overflow
    const CHUNK_SIZE = 50;

    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      const chunk = buffer.subarray(i, i + CHUNK_SIZE);
      // Force re-wrap to ensure toString('base64') works correctly in RN environment
      const chunkBase64 = Buffer.from(chunk).toString("base64");
      // console.log(`[PrinterService] Writing chunk (${i}/${buffer.length}): ${chunkBase64}`);

      try {
        if (this.writeMethod === "withResponse") {
          await this.connectedDevice.writeCharacteristicWithResponseForService(
            this.serviceUUID,
            this.characteristicUUID,
            chunkBase64,
          );
        } else {
          await this.connectedDevice.writeCharacteristicWithoutResponseForService(
            this.serviceUUID,
            this.characteristicUUID,
            chunkBase64,
          );
        }
      } catch (error) {
        Logger.warn("Write chunk failed", error);
        // Depending on error, we might want to throw or continue.
        // For printer, missing a chunk ruins the print, so throw.
        throw error;
      }
    }
  }

  // --- Formatting Helpers (Manual Width Management) ---
  // Using 32 characters as strict limit for 58mm
  private readonly WIDTH = 32;

  private centerText(text: string): string {
    const trimmed = text.substring(0, this.WIDTH);
    const padding = Math.max(0, this.WIDTH - trimmed.length);
    const leftPad = Math.floor(padding / 2);
    // return ' '.repeat(leftPad) + trimmed; // Right side handled by newline
    // Actually better to fill whole line to avoid printer drift? No, newline is fine.
    return " ".repeat(leftPad) + trimmed;
  }

  private pairText(left: string, right: string): string {
    // left + spaces + right
    // If combined > WIDTH, split? Or truncate left?
    // Let's truncate left to ensure right (price) is visible
    const rightLen = right.length;
    const maxLeft = this.WIDTH - rightLen - 1; // 1 space min

    let leftPart = left;
    if (leftPart.length > maxLeft) {
      leftPart = leftPart.substring(0, maxLeft);
    }

    const padding = Math.max(0, this.WIDTH - leftPart.length - rightLen);
    return leftPart + " ".repeat(padding) + right;
  }

  private async ensureConnection(): Promise<void> {
    if (!(this.connectedDevice && this.serviceUUID && this.characteristicUUID)) {
      const storedDevice = usePrinterStore.getState().connectedDevice;
      if (storedDevice) {
        await this.connectToDevice(storedDevice.id);
      } else {
        throw new Error("Printer not connected");
      }
    }
  }

  private buildReceiptItems(
    encoderChain: any,
    items: {
      name: string;
      quantity: number;
      price: string;
      variants?: { groupName: string; name: string; price: number }[];
    }[],
  ): void {
    items.forEach((item) => {
      encoderChain.line(item.name);

      if (item.variants && item.variants.length > 0) {
        item.variants.forEach((variant) => {
          const variantText = `  + ${variant.groupName}: ${variant.name}`;
          const variantPrice = `(${formatCurrency(variant.price)})`;
          encoderChain.line(`${variantText} ${variantPrice}`);
        });
      }

      const qtyStr = `  x${item.quantity} `;
      const line2 = this.pairText(qtyStr, formatCurrency(Number(item.price)));
      encoderChain.line(line2);
    });
  }

  private buildReceiptTotals(
    encoderChain: any,
    data: {
      subtotal?: string;
      discount?: string;
      tax?: string;
      total: string;
      paymentMethod?: string;
      footerMessage?: string;
    },
  ): void {
    if (data.subtotal) encoderChain.line(this.pairText("Subtotal:", data.subtotal));
    if (data.discount) encoderChain.line(this.pairText("Discount:", data.discount));
    if (data.tax) encoderChain.line(this.pairText("Tax:", data.tax));

    encoderChain
      .newline()
      .bold(true)
      .line(this.pairText("TOTAL:", data.total || "0"))
      .bold(false)
      .newline();

    if (data.paymentMethod) {
      encoderChain.line(this.centerText(`Payment: ${data.paymentMethod}`));
    }

    encoderChain
      .newline()
      .line(this.centerText(data.footerMessage || "Thank you!"))
      .newline()
      .newline()
      .cut();
  }

  async printReceipt(data: {
    title?: string;
    total: string;
    items: {
      name: string;
      quantity: number;
      price: string;
      variants?: { groupName: string; name: string; price: number }[];
    }[];
    subtotal?: string;
    discount?: string;
    tax?: string;
    paymentMethod?: string;
    footerMessage?: string;
  }) {
    await this.ensureConnection();

    const encoder = new EscPosEncoder();
    const business = useBusinessStore.getState().business;
    Logger.log("[PrinterService] Printing Receipt with Business Info:", business);
    const businessName = business?.name || "CAJERO POS";
    const DIVIDER = "-".repeat(this.WIDTH);

    const encoderChain = encoder.initialize().codepage("cp437").align("left");

    encoderChain.bold(true).line(this.centerText(businessName)).bold(false);
    if (business?.address) encoderChain.line(this.centerText(business.address));
    if (business?.phone) encoderChain.line(this.centerText(business.phone));

    if (data.title) {
      encoderChain.newline().bold(true).line(this.centerText(data.title)).bold(false);
    }

    encoderChain.line(DIVIDER);

    if (data.items) {
      this.buildReceiptItems(encoderChain, data.items);
    }

    encoderChain.line(DIVIDER);

    this.buildReceiptTotals(encoderChain, data);

    const buffer = Buffer.from(encoderChain.encode());
    const base64Data = buffer.toString("base64");

    await this.writeData(base64Data);
    captureAnalyticsEvent("printer_job_sent", { type: "receipt" });
  }

  // For test print
  async testPrint() {
    if (!(this.connectedDevice && this.serviceUUID && this.characteristicUUID)) {
      const storedDevice = usePrinterStore.getState().connectedDevice;
      if (storedDevice) {
        await this.connectToDevice(storedDevice.id);
      } else {
        throw new Error("Printer not connected");
      }
    }

    const encoder = new EscPosEncoder();
    const result = encoder
      .initialize()
      .align("left") // Manual formatting
      .line(this.centerText("TEST PRINT"))
      .line(this.centerText("Success!"))
      .newline()
      .line(this.pairText("Left", "Right"))
      .line("-".repeat(32))
      .newline()
      .newline()
      .cut();

    const buffer = Buffer.from(result.encode());
    const base64Data = buffer.toString("base64");

    await this.writeData(base64Data);
    captureAnalyticsEvent("printer_job_sent", { type: "test" });
  }
}

export const printerService = new PrinterService();
