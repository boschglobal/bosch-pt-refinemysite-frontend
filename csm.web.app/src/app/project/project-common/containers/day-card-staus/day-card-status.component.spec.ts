/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import * as moment from 'moment';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_B,
} from '../../../../../test/mocks/day-cards';
import {MockStore} from '../../../../../test/mocks/store';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardStatusComponent} from './day-card-status.component';

describe('Day Card Status Component', () => {
    let comp: DayCardStatusComponent;
    let fixture: ComponentFixture<DayCardStatusComponent>;
    let de: DebugElement;
    let modalService: any;
    let store: any;

    const dataAutomationApproveButton = '[data-automation="day-card-status-approve"]';
    const dataAutomationCancelButton = '[data-automation="day-card-status-cancel"]';
    const dataAutomationCompleteButton = '[data-automation="day-card-status-complete"]';
    const dataAutomationResetButton = '[data-automation="day-card-status-reset"]';
    const dataAutomationReason = '[data-automation="day-card-status-reason"]';
    const dataAutomationMetaInformation = '[data-automation="day-card-status-meta-information"]';

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [TranslateModule.forRoot()],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
        declarations: [
            DayCardStatusComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardStatusComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.dayCard = MOCK_DAY_CARD_A;
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should render reason when day card has reason', () => {
        comp.dayCard = MOCK_DAY_CARD_B;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationReason))).not.toBeNull();
    });

    it('should not render reason when day card has no reason', () => {
        comp.dayCard = MOCK_DAY_CARD_A;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationReason))).toBeNull();
    });

    it('should render meta information when day card is not in Open state', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Done,
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationMetaInformation))).not.toBeNull();
    });

    it('should not render meta information when day card is in Open state', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Open,
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationMetaInformation))).toBeNull();
    });

    it('should format date in right format', () => {
        const expectedResult = moment(MOCK_DAY_CARD_A.lastModifiedDate).format('L');
        comp.dayCard = MOCK_DAY_CARD_A;

        expect(comp.dayCardStatusDate).toBe(expectedResult);
    });

    it('should not render complete button when has permission for completing and approving', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canApprove: true,
                canComplete: true,
            }),
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCompleteButton))).toBeNull();
        expect(de.query(By.css(dataAutomationApproveButton))).not.toBeNull();
    });

    it('should not render reset button when has not permission to reset', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canReset: false,
            }),
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationResetButton))).toBeNull();
    });

    it('should render reset button when has permission to reset', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Done,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canReset: true,
            }),
        });

        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationResetButton))).not.toBeNull();
    });

    it('should not render cancel button when has not permission to cancel', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canCancel: false,
            }),
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCancelButton))).toBeNull();
    });

    it('should render cancel button when has permission to cancel', () => {
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Open,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canCancel: true,
            }),
        });
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCancelButton))).not.toBeNull();
    });

    it('should call handleApprove when Approve button is clicked', () => {
        spyOn(comp, 'handleApprove').and.callThrough();
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Done,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canApprove: true,
            }),
        });
        fixture.detectChanges();

        de.query(By.css(dataAutomationApproveButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleApprove).toHaveBeenCalled();
    });

    it('should call handleCancel when Cancel button is clicked', () => {
        spyOn(comp, 'handleCancel').and.callThrough();
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Open,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canCancel: true,
            }),
        });
        fixture.detectChanges();

        de.query(By.css(dataAutomationCancelButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should call handleReset when Reset button is clicked', () => {
        spyOn(comp, 'handleReset').and.callThrough();
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Done,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canReset: true,
            }),
        });
        fixture.detectChanges();

        de.query(By.css(dataAutomationResetButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleReset).toHaveBeenCalled();
    });

    it('should call handleComplete when Cancel button is clicked', () => {
        spyOn(comp, 'handleComplete').and.callThrough();
        comp.dayCard = Object.assign({}, MOCK_DAY_CARD_A, {
            status: DayCardStatusEnum.Open,
            permissions: Object.assign({}, MOCK_DAY_CARD_A.permissions, {
                canComplete: true,
            }),
        });
        fixture.detectChanges();

        de.query(By.css(dataAutomationCompleteButton)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.handleComplete).toHaveBeenCalled();
    });

    it('should call dispatch on store with the right payload when handleApprove is called', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const expectedResult = new DayCardActions.Approve.One(MOCK_DAY_CARD_A.id);
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleApprove();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService with the right payload when handleCancel is called', () => {
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = {
            id: ModalIdEnum.ConfirmDayCardStatusChangeWithReasons,
            data: {
                dayCardId: MOCK_DAY_CARD_A.id,
            },
        };
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleCancel();

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleComplete is called and call confirmCallback is called', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new DayCardActions.Complete.One(MOCK_DAY_CARD_A.id);
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleComplete();

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleReset is called and call confirmCallback is called', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new DayCardActions.Reset.One(MOCK_DAY_CARD_A.id);
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleReset();

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleComplete is called and call cancelCallback is called', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new DayCardActions.Complete.OneReset();
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleComplete();

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleReset is called and call cancelCallback is called', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new DayCardActions.Reset.OneReset();
        comp.dayCard = MOCK_DAY_CARD_A;
        comp.handleReset();

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
