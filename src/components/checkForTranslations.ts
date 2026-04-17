export const checkForTranslations = (survey: any) => {
	const questions: any[] = [];

	const getNestedQuestions = (elements: any[]) => {
		let nestedQuestions: any[] = [];

		if (!elements) return nestedQuestions;

		elements.forEach((el) => {
			if (el.elements) {
				nestedQuestions = nestedQuestions.concat(getNestedQuestions(el.elements));
			} else if (el.choices?.some((choice: any) => choice.elements)) {
				nestedQuestions = nestedQuestions.concat(getNestedQuestions(el.choices));
				nestedQuestions.push(el);
			} else {
				nestedQuestions.push(el);
			}
		});

		return nestedQuestions;
	};

	survey.pages.forEach((page: any) => {
		questions.push(...getNestedQuestions(page.elements));
	});

	// Check for translations in question titles, descriptions, and choice texts
	return (
		questions.some(
			(q) => q.title && typeof q.title === 'object' && Object.keys(q.title).length > 0
		) ||
		questions.some(
			(q) =>
				q.description &&
				typeof q.description === 'object' &&
				Object.keys(q.description).length > 0
		) ||
		questions.some((q) =>
			q.choices?.some(
				(choice: any) =>
					choice.text &&
					typeof choice.text === 'object' &&
					Object.keys(choice.text).length > 0
			)
		)
	);
};
