/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class UUID {

    /**
     * Generate and Return a v4 UUID
     */
    public static v4(): string {
        return `${this._random4()}${this._random4()}-${this._random4()}-${this._random4()}-${this._random4()}-${this._random4()}${this._random4()}${this._random4()}`;
    }

    private static _random4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
}
