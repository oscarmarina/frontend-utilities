/**
 * Checks if an element is focusable. An element is considered focusable if it matches
 * standard focusable elements criteria (such as buttons, inputs, etc., that are not disabled
 * and do not have a negative tabindex) or is a custom element with a shadow root that delegates focus.
 *
 * @param {Element} element - The DOM element to check for focusability.
 * @returns {boolean} True if the element is focusable, false otherwise.
 */
export const isFocusable = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  // https://stackoverflow.com/a/30753870/76472
  const knownFocusableElements = `a[href],area[href],button:not([disabled]),details,iframe,object,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contentEditable="true"],[tabindex]:not([tabindex^="-"]),audio[controls],video[controls]`;

  if (element.matches(knownFocusableElements)) {
    return true;
  }

  const isDisabledCustomElement =
    element.localName.includes('-') && element.matches('[disabled], [aria-disabled="true"]');
  if (isDisabledCustomElement) {
    return false;
  }
  return /** @type {ShadowRoot | *} */ (element.shadowRoot)?.delegatesFocus ?? false;
};
