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
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREA_MODEL_B,
    MOCK_WORKAREA_NO_UPDATE,
    MOCK_WORKAREAS,
} from '../../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SortableListSort} from '../../../../../shared/ui/sortable-list/sortable-list.component';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {
    UpdateWorkareaPayload,
    WorkareaActions
} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectWorkareaModel} from '../../models/project-workarea.model';
import {
    DELETE_WORKAREA_ITEM_ID,
    ProjectWorkareasListComponent,
    UPDATE_WORKAREA_ITEM_ID,
} from './project-workareas-list.component';

describe('Project Workareas List Component', () => {
    let fixture: ComponentFixture<ProjectWorkareasListComponent>;
    let comp: ProjectWorkareasListComponent;
    let de: DebugElement;
    let store: jasmine.SpyObj<Store>;
    let modalService: ModalService;

    const workareasObservable: BehaviorSubject<WorkareaResource[]> = new BehaviorSubject<WorkareaResource[]>([]);
    const workareasRequestStatusObservable: BehaviorSubject<RequestStatusEnum> =
        new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);

    const isEditingCssClass = 'ss-project-workareas-list__item--editing';
    const workareaQueriesMock: WorkareaQueries = mock(WorkareaQueries);

    const dataAutomationWorkareaHolderRowSelector = '[data-automation="project-workarea-list-item-holder"]';
    const dataAutomationWorkareaRowSelector = '[data-automation="project-workarea-list-item"]';
    const dataAutomationWorkareaListNoItems = '[data-automation="project-workarea-list-no-items"]';

    const workareaNoItemsSelector = (): DebugElement[] => de.queryAll(By.css(dataAutomationWorkareaListNoItems));
    const workareaRowSelector = (): DebugElement => de.query(By.css(dataAutomationWorkareaHolderRowSelector)).nativeElement.classList;
    const getDropdownItem = ({id}: WorkareaResource, itemId: string): MenuItem<ProjectWorkareaModel> =>
        flatten(comp.workareas.find(workarea => workarea.id === id)?.dropdownItems.map(({items}) => items))
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
            ProjectWorkareasListComponent,
        ],
        providers: [
            {
                provide: WorkareaQueries,
                useValue: instance(workareaQueriesMock),
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
        fixture = TestBed.createComponent(ProjectWorkareasListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        store = de.injector.get(Store) as jasmine.SpyObj<Store>;
        modalService = de.injector.get(ModalService);

        when(workareaQueriesMock.observeWorkareas()).thenReturn(workareasObservable);
        when(workareaQueriesMock.observeWorkareasRequestStatus()).thenReturn(workareasRequestStatusObservable);

        workareasObservable.next([]);
        workareasRequestStatusObservable.next(RequestStatusEnum.empty);

        store.dispatch.calls.reset();

        fixture.detectChanges();
    });

    it('should render 1 row for each rows in the MOCK', () => {
        workareasObservable.next(MOCK_WORKAREAS);

        expect(getElements(dataAutomationWorkareaRowSelector).length).toBe(MOCK_WORKAREAS.length);
    });

    it('should show have no items feedback', () => {
        workareasRequestStatusObservable.next(RequestStatusEnum.progress);
        workareasObservable.next([]);

        expect(workareaNoItemsSelector()).toBeTruthy();
    });

    it('should have no workareas', () => {
        workareasRequestStatusObservable.next(RequestStatusEnum.progress);
        workareasObservable.next([MOCK_WORKAREA_A, MOCK_WORKAREA_B]);

        expect(comp.hasNoWorkareas).toBe(false);
    });

    it('should enable edit of certain workareas when enableEdit is called', () => {
        workareasObservable.next([MOCK_WORKAREA_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_WORKAREA_B, UPDATE_WORKAREA_ITEM_ID));

        expect(workareaRowSelector()).toContain(isEditingCssClass);
    });

    it('should set correct options when user has permission delete workarea', () => {
        workareasObservable.next([MOCK_WORKAREA_A]);

        expect(getDropdownItem(MOCK_WORKAREA_A, DELETE_WORKAREA_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission delete workarea', () => {
        workareasObservable.next([MOCK_WORKAREA_B]);

        expect(getDropdownItem(MOCK_WORKAREA_B, DELETE_WORKAREA_ITEM_ID)).toBeFalsy();
    });

    it('should set correct options when user has permission update workarea', () => {
        workareasObservable.next([MOCK_WORKAREA_B]);

        expect(getDropdownItem(MOCK_WORKAREA_B, UPDATE_WORKAREA_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission update workarea', () => {
        workareasObservable.next([MOCK_WORKAREA_NO_UPDATE]);

        expect(getDropdownItem(MOCK_WORKAREA_NO_UPDATE, UPDATE_WORKAREA_ITEM_ID)).toBeFalsy();
    });

    it('should open confirmation dialog and dispatch WorkareaActions.Delete.One when delete confirm callback is called', () => {
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new WorkareaActions.Delete.One(MOCK_WORKAREA_A.id);

        workareasObservable.next([MOCK_WORKAREA_A, MOCK_WORKAREA_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_WORKAREA_A, DELETE_WORKAREA_ITEM_ID));

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should open confirmation dialog and dispatch WorkareaActions.Delete.OneReset when delete cancel callback is called', () => {
        const expectedResult = new WorkareaActions.Delete.OneReset();

        spyOn(modalService, 'open').and.callThrough();

        workareasObservable.next([MOCK_WORKAREA_A, MOCK_WORKAREA_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_WORKAREA_A, DELETE_WORKAREA_ITEM_ID));

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set editIndex on handleDropdownItemClicked', () => {
        workareasObservable.next([MOCK_WORKAREA_A, MOCK_WORKAREA_B]);

        comp.handleDropdownItemClicked(getDropdownItem(MOCK_WORKAREA_B, UPDATE_WORKAREA_ITEM_ID));

        expect(comp.editedIndex).toEqual(MOCK_WORKAREA_MODEL_B.position - 1);
    });

    it('should set editIndex to null on disableEdit', () => {
        comp.editedIndex = 5;

        comp.disableEdit();

        expect(comp.editedIndex).toEqual(null);
    });

    it('should dispatch List Update when handleSort is called', () => {
        const sortEvent: SortableListSort = {
            item: MOCK_WORKAREA_A,
            previousIndex: 1,
            currentIndex: 2,
        };
        const payload: UpdateWorkareaPayload = {
            saveWorkarea: {
                name: MOCK_WORKAREA_A.name,
                version: MOCK_WORKAREA_A.version,
                position: sortEvent.currentIndex + 1,
            },
            workareaId: MOCK_WORKAREA_A.id,
        };
        const expectedAction = new WorkareaActions.Update.List(payload);

        comp.handleSort(sortEvent);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
