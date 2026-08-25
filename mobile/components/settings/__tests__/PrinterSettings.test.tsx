import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { printerService } from "@/services/PrinterService";
import { usePrinterStore } from "@/store/PrinterStore";
import PrinterSettings from "../PrinterSettings";

jest.mock("@/services/PrinterService", () => ({
  printerService: {
    scanDevices: jest.fn(),
    stopScan: jest.fn(),
    connectToDevice: jest.fn(),
    disconnect: jest.fn(),
    printReceipt: jest.fn(),
  },
}));

describe("PrinterSettings component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePrinterStore.setState({
      connectedDevice: null,
      isConnected: false,
      isAutoPrintEnabled: false,
      setConnectedDevice: (dev) => usePrinterStore.setState({ connectedDevice: dev }),
      setIsConnected: (connected) => usePrinterStore.setState({ isConnected: connected }),
      setIsAutoPrintEnabled: (enabled) => usePrinterStore.setState({ isAutoPrintEnabled: enabled }),
    });
  });

  it("renders auto print switch and toggles setting", async () => {
    await render(<PrinterSettings />);

    expect(screen.getByText("Auto Print")).toBeTruthy();
    expect(screen.getByText("Print receipt automatically after payment success")).toBeTruthy();

    const switchElem = screen.getByRole("switch");
    await act(async () => {
      fireEvent(switchElem, "valueChange", true);
    });

    expect(usePrinterStore.getState().isAutoPrintEnabled).toBe(true);
  });

  it("scans and displays available devices", async () => {
    (printerService.scanDevices as jest.Mock).mockImplementation((onDeviceFound) => {
      onDeviceFound({ id: "dev-bt-1", name: "Thermal POS-58" });
    });

    await render(<PrinterSettings />);

    const scanButtons = screen.getAllByText("Scan Devices");
    await act(async () => {
      fireEvent.press(scanButtons[0]);
    });

    expect(printerService.scanDevices).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Thermal POS-58")).toBeTruthy();
    expect(screen.getByText("dev-bt-1")).toBeTruthy();
  });

  it("connects to a selected device and calls connectToDevice", async () => {
    (printerService.scanDevices as jest.Mock).mockImplementation((onDeviceFound) => {
      onDeviceFound({ id: "dev-bt-1", name: "Thermal POS-58" });
    });
    (printerService.connectToDevice as jest.Mock).mockResolvedValue(undefined);

    await render(<PrinterSettings />);

    const scanButtons = screen.getAllByText("Scan Devices");
    await act(async () => {
      fireEvent.press(scanButtons[0]);
    });

    const connectBtn = screen.getByText("Connect");
    await act(async () => {
      fireEvent.press(connectBtn);
    });

    expect(printerService.connectToDevice).toHaveBeenCalledWith("dev-bt-1");
  });

  it("renders connected printer status and handles disconnect", async () => {
    usePrinterStore.setState({
      connectedDevice: { id: "dev-bt-connected", name: "Epson TM-T82" },
      isConnected: true,
    });

    (printerService.disconnect as jest.Mock).mockResolvedValue(undefined);

    await render(<PrinterSettings />);

    expect(screen.getByText("Connected Printer")).toBeTruthy();
    expect(screen.getByText("Epson TM-T82")).toBeTruthy();

    const disconnectBtn = screen.getByText("Disconnect");
    await act(async () => {
      fireEvent.press(disconnectBtn);
    });

    expect(printerService.disconnect).toHaveBeenCalled();
  });
});
