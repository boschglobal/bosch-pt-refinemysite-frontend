/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MOCK_TASK_SCHEDULE_RESOURCE_A} from '../../../../../test/mocks/task-schedules';
import {
    TaskScheduleLinks,
    TaskScheduleResource
} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntityPermissionEnum} from '../../enums/task-schedule-entity-permission.enum';
import {
    TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER,
    TaskScheduleEntity
} from './task-schedule.entity';

describe('Task Schedule Entity', () => {
    const getTaskScheduleEntityPermissionsFromTaskScheduleLinks = (links: TaskScheduleLinks): TaskScheduleEntityPermissionEnum[] =>
        Object.keys(links)
            .filter(key => !!TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key])
            .map(key => TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key]);

    it('should return a Task Schedule Entity from a Task Schedule Resource', () => {
        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate,
            start, end, task, slots, _links, _embedded,
        } = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const permissions: TaskScheduleEntityPermissionEnum[] = getTaskScheduleEntityPermissionsFromTaskScheduleLinks(_links);
        const expectedTaskScheduleEntity: TaskScheduleEntity = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            start,
            end,
            task,
            slots,
            permissions,
            _embedded,
        }

        expect(TaskScheduleEntity.fromResource(MOCK_TASK_SCHEDULE_RESOURCE_A)).toEqual(expectedTaskScheduleEntity);
    })

    it('should return a Task Schedule Entity from a Task Schedule Resource with the correct permissions when an unknown permission ' +
        'exists in Task Schedule Resource', () => {
        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate,
            start, end, task, slots, _links, _embedded,
        } = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const unknownPermissions: TaskScheduleLinks = {self: {href: ''}, foo: {href: ''}} as TaskScheduleLinks;
        const mockedTaskScheduleResourceWithUnknownLinks: TaskScheduleResource = {
            ...MOCK_TASK_SCHEDULE_RESOURCE_A,
            _links: {..._links, ...unknownPermissions},
        };
        const permissions: TaskScheduleEntityPermissionEnum[] = getTaskScheduleEntityPermissionsFromTaskScheduleLinks(_links);
        const expectedTaskScheduleEntity: TaskScheduleEntity = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            start,
            end,
            task,
            slots,
            permissions,
            _embedded,
        }

        expect(TaskScheduleEntity.fromResource(mockedTaskScheduleResourceWithUnknownLinks)).toEqual(expectedTaskScheduleEntity);
    })
});
