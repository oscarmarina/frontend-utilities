import {beforeAll, afterAll, afterEach, suite, test, assert, expect, vi} from 'vitest';
import {fixture, fixtureCleanup} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {
  composedAncestors,
  deepContains,
  getDeepActiveElement,
  getFirstAndLastItems,
  htmlStructureSnapshot,
  isClickInsideRect,
  isElementInvisible,
  isFocusable,
  randomID,
  redispatchEvent,
  urlToPlainObject,
  walkComposedTree,
  LRUMap,
} from '../src/index.js';

class WrapperElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open', delegatesFocus: false});
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }
}

customElements.define('wrapper-element', WrapperElement);

class WrapperElementDelegate extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open', delegatesFocus: true});
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }
}

customElements.define('wrapper-element-delegate', WrapperElementDelegate);

class HtmlStructure extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open', delegatesFocus: true});
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
      <h1>
        Hello
        <span>!</span>
      </h1>
      <hr />
      <slot></slot>`;
    }
  }
}

customElements.define('html-structure', HtmlStructure);

suite('dom-utilities', () => {
  let element;

  afterAll(() => {
    fixtureCleanup();
  });

  suite('redispatchEvent', () => {
    beforeAll(async () => {
      element = await fixture(html`
        <div></div>
      `);
    });

    afterEach(() => fixtureCleanup());

    test('should pass and override event options', () => {
      const spy = vi.fn();
      const eventFoo = new Event('foo', {bubbles: true});
      element?.addEventListener('foo', spy);
      redispatchEvent(element, eventFoo, {cancelable: true});
      expect(spy.mock.calls[0][0].cancelable).toBe(true);
    });

    test('dispatched', () => {
      const spy = vi.fn();
      element?.addEventListener('test', spy);
      redispatchEvent(element, new Event('test'));
      expect(spy).toHaveBeenCalled();
    });

    test('should return true if the event as string was dispatched', () => {
      const spy = vi.fn();
      element?.addEventListener('test-string', spy);
      redispatchEvent(element, 'test-string');
      expect(spy).toHaveBeenCalled();
    });

    test('should not call the event listener if a different event is dispatched', () => {
      const spy = vi.fn();
      element?.addEventListener('test', spy);
      redispatchEvent(element, new Event('fail'));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  suite('isElementInvisible', () => {
    afterEach(() => fixtureCleanup());
    test('should return true if the element should be ignored', async () => {
      const el = await fixture(html`
        <div aria-hidden="true"></div>
      `);
      const isIgnored = isElementInvisible(el);
      assert.isTrue(isIgnored);
    });

    test('should return false if the element is in the exceptions array', async () => {
      const el = await fixture(html`
        <dialog></dialog>
      `);
      const isIgnored = isElementInvisible(el);
      assert.isFalse(isIgnored);
    });

    test('should return false if the element should not be ignored', async () => {
      const el = await fixture(html`
        <div></div>
      `);
      const isIgnored = isElementInvisible(el);
      assert.isFalse(isIgnored);
    });

    test('should return false if the element does not exist/HTMLElement', async () => {
      const fragment = document.createDocumentFragment();
      const el = await fixture(html`
        ${fragment}
      `);
      const isIgnored = isElementInvisible(el);
      assert.isFalse(isIgnored);
    });
  });

  suite('isFocusable', () => {
    afterEach(() => fixtureCleanup());
    test('should return true if the element is focusable', async () => {
      const el = await fixture(html`
        <button>isFocusable</button>
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isTrue(isElemenFocusable);
    });

    test('should return false if the element does not exist/HTMLElement', async () => {
      const fragment = document.createDocumentFragment();
      const el = await fixture(html`
        ${fragment}
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isFalse(isElemenFocusable);
    });

    test('should return false if the custom element is disabled', async () => {
      const el = await fixture(html`
        <wrapper-element disabled>isFocusable</wrapper-element>
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isFalse(isElemenFocusable);
    });

    test('should return false if the custom element is not delegatesFocus', async () => {
      const el = await fixture(html`
        <wrapper-element>isFocusable</wrapper-element>
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isFalse(isElemenFocusable);
    });

    test('should return false if the custom element is delegatesFocus', async () => {
      const el = await fixture(html`
        <wrapper-element-delegate>isFocusable</wrapper-element-delegate>
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isTrue(isElemenFocusable);
    });

    test('should return false if the custom element shadoRoot is undefined ', async () => {
      const el = await fixture(html`
        <wrapper-element-custom>isFocusable</wrapper-element-custom>
      `);
      const isElemenFocusable = isFocusable(el);
      assert.isFalse(isElemenFocusable);
    });
  });

  suite('walkComposedTree', () => {
    afterEach(() => fixtureCleanup());
    function createTree() {
      const el = document.createElement('div');
      const child = document.createElement('span');
      el.appendChild(child);
      return {el, child};
    }

    test('should yield children of HTMLElement with shadowRoot', () => {
      const {el, child} = createTree();
      el.attachShadow({mode: 'open'});
      el.shadowRoot?.appendChild(child);
      const children = [...walkComposedTree({root: el, whatToShow: NodeFilter.SHOW_ELEMENT})];
      assert.deepEqual(children, [el, child]);
    });

    test('should yield assigned nodes of HTMLSlotElement', () => {
      const host = document.createElement('div');
      const slot = document.createElement('slot');
      const assignedNode = document.createElement('div');
      host.attachShadow({mode: 'open'});
      host.shadowRoot?.appendChild(slot);
      host.appendChild(assignedNode);
      const children = [...walkComposedTree({root: slot, whatToShow: NodeFilter.SHOW_ELEMENT})];
      assert.deepEqual(children, [slot, assignedNode]);
    });

    test('should yield childNodes of other nodes', () => {
      const {el, child} = createTree();
      const children = [...walkComposedTree({root: el, whatToShow: NodeFilter.SHOW_ELEMENT})];
      assert.deepEqual(children, [el, child]);
    });

    test('should not yield children ignored by filterAccept or filterReject', () => {
      const {el, child} = createTree();
      const childrenFilterAccept = [
        ...walkComposedTree({
          root: el,
          whatToShow: NodeFilter.SHOW_ELEMENT,
          filterAccept: (node) => node !== child,
        }),
      ];
      const childrenFilterReject = [
        ...walkComposedTree({
          root: el,
          whatToShow: NodeFilter.SHOW_ELEMENT,
          filterReject: (node) => node === child,
        }),
      ];

      assert.deepEqual(childrenFilterAccept, [el]);
      assert.deepEqual(childrenFilterReject, [el]);
    });
  });

  suite('getFirstAndLastItems', () => {
    afterEach(() => fixtureCleanup());
    function createTreeWithFocusable() {
      const div1 = document.createElement('div');
      const button = document.createElement('button');
      const div2 = document.createElement('div');
      const parent = document.createElement('div');
      parent.append(div1, button, div2);
      return {parent, button};
    }

    test('should return the first and last focusable children', () => {
      const {parent, button} = createTreeWithFocusable();
      const walker = walkComposedTree({
        root: parent,
        whatToShow: NodeFilter.SHOW_ELEMENT,
        filterAccept: isFocusable,
        filterReject: isElementInvisible,
      });
      const [first, last] = getFirstAndLastItems(
        /** @type {IterableIterator<HTMLElement>} */ (walker)
      );
      assert.equal(first, button);
      assert.equal(last, button);
    });

    test('should return null if no focusable children are found', () => {
      const parent = document.createElement('div');
      const walker = walkComposedTree({
        root: parent,
        whatToShow: NodeFilter.SHOW_ELEMENT,
        filterAccept: () => false,
      });
      const [first, last] = getFirstAndLastItems(
        /** @type {IterableIterator<HTMLElement>} */ (walker)
      );
      assert.isNull(first);
      assert.isNull(last);
    });
  });

  suite('composedAncestors', () => {
    afterEach(() => fixtureCleanup());
    function createTree() {
      const host = document.createElement('div');
      const slot = document.createElement('slot');
      const assignedNode = document.createElement('div');
      host.attachShadow({mode: 'open'});
      host.shadowRoot?.appendChild(slot);
      host.appendChild(assignedNode);
      return {host, slot, assignedNode};
    }

    test('should yield ancestors of HTMLElement with assignedSlot', () => {
      const {host, slot, assignedNode} = createTree();
      const ancestors = [...composedAncestors(assignedNode)];
      assert.deepEqual(ancestors, [slot, /** @type {ShadowRoot} */ (host.shadowRoot), host]);
    });

    test('should yield ancestors of ShadowRoot', () => {
      const {host, slot} = createTree();
      const ancestors = [...composedAncestors(slot)];
      assert.deepEqual(ancestors, [/** @type {ShadowRoot} */ (host.shadowRoot), host]);
    });

    test('should yield ancestors of other nodes', () => {
      const div = document.createElement('div');
      const child = document.createElement('span');
      div.appendChild(child);
      const ancestors = [...composedAncestors(child)];
      assert.deepEqual(ancestors, [div]);
    });

    test('should not yield ancestors if node has no parent', () => {
      const div = document.createElement('div');
      const ancestors = [...composedAncestors(div)];
      assert.deepEqual(ancestors, []);
    });
  });

  suite('deepContains', () => {
    afterEach(() => fixtureCleanup());
    function createTree() {
      const container = document.createElement('div');
      const target = document.createElement('div');
      container.attachShadow({mode: 'open'});
      container.shadowRoot?.appendChild(target);
      return {container, target};
    }

    test('should return true if container directly contains target', () => {
      const {container, target} = createTree();
      assert.isTrue(deepContains(container, target));
    });

    test('should return true if container contains target in shadow DOM', () => {
      const {container, target} = createTree();
      assert.isTrue(deepContains(container, target));
    });

    test('should return false if container does not contain target', () => {
      const container = document.createElement('div');
      const target = document.createElement('div');
      assert.isFalse(deepContains(container, target));
    });

    test('should return true if container contains target in slot', () => {
      const container = document.createElement('div');
      const slot = document.createElement('slot');
      const target = document.createElement('div');
      container.attachShadow({mode: 'open'}).appendChild(slot);
      container.appendChild(target);
      assert.isTrue(deepContains(container, target));
    });

    test('should find the index of the target in the list', async () => {
      const fixtureElement = await fixture(html`
        <div>
          <div class="list-item"></div>
          <div class="list-item target"></div>
          <div class="list-item"></div>
        </div>
      `);

      const target = fixtureElement.querySelector('.target');
      const items = document.querySelectorAll('.list-item');

      const index = Array.from(items).findIndex(
        (item) => item === target || deepContains(item, /** @type {HTMLElement} */ (target))
      );

      assert.equal(index, 1);
    });
  });

  suite('htmlStructureSnapshot', () => {
    afterEach(() => fixtureCleanup());

    test('should return deepest active element in shadow root', async () => {
      const wrapper = await fixture(html`
        <html-structure id="nop">some light dom</html-structure>
      `);
      const wrapperShadowRoot = wrapper.shadowRoot;
      const lightDom = htmlStructureSnapshot(wrapper, ['id']);
      assert.equal(lightDom, '<html-structure>some light dom</html-structure>');

      if (wrapperShadowRoot) {
        const shadowDom = htmlStructureSnapshot(wrapperShadowRoot);
        assert.equal(shadowDom, '<h1>Hello<span>!</span></h1><hr><slot></slot>');
      }
    });
  });

  suite('getDeepActiveElement', () => {
    afterEach(() => fixtureCleanup());
    test('should return body if no active element', () => {
      const result = getDeepActiveElement();
      assert.equal(result, document.body);
    });

    test('should return active element if no shadow root', async () => {
      const button = await fixture(html`
        <button>button</button>
      `);
      /** @type {HTMLElement} */ (button).focus();
      const result = getDeepActiveElement();
      assert.equal(result, button);
    });

    test('should return deepest active element in shadow root', async () => {
      const wrapper = await fixture(html`
        <div>
          <custom-element id="divWithShadowRoot"></custom-element>
          <div id="innerDiv" tabindex="0"></div>
        </div>
      `);

      const customElement = wrapper.querySelector('#divWithShadowRoot');
      customElement?.attachShadow({mode: 'open'});
      const innerDiv = wrapper.querySelector('#innerDiv');
      customElement?.shadowRoot?.appendChild(/** @type {HTMLElement} */ (innerDiv));
      /** @type {HTMLElement} */ (innerDiv).focus();
      const result = getDeepActiveElement();
      assert.equal(result, innerDiv);
    });

    test('should return active element if no root', async () => {
      const fragment = document.createDocumentFragment();
      const el = await fixture(html`
        ${fragment}
      `);
      // @ts-ignore
      const result = getDeepActiveElement(el);
      assert.equal(result, document.body);
    });
  });

  suite('isClickInsideRect', () => {
    afterEach(() => fixtureCleanup());
    test('should return true', () => {
      const rect = new DOMRect(0, 0, 100, 100);
      const ev = new PointerEvent('pointerdown', {clientX: 50, clientY: 50});
      assert.isTrue(isClickInsideRect(rect, ev));
    });
    test('should return false', () => {
      const rect = new DOMRect(0, 0, 100, 100);
      const ev = new PointerEvent('pointerdown', {clientX: 150, clientY: 150});
      assert.isFalse(isClickInsideRect(rect, ev));
    });
  });

  suite('randomID', () => {
    afterEach(() => fixtureCleanup());
    test('should return a string', () => {
      const id = randomID();
      const idLarge = randomID(200);
      assert.isString(id);
      assert.lengthOf(id, 8);
      assert.isAtMost(idLarge.length, 16);
    });
  });

  suite('urlToPlainObject', () => {
    afterEach(() => fixtureCleanup());
    test('should return a plain object representing the URL', () => {
      const urls = [
        {url: new URL('https://example.com:5443/svn/Repos/'), port: '5443'},
        {url: new URL('http://example.com:8080/svn/Repos/'), port: '8080'},
        {url: new URL('https://example.com:443/svn/Repos/'), port: ''},
        {url: new URL('http://example.com:80/svn/Repos/'), port: ''},
        {url: new URL('https://example.com/svn/Repos/'), port: ''},
        {url: new URL('http://example.com/svn/Repos/'), port: ''},
        {url: new URL('ftp://example.com:221/svn/Repos/'), port: '221'},
        {url: new URL('ftp://example.com:21/svn/Repos/'), port: ''},
      ];

      urls.forEach(({url, port}) => {
        const plainObject = urlToPlainObject(url);
        assert.isObject(plainObject);
        assert.equal(plainObject.protocol, url.protocol);
        assert.equal(plainObject.hostname, url.hostname);
        assert.equal(plainObject.port, port);
        assert.equal(plainObject.pathname, url.pathname);
      });
    });

    test('with URL string', () => {
      const urls = [{url: 'https://example.com:5173/svn/Repos/', port: '5173'}];

      urls.forEach(({url, port}) => {
        // @ts-ignore
        const plainObject = urlToPlainObject(url);
        assert.isObject(plainObject);
        assert.equal(plainObject.port, port);
      });
    });
  });

  suite('LRUMap', () => {
    afterEach(() => fixtureCleanup());
    test('should set and get values', () => {
      const map = new LRUMap();
      map.set('a', 1);
      assert.isTrue(map.has('a'));
      assert.equal(map.get('a'), 1);
    });

    test('should evict least recently used when capacity exceeded', () => {
      const map = new LRUMap(2);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      assert.isFalse(map.has('a'));
      assert.isTrue(map.has('b'));
      assert.isTrue(map.has('c'));
    });

    test('should update recency on get', () => {
      const map = new LRUMap(2);
      map.set('a', 1);
      map.set('b', 2);
      map.get('a');
      map.set('c', 3);
      assert.isTrue(map.has('a'));
      assert.isFalse(map.has('b'));
    });

    test('should update recency on has', () => {
      const map = new LRUMap(2);
      map.set('a', 1);
      map.set('b', 2);
      map.has('a');
      map.set('c', 3);
      assert.isTrue(map.has('a'));
      assert.isFalse(map.has('b'));
    });

    test('should delete entries', () => {
      const map = new LRUMap(2);
      map.set('a', 1);
      map.delete('a');
      assert.isFalse(map.has('a'));
      assert.isUndefined(map.get('a'));
    });
  });
});
