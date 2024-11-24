/**
 * Returns the deepest active element, considering Shadow DOM subtrees
 * @param {Document | ShadowRoot} root - The root element to start the search from.
 * @returns {Element} The deepest active element or body element if no active element is found.
 */
export const getDeepActiveElement = (root = document) => {
  const activeEl = root?.activeElement;
  if (activeEl) {
    if (activeEl.shadowRoot) {
      return getDeepActiveElement(activeEl.shadowRoot) ?? activeEl;
    }
    return activeEl;
  }
  return document.body;
};
