/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../shared/misc/validation/generic.warnings';
import {RowId} from '../../../../shared/ui/calendar/calendar/calendar.component';
import {
    InputSelectDropdownComponent,
    SelectOption,
    SelectOptionGroup
} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {InputTextComponent} from '../../../../shared/ui/forms/input-text/input-text.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {
    MilestoneTypeEnum,
    MilestoneTypeEnumHelper
} from '../../enums/milestone-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {CurrentProjectPermissions} from '../../store/projects/project.slice';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {MilestoneTypeOption} from '../milestone-type-options/milestone-type-options.component';

@Component({
    selector: 'ss-milestone-capture',
    templateUrl: './milestone-capture.component.html',
    styleUrls: ['./milestone-capture.component.scss'],
})
export class MilestoneCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValues(milestone: Milestone) {
        this._setDefaultValues(milestone);
        this._setupForm();
    }

    @Input()
    public set mode(mode: CaptureModeEnum) {
        this.createMode = mode === CaptureModeEnum.create;
    }

    @Input()
    public focus: string;

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public onSubmit: EventEmitter<MilestoneFormData> = new EventEmitter<MilestoneFormData>();

    /**
     * @description Property with title input view child
     */
    @ViewChild('titleInput', {static: true})
    public titleInput: InputTextComponent;

    /**
     * @description Property with location input view child
     */
    @ViewChild('locationInput', {static: true})
    public locationInput: InputSelectDropdownComponent;

    public typeOptions: SelectOptionGroup<MilestoneTypeOption>[] = [];

    public locationOptions: SelectOption<RowId>[] = [];

    public createMode: boolean;

    public form: UntypedFormGroup;

    public validations = {
        title: {
            maxLength: 100,
        },
        description: {
            maxLength: 100,
        },
    };

    private _defaultValues: MilestoneFormData = {
        title: '',
        type: null,
        date: null,
        location: null,
        description: '',
    };

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _formBuilder: UntypedFormBuilder,
                private _projectCraftQueries: ProjectCraftQueries,
                private _projectSliceService: ProjectSliceService,
                private _store: Store<State>,
                private _translateService: TranslateService,
                private _workAreaQueries: WorkareaQueries,
    ) {
    }

    ngOnInit() {
        this._requestCrafts();
        this._requestWorkAreas();
        this._setSubscriptions();
        this._setupForm();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(): void {
        this.onSubmit.emit(this.form.value);
    }

    public handleCancel(): void {
        this._cancelForm();
    }

    public resetForm(): void {
        if (!this.form) {
            return;
        }

        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    private _cancelForm() {
        this.resetForm();
        this.onCancel.emit();
    }

    private _setupForm(): void {
        const {title, date, type, description, location} = this._defaultValues;

        this.form = this._formBuilder.group({
            title: [title, [
                GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.validations.title.maxLength),
                GenericWarnings.isCharLimitReached(this.validations.title.maxLength)]],
            type: [type, [
                GenericValidators.isRequired()]],
            location: [location, [
                GenericValidators.isRequired()]],
            date: [date, [
                GenericValidators.isRequired(),
                GenericValidators.isValidDate(),
            ]],
            description: [description, [
                GenericValidators.isMaxLength(this.validations.description.maxLength),
                GenericWarnings.isCharLimitReached(this.validations.description.maxLength)]],
        });

        if (!this.focus && title.length <= 0) {
            this.titleInput.setFocus();
        }

        if (this.focus === 'location') {
            this.locationInput.setFocus();
        }
    }

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _getLocationOption({header, workArea}: Milestone): RowId {
        let rowId: RowId = 'no-row';

        if (header) {
            rowId = 'header';
        } else if (workArea) {
            rowId = workArea.id;
        }

        return rowId;
    }

    private _getTypeOption({craft, type}: Milestone): MilestoneTypeOption {
        return craft ? this._getCraftMilestonesOptions(craft.id, craft.displayName, craft.color).value : this._getNonCraftMilestonesOptions(type).value;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._projectSliceService.observeCurrentProjectPermissions(),
                this._projectCraftQueries.observeCraftsSortedByName(),
            ]).subscribe(([projectPermissions, crafts]) => this._setTypeOptions(projectPermissions, crafts))
        );

        this._disposableSubscriptions.add(
            this._workAreaQueries
                .observeWorkareas()
                .subscribe(workAreas => this._setLocationOptions(workAreas))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setDefaultValues(milestone: Milestone): void {
        const {name: title, date, description} = milestone;

        this._defaultValues = {
            title,
            date,
            description,
            type: this._getTypeOption(milestone),
            location: this._getLocationOption(milestone),
        };
    }

    private _setTypeOptions(projectPermissions: CurrentProjectPermissions, crafts: ProjectCraftResource[]): void {
        const {canCreateInvestorMilestone, canCreateProjectMilestone, canCreateCraftMilestone} = projectPermissions;
        const nonCraftMilestonesOptions = [];
        const typeOptions = [];
        let craftMilestonesOptions = [];

        if (canCreateInvestorMilestone) {
            nonCraftMilestonesOptions.push(this._getNonCraftMilestonesOptions(MilestoneTypeEnum.Investor));
        }

        if (canCreateProjectMilestone) {
            nonCraftMilestonesOptions.push(this._getNonCraftMilestonesOptions(MilestoneTypeEnum.Project));
        }

        if (canCreateCraftMilestone) {
            craftMilestonesOptions = crafts.map(({id, name, color}) => this._getCraftMilestonesOptions(id, name, color));
        }

        if (nonCraftMilestonesOptions.length) {
            typeOptions.push({
                options: nonCraftMilestonesOptions,
            });
        }

        if (craftMilestonesOptions.length) {
            typeOptions.push({
                title: this._translateService.instant('Generic_CraftsLabel'),
                options: craftMilestonesOptions,
            });
        }

        this.typeOptions = typeOptions;
    }

    private _getNonCraftMilestonesOptions(type: MilestoneTypeEnum): SelectOption<MilestoneTypeOption> {
        const label = this._translateService.instant(MilestoneTypeEnumHelper.getLabelByValue(type));

        return {
            label,
            value: {
                marker: {type},
            },
        };
    }

    private _getCraftMilestonesOptions(craftId: string, label: string, color: string): SelectOption<MilestoneTypeOption> {
        return {
            label,
            value: {
                marker: {
                    type: MilestoneTypeEnum.Craft,
                    color,
                },
                craftId,
            },
        };
    }

    private _setLocationOptions(workAreas: WorkareaResource[]): void {
        const topRowOption: SelectOption<RowId> = {
            label: this._translateService.instant('Generic_TopRow'),
            value: 'header',
        };
        const withoutWorkAreaOption: SelectOption<RowId> = {
            label: this._translateService.instant('Generic_WithoutArea'),
            value: 'no-row',
        };
        const workAreaOptions: SelectOption<RowId>[] = workAreas.map(({id, name, position}) => ({
            label: `${position}. ${name}`,
            value: id,
        }));

        this.locationOptions = [
            topRowOption,
            ...workAreaOptions,
            withoutWorkAreaOption,
        ];
    }
}

export interface MilestoneFormData {
    title: string;
    type: MilestoneTypeOption;
    date: moment.Moment;
    location: RowId;
    description: string;
}
