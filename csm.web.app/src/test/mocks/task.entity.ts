/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {TaskEntity} from '../../app/project/project-common/entities/task/task.entity';
import {DayCardStatusEnum} from '../../app/project/project-common/enums/day-card-status.enum';
import {TaskEntityPermissionEnum} from '../../app/project/project-common/enums/task-entity-permission.enum';
import {TaskStatusEnum} from '../../app/project/project-common/enums/task-status.enum';

export const TASK_ENTITY_1: TaskEntity = {
    id: 'foo',
    version: 1,
    createdBy: {
        id: '1',
        displayName: 'Bob Baumeister',
    },
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedBy: {
        id: '1',
        displayName: 'Bob Baumeister',
    },
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    project: {
        id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        displayName: 'My Super Project',
    },
    name: 'Getting Things Done',
    description: 'Getting Things Done Getting Things Done',
    creator: {
        id: '1c8b4e83-887b-61aa-2b1e-1d5fb5f12af0',
        displayName: 'Dano Stump',
    },
    company: {
        id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a49e',
        displayName: 'Jons Company',
    },
    location: 'My Place',
    projectCraft: {
        id: '1234',
        createdBy: {
            id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
            displayName: 'John Pianos',
            picture: '',
        },
        createdDate: '1989-01-20T00:00:00.000Z',
        lastModifiedBy: {
            id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
            displayName: 'John Pianos',
        },
        lastModifiedDate: '1989-01-20T00:00:00.000Z',
        version: 0,
        name: 'Craft A',
        color: '#f5a100',
        position: 1,
        project: {
            displayName: 'something',
            id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
        },
        _links: {
            self: {
                href: '',
            },
            project: {
                href: 'http://localhost:8080/v1/projects/#Theprojectid',
            },
            update: {
                href: 'http://localhost:8080/v1/projects/#Theprojectid',
            },
            delete: {
                href: 'http://localhost:8080/v1/projects/#Theprojectid',
            },
        },
    },
    assignee: {
        id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
        displayName: 'John Pianos',
        picture: '',
    },
    status: TaskStatusEnum.OPEN,
    issue: false,
    assigned: true,
    editDate: '2016-10-02T00:00:00.000Z',
    permissions: [
        TaskEntityPermissionEnum.Assign,
        TaskEntityPermissionEnum.Unassign,
        TaskEntityPermissionEnum.Delete,
        TaskEntityPermissionEnum.Start,
        TaskEntityPermissionEnum.Close,
        TaskEntityPermissionEnum.Update,
    ],
    _embedded: {
        attachments: {
            attachments: [
                {
                    createdBy: {
                        displayName: 'Hans Mustermann',
                        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
                        picture: 'http://localhost:8080/default-profile-picture-male.png',
                    },
                    captureDate: ' 2023-07-20T16:42:44.483Z',
                    createdDate: '2023-07-20T16:42:44.483Z',
                    lastModifiedBy: {
                        displayName: 'Hans Mustermann',
                        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
                    },
                    lastModifiedDate: '2023-07-20T16:42:44.483Z',
                    fileName: '7ba30b24-65fd-4aa0-a265-9d4bd5fe3d96',
                    fileSize: 1608240105,
                    imageHeight: 800,
                    imageWidth: 800,
                    messageId: '590dffce-d4ba-4cd9-a150-ae71e23715de',
                    topicId: '591fffce-d4ba-4cd9-a150-ae71e23715df',
                    taskId: 'c88fa385-3599-410b-a9f0-1756a643f586',
                    _links: {
                        self: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d',
                        },
                        preview: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/preview',
                        },
                        data: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/data',
                        },
                        original: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/original',
                        },
                    },
                    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d0',
                },
            ],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
        schedule: {
            id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f05',
            start: new Date('2018-12-10'),
            end: new Date(2018 - 12 - 16),
            createdBy: {
                id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f04',
                displayName: 'Daniel Rodrigues',
            },
            createdDate: '2023-07-20T16:42:44.485Z',
            lastModifiedBy: {
                id: 'e7cc1490-c72e-0ebe-d429-bc34638e8f04',
                displayName: 'Daniel Rodrigues',
            },
            lastModifiedDate: '2023-07-20T16:42:44.485Z',
            task: {
                id: 'foo',
                displayName: 'Do something!',
            },
            slots: [
                {
                    dayCard: {
                        id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a492',
                        displayName: 'Day card A',
                    },
                    date: new Date('2018-01-20'),
                },
            ],
            version: 0,
            _links: {
                self: {
                    href: '',
                },
                add: {
                    href: '',
                },
                move: {
                    href: '',
                },
                delete: {
                    href: '',
                },
                update: {
                    href: '',
                },
            },
            _embedded: {
                dayCards: {
                    items: [
                        {
                            id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a492',
                            title: 'Day card A',
                            manpower: 1.5,
                            status: DayCardStatusEnum.Open,
                            task: {
                                id: 'foo',
                                displayName: 'Task name',
                            },
                            createdBy: {
                                id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
                                displayName: 'John Pianos',
                                picture: '',
                            },
                            createdDate: '1989-01-20T00:00:00.000Z',
                            lastModifiedBy: {
                                id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
                                displayName: 'John Pianos',
                            },
                            lastModifiedDate: '1989-01-20T00:00:00.000Z',
                            version: 0,
                            _links: {
                                self: {
                                    href: '',
                                },
                                update: {
                                    href: '',
                                },
                                delete: {
                                    href: '',
                                },
                            },
                        },
                    ],
                },
            },
        },
        statistics: {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
        constraints: {
            items: [
                {
                    key: 'EQUIPMENT',
                    name: 'EQUIPMENT',
                },
                {
                    key: 'INFORMATION',
                    name: 'INFORMATION',
                },
                {
                    key: 'RESOURCES',
                    name: 'RESOURCES',
                },
            ],
            version: 1,
            taskId: 'foo',
            _links: {
                self: {
                    href: 'link',
                },
                update: {
                    href: 'link',
                },
            },
        },
    },
};
