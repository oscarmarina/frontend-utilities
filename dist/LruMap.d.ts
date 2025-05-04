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
    constructor(capacity?: number);
    capacity: number;
    map: Map<any, any>;
    /**
     * @param {*} key - The key to test for presence in the map.
     * @returns {boolean} Whether the key exists.
     */
    has(key: any): boolean;
    /**
     * @param {*} key - The key whose value to retrieve.
     * @returns {*|undefined} The stored value, or `undefined` if not found.
     */
    get(key: any): any | undefined;
    /**
     * @param {*} key - The key to set.
     * @param {*} value - The value to associate with the key.
     */
    set(key: any, value: any): void;
    /**
     * @param {*} key - The key to remove.
     */
    delete(key: any): void;
    /**
     * @param {*} key - The key of the entry to reinsert as most recently used.
     */
    reinsertIfPresent(key: any): void;
}
