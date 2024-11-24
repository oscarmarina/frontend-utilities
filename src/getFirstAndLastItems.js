/**
 * Retrieves the first and last children of a node using a TreeWalker.
 *
 * @param {IterableIterator<HTMLElement>} walker - The TreeWalker object used to traverse the node's children.
 * @returns {[first: HTMLElement|null, last: HTMLElement|null]} An array containing the first and last children. If no children are found, `null` is returned for both.
 */
export const getFirstAndLastItems = (walker) => {
  let firstFocusableChild = null;
  let lastFocusableChild = null;

  for (const currentNode of walker) {
    if (!firstFocusableChild) {
      firstFocusableChild = currentNode;
    }
    lastFocusableChild = currentNode;
  }

  return [firstFocusableChild, lastFocusableChild];
};
