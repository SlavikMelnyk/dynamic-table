import React, { createContext, useMemo, useState } from 'react';
import type { GroupField, Transaction } from '../types';

interface PivotState {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  rowGroup: GroupField;
  colGroups: GroupField[];
  setRowGroup: React.Dispatch<React.SetStateAction<GroupField>>;
  setColGroups: React.Dispatch<React.SetStateAction<GroupField[]>>;
  GROUP_FIELDS: readonly GroupField[];
}

export const PivotContext = createContext<PivotState>({} as PivotState);

const GROUP_FIELDS: readonly GroupField[] = ['transaction_type', 'status', 'year'] as const;

export const PivotProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rowGroup, setRowGroup] = useState<GroupField>('transaction_type');
  const [colGroups, setColGroups] = useState<GroupField[]>(['year']);


  const value = useMemo(
    () => ({ transactions, setTransactions, rowGroup, colGroups, setRowGroup, setColGroups, GROUP_FIELDS }),
    [transactions, rowGroup, colGroups]
  );

  return (
    <PivotContext.Provider value={value}>
      {children}
    </PivotContext.Provider>
  );
};
