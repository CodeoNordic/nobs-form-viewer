import dateFromString from './dateFromString';

/**
 * convert a date object to an object with various date properties
 * @param d the date to convert
 * @returns the date object
 * @example
 * ```ts
 * dateToObject(new Date('2021-01-01T00:00:00Z')); 
 * // { year: 2021, month: 1, day: 1, iso: '2021-01-01T00:00:00.000Z', utc: 'Fri, 01 Jan 2021 00:00:00 GMT', unix: 1609459200 }
 * ``` 
 */
export default function dateToObject(d: Date|string) {
    if (typeof d === 'string') d = dateFromString(d)!;
    if (!(d instanceof Date)) throw new Error(`Attempted to parse ${d} as a date`);
    
    return {
        year: d.getFullYear(),
        month: d.getMonth() + 1, // 0 indexed months
        day: d.getDate(),
        iso: d.toISOString(),
        utc: d.toUTCString(),
        unix: Math.floor(d.valueOf() / 1000),
        time: d.toLocaleTimeString('en-uk')
    }
}