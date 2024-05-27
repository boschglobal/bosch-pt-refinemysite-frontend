/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCardComponent} from './project-card.component';

describe('Project Card Component', () => {
    let fixture: ComponentFixture<ProjectCardComponent>;
    let comp: ProjectCardComponent;
    let de: DebugElement;

    const MOCK_CARD_TITLE = 'Generic_Contact';

    const dataAutomationTitleSelector = '[data-automation="project-card-title"]';

    const getHeaderElement = () => de.query(By.css(dataAutomationTitleSelector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot()
        ],
        declarations: [ProjectCardComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCardComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.title = MOCK_CARD_TITLE;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should have header with title', () => {
        const header = getHeaderElement();
        expect(header.textContent).toBe(MOCK_CARD_TITLE);
    });
});
