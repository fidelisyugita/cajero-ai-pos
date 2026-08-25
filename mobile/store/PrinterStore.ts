import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

const storage = createMMKV({ id: "printer-storage" });

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

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
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        connectedDevice: state.connectedDevice,
        isAutoPrintEnabled: state.isAutoPrintEnabled,
      }),
    },
  ),
);
