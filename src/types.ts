export type GroupField = 'transaction_type' | 'amount' | 'status' | 'year';

export interface Transaction {
  transaction_type: 'invoice' | 'bill' | 'direct_expense' | string;
  transaction_number: string;
  amount: number;     
  status: 'paid' | 'unpaid' | 'partially_paid' | string;
  year: string | number;
}

export interface ColumnNode {
  value: string | number;
  fullPath: (string | number)[];
  colSpan: number;
  children: ColumnNode[];
}

export type RawTransaction = Omit<Transaction, 'amount'> & { amount: string };
 