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

import {NameValuePairParser} from './name-value-pair.parser';

describe('Name-Value Pair Parser', function () {
    const moduleDef: TestModuleMetadata = {};

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    it('should return the correct name value pair when no parserFunction is used', () => {
        const item = {name: 'test', value: 1};
        const parsedData = new NameValuePairParser().parse(item);

        expect(parsedData).toEqual(item);
    });

    it('should return the correct name value pair when a parserFunction is used', () => {
        const item = {label: 'test', number: 1};
        const parserFn = (entry) => Object.assign({name: entry.label, value: entry.number});
        const expectedResult = {name: 'test', value: 1};
        const parsedData = new NameValuePairParser(parserFn).parse(item);

        expect(parsedData).toEqual(expectedResult);
    });
});
