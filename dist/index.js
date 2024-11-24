function* E(t) {
  for (let e = t; e; ) {
    const n = e instanceof HTMLElement && e.assignedSlot ? e.assignedSlot : e instanceof ShadowRoot ? e.host : e.parentNode;
    n && (yield n), e = n;
  }
}
const y = (t, e) => {
  let n = e;
  for (; n; ) {
    const s = n.assignedSlot || n.parentNode || n.host;
    if (s === t)
      return !0;
    n = s;
  }
  return !1;
}, h = (t = document) => {
  const e = t == null ? void 0 : t.activeElement;
  return e ? e.shadowRoot ? h(e.shadowRoot) ?? e : e : document.body;
}, g = (t) => {
  let e = null, n = null;
  for (const s of t)
    e || (e = s), n = s;
  return [e, n];
}, m = (t) => (t || "").replace(/<!--[\s\S]*?-->/g, ""), p = (t) => m(t).replace(/\s\s+/g, ""), d = (t, e) => {
  ((t == null ? void 0 : t.nodeType) === 1 || (t == null ? void 0 : t.nodeType) === 11) && Array.isArray(e) && (t.nodeType === 1 && e.forEach(
    (n) => (
      /** @type {HTMLElement} */
      t.removeAttribute(n)
    )
  ), [...t.childNodes].forEach((n) => d(n, e)));
}, w = (t, e = []) => {
  const n = t instanceof HTMLElement, s = t instanceof ShadowRoot;
  if (n || s) {
    e.length > 0 && d(t, e);
    const o = s ? t.innerHTML : t.outerHTML;
    return p(o);
  }
  return "";
}, T = (t, e) => {
  const { top: n, left: s, height: o, width: i } = t, { clientX: a, clientY: c } = e;
  return c >= n && c <= n + o && a >= s && a <= s + i;
}, C = (t, e = ["dialog", "[popover]"]) => {
  if (!t || !(t instanceof HTMLElement) || t.matches(e.join(",")))
    return !1;
  const { display: n, visibility: s, opacity: o } = window.getComputedStyle(t), i = n === "none" || s === "hidden" || s === "collapse" || o === "0", a = t.matches('[disabled], [hidden], [inert], [aria-hidden="true"]');
  return i || a;
}, L = (t) => {
  var s;
  return t instanceof HTMLElement ? t.matches('a[href],area[href],button:not([disabled]),details,iframe,object,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contentEditable="true"],[tabindex]:not([tabindex^="-"]),audio[controls],video[controls]') ? !0 : t.localName.includes("-") && t.matches('[disabled], [aria-disabled="true"]') ? !1 : (
    /** @type {ShadowRoot | *} */
    ((s = t.shadowRoot) == null ? void 0 : s.delegatesFocus) ?? !1
  ) : !1;
}, H = (t = 10) => Math.random().toString(36).substring(2, t), r = (t, e, n) => {
  e.bubbles && (!t.shadowRoot || e.composed) && e.stopPropagation();
  const { bubbles: s, cancelable: o, composed: i } = e, a = e instanceof CustomEvent ? e.detail : null, c = { composed: i, bubbles: s, cancelable: o, detail: a, ...n }, f = n ? [e.type, { ...e, ...c }] : [e.type, e], u = Reflect.construct(e.constructor, f), l = t.dispatchEvent(u);
  return l || e.preventDefault(), l;
}, R = (t, e, n) => {
  if (typeof e == "string") {
    const s = e, o = new CustomEvent(s);
    return r(t, o, n);
  }
  return r(t, e, n);
}, S = (t) => {
  const e = typeof t == "string" ? new URL(t) : t, n = {};
  for (const s in e)
    typeof e[s] == "string" && (n[s] = e[s]);
  return n;
};
function* b({
  node: t,
  whatToShow: e = 0,
  filterAccept: n = () => !0,
  filterReject: s = () => !1
}) {
  if (e && t.nodeType !== e || s(t))
    return;
  n(t) && (yield t);
  const o = t instanceof HTMLElement && t.shadowRoot ? t.shadowRoot.children : t instanceof HTMLSlotElement ? t.assignedNodes({ flatten: !0 }) : t.childNodes;
  for (const i of o)
    yield* b({ node: i, whatToShow: e, filterAccept: n, filterReject: s });
}
export {
  E as composedAncestors,
  y as deepContains,
  h as getDeepActiveElement,
  g as getFirstAndLastItems,
  w as htmlStructureSnapshot,
  T as isClickInsideRect,
  C as isElementInvisible,
  L as isFocusable,
  H as randomID,
  R as redispatchEvent,
  r as redispatchEventFromEvent,
  S as urlToPlainObject,
  b as walkComposedTree
};
