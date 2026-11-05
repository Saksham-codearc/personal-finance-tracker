import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [transactionModal, setTransactionModal] = useState({
    open: false,
    transaction: null,
  });
  const [dataVersion, setDataVersion] = useState(0);

  const openTransactionModal = useCallback((transaction = null) => {
    setTransactionModal({ open: true, transaction });
  }, []);

  const closeTransactionModal = useCallback(() => {
    setTransactionModal((current) => ({ ...current, open: false }));
  }, []);

  const notifyDataChanged = useCallback(() => {
    setDataVersion((version) => version + 1);
  }, []);

  const value = useMemo(
    () => ({
      transactionModal,
      openTransactionModal,
      closeTransactionModal,
      dataVersion,
      notifyDataChanged,
    }),
    [transactionModal, openTransactionModal, closeTransactionModal, dataVersion, notifyDataChanged]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used inside a UIProvider');
  return context;
}
