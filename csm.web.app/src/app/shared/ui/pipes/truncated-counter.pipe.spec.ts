/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {TruncatedCounterPipe} from './truncated-counter.pipe';

describe('Truncated Counter Pipe', () => {
    let pipe: TruncatedCounterPipe;

    beforeEach(() => {
        pipe = new TruncatedCounterPipe();
    });

    it('should transform a value bigger than the maximum value to a truncated value', () => {
        const value = 100;
        const maxValue = 99;
        const expectedValue = `${maxValue}+`;

        expect(pipe.transform(value, maxValue)).toBe(expectedValue);
    });

    it('should not transform a value smaller than the maximum value', () => {
        const value = 50;
        const maxValue = 99;
        const expectedValue = value.toString();

        expect(pipe.transform(value, maxValue)).toBe(expectedValue);
    });

    it('should not transform a value equal to the maximum value', () => {
        const value = 99;
        const maxValue = 99;
        const expectedValue = value.toString();

        expect(pipe.transform(value, maxValue)).toBe(expectedValue);
    });
});
