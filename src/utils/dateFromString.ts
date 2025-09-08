export default function dateFromString(input: string): Date | null {
	const s = input.trim();

	// DD.MM.YYYY HH:MM:SS
	const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
	if (m) {
		const [, dd, mm, yyyy, HH = '0', MM = '0', SS = '0'] = m;
		const day = parseInt(dd);
		const mon = parseInt(mm) - 1; // Months are 0-indexed
		const yr = parseInt(yyyy);
		const h = parseInt(HH);
		const min = parseInt(MM);
		const sec = parseInt(SS);

		if (
			mon < 0 ||
			mon > 11 ||
			day < 1 ||
			day > 31 ||
			h < 0 ||
			h > 23 ||
			min < 0 ||
			min > 59 ||
			sec < 0 ||
			sec > 59
		)
			return null;

		const d = new Date(yr, mon, day, h, min, sec);

		if (d.getFullYear() !== yr || d.getMonth() !== mon || d.getDate() !== day) return null;

		return d;
	}

	const native = new Date(s);
	if (!isNaN(native.getTime())) return native;

	return null;
}
