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
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {TranslationModule} from '../../../../shared/translation/translation.module';
import {
    DRAWER_DATA,
    DrawerService,
} from '../../../../shared/ui/drawer/api/drawer.service';
import {DrawerModule} from '../../../../shared/ui/drawer/drawer.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {
    ProjectFilterFormData,
    ProjectFiltersCaptureContextEnum,
} from '../project-filter-capture/project-filter-capture.component';
import {ProjectFilterDrawerComponent} from './project-filter-drawer.component';

describe('Project Filter Drawer Component', () => {
    let component: ProjectFilterDrawerComponent;
    let fixture: ComponentFixture<ProjectFilterDrawerComponent>;
    let de: DebugElement;
    let drawerService: jasmine.SpyObj<DrawerService>;
    let store: jasmine.SpyObj<Store>;

    const clickEvent = new Event('click');
    const projectFilterCapture = jasmine.createSpyObj('ProjectFilterCaptureComponent', ['getFormValue']);

    const mockProjectTaskQueries: ProjectTaskQueries = mock(ProjectTaskQueries);
    const mockMilestoneQueries: MilestoneQueries = mock(MilestoneQueries);

    const projectTaskListFiltersObservable = new Subject<ProjectTaskFilters>();
    const projectTaskCalendarFiltersObservable = new Subject<ProjectTaskFilters>();
    const milestoneFiltersObservable = new Subject<MilestoneFilters>();

    const dataAutomationTasksFilterDrawerCloseSelector = '[data-automation="project-filter-drawer-close"]';
    const dataAutomationTasksFilterDrawerSubmitSelector = '[data-automation="project-filter-drawer-submit"]';
    const dataAutomationTasksFilterDrawerResetSelector = '[data-automation="project-filter-drawer-reset"]';
    const dataAutomationTasksFilterDrawerHighlightSelector = '[data-automation="project-filter-drawer-highlight"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            DrawerModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectFilterDrawerComponent,
        ],
        providers: [
            {
                provide: DRAWER_DATA,
                useValue: ProjectFiltersCaptureContextEnum.TaskList,
            },
            {
                provide: DrawerService,
                useValue: jasmine.createSpyObj('DrawerService', ['close']),
            },
            {
                provide: MilestoneQueries,
                useValue: instance(mockMilestoneQueries),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(mockProjectTaskQueries),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    when(mockProjectTaskQueries.observeTaskListFilters()).thenReturn(projectTaskListFiltersObservable);
    when(mockProjectTaskQueries.observeCalendarFilters()).thenReturn(projectTaskCalendarFiltersObservable);
    when(mockMilestoneQueries.observeFilters()).thenReturn(milestoneFiltersObservable);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectFilterDrawerComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        drawerService = TestBed.inject(DrawerService) as jasmine.SpyObj<DrawerService>;

        projectTaskListFiltersObservable.next(new ProjectTaskFilters());
        projectTaskCalendarFiltersObservable.next(new ProjectTaskFilters());
        milestoneFiltersObservable.next(new MilestoneFilters());

        store.dispatch.calls.reset();
        projectFilterCapture.getFormValue.calls.reset();

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.ngOnInit();
        fixture.detectChanges();

        component.projectFilterCapture = projectFilterCapture;
    });

    it('should dispatch action to request crafts on ngOnInit', () => {
        const expectedAction = new ProjectCraftActions.Request.All();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch action to request participants on ngOnInit', () => {
        const expectedAction = new ProjectParticipantActions.Request.AllActive();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch action to request workAreas on ngOnInit', () => {
        const expectedAction = new WorkareaActions.Request.All();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call close function when close button is clicked', () => {
        getElement(dataAutomationTasksFilterDrawerCloseSelector).dispatchEvent(clickEvent);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should reset projectTaskFilters when the reset button is clicked', () => {
        const expectedFilters = new ProjectTaskFilters();
        const currentFilters = new ProjectTaskFilters();

        currentFilters.criteria.from = moment();
        currentFilters.criteria.to = moment();
        currentFilters.highlight = true;

        component.projectTaskFilters = currentFilters;

        getElement(dataAutomationTasksFilterDrawerResetSelector).dispatchEvent(clickEvent);

        expect(component.projectTaskFilters).toEqual(expectedFilters);
    });

    it('should reset milestoneFilters when the reset button is clicked', () => {
        const expectedFilters = new MilestoneFilters();
        const currentFilters = new MilestoneFilters();

        currentFilters.criteria.from = moment();
        currentFilters.criteria.to = moment();
        currentFilters.highlight = true;

        component.milestoneFilters = currentFilters;

        getElement(dataAutomationTasksFilterDrawerResetSelector).dispatchEvent(clickEvent);

        expect(component.milestoneFilters).toEqual(expectedFilters);
    });

    it('should reset the form when reset button is clicked', () => {
        component.form.controls.highlight.setValue(true);

        getElement(dataAutomationTasksFilterDrawerResetSelector).dispatchEvent(clickEvent);

        expect(component.form.value.highlight).toBe(false);
    });

    it('should disable the submit button when form is invalid', () => {
        component.handleFormValidityChange(false);

        fixture.detectChanges();

        expect(getElement(dataAutomationTasksFilterDrawerSubmitSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not disable the submit button when form is valid', () => {
        component.handleFormValidityChange(true);

        fixture.detectChanges();

        expect(getElement(dataAutomationTasksFilterDrawerSubmitSelector).attributes['disabled']).toBeFalsy();
    });

    it(`should not show highlight form when context is ${ProjectFiltersCaptureContextEnum.TaskList}`, () => {
        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationTasksFilterDrawerHighlightSelector)).toBeFalsy();
    });

    it(`should show highlight form when context is ${ProjectFiltersCaptureContextEnum.Calendar}`, () => {
        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationTasksFilterDrawerHighlightSelector)).toBeTruthy();
    });

    it('should set projectTaskFilters when observeTaskListFilters emits and context is '
        + ProjectFiltersCaptureContextEnum.TaskList, () => {
        const expectedFilters = new ProjectTaskFilters();

        expectedFilters.criteria.from = moment();
        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.ngOnInit();
        projectTaskListFiltersObservable.next(expectedFilters);

        expect(component.projectTaskFilters).toEqual(expectedFilters);
    });

    it('should set projectTaskFilters when observeCalendarFilters emits and context is '
        + ProjectFiltersCaptureContextEnum.Calendar, () => {
        const expectedFilters = new ProjectTaskFilters();

        expectedFilters.criteria.to = moment();
        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();
        projectTaskCalendarFiltersObservable.next(expectedFilters);

        expect(component.projectTaskFilters).toEqual(expectedFilters);
    });

    it('should set milestoneFilters when observeFilters emits and context is ' + ProjectFiltersCaptureContextEnum.Calendar, () => {
        const expectedFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();

        expectedFilters.criteria.to = moment();
        milestoneFiltersObservable.next(expectedFilters);

        expect(component.milestoneFilters).toEqual(expectedFilters);
    });

    it('should not set milestoneFilters when context is ' + ProjectFiltersCaptureContextEnum.TaskList, () => {
        const unexpectedFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.ngOnInit();

        unexpectedFilters.criteria.to = moment();
        milestoneFiltersObservable.next(unexpectedFilters);

        expect(component.milestoneFilters).not.toEqual(unexpectedFilters);
    });

    it('should not set highlight form value when context is ' + ProjectFiltersCaptureContextEnum.TaskList, () => {
        const taskFilters = new ProjectTaskFilters();
        const milestoneFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.ngOnInit();

        taskFilters.highlight = true;
        milestoneFilters.highlight = false;

        projectTaskListFiltersObservable.next(taskFilters);
        milestoneFiltersObservable.next(milestoneFilters);

        expect(component.form.value.highlight).toBe(false);
    });

    it('should set the highlight form value to TRUE when task filters are highlighted and milestone filters are not', () => {
        const taskFilters = new ProjectTaskFilters();
        const milestoneFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();

        taskFilters.highlight = true;
        milestoneFilters.highlight = false;

        projectTaskCalendarFiltersObservable.next(taskFilters);
        milestoneFiltersObservable.next(milestoneFilters);

        expect(component.form.value.highlight).toBe(true);
    });

    it('should set the highlight form value to TRUE when milestone filters are highlighted and task filters are not', () => {
        const taskFilters = new ProjectTaskFilters();
        const milestoneFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();

        taskFilters.highlight = false;
        milestoneFilters.highlight = true;

        projectTaskCalendarFiltersObservable.next(taskFilters);
        milestoneFiltersObservable.next(milestoneFilters);

        expect(component.form.value.highlight).toBe(true);
    });

    it('should set the highlight form value to TRUE when milestone filters and task filters are highlighted', () => {
        const taskFilters = new ProjectTaskFilters();
        const milestoneFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();

        taskFilters.highlight = true;
        milestoneFilters.highlight = true;

        projectTaskCalendarFiltersObservable.next(taskFilters);
        milestoneFiltersObservable.next(milestoneFilters);

        expect(component.form.value.highlight).toBe(true);
    });

    it('should set the highlight form value to FALSE when milestone filters and task filters are not highlighted', () => {
        const taskFilters = new ProjectTaskFilters();
        const milestoneFilters = new MilestoneFilters();

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.ngOnInit();

        taskFilters.highlight = false;
        milestoneFilters.highlight = false;

        projectTaskCalendarFiltersObservable.next(taskFilters);
        milestoneFiltersObservable.next(milestoneFilters);

        expect(component.form.value.highlight).toBe(false);
    });

    it('should dispatch MilestoneActions.Set.Filters when handleClearFilters is called', () => {
        const expectedPayload = Object.assign(new MilestoneFilters());

        component.context = ProjectFiltersCaptureContextEnum.Calendar;

        component.handleClearFilters();

        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Set.Filters(expectedPayload));
    });

    it('should not dispatch MilestoneActions.Set.Filters when handleClearFilters is called when the context is ' +
        ProjectFiltersCaptureContextEnum.TaskList, () => {
        const expectedPayload = Object.assign(new MilestoneFilters());

        component.context = ProjectFiltersCaptureContextEnum.TaskList;

        component.handleClearFilters();

        expect(store.dispatch).not.toHaveBeenCalledWith(new MilestoneActions.Set.Filters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.Filters when handleClearFilters is called and context is ' +
        ProjectFiltersCaptureContextEnum.TaskList, () => {
        const expectedPayload = Object.assign(new ProjectTaskFilters());

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.handleClearFilters();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.Filters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.Filters when handleClearFilters is called and context is ' +
        ProjectFiltersCaptureContextEnum.Calendar, () => {
        const expectedPayload = Object.assign(new ProjectTaskFilters());

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.handleClearFilters();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.CalendarFilters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.Filters when handleTaskFiltersChanged is called and context is ' +
        ProjectFiltersCaptureContextEnum.TaskList, () => {
        const criteria = Object.assign(new ProjectTaskFiltersCriteria(), {workAreaIds: ['foo']});
        const expectedPayload = Object.assign(new ProjectTaskFilters(), {criteria});

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        component.handleTaskFiltersChanged(criteria);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.Filters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.CalendarFilters when handleTaskFiltersChanged is called and context is ' +
        ProjectFiltersCaptureContextEnum.Calendar, () => {
        const criteria = Object.assign(new ProjectTaskFiltersCriteria(), {workAreaIds: ['foo']});
        const expectedPayload = Object.assign(new ProjectTaskFilters(), {criteria});

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        component.handleTaskFiltersChanged(criteria);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.CalendarFilters(expectedPayload));
    });

    it('should dispatch MilestoneActions.Set.Filters when handleMilestoneFiltersChanged is called', () => {
        const criteria = Object.assign(new MilestoneFiltersCriteria(), {workAreaIds: ['foo']});
        const expectedPayload = Object.assign(new MilestoneFilters(), {criteria});

        component.handleMilestoneFiltersChanged(criteria);

        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Set.Filters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.Filters when submit button is clicked and context is ' +
        ProjectFiltersCaptureContextEnum.TaskList, () => {
        const expectedPayload = new ProjectTaskFilters();
        const tasksFilterFormData: ProjectFilterFormData = {
            task: expectedPayload,
        };

        projectFilterCapture.getFormValue.and.returnValue(tasksFilterFormData);

        component.context = ProjectFiltersCaptureContextEnum.TaskList;
        getElement(dataAutomationTasksFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.Filters(expectedPayload));
    });

    it('should dispatch ProjectTaskActions.Set.CalendarFilters when submit button is clicked and context is ' +
        ProjectFiltersCaptureContextEnum.Calendar, () => {
        const expectedPayload = new ProjectTaskFilters();
        const tasksFilterFormData: ProjectFilterFormData = {
            task: expectedPayload,
        };

        projectFilterCapture.getFormValue.and.returnValue(tasksFilterFormData);

        component.context = ProjectFiltersCaptureContextEnum.Calendar;
        getElement(dataAutomationTasksFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.CalendarFilters(expectedPayload));
    });

    it('should dispatch MilestoneActions.Set.Filters when submit button is clicked and capture has milestone criteria', () => {
        const expectedPayload = new MilestoneFilters();
        const tasksFilterFormData: ProjectFilterFormData = {
            task: new ProjectTaskFilters(),
            milestone: expectedPayload,
        };

        projectFilterCapture.getFormValue.and.returnValue(tasksFilterFormData);

        getElement(dataAutomationTasksFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Set.Filters(expectedPayload));
    });
});
