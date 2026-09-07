export const DEFAULT_CURRENCY = "ZMW";

export const formatMoney = (amount: number, currency = DEFAULT_CURRENCY) => {
  try {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: currency || DEFAULT_CURRENCY,
    }).format(amount);
  } catch {
    const code = currency || DEFAULT_CURRENCY;
    const prefix = code === "ZMW" ? "K" : `${code} `;
    return `${prefix}${amount.toFixed(2)}`;
  }
};
