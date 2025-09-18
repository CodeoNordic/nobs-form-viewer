declare global {
	namespace Form {
		interface Config {
			// The form data, in json format
			value?: string;

			// The current answers to the form, updated along the way.
			// Use to continue where the user left off
			answerData?: string;

			// If the form should be compact or not
			compact?: boolean;

			// If some questions should be validated from FileMaker
			// Must have the validate script name in the scriptNames object
			validateFromFileMaker?: boolean;

			// Hides the button to complete the form
			hideCompleteButton?: boolean;

			// The language of the form, can be more if needed
			locale: 'no' | 'en';

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
