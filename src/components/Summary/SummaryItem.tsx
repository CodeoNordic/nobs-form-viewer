import { useConfigState } from '@context/Config';
import { HistoryItem } from './History';
import { useEffect, useRef, useState } from 'react';
import performScript from '@utils/performScript';
import { evaluateLogic } from './evaluateLogic';

function useConsistentBlur(ref: any, onBlur: () => void) {
	useEffect(() => {
		if (!ref.current) return;

		const handleWindowBlur = () => {
			if (document.activeElement === ref.current) onBlur();
		};

		const handleInputBlur = () => onBlur();

		const inputEl = ref.current;

		inputEl.addEventListener('blur', handleInputBlur);
		window.addEventListener('blur', handleWindowBlur);

		return () => {
			inputEl.removeEventListener('blur', handleInputBlur);
			window.removeEventListener('blur', handleWindowBlur);
		};
	}, [ref, onBlur]);
}

function EditableTextarea(props: {
	value: string;
	onChangeValue: (v: string) => void;
	onCommit: () => void;
}) {
	const { value, onChangeValue, onCommit } = props;
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useConsistentBlur(inputRef, onCommit);

	const resize = () => {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight - 4}px`;
	};

	useEffect(() => {
		const ro = new ResizeObserver(resize);
		ro.observe(inputRef.current!);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		resize();
	}, [value]);

	return (
		<textarea
			ref={inputRef}
			rows={1}
			value={value}
			className="question-answer text-input"
			onClick={(e) => (e.target as HTMLTextAreaElement).focus()}
			onChange={(e) => {
				onChangeValue(e.target.value);
				resize();
			}}
		/>
	);
}

interface SummaryItemProps {
	element: any;
	answers: any;
	answerHistory?: any;
	open?: boolean;
	setOpen?: (open: boolean) => void;
	index?: number;
}

const SummaryItem: FC<SummaryItemProps> = ({
	element,
	answers,
	answerHistory,
	open,
	setOpen,
	index,
}) => {
	const [config, setConfig] = useConfigState() as State<Form.Config>; // Config is always available in summary
	let newElements: any[] = [];
	const [answer, setAnswer] = useState(answers[element.name]);

	useEffect(() => {
		setAnswer(answers[element.name]);
	}, [answers, element.name]);

	element.elements &&
		element.elements.map((subElement: any, index: number) => {
			const nextEl = element.elements[index + 1];
			if (
				(nextEl && nextEl.startWithNewLine === false) ||
				subElement.startWithNewLine === false
			) {
				// If element and next element should be on the same line
				if (
					newElements[newElements.length - 1] &&
					newElements[newElements.length - 1].noNewLine === true
				) {
					let fixedSubElement = { ...subElement };
					fixedSubElement.startWithNewLine = true;
					newElements[newElements.length - 1].elements.push(fixedSubElement);
				} else {
					newElements.push({
						elements: [subElement],
						noNewLine: true,
					});
				}
			} else {
				newElements.push(subElement);
			}
		});

	if (
		(element.choices || element.type == 'text' || element.type == 'matrix') &&
		!answer &&
		config.hideUnanswered == true
	)
		return null;

	const checkForAnswers = (elements: any) => {
		return elements.some((subElement: any) => {
			if (answers[subElement.name] != undefined) {
				return true;
			} else if (subElement.elements) {
				return checkForAnswers(subElement.elements);
			} else {
				return false;
			}
		});
	};

	// Check if any subelements of the panel or page have answers
	if (newElements.length > 0 && config.hideUnanswered) {
		const hasAnswers = checkForAnswers(newElements);
		if (!hasAnswers) return null;
	}

	const hasTitle =
		element.titleLocation != 'hidden' &&
		((element.type != undefined && element.type != 'panel') ||
			(element.title != undefined && (element.title as string).trim() != ''));

	// If there are no answers, no title and no sub-elements, return null
	// Disabled for now, needs testing if needed
	// if (!answer && newElements.length == 0 && !hasTitle) return null;

	const answerDataObj = JSON.parse(config.answerData || '{}');
	const timeType = !!element.inputType
		? ['time', 'date', 'datetime-local', 'week', 'month'].includes(element.inputType as string)
			? element.inputType
			: undefined
		: undefined;

	if (element.visibleIf) {
		if (!evaluateLogic(element.visibleIf, answerDataObj, timeType)) return null;
	}

	const canEdit =
		config.summaryEditable &&
		(!!element.enableIf ? evaluateLogic(element.enableIf, answerDataObj, timeType) : true);

	const isRequired = !!element.requiredIf
		? evaluateLogic(element.requiredIf, answerDataObj, timeType)
		: !!element.isRequired;

	const saveAnswers = (newAnswers: string) => {
		if (config.addToAnswers && config.addToAnswers.trim() != '') {
			const answersArray = config.answers || [];
			const now = new Date();
			const timestamp = now.toISOString();
			const newAnswerEntry = {
				answer: newAnswers,
				user: config.addToAnswers,
				timestamp: timestamp,
			};
			setConfig({
				...config,
				answerData: newAnswers,
				answers: [...answersArray, newAnswerEntry],
			});
		} else {
			setConfig({
				...config,
				answerData: newAnswers,
			});
		}

		if (config.scriptNames?.onChange) {
			performScript('onChange', {
				result: newAnswers,
				hasErrors: false,
				type: config.type,
			});
		}
	};

	return (
		<div
			className={`question${element.type ? ' ' + element.type : ''} ${
				typeof index === 'number' ? (index % 2 === 0 ? 'even' : 'odd') : ''
			}`}
		>
			<div className="question-content">
				{hasTitle ? (
					<p className="question-title">
						{!element.elements
							? element.title
								? element.title + ':'
								: element.name + ':'
							: element.title ?? element.title}
						{isRequired && <span className="required">*</span>}
					</p>
				) : (
					isRequired && <span className="required">*</span>
				)}
				{element.inputType == 'color' && answer && (
					<div className="color-box" style={{ backgroundColor: answer }}></div>
				)}
				{element.inputType == 'range' && answer && (
					<p className="question-answer">{answer}%</p>
				)}
				{(element.type == 'text' || element.type == 'comment') &&
					element.inputType == undefined &&
					(canEdit ? (
						<EditableTextarea
							value={answer || ''}
							onChangeValue={(v) => setAnswer(v)}
							onCommit={() => {
								if (answer !== answers[element.name]) {
									const answerData = JSON.parse(config.answerData || '{}');
									const newAnswerData = {
										...answerData,
										[element.name]: answer,
									};

									saveAnswers(JSON.stringify(newAnswerData));
								}
							}}
						/>
					) : (
						<p className="question-answer">{answer || ' '}</p>
					))}
				{element.inputType !== 'color' &&
					element.inputType !== 'range' &&
					element.type !== 'imagepicker' &&
					element.type !== 'comment' &&
					typeof answer !== 'object' &&
					answer != undefined &&
					!(
						(element.type == 'text' || element.type == 'comment') &&
						element.inputType == undefined
					) && <p className="question-answer">{answer}</p>}
			</div>
			{element.type == 'imagepicker' && answer && (
				<img src={answer} alt={answer} className="image" />
			)}
			{element.type == 'file' &&
				answer != undefined &&
				answer.map((answer: any) => (
					<img
						key={answer.name}
						src={answer.content}
						alt={answer.name}
						className="image"
					/>
				))}
			{element.type == 'multipletext' && (
				<div className="multipletext-container">
					{element.items?.map((item: any, index: number) => {
						const value = answer?.[index]?.value ?? '';

						return (
							<div key={item.name ?? index} className="multipletext-item">
								<p className="question-title">{item.name}:</p>
								{canEdit ? (
									<EditableTextarea
										value={value}
										onChangeValue={(v) => {
											setAnswer((prev: any[] | undefined) => {
												const base =
													prev ??
													element.items.map(() => ({ value: '' }));
												const next = [...base];
												next[index] = {
													...(next[index] ?? { value: '' }),
													value: v,
												};
												return next;
											});
										}}
										onCommit={() => {
											if (answer !== answers[element.name]) {
												const answerData = JSON.parse(
													config.answerData || '{}'
												);
												const newAnswerData = {
													...answerData,
													[element.name]: {
														...(answerData[element.name] || {}),
														[item.name]: answer?.[index]?.value,
													},
												};

												saveAnswers(JSON.stringify(newAnswerData));
											}
										}}
									/>
								) : (
									<p className="question-answer">{value || ' '}</p>
								)}
							</div>
						);
					})}
				</div>
			)}
			{element.type == 'matrixdynamic' && (
				<div>
					<div className="column-header">
						<div className="row-header"></div> {/* Empty div for the first column */}
						{element.columns.map((column: any, index: number) => (
							<div key={index}>
								<p>{column.text ?? column.title ?? column.name ?? column}</p>
							</div>
						))}
					</div>
					{answer?.map((row: any, index: number) => {
						return (
							<div key={index} className="row">
								<div className="row-header">
									<p>{index + 1}</p>
								</div>
								{element.columns.map((column: any, index: number) => {
									const colName = column.name ?? column.value ?? column;
									const ans = row[colName];

									return (
										<div key={index} className="column">
											<p
												className={
													typeof ans === 'boolean' ? 'crossmark' : ''
												}
											>
												{ans ? (typeof ans === 'boolean' ? 'X' : ans) : ''}
											</p>
										</div>
									);
								})}
							</div>
						);
					}) ?? (
						<div className="row">
							<div className="row-header">
								<p>1</p>
							</div>
							{element.columns.map((_: any, index: number) => (
								<div key={index} className="column" />
							))}
						</div>
					)}
				</div>
			)}
			{(element.type == 'matrix' || element.type == 'matrixdropdown') && (
				<div>
					<div className="column-header">
						<div className="row-header"></div> {/* Empty div for the first column */}
						{element.columns.map((column: any, index: number) => (
							<div key={index}>
								<p>{column.text ?? column.title ?? column.name ?? column}</p>
							</div>
						))}
					</div>
					{element.rows.map((row: any, index: number) => {
						const rowName = row.name ?? row.value ?? row;
						const rowTitle = row.text ?? row.name ?? row;

						return (
							<div key={index} className="row">
								<div className="row-header">
									<p>{rowTitle}</p>
								</div>
								{element.columns.map((column: any, index: number) => {
									const colName = column.name ?? column.value ?? column;
									const ans = answer?.[rowName]?.[colName];

									return (
										<div key={index} className="column">
											<p
												className={
													typeof ans === 'boolean' ? 'crossmark' : ''
												}
											>
												{ans ? (typeof ans === 'boolean' ? 'X' : ans) : ''}
											</p>
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			)}
			{answerHistory?.some((item: any) => item.answers != undefined) && (
				<HistoryItem
					answerHistory={answerHistory}
					elementName={element.name}
					element={element}
					anyOpen={open || false}
					setAnyOpen={setOpen || (() => {})}
				/>
			)}
			{newElements.length > 0 && (
				<div className={`sub-elements${element.noNewLine ? ' no-new-line' : ''}`}>
					{' '}
					{newElements.map((subElement: any, index: number) => (
						<SummaryItem
							index={index}
							key={index}
							element={subElement}
							answers={answers}
							answerHistory={answerHistory || undefined}
							open={open}
							setOpen={setOpen}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default SummaryItem;
