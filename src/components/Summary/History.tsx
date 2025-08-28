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
import dateFromString from '@utils/dateFromString';

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
	const check = useCallback(() => {
		const el = ref.current;
		if (el) setHasScrollbar(el.scrollHeight > el.clientHeight);
	}, [ref, setHasScrollbar]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		check();
		// If fonts change size
		(document as any).fonts?.ready?.then(check).catch(() => {});

		// Observers to handle dynamic content changes
		const ro = new ResizeObserver(check);
		ro.observe(el);

		const mo = new MutationObserver(check);
		mo.observe(el, { childList: true });

		window.addEventListener('resize', check);
		return () => {
			ro.disconnect();
			mo.disconnect();
			window.removeEventListener('resize', check);
		};
	}, [ref, check]);

	useEffect(check, deps);
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

const deepEqual = (a: any, b: any) => a === b || JSON.stringify(a) === JSON.stringify(b);

type Coords = { top?: number; maxHeight?: number };

export function useGrowCalc(
	anchorRef: React.RefObject<HTMLElement>,
	panelRef: React.RefObject<HTMLElement>,
	open: boolean,
	deps: any[] = []
) {
	const MARGIN = 8;

	const [coords, setCoords] = useState<Coords>({});
	const raf = useRef<number | null>(null);

	const applyIfChanged = (next: Coords) => {
		setCoords((prev) => {
			const same =
				Math.abs((prev.top ?? 0) - (next.top ?? 0)) < 1 &&
				Math.abs((prev.maxHeight ?? 0) - (next.maxHeight ?? 0)) < 1;
			return same ? prev : next;
		});
	};

	const compute = () => {
		if (!open || !anchorRef.current || !panelRef.current) return;
		const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

		const docEl = document.documentElement;
		const body = document.body;
		const docH = Math.max(
			docEl.scrollHeight,
			body.scrollHeight,
			docEl.offsetHeight,
			body.offsetHeight,
			docEl.clientHeight
		);

		const pageBottom = docH - MARGIN;

		const aRect = anchorRef.current.getBoundingClientRect();
		const anchorBottomDoc = aRect.bottom + scrollY;
		const offsetParent = panelRef.current.offsetParent as HTMLElement | null;
		const parentRect = offsetParent
			? offsetParent.getBoundingClientRect()
			: ({ top: 0 } as DOMRect);
		const parentTopDoc = parentRect.top + scrollY;

		const contentH = panelRef.current.scrollHeight;

		const spaceBelowPage = Math.max(0, pageBottom - anchorBottomDoc);

		const totalAvailPage = Math.max(0, pageBottom - MARGIN);
		const desired = Math.min(contentH, totalAvailPage);

		const deficit = Math.max(0, desired - spaceBelowPage);

		const desiredTopDoc = Math.max(MARGIN, anchorBottomDoc - deficit);

		const topInParent = desiredTopDoc - parentTopDoc;

		const maxHeight = Math.max(0, pageBottom - desiredTopDoc);

		applyIfChanged({ top: topInParent, maxHeight });
	};

	const schedule = () => {
		if (raf.current != null) return;
		raf.current = requestAnimationFrame(() => {
			raf.current = null;
			compute();
		});
	};

	useLayoutEffect(() => {
		if (!open) return;
		schedule();

		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);

		const ro = new ResizeObserver(schedule);
		if (anchorRef.current) ro.observe(anchorRef.current);
		if (panelRef.current) ro.observe(panelRef.current);

		return () => {
			window.removeEventListener('resize', schedule);
			window.removeEventListener('scroll', schedule, true);
			ro.disconnect();
			if (raf.current != null) cancelAnimationFrame(raf.current);
			raf.current = null;
		};
	}, [open, anchorRef, panelRef, ...deps]);

	return coords;
}

export const HistoryItem: FC<HistoryItemProps> = ({ answerHistory, elementName }) => {
	const [config, setConfig] = useConfigState();
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

	const coords = useGrowCalc(boxRef, panelRef, open && activeIndex === null, [filtered.length]);

	useCheckScrollbar(scrollRef, setHasScrollbar, [open, filtered.length]);

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
							if (
								typeof config?.addToAnswers === 'string' &&
								config.addToAnswers.trim() != ''
							) {
								const answersArray = config.answers || [];
								const now = new Date();
								const timestamp = now.toISOString();
								const newAnswerEntry = {
									answer: config.answerData || '',
									user: config.addToAnswers,
									timestamp: timestamp,
								};
								setConfig({
									...config,
									answers: [...answersArray, newAnswerEntry],
								});
							}
							if (config?.scriptNames?.onChange) {
								performScript('onChange', {
									result: safeParse(config.answerData),
									hasErrors: false,
									type: config.type,
								});
							}
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
						position: 'absolute',
						right: 0,
						top: coords.top,
						maxHeight: coords.maxHeight && `${coords.maxHeight}px`,
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
									className={hasScrollbar ? 'has-scrollbar' : ''}
									key={i}
									onClick={() => {
										setActiveIndex(i);
										preview(answer);
									}}
								>
									<span>{h.user}</span>
									{dateFromString(h.timestamp) && (
										<>
											<span>•</span>
											<span className="time-ago">
												{dateFromString(h.timestamp)?.toLocaleString(
													config?.locale === 'no' ? 'nb-NO' : 'en-US',
													{
														dateStyle: 'short',
														timeStyle: 'short',
													}
												)}
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
	const [config, setConfig] = useConfigState();
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
		<div className={'change-history' + (open ? ' open' : '')}>
			{!open ? (
				<button
					className="change-history__button"
					aria-label="Show change history"
					onClick={() => setOpen(true)}
				>
					{config.locale === 'no' ? 'Endringshistorikk' : 'Change history'} (
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
							if (config?.addToAnswers && config.addToAnswers.trim() != '') {
								const answersArray = config.answers || [];
								const now = new Date();
								const timestamp = now.toISOString();
								const newAnswerEntry = {
									answer: config.answerData || '',
									user: config.addToAnswers,
									timestamp: timestamp,
								};
								setConfig({
									...config,
									answers: [...answersArray, newAnswerEntry],
								});
							}
							if (config?.scriptNames?.onChange) {
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
								{dateFromString(h.timestamp) && (
									<>
										<span>•</span>
										<span className="time-ago">
											{dateFromString(h.timestamp)?.toLocaleString(
												config.locale === 'no' ? 'nb-NO' : 'en-US',
												{
													dateStyle: 'short',
													timeStyle: 'short',
												}
											)}
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
