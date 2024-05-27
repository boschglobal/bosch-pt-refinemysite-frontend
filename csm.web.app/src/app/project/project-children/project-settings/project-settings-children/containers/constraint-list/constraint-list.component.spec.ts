/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {
    cloneDeep,
    unionBy
} from 'lodash';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../../../test/mocks/constraints';
import {MockStore} from '../../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {ConstraintEntity} from '../../../../../project-common/entities/constraints/constraint';
import {ConstraintActions} from '../../../../../project-common/store/constraints/constraint.actions';
import {ConstraintQueries} from '../../../../../project-common/store/constraints/constraint.queries';
import {ConstraintCaptureComponent} from '../../presentationals/constraint-capture/constraint-capture.component';
import {
    ConstraintListComponent,
    CSS_CLASS_CONSTRAINT_ITEM_INACTIVE
} from './constraint-list.component';

describe('Constraint List Component', () => {
    let component: ConstraintListComponent;
    let changeDetectorRef: ChangeDetectorRef;
    let fixture: ComponentFixture<ConstraintListComponent>;
    let de: DebugElement;
    let firstConstraintListItem: ConstraintEntity;
    let firstConstraintListItemCopy: ConstraintEntity;
    let modalService: ModalService;
    let store: Store<State>;
    let translateService: TranslateService;

    const constraintQueriesMock = mock(ConstraintQueries);

    const dataAutomationConstraintListSelector = '[data-automation="constraint-list"]';
    const dataAutomationConstraintListItemActionsSelector = '[data-automation="constraint-list-item-actions"]';
    const dataAutomationConstraintListItemSelector = '[data-automation="constraint-list-item"]';
    const dataAutomationConstraintListItemNumberSelector = '[data-automation="constraint-list-item-number"]';
    const dataAutomationConstraintListItemNameSelector = '[data-automation="constraint-list-item-name"]';
    const dataAutomationConstraintListItemUpdateButtonSelector = '[data-automation="constraint-list-item-update-button"]';
    const dataAutomationConstraintListItemActivateButtonSelector = '[data-automation="constraint-list-item-activate-button"]';
    const dataAutomationConstraintListItemDeactivateButtonSelector = '[data-automation="constraint-list-item-deactivate-button"]';

    const constraintList: ConstraintEntity[] = [
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    ];
    const activeConstraintList = constraintList.filter(item => item.active);
    const getElement = (selector: string): DebugElement => de.query(By.css(selector));
    const getElements = (selector: string): DebugElement[] => de.queryAll(By.css(selector));
    const getElementInsideDebugElement = (element: DebugElement, selector: string) => element.query(By.css(selector));
    const getConstraintListWithUpdatedItem = (item: ConstraintEntity): ConstraintEntity[] =>
        cloneDeep(unionBy([item], constraintList, 'id'));
    const getFirstConstraintListItemElement = (): DebugElement => getElement(dataAutomationConstraintListItemSelector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            ConstraintCaptureComponent,
            ConstraintListComponent,
        ],
        imports: [
            TranslateModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: ConstraintQueries,
                useFactory: () => instance(constraintQueriesMock),
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
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConstraintListComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);
        translateService = TestBed.inject(TranslateService);

        firstConstraintListItem = constraintList[0];
        firstConstraintListItemCopy = cloneDeep(constraintList[0]);

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(constraintList));
        when(constraintQueriesMock.observeActiveConstraintList()).thenReturn(of(activeConstraintList));
        when(constraintQueriesMock.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        component.ngOnInit();

        changeDetectorRef.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should set isLoading to true and add loading class modifier to root element when Constraint list ' +
        'request status is progress', () => {
        expect(component.isLoading).toBeFalsy();

        when(constraintQueriesMock.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(component.isLoading).toBeTruthy();
        expect(getElement(dataAutomationConstraintListSelector).nativeElement.classList).toContain('ss-constraint-list--loading');
    });

    it('should not set isLoading to true and not add loading class modifier to root element when Constraint list ' +
        'request is different from progress', () => {
        expect(component.isLoading).toBeFalsy();

        when(constraintQueriesMock.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(component.isLoading).toBeFalsy();
        expect(getElement(dataAutomationConstraintListSelector).nativeElement.classList).not.toContain('ss-constraint-list--loading');
    });

    it('should display tiny loader for a Constraint with a in progress loading state', () => {
        firstConstraintListItemCopy.requestStatus = RequestStatusEnum.progress;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const itemLoadingElement = getElementInsideDebugElement(getFirstConstraintListItemElement(), 'ss-tiny-loader');

        expect(itemLoadingElement).not.toBeNull();
    });

    it('should not display tiny loader for a Constraint with a loading state different from loading', () => {
        firstConstraintListItemCopy.requestStatus = RequestStatusEnum.success;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const itemLoadingElement = getElementInsideDebugElement(getFirstConstraintListItemElement(), 'ss-tiny-loader');

        expect(itemLoadingElement).toBeNull();
    });

    it('should display Constraint edit button when Constraint has permissions for update', () => {
        firstConstraintListItemCopy.permissions.canUpdate = true;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const updateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemUpdateButtonSelector);

        expect(updateButton).not.toBeNull();
    });

    it('should not display Constraint edit button when Constraint has no permissions for update', () => {
        firstConstraintListItemCopy.permissions.canUpdate = false;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const updateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemUpdateButtonSelector);

        expect(updateButton).toBeNull();
    });

    it('should display Constraint activate button when Constraint has permissions for activate', () => {
        firstConstraintListItemCopy.permissions.canActivate = true;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const activateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemActivateButtonSelector);

        expect(activateButton).not.toBeNull();
    });

    it('should not display Constraint activate button when Constraint has no permissions for activate', () => {
        firstConstraintListItemCopy.permissions.canActivate = false;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const activateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemActivateButtonSelector);

        expect(activateButton).toBeNull();
    });

    it('should display Constraint deactivate button when Constraint has permissions for deactivate', () => {
        firstConstraintListItemCopy.permissions.canDeactivate = true;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const deactivateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemDeactivateButtonSelector);

        expect(deactivateButton).not.toBeNull();
    });

    it('should not display Constraint deactivate button when Constraint has no permissions for deactivate', () => {
        firstConstraintListItemCopy.permissions.canDeactivate = false;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const deactivateButton =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemDeactivateButtonSelector);

        expect(deactivateButton).toBeNull();
    });

    it('should add CSS_CLASS_CONSTRAINT_ITEM_INACTIVE class for a inactive Constraint item', () => {
        firstConstraintListItemCopy.active = false;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(getFirstConstraintListItemElement().nativeElement.classList).toContain(CSS_CLASS_CONSTRAINT_ITEM_INACTIVE);
    });

    it('should not add CSS_CLASS_CONSTRAINT_ITEM_INACTIVE class for a active Constraint item', () => {
        firstConstraintListItemCopy.active = true;

        when(constraintQueriesMock.observeConstraintList()).thenReturn(of(getConstraintListWithUpdatedItem(firstConstraintListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(getFirstConstraintListItemElement().nativeElement.classList).not.toContain(CSS_CLASS_CONSTRAINT_ITEM_INACTIVE);
    });

    it('should render the correct item number and name for each item entry', () => {
        constraintList.forEach((item, index) => {
            const itemNumberText = `${index + 1}.`;

            expect(getElements(dataAutomationConstraintListItemNumberSelector)[index].nativeElement.innerText).toBe(itemNumberText);
            expect(getElements(dataAutomationConstraintListItemNameSelector)[index].nativeElement.innerText).toBe(item.name);
        });
    });

    it('should set the correct Constraint list total items and active Constraint list total items', () => {
        expect(component.constraintListTotalItems).toEqual(constraintList.length);
        expect(component.activeConstraintListTotalItems).toEqual(activeConstraintList.length);
    });

    it('should dispatch ConstraintActions.Request.All action on language change', () => {
        const language = 'de';
        const expectedAction = new ConstraintActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();

        translateService.setDefaultLang(language);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch ConstraintActions.Activate.One on activateConstraint call', () => {
        const expectedPayload = new ConstraintActions.Activate.One({
            key: firstConstraintListItem.key,
            name: firstConstraintListItem.name,
            active: true,
        });

        spyOn(store, 'dispatch').and.callThrough();

        component.activateConstraint(firstConstraintListItemCopy);

        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should dispatch ConstraintActions.Deactivate.One on deactivateConstraint call', () => {
        const expectedPayload = new ConstraintActions.Deactivate.One({
            key: firstConstraintListItem.key,
            name: firstConstraintListItem.name,
            active: false,
        });

        spyOn(store, 'dispatch').and.callThrough();

        component.deactivateConstraint(firstConstraintListItemCopy);

        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should hide Constraint name and Constraint actions if Constraint is being edited', () => {
        let constraintNameElement =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemNameSelector);
        let constraintActionsElement =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemActionsSelector);

        expect(constraintNameElement).not.toBeNull();
        expect(constraintActionsElement).not.toBeNull();

        component.updateConstraint(0, firstConstraintListItem);

        changeDetectorRef.detectChanges();

        constraintNameElement =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemNameSelector);
        constraintActionsElement =
            getElementInsideDebugElement(getFirstConstraintListItemElement(), dataAutomationConstraintListItemActionsSelector);

        expect(constraintNameElement).toBeNull();
        expect(constraintActionsElement).toBeNull();
    });

    it('should display Constraint capture on updateConstraint call and hide on cancelConstraintEdit', () => {
        const constraintCaptureElement = getElementInsideDebugElement(getFirstConstraintListItemElement(), 'ss-constraint-capture');

        expect(constraintCaptureElement.nativeElement.hidden).toBeTruthy();

        component.updateConstraint(0, firstConstraintListItem);
        changeDetectorRef.detectChanges();
        expect(constraintCaptureElement.nativeElement.hidden).toBeFalsy();

        component.cancelConstraintEdit();
        changeDetectorRef.detectChanges();
        expect(constraintCaptureElement.nativeElement.hidden).toBeTruthy();
    });

    it('should call setFocus of the first ConstraintCapture Component on updateConstraint call', () => {
        const firstConstraintCaptureComponent = component.constraintCaptures.get(0);

        spyOn(firstConstraintCaptureComponent, 'setFocus').and.callThrough();

        component.updateConstraint(0, firstConstraintListItem);

        expect(firstConstraintCaptureComponent.setFocus).toHaveBeenCalled();
    });

    it('should call open on modalService on updateConstraintName call and confirmCallback should ' +
        'dispatch correct action', () => {
        const name = 'foo';
        const {key, active} = firstConstraintListItem;
        const expectedAction = new ConstraintActions.Update.One({key, active, name});

        spyOn(modalService, 'open').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        component.updateConstraint(0, firstConstraintListItem);
        changeDetectorRef.detectChanges();

        component.updateConstraintName(name, firstConstraintListItem);
        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call open on modalService on updateConstraintName call and completeCallback should ' +
        'reset current editing Constraint id', () => {
        spyOn(modalService, 'open').and.callThrough();

        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();

        component.updateConstraint(0, firstConstraintListItem);
        changeDetectorRef.detectChanges();

        expect(component.isEditingConstraint(firstConstraintListItem)).toBeTruthy();

        component.updateConstraintName('foo', firstConstraintListItem);
        modalService.currentModalData.completeCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();
    });

    it('should return true if Constraint ID is the one currently being edited and false if not', () => {
        const secondConstraintListItem = constraintList[1];

        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();

        component.updateConstraint(0, firstConstraintListItem);

        expect(component.isEditingConstraint(firstConstraintListItem)).toBeTruthy();

        component.updateConstraint(1, secondConstraintListItem);

        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();
    });

    it('should set current Constraint in edition on a updateConstraint call and reset current Constraint in edition on ' +
        'a cancelConstraintEdit call', () => {
        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();

        component.updateConstraint(0, firstConstraintListItem);
        expect(component.isEditingConstraint(firstConstraintListItem)).toBeTruthy();

        component.cancelConstraintEdit();
        expect(component.isEditingConstraint(firstConstraintListItem)).toBeFalsy();
    });

});
