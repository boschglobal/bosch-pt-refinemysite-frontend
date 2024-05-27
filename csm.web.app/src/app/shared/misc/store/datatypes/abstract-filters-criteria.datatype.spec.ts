/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {DateHelper} from '../../../ui/dates/date.helper.service';
import {AbstractFiltersCriteria} from './abstract-filters-criteria.datatype';

class TestFiltersCriteria extends AbstractFiltersCriteria {
    public testCriteria: string[];
}

describe('Abstract Filters Criteria', () => {

    it('should return true when isEqual is called with two criteria with equal from and to and testCriteria', () => {
        const criteriaA: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['foo'],
        };
        const criteriaB: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['foo'],
        };

        spyOn(DateHelper, 'isSameDay').and.callThrough();

        expect(TestFiltersCriteria.isEqual(criteriaA, criteriaB)).toBeTruthy();
        expect(DateHelper.isSameDay).toHaveBeenCalled();
    });

    it('should return false when isEqual is called with different from', () => {
        const criteriaA: TestFiltersCriteria = {
            from: moment(),
            to: null,
            testCriteria: ['foo'],
        };
        const criteriaB: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['foo'],
        };

        spyOn(DateHelper, 'isSameDay').and.callThrough();

        expect(TestFiltersCriteria.isEqual(criteriaA, criteriaB)).toBeFalsy();
        expect(DateHelper.isSameDay).toHaveBeenCalled();
    });

    it('should return false when isEqual is called with different to', () => {
        const criteriaA: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['foo'],
        };
        const criteriaB: TestFiltersCriteria = {
            from: null,
            to: moment(),
            testCriteria: ['foo'],
        };

        spyOn(DateHelper, 'isSameDay').and.callThrough();

        expect(TestFiltersCriteria.isEqual(criteriaA, criteriaB)).toBeFalsy();
        expect(DateHelper.isSameDay).toHaveBeenCalled();
    });

    it('should return false when isEqual is called with different testCriteria', () => {
        const criteriaA: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['foo'],
        };
        const criteriaB: TestFiltersCriteria = {
            from: null,
            to: null,
            testCriteria: ['bar'],
        };

        spyOn(DateHelper, 'isSameDay').and.callThrough();

        expect(TestFiltersCriteria.isEqual(criteriaA, criteriaB)).toBeFalsy();
        expect(DateHelper.isSameDay).toHaveBeenCalled();
    });
});
