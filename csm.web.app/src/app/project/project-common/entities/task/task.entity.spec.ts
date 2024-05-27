/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MOCK_TASK_RESOURCE} from '../../../../../test/mocks/tasks';
import {
    TaskLinks,
    TaskResource,
} from '../../api/tasks/resources/task.resource';
import {TaskEntityPermissionEnum} from '../../enums/task-entity-permission.enum';
import {
    TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER,
    TaskEntity,
    TaskEntityEmbeddeds,
    TaskEntityProjectCraft
} from './task.entity';

describe('Task Entity', () => {

    const getTaskEntityPermissionsFromTaskLinks = (links: TaskLinks): TaskEntityPermissionEnum[] =>
        Object
            .keys(links)
            .filter(key => !!TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key])
            .map(key => TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key]);

    it('should return a Task Entity from a Task Resource', () => {
        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate, project, name, description, creator, company,
            location, projectCraft: {id: projectCraftId, name: projectCraftName, color: projectCraftColor}, workArea, assignee, status,
            issue, assigned, editDate, _links, _embedded: {constraints, attachments, statistics},
        } = MOCK_TASK_RESOURCE;
        const permissions: TaskEntityPermissionEnum[] = getTaskEntityPermissionsFromTaskLinks(_links);
        const projectCraft: TaskEntityProjectCraft = {id: projectCraftId, name: projectCraftName, color: projectCraftColor};
        const _embedded: TaskEntityEmbeddeds = {constraints, attachments, statistics};
        const expectedTaskEntity: TaskEntity = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            description,
            creator,
            company,
            location,
            projectCraft,
            workArea,
            assignee,
            status,
            issue,
            assigned,
            editDate,
            permissions,
            _embedded,
        };

        expect(TaskEntity.fromResource(MOCK_TASK_RESOURCE)).toEqual(expectedTaskEntity);
    });

    it('should return a Task Entity from a Task Resource with the correct permissions when an unknown permission ' +
        'exists in Task Resource', () => {
        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate, project, name, description, creator, company,
            location, projectCraft: {id: projectCraftId, name: projectCraftName, color: projectCraftColor}, workArea, assignee, status,
            issue, assigned, editDate, _links, _embedded: {constraints, attachments, statistics},
        } = MOCK_TASK_RESOURCE;
        const unknownPermissions: TaskLinks = {foo: {href: ''}} as TaskLinks;
        const mockedTaskWithUnknownLinks: TaskResource = {...MOCK_TASK_RESOURCE, _links: {..._links, ...unknownPermissions}};
        const permissions: TaskEntityPermissionEnum[] = getTaskEntityPermissionsFromTaskLinks(_links);
        const projectCraft: TaskEntityProjectCraft = {id: projectCraftId, name: projectCraftName, color: projectCraftColor};
        const _embedded: TaskEntityEmbeddeds = {constraints, attachments, statistics};
        const expectedTaskEntity: TaskEntity = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            description,
            creator,
            company,
            location,
            projectCraft,
            workArea,
            assignee,
            status,
            issue,
            assigned,
            editDate,
            permissions,
            _embedded,
        };

        expect(TaskEntity.fromResource(mockedTaskWithUnknownLinks)).toEqual(expectedTaskEntity);
    });
});
