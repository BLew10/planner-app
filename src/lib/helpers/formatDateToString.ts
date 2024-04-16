/**
 * Formats a JavaScript Date object into a string in MM-DD-YYYY format.
 *
 * This function takes a Date object as input and returns a string representing
 * the date in the format of "MM-DD-YYYY". It first converts the Date object into
 * an ISO string format ("YYYY-MM-DDTHH:MM:SS.sssZ"), then splits this string to
 * extract the date part before reformatting it.
 *
 * @param {Date} date - The Date object to be formatted.
 * @returns {string} The formatted date string in "MM-DD-YYYY" format.
 *
 * Example usage:
 * const myDate = new Date(2024, 3, 10); // April 10, 2024
 * const formattedDate = formatDateToString(myDate);
 * console.log(formattedDate); // "04-10-2024"
 * Ensures the date is the same date when used with new Date().toDateString()
 */
export const formatDateToString = (date: Date): string => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  const [year, month, day] = localDate.toISOString().split("T")[0].split("-");
  const newDateFormat = `${month}-${day}-${year}`;
  return newDateFormat;
};
