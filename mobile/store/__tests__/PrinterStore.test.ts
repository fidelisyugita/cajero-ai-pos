import { type PrinterDevice, usePrinterStore } from "../PrinterStore";

describe("PrinterStore", () => {
  beforeEach(() => {
    usePrinterStore.setState({
      connectedDevice: null,
      isScanning: false,
      isConnected: false,
      isAutoPrintEnabled: false,
    });
  });

  it("should initialize with default state", () => {
    const state = usePrinterStore.getState();
    expect(state.connectedDevice).toBeNull();
    expect(state.isScanning).toBe(false);
    expect(state.isConnected).toBe(false);
    expect(state.isAutoPrintEnabled).toBe(false);
  });

  it("should set connected device", () => {
    const device: PrinterDevice = {
      id: "bt-printer-1",
      name: "Thermal POS Printer",
    };

    usePrinterStore.getState().setConnectedDevice(device);
    expect(usePrinterStore.getState().connectedDevice).toEqual(device);
  });

  it("should set isScanning and isConnected status", () => {
    usePrinterStore.getState().setIsScanning(true);
    expect(usePrinterStore.getState().isScanning).toBe(true);

    usePrinterStore.getState().setIsConnected(true);
    expect(usePrinterStore.getState().isConnected).toBe(true);
  });

  it("should disconnect and clear connectedDevice and isConnected", () => {
    usePrinterStore.getState().setConnectedDevice({
      id: "bt-printer-1",
      name: "Thermal POS Printer",
    });
    usePrinterStore.getState().setIsConnected(true);

    usePrinterStore.getState().disconnect();

    const state = usePrinterStore.getState();
    expect(state.connectedDevice).toBeNull();
    expect(state.isConnected).toBe(false);
  });

  it("should toggle auto print enabled", () => {
    usePrinterStore.getState().setIsAutoPrintEnabled(true);
    expect(usePrinterStore.getState().isAutoPrintEnabled).toBe(true);

    usePrinterStore.getState().setIsAutoPrintEnabled(false);
    expect(usePrinterStore.getState().isAutoPrintEnabled).toBe(false);
  });
});
