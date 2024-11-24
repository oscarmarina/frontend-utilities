/**
 * Generates a random alphanumeric string of a specified length.
 *
 * @param {number} [length=10] - The length of the random string to generate. Default is 10.
 * @returns {string} A random alphanumeric string of the specified length.
 */
export const randomID = (length = 10) => Math.random().toString(36).substring(2, length);
