/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';

import {InputCheckboxNestedOption} from './input-checkbox-nested.component';

@Component({
    templateUrl: './input-checkbox-nested.test.component.html'
})
export class InputCheckboxNestedTestComponent {
    @ViewChild('optionTemplate', {static: true})
    public optionTemplate: TemplateRef<any>;

    public form: UntypedFormGroup;

    public options: InputCheckboxNestedOption[];
}
