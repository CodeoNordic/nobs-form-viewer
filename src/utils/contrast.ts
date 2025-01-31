import tinycolor from "tinycolor2";
import rgbaToRgb from "rgba-to-rgb";

/**
 * calculates the luminance of a color from 0 to 1
 * @param r red value
 * @param g green value
 * @param b blue value
 * @returns luminance of the color
 * @example
 * ```ts
 * luminance(0, 0, 0); // 0
 * luminance(255, 255, 255); // 1
 * ```
*/
export function luminance(r: number, g:number, b:number) {
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;

    const GAMMA = 2.4;

    var a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, GAMMA);
    });

    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

/**
 * calculates the contrast ratio between two colors from 1 to 21
 * @param rgb1 first color in rgb format
 * @param rgb2 second color in rgb format"
 * @returns contrast ratio between two colors
 * @example
 * ```ts
 * contrast([0, 0, 0], [255, 255, 255]); // 21
 * contrast([0, 0, 0], [0, 0, 0]); // 1
 * ```
*/
export function contrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    var lum1 = luminance(...rgb1);
    var lum2 = luminance(...rgb2);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * calculates the contrast between two colors and checks if it is greater than contrastMin
 * @param color color to check contrast (any valid css color)
 * @param bg background color (any valid css color), default is white
 * @param contrastMin minimum contrast value, default is 2
 * @returns if the contrast is greater than contrastMin
 * @example
 * ```ts
 * calculateContrast("#000", "white"); // true
 * calculateContrast("rgb(0, 0, 0)", "#000000"); // false
 * ```
 */
export default function calculateContrast(color: string, bg: string = "#fff", contrastMin: number = 2): boolean {
    const colorRGBAObj = tinycolor(color).toRgb();
    const bgRGBAObj = tinycolor(bg).toRgb();

    const bgRGB = rgbaToRgb("rgb(255, 255, 255)", `rgba(${bgRGBAObj.r}, ${bgRGBAObj.g}, ${bgRGBAObj.b}, ${bgRGBAObj.a || 1})`);
    const bgRGBObj = tinycolor(bgRGB).toRgb();

    const rgb = rgbaToRgb(bgRGB, `rgba(${colorRGBAObj.r}, ${colorRGBAObj.g}, ${colorRGBAObj.b}, ${colorRGBAObj.a || 1})`);

    const rgbObj = tinycolor(rgb).toRgb();

    const contrastValue = contrast([rgbObj.r, rgbObj.g, rgbObj.b], [bgRGBObj.r, bgRGBObj.g, bgRGBObj.b]);
    
    return contrastValue > contrastMin;
};