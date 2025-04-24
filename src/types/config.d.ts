declare global {
    namespace Form {
        interface Config {
            // The form data, in json format
            value?: string;

            // The current answers to the form, updated along the way. 
            // Use to continue where the user left off 
            answerData?: string; 

            // The version of the form
            type: 'viewer'|'summary';

            // If the form should be compact or not
            compact?: boolean;

            // If some questions should be validated from FileMaker
            // Must have the validate script name in the scriptNames object
            validateFromFileMaker?: boolean;

            // Hides the questions that have not been answered in the summary
            hideUnanswered?: boolean;

            // The language of the form, can be more if needed
            locale: "no"|"en";

            header?: {
                leftColumn?: {
                    navn?: string;
                    født?: string;
                    kjønn?: string;
                    adresse?: string;
                    telefon?: string;
                }
                rightColumn?: {
                    ordrenummer?: string;
                    ordredato?: string;
                    type?: string;
                    ortopediingeniør?: string;
                    prodansvarlig?: string;
                }
            }

            footer?: {
                top: {
                    høyde?: string;
                    vekt?: string;
                    skadeside?: string;
                    skadetype?: string;
                    gipslager?: string;
                    behandlingsrisiko?: string;
                    kommunikasjonsbehov?: string;
                    sted?: string;
                }
                bottom: {
                    timeavtaler?: string;
                    prøvedato?: string;
                    planlagtLevering?: string;
                    ingeniør?: boolean;
                    skoklinikk?: boolean;
                    sendPost?: boolean;
                    brev?: boolean;
                    ring?: boolean;
                    sms?: boolean;
                    innlevertLuka?: boolean;
                    tilsendtPost?: boolean;
                }
            }

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

export {}