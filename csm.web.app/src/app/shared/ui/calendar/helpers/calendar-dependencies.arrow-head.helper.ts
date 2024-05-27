/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

export class CalendarDependencyArrowHeadHelper {

    /**
     *
     * Formats a number to a fixed amounts of digits, then removes unnecessary trailing zeros and minus signs
     *
     * @param aNumber number to be formatted
     * @param digits amount of digits
     * @returns formatted number as a string
     */
    public static formatNumber(aNumber: number, digits = 3): string {
        return parseFloat(aNumber.toFixed(digits)).toString();
    }

    /**
     *
     * Generates an SVG path definition for an arrow head
     *
     * @param size length of the diagonals
     * @param angle pointing angle
     * @returns an SVG path definition string
     */
    public static generatePath(size: number, angle: number): string {
        const {formatNumber} = CalendarDependencyArrowHeadHelper;
        const {sin, cos, PI, SQRT2} = Math;
        const DEG_TO_RAD = PI / 180;
        const hypotenuse = size * SQRT2;
        const lines = [
            [cos((angle + 225) * DEG_TO_RAD) * size, sin((angle + 225) * DEG_TO_RAD) * size],
            [cos((angle + 90) * DEG_TO_RAD) * hypotenuse, sin((angle + 90) * DEG_TO_RAD) * hypotenuse],
        ];

        return `l${lines.map(point => point.map(component => formatNumber(component)).join()).join(' ')}z`;
    }
}
