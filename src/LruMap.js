/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A limited-capacity map with a least-recently-used (LRU) eviction policy. Includes
 * the operations `get`, `set`, and `has`, which behave the same as on a `Map`.
 */
export class LRUMap {
  /**
   * @param {number} [capacity=10] - The maximum number of entries allowed in the map.
   */
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.map = new Map();
  }

  /**
   * @param {*} key - The key to test for presence in the map.
   * @returns {boolean} Whether the key exists.
   */
  has(key) {
    this.reinsertIfPresent(key);
    return this.map.has(key);
  }

  /**
   * @param {*} key - The key whose value to retrieve.
   * @returns {*|undefined} The stored value, or `undefined` if not found.
   */
  get(key) {
    this.reinsertIfPresent(key);
    return this.map.get(key);
  }

  /**
   * @param {*} key - The key to set.
   * @param {*} value - The value to associate with the key.
   */
  set(key, value) {
    this.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const [lruKey] = this.map.keys();
      this.map.delete(lruKey);
    }
  }

  /**
   * @param {*} key - The key to remove.
   */
  delete(key) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
  }

  /**
   * @param {*} key - The key of the entry to reinsert as most recently used.
   */
  reinsertIfPresent(key) {
    if (this.map.has(key)) {
      const value = this.map.get(key);
      this.map.delete(key);
      this.map.set(key, value);
    }
  }
}
