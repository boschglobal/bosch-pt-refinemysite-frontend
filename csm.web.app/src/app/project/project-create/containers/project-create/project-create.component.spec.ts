/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_CAPTURE_MODEL
} from '../../../../../test/mocks/projects';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {State} from '../../../../app.reducers';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectParticipantResource} from '../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectResource} from '../../../project-common/api/projects/resources/project.resource';
import {ProjectActions} from '../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {PROJECT_ROUTE_PATHS} from '../../../project-routing/project-route.paths';
import {ProjectCreateComponent} from './project-create.component';

describe('Project Create Component', () => {
    let fixture: ComponentFixture<ProjectCreateComponent>;
    let comp: ProjectCreateComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let router: Router;
    let store: Store<any>;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const routerMock: Router = mock(Router);
    const storeMock: Store<State> = mock(Store);
    const userQueriesMock: UserQueries = mock(UserQueries);
    const projectMock: ProjectResource = MOCK_PROJECT_1;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        declarations: [
            ProjectCreateComponent
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock)
            },
            ProjectUrlRetriever,
            {
                provide: Router,
                useFactory: () => instance(routerMock)
            },
            {
                provide: Store,
                useFactory: () => instance(storeMock)
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock)
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCreateComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(projectSliceServiceMock.getCurrentProject()).thenReturn(projectMock);
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));

        router = TestBed.inject(Router);
        store = TestBed.inject(Store);

        comp.projectCapture = {
            resetForm: () => {
            }
        } as any;

        fixture.detectChanges();
    });

    afterEach(() => {
        comp.ngOnDestroy();
    });

    it('should set isSubmitting to false and trigger project capture reset form when request status has success', () => {
        spyOn(comp.projectCapture, 'resetForm').and.callThrough();
        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(routerMock.navigate(anything())).thenReturn(new Promise<boolean>((resolve) => resolve(true)));

        comp.ngOnInit();

        expect(comp.isSubmitting).toBe(false);
        expect(comp.projectCapture.resetForm).toHaveBeenCalled();
    });

    it('should navigate to project dashboard after a successful form submission', () => {
        spyOn(router, 'navigate').and.callThrough();
        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        const expectedValue = [ProjectUrlRetriever.getProjectDashboardUrl(projectMock.id)];

        comp.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(expectedValue);
    });

    it('should set isSubmitting to true when request status is in progress', () => {
        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.progress));
        comp.ngOnInit();
        expect(comp.isSubmitting).toBe(true);
    });

    it('should set isSubmitting to false when request status has an error', waitForAsync(() => {
        when(projectSliceServiceMock.observeCurrentProjectRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        comp.ngOnInit();
        expect(comp.isSubmitting).toBe(false);
    }));

    it('should trigger onSubmitCreate() when project capture is submitted', () => {
        spyOn(store, 'dispatch').and.callThrough();
        comp.onSubmitCreate(MOCK_PROJECT_CAPTURE_MODEL);
        expect(store.dispatch).toHaveBeenCalledWith(new ProjectActions.Create.Project(
            {project: MOCK_PROJECT_CAPTURE_MODEL, picture: MOCK_PROJECT_CAPTURE_MODEL.picture}
        ));
    });

    it('should trigger onCancelCreate() when project capture is submitted', () => {
        spyOn(router, 'navigate').and.callThrough();
        comp.onCancelCreate();
        expect(router.navigate).toHaveBeenCalledWith([PROJECT_ROUTE_PATHS.projects]);
    });

    it('should map current user to a CSM of new project', () => {
        const {id, firstName, lastName, _embedded, email, phoneNumbers} = TEST_USER_RESOURCE_REGISTERED;
        const expectedParticipant = new ProjectParticipantResource();
        expectedParticipant.user = new ResourceReferenceWithPicture(id, `${firstName} ${lastName}`, _embedded.profilePicture._links.small.href);
        expectedParticipant.email = email;
        expectedParticipant.phoneNumbers = phoneNumbers;

        expect(comp.contacts).toEqual([expectedParticipant]);
    });
});
