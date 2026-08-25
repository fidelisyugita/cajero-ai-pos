export interface CheckoutCompletedProperties {
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  discountAmount?: number;
  taxAmount?: number;
  serviceFeeAmount?: number;
  cashierId?: string;
  storeId?: string;
}

export interface CartItemAddedProperties {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface CartClearedProperties {
  itemCount: number;
}

export interface PrinterConnectedProperties {
  printerName: string;
  address: string;
  connectionType?: string;
}

export interface PrinterDisconnectedProperties {
  printerName?: string;
}

export interface PrinterJobProperties {
  orderId?: string;
  type: "receipt" | "report" | "test";
  paperWidth?: number;
}

export interface PrinterJobFailedProperties {
  error: string;
  printerName?: string;
}

export interface AttendanceActionProperties {
  action: "check_in" | "check_out";
  employeeId: string;
  roleCode?: string;
  storeId?: string;
}

export interface AIPromptSentProperties {
  promptLength: number;
  queryCategory?: string;
}

export interface ScreenViewProperties {
  screenName: string;
  path: string;
}

export interface SyncEventProperties {
  pendingCount?: number;
  syncedCount?: number;
  durationMs?: number;
  error?: string;
}

export interface UserTraits {
  email?: string;
  name?: string;
  storeId?: string;
  roleCode?: string;
  phone?: string | null;
}

export interface AnalyticsEventMap {
  checkout_completed: CheckoutCompletedProperties;
  cart_item_added: CartItemAddedProperties;
  cart_cleared: CartClearedProperties;
  printer_connected: PrinterConnectedProperties;
  printer_disconnected: PrinterDisconnectedProperties;
  printer_job_sent: PrinterJobProperties;
  printer_job_failed: PrinterJobFailedProperties;
  attendance_action: AttendanceActionProperties;
  ai_prompt_sent: AIPromptSentProperties;
  screen_view: ScreenViewProperties;
  sync_triggered: SyncEventProperties;
  sync_completed: SyncEventProperties;
  sync_failed: SyncEventProperties;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
