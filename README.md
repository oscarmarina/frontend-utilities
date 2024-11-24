# Utilities for managing the DOM, handling events, and performing various common tasks in frontend development.

This repository provides a set of utility functions designed to facilitate DOM manipulation, event handling, and other common tasks in frontend development. These functions address various needs such as re-dispatching events, checking element visibility, and traversing the DOM tree.

## Table of Contents

- [_Re-dispatch Event Functions_](#re-dispatch-event-functions)
  - [redispatchEvent](#redispatchevent)
- [_Element Visibility and Focus Functions_](#element-visibility-and-focus-functions)
  - [isElementInvisible](#iselementinvisible)
  - [isFocusable](#isfocusable)
- [_DOM Traversal Functions_](#dom-traversal-functions)
  - [walkComposedTree](#walkcomposedtree)
    - [getFirstAndLastItems](#getfirstandlastitems)
  - [getDeepActiveElement](#getdeepactiveelement)
  - [deepContains](#deepcontains)
  - [composedAncestors](#composedancestors)
- [_Event Handling Functions_](#event-handling-functions)
  - [isClickInsideRect](#isclickinsiderect)
- [_Snapshots Functions_](#snapshots-functions)
  - [htmlStructureSnapshot](#htmlstructuresnapshot)
- [_Miscellaneous Functions_](#miscellaneous-functions)
  - [randomID](#randomid)
  - [urlToPlainObject](#urltoplainobject)

## Re-dispatch Event Functions

### `redispatchEvent`

```js
/**
 * Re-dispatches an event from the provided element.
 *
 * This function is useful for forwarding non-composed events, such as `change`
 * events.
 *
 * @example
 * class MyInput extends LitElement {
 *   render() {
 *     return html`<input @change=${this.redispatchEvent}>`;
 *   }
 *
 *   protected redispatchEvent(event: Event) {
 *     redispatchEvent(this, event);
 *   }
 * }
 *
 * @example
 * class MyDialog extends LitElement {
 *   render() {
 *     return html`<dialog @close=${this.redispatchEvent}>...</dialog>`;
 *   }
 *
 *   protected redispatchEvent(ev: Event) {
 *     redispatchEvent(this, ev, { cancelable: true });
 *   }
 * }
 *
 * @param {Element} element - The element to dispatch the event from.
 * @param {Event|string} ev - The event to re-dispatch. If it's a string, a new Event is created.
 * @param {Object} [options={}] - An object with properties to override in the new event.
 * @returns {boolean} - Whether or not the event was dispatched (if cancelable).
 */
export const redispatchEvent = (element, ev, options) => {
  if (typeof ev === 'string') {
    const eventType = ev;
    const newEvent = new CustomEvent(eventType);
    return redispatchEventFromEvent(element, newEvent, options);
  }
  return redispatchEventFromEvent(element, ev, options);
};
```

## Element Visibility and Focus Functions

### `isElementInvisible`

```js
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
```

### `isFocusable`

```js
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
```

## DOM Traversal Functions

### `walkComposedTree`

```js
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
```

### `getFirstAndLastItems`

```js
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
```

### `getDeepActiveElement`

```js
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
```

### `deepContains`

```js
/**
 * Returns true if the first node contains the second, even if the second node
 * is in a shadow tree.
 *
 * The standard Node.contains() function does not account for Shadow DOM, and
 * returns false if the supplied target node is sitting inside a shadow tree
 * within the container.
 *
 * @param {Node} container - The container to search within.
 * @param {Node} target - The node that may be inside the container.
 * @returns {boolean} - True if the container contains the target node.
 */
export const deepContains = (container, target) => {
  /** @type {any} */
  let current = target;
  while (current) {
    const parent = current.assignedSlot || current.parentNode || current.host;
    if (parent === container) {
      return true;
    }
    current = parent;
  }
  return false;
};
```

### `composedAncestors`

```js
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
```

## Event Handling Functions

### `isClickInsideRect`

```js
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
```

## Snapshots Functions

### `htmlStructureSnapshot`

```js
/**
 * Returns the outerHTML or innerHTML of a node after removing specified attributes from it and its children.
 *
 * If the initial node is an HTMLElement, the function returns the outerHTML of the node.
 * If the initial node is a ShadowRoot, the function returns the innerHTML of the node.
 *
 * @param {Node} node - The initial node.
 * @param {string[]} [ignoreAttributes=[]] - An optional array of strings representing attributes to ignore.
 * @returns {string} The outerHTML or innerHTML of the node after removing the specified attributes.
 */
export const htmlStructureSnapshot = (node, ignoreAttributes = []) => {
  const isHTMLElement = node instanceof HTMLElement;
  const isShadowRoot = node instanceof ShadowRoot;

  if (isHTMLElement || isShadowRoot) {
    if (ignoreAttributes.length > 0) {
      removeAttributes(node, ignoreAttributes);
    }

    const htmlContent = isShadowRoot ? node.innerHTML : node.outerHTML;
    return removeCommentsAndFormat(htmlContent);
  }
  return '';
};
```

## Miscellaneous Functions

### `randomID`

```js
/**
 * Generates a random alphanumeric string of a specified length.
 *
 * @param {number} [length=10] - The length of the random string to generate. Default is 10.
 * @returns {string} A random alphanumeric string of the specified length.
 */
export const randomID = (length = 10) => Math.random().toString(36).substring(2, length);
```

### `urlToPlainObject`

```js
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
```

---

## Author Information

- Original Authors: _@material/web, Jan Miksovsky, Cory LaViska_

---

**Scaffold generated using**:

> [npm init @blockquote/wc](https://github.com/oscarmarina/create-wc)
