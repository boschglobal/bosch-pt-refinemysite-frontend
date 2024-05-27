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
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {Subject} from 'rxjs';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {ButtonStyle} from '../button/button.component';
import {ModalService} from '../modal/api/modal.service';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogModel,
} from './confirmation-dialog.component';

describe('Confirmation Dialog Component', () => {
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let comp: ConfirmationDialogComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let modalService: ModalService;

    const confirmation: ConfirmationDialogModel = {
        title: 'Day card Done?',
        description: 'Day card Status will change to Done',
        cancelCallback: () => {
        },
        completeCallback: () => {
        },
        confirmCallback: () => {
        },
        requestStatusObservable: new Subject<RequestStatusEnum>(),
        isDestructiveAction: true,
    };

    const dataAutomationSelectorTitle = `[data-automation="confirmation-title"]`;
    const dataAutomationSelectorDescription = `[data-automation="confirmation-description"]`;
    const dataAutomationSelectorCancel = `[data-automation="confirmation-cancel"]`;
    const dataAutomationSelectorConfirm = `[data-automation="confirmation-confirm"]`;

    const clickEvent: Event = new Event('click');
    const getElement = (selector: string): any => el.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslateModule.forRoot()],
        declarations: [ConfirmationDialogComponent],
        providers: [
            {
                provide: ModalService,
                useValue: {
                    close: () => {
                    },
                    currentModalData: confirmation,
                },
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.ngOnInit();
        fixture.detectChanges();

        modalService = TestBed.inject(ModalService);
    });

    it('should render title', () => {
        const expectedResult = confirmation.title;

        expect(getElement(dataAutomationSelectorTitle).textContent.trim()).toBe(expectedResult);
    });

    it('should render description', () => {
        const expectedResult = confirmation.description;

        expect(getElement(dataAutomationSelectorDescription).textContent.trim()).toBe(expectedResult);
    });

    it('should call cancelCallback when cancel button is triggered', () => {
        spyOn(comp.confirmation, 'cancelCallback').and.callThrough();

        getElement(dataAutomationSelectorCancel).dispatchEvent(clickEvent);

        expect(comp.confirmation.cancelCallback).toHaveBeenCalled();
    });

    it('should call completeCallback after confirm button is triggered and request status changes to success', () => {
        spyOn(comp.confirmation, 'completeCallback').and.callThrough();

        getElement(dataAutomationSelectorConfirm).dispatchEvent(clickEvent);

        (confirmation.requestStatusObservable as Subject<RequestStatusEnum>).next(RequestStatusEnum.success);

        expect(comp.confirmation.completeCallback).toHaveBeenCalled();
    });

    it('should call confirmationCallback when confirm button is triggered', () => {
        spyOn(comp.confirmation, 'confirmCallback').and.callThrough();

        getElement(dataAutomationSelectorConfirm).dispatchEvent(clickEvent);

        expect(comp.confirmation.confirmCallback).toHaveBeenCalled();
    });

    it('should call handleCancel after confirm button is triggered and request status changes to error', () => {
        spyOn(comp, 'handleCancel').and.callThrough();

        getElement(dataAutomationSelectorConfirm).dispatchEvent(clickEvent);

        (confirmation.requestStatusObservable as Subject<RequestStatusEnum>).next(RequestStatusEnum.error);

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should emit onClose when handleCancel is called', () => {
        spyOn(comp.onClose, 'emit').and.callThrough();

        comp.handleCancel();

        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should close modal when handleCancel is called', () => {
        spyOn(modalService, 'close').and.callThrough();

        comp.handleCancel();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should set the button style as primary-red when action is destructive', () => {
        const expectedStyle: ButtonStyle = 'primary-red';

        confirmation.isDestructiveAction = true;
        comp.ngOnInit();

        expect(comp.buttonStyle).toBe(expectedStyle);
    });

    it('should set the button style as primary when action is not destructive', () => {
        const expectedStyle: ButtonStyle = 'primary';

        confirmation.isDestructiveAction = false;
        comp.ngOnInit();

        expect(comp.buttonStyle).toBe(expectedStyle);
    });

    it('should return cancel button default message when none is specified', () => {
        comp.confirmation.cancelButtonMessage = null;

        expect(comp.cancelButtonMessage).toBe('Generic_Cancel');
    });

    it('should return cancel button custom message when one is specified', () => {
        const expectedResult = 'Custom_Cancel';
        comp.confirmation.cancelButtonMessage = expectedResult;

        expect(comp.cancelButtonMessage).toBe(expectedResult);
    });

    it('should return confirm button default message when none is specified', () => {
        comp.confirmation.confirmButtonMessage = null;

        expect(comp.confirmButtonMessage).toBe('Generic_Ok');
    });

    it('should return confirm button custom message when one is specified', () => {
        const expectedResult = 'Custom_Confirm';
        comp.confirmation.confirmButtonMessage = expectedResult;

        expect(comp.confirmButtonMessage).toBe(expectedResult);
    });
});
