/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MOCK_MILESTONE_CRAFT} from '../../../../test/mocks/milestones';
import {MOCK_RELATION_RESOURCE_1} from '../../../../test/mocks/relations';
import {MOCK_TASK} from '../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../test/mocks/workareas';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {RelationWithResource} from '../models/relation-with-resource/relation-with-resource';
import {CalendarViewItemsSortHelper} from './calendar-view-items-sort.helper';
import {DependenciesSortHelper} from './dependencies-sort.helper';

describe('Dependencies Sort Helper', () => {

    const workareas: WorkareaResource[] = [
        MOCK_WORKAREA_B,
    ];

    it('should sort tasks and milestones for dependencies list using the calendar view items sort', () => {
        const expectedResult = [
            RelationWithResource.fromRelationAndResource(MOCK_TASK, MOCK_RELATION_RESOURCE_1, ObjectTypeEnum.Task),
            RelationWithResource.fromRelationAndResource(MOCK_MILESTONE_CRAFT, MOCK_RELATION_RESOURCE_1, ObjectTypeEnum.Milestone),
        ];
        const shiftedResult = [...expectedResult].reverse();

        spyOn(CalendarViewItemsSortHelper, 'sort').and.returnValue(expectedResult);

        expect(DependenciesSortHelper.sort(shiftedResult, workareas)).toEqual(expectedResult);
    });
});
