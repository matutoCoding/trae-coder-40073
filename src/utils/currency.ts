export const formatCurrency = (value: number, currency: string = '¥', decimals: number = 2): string => {
  if (isNaN(value)) return `${currency}0.00`;
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${currency}${formatted}`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0';
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0%';
  const percent = value * 100;
  return `${percent.toFixed(decimals)}%`;
};
