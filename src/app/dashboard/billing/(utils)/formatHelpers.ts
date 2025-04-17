// Format date to M-D-YY
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() is 0-based
  const day = date.getDate();
  const year = date.getFullYear().toString().substr(-2); // Get last 2 digits
  return `${month}-${day}-${year}`;
}; 