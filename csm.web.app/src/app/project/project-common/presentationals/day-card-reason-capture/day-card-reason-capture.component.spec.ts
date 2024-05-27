/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

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
import {UntypedFormBuilder} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
} from '../../../../../test/mocks/rfvs';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {RfvKey} from '../../api/rfvs/resources/rfv.resource';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {DayCardReasonCaptureComponent} from './day-card-reason-capture.component';

describe('Day Card Reason Capture Component', () => {
    let fixture: ComponentFixture<DayCardReasonCaptureComponent>;
    let comp: DayCardReasonCaptureComponent;
    let de: DebugElement;

    const mockRfvList: RfvEntity[] = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
    ];

    const dataAutomationNoProjectSelector = '[data-automation="day-card-reason-capture-list-item"]';

    const getAllElements = (selector: string) => de.queryAll(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [DayCardReasonCaptureComponent],
        providers: [
            UntypedFormBuilder,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardReasonCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.dayCardReasons = mockRfvList;

        fixture.detectChanges();
    });

    it('should render one radio button for each day card reason', () => {
        expect(getAllElements(dataAutomationNoProjectSelector).length).toBe(mockRfvList.length);
    });

    it('should emit onSubmit event when calling handleSubmit', () => {
        const expectedResult: RfvKey = 'BAD_WEATHER';

        spyOn(comp.submitForm, 'emit').and.callThrough();

        comp.form.get('reason').setValue('BAD_WEATHER');
        comp.handleSubmit();

        expect(comp.submitForm.emit).toHaveBeenCalledWith(expectedResult);
    });

    it('should emit onCancel event when calling handleCancel', () => {
        spyOn(comp.cancelForm, 'emit').and.callThrough();
        comp.handleCancel();

        expect(comp.cancelForm.emit).toHaveBeenCalled();
    });

    it('should set isSubmitting to TRUE when request in progress', () => {
        comp.requestStatus = RequestStatusEnum.progress;

        expect(comp.isSubmitting).toBeTruthy();

        comp.requestStatus = RequestStatusEnum.success;

        expect(comp.isSubmitting).toBeFalsy();
    });

    it('should call handleCancel action when request status is success', () => {
        spyOn(comp, 'handleCancel').and.callThrough();

        comp.handleSubmit();
        comp.requestStatus = RequestStatusEnum.success;

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should toggle isRequestingDayCardReasons when daycard reasons request is in progress', () => {
        comp.dayCardReasonsRequestStatus = RequestStatusEnum.progress;

        expect(comp.isRequestingDayCardReasons).toBeTruthy();

        comp.dayCardReasonsRequestStatus = RequestStatusEnum.success;

        expect(comp.isRequestingDayCardReasons).toBeFalsy();
    });

    it('should call handleCancel action when daycard reasons request status failed', () => {
        spyOn(comp, 'handleCancel').and.callThrough();

        comp.dayCardReasonsRequestStatus = RequestStatusEnum.error;

        expect(comp.handleCancel).toHaveBeenCalled();
    });
});
