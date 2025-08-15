export function evaluateLogic(expr: string, answers: Record<string, any>, timeType?: "date" | "datetime-local" | "month" | "week" | "time"): boolean {
    if (!expr || typeof expr !== "string") return true;

    const m = expr.match(/^\s*\{([^}]+)\}\s*(=|<>|>=|<=|>|<|contains|notcontains|empty|notempty|anyof|allof)\s*(.*)?$/i);
    if (!m) return true; // can't parse, don't hide

    const [, leftKeyRaw, opRaw, rhsRaw = ""] = m;
    const leftKey = leftKeyRaw.trim();
    let op = opRaw.toLowerCase();
    if (op === "<>") op = "!="; // normalize operator

    const lhs = getByPath(answers, leftKey);

    if (op === "empty") {
        return lhs === undefined || lhs === null || (Array.isArray(lhs) ? lhs.length === 0 : String(lhs).trim() === "");
    }
    if (op === "notempty") {
        return !(lhs === undefined || lhs === null || (Array.isArray(lhs) ? lhs.length === 0 : String(lhs).trim() === ""));
    }

    const rhs = parseRhs(rhsRaw, answers);

    if (timeType && [">", ">=", "<", "<="].includes(op)) {
        return compareTemporal(lhs, rhs, op as ">"|">="|"<"|"<=", timeType);
    } 

    switch (op) {
        case "=":
            return looselyEqual(lhs, rhs);
        case "!=":
            return !looselyEqual(lhs, rhs);
        case "contains":
            if (Array.isArray(lhs)) return lhs.some(v => looselyEqual(v, rhs));
            if (typeof lhs === "string" || typeof lhs === "number" || typeof lhs === "boolean")
                return String(lhs).includes(String(rhs));
            return false;
        case "notcontains":
            if (Array.isArray(lhs)) return !lhs.some(v => looselyEqual(v, rhs));
            if (typeof lhs === "string" || typeof lhs === "number" || typeof lhs === "boolean")
                return !String(lhs).includes(String(rhs));
            return true;
        case "anyof":
            if (!Array.isArray(rhs)) return false;
            if (!Array.isArray(lhs)) return false;
            return rhs.some(r => lhs.some(l => looselyEqual(l, r)));
        case "allof":
            if (!Array.isArray(rhs)) return false;
            if (!Array.isArray(lhs)) return false;
            return rhs.every(r => lhs.some(l => looselyEqual(l, r)));
        case ">":
        case ">=":
        case "<":
        case "<=": {
            const a = toNumber(lhs), b = toNumber(rhs);
            if (a === null || b === null) return false;
            return OPS[op](a, b);
        }
    }
    return true; // unknown operator, don't hide
}

function parseRhs(raw: string, answers: Record<string, any>): any {
    const s = String(raw).trim();
    if (!s) return "";

    const ref = s.match(/^\{([^}]+)\}$/);
    if (ref) return getByPath(answers, ref[1].trim());

    if (s.startsWith("[") && s.endsWith("]")) {
        try {
        const jsonish = s.replace(/'/g, '"');
        return JSON.parse(jsonish);
        } catch {}
    }

    // Quoted string
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
        return s.slice(1, -1);
    }

    // Boolean
    if (/^(true|false)$/i.test(s)) return s.toLowerCase() === "true";

    const n = Number(s);
    if (!Number.isNaN(n)) return n;

    return s;
}

function getByPath(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function looselyEqual(a: any, b: any): boolean {
    if (Array.isArray(a) || Array.isArray(b)) return false;
    const an = Number(a), bn = Number(b);
    const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn) && a !== "" && b !== "";
    return bothNumeric ? an === bn : String(a) === String(b);
}

function toNumber(x: any): number | null {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
}

const OPS = {
    ">": (a: number, b: number) => a > b,
    ">=": (a: number, b: number) => a >= b,
    "<": (a: number, b: number) => a < b,
    "<=": (a: number, b: number) => a <= b,
};

function parseDateOnly(s: string): number {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return NaN;

    const y = +m[1], mon = +m[2], d = +m[3];
    return Date.UTC(y, mon - 1, d);
}

function parseMonth(s: string): number {
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return NaN;

    const y = +m[1], mon = +m[2];
    return y * 12 + (mon - 1);
}

function parseWeek(s: string): number {
    const m = /^(\d{4})-W(\d{2})$/.exec(s);
    if (!m) return NaN;

    const y = +m[1], w = +m[2];
    return y * 100 + w;
}

function parseTimeOfDay(s: string): number {
    const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
    if (!m) return NaN;
    
    const h = +m[1], min = +m[2], sec = m[3] ? +m[3] : 0;
    if (h > 23 || min > 59 || sec > 59) return NaN;
    return h * 3600 + min * 60 + sec;
}

function compareTemporal(lhs: string, rhs: string, op: ">"|">="|"<"|"<=", timeType: "date" | "datetime-local" | "month" | "week" | "time") {
    let a: number, b: number;

    switch (timeType) {
        case "date":
            a = parseDateOnly(lhs); b = parseDateOnly(rhs); break;
        case "datetime-local":
            a = new Date(lhs).getTime(); 
            b = new Date(rhs).getTime(); 
            break;
        case "month":
            a = parseMonth(lhs); b = parseMonth(rhs); break;
        case "week":
            a = parseWeek(lhs); b = parseWeek(rhs); break;
        case "time":
            a = parseTimeOfDay(lhs); b = parseTimeOfDay(rhs); break;
        default:
            return false;
    }

    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return OPS[op](a, b);
}