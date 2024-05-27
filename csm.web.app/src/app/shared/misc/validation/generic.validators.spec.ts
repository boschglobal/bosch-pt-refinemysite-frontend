/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {UntypedFormControl} from '@angular/forms';
import * as moment from 'moment';

import {GenericValidators} from './generic.validators';

describe('Generic Validators', () => {

    const today = moment();
    const yesterday = moment().subtract(1, 'd');
    const tomorrow = moment().add(1, 'd');

    const isDateInRangeInvalidExpectedResult = {
        isDateInRange: {
            valid: false,
            message: 'Generic_ValidationIsDateRangeInRange',
        },
    };
    const isValidDateInvalidExpectedResult = {
        isValidDate: {
            valid: false,
            message: 'Generic_ValidationIsValidDate',
        },
    };

    it('should return null when isValidDate validator is called for a form control with a valid date', () => {
        const validDate = moment();
        const formControl = new UntypedFormControl(validDate);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return null when isValidDate validator is called for a form control with a null date', () => {
        const formControl = new UntypedFormControl(null);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return an invalid payload when isValidDate validator is called for a form control with a string', () => {
        const formControl = new UntypedFormControl('123456');

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });

    it('should return an invalid payload when isValidDate validator is called for a form control with a invalid date', () => {
        const invalidDate = moment('12/mm/yyyy', 'DD/MM/YYYY', true);
        const formControl = new UntypedFormControl(invalidDate);

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });

    it('should return an invalid payload when isValidDate validator is called for a form control with a date range ' +
        'with the start date invalid', () => {
        const value = {
            start: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });

    it('should return an invalid payload when isValidDate validator is called for a form control with a date range ' +
        'with the end date invalid', () => {
        const value = {
            start: null,
            end: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });

    it('should return an invalid payload when isValidDate validator is called for a form control with a date range ' +
        'that the start date is a string', () => {
        const value = {
            start: '123',
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });
    it('should return an invalid payload when isValidDate validator is called for a form control with a date range ' +
        'that the end date is a string', () => {
        const value = {
            start: null,
            end: '123',
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toEqual(isValidDateInvalidExpectedResult);
    });

    it('should return null when isValidDate validator is called for a form control with a date range ' +
        'that the start and the end dates are null', () => {
        const value = {
            start: null,
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return null when isValidDate validator is called for a form control with a date range ' +
        'that the start date is valid and the end date is null', () => {
        const value = {
            start: moment(),
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return null when isValidDate validator is called for a form control with a date range ' +
        'that the end date is valid and the start date is null', () => {
        const value = {
            start: null,
            end: moment(),
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return null when isValidDate validator is called for a form control with a date range ' +
        'that the start and the end dates are valid', () => {
        const value = {
            start: moment(),
            end: moment(),
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isValidDate()(formControl)).toBeNull();
    });

    it('should return an invalid payload with a custom message when isValidDate validator is called for a form control with a ' +
        'invalid date and a custom message is provided', () => {
        const invalidDate = moment('12/mm/yyyy', 'DD/MM/YYYY', true);
        const formControl = new UntypedFormControl(invalidDate);
        const customMessage = 'Genetic_123';
        const expectedResult = {
            isValidDate: {
                valid: false,
                message: customMessage,
            },
        };

        expect(GenericValidators.isValidDate(customMessage)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isDateInRange validator is called for a form control with a date after the minimum and ' +
        'before the maximum provided', () => {
        const formControl = new UntypedFormControl(today);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a string', () => {
        const formControl = new UntypedFormControl('123456');

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a invalid date', () => {
        const invalidDate = moment('12/mm/yyyy', 'DD/MM/YYYY', true);
        const formControl = new UntypedFormControl(invalidDate);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a ' +
        'date before the minimum provided', () => {
        const dateBeforeMin = today;
        const minDate = dateBeforeMin.clone().add(1, 'd');
        const maxDate = dateBeforeMin.clone().add(3, 'd');
        const formControl = new UntypedFormControl(dateBeforeMin);
        const expectedResult = {
            isDateInRange: {
                valid: false,
                message: 'Generic_ValidationIsSingleDateInRange',
            },
        };

        expect(GenericValidators.isDateInRange(minDate, maxDate)(formControl)).toEqual(expectedResult);
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a ' +
        'date after the maximum provided', () => {
        const formControl = new UntypedFormControl(today);
        const expectedResult = {
            isDateInRange: {
                valid: false,
                message: 'Generic_ValidationIsSingleDateInRange',
            },
        };

        expect(GenericValidators.isDateInRange(yesterday, yesterday)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the start date is after the minimum and before the maximum date provided', () => {
        const value = {
            start: today,
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the end date is after the minimum and before the maximum provided', () => {
        const value = {
            start: null,
            end: today,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where both the start and the end dates are after the minimum and before the maximum provided', () => {
        const value = {
            start: today,
            end: today,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the start date is a string', () => {
        const value = {
            start: '123',
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the end date is a string', () => {
        const value = {
            start: null,
            end: '123',
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the start date is a invalid date', () => {
        const value = {
            start: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
            end: null,
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return null when isDateInRange validator is called for a form control with a date range ' +
        'where the end date is a invalid date', () => {
        const value = {
            start: null,
            end: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
        };
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(yesterday, tomorrow)(formControl)).toBeNull();
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a date range ' +
        'where the start date is before the minimum provided', () => {
        const value = {
            start: today,
            end: today.clone().add(2, 'd'),
        };
        const minDate = today.clone().add(1, 'd');
        const maxDate = today.clone().add(3, 'd');
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(minDate, maxDate)(formControl)).toEqual(isDateInRangeInvalidExpectedResult);
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a date range ' +
        'where the start date is after the maximum provided', () => {
        const value = {
            start: today,
            end: today.clone().subtract(2, 'd'),
        };
        const minDate = today.clone().subtract(3, 'd');
        const maxDate = today.clone().subtract(1, 'd');
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(minDate, maxDate)(formControl)).toEqual(isDateInRangeInvalidExpectedResult);
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a date range ' +
        'where the end date is before the minimum provided', () => {
        const value = {
            start: today.clone().add(2, 'd'),
            end: today,
        };
        const minDate = today.clone().add(1, 'd');
        const maxDate = today.clone().add(3, 'd');
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(minDate, maxDate)(formControl)).toEqual(isDateInRangeInvalidExpectedResult);
    });

    it('should return an invalid payload when isDateInRange validator is called for a form control with a date range ' +
        'where the end date is after the maximum provided', () => {
        const value = {
            start: today.clone().subtract(2, 'd'),
            end: today,
        };
        const minDate = today.clone().subtract(3, 'd');
        const maxDate = today.clone().subtract(1, 'd');
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInRange(minDate, maxDate)(formControl)).toEqual(isDateInRangeInvalidExpectedResult);
    });

    it('should return an invalid payload with a custom message when isDateInRange validator is called for a form control with a ' +
        'date after the maximum provided and a custom message is provided', () => {
        const dateAfterMax = today;
        const minDate = dateAfterMax.clone().subtract(1, 'd');
        const maxDate = dateAfterMax.clone().subtract(3, 'd');
        const formControl = new UntypedFormControl(dateAfterMax);
        const customMessage = 'Genetic_123';
        const expectedResult = {
            isDateInRange: {
                valid: false,
                message: customMessage,
            },
        };

        expect(GenericValidators.isDateInRange(minDate, maxDate, customMessage)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isDateInArray validator is called for a form control with a date not included in the ' +
        'provided disabledDates array', () => {
        const disabledDates = [tomorrow];
        const formControl = new UntypedFormControl(today);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a string', () => {
        const disabledDates = [today];
        const formControl = new UntypedFormControl('12345');

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a invalid date', () => {
        const disabledDates = [today];
        const invalidDate = moment('12/mm/yyyy', 'DD/MM/YYYY', true);
        const formControl = new UntypedFormControl(invalidDate);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return an invalid payload when isDateInArray validator is called for a form control with a date included ' +
        'in the provided disabledDates array', () => {
        const disabledDates = [today];
        const formControl = new UntypedFormControl(today);
        const expectedResult = {
            isDateInArray: {
                valid: false,
                message: 'Generic_ValidationIsSingleDateInArray',
            },
        };

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toEqual(expectedResult);
    });

    it('should return an invalid payload when isDateInArray validator is called for a form control with a date range ' +
        'where the start date is included in the provided disabledDates array', () => {
        const value = {
            start: today,
            end: null,
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);
        const expectedResult = {
            isDateInArray: {
                valid: false,
                message: 'Generic_ValidationIsDateRangeInArray',
            },
        };

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toEqual(expectedResult);
    });

    it('should return an invalid payload when isDateInArray validator is called for a form control with a date range ' +
        'where the end date is included in the provided disabledDates array', () => {
        const value = {
            start: null,
            end: today,
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);
        const expectedResult = {
            isDateInArray: {
                valid: false,
                message: 'Generic_ValidationIsDateRangeInArray',
            },
        };

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isDateInArray validator is called for a form control with a date range ' +
        'where both dates are not included in the provided disabledDates array', () => {
        const value = {
            start: today,
            end: today,
        };
        const disabledDates = [tomorrow];
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a date range ' +
        'were the start date is a string and the end date is not provided', () => {
        const value = {
            start: '123',
            end: null,
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a date range ' +
        'were the end date is a string and the start date is not provided', () => {
        const value = {
            start: null,
            end: '123',
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a date range where the start date ' +
        'is a invalid date and the end date is not provided', () => {
        const value = {
            start: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
            end: null,
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return null when isDateInArray validator is called for a form control with a date range where the end date ' +
        'is a invalid date and the start date is not provided', () => {
        const value = {
            start: null,
            end: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
        };
        const disabledDates = [today];
        const formControl = new UntypedFormControl(value);

        expect(GenericValidators.isDateInArray(disabledDates)(formControl)).toBeNull();
    });

    it('should return an invalid payload with a custom message when isDateInArray validator is called for a form control with a ' +
        'date included in the provided disabledDates array and a custom message is provided', () => {
        const disabledDates = [today];
        const formControl = new UntypedFormControl(today);
        const customMessage = 'Genetic_123';
        const expectedResult = {
            isDateInArray: {
                valid: false,
                message: customMessage,
            },
        };

        expect(GenericValidators.isDateInArray(disabledDates, customMessage)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isValidRange validator is called for a form control with a valid range of 1 day', () => {
        const validRange = {
            start: today,
            end: today,
        };
        const formControl = new UntypedFormControl(validRange);

        expect(GenericValidators.isValidRange()(formControl)).toBeNull();
    });

    it('should return null when isValidRange validator is called for a form control with a valid range of more than 1 day', () => {
        const validRange = {
            start: today,
            end: tomorrow,
        };
        const formControl = new UntypedFormControl(validRange);

        expect(GenericValidators.isValidRange()(formControl)).toBeNull();
    });

    it('should return null when isValidRange validator is called for a form control with an incomplete range (without start date)', () => {
        const rangeWithoutStart = {
            end: today,
        };
        const formControl = new UntypedFormControl(rangeWithoutStart);

        expect(GenericValidators.isValidRange()(formControl)).toBeNull();
    });

    it('should return null when isValidRange validator is called for a form control with an incomplete range (without end date)', () => {
        const rangeWithoutEnd = {
            start: today,
        };
        const formControl = new UntypedFormControl(rangeWithoutEnd);

        expect(GenericValidators.isValidRange()(formControl)).toBeNull();
    });

    it('should return an invalid payload when isValidRange validator is called for a form control with ' +
        'a end date before the start date', () => {
        const validRange = {
            start: tomorrow,
            end: today,
        };
        const formControl = new UntypedFormControl(validRange);
        const expectedResult = {
            isValidRange: {
                valid: false,
                message: 'Generic_ValidationIsValidRange',
            },
        };

        expect(GenericValidators.isValidRange()(formControl)).toEqual(expectedResult);
    });

    it('should return an invalid payload with custom message when isValidRange validator is called for a form control with ' +
        'a end date before the start date', () => {
        const validRange = {
            start: tomorrow,
            end: today,
        };
        const formControl = new UntypedFormControl(validRange);
        const customMessage = 'Genetic_123';
        const expectedResult = {
            isValidRange: {
                valid: false,
                message: customMessage,
            },
        };

        expect(GenericValidators.isValidRange(customMessage)(formControl)).toEqual(expectedResult);
    });

    it('should return null when isRequiredRange validator is called for a form control with a complete range', () => {
        const validRange = {
            start: today,
            end: today,
        };
        const formControl = new UntypedFormControl(validRange);

        expect(GenericValidators.isRequiredRange()(formControl)).toBeNull();
    });

    it('should return null when isRequiredRange validator is called for a form control with an incomplete range (without end) ' +
        'but end date is not required', () => {
        const validRange = {
            start: today,
            end: null,
        };
        const formControl = new UntypedFormControl(validRange);

        expect(GenericValidators.isRequiredRange(true, false)(formControl)).toBeNull();
    });

    it('should return null when isRequiredRange validator is called for a form control with an incomplete range (without start) ' +
        'but start date is not required', () => {
        const validRange = {
            start: null,
            end: today,
        };
        const formControl = new UntypedFormControl(validRange);

        expect(GenericValidators.isRequiredRange(false)(formControl)).toBeNull();
    });

    it('should return an invalid payload when isRequiredRange validator is called for a form control with an incomplete range', () => {
        const validRange = {
            start: null,
            end: null,
        };
        const formControl = new UntypedFormControl(validRange);
        const expectedResult = {
            isRequiredRange: {
                valid: false,
                message: 'Generic_ValidationIsRequired',
            },
        };

        expect(GenericValidators.isRequiredRange()(formControl)).toEqual(expectedResult);
    });

    it('should return an invalid payload with custom message when isValidRange validator is called for an incomplete range', () => {
        const validRange = {
            start: null,
            end: null,
        };
        const formControl = new UntypedFormControl(validRange);
        const customMessage = 'Genetic_123';
        const expectedResult = {
            isRequiredRange: {
                valid: false,
                message: customMessage,
            },
        };

        expect(GenericValidators.isRequiredRange(true, true, customMessage)(formControl)).toEqual(expectedResult);
    });

    it('should return null when findInArray validator is called for a form control with a value included ' +
        'in the provided data array', () => {
        const validValue = '123';
        const dataArray = [validValue, '456'];
        const formControl = new UntypedFormControl(validValue);

        expect(GenericValidators.findInArray(dataArray)(formControl)).toBeNull();
    });

    it('should return an invalid payload when findInArray validator is called for a form control with a value not included ' +
        'in the provided data array', () => {
            const invalidValue = '789';
            const dataArray = ['123', '456'];
            const formControl = new UntypedFormControl(invalidValue);
            const expectedResult = {
                findInArray: {
                    valid: false,
                    message: 'Generic_Error_InputIsEmpty',
                },
            };

            expect(GenericValidators.findInArray(dataArray)(formControl)).toEqual(expectedResult);
        }
    );
    it('should return an invalid payload with custom message when findInArray validator is called for a form control ' +
        'with a value not included in the provided data array', () => {
            const invalidValue = '789';
            const dataArray = ['123', '456'];
            const formControl = new UntypedFormControl(invalidValue);
            const customMessage = 'Genetic_123';
            const expectedResult = {
                findInArray: {
                    valid: false,
                    message: customMessage,
                },
            };

            expect(GenericValidators.findInArray(dataArray, customMessage)(formControl)).toEqual(expectedResult);
        }
    );
});
