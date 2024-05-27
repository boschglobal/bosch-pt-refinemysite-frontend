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

import {MOCK_TABS} from '../../../../test/mocks/tab-panels';
import {TranslationModule} from '../../translation/translation.module';
import {TabPanelComponent} from './tab-panel/tab-panel.component';
import {TabPanelsTestComponent} from './tab-panels.test.component';
import {TabPanelsComponent} from './tab-panels/tab-panels.component';

describe('Tab Panels Component', () => {

    let testHostComp: TabPanelsTestComponent;
    let fixture: ComponentFixture<TabPanelsTestComponent>;
    let comp: TabPanelsComponent;
    let de: DebugElement;
    let tabPanelsHeaderAnchorElements: HTMLElement[];
    let tabPanelsHeaderElements: HTMLElement[];
    let tabPanelsContentElement: HTMLElement;

    const clickEvent: Event = new Event('click');

    const tabPanelsSelector = 'ss-tab-panels';
    const dataAutomationTabContentSelector = '[data-automation="tab-panels-content"]';
    const alignRightClass = 'ss-tab-panels__navigation-item--right';
    const alignLeftClass = 'ss-tab-panels__navigation-item--left';
    const rightHeaderIndex = 0;
    const leftHeaderIndex = 1;

    function getDataAutomationTabHeaderSelector(tabIndex: number): string {
        return `[data-automation="tab-panels-${tabIndex}"]`;
    }

    function getTabHeaderAnchorSelector(tabIndex: number): string {
        return `${getDataAutomationTabHeaderSelector(tabIndex)} button`;
    }

    function getTabPanelsElements(selectorFunction: Function): HTMLElement[] {
        return MOCK_TABS.map((tab, tabIndex) => de.query(By.css(selectorFunction(tabIndex))).nativeElement);
    }

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TabPanelsComponent,
            TabPanelComponent,
            TabPanelsTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TabPanelsTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(tabPanelsSelector));
        testHostComp.tabs = MOCK_TABS;
        comp = de.componentInstance;
        fixture.detectChanges();

        tabPanelsHeaderAnchorElements = getTabPanelsElements(getTabHeaderAnchorSelector);
        tabPanelsHeaderElements = getTabPanelsElements(getDataAutomationTabHeaderSelector);
        tabPanelsContentElement = de.query(By.css(dataAutomationTabContentSelector)).nativeElement;
    });

    it('should open a tab when clicking in it\'s header', () => {
        tabPanelsHeaderAnchorElements[rightHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[rightHeaderIndex].title);
    });

    it('should close an open tab when clicking in other tab header', () => {
        tabPanelsHeaderAnchorElements[rightHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[rightHeaderIndex].title);

        tabPanelsHeaderAnchorElements[leftHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[leftHeaderIndex].title);
    });

    it('should close an open tab when clicking in it\'s header', () => {
        tabPanelsHeaderAnchorElements[rightHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[rightHeaderIndex].title);

        tabPanelsHeaderAnchorElements[rightHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe('');
    });

    it('should close an open tab when externally called to do so', () => {
        tabPanelsHeaderAnchorElements[rightHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[rightHeaderIndex].title);

        comp.handleClose(MOCK_TABS[rightHeaderIndex].id);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe('');
    });

    it('should close any open tab when externally called to do so', () => {
        tabPanelsHeaderAnchorElements[leftHeaderIndex].dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[leftHeaderIndex].title);

        comp.handleCloseAll();
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe('');
    });

    it('should open a tab when externally called to do so', () => {
        comp.handleOpen(MOCK_TABS[rightHeaderIndex].id);
        fixture.detectChanges();
        expect(tabPanelsContentElement.textContent.trim()).toBe(MOCK_TABS[rightHeaderIndex].title);
    });

    it('should align header according to the alignment information provided', () => {
        expect(tabPanelsHeaderElements[rightHeaderIndex].attributes['class'].value).toContain(alignRightClass);
        expect(tabPanelsHeaderElements[leftHeaderIndex].attributes['class'].value).toContain(alignLeftClass);
    });

    it('should not emit onTogglePanel when handleClose is called without tabbs', () => {
        spyOn(comp.onTogglePanel, 'emit').and.callThrough();

        comp.tabs = null;

        comp.handleClose('123');

        expect(comp.onTogglePanel.emit).not.toHaveBeenCalled();
    });

    it('should not emit onTogglePanel when handleClose is called without tabbs', () => {
        spyOn(comp.onTogglePanel, 'emit').and.callThrough();

        comp.tabs = null;

        comp.handleOpen('123');

        expect(comp.onTogglePanel.emit).not.toHaveBeenCalled();
    });
});
