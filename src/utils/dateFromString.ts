export default function dateFromString(timestamp: string | undefined) {
	if (!timestamp) return null;

	const testDate = new Date(timestamp);

	if (!isNaN(testDate.getTime())) return testDate;

	const [strDate, strTime] = timestamp.split(' ') as [string, string | undefined];

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
	if (parts.length !== 3) return null;

	const [day, month, year] = parts.map(Number);

	// null matches both undefined and null
	if (year == null || month == null || day == null) return null;

	let result = new Date(year, month - 1, day);
	if (isNaN(result.getTime())) return null;

	if (strTime) {
		// Add time if it exists
		const time = strTime.match(/^(\d{1,2}):?(\d{2})?:?(\d{2})?/);
		if (time) {
			result.setHours(Number(time[1]) || 0, Number(time[2]) || 0, Number(time[3]) || 0);
		}
	}

	if (!result) return null;
	return result;
}
