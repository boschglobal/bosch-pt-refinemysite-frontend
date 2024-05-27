/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {
    FormBuilder,
    FormControl
} from '@angular/forms';

export const WORK_ON_NON_WORKING_DAYS_DEFAULT_VALUE: WorkOnNonWorkingDaysFormData = {
    allowWorkOnNonWorkingDays: false,
};

@Component({
    selector: 'ss-working-days-toggle-capture',
    templateUrl: './working-days-toggle-capture.component.html',
    styleUrls: ['./working-days-toggle-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingDaysToggleCaptureComponent {

    @Input()
    public set defaultValue(defaultValue: WorkOnNonWorkingDaysFormData) {
        this._setFormValue(defaultValue || WORK_ON_NON_WORKING_DAYS_DEFAULT_VALUE);
    }

    @Output()
    public handleWorkOnNonWorkingDaysChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    public readonly form = this._formBuilder.group({
        allowWorkOnNonWorkingDays: new FormControl(WORK_ON_NON_WORKING_DAYS_DEFAULT_VALUE.allowWorkOnNonWorkingDays),
    });

    public monitoringClickActionName = 'Working Days - click on Work on non-working days toggle';

    constructor(private _formBuilder: FormBuilder) {
    }

    public handleSwitch(value: boolean): void {
        this.handleWorkOnNonWorkingDaysChange.emit(value);
    }

    private _setFormValue(value: WorkOnNonWorkingDaysFormData): void {
        this.form.setValue(value);
    }
}

export interface WorkOnNonWorkingDaysFormData {
    allowWorkOnNonWorkingDays: boolean;
}
