/**
 * Clamps a number between a minimum and maximum value
 * @param num number to clamp
 * @param min minimum value
 * @param max maximum value
 * @returns clamped number
 * @example
 * ```ts
 * clamp(5, 0, 10); // 5
 * clamp(15, 0, 10); // 10
 * clamp(-5, 0, 10); // 0
 * ```
 */
export default function clamp(num: number, min: number, max: number) {
    return Math.max(
        Math.min(max, num),
        min
    );
}