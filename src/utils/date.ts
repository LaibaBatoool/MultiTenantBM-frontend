export const formatDate = (date: string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};