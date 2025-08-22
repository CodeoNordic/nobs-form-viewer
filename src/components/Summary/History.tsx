import React, {
	FC,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useConfigState } from '@context/Config';
import History from 'jsx:@svg/history.svg';
import performScript from '@utils/performScript';

function safeParse<T = any>(raw?: string | null): T {
	if (!raw) return {} as T;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return {} as T;
	}
}

function writeAnswerForElement(prev: any, elementName: string, value: any): string {
	const obj = safeParse<Record<string, any>>(prev?.answerData);
	return JSON.stringify({ ...obj, [elementName]: value });
}

function readAnswerForElement(config: any, elementName: string) {
	const obj = safeParse<Record<string, any>>(config?.answerData);
	return obj[elementName] ?? null;
}

function useCheckScrollbar(
	ref: React.RefObject<HTMLUListElement>,
	setHasScrollbar: (has: boolean) => void,
	deps: any[] = []
) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		console.log('test');

		const checkScrollbar = () => {
			setHasScrollbar(el.scrollHeight > el.clientHeight);
		};

		checkScrollbar();
		// If fonts change size
		(document as any).fonts?.ready?.then(checkScrollbar).catch(() => {});

		// Observers to handle dynamic content changes
		const ro = new ResizeObserver(checkScrollbar);
		ro.observe(el);

		const mo = new MutationObserver(checkScrollbar);
		mo.observe(el, { childList: true, subtree: true, characterData: true });

		window.addEventListener('resize', checkScrollbar);
		return () => {
			ro.disconnect();
			mo.disconnect();
			window.removeEventListener('resize', checkScrollbar);
		};
	}, [ref, setHasScrollbar, ...deps]);
}

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: (e: MouseEvent) => void) {
	useEffect(() => {
		const listener = (e: MouseEvent) => {
			if (!ref.current || ref.current.contains(e.target as Node)) return;
			handler(e);
		};
		document.addEventListener('mousedown', listener);
		return () => document.removeEventListener('mousedown', listener);
	}, [ref, handler]);
}

function useAnswerPreview(elementName: string) {
	const [config, setConfig] = useConfigState();
	const originalRef = useRef<any>(null);
	const [isPreviewing, setIsPreviewing] = useState(false);

	const preview = useCallback(
		(value: any) => {
			if (!isPreviewing) {
				originalRef.current = readAnswerForElement(config, elementName);
			}
			setConfig((prev: any) => ({
				...prev,
				answerData: writeAnswerForElement(prev, elementName, value),
			}));
			setIsPreviewing(true);
		},
		[config, elementName, isPreviewing, setConfig]
	);

	const save = useCallback(() => {
		originalRef.current = null;
		setIsPreviewing(false);
	}, []);

	const cancel = useCallback(() => {
		if (isPreviewing) {
			setConfig((prev: any) => ({
				...prev,
				answerData: writeAnswerForElement(prev, elementName, originalRef.current),
			}));
		}
		originalRef.current = null;
		setIsPreviewing(false);
	}, [elementName, isPreviewing, setConfig]);

	const current = useMemo(
		() => readAnswerForElement(config, elementName),
		[config?.answerData, elementName]
	);

	return { current, preview, save, cancel, isPreviewing } as const;
}

function useConfigStringPreview(key: 'answerData') {
	const [config, setConfig] = useConfigState();
	const originalRef = useRef<string | null>(null);
	const [isPreviewing, setIsPreviewing] = useState(false);

	const preview = useCallback(
		(value: string) => {
			if (!isPreviewing) originalRef.current = (config as any)?.[key] ?? null;
			setConfig((prev: any) => ({ ...prev, [key]: value }));
			setIsPreviewing(true);
		},
		[config, isPreviewing, key, setConfig]
	);

	const save = useCallback(() => {
		originalRef.current = null;
		setIsPreviewing(false);
	}, []);

	const cancel = useCallback(() => {
		if (isPreviewing) {
			setConfig((prev: any) => ({ ...prev, [key]: originalRef.current }));
		}
		originalRef.current = null;
		setIsPreviewing(false);
	}, [isPreviewing, key, setConfig]);

	return { isPreviewing, preview, save, cancel } as const;
}

type HistoryItemProps = {
	answerHistory: Array<{
		user: string;
		timestamp?: string;
		answers: Record<string, any>;
	}>;
	elementName: string;
};

function deepEqual(a: any, b: any): boolean {
	if (a === b) return true;
	if (a == null || b == null) return a === b;

	// Dates
	if (a instanceof Date && b instanceof Date) {
		return a.getTime() === b.getTime();
	}

	// Arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) return false;
		}
		return true;
	}

	// Plain objects
	if (typeof a === 'object' && typeof b === 'object') {
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const k of aKeys) {
			if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
			if (!deepEqual(a[k], b[k])) return false;
		}
		return true;
	}

	return false;
}

