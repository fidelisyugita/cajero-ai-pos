/** A single selected variant on an order item */
export interface SelectedVariant {
  groupName: string;
  name: string;
  price: number;
}

/** An individual line-item in a receipt */
export interface ReceiptItem {
  name: string;
  quantity: number;
  /** Formatted currency string, e.g. "Rp 10.000" */
  price: string | number;
  variants?: SelectedVariant[];
}

/** Full data payload passed to PrinterService.printReceipt and ReceiptPreviewModal */
export interface ReceiptData {
  title?: string;
  transactionId?: string;
  transactionDate?: Date | string;
  subtotal?: string;
  discount?: string;
  tax?: string;
  total: string;
  paymentMethod?: string;
  footerMessage?: string;
  items: ReceiptItem[];
}
