/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_CAPTURE_MODEL,
    MOCK_PROJECT_INCOMPLETE,
    MOCK_PROJECT_PICTURE
} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {
    REDUCER,
    State
} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectResource} from '../../../../project-common/api/projects/resources/project.resource';
import {EmployeeRoleEnum} from '../../../../project-common/enums/employee-role.enum';
import {ProjectCaptureComponent} from '../../../../project-common/presentationals/project-capture/project-capture.component';
import {ProjectCaptureModel} from '../../../../project-common/presentationals/project-capture/project-capture.model';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {
    ProjectActions,
    ProjectPictureActions
} from '../../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectEditComponent} from './project-edit.component';

describe('Project Edit Component', () => {
    let fixture: ComponentFixture<ProjectEditComponent>;
    let comp: ProjectEditComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<State>;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectParticipantQueriesMock: ProjectParticipantQueries = mock(ProjectParticipantQueries);
    const blobServiceMock: BlobService = mock(BlobService);

    const clickEvent: Event = new Event('click');
    const dataAutomationCancelSelector = '[data-automation="cancel"]';
    const initialDefaultCaptureValues: any = {
        picture: null,
        title: '',
        description: '',
        number: '',
        start: null,
        end: null,
        client: '',
        category: null,
        address: {
            street: '',
            houseNumber: '',
            zipCode: '',
            city: '',
        },
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            EffectsModule.forRoot([]),
            HttpClientTestingModule,
            StoreModule.forRoot(REDUCER),
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectEditComponent,
            ProjectCaptureComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                },
            },
            {
                provide: BlobService,
                useFactory: () => instance(blobServiceMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            HttpClient,
            ProjectUrlRetriever,
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectEditComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(MOCK_PROJECT_1));
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(projectParticipantQueriesMock.observeActiveParticipantsByRole(EmployeeRoleEnum.CSM)).thenReturn(of([MOCK_PARTICIPANT]));

        comp.projectCapture.ngOnInit();
        fixture.detectChanges();

        TestBed.inject(HttpTestingController);
        store = TestBed.inject(Store);
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should trigger onCancelEdit() when project capture is canceled', () => {
        spyOn(comp, 'onCancelEdit').and.callThrough();
        el.querySelector(dataAutomationCancelSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.onCancelEdit).toHaveBeenCalled();
    });

    it('should trigger onSubmitEdit() when project capture is submitted', () => {
        spyOn(comp, 'onSubmitEdit').and.callThrough();
        comp.projectCapture.onSubmitForm();
        expect(comp.onSubmitEdit).toHaveBeenCalled();
    });

    it('should trigger onSubmitEdit() when project is submitted only with project information changes', () => {
        const action = new ProjectActions.Update.Project(MOCK_PROJECT_CAPTURE_MODEL);
        spyOn(store, 'dispatch').and.callThrough();
        comp.onSubmitEdit(MOCK_PROJECT_CAPTURE_MODEL);
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should trigger onSubmitEdit() when project is submitted with default picture', () => {
        const action = new ProjectPictureActions.Delete.ProjectPicture(true);
        const projectCaptureModel: ProjectCaptureModel = MOCK_PROJECT_CAPTURE_MODEL;
        projectCaptureModel.picture = null;
        comp.defaultCaptureValues.picture = '';

        spyOn(store, 'dispatch').and.callThrough();

        comp.onSubmitEdit(projectCaptureModel);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set empty optional project properties to null when setting default values', () => {
        comp.ngOnDestroy();

        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(MOCK_PROJECT_INCOMPLETE));
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_INCOMPLETE.id));

        comp.ngOnInit();
        comp.projectCapture.ngOnInit();

        expect(comp.defaultCaptureValues.description).toBeNull();
        expect(comp.defaultCaptureValues.client).toBeNull();
        expect(comp.defaultCaptureValues.category).toBeNull();
    });

    it('should set picture default value when project has picture', () => {
        const projectPictureHref: string = MOCK_PROJECT_PICTURE._embedded.projectPicture._links.small.href;

        comp.ngOnDestroy();

        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(MOCK_PROJECT_PICTURE));
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_PICTURE.id));
        when(blobServiceMock.getBlob(projectPictureHref)).thenReturn(of(new Blob()));

        comp.ngOnInit();
        comp.projectCapture.ngOnInit();

        expect(comp.defaultCaptureValues.picture).not.toBeNull();
    });

    it('should not change default values when current project is not set', () => {
        comp.ngOnDestroy();

        comp.defaultCaptureValues = initialDefaultCaptureValues;
        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(undefined));

        comp.ngOnInit();
        comp.projectCapture.ngOnInit();

        expect(comp.defaultCaptureValues).toEqual(initialDefaultCaptureValues);
    });

    it('should request participants on component init', () => {
        spyOn(store, 'dispatch').and.callThrough();
        comp.ngOnInit();
        expect(store.dispatch).toHaveBeenCalledWith(new ProjectParticipantActions.Request.ActiveByRole([EmployeeRoleEnum.CSM]));
    });

    it('should observe CSMs from current project', () => {
        expect(comp.contacts).toEqual([MOCK_PARTICIPANT]);
    });

    it('should set isLoading to false when observeActiveParticipantsByRole, observeCurrentProject and getBlob observables ' +
        'emit and the project has picture', () => {
        comp.isLoading = true;
        const pictureUrl = MOCK_PROJECT_PICTURE._embedded.projectPicture._links.small.href;
        const observeCurrentProjectSubject = new Subject<ProjectResource>();
        const getBlobSubject = new Subject<Blob>();

        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(observeCurrentProjectSubject);
        when(blobServiceMock.getBlob(pictureUrl)).thenReturn(getBlobSubject);

        comp.ngOnInit();
        expect(comp.isLoading).toBeTruthy();

        observeCurrentProjectSubject.next(MOCK_PROJECT_PICTURE);
        expect(comp.isLoading).toBeTruthy();

        getBlobSubject.next(new Blob(['11111'], {type: 'image/test'}));
        expect(comp.defaultCaptureValues.picture).toBeDefined();
        expect(comp.defaultCaptureValues.picture.type).toEqual('image/test');

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when observeActiveParticipantsByRole and observeCurrentProject observables emit ' +
        'and project doesn\'t have picture', () => {
        comp.isLoading = true;

        comp.ngOnInit();
        expect(comp.isLoading).toBeFalsy();
    });
});
