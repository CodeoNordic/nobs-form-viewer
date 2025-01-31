import dateFromString from './dateFromString';

/**
 * Compare two values using FileMaker's find logic
 * @param a the first value to compare
 * @param b the second value to compare
 * @param operator the operator to use
 * @returns if the comparison is true  
 * @example
 * ```ts
 * greaterOrLessThan('1', '2', '<'); // true
 * greaterOrLessThan('1', '2', '>'); // false
 * greaterOrLessThan('2', '2', '<='); // true
 * greaterOrLessThan('1', '2', '>='); // false
 * ```
 */
function greaterOrLessThan(a: string, b: string, operator: '<'|'>'|'<='|'>=') {
    let valueA: string|number = a;
    let valueB: string|number = b;
    
    const numberA = Number(a);
    const numberB = Number(b);

    if (Number.isFinite(numberA) && Number.isFinite(numberB)) {
        valueA = numberA;
        valueB = numberB;    
    }

    else {
        const dateA = dateFromString(a);
        const dateB = dateFromString(b);

        if ((dateA instanceof Date) && (dateB instanceof Date)) {
            valueA = dateA.valueOf();
            valueB = dateB.valueOf();
        }
    }

    switch(operator) {
        case '<': return valueA < valueB;
        case '>': return valueA > valueB;
        case '<=': return valueA <= valueB;
        case '>=': return valueA >= valueB;
    }
}

export default function filemakerFindEquivalent(value: any, search: string): boolean {
    search = String(search);

    // If search starts with ^, do an inverse search
    if (search.startsWith('^')) return !filemakerFindEquivalent(value, search.substring(1));
    if (search === '=') return ["", undefined, null, NaN].includes(value);

    const stringValue = String(value).toLowerCase();

    let start = search.substring(0, 2);
    let trimmed = search.substring(2).toLowerCase();

    switch(start) {
        case '==': return stringValue == trimmed;
        case '!=': return stringValue != trimmed;
        case '<=': return greaterOrLessThan(stringValue, trimmed, '<=');
        case '>=': return greaterOrLessThan(stringValue, trimmed, '>=');
    }

    start = search.substring(0, 1);
    trimmed = search.substring(1).toLowerCase();

    switch(start) {
        case '*': return !["", undefined, null, NaN].includes(value);
        case '<': return greaterOrLessThan(stringValue, trimmed, '<');
        case '>': return greaterOrLessThan(stringValue, trimmed, '>');
    }

    return stringValue.includes(search.toLowerCase());
}