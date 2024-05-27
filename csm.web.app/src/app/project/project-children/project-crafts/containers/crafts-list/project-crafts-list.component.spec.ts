/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {
    BehaviorSubject,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C,
} from '../../../../../../test/mocks/crafts';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SortableListSort} from '../../../../../shared/ui/sortable-list/sortable-list.component';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectCraftResource} from '../../../../project-common/api/crafts/resources/project-craft.resource';
import {
    ProjectCraftActions,
    UpdateProjectCraftPayload
} from '../../../../project-common/store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {CurrentProjectPermissions} from '../../../../project-common/store/projects/project.slice';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectCraftModel} from '../models/project-craft.model';
import {
    DELETE_CRAFT_ITEM_ID,
    ProjectCraftsListComponent,
    UPDATE_CRAFT_ITEM_ID,
} from './project-crafts-list.component';

describe('Project Crafts List Component', () => {
    let fixture: ComponentFixture<ProjectCraftsListComponent>;
    let comp: ProjectCraftsListComponent;
    let de: DebugElement;
    let store: jasmine.SpyObj<Store>;
    let modalService: ModalService;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);

    const projectPermissionsObservable: Subject<CurrentProjectPermissions> = new Subject<CurrentProjectPermissions>();
    const craftsObservable: BehaviorSubject<ProjectCraftResource[]> = new BehaviorSubject<ProjectCraftResource[]>([]);
    const craftsRequestStatusObservable: BehaviorSubject<RequestStatusEnum> =
        new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);
    const dataAutomationCraftRowSelector = '[data-automation="craft-list-item"]';
    const dataAutomationCraftListNoItems = '[data-automation="project-crafts-list-no-items"]';

    const isEditingCssClass = 'ss-project-crafts-list__item--editing';

    const craftRowSelector = () => de.query(By.css(dataAutomationCraftRowSelector)).nativeElement.classList;
    const craftNoItemsSelector = () => de.queryAll(By.css(dataAutomationCraftListNoItems));
    const getDropdownItem = ({id}: ProjectCraftResource, itemId: string): MenuItem<ProjectCraftModel> =>
        flatten(comp.crafts.find(craft => craft.id === id)?.dropdownItems.map(({items}) => items))
            .find(item => item.id === itemId);
    const getElements = (selector: string): DebugElement[] => de.queryAll(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        imports: [
            DragDropModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            ProjectCraftsListComponent,
        ],
        providers: [
            {
                provide: ProjectCraftQueries,
                useValue: instance(projectCraftQueriesMock),
            },
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceServiceMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCraftsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        store = de.injector.get(Store) as jasmine.SpyObj<Store>;
        modalService = de.injector.get(ModalService);

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(projectPermissionsObservable);
        when(projectCraftQueriesMock.observeCrafts()).thenReturn(craftsObservable);
        when(projectCraftQueriesMock.observeCraftsRequestStatus()).thenReturn(craftsRequestStatusObservable);

        craftsObservable.next([]);
        craftsRequestStatusObservable.next(RequestStatusEnum.empty);

        store.dispatch.calls.reset();

        fixture.detectChanges();
    });

    it('should render 1 row for each rows in the MOCK', () => {
        const initialProjectCrafts: ProjectCraftResource[] = [MOCK_PROJECT_CRAFT_A, MOCK_PROJECT_CRAFT_B];

        craftsObservable.next(initialProjectCrafts);

        comp.ngOnInit();

        fixture.detectChanges();

        expect((getElements(dataAutomationCraftRowSelector).length)).toBe(initialProjectCrafts.length);
    });

    it('should show have no items feedback', () => {
        craftsObservable.next([]);

        expect(craftNoItemsSelector()).toBeTruthy();
    });

    it('should have no crafts', () => {
        craftsRequestStatusObservable.next(RequestStatusEnum.progress);
        craftsObservable.next([MOCK_PROJECT_CRAFT_A, MOCK_PROJECT_CRAFT_B]);

        expect(comp.hasNoCrafts).toBe(false);
    });

    it('should enable edit of certain craft when enableEdit is called', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_PROJECT_CRAFT_B, UPDATE_CRAFT_ITEM_ID));

        expect(craftRowSelector()).toContain(isEditingCssClass);
    });

    it('should disable edit of certain craft when disableEdit is called', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_PROJECT_CRAFT_B, UPDATE_CRAFT_ITEM_ID));

        expect(craftRowSelector()).toContain(isEditingCssClass);

        comp.disableEdit();

        expect(craftRowSelector()).not.toContain(isEditingCssClass);
    });

    it('should set correct options when user has permission delete craft', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_A]);

        expect(getDropdownItem(MOCK_PROJECT_CRAFT_A, DELETE_CRAFT_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission delete craft', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_B]);

        expect(getDropdownItem(MOCK_PROJECT_CRAFT_B, DELETE_CRAFT_ITEM_ID)).toBeFalsy();
    });

    it('should set correct options when user has permission update craft', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_B]);

        expect(getDropdownItem(MOCK_PROJECT_CRAFT_B, UPDATE_CRAFT_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission update craft', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_C]);

        expect(getDropdownItem(MOCK_PROJECT_CRAFT_C, UPDATE_CRAFT_ITEM_ID)).toBeFalsy();
    });

    it('should open confirmation dialog and dispatch ProjectCraftActions.Delete.One when delete confirm callback is called', () => {
        const expectedResult = new ProjectCraftActions.Delete.One(MOCK_PROJECT_CRAFT_A.id);

        spyOn(modalService, 'open').and.callThrough();

        craftsObservable.next([MOCK_PROJECT_CRAFT_A, MOCK_PROJECT_CRAFT_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_PROJECT_CRAFT_A, DELETE_CRAFT_ITEM_ID));
        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should open confirmation dialog and dispatch ProjectCraftActions.Delete.OneReset when delete cancel callback is called', () => {
        const expectedResult = new ProjectCraftActions.Delete.OneReset();

        spyOn(modalService, 'open').and.callThrough();

        craftsObservable.next([MOCK_PROJECT_CRAFT_A]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_PROJECT_CRAFT_A, DELETE_CRAFT_ITEM_ID));
        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch List Update when handleSort is called', () => {
        const sortEvent: SortableListSort = {
            item: MOCK_PROJECT_CRAFT_A,
            previousIndex: 1,
            currentIndex: 2,
        };
        const payload: UpdateProjectCraftPayload = {
            saveProjectCraft: {
                name: MOCK_PROJECT_CRAFT_A.name,
                version: MOCK_PROJECT_CRAFT_A.version,
                color: MOCK_PROJECT_CRAFT_A.color,
                position: sortEvent.currentIndex + 1,
            },
            projectCraftId: MOCK_PROJECT_CRAFT_A.id,
            craftVersion: MOCK_PROJECT_CRAFT_A.version,
        };
        const expectedAction = new ProjectCraftActions.Update.List(payload);

        comp.handleSort(sortEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set crafts with drag as true', () => {
        const initialCrafts = [MOCK_PROJECT_CRAFT_A];

        craftsObservable.next(initialCrafts);

        expect(comp.crafts[0].drag).toEqual(!!MOCK_PROJECT_CRAFT_A._links.update);
    });

    it('should set crafts with drag as false', () => {
        const initialCrafts = [MOCK_PROJECT_CRAFT_C];

        craftsObservable.next(initialCrafts);

        expect(comp.crafts[0].drag).toEqual(!!MOCK_PROJECT_CRAFT_C._links.update);
    });

    it('should set editIndex on handleDropdownItemClicked', () => {
        craftsObservable.next([MOCK_PROJECT_CRAFT_A, MOCK_PROJECT_CRAFT_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_PROJECT_CRAFT_B, UPDATE_CRAFT_ITEM_ID));

        expect(comp.editedIndex).toEqual(MOCK_PROJECT_CRAFT_B.position - 1);
    });

    it('should set editIndex to null on disableEdit', () => {
        comp.editedIndex = 5;

        comp.disableEdit();

        expect(comp.editedIndex).toEqual(null);
    });
});
