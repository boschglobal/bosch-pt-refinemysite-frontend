/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {By} from '@angular/platform-browser';

import {TranslationModule} from '../../translation/translation.module';
import {ToolbarComponent} from './toolbar.component';
import {ToolbarTestComponent} from './toolbar.test.component';

describe('ToolbarComponent', () => {
    let component: ToolbarTestComponent;
    let fixture: ComponentFixture<ToolbarTestComponent>;
    let testHostComp: ToolbarTestComponent;
    let de: DebugElement;

    const toolbarSelector = 'ss-toolbar';
    const dataAutomationTitleSelector = '[data-automation="toolbar-title"]';
    const dataAutomationMappingsTemplateSelector = '[data-automation="toolbar-mappings-template"]';
    const dataAutomationActionsTemplateSelector = '[data-automation="toolbar-actions-template"]';

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule.forRoot()
        ],
        declarations: [
            ToolbarComponent,
            ToolbarTestComponent
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolbarTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(toolbarSelector));
        component = de.componentInstance;
        testHostComp.toolbarTitle = 'Projects';
        fixture.detectChanges();
    });

    it('should render mappings and actions contents', () => {
        const mappingsTemplateTextContent = de.query(By.css(dataAutomationMappingsTemplateSelector)).nativeElement.textContent;
        const actionsTemplateTextContent = de.query(By.css(dataAutomationActionsTemplateSelector)).nativeElement.textContent;
        expect(component).toBeTruthy();
        expect(mappingsTemplateTextContent).toBe('Mappings');
        expect(actionsTemplateTextContent).toBe('Actions');
    });

    it('should render toolbar title', () => {
        const titleTextContent = de.query(By.css(dataAutomationTitleSelector)).nativeElement.textContent;
        expect(component).toBeTruthy();
        expect(titleTextContent).toBe('Projects');
    });
});
