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
    MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../../../test/mocks/rfvs';
import {MockStore} from '../../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {RfvEntity} from '../../../../../project-common/entities/rfvs/rfv';
import {ProjectSliceService} from '../../../../../project-common/store/projects/project-slice.service';
import {RfvActions} from '../../../../../project-common/store/rfvs/rfv.actions';
import {RfvQueries} from '../../../../../project-common/store/rfvs/rfv.queries';
import {ProjectRfvCaptureComponent} from '../../presentationals/rfv-capture/project-rfv-capture.component';
import {
    CSS_CLASS_RFV_ITEM_INACTIVE,
    ProjectRfvListComponent
} from './project-rfv-list.component';

describe('Project Rfv List Component', () => {
    let component: ProjectRfvListComponent;
    let changeDetectorRef: ChangeDetectorRef;
    let fixture: ComponentFixture<ProjectRfvListComponent>;
    let de: DebugElement;
    let firstRfvListItem: RfvEntity;
    let firstRfvListItemCopy: RfvEntity;
    let modalService: ModalService;
    let store: Store<State>;
    let translateService: TranslateService;

    const projectSliceServiceMock = mock(ProjectSliceService);
    const rfvQueriesMock = mock(RfvQueries);

    const dataAutomationRfvListSelector = '[data-automation="rfv-list"]';
    const dataAutomationRfvListItemActionsSelector = '[data-automation="rfv-list-item-actions"]';
    const dataAutomationRfvListItemSelector = '[data-automation="rfv-list-item"]';
    const dataAutomationRfvListItemNumberSelector = '[data-automation="rfv-list-item-number"]';
    const dataAutomationRfvListItemNameSelector = '[data-automation="rfv-list-item-name"]';
    const dataAutomationRfvListItemUpdateButtonSelector = '[data-automation="rfv-list-item-update-button"]';
    const dataAutomationRfvListItemActivateButtonSelector = '[data-automation="rfv-list-item-activate-button"]';
    const dataAutomationRfvListItemDeactivateButtonSelector = '[data-automation="rfv-list-item-deactivate-button"]';

    const projectId = 'foo';
    const rfvList: RfvEntity[] = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    ];
    const activeRfvList = rfvList.filter(item => item.active);
    const getElement = (selector: string): DebugElement => de.query(By.css(selector));
    const getElements = (selector: string): DebugElement[] => de.queryAll(By.css(selector));
    const getElementInsideDebugElement = (element: DebugElement, selector: string) => element.query(By.css(selector));
    const getRfvListWithUpdatedItem = (item: RfvEntity): RfvEntity[] => cloneDeep(unionBy([item], rfvList, 'id'));
    const getFirstRfvListItemElement = (): DebugElement => getElement(dataAutomationRfvListItemSelector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            ProjectRfvCaptureComponent,
            ProjectRfvListComponent,
        ],
        imports: [
            TranslateModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: RfvQueries,
                useFactory: () => instance(rfvQueriesMock),
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRfvListComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);
        translateService = TestBed.inject(TranslateService);

        firstRfvListItem = rfvList[0];
        firstRfvListItemCopy = cloneDeep(rfvList[0]);

        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));
        when(rfvQueriesMock.observeRfvList()).thenReturn(of(rfvList));
        when(rfvQueriesMock.observeActiveRfvList()).thenReturn(of(activeRfvList));
        when(rfvQueriesMock.observeRfvListRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        component.ngOnInit();

        changeDetectorRef.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should set isLoading to true and add loading class modifier to root element when RFV list ' +
        'request status is progress', () => {
        expect(component.isLoading).toBeFalsy();

        when(rfvQueriesMock.observeRfvListRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(component.isLoading).toBeTruthy();
        expect(getElement(dataAutomationRfvListSelector).nativeElement.classList).toContain('ss-project-rfv-list--loading');
    });

    it('should not set isLoading to true and not add loading class modifier to root element when RFV list ' +
        'request is different from progress', () => {
        expect(component.isLoading).toBeFalsy();

        when(rfvQueriesMock.observeRfvListRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(component.isLoading).toBeFalsy();
        expect(getElement(dataAutomationRfvListSelector).nativeElement.classList).not.toContain('ss-project-rfv-list--loading');
    });

    it('should display tiny loader for a RFV with a in progress loading state', () => {
        firstRfvListItemCopy.requestStatus = RequestStatusEnum.progress;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const itemLoadingElement = getElementInsideDebugElement(getFirstRfvListItemElement(), 'ss-tiny-loader');

        expect(itemLoadingElement).not.toBeNull();
    });

    it('should not display tiny loader for a RFV with a loading state different from loading', () => {
        firstRfvListItemCopy.requestStatus = RequestStatusEnum.success;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const itemLoadingElement = getElementInsideDebugElement(getFirstRfvListItemElement(), 'ss-tiny-loader');

        expect(itemLoadingElement).toBeNull();
    });

    it('should display RFV edit button when RFV has permissions for update', () => {
        firstRfvListItemCopy.permissions.canUpdate = true;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const updateButton = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemUpdateButtonSelector);

        expect(updateButton).not.toBeNull();
    });

    it('should not display RFV edit button when RFV has no permissions for update', () => {
        firstRfvListItemCopy.permissions.canUpdate = false;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const updateButton = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemUpdateButtonSelector);

        expect(updateButton).toBeNull();
    });

    it('should display RFV activate button when RFV has permissions for activate', () => {
        firstRfvListItemCopy.permissions.canActivate = true;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const activateButton = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemActivateButtonSelector);

        expect(activateButton).not.toBeNull();
    });

    it('should not display RFV activate button when RFV has no permissions for activate', () => {
        firstRfvListItemCopy.permissions.canActivate = false;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const activateButton = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemActivateButtonSelector);

        expect(activateButton).toBeNull();
    });

    it('should display RFV deactivate button when RFV has permissions for deactivate', () => {
        firstRfvListItemCopy.permissions.canDeactivate = true;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const deactivateButton =
            getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemDeactivateButtonSelector);

        expect(deactivateButton).not.toBeNull();
    });

    it('should not display RFV deactivate button when RFV has no permissions for deactivate', () => {
        firstRfvListItemCopy.permissions.canDeactivate = false;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        const deactivateButton =
            getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemDeactivateButtonSelector);

        expect(deactivateButton).toBeNull();
    });

    it('should add CSS_CLASS_RFV_ITEM_INACTIVE class for a inactive RFV item', () => {
        firstRfvListItemCopy.active = false;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(getFirstRfvListItemElement().nativeElement.classList).toContain(CSS_CLASS_RFV_ITEM_INACTIVE);
    });

    it('should not add CSS_CLASS_RFV_ITEM_INACTIVE class for a active RFV item', () => {
        firstRfvListItemCopy.active = true;

        when(rfvQueriesMock.observeRfvList()).thenReturn(of(getRfvListWithUpdatedItem(firstRfvListItemCopy)));

        component.ngOnInit();
        changeDetectorRef.detectChanges();

        expect(getFirstRfvListItemElement().nativeElement.classList).not.toContain(CSS_CLASS_RFV_ITEM_INACTIVE);
    });

    it('should render the correct item number and name for each item entry', () => {
        rfvList.forEach((item, index) => {
            const itemNumberText = `${index + 1}.`;

            expect(getElements(dataAutomationRfvListItemNumberSelector)[index].nativeElement.innerText).toBe(itemNumberText);
            expect(getElements(dataAutomationRfvListItemNameSelector)[index].nativeElement.innerText).toBe(item.name);
        });
    });

    it('should set the correct RFV list total items and active RFV list total items', () => {
        expect(component.rfvListTotalItems).toEqual(rfvList.length);
        expect(component.activeRfvListTotalItems).toEqual(activeRfvList.length);
    });

    it('should dispatch RfvActions.Request.All action on language change', () => {
        const language = 'de';
        const expectedAction = new RfvActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();

        translateService.setDefaultLang(language);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch RfvActions.Activate.One on activateRfv call', () => {
        const expectedPayload = new RfvActions.Activate.One(projectId, {
            key: firstRfvListItem.key,
            name: firstRfvListItem.name,
            active: true,
        });

        spyOn(store, 'dispatch').and.callThrough();

        component.activateRfv(firstRfvListItemCopy);

        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should dispatch RfvActions.Deactivate.One on deactivateRfv call', () => {
        const expectedPayload = new RfvActions.Deactivate.One(projectId, {
            key: firstRfvListItem.key,
            name: firstRfvListItem.name,
            active: false,
        });

        spyOn(store, 'dispatch').and.callThrough();

        component.deactiveRfv(firstRfvListItemCopy);

        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should hide RFV name and RFV actions if RFV is being edited', () => {
        let rfvNameElement = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemNameSelector);
        let rfvActionsElement = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemActionsSelector);

        expect(rfvNameElement).not.toBeNull();
        expect(rfvActionsElement).not.toBeNull();

        component.updateRfv(0, firstRfvListItem);

        changeDetectorRef.detectChanges();

        rfvNameElement = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemNameSelector);
        rfvActionsElement = getElementInsideDebugElement(getFirstRfvListItemElement(), dataAutomationRfvListItemActionsSelector);

        expect(rfvNameElement).toBeNull();
        expect(rfvActionsElement).toBeNull();
    });

    it('should display RFV capture on updateRfv call and hide on cancelRfvEdit', () => {
        const rfvCaptureElement = getElementInsideDebugElement(getFirstRfvListItemElement(), 'ss-project-rfv-capture');

        expect(rfvCaptureElement.nativeElement.hidden).toBeTruthy();

        component.updateRfv(0, firstRfvListItem);
        changeDetectorRef.detectChanges();
        expect(rfvCaptureElement.nativeElement.hidden).toBeFalsy();

        component.cancelRfvEdit();
        changeDetectorRef.detectChanges();
        expect(rfvCaptureElement.nativeElement.hidden).toBeTruthy();
    });

    it('should call setFocus of the first ProjectRfvCapture Component on updateRfv call', () => {
        const firstRfvCaptureComponent = component.projectRfvCaptures.get(0);

        spyOn(firstRfvCaptureComponent, 'setFocus').and.callThrough();

        component.updateRfv(0, firstRfvListItem);

        expect(firstRfvCaptureComponent.setFocus).toHaveBeenCalled();
    });

    it('should call open on modalService on updateRfvName call and confirmCallback should ' +
        'dispatch correct action', () => {
        const name = 'foo';
        const {key, active} = firstRfvListItem;
        const expectedAction = new RfvActions.Update.One(projectId, {key, active, name});

        spyOn(modalService, 'open').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        component.updateRfv(0, firstRfvListItem);
        changeDetectorRef.detectChanges();

        component.updateRfvName(name, firstRfvListItem);
        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call open on modalService on updateRfvName call and completeCallback should ' +
        'reset current editing RFV id', () => {
        spyOn(modalService, 'open').and.callThrough();

        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();

        component.updateRfv(0, firstRfvListItem);
        changeDetectorRef.detectChanges();

        expect(component.isEditingRfv(firstRfvListItem)).toBeTruthy();

        component.updateRfvName('foo', firstRfvListItem);
        modalService.currentModalData.completeCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();
    });

    it('should return true if RFV ID is the one currently being edited and false if not', () => {
        const secondRfvListItem = rfvList[1];

        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();

        component.updateRfv(0, firstRfvListItem);

        expect(component.isEditingRfv(firstRfvListItem)).toBeTruthy();

        component.updateRfv(1, secondRfvListItem);

        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();
    });

    it('should set current RFV in edition on a updateRfv call and reset current RFV in edition on a cancelRfvEdit call', () => {
        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();

        component.updateRfv(0, firstRfvListItem);
        expect(component.isEditingRfv(firstRfvListItem)).toBeTruthy();

        component.cancelRfvEdit();
        expect(component.isEditingRfv(firstRfvListItem)).toBeFalsy();
    });

});
