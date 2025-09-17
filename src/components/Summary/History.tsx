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
import Crossmark from 'jsx:@svg/crossmark.svg';
import DoubleChevronLeft from 'jsx:@svg/double-chevron-left.svg';
import ChevronUp from 'jsx:@svg/chevron-up.svg';
import SummaryItem from './SummaryItem';
import { Tooltip } from 'react-tooltip';

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

type HistoryItemProps = {
	answerHistory: Array<{
		user: string;
		timestamp?: string;
		answers: Record<string, any>;
		parsedAnswers: Record<string, any>;
	}>;
	elementName: string;
	element: any;
	anyOpen: boolean;
	setAnyOpen: (open: boolean) => void;
};

const deepEqual = (a: any, b: any) => a === b || JSON.stringify(a) === JSON.stringify(b);

export const HistoryItem: FC<HistoryItemProps> = ({
	answerHistory,
	elementName,
	element,
	setAnyOpen,
}) => {
	const [config, setConfig] = useConfigState();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [open, setOpen] = useState(false);
	const boxRef = useRef<HTMLDivElement>(null);
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

	useOnClickOutside(boxRef, () => {
		if (!open) return;
		setActiveIndex(null);
		setOpen(false);
		setAnyOpen(false);
	});

	const handler = (e: MouseEvent) => {
		if (!open) return;
		setActiveIndex(null);
		setOpen(false);
		setAnyOpen(false);
	};

	useEffect(() => {
		const listener = (e: MouseEvent) => {
			if (!boxRef.current || boxRef.current.contains(e.target as Node)) return;
			handler(e);
		};
		document.addEventListener('mousedown', listener);
		return () => document.removeEventListener('mousedown', listener);
	}, [boxRef, handler]);

	// const savedY = useRef(0);

	// useEffect(() => {
	// 	const body = document.body;
	// 	const doc = document.documentElement;

	// 	const scrollEl = (document.scrollingElement || doc) as HTMLElement;

	// 	if (open) {
	// 		const y = scrollEl.scrollTop;
	// 		savedY.current = y;

	// 		const scrollbarW = window.innerWidth - doc.clientWidth;
	// 		body.style.position = 'fixed';
	// 		body.style.top = `-${y}px`;
	// 		body.style.left = '0';
	// 		body.style.right = '0';
	// 		body.style.width = '100%';
	// 		if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;
	// 	} else {
	// 		const y = savedY.current;

	// 		body.style.position = '';
	// 		body.style.top = '';
	// 		body.style.left = '';
	// 		body.style.right = '';
	// 		body.style.width = '';
	// 		body.style.paddingRight = '';

	// 		const prev = doc.style.scrollBehavior;
	// 		doc.style.scrollBehavior = 'auto';
	// 		scrollEl.scrollTop = y;
	// 		window.scrollTo(0, y);
	// 		console.log({ y });
	// 		doc.style.scrollBehavior = prev || '';
	// 	}
	// }, [open]);

	const hasTitle =
		element.titleLocation != 'hidden' &&
		((element.type != undefined && element.type != 'panel') ||
			(element.title != undefined && (element.title as string).trim() != ''));

	return (
		<div className={'answer-history' + (open ? ' open' : '')} ref={boxRef}>
			{!open ? (
				<button
					className="answer-history__open"
					onClick={() => {
						setOpen(true);
						setAnyOpen(true);
					}}
					aria-label="Open answer history"
					data-tooltip-id={'tooltip-history-item' + elementName}
					data-tooltip-content={
						hasTitle
							? config?.locale === 'no'
								? `Se historikk for "${element.title ?? element.name}"`
								: `See history for "${element.title ?? element.name}"`
							: config?.locale === 'no'
							? `Se historikk`
							: `See history`
					}
					data-tooltip-delay-show={500}
				>
					<History />
				</button>
			) : (
				<div className="answer-history__panel">
					<div className="answer-history__header">
						<Crossmark
							className="answer-history__close"
							onClick={() => {
								setActiveIndex(null);
								setOpen(false);
								setAnyOpen(false);
							}}
						/>
						{hasTitle && (
							<p className="history-title">{element.title ?? element.name}</p>
						)}
					</div>
					<ul className="answer-history__list">
						{filtered.map((h, i) => {
							const answer = h.answers[elementName];
							const parsedAnswer = h.parsedAnswers[elementName];
							const parsedPrev = filtered[i + 1]?.parsedAnswers[elementName];

							let className = '';
							if (activeIndex === i) className += ' active';
							if (i % 2 === 0) className += ' even';
							else className += ' odd';
							className = className.trim();

							return (
								<li
									className={className}
									key={i}
									onClick={() => {
										if (activeIndex === i) {
											setActiveIndex(null);
										} else {
											setActiveIndex(i);
										}
									}}
								>
									<div className="content">
										<div className="user-time">
											<p className="user">{h.user}</p>
											{dateFromString(h.timestamp || '') && (
												<div className="time-ago">
													<p>
														{config?.locale === 'no'
															? 'Redigert:'
															: 'Edited:'}
													</p>
													<p>
														{dateFromString(
															h.timestamp || ''
														)?.toLocaleString(
															config?.locale === 'no'
																? 'nb-NO'
																: 'en-US',
															{
																dateStyle: 'short',
																timeStyle: 'short',
															}
														)}
													</p>
												</div>
											)}
										</div>
										<div className="from-to">
											{typeof parsedPrev === 'string' ||
											typeof parsedAnswer === 'string' ? (
												<>
													{typeof parsedPrev === 'string' && (
														<>
															<div className="from">
																<p>
																	{typeof parsedPrev ===
																		'string' && parsedPrev}
																</p>
															</div>
															<div className="divider">
																<DoubleChevronLeft className="divider__chevron" />
															</div>
														</>
													)}
													<div className="to">
														<p>
															{typeof parsedAnswer === 'string' &&
																parsedAnswer}
														</p>
													</div>
												</>
											) : (
												<div
													className={
														'show-more' +
														(activeIndex === i ? ' open' : '')
													}
												>
													<p>Vis endringer</p>
													<div className="show-more__chevron-box">
														<ChevronUp className="chevron" />
													</div>
												</div>
											)}
										</div>
									</div>
									<div className={`expando ${activeIndex === i ? 'open' : ''}`}>
										<div className="expando__inner">
											{typeof parsedPrev !== 'string' &&
												typeof parsedAnswer !== 'string' && (
													<SummaryItem
														answers={h.parsedAnswers}
														element={element}
													/>
												)}

											<div className="answer-history__toolbar">
												<button
													className="answer-history__button use"
													onClick={(e) => {
														e.stopPropagation();
														setActiveIndex(null);
														setOpen(false);
														setAnyOpen(false);

														const newAnswer = writeAnswerForElement(
															config,
															elementName,
															answer
														);

														if (
															typeof config?.addToAnswers ===
																'string' &&
															config.addToAnswers.trim() !== ''
														) {
															setConfig((prev: any) => ({
																...prev,
																answers: [
																	...(prev.answers || []),
																	{
																		answer: newAnswer,
																		user: config.addToAnswers,
																		timestamp:
																			new Date().toISOString(),
																	},
																],
																answerData: newAnswer,
															}));
														} else {
															setConfig((prev: any) => ({
																...prev,
																answerData: newAnswer,
															}));
														}
														if (config?.scriptNames?.onChange) {
															performScript('onChange', {
																result: newAnswer,
																hasErrors: false,
																type: config.type,
															});
														}
													}}
												>
													{config?.locale === 'no' ? 'Bruk' : 'Save'}
												</button>
												<button
													className="answer-history__button cancel"
													onClick={(e) => {
														e.stopPropagation();
														setActiveIndex(null);
													}}
												>
													{config?.locale === 'no' ? 'Avbryt' : 'Cancel'}
												</button>
											</div>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
			<Tooltip id={'tooltip-history-item' + elementName} className="tooltip" />
		</div>
	);
};

export const HistoryList: FC<{
	sortedHistory: Array<{
		user: string;
		timestamp?: string;
		answer: string;
	}>;
	historyItemOpen: boolean;
}> = ({ sortedHistory, historyItemOpen }) => {
	const [config, setConfig] = useConfigState();
	const [open, setOpen] = useState(false);
	const originalRef = useRef<string | null>(null);
	const [isPreviewing, setIsPreviewing] = useState(false);

	if (!config) return null;

	const preview = useCallback(
		(value: string) => {
			if (!isPreviewing) originalRef.current = (config as any)?.answerData ?? null;
			setConfig((prev: any) => ({ ...prev, answerData: value }));
			setIsPreviewing(true);
		},
		[isPreviewing, setConfig]
	);

	const cancel = useCallback(() => {
		if (isPreviewing) {
			setConfig((prev: any) => ({ ...prev, answerData: originalRef.current }));
		}
		originalRef.current = null;
		setIsPreviewing(false);
	}, [isPreviewing, setConfig]);

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

	return (
		<div className="change-history">
			<div className="change-history__header">
				{!open ? (
					<button
						className="change-history__button open"
						aria-label="Show change history"
						disabled={historyItemOpen}
						onClick={() => setOpen(true)}
						data-tooltip-id="tooltip-history-list"
						data-tooltip-content={
							config.locale === 'no'
								? 'Se hele endringshistorikken for skjemaet'
								: 'See the full change history for the form'
						}
						data-tooltip-delay-show={500}
					>
						<p>{config.locale === 'no' ? 'Endringshistorikk' : 'Change history'}</p>
						<div className="num-his">
							{filtered.length >= 100 ? '99+' : filtered.length}
						</div>
					</button>
				) : !isPreviewing ? (
					<button onClick={() => setOpen(false)} className="change-history__button">
						{config.locale === 'no' ? 'Lukk' : 'Close'}
					</button>
				) : (
					<>
						<button
							className="change-history__button use"
							onClick={() => {
								originalRef.current = null;
								setIsPreviewing(false);
								setOpen(false);

								if (config?.addToAnswers && config.addToAnswers.trim() != '') {
									const newAnswerEntry = {
										answer: config.answerData || '',
										user: config.addToAnswers,
										timestamp: new Date().toISOString(),
									};
									setConfig((prev: any) => ({
										...prev,
										answers: [...(prev.answers ?? []), newAnswerEntry],
									}));
								}

								if (config?.scriptNames?.onChange) {
									performScript('onChange', {
										result: config.answerData,
										hasErrors: false,
										type: config.type,
									});
								}
							}}
						>
							{config.locale === 'no' ? 'Bruk versjon' : 'Save version'}
						</button>
						<button className="change-history__button cancel" onClick={() => cancel()}>
							{config.locale === 'no'
								? 'Avbryt visning av endringer'
								: 'Stop viewing changes'}
						</button>
					</>
				)}
			</div>
			{open && !isPreviewing && (
				<div className="change-history__list">
					<ul>
						{filtered.map((h, index) => (
							<li
								className={index % 2 === 0 ? 'even' : 'odd'}
								key={index}
								onClick={() => preview(h.answer)}
							>
								<div className="user-time">
									<p className="user">{h.user}</p>
									{dateFromString(h.timestamp || '') && (
										<div className="time-ago">
											<p>
												{config?.locale === 'no' ? 'Redigert:' : 'Edited:'}
											</p>
											<p>
												{dateFromString(h.timestamp || '')?.toLocaleString(
													config?.locale === 'no' ? 'nb-NO' : 'en-US',
													{
														dateStyle: 'short',
														timeStyle: 'short',
													}
												)}
											</p>
										</div>
									)}
								</div>
								<div className="show-changes">
									<p>Vis endringer</p>
									<div className="show-changes__chevron-box">
										<ChevronUp className="chevron" />
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
			<Tooltip id="tooltip-history-list" className="tooltip" />
		</div>
	);
};
