import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KES", locale: "en-KE" },
  { code: "USD", name: "US Dollar", symbol: "USD", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "EUR", locale: "en-EU" },
];

interface CurrencyContextValue {
  selectedCurrency: CurrencyOption;
  availableCurrencies: CurrencyOption[];
  setSelectedCurrency: (currency: CurrencyOption) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCY_OPTIONS[0]);

  const value = useMemo(
    () => ({
      selectedCurrency,
      availableCurrencies: CURRENCY_OPTIONS,
      setSelectedCurrency,
    }),
    [selectedCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrencyContext must be used within a CurrencyProvider");
  }
  return context;
};
