/**
 * Capitalizes the first letter of each word in a string
 * @param str the string to capitalize
 * @param firstOnly if only the first word should be capitalized
 * @returns the capitalized string
 * @example
 * ```ts
 * capitalize('hello world'); // 'Hello World'
 * capitalize('hello world', true); // 'Hello world'
 * ```
 */
export default function capitalize(str?: string, firstOnly: boolean = false) {
    if (!str) return '';
    if (firstOnly) return str.substring(0, 1).toUpperCase() + str.substring(1);

    return str.split(' ')
        .map(w => w.substring(0, 1).toUpperCase() + w.substring(1))
        .join(' ');
}