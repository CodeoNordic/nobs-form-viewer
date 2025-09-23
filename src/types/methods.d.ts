declare global {
	interface Window {
		onScriptResult(uuid: string, data: string): void;

		/** Initialize the component */
		init(config: string): void;

		/** Set a specific value in the config */
		setConfigValue<K extends string & keyof Form.Config>(
			k: K,
			prop: Form.Config[K],
			type?: number
		): void;
	}
}

export {};
