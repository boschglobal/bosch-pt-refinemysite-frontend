/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {
    filter,
    startWith
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../../shared/misc/validation/generic.validators';
import {Z_INDEX} from '../../../../../shared/ui/constants/z-index.constants';
import {FlyoutOpenTriggerEnum} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {CreateProjectCopyResource} from '../../../../project-common/api/project-copy/resources/create-project-copy.resource';
import {ProjectCopyAction} from '../../../../project-common/store/project-copy/project-copy.actions';
import {ProjectCopyQueries} from '../../../../project-common/store/project-copy/project-copy.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';

export interface CopyProjectFormData {
    projectName: string;
    selectAll: boolean;
    workingAreas: boolean;
    disciplines: boolean;
    milestones: boolean;
    tasks: boolean;
    dayCards: boolean;
    keepTaskStatus: boolean;
    keepTaskAssignee: boolean;
}

export const COPY_PROJECT_FORM_DATA: CopyProjectFormData = {
    projectName: '',
    selectAll: false,
    workingAreas: false,
    disciplines: false,
    milestones: false,
    tasks: false,
    dayCards: false,
    keepTaskStatus: false,
    keepTaskAssignee: false,
};

@Component({
    selector: 'ss-project-copy',
    templateUrl: './project-copy.component.html',
    styleUrls: ['./project-copy.component.scss'],
})
export class ProjectCopyComponent implements OnInit, OnDestroy {

    @Input()
    public set projectCopyTitle(title: string) {
        this._projectCopyTitle = title;
        this.form.controls.projectName.patchValue(title);
    }

    @Output()
    public closed: EventEmitter<null> = new EventEmitter<null>();

    public isLoading = false;

    public isKeepTaskAssigneeSelected = false;

    public isTasksSelected = false;

    public isIndeterminated = false;

    public isIndeterminatedTasks = false;

    public projectCopyOptions: ProjectCopyFormOptions[] = [
        {
            label: 'Generic_WorkingAreas',
            value: 'workingAreas',
        },
        {
            label: 'Generic_CraftsLabel',
            value: 'disciplines',
        },
    ];

    public tooltipFlyoutTrigger = FlyoutOpenTriggerEnum.Hover;

    public flyoutZIndex = Z_INDEX.index__100000;

    public tooltipIconColor = '#525f6b';

    private _isSubmitting: boolean;

    private _projectId: string;

    private _disposableSubscription: Subscription = new Subscription();

    private _allSelectedControlFlag = false;

    private _allTasksSelectedControlFlag = false;

    private _projectCopyTitle = '';

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _projectCopyQueries: ProjectCopyQueries,
                private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
    }

    public form = this._formBuilder.group({
        projectName: new FormControl(this._projectCopyTitle, [GenericValidators.isRequired(), GenericValidators.isMaxLength(100)]),
        selectAll: new FormControl(COPY_PROJECT_FORM_DATA.selectAll),
        workingAreas: new FormControl(COPY_PROJECT_FORM_DATA.workingAreas),
        disciplines: new FormControl(COPY_PROJECT_FORM_DATA.disciplines),
        milestones: new FormControl(COPY_PROJECT_FORM_DATA.milestones),
        tasks: new FormControl(COPY_PROJECT_FORM_DATA.tasks),
        dayCards: new FormControl(COPY_PROJECT_FORM_DATA.dayCards),
        keepTaskStatus: new FormControl(COPY_PROJECT_FORM_DATA.keepTaskStatus),
        keepTaskAssignee: new FormControl(COPY_PROJECT_FORM_DATA.keepTaskAssignee),
    });

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public handleCopy(): void {
        const {
            workingAreas, disciplines, milestones, dayCards, keepTaskStatus, keepTaskAssignee, projectName,
        } = this.form.getRawValue();
        const resource = {
            workingAreas,
            disciplines,
            milestones,
            tasks: this.isTasksSelected,
            dayCards,
            keepTaskStatus,
            keepTaskAssignee,
            projectName,
        } as CreateProjectCopyResource;

        this._isSubmitting = true;
        this._store.dispatch(new ProjectCopyAction.Copy.One(this._projectId, resource));
    }

    public handleCancel(): void {
        this._resetForm();
        this._isSubmitting = false;
        this._store.dispatch(new ProjectCopyAction.Copy.OneReset());
        this.closed.emit();
    }

    private _resetForm(): void {
        this.form.reset({...COPY_PROJECT_FORM_DATA, projectName: this._projectCopyTitle});
        this.form.updateValueAndValidity();
        this.isTasksSelected = false;
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(id => this._projectId = id)
        );

        this._disposableSubscription.add(
            this._projectCopyQueries.observeCurrentProjectCopyRequestStatus()
                .subscribe(status => this._handleCopyRequestStatus(status))
        );

        this._disposableSubscription.add(
            combineLatest([
                this.form.controls.workingAreas.valueChanges.pipe(startWith(false)),
                this.form.controls.disciplines.valueChanges.pipe(startWith(false)),
                this.form.controls.milestones.valueChanges.pipe(startWith(false)),
                this.form.controls.dayCards.valueChanges.pipe(startWith(false)),
                this.form.controls.keepTaskStatus.valueChanges.pipe(startWith(false)),
                this.form.controls.keepTaskAssignee.valueChanges.pipe(startWith(false)),
            ]).subscribe(() => {
                const workingAreas = this.form.controls.workingAreas.value;
                const disciplines = this.form.controls.disciplines.value;
                const milestones = this.form.controls.milestones.value;
                const dayCards = this.form.controls.dayCards.value;
                const keepTaskStatus = this.form.controls.keepTaskStatus.value;
                const keepTaskAssignee = this.form.controls.keepTaskAssignee.value;
                const allOptionsSelected = workingAreas && disciplines && milestones && dayCards && keepTaskStatus && keepTaskAssignee;
                const someOptionsSelected = workingAreas || disciplines || milestones || dayCards || keepTaskStatus || keepTaskAssignee;

                if (allOptionsSelected) {
                    this._allSelectedControlFlag = true;
                    this.form.controls.selectAll.setValue(true);
                    this.isIndeterminated = false;
                } else if (someOptionsSelected) {
                    this._allSelectedControlFlag = false;
                    this.form.controls.selectAll.setValue(false);
                    this.isIndeterminated = true;
                } else {
                    this._allSelectedControlFlag = false;
                    this.form.controls.selectAll.setValue(false);
                    this.isIndeterminated = false;
                }

                this._changeDetectorRef.detectChanges();
            })
        );

        this._disposableSubscription.add(
            combineLatest([
                this.form.controls.dayCards.valueChanges.pipe(startWith(false)),
                this.form.controls.keepTaskStatus.valueChanges.pipe(startWith(false)),
                this.form.controls.keepTaskAssignee.valueChanges.pipe(startWith(false)),
            ]).subscribe(() => {
                const dayCards = this.form.controls.dayCards.value;
                const keepTaskStatus = this.form.controls.keepTaskStatus.value;
                const keepTaskAssignee = this.form.controls.keepTaskAssignee.value;
                const allOptionsSelected = dayCards && keepTaskStatus && keepTaskAssignee;
                const someOptionsSelected = dayCards || keepTaskStatus || keepTaskAssignee;

                if (allOptionsSelected) {
                    this._allTasksSelectedControlFlag = true;
                    this.form.controls.tasks.setValue(true);
                    this.isIndeterminatedTasks = false;
                    this.isTasksSelected = true;
                } else if (someOptionsSelected) {
                    this._allTasksSelectedControlFlag = false;
                    this.form.controls.tasks.setValue(false);
                    this.isIndeterminatedTasks = true;
                    this.isTasksSelected = true;
                } else {
                    this._allTasksSelectedControlFlag = false;
                    this.form.controls.tasks.setValue(false);
                    this.isIndeterminatedTasks = false;
                    this.isTasksSelected = false;
                }

                this._changeDetectorRef.detectChanges();
            })
        );

        this._disposableSubscription.add(
            this.form.controls.selectAll.valueChanges
                .pipe(
                    filter(value => value !== this._allSelectedControlFlag),
                )
                .subscribe(value => {
                    this.form.controls.workingAreas.setValue(value);
                    this.form.controls.disciplines.setValue(value);
                    this.form.controls.milestones.setValue(value);
                    this.form.controls.tasks.setValue(value);
                    this._allSelectedControlFlag = value;
                })
        );

        this._disposableSubscription.add(
            this.form.get('tasks').valueChanges
                .pipe(
                    filter(value => value !== this._allTasksSelectedControlFlag),
                )
                .subscribe(value => {
                    this.form.controls.dayCards.setValue(value);
                    this.form.controls.keepTaskAssignee.setValue(value);
                    this._allTasksSelectedControlFlag = value;
                })
        );

        this._disposableSubscription.add(
            this.form.get('keepTaskAssignee').valueChanges.subscribe(
                keepTaskAssignee => {
                    this.isKeepTaskAssigneeSelected = keepTaskAssignee;
                    this.form.controls.keepTaskStatus.setValue(keepTaskAssignee);
                    this.form.updateValueAndValidity();
                }
            )
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _handleCopyRequestStatus(status: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = status === RequestStatusEnum.progress;

            if (status === RequestStatusEnum.success) {
                this.handleCancel();
            }
        }
    }
}

export class ProjectCopyFormOptions {
    public value: string;
    public label: string;
}
