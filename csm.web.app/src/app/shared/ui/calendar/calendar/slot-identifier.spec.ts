/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    SlotIdentifier,
    SlotIdentifierPair
} from './slot-identifier';

describe('Slot Identifier', () => {
    it('should return correct string when calling stringify()', () => {
        const columnIndex = 1;
        const rowIndex = 2;
        const expectedResult = `slot-${columnIndex}-${rowIndex}`;
        const identifier = new SlotIdentifier(1, 2);

        expect(identifier.stringify()).toBe(expectedResult);
    });

    it('should return correct SlotIdentifierPair when calling parse()', () => {
        const columnIndex = 1;
        const rowIndex = 2;
        const expectedResult: SlotIdentifierPair = {
            columnIndex,
            rowIndex,
        };
        const identifier = new SlotIdentifier(1, 2);

        expect(identifier.parse()).toEqual(expectedResult);
    });

    it('should create correct SlotIdentifier from string', () => {
        const columnIndex = 1;
        const rowIndex = 2;
        const stringIdentifier = `slot-${columnIndex}-${rowIndex}`;
        const expectedResult: SlotIdentifierPair = {
            columnIndex,
            rowIndex,
        };
        const identifier = SlotIdentifier.fromString(stringIdentifier);

        expect(identifier.parse()).toEqual(expectedResult);
    });
});
