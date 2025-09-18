import type { ColumnNode, GroupField, Transaction } from './types';

export interface PivotResult {
  rowValues: Array<string | number>;
  columnTree: ColumnNode[];
  leaves: ColumnNode[];
  pivotMap:
    | Record<string | number, number> 
    | Record<string | number, any>;   
  totalMap: number | Record<string | number, any>;
}

function sortValues(valueA: string | number, valueB: string | number): number {
  const isValueANumeric = typeof valueA === 'number' || !Number.isNaN(Number(valueA));
  const isValueBNumeric = typeof valueB === 'number' || !Number.isNaN(Number(valueB));
  if (isValueANumeric && isValueBNumeric) return Number(valueA) - Number(valueB);
  return String(valueA).localeCompare(String(valueB));
}

function buildColumnTree(
  transactions: Transaction[],
  groupFields: GroupField[],
  currentPath: (string | number)[] = []
): ColumnNode[] {
  if (groupFields.length === 0) return [];
  const [currentField, ...remainingFields] = groupFields;

  const uniqueValues = Array.from(
    new Set(transactions.map(transaction => transaction[currentField] as string | number))
  ).sort(sortValues);

  return uniqueValues.map(groupValue => {
    const subsetTransactions = transactions.filter(transaction => transaction[currentField] === groupValue);
    const childNodes = buildColumnTree(subsetTransactions, remainingFields, [...currentPath, groupValue]);
    const columnSpan = childNodes.length ? childNodes.reduce((sum, childNode) => sum + childNode.colSpan, 0) : 1;
    return { value: groupValue, fullPath: [...currentPath, groupValue], colSpan: columnSpan, children: childNodes };
  });
}

export function pivotData(
  transactions: Transaction[],
  rowField: GroupField,
  colFields: GroupField[]
): PivotResult {
  const rowValues = Array.from(new Set(transactions.map(t => t[rowField]))).sort(sortValues);

  const columnTree = buildColumnTree(transactions, colFields);

  const noCols = colFields.length === 0;
  const pivotMap: any = {};
  let totalMap: any = noCols ? 0 : {};

  for (const t of transactions) {
    const rowVal = t[rowField] as string | number;
    const amt = Number(t.amount) || 0;

    if (!pivotMap[rowVal]) pivotMap[rowVal] = noCols ? 0 : {};

    if (noCols) {
      pivotMap[rowVal] += amt;
      totalMap += amt;
      continue;
    }

    let node = pivotMap[rowVal];
    for (let i = 0; i < colFields.length - 1; i++) {
      const key = t[colFields[i]] as string | number;
      node[key] ??= {};
      node = node[key];
    }
    const lastKey = t[colFields[colFields.length - 1]] as string | number;
    node[lastKey] = (node[lastKey] ?? 0) + amt;

    let tnode = totalMap;
    for (let i = 0; i < colFields.length - 1; i++) {
      const key = t[colFields[i]] as string | number;
      tnode[key] ??= {};
      tnode = tnode[key];
    }
    tnode[lastKey] = (tnode[lastKey] ?? 0) + amt;
  }

  const leaves: ColumnNode[] = [];
  const collect = (nodes: ColumnNode[]) => {
    nodes.forEach(n => (n.children.length ? collect(n.children) : leaves.push(n)));
  };
  if (colFields.length) collect(columnTree);
  else leaves.push({ value: 'Total', fullPath: [], colSpan: 1, children: [] });

  return { rowValues, columnTree, leaves, pivotMap, totalMap };
}

export function getHeaderNodesAtDepth(nodes: ColumnNode[], depth: number): ColumnNode[] {
  if (depth === 0) return nodes;
  const res: ColumnNode[] = [];
  nodes.forEach(n => {
    if (n.children.length) res.push(...getHeaderNodesAtDepth(n.children, depth - 1));
  });
  return res;
}
