/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ProjectWorkareaModel} from '../../app/project/project-children/project-workareas/models/project-workarea.model';
import {SaveWorkareaResource} from '../../app/project/project-common/api/workareas/resources/save-workarea.resource';
import {SaveWorkareaListResource} from '../../app/project/project-common/api/workareas/resources/save-workarea-list.resource';
import {WorkareaResource} from '../../app/project/project-common/api/workareas/resources/workarea.resource';
import {WorkareaListResource} from '../../app/project/project-common/api/workareas/resources/workarea-list.resource';

export const MOCK_WORKAREA_A: WorkareaResource = {
    id: '123',
    name: 'Foo',
    position: 1,
    version: 1,
    project: {
        id: '456',
        displayName: 'Bar',
    },
    _links: {
        self: {
            href: '',
        },
        project: {
            href: '',
        },
        update: {
            href: '',
        },
        delete: {
            href: '',
        },
    },
};

export const MOCK_WORKAREA_B: WorkareaResource = {
    id: '789',
    name: 'Xaa',
    position: 2,
    version: 2,
    project: {
        id: '456',
        displayName: 'Bar',
    },
    _links: {
        self: {
            href: '',
        },
        project: {
            href: '',
        },
        update: {
            href: '',
        },
    },
};

export const MOCK_WORKAREA_C: WorkareaResource = {
    id: '432',
    name: 'Zaa',
    position: 3,
    version: 2,
    project: {
        id: '456',
        displayName: 'Bar',
    },
    _links: {
        self: {
            href: '',
        },
        project: {
            href: '',
        },
        update: {
            href: '',
        },
    },
};

export const MOCK_WORKAREA_D: WorkareaResource = {
    id: 'bar',
    name: 'Bar',
    position: 3,
    version: 2,
    project: {
        id: '456',
        displayName: 'Bar',
    },
    _links: {
        self: {
            href: '',
        },
        project: {
            href: '',
        },
        update: {
            href: '',
        },
    },
};
export const MOCK_WORKAREA_NO_UPDATE: WorkareaResource = {
    id: 'no_update',
    name: 'no_update',
    position: 4,
    version: 2,
    project: {
        id: 'no_update',
        displayName: 'no_update',
    },
    _links: {
        self: {
            href: '',
        },
        project: {
            href: '',
        },
    },
};

export const MOCK_WORKAREAS: WorkareaResource[] = [MOCK_WORKAREA_A, MOCK_WORKAREA_B];

export const MOCK_WORKAREAS_LIST: WorkareaListResource = {
    workAreas: [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
    ],
    version: 0,
    _links: {
        self: {
            href: 'url',
        },
    },
};

export const MOCK_WORKAREA_MODEL_A: ProjectWorkareaModel = {
    id: '1',
    name: 'one',
    position: 1,
    version: 0,
    drag: true,
    dropdownItems: [],
};

export const MOCK_WORKAREA_MODEL_B: ProjectWorkareaModel = {
    id: '2',
    name: 'two',
    position: 2,
    version: 1,
    drag: true,
    dropdownItems: [],
};

export const MOCK_WORKAREA_MODEL_NOT_DRAGGABLE: ProjectWorkareaModel = {
    id: '3',
    name: 'three',
    position: 2,
    version: 1,
    drag: false,
    dropdownItems: [],
};

export const MOCK_WORKAREAS_MODEL: ProjectWorkareaModel[] = [MOCK_WORKAREA_MODEL_A, MOCK_WORKAREA_MODEL_B];

export const MOCK_SAVE_WORKAREA: SaveWorkareaResource = {
    projectId: '456',
    name: 'Foo',
    position: 2,
    version: 1,
};

export const MOCK_SAVE_WORKAREA_C_TO_A: SaveWorkareaResource = {
    projectId: '456',
    name: MOCK_WORKAREA_C.name,
    position: 1,
    version: 1,
};

export const MOCK_SAVE_WORKAREA_LIST: SaveWorkareaListResource = {
    workAreaId: '123',
    position: 2,
};

export const MOCK_UPDATE_WORKAREA: any = {
    workareaId: '123',
    saveWorkarea: MOCK_SAVE_WORKAREA,
};

export const MOCK_UPDATE_WORKAREA_C_TO_A: any = {
    workareaId: MOCK_WORKAREA_C.id,
    saveWorkarea: MOCK_SAVE_WORKAREA_C_TO_A,
};
