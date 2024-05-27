/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

export class LocationStub {

    public origin = 'http://localhost:8000';

    private _href: string;

    public set href(href: string) {
        this._href = href;
    }

    public get href(): string {
        return this._href;
    }
}
