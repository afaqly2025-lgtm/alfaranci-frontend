const labels = {
  New: 'جديدة',
  'Partially Collected': 'محصلة جزئياً',
  'Fully Collected': 'محصلة بالكامل',
  Overdue: 'متأخرة',
  Active: 'فعال',
  Suspended: 'موقوف'
};

export const statusLabel = (status) => labels[status] || status || '-';
