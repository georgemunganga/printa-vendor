import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, formatMoney } from "@/lib/money";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: DEFAULT_CURRENCY, name: "Zambian Kwacha", symbol: "K", locale: "en-ZM" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KES", locale: "en-KE" },
  { code: "USD", name: "US Dollar", symbol: "USD", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "EUR", locale: "en-EU" },
];

interface CurrencyContextValue {
  selectedCurrency: CurrencyOption;
  availableCurrencies: CurrencyOption[];
  setSelectedCurrency: (currency: CurrencyOption) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCY_OPTIONS[0]);

  const value = useMemo(
    () => ({
      selectedCurrency,
      availableCurrencies: CURRENCY_OPTIONS,
      setSelectedCurrency,
      formatCurrency: (amount: number, currency?: string) => formatMoney(amount, currency ?? selectedCurrency.code),
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
