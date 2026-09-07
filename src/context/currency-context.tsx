import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, formatMoney } from "@/lib/money";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale?: string;
}

const CURRENCY_STORAGE_KEY = "printa_currency_preference_v1";

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
  setSelectedCurrencyCode: (code: string) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const resolveCurrency = (code?: string | null) =>
  CURRENCY_OPTIONS.find((currency) => currency.code === code) ?? CURRENCY_OPTIONS[0];

const loadPersistedCurrency = () => {
  if (typeof window === "undefined") return CURRENCY_OPTIONS[0];
  return resolveCurrency(localStorage.getItem(CURRENCY_STORAGE_KEY));
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyOption>(loadPersistedCurrency);

  const setSelectedCurrency = useCallback((currency: CurrencyOption) => {
    const resolved = resolveCurrency(currency.code);
    setSelectedCurrencyState(resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, resolved.code);
    }
  }, []);

  const setSelectedCurrencyCode = useCallback((code: string) => {
    setSelectedCurrency(resolveCurrency(code));
  }, [setSelectedCurrency]);

  const value = useMemo(
    () => ({
      selectedCurrency,
      availableCurrencies: CURRENCY_OPTIONS,
      setSelectedCurrency,
      setSelectedCurrencyCode,
      formatCurrency: (amount: number, currency?: string) => formatMoney(amount, currency ?? selectedCurrency.code),
    }),
    [selectedCurrency, setSelectedCurrency, setSelectedCurrencyCode]
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
