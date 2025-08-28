declare global {
	namespace Form {
		interface Config {
			// The form data, in json format
			value?: string;

			// Old data, used to convert to the new format
			oldData?: any;

			// Answers to the form, used for a kind of version control
			answers?: {
				answer: string;
				user: string;
				timestamp?: string;
			}[];

			// Username to add to answer when saving
			addToAnswers: string;

			// The current answers to the form, updated along the way.
			// Use to continue where the user left off
			answerData?: string;

			// If answers should be editable in the summary view
			summaryEditable?: boolean;

			// The version of the form
			type: 'viewer' | 'summary';

			// If the form should be compact or not
			compact?: boolean;

			// If some questions should be validated from FileMaker
			// Must have the validate script name in the scriptNames object
			validateFromFileMaker?: boolean;

			// Hides the questions that have not been answered in the summary
			hideUnanswered?: boolean;

			// Hides the button to complete the form
			hideCompleteButton?: boolean;

			style?: 'minimal' | 'default';

			// The language of the form, can be more if needed
			locale: 'no' | 'en';

			header?: {
				navn?: string;
				fodt?: string;
				kjonn?: string;
				adresse?: string;
				telefon?: string;
				ordrenummer?: string;
				ordredato?: string;
				type?: string;
				ortopediingenior?: string;
				prodansvarlig?: string;
			};

			footer?: {
				hoyde?: string;
				vekt?: string;
				skadeside?: string;
				skadetype?: string;
				gipslager?: string;
				behandlingsrisiko?: string;
				kommunikasjonsbehov?: string;
				sted?: string;
				timeavtaler?: string;
				provedato?: string;
				planlagtLevering?: string;
				ingenior?: boolean;
				skoklinikk?: boolean;
				sendPost?: boolean;
				brev?: boolean;
				ring?: boolean;
				sms?: boolean;
				innlevertLuka?: boolean;
				tilsendtPost?: boolean;
			};

			scriptNames?: Form.ScriptNames;

			ignoreInfo: boolean;
			ignoreWarnings: boolean;
		}
	}

	// Make values accessible via window
	interface Window {
		_config?: Form.Config;
	}
}

export {};
