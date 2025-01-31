import { useEffect } from 'react';

/**
 * Makes the passed function available to be used by FileMaker, with the given function name.
 * @param name the name of the function
 * @param cb the function to be called
 * @returns a cleanup function to remove the function from the window
 * @example
 * ```ts
 * const cleanup = createMethod('myFunction', (a: number, b: number) => a + b);
 * // myFunction(1, 2) -> 3
 * cleanup();
 * // myFunction(1, 2) -> undefined
 * ```
 */
export default function createMethod<Name extends string & keyof Constrain<Window, Function>>(name: Name|(string & {}), cb: Window[Name]) {
    const method = (...params: any[]) => {
        try {
            const parsedParams = params.map(p => {
                try {
                    return JSON.parse(p)
                } catch {
                    return p;
                }
            });
            
            return cb(...parsedParams);
        } catch(err) {
            console.error(err);
        }
    }

    // Easy aliasing by splitting names with the | symbol (functionName|aliasFunctionName)
    const keys = name.split('|');
    // @ts-ignore
    keys.forEach(k => window[k] = method)

    // Return cleanup function
    return () => {
        // @ts-ignore
        keys.forEach(k => delete window[k]);
    }
}

/**
 * Uses createMethod to make a method that can be called by FileMaker, and cleans up when the component is unmounted.
 * @param name the name of the function
 * @param cb the function to be called
 * @param dependencies the dependencies to watch for changes
 * @example
 * ```tsx
 * useCreateMethod('myFunction', (a: number, b: number) => a + b, [a, b]);
 * ```
 */
export function useCreateMethod<Name extends string & keyof Constrain<Window, Function>>(name: Name|(string & {}), cb: Window[Name], dependencies?: any[]) {
    useEffect(() => {
        const cleanup = createMethod(name, cb);
        return cleanup;
    }, dependencies ?? []);
}