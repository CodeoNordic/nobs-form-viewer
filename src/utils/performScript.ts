import { info, warn } from '@utils/log';

import isDevMode from './isDevMode';
export const loadCallbacks: VoidFunction[] = [];

/**
 * Performs a FileMaker script
 * @param key The key of the script as per `Form.Config`
 * @param param The parameter to pass to the script
 * @param option The option to pass to the script
 * @param directScriptName Whether to use the key as the script name directly
 * @returns The result of the script, or an error message
 * @example
 * ```ts
 * performScript('onJsError', 'An error occurred');
 * ```
 */
export default function performScript(
	key: (string & keyof Form.ScriptNames) | (string & { _v?: any }),
	param?: any,
	option?: Parameters<(typeof window)['FileMaker']['PerformScriptWithOption']>[2],
	directScriptName: boolean = false
): string | boolean {
	if (!window._config && !directScriptName) {
		loadCallbacks.push(() => {
			performScript(key, param, option);
		});

		warn(`Script ${key} was called before the config was loaded, a load callback was added`);
		return true;
	}

	try {
		const parsedParam = typeof param === 'undefined' ? param : JSON.stringify(param);

		const scriptName = directScriptName
			? key
			: window._config?.scriptNames?.[key as keyof Form.Config['scriptNames']];
		if (typeof scriptName !== 'string') {
			const msg = `Script name of the key '${key}' was not found in the config`;
			key !== 'onJsError' && warn(msg);
			return msg;
		}

		if (!window.FileMaker && isDevMode()) {
			info(`[DEV]: Running script '${scriptName}' with param:`, param);
			return true;
		}

		if (Number.isInteger(Number(option ?? NaN)))
			window.FileMaker.PerformScript(
				scriptName,
				typeof parsedParam === 'undefined' ? '' : parsedParam
			);
		else
			window.FileMaker.PerformScriptWithOption(
				scriptName,
				typeof parsedParam === 'undefined' ? '' : parsedParam,
				option!
			);

		return true;
	} catch (err) {
		console.error(err);
		return (err as Error).message || (err as string);
	}
}
