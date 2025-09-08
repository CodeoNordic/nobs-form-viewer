import { useConfigState } from '@context/Config';
import performScript from '@utils/performScript';
import { Model, Survey } from 'survey-react-ui';
import { warn } from '@utils/log';
import { useMemo } from 'react';
import 'survey-core/i18n';
import { Serializer, SurveyError } from 'survey-core';
import fetchFromFileMaker from '@utils/fetchFromFilemaker';
import { useCreateMethod } from '@utils/createMethod';

const FormViewer: FC = () => {
	const [config, setConfig] = useConfigState();

	if (!config) return null;

	useCreateMethod(
		'validateForm',
		() => {
			if (!survey) {
				warn('No survey model available to validate.');
				return;
			}

			if (config.scriptNames?.onFinishValidation) {
				performScript(
					config.scriptNames.onFinishValidation,
					survey.validate(),
					undefined,
					true
				);
			}
		},
		[]
	);

	// useMemo so you can choose when to re-render
	const survey = useMemo(() => {
		if (config.validateFromFileMaker && config.scriptNames?.validate) {
			// needs to happen before creating the survey
			Serializer.addProperty('question', {
				name: 'validateFromFileMaker',
				displayName:
					config.locale == 'en' ? 'Validate from FileMaker' : 'Valider fra FileMaker',
				default: false,
				visible: true,
				category: 'validation',
				type: 'boolean',
			});
		}

		const newSurvey = new Model(config.value);

		// Attempt to add existing answer data
		const prevData = config.answerData;
		if (prevData) {
			try {
				const data = JSON.parse(prevData);
				newSurvey.data = data;

				if (data.pageNo) {
					newSurvey.currentPageNo = data.pageNo;
				}
			} catch (e) {
				warn('Failed to parse answer data, will start with empty data.', e);
			}
		}

		newSurvey.locale = config.locale;

		// Save answer data on answer and page change
		const saveAnswerData = (result: Model) => {
			const hasErrors = result.hasErrors(false);
			const data = result.data;
			data.pageNo = result.currentPageNo;

			if (config.scriptNames?.onChange) {
				performScript('onChange', {
					result: JSON.stringify(data),
					hasErrors,
					type: config.type,
				});
			}

			setConfig({ ...config, answerData: JSON.stringify(data) });
		};

		const validateQuestion = async (_: any, options: any, addErr: boolean = true) => {
			const question = newSurvey.getQuestionByName(options.question.name);

			// Preserve "existing" errors (if any) to avoid flicker
			if (options.question.errors.length > 0) {
				options.error = options.question.errors[0].text;
			}

			if (
				options.question &&
				config.scriptNames?.validate &&
				options.question.validateFromFileMaker
			) {
				try {
					const res = await fetchFromFileMaker(
						config.scriptNames.validate,
						{
							name: options.question.name,
							value: options.value as string,
						},
						undefined,
						true,
						30000
					);

					const data = res as { status: boolean; message?: string } | null;

					if (data?.status === false && !data.message) {
						const msg = config.locale == 'en' ? 'Invalid value.' : 'Ugyldig verdi.';
						addErr && (question.errors = [new SurveyError(msg)]);
						return msg;
					} else if (data?.status === false && data.message) {
						addErr && (question.errors = [new SurveyError(data.message)]);
						return data.message;
					} else {
						addErr && (question.errors = []);
						return null;
					}
				} catch (e) {
					warn('Failed to validate question using filemaker.', e);
					addErr && (question.errors = []);
					return null;
				}
			}
			return null;
		};

		if (JSON.parse(config.value || '{}').checkErrorsMode === 'onValueChanged') {
			newSurvey.onValidateQuestion.add(validateQuestion);
		} else {
			newSurvey.onServerValidateQuestions.add(async (_, { data, errors, complete }) => {
				await Promise.all(
					Object.keys(data).map(async (key) => {
						const question = newSurvey.getQuestionByName(key);

						const error = await validateQuestion(
							null,
							{
								question,
								value: data[key],
								error: '',
							},
							false
						);

						if (error) {
							errors[key] = error;
						}
					})
				);

				complete();
			});
		}

		newSurvey.onValueChanged.add((result) => {
			saveAnswerData(result);
		});

		newSurvey.onCurrentPageChanged.add((result) => {
			saveAnswerData(result);
		});

		newSurvey.onComplete.add((result) => {
			if (config.scriptNames?.onSubmit) {
				performScript('onSubmit', { result: result.data });
			}
		});

		if (config.hideCompleteButton) {
			const completeButton = newSurvey.navigationBar.actions.find(
				(x) => x.id === 'sv-nav-complete'
			);
			completeButton &&
				newSurvey.navigationBar.actions.splice(
					newSurvey.navigationBar.actions.indexOf(completeButton),
					1
				);
		}

		return newSurvey;
	}, [
		config.value,
		config.locale,
		config.compact,
		config.scriptNames,
		config.hideCompleteButton,
	]); // Add deps that should trigger a re-render

	return <Survey model={survey} />;
};

export default FormViewer;
