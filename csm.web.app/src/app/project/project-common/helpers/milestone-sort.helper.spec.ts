/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA
} from '../../../../test/mocks/milestones';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREA_C
} from '../../../../test/mocks/workareas';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {Milestone} from '../models/milestones/milestone';
import {MilestoneSortHelper} from './milestone-sort.helper';

describe('Milestone Sort Helper', () => {
    const currentDate = moment();

    const milestoneHeader = {...MOCK_MILESTONE_HEADER, date: currentDate.clone()};
    const milestoneWorkarea = {...MOCK_MILESTONE_WORKAREA, date: currentDate.clone()};
    const milestoneWithoutWorkarea = {...MOCK_MILESTONE_CRAFT, date: currentDate.clone()};

    const workareas = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
        MOCK_WORKAREA_C,
    ];
    const milestones = [
        milestoneHeader,
        milestoneWorkarea,
        milestoneWithoutWorkarea,
    ];
    const allHeaderMilestones = [
        {...milestoneHeader, position: 0},
        {...milestoneHeader, position: 1},
        {...milestoneHeader, position: 2},
    ];
    const oneHeaderMilestones = milestones;
    const allSameWorkareaMilestones: Milestone[] = [
        {...milestoneWorkarea, position: 0},
        {...milestoneWorkarea, position: 1},
        {...milestoneWorkarea, position: 2},
    ];
    const allDifferentWorkareaMilestones: Milestone[] = [
        {...milestoneWorkarea, workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name)},
        {...milestoneWorkarea, workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name)},
        {...milestoneWorkarea, workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name)},
    ];
    const oneWorkareaMilestones = milestones;
    const allWithoutWorkareaMilestones: Milestone[] = [
        {...milestoneWithoutWorkarea, position: 0},
        {...milestoneWithoutWorkarea, position: 1},
        {...milestoneWithoutWorkarea, position: 2},
    ];
    const oneWithoutWorkareaMilestones = milestones;
    const allDifferentDatesMilestones = [
        {...milestoneHeader, date: currentDate.clone()},
        {...milestoneWorkarea, date: currentDate.clone().add(1, 'd')},
        {...milestoneWithoutWorkarea, date: currentDate.clone().add(2, 'd')},
    ];
    const oneDifferentDatesMilestones = [
        {...milestoneHeader},
        {...milestoneWorkarea},
        {...milestoneWithoutWorkarea, date: currentDate.clone().subtract(1, 'd')},
    ];

    it('should sort milestones by calendar view by header placement when all milestones are header milestones and ' +
        'date is the same', () => {
        const shiftedResult = [...allHeaderMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(allHeaderMilestones);
    });

    it('should sort milestones by calendar view by header placement when one of the milestones is a header milestones and ' +
        'date is the same', () => {
        const shiftedResult = [...oneHeaderMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(oneHeaderMilestones);
    });

    it('should sort milestones by calendar view by workarea placement when all milestone belong to the same workarea and ' +
        'date is the same', () => {
        const shiftedResult = [...allSameWorkareaMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(allSameWorkareaMilestones);
    });

    it('should sort milestones by calendar view by workarea placement when all milestone belong to different workareas and ' +
        'date is the same', () => {
        const shiftedResult = [...allDifferentWorkareaMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(allDifferentWorkareaMilestones);
    });

    it('should sort milestones by calendar view by workarea placement when one of the milestones is from a workarea and ' +
        'date is the same', () => {
        const shiftedResult = [...oneWorkareaMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(oneWorkareaMilestones);
    });

    it('should sort milestones by calendar view by workarea placement when all milestone do not have workarea and ' +
        'date is the same', () => {
        const shiftedResult = [...allWithoutWorkareaMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(allWithoutWorkareaMilestones);
    });

    it('should sort milestones by calendar view by workarea placement when one of the milestones does not have a workarea and ' +
        'date is the same', () => {
        const shiftedResult = [...oneWithoutWorkareaMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(oneWithoutWorkareaMilestones);
    });

    it('should sort milestones by calendar view when milestones belong to header, workareas and without workareas and ' +
        'date is the same', () => {
        const shiftedResult = [...milestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(milestones);
    });

    it('should sort milestones by calendar view when milestones are all on different dates', () => {
        const shiftedResult = [...allDifferentDatesMilestones].reverse();
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(shiftedResult, workareas);

        expect(sortedMilestones).toEqual(allDifferentDatesMilestones);
    });

    it('should sort milestone by calendar view when one milestone is from a different date', () => {
        const expectedResult = [
            oneDifferentDatesMilestones[2],
            oneDifferentDatesMilestones[0],
            oneDifferentDatesMilestones[1],
        ];
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(oneDifferentDatesMilestones, workareas);

        expect(sortedMilestones).toEqual(expectedResult);
    });

});
