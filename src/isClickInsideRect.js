/**
 * Checks if a click event occurred inside a given bounding rectangle.
 *
 * @param {DOMRect} rect - The bounding rectangle, typically obtained from `element.getBoundingClientRect()`.
 * @param {PointerEvent} ev - The click event.
 * @returns {boolean} True if the click occurred inside the rectangle, false otherwise.
 */
export const isClickInsideRect = (rect, ev) => {
  const {top, left, height, width} = rect;
  const {clientX, clientY} = ev;
  return clientY >= top && clientY <= top + height && clientX >= left && clientX <= left + width;
};
