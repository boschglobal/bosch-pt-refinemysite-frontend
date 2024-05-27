/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {CollapsibleSelectValue} from './collapsible-select.component';

@Component({
    selector: 'ss-collapsible-select-test',
    templateUrl: './collapsible-select.test.component.html',
    styles: [`
        :host {
            display: block;
            max-width: 320px;
        }
    `],
})
export class CollapsibleSelectTestComponent {
    public value: CollapsibleSelectValue = false;

    public isIndeterminate = false;

    public checkbox1 = false;

    public checkbox2 = false;

    public handleDeselectAll(): void {
        this.checkbox1 = this.checkbox2 = false;
    }

    public handleSelectAll(): void {
        this.checkbox1 = this.checkbox2 = true;
    }

    public toggleCheckbox1(newValue: boolean): void {
        this.checkbox1 = newValue;
        this._updateValue();
    }

    public toggleCheckbox2(newValue: boolean): void {
        this.checkbox2 = newValue;
        this._updateValue();
    }

    private _updateValue(): void {
        if (this.checkbox1 && this.checkbox2) {
            this.value = true;
        } else {
            this.value = (this.checkbox1 !== this.checkbox2) ? 'indeterminate' : false;
        }
    }
}
