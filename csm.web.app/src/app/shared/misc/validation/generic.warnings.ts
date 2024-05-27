/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AbstractControl,
    ValidatorFn
} from '@angular/forms';

export interface AbstractControlWithWarning extends AbstractControl {
    warning: any;
}

export class GenericWarnings {

    /**
     * @description Retrieves a ValidatorFn that validates if input max char is reached
     * @param {number} limit
     * @param {String} message
     * @returns {ValidatorFn}
     */
    public static isCharLimitReached(limit: number, message?: string): ValidatorFn {
        return (control: AbstractControlWithWarning): { [key: string]: any } => {
            if (control.value && control.value.length >= limit) {
                control.warning = {
                    message: message || 'Generic_ValidationCharacterLimitReached',
                    params: {limit}
                };
            } else {
                control.warning = {};
            }

            return null;
        };
    }
}
