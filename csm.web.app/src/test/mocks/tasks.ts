/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AttachmentListResource} from '../../app/project/project-common/api/attachments/resources/attachment-list.resource';
import {SaveCopyTaskResource} from '../../app/project/project-common/api/tasks/resources/save-copy-task.resource';
import {
    SaveTaskResource,
    SaveTaskResourceWithVersions
} from '../../app/project/project-common/api/tasks/resources/save-task.resource';
import {SaveTaskFileResource} from '../../app/project/project-common/api/tasks/resources/save-task-file.resource';
import {TaskResource} from '../../app/project/project-common/api/tasks/resources/task.resource';
import {ProjectTaskListResource} from '../../app/project/project-common/api/tasks/resources/task-list.resource';
import {TaskEntity} from '../../app/project/project-common/entities/task/task.entity';
import {TaskStatusEnum} from '../../app/project/project-common/enums/task-status.enum';
import {Task} from '../../app/project/project-common/models/tasks/task';
import {AlertMessageResource} from '../../app/shared/alert/api/resources/alert-message.resource';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {GenderEnum} from '../../app/shared/misc/enums/gender.enum';
import {RequestStatusEnum} from '../../app/shared/misc/enums/request-status.enum';
import {MOCK_ATTACHMENT_1} from './attachments';
import {MOCK_PROJECT_CRAFT_A} from './crafts';
import {MOCK_TASK_CONSTRAINTS_RESOURCE} from './task-constraints';
import {
    MOCK_TASK_SCHEDULE_A,
    MOCK_TASK_SCHEDULE_B,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B
} from './task-schedules';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B
} from './workareas';

export const MOCK_TASK_RESOURCE: TaskResource = {
    id: 'foo',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    assignee: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        delete: {
            href: 'delete',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
        constraints: MOCK_TASK_CONSTRAINTS_RESOURCE,
    },
};

export const MOCK_TASK_ENTITY = TaskEntity.fromResource(MOCK_TASK_RESOURCE);
export const MOCK_TASK = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

export const MOCK_TASK_RESOURCE_WITH_WA: TaskResource = {
    id: 'foo',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    assignee: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name),
    issue: false,
    version: 1,
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        delete: {
            href: 'delete',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
        constraints: MOCK_TASK_CONSTRAINTS_RESOURCE,
    },
};

export const MOCK_TASK_ENTITY_WITH_WORKAREA = TaskEntity.fromResource(MOCK_TASK_RESOURCE_WITH_WA);
export const MOCK_TASK_WITH_WORKAREA = Task.fromTaskEntity(MOCK_TASK_ENTITY_WITH_WORKAREA, MOCK_TASK_SCHEDULE_A);

