/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {UntypedFormBuilder} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_DAY_CARD_A} from '../../../../../test/mocks/day-cards';
import {
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
} from '../../../../../test/mocks/rfvs';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {
    CancelDayCardPayload,
    DayCardActions
} from '../../store/day-cards/day-card.actions';
import {RfvActions} from '../../store/rfvs/rfv.actions';
import {RfvQueries} from '../../store/rfvs/rfv.queries';
import {DayCardReasonComponent} from './day-card-reason.component';

describe('Day Card Reason Component', () => {
    let fixture: ComponentFixture<DayCardReasonComponent>;
    let comp: DayCardReasonComponent;
    let store: any;
    const mockRfvQueries: RfvQueries = mock(RfvQueries);

    const dayCardId = MOCK_DAY_CARD_A.id;
    const cancelDayCardPayload: CancelDayCardPayload = {
        dayCardId,
        reason: 'BAD_WEATHER',
    };
    const defaultRequestStatus = RequestStatusEnum.empty;
    const mockRfvList: RfvEntity[] = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
    ];
    const initialState: any = {
        projectModule: {
            dayCardSlice: {
                currentItem: {
                    id: dayCardId,
                    requestStatus: RequestStatusEnum.empty,
                },
            },
        },
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [DayCardReasonComponent],
        providers: [
            UntypedFormBuilder,
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        dayCardId,
                    },
                },
            },
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
            {
                provide: RfvQueries,
                useValue: instance(mockRfvQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardReasonComponent);
        comp = fixture.componentInstance;

        store = TestBed.inject(Store);

        when(mockRfvQueries.observeActiveRfvList()).thenReturn(of([]));
        when(mockRfvQueries.observeRfvListRequestStatus()).thenReturn(of(defaultRequestStatus));

        fixture.detectChanges();
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should dispatch a DayCardActions.Cancel.One action when calling handleSubmit', () => {
        const expectedResult = new DayCardActions.Cancel.One(cancelDayCardPayload);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSubmit('BAD_WEATHER');

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch a DayCardActions.Cancel.OneReset action when calling handleCancel', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const expectedResult = new DayCardActions.Cancel.OneReset();
        comp.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set requestStatus to IN PROGRESS when capture is submitting', () => {
        store._value.projectModule.dayCardSlice.currentItem.requestStatus = RequestStatusEnum.progress;
        comp.ngOnInit();

        expect(comp.requestStatus).toEqual(RequestStatusEnum.progress);
    });

    it('should request the Rfv list when the component inits', () => {
        const expectedResult = new RfvActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set the current rfv list when observeActiveRfvList emits', () => {
        when(mockRfvQueries.observeActiveRfvList()).thenReturn(of(mockRfvList));

        comp.ngOnInit();

        expect(comp.rfvList).toBe(mockRfvList);
    });

    it('should set the rfvListRequestStatus when observeRfvListRequestStatus emits', () => {
        const expectedRequestStatus = RequestStatusEnum.progress;

        expect(comp.rfvListRequestStatus).toBe(defaultRequestStatus);

        when(mockRfvQueries.observeRfvListRequestStatus()).thenReturn(of(expectedRequestStatus));
        comp.ngOnInit();

        expect(comp.rfvListRequestStatus).toBe(expectedRequestStatus);
    });
});
