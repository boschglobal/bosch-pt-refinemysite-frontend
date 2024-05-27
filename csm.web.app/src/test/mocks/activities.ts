/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActivityResource} from '../../app/project/project-common/api/activities/resources/activity.resource';
import {ActivityListResource} from '../../app/project/project-common/api/activities/resources/activity-list.resource';

export const MOCK_ACTIVITY_1: ActivityResource = {
    id: 'b0d5690e-0e53-4e13-8910-1d2938bedc191',
    user: {
        displayName: 'Hans Mustermann',
        picture: 'http://localhost:8080/v1/users/e59f3a93-8f56-41d2-a242-7f15cccc8a3d/picture/fb770463-fb21-45c6-aae3-966fa10a2ca6/SMALL',
        id: 'e59f3a93-8f56-41d2-a242-7f15cccc8a3d'
    },
    date: new Date('12/12/1999'),
    description: {
        template: '${user} hat die Aufgabe ${task} erstellt.',
        values: {
            task: {
                type: 'Task',
                id: '65139cc1-093d-4e9b-b8f6-758fa291588d',
                text: 'Install windows'
            },
            user: {
                type: 'User',
                id: '017da74c-42f0-4644-b5bc-a3fc5fcfc863',
                text: 'Ali Albatroz'
            }
        }
    },
    changes: [
        'Der Titel "install electrics" wurde festgelegt',
        'Der Ort "1.OG/WC" wurde festgelegt',
        'Der Start "25.10.2017" wurde festgelegt',
        'Das Ende "30.10.2017" wurde festgelegt',
        'Das Gewerk "Electrical installation" wurde festgelegt',
        'Der Status "ENTWURF" wurde festgelegt'
    ],
    _embedded: {
        attachments: {
            createdDate: '1999-12-12T00:00:00.000Z',
            lastModifiedDate: '1999-12-12T00:00:00.000Z',
            createdBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
                picture: ''
            },
            lastModifiedBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
            },
            fileName: '1-bbm-boxberg.jpg',
            fileSize: 145275,
            imageHeight: 899,
            imageWidth: 1600,
            topicId: '4dadd7ee-bd7a-5fc8-7901-14f9f5aaa8b6',
            messageId: '50ed14a5-83bb-c9c3-9654-bf403f84530f',
            taskId: 'aa5de87e-0e61-ab62-e952-6281dc037a62',
            _links: {
                self: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579',
                    templated: true
                },
                preview: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/preview',
                    templated: true
                },
                data: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/data',
                    templated: true
                },
                original: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/original',
                    templated: true
                }
            },
            id: 'f723c4c3-29f7-419a-0ab3-818d378db579'
        }
    }
};

export const MOCK_ACTIVITY_2: ActivityResource = {
    id: 'b0d5690e-0e53-4e13-8910-1d2938bedc192',
    user: {
        displayName: 'Hans Mustermann',
        picture: 'http://localhost:8080/v1/users/e59f3a93-8f56-41d2-a242-7f15cccc8a3d/picture/fb770463-fb21-45c6-aae3-966fa10a2ca6/SMALL',
        id: 'e59f3a93-8f56-41d2-a242-7f15cccc8a3d'
    },
    date: new Date('12/12/1999'),
    description: {
        template: '${user} hat die Aufgabe ${task} erstellt.',
        values: {
            task: {
                type: 'Task',
                id: '65139cc1-093d-4e9b-b8f6-758fa291588d',
                text: 'Install windows'
            },
            user: {
                type: 'User',
                id: '017da74c-42f0-4644-b5bc-a3fc5fcfc863',
                text: 'Ali Albatroz'
            }
        }
    },
    changes: [
        'Der Titel "install electrics" wurde festgelegt',
        'Der Ort "1.OG/WC" wurde festgelegt',
        'Der Start "25.10.2017" wurde festgelegt',
        'Das Ende "30.10.2017" wurde festgelegt',
        'Das Gewerk "Electrical installation" wurde festgelegt',
        'Der Status "ENTWURF" wurde festgelegt'
    ],
    _embedded: {
        attachments: {
            createdDate: '1999-12-12T00:00:00.000Z',
            lastModifiedDate: '1999-12-12T00:00:00.000Z',
            createdBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
                picture: ''
            },
            lastModifiedBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
            },
            fileName: '1-bbm-boxberg.jpg',
            fileSize: 145275,
            imageHeight: 899,
            imageWidth: 1600,
            topicId: '4dadd7ee-bd7a-5fc8-7901-14f9f5aaa8b6',
            messageId: '50ed14a5-83bb-c9c3-9654-bf403f84530f',
            taskId: 'aa5de87e-0e61-ab62-e952-6281dc037a62',
            _links: {
                self: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579',
                    templated: true
                },
                preview: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/preview',
                    templated: true
                },
                data: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/data',
                    templated: true
                },
                original: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/original',
                    templated: true
                }
            },
            id: 'f723c4c3-29f7-419a-0ab3-818d378db579'
        }
    }
};

