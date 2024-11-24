/**
 * Traverse the composed tree from the root, selecting elements that meet the provided filter criteria.
 * You can pass [NodeFilter](https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter) or 0 to retrieve all nodes.
 *
 * @param {Object} options - The options object.
 * @param {Node} options.node - The root node for traversal. **Required**.
 * @param {number} [options.whatToShow=0] - NodeFilter code for node types to include. Defaults to `0`, which selects all node types.
 * @param {function} [options.filterAccept=(node: Node) => true] - Filters nodes. Child nodes are considered even if the parent does not satisfy the filter. Defaults to a function that always returns `true`.
 * @param {function} [options.filterReject=(node: Node) => false] - Filters nodes to reject. Any node in the subtree based at this node is not included. Defaults to a function that always returns `false`.
 * @returns {IterableIterator<Node>} An iterator yielding nodes meeting the filter criteria.
 */
export function* walkComposedTree({
  node,
  whatToShow = 0,
  filterAccept = () => true,
  filterReject = () => false,
}) {
  if ((whatToShow && node.nodeType !== whatToShow) || filterReject(node)) {
    return;
  }

  if (filterAccept(node)) {
    yield node;
  }

  const children =
    node instanceof HTMLElement && node.shadowRoot
      ? node.shadowRoot.children
      : node instanceof HTMLSlotElement
        ? node.assignedNodes({flatten: true})
        : node.childNodes;

  for (const child of children) {
    yield* walkComposedTree({node: child, whatToShow, filterAccept, filterReject});
  }
}
