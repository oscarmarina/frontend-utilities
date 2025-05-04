function* E(e) {
  for (let t = e; t; ) {
    const s = t instanceof HTMLElement && t.assignedSlot ? t.assignedSlot : t instanceof ShadowRoot ? t.host : t.parentNode;
    s && (yield s), t = s;
  }
}
const g = (e, t) => {
  let s = t;
  for (; s; ) {
    const n = s.assignedSlot || s.parentNode || s.host;
    if (n === e)
      return !0;
    s = n;
  }
  return !1;
}, u = (e = document) => {
  const t = e == null ? void 0 : e.activeElement;
  return t ? t.shadowRoot ? u(t.shadowRoot) ?? t : t : document.body;
}, y = (e) => {
  let t = null, s = null;
  for (const n of e)
    t || (t = n), s = n;
  return [t, s];
}, p = (e) => (e || "").replace(/<!--[\s\S]*?-->/g, ""), m = (e) => p(e).replace(/\s\s+/g, ""), d = (e, t) => {
  ((e == null ? void 0 : e.nodeType) === 1 || (e == null ? void 0 : e.nodeType) === 11) && Array.isArray(t) && (e.nodeType === 1 && t.forEach(
    (s) => (
      /** @type {HTMLElement} */
      e.removeAttribute(s)
    )
  ), [...e.childNodes].forEach((s) => d(s, t)));
}, w = (e, t = []) => {
  const s = e instanceof HTMLElement, n = e instanceof ShadowRoot;
  if (s || n) {
    t.length > 0 && d(e, t);
    const i = n ? e.innerHTML : e.outerHTML;
    return m(i);
  }
  return "";
}, T = (e, t) => {
  const { top: s, left: n, height: i, width: o } = e, { clientX: a, clientY: c } = t;
  return c >= s && c <= s + i && a >= n && a <= n + o;
}, C = (e, t = ["dialog", "[popover]"]) => {
  if (!e || !(e instanceof HTMLElement) || e.matches(t.join(",")))
    return !1;
  const { display: s, visibility: n, opacity: i } = window.getComputedStyle(e), o = s === "none" || n === "hidden" || n === "collapse" || i === "0", a = e.matches('[disabled], [hidden], [inert], [aria-hidden="true"]');
  return o || a;
}, L = (e) => {
  var n;
  return e instanceof HTMLElement ? e.matches('a[href],area[href],button:not([disabled]),details,iframe,object,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contentEditable="true"],[tabindex]:not([tabindex^="-"]),audio[controls],video[controls]') ? !0 : e.localName.includes("-") && e.matches('[disabled], [aria-disabled="true"]') ? !1 : (
    /** @type {ShadowRoot | *} */
    ((n = e.shadowRoot) == null ? void 0 : n.delegatesFocus) ?? !1
  ) : !1;
};
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class M {
  /**
   * @param {number} [capacity=10] - The maximum number of entries allowed in the map.
   */
  constructor(t = 10) {
    this.capacity = t, this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {*} key - The key to test for presence in the map.
   * @returns {boolean} Whether the key exists.
   */
  has(t) {
    return this.reinsertIfPresent(t), this.map.has(t);
  }
  /**
   * @param {*} key - The key whose value to retrieve.
   * @returns {*|undefined} The stored value, or `undefined` if not found.
   */
  get(t) {
    return this.reinsertIfPresent(t), this.map.get(t);
  }
  /**
   * @param {*} key - The key to set.
   * @param {*} value - The value to associate with the key.
   */
  set(t, s) {
    if (this.delete(t), this.map.set(t, s), this.map.size > this.capacity) {
      const [n] = this.map.keys();
      this.map.delete(n);
    }
  }
  /**
   * @param {*} key - The key to remove.
   */
  delete(t) {
    this.map.has(t) && this.map.delete(t);
  }
  /**
   * @param {*} key - The key of the entry to reinsert as most recently used.
   */
  reinsertIfPresent(t) {
    if (this.map.has(t)) {
      const s = this.map.get(t);
      this.map.delete(t), this.map.set(t, s);
    }
  }
}
const R = (e = 10) => Math.random().toString(36).substring(2, e), r = (e, t, s) => {
  t.bubbles && (!e.shadowRoot || t.composed) && t.stopPropagation();
  const { bubbles: n, cancelable: i, composed: o } = t, a = t instanceof CustomEvent ? t.detail : null, c = { composed: o, bubbles: n, cancelable: i, detail: a, ...s }, f = s ? [t.type, { ...t, ...c }] : [t.type, t], h = Reflect.construct(t.constructor, f), l = e.dispatchEvent(h);
  return l || t.preventDefault(), l;
}, H = (e, t, s) => {
  if (typeof t == "string") {
    const n = t, i = new CustomEvent(n);
    return r(e, i, s);
  }
  return r(e, t, s);
}, S = (e) => {
  const t = typeof e == "string" ? new URL(e) : e, s = {};
  for (const n in t)
    typeof t[n] == "string" && (s[n] = t[n]);
  return s;
};
function* b({
  root: e,
  whatToShow: t = 0,
  filterAccept: s = () => !0,
  filterReject: n = () => !1
}) {
  if (t && e.nodeType !== t || n(e))
    return;
  s(e) && (yield e);
  const i = e instanceof HTMLElement && e.shadowRoot ? e.shadowRoot.children : e instanceof HTMLSlotElement ? e.assignedNodes({ flatten: !0 }) : e.childNodes;
  for (const o of i)
    yield* b({ root: o, whatToShow: t, filterAccept: s, filterReject: n });
}
export {
  M as LRUMap,
  E as composedAncestors,
  g as deepContains,
  u as getDeepActiveElement,
  y as getFirstAndLastItems,
  w as htmlStructureSnapshot,
  T as isClickInsideRect,
  C as isElementInvisible,
  L as isFocusable,
  R as randomID,
  H as redispatchEvent,
  r as redispatchEventFromEvent,
  S as urlToPlainObject,
  b as walkComposedTree
};
