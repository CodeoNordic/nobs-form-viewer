import { useConfigState } from '@context/Config';
import performScript from '@utils/performScript';
import { Model, Survey } from 'survey-react-ui';
import { warn } from '@utils/log';
import { useMemo, useState } from 'react';
import 'survey-core/i18n';
import { Serializer, SurveyError } from 'survey-core';
import fetchFromFileMaker from '@utils/fetchFromFilemaker';
import { useCreateMethod } from '@utils/createMethod';
import surveyJson from '@styles/survey_theme.js';
import { Tooltip } from 'react-tooltip';
import LanguageIcon from 'jsx:@svg/language-icon.svg';
import { surveyLocalization } from 'survey-react-ui';
import { checkForTranslations } from './checkForTranslations';

const FormViewer: FC = () => {
	const [config, setConfig] = useConfigState() as State<Form.Config>; // Config is always set here
	const [numbered, setNumbered] = useState(false);
	const [hasTranslations, setHasTranslations] = useState(false);

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
		newSurvey.locale = config.locale;

		surveyLocalization.defaultLocale = 'no';
		surveyLocalization.currentLocale = config.locale;
		surveyLocalization.supportedLocales = ['no', 'en'];

		newSurvey.applyTheme(surveyJson as any);

		if (JSON.parse(config?.value || '{}').showQuestionNumbers) {
			setNumbered(true);
		} else {
			setNumbered(false);
		}
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

		// Save answer data on answer and page change
		const saveAnswerData = (result: Model, close: boolean = false) => {
			const hasErrors = result.hasErrors(false);
			const data = result.data;
			data.pageNo = result.currentPageNo;

			if (config.scriptNames?.onChange) {
				performScript('onChange', {
					result: JSON.stringify(data),
					hasErrors,
					type: 'viewer',
					sub: config.sub || undefined,
					close,
				});
			}

			setConfig({ ...config, answerData: JSON.stringify(data) });
		};

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

		setHasTranslations(checkForTranslations(JSON.parse(config.value || '{}')));

		return newSurvey;
	}, [
		config.value,
		config.locale,
		config.compact,
		config.scriptNames,
		config.hideCompleteButton,
		config.saveButton,
	]); // Add deps that should trigger a re-render

	const changeLanguage = () => {
		const newLocale = config.locale === 'en' ? 'no' : 'en';

		console.log(`Switching locale from ${config.locale} to ${newLocale}`);

		setConfig({
			...config,
			locale: newLocale,
		});
	};

	return (
		<div
			className={`form-viewer ${numbered ? 'numbered' : ''} ${hasTranslations || config.saveButton ? '' : 'no-header'}`}
		>
			{(hasTranslations || config.saveButton) && (
				<div className="survey-header-container">
					<div className="survey-header">
						<div
							style={{
								height: '100%',
							}}
						>
							{config.saveButton && (
								<button
									className="save button"
									aria-label={
										config.locale === 'en' ? 'Save and close' : 'Lagre og lukk'
									}
									onClick={() => {
										if (config.scriptNames?.onChange) {
											performScript('onChange', {
												result: JSON.stringify(survey?.data),
												hasErrors: survey?.hasErrors(false),
												type: 'viewer',
												sub: config.sub || undefined,
												close: true,
											});
										}
									}}
									data-tooltip-id="tooltip-save-close"
									data-tooltip-content={
										config.locale === 'en' ? 'Save and close' : 'Lagre og lukk'
									}
									data-tooltip-delay-show={500}
								>
									{config.locale === 'en' ? 'Save and close' : 'Lagre og lukk'}
								</button>
							)}
						</div>
						{hasTranslations && (
							<button
								className="change-language button"
								aria-label="Change language"
								onClick={() => changeLanguage()}
								data-tooltip-id="tooltip-lang-toggle"
								data-tooltip-content={
									config.locale === 'no' ? 'Bytt språk' : 'Change language'
								}
								data-tooltip-delay-show={500}
							>
								<LanguageIcon />
								<p>{config.locale === 'no' ? 'EN' : 'NO'}</p>
							</button>
						)}
					</div>
				</div>
			)}
			<div className="survey-container">
				<Survey model={survey} />
			</div>
			<Tooltip id="tooltip-lang-toggle" className="tooltip" />
		</div>
	);
};

export default FormViewer;
