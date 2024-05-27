/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractControl} from '@angular/forms';

interface ValidationResult {
    [key: string]: boolean;
}

export class TrimValidators {
    static required(control: AbstractControl): ValidationResult {
        return (control.value === null || control.value.trim() === '') ?
            {'required': true} :
            null;
    }
}
