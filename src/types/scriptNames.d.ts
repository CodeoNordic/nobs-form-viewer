declare global {
    namespace Form {
        interface ScriptNames {
            /** Script to be ran when autosave triggers */
            autoSave?: string;

            /** Script to be ran to validate a question. Return true if valid, false if not.
             *  Can also return a string with an error message
             */
            validate?: string;

            /** Script to be ran when a question is answered */
            onChange?: string;

            /** Script to run when form is submitted */
            onSubmit?: string;

            /** Only used if the script result shall be returned to JS */
            onJsRequest?: string;
            onJsError?: string;            
        }
    }
}

export {};