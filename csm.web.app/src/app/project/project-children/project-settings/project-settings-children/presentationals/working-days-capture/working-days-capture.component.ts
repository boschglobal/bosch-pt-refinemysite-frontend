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
    OnInit,
    Output
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';

import {
    WeekDaysEnum,
    weekDaysEnumHelper,
} from '../../../../../../shared/misc/enums/weekDays.enum';
import {DateHelper} from '../../../../../../shared/ui/dates/date.helper.service';
import {SelectOption} from '../../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectDateLocaleHelper} from '../../../../../project-common/helpers/project-date-locale.helper.service';

export const WORKING_DAYS_FORM_DEFAULT_VALUE: WorkingDaysFormData = {
    startOfWeek: null,
    workingDays: {
        [WeekDaysEnum.SUNDAY]: false,
        [WeekDaysEnum.MONDAY]: false,
        [WeekDaysEnum.TUESDAY]: false,
        [WeekDaysEnum.WEDNESDAY]: false,
        [WeekDaysEnum.THURSDAY]: false,
        [WeekDaysEnum.FRIDAY]: false,
        [WeekDaysEnum.SATURDAY]: false,
    },
};

const weekDaysSorted: WeekDaysEnum[] = [
    WeekDaysEnum.SUNDAY,
    WeekDaysEnum.MONDAY,
    WeekDaysEnum.TUESDAY,
    WeekDaysEnum.WEDNESDAY,
    WeekDaysEnum.THURSDAY,
    WeekDaysEnum.FRIDAY,
    WeekDaysEnum.SATURDAY,
];

const weekDaysSortFn = (a: WeekDaysEnum, b: WeekDaysEnum) => weekDaysSorted.indexOf(a) - weekDaysSorted.indexOf(b);

@Component({
    selector: 'ss-working-days-capture',
    templateUrl: './working-days-capture.component.html',
    styleUrls: ['./working-days-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingDaysCaptureComponent implements OnInit {

    @Input()
    public set defaultValue(defaultValue: WorkingDaysFormData) {
        this._setFormValue(defaultValue || WORKING_DAYS_FORM_DEFAULT_VALUE);
    }

    @Output()
    public submitForm: EventEmitter<WorkingDaysFormData> = new EventEmitter<WorkingDaysFormData>();

    public readonly form = this._formBuilder.group({
        startOfWeek: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.startOfWeek),
        workingDays: this._formBuilder.group({
            [WeekDaysEnum.SUNDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.SUNDAY]),
            [WeekDaysEnum.MONDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.MONDAY]),
            [WeekDaysEnum.TUESDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.TUESDAY]),
            [WeekDaysEnum.WEDNESDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.WEDNESDAY]),
            [WeekDaysEnum.THURSDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.THURSDAY]),
            [WeekDaysEnum.FRIDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.FRIDAY]),
            [WeekDaysEnum.SATURDAY]: new FormControl(WORKING_DAYS_FORM_DEFAULT_VALUE.workingDays[WeekDaysEnum.SATURDAY]),
        }),
    });

    public monitoringClickActionName = 'Working Days - click on Save Working Days';

    public startOfWeekOptions: SelectOption<WeekDaysEnum>[] = [];

    public workingDaysOptions: WorkingDaysOptions[] = [];

    constructor(private _formBuilder: FormBuilder,
                private _projectDateLocaleHelper: ProjectDateLocaleHelper) {
    }

    ngOnInit(): void {
        this._setWeekAndWorkingDays();
    }

    public handleSaveChange(): void {
        const value = this.form.value as WorkingDaysFormData;

        this.submitForm.emit(value);
    }

    public trackByFn(index: number, item: WorkingDaysOptions): string {
        return item.value;
    }

    private _setWeekAndWorkingDays(): void {
        const currentDate = this._projectDateLocaleHelper.getMomentByLang();

        const options = weekDaysEnumHelper.getValues().sort(weekDaysSortFn).map(value => ({
            value,
            label: currentDate.clone().day(DateHelper.getWeekDayMomentNumber(value)).format('dddd'),
        }));

        this.startOfWeekOptions = [...options];
        this.workingDaysOptions = [...options];
    }

    private _setFormValue(value: WorkingDaysFormData): void {
        this.form.setValue(value);
    }
}

interface WorkingDaysOptions {
    label: string;
    value: string;
}

export interface WorkingDaysFormData {
    startOfWeek: WeekDaysEnum;
    workingDays: WorkingDaysFormDataWeekDays;
}

export interface WorkingDaysFormDataWeekDays {
    [WeekDaysEnum.SUNDAY]: boolean;
    [WeekDaysEnum.MONDAY]: boolean;
    [WeekDaysEnum.TUESDAY]: boolean;
    [WeekDaysEnum.WEDNESDAY]: boolean;
    [WeekDaysEnum.THURSDAY]: boolean;
    [WeekDaysEnum.FRIDAY]: boolean;
    [WeekDaysEnum.SATURDAY]: boolean;
}
