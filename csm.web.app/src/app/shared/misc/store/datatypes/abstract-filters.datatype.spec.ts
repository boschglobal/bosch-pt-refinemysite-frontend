/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {AbstractFilters} from './abstract-filters.datatype';
import {AbstractFiltersCriteria} from './abstract-filters-criteria.datatype';

class TestFilters extends AbstractFilters {
    public testCriteria: string[];
}

describe('Abstract Filters', () => {

    it('should return true when isEqual is called with two filters with equal criteria and testCriteria', () => {
        const filterA: TestFilters = {
            criteria: {
                from: null,
                to: null,
            },
            testCriteria: ['foo'],
        };
        const filterB: TestFilters = {
            criteria: {
                from: null,
                to: null,
            },
            testCriteria: ['foo'],
        };

        spyOn(AbstractFiltersCriteria, 'isEqual').and.callThrough();

        expect(TestFilters.isEqual(filterA, filterB)).toBeTruthy();
        expect(AbstractFiltersCriteria.isEqual).toHaveBeenCalled();
    });

    it('should return false when isEqual is called with different criteria', () => {
        const filterA: TestFilters = {
            criteria: {
                from: null,
                to: null,
            },
            testCriteria: ['foo'],
        };
        const filterB: TestFilters = {
            criteria: {
                from: null,
                to: moment(),
            },
            testCriteria: ['foo'],
        };

        spyOn(AbstractFiltersCriteria, 'isEqual').and.callThrough();

        expect(TestFilters.isEqual(filterA, filterB)).toBeFalsy();
        expect(AbstractFiltersCriteria.isEqual).toHaveBeenCalled();
    });

    it('should return false when isEqual is called with different testCriteria', () => {
        const filterA: TestFilters = {
            criteria: {
                from: null,
                to: moment(),
            },
            testCriteria: ['foo'],
        };
        const filterB: TestFilters = {
            criteria: {
                from: null,
                to: moment(),
            },
            testCriteria: ['bar'],
        };

        spyOn(AbstractFiltersCriteria, 'isEqual').and.callThrough();

        expect(TestFilters.isEqual(filterA, filterB)).toBeFalsy();
        expect(AbstractFiltersCriteria.isEqual).toHaveBeenCalled();
    });
});
