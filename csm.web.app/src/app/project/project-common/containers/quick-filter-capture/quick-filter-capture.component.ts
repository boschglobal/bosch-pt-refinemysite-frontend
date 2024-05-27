/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../shared/misc/validation/generic.warnings';
import {InputTextComponent} from '../../../../shared/ui/forms/input-text/input-text.component';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {
    ProjectFilterCaptureComponent,
    ProjectFilterFormData,
    ProjectFiltersCaptureContextEnum
} from '../project-filter-capture/project-filter-capture.component';

export interface QuickFilterCaptureFormData {
    name: string;
    projectFilter: ProjectFilterFormData;
}

@Component({
    selector: 'ss-quick-filter-capture',
    templateUrl: './quick-filter-capture.component.html',
    styleUrls: ['./quick-filter-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFilterCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue({name, projectFilter}: QuickFilterCaptureFormData) {
        this.form.setValue({name});
        this.milestoneFilters = projectFilter.milestone;
        this.taskFilters = projectFilter.task;
    }

    @Output()
    public formValidity = new EventEmitter<boolean>();

    @ViewChild('filterCapture')
    public filterCapture: ProjectFilterCaptureComponent;

    @ViewChild('nameInput', {static: true})
    public nameInput: InputTextComponent;

    public context: ProjectFiltersCaptureContextEnum = ProjectFiltersCaptureContextEnum.QuickFilters;

    public readonly form = this._formBuilder.group({
        name: ['', [
            GenericValidators.isRequired(),
            GenericValidators.isMaxLength(100),
            GenericWarnings.isCharLimitReached(100),
        ]],
    });

    public isFilterCaptureFormValid = true;

    public milestoneFilters: MilestoneFilters;

    public taskFilters: ProjectTaskFilters;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _formBuilder: FormBuilder,
                private _store: Store) {
    }

    public ngOnInit(): void {
        if (!this.form.controls.name.value) {
            this.nameInput.setFocus();
        }
        this._requestCrafts();
        this._requestWorkAreas();
        this._setSubscriptions();
    }

    public ngOnDestroy(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleFilterCaptureFormValidityChange(isFormValid: boolean): void {
        this.isFilterCaptureFormValid = isFormValid;
        this._handleFormValidityChange();
    }

    public getFormValue(): QuickFilterCaptureFormData {
        return {
            name: this.form.controls.name.value,
            projectFilter: this.filterCapture.getFormValue(),
        };
    }

    private _handleFormValidityChange(): void {
        const isValid = this.form.valid && this.isFilterCaptureFormValid;

        this.formValidity.emit(isValid);
    }

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.statusChanges.subscribe(
                () => this._handleFormValidityChange()
            )
        );
    }
}
