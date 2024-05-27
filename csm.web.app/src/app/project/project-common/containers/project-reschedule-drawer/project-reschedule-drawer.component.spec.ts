/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_MILESTONE_WORKAREA} from '../../../../../test/mocks/milestones';
import {MOCK_RESCHEDULE_RESOURCE} from '../../../../../test/mocks/project-reschedule';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {DrawerService} from '../../../../shared/ui/drawer/api/drawer.service';
import {DrawerModule} from '../../../../shared/ui/drawer/drawer.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {SaveMilestoneFilters} from '../../api/milestones/resources/save-milestone-filters';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {SaveRescheduleResource} from '../../api/reschedule/resources/save-reschedule.resource';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskFiltersHelper} from '../../helpers/task-filters.helper';
import {Milestone} from '../../models/milestones/milestone';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../../store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {RescheduleActions} from '../../store/reschedule/reschedule.actions';
import {RescheduleQueries} from '../../store/reschedule/reschedule.queries';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {SaveProjectTaskFilters} from '../../store/tasks/slice/save-project-task-filters';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {ProjectFilterFormData} from '../project-filter-capture/project-filter-capture.component';
import {ProjectRescheduleShiftFormData} from '../reschedule-shift-capture/project-reschedule-shift-capture.component';
import {ProjectRescheduleDrawerComponent} from './project-reschedule-drawer.component';

