import { pivotData, getHeaderNodesAtDepth } from '../src/utils';
import type { Transaction, GroupField } from '../src/types';

describe('utils.ts', () => {
  const transactions: Transaction[] = [
    { transaction_type: 'invoice', transaction_number: '1', amount: 100, status: 'paid', year: '2024' },
    { transaction_type: 'invoice', transaction_number: '2', amount: 50, status: 'unpaid', year: '2024' },
    { transaction_type: 'bill', transaction_number: '3', amount: 25.5, status: 'paid', year: '2025' },
    { transaction_type: 'bill', transaction_number: '4', amount: 24.5, status: 'paid', year: '2024' },
  ];

  test('pivotData without column groups sums by row group', () => {
    const rowField: GroupField = 'transaction_type';
    const result = pivotData(transactions, rowField, []);

    expect(result.rowValues).toEqual(['bill', 'invoice']);
    expect(result.leaves).toEqual([{ value: 'Total', fullPath: [], colSpan: 1, children: [] }]);
    expect(result.pivotMap['invoice']).toBeCloseTo(150, 6);
    expect(result.pivotMap['bill']).toBeCloseTo(50, 6);
    expect(result.totalMap).toBeCloseTo(200, 6);
  });

  test('pivotData with one column group builds nested totals', () => {
    const rowField: GroupField = 'transaction_type';
    const result = pivotData(transactions, rowField, ['year']);

    expect(result.columnTree.map(n => n.value)).toEqual(['2024', '2025']);

    const invoiceRow = result.pivotMap['invoice'] as Record<string, number>;
    const billRow = result.pivotMap['bill'] as Record<string, number>;

    expect(invoiceRow['2024']).toBeCloseTo(150, 6);
    expect(billRow['2024']).toBeCloseTo(24.5, 6);
    expect(billRow['2025']).toBeCloseTo(25.5, 6);
  });

  test('getHeaderNodesAtDepth returns correct nodes', () => {
    const { columnTree } = pivotData(transactions, 'transaction_type', ['status', 'year']);
    const depth0 = getHeaderNodesAtDepth(columnTree, 0);
    const depth1 = getHeaderNodesAtDepth(columnTree, 1);

    expect(depth0.length).toBeGreaterThan(0);
    expect(depth1.length).toBeGreaterThan(0);
  });
});

