import React, { useContext, useEffect } from 'react';
import { PivotContext, PivotProvider } from './context/PivotContext';
import GroupingSelector from './components/GroupingSelector';
import Table from './components/Table';
import type { RawTransaction, Transaction } from './types';

const AppContent: React.FC = () => {
  const { setTransactions } = useContext(PivotContext);

  const fetchTransactions = async () => {
    const response = await fetch('/transactions.json');
    const raw: RawTransaction[] = await response.json();
    const mapped: Transaction[] = raw.map((record: RawTransaction) => ({
      ...record,
      amount: Number.parseFloat(record.amount),
    }));
    setTransactions(mapped);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="container mx-auto p-4 mt-20">
      <GroupingSelector />
      <Table />
    </div>
  );
};

const App: React.FC = () => (
  <PivotProvider>
    <AppContent />
  </PivotProvider>
);

export default App;