export function evaluateVisibleIf(expr: string, answers: Record<string, any>): boolean {
    if (!expr || typeof expr !== "string") return true; // fail-open

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
            if (op === ">")  return a > b;
            if (op === ">=") return a >= b;
            if (op === "<")  return a < b;
            if (op === "<=") return a <= b;
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
