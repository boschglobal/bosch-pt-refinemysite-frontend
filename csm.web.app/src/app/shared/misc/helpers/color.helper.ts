/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {COLORS_ALPHA_PERCENTAGE} from '../../ui/constants/colors.constant';

export class ColorHelper {
    public static toHex(value: number): string {
        return ('0' + (Number(value).toString(16))).slice(-2).toUpperCase();
    }

    public static percentageToHex(percentage: number): string {
        return ColorHelper.toHex(Math.round((percentage / 100) * 255));
    }

    public static getColorWithAlpha(color: string, alphaPercentage: number = COLORS_ALPHA_PERCENTAGE): string {
        return `${color}${ColorHelper.percentageToHex(alphaPercentage)}`;
    }

    public static parseColor(color: string): [number, number, number]|undefined {
        if (/^#[0-9a-f]{6}$/i.test(color)) {
            return [
                parseInt(color.slice(1,3), 16) / 255,
                parseInt(color.slice(3,5), 16) / 255,
                parseInt(color.slice(5,7), 16) / 255,
            ];
        }
        if (/^#[0-9a-f]{3}$/i.test(color)) {
            return [
                parseInt(color.slice(1,2), 16) * 17 / 255,
                parseInt(color.slice(2,3), 16) * 17 / 255,
                parseInt(color.slice(3,4), 16) * 17 / 255,
            ];
        }
        if (/^rgba?\(\d+(,\s*\d+){2,3}\)$/.test(color)) {
            const [red, green, blue] = color
                .slice(color.indexOf('(') + 1, color.indexOf(')'))
                .split(',').map(val => parseInt(val, 10) / 255);
            return [red, green, blue];
        }
    }

    public static buildHexColor([red, green, blue]: [number, number, number]): string {
        return '#' + [
            Math.round(red * 255).toString(16).padStart(2, '0'),
            Math.round(green * 255).toString(16).padStart(2, '0'),
            Math.round(blue * 255).toString(16).padStart(2, '0'),
        ].join('');
    }

    /**
     * Mixes two colors with the formula sqrt((1. - factor) * a^2 + factor * b^2)
     *
     * @param hexColor1 a color in the hex format
     * @param hexColor2 another color in hex format
     * @param factor mixing factor
     * @see https://yewtu.be/LKnqECcg6Gw (Computer Color is broken)
     */
    public static blendColor(hexColor1: string, hexColor2: string, factor: number): string {
        const {sqrt} = Math;
        const [r1, g1, b1] = this.parseColor(hexColor1);
        const [r2, g2, b2] = this.parseColor(hexColor2);
        return this.buildHexColor([
            sqrt((1 - factor) * r1 ** 2 + factor * r2 ** 2),
            sqrt((1 - factor) * g1 ** 2 + factor * g2 ** 2),
            sqrt((1 - factor) * b1 ** 2 + factor * b2 ** 2),
        ]);
    }

}
