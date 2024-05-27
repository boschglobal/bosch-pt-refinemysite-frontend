/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AbstractControl,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import * as moment from 'moment';
import {trim} from 'lodash';

export class GenericValidators {
    /**
     * @description Retrieves a ValidatorFn that validates if a control value is filled
     * @param message
     * @returns {Function}
     */
    public static isRequired(message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value === null || trim(control.value) === '' ? {
                isRequired: {
                    valid: false,
                    message: message || 'Generic_Error_InputIsEmpty'
                }
            } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value has a field
     * @param message
     * @returns {Function}
     */
    public static isObjectWithKey(fieldKey: string, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value == null || control.value[fieldKey] === null || control.value[fieldKey] === undefined ? {
                isRequired: {
                    valid: false,
                    message: message || 'Generic_Error_InputIsEmpty'
                }
            } : null;
    }


    /**
     * @description Retrieves a ValidatorFn that validates if a control value is not empty
     * @param message
     * @returns {Function}
     */
    public static isNotEmpty(message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value.length === 0 ? {
                notEmpty: {
                    valid: false,
                    message: message || 'Generic_Error_InputIsEmpty'
                }
            } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is found in the data array
     * @param collection
     * @param message
     * @returns {Function}
     */
    public static foundInCollection(collection: string[], message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            collection.findIndex(item => item === control.value) === -1 ? {
                foundInCollection: {
                    valid: false,
                    message: message || 'Generic_Error_InputIsEmpty'
                }
            } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value matches a RegExp pattern
     * @param pattern
     * @param message
     * @returns {(control:AbstractControl)=>{[p: string]: any}}
     */
    public static isPattern(pattern: RegExp, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value !== null && !control.value.match(pattern) ? {
                isPattern: {
                    valid: false,
                    message
                }
            } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value doesn't exceed the maximum characters
     * @param maximum
     * @param message
     * @returns {Function}
     */
    public static isMaxLength(maximum: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value !== null && control.value.length > maximum ? {
                isMaxLength: {
                    valid: false,
                    message: message || 'Generic_ValidationMaxLength',
                    params: {maximum}
                }
            } : null;
    }

    /**
     * @description Retrieves a ValidatorFn that validates if a control value is not below the minimum characters
     * @param minimum
     * @param message
     * @returns {Function}
     */
    public static isMinLength(minimum: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } =>
            control.value !== null && control.value.length < minimum ? {
                isMaxLength: {
                    valid: false,
                    message: message || 'Generic_ValidationMinLength',
                    params: {minimum}
                }
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

            if (moment.isMoment(valueA) && moment.isMoment(valueB) && !valueB.isBefore(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_Validation_IsBefore',
                    params: {date: valueA.format('L')}
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

            if (moment.isMoment(valueA) && moment.isMoment(valueB) && !valueB.isAfter(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_ValidationIsAfter',
                    params: {date: valueA.format('L')}
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

            if (moment.isMoment(valueA) && moment.isMoment(valueB) && !valueB.isSameOrAfter(valueA, 'd')) {
                const error: ValidationError = {
                    valid: false,
                    message: message || 'Generic_ValidationIsSameOrAfter',
                    params: {date: valueA.format('L')}
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
     * @description Retrieves a ValidatorFn that validates if value is between min and max
     * @param {number} min
     * @param {number} max
     * @param {string} message
     * @returns {ValidatorFn}
     */
    public static isInRange(min: number, max: number, message?: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const parsedValue = control.value !== null ? control.value.toString().replace('.', ',') : null;
            const regex = new RegExp('^\\d+(,\\d{0,2})?$');

            return !(control.value >= min && control.value <= max) || !regex.test(parsedValue) ? {
                isInRange: {
                    valid: false,
                    message: message || 'Generic_ValidationIsInRange'
                }
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
        return (control: AbstractControl): { [key: string]: any } =>
        control.value !== true ? {
                isChecked: {
                    valid: false,
                    message,
                }
            } : null;
    }
}

interface ValidationError {
    valid: boolean;
    message: string;
    params?: any;
}
