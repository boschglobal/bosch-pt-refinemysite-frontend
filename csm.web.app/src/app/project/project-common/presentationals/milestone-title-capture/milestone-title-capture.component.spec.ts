/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {TranslationModule} from '../../../../shared/translation/translation.module';
import {MilestoneTitleCaptureComponent} from './milestone-title-capture.component';

describe('Milestone Title Capture Component', () => {
    let component: MilestoneTitleCaptureComponent;
    let fixture: ComponentFixture<MilestoneTitleCaptureComponent>;

    const titleInputSelector = '[data-automation="milestone-title-input"]';
    const titleButtonSelector = '[data-automation="milestone-title-button"]';

    const clickEvent: Event = new Event('click');

    const getElement = (selector: string) => fixture.debugElement.query(By.css(selector)).nativeElement;

    const setInputValue = (value: string) => {
        component.form.get('title').setValue(value);
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            MilestoneTitleCaptureComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneTitleCaptureComponent);
        component = fixture.componentInstance;

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should emit submitTitle when form is valid and submit button is pressed', () => {
        spyOn(component.submitTitle, 'emit');
        const expectedValue = 'foo';

        setInputValue(expectedValue);
        fixture.detectChanges();

        getElement(titleButtonSelector).dispatchEvent(clickEvent);

        expect(component.submitTitle.emit).toHaveBeenCalledWith(expectedValue);
    });

    it('should not emit submitTitle when form is invalid and submit button is pressed', () => {
        spyOn(component.submitTitle, 'emit');

        setInputValue('');
        fixture.detectChanges();

        getElement(titleButtonSelector).dispatchEvent(clickEvent);

        expect(component.submitTitle.emit).not.toHaveBeenCalled();
    });

    it('should set max length to 100', () => {
        const expectedValue = '100';
        expect(getElement(titleInputSelector).attributes['maxlength'].value).toBe(expectedValue);
    });

    it('should focus on input when component is initialized', () => {
        expect(getElement(titleInputSelector)).toEqual(document.activeElement);
    });
});
