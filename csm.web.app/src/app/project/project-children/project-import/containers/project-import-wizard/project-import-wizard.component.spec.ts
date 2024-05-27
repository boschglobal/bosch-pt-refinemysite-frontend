/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    PROJECT_IMPORT_ANALYZE_RESOURCE_1,
    PROJECT_IMPORT_ANALYZE_RESOURCE_2,
    PROJECT_IMPORT_UPLOAD_RESOURCE_1
} from '../../../../../../test/mocks/project-import';
import {MockStore} from '../../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {WizardStepsComponent} from '../../../../../shared/ui/wizard-steps/wizard-steps.component';
import {ProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../../../project-common/api/project-import/resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from '../../../../project-common/api/project-import/resources/save-project-import-analyze.resource';
import {ProjectImportActions} from '../../../../project-common/store/project-import/project-import.actions';
import {ProjectImportQueries} from '../../../../project-common/store/project-import/project-import.queries';
import {ProjectImportCraftCapture} from '../../presentationals/project-import-craft-capture/project-import-craft-capture.component';
import {ProjectImportWorkareaCapture} from '../../presentationals/project-import-workarea-capture/project-import-workarea-capture.component';
import {
    PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
    ProjectImportWizardComponent,
    ProjectImportWizardStepsData,
    ProjectImportWizardStepsEnum,
} from './project-import-wizard.component';

describe('Project Import Wizard Component', () => {
    let component: ProjectImportWizardComponent;
    let fixture: ComponentFixture<ProjectImportWizardComponent>;
    let changeDetectorRef: ChangeDetectorRef;
    let store: Store;
    let de: DebugElement;

    const projectImportQueriesMock: ProjectImportQueries = mock(ProjectImportQueries);
    const analyzeRequestStatusObservable: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();
    const importRequestStatusObservable: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();
    const uploadResponseObservable: Subject<ProjectImportUploadResource> = new Subject<ProjectImportUploadResource>();
    const analyzeResponseObservable: Subject<ProjectImportAnalyzeResource> = new Subject<ProjectImportAnalyzeResource>();

    const defaultWizardStepsData: ProjectImportWizardStepsData = [
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
        PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE,
    ];
    const mockFile1: File = new File([''], 'file1');
    const mockFile2: File = new File([''], 'file2');
    const mockCraftValue: ProjectImportCraftCapture = {craftColumn: null};
    const mockWorkareaValue: ProjectImportWorkareaCapture = {readWorkAreasHierarchically: true};

    const projectImportWizardUploadStepSelector = '[data-automation="project-import-wizard-upload-step"]';
    const projectImportWizardCraftStepSelector = '[data-automation="project-import-wizard-craft-step"]';
    const projectImportWizardWorkareaStepSelector = '[data-automation="project-import-wizard-workarea-step"]';
    const projectImportWizardReviewStepSelector = '[data-automation="project-import-wizard-review-step"]';
    const projectImportWizardBackButtonSelector = '[data-automation="project-import-wizard-back-button"]';
    const projectImportWizardNextButtonSelector = '[data-automation="project-import-wizard-next-button"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectImportWizardComponent,
            WizardStepsComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: ProjectImportQueries,
                useFactory: () => instance(projectImportQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportWizardComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        de = fixture.debugElement;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);

        component.wizardStepsComponent = jasmine.createSpyObj('WizardStepsComponent', ['advanceStep', 'regressStep']);
        component.wizardStepsData = cloneDeep(defaultWizardStepsData);

        when(projectImportQueriesMock.observeRequestStatus('analyze')).thenReturn(analyzeRequestStatusObservable);
        when(projectImportQueriesMock.observeRequestStatus('import')).thenReturn(importRequestStatusObservable);
        when(projectImportQueriesMock.observeUploadResponse()).thenReturn(uploadResponseObservable);
        when(projectImportQueriesMock.observeAnalyzeResponse()).thenReturn(analyzeResponseObservable);

        component.ngOnInit();
    });

    it('should render the upload step when the active step is the UploadStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.UploadStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardUploadStepSelector)).toBeTruthy();
        expect(getElement(projectImportWizardCraftStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardWorkareaStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardReviewStepSelector)).toBeFalsy();
    });

    it('should render the craft step when the active step is the CraftStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.CraftStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardUploadStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardCraftStepSelector)).toBeTruthy();
        expect(getElement(projectImportWizardWorkareaStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardReviewStepSelector)).toBeFalsy();
    });

    it('should render the workarea step when the active step is the WorkareaStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.WorkareaStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardUploadStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardCraftStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardWorkareaStepSelector)).toBeTruthy();
        expect(getElement(projectImportWizardReviewStepSelector)).toBeFalsy();
    });

    it('should render the review step when the active step is the ReviewStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.ReviewStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardUploadStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardCraftStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardWorkareaStepSelector)).toBeFalsy();
        expect(getElement(projectImportWizardReviewStepSelector)).toBeTruthy();
    });

    it('should render the Back button when the active step is not the UploadStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.ReviewStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardBackButtonSelector)).toBeTruthy();
    });

    it('should not render the Back button when the active step is the UploadStep', () => {
        component.activeStep = ProjectImportWizardStepsEnum.UploadStep;
        fixture.detectChanges();

        expect(getElement(projectImportWizardBackButtonSelector)).toBeFalsy();
    });

    it('should set the Next button as disabled when canClickNext is false', () => {
        component.canClickNext = false;
        fixture.detectChanges();

        expect(getElement(projectImportWizardNextButtonSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not set the Next button as disabled when canClickNext is true', () => {
        component.canClickNext = true;
        fixture.detectChanges();

        expect(getElement(projectImportWizardNextButtonSelector).attributes['disabled']).toBeFalsy();
    });

    it('should initialize the store slice on ngOnInit', () => {
        const payload = new ProjectImportActions.Initialize.All();

        spyOn(store, 'dispatch');

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(payload);
    });

    it('should set isLoading to true when the analyze request status is in progress', () => {
        component.isLoading = false;
        analyzeRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when the analyze request status is not in progress', () => {
        component.isLoading = true;
        analyzeRequestStatusObservable.next(RequestStatusEnum.success);

        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to true when the import request status is in progress', () => {
        component.isLoading = false;
        importRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when the import request status is not in progress', () => {
        component.isLoading = true;
        importRequestStatusObservable.next(RequestStatusEnum.success);

        expect(component.isLoading).toBeFalsy();
    });

    it('should emit closed when import request status is success', () => {
        spyOn(component.closed, 'emit');

        importRequestStatusObservable.next(RequestStatusEnum.success);

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should not emit closed when import request status is not success', () => {
        spyOn(component.closed, 'emit');

        importRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(component.closed.emit).not.toHaveBeenCalled();
    });

    it('should call regressStep when handleBack is called', () => {
        component.handleBack();

        expect(component.wizardStepsComponent.regressStep).toHaveBeenCalled();
    });

    it('should call advanceStep when handleNext is called and UploadStep is active', () => {
        component.activeStep = ProjectImportWizardStepsEnum.UploadStep;
        component.handleNext();

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.CraftStep].disabled).toBeFalsy();
        expect(component.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should call advanceStep when handleNext is called and CraftStep is active', () => {
        component.activeStep = ProjectImportWizardStepsEnum.CraftStep;
        component.handleNext();

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.WorkareaStep].disabled).toBeFalsy();
        expect(component.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should call advanceStep when handleNext is called, WorkareaStep is active and it was already submitted', () => {
        component.activeStep = ProjectImportWizardStepsEnum.WorkareaStep;
        component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].submitted = true;
        component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].submitted = true;
        component.handleNext();

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].disabled).toBeFalsy();
        expect(component.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should dispatch a ProjectImportActions.Analyze.One action when handleNext is called, WorkareaStep is active ' +
        'and it was not submitted yet', () => {
        const craftColumn = null;
        const workAreaColumn = null;
        const readWorkAreasHierarchically = true;
        const payload: SaveProjectImportAnalyzeResource = {
            craftColumn,
            workAreaColumn,
            readWorkAreasHierarchically,
        };
        const action = new ProjectImportActions.Analyze.One(payload, 0);

        spyOn(store, 'dispatch');

        component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = {
            submitted: false,
            data: {craftColumn},
        };
        component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = {
            submitted: false,
            data: {readWorkAreasHierarchically, workAreaColumn},
        };
        component.activeStep = ProjectImportWizardStepsEnum.WorkareaStep;
        component.handleNext();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch a ProjectImportActions.Import.One action when handleNext is called and ReviewStep is active', () => {
        const action = new ProjectImportActions.Import.One(0);

        spyOn(store, 'dispatch');

        component.activeStep = ProjectImportWizardStepsEnum.ReviewStep;
        component.handleNext();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set wizardSteps with the provided value when handleWizardStepsChange is called', () => {
        const wizardSteps = component.wizardSteps;

        component.wizardSteps = [];
        component.handleWizardStepsChange(wizardSteps);

        expect(component.wizardSteps).toBe(wizardSteps);
    });

    it('should set the activeStep to the active step when handleWizardStepsChange is called', () => {
        const activeStep = ProjectImportWizardStepsEnum.ReviewStep;
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[activeStep].active = true;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.activeStep).toBe(activeStep);
    });

    it('should set the canClickNext to true when handleWizardStepsChange is called and the CraftStep is active', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.CraftStep].active = true;
        component.canClickNext = false;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.canClickNext).toBeTruthy();
    });

    it('should set the canClickNext to true when handleWizardStepsChange is called and the WorkareaStep is active', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.WorkareaStep].active = true;
        component.canClickNext = false;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.canClickNext).toBeTruthy();
    });

    it('should set the canClickNext to true when handleWizardStepsChange is called and the ReviewStep is active', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].active = true;
        component.canClickNext = false;
        analyzeResponseObservable.next(PROJECT_IMPORT_ANALYZE_RESOURCE_2);
        component.handleWizardStepsChange(wizardSteps);

        expect(component.canClickNext).toBeTruthy();
    });

    it('should set the canClickNext to false when analyse response has no link', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].active = true;
        component.canClickNext = true;
        analyzeResponseObservable.next(PROJECT_IMPORT_ANALYZE_RESOURCE_1);
        component.handleWizardStepsChange(wizardSteps);

        expect(component.canClickNext).toBeFalsy();
    });

    it('should set the canClickNext to true when handleWizardStepsChange is called, the UploadStep is active ' +
        'if file was uploaded even with next step disabled', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        component.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep] = {data: mockFile2};
        wizardSteps[ProjectImportWizardStepsEnum.UploadStep].active = true;
        component.handleWizardStepsChange(wizardSteps);

        expect(wizardSteps[ProjectImportWizardStepsEnum.CraftStep].disabled).toBeTruthy();
        expect(component.canClickNext).toBeTruthy();
    });

    it('should set the canClickNext to false when handleWizardStepsChange is called, the UploadStep is active ' +
        'and the CraftStep is disabled ', () => {
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.UploadStep].active = true;
        wizardSteps[ProjectImportWizardStepsEnum.CraftStep].disabled = true;

        component.canClickNext = true;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.canClickNext).toBeFalsy();
    });

    it('should set the nextButtonLabel to Generic_ImportData when handleWizardStepsChange is called ' +
        'and the ReviewStep is active', () => {
        const expectedLabel = 'Generic_ImportData';
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].active = true;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.nextButtonLabel).toBe(expectedLabel);
    });

    it('should set the nextButtonLabel to Generic_Next when handleWizardStepsChange is called ' +
        'and other step besides ReviewStep is active', () => {
        const expectedLabel = 'Generic_Next';
        const wizardSteps = component.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[ProjectImportWizardStepsEnum.WorkareaStep].active = true;
        component.handleWizardStepsChange(wizardSteps);

        expect(component.nextButtonLabel).toBe(expectedLabel);
    });

    it('should set the canClickNext to true when handleUploadStepChanged is called with a file', () => {
        component.canClickNext = false;
        component.handleUploadStepChanged(mockFile1);

        expect(component.canClickNext).toBeTruthy();
    });

    it('should set the canClickNext to false when handleUploadStepChanged is called without a file', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep] = {data: mockFile2};
        component.canClickNext = true;
        component.handleUploadStepChanged(null);

        expect(component.canClickNext).toBeFalsy();
    });

    it('should process the file when handleUploadStepChanged is called with a different file than the current one', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.handleUploadStepChanged(mockFile1);

        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep].data).toBe(mockFile1);
        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should not process the file when handleUploadStepChanged is called with a similar file than the current one', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep] = {data: mockFile2};
        component.handleUploadStepChanged(mockFile2);

        expect(changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    });

    it('should reset the CraftStep and WorkareaStep data when handleUploadStepChanged is called', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = {data: {craftColumn: null}};
        component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = {data: {readWorkAreasHierarchically: true}};

        component.handleUploadStepChanged(mockFile1);

        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep]).toBe(PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE);
        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep]).toBe(PROJECT_IMPORT_WIZARD_STEP_DATA_INITIAL_VALUE);
    });

    it('should mark the CraftStep and WorkareaStep as disabled when handleUploadStepChanged is called without a file', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.UploadStep] = {data: mockFile2};
        component.handleUploadStepChanged(null);

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.CraftStep].disabled).toBeTruthy();
        expect(component.wizardSteps[ProjectImportWizardStepsEnum.WorkareaStep].disabled).toBeTruthy();
    });

    it('should mark the CraftStep and WorkareaStep as disabled when handleUploadStepChanged is called with a file', () => {
        component.handleUploadStepChanged(mockFile1);

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.CraftStep].disabled).toBeTruthy();
        expect(component.wizardSteps[ProjectImportWizardStepsEnum.WorkareaStep].disabled).toBeTruthy();
    });

    it('should mark the ReviewStep as disabled when handleUploadStepChanged is called', () => {
        component.wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].disabled = false;

        component.handleUploadStepChanged(mockFile1);

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].disabled).toBeTruthy();
    });

    it('should process the value when handleCraftStepChanged is called with a different value than the current one', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.handleCraftStepChanged(mockCraftValue);

        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].data).toBe(mockCraftValue);
        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should not process the value when handleCraftStepChanged is called with a similar value than the current one', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = {data: mockCraftValue};

        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.handleCraftStepChanged(mockCraftValue);

        expect(changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    });

    it('should process the value when handleWorkareaStepChanged is called with a different value than the current one', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.handleWorkareaStepChanged(mockWorkareaValue);

        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].data).toBe(mockWorkareaValue);
        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should not process the value when handleWorkareaStepChanged is called with a similar value than the current one', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = {data: mockWorkareaValue};

        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        component.handleWorkareaStepChanged(mockWorkareaValue);

        expect(changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    });

    it('should mark the CraftStep and WorkareaStep as submitted when analyze response is received', () => {
        component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep] = {data: null, submitted: false};
        component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep] = {data: null, submitted: false};

        analyzeResponseObservable.next(PROJECT_IMPORT_ANALYZE_RESOURCE_1);

        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.CraftStep].submitted).toBeTruthy();
        expect(component.wizardStepsData[ProjectImportWizardStepsEnum.WorkareaStep].submitted).toBeTruthy();
    });

    it('should mark the ReviewStep as not disabled when analyze response is received', () => {
        component.wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].disabled = true;

        analyzeResponseObservable.next(PROJECT_IMPORT_ANALYZE_RESOURCE_2);

        expect(component.wizardSteps[ProjectImportWizardStepsEnum.ReviewStep].disabled).toBeFalsy();
    });

    it('should call advanceStep when analyze response is received', () => {
        fixture.detectChanges();

        spyOn(component.wizardStepsComponent, 'advanceStep');

        analyzeResponseObservable.next(PROJECT_IMPORT_ANALYZE_RESOURCE_2);

        expect(component.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should set options when upload response is received', () => {
        const expectedOptions = PROJECT_IMPORT_UPLOAD_RESOURCE_1.columns.map(({name, columnType, fieldType}) => ({
            label: name,
            value: {columnType, fieldType},
        }));

        component.options = [];
        uploadResponseObservable.next(PROJECT_IMPORT_UPLOAD_RESOURCE_1);

        expect(component.options).toEqual(expectedOptions);
    });
});
