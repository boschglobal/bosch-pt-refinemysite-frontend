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
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    JOB_MOCK_1,
    JOB_MOCK_2
} from '../../../../../test/mocks/jobs';
import {MockStore} from '../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {BREAKPOINTS_RANGE} from '../../../ui/constants/breakpoints.constant';
import {FlyoutDirective} from '../../../ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../ui/flyout/service/flyout.service';
import {JobResource} from '../../api/resources/job.resource';
import {JobActions} from '../../store/job.actions';
import {JobQueries} from '../../store/job.queries';
import {
    JOB_LIST_BUTTON_ANIMATED_STATE,
    JobListButtonComponent
} from './job-list-button.component';

declare const viewport: any;

describe('Job List Button Component', () => {
    let component: JobListButtonComponent;
    let fixture: ComponentFixture<JobListButtonComponent>;
    let debugElement: DebugElement;
    let flyoutService: FlyoutService;
    let store: Store<State>;

    const jobQueriesMock: JobQueries = mock(JobQueries);

    const jobsSubject = new Subject<JobResource[]>();
    const jobListRequestStatusSubject = new Subject<RequestStatusEnum>();
    const hasJobsRunningSubject = new Subject<boolean>();
    const jobListHasUpdatesSubject = new Subject<boolean>();

    const dataAutomationJobListButtonSelector = '[data-automation="job-list-button"]';
    const dataAutomationJobListCloseButtonSelector = '[data-automation="job-list-button-list-close-button"]';
    const dataAutomationJobListButtonIconRefreshSelector = '[data-automation="job-list-button-refresh-icon"]';
    const dataAutomationJobListButtonIconRefreshStrongSelector = '[data-automation="job-list-button-refresh-strong-icon"]';

    const clickEvent: Event = new Event('click');
    const getElement = (selector: string): HTMLElement => debugElement.query(By.css(selector))?.nativeElement;
    const getDocumentElement = (selector: string): HTMLElement => document.querySelector(selector);
    const openJobListFlyout = () => getElement(dataAutomationJobListButtonSelector).dispatchEvent(clickEvent);

    const jobResourceList = [JOB_MOCK_1, JOB_MOCK_2];

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            NoopAnimationsModule,
            TranslateModule,
        ],
        providers: [
            {
                provide: JobQueries,
                useValue: instance(jobQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            FlyoutDirective,
            JobListButtonComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobListButtonComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        when(jobQueriesMock.observeJobs()).thenReturn(jobsSubject);
        when(jobQueriesMock.observeJobListRequestStatus()).thenReturn(jobListRequestStatusSubject);
        when(jobQueriesMock.observeHasJobsRunning()).thenReturn(hasJobsRunningSubject);
        when(jobQueriesMock.observeJobListHasUpdates()).thenReturn(jobListHasUpdatesSubject);

        fixture.detectChanges();

        flyoutService = TestBed.inject(FlyoutService);
        store = TestBed.inject(Store);
    });

    afterEach(() => viewport.reset());

    it('should dispatch JobActions.Request.All on ngOnInit', () => {
        const expectedAction = new JobActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch JobActions.Request.All upon flyout open events if the id is the same id has the job card list flyout id', () => {
        const expectedAction = new JobActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(flyoutService, 'isFlyoutOpen').and.returnValue(true);

        flyoutService.openEvents.next('foo');
        flyoutService.openEvents.next(component.jobCardListFlyoutId);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch JobActions.Set.JobAsRead action on handleJobCardClick function call', () => {
        const cardId = 'foo';
        const expectedAction = new JobActions.Set.JobAsRead(cardId);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleJobCardClick(cardId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set jobs with the correct jobs', () => {
        const expectedResult = jobResourceList;

        jobsSubject.next(jobResourceList);

        expect(component.jobs).toEqual(expectedResult);
    });

    it('should handle job card list loading state', () => {
        jobListRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isJobCardListLoading).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isJobCardListLoading).toBeTruthy();

        jobListRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isJobCardListLoading).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isJobCardListLoading).toBeFalsy();
    });

    it('should handle jobServiceUnavailable accordingly to the job card list request status and job card list', () => {
        jobsSubject.next(jobResourceList);

        jobListRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobsSubject.next([]);

        jobListRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.jobServiceUnavailable).toBeFalsy();

        jobListRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.jobServiceUnavailable).toBeTruthy();
    });

    it('should handle buttonStyle based on the current running jobs states', () => {
        hasJobsRunningSubject.next(true);
        expect(component.buttonStyle).toBe('tertiary-light-blue');

        hasJobsRunningSubject.next(false);
        expect(component.buttonStyle).toBe('tertiary-grey');
    });

    it('should display the correct job list button icon based on the hasJobsRunning', fakeAsync(() => {
        hasJobsRunningSubject.next(false);
        tick(0);
        expect(getElement(dataAutomationJobListButtonIconRefreshSelector)).toBeDefined();
        expect(getElement(dataAutomationJobListButtonIconRefreshStrongSelector)).not.toBeDefined();

        hasJobsRunningSubject.next(true);
        tick(0);
        expect(getElement(dataAutomationJobListButtonIconRefreshSelector)).not.toBeDefined();
        expect(getElement(dataAutomationJobListButtonIconRefreshStrongSelector)).toBeDefined();
    }));

    it('should handle hasJobNews accordingly to the current job list updates not seen', () => {
        jobListHasUpdatesSubject.next(true);
        expect(component.hasJobNews).toBeTruthy();

        jobListHasUpdatesSubject.next(false);
        expect(component.hasJobNews).toBeFalsy();
    });

    it('should show close button of job list when in XS screens', () => {
        const expectedDisplayValue = 'flex';

        openJobListFlyout();

        const buttonElement = getDocumentElement(dataAutomationJobListCloseButtonSelector);

        viewport.set(BREAKPOINTS_RANGE.xs.max);
        expect(getComputedStyle(buttonElement).display).toBe(expectedDisplayValue);
    });

    it('should not show close button of job list when in screens different then XS', () => {
        const expectedDisplayValue = 'none';

        openJobListFlyout();

        const buttonElement = getDocumentElement(dataAutomationJobListCloseButtonSelector);

        viewport.set(BREAKPOINTS_RANGE.sm.min);
        expect(getComputedStyle(buttonElement).display).toBe(expectedDisplayValue);

        viewport.set(BREAKPOINTS_RANGE.md.min);
        expect(getComputedStyle(buttonElement).display).toBe(expectedDisplayValue);

        viewport.set(BREAKPOINTS_RANGE.lg.min);
        expect(getComputedStyle(buttonElement).display).toBe(expectedDisplayValue);

        viewport.set(BREAKPOINTS_RANGE.xl.min);
        expect(getComputedStyle(buttonElement).display).toBe(expectedDisplayValue);
    });

    it('should close job list flyout when clicking on the job list close button', () => {
        spyOn(flyoutService, 'close');

        openJobListFlyout();

        viewport.set(BREAKPOINTS_RANGE.xs.max);

        getDocumentElement(dataAutomationJobListCloseButtonSelector).dispatchEvent(clickEvent);

        expect(flyoutService.close).toHaveBeenCalledWith(component.jobCardListFlyoutId);
    });

    it('should set buttonAnimationState to undefined before ngOnInit and animated state after ngOnInit', () => {
        fixture = TestBed.createComponent(JobListButtonComponent);
        component = fixture.componentInstance;

        expect(component.buttonAnimationState).toBeUndefined();

        component.ngOnInit();

        expect(component.buttonAnimationState).toEqual(JOB_LIST_BUTTON_ANIMATED_STATE);
    });
});
