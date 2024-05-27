/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ColorHelper} from './color.helper';

describe('Color Helper', () => {

    it('should retrieve the correct color with opacity when opacity value is given', () => {
        const color = '#990000';
        const alpha = 100;
        const hexAlpha = 'FF';
        const expectedResult = `${color}${hexAlpha}`;

        expect(ColorHelper.getColorWithAlpha(color, alpha)).toBe(expectedResult);
    });

    it('should be able to parse hex css colors', () => {
        const color = '#bada55';
        const [red, green, blue] = ColorHelper.parseColor(color);

        expect(red).toEqual(0xba / 255);
        expect(green).toEqual(0xda / 255);
        expect(blue).toEqual(0x55 / 255);
    });

    it('should be able to parse 3-digit hex css colors', () => {
        const color = '#123';
        const [red, green, blue] = ColorHelper.parseColor(color);

        expect(red).toEqual(0x11 / 255);
        expect(green).toEqual(0x22 / 255);
        expect(blue).toEqual(0x33 / 255);
    });

    it('should be able to parse rgb() css colors', () => {
        const color = 'rgb(100, 150, 200)';
        const [red, green, blue] = ColorHelper.parseColor(color);

        expect(red).toEqual(100 / 255);
        expect(green).toEqual(150 / 255);
        expect(blue).toEqual(200 / 255);
    });

    it('should be able to build a hex color', () => {
        expect(ColorHelper.buildHexColor([.25, .5, .75])).toEqual('#4080bf');
    });

    it('should be able to blend two hex colors', () => {
        expect(ColorHelper.blendColor('rgba(100, 100, 100, 1)', '#fff', .5)).toEqual('#c2c2c2');
    });

});
