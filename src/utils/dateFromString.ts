/**
 * Create a date object from a string
 * @param str The string to convert to a date
 * @returns The date object or undefined if the string is invalid
 * @example
 * ```ts
 * dateFromString('2021-01-01T00:00:00Z'); // Date('2021-01-01T00:00:00Z')
 * dateFromString('2024-08-25'); // Date('2024-08-25T00:00:00Z')
 * dateFromString('Hello World!'); // undefined
 * ```
 */
export default function dateFromString(str?: string) {
	if (!str) return;
	str = str.trim();

	// ISO 8601 check
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(str)) {
		return new Date(str);
	}

	// Date without time (YYYY-MM-DD)
	if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
		return new Date(str + 'T00:00:00Z');
	}

	const [strDate, strTime] = str.split('T') as [string, string | undefined];

	const getParts = (str: string) => {
		if (str.includes('/')) {
			const [m, d, y] = str.split('/');
			return [d, m, y];
		}
		if (str.includes('-')) {
			const [m, d, y] = str.split('-');
			return [d, m, y];
		}
		if (str.includes('.')) return str.split('.');
		if (str.includes(' ')) return str.split(' ');
		return [str];
	};

	const parts = getParts(strDate);
	if (parts.length !== 3) return undefined;

	const [part1, part2, part3] = parts.map(Number);
	let year, month, day;

	if (part1 > 31) {
		// YYYY-MM-DD
		year = part1;
		month = part2 - 1;
		day = part3;
	} else if (part3 > 31) {
		// DD-MM-YYYY
		year = part3;
		month = part2 - 1;
		day = part1;
	}

	// null matches both undefined and null
	if (year == null || month == null || day == null) return undefined;

	let result = new Date(year, month, day);
	if (isNaN(result.getTime())) return undefined;

	if (strTime) {
		// Add time if it exists
		const time = strTime.match(/^(\d{1,2}):?(\d{2})?:?(\d{2})?/);
		if (time) {
			result.setHours(Number(time[1]) || 0, Number(time[2]) || 0, Number(time[3]) || 0);
		}
	}

	return result;
}