export const MOCK_ACTIVITY_3: ActivityResource = {
    id: 'b0d5690e-0e53-4e13-8910-1d2938bedc191',
    user: {
        displayName: 'Hans Mustermann',
        picture: 'http://localhost:8080/v1/users/e59f3a93-8f56-41d2-a242-7f15cccc8a3d/picture/fb770463-fb21-45c6-aae3-966fa10a2ca6/SMALL',
        id: 'e59f3a93-8f56-41d2-a242-7f15cccc8a3d'
    },
    date: new Date('12/12/1999'),
    description: {
        template: '${user} hat die Aufgabe ${task} erstellt.',
        values: {
            task: {
                type: 'Task',
                id: '65139cc1-093d-4e9b-b8f6-758fa291588d',
                text: 'Install windows'
            },
            user: {
                type: 'User',
                id: '017da74c-42f0-4644-b5bc-a3fc5fcfc863',
                text: 'Ali Albatroz'
            }
        }
    },
    changes: [
        'Der Titel "install electrics" wurde festgelegt',
        'Der Ort "1.OG/WC" wurde festgelegt',
        'Der Start "25.10.2017" wurde festgelegt',
        'Das Ende "30.10.2017" wurde festgelegt',
        'Das Gewerk "Electrical installation" wurde festgelegt',
        'Der Status "ENTWURF" wurde festgelegt'
    ],
    _embedded: {
        attachments: {
            createdDate: '1999-12-12T00:00:00.000Z',
            lastModifiedDate: '1999-12-12T00:00:00.000Z',
            createdBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
                picture: ''
            },
            lastModifiedBy: {
                displayName: 'Walter Root',
                id: '298d4eaa-bc30-4320-89d7-dedcd0a01aa3',
            },
            fileName: '1-bbm-boxberg.jpg',
            fileSize: 145275,
            imageHeight: 899,
            imageWidth: 1600,
            topicId: '4dadd7ee-bd7a-5fc8-7901-14f9f5aaa8b6',
            messageId: '50ed14a5-83bb-c9c3-9654-bf403f84530f',
            taskId: 'aa5de87e-0e61-ab62-e952-6281dc037a62',
            _links: {
                self: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579',
                    templated: true
                },
                preview: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/preview',
                    templated: true
                },
                data: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/data',
                    templated: true
                },
                original: {
                    href: 'http://localhost:8090/v1/tasks/{id}/attachments/f723c4c3-29f7-419a-0ab3-818d378db579/original',
                    templated: true
                }
            },
            id: 'f723c4c3-29f7-419a-0ab3-818d378db579'
        }
    }
};

export const MOCK_ACTIVITY_LIST: ActivityListResource = {
    activities: [
        MOCK_ACTIVITY_1,
        MOCK_ACTIVITY_2
    ],
    _links: {
        self: {
            href: 'http://localhost:8080/v1/topics/591fffce-d4ba-4cd9-a150-ae71e23715df/attachments',
            templated: true
        },
        prev: {
            href: 'http://localhost:8080/v1/tasks/e0ff566b-31fe-4222-a627-017260fa5c30/topics?before=fd514020-7e7c-43cf-b755-24bb54a2c9c3&limit=50'
        }
    }
};
