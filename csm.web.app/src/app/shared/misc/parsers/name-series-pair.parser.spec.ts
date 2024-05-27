/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {NameSeriesPairParser} from './name-series-pair.parser';
import {NameValuePairParser} from './name-value-pair.parser';

describe('Name-Series Pair Parser', () => {
    const moduleDef: TestModuleMetadata = {};

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    it('should return an empty series array when an empty list is passed', () => {
        const parsedData = new NameSeriesPairParser('test', new NameValuePairParser()).parse([]);

        expect(parsedData.series).toEqual([]);
    });

    it('should return the correct series values when no parserFunction is used', () => {
        const list = [{name: 'test', value: 1}, {name: 'test', value: 2}];
        const expectedResult = {name: 'test', series: list};
        const parsedData = new NameSeriesPairParser('test', new NameValuePairParser()).parse(list);

        expect(parsedData).toEqual(expectedResult);
    });

    it('should return the correct series values when a parserFunction is used', () => {
        const parserFn = (item) => Object.assign({}, {name: item.text, value: item.number});
        const list = [{text: 'test', number: 1}, {text: 'test', number: 2}];
        const expectedResult = {
            name: 'test', series: [{name: 'test', value: 1}, {name: 'test', value: 2}]
        };
        const parsedData = new NameSeriesPairParser('test', new NameValuePairParser(parserFn)).parse(list);

        expect(parsedData).toEqual(expectedResult);
    });

});
