export const getTimeAgo = (date: string) => {
    const sinceUploadMs = new Date().getTime() - new Date(date).getTime();
    const years = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(sinceUploadMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((sinceUploadMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((sinceUploadMs / (1000 * 60)) % 60);
    const seconds = Math.floor((sinceUploadMs / 1000) % 60);

    const isNo = window._config?.locale === 'no';

    const translations = {
        years: isNo ? 'år' : years === 1 ? 'year' : 'years',
        months: isNo ? months === 1 ? 'måned' : 'måneder' : months === 1 ? 'month' : 'months',
        days: isNo ? days === 1 ? 'dag' : 'dager' : days === 1 ? 'day' : 'days',
        hours: isNo ? hours === 1 ? 'time' : 'timer' : hours === 1 ? 'hour' : 'hours',
        minutes: isNo ? minutes === 1 ? 'minutt' : 'minutter' : minutes === 1 ? 'minute' : 'minutes',
        seconds: isNo ? seconds === 1 ?  'sekund' : 'sekunder' : seconds === 1 ? 'second' : 'seconds',
        ago: isNo ? 'siden' : 'ago',
    };

    if (years > 0) {
        return `${years} ${translations.years} ${translations.ago}`;
    } else if (months > 0) {
        return `${months} ${translations.months} ${translations.ago}`;
    } else if (days > 0) {
        return `${days} ${translations.days} ${translations.ago}`;
    } else if (hours > 0) {
        return `${hours} ${translations.hours} ${translations.ago}`;
    } else if (minutes > 0) {
        return `${minutes} ${translations.minutes} ${translations.ago}`;
    } else if (seconds > 0) {
        return `${seconds} ${translations.seconds} ${translations.ago}`;
    } else {
        return isNo ? 'akkurat nå' : 'just now';
    }
}