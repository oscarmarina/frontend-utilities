/**
 * Determines if an element should be ignored by a screen reader.
 * @param {Element} element - The DOM element to check.
 * @param {Array} [exceptions=['dialog', '[popover]']] - Array of Elements to ignore when checking the element.
 * @returns {boolean} True if the element should be ignored by a screen reader, false otherwise.
 */
export const isElementInvisible = (element, exceptions = ['dialog', '[popover]']) => {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  if (element.matches(exceptions.join(','))) {
    return false;
  }

  const {display, visibility, opacity} = window.getComputedStyle(element);
  const isStyleHidden =
    display === 'none' || visibility === 'hidden' || visibility === 'collapse' || opacity === '0';
  const isAttributeHidden = element.matches('[disabled], [hidden], [inert], [aria-hidden="true"]');

  return isStyleHidden || isAttributeHidden;
};
