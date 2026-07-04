export function safeParse(str) {
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return { raw: str };
    }
}