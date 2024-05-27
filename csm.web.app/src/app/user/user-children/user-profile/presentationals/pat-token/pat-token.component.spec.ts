/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';

import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {PatTokenComponent} from './pat-token.component';

describe('Pat Token Component', () => {
    let component: PatTokenComponent;
    let fixture: ComponentFixture<PatTokenComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            PatTokenComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatTokenComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('it should set PAT token form with empty value by default', () => {
        expect(component.form.value).toEqual({token: ''});
    });

    it('should set a new form value when defaultValue is provided', () => {
        const newValue = 'newValue';

        component.defaultValue = newValue;

        expect(component.form.value).toEqual({token: newValue});
    });

    it(`should copy token to clipboard and emit copied event when handleCopy is called`, fakeAsync(() => {
        spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
        spyOn(component.copiedToClipboard, 'emit').and.callThrough();

        const newValue = 'newValue';

        component.defaultValue = newValue;
        component.handleCopy();

        tick(1);

        expect(component.copiedToClipboard.emit).toHaveBeenCalled();
    }));
});
