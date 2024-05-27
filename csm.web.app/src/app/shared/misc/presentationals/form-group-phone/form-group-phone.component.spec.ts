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
    ReactiveFormsModule,
    UntypedFormControl
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {UIModule} from '../../../ui/ui.module';
import {
    FormGroupPhoneComponent,
    FormGroupPhoneValueInterface
} from './form-group-phone.component';

describe('Form Group Phone Component', () => {
    let fixture: ComponentFixture<FormGroupPhoneComponent>;
    let comp: FormGroupPhoneComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationRemovePhoneSelector = '[data-automation="remove-phone"]';

    const controlIndex = 0;

    const defaultPhoneNumbers: FormGroupPhoneValueInterface[] = [
        {
            type: 'FAX',
            countryCode: '+44',
            number: '123456789'
        },
        {
            type: 'MOBILE',
            countryCode: '+351',
            number: '910414293'
        }
    ];

    const errorPhoneNumbers: FormGroupPhoneValueInterface[] = [
        {
            type: 'FAX',
            countryCode: '1234567890',
            number: '123456789012345678901234567890'
        }
    ];

    const validPhoneNumbers: FormGroupPhoneValueInterface[] = [
        {
            type: 'FAX',
            countryCode: '+1',
            number: '123456789'
        },
        {
            type: 'MOBILE',
            countryCode: '+49',
            number: '910414293'
        },
        {
            type: 'FAX',
            countryCode: '+351',
            number: '910414293'
        },
        {
            type: 'MOBILE',
            countryCode: '+3510',
            number: '910414293'
        },
    ];

    const getElement = (element: string): Element => el.querySelector(element);

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            FormGroupPhoneComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FormGroupPhoneComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should set form after on init', () => {
        expect(comp.form).toBeUndefined();

        comp.ngOnInit();

        expect(comp.form).toBeDefined();
    });

    it('should set form with default values', () => {
        comp.defaultPhones = defaultPhoneNumbers;
        comp.ngOnInit();

        comp.getPhoneControls.forEach((control: UntypedFormControl, key: number) =>
            expect(control.value).toEqual(defaultPhoneNumbers[key]));
    });

    it('should remove phone', () => {
        comp.defaultPhones = defaultPhoneNumbers;
        comp.ngOnInit();

        fixture.detectChanges();

        expect(comp.getPhoneControls.length).toBe(defaultPhoneNumbers.length);

        getElement(dataAutomationRemovePhoneSelector).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(comp.getPhoneControls.length).toBe(defaultPhoneNumbers.length - 1);
    });

    it('should set errors', () => {
        comp.defaultPhones = errorPhoneNumbers;
        comp.ngOnInit();

        fixture.detectChanges();

        comp.updateValidators(controlIndex);

        expect(comp.getPhoneControls[controlIndex].valid).toBe(false);
    });

    it('should unset errors', () => {
        comp.defaultPhones = null;
        comp.ngOnInit();

        fixture.detectChanges();

        comp.updateValidators(controlIndex);

        expect(comp.getPhoneControls[controlIndex].valid).toBe(true);
    });

    it('should support phone numbers with a country code with a + followed by 1 digit ranging from [1-9] and 3 or less digits ranging from [0-9]', () => {
        comp.defaultPhones = validPhoneNumbers;
        comp.ngOnInit();

        fixture.detectChanges();

        comp.updateValidators(controlIndex);

        expect(comp.getPhoneControls[controlIndex].valid).toBe(true);
    });
});
