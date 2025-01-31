/**
 * Combines CSS classes into a single string
 * @param classes the classes to combine
 * @returns the combined classes
 * @example
 * ```ts
 * combineClasses('class1', 'class2', 'class3'); // 'class1 class2 class3'
 * combineClasses('class1', 'class2', false, 'class3'); // 'class1 class2 class3'
 * ```
 */
export default function combineClasses(...classes: any[]) {
    return classes.filter(c => typeof c === 'string').join(' ');
}

export function classHelper(styles: Record<string, string>) {
    return (...keys: any[]) => keys
        .filter(k => typeof k === 'string')
        .map(k => `${styles[k]} ${k}`)
        .join(' ')
}