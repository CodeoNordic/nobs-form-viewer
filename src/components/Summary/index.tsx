import { default as buildPDF, Resolution } from 'react-to-pdf';
import { useRef, useEffect, useMemo, useState } from 'react';

import { useCreateMethod } from '@utils/createMethod';
import dateFromString from '@utils/dateFromString';
import performScript from '@utils/performScript';
import extractAnswers from './extractAnswers';
import { useConfig } from '@context/Config';
import { HistoryList } from './History';
import SummaryItem from './SummaryItem';
import Footer from './Footer';
import Header from './Header';

const Summary: FC = () => {
	const config = useConfig();

	const [historyItemOpen, setHistoryItemOpen] = useState(false);

	// Used for bottom right button
	const [sortedHitory, setSortedHistory] = useState<any[]>([]);
	// Used for each summary item
	const [sortedAnswerHistory, setSortedAnswerHistory] = useState<any>([]);

	// Sort answer history by timestamp and extract answers
	useEffect(() => {
		if (config && config.answers && config.answers.length > 0) {
			const sortedHistory = [...config.answers].sort((a, b) => {
				const dateA = dateFromString(a.timestamp || '');
				const dateB = dateFromString(b.timestamp || '');
				if (!dateA && !dateB) return 0;
				if (!dateA) return 1;
				if (!dateB) return -1;
				return dateB.getTime() - dateA.getTime();
			});

			const answers = sortedHistory.map((h) => JSON.parse(h.answer || '{}'));
			const parsedAnswers = answers.map((a) =>
				extractAnswers(a, JSON.parse(config.value!), config)
			);

			let answerHistoryFull = answers.map((answer, index) => {
				return {
					answers: answer,
					parsedAnswers: parsedAnswers[index],
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

	const targetRef = useRef<HTMLDivElement | null>(null);

	// Handle PDF generation
	useCreateMethod(
		'generatePDF',
		() => {
			if (!targetRef.current) return;

			const copy = targetRef.current.cloneNode(true) as HTMLDivElement;
			document.body.appendChild(copy);
			copy.classList.add('pdf-root', 'summary');

			buildPDF(() => copy, {
				method: 'build',
				resolution: Resolution.MEDIUM,
				page: {
					format: 'A4',
					orientation: 'portrait',
				},
			}).then((pdf) => {
				const blob = pdf.output('blob');

				const reader = new FileReader();

				// This function runs when the reader has finished converting the PDF to base64
				reader.onloadend = () => {
					if (typeof reader.result !== 'string')
						return console.error(`Reader result was not a string: ${reader.result}`);
					else performScript('onPDF', reader.result);

					copy.remove();
				};

				reader.readAsDataURL(blob);
			});
		},
		[targetRef]
	);

	return (
		<div>
			{sortedHitory.length > 0 && (
				<HistoryList sortedHistory={sortedHitory} historyItemOpen={historyItemOpen} />
			)}
			<div className={'summary' + (config.style ? ' ' + config.style : '')} ref={targetRef}>
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
							index={index}
							key={index}
							element={page}
							answers={answers}
							answerHistory={sortedAnswerHistory}
							open={historyItemOpen}
							setOpen={setHistoryItemOpen}
						/>
					))}
				</div>
				<Footer />
			</div>
		</div>
	);
};

export default Summary;
