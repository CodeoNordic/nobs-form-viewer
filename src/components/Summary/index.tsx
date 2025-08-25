import { useConfig } from '@context/Config';
import { useEffect, useMemo, useState } from 'react';
import SummaryItem from './SummaryItem';
import extractAnswers from './extractAnswers';
import Footer from './Footer';
import Header from './Header';
import { HistoryList } from './History';
import dateFromString from '@utils/dateFromString';

const Summary: FC = () => {
	const config = useConfig();

	// Used for bottom right button
	const [sortedHitory, setSortedHistory] = useState<any[]>([]);
	// Used for each summary item
	const [sortedAnswerHistory, setSortedAnswerHistory] = useState<any>([]);

	// Sort answer history by timestamp and extract answers
	useEffect(() => {
		if (config && config.answers && config.answers.length > 0) {
			const sortedHistory = [...config.answers].sort((a, b) => {
				const dateA = dateFromString(a.timestamp);
				const dateB = dateFromString(b.timestamp);
				if (!dateA || !dateB) return 0;
				return dateB.getTime() - dateA.getTime();
			});

			const answers = sortedHistory.map((h) => JSON.parse(h.answer || '{}'));

			let answerHistoryFull = answers.map((answer, index) => {
				return {
					answers: answer,
					user: sortedHistory[index].user,
					timestamp: sortedHistory[index].timestamp,
				};
			});

			setSortedAnswerHistory(answerHistoryFull);
			setSortedHistory(sortedHistory);
		} else {
			// Clear history if no answers, in case the config changes
			setSortedHistory([]);
			setSortedAnswerHistory([]);
		}
	}, [config?.answers]);

	if (!config) return null;

	const survey = JSON.parse(config.value!);

	const answers = useMemo(() => {
		const jsonAnswers = JSON.parse(config.answerData || '{}');

		if (!jsonAnswers || (Object.keys(jsonAnswers).length === 0 && config.oldData)) {
			Object.keys(config.oldData).forEach((key) => {
				jsonAnswers[key] = config.oldData[key].value;
			});
		}

		const newAnswers = extractAnswers(jsonAnswers, survey, config);

		return newAnswers;
	}, [config.answerData, survey]);

	useEffect(() => {
		const onBlur = () => {
			const active = document.activeElement;
			if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
				(active as HTMLElement).blur();
			}
		};

		if (config.summaryEditable) {
			window.addEventListener('blur', onBlur);
		}

		return () => {
			window.removeEventListener('blur', onBlur);
		};
	}, [config.summaryEditable]);

	return (
		<div className={'summary' + (config.style ? ' ' + config.style : '')}>
			<Header />
			<div className="summary__content">
				{survey.title && survey.showTitle !== false && (
					<p className="title">{survey.title}</p>
				)}
				{survey.description && survey.showTitle !== false && (
					<p className="description">{survey.description}</p>
				)}
				{survey.pages.map((page: any, index: number) => (
					<SummaryItem
						key={index}
						element={page}
						answers={answers}
						answerHistory={sortedAnswerHistory}
					/>
				))}
				{sortedHitory.length > 0 && <HistoryList sortedHistory={sortedHitory} />}
			</div>
			<Footer />
		</div>
	);
};

export default Summary;
