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
import {TranslateModule} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_PARTICIPANT} from '../../../../../test/mocks/participants';
import {
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS,
} from '../../../../../test/mocks/quick-filters';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {State} from '../../../../app.reducers';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectFiltersCriteriaResource} from '../../api/misc/resources/project-filters-criteria.resource';
import {
    QuickFilter,
    QuickFilterId,
} from '../../models/quick-filters/quick-filter';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {
    ParticipantByCompany,
    ProjectParticipantQueries,
} from '../../store/participants/project-participant.queries';
import {QuickFilterActions} from '../../store/quick-filters/quick-filter.actions';
import {QuickFilterQueries} from '../../store/quick-filters/quick-filter.queries';
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria,
} from '../../store/tasks/slice/project-task-filters-criteria';
import {
    DefaultQuickFilter,
    DELETE_QUICK_FILTER_ITEM_ID,
    QuickFilterListComponent,
    UPDATE_QUICK_FILTER_ITEM_ID,
} from './quick-filter-list.component';
import {QuickFilterListTestComponent} from './quick-filter-list.test.component';

describe('Quick Filter List Component', () => {
    let testHostComp: QuickFilterListTestComponent;
    let fixture: ComponentFixture<QuickFilterListTestComponent>;
    let comp: QuickFilterListComponent;
    let de: DebugElement;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: jasmine.SpyObj<Store<State>>;

    const mockCurrentUser = TEST_USER_RESOURCE_REGISTERED;
    const mockParticipantsByCompany: ParticipantByCompany[] = [
        {
            ...MOCK_PARTICIPANT.company,
            participants: [
                {
                    ...MOCK_PARTICIPANT,
                    user: {
                        ...MOCK_PARTICIPANT.user,
                        id: mockCurrentUser.id,
                    },
                },
            ],
        },
    ];

    const mockQuickFilterList: QuickFilter[] = [
        QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_RESOURCE),
    ];
    const mockQuickFilterListWithoutPermissions: QuickFilter[] = [
        QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS),
    ];

    const projectParticipantQueriesMock: ProjectParticipantQueries = mock(ProjectParticipantQueries);
    const quickFilterQueriesMock: QuickFilterQueries = mock(QuickFilterQueries);
    const userQueriesMock: UserQueries = mock(UserQueries);

    const participantsByCompaniesSubject = new BehaviorSubject<ParticipantByCompany[]>([]);
    const currentUserSubject = new BehaviorSubject<UserResource>(null);
    const quickFilterListSubject = new BehaviorSubject<QuickFilter[]>([]);
    const quickFilterListCreatePermissionSubject = new BehaviorSubject<boolean>(true);

    const clickEvent = new Event('click');
    const quickFiltersOptionsSelector = '[data-automation^="quick-filter-list-option-"]';
    const quickFiltersCreateButtonSelector = '[data-automation="quick-filter-list-create-button"]';
    const quickFilterListHostSelector = 'ss-quick-filter-list';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;
    const getElements = (selector: string): DebugElement[] => de.queryAll(By.css(selector));
    const getElementsInnerText = (selector: string): string[] => getElements(selector).map(element => element?.nativeElement.innerText);
    const getDropdownItem = (quickFilterId: QuickFilterId, itemId: string): MenuItem<QuickFilter> => {
        const dropdownOption = comp.userQuickFiltersOptions.find(({option}) => option.value === quickFilterId);

        return flatten(dropdownOption?.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            ReactiveFormsModule,
            TranslateModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            QuickFilterListComponent,
            QuickFilterListTestComponent,
        ],
        providers: [
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
            },
            {
                provide: ProjectParticipantQueries,
                useFactory: () => instance(projectParticipantQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: QuickFilterQueries,
                useFactory: () => instance(quickFilterQueriesMock),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
        ],
    };

    when(projectParticipantQueriesMock.observeActiveParticipantsByCompanies()).thenReturn(participantsByCompaniesSubject);
    when(userQueriesMock.observeCurrentUser()).thenReturn(currentUserSubject);
    when(quickFilterQueriesMock.observeQuickFilterList()).thenReturn(quickFilterListSubject);
    when(quickFilterQueriesMock.observeQuickFilterListCreatePermission()).thenReturn(quickFilterListCreatePermissionSubject);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuickFilterListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(quickFilterListHostSelector));
        comp = de.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

        testHostComp.appliedFilterId = null;

        fixture.detectChanges();

        store.dispatch.calls.reset();
        modalService.open.calls.reset();
    });

    afterEach(() => {
        comp.ngOnDestroy();
    });

    it('should request participants on component init', () => {
        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectParticipantActions.Request.AllActive());
    });

    it('should request the user quick filters on component init', () => {
        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(new QuickFilterActions.Request.All());
    });

    it('should show the list of default quick filter when the component receives the current user and the list of participants', () => {
        const expectedDefaultQuickFiltersNames = ['Generic_AllTasks', 'Generic_MyCompanyLabel', 'Generic_MyTasks'];

        comp.defaultQuickFiltersOptions = [];

        currentUserSubject.next(mockCurrentUser);

        expect(getElementsInnerText(quickFiltersOptionsSelector)).toEqual([]);

        participantsByCompaniesSubject.next(mockParticipantsByCompany);

        expect(getElementsInnerText(quickFiltersOptionsSelector)).toEqual(expectedDefaultQuickFiltersNames);
    });

    it('should show the list of quick filters from the user when the component receives the list of quick filters', () => {
        const expectedDefaultQuickFiltersNames = ['Generic_AllTasks', 'Generic_MyCompanyLabel', 'Generic_MyTasks'];
        const expectedAllQuickFiltersNames = [
            ...expectedDefaultQuickFiltersNames,
            ...mockQuickFilterList.map(taskQuickFilter => taskQuickFilter.name),
        ];

        expect(getElementsInnerText(quickFiltersOptionsSelector)).toEqual(expectedDefaultQuickFiltersNames);

        quickFilterListSubject.next(mockQuickFilterList);

        expect(getElementsInnerText(quickFiltersOptionsSelector)).toEqual(expectedAllQuickFiltersNames);
    });

    it('should not show the "Add new filter" button when the user can\'t create quick filters', () => {
        quickFilterListCreatePermissionSubject.next(false);

        expect(getElement(quickFiltersCreateButtonSelector)).toBeFalsy();
    });

    it('should show the "Add new filter" button when the user can create quick filters', () => {
        quickFilterListCreatePermissionSubject.next(true);

        expect(getElement(quickFiltersCreateButtonSelector)).toBeTruthy();
    });

    it('should apply the selected quick filter when appliedFilterId change', () => {
        const quickFilterId: QuickFilterId = 'my-tasks';

        expect(comp.form.controls.quickFilter.value).not.toBe(quickFilterId);

        testHostComp.appliedFilterId = quickFilterId;
        fixture.detectChanges();

        expect(comp.form.controls.quickFilter.value).toBe(quickFilterId);
    });

    it('should not show the option to delete a quick filter when the user has no permissions to do it', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterListWithoutPermissions[0].id;

        quickFilterListSubject.next(mockQuickFilterListWithoutPermissions);

        expect(getDropdownItem(quickFilterId, DELETE_QUICK_FILTER_ITEM_ID)).toBeFalsy();
    });

    it('should show the option to delete a quick filter when the user has permissions to do it', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterList[0].id;

        quickFilterListSubject.next(mockQuickFilterList);

        expect(getDropdownItem(quickFilterId, DELETE_QUICK_FILTER_ITEM_ID)).toBeTruthy();
    });

    it('should not show the option to update a quick filter when the user has no permissions to do it', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterListWithoutPermissions[0].id;

        quickFilterListSubject.next(mockQuickFilterListWithoutPermissions);

        expect(getDropdownItem(quickFilterId, UPDATE_QUICK_FILTER_ITEM_ID)).toBeFalsy();
    });

    it('should show the option to update a quick filter when the user has permissions to do it', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterList[0].id;

        quickFilterListSubject.next(mockQuickFilterList);

        expect(getDropdownItem(quickFilterId, UPDATE_QUICK_FILTER_ITEM_ID)).toBeTruthy();
    });

    it('should emit create event when create button is clicked', () => {
        spyOn(comp.create, 'emit');

        getElement(quickFiltersCreateButtonSelector).dispatchEvent(clickEvent);

        expect(comp.create.emit).toHaveBeenCalled();
    });

    it('should not emit apply event when an invalid quick filter id is provided', () => {
        const quickFilterId: QuickFilterId = '123123';

        spyOn(comp.apply, 'emit');

        comp.form.controls.quickFilter.setValue(quickFilterId);

        expect(comp.apply.emit).not.toHaveBeenCalled();
    });

    it('should not emit apply event when an already applied quick filter id is provided', () => {
        const quickFilterId: QuickFilterId = 'my-tasks';

        spyOn(comp.apply, 'emit');

        testHostComp.appliedFilterId = quickFilterId;
        fixture.detectChanges();

        comp.form.controls.quickFilter.setValue(quickFilterId);

        expect(comp.apply.emit).not.toHaveBeenCalled();
    });

    it('should emit apply event with the correct payload when the "All tasks" quick filter is selected', () => {
        const quickFilterId: QuickFilterId = 'all';
        const expectedPayload: DefaultQuickFilter = {
            id: quickFilterId,
            name: 'Generic_AllTasks',
            criteria: new ProjectFiltersCriteriaResource(),
            useMilestoneCriteria: true,
            useTaskCriteria: true,
            highlight: false,
        };

        spyOn(comp.apply, 'emit');

        comp.form.controls.quickFilter.setValue(quickFilterId);

        expect(comp.apply.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit apply event with the correct payload when the "My company" quick filter is selected', () => {
        const quickFilterId: QuickFilterId = 'my-company';
        const companyId = MOCK_PARTICIPANT.company.id;
        const expectedPayload: DefaultQuickFilter = {
            id: quickFilterId,
            name: 'Generic_MyCompanyLabel',
            criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                    assignees: new ProjectTaskFiltersAssignees([], [companyId]),
                }),
            }),
            useMilestoneCriteria: true,
            useTaskCriteria: true,
            highlight: false,
        };

        spyOn(comp.apply, 'emit');

        comp.form.controls.quickFilter.setValue(quickFilterId);

        expect(comp.apply.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit apply event with the correct payload when the "My tasks" quick filter is selected', () => {
        const quickFilterId: QuickFilterId = 'my-tasks';
        const participantId = MOCK_PARTICIPANT.id;
        const expectedPayload: DefaultQuickFilter = {
            id: quickFilterId,
            name: 'Generic_MyTasks',
            criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                    assignees: new ProjectTaskFiltersAssignees([participantId], []),
                }),
            }),
            useMilestoneCriteria: true,
            useTaskCriteria: true,
            highlight: false,
        };

        spyOn(comp.apply, 'emit');

        comp.form.controls.quickFilter.setValue(quickFilterId);

        expect(comp.apply.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit apply event when a user quick filter is selected', () => {
        const expectedQuickFilter: QuickFilter = mockQuickFilterList[0];

        spyOn(comp.apply, 'emit');

        comp.form.controls.quickFilter.setValue(expectedQuickFilter.id);

        expect(comp.apply.emit).toHaveBeenCalledWith(expectedQuickFilter);
    });

    it('should emit edit event when handleDropdownItemClicked is called with update option', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterList[0].id;
        const dropdownItem = getDropdownItem(quickFilterId, UPDATE_QUICK_FILTER_ITEM_ID);

        spyOn(comp.edit, 'emit');

        comp.handleDropdownItemClicked(dropdownItem);

        expect(comp.edit.emit).toHaveBeenCalledWith(quickFilterId);
    });

    it('should open the delete modal handleDropdownItemClicked is called with delete option', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterList[0].id;
        const dropdownItem = getDropdownItem(quickFilterId, DELETE_QUICK_FILTER_ITEM_ID);

        comp.handleDropdownItemClicked(dropdownItem);

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should dispatch QuickFilterActions.Delete.One action when confirmCallback is called for a delete option', () => {
        const {id, version} = mockQuickFilterList[0];
        const dropdownItem = getDropdownItem(id, DELETE_QUICK_FILTER_ITEM_ID);

        modalService.open.and.callFake(params => params.data.confirmCallback());

        comp.handleDropdownItemClicked(dropdownItem);

        expect(store.dispatch).toHaveBeenCalledWith(new QuickFilterActions.Delete.One(id, version));
    });

    it('should dispatch QuickFilterActions.Delete.OneReset action when cancelCallback is called for a delete option', () => {
        const quickFilterId: QuickFilterId = mockQuickFilterList[0].id;
        const dropdownItem = getDropdownItem(quickFilterId, DELETE_QUICK_FILTER_ITEM_ID);

        modalService.open.and.callFake(params => params.data.cancelCallback());

        comp.handleDropdownItemClicked(dropdownItem);

        expect(store.dispatch).toHaveBeenCalledWith(new QuickFilterActions.Delete.OneReset());
    });
});
