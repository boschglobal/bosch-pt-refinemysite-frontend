/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ProjectResource} from '../../app/project/project-common/api/projects/resources/project.resource';
import {SaveProjectResource} from '../../app/project/project-common/api/projects/resources/save-project.resource';
import {ProjectCategoryEnum} from '../../app/project/project-common/enums/project-category.enum';
import {ProjectCaptureModel} from '../../app/project/project-common/presentationals/project-capture/project-capture.model';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';

export const MOCK_PROJECT_1: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    participants: 0,
    category: ProjectCategoryEnum.NB,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 4,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca3',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca3',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca3/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
        workAreas: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/workAreas',
        },
        updateRfv: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/editProjectSettings',
        },
        updateConstraints: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/editProjectSettings',
        },
        updateWorkdays: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/updateWorkdays',
        },
        import: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/import',
        },
        export: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/import',
        },
    },
};

export const MOCK_PROJECT_2: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca1',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    participants: 1,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 1,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
    },
};

export const MOCK_PROJECT_3: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca1',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    participants: 0,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        projectPicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'A', ''),
            createdDate: '2017-06-01T07:13:19Z',
            lastModifiedBy: new ResourceReference('1', 'A'),
            lastModifiedDate: '2017-06-01T07:13:19Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            projectReference: {
                id: '',
                displayName: '',
            },
            _links: {
                small: {
                    href: 'https://test.com',
                },
                self: {
                    href: '',
                },
                full: {
                    href: '',
                },
            },
        },
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 4,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
    },
};

export const MOCK_PROJECT_INCOMPLETE: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca1',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    projectNumber: '123456789',
    participants: 0,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 4,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
    },
};

export const MOCK_PROJECT_PICTURE: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca1',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    participants: 0,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        projectPicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'A', ''),
            createdDate: '2017-06-01T07:13:19Z',
            lastModifiedBy: new ResourceReference('1', 'A'),
            lastModifiedDate: '2017-06-01T07:13:19Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            projectReference: {
                id: '',
                displayName: '',
            },
            _links: {
                delete: {
                    href: '',
                },
                small: {
                    href: 'https://test.com',
                },
                self: {
                    href: '',
                },
                full: {
                    href: '',
                },
            },
        },
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 4,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
    },
};

export const MOCK_PROJECT_PICTURE_1: ProjectResource = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca1',
    title: 'Öhlmühle',
    start: new Date('2017-06-01T07:13:19Z'),
    end: new Date('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    company: new ResourceReference('0fcf74ae-4d3f-4bdc-99a3-78f1229573d5', 'Company A'),
    constructionSiteManager: {displayName: 'Hans Mustermann', position: 'construction site manager', phoneNumbers: []},
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    participants: 0,
    createdDate: '2017-06-01T07:13:19Z',
    lastModifiedDate: '2017-06-01T07:13:19Z',
    createdBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
        picture: '',
    },
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: 'a75b0bcb-2fec-4c90-9da1-e454b53ae6ba',
    },
    version: 0,
    _embedded: {
        projectPicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'A', ''),
            createdDate: '2017-06-01T07:13:19Z',
            lastModifiedBy: new ResourceReference('1', 'A'),
            lastModifiedDate: '2017-06-01T07:13:19Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            projectReference: {
                id: '',
                displayName: '',
            },
            _links: {
                small: {
                    href: 'https://test.com',
                },
                self: {
                    href: '',
                },
                full: {
                    href: '',
                },
            },
        },
        statistics: {
            openTasks: 1,
            startedTasks: 2,
            closedTasks: 3,
            acceptedTasks: 4,
            draftTasks: 5,
            criticalTopics: 4,
            uncriticalTopics: 5,
        },
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        tasks: {
            href: 'http://localhost:8080/v1/tasks/search',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1',
        },
        participants: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/participants',
        },
        projectCrafts: {
            href: 'http://localhost:8080/v1/projects/c575e002-5305-4d7a-bc16-2aa88a991ca1/crafts',
        },
    },
};

export const MOCK_PROJECT_LIST: ProjectResource[] = [MOCK_PROJECT_1, MOCK_PROJECT_2];

export const MOCK_SAVE_PROJECT: SaveProjectResource = {
    title: 'Öhlmühle',
    start: moment('2017-06-01T07:13:19Z'),
    end: moment('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    category: ProjectCategoryEnum.NB,
};

export const MOCK_POST_PROJECT_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: 'Project_Create_SuccessMessage',
    },
};

export const MOCK_PUT_PROJECT_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: 'Project_Update_SuccessMessage',
    },
};

export const MOCK_PROJECT_CAPTURE_MODEL: ProjectCaptureModel = {
    id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    title: 'Öhlmühle',
    start: moment('2017-06-01T07:13:19Z'),
    end: moment('2017-06-01T07:13:19Z'),
    address: {
        street: 'Friedrichstr',
        houseNumber: '3',
        zipCode: '70745',
        city: 'Winnenden',
    },
    client: 'Krämer Projektbau GmbH',
    description: 'Neubau von drei Wohnhäusern',
    projectNumber: '123456789',
    category: ProjectCategoryEnum.NB,
};
