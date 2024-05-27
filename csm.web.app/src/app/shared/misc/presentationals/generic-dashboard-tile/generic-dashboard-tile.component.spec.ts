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
import {By} from '@angular/platform-browser';

import {LoaderComponent} from '../../../ui/loader/loader.component';
import {GenericDashboardTileComponent} from './generic-dashboard-tile.component';

describe('Generic Dashboard Tile Component', () => {
    let component: GenericDashboardTileComponent;
    let fixture: ComponentFixture<GenericDashboardTileComponent>;
    let de: DebugElement;

    const dataAutomationSelectorCard = '[data-automation="generic-dashboard-tile"]';
    const dataAutomationSelectorStatistic = '[data-automation="generic-dashboard-tile-statistic"]';
    const clickEvent: Event = new Event('click');

    const getNativeElement = (selector: string): HTMLElement =>de.query(By.css(selector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            GenericDashboardTileComponent,
            LoaderComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericDashboardTileComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should emit event when card is clicked', () => {
        spyOn(component.tileClick, 'emit').and.callThrough();
        getNativeElement(dataAutomationSelectorCard).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(component.tileClick.emit).toHaveBeenCalled();
    });

    it('should emit event when statistic is clicked', () => {
        spyOn(component.statisticClick, 'emit').and.callThrough();
        getNativeElement(dataAutomationSelectorStatistic).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(component.statisticClick.emit).toHaveBeenCalled();
    });
});
