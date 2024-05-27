/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {TranslateService} from '@ngx-translate/core';

import {
    TaskShiftAmountMode,
    TaskShiftAmountPipe,
    TaskShiftAmountSignalIndicator,
    TaskShiftAmountUnit,
} from './task-shift-amount.pipe';

interface TaskShiftAmountTestCaseConfig {
    expectedKey: string;
    amount: number;
    signalIndicator: TaskShiftAmountSignalIndicator;
    mode: TaskShiftAmountMode;
    unit: TaskShiftAmountUnit;
}

describe('Task Shift Amount Pipe', () => {
    let pipe: TaskShiftAmountPipe;

    const translateService: jasmine.SpyObj<TranslateService> = jasmine.createSpyObj('TranslateService', ['instant']);
    const testCaseConfigs: TaskShiftAmountTestCaseConfig[] = [
        {expectedKey: 'TaskShift_Copy', amount: 0, signalIndicator: null, mode: 'copy', unit: 'day'},
        {expectedKey: 'TaskShift_Copy_Day', amount: -1, signalIndicator: '-', mode: 'copy', unit: 'day'},
        {expectedKey: 'TaskShift_Copy_Day', amount: 1, signalIndicator: '+', mode: 'copy', unit: 'day'},
        {expectedKey: 'TaskShift_Copy_Days', amount: -2, signalIndicator: '-', mode: 'copy', unit: 'day'},
        {expectedKey: 'TaskShift_Copy_Days', amount: 2, signalIndicator: '+', mode: 'copy', unit: 'day'},
        {expectedKey: 'TaskShift_Copy', amount: 0, signalIndicator: null, mode: 'copy', unit: 'week'},
        {expectedKey: 'TaskShift_Copy_Week', amount: -1, signalIndicator: '-', mode: 'copy', unit: 'week'},
        {expectedKey: 'TaskShift_Copy_Week', amount: 1, signalIndicator: '+', mode: 'copy', unit: 'week'},
        {expectedKey: 'TaskShift_Copy_Weeks', amount: -2, signalIndicator: '-', mode: 'copy', unit: 'week'},
        {expectedKey: 'TaskShift_Copy_Weeks', amount: 2, signalIndicator: '+', mode: 'copy', unit: 'week'},
        {expectedKey: 'TaskShift_Move', amount: 0, signalIndicator: null, mode: 'move', unit: 'day'},
        {expectedKey: 'TaskShift_Move_Day', amount: -1, signalIndicator: '-', mode: 'move', unit: 'day'},
        {expectedKey: 'TaskShift_Move_Day', amount: 1, signalIndicator: '+', mode: 'move', unit: 'day'},
        {expectedKey: 'TaskShift_Move_Days', amount: -2, signalIndicator: '-', mode: 'move', unit: 'day'},
        {expectedKey: 'TaskShift_Move_Days', amount: 2, signalIndicator: '+', mode: 'move', unit: 'day'},
        {expectedKey: 'TaskShift_Move', amount: 0, signalIndicator: null, mode: 'move', unit: 'week'},
        {expectedKey: 'TaskShift_Move_Week', amount: -1, signalIndicator: '-', mode: 'move', unit: 'week'},
        {expectedKey: 'TaskShift_Move_Week', amount: 1, signalIndicator: '+', mode: 'move', unit: 'week'},
        {expectedKey: 'TaskShift_Move_Weeks', amount: -2, signalIndicator: '-', mode: 'move', unit: 'week'},
        {expectedKey: 'TaskShift_Move_Weeks', amount: 2, signalIndicator: '+', mode: 'move', unit: 'week'},
        {expectedKey: 'TaskShift_Resize', amount: 0, signalIndicator: null, mode: 'resize', unit: 'day'},
        {expectedKey: 'TaskShift_Resize_DayNegative', amount: -1, signalIndicator: '-', mode: 'resize', unit: 'day'},
        {expectedKey: 'TaskShift_Resize_DayPositive', amount: 1, signalIndicator: '+', mode: 'resize', unit: 'day'},
        {expectedKey: 'TaskShift_Resize_DaysNegative', amount: -2, signalIndicator: '-', mode: 'resize', unit: 'day'},
        {expectedKey: 'TaskShift_Resize_DaysPositive', amount: 2, signalIndicator: '+', mode: 'resize', unit: 'day'},
        {expectedKey: 'TaskShift_Resize', amount: 0, signalIndicator: null, mode: 'resize', unit: 'week'},
        {expectedKey: 'TaskShift_Resize_WeekNegative', amount: -1, signalIndicator: '-', mode: 'resize', unit: 'week'},
        {expectedKey: 'TaskShift_Resize_WeekPositive', amount: 1, signalIndicator: '+', mode: 'resize', unit: 'week'},
        {expectedKey: 'TaskShift_Resize_WeeksNegative', amount: -2, signalIndicator: '-', mode: 'resize', unit: 'week'},
        {expectedKey: 'TaskShift_Resize_WeeksPositive', amount: 2, signalIndicator: '+', mode: 'resize', unit: 'week'},
    ];

    beforeEach(() => {
        pipe = new TaskShiftAmountPipe(translateService);
        translateService.instant.and.callFake((key: string) => key);
        translateService.instant.calls.reset();
    });

    testCaseConfigs.forEach(({expectedKey, amount, mode, signalIndicator, unit}) => {
        it(`should return "${expectedKey}" when amount is ${amount}, mode is "${mode}" and unit is "${unit}"`, () => {
            const expectedTranslationParams = {amount: Math.abs(amount), signalIndicator};

            expect(pipe.transform(amount, mode, unit)).toBe(expectedKey);
            expect(translateService.instant).toHaveBeenCalledWith(expectedKey, expectedTranslationParams);
        });
    });
});
