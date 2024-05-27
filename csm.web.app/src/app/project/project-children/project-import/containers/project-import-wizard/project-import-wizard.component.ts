/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {
    WizardStep,
    WizardStepsComponent,
} from '../../../../../shared/ui/wizard-steps/wizard-steps.component';
import {ProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/project-import-analyze.resource';
import {ProjectImportColumnResource} from '../../../../project-common/api/project-import/resources/project-import-column.resource';
import {ProjectImportUploadResource} from '../../../../project-common/api/project-import/resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/save-project-import-analyze.resource';
import {ProjectImportActions} from '../../../../project-common/store/project-import/project-import.actions';
import {ProjectImportQueries} from '../../../../project-common/store/project-import/project-import.queries';
import {ProjectImportCraftCapture} from '../../presentationals/project-import-craft-capture/project-import-craft-capture.component';
import {ProjectImportWorkareaCapture} from '../../presentationals/project-import-workarea-capture/project-import-workarea-capture.component';

export interface ProjectImportWizardStepData<T> {
    submitted?: boolean;
    data: T;
}

export type ProjectImportWizardStepsData = [
    ProjectImportWizardStepData<File>,
    ProjectImportWizardStepData<ProjectImportCraftCapture>,
    ProjectImportWizardStepData<ProjectImportWorkareaCapture>,
    ProjectImportWizardStepData<ProjectImportAnalyzeResource>,
];

export enum ProjectImportWizardStepsEnum {
    UploadStep = 0,
    CraftStep = 1,
    WorkareaStep = 2,
    ReviewStep = 3,
}

export const PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE: ProjectImportWizardStepData<null> = {
    submitted: false,
    data: null,
};

@Component({
    selector: 'ss-project-import-wizard',
    templateUrl: './project-import-wizard.component.html',
    styleUrls: ['./project-import-wizard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportWizardComponent implements OnInit, OnDestroy {

    @ViewChild('wizardStepsComponent', {static: false})
    public wizardStepsComponent: WizardStepsComponent;

    @Output()
    public closed = new EventEmitter<void>();

    public activeStep: ProjectImportWizardStepsEnum = ProjectImportWizardStepsEnum.UploadStep;

    public canClickNext = false;

    public isLoading = false;

    public nextButtonLabel = 'Generic_Next';

    public options: SelectOption<ProjectImportColumnResource>[] = [];

    public projectImportWizardStepsEnum = ProjectImportWizardStepsEnum;

    public wizardSteps: WizardStep[] = [
        {
            label: 'Project_Import_UploadStepLabel',
            icon: 'upload',
            active: true,
            disabled: false,
        },
        {
            label: 'Project_Import_CraftStepLabel',
            icon: 'crafts',
            active: false,
            disabled: true,
        },
        {
            label: 'Project_Import_WorkAreaStepLabel',
            icon: 'workarea',
            active: false,
            disabled: true,
        },
        {
            label: 'Project_Import_ReviewDataStepLabel',
            icon: 'check-all',
            active: false,
            disabled: true,
        }];

    public wizardStepsData: ProjectImportWizardStepsData = [
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
    ];

    private _canImportProject = false;

    private _disposableSubscriptions = new Subscription();

    private _version = 0;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _projectImportQueries: ProjectImportQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._initializeSlice();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleBack(): void {
        this.wizardStepsComponent.regressStep();
    }

    public handleNext(): void {
        switch (this.activeStep) {
            case ProjectImportWizardStepsEnum.UploadStep:
                this._setStepDisabledState(ProjectImportWizardStepsEnum.CraftStep, false);
                this.wizardStepsComponent.advanceStep();
                break;

            case ProjectImportWizardStepsEnum.CraftStep:
                this._setStepDisabledState(ProjectImportWizardStepsEnum.WorkareaStep, false);
                this.wizardStepsComponent.advanceStep();
                break;

            case ProjectImportWizardStepsEnum.WorkareaStep:
                if (!this._isAnalyzeSubmitted()) {
                    this._submitAnalyze();
                } else {
                    this._setStepDisabledState(ProjectImportWizardStepsEnum.ReviewStep, false);
                    this.wizardStepsComponent.advanceStep();
                }
                break;

            case ProjectImportWizardStepsEnum.ReviewStep:
                this._submitImport();
                break;
        }
    }

    public handleCraftStepChanged(value: ProjectImportCraftCapture): void {
        const currentStepData = this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].data;

        if (!isEqual(value, currentStepData)) {
            this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = {data: value};

            this._setStepDisabledState(ProjectImportWizardStepsEnum.ReviewStep, true);
            this._changeDetectorRef.detectChanges();
        }
    }

    public handleUploadStepChanged(file: File): void {
        const currentStepData = this.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep].data;

        if (!isEqual(file, currentStepData)) {
            this.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep] = {data: file};
            this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE;
            this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE;

            this._setStepDisabledState(ProjectImportWizardStepsEnum.CraftStep, true);
            this._setStepDisabledState(ProjectImportWizardStepsEnum.WorkareaStep, true);
            this._setStepDisabledState(ProjectImportWizardStepsEnum.ReviewStep, true);
            this._setCanClickNext();

            this._changeDetectorRef.detectChanges();
        }
    }

    public handleWorkareaStepChanged(value: ProjectImportWorkareaCapture): void {
        const currentStepData = this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].data;

        if (!isEqual(value, currentStepData)) {
            this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = {data: value};

            this._setStepDisabledState(ProjectImportWizardStepsEnum.ReviewStep, true);
            this._changeDetectorRef.detectChanges();
        }
    }

    public handleWizardStepsChange(wizardSteps: WizardStep[]): void {
        this.wizardSteps = wizardSteps;

        this._setActiveStep();
        this._setCanClickNext();
        this._setNextButtonLabel();
    }

    private _handleAnalyzeResponse(response: ProjectImportAnalyzeResource): void {
        this._setVersion(response.version);

        this.wizardStepsData[ProjectImportWizardStepsEnum.ReviewStep] = {data: response};
        this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].submitted = true;
        this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].submitted = true;

        this._setStepDisabledState(ProjectImportWizardStepsEnum.ReviewStep, false);
        this._canImportProject = response._links?.hasOwnProperty('import');

        this._changeDetectorRef.detectChanges();

        this.wizardStepsComponent.advanceStep();
    }

    private _handleUploadResponse({columns, version}: ProjectImportUploadResource): void {
        this._setVersion(version);
        this._setOptions(columns);
    }

    private _initializeSlice(): void {
        this._store.dispatch(new ProjectImportActions.Initialize.All());
    }

    private _isAnalyzeSubmitted(): boolean {
        const isCraftStepSubmitted = this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].submitted;
        const isWorkareaStepSubmitted = this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].submitted;

        return isCraftStepSubmitted && isWorkareaStepSubmitted;
    }

    private _setActiveStep(): void {
        this.activeStep = this.wizardSteps.findIndex(step => step.active);
    }

    private _setCanClickNext(): void {
        switch (this.activeStep) {
            case ProjectImportWizardStepsEnum.UploadStep:
                this.canClickNext = !!this.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep].data;
                break;

            case ProjectImportWizardStepsEnum.CraftStep:
            case ProjectImportWizardStepsEnum.WorkareaStep:
                this.canClickNext = true;
                break;

            case ProjectImportWizardStepsEnum.ReviewStep:
                this.canClickNext = this._canImportProject;
                break;
        }
    }

    private _setLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;

        this._changeDetectorRef.detectChanges();
    }

    private _setNextButtonLabel(): void {
        this.nextButtonLabel = this.activeStep === ProjectImportWizardStepsEnum.ReviewStep
            ? 'Generic_ImportData'
            : 'Generic_Next';
    }

    private _setOptions(columns: ProjectImportColumnResource[]): void {
        this.options = columns.map(({name, columnType, fieldType}) => ({
            label: name,
            value: {columnType, fieldType},
        }));
    }

    private _setStepDisabledState(step: ProjectImportWizardStepsEnum, disabled: boolean): void {
        this.wizardSteps[step].disabled = disabled;
        this.wizardSteps = [...this.wizardSteps];
    }

    private _setVersion(version: number): void {
        this._version = version;
    }

    private _submitAnalyze(): void {
        const craftColumn = this.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].data.craftColumn;
        const {workAreaColumn, readWorkAreasHierarchically} = this.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].data;
        const payload: SaveProjectImportAnalyzeResource = {
            craftColumn,
            workAreaColumn,
            readWorkAreasHierarchically,
        };

        this._store.dispatch(new ProjectImportActions.Analyze.One(payload, this._version));
    }

    private _submitImport(): void {
        this._store.dispatch(new ProjectImportActions.Import.One(this._version));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectImportQueries.observeRequestStatus('analyze')
                .subscribe((requestStatus: RequestStatusEnum) => this._setLoading(requestStatus)));

        this._disposableSubscriptions.add(
            this._projectImportQueries.observeRequestStatus('import')
                .subscribe((requestStatus: RequestStatusEnum) => {
                    this._setLoading(requestStatus);

                    if (requestStatus === RequestStatusEnum.success) {
                        this.closed.emit();
                    }
                }));

        this._disposableSubscriptions.add(
            this._projectImportQueries.observeUploadResponse()
                .pipe(filter(response => !!response))
                .subscribe((response: ProjectImportUploadResource) => this._handleUploadResponse(response))
        );

        this._disposableSubscriptions.add(
            this._projectImportQueries.observeAnalyzeResponse()
                .pipe(filter(response => !!response))
                .subscribe((response: ProjectImportAnalyzeResource) => this._handleAnalyzeResponse(response))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
