import { PermissionsAndroid, Platform } from "react-native";
import { usePrinterStore } from "@/store/PrinterStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import Logger from "../logger";
import { printerService } from "../PrinterService";

// Create mock BLE device
const createMockDevice = (overrides: Partial<any> = {}) => {
  const mockChar = {
    uuid: "char-uuid-1",
    isWritableWithResponse: true,
    isWritableWithoutResponse: false,
  };

  const mockService = {
    uuid: "000018f0-0000-1000-8000-00805f9b34fb", // Known printer service
    characteristics: jest.fn().mockResolvedValue([mockChar]),
  };

  const device: any = {
    id: "device-123",
    name: "POS-58 Printer",
    discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue(undefined),
    services: jest.fn().mockResolvedValue([mockService]),
    requestMTU: jest.fn().mockResolvedValue({}),
    onDisconnected: jest.fn(),
    cancelConnection: jest.fn().mockResolvedValue(undefined),
    writeCharacteristicWithResponseForService: jest.fn().mockResolvedValue(undefined),
    writeCharacteristicWithoutResponseForService: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return device;
};

let mockBleManager: any;

jest.mock("react-native-ble-plx", () => {
  return {
    BleManager: jest.fn().mockImplementation(() => {
      mockBleManager = {
        state: jest.fn().mockResolvedValue("PoweredOn"),
        startDeviceScan: jest.fn(),
        stopDeviceScan: jest.fn(),
        connectToDevice: jest.fn(),
      };
      return mockBleManager;
    }),
  };
});

jest.mock("../logger", () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe("PrinterService", () => {
  const originalOS = Platform.OS;
  const originalVersion = Platform.Version;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset internal singleton state
    (printerService as any).connectedDevice = null;
    (printerService as any).serviceUUID = null;
    (printerService as any).characteristicUUID = null;
    (printerService as any).writeMethod = null;

    usePrinterStore.setState({
      isConnected: false,
      connectedDevice: null,
    });

    useBusinessStore.setState({
      business: {
        id: "biz-1",
        name: "Cajero Cafe",
        address: "123 Coffee St",
        phone: "555-0199",
      } as any,
    });

    printerService.init();
  });

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(Platform, "Version", {
      value: originalVersion,
      configurable: true,
      writable: true,
    });
  });

  describe("requestPermissions", () => {
    it("returns true directly on iOS", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "ios",
        configurable: true,
        writable: true,
      });
      const result = await printerService.requestPermissions();
      expect(result).toBe(true);
    });

    it("requests Bluetooth and Location permissions on Android 12+ (API >= 31)", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        configurable: true,
        writable: true,
      });
      Object.defineProperty(Platform, "Version", {
        value: 31,
        configurable: true,
        writable: true,
      });

      const requestMultipleSpy = jest
        .spyOn(PermissionsAndroid, "requestMultiple")
        .mockResolvedValueOnce({
          "android.permission.BLUETOOTH_SCAN": PermissionsAndroid.RESULTS.GRANTED,
          "android.permission.BLUETOOTH_CONNECT": PermissionsAndroid.RESULTS.GRANTED,
          "android.permission.ACCESS_FINE_LOCATION": PermissionsAndroid.RESULTS.GRANTED,
        });

      const result = await printerService.requestPermissions();

      expect(requestMultipleSpy).toHaveBeenCalledWith([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      expect(result).toBe(true);
      requestMultipleSpy.mockRestore();
    });

    it("requests ACCESS_FINE_LOCATION on Android < 31", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        configurable: true,
        writable: true,
      });
      Object.defineProperty(Platform, "Version", {
        value: 29,
        configurable: true,
        writable: true,
      });

      const requestSpy = jest
        .spyOn(PermissionsAndroid, "request")
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

      const result = await printerService.requestPermissions();

      expect(requestSpy).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      expect(result).toBe(true);
      requestSpy.mockRestore();
    });
  });

  describe("scanDevices and stopScan", () => {
    it("throws error if permissions are not granted", async () => {
      jest.spyOn(printerService, "requestPermissions").mockResolvedValueOnce(false);

      await expect(printerService.scanDevices(jest.fn())).rejects.toThrow(
        "Bluetooth permissions not granted",
      );
    });

    it("throws error if Bluetooth is not PoweredOn", async () => {
      jest.spyOn(printerService, "requestPermissions").mockResolvedValueOnce(true);
      mockBleManager.state.mockResolvedValueOnce("PoweredOff");

      await expect(printerService.scanDevices(jest.fn())).rejects.toThrow(
        "Bluetooth is not powered on. Current state: PoweredOff",
      );
    });

    it("starts scanning and delivers found named devices to callback", async () => {
      jest.spyOn(printerService, "requestPermissions").mockResolvedValueOnce(true);
      mockBleManager.state.mockResolvedValueOnce("PoweredOn");

      const onDeviceFound = jest.fn();
      await printerService.scanDevices(onDeviceFound);

      expect(mockBleManager.startDeviceScan).toHaveBeenCalledWith(null, null, expect.any(Function));

      // Simulate finding a device with a name
      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      scanCallback(null, { id: "dev-1", name: "Printer 1" });

      expect(onDeviceFound).toHaveBeenCalledWith({
        id: "dev-1",
        name: "Printer 1",
      });
    });

    it("handles scan errors via error callback", async () => {
      jest.spyOn(printerService, "requestPermissions").mockResolvedValueOnce(true);
      mockBleManager.state.mockResolvedValueOnce("PoweredOn");

      const onError = jest.fn();
      await printerService.scanDevices(jest.fn(), onError);

      const scanCallback = mockBleManager.startDeviceScan.mock.calls[0][2];
      const scanError = new Error("Scan timed out");
      scanCallback(scanError, null);

      expect(Logger.error).toHaveBeenCalledWith("Scan error:", scanError);
      expect(onError).toHaveBeenCalledWith(scanError);
    });

    it("stops scanning when stopScan is called", () => {
      printerService.stopScan();
      expect(mockBleManager.stopDeviceScan).toHaveBeenCalled();
    });
  });

  describe("connectToDevice and disconnect", () => {
    it("connects, discovers priority printer service, requests MTU on Android, and updates store", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "android",
        configurable: true,
        writable: true,
      });
      const mockDevice = createMockDevice();
      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await printerService.connectToDevice("device-123");

      expect(mockBleManager.connectToDevice).toHaveBeenCalledWith("device-123");
      expect(mockDevice.discoverAllServicesAndCharacteristics).toHaveBeenCalled();
      expect(mockDevice.requestMTU).toHaveBeenCalledWith(512);
      expect(usePrinterStore.getState().isConnected).toBe(true);
      expect(usePrinterStore.getState().connectedDevice).toEqual({
        id: "device-123",
        name: "POS-58 Printer",
      });

      // Verify disconnection callback
      expect(mockDevice.onDisconnected).toHaveBeenCalled();
      const disconnectCallback = mockDevice.onDisconnected.mock.calls[0][0];
      disconnectCallback(null, mockDevice);
      expect(usePrinterStore.getState().isConnected).toBe(false);
    });

    it("skips ignored services and falls back to first writable service when no priority UUID matches", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "ios",
        configurable: true,
        writable: true,
      });
      const mockChar = {
        uuid: "fallback-char-uuid",
        isWritableWithResponse: false,
        isWritableWithoutResponse: true,
      };

      const mockDevice = createMockDevice({
        services: jest.fn().mockResolvedValue([
          {
            uuid: "00001800-generic-access",
            characteristics: jest.fn().mockResolvedValue([mockChar]),
          },
          {
            uuid: "custom-vendor-service-uuid",
            characteristics: jest.fn().mockResolvedValue([mockChar]),
          },
        ]),
      });

      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await printerService.connectToDevice("device-fallback");

      expect(printerService.getServiceUUID()).toBe("custom-vendor-service-uuid");
      expect(printerService.getCharacteristicUUID()).toBe("fallback-char-uuid");
      expect(usePrinterStore.getState().isConnected).toBe(true);
    });

    it("throws an error if no writable characteristic is found", async () => {
      const mockDevice = createMockDevice({
        services: jest.fn().mockResolvedValue([
          {
            uuid: "00001800-generic-access",
            characteristics: jest.fn().mockResolvedValue([]),
          },
        ]),
      });

      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await expect(printerService.connectToDevice("device-no-char")).rejects.toThrow(
        "No writable characteristic found",
      );
    });

    it("disconnects and resets connection state in store", async () => {
      const mockDevice = createMockDevice();
      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await printerService.connectToDevice("device-123");
      expect(usePrinterStore.getState().isConnected).toBe(true);

      await printerService.disconnect();

      expect(mockDevice.cancelConnection).toHaveBeenCalled();
      expect(usePrinterStore.getState().isConnected).toBe(false);
    });
  });

  describe("writeData, printReceipt and testPrint", () => {
    it("throws error when writeData is called without an active connection", async () => {
      await expect(printerService.writeData("base64==")).rejects.toThrow(
        "Printer not capable of writing",
      );
    });

    it("prints receipt with formatting, variants, totals, and chunked buffer write", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "ios",
        configurable: true,
        writable: true,
      });
      const mockDevice = createMockDevice();
      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await printerService.connectToDevice("device-123");

      const receiptData = {
        title: "SALES RECEIPT",
        total: "65.000",
        subtotal: "60.000",
        tax: "5.000",
        paymentMethod: "CASH",
        footerMessage: "Thank you for visiting!",
        items: [
          {
            name: "Signature Cappuccino",
            quantity: 2,
            price: "30000",
            variants: [
              { groupName: "Size", name: "Large", price: 5000 },
              { groupName: "Milk", name: "Oat Milk", price: 3000 },
            ],
          },
        ],
      };

      await printerService.printReceipt(receiptData);

      expect(mockDevice.writeCharacteristicWithResponseForService).toHaveBeenCalled();
    });

    it("executes testPrint successfully when connected", async () => {
      Object.defineProperty(Platform, "OS", {
        value: "ios",
        configurable: true,
        writable: true,
      });
      const mockDevice = createMockDevice();
      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      await printerService.connectToDevice("device-123");
      await printerService.testPrint();

      expect(mockDevice.writeCharacteristicWithResponseForService).toHaveBeenCalled();
    });

    it("attempts reconnect with stored device if not currently connected during printReceipt", async () => {
      const mockDevice = createMockDevice();
      mockBleManager.connectToDevice.mockResolvedValueOnce(mockDevice);

      usePrinterStore.setState({
        isConnected: false,
        connectedDevice: { id: "stored-printer-id", name: "Saved Printer" },
      });

      await printerService.testPrint();

      expect(mockBleManager.connectToDevice).toHaveBeenCalledWith("stored-printer-id");
      expect(mockDevice.writeCharacteristicWithResponseForService).toHaveBeenCalled();
    });

    it("throws error if not connected and no stored device exists", async () => {
      usePrinterStore.setState({
        isConnected: false,
        connectedDevice: null,
      });

      await expect(printerService.testPrint()).rejects.toThrow("Printer not connected");
    });
  });
});
