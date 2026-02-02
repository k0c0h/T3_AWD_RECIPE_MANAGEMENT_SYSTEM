export const formatNumber = (value, decimals = 2) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value ?? '';
  return numberValue.toFixed(decimals);
};

export const formatCurrency = (value, currency = '$', decimals = 2) => {
  const numberValue = Number(value) || 0;
  return `${currency}${numberValue.toFixed(decimals)}`;
};

export default { formatNumber, formatCurrency };
