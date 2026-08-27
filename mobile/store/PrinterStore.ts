import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEncryptedMMKV } from "@/lib/Storage";

export interface PrinterDevice {
  id: string;
  name: string | null;
}

interface PrinterState {
  connectedDevice: PrinterDevice | null;
  isScanning: boolean;
  isConnected: boolean;
  setConnectedDevice: (device: PrinterDevice | null) => void;
  setIsScanning: (isScanning: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  disconnect: () => void;
  isAutoPrintEnabled: boolean;
  setIsAutoPrintEnabled: (enabled: boolean) => void;
}

const mmkvStorage = createEncryptedMMKV("printer-storage");

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      connectedDevice: null,
      isScanning: false,
      isConnected: false,
      setConnectedDevice: (device) => set({ connectedDevice: device }),
      setIsScanning: (isScanning) => set({ isScanning }),
      setIsConnected: (isConnected) => set({ isConnected }),
      disconnect: () => set({ connectedDevice: null, isConnected: false }),
      isAutoPrintEnabled: false,
      setIsAutoPrintEnabled: (enabled) => set({ isAutoPrintEnabled: enabled }),
    }),
    {
      name: "printer-storage",
      storage: createJSONStorage(() => ({
        getItem: mmkvStorage.getItem,
        setItem: mmkvStorage.setItem,
        removeItem: mmkvStorage.removeItem,
      })),
      partialize: (state) => ({
        connectedDevice: state.connectedDevice,
        isAutoPrintEnabled: state.isAutoPrintEnabled,
      }),
    },
  ),
);
