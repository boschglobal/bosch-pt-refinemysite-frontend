/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SaveTaskScheduleResource} from '../../app/project/project-common/api/tasks/resources/save-task-schedule.resource';
import {
    TaskScheduleResource,
    TaskScheduleSlotResource
} from '../../app/project/project-common/api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../app/project/project-common/entities/task-schedule/task-schedule.entity';
import {TaskSchedule} from '../../app/project/project-common/models/task-schedules/task-schedule';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_RESOURCE_A,
} from './day-cards';

export const MOCK_SCHEDULE_ITEM_A: TaskScheduleSlotResource = {
    dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.title),
    date: MOCK_DAY_CARD_A.date,
};

export const MOCK_TASK_SCHEDULE_RESOURCE_A: TaskScheduleResource = {
    id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f05',
    start: '2018-12-10',
    end: '2018-12-16',
    createdBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    createdDate: new Date().toISOString(),
    lastModifiedBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    lastModifiedDate: new Date().toISOString(),
    task: new ResourceReference('foo', 'Do something!'),
    slots: [MOCK_SCHEDULE_ITEM_A],
    version: 0,
    _links: {
        self: {href: ''},
        add: {href: ''},
        move: {href: ''},
        'delete': {href: ''},
        update: {href: ''},
    },
    _embedded: {
        dayCards: {
            items: [MOCK_DAY_CARD_RESOURCE_A]
        }
    }
};
export const MOCK_TASK_SCHEDULE_ENTITY_A: TaskScheduleEntity = TaskScheduleEntity.fromResource(MOCK_TASK_SCHEDULE_RESOURCE_A);

export const MOCK_TASK_SCHEDULE_A = TaskSchedule.fromTaskScheduleEntity(MOCK_TASK_SCHEDULE_ENTITY_A);

export const MOCK_TASK_SCHEDULE_RESOURCE_B: TaskScheduleResource = {
    id: 'e7cc1490-c72e-0ebe-d429-dasd786876asd',
    start: '2018-12-10',
    end: '2018-12-16',
    createdBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    createdDate: new Date().toISOString(),
    lastModifiedBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    lastModifiedDate: new Date().toISOString(),
    task: new ResourceReference('2', 'Do something!'),
    slots: [MOCK_SCHEDULE_ITEM_A],
    version: 0,
    _links: {
        self: {href: ''},
        add: {href: ''},
        move: {href: ''},
        'delete': {href: ''},
        update: {href: ''},
    },
    _embedded: {
        dayCards: {
            items: [MOCK_DAY_CARD_RESOURCE_A]
        }
    }
};

export const MOCK_TASK_SCHEDULE_ENTITY_B: TaskScheduleEntity = TaskScheduleEntity.fromResource(MOCK_TASK_SCHEDULE_RESOURCE_B);

export const MOCK_TASK_SCHEDULE_B = TaskSchedule.fromTaskScheduleEntity(MOCK_TASK_SCHEDULE_ENTITY_B);

export const MOCK_TASK_SCHEDULE_WITHOUT_SLOTS: TaskScheduleResource = {
    id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f06',
    start: '2018-12-10',
    end: '2018-12-16',
    createdBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    createdDate: new Date().toISOString(),
    lastModifiedBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    lastModifiedDate: new Date().toISOString(),
    task: new ResourceReference('foo3', 'Do something!'),
    slots: null,
    version: 0,
    _links: {
        self: {href: ''},
        add: {href: ''},
        move: {href: ''},
        'delete': {href: ''},
        update: {href: ''},
    },
    _embedded: {
        dayCards: {
            items: []
        }
    }
};

export const MOCK_TASK_SCHEDULE_WITHOUT_SLOTS2: TaskScheduleResource = {
    id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f06',
    start: '2018-12-10',
    end: '2018-12-16',
    createdBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    createdDate: new Date().toISOString(),
    lastModifiedBy: new ResourceReference('e7cc1490-c72e-0ebe-d429-bc34638e8f04', 'Daniel Rodrigues'),
    lastModifiedDate: new Date().toISOString(),
    task: new ResourceReference('foo3', 'Do something!'),
    slots: null,
    version: 0,
    _links: {
        self: {href: ''},
        add: {href: ''},
        move: {href: ''},
        'delete': {href: ''},
        update: {href: ''},
    },
    _embedded: {
        dayCards: {
            items: []
        }
    }
};

export const MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS: TaskScheduleEntity = TaskScheduleEntity.fromResource(MOCK_TASK_SCHEDULE_WITHOUT_SLOTS);

export const MOCK_SAVE_TASK_SCHEDULE_A: SaveTaskScheduleResource = {
    start: new Date(),
    end: new Date(),
    slots: []
};

export const MOCK_TASK_SCHEDULE_RESOURCES: TaskScheduleResource[] = [MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_B];
