import searchObject from './searchObject';

/**
 * searches for a value in an array
 * @param arr the array to search 
 * @param searchParam the value to search for 
 * @param negativeSearch if the search should be negative 
 * @returns the filtered array
 * @example
 * ```ts
 * searchArray([1, 2, 3, 4, 5], 3); // [3]
 * searchArray([1, 2, 3, 4, 5], 3, true); // [1, 2, 4, 5]
 * ```
 */
export default function searchArray<T extends Array<any>>(arr: T, searchParam?: null|string|RSAny, negativeSearch: boolean = false): T {
    if (!searchParam) return arr;

    const res = arr.filter(obj => searchObject(obj, searchParam)) as T;
    if (!negativeSearch) return res;

    // Return a negative search
    return arr.filter(obj => !res.includes(obj)) as T;
}