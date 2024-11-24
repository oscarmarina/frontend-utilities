/**
 * Converts a URL object to a plain object.
 *
 * @author Cory LaViska
 * @see https://www.abeautifulsite.net/posts/converting-a-url-object-to-a-plain-object-in-java-script
 *
 * @param {URL|string} url - The URL object to parse.
 * @returns {Object} An object representing the parsed URL.
 */
export const urlToPlainObject = (url) => {
  const urlObject = typeof url === 'string' ? new URL(url) : url;
  const plainObject = {};

  for (const key in urlObject) {
    if (typeof urlObject[key] === 'string') {
      plainObject[key] = urlObject[key];
    }
  }
  return plainObject;
};
