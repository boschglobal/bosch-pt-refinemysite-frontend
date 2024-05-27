/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';

import {updateWindowInnerWidth} from '../../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {BREAKPOINTS_RANGE} from '../../../../../shared/ui/constants/breakpoints.constant';
import {ProjectNumberOfWeeksEnum} from '../../../../project-common/enums/project-number-of-weeks.enum';
import {WeekLabelHelper} from './week-label.helper';

describe('WeekLabelHelper', () => {

    let weekLabelHelper: WeekLabelHelper;

    const initialInnerWidth: number = window.innerWidth;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => weekLabelHelper = TestBed.inject(WeekLabelHelper));

    afterAll(() => updateWindowInnerWidth(initialInnerWidth));

    it('should be created', () => {
        expect(weekLabelHelper).toBeTruthy();
    });

    it('should return week number label on extra small screen resolution for month duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.xs.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.month)).toBe('1');
    });

    it('should return week number label on extra small screen resolution for trimester duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.xs.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.trimester)).toBe('1');
    });

    it('should return composed week label and week number label on small screen resolution for month duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.month)).toBe('Generic_Week 1');
    });

    it('should return week number label on small screen resolution for trimester duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.sm.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.trimester)).toBe('1');
    });

    it('should return composed week label and week number label on medium screen resolution for month duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.month)).toBe('Generic_Week 1');
    });

    it('should return week number label on medium screen resolution for trimester duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.md.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.trimester)).toBe('1');
    });

    it('should return composed week label and week number label on large screen resolution for month duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.lg.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.month)).toBe('Generic_Week 1');
    });

    it('should return week number label on large screen resolution for trimester duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.lg.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.trimester)).toBe('1');
    });

    it('should return composed week label and week number label on extra large screen resolution for month duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.xl.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.month)).toBe('Generic_Week 1');
    });

    it('should return week number label on extra large screen resolution for trimester duration', () => {
        updateWindowInnerWidth(BREAKPOINTS_RANGE.xl.max);

        expect(weekLabelHelper.getWeekLabelByResolutionAndDuration(1, ProjectNumberOfWeeksEnum.trimester)).toBe('1');
    });

    it('should return week label followed by week number', () => {
        expect(weekLabelHelper.getWeekLabelExtended(1)).toBe('Generic_Week 1');
    });
});
