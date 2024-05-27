/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    NameValuePair,
    NameValuePairParser,
} from './name-value-pair.parser';

export class NameSeriesPairParser {
    constructor(private name,
                private nameValuePairParser: NameValuePairParser) {
    }

    public parse(list: Array<any>): NameSeriesPair {
        return {
            name: this.name,
            series: list.map(item => this.nameValuePairParser.parse(item))
        };
    }
}

export class NameSeriesPair<T = NameValuePair> {
    name: string;
    series: Array<T>;
}
