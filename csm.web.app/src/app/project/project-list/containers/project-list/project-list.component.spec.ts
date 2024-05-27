/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {
    BehaviorSubject,
    of
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ProjectResource} from '../../../project-common/api/projects/resources/project.resource';
import {ProjectActions} from '../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../project-common/store/projects/project-slice.service';
import {ProjectListComponent} from './project-list.component';

describe('Project List Component', () => {
    let fixture: ComponentFixture<ProjectListComponent>;
    let comp: ProjectListComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<any>;
    let router: Router;

    const PROJECT_LIST: ProjectResource[] = [MOCK_PROJECT_1, MOCK_PROJECT_2];

    const dataAutomationUserNotActivatedNoItems = '[data-automation="no-items-not-activated"]';
    const dataAutomationUserActivatedWithCreation = '[data-automation="no-items-activated-with-creation"]';
    const dataAutomationUserActivatedWithNoCreation = '[data-automation="no-items-activated-no-creation"]';
    const dataAutomatioLoaderSelector = '[data-automation="project-list-loader"]';
    const dataAutomationContactUsSelector = '[data-automation="no-items-contact-us"]';
    const dataAutomationProjectsUnavailableSelector = '[data-automation="project-list-unavailable"]';

    const getElement = (element: string): Element => el.querySelector(element);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const requestStatusSubject = new BehaviorSubject(RequestStatusEnum.success);

    const activatedUserBehaviourSubject = new BehaviorSubject(true);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectListComponent,
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectListComponent);
        store = TestBed.inject(Store);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        router = TestBed.inject(Router);

        requestStatusSubject.next(RequestStatusEnum.success);

        when(projectSliceServiceMock.observeProjectList()).thenReturn(of(PROJECT_LIST));
        when(projectSliceServiceMock.observeProjectListRequestStatus()).thenReturn(requestStatusSubject);
        when(projectSliceServiceMock.observeCreateProjectPermission()).thenReturn(of(true));
        when(projectSliceServiceMock.observeUserIsActivated()).thenReturn(activatedUserBehaviourSubject);

        fixture.detectChanges();
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should return the correct identified for a given item', () => {
        const expectedResult = MOCK_PROJECT_1.id;
        const result = comp.trackByFn(1, MOCK_PROJECT_1);
        expect(result).toEqual(expectedResult);
    });

    it('should navigate to correct create project url', () => {
        spyOn(router, 'navigateByUrl');

        const expectedResult = '/projects/create';
        comp.navigateToCreate();

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedResult);
    });

    it('should not show any "no items" component if list is being loaded', () => {
        comp.projectList = [];
        comp.isLoading = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationUserNotActivatedNoItems)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithCreation)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithNoCreation)).toBeNull();
        expect(getElement(dataAutomationProjectsUnavailableSelector)).toBeNull();
    });

    it('should not show any "no items" component if unavailable', () => {
        comp.projectList = [];
        comp.isUnavailable = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationUserNotActivatedNoItems)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithCreation)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithNoCreation)).toBeNull();
    });

    it('should show "user pending activation" if the user is not activated', () => {
        comp.isUserActivated = false;
        comp.isLoading = false;
        comp.projectList = [];
        fixture.detectChanges();

        expect(getElement(dataAutomationUserNotActivatedNoItems)).not.toBeNull();
        expect(getElement(dataAutomationUserActivatedWithCreation)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithNoCreation)).toBeNull();
    });

    it('should show "project creation" no items if the user is activated and has permission', () => {
        comp.isUserActivated = true;
        comp.isLoading = false;
        comp.projectList = [];
        comp.hasCreatePermission = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationUserActivatedWithCreation)).not.toBeNull();
        expect(getElement(dataAutomationUserActivatedWithNoCreation)).toBeNull();
        expect(getElement(dataAutomationUserNotActivatedNoItems)).toBeNull();
    });

    it('should show "activation completed" no items if user is activated but has no create permission', () => {
        comp.isUserActivated = true;
        comp.isLoading = false;
        comp.projectList = [];
        comp.hasCreatePermission = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationUserActivatedWithNoCreation)).not.toBeNull();
        expect(getElement(dataAutomationUserNotActivatedNoItems)).toBeNull();
        expect(getElement(dataAutomationUserActivatedWithCreation)).toBeNull();
    });

    it('should show contact us if there are no project', () => {
        comp.projectList = [];
        comp.isLoading = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationContactUsSelector)).not.toBeNull();
    });

    it('should not show contact us if there are project', () => {
        comp.isLoading = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationContactUsSelector)).toBeNull();
    });

    it('should show loader when list is being loaded', () => {
        comp.projectList = [];
        comp.isLoading = true;
        fixture.detectChanges();

        expect(getElement(dataAutomatioLoaderSelector)).not.toBeNull();
    });

    it('should not show loader when list is being loaded but already has items', () => {
        comp.projectList = [MOCK_PROJECT_1];
        comp.isLoading = true;
        fixture.detectChanges();

        expect(getElement(dataAutomatioLoaderSelector)).toBeNull();
    });

    it('should render projects unavailable feedback when request ends with error', () => {
        comp.projectList = [];
        comp.isLoading = false;
        comp.isUnavailable = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationProjectsUnavailableSelector)).toBeTruthy();
    });

    it('should not render activities unavailable feedback when request ends with success', () => {
        fixture.detectChanges();

        expect(getElement(dataAutomationProjectsUnavailableSelector)).toBeFalsy();
    });

    it('should update user is activated when there is a change', () => {
        expect(comp.isUserActivated).toBeTruthy();

        activatedUserBehaviourSubject.next(false);
        expect(comp.isUserActivated).toBeFalsy();
    });

    it('should fetch a projects list when handleRetry is called', () => {
        spyOn(store, 'dispatch').and.callThrough();

        comp.handleRetry();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectActions.Request.Projects());
    });

    it('should retry fetch a projects list when it fails up to 3 times', (done) => {
        const spy = spyOn(store, 'dispatch').and.callThrough();

        requestStatusSubject.next(RequestStatusEnum.error);
        expect(comp.isUnavailable).toBeFalsy();
        requestStatusSubject.next(RequestStatusEnum.error);
        expect(comp.isUnavailable).toBeFalsy();
        requestStatusSubject.next(RequestStatusEnum.error);
        expect(comp.isUnavailable).toBeFalsy();
        requestStatusSubject.next(RequestStatusEnum.error);
        expect(comp.isUnavailable).toBeTruthy();
        requestStatusSubject.next(RequestStatusEnum.error);

        setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(3);
            expect(spy).toHaveBeenCalledWith(new ProjectActions.Request.Projects());
            done();
        }, 10000);
    }, 15000);
});
