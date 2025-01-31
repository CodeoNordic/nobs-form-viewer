export function warn(...args: any[]) {
    if (window._config?.ignoreWarnings) return;
    console.warn(...args);
}

export function info(...args: any[]) {
    if (window._config?.ignoreInfo) return;
    console.info('Info:', ...args);
}