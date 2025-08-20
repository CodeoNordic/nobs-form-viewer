import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
		timestamp?: number | string;
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
						}}
					>
						{config?.locale === 'no' ? 'Lagre' : 'Save'}
					</button>
				</div>
			) : (
				<div className="answer-history__panel">
					<button className="answer-history__button" onClick={() => setOpen(false)}>
						{config?.locale === 'no' ? 'Lukk' : 'Close'}
					</button>
					<ul ref={scrollRef}>
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
									{/* <span>•</span> TODO: Check if needed
                                    <span>
                                        {typeof answer === 'string'
                                            ? answer ||
                                              (config?.locale === 'no'
                                                  ? 'slettet svaret'
                                                  : 'deleted answer')
                                            : ''}
                                    </span> */}
									{h.timestamp && (
										<>
											<span>•</span>
											<span className="time-ago">
												{new Date(h.timestamp).toLocaleString(
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
		timestamp?: number | string;
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
						{isPreviewing && (
							<>
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
											});
										}
									}}
								>
									{config.locale === 'no' ? 'Lagre versjon' : 'Save version'}
								</button>
							</>
						)}
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
								<span className="user">{h.user}</span> <span>•</span>
								{h.timestamp && (
									<span className="timestamp">
										{new Date(h.timestamp).toLocaleString(
											config?.locale === 'no' ? 'nb-NO' : 'en-US',
											{
												dateStyle: 'short',
												timeStyle: 'short',
											}
										)}
									</span>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