export const MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE: TaskResource = {
    id: 'fd514020-7e7c-43cf-b755-24bb54a2c9c3',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    assignee: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_WITHOUT_SCHEDULE = TaskEntity.fromResource(MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE);
export const MOCK_TASK_WITHOUT_SCHEDULE = Task.fromTaskEntity(MOCK_TASK_ENTITY_WITHOUT_SCHEDULE, undefined);

export const MOCK_TASK_RESOURCE_NOT_ASSIGNED: TaskResource = {
    id: '2',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: false,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_B,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_NOT_ASSIGNED = TaskEntity.fromResource(MOCK_TASK_RESOURCE_NOT_ASSIGNED);
export const MOCK_TASK_NOT_ASSIGNED = Task.fromTaskEntity(MOCK_TASK_ENTITY_NOT_ASSIGNED, MOCK_TASK_SCHEDULE_B);

export const MOCK_TASK_RESOURCE_NOT_ASSIGNED_WITH_WA: TaskResource = {
    id: '2',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: false,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name),
    version: 1,
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_B,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_NOT_ASSIGNED_WITH_WA = TaskEntity.fromResource(MOCK_TASK_RESOURCE_NOT_ASSIGNED_WITH_WA);
export const MOCK_TASK_NOT_ASSIGNED_WITH_WA = Task.fromTaskEntity(MOCK_TASK_ENTITY_NOT_ASSIGNED_WITH_WA, MOCK_TASK_SCHEDULE_B);

export const MOCK_TASK_RESOURCE_2: TaskResource = {
    id: '123',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    assignee: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name),
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_B,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_2 = TaskEntity.fromResource(MOCK_TASK_RESOURCE_2);
export const MOCK_TASK_2 = Task.fromTaskEntity(MOCK_TASK_ENTITY_2, MOCK_TASK_SCHEDULE_B);

export const MOCK_TASK_RESOURCE_3: TaskResource = {
    id: '345',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    assignee: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name),
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_3 = TaskEntity.fromResource(MOCK_TASK_RESOURCE_3);
export const MOCK_TASK_3 = Task.fromTaskEntity(MOCK_TASK_ENTITY_3, MOCK_TASK_SCHEDULE_A);

export const MOCK_TASK_RESOURCE_4: TaskResource = {
    id: '678',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name),
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        attachments: {
            attachments: [MOCK_ATTACHMENT_1],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_4 = TaskEntity.fromResource(MOCK_TASK_RESOURCE_4);
export const MOCK_TASK_4 = Task.fromTaskEntity(MOCK_TASK_ENTITY_4, MOCK_TASK_SCHEDULE_A);

export const MOCK_TASK_1: any = {
    id: '1',
    requestStatus: RequestStatusEnum.success,
    permissions: {
        canAssignProjectTask: false,
        canSendProjectTask: false,
    },
};

export const MOCK_TASK_SERVICE: any = {
    id: '1',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    assignee: new ResourceReference('6ccc8f21-42a7-25e3-77de-d213c23a796c', 'Jon Doe'),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    _links: {
        self: {
            href: 'self',
        },
        assign: {
            href: 'assign',
        },
        raise: {
            href: 'raise',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
    },
    _embedded: {
        attachments: {
            attachments: [],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_RESOURCE_SERVICE_WT_LOCATION: any = {
    id: '1',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done',
    assigned: true,
    status: TaskStatusEnum.OPEN,
    projectCraft: MOCK_PROJECT_CRAFT_A,
    assignee: new ResourceReference('6ccc8f21-42a7-25e3-77de-d213c23a796c', 'Jon Doe'),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    _links: {
        self: {
            href: 'self',
        },
        assign: {
            href: 'assign',
        },
        raise: {
            href: 'raise',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
    },
    _embedded: {
        attachments: {
            attachments: [],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_TASK_ENTITY_SERVICE_WT_LOCATION = TaskEntity.fromResource(MOCK_TASK_RESOURCE_SERVICE_WT_LOCATION);
export const MOCK_TASK_SERVICE_WT_LOCATION = Task.fromTaskEntity(MOCK_TASK_ENTITY_SERVICE_WT_LOCATION, MOCK_TASK_SCHEDULE_A);

export const MOCK_PARSED_TASKS: any[] = [
    {
        id: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
        project: {
            id: 'eeb28b69-4e17-8d22-952b-f92a025a8921',
            displayName: 'Foo',
        },
        name: 'Contsruction',
        description: 'Description',
        location: 'Evertywhere',
        user: {
            displayName: 'José',
            gender: GenderEnum.female,
            description: 'wazzza',
        },
        start: '2017-01-01',
        end: '2017-02-01',
        company: {
            taskId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            projectId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            assigned: true,
            company: {
                id: '123',
                displayName: 'Foo company',
            },
            assignee: {
                id: '123',
                displayName: 'Foo user',
            },
            status: TaskStatusEnum.DRAFT,
            phoneNumbers: [{
                label: 'MOBILE',
                value: '0',
            }],
        },
        craft: 'Sleeping',
        status: TaskStatusEnum.OPEN,
        news: true,
    },
    {
        id: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
        project: {
            id: 'eeb28b69-4e17-8d22-952b-f92a025a8921',
            displayName: 'Foo',
        },
        name: 'X',
        location: 'Y',
        user: {
            displayName: 'Tiago',
            gender: GenderEnum.male,
        },
        start: '2017-01-01',
        end: '2017-02-01',
        company: {
            taskId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            projectId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            assigned: true,
            company: {
                id: '123',
                displayName: 'Foo company',
            },
            assignee: {
                id: '123',
                displayName: 'Foo user',
            },
            status: TaskStatusEnum.DRAFT,
            phoneNumbers: [
                {
                    phoneNumberType: 'FAX',
                    countryCode: '+44',
                    phoneNumber: '123456789',
                },
                {
                    phoneNumberType: 'MOBILE',
                    countryCode: '+351',
                    phoneNumber: '910414293',
                },
            ],
        },
        craft: 'Sleeping',
        status: TaskStatusEnum.DRAFT,
        news: false,
    },
    {
        id: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
        project: {
            id: 'eeb28b69-4e17-8d22-952b-f92a025a8921',
            displayName: 'Foo',
        },
        name: 'X',
        location: 'Y',
        user: {
            displayName: 'Tiago',
            gender: GenderEnum.male,
        },
        start: '2017-01-01',
        end: '2017-02-01',
        company: {
            taskId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            projectId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            assigned: true,
            company: {
                id: '123',
                displayName: 'Foo company',
            },
            assignee: {
                id: '123',
                displayName: 'Foo user',
            },
            status: TaskStatusEnum.DRAFT,
        },
        craft: 'Sleeping',
        status: TaskStatusEnum.CLOSED,
        news: false,
    },
    {
        id: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
        project: {
            id: 'eeb28b69-4e17-8d22-952b-f92a025a8921',
            displayName: 'Foo',
        },
        name: 'X',
        location: 'Y',
        user: {
            displayName: 'Tiago',
            gender: GenderEnum.male,
        },
        start: '2017-01-01',
        end: '2017-02-01',
        company: {
            taskId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            projectId: 'eeb28b69-4e17-8d22-952b-f92a025a892c',
            assigned: true,
            company: {
                id: '123',
                displayName: 'Foo company',
            },
            assignee: {
                id: '123',
                displayName: 'Foo user',
            },
            status: TaskStatusEnum.DRAFT,
        },
        craft: 'Sleeping',
        status: TaskStatusEnum.STARTED,
        news: false,
    },
];

export const MOCK_TASKS_RESOURCES: TaskResource[] = [MOCK_TASK_RESOURCE, MOCK_TASK_RESOURCE_NOT_ASSIGNED];

export const MOCK_TASKS_ENTITIES: TaskEntity[] = MOCK_TASKS_RESOURCES.map(task => TaskEntity.fromResource(task));

export const MOCK_TASKS: Task[] = [MOCK_TASK, MOCK_TASK_NOT_ASSIGNED];

export const MOCK_TASKS_SERVICE: TaskResource[] = [Object.assign({}, MOCK_TASK_SERVICE)];

export const MOCK_TASK_LIST: ProjectTaskListResource = {
    pageNumber: 1,
    pageSize: 10,
    totalPages: 5,
    totalElements: 100,
    tasks: MOCK_TASKS_RESOURCES,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
        send: {
            href: '2',
        },
        create: {
            href: '2',
        },
    },
};

export const MOCK_TASK_LIST_ONE_OF_ONE_PAGE: ProjectTaskListResource = {
    pageNumber: 0,
    pageSize: 100,
    totalPages: 1,
    totalElements: 80,
    tasks: MOCK_TASKS_RESOURCES,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
        send: {
            href: '2',
        },
        create: {
            href: '2',
        },
    },
};

export const MOCK_TASK_LIST_EMPTY: ProjectTaskListResource = {
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    tasks: [],
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
        send: {
            href: '2',
        },
        create: {
            href: '2',
        },
    },
};

export const MOCK_TASK_LIST_ONE_OF_TWO_PAGE: ProjectTaskListResource = {
    pageNumber: 0,
    pageSize: 100,
    totalPages: 2,
    totalElements: 150,
    tasks: MOCK_TASKS_RESOURCES,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
        send: {
            href: '2',
        },
        create: {
            href: '2',
        },
    },
};

export const MOCK_TASK_LIST_TWO_OF_TWO_PAGE: ProjectTaskListResource = {
    pageNumber: 1,
    pageSize: 100,
    totalPages: 2,
    totalElements: 150,
    tasks: MOCK_TASKS_RESOURCES,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
        send: {
            href: '2',
        },
        create: {
            href: '2',
        },
    },
};

export const MOCK_TASK_LIST_SERVICE: ProjectTaskListResource = {
    pageNumber: 1,
    pageSize: 10,
    totalPages: 5,
    totalElements: 100,
    tasks: MOCK_TASKS_SERVICE,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
    },
};

export const MOCK_TASK_SLICE: any = {
    task: MOCK_TASK_RESOURCE,
    issueListWithComments: [],
    attachmentList: new AttachmentListResource(),
};

export const MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_SINGULAR: any = {
    message: new AlertMessageResource('Task_Assign_SuccessMessageSingular', {taskNumber: 1}),
};

export const MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_PLURAL: any = {
    message: new AlertMessageResource('Task_Assign_SuccessMessagePlural', {taskNumber: 2}),
};

export const MOCK_CREATE_TASK_FULFILLED_ALERT_PAYLOAD: any = {
    message: new AlertMessageResource('Task_Create_SuccessMessage'),
};

export const MOCK_CREATE_OR_EDIT_TASK_PARTIALLY_FULFILLED_ALERT_PAYLOAD: any = {
    message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage'),
};

export const MOCK_EDIT_TASK_FULFILLED_ALERT_PAYLOAD: any = {
    message: new AlertMessageResource('Task_Update_SuccessMessage'),
};

export const MOCK_CREATE_TASK: SaveTaskResource = {
    projectId: '123',
    name: 'Mocked task',
    description: 'description',
    status: TaskStatusEnum.DRAFT,
    location: 'home',
    projectCraftId: '123',
    workAreaId: '123',
    start: '2017-01-01',
    end: '2017-02-01',
    assigneeId: '1234',
};

export const MOCK_CREATE_TASK_WITH_VERSIONS: SaveTaskResourceWithVersions = {
    taskData: MOCK_CREATE_TASK,
    taskScheduleVersion: 0,
    taskVersion: 1,
};

export const MOCK_CREATE_TASK_WITHOUT_SCHEDULE: SaveTaskResource = {
    projectId: '123',
    name: 'Mocked task',
    description: 'description',
    status: TaskStatusEnum.DRAFT,
    location: 'home',
    projectCraftId: '123',
    workAreaId: '123',
    assigneeId: '1234',
};

export const MOCK_CREATE_TASK_WITH_ATTACHMENTS: SaveTaskResource = {
    projectId: '123',
    name: 'Mocked task',
    description: 'description',
    status: TaskStatusEnum.DRAFT,
    location: 'home',
    projectCraftId: '123',
    workAreaId: '123',
    assigneeId: '1234',
    files: [new File([''], '')],
};

export const MOCK_UPDATE_TASK: SaveTaskResource = {
    projectId: '123',
    name: 'Mocked task',
    description: 'description',
    status: TaskStatusEnum.DRAFT,
    location: 'home',
    projectCraftId: '123',
    workAreaId: '123',
    start: '2017-01-01',
    end: '2017-02-01',
    assigneeId: '1234',
    files: [new File([''], '')],
};

export const MOCK_TASK_FILE: SaveTaskFileResource = {
    id: '123',
    files: [new File([''], '')],
};

export const MOCK_PUT_TASK_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: 'Task_Update_SuccessMessage',
    },
};

export const MOCK_TASK_WITH_FILE: any = {
    id: '1',
    requestStatus: RequestStatusEnum.success,
    permissions: {
        canAssignProjectTask: false,
        canSendProjectTask: false,
    },
    files: MOCK_TASK_FILE,
};

export const MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE_ASSIGNEE_WITH_WA: TaskResource = {
    id: 'foo',
    project: new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting ' +
        'Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things ' +
        'Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done Getting Things Done ' +
        'Getting Things Done Getting Things Done Getting Things Done Getting Things Done',
    assigned: false,
    status: TaskStatusEnum.OPEN,
    location: 'My Place',
    projectCraft: MOCK_PROJECT_CRAFT_A,
    creator: new ResourceReference('1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0', 'Dano Stump'),
    company: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    editDate: '2016-10-02T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    issue: false,
    version: 1,
    workArea: new ResourceReference(MOCK_WORKAREA_B.id, MOCK_WORKAREA_B.name),
    _links: {
        assign: {
            href: 'assign',
        },
        unassign: {
            href: 'unassign',
        },
        start: {
            href: 'start',
        },
        close: {
            href: 'close',
        },
        update: {
            href: 'update',
        },
    },
    _embedded: {
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
    },
};

export const MOCK_SAVE_COPY_TASK_RESOURCES: SaveCopyTaskResource[] = [
    {
        id: MOCK_TASK.id,
        shiftDays: 0,
        includeDayCards: true,
        parametersOverride: {
            workAreaId: null,
        },
    },
    {
        id: MOCK_TASK_2.id,
        shiftDays: 0,
        includeDayCards: true,
        parametersOverride: {
            workAreaId: null,
        },
    },
]

export const MOCK_TASK_ENTITY_WITHOUT_SCHEDULE_ASSIGNEE_WITH_WA =
    TaskEntity.fromResource(MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE_ASSIGNEE_WITH_WA);

export const MOCK_TASK_WITHOUT_SCHEDULE_ASSIGNEE_WITH_WA =
    Task.fromTaskEntity(MOCK_TASK_ENTITY_WITHOUT_SCHEDULE_ASSIGNEE_WITH_WA, undefined);
