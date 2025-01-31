/**
 * create a date object from a string
 * @param str the string to convert to a date
 * @returns the date object or undefined if the string is invalid
 * @example
 * ```ts
 * dateFromString('2021-01-01T00:00:00Z'); // Date('2021-01-01T00:00:00Z')
 * dateFromString('Hello World!'); // undefined
 * ```
 */
export default function dateFromString(str?: string) {
    if (!str) return;
    str = str.trim();

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(str)) return new Date(str);

    const [strDate, strTime] = str.split('T');
    const parts = strDate.split('.');

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    let result: Date|undefined;

    if ([day, month, year].includes(NaN)) result = new Date(strDate.replaceAll('-', '/') || NaN) || undefined;
    else result = new Date(year, month, day) || new Date(strDate.replaceAll('-', '/') || NaN);

    const time = strTime?.match(/(\d{2}):?(\d{2})?:?(\d{2})?/); /* (\d{1,2}):(\d{1,2}):?(\d{1,2})?\.?(\d{1,3})?Z?$ <- old*/
    if (time) result.setHours(
        Number(time[1]) || 0,
        Number(time[2]) || 0,
        Number(time[3]) || 0,
        Number(time[4]) || 0
    );

    return result || new Date(0);
}