function getTime(timestamp: string | undefined, locale: string) {
	if (!timestamp) return null;

	const testDate = new Date(timestamp);

	if (!isNaN(testDate.getTime())) {
		return testDate.toLocaleString(locale === 'no' ? 'nb-NO' : 'en-US', {
			dateStyle: 'short',
			timeStyle: 'short',
		});
	}

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

	return result.toLocaleString(locale === 'no' ? 'nb-NO' : 'en-US', {
		dateStyle: 'short',
		timeStyle: 'short',
	});
}

type Coords = { top?: number; right?: number; maxHeight?: number };

export function useDownThenUpStable(
	anchorRef: React.RefObject<HTMLElement>,
	panelRef: React.RefObject<HTMLElement>,
	open: boolean,
	deps: any[] = [],
	opts: { margin?: number; gap?: number } = {}
) {
	const MARGIN = opts.margin ?? 8;

	const [coords, setCoords] = useState<Coords>({});
	const rafId = useRef<number | null>(null);

	const applyIfChanged = (next: Coords) => {
		setCoords((prev) => {
			const same =
				Math.abs((prev.top ?? 0) - (next.top ?? 0)) < 1 &&
				Math.abs((prev.right ?? 0) - (next.right ?? 0)) < 1 &&
				Math.abs((prev.maxHeight ?? 0) - (next.maxHeight ?? 0)) < 1;
			return same ? prev : next;
		});
	};

	const compute = () => {
		if (!open || !anchorRef.current || !panelRef.current) return;

		const r = anchorRef.current.getBoundingClientRect();
		const vh = window.innerHeight;

		const contentH = panelRef.current.scrollHeight;

		const spaceBelow = Math.max(0, vh - r.bottom - MARGIN);
		const totalAvail = Math.max(0, vh - 2 * MARGIN);

		const desired = Math.min(contentH, totalAvail);

		const deficit = Math.max(0, desired - spaceBelow);
		const top = Math.max(MARGIN, r.bottom - deficit);

		const maxHeight = Math.max(0, vh - top - MARGIN);

		applyIfChanged({
			top,
			maxHeight,
		});
	};

	const schedule = () => {
		if (rafId.current != null) return;
		rafId.current = requestAnimationFrame(() => {
			rafId.current = null;
			compute();
		});
	};

	useLayoutEffect(() => {
		if (!open) return;
		schedule();

		const onScrollOrResize = () => schedule();
		window.addEventListener('resize', onScrollOrResize);
		window.addEventListener('scroll', onScrollOrResize, true);

		const ro = new ResizeObserver(onScrollOrResize);
		if (anchorRef.current) ro.observe(anchorRef.current);

		return () => {
			window.removeEventListener('resize', onScrollOrResize);
			window.removeEventListener('scroll', onScrollOrResize, true);
			ro.disconnect();
			if (rafId.current != null) cancelAnimationFrame(rafId.current);
			rafId.current = null;
		};
	}, [open, anchorRef, panelRef, ...deps]);

	return coords;
}

