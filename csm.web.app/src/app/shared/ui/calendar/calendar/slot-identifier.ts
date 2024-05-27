/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export interface SlotIdentifierPair {
    columnIndex: number;
    rowIndex: number;
}

export class SlotIdentifier implements SlotIdentifierPair {
    private static prefix = 'slot-';
    private static separator = '-';
    columnIndex: number;
    rowIndex: number;

    constructor(columnIndex: number, rowIndex: number) {
        this.columnIndex = columnIndex;
        this.rowIndex = rowIndex;
    }

    static fromString(slotIdentifier: string): SlotIdentifier {
        const radix = 10;
        const [columnIndex, rowIndex] = slotIdentifier
            .replace(SlotIdentifier.prefix, '')
            .split(SlotIdentifier.separator);

        return new SlotIdentifier(parseInt(columnIndex, radix), parseInt(rowIndex, radix));
    }

    stringify(): string {
        return `${SlotIdentifier.prefix}${this.columnIndex}${SlotIdentifier.separator}${this.rowIndex}`;
    }

    parse(): SlotIdentifierPair {
        return {
            columnIndex: this.columnIndex,
            rowIndex: this.rowIndex,
        };
    }
}
