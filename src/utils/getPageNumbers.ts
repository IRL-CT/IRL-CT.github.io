/**
 * Creates an array of page numbers from 1 to the total number of pages.
 * @param {number} totalPages - The total number of pages
 * @returns {number[]} - Array of page numbers
 */
export default function getPageNumbers(totalPages: number) {
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
}