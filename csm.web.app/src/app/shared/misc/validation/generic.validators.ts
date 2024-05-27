/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    AbstractControl,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import {trim} from 'lodash';
import * as moment from 'moment';

export class GenericValidators {
    /**
     * @description Retrieves a ValidatorFn that validates if a control value is filled
     * @param message
     * @returns {Function}
     */
    public static isRequired(message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value === null || trim(control.value) === '' ? {
            isRequired: {
                valid: false,
                message: message || 'Generic_Error_InputIsEmpty',
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is required
     * @param requireStart
     * @param requireEnd
     * @param message
     * @returns {Function}
     */
    public static isRequiredRange(requireStart = true, requireEnd = true, message = 'Generic_ValidationIsRequired'): ValidatorFn {
        return ({value}: AbstractControl): { [key: string]: any } | null => {
            const start = value?.start;
            const end = value?.end;
            const isInvalidStartDate = (requireStart && !start) || !!start && (!moment.isMoment(start) || !start.isValid());
            const isInvalidEndDate = (requireEnd && !end) || !!end && (!moment.isMoment(end) || !end.isValid());

            return isInvalidStartDate || isInvalidEndDate ? {
                isRequiredRange: {
                    valid: false,
                    message,
                },
            } : null;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is not empty
     * @param message
     * @returns {Function}
     */
    public static isNotEmpty(message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value.length === 0 ? {
            notEmpty: {
                valid: false,
                message: message || 'Generic_Error_InputIsEmpty',
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is found in the data array
     * @param data
     * @param message
     * @returns {Function}
     */
    public static findInArray(data: any[], message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => !data.includes(control.value) ? {
            findInArray: {
                valid: false,
                message: message || 'Generic_Error_InputIsEmpty',
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value matches a RegExp pattern
     * @param pattern
     * @param message
     * @returns {(control:AbstractControl)=>{[p: string]: any}}
     */
    public static isPattern(pattern: RegExp, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value !== null && !pattern.test(control.value) ? {
            isPattern: {
                valid: false,
                message,
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a file type matches a RegExp pattern
     * @param message
     * @param pattern
     * @returns {Function}
     */
    public static isValidExtensionFile(pattern: RegExp, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value === null) {
                return null;
            } else {
                return typeof control.value.type !== 'undefined' && !pattern.test(control.value.type) ? {
                    isValidExtensionFile: {
                        valid: false,
                        message: message || 'Generic_ValidationInvalidFile',
                    },
                } : null;
            }
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a file size is not bigger that the maxSize
     * @param {number} maxSize
     * @param {string} message
     * @returns {ValidatorFn}
     */
    public static isValidFileSize(maxSize: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value === null) {
                return null;
            } else {
                return typeof control.value.size !== 'undefined' && control.value.size > maxSize ? {
                    isValidFileSize: {
                        valid: false,
                        message: message || 'Generic_ValidationInvalidFileSize',
                    },
                } : null;
            }
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value doesn't exceed the maximum characters
     * @param maximum
     * @param message
     * @returns {Function}
     */
    public static isMaxLength(maximum: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value !== null && control.value.length > maximum ? {
            isMaxLength: {
                valid: false,
                message: message || 'Generic_ValidationMaxLength',
                params: {maximum},
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is not below the minimum characters
     * @param minimum
     * @param message
     * @returns {Function}
     */
    public static isMinLength(minimum: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value !== null && control.value.length < minimum ? {
            isMaxLength: {
                valid: false,
                message: message || 'Generic_ValidationMinLength',
                params: {minimum},
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if valueB is before valueA
     * @description valueA and valueB are Moment dates
     * @param valueAKey
     * @param valueBKey
     * @param message
     * @returns {Function}
     */
    public static isBefore(valueAKey: string, valueBKey: string, message?: string): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {
            const valueA: moment.Moment = group.get(valueAKey).value;
            const valueB: moment.Moment = group.get(valueBKey).value;
            let errors: ValidationErrors = group.get(valueBKey).errors;

            if (moment.isMoment(valueA) && valueA.isValid() &&
                moment.isMoment(valueB) && valueB.isValid() &&
                !valueB.isBefore(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_Validation_IsBefore',
                    params: {date: valueA.format('L')},
                };
                errors = this._appendError(errors, error, 'isBefore');
            } else {
                errors = this._removeError(errors, 'isBefore');
            }

            group.get(valueBKey).setErrors(errors);

            if (moment.isMoment(valueB) && (errors !== null && errors.isBefore)) {
                group.get(valueBKey).markAsTouched();
            }

            return errors;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if valueB is after valueA
     * @description valueA and valueB are Moment dates
     * @param valueAKey
     * @param valueBKey
     * @param message
     * @returns {Function}
     */
    public static isAfter(valueAKey: string, valueBKey: string, message?: string): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {
            const valueA: moment.Moment = group.get(valueAKey).value;
            const valueB: moment.Moment = group.get(valueBKey).value;
            let errors: ValidationErrors = group.get(valueBKey).errors;

            if (moment.isMoment(valueA) && valueA.isValid() &&
                moment.isMoment(valueB) && valueB.isValid() &&
                !valueB.isAfter(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_ValidationIsAfter',
                    params: {date: valueA.format('L')},
                };
                errors = this._appendError(errors, error, 'isAfter');
            } else {
                errors = this._removeError(errors, 'isAfter');
            }

            group.get(valueBKey).setErrors(errors);

            if (moment.isMoment(valueB) && (errors !== null && errors.isAfter)) {
                group.get(valueBKey).markAsTouched();
            }

            return errors;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if valueA is same or after valueB
     * @param {string} valueAKey
     * @param {string} valueBKey
     * @param {string} message
     * @returns {ValidatorFn}
     */
    public static isSameOrAfter(valueAKey: string, valueBKey: string, message?: string): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {
            const valueA: moment.Moment = group.get(valueAKey).value;
            const valueB: moment.Moment = group.get(valueBKey).value;
            let errors: ValidationErrors = group.get(valueBKey).errors;

            if (moment.isMoment(valueA) && valueA.isValid() &&
                moment.isMoment(valueB) && valueB.isValid() &&
                !valueB.isSameOrAfter(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_ValidationIsSameOrAfter',
                    params: {date: valueA.format('L')},
                };
                errors = this._appendError(errors, error, 'isSameOrAfter');
            } else {
                errors = this._removeError(errors, 'isSameOrAfter');
            }

            group.get(valueBKey).setErrors(errors);

            if (moment.isMoment(valueB) && (errors !== null && errors.isSameOrAfter)) {
                group.get(valueBKey).markAsTouched();
            }

            return errors;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is in the provided array
     * @param disabledDates
     * @param message
     * @returns {Function}
     */
    public static isDateInArray(disabledDates: moment.Moment[], message?: string): ValidatorFn {
        return ({value}: AbstractControl): { [key: string]: any } | null => {
            let invalidMessage;
            const start = value?.start;
            const end = value?.end;
            const isDateRange = start !== undefined || end !== undefined;

            if (moment.isMoment(value)) {
                const invalid = value.isValid() && disabledDates.find(disabledDate => disabledDate.isSame(value, 'd'));

                invalidMessage = invalid && 'Generic_ValidationIsSingleDateInArray' || null;
            } else if (isDateRange) {
                const invalid =
                    (moment.isMoment(start) && start.isValid() && disabledDates.find(disabledDate => disabledDate.isSame(start, 'd')))
                    ||
                    (moment.isMoment(end) && end.isValid() && disabledDates.find(disabledDate => disabledDate.isSame(end, 'd')));

                invalidMessage = invalid && 'Generic_ValidationIsDateRangeInArray' || null;
            }

            return invalidMessage ? {
                isDateInArray: {
                    valid: false,
                    message: message || invalidMessage,
                },
            } : null;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if  a control value is between min and max dates
     * @param {number} min
     * @param {number} max
     * @param {string} message
     * @returns {ValidatorFn}
     */
    public static isDateInRange(min: moment.Moment, max: moment.Moment, message?: string): ValidatorFn {
        return ({value}: AbstractControl): { [key: string]: any } | null => {
            let invalidMessage;
            const start = value?.start;
            const end = value?.end;
            const isDateRange = start !== undefined || end !== undefined;

            if (moment.isMoment(value)) {
                const invalid = value.isValid() && !value.isBetween(min, max, 'd', '[]');

                invalidMessage = invalid && 'Generic_ValidationIsSingleDateInRange' || null;
            } else if (isDateRange) {
                const invalid =
                    (moment.isMoment(start) && start.isValid() && !start.isBetween(min, max, 'd', '[]'))
                    ||
                    (moment.isMoment(end) && end.isValid() && !end.isBetween(min, max, 'd', '[]'));

                invalidMessage = invalid && 'Generic_ValidationIsDateRangeInRange' || null;
            }

            return invalidMessage ? {
                isDateInRange: {
                    valid: false,
                    message: message || invalidMessage,
                },
            } : null;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if value is between min and max
     * @param {number} min
     * @param {number} max
     * @param {string} message
     * @returns {ValidatorFn}
     */
    public static isInRange(min: number, max: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const parsedValue = control.value !== null ? control.value.toString().replace('.', ',') : null;
            const regex = new RegExp('^\\d+(,\\d{0,2})?$');

            return !(control.value >= min && control.value <= max) || !regex.test(parsedValue) ? {
                isInRange: {
                    valid: false,
                    message: message || 'Generic_ValidationIsInRange',
                },
            } : null;
        };
    }

    /**
     * @description Retrieves "errors" without specified "errorProperty"
     * @param {ValidationErrors} errors
     * @param {string} errorProperty
     * @returns {ValidationErrors}
     */
    private static _removeError(errors: ValidationErrors, errorProperty: string): ValidationErrors {
        let updatedErrors: ValidationErrors = null;

        if (errors !== null) {
            updatedErrors = Object.assign({}, errors);

            if (updatedErrors.hasOwnProperty(errorProperty)) {
                delete updatedErrors[errorProperty];
            }

            if (!Object.keys(updatedErrors).length) {
                updatedErrors = null;
            }
        }

        return updatedErrors;
    }

    /**
     * @description Retrieves "errors" with "error" appended in the property "errorProperty"
     * @param {ValidationErrors} errors
     * @param error
     * @param {string} errorProperty
     * @returns {ValidationErrors}
     */
    public static _appendError(errors: ValidationErrors, error: ValidationError, errorProperty: string): ValidationErrors {
        let updatedErrors: ValidationErrors = errors === null ? {} : Object.assign({}, errors);

        updatedErrors[errorProperty] = error;

        if (!Object.keys(updatedErrors).length) {
            updatedErrors = null;
        }

        return updatedErrors;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is true
     * @param message
     * @returns {Function}
     */
    public static isChecked(message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => control.value !== true ? {
            isChecked: {
                valid: false,
                message,
            },
        } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is a valid date
     * @param message
     * @returns {Function}
     */
    public static isValidDate(message?: string): ValidatorFn {
        return ({value}: AbstractControl): { [key: string]: any } | null => {
            let invalid = false;
            const start = value?.start;
            const end = value?.end;
            const isDateRange = start !== undefined || end !== undefined;

            if (moment.isMoment(value)) {
                invalid = !value.isValid();
            } else if (isDateRange) {
                invalid = (
                    (start && (!moment.isMoment(start) || !start.isValid()))
                    ||
                    (end && (!moment.isMoment(end) || !end.isValid()))
                );
            } else if (value) {
                invalid = true;
            }

            return invalid ? {
                isValidDate: {
                    valid: false,
                    message: message || 'Generic_ValidationIsValidDate',
                },
            } : null;
        };
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is a valid range
     * @param message
     * @returns {Function}
     */
    public static isValidRange(message = 'Generic_ValidationIsValidRange'): ValidatorFn {
        return ({value}: AbstractControl): { [key: string]: any } | null => {
            const start = value?.start;
            const end = value?.end;
            const isInvalidRange = moment.isMoment(start) && moment.isMoment(end) && end.isBefore(start, 'd');

            return isInvalidRange ? {
                isValidRange: {
                    valid: false,
                    message,
                },
            } : null;
        };
    }
}

interface ValidationError {
    valid: boolean;
    message: string;
    params?: any;
}

export interface ValidationMaxLength {
    maxLength: number;
}

export interface ValidationMinLength {
    minLength: number;
}

export type ValidationMaxMinLength = ValidationMaxLength & ValidationMinLength;

export interface ValidationPicture {
    extension: RegExp;
    maxSize: number;
    maxSizeInMb: number;
}
