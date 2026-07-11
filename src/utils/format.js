export const currency = (value = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

export const number = (value = 0) => new Intl.NumberFormat('en-US').format(value);

export const date = (value) =>
  value ? new Intl.DateTimeFormat('ar-LY', { dateStyle: 'medium' }).format(new Date(value)) : '-';

export const datetime = (value) =>
  value ? new Intl.DateTimeFormat('ar-LY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