describe('Project Reschedule Drawer Component', () => {
    let comp: ProjectRescheduleDrawerComponent;
    let fixture: ComponentFixture<ProjectRescheduleDrawerComponent>;
    let drawerService: jasmine.SpyObj<DrawerService>;
    let modalService: ModalService;
    let store: jasmine.SpyObj<Store>;
    let de: DebugElement;

    const clickEvent: Event = new Event('click');
    const closeButtonSelector = '[data-automation="project-reschedule-drawer-close-button"]';
    const backButtonSelector = '[data-automation="project-reschedule-drawer-back-button"]';
    const nextButtonSelector = '[data-automation="project-reschedule-drawer-next-button"]';
    const filterStepSelector = '[data-automation="project-reschedule-drawer-filter-step"]';
    const planningStepSelector = '[data-automation="project-reschedule-drawer-planning-step"]';
    const reviewStepSelector = '[data-automation="project-reschedule-drawer-review-step"]';
    const projectFilterCapture = jasmine.createSpyObj('ProjectFilterCaptureComponent', ['getFormValue']);
    const calendarScopeSubject = new Subject<TimeScope>();
    const rescheduleCurrentItemSubject = new Subject<RescheduleResource>();
    const milestonesSubject = new Subject<Milestone[]>();
    const tasksSubject = new Subject<Task[]>();

    const workArea = new ResourceReference('wa-1', 'wa-1');
    const tasks: Task[] = [{...MOCK_TASK, workArea}];
    const milestones: Milestone[] = [{...MOCK_MILESTONE_WORKAREA, workArea}];

    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const milestoneQueriesMock: MilestoneQueries = mock(MilestoneQueries);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const rescheduleQueriesMock: RescheduleQueries = mock(RescheduleQueries);
    const taskFiltersHelperMock: TaskFiltersHelper = mock(TaskFiltersHelper);

    const getElement = <T extends HTMLElement>(selector: string): T => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            DrawerModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectRescheduleDrawerComponent,
        ],
        providers: [
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: DrawerService,
                useValue: jasmine.createSpyObj('DrawerService', ['close']),
            },
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: RescheduleQueries,
                useValue: instance(rescheduleQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TaskFiltersHelper,
                useValue: instance(taskFiltersHelperMock),
            },
        ],
    };

    when(calendarScopeQueriesMock.observeCalendarScope()).thenReturn(calendarScopeSubject);
    when(rescheduleQueriesMock.observeCurrentItem()).thenReturn(rescheduleCurrentItemSubject);
    when(milestoneQueriesMock.observeMilestoneListByMilestoneFilters()).thenReturn(milestonesSubject);
    when(projectTaskQueriesMock.observeCalendarTasks()).thenReturn(tasksSubject);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRescheduleDrawerComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        drawerService = TestBed.inject(DrawerService) as jasmine.SpyObj<DrawerService>;
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        comp.ngOnInit();

        store.dispatch.calls.reset();
        drawerService.close.calls.reset();
    });

    it('should dispatch ProjectCraftActions.Request.All action when the component inits', () => {
        const expectedAction = new ProjectCraftActions.Request.All();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch ProjectParticipantActions.Request.AllActive action when the component inits', () => {
        const expectedAction = new ProjectParticipantActions.Request.AllActive();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch WorkareaActions.Request.All action when the component inits', () => {
        const expectedAction = new WorkareaActions.Request.All();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch RescheduleActions.Initialize.All action when the component is destroyed', () => {
        const expectedAction = new RescheduleActions.Initialize.All();

        comp.ngOnDestroy();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action when the component is destroyed', () => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        comp.ngOnDestroy();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should close the drawer when the close button is clicked', () => {
        fixture.detectChanges();
        getElement(closeButtonSelector).dispatchEvent(clickEvent);

        expect(drawerService.close).toHaveBeenCalled();
    });
    it('should show the filter step when the active step is "filter"', () => {
        comp.activeStep = 'filter';
        fixture.detectChanges();

        expect(getElement(filterStepSelector)).toBeDefined();
        expect(getElement(planningStepSelector)).not.toBeDefined();
        expect(getElement(reviewStepSelector)).not.toBeDefined();
    });

    it('should show the planning step when the active step is "planning"', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();

        expect(getElement(filterStepSelector)).not.toBeDefined();
        expect(getElement(planningStepSelector)).toBeDefined();
        expect(getElement(reviewStepSelector)).not.toBeDefined();
    });

    it('should show the review step when the active step is "review"', () => {
        comp.activeStep = 'review';
        fixture.detectChanges();

        expect(getElement(filterStepSelector)).not.toBeDefined();
        expect(getElement(planningStepSelector)).not.toBeDefined();
        expect(getElement(reviewStepSelector)).toBeDefined();
    });

    it('should not show the back button when the active step is "filter"', () => {
        comp.activeStep = 'filter';
        fixture.detectChanges();

        expect(getElement(backButtonSelector)).not.toBeDefined();
    });

    it('should show the back button when the active step is not "filter"', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();

        expect(getElement(backButtonSelector)).toBeDefined();
    });

    it('should navigate to the "filter" step when the back button is clicked on the "planning" step', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(backButtonSelector).dispatchEvent(clickEvent);

        expect(comp.activeStep).toBe('filter');
    });

    it('should navigate to the "planning" step when the back button is clicked on the "review" step', () => {
        comp.activeStep = 'review';
        fixture.detectChanges();

        getElement(backButtonSelector).dispatchEvent(clickEvent);

        expect(comp.activeStep).toBe('planning');
    });

    it('should disable the next button when the active step is "filter" and the filter form is invalid', () => {
        comp.activeStep = 'filter';
        comp.handleFilterFormValidityChange(false);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeTruthy();
    });

    it('should disable the next button when the active step is "filter", the filter for is valid ' +
        'but milestone and task criteria is disabled', () => {
        comp.activeStep = 'filter';
        comp.milestoneFilters.useCriteria = false;
        comp.projectTaskFilters.useCriteria = false;
        comp.handleFilterFormValidityChange(true);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeTruthy();
    });

    it('should not disabled the next button when the active step is "filter", the filter form is valid' +
        ' and only the task criteria is disabled', () => {
        comp.activeStep = 'filter';
        comp.milestoneFilters.useCriteria = true;
        comp.projectTaskFilters.useCriteria = false;
        comp.handleFilterFormValidityChange(true);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeFalsy();
    });

    it('should not disabled the next button when the active step is "filter", the filter form is valid' +
        ' and only the milestone criteria is disabled', () => {
        comp.activeStep = 'filter';
        comp.milestoneFilters.useCriteria = false;
        comp.projectTaskFilters.useCriteria = true;
        comp.handleFilterFormValidityChange(true);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeFalsy();
    });

    it('should disable the next button when the active step is "planning" and the shift form is invalid', () => {
        comp.activeStep = 'planning';
        comp.handleShiftFormValidityChange(false);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeTruthy();
    });

    it('should not disable the next button when the active step is "planning" and the shift form is valid', () => {
        comp.activeStep = 'planning';
        comp.handleShiftFormValidityChange(true);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeFalsy();
    });

    it('should disabled the next button when the active step is "review" and the validation is being done', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();
        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeTruthy();
    });

    it('should disabled the next button when the active step is "review" and the validation returned no success' +
        ' tasks and milestones', () => {
        const rescheduleWithoutAnySuccess = MOCK_RESCHEDULE_RESOURCE;

        comp.activeStep = 'review';
        rescheduleCurrentItemSubject.next(rescheduleWithoutAnySuccess);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeTruthy();
    });

    it('should not disabled the next button when the active step is "review" and the validation returned ony success tasks', () => {
        const rescheduleWithSuccessfulTasks: RescheduleResource = {
            ...MOCK_RESCHEDULE_RESOURCE,
            successful: {
                tasks: ['foo'],
                milestones: [],
            },
        };

        comp.activeStep = 'review';
        rescheduleCurrentItemSubject.next(rescheduleWithSuccessfulTasks);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeFalsy();
    });

    it('should not disabled the next button when the active step is "review" and the validation returned ony success milestones', () => {
        const rescheduleWithSuccessfulTasks: RescheduleResource = {
            ...MOCK_RESCHEDULE_RESOURCE,
            successful: {
                tasks: [],
                milestones: ['foo'],
            },
        };

        comp.activeStep = 'review';
        rescheduleCurrentItemSubject.next(rescheduleWithSuccessfulTasks);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(nextButtonSelector).disabled).toBeFalsy();
    });

    it('should navigate the the "planning" step when the next button is clicked on the "filter" step', () => {
        comp.activeStep = 'filter';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(comp.activeStep).toBe('planning');
    });

    it('should navigate the the "review" step when the next button is clicked on the "planning" step', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(comp.activeStep).toBe('review');
    });

    it('should dispatch the RescheduleActions.Validate.One action with the right payload when the next button is clicked on the ' +
        '"planning" step and the task criteria doesn\'t have status criteria selected', () => {
        const milestoneFilters = new MilestoneFilters();
        const taskFilters = new ProjectTaskFilters();
        const processedTaskFilters = Object.assign(new ProjectTaskFilters(), {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(),
                {status: [TaskStatusEnum.DRAFT, TaskStatusEnum.OPEN, TaskStatusEnum.STARTED]}),
        });
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 1, unit: 'days'};
        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays: 1,
            criteria: {
                milestones: SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters),
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(processedTaskFilters),
            },
            useMilestoneCriteria: true,
            useTaskCriteria: true,
        };
        const expectedAction = new RescheduleActions.Validate.One(saveRescheduleResource);

        comp.projectTaskFilters = taskFilters;
        comp.milestoneFilters = milestoneFilters;
        comp.shiftFormData = shiftFormData;
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch the RescheduleActions.Validate.One action with the right payload when the next button is clicked on the ' +
        '"planning" step and the task criteria have status criteria selected', () => {
        const milestoneFilters = new MilestoneFilters();
        const taskFilters = Object.assign(new ProjectTaskFilters(), {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(),
                {status: [TaskStatusEnum.STARTED]}),
        });
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 1, unit: 'days'};
        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays: 1,
            criteria: {
                milestones: SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters),
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(taskFilters),
            },
            useMilestoneCriteria: true,
            useTaskCriteria: true,
        };
        const expectedAction = new RescheduleActions.Validate.One(saveRescheduleResource);

        comp.projectTaskFilters = taskFilters;
        comp.milestoneFilters = milestoneFilters;
        comp.activeStep = 'planning';
        comp.shiftFormData = shiftFormData;
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch the RescheduleActions.Validate.One action with the right payload when the next button is clicked on the ' +
        '"planning" step and the shift unit is set to "weeks"', () => {
        const milestoneFilters = new MilestoneFilters();
        const taskFilters = Object.assign(new ProjectTaskFilters(), {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(),
                {status: [TaskStatusEnum.STARTED]}),
        });
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 2, unit: 'weeks'};
        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays: 14,
            criteria: {
                milestones: SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters),
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(taskFilters),
            },
            useMilestoneCriteria: true,
            useTaskCriteria: true,
        };
        const expectedAction = new RescheduleActions.Validate.One(saveRescheduleResource);

        comp.projectTaskFilters = taskFilters;
        comp.milestoneFilters = milestoneFilters;
        comp.shiftFormData = shiftFormData;
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch the RescheduleActions.Validate.One action with the right payload when the next button is clicked on the ' +
        '"planning" step and the shift unit is set to "days"', () => {
        const milestoneFilters = new MilestoneFilters();
        const taskFilters = Object.assign(new ProjectTaskFilters(), {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(),
                {status: [TaskStatusEnum.STARTED]}),
        });
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 10, unit: 'days'};
        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays: 10,
            criteria: {
                milestones: SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters),
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(taskFilters),
            },
            useMilestoneCriteria: true,
            useTaskCriteria: true,
        };
        const expectedAction = new RescheduleActions.Validate.One(saveRescheduleResource);

        comp.projectTaskFilters = taskFilters;
        comp.milestoneFilters = milestoneFilters;
        comp.shiftFormData = shiftFormData;
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should open the confirmation modal when the next button is clicked on the "review" step', () => {
        spyOn(modalService, 'open').and.callThrough();

        comp.activeStep = 'review';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should dispatch the RescheduleActions.Reschedule.One action when the modal confirmCallback is called', () => {
        const milestoneFilterCriteria = new MilestoneFiltersCriteria();
        const taskFilterCriteria = Object.assign(new ProjectTaskFiltersCriteria(), {status: [TaskStatusEnum.STARTED]});
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 1, unit: 'days'};
        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays: 1,
            criteria: {
                milestones: SaveMilestoneFilters.fromMilestoneFilters(new MilestoneFilters(milestoneFilterCriteria)),
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(new ProjectTaskFilters(taskFilterCriteria)),
            },
            useMilestoneCriteria: true,
            useTaskCriteria: true,
        };
        const expectedAction = new RescheduleActions.Reschedule.One(saveRescheduleResource);

        spyOn(modalService, 'open').and.callThrough();

        comp.projectTaskFilters = new ProjectTaskFilters(taskFilterCriteria);
        comp.milestoneFilters = new MilestoneFilters(milestoneFilterCriteria);
        comp.shiftFormData = shiftFormData;
        comp.activeStep = 'planning';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);
        getElement(nextButtonSelector).dispatchEvent(clickEvent);
        modalService.currentModalData.confirmCallback();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should close the drawer when the modal completeCallback is called', () => {
        spyOn(modalService, 'open').and.callThrough();
        spyOn(modalService, 'close').and.callThrough();

        comp.activeStep = 'review';
        fixture.detectChanges();

        getElement(nextButtonSelector).dispatchEvent(clickEvent);
        modalService.currentModalData.completeCallback();

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should show "Generic_Reschedule" on the next button when te active step is "review"', () => {
        comp.activeStep = 'review';
        fixture.detectChanges();

        expect(getElement(nextButtonSelector).textContent.trim()).toBe('Generic_Reschedule');
    });

    it('should show "Generic_Next" on the next button when te active step is not "review"', () => {
        comp.activeStep = 'planning';
        fixture.detectChanges();

        expect(getElement(nextButtonSelector).textContent.trim()).toBe('Generic_Next');
    });

    it('should set the initial time scope filters with the current calendar scope', () => {
        const from = moment().add('6', 'week');
        const to = moment().add('12', 'week');
        const timeScope: TimeScope = {
            start: from,
            end: to,
        };
        const expectedTaskFilters = Object.assign(new ProjectTaskFilters(),
            {criteria: Object.assign(new ProjectTaskFiltersCriteria(), {from, to})},
        );
        const expectedMilestoneFilters = Object.assign(new MilestoneFilters(),
            {criteria: Object.assign(new MilestoneFiltersCriteria(), {from, to})});

        calendarScopeSubject.next(timeScope);

        expect(comp.projectTaskFilters).toEqual(expectedTaskFilters);
        expect(comp.milestoneFilters).toEqual(expectedMilestoneFilters);
        expect(comp.wholeProjectDuration).toBe(false);
    });

    it('should dispatch the CalendarScopeActions.Set.Start action only when the "from" form value changed', () => {
        const from = moment().add('1', 'week');
        const projectFilterFormData: ProjectFilterFormData = {
            task: Object.assign(new ProjectTaskFilters(),
                {criteria: Object.assign(new ProjectTaskFiltersCriteria(), {from})},
            ),
            milestone: Object.assign(new MilestoneFilters(),
                {criteria: Object.assign(new MilestoneFiltersCriteria(), {from})}),
            wholeProjectDuration: false,
        };
        const expectedAction = new CalendarScopeActions.Set.Start(from);

        comp.handleFilterValueChange(projectFilterFormData);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

        store.dispatch.calls.reset();

        comp.handleFilterValueChange(projectFilterFormData);

        expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
    });

    it('should set the time scope filter with the previously selected values when the filter form value changed' +
        ' with wholeProjectDuration to false and previously it was set to true', fakeAsync(() => {
        const from = moment().add('1', 'week');
        const to = moment().add('7', 'week');
        const initialProjectFilterFormData: ProjectFilterFormData = {
            task: Object.assign(new ProjectTaskFilters(),
                {criteria: Object.assign(new ProjectTaskFiltersCriteria(), {from, to})},
            ),
            milestone: Object.assign(new MilestoneFilters(),
                {criteria: Object.assign(new MilestoneFiltersCriteria(), {from, to})}),
            wholeProjectDuration: false,
        };
        const midProjectFilterFormData: ProjectFilterFormData = {
            task: new ProjectTaskFilters(),
            milestone: new MilestoneFilters(),
            wholeProjectDuration: true,
        };
        const lastProjectFilterFormData: ProjectFilterFormData = {
            task: new ProjectTaskFilters(),
            milestone: new MilestoneFilters(),
            wholeProjectDuration: false,
        };

        fixture.detectChanges();
        comp.projectTaskFilters = new ProjectTaskFilters();
        comp.milestoneFilters = new MilestoneFilters();
        comp.projectFilterCapture = projectFilterCapture;

        projectFilterCapture.getFormValue.and.returnValue(initialProjectFilterFormData);
        comp.filterFormValuesChangedSubject.next();
        tick(1);

        expect(comp.projectTaskFilters.criteria.from).toEqual(from);
        expect(comp.projectTaskFilters.criteria.to).toEqual(to);
        expect(comp.milestoneFilters.criteria.from).toEqual(from);
        expect(comp.milestoneFilters.criteria.to).toEqual(to);

        projectFilterCapture.getFormValue.and.returnValue(midProjectFilterFormData);
        comp.filterFormValuesChangedSubject.next();
        tick(1);

        expect(comp.projectTaskFilters.criteria.from).toBeNull();
        expect(comp.projectTaskFilters.criteria.to).toBeNull();
        expect(comp.milestoneFilters.criteria.from).toBeNull();
        expect(comp.milestoneFilters.criteria.to).toBeNull();

        projectFilterCapture.getFormValue.and.returnValue(lastProjectFilterFormData);
        comp.filterFormValuesChangedSubject.next();
        tick(1);

        expect(comp.projectTaskFilters.criteria.from).toEqual(from);
        expect(comp.projectTaskFilters.criteria.to).toEqual(to);
        expect(comp.milestoneFilters.criteria.from).toEqual(from);
        expect(comp.milestoneFilters.criteria.to).toEqual(to);
    }));

    it('should dispatch the CalendarSelectionActions.Set.Selection actions with the tasks and milestones affected by the filters' +
        ' when the list of milestones changed', fakeAsync(() => {
        const projectFilterFormData: ProjectFilterFormData = {
            task: new ProjectTaskFilters(),
            milestone: new MilestoneFilters(),
            wholeProjectDuration: false,
        };
        const items = [
            ...tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)),
            ...milestones.map(milestone => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)),
        ];
        const context = CalendarSelectionContextEnum.Reschedule;
        const expectedAction = new CalendarSelectionActions.Set.Selection(true, context, items);

        when(taskFiltersHelperMock.matchTask(anything(), anything())).thenReturn(true);

        tasksSubject.next(tasks);
        comp.handleFilterValueChange(projectFilterFormData);

        store.dispatch.calls.reset();
        milestonesSubject.next(milestones);
        tick(1);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    }));

    it('should dispatch the CalendarSelectionActions.Set.Selection actions with the tasks and milestones affected by the filters' +
        ' when the list of tasks changed', fakeAsync(() => {
        const projectFilterFormData: ProjectFilterFormData = {
            task: new ProjectTaskFilters(),
            milestone: new MilestoneFilters(),
            wholeProjectDuration: false,
        };
        const items = [
            ...tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)),
            ...milestones.map(milestone => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)),
        ];
        const context = CalendarSelectionContextEnum.Reschedule;
        const expectedAction = new CalendarSelectionActions.Set.Selection(true, context, items);

        when(taskFiltersHelperMock.matchTask(anything(), anything())).thenReturn(true);

        milestonesSubject.next(milestones);
        comp.handleFilterValueChange(projectFilterFormData);

        store.dispatch.calls.reset();
        tasksSubject.next(tasks);
        tick(1);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    }));

    it('should dispatch the CalendarSelectionActions.Set.Selection actions with the tasks and milestones affected by the filters' +
        ' when the filter value changed', fakeAsync(() => {
        const projectFilterFormData: ProjectFilterFormData = {
            task: Object.assign(new ProjectTaskFilters(), {useCriteria: false}),
            milestone: Object.assign(new MilestoneFilters(), {useCriteria: false}),
            wholeProjectDuration: false,
        };
        const context = CalendarSelectionContextEnum.Reschedule;
        const expectedAction = new CalendarSelectionActions.Set.Selection(true, context, []);

        tasksSubject.next(tasks);
        milestonesSubject.next(milestones);

        store.dispatch.calls.reset();
        comp.handleFilterValueChange(projectFilterFormData);
        tick(1);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    }));

    it('should set the shiftFormData when the shift form value changes', () => {
        const shiftFormData: ProjectRescheduleShiftFormData = {amount: 17, unit: 'weeks'};

        comp.handleShiftFormValueChange(shiftFormData);

        expect(comp.shiftFormData).toBe(shiftFormData);
    });

    it('should change the filter value when milestone chips changed', () => {
        const from = moment().add(2, 'weeks');
        const chipsCriteria = Object.assign(new MilestoneFiltersCriteria(), {from});
        const expectedMilestoneFilters = Object.assign(new MilestoneFilters(), {
            criteria: Object.assign(new MilestoneFiltersCriteria(), {from}),
        });

        comp.handleMilestoneChipsChange(chipsCriteria);

        expect(comp.milestoneFilters).toEqual(expectedMilestoneFilters);
    });

    it('should change the filter value when task chips changed', () => {
        const from = moment().add(2, 'weeks');
        const chipsCriteria = Object.assign(new ProjectTaskFiltersCriteria(), {from});
        const expectedTaskFilters = Object.assign(new ProjectTaskFilters(), {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(), {from}),
        });

        comp.handleTaskChipsChange(chipsCriteria);

        expect(comp.projectTaskFilters).toEqual(expectedTaskFilters);
    });
});
