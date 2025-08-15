export const currentMonth = () => {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}`;
};
