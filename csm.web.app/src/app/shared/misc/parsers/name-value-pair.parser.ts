/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class NameValuePairParser {
    private readonly _parserFn: (item: any) => NameValuePair = ({name, value}) => ({name, value});

    constructor(parserFunction?: (item: any) => NameValuePair) {
        this._parserFn = parserFunction || this._parserFn;
    }

    public parse(item: any): NameValuePair {
        return this._parserFn(item);
    }
}

export class NameValuePair {
    name: string;
    value: any;
}
