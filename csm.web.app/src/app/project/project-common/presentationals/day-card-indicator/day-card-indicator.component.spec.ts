/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
    DAY_CARD_INDICATORS_ICON,
    DAY_CARD_STATUS_EMPTY,
    DAY_CARD_STATUS_UNAVAILABLE
} from '../../constants/day-card-indicators-icon.constant';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {DayCardIndicatorComponent} from './day-card-indicator.component';

describe('Day Card Indicator Component', () => {
    let fixture: ComponentFixture<DayCardIndicatorComponent>;
    let comp: DayCardIndicatorComponent;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [],
        declarations: [DayCardIndicatorComponent],
        providers: []
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardIndicatorComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should render "unavailable" icon by default', () => {
        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DAY_CARD_STATUS_UNAVAILABLE].name);
    });

    it('should render "not done" icon when status is "not done"', () => {
        comp.status = DayCardStatusEnum.NotDone;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DayCardStatusEnum.NotDone].name);
    });

    it('should render "done" icon when status is "done"', () => {
        comp.status = DayCardStatusEnum.Done;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DayCardStatusEnum.Done].name);
    });

    it('should render "approved" icon when status is "approved"', () => {
        comp.status = DayCardStatusEnum.Approved;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DayCardStatusEnum.Approved].name);
    });

    it('should render "open" icon when status is "open"', () => {
        comp.status = DayCardStatusEnum.Open;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DayCardStatusEnum.Open].name);
    });

    it('should render "unavailable" icon when status is "unavailable"', () => {
        comp.status = DAY_CARD_STATUS_UNAVAILABLE;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DAY_CARD_STATUS_UNAVAILABLE].name);
    });

    it('should render "empty" icon when status is "empty"', () => {
        comp.status = DAY_CARD_STATUS_EMPTY;
        fixture.detectChanges();

        expect(comp.icon.name).toBe(DAY_CARD_INDICATORS_ICON[DAY_CARD_STATUS_EMPTY].name);
    });
});
