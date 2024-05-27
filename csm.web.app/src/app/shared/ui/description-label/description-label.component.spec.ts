/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {DescriptionLabelComponent} from './description-label.component';
import {DescriptionLabelTestComponent} from './description-label.test.component';

describe('Description Label Component', () => {
    let testHostComponent: DescriptionLabelTestComponent;
    let fixture: ComponentFixture<DescriptionLabelTestComponent>;
    let de: DebugElement;

    const hostSelector = 'ss-description-label';
    const descriptionLabelTitleSelector = '[data-automation="description-label-title"]';

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            DescriptionLabelComponent,
            DescriptionLabelTestComponent,
        ],
    };

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescriptionLabelTestComponent);
        testHostComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(hostSelector));
    });

    it('should display the title when provided', () => {
        const title = 'Title';

        testHostComponent.title = title;
        fixture.detectChanges();

        expect(getElement(descriptionLabelTitleSelector).innerText.trim()).toBe(title);
    });

    it('should not display the title when not provided', () => {
        testHostComponent.title = null;
        fixture.detectChanges();

        expect(getElement(descriptionLabelTitleSelector)).toBeFalsy();
    });
});
