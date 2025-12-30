import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import EscPosEncoder from 'esc-pos-encoder';
import { usePrinterStore } from '@/store/PrinterStore';
import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';
import { useBusinessStore } from '@/store/useBusinessStore';
import Logger from './logger';


if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

class PrinterService {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private serviceUUID: string | null = null;
  private characteristicUUID: string | null = null;
  private writeMethod: 'withResponse' | 'withoutResponse' | null = null;
  private mtu: number = 23; // Default BLE MTU

  // Debug getters
  public getServiceUUID() { return this.serviceUUID; }
  public getCharacteristicUUID() { return this.characteristicUUID; }


  constructor() {
    // Lazy init to avoid NativeEventEmitter error on startup if not needed immediately
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
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async scanDevices(onDeviceFound: (device: Device) => void) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    const manager = this.getManager();
    const state = await manager.state();
    if (state !== 'PoweredOn') {
      throw new Error(`Bluetooth is not powered on. Current state: ${state}`);
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Logger.error('Scan error:', error);
        return;
      }
      if (device && device.name) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    this.getManager().stopDeviceScan();
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      this.stopScan();
      const device = await this.getManager().connectToDevice(deviceId);
      this.connectedDevice = device;

      await device.discoverAllServicesAndCharacteristics();

      // Find writable characteristic
      const services = await device.services();

      // Known printer service UUIDs (short 16-bit UUIDs are often returned as full 128-bit)
      // 18f0 is a common proprietary service for printing.
      const PRINTER_SERVICES = ['000018f0', 'e7810a71', '49535343'];

      // Services to explicitly IGNORE
      const IGNORED_SERVICES = [
        '00001800', // Generic Access
        '00001801', // Generic Attribute
        '0000180a', // Device Information
        '00001804', // Tx Power
        '0000180f', // Battery Service
      ];

      let fallbackService: { uuid: string, charUuid: string, method: 'withResponse' | 'withoutResponse' } | null = null;
      let selectedService: { uuid: string, charUuid: string, method: 'withResponse' | 'withoutResponse' } | null = null;

      for (const service of services) {
        const uuid = service.uuid.toLowerCase();
        Logger.log(`[PrinterService] Found Service: ${uuid}`);

        if (IGNORED_SERVICES.some(ignored => uuid.includes(ignored))) {
          Logger.log(`[PrinterService] Skipping ignored service: ${uuid}`);
          continue;
        }

        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          Logger.log(`  [PrinterService] Char: ${char.uuid} | W_Resp: ${char.isWritableWithResponse} | W_NoResp: ${char.isWritableWithoutResponse}`);

          let method: 'withResponse' | 'withoutResponse' | null = null;
          // Prefer withResponse for better reliability/debugging, even if slower
          if (char.isWritableWithResponse) method = 'withResponse';
          else if (char.isWritableWithoutResponse) method = 'withoutResponse';

          if (method) {
            const potentialService = { uuid: service.uuid, charUuid: char.uuid, method };

            // If this is a known printer service, select it immediately
            if (PRINTER_SERVICES.some(ps => uuid.includes(ps))) {
              Logger.log(`[PrinterService] Priority Printer Service Found: ${uuid}`);
              selectedService = potentialService;
              break;
            }

            // Otherwise keep as fallback (first one found)
            if (!fallbackService) {
              fallbackService = potentialService;
            }
          }
        }
        if (selectedService) break;
      }

      // Apply selection
      const finalSelection = selectedService || fallbackService;

      if (finalSelection) {
        this.serviceUUID = finalSelection.uuid;
        this.characteristicUUID = finalSelection.charUuid;
        this.writeMethod = finalSelection.method;
        Logger.log(`[PrinterService] Final Selection: Service ${this.serviceUUID}, Char ${this.characteristicUUID}, Method: ${this.writeMethod}`);
      } else {
        // If we found nothing, let's look at the logs to see what happened. 
        // Maybe we were too aggressive with filtering?
        Logger.warn('[PrinterService] No suitable characteristic found after filtering.');
      }

      if (!this.characteristicUUID) {
        throw new Error("No writable characteristic found");
      }

      // Negotiate MTU on Android for better performance (iOS handles this auto)
      if (Platform.OS === 'android') {
        try {
          // Request 512, usually gets around 247 or 512 depending on device
          // requestMTU returns the Device object, not the size. 
          // We assume if it succeeds, we can use a larger chunk size, but we keep it at 50 for safety on 58mm printers.
          await device.requestMTU(512);
          Logger.log(`[PrinterService] MTU request sent`);
        } catch (e) {
          Logger.warn('MTU request failed, sticking to default', e);
        }
      }

      usePrinterStore.getState().setConnectedDevice({ id: device.id, name: device.name });
      usePrinterStore.getState().setIsConnected(true);

