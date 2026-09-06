declare module '@paystack/inline-js' {
  export interface PaystackTransactionResult {
    reference: string;
    status?: string;
    trans?: string;
    transaction?: string;
    message?: string;
    [key: string]: unknown;
  }

  export interface PaystackOptions {
    onSuccess?: (transaction: PaystackTransactionResult) => void;
    onCancel?: () => void;
    [key: string]: unknown;
  }

  export default class PaystackPop {
    newTransaction(options: Record<string, unknown>): void;
    resumeTransaction(accessCode: string, options?: PaystackOptions): void;
  }
}
