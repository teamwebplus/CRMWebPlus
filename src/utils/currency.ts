export const formatCurrency = (amount: number, currency: string = 'PHP') => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-PH').format(value);
};

export const parseCurrency = (value: string) => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};