      // Handle disconnection
      device.onDisconnected((error, disconnectedDevice) => {
        usePrinterStore.getState().setIsConnected(false);
        this.connectedDevice = null;
        this.writeMethod = null;
      });

    } catch (error) {
      Logger.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
      this.writeMethod = null;
      usePrinterStore.getState().setIsConnected(false);
    }
  }

  async writeData(base64Data: string) {
    if (!this.connectedDevice || !this.serviceUUID || !this.characteristicUUID || !this.writeMethod) {
      throw new Error("Printer not capable of writing");
    }

    // BLE MTU is limited.
    const buffer = Buffer.from(base64Data, 'base64');

    // Safe calculation: MTU - 3 bytes overhead.
    // We cap it at 40-50 for 'WithoutResponse' on cheap printers to avoid buffer overflow
    const CHUNK_SIZE = 50;

    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      const chunk = buffer.subarray(i, i + CHUNK_SIZE);
      // Force re-wrap to ensure toString('base64') works correctly in RN environment
      const chunkBase64 = Buffer.from(chunk).toString('base64');
      // console.log(`[PrinterService] Writing chunk (${i}/${buffer.length}): ${chunkBase64}`);

      try {
        if (this.writeMethod === 'withResponse') {
          await this.connectedDevice.writeCharacteristicWithResponseForService(
            this.serviceUUID,
            this.characteristicUUID,
            chunkBase64
          );
        } else {
          await this.connectedDevice.writeCharacteristicWithoutResponseForService(
            this.serviceUUID,
            this.characteristicUUID,
            chunkBase64
          );
        }
      } catch (error) {
        Logger.warn('Write chunk failed', error);
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
    return ' '.repeat(leftPad) + trimmed;
  }

  private rightText(text: string): string {
    const trimmed = text.substring(0, this.WIDTH);
    const padding = Math.max(0, this.WIDTH - trimmed.length);
    return ' '.repeat(padding) + trimmed;
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
    return leftPart + ' '.repeat(padding) + right;
  }

  async printReceipt(data: {
    title?: string;
    total: string;
    items: { name: string; quantity: number; price: string }[];
    subtotal?: string;
    discount?: string;
    tax?: string;
    paymentMethod?: string;
    footerMessage?: string;
  }) {
    if (!this.connectedDevice || !this.serviceUUID || !this.characteristicUUID) {
      // Try to reconnect if stored
      const storedDevice = usePrinterStore.getState().connectedDevice;
      if (storedDevice) {
        await this.connectToDevice(storedDevice.id);
      } else {
        throw new Error("Printer not connected");
      }
    }

    const encoder = new EscPosEncoder();

    // Get business name from store directly to ensure latest
    const business = useBusinessStore.getState().business;
    Logger.log("[PrinterService] Printing Receipt with Business Info:", business);
    const businessName = business?.name || 'CAJERO POS';

    const DIVIDER = '-'.repeat(this.WIDTH);

    // Initial commands - We stay LEFT aligned and manually pad for consistency
    let encoderChain = encoder
      .initialize()
      .codepage('cp437') // Standard for US/EU
      // .text('\x1B\x40') // REMOVED: Cause of '?@' garbage
      .align('left'); // Always left, we handle positioning strings manually

    // Header
    encoderChain.bold(true).line(this.centerText(businessName)).bold(false);
    if (business?.address) encoderChain.line(this.centerText(business.address));
    if (business?.phone) encoderChain.line(this.centerText(business.phone));

    // Title
    if (data.title) {
      encoderChain.newline().bold(true).line(this.centerText(data.title)).bold(false);
    }

    // Divider
    encoderChain.line(DIVIDER);

    // Items
    if (data.items) {
      data.items.forEach((item) => {
        // Line 1: Item Name
        encoderChain.line(item.name);
        // Line 2: Qty and Price (Right aligned or Paired?)
        // Let's use Pair: "x2" on left (indented?), "10.000" on right?
        // Or "x2" .... "10.000"

        // Format: "  x2              20.000"
        const qtyStr = `x${item.quantity}`;
        const line2 = this.pairText("  " + qtyStr, item.price);
        encoderChain.line(line2);
      });
    }

    encoderChain.line(DIVIDER);

    // Totals - Using pairText to put Label on Left, Value on Right
    if (data.subtotal) encoderChain.line(this.pairText('Subtotal:', data.subtotal));
    if (data.discount) encoderChain.line(this.pairText('Discount:', data.discount));
    if (data.tax) encoderChain.line(this.pairText('Tax:', data.tax));

    // Total - Right aligned (actually paired with "TOTAL:")
    encoderChain
      .newline()
      .bold(true)
      .line(this.pairText('TOTAL:', data.total || '0'))
      .bold(false)
      .newline();

    // Payment
    if (data.paymentMethod) {
      encoderChain.line(this.centerText(`Payment: ${data.paymentMethod}`));
    }

    // Footer
    encoderChain
      .newline()
      .line(this.centerText(data.footerMessage || 'Thank you!'))
      .newline()
      .newline()
      .cut();

    const buffer = Buffer.from(encoderChain.encode());
    const base64Data = buffer.toString('base64');

    await this.writeData(base64Data);
  }

  // For test print
  async testPrint() {
    if (!this.connectedDevice || !this.serviceUUID || !this.characteristicUUID) {
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
      .align('left') // Manual formatting
      .line(this.centerText('TEST PRINT'))
      .line(this.centerText('Success!'))
      .newline()
      .line(this.pairText('Left', 'Right'))
      .line('-'.repeat(32))
      .newline()
      .newline()
      .cut();

    const buffer = Buffer.from(result.encode());
    const base64Data = buffer.toString('base64');

    await this.writeData(base64Data);
  }
}

export const printerService = new PrinterService();
