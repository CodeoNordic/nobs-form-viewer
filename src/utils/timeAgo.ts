export const getTimeAgo = (date: string) => {
    const sinceUploadMs = new Date().getTime() - new Date(date).getTime();
    const years = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((sinceUploadMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((sinceUploadMs / (1000 * 60)) % 60);
    const seconds = Math.floor((sinceUploadMs / 1000) % 60);

    const translations = {
        years: window._config?.locale === 'no' ? 'år' : years === 1 ? 'year' : 'years',
        months: window._config?.locale === 'no' ? 'måneder' : months === 1 ? 'month' : 'months',
        days: window._config?.locale === 'no' ? 'dager' : days === 1 ? 'day' : 'days',
        hours: window._config?.locale === 'no' ? 'timer' : hours === 1 ? 'hour' : 'hours',
        minutes: window._config?.locale === 'no' ? 'minutter' : minutes === 1 ? 'minute' : 'minutes',
        seconds: window._config?.locale === 'no' ? 'sekunder' : seconds === 1 ? 'second' : 'seconds',
    }

    return years > 0 ?
        `${years} ${translations.years} ago` :
        months > 0 ?
        `${months} ${translations.months} ago` :
        days > 0 ?
        `${days} ${translations.days} ago` :
        hours > 0 ?
        `${hours} ${translations.hours} ago` :
        minutes > 0 ?
        `${minutes} ${translations.minutes} ago` :
        seconds > 0 ?
        `${seconds} ${translations.seconds} ago` :
        (window._config?.locale === 'no' ? 'akkurat nå' : 'just now');
}