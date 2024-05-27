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
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    FormControl,
    FormGroup
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../shared/misc/validation/generic.validators';
import {COLORS} from '../../../shared/ui/constants/colors.constant';
import {Z_INDEX} from '../../../shared/ui/constants/z-index.constants';
import {FlyoutOpenTriggerEnum} from '../../../shared/ui/flyout/directive/flyout.directive';
import {SelectOption} from '../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectExportResource} from '../../project-common/api/project-export/resources/project-export.resource';
import {
    ProjectExportFormatEnum,
    projectExportFormatEnumHelper
} from '../../project-common/enums/project-export-format.enum';
import {
    ProjectExportSchedulingTypeEnum,
    projectExportSchedulingTypeEnumHelper
} from '../../project-common/enums/project-export-scheduling-type.enum';
import {ProjectExportAction} from '../../project-common/store/project-export/project-export.actions';
import {ProjectExportQueries} from '../../project-common/store/project-export/project-export.queries';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';

@Component({
    selector: 'ss-project-export',
    templateUrl: './project-export.component.html',
    styleUrls: ['./project-export.component.scss'],
})
export class ProjectExportComponent implements OnInit, OnDestroy {
    @Output()
    public closed: EventEmitter<null> = new EventEmitter<null>();

    public isLoading = false;

    public form: FormGroup;

    public formats: SelectOption[] = projectExportFormatEnumHelper.getSelectOptions();

    public schedulingTypes: SelectOption[] = projectExportSchedulingTypeEnumHelper.getSelectOptions();

    public selectedFormatLabel: string;

    public isMicrosoftProjectFormatSelected = true;

    public infoIconColor = COLORS.dark_grey;

    public tooltipFlyoutTrigger = FlyoutOpenTriggerEnum.Hover;

    public tooltipFlyoutZIndex = Z_INDEX.index__100000;

    private _isSubmitting: boolean;

    private _projectId: string;

    private _disposableSubscription: Subscription = new Subscription();

    constructor(private _projectExportQueries: ProjectExportQueries,
                private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setupForm();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public handleDownload(): void {
        const {format, includeTopics, taskExportSchedulingType, milestoneExportSchedulingType} = this.form.value;

        const resource = new ProjectExportResource(format,
            includeTopics, taskExportSchedulingType, milestoneExportSchedulingType);

        this._isSubmitting = true;
        this._store.dispatch(new ProjectExportAction.Export.One(this._projectId, resource));
    }

    public handleCancel(): void {
        this._resetForm();
        this._isSubmitting = false;
        this._store.dispatch(new ProjectExportAction.Export.OneReset());
        this.closed.emit();
    }

    public isFormDisabled(formControlName: string): boolean {
        return this.form.get(formControlName).disabled;
    }

    private _setupForm(): void {
        this.form = new FormGroup({
            format: new FormControl({
                value: ProjectExportFormatEnum.MSProject,
                disabled: false,
            }, [GenericValidators.isRequired()]),
            taskExportSchedulingType: new FormControl({
                value: ProjectExportSchedulingTypeEnum.AutoScheduled,
                disabled: false,
            }, [GenericValidators.isRequired()]),
            milestoneExportSchedulingType: new FormControl({
                value: ProjectExportSchedulingTypeEnum.AutoScheduled,
                disabled: false,
            }, [GenericValidators.isRequired()]),
            includeTopics: new FormControl({
                value: true,
                disabled: false,
            }),
        });

        this.isMicrosoftProjectFormatSelected = true;
    }

    private _resetForm(): void {
        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(id => this._projectId = id)
        );

        this._disposableSubscription.add(
            this._projectExportQueries.observeProjectExportRequestStatus()
                .subscribe(status => this._handleExportRequestStatus(status)));

        this._disposableSubscription.add(
            this.form.get('format').valueChanges.subscribe(
                format => {
                    if (format) {
                        this.selectedFormatLabel = projectExportFormatEnumHelper.getLabelByValue(format);
                        this._handleFormStateByFormat(format);
                        this._handleTopicsSubtitles(format);
                    }
                }
            )
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _handleExportRequestStatus(status: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = status === RequestStatusEnum.progress;

            if (status === RequestStatusEnum.success) {
                this.handleCancel();
            }
        }
    }

    private _handleFormStateByFormat(format: string): void {
        const isZipFormatSelected = format === ProjectExportFormatEnum.Zip;

        if (isZipFormatSelected) {
            this._disableFormControls();
        } else {
            this._enableFormControls();
        }
    }

    private _enableFormControls(): void {
        this.form.get('taskExportSchedulingType').enable();
        this.form.get('milestoneExportSchedulingType').enable();
        this.form.get('includeTopics').enable();
    }

    private _disableFormControls(): void {
        this.form.get('taskExportSchedulingType').disable();
        this.form.get('milestoneExportSchedulingType').disable();
        this.form.get('includeTopics').disable();
    }

    private _handleTopicsSubtitles(format: ProjectExportFormatEnum): void {
        this.isMicrosoftProjectFormatSelected = format === ProjectExportFormatEnum.MSProject;
    }
}
