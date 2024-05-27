/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {WorkDaysResource} from '../../app/project/project-common/api/work-days/resources/work-days.resource';
import {UpdateWorkDaysPayload} from '../../app/project/project-common/store/work-days/work-days.actions';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {WeekDaysEnum} from '../../app/shared/misc/enums/weekDays.enum';

export const MOCK_WORK_DAYS: WorkDaysResource = {
    allowWorkOnNonWorkingDays: true,
    createdBy: new ResourceReferenceWithPicture('gf3r5v-dt3g-ss4g-dff4g-gfg5ghw34tg54', 'Bob Baumeister', ''),
    createdDate: '2022-12-01T00:00:00.000Z',
    holidays: [
        {
            name: 'holiday1',
            date: '2023-01-01',
        },
        {
            name: 'holiday2',
            date: '2023-05-01',
        },
    ],
    id: 'gf3r5v-dt3g-ss4g-dff4g-gfg5ghw34tg53',
    lastModifiedBy: new ResourceReference('gf3r5v-dt3g-ss4g-dff4g-gfg5ghw34tg54', 'Bob Baumeister'),
    lastModifiedDate: '2022-12-16T00:00:00.000Z',
    startOfWeek: WeekDaysEnum.MONDAY,
    version: 20,
    workingDays: [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY, WeekDaysEnum.WEDNESDAY, WeekDaysEnum.THURSDAY, WeekDaysEnum.FRIDAY],
};

export const MOCK_UPDATE_WORK_DAYS_PAYLOAD: UpdateWorkDaysPayload = {
    allowWorkOnNonWorkingDays: true,
    holidays: [
        {
            name: 'holiday1',
            date: '2023-01-01',
        },
        {
            name: 'holiday2',
            date: '2023-05-01',
        },
    ],
    startOfWeek: WeekDaysEnum.MONDAY,
    workingDays: [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY, WeekDaysEnum.WEDNESDAY, WeekDaysEnum.THURSDAY, WeekDaysEnum.FRIDAY],
};
