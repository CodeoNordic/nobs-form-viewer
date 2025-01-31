/**
 * Check if the current environment is development mode
 * @returns if the current environment is development mode
 * @example
 * ```ts
 * isDevMode(); // true
 * ``` 
 */
export default function isDevMode() {
    return window.location.hostname === 'localhost';
}