export const HistoryItem: FC<HistoryItemProps> = ({ answerHistory, elementName }) => {
	const [config] = useConfigState();
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const { preview, cancel, save, isPreviewing } = useAnswerPreview(elementName);
	const boxRef = useRef<HTMLDivElement>(null);

	const scrollRef = useRef<HTMLUListElement>(null);
	const [hasScrollbar, setHasScrollbar] = useState(false);

	useOnClickOutside(boxRef, () => {
		if (!open) return;
		if (isPreviewing) cancel();
		setActiveIndex(null);
		setOpen(false);
	});

	const hasAny = useMemo(
		() => answerHistory.some((h) => h.answers[elementName] !== undefined),
		[answerHistory, elementName]
	);
	if (!hasAny) return null;

	const filtered = useMemo(() => {
		const out: typeof answerHistory = [];
		for (let i = 0; i < answerHistory.length; i++) {
			const curr = answerHistory[i]?.answers[elementName];
			const next = answerHistory[i + 1]?.answers[elementName];

			if (deepEqual(curr, next)) continue;
			out.push(answerHistory[i]);
		}
		return out;
	}, [answerHistory, elementName]);

	const panelRef = useRef<HTMLDivElement>(null);

	const coords = useDownThenUpStable(boxRef, panelRef, open && activeIndex === null, [
		filtered.length,
	]);

	useCheckScrollbar(scrollRef, setHasScrollbar, [open, filtered.length, coords]);

	return (
		<div className={'answer-history' + (open ? ' open' : '')} ref={boxRef}>
			{!open ? (
				<button
					className="answer-history__open"
					onClick={() => setOpen(true)}
					aria-label="Open answer history"
				>
					<History />
				</button>
			) : activeIndex !== null ? (
				<div className="answer-history__toolbar">
					<button
						className="answer-history__button"
						onClick={() => {
							cancel();
							setActiveIndex(null);
						}}
					>
						{config?.locale === 'no' ? 'Tilbake' : 'Back'}
					</button>
					<button
						className="answer-history__button"
						onClick={() => {
							save();
							setActiveIndex(null);
							setOpen(false);
						}}
					>
						{config?.locale === 'no' ? 'Lagre' : 'Save'}
					</button>
				</div>
			) : (
				<div
					ref={panelRef}
					className="answer-history__panel"
					style={{
						position: 'fixed',
						right: '8px',
						top: coords.top,
						maxHeight: coords.maxHeight ? `${coords.maxHeight}px` : undefined,
					}}
				>
					<div className="answer-history__header">
						<button className="answer-history__button" onClick={() => setOpen(false)}>
							{config?.locale === 'no' ? 'Lukk' : 'Close'}
						</button>
					</div>
					<ul ref={scrollRef} className="answer-history__list">
						{filtered.map((h, i) => {
							const answer = h.answers[elementName];
							return (
								<li
									key={i}
									onClick={() => {
										setActiveIndex(i);
										preview(answer);
									}}
									className={hasScrollbar ? 'has-scrollbar' : ''}
								>
									<span>{h.user}</span>
									{getTime(h.timestamp, config?.locale || 'en') && (
										<>
											<span>•</span>
											<span className="time-ago">
												{getTime(h.timestamp, config?.locale || 'en')}
											</span>
										</>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
};

export const HistoryList: FC<{
	sortedHistory: Array<{
		user: string;
		timestamp?: string;
		answer: string;
	}>;
}> = ({ sortedHistory }) => {
	const [config] = useConfigState();
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const { isPreviewing, preview, save, cancel } = useConfigStringPreview('answerData');

	const scrollRef = useRef<HTMLUListElement>(null);
	const [hasScrollbar, setHasScrollbar] = useState(false);

	if (!config) return null;

	// TODO: Is needed?
	const filtered = useMemo(() => {
		const out: typeof sortedHistory = [];
		for (let i = 0; i < sortedHistory.length; i++) {
			const curr = sortedHistory[i].answer;
			const next = sortedHistory[i + 1]?.answer;

			if (deepEqual(curr, next)) continue;
			out.push(sortedHistory[i]);
		}
		return out;
	}, [sortedHistory]);

	useCheckScrollbar(scrollRef, setHasScrollbar, [open, filtered.length]);

	return (
		<div className="change-history">
			{!open ? (
				<button
					className="change-history__button"
					aria-label="Show change history"
					onClick={() => setOpen(true)}
				>
					{config.locale === 'no' ? 'Endringshistorikk' : 'Changes history'} (
					{filtered.length})
				</button>
			) : isPreviewing ? (
				<div>
					<button
						className="change-history__button"
						onClick={() => {
							cancel();
							setActiveIndex(null);
						}}
					>
						{config.locale === 'no'
							? 'Stopp visning av endringer'
							: 'Stop viewing changes'}
					</button>
					<button
						className="change-history__button"
						onClick={() => {
							save();
							setActiveIndex(null);
							setOpen(false);
							if (config.scriptNames?.onChange) {
								performScript('onChange', {
									result: safeParse(config.answerData),
									hasErrors: false,
									type: config.type,
								});
							}
						}}
					>
						{config.locale === 'no' ? 'Lagre versjon' : 'Save version'}
					</button>
				</div>
			) : (
				<div className="change-history__panel">
					<div className="change-history__buttons">
						<button
							className="change-history__button"
							onClick={() => {
								if (isPreviewing) cancel();
								setActiveIndex(null);
								setOpen(false);
							}}
						>
							{config.locale === 'no' ? 'Lukk' : 'Close'}
						</button>
					</div>
					<ul ref={scrollRef} className={hasScrollbar ? 'scrollbar' : ''}>
						{filtered.map((h, index) => (
							<li
								className={activeIndex === index ? 'active' : ''}
								key={index}
								onClick={() => {
									if (activeIndex === null) {
										preview(h.answer);
									} else {
										preview(h.answer);
									}
									setActiveIndex(index);
								}}
							>
								<span className="user">{h.user}</span>
								{getTime(h.timestamp, config?.locale || 'en') && (
									<>
										<span>•</span>
										<span className="time-ago">
											{getTime(h.timestamp, config?.locale || 'en')}
										</span>
									</>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
