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
import {
    of,
    Subject,
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_QUICK_FILTER_WITH_DATE_CRITERIA} from '../../../../../test/mocks/quick-filters';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {
    DRAWER_DATA,
    DrawerService,
} from '../../../../shared/ui/drawer/api/drawer.service';
import {DrawerModule} from '../../../../shared/ui/drawer/drawer.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {SaveQuickFilterResource} from '../../api/quick-filters/resources/save-quick-filter.resource';
import {
    QuickFilter,
    QuickFilterId,
} from '../../models/quick-filters/quick-filter';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {QuickFilterActions} from '../../store/quick-filters/quick-filter.actions';
import {QuickFilterQueries} from '../../store/quick-filters/quick-filter.queries';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {QuickFilterCaptureFormData} from '../quick-filter-capture/quick-filter-capture.component';
import {
    DEFAULT_FILTERS,
    QuickFilterDrawerComponent,
} from './quick-filter-drawer.component';

describe('Quick Filter Drawer Component', () => {
    let comp: QuickFilterDrawerComponent;
    let fixture: ComponentFixture<QuickFilterDrawerComponent>;
    let de: DebugElement;
    let drawerService: jasmine.SpyObj<DrawerService>;
    let breakpointHelper: jasmine.SpyObj<BreakpointHelper>;
    let store: jasmine.SpyObj<Store<State>>;

    const quickFilterQueriesMock: QuickFilterQueries = mock(QuickFilterQueries);
    const milestoneQueriesMock: MilestoneQueries = mock(MilestoneQueries);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);

    const appliedFilterObservable = new Subject<QuickFilterId>();
    const quickFilterRequestStatusObservable = new Subject<RequestStatusEnum>();
    const projectTaskListFiltersObservable = new Subject<ProjectTaskFilters>();
    const projectTaskCalendarFiltersObservable = new Subject<ProjectTaskFilters>();
    const milestoneFiltersObservable = new Subject<MilestoneFilters>();

    const notEmptyTaskFilters = Object.assign(new ProjectTaskFilters(), {useCriteria: false});
    const notEmptyMilestoneFilters = Object.assign(new MilestoneFilters(), {useCriteria: false});
    const mockQuickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
    const quickFilterCapture = jasmine.createSpyObj('QuickFilterCaptureComponent', ['getFormValue']);
    const quickFilterCaptureFormData: QuickFilterCaptureFormData = {
        name: 'Foo',
        projectFilter: {
            task: notEmptyTaskFilters,
            milestone: notEmptyMilestoneFilters,
        },
    };

    const clickEvent = new Event('click');
    const quickFilterDrawerCloseSelector = '[data-automation="quick-filter-drawer-close"]';
    const quickFilterDrawerBackSelector = '[data-automation="quick-filter-drawer-back"]';
    const quickFilterDrawerCancelSelector = '[data-automation="quick-filter-drawer-cancel"]';
    const quickFilterDrawerTitleSelector = '[data-automation="quick-filter-drawer-title"]';
    const quickFilterDrawerSubmitSelector = '[data-automation="quick-filter-drawer-submit"]';
    const quickFilterDrawerHighlightSelector = '[data-automation="quick-filter-drawer-highlight"]';

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
            QuickFilterDrawerComponent,
        ],
        providers: [
            {
                provide: DRAWER_DATA,
                useValue: 'calendar',
            },
            {
                provide: BreakpointHelper,
                useValue: jasmine.createSpyObj('BreakpointHelper', ['currentBreakpoint']),
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
                provide: QuickFilterQueries,
                useValue: instance(quickFilterQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    when(quickFilterQueriesMock.observeCurrentQuickFilterRequestStatus()).thenReturn(quickFilterRequestStatusObservable);
    when(quickFilterQueriesMock.observeAppliedFilterByContext(anything())).thenReturn(appliedFilterObservable);
    when(quickFilterQueriesMock.observeQuickFilterById(anything())).thenReturn(of(mockQuickFilter));
    when(projectTaskQueriesMock.observeTaskListFilters()).thenReturn(projectTaskListFiltersObservable);
    when(projectTaskQueriesMock.observeCalendarFilters()).thenReturn(projectTaskCalendarFiltersObservable);
    when(milestoneQueriesMock.observeFilters()).thenReturn(milestoneFiltersObservable);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuickFilterDrawerComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        breakpointHelper = TestBed.inject(BreakpointHelper) as jasmine.SpyObj<BreakpointHelper>;
        drawerService = TestBed.inject(DrawerService) as jasmine.SpyObj<DrawerService>;
        comp.context = 'calendar';

        breakpointHelper.currentBreakpoint.and.returnValue('xl');
        drawerService.close.calls.reset();
        store.dispatch.calls.reset();
        quickFilterCapture.getFormValue.calls.reset();

        comp.ngOnInit();
        comp.quickFilterCapture = quickFilterCapture;
    });

    it('should close the drawer when the close button is clicked', () => {
        fixture.detectChanges();
        getElement(quickFilterDrawerCloseSelector).dispatchEvent(clickEvent);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should dispatch ProjectTaskActions.Set.Filters and new QuickFilterActions.Set.AppliedFilter actions ' +
        'when handleApplyQuickFilter is called and the context is "list"', () => {
        const {id, useTaskCriteria, highlight, criteria: {tasks}} = mockQuickFilter;
        const taskFilters = Object.assign<ProjectTaskFilters, Partial<ProjectTaskFilters>>(new ProjectTaskFilters(), {
            highlight,
            criteria: tasks,
            useCriteria: useTaskCriteria,
        });

        comp.context = 'list';
        comp.handleApplyQuickFilter(mockQuickFilter);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.Filters(taskFilters));
        expect(store.dispatch).toHaveBeenCalledWith(new QuickFilterActions.Set.AppliedFilter(id, 'list'));
    });

    it('should dispatch ProjectTaskActions.Set.CalendarFilters, new MilestoneActions.Set.Filters and ' +
        'new QuickFilterActions.Set.AppliedFilter actions when handleApplyQuickFilter is called and the context is "calendar"', () => {
        const {id, useMilestoneCriteria, useTaskCriteria, highlight, criteria: {tasks, milestones}} = mockQuickFilter;
        const taskFilters = Object.assign<ProjectTaskFilters, Partial<ProjectTaskFilters>>(new ProjectTaskFilters(), {
            highlight,
            criteria: tasks,
            useCriteria: useTaskCriteria,
        });
        const milestoneFilters = Object.assign<MilestoneFilters, Partial<MilestoneFilters>>(new MilestoneFilters(), {
            highlight,
            criteria: milestones,
            useCriteria: useMilestoneCriteria,
        });

        comp.handleApplyQuickFilter(mockQuickFilter);

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.CalendarFilters(taskFilters));
        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Set.Filters(milestoneFilters));
        expect(store.dispatch).toHaveBeenCalledWith(new QuickFilterActions.Set.AppliedFilter(id, 'calendar'));
    });

    it('should close the drawer when handleApplyQuickFilter is called and the current screen is of xs size', () => {
        breakpointHelper.currentBreakpoint.and.returnValue('xs');

        comp.handleApplyQuickFilter(mockQuickFilter);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should not close the drawer when handleApplyQuickFilter is called and the current screen is not of xs size', () => {
        breakpointHelper.currentBreakpoint.and.returnValue('xl');

        comp.handleApplyQuickFilter(mockQuickFilter);

        expect(drawerService.close).not.toHaveBeenCalled();
    });

    it('should set the active panel to "list" when handleCloseCapture is called', () => {
        comp.activePanel = 'create';

        comp.handleCloseCapture();

        expect(comp.activePanel).toBe('list');
    });

    it('should reset the quickFilterCaptureFormData and the highlight values when handleCloseCapture is called', () => {
        const expectedQuickFilter: QuickFilterCaptureFormData = {
            name: null,
            projectFilter: DEFAULT_FILTERS,
        };

        comp.form.controls.highlight.setValue(true);
        comp.quickFilterCaptureFormData.name = 'foo';

        comp.handleCloseCapture();

        expect(comp.quickFilterCaptureFormData).toEqual(expectedQuickFilter);
        expect(comp.form.value.highlight).toBeFalsy();
    });

    it('should call the handleCloseCapture when the back button is clicked', () => {
        spyOn(comp, 'handleCloseCapture').and.callThrough();

        comp.activePanel = 'create';
        fixture.detectChanges();

        getElement(quickFilterDrawerBackSelector).dispatchEvent(clickEvent);

        expect(comp.handleCloseCapture).toHaveBeenCalled();
    });

    it('should call the handleCloseCapture when the button is clicked', () => {
        spyOn(comp, 'handleCloseCapture').and.callThrough();

        comp.activePanel = 'create';
        fixture.detectChanges();

        getElement(quickFilterDrawerCancelSelector).dispatchEvent(clickEvent);

        expect(comp.handleCloseCapture).toHaveBeenCalled();
    });

    it('should set the active panel to "create" when handleCreate is called', () => {
        comp.activePanel = 'list';

        comp.handleCreate();

        expect(comp.activePanel).toBe('create');
    });

    it('should set the quickFilterCaptureFormData with the current applied filters when the handleCreate is called ' +
        'and there\'s no quick filter applied', () => {
        const expectedQuickFilterCaptureFormData: QuickFilterCaptureFormData = {
            name: null,
            projectFilter: {
                task: notEmptyTaskFilters,
                milestone: notEmptyMilestoneFilters,
            },
        };

        projectTaskCalendarFiltersObservable.next(notEmptyTaskFilters);
        milestoneFiltersObservable.next(notEmptyMilestoneFilters);

        comp.handleCreate();

        expect(comp.quickFilterCaptureFormData).toEqual(expectedQuickFilterCaptureFormData);
    });

    it('should set the highlight form value to true when the handleCreate is called, there\'s no quick filter applied ' +
        'and only the task filters are highlighted', () => {
        const highlightedTaskFilters = Object.assign(new ProjectTaskFilters(), {highlight: true});
        const nonHighlightedMilestoneFilters = Object.assign(new MilestoneFilters(), {highlight: false});

        projectTaskCalendarFiltersObservable.next(highlightedTaskFilters);
        milestoneFiltersObservable.next(nonHighlightedMilestoneFilters);

        comp.handleCreate();

        expect(comp.form.value.highlight).toBeTruthy();
    });

    it('should set the highlight form value to true when the handleCreate is called, there\'s no quick filter applied ' +
        'and only the milestone filters are highlighted', () => {
        const nonHighlightedTaskFilters = Object.assign(new ProjectTaskFilters(), {highlight: false});
        const highlightedMilestoneFilters = Object.assign(new MilestoneFilters(), {highlight: true});

        projectTaskCalendarFiltersObservable.next(nonHighlightedTaskFilters);
        milestoneFiltersObservable.next(highlightedMilestoneFilters);

        comp.handleCreate();

        expect(comp.form.value.highlight).toBeTruthy();
    });

    it('should set the highlight form value to false when the handleCreate is called, there\'s no quick filter applied ' +
        'and both task and milestone filters are not highlighted', () => {
        const nonHighlightedTaskFilters = Object.assign(new ProjectTaskFilters(), {highlight: false});
        const nonHighlightedMilestoneFilters = Object.assign(new MilestoneFilters(), {highlight: false});

        projectTaskCalendarFiltersObservable.next(nonHighlightedTaskFilters);
        milestoneFiltersObservable.next(nonHighlightedMilestoneFilters);

        comp.handleCreate();

        expect(comp.form.value.highlight).toBeFalsy();
    });

    it('should set the active panel to "edit" when handleEdit is called', () => {
        comp.activePanel = 'create';

        comp.handleEdit('foo');

        expect(comp.activePanel).toBe('edit');
    });

    it('should set the quickFilterCaptureFormData with the filter to edit when handleEdit is called', () => {
        const {id, name, useMilestoneCriteria, useTaskCriteria, highlight, criteria: {tasks, milestones}} = mockQuickFilter;
        const taskFilters = Object.assign<ProjectTaskFilters, Partial<ProjectTaskFilters>>(new ProjectTaskFilters(), {
            highlight,
            criteria: tasks,
            useCriteria: useTaskCriteria,
        });
        const milestoneFilters = Object.assign<MilestoneFilters, Partial<MilestoneFilters>>(new MilestoneFilters(), {
            highlight,
            criteria: milestones,
            useCriteria: useMilestoneCriteria,
        });
        const expectedQuickFilterCaptureFormData: QuickFilterCaptureFormData = {
            name,
            projectFilter: {
                task: taskFilters,
                milestone: milestoneFilters,
            },
        };

        comp.handleEdit(id);

        expect(comp.quickFilterCaptureFormData).toEqual(expectedQuickFilterCaptureFormData);
    });

    it('should set the highlight form value when handleEdit is called', () => {
        const {id, highlight} = mockQuickFilter;

        comp.form.controls.highlight.setValue(!highlight);
        comp.handleEdit(id);

        expect(comp.form.value.highlight).toBe(highlight);
    });

    it('should show the Generic_AddNewFilter label in the drawer title when the create panel is active', () => {
        comp.activePanel = 'create';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerTitleSelector).innerText).toBe('Generic_AddNewFilter');
    });

    it('should show the QuickFilter_Update_Label label in the drawer title when the edit panel is active', () => {
        comp.activePanel = 'edit';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerTitleSelector).innerText).toBe('QuickFilter_Update_Label');
    });

    it('should disable the submit button when form is invalid', () => {
        comp.activePanel = 'create';
        comp.handleFormValidityChange(false);
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerSubmitSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not disable the submit button when form is valid', () => {
        comp.activePanel = 'create';
        comp.handleFormValidityChange(true);
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerSubmitSelector).attributes['disabled']).toBeFalsy();
    });

    it('should show the Generic_Create label in the submit button when the create panel is active', () => {
        comp.activePanel = 'create';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerSubmitSelector).innerText).toBe('Generic_Create');
    });

    it('should show the Generic_Save label in the submit button when the edit panel is active', () => {
        comp.activePanel = 'edit';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerSubmitSelector).innerText).toBe('Generic_Save');
    });

    it('should call the handleCloseCapture when the quick filter is successfully created', () => {
        spyOn(comp, 'handleCloseCapture').and.callThrough();

        comp.activePanel = 'create';
        quickFilterRequestStatusObservable.next(RequestStatusEnum.success);

        expect(comp.handleCloseCapture).toHaveBeenCalled();
    });

    it('should call the handleCloseCapture when the quick filter is successfully updated', () => {
        spyOn(comp, 'handleCloseCapture').and.callThrough();

        comp.activePanel = 'edit';
        quickFilterRequestStatusObservable.next(RequestStatusEnum.success);

        expect(comp.handleCloseCapture).toHaveBeenCalled();
    });

    it('should set isLoading to true when request status is in progress', () => {
        comp.activePanel = 'edit';
        quickFilterRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(comp.isLoading).toBe(true);
    });

    it('should set isLoading to false when request status is not in progress', () => {
        comp.activePanel = 'edit';
        quickFilterRequestStatusObservable.next(RequestStatusEnum.success);

        expect(comp.isLoading).toBe(false);
    });

    it('should dispatch the QuickFilterActions.Create.One action when the submit button is clicked ' +
        'and the create panel is active and highlight is false', () => {
        const {name, projectFilter: {task, milestone}} = quickFilterCaptureFormData;
        const saveQuickFilterResource = SaveQuickFilterResource.fromFormData(name, task, milestone, false);
        const expectedAction = new QuickFilterActions.Create.One(saveQuickFilterResource, comp.context);

        comp.activePanel = 'create';
        fixture.detectChanges();
        comp.quickFilterCapture = quickFilterCapture;
        comp.form.controls.highlight.setValue(false);

        quickFilterCapture.getFormValue.and.returnValue(quickFilterCaptureFormData);

        getElement(quickFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch the QuickFilterActions.Create.One action when the submit button is clicked ' +
        'and the create panel is active, and highlight is true', () => {
        const {name, projectFilter: {task, milestone}} = quickFilterCaptureFormData;
        const saveQuickFilterResource = SaveQuickFilterResource.fromFormData(name, task, milestone, true);
        const expectedAction = new QuickFilterActions.Create.One(saveQuickFilterResource, comp.context);

        comp.activePanel = 'create';
        fixture.detectChanges();
        comp.quickFilterCapture = quickFilterCapture;
        comp.form.controls.highlight.setValue(true);

        quickFilterCapture.getFormValue.and.returnValue(quickFilterCaptureFormData);

        getElement(quickFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch the QuickFilterActions.Update.One action when the form is submitted and the edit panel is active', () => {
        const {id, version} = mockQuickFilter;
        const {name, projectFilter: {task, milestone}} = quickFilterCaptureFormData;
        const saveQuickFilterResource = SaveQuickFilterResource.fromFormData(name, task, milestone, true);
        const expectedAction = new QuickFilterActions.Update.One(id, saveQuickFilterResource, version);

        comp.handleEdit(id);
        fixture.detectChanges();
        comp.quickFilterCapture = quickFilterCapture;
        comp.form.controls.highlight.setValue(true);

        quickFilterCapture.getFormValue.and.returnValue(quickFilterCaptureFormData);

        getElement(quickFilterDrawerSubmitSelector).dispatchEvent(clickEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not show highlight form if drawer mode is "list"', () => {
        comp.context = 'list';
        comp.activePanel = 'create';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerHighlightSelector)).toBeFalsy();
    });

    it('should show highlight form if drawer mode is "calendar"', () => {
        comp.context = 'calendar';
        comp.activePanel = 'create';
        fixture.detectChanges();

        expect(getElement(quickFilterDrawerHighlightSelector)).toBeTruthy();
    });

    it('should set the appliedFilterId when the observeAppliedFilterByContext emits', () => {
        const myCompanyId: QuickFilterId = 'my-company';
        const myTasksId: QuickFilterId = 'my-tasks';

        appliedFilterObservable.next(myCompanyId);

        expect(comp.appliedFilterId).toBe(myCompanyId);

        appliedFilterObservable.next(myTasksId);

        expect(comp.appliedFilterId).toBe(myTasksId);
    });
});
