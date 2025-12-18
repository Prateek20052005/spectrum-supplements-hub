/**
 * Format a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹1,234")
 */
export const formatINR = (amount: unknown): string => {
  let value: number;

  if (typeof amount === "number") {
    value = amount;
  } else if (typeof amount === "string") {
    const normalized = amount.replace(/[₹$,\s]/g, "").replace(/,/g, "");
    value = Number.parseFloat(normalized);
  } else {
    value = Number(amount);
  }

  if (!Number.isFinite(value)) {
    value = 0;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(value);
};

/**
 * Format a number as Indian Rupees (INR) without the currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234")
 */
export const formatNumberINR = (amount: unknown): string => {
  const value = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};
