/**
 * Return the ancestors of the given node in the composed tree.
 *
 * In the composed tree, the ancestor of a node assigned to a slot is that slot,
 * not the node's DOM ancestor. The ancestor of a shadow root is its host.
 *
 * @author Jan Miksovsky
 * @see https://github.com/JanMiksovsky/elix/blob/main/src/core/dom.js
 *
 * @param {Node} node
 * @returns {Iterable<Node>}
 */
export function* composedAncestors(node) {
  for (let /** @type {Node|null} */ current = node; current; ) {
    const next =
      current instanceof HTMLElement && current.assignedSlot
        ? current.assignedSlot
        : current instanceof ShadowRoot
          ? current.host
          : current.parentNode;
    if (next) {
      yield next;
    }
    current = next;
  }
}
