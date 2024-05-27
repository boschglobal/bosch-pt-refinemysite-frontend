/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
    TestModuleMetadata
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {
    of,
    ReplaySubject,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_MILESTONE_CRAFT} from '../../../../../test/mocks/milestones';
import {MOCK_RESCHEDULE_RESOURCE} from '../../../../../test/mocks/project-reschedule';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_A} from '../../../../../test/mocks/workareas';
import {AlertTypeEnum} from '../../../../shared/alert/enums/alert-type.enum';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {TransitionStatusEnum} from '../../../../shared/ui/status-transition/status-transition.component';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {
    CalendarViewItem,
    CalendarViewItemsSortHelper,
} from '../../helpers/calendar-view-items-sort.helper';
import {Milestone} from '../../models/milestones/milestone';
import {Reschedule} from '../../models/reschedule/reschedule';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {RescheduleQueries} from '../../store/reschedule/reschedule.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    ProjectRescheduleReviewComponent,
    RESCHEDULE_TRANSLATION_KEYS
} from './project-reschedule-review.component';
import {ProjectRescheduleReviewTestComponent} from './project-reschedule-review.test.component';

describe('Reschedule Review Component', () => {
    let component: ProjectRescheduleReviewComponent;
    let store: Store;
    let fixture: ComponentFixture<ProjectRescheduleReviewTestComponent>;
    let de: DebugElement;

    const dataAutomationMilestonesSummary = '[data-automation="ss-project-reschedule-review-successful-milestones"]';
    const dataAutomationTasksSummary = '[data-automation="ss-project-reschedule-review-successful-tasks"]';
    const dataAutomationProgress = '[data-automation="ss-project-reschedule-review-progress"]';
    const dataAutomationComplete = '[data-automation="ss-project-reschedule-review-complete"]';
    const dataAutomationRescheduleReview = '[data-automation="ss-project-reschedule-review"]';
    const dataAutomationCallout = '[data-automation="ss-project-reschedule-review-callout"]';
    const dataAutomationList = '[data-automation="ss-failed-item-list"]';

    const NUM_SUCCESSFUL_MILESTONES = 14;
    const NUM_SUCCESSFUL_TASKS = 53;

    const NUM_FAILED_MILESTONES = 3;
    const NUM_FAILED_TASKS = 2;

    const workAreas = [MOCK_WORKAREA_A];

    const query = (selector: string): DebugElement => de.query(By.css(selector));

    const rescheduleQueriesMock = mock(RescheduleQueries);
    const workareaQueriesMock = mock(WorkareaQueries);

    const observeRescheduleWithResourcesSubject = new ReplaySubject<Reschedule>(1);
    const observeCurrentItemSubject = new ReplaySubject<RescheduleResource>(1);
    const observeRequestStatusSubject = new ReplaySubject<RequestStatusEnum>(1);

    when(rescheduleQueriesMock.observeRescheduleWithResources()).thenReturn(observeRescheduleWithResourcesSubject);
    when(rescheduleQueriesMock.observeCurrentItem()).thenReturn(observeCurrentItemSubject);
    when(rescheduleQueriesMock.observeRequestStatus()).thenReturn(observeRequestStatusSubject);
    when(workareaQueriesMock.observeWorkareas()).thenReturn(of(workAreas));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectRescheduleReviewComponent,
            ProjectRescheduleReviewTestComponent,
        ],
        providers: [
            {
                provide: RescheduleQueries,
                useValue: instance(rescheduleQueriesMock),
            },
            {
                provide: WorkareaQueries,
                useValue: instance(workareaQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    const completeResult = (
        numTasks = NUM_SUCCESSFUL_TASKS,
        numMilestones = NUM_SUCCESSFUL_MILESTONES) => {
        const rescheduleResource = Object.assign(new RescheduleResource(), MOCK_RESCHEDULE_RESOURCE);
        rescheduleResource.successful.tasks = Array.from({length: numTasks}, () => UUID.v4());
        rescheduleResource.successful.milestones = Array.from({length: numMilestones}, () => UUID.v4());
        return rescheduleResource;
    };

    const withResources = (rescheduleResource: RescheduleResource): Reschedule => {
        const result = new Reschedule();
        result.successful = {
            milestones: rescheduleResource.successful.milestones,
            tasks: rescheduleResource.successful.tasks,
        };
        result.failed = {
            milestones: rescheduleResource.failed.milestones.map(id =>
                Object.assign(new Milestone(), MOCK_MILESTONE_CRAFT, {id})
            ),
            tasks: rescheduleResource.failed.tasks.map(id =>
                Object.assign(new Task(), MOCK_TASK, {id})
            ),
        };
        return result;
    };

    const completeResultWithFailedItems = (
        sucessfulTasks = NUM_SUCCESSFUL_TASKS,
        sucessfulMilestones = NUM_SUCCESSFUL_MILESTONES,
        failedTasks = NUM_FAILED_TASKS,
        failedMilestones = NUM_FAILED_MILESTONES) => {
        const reschedule = completeResult(sucessfulTasks, sucessfulMilestones);
        reschedule.failed = {
            milestones: Array.from({length: failedMilestones}, () => UUID.v4()),
            tasks: Array.from({length: failedTasks}, () => UUID.v4()),
        };
        return reschedule;
    };

    const emitResult = (result: RescheduleResource, emitWithResources = false): void => {
        observeCurrentItemSubject.next(result);
        observeRequestStatusSubject.next(RequestStatusEnum.success);
        if (emitWithResources) {
            observeRescheduleWithResourcesSubject.next(withResources(result));
        }
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule(moduleDef)
            .compileComponents();

        fixture = TestBed.createComponent(ProjectRescheduleReviewTestComponent);
        store = TestBed.inject(Store);
        de = fixture.debugElement;
        fixture.detectChanges();

        component = de.query(By.css(dataAutomationRescheduleReview)).componentInstance;

        component.itemsPerGroupItem = NUM_FAILED_MILESTONES + NUM_FAILED_TASKS;
        component.failedItems = [];
        fixture.detectChanges();
    });

    it('should show the loading spinner and hide the result section while no result is retrieved', () => {
        const progressElement = query(dataAutomationProgress);
        const completeElement = query(dataAutomationComplete);

        expect(progressElement).toBeTruthy();
        expect(completeElement).toBeFalsy();
    });

    it('should hide the loading spinner and show the result when the result is retrieved', () => {
        emitResult(completeResult(), false);
        fixture.detectChanges();

        const progressElement = query(dataAutomationProgress);
        const completeElement = query(dataAutomationComplete);

        expect(progressElement).toBeFalsy();
        expect(completeElement).toBeTruthy();
    });

    it('should set the transition status of the loading spinner to "completed" after the request status changed to "success"', () => {
        emitResult(completeResult(), false);
        fixture.detectChanges();

        expect(component.transitionStatus).toEqual(TransitionStatusEnum.Completed);
    });

    it('should use plural expression in the summary when the number of affected items are zero or more than 1', () => {
        emitResult(completeResult(0, 2), false);
        fixture.detectChanges();

        const milestonesSummary = query(dataAutomationMilestonesSummary);
        const tasksSummary = query(dataAutomationTasksSummary);

        expect(milestonesSummary.nativeElement.textContent.trim()).toEqual(RESCHEDULE_TRANSLATION_KEYS.milestonesSummary);
        expect(tasksSummary.nativeElement.textContent.trim()).toEqual(RESCHEDULE_TRANSLATION_KEYS.tasksSummary);
    });

    it('should use singular expression in the summary when the number of affected items equal 1', () => {
        emitResult(completeResult(1, 1), false);
        fixture.detectChanges();

        const milestonesSummary = query(dataAutomationMilestonesSummary);
        const tasksSummary = query(dataAutomationTasksSummary);

        expect(milestonesSummary.nativeElement.textContent.trim()).toEqual(RESCHEDULE_TRANSLATION_KEYS.milestonesSummarySingular);
        expect(tasksSummary.nativeElement.textContent.trim()).toEqual(RESCHEDULE_TRANSLATION_KEYS.tasksSummarySingular);
    });

    it('should receive the ids of the successful tasks and milestones', () => {
        const result = completeResult();

        emitResult(result, false);
        fixture.detectChanges();

        expect(component.reschedule.successful.tasks.length).toEqual(NUM_SUCCESSFUL_TASKS);
        expect(component.reschedule.successful.milestones.length).toEqual(NUM_SUCCESSFUL_MILESTONES);
    });

    it('should receive the failed tasks and milestones into the failedItems property', () => {
        const result = completeResultWithFailedItems();

        emitResult(result, false);
        fixture.detectChanges();

        expect(component.failedItems[0].items.length)
            .toEqual(NUM_FAILED_MILESTONES + NUM_FAILED_TASKS);
    });

    it('should sort the received failed tasks and milestones using the CalendarViewItemsSortHelper', () => {
        const rescheduleResource: RescheduleResource = completeResultWithFailedItems(0, 0, 1, 1);
        const reschedule: Reschedule = withResources(rescheduleResource);
        const calendarViewItems: CalendarViewItem[] = [
            ...reschedule.failed.milestones.map(item => ({resource: item, type: ObjectTypeEnum.Milestone})),
            ...reschedule.failed.tasks.map(item => ({resource: item, type: ObjectTypeEnum.Task})),
        ];

        spyOn(CalendarViewItemsSortHelper, 'sort').and.callThrough();
        emitResult(rescheduleResource, true);
        fixture.detectChanges();

        expect(CalendarViewItemsSortHelper.sort).toHaveBeenCalledWith(calendarViewItems, workAreas);
    });

    it('should show a success callout if the validation process found no failing items, ' +
        'and the list of failed items should not be shown', () => {
        const result = completeResult();

        emitResult(result, true);
        fixture.detectChanges();

        const callout = query(dataAutomationCallout);

        expect(callout.properties.type).toEqual(AlertTypeEnum.Success);
        expect(callout.properties.message).toEqual(RESCHEDULE_TRANSLATION_KEYS.successMessage);

        expect(query(dataAutomationList)).toBeFalsy();
    });

    it('should show a warning callout if the validation process found failed items, ' +
        'and the list of failed items should be shown', () => {
        const result = completeResultWithFailedItems();

        emitResult(result, true);
        fixture.detectChanges();

        const callout = query(dataAutomationCallout);

        expect(callout.properties.type).toEqual('warning');
        expect(callout.properties.message).toEqual(RESCHEDULE_TRANSLATION_KEYS.warning);

        expect(query(dataAutomationList)).toBeTruthy();
        expect(component.failedItems[0].items.length)
            .toEqual(NUM_FAILED_MILESTONES + NUM_FAILED_TASKS);
    });

    it('should show a warning callout with a message using singular if the validation process found 1 failed item', () => {
        const result = completeResultWithFailedItems(1, 1, 1, 0);

        emitResult(result, true);
        fixture.detectChanges();

        const callout = query(dataAutomationCallout);

        expect(callout.properties.type).toEqual('warning');
        expect(callout.properties.message).toEqual(RESCHEDULE_TRANSLATION_KEYS.warningSingular);
    });

    it('should show the items summary and warning callout when no records are found, ' +
        'and the list of failed items should not be shown', () => {
        const result = completeResult(0, 0);

        emitResult(result, true);
        fixture.detectChanges();

        const callout = query(dataAutomationCallout);

        expect(callout.properties.type).toEqual('warning');
        expect(callout.properties.message).toEqual(RESCHEDULE_TRANSLATION_KEYS.notFound);

        expect(query(dataAutomationList)).toBeFalsy();
    });

    it('should show the skeletons of the failed items until the items with all resources are loaded', () => {
        const result = completeResultWithFailedItems();

        emitResult(result, false);
        fixture.detectChanges();

        for (const failedItem of component.failedItems[0].items) {
            expect(failedItem.resource).toBeNull();
        }

        expect(query(dataAutomationList)).toBeTruthy();
        expect(component.failedItems[0].items.length)
            .toEqual(NUM_FAILED_MILESTONES + NUM_FAILED_TASKS);
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleTaskCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleMilestoneCardClicked(MOCK_MILESTONE_CRAFT);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleMilestoneCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleTaskCardClicked(MOCK_TASK);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
