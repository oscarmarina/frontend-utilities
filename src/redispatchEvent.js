/**
 * Re-dispatches an event from the provided element.
 * @author @material/web
 * @see https://github.com/material-components/material-web/blob/main/internal/events/redispatch-event.ts
 *
 * @param {Element} element - The element to dispatch the event from.
 * @param {Event|CustomEvent} ev - The event to re-dispatch.
 * @param {Object} [options={}] - An object with properties to override in the new event.
 * @returns {boolean} - Whether or not the event was dispatched (if cancelable).
 */
export const redispatchEventFromEvent = (element, ev, options) => {
  // For bubbling events in SSR light DOM (or composed), stop their propagation and dispatch the copy.
  if (ev.bubbles && (!element.shadowRoot || ev.composed)) {
    ev.stopPropagation();
  }

  const {bubbles, cancelable, composed} = ev;
  const detail = ev instanceof CustomEvent ? ev.detail : null;

  const argumentsOptions = {composed, bubbles, cancelable, detail, ...options};
  const argumentsList = options ? [ev.type, {...ev, ...argumentsOptions}] : [ev.type, ev];

  const copy = Reflect.construct(ev.constructor, argumentsList);
  const dispatched = element.dispatchEvent(copy);

  if (!dispatched) {
    ev.preventDefault();
  }

  return dispatched;
};

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
